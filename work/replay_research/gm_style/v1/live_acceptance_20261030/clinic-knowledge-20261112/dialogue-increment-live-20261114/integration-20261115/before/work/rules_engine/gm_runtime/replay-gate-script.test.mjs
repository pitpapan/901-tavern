import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {createOpeningRoster} from '../combat/opening.mjs';
import {createRecoveryFixture} from './recovery-fixture.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';

// Run the browser controller itself; replace only host APIs and model transport.
// Real Builder, gate and MVU adapter modules still execute.
async function hostFixture({ action = '我向布莱特点头，说：“我们到了。”',
  decision = { status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: '普通问候' }, combat = null, profile = {}, lorebooks = {901:[]}, generationError = null, brokenListenerStop = false, classificationTransport = null, stopResult = true,knowledgeCatalog=null,knowledgeDialogue=null } = {}) {
  const root = new URL('../../../', import.meta.url);
  const source = (await readFile(new URL('./replay-gate-script.example.js', import.meta.url), 'utf8'))
    .replaceAll("'/901-rules-runtime/", `'${root.href}`)
    .replace('export function registerReplayGate', 'function registerReplayGate');
  const baseline = JSON.parse(await readFile(new URL('work/character_builder/real_character/yulinfeng_replay_t0.baseline.json', root)));
  const chat = [{ is_user: true, mes: action, swipe_id: 0 }];
  const floors = {};
  const listeners = new Map();
  const stats = { classifications: 0, narrations: 0, saves: 0 };
  let fail = true;
  let hook;
  const generationHooks=new Map();
  const mvu = {
    getMvuData: ({ message_id }) => structuredClone(floors[message_id] ?? { stat_data: {} }),
    replaceMvuData: async (value, { message_id }) => { floors[message_id] = structuredClone(value); },
  };
  const host = {
    window: { top: { document: { getElementById: () => null } }, addEventListener() {} },
    console: { log() {}, info() {}, error() {} },
    SillyTavern: { chatId: 'host-test', chat, stopGeneration() {}, saveChat: async () => { stats.saves++; } },
    tavern_events: { GENERATION_STARTED:'start', GENERATION_STOPPED:'stopped', GENERATE_AFTER_DATA: 'generate', WORLDINFO_ENTRIES_LOADED: 'worlds',CHAT_COMPLETION_SETTINGS_READY:'settings' },
    eventMakeFirst: (event, listener) => { if(event==='generate')hook=listener;else generationHooks.set(event,listener); },
    eventOn: (event, listener) => { listeners.set(event, listener); return { stop: () => { if(!brokenListenerStop)listeners.delete(event); } }; },
    eventRemoveListener: (event, listener) => { if(listeners.get(event)===listener)listeners.delete(event); },
    stopGenerationById(id) { (stats.stoppedIds??=[]).push(id);listeners.get('stopped')?.(id);return stopResult; },
    getCurrentCharPrimaryLorebook: () => '901',
    getLorebookEntries: async book => { (stats.readBooks??=[]).push(book); return lorebooks[book]??[]; },
    fetch: async () => ({ ok: true, json: async () => baseline }),
    generateRaw: async request => {
      if (request.generation_id) {
        stats.classifications++;
        stats.lastClassificationRequest=request;
        if(classificationTransport)return classificationTransport({request,stats,chat,listeners});
        if(generationError)throw generationError;
        return JSON.stringify(decision);
      }
      stats.narrations++;
      stats.lastNarrationRequest = request;
      const lores = { globalLore: [{ world: 'foreign', position: 4, content: '<JSONPatch>' }],
        characterLore: Object.entries(lorebooks).flatMap(([world,entries])=>entries.length?entries.map(e=>({...e,world})):[{world,content:world}]), chatLore: [], personaLore: [] };
      listeners.get('worlds')?.(lores);
      stats.lastProjectedLore=structuredClone(lores);
      const assembled={messages:[{role:'user',content:request.user_input}]};listeners.get('settings')?.(assembled);
      stats.lastAssembledNarration=assembled;
      assert.deepEqual(lores.globalLore, []);
      assert.deepEqual([...new Set(lores.characterLore.map(e=>e.world))],Object.keys(lorebooks));
      if (decision.status === 'NO_CHECK') {
        assert.equal(chat.findLast(message=>message.is_user).extra['901_replay_gate'].status, 'NARRATION_PENDING');
        assert.ok(stats.saves > 0);
      }
      if (fail) throw Error('recorded continuation failure');
      return '布莱特微微颔首。';
    },
    setChatMessages: async updates => {
      for (const update of updates) {
        if(update.swipes){
          const row=chat[update.message_id];
          Object.assign(row,{swipe_id:update.swipe_id,swipes:structuredClone(update.swipes),variables:structuredClone(update.swipes_data),swipe_info:structuredClone(update.swipes_info),mes:update.swipes[update.swipe_id],extra:structuredClone(update.swipes_info[update.swipe_id])});
          floors[update.message_id]=structuredClone(update.swipes_data[update.swipe_id]);
          continue;
        }
        assert.equal(update.message, chat[update.message_id].mes);
        chat[update.message_id].extra = structuredClone(update.extra);
      }
    },
    getChatMessages: id => {
      const row=chat[Number(id)];
      return [{message_id:Number(id),name:row.name,role:row.is_user?'user':'assistant',is_hidden:!!row.is_system,swipe_id:row.swipe_id??0,
        swipes:structuredClone(row.swipes??[row.mes]),swipes_data:structuredClone(row.variables??[floors[id]??{}]),swipes_info:structuredClone(row.swipe_info??[row.extra??{}])}];
    },
    createChatMessages: async messages => {
      for (const message of messages) {
        assert.equal(message.role, 'assistant');
        if(message.data)floors[chat.length]=structuredClone(message.data);
        chat.push({ is_user: false, mes: message.message, extra: structuredClone(message.extra), swipe_id: 0 });
      }
    },
  };
  let controller;
  const knowledge=knowledgeCatalog?createStoryKnowledgeRuntime({mvu,tavern:host.SillyTavern,
    getAnchor:()=>({chatId:host.SillyTavern.chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0}),catalog:knowledgeCatalog,dialogue:knowledgeDialogue,
    readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i]??{})]}))]}):null;
  const load = async () => {
    const register = await new (Object.getPrototypeOf(async function() {}).constructor)(...Object.keys(host),
      source + '\nreturn registerReplayGate;')(...Object.values(host));
    profile.readSavedChat??=async()=>[{},...chat.map((m,i)=>({...m,variables:m.variables??[structuredClone(floors[i]??{})]}))];
    controller=register({ getMvu: async () => mvu, combat, profile,knowledge });
  };
  await load();
  return { chat, floors, stats, listeners, load,knowledge,get controller(){return controller;}, start:(type='regenerate')=>generationHooks.get('start')?.(type,{},false),run: () => hook({}, false), succeed: () => { fail = false; } };
}

