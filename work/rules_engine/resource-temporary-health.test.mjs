import {resolveDamage} from './core.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerTemporaryHealth,syncTemporaryHealth} from './resource-temporary-health.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {damageEvent} from './combat/engine.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';

test('a sourced temporary pool is consumed once, survives reload, and does not refill on refresh',()=>{
 const a=createOpeningRoster().player;
 registerTemporaryHealth(a.state,{id:'shield',sourceId:'test',remaining:6,capacity:6,scene:true});
 assert.equal(damageEvent(a,[{amount:4,severity:'L',kind:'energy',energyType:'force'}],false,{damage:[]}),0);
 const restored=JSON.parse(JSON.stringify(a));syncTemporaryHealth(restored.state);
 assert.equal(restored.state.health.temp,2);
 assert.equal(restored.state.temporaryHealthPools.shield.remaining,2);
 expireResourceEffects(restored.state,{scene:true});assert.equal(restored.state.health.temp,0);
 assert.equal(a.state.health.temp,2);
});
test('one mixed damage event spends temporary HP on A before L and B, after protection',()=>{
 const a=createOpeningRoster().player,before=structuredClone(a.state.health);
 registerTemporaryHealth(a.state,{id:'shield',sourceId:'test',remaining:3,capacity:3});
 const result={damage:[]};
 damageEvent(a,[{amount:3,severity:'L',kind:'energy',energyType:'force'},{amount:3,severity:'A',kind:'energy',energyType:'fire'}],false,result);
 assert.equal(a.state.health.A,before.A);assert.equal(a.state.health.L,before.L+3);
 assert.equal(a.state.health.temp,0);
});
test('unavoidable self injury cannot be paid with temporary HP',()=>{
 const a=createOpeningRoster().player;
 registerTemporaryHealth(a.state,{id:'shield',sourceId:'test',remaining:5,capacity:5});
 damageEvent(a,[{amount:2,severity:'L',kind:'energy',energyType:'force',unavoidable:true}],false,{damage:[]});
 assert.equal(a.state.health.temp,5);assert.equal(a.state.health.L,2);
});

test('unavoidable wounds preserve sleep, status, concentration and the next damage-conversion declaration',()=>{
 const a=createOpeningRoster().player;
 a.state.sleeping={source:'实际睡眠'};a.state.statuses=[{type:'欲眠',points:2,source:'既有状态'}];
 a.state.resourceChannels={ongoing:{sourceId:'isolated-channel'}};
 a.state.huaJin={current:0,acceptNext:1};
 registerTemporaryHealth(a.state,{id:'shield',sourceId:'test',remaining:5,capacity:5});
 const result={damage:[]};
 assert.equal(damageEvent(a,[{amount:2,severity:'L',kind:'physical',unavoidable:true}],true,result),2);
 assert.equal(a.state.health.L,2);assert.equal(a.state.health.temp,5);
 assert.deepEqual(a.state.sleeping,{source:'实际睡眠'});
 assert.equal(a.state.statuses[0].points,2);assert.equal(a.state.resourceConcentration,undefined);
 assert.equal(a.state.huaJin.acceptNext,1);assert.equal(a.used.damageConversion,undefined);
 assert.equal(result.damage[0].unavoidable,true);
});

