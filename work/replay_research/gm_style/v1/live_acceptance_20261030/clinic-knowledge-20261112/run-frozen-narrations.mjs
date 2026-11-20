// Send a frozen, bounded round. Reuses transport capture, not semantic review.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {captureSavedReview} from '../../../../../../../901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs';
const base=new URL('./',import.meta.url),out=new URL('live-20261113/',base);
const communication=process.argv.includes('--communication');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const prepared=await read(new URL(communication?'communication-20261113/prepared-requests.json':'prepared-requests.json',base));
assert.equal(prepared.status,communication?'prepared-from-browser-captures':'captured-not-sent');
assert.deepEqual(prepared.probes.map(p=>p.id),communication?['05-known-unasked','06-known-asked','07-unknown-asked','08-confidential-asked']:['01-before','02-received','03-unreceived','04-relayed']);
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');
assert.equal(settings.custom_model,prepared.parameters.model);assert.equal(settings.custom_prompt_post_processing,'merge_tools');
assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
const jobs=[];
for(const p of prepared.probes){
 const raw=await readFile(new URL(p.requestFile,base),'utf8');assert.equal(sha(raw),p.requestSha256);assert.equal(Buffer.byteLength(raw),p.requestBytes);
 if(communication){
  const frozen=await read(new URL('prepared-requests.json',base)),original=frozen.probes.find(j=>j.id===p.originalBrowserProbe);
  assert.equal(p.originalRequestSha256,original.requestSha256);
  assert.equal(sha(await readFile(new URL(original.requestFile,base))),original.requestSha256);
  assert.deepEqual({...JSON.parse(raw),messages:[]},{...JSON.parse(await readFile(new URL(original.requestFile,base),'utf8')),messages:[]});
 }else{
  const capture=await read(new URL(p.captureFile,base));assert.equal(capture.endpointUrl,'https://cdn.sta1n.cn/v1/chat/completions');assert.deepEqual(JSON.parse(raw),capture.requestBody);
 }
 jobs.push({...p,raw});
}
const ledger=new URL('run.json',out);
const report=communication?await read(ledger):{authorization:'用户2026-11-13回复：给与8次调用',baseline:240,limit:8,ceiling:248,plannedThisRound:4,attempts:[],remaining:8,model:settings.custom_model,endpoint:'https://cdn.sta1n.cn/v1/chat/completions',requestTimeoutMs:180000,sharedTimeoutMs:180000,retries:0,classificationCalls:0,extractionOrReviewCalls:0,deployed:false};
if(communication){
 assert.equal(report.closed,true);assert.equal(report.cumulative,244);assert.equal(report.remaining,4);assert.equal(report.baseline,240);assert.equal(report.limit,8);assert.equal(report.ceiling,248);
 assert.deepEqual(report.attempts.map(a=>[a.id,a.state]),['01-before','02-received','03-unreceived','04-relayed'].map(id=>[id,'completed']));
 assert.equal(report.model,settings.custom_model);
}
if(process.argv[2]==='--preflight'){console.log(JSON.stringify({preflight:true,credentialsRead:false,requests:jobs.map(j=>({id:j.id,bytes:j.requestBytes,sha256:j.requestSha256})),limit:report.limit,remaining:report.remaining}));process.exit(0);}
assert.equal(process.argv[2],'--send-four');
await mkdir(out,{recursive:true});
if(communication){
 await writeFile(new URL('round-01-04.json',out),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 report.rounds=[{ids:report.attempts.map(a=>a.id),startedAt:report.startedAt,finishedAt:report.finishedAt,elapsedMs:report.elapsedMs,stopReason:report.stopReason}];
 report.closed=false;delete report.stopReason;delete report.finishedAt;
 await writeFile(ledger,JSON.stringify(report,null,2)+'\n');
}else await writeFile(ledger,JSON.stringify(report,null,2)+'\n',{flag:'wx'}); // No automatic repeat or resumption.
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom?.filter(k=>k.active);assert.equal(keys?.length,1);
const apiKey=keys[0].value;assert.ok(typeof apiKey==='string'&&apiKey.trim()&&!/[\r\n]/.test(apiKey));
const save=()=>writeFile(ledger,JSON.stringify(report,null,2)+'\n');
const started=Date.now(),deadline=started+report.sharedTimeoutMs;report.startedAt=new Date().toISOString();
for(const job of jobs){
 const remainingMs=deadline-Date.now();if(remainingMs<=0){report.stopReason='shared-timeout';break;}
 const attempt={id:job.id,customRequest:report.baseline+report.attempts.length+1,state:'reserved',requestBytes:job.requestBytes,requestSha256:job.requestSha256};
 await writeFile(new URL(job.id+'.request.json',out),job.raw,{flag:'wx'});
 report.attempts.push(attempt);report.remaining=report.limit-report.attempts.length;await save();
 console.log(JSON.stringify({event:'send',id:job.id,customRequest:attempt.customRequest,bytes:job.requestBytes}));
 const row=await captureSavedReview({rawBody:job.raw,apiKey,timeoutMs:Math.min(180000,remainingMs),onUpdate:async r=>{
  await writeFile(new URL(job.id+'.response.json',out),JSON.stringify({...r,kind:'narration'},null,2)+'\n');
 }});
 Object.assign(attempt,{state:row.outcome,status:row.status,elapsedMs:row.elapsedMs});
 if(row.responseText!==undefined)await writeFile(new URL(job.id+'.raw-response.txt',out),row.responseText);
 if(row.outcome==='completed'){
  let body;try{body=JSON.parse(row.responseText);}catch{}
  const choice=body?.choices?.[0],content=choice?.message?.content;
  attempt.finishReason=choice?.finish_reason;attempt.responseId=body?.id;attempt.responseModel=body?.model;attempt.usage=body?.usage;
  if(typeof content!=='string'||!content.trim()||choice.finish_reason!=='stop'||body.error){attempt.state='protocol-error';}
  if(typeof content==='string'){await writeFile(new URL(job.id+'.content.txt',out),content);attempt.contentCharacters=[...content].length;}
 }
 await save();console.log(JSON.stringify({event:'received',...attempt}));
 if(attempt.state!=='completed'){report.stopReason=attempt.state;break;}
}
report.stopReason??='four-frozen-requests-completed';report.finishedAt=new Date().toISOString();report.elapsedMs=Date.now()-started;report.cumulative=report.baseline+report.attempts.length;report.closed=true;
if(communication)report.rounds.push({ids:report.attempts.slice(4).map(a=>a.id),startedAt:report.startedAt,finishedAt:report.finishedAt,elapsedMs:report.elapsedMs,stopReason:report.stopReason});
await save();
console.log(JSON.stringify({event:'closed',attempts:report.attempts.length,cumulative:report.cumulative,remaining:report.remaining,stopReason:report.stopReason}));
