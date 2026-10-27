import {ongoingSelected} from './resource-ongoing.mjs';
import {assertSchema} from './rule-schema.mjs';
import {EFFECT_POLICY_MIGRATIONS} from './rule-contracts.mjs';
import {requireExpressionArity} from './rule-expressions.mjs';
import {evaluateApplicability,collectImmunities} from './resource-applicability.mjs';
import {temporaryHealthActive} from './resource-temporary-health.mjs';
// Shared, deterministic resource effects. Definitions are trusted build data;
// classifier requests select actions and targets, never expressions or patches.
const at=(object,path)=>path.split('.').reduce((v,k)=>v?.[k],object);
export function effectValue(value,state,context={}){
 if(value===undefined)return undefined;
 if(typeof value==='number'||typeof value==='boolean'||typeof value==='string'||value===null)return value;
 if(value?.state)return at(state,value.state)??value.default;
 if(value?.context)return at(context,value.context)??value.default;
 if(!value?.op)throw Error('未支持的效果值');
 requireExpressionArity(value);
 const xs=value.args.map(x=>effectValue(x,state,context));
 if(!xs.every(Number.isFinite))throw Error('效果公式缺少实际数值');
 switch(value.op){
  case 'add':return xs.reduce((a,b)=>a+b,0);
  case 'mul':return xs.reduce((a,b)=>a*b,1);
  case 'sub':return xs[0]-xs[1];
  case 'div':if(!xs[1])throw Error('效果公式分母为零');return xs[0]/xs[1];
  case 'min':return Math.min(...xs);
  case 'max':return Math.max(...xs);
  case 'floor':return Math.floor(xs[0]);
  default:throw Error('未支持的效果运算：'+value.op);
 }
}
export function effectMatches(condition,state,context={}){
 if(condition===undefined||condition===null)return true;
 if(typeof condition==='boolean')return condition;
 if(condition.all)return condition.all.every(x=>effectMatches(x,state,context));
 if(condition.any)return condition.any.some(x=>effectMatches(x,state,context));
 if(Object.hasOwn(condition,'not'))return !effectMatches(condition.not,state,context);
 if(condition.pool)return Object.entries(state.resources??{}).some(([name,p])=>p.generic===true&&!p.special&&!['怒气','化劲','生命','意志','精力'].includes(name)&&p.current>=condition.pool.minimum);
 const a=effectValue(condition.left,state,context),b=effectValue(condition.right,state,context);
 switch(condition.test){case 'eq':return a===b;case 'ne':return a!==b;case 'gte':return a>=b;case 'lte':return a<=b;case 'in':return condition.values.includes(a);case 'contains':return Array.isArray(a)&&a.includes(b);case 'present':return a!==undefined&&a!==null;default:throw Error('未支持的效果条件');}
}
export function collectEffects(state,definitions,stat,context={}){
 const rows=[];
 for(const [id,definition]of Object.entries(definitions)){
  const owned=state.learnedResources?.[id]?.learned===true||definition.ownership&&effectMatches(definition.ownership,state,context);
  if(!owned)continue;
  const local={...context,resourceChoices:state.learnedResources?.[id]?.choices,resourceGrade:state.learnedResources?.[id]?.grade};
  for(const e of definition.effects??[])if(e.stat===stat&&effectMatches(e.when,state,local)){
   const value=effectValue(e.value,state,local);if(!Number.isFinite(value))throw Error(`${id}的${stat}缺少运行数值`);
   rows.push({source:id,...e,value,origin:'definition',...(e.clauseId?{contribution:{sourceInstanceId:state.learnedResources?.[id]?.instanceId??id,clauseId:e.clauseId,consumer:stat}}:{})});
  }
 }
 for(const active of state.activeResourceEffects??[]){
  if(active.temporaryHealthId&&!temporaryHealthActive(state,active.temporaryHealthId))continue;
  if(active.suspended||active.remainingRounds===0||active.remainingMinutes===0||!ongoingSelected(state,active))continue;
  const effectContext={...context,effectInstanceId:active.id};
  const relevant=(active.effects??[]).filter(e=>e.stat===stat&&effectMatches(e.when,state,effectContext));
  if(!relevant.length)continue;
  const applicability=active.applicability?evaluateApplicability(active.applicability,collectImmunities(state,definitions)):null;
  if(applicability?.status==='blocked')continue;
  for(const stored of relevant){
   const migrations=definitions[active.sourceId]?.effectPolicyMigrations??[];
   if(migrations.length)assertSchema(migrations,EFFECT_POLICY_MIGRATIONS,'definition.effectPolicyMigrations');
   const migration=migrations.find(m=>m.stat===stored.stat&&m.fromVersion===active.version);
   const e=migration?{...stored,...migration.set}:stored;
   let value=effectValue(e.value,state,context);
   if(applicability?.status==='partial'){
    if(active.immunityScaling!=='floor-magnitude')throw Error('部分免疫的数值效果缺少明确缩放策略');
    value=Math.sign(value)*Math.floor(Math.abs(value)*applicability.factor);
   }
   rows.push({source:active.sourceId,...e,value,origin:'active',instanceId:active.id,casterId:active.casterId,grade:active.grade,...(e.clauseId?{contribution:{sourceInstanceId:active.id,clauseId:e.clauseId,consumer:stat}}:{})});
  }
 }
 return rows;
}
export function resolveContributions(rows){
 const selected=[],replacedSources=[],keys=new Map();
 for(const row of rows){
  const c=row.contribution;
  if(!c?.sourceInstanceId||!c.clauseId||!c.consumer){selected.push(row);continue;}
  const key=JSON.stringify([c.sourceInstanceId,c.clauseId,c.consumer,row.stat??null,row.group??null,c.itemId??null]);
  const index=keys.get(key);
  if(index===undefined){keys.set(key,selected.length);selected.push(row);continue;}
  const prior=selected[index],preferNew=prior.origin==='legacy'&&row.origin!=='legacy';
  if(prior.origin!=='legacy'&&row.origin!=='legacy'&&prior.value!==row.value){const e=new Error('同一来源条款产生冲突贡献：'+key);e.code='CONTRIBUTION_CONFLICT';throw e;}
  if(preferNew){replacedSources.push(prior);selected[index]=row;}
  else replacedSources.push(row);
 }
 return {rows:selected,replacedSources};
}
export function stackEffects(input,baseline={}){
 const resolved=resolveContributions(input),replacedSources=resolved.replacedSources,rows=[],scoped=new Map();
 for(const row of resolved.rows){
  if(row.stacking!=='highest-source-grade'){rows.push(row);continue;}
  if(!row.source||!row.grade){const e=new Error('按同名同级取高须实际资源来源及等级');e.code='NEEDS_INPUT';e.field='effect.sourceGrade';throw e;}
  const key=JSON.stringify([row.source,row.grade,row.stat]);
  const prior=scoped.get(key);if(!prior||row.value>prior.value)scoped.set(key,row);
 }
 rows.push(...scoped.values());
 const groups={...baseline},penalties={};let additive=0;
 for(const row of rows){if(['add','highest-source-grade'].includes(row.stacking)||!row.group)additive+=row.value;else if(row.value<0)penalties[row.group]=Math.min(penalties[row.group]??0,row.value);else groups[row.group]=Math.max(groups[row.group]??0,row.value);}
 additive+=Object.values(penalties).reduce((a,b)=>a+b,0);
 return {value:additive+Object.values(groups).reduce((a,b)=>a+b,0)-Object.values(baseline).reduce((a,b)=>a+b,0),groups,sources:rows.map(({source,value,group,contribution})=>({source,value,group,...(contribution?{contribution}:{})})),...(replacedSources.length?{replacedSources}:{})};
}
// Same-source refreshes retain the strongest values and their cast provenance.
// A weaker recast must not make a retained C effect look like D to dispelling.
export function retainResourceGrade(active,prior){
 const grades={D:1,C:2,B:3,A:4,S:5};
 if(prior&&(grades[prior.grade]??0)>(grades[active.grade]??0)){
  active.grade=prior.grade;
  if(Number.isFinite(active.level)&&Number.isFinite(prior.level))active.level=Math.max(active.level,prior.level);
  active.retainedFrom=structuredClone(prior.retainedFrom??{grade:prior.grade,version:prior.version,casterId:prior.casterId});
 }
 return active;
}
export function retainStrongerEffects(active,prior){
 if(!prior)return active;
 for(const e of active.effects){
  const old=prior.effects?.find(x=>x.stat===e.stat&&x.group===e.group&&JSON.stringify(x.when)===JSON.stringify(e.when));
  if(old){const next=e.value<0?Math.min(e.value,old.value):Math.max(e.value,old.value);
   if(next!==e.value)active.retainedFrom=structuredClone(prior.retainedFrom??{grade:prior.grade,version:prior.version,casterId:prior.casterId});
   e.value=next;
  }
 }
 return retainResourceGrade(active,prior);
}
export function applyAcquisitionEffects(state,effects,context={}){
 for(const effect of effects??[]){
  if(!effectMatches(effect.when,state,context))continue;
  const amount=effectValue(effect.value,state,context);
  switch(effect.type){
   case 'skillGrant':{
    const sk=(state.skills??={})[effect.skill]??={level:0,subs:{}};
    const old=sk.level;sk.level=Math.min(effect.cap,old+amount);
    sk.auto=(sk.auto??Math.floor(old/5))+Math.floor(sk.level/5)-Math.floor(old/5);break;
   }
   case 'counterCapacity':{
    const c=state[effect.counter]??={current:0,max:0};c.max+=amount;break;
   }
   case 'poolCapacity':{
    const pool=state.resources?.[context.pool];if(!pool)throw Error('缺少选定能量池');pool.max+=amount;break;
   }
   default:throw Error('未支持的取得效果：'+effect.type);
  }
 }
}
export function convertIncomingDamage(state,damage,policy,budget){
 const counter=state[policy.counter];
 if(!counter||!policy.severities.includes(damage.severity)||policy.excludedEnergy.includes(damage.energyType))return {damage,converted:0};
 const converted=Math.min(damage.amount,counter.max-counter.current,budget);
 counter.current+=converted;
 return {damage:{...damage,amount:damage.amount-converted},converted};
}

export function expireEffectsOnAction(state,kind){
 if(!state.activeResourceEffects)return [];
 const removed=[];
 state.activeResourceEffects=(state.activeResourceEffects??[]).filter(e=>{
  if(!e.expiresOn?.actions?.includes(kind))return true;
  removed.push(e.id);return false;
 });
 return removed;
}
