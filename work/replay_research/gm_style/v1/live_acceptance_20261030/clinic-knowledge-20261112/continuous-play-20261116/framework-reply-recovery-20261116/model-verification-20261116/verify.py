"""Final bounded verification of two real responses; performs no model calls."""
from pathlib import Path
import json,hashlib,collections,datetime
E=Path(__file__).resolve().parent;F=E.parent;P=E.parents[1]
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
auth=load(E/'authorization.json');run=load(E/'run.json');setup=load(E/'setup.json')
assert auth['explicitDataAndDestinationConsent']['answer']=='同意发送，上限6次'
assert auth['destination']=='https://cdn.sta1n.cn/v1/chat/completions' and auth['maximumCalls']==6
assert (run['used'],run['remaining'],run['cumulative'],run['ceiling'])==(2,4,542,546)
assert [a['customRequest'] for a in run['attempts']]==[541,542]
assert all(a['state']=='completed' and a['status']==200 and a['finishReason']=='stop' and a['manualVerdict']=='pass' and a['rawUnmodified'] for a in run['attempts'])
params=load(P/'prepared-batch.json')['parameters']
baseline=load(E/'00-baseline.json')
roots=[]
for number,stem in [('round-01','real-recovery.04.narration'),('round-02','real-recovery.06.narration')]:
 a=next(a for a in run['attempts'] if a['id']==number)
 request=E/(number+'.request.json');raw=E/(number+'.raw-response.txt');content=(E/(number+'.content.txt')).read_text(encoding='utf-8')
 r=load(request);assert {k:v for k,v in r.items() if k!='messages'}==params
 assert sha(request)==a['requestSha256'] and sha(raw)==a['rawResponseSha256']
 assert load(raw)['choices'][0]['message']['content']==content
 cap=E/'browser/captures'/stem
 assert Path(str(cap)+'.request.json').read_bytes()==request.read_bytes()
 assert Path(str(cap)+'.raw-response.txt').read_bytes()==raw.read_bytes()
 assert load(E/(number+'.'+stem+'.release-proof.json'))['sameRequestBytes']
 proof=load(E/(number+'.save-proof.json'));assert proof['activeEqualsSaved'] and proof['savedActualProseUnchanged'] and proof['failedPendingPreserved']==1
 d=load(E/(number+'.snapshot.json'));root=d['pages'][-1]['stat_data']['901_rules_poc'];roots.append(root)
 assert root==d['saved'][-1]['variables'][d['chat'][-1].get('swipe_id',0)]['stat_data']['901_rules_poc']
 assert [m['mes'] for m in d['chat'][:26]]==[m['mes'] for m in baseline['chat']]
 assert d['chat'][-1]['mes']==content+'\n\n<StatusPlaceHolderImpl/>'
 assert not any('【本地恢复夹具' in m['mes'] for m in d['chat'])
before=load(E/'browser/04-disabled-before-reopen.json');reopened=load(E/'browser/05-reopened-preserved.json')
assert roots[0]==roots[1]==before['pages'][-1]['stat_data']['901_rules_poc']==reopened['pages'][-1]['stat_data']['901_rules_poc']
batch=next(iter(roots[1]['storyKnowledge']['dialogueBatches'].values()));source=batch['sourceAnchor']
assert source['messageId']==27 and batch['status']=='failed' and len(batch['attempts'])==1
assert batch['rows'][0]['status']=='pending' and batch['rows'][0]['kind']=='unprocessed'
assert source['text']==load(E/'round-02.snapshot.json')['chat'][27]['mes']
error=load(E/'browser/01-classification-error.json')['chat'][-1]['extra']['901_replay_gate']
assert error['status']=='UNRESOLVED' and error['diagnostic']['errorCode']=='INVALID_DECISION_JSON'
assert (error['diagnostic']['classificationRequests'],error['diagnostic']['narrationRequests'])==(1,0)
relay_error=load(E/'browser/02-local-relay-failed-before-response-release.json')['chat'][-1]['extra']['901_replay_gate']
assert relay_error['status']=='NARRATION_PENDING' and relay_error['pending']['narrationDecision']['status']=='NO_CHECK'
original_request=E/'browser/captures/real-recovery.03.narration.request.json'
assert original_request.read_bytes()==(E/'round-01.request.json').read_bytes()
second=load(E/'round-02.request.json');first_content=(E/'round-01.content.txt').read_text(encoding='utf-8')
assert any(first_content in m.get('content','') for m in second['messages'])
captures=[load(p) for p in (E/'browser/captures').glob('*.capture.json')]
counts=dict(collections.Counter(c['kind'] for c in captures))
assert len(captures)==6 and counts=={'classification':3,'narration':3} and all(c['browserUpstreamCalls']==0 for c in captures)
protected=load(E/'protected-before.json');assert all(sha(Path(p))==h for p,h in protected.items())
R=next(p for p in E.parents if p.name=='TRPG outputs');A=Path(setup['app'])
manifest=load(F/'candidate-manifest.json');product=[]
for name in ['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']:
 m=next(m for m in manifest if Path(m['source']).name==name and 'gm_runtime' in m['source'])
 assert sha(R/'work/rules_engine/gm_runtime'/name)==m['source_sha256']
 assert sha(A/'public/901-opening-combat/work/rules_engine/gm_runtime'/name)==m['sha256']
 product.append({'file':name,'unchangedSinceLocalAcceptance':True})
assert (E/'browser/real542-reopened-next-ok.jpg').stat().st_size>1000
run.update(closed=True,complete=True,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
 stopReason='Two real narration responses completed failure recovery and post-reopen continuation. No quota filling.',
 classificationModelCalls=0,extractionModelCalls=0,reviewModelCalls=0,externalRetries=0,locallyReusedOriginalResponse=541)
(E/'run.json').write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
result={'passed':True,'actualModelCalls':2,'requests':[541,542],'used':2,'remaining':4,'cumulative':542,'ceiling':546,
 'model':'gemini-3.8-flash','httpStatus':[200,200],'finishReason':['stop','stop'],'rawResponsesAndSavedProseUnchanged':True,
 'classificationAndOptionalExtractionFailuresWereLocalInjections':True,'classificationModelCalls':0,'extractionModelCalls':0,'reviewCalls':0,'externalRetries':0,
 'localHarnessFailurePreservedAndCorrected':True,'response541ReusedOnlyAfterByteIdenticalRequest':True,
 'savedReopenAndNextTurnRootsEqual':True,'revision':5,'failedPendingPreserved':1,'sourceMessageId':27,'sourceRemainsActive':True,
 'actorsPriorOperationsAndKnowledgeReceiptsUnchanged':True,'localEndpointCaptures':counts,'protectedPriorFilesUnchanged':len(protected),'productModules':product,'closed':True}
(E/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'passed':True,'modelCalls':2,'remaining':4,'cumulative':542,'failedPendingPreserved':1,'closed':True}))
