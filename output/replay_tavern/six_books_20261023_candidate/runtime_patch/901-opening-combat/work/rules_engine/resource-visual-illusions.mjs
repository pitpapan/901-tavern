// RE 幻术15: only the corresponding sensory category defeats sensory illusions.
import {actualSenses} from './resource-senses.mjs';
import {collectImmunities,evaluateApplicability,effectGrade} from './resource-applicability.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
export function visualIllusionImmune(observer,effect){
 return !!observer.state&&evaluateApplicability({families:['visualIllusion'],grade:effect.grade},collectImmunities(observer.state,RESOURCE_DEFINITIONS)).status==='blocked';
}
export function visualIllusionSenses(observer,target,effect){
 return Object.values(actualSenses(observer,target)).flatMap(s=>{
  if(s.visualIllusionImmunity||s.visual&&effectGrade(s).level>=effectGrade(effect).level)return [s];
  // RE true sight explicitly defeats B-and-below illusions only in sensitive vision.
  if(s.source&&s.trueSight&&s.visual&&effectGrade(effect).level!==null&&effectGrade(effect).level<=3)return [{...s,vagueRange:s.sensitiveRange}];
  return [];
 });
}
