import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningFixture} from 'file:///C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG%20outputs/work/rules_engine/gm_runtime/opening.mjs';
import {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION} from 'file:///C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG%20outputs/work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/formal-parity-20261117/node-runtime/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {adoptNativeChatBranch} from 'file:///C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG%20outputs/work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/formal-parity-20261117/node-runtime/work/rules_engine/mvu_poc/adapter.mjs';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const catalog={id:'isolated.clinic.knowledge.v1',actors:{player:'御临风',bright:'布莱特',huang:'黄泉'},
 facts:[{id:'clinic.old_friend',entityId:'clinic.owner',field:'old_friend',value:'馆主与雪老有旧。',certainty:'confirmed',visibility:'private'},
  {id:'common.lodging',entityId:'common.travel',field:'lodging',value:'旅人可以询问客栈住宿。',certainty:'confirmed',visibility:'public'}],
 lore:[{book:'isolated.book',uid:31,content:'诊所。馆主与雪老有旧。',publicContent:'诊所。'}]};
function fixture(chatId='isolated.clinic.a',factCatalog=catalog){
 const {actors}=createOpeningFixture();
 const chat=[{is_user:false,mes:'隔离、非Canon：来客已听到一则明确消息。',swipe_id:0}],floors={0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId,actors,operations:{}}}}};
 const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(data,{message_id})=>{floors[message_id]=structuredClone(data);}};
 const tavern={chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};
 const getAnchor=()=>({chatId:tavern.chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0});
 const create=()=>createStoryKnowledgeRuntime({mvu,tavern,getAnchor,catalog:factCatalog});
 const sourceAnchor=()=>({...getAnchor(),text:chat.at(-1).mes});
 const receipt=(id,recipients,extra={})=>({id,status:'received',authority:'host-confirmed',sourceAnchor:sourceAnchor(),propositionRefs:['clinic.old_friend'],recipientIds:recipients,channel:'message',belief:'confirmed',...extra});
 const advance=text=>{const old=structuredClone(floors[chat.length-1]);chat.push({is_user:false,mes:text,swipe_id:0});floors[chat.length-1]=old;};
 return {mvu,tavern,chat,floors,getAnchor,create,receipt,advance};
}
const known=(runtime,id)=>runtime.context().actorKnowledge.find(a=>a.actorId===id).facts;

const boundary=n=>({id:'legacy.story.order',clock:'turn',at:n,actorId:'legacy.story'});
test('generation distinguishes source requirements, personal choices and reviewed mistaken dialogue',async()=>{
 const f=fixture(),request={user_input:'继续对话',ordered_prompts:['原人物与文风','user_input']};
 const projected=await f.create().generate({request,event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});
 for(const clause of ['只把有来源依据的内容归为原要求','个人安排不反向成为对方提出的条件',
  '旧对白只能证明人物曾这样说，不能反过来扩写来源','不强制道歉、披露或撤销个人安排'])assert.ok(projected.user_input.includes(clause),clause);
 assert.deepEqual(projected.ordered_prompts,request.ordered_prompts);
});

