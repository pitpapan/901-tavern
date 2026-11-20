// Offline reconstruction from the two retained actual requests; no browser capture claim.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const campaign=resolve('TRPG outputs'),base=new URL('./',import.meta.url),previous=new URL('../conditions-20261113/',base);
const source=pathToFileURL(resolve(campaign,'work/rules_engine/gm_runtime/story-knowledge.mjs'));
const {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION:instruction}=await import(source);
const {STORY_COMMUNICATION_INSTRUCTION:oldInstruction}=await import(new URL('package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs',previous));
const {CLINIC_KNOWLEDGE_CATALOG:catalog}=await import(pathToFileURL(resolve(campaign,'work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs')));
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const oldPrepared=await read(new URL('prepared.json',previous)),oldRun=await read(new URL('live-20261113/run.json',previous));
assert.equal(oldRun.cumulative,254);assert.equal(oldRun.closed,true);
const regression=await read(new URL('regression-summary.json',base));assert.equal(regression.exitCode,0);assert.equal(regression.failures,0);
assert.ok(instruction.startsWith(oldInstruction));const addition=instruction.slice(oldInstruction.length);assert.ok(addition.length>0);
const currentModule=await readFile(source,'utf8'),oldModule=await readFile(new URL('package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs',previous),'utf8');
// Packaging rewrites imports; compare implementation from the first shared declaration onward.
const implementation=s=>s.slice(s.indexOf('const same='));
const segments=s=>implementation(s).split(/export const STORY_COMMUNICATION_INSTRUCTION=[\s\S]*?;\r?\n\r?\nexport async function generateStoryWithKnowledge/);
assert.deepEqual(segments(currentModule),segments(oldModule),'Only the instruction may change.');
const cases=[];
for(const item of oldPrepared.cases){
 const raw=await readFile(new URL('live-20261113/'+item.id+'.request.json',previous),'utf8');assert.equal(sha(raw),item.request.sha256);
 const original=JSON.parse(raw),request=structuredClone(original),last=request.messages.at(-1),marker='【901逐角色知情投影】\n';
 const rows=(await readFile(new URL(item.id+'.captured.chat.jsonl',previous),'utf8')).trim().split(/\r?\n/).map(JSON.parse),chat=rows.slice(1);
 const variables=chat.at(-1).variables[chat.at(-1).swipe_id??0],chatId=variables.stat_data['901_rules_poc'].chatId,before=JSON.stringify(rows);
 const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 const oldContext=JSON.parse(last.content.split(marker)[1].split('\n')[0]);assert.deepEqual(k.context(),oldContext);
 const markerAt=last.content.indexOf('\n'+marker);assert.ok(markerAt>0);
 const projected=await k.generate({request:{user_input:last.content.slice(0,markerAt)},event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});
 assert.equal(projected.user_input,last.content+addition,'Exact original final input plus general instruction only.');
 last.content=projected.user_input;assert.deepEqual(request.messages.slice(0,-1),original.messages.slice(0,-1));
 assert.deepEqual({...request,messages:undefined},{...original,messages:undefined});assert.equal(JSON.stringify(rows),before);
 const body=JSON.stringify(request);await writeFile(new URL(item.id+'.request.json',base),body,{flag:'wx'});
 cases.push({id:item.id,condition:item.condition,input:item.input,context:oldContext,parentRequestSha256:sha(raw),request:{file:item.id+'.request.json',bytes:Buffer.byteLength(body),sha256:sha(body)},onlyAddedInstruction:true});
}
const protectedFiles=(await read(new URL('../../browser-environment.json',base))).protected;
for(const [path,hash] of Object.entries(protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
await writeFile(new URL('story-knowledge.source.txt',base),currentModule,{flag:'wx'});
const prepared={status:'two-derived-requests-frozen-not-sent',origin:'Previous actual browser requests reconstructed through current generate; not a new browser capture',baseline:254,selectedCallLimit:2,parameters:oldPrepared.parameters,sourceSha256:sha(currentModule),addedInstruction:addition,protectedFiles,regression,cases};
await writeFile(new URL('prepared.json',base),JSON.stringify(prepared,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:prepared.status,sourceSha256:prepared.sourceSha256,addedInstructionBytes:Buffer.byteLength(addition),cases:cases.map(c=>({id:c.id,...c.request})),formalFilesUnchanged:Object.keys(protectedFiles).length,modelCalls:0}));
