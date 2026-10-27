import test from 'node:test';
import assert from 'node:assert/strict';
import {measureFlightPath,spatialDistance,clearLine} from './map.mjs';
import {createOpeningEncounter} from './opening.mjs';
import {act,panel} from './engine.mjs';
import {beginTurn} from '../core.mjs';
import {advanceTime} from '../recovery.mjs';
const source='isolated actual flight',dice=()=>Array(200).fill(1);
const map={bounds:[-100,-100,200,200],bounded:true,features:[{id:'wall',kind:'obstacle',rect:[4,-2,2,4],height:5,blocksSight:true}]};
test('flight shares actual 3D distance and finite obstacle heights without changing ground path semantics',()=>{
 assert.equal(measureFlightPath(map,[0,0,0],[0,0,10]).cost,10);
 assert.equal(measureFlightPath(map,[0,0,10],[10,0,10]).valid,true);
 assert.equal(measureFlightPath(map,[0,0,1],[10,0,1]).valid,false);
 assert.equal(clearLine(map,[0,0,10],[10,0,10]),true);
 assert.equal(clearLine(map,[0,0,1],[10,0,1]),false);
 assert.equal(spatialDistance(map,[0,0,10],[0,0]),10);
});
test('a paid flight move uses the actual source and speed, saves altitude and descends through the shared clock',()=>{
 let b=createOpeningEncounter({id:'flight-encounter',participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}});
 b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;
 const a=b.actors.player;a.state.resourceCapabilities={flight:{id:'flight',source,grade:'C',casterId:'player',level:2,remainingMinutes:1,movement:{mode:'flight',speed:180,maneuverability:'perfect'},onEnd:{kind:'descent',rounds:6,metersPerRound:20,intervalMinutes:.1}}};
 assert.ok(panel(b,'player').movementModes.some(x=>x.instanceId==='flight'&&x.speed===180));
 b=act(b,{actorId:'player',abilityId:'move',movementSource:'flight',to:[0,0,100]},{playerAuthorized:true,drawDice:dice}).battle;
 assert.deepEqual(b.actors.player.position,[0,0,100]);assert.equal(b.actors.player.state.verticalPosition.heightAboveGround,100);
 assert.equal(b.actors.player.state.turn.move,0);
 const loaded=JSON.parse(JSON.stringify(b.actors.player));advanceTime(loaded,1.1,[],{drawDice:dice});
 assert.equal(loaded.state.verticalPosition.heightAboveGround,80);assert.deepEqual(loaded.position,[0,0,80]);
 advanceTime(loaded,.4,[],{drawDice:dice});assert.equal(loaded.state.verticalPosition.heightAboveGround,0);
 assert.deepEqual(loaded.position,[0,0]);assert.equal(loaded.state.pendingFall,undefined);
});

test('classifier offers real flight sources and MVU persists xyz plus the chosen support instance',async()=>{
 const {inspectCommands,createCombatRuntime}=await import('./runtime.mjs');
 const {NAMESPACE}=await import('../mvu_poc/fixture.mjs');
 const b=createOpeningEncounter({id:'flight-save',participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}});
 b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;
 b.actors.player.state.resourceCapabilities={flight:{id:'flight',source,grade:'C',level:2,casterId:'player',remainingMinutes:1,movement:{mode:'flight',speed:180,maneuverability:'perfect'},onEnd:{kind:'descent',rounds:6,metersPerRound:20,intervalMinutes:.1}}};
 assert.ok(inspectCommands(b).options.some(x=>x.command.movementSource==='flight'&&x.command.to[2]===20));
 let saved={};const mvu={getMvuData:()=>structuredClone(saved),replaceMvuData:async data=>{saved=JSON.parse(JSON.stringify(data));}};
 const runtime=createCombatRuntime({mvu,getAnchor:()=>({chatId:'flight-test',messageId:1,swipeId:0}),expectedChatId:'flight-test',drawDice:dice});
 await runtime.initialize(b);
 const request={operationId:'fly/1',expectedRevision:0,command:{actorId:'player',abilityId:'move',movementSource:'flight',to:[0,0,20]},playerAuthorized:true};
 await runtime.dispatch(request);const snapshot=structuredClone(saved);await runtime.dispatch(request);
 assert.deepEqual(saved,snapshot);assert.deepEqual(runtime.read().battle.actors.player.position,[0,0,20]);
 assert.deepEqual(saved.stat_data[NAMESPACE].actors.player.position,[0,0,20]);
 assert.equal(saved.stat_data[NAMESPACE].actors.player.state.verticalPosition.supportInstanceId,'flight');
});

