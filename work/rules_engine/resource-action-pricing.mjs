// Read-only quotes; optional reductions and mandatory increases share payment.
import {selectedOngoingEffects} from './resource-ongoing.mjs';
export function actionSlotAP(kind){
 const costs={free:0,opportunity:0,swift:2,move:4,fiveFootStep:4,standard:6,attack:6,full:10,charge:10};
 if(Array.isArray(kind))return kind.reduce((n,k)=>n+actionSlotAP(k),0);
 if(kind===undefined)return undefined;
 if(!Object.hasOwn(costs,kind))throw Error('没有已登记的动作槽价格：'+kind);
 return costs[kind];
}
const band=n=>Math.ceil(n/2)*2;
function prices(state,{action,family,roundKey,kind}){
 if(!roundKey||actionSlotAP(kind)===0)return [];
 const offers=[];
 for(const effect of selectedOngoingEffects(state)){
  const rule=effect.actionPrice;
  if(!rule||rule.family!==family)continue;
  const slots=actionSlotAP(kind),declared=rule.baseByAction[action];
  const baseAP=declared!==undefined&&(slots===undefined||band(declared)===slots)?declared:slots;
  if(baseAP===undefined)continue;
  const quotaKey=rule.quotaKey??effect.sourceId,prior=state.resourceActionUsage?.[quotaKey],used=prior?.roundKey===roundKey?prior.used:0;
  if(used>=rule.perRound)continue;
  const discount=rule.discount??0,surcharge=rule.surcharge??0,ap=Math.max(rule.minimumAP,baseAP-discount+surcharge);
  if(![baseAP,ap,discount,surcharge,rule.perRound,rule.minimumAP].every(Number.isInteger)||ap<1||discount<0||surcharge<0||rule.perRound<1)throw Error('动作定价缺少可执行的价/额度');
  offers.push({sourceId:effect.id,resourceId:effect.sourceId,sourceVersion:effect.version,action,family,kind,baseAP,discount,surcharge,minimumAP:rule.minimumAP,mandatory:Object.hasOwn(rule,'surcharge'),ap,quotaKey,roundKey,used});
 }
 return offers;
}
export const actionPriceOffers=(state,request)=>prices(state,request).filter(x=>!x.mandatory);
export function quoteActionPrice(state,request){
 if(actionSlotAP(request.kind)===0)return null;
 const rows=prices(state,request),selected=request.sourceId?rows.find(x=>x.sourceId===request.sourceId&&!x.mandatory):null;
 if(request.sourceId&&!selected){const e=new Error('没有本动作适用的实际减费来源或本轮额度已用');e.code='UNAVAILABLE';throw e;}
 const applied=[...(selected?[selected]:[]),...rows.filter(x=>x.mandatory)];
 if(!applied.length)return null;
 const baseAP=applied[0].baseAP;if(applied.some(x=>x.baseAP!==baseAP))throw Error('同一实际行动的原动作价不一致');
 const ap=Math.max(...applied.map(x=>x.minimumAP),baseAP+applied.reduce((n,x)=>n+x.surcharge-x.discount,0));
 return {...(selected??applied[0]),sourceId:selected?.sourceId,ap,mandatory:applied.some(x=>x.mandatory),applied};
}
export function consumeActionPrice(state,quote){
 const current=quoteActionPrice(state,quote);
 if(!current||current.ap!==quote.ap||JSON.stringify(current.applied)!==JSON.stringify(quote.applied))throw Error('动作报价已变化');
 for(const row of current.applied)(state.resourceActionUsage??={})[row.quotaKey]={roundKey:row.roundKey,used:row.used+1,sourceId:row.resourceId,sourceVersion:row.sourceVersion};
}
export const combatRoundKey=root=>Number.isInteger(root.round)?'combat/'+(root.instanceId??root.id??'current')+'/'+root.round:null;
