from pathlib import Path
import json,hashlib
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');before=read(N/'before/run.json');ledger=read(I/'run.json');cases=read(N/'cases.json')
assert ledger['attempts'][:len(before['attempts'])]==before['attempts']
attempts=ledger['attempts'][len(before['attempts']):]
assert len(attempts)==3 and (ledger['used'],ledger['remaining'],ledger['cumulative'])==(143,57,477)
for category in ['originalEvidence','formalProtected','sourceHashes']:
 for name,h in b[category].items():assert sha(Path(name))==h,name
results=[];outputs=[];parameters=lambda r:{k:v for k,v in r.items() if k not in ('messages','response_format')}
base=read(I/'binding.reproduce.009.request.json')
for a in attempts:
 assert a['state']=='completed' and a['rawUnmodified'] and a['manualVerdict']==('pass' if a['customRequest']==476 else 'fail')
 c=next(c for c in cases if c['id']==a['id']);p=I/(a['id']+'.request.json')
 assert sha(p)==a['requestSha256']==c['requestSha256'] and p.read_bytes()==(N/(a['id']+'.prepared.json')).read_bytes()
 if c['original']:assert p.read_bytes()==(I/(c['original']+'.request.json')).read_bytes()
 assert parameters(read(p))==parameters(base)
 for name,h in a['sourceHashes'].items():assert sha(Path(name))==h,name
 raw=I/(a['id']+'.raw-response.txt');capture=read(I/(a['id']+'.response.json'));assert sha(raw)==a['rawResponseSha256']==capture['responseBodySha256BeforePrivacyRedaction']
 response=read(raw);content=(I/(a['id']+'.content.txt')).read_text(encoding='utf8');assert response['choices'][0]['message']['content']==content
 assert a['finishReason']=='stop' and a['usage']['completion_tokens']<read(p)['max_tokens']
 check=read(N/(a['id']+'.check.json'));assert check['exactCurrentMessages']
 if a['customRequest']==476:
  assert check['structuralPass'] and check['schemaPass'] and check['mvuWrites']==2 and not check['replayStateUnchanged']
  assert check['pending']==[] and check['noQuestionWithoutDependency'] and len(check['checked']['receptions'])==1 and check['checked']['receptions'][0]['status']=='not_received' and check['checked']['receptions'][0]['recipientIds']==['bright']
  assert check['state']['knowledge']=={} and check['state']['events']=={}
  assert check['state']['facts']==json.loads(read(p)['messages'][1]['content'])['facts']
  assert all(not row['rows'] and row['status']=='processed' for row in check['state']['dialogueBatches'].values())
 else:assert not check['structuralPass'] and check['mvuWrites']==0 and check['replayStateUnchanged']
 try:json.loads(content);syntax=None
 except json.JSONDecodeError as e:syntax=dict(position=e.pos,message=e.msg,excerpt=content[max(0,e.pos-40):e.pos+40])
 assert (syntax is None)==(a['customRequest'] in [475,476])
 if a['customRequest']==475:assert check['schemaPass'] and check['error']=='Reply evidence must reference current answer'
 results.append(dict(id=a['id'],call=a['customRequest'],verdict=a['manualVerdict'],syntax=syntax,checkError=check.get('error'),isolatedWrites=check['mvuWrites'],assessment=a['assessment']))
 outputs.append(str(a['customRequest'])+' '+a['id']+'\n'+content+'\n')
report=dict(results=results,newCalls=3,used=143,remaining=57,cumulative=477,newTests=0,freshOfflineTests=164,productSourcesUnchanged=True,generationContractUnchanged=True,originalRequestsByteIdentical=2,originalEvidenceFilesPreserved=len(b['originalEvidence']),formalProtectedFilesUnchanged=len(b['formalProtected']),historicalLedgerPrefixUnchanged=True,allRawBytesUnmodified=True,syntaxFailures=1,bindingFailures=1,scopedKnowledgePasses=1,overallSemanticCompletenessProven=False,failedIsolatedStatesUnchanged=True,controlBookkeepingWrites=2,allKnowledgeUnchanged=True,scope='Two latest partial/nonreception originals and one nearby partial-uncertainty contrast; other old failures retained, not all replayed this turn',rawRepair=False,validationRelaxed=False,deployed=False,formalStoryWritten=False,automaticApprovalOrRevisionRestored=False)
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(N/'complete-outputs.txt').write_text('475—477完整原始模型正文；两份原失败逐字节重发、一份相近对照。产品代码及生成合同未变，没有修补。\n\n'+'\n'.join(outputs),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='No new evidenced program gap.164 existing offline tests freshly pass;bounded retest475-477 has1 raw JSON failure and1 listener binding failure with0 writes and1 nonreception scoped pass with2 bookkeeping writes and no knowledge increment.2 original bodies unchanged plus1 nearby implicit-answer contrast.143/200 used57 remaining;671 original evidence and22 formal files preserved. No product/test/prompt/schema/validator change,repair,deploy,formal story or automatic routes.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=True))