const attributionSource='非Canon：甲告诉乙一则消息，并说：“等我与你核对后，你再告诉丙。”乙答应了。';
const attributionQuote='等我与你核对后，你再告诉丙。';
const personalArrangement='乙说：“我打算明早带上笔记再谈，这会儿也先不告诉丁。”';
const mistakenAttribution='乙说：“甲当初要求明早带上笔记，而且也不准告诉丁。”';
const attributionNote='【来源核对（非角色对白）：原记录保留。已核定此处把个人安排归给原约定；原来源只支持甲乙核对后可向丙说明。未规定核对方式或限制向丁说明；人物仍可自行谨慎安排，不强制披露或改口。】';
async function attributionFixture(){
 const c=structuredClone(catalog),f=fixture('isolated.attribution',c);f.chat[0].mes=attributionSource;
 await f.create().receive(f.receipt('source',['bright'],{disclosure:{sourceQuote:attributionQuote}}));
 f.advance(personalArrangement);f.advance(mistakenAttribution);
 c.rejectedNarration=[{...f.getAnchor(),message:mistakenAttribution,sourceAnchors:[{chatId:f.tavern.chatId,messageId:0,swipeId:0,text:attributionSource}],annotation:attributionNote}];
 return {f,c,k:f.create()};
}
test('reviewed attribution annotation preserves original prose, personal choices and source state through generation',async()=>{
 const {f,k}=await attributionFixture(),before=JSON.stringify({chat:f.chat,floors:f.floors}),context=k.context();
 const messages=[{role:'system',content:'原文风与记忆'},{role:'assistant',content:personalArrangement+'\n'+mistakenAttribution},
  {role:'user',content:mistakenAttribution},{role:'assistant',content:'乙说：“甲当初要求明早带上笔记。”'}];
 const input=structuredClone(messages),projected=k.projectMessages(messages);
 assert.equal(projected[1].content,messages[1].content+'\n'+attributionNote);
 assert.deepEqual(projected.filter((_,i)=>i!==1),messages.filter((_,i)=>i!==1));
 assert.deepEqual(k.projectMessages(projected),projected,'Repeated generation hooks must not duplicate annotations.');
 assert.deepEqual(messages,input);assert.deepEqual(k.context(),context);
 let listener;const output=await k.generate({request:{user_input:'继续原场景',ordered_prompts:['文风保持','user_input']},event:'capture',
  eventOn:(_,fn)=>{listener=fn;},eventRemoveListener:()=>{listener=null;},generateRaw:async request=>{
   const data={messages:[...structuredClone(messages),{role:'user',content:request.user_input}]};listener(data);listener(data);
   assert.equal(data.messages[1].content,projected[1].content);
   assert.ok(request.user_input.includes(attributionQuote));return '乙暂时没有继续说明。';
  }});
 assert.equal(output,'乙暂时没有继续说明。');assert.equal(listener,null);
 assert.equal(JSON.stringify({chat:f.chat,floors:f.floors}),before);
 assert.ok(!known(k,'player').some(x=>x.id==='clinic.old_friend'));
});
test('attribution annotations require the reviewed utterance and its original source on the retained branch',async()=>{
 for(const change of ['chat','utterance','swipe','source','source-swipe','future-anchor']){
  const {f,c,k}=await attributionFixture(),messages=[{role:'assistant',content:mistakenAttribution}];
  assert.ok(k.projectMessages(messages)[0].content.includes(attributionNote));
  if(change==='chat')f.tavern.chatId='isolated.other';
  if(change==='utterance')f.chat[2].mes+='已改写';
  if(change==='swipe')f.chat[2].swipe_id=1;
  if(change==='source')f.chat[0].mes='非Canon：甲明确要求了这些新增条件。';
  if(change==='source-swipe')f.chat[0].swipe_id=1;
  if(change==='future-anchor')c.rejectedNarration[0].sourceAnchors[0].messageId=3;
  assert.deepEqual(k.projectMessages(messages),messages,change);
 }
});
test('matching language in a supported agreement or a new adopted agreement is not automatically flagged',async()=>{
 const {f,c,k}=await attributionFixture();
 f.advance('非Canon：甲乙后来明确约定明早携带笔记，并暂不向丁说明。');
 await k.receive(f.receipt('new.agreement',['bright'],{disclosure:{sourceQuote:'甲乙后来明确约定明早携带笔记，并暂不向丁说明。'}}));
 const later=[{role:'assistant',content:'乙说：“刚才新约定了明早带笔记。”'}];
 assert.deepEqual(k.projectMessages(later),later);
 const notes=known(k,'bright').find(x=>x.id==='clinic.old_friend').sources.map(s=>s.disclosure.sourceQuote);
 assert.deepEqual(notes,[attributionQuote,'甲乙后来明确约定明早携带笔记，并暂不向丁说明。']);
 const historical=k.projectMessages([{role:'assistant',content:mistakenAttribution}]);
 assert.ok(historical[0].content.includes(attributionNote),'A later agreement does not retroactively validate the old attribution.');
 // The same terms genuinely present in a different retained source are not a matching reviewed error.
 c.rejectedNarration=[];assert.deepEqual(k.projectMessages([{role:'assistant',content:mistakenAttribution}]),[{role:'assistant',content:mistakenAttribution}]);
});

