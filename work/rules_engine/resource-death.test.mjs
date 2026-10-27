import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {resolveDamage,lifeStatus} from './core.mjs';
import {settleResourceDeaths,accrueEffectiveTriggerRounds} from './resource-death.mjs';
const seed=(n,p=6)=>({id:'seed/'+n,sourceId:'seed',version:'v1',casterId:'player',rank:'C',variables:{P:p},selection:{group:'same',power:p,order:n},scene:true,sourceOrder:n,onDeath:{radius:30,excludeCaster:true,program:{steps:[]}}});
test('death locks only the effective source with its own round count before clearing durations, once across reload',()=>{
 let root={round:1,order:['huang','player'],actors:createOpeningRoster()};const a=root.actors.huang;
 a.state.resourceTriggers={old:seed(1),recent:seed(2)};accrueEffectiveTriggerRounds(root,'huang');root.round=2;accrueEffectiveTriggerRounds(root,'huang');
 assert.equal(a.state.resourceTriggers.old.effectiveRounds,undefined);assert.equal(a.state.resourceTriggers.recent.effectiveRounds,2);
 a.state=resolveDamage(a.state,{amount:100,severity:'A',kind:'physical',unavoidable:true}).state;
 const changes=settleResourceDeaths(root);assert.equal(changes.length,1);assert.equal(a.state.resourceAutomaticEvents.length,1);
 assert.equal(a.state.resourceAutomaticEvents[0].snapshot.variables.effectiveRounds,2);assert.deepEqual(a.state.resourceTriggers,{});assert.equal(lifeStatus(a.state).state,'dead');
 root=JSON.parse(JSON.stringify(root));assert.deepEqual(settleResourceDeaths(root),[]);assert.equal(root.actors.huang.state.resourceAutomaticEvents.length,1);
});

import * as death from './resource-death.mjs';
import {flushAutomaticResourceEvents} from './gm_runtime/resource-program.mjs';
import {damageEvent} from './combat/engine.mjs';
const ward=(id,order=1,grade='C')=>({id,sourceId:id.split('/')[0],version:'v1',casterId:'player',grade,sourceOrder:order,remainingMinutes:60,effects:[],deathRecovery:{mode:'one-impact-from-death',maximum:2},instantDeathProtection:{maximumLevel:3}});
const fatal=root=>damageEvent(root.actors.huang,[{amount:100,severity:'A',kind:'physical',unavoidable:true}],false,{damage:[]},{conversion:0},{root,targetId:'huang',drawDice:()=>[1]});
test('Q35/Q36 death recovery shares target scene quota with instant death, skips already living locked recoveries after reload',()=>{
 let root={round:1,order:['huang','player'],actors:createOpeningRoster()};
 root.actors.huang.state.activeResourceEffects=[ward('ward/a'),ward('other/b',2)];
 fatal(root);
 let s=root.actors.huang.state;
 assert.equal(s.health.L,1);assert.equal(s.health.A,s.derived.hpMax-1);assert.notEqual(lifeStatus(s).state,'dead');
 assert.equal(s.resourceSceneUsage.ward.used,1);assert.equal(s.resourceSceneUsage.other,undefined);assert.deepEqual(s.activeResourceEffects,[]);
 root=JSON.parse(JSON.stringify(root));s=root.actors.huang.state;s.activeResourceEffects=[ward('ward/c',3)];
 assert.equal(death.resolveResourceInstantDeath(root,'huang',{sourceId:'instant',grade:'B'}).blocked,true);
 assert.equal(s.resourceSceneUsage.ward.used,2);assert.deepEqual(s.activeResourceEffects,[]);
 s.activeResourceEffects=[ward('ward/d',4)];fatal(root);
 assert.equal(lifeStatus(root.actors.huang.state).state,'dead');assert.equal(root.actors.huang.state.resourceSceneUsage.ward.used,2);
});
test('only an actually lethal restricted segment locks resurrection grade, persisted restriction blocks equal not higher recovery',()=>{
 let root={round:1,order:['huang','player'],actors:createOpeningRoster()};
 const hit=amount=>damageEvent(root.actors.huang,[{amount,severity:'A',kind:'energy',energyType:'fire',unavoidable:true,sourceId:'burn',grade:'C',deathRestriction:{maximumLevel:2}}],false,{damage:[]},{conversion:0},{root,targetId:'huang',sourceActorId:'player',drawDice:()=>[1]});
 hit(1);assert.equal(root.actors.huang.state.resourceDeathRestrictions,undefined);
 root.actors.huang.state.activeResourceEffects=[ward('low/a')];hit(100);
 assert.equal(lifeStatus(root.actors.huang.state).state,'dead');assert.equal(root.actors.huang.state.resourceSceneUsage?.low,undefined);
 root=JSON.parse(JSON.stringify(root));const a=root.actors.huang;
 assert.equal(a.state.resourceDeathRestrictions[0].sourceId,'burn');
 const result=death.resolveDeathRecovery(a,{sourceId:'higher',sourceVersion:'v1',casterId:'player',grade:'B',recovery:{mode:'one-impact-from-death',maximum:3}});
 assert.equal(result.recovered,true);assert.equal(a.state.health.L,1);assert.equal(a.state.resourceDeathRestrictions,undefined);
});
test('instant death protection compares actual grades and successful immunity consumes once without touching wounds',()=>{
 const root={actors:createOpeningRoster()},s=root.actors.huang.state,before=structuredClone(s.health);
 s.activeResourceEffects=[ward('ward/a')];
 assert.equal(typeof death.resolveResourceInstantDeath,'function');
 const blocked=death.resolveResourceInstantDeath(root,'huang',{sourceId:'instant',grade:'B'});
 assert.equal(blocked.blocked,true);assert.deepEqual(s.health,before);
 s.activeResourceEffects=[ward('ward/b')];
 const killed=death.resolveResourceInstantDeath(root,'huang',{sourceId:'instant',grade:'A'});
 assert.equal(killed.killed,true);assert.equal(lifeStatus(s).state,'dead');assert.equal(s.resourceSceneUsage.ward.used,1);
});

