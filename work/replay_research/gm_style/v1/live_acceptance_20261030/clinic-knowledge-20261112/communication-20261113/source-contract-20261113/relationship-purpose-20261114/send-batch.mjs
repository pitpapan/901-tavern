// One authorized request per invocation. Reuse transport only, never review routes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const base=new URL('./',import.meta.url),batch=new URL('batch/',base),live=new URL('live/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const [mode,id]=process.argv.slice(2),plan=await read(new URL('prepared.json',batch)),baseline=await read(new URL('baseline.json',base));
const order=[...plan.cases.map(c=>c.id),...plan.followups.map(c=>c.id)];
assert.ok(['--preflight','--send'].includes(mode));assert.ok(order.includes(id));
const job=plan.cases.find(c=>c.id===id)??await read(new URL(id+'.prepared.json',batch));
const raw=await readFile(new URL(job.request.file,batch),'utf8'),request=JSON.parse(raw);
assert.equal(sha(raw),job.request.sha256);assert.equal(Buffer.byteLength(raw),job.request.bytes);
assert.deepEqual({...request,messages:undefined},{...plan.parameters,messages:undefined});
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');
assert.equal(settings.custom_model,request.model);assert.equal(settings.custom_prompt_post_processing,'merge_tools');
assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
const local=await read(new URL('local-verification.json',base));
for(const [path,hash] of Object.entries(local.sourceFiles))assert.equal(sha(await readFile('TRPG outputs/'+path)),hash,path);
if(mode==='--preflight'){
 for(const [path,hash] of Object.entries(baseline.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
 for(const c of plan.cases){const b=await readFile(new URL(c.request.file,batch));assert.equal(sha(b),c.request.sha256);assert.equal(b.length,c.request.bytes);}
 console.log(JSON.stringify({status:'frozen-batch-preflight-passed',id,bytes:job.request.bytes,endpoint:plan.endpoint,credentialsRead:false,modelCalls:0}));process.exit(0);
}
await mkdir(live,{recursive:true});const ledger=new URL('run.json',live);let report;
if(id===order[0]){
 const prior=await read(new URL('../attribution-choice-20261114/live/run.json',base));
 assert.equal(prior.cumulative,266);assert.equal(prior.closed,true);
 report={authorization:'2026-11-14 用户对完整本地交付后的具体批次申请回复“允许”：最多6次叙事，读取现有密钥向原端点发送四份冻结首轮和两条真实承接后续；原参数、失败即停、不重试，不部署/写正式剧情/恢复自动路线。',
  baseline:266,limit:6,ceiling:272,cumulative:266,remaining:6,attempts:[],classificationCalls:0,classification:'local NO_CHECK fixture only',
  endpoint:plan.endpoint,retries:0,timeoutMs:180000,automaticExtractionApprovalRevision:false,deployed:false,formalStoryWritten:false,closed:false};
 await writeFile(ledger,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}else report=await read(ledger);
assert.equal(report.closed,false);assert.equal(report.attempts.length,order.indexOf(id));assert.ok(report.remaining>0);
assert.ok(report.attempts.every(a=>a.state==='completed'&&a.manualVerdict==='pass'),'Read and assess each actual response before the next send.');
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom?.filter(k=>k.active);
assert.equal(keys?.length,1);const apiKey=keys[0].value;assert.ok(typeof apiKey==='string'&&apiKey.trim()&&!/[\r\n]/.test(apiKey));
await writeFile(new URL(id+'.request.json',live),raw,{flag:'wx'});
const attempt={id,customRequest:report.baseline+report.attempts.length+1,state:'reserved',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw)};
report.attempts.push(attempt);report.cumulative++;report.remaining--;
const save=()=>writeFile(ledger,JSON.stringify(report,null,2)+'\n');await save();console.log(JSON.stringify({event:'send',...attempt}));
const row=await captureSavedReview({rawBody:raw,apiKey,timeoutMs:report.timeoutMs,onUpdate:async r=>writeFile(new URL(id+'.response.json',live),JSON.stringify({...r,kind:'narration'},null,2)+'\n')});
Object.assign(attempt,{state:row.outcome,status:row.status,elapsedMs:row.elapsedMs});
if(row.responseText!==undefined){await writeFile(new URL(id+'.raw-response.txt',live),row.responseText);attempt.rawResponseSha256=sha(row.responseText);attempt.responseBytes=row.responseBytes;attempt.rawUnmodified=attempt.rawResponseSha256===row.responseBodySha256BeforePrivacyRedaction;}
if(row.outcome==='completed'){
 let body;try{body=JSON.parse(row.responseText);}catch{}
 const choice=body?.choices?.[0],content=choice?.message?.content;
 Object.assign(attempt,{finishReason:choice?.finish_reason,responseId:body?.id,responseModel:body?.model,usage:body?.usage});
 if(typeof content!=='string'||!content.trim()||choice.finish_reason!=='stop'||body.error)attempt.state='protocol-error';
 if(typeof content==='string')await writeFile(new URL(id+'.content.txt',live),content);
}
report.closed=attempt.state!=='completed';report.stopReason=report.closed?attempt.state:'awaiting-manual-assessment';
await save();console.log(JSON.stringify({event:'received',...attempt,remaining:report.remaining,closed:report.closed}));
