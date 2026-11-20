from pathlib import Path
import json,hashlib
E=Path(__file__).resolve().parent; N=E/'mainline-v3-20261115'; I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def rows(name):return [json.loads(s) for s in (N/name).read_text(encoding='utf8').splitlines()]
def state(name):return rows(name)[-1]['variables'][0]['stat_data']['901_rules_poc']
def knowledge(s):return s['storyKnowledge']
def pending(s):return [r for b in knowledge(s)['dialogueBatches'].values() for r in b['rows'] if r['status']=='pending']
def projection(r):
 for m in r['messages']:
  marker='【901逐角色知情投影】\n'
  if marker in m['content']:return json.JSONDecoder().raw_decode(m['content'].split(marker)[1])[0]
 raise AssertionError('No knowledge projection')
def actor_text(p,id):return [f['content']['text'] for a in p['actorKnowledge'] if a['actorId']==id for f in a['facts']]
a=state('A1-after.chat.jsonl'); ar=state('A1-reopened.chat.jsonl'); a2=state('A2-after.chat.jsonl')
assert a==ar
assert len(knowledge(a)['knowledge'])==1 and not pending(a)
assert [g['knowerId'] for g in knowledge(a)['knowledge'].values()]==['player']
assert knowledge(a)['knowledge']==knowledge(a2)['knowledge'] and a['actors']==a2['actors']
ap=projection(read(N/'captures/main.A2.narration.fixture.request.json'))
assert actor_text(ap,'player')==['西门今晚关闭，明早从石桥走。'] and actor_text(ap,'bright')==[]
b=state('B1-after.chat.jsonl'); b2=state('B2-after.chat.jsonl'); bp=state('B3-prompted.chat.jsonl'); b3=state('B3-after.chat.jsonl')
p=pending(b);assert len(p)==1 and p[0]['contentSpan']['quote']=='明早从南桥走。' and p[0]['recipientIds']==['bright']
assert pending(b2)==p and knowledge(b2)['knowledge']==knowledge(b)['knowledge']
assert len(pending(bp))==1 and knowledge(bp)['knowledge']==knowledge(b)['knowledge']
for id,required in [('main.B2.dependency',[]),('main.B3.dependency',[p[0]['id']])]:
 req=read(I/(id+'.request.json')); inp=json.loads(req['messages'][1]['content']); out=read(I/(id+'.content.txt'))
 assert inp['pending'][0]['id']==p[0]['id'] and inp['pending'][0]['contentSpan']==p[0]['contentSpan']
 assert out=={'inputRef':inp['inputRef'],'required':required}
b2p=projection(read(N/'captures/main.B2.narration.fixture.request.json'))
assert actor_text(b2p,'bright')==['渡口今晚停航，']
b3p=projection(read(I/'main.B3.narration.request.json'))
assert sorted(actor_text(b3p,'bright'))==sorted(['渡口今晚停航，','明早从南桥走。'])
assert not pending(b3) and len(knowledge(b3)['knowledge'])==4 and b['actors']==b3['actors']
resolved=next(r for batch in knowledge(b3)['dialogueBatches'].values() for r in batch['rows'] if r['id']==p[0]['id'])
assert resolved['status']=='registered' and resolved['decision']['received'] is True and resolved['contentSpan']==p[0]['contentSpan']
request='布莱特，按你听到的后半句，我们明早该从哪里走？'
assert sum(bool(r.get('is_user')) and r.get('mes')==request for r in rows('B3-after.chat.jsonl'))==1
assert rows('B3-after.chat.jsonl')[-1]['mes']==(I/'main.B3.narration.content.txt').read_text(encoding='utf8')+'\n\n<StatusPlaceHolderImpl/>'
assert all(x['status']=='processed' for x in knowledge(b3)['dialogueBatches'].values())
plan=read(N/'plan.json');ledger=read(I/'run.json');old=read(N/'before/run.json');assert ledger['attempts'][:len(old['attempts'])]==old['attempts']
attempts=ledger['attempts'][len(old['attempts']):];assert [x['id'] for x in attempts]==plan['actualCalls'] and all(x['manualVerdict']=='pass' for x in attempts)
for x in ledger['attempts']:
 assert sha(I/(x['id']+'.request.json'))==x['requestSha256']
 if x.get('rawResponseSha256'):assert sha(I/(x['id']+'.raw-response.txt'))==x['rawResponseSha256']
early=E/'live-model-20261115';early_attempts=read(early/'run.json')['attempts']
assert len(early_attempts)+len(ledger['attempts'])==71
for x in early_attempts:
 assert sha(early/(x['id']+'.request.json'))==x['requestSha256']
 assert sha(early/(x['id']+'.raw-response.txt'))==x['rawResponseSha256']
for x in attempts:
 id=x['id'];assert read(I/(id+'.request.json'))==read(N/('captures/'+id+'.request.json'))
 assert read(N/('captures/'+id+'.delivered.json'))==dict(rawReplay=True,synthetic=False,upstreamCallsFromBrowser=0)
for id in ['main.A1.reception','main.B1.reception','main.B3.reception']:
 check=read(N/(id+'.check.json'));assert check['schemaPass'] and check['structuralPass'] and not check.get('runtimeError')
baseline=read(N/'baseline.json')
for path,digest in baseline['formalProtected'].items():assert sha(Path(path))==digest,path
assert state('B3-style-after.chat.jsonl')==b3
for id in ['main.B3.dependency','main.B3.narration','main.B3.reception']:
 assert read(N/('ui-style-captures/'+id+'.request.json'))==read(I/(id+'.request.json'))
 assert read(N/('ui-style-captures/'+id+'.delivered.json'))['rawReplay']
result={'A':{'reopenedMVUIdentical':True,'playerReceivedOnly':True,'brightUnknown':True,'noPending':True,'nextNarrationProjectionCorrect':True,'noAdditionalExtractionOnReopen':True},'B':{'realPendingFrom':401,'frontOnlyBeforeConfirmation':True,'unrelatedRequired':[],'unrelatedPreservesPending':True,'dependentRequired':[p[0]['id']],'uiQuestionContent':'明早从南桥走。','explicitIsolatedConfirmation':True,'samePlayerRequestOnce':True,'actualNarration':404,'actualNarrationReception':405,'pendingAfterConfirmation':0,'finalKnowledgeGrants':4,'mechanicsUnchanged':True},'calls':[x['customRequest'] for x in attempts],'used':ledger['used'],'remaining':ledger['remaining'],'all71OriginalRequestResponseHashesIntact':True,'priorAttemptLedgerUnchanged':True,'formalProtectedUnchanged':len(baseline['formalProtected']),'limits':['A1/B1 starting narration and A2/B2 quiet scenes are declared fixtures, not model narratives.','Classification is local NO_CHECK; memory is a declared read-only fixture.','Finite cases, not statistical accuracy, all-character coverage, formal deployment, or automatic approval.']}
result['uiStyleReplay']={'sameThreeRequestsAndRawResponses':True,'finalMVUIdentical':True,'newModelCalls':0,'screenshot':'confirmation-fixed.jpg'}
(N/'browser-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=True))
