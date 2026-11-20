// Offline comparison of final browser requests and retained source receipts.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createStoryKnowledgeRuntime} from './conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const out=new URL('conditions-20261113/',import.meta.url),base=new URL('./',import.meta.url);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const plan=await read(new URL('prepared.json',out)),setup=await read(new URL('browser-setup.json',out));assert.equal(plan.status,'two-final-requests-frozen-not-sent');
const prior=await read(new URL('continuations/live-20261113/B2.request.json',base)),priorReply=await readFile(new URL('continuations/live-20261113/B2.content.txt',base),'utf8');
const seedBefore=(await readFile(new URL('continuations/B.completed.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));
const bodies=[],results=[];
for(const row of plan.cases){
 const raw=await readFile(new URL(row.request.file,out)),body=JSON.parse(raw);bodies.push(body);
 assert.equal(sha(raw),row.request.sha256);assert.equal(raw.length,row.request.bytes);assert.equal(row.status,'captured-not-sent');
 assert.deepEqual({...body,messages:undefined},{...plan.parameters,messages:undefined});
 assert.equal(body.messages[0].content,prior.messages[0].content,'Original style, full memory and worldbook payload preserved.');
 for(const m of prior.messages.slice(1,-2))assert.ok(body.messages.some(n=>n.role===m.role&&n.content.includes(m.content)),'Actual prior message retained, including adjacent-role merge.');
 assert.ok(body.messages.some(m=>m.role==='assistant'&&m.content.includes(priorReply)));
 assert.equal(body.messages.at(-3).content,row.input);
 const ctx=JSON.parse(body.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);assert.deepEqual(ctx,row.context);
 const seeds=(await readFile(new URL(row.seed,out),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));
 assert.deepEqual(seeds.slice(0,seedBefore.length),seedBefore,'Do not rewrite the true B-chain text or its memory.');
 const captured=(await readFile(new URL(row.id+'.captured.chat.jsonl',out),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));
 assert.equal(captured.at(-2).mes,row.input);
 assert.ok(captured.at(-1).mes.includes('叙述尚未完成'));
 const chat=captured.slice(1),variables=captured.at(-1).variables[captured.at(-1).swipe_id??0],chatId=variables.stat_data['901_rules_poc'].chatId;
 const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 assert.deepEqual(k.context(),row.context,'Original MVU state reopened after actual UI capture.');
 for(const source of ctx.actorKnowledge[1].facts[0].sources){
  assert.equal(captured[source.sourceAnchor.messageId+1].mes,source.sourceAnchor.text);
  assert.equal(source.sourceAnchor.swipeId,captured[source.sourceAnchor.messageId+1].swipe_id??0);
 }
 const originalPromise=ctx.actorKnowledge[1].facts[0].sources[1];assert.ok(originalPromise.sourceAnchor.text.includes('同一来客向布莱特补充约定'));
 if(row.id==='pending')assert.equal(ctx.actorKnowledge[1].facts[0].sources.length,2);
 else {assert.equal(ctx.actorKnowledge[1].facts[0].sources.length,3);assert.equal(row.receipt.authority,'host-confirmed');assert.deepEqual(row.receipt.recipientIds,['bright']);}
 assert.deepEqual(ctx.actorKnowledge.map(a=>a.facts.length),[0,1,0]);
 for(const c of row.captures){const raw=await readFile(new URL(c.file,out)),capture=JSON.parse(raw);assert.equal(sha(raw),c.sha256);assert.equal(capture.upstreamCalls,0);assert.equal(capture.offline,true);if(c.kind==='narration')assert.deepEqual(capture.requestBody,body);}
 results.push({id:row.id,bytes:raw.length,sha256:sha(raw),state:'captured-not-sent',originalPromiseContextPresent:true,sourceCount:ctx.actorKnowledge[1].facts[0].sources.length,knowledgeCounts:[0,1,0],actualPriorB2Verbatim:true,memoryAndStyleUnchanged:true,actualSavedStateReopened:true});
}
assert.equal(bodies[0].messages.length,bodies[1].messages.length);
const changed=[];
for(let i=0;i<bodies[0].messages.length;i++)if(JSON.stringify(bodies[0].messages[i])!==JSON.stringify(bodies[1].messages[i])){
 changed.push(i);const a=bodies[0].messages[i].content,b=bodies[1].messages[i].content;
 assert.equal(bodies[0].messages[i].role,bodies[1].messages[i].role);
 if(a.includes('【901逐角色知情投影】'))assert.equal(a.split('【901逐角色知情投影】')[0],b.split('【901逐角色知情投影】')[0]);
 else assert.equal(a.replace(plan.cases[0].condition,''),b.replace(plan.cases[1].condition,''));
}
assert.equal(changed.length,2,'Only the isolated condition paragraph and the source-backed projection differ.');
const environment=await read(new URL('../browser-environment.json',base));
for(const [path,expected] of Object.entries(environment.protected))assert.equal(sha(await readFile(path)),expected,path);
const manifest=await read(new URL('package-manifest.json',out)),delta=await read(new URL('candidate-delta.json',out));
assert.equal(delta.changes.length,1);
for(const m of manifest){assert.equal(sha(await readFile(m.destination)),m.sha256);const rel=relative(fileURLToPath(new URL('package/901-opening-combat/',out)),m.destination);assert.equal(sha(await readFile(resolve(setup.app,'public/901-opening-combat',rel))),m.sha256);}
const current=await read(new URL('continuations/live-20261113/run.json',base));assert.equal(current.cumulative,252);assert.equal(current.remaining,0);
const result={status:'local-candidate-and-two-requests-verified-not-model-validated',version:plan.version,modelCalls:0,credentialsRead:false,cumulative:252,remaining:0,minimumFutureNarrationCalls:2,classificationControls:2,upstreamStoppedNarrations:2,changedMessageIndices:changed,otherRequestMessagesIdentical:true,candidateModules:133,candidateModulesChanged:1,formalProtectedFilesUnchanged:Object.keys(environment.protected).length,results};
await writeFile(new URL('verification.json',out),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
