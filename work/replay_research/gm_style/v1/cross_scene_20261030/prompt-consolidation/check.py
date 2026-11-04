"""Verify recorded request loading and stored outcomes of the three real calls."""
from probe_consolidation import HERE,read,p
e={name:read(HERE/(name+'.json')) for name in ('delivery','facts','repeat')}
def section(case,title):
    body='\n'.join(v for k,v in e[case]['exports'].items() if 'ReadableDataTable' in k)
    s=body.partition('# '+title)[2].split('\n# ',1)[0]
    return [l for l in s.splitlines() if l.startswith('|')][2:]
for name,x in e.items():
    assert x['loadedSystemLines'] and all(x['loadedTableNotes'].values())
    assert not x['obsoleteTriggersPresent'] and len(x['requests'])==1
    r=x['requests'][0]
    assert r['responded'] and not r['autoUpdateEnabled'] and not r['obsoleteForcedMain']
    assert r['model']=='[抗截断]gemini-3.8-flash'
    sql='\n'.join(r['sqlLines'])
    assert 'INSERT INTO options ' not in sql and 'UPDATE options ' not in sql
    npc='\n'.join(l for l in r['sqlLines'] if 'important_non_romance' in l)
    assert not any(s in npc for s in ('灰砚八折','旧井'))
assert not section('delivery','任务与事件表')
chron='\n'.join(v for k,v in e['delivery']['exports'].items() if 'CustomExport-纪要-' in k)
assert all(s in chron for s in ('未交代','松桥九拍','人数未详','来向未详'))
pr=section('delivery','主角信息表')
assert pr and '灰砚八折' not in pr[0].split('|')[-2]
q=section('facts','任务与事件表');assert len(q)==1
cells=[v.strip() for v in q[0].split('|')[1:-1]]
assert '铜钥匙' in cells[0] and not cells[1] and cells[2]=='掌柜' and not any(cells[5:])
assert not section('facts','主角技能表')
inv=section('facts','背包物品表');assert len(inv)==1 and '治疗药水' in inv[0]
assert inv[0].split('|')[2].strip() in ('1','1瓶')
glob=section('facts','全局数据表');assert len(glob)==1 and '2026-02-04 09:00' in glob[0]
assert all(not v.strip() for v in glob[0].split('|')[-4:-2])
fact_chron='\n'.join(v for k,v in e['facts']['exports'].items() if 'CustomExport-纪要-' in k)
assert '两名镇民' in fact_chron and '西侧' in fact_chron
assert '人数未详' not in fact_chron and '来向未详' not in fact_chron
assert not e['repeat']['requests'][0]['sqlLines']
assert e['repeat']['exports']==e['facts']['exports']
assert e['delivery']['messageCount']==e['facts']['messageCount']==5 and e['repeat']['messageCount']==7
assert p.lab.snapshot()==read(HERE/'protected-before.json')
print('PASS: consolidated rules loaded; no invented task/menu/default possessions; accepted task, time and inventory facts retained; no skill grant; no-change call preserves all exported memory.')
print('All',len(p.lab.snapshot()),'formal files unchanged.')