test('generation contract preserves source identity and condition roles while keeping disclosure optional',async()=>{
 const f=fixture(),request={user_input:'继续原场景',ordered_prompts:['原人物与文风','user_input']};
 const projected=await f.create().generate({request,event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});
 for(const clause of ['来源关系未明确关联时保持未定，不合并身份，也不反向断言必为不同人',
  '保持条件中的参与者、动作、完成状态和允许范围',
  '转述或更换听者后，代词和省略不得悄悄替换这些角色',
  '条件满足只表示可以披露，仍由人物决定是否说出'])assert.ok(projected.user_input.includes(clause),clause);
 assert.ok(projected.user_input.includes('保留原文风'));
 assert.ok(projected.user_input.includes('角色的隐瞒、谎言和推测仍是其说法'));
 assert.deepEqual(projected.ordered_prompts,request.ordered_prompts);
});

// Paired prose is a human semantic rubric, not an automatic output judge.
// Exercise real receipt/context/generate paths with both acceptable and faulty prose:
// neither may be silently rewritten or become a knowledge/condition event.
const referenceExamples=JSON.parse(await readFile(new URL('./story-source-reference.examples.json',"file:///C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG%20outputs/work/rules_engine/gm_runtime/story-knowledge.test.mjs"),'utf8'));
for(const example of referenceExamples)test('source/reference projection preserves evidence and leaves output unadopted: '+example.id,async()=>{
 const c=structuredClone(catalog);c.actors={player:'时雨',bright:'岑舟',huang:'陆禾'};
 c.facts[0].value=example.fact??'旧账册存于西库。';
 const f=fixture('isolated.reference.'+example.id,c);
 for(const [i,source] of example.sources.entries()){
  if(i===0)f.chat[0].mes=source.text;else f.advance(source.text);
  f.chat.at(-1).is_system=true;
  await f.create().receive(f.receipt('reference.'+i,['bright'],source.quote?{disclosure:{sourceQuote:source.quote}}:{}));
 }
 const k=f.create(),before=structuredClone(f.floors),context=k.context();
 const sources=known(k,'bright').find(x=>x.id==='clinic.old_friend').sources;
 assert.deepEqual(sources.map(s=>s.sourceAnchor.text),example.sources.map(s=>s.text));
 assert.deepEqual(sources.map(s=>s.disclosure),example.sources.map(s=>s.quote?{sourceQuote:s.quote}:null));
 assert.ok(sources.every(s=>s.senderId===null),'Textual identity evidence must not manufacture actor IDs.');
 for(const prose of [...example.accepted,...example.rejected]){
  let actual;const listeners=new Map();
  const history=example.history??[],messages=[{role:'system',content:'原人物、文风与非空记忆'},...history,{role:'user',content:example.input}],originalMessages=structuredClone(messages);
  const output=await k.generate({request:{user_input:example.input,temperature:1,ordered_prompts:['文风保持','user_input']},
   event:'capture',eventOn:(e,fn)=>listeners.set(e,fn),eventRemoveListener:e=>listeners.delete(e),generateRaw:async r=>{
    actual=r;const data={messages:[...structuredClone(messages),{role:'user',content:r.user_input}]};listeners.get('capture')(data);
    assert.deepEqual(data.messages.slice(0,-1),originalMessages,'Source claims in old dialogue stay dialogue.');
    return prose;}});
  assert.equal(output,prose,'No automatic review or rewriting route.');
  assert.deepEqual(JSON.parse(actual.user_input.split('【901逐角色知情投影】\n')[1].split('\n')[0]),context);
  assert.ok(actual.user_input.startsWith(example.input+'\n'));assert.equal(actual.temperature,1);
  assert.equal(actual.user_input.split(STORY_COMMUNICATION_INSTRUCTION).length-1,1,'Current contract is injected once.');
  assert.deepEqual(messages,originalMessages);
  assert.deepEqual(f.floors,before);assert.equal(listeners.size,0);
 }
 assert.equal(known(k,'bright').find(x=>x.id==='clinic.old_friend').content,c.facts[0].value);
 for(const actor of ['player','huang']){assert.ok(!known(k,actor).some(x=>x.id==='clinic.old_friend'));assert.ok(known(k,actor).some(x=>x.id==='common.lodging'));}
});

