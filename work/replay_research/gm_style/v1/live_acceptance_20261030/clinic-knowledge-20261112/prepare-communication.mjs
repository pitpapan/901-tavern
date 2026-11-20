// Derive bounded disclosure-choice probes from retained browser requests and saved isolated states.
// No model transport and no real chat writes. The new requests are not claimed as new browser captures.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from '../../../../../rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from '../../../../../rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
import {patchStoryKnowledgeEntry} from '../../../../../rules_engine/gm_runtime/narrative-style-projection.mjs';
const base=new URL('./',import.meta.url),out=new URL('communication-20261113/',base),root=new URL('../../../../../../',import.meta.url);
await mkdir(out,{recursive:true});const hash=b=>createHash('sha256').update(b).digest('hex');
const old=JSON.parse(await readFile(new URL('prepared-requests.json',base),'utf8'));
const fixtures=[['05-known-unasked','02-received','bright',false,false],['06-known-asked','02-received','bright',true,false],['07-unknown-asked','01-before','huang',true,false],['08-confidential-asked','02-received','bright',true,true]];
const probes=[];
for(const [id,originalId,actor,asked,restricted] of fixtures){
 const p=old.probes.find(p=>p.id===originalId),raw=await readFile(new URL(p.requestFile,base));assert.equal(hash(raw),p.requestSha256);
 const body=JSON.parse(raw),before=structuredClone(body);
 const seedPath=originalId==='01-before'?new URL('../../../../../../../901-trpg-engine/tools/trpg-engine/samples/gm-host/trusted-binding-draft-20261113/chat.snapshot.jsonl',base):new URL('browser-evidence/received.seed.jsonl',base);
 const lines=(await readFile(seedPath,'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s));const header=lines.shift(),chat=lines;
 const seedFile=new URL(id+'.seed.jsonl',out);
 const anchor=()=>({chatId:'901 帝都正式续玩 20261106',messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0});
 const mvu={getMvuData:({message_id})=>structuredClone(chat[message_id].variables[chat[message_id].swipe_id??0]),replaceMvuData:async(v,{message_id})=>{chat[message_id].variables[chat[message_id].swipe_id??0]=structuredClone(v);}};
 const tavern={chatId:anchor().chatId,chat,saveChat:async()=>writeFile(seedFile,[header,...chat].map(m=>JSON.stringify(m)).join('\n')+'\n'),readSavedChat:async()=> (await readFile(seedFile,'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s))};
 const knowledge=createStoryKnowledgeRuntime({mvu,tavern,getAnchor:anchor,catalog});
 if(restricted){
  const sourceQuote='这件事先不要向御临风和黄泉透露，等我们单独确认后再说。';
  const source='桌外隔离验收事件（非正式剧情）：同一来客向布莱特补充约定：“'+sourceQuote+'”布莱特听到并答应了该约定；另两人未听见。';
  const state=mvu.getMvuData({message_id:chat.length-1});chat.push({mes:source,is_user:false,is_system:true,swipe_id:0,variables:[state]});
  await knowledge.receive({id:'communication.promise',status:'received',authority:'host-confirmed',sourceAnchor:{...anchor(),text:source},recipientIds:['bright'],propositionRefs:[catalog.facts[0].id],channel:'message',belief:'confirmed',disclosure:{sourceQuote}});
  body.messages.at(-4).content+='\n\n'+source;
 }
 const playerIndex=body.messages.length-3;assert.equal(body.messages[playerIndex].role,'user');
 const originalInput=body.messages[playerIndex].content;
 const newInput=asked?'“你知道九雪医馆的馆主和雪老之间有没有什么关系吗？”\n（桌外隔离验收，非正式剧情：本轮仅写'+catalog.actors[actor]+'的回应，其他人物不新增言行。）':originalInput;
 body.messages[playerIndex].content=newInput;
 const instruction=body.messages.at(-1).content.split('\n【901逐角色知情投影】')[0].replace(originalInput,newInput);
 let listener;
 await knowledge.generate({request:{user_input:instruction},event:'settings',eventOn:(_e,fn)=>{listener=fn;},eventRemoveListener:()=>{listener=null;},generateRaw:async r=>{body.messages.at(-1).content=r.user_input;listener(body);}});
 await tavern.saveChat();
 assert.equal(body.messages[0].content,before.messages[0].content); // style, books, database entry untouched
 assert.deepEqual({...body,messages:[]},{...before,messages:[]});
 for(let i=0;i<body.messages.length;i++)if(![playerIndex,body.messages.length-1,...(restricted?[body.messages.length-4]:[])].includes(i))assert.deepEqual(body.messages[i],before.messages[i]);
 const request=JSON.stringify(body);await writeFile(new URL(id+'.request.json',out),request);
 probes.push({id,nonCanon:true,originalBrowserProbe:originalId,originalRequestSha256:p.requestSha256,requestFile:'communication-20261113/'+id+'.request.json',requestBytes:Buffer.byteLength(request),requestSha256:hash(request),context:knowledge.context(),sourceSeed:id+'.seed.jsonl',purpose:restricted?'已知且有明确保留约定：可保留或婉拒，不自动倾倒已知事实':asked?actor==='huang'?'未获知者被直接询问：不确认关系也不凭空否认存在':'已知者直接被问且无保密约定：自然使用已有知识':'已知但普通送信提议：提与不提都按相关性判断，不强迫展示知识'});
}
await writeFile(new URL('prepared-requests.json',out),JSON.stringify({status:'prepared-from-browser-captures',modelCalls:0,scope:'same clinic case, four contextual disclosure probes; not independent generalization or fresh browser captures',parameters:old.parameters,probes},null,2)+'\n');
const destination=fileURLToPath(new URL('package/901-opening-combat/',out));
for(const asset of ['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']){const dest=new URL('package/901-opening-combat/'+asset,out);await mkdir(new URL('./',dest),{recursive:true});await copyFile(new URL('package/901-opening-combat/'+asset,base),dest);}
const entries=['story-knowledge.mjs','clinic-knowledge-catalog.mjs','replay-gate-script.example.js','narrative.mjs','integrated.mjs','opening.mjs','opening-binding.mjs','opening-scene-ui.mjs','player-status-ui.mjs','map-ui.mjs'].map(n=>fileURLToPath(new URL('work/rules_engine/gm_runtime/'+n,root)));
const built=spawnSync('python',[fileURLToPath(new URL('work/replay_research/six_books_20261023/runtime_package.py',root))],{input:JSON.stringify({root:fileURLToPath(root),destination,entries}),encoding:'utf8'});assert.equal(built.status,0,built.stderr);
await writeFile(new URL('package-manifest.json',out),built.stdout);
await writeFile(new URL('candidate-entry.js',out),patchStoryKnowledgeEntry(await readFile(new URL('installed-entry.js',base),'utf8')));
console.log(JSON.stringify({modelCalls:0,probes:probes.map(p=>({id:p.id,bytes:p.requestBytes})),modules:JSON.parse(built.stdout).length}));
