import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as dialogue from './story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';
import {createOpeningFixture} from './opening.mjs';

const full='渡口停航，明早走山路。',text='😀甲对乙和丙说：“'+full+'”乙听清全部，丙只听清前半句，后半句是否听清不明。';
const actors={a:'甲',b:'乙',c:'丙'},options={sourceAnchor:{chatId:'relation.test',messageId:1,swipeId:0,text},history:[{messageId:0,role:'user',text:'乙问甲渡口和路线情况。'}],actors,facts:{},memory:null};
const prepare=(o=options)=>dialogue.prepareRelatedDialogueExtraction(o);
function selection(p,quote){
 const list=JSON.parse(p.messages[2].content).fragments.filter(f=>f.text.includes(quote)&&f.text.indexOf(quote)===f.text.lastIndexOf(quote)).sort((a,b)=>a.text.length-b.text.length);
 assert.ok(list.length,quote);return {fragmentId:list[0].id,quote};
}
function wire(p){
 const s=q=>selection(p,q),r=(id,who,q,status,kind,evidence)=>({id,contentSpan:s(q),speakerId:'a',listener:{actorId:who,kind:'explicit',span:s(actors[who]),historyMessageId:null},evidence:{kind,span:s(evidence)},status,propositionRef:null,reason:''});
 return {schemaVersion:'dialogue-reception/5',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],unresolved:[],coverage:{status:'uncertain',evidence:s(text),reason:'按各自接收范围保留'},utterances:[{claim:{id:'speech',type:'utterance',args:{speaker:'甲',content:full},argumentSpans:{speaker:s('甲'),content:s(full)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:s('甲对乙和丙说：“'+full+'”')},receptions:[r('all','b',full,'received','direct','甲对乙和丙说：“'+full+'”'),r('front','c','渡口停航','received','overheard','丙只听清前半句'),r('back','c','明早走山路。','uncertain','unknown','后半句是否听清不明')]}]}]};
}
test('v5 binds one listener, reception relation and partial content; reuses exact input and fragment catalogue',async()=>{
 const p=await prepare(),v4=await dialogue.prepareSelectedDialogueExtraction(options),w=wire(p),copy=structuredClone(w),checked=p.check(w);
 assert.deepEqual(p.input,v4.input);assert.deepEqual(p.messages.slice(1),v4.messages.slice(1));assert.equal(p.responseFormat.json_schema.name,'dialogue_reception_v5');
 assert.ok(!p.messages[0].content.includes('recipientIds'));assert.ok(!p.messages[0].content.includes('recipientSpans'));
 assert.equal(checked.receptions[1].contentSpan.quote,'渡口停航');assert.deepEqual(checked.receptions[1].recipientIds,['c']);assert.equal(checked.receptions[2].status,'uncertain');
 assert.equal(checked.receptionBindings[0].listener.kind,'explicit');assert.equal(checked.receptionBindings[1].evidence.kind,'overheard');assert.equal(checked.semanticCompletenessVerified,false);assert.deepEqual(w,copy);
 const result=spawnSync('python',['-c','import json,sys,jsonschema\nx=json.loads(sys.stdin.buffer.read());jsonschema.Draft202012Validator(x["schema"]).validate(x["value"])'],{input:JSON.stringify({schema:p.responseFormat.json_schema.schema,value:w}),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
});
test('reply uses retained history identity and current answer citations, without requiring acknowledgement',async()=>{
 const p=await prepare(),w=wire(p),r=w.units[0].utterances[0].receptions[0];
 r.listener={actorId:'b',kind:'reply',span:selection(p,full),historyMessageId:0};r.evidence={kind:'reply',span:selection(p,full)};
 const checked=p.check(w);assert.equal(checked.receptions[0].status,'received');assert.deepEqual(checked.receptions[0].recipientIds,['b']);assert.equal(checked.receptionBindings[0].listener.historyMessageId,0);
});
test('rejects contradictory, stale, missing or misplaced relation fields without repairing raw objects',async()=>{
 const p=await prepare();
 for(const mutate of [
  r=>r.listener.actorId='missing',r=>r.listener.kind='speaker',r=>r.listener.kind='unknown',r=>r.listener.actorId=null,
  r=>r.listener.historyMessageId=0,r=>r.listener.span.quote='不存在',r=>r.evidence.kind='unknown',r=>r.evidence.kind='obstacle',
  r=>r.evidence.kind='reply',r=>r.evidence.extra=true,r=>r.recipientIds=['b'],r=>delete r.listener,
  r=>{r.listener={actorId:'b',kind:'reply',span:selection(p,full),historyMessageId:99};r.evidence={kind:'reply',span:selection(p,full)};},
  r=>{r.listener={actorId:'b',kind:'reply',span:selection(p,'乙听清全部'),historyMessageId:0};r.evidence={kind:'reply',span:selection(p,full)};},
  r=>{r.listener={actorId:'b',kind:'reply',span:selection(p,full),historyMessageId:0};r.evidence={kind:'reply',span:selection(p,'乙听清全部')};},
  r=>r.contentSpan=selection(p,'乙听清全部'),
 ]){const w=wire(p);mutate(w.units[0].utterances[0].receptions[0]);const copy=structuredClone(w);assert.throws(()=>p.check(w));assert.deepEqual(w,copy);}
});
test('unknown identity remains pending, explicit obstacle remains not received, none creates no receipts',async()=>{
 const p=await prepare(),w=wire(p),r=w.units[0].utterances[0].receptions[2];r.listener={actorId:null,kind:'unknown',span:selection(p,'后半句是否听清不明'),historyMessageId:null};
 assert.deepEqual(p.check(w).receptions[2].recipientIds,[]);
 const blocked=wire(p),last=blocked.units[0].utterances[0].receptions[2];last.status='not_received';last.evidence.kind='obstacle';blocked.units[0].coverage.status='recorded';assert.equal(p.check(blocked).receptions[2].status,'not_received');
 const none=wire(p);none.units[0].utterances=[];none.units[0].coverage.status='none';assert.deepEqual(p.check(none).receptions,[]);
});
test('relation labels do not certify semantic grounding or trigger a keyword filter',async()=>{
 const p=await prepare(),w=wire(p),r=w.units[0].utterances[0].receptions[0];r.evidence.span=selection(p,'甲');
 const checked=p.check(w);assert.equal(checked.semanticCompletenessVerified,false);assert.equal(checked.canApprove,false);assert.equal(checked.receptions[0].evidence.quote,'甲');
});
test('default adapter retains relation provenance through MVU/reopen and asks only on actual dependency',async()=>{
 for(const invalid of [false,true]){
  let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'relation.test',actors:createOpeningFixture().actors,operations:{}}}},writes=0,calls=0,asked=0;
  const chat=[{mes:options.history[0].text,is_user:true},{mes:text,is_user:false,swipe_id:0}],mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{writes++;state=structuredClone(v);}},tavern={chatId:'relation.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]};
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async req=>{calls++;assert.equal(req.responseFormat.json_schema.name,'dialogue_reception_v5');const p=await prepare(JSON.parse(req.messages[1].content)),w=wire(p);if(invalid)w.units[0].utterances[0].receptions[0].evidence.kind='unknown';return JSON.stringify(w);}});
  const make=()=>createStoryKnowledgeRuntime({catalog:{id:'relation.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'relation.test',messageId:1,swipeId:0}),dialogue:{...adapter,dependencies:async({request,pending})=>request.text==='依赖'?[pending[0].id]:[],ask:async()=>{asked++;return null;}}});
  const k=make(),before=structuredClone(state);
  if(invalid){await assert.rejects(k.observeDialogue(options.sourceAnchor));assert.equal(writes,0);assert.deepEqual(state,before);continue;}
  const result=await k.observeDialogue(options.sourceAnchor);assert.equal(result.pending.length,1);assert.deepEqual(k.context().actorKnowledge.find(a=>a.actorId==='c').facts.map(f=>f.content.text),['渡口停航']);
  const row=Object.values(k.read().dialogueBatches)[0].rows[0];assert.equal(row.receptionBinding.listener.kind,'explicit');assert.equal(row.receptionBinding.evidence.kind,'direct');
  const reopened=make();await reopened.observeDialogue(options.sourceAnchor);assert.equal(calls,1);await reopened.prepareDialogueTurn({text:'无关'});assert.equal(asked,0);await reopened.prepareDialogueTurn({text:'依赖'});assert.equal(asked,1);
 }
});
test('original failures remain byte-identical and cannot silently enter the new contract',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['selection.parents.play006','selection.parents.play009','selection.reproduce.play006','selection.reproduce.play009']){
  const raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),p=await prepare(JSON.parse(req.messages[1].content));
  assert.throws(()=>p.check(JSON.parse(raw)));assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
});

