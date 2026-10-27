import {OPERATION_CONTRACTS,EFFECT_CONSUMERS,REQUIRED_ITEMS,EFFECT_POLICY_MIGRATIONS,TARGET_ALLOCATION,TARGET_PROGRESSION,CONE_AREA,COOLDOWN_AFTER_USES} from './rule-contracts.mjs';
import {assertSchema} from './rule-schema.mjs';
import {EXPRESSION_OPERATORS,CONDITION_TESTS} from './rule-expressions.mjs';
// Supported operation/policy ABI. Execution bodies remain in resource-program;
// this registry gates dispatch and is exported to the offline resource compiler.
const operator=(domain,lifecycles=[])=>({apiVersion:1,domain,lifecycles,validation:'policy-only'});
export const PROGRAM_CAPABILITIES={schemaVersion:'901-program-capabilities/1',operators:{projectionControl:operator('scene-objects'),instantDeath:operator('death'),revive:operator('death'),inspectStat:operator('perception'),additionalDamage:{...operator('damage-additions'),requiresEvent:'attackDamageCaused'},
 save:operator('resistance'),attack:operator('attack'),damage:{...operator('damage'),recoveryRestrictions:['aggravated','naturalOnly'],woundUpgradePolicy:'ordinary-first-then-random-per-wound'},status:operator('status',['suppress-existing']),
 heal:{...operator('healing'),priority:'enabled-aggravated-first'},removeStatus:{...operator('status'),budgetScopes:['type'],choicePolicy:'recipient-source-allocation'},effect:{...operator('effects',['suppress']),initialBlockedPolicies:['discard'],turnOrderPolicies:['after-caster-turn'],targetUsageScopes:['scene'],exclusivePolicies:['recipient-choice'],actionPriceFamilies:['physical'],pricedActions:['weaponAttack','naturalAttack','move','drawWeapon','loadBow','block']},
 capability:{...operator('capabilities',['suppress']),endConsequences:['descent','fall'],movementSpeedBases:['current-land'],movementModes:['flight'],maneuverability:['perfect']},trigger:operator('events',['suppress']),aura:operator('spatial',['suppress']),
 accumulate:{...operator('accumulators'),conditions:['unconscious'],reset:'completed-continuous-rest-or-condition-expiry'},counter:operator('counters'),temporaryHealth:{...operator('temporary-health'),sourcePolicy:'recipient-replace-no-backup'},weaponEffect:operator('items'),dispel:operator('instances'),
 statusSource:operator('status-sources'),consumeStatusSource:operator('status-sources'),loseAction:operator('actions'),poolTransfer:operator('pools'),poolRestore:operator('pools')
},actionPricing:{fallback:'actual-slot-upper-bound',free:'exempt-without-quota',scope:'physical',consumer:'resource-action-pricing.mjs'},periodicDamage:{consumer:'resource-periodic-clock.mjs',combatActivation:'current-round-opening',scope:'damage-step',sourceEnd:'cancel-untriggered',rateEnd:'preserve-progress',sourceImmunityFamily:'time'},expressions:EXPRESSION_OPERATORS,conditions:CONDITION_TESTS,definitionPolicies:{effectPolicyMigrations:EFFECT_POLICY_MIGRATIONS},programPolicies:{cooldownAfterUses:COOLDOWN_AFTER_USES,supportedGrades:['D','C','B','A','S'],automaticReference:{target:'area',center:'self',team:'all',steps:['save','damage','status']},spellResistance:['ignore'],coneArea:CONE_AREA,targetAllocation:TARGET_ALLOCATION,targetProgression:TARGET_PROGRESSION,endEffects:['own-selected'],requiredItems:REQUIRED_ITEMS,toggle:['on','off'],triggerRequiresConscious:true},penaltyConsumers:{statusPenaltyIgnore:1,environmentPenaltyIgnore:1,ignoreWoundUnconsciousness:1},immunityModes:['any-blocks','fraction-unblocked'],resistanceModes:['roll','opposed','threshold','subtract']};
for(const [name,contract]of Object.entries(OPERATION_CONTRACTS))Object.assign(PROGRAM_CAPABILITIES.operators[name],contract);
PROGRAM_CAPABILITIES.effectConsumers=EFFECT_CONSUMERS;
PROGRAM_CAPABILITIES.eventOperatorScopes={attackDamageCaused:['additionalDamage']};
PROGRAM_CAPABILITIES.triggerContexts={attackDamageCaused:{sourceActorId:{type:'string'},damageReceipt:{type:'object'}},attackResolved:{actualDamage:{type:'number'},hit:{type:'boolean'},causedDamage:{type:'boolean'},triggerRemainingRounds:{type:'number'}},hit:{actualDamage:{type:'number'}},afterLifeLoss:{actualDamage:{type:'number'}},incomingHit:{},turnStart:{}};
export const PROGRAM_ABI=JSON.stringify(PROGRAM_CAPABILITIES);
export function requireProgramOperator(name){
 const operator=Object.hasOwn(PROGRAM_CAPABILITIES.operators,name)?PROGRAM_CAPABILITIES.operators[name]:null;
 if(!operator){const e=new Error('执行器未接入操作：'+name);e.code='UNSUPPORTED_OPERATION';throw e;}
 return operator;
}
export function assertProgramABI(required){
 if(required!==PROGRAM_ABI){const e=new Error('资源数据与执行器能力版本不一致；须安装同一经验证候选中的资源数据和JS模块');e.code='RULE_VERSION_MISMATCH';throw e;}
}

