import test from 'node:test';
import assert from 'node:assert/strict';
import {createArenaRoster,createArenaEncounter} from './arena.mjs';
import {act,panel,attackProfile,resolveDefense} from './engine.mjs';
import {saveProfile} from './mechanics.mjs';
import {resolveStep} from './transitions.mjs';
import {inspectCommands,createCombatRuntime,chooseAction} from './runtime.mjs';
import {tacticalInspection} from './tactics.mjs';
import {publicScene} from './presentation.mjs';

const dice=n=>()=>Array(1024).fill(n);
const encounter=(id='radwick',extra={})=>createArenaEncounter(`arena-${id}`,{positions:{player:[0,0],[id]:id==='radwick'?[1,0]:[12,0]},map:{title:'隔离测试擂台',bounds:[-25,-25,80,50],bounded:true,features:[]},...extra});
const turn=(b,id)=>{b.activeId=id;b.actors[id].state.turn={phase:'active',standard:1,move:1,swift:1,opportunityUsed:false};return b;};
const command=(actorId,abilityId,extra={})=>({actorId,abilityId,...extra});
const step=(b,c,opts={})=>resolveStep(b,c,{drawDice:dice(1),playerAuthorized:true,...opts});

test('arena profiles preserve T0 player and the two candidate panels without Bright aim features',()=>{
  const b={actors:createArenaRoster(),round:1};
  assert.deepEqual(b.actors.player.state.attributes,{力量:5,敏捷:5,智力:4,感知:4,意志:1,风度:2});
  assert.deepEqual(b.actors.player.state.resources,{流风:{current:22,max:22}});
  assert.ok(!b.actors.player.abilities.some(x=>['zheng','perfectWarrior'].includes(x)));
  for(const [id,values]of [['radwick',[16,16,2,16,7]],['mireya',[12,19,2,20,8]]]) {
    const p=panel(b,id);assert.deepEqual([p.hpMax,p.attack.dp,p.attack.fixed,p.attack.cap,p.defense.total],values);
  }
  b.actors.radwick.buffs.block=true;assert.deepEqual([resolveDefense(b,'radwick').total,resolveDefense(b,'radwick').extraSuccesses],[14,1]);
  assert.deepEqual(saveProfile(b.actors.mireya,'reflex'),{dp:13,fixed:1,extra:0});
  assert.deepEqual(saveProfile(b.actors.mireya,'fort'),{dp:9,fixed:0,extra:0});
  assert.deepEqual(Object.keys(encounter().actors),['player','radwick']);
  assert.deepEqual(Object.keys(encounter('mireya').actors),['player','mireya']);
});

test('shield push waits for player declaration before real dice or energy and moves only the target',()=>{
  const b=turn(encounter(),'radwick');let draws=0;
  const drawDice=()=>{draws++;return Array(1024).fill(draws%2?9:1);};
  const declared=step(b,command('radwick','shieldPush',{targetId:'player',empowered:true}),{drawDice});
  assert.equal(draws,0);assert.equal(declared.battle.pending.awaiting,'player');assert.equal(declared.battle.actors.radwick.state.resources.斗气.current,3);
  assert.deepEqual(declared.battle.actors.player.position,[0,0]);assert.equal(declared.result.contest,undefined);
  const done=step(declared.battle,command('player','react',{choice:'decline',defense:'normal'}),{drawDice});
  assert.equal(draws,2);assert.equal(done.result.contest.dp,16);assert.equal(done.result.contest.fixed,1);
  assert.equal(done.battle.actors.radwick.state.resources.斗气.current,2);
  assert.deepEqual(done.battle.actors.player.position,[-2,0]);assert.deepEqual(done.battle.actors.radwick.position,[1,0]);assert.deepEqual(done.result.damage,[]);
  assert.equal(done.battle.actors.radwick.state.turn.move,1);
});

test('shield push cannot pass through a wall or outside a bounded map',()=>{
  const b=turn(encounter('radwick',{map:{bounds:[-1,-4,8,8],bounded:true,features:[]}}),'radwick');let n=0;
  const done=act(b,command('radwick','shieldPush',{targetId:'player'}),{defenseDeclarations:{player:'normal'},drawDice:()=>Array(1024).fill(++n===1?9:1)});
  assert.equal(done.result.contest.won,true);assert.equal(done.result.forcedMovement,undefined);assert.deepEqual(done.battle.actors.player.position,[0,0]);
});

