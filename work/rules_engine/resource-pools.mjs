import {RuleInputError} from './combat/mechanics.mjs';
import {effectValue} from './resource-effects.mjs';
import {syncCounterConditions} from './resource-counters.mjs';
// Only existing, explicitly classified pools participate. Trusted definitions
// supply conversion formulae and daily policies; plans supply actual choices/day.
const fail=(message,field)=>{throw new RuleInputError(message,field);};
function actualPool(state,id){
 const p=Object.hasOwn(state.resources??{},id)?state.resources[id]:null;
 if(!p||!Number.isInteger(p.current)||!Number.isInteger(p.max)||p.current<0||p.max<0||p.current>p.max)fail('缺少合法的实际能量池余额或上限：'+id,'resource.pool');
 return p;
}
function generic(p,id){
 if(p.special===true||p.generic===false)return false;
 if(p.generic!==true)fail('实际能量池缺少通用／特殊分类：'+id,'resource.poolClassification');
 return true;
}
function candidates(state,declared){
 if(typeof declared!=='string'||!declared.trim())fail('须声明本次选择的能量池','resource.poolChoices');
 const entries=Object.entries(state.resources??{}),named=entries.find(([id])=>id===declared);
 if(named&&generic(named[1],named[0])){actualPool(state,declared);return [declared];}
 return entries.filter(([id,p])=>generic(p,id)).map(([id])=>{actualPool(state,id);return id;});
}
function budget(state,daily,dayId,context){
 if(!daily)return null;
 if(!['current','first-use'].includes(daily.basis)){
  const e=new Error('每日回复上限的容量时点与跨版本计账尚待裁定');e.code='RULE_UNRESOLVED';throw e;
 }
 if(typeof dayId!=='string'||!dayId.trim())fail('须有来源计划中的实际游戏日期；经过分钟不等于日期','resource.dayId');
 if(!daily.source||!daily.key)throw Error('每日额度须声明规则来源和共享计账键');
 const existing=state.resourceDailyUsage?.[daily.key]?.[dayId];
 if(existing&&existing.basis!==daily.basis)throw Error('已记账日限额的采用口径不同，须明确迁移');
 const current=effectValue(daily.maximum,state,context);
 if(!Number.isInteger(current)||current<0)fail('每日回复上限须为实际非负整数','resource.daily.maximum');
 const maximum=daily.basis==='first-use'&&existing?existing.maximum:current;
 return {existing,maximum,used:existing?.used??0,key:daily.key,dayId};
}
export function validatePoolTransfer(from,to,options){
 const ids=candidates(from,options.declaredPool),destination=actualPool(to,options.destinationPool);
 const daily=ids.length?budget(to,options.daily,options.dayId,{...options.context,destinationMax:destination.max}):null;
 return {ids,destination,daily};
}
function choose(ids,drawDice){
 if(ids.length===1)return {id:ids[0],dice:[]};
 if(typeof drawDice!=='function')fail('随机能量池须可信骰源','resource.poolRandom');
 // Rejection sampling avoids modulo bias, including more than ten candidates.
 const digits=Math.ceil(Math.log10(ids.length)),range=10**digits,limit=range-range%ids.length;
 const dice=[];let buffer=[];
 for(;;){
  let index=0;
  for(let i=0;i<digits;i++){
   if(!buffer.length)buffer=[...(drawDice()??[])];
   const die=buffer.shift();if(!Number.isInteger(die)||die<1||die>10)fail('随机能量池须合法d10结果','resource.poolRandom');
   dice.push(die);index=index*10+die-1;
  }
  if(index<limit)return {id:ids[index%ids.length],dice};
 }
}
export function transferResourcePool(from,to,options){
 const {ids,destination,daily}=validatePoolTransfer(from,to,options);
 if(!ids.length)return {drained:0,recovered:0,ineffective:'no-eligible-pool'};
 const selection=choose(ids,options.drawDice),origin=actualPool(from,selection.id),amount=options.amount;
 if(!Number.isInteger(amount)||amount<0)throw Error('扣除能量须为非负整数');
 const drained=Math.min(amount,origin.current),requested=effectValue(options.recover,to,{...options.context,drained,destinationMax:destination.max});
 if(!Number.isInteger(requested)||requested<0)throw Error('转换回复须为非负整数');
 const before=origin.current,destinationBefore=destination.current-(origin===destination?drained:0);
 const recovered=Math.min(requested,destination.max-destinationBefore,daily?Math.max(0,daily.maximum-daily.used):Infinity);
 // Validate both sides and quota before changing either balance.
 origin.current-=drained;destination.current+=recovered;
 syncCounterConditions(from);if(to!==from)syncCounterConditions(to);
 if(daily){
  const ledger=(to.resourceDailyUsage??={});ledger[daily.key]??={};
  ledger[daily.key][daily.dayId]={...daily.existing,basis:options.daily.basis,maximum:daily.maximum,used:daily.used+recovered,source:options.daily.source,
   lastUse:{sourceId:options.sourceId,version:options.version,grade:options.grade,casterId:options.casterId,targetId:options.targetId,sourcePool:selection.id,destinationPool:options.destinationPool,drained,recovered}};
 }
 return {sourcePool:selection.id,destinationPool:options.destinationPool,before,after:origin.current,drained,recovered,requested,selection,
  ...(daily?{daily:{key:daily.key,dayId:daily.dayId,maximum:daily.maximum,used:daily.used+recovered}}:{})};
}

export function validatePoolRestore(state,options){
 const destination=actualPool(state,options.destinationPool);
 return {destination,daily:budget(state,options.daily,options.dayId,{...options.context,destinationMax:destination.max})};
}
export function restoreResourcePool(state,options){
 const {destination,daily}=validatePoolRestore(state,options),requested=options.amount;
 if(!Number.isInteger(requested)||requested<0)throw Error('回复须为非负整数');
 const recovered=Math.min(requested,destination.max-destination.current,daily?Math.max(0,daily.maximum-daily.used):Infinity);
 destination.current+=recovered;syncCounterConditions(state);
 if(daily){const ledger=state.resourceDailyUsage??={};ledger[daily.key]??={};ledger[daily.key][daily.dayId]={...daily.existing,basis:options.daily.basis,maximum:daily.maximum,used:daily.used+recovered,source:options.daily.source,lastUse:{sourceId:options.sourceId,grade:options.grade,recovered}};}
 return {requested,recovered,...(daily?{daily:{key:daily.key,dayId:daily.dayId,maximum:daily.maximum,used:daily.used+recovered}}:{})};
}
