// Scene use belongs to the recipient/resource, not a cast instance or caster.
// Only the sourced sceneEnd lifecycle resets it; leaving combat does not.
export function assertSceneEffectLimit(state,sourceId,maximum){
 if((state.resourceSceneUsage?.[sourceId]?.used??0)>=maximum){
  const error=new Error('本目标本场景已达到该资源的作用次数上限');error.code='UNAVAILABLE';throw error;
 }
}
export function recordSceneEffectUse(state,{sourceId,casterId,maximum,version}){
 assertSceneEffectLimit(state,sourceId,maximum);
 const row=(state.resourceSceneUsage??={})[sourceId]??{used:0,receipts:[]};
 row.used++;row.receipts.push({casterId,version});state.resourceSceneUsage[sourceId]=row;
}
export function queueInitiativeChange(root,{targetId,sourceId,instanceId,applyAfterActorId}){
 if(!root.id||!root.actors[targetId]||!root.order?.includes(applyAfterActorId)){
  const error=new Error('调整先攻须当前实际战斗和行动者');error.code='NEEDS_INPUT';error.field='initiative.battle';throw error;
 }
 const row={battleId:root.id,sourceId,instanceId,applyAfterActorId};
 (root.actors[targetId].state.resourceTurnOrder??=[]).push(row);
 return row;
}
export function settleInitiativeChanges(root,actorId,{initiative,tiePriority=()=>0}){
 const changes=[];
 for(const [targetId,target]of Object.entries(root.actors)){
  const queue=target.state.resourceTurnOrder??[];
  for(const row of queue)if(row.battleId===root.id&&row.applyAfterActorId===actorId)changes.push({...row,targetId});
  if(queue.length)target.state.resourceTurnOrder=queue.filter(row=>row.battleId!==root.id||row.applyAfterActorId!==actorId);
 }
 if(!changes.length)return {changes,nextId:null};
 const before=[...root.order],oldIndex=before.indexOf(actorId);
 root.order.sort((x,y)=>initiative(root.actors[y])-initiative(root.actors[x])||tiePriority(root.actors[y])-tiePriority(root.actors[x]));
 // A newly overtaking recipient may act next only if its turn was not taken.
 const crossed=new Set(changes.filter(row=>before.indexOf(row.targetId)>oldIndex&&root.order.indexOf(row.targetId)<root.order.indexOf(actorId)&&!root.turnTaken?.includes(row.targetId)).map(row=>row.targetId));
 return {changes,before,after:[...root.order],nextIds:root.order.filter(id=>crossed.has(id))};
}
