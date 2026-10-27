import test from 'node:test';
import assert from 'node:assert/strict';
import {beginResourceDescent,advanceResourceDescent} from './resource-descent.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
import {endTimedResource,timedResourceInstances} from './resource-instances.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
const cap={id:'flight',source:'flight-test',casterId:'caster',grade:'C',level:2,remainingMinutes:1,onEnd:{kind:'descent',rounds:2,metersPerRound:20,intervalMinutes:.1}};
function state(height){const s=createOpeningRoster().player.state;s.verticalPosition={heightAboveGround:height,source:'实际高度',supportInstanceId:'flight'};s.resourceCapabilities={flight:structuredClone(cap)};return s;}
test('descent waits a full six seconds, persists the fractional interval and emits one residual fall',()=>{
 let s=state(50);beginResourceDescent(s,'flight',cap,{reason:'dispel'});
 assert.equal(s.verticalPosition.heightAboveGround,50);
 advanceResourceDescent(s,.04);s=JSON.parse(JSON.stringify(s));advanceResourceDescent(s,.05);
 assert.equal(s.verticalPosition.heightAboveGround,50);
 advanceResourceDescent(s,.01);assert.equal(s.verticalPosition.heightAboveGround,30);
 advanceResourceDescent(s,.1);assert.equal(s.pendingFall.height,10);assert.equal(s.resourceDescent,undefined);
 advanceResourceDescent(s,1);assert.equal(s.pendingFall.height,10);
});
test('expiry applies only elapsed time after termination, and dispel starts the same countdown',()=>{
 const s=state(50);expireResourceEffects(s,{minutes:1.05,rounds:10.5});
 assert.equal(s.verticalPosition.heightAboveGround,50);assert.ok(Math.abs(s.resourceDescent.elapsedMinutes-.05)<1e-8);
 expireResourceEffects(s,{minutes:.05,rounds:.5});assert.equal(s.verticalPosition.heightAboveGround,30);
 const root={actors:{target:{state:state(15)}}};
 endTimedResource(root,'target',timedResourceInstances(root,'target')[0]);
 assert.equal(root.actors.target.state.verticalPosition.heightAboveGround,15);
 expireResourceEffects(root.actors.target.state,{minutes:.1,rounds:1});
 assert.equal(root.actors.target.state.verticalPosition.heightAboveGround,0);assert.equal(root.actors.target.state.pendingFall,undefined);
 assert.equal(root.actors.target.state.resourceDescent,undefined);
});
test('unknown actual height is a sourced scene fact, never an automatic safe landing',()=>{
 const s=state(40);delete s.verticalPosition;const before=structuredClone(s);
 assert.throws(()=>expireResourceEffects(s,{minutes:1,rounds:10}),e=>e.code==='NEEDS_INPUT'&&e.field==='verticalPosition');
 assert.deepEqual(s,before);
});

test('time advancement resolves the residual physical fall once, bypasses DR and retains physical absorption',async()=>{
 const {advanceTime}=await import('./recovery.mjs');
 const {actionEligibility}=await import('./core.mjs');
 const actor=createOpeningRoster().player;actor.state=state(49);actor.position=[0,0,49];actor.state.verticalPosition.groundElevation=0;
 actor.state.flightKinematics={position:[0,0,49],velocity:[0,0,0],supportInstanceId:'flight',source:'实际悬停'};
 actor.state.activeResourceEffects=[{sourceId:'actual-defense',effects:[{stat:'dr',value:100},{stat:'absorb',value:1,when:{test:'eq',left:{context:'kind'},right:'physical'}}]}];
 actor.state.attributes.敏捷=1;actor.state.skills.运动={level:0,subs:{}};
 actor.combatProfile.equipment.armor={defense:0,dr:100};
 beginResourceDescent(actor.state,'flight',cap,{reason:'dispel'});delete actor.state.resourceCapabilities.flight;
 let draws=0;const changes=[];
 const map={features:[]};
 advanceTime(actor,.2,changes,{map,combatTick:true,drawDice:()=>{draws++;return Array(200).fill(1);}});
 assert.equal(draws,0);assert.equal(actor.state.verticalPosition.heightAboveGround,9);
 advanceTime(actor,2/60,changes,{map,combatTick:true,drawDice:()=>{draws++;return Array(200).fill(1);}});
 assert.equal(draws,1);assert.equal(actor.state.health.L,2); // 49 - 40 = 9m -> 3L, absorption 1
 assert.equal(actor.state.pendingFall,undefined);assert.equal(actor.state.verticalPosition.heightAboveGround,0);
 assert.equal(changes.find(x=>x.kind==='impact').rawDamage,3);
 advanceTime(actor,.1,[],{combatTick:true,drawDice:()=>{throw Error('must not reroll completed fall');}});
 actor.state.pendingFall={height:9,source:'actual'};
 assert.equal(actionEligibility(actor.state,'free').allowed,false);
});

