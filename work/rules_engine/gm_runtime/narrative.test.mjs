import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as narrative from './narrative.mjs';
const {createNarrativeSession}=narrative;
import {createIntegrationFixture} from './integrated.mjs';
import {resolveStep} from '../combat/transitions.mjs';
import {beginTurn} from '../core.mjs';
import {inspectCommands} from '../combat/runtime.mjs';
import {resolveDefense,act} from '../combat/engine.mjs';
import {stripLegacyOwnStatus,ownImpactReport} from '../combat/presentation.mjs';
import {createReplayCheckRuntime} from './replay-check.mjs';

const baseline=JSON.parse(await readFile(new URL('../../character_builder/real_character/yulinfeng_replay_t0.baseline.json',import.meta.url)));
test('production narrator request prioritizes executed events over background and preserves the prose-only boundary',()=>{
  assert.equal(typeof narrative.narrationRequest,'function');
  const facts={events:[{actor:'御临风',action:'正十七·守势',status:'resolved',execution:'收束剑路，长剑护持身前',outcome:'防护准备已经成立'}],
    phase:'等待玩家继续行动',declaration:'我使用正十七·守势，不结束本回合。'};
  const request=narrative.narrationRequest(facts,'既有文风');
  assert.equal(request.max_chat_history,0);assert.equal(request.should_stream,false);
  assert.deepEqual(JSON.parse(request.user_input),facts);
  const prompt=request.ordered_prompts[0].content;
  assert.match(prompt,/必须.*events/);assert.match(prompt,/已声明.*已执行/);
  assert.match(prompt,/允许.*展开|可以.*展开/);assert.match(prompt,/准备.*实际挡接/);
  assert.match(prompt,/setting.*背景/);assert.match(prompt,/phase.*接在.*事件之后/);
  assert.doesNotMatch(prompt,/只描述对手和既有环境/);
  assert.doesNotMatch(request.user_input,/stateResult|901_rules_poc|54|DP/);
});
function fixture(extra={}) {
  const chat=[{is_user:false,mes:'演练场',swipe_id:0}],floors={},facts=[];
  const tavern={chat,chatId:'narrative-test',saveChat:async()=>{}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),
    replaceMvuData:async(data,{message_id})=>{floors[message_id]=structuredClone(data);}};
  let plan={steps:[]},fail=false,rolls=0,dice=8,opened=0,interpreted=0;
  const options={baseline,mvu,tavern,
    createChatMessages:async ms=>{for(const m of ms)chat.push({mes:m.message,is_user:m.role==='user',swipe_id:0,extra:m.extra??{}});},
    setChatMessages:async us=>{for(const u of us)chat[u.message_id].extra=structuredClone(u.extra);},
    generateRaw:async request=>{
      const c=JSON.parse(request.user_input),opts=c.legalOptions;
      const i=opts.findIndex(x=>x.abilityId==='react'&&x.choice==='decline'||x.abilityId==='strike'||x.abilityId==='draw');
      return JSON.stringify({option:i<0?opts.findIndex(x=>x.abilityId==='end'):i});
    },
    onStatusRequest:async()=>{opened++;},
    interpret:async()=>{interpreted++;return structuredClone(plan);},
    narrate:async input=>{facts.push(structuredClone(input));if(fail)throw Error('provider down');return '剑风掠过衣襟，姜子尤沉肩稳住脚步。';},
    drawDice:()=>{rolls++;return Array(1024).fill(dice);},...extra,
  };
  let session=createNarrativeSession(options);
  const player=text=>{chat.push({is_user:true,mes:text,swipe_id:0});return {chatId:tavern.chatId,messageId:chat.length-1,swipeId:0,text};};
  const root=()=>floors[chat.length-1].stat_data['901_rules_poc'];
  return {get session(){return session;},chat,facts,floors,player,root,
    refresh:()=>{session=createNarrativeSession(options);},setPlan:p=>{plan=p;},setFail:v=>{fail=v;},setDice:v=>{dice=v;},rolls:()=>rolls,
    opened:()=>opened,interpreted:()=>interpreted};
}
async function start(f,id='yulin-jiang') {
  const p=f.player('开始演练');await f.session.prepare();await f.session.enterForPlayer(id,p);return p;
}

