import {check,checkModifiers,lifeStatus} from './core.mjs';
import {damageEvent} from './combat/engine.mjs';
// PHB 生存状态 100–102: 3m per L, two metres per success, at most 20L;
// DR does not protect, physical/all-damage absorption still does.
export function resolveImpact(actor,height,{drawDice,root,sourceId}={}){
 const proxy={...actor.state,pendingFall:undefined};
 const options={attribute:'敏捷',skill:'运动',context:{motion:true,physical:true,fall:true}};
 let roll=null;
 if(height>=3&&!['dead','unconscious'].includes(lifeStatus(proxy).state)&&!proxy.sleeping&&checkModifiers(proxy,options).allowed){
  if(typeof drawDice!=='function'){const e=new Error('坠落减伤须实际敏捷＋运动判定骰源');e.code='NEEDS_INPUT';e.field='fall.dice';throw e;}
  roll=check(proxy,{...options,dice:drawDice()});
 }
 const reducedDistance=Math.max(0,height-2*(roll?.eligible?roll.total:0));
 const rawDamage=Math.min(20,Math.floor(reducedDistance/3)),result={damage:[]};
 const actualDamage=damageEvent(actor,[{amount:rawDamage,severity:'L',kind:'physical',energyType:'fall',damageType:'fall',ignoreDR:true,sourceId}],false,result,{conversion:0},{root,targetId:actor.id,drawDice,damageNature:'environment'});
 return {roll,reducedDistance,rawDamage,actualDamage,damage:result.damage};
}
export function resolvePendingFall(actor,{drawDice,root}={}){
 const pending=actor.state.pendingFall;if(!pending)return null;
 const result=resolveImpact(actor,pending.height,{drawDice,root,sourceId:pending.sourceId});
 actor.state.verticalPosition.heightAboveGround=0;delete actor.state.verticalPosition.supportInstanceId;delete actor.state.pendingFall;
 return {kind:'fall',...pending,...result};
}
