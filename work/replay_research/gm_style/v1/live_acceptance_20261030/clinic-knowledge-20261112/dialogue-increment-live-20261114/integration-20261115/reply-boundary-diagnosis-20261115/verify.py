from pathlib import Path
import json,hashlib
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');before=read(N/'before/run.json');ledger=read(I/'run.json');cases=read(N/'cases.json')
assert ledger['attempts'][:len(before['attempts'])]==before['attempts']
attempts=ledger['attempts'][len(before['attempts']):]
assert len(attempts)==5 and (ledger['used'],ledger['remaining'],ledger['cumulative'])==(127,73,461)
for name,h in b['originalEvidence'].items():assert sha(Path(name))==h,name
for name,h in b['formalProtected'].items():assert sha(Path(name))==h,name
for name,h in b['sourceHashes'].items():
 if not name.endswith('story-dialogue-related.test.mjs'):assert sha(Path(name))==h,name
results=[];outputs=[];parameters=lambda r:{k:v for k,v in r.items() if k not in ('messages','response_format')}
base=read(I/'binding.reproduce.009.request.json')
for a in attempts:
 assert a['state']=='completed' and a['rawUnmodified'] and a['manualVerdict']=='fail'
 c=next(c for c in cases if c['id']==a['id']);p=I/(a['id']+'.request.json')
 assert sha(p)==a['requestSha256']==c['requestSha256'] and p.read_bytes()==(N/(a['id']+'.prepared.json')).read_bytes()
 if c['original']:assert p.read_bytes()==(I/(c['original']+'.request.json')).read_bytes()
 assert parameters(read(p))==parameters(base)
 for name,h in a['sourceHashes'].items():assert sha(Path(name))==h,name
 raw=I/(a['id']+'.raw-response.txt');capture=read(I/(a['id']+'.response.json'));assert sha(raw)==a['rawResponseSha256']==capture['responseBodySha256BeforePrivacyRedaction']
 response=read(raw);content=(I/(a['id']+'.content.txt')).read_text(encoding='utf8');assert response['choices'][0]['message']['content']==content
 assert a['finishReason']=='stop' and a['usage']['completion_tokens']<read(p)['max_tokens']
 check=read(N/(a['id']+'.check.json'));assert check['exactCurrentMessages'] and not check['structuralPass'] and check['mvuWrites']==0 and check['replayStateUnchanged']
 try:json.loads(content)
 except json.JSONDecodeError as e:syntax=dict(position=e.pos,message=e.msg,excerpt=content[max(0,e.pos-40):e.pos+40])
 else:raise AssertionError('Expected original syntax failure')
 results.append(dict(id=a['id'],call=a['customRequest'],verdict='fail',syntax=syntax,isolatedWrites=0,assessment=a['assessment']))
 outputs.append(str(a['customRequest'])+' '+a['id']+'\n'+content+'\n')
report=dict(results=results,newCalls=5,used=127,remaining=73,cumulative=461,newTests=1,freshOfflineTests=164,productSourcesUnchanged=True,generationContractUnchanged=True,originalRequestsByteIdentical=4,originalEvidenceFilesPreserved=len(b['originalEvidence']),formalProtectedFilesUnchanged=len(b['formalProtected']),historicalLedgerPrefixUnchanged=True,allRawBytesUnmodified=True,syntaxFailures=5,overallPasses=0,allIsolatedStatesUnchanged=True,scope='Four representative originals and one nearby contrast; other old failures retained, not all replayed this turn',rawRepair=False,validationRelaxed=False,deployed=False,formalStoryWritten=False,automaticApprovalOrRevisionRestored=False)
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(N/'complete-outputs.txt').write_text('457—461完整原始模型正文；四份代表原失败逐字节重发、一份相近对照。产品代码及生成合同未变，没有修补。\n\n'+'\n'.join(outputs),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='No new evidenced program gap.164 offline tests;bounded representative retest457-461 all raw JSON failures/writes0.4 original bodies unchanged plus1 nearby implicit reply.127/200 used73 remaining;599 original evidence and22 formal files preserved. No product/prompt/schema/validator change,repair,deploy,formal story or automatic routes.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=True))
