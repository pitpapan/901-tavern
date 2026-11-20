// Source-bound decoys are effect instances, never actors or the bearer's HP.
import {selectedOngoingEffects,settleOngoingEnd} from './resource-ongoing.mjs';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {clearLine,spatialDistance} from './combat/map.mjs';
import {visualIllusionSenses} from './resource-visual-illusions.mjs';
import {lifeStatus,statusLevel} from './core.mjs';
import {weightedDraw} from './rule-random.mjs';
export function createDecoys(spec,count,health){
 if(!Number.isSafeInteger(count)||count<0||!Number.isSafeInteger(health)||health<1)throw Error('诱饵数量/生命须非负数量及正整数生命');
 return {...spec,count,health,members:Array.from({length:count},(_,i)=>({id:i+1,remaining:health}))};
}
export function activeDecoys(state){return selectedOngoingEffects(state).filter(x=>x.decoys?.members.some(m=>m.remaining>0));}
function currentlyDisbelieved(root,attackerId,targetId,effect){
 const attacker=root.actors[attackerId],target=root.actors[targetId];
 if(evaluateApplicability({families:[effect.decoys.immunityFamily],grade:effect.grade},collectImmunities(attacker.state,RESOURCE_DEFINITIONS)).status==='blocked')return true;
 const candidates=visualIllusionSenses(attacker,target,effect);
 if(!candidates.length||attacker.state.sleeping||['dead','unconscious'].includes(lifeStatus(attacker.state).state))return false;
 const spatial=root.map?root:root.ruleScene?.spatial,from=spatial?.actors?.[attackerId]?.position,to=spatial?.actors?.[targetId]?.position;
 if(!Array.isArray(from)||!Array.isArray(to)){const e=new Error('幻术识破须对应实际感官的现场距离/视线，不能从侦测等级推定无限范围');e.code='NEEDS_INPUT';e.field='decoy.sensorySpatial';throw e;}
 const distance=spatialDistance(spatial.map,from,to);
 for(const sense of candidates){
  if(target.spirit&&!attacker.spiritSight&&!sense.spiritSight||!!target.underground!==!!attacker.underground&&!sense.underground)continue;
  if(sense.visual&&(target.hiddenFrom?.includes(attackerId)||statusLevel(attacker.state,'目眩').severe||!clearLine(spatial.map,from,to,{sight:true,root,observerId:attackerId,spatial})||spatial.map?.darkness&&!(attacker.darkvision>=distance)))continue;
  if(sense.lineOfEffect&&!clearLine(spatial.map,from,to))continue;
  if(Number.isFinite(sense.sensitiveRange)&&distance<=sense.sensitiveRange||Number.isFinite(sense.vagueRange)&&distance<=sense.vagueRange)return true;
  if(!Number.isFinite(sense.vagueRange)){const e=new Error('幻术识破范围外缺少该实际感官的模糊距离');e.code='NEEDS_INPUT';e.field='decoy.sensoryRange';throw e;}
 }
 return false;
}
function disbelieved(root,attackerId,targetId,effect){
 if(effect.decoys.disbelievedBy?.[attackerId])return true;
 if(!currentlyDisbelieved(root,attackerId,targetId,effect))return false;
 (effect.decoys.disbelievedBy??={})[attackerId]={source:'RE/幻术:15,21;实际相应感官或免疫',round:root.round??null};return true;
}
export function observeDecoyIllusions(root){
 if(!root.map)return;
 for(const target of Object.values(root.actors))for(const effect of activeDecoys(target.state))for(const observer of Object.values(root.actors)){
  if(!observer.present||observer.id===target.id)continue;
  try{disbelieved(root,observer.id,target.id,effect);}catch(error){if(error.code!=='NEEDS_INPUT')throw error;}
 }
}
function endEmptyGroup(state,effect,{drawDice}={}){
 if(effect.decoys.members.length)return;
 settleOngoingEnd(state,effect,{reason:'exhausted',drawDice});
 state.activeResourceEffects=state.activeResourceEffects.filter(x=>x.id!==effect.id);
}
export function redirectDecoyAttack(root,{attackerId,targetId,drawDice,targetMode='single'}={}){
 if(targetMode!=='single'||attackerId===targetId)return null;
 const effects=activeDecoys(root.actors[targetId].state).filter(x=>!disbelieved(root,attackerId,targetId,x));
 if(!effects.length)return null;
 const candidates=effects.flatMap(effect=>effect.decoys.members.filter(m=>m.remaining>0).map(member=>({effect,member})));
 const draw=weightedDraw(Array(candidates.length+1).fill(1),drawDice,{field:'decoy.dice'});
 const selected=draw.index?candidates[draw.index-1]:null;
 const receipt={targetMode,redirected:!!selected,remainingBefore:candidates.length,...draw,...(selected?{sourceId:selected.effect.sourceId,instanceId:selected.effect.id,memberId:selected.member.id}:{})};
 if(selected){selected.effect.decoys.members=selected.effect.decoys.members.filter(m=>m.id!==selected.member.id);endEmptyGroup(root.actors[targetId].state,selected.effect,{drawDice});}
 return receipt;
}
export function copyDecoyDamage(state,segments,{targetId,targetMode,drawDice}={}){
 if(!['area','multiple'].includes(targetMode))return [];
 const amount=segments.filter(x=>!x.unavoidable).reduce((n,x)=>n+x.amount,0);if(!amount)return [];
 return activeDecoys(state).map(effect=>{
  const changes=effect.decoys.members.map(m=>{const before=m.remaining;m.remaining=Math.max(0,before-amount);return {memberId:m.id,before,remaining:m.remaining,absorbed:before-m.remaining};});
  effect.decoys.members=effect.decoys.members.filter(m=>m.remaining>0);
  endEmptyGroup(state,effect,{drawDice});
  return {targetId,sourceId:effect.sourceId,instanceId:effect.id,targetMode,amount,changes,createsDamageEvent:false};
 });
}