test('private knowledge exposes its actual source without inventing a duty of secrecy',async()=>{
 const f=fixture(),k=f.create();await k.receive(f.receipt('ordinary.private',['bright']));
 const fact=known(k,'bright').find(x=>x.id==='clinic.old_friend');
 assert.deepEqual(fact.sources,[{eventRef:'received.ordinary.private',channel:'message',belief:'confirmed',senderId:null,
  learnedAt:boundary(0),sourceAnchor:{...f.getAnchor(),text:f.chat[0].mes},disclosure:null}]);
 assert.equal(known(k,'huang').some(x=>x.id==='clinic.old_friend'),false);
 assert.deepEqual(known(k,'bright').find(x=>x.id==='common.lodging').sources,[]);
});

test('explicit disclosure notes remain source-bound after reopening and are not silently inherited by a listener',async()=>{
 const f=fixture();f.chat[0].mes='隔离、非Canon：来客告知关系，并说：先别告诉其他人。';
 const k=f.create(),note={sourceQuote:'先别告诉其他人。'};
 await k.receive(f.receipt('with.note',['bright'],{disclosure:note}));
 assert.deepEqual(known(f.create(),'bright').find(x=>x.id==='clinic.old_friend').sources[0].disclosure,note);
 f.advance('隔离、非Canon：另一条独立消息确认关系，没有新的披露约定。');
 await k.receive(f.receipt('second.source',['bright']));
 const sources=known(k,'bright').find(x=>x.id==='clinic.old_friend').sources;
 assert.equal(sources.length,2);assert.deepEqual(sources[0].disclosure,note);assert.equal(sources[1].disclosure,null);
 f.advance('隔离、非Canon：布莱特实际告诉黄泉这条关系，未传达保密要求。');
 await k.receive(f.receipt('relay.note.not.shared',['huang'],{senderId:'bright'}));
 const received=known(k,'huang').find(x=>x.id==='clinic.old_friend');
 assert.equal(received.sources[0].senderId,'bright');assert.equal(received.sources[0].disclosure,null);
 // A real disclosure can breach an agreement; a social constraint must not erase an actual received event.
 assert.ok(received);assert.deepEqual(known(k,'bright').find(x=>x.id==='clinic.old_friend').sources[0].disclosure,note);
});

test('a disclosure constraint must quote the retained source rather than arbitrary inferred secrecy',async()=>{
 for(const disclosure of [{sourceQuote:'杜撰的保密约定'}, {sourceQuote:''}, {sourceQuote:'来客',mustTell:true}]){
  const f=fixture(),before=structuredClone(f.floors);
  await assert.rejects(f.create().receive(f.receipt('invalid.note',['bright'],{disclosure})),/disclosure|披露/);
  assert.deepEqual(f.floors,before);
 }
});

test('ordinary generation carries choice guidance and source notes without prescribing prose or granting listeners',async()=>{
 const f=fixture();f.chat[0].mes='非Canon：来客已告知关系。请等单独谈话时再说。';const k=f.create();
 await k.receive(f.receipt('context.note',['bright'],{disclosure:{sourceQuote:'请等单独谈话时再说。'}}));
 const before=structuredClone(f.floors),request={user_input:'御临风询问关系。',ordered_prompts:[{role:'system',content:'原文风及人物资料'},'user_input'],temperature:1};
 let actual;const listeners=new Map();
 const output=await k.generate({request,event:'settings',eventOn:(e,fn)=>listeners.set(e,fn),eventRemoveListener:(e)=>listeners.delete(e),generateRaw:async r=>{actual=r;return '布莱特暂未告诉黄泉。';}});
 assert.equal(output,'布莱特暂未告诉黄泉。');assert.deepEqual(actual.ordered_prompts,request.ordered_prompts);assert.equal(actual.temperature,1);
 assert.ok(actual.user_input.includes('知情不等于必须说出'));
 assert.ok(actual.user_input.includes('私下获告不自动构成保密义务'));
 assert.ok(actual.user_input.includes('当前目的'));
 assert.ok(actual.user_input.includes('请等单独谈话时再说。'));
 assert.deepEqual(f.floors,before);assert.equal(listeners.size,0);
 assert.equal(known(k,'huang').some(x=>x.id==='clinic.old_friend'),false);
});

