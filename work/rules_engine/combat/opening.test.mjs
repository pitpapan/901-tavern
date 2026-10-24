import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEnemy,createOpeningEncounter} from './opening.mjs';
import {panel,attackProfile,resolveDefense,act} from './engine.mjs';
import {saveProfile} from './mechanics.mjs';
import {createOpeningFixture,stoneWithdrawalBinding} from '../gm_runtime/opening.mjs';
import {createCombatRuntime} from './runtime.mjs';
import {publicScene,playerDeclarationContext} from './presentation.mjs';
const rosterBattle=()=>({actors:createOpeningRoster(),activeId:'player',round:1});
test('opening profiles use complete period-specific rules, mother skill autos and no late equipment',()=>{
  const b=rosterBattle();
  const expected={player:[12,3,25,7,21,1,14,11],huang:[12,6,16,13,18,2,10,8],jiang:[20,6,25,6,23,2,18,6],bright:[8,5,22,9,13,0,14,6]};
  for(const [id,values] of Object.entries(expected)) {const p=panel(b,id);assert.deepEqual([p.hpMax,p.will.max,p.speed,p.initiative,p.attack.dp,p.attack.fixed,p.attack.cap,p.defense.total],values);}
  assert.deepEqual(b.actors.player.state.resources,{流风:{current:22,max:22}});
  assert.deepEqual(b.actors.jiang.state.resources,{气:{current:2,max:2},斗气:{current:2,max:2}});
  assert.equal(b.actors.player.state.skills.制造,undefined);
  assert.equal(b.actors.player.unknownSkills.制造.level,null);
  assert.equal(b.actors.player.inventory.find(i=>i.name==='药B').quantity,3);
  assert.deepEqual(b.actors.bright.state.resources,{});
  assert.equal(saveProfile(b.actors.player,'reflex').dp,8);
  const f=createOpeningFixture();assert.equal(f.encounterOptions.length,6);assert.equal(f.baseline.definition.attributes.力量,5);
});
test('opening declared block includes mother skill auto; no free Huang block or late sword defense',()=>{
  const b=rosterBattle();b.actors.huang.sheathed=false;
  for(const [id,def,auto] of [['player',19,1],['huang',14,1],['jiang',13,1],['bright',7,0]]) {
    b.actors[id].buffs.block=true;const d=resolveDefense(b,id);assert.equal(d.total,def);assert.equal(d.extraSuccesses,auto);
  }
  assert.equal(resolveDefense(b,'huang','player').total,16);
  assert.equal(resolveDefense(b,'bright','jiang').total,9);
  assert.match(playerDeclarationContext({...b,status:'active',order:['player'],knowledge:{}},0).abilities.tengzhuan.text,/流风|一分钟/);
});
test('opening attacks use flow, posture, draw, electricity and bare-body conditions exactly once',()=>{
  const b=rosterBattle(),a=b.actors.player;
  a.buffs.flow=2;assert.equal(attackProfile(b,'player').dp,25);a.buffs.tengzhuan=true;assert.equal(attackProfile(b,'player').dp,27);assert.equal(panel(b,'player').speed,45);
  b.actors.huang.buffs.drawnRound=1;assert.equal(attackProfile(b,'huang',{targetId:'player'}).dp,20);assert.equal(attackProfile(b,'huang',{targetId:'player'}).extra,1);
  const thunder=attackProfile(b,'huang',{abilityId:'thunder',targetId:'player'});assert.equal(thunder.dp,22);assert.equal(thunder.electric,2);
  b.actors.player.combatProfile.equipment.armor.defense=0;
  const bare=attackProfile(b,'jiang',{targetId:'player'});assert.deepEqual([bare.dp,bare.fixed,bare.cap],[27,3,22]);
  b.actors.bright.aim={targetId:'player',rounds:2};const bow=attackProfile(b,'bright',{targetId:'player'});assert.deepEqual([bow.dp,bow.fixed,bow.cap,bow.aggravate,bow.extra],[18,0,14,1,1]);
  const shot=createOpeningEncounter({id:'aim',scenario:'满瞄定向检查',participants:['bright','player'],positions:{bright:[0,0],player:[12,0]},teams:{player:'目标'}});
  shot.playerDefenseDeclarations=false;shot.actors.bright.loaded=true;shot.actors.bright.aim={targetId:'player',rounds:2};
  const miss=act(shot,{actorId:'bright',abilityId:'strike',targetId:'player'},{drawDice:()=>Array(1024).fill(1)});assert.deepEqual(miss.result.damage,[]);assert.equal(miss.result.attack.extra,0);
  shot.actors.player.state.attributeDamage={敏捷:5,感知:4};shot.actors.player.combatProfile.equipment.armor.defense=0;
  const hit=act(shot,{actorId:'bright',abilityId:'strike',targetId:'player'},{drawDice:()=>Array(1024).fill(9)});assert.equal(hit.result.attack.amount,14);assert.equal(hit.result.attack.extra,1);assert.equal(hit.result.damage[0].inputSeverity,'A');
});
test('adopted enemies keep fixed HP and stone attack is B within its real territory',()=>{
  for(const [type,hp,dp]of [['cityGuard',8,8],['veteran',9,12],['stone',14,13]]){
    const a=createOpeningEnemy(type);const b={actors:{[type]:a},round:1,activeId:type};assert.equal(panel(b,type).hpMax,hp);assert.equal(attackProfile(b,type).dp,dp);
  }
  let b=createOpeningEncounter(stoneWithdrawalBinding());b.activeId='stone';b.actors.stone.state.turn={phase:'active',standard:1,move:1,swift:1,opportunityUsed:false};
  const hit=act(b,{actorId:'stone',abilityId:'strike',targetId:'player'},{drawDice:()=>Array(1024).fill(9),defenseDeclarations:{player:'normal'}});
  assert.ok(hit.result.damage.length);assert.ok(hit.result.damage.every(d=>d.inputSeverity==='B'));
  assert.throws(()=>act(b,{actorId:'stone',abilityId:'move',to:[7,0]}),/固定阵地/);
});
test('opening D magic-killer finisher uses one layer, adds no automatic successes and clears rather than restacks',()=>{
  const b=createOpeningEncounter({id:'combo',scenario:'定向规则测试',participants:['jiang','player'],positions:{jiang:[0,0],player:[1,0]},teams:{player:'目标'}});
  b.activeId='jiang';b.playerDefenseDeclarations=false;b.actors.jiang.state.turn={phase:'active',standard:1,move:1,swift:1,opportunityUsed:false};
  b.actors.jiang.combos.player=1;b.actors.jiang.comboExpires={player:2};
  const out=act(b,{actorId:'jiang',abilityId:'strike',targetId:'player',finisher:true},{drawDice:()=>Array(1024).fill(9)});
  assert.equal(out.result.attack.extra,0);assert.equal(out.battle.actors.jiang.combos.player,undefined);
  b.round=2;const expired=act(b,{actorId:'jiang',abilityId:'end'});assert.equal(expired.battle.actors.jiang.combos.player,undefined);
});
test('formal withdrawal writes through existing MVU, keeps injuries/resources and does not complete task or award XP',async()=>{
  let data={stat_data:{}};const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}};
  const env={mvu,getAnchor:()=>({chatId:'opening-test',messageId:0,swipeId:0}),expectedChatId:'opening-test'};
  const rt=createCombatRuntime(env),b=createOpeningEncounter(stoneWithdrawalBinding({isolated:true}));
  b.actors.player.state.health.intact=10;b.actors.player.state.health.L=2;b.actors.player.state.resources.流风.current=19;
  await rt.initialize(b);
  await rt.dispatch({operationId:'exit',expectedRevision:0,command:{actorId:'player',abilityId:'move',to:[8,0]},playerAuthorized:true});
  // Opportunity first waits for the player to choose this separate attack defense.
  let current=rt.read();if(current.battle.pending)await rt.dispatch({operationId:'react',expectedRevision:current.revision,command:{actorId:'player',abilityId:'react',choice:'decline',defense:'normal'},playerAuthorized:true});
  current=rt.read();assert.equal(current.battle.status,'finished');assert.equal(current.battle.resolution.taskComplete,false);
  await rt.leave({operationId:'leave',expectedRevision:current.revision});current=rt.read();
  assert.equal(current.battle.mode,'story');assert.equal(current.battle.actors.player.state.resources.流风.current,19);
  assert.equal(current.battle.actors.player.state.xp,0);assert.ok(current.battle.actors.player.state.health.L>=2);
  assert.equal(publicScene(data.stat_data['901_rules_poc']).resolution.kind,'withdrawal');
});
test('withdrawal/reentry carries duration, same-scene once-use and cooldown; new-scene once-use remains fresh',async()=>{
  let data={stat_data:{}};const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}};
  const rt=createCombatRuntime({mvu,getAnchor:()=>({chatId:'carry-test',messageId:0,swipeId:0}),expectedChatId:'carry-test'});
  const binding=stoneWithdrawalBinding(),battle=createOpeningEncounter(binding),a=battle.actors.player;
  battle.status='finished';a.buffs.flow=2;a.expires={flow:10};a.used.damageConversion=true;a.cooldowns.thunder=2;
  await rt.initialize(battle);await rt.leave({operationId:'leave-a',expectedRevision:0});
  let root=data.stat_data['901_rules_poc'];assert.equal(root.actors.player.combatCarry.durationCarry.flow.remainingRounds,9);
  assert.equal(root.actors.player.combatCarry.cooldownCarry.thunder.remainingRounds,1);
  await rt.enter({operationId:'enter-a',expectedRevision:1,battle:createOpeningEncounter(binding)});
  let restored=rt.read().battle.actors.player;assert.equal(restored.buffs.flow,2);assert.equal(restored.expires.flow,10);assert.equal(restored.used.damageConversion,true);assert.equal(restored.cooldowns.thunder,2);
  // Legacy saves already have combatCarry without new fields: fall back to their battle metadata.
  root=data.stat_data['901_rules_poc'];root.battle.status='finished';root.battle.actors.player.durationCarry={flow:{value:2,remainingRounds:8,needsHostTimeAccounting:true}};delete root.actors.player.combatCarry.durationCarry;
  await rt.enter({operationId:'enter-legacy',expectedRevision:2,battle:createOpeningEncounter(binding)});
  assert.equal(rt.read().battle.actors.player.expires.flow,9);
  data.stat_data['901_rules_poc'].battle.status='finished';
  const other=createOpeningEncounter({...binding,instanceId:'other-scene'});
  await rt.enter({operationId:'enter-b',expectedRevision:3,battle:other});restored=rt.read().battle.actors.player;
  assert.equal(restored.used.damageConversion,undefined);assert.equal(restored.buffs.flow,2);assert.equal(restored.cooldowns.thunder,2);
});
