// Offline construction after reading the fixed parent's actual reply; no model calls.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from './package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
const base=new URL('./',import.meta.url),batch=new URL('batch/',base),live=new URL('live/',base),id=process.argv[2];
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const plan=await read(new URL('prepared.json',batch)),rule=plan.followups.find(f=>f.id===id);assert.ok(rule);
const run=await read(new URL('run.json',live));assert.equal(run.closed,false);
const parent=plan.cases.find(c=>c.id===rule.parent),attempt=run.attempts.find(a=>a.id===rule.parent);
assert.equal(attempt.state,'completed');assert.equal(attempt.manualVerdict,'pass');
const raw=await readFile(new URL(rule.parent+'.request.json',live),'utf8'),responseRaw=await readFile(new URL(rule.parent+'.raw-response.txt',live),'utf8'),content=await readFile(new URL(rule.parent+'.content.txt',live),'utf8');
assert.equal(sha(raw),parent.request.sha256);assert.equal(sha(responseRaw),attempt.rawResponseSha256);
const response=JSON.parse(responseRaw);assert.equal(response.choices[0].message.content,content);assert.equal(response.choices[0].finish_reason,'stop');
const rows=(await readFile(new URL(parent.seed,batch),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
const variables=structuredClone(rows.at(-1).variables[0]);
const input=rule.proposedInputIfCompatible+'\n（桌外隔离验收，非正式剧情：承接前轮真实回复，保持原人物和文风，不替御临风新增对白、心理或决定。）';
rows.push({name:'布莱特',is_user:false,is_system:false,mes:content,swipe_id:0,variables:[structuredClone(variables)],extra:{nonCanon:true,actualResponseId:response.id}});
rows.push({name:'御临风',is_user:true,is_system:false,mes:input,swipe_id:0,variables:[structuredClone(variables)],extra:{nonCanon:true}});
const catalog=await read(new URL(rule.parent+'.catalog.json',batch)),chat=rows.slice(1),chatId=variables.stat_data['901_rules_poc'].chatId;
const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
assert.deepEqual(k.context(),parent.context);
const previous=JSON.parse(raw),body=structuredClone(previous),marker='\n【901逐角色知情投影】\n',prefix=body.messages.at(-1).content.split(marker)[0];
assert.equal(body.messages.at(-3).content,parent.input);assert.ok(prefix.startsWith('玩家行动：'+parent.input));
body.messages.splice(body.messages.length-2,0,{role:'assistant',content},{role:'user',content:input});
let listener;const before=JSON.stringify(rows);
await k.generate({request:{user_input:'玩家行动：'+input+prefix.slice(('玩家行动：'+parent.input).length)},event:'offline',eventOn:(_e,fn)=>{listener=fn;},eventRemoveListener:()=>{listener=null;},generateRaw:async p=>{body.messages.at(-1).content=p.user_input;listener(body);}});
assert.equal(JSON.stringify(rows),before);assert.equal(listener,null);
assert.deepEqual(body.messages.slice(0,previous.messages.length-2),previous.messages.slice(0,-2));
assert.equal(body.messages.at(-4).content,content);assert.deepEqual(body.messages.at(-2),previous.messages.at(-2));
assert.equal(body.messages.at(-1).content.split(marker)[1],previous.messages.at(-1).content.split(marker)[1]);
assert.deepEqual({...body,messages:undefined},{...plan.parameters,messages:undefined});
const next=JSON.stringify(body),job={id,input,parent:rule.parent,parentResponseId:response.id,parentRequestSha256:sha(raw),parentRawResponseSha256:sha(responseRaw),parentContentSha256:sha(content),
 context:k.context(),sourceCatalog:rule.parent+'.catalog.json',seed:id+'.seed.jsonl',request:{file:id+'.request.json',bytes:Buffer.byteLength(next),sha256:sha(next)},
 manualStateReview:'Parent NPC remained at the workshop; no actual handover, meeting, new agreement or accepted player plan. Retain all prose, including unsupported character policy assertion or proposed waiting; do not adopt them as source facts.',
 actualSpeechRetained:true,newKnowledgeReceipts:0,classificationModelCalls:0,construction:'offline current packaged runtime with exact real parent reply; no new browser capture'};
await writeFile(new URL(id+'.request.json',batch),next,{flag:'wx'});
await writeFile(new URL(id+'.seed.jsonl',batch),rows.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'});
await writeFile(new URL(id+'.prepared.json',batch),JSON.stringify(job,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({id,...job.request,parent:rule.parent,parentResponseId:response.id,knowledgeCounts:job.context.actorKnowledge.map(a=>a.facts.length),modelCalls:0}));
