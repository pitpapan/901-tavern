import {inspectProjectionCreation,createProjection,inspectProjectionControl,controlProjection,dispatchProjectionCue} from '../resource-projections.mjs';
import {observeResourceObscuration} from '../resource-obscuration.mjs';
import {retainedSelection,nextResourceEffectSerial} from '../resource-ongoing.mjs';
import {createDecoys,redirectDecoyAttack} from '../resource-decoys.mjs';
import {discloseAttackOrigin,recordSensoryCue} from '../resource-discovery.mjs';
import {drainAutomaticResourceEvents,withAutomaticBatch} from '../resource-automatic-events.mjs';
import {recordPerception} from '../resource-perception.mjs';
import {spellResistanceFor} from '../resource-spell-resistance.mjs';
import {validateAdditionalDamageOrder} from '../resource-additional-damage.mjs';
import {selectedTriggerKeys} from '../resource-trigger-lifecycle.mjs';
import {accrueRoundCosts} from '../resource-ongoing.mjs';
import {installPeriodicRate,periodicDamageTick} from '../resource-periodic-clock.mjs';
import {selectConeTargets,selectSphereTargets,inspectRecipientSave} from '../resource-targeting.mjs';
import {inspectTargetAllocation,prepareTargetProgression,commitTargetProgression} from '../resource-target-budgets.mjs';
import {inspectRequiredItems} from '../resource-materials.mjs';
import {adjustIncomingDamage} from '../resource-damage-modifiers.mjs';
import {inspectStatusBudget,reduceStatusBudget} from '../resource-status-budget.mjs';
import {assertSceneEffectLimit,recordSceneEffectUse,queueInitiativeChange} from '../resource-turn-order.mjs';
import {initiativeContext} from '../combat/initiative.mjs';
import {accumulateResource} from '../resource-accumulators.mjs';
import {settleResourceDeaths,accrueEffectiveTriggerRounds,resolveDeathRecovery,resolveResourceInstantDeath} from '../resource-death.mjs';
import {recordResourceUse} from '../resource-use-cooldowns.mjs';
import {requireProgramOperator,assertProgramInputs,assertOperationOutput} from '../program-operators.mjs';
import {statusConcentrationPenalty} from '../resource-penalties.mjs';
import {evaluateApplicability,collectImmunities} from '../resource-applicability.mjs';
import {resolveResistance} from '../resource-resistance.mjs';
import {restoreResourcePool,validatePoolRestore,validatePoolTransfer,transferResourcePool} from '../resource-pools.mjs';
import {BASIC_ACTIONS} from '../resource-action-bindings.mjs';
import {loseResourceAction} from '../resource-action-losses.mjs';
import {selectStatusSource,consumeStatusSource} from '../resource-status-sources.mjs';
import {hasResourceSource,endResourceSource,selectedTimedResource,endTimedResource,exclusiveResourceChoice,timedResourceInstances,inspectTimedResourceEnd} from '../resource-instances.mjs';
import {weaponInstance,enchantWeapon} from '../resource-weapons.mjs';
import {temporaryHealthChoice,registerTemporaryHealth} from '../resource-temporary-health.mjs';
import {adjustCounter,addCounterCondition} from '../resource-counters.mjs';
import {check,checkProfile,rollCheckProfile,spendAction,effectiveAttribute,effectiveSkill,attrAuto,applyStatus,lifeStatus,counteractTemperature,statusLevel,syncResourceHealth} from '../core.mjs';
import {effectValue,effectMatches,stackEffects,retainStrongerEffects,retainResourceGrade} from '../resource-effects.mjs';
import {resourceBonus,resourceEffects,RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {saveProfile,equipment,combatRuleContext,RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
import {resolveDefense,damageEvent} from '../combat/engine.mjs';
import {clearLine,spatialDistance,canObserve} from '../combat/map.mjs';
import {assertEffectUseAllowed} from '../resource-lifecycle.mjs';
import {syncActorWounds} from '../resource-wounds.mjs';
import {healWounds} from '../healing.mjs';
import {registerResourceAura} from '../resource-auras.mjs';

const need=(message,field)=>{throw new RuleInputError(message,field);};
const requireFact=(condition,message)=>{if(!condition)throw new IllegalAction(message);};
const finite=(value,name)=>{if(!Number.isFinite(value))need('缺少实际数值：'+name,name);return value;};
const freezeSource=(x,state,vars)=>Array.isArray(x)?x.map(v=>freezeSource(v,state,vars)):x&&typeof x==='object'?x.choice?vars[x.choice]:x.state?effectValue(x,state,vars):Object.fromEntries(Object.entries(x).map(([k,v])=>[k,freezeSource(v,state,vars)])):x;

function componentSpec(program,op,rank){
 let spec;
 if(op.component!==undefined){
  if(!Object.hasOwn(program.effectComponents??{},op.component))throw Error('效果组件未登记：'+op.component);
  spec=program.effectComponents[op.component];
 }else spec={families:program.effectTypes??[],gradeBonus:op.gradeBonus??program.effectGradeBonus??0,mode:program.immunityMode??'any-blocks'};
 const families=[...(spec.families??[])];
 // Compatibility for old status contracts; new programs declare their family.
 if(op.op==='status'&&op.component===undefined&&(op.mental===true||['欲眠','魅惑','恐惧','精神束缚','沮丧','亢奋','仇恨'].includes(op.type))&&!families.includes('mind'))families.push('mind');
 if(op.op==='status'&&op.component===undefined&&!families.includes('status:'+op.type))families.push('status:'+op.type);
 return {...spec,grade:spec.grade??rank,families};
}
function resistedAmount(op,amount,local,targetId){
 if(!op.resistance||typeof op.resistance!=='object')return amount;
 const receipt=local.resistanceReceipts?.[op.resistance.receipt];
 if(!receipt||receipt.targetId!==targetId||receipt.component!==(op.component??null))throw Error('效果缺少本目标/组件的实际抵抗收据');
 if(op.resistance.kind==='subtract')return resolveResistance({kind:'subtract',incoming:amount,perSuccess:op.resistance.perSuccess},receipt.roll).remaining;
 if(op.resistance.kind==='resolved')return amount;
 throw Error('未支持的抵抗收据消费方式');
}

// Programs and formulas are built from paired resource files. A request supplies
// only a registered plan selector; plans contain actual targets and choices.
export function isReflexResource(root,command){
 const basic=BASIC_ACTIONS[command.abilityId];
 if(basic)return RESOURCE_DEFINITIONS[basic.resourceId]?.programs?.[basic.operation]?.action==='reflex';
 if(command.abilityId!=='mechanism')return false;
 const o=root.ruleScene?.objects?.[command.objectId];
 return o?.type==='kitResource'&&RESOURCE_DEFINITIONS[o.resourceId]?.programs?.[command.operation]?.action==='reflex';
}
export function runResourceProgram(root,r,options={}){
 if(options.combat||!options.actorTemplates)return executeProgram(root,r,options);
 const hydrated={...root,actors:Object.fromEntries(Object.entries(root.actors).map(([id,record])=>[id,{...structuredClone(options.actorTemplates[id]??{}),...record,...structuredClone(record.combatCarry??{}),team:record.team??root.ruleScene?.spatial?.actors?.[id]?.team,state:record.state}]))};
 const result=executeProgram(hydrated,r,options);
 if(result)for(const [id,a]of Object.entries(hydrated.actors)){root.actors[id].state=a.state;if(a.recoveryLocks){(root.actors[id].combatCarry??={}).recoveryLocks=a.recoveryLocks;if(Object.hasOwn(root.actors[id],'recoveryLocks'))root.actors[id].recoveryLocks=a.recoveryLocks;}}
 return result;
}
export function runBasicResourceAction(root,command,options={}){
 const binding=BASIC_ACTIONS[command.abilityId];if(!binding)return null;
 const definition=RESOURCE_DEFINITIONS[binding.resourceId];
 const object={resourceId:binding.resourceId,plans:{basic:{source:definition.source,inputs:combatRuleContext(root.actors[command.actorId])}}};
 return executeProgram(root,{actorId:command.actorId,operation:binding.operation,part:'basic'},options,object);
}
function executeProgram(root,r,{combat=false,preActionCleared=false,drawDice}={},boundObject){
 const object=boundObject??root.ruleScene?.objects?.[r.objectId];
 const definition=RESOURCE_DEFINITIONS[object?.resourceId],program=definition?.programs?.[r.operation];
 if(!program)return null;
 assertProgramInputs(program);
 const actor=root.actors[r.actorId],s=actor.state,plan=object.plans?.[r.part];
 const attackOrigin=combat&&Array.isArray(actor.position)?[...actor.position]:null;
 if(!plan?.source)need('资源操作须有实际目标与选择来源','resource.plan');
 requireFact(definition.access==='common'||s.learnedResources?.[object.resourceId]?.learned===true,'尚未实际学会该资源');
 if(program.recast==='after-expiry')requireFact(!s.activeResourceEffects?.some(e=>e.sourceId===object.resourceId&&e.remainingRounds!==0&&e.remainingMinutes!==0),'同名任意版本在生效期间不能再次施放');
 if(combat&&program.action!=='reflex')requireFact(root.activeId===r.actorId,'须在自己的行动中施展');
 if(program.endEffects==='own-selected'){
  const targetIds=[...new Set(plan.targetIds??(plan.targetId?[plan.targetId]:[]))];
  requireFact(targetIds.length>0,'须选择当前仍承受本人该来源效果的目标');
  const selections=targetIds.map(targetId=>{
   requireFact(root.actors[targetId],'目标没有实际状态');
   const candidates=timedResourceInstances(root,targetId).filter(x=>x.sourceId===object.resourceId&&x.casterId===r.actorId);
   const choice=plan.effectChoices?.[targetId];if(candidates.length>1&&!choice)need('须选择本人要结束的实际实例','resource.effectChoices');
   const row=choice?candidates.find(x=>x.id===choice):candidates[0];
   requireFact(row&&!row.protected,'目标没有可由本人主动结束的该来源');inspectTimedResourceEnd(root,targetId,row);return {targetId,row};
  });
  if(combat){const paid=spendAction(s,'free',{preActionCleared});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;}
  return {resourceId:object.resourceId,operation:r.operation,cost:0,ended:selections.map(({targetId,row})=>({targetId,...endTimedResource(root,targetId,row,{reason:'voluntary-end',drawDice,combat})}))};
 }
 if(program.toggle==='off'){
  requireFact(hasResourceSource(s,object.resourceId,r.actorId),'该来源尚未开启');
  if(combat){const paid=spendAction(s,'free',{preActionCleared});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;}
  const ended=endResourceSource(actor.state,object.resourceId,r.actorId,{drawDice});
  return {resourceId:object.resourceId,operation:r.operation,cost:0,ended,settlements:flushResourceTriggerEnds(root,r.actorId,{drawDice,combat})};
 }
 if(program.toggle==='on')requireFact(!hasResourceSource(s,object.resourceId,r.actorId),'该来源已开启，不能重施绕过开关');
 const channel=s.resourceChannels?.[object.resourceId];
 if(program.channel==='maintain'||program.channel==='release')requireFact(channel,'没有仍在维持的本术实例');
 if(program.channel==='release'){
  if(combat){const spent=spendAction(s,'free',{preActionCleared});requireFact(spent.result.allowed,spent.result.reason);actor.state=spent.state;}
  delete actor.state.resourceChannels[object.resourceId];return {resourceId:object.resourceId,operation:r.operation,released:true,cost:0};
 }
 let targetIds=program.target==='self'?[r.actorId]:plan.targetIds??(plan.targetId?[plan.targetId]:[]);
 const vars={...plan.inputs,INT:effectiveAttribute(s,'智力'),PER:effectiveAttribute(s,'感知'),STR:effectiveAttribute(s,'力量'),
  intAuto:attrAuto(s,'智力'),legendaryINT:s.legendaryAttributes?.智力??0,casterId:r.actorId,sourceId:object.resourceId,round:root.round??0};
 const targetResistance=target=>program.spellResistance==='ignore'?0:program.weaponTarget?Math.max(0,weaponInstance(target.state,plan.weaponId).spellResistance??0):spellResistanceFor(target.state,{casterId:r.actorId,sourceId:object.resourceId,schools:definition.schools});
 const learned=s.learnedResources?.[object.resourceId]??{},rank=plan.grade??learned.grade??definition.grade;
 if(program.supportedGrades&&!program.supportedGrades.includes(rank)){const e=new Error('该实际等级的程序尚未实现：'+rank);e.code='UNSUPPORTED_OPERATION';throw e;}
 assertEffectUseAllowed(s,{families:program.effectFamilies??[],grade:rank});
 if(program.casting){
 requireFact((learned.versions??[learned.grade??definition.grade]).includes(rank),'没有学会或已舍弃所选法术版本');
 requireFact(['D','C'].includes(rank),'该法术仅有D/C已编写版本');
 requireFact(definition.grade!=='C'||rank==='C','原生C术不能降作未定义的D版');
 vars.rank=rank==='C'?2:1;vars.P=rank==='C'?6:3;
 const powerRows=resourceEffects(s,'spellPower',{schools:definition.schools,sourceId:object.resourceId}).filter(e=>!program.permanentPowerOnly||e.value<0||e.origin==='definition'&&!RESOURCE_DEFINITIONS[e.source]?.equipment);
 vars.P=Math.min(rank==='C'?8:4,vars.P+stackEffects(powerRows).value);
 }else {vars.rank=0;vars.P=0;}
 if(program.channel==='maintain'){
  requireFact(rank===channel.grade,'维持不能更换法术版本');
  if(program.lockTargets)requireFact(JSON.stringify(targetIds)===JSON.stringify(channel.targetIds),'维持不能更换原定目标');
  Object.assign(vars,channel.variables,{round:root.round??0});
 }
 if(program.casting)requireFact(vars.P>0,'有效威力降到零，不能施展该术');
 const val=x=>effectValue(x,s,vars);
 let areaReceipt;
 if(program.area){
  if(program.area.shape==='cone'){areaReceipt=selectConeTargets(root,r.actorId,program.area,plan,val,{combat});targetIds=areaReceipt.targetIds;}
  else if(program.area.selected){
   const spatial=combat?root:root.ruleScene?.spatial;
   if(!combat&&!spatial?.source)need('范围选择须当前实际位置及来源','resource.spatial');
   const center=program.area.center==='self'?spatial.actors[r.actorId]?.position:plan.center;
   requireFact(Array.isArray(center)&&center.length===2&&center.every(Number.isFinite),'须实际区域中心坐标');
   requireFact(spatialDistance(spatial.map,spatial.actors[r.actorId].position,center)<=val(program.range),'区域中心超出射程');
   for(const id of targetIds){const t=spatial.actors[id];requireFact(root.actors[id]?.present!==false&&t&&spatialDistance(spatial.map,center,t.position)<=val(program.area.radius)&&clearLine(spatial.map,center,t.position),'选定目标不在实际范围内');}
  }else if(combat){
   const center=program.area.center==='self'?actor.position:plan.center;
   if(!Array.isArray(center)||center.length!==2)need('须实际区域中心坐标','resource.center');
   if(program.area.center!=='self'&&program.range!==undefined)requireFact(spatialDistance(root.map,actor.position,center)<=val(program.range),'区域中心超出射程');
   targetIds=Object.entries(root.actors).filter(([id,t])=>t.present!==false&&spatialDistance(root.map,center,t.position)<=val(program.area.radius)&&clearLine(root.map,center,t.position)&&(program.area.team==='enemy'?t.team!==actor.team:program.area.team==='ally'?t.team===actor.team:true)).map(([id])=>id);
  }else {
   if(plan.areaComplete!==true)need('场外范围效果须明确完整区域人物名单，包含友方','resource.area');
   if(['enemy','ally'].includes(program.area.team)){
    const team=id=>root.ruleScene?.spatial?.actors?.[id]?.team??root.actors[id]?.team;
    if(!team(r.actorId)||targetIds.some(id=>!team(id)))need('范围筛选须实际敌我关系','resource.area.team');
    targetIds=targetIds.filter(id=>(program.area.team==='ally')===(team(id)===team(r.actorId)));
   }
   if(program.area.center!=='self'&&program.range!==undefined)requireFact(finite(plan.centerDistance,'centerDistance')<=val(program.range),'区域中心超出射程');
  }
 }
 requireFact((targetIds.length>0||program.area?.shape==='cone')&&(program.target==='sequence'||new Set(targetIds).size===targetIds.length),'须选择合法且不重复的目标');
 vars.targetCount=targetIds.length;vars.components=plan.components??{};
 if(program.exactTargets!==undefined)requireFact(targetIds.length===val(program.exactTargets),'目标次数不符合本级程序');
 if(program.maxTargets!==undefined)requireFact(targetIds.length<=val(program.maxTargets),'超过本次施展的目标次数上限');
 for(const [key,choices]of Object.entries(program.choices??{}))requireFact(choices.includes(vars[key]),'须选择合法的 '+key);
 for(const requirement of program.requirements??[])requireFact(effectMatches(requirement.condition,s,vars),requirement.message);
 if(program.weaponTarget){
  requireFact(targetIds.length===1,'武器施法须唯一实际持有人');
  const holder=root.actors[targetIds[0]];if(!holder)need('缺少武器持有人','resource.target');
  const item=weaponInstance(holder.state,plan.weaponId);
  requireFact(item.location==='carried'&&plan.weaponTouchConfirmed===true,'须实际接触该武器');
  if(combat&&targetIds[0]!==r.actorId&&!plan.willingTargets?.includes(targetIds[0]))throw new IllegalAction('争夺武器的接触判定尚未接入（实现缺口），不能自动视为触及');
 }
 if(program.target==='single')requireFact(targetIds.length===1,'本动作只作用于单个目标');
 const skill=program.check?.skill??'神秘',sub=plan.sub??definition.subskills?.[0];
 const castingSkill=effectiveSkill(s,skill,sub);vars.E=castingSkill.level;vars.skillAuto=castingSkill.auto;
 if(sub&&definition.subskills?.length&&!definition.subskills.includes(sub))throw new IllegalAction('施法子技能不属于本术专业');
 if(program.casting){
  const caster=s.casting?.imperial??s.guanlan?.caster;
  requireFact(caster&&(['C','B','A','S'].includes(caster.grade)||rank==='D'),'缺少对应等级施法职能');
  // A single school uses the main skill when its subskill is absent. Explicit
  // dual-school qualification is a learning prerequisite, not a second DP sum.
  if(definition.requiresAllSchools)for(const required of definition.subskills??[])requireFact((s.skills?.神秘?.subs?.[required]?.level??0)>=1||learned.qualifications?.includes(required),'缺少法术要求的专业资格：'+required);
  for(const component of program.components??['posture','language','focus'])if(plan.components?.[component]!==true)need('须确认施法成分：'+component,'resource.components.'+component);
  if(program.components?.includes('posture'))requireFact(!['麻痹','精神束缚','纠缠','冻结'].some(t=>statusLevel(s,t).severe),'定身阻止有姿势成分的施法');
 }
 const recipientSaves={};
 for(const id of targetIds){
  for(const step of program.steps)if(step.op==='save'&&typeof step.type==='object')((recipientSaves[id]??={})[step.type.recipientChoice]=inspectRecipientSave(step.type,plan.saveChoices?.[id]?.[step.type.recipientChoice],id));
  const target=root.actors[id];if(!target)need('目标尚无实际状态：'+id,'resource.target');
  for(const [key,spec]of Object.entries(program.targetFacts??{})){
   const facts=plan.targetFacts?.[id];
   if(!facts?.source||typeof facts[key]!==spec.type)need('须有来源的目标资格事实：'+key,'resource.targetFacts.'+id+'.'+key);
   if(Object.hasOwn(spec,'equals'))requireFact(facts[key]===spec.equals,spec.message??'目标资格不符');
  }
  if(program.steps.some(op=>op.op==='attack'))validateAdditionalDamageOrder(target.state,r.actorId,plan.additionalDamageOrder);
  for(const op of program.steps)if(op.op==='damage'){
   const segment={amount:1,severity:op.severity??'L',kind:op.kind??'energy',energyType:op.energy};
   const split=op.energyWeapon&&!equipment(target).armor.energyWeaponProof&&val(op.weapon??0)>=2;
   adjustIncomingDamage(target,split?[{...segment,severity:'L'},{...segment,severity:'A'}]:[segment],{sourceActorId:r.actorId,damageNature:program.steps.some(x=>x.op==='attack')?'attack':'fixed'});
  }
  for(const op of program.steps)if(op.targetSceneLimit)assertSceneEffectLimit(target.state,object.resourceId,op.targetSceneLimit);
  for(const op of program.steps)if(op.op==='poolRestore')validatePoolRestore(s,{destinationPool:s.casting?.imperial?.pool,dayId:plan.dayId,context:vars,daily:op.daily});
  for(const op of program.steps)if(op.op==='poolTransfer')validatePoolTransfer(target.state,s,{declaredPool:plan.poolChoices?.[op.choice],destinationPool:s.casting?.imperial?.pool,dayId:plan.dayId,context:vars,daily:op.daily?{...op.daily,key:op.daily.key??object.resourceId}:undefined});
  for(const op of program.steps)if(op.op==='effect'&&op.exclusiveGroup)exclusiveResourceChoice(target.state,{group:op.exclusiveGroup,incomingId:object.resourceId+'/'+r.actorId+(Object.keys(program.effectComponents??{}).length>1?'/'+op.component:''),policy:op.exclusivePolicy,targetId:id,choice:plan.exclusiveChoices?.[id]?.[op.exclusiveGroup]});
  for(const op of program.steps)if(op.op==='temporaryHealth')temporaryHealthChoice(target.state,object.resourceId+'/'+r.actorId,{targetId:id,choice:plan.temporaryHealthChoices?.[id]});
  for(const op of program.steps)if(op.op==='aura'&&op.temporaryAllocation)for(const memberId of plan.targetIds??[])temporaryHealthChoice(root.actors[memberId].state,'aura/'+object.resourceId+'/'+r.actorId,{targetId:memberId,choice:plan.temporaryHealthChoices?.[memberId]});
  for(const op of program.steps)if(op.op==='removeStatus'&&op.budgetScope==='type'){
   const spec=componentSpec(program,op,rank),app=evaluateApplicability(spec,collectImmunities(target.state,RESOURCE_DEFINITIONS));
   if(app.status!=='blocked'){const local={...vars,P:Math.max(0,vars.P-targetResistance(target))};inspectStatusBudget(target.state,{types:op.types,amount:effectValue(op.amount,s,local),targetId:id,choice:plan.statusBudgetChoices?.[id]});}
  }
  for(const op of program.steps)if(op.op==='statusSource')selectStatusSource(target.state,op.type,plan.statusSource);
  for(const op of program.steps)if(op.op==='dispel')selectedTimedResource(root,id,plan.effectChoice,val(op.maximumLevel));
  for(const allocation of program.allocations??[]){
   const chosen=vars[allocation.key],local={...vars,P:Math.max(0,vars.P-targetResistance(target))};
   const total=effectValue(allocation.total,s,local),maximum=effectValue(allocation.maximum,s,local);
   requireFact(chosen&&typeof chosen==='object'&&!Array.isArray(chosen)&&Object.entries(chosen).every(([k,v])=>allocation.keys.includes(k)&&Number.isInteger(v)&&v>=0&&v<=maximum)&&Object.values(chosen).reduce((n,v)=>n+v,0)===total,'属性分配须使用六属性、整数、满足本次总额和单项上限');
  }
  if(program.willing&&id!==r.actorId)requireFact(plan.willingTargets?.includes(id),'本术须接触自愿目标');
  if(program.contact&&id!==r.actorId&&!Array.isArray(plan.willingTargets))need('接触目标须明确自愿名单；非自愿时明确空列表','resource.willingTargets');
  if(!program.area&&program.range!==undefined&&id!==r.actorId){
   const distance=combat?spatialDistance(root.map,actor.position,target.position):plan.distances?.[id]??plan.distance;
   requireFact(finite(distance,'distance')<=val(program.range),'目标超出作用距离');
  }
  if(program.lineOfEffect!==false&&id!==r.actorId){
   const line=combat?clearLine(root.map,actor.position,target.position):plan.effectLine;
   requireFact(line===true,'目标没有已确认的效果线');
   if(program.precise!==false)requireFact(combat?canObserve(root,target,r.actorId):plan.precise===true,'单体施法须精确定位目标');
  }
 }
 const allocation=program.targetAllocation?inspectTargetAllocation(program.targetAllocation,targetIds,plan.targetAllocations,val):null;
 const progression=program.targetProgression?prepareTargetProgression(s,{resourceId:object.resourceId,targetId:targetIds[0],policy:program.targetProgression,version:definition.contractVersion,context:{...vars,P:Math.max(0,vars.P-targetResistance(root.actors[targetIds[0]]))}}):null;
 if(progression)vars.progression=progression.after;
 const materialItems=inspectRequiredItems(s,program.requiredItems,plan.itemChoices);
 if(s.resourceCooldowns?.[object.resourceId]>0)throw new IllegalAction('资源仍在冷却');
 for(const op of program.steps)if(effectMatches(op.when,s,vars)){
  if(op.projection)inspectProjectionCreation(root,r.actorId,op.projection,plan,val);
  if(op.op==='projectionControl')inspectProjectionControl(root,r.actorId,object.resourceId,plan,op.mode);
 }
 const cost=val(program.cost??(rank==='C'?3:1)),pool=plan.pool??s.casting?.imperial?.pool;
 if(cost){
  const energy=s.resources?.[pool];if(!energy)need('须选择实际施法能量池','resource.pool');
  if(definition.tree==='guanlan')requireFact(energy.generic===true&&!energy.special,'此技艺须单个非特殊通用能量池');
  else requireFact(pool===s.casting?.imperial?.pool,'法术须使用本职施法池');
  requireFact(energy.current>=cost,'施法能量不足');
 }
 const counterCosts=(program.counterCosts??[]).map(c=>({...c,amount:val(c.amount)}));
 for(const c of counterCosts){try{adjustCounter(structuredClone(actor.state),c.path,-c.amount,{maximumPath:c.maximumPath,strict:true});}catch(error){throw new IllegalAction(error.message);}}
 if(combat&&program.action){const actions=Array.isArray(program.action)?program.action:[program.action];for(const action of actions){const paid=spendAction(actor.state,action,{preActionCleared,context:actor.statusPermission});requireFact(paid.result.allowed,paid.result.reason);actor.state=paid.state;}}
 // spendAction clones the state; all subsequent operations use the new state.
 const state=actor.state;if(cost)state.resources[pool].current-=cost;
 vars.genericEnergySupported=cost>0&&state.resources[pool]?.generic===true&&!state.resources[pool]?.special;
 const counterPayments=counterCosts.map(c=>adjustCounter(state,c.path,-c.amount,{maximumPath:c.maximumPath,strict:true}));
 const result={resourceId:object.resourceId,operation:r.operation,cost,pool,counterPayments,...(materialItems.length?{materialItems}:{}),targets:[],damage:[],...(areaReceipt?{area:areaReceipt}:{}),...(program.compilation?{programSource:structuredClone(program.compilation)}:{})};
 if(program.casting&&program.components?.includes('language')){recordSensoryCue(root,r.actorId,{source:object.resourceId,kind:'sound',suppression:'unavoidable'});const position=(root.map?root:root.ruleScene?.spatial)?.actors?.[r.actorId]?.position;if(position){const cues=dispatchProjectionCue(root,r.actorId,{kind:'casting',sourceId:object.resourceId,position,channel:'auditory'});if(cues.length)result.projectionCues=cues;}}
 if(program.cooldown)(state.resourceCooldowns??={})[object.resourceId]=val(program.cooldown)+1;
 if(program.cooldownAfterUses)result.resourceUse=recordResourceUse(state,{sourceId:object.resourceId,version:definition.contractVersion,maximum:val(program.cooldownAfterUses.uses),cooldown:program.cooldownAfterUses.rounds});
 if(program.casting&&program.components?.includes('posture')&&['medium','heavy'].includes(state.equippedArmorClass)){
  const die=drawDice()[0];if(die<=(state.equippedArmorClass==='heavy'?3:1))return {...result,armorFailure:true,die};
 }
 if(program.casting&&program.components?.includes('focus')){
  const dc=statusConcentrationPenalty(state);
  if(dc){const rolls=['will','fort'].map(type=>{
    const profile=saveProfile(actor,type);return check(state,{poolBase:profile.dp,attributeAutoOverride:0,dice:drawDice(),context:{willResistance:type==='will',physical:type==='fort'}});
   });const total=rolls.reduce((n,x)=>n+x.rolledSuccesses,0);result.concentration={dc,total,rolls,success:total>=dc};
   if(total<dc){if(program.channel==='maintain')delete state.resourceChannels[object.resourceId];return {...result,concentrationFailure:true};}
  }
 }
 if(program.check){const roll=check(state,{attribute:program.check.attribute??'智力',skill,sub,modifier:val(program.check.modifier??0),dice:drawDice(),context:{casting:true,mentalPower:true,genericEnergySupported:vars.genericEnergySupported,somatic:program.components.includes('posture'),schools:definition.schools}});requireFact(roll.eligible,roll.reason);vars.cast=roll.total;result.casting=roll;}
 const fixedArea=program.area&&!program.steps.some(x=>x.op==='attack');
 const applyTargets=()=>{
 for(const targetId of targetIds){
  const target=root.actors[targetId],local={...vars,targetId,targetFacts:structuredClone(plan.targetFacts?.[targetId]??{}),basePower:vars.P,combat,recipientSaves:recipientSaves[targetId]??{},resistanceReceipts:{}};let lastDamage=0;
  local.P=Math.max(0,vars.P-targetResistance(target));
  const value=x=>effectValue(x,state,local),out={targetId,effectivePower:local.P,steps:[]};
  if(allocation){const allocated=allocation.shares[targetId],resistance=vars.P-local.P;local[program.targetAllocation.as]=Math.max(0,allocated-resistance);out.allocation={allocated,resistance,effective:local[program.targetAllocation.as],refunded:0};}
  if(progression){commitTargetProgression(actor.state,progression);out.progression=structuredClone(progression);}
  if(program.sameSource==='ineffective'&&target.state.activeResourceEffects?.some(e=>e.sourceId===object.resourceId&&e.remainingRounds!==0&&e.remainingMinutes!==0)){out.ineffective='same-source-active';result.targets.push(out);continue;}
  if(program.casting&&local.P===0&&!program.steps.some(x=>x.op==='aura')){result.targets.push(out);continue;}
  const applicability=evaluateApplicability({families:program.effectComponents?[]:program.effectTypes??[],grade:rank,gradeBonus:program.effectGradeBonus??0,mode:program.immunityMode},collectImmunities(target.state,RESOURCE_DEFINITIONS));
  local.immunityFactor=applicability.factor;
  if(applicability.status==='blocked'){out.immune=applicability.blockedFamilies.join('+');result.targets.push(out);continue;}
  const targetMode=program.area?'area':program.target==='selected'?'multiple':'single';
  if(program.steps.some(x=>x.op==='attack')||program.contact&&targetId!==r.actorId&&!plan.willingTargets.includes(targetId)){
   const decoy=redirectDecoyAttack(root,{attackerId:r.actorId,targetId,drawDice,targetMode});
   if(decoy)out.decoy=decoy;
   if(decoy?.redirected){
    (result.resourceTriggers??=[]).push(...fireResourceTriggers(root,r.actorId,'attackResolved',{targetId,context:{melee:program.contact===true,skill,hit:false,actualDamage:0,causedDamage:false},drawDice}));
    result.targets.push(out);continue;
   }
  }
  if(program.contact&&targetId!==r.actorId&&!plan.willingTargets.includes(targetId)){
   const remote=program.remoteContact===true;
   const defense=resolveDefense(root,targetId,r.actorId,{contact:true,ranged:remote,defenseMode:plan.defenseModes?.[targetId]});
   if(defense.pending)need('接触攻击须目标声明防御方式','resource.defense');
   const roll=check(state,{attribute:remote?'敏捷':'力量',skill,sub,modifier:resourceBonus(state,'attack',initiativeContext(root,r.actorId,targetId))-defense.total,dice:drawDice(),context:{attack:true,casting:true,targetId}});
   const hit=roll.total-(defense.extraSuccesses??0)>0;out.steps.push({op:'contact',hit,roll,defense});
   if(!hit){result.targets.push(out);continue;}
   if(!remote)(result.resourceTriggers??=[]).push(...fireResourceTriggers(root,targetId,'incomingHit',{targetId:r.actorId,context:{melee:true},drawDice}));
  }
  resolveProgramSteps({root,r,object,definition,program,plan,state,target,local,out,result,rank,skill,sub,drawDice});
  result.targets.push(out);
 }
 };
 if(fixedArea){withAutomaticBatch(root,applyTargets);const events=flushAutomaticResourceEvents(root,{drawDice,combat});if(events.length)(result.automaticEvents??=[]).push(...events);}else applyTargets();
 if(attackOrigin)for(const row of result.targets)if(row.targetId!==r.actorId&&(row.decoy?.redirected||row.steps.some(step=>['attack','contact'].includes(step.op)&&step.roll))){
  const clue=discloseAttackOrigin(root,row.targetId,r.actorId,{source:object.resourceId,position:attackOrigin});
  if(clue)(result.locationDisclosures??=[]).push({observerId:row.targetId,...clue});
 }
 if(program.channel){
  (actor.state.resourceChannels??={})[object.resourceId]={sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,objectId:r.objectId,part:r.part,grade:rank,
   targetIds:structuredClone(targetIds),variables:structuredClone(vars),lastRound:root.round??0,remainingMinutes:.2};
  if(!combat)result.elapsedMinutes=.1;
 }
 return result;
}

function resolveProgramSteps({root,r,object,definition,program,plan,state,target,local,out,result,rank,skill,sub,drawDice}){
 const value=x=>effectValue(x,state,local),targetId=target.id??local.targetId;let lastDamage=0;
  for(const [stepIndex,step] of program.steps.entries()){
   requireProgramOperator(step.op);
   const op=step.type===undefined?step:{...step,type:step.op==='save'&&typeof step.type==='object'?local.recipientSaves[step.type.recipientChoice]:value(step.type)};
   if(!effectMatches(op.when,state,local))continue;
   const stepStart=out.steps.length;
   const application=componentSpec(program,op,rank),applicability=evaluateApplicability(application,collectImmunities(target.state,RESOURCE_DEFINITIONS));
   local.immunityFactor=applicability.factor;
   if(application.families.length)(out.applicability??=[]).push({component:op.component??null,status:applicability.status,factor:applicability.factor,effectGrade:applicability.effectGrade,blockedFamilies:applicability.blockedFamilies});
   const persistent=op.immunityLifecycle==='suppress'&&['effect','trigger','aura','capability'].includes(op.op);
   if(applicability.status==='blocked'&&Object.keys(program.effectComponents??{}).length===1)out.immune=applicability.blockedFamilies.join('+');
   if(applicability.status==='blocked'&&(!persistent||op.initialBlocked==='discard')){
    if(op.op==='damage'){lastDamage=0;local.actualDamage=0;}
    out.steps.push({op:op.op,component:op.component,immune:true,...(op.id?{stepId:op.id}:{})});continue;
   }
   if(op.op==='projectionControl'){out.steps.push(controlProjection(root,r.actorId,object.resourceId,plan,op.mode,{combat:local.combat,drawDice,preActionCleared:true}));
   }else if(op.op==='save'){
    const p=saveProfile(target,op.type,{areaAttack:!!program.area,mental:application.families.includes('mind')||op.mental===true});const rolled=check(target.state,{poolBase:p.dp-finite(value(op.penalty??0),'save.penalty'),attributeAutoOverride:p.fixed,reExtraSuccesses:p.extra,dice:drawDice(),context:{willResistance:op.type==='will',reflex:op.type==='reflex',physical:op.type!=='will'}});
    const name=op.as??'save',key=op.resultAs??name;
    const spec=Object.fromEntries(Object.entries(op.resolve??{kind:'roll'}).map(([k,v])=>[k,k==='kind'?v:value(v)]));
    const resolution=assertOperationOutput('save',resolveResistance(spec,rolled),spec.kind),receipt={sourceId:object.resourceId,targetId,component:op.component??null,roll:rolled,resolution};
    local[name]=rolled.total;local.resistanceReceipts??={};local.resistanceReceipts[key]=receipt;
    if(op.resultAs)local[op.resultAs]=resolution;
    (out.resistanceReceipts??={})[key]=structuredClone(receipt);out.steps.push({op:'save',profile:op.type,...rolled,resolution});
   }else if(op.op==='attack'){
    const weapon=value(op.weapon),defense=resolveDefense(root,targetId,r.actorId,{ranged:true,contact:op.contact===true,...(op.energyWeapon?{flatFootedLevel:1}:{}),ap:value(op.ap??0),magic:value(op.magic??0),speed:value(op.speed??0),defenseMode:plan.defenseModes?.[targetId]});
    if(defense.pending)need('须目标声明防御方式','resource.defense');
    const roll=check(state,{attribute:'智力',skill,sub,modifier:weapon+value(op.modifier??0)+resourceBonus(state,'attack',initiativeContext(root,r.actorId,targetId))-defense.total,dice:drawDice(),context:{attack:true,casting:true,mentalPower:true,genericEnergySupported:local.genericEnergySupported,somatic:program.components.includes('posture'),schools:definition.schools,targetId}});
    local.attackRanged=op.contact!==true;
    local.hit=Math.max(0,roll.total-(defense.extraSuccesses??0));local.damage=Math.min(local.hit,value(op.cap??{op:'add',args:[{op:'mul',args:[4,{context:'P'}]},{context:'E'}]}));
    out.steps.push({op:'attack',weapon,defense,roll,damage:local.damage});
   }else if(op.op==='instantDeath'){
    out.steps.push({op:'instantDeath',...resolveResourceInstantDeath(root,targetId,{sourceId:object.resourceId,casterId:r.actorId,grade:applicability.effectGrade,protectionInstanceId:plan.deathProtectionChoices?.[targetId]})});
    settleResourceDeaths(root);const events=flushAutomaticResourceEvents(root,{drawDice,combat:local.combat});if(events.length)(result.automaticEvents??=[]).push(...events);
   }else if(op.op==='revive'){
    out.steps.push({op:'revive',...resolveDeathRecovery(target,{sourceId:object.resourceId,sourceVersion:definition.contractVersion,casterId:r.actorId,grade:applicability.effectGrade,recovery:{mode:op.mode,...(op.maximum!==undefined?{maximum:value(op.maximum)}:{})}},{drawDice})});
   }else if(op.op==='inspectStat'){
    const information={stat:op.stat,value:spellResistanceFor(target.state,{sourceId:object.resourceId,schools:definition.schools}),effectiveForCaster:spellResistanceFor(target.state,{casterId:r.actorId,sourceId:object.resourceId,schools:definition.schools})};
    const observation=recordPerception(root,{observerId:r.actorId,targetId,sense:{source:object.resourceId,grade:applicability.effectGrade,visual:false},information},{combat:local.combat});
    out.steps.push({op:'inspectStat',stat:op.stat,observation});
   }else if(op.op==='additionalDamage'){
    if(local.triggerEvent!=='attackDamageCaused'||!local.damageReceipt?.causedDamage)throw Error('追加伤害只能由真实防护后攻击回执驱动');
    const declaration={op:'additionalDamage',amount:Math.max(0,Math.floor(value(op.amount))),mode:op.mode,sourceId:object.resourceId,casterId:r.actorId,grade:rank,magical:program.casting===true};
    (result.additionalDamage??=[]).push(declaration);out.steps.push(declaration);
   }else if(op.op==='damage'){
    if(local.periodicSource&&!op.unavoidable){
     const tick=periodicDamageTick(target.state,local.periodicSource,{root,combat:local.combat,key:op.id??'step/'+stepIndex});
     (out.periodicClocks??=[]).push({step:stepIndex,...tick});
     if(!tick.due){lastDamage=0;local.actualDamage=0;out.steps.push({op:'damage',actualDamage:0});continue;}
    }
    const amount=Math.max(0,Math.floor(resistedAmount(op,value(op.amount),local,targetId))),severity=op.severity??'L';
    const segments=[{amount,severity,kind:op.kind??'energy',energyType:op.energy,magical:program.casting===true,grade:rank,sourceId:object.resourceId,...(op.deathRestriction?{deathRestriction:{maximumLevel:value(op.deathRestriction.maximumLevel)}}:{}),unavoidable:op.unavoidable===true,...(op.recovery?{recovery:op.recovery,sourceId:object.resourceId}:{})}];
    if(op.energyWeapon&&amount){const aggravated=Math.min(amount,Math.floor(value(op.weapon??0)/2));if(aggravated&&!equipment(target).armor.energyWeaponProof){segments[0].amount-=aggravated;segments.push({...segments[0],amount:aggravated,severity:'A'});}}
    lastDamage=damageEvent(target,segments,false,result,{conversion:0},{root,targetId,sourceActorId:op.noAttackSource?null:r.actorId,drawDice,additionalDamageOrder:plan.additionalDamageOrder,additionalDamageTypeOrder:plan.additionalDamageTypeOrder,targetMode:program.area?'area':program.target==='selected'?'multiple':'single',ranged:local.attackRanged===true,damageNature:program.damageNature??(program.steps.some(x=>x.op==='attack')?'attack':'fixed')});local.actualDamage=lastDamage;out.steps.push({op:'damage',actualDamage:lastDamage});
   }else if(op.op==='poolRestore'){
    const caster=root.actors[r.actorId].state;out.steps.push({op:'poolRestore',...restoreResourcePool(caster,{destinationPool:caster.casting?.imperial?.pool,dayId:plan.dayId,context:local,daily:op.daily,amount:Math.max(0,Math.floor(value(op.amount))),sourceId:object.resourceId,grade:rank})});
   }else if(op.op==='poolTransfer'){
    const caster=root.actors[r.actorId].state;
    const transfer=transferResourcePool(target.state,caster,{sourceId:object.resourceId,version:definition.contractVersion,grade:rank,casterId:r.actorId,targetId,
     declaredPool:plan.poolChoices?.[op.choice],destinationPool:caster.casting?.imperial?.pool,amount:Math.max(0,Math.floor(value(op.amount))),recover:op.recover,
     daily:op.daily?{...op.daily,key:op.daily.key??object.resourceId}:undefined,dayId:plan.dayId,context:local,drawDice});
    out.steps.push({op:'poolTransfer',...transfer});
   }else if(op.op==='status'){
    const points=Math.max(0,Math.floor(resistedAmount(op,finite(value(op.points),'status.points'),local,targetId)));if(!points)continue;
    const mind=application.families.includes('mind');
    const statusSource={...(op.immunityLifecycle==='suppress-existing'?{applicability:structuredClone(application)}:{}),...(local.combat?{startedRound:root.round}:{}),sourceVersion:definition.contractVersion,grade:rank,level:applicability.effectLevel,effectGrade:applicability.effectGrade,...(typeof op.resistance==='object'?{resistanceReceipt:op.resistance.receipt}:{})};
    const remaining=Math.max(0,points-(mind?resourceBonus(target.state,'mindStatusReduction'):0));
    if(op.resistance==='none'||typeof op.resistance==='object'){
     if(op.type==='冻结'&&statusLevel(target.state,'冻结').severe)damageEvent(target,[{amount:remaining,severity:'L',kind:'energy',energyType:'cold',magical:true}],false,result,{conversion:0},{root,targetId,sourceActorId:r.actorId,drawDice});
     else if(remaining)target.state.statuses.push({type:op.type,source:object.resourceId,sourceActorId:r.actorId,...statusSource,points:remaining,...op.properties});
     counteractTemperature(target.state);
    }
    else if(remaining){const applied=applyStatus(target.state,{type:op.type,source:object.resourceId,sourceActorId:r.actorId,properties:{...op.properties,...statusSource},points:remaining,dice:drawDice()});target.state=applied.state;}
    out.steps.push(assertOperationOutput('status',{op:'status',type:op.type,points}));
   }else if(op.op==='statusSource'){
    const selected=selectStatusSource(target.state,op.type,plan.statusSource);local[op.asValue]=selected.points;
    out.steps.push({op:'statusSource',type:op.type,points:selected.points});
   }else if(op.op==='consumeStatusSource'){
    out.steps.push({op:'consumeStatusSource',type:op.type,removed:consumeStatusSource(target.state,op.type,plan.statusSource)});
   }else if(op.op==='dispel'){
    const selected=selectedTimedResource(root,targetId,plan.effectChoice,value(op.maximumLevel));
    out.steps.push({op:'dispel',ended:endTimedResource(root,targetId,selected,{drawDice,combat:local.combat})});
   }else if(op.op==='weaponEffect'){
    const item=weaponInstance(target.state,plan.weaponId),active={id:object.resourceId+'/'+r.actorId,sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,grade:rank,
     effects:op.effects.map(e=>({...freezeSource(e,state,local),value:value(e.value)})),scene:op.scene===true,
     ...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{}),...(op.minutes!==undefined?{remainingMinutes:value(op.minutes)}:{})};
    enchantWeapon(item,active);out.steps.push({op:'weaponEffect',weaponId:item.id,active});
   }else if(op.op==='temporaryHealth'){
    const id=object.resourceId+'/'+r.actorId,old=target.state.temporaryHealthPools?.[id];
    const capacity=Math.max(value(op.amount),old?.capacity??0);
    const duration={...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{}),...(op.minutes!==undefined?{remainingMinutes:value(op.minutes)}:{}),scene:op.scene===true};
    const pool=registerTemporaryHealth(target.state,{id,sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,grade:rank,...(op.onDepleted?{onDepleted:prepareAutomaticProgram(state,local,op.onDepleted,{sourceId:object.resourceId,sourceVersion:definition.contractVersion,casterId:r.actorId})}:{}),capacity,remaining:op.refresh==='maximum-remaining'?Math.max(value(op.amount),old?.remaining??0):capacity,...(op.damageFilter?{damageFilter:freezeSource(op.damageFilter,state,local)}:{}),...duration},{targetId,choice:plan.temporaryHealthChoices?.[targetId]});
    if(pool.id!==id){out.steps.push({op:'temporaryHealth',kept:pool.id});continue;}
    const active={id:id+'/temporary',sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,grade:rank,temporaryHealthId:id,
     effects:(op.effects??[]).map(e=>({...freezeSource(e,state,local),value:value(e.value)})),...duration};
    const prior=target.state.activeResourceEffects?.find(e=>e.id===active.id);
    retainStrongerEffects(active,prior);retainResourceGrade(pool,old);
    target.state.activeResourceEffects=(target.state.activeResourceEffects??[]).filter(e=>e.id!==active.id);target.state.activeResourceEffects.push(active);
    out.steps.push({op:'temporaryHealth',pool});
   }else if(op.op==='loseAction'){
    out.steps.push({op:'loseAction',...loseResourceAction(target.state,op.action,{sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,grade:rank})});
   }else if(op.op==='accumulate'){
    out.steps.push({op:'accumulate',...accumulateResource(target.state,{key:op.key,amount:value(op.amount),sourceId:object.resourceId,threshold:effectiveAttribute(target.state,op.thresholdAttribute),conditionMinutes:op.conditionMinutes,resetAfterRestMinutes:op.resetAfterRestMinutes})});
   }else if(op.op==='counter'){
    const changed=adjustCounter(target.state,op.path,value(op.amount),{maximumPath:op.maximumPath});
    if(op.zeroCondition&&changed.changed<0&&changed.after===0)addCounterCondition(target.state,{
     id:object.resourceId+'/'+r.actorId,sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,
     grade:rank,level:local.rank+(program.effectGradeBonus??0),effect:op.zeroCondition,path:op.path,endsAbove:0});
    out.steps.push({op:'counter',...changed});
   }else if(op.op==='heal'){
    const recipient=op.recipient==='caster'?root.actors[r.actorId]:target;
    out.steps.push({op:'heal',targetId:op.recipient==='caster'?r.actorId:targetId,...assertOperationOutput('heal',healWounds(recipient,{budget:finite(value(op.amount),'heal.amount'),ratios:op.ratios,order:plan.healOrder??['A','L','B']}))});
   }else if(op.op==='removeStatus'&&op.budgetScope==='type'){
    out.steps.push({op:'removeStatus',budgetScope:'type',...reduceStatusBudget(target.state,{types:op.types,amount:value(op.amount),targetId,choice:plan.statusBudgetChoices?.[targetId]})});
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
    const effects=op.formulaTiming==='live'?structuredClone(op.effects):op.effects.map(e=>({...freezeSource(e,state,local),value:value(e.value)})),active={id:object.resourceId+'/'+r.actorId+(Object.keys(program.effectComponents??{}).length>1?'/'+op.component:''),sourceId:object.resourceId,casterId:r.actorId,version:definition.contractVersion,grade:rank,level:local.rank,effects,targetScope:op.targetScope??'actor',...(op.instancePolicy?{instancePolicy:op.instancePolicy}:{}),formulaTiming:op.formulaTiming??'cast',
     ...(persistent?{applicability:structuredClone(application),immunityScaling:op.immunityScaling}:{}),...(op.expiresOn?{expiresOn:structuredClone(op.expiresOn)}:{}),...(op.removable!==undefined?{removable:op.removable}:{}),
     ...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{}),...(op.minutes!==undefined?{remainingMinutes:value(op.minutes)}:{}),scene:op.scene===true};
    if(op.projection){active.projection=createProjection(op.projection,plan,value,{castTotal:local.cast,grade:rank});if(!active.projection){out.steps.push({op:'effect',noProjection:true,reason:'insufficient-size'});continue;}}
    if(op.instancePolicy==='append'){nextResourceEffectSerial(target.state);active.id+='/instance/'+target.state.resourceEffectSerial;}
    if(op.exclusiveGroup){
     active.exclusiveGroup=op.exclusiveGroup;
     const selection=exclusiveResourceChoice(target.state,{group:op.exclusiveGroup,incomingId:active.id,policy:op.exclusivePolicy,targetId,choice:plan.exclusiveChoices?.[targetId]?.[op.exclusiveGroup]});
     if(selection.decision==='keep'){out.steps.push({op:'effect',exclusiveChoice:selection,kept:true});continue;}
     if(selection.decision==='replace'){
      target.state.activeResourceEffects=target.state.activeResourceEffects.filter(e=>e.id!==selection.existingId);
      active.replacedSource=selection;
     }
    }
    if(op.selection){
     if(op.instancePolicy!=='append')throw Error('保留来源选择须追加实例');
     const selection=retainedSelection(op.selection,{sourceId:object.resourceId,casterId:r.actorId,grade:rank,power:value(op.selection.power),order:target.state.resourceEffectSerial});
     // Prior development saves used one unselected instance for this source.
     // Preserve its pool and knowledge; only bind the adopted retained policy.
     if(op.selection.scope==='caster-grade')for(const old of target.state.activeResourceEffects??[])if(!old.selection&&old.sourceId===active.sourceId&&old.casterId===active.casterId){
      old.selection=retainedSelection(op.selection,{sourceId:old.sourceId,casterId:old.casterId,grade:old.grade,power:selection.power,order:0});
     }
     active.selection=selection;
    }
    if(op.deathRecovery){
     requireFact(lifeStatus(target.state).state!=='dead','死亡恢复的持续来源须预先施加于活着的目标');
     if(op.instancePolicy!=='append')nextResourceEffectSerial(target.state);
     active.sourceOrder=target.state.resourceEffectSerial;
     active.deathRecovery={mode:op.deathRecovery.mode,maximum:value(op.deathRecovery.maximum)};
    }
    if(op.instantDeathProtection)active.instantDeathProtection={maximumLevel:value(op.instantDeathProtection.maximumLevel)};
    if(op.suppression)active.suppression={family:op.suppression.family,maximumLevel:value(op.suppression.maximumLevel)};
    if(op.obscuration)active.obscuration={...op.obscuration,radius:value(op.obscuration.radius)};
    if(op.decoys)active.decoys=createDecoys(op.decoys,value(op.decoys.count),value(op.decoys.health));
    if(op.detectionDelay)active.detectionDelay={...op.detectionDelay,rounds:value(op.detectionDelay.rounds),belowLevel:value(op.detectionDelay.belowLevel)};
    if(op.endCost)active.endCost={...op.endCost,amount:value(op.endCost.amount)};
    if(op.periodicDamage){active.periodicDamage={...op.periodicDamage,multiplier:value(op.periodicDamage.multiplier)};active.power=local.P;installPeriodicRate(target.state,active,{root,combat:local.combat});}
    if(op.actionPrice)active.actionPrice={...structuredClone(op.actionPrice),...(op.actionPrice.discount!==undefined?{discount:value(op.actionPrice.discount)}:{}),...(op.actionPrice.surcharge!==undefined?{surcharge:value(op.actionPrice.surcharge)}:{})};
    if(op.targetSceneLimit)recordSceneEffectUse(target.state,{sourceId:object.resourceId,casterId:r.actorId,maximum:op.targetSceneLimit,version:definition.contractVersion});
    if(op.turnOrder==='after-caster-turn'&&local.combat)out.steps.push({op:'turnOrder',queued:queueInitiativeChange(root,{targetId,sourceId:object.resourceId,instanceId:active.id,applyAfterActorId:r.actorId})});
    const prior=target.state.activeResourceEffects?.find(x=>x.id===active.id);
    if(active.actionPrice&&prior?.actionPrice)active.actionPrice.discount=Math.max(active.actionPrice.discount,prior.actionPrice.discount);
    if(op.formulaTiming!=='live')retainStrongerEffects(active,prior);
    if(active.applicability)active.applicability.grade=active.grade;
    target.state.activeResourceEffects=(target.state.activeResourceEffects??[]).filter(x=>x.id!==active.id);target.state.activeResourceEffects.push(assertOperationOutput('effect',active));syncResourceHealth(target.state);accrueRoundCosts(target.state,{root,combat:local.combat});out.steps.push({op:'effect',active});if(op.obscuration)observeResourceObscuration(root);
   }else if(op.op==='aura'){
    const aura=registerResourceAura(root,r.actorId,object.resourceId,op,{...local,P:local.basePower,schools:definition.schools},plan,{combat:local.combat,version:definition.contractVersion,
     ...(persistent?{applicability:application,immunityScaling:op.immunityScaling}:{}),
     ...(Object.keys(program.effectComponents??{}).length>1?{componentId:op.component}:{})});
    out.steps.push({op:'aura',id:aura.id,radius:aura.radius});
   }else if(op.op==='trigger'){
    const trigger={sourceId:object.resourceId,version:definition.contractVersion,casterId:r.actorId,event:op.event,requiresConscious:op.requiresConscious===true,attackSource:op.attackSource,steps:freezeSource(op.steps,state,local),variables:structuredClone(local),rank,skill,sub,
     ...(op.count!==undefined?{remaining:value(op.count)}:{}),...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{}),scene:op.scene===true,
     ...(persistent?{applicability:structuredClone(application)}:{}),
     when:op.condition,requiresContext:op.requiresContext??[],damageNature:op.damageNature??'fixed',sourcePolicy:op.sourcePolicy,effectComponents:structuredClone(program.effectComponents),
     ...(op.perRound!==undefined?{quota:{maximum:value(op.perRound),used:0,round:null}}:{}),effectTypes:op.effectTypes??[],effectGradeBonus:op.effectGradeBonus??0,target:op.target??'bearer',casting:program.casting===true,schools:definition.schools,elapsed:0};
    let key=object.resourceId+'/'+r.actorId+'/'+op.event+(Object.keys(program.effectComponents??{}).length>1?'/'+op.component:'');
    if(op.endPolicy){if(op.event!=='turnStart'||!Number.isSafeInteger(trigger.remaining)||trigger.remaining<1)throw Error('结束结清须有有限的回合开始次数');trigger.endPolicy=op.endPolicy;trigger.maximumOccurrences=trigger.remaining;}
    if(op.instancePolicy==='append'){nextResourceEffectSerial(target.state);key+='/instance/'+target.state.resourceEffectSerial;trigger.id=key;}
    if(op.selection){if(op.instancePolicy!=='append')throw Error('保留触发来源须追加实例');trigger.selection=retainedSelection(op.selection,{sourceId:object.resourceId,casterId:r.actorId,grade:rank,power:value(op.selection.power),order:target.state.resourceEffectSerial});}
    if(op.onDeath){requireFact(lifeStatus(target.state).state!=='dead','死亡触发的持续来源须施加于活着的目标');trigger.sourceOrder=target.state.resourceEffectSerial??0;trigger.onDeath={radius:value(op.onDeath.radius),excludeCaster:op.onDeath.excludeCaster,program:{casting:program.casting===true,area:{center:'bearer',team:'all'},components:[],damageNature:'fixed',steps:freezeSource(op.onDeath.steps,state,local),effectComponents:structuredClone(program.effectComponents)}};}
    const prior=target.state.resourceTriggers?.[key];
    if(trigger.quota&&prior?.quota)Object.assign(trigger.quota,{used:prior.quota.used,round:prior.quota.round});
    (target.state.resourceTriggers??={})[key]=trigger;if(trigger.onDeath)accrueEffectiveTriggerRounds(root,targetId);out.steps.push({op:'trigger',event:op.event});
   }else if(op.op==='capability'){
    const capability={...op,...(op.movement?{movement:{...op.movement,...(op.movement.speedBasis?{speedMultiplier:value(op.movement.speedMultiplier)}:{speed:value(op.movement.speed)})}}:{}),...(op.onEnd?{onEnd:{...op.onEnd,...(op.onEnd.kind==='descent'?{rounds:value(op.onEnd.rounds)}:{})}}:{}),...(persistent?{applicability:structuredClone(application)}:{}),source:object.resourceId,version:definition.contractVersion,casterId:r.actorId,grade:rank,level:local.rank+(op.gradeBonus??0),...(op.range!==undefined?{range:value(op.range)}:{}),...(op.minutes!==undefined?{remainingMinutes:value(op.minutes)}:{}),...(op.rounds!==undefined?{remainingRounds:value(op.rounds)}:{})};
    if(op.periodicDamage){capability.periodicDamage={...op.periodicDamage,multiplier:value(op.periodicDamage.multiplier)};capability.power=local.P;installPeriodicRate(target.state,capability,{root,combat:local.combat});}
    const key=op.id+'/'+object.resourceId+'/'+r.actorId,prior=target.state.resourceCapabilities?.[key];
    if(prior){capability.level=Math.max(capability.level,prior.level);if(prior.level>local.rank+(op.gradeBonus??0))capability.grade=prior.grade;if(capability.range!==undefined)capability.range=Math.max(capability.range,prior.range??0);}
    (target.state.resourceCapabilities??={})[key]=capability;out.steps.push({op:'capability',capability});
   }else throw new Error('执行器未接入操作（实现缺口，非待裁定）：'+op.op);
   for(const row of out.steps.slice(stepStart))if(!['save','status','effect','heal','turnOrder'].includes(row.op))assertOperationOutput(row.op,row);
   if(op.id)for(const row of out.steps.slice(stepStart))row.stepId=op.id;
  }
 return out;
}

