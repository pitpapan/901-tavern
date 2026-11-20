// Source-aware detection is a filter on actual sensory information, not a
// grant of line of sight, ordinary concealment checks or a second perception.
import {resourceCapabilityRows} from './resource-lifecycle.mjs';
import {selectedOngoingEffects} from './resource-ongoing.mjs';
import {effectGrade,evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
const need=(message,field,code='NEEDS_INPUT')=>{const e=new Error(message);e.code=code;e.field=field;throw e;};
export function detectionProtectionSources(state){
 const suppressed=selectedOngoingEffects(state).filter(e=>e.suppression?.family==='antiDetection');
 return resourceCapabilityRows(state,'antiDetection').map(row=>{
  const level=row.level??effectGrade(row).level;if(!Number.isInteger(level))need('反侦测来源须实际效果等级','detection.protectionGrade');
  const mentalLevel=row.mode==='mental'?effectGrade({grade:row.grade??level,gradeBonus:row.mentalGradeBonus??0}).level:null;
  if(row.mode==='mental'&&mentalLevel===null)need('心灵隐形须实际心灵效果等级','detection.mentalGrade');
  return {...row,level,mentalLevel,suppressedBy:suppressed.filter(e=>e.suppression.maximumLevel>=level).map(e=>e.id)};
 });
}
export function effectiveDetectionProtectionSources(state,observerState){
 return detectionProtectionSources(state).filter(x=>!x.suppressedBy.length&&(x.mode!=='mental'||evaluateApplicability({families:['mind'],grade:x.mentalLevel},collectImmunities(observerState,RESOURCE_DEFINITIONS)).status!=='blocked'));
}
export function detectionLimit(root,{observerId,targetId,sense}){
 const observer=root.actors[observerId],target=root.actors[targetId];
 if(!target?.state)return {precision:'exact',sources:[]};
 const channel=sense?.channel??(sense?.visual?'visual':'nonvisual');
 const sources=detectionProtectionSources(target.state).filter(x=>!x.suppressedBy.length&&(!x.channels||x.channels.includes(channel)));
 if(!sources.length&&!sense?.evaluateContest)return {precision:'exact',sources:[]};
 if(!observer?.state)need('侦测须实际观察者状态','detection.actors');
 if(!sense?.source)need('须实际侦测来源','detection.sense');
 const detection=effectGrade(sense).level;if(detection===null)need('须实际侦测等级','detection.grade');
 const active=sources.filter(x=>x.mode!=='mental'||evaluateApplicability({families:['mind'],grade:x.mentalLevel},collectImmunities(observer.state,RESOURCE_DEFINITIONS)).status!=='blocked');
 if(!active.length&&!sense.evaluateContest)return {precision:'exact',sources:[]};
 const mental=active.filter(x=>x.mode==='mental'),protection=Math.max(0,...active.map(x=>x.level)),comparison=mental.length?-1:Math.sign(detection-protection);
 const details={sources:active.map(x=>({sourceId:x.source,instanceId:x.instanceId,level:x.level,...(x.mentalLevel!==null?{mentalLevel:x.mentalLevel}:{})})),detectionLevel:detection,protectionLevel:protection};
 if(sense.mode==='penetration'&&active.some(x=>x.mode!=='mental'&&detection<x.level))return {...details,precision:'none',blocked:'penetration-grade'};
 if(mental.some(x=>x.mentalLevel>=3&&detection<x.mentalLevel))return {...details,precision:'none',automaticConcealment:true};
 if(!['sensitive','vague'].includes(sense.rangeBand))need('须当前感官的实际敏感或模糊范围','detection.rangeBand');
 const contest=sense.contest;
 if(!contest?.source||!(contest.concealmentWaived===true||Number.isFinite(contest.observer?.total)&&Number.isFinite(contest.target?.total)))need('须该感官实际侦查/隐藏对抗回执或已确认放弃隐藏','detection.contest');
 const won=contest.concealmentWaived===true||contest.observer.total>=contest.target.total;
 let precision=sense.rangeBand==='vague'?(won&&comparison>=0?'vague':'none'):won?(comparison>=0?'exact':'vague'):(comparison>0?'vague':'none');
 if(contest.mode==='search'){
  const levels=['none','vague','exact'],prior=Math.max(0,levels.indexOf(contest.previousPrecision)),maximum=mental.length||comparison<0?1:2;
  precision=levels[Math.min(maximum,prior+(won?1:0))];
 }
 if(sense.maximumPrecision==='vague'&&precision==='exact')precision='vague';
 return {...details,precision,observerWon:won};
}
export function filterDetectedInformation(information,limit){
 if(limit.precision==='exact')return structuredClone(information);
 // Vague location is not permission to reveal identity, stat readings or text.
 if(limit.precision==='none'||information.detected===false)return {detected:false,precision:null};
 return {detected:true,precision:'vague',...(information.position?{position:structuredClone(information.position)}:{})};
}
