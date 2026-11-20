// Two explicitly authorized frozen narration requests, one selected request per process.
// Reuses the existing capture transport; no extraction, classification or review invocation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const base=new URL('conditions-20261113/',import.meta.url),out=new URL('live-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const [mode,id]=process.argv.slice(2),order=['pending','confirmed'];
assert.ok(['--preflight','--send'].includes(mode));assert.ok(order.includes(id));
const prepared=await read(new URL('prepared.json',base));assert.equal(prepared.status,'two-final-requests-frozen-not-sent');
const job=prepared.cases.find(c=>c.id===id),raw=await readFile(new URL(job.request.file,base),'utf8'),request=JSON.parse(raw);
assert.equal(sha(raw),job.request.sha256);assert.equal(Buffer.byteLength(raw),job.request.bytes);
assert.deepEqual({...request,messages:undefined},{...prepared.parameters,messages:undefined});
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');
assert.equal(settings.custom_model,request.model);assert.equal(settings.custom_prompt_post_processing,'merge_tools');
assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
const protectedFiles=(await read(new URL('../../browser-environment.json',base))).protected;
for(const [path,hash] of Object.entries(protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
if(mode==='--preflight'){console.log(JSON.stringify({id,bytes:Buffer.byteLength(raw),sha256:sha(raw),protectedFilesUnchanged:Object.keys(protectedFiles).length,credentialsRead:false,modelCalls:0}));process.exit(0);}
await mkdir(out,{recursive:true});const ledger=new URL('run.json',out);let report;
if(id==='pending'){
 const previous=await read(new URL('../continuations/live-20261113/run.json',base));assert.equal(previous.cumulative,252);assert.equal(previous.remaining,0);
 report={authorization:'2026-11-13 user explicitly grants two additional narration calls; active tavern credential and unchanged complete paired requests to current endpoint',baseline:252,limit:2,ceiling:254,cumulative:252,remaining:2,attempts:[],classification:'local NO_CHECK control',classificationCalls:0,automaticExtractionApprovalRevision:false,retries:0,timeoutMs:180000,endpoint:'https://cdn.sta1n.cn/v1/chat/completions',deployed:false,formalStoryWritten:false,closed:false};
 await writeFile(ledger,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}else report=await read(ledger);
assert.equal(report.closed,false);assert.equal(report.attempts.length,order.indexOf(id));assert.ok(report.attempts.every(a=>a.state==='completed'));assert.equal(report.ceiling,254);
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom?.filter(k=>k.active);assert.equal(keys?.length,1);
const apiKey=keys[0].value;assert.ok(typeof apiKey==='string'&&apiKey.trim()&&!/[\r\n]/.test(apiKey));
await writeFile(new URL(id+'.request.json',out),raw,{flag:'wx'});
const attempt={id,customRequest:report.baseline+report.attempts.length+1,state:'reserved',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw)};
report.attempts.push(attempt);report.cumulative++;report.remaining--;
const save=()=>writeFile(ledger,JSON.stringify(report,null,2)+'\n');await save();console.log(JSON.stringify({event:'send',...attempt}));
const row=await captureSavedReview({rawBody:raw,apiKey,timeoutMs:report.timeoutMs,onUpdate:async r=>writeFile(new URL(id+'.response.json',out),JSON.stringify({...r,kind:'narration'},null,2)+'\n')});
Object.assign(attempt,{state:row.outcome,status:row.status,elapsedMs:row.elapsedMs});
if(row.responseText!==undefined){await writeFile(new URL(id+'.raw-response.txt',out),row.responseText);attempt.rawResponseSha256=sha(row.responseText);attempt.responseBytes=row.responseBytes;attempt.rawUnmodified=attempt.rawResponseSha256===row.responseBodySha256BeforePrivacyRedaction;}
if(row.outcome==='completed'){
 let body;try{body=JSON.parse(row.responseText);}catch{}
 const choice=body?.choices?.[0],content=choice?.message?.content;
 Object.assign(attempt,{finishReason:choice?.finish_reason,responseId:body?.id,responseModel:body?.model,usage:body?.usage});
 if(typeof content!=='string'||!content.trim()||choice.finish_reason!=='stop'||body.error)attempt.state='protocol-error';
 if(typeof content==='string')await writeFile(new URL(id+'.content.txt',out),content);
}
report.closed=attempt.state!=='completed'||id==='confirmed';report.stopReason=attempt.state!=='completed'?attempt.state:id==='confirmed'?'two-authorized-narrations-completed':'awaiting-manual-next-request';
await save();console.log(JSON.stringify({event:'received',...attempt,remaining:report.remaining,closed:report.closed}));
