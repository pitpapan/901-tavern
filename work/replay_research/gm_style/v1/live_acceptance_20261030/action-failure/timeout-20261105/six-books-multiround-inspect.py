"""Capture only the authorized isolated multiround chat; never write Tavern data."""
import json, shutil, sys
from pathlib import Path
import lab

S = lab.L / 'six-books-multiround-20261106'
plan = json.loads((S / 'plan.json').read_text(encoding='utf8'))
path = Path(plan['target'])
rows = [json.loads(x) for x in path.read_text(encoding='utf8').splitlines()]
root = next(v['stat_data']['901_rules_poc'] for row in reversed(rows) for v in row.get('variables', []) if '901_rules_poc' in v.get('stat_data', {}))
ops = []
for oid, op in root['operations'].items():
    result = op['summary'].get('result', {})
    ops.append({'id': oid, 'result': {k:v for k,v in result.items() if k not in ['after', 'locationDisclosures']}})
report = {'messages': len(rows)-1, 'revision': root['revision'], 'round': root['battle']['round'],
    'activeId': root['battle']['activeId'], 'battleStatus': root['battle'].get('status'),
    'pending': root['battle'].get('pending'), 'operations': ops,
    'actors': {k: {'health': a['state']['health'], 'actions': a['state'].get('turn'),
        'maneuvers': a['state'].get('combatManeuvers'), 'possessions': a['state'].get('possessions'),
        'position': root['battle']['actors'][k]['position']} for k,a in root['actors'].items()},
    'lastText': rows[-1].get('mes')}
if len(sys.argv) > 1:
    shutil.copy2(path, S / (sys.argv[1] + '.jsonl'))
    lab.put(S / (sys.argv[1] + '.json'), report)
brief = {**report, 'operations': [{'id':o['id'], 'actor':o['result'].get('actorId'), 'ability':o['result'].get('abilityId'),
    'receipt':o['result'].get('receipt'), 'damage':o['result'].get('damage')} for o in ops]}
print(json.dumps(brief, ensure_ascii=False))