test('one-use qi defense costs once, adds only three and is consumed by the next physical defense',()=>{
  let b=turn(encounter(),'radwick');b=act(b,command('radwick','brace')).battle;
  assert.equal(b.actors.radwick.state.resources.斗气.current,2);assert.equal(resolveDefense(b,'radwick').total,10);
  assert.throws(()=>act(b,command('radwick','brace')),/已成立/);
  b=turn(b,'player');const out=act(b,command('player','strike',{targetId:'radwick'}),{playerAuthorized:true,drawDice:dice(1)});
  assert.equal(out.battle.actors.radwick.buffs.brace,undefined);
  assert.equal(resolveDefense(out.battle,'radwick').total,7);
});

test('Mireya reload and full-round calibration produce one +3 shot with unchanged cap and no Bright extras',()=>{
  let b=encounter('mireya');
  assert.throws(()=>act(b,command('mireya','strike',{targetId:'player'})),/上箭/);
  b=act(b,command('mireya','calibrate',{targetId:'player'})).battle;
  assert.deepEqual([b.actors.mireya.state.turn.standard,b.actors.mireya.state.turn.move,b.actors.mireya.state.turn.swift],[0,0,1]);
  assert.equal(b.actors.mireya.loaded,false);
  b=act(b,command('mireya','end')).battle;b=act(b,command('player','end'),{playerAuthorized:true}).battle;
  assert.throws(()=>act(b,command('mireya','strike',{targetId:'player'})),/上箭/);
  b=act(b,command('mireya','reload')).battle;assert.equal(b.actors.mireya.calibration.ready,true);
  const p=attackProfile(b,'mireya',{targetId:'player'});assert.deepEqual([p.dp,p.cap,p.fixed,p.extra,p.aggravate,p.speed],[22,20,2,0,0,0]);
  const waiting=step(b,command('mireya','strike',{targetId:'player'}));assert.equal(waiting.battle.actors.mireya.ammunition,18);
  const out=step(waiting.battle,command('player','react',{choice:'decline',defense:'normal'}));
  assert.equal(out.battle.actors.mireya.ammunition,17);assert.equal(out.battle.actors.mireya.loaded,false);assert.equal(out.battle.actors.mireya.calibration,undefined);
  assert.ok(out.result.damage.every(d=>d.inputSeverity==='B'));
  assert.deepEqual(out.battle.actors.mireya.position,[12,0]);
  const scene=publicScene({battle:out.battle,actors:out.battle.actors,revision:1,operations:{shot:{
    signature:JSON.stringify(command('mireya','strike',{targetId:'player'})),summary:{revision:1,result:out.result},
  }}});
  const shot=scene.events.find(e=>e.actor==='米蕾娅'&&e.status==='resolved');
  assert.match(shot.arms,/长弓与箭矢/);assert.match(shot.execution,/松弦放箭.*箭矢/);
  assert.doesNotMatch(JSON.stringify(shot),/未上箭|空弦/);
  assert.match(scene.participants.find(a=>a.id==='mireya').arms,/双手持竞技弓，未上箭/);
  assert.ok(!tacticalInspection(out.battle,inspectCommands(out.battle)).options.some(o=>o.preview.movement?.intent==='hold'));
});