test('perfect flight ignores PHB stall using the selected live source, while immobilization still blocks movement',()=>{
 const b=createOpeningEncounter({id:'flight-stall',participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}});
 b.map={features:[]};b.activeId='player';const a=b.actors.player;a.state=beginTurn(a.state).state;
 a.state.resourceCapabilities={flight:{id:'flight',source,grade:'C',level:2,remainingMinutes:1,movement:{mode:'flight',speed:180,maneuverability:'perfect'}}};
 a.state.statuses.push({type:'失速',points:100,source:'actual-stall'});
 assert.equal(panel(b,'player').movementModes[0].speed,180);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'move',to:[0,1]},{playerAuthorized:true,drawDice:dice}));
 const out=act(b,{actorId:'player',abilityId:'move',movementSource:'flight',to:[0,0,10]},{playerAuthorized:true,drawDice:dice});
 assert.deepEqual(out.battle.actors.player.position,[0,0,10]);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'move',movementSource:'invented',to:[0,0,10]},{playerAuthorized:true,drawDice:dice}));
 a.state.statuses.push({type:'冻结',points:100,source:'actual-freeze'});
 assert.equal(panel(b,'player').movementModes[0].speed,0);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'move',movementSource:'flight',to:[0,0,10]},{playerAuthorized:true,drawDice:dice}));
});

test('autonomous flight loses support at injury, keeps recorded inertia and applies only actual contacts',async()=>{
 const {damageEvent}=await import('./engine.mjs');
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}}),a=b.actors.player;
 b.map={features:[]};a.position=[0,0,20];a.state.verticalPosition={heightAboveGround:20,groundElevation:0,supportInstanceId:'flight',source};
 a.state.resourceCapabilities={flight:{id:'flight',source,level:2,casterId:'player',movement:{mode:'flight',control:'autonomous',speed:180,maneuverability:'perfect'},remainingMinutes:1,onEnd:{kind:'descent',rounds:3,metersPerRound:20,intervalMinutes:.1}}};
 a.state.flightKinematics={position:[0,0,20],velocity:[10,0,0],source:'已登记的10m/s向东运动',supportInstanceId:'flight'};
 const damage={damage:[]};damageEvent(a,[{amount:a.state.health.intact,severity:'L',kind:'physical',unavoidable:true}],false,damage,{conversion:0},{root:b,targetId:'player',drawDice:dice});
 assert.equal(a.state.physicalMotion.phase,'ballistic');assert.equal(a.state.verticalPosition.supportInstanceId,undefined);assert.equal(a.state.resourceDescent,undefined);
 assert.ok(a.state.resourceCapabilities.flight); // No invented dispel or expiry protection.
 const first=[];advanceTime(a,1/60,first,{root:b,drawDice:dice});assert.deepEqual(a.position,[10,0,15.1]);assert.equal(first.some(x=>x.kind==='impact'),false);
 const saved=JSON.parse(JSON.stringify(a)),changes=[];advanceTime(saved,2/60,changes,{root:{actors:{player:saved},map:b.map},drawDice:dice});
 assert.equal(saved.state.physicalMotion.phase,'grounded');assert.equal(changes.filter(x=>x.kind==='impact').length,1);
 assert.ok(Math.abs(saved.position[0]-10*Math.sqrt(40/9.8))<1e-7);assert.equal(saved.state.verticalPosition.heightAboveGround,0);
});
test('legacy airborne saves without a velocity do not silently become hovering or teleport to ground',async()=>{
 const {syncAutonomousFlight}=await import('../resource-motion.mjs');
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}}),a=b.actors.player;
 a.position=[0,0,20];a.state.verticalPosition={heightAboveGround:20,groundElevation:0,supportInstanceId:'flight',source};
 a.state.resourceCapabilities={flight:{id:'flight',source,level:2,movement:{mode:'flight',control:'autonomous',speed:180,maneuverability:'perfect'}}};
 a.state.health={...a.state.health,L:a.state.health.intact,intact:0};
 syncAutonomousFlight(a);assert.equal(a.state.physicalMotion.phase,'needs-velocity');
 const before=structuredClone(a);
 assert.throws(()=>advanceTime(a,.1,[],{map:{features:[]},drawDice:dice}),e=>e.code==='NEEDS_INPUT'&&e.field==='motion.velocity');
 assert.deepEqual(a,before);
});

