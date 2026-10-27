// Ignoring a numerical penalty never erases points, thresholds or hard effects.
import {effectiveStatuses} from './resource-status-applicability.mjs';
import {resourceBonus} from './resource-definitions.mjs';
export function remainingPenalty(state,kind,amount,context={}){
 const stat=kind==='status'?'statusPenaltyIgnore':kind==='environment'?'environmentPenaltyIgnore':null;
 if(!stat)throw Error('减值忽略缺少明确类别');
 return Math.max(0,amount-Math.max(0,resourceBonus(state,stat,context)));
}
export function environmentModifierTotal(state,rows){
 const environment=rows.filter(x=>x.category==='environment'&&x.value<0).reduce((n,x)=>n-x.value,0);
 return rows.reduce((n,x)=>n+x.value,0)+environment-remainingPenalty(state,'environment',environment);
}

// Concentration sums acquired sources, but spends the ignore allowance once per type.
export function statusConcentrationPenalty(state){
 const pointsByType=new Map();
 for(const status of effectiveStatuses(state)){
  const points=Math.max(0,status.points-(status.ignoredPoints??0));
  pointsByType.set(status.type,(pointsByType.get(status.type)??0)+points);
 }
 return [...pointsByType].reduce((total,[type,points])=>total+remainingPenalty(state,'status',points,{status:type}),0);
}
