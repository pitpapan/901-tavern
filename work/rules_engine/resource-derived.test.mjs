import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {refreshDerived} from './combat/mechanics.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
import {applyWounds} from './core.mjs';

test('profile refresh counts temporary genetic strength once and excludes attribute damage from capacity',()=>{
 const a=createOpeningRoster().player,base=a.state.derived.hpMax;
 a.state.geneticLock={active:{2:{attribute:'力量'}},hpBonus:10};
 a.state.derived.hpMax+=10;a.state.health.intact+=10;
 refreshDerived(a);assert.equal(a.state.derived.hpMax,base+10);
 a.state.attributeDamage.力量=4;refreshDerived(a);assert.equal(a.state.derived.hpMax,base+10);
});
test('resource strength expires after reload by remapping wounds, without healing or requesting an already settled ruling',()=>{
 const a=createOpeningRoster().player,base=a.state.derived.hpMax;
 a.state.activeResourceEffects=[{id:'strength',scene:true,sourceId:'test',effects:[{stat:'attribute',group:'enhancement',value:4,when:{test:'eq',left:{context:'attribute'},right:'力量'}}]}];
 refreshDerived(a);assert.equal(a.state.derived.hpMax,base+8);
 a.state=applyWounds(a.state,{B:0,L:base+6,A:0}).state;
 const restored=JSON.parse(JSON.stringify(a)),expected=structuredClone(restored.state);
 expected.derived.hpMax=base;expected.health={...expected.health,intact:base,B:0,L:0,A:0};
 expected.health=applyWounds(expected,{B:a.state.health.B,L:a.state.health.L,A:a.state.health.A}).state.health;
 expireResourceEffects(restored.state,{scene:true});
 assert.equal(restored.state.derived.hpMax,base);
 for(const key of ['intact','B','L','A'])assert.equal(restored.state.health[key],expected.health[key]);
 refreshDerived(restored);assert.equal(restored.state.derived.hpMax,base);
 assert.equal(restored.state.health.intact+restored.state.health.B+restored.state.health.L+restored.state.health.A,base);
});
