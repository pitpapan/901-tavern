from pathlib import Path
import json,hashlib
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');ledger=read(I/'run.json');before=read(N/'before/run.json');cases=read(N/'cases.json')
assert ledger['attempts'][:len(before['attempts'])]==before['attempts']
assert len(ledger['attempts'])-len(before['attempts'])==2
assert (ledger['cumulative'],ledger['used'],ledger['remaining'])==(427,93,107)
unchanged=[]
for name,h in b['hashes'].items():
 if name.endswith('run.json') or name.endswith('run-iteration-model.mjs'):continue
 assert sha(Path(name))==h,name
 unchanged.append(name)
formal=read(E/'normal-play-20261115/baseline.json')['formalProtected']
for name,h in formal.items():assert sha(Path(name))==h,name
results=[];out=['本轮两份原样复测完整模型内容；不是修复后新版本，产品代码、请求及参数均未变。\n完整HTTP原件见../iteration-200-20261115/selection.reproduce.*\n']
for c in cases:
 a=next(a for a in ledger['attempts'] if a['id']==c['id']);p=I/(c['id']+'.request.json')
 assert p.read_bytes()==(I/(c['original']+'.request.json')).read_bytes()==(N/(c['id']+'.prepared.json')).read_bytes()
 assert sha(p)==c['requestSha256']==a['requestSha256']
 assert sha(I/(c['id']+'.raw-response.txt'))==a['rawResponseSha256'] and a['rawUnmodified']
 assert a['unchangedSourceReproduction'] and a['retestOf']==c['original']
 for name,h in a['sourceHashes'].items():assert sha(Path(name))==h,name
 check=read(N/(c['id']+'.check.json'));assert check['structuralPass'] and check['schemaPass'] and check['exactCurrentMessages']
 assert a['manualVerdict']=='fail'
 results.append(dict(id=c['id'],call=a['customRequest'],jsonSchemaAndCitationsPass=True,overallVerdict='fail',isolatedWrites=check['mvuWrites'],assessment=a['assessment']))
 out.append(str(a['customRequest'])+' '+c['id']+'\n'+(I/(c['id']+'.content.txt')).read_text(encoding='utf8')+'\n')
report=dict(results=results,newCalls=2,cumulative=427,used=93,remaining=107,freshCampaignTests=146,reusedUnchangedSharedTests=50,newRegressionTests=2,productSourcesUnchanged=True,requestBodiesByteIdentical=True,originalEvidenceAndProductFilesPreserved=len(unchanged),priorLedgerAttemptsUnchanged=True,formalProtectedFilesUnchanged=len(formal),rawRepair=False,validationRelaxed=False,deployed=False,formalStoryWritten=False,automaticApprovalOrRevisionRestored=False,acceptanceHelperChange='Explicit finite/hash-bound user-authorized reproduction mode; default send/retest guards retained, no automatic loop.')
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(N/'complete-outputs.txt').write_text('\n'.join(out),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='No new product contract gap proved. Two new raw-failure regression tests;146 fresh tests pass,50 unchanged shared reused.426/427 exact authorized reproductions both JSON/citations pass but evidence grounding remains unaccepted.Used93/200 remaining107;no automatic calls.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