test('a hidden source retains the speaker and quotation context in the final knowledge projection',async()=>{
 const f=fixture(),source='隔离、非Canon：报信人向布莱特说：“先别告诉同行者，等我们核对过记录后再谈。”布莱特听到并答应，其他人未听见。';
 f.chat[0].mes=source;f.chat[0].is_system=true;
 const quote='先别告诉同行者，等我们核对过记录后再谈。';
 await f.create().receive(f.receipt('hidden.source',['bright'],{disclosure:{sourceQuote:quote}}));
 f.advance('隔离、非Canon：同行者换到安静处，布莱特先前提过稍后再说；没有新增核对或解约记录。');
 const before=structuredClone(f.floors),k=f.create(),request={user_input:'“你还有什么想说的吗？”',ordered_prompts:[{role:'system',content:'原文风'},'user_input']};
 let actual;
 await k.generate({request,event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>{actual=r;return '';}});
 const context=JSON.parse(actual.user_input.split('【901逐角色知情投影】\n')[1].split('\n')[0]);
 const sourceProjection=context.actorKnowledge.find(a=>a.actorId==='bright').facts.find(f=>f.id==='clinic.old_friend').sources[0];
 assert.deepEqual(sourceProjection.sourceAnchor,{chatId:f.tavern.chatId,messageId:0,swipeId:0,text:source});
 assert.equal(sourceProjection.senderId,null,'Do not invent an actor ID for an unnamed source.');
 assert.deepEqual(sourceProjection.disclosure,{sourceQuote:quote});
 assert.deepEqual(actual.ordered_prompts,request.ordered_prompts);
 assert.equal(context.actorKnowledge.find(a=>a.actorId==='huang').facts.some(f=>f.id==='clinic.old_friend'),false);
 assert.deepEqual(f.floors,before,'Projection and quieter surroundings do not create receipt or release events.');
});

test('a later explicit source confirmation retains both source contexts without granting listeners',async()=>{
 const f=fixture(),quote='等我们核对过记录后再谈。';
 f.chat[0].mes='隔离、非Canon：报信人对布莱特说：“'+quote+'”';
 const first=f.chat[0].mes;
 await f.create().receive(f.receipt('original.note',['bright'],{disclosure:{sourceQuote:quote}}));
 f.advance('隔离、非Canon：原报信人与布莱特已经单独核对记录，该人说：“刚才要求的核对已完成，可以向同行者说明。”布莱特收到这句话，同行者没有听见。');
 const second=f.chat.at(-1).mes,release='刚才要求的核对已完成，可以向同行者说明。';
 await f.create().receive(f.receipt('actual.confirmation',['bright'],{disclosure:{sourceQuote:release}}));
 const k=f.create(),sources=known(k,'bright').find(f=>f.id==='clinic.old_friend').sources;
 assert.deepEqual(sources.map(s=>s.sourceAnchor.text),[first,second]);
 assert.deepEqual(sources.map(s=>s.disclosure.sourceQuote),[quote,release]);
 assert.deepEqual(sources.map(s=>s.sourceAnchor.messageId),[0,1]);
 assert.equal(known(k,'huang').some(f=>f.id==='clinic.old_friend'),false);
});

