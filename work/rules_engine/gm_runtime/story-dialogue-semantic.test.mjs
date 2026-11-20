import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as dialogue from './story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';
import {createOpeningFixture} from './opening.mjs';

const full='渡口停航，明早走山路。',text='😀甲对乙和丙说：“'+full+'”乙听清全部，丙只听清前半句，后半句是否听清不明。';
const options={sourceAnchor:{chatId:'semantic.test',messageId:1,swipeId:0,text},history:[{messageId:0,role:'user',text:'乙问甲渡口和路线情况。'}],actors:{a:'甲',b:'乙',c:'丙'},facts:{},memory:null};
async function prepare(o=options){assert.equal(typeof dialogue.prepareSemanticDialogueExtraction,'function','explicit semantic selection preparer must exist');return dialogue.prepareSemanticDialogueExtraction(o);}
function select(p,quote){
 const f=JSON.parse(p.messages[2].content).fragments.filter(f=>f.text.includes(quote)&&f.text.indexOf(quote)===f.text.lastIndexOf(quote)).sort((a,b)=>a.text.length-b.text.length)[0];
 assert.ok(f,quote);return {fragmentId:f.id,quote};
}
function wire(p){
 const s=q=>select(p,q),receipt=(who,content,kind,basis)=>({content,listener:{actorId:who,kind:'explicit',span:s(options.actors[who]),historyMessageId:null},evidence:{kind,span:s(basis)},propositionRef:null,reason:''});
 return {schemaVersion:'dialogue-reception/6',contextRef:p.input.contextRef,units:[{id:'turn',claims:[],unresolved:[],coverage:{status:'uncertain',evidence:s(text),reason:'完整与局部接收分别保留'},utterances:[{speaker:{actorId:'a',span:s('甲')},content:s(full),mode:'asserted',scope:{time:null,condition:null,attribution:null},anchor:s('甲对乙和丙说：“'+full+'”'),receptions:[
  receipt('b',{ref:'utterance.content'},'direct','甲对乙和丙说：“'+full+'”'),
  receipt('c',s('渡口停航'),'overheard','丙只听清前半句'),
  receipt('c',s('明早走山路。'),'unknown','后半句是否听清不明'),
 ]}]}]};
}
function schemaCheck(p,value){const r=spawnSync('python',['-c','import json,sys,jsonschema\nx=json.loads(sys.stdin.buffer.read());jsonschema.Draft202012Validator.check_schema(x["schema"]);jsonschema.Draft202012Validator(x["schema"]).validate(x["value"])'],{input:JSON.stringify({schema:p.responseFormat.json_schema.schema,value}),encoding:'utf8'});assert.equal(r.status,0,r.stderr);}

test('v6 selections expand to the existing v5 contract without changing input or semantic guarantees',async()=>{
 const p=await prepare(),old=await dialogue.prepareRelatedDialogueExtraction(options),w=wire(p),copy=structuredClone(w),s=q=>select(p,q);
 const expected={schemaVersion:'dialogue-reception/5',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],unresolved:[],coverage:copy.units[0].coverage,utterances:[{claim:{id:'semantic.turn.u0',type:'utterance',args:{speaker:'甲',content:full},argumentSpans:{speaker:s('甲'),content:s(full)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:s('甲对乙和丙说：“'+full+'”')},receptions:copy.units[0].utterances[0].receptions.map((r,i)=>({id:'semantic.turn.u0.r'+i,speakerId:'a',contentSpan:i===0?s(full):r.content,status:['received','received','uncertain'][i],listener:r.listener,evidence:r.evidence,propositionRef:null,reason:''}))}]}]};
 assert.deepEqual(p.input,old.input);assert.deepEqual(p.messages.slice(1),old.messages.slice(1));
 assert.equal(p.responseFormat.json_schema.name,'dialogue_reception_v6');schemaCheck(p,w);
 assert.deepEqual(p.check(w),old.check(expected));assert.deepEqual(w,copy);
 assert.equal(p.check(w).semanticCompletenessVerified,false);assert.equal(p.check(w).canApprove,false);
 assert.ok(JSON.stringify(w).length<JSON.stringify(expected).length);
 assert.equal(p.check(w).receptions[1].contentSpan.quote,'渡口停航');
});

