// Ordinary physical-object use/checks consume current saved utility capabilities.
import {check,spendAction} from '../core.mjs';
import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
import {spatialDistance} from '../combat/map.mjs';
import {objectEnvironment,objectPosition} from './resource-object-program.mjs';
const need=(m,f)=>{throw new RuleInputError(m,f);};
const requireFact=(x,m)=>{if(!x)throw new IllegalAction(m);};
export function runPhysicalObjectUse(root,r,{combat=false,preActionCleared=false,drawDice}={}){
 const o=root.ruleScene?.objects?.[r.objectId];if(o?.type!=='physicalObject')return null;
 requireFact(['use','check'].includes(r.operation),'实际物体只支持已登记use/check操作');
 const actor=root.actors[r.actorId],p=o.plans?.[r.part],s=actor.state;
 if(!p?.source?.trim()||!o.state?.object)need('物体操作须有实际状态和已登记计划','object.use');
 requireFact(['standard','move','swift','free','full'].includes(p.action),'物体计划须登记实际动作种类');
 if(combat)requireFact(root.activeId===r.actorId,'须在自己的行动中使用物体');
 if(o.state.object.holderId!==r.actorId){
  const reach=actor.reach??p.touchRange;
  const distance=combat?spatialDistance(root.map,actor.position,objectPosition(root,o)):p.distance;
  if(!Number.isFinite(reach)||!Number.isFinite(distance))need('物体操作须有实际触及距离','object.reach');
  requireFact(distance<=reach,'物体超出实际触及距离');
 }
 const use=p.use;
 if(!use||typeof use.underwater!=='boolean'||typeof use.requiresSound!=='boolean')need('物体计划须登记实际水下与发声条件','object.environment');
 for(const k of ['waterPenalty','foggingPenalty'])if(!Number.isFinite(use[k])||use[k]<0)need('物体环境减值须为已登记非负数','object.'+k);
 const environment=objectEnvironment(root,r.objectId,{underwater:use.underwater,waterPenalty:use.waterPenalty});
 requireFact(!(use.requiresSound&&environment.soundSuppressed),'该物体已被静音，不能完成要求它发声的用途');
 const waterPenalty=use.underwater?environment.waterPenalty:0,fogPenalty=environment.resistsFog?0:use.foggingPenalty;
 const spec=p.check;if(r.operation==='check'&&!spec)need('物体检定须登记实际技能与难度','object.check');
 if(spec&&(!Number.isFinite(spec.modifier??0)||!Number.isSafeInteger(spec.dc)||spec.dc<0||!spec.attribute||!spec.skill))need('物体检定须有完整实际属性、技能和难度','object.check');
 if(combat){const paid=spendAction(s,p.action,{preActionCleared});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;}
 let roll;
 if(spec){roll=check(actor.state,{attribute:spec.attribute,skill:spec.skill,sub:spec.sub,modifier:(spec.modifier??0)-waterPenalty-fogPenalty,dice:drawDice()});requireFact(roll.eligible,roll.reason);}
 return {objectId:r.objectId,operation:r.operation,action:p.action,environment,waterPenalty,fogPenalty,soundProduced:use.requiresSound, ...(roll?{check:roll,success:roll.total>=spec.dc,dc:spec.dc}:{used:true})};
}
