// Shared declarative operations on sourced, saved physical objects.
import {effectValue,effectMatches} from '../resource-effects.mjs';
import {applyStructuralDamage} from '../structural-damage.mjs';
import {resourceCapability} from '../resource-lifecycle.mjs';
import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
const need=(m,f)=>{throw new RuleInputError(m,f);};
const requireFact=(x,m)=>{if(!x)throw new IllegalAction(m);};
const get=(x,p)=>p.split('.').reduce((v,k)=>v?.[k],x);
function objectPath(path){requireFact(typeof path==='string'&&(path.startsWith('object.')||path.startsWith('surface.'))&&!path.split('.').some(k=>['__proto__','constructor','prototype'].includes(k)),'事实操作只能指向声明的物体字段');return path.split('.');}
export function programTarget(root,id,program){
 if(['physical-target','attack-target'].includes(program.targetEntity)&&root.actors[id])return root.actors[id];
 if(!['scene-object','physical-target','attack-target'].includes(program.targetEntity))return root.actors[id];
 const o=root.ruleScene?.objects?.[id];
 if(!o?.source?.trim()||o.type!=='physicalObject'||!o.state?.object)need('须有已登记的实际物体及来源','resource.object');
 return {id,kind:'scene-object',state:o.state,position:objectPosition(root,o),objectRecord:o};
}
export function objectPosition(root,o){return o.state?.object?.holderId?root.actors[o.state.object.holderId]?.position:o.position;}
export function prepareProgramFacts(program,plan,vars){
 if(!program.facts)return;
 if(!plan.factSource?.trim())need('实际观察事实须有主持登记来源','resource.factSource');
 vars.facts={};
 for(const [key,spec]of Object.entries(program.facts)){
  const x=plan.facts?.[key];
  if(x===undefined)need('缺少实际观察事实：'+key,'resource.facts.'+key);
  requireFact(spec.type==='number'?Number.isFinite(x)&&(spec.minimum===undefined||x>=spec.minimum)&&(spec.maximum===undefined||x<spec.maximum):spec.values?.includes(x),'实际观察事实不符合声明类型：'+key);
  vars.facts[key]=x;
 }
}
export function validateObjectProgram(program,target,state,vars,root){
 const local={...vars,target:target.state};
 if(program.targetEntity==='attack-target'&&target.objectRecord){
  const o=target.state.object,d=o.durability,def=o.defense;
  if(!d||![d.current,d.max,d.hardness,def?.contact,def?.extraSuccesses].every(Number.isFinite)||d.current<=0||d.max<=0||d.current>d.max||d.hardness<0||def.contact<0||def.extraSuccesses<0)need('物体攻击须有实际接触防御、耐久与硬度','resource.object.defense');
  if(target.objectRecord.mapFeatureId!==undefined){const f=root.map?.features?.find(x=>x.id===target.objectRecord.mapFeatureId);if(!f?.durability||f.durability.current!==d.current)need('物体与地图耐久须一致','resource.object.durability');}
 }
 for(const [path,spec]of Object.entries(program.requiredTargetFacts??{})){const v=get(target.state,path);if(typeof v!==spec.type||spec.type==='number'&&!Number.isFinite(v))need('缺少实际目标事实：'+spec.label,'resource.target.'+path);}
 for(const rule of program.preconditions??[])requireFact(effectMatches(rule.when,state,local),rule.message);
 for(const op of program.steps){
  if(op.op==='setFact'||op.op==='removeEntries'){
   objectPath(op.path);const old=get(target.state,op.path);
   if(old===undefined)need('缺少目标实际字段：'+op.path,'resource.target.'+op.path);
   if(op.op==='setFact')requireFact(typeof old===typeof effectValue(op.value,state,local),'事实变更类型不一致');
   else {requireFact(Array.isArray(old),'事实列表须为实际数组');for(const entry of old)for(const [key,type]of Object.entries(op.entryFields??{}))if(typeof entry?.[key]!==type)need('缺少污渍是否可简单清洗的实际事实','resource.object.stains');}
   if(op.mapBinding&&target.objectRecord.mapFeatureId!==undefined){
    const f=root.map?.features?.find(f=>f.id===target.objectRecord.mapFeatureId);
    if(!f||typeof f[op.mapBinding]!==typeof old)need('物体关联地图事实缺失','resource.object.mapFeatureId');
    requireFact(f[op.mapBinding]===old,'物体和地图事实冲突，须先核对当前锁状态');
   }
  }
 }
}
export function applyObjectOperation(op,{root,target,state,local,object,r,plan}){
 if(op.op==='setFact'){
  const keys=objectPath(op.path),last=keys.pop(),parent=keys.reduce((v,k)=>v[k],target.state),value=effectValue(op.value,state,{...local,target:target.state});parent[last]=value;
  if(op.mapBinding&&target.objectRecord.mapFeatureId!==undefined)root.map.features.find(f=>f.id===target.objectRecord.mapFeatureId)[op.mapBinding]=value;
  return {op:op.op,path:op.path,value};
 }
 if(op.op==='removeEntries'){
  const keys=objectPath(op.path),last=keys.pop(),parent=keys.reduce((v,k)=>v[k],target.state),old=parent[last];parent[last]=old.filter(entry=>!effectMatches(op.match,state,{...local,entry}));
  return {op:op.op,path:op.path,removed:old.length-parent[last].length};
 }
 if(op.op==='observe'){
  const values=Object.fromEntries(Object.entries(op.values).map(([k,v])=>[k,effectValue(v,state,local)]));
  const record={sourceId:object.resourceId,casterId:r.actorId,factSource:plan.factSource,values};(target.state.resourceObservations??={})[object.resourceId]=record;return {op:'observe',...record};
 }
 return null;
}
// Consumers query live saved capabilities; the classifier supplies no bonuses.
export function objectEnvironment(root,id,{distance=0,underwater=false,waterPenalty=0}={}){
 const o=root.ruleScene?.objects?.[id];if(!o?.state?.object)need('缺少实际物体','objectEnvironment');
 const light=resourceCapability(o.state,'illumination'),water=resourceCapability(o.state,'waterproof'),silence=resourceCapability(o.state,'soundSilenced');
 return {illuminates:!!light&&distance<=light.range,lightRadius:light?.range??0,soundSuppressed:!!silence,
  resistsWater:!!water,resistsFog:!!water,waterPenalty:underwater&&water?0:waterPenalty};
}

export function objectAttackDefense(target){return target.objectRecord?{total:target.state.object.defense.contact,extraSuccesses:target.state.object.defense.extraSuccesses,source:'actual-object-contact-defense'}:null;}
export function damageProgramObject(root,target,amount,profile){
 if(!target.objectRecord)return null;
 const result=applyStructuralDamage(target.state.object,amount,profile);
 if(target.objectRecord.mapFeatureId!==undefined){const f=root.map.features.find(x=>x.id===target.objectRecord.mapFeatureId);f.durability.current=target.state.object.durability.current;if(result.destroyed)f.destroyed=true;}
 return result;
}