test('explicit answer/content references reuse selections; scoped values still require paired source evidence',async()=>{
 const p=await prepare(),w=wire(p),u=w.units[0].utterances[0],r=u.receptions[0];
 r.listener={actorId:'b',kind:'reply',span:{ref:'utterance.content'},historyMessageId:0};r.evidence={kind:'reply',span:{ref:'reception.content'}};
 u.scope.time={value:'明早',span:select(p,'明早')};schemaCheck(p,w);
 const checked=p.check(w),claim=checked.assertions.units[0].claims[0];
 assert.equal(claim.scope.time,'明早');assert.equal(claim.scopeSpans.time.quote,'明早');
 assert.equal(checked.receptionBindings[0].listener.span.quote,full);assert.equal(checked.receptions[0].evidence.quote,full);
 const bad=structuredClone(w);bad.units[0].utterances[0].scope.time.span=null;assert.throws(()=>p.check(bad));
});

test('v6 rejects omissions, extra/derived fields, stale bindings and invalid reuse without correction',async()=>{
 const p=await prepare();
 for(const mutate of [
  w=>delete w.contextRef,w=>w.contextRef='other',w=>w.inputRef=p.input.assertion.inputRef,w=>w.schemaVersion='dialogue-reception/5',
  w=>w.units=[],w=>w.units.push(structuredClone(w.units[0])),w=>delete w.units[0].coverage,w=>w.units[0].status='extracted',
  w=>delete w.units[0].utterances[0].mode,w=>delete w.units[0].utterances[0].scope.condition,w=>w.units[0].utterances[0].id='invented',
  w=>w.units[0].utterances[0].speaker.actorId='missing',w=>w.units[0].utterances[0].speaker.span=null,
  w=>w.units[0].utterances[0].content={ref:'utterance.content'},
  w=>delete w.units[0].utterances[0].receptions[0].evidence,
  w=>w.units[0].utterances[0].receptions[0].status='received',
  w=>w.units[0].utterances[0].receptions[0].content={ref:'reception.content'},
  w=>w.units[0].utterances[0].receptions[0].content=select(p,'乙听清全部'),
  w=>w.units[0].utterances[0].receptions[0].evidence.span={ref:'utterance.content',quote:full},
  w=>w.units[0].utterances[0].receptions[0].evidence.span={ref:'missing'},
  w=>w.units[0].utterances[0].receptions[0].listener={actorId:'b',kind:'reply',span:select(p,'甲对乙和丙说'),historyMessageId:0},
  w=>w.units[0].utterances[0].receptions[0].listener={actorId:'b',kind:'reply',span:{ref:'utterance.content'},historyMessageId:99},
  w=>w.units[0].utterances[0].receptions[0].listener.actorId=null,
  w=>w.units[0].utterances[0].receptions[0].evidence.span.quote='不存在',
  w=>w.units[0].utterances[0].receptions[0].reason=null,
  w=>w.units[0].utterances[0].receptions[1].content={ref:'utterance.content'},
 ]){const w=wire(p);mutate(w);const copy=structuredClone(w);assert.throws(()=>p.check(w));assert.deepEqual(w,copy);}
});

test('nonreception, unknown identity, explicit none and unformable-content ambiguity retain original meanings',async()=>{
 const p=await prepare(),blocked=wire(p);blocked.units[0].utterances[0].receptions[2].evidence.kind='obstacle';blocked.units[0].coverage.status='recorded';assert.equal(p.check(blocked).receptions[2].status,'not_received');
 const unknown=wire(p);unknown.units[0].utterances[0].receptions[2].listener={actorId:null,kind:'unknown',span:select(p,'后半句是否听清不明'),historyMessageId:null};assert.deepEqual(p.check(unknown).receptions[2].recipientIds,[]);
 const none=wire(p);none.units[0].utterances=[];none.units[0].coverage.status='none';assert.deepEqual(p.check(none).receptions,[]);schemaCheck(p,none);
 const unresolved=structuredClone(none);unresolved.units[0].coverage.status='uncertain';unresolved.units[0].unresolved=[{span:select(p,'后半句是否听清不明'),reason:'无法确定范围'}];assert.equal(p.check(unresolved).assertions.units[0].status,'unresolved');
 const bad=structuredClone(none);bad.units[0].coverage.status='recorded';assert.throws(()=>p.check(bad));
});

