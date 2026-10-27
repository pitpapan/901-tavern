import {observeResourceObscuration} from './resource-obscuration.mjs';
// Trusted scene selectors request a check; DP, rolls and results are computed
// from actual actors and saved. Templates contribute metadata, never state.
import {actualSenses} from './resource-senses.mjs';
import {checkProfile,rollCheckProfile,effectiveAttribute,attrAuto,lifeStatus,statusLevel} from './core.mjs';
import {actorCheckRules} from './gm_runtime/actor-rules.mjs';
import {clearLine,spatialDistance,elevationAt} from './combat/map.mjs';
import {recordPerception} from './resource-perception.mjs';
import {hidingMovementPenalty,recentSound} from './resource-discovery.mjs';
import {detectionLimit} from './resource-detection.mjs';
import {effectGrade} from './resource-applicability.mjs';
import {observationKey,perceptionEpoch,reusableObservation} from './resource-observation-state.mjs';
const need=(message,field)=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field=field;throw e;};
function pathCrosses(map,path,point,radius){
 if(!Array.isArray(path)||path.length<2)return false;
 const xyz=p=>[p[0],p[1],elevationAt(map,p)],q=xyz(point);
 for(let i=1;i<path.length;i++){
  const a=xyz(path[i-1]),b=xyz(path[i]),v=b.map((x,j)=>x-a[j]),length=v.reduce((n,x)=>n+x*x,0);
  const t=length?Math.max(0,Math.min(1,v.reduce((n,x,j)=>n+x*(q[j]-a[j]),0)/length)):0;
  if(Math.hypot(...a.map((x,j)=>x+t*v[j]-q[j]))<=radius)return true;
 }
 return false;
}
export function resolvePerceptionEvent(root,observerId,event,{drawDice,combat=false,actorTemplates={}}={}){
 const full=id=>{const a=root.actors[id];if(!a?.state)need('感知双方须有实际状态','perception.actors');return {...structuredClone(actorTemplates[id]??{}),...a,...structuredClone(a.combatCarry??{}),state:a.state,id};};
 const observer=full(observerId),target=full(event.targetId),spatial=combat?root:root.ruleScene?.spatial;
 if(!combat&&!spatial?.source)need('场外感知须有来源的实际空间','perception.spatial');
 const position=id=>combat?root.actors[id].position:spatial.actors[id]?.position;
 if(!Array.isArray(position(observerId))||!Array.isArray(position(target.id)))need('感知双方须实际位置','perception.positions');
 const key=event.senseSource??'vision',sense=structuredClone(actualSenses(observer,target)[key]);
 if(!sense?.source)need('未登记实际感官能力，不由事件授予','perception.senseSource');
 if(typeof sense.visual!=='boolean')need('感官来源须声明能否提供视觉','perception.sense.visual');
 const unavailable=reason=>{const old=observer.state.resourceDetectionContests?.[observationKey(target.id,sense.source)];if(old)old.precision='none';return {information:{detected:false,precision:null},blocked:reason};};
 if(target.spirit&&!observer.spiritSight&&!sense.spiritSight)return unavailable('no-spirit-sense');
 if(!!target.underground!==!!observer.underground&&!sense.underground)return unavailable('no-cross-ground-sense');
 const distance=spatialDistance(spatial.map,position(observerId),position(target.id));
 if(['dead','unconscious'].includes(lifeStatus(observer.state).state)||observer.state.sleeping||sense.visual&&statusLevel(observer.state,'目眩').severe)return unavailable('observer-incapacitated');
 if(sense.lineOfEffect&&!clearLine(spatial.map,position(observerId),position(target.id)))return unavailable('line-of-effect');
 observeResourceObscuration(root,{spatial});
 if(sense.visual&&!clearLine(spatial.map,position(observerId),position(target.id),{sight:true,root,observerId,spatial}))return unavailable('line-of-sight');
 if(sense.visual&&spatial.map?.darkness&&!(observer.darkvision>=distance)&&!(target.spirit&&observer.spiritSight))return unavailable('darkness');
 if(!Number.isFinite(sense.sensitiveRange))need('须实际敏感距离；没有敏感范围请明确0','perception.sensitiveRange');
 if(distance>sense.sensitiveRange&&!Number.isFinite(sense.vagueRange))need('敏感范围外须实际模糊感知距离','perception.vagueRange');
 const outsideRange=distance>Math.max(sense.sensitiveRange,sense.vagueRange??0);
 if(outsideRange){
  const path=event.movement?.path,stationary=event.movement?.actorId===observerId?position(target.id):event.movement?.actorId===target.id?position(observerId):null;
  if(!stationary||!pathCrosses(spatial.map,path,stationary,Math.max(sense.sensitiveRange,sense.vagueRange??0)))return unavailable('range');
 }
 sense.rangeBand=distance<=sense.sensitiveRange?'sensitive':'vague';sense.evaluateContest=true;
 const gate=detectionLimit(root,{observerId,targetId:target.id,sense:{...sense,contest:{source:'js/grade-preflight',concealmentWaived:true}}});
 const savedKey=observationKey(target.id,sense.source),epoch=perceptionEpoch(root,combat),old=observer.state.resourceDetectionContests?.[savedKey];
 if(event.mode==='hide'&&!(gate.protectionLevel>effectGrade(sense).level)){
  const cover=(spatial.map?.features??[]).some(f=>!f.destroyed&&Number.isFinite(f.size)&&f.size>=target.state.size*5&&!clearLine({...spatial.map,ruleBarriers:[],features:[f]},position(observerId),position(target.id),{sight:true}));
  if(!cover)return {skipped:'hiding-requires-stronger-protection-or-sized-obstruction'};
 }
 const sound=event.mode==='search'?recentSound(root,target.id):null;
 let contest,reused=false;
 if(!event.mode&&reusableObservation(root,observerId,target.id,sense,old,{combat})){contest=structuredClone(old.contest);reused=true;}
 else if(gate.automaticConcealment||gate.blocked){contest={source:'js/automatic-detection-grade',automatic:true};}
 else if(sense.automaticDetection||sound?.suppression==='unavoidable'){contest={source:sense.source,concealmentWaived:true,automaticDetection:!!sense.automaticDetection,...(sound?{sound:structuredClone(sound)}:{})};}
 else{
  const observerProfile=sense.observerCheck??{skill:Object.hasOwn(observer.state.skills??{},'调查')?'调查':'侦查',sub:sense.visual?'侦查':'聆听'};
  const targetProfile=sense.targetCheck??{skill:Object.hasOwn(target.state.skills??{},'隐藏')?'隐藏':'潜行',sub:sense.visual?'躲藏':'潜行'};
  const profileFor=(actor,attribute,profile,purpose)=>{
   attribute=profile?.attribute??attribute;
   if(!profile?.skill||Object.keys(profile).some(k=>!['attribute','skill','sub'].includes(k)))need('感官检定只接受实际技能选择，不接受外填数值','perception.profile');
   const request={attribute,...profile,purpose,targetId:actor.id===observerId?target.id:observerId},rules=actorCheckRules(actor,request);
   const movement=actor.id===target.id&&profile.sub==='躲藏'?hidingMovementPenalty(root,target.id,{active:event.mode==='search'}):{penalty:0};
   return {...checkProfile(actor.state,{attribute,...profile,modifier:(rules.modifier??0)-movement.penalty,context:{...rules.context,perception:actor.id===observerId,opposed:true}}),hidingMovement:movement};
  };
  const activeProfile=profileFor(observer,'感知',observerProfile,sense.visual?'visual':'listen');
  const waived=event.concealmentWaived===true||['dead','unconscious'].includes(lifeStatus(target.state).state)||target.state.sleeping,passiveProfile=waived?null:profileFor(target,'敏捷',targetProfile,'concealment');
  if(!activeProfile.eligible||passiveProfile&&!passiveProfile.eligible)need(activeProfile.reason??passiveProfile.reason,'perception.check');
  const first=rollCheckProfile(activeProfile,drawDice()),second=sound?.suppression==='possible'&&sense.rangeBand==='sensitive'?rollCheckProfile(activeProfile,drawDice()):null;
  const active=second&&second.total>first.total?second:first,passive=waived?null:rollCheckProfile(passiveProfile,drawDice());
  contest={source:'js/perception/'+event.source,observer:active,...(sound?{sound:structuredClone(sound)}:{}),...(second?{observerAttempts:[first,second]}:{}),...(waived?{concealmentWaived:true}:{target:passive,hidingMovement:passiveProfile.hidingMovement})};
 }
 if(event.mode)Object.assign(contest,{mode:event.mode,...(event.mode==='search'?{previousPrecision:event.previousPrecision??old?.precision??'none'}:{})});
 const record={epoch,targetId:target.id,senseSource:sense.source,selector:key,sense:structuredClone(sense),contest,seenLevels:[...new Set([...(old?.seenLevels??[]),effectGrade(sense).level])],source:event.source,positions:{observer:[...position(observerId)],target:[...position(target.id)]}};
 (observer.state.resourceDetectionContests??={})[savedKey]=record;
 if(outsideRange){record.precision='none';record.sense.outsideRange=true;return {information:{detected:false,precision:null},contest,reused,senseSource:sense.source,crossedRange:true};}
 const result=recordPerception(root,{observerId,targetId:target.id,sense:{...sense,contest},information:{detected:true,precision:sense.rangeBand==='sensitive'?'exact':'vague',position:[...position(target.id)]}},{combat});
 record.precision=result.detection?.precision??(result.pending?root.actors[target.id].state.resourcePerceptionQueue.find(x=>x.id===result.receiptId)?.information.precision:result.information?.precision)??'none';
 return {...result,contest,reused,senseSource:sense.source};
}