test('catalog time, discovery and dependency boundaries survive initialization and control public projection',async()=>{
 const c=structuredClone(catalog),base=c.facts[1];
 c.facts.push({...base,id:'public.future',effectiveAt:boundary(2)},
  {...base,id:'public.conditional',discoveryConditions:['actual.observation'],dependencyRefs:['event.required']},
  {...base,id:'public.other.clock',effectiveAt:{id:'world',clock:'worldMinutes',at:0,actorId:null}});
 const f=fixture('isolated.boundary',c),k=f.create();
 assert.deepEqual(k.read().facts['public.future'].effectiveAt,boundary(2));
 assert.deepEqual(k.read().facts['public.conditional'].dependencyRefs,['event.required']);
 assert.deepEqual(known(k,'bright').map(x=>x.id),['common.lodging']);
 f.advance('非Canon：第二条记录');f.advance('非Canon：第三条记录');
 assert.ok(known(k,'bright').some(x=>x.id==='public.future'));
 assert.ok(!known(k,'bright').some(x=>x.id==='public.conditional'));
 assert.ok(!known(k,'bright').some(x=>x.id==='public.other.clock'));
});
test('future or differently clocked facts cannot be granted by a current message receipt',async()=>{
 for(const effectiveAt of [boundary(2),{id:'world',clock:'worldMinutes',at:0,actorId:null}]){
  const c=structuredClone(catalog);c.facts[0].effectiveAt=effectiveAt;
  const f=fixture('isolated.future',c),before=structuredClone(f.floors);
  await assert.rejects(f.create().receive(f.receipt('premature',['bright'])));
  assert.deepEqual(f.floors,before);
 }
});
test('later-recorded old receipt cannot replace newer belief or upgrade a relay',async()=>{
 const f=fixture(),k=f.create(),old=f.receipt('older',['bright']);
 f.advance('非Canon：该接收者获告较新、不确定的消息。');
 await k.receive(f.receipt('newer',['bright'],{belief:'rumor'}));await k.receive(old);
 assert.equal(known(k,'bright').find(x=>x.id==='clinic.old_friend').belief,'rumor');
 assert.deepEqual(known(k,'bright').find(x=>x.id==='clinic.old_friend').effectiveAt,boundary(0));
 assert.deepEqual(known(k,'bright').find(x=>x.id==='clinic.old_friend').learnedAt,boundary(1));
 f.advance('非Canon：转告');
 await assert.rejects(k.receive(f.receipt('bad.upgrade',['huang'],{senderId:'bright'})),/belief|传闻|确认/);
});
test('source replaced while disk save is pending cannot create an acquisition event',async()=>{
 const f=fixture(),k=f.create(),receipt=f.receipt('changed.during.save',['bright']);
 f.tavern.saveChat=async()=>{f.chat[0].mes='非Canon：原告知已撤销。';};
 f.tavern.readSavedChat=async()=>[{}, {mes:receipt.sourceAnchor.text,swipe_id:0}];
 await assert.rejects(k.receive(receipt));assert.equal(f.floors[0].stat_data['901_rules_poc'].storyKnowledge,undefined);
});
test('public but undiscovered facts cannot be relayed by an uninformed sender',async()=>{
 const c=structuredClone(catalog);c.facts[0].visibility='public';c.facts[0].discoveryConditions=['visit.required'];
 const f=fixture('isolated.discovery',c),k=f.create();
 await assert.rejects(k.receive(f.receipt('not.yet.discovered',['huang'],{senderId:'bright'})),/not acquired/);
 assert.ok(!known(k,'bright').some(x=>x.id==='clinic.old_friend'));
 await k.receive(f.receipt('observed',['bright'],{channel:'observation'}));
 f.advance('非Canon：实际转告');await k.receive(f.receipt('discovered.relay',['huang'],{senderId:'bright'}));
 assert.ok(known(k,'huang').some(x=>x.id==='clinic.old_friend'));
});
test('historical known state retains its own effective and learned time rather than receiving an unseen update',async()=>{
 const c=structuredClone(catalog);c.facts.push({...c.facts[0],id:'state.new',value:'更新后状态',effectiveAt:boundary(2)});
 const f=fixture('isolated.history',c),k=f.create();await k.receive(f.receipt('old.known',['bright']));
 f.advance('非Canon：时间顺序向后');f.advance('非Canon：世界资料有变化，但未告知');
 const knownFacts=known(k,'bright');assert.equal(knownFacts.filter(x=>x.id==='state.new').length,0);
 assert.deepEqual(knownFacts.find(x=>x.id==='clinic.old_friend').effectiveAt,boundary(0));
 assert.deepEqual(knownFacts.find(x=>x.id==='clinic.old_friend').learnedAt,boundary(0));
 for(const status of ['planned','pending','sent'])await assert.rejects(k.receive(f.receipt('not.received.'+status,['huang'],{status,propositionRefs:['state.new']})));
 assert.ok(!known(k,'huang').some(x=>x.id==='state.new'));
});