test('source-grounded positive and negative cases retain direct reception, obstacle and unknown scope',async()=>{
 const cases=[
  {text:'甲对乙说：“渡口停航。”乙继续收拾行李。',q:'渡口停航。',basis:'甲对乙说：“渡口停航。”',kind:'direct',status:'received'},
  {text:'乙已经离开，听不到这里。甲仍说：“渡口停航。”',q:'渡口停航。',basis:'乙已经离开，听不到这里。',kind:'obstacle',status:'not_received'},
  {text:'甲说：“渡口停航。”乙是否听到，尚不清楚。',q:'渡口停航。',basis:'乙是否听到，尚不清楚。',kind:'unknown',status:'uncertain'},
 ];
 for(const c of cases){
  const p=await prepare({...options,sourceAnchor:{...options.sourceAnchor,text:c.text}}),s=q=>selection(p,q);
  const w={schemaVersion:'dialogue-reception/5',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],unresolved:[],coverage:{status:c.status==='uncertain'?'uncertain':'recorded',evidence:s(c.text),reason:'按原文关系'},utterances:[{claim:{id:'s',type:'utterance',args:{speaker:'甲',content:c.q},argumentSpans:{speaker:s('甲'),content:s(c.q)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:s(c.text)},receptions:[{id:'r',speakerId:'a',listener:{actorId:'b',kind:'explicit',span:s('乙'),historyMessageId:null},evidence:{kind:c.kind,span:s(c.basis)},contentSpan:s(c.q),status:c.status,propositionRef:null,reason:''}]}]}]};
  assert.equal(p.check(w).receptions[0].status,c.status);
 }
});