test('declared combat medicine spends its action once and refresh preserves inventory and health',async()=>{
  const f=fixture();await start(f);
  const state=f.root().actors.player.state;
  state.inventory=[{name:'药B',quantity:3,source:'初始卡'}];state.health.intact-=6;state.health.L+=6;
  f.setPlan({steps:[{quote:'我服用药B',command:{abilityId:'medicine',medicine:'药B'}}]});
  const p=f.player('我服用药B，但不结束本回合');await f.session.handleTurn({player:p});
  assert.equal(f.root().actors.player.state.inventory[0].quantity,2);
  assert.equal(f.root().actors.player.state.turn.move,0);assert.equal(f.root().actors.player.state.turn.standard,1);
  assert.equal(f.root().actors.player.state.health.L,1);
  assert.match(f.facts.at(-1).events.at(-1).execution,/服/);
  const before=structuredClone(f.root());f.refresh();await f.session.handleTurn({player:p});
  assert.deepEqual(f.root(),before);assert.equal((await f.session.currentState()).player.inventory[0].quantity,2);
});

test('postcombat story medicine and next rest use current MVU without replaying battle prose',async()=>{
  const f=fixture();await start(f,'jiang-huang');
  const state=f.root().actors.player.state;
  state.inventory=[{name:'药C',quantity:4,source:'初始卡'}];state.health.intact-=6;state.health.L+=6;
  const p=f.player('我服用药C治疗伤势');assert.equal((await f.session.handleTurn({player:p})).handled,false);
  const runtime=createReplayCheckRuntime({baseline,expectedChatId:'narrative-test',
    getAnchor:()=>({chatId:'narrative-test',messageId:f.chat.length-1,swipeId:0}),
    mvu:{getMvuData:({message_id})=>structuredClone(f.floors[message_id]),
      replaceMvuData:async(value,{message_id})=>{f.floors[message_id]=structuredClone(value);}}});
  const first=await runtime.settle({operationId:`gm-runtime/narrative-test/${p.messageId}/0`,
    request:{kind:'recovery',type:'medicine',medicine:'药C',choice:'heal'},context:{original:p,latest:p}});
  assert.equal(first.status,'applied');assert.equal(f.root().actors.player.state.health.L,6);
  assert.equal((await f.session.currentState()).player.pendingRecoveryEffects.length,1);
  const narrations=f.facts.length;
  const rest=f.player('我短休15分钟');assert.equal((await f.session.handleTurn({player:rest})).handled,false);
  assert.equal(f.facts.length,narrations,'story recovery must not trigger old combat flush');
  assert.equal((await runtime.settle({operationId:`gm-runtime/narrative-test/${rest.messageId}/0`,
    request:{kind:'recovery',type:'rest',rest:'short',minutes:15},context:{original:rest,latest:rest}})).status,'applied');
  assert.equal(f.root().actors.player.state.health.L,0);
  const ui=await f.session.currentState();assert.equal(ui.player.health.L,0);assert.equal(ui.player.pendingRecoveryEffects.length,0);
  assert.doesNotMatch(JSON.stringify(ui),/姜子尤|黄泉|布莱特/);
  assert.doesNotThrow(()=>f.session.storyContext());
});