test('ordinary saved narration invokes configured dialogue adapter without changing prose or memory route',async()=>{
 let extracted=0;
 const f=await hostFixture({knowledgeCatalog:{id:'dialogue.gate',actors:{bright:'布莱特'},facts:[]},knowledgeDialogue:{extract:async input=>{
  extracted++;assert.equal(input.sourceAnchor.text,'布莱特微微颔首。');
  return {contextRef:input.contextRef,assertions:{schemaVersion:'gm-assertion-output/1',inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],unresolved:[]}]},receptions:[]};
 }}});f.succeed();await f.run();assert.equal(extracted,1);assert.equal(f.chat.at(-1).mes,'布莱特微微颔首。');
 assert.equal(Object.values(f.knowledge.read().dialogueBatches)[0].status,'processed');
 assert.equal(f.stats.narrations,1);
});
test('saved prose survives extraction failure and completed-turn replay does not request prose again',async()=>{
 const statuses=[];const f=await hostFixture({knowledgeCatalog:{id:'dialogue.failure',actors:{bright:'布莱特'},facts:[]},profile:{onKnowledgeStatus:s=>statuses.push(s)},
  knowledgeDialogue:{extract:async()=>{throw Error('offline extraction failed');}}});
 f.succeed();await f.run();assert.equal(f.chat.at(-1).mes,'布莱特微微颔首。');assert.equal(statuses.at(-1).status,'unprocessed');
 assert.equal(f.chat.at(-1).extra['901_replay_gate'].status,'NO_CHECK');await f.run();assert.equal(f.stats.narrations,1);
});
test('ordinary next turn asks only when pending information is relevant, and deferred answer does not regenerate prose',async()=>{
 let relevant=false,asks=0;const statuses=[];
 const f=await hostFixture({knowledgeCatalog:{id:'dialogue.question',actors:{bright:'布莱特'},facts:[]},profile:{onKnowledgeStatus:s=>statuses.push(s),askKnowledge:async()=>{asks++;return null;}},
  knowledgeDialogue:{extract:async input=>{const text=input.sourceAnchor.text;return {contextRef:input.contextRef,assertions:{schemaVersion:'gm-assertion-output/1',inputRef:input.assertion.inputRef,units:[{id:'turn',status:'unresolved',claims:[],unresolved:[{span:{documentId:'current',start:0,end:text.length,quote:text},reason:'未确定是否传达消息'}]}]},receptions:[]};},
   dependencies:async({pending})=>relevant?[pending[0].id]:[]}});
 f.succeed();await f.run();assert.equal(asks,0);
 f.chat.push({is_user:true,mes:'无关闲聊',swipe_id:0});await f.run();assert.equal(asks,0);assert.equal(f.stats.narrations,2);
 relevant=true;f.chat.push({is_user:true,mes:'依赖那条消息行动',swipe_id:0});await f.run();assert.equal(asks,1);assert.equal(f.stats.narrations,2);assert.equal(statuses.at(-1).status,'deferred');
 await f.run();assert.equal(asks,1);assert.equal(f.stats.narrations,2);
});

