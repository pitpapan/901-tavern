// Trusted resource programs select existing counters. No pool or ownership is
// created by changing a value. Threshold consequences retain their own source.
function slot(state,path){
 const keys=path.split('.');let object=state;
 for(const key of keys.slice(0,-1)){
  if(['__proto__','constructor','prototype'].includes(key)||!Object.hasOwn(object??{},key))throw Error('缺少实际计数器：'+path);
  object=object[key];
 }
 const key=keys.at(-1);
 if(['__proto__','constructor','prototype'].includes(key)||!Object.hasOwn(object??{},key)||!Number.isFinite(object[key]))throw Error('缺少实际计数器：'+path);
 return {object,key,value:object[key]};
}
export function hasCounterCondition(state,effect){
 return Object.values(state.resourceConditions??{}).some(c=>c.effect===effect&&(c.remainingMinutes!==undefined?c.remainingMinutes>0:slot(state,c.path).value<=c.endsAbove));
}
export function syncCounterConditions(state){
 for(const [id,c]of Object.entries(state.resourceConditions??{}))if(c.remainingMinutes===undefined&&slot(state,c.path).value>c.endsAbove)delete state.resourceConditions[id];
}
export function addCounterCondition(state,condition){
 if(!condition.id||!condition.sourceId||!Number.isFinite(condition.endsAbove))throw Error('计数器状态须有来源及解除阈值');
 if(slot(state,condition.path).value>condition.endsAbove)return false;
 (state.resourceConditions??={})[condition.id]=structuredClone(condition);return true;
}
export function adjustCounter(state,path,delta,{minimum=0,maximumPath,strict=false}={}){
 const {object,key,value:before}=slot(state,path),maximum=maximumPath?slot(state,maximumPath).value:Infinity;
 if(!Number.isFinite(delta))throw Error('计数器变化须为有限数值');
 if(strict&&before+delta<minimum)throw Error('计数器余额不足：'+path);
 const after=Math.max(minimum,Math.min(maximum,before+delta));
 syncCounterConditions(state);object[key]=after;syncCounterConditions(state);
 return {path,before,after,changed:after-before};
}
export function changeWill(state,delta){return adjustCounter(state,'will.current',delta,{maximumPath:'will.max',strict:delta<0});}