test('story rest expires persisted player battle buffs in own status and leaves NPCs unchanged',async()=>{
  const f=fixture();await start(f);
  const root=f.root(),player=root.battle.actors.player;
  root.battle.mode='story';player.buffs={flow:1,tengzhuan:true};
  root.actors.player.combatCarry??={};
  root.actors.player.combatCarry.durationCarry={flow:{remainingRounds:10},tengzhuan:{remainingRounds:10}};
  root.actors.player.combatCarry.cooldownCarry={thunder:{remainingRounds:10}};
  player.cooldowns={thunder:10};
  const before=(await f.session.currentState()).player,npc=structuredClone(root.actors.jiang);
  const p=f.player('我短休15分钟');assert.equal((await f.session.handleTurn({player:p})).handled,false);
  const runtime=createReplayCheckRuntime({baseline,expectedChatId:'narrative-test',
    getAnchor:()=>({chatId:'narrative-test',messageId:f.chat.length-1,swipeId:0}),
    mvu:{getMvuData:({message_id})=>structuredClone(f.floors[message_id]),
      replaceMvuData:async(value,{message_id})=>{f.floors[message_id]=structuredClone(value);}}});
  await runtime.settle({operationId:`gm-runtime/narrative-test/${p.messageId}/0`,
    request:{kind:'recovery',type:'rest',rest:'short',minutes:15},context:{original:p,latest:p}});
  const after=(await f.session.currentState()).player;
  assert.equal(before.speed-after.speed,20);assert.ok(before.attack.dp>after.attack.dp);
  assert.deepEqual(f.root().battle.actors.player.buffs,{});assert.deepEqual(f.root().battle.actors.player.cooldowns,{});
  assert.deepEqual(f.root().actors.jiang,npc);
});

