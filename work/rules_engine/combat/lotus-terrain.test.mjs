import test from 'node:test';
import assert from 'node:assert/strict';
import {beginTurn} from '../core.mjs';
import {createDuel,makeLotus} from './catalog.mjs';
import {act} from './engine.mjs';
import {normalizeMap,contains,measurePath,mapView} from './map.mjs';
import {inspectCommands,potentialTargets,createCombatRuntime} from './runtime.mjs';
import {resolveStep} from './transitions.mjs';

const dice=()=>Array(400).fill(1);
const wall={id:'wall',kind:'obstacle',rect:[-.5,1,1,1],blocksSight:true};
function summoning(features=[wall]) {
  const b=createDuel();b.actors.jiang.position=[8,0];
  b.map=normalizeMap({bounds:[-10,-10,30,30],features},b);return b;
}
function roaring(feature={id:'wall',kind:'obstacle',rect:[4,-1,1,2],blocksSight:false}) {
  const b=createDuel();b.actors.huang.position=[2,.5];b.actors.jiang.position=[8,0];
  b.actors.lotus=makeLotus(b.actors.huang);b.actors.lotus.position=[0,0];
  b.actors.lotus.state=beginTurn(b.actors.lotus.state).state;
  b.activeId='lotus';b.order=['lotus','huang','jiang'];
  b.map=normalizeMap({bounds:[-10,-10,30,30],features:[feature]},b);return b;
}
const roar={actorId:'lotus',abilityId:'roar',targetId:'jiang'};

test('summon avoids the blocked default point and records a new visible actor without moving the owner',()=>{
  const b=summoning(),before=structuredClone(b);
  const out=resolveStep(b,{actorId:'huang',abilityId:'summon'});
  const p=out.battle.actors.lotus.position;
  assert.equal(contains(p,wall),false);
  assert.equal(measurePath(b.map,[0,0],p).valid,true);
  assert.ok(Math.hypot(...p)<=1.5+1e-8);
  assert.deepEqual(out.battle.actors.huang.position,[0,0]);
  assert.equal(out.battle.actors.huang.state.resources.灵力.current,3);
  assert.equal(out.battle.actors.huang.state.turn.standard,0);
  assert.deepEqual(out.battle.knowledge.huang.lotus.lastSeen.position,p);
  assert.deepEqual(mapView(out.battle,'huang').actors.find(a=>a.id==='lotus').position,p);
  assert.deepEqual(b,before);
});

test('explicit summon points respect obstacles, adjacency and closed scene boundaries',()=>{
  const b=summoning();
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'summon',to:[0,1.5]}),/召唤落点/);
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'summon',to:[4,0]}),/相邻/);
  b.map.bounded=true;b.map.bounds=[-1,-1,12,8];
  assert.throws(()=>act(b,{actorId:'huang',abilityId:'summon',to:[-1.5,0]}),/召唤落点/);
  const out=act(b,{actorId:'huang',abilityId:'summon',to:[1,0]});
  assert.deepEqual(out.battle.actors.lotus.position,[1,0]);
});

test('summon with no adjacent space is unavailable and leaves MVU, actions and energy unchanged',async()=>{
  const b=summoning([
    {id:'n',kind:'obstacle',rect:[-2,-2,4,1.6]},
    {id:'s',kind:'obstacle',rect:[-2,.4,4,1.6]},
    {id:'w',kind:'obstacle',rect:[-2,-.4,1.6,.8]},
    {id:'e',kind:'obstacle',rect:[.4,-.4,1.6,.8]},
  ]);
  let data={stat_data:{}};
  const runtime=createCombatRuntime({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},
    getAnchor:()=>({chatId:'lotus-terrain',messageId:0,swipeId:0}),expectedChatId:'lotus-terrain',drawDice:dice});
  await runtime.initialize(b);const before=structuredClone(data);
  assert.ok(!inspectCommands(b).options.some(o=>o.command.abilityId==='summon'));
  await assert.rejects(runtime.dispatch({operationId:'blocked-summon',expectedRevision:runtime.read().revision,
    command:{actorId:'huang',abilityId:'summon'}}),/召唤落点/);
  assert.deepEqual(data,before);
});

