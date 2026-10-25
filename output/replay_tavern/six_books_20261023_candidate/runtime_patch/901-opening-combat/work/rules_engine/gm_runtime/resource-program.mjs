import {check,spendAction,effectiveAttribute,effectiveSkill,attrAuto,applyStatus,lifeStatus,counteractTemperature,statusLevel,stabilizeWounds} from '../core.mjs';
import {effectValue,effectMatches} from '../resource-effects.mjs';
import {resourceBonus,RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {saveProfile,equipment,RuleInputError,IllegalAction,refreshDerived} from '../combat/mechanics.mjs';
import {resolveDefense,damageEvent} from '../combat/engine.mjs';
import {clearLine,spatialDistance,canObserve} from '../combat/map.mjs';
import {resourceCapability} from '../resource-lifecycle.mjs';
import {healWounds} from '../healing.mjs';
import {programTarget,prepareProgramFacts,validateObjectProgram,applyObjectOperation,objectAttackDefense,damageProgramObject} from './resource-object-program.mjs';
import {configureProgramPolicy,policyPool,validateProgramTargets,validateHealOrder} from './resource-program-policy.mjs';

const need=(message,field)=>{throw new RuleInputError(message,field);};
const requireFact=(condition,message)=>{if(!condition)throw new IllegalAction(message);};
const finite=(value,name)=>{if(!Number.isFinite(value))need('缺少实际数值：'+name,name);return value;};
const freezeSource=(x,state,vars)=>Array.isArray(x)?x.map(v=>freezeSource(v,state,vars)):x&&typeof x==='object'?x.state?effectValue(x,state,vars):x.snapshot?effectValue({context:x.snapshot},state,vars):Object.fromEntries(Object.entries(x).map(([k,v])=>[k,freezeSource(v,state,vars)])):x;

// Programs and formulas are built from paired resource files. A request supplies
// only a registered plan selector; plans contain actual targets and choices.
export function runResourceProgram(root,r,options={}){
 if(options.combat||!options.actorTemplates)return executeProgram(root,r,options);
 const hydrated={...root,actors:Object.fromEntries(Object.entries(root.actors).map(([id,record])=>[id,{...structuredClone(options.actorTemplates[id]??{}),...record,...structuredClone(record.combatCarry??{}),state:record.state}]))};
 const result=executeProgram(hydrated,r,options);
 if(result)for(const [id,a]of Object.entries(hydrated.actors)){root.actors[id].state=a.state;if(a.recoveryLocks){(root.actors[id].combatCarry??={}).recoveryLocks=a.recoveryLocks;if(Object.hasOwn(root.actors[id],'recoveryLocks'))root.actors[id].recoveryLocks=a.recoveryLocks;}}
 return result;
}
function executeProgram(root,r,{combat=false,preActionCleared=false,drawDice}={}){
 const object=root.ruleScene?.objects?.[r.objectId];
 const definition=RESOURCE_DEFINITIONS[object?.resourceId],program=definition?.programs?.[r.operation];
 if(!program)return null;
 const actor=root.actors[r.actorId],s=actor.state,plan=object.plans?.[r.part];
 if(!plan?.source)need('资源操作须有实际目标与选择来源','resource.plan');
 requireFact(s.learnedResources?.[object.resourceId]?.learned===true,'尚未实际学会该资源');
 if(combat&&program.action!=='reflex')requireFact(root.activeId===r.actorId,'须在自己的行动中施展');
 let targetIds=program.target==='self'?[r.actorId]:plan.targetIds??(plan.targetId?[plan.targetId]:[]);
 const vars={...plan.inputs,INT:effectiveAttribute(s,'智力'),PER:effectiveAttribute(s,'感知'),STR:effectiveAttribute(s,'力量'),
  intAuto:attrAuto(s,'智力'),legendaryINT:s.legendaryAttributes?.智力??0,casterId:r.actorId,sourceId:object.resourceId,round:root.round??0};
 for(const [key,choice]of Object.entries(program.choices??{})){
  if(!choice.values.includes(plan.inputs?.[key]))need('须选择本程序已登记的专业/选项：'+key,'resource.inputs.'+key);
  vars[key]=plan.inputs[key];
 }
 const learned=s.learnedResources[object.resourceId],rank=plan.grade??learned.grade??definition.grade;
 requireFact((learned.versions??[learned.grade??definition.grade]).includes(rank),'没有学会或已舍弃所选法术版本');
 if(program.executionPolicy)configureProgramPolicy(definition,program,s,learned,plan,vars,rank);
 else {
  requireFact(['D','C'].includes(rank),'该法术仅有D/C已编写版本');
  requireFact(definition.grade!=='C'||rank==='C','原生C术不能降作未定义的D版');
  vars.rank=rank==='C'?2:1;vars.P=rank==='C'?6:3;
  vars.P=Math.min(rank==='C'?8:4,vars.P+resourceBonus(s,'spellPower',{schools:definition.schools,sourceId:object.resourceId}));
 }
 if(program.executionPolicy)validateHealOrder(program,plan);
 prepareProgramFacts(program,plan,vars);
 const val=x=>effectValue(x,s,vars);
 if(program.area){
  if(combat){
   const center=program.area.center==='self'?actor.position:plan.center;
   if(!Array.isArray(center)||center.length!==2)need('须实际区域中心坐标','resource.center');
   if(program.area.center!=='self'&&program.range!==undefined)requireFact(spatialDistance(root.map,actor.position,center)<=val(program.range),'区域中心超出射程');
   targetIds=Object.entries(root.actors).filter(([id,t])=>t.present!==false&&spatialDistance(root.map,center,t.position)<=val(program.area.radius)&&clearLine(root.map,center,t.position)&&(program.area.team==='enemy'?t.team!==actor.team:program.area.team==='ally'?t.team===actor.team:true)).map(([id])=>id);
  }else {
   if(plan.areaComplete!==true)need('场外范围效果须明确完整受影响目标名单，包含友方','resource.area');
   if(program.area.center!=='self'&&program.range!==undefined)requireFact(finite(plan.centerDistance,'centerDistance')<=val(program.range),'区域中心超出射程');
  }
 }
 requireFact(targetIds.length>0&&(program.repetition||new Set(targetIds).size===targetIds.length),'须选择合法且不重复的目标');
 if(program.target==='single')requireFact(targetIds.length===1,'本动作只作用于单个目标');
 const skill=program.check?.skill??'神秘',sub=plan.sub??definition.subskills?.[0];
 const castingSkill=effectiveSkill(s,skill,sub);vars.E=castingSkill.level;vars.skillAuto=castingSkill.auto;
 if(sub&&definition.subskills?.length&&!definition.subskills.includes(sub))throw new IllegalAction('施法子技能不属于本术专业');
 if(program.casting){
  const caster=s.casting?.imperial??s.guanlan?.caster;
  if(program.executionPolicy?.requiresCaster!==false){
  if(!caster?.grade)need('缺少已保存的等级施法职能','casting.grade');
  requireFact(['D','C','B','A','S'].includes(caster.grade)&&(['C','B','A','S'].includes(caster.grade)||rank==='D'),'缺少对应等级施法职能');
  vars.casterLevel=caster.level??(['D','C','B','A','S'].indexOf(caster.grade)+1);
  }
  // A single school uses the main skill when its subskill is absent. Explicit
  // dual-school qualification is a learning prerequisite, not a second DP sum.
  if(definition.requiresAllSchools)for(const required of definition.subskills??[])requireFact((s.skills?.神秘?.subs?.[required]?.level??0)>=1||(Array.isArray(learned.qualifications)?learned.qualifications.includes(required):learned.qualifications?.subskills?.includes(required)),'缺少法术要求的专业资格：'+required);
  for(const component of program.components??['posture','language','focus'])if(plan.components?.[component]!==true)need('须确认施法成分：'+component,'resource.components.'+component);
  if(program.components?.includes('posture'))requireFact(!['麻痹','精神束缚','纠缠','冻结'].some(t=>statusLevel(s,t).severe),'定身阻止有姿势成分的施法');
 }
 if(program.repetition){
  const count=targetIds.length,spec=program.repetition;
  const maximum=finite(val(spec.maximum??spec.count),'repetition.maximum');
  requireFact(count<=maximum&&(spec.count===undefined||count===val(spec.count)),'本术攻击次数或飞弹枚数不符合已取得版本');
  if(count>1&&spec.extraCondition)requireFact(effectMatches(spec.extraCondition,s,vars),'多枚施放的双手或其他前提尚未满足');
 }
 for(const id of targetIds){
  const target=programTarget(root,id,program);if(!target)need('目标尚无实际状态：'+id,'resource.target');
  validateObjectProgram(program,target,s,vars,root);
  const touchRange=validateProgramTargets(program,actor,target,id,plan);
  if(touchRange!==undefined&&id!==r.actorId){const distance=combat?spatialDistance(root.map,actor.position,target.position):plan.distances?.[id]??plan.distance;requireFact(finite(distance,'distance')<=touchRange,'目标超出实际触及距离');}
  if(program.area?.team==='enemy')requireFact(target.team!==undefined&&actor.team!==undefined&&target.team!==actor.team,'敌方范围效果不能纳入友方或阵营未知目标');
  if(program.area?.team==='ally')requireFact(target.team!==undefined&&target.team===actor.team,'友方范围效果须核对实际阵营');
  if(program.willing&&id!==r.actorId)requireFact(plan.willingTargets?.includes(id),'本术须接触自愿目标');
  if(!program.area&&program.range!==undefined&&id!==r.actorId){
   const distance=combat?spatialDistance(root.map,actor.position,target.position):plan.distances?.[id]??plan.distance;
   requireFact(finite(distance,'distance')<=val(program.range),'目标超出作用距离');
  }
  if(program.lineOfEffect!==false&&id!==r.actorId){
   const line=combat?clearLine(root.map,actor.position,target.position):plan.effectLine;
   requireFact(line===true,'目标没有已确认的效果线');
   if(program.precise!==false)requireFact(combat?(target.objectRecord?plan.precise===true:canObserve(root,target,r.actorId)):plan.precise===true,'单体施法须精确定位目标');
  }
 }
 if(s.resourceCooldowns?.[object.resourceId]>0)throw new IllegalAction('资源仍在冷却');
 const cost=val(program.cost??(rank==='C'?3:1))+val(program.repetition?.extraCost??0)*Math.max(0,targetIds.length-1);
 const selectedPool=policyPool(program,s,learned,plan,cost),pool=selectedPool??plan.pool??s.casting?.imperial?.pool;
 if(cost&&!program.executionPolicy?.pool){
  const energy=s.resources?.[pool];if(!energy)need('须选择实际施法能量池','resource.pool');
  if(definition.tree==='guanlan')requireFact(energy.generic===true&&!energy.special,'此技艺须单个非特殊通用能量池');
  else requireFact(pool===s.casting?.imperial?.pool,'法术须使用本职施法池');
  requireFact(energy.current>=cost,'施法能量不足');
 }
 if(combat&&program.action){const actions=Array.isArray(program.action)?program.action:[program.action];for(const action of actions){const paid=spendAction(actor.state,action,{preActionCleared});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;}}
 // spendAction clones the state; all subsequent operations use the new state.
 const state=actor.state;if(cost)state.resources[pool].current-=cost;
 const result={resourceId:object.resourceId,operation:r.operation,cost,pool,targets:[],damage:[]};
 if(program.cooldown)(state.resourceCooldowns??={})[object.resourceId]=val(program.cooldown)+(program.cooldownPolicy?.clock==='elapsed-rounds'?0:1);
 if(program.casting&&program.components?.includes('posture')&&['medium','heavy'].includes(state.equippedArmorClass)){
  const die=drawDice()[0];if(die<=(state.equippedArmorClass==='heavy'?3:1))return {...result,armorFailure:true,die};
 }
 if(program.casting&&program.components?.includes('focus')){
  const dc=state.statuses.reduce((n,x)=>n+Math.max(0,x.points-(x.ignoredPoints??0)),0);
  if(dc){const rolls=['will','fort'].map(type=>{
    const profile=saveProfile(actor,type);return check(state,{poolBase:profile.dp,attributeAutoOverride:0,dice:drawDice(),context:{willResistance:type==='will',physical:type==='fort'}});
   });const total=rolls.reduce((n,x)=>n+x.rolledSuccesses,0);result.concentration={dc,total,rolls,success:total>=dc};
   if(total<dc)return {...result,concentrationFailure:true};
  }
 }
 if(program.check){const roll=check(state,{attribute:program.check.attribute??'智力',skill,sub,modifier:val(program.check.modifier??0),dice:drawDice(),context:{casting:true,mentalPower:true,somatic:program.components.includes('posture'),schools:definition.schools}});requireFact(roll.eligible,roll.reason);vars.cast=roll.total;result.casting=roll;}
 for(const targetId of targetIds){
  const target=programTarget(root,targetId,program),local={...vars,targetId,target:target.state};let lastDamage=0;
  const resistance=Math.max(0,resourceBonus(target.state,'spellResistance',{casterId:r.actorId,sourceId:object.resourceId,schools:definition.schools}));
  local.P=program.ignoreSpellResistance?vars.P:Math.max(0,vars.P-resistance);
  const value=x=>effectValue(x,state,local),out={targetId,effectivePower:local.P,steps:[]};
  if(program.casting&&local.P===0){result.targets.push(out);continue;}
  const immunity=(program.effectTypes??[]).find(x=>resourceCapability(target.state,x+'Immunity')?.level>=local.rank+(program.effectGradeBonus??0));
  if(immunity){out.immune=immunity;result.targets.push(out);continue;}
  resolveProgramSteps({root,r,object,definition,program,plan,state,target,local,out,result,rank,skill,sub,drawDice});
  result.targets.push(out);
 }
 return result;
}

function resolveProgramSteps({root,r,object,definition,program,plan,state,target,local,out,result,rank,skill,sub,drawDice}){
 const value=x=>effectValue(x,state,local),targetId=target.id??local.targetId;let lastDamage=0;
  for(const op of program.steps){
   if(!effectMatches(op.when,state,local))continue;
   const objectResult=applyObjectOperation(op,{root,target,state,local,object,r,plan});
   if(objectResult){out.steps.push(objectResult);
   }else if(op.op==='inspect'){
    out.steps.push({op:'inspect',stat:op.stat,value:Math.max(0,resourceBonus(target.state,op.stat,{casterId:r.actorId,sourceId:object.resourceId,schools:definition.schools}))});
   }else if(op.op==='save'){
    const p=saveProfile(target,op.type,{mental:program.effectTypes?.includes('mind')||op.mental===true});const rolled=check(target.state,{poolBase:p.dp-value(op.penalty??0),attributeAutoOverride:p.fixed,reExtraSuccesses:p.extra,dice:drawDice(),context:{willResistance:op.type==='will',reflex:op.type==='reflex',physical:op.type!=='will'}});
    local[op.as??'save']=rolled.total;out.steps.push({op:'save',...rolled});
   }else if(op.op==='attack'){
    const weapon=value(op.weapon),defense=objectAttackDefense(target)??resolveDefense(root,targetId,r.actorId,{ranged:true,contact:op.contact===true,...(op.energyWeapon?{flatFootedLevel:1}:{}),ap:value(op.ap??0),magic:value(op.magic??0),speed:value(op.speed??0),defenseMode:plan.defenseModes?.[targetId]});
    if(defense.pending)need('须目标声明防御方式','resource.defense');
    const roll=check(state,{attribute:'智力',skill,sub,modifier:weapon+value(op.modifier??0)+resourceBonus(state,'attack',{targetId,schools:definition.schools})-defense.total,dice:drawDice(),context:{attack:true,casting:true,mentalPower:true,somatic:program.components.includes('posture'),schools:definition.schools,targetId}});
    local.hit=Math.max(0,roll.total-(defense.extraSuccesses??0));local.damage=Math.min(local.hit,value(op.cap??{op:'add',args:[{op:'mul',args:[4,{context:'P'}]},{context:'E'}]}));
    out.steps.push({op:'attack',weapon,defense,roll,damage:local.damage});
   }else if(op.op==='stabilize'){
    const stable=stabilizeWounds(target.state,{sourceId:object.resourceId,casterId:r.actorId,rounds:value(op.rounds)});target.state=stable.state;out.steps.push({op:'stabilize',...stable.result});
   }else if(op.op==='damage'){
    const amount=Math.max(0,Math.floor(value(op.amount))),severity=op.severity??'L';
    const profile=op.profile?program.damageProfiles?.[value(op.profile)]:{kind:op.kind??'energy',energyType:op.energy};
    if(!profile)need('须选择已登记伤害类型','resource.damageProfile');
    const structure=damageProgramObject(root,target,amount,{...profile,magical:program.casting===true,grade:rank});
    if(structure){lastDamage=structure.structuralDamage;local.actualDamage=lastDamage;out.steps.push({op:'damage',...structure});continue;}
    const segments=[{amount,severity,...profile,magical:program.casting===true,grade:rank}];
    if(op.energyWeapon&&amount){const aggravated=Math.min(amount,Math.floor(value(op.weapon??0)/2));if(aggravated&&!equipment(target).armor.energyWeaponProof){segments[0].amount-=aggravated;segments.push({...segments[0],amount:aggravated,severity:'A'});}}
    lastDamage=damageEvent(target,segments,false,result);local.actualDamage=lastDamage;out.steps.push({op:'damage',actualDamage:lastDamage});
   }else if(op.op==='status'){
    const points=Math.max(0,Math.floor(value(op.points)));if(!points)continue;
    const mind=op.mental===true||['欲眠','魅惑','恐惧','精神束缚','沮丧','亢奋'].includes(op.type);
    if(mind&&resourceCapability(target.state,'mindImmunity')?.level>=local.rank+(op.gradeBonus??0)){out.steps.push({op:'status',type:op.type,points:0,immune:true});continue;}
    const remaining=Math.max(0,points-(mind?resourceBonus(target.state,'mindStatusReduction'):0));
    if(op.resistance==='none'){
     if(op.type==='冻结'&&statusLevel(target.state,'冻结').severe)damageEvent(target,[{amount:remaining,severity:'L',kind:'energy',energyType:'cold',magical:true}],false,result);
     else if(remaining)target.state.statuses.push({type:op.type,source:object.resourceId,sourceActorId:r.actorId,points:remaining,...op.properties});
     counteractTemperature(target.state);
    }
    else if(remaining){const applied=applyStatus(target.state,{type:op.type,source:object.resourceId,sourceActorId:r.actorId,properties:op.properties,points:remaining,dice:drawDice()});target.state=applied.state;}
    out.steps.push({op:'status',type:op.type,points});
   }else if(op.op==='heal'){
    out.steps.push({op:'heal',...healWounds(target,{budget:value(op.amount),ratios:op.ratios,order:plan.healOrder??['A','L','B']})});
   }else if(op.op==='removeStatus'){
    let budget=value(op.amount);const allocations=plan.statusAllocations;
    if(op.allocate&&allocations===undefined)need('须指定非心灵状态的治疗分配，可明确选择空列表','resource.statusAllocations');
    const rows=op.allocate?allocations:target.state.statuses.map((x,index)=>({index,points:budget}));
    for(const row of rows){const status=target.state.statuses[row.index];if(!status)need('治疗分配须指向实际状态','resource.statusAllocations');
     if(op.types&&!op.types.includes(status.type))continue;
     if(op.exclude?.includes(status.type)){if(op.allocate)throw new IllegalAction('本术不能消除心灵状态');continue;}
     requireFact(Number.isInteger(row.points)&&row.points>=0,'治疗分配须为非负整数');const n=Math.min(status.points,row.points,budget);status.points-=n;budget-=n;
    }
    target.state.statuses=target.state.statuses.filter(x=>x.points>0);out.steps.push({op:'removeStatus',removed:value(op.amount)-budget});
   }else if(op.op==='effect'){
    const effects=op.effects.map(e=>({...e,value:value(e.value),...(e.when?{when:freezeSource(e.when,state,local)}:{})})),active={id:object.resourceId+'/'+r.actorId,sourceId:object.resourceId,casterId:r.actorId,effects,
     ...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{}),...(op.minutes!==undefined?{remainingMinutes:value(op.minutes)}:{}),scene:op.scene===true};
    const prior=target.state.activeResourceEffects?.find(x=>x.id===active.id);
    for(const e of effects){const old=prior?.effects.find(x=>x.stat===e.stat&&x.group===e.group&&JSON.stringify(x.when)===JSON.stringify(e.when));if(old)e.value=e.value<0?Math.min(e.value,old.value):Math.max(e.value,old.value);}
    target.state.activeResourceEffects=(target.state.activeResourceEffects??[]).filter(x=>x.id!==active.id);target.state.activeResourceEffects.push(active);out.steps.push({op:'effect',active});
    if(target.combatProfile||target.kind)refreshDerived(target);
   }else if(op.op==='trigger'){
    const trigger={sourceId:object.resourceId,casterId:r.actorId,event:op.event,steps:freezeSource(op.steps,state,local),variables:structuredClone(local),rank,skill,sub,
     ...(op.count!==undefined?{remaining:value(op.count)}:{}),...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{}),scene:op.scene===true,
     when:op.condition,target:op.target??'bearer',casting:program.casting===true,schools:definition.schools,elapsed:0};
    const key=object.resourceId+'/'+r.actorId+'/'+op.event;
    (target.state.resourceTriggers??={})[key]=trigger;out.steps.push({op:'trigger',event:op.event});
   }else if(op.op==='capability'){
    const capability={...op,source:object.resourceId,casterId:r.actorId,grade:rank,level:local.rank+(op.gradeBonus??0),...(op.range!==undefined?{range:value(op.range)}:{}),...(op.minutes!==undefined?{remainingMinutes:value(op.minutes)}:{}),...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{})};
    const base=op.id+'/'+object.resourceId+'/'+r.actorId;
    const sequence=op.lifetimePolicy==='independent'?(target.state.resourceCastSequence=(target.state.resourceCastSequence??0)+1):undefined;
    const key=sequence===undefined?base:base+'/'+sequence,prior=target.state.resourceCapabilities?.[key];
    if(prior){capability.level=Math.max(capability.level,prior.level);if(prior.level>local.rank+(op.gradeBonus??0))capability.grade=prior.grade;if(capability.range!==undefined)capability.range=Math.max(capability.range,prior.range??0);}
    (target.state.resourceCapabilities??={})[key]=capability;out.steps.push({op:'capability',capability});
   }else throw new Error('执行器未接入操作（实现缺口，非待裁定）：'+op.op);
  }
 return out;
}

