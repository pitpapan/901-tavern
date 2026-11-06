"""Read-only inspection / private evidence snapshots of authorized live test chats."""
import json, sys, shutil
from pathlib import Path
import lab
L = lab.L / 'common-full-live-20261106'
p = json.loads((L / 'plan.json').read_text(encoding='utf8'))
for c in p['cases']:
    if len(sys.argv) > 1 and c['id'] not in sys.argv[1:]:
        continue
    f = Path(p['data']) / 'chats' / p['character'] / (c['name'] + '.jsonl')
    rows = [json.loads(x) for x in f.read_text(encoding='utf8').splitlines()]
    root = next(v['stat_data']['901_rules_poc'] for r in reversed(rows) for v in r.get('variables', []) if isinstance(v, dict) and '901_rules_poc' in v.get('stat_data', {}))
    ops = []
    for k, op in root.get('operations', {}).items():
        r = op['summary'].get('result', {})
        detail = {key: val for key, val in r.items() if key not in ['after', 'receipt', 'locationDisclosures', 'resourceTriggers', 'damageEvents']}
        ops.append({'id': k, 'signature': op.get('signature'), 'detail': detail, 'receipt': r.get('receipt')})
    states = {i: {'maneuvers': a['state'].get('combatManeuvers'), 'health': a['state'].get('health'), 'possessions': a['state'].get('possessions'), 'grapple': a['state'].get('grapple'), 'holds': a['state'].get('grappleHolds'), 'aim': root['battle']['actors'][i].get('aim'), 'ammunition': root['battle']['actors'][i].get('ammunition'), 'position': root['battle']['actors'][i].get('position')} for i, a in root['actors'].items()}
    report = {'case': c['id'], 'messages': len(rows)-1, 'revision': root['revision'], 'activeId': root['battle']['activeId'], 'ops': ops, 'states': states, 'pending': root['battle'].get('pending'), 'lastText': rows[-1].get('mes')}
    lab.put(L / (c['id']+'-latest-evidence.json'), report)
    shutil.copy2(f, L / (c['id']+'-latest.jsonl'))
    print(json.dumps(report, ensure_ascii=False))
