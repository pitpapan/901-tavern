import {RESOURCE_DEFINITIONS,resourceEffects,resourceBonus} from './resource-definitions.mjs';
// Eligibility comes from effective instances and actual caster identity, never
// from the request claiming that a school benefit applies.
export function selfCastEffectRows(actor,stat,school,context={}){
 if(typeof actor.id!=='string'||!actor.id)return [];
 return resourceEffects(actor.state,stat,context).filter(row=>row.origin==='active'&&row.casterId===actor.id&&row.instanceId&&
  RESOURCE_DEFINITIONS[row.source]?.schools?.includes(school)&&Object.values(RESOURCE_DEFINITIONS[row.source].programs??{}).some(p=>p.casting===true));
}
export function protectionChoices(actor,context={}){
 const rows=selfCastEffectRows(actor,'defense','结界',context).filter(e=>e.value>0&&['armor','force'].includes(e.group));
 if(!rows.length)return [];
 const bonus=resourceBonus(actor.state,'selfProtectionDefense',{...context,selfProtectionSpell:true});
 return bonus>0?rows.map(e=>({instanceId:e.instanceId,source:e.source,group:e.group,bonus})):[];
}
export function walkingMultiplier(actor){
 const selfWalkingSpell=selfCastEffectRows(actor,'speed','变化').some(e=>e.value>0);
 return selfWalkingSpell?Math.max(1,...resourceEffects(actor.state,'walkingMultiplier',{selfWalkingSpell}).map(e=>e.value)):1;
}
