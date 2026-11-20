// Declared accumulating consequences retain their own source and rest policy.
// These are effect counters, never an energy pool or an acquisition grant.
export function accumulateResource(state,{key,amount,sourceId,threshold,conditionMinutes,resetAfterRestMinutes}){
 if(!key||!sourceId||!Number.isInteger(amount)||amount<0||!Number.isFinite(threshold)||threshold<=0||!Number.isFinite(conditionMinutes)||conditionMinutes<=0||!Number.isFinite(resetAfterRestMinutes)||resetAfterRestMinutes<=0)throw Error('积累机制须有来源、增量、实际阈值和恢复期限');
 const counters=state.resourceAccumulators??={},counter=counters[key]??={value:0,sourceId,resetAfterRestMinutes};
 counter.value+=amount;
 const conditionId='accumulator/'+key,conditions=state.resourceConditions??={};
 if(counter.value>=threshold&&!conditions[conditionId])conditions[conditionId]={id:conditionId,sourceId,effect:'unconscious',remainingMinutes:conditionMinutes,resetAccumulator:key};
 return {key,value:counter.value,threshold,unconscious:!!conditions[conditionId]};
}
export function advanceAccumulatorConditions(state,minutes){
 for(const [id,c]of Object.entries(state.resourceConditions??{}))if(c.remainingMinutes!==undefined){
  c.remainingMinutes=Math.max(0,Math.round((c.remainingMinutes-minutes)*1e9)/1e9);
  if(!c.remainingMinutes){if(c.resetAccumulator&&state.resourceAccumulators?.[c.resetAccumulator])state.resourceAccumulators[c.resetAccumulator].value=0;delete state.resourceConditions[id];}
 }
}
export function completeAccumulatorRest(state,minutes){
 const reset=[];
 for(const [key,c]of Object.entries(state.resourceAccumulators??{}))if(minutes>=c.resetAfterRestMinutes){c.value=0;reset.push(key);}
 return reset;
}
