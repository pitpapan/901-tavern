// Sequential offline assembly through the existing knowledge projection.
// A new turn is prepared manually only after reading the actual previous response.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),parent=new URL('../',base),id=process.argv[2],order=['01','02'],index=order.indexOf(id);
assert.ok(index>=0);const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const parentPlan=await read(new URL('prepared.json',parent)),origin=new URL('attribution-probe-20261114/live/',parent);
const {createStoryKnowledgeRuntime}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')));
const {CLINIC_KNOWLEDGE_CATALOG:catalog}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs')));
const candidate=await read(new URL('attribution-projection-20261114/verification.json',parent));assert.equal(candidate.greenTests,67);assert.equal(candidate.greenFailures,0);
for(const m of candidate.modules)assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/'+m.file)),m.sha256);
const sourceSha=candidate.modules.find(m=>m.file==='story-knowledge.mjs').sha256,catalogSha=candidate.modules.find(m=>m.file==='clinic-knowledge-catalog.mjs').sha256;
let plan,rows,previousRaw,previousResponseRaw,previousContent,previousInput,previousCapture;
if(index===0){
 const run=await read(new URL('run.json',origin));assert.equal(run.cumulative,261);assert.equal(run.closed,true);
 plan={status:'sequential-pending-retelling',authorization:'2026-11-14 用户明确允许新增2次叙事，验证已实现的归属纠正投影，承接custom261核对新增核实方式与披露范围，失败即停、不重试',baseline:261,limit:2,parameters:parentPlan.parameters,sourceSha256:sourceSha,catalogSha256:catalogSha,protectedFiles:parentPlan.protectedFiles,cases:[]};
 const originPlan=await read(new URL('../prepared.json',origin));
 rows=(await readFile(new URL('../01.ready.seed.jsonl',origin),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
 previousRaw=await readFile(new URL('01.request.json',origin),'utf8');previousInput=originPlan.cases.find(c=>c.id==='01').input;
 previousResponseRaw=await readFile(new URL('01.raw-response.txt',origin),'utf8');previousContent=await readFile(new URL('01.content.txt',origin),'utf8');previousCapture=await read(new URL('01.response.json',origin));
 assert.equal(sha(previousRaw),originPlan.cases.find(c=>c.id==='01').request.sha256);
 const previousVariables=structuredClone(rows.at(-1).variables[rows.at(-1).swipe_id??0]);
 rows.push({name:'布莱特',is_user:false,is_system:false,mes:previousContent,swipe_id:0,variables:[previousVariables],extra:{nonCanon:true,actualResponseId:JSON.parse(previousResponseRaw).id}});
}else{
 plan=await read(new URL('prepared.json',base));const prev=order[index-1],run=await read(new URL('live/run.json',base));
 assert.equal(run.closed,false);assert.equal(run.attempts.length,index);assert.ok(run.attempts.every(a=>a.state==='completed'));
 previousRaw=await readFile(new URL('live/'+prev+'.request.json',base),'utf8');previousInput=plan.cases.find(c=>c.id===prev).input;
 previousResponseRaw=await readFile(new URL('live/'+prev+'.raw-response.txt',base),'utf8');previousContent=await readFile(new URL('live/'+prev+'.content.txt',base),'utf8');previousCapture=await read(new URL('live/'+prev+'.response.json',base));
 rows=(await readFile(new URL(prev+'.ready.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
 const variables=structuredClone(rows.at(-1).variables[rows.at(-1).swipe_id??0]);
 rows.push({name:'布莱特',is_user:false,is_system:false,mes:previousContent,swipe_id:0,variables:[variables],extra:{nonCanon:true,actualResponseId:JSON.parse(previousResponseRaw).id}});
}
assert.equal(plan.cases.length,index);assert.equal(previousCapture.status,200);assert.equal(previousCapture.bodyComplete,true);
assert.equal(sha(previousResponseRaw),previousCapture.responseBodySha256BeforePrivacyRedaction);
assert.equal(JSON.parse(previousResponseRaw).choices[0].message.content,previousContent);assert.equal(JSON.parse(previousResponseRaw).choices[0].finish_reason,'stop');
const footer='\n（桌外隔离验收，非正式剧情：承接前文，写布莱特的回应；可以回应在场同伴，不替御临风新增对白、心理或决定。）';
const input=(await readFile(new URL(id+'.input.txt',base),'utf8')).trim()+footer;
const variables=structuredClone(rows.at(-1).variables[rows.at(-1).swipe_id??0]);
rows.push({name:'御临风',is_user:true,is_system:false,mes:input,swipe_id:0,variables:[variables],extra:{nonCanon:true}});
const before=JSON.stringify(rows),chat=rows.slice(1),chatId=variables.stat_data['901_rules_poc'].chatId;
const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
const expected=parentPlan.cases.find(c=>c.id==='pending').context;assert.deepEqual(k.context(),expected);
const previous=JSON.parse(previousRaw),request=structuredClone(previous),marker='\n【901逐角色知情投影】\n';
assert.equal(previous.messages.at(-3).content,previousInput);assert.equal(previous.messages.at(-2).role,'system');
const prefix=previous.messages.at(-1).content.split(marker)[0];assert.ok(prefix.startsWith('玩家行动：'+previousInput));
const projected=await k.generate({request:{user_input:'玩家行动：'+input+prefix.slice(('玩家行动：'+previousInput).length)},event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});
request.messages.splice(request.messages.length-2,0,{role:'assistant',content:previousContent},{role:'user',content:input});request.messages.at(-1).content=projected.user_input;
request.messages=k.projectMessages(request.messages);
assert.deepEqual(request.messages.slice(0,previous.messages.length-2),k.projectMessages(previous.messages.slice(0,-2)));
const notes=catalog.rejectedNarration.filter(s=>s.annotation);
for(const note of notes){const matching=request.messages.filter(m=>m.role==='assistant'&&m.content.includes(note.message));assert.equal(matching.length,1);assert.equal(matching[0].content,note.message+'\n'+note.annotation);}
assert.deepEqual(k.projectMessages(request.messages),request.messages);
assert.deepEqual({...request,messages:undefined},{...previous,messages:undefined});assert.equal(JSON.stringify(rows),before);
const nextSuffix=request.messages.at(-1).content.split(marker)[1],oldSuffix=previous.messages.at(-1).content.split(marker)[1];
if(index===0)assert.ok(nextSuffix.startsWith(oldSuffix),'Only the implemented general attribution instruction is appended.');else assert.equal(nextSuffix,oldSuffix);
const raw=JSON.stringify(request);await writeFile(new URL(id+'.request.json',base),raw,{flag:'wx'});await writeFile(new URL(id+'.ready.seed.jsonl',base),rows.map(JSON.stringify).join('\n')+'\n',{flag:'wx'});
const item={id,input,context:expected,previousResponseId:JSON.parse(previousResponseRaw).id,previousContentSha256:sha(previousContent),previousRawResponseSha256:sha(previousResponseRaw),previousRequestSha256:sha(previousRaw),request:{file:id+'.request.json',bytes:Buffer.byteLength(raw),sha256:sha(raw)},parametersUnchanged:true,knowledgeUnchanged:true,reviewedAnnotations:catalog.rejectedNarration.filter(s=>s.annotation).map(s=>s.messageId),newKnowledgeReceipts:[],assembly:'Derived using actual previous response plus current user follow-up and existing generate/projectMessages; not a new browser capture'};
plan.cases.push(item);await writeFile(new URL('prepared.json',base),JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({id,...item.request,previousResponseId:item.previousResponseId,knowledgeCounts:expected.actorKnowledge.map(a=>a.facts.length),modelCalls:0}));