export function requireEffectConsumer(stat,scope='actor'){
 const consumer=EFFECT_CONSUMERS[stat];
 if(consumer?.status!=='connected'||!consumer.scopes.includes(scope)){const e=new Error(`没有接通效果消费者：${stat} (${scope})`);e.code='CONSUMER_MISSING';e.stat=stat;throw e;}
 return consumer;
}
export function assertOperationInput(step,path='step'){
 const op=requireProgramOperator(step.op);
 if(op.fields)assertSchema(step,{type:'object',fields:op.fields,required:op.required},path);
 if(['effect','weaponEffect','temporaryHealth','aura'].includes(step.op))for(const effect of step.effects??[])requireEffectConsumer(effect.stat,step.op==='weaponEffect'?'item':'actor');
 return op;
}
export function assertOperationOutput(name,result,variant='default'){
 const spec=requireProgramOperator(name).outputs?.[variant];
 if(!spec){const e=new Error('缺少操作输出契约：'+name+'/'+variant);e.code='INVALID_OPERATION_OUTPUT';throw e;}
 assertSchema(result,spec,name+'.result',{code:'INVALID_OPERATION_OUTPUT'});return result;
}
export function assertProgramInputs(program,{event}={}){
 if(program.cooldownAfterUses){assertSchema(program.cooldownAfterUses,COOLDOWN_AFTER_USES,'program.cooldownAfterUses');if(program.cooldown!==undefined)throw Error('条件冷却与每次冷却不能并用');}
 if(program.supportedGrades&&(!program.supportedGrades.length||program.supportedGrades.some(x=>!PROGRAM_CAPABILITIES.programPolicies.supportedGrades.includes(x))))throw Error('未登记程序版本');
 if(program.spellResistance!==undefined&&!PROGRAM_CAPABILITIES.programPolicies.spellResistance.includes(program.spellResistance))throw Error('未登记法抗策略');
 if(program.endEffects!==undefined&&(!PROGRAM_CAPABILITIES.programPolicies.endEffects.includes(program.endEffects)||program.casting!==false||program.action!=='free'||program.cost!==0||program.steps.length))throw Error('不支持的主动终止程序');
 if(program.area?.shape==='cone')assertSchema(program.area,CONE_AREA,'program.area');
 if(program.targetAllocation)assertSchema(program.targetAllocation,TARGET_ALLOCATION,'program.targetAllocation');
 if(program.targetProgression){assertSchema(program.targetProgression,TARGET_PROGRESSION,'program.targetProgression');if(program.target!=='single')throw Error('目标递增计费当前仅支持单目标程序');}
 if(program.requiredItems)assertSchema(program.requiredItems,REQUIRED_ITEMS,'program.requiredItems');
 for(const [i,step]of program.steps.entries()){
  const spec=assertOperationInput(step,'steps['+i+']');
  if(spec.requiresEvent&&spec.requiresEvent!==event)throw Error('操作需要事件作用域：'+spec.requiresEvent);
  if(PROGRAM_CAPABILITIES.eventOperatorScopes[event]&&!PROGRAM_CAPABILITIES.eventOperatorScopes[event].includes(step.op))throw Error('事件作用域不允许状态写入：'+step.op);
  if(step.op==='trigger'){
   assertProgramInputs({steps:step.steps},{event:step.event});
   if(step.onDeath){if(step.event!=='turnStart'||step.onDeath.steps.some(x=>!['save','damage','status'].includes(x.op)))throw Error('死亡自动区域只允许周期来源的豁免/伤害/状态');assertProgramInputs({steps:step.onDeath.steps},{event:'death'});}
  }
 }
}
