"""Check the two authorized real-classification rounds; no model calls."""
from pathlib import Path
import json,hashlib,datetime,shutil,collections
E=Path(__file__).resolve().parent;F=E.parent;P=F.parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
run=load(E/'run.json');auth=load(E/'authorization.json');setup=load(E/'setup.json')
ids=['dialogue-classification','dialogue-narration','mechanical-classification','mechanical-narration']
assert (run['used'],run['remaining'],run['cumulative'],run['ceiling'])==(4,0,546,546)
assert [a['id'] for a in run['attempts']]==ids and [a['customRequest'] for a in run['attempts']]==[543,544,545,546]
assert auth['maximumCalls']==4 and auth['countsFailuresAndRetries']
assert all(a['state']=='completed' and a['status']==200 and a['finishReason']=='stop' and a['rawUnmodified'] and a['manualVerdict']=='pass' and a['relayReleased'] for a in run['attempts'])
params=load(P/'prepared-batch.json')['parameters'];captures=[]
for i,a in enumerate(run['attempts'],1):
 ident=a['id'];kind=a['kind'];prefix=E/'browser/captures'/f'real-classification.{i:02d}.{kind}'
 request=E/(ident+'.request.json');response=E/(ident+'.raw-response.txt')
 assert sha(request)==a['requestSha256'] and sha(response)==a['rawResponseSha256']
 assert {k:v for k,v in load(request).items() if k!='messages'}==params
 assert load(response)['choices'][0]['message']['content']==(E/(ident+'.content.txt')).read_text(encoding='utf-8')
 assert request.read_bytes()==Path(str(prefix)+'.request.json').read_bytes()==Path(str(prefix)+'.sent-request.json').read_bytes()
 assert response.read_bytes()==Path(str(prefix)+'.raw-response.txt').read_bytes()
 capture=load(Path(str(prefix)+'.capture.json'));assert capture['kind']==kind and not capture['classificationFixture'] and capture['browserUpstreamCalls']==0
 assert load(E/(ident+'.relay-proof.json'))['exactRequestBytes'];captures.append(capture)
assert len(list((E/'browser/captures').glob('*.request.json')))==4
ordinary=load(E/'dialogue-classification.content.txt');mechanical=load(E/'mechanical-classification.content.txt')
assert ordinary['status']=='NO_CHECK' and ordinary['basis']=='ordinary_dialogue' and 'request' not in ordinary
assert mechanical['status']=='RECOVERY_REQUIRED' and mechanical['request']=={'kind':'recovery','type':'rest','rest':'short','minutes':15}
labels=['01-dialogue-saved','02-mechanical-committed-before-prose','03-mechanical-saved','04-reopened-final']
snapshots=[load(E/'browser'/(label+'.json')) for label in labels]
base=load(E/'00-baseline.json');baseline=base['pages'][-1]['stat_data']['901_rules_poc'];roots=[]
for d in snapshots:
 r=d['pages'][-1]['stat_data']['901_rules_poc'];roots.append(r)
 assert len(d['saved'])==len(d['chat'])+1
 assert r==d['saved'][-1]['variables'][d['chat'][-1].get('swipe_id',0)]['stat_data']['901_rules_poc']
 assert [m['mes'] for m in d['chat'][:30]]==[m['mes'] for m in base['chat']]
 assert r['storyKnowledge']==baseline['storyKnowledge']
