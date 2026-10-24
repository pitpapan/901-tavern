import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter,check,checkModifiers,combineRuleValue,spendAPAction,beginTurn,upgradeFeat,applyStatus} from './core.mjs';
import {advanceTime} from './recovery.mjs';
const actor=()=>createCharacter({attributes:{力量:3,敏捷:3,智力:3,感知:3,意志:3,风度:3},
  skills:{洞察:{level:2},社交:{level:2},白刃:{level:3,subs:{长剑:{level:1}}}},xp:20});
test('frozen targets convert subsequent freezing into cold lethal damage without another resistance',()=>{
  const s=actor();s.statuses=[{type:'冻结',points:4,source:'寒气'}];
  const out=applyStatus(s,{type:'冻结',points:2,source:'再受寒气'});
  assert.equal(out.state.health.L,2);assert.equal(out.state.statuses.length,1);
  assert.equal(out.result.convertedToDamage,true);assert.equal(out.result.damage.actualDamage,2);
  assert.equal(s.health.L,0);
});
test('freezing special resistance uses translated constitution while severity uses strength/agility',()=>{
  const s=actor();s.attributes.力量=5;s.attributes.敏捷=1;
  const out=applyStatus(s,{type:'冻结',points:8,source:'寒气',dice:Array(30).fill(8)});
  assert.equal(out.result.resistance.dp,5);assert.equal(out.result.remaining,3);assert.equal(out.result.level.severe,false);
});
test('freezing decays only in confirmed suitable temperature, with fractional time carried',()=>{
  const a={state:actor()};a.state.statuses=[{type:'冻结',points:4,source:'寒气'}];
  advanceTime(a,1);assert.equal(a.state.statuses[0].points,4);
  a.state.statusEnvironment={source:'主持确认室内温暖',freezeRecovery:true};
  advanceTime(a,.05);assert.equal(a.state.statuses[0].points,4);
  advanceTime(a,.05);assert.equal(a.state.statuses[0].points,3);
  a.state.statusEnvironment.freezeRecovery=false;advanceTime(a,1);assert.equal(a.state.statuses[0].points,3);
});
test('nausea penalizes attacks and special abilities, not unrelated observation',()=>{
  const s=actor();s.statuses=[{type:'恶心',points:2,source:'毒素'}];
  assert.equal(checkModifiers(s,{context:{specialAbility:true}}).penalty,2);
  assert.equal(checkModifiers(s,{context:{attack:true}}).penalty,2);
  assert.equal(checkModifiers(s,{context:{visual:true}}).penalty,0);
});
test('default physical size is consistently five for speed and health',()=>{
  assert.equal(actor().derived.speed,11);
});
test('ordinary checks apply wound and relevant status penalties once',()=>{
  const s=actor();s.health.intact=1;s.health.L=s.derived.hpMax-1;s.statuses=[{type:'目眩',points:2,source:'烟雾'},{type:'疲乏',points:1,source:'劳累'}];
  const r=check(s,{attribute:'感知',skill:'洞察',context:{visual:true},dice:Array(100).fill(8)});
  assert.equal(r.dp,1);assert.equal(checkModifiers(s,{attribute:'风度',skill:'社交'}).penalty,2);
});
test('abstract multiplier aggregation is distinct from real multiplication',()=>{
  assert.equal(combineRuleValue(10,{multipliers:[2,4],addends:[50]}),100);
  assert.equal(combineRuleValue(10,{multipliers:[2,4],real:true}),80);
});
test('eight AP mapping spends standard and swift atomically',()=>{
  const s=beginTurn(actor()).state,out=spendAPAction(s,8);
  assert.equal(out.result.allowed,true);assert.equal(out.state.turn.standard,0);assert.equal(out.state.turn.swift,0);
  s.turn.swift=0;s.turn.move=0;const bad=spendAPAction(s,8);assert.equal(bad.result.allowed,false);assert.deepEqual(bad.state,s);
});
test('adopted feat advancement prices next level and checks translated prerequisites',()=>{
  const s=actor();s.feats={剑术:{level:1}};
  const spec={id:'剑术',adopted:true,source:'PHB专长已采用条目',maxLevel:5,prerequisites:[{skill:'白刃',minimum:4,sub:'长剑'}]};
  const out=upgradeFeat(s,spec);assert.equal(out.result.cost,6);assert.equal(out.state.xp,14);assert.equal(out.state.feats.剑术.level,2);
  assert.throws(()=>upgradeFeat(s,{...spec,adopted:false}),/已采用/);
});