test('declared door then obstacle attack preserves remaining actions, narrates the map result and survives refresh',async()=>{
  const f=fixture({mapGenerator:async()=>({title:'独立门口测试',bounds:[-3,-3,8,6],features:[
    {id:'gate',label:'练习木门',kind:'door',rect:[.5,-.3,.2,.6],open:false,blocksSight:true,
      durability:{current:1,max:1,hardness:0,source:'独立验收夹具'}}]})});
  await start(f);
  f.setPlan({steps:[{quote:'打开练习木门',command:{abilityId:'door',featureId:'gate',open:true},cost:{actions:{move:1}}},
    {quote:'挥剑劈坏它',command:{abilityId:'destroy',featureId:'gate'},cost:{actions:{standard:1}}}]});
  const p=f.player('我用移动动作打开练习木门，再用标准动作挥剑劈坏它，不结束本回合。');
  await f.session.handleTurn({player:p});
  const root=f.root();assert.equal(root.battle.map.features[0].destroyed,true);
  assert.equal(root.actors.player.state.turn.move,0);assert.equal(root.actors.player.state.turn.standard,0);
  assert.equal(root.actors.player.state.turn.swift,1);assert.equal(root.battle.activeId,'player');
  assert.deepEqual(f.facts.at(-1).events.map(e=>e.action),['开关门','攻击障碍']);
  assert.match(f.facts.at(-1).events[1].outcome,/破坏/);
  assert.doesNotMatch(JSON.stringify(f.facts.at(-1)),/hardness|durability|structuralDamage|defense|rolledSuccesses/);
  const revision=root.revision,rolls=f.rolls();f.refresh();await f.session.handleTurn({player:p});
  assert.equal(f.root().revision,revision);assert.equal(f.rolls(),rolls);
  assert.equal((await f.session.currentState()).map.features[0].destroyed,true);
});
test('natural attack settles only the declared action, keeps remaining player actions, and hides NPC figures',async()=>{
  const f=fixture();await start(f);
  f.setPlan({steps:[{quote:'聚风龙卷',command:{abilityId:'tornado',targetId:'jiang'},cost:{actions:{standard:1},energy:{风池:1}}}]});
  const p=f.player('我侧身出剑，以聚风龙卷攻向姜子尤，白刃判定，标准动作、风池1点。');
  await f.session.handleTurn({player:p});
  const r=f.root();
  assert.equal(r.battle.activeId,'player');
  assert.equal(r.actors.player.state.turn.standard,0);
  assert.equal(r.actors.player.state.turn.move,1);
  assert.equal(r.actors.player.state.turn.swift,1);
  assert.equal(r.actors.player.state.resources.风池.current,9);
  assert.equal(r.actors.player.state.health.intact,21,'NPC reaction must not grant an attack');
  assert.ok(r.actors.jiang.state.health.L>0);
  const publicFacts=f.facts.at(-1);
  assert.equal(publicFacts.participants.find(x=>x.id==='jiang').condition,'可见受伤');
  const other=publicFacts.participants.filter(x=>x.id!=='player');
  assert.doesNotMatch(JSON.stringify(other),/health|energy|attributes|defense|buffs|cooldowns|\bDP\b/);
  assert.doesNotMatch(JSON.stringify(publicFacts.events),/actualDamage|rolledSuccesses|inputSeverity|defense|energy|hpMax/);
  assert.doesNotMatch(f.chat.at(-1).mes,/姜子尤：完好|结算明细|rules901_detail|主持补参/);
  assert.doesNotMatch(f.chat.at(-1).mes,/<details>|自身状态|DP|剩余动作/);
  const ui=await f.session.currentState();
  assert.equal(ui.player.actions.move,1);
  assert.equal(ui.player.energy.风池.current,9);
  assert.equal(ui.player.defense.pending,true);
  assert.doesNotMatch(JSON.stringify(ui),/姜子尤|黄泉|布莱特|participants|operations|battle|combatCarry/);
});
test('stationary tornado injury projects the unchanged target position as an observable result',async()=>{
  const f=fixture();await start(f);
  const before=structuredClone(f.root().battle.actors.jiang.position);
  f.setPlan({steps:[{quote:'聚风龙卷',command:{abilityId:'tornado',targetId:'jiang'}}]});
  await f.session.handleTurn({player:f.player('我使用聚风龙卷攻击姜子尤，其他动作保留。')});
  assert.deepEqual(before,[1,0]);assert.deepEqual(f.root().battle.actors.jiang.position,before);
  assert.deepEqual(f.root().battle.actors.player.position,[0,0]);
  const impact=f.facts.at(-1).events.find(x=>x.affected.includes('姜子尤'));
  assert.match(impact.consequence,/姜子尤此次受击时原地受创，站位未变/);
  assert.equal(impact.status,'resolved');assert.equal(impact.position,undefined);
});
test('declared cost mismatch and invented end are rejected before rolling or spending',async()=>{
  const f=fixture();await start(f);const before=structuredClone(f.root());
  f.setPlan({steps:[{quote:'聚风龙卷',command:{abilityId:'tornado',targetId:'jiang'},cost:{actions:{swift:1},energy:{风池:1}}}]});
  await f.session.handleTurn({player:f.player('聚风龙卷，迅捷动作，风池1点。')});
  assert.deepEqual(f.root(),before);assert.equal(f.rolls(),0);
  assert.match(f.chat.at(-1).mes,/标准/);
  f.setPlan({steps:[{quote:'我观察他',command:{abilityId:'end'}}]});
  await f.session.handleTurn({player:f.player('我观察他')});
  assert.deepEqual(f.root(),before);assert.equal(f.rolls(),0);
});
test('failed narration resumes saved action without rerolling, including a new session/refresh',async()=>{
  const f=fixture();await start(f);
  f.setPlan({steps:[{quote:'聚风龙卷',command:{abilityId:'tornado',targetId:'jiang'}}]});
  const p=f.player('我用聚风龙卷攻击姜子尤');f.setFail(true);
  await assert.rejects(f.session.handleTurn({player:p}),/provider down/);
  const saved=structuredClone(f.root()),rolls=f.rolls();
  f.setFail(false);f.refresh();await f.session.handleTurn({player:p});
  assert.deepEqual(f.root(),saved);assert.equal(f.rolls(),rolls);
  const count=f.chat.length;await f.session.handleTurn({player:p});
  assert.equal(f.chat.length,count);assert.deepEqual(f.root(),saved);
});
test('retrying committed guard narrates its execution without repeating prior damage or inventing another action',async()=>{
  const f=fixture();await start(f);
  f.setPlan({steps:[{quote:'聚风龙卷',command:{abilityId:'tornado',targetId:'jiang'}}]});
  await f.session.handleTurn({player:f.player('我用聚风龙卷攻击姜子尤')});
  assert.ok(f.facts.at(-1).events.some(x=>x.affected.includes('姜子尤')));
  f.setPlan({steps:[{quote:'正十七·守势',command:{abilityId:'zheng'},cost:{actions:{move:1},energy:{}}}]});
  const p=f.player('我使用正十七·守势，消耗一个移动动作，不耗能量。保留迅捷动作，不结束本回合。');
  f.setFail(true);await assert.rejects(f.session.handleTurn({player:p}),/provider down/);
  const saved=structuredClone(f.root()),rolls=f.rolls(),lastFacts=structuredClone(f.facts.at(-1));
  assert.equal(lastFacts.events.length,1);assert.equal(lastFacts.events[0].action,'正十七·守势');
  assert.deepEqual(lastFacts.events[0].affected,[]);assert.equal(lastFacts.events[0].target,undefined);
  assert.equal(lastFacts.events[0].consequence,undefined);
  f.setFail(false);f.refresh();await f.session.handleTurn({player:p});
  assert.deepEqual(f.facts.at(-1),lastFacts,'retry must project the same committed event and execution semantics');
  assert.deepEqual(f.root(),saved);assert.equal(f.rolls(),rolls);
  assert.equal(saved.actors.player.state.resources.风池.current,9);
  assert.equal(saved.actors.player.state.turn.swift,1);
});
test('explicit end advances to an actual player reaction; continuation preserves the same turn and resource costs',async()=>{
  const f=fixture();await start(f);f.setDice(7);
  f.setPlan({steps:[{quote:'结束本回合',command:{abilityId:'end'}}]});
  await f.session.handleTurn({player:f.player('我结束本回合')});
  assert.equal(f.root().battle.pending.awaiting,'player');
  assert.equal(f.facts.at(-1).events.at(-1).status,'pending');
  assert.equal(f.root().actors.player.state.health.intact,21);
  f.refresh();
  f.setPlan({steps:[{quote:'按基础防御闪避，不用伤害转换',command:{abilityId:'react',choice:'decline',defense:'normal'}}]});
  await f.session.handleTurn({player:f.player('这次按基础防御闪避，不用伤害转换')});
  assert.equal(f.root().battle.activeId,'player');
  assert.equal(f.root().battle.pending,undefined);
  assert.equal(f.root().actors.player.state.turn.standard,1);
  assert.ok(f.root().actors.player.state.health.intact<21);
  const resolved=f.facts.at(-1).events.find(x=>x.affected.includes('御临风'));
  assert.equal(resolved.status,'resolved');assert.match(resolved.consequence,/确实受伤/);
  assert.match(f.chat.at(-1).mes,/御临风本次结算.*受到\d+点.*伤害（\d+[BLA]）/);
});

