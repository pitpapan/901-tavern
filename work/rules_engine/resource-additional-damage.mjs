import {selectedTriggerKeys} from './resource-trigger-lifecycle.mjs';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
// RE damage flow 59, 93–95: match the post-protection type and lightest
// surviving severity. The enclosing event owns defense spending and C settlement.
export const damageTypeKey=s=>s.kind+(s.energyType?':'+s.energyType:'')+(s.damageType?':'+s.damageType:'');
export function validateDamageTypeOrder(types,order){
 const ids=[...new Set(types)];
 if(ids.length<2&&order===undefined)return;
 if(!Array.isArray(order)||new Set(order).size!==order.length||ids.some(id=>!order.includes(id))){
  const e=new Error('混合附伤须攻击前声明并列余点的实际伤害类型顺序');e.code='NEEDS_INPUT';e.field='additionalDamageTypeOrder';e.choices=ids;throw e;
 }
}
export function sameTypeAdditionalSegments(receipt,declaration,typeOrder){
 const rows=receipt.originalSegments.filter(s=>s.amount>0&&!s.unavoidable);
 if(!receipt.causedDamage||!rows.length||rows.some(s=>s.energyType==='chaos'||s.damageType==='chaos'))return [];
 const groups=new Map();
 for(const row of rows){const key=damageTypeKey(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 const total=rows.reduce((n,s)=>n+s.amount,0),shares=[...groups].map(([key,parts])=>{
  const weight=parts.reduce((n,s)=>n+s.amount,0),numerator=weight*declaration.amount;
  return {key,parts,weight,amount:Math.floor(numerator/total),remainder:numerator%total};
 });
 const remaining=declaration.amount-shares.reduce((n,s)=>n+s.amount,0),ranked=[...shares].sort((a,b)=>b.remainder-a.remainder);
 if(remaining&&ranked[remaining-1]?.remainder===ranked[remaining]?.remainder)validateDamageTypeOrder(shares.map(x=>x.key),typeOrder);
 ranked.sort((a,b)=>b.remainder-a.remainder||(typeOrder?typeOrder.indexOf(a.key)-typeOrder.indexOf(b.key):0));
 for(let i=0;i<remaining;i++)ranked[i].amount++;
 return shares.filter(x=>x.amount>0).map(({key,parts,weight,amount})=>{
  const first=parts[0],severity=parts.reduce((v,s)=>['B','L','A'].indexOf(s.severity)<['B','L','A'].indexOf(v)?s.severity:v,first.severity);
  return {amount,severity,kind:first.kind,...(first.energyType?{energyType:first.energyType}:{}),...(first.damageType?{damageType:first.damageType}:{}),
   magical:declaration.magical,grade:declaration.grade,sourceId:declaration.sourceId,casterId:declaration.casterId,additional:true,attack:false,ranged:false,
   allocation:{type:key,weight,totalWeight:total,total:declaration.amount,allocated:amount}};
 });
}

export function additionalDamageCandidates(state,sourceActorId){
 const selected=selectedTriggerKeys(state);
 return Object.entries(state.resourceTriggers??{}).filter(([key,t])=>selected.has(key)&&t.event==='attackDamageCaused'&&(!sourceActorId||t.attackSource!=='caster'||t.casterId===sourceActorId)&&(!t.applicability||evaluateApplicability(t.applicability,collectImmunities(state,RESOURCE_DEFINITIONS)).status!=='blocked'))
  .map(([key,t])=>({instanceId:t.id??key,sourceId:t.sourceId,casterId:t.casterId,grade:t.rank}));
}
export function validateAdditionalDamageOrder(state,sourceActorId,order){
 const choices=additionalDamageCandidates(state,sourceActorId),ids=choices.map(x=>x.instanceId);
 if(order===undefined&&ids.length<2)return choices;
 if(!Array.isArray(order)||ids.some(id=>!order.includes(id))||new Set(order).size!==order.length||order.some(id=>!ids.includes(id))){
  const e=new Error('须在攻击计划中选择实际追加伤害来源的顺序');e.code='NEEDS_INPUT';e.field='additionalDamageOrder';e.choices=choices;throw e;
 }
 return choices;
}
