"""Check installed-rule behavior with legacy task instructions still present."""
from integrate import HERE,read,verify
for name in ('delivery','accepted'):
    e=read(HERE/(name+'.json'));assert e['messageCount']==5
    assert len(e['requests'])==1
    r=e['requests'][0]
    assert r['candidateRule'] and r['obsoleteForcedMain'] and r['responded']
    assert r['model']=='[抗截断]gemini-3.8-flash' and not r['autoUpdateEnabled']
    rows=[line for line in e['taskRows'] if line.startswith('|')][2:]
    if name=='delivery':assert not rows
    else:
        assert len(rows)==1
        c=[v.strip() for v in rows[0].split('|')[1:-1]]
        assert '铜钥匙' in c[0] and not c[1] and c[2]=='掌柜' and not any(c[5:])
        assert '旧井' not in '|'.join(c[:4])
        # Adopted boundary is epistemic ownership, not a ban on retaining thoughts.
        if '旧井' in c[4]:
            assert '私下怀疑' in c[4] and '未告知黄泉' in c[4]
        assert '未找到' in c[4] or '还没找到' in c[4]
    npc='\n'.join(v for v in r['sqlLines'] if 'important_non_romance' in v)
    assert ('灰砚八折' if name=='delivery' else '旧井') not in npc
    chron='\n'.join(v for k,v in e['exports'].items() if 'CustomExport-纪要-' in k)
    assert '| 未交代 |' in chron
verify()
print('PASS: installed SYSTEM overrides legacy forced mainline instruction in two real fill calls; meaningful accepted task retained.')
