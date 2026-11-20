"""Read-only audit of retained actual-model/UI evidence. No model transport."""
from pathlib import Path
import json, hashlib, jsonschema

E = Path(__file__).resolve().parent
I = E / 'iteration-200-20261115'
read = lambda p: json.loads(p.read_text(encoding='utf8'))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def rows(name):
    return [json.loads(x) for x in (I / name).read_text(encoding='utf8').splitlines()]

def state(name):
    return rows(name)[-1]['variables'][0]['stat_data']['901_rules_poc']

def projection(request):
    for m in request['messages']:
        marker = '【901逐角色知情投影】\n'
        if marker in m['content']:
            return json.JSONDecoder().raw_decode(m['content'].split(marker)[1])[0]
    raise AssertionError('Missing projection')

a = state('B1-after.chat.jsonl')
b = state('B2-alternate-after.chat.jsonl')
c = state('B3-fixed-confirmed-before-narration.chat.jsonl')
d = state('B-final.chat.jsonl')
ka, kb, kc, kd = [x['storyKnowledge'] for x in [a, b, c, d]]
assert len(ka['knowledge']) == 0 and len(ka['dialogueBatches']) == 1
batch_id, batch = next(iter(ka['dialogueBatches'].items()))
assert len(batch['rows']) == 1 and batch['rows'][0]['status'] == 'pending'
pending = batch['rows'][0]['id']
fact = pending + '.message'
assert kb['dialogueBatches'][batch_id] == batch
assert len(kb['knowledge']) == 3 and len(kb['dialogueBatches']) == 2
assert read(I / 'B.alt2.dependency.check.json')['required'] == []
assert read(I / 'B.scene3.dependency.check.json')['required'] == [pending]
assert read(I / 'B.fix3.dependency.request.json') == read(I / 'B.scene3.dependency.request.json')
assert sha(I / 'B.fix3.dependency.raw-response.txt') == sha(I / 'B.scene3.dependency.raw-response.txt')
confirmed = kc['dialogueBatches'][batch_id]['rows'][0]
assert confirmed['status'] == 'registered'
assert confirmed['decision']['received'] is True
assert confirmed['decision']['recipientIds'] == ['bright']
assert len(kc['knowledge']) == 4
assert {g['knowerId'] for g in kc['knowledge'].values() if g['propositionRef'] == fact} == {'bright'}
assert not any(g['knowerId'] == 'player' for g in kc['knowledge'].values())
assert len(kd['knowledge']) == 5 and len(kd['dialogueBatches']) == 3
assert {g['knowerId'] for g in kd['knowledge'].values() if g['propositionRef'] == fact} == {'bright', 'player'}
assert all(g['belief'] == 'uncertain' for g in kd['knowledge'].values())
assert kd['facts'][fact]['certainty'] == 'uncertain' and kd['facts'][fact]['visibility'] == 'private'
assert kd['dialogueBatches'][batch_id] == kc['dialogueBatches'][batch_id]
assert all(r['status'] == 'registered' for v in kd['dialogueBatches'].values() for r in v['rows'])
assert a['actors'] == b['actors'] == c['actors'] == d['actors']
chat = rows('B-final.chat.jsonl')[1:]
question = read(I / 'scenarios.json')['B3']
assert sum(x.get('is_user') and x.get('mes') == question for x in chat) == 1
for batch in kd['dialogueBatches'].values():
    anchor = batch['sourceAnchor']
    assert chat[anchor['messageId']]['mes'] == anchor['text']
for id in ['B.scene1.narration', 'B.alt2.narration', 'B.fix3.narration']:
    content = (I / (id + '.content.txt')).read_text(encoding='utf8').strip()
    # Existing ordinary controller appends only its status-renderer placeholder.
    saved_body = content + '\n\n<StatusPlaceHolderImpl/>'
    assert sum(not x.get('is_user') and x.get('mes', '').strip() == saved_body for x in chat) == 1
