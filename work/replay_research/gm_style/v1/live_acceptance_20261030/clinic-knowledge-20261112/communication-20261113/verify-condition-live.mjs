// Offline byte/provenance checks only; semantic assessment remains manual.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('conditions-20261113/',import.meta.url),out=new URL('live-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const prepared=await read(new URL('prepared.json',base)),run=await read(new URL('run.json',out));
assert.equal(run.closed,true);assert.equal(run.baseline,252);assert.equal(run.limit,2);assert.ok(run.attempts.length<=2);
assert.equal(run.cumulative,252+run.attempts.length);assert.equal(run.remaining,2-run.attempts.length);assert.equal(run.retries,0);assert.equal(run.classificationCalls,0);
const results=[],transcript=[];
for(const attempt of run.attempts){
 const row=prepared.cases.find(c=>c.id===attempt.id),raw=await readFile(new URL(attempt.id+'.request.json',out));
 assert.deepEqual(raw,await readFile(new URL(row.request.file,base)));assert.equal(sha(raw),attempt.requestSha256);assert.equal(sha(raw),row.request.sha256);assert.equal(raw.length,row.request.bytes);
 const request=JSON.parse(raw);assert.deepEqual({...request,messages:undefined},{...prepared.parameters,messages:undefined});
 const context=JSON.parse(request.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);assert.deepEqual(context,row.context);
 const capture=await read(new URL(attempt.id+'.response.json',out));
 let rawUnmodified=null;
 if(capture.responseText!==undefined){const responseRaw=await readFile(new URL(attempt.id+'.raw-response.txt',out));assert.equal(responseRaw.toString('utf8'),capture.responseText);rawUnmodified=sha(responseRaw)===capture.responseBodySha256BeforePrivacyRedaction;assert.equal(rawUnmodified,true);assert.equal(responseRaw.length,capture.responseBytes);}
 if(attempt.state==='completed'){
  assert.equal(capture.status,200);assert.equal(capture.bodyComplete,true);
  const response=JSON.parse(capture.responseText),content=await readFile(new URL(attempt.id+'.content.txt',out),'utf8');assert.equal(content,response.choices[0].message.content);assert.equal(response.choices[0].finish_reason,'stop');
  transcript.push(attempt.id+'\n隔离条件：'+row.condition+'\n\n玩家输入：\n'+row.input+'\n\n完整模型回复：\n'+content);
 }
 results.push({id:attempt.id,state:attempt.state,requestBytes:raw.length,requestSha256:sha(raw),frozenRequestUnchanged:true,rawResponseUnmodified:rawUnmodified,sourceContextUnchanged:true});
}
const protectedFiles=(await read(new URL('../../browser-environment.json',base))).protected;
for(const [path,hash] of Object.entries(protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
const previous=await read(new URL('../continuations/live-20261113/run.json',base));assert.equal(previous.cumulative,252);assert.equal(previous.remaining,0);
const result={status:'saved-request-response-integrity-verified',modelCalls:run.attempts.length,cumulative:run.cumulative,remaining:run.remaining,retries:0,classificationModelCalls:0,formalProtectedFilesUnchanged:Object.keys(protectedFiles).length,productChangesThisTask:0,productRegressionsRerun:false,deployed:false,formalStoryWritten:false,results};
await writeFile(new URL('verification.json',out),JSON.stringify(result,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',out),transcript.join('\n\n────────────────\n\n')+'\n');
console.log(JSON.stringify(result));
