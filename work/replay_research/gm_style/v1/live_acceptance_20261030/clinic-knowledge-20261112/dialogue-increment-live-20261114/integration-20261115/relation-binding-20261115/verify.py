from pathlib import Path
import json,hashlib
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');before=read(N/'before/run.json');ledger=read(I/'run.json');cases=read(N/'cases.json')
assert ledger['attempts'][:len(before['attempts'])]==before['attempts']
attempts=ledger['attempts'][len(before['attempts']):]
assert len(attempts)==9 and (ledger['used'],ledger['remaining'],ledger['cumulative'])==(102,98,436)
assert all(a.get('manualVerdict') for a in attempts)
for name,h in b['originalEvidence'].items():assert sha(Path(name))==h,name
for name,h in b['formalProtected'].items():assert sha(Path(name))==h,name
parameters=lambda r:{k:v for k,v in r.items() if k not in ('messages','response_format')}
results=[];outputs=[]
for a in attempts:
 p=I/(a['id']+'.request.json');assert sha(p)==a['requestSha256']
 for name,h in a['sourceHashes'].items():assert sha(Path(name))==h,name
 case_id='relation.original.006' if a['id'].endswith('.network') else a['id']
 c=next(c for c in cases if c['id']==case_id)
 assert p.read_bytes()==(N/(case_id+'.prepared.json')).read_bytes()
 request=read(p);base=read(I/'selection.reproduce.play009.request.json')
 assert parameters(request)==parameters(base)
 if c['original']:
  original=read(I/(c['original']+'.request.json'))
  assert request['messages'][1:]==original['messages'][1:]
 if a['state']=='completed':
  raw_path=I/(a['id']+'.raw-response.txt');assert sha(raw_path)==a['rawResponseSha256'] and a['rawUnmodified']
  raw=read(raw_path);content=(I/(a['id']+'.content.txt')).read_text(encoding='utf8')
  assert raw['choices'][0]['message']['content']==content
  check=read(N/(a['id']+'.check.json'));assert check['exactCurrentMessages']
  results.append(dict(id=a['id'],call=a['customRequest'],verdict=a['manualVerdict'],schemaPass=check.get('schemaPass',False),structuralPass=check['structuralPass'],isolatedWrites=check['mvuWrites'],assessment=a['assessment']))
  outputs.append(str(a['customRequest'])+' '+a['id']+'\n'+content+'\n')
 else:
  assert a['id']=='relation.original.006' and a['state']=='transport-error'
  assert read(I/(a['id']+'.response.json'))['transportCode']=='ENOTFOUND'
assert len(results)==8 and sum(r['verdict']=='pass' for r in results)==1
assert sum(r['schemaPass'] for r in results)==3
report=dict(modelResults=results,attempts=9,rawModelResponses=8,transportFailures=1,used=102,remaining=98,cumulative=436,freshOfflineTests=157,newRegressionTests=11,originalEvidenceFilesPreserved=len(b['originalEvidence']),formalProtectedFilesUnchanged=len(b['formalProtected']),priorLedgerAttemptsUnchanged=True,originalInputsAndFragmentCataloguesUnchanged=True,generationParametersUnchanged=True,rawRepair=False,validationRelaxed=False,deployed=False,formalStoryWritten=False,automaticApprovalOrRevisionRestored=False)
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(N/'complete-outputs.txt').write_text('八份原始模型正文，未经修补。428为DNS失败，没有模型正文；完整请求和HTTP原件在同级iteration-200-20261115。\n\n'+'\n'.join(outputs),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='V5 listener/reception relation structure implemented;157 offline tests pass.8 model responses:1 limited reception pass,2 semantic failures,1 extra-field schema failure,4 JSON failures.1 sandbox DNS attempt plus8 responses charged9;102/200 used98 remaining. All originals retained;no repair/deploy/formal story/automatic approval or revision.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='modelResults'},ensure_ascii=True))
