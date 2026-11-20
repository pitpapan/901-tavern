// Retain every source; select one effective instance for all of its consumers.
import {releasePerceptions} from './resource-perception.mjs';
import {collectImmunities,evaluateApplicability} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {resolveDamage} from './core.mjs';
const live=x=>!x.suspended&&x.remainingRounds!==0&&x.remainingMinutes!==0;
export function selectedOngoingEffects(state){
 const rows=(state.activeResourceEffects??[]).filter(x=>live(x)&&(!x.applicability||evaluateApplicability(x.applicability,collectImmunities(state,RESOURCE_DEFINITIONS)).status!=='blocked'));
 return selectOngoingRows(rows);
}
export function selectOngoingRows(rows){
 const groups=new Map();
 for(const x of rows)if(x.selection){const prior=groups.get(x.selection.group);if(!prior||x.selection.power>prior.selection.power||x.selection.power===prior.selection.power&&x.selection.order>prior.selection.order)groups.set(x.selection.group,x);}
 return rows.filter(x=>!x.selection||groups.get(x.selection.group)===x);
}
export function ongoingSelected(state,effect){return !effect.selection||selectedOngoingEffects(state).includes(effect);}
export function accrueRoundCosts(state,{root,combat=false,minutes=0}={}){
 if(!(state.activeResourceEffects??[]).some(x=>x.endCost))return [];
 let keys;
 if(combat){
  if(!Number.isInteger(root?.round))throw Error('回合代价须实际战斗轮号');
  keys=['combat/'+(root.instanceId??root.id??'current')+'/'+root.round];
 }else{
  const previous=state.resourceUpkeepClock??0,next=previous+minutes*10;
  state.resourceUpkeepClock=next;
  keys=Array.from({length:Math.floor(next+1e-9)-Math.floor(previous+1e-9)+1},(_,i)=>'field/'+(Math.floor(previous+1e-9)+i));
 }
 const receipts=[];
 for(const x of selectedOngoingEffects(state))if(x.endCost?.clock==='effective-round'){
  const cost=x.accruedCost??={amount:0};
  for(const key of keys)if(cost.lastRound!==key){cost.amount+=x.endCost.amount;cost.lastRound=key;receipts.push({instanceId:x.id,amount:x.endCost.amount,roundKey:key});}
 }
 return receipts;
}
export function settleOngoingEnd(state,effect,{drawDice,reason='ended'}={}){
 releasePerceptions(state,effect.id,reason);
 if(!effect.endCost||!effect.accruedCost?.amount||effect.accruedCost.settled)return null;
 // Mark before cloning state; later callers cannot settle the same source twice.
 effect.accruedCost.settled=true;
 const amount=effect.accruedCost.amount;
 const out=resolveDamage(state,{amount,severity:effect.endCost.severity,kind:'physical',unavoidable:true,sourceId:effect.sourceId},[],{drawDice});
 Object.assign(state,out.state);
 return {instanceId:effect.id,sourceId:effect.sourceId,amount,severity:effect.endCost.severity,unavoidable:true,reason};
}

// A retained selection group may be global (existing time effects) or scoped
// to a real source, caster and cast grade. Consumers share this saved key.
export function retainedSelection(spec,{sourceId,casterId,grade,power,order}){
 return {...spec,group:spec.scope==='caster-grade'?JSON.stringify([spec.group,sourceId,casterId,grade]):spec.group,power,order};
}

export function nextResourceEffectSerial(state){
 const rows=[...(state.activeResourceEffects??[]),...Object.values(state.resourceTriggers??{})];
 const used=rows.map(x=>Number(/\/instance\/(\d+)$/.exec(x.id??'')?.[1]??0));
 return state.resourceEffectSerial=Math.max(state.resourceEffectSerial??0,...used)+1;
}