test('an explicitly declared hover saves zero velocity and a lost historical velocity can be supplied only for that loss',async()=>{
 const {syncAutonomousFlight}=await import('../resource-motion.mjs');
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}});
 b.map={features:[]};b.activeId='player';const a=b.actors.player;a.state=beginTurn(a.state).state;
 a.state.resourceCapabilities={flight:{id:'flight',source,casterId:'player',level:2,movement:{mode:'flight',control:'autonomous',speed:180,maneuverability:'perfect'}}};
 b=act(b,{actorId:'player',abilityId:'move',movementSource:'flight',to:[0,0,20],flightEnd:'hover'},{playerAuthorized:true,drawDice:dice}).battle;
 assert.deepEqual(b.actors.player.state.flightKinematics.velocity,[0,0,0]);
 const flying=b.actors.player;delete flying.state.flightKinematics;
 flying.state.health={...flying.state.health,L:flying.state.health.intact,intact:0};syncAutonomousFlight(flying);
 b.ruleScene={objects:{fact:{type:'motionContext',source:'现场事实',actorIds:['player'],plans:{loss:{lossId:flying.state.physicalMotion.lossId,source:'失控时实速',position:[0,0,20],velocity:[3,0,0]}}}}};
 advanceTime(flying,1/60,[],{root:b,drawDice:dice});assert.deepEqual(flying.position,[3,0,15.1]);
 assert.equal(flying.state.physicalMotion.velocitySource,'失控时实速');
});

test('impact protection is evaluated at the actual contact time, including expiry during a longer clock advance',()=>{
 const run=(expires,parts)=>{
  const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}}),a=b.actors.player;
  b.map={features:[]};a.position=[0,0,20];a.state.sleeping=true;
  a.state.physicalMotion={phase:'ballistic',kind:'flight-loss',position:[0,0,20],velocity:[0,0,0],gravity:9.8,elapsedSeconds:0,contactSequence:0,source:'actual-fall'};
  a.state.activeResourceEffects=[{id:'protection',sourceId:'actual-defense',remainingMinutes:expires/60,effects:[{stat:'absorb',value:100}]}];
  const changes=[];for(const seconds of parts)advanceTime(a,seconds/60,changes,{root:b,drawDice:dice});
  return {a,changes};
 };
 const expired=run(1,[3]),split=run(1,[1,2]),live=run(2.5,[3]);
 assert.equal(expired.changes.find(x=>x.kind==='impact').actualDamage,6);
 assert.equal(live.changes.find(x=>x.kind==='impact').actualDamage,0);
 assert.deepEqual(expired.a.state.health,split.a.state.health);
 assert.equal(expired.a.state.recoveryClock.minutes,3/60);
});

test('flight end declarations are explicit classifier choices and cannot be attached to ground movement',async()=>{
 const {inspectCommands}=await import('./runtime.mjs');
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[50,0]}}),a=b.actors.player;
 b.map={features:[]};b.activeId='player';a.state=beginTurn(a.state).state;
 a.state.resourceCapabilities={flight:{id:'flight',source,casterId:'player',level:2,movement:{mode:'flight',control:'autonomous',speed:180,maneuverability:'perfect'}}};
 b.ruleScene={objects:{flightFact:{type:'motionContext',source:'实际运动',actorIds:['player'],plans:{east:{position:[10,0,20],velocity:[3,0,0],source:'现场速度'}}}}};
 const choices=inspectCommands(b).options.filter(x=>x.command.movementSource==='flight');
 assert.ok(choices.some(x=>x.command.flightEnd==='hover'&&x.preview.movement.velocity.every(v=>v===0)));
 const moving=choices.find(x=>x.command.flightEnd==='record');assert.ok(moving);
 const out=act(b,moving.command,{playerAuthorized:true,drawDice:dice});assert.deepEqual(out.battle.actors.player.state.flightKinematics.velocity,[3,0,0]);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'move',to:[1,0],flightEnd:'hover'},{playerAuthorized:true,drawDice:dice}),/飞行末态/);
 assert.throws(()=>act(b,{actorId:'player',abilityId:'move',to:[0,0,10],movementSource:'flight',motionPart:'east'},{playerAuthorized:true,drawDice:dice}),/record/);
});
