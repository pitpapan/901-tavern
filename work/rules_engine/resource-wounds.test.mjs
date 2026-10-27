import test from 'node:test';import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {damageEvent} from './combat/engine.mjs';
import {advanceDeterioration,resizeHealthCapacity} from './core.mjs';
import {healWounds} from './healing.mjs';
const patient=()=>{const a=createOpeningRoster().player;a.state.derived.hpMax=3;a.state.health={intact:0,B:0,L:2,A:1,temp:0};a.recoveryLocks=[{severity:'L',count:1,recovery:'aggravated',source:'actual-wound'}];return a;};
test('ordinary wounds upgrade first, then the remaining restricted wound carries its recovery rule into A',()=>{
 const a=patient();
 damageEvent(a,[{amount:1,severity:'L',kind:'physical',unavoidable:true}],false,{damage:[]});
 assert.equal(a.state.health.L,1);assert.equal(a.recoveryLocks[0].severity,'L');
 damageEvent(a,[{amount:1,severity:'L',kind:'physical',unavoidable:true}],false,{damage:[]});
 assert.equal(a.state.health.L,0);assert.equal(a.recoveryLocks[0].severity,'A');
});
test('recovery restrictions survive JSON, deterioration and reduced health capacity',()=>{
 const a=patient();damageEvent(a,[{amount:1,severity:'L',kind:'physical',unavoidable:true}],false,{damage:[]});
 const b=JSON.parse(JSON.stringify(a));b.state=advanceDeterioration(b.state,{from:'L'}).state;
 assert.equal(b.state.woundLedger.batches.filter(x=>x.severity==='A'&&x.restrictions.length).reduce((n,x)=>n+x.count,0),1);
 const c=patient();damageEvent(c,[],false,{damage:[]});resizeHealthCapacity(c.state,2);
 assert.equal(c.state.health.L,1);assert.equal(c.state.woundLedger.batches.find(x=>x.restrictions.length).severity,'L');
 resizeHealthCapacity(c.state,1);assert.equal(c.state.woundLedger.batches.find(x=>x.restrictions.length).severity,'A');
});

test('a sourced unconscious condition does not stop existing A deterioration',()=>{
 const a=patient();a.state.resourceConditions={actual:{effect:'unconscious',remainingMinutes:480,sourceId:'actual-effect'}};
 const next=advanceDeterioration(a.state,{from:'L'});
 assert.equal(next.result.changed,true);assert.equal(next.state.health.A,2);
});

function mixedSpecials({ordinary=0,split=false}={}){
 const a=patient();a.state.derived.hpMax=4+ordinary;a.state.health={intact:0,B:0,L:3+ordinary,A:1,temp:0};delete a.recoveryLocks;
 a.state.woundLedger={version:1,nextId:10,batches:[
  {id:'x',severity:'L',count:1,origin:{source:'x'},restrictions:[{source:'x',recovery:'naturalOnly'}]},
  ...(split?[{id:'y1',count:1},{id:'y2',count:1}]:[{id:'y',count:2}]).map(b=>({...b,severity:'L',origin:{source:'y'},restrictions:[{source:'y',recovery:'aggravated'}]})),
  ...(ordinary?[{id:'ordinary',severity:'L',count:ordinary,origin:{source:'ordinary'},restrictions:[]}]:[]),
  {id:'a',severity:'A',count:1,origin:{source:'old-A'},restrictions:[]}]};return a;
}
test('upgrades exhaust ordinary shares without dice then randomly select each remaining special wound',async()=>{
 const {applyWounds}=await import('./core.mjs');let a=mixedSpecials({ordinary:1}),draws=0;
 let out=applyWounds(a.state,{L:1},{drawDice:()=>{throw Error('ordinary first requires no random draw');}});
 assert.equal(out.state.woundLedger.batches.find(b=>b.id==='x').count,1);
 assert.equal(out.state.woundLedger.batches.find(b=>b.id==='y').count,2);
 // Three tickets: 9 is rejected; 2 selects y. Then ticket 0 selects x.
 const rolls=[[10,3],[1]];
 out=applyWounds(out.state,{L:2},{drawDice:()=>rolls[draws++],choice:{id:'x',source:'obsolete-choice'}});
 assert.equal(draws,2);assert.equal(out.state.health.L,1);
 assert.equal(out.state.woundLedger.batches.find(b=>b.id==='y').count,1);
 assert.equal(out.state.woundLedger.batches.find(b=>b.id==='x'),undefined);
 assert.deepEqual(out.result.changes.map(c=>c.woundSource.selection.dice),[[10,3],[1]]);
 assert.deepEqual(out.result.changes.map(c=>c.woundSource.batchId),['y','x']);
 assert.deepEqual(JSON.parse(JSON.stringify(out.state)).woundLedger.lastSelection,out.state.woundLedger.lastSelection);
});
test('special wound odds follow actual wound counts, independent of splitting one source into batches',()=>{
 for(const split of [false,true])for(const [die,source]of [[1,'x'],[2,'y'],[3,'y']]){
  const a=mixedSpecials({split});const out=advanceDeterioration(a.state,{from:'L',drawDice:()=>[die]});
  const moved=out.state.woundLedger.batches.filter(b=>b.severity==='A'&&b.restrictions.length);
  assert.equal(moved.length,1);assert.equal(moved[0].origin.source,source);
  assert.equal(moved[0].restrictions[0].recovery,source==='x'?'naturalOnly':'aggravated');
 }
});
test('combat damage uses its trusted random source and retains the selected wound receipt',()=>{
 const a=mixedSpecials(),result={damage:[]};let draws=0;
 damageEvent(a,[{amount:1,severity:'L',kind:'physical',unavoidable:true}],false,result,{}, {drawDice:()=>{draws++;return [3];}});
 assert.equal(draws,1);assert.equal(a.recoveryLocks.find(b=>b.severity==='A').source,'y');
 assert.equal(result.damage[0].woundChanges[0].woundSource.batchId,'y');
});

test('capacity replay places ordinary shares first even when legacy batches list special wounds first',()=>{
 const a=mixedSpecials({ordinary:1});
 // D11 replays 4L + 1A into 3 slots. The first upgrade consumes the
 // ordinary share; only the second chooses between the two remaining special L.
 let draws=0;resizeHealthCapacity(a.state,3,{drawDice:()=>{draws++;return [3];}});
 assert.equal(draws,1);assert.deepEqual(a.state.woundLedger.lastSelection.weights,[1,1]);
 assert.deepEqual([a.state.health.intact,a.state.health.B,a.state.health.L,a.state.health.A],[0,0,1,2]);
 assert.equal(a.state.woundLedger.batches.reduce((n,b)=>n+b.count,0),3);
 assert.equal(a.state.woundLedger.batches.filter(b=>b.severity==='A').every(b=>b.restrictions.length>0),true);
});
