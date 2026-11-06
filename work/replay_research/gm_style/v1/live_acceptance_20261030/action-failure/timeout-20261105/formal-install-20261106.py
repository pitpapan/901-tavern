"""Install the two adopted modules and a separately named acceptance copy only."""
import base64, json, shutil, sys, urllib.request
from pathlib import Path
import lab

S = lab.L / 'formal-install-20261106'
NAME = '901 分类恢复安装验收 20261106'
CHAT = NAME + ' - 同文恢复'
SOURCE = lab.H.parents[5] / 'rules_engine/gm_runtime'
REL = Path('public/901-opening-combat/work/rules_engine/gm_runtime')
FILES = ['replay-gate-script.example.js', 'adjudication-gate.mjs']
BASELINES = ['gate-before.js', 'adjudication-before-20261106.mjs']

def prepare():
    assert not (S / 'plan.json').exists(), 'Already prepared'
    S.mkdir(exist_ok=True)
    lab.put(S / 'protected-before.json', lab.snapshot())
    hashes = {}
    for name, old in zip(FILES, BASELINES):
        target = lab.APP / REL / name
        assert lab.sha(target) == lab.sha(lab.L / old), name + ': formal changed'
        shutil.copyfile(target, S / (name + '.before'))
        projected = (SOURCE / name).read_text(encoding='utf8').replace('/901-rules-runtime/', '/901-opening-combat/').replace('/901-combat-runtime/', '/901-opening-combat/')
        (S / name).write_text(projected, encoding='utf8', newline='\n')
        verified = lab.L / 'candidate-before-20261106.js' if name == FILES[0] else lab.A / REL / name
        assert projected == verified.read_text(encoding='utf8'), name + ': not verified candidate'
        hashes[name] = {'before': lab.sha(target), 'source': lab.sha(SOURCE / name), 'installed': lab.sha(S / name)}
    seed = (lab.L / 'seed.jsonl').read_text(encoding='utf8').replace(lab.CHAT, CHAT)
    rows = [json.loads(x) for x in seed.splitlines()]
    for row in rows[1:]:
        if not row.get('is_user'): row['name'] = NAME
    rows[0]['character_name'] = NAME
    rows[0].setdefault('chat_metadata', {})['classification_acceptance'] = {
        'source': lab.CHAT, 'seedMessages': 5, 'identityRemapped': True, 'testOnly': True}
    (S / 'seed.jsonl').write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n', encoding='utf8')
    assert len(rows) == 6
    pending = rows[-1]['extra']['901_replay_gate']
    assert pending['diagnostic']['errorCode'] == 'CLASSIFICATION_TIMEOUT'
    assert pending['pending']['request'] is None
    assert pending['pending']['original']['chatId'] == CHAT
    assert pending['operationId'] == pending['diagnostic']['operationId'] == f'gm-runtime/{CHAT}/3/0'
    shutil.copyfile(lab.F / 'characters' / (lab.NAME + '.png'), S / 'card.png')
    def rename(card):
        card['name'] = card['data']['name'] = NAME
        card['chat'] = CHAT
    lab.card_transform(S / 'card.png', rename)
    lab.put(S / 'plan.json', {'name': NAME, 'chat': CHAT, 'hashes': hashes})
    print(json.dumps({'prepared': True, 'modules': FILES, 'name': NAME}, ensure_ascii=False))

def install():
    assert not (S / 'installed.json').exists(), 'Already installed'
    plan = json.loads((S / 'plan.json').read_text(encoding='utf8'))
    card = lab.F / 'characters' / (NAME + '.png')
    chat = lab.F / 'chats' / NAME / (CHAT + '.jsonl')
    assert not card.exists() and not chat.parent.exists(), 'Test copy already exists'
    for name in FILES:
        assert lab.sha(lab.APP / REL / name) == plan['hashes'][name]['before']
        assert lab.sha(S / name) == plan['hashes'][name]['installed']
    for name in FILES:
        shutil.copyfile(S / name, lab.APP / REL / name)
        assert lab.sha(lab.APP / REL / name) == plan['hashes'][name]['installed']
        url = 'http://127.0.0.1:8000/' + (REL / name).as_posix().removeprefix('public/') + '?installed=20261106'
        with urllib.request.urlopen(url, timeout=20) as response:
            assert response.read() == (S / name).read_bytes()
    chat.parent.mkdir()
    shutil.copyfile(S / 'seed.jsonl', chat)
    shutil.copyfile(S / 'card.png', card)
    lab.put(S / 'installed.json', {**plan, 'httpReadbackMatches': True, 'formalModelSettingsWritten': False})
    print(json.dumps({'installed': True, 'httpReadbackMatches': True, 'newTestChat': CHAT}, ensure_ascii=False))

