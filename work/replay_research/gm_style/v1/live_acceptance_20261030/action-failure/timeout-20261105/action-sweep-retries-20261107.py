"""Fresh, isolated copies for observed regressions; never rewrite a completed case."""
import json
import lab

S = lab.L / 'action-sweep-20261107'
cases = json.loads((S / 'cases.json').read_text(encoding='utf8'))
for old, new, title in [
    ('49', '67', '持弓投影修复'),
    ('50', '68', '催眠结果投影修复'),
    ('52', '69', '触须结果投影修复'),
    ('51', '70', '双螯夹持投影修复'),
    ('47', '71', '已持刀状态投影修复'),
]:
    if any(c['id'] == new for c in cases):
        continue
    case = json.loads(json.dumps(next(c for c in cases if c['id'] == old)))
    case.update(id=new, title=title, name=f'901 集中 {new} {title} 20261107')
    rows = [json.loads(x) for x in (S / f'{old}-seed.jsonl').read_text(encoding='utf8').splitlines()]
    root = rows[1]['variables'][0]['stat_data']['901_rules_poc']
    root['chatId'] = case['name']
    data = '\n'.join(json.dumps(x, ensure_ascii=False) for x in rows) + '\n'
    (S / f'{new}-seed.jsonl').write_text(data, encoding='utf8')
    (S / 'app/data/default-user/chats/901 动作集中验收 20261107' / (case['name'] + '.jsonl')).write_text(data, encoding='utf8')
    cases.append(case)
lab.put(S / 'cases.json', cases)
print('Fresh projection regression chats are ready; prior results preserved.')