assert roots[0]==baseline and roots[1]==roots[2]==roots[3]
assert snapshots[0]['chat'][-1]['extra']['901_replay_gate']['status']=='NO_CHECK'
assert snapshots[0]['chat'][-1]['mes']==(E/'dialogue-narration.content.txt').read_text(encoding='utf-8')+'\n\n<StatusPlaceHolderImpl/>'
assert snapshots[2]['chat'][-1]['extra']['901_replay_gate']['status']=='APPLIED'
assert snapshots[3]['chat'][-1]['mes']==(E/'mechanical-narration.content.txt').read_text(encoding='utf-8')+'\n\n<StatusPlaceHolderImpl/>'
final=roots[-1];assert baseline['revision']==6 and final['revision']==7
new={k:v for k,v in final['operations'].items() if k not in baseline['operations']};assert len(new)==1
operation_id,operation=next(iter(new.items()));summary=operation['summary']
assert operation_id==f"gm-runtime/{setup['branchChatId']}/32/0" and summary['kind']=='recovery' and summary['status']=='applied'
assert summary['result']['type']=='rest' and summary['result']['rest']=='short' and summary['result']['minutes']==15 and summary['result']['changes']==[]
assert all(final['operations'][k]==v for k,v in baseline['operations'].items())
player=final['actors']['player']['state'];old_player=baseline['actors']['player']['state']
assert player['recoveryClock']['minutes']==15 and player['recoveryClock']['longRests']==0
assert all(player[k]==old_player[k] for k in ['health','resources','inventory'])
batch=next(iter(final['storyKnowledge']['dialogueBatches'].values()));source=batch['sourceAnchor']
assert batch['status']=='failed' and len(batch['rows'])==1 and batch['rows'][0]['status']=='pending'
assert source['chatId']==setup['branchChatId'] and source['text']==snapshots[-1]['chat'][source['messageId']]['mes']
rows=[json.loads(x) for x in Path(setup['branchChat']).read_text(encoding='utf-8').splitlines()]
assert rows[-1]['variables'][rows[-1].get('swipe_id',0)]['stat_data']['901_rules_poc']==final
shutil.copy2(setup['branchChat'],E/'final.chat.jsonl')
protected=load(E/'protected-before.json');assert all(sha(Path(p))==h for p,h in protected.items())
R=next(p for p in E.parents if p.name=='TRPG outputs');A=Path(setup['app']);manifest=load(F/'candidate-manifest.json')
for name in ['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']:
 m=next(m for m in manifest if Path(m['source']).name==name and 'gm_runtime' in m['source'])
 assert sha(R/'work/rules_engine/gm_runtime'/name)==m['source_sha256']
 assert sha(A/'public/901-opening-combat/work/rules_engine/gm_runtime'/name)==m['sha256']
assert (E/'browser/real-classification-rest-reopened.jpg').stat().st_size>1000
run.update(closed=True,complete=True,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),stopReason='Two real classification/narration rounds passed; four-call cap exhausted.',classificationModelCalls=2,narrationModelCalls=2,extractionModelCalls=0,reviewModelCalls=0,failures=0,retries=0)
(E/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
result={'passed':True,'actualCalls':4,'classificationCalls':2,'narrationCalls':2,'requests':[543,544,545,546],'httpStatus':[200]*4,'finishReason':['stop']*4,
 'failures':0,'retries':0,'used':4,'remaining':0,'cumulative':546,'ceiling':546,
 'ordinary':{'classification':'NO_CHECK/ordinary_dialogue','savedStatus':'NO_CHECK','fullRuleRootUnchanged':True},
 'mechanical':{'classification':'RECOVERY_REQUIRED','request':mechanical['request'],'savedStatus':'APPLIED','revisionBefore':6,'revisionAfter':7,'clockMinutes':15,'newOperations':1,'operationId':operation_id,'committedBeforeProse':True,'rootAfterProseAndReopenEqual':True},
 'rawResponsesAndProseUnchanged':True,'activeSavedAndDiskRootsEqual':True,'knowledgeAndFailedSourcePreserved':True,'healthResourcesInventoryUnchanged':True,
 'classificationFixtures':False,'productModulesUnchanged':True,'protectedPriorFilesUnchanged':len(protected),'closed':True}
(E/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'passed':True,'calls':4,'remaining':0,'cumulative':546,'ordinary':'NO_CHECK','mechanical':'APPLIED','restMinutes':15,'newOperations':1,'closed':True}))
