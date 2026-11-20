from pathlib import Path
import json,hashlib,shutil
E=Path(__file__).resolve().parent;L=E/'live-model-20261115';R=next(p for p in E.parents if p.name=='TRPG outputs')
load=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
setup=load(E/'browser-setup.json');chat=Path(setup['chat']);shutil.copy2(chat,L/'A1-after-failure.chat.jsonl')
rows=[json.loads(x) for x in chat.read_text(encoding='utf-8').splitlines()][1:];last=rows[-1];raw=(L/'A1.narration.content.txt').read_text(encoding='utf-8')
assert last['mes']==raw.strip()+'\n\n<StatusPlaceHolderImpl/>'
assert last['extra']['901_knowledge_status']=={'status':'unprocessed','reason':'dialogue-extraction-failed'}
root=last['variables'][0]['stat_data']['901_rules_poc'];k=root.get('storyKnowledge',{})
assert not k.get('knowledge');assert not k.get('dialogueBatches');assert not k.get('events')
put(L/'state-audit.json',{'savedTextMatchesOriginalHostFormatting':True,'rawModelResponsePreserved':True,'proseRegenerated':False,'knowledgeGrants':len(k.get('knowledge',{})),'dialogueBatches':len(k.get('dialogueBatches',{})),'pending':0,'failureStatus':last['extra']['901_knowledge_status'],'latestGateStatus':last['extra']['901_replay_gate']['status'],'revision':root['revision'],'userRequestCount':sum(r.get('is_user',False) and r.get('mes')=='黄泉，刚才要告诉我的消息是什么？' for r in rows)})
ledger=load(L/'run.json');assert len(ledger['attempts'])==2 and ledger['closed'] and ledger['cumulative']==336
outputs=[]
for row in ledger['attempts']:
 id=row['id'];assert sha(L/(id+'.request.json'))==row['requestSha256'];assert sha(L/(id+'.raw-response.txt'))==row['rawResponseSha256']
 actual=load(L/(id+'.raw-response.txt'));text=(L/(id+'.content.txt')).read_text(encoding='utf-8');assert actual['choices'][0]['message']['content']==text
 captured=load(L/('browser-captures/'+id+'.request.json'));assert captured==load(L/(id+'.request.json'))
 outputs.append(id+' / custom'+str(row['customRequest'])+'\n'+text+'\n\n')
(L/'complete-outputs.txt').write_text(''.join(outputs),encoding='utf-8')
baseline=load(E/'baseline.json');protected=[]
for path,h in baseline['protectedFiles'].items():assert sha(Path(path))==h,path;protected.append(path)
sources=load(L/'source-baseline.json')
for path,h in sources.items():assert sha(R/path)==h,path
frozen=load(E/'final-verification.json');assert sha(E/frozen['archive']['file'])==frozen['archive']['sha256']
diagnosis=load(L/'span-diagnosis.json');assert diagnosis['schemaValid'] and diagnosis['spanCount']==39 and diagnosis['matchingSpans']==34
verification={'attempts':2,'authorizedMaximum':12,'unused':10,'closed':True,'stopReason':'A1 reception rejected by original strict quote/span validation','cumulative':336,'rawResponsesUnmodified':True,'browserRequestsEqualSentBodies':True,'browserNarrationMatchesFrozenRequest':True,'browserClassificationLocalCalls':len(list((L/'browser-captures').glob('*-classification.json'))),'liveProtocol':{'narration':'HTTP200/stop, source-grounded response','reception':'HTTP200/stop; JSON Schema valid; 5 of 39 references mismatch; original checker rejects'},'savedProseRetained':True,'noKnowledgeGranted':True,'unprocessedVisible':True,'sourcesUnchanged':len(sources),'formalProtectedUnchanged':len(protected),'candidateUnchanged':True,'retries':0,'outputRepaired':False,'deployed':False,'formalStoryWritten':False,'automaticApprovalRevision':False,'unexecuted':[x['id'] for x in load(E/'model-batch/plan.json')['dynamicCalls'][2:]]}
put(L/'verification.json',verification);print(json.dumps(verification,ensure_ascii=False))
