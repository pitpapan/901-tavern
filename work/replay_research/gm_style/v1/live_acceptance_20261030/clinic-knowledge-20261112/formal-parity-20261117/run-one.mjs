// Bounded raw-request sender; reuse the original transport. Never auto-retry.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const E=new URL('./',import.meta.url);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const put=(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const sha=x=>createHash('sha256').update(x).digest('hex');
const ledgerUrl=new URL('run.json',E),ledger=await read(ledgerUrl),approval=await read(new URL('authorization.json',E));
const [mode,id,file,...notes]=process.argv.slice(2);
const ids=['before-classification','before-narration','after-classification','after-narration','reopen-classification','reopen-narration'];
assert.ok(ids.includes(id));assert.equal(approval.userReply,'授权最多6次，完成三状态实测');assert.equal(approval.maximumCalls,6);
const persist=async()=>{await put(ledgerUrl,ledger);await put(new URL('call-budget.json',E),ledger);};
if(mode==='--mark'){
 const a=ledger.attempts.at(-1);assert.equal(a.id,id);assert.ok(['pass','fail','mixed','uncovered'].includes(file));
 a.manualVerdict=file;a.assessment=notes.join(' ');await persist();console.log(JSON.stringify({id,verdict:file,used:ledger.used,remaining:ledger.remaining,cumulative:ledger.cumulative}));process.exit(0);
}
assert.ok(['--preflight','--send'].includes(mode));assert.equal(ledger.closed,false);assert.ok(ledger.remaining>0);
assert.equal(ids[ledger.attempts.length],id);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
assert.ok(!ledger.attempts.some(a=>a.id===id));
const kind=id.endsWith('-classification')?'classification':'narration',phase=id.split('-')[0];
const raw=await readFile(resolve(file),'utf8'),request=JSON.parse(raw),prefix=resolve(file).slice(0,-'.request.json'.length);
const capture=await read(prefix+'.capture.json');assert.equal(capture.phase,phase);assert.equal(capture.kind,kind);
assert.equal(capture.classificationFixture,false);assert.equal(capture.browserUpstreamCalls??capture.externalModelCalls,0);assert.equal(capture.requestSha256,sha(raw));
assert.equal(capture.endpoint,approval.destination);assert.equal(request.model,approval.model);
assert.ok(raw.includes('【901逐角色知情投影】')&&raw.includes('雪老'));
const prepared=await read(new URL('request-plan.pre-authorization.json',E));
for(const key of ['model','temperature','top_p','max_tokens'])assert.equal(request[key],prepared.parameters[key]);
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
const prior=new URL('../continuous-play-20261116/framework-reply-recovery-20261116/real-classification-20261116/run.json',E);
assert.equal(sha(await readFile(prior)),approval.priorClosedLedgerSha256);
console.log(JSON.stringify({preflight:true,id,kind,bytes:Buffer.byteLength(raw),sha256:sha(raw),remaining:ledger.remaining,cumulative:ledger.cumulative,credentialsRead:false}));
if(mode==='--preflight')process.exit(0);
assert.equal(approval.destination,'https://cdn.sta1n.cn/v1/chat/completions');
await writeFile(new URL(id+'.request.json',E),raw,{flag:'wx'});
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(x=>x.active);assert.equal(keys.length,1);
const a={id,phase,kind,customRequest:ledger.cumulative+1,state:'reserved',purpose:notes.join(' '),requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),startedAt:new Date().toISOString()};
ledger.attempts.push(a);ledger.used++;ledger.remaining--;ledger.cumulative++;await persist();
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const response=await captureSavedReview({rawBody:raw,apiKey:keys[0].value,timeoutMs:180000,onUpdate:r=>put(new URL(id+'.response.json',E),{...r,kind})});
Object.assign(a,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
if(response.responseText!==undefined){await writeFile(new URL(id+'.raw-response.txt',E),response.responseText,{flag:'wx'});a.rawResponseSha256=sha(response.responseText);a.rawUnmodified=a.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
if(response.outcome==='completed'){
 let body;try{body=JSON.parse(response.responseText);}catch{}
 const c=body?.choices?.[0];a.finishReason=c?.finish_reason;a.responseModel=body?.model;a.usage=body?.usage;
 if(typeof c?.message?.content!=='string'||!c.message.content.trim()||c.finish_reason!=='stop')a.state='protocol-error';
 else await writeFile(new URL(id+'.content.txt',E),c.message.content,{flag:'wx'});
}
if(a.state==='completed'&&a.rawUnmodified&&a.finishReason==='stop'){
 assert.equal(await readFile(prefix+'.request.json','utf8'),raw);
 await writeFile(prefix+'.sent-request.json',raw,{flag:'wx'});
 await put(new URL(id+'.relay-proof.json',E),{id,kind,customRequest:a.customRequest,requestSha256:a.requestSha256,rawResponseSha256:a.rawResponseSha256,exactRequestBytes:true,browserUpstreamCalls:0},true);
 await put(prefix+'.release.json',{requestSha256:a.requestSha256,rawResponse:JSON.parse(response.responseText),actualResponseFrom:id},true);a.relayReleased=true;
}
await persist();console.log(JSON.stringify({...a,remaining:ledger.remaining,cumulative:ledger.cumulative}));