test('adopted recipient replacement removes the old source and dependents without a backup shield',()=>{
 const a=createOpeningRoster().player;
 registerTemporaryHealth(a.state,{id:'old',sourceId:'old-resource',remaining:5});
 a.state.activeResourceEffects=[{id:'linked',temporaryHealthId:'old',effects:[{stat:'hardness',value:2}]}];
 const next={id:'new',sourceId:'new-resource',remaining:3};
 assert.throws(()=>registerTemporaryHealth(a.state,next),{code:'NEEDS_INPUT'});
 const choice={source:'user choice',chosenBy:'player',existingId:'old',decision:'keep'};
 registerTemporaryHealth(a.state,next,{targetId:'player',choice});assert.equal(a.state.health.temp,5);
 registerTemporaryHealth(a.state,next,{targetId:'player',choice:{...choice,decision:'replace'}});
 assert.equal(a.state.health.temp,3);assert.equal(a.state.temporaryHealthPools.old,undefined);assert.deepEqual(a.state.activeResourceEffects,[]);
 const b=JSON.parse(JSON.stringify(a));damageEvent(b,[{amount:4,severity:'L',kind:'energy',energyType:'force'}],false,{damage:[]});
 assert.equal(b.state.health.temp,0);assert.equal(b.state.health.L,1);
});

test('a ranged-attack-only pool uses trusted event facts and survives melee, fixed damage and a reload',()=>{
 const a=createOpeningRoster().player;
 registerTemporaryHealth(a.state,{id:'mirror',sourceId:'actual-mirror',remaining:10,capacity:10,damageFilter:{all:[{test:'eq',left:{context:'attack'},right:true},{test:'eq',left:{context:'ranged'},right:true}]}});
 const hit={amount:2,severity:'L',kind:'energy',energyType:'force'};
 damageEvent(a,[hit],false,{damage:[]},undefined,{damageNature:'attack',ranged:false});assert.equal(a.state.health.temp,10);
 damageEvent(a,[hit],false,{damage:[]},undefined,{damageNature:'fixed',ranged:true});assert.equal(a.state.health.temp,10);
 a.state=JSON.parse(JSON.stringify(a.state));
 assert.equal(damageEvent(a,[hit],false,{damage:[]},undefined,{damageNature:'attack',ranged:true}),0);
 assert.equal(a.state.health.temp,8);
});
test('damage exhaustion identifies its actual temporary pool once, unlike replacement, expiry or unavoidable damage',()=>{
 const s=createOpeningRoster().player.state;
 registerTemporaryHealth(s,{id:'actual-pool',sourceId:'shield-source',casterId:'owner',version:'test/1',grade:'C',capacity:2,remaining:2,scene:true});
 const hit={amount:1,severity:'L',kind:'physical'};
 let out=resolveDamage(s,hit);assert.equal(out.result.temporaryHealthDepleted,undefined);
 out=resolveDamage(out.state,hit);assert.deepEqual(out.result.temporaryHealthDepleted,{instanceId:'actual-pool',sourceId:'shield-source',casterId:'owner',version:'test/1',grade:'C',capacity:2,reason:'damage',phase:'temporaryHP'});
 assert.equal(resolveDamage(out.state,hit).result.temporaryHealthDepleted,undefined);
 registerTemporaryHealth(s,{id:'new-pool',sourceId:'other-shield',casterId:'other',grade:'D',capacity:4,remaining:4,scene:true},{targetId:'owner',choice:{existingId:'actual-pool',decision:'replace',chosenBy:'owner',source:'actual choice'}});
 assert.equal(resolveDamage(s,{...hit,amount:20,unavoidable:true}).result.temporaryHealthDepleted,undefined);assert.equal(s.temporaryHealthPools['new-pool'].remaining,4);
 expireResourceEffects(s,{scene:true});assert.equal(resolveDamage(s,hit).result.temporaryHealthDepleted,undefined);
});

test('an exhausted automatic pool keeps its actual source in the absorption receipt after removal',()=>{
 const a=createOpeningRoster().player;
 registerTemporaryHealth(a.state,{id:'automatic-shield',sourceId:'armor',casterId:'player',remaining:2,capacity:2,onDepleted:{reference:{resourceId:'nova'}}});
 const out=resolveDamage(a.state,{amount:2,severity:'L',kind:'energy',energyType:'force'});
 assert.equal(out.result.trace.find(x=>x.step==='temporaryHP').sourceId,'automatic-shield');assert.equal(out.state.temporaryHealthPools['automatic-shield'],undefined);
});
