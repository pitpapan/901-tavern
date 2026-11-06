"""Read-only formal checks; evidence is written only to the local workline."""
import importlib.util, json, shutil, sys
from pathlib import Path

spec = importlib.util.spec_from_file_location('installation', Path(__file__).with_name('common-formal-install-20261106.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def root(rows):
    return next(v['stat_data']['901_rules_poc'] for row in reversed(rows) for v in row.get('variables', []) if isinstance(v, dict) and '901_rules_poc' in v.get('stat_data', {}))

reports = {}
for key, chat in m.read(m.S / 'plan.json')['chats'].items():
    path = m.lab.F / 'chats' / m.NAME / (chat + '.jsonl')
    rows = m.rows(path)
    state = root(rows)
    report = {'chat': chat, 'messages': len(rows)-1, 'revision': state['revision'],
        'operations': state.get('operations', {}), 'lastText': rows[-1].get('mes'),
        'gate': rows[-1].get('extra', {}).get('901_replay_gate'),
        'actors': {k: {'health': a['state']['health'], 'possessions': a['state'].get('possessions'),
            'maneuvers': a['state'].get('combatManeuvers'), 'equippedWeaponId': a['state'].get('equippedWeaponId'),
            'position': state['battle']['actors'][k].get('position')} for k,a in state['actors'].items()}}
    reports[key] = report
    if len(sys.argv) > 1:
        shutil.copy2(path, m.S / (key + '-' + sys.argv[1] + '.jsonl'))
    print(json.dumps({'case': key, **{k:v for k,v in report.items() if k not in ['operations','actors','gate']},
        'operationIds': list(report['operations']), 'actors': report['actors']}, ensure_ascii=False))

before = m.read(m.S / 'protected-before.json')
now = m.lab.snapshot()
changed = [p for p in before if before[p] != now.get(p)]
expected = {str(m.lab.F / 'settings.json')} | {str(m.lab.APP / m.REL / n) for n in m.MODULES}
unexpected = sorted(set(changed) - expected)
settings = m.read(m.lab.F / 'settings.json')
baseline = m.read(m.S / 'settings.before.json')
protection = {'existingProtectedFiles': len(before), 'changedExistingFiles': changed,
    'unexpectedChanges': unexpected, 'modelConfigurationUnchanged': settings['oai_settings'] == baseline['oai_settings'],
    'autoUpdateEnabled': m.database(settings)['autoUpdateEnabled'],
    'globalBooksUnchanged': settings['world_info_settings']['world_info']['globalSelect'] == baseline['world_info_settings']['world_info']['globalSelect']}
assert not unexpected, unexpected
assert protection['modelConfigurationUnchanged'] and protection['autoUpdateEnabled'] is False and protection['globalBooksUnchanged']
for n,h in m.read(m.S / 'installed.json')['hashes'].items():
    assert m.lab.sha(m.lab.APP / m.REL / n) == h['installed'], n
if len(sys.argv) > 1:
    m.lab.put(m.S / (sys.argv[1] + '-evidence.json'), {'reports': reports, 'protection': protection})
print(json.dumps(protection, ensure_ascii=False))