test('receipt survives actual JSONL disk save and a fresh runtime reconstructed from saved variables',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'901-knowledge-save-')),path=join(directory,'isolated.jsonl');
 try{
  const f=fixture();
  f.tavern.saveChat=async()=>writeFile(path,[{},...f.chat.map((m,i)=>({...m,variables:[f.floors[i]]}))].map(v=>JSON.stringify(v)).join('\n'));
  f.tavern.readSavedChat=async()=> (await readFile(path,'utf8')).split('\n').map(s=>JSON.parse(s));
  await f.create().receive(f.receipt('disk.received',['bright']));
  const saved=await f.tavern.readSavedChat(),reopened=fixture();
  reopened.chat.splice(0,reopened.chat.length,...saved.slice(1));
  for(const [i,m] of saved.slice(1).entries())reopened.floors[i]=m.variables[0];
  assert.ok(known(reopened.create(),'bright').some(x=>x.id==='clinic.old_friend'));
  assert.ok(!known(reopened.create(),'huang').some(x=>x.id==='clinic.old_friend'));
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('author truth is not initial party knowledge, while ordinary public facts remain available',()=>{
 const f=fixture(),k=f.create(),before=structuredClone(f.floors);
 for(const id of ['player','bright','huang']){assert.ok(!known(k,id).some(x=>x.id==='clinic.old_friend'));assert.ok(known(k,id).some(x=>x.id==='common.lodging'));}
 assert.deepEqual(k.projectEntries([{world:'isolated.book',uid:31,content:catalog.lore[0].content}])[0].content,'诊所。');
 assert.deepEqual(f.floors,before);
});
test('actual receipt grants only named listeners and explicit later relay reaches its recipient',async()=>{
 const f=fixture(),k=f.create(),before=structuredClone(f.floors[0].stat_data['901_rules_poc'].actors);
 await k.receive(f.receipt('heard.one',['bright']));
 assert.ok(known(k,'bright').some(x=>x.id==='clinic.old_friend'));assert.ok(!known(k,'huang').some(x=>x.id==='clinic.old_friend'));
 assert.ok(!known(k,'player').some(x=>x.id==='clinic.old_friend'));
 assert.deepEqual(f.floors[0].stat_data['901_rules_poc'].actors,before);
 f.advance('隔离、非Canon：布莱特已实际向黄泉转告该消息，黄泉收到。');
 await k.receive(f.receipt('relay.one',['huang'],{senderId:'bright'}));
 assert.ok(known(k,'huang').some(x=>x.id==='clinic.old_friend'));assert.ok(!known(k,'player').some(x=>x.id==='clinic.old_friend'));
});
test('retrieval, unreceived messages and an uninformed sender never grant knowledge',async()=>{
 const f=fixture(),k=f.create(),before=structuredClone(f.floors);
 for(const receipt of [f.receipt('not.arrived',['bright'],{status:'sent'}),f.receipt('model.said',['bright'],{authority:'model-output'}),
  f.receipt('wrong.sender',['huang'],{senderId:'bright'}),f.receipt('cross.chat',['bright'],{sourceAnchor:{...f.getAnchor(),chatId:'other',text:f.chat[0].mes}})])await assert.rejects(k.receive(receipt));
 assert.deepEqual(f.floors,before);
});
test('saved reopen and idempotent receipts retain knowledge without a second state or grant',async()=>{
 const f=fixture(),k=f.create(),receipt=f.receipt('heard.once',['bright']);await k.receive(receipt);
 const before=structuredClone(f.floors);assert.ok(known(f.create(),'bright').some(x=>x.id==='clinic.old_friend'));
 await f.create().receive(receipt);assert.deepEqual(f.floors,before);
 const other=fixture('isolated.clinic.b');assert.ok(!known(other.create(),'bright').some(x=>x.id==='clinic.old_friend'));
 other.floors[0]=structuredClone(f.floors[0]);assert.throws(()=>other.create().context(),/chat|分支/);
});
test('rumor is retained as rumor and a relay cannot silently upgrade belief',async()=>{
 const f=fixture(),k=f.create();await k.receive(f.receipt('heard.rumor',['bright'],{belief:'rumor'}));
 assert.equal(known(k,'bright').find(x=>x.id==='clinic.old_friend').belief,'rumor');
 f.advance('隔离、非Canon：仅转述先前传闻。');
 await assert.rejects(k.receive(f.receipt('relay.upgrade',['huang'],{senderId:'bright'})),/belief|传闻|确认/);
 await k.receive(f.receipt('relay.rumor',['huang'],{senderId:'bright',belief:'rumor'}));
 assert.equal(known(k,'huang').find(x=>x.id==='clinic.old_friend').belief,'rumor');
});
test('lore projection is bound to source identity, preserves other content and does not guess changed sources',()=>{
 const f=fixture(),k=f.create(),entry={world:'unrelated',uid:31,content:'普通吃住常识。'},before=structuredClone(entry);
 assert.deepEqual(k.projectEntries([entry]),[entry]);assert.deepEqual(entry,before);
 assert.throws(()=>k.projectEntries([{world:'isolated.book',uid:31,content:'来源已变更'}]),/来源/);
});

test('native branch adoption inherits the fork snapshot without sharing later receptions',async()=>{
 const parent=fixture(),p=parent.create();await p.receive(parent.receipt('heard.parent',['bright']));
 const child=fixture('isolated.clinic.child');child.floors[0]=structuredClone(parent.floors[0]);
 child.tavern.chatMetadata={main_chat:parent.tavern.chatId,integrity:'isolated-child-source'};
 await adoptNativeChatBranch({mvu:child.mvu,tavern:child.tavern,expectedParentChatId:parent.tavern.chatId,expectedRevision:1});
 assert.ok(known(child.create(),'bright').some(x=>x.id==='clinic.old_friend'));
 child.advance('隔离、非Canon：分支内黄泉收到消息。');
 await child.create().receive(child.receipt('heard.child',['huang']));
 assert.ok(known(child.create(),'huang').some(x=>x.id==='clinic.old_friend'));
 assert.ok(!known(parent.create(),'huang').some(x=>x.id==='clinic.old_friend'));
});

test('changed or discarded source swipes cannot continue to prove knowledge',async()=>{
 const f=fixture(),k=f.create();await k.receive(f.receipt('heard.retained',['bright']));
 f.chat[0].swipe_id=1;f.chat[0].mes='隔离、非Canon：此分支没有告知。';
 assert.throws(()=>k.context(),/retained branch/);
});

test('retained explicit reception decisions accompany their granted source without changing belief or prose',async()=>{
 const {CLINIC_KNOWLEDGE_CATALOG}=await import('file:///C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG%20outputs/work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/formal-parity-20261117/node-runtime/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs');
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',"file:///C:/Users/pit/.codex/worktrees/yulinfeng-tavern-plan/TRPG%20outputs/work/rules_engine/gm_runtime/story-knowledge.test.mjs");
 for(const [file,confirmed] of [['B2-alternate-after.chat.jsonl',false],['B3-confirmed-before-narration.chat.jsonl',true]]){
  const chat=(await readFile(new URL(file,dir),'utf8')).trim().split('\n').map(JSON.parse).slice(1),root=chat.at(-1).variables[0].stat_data['901_rules_poc'];
  const before=JSON.stringify(chat),k=createStoryKnowledgeRuntime({catalog:CLINIC_KNOWLEDGE_CATALOG,tavern:{chatId:root.chatId,chat},mvu:{getMvuData:({message_id})=>chat[message_id].variables[0]},getAnchor:()=>({chatId:root.chatId,messageId:chat.length-1,swipeId:0})});
  const facts=k.context().actorKnowledge.find(a=>a.actorId==='bright').facts,confirmedSources=facts.flatMap(f=>f.sources).filter(s=>s.receptionConfirmation);
  assert.equal(confirmedSources.length,confirmed?1:0);
  if(confirmed){
   const row=Object.values(root.storyKnowledge.dialogueBatches).flatMap(b=>b.rows).find(r=>r.decision);
   assert.deepEqual(confirmedSources[0].receptionConfirmation,{rowId:row.id,...row.decision});
   assert.equal(confirmedSources[0].belief,'uncertain');assert.ok(confirmedSources[0].sourceAnchor.text.includes('两人之中只有一人'));
   assert.equal(k.context().actorKnowledge.find(a=>a.actorId==='player').facts.length,0);
   const projected=await k.generate({request:{user_input:'继续原请求'},event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});
   assert.ok(projected.user_input.includes('接收确认不改变消息真伪，也不强制人物披露'));
  }
  assert.equal(JSON.stringify(chat),before);
 }
});