test('an unconscious falling recipient takes the actual fall without an active athletics check',async()=>{
 const {resolvePendingFall}=await import('./resource-falling.mjs');
 const actor=createOpeningRoster().player;actor.state=state(9);
 actor.state.health.intact=0;actor.state.health.L=actor.state.derived.hpMax;
 actor.state.pendingFall={height:9,sourceId:'expired-flight'};
 const result=resolvePendingFall(actor,{drawDice:()=>{throw Error('unconscious actor cannot choose an active check');}});
 assert.equal(result.roll,null);assert.equal(result.rawDamage,3);assert.equal(actor.state.pendingFall,undefined);
});

test('Q15 starts a continuous residual fall with zero vertical speed and sourced horizontal inertia',async()=>{
 const {advanceTime}=await import('./recovery.mjs');
 const actor=createOpeningRoster().player;actor.position=[0,0,49];actor.state=state(49);
 actor.state.verticalPosition.groundElevation=0;
 actor.state.flightKinematics={position:[0,0,49],velocity:[3,0,12],supportInstanceId:'flight',source:'实际向东3m/s'};
 beginResourceDescent(actor.state,'flight',cap,{reason:'dispel'});delete actor.state.resourceCapabilities.flight;
 const map={features:[]},changes=[];
 advanceTime(actor,.2,changes,{map,drawDice:()=>Array(200).fill(1)});
 assert.deepEqual(actor.position,[0,0,9]);assert.deepEqual(actor.state.physicalMotion.velocity,[3,0,0]);
 assert.equal(changes.some(x=>x.kind==='impact'),false);
 const saved=JSON.parse(JSON.stringify(actor));advanceTime(saved,1/60,changes,{map,drawDice:()=>Array(200).fill(1)});
 assert.deepEqual(saved.position,[3,0,4.1]);assert.equal(saved.state.physicalMotion.contactSequence,0);
 advanceTime(saved,1/60,changes,{map,drawDice:()=>Array(200).fill(1)});
 assert.equal(saved.state.physicalMotion.phase,'grounded');assert.equal(changes.filter(x=>x.kind==='impact').length,1);
 assert.ok(Math.abs(saved.position[0]-3*Math.sqrt(18/9.8))<1e-7);
});

test('Q15 never borrows a velocity sample from a different actual descent position',async()=>{
 const {advanceTime}=await import('./recovery.mjs');
 const actor=createOpeningRoster().player;actor.position=[5,0,49];actor.state=state(49);actor.state.verticalPosition.groundElevation=0;
 actor.state.flightKinematics={position:[0,0,49],velocity:[9,0,0],supportInstanceId:'flight',source:'earlier position'};
 beginResourceDescent(actor.state,'flight',cap);delete actor.state.resourceCapabilities.flight;
 const root={actors:{player:actor},map:{features:[]}};
 advanceTime(actor,.2,[],{root,drawDice:()=>{throw Error('not grounded');}});
 assert.deepEqual(actor.position,[5,0,9]);assert.equal(actor.state.physicalMotion.phase,'needs-velocity');
 assert.equal(actor.state.physicalMotion.velocity,undefined);
 assert.throws(()=>advanceTime(actor,1/60,[],{root,drawDice:()=>{throw Error('not grounded');}}),e=>e.code==='NEEDS_INPUT'&&e.field==='motion.velocity');
});
