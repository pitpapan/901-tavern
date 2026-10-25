// Opt-in declarative policies; absent policy leaves the established D/C path intact.
import {effectValue} from '../resource-effects.mjs';
import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
const need=(message,field)=>{throw new RuleInputError(message,field);};
const requireFact=(ok,message)=>{if(!ok)throw new IllegalAction(message);};
const grades=['D','C','B','A','S'];
export function highestCasterLevel(state,learned){
 const explicit=state.casting?.highestLevel??learned.qualifications?.highestCasterLevel;
 if(explicit!==undefined){requireFact(Number.isSafeInteger(explicit)&&explicit>=0,'最高施法者等级须为实际登记的非负整数');return explicit;}
 const casters=[...Object.values(state.casting??{}),state.guanlan?.caster].filter(x=>x&&typeof x==='object');
 const levels=casters.map(x=>Number.isSafeInteger(x.level)&&x.level>=0?x.level:grades.includes(x.grade)?grades.indexOf(x.grade)+1:undefined);
 if(!levels.length||levels.some(x=>x===undefined))need('增幅须有实际最高施法者等级记录','casting.highestLevel');
 return Math.max(...levels);
}
export function configureProgramPolicy(definition,program,state,learned,plan,vars,rank){
 const policy=program.executionPolicy;if(!policy)return;
 if(policy.requireVersion)requireFact(learned.version===definition.contractVersion,'尚未取得本契约版本');
 if(policy.requireAcquisitionSource)requireFact(typeof learned.source==='string'&&learned.source.trim(),'须有实际取得来源');
 if(policy.requireAdoption)requireFact(learned.adoptionStatus==='adopted','候选资源尚未实际采用取得');
 const rankSpec=policy.ranks?.[rank];requireFact(rankSpec,'本程序没有所选等级的已定义版本');
 vars.rank=rankSpec.level;vars.P=rankSpec.power;
 if(rankSpec.allowPowerBonuses)throw new Error('政策未实现可变威力：开发缺口');
 for(const required of policy.requiredSubskills??[]){
  const actual=(state.skills?.神秘?.subs?.[required]?.level??0)>=1;
  const confirmed=Array.isArray(learned.qualifications)?learned.qualifications.includes(required):learned.qualifications?.subskills?.includes(required);
  requireFact(actual||confirmed,'缺少法术要求的专业资格：'+required);
 }
 if(policy.declaredInputsOnly){
  const allowed=new Set([...Object.keys(program.choices??{}),...Object.keys(program.integerInputs??{})]);
  requireFact(Object.keys(plan.inputs??{}).every(x=>allowed.has(x)),'输入只能选择已登记选项，不能提供效果数值');
 }
 for(const [key,spec]of Object.entries(program.integerInputs??{})){
  const n=plan.inputs?.[key]??spec.default;
  requireFact(Number.isSafeInteger(n)&&n>=spec.minimum,'增幅选择须为范围内的整数：'+key);
  if(!(spec.allowMinimumWithoutMaximum&&n===spec.minimum)){
   if(spec.maximumSource==='highestCasterLevel')vars.highestCasterLevel=highestCasterLevel(state,learned);
   const maximum=effectValue(spec.maximum,state,vars);
   if(!Number.isFinite(maximum))need('缺少增幅上限的实际依据','resource.inputs.'+key);
   requireFact(n<=maximum,'增幅超过实际施法者等级上限');
  }
  vars[key]=n;
 }
}
export function policyPool(program,state,learned,plan,cost){
 const policy=program.executionPolicy?.pool;if(!policy)return null;
 if(policy.selection!=='learned-choice')throw new Error('未知能量政策：开发缺口');
 const pool=learned.choices?.[policy.choice];
 if(typeof pool!=='string'||!pool.trim())need('须有取得时已登记的魔力池选择','resource.pool');
 requireFact(plan.pool===undefined||plan.pool===pool,'不能改用未登记的施法池');
 const energy=state.resources?.[pool];if(!energy)need('须有实际魔力池','resource.pool');
 const qualification=learned.qualifications?.energyPools?.[pool];
 requireFact(energy.kind===policy.kind||qualification?.kind===policy.kind&&typeof qualification.source==='string'&&qualification.source.trim(),'该池没有对应魔力资格记录');
 if(cost)requireFact(Number.isFinite(energy.current)&&energy.current>=cost,'施法能量不足');
 return pool;
}
export function validateProgramTargets(program,actor,target,id,plan){
 const policy=program.targetPolicy;if(!policy)return;
 if(policy.living){
  const kind=target.state.lifeType??plan.targetKinds?.[id];
  if(kind===undefined)need('须有实际目标生命类别','resource.targetKinds');
  requireFact(kind==='living','本术只对活物生效');
  const h=target.state.health,max=target.state.derived?.hpMax;
  if(!h||!Number.isFinite(max)||!Number.isFinite(h.A))need('须有目标实际生命与伤势','resource.target.health');
  requireFact(h.A<max,'已死亡目标不能接受活物治疗');
 }
 if(policy.touch&&target!==actor){
  const reach=actor.reach??plan.touchRange;
  if(!Number.isFinite(reach)||reach<0)need('须有实际触及距离','resource.touchRange');
  return reach;
 }
}
export function validateHealOrder(program,plan){
 if(plan.healOrder===undefined||!program.steps.some(x=>x.op==='heal'))return;
 const order=plan.healOrder;
 requireFact(Array.isArray(order)&&order.length>0&&order.length<=3&&new Set(order).size===order.length&&order.every(x=>['A','L','B'].includes(x)),'治疗分配只能使用不重复的A/L/B伤型');
}
