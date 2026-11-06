"""One uninterrupted acceptance turn, preserving all previous chats."""
import json, shutil, sys
from pathlib import Path
import lab

NAME = '901 分类恢复安装验收 20261106'
OLD = NAME + ' - 同文恢复'
CHAT = NAME + ' - 连贯复验'
S = lab.L / 'continuous-20261106'
DEST = lab.F / 'chats' / NAME / (CHAT + '.jsonl')
read = lambda p: json.loads(p.read_text(encoding='utf8'))
rows = lambda p: [json.loads(x) for x in p.read_text(encoding='utf8').splitlines()]

def db(settings):
    value = settings['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
    return json.loads(value) if isinstance(value, str) else value

def root(rs):
    for row in reversed(rs[1:]):
        values = row.get('variables', [])
        if isinstance(values, list) and values:
            value = values[row.get('swipe_id', 0)].get('stat_data', {}).get('901_rules_poc')
            if value: return value
    raise AssertionError('Missing rule root')

def prepare():
    assert not (S / 'prepared.json').exists()
    S.mkdir(exist_ok=True)
    if not (S / 'protected-before.json').exists():
        lab.put(S / 'protected-before.json', lab.snapshot())
        shutil.copyfile(lab.F / 'settings.json', S / 'settings.before.json')
    settings = read(S / 'settings.before.json')
    assert db(settings)['autoUpdateEnabled'] is False
    assoc = settings['world_info_settings']['world_info']['charLore']
    assert next(x for x in assoc if x['name'] == NAME)['extraBooks'] == next(x for x in assoc if x['name'] == lab.NAME)['extraBooks']
    installed = read(lab.H / 'formal-acceptance-20261106.json')['modules']
    for name, hashes in installed.items():
        assert lab.sha(lab.APP / 'public/901-opening-combat/work/rules_engine/gm_runtime' / name) == hashes['installed']
    source = lab.L / 'formal-install-20261106/seed.jsonl'
    (S / 'seed.jsonl').write_text(source.read_text(encoding='utf8').replace(OLD, CHAT), encoding='utf8')
    rs = rows(S / 'seed.jsonl'); gate = rs[-1]['extra']['901_replay_gate']
    assert len(rs) == 6 and gate['pending']['request'] is None
    assert gate['diagnostic']['errorCode'] == 'CLASSIFICATION_TIMEOUT'
    assert gate['operationId'] == gate['diagnostic']['operationId'] == f'gm-runtime/{CHAT}/3/0'
    assert gate['pending']['original']['text'] == rs[-2]['mes']
    assert root(rs) == json.loads(json.dumps(root(rows(source)), ensure_ascii=False).replace(OLD, CHAT))
    if DEST.exists(): assert DEST.read_bytes() == (S / 'seed.jsonl').read_bytes()
    logfile = Path('C:/Users/pit/AppData/Local/Temp/901-play-copy-20261105/server.stdout.log')
    lab.put(S / 'server-log-offset.json', {'file': str(logfile), 'offset': logfile.stat().st_size})
    lab.put(S / 'prepared.json', {'chat': CHAT, 'seedSha256': lab.sha(S / 'seed.jsonl')})
    print(json.dumps({'prepared': CHAT, 'model': settings['oai_settings'].get('custom_model'), 'autoUpdateEnabled': False}, ensure_ascii=False))

def install():
    assert read(S / 'prepared.json')['seedSha256'] == lab.sha(S / 'seed.jsonl')
    assert not DEST.exists()
    shutil.copyfile(S / 'seed.jsonl', DEST)
    print('Created new acceptance chat only.')

def capture():
    before, after = rows(S / 'seed.jsonl'), rows(DEST)
    assert len(after) == 8 and after[-2]['mes'] == before[-2]['mes']
    gate = after[-1]['extra']['901_replay_gate']
    assert gate['status'] == 'NO_CHECK' and gate['operationId'] == f'gm-runtime/{CHAT}/3/0'
    assert before[1:] == after[1:len(before)] and root(before) == root(after)
    settings_before, settings_after = read(S / 'settings.before.json'), read(lab.F / 'settings.json')
    assert settings_before['oai_settings'] == settings_after['oai_settings']
    assert db(settings_after)['autoUpdateEnabled'] is False
    added_defaults = []
    def preserve_existing(a, b, path=''):
        if isinstance(a, dict) and isinstance(b, dict):
            for key in a:
                assert key in b
                preserve_existing(a[key], b[key], path + '.' + key)
            added_defaults.extend(path + '.' + key for key in b if key not in a)
        else: assert a == b, path
    preserve_existing(db(settings_before), db(settings_after))
    assert settings_before['world_info_settings'] == settings_after['world_info_settings']
    baseline, current = read(S / 'protected-before.json'), lab.snapshot()
    changed = [p for p in baseline if baseline[p] != current.get(p)]
    # The host updates the active test card's selected-chat pointer on opening.
    allowed = {str(lab.F / 'settings.json'), str(lab.F / 'characters' / (NAME + '.png'))}
    assert set(changed) <= allowed, repr(set(changed) - allowed)
    offset = read(S / 'server-log-offset.json')
    with open(offset['file'], 'rb') as stream:
        stream.seek(offset['offset']); log = stream.read().decode('utf8', errors='replace')
    (S / 'server.log').write_text(log, encoding='utf8')
    shutil.copyfile(DEST, S / 'result.jsonl')
    report = {'port': 8000, 'chat': CHAT, 'gate': gate, 'messages': len(after)-1,
        'originalFiveMessagesUnchanged': True, 'fullRuleRootUnchanged': True,
        'revision': root(after)['revision'], 'modelSettingsUnchanged': True,
        'autoUpdateEnabled': False, 'worldBindingsUnchanged': True,
        'existingDatabaseSettingsUnchanged': True, 'databaseDefaultFieldsAdded': added_defaults,
        'requests': log.count('Chat Completion request:'), 'responses': log.count('Chat Completion response:'),
        'classificationRequests': log.count('你是901行动分类器'),
        'changedExistingFiles': changed, 'unexpectedExistingChanges': [],
        'originalFormalChatUnchanged': lab.sha(lab.F / lab.CP) == baseline[str(lab.F / lab.CP)],
        'previousAcceptanceChatUnchanged': lab.sha(DEST.with_name(OLD + '.jsonl')) == baseline[str(DEST.with_name(OLD + '.jsonl'))],
        'operatorInterrupted': False,
        'refreshReadbackVerifiedInBrowser': (S / 'accepted.png').exists()}
    assert report['requests'] == report['responses'] == 2 and report['classificationRequests'] == 1
    lab.put(lab.H / 'continuous-acceptance-20261106.json', report)
    print(json.dumps(report, ensure_ascii=False))

if __name__ == '__main__':
    {'prepare': prepare, 'install': install, 'capture': capture}[sys.argv[1]]()