test('Mireya calibration is lost on movement and a melee hit; club draw and block cost separate actions',()=>{
  const arms=b=>publicScene({battle:b,actors:b.actors,operations:{},revision:0}).participants.find(a=>a.id==='mireya').arms;
  let b=encounter('mireya');b.actors.mireya.calibration={targetId:'player',ready:true};
  assert.match(arms(b),/双手持竞技弓，未上箭/);
  const loaded=act(b,command('mireya','reload')).battle;assert.match(arms(loaded),/双手持竞技弓，已上箭/);
  b=act(b,command('mireya','step',{to:[13,0]})).battle;assert.equal(b.actors.mireya.calibration,undefined);
  b=encounter('mireya');assert.throws(()=>act(b,command('mireya','block')),/弓不能格挡/);
  b=act(b,command('mireya','drawClub')).battle;assert.equal(b.actors.mireya.buffs.block,undefined);assert.equal(b.actors.mireya.state.turn.move,0);
  assert.match(arms(b),/包毡短棍在手，竞技弓不处于射击姿势/);assert.doesNotMatch(arms(b),/双手持竞技弓/);
  assert.equal(attackProfile(b,'mireya').dp,11);assert.equal(attackProfile(b,'mireya').fixed,0);
  b=act(b,command('mireya','block')).battle;assert.equal(b.actors.mireya.state.turn.standard,0);assert.equal(resolveDefense(b,'mireya').total,12);
  assert.throws(()=>act(b,command('mireya','reload')),/持棍/);
  b=turn(encounter('mireya',{positions:{player:[0,0],mireya:[1,0]}}),'player');b.actors.mireya.calibration={targetId:'player',ready:true};
  const hit=act(b,command('player','strike',{targetId:'mireya'}),{playerAuthorized:true,drawDice:dice(9)});assert.equal(hit.battle.actors.mireya.calibration,undefined);
});

test('healthy Mireya opening keeps safe reload and attack preparation instead of conceding the match',async()=>{
  const b=encounter('mireya'),a=b.actors.mireya;
  assert.equal(b.activeId,'mireya');assert.equal(a.state.health.intact,12);assert.equal(a.ammunition,18);assert.equal(a.loaded,false);
  assert.deepEqual(a.position,[12,0]);
  const inspection=tacticalInspection(b,inspectCommands(b));
  assert.ok(inspection.options.some(o=>o.command.abilityId==='reload'));
  assert.ok(!inspection.options.some(o=>o.command.abilityId==='concede'));
  let system;
  const selected=await chooseAction({read:()=>({battle:b,revision:1})},async request=>{
    system=request.ordered_prompts[0].content;
    const context=JSON.parse(request.user_input);
    const surrender=context.legalOptions.findIndex(o=>o.abilityId==='concede');
    return JSON.stringify({option:surrender>=0?surrender:context.legalOptions.findIndex(o=>o.abilityId==='reload')});
  });
  assert.equal(selected.command.abilityId,'reload');assert.match(system,/concede.*认输.*整场/);assert.match(system,/end.*结束.*回合/);
  const loaded=act(b,selected.command).battle;
  assert.equal(loaded.actors.mireya.loaded,true);assert.equal(loaded.actors.mireya.state.turn.standard,1);
  assert.ok(tacticalInspection(loaded,inspectCommands(loaded)).options.some(o=>o.command.abilityId==='strike'));
  const incoming=step(loaded,command('mireya','strike',{targetId:'player'}));
  assert.equal(incoming.battle.pending.awaiting,'player');assert.equal(incoming.battle.status,'active');
});

test('NPC concession candidates require actual severe wounds or an exhausted bow without a melee fallback',()=>{
  const b=encounter('mireya'),a=b.actors.mireya;
  a.state.health.intact=4;a.state.health.B=8;
  assert.ok(tacticalInspection(b,inspectCommands(b)).options.some(o=>o.command.abilityId==='concede'));
  a.state.health.intact=12;a.state.health.B=0;a.ammunition=0;
  assert.ok(!tacticalInspection(b,inspectCommands(b)).options.some(o=>o.command.abilityId==='concede'));
  a.abilities=a.abilities.filter(id=>id!=='drawClub');
  assert.ok(tacticalInspection(b,inspectCommands(b)).options.some(o=>o.command.abilityId==='concede'));
});

