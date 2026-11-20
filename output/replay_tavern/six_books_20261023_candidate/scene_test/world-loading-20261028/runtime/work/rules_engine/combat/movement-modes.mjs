import {walkingMultiplier} from '../resource-specializations.mjs';
import {effectiveAttribute} from '../core.mjs';
import {resourceCapabilityRows} from '../resource-lifecycle.mjs';
import {derived} from './mechanics.mjs';
import {statusLevel,statusPenaltyPoints,lifeStatus} from '../core.mjs';
import {limbMovement} from '../status-rules.mjs';
import {groundElevationAt,elevationAt,measureFlightPath,canObserve} from './map.mjs';
export function movementSpeed(actor,baseSpeed=derived(actor).speed,mode='land',{applyLandBonuses=mode==='land',ignoreStall=false,walkingCandidate=false}={}){
 const s=actor.state,points=t=>statusPenaltyPoints(s,t);
 const penalty=['麻痹','精神束缚','冻结','纠缠','晕眩','疲乏'].reduce((n,t)=>n+points(t),0);
 let speed=(points('纠缠')?Math.floor(baseSpeed/2):baseSpeed)-penalty;
 if(statusLevel(s,'目眩').severe&&!actor.windSense)speed-=Math.ceil(baseSpeed/2);
 if(statusLevel(s,'疲乏').severe)speed-=Math.ceil(baseSpeed/2);
 // PHB 生存状态:319: perfect manoeuvrability is unaffected by stall.
 if(!ignoreStall)speed=statusLevel(s,'失速').severe?0:Math.max(0,speed-points('失速')*20);
 const unconscious=actor.construct&&s.health.intact===0||!actor.diehard&&['dead','unconscious'].includes(lifeStatus(s).state)||lifeStatus(s).reason==='resource-condition'||lifeStatus(s).state==='dead'||['晕眩','剧痛'].some(t=>statusLevel(s,t).severe);
 if(['麻痹','精神束缚','纠缠','冻结'].some(t=>statusLevel(s,t).severe)||unconscious)speed=0;
 else if(!walkingCandidate&&s.timedEffects?.thunderPotion?.remainingMinutes>0)speed+=10;
 if(applyLandBonuses&&actor.landMultiplier)speed*=actor.landMultiplier;
 if(applyLandBonuses&&s.wizard?.form==='wind')speed+=20;
 speed=Math.max(0,limbMovement(s,speed,mode));
 if(mode==='land'&&applyLandBonuses&&!walkingCandidate){
  const multiplier=walkingMultiplier(actor);
  if(multiplier>1){
   // Other speed bonuses, land multipliers and modes keep their independent
   // ordinary candidate; they are never multiplied by the specialization.
   const native=effectiveAttribute(s,'力量')+effectiveAttribute(s,'敏捷')+(s.size??5);
   speed=Math.max(speed,movementSpeed(actor,native*multiplier,mode,{applyLandBonuses:false,ignoreStall,walkingCandidate:true}));
  }
 }
 return speed;
}
export function movementModes(actor){
 return resourceCapabilityRows(actor.state,'flight').filter(x=>x.movement?.mode==='flight'&&x.movement.maneuverability==='perfect').map(x=>({instanceId:x.instanceId,source:x.source,mode:'flight',maneuverability:'perfect',speed:x.movement.speedBasis==='current-land'?limbMovement(actor.state,movementSpeed(actor,derived(actor).speed,'land',{ignoreStall:true})*x.movement.speedMultiplier,'flight'):movementSpeed(actor,x.movement.speed,'flight',{ignoreStall:true})}));
}
export function inspectFlightMove(root,actor,command){
 const mode=movementModes(actor).find(x=>x.instanceId===command.movementSource);
 if(!mode){const e=new Error('须选择当前实际可用的飞行来源');e.code='UNAVAILABLE';throw e;}
 if(actor.state.grapple||actor.claws?.some(Boolean)){const e=new Error('空中牵带的负重与联动尚未接入，不能默认携带他人');e.code='UNAVAILABLE';throw e;}
 if(command.flightEnd!=='record'&&(command.motionObjectId!==undefined||command.motionPart!==undefined)){const e=new Error('速度记录选择须搭配flightEnd:record');e.code='UNAVAILABLE';throw e;}
 const path=measureFlightPath(root.map,actor.position,command.to,command.via);
 let endKinematics=null;
 if(command.flightEnd!==undefined){
  if(command.flightEnd==='hover')endKinematics={velocity:[0,0,0],source:'实际飞行动作明确结束悬停'};
  else if(command.flightEnd==='record'){
   const object=root.ruleScene?.objects?.[command.motionObjectId],fact=object?.plans?.[command.motionPart];
   if(object?.type!=='motionContext'||!object.source||!object.actorIds?.includes(actor.id)||!fact?.source||!Array.isArray(fact.position)||fact.position.length!==3||fact.position.some((v,i)=>v!==command.to[i])||!Array.isArray(fact.velocity)||fact.velocity.length!==3||!fact.velocity.every(Number.isFinite)){
    const e=new Error('持续运动须选择与实际终点对应的可信速度记录');e.code='NEEDS_INPUT';e.field='motion.velocity';throw e;
   }
   endKinematics={velocity:[...fact.velocity],source:fact.source};
  }else{const e=new Error('飞行结束只能明确悬停或选择实际速度记录');e.code='UNAVAILABLE';throw e;}
 }
 return {...mode,path,endKinematics};
}
export function commitFlightPosition(actor,map,position,instanceId,endKinematics){
 const ground=groundElevationAt(map,position),height=Math.max(0,elevationAt(map,position)-ground);
 const capability=actor.state.resourceCapabilities?.[instanceId];if(capability?.movement)capability.movement.used=true;
 actor.state.verticalPosition={heightAboveGround:height,groundElevation:ground,source:'resolved-movement/'+actor.id,...(height?{supportInstanceId:instanceId}:{})};
 actor.position=height||ground?[position[0],position[1],ground+height]:position.slice(0,2);
 delete actor.state.resourceDescent;delete actor.state.physicalMotion;delete actor.state.flightKinematics;
 if(endKinematics)actor.state.flightKinematics={...endKinematics,position:[...position],supportInstanceId:instanceId};
}
export function syncVerticalPosition(actor){
 const p=actor.state.verticalPosition;
 if(!p||!actor.position)return;
 if(!p.heightAboveGround)actor.position=p.groundElevation?[...actor.position.slice(0,2),p.groundElevation]:actor.position.slice(0,2);
 else if(Number.isFinite(p.groundElevation))actor.position=[...actor.position.slice(0,2),p.groundElevation+p.heightAboveGround];
}
export function flightCandidates(root,actor,abilityId){
 const result=[],from=[...actor.position.slice(0,2),elevationAt(root.map,actor.position)];
 for(const mode of movementModes(actor)){
  const budget=abilityId==='step'?Math.min(1.5,mode.speed):mode.speed;if(!budget)continue;
  const heightStep=Math.min(20,budget),targets=[[from[0],from[1],from[2]+heightStep],[from[0],from[1],Math.max(groundElevationAt(root.map,from),from[2]-heightStep)]];
  for(const t of Object.values(root.actors))if(t.id!==actor.id&&t.team!==actor.team&&canObserve(root,t,actor.id)){
   const to=[...t.position.slice(0,2),elevationAt(root.map,t.position)],length=Math.hypot(...to.map((v,i)=>v-from[i]));
   if(length)targets.push(to.map((v,i)=>from[i]+(v-from[i])*Math.min(1,Math.max(0,length-actor.reach)/length,budget/length)));
  }
  for(const to of targets)if(Math.hypot(...to.map((v,i)=>v-from[i]))>1e-8)result.push({actorId:actor.id,abilityId,movementSource:mode.instanceId,to,flightEnd:'hover'});
  for(const [motionObjectId,o]of Object.entries(root.ruleScene?.objects??{}))if(o.type==='motionContext'&&o.source&&o.actorIds?.includes(actor.id))for(const [motionPart,fact]of Object.entries(o.plans??{}))if(fact.source&&Array.isArray(fact.position)&&Array.isArray(fact.velocity))result.push({actorId:actor.id,abilityId,movementSource:mode.instanceId,to:fact.position,flightEnd:'record',motionObjectId,motionPart});
 }
 return result;
}