test('ordinary story generation consumes recipient knowledge and exposes only an explicit saved-receipt entry',async()=>{
 const catalog={id:'isolated.story.gate',actors:{player:'御临风',bright:'布莱特',huang:'黄泉'},
  facts:[{id:'test.private',entityId:'test.owner',field:'relationship',value:'隔离关系命题',certainty:'confirmed',visibility:'private'}],
  lore:[{book:'901',uid:31,content:'医馆。隔离关系命题',publicContent:'医馆。'}]};
 const f=await hostFixture({action:'我询问医馆。',knowledgeCatalog:catalog,lorebooks:{901:[{uid:31,enabled:true,keys:['医馆'],content:'医馆。隔离关系命题'}]}});f.succeed();await f.run();
 assert.match(f.stats.lastClassificationRequest.user_input,/901逐角色知情投影/);
 assert.match(f.stats.lastNarrationRequest.user_input,/901逐角色知情投影/);
 assert.match(f.stats.lastNarrationRequest.user_input,/来源关系未明确关联时保持未定/);
 assert.match(f.stats.lastNarrationRequest.user_input,/条件满足只表示可以披露，仍由人物决定是否说出/);
 assert.doesNotMatch(f.stats.lastNarrationRequest.user_input,/隔离关系命题/);
 assert.doesNotMatch(JSON.stringify(f.stats.lastClassificationRequest),/隔离关系命题/);
 assert.equal(f.stats.lastProjectedLore.characterLore[0].content,'医馆。');
 f.chat.at(-1).mes='【隔离、非Canon】来客私下明确告知布莱特：隔离关系命题。其他人没有收到。';
 await f.controller.receiveKnowledge({id:'test.disclosure',authority:'host-confirmed',status:'received',
  sourceAnchor:{chatId:'host-test',messageId:f.chat.length-1,swipeId:0,text:f.chat.at(-1).mes},
  propositionRefs:['test.private'],recipientIds:['bright'],channel:'message',belief:'confirmed'});
 assert.ok(f.knowledge.context().actorKnowledge.find(a=>a.actorId==='bright').facts.length);
 assert.equal(f.knowledge.context().actorKnowledge.find(a=>a.actorId==='huang').facts.length,0);
 assert.ok(!f.listeners.has('settings'));
});

test('ordinary classifier and narration both consume time and discovery filtered knowledge',async()=>{
 const base={entityId:'gate.location',field:'access',certainty:'confirmed',visibility:'public'};
 const catalog={id:'isolated.boundaries',actors:{player:'御临风',bright:'布莱特',huang:'黄泉'},facts:[
  {...base,id:'common',value:'一般可询问开放时间'},
  {...base,id:'future',value:'未来开放事实',effectiveAt:{id:'legacy.story.order',clock:'turn',at:10,actorId:'legacy.story'}},
  {...base,id:'conditional',value:'尚未发现的事实',discoveryConditions:['confirmed.visit']},
  {...base,id:'other.clock',value:'无映射世界时间事实',effectiveAt:{id:'world',clock:'worldMinutes',at:0,actorId:null}}]};
 const f=await hostFixture({knowledgeCatalog:catalog});f.succeed();await f.run();
 for(const request of [f.stats.lastClassificationRequest,f.stats.lastNarrationRequest]){
  assert.match(request.user_input,/一般可询问开放时间/);
  assert.doesNotMatch(request.user_input,/未来开放事实|尚未发现的事实|无映射世界时间事实/);
  assert.match(request.user_input,/effectiveAt/);
 }
 assert.equal(f.floors[0].stat_data['901_rules_poc'].storyKnowledge,undefined);
});

test('unconfirmed rule persistence blocks narration and reports memory-only settlement',async()=>{
 const fixture=await hostFixture({action:'我完整长休八小时。',decision:{status:'RECOVERY_REQUIRED',reason:'完整长休',
   request:{kind:'recovery',type:'rest',rest:'long',minutes:480}},profile:{readSavedChat:async()=>[{},{}]}});
 await fixture.run();
 assert.equal(fixture.stats.narrations,0);
 assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,1);
 assert.match(fixture.chat.at(-1).mes,/内存中.*持久保存未确认/);
 assert.doesNotMatch(fixture.chat.at(-1).mes,/规则结果已保存/);
});

test('postcombat story classification failure retains its diagnostic instead of using combat fallback',async()=>{
 let combatFailures=0;
 const fixture=await hostFixture({generationError:Object.assign(Error('upstream unavailable'),{status:503}),
   combat:{handleTurn:async()=>({handled:false}),handleFailure:async()=>{combatFailures++;return true;}}});
 await fixture.run();
 assert.equal(combatFailures,0);
 const meta=fixture.chat.at(-1).extra['901_replay_gate'];
 assert.equal(meta.status,'UNRESOLVED');assert.equal(meta.diagnostic.httpStatus,503);
 assert.equal(meta.diagnostic.failureStage,'request_dispatched');
});

