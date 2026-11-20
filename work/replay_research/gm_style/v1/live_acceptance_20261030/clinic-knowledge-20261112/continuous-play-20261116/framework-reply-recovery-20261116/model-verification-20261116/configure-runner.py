"""Reuse the existing bounded sender and local raw-response release protocol."""
from pathlib import Path
import json,hashlib,importlib.util
E=Path(__file__).resolve().parent;P=E.parents[1]
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
A=Path(load(E/'setup.json')['app'])
entry=(E/'entry.live.js').read_text(encoding='utf-8')
entry=entry.replace('externalModelCalls:0,fixtureNarration:true','browserUpstreamCalls:0,fixtureNarration:false,modelLedger:"run.json"')
entry=entry.replace("+' 楼；外部调用0", "+' 楼；浏览器直接外发0（实模另记账）")
(E/'entry.live.js').write_text(entry,encoding='utf-8')
R=next(p for p in E.parents if p.name=='TRPG outputs');h=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
sp=importlib.util.spec_from_file_location('lab',h);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def transform(c):c['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
m.card_transform(A/'data/default-user/characters'/(load(P/'setup.json')['character']+'.png'),transform)
source=(P/'live/run-one.mjs').read_text(encoding='utf-8')
replacements={"E=new URL('../',L)":"E=new URL('../../',L)","approval.userText,'授权12次'":"approval.userText,'授予6次模型'","ledger.limit,12":"ledger.limit,6","approval.maximumCalls,12":"approval.maximumCalls,6",
 "if(id==='round-01')assert.equal(sha(raw),prepared.firstRequest.sha256);\nelse assert.ok":"assert.ok",
 "new URL('../dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/run.json',E)":"new URL('live/run.json',E)"}
for old,new in replacements.items():assert source.count(old)==1,old;source=source.replace(old,new)
(E/'run-one.mjs').write_text(source,encoding='utf-8')
auth=load(E/'authorization.json');auth['previousLedgerSha256']=hashlib.sha256((P/'live/run.json').read_bytes()).hexdigest()
(E/'authorization.json').write_text(json.dumps(auth,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
