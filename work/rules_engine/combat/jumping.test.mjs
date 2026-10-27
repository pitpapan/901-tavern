import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {act,panel} from './engine.mjs';
import {beginTurn} from '../core.mjs';
import {advanceTime} from '../recovery.mjs';
const dice=()=>Array(256).fill(8),miss=()=>Array(256).fill(1);
function fixture(kind='long',runUp=3){
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[50,0]},teams:{huang:'对手'}}),a=b.actors.player;
 b.map={features:[]};b.activeId='player';a.state=beginTurn(a.state).state;
 a.state.attributes.力量=3;a.state.attributes.敏捷=3;a.state.skills.运动={level:1,subs:{跳跃:{level:1}}};a.combatProfile.speed=0;
 b.ruleScene={objects:{ledge:{type:'checkContext',source:'实际起跳地点',actorIds:['player'],plans:{jump:{purpose:'jump',kind,source:'本次跳跃',takeoff:[0,0,0],direction:[1,0],supportedTakeoff:true,runUp:{source:'此前已实际完成的直线助跑',meters:runUp}}}}}};
 return b;
}
test('paid long jump saves its roll and remaining horizontal distance, then continues without rerolling or free action',()=>{
 let b=fixture(),draws=0;const speed=panel(b,'player').speed;
 let out=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:()=>{draws++;return dice();}});
 b=JSON.parse(JSON.stringify(out.battle));const motion=b.actors.player.state.paidMotion;
 assert.equal(draws,1);assert.equal(motion.roll.jump.distance,12.8);assert.equal(motion.baseline.height,1);
 assert.ok(Math.abs(motion.remainingDistance-(12.8-speed))<1e-7);assert.equal(b.actors.player.state.turn.move,0);
 assert.ok(b.actors.player.position[2]>0);assert.equal(out.result.jump.movementApplied,true);assert.equal(out.result.movement.speed,speed);assert.equal(b.actors.player.state.resourceMovementHistory[0].speed,speed);
 const before=structuredClone(b.actors.player.position);advanceTime(b.actors.player,.1,[],{root:b,drawDice:miss});assert.deepEqual(b.actors.player.position,before);
 out=act(b,{actorId:'player',abilityId:'continueJump'},{playerAuthorized:true,drawDice:miss});b=out.battle;
 assert.equal(b.actors.player.state.turn.standard,0);assert.equal(b.actors.player.state.paidMotion.phase,'completed');
 assert.ok(Math.abs(b.actors.player.position[0]-12.8)<1e-7);assert.equal(b.actors.player.state.paidMotion.roll.jump.distance,12.8);
});
test('Q13 high jump charges ascent only and leaves descent to actual elapsed time',()=>{
 let b=fixture('high',0);const out=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:dice});b=out.battle;
 assert.deepEqual(b.actors.player.position.slice(0,2),[0,0]);assert.ok(Math.abs(b.actors.player.position[2]-1)<1e-8);assert.equal(b.actors.player.state.turn.move,0);assert.equal(b.actors.player.state.turn.standard,1);
 assert.equal(b.actors.player.state.physicalMotion.kind,'jump-descent');
 const changes=[];advanceTime(b.actors.player,1/60,changes,{root:b,drawDice:miss});
 assert.deepEqual(b.actors.player.position,[0,0]);assert.equal(b.actors.player.state.turn.standard,1);
 assert.equal(changes.find(x=>x.kind==='impact').rawDamage,0);
});
test('jump declaration rejects missing actual takeoff and borrowed numeric results before drawing or spending',()=>{
 const b=fixture();b.ruleScene.objects.ledge.plans.jump.takeoff=[1,0,0];const before=structuredClone(b);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:()=>{throw Error('must not roll');}}),/起跳/);
 assert.deepEqual(b,before);
 assert.throws(()=>act(fixture(),{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump',distance:100},{playerAuthorized:true,drawDice:miss}));
});

test('post-roll opportunity choice survives MVU reload and neither response nor replay repays the jump',async()=>{
 const {createCombatRuntime,inspectCommands}=await import('./runtime.mjs');
 const b=fixture();b.actors.huang.position=[0,1.5];b.actors.huang.controller='player';b.actors.huang.sheathed=false;
 let saved={},draws=0;
 const runtime=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(saved),replaceMvuData:async data=>{saved=JSON.parse(JSON.stringify(data));}},getAnchor:()=>({chatId:'jump-save',messageId:1,swipeId:0}),expectedChatId:'jump-save',drawDice:()=>{draws++;return dice();}});
 await runtime.initialize(b);
 const launch={operationId:'jump/start',expectedRevision:0,command:{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},playerAuthorized:true};
 await runtime.dispatch(launch);
 const pending=runtime.read().battle.pending;assert.equal(pending.kind,'paid-movement');assert.equal(draws,1);
 assert.equal(runtime.read().battle.actors.player.state.turn.move,0);assert.deepEqual(runtime.read().battle.actors.player.position,[0,0]);
 assert.ok(inspectCommands(runtime.read().battle).options.every(o=>o.command.abilityId==='opportunityReact'));
 const snapshot=structuredClone(saved);await runtime.dispatch(launch);assert.deepEqual(saved,snapshot);assert.equal(draws,1);
 const choice={operationId:'jump/react',expectedRevision:1,command:{actorId:'huang',abilityId:'opportunityReact',choice:'decline'},playerAuthorized:true};
 await runtime.dispatch(choice);assert.equal(runtime.read().battle.pending,undefined);assert.equal(draws,1);
 assert.equal(runtime.read().battle.actors.player.state.turn.standard,1);assert.ok(runtime.read().battle.actors.player.position[0]>0);
 const after=structuredClone(saved);await runtime.dispatch(choice);assert.deepEqual(saved,after);assert.equal(draws,1);
});
test('Q14 uses the unassisted height rather than the running jump apex when landing at a lower level',()=>{
 let b=fixture('long',3);b.actors.player.position=[0,0,10];b.ruleScene.objects.ledge.plans.jump.takeoff=[0,0,10];
 b.map.features=[{id:'ledge',kind:'terrain',rect:[-5,-5,6,10],elevation:10}];
 b=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:dice}).battle;
 b=act(b,{actorId:'player',abilityId:'continueJump'},{playerAuthorized:true,drawDice:miss}).battle;
 assert.equal(b.actors.player.state.physicalMotion.jumpBaselineHeight,1);
 const changes=[];advanceTime(b.actors.player,3/60,changes,{root:b,drawDice:miss});
 const hit=changes.find(x=>x.kind==='impact');assert.ok(hit);assert.ok(Math.abs(hit.equivalentHeight-13.2)<1e-7);
 assert.equal(hit.jumpBaselineHeight,1);assert.ok(Math.abs(hit.reducedDistance-12.2)<1e-7);assert.equal(hit.rawDamage,4);
});

