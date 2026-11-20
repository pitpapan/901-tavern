// One bounded frozen narration attempt; reuse existing transport and the SAME 200-call ledger.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const E=new URL('./',import.meta.url),I=new URL('../dialogue-increment-live-20261114/integration-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const put=(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const sha=s=>createHash('sha256').update(s).digest('hex');
const [mode,name]=process.argv.slice(2);
assert.ok(['--preflight','--send','--mark'].includes(mode));assert.ok(/^0[123]-(before|received|reopened)\.\d+\.narration$/.test(name));
const prefix=new URL('captures/'+name,E),at=s=>new URL(prefix.href+s);
const ledgerUrl=new URL('iteration-200-20261115/run.json',I),ledger=await read(ledgerUrl);
const auth=await read(new URL('authorization.json',E));
const previous=ledger.attempts.filter(a=>!a.id.startsWith('natural-clinic.'));
assert.equal(previous.length,195);assert.equal(auth.maximumNewAttempts,3);
if(mode==='--mark'){
 const [verdict,...notes]=process.argv.slice(4);assert.ok(['pass','fail','uncovered'].includes(verdict));
 const a=ledger.attempts.at(-1);assert.equal(a.id,'natural-clinic.'+name);
 a.manualVerdict=verdict;a.assessment=notes.join(' ');await put(ledgerUrl,ledger);
 console.log(JSON.stringify({id:a.id,verdict,remaining:ledger.remaining,cumulative:ledger.cumulative}));process.exit(0);
}
const raw=await readFile(at('.request.json'),'utf8'),request=JSON.parse(raw),capture=await read(at('.capture.json'));
assert.equal(capture.kind,'narration');assert.equal(capture.browserUpstreamCalls,0);
assert.equal(capture.endpointUrl,'https://cdn.sta1n.cn/v1/chat/completions');
const params=(await read(new URL('model-batch/plan.json',I))).modelAndParameters;
assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>k!=='messages')),params);
const phase=name.split('.')[0],audit=await read(new URL(phase==='01-before'?'01-before-startup.json':phase==='02-received'?'02-received-received.json':'03-reopened-startup.json',E));
assert.equal(audit.sameSavedRoot,true);assert.equal(audit.dialogueHost.enabled,false);assert.equal(audit.disableResult.status,'disabled');
const expected=phase==='01-before'?0:1;
assert.deepEqual(audit.context.actorKnowledge.map(a=>[a.actorId,a.facts.length]),[['player',0],['bright',expected],['huang',0]]);
assert.equal(Object.keys(audit.knowledge.dialogueBatches??{}).length,0);
const joined=request.messages.map(m=>typeof m.content==='string'?m.content:'').join('\n');
assert.ok(joined.includes('【901逐角色知情投影】'));
assert.ok(joined.includes((await readFile(new URL('player-input.txt',E),'utf8')).trim()));
const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
assert.equal(settings.custom_model,request.model);assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.chat_completion_source,'custom');
assert.ok(!settings.custom_include_body&&!settings.custom_exclude_body&&!settings.custom_include_headers);
assert.ok(ledger.remaining>0);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
assert.ok(!ledger.attempts.some(a=>a.id==='natural-clinic.'+name));
const repeated=ledger.attempts.findLast(a=>a.requestSha256===sha(raw));
// A saved/reopened identical-state comparison is planned, not a failed-input retry.
if(repeated){
 assert.equal(phase,'03-reopened');assert.ok(repeated.id.startsWith('natural-clinic.02-received.'));
 assert.equal(repeated.manualVerdict,'pass');
 const received=await read(new URL('02-received-received.json',E));
 assert.deepEqual(audit.mvuData.stat_data['901_rules_poc'],received.mvuData.stat_data['901_rules_poc']);
}
console.log(JSON.stringify({preflight:true,name,bytes:Buffer.byteLength(raw),sha256:sha(raw),phase,remaining:ledger.remaining,cumulative:ledger.cumulative,credentialsRead:false}));
if(mode==='--preflight')process.exit(0);
// The first attempted execution was rejected before launch. Only a new explicit
// user approval covering these exact payload hashes and destination can unblock sending.
const payloadApproval=await read(new URL('external-payload-approval.json',E));
assert.equal(payloadApproval.approvedByUser,true);
assert.equal(payloadApproval.destination,capture.endpointUrl);
assert.ok(payloadApproval.requestSha256.includes(sha(raw)));
if(ledger.cumulative===531){
 assert.equal(ledger.used,197);assert.equal(ledger.remaining,3);assert.equal(ledger.closed,true);assert.equal(ledger.complete,true);
 await writeFile(new URL('ledger-before.json',E),await readFile(ledgerUrl),{flag:'wx'});
 ledger.continuations??=[];ledger.continuations.push({at:new Date().toISOString(),scope:'natural clinic three-state narration; generic extraction disabled',authorizationFile:fileURLToPath(new URL('authorization.json',E)),originalAllowanceUnchanged:200,startingUsed:197,startingCumulative:531,maximumAdditional:3});
 ledger.closed=false;ledger.complete=false;
}else {assert.equal(ledger.closed,false);assert.equal(ledger.complete,false);}
const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(x=>x.active);assert.equal(keys.length,1);
await writeFile(at('.sent-request.json'),raw,{flag:'wx'});
const a={id:'natural-clinic.'+name,customRequest:ledger.cumulative+1,state:'reserved',purpose:auth.purpose,requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),startedAt:new Date().toISOString(),narration:true,classificationModelCalls:0,extractionCalls:0};
ledger.attempts.push(a);ledger.used++;ledger.cumulative++;ledger.remaining--;await put(ledgerUrl,ledger);
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const response=await captureSavedReview({rawBody:raw,apiKey:keys[0].value,timeoutMs:180000,onUpdate:r=>put(at('.response.json'),{...r,kind:'narration'})});
Object.assign(a,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
if(response.responseText!==undefined){await writeFile(at('.raw-response.txt'),response.responseText,{flag:'wx'});a.rawResponseSha256=sha(response.responseText);a.rawUnmodified=a.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
if(response.outcome==='completed'){
 let body;try{body=JSON.parse(response.responseText);}catch{}
 const c=body?.choices?.[0];a.finishReason=c?.finish_reason;a.responseModel=body?.model;a.usage=body?.usage;
 if(typeof c?.message?.content!=='string'||!c.message.content.trim()||c.finish_reason!=='stop')a.state='protocol-error';
 else await writeFile(at('.content.txt'),c.message.content,{flag:'wx'});
}
await put(ledgerUrl,ledger);
if(a.state==='completed')await put(at('.release.json'),{rawResponse:true,customRequest:a.customRequest});
else await put(at('.release.json'),{stop:true,reason:a.state});
console.log(JSON.stringify({...a,remaining:ledger.remaining,cumulative:ledger.cumulative}));
