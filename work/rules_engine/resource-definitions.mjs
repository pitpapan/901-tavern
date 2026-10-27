import {assertProgramABI,requireEffectConsumer} from './program-operators.mjs';
import {collectEffects,stackEffects,resolveContributions} from './resource-effects.mjs';
import {RESOURCE_DATA,RESOURCE_ENGINE_ABI} from './resource-data.mjs';
assertProgramABI(RESOURCE_ENGINE_ABI);
export const RESOURCE_DEFINITIONS=RESOURCE_DATA;
export const resourceEffects=(s,stat,context={})=>{requireEffectConsumer(stat);return collectEffects(s,RESOURCE_DEFINITIONS,stat,context);};
export const resourceBonus=(s,stat,context={},baseline={})=>stackEffects(resourceEffects(s,stat,context),baseline).value;
export function observationContext(s,targetId,visible=true){const o=s.chengxin?.observations?.[targetId];return {observed:o?.valid===true&&s.chengxin?.targetId===targetId,successfullyObserved:o?.valid===true,targetVisible:visible};}

export function resolveResourceContributions(s,stat,context={},legacy=[],{combine='sum',baseline={}}={}){
 const resolved=resolveContributions([...legacy,...resourceEffects(s,stat,context)]);
 const current=resolved.rows.filter(x=>x.origin!=='legacy'),remaining=resolved.rows.filter(x=>x.origin==='legacy');
 const currentValue=stackEffects(current,baseline).value,legacyValue=stackEffects(remaining).value;
 return {value:combine==='maximum'?Math.max(currentValue,legacyValue):currentValue+legacyValue,
  current,legacy:remaining,replacedSources:resolved.replacedSources};
}
