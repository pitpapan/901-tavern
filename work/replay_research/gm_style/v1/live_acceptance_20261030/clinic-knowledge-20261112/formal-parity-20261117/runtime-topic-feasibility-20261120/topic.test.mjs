import test from 'node:test';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from './sandbox/public/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG} from './sandbox/public/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';

const question='医馆馆主与雪老之间是否有关系？两人过去有哪些来往（如有）？';
const fact=CLINIC_KNOWLEDGE_CATALOG.facts[0];
const catalog={...CLINIC_KNOWLEDGE_CATALOG,protectedTopics:[{propositionRef:fact.id,question}]};
const chatId='local.topic.unit';
function fixture(selectedCatalog){
 const chat=[{mes:'非正式测试口信：仅布莱特听到“我听说两人有旧，记号是钴蓝纸燕”。',swipe_id:0}];
 let data={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId,actors:{},operations:{}}}};
 const getAnchor=()=>({chatId,messageId:0,swipeId:0});
 const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async update=>{data=structuredClone(update);}};
 const tavern={chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{}, {...chat[0],variables:[structuredClone(data)]}]};
 const runtime=createStoryKnowledgeRuntime({mvu,tavern,getAnchor,catalog:selectedCatalog});
 return {runtime,receipt:{id:'local.topic.test',authority:'host-confirmed',status:'received',recipientIds:['bright'],
  propositionRefs:[fact.id],channel:'message',belief:'rumor',sourceAnchor:{...getAnchor(),text:chat[0].mes}}};
}
const project=({runtime})=>runtime.generate({request:{user_input:'问画面中的同伴'},event:'local-capture',
 eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r.user_input});

test('normal projection names the topic without exposing the answer and updates only the rumor recipient',async()=>{
 const f=fixture(catalog);
 const before=await project(f);
 assert.ok(before.includes('受控话题：'+question));
 assert.ok(!before.includes(fact.value));
 assert.ok(!before.includes(fact.id));
 for(const name of ['御临风','布莱特','黄泉']) assert.ok(before.includes(name+'在此话题上无已建立的获知来源。'));
 assert.equal((await f.runtime.receive(f.receipt)).status,'applied');
 const received=await project(f);
 assert.ok(received.includes('布莱特在此话题上已有获知来源，按本人投影的来源原文、内容范围和信念状态使用。'));
 for(const name of ['御临风','黄泉']) assert.ok(received.includes(name+'在此话题上无已建立的获知来源。'));
 assert.ok(!received.includes('布莱特在此话题上无已建立的获知来源。'));
 const marker='【901逐角色知情投影】\n';
 const context=JSON.parse(received.split(marker)[1].split('\n')[0]);
 assert.deepEqual(context.actorKnowledge.map(a=>a.facts.length),[0,1,0]);
 assert.equal(context.actorKnowledge[1].facts[0].belief,'rumor');
 assert.equal(context.actorKnowledge[1].facts[0].sources[0].sourceAnchor.text,f.receipt.sourceAnchor.text);
 const duplicate=await f.runtime.receive(f.receipt);
 assert.equal(duplicate.status,'already_applied');
 assert.equal(await project(f),received);
});

test('a catalog without an explicit topic declaration keeps the ordinary projection',async()=>{
 const f=fixture({...CLINIC_KNOWLEDGE_CATALOG,protectedTopics:undefined});
 assert.ok(!(await project(f)).includes('受控话题：'));
});