p = projection(read(I / 'B.fix3.narration.request.json'))
actors = {x['actorId']: x for x in p['actorKnowledge']}
confirmed_sources = [s for f in actors['bright']['facts'] for s in f['sources'] if 'receptionConfirmation' in s]
assert len(confirmed_sources) == 1
assert confirmed_sources[0]['receptionConfirmation'] == {'rowId': pending, **confirmed['decision']}
assert not actors['player']['facts']
old = read(I / 'B.scene3.narration.request.json')
new = read(I / 'B.fix3.narration.request.json')
assert {k:v for k,v in old.items() if k != 'messages'} == {k:v for k,v in new.items() if k != 'messages'}
assert len(old['messages']) == len(new['messages'])
assert [i for i,(x,y) in enumerate(zip(old['messages'],new['messages'])) if x != y] == [19]
for id in ['B.scene1.reception', 'B.alt2.reception', 'B.fix3.reception']:
    request = read(I / (id + '.request.json'))
    jsonschema.validate(read(I / (id + '.content.txt')), request['response_format']['json_schema']['schema'])
    assert read(I / (id + '.check.json'))['pass'] is True
for id in ['B.scene1.narration', 'B.scene1.reception', 'B.alt2.dependency', 'B.alt2.narration', 'B.alt2.reception', 'B.fix3.dependency', 'B.fix3.narration', 'B.fix3.reception']:
    assert read(I / (id + '.request.json')) == read(I / 'browser-captures' / (id + '.request.json'))
    assert read(I / 'browser-captures' / (id + '.delivered.json'))['rawReplay'] is True
ledger = read(I / 'run.json')
assert ledger['used'] == ledger['usedBefore'] + len(ledger['attempts']) == 23
assert ledger['remaining'] == 200 - 23 and ledger['cumulative'] == 357
attempts = [(E/'live-model-20261115', x) for x in read(E/'live-model-20261115/run.json')['attempts']] + [(I, x) for x in ledger['attempts']]
complete_outputs = []
for directory, attempt in attempts:
    id = attempt['id']
    assert sha(directory / (id + '.request.json')) == attempt['requestSha256']
    assert sha(directory / (id + '.raw-response.txt')) == attempt['rawResponseSha256']
    assert attempt['rawUnmodified'] is True
    complete_outputs += [f"custom{attempt['customRequest']} {id} [{attempt['manualVerdict']}]", attempt['assessment'], (directory/(id+'.content.txt')).read_text(encoding='utf8'), '']
(I / 'complete-outputs.txt').write_text('\n\n'.join(complete_outputs), encoding='utf8')
report = {
    'B': {'actualModelCalls': [344,345,351,352,353,354,356,357], 'pendingFromActualResponse': pending,
          'unrelatedRequired': [], 'unrelatedPreservedOriginalBatchExactly': True,
          'relatedRequired': [pending], 'uiConfirmation': confirmed['decision'],
          'samePlayerRequestCount': 1, 'confirmedBeforeNarration': True, 'sourceDecisionProjected': True,
          'grantsAtSteps': [0,3,4,5], 'finalPending': 0, 'originalMessageBelief': 'uncertain',
          'mechanicsUnchanged': True, 'sourceAnchorsMatchRetainedBodies': True,
          'bodyChange': 'Only existing controller suffix: two newlines + <StatusPlaceHolderImpl/>',
          'exactRequestAndRawReplay': True, 'classification': 'local NO_CHECK, not model acceptance'},
    'rawEvidence': {'attempts': 23, 'allOriginalRequestAndResponseHashesMatch': True,
                    'verdictCounts': {v: sum(x['manualVerdict']==v for _,x in attempts) for v in ['pass','fail','uncovered']}},
    'limitations': ['348/349 were manually withheld by acceptance harness, not detected by production semantic validation.',
                   '350 implicit listener citation still failed. Alternate B2 explicitly names conversational partners; it does not repair that failure.',
                   '355 non-disclosure is uncovered, not a mandatory-disclosure failure. Confirmation omission did exist in projection, but its causal role is unproven.',
                   'Controlled non-Canon scenes and local classification; no production deployment or general model reliability claim.']
}
(I / 'B-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
print(json.dumps({'B': 'passed', 'rawAttemptsVerified': len(attempts), 'grants': [0,3,4,5], 'pending': 0, 'verdicts': report['rawEvidence']['verdictCounts']}))
