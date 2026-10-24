import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from './combat/opening.mjs';
import {createCombatRuntime,inspectCommands} from './combat/runtime.mjs';
import {publicScene,ownImpactReport} from './combat/presentation.mjs';
import {beginTurn} from './core.mjs';
import {reduceRecovery} from './recovery.mjs';

const player=()=>createOpeningRoster().player;
const apply=(actor,command,options={})=>reduceRecovery(actor,command,{playerAuthorized:true,...options});
const dose=(medicine,extra={})=>({type:'medicine',medicine,...extra});
const rest=(kind,minutes,extra={})=>({type:'rest',rest:kind,minutes,...extra});
const sequence=(...steps)=>({type:'sequence',steps});
function wounds(a,{B=0,L=0,A=0}) {Object.assign(a.state.health,{B,L,A,intact:12-B-L-A});return a;}
test('natural recovery consumes natural-only locks, while aggravated recovery waits for the A interval',()=>{
 let a=wounds(player(),{L:2});a.recoveryLocks=[{severity:'L',count:1,recovery:'naturalOnly'},{severity:'L',count:1,recovery:'aggravated'}];
 for(let i=0;i<2;i++)a=apply(a,rest('long',1440)).actor;
 assert.equal(a.state.health.L,1);assert.equal(a.recoveryLocks[0].recovery,'aggravated');
 for(let i=0;i<5;i++)a=apply(a,rest('long',1440)).actor;
 assert.equal(a.state.health.L,0);assert.deepEqual(a.recoveryLocks,[]);
});

test('ordered recovery folds medicine then rest and reverse order retains the delayed dose',()=>{
  const a=wounds(player(),{A:3,L:6,B:1});a.state.resources.流风.current=10;
  const out=apply(a,sequence(dose('培元丹'),rest('long',480)));
  assert.deepEqual(out.result.steps.map(s=>s.type),['medicine','rest']);
  assert.deepEqual([out.actor.state.health.intact,out.actor.state.health.A,out.actor.state.health.L,out.actor.state.health.B],[8,0,4,0]);
  assert.equal(out.actor.state.inventory.find(i=>i.name==='培元丹').quantity,2);
  assert.equal(out.actor.state.pendingRecoveryEffects.length,0);
  assert.equal(out.actor.state.recoveryClock.minutes,480);
  assert.equal(out.actor.state.resources.流风.current,22);
  const reverse=apply(a,sequence(rest('long',480),dose('培元丹')));
  assert.equal(reverse.actor.state.health.A,3);assert.equal(reverse.actor.state.pendingRecoveryEffects.length,1);
  assert.throws(()=>apply(a,sequence(dose('培元丹'),rest('long',480)),{combat:true}),/战斗/);
});

test('unresolved later medicine choice rejects the whole sequence before drawing or mutating',()=>{
  const a=player(),before=structuredClone(a);let draws=0;
  assert.throws(()=>apply(a,sequence({type:'meditate',minutes:15},dose('药C')),
    {drawDice:()=>{draws++;return Array(128).fill(8);}}),/选择/);
  assert.deepEqual(a,before);assert.equal(draws,0);
});

