// Duration and capability bookkeeping for all declarative resources.
// Stored effects retain cast-time values; they are never re-evaluated on expiry.
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
export function resourceCapability(state,id){
 const rows=Object.values(state.resourceCapabilities??{}).filter(x=>x.id===id&&!x.suspended&&x.remainingRounds!==0&&x.remainingMinutes!==0);
 for(const [resourceId,owned]of Object.entries(state.learnedResources??{}))if(owned.learned)for(const c of RESOURCE_DEFINITIONS[resourceId]?.capabilities??[])if(c.id===id)rows.push({...c,source:resourceId});
 return rows.sort((a,b)=>(b.level??0)-(a.level??0))[0]??null;
}
export function expireResourceEffects(state,{minutes=0,rounds=0,scene=false}={}){
 const expired=[],tick=x=>{
  if(scene&&x.scene)return false;
  if(x.remainingMinutes!==undefined)x.remainingMinutes=Math.max(0,x.remainingMinutes-minutes);
  if(x.remainingRounds!==undefined)x.remainingRounds=Math.max(0,x.remainingRounds-rounds);
  return x.remainingRounds!==0&&x.remainingMinutes!==0;
 };
 state.activeResourceEffects=(state.activeResourceEffects??[]).filter(x=>{const keep=tick(x);if(!keep)expired.push(x.id);return keep;});
 for(const [key,x]of Object.entries(state.resourceCapabilities??{}))if(!tick(x)){expired.push(key);delete state.resourceCapabilities[key];}
 for(const [key,x]of Object.entries(state.resourceTriggers??{}))if(!tick(x)){expired.push(key);delete state.resourceTriggers[key];}
 for(const [key,c]of Object.entries(state.resourceCooldowns??{})){
  const remaining=Math.max(0,c-minutes*10);if(remaining)state.resourceCooldowns[key]=remaining;else delete state.resourceCooldowns[key];
 }
 return expired;
}
