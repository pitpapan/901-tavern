import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from '../combat/opening.mjs';
import {act} from '../combat/engine.mjs';
import {normalizeMap} from '../combat/map.mjs';
import {combatActionReport} from '../combat/presentation.mjs';
import {validateStep} from './narrative.mjs';
import {beginTurn} from '../core.mjs';

function fresh() {
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[10,0]},teams:{player:'玩家',huang:'陪练'}});
 b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;
 b.map=normalizeMap({title:'隔离验证',bounds:[-20,-20,50,50],features:[]},b);
 return b;
}
const opts={drawDice:()=>Array(1024).fill(8),playerAuthorized:true};

test('a cost attributed to the first action does not constrain the second',()=>{
 const text='用移动动作后退3米，然后快步1.5米';
 const steps=[{quote:'用移动动作后退3米',command:{abilityId:'move',to:[-3,0]},cost:{actions:{move:1}}},
  {quote:'快步1.5米',command:{abilityId:'step',to:[-4.5,0]},cost:{actions:{move:1}}}];
 let b=fresh();b=act(b,validateStep(steps[0],text,b,{steps}),opts).battle;
 const out=act(b,validateStep(steps[1],text,b,{steps}),opts);
 assert.deepEqual(out.result.receipt.actions,{standard:1});
 assert.deepEqual(out.battle.actors.player.position,[-4.5,0]);
});

test('ambiguous multi-action cost attribution is rejected before execution',()=>{
 const text='后退3米，然后快步1.5米，只支付一个移动动作';
 const steps=[{quote:'后退3米',command:{abilityId:'move',to:[-3,0]}},
  {quote:'快步1.5米',command:{abilityId:'step',to:[-4.5,0]},cost:{actions:{move:1}}}];
 assert.throws(()=>validateStep(steps[0],text,fresh(),{steps}),/费用|消耗/);
});

test('an exact cost quote can bind a following cost clause to its action',()=>{
 const text='后退3米，用移动动作，然后快步1.5米';
 const steps=[{quote:'后退3米',actionCostQuote:'后退3米，用移动动作',command:{abilityId:'move',to:[-3,0]},cost:{actions:{move:1}}},
  {quote:'快步1.5米',command:{abilityId:'step',to:[-4.5,0]},cost:{actions:{move:1}}}];
 let b=fresh();b=act(b,validateStep(steps[0],text,b,{steps}),opts).battle;
 assert.deepEqual(act(b,validateStep(steps[1],text,b,{steps}),opts).result.receipt.actions,{standard:1});
 steps[0].actionCostQuote='后退3米，用迅捷动作';
 assert.throws(()=>validateStep(steps[0],text,fresh(),{steps}),/费用/);
});

test('model-estimated movement costs cannot block a declared move then step paid from standard',()=>{
 const b=act(fresh(),{actorId:'player',abilityId:'move',to:[-3,0]},opts).battle;
 const step={quote:'继续沿同方向五尺快步1.5米',command:{abilityId:'step',to:[-4.5,0]},cost:{actions:{move:1}}};
 const c=validateStep(step,'御临风向后移动3米，然后继续沿同方向五尺快步1.5米；不攻击。',b);
 const out=act(b,c,opts);
 assert.deepEqual(out.battle.actors.player.position,[-4.5,0]);
 assert.deepEqual(out.result.receipt.actions,{standard:1});
 assert.equal(out.battle.actors.player.state.turn.move,0);
 assert.equal(out.battle.actors.player.state.turn.standard,0);
});

test('an actual player action-cost claim still rejects a mismatch before payment',()=>{
 const b=act(fresh(),{actorId:'player',abilityId:'move',to:[-3,0]},opts).battle;
 const before=structuredClone(b);
 assert.throws(()=>validateStep({quote:'快步1.5米',command:{abilityId:'step',to:[-4.5,0]},cost:{actions:{move:1}}},
  '快步1.5米，只支付一个移动动作，不使用标准动作。',b),/实际需要标准/);
 assert.deepEqual(b,before);
});

test('destroyed terrain reports its structural outcome instead of absence of creature wounds',()=>{
 const b=fresh();b.map.features=[{id:'box',name:'木箱',kind:'obstacle',rect:[0,.5,1,.2],durability:{current:4,max:4,hardness:0}}];
 const command={actorId:'player',abilityId:'destroy',featureId:'box'};
 const out=act(b,command,opts);
 assert.equal(out.result.terrain.destroyed,true);assert.ok(out.result.terrain.structuralDamage>0);
 assert.deepEqual(out.result.damage,[]);
 const report=combatActionReport({battle:out.battle,actors:out.battle.actors,revision:1,
  operations:{test:{signature:JSON.stringify(command),summary:{revision:1,result:out.result}}}});
 assert.ok(report.includes(out.result.terrain.outcome));
 assert.doesNotMatch(report,/未造成实际伤害|未命中/);
});