test('own consequence receipt lists only actual player damage and effective condition changes once',()=>{
  const b=createIntegrationFixture(baseline).encounters['yulin-jiang']();
  const player=b.actors.player;
  const snapshot=statuses=>({participants:[{id:'player',statuses,health:player.state.health}]});
  const root={actors:{player},operations:{
    before:{summary:{revision:2,result:{damage:[],after:snapshot([{type:'麻痹',points:1},{type:'疲乏',points:1}])}}},
    hit:{summary:{revision:3,result:{damage:[{targetId:'player',severity:'L',actualDamage:4},{targetId:'jiang',severity:'A',actualDamage:17}],
      after:snapshot([{type:'麻痹',points:1},{type:'麻痹',points:2},{type:'疲乏',points:1}])}}},
  }};
  const receipt=ownImpactReport(root,{afterRevision:2});
  assert.match(receipt,/4点严重伤害（4L）/);assert.match(receipt,/麻痹由1变为2点/);
  assert.match(receipt,/当前负面状态：疲乏1点/);
  assert.doesNotMatch(receipt,/姜子尤|17|3点|生命/);
  assert.equal(ownImpactReport(root,{afterRevision:3}),'');
});
test('every incoming player attack waits for a declared defense even after conversion is exhausted',()=>{
  const b=createIntegrationFixture(baseline).encounters['yulin-jiang']();
  b.reactionWindows=true;b.playerDefenseDeclarations=true;b.activeId='jiang';
  b.actors.jiang.state=beginTurn(b.actors.jiang.state).state;
  b.actors.player.used.damageConversion=true;
  let rolls=0;
  const out=resolveStep(b,{actorId:'jiang',abilityId:'strike',targetId:'player'},
    {drawDice:()=>{rolls++;return Array(1024).fill(8);}});
  assert.equal(out.battle.pending?.awaiting,'player');
  assert.equal(rolls,0);assert.equal(out.battle.actors.player.state.health.intact,21);
  assert.deepEqual(inspectCommands(out.battle).options.filter(o=>!o.command.willpower).map(o=>o.command.choice),['decline']);
});
test('player defense has no total until a defense mode is declared; ready block is not silently added to normal defense',()=>{
  const b=createIntegrationFixture(baseline).encounters['yulin-jiang']();
  b.playerDefenseDeclarations=true;b.actors.player.buffs.block=true;
  assert.deepEqual(resolveDefense(b,'player','jiang'),{pending:true});
  const normal=resolveDefense(b,'player','jiang',{defenseMode:'normal'});
  const block=resolveDefense(b,'player','jiang',{defenseMode:'block'});
  assert.equal(normal.parts.block,0);
  assert.ok(block.parts.block>0);
  assert.ok(block.total>normal.total);
});
test('an existing guard persists while a new attack offers the adopted optional will defense',()=>{
  const b=createIntegrationFixture(baseline).encounters['yulin-jiang']();
  b.playerDefenseDeclarations=true;
  const guarded=act(b,{actorId:'player',abilityId:'zheng'},{playerAuthorized:true}).battle;
  assert.equal(guarded.actors.player.state.turn.move,0);
  assert.equal(guarded.actors.player.defenseIntent.mode,'block');
  assert.ok(resolveDefense(guarded,'player','jiang').total>0);
  guarded.activeId='jiang';guarded.actors.jiang.state=beginTurn(guarded.actors.jiang.state).state;
  guarded.actors.player.used.damageConversion=true;
  let hit=resolveStep(guarded,{actorId:'jiang',abilityId:'strike',targetId:'player'},
    {drawDice:()=>Array(1024).fill(7)});
  assert.equal(hit.battle.pending.awaiting,'player');hit=resolveStep(hit.battle,{actorId:'player',abilityId:'react',choice:'decline',defense:'block'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(7)});assert.equal(hit.battle.pending,undefined);
  assert.ok(hit.result.attack.defense.parts.block>0);
  const next=act(hit.battle,{actorId:'jiang',abilityId:'end'}).battle;
  assert.equal(next.actors.player.defenseIntent,undefined);
  assert.deepEqual(resolveDefense(next,'player','jiang'),{pending:true});
});
test('an enemy leaving reach cannot trigger an undeclared player opportunity attack',()=>{
  const b=createIntegrationFixture(baseline).encounters['yulin-jiang']();
  b.playerDefenseDeclarations=true;b.reactionWindows=true;b.activeId='jiang';
  b.actors.jiang.state=beginTurn(b.actors.jiang.state).state;
  const command={actorId:'jiang',abilityId:'move',to:[5,0]};let rolls=0;
  const options={drawDice:()=>{rolls++;return Array(1024).fill(8);}};
  const pending=resolveStep(b,command,options);
  assert.equal(pending.battle.pending?.kind,'opportunity');
  assert.equal(pending.battle.pending.awaiting,'player');
  assert.equal(rolls,0);assert.deepEqual(pending.battle.actors.jiang.position,[1,0]);
  const declined=resolveStep(pending.battle,{actorId:'player',abilityId:'opportunityReact',choice:'decline'},
    {...options,playerAuthorized:true});
  assert.deepEqual(declined.battle.actors.jiang.position,[5,0]);
  assert.equal(declined.battle.actors.player.state.turn.opportunityUsed,false);
  assert.equal(rolls,0);
  const selected=resolveStep(pending.battle,{actorId:'player',abilityId:'opportunityReact',choice:'strike'},
    {...options,playerAuthorized:true});
  assert.equal(selected.battle.pending?.awaiting,'jiang');
  const resolved=resolveStep(selected.battle,{actorId:'jiang',abilityId:'react',choice:'decline'},options);
  assert.equal(resolved.battle.actors.player.state.turn.opportunityUsed,true);
  assert.ok(rolls>0);
});
test('compound movement and attack use player-declared coordinates, not an extra implicit turn',async()=>{
  const f=fixture();await start(f);
  f.setPlan({steps:[{quote:'侧移半米',command:{abilityId:'step',to:[0,0.5]},cost:{actions:{move:1},energy:{}}},
    {quote:'普通攻击',command:{abilityId:'strike',targetId:'jiang'},cost:{actions:{standard:1},energy:{}}}]});
  await f.session.handleTurn({player:f.player('先五尺快步侧移半米，移动动作；再普通攻击姜子尤，标准动作，不耗能。')});
  assert.deepEqual(f.root().battle.actors.player.position,[0,0.5]);
  assert.equal(f.root().actors.player.state.turn.standard,0);
  assert.equal(f.root().actors.player.state.turn.move,0);
  assert.equal(f.root().actors.player.state.turn.swift,1);
  assert.equal(f.root().battle.activeId,'player');
});
test('NPC duel writes back all private results but posts one public scene and allows story afterwards',async()=>{
  const f=fixture();await start(f,'jiang-huang');
  assert.equal(f.root().battle.mode,'story');
  assert.equal(f.facts.length,1);
  assert.ok(f.facts[0].events.some(x=>x.outcome==='造成伤势'));
  assert.ok(Object.values(f.root().actors).some(a=>a.state.health.L>0));
  assert.deepEqual(f.facts[0].participants.map(x=>Object.keys(x)),[['id','name','location','condition','arms'],['id','name','location','condition','arms']]);
  const ui=await f.session.currentState();
  assert.equal(ui.player.name,'御临风');
  assert.ok(Number.isInteger(ui.player.attack.dp));
  assert.equal(ui.player.defense.pending,true);
  assert.doesNotMatch(JSON.stringify(ui),/姜子尤|黄泉|布莱特/);
  assert.equal((await f.session.handleTurn({player:f.player('我问布莱特觉得怎么样')})).handled,false);
});

