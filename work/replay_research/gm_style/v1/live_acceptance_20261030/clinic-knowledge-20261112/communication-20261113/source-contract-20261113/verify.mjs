// Byte/state verification only. No semantic judging, transport, or retry.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),live=new URL('live/',base),previous=new URL('../conditions-20261113/live-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const prepared=await read(new URL('prepared.json',base)),run=await read(new URL('run.json',live));
assert.equal(run.closed,true);assert.equal(run.retries,0);assert.equal(run.classificationCalls,0);
assert.equal(run.attempts.length,1);assert.equal(run.cumulative,255);assert.equal(run.attempts[0].state,'transport-error');
const files=await readdir(live);assert.ok(!files.includes('confirmed.request.json'),'Failure must stop the second request.');
const results=[];
for(const item of prepared.cases){
 const raw=await readFile(new URL(item.request.file,base)),body=JSON.parse(raw),parentRaw=await readFile(new URL(item.id+'.request.json',previous)),parent=JSON.parse(parentRaw);
 assert.equal(sha(raw),item.request.sha256);assert.equal(raw.length,item.request.bytes);assert.equal(sha(parentRaw),item.parentRequestSha256);
 assert.equal(body.messages.at(-1).content,parent.messages.at(-1).content+prepared.addedInstruction);
 assert.deepEqual(body.messages.slice(0,-1),parent.messages.slice(0,-1));assert.deepEqual({...body,messages:undefined},{...parent,messages:undefined});
 const context=JSON.parse(body.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);assert.deepEqual(context,item.context);
 results.push({id:item.id,requestBytes:raw.length,requestSha256:sha(raw),onlyGeneralInstructionAdded:true,sourceContexts:context.actorKnowledge.flatMap(a=>a.facts.flatMap(f=>f.sources)).length,attempted:run.attempts.some(a=>a.id===item.id)});
}
assert.deepEqual(await readFile(new URL('pending.request.json',live)),await readFile(new URL('pending.request.json',base)));
const capture=await read(new URL('pending.response.json',live));assert.equal(capture.transportCode,'ENOTFOUND');assert.equal(capture.status,null);assert.equal(capture.bodyComplete,false);assert.equal(capture.responseText,undefined);
assert.ok(!files.includes('pending.raw-response.txt'));assert.ok(!files.includes('pending.content.txt'));
for(const [path,hash] of Object.entries(prepared.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')),prepared.sourceSha256);
assert.equal(sha(await readFile(new URL('story-knowledge.source.txt',base))),prepared.sourceSha256);
const green=await readFile(new URL('offline-green.log',base),'utf8'),red=await readFile(new URL('offline-red.log',base),'utf8');
assert.match(green,/tests 62/);assert.match(green,/pass 62/);assert.match(green,/fail 0/);assert.match(red,/fail 1/);assert.match(red,/AssertionError.*来源关系未明确关联/);
const result={status:'offline-passed-live-stopped-on-dns-error',offlineTests:62,offlineFailures:0,requestAttempts:1,completedModelResponses:0,modelInvocationConfirmed:false,cumulativeRequestAttempts:255,selectedRoundLimit:2,unsentPlannedRequests:1,retries:0,classificationModelCalls:0,sourceContextsVerified:results.reduce((n,r)=>n+r.sourceContexts,0),formalProtectedFilesUnchanged:Object.keys(prepared.protectedFiles).length,productModulesChanged:1,sourceSha256:prepared.sourceSha256,response:{status:null,transportCode:capture.transportCode,elapsedMs:capture.elapsedMs,rawResponseAvailable:false},deployed:false,formalStoryWritten:false,automaticRoutesResumed:false,results};
await writeFile(new URL('verification.json',base),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
