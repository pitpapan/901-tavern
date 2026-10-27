import {effectValue,effectMatches,applyAcquisitionEffects} from './resource-effects.mjs';
export function assertSpellQualifications(state,id,definition,{grade=definition?.grade,versionMode}={}){
 if(definition?.identity?.category!=='spell')return;
 const policy=definition.learning?.policy;
 if(policy){
  if(policy.requiresCaster!==false||!policy.grades?.includes(grade))throw Error('学习政策未定义此等级的施法资格');
  for(const school of policy.requiredSubskills??[])if((state.skills?.神秘?.subs?.[school]?.level??0)<1)throw Error('缺少法术要求的专业资格：'+school);
  return;
 }
 if(definition.grade==='C'&&grade!=='C')throw Error('原生C术不能改写为未定义的D版');
 const caster=state.casting?.imperial??state.guanlan?.caster,grades=['D','C','B','A','S'];
 if(!caster||grades.indexOf(caster.grade)<grades.indexOf(grade)||!['D','C'].includes(grade))throw Error('学习法术须有对应等级施法职能');
 const known=state.learnedResources?.[id];
 if(definition.grade==='D'&&grade==='C'&&(!known?.learned||known.grade!=='D'||!versionMode))throw Error('D术升阶须先学D版并明确保留或替换版本');
 if(definition.requiresAllSchools)for(const school of definition.subskills??[])
  if((state.skills?.神秘?.subs?.[school]?.level??0)<1&&!known?.qualifications?.includes(school))throw Error('缺少法术要求的专业资格：'+school);
}
// Acquisition is a transaction on one actor's state. Definition stages describe
// legal choices and one-time grants, without importing a later character sheet.
export function acquireDefinition(state,id,definition,choices,context){
 const spec=definition?.acquisition;if(!spec)return;
 const learned=state.learnedResources?.[id];if(!learned?.learned)throw Error('资源尚未实际取得');
 const grade=learned.grade??spec.grades[0],index=spec.grades.indexOf(grade);
 if(index<0)throw Error('资源未定义此取得等级');
 const prior=learned.choices??{},selected={...prior,...choices};
 for(const [key,rule]of Object.entries(spec.choices??{})){
  if(selected[key]!==undefined&&rule.fromGrade&&index<spec.grades.indexOf(rule.fromGrade))throw Error('此等级尚不能选择：'+key);
  if(rule.required&&selected[key]===undefined)throw Error('取得资源须明确选择：'+key);
  if(selected[key]!==undefined&&selected[key]!==null&&!rule.values.includes(selected[key]))throw Error('不合法的取得选择：'+key);
  if(prior[key]!==undefined&&prior[key]!==selected[key])throw Error('已经取得的选择不能被后期模板覆盖：'+key);
  if(rule.distinctFrom&&selected[key]&&selected[key]===selected[rule.distinctFrom])throw Error('主副选择必须不同');
 }
 learned.choices=selected;
 const vars={...context,...selected,grade,resourceId:id,resourceChoices:selected,resourceGrade:grade};
 if(spec.pool){
  if(typeof selected.pool!=='string'||!selected.pool.trim())throw Error('须选择实际施法能量池');
  const pools=state.resources??={},existing=pools[selected.pool];
  if(existing){if(existing.special||selected.sameSource!==true)throw Error('沿用池须确认同源且非特殊资源');}
  else {
   const max=effectValue(spec.pool.capacity,state,vars),current=selected.initialCurrent;
   if(!Number.isInteger(current)||current<0||current>max)throw Error('新能量池须记录取得当时的实际余额，范围0至上限');
   pools[selected.pool]={current,max,generic:true,special:false,origin:id};
  }
  (state.resourceRecovery??={})[selected.pool]={...spec.pool.recovery,source:id};
 }
 learned.appliedStages??=[];
 for(const stage of spec.grades.slice(0,index+1)){
  if(learned.appliedStages.includes(stage))continue;
  const stageSpec=spec.stages[stage];
  applyAcquisitionEffects(state,stageSpec.effects??[],{...vars,definitions:context.definitions});
  for(const grant of stageSpec.learningGrants??[]){
   if(!effectMatches(grant.when,state,vars))continue;
   const key=id+'/'+stage+'/'+grant.id;
   (state.learningGrants??={})[key]={...grant,source:context.source,resourceId:id,stage,used:[],school:grant.school??selected[grant.schoolChoice]};
  }
  learned.appliedStages.push(stage);
 }
 if(spec.casting){
  (state.casting??={})[spec.casting]={source:id,grade,level:index+1,pool:selected.pool,primary:selected.primary,secondary:selected.secondary??null};
 }
}
export function claimLearningGrant(state,grantId,resourceIds,definitions,source){
 const grant=state.learningGrants?.[grantId];if(!grant||!source)throw Error('须实际授术名额与选定来源');
 if(!Array.isArray(resourceIds)||new Set(resourceIds).size!==resourceIds.length||resourceIds.length>grant.count-grant.used.length)throw Error('授术选择超过剩余名额或重复');
 for(const id of resourceIds){const d=definitions[id];
  if(!d||d.prohibited||d.grade!=='D'||!d.learning||state.learnedResources?.[id]?.learned)throw Error('授术须合法、未学会的本职D级法术');
  if(!d.schools?.includes(grant.school))throw Error('授术不属于此名额对应的专业');
  assertSpellQualifications(state,id,d,{grade:'D'});
 }
 for(const id of resourceIds){(state.learnedResources??={})[id]={learned:true,source,grade:'D',kind:'technique',tree:definitions[id].identity?.tree??'imperial',version:definitions[id].contractVersion,grantedBy:grantId};grant.used.push(id);}
 return {learned:[...resourceIds],remaining:grant.count-grant.used.length,chargedXP:0};
}

// Opt-in learning policy uses a registered offer, never model-supplied effects.
// It binds an existing pool and records facts; it neither creates nor refills one.
export function learningAcquisitionFacts(state,definition,offer){
 const policy=definition?.learning?.policy;if(!policy)return null;
 const choice=policy.pool?.choice,pool=offer.acquisitionChoices?.[choice];
 if(typeof pool!=='string'||!pool.trim()||!state.resources?.[pool])throw Error('学习须选择实际已有魔力池');
 if(Object.keys(offer.acquisitionChoices??{}).some(k=>k!==choice))throw Error('取得选择超出学习政策声明');
 const actual=state.resources[pool],confirmed=offer.acquisitionQualifications?.energyPools?.[pool];
 const classified=actual.kind===policy.pool.kind;
 if(!classified&&!(confirmed?.kind===policy.pool.kind&&typeof confirmed.source==='string'&&confirmed.source.trim()))throw Error('该池没有对应魔力资格记录');
 return {adoptionStatus:'adopted',choices:{[choice]:pool},qualifications:{subskills:[...(policy.requiredSubskills??[])],energyPools:{[pool]:{kind:policy.pool.kind,source:classified?offer.source:confirmed.source}}}};
}
