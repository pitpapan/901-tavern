"""Targeted adopted combat installation; never migrates existing chats."""
import json, shutil, subprocess, sys, urllib.request
from pathlib import Path
import lab

R = Path(__file__).resolve().parents[7]
S = lab.L / 'common-formal-install-20261106'
FULL = lab.L / 'common-full-live-20261106'
REL = Path('public/901-opening-combat/work/rules_engine')
NAME = '901 正式战斗加载验收 20261106'
CASES = {'pack': ('02', NAME + ' - 背包取物'), 'disarm': ('05', NAME + ' - 击落武器')}
MODULES = [f'combat/{n}.mjs' for n in (
    'action-prices', 'catalog', 'engine', 'grapple', 'mechanics', 'movement-modes',
    'opening', 'presentation', 'runtime', 'transitions', 'action-receipt', 'common-actions')]
MODULES += ['equipment-state.mjs']
MODULES += [f'gm_runtime/{n}' for n in (
    'adjudication-gate.mjs', 'narrative.mjs', 'player-status-ui.mjs', 'replay-check.mjs',
    'replay-gate-script.example.js', 'rule-actions.mjs')]

def read(path):
    return json.loads(path.read_text(encoding='utf8'))

def rows(path):
    return [json.loads(line) for line in path.read_text(encoding='utf8').splitlines()]

def database(settings):
    value = settings['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
    return json.loads(value) if isinstance(value, str) else value

def prepare():
    assert not (S / 'plan.json').exists(), 'Already prepared'
    assert R.joinpath('AGENTS.md').exists(), str(R)
    S.mkdir(exist_ok=True)
    baseline = lab.snapshot()
    lab.put(S / 'protected-before.json', baseline)
    shutil.copy2(lab.F / 'settings.json', S / 'settings.before.json')
    assert database(read(S / 'settings.before.json'))['autoUpdateEnabled'] is False
    hashes = {}
    for name in MODULES:
        source = R / 'work/rules_engine' / name
        target = lab.APP / REL / name
        candidate = S / 'candidate' / name
        candidate.parent.mkdir(parents=True, exist_ok=True)
        text = source.read_text(encoding='utf8').replace('/901-rules-runtime/', '/901-opening-combat/').replace('/901-combat-runtime/', '/901-opening-combat/')
        candidate.write_text(text, encoding='utf8', newline='\n')
        verified = lab.L / 'equipment-20261106/app' / REL / name
        verified_text = verified.read_text(encoding='utf8').replace('/901-rules-runtime/', '/901-opening-combat/').replace('/901-combat-runtime/', '/901-opening-combat/')
        assert text == verified_text, 'Different from live-verified candidate: ' + name
        before = lab.sha(target) if target.exists() else None
        if target.exists():
            backup = S / 'backup' / name
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup)
        hashes[name] = {'before': before, 'source': lab.sha(source), 'installed': lab.sha(candidate)}
    shutil.copy2(lab.F / 'characters' / (lab.NAME + '.png'), S / 'card.png')
    seeds = {}
    for key, (sid, chat) in CASES.items():
        seed = rows(FULL / (sid + '-seed.jsonl'))
        old_chat = read(FULL / 'plan.json')['cases'][int(sid)-1]['name']
        seed = json.loads(json.dumps(seed, ensure_ascii=False).replace(old_chat, chat))
        seed[0]['character_name'] = NAME
        seed[0].setdefault('chat_metadata', {})['formal_combat_acceptance'] = {'testOnly': True, 'sourceSeed': sid}
        seed[1]['name'] = NAME
        assert len(seed) == 2
        root = seed[1]['variables'][0]['stat_data']['901_rules_poc']
        assert root['revision'] == 0
        p = S / (key + '-seed.jsonl')
        p.write_text('\n'.join(json.dumps(x, ensure_ascii=False) for x in seed) + '\n', encoding='utf8')
        seeds[key] = chat
    def transform(j):
        j['name'] = j['data']['name'] = NAME
        j['chat'] = CASES['pack'][1]
        j['first_mes'] = j['data']['first_mes'] = rows(S / 'pack-seed.jsonl')[1]['mes']
        j['data']['scenario'] = '非Canon的正式运行模块加载验收；试验陪练与物品仅用于隔离战斗，不属于正式剧情。'
    lab.card_transform(S / 'card.png', transform)
    lab.put(S / 'plan.json', {'name': NAME, 'chats': seeds, 'hashes': hashes})
    print(json.dumps({'prepared': True, 'modules': hashes, 'chats': seeds}, ensure_ascii=False))

def install():
    assert not (S / 'installed.json').exists()
    plan = read(S / 'plan.json')
    card = lab.F / 'characters' / (NAME + '.png')
    directory = lab.F / 'chats' / NAME
    assert not card.exists() and not directory.exists()
    raw = (lab.F / 'settings.json').read_bytes()
    current = json.loads(raw)
    assert database(current)['autoUpdateEnabled'] is False
    assert current['oai_settings'] == read(S / 'settings.before.json')['oai_settings']
    associations = current['world_info_settings']['world_info']['charLore']
    original = next(x for x in associations if x['name'] == lab.NAME)
    assert not any(x['name'] == NAME for x in associations)
    associations.append({'name': NAME, 'extraBooks': list(original['extraBooks'])})
    for name, h in plan['hashes'].items():
        target = lab.APP / REL / name
        assert (lab.sha(target) if target.exists() else None) == h['before'], name
        assert lab.sha(S / 'candidate' / name) == h['installed']
    assert (lab.F / 'settings.json').read_bytes() == raw, 'Concurrent settings change'
    for name in MODULES:
        target = lab.APP / REL / name
        shutil.copy2(S / 'candidate' / name, target)
        url = 'http://127.0.0.1:8000/' + (REL / name).as_posix().removeprefix('public/') + '?combat=20261106'
        with urllib.request.urlopen(url, timeout=20) as response:
            assert response.read() == target.read_bytes(), name
    directory.mkdir()
    for key, chat in plan['chats'].items():
        shutil.copy2(S / (key + '-seed.jsonl'), directory / (chat + '.jsonl'))
    shutil.copy2(S / 'card.png', card)
    assert (lab.F / 'settings.json').read_bytes() == raw, 'Concurrent settings change'
    lab.put(lab.F / 'settings.json', current)
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=R, text=True).strip()
    lab.put(S / 'installed.json', {**plan, 'commit': commit, 'httpReadbackMatches': True})
    print(json.dumps({'installed': True, 'commit': commit, 'modules': len(MODULES), 'chats': plan['chats']}, ensure_ascii=False))

if __name__ == '__main__':
    {'prepare': prepare, 'install': install}[sys.argv[1]]()
