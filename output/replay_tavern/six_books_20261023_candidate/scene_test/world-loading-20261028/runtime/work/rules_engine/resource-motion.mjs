import {lifeStatus,statusLevel} from './core.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {integrateBallistic,firstBallisticContact,STANDARD_GRAVITY} from './combat/ballistics.mjs';
import {resolveImpact} from './resource-falling.mjs';
import {groundElevationAt} from './combat/map.mjs';
const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
const need=(message,field)=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field=field;throw e;};
export function hasLostFlightControl(actor){
 const state=actor.state,life=lifeStatus(state);
 return life.state==='dead'||life.reason==='resource-condition'||!actor.diehard&&life.state==='unconscious'||actor.construct&&state.health.intact===0||statusLevel(state,'晕眩').severe||statusLevel(state,'剧痛').severe;
}
export function releasePaidMotion(actor,kind='jump-interrupted'){
 const m=actor.state.paidMotion;if(!m)return null;
 if(kind==='jump-interrupted')m.phase='interrupted';
 const position=actor.position?.length===3?[...actor.position]:null;
 if(!position||!(actor.state.verticalPosition?.heightAboveGround>0))return null;
 const out={lossId:m.id+'/'+kind,phase:'ballistic',kind,source:m.source,sourceId:m.id,position,velocity:[...m.velocity],gravity:m.gravity,elapsedSeconds:0,contactSequence:0,jumpBaselineHeight:m.baseline.height};
 actor.state.physicalMotion=out;return out;
}
export function syncAutonomousFlight(actor){
 if(actor.state.paidMotion?.phase==='airborne'&&hasLostFlightControl(actor))return releasePaidMotion(actor);
 const s=actor.state,p=s.verticalPosition,key=p?.supportInstanceId;
 if(!(p?.heightAboveGround>0)||!key||!hasLostFlightControl(actor))return null;
 const cap=s.resourceCapabilities?.[key];
 const declared=RESOURCE_DEFINITIONS[cap?.source]?.programs?.cast?.steps?.find(x=>x.op==='capability'&&x.id===cap.id)?.movement;
 if((cap?.movement?.control??declared?.control)!=='autonomous')return null;
 const sample=s.flightKinematics,valid=point(sample?.position)&&point(sample?.velocity)&&sample.source&&sample.supportInstanceId===key&&point(actor.position)&&sample.position.every((v,i)=>Math.abs(v-actor.position[i])<1e-7);
 const lossId=(actor.id??'actor')+'/flight-loss/'+((s.motionSequence??0)+1);s.motionSequence=(s.motionSequence??0)+1;
 const motion={lossId,phase:valid?'ballistic':'needs-velocity',kind:'flight-loss',instanceId:key,sourceId:cap.source,casterId:cap.casterId,
  position:point(actor.position)?[...actor.position]:null,gravity:STANDARD_GRAVITY,elapsedSeconds:0,contactSequence:0,source:'用户Q8/Q11/Q12：自主飞行失控',
  ...(valid?{velocity:[...sample.velocity],velocitySource:sample.source}:{})};
 s.physicalMotion=motion;delete p.supportInstanceId;delete s.resourceDescent;
 return motion;
}
// A sourced scene fact can repair missing historical velocity. It must refer
// to the actual loss position, not provide a new destination or numeric bonus.
export function materializeDescentFall(actor,{map}={}){
 const s=actor.state,pending=s.pendingFall;if(!['descent-handoff','flight-end'].includes(pending?.kind))return null;
 const p=s.verticalPosition,xy=actor.position;
 if(!Array.isArray(xy)||xy.length<2||!xy.slice(0,2).every(Number.isFinite))need('缓降交接须实际平面位置','motion.position');
 const ground=p.groundElevation??(map?groundElevationAt(map,xy):undefined);
 if(!Number.isFinite(ground))need('缓降交接须实际地面标高','motion.geometry');
 const position=[xy[0],xy[1],ground+pending.height],record=pending.handoff;
 // The magic descent changes z, but never licenses borrowing an old horizontal
 // sample from elsewhere. Legacy records without that evidence need facts.
 const valid=point(record?.position)&&point(record?.velocity)&&record.source&&Number.isFinite(record.heightAtStart)&&record.position.slice(0,2).every((v,i)=>Math.abs(v-xy[i])<1e-7)&&Math.abs(record.position[2]-(ground+record.heightAtStart))<1e-7;
 const sample=valid?record:null;
 const descent=pending.kind==='descent-handoff',kind=descent?'descent-end':'flight-end';
 const lossId=(actor.id??'actor')+'/'+kind+'/'+((s.motionSequence??0)+1);s.motionSequence=(s.motionSequence??0)+1;
 s.physicalMotion={lossId,phase:sample?'ballistic':'needs-velocity',kind,instanceId:pending.instanceId,sourceId:pending.sourceId,casterId:pending.casterId,position,gravity:STANDARD_GRAVITY,elapsedSeconds:0,contactSequence:0,...(descent?{velocityConstraint:'vertical-zero'}:{}),source:descent?'用户Q15：缓降结束交接':'来源飞行支撑结束，按Q11/Q12保留实际速度',...(sample?{velocity:[...sample.velocity],velocitySource:sample.source}:{})};
 actor.position=[...position];p.groundElevation=ground;delete s.pendingFall;
 return s.physicalMotion;
}
export function supplyMotionVelocity(actor,fact){
 const m=actor.state.physicalMotion;
 if(m?.phase!=='needs-velocity'||fact?.lossId!==m.lossId||!fact?.source||!point(fact.velocity)||!point(fact.position)||!m.position||fact.position.some((v,i)=>Math.abs(v-m.position[i])>1e-7))need('须与实际失控位置对应的可信初速度记录','motion.velocity');
 if(m.velocityConstraint==='vertical-zero'&&fact.velocity[2]!==0)need('Q15缓降结束的垂直初速度为零；只补实际水平运动事实','motion.velocity');
 m.velocity=[...fact.velocity];m.velocitySource=fact.source;m.phase='ballistic';return m;
}
function readyMotion(actor,root,map){
 materializeDescentFall(actor,{map});
 syncAutonomousFlight(actor);
 const m=actor.state.physicalMotion;if(!m||m.phase==='grounded')return null;
 if(m.phase==='needs-velocity'){
  const facts=Object.values(root?.ruleScene?.objects??{}).filter(o=>o.type==='motionContext'&&o.source&&o.actorIds?.includes(actor.id)).flatMap(o=>Object.values(o.plans??{})).filter(f=>f.lossId===m.lossId);
  if(facts.length===1)supplyMotionVelocity(actor,facts[0]);
 }
 if(m.phase==='needs-velocity')need('旧飞行记录没有瞬时速度；须补实际悬停或运动事实，不能从移动距离倒推','motion.velocity');
 if(!map)need('物理推进须当前实际场景地形','motion.geometry');
 return m;
}
// Reuse existing duration fields. The boundary is a clock slice, not a new
// registry or a stored action budget. Contact and expiry share the same clock.
export function motionTimeSlice(actor,seconds,{root,map=root?.map??root?.ruleScene?.spatial?.map,combatTick=false}={}){
 const m=readyMotion(actor,root,map);
 const s=actor.state;
 const rows=[...(s.activeResourceEffects??[]),...['resourceCapabilities','resourceTriggers','resourceAuras','resourceChannels','temporaryHealthPools'].flatMap(k=>Object.values(s[k]??{})),
  ...Object.values(s.timedEffects??{}).filter(x=>!combatTick||!x.clockActorId),...(s.statuses??[]).filter(x=>!combatTick||!x.clockActorId),
  ...Object.values(actor.durationCarry??{}),...(s.possessions?.items??[]).flatMap(i=>i.resourceEffects??[])];
 const descent=s.resourceDescent;
 let slice=descent?Math.min(seconds,Math.max(0,(descent.intervalMinutes-descent.elapsedMinutes)*60)):seconds;
 for(const row of rows){const deadline=Math.min((row.remainingMinutes??Infinity)*60,(row.remainingRounds??Infinity)*6);if(deadline>1e-8)slice=Math.min(slice,deadline);}
 if(!m)return slice;
 const contact=firstBallisticContact(m.position,m.velocity,slice,map,m.gravity);
 return contact?Math.min(slice,contact.time):slice;
}
export function settleMotionImpacts(actor,contacts,{root,drawDice}={}){
 return contacts.map(contact=>({...contact,...resolveImpact(actor,Math.max(0,contact.equivalentHeight-Math.min(contact.jumpBaselineHeight??0,contact.groundEquivalentHeight??contact.equivalentHeight)),{drawDice,root:root?{...root,actors:{...root.actors,[actor.id]:actor}}:undefined,sourceId:contact.sourceId})}));
}
export function advancePhysicalMotion(actor,seconds,{root,map=root?.map??root?.ruleScene?.spatial?.map,drawDice,deferImpacts=false}={}){
 const m=readyMotion(actor,root,map);if(!m)return [];
 const next=integrateBallistic(m,seconds,map),events=[];
 for(const contact of next.contacts){
  events.push({kind:'impact',sequence:++m.contactSequence,sourceId:m.sourceId,...contact,...(contact.grounded&&m.jumpBaselineHeight!==undefined?{jumpBaselineHeight:m.jumpBaselineHeight}:{})});
 }
 actor.state.physicalMotion=m; // Damage resolution may replace state with a cloned value.
 Object.assign(m,{position:next.position,velocity:next.velocity,elapsedSeconds:next.elapsedSeconds,phase:next.grounded?'grounded':'ballistic'});
 const ground=next.grounded?next.position[2]:groundElevationAt(map,next.position);
 actor.state.verticalPosition={heightAboveGround:Math.max(0,next.position[2]-ground),groundElevation:ground,source:m.source,
  ...(next.grounded?{supportFeatureId:next.contacts.at(-1)?.featureId}:{})};
 actor.position=next.grounded&&Math.abs(ground)<1e-8?next.position.slice(0,2):[...next.position];
 return deferImpacts?events:settleMotionImpacts(actor,events,{root,drawDice});
}
