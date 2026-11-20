import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {beginTurn} from '../core.mjs';
import {beginCommonTurn} from './common-actions.mjs';
import {resolveStep} from './transitions.mjs';
import {combatActionReport} from './presentation.mjs';
import {act,stateResult} from './engine.mjs';
import {createArenaEncounter} from './arena.mjs';

function reaction(choice) {
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]},teams:{player:'玩家',huang:'对手'}});
 b.activeId='huang';b.order=['huang','player'];b.reactionWindows=true;b.playerDefenseDeclarations=true;
 b.actors.huang.combatProfile.hpFixed=100;b.actors.huang.state.derived.hpMax=100;b.actors.huang.state.health.intact=100;
 b.actors.huang.state=beginTurn(b.actors.huang.state).state;beginCommonTurn(b,b.actors.huang);
 const drawDice=()=>Array(1024).fill(8);
 const pending=resolveStep(b,{actorId:'huang',abilityId:'move',to:[4,0]},{drawDice});
 assert.equal(pending.battle.pending.kind,'opportunity');
 const command={actorId:'player',abilityId:'opportunityReact',choice};
 const out=resolveStep(pending.battle,command,{drawDice,playerAuthorized:true});
 const root={battle:out.battle,actors:out.battle.actors,revision:1,operations:{test:{signature:JSON.stringify(command),summary:{revision:1,result:out.result}}}};
 return {out,root,report:combatActionReport(root)};
}

test('resolved opportunity attack is reported once before the visible movement',()=>{
 const {out,report}=reaction('strike');
 assert.equal(out.result.opportunities.length,1);
 assert.ok(out.result.opportunities[0].damage.some(x=>x.actualDamage>0));
 assert.equal(out.battle.actors.player.state.turn.opportunityUsed,true);
 assert.equal((report.match(/借机攻击/g)??[]).length,1);
 assert.ok(report.indexOf('借机攻击')<report.indexOf('可见移动'),report);
 assert.doesNotMatch(report,/意志×|骰池|rawDP/);
});

test('declining opportunity does not invent an attack',()=>{
 const {out,report}=reaction('decline');
 assert.equal(out.result.opportunities?.length??0,0);
 assert.doesNotMatch(report,/借机攻击/);
 assert.match(report,/可见移动/);
});

test('an unseen mover is not disclosed by its nested opportunity',()=>{
 const {root}=reaction('strike');
 root.operations.test.summary.result.after.visibleTo.player=['player'];
 const report=combatActionReport(root);
 assert.doesNotMatch(report,/黄泉|借机攻击|骰池|rawDP/);
});

function reportRoot(b,commands,options={}) {
 const operations={initial:{signature:'{}',summary:{revision:1,result:stateResult(b,b.activeId,'enter')}}};
 let revision=1;
 for(const command of commands){
  const out=act(b,command,options);b=out.battle;
  operations[++revision]={signature:JSON.stringify(command),summary:{revision,result:out.result}};
 }
 return {battle:b,actors:b.actors,revision,operations};
}

test('shield report identifies the actual fortitude resistance on success, failure and blocked movement',()=>{
 for(const mode of ['success','failure','blocked']){
  const b=createArenaEncounter('arena-radwick',{positions:{player:[0,0],radwick:[1,0]},
   map:{bounds:mode==='blocked'?[-1,-4,8,8]:[-10,-10,20,20],bounded:true,features:[]}});
  b.activeId='radwick';b.actors.radwick.state=beginTurn(b.actors.radwick.state).state;
  let roll=0;
  const root=reportRoot(b,[{actorId:'radwick',abilityId:'shieldPush',targetId:'player'}],
   {defenseDeclarations:{player:'normal'},drawDice:()=>Array(1024).fill(mode==='failure'?(++roll===1?1:9):(++roll===1?9:1))});
  const r=root.operations[2].summary.result,before=structuredClone(root),report=combatActionReport(root,{afterRevision:1});
  assert.equal(r.saves[0].type,'fort');assert.equal(r.contest.won,mode!=='failure');
  assert.equal(r.forcedMovement?.length,mode==='success'?2:undefined);
  assert.match(report,/防御（御临风）：强韧抵抗/);
  assert.doesNotMatch(report,/没有防御结算|主动格挡|骰池|targetTotal|rolledSuccesses/);
  assert.deepEqual(root,before);
 }
});

test('pending shield push does not report a completed fortitude resistance',()=>{
 const b=createArenaEncounter('arena-radwick',{positions:{player:[0,0],radwick:[1,0]}});
 b.activeId='radwick';b.actors.radwick.state=beginTurn(b.actors.radwick.state).state;
 const command={actorId:'radwick',abilityId:'shieldPush',targetId:'player'};
 const out=resolveStep(b,command,{drawDice:()=>{throw Error('pending action must not roll');}});
 const root={battle:out.battle,actors:out.battle.actors,revision:1,operations:{pending:{signature:JSON.stringify(command),summary:{revision:1,result:out.result}}}};
 assert.match(combatActionReport(root),/待裁定/);
 assert.doesNotMatch(combatActionReport(root),/强韧抵抗|没有防御结算/);
});

function burrowRoot(hidden=false){
 const b=createOpeningEncounter({participants:['player'],enemies:[{id:'gremlin',type:'gremlin'}],
  positions:{player:[0,0],gremlin:[1,0]},teams:{player:'玩家',gremlin:'对手'},
  map:{bounds:[-5,-5,20,20],features:[{id:'soil',kind:'zone',rect:[-5,-5,20,20],surface:'earth',earthPassage:true,earthExit:true}]}});
 b.activeId='gremlin';b.actors.gremlin.state=beginTurn(b.actors.gremlin.state).state;
 if(hidden)b.actors.gremlin.hiddenFrom=['player'];
 return reportRoot(b,[{actorId:'gremlin',abilityId:'burrow'},{actorId:'gremlin',abilityId:'move',to:[3,0]}]);
}

test('witnessed burrowing survives report filtering without revealing later underground movement',()=>{
 const root=burrowRoot(),before=structuredClone(root);
 assert.ok(root.operations.initial.summary.result.after.visibleTo.player.includes('gremlin'));
 assert.ok(!root.operations[2].summary.result.after.visibleTo.player.includes('gremlin'));
 assert.ok(root.battle.actors.gremlin.underground);
 assert.equal(root.battle.actors.gremlin.state.resources.魔力.current,6);
 const report=combatActionReport(root,{afterRevision:1});
 assert.match(report,/古雷姆林｜土遁入地/);assert.match(report,/已入土.*离开视线/);
 assert.doesNotMatch(report,/可见移动|主动移动|魔力|3,0|移动至/);
 assert.equal((report.match(/古雷姆林｜/g)??[]).length,1);
 assert.equal(combatActionReport(root,{afterRevision:2}),'');
 assert.deepEqual(root,before);
});

test('burrowing that was unseen before and after remains absent from the report',()=>{
 const root=burrowRoot(true);
 assert.ok(!root.operations.initial.summary.result.after.visibleTo.player.includes('gremlin'));
 assert.equal(combatActionReport(root,{afterRevision:1}),'');
});