export function fireResourceTriggers(root,bearerId,event,{targetId,context={},drawDice,elapsedRound=0,combat=Number.isInteger(root.round)}={}){
 const bearer=root.actors[bearerId],results=[];if(!bearer)return results;
 const candidates=[];
 for(const row of Object.entries(bearer.state.resourceTriggers??{})){
  const trigger=row[1];
  for(const migration of RESOURCE_DEFINITIONS[trigger.sourceId]?.triggerPolicyMigrations??[])if(trigger.event===migration.event&&trigger.sourcePolicy===migration.from){
   trigger.policyAdoption={from:trigger.sourcePolicy,to:migration.to,source:migration.source};trigger.sourcePolicy=migration.to;
  }
  if(trigger.attackSource==='caster'&&context.sourceActorId!==trigger.casterId)continue;
  if(trigger.requiresConscious&&['unconscious','dead'].includes(lifeStatus(bearer.state).state))continue;
  if(trigger.event!==event||trigger.remaining===0||trigger.remainingRounds===0||trigger.remainingRounds!==undefined&&elapsedRound>trigger.remainingRounds)continue;
  for(const field of trigger.requiresContext??[])if(context[field]===null||context[field]===undefined)need('伤害触发缺少实际上下文：'+field,'resource.trigger.'+field);
  if(effectMatches(trigger.when,bearer.state,context))candidates.push(row);
 }
 for(const [,trigger]of candidates)if(trigger.sourcePolicy==='pending-cross-caster'&&candidates.some(([,other])=>other.sourceId===trigger.sourceId&&other.casterId!==trigger.casterId)){
  const error=new Error('同名伤害效果跨施法者的叠加与归属尚待裁定');error.code='RULE_UNRESOLVED';throw error;
 }
 accrueEffectiveTriggerRounds(root,bearerId);
 const selected=selectedTriggerKeys(bearer.state);
 for(const [key]of candidates){
  const trigger=bearer.state.resourceTriggers?.[key];if(!trigger)continue;
  if(trigger.quota){
   const round=Number.isFinite(root.round)?'combat/'+(root.instanceId??root.id??'current')+'/'+root.round:'field/'+Math.floor((root.ruleScene?.resourceClockMinutes??0)*10+1e-9);
   if(trigger.quota.round!==round){trigger.quota.round=round;trigger.quota.used=0;}
   if(trigger.quota.used>=trigger.quota.maximum)continue;
   trigger.quota.used++;
  }
  trigger.elapsed++;if(trigger.remaining!==undefined&&--trigger.remaining===0)delete bearer.state.resourceTriggers[key];
  if(!selected.has(key)){results.push({sourceId:trigger.sourceId,suppressed:true,damage:[],steps:[],tick:trigger.elapsed});continue;}
  results.push(resolveStoredTrigger(root,bearerId,trigger,{targetId,context,drawDice,combat,event}));
 }
 return results;
}

