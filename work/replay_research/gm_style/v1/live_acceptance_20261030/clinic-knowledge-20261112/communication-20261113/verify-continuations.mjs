// Offline evidence checks only. No transport import and no semantic auto-review.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from './package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('continuations/',import.meta.url),out=new URL('live-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const plan=await read(new URL('prepared.json',base)),run=await read(new URL('run.json',out));
assert.deepEqual(run.attempts.map(a=>a.id),['A1','A2','B1','B2']);assert.equal(run.cumulative,252);assert.equal(run.remaining,0);assert.equal(run.closed,true);
assert.equal(run.classificationCalls,0);assert.equal(run.retries,0);assert.equal(run.deployed,false);assert.equal(run.formalStoryWritten,false);
const historical=await read(new URL('../../live-20261113/run.json',base));assert.equal(historical.cumulative,248);assert.equal(historical.remaining,0);
const results=[],transcript=[];
for(const chain of plan.chains){
 const first=await read(new URL(chain.id+'.first.request.json',base)),second=await read(new URL(chain.id+'.second.request.json',base));
 const prior=await readFile(new URL('../../live-20261113/'+chain.prior+'.content.txt',base),'utf8');
 assert.equal(prior,chain.precedingResponse.content);assert.ok(first.messages.some(m=>m.role==='assistant'&&m.content===prior));
 assert.deepEqual({...first,messages:[]},{...second,messages:[]});
 assert.deepEqual(first.messages.slice(0,-2),second.messages.slice(0,first.messages.length-2));
 assert.deepEqual(first.messages.at(-2),second.messages.at(-2));
 transcript.push('链 '+chain.id+'：前轮真实回复（'+chain.prior+'）\n'+prior);
 const readyRaw=await readFile(new URL(chain.readySeed.file,base),'utf8');assert.equal(sha(readyRaw),chain.readySeed.sha256);
 const ready=readyRaw.trim().split(/\r?\n/).map(s=>JSON.parse(s));
 const seed=(await readFile(new URL(chain.id+'.second.ready.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));
 assert.deepEqual(seed.slice(0,ready.length),ready,'All memory tables and retained source rows preserved.');
 const firstContent=await readFile(new URL(chain.id+'1.content.txt',out),'utf8');
 const preparation=await read(new URL(chain.id+'.second.prepared.json',base)),firstCapture=await read(new URL(chain.id+'1.response.json',out)),secondCapture=await read(new URL(chain.id+'2.response.json',out));
 assert.ok(Date.parse(preparation.preparedAt)>Date.parse(firstCapture.finishedAt));
 assert.ok(Date.parse(secondCapture.startedAt)>Date.parse(preparation.preparedAt));
 assert.equal(seed.at(-2).mes,firstContent);assert.deepEqual(second.messages[first.messages.length-2],{role:'assistant',content:firstContent});
 for(const round of [1,2]){
  const id=chain.id+round,attempt=run.attempts.find(a=>a.id===id),raw=await readFile(new URL(id+'.request.json',out));
  const frozen=await readFile(new URL(chain.id+(round===1?'.first':'.second')+'.request.json',base));assert.deepEqual(raw,frozen);
  assert.equal(sha(raw),attempt.requestSha256);assert.equal(raw.length,attempt.requestBytes);
  const responseRaw=await readFile(new URL(id+'.raw-response.txt',out)),response=JSON.parse(responseRaw),capture=await read(new URL(id+'.response.json',out));
  assert.equal(capture.status,200);assert.equal(capture.bodyComplete,true);assert.equal(attempt.state,'completed');
  assert.equal(response.choices[0].finish_reason,'stop');assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);
  assert.equal(responseRaw.length,capture.responseBytes);assert.equal(responseRaw.toString('utf8'),capture.responseText);
  const content=await readFile(new URL(id+'.content.txt',out),'utf8');assert.equal(content,response.choices[0].message.content);
  const request=JSON.parse(raw),projection=JSON.parse(request.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);
  assert.deepEqual(projection,chain.context);assert.equal(request.messages[0].content,first.messages[0].content);
  transcript.push(id+' 玩家输入\n'+request.messages.at(-3).content+'\n\n'+id+' 完整模型回复\n'+content);
  results.push({id,requestBytes:raw.length,requestSha256:sha(raw),rawResponseBytes:responseRaw.length,rawResponseSha256:sha(responseRaw),rawResponseUnmodified:true,exactContentSaved:true,parametersUnchanged:true,knowledgeCounts:projection.actorKnowledge.map(a=>a.facts.length),originalMemoryAndStylePreserved:true});
 }
 const last=seed.at(-1),variables=structuredClone(last.variables[last.swipe_id??0]);
 const final=await readFile(new URL(chain.id+'2.content.txt',out),'utf8');
 seed.push({name:ready.at(-1).name,is_user:false,is_system:false,mes:final,swipe_id:0,variables:[variables],extra:{nonCanon:true,actualResponseId:run.attempts.find(a=>a.id===chain.id+'2').responseId}});
 const chat=seed.slice(1),chatId=variables.stat_data['901_rules_poc'].chatId;
 const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 assert.deepEqual(k.context(),chain.context,'No controlled proposition was actually disclosed, so no new knowledge receipt is invented.');
 await writeFile(new URL(chain.id+'.completed.seed.jsonl',base),seed.map(s=>JSON.stringify(s)).join('\n')+'\n');
}
const protectedFiles=(await read(new URL('../../browser-environment.json',base))).protected;
for(const [path,hash] of Object.entries(protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
const verification={status:'offline-evidence-checks-passed',checkedAt:new Date().toISOString(),newModelCalls:4,cumulative:252,remaining:0,classificationModelCalls:0,retries:0,protectedFilesUnchanged:Object.keys(protectedFiles).length,exactPreviousResponsesInNextRequests:true,secondRequestsBuiltAfterActualFirstResponses:true,newKnowledgeReceipts:0,completedSeedsNonCanon:true,productRegressionRerun:false,priorProductRegression:{tests:135,note:'Historical record, not rerun in this narration-only task.'},results};
await writeFile(new URL('verification.json',out),JSON.stringify(verification,null,2)+'\n');
await writeFile(new URL('complete-outputs.txt',out),transcript.join('\n\n────────────────\n\n')+'\n');
console.log(JSON.stringify(verification));
