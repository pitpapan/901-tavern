import {syncActorWounds} from './resource-wounds.mjs';
import {randomDice} from './rule-random.mjs';
// Queues belong to saved actors; execution guards only prevent synchronous
// recursion. Every event locks its actual source snapshot at the trigger point.
const running=new WeakSet(),batches=new WeakMap();
export function withAutomaticBatch(root,run){
 batches.set(root,(batches.get(root)??0)+1);
 try{return run();}finally{const n=batches.get(root)-1;if(n)batches.set(root,n);else batches.delete(root);}
}
export function queueAutomaticEvent(state,event){
 state.resourceAutomaticSerial=(state.resourceAutomaticSerial??0)+1;
 const row={...event,id:state.resourceAutomaticSerial,rolls:[]};(state.resourceAutomaticEvents??=[]).push(row);return row;
}
function orderUnstampedDeaths(root,combat){
 const rows=Object.entries(root.actors).flatMap(([ownerId,a])=>(a.state.resourceAutomaticEvents??[]).filter(e=>e.reason==='death'&&e.order===undefined).map(e=>({ownerId,e})));
 const owners=[...new Set(rows.map(x=>x.ownerId))];let order=owners;
 if(owners.length>1){
  const declared=combat?root.order:root.ruleScene?.automaticOrder?.source?root.ruleScene.automaticOrder.actorIds:null;
  if(!Array.isArray(declared)||owners.some(id=>!declared.includes(id))){const e=new Error('同时死亡触发须实际先攻顺序，场外须预先登记有来源的automaticOrder.actorIds');e.code='NEEDS_INPUT';e.field='automaticOrder';throw e;}
  order=declared;
 }
 rows.sort((a,b)=>order.indexOf(a.ownerId)-order.indexOf(b.ownerId)||(a.e.sourceOrder??a.e.id)-(b.e.sourceOrder??b.e.id));
 let clock=Math.max(0,...Object.values(root.actors).map(a=>a.state.resourceAutomaticClock??0));
 for(const {ownerId,e}of rows){e.order=++clock;root.actors[ownerId].state.resourceAutomaticClock=clock;}
}
export function queueAutomaticResourceEvent(state,pool){
 if(!pool.onDepleted)return;
 queueAutomaticEvent(state,{instanceId:pool.id,sourceId:pool.sourceId,casterId:pool.casterId,reason:'damage-exhausted',snapshot:structuredClone(pool.onDepleted)});
}
export function stampAutomaticResourceEvents(root,actorId){
 if(!root?.actors?.[actorId])return;
 let clock=Math.max(0,...Object.values(root.actors).map(a=>a.state.resourceAutomaticClock??0));
 for(const e of root.actors[actorId].state.resourceAutomaticEvents??[])if(e.order===undefined&&e.reason!=='death')e.order=++clock;
 root.actors[actorId].state.resourceAutomaticClock=clock;
}
export function drainAutomaticResourceEvents(root,execute,{drawDice=randomDice,combat=false}={}){
 if(running.has(root)||batches.has(root))return [];
 const results=[];running.add(root);
 try{
  for(const id of Object.keys(root.actors))if(root.actors[id].state.resourceAutomaticEvents?.length)stampAutomaticResourceEvents(root,id);
  while(true){
   try{orderUnstampedDeaths(root,combat);}catch(error){if(error.code!=='NEEDS_INPUT')throw error;results.push({status:'pending',code:error.code,field:error.field,reason:error.message});break;}
   const next=Object.entries(root.actors).flatMap(([id,a])=>(a.state.resourceAutomaticEvents??[]).map(e=>({id,e}))).sort((a,b)=>a.e.order-b.e.order)[0];
   if(!next)break;
   const {id,e}=next,working=structuredClone(root);let cursor=0;
   working.actors[id].state.resourceAutomaticEvents=working.actors[id].state.resourceAutomaticEvents.filter(x=>x.id!==e.id);
   const replayDice=()=>{if(cursor===e.rolls.length)e.rolls.push(structuredClone(drawDice()));return structuredClone(e.rolls[cursor++]);};
   running.add(working);
   try{
    const result=execute(working,id,e,{drawDice:replayDice,combat});
    for(const [actorId,a]of Object.entries(working.actors)){root.actors[actorId].state=a.state;if(a.state.woundLedger)syncActorWounds(root.actors[actorId]);}
    results.push({id:e.id,order:e.order,ownerId:id,sourceId:e.sourceId,instanceId:e.instanceId,status:'resolved',...result});
   }catch(error){
    if(!['NEEDS_INPUT','RULE_UNRESOLVED'].includes(error.code))throw error;
    results.push({id:e.id,order:e.order,ownerId:id,status:'pending',code:error.code,field:error.field,reason:error.message});break;
   }finally{running.delete(working);}
  }
 }finally{running.delete(root);}
 return results;
}