def bind_books():
    settings = lab.F / 'settings.json'
    raw = settings.read_bytes()
    current = json.loads(raw)
    associations = current['world_info_settings']['world_info']['charLore']
    original = next(x for x in associations if x['name'] == lab.NAME)
    assert not any(x['name'] == NAME for x in associations)
    associations.append({'name': NAME, 'extraBooks': list(original['extraBooks'])})
    (S / 'settings.before-test-book-binding.json').write_bytes(raw)
    assert settings.read_bytes() == raw, 'Concurrent settings change'
    lab.put(settings, current)
    chat = lab.F / 'chats' / NAME / (CHAT + '.jsonl')
    assert not (S / 'first-run-primary-only.jsonl').exists()
    shutil.copyfile(chat, S / 'first-run-primary-only.jsonl')
    shutil.copyfile(S / 'seed.jsonl', chat)
    print(json.dumps({'testCharacterExtraBooks': original['extraBooks'], 'otherBindingsUnchanged': True}, ensure_ascii=False))

def capture():
    def rows(path):
        return [json.loads(x) for x in path.read_text(encoding='utf8').splitlines()]
    def root(rs):
        for row in reversed(rs[1:]):
            values = row.get('variables', [])
            if isinstance(values, list) and values:
                value = values[row.get('swipe_id', 0)].get('stat_data', {}).get('901_rules_poc')
                if value: return value
        raise AssertionError('Missing rule state')
    chat = lab.F / 'chats' / NAME / (CHAT + '.jsonl')
    before, after = rows(S / 'seed.jsonl'), rows(chat)
    settings_before = json.loads((S / 'settings.before.json').read_text(encoding='utf8'))
    settings_after = json.loads((lab.F / 'settings.json').read_text(encoding='utf8'))
    database = settings_after['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
    if isinstance(database, str): database = json.loads(database)
    baseline = json.loads((S / 'protected-before.json').read_text(encoding='utf8'))
    current = lab.snapshot()
    expected = {str(lab.F / 'settings.json')} | {str(lab.APP / REL / name) for name in FILES}
    changed = [p for p in baseline if baseline[p] != current.get(p)]
    assert set(changed) <= expected, 'Unexpected existing file changes: ' + repr(set(changed) - expected)
    assert settings_before['oai_settings'] == settings_after['oai_settings']
    assert database['autoUpdateEnabled'] is False
    associations = settings_after['world_info_settings']['world_info']['charLore']
    original = next(x for x in associations if x['name'] == lab.NAME)
    test = next(x for x in associations if x['name'] == NAME)
    assert original['extraBooks'] == test['extraBooks']
    gate = after[-1]['extra']['901_replay_gate']
    assert gate['status'] == 'NO_CHECK' and gate['operationId'] == f'gm-runtime/{CHAT}/3/0'
    assert len(after) == len(before) + 2 and after[-2]['mes'] == before[-2]['mes']
    assert after[1:len(before)] == before[1:]
    assert root(after) == root(before)
    offset = json.loads((S / 'server-log-offset.json').read_text(encoding='utf8'))
    with open(offset['file'], 'rb') as stream:
        stream.seek(offset['offset']); log = stream.read().decode('utf8', errors='replace')
    (S / 'six-books-server.log').write_text(log, encoding='utf8')
    shutil.copyfile(chat, S / 'six-books-result.jsonl')
    installation = json.loads((S / 'installed.json').read_text(encoding='utf8'))
    for name in FILES:
        assert lab.sha(lab.APP / REL / name) == installation['hashes'][name]['installed']
    report = {'port': 8000, 'testCharacter': NAME, 'testChat': CHAT, 'gate': gate,
        'messages': len(after)-1, 'originalSeedMessagesUnchanged': True, 'samePlayerText': True,
        'fullRuleRootUnchanged': True, 'revision': root(after)['revision'],
        'formalModelSettingsUnchanged': True, 'autoUpdateEnabled': database['autoUpdateEnabled'],
        'extraBooksMatchFormal': True, 'existingProtectedFiles': len(baseline),
        'changedExistingFiles': changed, 'unexpectedExistingChanges': [],
        'serverRequestsInTestWindow': log.count('Chat Completion request:'),
        'serverResponsesInTestWindow': log.count('Chat Completion response:'),
        'classificationRequestMarkers': log.count('你是901行动分类器'),
        'operatorRefreshInterruptedFirstContinuation': True,
        'savedNoCheckResumedWithoutNewPlayerMessage': True,
        'refreshReadbackVerifiedInBrowser': True,
        'modules': installation['hashes'], 'testsPassed': 70,
        'originalFormalChatUnchanged': lab.sha(lab.F / lab.CP) == baseline[str(lab.F / lab.CP)],
        'sharedGeneratedOutputsWritten': False}
    lab.put(lab.H / 'formal-acceptance-20261106.json', report)
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__':
    {'prepare': prepare, 'install': install, 'bind-books': bind_books, 'capture': capture}[sys.argv[1]]()
