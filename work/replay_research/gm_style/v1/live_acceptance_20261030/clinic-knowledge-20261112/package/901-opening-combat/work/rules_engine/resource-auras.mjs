import {spellResistanceFor} from './resource-spell-resistance.mjs';
// Shared moving-area membership. Source values are frozen at casting; only
// actual positions, team membership and target resistance are queried later.
import {syncResourceHealth} from './core.mjs';
import {registerTemporaryHealth,syncTemporaryHealth} from './resource-temporary-health.mjs';
import {effectValue,retainResourceGrade} from './resource-effects.mjs';
import {resourceBonus} from './resource-definitions.mjs';
import {clearLine,spatialDistance} from './combat/map.mjs';
import {RuleInputError,IllegalAction} from './combat/mechanics.mjs';
const point=p=>Array.isArray(p)&&[2,3].includes(p.length)&&p.every(Number.isFinite);
function location(root,id,combat){
 const spatial=root.ruleScene?.spatial;
 const row=combat?root.actors[id]:spatial?.source?spatial.actors?.[id]:null;
 if(!point(row?.position))throw new RuleInputError('移动领域须有当前实际位置及场外位置来源：'+id,'resource.spatial');
 return row;
}
function inRange(root,casterId,targetId,aura,combat){
 const from=location(root,casterId,combat),to=location(root,targetId,combat);
 const map=combat?root.map:root.ruleScene.spatial.map;
 return spatialDistance(map,from.position,to.position)<=aura.radius&&clearLine(map,from.position,to.position);
}
export function registerResourceAura(root,casterId,sourceId,op,variables,plan,{combat=false,version,applicability,immunityScaling,componentId}={}){
 const state=root.actors[casterId].state,id=sourceId+'/'+casterId+(componentId?'/'+componentId:'');
 const prior=state.resourceAuras?.[id];
 const aura={id,sourceId,casterId,version,grade:variables.rank===2?'C':'D',team:op.team??'all',effects:structuredClone(op.effects??[]),
  ...(applicability?{applicability:structuredClone(applicability),immunityScaling}:{}),
  variables:structuredClone(variables),radius:effectValue(op.radius,state,variables),scene:op.scene===true,
  ...(op.rounds!==undefined?{remainingRounds:effectValue(op.rounds,state,variables)}:{}),
  ...(op.minutes!==undefined?{remainingMinutes:effectValue(op.minutes,state,variables)}:{}),
  ...(op.selected?{selectedIds:structuredClone(plan.targetIds??[])}:{})};
 location(root,casterId,combat);
 if(op.selected){
  if(!aura.selectedIds.length||new Set(aura.selectedIds).size!==aura.selectedIds.length)throw new IllegalAction('领域须指定不重复的实际受术者');
  for(const id of aura.selectedIds)if(!root.actors[id]||!inRange(root,casterId,id,aura,combat))throw new IllegalAction('选定受术者不在施放时的领域内');
 }
 // Same-source recasts replace selection and refresh lifetime, without adding
 // another copy of a field. Stronger prior power/radius remain in that field.
 if(prior&&!op.temporaryAllocation){aura.variables.P=Math.max(aura.variables.P,prior.variables.P);aura.radius=Math.max(aura.radius,prior.radius);retainResourceGrade(aura,prior);aura.variables.rank=Math.max(aura.variables.rank,prior.variables.rank);}
 if(aura.applicability)aura.applicability.grade=aura.grade;
 if(op.temporaryAllocation){
  const allocation=plan.inputs?.[op.temporaryAllocation.key],total=effectValue(op.temporaryAllocation.total,state,variables),maximum=effectValue(op.temporaryAllocation.maximum,state,variables);
  if(!allocation||Array.isArray(allocation)||Object.keys(allocation).length!==aura.selectedIds.length||Object.entries(allocation).some(([id,n])=>!aura.selectedIds.includes(id)||!Number.isInteger(n)||n<0||n>maximum)||Object.values(allocation).reduce((n,v)=>n+v,0)!==total)throw new IllegalAction('临时生命须按受护目标完整分配，满足总额和每人上限');
  for(const actor of Object.values(root.actors))for(const [key,pool]of Object.entries(actor.state.temporaryHealthPools??{}))if(pool.auraId===id)delete actor.state.temporaryHealthPools[key];
  for(const targetId of aura.selectedIds){
   const target=root.actors[targetId],P=Math.max(0,variables.P-spellResistanceFor(target.state,{casterId,sourceId,schools:variables.schools}));
   const capacity=Math.min(allocation[targetId],effectValue(op.temporaryAllocation.maximum,state,{...variables,P}));
   registerTemporaryHealth(target.state,{id:'aura/'+id,sourceId,casterId,version,grade:aura.grade,auraId:id,capacity,remaining:capacity,
    ...(aura.remainingRounds!==undefined?{remainingRounds:aura.remainingRounds}:{}),...(aura.remainingMinutes!==undefined?{remainingMinutes:aura.remainingMinutes}:{}),scene:aura.scene},{targetId,choice:plan.temporaryHealthChoices?.[targetId]});
  }
 }
 (state.resourceAuras??={})[id]=aura;
 refreshResourceAuras(root,{combat});
 return aura;
}
export function refreshResourceAuras(root,{combat=false}={}){
 const actors=Object.entries(root.actors??{});
 const liveAuras=new Set(actors.flatMap(([,a])=>Object.keys(a.state.resourceAuras??{})));
 for(const [,actor]of actors)for(const [key,pool]of Object.entries(actor.state.temporaryHealthPools??{}))if(pool.auraId){
  if(!liveAuras.has(pool.auraId))delete actor.state.temporaryHealthPools[key];else pool.suspended=true;
 }
 for(const [,a]of actors)if(a.state.activeResourceEffects?.some(e=>e.aura))a.state.activeResourceEffects=a.state.activeResourceEffects.filter(e=>!e.aura);
 for(const [casterId,caster]of actors)for(const aura of Object.values(caster.state.resourceAuras??{})){
  if(caster.present===false||aura.remainingRounds===0||aura.remainingMinutes===0)continue;
  const from=location(root,casterId,combat);
  for(const [targetId,target]of actors){
   if(aura.excludedIds?.includes(targetId)||target.present===false||aura.selectedIds&&!aura.selectedIds.includes(targetId))continue;
   const to=location(root,targetId,combat);
   if(aura.team!=='all'){
    if(!from.team||!to.team)throw new RuleInputError('领域须有实际敌我关系','resource.spatial.team');
    if((aura.team==='ally')!==(from.team===to.team))continue;
   }
   const variables={...aura.variables,P:Math.max(0,aura.variables.P-spellResistanceFor(target.state,{casterId,sourceId:aura.sourceId,schools:aura.variables.schools}))};
   const suspended=variables.P===0||!inRange(root,casterId,targetId,aura,combat);
   const pool=target.state.temporaryHealthPools?.['aura/'+aura.id];if(pool)pool.suspended=suspended;
   (target.state.activeResourceEffects??=[]).push({id:'aura/'+aura.id,sourceId:aura.sourceId,casterId,version:aura.version,grade:aura.grade,aura:true,suspended,
    ...(aura.applicability?{applicability:structuredClone(aura.applicability),immunityScaling:aura.immunityScaling}:{}),
    effects:aura.effects.map(e=>({...e,value:effectValue(e.value,caster.state,variables)}))});
  }
 }
 for(const [,actor]of actors){syncResourceHealth(actor.state);syncTemporaryHealth(actor.state);}
}
