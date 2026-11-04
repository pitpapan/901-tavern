"""Check three recorded real fill calls; fixtures themselves are not new Canon."""
import json
from pathlib import Path
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/n).read_text(encoding='utf8'))
cases={c:read(c+'.json') for c in ('delivery','proposal','accepted')}
for name,e in cases.items():
    assert e['messageCount']==5
    assert len(e['requests'])==1
    r=e['requests'][0]
    assert r['candidateRule'] and r['responded'] and not r['obsoleteForcedMain']
    assert r['autoUpdateEnabled'] is False
    assert r['model']=='[抗截断]gemini-3.8-flash'
    rows=[l for l in e['taskRows'] if l.startswith('|')][2:]
    if name in ('delivery','proposal'):
        assert not rows
        assert not any('INSERT INTO quests_events' in l for l in r['sqlLines'])
    else:
        assert len(rows)==1
        cells=[s.strip() for s in rows[0].split('|')[1:-1]]
        assert '铜钥匙' in cells[0] and not cells[1] and cells[2]=='掌柜'
        assert not any(cells[5:]) and '旧井' not in rows[0]
        assert '没找到' in cells[4] or '未' in cells[4]
    chronicles='\n'.join(v for k,v in e['exports'].items() if 'CustomExport-纪要-' in k)
    assert '| 未交代 |' in chronicles
    npc_sql='\n'.join(l for l in r['sqlLines'] if 'important_non_romance' in l)
    secret={'delivery':'灰砚八折','proposal':'遗失的钥匙','accepted':'旧井'}[name]
    assert secret not in npc_sql
    if secret in chronicles:
        assert any(s in chronicles for s in ('未告知','私下','未说','心中','内心','未告诉','没有告诉'))
baseline=read('../chronicle-write-read/first.json')
assert cases['delivery']['fixtures']['input']==baseline['messages'][3]['text']
assert cases['delivery']['fixtures']['reply']==baseline['messages'][4]['text']
print('PASS: delivery/proposal create no task; accepted pending task retained without invented classification or metadata; private thoughts not in NPC rows.')
