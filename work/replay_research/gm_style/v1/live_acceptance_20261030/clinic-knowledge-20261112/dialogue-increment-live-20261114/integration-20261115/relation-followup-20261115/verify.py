from pathlib import Path
import json,hashlib,difflib
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');prior=read(N/'before/run.json');ledger=read(I/'run.json');cases=read(N/'cases.json')
b['sourceHashes']={name.replace('\\','/'):h for name,h in b['sourceHashes'].items()}
assert ledger['attempts'][:len(prior['attempts'])]==prior['attempts']
attempts=ledger['attempts'][len(prior['attempts']):]
assert len(attempts)==10 and (ledger['used'],ledger['remaining'],ledger['cumulative'])==(112,88,446)
for name,h in b['originalEvidence'].items():assert sha(Path(name))==h,name
for name,h in b['formalProtected'].items():assert sha(Path(name))==h,name
module='TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'
for name,h in b['sourceHashes'].items():
 if name not in (module,'TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-related.test.mjs'):assert sha(Path(name))==h,name
results=[];outputs=[]
for a in attempts:
 assert a['state']=='completed' and a['rawUnmodified'] and a['manualVerdict']
 p=I/(a['id']+'.request.json');assert sha(p)==a['requestSha256']
 id='relation.followup.partial' if a['id']=='relation.followup.partial.strict' else a['id'];c=next(c for c in cases if c['id']==id)
 assert p.read_bytes()==(N/(id+'.prepared.json')).read_bytes()
 if c['original']:assert p.read_bytes()==(I/(c['original']+'.request.json')).read_bytes()
 for name,h in a['sourceHashes'].items():
  assert h==(b['sourceHashes'][name] if a['customRequest']<=441 else sha(Path(name)))
 raw=I/(a['id']+'.raw-response.txt');assert sha(raw)==a['rawResponseSha256']
 content=(I/(a['id']+'.content.txt')).read_text(encoding='utf8');assert read(raw)['choices'][0]['message']['content']==content
 check=read(N/(a['id']+'.check.json'));assert check['exactCurrentMessages']
 results.append(dict(id=a['id'],call=a['customRequest'],verdict=a['manualVerdict'],error=check.get('error'),schemaPass=check.get('schemaPass',False),structuralPass=check['structuralPass'],isolatedWrites=check['mvuWrites'],assessment=a['assessment']))
 outputs.append(str(a['customRequest'])+' '+a['id']+'\n'+content+'\n')
assert sum(r['verdict']=='pass' for r in results)==1
pre=read(N/'relation.followup.partial.pre-fix.check.json');post=read(N/'relation.followup.partial.check.json')
assert pre['mvuWrites']==4 and pre['structuralPass'] and post['mvuWrites']==0 and 'Duplicate JSON object key' in post['error']
good=read(N/'relation.followup.new_partial.check.json');assert len(good['pending'])==1 and good['noQuestionWithoutDependency']
report=dict(results=results,newCalls=10,used=112,remaining=88,cumulative=446,newTests=4,freshOfflineTests=161,originalEvidenceFilesPreserved=len(b['originalEvidence']),formalProtectedFilesUnchanged=len(b['formalProtected']),historicalLedgerPrefixUnchanged=True,originalRequestBodiesByteIdentical=True,productFix='Reject duplicate JSON object members before accepting native last-value overwrite; original JSON syntax parsing and all span checks retained',duplicate441BeforeWrites=4,duplicate441AfterWrites=0,generationContractUnchanged=True,rawRepair=False,validationRelaxed=False,deployed=False,formalStoryWritten=False,automaticApprovalOrRevisionRestored=False)
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(N/'complete-outputs.txt').write_text('本轮437—446完整原始模型正文，未修补。前五份在重复键缺口发现前生成，后五份使用修复后的解析入口；所有请求的生成合同与参数保持。\n\n'+'\n'.join(outputs),encoding='utf8')
(N/'product-change.diff').write_text(''.join(difflib.unified_diff((N/'before/story-dialogue-knowledge.mjs').read_text(encoding='utf8').splitlines(True),Path(module).read_text(encoding='utf8').splitlines(True),fromfile='before/story-dialogue-knowledge.mjs',tofile=module)),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='Diagnosed upstream JSON/extra-field nonadherence; fixed evidenced duplicate-member silent overwrite in raw adapter.161 offline tests pass.437-446 ten responses:1 scoped pass,6 syntax failures,2 binding failures,1 duplicate-key failure.441 pre-fix writes4 preserved, exact raw now writes0.112/200 used88 remaining;no repair/deploy/formal story/automatic routes.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=True))
