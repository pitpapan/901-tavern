// Effect applicability is independent of dice, spell power and actor strength.
// Definitions/instances provide exact families and grades; no names are inferred.
const GRADES=['none','D','C','B','A','S','SS','SSS'];
const missing=field=>{const e=new Error('等级比较缺少有来源的实际等级：'+field);e.code='NEEDS_INPUT';e.field=field;throw e;};
const level=x=>typeof x==='number'&&Number.isInteger(x)&&x>=0&&x<GRADES.length?x:typeof x==='string'&&GRADES.includes(x)?GRADES.indexOf(x):null;
export function effectGrade(spec){
 let n=level(spec.grade);if(n===null)return {grade:null,level:null};
 const offset=spec.gradeBonus??0;if(!Number.isInteger(offset))throw Error('效果等级偏移须为整数');
 n=Math.max(0,n+offset);
 if(spec.maximumGrade!==undefined){const cap=level(spec.maximumGrade);if(cap===null)throw Error('效果等级上限未登记');n=Math.min(n,cap);}
 if(n>=GRADES.length)throw Error('效果等级超出已登记等级表');
 return {grade:GRADES[n],level:n};
}
const active=x=>!x.suspended&&x.enabled!==false&&x.remainingRounds!==0&&x.remainingMinutes!==0;
export function collectImmunities(state,definitions={}){
 const rows=[];
 for(const [key,c]of Object.entries(state.resourceCapabilities??{}))if(active(c))rows.push({...c,instanceId:key});
 for(const [id,owned]of Object.entries(state.learnedResources??{}))if(owned.learned)
  for(const c of definitions[id]?.capabilities??[])if(active(c))rows.push({...c,resourceId:id,source:c.source??id});
 return rows.filter(c=>c.id?.endsWith('Immunity')||c.kind==='immunity');
}
function families(c){
 if(c.families)return c.families;
 if(c.matches?.effectFamily)return [c.matches.effectFamily];
 return c.id?.endsWith('Immunity')?[c.id.slice(0,-8)]:[];
}
export function evaluateApplicability(spec,immunities=[]){
 const mode=spec.mode??'any-blocks';if(!['any-blocks','fraction-unblocked'].includes(mode))throw Error('未支持的复合免疫策略：'+mode);
 const types=[...new Set(spec.families??[])],grade=effectGrade(spec),matches=[];
 for(const family of types)for(const c of immunities){
  if(!active(c)||!families(c).includes(family))continue;
  const comparison=c.comparison??{mode:'up-to',maximumGrade:c.level,inclusive:true};let blocks;
  if(comparison.mode==='ungraded')blocks=true;
  else if(comparison.mode==='up-to'){
   const maximum=level(comparison.maximumGrade);if(maximum===null)missing('resource.immunityGrade');
   if(grade.level===null)missing('resource.effectGrade');
   blocks=comparison.inclusive===false?grade.level<maximum:grade.level<=maximum;
  }else throw Error('未支持的免疫比较策略：'+comparison.mode);
  if(blocks)matches.push({family,source:c.source??c.resourceId??c.instanceId,instanceId:c.instanceId,comparison:structuredClone(comparison)});
 }
 const blockedFamilies=[...new Set(matches.map(x=>x.family))];
 const factor=mode==='fraction-unblocked'&&types.length?1-blockedFamilies.length/types.length:blockedFamilies.length?0:1;
 return {status:factor===0?'blocked':factor===1?'applicable':'partial',factor,effectGrade:grade.grade,effectLevel:grade.level,blockedFamilies,matches};
}