test('the default contract cannot fall back to an old raw reply or fill a missing relation',async()=>{
 const p=await prepare(),old=await dialogue.prepareSelectedDialogueExtraction(options),adapter=dialogue.createDialogueSemanticAdapter({complete:async()=>{throw Error('must not call');}});
 await assert.rejects(adapter.extract(old.input,old.messages,old.responseFormat),/contract required/);
 const w=wire(p);delete w.units[0].utterances[0].receptions[0].evidence.kind;const copy=structuredClone(w);assert.throws(()=>p.check(w));assert.deepEqual(w,copy);
});

test('v5 live format failures remain rejected unchanged; no extra-field removal or JSON salvage',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['relation.direct','relation.npc_reply','relation.partial','relation.ambiguous','relation.obstacle']){
  const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),p=await prepare(JSON.parse(req.messages[1].content));
  assert.deepEqual(p.messages,req.messages);assert.throws(()=>p.check(JSON.parse(raw)));assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
});

test('v5 real structurally valid but misgrounded replies remain explicitly semantically unverified',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['relation.original.006.network','relation.original.009']){
  const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),p=await prepare(JSON.parse(req.messages[1].content)),checked=p.check(JSON.parse(raw));
  assert.deepEqual(p.messages,req.messages);assert.equal(checked.semanticCompletenessVerified,false);assert.equal(checked.canApprove,false);assert.ok(checked.receptionBindings.length);
  assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
});

