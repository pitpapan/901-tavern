// Resource death is a persisted transition, not a repeated query of a corpse.
import {lifeStatus,syncResourceHealth} from './core.mjs';
import {selectedTriggerKeys} from './resource-trigger-lifecycle.mjs';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {queueAutomaticEvent,stampAutomaticResourceEvents} from './resource-automatic-events.mjs';
import {selectedOngoingEffects} from './resource-ongoing.mjs';
import {effectGrade} from './resource-applicability.mjs';
import {recordSceneEffectUse} from './resource-turn-order.mjs';
import {syncActorWounds,ensureWoundLedger,transitionWoundShare} from './resource-wounds.mjs';
const applies=(state,t)=>!t.applicability||evaluateApplicability(t.applicability,collectImmunities(state,RESOURCE_DEFINITIONS)).status!=='blocked';
export function accrueEffectiveTriggerRounds(root,actorId){
 const state=root.actors[actorId].state,selected=selectedTriggerKeys(state);
 const key=Number.isInteger(root.round)?'combat/'+(root.instanceId??root.id??'current')+'/'+root.round:'field/'+Math.floor((state.resourceEffectiveClock??state.recoveryClock?.minutes??0)*10+1e-9);
 for(const id of selected){const t=state.resourceTriggers[id];if(!t.onDeath||!applies(state,t))continue;
  if(t.effectiveRoundKey!==key){t.effectiveRounds=(t.effectiveRounds??0)+1;t.effectiveRoundKey=key;}
 }
}
export function settleResourceDeaths(root){
 const changes=[];
 for(const [actorId,actor]of Object.entries(root?.actors??{})){
  if(actor.resourceSourceUnavailable===true)continue; // source-only placeholder, never an actual creature
  const s=actor.state;
  if(lifeStatus(s).state!=='dead'||s.resourceDeathHandled)continue;
  accrueEffectiveTriggerRounds(root,actorId);
  const selected=selectedTriggerKeys(s);let queued=0;
  for(const id of selected){const t=s.resourceTriggers[id];if(!t.onDeath||!applies(s,t))continue;
   const snapshot={...structuredClone(t.onDeath),sourceId:t.sourceId,sourceVersion:t.version,casterId:t.casterId,grade:t.rank,schools:t.schools,skill:t.skill,sub:t.sub,
    variables:{...structuredClone(t.variables),effectiveRounds:t.effectiveRounds??0},check:null};
   queueAutomaticEvent(s,{instanceId:t.id??id,sourceId:t.sourceId,casterId:t.casterId,reason:'death',sourceOrder:t.sourceOrder??t.selection?.order,snapshot});queued++;
  }
  for(const e of selectedOngoingEffects(s))if(e.deathRecovery){
   queueAutomaticEvent(s,{instanceId:e.id,sourceId:e.sourceId,casterId:e.casterId,reason:'death',sourceOrder:e.sourceOrder??e.selection?.order,
    snapshot:{sourceId:e.sourceId,sourceVersion:e.version,casterId:e.casterId,grade:e.grade,recovery:structuredClone(e.deathRecovery)}});queued++;
  }
  // RE life 99: timed effects end; condition points and owned resources remain.
  s.resourceDeathHandled=true;s.health.dead=true;
  const timed=x=>x.scene===true||x.remainingRounds!==undefined||x.remainingMinutes!==undefined||x.expiresOn||x.auraId||x.temporaryHealthId;
  s.resourceTriggers={};s.activeResourceEffects=(s.activeResourceEffects??[]).filter(x=>x.targetScope==='scene'||!timed(x));s.resourceCapabilities=Object.fromEntries(Object.entries(s.resourceCapabilities??{}).filter(([,x])=>!timed(x)));s.resourceAuras={};s.resourceChannels={};s.temporaryHealthPools={};delete s.temporaryHealthSource;s.health.temp=0;
  s.timedEffects={};s.checkEffects=(s.checkEffects??[]).filter(x=>x.permanent===true);s.attributeDamage=Object.fromEntries(Object.keys(s.attributeDamage??{}).map(k=>[k,0]));
  syncResourceHealth(s);
  for(const record of Object.values(root.actors))record.state.activeResourceEffects=(record.state.activeResourceEffects??[]).filter(e=>e.projection?.attachmentId!==actorId);
  stampAutomaticResourceEvents(root,actorId);changes.push({actorId,death:true,automaticQueued:queued});
 }
 return changes;
}