test('dialogue classification timeout reports a processing failure without implying an attempted action',async()=>{
 const action='“我现在的穿着直接进去？” 御临风指了指自己身上饱经战损的帝国制式盔甲，就这么过去一定会引起注意的。';
 const fixture=await hostFixture({action,generationError:Object.assign(Error('classification deadline exceeded'),{code:'CLASSIFICATION_TIMEOUT'})});
 await fixture.run();
 const reply=fixture.chat.at(-1),meta=reply.extra['901_replay_gate'];
 assert.match(reply.mes,/消息处理请求超时/);
 assert.doesNotMatch(reply.mes,/本次行动|尚未裁定|确定成败/);
 assert.equal(meta.status,'UNRESOLVED');
 assert.equal(meta.diagnostic.errorCode,'CLASSIFICATION_TIMEOUT');
 assert.equal(meta.pending.original.text,action);
 assert.equal(meta.pending.request,null);
 assert.equal(fixture.stats.classifications,1);
 assert.equal(fixture.stats.narrations,0);
 assert.equal(fixture.chat[0].mes,action);
 assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0);
 assert.deepEqual(fixture.floors[0].stat_data['901_rules_poc'].operations,{});
});

test('classification timeout retries the same input once with a new id and ignores the late first decision',async()=>{
 let late;const requests=[];
 const fixture=await hostFixture({profile:{classificationTimeoutMs:5,debug:false},classificationTransport:({request})=>{
  requests.push(request);
  if(requests.length===1)return new Promise(resolve=>{late=resolve;});
  return JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',reason:'普通对白'});
 }});
 fixture.succeed();await fixture.run();
 assert.equal(requests.length,2);
 assert.equal(requests[0].should_silence,true,'classification must not reopen the intercepted native generation');
 assert.notEqual(requests[0].generation_id,requests[1].generation_id);
 const withoutId=({generation_id,...rest})=>rest;
 assert.deepEqual(withoutId(requests[0]),withoutId(requests[1]));
 assert.deepEqual(fixture.stats.stoppedIds,[requests[0].generation_id]);
 assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NO_CHECK');
 assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].classificationRecovery.attempts,2);
 const before=structuredClone(fixture.floors);
 late(JSON.stringify({status:'CHECK_REQUIRED',reason:'迟到的旧判断',request:{kind:'check',attribute:'力量',skill:'运动',dc:2}}));
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.deepEqual(fixture.floors,before);assert.equal(fixture.stats.narrations,1);
 assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0);
});

test('classification recovery stops after two timeouts without narration or settlement',async()=>{
 const fixture=await hostFixture({profile:{classificationTimeoutMs:5},classificationTransport:()=>new Promise(()=>{})});
 await fixture.run();
 assert.equal(fixture.stats.classifications,2);assert.equal(fixture.stats.narrations,0);
 assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].diagnostic.classificationRequests,2);
 assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'UNRESOLVED');
 assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0);
});

test('classification recovery does not retry after explicit stop, changed input, or unconfirmed cancellation',async()=>{
 for(const kind of ['stop','changed','unconfirmed']){
  const fixture=await hostFixture({profile:{classificationTimeoutMs:5},stopResult:kind!=='unconfirmed',classificationTransport:({request,chat,listeners})=>{
   if(kind==='stop')listeners.get('stopped')?.(request.generation_id);
   if(kind==='changed')chat[0].mes='玩家已修改原消息';
   return new Promise(()=>{});
  }});
  await fixture.run();
  assert.equal(fixture.stats.classifications,1,kind);assert.equal(fixture.stats.narrations,0,kind);
  assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0,kind);
 }
});

test('postcombat story continuation failure remains resumable without reclassifying or settling',async()=>{
 let combatFailures=0;
 const fixture=await hostFixture({combat:{handleTurn:async()=>({handled:false}),handleFailure:async()=>{combatFailures++;return true;}}});
 await fixture.run();
 assert.equal(combatFailures,0);
 assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NARRATION_PENDING');
 assert.match(fixture.chat.at(-1).mes,/无需检定.*叙述尚未完成/);
 const before=structuredClone(fixture.floors[0]);
 fixture.succeed();await fixture.load();await fixture.run();
 assert.equal(fixture.stats.classifications,1);assert.equal(fixture.stats.narrations,2);
 assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NO_CHECK');
 assert.deepEqual(fixture.floors[0],before);
});

test('a failure inside combat handling still uses the combat recovery route',async()=>{
 const error=Error('combat narrator unavailable');let seen;
 const fixture=await hostFixture({combat:{handleTurn:async()=>{throw error;},handleFailure:async input=>{seen=input;return true;}}});
 await fixture.run();assert.equal(seen.error,error);assert.equal(fixture.stats.classifications,0);
});