test('medicine needs player declaration, known stock, and preserves input on rejection',()=>{
  const a=player(),before=structuredClone(a);
  assert.throws(()=>reduceRecovery(a,dose('药B')),/玩家/);
  assert.throws(()=>apply(a,dose('雷霆药剂')),/数量/);
  a.state.inventory.find(x=>x.name==='药B').quantity=0;
  assert.throws(()=>apply(a,dose('药B')),/不足/);
  assert.deepEqual(before.state.health,a.state.health);
});
test('B heals up to five L, debits one, and never heals A',()=>{
  const a=wounds(player(),{L:6,A:2}),before=structuredClone(a);
  const {actor,result}=apply(a,dose('药B'));
  assert.deepEqual([actor.state.health.intact,actor.state.health.L,actor.state.health.A],[9,1,2]);
  assert.equal(actor.state.inventory.find(x=>x.name==='药B').quantity,2);
  assert.equal(result.changes.find(c=>c.consumed).remaining,2);
  assert.equal(result.kind,'recovery');assert.deepEqual(a,before);
});
test('snow lotus restores physical long-rest recoverable flow by three; oriental bonus needs metadata',()=>{
  const a=player();a.state.resources.流风.current=10;
  const b=apply(a,dose('雪莲子',{resource:'流风'})).actor;
  assert.equal(b.state.resources.流风.current,13);
  a.parameters.flowOriental=true;
  assert.equal(apply(a,dose('雪莲子',{resource:'流风'})).actor.state.resources.流风.current,14);
  a.state.resources.灵力={current:0,max:5};
  assert.throws(()=>apply(a,dose('雪莲子',{resource:'灵力'})),/生理|恢复规则/);
});
test('A and C remain pending until their declared rest and survive serialization',()=>{
  let a=wounds(player(),{A:4,L:7});
  a=apply(a,dose('药A')).actor;a=apply(a,dose('药C',{choice:'heal'})).actor;
  assert.deepEqual([a.state.health.A,a.state.health.L],[4,7]);
  a=JSON.parse(JSON.stringify(a));a=apply(a,rest('short',15)).actor;
  assert.deepEqual([a.state.health.A,a.state.health.L],[4,0]);
  assert.deepEqual(a.state.pendingRecoveryEffects.map(x=>x.medicine),['药A']);
  a=apply(a,rest('long',480)).actor;
  assert.equal(a.state.health.A,0);assert.equal(a.state.pendingRecoveryEffects.length,0);
});
test('C targets declared physical status and excludes mental and freezing effects',()=>{
  let a=player();a.state.statuses=[{type:'麻痹',source:'测试',points:5},{type:'恐惧',source:'测试',points:3},{type:'冻结',source:'测试',points:2}];
  assert.throws(()=>apply(a,dose('药C',{choice:'status',statusIndex:1})),/肉体/);
  assert.throws(()=>apply(a,dose('药C',{choice:'status',statusIndex:2})),/肉体/);
  a=apply(a,dose('药C',{choice:'status',statusIndex:0})).actor;
  a=apply(a,rest('short',15)).actor;
  assert.deepEqual(a.state.statuses.map(s=>s.type),['恐惧','冻结']);
  let high=player();high.state.statuses=[{type:'疲乏',source:'高',points:8}];
  high=apply(high,dose('药C',{choice:'status',statusIndex:0})).actor;
  let requested;
  high=apply(high,rest('short',15),{drawDice:meta=>{requested=meta;return Array(128).fill(8);}}).actor;
  assert.equal(requested.dp,14);assert.equal(high.state.statuses.length,0);
});
test('rest validates completion, restores B by elapsed intervals and longrest flow/will only as sourced',()=>{
  let a=wounds(player(),{B:3,L:3,A:2});a.state.will.current=0;a.state.resources.流风.current=0;
  a.state.attributeDamage.力量=2;
  assert.throws(()=>apply(a,rest('short',14)),/15/);
  assert.throws(()=>apply(a,rest('long',479)),/480|8/);
  a=apply(a,rest('long',480,{attribute:'力量'})).actor;
  assert.deepEqual([a.state.health.B,a.state.health.L,a.state.health.A],[0,3,2]);
  assert.equal(a.state.will.current,1);assert.equal(a.state.resources.流风.current,22);
  assert.equal(a.state.attributeDamage.力量,1);
});
test('declared rest advances finite buffs/cooldowns and only completed day thresholds heal L/A',()=>{
  let a=wounds(player(),{L:4,A:3});a.buffs={flow:2,tengzhuan:true};
  a.durationCarry={flow:{value:2,remainingRounds:8},tengzhuan:{value:true,remainingRounds:10}};
  a.cooldownCarry={thunder:{remainingRounds:1}};
  a=apply(a,rest('long',1440)).actor;
  assert.deepEqual(a.durationCarry,{});assert.deepEqual(a.cooldownCarry,{});
  assert.equal(a.buffs.flow,undefined);assert.deepEqual([a.state.health.L,a.state.health.A],[4,3]);
  a=apply(a,rest('long',1440)).actor;assert.equal(a.state.health.L,3);
  for(let i=0;i<5;i++)a=apply(a,rest('long',1440)).actor;
  assert.equal(a.state.health.A,2);
});
test('combat medicine spends source action cost; unavailable action does not debit',()=>{
  const a=wounds(player(),{L:6});a.state=beginTurn(a.state).state;
  const b=apply(a,dose('药B'),{combat:true}).actor;
  assert.equal(b.state.turn.move,0);assert.equal(b.state.turn.standard,1);
  const c=apply(a,dose('雪莲子',{resource:'流风'}),{combat:true}).actor;
  assert.equal(c.state.turn.standard,0);assert.equal(c.state.turn.move,1);
  a.state.turn.move=0;a.state.turn.standard=0;
  assert.throws(()=>apply(a,dose('药B'),{combat:true}),/action|动作/i);
  assert.equal(a.state.inventory.find(x=>x.name==='药B').quantity,3);
});
test('培元丹 heals A then L then B with one strength budget and multiple doses do not stack',()=>{
  let a=wounds(player(),{A:2,L:4,B:1});
  a=apply(a,dose('培元丹')).actor;a=apply(a,dose('培元丹')).actor;
  assert.equal(a.state.pendingRecoveryEffects.length,1);
  assert.equal(a.state.inventory.find(x=>x.name==='培元丹').quantity,1);
  a=apply(a,rest('long',480)).actor;
  assert.deepEqual([a.state.health.A,a.state.health.L,a.state.health.B],[0,1,0]);
});
test('initial story actors keep trusted flow metadata and meditation rolls confirmed agility plus perception',()=>{
  const p=player();p.state.resources.流风.current=0;
  const a={id:p.id,name:p.name,state:p.state};let meta;
  const out=apply(a,{type:'meditate',minutes:30},{drawDice:m=>{meta=m;return Array(128).fill(8);}});
  assert.deepEqual(meta.attributes,['敏捷','感知']);
  assert.equal(out.actor.state.resources.流风.current,18);
  assert.equal(out.actor.state.recoveryClock.minutes,30);
});
test('self medicine needs consciousness and an actionable body; natural rest remains available',()=>{
  const unconscious=wounds(player(),{L:12});
  assert.throws(()=>apply(unconscious,dose('药B')),/unconscious/);
  assert.equal(unconscious.state.inventory.find(x=>x.name==='药B').quantity,3);
  assert.doesNotThrow(()=>apply(unconscious,rest('long',480)));
  assert.throws(()=>apply(wounds(player(),{B:12}),dose('药B')),/行动前|力量/);
});
test('severe excitement prevents meditation without consuming elapsed time or dice',()=>{
  const a=player();a.state.statuses=[{type:'亢奋',source:'测试',points:2}];
  let draws=0;
  assert.throws(()=>apply(a,{type:'meditate',minutes:15},{drawDice:()=>{draws++;return Array(128).fill(8);}}),/亢奋/);
  assert.equal(draws,0);assert.equal(a.state.recoveryClock,undefined);
});
test('combat legal medicine uses the existing atomic MVU operation and saved retries do not debit twice',async()=>{
  let data={stat_data:{}};
  const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async value=>{data=structuredClone(value);}};
  const environment={mvu,getAnchor:()=>({chatId:'medicine-test',messageId:0,swipeId:0}),expectedChatId:'medicine-test'};
  const battle=createOpeningEncounter({id:'medicine-test',participants:['player'],positions:{player:[0,0],foe:[8,0]},enemies:[{id:'foe',type:'cityGuard'}]});
  // This test needs a stationary legal opponent, not its unrelated initiative.
  battle.actors.foe.position=[8,0];battle.activeId='player';
  wounds(battle.actors.player,{L:6});battle.actors.player.state=beginTurn(battle.actors.player.state).state;
  const runtime=createCombatRuntime(environment);await runtime.initialize(battle);
  const command={actorId:'player',abilityId:'medicine',medicine:'药B'};
  assert.ok(inspectCommands(runtime.read().battle).options.some(x=>JSON.stringify(x.command)===JSON.stringify(command)));
  await assert.rejects(runtime.dispatch({operationId:'unauthorized',expectedRevision:0,command}),/玩家/);
  const request={operationId:'take-b',expectedRevision:0,command,playerAuthorized:true};
  assert.equal((await runtime.dispatch(request)).status,'applied');
  assert.equal((await createCombatRuntime(environment).dispatch(request)).status,'already_applied');
  const root=data.stat_data['901_rules_poc'];
  assert.equal(root.actors.player.state.inventory.find(i=>i.name==='药B').quantity,2);
  assert.equal(root.actors.player.state.health.L,1);
  assert.equal(root.actors.player.state.turn.move,0);
  assert.equal(publicScene(root).events.find(e=>e.action==='服用药B').outcome,'已完成本次用药的即时效果');
  assert.doesNotThrow(()=>ownImpactReport({...root,operations:{...root.operations,story:{summary:{revision:2,kind:'recovery',result:{kind:'recovery',changes:[]}}}}}));
});
