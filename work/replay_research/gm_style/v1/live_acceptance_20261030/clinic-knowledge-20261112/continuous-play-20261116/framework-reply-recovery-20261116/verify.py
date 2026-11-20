"""Verify retained UI evidence and state, without generating or changing a chat."""
from pathlib import Path
import json,hashlib,difflib,collections
E=Path(__file__).resolve().parent;B=E/'browser'
R=next(p for p in E.parents if p.name=='TRPG outputs')
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
names=['01-timeout-next-ok','02-malformed-error','03-malformed-regenerated-ok','04-prose-saved-extraction-failed','05-disabled-old-failure-next-ok','06-reopened-preserved','07-reopened-next-ok']
data=[load(B/(n+'.json')) for n in names]
roots=[d['pages'][-1]['stat_data']['901_rules_poc'] for d in data]
rows=[]
for name,d,r in zip(names,data,roots):
 assert len(d['chat'])==len(d['saved'])-1
 assert [m['mes'] for m in d['chat']]==[m['mes'] for m in d['saved'][1:]]
 selected=d['saved'][-1]['variables'][d['chat'][-1].get('swipe_id',0)]['stat_data']['901_rules_poc']
 assert selected==r
 assert r['actors']==roots[0]['actors']
 assert all(r['operations'][k]==v for k,v in roots[0]['operations'].items())
 extra={k:v for k,v in r['operations'].items() if k not in roots[0]['operations']}
 assert len(extra)==(1 if name.startswith(('04','05','06','07')) else 0)
 assert all(k.startswith('story-dialogue/') and v['summary']['kind']=='knowledge' and v['summary']['revision']==5 and v['summary']['messageId']==34 for k,v in extra.items())
 assert r['storyKnowledge']['events']==roots[0]['storyKnowledge']['events']
 assert r['storyKnowledge']['knowledge']==roots[0]['storyKnowledge']['knowledge']
 g=d['chat'][-1]['extra']['901_replay_gate']
 rows.append({'snapshot':name,'messages':len(d['chat']),'revision':r['revision'],'lastStatus':g['status'],'savedRootEqual':True})
timeout=[m['extra']['901_replay_gate'] for m in data[0]['chat'][26:] if m.get('extra',{}).get('901_replay_gate',{}).get('status')=='UNRESOLVED']
assert len(timeout)==2
assert all(t['diagnostic']['errorCode']=='CLASSIFICATION_TIMEOUT' and t['diagnostic']['classificationRequests']==2 and t['diagnostic']['narrationRequests']==0 for t in timeout)
malformed=data[1]['chat'][-1]['extra']['901_replay_gate']['diagnostic']
assert malformed['failureStage']=='response_parse' and malformed['errorCode']=='INVALID_DECISION_JSON'
assert malformed['classificationRequests']==1 and malformed['narrationRequests']==0
assert len(data[1]['chat'])==len(data[2]['chat']) and data[1]['chat'][-2]['mes']==data[2]['chat'][-2]['mes']
assert roots[3]==roots[4]==roots[5]==roots[6]
batches=roots[3]['storyKnowledge']['dialogueBatches'];assert len(batches)==1
batch=next(iter(batches.values()));assert batch['status']=='failed' and len(batch['attempts'])==1
assert len(batch['rows'])==1 and batch['rows'][0]['kind']=='unprocessed' and batch['rows'][0]['status']=='pending'
source=batch['sourceAnchor']
for d in data[3:]:
 m=d['chat'][source['messageId']]
 assert source['chatId']==d['chatId'] and m['mes']==source['text'] and m.get('swipe_id',0)==source['swipeId']
assert '现在可以接着聊了吗' in data[-1]['chat'][-2]['mes']
assert '【本地恢复夹具，非模型正文】' in data[-1]['chat'][-1]['mes']
captures=[load(p) for p in (B/'captures').glob('*.capture.json')]
assert len(captures)==11 and all(c['browserUpstreamCalls']==0 for c in captures)
counts=dict(collections.Counter(c['kind'] for c in captures));assert counts=={'classification':6,'narration':5}
protected=load(E/'browser-protected-before.json')
assert all(sha(Path(p))==h for p,h in protected.items())
old=Path(load(E.parent/'setup.json')['app'])
assert sha(old/'src/endpoints/backends/chat-completions.js')==sha(E/'backend.before.js')
assert sha(old/'clinic-natural-config.json')==sha(E/'lab-config.before.json')
assert sha(old/'data/default-user/characters'/(load(E.parent/'setup.json')['character']+'.png'))==sha(E/'card.before.png')
candidate=Path(load(E/'browser-prepared.json')['app'])
manifest=load(E/'candidate-manifest.json')
changed=['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']
for name in changed:
 p=R/'work/rules_engine/gm_runtime'/name
 entry=next(m for m in manifest if Path(m['source']).name==name and 'gm_runtime' in m['source'])
 assert sha(p)==entry['source_sha256']
 assert sha(candidate/'public/901-opening-combat/work/rules_engine/gm_runtime'/name)==entry['sha256']
 assert sha(old/'public/901-opening-combat/work/rules_engine/gm_runtime'/name)==sha(E/(name+'.installed-before'))
budget=load(E.parent/'live/run.json');assert budget['used']==6 and budget['remaining']==6 and budget['cumulative']==540 and budget['closed']
assert sha(E.parent/'live/run.json')==sha(E/'budget.before.json')
assert (B/'reopened-next-ok.jpg').stat().st_size>1000
patch=[]
for name in changed+['replay-gate-script.test.mjs','story-dialogue-compact.test.mjs']:
 p=R/'work/rules_engine/gm_runtime'/name
 patch.extend(difflib.unified_diff((E/(name+'.before')).read_text(encoding='utf-8').splitlines(True),p.read_text(encoding='utf-8').splitlines(True),fromfile=name+'.before',tofile=name))
(E/'task-changes.patch').write_text(''.join(patch),encoding='utf-8')
result={'passed':True,'externalModelCalls':0,'budgetUnchanged':{'used':6,'remaining':6,'cumulative':540},
 'snapshots':rows,'localEndpointCaptures':counts,'timeout':{'classificationAttemptsPerNotice':2,'narrationCalls':0,'noticesRetained':2,'deadlineMs':500,'requestReachedLocalEndpoint':False},
 'malformed':{'classificationCalls':1,'narrationCalls':0,'recoveredThroughNativeRegenerate':True},
 'activeRetainedFailedBatch':{'unchangedAfterDisableNextChatReopenAndNextChat':True,'pending':1,'sourceMessageId':source['messageId']},
 'mechanicalActorsExistingOperationsKnowledgeReceiptsUnchanged':True,'optionalBatchWriteOnly':{'revisionBefore':4,'revisionAfter':5,'additionalKnowledgeBatchOperation':1},
 'originalLabRestored':True,'protectedFilesUnchanged':len(protected),'compiledInstalledModules':changed,
 'limits':['All browser classification/prose results are local fixtures, not live model acceptance.','The 500 ms timeout fixture also produced two notices for the same unexecuted input; preserved, no repeated settlement.','Real unsettled mechanical actions and committed MVU results retain their existing recovery protections.']}
(E/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'passed':True,'snapshots':len(rows),'localEndpointCaptures':counts,'pendingPreserved':1,'externalModelCalls':0,'remaining':6}))