test('native combat regeneration restores the deleted report and unique latest root before a cancelled menu',async()=>{
  let seen;
  const fixture=await hostFixture({combat:{handleTurn:async()=>{
    seen=structuredClone(fixture.floors[fixture.chat.length-1]);
    return {handled:true,status:'awaiting_player'};
  }}});
  const older={stat_data:{'901_rules_poc':{revision:18,battle:{mode:'combat'},operations:{old:{}}}}};
  const latest={snapshot:true,stat_data:{'901_rules_poc':{revision:19,battle:{mode:'combat'},operations:{old:{},uniqueCast:{damage:3,energy:1}}}}};
  fixture.floors[0]=structuredClone(older);
  fixture.chat.push({is_user:false,name:'report',mes:'saved cast: 3L',extra:{combatReport:true},swipe_id:1,
    swipes:['older alternate','saved cast: 3L'],variables:[older,latest],swipe_info:[{send_date:'old',extra:{alternate:true}},{send_date:'saved',extra:{combatReport:true}}]});
  fixture.floors[1]=structuredClone(latest);
  await fixture.start();
  fixture.chat.pop();delete fixture.floors[1]; // native Generate removes memory + DOM before the late hook
  await fixture.run();
  assert.deepEqual(seen,latest,'combat must never read the older floor as the current state');
  assert.equal(fixture.chat.length,2);
  assert.equal(fixture.chat[1].mes,'saved cast: 3L');
  assert.equal(fixture.chat[1].swipe_id,1);
  assert.deepEqual(fixture.chat[1].extra,{combatReport:true},'native swipe envelope must not replace the report identity');
  assert.deepEqual(fixture.chat[1].variables,[older,latest]);
  assert.deepEqual(fixture.floors[0],older);
  assert.equal(fixture.stats.classifications,0);assert.equal(fixture.stats.narrations,0);
});

test('debug-disabled malformed recovery retains a precise failure without settling',async()=>{
  const fixture=await hostFixture({action:'我服用药B',profile:{debug:false},
    decision:{status:'RECOVERY_REQUIRED',request:{kind:'recovery',type:'medicine',medicine:'药B'}}});
  await fixture.run();
  const final=fixture.chat.at(-1),meta=final.extra['901_replay_gate'];
  assert.equal(meta.status,'UNRESOLVED');
  assert.equal(meta.diagnostic?.failureStage,'response_parse');
  assert.equal(meta.diagnostic?.errorCode,'INVALID_DECISION_REASON');
  assert.equal(meta.diagnostic?.classificationRequests,1);
  assert.equal(fixture.stats.narrations,0);
  assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0);
  assert.doesNotMatch(final.mes,/INVALID_DECISION|隔离诊断/);
});

test('debug-disabled invalid check attribute identifies model input failure without exposing DC',async()=>{
  const fixture=await hostFixture({action:'我请门卫开门取水壶',profile:{debug:false},
    decision:{status:'CHECK_REQUIRED',reason:'门卫不愿等待',request:{kind:'check',attribute:'社交',skill:'社交',dc:5}}});
  await fixture.run();
  const final=fixture.chat.at(-1),meta=final.extra['901_replay_gate'];
  assert.equal(meta.diagnostic.errorCode,'INVALID_CHECK_ATTRIBUTE');
  assert.equal(fixture.stats.narrations,0);
  assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0);
  assert.match(final.mes,/主持模型.*属性不合法/);
  assert.doesNotMatch(final.mes,/DC|dc|5|请补齐/);
});

test('debug-disabled upstream quota failure is distinguished from invalid model output',async()=>{
  const fixture=await hostFixture({profile:{debug:false},generationError:Object.assign(
    Error('secret response body must not be persisted'),{status:500,error:{code:429,status:'RESOURCE_EXHAUSTED'}})});
  await fixture.run();
  const meta=fixture.chat.at(-1).extra['901_replay_gate'];
  assert.equal(meta.status,'UNRESOLVED');assert.equal(meta.pending.request,null);
  assert.equal(meta.diagnostic?.httpStatus,500);
  assert.equal(meta.diagnostic?.upstreamHttpStatus,429);
  assert.equal(meta.diagnostic?.upstreamStatus,'RESOURCE_EXHAUSTED');
  assert.doesNotMatch(JSON.stringify(meta),/secret response body/);
  assert.equal(fixture.stats.narrations,0);
});

test('explicit additional lorebooks reach classification and ordinary narration',async()=>{
  const fixture=await hostFixture({action:'我询问弃风剑的来历。',profile:{lorebooks:['901','901能力']},
    lorebooks:{901:[],'901能力':[{uid:57247236,enabled:true,keys:['弃风剑'],comment:'弃风剑',content:'削弱版弃风6L、破魔2、破甲2。'}]}});
  fixture.succeed();await fixture.run();
  assert.deepEqual(fixture.stats.readBooks,['901','901能力']);
  assert.match(JSON.stringify(fixture.stats.lastClassificationRequest),/削弱版弃风6L/);
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NO_CHECK');
  assert.equal(fixture.listeners.size,0);
});

test('ordinary narration releases its lore filter even when host stop handle is broken',async()=>{
  for(const fail of [false,true]){
    const fixture=await hostFixture({brokenListenerStop:true});
    if(!fail)fixture.succeed();
    await fixture.run();
    assert.equal(fixture.listeners.size,0,'finished or failed requests must not filter a later unrelated request');
  }
});

test('active combat handles the turn before ordinary classification or narration',async()=>{
  let turns=0;
  const fixture=await hostFixture({combat:{handleTurn:async()=>{turns++;return {handled:true,status:'awaiting_player'};}}});
  await fixture.run();
  assert.equal(turns,1);
  assert.equal(fixture.stats.classifications,0);
  assert.equal(fixture.stats.narrations,0);
  assert.equal(fixture.chat.length,1);
});

