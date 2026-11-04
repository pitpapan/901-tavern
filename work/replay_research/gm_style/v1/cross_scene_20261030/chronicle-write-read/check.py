"""Check persisted evidence for the two-turn boundary probe, not all memory semantics."""
import json
from pathlib import Path
H=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text(encoding='utf8'))
e=read(H/'final.json');first=read(H/'first.json')
assert len(e['messages'])==7 and len(e['runs'])==2
assert e['autoUpdateEnabled'] is False
assert len(first['chronicles'])==1 and first['chronicles']==e['chronicles']
chron=e['chronicles'][0]
assert chron.split('|')[2].strip()=='未交代'
assert all(x in chron for x in ('松桥九拍','便条','人数未详','来向未详','心中','未告知任何人'))
assert e['globalState'] and all(not x.strip() for row in e['globalState'] for x in row.split('|')[-4:-1])
assert any('NULL, NULL, NULL' in sql for f in e['fill'] for sql in f['timeSQL'])
assert len(e['fill'])==1 and all(e['fill'][0][k] for k in ('timeRule','nullRule','privateRule','crowdRule','newEventInInput','returnedInsert','answered'))
for r in e['runs']:
    assert r['installedStyle'] and r['revisions']==[0,0]
assert len({r['model'] for r in e['runs']})==1
r=e['runs'][1]
assert not r['firstInputPresent'] and not r['firstReplyPresent']
assert r['secretPresent'] and any('AM0001' in s and '松桥九拍' in s for s in r['memoryMatches'])
assert e['npcRows'] and all('灰砚八折' not in row for row in e['npcRows'])
assert all('灰砚八折' not in m['text'] for m in e['messages'] if not m['user'])
assert all(s in e['messages'][-1]['text'] for s in ('便条','松桥九拍','没数','没留意','没提过别的'))
print('PASS: new chronicle written, NULL time values, DB-only recall, uncertain count/origin, private thought attribution.')
print('LIMIT: task table inferred a main-line meeting task; not accepted as an established task.')