function runtime(complete){
 let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:options.sourceAnchor.chatId,actors:createOpeningFixture().actors,operations:{}}}},writes=0,calls=0,asked=0;
 const chat=[{mes:options.history[0].text,is_user:true},{mes:text,is_user:false,swipe_id:0}];
 const mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{writes++;state=v;}},tavern={chatId:options.sourceAnchor.chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]};
 const adapter=dialogue.createDialogueSemanticAdapter({outputContract:'dialogue-reception/6',complete:async req=>{calls++;return complete(req,chat);}});
 const make=()=>createStoryKnowledgeRuntime({mvu,tavern,catalog:{id:'semantic.test',actors:options.actors,facts:[]},getAnchor:()=>({...options.sourceAnchor}),dialogue:{...adapter,dependencies:async({request,pending})=>request.text==='依赖'?[pending[0].id]:[],ask:async()=>{asked++;return null;}}});
 return {make,state:()=>structuredClone(state),counts:()=>({writes,calls,asked})};
}
test('explicit v6 runtime registers only heard range; reopens idempotently and asks only on actual dependency',async()=>{
 const rt=runtime(async req=>{assert.equal(req.responseFormat.json_schema.name,'dialogue_reception_v6');return JSON.stringify(wire(await prepare(JSON.parse(req.messages[1].content))));}),k=rt.make();
 const result=await k.observeDialogue(options.sourceAnchor);assert.equal(result.pending.length,1);
 assert.deepEqual(k.context().actorKnowledge.find(a=>a.actorId==='c').facts.map(f=>f.content.text),['渡口停航']);
 assert.equal(result.pending[0].content,'明早走山路。');assert.equal(result.pending[0].receptionBinding.evidence.kind,'unknown');
 const reopened=rt.make();await reopened.observeDialogue(options.sourceAnchor);assert.equal(rt.counts().calls,1);
 assert.equal((await reopened.prepareDialogueTurn({text:'无关'})).status,'ready');assert.equal(rt.counts().asked,0);
 assert.equal((await reopened.prepareDialogueTurn({text:'依赖'})).status,'deferred');assert.equal(rt.counts().asked,1);
 await reopened.prepareDialogueTurn({text:'依赖'});assert.equal(rt.counts().asked,1);
 await reopened.resolveDialogue({id:result.pending[0].id,received:false,recipientIds:['c']});
 assert.equal((await reopened.prepareDialogueTurn({text:'依赖'})).status,'ready');
 assert.deepEqual(reopened.context().actorKnowledge.find(a=>a.actorId==='c').facts.map(f=>f.content.text),['渡口停航']);
});

test('invalid raw JSON, duplicate fields, missing selections and changed source never write state',async()=>{
 for(const kind of ['json','duplicate','missing','source']){
  const rt=runtime(async(req,chat)=>{const w=wire(await prepare(JSON.parse(req.messages[1].content)));if(kind==='missing')delete w.units[0].utterances[0].content;if(kind==='source')chat[1].mes+='改';const raw=JSON.stringify(w);return kind==='json'?raw+'非法':kind==='duplicate'?raw.replace('"contextRef":','"contextRef":"wrong","contextRef":'):raw;}),before=rt.state();
  await assert.rejects(rt.make().observeDialogue(options.sourceAnchor));assert.equal(rt.counts().writes,0);assert.deepEqual(rt.state(),before);
 }
});

