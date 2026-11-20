// Offline only. Creates isolated, NON-CANON narration requests; no model transport.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createStoryKnowledgeRuntime} from '../../../../../rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from '../../../../../rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
import {patchStoryKnowledgeEntry,selectAdoptedStyle} from '../../../../../rules_engine/gm_runtime/narrative-style-projection.mjs';
const out=new URL('./',import.meta.url),root=new URL('../../../../../../',import.meta.url);
const original=await readFile(new URL('installed-entry.js',out),'utf8');
await writeFile(new URL('candidate-entry.js',out),patchStoryKnowledgeEntry(original));
const style=selectAdoptedStyle(JSON.parse(await readFile(new URL('work/replay_research/gm_style/v1/authoring.json',root),'utf8')));
const chat=[{mes:'【隔离验收，非Canon】御临风、布莱特、黄泉尚未获知馆主与雪老的关系。',swipe_id:0}];
let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'isolated.clinic.probe',actors:{},operations:{}}}};
const mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async data=>{state=structuredClone(data);}};
const tavern={chatId:'isolated.clinic.probe',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[state]}))]};
const getAnchor=()=>({chatId:tavern.chatId,messageId:chat.length-1,swipeId:0});
const runtime=createStoryKnowledgeRuntime({mvu,tavern,getAnchor,catalog});
const probes=[];
async function capture(id,actor){
 const request={should_stream:false,should_silence:true,max_chat_history:'all',user_input:`【隔离验收，非Canon】仅写${actor}对前往九雪医馆、询问是否接待与住宿的简短回应。御临风已说：“我想先送推荐信，顺道问问是否有落脚之处。”保留正常人物文风，不替御临风增加言行。`};
 await runtime.generate({request,event:'settings',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async projected=>{
  const messages=[{role:'system',content:style},{role:'system',content:runtime.projectEntries(catalog.lore.map(l=>({world:l.book,uid:l.uid,content:l.content}))).map(e=>e.content).join('\n\n')},{role:'user',content:projected.user_input}];
  probes.push({id,nonCanon:true,actor,context:runtime.context(),request:projected,messages,expected:id==='01-before'||id==='03-unreceived'?'不以旧交作自身已知事实或行动理由；可以正常建议询问接待。':'可承接已获告旧交；不能推出馆主读信、接受住宿或所有同伴获知。'});
  return undefined;
 }});
}
async function receive(id,recipient,senderId){
 chat.push({mes:`【隔离验收，非Canon】${senderId?'布莱特实际转告黄泉':'可信来客私下告知布莱特'}：九雪医馆馆主与雪老有旧。仅指定接收者听到。`,swipe_id:0});
 await runtime.receive({id,status:'received',authority:'host-confirmed',sourceAnchor:{...getAnchor(),text:chat.at(-1).mes},recipientIds:[recipient],propositionRefs:[catalog.facts[0].id],channel:'message',belief:'confirmed',...(senderId?{senderId}:{})});
}
await capture('01-before','布莱特');
await receive('probe.received','bright');await capture('02-received','布莱特');await capture('03-unreceived','黄泉');
await receive('probe.relay','huang','bright');await capture('04-relayed','黄泉');
const json=JSON.stringify({status:'prepared-not-sent',modelCalls:0,requestedFutureNarrationCalls:4,scope:'isolated controlled narration inputs, not captured live Tavern HTTP requests',probes},null,2)+'\n';
await writeFile(new URL('prepared-requests.json',out),json);
const destination=fileURLToPath(new URL('package/901-opening-combat/',out));await mkdir(destination,{recursive:true});
const assets=['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json'];
for(const asset of assets){const dest=new URL('package/901-opening-combat/'+asset,out);await mkdir(new URL('./',dest),{recursive:true});await copyFile('D:/github/sillyTavern/public/901-opening-combat/'+asset,dest);}
await writeFile(new URL('actual-failure-evidence.json',out),JSON.stringify({playerInput:'”我想先送了推荐信吧，我们还能顺道问问老馆主是否有落脚之处“',assistantOutput:catalog.rejectedNarration[0],source:'Retained chat 901 帝都正式续玩 20261106, selected messages 9/10; no edits'},null,2)+'\n');
const files=['story-knowledge.mjs','clinic-knowledge-catalog.mjs','replay-gate-script.example.js','narrative.mjs','integrated.mjs','opening.mjs','opening-binding.mjs','opening-scene-ui.mjs','player-status-ui.mjs','map-ui.mjs'];
const packaged=spawnSync('python',[fileURLToPath(new URL('work/replay_research/six_books_20261023/runtime_package.py',root))],{input:JSON.stringify({root:fileURLToPath(root),destination,entries:files.map(n=>fileURLToPath(new URL('work/rules_engine/gm_runtime/'+n,root)))}),encoding:'utf8'});
if(packaged.status!==0)throw Error(packaged.stderr);
await writeFile(new URL('package-manifest.json',out),JSON.stringify({installed:false,entrySourceSha256:createHash('sha256').update(original).digest('hex'),modules:JSON.parse(packaged.stdout)},null,2)+'\n');
console.log(JSON.stringify({prepared:probes.length,modelCalls:0,modules:JSON.parse(packaged.stdout).length}));