test('arena voluntary concession and announced test referee stop preserve damage/resources and award no XP',()=>{
  const healthy=turn(encounter('mireya'),'player'),inspection=inspectCommands(healthy);
  assert.equal(healthy.actors.player.state.health.intact,healthy.actors.player.state.derived.hpMax);
  assert.equal(tacticalInspection(healthy,inspection),inspection);
  assert.ok(inspection.options.some(o=>o.command.abilityId==='concede'));
  assert.equal(act(healthy,command('player','concede'),{playerAuthorized:true}).battle.resolution.kind,'concede');
  const b=turn(encounter(),'player');b.actors.player.state.resources.流风.current=17;b.actors.player.state.health.intact=10;b.actors.player.state.health.B=2;
  assert.throws(()=>act(b,command('player','concede')),/玩家/);
  const out=act(b,command('player','concede'),{playerAuthorized:true});assert.equal(out.battle.status,'finished');assert.equal(out.battle.resolution.kind,'concede');assert.equal(out.battle.resolution.xpAwarded,0);
  assert.equal(out.battle.actors.player.state.resources.流风.current,17);assert.equal(out.battle.actors.player.state.health.B,2);
  const stopped=encounter();stopped.actors.radwick.state.health.intact=3;stopped.actors.radwick.state.health.B=13;
  const called=act(stopped,command('player','end'),{playerAuthorized:true});assert.equal(called.battle.resolution.kind,'refereeStop');assert.equal(called.battle.resolution.actorId,undefined);
  called.battle.resolution.text='按本次隔离试赛预告的完好槽阈值或失能规则，裁判终止交锋。';
  const legacy={battle:called.battle,actors:called.battle.actors,operations:{},revision:0},before=structuredClone(legacy);
  const projected=publicScene(legacy);assert.match(projected.resolution.text,/按本场预告的终止条件/);
  assert.doesNotMatch(JSON.stringify(projected),/裁判/);assert.deepEqual(legacy,before);
});

test('arena MVU dedup, public shove result and reentry preserve actual injuries, ammo and held weapon',async()=>{
  let data={stat_data:{}},draws=0;const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}};
  const rt=createCombatRuntime({mvu,getAnchor:()=>({chatId:'arena-test',messageId:0,swipeId:0}),expectedChatId:'arena-test',drawDice:()=>Array(1024).fill(++draws%2?9:1)});
  await rt.initialize(turn(encounter(),'radwick'));
  await rt.dispatch({operationId:'push',expectedRevision:0,command:command('radwick','shieldPush',{targetId:'player'})});
  const reaction={operationId:'defend',expectedRevision:1,command:command('player','react',{choice:'decline',defense:'normal'}),playerAuthorized:true};
  await rt.dispatch(reaction);await rt.dispatch(reaction);assert.equal(draws,2);
  const scene=publicScene(data.stat_data['901_rules_poc']);const event=scene.events.find(e=>e.action==='抢身盾推'&&e.status==='resolved');assert.match(event.outcome,/推开/);assert.equal(event.displacement.travelMeters,2);assert.doesNotMatch(JSON.stringify(scene),/targetTotal|rolledSuccesses|斗气/);
  const fallen=structuredClone(data.stat_data['901_rules_poc']);
  fallen.actors.radwick.state.health={...fallen.actors.radwick.state.health,intact:0,B:9,L:7,A:0};
  const fallenScene=publicScene(fallen),radwick=fallenScene.participants.find(a=>a.id==='radwick');
  assert.match(radwick.condition,/失去意识.*不能对话或自主行动/);assert.doesNotMatch(JSON.stringify(radwick),/hpMax|intact|"B"|"L"|"A"/);
  let battle=encounter('mireya');battle.status='finished';battle.actors.mireya.loaded=true;battle.actors.mireya.weaponMode='club';battle.actors.mireya.ammunition=9;battle.actors.player.state.health.intact=8;battle.actors.player.state.health.B=4;
  data={stat_data:{}};await rt.initialize(battle);await rt.leave({operationId:'leave',expectedRevision:0});
  await rt.enter({operationId:'return',expectedRevision:1,battle:encounter('mireya')});
  const restored=rt.read().battle;assert.equal(restored.actors.mireya.loaded,true);assert.equal(restored.actors.mireya.weaponMode,'club');assert.equal(restored.actors.mireya.ammunition,9);assert.equal(restored.actors.player.state.health.B,4);
  const seeded=createArenaEncounter('arena-mireya',{start:data.stat_data['901_rules_poc']});assert.equal(seeded.actors.mireya.ammunition,9);assert.equal(seeded.actors.mireya.weaponMode,'club');
});
