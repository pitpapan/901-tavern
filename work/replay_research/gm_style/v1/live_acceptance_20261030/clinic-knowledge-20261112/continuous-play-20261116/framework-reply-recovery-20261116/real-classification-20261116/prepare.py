"""Reconnect classification in the existing isolated capture/release path."""
from pathlib import Path
import json,hashlib,shutil,datetime,importlib.util
E=Path(__file__).resolve().parent;F=E.parent;V=F/'model-verification-20261116';P=F.parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert not (E/'run.json').exists(),'Never reset an allowance'
old=load(V/'run.json');assert (old['cumulative'],old['remaining'],old['closed'])==(542,4,True)
previous=load(V/'setup.json');A=Path(previous['app']);parent=previous['branchChatId']
protected={str(p):sha(p) for p in [V/'run.json',V/'verification.json',V/'ASSESSMENT.md',Path(previous['branchChat'])]}
put(E/'protected-before.json',protected)
card=A/'data/default-user/characters'/(load(P/'setup.json')['character']+'.png');backend=A/'src/endpoints/backends/chat-completions.js'
shutil.copy2(card,E/'card.before.png');shutil.copy2(backend,E/'backend.before.js');shutil.copy2(A/'clinic-natural-config.json',E/'lab-config.before.json')
entry=(V/'entry.live.js').read_text(encoding='utf-8').split('// Disposable local fault injection.')[0]
old_parent=json.dumps(previous['parentChatId'],ensure_ascii=False);new_parent=json.dumps(parent,ensure_ascii=False)
assert entry.count('const continuationParentId='+old_parent+';')==1
entry=entry.replace('const continuationParentId='+old_parent+';','const continuationParentId='+new_parent+';')
entry=entry.replace('expectedRevision:3','expectedRevision:5').replace('sourceRevision===3','sourceRevision===5')
entry+='\n'+(E/'controls.js').read_text(encoding='utf-8');(E/'entry.live.js').write_text(entry,encoding='utf-8')
R=next(p for p in E.parents if p.name=='TRPG outputs');helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
sp=importlib.util.spec_from_file_location('lab',helper);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def transform(c):c['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
m.card_transform(card,transform)
s=backend.read_text(encoding='utf-8')
replacements={"classificationFixture:kind==='classification'":"classificationFixture:kind==='classification'&&!lab.liveClassification",
 "          if(kind==='classification'){":"          if(kind==='classification'&&!lab.liveClassification){",
 "        if(kind==='classification')return response.json":"        if(kind==='classification'&&!lab.liveClassification)return response.json",
 "        if(kind!=='narration')return response.status(418)":"        if(!['classification','narration'].includes(kind))return response.status(418)"}
for old_text,new_text in replacements.items():assert s.count(old_text)==1,old_text;s=s.replace(old_text,new_text)
backend.write_text(s,encoding='utf-8')
(E/'browser').mkdir();(E/'browser/captures').mkdir()
put(A/'clinic-natural-config.json',{'evidenceDir':str(E/'browser'),'captureDir':str(E/'browser/captures'),'phase':'real-classification','sequence':0,'replyDiagnostic':True,'replyLive':True,'liveClassification':True,'replyMode':'normal'})
put(E/'authorization.json',{'userText':'接回真实分类：普通对白和明确机械动作，两轮4次上限','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'maximumCalls':4,'cumulativeBaseline':542,'ceiling':546,'previousLedgerSha256':sha(V/'run.json'),
 'destination':'https://cdn.sta1n.cn/v1/chat/completions','model':'[抗截断]gemini-3.8-flash',
 'dataScope':'Same isolated campaign/characters/world/history/key knowledge through real542; real pre-action classification and narration for one ordinary dialogue and one explicitly completed fifteen-minute short rest.',
 'existingPayloadDestinationConsent':load(V/'authorization.json')['explicitDataAndDestinationConsent'],'countsFailuresAndRetries':True,'carryPreviousUnspentFour':True,'doNotFillQuota':True})
put(E/'run.json',{'authorization':'authorization.json','baseline':542,'limit':4,'used':0,'remaining':4,'cumulative':542,'ceiling':546,'attempts':[],'closed':False,'complete':False})
put(E/'setup.json',{'app':str(A),'port':18128,'parentChatId':parent,'expectedParentRevision':5,'parentActualResponse':542,'classification':'real original model response','narration':'real original model response','productCodeChanged':False,'classificationTimeoutMs':60000})
(E/'dialogue.player-input.txt').write_text('御临风仍站在协会门外，问布莱特：“柜台那边现在方便打听吗？”',encoding='utf-8')
(E/'mechanical.player-input.txt').write_text('御临风在协会门外找了不挡路的位置坐下，现在完整短休十五分钟，期间不做其他行动。',encoding='utf-8')
print(json.dumps({'prepared':True,'remaining':4,'classificationFixture':False,'ceiling':546}))
