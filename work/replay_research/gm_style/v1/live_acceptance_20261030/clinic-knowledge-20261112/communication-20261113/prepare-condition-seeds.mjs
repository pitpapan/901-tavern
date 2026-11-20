// Isolated scene setup, never an invented model reply. Uses the existing MVU receipt adapter.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from './conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('./',import.meta.url),out=new URL('conditions-20261113/',base),prior=new URL('continuations/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const sourceRaw=await readFile(new URL('B.completed.seed.jsonl',prior),'utf8'),source=sourceRaw.trim().split(/\r?\n/).map(s=>JSON.parse(s));
const priorResponse=await readFile(new URL('live-20261113/B2.content.txt',prior),'utf8');assert.equal(source.at(-1).mes,priorResponse);
const ledger=await read(new URL('live-20261113/run.json',prior));assert.equal(ledger.cumulative,252);assert.equal(ledger.remaining,0);
const factId='clinic.owner.xuelao.old-friend',promise=source.at(-1).variables[0].stat_data['901_rules_poc'].storyKnowledge.events['received.communication.promise'];
assert.equal(promise.data.sourceAnchor.messageId,12);assert.equal(source[13].mes,promise.data.sourceAnchor.text);
assert.ok(promise.data.sourceAnchor.text.startsWith('桌外隔离验收事件（非正式剧情）：同一来客向布莱特补充约定：'));
const scene='桌外隔离验收场景设定（非正式剧情）：承接刚才的送信讨论，御临风、黄泉和布莱特已在帝都街边一处安静、适合交谈的位置短暂停留，尚未到达医馆或递交推荐信。此为本次隔离场景设定，不是正式剧情，也不补写御临风的对白、心理或新承诺。';
const quotes={pending:'原来客与布莱特尚未进行原约定要求的单独确认；本分支没有新增或变更披露约定的事件。',confirmed:'原来客与布莱特已在两名同伴听不到的地方完成原约定要求的单独确认。'};
const release='我们约定的单独确认已经完成。这件事现在可以向御临风和黄泉说明，由你决定是否提起。';
const input='“现在呢，你还有什么想补充的吗？”\n（桌外隔离验收，非正式剧情：承接前文，写布莱特的回应；可以回应在场同伴，不替御临风新增对白、心理或决定。）';
const cases=[];
for(const id of ['pending','confirmed']){
 const rows=structuredClone(source),header=rows.shift(),chat=rows;
 const seed=new URL(id+'.seed.jsonl',out);
 const anchor=()=>({chatId:chat.at(-1).variables[0].stat_data['901_rules_poc'].chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0});
 const mvu={getMvuData:({message_id})=>structuredClone(chat[message_id].variables[chat[message_id].swipe_id??0]),replaceMvuData:async(v,{message_id})=>{chat[message_id].variables[chat[message_id].swipe_id??0]=structuredClone(v);}};
 const tavern={chatId:anchor().chatId,chat,saveChat:async()=>writeFile(seed,[header,...chat].map(m=>JSON.stringify(m)).join('\n')+'\n'),readSavedChat:async()=>(await readFile(seed,'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s))};
 const append=(text,hidden=false)=>chat.push({name:source.at(-1).name,is_user:false,is_system:hidden,mes:text,swipe_id:0,variables:[mvu.getMvuData({message_id:chat.length-1})],extra:{nonCanon:true,isolatedCondition:id}});
 append(scene+'\n'+quotes[id]);
 let receipt=null;
 const k=createStoryKnowledgeRuntime({catalog,mvu,tavern,getAnchor:anchor});
 if(id==='confirmed'){
  const text='桌外隔离验收来源（非正式剧情）：保留消息11中告知旧交、消息12中向布莱特提出约定的同一位可信来客，已与布莱特单独确认九雪医馆馆主与雪老有旧；确认后，该来客对布莱特说：“'+release+'”布莱特实际听到并理解此话；御临风和黄泉没有听到这次私下谈话。来客已经离开，此刻不在三人的谈话现场。';
  append(text,true);
  receipt={id:'condition.confirmed.20261113',status:'received',authority:'host-confirmed',sourceAnchor:{...anchor(),text},recipientIds:['bright'],propositionRefs:[factId],channel:'message',belief:'confirmed',disclosure:{sourceQuote:release}};
  await k.receive(receipt);
 }
 await tavern.saveChat();
 assert.deepEqual(k.context().actorKnowledge.map(a=>a.facts.length),[0,1,0]);
 assert.equal(k.context().actorKnowledge[1].facts[0].sources.length,id==='pending'?2:3);
 assert.deepEqual(k.context().actorKnowledge[1].facts[0].sources[1].sourceAnchor,promise.data.sourceAnchor);
 cases.push({id,seed:id+'.seed.jsonl',seedSha256:sha(await readFile(seed)),input,scene,condition:quotes[id],receipt,context:k.context(),status:'seed-ready-not-sent'});
}
await writeFile(new URL('prepared.json',out),JSON.stringify({status:'awaiting-local-browser-capture',version:'source-context-20261113',modelCalls:0,cumulative:252,remaining:0,credentialsRead:false,endpoint:'https://cdn.sta1n.cn/v1/chat/completions',minimumFutureNarrationCalls:2,classification:'local NO_CHECK only',parameters:(await read(new URL('live-20261113/B2.request.json',prior))),precedingSeedSha256:sha(sourceRaw),precedingResponseSha256:sha(priorResponse),sourceIdentity:{originalMessage:11,promiseMessage:12,description:'同一来客；原文相对身份可确定，未命名，senderId仍为空，不补人名或世界身份'},cases},(key,value)=>key==='parameters'?{...value,messages:undefined}:value,2)+'\n');
console.log(JSON.stringify({cases:cases.map(c=>({id:c.id,sourceCount:c.context.actorKnowledge[1].facts[0].sources.length,knowledgeCounts:c.context.actorKnowledge.map(a=>a.facts.length)})),newModelCalls:0,credentialsRead:false}));