test('view-own-status opens only the UI before interpreting, narrating, rolling or adding an assistant floor',async()=>{
  const f=fixture();await start(f);
  const before=structuredClone(f.root()),narrations=f.facts.length,rolls=f.rolls(),interpreted=f.interpreted();
  const p=f.player('查看我的状态'),length=f.chat.length;
  assert.equal((await f.session.handleTurn({player:p})).status,'status_ui');
  assert.equal(f.opened(),1);assert.equal(f.chat.length,length);
  assert.deepEqual(f.root(),before);assert.equal(f.facts.length,narrations);
  assert.equal(f.rolls(),rolls);assert.equal(f.interpreted(),interpreted);
  f.refresh();await f.session.handleTurn({player:p});
  assert.equal(f.opened(),2);assert.equal(f.chat.length,length);assert.deepEqual(f.root(),before);
});

test('player UI reads latest selected MVU snapshot across new floors and refresh without writing or trusting prose',async()=>{
  const f=fixture();assert.equal(await f.session.currentState(),null);await start(f);
  const expected=await f.session.currentState(),floors=structuredClone(f.floors);
  f.player('生命999，风池999，攻击999DP');
  f.refresh();assert.deepEqual(await f.session.currentState(),expected);
  assert.deepEqual(f.floors,floors,'reading UI must not carry or overwrite any MVU floor');
  const last=f.chat.length-1;
  f.floors[last]=structuredClone(f.floors[last-1]);
  const root=f.root();root.revision++;
  root.actors.player.name='存档玩家';root.actors.player.state.resources.风池.current=3;
  root.actors.player.state.statuses=[{type:'晕眩',points:2}];
  const ui=await f.session.currentState();
  assert.equal(ui.player.name,'存档玩家');assert.equal(ui.player.energy.风池.current,3);
  assert.deepEqual(ui.player.statuses,[{type:'晕眩',points:2}]);
  assert.equal(ui.revision,expected.revision+1);
});

