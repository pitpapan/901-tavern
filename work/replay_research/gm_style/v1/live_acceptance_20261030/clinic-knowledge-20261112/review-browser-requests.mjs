// Offline review of real Tavern HTTP request construction. No transport or model calls.
import {readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from '../../../../../rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('./',import.meta.url),dir=new URL('browser-evidence/',base);
const names=await readdir(dir),hash=b=>createHash('sha256').update(b).digest('hex');
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const probes=[],counts=[[0,0,0],[0,1,0],[0,1,0],[0,1,1]];
let parameters,system,baselineHistory;
for(const [index,id] of ['01-before','02-received','03-unreceived','04-relayed'].entries()){
 const matches=names.filter(n=>n.startsWith(id+'-')&&n.endsWith('-narration.json'));
 assert.equal(matches.length,1,id+' must have one captured narration');
 const capture=await read(new URL(matches[0],dir));assert.equal(capture.upstreamCalls,0);assert.equal(capture.offline,true);
 const {messages,...params}=capture.requestBody;
 if(parameters)assert.deepEqual(params,parameters);else parameters=params;
 const context=JSON.parse(messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);
 assert.deepEqual(context.actorKnowledge.map(a=>a.facts.length),counts[index]);
 for(const actor of context.actorKnowledge)for(const f of actor.facts){assert.equal(f.id,catalog.facts[0].id);assert.equal(f.belief,'confirmed');assert.ok(f.eventRef.startsWith('received.browser.'));}
 assert.ok(messages[0].content.includes('【独立关系事项：'));
 assert.ok(messages[0].content.includes('你以中文主持901当前场景'));
 // Receipt text additionally activates this existing public capsule; no unrelated lore/style delta.
 const publicCapsule='人物·九雪医馆馆主\n\n帝都医馆经营者。\n';
 const stableSystem=messages[0].content.replace(publicCapsule,'');
 if(system)assert.equal(stableSystem,system);else system=stableSystem;
 assert.ok(!messages.some(m=>m.content.includes(catalog.rejectedNarration[0].fragment)));
 // Tavern flattens the explicitly marked system receipt into the adjacent assistant message.
 const historical=messages.filter(m=>m.role!=='system').slice(0,11).map(m=>({...m,content:m.content.split('桌外隔离验收事件（非正式剧情）')[0].trimEnd()}));
 if(baselineHistory)assert.deepEqual(historical,baselineHistory);else baselineHistory=historical;
 const classified=names.filter(n=>n.startsWith(id+'-')&&n.endsWith('-classification.json'));assert.equal(classified.length,1);
 const classification=await read(new URL(classified[0],dir));assert.equal(classification.upstreamCalls,0);
 const ctext=classification.requestBody.messages.at(-1).content;
 const ccontext=JSON.parse(ctext.split('【901逐角色知情投影】\n')[1].split('\n')[0]);assert.deepEqual(ccontext,context);
 const raw=JSON.stringify(capture.requestBody);await writeFile(new URL(id+'.request.json',dir),raw);
 probes.push({id,nonCanon:true,status:'captured-not-sent',captureFile:'browser-evidence/'+matches[0],requestFile:'browser-evidence/'+id+'.request.json',requestBytes:Buffer.byteLength(raw),requestSha256:hash(raw),messageCount:messages.length,context,actor:index<2?'布莱特':'黄泉',upstreamCalls:0});
}
const env=await read(new URL('browser-environment.json',base));
for(const [path,sha]of Object.entries(env.protected))assert.equal(hash(await readFile(path)),sha,'Protected real file changed: '+path);
const manifest=await read(new URL('package-manifest.json',base));
const packageRoot=fileURLToPath(new URL('package/901-opening-combat/',base));
for(const m of manifest.modules){
 assert.equal(hash(await readFile(m.destination)),m.sha256);
 assert.equal(hash(await readFile(path.join(env.app,'public/901-opening-combat',path.relative(packageRoot,m.destination)))),m.sha256);
}
const ui=await read(new URL('browser-evidence/final-ui-evidence.json',base));
const memoryRows=Object.fromEntries(Object.entries(ui.database).filter(([k])=>k.startsWith('sheet_')).map(([k,v])=>[k,Math.max(0,(v.content?.length??0)-1)]));
assert.ok(Object.values(memoryRows).every(n=>n===0));
const old=await read(new URL('prepared-requests.json',base));
if(old.status==='prepared-not-sent')await copyFile(new URL('prepared-requests.json',base),new URL('prepared-requests.offline.json',base));
const result={status:'captured-not-sent',modelCalls:0,requestedFutureNarrationCalls:4,classification:'explicit NO_CHECK fixture; not a model result; no classification call requested',scope:'Real isolated browser Tavern requests, stopped by local backend before upstream fetch',parameters,probes};
await writeFile(new URL('prepared-requests.json',base),JSON.stringify(result,null,2)+'\n');
const validation={realBrowserCaptures:4,classificationCaptures:4,newUpstreamCalls:0,sameGenerationParameters:true,sameStyleAndUnrelatedPublicContent:true,originalHistoryPreservedAfterKnownProjection:true,relatedPublicLoreDelta:'Receipt mentions activate 人物·九雪医馆馆主 / 帝都医馆经营者。; no private relationship in this capsule',perActorKnowledgeVerified:true,classificationNarrationContextsAgree:true,rejectedHistoricalFragmentAbsent:true,protectedRealFileHashesUnchanged:true,isolatedPackageModulesVerified:manifest.modules.length,memoryRows,probes:probes.map(p=>({id:p.id,requestBytes:p.requestBytes,requestSha256:p.requestSha256,messageCount:p.messageCount})),limits:['No new model prose or literary-quality result','Only the clinic proposition and its known source projections were inspected','Classification used an offline fixture','Receipt events exist only in the non-Canon isolated copy','Current database sheets have headers only; populated memory contamination is not tested']};
await writeFile(new URL('browser-validation.json',base),JSON.stringify(validation,null,2)+'\n');console.log(JSON.stringify(validation,null,2));
