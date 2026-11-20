from pathlib import Path
import json,hashlib
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');before=read(N/'before/run.json');ledger=read(I/'run.json');cases=read(N/'cases.json')
assert ledger['attempts'][:len(before['attempts'])]==before['attempts']
attempts=ledger['attempts'][len(before['attempts']):]
assert len(attempts)==10 and (ledger['used'],ledger['remaining'],ledger['cumulative'])==(122,78,456)
for name,h in b['originalEvidence'].items():assert sha(Path(name))==h,name
for name,h in b['formalProtected'].items():assert sha(Path(name))==h,name
for name,h in b['sourceHashes'].items():
 if not name.endswith('story-dialogue-related.test.mjs'):assert sha(Path(name))==h,name
results=[];outputs=[];parameters=lambda r:{k:v for k,v in r.items() if k not in ('messages','response_format')}
base=read(I/'relation.followup.006.request.json')
for a in attempts:
 assert a['state']=='completed' and a['rawUnmodified'] and a['manualVerdict']=='fail'
 c=next(c for c in cases if c['id']==a['id']);p=I/(a['id']+'.request.json')
 assert sha(p)==a['requestSha256']==c['requestSha256']
 assert p.read_bytes()==(N/(a['id']+'.prepared.json')).read_bytes()
 if c['original']:assert p.read_bytes()==(I/(c['original']+'.request.json')).read_bytes()
 assert parameters(read(p))==parameters(base)
 for name,h in a['sourceHashes'].items():assert sha(Path(name))==h,name
 raw=I/(a['id']+'.raw-response.txt');assert sha(raw)==a['rawResponseSha256']
 response=read(raw);content=(I/(a['id']+'.content.txt')).read_text(encoding='utf8');assert response['choices'][0]['message']['content']==content
 capture=read(I/(a['id']+'.response.json'));assert sha(raw)==capture['responseBodySha256BeforePrivacyRedaction']
 assert a['finishReason']=='stop' and a['usage']['completion_tokens']<read(p)['max_tokens']
 check=read(N/(a['id']+'.check.json'));assert check['exactCurrentMessages']
 results.append(dict(id=a['id'],call=a['customRequest'],schemaPass=check.get('schemaPass',False),structuralPass=check['structuralPass'],isolatedWrites=check['mvuWrites'],error=check.get('error'),verdict='fail',assessment=a['assessment']))
 outputs.append(str(a['customRequest'])+' '+a['id']+'\n'+content+'\n')
assert sum(r['structuralPass'] for r in results)==1 and results[0]['isolatedWrites']==6
assert all(r['isolatedWrites']==0 for r in results[1:])
report=dict(results=results,newCalls=10,used=122,remaining=78,cumulative=456,newTests=2,freshOfflineTests=163,productSourcesUnchanged=True,generationContractUnchanged=True,originalRequestsByteIdentical=8,originalEvidenceFilesPreserved=len(b['originalEvidence']),formalProtectedFilesUnchanged=len(b['formalProtected']),historicalLedgerPrefixUnchanged=True,allRawBytesUnmodified=True,syntaxFailures=7,bindingFailures=2,semanticFailures=1,overallPasses=0,rawRepair=False,validationRelaxed=False,deployed=False,formalStoryWritten=False,automaticApprovalOrRevisionRestored=False)
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(N/'complete-outputs.txt').write_text('447—456完整原始模型正文。本轮产品代码、生成合同及参数不变；八份旧失败请求逐字节复测，另两份相近对照。未修补。\n\n'+'\n'.join(outputs),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='No new program omission evidenced;2 new relation boundary regressions,163 tests pass.447-456 ten responses all fail overall:7 raw JSON syntax,2 strict reply binding,1 semantic merge/overgrant.122/200 used78 remaining.559 old evidence and22 formal files preserved;no product change/repair/relaxation/deploy/formal story/automatic routes.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=True))