test('declared guard updates the player UI without ending the turn and survives refresh',async()=>{
  const f=fixture();await start(f);
  assert.deepEqual((await f.session.currentState()).player.defense,{pending:true});
  f.setPlan({steps:[{quote:'正十七守势',command:{abilityId:'zheng'},cost:{actions:{move:1},energy:{}}}]});
  await f.session.handleTurn({player:f.player('我声明正十七守势，消耗一个移动动作，不耗能，其他动作保留。')});
  const facts=f.facts.at(-1);
  assert.equal(facts.events.length,1,'only the newly executed guard belongs in this narration');
  const guard=facts.events[0];
  assert.equal(guard.actor,'御临风');assert.equal(guard.status,'resolved');
  assert.match(guard.execution,/剑/);assert.match(guard.execution,/护|守|挡/);
  assert.match(guard.outcome,/准备.*成立|守势.*成立/);
  assert.doesNotMatch(JSON.stringify(guard),/54|DP|学识|智力|吸收1/);
  assert.equal(facts.phase,'等待玩家继续行动');
  const ui=await f.session.currentState();
  assert.equal(ui.player.actions.move,0);assert.equal(ui.player.actions.standard,1);assert.equal(ui.player.actions.swift,1);
  assert.equal(ui.player.energy.风池.current,10);assert.ok(ui.player.defense.total>0);
  assert.equal(ui.player.declaredDefense.mode,'block');assert.equal(ui.player.activeTurn,true);
  f.refresh();assert.deepEqual(await f.session.currentState(),ui);
});

