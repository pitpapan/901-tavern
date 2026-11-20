// Reuse the existing single-attempt transport, without invoking its review routes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const base=new URL('./',import.meta.url),out=new URL('live/',base),[mode,id]=process.argv.slice(2),order=['01','02'];
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
assert.ok(['--preflight','--send'].includes(mode));assert.ok(order.includes(id));
const prepared=await read(new URL('prepared.json',base)),job=prepared.cases.find(c=>c.id===id),raw=await readFile(new URL(job.request.file,base),'utf8'),request=JSON.parse(raw);
assert.equal(prepared.status,'sequential-pending-retelling');
assert.equal(sha(raw),job.request.sha256);assert.equal(Buffer.byteLength(raw),job.request.bytes);
assert.deepEqual({...request,messages:undefined},{...prepared.parameters,messages:undefined});
assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')),prepared.sourceSha256);
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
assert.equal(settings.custom_prompt_post_processing,'merge_tools');assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
for(const [path,hash] of Object.entries(prepared.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
if(mode==='--preflight'){console.log(JSON.stringify({id,...job.request,credentialsRead:false,modelCalls:0}));process.exit(0);}
await mkdir(out,{recursive:true});const ledger=new URL('run.json',out);let report;
if(id==='01'){
 const prior=await read(new URL('../condition-retelling-20261114/live/run.json',base));assert.equal(prior.cumulative,260);assert.equal(prior.closed,true);
 report={authorization:'2026-11-14 用户明确允许新增2次叙事，承接custom260核对个人安排与原约定的归属；其余参数不变，失败即停、不重试；沿既有密钥和端点授权。',baseline:260,limit:2,ceiling:262,cumulative:260,remaining:2,attempts:[],classification:'retained local NO_CHECK control',classificationCalls:0,automaticExtractionApprovalRevision:false,retries:0,timeoutMs:180000,endpoint:'https://cdn.sta1n.cn/v1/chat/completions',deployed:false,formalStoryWritten:false,closed:false};
 await writeFile(ledger,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}else report=await read(ledger);
assert.equal(report.closed,false);assert.equal(report.attempts.length,order.indexOf(id));assert.ok(report.attempts.every(a=>a.state==='completed'));
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom?.filter(k=>k.active);assert.equal(keys?.length,1);
const apiKey=keys[0].value;assert.ok(typeof apiKey==='string'&&apiKey.trim()&&!/[\r\n]/.test(apiKey));
await writeFile(new URL(id+'.request.json',out),raw,{flag:'wx'});
const attempt={id,customRequest:report.baseline+report.attempts.length+1,state:'reserved',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw)};
report.attempts.push(attempt);report.cumulative++;report.remaining--;const save=()=>writeFile(ledger,JSON.stringify(report,null,2)+'\n');await save();console.log(JSON.stringify({event:'send',...attempt}));
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
report.closed=attempt.state!=='completed'||id==='02';report.stopReason=attempt.state!=='completed'?attempt.state:id==='02'?'two-authorized-narrations-completed':'awaiting-manual-next-request';
await save();console.log(JSON.stringify({event:'received',...attempt,remaining:report.remaining,closed:report.closed}));
