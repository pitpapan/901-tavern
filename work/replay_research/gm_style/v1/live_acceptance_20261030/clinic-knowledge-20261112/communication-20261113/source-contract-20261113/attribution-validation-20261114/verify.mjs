// Bounded offline chain/integrity checks. Semantic judgments remain manual.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),live=new URL('live/',base),origin=new URL('../attribution-probe-20261114/live/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const plan=await read(new URL('prepared.json',base)),run=await read(new URL('run.json',live)),order=['01','02'];
assert.equal(run.closed,true);assert.equal(run.baseline,261);assert.equal(run.cumulative,263);assert.equal(run.remaining,0);assert.equal(run.retries,0);assert.equal(run.classificationCalls,0);
assert.deepEqual(run.attempts.map(a=>a.id),order);
const parentPlan=await read(new URL('../prepared.json',base)),originalContext=parentPlan.cases.find(c=>c.id==='pending').context;
const originalRows=(await readFile(new URL('../../conditions-20261113/pending.captured.chat.jsonl',base),'utf8')).trim().split(/\r?\n/).map(JSON.parse),originalVariables=originalRows.at(-1).variables[originalRows.at(-1).swipe_id??0];
let previousRaw=await readFile(new URL('01.request.json',origin)),previousContent=await readFile(new URL('01.content.txt',origin),'utf8'),previousResponse=await readFile(new URL('01.raw-response.txt',origin));
const {CLINIC_KNOWLEDGE_CATALOG:catalog}=await import(new URL('../../../../../../../../rules_engine/gm_runtime/clinic-knowledge-catalog.mjs',base));
const notes=catalog.rejectedNarration.filter(s=>s.annotation);assert.equal(notes.length,2);
const unannotate=m=>({...m,content:notes.reduce((text,n)=>text.split('\n'+n.annotation).join(''),m.content)});
const results=[],transcript=[];
for(const [index,id] of order.entries()){
 const item=plan.cases[index],attempt=run.attempts[index],raw=await readFile(new URL(id+'.request.json',live)),request=JSON.parse(raw),previous=JSON.parse(previousRaw);
 assert.equal(item.id,id);assert.equal(attempt.state,'completed');assert.deepEqual(raw,await readFile(new URL(id+'.request.json',base)));
 assert.equal(raw.length,item.request.bytes);assert.equal(sha(raw),item.request.sha256);assert.equal(sha(raw),attempt.requestSha256);
 assert.equal(sha(previousRaw),item.previousRequestSha256);assert.equal(sha(previousContent),item.previousContentSha256);assert.equal(sha(previousResponse),item.previousRawResponseSha256);
 assert.equal(JSON.parse(previousResponse).choices[0].message.content,previousContent);
 assert.equal(request.messages.length,previous.messages.length+2);
 assert.deepEqual(request.messages.slice(0,previous.messages.length-2).map(unannotate),previous.messages.slice(0,-2).map(unannotate));
 for(const note of notes){const matching=request.messages.filter(m=>m.role==='assistant'&&m.content.includes(note.message));assert.equal(matching.length,1);assert.equal(matching[0].content,note.message+'\n'+note.annotation);}
 assert.deepEqual(unannotate(request.messages.at(-4)),{role:'assistant',content:previousContent});assert.deepEqual(request.messages.at(-3),{role:'user',content:item.input});
 assert.deepEqual(request.messages.at(-2),previous.messages.at(-2));assert.deepEqual({...request,messages:undefined},{...plan.parameters,messages:undefined});
 const marker='\n【901逐角色知情投影】\n';const suffix=request.messages.at(-1).content.split(marker)[1],oldSuffix=previous.messages.at(-1).content.split(marker)[1];if(index===0)assert.ok(suffix.startsWith(oldSuffix));else assert.equal(suffix,oldSuffix);
 assert.deepEqual(JSON.parse(request.messages.at(-1).content.split(marker)[1].split('\n')[0]),originalContext);
 const rows=(await readFile(new URL(id+'.ready.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
 assert.deepEqual(rows.at(-1).variables[0],originalVariables);assert.equal(rows.at(-2).mes,previousContent);assert.equal(rows.at(-1).mes,item.input);
 const responseRaw=await readFile(new URL(id+'.raw-response.txt',live)),capture=await read(new URL(id+'.response.json',live)),response=JSON.parse(responseRaw),content=await readFile(new URL(id+'.content.txt',live),'utf8');
 assert.equal(capture.status,200);assert.equal(capture.bodyComplete,true);assert.equal(responseRaw.toString('utf8'),capture.responseText);assert.equal(responseRaw.length,capture.responseBytes);
 assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);assert.equal(sha(responseRaw),attempt.rawResponseSha256);assert.equal(response.choices[0].finish_reason,'stop');assert.equal(response.choices[0].message.content,content);
 results.push({id,customRequest:attempt.customRequest,requestBytes:raw.length,requestSha256:sha(raw),previousResponseId:item.previousResponseId,previousActualReplyPreserved:true,parametersAndKnowledgeUnchanged:true,reviewedAnnotationsPresentOnce:2,originalHistoryPreserved:true,status:200,finishReason:'stop',responseBytes:responseRaw.length,rawResponseSha256:sha(responseRaw),rawResponseUnmodified:true});
 transcript.push('第'+(index+1)+'轮 / custom'+attempt.customRequest+'\n玩家追问：\n'+item.input+'\n\n完整模型回复：\n'+content);
 previousRaw=raw;previousContent=content;previousResponse=responseRaw;
}
for(const [path,hash] of Object.entries(plan.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')),plan.sourceSha256);
const priorRun=await read(new URL('run.json',origin));assert.equal(priorRun.cumulative,261);assert.equal(priorRun.closed,true);
assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs')),plan.catalogSha256);
const result={status:'two-attribution-projection-narrations-verified',modelCalls:2,cumulativeRequestAttempts:263,remaining:0,retries:0,classificationModelCalls:0,knowledgeCounts:[0,1,0],newKnowledgeReceipts:0,sourceContextUnchanged:true,productChanges:0,productRegressionsRerun:false,formalProtectedFilesUnchanged:Object.keys(plan.protectedFiles).length,deployed:false,formalStoryWritten:false,automaticRoutesResumed:false,results};
await writeFile(new URL('verification.json',base),JSON.stringify(result,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',base),transcript.join('\n\n────────────────\n\n')+'\n');console.log(JSON.stringify(result));
