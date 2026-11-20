// Offline verification of the authorized two resends; no transport or semantic route.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),out=new URL('network-retest-20261113/',base),live=new URL('live/',out);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const prepared=await read(new URL('prepared.json',base)),run=await read(new URL('run.json',live));
assert.equal(run.closed,true);assert.equal(run.baseline,255);assert.equal(run.cumulative,257);assert.equal(run.remaining,0);
assert.equal(run.attempts.length,2);assert.equal(run.retries,0);assert.equal(run.classificationCalls,0);
assert.deepEqual(run.attempts.map(a=>a.id),['pending','confirmed']);
const restricted=await read(new URL('network-restricted.json',out)),escalated=await read(new URL('network-escalated.json',out));
assert.equal(restricted.node,escalated.node);assert.equal(restricted.endpoint,escalated.endpoint);
assert.equal(restricted.dns.code,'ENOTFOUND');assert.equal(restricted.https.code,'ENOTFOUND');
assert.equal(escalated.dns.ok,true);assert.equal(escalated.https.reachable,true);assert.equal(escalated.https.status,404);
const results=[],transcript=[];
for(const attempt of run.attempts){
 const item=prepared.cases.find(c=>c.id===attempt.id),raw=await readFile(new URL(attempt.id+'.request.json',live));
 assert.deepEqual(raw,await readFile(new URL(item.request.file,base)));assert.equal(sha(raw),item.request.sha256);assert.equal(sha(raw),attempt.requestSha256);assert.equal(raw.length,item.request.bytes);
 const request=JSON.parse(raw);assert.deepEqual({...request,messages:undefined},{...prepared.parameters,messages:undefined});
 assert.deepEqual(JSON.parse(request.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]),item.context);
 const capture=await read(new URL(attempt.id+'.response.json',live)),responseRaw=await readFile(new URL(attempt.id+'.raw-response.txt',live)),response=JSON.parse(responseRaw),content=await readFile(new URL(attempt.id+'.content.txt',live),'utf8');
 assert.equal(attempt.state,'completed');assert.equal(capture.status,200);assert.equal(capture.bodyComplete,true);
 assert.equal(responseRaw.toString('utf8'),capture.responseText);assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);assert.equal(sha(responseRaw),attempt.rawResponseSha256);assert.equal(responseRaw.length,capture.responseBytes);
 assert.equal(response.choices[0].finish_reason,'stop');assert.equal(response.choices[0].message.content,content);assert.ok(content.trim());
 results.push({id:attempt.id,customRequest:attempt.customRequest,requestBytes:raw.length,requestSha256:sha(raw),requestUnchanged:true,status:capture.status,elapsedMs:capture.elapsedMs,rawResponseBytes:responseRaw.length,rawResponseSha256:sha(responseRaw),rawResponseUnmodified:true,finishReason:'stop'});
 transcript.push(item.id+' / custom'+attempt.customRequest+'\n隔离条件：'+item.condition+'\n\n玩家输入：\n'+item.input+'\n\n完整模型回复：\n'+content);
}
for(const [path,hash] of Object.entries(prepared.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')),prepared.sourceSha256);
const previous=await read(new URL('live/run.json',base));assert.equal(previous.cumulative,255);assert.equal(previous.closed,true);assert.equal(previous.attempts.length,1);assert.equal(previous.attempts[0].state,'transport-error');
const result={status:'two-unchanged-requests-and-complete-responses-verified',networkDiagnosis:'Same Node/host/probe fails ENOTFOUND when restricted and succeeds with escalated execution; strongly supports runtime network restriction, not a demonstrated upstream outage.',networkProbeModelCalls:0,modelCalls:2,cumulativeRequestAttempts:257,remaining:0,retries:0,classificationModelCalls:0,productChanges:0,productRegressionsRerun:false,formalProtectedFilesUnchanged:Object.keys(prepared.protectedFiles).length,deployed:false,formalStoryWritten:false,automaticRoutesResumed:false,results};
await writeFile(new URL('verification.json',out),JSON.stringify(result,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',out),transcript.join('\n\n────────────────\n\n')+'\n');console.log(JSON.stringify(result));
