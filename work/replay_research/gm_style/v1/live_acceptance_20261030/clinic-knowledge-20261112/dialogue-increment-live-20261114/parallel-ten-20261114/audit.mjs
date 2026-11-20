// Offline evidence inspection only. Does not normalize or repair model output.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const {checkAssertionReply}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js')));
const base=new URL('./',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,base),'utf8'));
const sha=v=>createHash('sha256').update(v).digest('hex');
const ledger=await read('live/run.json'),plan=await read('batch/prepared.json'),routing=await read('followup-routing.json');
assert.equal(sha(await readFile(new URL('cases.json',base))),plan.casesSha256);
const rows=[];
for(const attempt of ledger.attempts){
 const request=await read('live/'+attempt.id+'.request.json'),raw=await readFile(new URL('live/'+attempt.id+'.raw-response.txt',base),'utf8');
 const content=await readFile(new URL('live/'+attempt.id+'.content.txt',base),'utf8');
 assert.equal(content,JSON.parse(raw).choices[0].message.content);
 const applied=await read('live/'+attempt.id+'.applied.json'),input=JSON.parse(request.messages[1].content);
 assert.deepEqual({...request,messages:undefined},{...plan.parameters,messages:undefined});
 const row={id:attempt.id,customRequest:attempt.customRequest,verdict:attempt.manualVerdict,assessment:attempt.manualAssessment,localProtocolPassed:applied.localProtocolPassed,asked:applied.asked.length,knowledgeCounts:applied.context.actorKnowledge.map(a=>({id:a.actorId,count:a.facts.length}))};
 let output;try{output=JSON.parse(content);}catch(e){row.syntaxError=e.message;assert.equal(attempt.manualVerdict,'fail');}
 if(output&&input.assertion){
  row.contract=checkAssertionReply(output.assertions,input.assertion);
  row.spanCount=0;row.badSpans=[];
  const scan=x=>{if(!x||typeof x!=='object')return;if(Object.hasOwn(x,'documentId')&&Object.hasOwn(x,'start')&&Object.hasOwn(x,'end')&&Object.hasOwn(x,'quote')){row.spanCount++;const doc=input.assertion.documents.find(d=>d.id===x.documentId);if(!doc||doc.text.slice(x.start,x.end)!==x.quote)row.badSpans.push(x);}for(const value of Object.values(x))scan(value);};scan(output);
  row.unitStatuses=output.assertions.units.map(u=>({status:u.status,unresolved:u.unresolved.length}));
  row.receptionStatuses=output.receptions.map(r=>({status:r.status,recipientIds:r.recipientIds}));
 }
 if(!input.assertion){
  const job=await read('batch/'+attempt.id+'.prepared.json');assert.equal(job.parent,'08-ambiguous-listener');
  assert.deepEqual(await read('batch/'+attempt.id+'.seed.json'),await read('live/08-ambiguous-listener.after.seed.json'));
  assert.equal(job.parentRawResponseSha256,routing.parentRawResponseSha256);
  const pending=(await read('live/08-ambiguous-listener.applied.json')).result.pending;
  assert.deepEqual(input.pending,pending);assert.equal(output.inputRef,input.inputRef);
  assert.deepEqual(output.required,attempt.id.startsWith('09')?[]:pending.map(p=>p.id));
  assert.equal(applied.asked.length,attempt.id.startsWith('09')?0:1);
  assert.equal(applied.result.status,attempt.id.startsWith('09')?'ready':'deferred');
  row.actualParentRequest=301;row.required=output.required;
 }
 rows.push(row);
}
const report={scope:'Ten new category controls; original07 followups blocked, separate09/10 branch uses actual validated08. No original failure replaced.',attempts:rows.length,passed:rows.filter(r=>r.verdict==='pass').length,failed:rows.filter(r=>r.verdict==='fail').length,blockedOriginalFollowups:routing.blockedOriginal,productChanged:false,modelOutputRepaired:false,validationRelaxed:false,semanticCompletenessOrStabilityProven:false,rows};
await writeFile(new URL('offline-audit.json',base),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({attempts:report.attempts,passed:report.passed,failed:report.failed,rows:rows.map(r=>({id:r.id,verdict:r.verdict,syntaxError:r.syntaxError,contractIssues:r.contract?.issues,spans:r.spanCount,badSpans:r.badSpans?.length,asked:r.asked}))}));