const available=(s,sourceId,maximum)=>maximum===undefined||(s.resourceSceneUsage?.[sourceId]?.used??0)<maximum;
const level=grade=>{const n=effectGrade({grade}).level;if(n===null){const e=new Error('死亡效果须实际来源等级');e.code='NEEDS_INPUT';e.field='death.grade';throw e;}return n;};
// Called at the actual lethal damage segment, before death subscriptions lock.
export function recordLethalRestriction(state,damage,{wasDead=false,casterId}={}){
 if(wasDead||lifeStatus(state).state!=='dead'||!damage.deathRestriction)return;
 (state.resourceDeathRestrictions??=[]).push({sourceId:damage.sourceId,casterId,grade:damage.grade,maximumLevel:damage.deathRestriction.maximumLevel,reason:'lethal-damage'});
}
export function resolveDeathRecovery(actor,snapshot,{drawDice}={}){
 const s=actor.state,recovery=snapshot.recovery;
 if(lifeStatus(s).state!=='dead')return {recovered:false,skipped:'already-alive'};
 if(!available(s,snapshot.sourceId,recovery.maximum))return {recovered:false,skipped:'scene-quota'};
 const blockers=(s.resourceDeathRestrictions??[]).filter(x=>level(snapshot.grade)<=x.maximumLevel);
 if(blockers.length)return {recovered:false,skipped:'resurrection-restricted',blockers:structuredClone(blockers)};
 if(recovery.mode!=='one-impact-from-death')throw Error('尚未实现的生命重置方式');
 syncActorWounds(actor);
 const h=s.health,origin={source:snapshot.sourceId,kind:'life-reset'},changes=[];
 // Preserve all existing wound origins and restrictions (adopted Q37/Q38). New occupied slots originate
 // from this explicit life reset, never from an invented instant-death hit.
 ensureWoundLedger(s);
 for(const from of ['intact','B','L'])while(h[from]>0){const woundSource=transitionWoundShare(s,from,'A',{drawDice,...(from==='intact'?{origin}:{})});h[from]--;h.A++;changes.push({from,to:'A',woundSource});}
 if(h.A<1)throw Error('生命重置要求至少一个实际生命槽');
 const woundSource=transitionWoundShare(s,'A','L',{drawDice});h.A--;h.L++;changes.push({from:'A',to:'L',woundSource});
 s.resourceLastRecovery={sourceId:snapshot.sourceId,sourceVersion:snapshot.sourceVersion,grade:snapshot.grade,changes:structuredClone(changes)};
 delete h.dead;delete s.resourceDeathHandled;delete s.resourceDeathRestrictions;delete s.resourceDeathCause;
 h.coma=true;h.deteriorationStopped=false;
 syncActorWounds(actor);
 if(recovery.maximum!==undefined)recordSceneEffectUse(s,{sourceId:snapshot.sourceId,casterId:snapshot.casterId,maximum:recovery.maximum,version:snapshot.sourceVersion});
 return {recovered:true,health:structuredClone(h),sourceId:snapshot.sourceId,changes};
}
// Instant death is a separate effect family. It never fabricates A wounds.
export function resolveResourceInstantDeath(root,targetId,{sourceId,casterId,grade,protectionInstanceId}){
 const s=root.actors[targetId].state;
 if(lifeStatus(s).state==='dead')return {killed:false,skipped:'already-dead'};
 const incoming=level(grade),general=evaluateApplicability({families:['instantDeath'],grade},collectImmunities(s,RESOURCE_DEFINITIONS));
 if(general.status==='blocked')return {blocked:true,immunity:general};
 const candidates=selectedOngoingEffects(s).filter(e=>e.instantDeathProtection&&incoming<=e.instantDeathProtection.maximumLevel&&available(s,e.sourceId,e.deathRecovery?.maximum));
 // For distinct finite immunity sources there is no adopted consumption order.
 if(candidates.length>1&&!protectionInstanceId){const error=new Error('多个有限即死抵挡来源须登记实际消耗来源');error.code='NEEDS_INPUT';error.field='death.protectionSource';throw error;}
 const protection=protectionInstanceId?candidates.find(e=>e.id===protectionInstanceId):candidates[0];
 if(protectionInstanceId&&!protection){const e=new Error('须选择当前生效且有额度的实际即死防护来源');e.code='NEEDS_INPUT';e.field='death.protectionSource';throw e;}
 if(protection){
  if(protection.deathRecovery?.maximum!==undefined)recordSceneEffectUse(s,{sourceId:protection.sourceId,casterId:protection.casterId,maximum:protection.deathRecovery.maximum,version:protection.version});
  s.activeResourceEffects=s.activeResourceEffects.filter(e=>e.id!==protection.id);
  return {blocked:true,instanceId:protection.id,sourceId:protection.sourceId};
 }
 s.health.dead=true;s.resourceDeathCause={kind:'instant-death',sourceId,casterId,grade};
 return {killed:true,sourceId};
}
