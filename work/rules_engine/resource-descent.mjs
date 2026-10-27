// A termination consequence has its own clock and provenance. It is not a
// temporary flight bonus, and loading a save never restarts its first interval.
const need=message=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field='verticalPosition';throw e;};
export function inspectCapabilityEnd(state,instanceId,capability){
 if(state.physicalMotion?.instanceId===instanceId)return false;
 if(!['descent','fall'].includes(capability.onEnd?.kind))return false;
 if(capability.movement?.mode==='flight'&&capability.movement.used!==true&&state.verticalPosition?.supportInstanceId!==instanceId)return false;
 const p=state.verticalPosition;
 if(!p?.source||!Number.isFinite(p.heightAboveGround)||p.heightAboveGround<0)need('结束空中支撑须实际离地高度及来源，不能默认安全着地');
 if(p.heightAboveGround===0)return false;
 if(!p.supportInstanceId)need('须标明当前实际支撑此空中位置的来源');
 return p.supportInstanceId===instanceId;
}
export function beginResourceDescent(state,instanceId,capability,{reason='expired'}={}){
 if(!inspectCapabilityEnd(state,instanceId,capability))return null;
 const rule=capability.onEnd;
 const descent={instanceId,sourceId:capability.source??capability.sourceId,casterId:capability.casterId,reason,remainingRounds:rule.rounds,metersPerRound:rule.metersPerRound,intervalMinutes:rule.intervalMinutes,elapsedMinutes:0};
 const sample=state.flightKinematics;
 if(sample?.source&&sample.supportInstanceId===instanceId&&[sample.velocity,sample.position].every(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)))descent.handoff={velocity:rule.kind==='fall'?[...sample.velocity]:[sample.velocity[0],sample.velocity[1],0],position:[...sample.position],heightAtStart:state.verticalPosition.heightAboveGround,source:sample.source};
 if(rule.kind==='fall'){
  const p=state.verticalPosition;
  state.pendingFall={kind:'flight-end',instanceId,handoff:descent.handoff,sourceId:descent.sourceId,casterId:descent.casterId,terminationReason:reason,height:p.heightAboveGround,source:p.source};
  delete p.supportInstanceId;delete state.resourceDescent;return state.pendingFall;
 }
 state.resourceDescent=descent;state.verticalPosition.supportInstanceId='descent/'+instanceId;
 return descent;
}
export function advanceResourceDescent(state,minutes){
 const d=state.resourceDescent;if(!d)return [];
 const p=state.verticalPosition;
 if(!p?.source||!Number.isFinite(p.heightAboveGround))need('缓降须保留实际离地高度');
 const events=[];d.elapsedMinutes=Math.round((d.elapsedMinutes+minutes)*1e9)/1e9;
 while(d.elapsedMinutes+1e-9>=d.intervalMinutes&&d.remainingRounds>0){
  d.elapsedMinutes=Math.max(0,Math.round((d.elapsedMinutes-d.intervalMinutes)*1e9)/1e9);
  const before=p.heightAboveGround;p.heightAboveGround=Math.max(0,before-d.metersPerRound);d.remainingRounds--;
  events.push({kind:'descent',sourceId:d.sourceId,before,after:p.heightAboveGround});
  if(p.heightAboveGround===0){delete state.resourceDescent;delete p.supportInstanceId;return events;}
 }
 if(d.remainingRounds===0){
  state.pendingFall={kind:'descent-handoff',instanceId:d.instanceId,handoff:d.handoff,sourceId:d.sourceId,casterId:d.casterId,terminationReason:d.reason,height:p.heightAboveGround,source:p.source};
  delete state.resourceDescent;delete p.supportInstanceId;events.push({kind:'fall',...state.pendingFall});
 }
 return events;
}