test('roar geometry excludes targets behind solid terrain from damage, previews and reaction queues',()=>{
  const b=roaring();b.reactionWindows=true;
  assert.deepEqual(potentialTargets(b,roar),['huang']);
  const preview=inspectCommands(b).options.find(o=>o.command.abilityId==='roar'&&o.command.targetId==='jiang');
  assert.deepEqual(preview.preview.affected,['huang']);
  assert.deepEqual(preview.preview.friendlyFire,['huang']);
  let out=resolveStep(b,roar,{drawDice:dice});
  assert.deepEqual(out.battle.pending.queue,['huang']);
  assert.equal(out.battle.actors.lotus.used.roar,undefined);
  out=resolveStep(out.battle,{actorId:'huang',abilityId:'react',choice:'decline'},{drawDice:dice});
  assert.equal(out.battle.pending,undefined);
  assert.equal(out.battle.actors.jiang.state.health.intact,b.actors.jiang.state.health.intact);
  assert.ok(out.battle.actors.huang.state.health.intact<b.actors.huang.state.health.intact);
  assert.deepEqual(out.result.saves.map(s=>s.targetId),['huang']);
  assert.equal(out.battle.actors.lotus.used.roar,true);
  assert.equal(out.battle.actors.lotus.state.turn.standard,0);
  assert.equal(out.battle.actors.lotus.state.turn.move,0);
  assert.equal(out.battle.actors.lotus.state.turn.swift,0);
});

test('roar respects polygon walls and closed doors, while open doors and sight-only forest pass its effect',()=>{
  for(const feature of [
    {id:'wall',kind:'obstacle',points:[[4,-1],[5,-1],[5,1],[4,1]]},
    {id:'door',kind:'door',rect:[4,-1,1,2],open:false},
  ]) {
    const b=roaring(feature),out=act(b,roar,{drawDice:dice});
    assert.equal(out.battle.actors.jiang.state.health.intact,b.actors.jiang.state.health.intact);
  }
  for(const feature of [
    {id:'door',kind:'door',rect:[4,-1,1,2],open:true,blocksSight:true},
    {id:'forest',kind:'difficult',rect:[4,-1,1,2],blocksSight:true},
  ]) {
    const b=roaring(feature),out=act(b,roar,{drawDice:dice});
    assert.ok(out.battle.actors.jiang.state.health.intact<b.actors.jiang.state.health.intact);
  }
});

test('summon and terrain-blocked roar persist through MVU readback and duplicate dispatch only once',async()=>{
  let data={stat_data:{}};
  const deps={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},
    getAnchor:()=>({chatId:'lotus-save',messageId:0,swipeId:0}),expectedChatId:'lotus-save',drawDice:dice};
  let runtime=createCombatRuntime(deps);
  await runtime.initialize(summoning());
  const summon={operationId:'summon',expectedRevision:runtime.read().revision,command:{actorId:'huang',abilityId:'summon'}};
  await runtime.dispatch(summon);const savedSummon=structuredClone(data);
  runtime=createCombatRuntime(deps);
  assert.equal((await runtime.dispatch(summon)).status,'already_applied');
  assert.deepEqual(data,savedSummon);
  assert.deepEqual(runtime.read().battle.actors.lotus.state,data.stat_data['901_rules_poc'].actors.lotus.state);
  data={stat_data:{}};runtime=createCombatRuntime(deps);
  await runtime.initialize(roaring());
  const request={operationId:'roar',expectedRevision:runtime.read().revision,command:roar};
  const before=runtime.read().battle.actors.jiang.state.health;
  await runtime.dispatch(request);const after=structuredClone(data);
  assert.deepEqual(runtime.read().battle.actors.jiang.state.health,before);
  runtime=createCombatRuntime(deps);
  assert.equal((await runtime.dispatch(request)).status,'already_applied');
  assert.deepEqual(data,after);
});