function resolveStoredTrigger(root,bearerId,trigger,{targetId,context={},drawDice,combat=false,event='turnStart',settlement=false}={}){
 const bearer=root.actors[bearerId];
  const target=root.actors[trigger.target==='eventTarget'?targetId:bearerId],caster=root.actors[trigger.casterId];
  if(!target?.state||!caster?.state)need('持续效果的施术者或实际受术者状态缺失','resource.trigger');
  // The subscription belongs to its bearer; a later target may be different.
  // Scheduled occurrences/quotas advance even when immunity blocks their result.
  const applicability=evaluateApplicability(trigger.applicability??{families:trigger.effectTypes??[],grade:trigger.rank,gradeBonus:trigger.effectGradeBonus??0,mode:trigger.immunityMode},collectImmunities(trigger.applicability?bearer.state:target.state,RESOURCE_DEFINITIONS));
  if(applicability.status==='blocked')return {sourceId:trigger.sourceId,targetId:target.id??targetId,immune:applicability.blockedFamilies.join('+'),damage:[],steps:[]};
  const local={...trigger.variables,...context,eventActualDamage:context.actualDamage??0,actualDamage:0,...(trigger.remainingRounds!==undefined?{triggerRemainingRounds:trigger.remainingRounds}:{}),triggerEvent:event,targetId:target.id??targetId??bearerId,tick:trigger.elapsed,combat,...(event==='turnStart'&&!settlement?{periodicSource:trigger}:{}),resistanceReceipts:{}},result={damage:[],sourceId:trigger.sourceId,casterId:trigger.casterId,sourceVersion:trigger.version};
  const out={targetId:local.targetId,steps:[]};
  resolveProgramSteps({root,r:{actorId:trigger.casterId},object:{resourceId:trigger.sourceId},definition:{schools:trigger.schools,contractVersion:trigger.version},
   program:{steps:trigger.steps,effectComponents:trigger.effectComponents,casting:trigger.casting,damageNature:trigger.damageNature??'fixed',components:[]},plan:{},state:caster.state,target,local,out,result,rank:trigger.rank,skill:trigger.skill,sub:trigger.sub,drawDice});
  return {...result,...out,...(trigger.id?{instanceId:trigger.id}:{}),tick:trigger.elapsed,...(settlement?{settlement:true}:{})};
}
export function flushResourceTriggerEnds(root,bearerId,{drawDice,combat=Number.isInteger(root?.round)}={}){
 const bearer=root?.actors?.[bearerId];if(!bearer)return [];
 const results=[];
 while(bearer.state.resourcePendingTriggerEnds?.length){
  const item=bearer.state.resourcePendingTriggerEnds.shift(),trigger=item.trigger;
  for(let tick=trigger.elapsed+1;tick<=trigger.maximumOccurrences;tick++){
   trigger.elapsed=tick;
   results.push({...resolveStoredTrigger(root,bearerId,trigger,{drawDice,combat,settlement:true}),tick,settlement:true,endReason:item.reason,instanceId:trigger.id});
  }
 }
 return results;
}

