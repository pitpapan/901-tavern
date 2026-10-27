import {selectedTriggerKeys,queueTriggerEnd} from './resource-trigger-lifecycle.mjs';
import {flushResourceTriggerEnds} from './gm_runtime/resource-program.mjs';
import {settleOngoingEnd,accrueRoundCosts} from './resource-ongoing.mjs';
import {inspectCapabilityEnd,beginResourceDescent} from './resource-descent.mjs';
// A dispellable instance is an actual timed effect, not a learned definition.
// Linked components share source/caster; incoming auras remain recipient-local.
import {syncResourceHealth} from './core.mjs';
import {syncTemporaryHealth} from './resource-temporary-health.mjs';
const grades={D:1,C:2,B:3,A:4,S:5};
const timed=x=>x.targetScope==='scene'||x.scene===true||x.remainingRounds>0||x.remainingMinutes>0||x.event==='turnStart'&&x.remaining>0;
function components(state){
 const rows=[];
 for(const field of ['activeResourceEffects','resourceCapabilities','resourceTriggers','resourceChannels','temporaryHealthPools','resourceAuras','statuses'])
  for(const [key,x]of Object.entries(state[field]??{})){
   if(x.aura)continue; // Membership is represented by the source aura below.
   if(!timed(x)||x.auraId)continue;
   const sourceId=x.sourceId??x.source,casterId=x.casterId??x.sourceActorId;
   if(sourceId&&casterId)rows.push({field,key,x,sourceId,casterId});
  }
 return rows;
}
export function timedResourceInstances(root,targetId){
 const groups=new Map(),s=root.actors[targetId].state;
 for(const c of components(s)){
  const id=JSON.stringify(['effect',c.sourceId,c.casterId,...(c.x.selection||c.x.instancePolicy==='append'?[c.x.id]:[])]);
  const row=groups.get(id)??{id,sourceId:c.sourceId,casterId:c.casterId,levels:[],components:[]};
  row.levels.push(grades[c.x.grade??c.x.rank]??null);
  if(c.x.removable===false)row.protected=true;
  row.components.push({field:c.field,key:c.key});groups.set(id,row);
 }
 for(const [casterId,actor]of Object.entries(root.actors))for(const a of Object.values(actor.state.resourceAuras??{})){
  if(!timed(a)||a.excludedIds?.includes(targetId))continue;
  const member=s.activeResourceEffects?.find(x=>x.id==='aura/'+a.id&&!x.suspended);
  const pool=s.temporaryHealthPools?.['aura/'+a.id];
  if(!member&&!(pool&&!pool.suspended))continue;
  const id=JSON.stringify(['aura-member',a.id]);
  groups.set(id,{id,sourceId:a.sourceId,casterId,auraId:a.id,levels:[grades[a.grade]??null],components:[]});
 }
 return [...groups.values()].map(({levels,...row})=>({...row,level:levels.includes(null)?null:Math.max(...levels)}));
}
export function selectedTimedResource(root,targetId,choice,maxLevel){
 const fail=message=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field='resource.effectChoice';throw e;};
 if(!choice?.source||choice.chosenBy!==targetId)fail('须受术者自行选择有来源的持续效果，不能由施法者代选');
 const row=timedResourceInstances(root,targetId).find(x=>x.id===choice.id);
 if(!row)fail('所选效果不是目标身上仍持续的资源实例');
 if(row.protected)fail('该持续来源明确不能移除，不能用普通解除绕过');
 if(row.level===null)fail('该历史效果缺少施放时等级记录，不能按当前学会等级推定');
 if(row.level>maxLevel){const e=new Error('所选效果等级超过本次解除上限');e.code='UNAVAILABLE';throw e;}
 return row;
}
export function inspectTimedResourceEnd(root,targetId,row){
 const s=root.actors[targetId].state;
 for(const c of row.components??[])if(c.field==='resourceCapabilities')inspectCapabilityEnd(s,c.key,s.resourceCapabilities[c.key]);
}
export function endTimedResource(root,targetId,row,{reason='dispel',drawDice,combat=Number.isInteger(root.round)}={}){
 const s=root.actors[targetId].state,selectedTriggers=selectedTriggerKeys(s);inspectTimedResourceEnd(root,targetId,row);
 if(row.auraId){
  const a=root.actors[row.casterId].state.resourceAuras[row.auraId];
  a.excludedIds=[...new Set([...(a.excludedIds??[]),targetId])];
  s.activeResourceEffects=(s.activeResourceEffects??[]).filter(x=>x.id!=='aura/'+row.auraId);
  if(s.temporaryHealthPools)delete s.temporaryHealthPools['aura/'+row.auraId];
 }else{
  for(const c of row.components)if(c.field==='activeResourceEffects')settleOngoingEnd(s,s[c.field][c.key],{reason,drawDice});
  for(const field of new Set(row.components.map(c=>c.field))){
   const keys=new Set(row.components.filter(c=>c.field===field).map(c=>c.key));
   if(Array.isArray(s[field]))s[field]=s[field].filter((_,i)=>!keys.has(String(i)));
   else for(const key of keys){if(field==='resourceCapabilities')beginResourceDescent(s,key,s[field][key],{reason});if(field==='resourceTriggers')queueTriggerEnd(s,s[field][key],{reason,effective:selectedTriggers.has(key)});delete s[field][key];}
  }
 }
 accrueRoundCosts(s,{root,combat});syncResourceHealth(s);syncTemporaryHealth(s);
 return {id:row.id,sourceId:row.sourceId,casterId:row.casterId,settlements:flushResourceTriggerEnds(root,targetId,{drawDice,combat})};
}

