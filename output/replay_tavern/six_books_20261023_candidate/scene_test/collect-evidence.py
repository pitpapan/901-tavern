import json
import sys
from pathlib import Path

out = Path(__file__).resolve().parent
if len(sys.argv) > 1:
    out = out / sys.argv[1]
install = json.loads((out / 'live-install.json').read_text(encoding='utf-8'))
source = Path('D:/github/sillyTavern/data/default-user/chats') / install['name']
results = []
for case in install['cases']:
    raw = (source / (case['chatId'] + '.jsonl')).read_bytes()
    (out / (case['id'] + '-final.jsonl')).write_bytes(raw)
    messages = [json.loads(line) for line in raw.decode('utf-8-sig').splitlines()][1:]
    roots = [(m.get('variables') or [{}])[0].get('stat_data', {}).get('901_rules_poc') for m in messages]
    root = next((r for r in reversed(roots) if r), {})
    gates = [m.get('extra', {}).get('901_replay_gate') for m in messages]
    gate = next((g for g in reversed(gates) if g), {})
    operations = []
    for operation in root.get('operations', {}).values():
        signature = json.loads(operation['signature'])
        check = signature.get('checkInput', {})
        summary = operation['summary']
        dice = check.get('dice', [])
        remaining = summary.get('dp', 0)
        used = []
        for die in dice:
            if remaining <= 0:
                break
            used.append(die)
            remaining += (1 if die == 10 else 0) - 1
        operations.append({'summary': summary, 'request': {k:v for k,v in check.items() if k != 'dice'}, 'consumedDice': used, 'auditedRolledSuccesses': sum(d >= 8 for d in used)})
    results.append({'id': case['id'], 'chatId': case['chatId'], 'messageCount': len(messages), 'gate': gate, 'revision': root.get('revision'), 'operationCount': len(operations), 'operations': operations, 'playerState': root.get('actors', {}).get('player', {}).get('state', {}), 'messages': [{'is_user': m.get('is_user'), 'mes':m.get('mes')} for m in messages]})
(out / 'live-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
for r in results:
    print(json.dumps({k:r[k] for k in ['id','messageCount','revision','operationCount','operations']} | {'gateStatus':r['gate'].get('status')}, ensure_ascii=False))
