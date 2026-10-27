// Executable field/consumer declarations, exported with the actual engine ABI.
// All operation top-level inputs are closed. Explicit open payloads are not full state/context typing.
const text={type:'string',minLength:1},number={type:'number'},formula={type:'number',expression:true};
const bool={type:'boolean'},condition={type:'condition'},object={type:'object',additional:true};
const array=items=>({type:'array',items});
const enumOf=(...values)=>({type:'string',enum:values});
const common={op:text,id:text,component:text,when:condition,gradeBonus:{type:'integer'},immunityLifecycle:text,immunityScaling:text};
export const EFFECT_FIELDS={stat:text,value:formula,group:text,stacking:enumOf('add','highest-source-grade'),damageAllocation:enumOf('lightest-existing'),when:condition,clauseId:text,
 fallbacks:array(object),tag:text,material:bool,spiritEffective:bool,minimumCost:{type:'integer',minimum:0},discountSource:text};
const effect={type:'object',fields:EFFECT_FIELDS,required:['stat','value']};
export const REQUIRED_ITEMS=array({type:'object',fields:{key:text,tag:text,held:bool},required:['key','tag','held']});
const shape=(fields,required=[])=>({type:'object',fields,required});
export const EFFECT_POLICY_MIGRATIONS=array(shape({stat:text,fromVersion:text,source:text,set:shape({stacking:EFFECT_FIELDS.stacking,damageAllocation:EFFECT_FIELDS.damageAllocation})},['stat','fromVersion','source','set']));
export const CONE_AREA=shape({shape:enumOf('cone'),center:enumOf('self'),length:formula,angleDegrees:{type:'number',exclusiveMinimum:0}},['shape','center','length','angleDegrees']);
export const COOLDOWN_AFTER_USES=shape({uses:formula,rounds:{type:'integer',minimum:1}},['uses','rounds']);
export const SAVE_PROFILE={anyOf:[enumOf('will','fort','reflex'),shape({recipientChoice:text,options:array(enumOf('will','fort','reflex'))},['recipientChoice','options'])]};
export const TARGET_ALLOCATION=shape({key:text,total:formula,as:text,spellResistance:enumOf('subtract-once')},['key','total','as','spellResistance']);
export const TARGET_PROGRESSION=shape({key:text,scope:enumOf('scene'),commit:enumOf('target-resolution'),fields:array(shape({name:text,initial:formula,next:formula},['name','initial','next']))},['key','scope','commit','fields']);
export const RESISTANCE_OUTPUTS={
 roll:shape({kind:enumOf('roll'),total:number},['kind','total']),
 opposed:shape({kind:enumOf('opposed'),activeTotal:number,passiveTotal:number,success:bool,margin:number},['kind','activeTotal','passiveTotal','success','margin']),
 threshold:shape({kind:enumOf('threshold'),total:number,dc:number,success:bool},['kind','total','dc','success']),
 subtract:shape({kind:enumOf('subtract'),incoming:number,successes:number,perSuccess:number,remaining:number},['kind','incoming','successes','perSuccess','remaining'])
};
const duration={scene:bool,rounds:formula,minutes:formula};
const resistance={anyOf:[enumOf('none'),shape({receipt:text,kind:enumOf('resolved','subtract'),perSuccess:number},['receipt','kind'])]};
const daily=shape({basis:enumOf('current','first-use'),key:text,source:text,maximum:formula},['basis','key','source','maximum']);
const receipt=(op,fields,required=Object.keys(fields))=>shape({op:enumOf(op),...fields},['op',...required]);
const contract=(fields,required,reads,writes,output)=>({validation:'closed-fields-v1',fields:{...common,...fields},required,reads,
 produces:{scope:'target',writes},outputs:{default:output}});