test('v6 is opt-in; actual raw failures cannot fall back or be upgraded to selections',async()=>{
 const p=await prepare(),old=await dialogue.prepareRelatedDialogueExtraction(options),adapter=dialogue.createDialogueSemanticAdapter({complete:async()=>{throw Error('must not call');}});
 assert.equal(adapter.extract.outputContract,'dialogue-reception/5');await assert.rejects(adapter.extract(p.input,p.messages,p.responseFormat),/contract required/);
 const v6=dialogue.createDialogueSemanticAdapter({outputContract:'dialogue-reception/6',complete:async()=>JSON.stringify(wire(p))});await assert.rejects(v6.extract(old.input,old.messages,old.responseFormat),/contract required/);
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['uncertaintycheck.reproduce.partial','uncertaintycheck.probe.partial','relation.followup.partial']){
  const raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),fresh=await prepare(JSON.parse(req.messages[1].content));
  const a=dialogue.createDialogueSemanticAdapter({outputContract:'dialogue-reception/6',complete:async()=>raw});
  await assert.rejects(async()=>fresh.check(await a.extract(fresh.input,fresh.messages,fresh.responseFormat)));assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
});

test('the new speaker selector cannot coerce numeric actor IDs into catalogue keys',async()=>{
 const p=await prepare({...options,actors:{'1':'甲',b:'乙',c:'丙'}}),w=wire(p);w.units[0].utterances[0].speaker.actorId='1';
 assert.equal(p.check(w).receptions[0].speakerId,'1');
 w.units[0].utterances[0].speaker.actorId=1;assert.throws(()=>p.check(w),/speaker/);
});

test('source-grounded obstacle and unsaid examples preserve nonreception rather than manufacture knowledge',async()=>{
 for(const source of ['甲回答：“渡口停航。”乙已经走远，听不到这里。','甲在心中拟好“渡口停航”的回答，没有开口。']){
  const p=await prepare({...options,sourceAnchor:{...options.sourceAnchor,text:source}}),s=q=>select(p,q),unsaid=source.includes('心中');
  const w={schemaVersion:'dialogue-reception/6',contextRef:p.input.contextRef,units:[{id:'turn',claims:[],unresolved:[],coverage:{status:unsaid?'none':'recorded',evidence:s(source),reason:unsaid?'只有内心拟答':'明确听不到'},utterances:unsaid?[]:[{speaker:{actorId:'a',span:s('甲')},content:s('渡口停航。'),mode:'asserted',scope:{time:null,condition:null,attribution:null},anchor:s('甲回答：“渡口停航。”'),receptions:[{content:{ref:'utterance.content'},listener:{actorId:'b',kind:'reply',span:{ref:'utterance.content'},historyMessageId:0},evidence:{kind:'obstacle',span:s('乙已经走远，听不到这里。')},propositionRef:null,reason:''}]}]}]};
  schemaCheck(p,w);const checked=p.check(w);assert.deepEqual(checked.receptions.map(r=>r.status),unsaid?[]:['not_received']);
 }
});

test('necessary non-speech assertions remain in the shared contract; references cannot convert action to speech',async()=>{
 const p=await prepare(),w=wire(p),s=q=>select(p,q);
 w.units[0].claims=[{id:'necessary.state',type:'state',args:{entity:'丙',name:'听清范围',value:'前半句'},argumentSpans:{entity:s('丙'),name:s('只听清'),value:s('前半句')},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:s('丙只听清前半句')}];
 schemaCheck(p,w);assert.equal(p.check(w).assertions.units[0].claims[0].id,'necessary.state');
 const bad=structuredClone(w);bad.units[0].utterances[0].receptions[0].content={ref:'necessary.state'};assert.throws(()=>p.check(bad));
 const missing=structuredClone(w);missing.units[0].claims[0].argumentSpans.value=null;assert.throws(()=>p.check(missing));
 const wrongMode=wire(p);wrongMode.units[0].utterances[0].mode='conditional';assert.throws(()=>p.check(wrongMode));
});