// A recipient's sourced choice applies only to the actual conflicting instance.
// This query has no writes: keeping a source is resolved after normal cast payment.
export function exclusiveResourceChoice(state,{group,incomingId,policy,targetId,choice}){
 const conflicts=(state.activeResourceEffects??[]).filter(e=>e.id!==incomingId&&e.exclusiveGroup===group&&e.remainingRounds!==0&&e.remainingMinutes!==0);
 if(!conflicts.length)return {decision:'apply'};
 if(policy!=='recipient-choice'){const e=new Error('独占效果跨来源替换方式尚待裁定');e.code='RULE_UNRESOLVED';throw e;}
 if(conflicts.length!==1||!choice?.source||choice.chosenBy!==targetId||choice.existingId!==conflicts[0].id||!['keep','replace'].includes(choice.decision)){
  const e=new Error('须受术者明确选择保留或替换当前独占效果，并记录来源');e.code='NEEDS_INPUT';e.field='resource.exclusiveChoices.'+targetId+'.'+group;throw e;
 }
 return {decision:choice.decision,existingId:conflicts[0].id,chosenBy:targetId,source:choice.source};
}

export function hasResourceSource(state,sourceId,casterId){
 return ['activeResourceEffects','resourceTriggers'].some(field=>Object.values(state[field]??{}).some(x=>x.sourceId===sourceId&&x.casterId===casterId&&x.remainingRounds!==0&&x.remainingMinutes!==0));
}
export function endResourceSource(state,sourceId,casterId,{drawDice}={}){
 const selectedTriggers=selectedTriggerKeys(state);
 for(const x of state.activeResourceEffects??[])if(x.sourceId===sourceId&&x.casterId===casterId)settleOngoingEnd(state,x,{reason:'voluntary-end',drawDice});
 for(const [key,x]of Object.entries(state.resourceCapabilities??{}))if((x.sourceId??x.source)===sourceId&&x.casterId===casterId)inspectCapabilityEnd(state,key,x);
 for(const field of ['activeResourceEffects','resourceTriggers','resourceChannels','resourceCapabilities']){
  const matches=x=>(x.sourceId??x.source)===sourceId&&x.casterId===casterId;
  if(Array.isArray(state[field]))state[field]=state[field].filter(x=>!matches(x));
  else for(const [key,x]of Object.entries(state[field]??{}))if(matches(x)){if(field==='resourceCapabilities')beginResourceDescent(state,key,x,{reason:'voluntary-end'});if(field==='resourceTriggers')queueTriggerEnd(state,x,{reason:'voluntary-end',effective:selectedTriggers.has(key)});delete state[field][key];}
 }
 syncResourceHealth(state);
 return {sourceId,casterId,reason:'voluntary-end'};
}