export const OPERATION_CONTRACTS={
 projectionControl:contract({mode:enumOf('complete','alter')},['mode'],['source.projection','plan.projection'],['source.projection'],{type:'object',additional:true}),
 save:{validation:'closed-fields-v1',fields:{...common,type:SAVE_PROFILE,penalty:formula,mental:bool,as:text,resultAs:text,
  resolve:shape({kind:enumOf('roll','opposed','threshold','subtract'),active:formula,dc:formula,incoming:formula,perSuccess:formula},['kind'])},required:['type'],
  reads:['target.saveProfile','context.cast'],produces:{scope:'target',scalar:'as|save',receipt:'resultAs|as|save',variants:RESISTANCE_OUTPUTS},consumers:['resistance.resolve','status.resistance','damage.resistance'],outputs:RESISTANCE_OUTPUTS},
 status:{validation:'closed-fields-v1',fields:{...common,type:{...text,expression:true},points:formula,resistance:{anyOf:[enumOf('none'),shape({receipt:text,kind:enumOf('resolved','subtract'),perSuccess:number},['receipt','kind'])]},properties:object},required:['type','points'],
  reads:['target.statuses','context.resistanceReceipts'],produces:{scope:'target',writes:['statuses'],result:['type','points']},consumers:['status.effective','status.lifecycle'],
  outputs:{default:shape({op:enumOf('status'),type:text,points:number},['op','type','points'])}},
 effect:{validation:'closed-fields-v1',fields:{...common,effects:array(effect),targetScope:enumOf('actor','scene'),scene:bool,rounds:formula,minutes:formula,formulaTiming:enumOf('cast','live'),instancePolicy:enumOf('append'),removable:bool,
  deathRecovery:shape({mode:enumOf('one-impact-from-death'),maximum:formula},['mode','maximum']),instantDeathProtection:shape({maximumLevel:formula},['maximumLevel']),
  expiresOn:object,targetSceneLimit:{type:'integer',minimum:1},turnOrder:enumOf('after-caster-turn'),initialBlocked:enumOf('discard'),exclusiveGroup:text,exclusivePolicy:enumOf('recipient-choice'),actionPrice:object,
  suppression:shape({family:enumOf('antiDetection'),maximumLevel:formula},['family','maximumLevel']),
  projection:shape({range:formula,maximumSize:formula,volumeUnit:enumOf('size','cubic-metres'),channels:array(enumOf('visual','auditory','olfactory','temperature','tactile')),allowAttachment:bool,touchReveals:bool,damageThreshold:formula,controlActions:shape({D:enumOf('standard'),C:enumOf('move')}),programmed:shape({cooldownMinutes:number,triggerRadius:formula,dc:formula},['cooldownMinutes','triggerRadius','dc'])},['range','maximumSize','volumeUnit','channels','touchReveals']),
  obscuration:shape({radius:formula,channel:enumOf('visual'),mask:enumOf('none','visualIllusion')},['radius','channel','mask']),
  decoys:shape({count:formula,health:formula,immunityFamily:enumOf('visualIllusion'),singleTarget:enumOf('random-redirect'),damageMode:enumOf('copy-after-defense')},['count','health','immunityFamily','singleTarget','damageMode']),
  detectionDelay:shape({rounds:formula,belowLevel:formula,sourceImmunityFamily:enumOf('time')},['rounds','belowLevel','sourceImmunityFamily']),
  selection:shape({group:text,power:formula,tieBreak:enumOf('latest'),scope:enumOf('caster-grade')},['group','power','tieBreak']),
  endCost:shape({amount:formula,severity:enumOf('A'),clock:enumOf('effective-round'),unavoidable:{type:'boolean',const:true}},['amount','severity','clock','unavoidable']),
  periodicDamage:shape({multiplier:formula,sourceImmunityFamily:enumOf('time')},['multiplier','sourceImmunityFamily'])},required:['effects'],
  reads:['target.activeResourceEffects','context.casterId'],produces:{scope:'target',writes:['activeResourceEffects'],result:['active']},consumers:['effect.collect','effect.expire'],
  outputs:{default:{type:'object',fields:{id:text,sourceId:text,effects:array(effect)},required:['id','sourceId','effects'],additional:true}}},
 heal:{validation:'closed-fields-v1',fields:{...common,amount:formula,recipient:enumOf('caster','target'),ratios:shape({B:{type:'number',exclusiveMinimum:0},L:{type:'number',exclusiveMinimum:0},A:{type:'number',exclusiveMinimum:0}})},required:['amount'],
  reads:['recipient.health','recipient.woundLedger'],produces:{scope:'recipient',writes:['health','woundLedger'],result:['changes','remaining']},consumers:['healing.wounds'],
  outputs:{default:shape({changes:array(object),remaining:number},['changes','remaining'])}},
 attack:contract({weapon:formula,modifier:formula,cap:formula,contact:bool,energyWeapon:bool,ap:formula,magic:formula,speed:formula},['weapon'],
  ['target.defense','caster.check'],['context.hit','context.damage'],receipt('attack',{weapon:number,defense:object,roll:object,damage:number})),
 instantDeath:contract({},[],['target.immunities','target.resourceSceneUsage'],['health.dead','resourceSceneUsage'],{type:'object',fields:{op:enumOf('instantDeath')},required:['op'],additional:true}),
 revive:contract({mode:enumOf('one-impact-from-death'),maximum:formula},['mode'],['target.deathRestrictions','target.health'],['health','woundLedger','resourceSceneUsage'],{type:'object',fields:{op:enumOf('revive'),recovered:bool},required:['op','recovered'],additional:true}),
 inspectStat:contract({stat:enumOf('spellResistance')},['stat'],['target.resistance','context.casterId'],['perception.receipts'],receipt('inspectStat',{stat:text,observation:object})),
 additionalDamage:contract({amount:formula,mode:enumOf('same-type')},['amount','mode'],['event.damageReceipt'],['event.additionalDamage'],receipt('additionalDamage',{amount:number,mode:text,sourceId:text,casterId:text,grade:text,magical:bool})),
 damage:contract({deathRestriction:shape({maximumLevel:formula},['maximumLevel']),amount:formula,severity:enumOf('B','L','A'),kind:enumOf('physical','energy'),energy:text,energyWeapon:bool,weapon:formula,unavoidable:bool,noAttackSource:bool,recovery:enumOf('aggravated','naturalOnly'),resistance},['amount'],
  ['target.protection','context.resistanceReceipts'],['health','woundLedger','context.actualDamage'],receipt('damage',{actualDamage:number})),
 poolRestore:contract({amount:formula,daily},['amount'],['caster.casting.pool','caster.resourceDailyUsage'],['caster.resources','caster.resourceDailyUsage'],
  receipt('poolRestore',{requested:number,recovered:number,daily:object},['requested','recovered'])),
 poolTransfer:contract({amount:formula,recover:formula,choice:text,daily:{...daily,required:['basis','source','maximum']}},['amount','recover','choice'],['target.resources','caster.casting.pool'],['target.resources','caster.resources','caster.resourceDailyUsage'],
  {anyOf:[receipt('poolTransfer',{drained:number,recovered:number,ineffective:enumOf('no-eligible-pool')}),receipt('poolTransfer',{sourcePool:text,destinationPool:text,before:number,after:number,drained:number,recovered:number,requested:number,selection:object,daily:object},['sourcePool','destinationPool','before','after','drained','recovered','requested','selection'])]}),
 statusSource:contract({type:{...text,expression:true},asValue:text},['type','asValue'],['target.statuses','plan.statusSource'],['context.asValue'],receipt('statusSource',{type:text,points:number})),
 consumeStatusSource:contract({type:{...text,expression:true}},['type'],['target.statuses','plan.statusSource'],['target.statuses'],receipt('consumeStatusSource',{type:text,removed:number})),
 dispel:contract({maximumLevel:formula},['maximumLevel'],['plan.effectChoice','target.timedInstances'],['target.timedInstances'],receipt('dispel',{ended:shape({id:text,sourceId:text,casterId:text,settlements:array(object)},['id','sourceId','casterId'])})),
 weaponEffect:contract({effects:array(effect),...duration},['effects'],['plan.weaponId','target.possessions'],['target.possessions.weapon.effects'],receipt('weaponEffect',{weaponId:text,active:object})),
 temporaryHealth:contract({onDepleted:shape({resourceId:text,operation:text,grade:enumOf('D','C','B','A','S'),power:{type:'integer',minimum:1},snapshot:enumOf('installation'),boundary:enumOf('after-damage-event')},['resourceId','operation','grade','power','snapshot','boundary']),amount:formula,effects:array(effect),damageFilter:condition,refresh:enumOf('maximum-remaining'),...duration},['amount'],['target.temporaryHealthPools','plan.temporaryHealthChoices'],['temporaryHealthPools','activeResourceEffects'],
  {anyOf:[receipt('temporaryHealth',{kept:text}),receipt('temporaryHealth',{pool:{type:'object',fields:{id:text,capacity:number,remaining:number},required:['id','capacity','remaining'],additional:true}})]}),
 loseAction:contract({action:enumOf('swift','move','standard')},['action'],['target.turn'],['turn','resourceActionLosses'],
  {type:'object',fields:{op:enumOf('loseAction'),action:text,timing:enumOf('current','next')},required:['op','action','timing'],additional:true}),
 accumulate:contract({key:text,amount:formula,thresholdAttribute:enumOf('力量','敏捷','意志','智力','感知','风度'),conditionMinutes:{type:'number',exclusiveMinimum:0},resetAfterRestMinutes:{type:'number',exclusiveMinimum:0}},['key','amount','thresholdAttribute','conditionMinutes','resetAfterRestMinutes'],
  ['target.attributes','target.resourceAccumulators'],['resourceAccumulators','resourceConditions'],receipt('accumulate',{key:text,value:number,threshold:number,unconscious:bool})),
 counter:contract({path:text,amount:formula,maximumPath:text,zeroCondition:enumOf('unconscious')},['path','amount'],['target.counterPath'],['target.counterPath','resourceConditions'],receipt('counter',{path:text,before:number,after:number,changed:number})),
 removeStatus:contract({amount:formula,types:array(text),exclude:array(text),allocate:bool,budgetScope:enumOf('type')},['amount'],['target.statuses','plan.statusAllocations','plan.statusBudgetChoices'],['statuses'],
  receipt('removeStatus',{removed:number,budgetScope:enumOf('type'),budgetPerType:number,allocations:array(object)},['removed'])),
 aura:contract({radius:formula,effects:array(effect),team:enumOf('all','ally','enemy'),selected:bool,temporaryAllocation:shape({key:text,total:formula,maximum:formula},['key','total','maximum']),...duration},['radius'],
  ['scene.positions','scene.teams','plan.targetIds'],['caster.resourceAuras','targets.activeResourceEffects','targets.temporaryHealthPools'],receipt('aura',{id:text,radius:number})),
 trigger:contract({onDeath:shape({radius:formula,excludeCaster:bool,steps:array(object)},['radius','excludeCaster','steps']),instancePolicy:enumOf('append'),endPolicy:enumOf('settle-remaining'),selection:shape({group:text,power:formula,tieBreak:enumOf('latest'),scope:enumOf('caster-grade')},['group','power','tieBreak','scope']),attackSource:enumOf('caster'),event:enumOf('attackDamageCaused','attackResolved','hit','afterLifeLoss','incomingHit','turnStart'),steps:array(object),condition,requiresContext:array(text),requiresConscious:bool,count:formula,perRound:formula,rounds:formula,scene:bool,
  target:enumOf('bearer','eventTarget'),damageNature:enumOf('fixed','attack','extra','retaliation'),sourcePolicy:enumOf('independent-casters','pending-cross-caster'),effectTypes:array(text),effectGradeBonus:{type:'integer'}},['event','steps'],
  ['context.cast','event.context'],['resourceTriggers'],receipt('trigger',{event:text})),
 capability:contract({id:text,sensory:shape({enhanceExisting:bool,grants:array(shape({id:text,minimumGrade:{type:'integer',minimum:0},rangeBasis:enumOf('vague','sensitive'),maximumPrecision:enumOf('vague','exact'),automaticDetection:bool,lineOfEffect:bool,visualIllusionImmunity:bool},['id','minimumGrade','rangeBasis','maximumPrecision','automaticDetection','lineOfEffect','visualIllusionImmunity']))},['enhanceExisting','grants']),mentalGradeBonus:{type:'integer'},mode:enumOf('sensory','mental'),channels:array(enumOf('visual','nonvisual','auditory','olfactory')),periodicDamage:shape({multiplier:formula,sourceImmunityFamily:enumOf('time')},['multiplier','sourceImmunityFamily']),byGrade:object,senses:object,modes:array(text),supernaturalWords:bool,fabricatedInformation:bool,lineOfEffect:bool,rangePolicy:enumOf('existing-senses','existing-vague-sense'),range:formula,from:text,to:text,
  movement:{anyOf:[shape({mode:enumOf('flight'),speed:formula,maneuverability:enumOf('perfect'),control:enumOf('autonomous','external')},['mode','speed','maneuverability']),shape({mode:enumOf('flight'),speedMultiplier:formula,speedBasis:enumOf('current-land'),maneuverability:enumOf('perfect'),control:enumOf('autonomous','external')},['mode','speedMultiplier','speedBasis','maneuverability'])]},
  onEnd:{anyOf:[shape({kind:enumOf('descent'),rounds:formula,metersPerRound:{type:'number',exclusiveMinimum:0},intervalMinutes:{type:'number',exclusiveMinimum:0}},['kind','rounds','metersPerRound','intervalMinutes']),shape({kind:enumOf('fall')},['kind'])]},...duration},['id'],
  ['target.resourceCapabilities'],['resourceCapabilities'],receipt('capability',{capability:{type:'object',fields:{id:text,source:text,level:number},required:['id','source','level'],additional:true}}))
};
const consumer=(module,reader,scopes=['actor'])=>({status:'connected',module,reader,scopes});
export const EFFECT_CONSUMERS={
 attack:consumer('combat/engine.mjs','attackProfile'),attribute:consumer('core.mjs','effectiveAttribute'),check:consumer('core.mjs','check'),attributeCheck:consumer('core.mjs','check; combat/mechanics.saveProfile; combat/engine.attackProfile'),
 flatFootedLevel:consumer('combat/engine.mjs','resolveDefense'),
 defense:consumer('combat/engine.mjs','resolveDefense'),naturalDefense:consumer('combat/engine.mjs','resolveDefense'),
 ignoreAP:consumer('combat/engine.mjs','resolveDefense.alternative',['defense-alternative']),
 ignoreSpeed:consumer('combat/mechanics.mjs','saveProfile + combat/engine.resolveDefense'),
 initiativeDefense:consumer('combat/engine.mjs','resolveDefense'),initiative:consumer('combat/mechanics.mjs','derived'),
 currentInitiative:consumer('combat/initiative.mjs','currentInitiative'),speed:consumer('combat/mechanics.mjs','derived'),willMax:consumer('combat/mechanics.mjs','derived'),
 save:consumer('combat/mechanics.mjs','saveProfile'),tag:consumer('combat/mechanics.mjs','combatRuleContext'),
 incomingDamage:consumer('resource-damage-modifiers.mjs','adjustIncomingDamage'),
 absorb:consumer('combat/engine.mjs','damageEvent'),hardness:consumer('combat/engine.mjs','damageEvent'),dr:consumer('combat/engine.mjs','damageEvent'),energyResistance:consumer('combat/engine.mjs','damageEvent'),
 spellPower:consumer('gm_runtime/resource-program.mjs','executeProgram'),spellResistance:consumer('gm_runtime/resource-program.mjs','executeProgram + resource-auras'),mindStatusReduction:consumer('gm_runtime/resource-program.mjs','resolveProgramSteps'),
 ignoreWoundUnconsciousness:consumer('core.mjs','lifeStatus'),statusPenaltyIgnore:consumer('resource-penalties.mjs','remainingPenalty'),environmentPenaltyIgnore:consumer('resource-penalties.mjs','remainingPenalty'),
 extraSuccess:consumer('core.mjs','check'),explodeReduction:consumer('core.mjs','check'),willEnhancement:consumer('core.mjs','willEnhancement'),
 weaponMagical:consumer('combat/engine.mjs','attackProfile'),weaponSpirit:consumer('combat/engine.mjs','attackProfile'),
 weaponDamage:consumer('resource-weapons.mjs','instanceWeapon',['item']),weaponExplodeReduction:consumer('resource-weapons.mjs','instanceWeapon',['item']),
 terrainFreedom:consumer('combat/engine.mjs','move via kit-state.fengyouActive'),shortRestB:consumer('recovery.mjs','declaredRest + meditate'),shortRestL:consumer('recovery.mjs','declaredRest + meditate'),willPerHour:consumer('recovery.mjs','advanceTime'),learningDiscount:consumer('growth-pricing.mjs','growthPrice'),
 selfProtectionDefense:consumer('combat/engine.mjs','resolveDefense via resource-specializations.protectionChoices'),
 walkingMultiplier:consumer('combat/movement-modes.mjs','movementSpeed via resource-specializations.walkingMultiplier'),
 runningJump:consumer('resource-jumping.mjs','jumpCheckContext + resolveJumpDistance'),
 ...Object.fromEntries(['defenseBypass','craftTimeMultiplier'].map(stat=>[stat,{status:'consumer-missing',scopes:['actor']}]))
};
