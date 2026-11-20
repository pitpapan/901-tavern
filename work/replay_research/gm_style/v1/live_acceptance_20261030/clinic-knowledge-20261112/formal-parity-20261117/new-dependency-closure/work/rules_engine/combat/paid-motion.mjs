import {check} from '../core.mjs';
import {effectMatches,effectValue} from '../resource-effects.mjs';
import {resourceEffects} from '../resource-definitions.mjs';
import {changeWill} from '../resource-counters.mjs';
import {jumpCheckContext,resolveJumpDistance} from '../resource-jumping.mjs';
import {actorCheckRules} from '../gm_runtime/actor-rules.mjs';
import {integrateBallistic,firstBallisticContact,STANDARD_GRAVITY} from './ballistics.mjs';
import {elevationAt,groundElevationAt} from './map.mjs';
import {settleMotionImpacts,releasePaidMotion} from '../resource-motion.mjs';
const EPS=1e-8,point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
const fail=(message,code='UNAVAILABLE',field='jump.context')=>{const e=new Error(message);e.code=code;e.field=field;throw e;};
export function inspectJump(root,actor,command){
 if(actor.state.paidMotion?.phase==='airborne')fail('须续接当前跳跃，不能重新起跳掷骰');
 if(actor.state.verticalPosition?.heightAboveGround>0)fail('起跳须实际支撑面，不能空中重新起跳');
 if(actor.state.grapple||actor.claws?.some(Boolean))fail('牵带跳跃的联动消费者尚未接入');
 const request={actorId:actor.id,objectId:command.objectId,part:command.part,attribute:'力量',skill:'运动',sub:'跳跃',purpose:'jump'};
 const context=jumpCheckContext(root,request),plan=root.ruleScene.objects[command.objectId].plans[command.part];
 const position=[...actor.position.slice(0,2),elevationAt(root.map,actor.position)];
 if(!root.map||!point(plan.takeoff)||plan.takeoff.some((v,i)=>Math.abs(v-position[i])>EPS))fail('须选择与实际位置一致的起跳点','NEEDS_INPUT');
 if(context.kind==='long'&&(!Array.isArray(plan.direction)||plan.direction.length!==2||!plan.direction.every(Number.isFinite)||Math.hypot(...plan.direction)===0))fail('跳远须现场计划的水平方向','NEEDS_INPUT');
 if(plan.externalImpulse!==undefined)fail('外力发射尚未接入普通自主跳跃，不能冒充本人起跳');
 const rows=[...resourceEffects(actor.state,'check',{purpose:'jump',skill:'运动',sub:'跳跃',attribute:'力量',physical:true,motion:true}),...resourceEffects(actor.state,'attribute',{attribute:'力量'}),...resourceEffects(actor.state,'runningJump',{purpose:'jump'})].filter(e=>e.origin==='active'&&e.value>0);
 if(rows.some(e=>!e.casterId))fail('落地基线须明确实际临时强化来自本人还是外部来源','NEEDS_INPUT','jump.baselineSource');
 return {context,request,position,direction:context.kind==='high'?[0,0]:plan.direction.map(v=>v/Math.hypot(...plan.direction))};
}
export function beginPaidJump(root,actor,command,prepared,drawDice){
 const {context,request,position,direction}=prepared,derived=actorCheckRules(actor,request);
 const dice=drawDice(),options={attribute:'力量',skill:'运动',sub:'跳跃',modifier:derived.modifier,willpower:command.willpower,context:{...derived.context,physical:true,motion:true},dice};
 const roll=resolveJumpDistance(check(actor.state,{...options,modifierGroups:{enhancement:context.runUpDP}}),context);
 if(!roll.eligible)fail(roll.reason);
 // One underlying dice stream, no second draw or second will payment. Remove
 // the actual run-up contribution and use the actor's unassisted jump height.
 const nativeState=structuredClone(actor.state),excludedSources=[];
 nativeState.activeResourceEffects=(nativeState.activeResourceEffects??[]).map(active=>{
  if(!active.casterId||active.casterId===actor.id)return active;
  const effects=active.effects.filter(e=>{
   const ctx=e.stat==='attribute'?{attribute:'力量'}:e.stat==='runningJump'?{purpose:'jump'}:{...options.context,skill:'运动',sub:'跳跃',attribute:'力量'};
   const boost=['check','attribute','runningJump'].includes(e.stat)&&effectMatches(e.when,actor.state,ctx)&&effectValue(e.value,actor.state,ctx)>0;
   if(boost&&!excludedSources.includes(active.id))excludedSources.push(active.id);return !boost;
  });
  return {...active,effects};
 });
 const nativeContext=jumpCheckContext({...root,actors:{...root.actors,[actor.id]:{...actor,state:nativeState}}},request);
 const baselineRoll=resolveJumpDistance(check(nativeState,options),{...context,kind:'high',runUpMeters:0,runUpDP:0,successMultiplier:nativeContext.treatedAsRunning?1:.5});
 changeWill(actor.state,-(roll.willCost??0));
 const height=context.kind==='high'?roll.jump.distance:roll.jump.apex,v=Math.sqrt(2*STANDARD_GRAVITY*height);
 const horizontal=context.kind==='long'?v:0;
 const m={schemaVersion:'paid-motion/1',id:actor.id+'/jump/'+((actor.state.motionSequence??0)+1),kind:'jump',mode:context.kind,phase:roll.jump.distance>EPS?'airborne':'completed',
  source:context.source,position,velocity:[direction[0]*horizontal,direction[1]*horizontal,v],gravity:STANDARD_GRAVITY,elapsedSeconds:0,
  remainingDistance:roll.jump.distance,paidDistance:0,contactSequence:0,roll,baseline:{height:baselineRoll.jump.distance,roll:baselineRoll,excludedSources,source:'用户Q14/Q17/Q18：排除实际助跑和外部强化，保留本人有效资格与自身强化'},startPosition:[...position]};
 actor.state.motionSequence=(actor.state.motionSequence??0)+1;actor.state.paidMotion=m;
 return m;
}
export function previewPaidMotion(actor,budget,map){
 const m=actor.state.paidMotion;
 if(m&&m.schemaVersion!=='paid-motion/1')fail('该跳跃续算帧需要原执行版本或显式迁移','RULE_VERSION_MISMATCH');
 if(!m||!['airborne','completed'].includes(m.phase)||!Number.isFinite(budget)||budget<=0)fail('须有当前跳跃及可支付的移动距离');
 const distance=Math.min(budget,m.remainingDistance),horizontal=Math.hypot(m.velocity[0],m.velocity[1]);
 const seconds=m.mode==='long'?(horizontal?distance/horizontal:0):(m.velocity[2]-Math.sqrt(Math.max(0,m.velocity[2]**2-2*m.gravity*distance)))/m.gravity;
 const hit=seconds>EPS?firstBallisticContact(m.position,m.velocity,seconds,map,m.gravity):null;
 const duration=hit?Math.min(seconds,hit.time):seconds;
 const next=duration>EPS||hit?integrateBallistic(m,duration,map):{...m,contacts:[],grounded:true};
 const cost=m.mode==='long'?horizontal*duration:Math.max(0,next.position[2]-m.position[2]);
 const remainingDistance=Math.max(0,m.remainingDistance-cost),path=[[...m.position]];
 const apex=m.velocity[2]/m.gravity;
 if(apex>0&&apex<duration)path.push([m.position[0]+m.velocity[0]*apex,m.position[1]+m.velocity[1]*apex,m.position[2]+m.velocity[2]*apex/2]);
 path.push([...next.position]);
 return {motionId:m.id,body:{position:[...m.position],velocity:[...m.velocity],gravity:m.gravity},seconds:duration,budget,cost,next,remainingDistance,path,
  forecast:{remainingDistance,additionalMoveActions:Math.ceil(remainingDistance/budget),distanceBasis:m.mode==='long'?'horizontal':'ascent-only'}};
}
export function commitPaidMotion(actor,segment,{root,drawDice}={}){
 const m=actor.state.paidMotion;if(m?.id!==segment.motionId||m.phase==='interrupted')fail('跳跃续算来源已变化');
 const next=segment.next;
 Object.assign(m,{position:[...next.position],velocity:[...next.velocity],elapsedSeconds:next.elapsedSeconds,remainingDistance:segment.remainingDistance,paidDistance:m.paidDistance+segment.cost});
 m.phase=next.grounded||m.remainingDistance<=EPS||next.contacts.length?'completed':'airborne';
 const ground=next.grounded?next.position[2]:groundElevationAt(root.map,next.position);
 actor.position=next.grounded&&Math.abs(ground)<EPS?next.position.slice(0,2):[...next.position];
 actor.state.verticalPosition={heightAboveGround:Math.max(0,next.position[2]-ground),groundElevation:ground,source:m.source};
 const contacts=next.contacts.map(c=>({kind:'impact',...c,sequence:++m.contactSequence,sourceId:m.id,jumpBaselineHeight:c.grounded?m.baseline.height:0}));
 if(!next.grounded&&m.phase==='completed')releasePaidMotion(actor,'jump-descent');
 const impacts=settleMotionImpacts(actor,contacts,{root,drawDice});
 return {movement:{from:segment.path[0],to:[...actor.position],path:segment.path,length:segment.cost,cost:segment.cost,speed:segment.budget},jump:{...m.roll.jump,movementApplied:true,baseline:m.baseline,paidDistance:m.paidDistance,...segment.forecast},impacts};
}
