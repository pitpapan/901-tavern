import test from 'node:test';
import assert from 'node:assert/strict';
import {queueAutomaticResourceEvent,stampAutomaticResourceEvents,drainAutomaticResourceEvents} from './resource-automatic-events.mjs';
const pool=id=>({id,sourceId:'test/source',casterId:id,onDepleted:{variables:{P:3}}});
test('automatic events preserve chronological order across actors and chained depletion without recursive dispatch',()=>{
 const root={actors:{a:{state:{}},b:{state:{}}}};
 queueAutomaticResourceEvent(root.actors.b.state,pool('b'));stampAutomaticResourceEvents(root,'b');
 queueAutomaticResourceEvent(root.actors.a.state,pool('a'));stampAutomaticResourceEvents(root,'a');
 let depth=0,maximum=0;
 const execute=(working,id,event)=>{
  depth++;maximum=Math.max(maximum,depth);
  if(event.instanceId==='b'){queueAutomaticResourceEvent(working.actors.a.state,pool('chain'));stampAutomaticResourceEvents(working,'a');assert.deepEqual(drainAutomaticResourceEvents(working,execute),[]);}
  depth--;return {instanceId:event.instanceId};
 };
 const results=drainAutomaticResourceEvents(root,execute);
 assert.deepEqual(results.map(x=>x.instanceId),['b','a','chain']);assert.equal(maximum,1);assert.deepEqual(root.actors.a.state.resourceAutomaticEvents,[]);
});
test('pending automatic events persist dice and roll back unfinished writes; resume commits once after reload',()=>{
 let root={actors:{a:{state:{value:0}}}};queueAutomaticResourceEvent(root.actors.a.state,pool('a'));
 const execute=(working,id,event,{drawDice})=>{const roll=drawDice();working.actors.a.state.value++;if(!working.fact){const e=new Error('actual source grade needed');e.code='NEEDS_INPUT';e.field='source.grade';throw e;}return {roll};};
 let calls=0;const pending=drainAutomaticResourceEvents(root,execute,{drawDice:()=>{calls++;return [8];}});
 assert.equal(pending[0].status,'pending');assert.equal(root.actors.a.state.value,0);assert.equal(calls,1);
 root=JSON.parse(JSON.stringify(root));root.fact=true;
 const result=drainAutomaticResourceEvents(root,execute,{drawDice:()=>{throw Error('must reuse recorded roll');}});
 assert.deepEqual(result[0].roll,[8]);assert.equal(root.actors.a.state.value,1);assert.deepEqual(drainAutomaticResourceEvents(root,execute),[]);
});

test('Q34 keeps automatic effects behind the entire fixed area batch',async()=>{
 const {withAutomaticBatch}=await import('./resource-automatic-events.mjs');const root={actors:{a:{state:{}}}},log=[];
 withAutomaticBatch(root,()=>{queueAutomaticResourceEvent(root.actors.a.state,pool('a'));log.push('damage-a');assert.deepEqual(drainAutomaticResourceEvents(root,()=>log.push('burst')),[]);log.push('status-a','damage-b','status-b');});
 drainAutomaticResourceEvents(root,()=>{log.push('burst');return {};});assert.deepEqual(log,['damage-a','status-a','damage-b','status-b','burst']);
});
test('Q33 uses initiative and source creation order for simultaneous death events, after earlier depletion',async()=>{
 const {queueAutomaticEvent,withAutomaticBatch}=await import('./resource-automatic-events.mjs');const root={round:1,order:['b','a'],actors:{a:{state:{}},b:{state:{}}}};
 withAutomaticBatch(root,()=>{for(const [id,n]of [['a',2],['a',1],['b',3]]){queueAutomaticEvent(root.actors[id].state,{instanceId:id+n,reason:'death',sourceOrder:n,snapshot:{}});stampAutomaticResourceEvents(root,id);}queueAutomaticResourceEvent(root.actors.a.state,pool('shield'));stampAutomaticResourceEvents(root,'a');});
 const out=drainAutomaticResourceEvents(root,()=>({}),{combat:true});assert.deepEqual(out.map(x=>x.instanceId),['shield','b3','a1','a2']);
});

test('Q33 simultaneous field deaths retain their queue until a sourced order is supplied and saved',async()=>{
 const {queueAutomaticEvent}=await import('./resource-automatic-events.mjs');let root={actors:{a:{state:{}},b:{state:{}}}};
 for(const id of ['a','b'])queueAutomaticEvent(root.actors[id].state,{instanceId:id,reason:'death',sourceOrder:1,snapshot:{}});
 const pending=drainAutomaticResourceEvents(root,()=>{throw Error('missing order must not execute');});assert.equal(pending[0].field,'automaticOrder');
 root=JSON.parse(JSON.stringify(root));root.ruleScene={automaticOrder:{source:'主持已声明的场外同时结算顺序',actorIds:['b','a']}};
 assert.deepEqual(drainAutomaticResourceEvents(root,()=>({})).map(e=>e.instanceId),['b','a']);
});
