import {RESOURCE_DEFINITIONS,resourceBonus} from './resource-definitions.mjs';
import {applyAcquisitionEffects} from './resource-effects.mjs';
import {acquireDefinition} from './resource-acquisition.mjs';
// Resource ownership and chosen benefits. No template initializes current state.
export const ownsResource=(s,id)=>s.learnedResources?.[id]?.learned===true;
export const genericPools=s=>Object.entries(s.resources??{}).filter(([name,p])=>p.generic===true&&!p.special&&!['怒气','化劲','生命','意志','精力'].includes(name));
export const guanlanOwned=s=>s.guanlan?.acquired===true&&!!s.guanlan.source;
export const kitAttribute=(s,name)=>resourceBonus(s,'attribute',{attribute:name});
export const kitTraining=s=>resourceBonus(s,'attack');
export const fengyouActive=s=>resourceBonus(s,'terrainFreedom')>0;
export function applyKitAcquisition(s,id,{source,attributes,poolClassifications,...choices}={}){
 if(!source?.trim())throw Error('取得须有实际事件来源');
 if(poolClassifications)for(const [name,kind]of Object.entries(poolClassifications)){
  const p=s.resources?.[name];if(!p||!['generic','special'].includes(kind))throw Error('须指明实际已有能量池的类型');
  if(p.generic!==undefined&&p.generic!==(kind==='generic'))throw Error('不能改写已有能量池类型');
  p.generic=kind==='generic';p.special=kind==='special';
 }
 if(id==='guanlan-fa'||id==='guanlan'){
  s.guanlan??={acquired:true,source,wufaXP:0};s.guanlan.acquired=true;s.guanlan.source??=source;
  s.guanlan.S??=0;s.guanlan.accumulation??={guanwei:0,hanyang:0,yingwu:0};
  s.guanlan.caster??={grade:'D',level:1,power:3};
  if(attributes)chooseGuanlanAttributes(s,attributes);
 }
 const def=RESOURCE_DEFINITIONS[id];
 for(const required of def?.requires?[].concat(def.requires):[])if(!ownsResource(s,required)&&!(required==='guanlan-fa'&&guanlanOwned(s)))throw Error('尚未取得前置资源：'+required);
 const attrs=Object.fromEntries(Object.entries(s.attributes).map(([name,n])=>[name,n+kitAttribute(s,name)-(s.attributeDamage?.[name]??0)]));
 acquireDefinition(s,id,def,choices,{source,INT:attrs.智力,PER:attrs.感知,STR:attrs.力量,WILL:attrs.意志,definitions:RESOURCE_DEFINITIONS});
 if(!s.kitApplied?.[id])applyAcquisitionEffects(s,def?.acquire);
 (s.kitApplied??={})[id]={source};
}
export function chooseGuanlanAttributes(s,allocation){
 if(!guanlanOwned(s)||s.guanlan.initialAttributes)throw Error('身心初蜕尚未取得或已经分配');
 const names=['力量','敏捷','智力','感知','意志','风度'];
 if(!allocation||Object.entries(allocation).some(([k,v])=>!names.includes(k)||!Number.isInteger(v)||v<0)||Object.values(allocation).reduce((n,v)=>n+v,0)!==2)throw Error('身心初蜕须分配合计2点属性');
 s.guanlan.initialAttributes=structuredClone(allocation);
}
export function chooseGuanlanAccumulation(s,resourceId,direction,pool){
 if(!guanlanOwned(s))throw Error('尚未持有观澜法');
 const learned=s.learnedResources?.[resourceId];
 if(!learned?.learned||learned.tree!=='guanlan'||learned.grade!=='D'||learned.kind!=='technique')throw Error('积健为雄须首次完整学会本树独立D级技艺');
 const g=s.guanlan;g.accumulation??={guanwei:0,hanyang:0,yingwu:0};g.accumulatedArts??={};
 if(g.accumulatedArts[resourceId])throw Error('同门技艺已经取得积累');
 if(!['guanwei','hanyang','yingwu'].includes(direction)||g.accumulation[direction]>=2)throw Error('所选方向本阶最多两次');
 if(direction==='hanyang'){
  if(!genericPools(s).some(([name])=>name===pool))throw Error('涵养须选择已有非特殊通用能量池');
  s.resources[pool].max+=5; // Capacity only; never refill current energy.
 }
 g.accumulation[direction]++;g.accumulatedArts[resourceId]={direction,...(pool?{pool}:{})};
}
export function settleGuanlanAdventure(s,eventId){
 if(!guanlanOwned(s))return {xp:0};
 const g=s.guanlan;g.adventures??=[];
 if(g.adventures.includes(eventId))throw Error('该完整冒险已经结算观澜收益');
 g.adventures.push(eventId);s.xp+=3;if(g.firstInsight)g.S=Math.min(9,(g.S??0)+1);
 return {xp:3,S:g.S??0};
}
export function guanlanInsight(s,{sceneId,condition,qualified,source},die){
 if(!guanlanOwned(s)||qualified!==true||!source||!sceneId)throw Error('须实际持有观澜与有来源的真实危境机会');
 if(!/^(filledA|lethalSelf|lethalAlly|urgent|status:[^:]+:(severe|destructive))$/.test(condition))throw Error('未定义的顿悟触发条件');
 if(s.health?.coma)throw Error('失去意识不能顿悟');
 const g=s.guanlan,key=sceneId+'/'+condition;g.insightEvents??=[];
 if(g.insightEvents.includes(key))throw Error('本场景该顿悟机会已判定');
 if(!Number.isInteger(die)||die<1||die>10)throw Error('顿悟需要一颗自然D10');
 const S=g.S??0,success=die+S>=10;g.insightEvents.push(key);
 if(success){g.wufaXP=(g.wufaXP??0)+1;g.S=Math.min(9,S+1);g.firstInsight=true;}
 return {die,S,success,wufaXP:success?1:0,nextS:g.S??0};
}
