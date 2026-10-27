import test from 'node:test';
import assert from 'node:assert/strict';
import {adjustIncomingDamage} from './resource-damage-modifiers.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
const effect=(id,value,grade='C')=>({id,sourceId:'same-curse',casterId:id,grade,effects:[{stat:'incomingDamage',value,stacking:'highest-source-grade',damageAllocation:'lightest-existing'}]});
const segments=[{amount:2,severity:'A',kind:'energy',energyType:'fire'},{amount:1,severity:'L',kind:'energy',energyType:'fire'}];
test('Q16 one increment uses the lightest existing severity regardless of segment order',()=>{
 const a=createOpeningRoster().player;a.state.activeResourceEffects=[effect('one',3)];
 const out=adjustIncomingDamage(a,segments);
 assert.deepEqual(out.segments.map(s=>s.amount),[2,4]);assert.equal(out.receipts[0].severity,'L');assert.equal(out.receipts[0].added,3);
 assert.deepEqual(adjustIncomingDamage(a,[segments[0]]).segments.map(s=>s.amount),[5]);
});
test('Q19 highest same source and grade survives save while weaker instances resume after expiry',()=>{
 const a=createOpeningRoster().player;a.state.activeResourceEffects=[effect('weak',3),effect('strong',5),effect('other-grade',2,'D')];
 const before=structuredClone(a.state.activeResourceEffects);
 assert.equal(adjustIncomingDamage(a,segments).receipts[0].added,7);
 assert.deepEqual(a.state.activeResourceEffects,before);
 a.state=JSON.parse(JSON.stringify(a.state));a.state.activeResourceEffects[1].remainingRounds=0;
 assert.equal(adjustIncomingDamage(a,segments).receipts[0].added,5);
 a.state.activeResourceEffects[0].remainingRounds=0;
 assert.equal(adjustIncomingDamage(a,segments).receipts[0].added,2);
});

test('the adopted policy migrates the exact saved elemental-curse revision without changing balances or instances',async()=>{
 const {RESOURCE_DEFINITIONS}=await import('./resource-definitions.mjs');
 const id='imperial-magic:C:元素诅咒';
 const a=createOpeningRoster().player;
 a.state.activeResourceEffects=[effect('weak',3),effect('strong',5)].map(e=>({...e,sourceId:id,version:'2026-10-25.1',effects:[{stat:'incomingDamage',value:e.effects[0].value,stacking:'add'}]}));
 const saved=JSON.stringify(a.state.activeResourceEffects);
 assert.equal(adjustIncomingDamage(a,segments).receipts[0].added,5);
 assert.equal(JSON.stringify(a.state.activeResourceEffects),saved);
});