test('host saved recovery survives failed narration and script reload without another debit',async()=>{
  let combatFailures=0;
  const fixture=await hostFixture({action:'我服用药B',decision:{status:'RECOVERY_REQUIRED',reason:'明确服药',
    request:{kind:'recovery',type:'medicine',medicine:'药B'}},
    combat:{handleTurn:async()=>({handled:false}),handleFailure:async()=>{combatFailures++;return true;}}});
  const player=createOpeningRoster().player;
  player.state.health.intact-=6;player.state.health.L+=6;
  fixture.floors[0]={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'host-test',revision:0,operations:{},
    actors:{player:{name:player.name,state:player.state}}}}};
  await fixture.run();
  assert.equal(fixture.floors[0].stat_data['901_rules_poc'].actors.player.state.inventory.find(i=>i.name==='药B').quantity,2);
  assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,1);
  assert.equal(combatFailures,0,'story recovery failure retains the replay pending anchor');
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NARRATION_PENDING');
  const committed=structuredClone(fixture.floors[0]);
  fixture.chat.pop();await fixture.load();fixture.succeed();await fixture.run();
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'APPLIED');
  assert.equal(fixture.stats.classifications,1);assert.equal(fixture.stats.narrations,2);
  assert.deepEqual(fixture.floors[0],committed);
  assert.match(fixture.stats.lastNarrationRequest.user_input,/药B.*consumed.*healed/);
  assert.doesNotMatch(fixture.stats.lastNarrationRequest.user_input,/姜子尤|黄泉|布莱特/);
});

test('host executes the exact compound declaration once and resumes final sequence narration after reload',async()=>{
  const request={kind:'recovery',type:'sequence',steps:[{type:'medicine',medicine:'培元丹'},
    {type:'rest',rest:'long',minutes:480}]};
  const fixture=await hostFixture({action:'服下培元丹，然后长休八小时',
    decision:{status:'RECOVERY_REQUIRED',reason:'玩家明确依次服药和长休',request}});
  fixture.floors[0]={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'host-test',revision:0,operations:{},
    actors:createRecoveryFixture().actors}}};
  await fixture.run();
  const root=fixture.floors[0].stat_data['901_rules_poc'],state=root.actors.player.state;
  assert.equal(root.revision,1);assert.deepEqual(Object.keys(root.operations),['gm-runtime/host-test/0/0']);
  assert.deepEqual(root.lastResult.result.steps.map(step=>step.type),['medicine','rest']);
  assert.deepEqual([state.health.intact,state.health.A,state.health.L,state.health.B],[8,0,4,0]);
  assert.equal(state.inventory.find(i=>i.name==='培元丹').quantity,2);
  assert.deepEqual(state.pendingRecoveryEffects,[]);assert.equal(state.recoveryClock.minutes,480);
  const committed=structuredClone(fixture.floors[0]);
  fixture.chat.pop();await fixture.load();fixture.succeed();await fixture.run();
  assert.deepEqual(fixture.floors[0],committed);
  assert.equal(fixture.stats.classifications,1);assert.equal(fixture.stats.narrations,2);
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'APPLIED');
  const facts=fixture.stats.lastNarrationRequest.user_input;
  assert.match(facts,/服用培元丹，然后长休/);assert.match(facts,/最终pending：\[\]/);
  assert.doesNotMatch(facts,/本次只服下药品并扣除库存|姜子尤|黄泉|布莱特/);
});

test('a completed pending medicine keeps its original operation across a later player floor and native regeneration',async t=>{
  let preparations=0,draws=0;
  const originalRandom=globalThis.crypto.getRandomValues.bind(globalThis.crypto);
  t.mock.method(globalThis.crypto,'getRandomValues',array=>{draws++;return originalRandom(array);});
  const fixture=await hostFixture({action:'我服用药B',decision:{status:'RECOVERY_REQUIRED',reason:'玩家明确确认服药',
    request:{kind:'recovery',type:'medicine',medicine:'药B'}},
    profile:{prepare:async()=>{if(++preparations===1)throw Error('fixture unavailable before classification');}}});
  fixture.chat.unshift({is_user:false,mes:'安全休息室',swipe_id:0});
  const player=createOpeningRoster().player;
  player.state.health.intact-=6;player.state.health.L+=6;
  fixture.floors[1]={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'host-test',revision:0,operations:{},
    actors:{player:{name:player.name,state:player.state}}}}};
  await fixture.run();
  assert.equal(fixture.stats.classifications,0);
  assert.equal(fixture.chat[2].extra['901_replay_gate'].pending.original.messageId,1);
  fixture.chat.push({is_user:true,mes:'确认，我服用药B。',swipe_id:0});
  fixture.succeed();await fixture.run();
  const originalOperation='gm-runtime/host-test/1/0';
  assert.equal(fixture.chat[3].extra['901_replay_gate'].completed.operationId,originalOperation);
  const committed=structuredClone(fixture.floors[3]);
  assert.deepEqual(Object.keys(committed.stat_data['901_rules_poc'].operations),[originalOperation]);
  assert.equal(committed.stat_data['901_rules_poc'].actors.player.state.inventory.find(i=>i.name==='药B').quantity,2);
  const calls={...fixture.stats},savedDraws=draws;
  // Native regenerate deletes the assistant floor while retaining the player's
  // completed cache and selected MVU state on the confirmation floor.
  fixture.chat.pop();delete fixture.floors[4];await fixture.load();await fixture.run();
  assert.deepEqual(fixture.floors[3],committed,'regeneration must reuse the original stock, health, revision and operation record');
  assert.equal(draws,savedDraws);
  assert.equal(fixture.stats.classifications,calls.classifications);
  assert.equal(fixture.stats.narrations,calls.narrations);
  assert.equal(fixture.chat[4].extra['901_replay_gate'].operationId,originalOperation);
  assert.deepEqual(fixture.floors[4],committed);
});

