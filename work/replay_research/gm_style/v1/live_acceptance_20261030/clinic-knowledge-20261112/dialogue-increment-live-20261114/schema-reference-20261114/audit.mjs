// Read-only evaluation of actual saved replies. Never repairs or resubmits.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const {checkAssertionReply}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js')));
const base=new URL('./',import.meta.url),prior=new URL('../',base),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=v=>createHash('sha256').update(v).digest('hex');
const baseline=await read(new URL('baseline.json',base)),retained=await read(new URL('schema-single-target-20261114/baseline.json',prior));
for(const [p,h] of Object.entries(baseline.protectedFiles))assert.equal(sha(await readFile(p)),h);
for(const [p,h] of Object.entries(retained.candidateSourceFiles))assert.equal(sha(await readFile(p)),h,'retained basic schema candidate: '+p);
for(const [p,h] of Object.entries(baseline.previousEvidence))assert.equal(sha(await readFile(new URL(p,prior))),h,p);
const rows=[],schemaCases=[];let full='';
for(const phase of ['schema-format-20261114','schema-single-target-20261114','schema-reference-20261114']){
 const dir=new URL(phase+'/',prior),ledger=await read(new URL('live/run.json',dir));
 for(const a of ledger.attempts){
  const rawRequest=await readFile(new URL('live/'+a.id+'.request.json',dir),'utf8'),raw=await readFile(new URL('live/'+a.id+'.raw-response.txt',dir),'utf8');
  assert.equal(sha(rawRequest),a.requestSha256);assert.equal(sha(raw),a.rawResponseSha256);
  const req=JSON.parse(rawRequest),original=await read(new URL('parallel-ten-20261114/batch/'+a.id+'.request.json',prior));
  const {response_format,...unchanged}=req;assert.deepEqual(unchanged,original);
  const row={phase,id:a.id,customRequest:a.customRequest,status:a.status,model:a.responseModel,verdict:a.manualVerdict,assessment:a.manualAssessment,requestSha256:a.requestSha256,rawResponseSha256:a.rawResponseSha256};
  full+='custom'+a.customRequest+' '+a.id+' '+phase+'\n';
  if(a.status===200){
   const content=await readFile(new URL('live/'+a.id+'.content.txt',dir),'utf8');assert.equal(JSON.parse(raw).choices[0].message.content,content);full+=content+'\n';
   const value=JSON.parse(content),input=JSON.parse(req.messages[1].content),applied=await read(new URL('live/'+a.id+'.applied.json',dir));
   schemaCases.push({id:a.customRequest,schema:response_format.json_schema.schema,value});
   row.assertionCheck=checkAssertionReply(value.assertions,input.assertion);delete row.assertionCheck.value;
   row.originalRuntimePassed=applied.localProtocolPassed;row.knowledge=applied.context.actorKnowledge.map(k=>({actor:k.actorId,count:k.facts.length}));row.pending=applied.result?.pending?.length;
   row.spanCount=0;row.invalidSpans=[];
   const scan=x=>{if(!x||typeof x!=='object')return;if(Object.hasOwn(x,'documentId')&&Object.hasOwn(x,'quote')){row.spanCount++;const doc=input.assertion.documents.find(d=>d.id===x.documentId);if(!doc||!Number.isInteger(x.start)||!Number.isInteger(x.end)||x.start<0||x.end<=x.start||doc.text.slice(x.start,x.end)!==x.quote)row.invalidSpans.push(x);}for(const v of Object.values(x))scan(v);};scan(value);
   row.receptions=value.receptions.map(r=>({claimId:r.claimId,status:r.status,recipients:r.recipientIds}));
  }else full+=raw+'\n';
  full+='核对：'+a.manualAssessment+'\n\n';rows.push(row);
 }
}
const schemaResult=spawnSync('python',['-c','import sys,json,jsonschema\nr=[]\nfor c in json.loads(sys.stdin.buffer.read().decode("utf-8")):\n es=list(jsonschema.Draft202012Validator(c["schema"]).iter_errors(c["value"]))\n r.append({"id":c["id"],"valid":not es,"issues":[{"path":list(e.absolute_path),"keyword":e.validator} for e in es]})\nprint(json.dumps(r))'],{input:JSON.stringify(schemaCases),encoding:'utf8'});assert.equal(schemaResult.status,0,schemaResult.stderr);
for(const s of JSON.parse(schemaResult.stdout))Object.assign(rows.find(r=>r.customRequest===s.id),{schemaValid:s.valid,schemaIssues:s.issues});
const probeDir=new URL('schema-single-target-20261114/',prior),probe=await read(new URL('probe.run.json',probeDir));
assert.equal(sha(await readFile(new URL('probe.request.json',probeDir))),probe.requestSha256);assert.equal(sha(await readFile(new URL('probe.raw-response.txt',probeDir))),probe.rawResponseSha256);
const probeContent=await readFile(new URL('probe.content.txt',probeDir),'utf8');assert.deepEqual(JSON.parse(probeContent),await read(new URL('probe.expected.json',probeDir)));
full+='custom308 FORMAT PROBE (not story acceptance)\n'+probeContent+'\n';
const report={newRequests:rows.length+1,storyReplies:schemaCases.length,httpErrors:rows.filter(r=>r.status!==200).length,formatProbes:1,cumulative:315,remaining:8,schemaValid:rows.filter(r=>r.schemaValid).length,
 originalRuntimePassed:rows.filter(r=>r.originalRuntimePassed).length,fullSemanticPasses:0,receiptTargetPartialPasses:[309],
 protectedUnchanged:Object.keys(baseline.protectedFiles).length,previousEvidenceUnchanged:Object.keys(baseline.previousEvidence).length,
 retainedProductChanges:retained.changedProductFiles,retainedCandidate:'basic Schema plus equivalent single-target cardinality; failed claimId description reverted',
 generationParametersAndMessagesUnchanged:true,modelRoutesObserved:[...new Set(rows.map(r=>r.model).filter(Boolean))],automaticRetry:false,responseRepair:false,validationRelaxed:false,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false,probe,rows};
await writeFile(new URL('verification.json',base),JSON.stringify(report,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',base),full);
console.log(JSON.stringify({...report,rows:rows.map(r=>({request:r.customRequest,id:r.id,schemaValid:r.schemaValid,local:r.originalRuntimePassed,badSpans:r.invalidSpans?.length,verdict:r.verdict})),probe:undefined}));
