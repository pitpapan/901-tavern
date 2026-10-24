import test from 'node:test';
import assert from 'node:assert/strict';
import {ringTransfer,triggerSpiritWard} from './possessions.mjs';
import {reduceRecovery,advanceTime} from './recovery.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
const dice=()=>Array(512).fill(1);
test('phase ring preserves real items, limits weight, and uses different retrieval actions',()=>{
  const a=createOpeningRoster().player;a.state.possessions={phaseRing:{owned:true,worn:true},items:[{id:'bag',volume:.5,weightKg:2,oneHanded:true,location:'carried'},{id:'heavy',volume:8,weightKg:9,oneHanded:false,location:'carried'}]};
  const stored=ringTransfer(a,{operation:'store',itemId:'bag'});
  assert.equal(stored.actor.state.possessions.items[0].location,'phaseRing');assert.equal(a.state.possessions.items[0].location,'carried');
  assert.throws(()=>ringTransfer(stored.actor,{operation:'store',itemId:'heavy'}),/10千克/);
  assert.equal(ringTransfer(stored.actor,{operation:'retrieve',itemId:'bag'}).result.action,'free');
});
test('thunder potion requires real inventory and expires after five minutes',()=>{
  const a=createOpeningRoster().player,command={type:'medicine',medicine:'雷霆药剂'};
  assert.throws(()=>reduceRecovery(a,command,{playerAuthorized:true,drawDice:dice}),/数量未确定/);
  a.state.inventory.find(i=>i.name==='雷霆药剂').quantity=1;
  const out=reduceRecovery(a,command,{playerAuthorized:true,drawDice:dice});
  assert.equal(out.actor.state.timedEffects.thunderPotion.attack,4);assert.equal(out.actor.state.statuses.find(s=>s.type==='麻痹').points,5);
  advanceTime(out.actor,.2);assert.equal(out.actor.state.statuses.find(s=>s.type==='麻痹').points,3);
  advanceTime(out.actor,4.8);assert.equal(out.actor.state.timedEffects.thunderPotion,undefined);assert.equal(out.actor.state.statuses.length,0);
});
test('spirit ward consumes once and keeps protecting until ten minutes pass',()=>{
  const a=createOpeningRoster().player;assert.throws(()=>triggerSpiritWard(a.state),/数量未确认/);
  a.state.inventory.find(i=>i.name==='恶灵提示符').quantity=1;
  const first=triggerSpiritWard(a.state);assert.equal(first.result.consumed,1);
  assert.equal(triggerSpiritWard(first.state).result.consumed,0);
  const active={state:first.state};advanceTime(active,10);assert.equal(triggerSpiritWard(active.state).result.protected,false);
});
test('box countdown releases at zero while the two arrays stay independent',()=>{
  const root={actors:{player:{state:createOpeningRoster().player.state}},ruleScene:{objects:{
    box:{source:'世界书132414086',type:'demonBox',actorIds:['player'],sleep:3,open:false,activationAction:'move'},
    valley:{source:'UCL_20261015_031',type:'arrays',actorIds:['player'],boundary:[0,0,10,10],arrays:{
      physical:{installed:true,circuitIntact:true,nodeIntact:true,powerReady:true,operators:['player'],active:false},
      spatial:{installed:false,circuitIntact:false,nodeIntact:true,powerReady:true,operators:['player'],active:false}}}}}};
  let out=reduceRuleAction(root,{kind:'rule',action:'mechanism',actorId:'player',objectId:'box',operation:'open'});
  out=reduceRuleAction(out,{kind:'rule',action:'time',actorId:'player',minutes:.3,sourceQuote:'经过三轮'});
  assert.equal(out.ruleScene.objects.box.released,true);
  out=reduceRuleAction(out,{kind:'rule',action:'mechanism',actorId:'player',objectId:'valley',part:'physical',operation:'activate'});
  assert.equal(out.ruleScene.objects.valley.arrays.physical.active,true);assert.equal(out.ruleScene.objects.valley.arrays.spatial.active,false);
  assert.throws(()=>reduceRuleAction(out,{kind:'rule',action:'mechanism',actorId:'player',objectId:'valley',part:'spatial',operation:'activate'}),/启动条件/);
});