export function fireResourceTriggers(root,bearerId,event,{targetId,context={},drawDice,elapsedRound=0}={}){
 const bearer=root.actors[bearerId],results=[];if(!bearer)return results;
 for(const [key,trigger]of Object.entries(bearer.state.resourceTriggers??{})){
  if(trigger.event!==event||trigger.remaining===0||trigger.remainingRounds===0||trigger.remainingRounds!==undefined&&elapsedRound>trigger.remainingRounds||!effectMatches(trigger.when,bearer.state,context))continue;
  const target=root.actors[trigger.target==='eventTarget'?targetId:bearerId],caster=root.actors[trigger.casterId];
  if(!target?.state||!caster?.state)need('持续效果的施术者或实际受术者状态缺失','resource.trigger');
  trigger.elapsed++;if(trigger.remaining!==undefined&&--trigger.remaining===0)delete bearer.state.resourceTriggers[key];
  const local={...trigger.variables,...context,targetId:target.id??targetId??bearerId,tick:trigger.elapsed},result={damage:[],sourceId:trigger.sourceId};
  const out={targetId:local.targetId,steps:[]};
  resolveProgramSteps({root,r:{actorId:trigger.casterId},object:{resourceId:trigger.sourceId},definition:{schools:trigger.schools},
   program:{steps:trigger.steps,casting:trigger.casting,components:[]},plan:{},state:caster.state,target,local,out,result,rank:trigger.rank,skill:trigger.skill,sub:trigger.sub,drawDice});
  results.push({...result,...out});
 }
 return results;
}

// Outside initiative, one declared six-second interval advances one periodic
// round. Source formulas were frozen at casting; no mature caster is imported.
export function advanceResourcePeriods(actor,minutes,{drawDice}={}){
 const triggers=Object.values(actor.state.resourceTriggers??{}).filter(x=>x.event==='turnStart');
 if(!triggers.length)return [];
 const total=(actor.state.resourcePeriodicRemainder??0)+minutes*10,rounds=Math.floor(total+1e-9);
 actor.state.resourcePeriodicRemainder=total-rounds;
 const id=actor.id??triggers[0].variables.targetId,root={actors:{[id]:actor}},results=[];
 for(const t of triggers)if(!root.actors[t.casterId])root.actors[t.casterId]={id:t.casterId,state:{}};
 const maxRounds=Math.min(rounds,Math.max(...triggers.map(t=>Math.min(t.remaining??Infinity,t.remainingRounds??Infinity))));
 for(let i=1;i<=maxRounds;i++)results.push(...fireResourceTriggers(root,id,'turnStart',{drawDice,elapsedRound:i}));
 return results;
}
