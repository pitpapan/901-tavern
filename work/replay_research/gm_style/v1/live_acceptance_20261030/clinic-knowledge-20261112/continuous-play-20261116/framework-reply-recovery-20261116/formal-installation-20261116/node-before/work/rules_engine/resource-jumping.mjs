import {effectiveAttribute} from './core.mjs';
import {resourceBonus} from './resource-definitions.mjs';
const fail=(message,code='NEEDS_INPUT')=>{const e=new Error(message);e.code=code;e.field='jump.context';throw e;};
// Q9 adopted: numeric check only. Geometry and movement payments are separate
// consumers; a rolled distance never teleports the actor to a declared ledge.
export function jumpCheckContext(root,request){
 const object=root.ruleScene?.objects?.[request.objectId],plan=object?.plans?.[request.part];
 if(object?.type!=='checkContext'||!object.source||!object.actorIds?.includes(request.actorId)||!plan?.source||plan.purpose!=='jump')fail('跳跃须选择有来源、适用于本人的实际检定场景');
 if(!['long','high'].includes(plan.kind))fail('跳跃须明确跳高或跳远');
 if(request.attribute!=='力量'||request.skill!=='运动'||request.sub!=='跳跃')fail('跳跃使用力量＋运动·跳跃','UNAVAILABLE');
 if(plan.supportedTakeoff!==true)fail('跳跃须有实际可支撑的起跳表面','UNAVAILABLE');
 if(!plan.runUp?.source||!Number.isFinite(plan.runUp.meters)||plan.runUp.meters<0)fail('须有实际直线助跑距离；原地起跳明确登记0米');
 const state=root.actors[request.actorId].state,runUpMeters=plan.runUp.meters;
 const runUpDP=Math.min(effectiveAttribute(state,'力量'),Math.floor(runUpMeters));
 const treatedAsRunning=resourceBonus(state,'runningJump',{purpose:'jump'})>0;
 return {kind:plan.kind,source:plan.source,runUpSource:plan.runUp.source,runUpMeters,runUpDP,treatedAsRunning,
  successMultiplier:runUpMeters>0||treatedAsRunning?1:0.5};
}
export function resolveJumpDistance(roll,context){
 if(!roll.eligible)return roll;
 const total=roll.total*context.successMultiplier,distance=total*(context.kind==='high'?0.4:1.6);
 return {...roll,rawTotal:roll.total,total,...(roll.dc===undefined?{}:{success:total>=roll.dc}),
  jump:{...context,distance,...(context.kind==='long'?{apex:distance/4}:{}),movementApplied:false,rule:'用户2026-10-25 Q9；RE运动125–149'}};
}
