import {queueAutomaticResourceEvent} from './resource-automatic-events.mjs';
import {effectMatches} from './resource-effects.mjs';
// Each source owns its remaining balance. health.temp is only the currently
// available balance, never the sum of all sources or a refreshed capacity.
export function temporaryHealthActive(state,id){
 const p=state.temporaryHealthPools?.[id];
 return state.temporaryHealthSource===id&&!!p&&!p.suspended&&p.remaining>0&&p.remainingRounds!==0&&p.remainingMinutes!==0;
}
export function syncTemporaryHealth(state){
 if(!state.temporaryHealthPools)return;
 const id=state.temporaryHealthSource;
 state.health.temp=temporaryHealthActive(state,id)?state.temporaryHealthPools[id].remaining:0;
}
export function temporaryHealthChoice(state,incomingId,{targetId,choice}={}){
 const live=Object.values(state.temporaryHealthPools??{}).filter(p=>p.id!==incomingId&&p.remaining>0&&p.remainingRounds!==0&&p.remainingMinutes!==0);
 if(!state.temporaryHealthPools&&(state.health.temp??0)>0)live.push({id:'saved-legacy',remaining:state.health.temp});
 if(!live.length)return {decision:'apply'};
 if(live.length!==1||!choice?.source||!targetId||choice.chosenBy!==targetId||choice.existingId!==live[0].id||!['keep','replace'].includes(choice.decision)){
  const e=new Error('须受术者选择保留或替换当前临时生命实际来源');e.code='NEEDS_INPUT';e.field='resource.temporaryHealthChoices.'+targetId;throw e;
 }
 return {decision:choice.decision,existing:live[0],source:choice.source};
}
export function registerTemporaryHealth(state,pool,options={}){
 if(!pool.id||!pool.sourceId||!Number.isInteger(pool.remaining)||pool.remaining<0)throw Error('临时生命须有来源和非负整数余额');
 const selection=temporaryHealthChoice(state,pool.id,options);
 if(selection.decision==='keep')return selection.existing;
 if(selection.decision==='replace'){
  if(state.temporaryHealthPools)delete state.temporaryHealthPools[selection.existing.id];
  state.activeResourceEffects=(state.activeResourceEffects??[]).filter(e=>e.temporaryHealthId!==selection.existing.id);
  // Replacement is a lifecycle choice, never a damage/exhaustion event.
  pool={...pool,replacedSource:{id:selection.existing.id,reason:'recipient-replacement',source:selection.source}};
 }
 (state.temporaryHealthPools??={})[pool.id]=structuredClone(pool);
 state.temporaryHealthSource=pool.id;syncTemporaryHealth(state);
 return state.temporaryHealthPools[pool.id];
}
export function consumeTemporaryHealth(state,amount,{unavoidable=false,...damage}={}){
 syncTemporaryHealth(state);
 const pool=state.temporaryHealthPools?.[state.temporaryHealthSource];
 const eligible=!pool?.damageFilter||effectMatches(pool.damageFilter,state,damage);
 const absorbed=unavoidable||!eligible?0:Math.min(amount,state.health.temp??0);
 if(state.temporaryHealthPools){
  const pool=state.temporaryHealthPools[state.temporaryHealthSource];
  if(absorbed)pool.remaining-=absorbed;
  syncTemporaryHealth(state);
 }else state.health.temp=(state.health.temp??0)-absorbed;
 const depleted=pool&&absorbed>0&&pool.remaining===0?{instanceId:pool.id,sourceId:pool.sourceId,casterId:pool.casterId,version:pool.version,grade:pool.grade,capacity:pool.capacity,reason:'damage',phase:'temporaryHP'}:null;
 if(depleted&&pool.onDepleted){queueAutomaticResourceEvent(state,pool);delete state.temporaryHealthPools[pool.id];state.activeResourceEffects=(state.activeResourceEffects??[]).filter(x=>x.temporaryHealthId!==pool.id);if(state.temporaryHealthSource===pool.id)delete state.temporaryHealthSource;}
 return {...(depleted?{depleted}:{}),absorbed,sourceId:absorbed?pool?.id??'saved-legacy':null};
}