test('host classification passes a registered encounter to the player-bound combat entry',async()=>{
  const entries=[];
  const fixture=await hostFixture({action:'开始姜黄演练，我在旁观看。',
    decision:{status:'COMBAT_REQUIRED',reason:'已声明开始演练',request:{kind:'combat',encounterId:'jiang-huang'}},
    combat:{handleTurn:async()=>({handled:false}),
      encounterOptions:[{id:'jiang-huang',description:'姜黄演练'}],
      enterForPlayer:async(id,player)=>{entries.push({id,player});return {handled:true,status:'story'};}}});
  await fixture.run();
  assert.equal(entries.length,1);
  assert.equal(entries[0].id,'jiang-huang');
  assert.equal(entries[0].player.messageId,0);
  assert.equal(fixture.stats.classifications,1);
  assert.equal(fixture.stats.narrations,0);
});

test('integrated profile cannot grant the old demo scene bonus',async()=>{
  const fixture=await hostFixture({profile:{directEffects:false},
    decision:{status:'DIRECT_EFFECT',reason:'模型提出演示奖励',
      request:{kind:'direct_effect',effectId:'demo.scene-cue'}}});
  await fixture.run();
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NEEDS_INPUT');
  assert.equal(fixture.floors[0].stat_data['901_rules_poc'].revision,0);
  assert.equal(fixture.stats.narrations,0);
});

test('ordinary narration resolves current model options locally for each request', async () => {
  let scene = '御临风与石像相距6米', calls = 0;
  const fixture = await hostFixture({ action: '我留在原地观察。', profile: {
    get sceneContext() { return scene; },
    modelOptions: () => { calls++; return { max_chat_history: 6,
      ordered_prompts: ['chat_history', { role: 'system', content: scene }, 'user_input'] }; },
  } });
  fixture.succeed();
  scene = '御临风与石像相距6米；黄泉与布莱特不在场';
  await fixture.run();
  assert.equal(calls, 1);
  assert.equal(fixture.stats.lastNarrationRequest.ordered_prompts[1].content, scene);
  assert.ok(fixture.stats.lastNarrationRequest.user_input.includes(scene));
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'NO_CHECK');
});

test('controller persists failed NO_CHECK and recovers after reload with no new player input', async () => {
  const fixture = await hostFixture();
  await fixture.run();
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'NARRATION_PENDING');
  assert.equal(fixture.chat[0].extra['901_replay_gate'].pending.narrationDecision.status, 'NO_CHECK');
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.listeners.size, 0);
  const savedState = structuredClone(fixture.floors[0]);
  // Native regenerate removes the assistant notice, then the script reloads.
  fixture.chat.pop();
  await fixture.load();
  fixture.succeed();
  await fixture.run();
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 2);
  assert.equal(fixture.chat.filter(message => message.is_user).length, 1);
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'NO_CHECK');
  assert.equal(fixture.chat[0].extra['901_replay_gate'].pending, undefined);
  assert.deepEqual(fixture.floors[0], savedState);
  assert.equal(fixture.listeners.size, 0);
});

test('host cancels only the unexecuted medicine pending and anchors the current dialogue',async()=>{
  const decision={status:'UNRESOLVED',reason:'药B的实际消耗与治疗尚未接入'};
  const fixture=await hostFixture({action:'【隔离测试玩家声明】我现在要使用自己库存中的一份药B，给自己处理本场留下的伤势。请按已接入的实际规则结算消耗与治疗；若用药尚未接入，明确告知我，不能只在正文写成已经喝下或已经治好。',decision});
  await fixture.run();assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'UNRESOLVED');
  const before=structuredClone(fixture.floors[0].stat_data['901_rules_poc']);
  fixture.chat.push({is_user:true,mes:'【隔离测试玩家声明】用药暂不执行。我仍在原地，只看着拉德维克，问一句：“你现在感觉怎样？”不移动、不治疗，也不再动手。',swipe_id:0});
  Object.assign(decision,{status:'NO_CHECK',basis:'ordinary_dialogue',reason:'明确取消未执行用药后普通问话',cancelPending:'用药暂不执行'});
  fixture.succeed();await fixture.run();
  const final=fixture.chat.at(-1).extra['901_replay_gate'];assert.equal(final.status,'NO_CHECK');assert.equal(final.operationId,'gm-runtime/host-test/2/0');
  assert.equal(fixture.stats.narrations,1);assert.equal(fixture.stats.classifications,2);
  assert.match(fixture.stats.lastNarrationRequest.user_input,/玩家行动：【隔离测试玩家声明】用药暂不执行/);
  assert.doesNotMatch(fixture.stats.lastNarrationRequest.user_input,/我现在要使用自己库存/);
  assert.deepEqual(fixture.floors[2].stat_data['901_rules_poc'],before);
});