test('actual v5 requests already close receipt fields and carry identity, transmission and speech boundaries',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['relation.original.006.network','relation.original.009','relation.direct','relation.npc_reply','relation.partial','relation.ambiguous','relation.obstacle','relation.unsaid']){
  const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),p=await prepare(JSON.parse(req.messages[1].content)),schema=req.response_format.json_schema;
  assert.deepEqual(p.messages,req.messages);assert.equal(schema.strict,true);
  const receipt=schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items;
  assert.equal(receipt.additionalProperties,false);assert.deepEqual(new Set(receipt.required),new Set(Object.keys(receipt.properties)));
  assert.ok(!JSON.stringify(req).includes('listenerId'));
  assert.ok(receipt.properties.listener.description.includes('旁听者不能借用问答身份'));
  assert.ok(receipt.properties.evidence.description.includes('身份/在场/说话动作本身不证明收到'));
  assert.ok(req.messages[0].content.includes('被旁白隔开的发言仍分别记录'));assert.ok(req.messages[0].content.includes('单个合法JSON对象'));
 }
});

test('capture and content extraction preserve the actual invalid bytes, with one offline fake transport and no repair',async()=>{
 const {captureSavedReview}=await import('../../../../901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs');
 const {createHash}=await import('node:crypto');
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['relation.direct','relation.npc_reply','relation.partial','relation.ambiguous','relation.obstacle','relation.unsaid']){
  const raw=await readFile(new URL(id+'.raw-response.txt',dir),'utf8'),content=await readFile(new URL(id+'.content.txt',dir),'utf8');let calls=0;
  const row=await captureSavedReview({rawBody:'offline-fixture',apiKey:'offline-placeholder-not-a-key',onUpdate:async()=>{},fetchImpl:async(_url,init)=>{calls++;assert.equal(init.body,'offline-fixture');return new Response(raw,{status:200,headers:{'Content-Type':'application/json'}});}});
  assert.equal(calls,1);assert.equal(row.responseText,raw);assert.equal(row.responseBodySha256BeforePrivacyRedaction,createHash('sha256').update(raw).digest('hex'));
  assert.equal(JSON.parse(row.responseText).choices[0].message.content,content);
 }
});

test('semantic adapter rejects duplicate JSON member names before native last-value overwrite is accepted',async()=>{
 const p=await prepare();
 for(const raw of ['{"reason":"first","reason":"last"}','{"nested":{"reason":1,"reas\\u006fn":2}}','{"array":[{"x":true,"x":true}]}']){
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async()=>raw});
  await assert.rejects(adapter.extract(p.input,p.messages,p.responseFormat),/Duplicate JSON object key/);
 }
 for(const raw of ['{"a":{"reason":1},"b":{"reason":2}}','{"quoted":"\\\"reason\\\":1,\\\"reason\\\":2","empty":{},"list":[]}','{"a\\\"b":1,"other":null}']){
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async()=>raw});assert.deepEqual(await adapter.extract(p.input,p.messages,p.responseFormat),JSON.parse(raw));
 }
});

test('actual441 duplicate reason is rejected by the real adapter before isolated MVU writes, raw stays intact',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url),id='relation.followup.partial';
 const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),input=JSON.parse(req.messages[1].content),anchor=input.sourceAnchor;
 let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:anchor.chatId,actors:createOpeningFixture().actors,operations:{}}}},writes=0;
 const before=structuredClone(state),chat=input.history.map(h=>({mes:h.text,is_user:h.role==='user'}));chat[anchor.messageId]={mes:anchor.text,is_user:false,swipe_id:anchor.swipeId};
 const k=createStoryKnowledgeRuntime({catalog:{id:'duplicate.raw',actors:input.actors,facts:Object.values(input.facts)},mvu:{getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{writes++;state=v;}},tavern:{chatId:anchor.chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]},getAnchor:()=>({chatId:anchor.chatId,messageId:anchor.messageId,swipeId:anchor.swipeId}),dialogue:dialogue.createDialogueSemanticAdapter({complete:async()=>raw,readMemory:async()=>input.memory})});
 await assert.rejects(k.observeDialogue(anchor),/Duplicate JSON object key/);assert.equal(writes,0);assert.deepEqual(state,before);assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
});
