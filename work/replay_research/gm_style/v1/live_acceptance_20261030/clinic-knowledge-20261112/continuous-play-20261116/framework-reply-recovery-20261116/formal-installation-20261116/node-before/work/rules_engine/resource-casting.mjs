import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
export function selectCaster(state,source){
 if(source){
  const caster=state.casting?.[source],definition=RESOURCE_DEFINITIONS[source],owned=state.learnedResources?.[source];
  if(!caster||!owned?.learned||owned.adoptionStatus!=='adopted'||owned.qualificationVersion!==definition?.contractVersion||!owned.completedStages?.includes(caster.grade)||owned.grade!==caster.grade||!owned.source||!state.resources?.[caster.pool]||state.resources[caster.pool].max<=0)throw Error('缺少有效的指定施法职能与实际能量池');
  return caster;
 }
 if(state.casting?.imperial)return state.casting.imperial;
 if(state.guanlan?.caster)return state.guanlan.caster;
 const sources=Object.keys(state.casting??{}).filter(k=>RESOURCE_DEFINITIONS[k]?.acquisition?.mode==='staged-bundle');
 if(sources.length>1)throw Error('须从实际已取得的施法职能中明确选择');
 return sources.length?selectCaster(state,sources[0]):undefined;
}