// Outside initiative, one declared six-second interval advances one periodic
// round. Source formulas were frozen at casting; no mature caster is imported.
export function advanceResourcePeriods(actor,minutes,{drawDice,root:actualRoot}={}){
 const triggers=Object.values(actor.state.resourceTriggers??{}).filter(x=>x.event==='turnStart');
 if(!triggers.length)return [];
 const total=(actor.state.resourcePeriodicRemainder??0)+minutes*10,rounds=Math.floor(total+1e-9);
 actor.state.resourcePeriodicRemainder=total-rounds;
 const id=actor.id??triggers[0].variables.targetId,root={...actualRoot,actors:{...actualRoot?.actors,[id]:actor}},results=[];
 for(const t of triggers)if(!root.actors[t.casterId])root.actors[t.casterId]={id:t.casterId,state:{},resourceSourceUnavailable:true};
 const maxRounds=Math.min(rounds,Math.max(...triggers.map(t=>Math.min(t.remaining??Infinity,t.remainingRounds??Infinity))));
 for(let i=1;i<=maxRounds;i++)results.push(...fireResourceTriggers(root,id,'turnStart',{drawDice,elapsedRound:i,combat:false}));
 return results;
}

// Referenced programs are trusted authored data. They are invoked as effects,
// never as a free player cast, and never confer ownership of the referenced spell.
function prepareAutomaticProgram(state,local,reference,origin){
 const definition=RESOURCE_DEFINITIONS[reference.resourceId],original=definition?.programs?.[reference.operation];
 if(!original)throw Error('自动效果引用未实现程序：'+reference.resourceId+'/'+reference.operation);
 if(original.target!=='area'||original.area?.center!=='self'||original.area.team!=='all'||original.area.selected||original.steps.some(x=>!['save','damage','status'].includes(x.op)))throw Error('自动引用当前支持全目标自身球体的豁免/伤害/状态程序');
 const skill=original.check?.skill??'神秘',sub=definition.subskills?.[0],effective=effectiveSkill(state,skill,sub);
 const variables={INT:local.INT,PER:local.PER,STR:local.STR,intAuto:local.intAuto,legendaryINT:local.legendaryINT,P:reference.power,basePower:reference.power,rank:['D','C','B','A','S'].indexOf(reference.grade)+1,E:effective.level,skillAuto:effective.auto,genericEnergySupported:local.genericEnergySupported};
 const value=x=>effectValue(x,state,variables),context={casting:true,mentalPower:true,genericEnergySupported:variables.genericEnergySupported,somatic:original.components?.includes('posture'),schools:definition.schools,sourceId:origin.sourceId};
 const profile=original.check?checkProfile(state,{attribute:original.check.attribute??'智力',skill,sub,modifier:value(original.check.modifier??0),context}):null;
 if(profile&&!profile.eligible)need('自动效果建立时无法记录合法施法判定：'+profile.reason,'resource.automatic.check');
 return {...origin,reference:structuredClone(reference),referenceVersion:definition.contractVersion,variables,skill,sub,schools:definition.schools,
  radius:value(original.area.radius),check:profile,program:{casting:original.casting===true,components:[],damageNature:original.damageNature??'fixed',steps:freezeSource(original.steps,state,variables),effectComponents:structuredClone(original.effectComponents),effectTypes:original.effectTypes,effectGradeBonus:original.effectGradeBonus}};
}
function executeAutomaticProgram(root,ownerId,event,{drawDice,combat}){
 const snapshot=event.snapshot;if(snapshot.recovery)return resolveDeathRecovery(root.actors[ownerId],snapshot,{drawDice});
 const area=selectSphereTargets(root,ownerId,snapshot.radius,{combat});
 if(snapshot.excludeCaster)area.targetIds=area.targetIds.filter(id=>id!==snapshot.casterId);
 const casting=snapshot.check?rollCheckProfile(snapshot.check,drawDice()):null;
 const result={resourceId:snapshot.sourceId,referenceId:snapshot.reference?.resourceId??null,sourceVersion:snapshot.sourceVersion,referenceVersion:snapshot.referenceVersion,casting,area,damage:[],targets:[]};
 withAutomaticBatch(root,()=>{
 for(const targetId of area.targetIds){
  const target=root.actors[targetId],local={...snapshot.variables,targetId,cast:casting?.total??0,combat,resistanceReceipts:{}};
  local.P=Math.max(0,(snapshot.reference?local.P:local.basePower??local.P)-spellResistanceFor(target.state,{casterId:snapshot.casterId,sourceId:snapshot.sourceId,schools:snapshot.schools}));
  const out={targetId,effectivePower:local.P,steps:[]};
  if(local.P>0)resolveProgramSteps({root,r:{actorId:snapshot.casterId},object:{resourceId:snapshot.sourceId},definition:{schools:snapshot.schools,contractVersion:snapshot.sourceVersion},program:snapshot.program,plan:{},state:{},target,local,out,result,rank:snapshot.reference?.grade??snapshot.grade,skill:snapshot.skill,sub:snapshot.sub,drawDice});
  result.targets.push(out);
 }
 });
 return result;
}
export function flushAutomaticResourceEvents(root,options={}){
 const hydrated=options.actorTemplates?{...root,actors:Object.fromEntries(Object.entries(root.actors).map(([id,record])=>[id,{...structuredClone(options.actorTemplates[id]??{}),...record,...structuredClone(record.combatCarry??{}),state:record.state}]))}:root;
 settleResourceDeaths(hydrated);
 const results=drainAutomaticResourceEvents(hydrated,executeAutomaticProgram,options);
 if(hydrated!==root)for(const [id,a]of Object.entries(hydrated.actors)){root.actors[id].state=a.state;if(a.state.woundLedger)syncActorWounds(root.actors[id]);}
 return results;
}
