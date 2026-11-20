"""Prepare at most six authorized real narration calls in the existing local lab."""
from pathlib import Path
import json,hashlib,shutil,importlib.util,datetime
E=Path(__file__).resolve().parent;F=E.parent;P=F.parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
A=Path(load(F/'browser-prepared.json')['app'])
assert not (E/'run.json').exists(),'Never reset an existing allowance'
old=load(P/'live/run.json');assert (old['cumulative'],old['used'],old['remaining'])==(540,6,6) and old['closed']
setup=load(P/'setup.json');card=A/'data/default-user/characters'/(setup['character']+'.png')
backend=A/'src/endpoints/backends/chat-completions.js'
protected={str(p):sha(p) for p in [P/'live/run.json',P/'live/authorization.json',F/'verification.json',F/'ASSESSMENT.md']}
protected.update({str(p):sha(p) for p in (F/'browser').glob('0*.json')})
put(E/'protected-before.json',protected)
shutil.copy2(card,E/'card.before.png');shutil.copy2(backend,E/'backend.before.js');shutil.copy2(A/'clinic-natural-config.json',E/'lab-config.before.json')
entry=(F/'entry.fixture.js').read_text(encoding='utf-8')
assert 'classificationTimeoutMs:60000' in entry
entry=entry.replace('全部分类与正文为本地夹具；外部调用0','分类为本地夹具；正文按新授权实模验证')
entry=entry.replace('分类与正文均为夹具；外部调用0','分类为本地夹具；正文由原授权模型返回')
entry=entry.replace('分类与正文均为本地夹具','分类本地夹具；正文仅消费获授权的原始响应')
(E/'entry.live.js').write_text(entry,encoding='utf-8')
R=next(p for p in E.parents if p.name=='TRPG outputs')
helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def transform(c):c['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(card,transform)
body=backend.read_text(encoding='utf-8')
anchor="if(kind==='narration')return reply('<dream_body>"
assert body.count(anchor)==1
body=body.replace(anchor,"if(kind==='narration'&&!lab.replyLive)return reply('<dream_body>")
body=body.replace("          return response.status(418).json({error:{message:'DIAGNOSTIC_EXTRACTION_NOT_SENT'}});","          if(kind==='extraction')return response.status(418).json({error:{message:'DIAGNOSTIC_EXTRACTION_NOT_SENT'}});")
backend.write_text(body,encoding='utf-8')
(E/'browser').mkdir();(E/'browser/captures').mkdir()
put(A/'clinic-natural-config.json',{'evidenceDir':str(E/'browser'),'captureDir':str(E/'browser/captures'),'phase':'real-recovery','sequence':0,'replyDiagnostic':True,'replyLive':True,'replyMode':'normal'})
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
put(E/'authorization.json',{'userText':'授予6次模型','recordedAt':now,'maximumCalls':6,'cumulativeBaseline':540,'ceiling':546,
 'budgetRelationship':'Conservative use of the previously unspent six; no stacking or reset of old ledgers.',
 'destination':'https://cdn.sta1n.cn/v1/chat/completions','model':'[抗截断]gemini-3.8-flash',
 'dataScope':'Same isolated campaign, character/world/history and key-knowledge projection; native child of actual response 540. Verify framework recovery and continued narration after reopening.',
 'credentials':'Existing configured Tavern credential previously authorized; never copy or print.',
 'classificationExternalCalls':0,'extractionExternalCalls':0,'reviewExternalCalls':0,'doNotFillQuota':True})
put(E/'run.json',{'authorization':'authorization.json','baseline':540,'limit':6,'used':0,'remaining':6,'cumulative':540,'ceiling':546,'attempts':[],'closed':False,'complete':False})
put(E/'setup.json',{'app':str(A),'port':18128,'parentChatId':setup['branchChatId'],'expectedParentRevision':3,'parentActualResponse':540,'classification':'local fixture','narration':'capture frozen request, one explicitly accounted send, release exact raw response','sourceParameters':str(P/'prepared-batch.json'),'productCodeChanged':False})
print(json.dumps({'prepared':True,'used':0,'remaining':6,'ceiling':546}))