test('foreign temporary boosts do not enlarge the Q14 unassisted landing baseline',()=>{
 const b=fixture('high',0);
 b.actors.player.state.activeResourceEffects=[{id:'outside-jump',sourceId:'outside-strength',casterId:'huang',effects:[{stat:'check',group:'enhancement',value:10,when:{test:'eq',left:{context:'purpose'},right:'jump'}}]}];
 const out=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:dice});
 assert.equal(out.battle.actors.player.state.paidMotion.roll.jump.distance,3);
 assert.equal(out.battle.actors.player.state.paidMotion.baseline.height,1);
 assert.deepEqual(out.battle.actors.player.state.paidMotion.baseline.excludedSources,['outside-jump']);
});

test('Q18 retains self-produced temporary jump strength in the baseline without a second roll or payment',()=>{
 const b=fixture('high',0),a=b.actors.player;
 a.state.activeResourceEffects=[{id:'own-jump-boost',sourceId:'own-magic',casterId:'player',effects:[{stat:'check',value:4,when:{test:'eq',left:{context:'purpose'},right:'jump'}}]}];
 const before=structuredClone(b);let draws=0;
 const out=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:()=>{draws++;return dice();}});
 assert.equal(draws,1);assert.deepEqual(b,before);
 assert.equal(out.battle.actors.player.state.paidMotion.baseline.height,1.8);
 assert.equal(out.battle.actors.player.state.turn.move,0);assert.equal(out.battle.actors.player.state.turn.standard,1);
});

test('Q17 wind footwork retains its actual standing height for landing but grants no running DP',()=>{
 const b=fixture('high',0),s=b.actors.player.state;
 s.learnedResources={'fengyou-sheshibu':{learned:true,source:'已取得'}};s.equippedArmorClass='light';s.resources.内力={current:1,max:5,generic:true};
 const out=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:dice});
 const m=out.battle.actors.player.state.paidMotion;
 assert.equal(m.roll.jump.distance,2);assert.equal(m.baseline.height,2);assert.equal(m.roll.jump.runUpDP,0);
 const restored=JSON.parse(JSON.stringify(out.battle)),events=[];
 advanceTime(restored.actors.player,1/60,events,{root:restored,drawDice:miss});
 assert.equal(events.find(e=>e.kind==='impact').rawDamage,0);
});

test('Q18 excludes foreign enhancements without removing a real foreign penalty from the landing baseline',()=>{
 const b=fixture('high',0);
 b.actors.player.state.activeResourceEffects=[{id:'outside',sourceId:'outside',casterId:'huang',effects:[{stat:'check',value:4},{stat:'check',value:-2}]}];
 const out=act(b,{actorId:'player',abilityId:'jump',objectId:'ledge',part:'jump'},{playerAuthorized:true,drawDice:dice});
 assert.ok(Math.abs(out.battle.actors.player.state.paidMotion.roll.jump.distance-1.4)<1e-8);
 assert.ok(Math.abs(out.battle.actors.player.state.paidMotion.baseline.height-.6)<1e-8);
});
