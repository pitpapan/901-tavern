// Bounded local experiment runner; reuse existing transport, no automatic retries.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const L=new URL('./',import.meta.url),E=new URL('../../',L);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const put=(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const sha=x=>createHash('sha256').update(x).digest('hex');
const [mode,id,requestFile,...notes]=process.argv.slice(2);
const ledgerUrl=new URL('run.json',L),ledger=await read(ledgerUrl),approval=await read(new URL('authorization.json',L));
assert.equal(approval.userText,'接回真实分类：普通对白和明确机械动作，两轮4次上限');assert.equal(ledger.limit,4);
assert.ok(['dialogue-classification','dialogue-narration','mechanical-classification','mechanical-narration'].includes(id));
const kind=id.endsWith('-classification')?'classification':'narration';
if(mode==='--mark'){
 const a=ledger.attempts.at(-1);assert.equal(a.id,id);assert.ok(['pass','fail','mixed','uncovered'].includes(requestFile));
 a.manualVerdict=requestFile;a.assessment=notes.join(' ');await put(ledgerUrl,ledger);console.log(JSON.stringify({id,verdict:requestFile,used:ledger.used,remaining:ledger.remaining,cumulative:ledger.cumulative}));process.exit(0);
}
assert.ok(['--preflight','--send'].includes(mode));
assert.equal(ledger.closed,false);assert.ok(ledger.remaining>0);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
assert.ok(!ledger.attempts.some(a=>a.id===id));
const raw=await readFile(resolve(requestFile),'utf8'),request=JSON.parse(raw),prepared=await read(new URL('prepared-batch.json',E));
assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>k!=='messages')),prepared.parameters);
assert.ok(!ledger.attempts.some(a=>a.requestSha256===sha(raw)),'No identical blind retry');
assert.ok(raw.includes('【901逐角色知情投影】')&&raw.includes('雪老'));
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
const oldLedger=new URL('../model-verification-20261116/run.json',L);
assert.equal(sha(await readFile(oldLedger)),approval.previousLedgerSha256);
const heldPrefix=resolve(requestFile).slice(0,-'.request.json'.length);
const capture=await read(heldPrefix+'.capture.json');assert.equal(capture.kind,kind);assert.equal(capture.classificationFixture,false);assert.equal(capture.browserUpstreamCalls,0);
console.log(JSON.stringify({preflight:true,id,bytes:Buffer.byteLength(raw),sha256:sha(raw),remaining:ledger.remaining,cumulative:ledger.cumulative,credentialsRead:false}));
if(mode==='--preflight')process.exit(0);
assert.equal(approval.destination,'https://cdn.sta1n.cn/v1/chat/completions');assert.equal(approval.maximumCalls,4);
await writeFile(new URL(id+'.request.json',L),raw,{flag:'wx'});
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(x=>x.active);assert.equal(keys.length,1);
const a={id,kind,customRequest:ledger.cumulative+1,state:'reserved',purpose:notes.join(' ')||'Continuous isolated story narration',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),startedAt:new Date().toISOString()};
ledger.attempts.push(a);ledger.used++;ledger.remaining--;ledger.cumulative++;await put(ledgerUrl,ledger);
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const response=await captureSavedReview({rawBody:raw,apiKey:keys[0].value,timeoutMs:180000,onUpdate:r=>put(new URL(id+'.response.json',L),{...r,kind})});
Object.assign(a,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
if(response.responseText!==undefined){await writeFile(new URL(id+'.raw-response.txt',L),response.responseText,{flag:'wx'});a.rawResponseSha256=sha(response.responseText);a.rawUnmodified=a.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
if(response.outcome==='completed'){
 let body;try{body=JSON.parse(response.responseText);}catch{}
 const c=body?.choices?.[0];a.finishReason=c?.finish_reason;a.responseModel=body?.model;a.usage=body?.usage;
 if(typeof c?.message?.content!=='string'||!c.message.content.trim()||c.finish_reason!=='stop')a.state='protocol-error';
 else await writeFile(new URL(id+'.content.txt',L),c.message.content,{flag:'wx'});
}
if(a.state==='completed'&&a.rawUnmodified&&a.finishReason==='stop'){
 assert.equal(await readFile(heldPrefix+'.request.json','utf8'),raw);
 await writeFile(heldPrefix+'.sent-request.json',raw,{flag:'wx'});
 await writeFile(heldPrefix+'.raw-response.txt',response.responseText,{flag:'wx'});
 await put(new URL(id+'.relay-proof.json',L),{id,kind,customRequest:a.customRequest,requestSha256:a.requestSha256,rawResponseSha256:a.rawResponseSha256,exactRequestBytes:true,browserUpstreamCalls:0},true);
 await writeFile(heldPrefix+'.release.json',JSON.stringify({rawResponse:true,actualResponseFrom:id,externalCalls:0}),{flag:'wx'});a.relayReleased=true;
}
await put(ledgerUrl,ledger);console.log(JSON.stringify({...a,remaining:ledger.remaining,cumulative:ledger.cumulative}));
