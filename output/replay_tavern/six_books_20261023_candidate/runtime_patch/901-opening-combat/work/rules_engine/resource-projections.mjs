// Shared nonphysical scene objects. Storage ownership is not the effect target.
import {check,lifeStatus,statusLevel,spendAction} from './core.mjs';
import {effectMatches} from './resource-effects.mjs';
import {selectedOngoingEffects} from './resource-ongoing.mjs';
import {actualSenses} from './resource-senses.mjs';
import {collectImmunities,evaluateApplicability,effectGrade} from './resource-applicability.mjs';
import {obscuresSight} from './resource-obscuration.mjs';
import {detectionProtectionSources} from './resource-detection.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {clearLine,spatialDistance,canObserve,elevationAt} from './combat/map.mjs';
import {RuleInputError,IllegalAction} from './combat/mechanics.mjs';
import {assertSchema} from './rule-schema.mjs';
const need=(m,f)=>{throw new RuleInputError(m,f);};
const requireFact=(v,m)=>{if(!v)throw new IllegalAction(m);};
const point=p=>Array.isArray(p)&&[2,3].includes(p.length)&&p.every(Number.isFinite);
const spatialOf=root=>root.map||Number.isInteger(root.round)&&Object.values(root.actors??{}).some(a=>point(a.position))?root:root.ruleScene?.spatial;
const xyz=(p,map)=>[p[0],p[1],elevationAt(map,p)];
export function projectionInstances(root){
 return Object.values(root.actors??{}).flatMap(a=>selectedOngoingEffects(a.state).filter(e=>e.projection).map(effect=>({owner:a,effect})));
}
export function projectionInstance(root,ownerId,instanceId){
 const effect=selectedOngoingEffects(root.actors[ownerId]?.state??{}).find(e=>e.id===instanceId&&e.projection);
 if(!effect)need('须选择仍持续的实际幻象实例','projection.instanceId');return effect;
}
export function projectionPosition(root,effect){
 const p=effect.projection;if(!p.attachmentId)return p.position;
 const spatial=spatialOf(root),position=spatial?.actors?.[p.attachmentId]?.position??root.ruleScene?.physicalObjects?.[p.attachmentId]?.position;
 if(!point(position))need('附着物须有当前实际位置','projection.attachmentPosition');return position;
}
function spatial(root,id){
 const scene=spatialOf(root),position=scene?.actors?.[id]?.position;
 if(!scene||scene!==root&&!scene.source||!point(position))need('幻象操作须当前实际空间与位置来源','projection.spatial');return {scene,position};
}
// A programmed image senses observable events, never actor state or source identity.
const cueFields=new Set(['kind','words','objectId','operation','observedLabel','channel']);
function inspectCueCondition(condition){
 const bad=()=>need('预置条件只能引用实际可视/可听事件，不能读取隐藏状态或身份','projection.trigger');
 const value=v=>{if(v===null||['string','number','boolean'].includes(typeof v))return;if(!v||typeof v!=='object'||Object.keys(v).length!==1||!cueFields.has(v.context))bad();};
 if(typeof condition==='boolean')return;
 if(!condition||typeof condition!=='object'||Array.isArray(condition))bad();
 for(const key of ['all','any'])if(Object.hasOwn(condition,key)){if(Object.keys(condition).length!==1||!Array.isArray(condition[key])||!condition[key].length)bad();condition[key].forEach(inspectCueCondition);return;}
 if(Object.hasOwn(condition,'not')){if(Object.keys(condition).length!==1)bad();inspectCueCondition(condition.not);return;}
 if(!['eq','ne','gte','lte','in','present'].includes(condition.test)||Object.keys(condition).some(k=>!['test','left','right','values'].includes(k)))bad();
 value(condition.left);
 if(condition.test==='in'){if(!Array.isArray(condition.values))bad();condition.values.forEach(value);}
 else if(condition.test!=='present')value(condition.right);
}
function inspectDesign(plan,{allowAttachment=false,programmed=false}={}){
 const p=plan.projection;if(!p?.source||!point(p.position))need('须登记有来源的幻象位置和外观选择','projection.plan');
 if(p.size!==undefined&&(!Number.isSafeInteger(p.size)||p.size<1))need('幻象体积值须正整数','projection.size');
 if(p.appearance!==undefined&&(!p.appearance||typeof p.appearance.label!=='string'||!p.appearance.label.trim()||typeof p.appearance.description!=='string'))need('须登记幻象实际外观，不生成未知信息','projection.appearance');
 if(p.dimensions!==undefined&&(!Array.isArray(p.dimensions)||p.dimensions.length!==3||p.dimensions.some(n=>!Number.isFinite(n)||n<=0)))need('幻象空间边界须实际三维尺寸','projection.dimensions');
 if(p.attachmentId&&!allowAttachment)requireFact(false,'该来源未赋予附着真实物体的能力');
 if(programmed){
  if(!(p.playbackMinutes>0&&p.playbackMinutes<=5))need('须指定不超过5分钟的实际表演长度','projection.playbackMinutes');
  if(!p.trigger)need('预置幻影须实际可见/可听事件条件','projection.trigger');assertSchema(p.trigger,{type:'condition'},'projection.trigger');inspectCueCondition(p.trigger);
 }
 return p;
}
function validatePosition(root,casterId,p,range,{initial=false}={}){
 const {scene,position}=spatial(root,casterId);
 requireFact(spatialDistance(scene.map,position,p.position)<=range,'幻象创建或改变位置超出施法射程');
 if(initial)requireFact(clearLine(scene.map,position,p.position)&&clearLine(scene.map,position,p.position,{sight:true,root,observerId:casterId,spatial:scene}),'幻象设置位置须实际视线与效果线');
 if(p.attachmentId){const attached=scene.actors?.[p.attachmentId]??root.ruleScene?.physicalObjects?.[p.attachmentId];if(!point(attached?.position))need('贴图须实际附着物及位置','projection.attachmentId');requireFact(spatialDistance(scene.map,attached.position,p.position)<1e-6,'贴图位置须与实际附着目标一致');}
}
export function inspectProjectionCreation(root,casterId,spec,plan,value){
 const p=inspectDesign(plan,spec);validatePosition(root,casterId,p,value(spec.range),{initial:true});return p;
}
function designFits(p,projection){
 if(!p.appearance||!p.dimensions||p.size===undefined)return false;
 return projection.volumeUnit==='cubic-metres'?p.dimensions.reduce((n,x)=>n*x,1)<=projection.maximumSize:p.size<=projection.maximumSize;
}
function applyDesign(projection,p){
 Object.assign(projection,{position:structuredClone(p.position),dimensions:structuredClone(p.dimensions),size:p.size,appearance:structuredClone(p.appearance)});
 if(p.attachmentId)projection.attachmentId=p.attachmentId;else delete projection.attachmentId;
 projection.phase=projection.programmed?'armed':'visible';delete projection.proposal;
}
export function createProjection(spec,plan,value,{castTotal,grade}={}){
 const p=plan.projection,maximumSize=value(spec.maximumSize);
 if(maximumSize<1)return null;
 const out={kind:'illusion',family:'falseIllusion',range:value(spec.range),maximumSize,volumeUnit:spec.volumeUnit,castTotal:castTotal??null,allowAttachment:spec.allowAttachment===true,
  controlAction:spec.controlActions?.[grade]??null,touchReveals:spec.touchReveals===true,damageThreshold:spec.damageThreshold===undefined?null:value(spec.damageThreshold),
  channels:structuredClone(spec.channels),phase:'awaiting-design',position:structuredClone(p.position),disbelievedBy:{},observations:{},activationId:0};
 if(spec.programmed)out.programmed={trigger:structuredClone(p.trigger),playbackMinutes:p.playbackMinutes,cooldownMinutes:spec.programmed.cooldownMinutes,triggerRadius:value(spec.programmed.triggerRadius),dc:value(spec.programmed.dc),consumedCues:[]};
 if(designFits(p,out))applyDesign(out,p);else out.proposal=structuredClone(p);
 return out;
}
export function inspectProjectionControl(root,casterId,resourceId,plan,mode){
 const effect=projectionInstance(root,casterId,plan.instanceId),p=effect.projection;
 requireFact(effect.sourceId===resourceId&&effect.casterId===casterId,'只能操控本人实际施放的该来源');
 requireFact(mode==='complete'?p.phase==='awaiting-design':p.phase==='visible'&&!p.programmed,'当前实例不能执行该幻象操作');
 const design=inspectDesign(plan,p);validatePosition(root,casterId,design,p.range);
 requireFact(designFits(design,p),'外观选择超过实际施法结果允许的体积，须重新选择');
 if(mode!=='complete')requireFact(spatialDistance(spatial(root,casterId).scene.map,spatial(root,casterId).position,projectionPosition(root,effect))<=p.range,'当前幻象已超出可主动操控范围');
 if(plan.controlCheck&&(!plan.controlCheck.source||!plan.controlCheck.attribute||!plan.controlCheck.skill))need('操控判定须实际用途与属性/技能来源','projection.controlCheck');
 return effect;
}
export function controlProjection(root,casterId,resourceId,plan,mode,{combat=false,drawDice,preActionCleared=false}={}){
 let effect=inspectProjectionControl(root,casterId,resourceId,plan,mode),p=effect.projection;const actor=root.actors[casterId];
 const action=mode==='complete'?'free':p.controlAction;requireFact(!!action,'该来源没有主动操控能力');
 if(combat){const paid=spendAction(actor.state,action,{preActionCleared,context:{mentalAction:effect.grade==='C',...actor.statusPermission}});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;effect=projectionInstance(root,casterId,plan.instanceId);p=effect.projection;}
 const roll=plan.controlCheck?check(actor.state,{attribute:plan.controlCheck.attribute,skill:plan.controlCheck.skill,sub:plan.controlCheck.sub,dice:drawDice()}):null;
 applyDesign(p,plan.projection);
 return {op:'projectionControl',instanceId:effect.id,action,mode,...(roll?{roll,total:Math.min(p.castTotal,Math.max(0,roll.total)),castSuccessCap:p.castTotal}:{})};
}
function trueSightReveals(root,actor,effect){
 const grade=effectGrade(effect).level;if(grade===null||grade>3)return false;
 const scene=spatialOf(root),from=scene?.actors?.[actor.id]?.position,to=projectionPosition(root,effect);
 if(!point(from)||!point(to)||!clearLine(scene.map,from,to,{sight:true})||obscuresSight(root,actor.id,from,to,{spatial:scene}))return false;
 const distance=spatialDistance(scene.map,from,to);
 return Object.values(actualSenses(actor,root.actors[effect.casterId])).some(s=>s.source&&s.trueSight===true&&s.visual&&Number.isFinite(s.sensitiveRange)&&distance<=s.sensitiveRange);
}
export function inspectProjectionAttack(effect){
 if(!effect.projection.touchReveals){const e=new Error('Q51待裁定：无实体幻象没有既定防御/豁免，不能默认零防护生成伤害阈值回执');e.code='RULE_UNRESOLVED';e.field='projection.damageBasis';throw e;}
}
function projectionImmune(actor,effect,root){
 return !!root&&trueSightReveals(root,actor,effect)||actor.id===effect.casterId||!!effect.projection.disbelievedBy[actor.id]||evaluateApplicability({families:['falseIllusion','illusion'],grade:effect.grade},collectImmunities(actor.state,RESOURCE_DEFINITIONS)).status==='blocked';
}
export function projectionCanSense(root,actorId,effect,channel='visual'){
 const actor=root.actors[actorId],p=effect.projection;if(!actor||!['visible','playing'].includes(p.phase)||actor.state.sleeping||['dead','unconscious'].includes(lifeStatus(actor.state).state))return false;
 if(!p.channels.includes(channel))return false;
 if(channel==='visual'&&statusLevel(actor.state,'目眩').severe||channel==='auditory'&&statusLevel(actor.state,'耳鸣').severe)return false;
 if(channel==='auditory'&&!p.appearance?.sound)return false;
 const {scene,position}=spatial(root,actorId),to=projectionPosition(root,effect),distance=spatialDistance(scene.map,position,to);
 if(channel==='visual'&&scene.map?.darkness&&!(actor.darkvision>=distance)&&!trueSightReveals(root,actor,effect))return false;
 const senses=Object.values(actualSenses(actor,root.actors[effect.casterId])).filter(s=>channel==='visual'?s.visual:s.channel==='auditory');
 const eligible=senses.some(s=>distance<=Math.max(s.sensitiveRange??0,s.vagueRange??0));if(!eligible)return false;
 return clearLine(scene.map,position,to,{sight:channel==='visual',root,observerId:actorId,spatial:scene,ignoreProjectionId:effect.id});
}
function reveal(effect,actorId,source){effect.projection.disbelievedBy[actorId]={source,activationId:effect.projection.activationId};}
export function interactProjection(root,actorId,effect,{kind,damage=0,melee=false,source,witnesses=[]}={}){
 const p=effect.projection;requireFact(['visible','playing'].includes(p.phase),'当前无成形幻象可互动');
 const reveals=p.touchReveals&&(kind==='touch'||damage>0)||kind==='attack'&&(melee&&damage>0||damage>p.damageThreshold);
 if(!reveals)return {instanceId:effect.id,revealed:[],physicalDamage:0};
 const interactor=root.actors[actorId],conscious=interactor&&!interactor.state.sleeping&&!['dead','unconscious'].includes(lifeStatus(interactor.state).state);
 const revealed=[];if(conscious){reveal(effect,actorId,source);revealed.push(actorId);}
 // Tangible C projections reveal tactile inconsistencies only to the interactor.
 if(p.touchReveals)for(const witness of witnesses){
  if(!witness.source||witness.channel!=='visual'||witness.evidence!=='penetration'||!projectionCanSense(root,witness.actorId,effect,'visual'))continue;
  const scene=spatialOf(root),view={...root,map:scene.map,actors:Object.fromEntries(Object.entries(root.actors).map(([id,a])=>[id,{...a,position:scene.actors[id]?.position,state:{...a.state,activeResourceEffects:(a.state.activeResourceEffects??[]).filter(x=>x.id!==effect.id)}}]))};
  if(witness.interactionPosition)view.actors[actorId].position=witness.interactionPosition;
  try{if(!canObserve(view,view.actors[actorId],witness.actorId))continue;}catch(e){if(e.code==='NEEDS_INPUT')continue;throw e;}
  reveal(effect,witness.actorId,witness.source);revealed.push(witness.actorId);
 }
 return {instanceId:effect.id,revealed:[...new Set(revealed)],physicalDamage:0};
}
export function projectionEvent(root,actorId,event,{combat=false,drawDice,preActionCleared=false,eventId}={}){
 let effect=projectionInstance(root,event.ownerId,event.instanceId),p=effect.projection;const actor=root.actors[actorId];
 if(event.operation==='touch'){
  const {scene,position}=spatial(root,actorId);requireFact(spatialDistance(scene.map,position,projectionPosition(root,effect))<=Math.max(1.5,actor.reach??0)&&clearLine(scene.map,position,projectionPosition(root,effect)),'实际物理互动须能接触幻象位置');
  return interactProjection(root,actorId,effect,{kind:'touch',source:event.source,witnesses:event.witnesses});
 }
 if(event.operation==='cue'){
  requireFact(!!p.programmed,'该实例没有预设事件触发');const cue=event.cue;
  if(!point(cue?.position)||!['visual','auditory'].includes(cue.channel))need('触发须实际可视/可听事件的位置及通道','projection.cue');
  const {scene}=spatial(root,actorId),location=projectionPosition(root,effect),inRange=spatialDistance(scene.map,location,cue.position)<=p.programmed.triggerRadius;
  const visible=clearLine(scene.map,location,cue.position,{sight:cue.channel==='visual'});
  const protectedActor=cue.actorId&&root.actors[cue.actorId]&&detectionProtectionSources(root.actors[cue.actorId].state).some(x=>!x.suppressedBy.length);
  if(p.phase==='armed'&&inRange&&(cue.channel==='visual'&&(scene.map?.darkness||protectedActor)||cue.channel==='auditory'&&!visible)){
   (p.programmed.pendingCues??={})[eventId]={cue:structuredClone(cue),source:event.source,question:'Q50'};
   return {instanceId:effect.id,triggered:false,pending:{status:'rule_unresolved',question:'Q50',reason:'预置事件感知没有登记黑暗/反侦测/隔墙听觉口径'}};
  }
  if(p.programmed.consumedCues.includes(eventId))return {instanceId:effect.id,triggered:false};
  p.programmed.consumedCues.push(eventId);
  if(p.phase!=='armed'||!inRange||!visible||!effectMatches(p.programmed.trigger,{},Object.fromEntries(Object.entries(cue).filter(([key])=>cueFields.has(key)))))return {instanceId:effect.id,triggered:false};
  p.phase='playing';p.remainingPhaseMinutes=p.programmed.playbackMinutes;p.activationId++;
  return {instanceId:effect.id,triggered:true,activationId:p.activationId};
 }
 if(event.operation==='observe'){
  requireFact(!!p.programmed,'该幻象没有一般观察检定，须按其实际识破条件');
  requireFact(['visual','auditory'].includes(event.channel)&&['passive','active'].includes(event.mode),'须选择实际可用观察通道及主动/被动方式');
  requireFact(projectionCanSense(root,actorId,effect,event.channel),'当前感官不能观察这份幻象');
  if(projectionImmune(actor,effect,root)){reveal(effect,actorId,event.source);return {instanceId:effect.id,known:true};}
  const prior=p.observations[actorId];if(event.mode==='passive'&&prior?.activationId===p.activationId&&prior.passiveUsed)return {instanceId:effect.id,reused:true,receipt:structuredClone(prior)};
  if(event.mode==='active'&&combat){const paid=spendAction(actor.state,'move',{preActionCleared,context:{mentalAction:true,...actor.statusPermission}});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;effect=projectionInstance(root,event.ownerId,event.instanceId);p=effect.projection;}
  const roll=check(actor.state,{attribute:'感知',skill:'调查',sub:event.channel==='visual'?'侦查':'聆听',dice:drawDice()}),success=roll.total>=p.programmed.dc;
  p.observations[actorId]={activationId:p.activationId,passiveUsed:event.mode==='passive'||prior?.activationId===p.activationId&&prior.passiveUsed===true,channel:event.channel,mode:event.mode,roll,dc:p.programmed.dc,success,source:event.source};
  if(success)reveal(effect,actorId,event.source);
  return {instanceId:effect.id,action:event.mode==='active'?'move':null,...structuredClone(p.observations[actorId])};
 }
 need('尚未登记的幻象事件操作','projection.operation');
}
export function advanceProjectionClocks(state,minutes){
 for(const e of state.activeResourceEffects??[]){const p=e.projection;if(!p?.programmed||!['playing','dormant'].includes(p.phase))continue;
  let remaining=minutes;
  while(remaining>1e-9&&['playing','dormant'].includes(p.phase)){
   const step=Math.min(remaining,p.remainingPhaseMinutes);p.remainingPhaseMinutes-=step;remaining-=step;
   if(p.remainingPhaseMinutes<=1e-9){if(p.phase==='playing'){p.phase='dormant';p.remainingPhaseMinutes=p.programmed.cooldownMinutes;}else{p.phase='armed';delete p.remainingPhaseMinutes;}}
  }
 }
}
function segmentBox(from,to,position,dimensions,{eyes=false,map}={}){
 const a=xyz(from,map),b=xyz(to,map),p=xyz(position,map);if(eyes){a[2]+=1.5;b[2]+=1.5;}
 const lo=[p[0]-dimensions[0]/2,p[1]-dimensions[1]/2,p[2]],hi=[p[0]+dimensions[0]/2,p[1]+dimensions[1]/2,p[2]+dimensions[2]];
 let start=0,end=1;
 for(let i=0;i<3;i++){
  const v=b[i]-a[i];if(Math.abs(v)<1e-9){if(a[i]<=lo[i]||a[i]>=hi[i])return false;continue;}
  const x=(lo[i]-a[i])/v,y=(hi[i]-a[i])/v;start=Math.max(start,Math.min(x,y));end=Math.min(end,Math.max(x,y));if(start>=end-1e-9)return false;
 }
 return end>0&&start<1?{entry:Math.max(0,start),exit:Math.min(1,end)}:false;
}
export function projectionObscuresSight(root,observerId,from,to,{ignoreId}={}){
 const observer=root.actors?.[observerId];if(!observer?.state)return false;
 return projectionInstances(root).some(({effect})=>{
  const p=effect.projection;if(effect.id===ignoreId||!['visible','playing'].includes(p.phase)||!p.dimensions||projectionImmune(observer,effect,root))return false;
  const position=projectionPosition(root,effect);
  if(p.attachmentId&&Math.hypot(...xyz(to).map((n,i)=>n-xyz(position)[i]))<1e-6)return false;
  return segmentBox(from,to,position,p.dimensions,{eyes:true,map:spatialOf(root)?.map});
 });
}
export function projectionView(root,observerId){
 return projectionInstances(root).flatMap(({effect})=>{
  if(!projectionCanSense(root,observerId,effect,'visual'))return [];
  const p=effect.projection,known=projectionImmune(root.actors[observerId],effect,root);
  return [{id:'projection/'+effect.id,label:p.appearance.label,description:p.appearance.description,position:structuredClone(projectionPosition(root,effect)),dimensions:structuredClone(p.dimensions),...(p.attachmentId?{attachmentId:p.attachmentId}:{}),...(known?{recognizedIllusion:true}:{})}];
 });
}
export function projectionAppearance(root,actorId,observerId){
 const candidates=projectionInstances(root).filter(({effect})=>effect.projection.attachmentId===actorId&&['visible','playing'].includes(effect.projection.phase)&&!projectionImmune(root.actors[observerId],effect,root));
 const last=candidates.at(-1)?.effect.projection;return last?{name:last.appearance.label,description:last.appearance.description}:null;
}
export function projectionFeature(root,featureId){
 const effect=projectionInstances(root).find(x=>'projection/'+x.effect.id===featureId)?.effect;
 if(!effect||!['visible','playing'].includes(effect.projection.phase))return null;
 const p=effect.projection,at=projectionPosition(root,effect);
 return {id:featureId,label:p.appearance.label,kind:'obstacle',rect:[at[0]-p.dimensions[0]/2,at[1]-p.dimensions[1]/2,p.dimensions[0],p.dimensions[1]],projection:effect};
}
export function projectionMovementInteractions(root,actorId,path){
 const receipts=[];
 for(const {effect}of projectionInstances(root)){
  const p=effect.projection;if(!p.touchReveals||!['visible','playing'].includes(p.phase)||p.attachmentId||!p.dimensions)continue;
  for(let i=1;i<path.length;i++){
   const hit=segmentBox(path[i-1],path[i],projectionPosition(root,effect),p.dimensions,{eyes:true,map:spatialOf(root)?.map});if(!hit)continue;
   const position=xyz(path[i-1]).map((n,k)=>n+(xyz(path[i])[k]-n)*hit.entry);
   const witnesses=Object.keys(root.actors).filter(id=>id!==actorId).map(id=>({actorId:id,source:'js/actual-projection-crossing',channel:'visual',evidence:'penetration',interactionPosition:position}));
   receipts.push(interactProjection(root,actorId,effect,{kind:'touch',source:'js/actual-movement-through-projection',witnesses}));break;
  }
 }
 return receipts;
}
export function dispatchProjectionCue(root,actorId,cue){
 const projections=projectionInstances(root).filter(x=>x.effect.projection.programmed);if(!projections.length)return [];
 const actor=root.actors[actorId];actor.state.resourceSceneEventSerial=(actor.state.resourceSceneEventSerial??0)+1;
 const eventId='scene-cue/'+actorId+'/'+actor.state.resourceSceneEventSerial;
 return projections.map(({owner,effect})=>projectionEvent(root,actorId,{ownerId:owner.id,instanceId:effect.id,operation:'cue',source:'js/actual-scene-event',cue:{...cue,actorId}},{eventId}));
}
export function projectionWitnesses(root,actorId,position){
 return Object.keys(root.actors).filter(id=>id!==actorId).map(id=>({actorId:id,source:'js/actual-visible-penetration',channel:'visual',evidence:'penetration',...(position?{interactionPosition:position}:{})}));
}
// State-changing scheduler only; views and previews never draw recognition dice.
export function observeProjections(root,{drawDice}={}){
 const rows=[];
 for(const {owner,effect}of projectionInstances(root)){
  const p=effect.projection;if(!['visible','playing'].includes(p.phase))continue;
  for(const actor of Object.values(root.actors)){
   if(actor.present===false)continue;
   if(projectionCanSense(root,actor.id,effect,'visual')&&trueSightReveals(root,actor,effect)){if(!p.disbelievedBy[actor.id])reveal(effect,actor.id,'js/actual-true-sight');continue;}
   if(!p.programmed||projectionImmune(actor,effect,root)||p.observations[actor.id]?.activationId===p.activationId&&p.observations[actor.id].passiveUsed)continue;
   const channel=['visual','auditory'].find(channel=>projectionCanSense(root,actor.id,effect,channel));if(!channel)continue;
   const result=projectionEvent(root,actor.id,{ownerId:owner.id,instanceId:effect.id,operation:'observe',channel,mode:'passive',source:'js/actual-projection-observation'},{drawDice,combat:true});
   rows.push({observerId:actor.id,...result});
  }
 }
 return rows;
}