test('a cancellation declaration cannot undo a committed operation awaiting narration',async()=>{
  const fixture=await hostFixture({action:'我指给布莱特看墙上的暗号',decision:{status:'DIRECT_EFFECT',reason:'隔离演示线索',request:{kind:'direct_effect',effectId:'demo.scene-cue'}}});
  await fixture.run();assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status,'NARRATION_PENDING');
  const committed=structuredClone(fixture.floors[0].stat_data['901_rules_poc']);
  fixture.chat.push({is_user:true,mes:'此前行动取消。我只问一句现在怎样。',swipe_id:0});
  fixture.succeed();await fixture.run();
  const meta=fixture.chat.at(-1).extra['901_replay_gate'];assert.equal(meta.status,'APPLIED');assert.equal(meta.operationId,'gm-runtime/host-test/0/0');
  assert.equal(fixture.stats.classifications,1);assert.deepEqual(fixture.floors[2].stat_data['901_rules_poc'],committed);
});

test('regenerating a completed turn reuses its narration without model calls or another assistant message', async () => {
  const fixture = await hostFixture();
  fixture.succeed();
  await fixture.run();
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 1);
  const original = structuredClone(fixture.chat.at(-1));
  const savedState = structuredClone(fixture.floors);

  // An already completed chat created by an older script has no player-floor cache.
  delete fixture.chat[0].extra['901_replay_gate'].completed;
  await fixture.run();
  assert.equal(fixture.chat.length, 2);
  assert.deepEqual(fixture.chat.at(-1), original);
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 1);
  assert.equal(fixture.chat[0].extra['901_replay_gate'].completed.message, original.mes);

  fixture.chat.pop();
  await fixture.load();
  await fixture.run();
  assert.equal(fixture.chat.length, 2);
  assert.deepEqual(fixture.chat.at(-1), original);
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 1);
  assert.deepEqual(fixture.floors, savedState);
});

test('regenerating a committed direct effect does not repeat classification, narration, or MVU writes', async () => {
  const fixture = await hostFixture({ action: '我指给布莱特看墙上的暗号',
    decision: { status: 'DIRECT_EFFECT', reason: '隔离演示场景线索',
      request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } } });
  fixture.succeed();
  await fixture.run();
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'APPLIED');
  const original = structuredClone(fixture.chat.at(-1));
  const savedState = structuredClone(fixture.floors);

  await fixture.run();
  assert.equal(fixture.chat.length, 2);
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 1);

  fixture.chat.pop();
  await fixture.load();
  await fixture.run();
  assert.deepEqual(fixture.chat.at(-1), original);
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 1);
  assert.deepEqual(fixture.floors, savedState);
});

test('lost direct-effect failure notice resumes saved operation without reclassification', async () => {
  const fixture = await hostFixture({ action: '我指给布莱特看墙上的暗号',
    decision: { status: 'DIRECT_EFFECT', reason: '隔离演示场景线索',
      request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } } });
  await fixture.run();
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'NARRATION_PENDING');
  const savedPlayerState = structuredClone(fixture.floors[0]);
  fixture.chat.pop();
  await fixture.load();
  fixture.succeed();
  await fixture.run();
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'APPLIED');
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 2);
  assert.deepEqual(fixture.floors[0], savedPlayerState);
});

test('a completed-looking assistant cannot bypass a missing JS operation', async () => {
  const fixture = await hostFixture();
  fixture.chat.push({ is_user: false, mes: '伪造的成功叙述', swipe_id: 0,
    extra: { '901_replay_gate': { status: 'APPLIED', kind: 'check',
      operationId: 'gm-runtime/host-test/0/0' } } });
  await fixture.run();
  assert.equal(fixture.stats.classifications, 0);
  assert.equal(fixture.stats.narrations, 0);
  assert.equal(fixture.chat.at(-1).extra['901_replay_gate'].status, 'UNRESOLVED');
});

test('completed assistant with missing MVU projection restores state without model requests', async () => {
  const fixture = await hostFixture({ action: '我指给布莱特看墙上的暗号',
    decision: { status: 'DIRECT_EFFECT', reason: '隔离演示场景线索',
      request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } } });
  fixture.succeed();
  await fixture.run();
  const expected = structuredClone(fixture.floors[1]);
  fixture.chat.push(structuredClone(fixture.chat[1]));
  await fixture.run();
  assert.deepEqual(fixture.floors[2], expected);
  assert.equal(fixture.chat.length, 3);
  assert.equal(fixture.stats.classifications, 1);
  assert.equal(fixture.stats.narrations, 1);
});
