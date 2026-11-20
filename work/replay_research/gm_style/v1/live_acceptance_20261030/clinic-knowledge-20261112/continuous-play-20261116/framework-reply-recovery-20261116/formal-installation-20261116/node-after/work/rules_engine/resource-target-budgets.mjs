import {effectValue} from './resource-effects.mjs';
const need=(message,field)=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field=field;throw e;};
// Allocate the unresisted casting budget once. Resistance consumes a target's
// share, never returns it to the caster or changes another target's share.
export function inspectTargetAllocation(policy,targetIds,choices,value){
 const total=value(policy.total),shares=choices?.[policy.key];
 if(!Number.isInteger(total)||total<0)throw Error('资源分配总额必须为非负整数');
 if(!shares||typeof shares!=='object'||Array.isArray(shares)||Object.keys(shares).length!==targetIds.length||targetIds.some(id=>!Object.hasOwn(shares,id)||!Number.isInteger(shares[id])||shares[id]<=0)||Object.keys(shares).some(id=>!targetIds.includes(id))||Object.values(shares).reduce((a,b)=>a+b,0)!==total)
  need('目标分配须逐一对应实际目标、每份为正整数且总和等于本次预算','resource.targetAllocations.'+policy.key);
 return {total,shares:structuredClone(shares)};
}
// No writes until the spell has survived casting failures and enters target
// resolution. Values are frozen per use; changed P never rewrites history.
export function prepareTargetProgression(state,{resourceId,targetId,policy,version,context}){
 const key=JSON.stringify([resourceId,policy.key,targetId]),prior=state.resourceProgressions?.[key];
 const before=structuredClone(prior?.values??{}),after={};
 for(const field of policy.fields){
  if(Object.hasOwn(after,field.name))throw Error('递增字段不能重复');
  const value=effectValue(prior?field.next:field.initial,state,{...context,previous:before});
  if(!Number.isFinite(value)||value<0)throw Error('递增记录必须为非负有限数值');
  after[field.name]=value;
 }
 return {key,resourceId,targetId,scope:policy.scope,version,uses:(prior?.uses??0)+1,before,after};
}
export function commitTargetProgression(state,receipt){
 const {key,resourceId,targetId,scope,version,uses,after}=receipt;
 (state.resourceProgressions??={})[key]={resourceId,targetId,scope,version,uses,values:structuredClone(after)};
}