test('legacy own-status caches are stripped on replay without losing the saved narrative',async()=>{
  const f=fixture(),p=await start(f);
  const prose=f.chat.at(-1).mes;
  f.chat[p.messageId].extra['901_narrative'].completed.message+=
    '\n\n<details><summary>御临风 · 自身状态</summary>生命21/21，攻击999DP</details>';
  f.chat.pop();f.refresh();await f.session.handleTurn({player:p});
  assert.equal(f.chat.at(-1).mes,prose);assert.equal(f.facts.length,1);
  assert.equal(stripLegacyOwnStatus('<details><summary>存档玩家 · 自身状态</summary>状态</details>'),'');
});


test('existing chat builds its map once, map viewing does not spend actions, and next declaration still executes',async()=>{
  let generated=0,opened=0;
  let declaration={steps:[{quote:'移动到（0，1）',command:{abilityId:'move',to:[0,1]}}]};
  const f=fixture();await start(f);
  // Reload the existing MVU save with map generation enabled, as for installed older chats.
  let session=createNarrativeSession({baseline,mvu:{getMvuData:({message_id})=>structuredClone(f.floors[message_id]??{stat_data:{}}),replaceMvuData:async(d,{message_id})=>{f.floors[message_id]=structuredClone(d);}},
    tavern:{chat:f.chat,chatId:'narrative-test',saveChat:async()=>{}},
    createChatMessages:async ms=>{for(const m of ms)f.chat.push({mes:m.message,is_user:false,swipe_id:0,extra:m.extra??{}});},
    setChatMessages:async us=>{for(const u of us)f.chat[u.message_id].extra=structuredClone(u.extra);},
    // Keep this map/reload regression deterministic: random opportunity damage can incapacitate and correctly cancel movement.
    drawDice:()=>Array(1024).fill(1),
    mapGenerator:async()=>{generated++;return {version:1,title:'演练场',bounds:[-20,-20,80,80],features:[]};},onMapRequest:()=>{opened++;},
    interpret:async()=>declaration,narrate:async()=> '御临风移开一步，重新站稳。'});
  const before=structuredClone(f.root().actors);
  await session.handleTurn({player:f.player('查看地图')});
  assert.equal(generated,1);assert.equal(opened,1);assert.deepEqual(f.root().actors,before);
  await session.handleTurn({player:f.player('查看地图')});assert.equal(generated,1);
  await session.handleTurn({player:f.player('我移动到（0，1），不结束本回合。')});
  if(f.root().battle.pending) {
    declaration={steps:[{quote:'普通防御',command:{abilityId:'react',choice:'decline',defense:'normal'}}]};
    await session.handleTurn({player:f.player('普通防御')});
  }
  assert.deepEqual(f.root().battle.actors.player.position,[0,1]);assert.equal(f.root().actors.player.state.turn.move,0);
  assert.equal(generated,1);assert.equal((await session.currentState()).map.actors.find(a=>a.id==='player').position[1],1);
});
