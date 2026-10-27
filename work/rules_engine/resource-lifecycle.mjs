import {advanceProjectionClocks} from './resource-projections.mjs';
import {advanceResourceUseWindows} from './resource-use-cooldowns.mjs';
import {selectedTriggerKeys,queueTriggerEnd} from './resource-trigger-lifecycle.mjs';
import {settleOngoingEnd} from './resource-ongoing.mjs';
import {inspectCapabilityEnd,beginResourceDescent,advanceResourceDescent} from './resource-descent.mjs';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {advanceAccumulatorConditions} from './resource-accumulators.mjs';
import {syncTemporaryHealth} from './resource-temporary-health.mjs';
// Duration and capability bookkeeping for all declarative resources.
// Stored effects retain cast-time values; they are never re-evaluated on expiry.
import {syncResourceHealth} from './core.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
export function resourceCapabilityRows(state,id){
 const rows=Object.entries(state.resourceCapabilities??{}).map(([instanceId,x])=>({...x,instanceId})).filter(x=>x.id===id&&!x.suspended&&x.remainingRounds!==0&&x.remainingMinutes!==0);
 for(const [resourceId,owned]of Object.entries(state.learnedResources??{}))if(owned.learned)for(const c of RESOURCE_DEFINITIONS[resourceId]?.capabilities??[])if(c.id===id)rows.push({...c,source:resourceId,instanceId:'definition/'+resourceId+'/'+id});
 return rows.filter(x=>!x.applicability||evaluateApplicability(x.applicability,collectImmunities(state,RESOURCE_DEFINITIONS)).status!=='blocked').sort((a,b)=>(b.level??0)-(a.level??0));
}
export const resourceCapability=(state,id)=>resourceCapabilityRows(state,id)[0]??null;
export function expireResourceEffects(state,{minutes=0,rounds=0,scene=false,drawDice}={}){
 advanceProjectionClocks(state,Math.max(minutes,rounds/10));
 const selectedTriggers=selectedTriggerKeys(state);
 const elapsed=Math.max(minutes,rounds/10);
 advanceResourceUseWindows(state,elapsed*10);
 const expiresAt=x=>Math.min(x.remainingMinutes??Infinity,(x.remainingRounds??Infinity)/10,scene&&x.scene?0:Infinity);
 for(const [key,x]of Object.entries(state.resourceCapabilities??{}))if(expiresAt(x)<=elapsed)inspectCapabilityEnd(state,key,x);
 advanceResourceDescent(state,elapsed);
 advanceAccumulatorConditions(state,minutes);
 if(scene){delete state.resourceSensoryCues;delete state.resourceTurnSerial;delete state.resourcePendingPerceptions;delete state.resourceDiscoveries;delete state.resourceLocationClues;delete state.resourceMovementHistory;delete state.resourceMovementSerial;delete state.resourceDetectionContests;for(const [key,row]of Object.entries(state.resourceProgressions??{}))if(row.scope==='scene')delete state.resourceProgressions[key];delete state.resourceSceneUsage;delete state.resourceTurnOrder;}
 const expired=[],tick=x=>{
  if(scene&&x.scene)return false;
  if(x.remainingMinutes!==undefined)x.remainingMinutes=Math.max(0,x.remainingMinutes-minutes);
  if(x.remainingRounds!==undefined)x.remainingRounds=Math.max(0,x.remainingRounds-rounds);
  return x.remainingRounds!==0&&x.remainingMinutes!==0;
 };
 const ending=(state.activeResourceEffects??[]).filter(x=>!tick(x));
 for(const x of ending){settleOngoingEnd(state,x,{drawDice,reason:scene?'scene-end':'expired'});expired.push(x.id);}
 const endingIds=new Set(ending.map(x=>x.id));state.activeResourceEffects=(state.activeResourceEffects??[]).filter(x=>!endingIds.has(x.id));
 for(const [key,x]of Object.entries(state.resourceCapabilities??{})){const endAt=expiresAt(x);if(!tick(x)){
  const descent=beginResourceDescent(state,key,x,{reason:scene&&x.scene?'scene-end':'expired'});
  if(descent)advanceResourceDescent(state,Math.max(0,elapsed-endAt));
  expired.push(key);delete state.resourceCapabilities[key];
 }}
 for(const [key,x]of Object.entries(state.resourceTriggers??{}))if(!tick(x)){queueTriggerEnd(state,x,{reason:scene&&x.scene?'scene-end':'shortened',effective:selectedTriggers.has(key)});expired.push(key);delete state.resourceTriggers[key];}
 for(const [key,x]of Object.entries(state.resourceAuras??{}))if(!tick(x)){expired.push(key);delete state.resourceAuras[key];}
 for(const [key,x]of Object.entries(state.resourceChannels??{}))if(!tick(x)){expired.push(key);delete state.resourceChannels[key];}
 for(const [key,pool]of Object.entries(state.temporaryHealthPools??{}))if(!tick(pool)){expired.push(key);delete state.temporaryHealthPools[key];}
 for(const item of state.possessions?.items??[])if(item.resourceEffects)item.resourceEffects=item.resourceEffects.filter(tick);
 syncTemporaryHealth(state);
 for(const [key,c]of Object.entries(state.resourceCooldowns??{})){
  const remaining=Math.max(0,c-minutes*10);if(remaining)state.resourceCooldowns[key]=remaining;else delete state.resourceCooldowns[key];
 }
 syncResourceHealth(state);
 return expired;
}

// A restriction concerns the actor using an effect. It is not blanket target
// immunity, does not remove learned resources, and never infers an effect tier
// from its name, mana price, or the user's overall power.
export function effectUseRestriction(state,{families=[],grade}={}){
 const restrictions=families.map(family=>({family,capability:resourceCapability(state,'effectUseBlock:'+family)})).filter(x=>x.capability);
 if(!restrictions.length)return {blocked:false};
 const level=['D','C','B','A','S'].indexOf(grade)+1;
 if(!level)return {blocked:false,needsGrade:true,restrictions};
 return {blocked:restrictions.some(x=>x.capability.level>=level),level,restrictions};
}
export function assertEffectUseAllowed(state,effect){
 const result=effectUseRestriction(state,effect);
 if(result.needsGrade){const e=new Error('须有来源的实际效果等级，才能比较效果使用限制');e.code='NEEDS_INPUT';e.field='effectGrades';throw e;}
 if(result.blocked){const e=new Error('当前效果使用限制阻止 '+result.restrictions.map(x=>x.family).join('/'));e.code='UNAVAILABLE';throw e;}
 return result;
}
