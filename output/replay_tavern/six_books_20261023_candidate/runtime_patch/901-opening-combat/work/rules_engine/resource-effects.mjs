// Shared, deterministic resource effects. Definitions are trusted build data;
// classifier requests select actions and targets, never expressions or patches.
const at=(object,path)=>path.split('.').reduce((v,k)=>v?.[k],object);
export function effectValue(value,state,context={}){
 if(value===undefined)return undefined;
 if(typeof value==='number'||typeof value==='boolean'||typeof value==='string'||value===null)return value;
 if(value?.state)return at(state,value.state)??value.default;
 if(value?.context)return at(context,value.context)??value.default;
 if(!value?.op)throw Error('未支持的效果值');
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
 if(!condition)return true;
 if(condition.all)return condition.all.every(x=>effectMatches(x,state,context));
 if(condition.any)return condition.any.some(x=>effectMatches(x,state,context));
 if(condition.not)return !effectMatches(condition.not,state,context);
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
   rows.push({source:id,...e,value});
  }
 }
 for(const active of state.activeResourceEffects??[]){
  if(active.suspended||active.remainingRounds===0||active.remainingMinutes===0)continue;
  for(const e of active.effects??[])if(e.stat===stat&&effectMatches(e.when,state,context))rows.push({source:active.sourceId,...e,value:effectValue(e.value,state,context)});
 }
 return rows;
}
export function stackEffects(rows,baseline={}){
 const groups={...baseline},penalties={};let additive=0;
 for(const row of rows){if(row.stacking==='add'||!row.group)additive+=row.value;else if(row.value<0)penalties[row.group]=Math.min(penalties[row.group]??0,row.value);else groups[row.group]=Math.max(groups[row.group]??0,row.value);}
 additive+=Object.values(penalties).reduce((a,b)=>a+b,0);
 return {value:additive+Object.values(groups).reduce((a,b)=>a+b,0)-Object.values(baseline).reduce((a,b)=>a+b,0),groups,sources:rows.map(({source,value,group})=>({source,value,group}))};
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
