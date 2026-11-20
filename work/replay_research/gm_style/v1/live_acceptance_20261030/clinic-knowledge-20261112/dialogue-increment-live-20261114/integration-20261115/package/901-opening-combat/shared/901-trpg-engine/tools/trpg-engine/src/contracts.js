import {validateHostRuntime} from './host-runtime-contracts.js';
import {validateLifecycleState} from './lifecycle-contracts.js';
import {usesGeneRuntime} from './ruleset-versions.js';
import {validateRuntimeV2} from './v2/contracts.js';
import {validateGeneState} from './gene-contracts.js';
import {object,identifier,nonempty,isJsonValue,validSource,pointer} from '../../trpg-ir/src/contract.js';
export {object,identifier,nonempty,isJsonValue,validSource,pointer};
export const ok=value=>({ok:true,value});
export const fail=(code,path,message,sourceRefs=[])=>({ok:false,issues:[{code,path,message,sourceRefs:structuredClone((Array.isArray(sourceRefs)?sourceRefs:[]).filter(validSource))}]});
export const int=v=>Number.isSafeInteger(v);
export const natural=v=>int(v)&&v>=0;
export const knownInt=v=>v===null||natural(v);
export const finite=v=>typeof v==='number'&&Number.isFinite(v);
export const definitionRef=v=>object(v)&&Object.keys(v).length===2&&identifier(v.id)&&int(v.revision)&&v.revision>0;
export const sourceRefs=v=>Array.isArray(v)&&v.length>0&&v.every(validSource);
export const equal=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
export function sorted(v){return Array.isArray(v)?v.map(sorted):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;}
export function safeSum(values,path=''){const n=values.reduce((a,b)=>a+b,0);return int(n)?ok(n):fail('INTEGER_OVERFLOW',path,'整数计算超出安全范围');}
export function shape(v,required,optional=[]){return object(v)&&required.every(k=>Object.hasOwn(v,k))&&Object.keys(v).every(k=>required.includes(k)||optional.includes(k));}
export function validateHealth(h){return shape(h,['capacity','H','B','L','A','unconscious','stabilized'])&&['capacity','H','B','L','A'].every(k=>natural(h[k]))&&h.capacity>0&&int(h.H+h.B+h.L+h.A)&&h.H+h.B+h.L+h.A===h.capacity&&typeof h.unconscious==='boolean'&&typeof h.stabilized==='boolean';}
export function validateReferenceAbilities(records){return Array.isArray(records)&&new Set(records.map(r=>r?.id)).size===records.length&&records.every(r=>shape(r,['id','name','summary','definitionRef','rank','ownership','certainty','visibility','sourceRefs'])&&identifier(r.id)&&nonempty(r.name)&&nonempty(r.summary)&&(r.definitionRef===null||definitionRef(r.definitionRef))&&knownInt(r.rank)&&['confirmed','uncertain'].includes(r.ownership)&&['confirmed','uncertain','rumor','character_belief'].includes(r.certainty)&&['public','gm'].includes(r.visibility)&&sourceRefs(r.sourceRefs));}
export function validateEffect(e){
  if(!shape(e,['id','sourceRef','sourceDefinitionRef','actorId','kind','targetId','amount','expires'])||!identifier(e.id)||!validSource(e.sourceRef)||!definitionRef(e.sourceDefinitionRef)||!identifier(e.actorId)||!['rank','dp','success'].includes(e.kind)||!identifier(e.targetId)||!int(e.amount))return false;
  if(e.expires===null)return true;
  const x=e.expires;return shape(x,['anchor','at'],['actorId'])&&['actorStart','actorEnd','worldMinutes','sceneEnd'].includes(x.anchor)&& (x.anchor==='sceneEnd'?nonempty(x.at):natural(x.at))&&(['actorStart','actorEnd'].includes(x.anchor)?identifier(x.actorId):x.actorId===undefined);
}
export function validateRuntimeV1(state,{ruleset}={}){
  if(!isJsonValue(state)||!shape(state,['actors','scene','clock','encounter','consumedBoundaryIds'])||!object(state.actors)||!shape(state.scene,['id','advancementOpen'])||!identifier(state.scene.id)||typeof state.scene.advancementOpen!=='boolean'||!shape(state.clock,['worldMinutes','turnSerials'])||!natural(state.clock.worldMinutes)||!object(state.clock.turnSerials)||!Object.values(state.clock.turnSerials).every(natural)||!Array.isArray(state.consumedBoundaryIds)||!state.consumedBoundaryIds.every(identifier)||new Set(state.consumedBoundaryIds).size!==state.consumedBoundaryIds.length)return fail('INVALID_STATE','','BranchState结构不合法');
  const keys=['id','name','visibility','templateRef','attributes','mainSkills','subskills','abilities','equipment','resources','xp','powerPoints','health','defense','protections','effects','conditions'];
  for(const [id,a] of Object.entries(state.actors)){
    const p=`/actors/${pointer(id)}`;
    if(!identifier(id)||!shape(a,keys,['referenceAbilities'])||(Object.hasOwn(a,'referenceAbilities')&&!validateReferenceAbilities(a.referenceAbilities))||a.id!==id||!nonempty(a.name)||!['public','gm'].includes(a.visibility)||!definitionRef(a.templateRef)||!knownInt(a.xp)||!knownInt(a.powerPoints)||!['attributes','mainSkills','subskills','resources'].every(k=>object(a[k]))||!Array.isArray(a.abilities)||!Array.isArray(a.equipment)||!a.equipment.every(definitionRef)||!Array.isArray(a.effects)||!a.effects.every(e=>validateEffect(e)&&e.actorId===id)||!Array.isArray(a.conditions)||!a.conditions.every(nonempty))return fail('INVALID_STATE',p,'ActorState结构不合法');
    for(const [attr,n] of Object.entries(a.attributes))if(!identifier(attr)||!knownInt(n)||(ruleset&&!ruleset.attributes.includes(attr)))return fail('INVALID_STATE',`${p}/attributes`,'属性非法');
    for(const [skill,n] of Object.entries(a.mainSkills))if(!identifier(skill)||!knownInt(n)||(ruleset&&(!Object.hasOwn(ruleset.mainSkills,skill)||(n!==null&&n>ruleset.mainRankMax))))return fail('INVALID_STATE',`${p}/mainSkills`,'主技能非法或越界');
    for(const [sub,s] of Object.entries(a.subskills))if(!identifier(sub)||!shape(s,['parentId','rank','scope'])||!Object.hasOwn(a.mainSkills,s.parentId)||!knownInt(s.rank)||!nonempty(s.scope))return fail('INVALID_STATE',`${p}/subskills`,'副技能非法');
    for(const g of a.abilities)if(!shape(g,['abilityId','revision','rank'])||!identifier(g.abilityId)||!int(g.revision)||g.revision<1||!knownInt(g.rank))return fail('INVALID_STATE',`${p}/abilities`,'能力持有关系非法');
    for(const [resource,r] of Object.entries(a.resources))if(!identifier(resource)||!shape(r,['current','max'])||![r.current,r.max].every(v=>v===null||(finite(v)&&v>=0))||(r.current!==null&&r.max!==null&&r.current>r.max))return fail('INVALID_STATE',`${p}/resources`,'资源余额/上限非法');
    if(a.health!==null&&!validateHealth(a.health))return fail('INVALID_STATE',`${p}/health`,'生命容量必须守恒');
    if(a.defense!==null&&(!shape(a.defense,['dodge','other','automatic'])||!['dodge','other','automatic'].every(k=>int(a.defense[k]))||a.defense.automatic<0))return fail('INVALID_STATE',`${p}/defense`,'防御分项非法');
    if(a.protections!==null&&(!Array.isArray(a.protections)||!a.protections.every(v=>shape(v,['id','kind','amount','damageType','bypassTags','sourceRefs'])&&identifier(v.id)&&nonempty(v.kind)&&natural(v.amount)&&(v.damageType===null||nonempty(v.damageType))&&Array.isArray(v.bypassTags)&&v.bypassTags.every(nonempty)&&sourceRefs(v.sourceRefs))))return fail('INVALID_STATE',`${p}/protections`,'防护结构非法');
  }
  if(state.encounter!==null){
    const e=state.encounter;
    if(!shape(e,['id','order','activeActorId','phase','actors','actionStack'])||!identifier(e.id)||!Array.isArray(e.order)||!e.order.length||new Set(e.order).size!==e.order.length||!e.order.every(id=>Object.hasOwn(state.actors,id))||(e.activeActorId!==null&&!e.order.includes(e.activeActorId))||!['between','resolving'].includes(e.phase)||!object(e.actors)||!Array.isArray(e.actionStack))return fail('INVALID_STATE','/encounter','遭遇结构非法');
    for(const id of e.order){const v=e.actors[id];if(!shape(v,['budget','locks','opportunityUsedAt'])||!shape(v.budget,['standard','move','swift'])||!Object.values(v.budget).every(n=>natural(n)&&n<=1)||!shape(v.locks,['reflexUntilEnd','swiftUntilEnd','allUntilEnd'])||!Object.values(v.locks).every(knownInt)||!knownInt(v.opportunityUsedAt))return fail('INVALID_STATE','/encounter/actors','额度/锁非法');}
    for(const f of e.actionStack)if(!shape(f,['id','actorId','kind','payload','declaredRevision','phase','paid','appliedReactions'])||!identifier(f.id)||!e.order.includes(f.actorId)||!['attack','ability'].includes(f.kind)||!object(f.payload)||!natural(f.declaredRevision)||!['awaitingReactions','ready'].includes(f.phase)||!Array.isArray(f.paid)||!Array.isArray(f.appliedReactions))return fail('INVALID_STATE','/encounter/actionStack','待解动作帧非法');
  }
  return ok(structuredClone(state));
}
export function validateCommand(c){return isJsonValue(c)&&shape(c,['schemaVersion','branchId','resolutionId','expectedRevision','kind','payload','evidence'])&&c.schemaVersion==='command/0.1'&&identifier(c.branchId)&&identifier(c.resolutionId)&&natural(c.expectedRevision)&&nonempty(c.kind)&&object(c.payload)&&shape(c.evidence,['declarationRef','reason','sourceRefs'])&&nonempty(c.evidence.declarationRef)&&nonempty(c.evidence.reason)&&sourceRefs(c.evidence.sourceRefs)?ok(c):fail('INVALID_COMMAND','','命令或事前证据不合法');}

export function validateRuntimeState(state,{ruleset}={}){return ruleset?.version==='engine-v7'?validateHostRuntime(state,{ruleset}):ruleset?.version==='engine-v6'?validateLifecycleState(state,{ruleset}):usesGeneRuntime(ruleset)?validateGeneState(state,{ruleset}):ruleset?.version==='engine-v2'?validateRuntimeV2(state,{ruleset}):validateRuntimeV1(state,{ruleset});}
