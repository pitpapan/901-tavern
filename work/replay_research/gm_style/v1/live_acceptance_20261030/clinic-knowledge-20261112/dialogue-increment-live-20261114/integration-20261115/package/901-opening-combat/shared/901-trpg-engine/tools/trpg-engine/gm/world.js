import {ok,fail,shape,identifier,natural,sourceRefs,isJsonValue,equal} from '../src/contracts.js';import {validBinding,validHostEvent} from './contracts.js';
export const validBoundary=b=>shape(b,['id','clock','at','actorId'])&&identifier(b.id)&&['worldMinutes','turn','round'].includes(b.clock)&&natural(b.at)&&(b.clock==='turn'?identifier(b.actorId):b.actorId===null);
export const sameClock=(a,b)=>a?.clock===b?.clock&&a?.actorId===b?.actorId;
export const validFact=f=>shape(f,['id','entityId','field','value','effectiveAt','certainty','discoveryConditions','dependencyRefs'],['visibility'])&&[f.id,f.entityId,f.field].every(identifier)&&isJsonValue(f.value)&&validBoundary(f.effectiveAt)&&['confirmed','uncertain','rumor','character_belief'].includes(f.certainty)&&[undefined,null,'public','private','gm'].includes(f.visibility)&&Array.isArray(f.discoveryConditions)&&Array.isArray(f.dependencyRefs)&&f.dependencyRefs.every(identifier);
export function prepareWorldEvents(snapshot,proposal,{binding}={}){
 if(!validBinding(binding)||!shape(proposal,['id','origin','changeClass','facts','sourceRefs','causeRefs','consistencyRefs'])||!identifier(proposal.id)||!['source_import','prepared_scenario','resolved_event'].includes(proposal.origin)||!Array.isArray(proposal.facts)||!proposal.facts.every(validFact)||!sourceRefs(proposal.sourceRefs)||!Array.isArray(proposal.causeRefs)||!Array.isArray(proposal.consistencyRefs)||![...proposal.causeRefs,...proposal.consistencyRefs].every(identifier))return fail('INVALID_WORLD_PROPOSAL','','事实提案需完整来源、身份和时点');
 if(!['ordinary_detail','established_history','player_history','world_law'].includes(proposal.changeClass))return fail('INVALID_WORLD_PROPOSAL','','未知创作类别');
 if(proposal.changeClass!=='ordinary_detail'&&proposal.origin!=='source_import'&&!proposal.consistencyRefs.some(id=>snapshot.events[id]?.kind==='cocreation.accepted'))return fail('COCREATION_REQUIRED','','重大历史或世界规则需要已采纳依据');
 if(proposal.origin==='resolved_event'&&(!proposal.causeRefs.length||proposal.causeRefs.some(id=>!snapshot.events[id])))return fail('UNKNOWN_CAUSE','','变化需已提交的因果事件');
 const events=[];for(const fact of proposal.facts){const old=snapshot.facts[fact.id];if(old){if(!equal(old,{...fact,visibility:fact.visibility??null}))return fail('FROZEN_FACT','','事实引用不能原地重写');continue;}
  if(Object.values(snapshot.derived?.routineScenes??{}).some(s=>Object.hasOwn(s.entities,fact.entityId)))return fail('ROUTINE_STATE_EVENT_REQUIRED','','常规对象状态只能由已验证的动作事件更新，不能通过任意事实覆盖。');
  const prior=Object.values(snapshot.facts).filter(f=>f.entityId===fact.entityId&&f.field===fact.field&&sameClock(f.effectiveAt,fact.effectiveAt));if(prior.some(f=>f.effectiveAt.at>=fact.effectiveAt.at&&!equal(f.value,fact.value)))return fail('RETROACTIVE_FACT','','不能回填或覆盖旧时点判定前提');
  const importedHistory=proposal.origin==='source_import'&&proposal.consistencyRefs.some(id=>{
   const e=snapshot.events[id];return e?.kind==='campaign.sources'&&e.data.mapping.branchId===binding.branchId&&e.data.mapping.facts.some(row=>equal(row.fact,fact));
  });
  if(prior.length&&proposal.origin!=='resolved_event'&&!importedHistory)return fail('CAUSAL_EVENT_REQUIRED','','已建立事实的变化须有新事件或逐条核对的原生导入记录');
  events.push({id:proposal.id+'.'+fact.id,kind:'world.fact',data:{fact:structuredClone({...fact,visibility:fact.visibility??null}),branchId:binding.branchId,gmRevision:binding.gmRevision,origin:proposal.origin,changeClass:proposal.changeClass,consistencyRefs:proposal.consistencyRefs},causeRefs:proposal.causeRefs,sourceRefs:proposal.sourceRefs});
 }return ok({events});
}
export function reduceWorld(state,event){
 if(!validHostEvent(event)||event.kind!=='world.fact'||!validFact(event.data.fact))return fail('INVALID_WORLD_EVENT','','事实事件非法');
 const d=event.data,binding={branchId:d.branchId,gmRevision:d.gmRevision,engineRevision:0,rulesetDigest:'reducer',catalogDigest:'reducer',policyVersion:'gm-core/1'};
 const checked=prepareWorldEvents(state,{id:event.id,origin:d.origin,changeClass:d.changeClass,facts:[d.fact],sourceRefs:event.sourceRefs,causeRefs:event.causeRefs,consistencyRefs:d.consistencyRefs??[]},{binding});if(!checked.ok)return checked;
 const next=structuredClone(state);next.facts[d.fact.id]=structuredClone(d.fact);next.events[event.id]=structuredClone(event);return ok(next);
}
