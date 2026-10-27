import test from 'node:test';
import assert from 'node:assert/strict';
import {adjustCounter,changeWill,addCounterCondition,hasCounterCondition} from './resource-counters.mjs';
import {createCharacter,lifeStatus,recover,actionEligibility} from './core.mjs';

test('counter-bound incapacity clears on actual recovery and does not recur on a later unrelated expense',()=>{
 let s=createCharacter({attributes:{力量:3,意志:2,风度:2}});
 adjustCounter(s,'will.current',-10,{maximumPath:'will.max'});
 assert.equal(lifeStatus(s).state,'awake');
 addCounterCondition(s,{id:'test',sourceId:'test',effect:'unconscious',path:'will.current',endsAbove:0});
 assert.equal(actionEligibility(s,'standard').allowed,false);
 s=JSON.parse(JSON.stringify(s));assert.equal(hasCounterCondition(s,'unconscious'),true);
 s=recover(s,{type:'longRest'}).state;assert.equal(s.will.current,1);
 assert.equal(lifeStatus(s).state,'awake');assert.deepEqual(s.resourceConditions,{});
 changeWill(s,-1);assert.equal(lifeStatus(s).state,'awake');
});
test('counter changes never create a missing pool or exceed capacity and strict spending is atomic',()=>{
 const s=createCharacter({attributes:{力量:3,意志:2,风度:2}}),before=structuredClone(s);
 assert.throws(()=>changeWill(s,-5),/不足/);assert.deepEqual(s,before);
 assert.throws(()=>adjustCounter(s,'resources.不存在.current',1),/实际计数器/);
 assert.equal(changeWill(s,10).after,4);
 assert.throws(()=>adjustCounter(s,'__proto__.x',1),/实际计数器/);
});
