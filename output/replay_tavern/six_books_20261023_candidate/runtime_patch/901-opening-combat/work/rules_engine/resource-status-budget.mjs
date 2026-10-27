import {STATUS_ARCHETYPES} from './resource-status-applicability.mjs';
const mechanic=type=>STATUS_ARCHETYPES[type]??type;
// Permanent removal budgets are independent of effective-status stacking.
// Selections refer to actual sources, never to transient array positions.
const key=row=>JSON.stringify([row.type,row.source??null,row.sourceActorId??null,row.statusId??row.id??null]);
const need=message=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field='resource.statusBudgetChoice';throw e;};
export function inspectStatusBudget(state,{types,amount,targetId,choice}){
 if(!Number.isInteger(amount)||amount<0)throw Error('状态移除预算须为非负整数');
 const groups=new Map();
 for(const row of state.statuses??[]){
  if(!types.map(mechanic).includes(mechanic(row.type))||row.removable===false||row.points<=0)continue;
  const id=key(row),g=groups.get(id)??{key:id,type:row.type,source:row.source??null,sourceActorId:row.sourceActorId??null,...(row.id?{statusId:row.id}:{}),points:0};
  g.points+=row.points;groups.set(id,g);
 }
 const allocations=[],required=new Set();
 for(const type of new Set(types.map(mechanic))){
  const rows=[...groups.values()].filter(x=>mechanic(x.type)===type),total=rows.reduce((n,x)=>n+x.points,0),budget=Math.min(total,amount);
  if(!budget)continue;
  if(rows.length===1||total<=budget){for(const row of rows)allocations.push({...row,remove:Math.min(row.points,budget)});continue;}
  required.add(type);
  if(!choice?.source||choice.chosenBy!==targetId||!Array.isArray(choice.allocations))need('须受术者分配同类型多个真实来源的扣点预算');
  const declared=choice.allocations.filter(x=>mechanic(x.type)===type),seen=new Set();let spent=0;
  for(const row of declared){
   const id=key(row),actual=groups.get(id);
   if(seen.has(id)||!actual||!Number.isInteger(row.points)||row.points<0||row.points>actual.points)need('扣点选择须指向实际来源且不超出其点数');
   seen.add(id);spent+=row.points;allocations.push({...actual,remove:row.points});
  }
  if(spent!==budget)need('同类型来源分配须用足本次实际可移除预算');
 }
 if(choice?.allocations?.some(x=>!required.has(mechanic(x.type))))need('仅需为本次有取舍的状态类型声明来源分配');
 return {budgetPerType:amount,allocations,removed:allocations.reduce((n,x)=>n+x.remove,0)};
}
export function reduceStatusBudget(state,spec){
 const result=inspectStatusBudget(state,spec),remaining=new Map(result.allocations.map(x=>[x.key,x.remove]));
 for(const row of state.statuses??[]){
  if(row.removable===false)continue;
  const id=key(row),n=Math.min(row.points,remaining.get(id)??0);row.points-=n;remaining.set(id,(remaining.get(id)??0)-n);
 }
 state.statuses=(state.statuses??[]).filter(x=>x.points>0);
 return result;
}