import {ensureWoundLedger,assertWoundLedger} from './resource-wounds.mjs';
const recoverySnapshot={sourceId:'ward',sourceVersion:'v2',casterId:'player',grade:'C',recovery:{mode:'one-impact-from-death',maximum:2}};
test('Q37/Q38 recovery chooses ordinary A first and preserves every special source and restriction',()=>{
 const a=createOpeningRoster().huang,n=a.state.derived.hpMax;
 a.state.health={...a.state.health,intact:0,B:0,L:0,A:n,dead:true};
 ensureWoundLedger(a.state,[{severity:'A',count:n-1,recovery:'naturalOnly',source:'curse'}]);
 const result=death.resolveDeathRecovery(a,recoverySnapshot,{drawDice:()=>{throw Error('ordinary first needs no dice');}});
 assert.equal(result.recovered,true);assertWoundLedger(a.state);
 assert.equal(a.state.woundLedger.batches.find(b=>b.severity==='L').restrictions.length,0);
 assert.equal(a.state.woundLedger.batches.find(b=>b.severity==='A').count,n-1);assert.equal(a.state.woundLedger.batches.find(b=>b.severity==='A').origin.source,'curse');
});
test('Q38 all-special recovery draws by actual shares and persists the selected source and original restrictions',()=>{
 const a=createOpeningRoster().huang,n=a.state.derived.hpMax;
 a.state.health={...a.state.health,intact:0,B:0,L:0,A:n,dead:true};
 ensureWoundLedger(a.state,[{severity:'A',count:1,recovery:'aggravated',source:'small'},{severity:'A',count:n-1,recovery:'naturalOnly',source:'large'}]);
 let calls=0;const result=death.resolveDeathRecovery(a,recoverySnapshot,{drawDice:()=>{calls++;return [1,2];}});
 assert.equal(calls,1);assert.equal(result.recovered,true);assertWoundLedger(a.state);
 const lowered=a.state.woundLedger.batches.find(b=>b.severity==='L');assert.equal(lowered.origin.source,'large');assert.equal(lowered.restrictions[0].recovery,'naturalOnly');
 assert.deepEqual(a.state.woundLedger.lastSelection.weights,[1,n-1]);assert.deepEqual(a.state.woundLedger.lastSelection.dice,[1,2]);
 assert.equal(a.state.resourceLastRecovery.sourceId,'ward');assert.equal(a.state.resourceLastRecovery.changes.at(-1).woundSource.selection.selectedId,lowered.parentId);
});
test('saved formerly pending death recovery resumes once using recorded dice and preserves special locks',()=>{
 let root={actors:createOpeningRoster()},a=root.actors.huang,n=a.state.derived.hpMax;
 a.state.health={...a.state.health,intact:0,B:0,L:0,A:n,dead:true};a.state.resourceDeathHandled=true;
 ensureWoundLedger(a.state,[{severity:'A',count:1,recovery:'aggravated',source:'small'},{severity:'A',count:n-1,recovery:'naturalOnly',source:'large'}]);
 a.state.resourceAutomaticEvents=[{id:1,sourceId:'ward',instanceId:'ward/1',reason:'death',snapshot:recoverySnapshot,rolls:[[1,2]],order:1}];
 root=JSON.parse(JSON.stringify(root));const result=flushAutomaticResourceEvents(root,{drawDice:()=>{throw Error('must reuse saved random draw');}});
 assert.equal(result[0].recovered,true);assert.equal(root.actors.huang.state.resourceSceneUsage.ward.used,1);assert.equal(root.actors.huang.state.woundLedger.batches.find(b=>b.severity==='L').origin.source,'large');
 assert.deepEqual(flushAutomaticResourceEvents(root),[]);
});
test('instant-death recovery upgrades mixed wounded slots without erasing their source restrictions',()=>{
 const a=createOpeningRoster().huang,n=a.state.derived.hpMax;
 a.state.health={...a.state.health,intact:n-2,B:1,L:1,A:0,dead:true};
 ensureWoundLedger(a.state,[{severity:'B',count:1,recovery:'aggravated',source:'one'},{severity:'L',count:1,recovery:'naturalOnly',source:'two'}]);
 death.resolveDeathRecovery(a,recoverySnapshot,{drawDice:()=>{throw Error('ordinary reset slot takes priority');}});assertWoundLedger(a.state);
 assert.equal(a.state.health.L,1);assert.equal(a.state.health.A,n-1);
 assert.equal(a.state.woundLedger.batches.find(b=>b.severity==='L').restrictions.length,0);
 for(const source of ['one','two']){const row=a.state.woundLedger.batches.find(b=>b.origin.source===source);assert.equal(row.count,1);assert.equal(row.severity,'A');assert.equal(row.restrictions.length,1);}
});
