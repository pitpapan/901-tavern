import {effectValue} from './resource-effects.mjs';

export function stagedBundleFacts(state,id,definition,offer){
 const spec=definition.acquisition,known=state.learnedResources?.[id],grades=spec.grades,index=grades.indexOf(offer.grade);
 if(index<0)throw Error('能力组此阶段尚未接入');
 if(known?.learned){
  if(known.version!==definition.contractVersion||known.qualificationVersion!==definition.contractVersion||known.adoptionStatus!=='adopted'||!known.source)throw Error('旧能力组取得记录须核对版本与来源');
  if(index!==grades.indexOf(known.grade)+1||!known.completedStages?.includes(grades[index-1]))throw Error('能力组须逐阶取得，不能跳阶或重复购买');
 }else if(index!==0)throw Error('此能力组须先逐阶取得D级');
 const incoming=offer.acquisitionChoices??{},prior=known?.choices??{},choices={...prior,...incoming};
 for(const key of Object.keys(incoming))if(!['specialization','pool','initialCurrent'].includes(key))throw Error('取得选择超出能力组契约');
 for(const key of ['specialization','pool'])if(prior[key]!==undefined&&choices[key]!==prior[key])throw Error('已经取得的选择不能更改');
 if(index>0&&Object.hasOwn(incoming,'initialCurrent'))throw Error('进阶不能重设能量余额');
 if(!spec.specializations.includes(choices.specialization))throw Error('此专精的阶段取得尚未接入');
 if(typeof choices.pool!=='string'||!choices.pool.trim())throw Error('须指定实际能量池');
 return {adoptionStatus:'adopted',qualificationVersion:definition.contractVersion,choices,completedStages:[...(known?.completedStages??[])]};
}

// Called on the transaction clone, including during pre-payment validation.
export function acquireStagedBundle(state,id,definition,context){
 const spec=definition.acquisition,record=state.learnedResources[id],choices=record.choices;
 const stage=spec.stages[record.grade];if(!stage)throw Error('能力组此阶段尚未接入');
 if(record.completedStages.includes(record.grade))throw Error('此阶段已经兑现');
 const pools=state.resources??={},pool=pools[choices.pool];
 if(record.completedStages.length){
  if(!pool?.acquisitionSources?.includes(id))throw Error('缺少本能力组原有能量池来源');
 }else if(pool){
  if(pool.kind!==spec.pool.kind||pool.special||pool.generic!==true||!pool.origin||pool.origin===id||pool.acquisitionSources?.includes(id))throw Error('沿用池须有已确认的同种通用能量来源');
  if(Object.hasOwn(choices,'initialCurrent'))throw Error('已有能量池不能重设余额');
  pool.max+=spec.pool.reopenCapacity;(pool.acquisitionSources??=[]).push(id);
 }else{
  const max=effectValue(spec.pool.capacity,state,context),current=choices.initialCurrent;
  if(!Number.isInteger(max)||max<0||!Number.isInteger(current)||current<0||current>max)throw Error('新池须确认0至上限的实际余额');
  pools[choices.pool]={kind:spec.pool.kind,generic:true,special:false,origin:id,acquisitionSources:[id],max,current};
 }
 pools[choices.pool].max+=stage.poolCapacity??0;
 (state.resourceRecovery??={})[choices.pool]??={...structuredClone(spec.pool.recovery),source:id};
 const grantId=id+'/'+record.grade+'/gift';
 (state.learningGrants??={})[grantId]={count:stage.spellCount,grade:record.grade,tree:spec.spellTree,resourceId:id,stage:record.grade,casterSource:id,source:context.source,used:[]};
 record.completedStages.push(record.grade);
 (state.casting??={})[id]={source:id,grade:record.grade,level:spec.grades.indexOf(record.grade)+1,pool:choices.pool};
}
