import {inspectProjectionAttack,projectionFeature,projectionCanSense,interactProjection,projectionMovementInteractions,projectionWitnesses,dispatchProjectionCue} from '../resource-projections.mjs';
import {redirectDecoyAttack,copyDecoyDamage} from '../resource-decoys.mjs';
import {schedulePassivePerception} from '../resource-perception-scheduler.mjs';
import {effectiveDetectionProtectionSources} from '../resource-detection.mjs';
import {discloseAttackOrigin,recordActualMovements} from '../resource-discovery.mjs';
import {locationPrecision} from './map.mjs';
import {settleResourceDeaths,recordLethalRestriction} from '../resource-death.mjs';
import {stampAutomaticResourceEvents,withAutomaticBatch} from '../resource-automatic-events.mjs';
import {sameTypeAdditionalSegments,validateAdditionalDamageOrder,additionalDamageCandidates,validateDamageTypeOrder,damageTypeKey} from '../resource-additional-damage.mjs';
import {accrueRoundCosts} from '../resource-ongoing.mjs';
import {adjustIncomingDamage} from '../resource-damage-modifiers.mjs';
import {ballisticSphereCrossings} from './ballistics.mjs';
import {inspectJump,beginPaidJump,previewPaidMotion,commitPaidMotion} from './paid-motion.mjs';
import {syncAutonomousFlight} from '../resource-motion.mjs';
import {protectionChoices} from '../resource-specializations.mjs';
import {randomDice} from '../rule-random.mjs';
import {movementSpeed,movementModes,inspectFlightMove,commitFlightPosition} from './movement-modes.mjs';
import {currentInitiative,setCurrentInitiative,initiativeContext} from './initiative.mjs';
import {settleInitiativeChanges} from '../resource-turn-order.mjs';
import {projectRecoveryLocks,syncActorWounds} from '../resource-wounds.mjs';
import {healWounds} from '../healing.mjs';
import {remainingPenalty} from '../resource-penalties.mjs';
import {PHYSICAL_ACTIONS,physicalPriceRequest} from './action-prices.mjs';
import {quoteActionPrice,consumeActionPrice,combatRoundKey} from '../resource-action-pricing.mjs';
import {effectiveStatuses} from '../resource-status-applicability.mjs';
import {BASIC_ACTIONS} from '../resource-action-bindings.mjs';
import {weaponHandling,ordinaryWeaponType,weaponAmmoSpec,weaponAmmoState,consumeWeaponAmmo,loadWeaponAmmo} from '../resource-weapons.mjs';
import {changeWill} from '../resource-counters.mjs';
import {resourceBonus,resourceEffects,observationContext,RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {refreshResourceAuras} from '../resource-auras.mjs';
import {settleResourceConcentration,endResourceChannelTurn} from '../resource-channeling.mjs';
import {convertIncomingDamage,stackEffects} from '../resource-effects.mjs';
import {resourceCapability} from '../resource-lifecycle.mjs';
import {flushAutomaticResourceEvents,fireResourceTriggers,isReflexResource,runBasicResourceAction} from '../gm_runtime/resource-program.mjs';
import {pathFeatures} from './map.mjs';
import { spendAPAction, beginTurn, endTurn, spendAction, actionEligibility, lifeStatus, statusPenaltyPoints, statusLevel, rollPool, resolveDamage,weaponDamageCap,checkBeforeAction,advanceDeterioration,firstAid,checkModifiers,check,applyStatus,advanceGeneticLock,geneticCheckBonus,geneticWillAuto,willEnhancement,counteractTemperature } from '../core.mjs';
import {samplePassivePerception,measurePath,clearLine,canObserve,blocking,contains,terrainCover,nearestPoint,spatialDistance,elevationAt,groundElevationAt,earthPath} from './map.mjs';
import {rememberTactic} from './tactics.mjs';
import { ABILITIES, makeLotus } from './catalog.mjs';
import {objectiveSatisfied} from './opening.mjs';
import {grappleChoice,grappleContest,attachClaw,releaseGrapple,grappleMembers,weightedGrappleTarget} from './grapple.mjs';
import {runSceneMechanism,advanceSceneTime,sceneBarriers} from '../gm_runtime/scene-rules.mjs';
import {reduceRecovery,advanceActorsTime} from '../recovery.mjs';
import {triggerSpiritWard,ringTransfer} from '../possessions.mjs';
import {limbMovement,limbEffects,statusActionPermission,statusEvent,burningDamage,periodicStatusDamage,completeStatusOrder} from '../status-rules.mjs';
import {assertEnergyAllowed,settleInterruptedTeleports,settleEngageReturns,assertEmbodied} from '../gm_runtime/conditional-resources.mjs';
import {wizardCheck,wizardWeapon,wizardFireSegments} from '../wizard-rules.mjs';
import { value, automatic, skill, attackSkill, equipment, combatRuleContext, compatibleContribution, profile, derived, refreshDerived, blockValue, saveProfile, rollCombatPool, RuleInputError, IllegalAction } from './mechanics.mjs';

const clone = x => structuredClone(x);
const sum = x => Object.values(x).reduce((n,v) => n + v, 0);
const points = (a,t) => statusLevel(a.state,t).points;
const penaltyPoints=(a,t)=>statusPenaltyPoints(a.state,t);
const auto = automatic;
const frozen = a => ['麻痹','精神束缚','纠缠','冻结'].some(t => statusLevel(a.state,t).severe);
const unconscious = a => a.construct&&a.state.health.intact===0 || !a.diehard && ['dead','unconscious'].includes(lifeStatus(a.state).state)
  || lifeStatus(a.state).reason === 'resource-condition' || lifeStatus(a.state).state === 'dead' || statusLevel(a.state,'晕眩').severe || statusLevel(a.state,'剧痛').severe;
const penalty = a => ['麻痹','精神束缚','冻结','纠缠','晕眩','疲乏'].reduce((n,t) => n+penaltyPoints(a,t),0) + lifeStatus(a.state).woundPenalty;
const fail = text => { throw new IllegalAction(text); };
const requireThat = (ok,text) => { if (!ok) fail(text); };
const physicalActions = new Set(['strike','thunder','cleaveRock','lightning','conduct','move','step','jump','continueJump','block','draw','sheathe','roar','tornado','gale','zheng','reload','aim','door','destroy','shieldPush','calibrate','drawClub','readyBow','medicine']);

export {randomDice} from '../rule-random.mjs';

function spend(b,a,c, kind, behavior, pricing,priceAction) {
  const request=physicalPriceRequest(b,a,c,kind);
  if(request)pricing=quoteActionPrice(a.state,request);
  // 死硬 only overrides injury unconsciousness, never death or status incapacity.
  const proxy = clone(a.state);
  if ((a.diehard||a.preActionCleared) && proxy.health.intact === 0 && lifeStatus(proxy).state !== 'dead') {
    const slot = proxy.health.L ? 'L' : 'B';
    if (proxy.health[slot]) { proxy.health[slot]--; proxy.health.intact++; }
  }
  const options={behavior,context:a.statusPermission,...(kind==='opportunity'?{enemyLeavesThreat:true}:{})};
  let out;
  if(pricing)out=spendAPAction(proxy,pricing.ap,options);
  else {out={state:proxy,result:{allowed:true}};for(const part of Array.isArray(kind)?kind:[kind]){out=spendAction(out.state,part,options);if(!out.result.allowed)break;}}
  requireThat(out.result.allowed, out.result.reason);
  if(pricing){consumeActionPrice(a.state,pricing);a.state.activeResourceEffects=out.state.activeResourceEffects;}
  a.state.turn = out.state.turn;
  return pricing;
}

function pay(a, resource, count, payment = 'pool') {
  assertEnergyAllowed(a.state,{resource});
  if (payment === 'restraint') {
    requireThat(a.kind === 'huang' && resource === '灵力', '仅灵力可以精神束缚代付');
    requireThat(points(a,'精神束缚') <= a.state.attributes.意志*3, '精神束缚已超代付阈值');
    const entries = a.state.statuses.filter(s => s.type === '精神束缚').sort((x,y) => y.points-x.points);
    if (entries.length) { entries[0].points += count; entries[0].restBlocked = true; }
    else a.state.statuses.push({ type: '精神束缚', source:'灵力代付', points: count, restBlocked:true });
    return;
  }
  requireThat(payment === 'pool','未知支付方式');
  const p = a.state.resources[resource];
  requireThat(p && p.current >= count, `${resource}不足：需要${count}`);
  p.current -= count;
}

function heal(a, allowed, canHealAggravated=false) {
  const result=healWounds(a,{budget:1,order:allowed,ratios:{B:1,L:1,...(canHealAggravated?{A:1}:{})}});
  return result.changes[0]?.severity??null;
}

export function attackProfile(b, id, c = {}) {
  let a = b.actors[id];const type = c.abilityId ?? 'strike',w=equipment(a).weapon;
  const actualWeapon=!!(w.instanceId||w.resourceId),weaponType=ordinaryWeaponType(w),legacyCompatible=!actualWeapon||w.skill===profile(a).main&&weaponType===(ordinaryWeaponType(profile(a).equipment?.weapon??{})??({'白刃':'melee','肉搏':'natural','弓箭':'bow','枪械':'gun'}[profile(a).main]));
  if(actualWeapon&&!['melee','natural','bow'].includes(weaponType))throw new IllegalAction('该实际武器类别的完整装填/投掷消耗尚未接入（实现缺口）：'+weaponType);
  if(actualWeapon&&weaponType==='bow')a={...a,weaponMode:'bow'};
  const sk=attackSkill(a), str=value(a,'力量'), agi=value(a,'敏捷');
  let attackAttribute='力量';
  let weapon, rawDP, cap, fixed, ap, magic=0, speed=0, extra=0, ignore=0, aggravate=0;
  let electric=0, reduction=0, range=a.reach, explode=10, bowRangeUnit=null,legacySpeed=0;
  if(wizardWeapon(a.state)){
    const gun=a.state.wizard.weaponMode==='gun';attackAttribute=gun?'敏捷':'力量';weapon=w.damage;ap=w.ap;magic=w.magic;rawDP=(gun?agi:str)+sk.level+weapon;cap=weapon+sk.level+(gun?0:str);fixed=auto(a,gun?'敏捷':'力量')+sk.auto;range=gun?100:a.reach;
  }else if(actualWeapon&&!legacyCompatible){
    if(!weaponType)throw new RuleInputError('须实际武器攻击类别','weapon.type');
    const attribute=['bow','gun','thrown'].includes(weaponType)?'敏捷':'力量';attackAttribute=attribute;
    weapon=w.damage;rawDP=value(a,attribute)+sk.level+weapon+(w.attackBonus??0);
    cap=weaponDamageCap({...w,type:weaponType},sk.level,str,attribute);fixed=auto(a,attribute)+sk.auto;ap=w.ap??0;magic=w.magic??0;
    reduction=w.defenseReduction??0;
  }else if(a.ruleset==='opening-20261022') {
    weapon=w.damage;ap=w.ap??0;magic=w.magic??0;
    const target=b.actors[c.targetId],strengthAttack=c.strength===true||a.kind==='bright'&&a.weaponMode&&a.weaponMode!=='bow'||!['yulin','huang','bright'].includes(a.kind)&&!(a.kind==='mireya'&&a.weaponMode!=='club');
    attackAttribute=strengthAttack?'力量':'敏捷';rawDP=(strengthAttack?str:agi)+sk.level+weapon+(w.attackBonus??0);
    cap=profile(a).cap??weapon+sk.level+(strengthAttack?str:0);fixed=auto(a,strengthAttack?'力量':'敏捷')+sk.auto;
    if(a.kind==='yulin') {legacySpeed=(a.buffs.flow??0)*2;rawDP+=(strengthAttack?0:a.buffs.tengzhuan?4:2)+(a.buffs.flow??0)*2+(type==='gale'?3:0);reduction=type==='tornado'?8:w.defenseReduction??0;if(['tornado','gale'].includes(type))range=20;}
    if(a.kind==='huang') {
      const drawn=type==='strike'&&a.buffs.drawnRound===b.round&&!a.buffs.drawUsed;
      rawDP+=drawn?2:type==='thunder'?4:0;
      if(drawn&&target&&initiative(b,a)>initiative(b,target))extra=1;
      if(type==='thunder')electric=2;
      if(type==='cleaveRock'){ap+=4;ignore=1;}
    }
    if(a.kind==='jiang') {
      const bare=target&&!target.construct&&equipment(target).armor.defense===0;
      if(bare){weapon+=4;rawDP+=4;cap+=4;fixed++;}
      rawDP+=Math.min(1,a.combos[c.targetId]??0);speed=5;
      if(c.empowered)requireThat(false,'初始卡没有强化一击');
    }
    if(a.kind==='bright'&&(!a.weaponMode||a.weaponMode==='bow')) {
      const unit=w.rangePerStrength!==undefined?str*w.rangePerStrength:w.rangeUnit??40,located=target&&spatialDistance(b.map,a.position,target.position)<=40;
      const aimed=Math.min(3,(located?1:0)+(a.aim&&a.aim.targetId===c.targetId?a.aim.rounds??0:0));
      rawDP+=aimed+(aimed>=2?2:0);cap=weapon*2+sk.level+w.strengthRequirement;
      if(target)rawDP-=Math.max(0,Math.ceil(spatialDistance(b.map,a.position,target.position)/unit)-1)*2;
      bowRangeUnit=unit;range=unit*(w.rangeUnits??8);explode=w.explode??10;aggravate=aimed>=3?1:0;extra=aimed>=3?1:0;
    }
    if(a.kind==='mireya'&&a.weaponMode!=='club') {
      const unit=w.rangeUnit;
      const calibration=a.calibration?.ready&&a.calibration.targetId===c.targetId&&canObserve(b,target,a.id)?3:0;
      rawDP+=calibration;cap=weapon*2+sk.level+w.strengthRequirement;
      if(target)rawDP-=Math.max(0,Math.ceil(spatialDistance(b.map,a.position,target.position)/unit)-1)*2;
      bowRangeUnit=unit;range=unit*8;
    }
  } else if (a.kind === 'jiang') {
    const empowered = Boolean(c.empowered);
    weapon = w.damage + (a.buffs.fistQi ? 2 : 0) + (empowered ? 1 : 0);
    const combo = a.combos[c.targetId] ?? 0;
    rawDP = str+sk.level+weapon+3+12+3+(a.spartanBonus??0)+combo;
    cap=weapon+sk.level+str; fixed=auto(a,'力量')+sk.auto; ap=(a.buffs.breakBody?4:w.ap)+(empowered?1:0); speed=4;
    ignore=4+(empowered?1:0); extra=c.finisher&&combo===5 ? 5:0;
  } else if (a.kind === 'huang') {
    const useStrength=c.strength===true;attackAttribute=useStrength?'力量':'敏捷';
    weapon=w.damage+(type==='cleaveRock'?2:0);
    const drawn = a.buffs.drawnRound === b.round && !a.buffs.drawUsed;
    const moveBonus = Math.max(drawn?3:0, type==='lightning'&&c.tier===3?6:0);
    rawDP=(useStrength?str:agi)+sk.level+weapon+9+w.attackBonus+moveBonus+(type==='thunder'?15:0);
    cap=weapon+sk.level+(useStrength?str:0); fixed=auto(a,useStrength?'力量':'敏捷')+sk.auto; ap=type==='cleaveRock'?16:w.ap; magic=w.magic;
    ignore=type==='cleaveRock'?4:0;
    const target=b.actors[c.targetId];
    aggravate=drawn && target && initiative(b,a)>initiative(b,target) ? 2:0;
    if (type==='thunder') electric=0.5;
    if (type==='lightning') { electric=c.tier===1?0.5:1; speed=c.tier>=2?8:0; aggravate=Math.max(aggravate,c.tier===1?2:4); }
    if (type==='conduct') { rawDP=(useStrength?str:agi)+sk.level+9; weapon=0; cap=1; ap=0; magic=0; aggravate=0; }
    if (type==='cleaveRock' && target?.buffs.block) {
      const size=a.weaponSize??w.size;
      if(!Number.isInteger(size)) throw new RuleInputError('斩岩威猛需要主持补齐狮子王武器体积',`${id}.weaponSize`);
      rawDP+=Math.min(Math.floor(size/2),blockValue(target));
    }
  } else if(a.kind==='yulin') {
    attackAttribute=c.strength?'力量':'敏捷';weapon=w.damage;
    const posture=a.buffs.tengzhuan?4:2, flow=(a.buffs.flow??0)*2;legacySpeed=flow;
    rawDP=(c.strength?str:agi)+sk.level+weapon+w.attackBonus+flow
      +(c.strength?0:posture)+Math.max(a.buffs.bixie??0,type==='gale'?3:0);
    cap=weapon+sk.level+(c.strength?str:0); fixed=auto(a,c.strength?'力量':'敏捷')+sk.auto;
    ap=w.ap; magic=w.magic; reduction=type==='tornado'?8:(w.defenseReduction??0);
    if(['tornado','gale'].includes(type)) range=20;
  } else if(a.kind==='bright') {
    attackAttribute='敏捷';const safe=!a.interfered&&!Object.values(b.actors).some(t=>t.present&&t.team!==a.team&&!unconscious(t)&&spatialDistance(b.map,a.position,t.position)<=7.5);
    const obstacle=c.featureId&&b.map?.features.find(f=>f.id===c.featureId);
    const target=b.actors[c.targetId]??(obstacle?{position:nearestPoint(a.position,obstacle)}:null), unit=str*(w.rangePerStrength??50);
    const autoAim=target&&spatialDistance(b.map,a.position,target.position)<=unit*3?1+auto(a,'感知'):0;
    const aimed=Math.min(3,autoAim+(a.aim&&a.aim.targetId===c.targetId?a.aim.rounds??0:0));
    const weak=aimed>=3&&a.knownWeaknesses?.includes(c.targetId);
    weapon=w.damage;
    rawDP=agi+(safe?6:0)+sk.level+weapon+w.attackBonus+3+aimed+(weak?6:aimed>=2?2:0);
    if(target) rawDP-=Math.max(0,Math.ceil(spatialDistance(b.map,a.position,target.position)/unit)-1)*2;
    cap=Number.isInteger(w.strengthRequirement)?weapon*2+sk.level+w.strengthRequirement:null;
    fixed=Math.max(0,Math.floor((agi+(safe?6:0)-1)/5))+sk.auto;
    ap=w.ap; magic=w.magic; bowRangeUnit=unit;range=unit*10; explode=9; aggravate=weak?2:0;
  } else { weapon=w.damage; rawDP=str+sk.level+weapon+w.attackBonus; cap=weapon+sk.level+str; fixed=auto(a,'力量')+sk.auto; ap=w.ap; magic=w.magic; }
  if(actualWeapon&&!wizardWeapon(a.state)){
    if(['bow','gun','thrown'].includes(weaponType)){
      const unit=w.rangePerStrength!==undefined?str*w.rangePerStrength:w.rangeUnit;
      if(!(unit>0))throw new RuleInputError('须实际远程武器射程单位','weapon.rangeUnit');
      const distance=b.actors[c.targetId]?spatialDistance(b.map,a.position,b.actors[c.targetId].position):0;
      if(!legacyCompatible)rawDP-=Math.max(0,Math.ceil(distance/unit)-1)*2;
      range=unit*(w.rangeUnits??(weaponType==='bow'?8:weaponType==='gun'?5:str));
      if(weaponType==='bow')bowRangeUnit=unit;
      cap=weaponDamageCap({...w,type:weaponType},sk.level,str,'敏捷');
    }else if(type==='strike'||type==='destroy')range=a.reach;
    if(w.defenseReductionMinimumSkill!==undefined&&sk.level<w.defenseReductionMinimumSkill)reduction=0;
  }
  const wizardChoice=wizardWeapon(a.state)?a.state.wizard.weaponSkills?.[a.state.wizard.weaponMode]:null;
  const single=!c.rapidFire&&!c.rapidSecondary&&!c.adjacentTargetIds?.length&&!['doubleStrike','gale'].includes(type);
  rawDP+=geneticCheckBonus(a.state,{willEligible:single,willSpent:c.willpower===true});
  if(c.willpower){rawDP+=3+resourceBonus(a.state,'willEnhancement');fixed+=geneticWillAuto(a.state,{willEligible:true,willSpent:true});}
  if(c.rapidFire)rawDP+=3-(c.adjacentTargetIds?.length??0);
  if(c.rapidSecondary)rawDP-=c.rapidPenalty;
  rawDP+=wizardCheck(a.state,{skill:wizardChoice?.main??profile(a).main,sub:wizardChoice?.sub??profile(a).sub,context:{gun:a.state.wizard?.weaponMode==='gun'}}).dp;
  if(wizardWeapon(a.state)){range=a.state.wizard.weaponMode==='gun'?100:a.reach;cap=weapon+sk.level+(a.state.wizard.weaponMode==='gun'?0:str);}
  if(a.state.wizard?.form==='earth'&&wizardWeapon(a.state))ignore=Math.max(ignore,3);
  const observedTarget=b.actors[c.targetId];
  const handling=weaponHandling(w,{strength:str,...(bowRangeUnit?{mode:'bow',rangeUnit:bowRangeUnit,rangeUnits:range/bowRangeUnit}:{}),distance:observedTarget?spatialDistance(b.map,a.position,observedTarget.position):0});
  if(handling.range!==undefined)range=handling.range;
  rawDP-=handling.distancePenalty+handling.gripPenalty;
  rawDP+=stackEffects([...resourceEffects(a.state,'attributeCheck',{attribute:attackAttribute,attributes:[attackAttribute],attack:true,targetId:c.targetId}),...resourceEffects(a.state,'attack',{...observationContext(a.state,c.targetId,observedTarget?canObserve(b,observedTarget,a.id):false),...initiativeContext(b,id,c.targetId)}),{group:'equipment',value:-handling.strengthPenalty},{source:w.resourceId??'actual-held-weapon',stat:'attack',origin:'item',group:'speed',value:w.speedBonus??0,contribution:{sourceInstanceId:w.instanceId??w.resourceId??'legacy-weapon/'+a.id,itemId:w.instanceId,clauseId:'attack-speed',consumer:'attack'}},...(actualWeapon?[{source:w.resourceId??'actual-held-weapon',stat:'attack',origin:'item',group:'equipment',value:w.attackBonus??0,contribution:{sourceInstanceId:w.instanceId??w.resourceId??'legacy-weapon/'+a.id,itemId:w.instanceId,clauseId:'attack-equipment',consumer:'attack'}}]:[])],{speed:legacySpeed,...(actualWeapon?{equipment:w.attackBonus??0}:{})}).value;
  if(['白刃','肉搏'].includes(w.skill??profile(a).main))rawDP+=a.state.huaJin?.nextAttack??0;
  rawDP-=checkModifiers(a.state,{context:{attack:true,physical:true,visual:!a.windSense&&!a.spiritSight,targetId:c.targetId,limbIds:c.limbIds??a.state.anatomy?.attackLimbs}}).penalty;
  if(type==='doubleStrike')rawDP-=2;
  if(a.state.timedEffects?.thunderPotion?.remainingMinutes>0)rawDP+=4;
  rawDP-=a.state.grapple?.margin??0;
  if (a.diehard && a.state.health.intact===0) rawDP+=a.state.health.A?3:a.state.health.L?2:1;
  explode=Math.min(explode,w.explode??10);
  return { rawDP, dp:rawDP, attribute:attackAttribute, handling, legacyCompatible,weaponType,severity:actualWeapon?w.severity??'L':profile(a).severity??'L',weapon, cap, fixed, ap, magic, speed, extra, ignore, aggravate, electric, reduction, range, explode,magical:w.magical===true||resourceBonus(a.state,'weaponMagical')>0,ranged:actualWeapon?['bow','gun','thrown'].includes(weaponType):w.range>0||['射击','枪械','弓箭'].includes(wizardChoice?.main??profile(a).main),firearm:['gun','firearm'].includes(w.type)||wizardWeapon(a.state)&&a.state.wizard.weaponMode==='gun',ballistic:w.ballistic===true||wizardWeapon(a.state)&&a.state.wizard.weaponMode==='gun',energyWeapon:w.energyWeapon===true,grade:w.grade,hardnessIgnore:a.state.wizard?.form==='earth'&&wizardWeapon(a.state)?6:ignore,spiritEligible:a.spiritStrike===true||w.spiritStrike===true||magic>0||resourceBonus(a.state,'weaponSpirit')>0 };
}

function initiative(b,a) { return currentInitiative(a); }

export function resolveDefense(b, id, attackerId, attack = {}, resourceAlternative=null,protectionSelection=null) {
  const source=b.actors[id], attacker=b.actors[attackerId];
  const defenseMode=source.state.underworld?'normal':attack.defenseMode??source.defenseIntent?.mode;
  if(b.playerDefenseDeclarations&&source.controller==='player'&&!defenseMode)return {pending:true};
  const a=b.playerDefenseDeclarations&&source.controller==='player'&&defenseMode==='normal'
    ?{...source,buffs:{...source.buffs,block:false,zheng:false}}:source;
  const eq=equipment(a), base=Math.max(0,Math.min(value(a,'敏捷'),value(a,'感知'))-(eq.armor.basePenalty??0));
  const defenderLocation=attacker?locationPrecision(b,attacker,id):'none';
  const pendingPerception=Object.values(a.state.resourcePendingPerceptions??{}).filter(x=>x.event.targetId===attackerId);
  if(attacker&&defenderLocation!=='exact'&&pendingPerception.length)return {pending:true,perception:pendingPerception};
  const flatSources=attacker?resourceEffects(attacker.state,'flatFootedLevel',{targetId:id,defenderLocation,defenderDiscovered:a.state.resourceDiscoveries?.[attackerId]?.everLocated===true,effectiveConcealmentInstances:effectiveDetectionProtectionSources(attacker.state,a.state).map(x=>x.source+'/'+x.casterId)}):[];
  for(const row of flatSources)requireThat(Number.isInteger(row.value)&&row.value>=0,'措手不及来源须实际非负整数效果等级');
  const flatLevel=Math.max(attack.flatFootedLevel??-1,attacker&&defenderLocation!=='exact'?0:-1,...flatSources.map(row=>row.value));
  if(flatLevel>=0)attack={...attack,flatFootedLevel:flatLevel};

  const kitContext={...observationContext(a.state,attackerId,attacker?canObserve(b,attacker,a.id):false),...combatRuleContext(a,{flatFootedLevel:attack.flatFootedLevel,incomingSpeed:attack.speed??0,firearmAttack:attack.firearm===true,attackerVisible:!!attacker&&canObserve(b,attacker,a.id)})};
  let p={base:base+geneticCheckBonus(a.state,{willEligible:true}),natural:profile(a).natural,armor:eq.armor.defense,
    dodge:auto(a,'敏捷'),insight:auto(a,'感知'),block:a.buffs.block&&!a.sheathed?blockValue(a):0};
  if(attack.ranged&&a.rangedNatural!==undefined)p.natural=a.rangedNatural;
  if(a.state.wizard?.form==='earth')p.force=4;
  if(a.state.wizard?.form==='wind')p.speedBonus=2;
  if(a.state.wizard?.form==='water'&&p.block)p.block+=2;
  if(a.state.timedEffects?.wizardDefend?.form==='fire')p.wizardDefend=2;
  p.cover=attacker?terrainCover(b.map,attacker.position,a.position):0;
  if(a.ruleset==='opening-20261022') {p.dodge=0;p.insight=0;}
  p.dodge+=a.dodgeBonus??0;
  if(eq.armor.shield)p.shield=eq.armor.shield;
  if(a.kind==='radwick'&&a.buffs.brace&&!attack.nonphysical)p.enhancement=3;
  if(attacker&&initiative(b,a)>initiative(b,attacker))p.base+=compatibleContribution(a,'initiativeDefense').value;
  if(a.kind==='huang'&&a.ruleset!=='opening-20261022') p.cultivation=a.sheathed?0:6;
  if(a.kind==='jiang'||a.kind==='lotus') { p.dodge=0;p.insight=0; }
  if(a.kind==='yulin') {
    p.dodge+=a.buffs.tengzhuan?4:2; p.insight=0;
    p.deflection=a.buffs.zheng?attackSkill(a).level+auto(a,'智力'):a.state.possessions?.phaseRing?.worn===false?0:2;
    if(a.ruleset!=='opening-20261022')p.force=Math.max(p.force??0,a.buffs.block?Math.max(1,eq.weapon.force??0):1);
  }
  kitContext.baseDefense=p.base;
  // Compare one enriched spell source at a time, then perform ordinary category
  // stacking and AP. The unchanged candidate wins ties; no bonus is duplicated.
  if(protectionSelection===null){
    const choices=protectionChoices(a,kitContext);
    if(choices.length)return [false,...choices].map(choice=>resolveDefense(b,id,attackerId,attack,resourceAlternative,choice))
      .sort((x,y)=>y.total-x.total||x.remainingAP-y.remainingAP)[0];
  }
  const selectedAlternative=protectionSelection&&resourceAlternative?.instanceId===protectionSelection.instanceId;
  const enrich=protectionSelection&&!selectedAlternative;

  const unmodifiedDefense={...p};
  const defenseRows=resourceEffects(a.state,'defense',kitContext).map(e=>({...e,untrainedValue:e.value,value:e.value+(enrich&&e.instanceId===protectionSelection.instanceId&&e.group===protectionSelection.group?protectionSelection.bonus:0)})),categories=['armor','natural','dodge','force','cover','shield','luck','morale','enhancement','holy','unholy','technique','performance','intrinsic','unnamed'];
  for(const category of categories){const rows=defenseRows.filter(e=>e.group===category);if(rows.length)p[category]=(p[category]??0)+stackEffects(rows,{[category]:p[category]??0}).value;}
  // A layered defense can declare alternatives when its primary category is
  // already surpassed. Numeric same-category effects still take their maximum;
  // choose a single alternative by the final defense against this attack.
  const fallback=defenseRows.filter(e=>e.fallbacks?.length).sort((x,y)=>y.value-x.value)[0];
  if(fallback&&Math.max(unmodifiedDefense[fallback.group]??0,...defenseRows.filter(e=>e.group===fallback.group).map(e=>e.instanceId===fallback.instanceId?e.untrainedValue:e.value))>fallback.untrainedValue&&!resourceAlternative){
    const candidates=fallback.fallbacks.map(choice=>resolveDefense(b,id,attackerId,attack,{...choice,value:fallback.untrainedValue,source:fallback.source,instanceId:fallback.instanceId},protectionSelection));
    return candidates.sort((x,y)=>y.total-x.total||x.remainingAP-y.remainingAP)[0];
  }
  if(resourceAlternative?.stat==='defense')p[resourceAlternative.group]=Math.max(p[resourceAlternative.group]??0,resourceAlternative.value+(selectedAlternative?protectionSelection.bonus:0));
  p.natural+=resourceBonus(a.state,'naturalDefense',kitContext,{natural:p.natural});
  const kitDefense=stackEffects(defenseRows.filter(e=>!categories.includes(e.group)),{training:p.cultivation??0,insight:p.insight??0}).value;
  if(kitDefense)p.kitInsight=kitDefense;
  if (frozen(a) || unconscious(a)) { p.base=0; p.dodge=0; p.block=0; }
  if(attack.flatFootedLevel!==undefined&&(resourceCapability(a.state,'flatFootedImmunity')?.level??-1)<attack.flatFootedLevel){p.base=0;p.dodge=0;p.block=0;}
  if(statusLevel(a.state,'沮丧').severe){p.dodge=0;p.block=0;}
  if(a.state.sleeping||a.state.underworld){p.dodge=0;p.block=0;}
  if(a.state.permanentConditions?.some(x=>x.kind==='nauseaCollapse'))p.base=0;
  if(a.state.grapple?.pressed){p.base=0;p.dodge=0;p.block=0;}
  if(attacker&&(a.state.grapple&&a.state.grapple.holderId!==attackerId||a.claws?.some(id=>id&&id!==attackerId)))p.base=0;
  const eat=(keys,n) => { for(const k of keys) { const v=Math.min(p[k]??0,n); p[k]=(p[k]??0)-v; n-=v; } return n; };
  const restraint=['精神束缚','麻痹','纠缠','冻结','剧痛','欲眠'].reduce((n,t)=>n+penaltyPoints(a,t),0);
  eat(['base','dodge','block'],restraint+lifeStatus(a.state).woundPenalty);
  const fears=effectiveStatuses(a.state,'恐惧').filter(s=>s.sourceActorId!==attackerId);
  if(fears.length)eat(['base','dodge','block'],statusPenaltyPoints(a.state,'恐惧',Math.max(...fears.map(s=>s.points))));
  eat(['block'],a.state.grapple?.margin??0);
  if(a.state.wizard?.form!=='wind')eat(['base','dodge','insight'],(a.state.timedEffects?.wizardWaterPenalty?.points??0)+(a.state.timedEffects?.garudaInterference?.points??0));
  const terrainPenalty=Math.max(0,...(b.map?.features??[]).filter(f=>!f.destroyed&&contains(a.position,f)).map(f=>f.defensePenalty??0));
  eat(['base','dodge','block'],Math.max(0,remainingPenalty(a.state,'environment',terrainPenalty)-(a.kind==='yulin'&&a.buffs.tengzhuan?5:0))+penaltyPoints(a,'亢奋'));
  if (a.buffs.iaiPenalty) eat(['base','dodge','block','insight','cultivation','armor','natural'],2);
  if (attack.contact) { p.armor=0; p.natural=0; }
  eat(['base','dodge','block','insight','cultivation'],Math.max(0,(attack.speed??0)-compatibleContribution(a,'ignoreSpeed',kitContext).value));
  const protectedDeflection=a.buffs.zheng?p.deflection:0;
  if(attack.reduction===8) eat(['base','dodge','block','insight','cultivation','armor','natural','force',...(protectedDeflection?[]:['deflection'])],8);
  else eat(['base','dodge','block'],attack.reduction??0);
  if(a.willDefenseReady)p.will=3+resourceBonus(a.state,'willEnhancement')+geneticCheckBonus(a.state,{willEligible:true,willSpent:true})-geneticCheckBonus(a.state,{willEligible:true});
  const ignoredAP=resourceAlternative?.stat==='ignoreAP'?resourceAlternative.value:0;
  const remainingAP=eat(['cover','force','device','shield','armor','natural'],Math.max(0,(attack.ap??0)-ignoredAP));
  eat(['luck','morale','enhancement','holy','unholy','technique','performance','intrinsic','unnamed'],attack.magic??0);
  return { total:sum(p), parts:p, remainingAP,...(flatLevel>=0?{flatFooted:{level:flatLevel,defenderLocation,sources:flatSources.map(({source,instanceId,value})=>({source,instanceId,level:value}))}}:{}),...(protectionSelection&&(!selectedAlternative||resourceAlternative.stat==='defense')?{selfProtection:{...protectionSelection,group:selectedAlternative?resourceAlternative.group:protectionSelection.group}}:{}),...(resourceAlternative?{resourceAlternative}:{}),guarded:Boolean(a.buffs.block&&!a.sheathed&&!frozen(a)&&!unconscious(a)),
    extraSuccesses:frozen(a)||unconscious(a)?0:(a.willDefenseReady?geneticWillAuto(a.state,{willEligible:true,willSpent:true}):0)+(eq.armor.defenseExtra??0)+(a.ruleset==='opening-20261022'?(p.block? (a.kind==='bright'?skill(a,'白刃').auto:attackSkill(a).auto):0):auto(a,'敏捷')+auto(a,'感知')+(eq.armor.defenseAuto??0)) };
}

export function panel(b,id,attackerId) {
  const a=clone(b.actors[id]);refreshDerived(a);
  const s=a.state;
  const d=derived(a);
  let speed=movementSpeed(a,d.speed,a.flight?'flight':a.underground?'earth':'land',{applyLandBonuses:true});
  if(a.underground)speed=Math.min(8,Math.max(0,d.speed-penalty(a)));
  return { id, name:a.name, team:a.team, controller:a.controller, attributes:clone(s.attributes),
    health:clone(s.health), hpMax:s.derived.hpMax, life:unconscious(a)?'失去行动能力':s.sleeping?'睡眠':s.underworld?'意识离体':'可行动',
    position:clone(a.position), movementModes:movementModes(a),altitude:s.verticalPosition?.heightAboveGround??null,initiative:initiative(b,a), speed:Math.max(0,speed),
    attack:attackProfile(b,id), defense:resolveDefense(b,id,attackerId), actions:clone(s.turn),
    energy:clone(s.resources), will:clone(s.will), statuses:clone(s.statuses),
    buffs:clone(a.buffs), combos:clone(a.combos), cooldowns:clone(a.cooldowns), used:clone(a.used),
    reactions:clone(a.reactions), sheathed:a.sheathed };
}

function saveRoll(a,type,drawDice,{ recognizable=false, speed=0, cover=0, areaAttack=false }={}) {
  if(a.state.sleeping&&type==='reflex')return {dp:0,dice:[],used:0,rolledSuccesses:0,fixed:0,extra:0,total:0,type};
  const {dp:base,fixed,extra}=saveProfile(a,type,{recognizable,speed,areaAttack});
  const elected=a.willDefenseReady===true;
  const dp=base+(elected?3+resourceBonus(a.state,'willEnhancement'):0)+geneticCheckBonus(a.state,{willEligible:true,willSpent:elected})+(type==='reflex'?cover:0)+wizardCheck(a.state).dp-checkModifiers(a.state,{context:{willResistance:type==='will',physical:type!=='will',motion:type==='reflex',reflex:type==='reflex'}}).penalty;
  const bonus=geneticWillAuto(a.state,{willEligible:true,willSpent:elected});
  const r=rollPool(dp,drawDice());if(elected){changeWill(a.state,-1);delete a.willDefenseReady;}
  return { ...r, fixed:fixed+bonus,willCost:elected?1:0,extra:r.rolledSuccesses>0?extra:0,total:r.rolledSuccesses+fixed+bonus+(r.rolledSuccesses>0?extra:0), type };
}

function inflictStatus(a,type,count,source,drawDice) {
  if(type==='麻痹'&&a.immunities?.includes('nerveParalysis'))return {type,points:count,remaining:0,immune:true};
  const save=saveRoll(a,'fort',drawDice);
  const remaining=Math.max(0,count-save.total);
  if (remaining) a.state.statuses.push({ type, source, points:remaining });
  return { type, points:count, remaining, save };
}

export function damageEvent(a, segments, conversion, result, bypass={conversion:0}, event={}) {
  syncActorWounds(a);
  segments=segments.map(s=>({...s,attack:event.damageNature==='attack',ranged:event.damageNature==='attack'&&event.ranged===true}));
  // RE damage flow 87–95: explicit multiple single-type damages are separate
  // events. Legacy PHB callers keep their adopted grouping unless their source
  // opts in; severity splits within one type still share their defenses.
  if(event.segmentMode==='independent-types'){
    const groups=new Map();
    for(const segment of segments){const key=JSON.stringify([segment.kind,segment.energyType??null,segment.damageType??null]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(segment);}
    return [...groups.values()].reduce((sum,parts)=>sum+damageEvent(a,parts,conversion,result,
      {...bypass,protection:undefined,additionalSources:undefined,emittedLifeLossTargets:undefined,pendingLifeLoss:undefined},
      {...event,segmentMode:'shared',deferReactions:false}),0);
  }
  const adjusted=adjustIncomingDamage(a,segments,event);segments=adjusted.segments;if(adjusted.receipts.length)(result.damageAdjustments??=[]).push(...adjusted.receipts);
  let n=0,reactiveLoss=0;
  const hasReactiveDamage=segments.some(s=>s.amount>0&&!s.unavoidable);
  const pendingStart=(a.state.resourceConcentration??[]).length;
  const conversionPolicy=a.state.learnedResources?.['chengxin-xuanjian']?.learned?RESOURCE_DEFINITIONS['chengxin-xuanjian'].conversion:null;
  let captureBudget=conversionPolicy&&a.state.huaJin?.current===0?a.state.huaJin.acceptNext??0:0;
  if(hasReactiveDamage&&a.state.huaJin)delete a.state.huaJin.acceptNext;
  const armor=equipment(a).armor, weapon=equipment(a).weapon;
  const protection=bypass.protection??(bypass.protection={
    absorb:(a.buffs.zheng?auto(a,'智力'):0)+(a.state.wizard?.form==='earth'?3:0)+resourceBonus(a.state,'absorb',segments.length===1?{kind:segments[0].kind,damageType:segments[0].damageType}:{}),dr:(armor.dr??0)+resourceBonus(a.state,'dr'),
    energy:Math.max(armor.energyAbsorb??0,a.buffs.block?(weapon.energyAbsorb??0):0),
    resistanceSpent:0,
  });
  const magicTotal=segments.filter(s=>s.magical&&!s.unavoidable).reduce((n,s)=>n+s.amount,0);
  let waterReduction=a.state.timedEffects?.wizardDefend?.form==='water'?(magicTotal<=4?magicTotal:3):0;
  let hardness=(armor.hardness??0)+resourceBonus(a.state,'hardness');
  const initialProtection=structuredClone(protection),initialHardness=hardness,spentByType={};
  const prepare=(parts,{additional=false}={})=>{const prepared=[];
  for (const segment of parts) {
    if (!segment.amount) continue;
    if(segment.unavoidable){prepared.push({...segment});continue;}
    if(!segment.magical&&resourceCapability(a.state,'nonmagicalDamageImmunity'))continue;
    if(a.material==='antiMagicRock'&&(segment.kind==='energy'||segment.magical)){
      if(!['D','C','B','A','S'].includes(segment.grade))throw new RuleInputError('厌魔石打击须有实际等级','damage.grade');
      if(segment.grade!=='S'&&!segment.exceptionSource)continue;
    }
    if(a.state.wizard?.form==='fire'&&segment.energyType==='fire'||a.state.wizard?.form==='wind'&&segment.energyType==='fall')continue;
    const type=damageTypeKey(segment),spent=spentByType[type]??(spentByType[type]={});
    const budget=additional?{...initialProtection,absorb:Math.max(0,initialProtection.absorb-(spent.absorb??0)),dr:Math.max(0,initialProtection.dr-(spent.dr??0)),energy:Math.max(0,initialProtection.energy-(spent.energy??0)),resistanceSpent:spent.resistance??0}:protection;
    let amount=segment.amount;
    if(segment.magical){
      const magicAmount=segments.filter(x=>x.magical&&damageTypeKey(x)===type).reduce((n,x)=>n+x.amount,0)+parts.filter(x=>x.magical&&damageTypeKey(x)===type).reduce((n,x)=>n+x.amount,0);
      const available=additional?(a.state.timedEffects?.wizardDefend?.form==='water'?Math.max(0,(magicAmount<=4?magicAmount:3)-(spent.water??0)):0):waterReduction;
      const n=Math.min(available,amount);amount-=n;spent.water=(spent.water??0)+n;if(!additional)waterReduction-=n;
    }
    const stopped=['mental','poison'].includes(segment.energyType)?0:Math.min(additional?Math.max(0,initialHardness-(spent.hardness??0)):hardness,amount);
    amount-=stopped;spent.hardness=(spent.hardness??0)+stopped;if(!additional)hardness-=stopped;
    const resistanceRows=resourceEffects(a.state,'energyResistance',{energyType:segment.energyType,kind:segment.kind}).map(e=>({...e,group:'energyResistance'}));
    const armorResistance=armor.energyTypes&&!armor.energyTypes.includes(segment.energyType)?0:armor.energyResistance??0;
    const resistanceMaximum=armorResistance+stackEffects(resistanceRows,{energyResistance:armorResistance}).value;
    budget.resistance=Math.max(0,resistanceMaximum-(budget.resistanceSpent??0));
    for(const key of ['absorb',...(segment.kind==='physical'?['dr']:['energy','resistance'])]) {
      if(key==='dr'&&(segment.ignoreDR===true||segment.tags?.includes(armor.drBypass))) continue;
      const ignored=Math.min(budget[key],additional?0:bypass.defenses??0);if(!additional)bypass.defenses=Math.max(0,(bypass.defenses??0)-ignored);
      budget[key]-=ignored;
      const consumed=Math.min(amount,budget[key]);amount-=consumed;budget[key]-=consumed;spent[key]=(spent[key]??0)+ignored+consumed;
      if(key==='resistance')budget.resistanceSpent=(budget.resistanceSpent??0)+ignored+consumed;
    }
    if(amount)prepared.push({...segment,amount});
  }
  return prepared;};
  const prepared=prepare(segments);
  // Defenses are resolved before temporary HP. A single mixed event absorbs
  // A before L before B; preserve normal reporting order when no pool applies.
  if((a.state.health.temp??0)>0)prepared.sort((a,b)=>['B','L','A'].indexOf(b.severity)-['B','L','A'].indexOf(a.severity));
  const settling=[];
  for(const segment of prepared){
    const amount=segment.amount;
    if(conversion&&!segment.unavoidable) {a.used.damageConversion=true;a.reactions.damageConversion=false;}
    const bypassed=conversion&&!segment.unavoidable?Math.min(amount,bypass.conversion):0;
    bypass.conversion-=bypassed;
    for(const piece of [{amount:bypassed,convert:false},{amount:amount-bypassed,convert:conversion&&!segment.unavoidable}]) {
      if(!piece.amount)continue;
      const downgrade=segment.unavoidable?0:(piece.convert?1:0)+(bypass.wizardBulletproof&&segment.kind==='physical'?1:0);
      let damage={...segment,amount:piece.amount};
      if(captureBudget>0&&!segment.unavoidable){const captured=convertIncomingDamage(a.state,damage,conversionPolicy,captureBudget);damage=captured.damage;captureBudget-=captured.converted;(result.conversions??=[]).push({targetId:a.id,counter:conversionPolicy.counter,amount:captured.converted});}
      settling.push({damage,downgrade,input:piece.amount});
    }
  }
  const receipt={sourceActorId:event.sourceActorId??null,targetId:event.targetId??a.id,damageNature:event.damageNature??'unclassified',
    originalSegments:structuredClone(prepared),causedDamage:settling.some(x=>x.damage.amount>0&&!x.damage.unavoidable),
    converted:prepared.reduce((n,x)=>n+x.amount,0)-settling.reduce((n,x)=>n+x.damage.amount,0),temporaryAbsorbed:0,actualDamage:0,additionalActualDamage:0,additionalSources:[]};
  (result.damageEvents??=[]).push(receipt);
  if(receipt.causedDamage&&event.damageNature==='attack'&&event.root&&event.sourceActorId){
    const triggers=fireResourceTriggers(event.root,receipt.targetId,'attackDamageCaused',{context:{sourceActorId:event.sourceActorId,damageReceipt:receipt},drawDice:event.drawDice});
    if(triggers.length)(result.resourceTriggers??=[]).push(...triggers);
    const additions=triggers.filter(t=>t.additionalDamage?.length);
    if(additions.length>1){
      const ids=additions.map(t=>t.instanceId??JSON.stringify([t.sourceId,t.casterId])),order=event.additionalDamageOrder;
      if(!Array.isArray(order)||order.length!==ids.length||new Set(order).size!==ids.length||ids.some(id=>!order.includes(id)))throw new RuleInputError('须在攻击计划中选择实际追加伤害来源的顺序','additionalDamageOrder');
      additions.sort((a,b)=>order.indexOf(a.instanceId)-order.indexOf(b.instanceId));
    }
    for(const trigger of additions){
      const instance=trigger.instanceId??JSON.stringify([trigger.sourceId,trigger.casterId]);
      const fired=bypass.additionalSources??=[];
      if(fired.includes(instance))continue;fired.push(instance);
      receipt.additionalSources.push(instance);
      for(const declaration of trigger.additionalDamage??[]){
        const segments=sameTypeAdditionalSegments(receipt,declaration,event.additionalDamageTypeOrder);if(!segments.length)continue;
        (receipt.additionalAllocations??=[]).push(...segments.map(x=>({sourceInstance:instance,...x.allocation})));
        const adjusted=adjustIncomingDamage(a,segments,{...event,damageNature:'extra'});
        if(adjusted.receipts.length)(result.damageAdjustments??=[]).push(...adjusted.receipts);
        // Same-type defense amounts have already been consumed by prepare().
        for(const damage of prepare(adjusted.segments,{additional:true}))settling.push({damage,downgrade:0,input:damage.amount});
      }
    }
  }
  const decoyDamage=copyDecoyDamage(a.state,settling.map(x=>x.damage),{targetId:receipt.targetId,targetMode:event.targetMode,drawDice:event.drawDice});
  if(decoyDamage.length)(result.decoyDamage??=[]).push(...decoyDamage);
  if((a.state.health.temp??0)>0)settling.sort((a,b)=>['B','L','A'].indexOf(b.damage.severity)-['B','L','A'].indexOf(a.damage.severity));
  for(const {damage,downgrade,input}of settling){
    const wasDead=lifeStatus(a.state).state==='dead';
    const out=resolveDamage(a.state,damage,downgrade?[{kind:'downgrade',steps:downgrade}]:[],{drawDice:event.drawDice});
    a.state=out.state;syncActorWounds(a);recordLethalRestriction(a.state,damage,{wasDead,casterId:event.sourceActorId});
    const temporaryAbsorbed=out.result.trace.find(x=>x.step==='temporaryHP').absorbed;
    receipt.temporaryAbsorbed+=temporaryAbsorbed;
    if(out.result.temporaryHealthDepleted){const depletion={...out.result.temporaryHealthDepleted,targetId:receipt.targetId,sourceActorId:receipt.sourceActorId};(receipt.temporaryHealthDepleted??=[]).push(depletion);stampAutomaticResourceEvents(event.root,receipt.targetId);(result.temporaryHealthDepleted??=[]).push(depletion);}
    if(damage.additional)receipt.additionalActualDamage+=out.result.actualDamage;else{n+=out.result.actualDamage;receipt.actualDamage+=out.result.actualDamage;}
    if(!damage.unavoidable)reactiveLoss+=out.result.actualDamage;
    result.damage.push({targetId:a.id,kind:damage.kind,energyType:damage.energyType??null,input,inputSeverity:damage.severity,severity:out.result.finalSeverity,
      actualDamage:out.result.actualDamage,causedDamage:out.result.causedDamage,temporaryAbsorbed,
      ...(damage.additional?{additional:true,sourceId:damage.sourceId}:{}),...(out.result.wounds.changes.some(c=>c.woundSource)?{woundChanges:out.result.wounds.changes}:{}),...(damage.unavoidable?{unavoidable:true}:{})});
  }
  if((a.state.resourceConcentration?.length??0)>pendingStart){
    const pending=a.state.resourceConcentration,dc=pending.slice(pendingStart).reduce((a,b)=>a+b,0);
    pending.splice(pendingStart,pending.length-pendingStart,dc);
  }
  const flightLoss=syncAutonomousFlight(a);if(flightLoss)(result.motionEvents??=[]).push(structuredClone(flightLoss));
  if(event.root){
    const deaths=settleResourceDeaths(event.root);if(deaths.length)(result.deaths??=[]).push(...deaths);
    const options={drawDice:event.drawDice,combat:Number.isInteger(event.root.round)};
    if(event.deferReactions)bypass.pendingAutomatic={root:event.root,options};
    else{const automatic=flushAutomaticResourceEvents(event.root,options);if(automatic.length)(result.automaticEvents??=[]).push(...automatic);}
  }
  dispatchLifeLoss(a,reactiveLoss,result,bypass,{...event,additionalActualDamage:receipt.additionalActualDamage});
  return n;
}

function dispatchLifeLoss(a,n,result,bypass,event){
  const {root,sourceActorId,drawDice}=event,targetId=event.targetId??a.id;
  if(n>0&&event.deferReactions){
    const key=JSON.stringify([targetId,sourceActorId]),pending=(bypass.pendingLifeLoss??={});
    pending[key]??={a,n:0,event:{...event,deferReactions:false,additionalActualDamage:0}};pending[key].n+=n;pending[key].event.additionalActualDamage+=event.additionalActualDamage??0;return;
  }
  // Actual actor records denote creatures; actor-backed objects opt out.
  if(!(n>0&&root&&!bypass.emittedLifeLossTargets?.includes(targetId)&&Object.values(a.state.resourceTriggers??{}).some(t=>t.event==='afterLifeLoss')))return;
  const source=sourceActorId?root.actors[sourceActorId]:null,recipient=root.actors[targetId];
  if(!recipient||sourceActorId&&!source)throw new RuleInputError('实际伤害来源或受术者不在当前状态中','damage.source');
  let enemyCreatureSource=false;
  if(source&&sourceActorId!==targetId&&source.entityType!=='object'){
    const sourceTeam=source.team??root.ruleScene?.spatial?.actors?.[sourceActorId]?.team;
    const targetTeam=recipient.team??root.ruleScene?.spatial?.actors?.[targetId]?.team;
    enemyCreatureSource=sourceTeam&&targetTeam?sourceTeam!==targetTeam:null;
  }
  (bypass.emittedLifeLossTargets??=[]).push(targetId);
  (result.resourceTriggers??=[]).push(...fireResourceTriggers(root,targetId,'afterLifeLoss',{
    targetId:sourceActorId,context:{enemyCreatureSource,sourceActorId,actualDamage:n,damageNature:event.damageNature??'unclassified',
      allowsExtraDamage:['attack','rolled'].includes(event.damageNature)&&n-(event.additionalActualDamage??0)>0},drawDice}));
}
export function settleDamageReactions(result,bypass){
 const pending=bypass.pendingAutomatic;delete bypass.pendingAutomatic;
 if(pending){const automatic=flushAutomaticResourceEvents(pending.root,pending.options);if(automatic.length)(result.automaticEvents??=[]).push(...automatic);}
 const events=Object.values(bypass.pendingLifeLoss??{});delete bypass.pendingLifeLoss;
 for(const event of events)dispatchLifeLoss(event.a,event.n,result,bypass,event.event);
}

function conversionFor(a, amount) {
  if (amount>0 && a.reactions.damageConversion && !a.used.damageConversion) {
    return true;
  }
  return false;
}

function strike(b,a,t,c,result,drawDice,options={}) {
 const priorAttack=result.attack,priorReflection=result.reflected,priorGrapple=result.grappleTarget,position=[...a.position];
 performStrike(b,a,t,c,result,drawDice,options);
 if(!options.feature&&(result.attack!==priorAttack&&(result.attack?.roll||result.attack?.decoy?.redirected)||result.reflected!==priorReflection&&(result.reflected?.roll||result.reflected?.decoy?.redirected))){
  const observerId=result.grappleTarget!==priorGrapple?result.grappleTarget.actual:t.id;
  const clue=discloseAttackOrigin(b,observerId,a.id,{source:'js/attack/'+c.abilityId,position});
  if(clue)(result.locationDisclosures??=[]).push({observerId,...clue});
 }
}
function recordAttackUse(b,a,t,c,p,afterDefense,feature){
  if (p.legacyCompatible&&a.kind==='jiang'&&!feature) {
    if(a.ruleset==='opening-20261022') {
      delete a.combos[t.id];delete a.comboExpires?.[t.id];
      if(afterDefense>0&&!c.finisher){a.combos[t.id]=1;(a.comboExpires??={})[t.id]=b.round+1;}
    }
    else a.combos[t.id]=c.finisher?0:Math.min(5,(a.combos[t.id]??0)+1);
  }
  if (p.legacyCompatible&&a.kind==='huang' && a.buffs.drawnRound===b.round && !a.buffs.drawUsed && c.abilityId!=='conduct') {
    a.buffs.drawUsed=true; a.buffs.iaiPenalty=true;
  }
  if(c.empowered) a.buffs.fistQi=false;
  if(p.legacyCompatible&&a.kind==='yulin') a.attackedRound=b.round;
}
function performStrike(b,a,t,c,result,drawDice,{opportunity=false,freeResponse=false,actionAlreadyPaid=false,deferPlayerDefense=false,defenseDeclarations={},grappleDeclarations={},feature}={}) {
  requireThat(!a.state.underworld,'意识离体期间不能用肉身攻击');
  requireThat(t?.present&&(feature||c.rapidFire||c.rapidSecondary||!unconscious(t)),'目标不在场或已失去行动能力');
  if(!feature)validateAdditionalDamageOrder(t.state,a.id,c.additionalDamageOrder);
  const range=attackProfile(b,a.id,c).range;
  if(a.territory)requireThat(Math.hypot(t.position[0]-a.territory.center[0],t.position[1]-a.territory.center[1])<=a.territory.radius,'目标已在固定阵地圈外');
  requireThat(spatialDistance(b.map,a.position,t.position)<=range+1e-8,'目标不在攻击范围内');
  requireThat(clearLine(b.map,a.position,t.position),'攻击路线被实体障碍阻挡');
  requireThat(feature?.projection?projectionCanSense(b,a.id,feature.projection,'visual'):canObserve(b,t,a.id),'目标不在视线内；当前能力没有盲攻判定');
  requireThat(equipment(a).weapon.instanceId||wizardWeapon(a.state)||a.kind!=='huang'||!a.sheathed,'须先拔刀');
  requireThat(!a.state.grapple&&!a.claws?.includes(t.id),'擒抱中的攻击须使用擒抱内攻击动作');
  if(a.kind==='chuul') {
    requireThat(a.claws.some(x=>!x),'所有螯已被占用');
    if(!deferPlayerDefense&&t.state.size<=7)grappleChoice(t,grappleDeclarations[t.id]);
  }
  if(c.empowered) {
    requireThat(a.kind==='jiang'&&a.buffs.fistQi,'强化一击须先有拳气');
    pay(a,'气',2);
  }
  if(c.finisher) requireThat(a.kind==='jiang'&&(a.combos[t.id]??0)===(a.ruleset==='opening-20261022'?1:5),a.ruleset==='opening-20261022'?'D级终结需要该目标1层':'终结技需要该目标5层');
  const p=attackProfile(b,a.id,c);
  if(!feature&&additionalDamageCandidates(t.state,a.id).length&&(p.electric>0||a.state.wizard?.form==='fire'))validateDamageTypeOrder(['physical',a.state.wizard?.form==='fire'?'energy:fire':'energy:electric'],c.additionalDamageTypeOrder);
  if(!feature&&p.electric>0){const segment={amount:1,severity:'L',kind:'energy',energyType:'electric'};adjustIncomingDamage(t,p.aggravate>0||p.energyWeapon?[segment,{...segment,severity:'A'}]:[segment],{sourceActorId:a.id,damageNature:'attack'});}
  requireThat(p.legacyCompatible||['strike','destroy',undefined].includes(c.abilityId),'当前实际武器不满足这项原有专门攻击的类别');
  const ammo=wizardWeapon(a.state)?null:weaponAmmoState(a,equipment(a).weapon);
  if(['白刃','肉搏'].includes(equipment(a).weapon.skill??profile(a).main)&&a.state.huaJin)delete a.state.huaJin.nextAttack;
  const reflects=!feature&&t.state.timedEffects?.wizardDefend?.form==='wind'&&p.ranged&&!p.energyWeapon&&p.rawDP<12;
  requireThat(!t.spirit||p.spiritEligible,'当前武器没有攻击灵体的资格');
  requireThat(equipment(a).weapon.instanceId||equipment(a).weapon.resourceId||wizardWeapon(a.state)||!(a.kind==='bright'&&a.weaponMode==='empty'),'须先取出已持有的武器');
  if(p.cap===null) throw new RuleInputError('苍穹弓伤害上限需要武器力量要求',`${a.id}.bowStrength`);
  if(ammo){requireThat(ammo.loaded,'须先上箭');requireThat(ammo.available>=ammo.spec.cost,'没有可用箭矢');}
  if((opportunity||freeResponse)&&lifeStatus(a.state).state==='B-check'&&!a.preActionCleared){
    const dc=a.parameters?.preActionDC;if(!Number.isSafeInteger(dc))throw new RuleInputError('借机行动前须给力量检定DC',`${a.id}.preActionDC`);
    const pre=checkBeforeAction(a.state,{dc,dice:drawDice()});a.state=pre.state;result.preActionCheck=pre.result;if(!pre.result.allowed)return;a.preActionCleared=true;
  }
  if(freeResponse){const e=actionEligibility(a.state,'attack');requireThat(e.allowed&&!a.state.turn.reactionLock&&!a.state.turn.responseDebt,e.reason??'响应受锁定');statusActionPermission(a.state,c);}
  else if(!actionAlreadyPaid){if(opportunity) spend(b,a,c,'opportunity','attack'); else if(c.actionDiscount){
    requireThat(['白刃','射击','枪械','弓箭','投掷','肉搏'].includes(equipment(a).weapon.skill??profile(a).main),'减费攻击须实际已登记攻击类别');
    const price=quoteActionPrice(a.state,{sourceId:c.actionDiscount,action:ordinaryWeaponType(equipment(a).weapon)==='natural'?'naturalAttack':'weaponAttack',family:'physical',roundKey:combatRoundKey(b)});
    spend(b,a,c,'attack','attack',price);result.actionPrice=price;
   }else spend(b,a,c,'attack','attack');}
  if(opportunity||freeResponse)delete a.preActionCleared;
  if(ammo)consumeWeaponAmmo(a,equipment(a).weapon);
  if(!reflects&&b.playerDefenseDeclarations&&t.controller==='player'&&deferPlayerDefense&&!t.defenseIntent) {
    result.attack={...p,pendingDefense:true};return;
  }
  const members=feature?[]:grappleMembers(b,t.id,a.id);
  const linkedIds=members.filter(m=>m.id!==t.id).map(m=>m.id);
  let grappleDefense;
  if(linkedIds.length){

    if(members.some(m=>!m))throw new RuleInputError('擒抱人物缺少当前状态','grapple.members');
    if(deferPlayerDefense){result.attack={...p,pendingDefense:true};return;}
    const defenses=members.map(m=>resolveDefense(b,m.id,a.id,{...p,defenseMode:defenseDeclarations[m.id]}));
    requireThat(defenses.every(d=>!d.pending),'须先声明擒抱中可能受击者的防御');
    grappleDefense=defenses.reduce((low,d)=>d.total<low.total?d:low);
    const selected=weightedGrappleTarget(members,drawDice);t=selected.target;result.grappleTarget={declared:c.targetId,actual:t.id,defense:grappleDefense.total,candidates:members.map(m=>m.id),weights:selected.weights,ticket:selected.ticket,dice:selected.dice};
  }
  const targetMode=c.rapidFire||c.rapidSecondary||c.adjacentTargetIds?.length||c.rapidPenalty>0||c.abilityId==='gale'?'multiple':'single';
  const decoy=feature?null:redirectDecoyAttack(b,{attackerId:a.id,targetId:t.id,drawDice,targetMode});
  if(decoy?.redirected){
   result.attack={...p,amount:0,decoy};recordAttackUse(b,a,t,c,p,0,feature);
   (result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'attackResolved',{targetId:t.id,context:{melee:!p.ranged,skill:equipment(a).weapon.skill??profile(a).main,hit:false,actualDamage:0,causedDamage:false},drawDice}));return;
  }
  if(a.evilSpirit&&!feature) {
    const ward=triggerSpiritWard(t.state);t.state=ward.state;
    if(ward.result.protected){result.spiritWard={targetId:t.id,...ward.result};result.notes.push('恶灵提示符燃烧保护，恶灵这次攻击不能伤害持有者。');return;}
  }
  const d=grappleDefense??(feature||reflects?{total:0,parts:{},remainingAP:p.ap,extraSuccesses:0}:resolveDefense(b,t.id,a.id,{...p,contact:c.abilityId==='conduct',defenseMode:defenseDeclarations[t.id]}));
  requireThat(!d.pending,'须先由玩家声明本次防御方式，再计算防御');
  if(!feature&&t.kind==='radwick')delete t.buffs.brace;
  if(!feature)(result.responses??=[]).push({targetId:t.id,guarded:d.guarded});
  if(!feature&&t.state.timedEffects?.wizardDefend?.form==='wind'){
    if(p.ranged&&!p.energyWeapon){
      if(p.rawDP<12){
        const reflectedDecoy=redirectDecoyAttack(b,{attackerId:t.id,targetId:a.id,drawDice,targetMode});
        if(reflectedDecoy?.redirected){
         result.reflected={targetId:a.id,decoy:reflectedDecoy,amount:0};recordAttackUse(b,a,t,c,p,0,feature);
         (result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'attackResolved',{targetId:t.id,context:{melee:false,skill:equipment(a).weapon.skill??profile(a).main,hit:false,actualDamage:0,causedDamage:false},drawDice}));return;
        }
        const defense=resolveDefense(b,a.id,t.id,{...p,defenseMode:defenseDeclarations[a.id]});
        if(defense.pending){if(deferPlayerDefense){result.attack={...p,pendingDefense:true};return;}throw new RuleInputError('须先选择反弹攻击的防御','reflection.defense');}
        if(a.willDefenseReady&&!deferPlayerDefense){changeWill(a.state,-1);delete a.willDefenseReady;}
        const roll=rollCombatPool(p.rawDP-defense.total,drawDice(),p.explode),amount=Math.min(p.cap,Math.max(0,roll.rolledSuccesses+p.fixed-defense.extraSuccesses));
        const severity=wizardWeapon(a.state)?'L':p.severity;damageEvent(a,a.state.wizard?.form==='fire'?wizardFireSegments(amount,severity):[{amount,severity,kind:'physical',magical:p.magical}],conversionFor(a,amount),result);result.reflected={targetId:a.id,roll,amount};return;
      }p.rawDP-=6;
    }else if(!p.ranged)p.rawDP-=4;
  }
  const actualDefense=grappleDefense?resolveDefense(b,t.id,a.id,{...p,defenseMode:defenseDeclarations[t.id]}):d;
  const wizardArmor=!feature&&!!t.state.wizard?.form&&(actualDefense.parts.armor??0)>0;
  if(!deferPlayerDefense){
    // Every member used in the lowest-defense calculation participates in this attack.
    for(const defender of grappleDefense?members:[t])if(defender.willDefenseReady){changeWill(defender.state,-1);delete defender.willDefenseReady;(result.willCosts??=[]).push({actorId:defender.id,cost:1,kind:'defense'});}
  }
  if(!feature&&a.state.wizard?.form==='water'){t.state.timedEffects??={};t.state.timedEffects.wizardWaterPenalty={points:(t.state.timedEffects.wizardWaterPenalty?.points??0)+2,remainingMinutes:.2,remainingTurns:2,clockActorId:a.id,source:'Wizard Water Style'};}
  const roll=rollCombatPool(p.rawDP-d.total,drawDice(),p.explode);
  const afterDefense=Math.max(0,roll.rolledSuccesses+p.fixed-d.extraSuccesses);
  const extra=roll.rolledSuccesses>0&&afterDefense>0?p.extra:0;
  const amount=Math.min(p.cap,afterDefense+extra);
  result.attack={...p,defense:d,roll,extra,amount,...(decoy?{decoy}:{})};
  recordAttackUse(b,a,t,c,p,afterDefense,feature);
  if(feature?.projection){
    result.projectionInteraction=interactProjection(b,a.id,feature.projection,{kind:'attack',damage:amount,melee:!p.ranged,source:'js/weapon-attack-projection',witnesses:projectionWitnesses(b,a.id)});
    result.terrain={featureId:feature.id,label:feature.label,kind:'projection-interaction',physicalDamage:0,apparentImpact:amount};
    (result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'attackResolved',{targetId:feature.id,context:{melee:!p.ranged,skill:equipment(a).weapon.skill??profile(a).main,hit:false,actualDamage:0,causedDamage:false},drawDice}));return;
  }
  if(feature) {
    // Use the same normal weapon roll, cap, ammo and attack action. Structural
    // damage cannot inflict living-target ailments or pass through to a second target.
    const hardness=Math.max(0,feature.durability.hardness-(p.hardnessIgnore??p.ignore)),before=feature.durability.current;
    if(feature.material==='antiMagicRock'&&(p.magical||p.energyWeapon)&&!p.grade)throw new RuleInputError('厌魔石须确认打击等级','attack.grade');
    const mineralImmune=feature.material==='antiMagicRock'&&(p.magical||p.energyWeapon)&&['D','C','B','A'].includes(p.grade)&&!feature.energyException?.source;
    const structuralDamage=mineralImmune?0:Math.min(before,Math.max(0,amount-hardness));
    feature.durability.current-=structuralDamage;
    if(feature.durability.current===0)feature.destroyed=true;
    result.terrain={featureId:feature.id,label:feature.label,kind:'damage',structuralDamage,
      destroyed:feature.destroyed===true,outcome:feature.destroyed?'障碍所标记的这一段已被破坏，通路打开':structuralDamage?(feature.kind==='door'&&feature.open?'打开的门扇受损，通路仍然开放':'障碍受损，仍然阻挡通行'):'这一击未能破坏障碍'};
    return;
  }
  if(t.state.timedEffects?.wizardDefend?.form==='fire'&&!p.ranged)a.state.statuses.push({type:'燃烧',source:'Defend火',points:2,fireKind:'magic',remainingMinutes:t.state.timedEffects.wizardDefend.remainingMinutes,remainingTurns:t.state.timedEffects.wizardDefend.remainingTurns,clockActorId:t.state.timedEffects.wizardDefend.clockActorId,...(t.parameters?.fireTickBoundary?{tickBoundary:t.parameters.fireTickBoundary}:{})});
  counteractTemperature(a.state);
  if(!amount){(result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'attackResolved',{targetId:t.id,context:{melee:!p.ranged,skill:equipment(a).weapon.skill??profile(a).main,hit:false,actualDamage:0,causedDamage:false},drawDice}));return;}
  if(!p.ranged)(result.resourceTriggers??=[]).push(...fireResourceTriggers(b,t.id,'incomingHit',{targetId:a.id,context:{melee:true},drawDice}));
  if(a.kind==='chuul'&&c.abilityId!=='doubleStrike'&&!unconscious(t))
    (result.grapples??=[]).push(attachClaw(b,a,t,{drawDice,defense:grappleDeclarations[t.id]}));
  if(range<=a.reach)delete t.calibration;
  if(a.kind!=='bright') delete t.aim;
  if(c.abilityId==='conduct') {
    if(wizardArmor){result.notes.push('防能量武器装甲阻止御雷导电');return;}
    result.statuses.push({targetId:t.id,...inflictStatus(t,'麻痹',c.tier*4,'御雷·导电',drawDice)}); return;
  }
  let aggravated=Math.min(amount,p.aggravate);
  if(p.energyWeapon&&!wizardArmor)aggravated=Math.max(aggravated,Math.min(amount,Math.floor(p.weapon/2)));
  if(p.legacyCompatible&&a.kind==='jiang'&&a.ruleset!=='opening-20261022' && !d.parts.armor) aggravated=Math.min(amount,Math.floor(p.weapon/2),5);
  const electric=a.ruleset==='opening-20261022'?Math.min(amount,p.electric):Math.floor(amount*p.electric);
  // Allocate the worsened points to the electrical part first. No duplicate damage:
  // total segment amounts must equal the capped attack successes.
  const ea=Math.min(electric,aggravated), pa=aggravated-ea;
  const converted=conversionFor(t,amount);
  const bypass={conversion:p.legacyCompatible&&a.kind==='jiang'&&a.ruleset!=='opening-20261022'?4:0,defenses:p.ignore,wizardBulletproof:wizardArmor&&p.ballistic};
  const before=result.damage.length,receiptStart=result.damageEvents?.length??0;
  const severity=wizardWeapon(a.state)?'L':p.severity;
  const segments=a.state.wizard?.form==='fire'?wizardFireSegments(amount,severity):[
    {amount:ea,severity:'A',kind:'energy',energyType:'electric'},
    {amount:pa,severity:'A',kind:'physical'},
    {amount:electric-ea,severity:'L',kind:'energy',energyType:'electric'},
    {amount:amount-electric-pa,severity,kind:'physical'},
  ];
  const inflicted=damageEvent(t,segments.map(s=>({...s,tags:equipment(a).weapon.tags,magical:s.magical??p.magical})),converted,result,bypass,{root:b,sourceActorId:a.id,targetId:t.id,drawDice,additionalDamageOrder:c.additionalDamageOrder,additionalDamageTypeOrder:c.additionalDamageTypeOrder,deferReactions:true,targetMode,damageNature:'attack',ranged:p.ranged});
  if(c.abilityId==='thunder') {
    const actualElectric=result.damage.slice(before).filter(x=>x.energyType==='electric').reduce((n,x)=>n+x.actualDamage,0);
    if(actualElectric) result.statuses.push({targetId:t.id,...inflictStatus(t,'麻痹',actualElectric,'雷鸣剑',drawDice)});
  }
  if(p.legacyCompatible&&a.kind==='jiang'&&a.ruleset!=='opening-20261022'&&inflicted>0) {
    // 龙象 is part of this attack for the once-per-attack 901 conversion.
    damageEvent(t,[{amount:2,severity:'L',kind:'physical'}],converted,result,bypass,{root:b,sourceActorId:a.id,targetId:t.id,drawDice,additionalDamageOrder:c.additionalDamageOrder,additionalDamageTypeOrder:c.additionalDamageTypeOrder,deferReactions:true,targetMode,damageNature:'attack',ranged:p.ranged});
    result.statuses.push({targetId:t.id,...inflictStatus(t,'晕眩',4,'龙象·沉劲震体',drawDice)});
  }
  const causedDamage=(result.damageEvents??[]).slice(receiptStart).some(e=>e.causedDamage&&e.sourceActorId===a.id&&e.targetId===t.id);
  withAutomaticBatch(b,()=>{(result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'attackResolved',{targetId:t.id,context:{melee:!p.ranged,skill:equipment(a).weapon.skill??profile(a).main,hit:true,actualDamage:inflicted,causedDamage},drawDice}));});
  settleDamageReactions(result,bypass);
  if(inflicted>0)(result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'hit',{targetId:t.id,context:{melee:!p.ranged,skill:equipment(a).weapon.skill??profile(a).main,actualDamage:inflicted},drawDice}));
  if(c.abilityId==='lightning'&&c.tier===3&&inflicted>0) {
    for(const other of Object.values(b.actors)) if(other.present&&other.id!==t.id&&spatialDistance(b.map,other.position,t.position)<=1.5&&clearLine(b.map,t.position,other.position)) {
      const save=saveRoll(other,'reflex',drawDice,{areaAttack:true,recognizable:other.kind==='huang'&&spatialDistance(b.map,other.position,a.position)<=30,cover:terrainCover(b.map,t.position,other.position)});
      result.saves.push({targetId:other.id,...save});
      const n=Math.max(0,8-save.total);
      damageEvent(other,[{amount:n,severity:'L',kind:'energy',energyType:'electric'}],conversionFor(other,n),result,{conversion:0},{root:b,sourceActorId:a.id,targetId:other.id,drawDice,targetMode:'area'});
    }
  }
}

function finishIfNeeded(b) {
  if(b.status==='finished')return;
  if(b.arena) {
    const stopped=Object.values(b.actors).filter(a=>a.present&&(unconscious(a)||a.state.health.intact<=b.arena.stopIntact));
    if(stopped.length) {
      const remaining=Object.values(b.actors).filter(a=>a.present&&!stopped.includes(a));
      b.status='finished';b.winner=remaining.length===1?remaining[0].team:'平局';
      b.resolution={kind:'refereeStop',taskComplete:false,xpAwarded:0,stoppedActorIds:stopped.map(a=>a.id),text:'按本场预告的终止条件，练习结束；现有伤势与资源保留。'};return;
    }
  }
  if(objectiveSatisfied(b)){b.status='finished';b.winner=b.objective.label;b.resolution={kind:b.objective.resolutionKind??'objective',taskComplete:false,xpAwarded:0,text:b.objective.description};return;}
  const teams=new Set(Object.values(b.actors).filter(a=>a.present&&!unconscious(a)).map(a=>a.team));
  if(teams.size<=1) { b.status='finished'; b.winner=[...teams][0]??'平局'; }
}

function advance(b,result,choices={},drawDice=randomDice) {
  endResourceChannelTurn(b.actors[b.activeId].state,b.round);
  const bleeding=b.actors[b.activeId];
  periodicStatusDamage(bleeding,'流血','turn',(amount,source)=>damageEvent(bleeding,[{amount,severity:'L',kind:'physical'}],false,result,{conversion:0},{root:b,targetId:bleeding.id,sourceActorId:source.sourceActorId??null,drawDice,damageNature:'fixed'}),{root:b,combat:true});
  const old=b.actors[b.activeId];if(old.state.huaJin)delete old.state.huaJin.nextAttack;const genetic=advanceGeneticLock(old.state,{drawDice});old.state=genetic.state;if(genetic.result)result.genetic=genetic.result;burningDamage(old,'turn',(amount,source)=>damageEvent(old,[{amount,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},{root:b,targetId:old.id,sourceActorId:source.sourceActorId??null,drawDice,damageNature:'fixed'}),{root:b,combat:true});old.state=endTurn(old.state).state;
  for(const s of old.state.statuses.filter(s=>s.roundResistance==='chuul')) {
    const key=value(old,'力量')<=value(old,'意志')?'力量':'意志',res=check(old.state,{attribute:key,skill:'求生',dice:drawDice()});
    s.points=Math.max(0,s.points-res.total);result.saves.push({targetId:old.id,status:s.type,...res});
  }
  old.state.statuses=old.state.statuses.filter(s=>s.points>0);
  if(old.ruleset==='opening-20261022')for(const [target,expiry]of Object.entries(old.comboExpires??{}))
    if(expiry<=b.round){delete old.combos[target];delete old.comboExpires[target];}
  b.turnTaken??=[]; if(!b.turnTaken.includes(old.id)) b.turnTaken.push(old.id);
  const oldIndex=b.order.indexOf(old.id);
  if(old.buffs.timeHaste&&oldIndex>0&&!b.actors[b.order[oldIndex-1]].buffs.timeHaste) {
    const previous=b.actors[b.order[oldIndex-1]];
    b.order.splice(oldIndex,1);b.order.splice(oldIndex-1,0,old.id);
    setCurrentInitiative(old,initiative(b,previous)+1);
  }
  const reordered=settleInitiativeChanges(b,old.id,{initiative:currentInitiative,tiePriority:a=>Number(!!resourceCapability(a.state,'initiativeTiePriority'))});
  if(reordered.changes.length)(result.initiativeChanges??=[]).push(reordered);
  if(!b.order.some(id=>!b.turnTaken.includes(id)&&b.actors[id].present&&!unconscious(b.actors[id]))) {
      b.round++; b.elapsedRounds++;
      if(b.map)b.map.features=b.map.features.filter(f=>!f.expiresRound||f.expiresRound>b.round);
      (result.sceneChanges??=[]).push(...advanceSceneTime(b.ruleScene,.1));
      b.turnTaken=[];
      for(const a of Object.values(b.actors)) if(a.kind==='jiang'&&!unconscious(a)) {
        const healed=heal(a,['L','B']); if(healed) result.healing.push({actorId:a.id,severity:healed});
      }
      advanceActorsTime(b.actors,.1,(result.timeChanges??=[]),{combatTick:true,drawDice,root:b});
      for(const a of Object.values(b.actors))accrueRoundCosts(a.state,{root:b,combat:true});
      for(const a of Object.values(b.actors)) {
        a.state.statuses=a.state.statuses.filter(s=>!s.expiresRound||s.expiresRound>b.round);
        if(a.underground&&a.underground.expiresRound<=b.round) {
          if(!(b.map?.features??[]).some(f=>!f.destroyed&&f.earthExit&&contains(a.position,f)))throw new RuleInputError('土遁期限已到，当前位置缺少可用出口；须处理实际出口',`${a.id}.earthExit`);
          a.underground.mustEmerge=true;result.notes.push(`${a.name}土遁期限到，下次必须标准动作出土。`);
        }
        if(a.present&&lifeStatus(a.state).deteriorating) {
          if(a.state.health.B&&a.state.health.L&&!choices[a.id])throw new RuleInputError('本轮恶化须主持指定将B或L转为A',`deteriorationChoices.${a.id}`);
          syncActorWounds(a);const deterioration=advanceDeterioration(a.state,{from:choices[a.id],drawDice});a.state=deterioration.state;syncActorWounds(a);
          (result.deterioration??=[]).push({actorId:a.id,...deterioration.result});
        }
        if(a.kind==='yulin'&&a.ruleset!=='opening-20261022') a.buffs.bixie=a.attackedRound===b.round-1?Math.min(attackSkill(a).level,(a.buffs.bixie??0)+1):0;
        for(const key of ['tengzhuan','flow']) if(a.expires?.[key]<=b.round) {delete a.buffs[key];delete a.expires[key];}
      }
      if(b.actors.lotus?.present) {
        b.summonRounds++;
        if(b.summonRounds%10===0) {
          const owner=b.actors[b.actors.lotus.ownerId], cost=++b.summonMinutes;
          if(owner.state.resources.灵力.current>=cost) pay(owner,'灵力',cost);
          else { b.actors.lotus.present=false; result.notes.push('灵力不足维持，乱红莲回剑。'); }
        }
      }
  }
  const nextOrder=[...new Set([...(reordered.nextIds??[]),...b.order])];
  for(const id of nextOrder) {
    const a=b.actors[id];
    if(b.turnTaken.includes(id)||!a.present||unconscious(a)) continue;
    b.activeId=a.id;
    (result.resourceTriggers??=[]).push(...fireResourceTriggers(b,a.id,'turnStart',{drawDice}));
    for(const other of Object.values(b.actors)){for(const [key,e]of Object.entries(other.state.timedEffects??{}))if(e.clockActorId===a.id){e.remainingTurns=Math.max(0,e.remainingTurns-1);e.remainingMinutes=e.remainingTurns/10;if(!e.remainingTurns)delete other.state.timedEffects[key];}for(const e of other.state.statuses)if(e.clockActorId===a.id){e.remainingTurns=Math.max(0,e.remainingTurns-1);e.remainingMinutes=e.remainingTurns/10;}other.state.statuses=other.state.statuses.filter(e=>e.remainingMinutes!==0);}
    if(b.map)b.map.features=b.map.features.filter(f=>!f.wizardOwner||b.actors[f.wizardOwner]?.state.timedEffects?.wizardDefend?.form==='earth');
    delete a.buffs.block; delete a.buffs.zheng; delete a.buffs.iaiPenalty;
    delete a.defenseIntent;delete a.rapidAdjacentHits;
    if(a.aim?.pendingRound<b.round) {a.aim.rounds=Math.min(3,(a.aim.rounds??0)+1);delete a.aim.pendingRound;}
    if(a.calibration) {
      if(a.calibration.ready||!canObserve(b,b.actors[a.calibration.targetId],a.id))delete a.calibration;
      else a.calibration.ready=true;
    }
    a.state=beginTurn(a.state).state;
    return;
  }
  finishIfNeeded(b);
  if(b.status!=='finished') { b.status='paused'; result.notes.push('无可行动单位，需要处理异常状态。'); }
}

export function opportunityActors(b,c) {
  if(c.abilityId!=='move'||!Array.isArray(c.to))return [];
  const a=b.actors[c.actorId];
  const threatens=(foe,p)=>Math.min(Math.abs(p[0]-foe.position[0]),Math.abs(p[1]-foe.position[1]))<1e-8&&
    spatialDistance(b.map,foe.position,p)<=Math.min(foe.reach,b.map?.gridSize??1.5)+1e-8;
  return Object.values(b.actors).filter(foe=>foe.present&&foe.team!==a.team&&canObserve(b,a,foe.id)&&!unconscious(foe)&&!foe.state.sleeping&&!foe.state.underworld&&!frozen(foe)&&
    (waterResponse(foe)?waterCrossing(b,foe,c)!==null&&!foe.state.turn.reactionLock&&!foe.state.turn.responseDebt:
    !foe.state.turn.opportunityUsed&&!foe.sheathed&&threatens(foe,a.position)&&[...(c.via??[]),c.to].some(p=>!threatens(foe,p))&&clearLine(b.map,foe.position,a.position)));
}
const waterResponse=a=>a.state.wizard?.form==='water'&&wizardWeapon(a.state)&&a.state.wizard.weaponMode==='gun';
function waterCrossing(b,foe,c){
 if(c.trajectory){const center=[...foe.position.slice(0,2),elevationAt(b.map,foe.position)],radius=(foe.reach??1.5)+(b.map?.gridSize??1.5);return ballisticSphereCrossings(c.trajectory,c.trajectory.seconds,center,radius).find(hit=>clearLine(b.map,foe.position,hit.point))?.point??null;}
 const raw=[b.actors[c.actorId].position,...(c.via??[]),c.to],airborne=raw.some(p=>p.length===3)||foe.position.length===3;
 const path=raw.map(p=>[...p.slice(0,2),elevationAt(b.map,p)]),center=[...foe.position.slice(0,2),elevationAt(b.map,foe.position)];
 const radius=(foe.reach??1.5)+(b.map?.gridSize??1.5);
 for(let i=1;i<path.length;i++){
  const p=path[i-1],q=path[i],v=q.map((n,k)=>n-p[k]),u=p.map((n,k)=>n-center[k]),A=v.reduce((n,x)=>n+x*x,0);if(!A)continue;
  const B=2*u.reduce((n,x,k)=>n+x*v[k],0),C=u.reduce((n,x)=>n+x*x,0)-radius**2,D=B*B-4*A*C;
  if(D<=0)continue;
  for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)].sort((a,b)=>a-b))if(t>=0&&t<=1){const at=p.map((n,k)=>n+t*v[k]);if(clearLine(b.map,foe.position,at))return airborne?at:at.slice(0,2);}
 }
 return null;
}

// Use the same affected set for actual damage, previews and reaction windows.
export function rapidFireTargets(b,c){
 const a=b.actors[c.actorId],t=b.actors[c.targetId];if(!t)return [];
 return Object.values(b.actors).filter(x=>x.present&&x.id!==t.id&&x.id!==a.id&&!a.rapidAdjacentHits?.includes(x.id)&&spatialDistance(b.map,t.position,x.position)<=1.5&&spatialDistance(b.map,a.position,x.position)<=100&&clearLine(b.map,a.position,x.position)&&canObserve(b,x,a.id));
}
export function galeTargets(b,c) {
  const a=b.actors[c.actorId];
  return Object.values(b.actors).filter(x=>x.present&&x.id!==a.id&&x.team!==a.team&&!unconscious(x)&&
    spatialDistance(b.map,a.position,x.position)<=20&&canObserve(b,x,a.id)&&clearLine(b.map,a.position,x.position));
}

// Sight-only cover does not stop the roar's area effect; solid terrain does.
export function roarTargets(b,c) {
  const a=b.actors[c.actorId],t=b.actors[c.targetId];
  if(!a?.present||!t?.present)return [];
  const len=spatialDistance(b.map,a.position,t.position);if(!len)return [];
  const vx=(t.position[0]-a.position[0])/len,vy=(t.position[1]-a.position[1])/len,vz=(elevationAt(b.map,t.position)-elevationAt(b.map,a.position))/len;
  return Object.values(b.actors).filter(other=>{
    if(!other.present||other.id===a.id)return false;
    const dx=other.position[0]-a.position[0],dy=other.position[1]-a.position[1],dz=elevationAt(b.map,other.position)-elevationAt(b.map,a.position);
    const along=dx*vx+dy*vy+dz*vz,across=Math.sqrt(Math.max(0,dx*dx+dy*dy+dz*dz-along*along));
    return along>=0&&along<=100&&across<=1&&clearLine(b.map,a.position,other.position);
  });
}

function summonPosition(b,a,to) {
  if(to!==undefined)requireThat(Array.isArray(to)&&to.length===2&&to.every(Number.isFinite)&&
    spatialDistance(b.map,a.position,to)>0&&spatialDistance(b.map,a.position,to)<=1.5+1e-8,'召唤落点须为相邻1.5米内的有效坐标');
  // Preserve the old default in open terrain; blocked defaults try the other
  // adjacent directions. An explicitly declared point is never substituted.
  const directions=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,-1],[-1,1]];
  const candidates=to===undefined?directions.map(v=>a.position.map((n,i)=>n+v[i]*1.5/Math.hypot(...v))):[to];
  const position=candidates.find(p=>measurePath(b.map,a.position,p).valid&&!blocking(b.map).some(f=>contains(p,f)));
  requireThat(position,'没有可用的相邻召唤落点；须避开实体障碍和封闭边界');
  return [...position];
}

export function act(input,command,{drawDice=randomDice,playerAuthorized=false,deferPlayerDefense=false,defenseDeclarations={},grappleDeclarations={},opportunityDeclarations={},willDefenses={},deferMovementReactions=false}={}) {
  const b=clone(input), c=clone(command), a=b.actors[c.actorId], id=c.abilityId;
  if(id==='resumeEffects'){
    requireThat(a&&Object.keys(c).every(k=>['actorId','abilityId'].includes(k)),'自动效果续算只选实际记录，不接受新目标或数值');
    const result={actorId:a.id,abilityId:id,damage:[],notes:[],automaticEvents:flushAutomaticResourceEvents(b,{drawDice,combat:true})};
    finishIfNeeded(b);return {battle:b,result};
  }
  requireThat(!Object.values(b.actors).some(a=>a.state.resourceAutomaticEvents?.length),'须先续算已锁定自动效果');
  const pendingConcentration=settleResourceConcentration(b,b,drawDice);
  if(b.map)b.map.ruleBarriers=sceneBarriers(b.ruleScene);
  refreshResourceAuras(b,{combat:true});
  for(const actor of Object.values(b.actors)) refreshDerived(actor);
  requireThat(!b.pending,'须先处理待定反应');
  requireThat(b.status==='active','战斗已结束或暂停');
  requireThat(a?.present,'参战者不存在');
  requireThat(a.controller!=='player'||playerAuthorized,'玩家角色须由玩家明确选择动作');
  requireThat(a.abilities.includes(id)||BASIC_ACTIONS[id]||id==='reload'&&weaponAmmoSpec(a,equipment(a).weapon)||['firstAid','escapeGrip','pressGrip','grappleAttack','ringStore','ringRetrieve','mechanism','statusEvent','wake','jump','continueJump','search'].includes(id)||id==='medicine'&&a.state.inventory||id==='door'||id==='destroy'&&a.abilities.includes('strike'),'该参战者没有此能力');
  const commandKeys=id==='medicine'?['actorId','abilityId','medicine','resource','choice','statusIndex']:['door','destroy'].includes(id)?['actorId','abilityId','featureId',...(id==='door'?['open']:[])]:['actorId','abilityId','targetId','tier','empowered','finisher','strength','payment','to','via','enabled','resource'];
  commandKeys.push('preActionDC','deteriorationChoices',...(id==='readyWeapon'?['weapon']:[]),...(id==='doubleStrike'?['secondTargetId']:[]),...(id==='morph'?['form']:[]),...(id==='releaseGrip'?['claw']:[]),...(id==='escapeGrip'?['method']:[]),...(['move','step'].includes(id)?['run','climb','movementSource','flightEnd','motionObjectId','motionPart']:[]));
  if(['ringStore','ringRetrieve'].includes(id))commandKeys.push('itemId');
  if(id==='mechanism')commandKeys.push('objectId','operation','part');
  if(id==='jump')commandKeys.push('objectId','part');
  if(['jump','continueJump'].includes(id))requireThat(Object.keys(c).every(k=>['actorId','abilityId','preActionDC','actionDiscount',...(id==='jump'?['objectId','part','willpower']:[])].includes(k)),'跳跃只能选择实际计划或续接，不能提交数值和轨迹');
  if(Object.hasOwn(PHYSICAL_ACTIONS,id))commandKeys.push('actionDiscount');
  commandKeys.push('additionalDamageOrder','additionalDamageTypeOrder');
  commandKeys.push('limbIds','willpower',...(id==='strike'?['adjacentTargetIds','rapidFire']:[]),...(id==='move'?['block','hide']:[]));if(id==='statusEvent')commandKeys.push('eventId');
  requireThat(Object.keys(c).every(k=>commandKeys.includes(k)),'请求只能选择能力、目标与合法选项，不能给出骰值或结算数值');
  if(id==='destroy'){const projection=projectionFeature(b,c.featureId)?.projection;if(projection)inspectProjectionAttack(projection);}
  if(c.hide!==undefined)requireThat(id==='move'&&typeof c.hide==='boolean','重新躲藏只能结合实际移动选择');
  if(id==='statusEvent'&&(['demonGaze','geneticBacklash','passivePerception'].includes(b.ruleScene?.events?.[c.eventId]?.type)||b.ruleScene?.events?.[c.eventId]?.type==='projectionEvent'&&b.ruleScene.events[c.eventId].mode!=='active')){
    const result={actorId:a.id,abilityId:id,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes:[],statusEvent:statusEvent(b,c,{drawDice,combat:true})};
    const engageReturns=settleEngageReturns(b);if(engageReturns.length)result.engageReturns=engageReturns;
  for(const actor of Object.values(b.actors)){delete actor.willDefenseReady;delete actor.willCheckReady;}
  const interrupted=settleInterruptedTeleports(b);if(interrupted.length)result.interruptedChannels=interrupted;
    for(const actor of Object.values(b.actors))syncAutonomousFlight(actor);
    finishIfNeeded(b);result.after=stateResult(b,a.id,id).after;return {battle:b,result};
  }
  assertEmbodied(a.state,c,b.ruleScene?.objects);
  requireThat(id==='conversion'||isReflexResource(b,c)||a.id===b.activeId,'尚未轮到该参战者');
  requireThat(!unconscious(a),'已失去行动能力');
  requireThat(a.state.paidMotion?.phase!=='airborne'||['continueJump','end'].includes(id)||isReflexResource(b,c),'当前跳跃须以后续移动动作补全，不能重新起跳或改为其他主动动作');
  requireThat(id==='end'||!a.state.sleeping,'睡眠期间不能主动行动或反应，须先醒来');
  if(a.state.channeling&&id!=='end'&&!(id==='statusEvent'&&b.ruleScene?.events?.[c.eventId]?.type==='channelFailure')&&!(id==='mechanism'&&c.objectId===a.state.channeling.objectId&&c.part===a.state.channeling.part))throw new RuleInputError('累计施法中；须先处理实际中断及其失败口径','channeling');
  if(id!=='end'){
    const selectedFlight=['move','step'].includes(id)&&c.movementSource?inspectFlightMove(b,a,c):null;
    const escape=['move','step'].includes(id)&&effectiveStatuses(a.state,'恐惧').every(s=>{
      const source=b.actors[s.sourceActorId];return source&&Array.isArray(c.to)&&spatialDistance(b.map,c.to,source.position)>spatialDistance(b.map,a.position,source.position)&&(selectedFlight?.path??measurePath(b.map,a.position,c.to,c.via)).cost>=(selectedFlight?.speed??panel(b,a.id).speed)-1e-8;});
    a.statusPermission=statusActionPermission(a.state,c,{escape,perceived:s=>s.perceived??(b.actors[s.sourceActorId]?.present&&canObserve(b,b.actors[s.sourceActorId],a.id)?true:undefined)});
    if(selectedFlight?.maneuverability==='perfect')a.statusPermission.perfectFlight=true;
    if(physicalActions.has(id)&&!['move','step'].includes(id)){const limb=limbEffects(a.state,c.limbIds??a.state.anatomy?.attackLimbs);requireThat(!limb.disabled,'该动作所需肢体已残障');}
  }
  requireThat(!a.underground?.mustEmerge||['emerge','end'].includes(id),'土遁期限已到，须标准动作出土');
  requireThat(!a.underground||['move','emerge','end'].includes(id),'地下不能攻击或使用地面动作');
  requireThat(!physicalActions.has(id)||!frozen(a),'定身阻止该动作');
  const result={actorId:a.id,abilityId:id,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes:[]};
  const perceptions=schedulePassivePerception(b,{drawDice,reason:'before-action'});if(perceptions.length)result.perceptions=perceptions;
  if(id!=='end'&&id!=='conversion'&&!a.diehard&&lifeStatus(a.state).state==='B-check') {
    const dc=c.preActionDC??a.parameters?.preActionDC;
    if(!Number.isSafeInteger(dc)||dc<1)throw new RuleInputError('B伤满格须主持给出行动前力量检定DC',`${a.id}.preActionDC`);
    const pre=checkBeforeAction(a.state,{dc,dice:drawDice()});a.state=pre.state;result.preActionCheck=pre.result;
    if(!pre.result.allowed){syncAutonomousFlight(a);result.notes.push('行动前力量检定失败，昏迷；原行动未执行。');finishIfNeeded(b);result.after=stateResult(b,a.id,id).after;return {battle:b,result};}
    a.preActionCleared=true;
  }
  if(c.rapidFire){
    requireThat(id==='strike'&&wizardWeapon(a.state)&&a.state.wizard.weaponMode==='gun','只有Wizard剑枪采用连射');
    const adjacent=rapidFireTargets(b,c);
    if(adjacent.length<=9)c.adjacentTargetIds=adjacent.map(x=>x.id);
    else requireThat(c.adjacentTargetIds?.length===9&&c.adjacentTargetIds.every(id=>adjacent.some(x=>x.id===id)),'超过10个目标须明确选取9个相邻目标');
  }
  if(c.actionDiscount!==undefined)requireThat(typeof c.actionDiscount==='string'&&!c.rapidFire&&!c.adjacentTargetIds?.length,'该身体行动组合尚无已登记减费价');
  if(c.willpower!==undefined)requireThat(typeof c.willpower==='boolean','willpower须为布尔选择');
  if(c.willpower&&!['mechanism','jump'].includes(id)){
    requireThat(['strike','thunder','cleaveRock','conduct','escapeGrip','pressGrip','hypnotize','shieldPush'].includes(id)&&!c.rapidFire&&!c.adjacentTargetIds?.length,'此意志选项仅用于单次攻击判定');
    const w=willEnhancement(a.state);requireThat(w.allowed,w.reason);changeWill(a.state,-1);a.willCheckReady=true;result.willCosts=[{actorId:a.id,cost:1,kind:'attack'}];
  }
  for(const [actorId,chosen]of Object.entries(willDefenses))if(chosen){const defender=b.actors[actorId];const w=willEnhancement(defender.state);requireThat(w.allowed,w.reason);defender.willDefenseReady=true;}
  const chosenPrice=undefined; // Actual slot-aware quote is obtained at payment.
  const t=b.actors[c.targetId];
  const coolKey=['lightning','conduct'].includes(id)?'lightning':id;
  requireThat((a.cooldowns[coolKey]??0)<=b.round,'能力仍在冷却');
  if(['thunder','cleaveRock','lightning','conduct'].includes(id)) {
    if(['lightning','conduct'].includes(id)) requireThat([1,2,3].includes(c.tier),'御雷须选择tier1/2/3');
    pay(a,'灵力',['lightning','conduct'].includes(id)?[1,3,5][c.tier-1]:1,c.payment);
    a.cooldowns[coolKey]=b.round+1;
  }
  if(a.kind==='bright'&&!['strike','aim','conversion','end'].includes(id)) delete a.aim;
  if(a.kind==='mireya'&&['move','step','block','drawClub','readyBow','door','destroy','aim'].includes(id))delete a.calibration;
  switch(id) {
    case 'jump':case 'continueJump': {
      const budget=panel(b,a.id).speed;requireThat(budget>0,'当前没有可用于跳跃的移动速度');
      const prepared=id==='jump'?inspectJump(b,a,c):null;
      if(id==='continueJump')requireThat(a.state.paidMotion?.phase==='airborne','没有尚未完成的跳跃');
      if(c.actionDiscount){const price=quoteActionPrice(a.state,{sourceId:c.actionDiscount,action:'move',family:'physical',roundKey:combatRoundKey(b)});spend(b,a,c,'move','move',price);result.actionPrice=price;}else spend(b,a,c,'move','move');
      if(prepared)beginPaidJump(b,a,c,prepared,drawDice);
      const segment=previewPaidMotion(a,budget,b.map);
      const suspended=settlePaidMovement(b,c,result,segment,{drawDice,playerAuthorized,deferPlayerDefense,defenseDeclarations,opportunityDeclarations,deferMovementReactions,input,pendingConcentration});
      if(suspended)return {battle:b,result};
      break;
    }
    case 'garudaScout':case 'garudaHide':{const choice=a.parameters?.garudaActions?.[id];if(!choice?.source||!choice.action)throw new RuleInputError('使魔主动侦查/隐藏按本次任务登记动作时间，原卡只给骰池',id+'.action');spend(b,a,c,choice.action);const roll=rollPool(id==='garudaScout'?7:6,drawDice());result.familiarCheck={...roll,total:roll.rolledSuccesses+1,autoSuccesses:1};break;}
    case 'garudaInterfere':{requireThat(t?.present&&t.team!==a.team&&spatialDistance(b.map,a.position,t.position)<=1.5&&canObserve(b,t,a.id),'须接近并可见干扰目标');spend(b,a,c,'attack');t.state.timedEffects??={};t.state.timedEffects.garudaInterference={points:(t.state.timedEffects.garudaInterference?.points??0)+1,remainingMinutes:.1,source:a.id};result.notes.push('使魔干扰计作攻击，目标多次攻击防御减值加1');break;}
    case 'statusEvent':result.statusEvent=statusEvent(b,c,{drawDice,combat:true,preActionCleared:a.preActionCleared});break;
    case 'search':requireThat(!Object.values(a.state.resourcePendingPerceptions??{}).some(x=>x.event.mode==='search'),'须先补齐并续算已付费的主动侦查');spend(b,a,c,'standard');(result.perceptions??=[]).push(...schedulePassivePerception(b,{drawDice,mode:'search',observerId:a.id,reason:'active-search'}));break;
    case 'wake':requireThat(t?.state.sleeping&&spatialDistance(b.map,a.position,t.position)<=1.5,'须能接触实际睡眠者');spend(b,a,c,'standard');delete t.state.sleeping;result.notes.push('以标准动作唤醒睡眠者');break;
    case 'mechanism':result.mechanism=runSceneMechanism(b,c,{combat:true,preActionCleared:a.preActionCleared,drawDice});if(b.map)b.map.ruleBarriers=sceneBarriers(b.ruleScene);break;
    case 'ringStore':case 'ringRetrieve': {
      const out=ringTransfer(a,{operation:id==='ringStore'?'store':'retrieve',itemId:c.itemId},{combat:true,preActionCleared:a.preActionCleared});Object.assign(a,out.actor);result.inventory=out.result;break;
    }
    case 'escapeGrip': {
      const g=a.state.grapple,holder=b.actors[g?.holderId];requireThat(holder&&['strength','agility'].includes(c.method),'须选择当前擒抱的逃脱方式');
      spend(b,a,c,'attack');const contest=grappleContest(a,holder,{drawDice,activeAgility:c.method==='agility',defense:'strength'});
      if(contest.success){if(g.pressed)g.pressed=false;else releaseGrapple(b,a);}result.grapple=contest;break;
    }
    case 'pressGrip':case 'grappleAttack': {
      const g=t?.state.grapple;requireThat(g?.holderId===a.id,'目标并未被自己擒抱');
      requireThat(id!=='pressGrip'||g.sinceRound<b.round,'下一轮才能压制');
      if(id==='pressGrip') {
        spend(b,a,c,'attack');const contest=grappleContest(a,t,{drawDice,defense:grappleDeclarations[t.id]});
        if(contest.success){g.pressed=true;g.margin=contest.margin;}result.grapple=contest;
      } else {
        requireThat(a.kind==='chuul'||(equipment(a).weapon.size??a.weaponSize??Infinity)<=a.state.size-3,'该武器体积不适于擒抱内攻击');
        spend(b,a,c,g.pressed?'standard':'full');const contest=g.pressed?{success:true}:grappleContest(a,t,{drawDice,defense:grappleDeclarations[t.id]});result.grapple=contest;
        if(contest.success){const roll=check(a.state,{attribute:'力量',skill:'肉搏',dice:drawDice(),context:{physical:true,attack:true}});result.grappleAttack=roll;
          damageEvent(t,[{amount:roll.total,severity:'B',kind:'physical'}],conversionFor(t,roll.total),result,{conversion:0},{root:b,sourceActorId:a.id,targetId:t.id,drawDice,damageNature:'rolled'});}
      }break;
    }
    case 'hypnotize': {
      const facts=b.sceneFacts?.hypnosis?.[a.id]?.[c.targetId];
      requireThat(t?.present&&!t.construct&&!t.immunities?.includes('charm')&&spatialDistance(b.map,a.position,t.position)<=10,'目标不在催眠范围或不能受心智影响');
      requireThat(canObserve(b,t,a.id)&&canObserve(b,a,t.id)&&facts?.understands&&facts?.hears&&facts?.recognizesDakas&&typeof facts.instruction==='string'&&facts.instruction.trim(),'催眠须双方看见、听懂指示，并有已确认的达卡斯形象与一条指示');
      spend(b,a,c,'standard');pay(a,'魔力',2);
      const roll=check(a.state,{attribute:'风度',skill:'魔法',sub:'催眠',dice:drawDice(),modifier:c.willpower?3:0,context:{mentalPower:true,willSpent:c.willpower===true}});
      const source=`催眠:${a.id}`,out=applyStatus(t.state,{type:'魅惑',source,points:roll.total,dice:drawDice()});t.state=out.state;
      for(const s of t.state.statuses.filter(s=>s.source===source))Object.assign(s,{restBlocked:true,controllerName:'达卡斯',instruction:facts.instruction,magic:true});
      result.statuses.push({targetId:t.id,roll,...out.result});break;
    }
    case 'doubleStrike': {
      requireThat(a.kind==='chuul'?a.claws.every(x=>!x):a.weaponsAvailable===2,'双击需要两件可用武器或两只空螯');
      // The complete action is priced once, before either attack.
      const targets=[t,b.actors[c.secondTargetId??c.targetId]];requireThat(targets.every(x=>x?.present&&!unconscious(x)),'双击目标须在场');
      spend(b,a,c,['full','swift']);result.attacks=[];
      for(const target of targets) {
        if(unconscious(target)){result.notes.push('前一击已使后续目标失去行动能力，后续刀击不重复结算。');continue;}
        strike(b,a,target,{...c,targetId:target.id},result,drawDice,{actionAlreadyPaid:true,deferPlayerDefense,defenseDeclarations,grappleDeclarations});
        result.attacks.push(result.attack);
      }
      if(a.kind==='chuul'&&!deferPlayerDefense)for(const [index,attack]of result.attacks.entries())if(attack.amount>0&&!unconscious(targets[index]))
        (result.grapples??=[]).push(attachClaw(b,a,targets[index],{drawDice,defense:grappleDeclarations[targets[index].id],claw:index}));
      a.state.turn.standard=0;break;
    }
    case 'tentacles': {
      requireThat(t?.present&&a.claws?.includes(t.id)&&spatialDistance(b.map,a.position,t.position)<=3,'触须毒须用于当前自己夹住且3米内的目标');
      spend(b,a,c,'standard');
      const source=`Chuul毒:${a.id}`,out=applyStatus(t.state,{type:'麻痹',source,points:8,dice:drawDice(),eligible:!t.immunities?.includes('poison')});t.state=out.state;
      for(const s of t.state.statuses.filter(s=>s.source===source))Object.assign(s,{roundResistance:'chuul',remainingMinutes:1});
      result.statuses.push({targetId:t.id,...out.result});break;
    }
    case 'releaseGrip': {
      requireThat(a.kind==='chuul'&&[0,1].includes(c.claw)&&a.claws[c.claw],'该螯未夹住目标');spend(b,a,c,'free');
      const target=b.actors[a.claws[c.claw]];a.claws[c.claw]=null;
      if(target?.state.grapple){const remaining=a.claws.map((id,i)=>id===target.id?i:-1).filter(i=>i>=0);if(remaining.length){target.state.grapple.claws=remaining;target.state.grapple.claw=remaining[0];}else delete target.state.grapple;}break;
    }
    case 'burrow': {
      requireThat(!a.underground&&!a.state.grapple,'当前无法开始土遁');const path=earthPath(b.map,a.position,a.position);requireThat(path.valid,path.reason);
      spend(b,a,c,'standard');pay(a,'魔力',2);a.underground={expiresRound:b.round+5};break;
    }
    case 'emerge':
      requireThat(a.underground&&(b.map?.features??[]).some(f=>!f.destroyed&&f.earthExit&&contains(a.position,f)),'须在当前可用土层出口出土');spend(b,a,c,'standard');delete a.underground;break;
    case 'morph':
      requireThat(['空','Phantom'].includes(c.form)&&c.form!==a.form,'只能切换空的外貌与Phantom形态');spend(b,a,c,'standard');a.form=c.form;break;
    case 'firstAid': {
      requireThat(t&&t.id!==a.id&&spatialDistance(b.map,a.position,t.position)<=1.5&&clearLine(b.map,a.position,t.position),'急救须能接触另一名伤者');
      spend(b,a,c,'full');
      const out=firstAid(a.state,t.state,{dice:drawDice(),actionAlreadySpent:true});requireThat(out.result.allowed,out.result.reason);
      a.state=out.healer;t.state=out.patient;result.firstAid=out.result;break;
    }
    case 'stowWeapon':
      requireThat(a.kind==='bright'&&a.weaponMode!=='empty','当前没有可收起的武器');spend(b,a,c,'move');a.weaponMode='empty';a.loaded=false;delete a.buffs.block;break;
    case 'readyWeapon':
      requireThat(a.kind==='bright'&&a.weaponMode==='empty'&&['bow','longknife','dagger'].includes(c.weapon),'先收起当前武器，再选已持有的弓、长刀或匕首');spend(b,a,c,'move',undefined,chosenPrice,'drawWeapon');a.weaponMode=c.weapon;break;
    case 'medicine': {
      const out=reduceRecovery(a,{...c,type:'medicine'},{drawDice,playerAuthorized,combat:true,preActionCleared:a.preActionCleared,payAction:(working,kind)=>spend(b,working,c,kind)});
      Object.assign(a,out.actor);result.recovery=out.result;
      result.notes.push(`服用${c.medicine}；库存与即时或延后效果一并结算`);
      for(const change of out.result.changes)if(change.healed)result.healing.push({targetId:a.id,severity:change.severity,amount:change.healed});
      break;
    }
    case 'concede':
      requireThat(b.arena,'本场没有擂台认输结算');
      b.status='finished';b.winner=Object.values(b.actors).find(x=>x.team!==a.team)?.team??'平局';
      b.resolution={kind:'concede',actorId:a.id,taskComplete:false,xpAwarded:0,text:`${a.name}主动认输，本场停止交锋，保留伤势与资源，不发XP。`};break;
    case 'brace':
      requireThat(a.kind==='radwick'&&!a.buffs.brace,'该次稳身准备已成立或没有持盾资格');
      spend(b,a,c,'free');pay(a,'斗气',1);a.buffs.brace=true;break;
    case 'shieldPush': {
      requireThat(a.kind==='radwick'&&t?.present&&!unconscious(t)&&t.team!==a.team,'盾推需要有效敌人和盾');
      requireThat(spatialDistance(b.map,a.position,t.position)<=1.5&&canObserve(b,t,a.id)&&clearLine(b.map,a.position,t.position),'盾推须近身且路线可通');
      spend(b,a,c,'standard');
      if(deferPlayerDefense&&b.playerDefenseDeclarations&&t.controller==='player'&&!t.defenseIntent)break;
      if(b.playerDefenseDeclarations&&t.controller==='player')requireThat(defenseDeclarations[t.id]||t.defenseIntent,'须先由玩家声明本次受击反应，再作盾推强韧对抗');
      if(c.empowered)pay(a,'斗气',1);
      const sk=skill(a,'肉搏','盾推'),dp=value(a,'力量')+sk.level+(c.empowered?3:0)+(c.willpower?3:0)+geneticCheckBonus(a.state,{willEligible:true,willSpent:c.willpower===true})-penalty(a),fixed=auto(a,'力量')+sk.auto+geneticWillAuto(a.state,{willEligible:true,willSpent:c.willpower===true});
      const roll=rollPool(dp,drawDice()),save=saveRoll(t,'fort',drawDice),total=roll.rolledSuccesses+fixed;
      result.contest={kind:'shieldPush',dp,fixed,roll,total,targetTotal:save.total,won:total>save.total};result.saves.push({targetId:t.id,...save});
      if(total>save.total) {
        const len=Math.hypot(t.position[0]-a.position[0],t.position[1]-a.position[1]);requireThat(len>0,'重合站位须先补齐盾推方向');
        const to=t.position.map((n,i)=>n+(n-a.position[i])/len*2),path=measurePath(b.map,t.position,to);
        if(path.valid&&!Object.values(b.actors).some(x=>x.present&&x.id!==t.id&&spatialDistance(b.map,x.position,to)<.01)) {
          result.forcedMovement={targetId:t.id,from:clone(t.position),to:clone(to),length:2};t.position=to;delete t.calibration;
        } else result.notes.push('盾推对抗胜出，但2米落点或路线不合法；未擅自穿墙、出界或移动推人者。');
      }
      break;
    }
    case 'calibrate':
      requireThat(a.kind==='mireya'&&a.weaponMode!=='club','定点校准须双手持弓');
      requireThat(t?.present&&t.team!==a.team&&spatialDistance(b.map,a.position,t.position)<=60&&canObserve(b,t,a.id),'校准目标须在60米内持续可定位');
      spend(b,a,c,'full');a.calibration={targetId:t.id,ready:false};break;
    case 'drawClub': case 'readyBow':
      requireThat(a.kind==='mireya'&&(id==='drawClub'?a.weaponMode!=='club':a.weaponMode==='club'),'当前持握方式不需重复切换');
      spend(b,a,c,'move',undefined,chosenPrice,id==='drawClub'?'drawWeapon':undefined);a.weaponMode=id==='drawClub'?'club':'bow';delete a.buffs.block;
      a.visibleArms=id==='drawClub'?'包毡短棍在手，另一手持弓':'双手持缓冲竞技弓，短棍收于腰侧';break;
    case 'door': case 'destroy': {
      const f=b.map?.features.find(f=>f.id===c.featureId)??projectionFeature(b,c.featureId);
      requireThat(f&&!f.destroyed&&!f.hiddenFrom?.includes(a.id),'地形目标不存在、已破坏或尚未发现');
      const at=nearestPoint(a.position,f);
      requireThat(clearLine(b.map,a.position,at,{sight:true,root:b,observerId:a.id,ignoreProjectionId:f.projection?.id})&&clearLine(b.map,a.position,at),'地形目标被其他障碍遮挡');
      if(id==='door') {
        requireThat(f.kind==='door'&&typeof c.open==='boolean','开关门须指定门和open布尔值');
        requireThat(f.open!==c.open,'门已处于声明的状态');
        requireThat(!c.open||!f.locked,'门已上锁，需要另行声明开锁或破坏');
        requireThat(spatialDistance(b.map,a.position,at)<=1.5+1e-8,'开关门须在相邻1.5米内');
        requireThat(c.open||!Object.values(b.actors).some(x=>x.present&&contains(x.position,f)),'门口有人占据，不能关闭');
        spend(b,a,c,'move');f.open=c.open;
        result.terrain={featureId:f.id,label:f.label,kind:'door',open:f.open,outcome:f.open?'门已打开，通路打开':'门已关闭，通路被阻挡'};
      } else {
        requireThat(['obstacle','door'].includes(f.kind),'只能破坏独立标记的障碍或门');
        if(!f.durability&&!f.projection)throw new RuleInputError('障碍缺少已确认的耐久与硬度',`map.${f.id}.durability`);
        strike(b,a,{id:`terrain/${f.id}`,present:true,position:at},c,result,drawDice,{feature:f});
      }
      break;
    }
    case 'strike': case 'thunder': case 'cleaveRock': case 'lightning': case 'conduct':
      strike(b,a,t,c,result,drawDice,{deferPlayerDefense,defenseDeclarations,grappleDeclarations});
      if(c.adjacentTargetIds?.length){
        requireThat(id==='strike'&&(a.state.wizard?.form==='wind'||c.rapidFire),'只有风形态或剑枪连射能附带相邻目标');
        requireThat(new Set(c.adjacentTargetIds).size===c.adjacentTargetIds.length&&!c.adjacentTargetIds.includes(t.id),'附加目标不可重复');
        result.adjacentAttacks=[];for(const targetId of c.adjacentTargetIds){const other=b.actors[targetId];requireThat(other?.present&&spatialDistance(b.map,t.position,other.position)<=1.5,'须为主目标相邻的实际目标');if(c.rapidFire){a.rapidAdjacentHits??=[];requireThat(!a.rapidAdjacentHits.includes(targetId),'本行动轮该目标已承受一次连射邻接追加');a.rapidAdjacentHits.push(targetId);}const sub={damage:[],statuses:[],saves:[],notes:[]};strike(b,a,other,{...c,targetId,adjacentTargetIds:undefined,rapidFire:false,rapidSecondary:c.rapidFire,rapidPenalty:c.adjacentTargetIds.length},sub,drawDice,{actionAlreadyPaid:true,deferPlayerDefense,defenseDeclarations});result.damage.push(...sub.damage);result.adjacentAttacks.push({targetId,...sub});}
      }break;
    case 'draw':
      requireThat(a.sheathed,'刀已出鞘'); spend(b,a,c,'move',undefined,chosenPrice,'drawWeapon'); a.sheathed=false;
      a.buffs.drawnRound=b.round; a.buffs.drawUsed=false; break;
    case 'sheathe':
      requireThat(!a.sheathed,'刀已在鞘'); spend(b,a,c,'move'); a.sheathed=true; delete a.buffs.block; break;
    case 'block':
      requireThat(!a.buffs.block,'本回合已格挡');
      requireThat(wizardWeapon(a.state)||a.kind!=='mireya'||a.weaponMode==='club','弓不能格挡；须先花移动取短棍，再另付移动格挡');
      requireThat(wizardWeapon(a.state)||a.kind!=='bright'||a.ruleset!=='opening-20261022'||['longknife','dagger'].includes(a.weaponMode),'须实际持长刀或匕首才能格挡');
      requireThat(wizardWeapon(a.state)||a.kind!=='huang'||!a.sheathed,'持刀才能白刃格挡');
      spend(b,a,c,a.state.wizard?.form==='water'?'swift':a.kind==='huang'&&a.ruleset!=='opening-20261022'?'free':'move',undefined,chosenPrice,a.state.wizard?.form==='water'||a.kind==='huang'&&a.ruleset!=='opening-20261022'?undefined:'block'); a.buffs.block=true;
      if(b.playerDefenseDeclarations&&a.controller==='player')a.defenseIntent={mode:'block',source:id};break;
    case 'zheng':
      requireThat(!a.buffs.block,'已经格挡');spend(b,a,c,'move',undefined,chosenPrice,'block');a.buffs.block=true;a.buffs.zheng=true;
      if(b.playerDefenseDeclarations&&a.controller==='player')a.defenseIntent={mode:'block',source:id};break;
    case 'tengzhuan':
      requireThat(!a.buffs.tengzhuan,'腾转已经生效');spend(b,a,c,'standard');
      requireThat((a.ruleset==='opening-20261022'?['流风']:['风池','魔力']).includes(c.resource??(a.ruleset==='opening-20261022'?'流风':'风池')),'需要合用能量');pay(a,c.resource??(a.ruleset==='opening-20261022'?'流风':'风池'),1);
      a.buffs.tengzhuan=true;(a.expires??={}).tengzhuan=b.round+10;break;
    case 'flow': {
      if(!['standard','move','swift','free'].includes(a.parameters?.flowAction)||!Number.isInteger(a.parameters?.flowMax))
        throw new RuleInputError('流风需要完整池上限与启动动作',`${a.id}.flow`);
      requireThat(!a.buffs.flow,'流风加速已经生效');
      requireThat([1,2].includes(c.tier),'流风选择1或2点');spend(b,a,c,a.parameters.flowAction);pay(a,'流风',c.tier);
      a.buffs.flow=c.tier;(a.expires??={}).flow=b.round+10;break;
    }
    case 'tornado': case 'gale': {
      if(id==='tornado')requireThat(t?.present,'需要指定已知角色ID作为目标');
      requireThat((a.ruleset==='opening-20261022'?['流风']:['风池','魔力']).includes(c.resource??(a.ruleset==='opening-20261022'?'流风':'风池')),'需要合用能量');
      pay(a,c.resource??(a.ruleset==='opening-20261022'?'流风':'风池'),1);a.sheathed=false;
      const targets=id==='tornado'?[t]:galeTargets(b,c);
      requireThat(targets.length>0,'范围内无有效目标');
      for(let i=0;i<targets.length;i++) {
        if(i) a.state.turn.standard=1;
        strike(b,a,targets[i],{...c,targetId:targets[i].id},result,drawDice,{deferPlayerDefense,defenseDeclarations});
      }
      break;
    }
    case 'reload':
      if(equipment(a).weapon.instanceId||equipment(a).weapon.resourceId){result.ammunition=loadWeaponAmmo(a,equipment(a).weapon,{preActionCleared:a.preActionCleared,payAction:kind=>spend(b,a,c,kind,undefined,chosenPrice,'loadBow')});break;}
      requireThat(a.kind!=='bright'||!a.weaponMode||a.weaponMode==='bow','须先取出长弓');
      requireThat(a.kind!=='mireya'||a.weaponMode!=='club','持棍时不能双手持弓上箭');
      if(!Number.isInteger(a.ammunition)) throw new RuleInputError('须提供当前普通箭数量',`${a.id}.ammunition`);
      requireThat(!a.loaded&&a.ammunition>0,'已上箭或没有箭矢');spend(b,a,c,'swift',undefined,chosenPrice,'loadBow');a.loaded=true;break;
    case 'aim':
      requireThat(a.kind!=='bright'||!a.weaponMode||a.weaponMode==='bow','须先取出长弓');
      requireThat(t?.present&&t.team!==a.team,'瞄准需要有效敌方目标');
      requireThat(canObserve(b,t,a.id),'目标不在视线内，无法瞄准');
      requireThat(a.aim?.pendingRound!==b.round,'本轮已瞄准');spend(b,a,c,'standard');
      a.aim={targetId:t.id,rounds:a.aim?.targetId===t.id?a.aim.rounds:0,pendingRound:b.round};break;
    case 'timeBolt': case 'timeHaste': {
      requireThat(t?.present&&spatialDistance(b.map,a.position,t.position)<=50,'目标须在50米内');
      requireThat(clearLine(b.map,a.position,t.position),'法术效果线被实体障碍阻挡');
      requireThat(canObserve(b,t,a.id),'目标不在视线内，无法指定法术目标');
      if(id==='timeHaste') requireThat(!t.buffs.timeHaste,'时间加速已生效');
      spend(b,a,c,id==='timeHaste'?'full':'standard');pay(a,'导力',1);
      if(id==='timeHaste') t.buffs.timeHaste=true;
      else {
        const n=damageEvent(t,[{amount:1,severity:'B',kind:'energy',energyType:'mental'}],conversionFor(t,1),result,{conversion:0},{root:b,sourceActorId:a.id,targetId:t.id,drawDice});
        if(n&&rollPool(1,drawDice()).rolledSuccesses>0) {
          const mentalReduction=t.kind==='jiang'?4:t.kind==='huang'?auto(t,'意志'):0;
          if(n>mentalReduction) t.state.statuses.push({type:'精神束缚',points:n-mentalReduction,source:'时属性攻击'});
        }
      }
      break;
    }
    case 'perfectWarrior': case 'guardAlly': case 'necromancy':
      throw new RuleInputError(ABILITIES[id].text,`${a.id}.${id}`);
    case 'fistQi':
      requireThat(!a.buffs.fistQi,'拳气已经生效'); spend(b,a,c,'swift'); pay(a,'气',1); a.buffs.fistQi=true; break;
    case 'breakBody':
      requireThat(!a.buffs.breakBody,'破身拳运功已经生效'); spend(b,a,c,'free'); pay(a,'斗气',1); a.buffs.breakBody=true; break;
    case 'restoreSwift':
      requireThat(!a.used.restoreSwift&&!a.state.turn.swift&&!a.state.turn.reactionLock,'迅捷未耗用、已使用过恢复或被反射锁定');
      a.used.restoreSwift=true; a.state.turn.swift=1;
      a.state.statuses.push({type:'疲乏',points:2,source:'高速恢复'}); break;
    case 'selfHeal': {
      requireThat(!a.used.selfHeal,'自我医疗已使用'); spend(b,a,c,'standard');
      const healed=heal(a,['A','L','B'],true); requireThat(healed,'没有可由本能力治疗的伤势');
      a.used.selfHeal=true; result.healing.push({actorId:a.id,severity:healed}); break;
    }
    case 'squeeze': {
      requireThat(['气','斗气'].includes(c.resource),'压榨须指定气或斗气');
      const p=a.state.resources[c.resource]; requireThat(p.current<p.max,'池已满');
      spend(b,a,c,'free'); a.squeezed++; p.current++;
      const strength=a.state.attributes.力量, will=a.state.attributes.意志;
      const severity=a.squeezed>strength+will?'A':'L';
      const recovery=a.squeezed>(strength+will)/2?'naturalOnly':a.squeezed>strength/2?'aggravated':null;
      damageEvent(a,[{amount:1,severity,kind:'physical',...(recovery?{recovery,sourceId:'生命压榨'}:{})}],false,result);
      break;
    }
    case 'conversion':
      requireThat(typeof c.enabled==='boolean'&&!a.used.damageConversion,'须设置enabled，且伤害转换尚未使用');
      requireThat(a.reactions.damageConversion!==c.enabled,'该伤害转换策略已设置，无需重复');
      a.reactions.damageConversion=c.enabled; break;
    case 'summon': {
      requireThat(!b.actors.lotus?.present,'乱红莲已经在场');
      requireThat(!b.actors.lotus||lifeStatus(b.actors.lotus.state).state!=='dead','乱红莲沉睡中');
      const position=summonPosition(b,a,c.to);
      spend(b,a,c,'standard'); pay(a,'灵力',3,c.payment);
      b.actors.lotus??=makeLotus(a);
      const lotus=b.actors.lotus; lotus.present=true;
      lotus.position=position;
      if(!b.order.includes('lotus')) b.order.splice(b.order.indexOf(a.id)+1,0,'lotus');
      break;
    }
    case 'recall':
      requireThat(b.actors.lotus?.present,'乱红莲不在场'); spend(b,a,c,a.kind==='lotus'?'free':'standard');
      b.actors.lotus.present=false;
      if(a.kind==='lotus') advance(b,result);
      break;
    case 'roar': {
      requireThat(!a.used.roar,'本场景已咆哮'); requireThat(t?.present,'需要指定射线方向目标');
      spend(b,a,c,['full','swift']); a.used.roar=true;
      const len=spatialDistance(b.map,a.position,t.position); requireThat(len>0,'射线方向无效');
      for(const other of roarTargets(b,c)) {
        const save=saveRoll(other,'reflex',drawDice,{areaAttack:true,recognizable:other.kind==='huang'&&spatialDistance(b.map,a.position,other.position)<=30,cover:terrainCover(b.map,a.position,other.position)});
        result.saves.push({targetId:other.id,...save});
        const n=Math.max(0,8+auto(b.actors[a.ownerId],'意志')-save.total);
        damageEvent(other,[{amount:n,severity:'L',kind:'energy',energyType:'force'}],conversionFor(other,n),result,{conversion:0},{root:b,sourceActorId:a.id,targetId:other.id,drawDice,targetMode:'area'});
      }
      break;
    }
    case 'move': case 'step': {
      requireThat(Array.isArray(c.to)&&c.to.length===(c.movementSource?3:2)&&c.to.every(Number.isFinite),'移动须合法二维坐标，飞行须选择来源及三维坐标');
      requireThat(c.movementSource||[c.flightEnd,c.motionObjectId,c.motionPart].every(x=>x===undefined),'飞行末态选择须实际飞行来源');
      const flight=c.movementSource?inspectFlightMove(b,a,c):null;
      requireThat(!!flight||!(a.state.verticalPosition?.heightAboveGround>0),'尚在空中，不能以地面移动瞬间落地');
      if(a.territory)requireThat([...(c.via??[]),c.to].every(p=>Math.hypot(p[0]-a.territory.center[0],p[1]-a.territory.center[1])<=a.territory.radius),'固定阵地单位不能离开有效圈');
      requireThat(!c.climb||a.wallClimb,'当前人物无免检攀爬资格');
      requireThat(!c.run||a.waterRun,'当前人物无水面奔跑资格');
      const path=flight?flight.path:a.underground?earthPath(b.map,a.position,c.to,c.via):measurePath(b.map,a.position,c.to,c.via,{ignoreDifficult:a.ignoreDifficult||a.flight||a.state.wizard?.form==='wind',climb:c.climb,fly:a.flight});requireThat(path.valid,path.reason);
      const crossed=pathFeatures(b.map,path.path);
      if(crossed.some(f=>f.surface==='water'))requireThat(flight||a.flight||a.waterRun&&c.run,'水面路径须有水面奔跑资格并声明奔跑；游泳须另有判定');
      const terrainPenalty=flight||a.flight||a.state.wizard?.form==='wind'?0:Math.max(0,...crossed.map(f=>f.speedPenalty??0));
      path.cost+=Math.max(0,remainingPenalty(a.state,'environment',terrainPenalty)-(a.kind==='yulin'&&a.buffs.tengzhuan||a.waterRun&&c.run?5:0));
      const baseSpeed=flight?flight.speed:panel(b,a.id).speed;
      const length=path.cost,maximum=id==='step'?Math.min(1.5,baseSpeed):baseSpeed;
      requireThat(length>0&&length<=maximum+1e-8,'移动距离超过可用速度');
      const linked=a.state.grapple?b.actors[a.state.grapple.holderId]:b.actors[a.claws?.find(Boolean)];
      if(linked) {
        requireThat(new Set(a.claws?.filter(Boolean)).size!==2,'牵带两个目标尚须明确负重和分别对抗，不能默认拖动');
        const g=a.state.grapple??linked.state.grapple;
        requireThat(!a.state.grapple?.pressed,'被压制者不能移动');
        if(g.pressed)requireThat(length<=maximum/2,'压制后牵带最多半速');
        else {const contest=grappleContest(a,linked,{drawDice,drag:true});result.grapple=contest;
          if(!contest.success||path.length>contest.margin){spend(b,a,c,'move','move');result.notes.push('牵带力量对抗不足以完成声明距离，动作已消耗、双方未移动。');break;}}
        const offset=c.to.map((n,i)=>n-a.position[i]),to=linked.position.map((n,i)=>n+offset[i]);
        requireThat(measurePath(b.map,linked.position,to).valid,'被牵带者路线受阻');linked.position=to;
      }
      if(c.actionDiscount){const price=quoteActionPrice(a.state,{sourceId:c.actionDiscount,action:'move',family:'physical',roundKey:combatRoundKey(b)});spend(b,a,c,'move','move',price);result.actionPrice=price;}
      else spend(b,a,c,id==='step'?'fiveFootStep':'move',id==='move'?'move':undefined);
      if(c.block){requireThat(id==='move'&&a.state.wizard?.form==='water','移动兼格挡须为水形态');a.buffs.block=true;if(b.playerDefenseDeclarations&&a.controller==='player')a.defenseIntent={mode:'block',source:'waterMove'};}
      if(id==='move') for(const foe of opportunityActors(b,c)) {
        if(b.playerDefenseDeclarations&&foe.controller==='player'&&opportunityDeclarations[foe.id]!==true)continue;
          const sub={actorId:foe.id,abilityId:'strike',damage:[],statuses:[],saves:[]};
          // Opportunity trigger is supplied by this geometry, not by model input.
          const freeResponse=waterResponse(foe),oldPosition=a.position;if(freeResponse)a.position=waterCrossing(b,foe,c);
          strike(b,foe,a,{actorId:foe.id,abilityId:'strike',targetId:a.id},sub,drawDice,{opportunity:!freeResponse,freeResponse,deferPlayerDefense,defenseDeclarations});
          if(!freeResponse||!unconscious(a))a.position=oldPosition;if(freeResponse)sub.freeResponse=true;
          result.opportunities??=[]; result.opportunities.push(sub);
      }
      if(!unconscious(a)){result.movement={from:clone(a.position),to:clone(c.to),path:path.path,length:path.length,cost:path.cost,speed:baseSpeed};if(flight)commitFlightPosition(a,b.map,c.to,c.movementSource,flight.endKinematics);else a.position=clone(c.to);} break;
    }
    case 'end': advance(b,result,c.deteriorationChoices,drawDice); break;
    default:
      if(BASIC_ACTIONS[id])result.resource=runBasicResourceAction(b,c,{combat:true,preActionCleared:a.preActionCleared,drawDice});
      else throw new RuleInputError('尚未适配的能力',`${a.id}.${id}`);
  }
  samplePassivePerception(b);
  return finishAction(input,b,c,result,drawDice,pendingConcentration);
}
function finishAction(input,b,c,result,drawDice,pendingConcentration=[]){
  const a=b.actors[c.actorId],id=c.abilityId;
  for(const moved of Object.values(b.actors))if(moved.position?.length===2&&moved.state.verticalPosition?.heightAboveGround>0){moved.state.verticalPosition={heightAboveGround:0,groundElevation:groundElevationAt(b.map,moved.position),source:'resolved-position/'+moved.id};delete moved.state.resourceDescent;}
  delete a.preActionCleared;
  completeStatusOrder(a.state,a.statusPermission);delete a.statusPermission;
  if(id!=='end'){burningDamage(a,'action',(amount,source)=>damageEvent(a,[{amount,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},{root:b,targetId:a.id,sourceActorId:source.sourceActorId??null,drawDice,damageNature:'fixed'}),{root:b,combat:true});}
  const engageReturns=settleEngageReturns(b);if(engageReturns.length)result.engageReturns=engageReturns;
  for(const actor of Object.values(b.actors)){delete actor.willDefenseReady;delete actor.willCheckReady;}
  const interrupted=settleInterruptedTeleports(b);if(interrupted.length)result.interruptedChannels=interrupted;
  for(const held of Object.values(b.actors))if(held.state.grapple&&unconscious(b.actors[held.state.grapple.holderId]))releaseGrapple(b,held);
  for(const actor of Object.values(b.actors))syncAutonomousFlight(actor);
  const deaths=settleResourceDeaths(b);if(deaths.length)(result.deaths??=[]).push(...deaths);
  const automatic=flushAutomaticResourceEvents(b,{drawDice,combat:true});if(automatic.length)(result.automaticEvents??=[]).push(...automatic);
  recordActualMovements(input,b,c,result);
  if(result.terrain?.kind==='door'){const cues=dispatchProjectionCue(b,a.id,{kind:'door',objectId:result.terrain.featureId,operation:result.terrain.open?'open':'close',position:a.position,channel:'visual'});if(cues.length)result.projectionCues=cues;}
  if(result.movement){const interactions=projectionMovementInteractions(b,a.id,result.movement.path);if(interactions.length)result.projectionInteractions=interactions;}
  if(c.hide&&result.movement)(result.perceptions??=[]).push(...schedulePassivePerception(b,{drawDice,mode:'hide',targetId:a.id,reason:'active-hiding'}));
  const observations=schedulePassivePerception(b,{drawDice,before:input,reason:id==='end'?'turn-start':'after-action',...(result.movement?{movement:{actorId:a.id,path:result.movement.path}}:{})});if(observations.length)(result.perceptions??=[]).push(...observations);
  finishIfNeeded(b);
  for(const observer of Object.values(b.actors))if(observer.calibration&&!canObserve(b,b.actors[observer.calibration.targetId],observer.id))delete observer.calibration;
  rememberTactic(input,b,c,result);
  const concentration=[...pendingConcentration,...settleResourceConcentration(input,b,drawDice)];
  if(concentration.length)result.concentration=concentration;
  refreshResourceAuras(b,{combat:true});
  result.after=stateResult(b,a.id,id).after;
  return {battle:b,result};
}

function settlePaidMovement(b,c,result,segment,options){
 const {drawDice,playerAuthorized,deferPlayerDefense,defenseDeclarations={},opportunityDeclarations={},deferMovementReactions=false,input,pendingConcentration=[]}=options;
 const a=b.actors[c.actorId];
 if(unconscious(a)||a.state.paidMotion?.phase==='interrupted'){syncAutonomousFlight(a);result.notes.push('已保存的跳跃因失去行动能力中断，不重投、不退费。');return false;}
 const origin=[...a.position.slice(0,2),elevationAt(b.map,a.position)];
 requireThat(origin.every((v,i)=>Math.abs(v-a.state.paidMotion.position[i])<1e-7),'跳跃位置已因其他事件改变，须先处理实际中断，不能用旧轨迹传送回去');
 segment=previewPaidMotion(a,segment.budget,b.map);
 const move={actorId:a.id,abilityId:'move',to:segment.next.position,via:segment.path.slice(1,-1),trajectory:{...segment.body,seconds:segment.seconds}};
 const foes=opportunityActors(b,move);
 const awaiting=deferMovementReactions&&b.playerDefenseDeclarations&&foes.find(f=>f.controller==='player'&&!Object.hasOwn(opportunityDeclarations,f.id));
 if(awaiting){
  b.pending={kind:'paid-movement',awaiting:awaiting.id,command:clone(c),segment:clone(segment),result:clone(result),before:clone(input),pendingConcentration:clone(pendingConcentration),playerAuthorized,opportunityDeclarations:clone(opportunityDeclarations)};
  result.notes.push('跳跃已投骰并支付本次移动动作；实际轨迹等待借机选择，续算不重投不重付。');
  result.after=stateResult(b,a.id,c.abilityId).after;return true;
 }
 for(const foe of foes){
  if(b.playerDefenseDeclarations&&foe.controller==='player'&&opportunityDeclarations[foe.id]!==true)continue;
  const sub={actorId:foe.id,abilityId:'strike',damage:[],statuses:[],saves:[]};
  const freeResponse=waterResponse(foe),oldPosition=a.position,oldMotion=clone(a.state.paidMotion),oldVertical=clone(a.state.verticalPosition);
  if(freeResponse){
   const center=[...foe.position.slice(0,2),elevationAt(b.map,foe.position)],radius=(foe.reach??1.5)+(b.map?.gridSize??1.5);
   const hit=ballisticSphereCrossings(move.trajectory,segment.seconds,center,radius).find(hit=>clearLine(b.map,foe.position,hit.point));
   a.position=[...hit.point];a.state.paidMotion.position=[...hit.point];a.state.paidMotion.velocity=[...hit.velocity];
   const ground=groundElevationAt(b.map,hit.point);a.state.verticalPosition={heightAboveGround:Math.max(0,hit.point[2]-ground),groundElevation:ground,source:a.state.paidMotion.source};
  }
  strike(b,foe,a,{actorId:foe.id,abilityId:'strike',targetId:a.id},sub,drawDice,{opportunity:!freeResponse,freeResponse,deferPlayerDefense,defenseDeclarations});
  if(!freeResponse||!unconscious(a)){a.position=oldPosition;a.state.paidMotion=oldMotion;a.state.verticalPosition=oldVertical;}
  if(freeResponse)sub.freeResponse=true;(result.opportunities??=[]).push(sub);
 }
 if(!unconscious(a)){
  const out=commitPaidMotion(a,segment,{root:b,drawDice});result.movement=out.movement;result.jump=out.jump;
  if(out.impacts.length)result.motionImpacts=out.impacts;
 }else{syncAutonomousFlight(a);result.notes.push('借机攻击使跳跃中断，已支付动作不退还。');}
 return false;
}
export function resumePaidMovement(input,c,options={}){
 const b=clone(input),p=b.pending;
 requireThat(p?.kind==='paid-movement'&&c.actorId===p.awaiting&&c.abilityId==='opportunityReact'&&options.playerAuthorized&&['strike','decline'].includes(c.choice)&&Object.keys(c).every(k=>['actorId','abilityId','choice'].includes(k)),'须由当前玩家选择已投骰移动的借机反应');
 const declarations={...p.opportunityDeclarations,[c.actorId]:c.choice==='strike'};delete b.pending;
 const suspended=settlePaidMovement(b,p.command,p.result,p.segment,{...options,playerAuthorized:p.playerAuthorized,deferMovementReactions:true,opportunityDeclarations:declarations,input:p.before,pendingConcentration:p.pendingConcentration});
 if(suspended)return {battle:b,result:p.result};
 return finishAction(p.before,b,p.command,p.result,options.drawDice??randomDice,p.pendingConcentration);
}
export function stateResult(b,actorId,abilityId,notes=[]) {
  return {actorId,abilityId,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes,
    after:{status:b.status,winner:b.winner,activeId:b.activeId,...(b.pending?{awaiting:b.pending.awaiting}:{}),
      visibleTo:Object.fromEntries([...Object.values(b.actors),...Object.values(b.observers??{})].filter(a=>a.present).map(a=>[a.id,Object.values(b.actors).filter(t=>canObserve(b,t,a.id)).map(t=>t.id)])),
      participants:Object.values(b.actors).filter(x=>x.present).map(x=>({id:x.id,name:x.name,team:x.team,health:clone(x.state.health),energy:clone(x.state.resources),actions:clone(x.state.turn),position:clone(x.position),statuses:clone(x.state.statuses)}))}};
}

export const TACTICS='敌人与同伴沿用相同流程：按目标、已知信息和剩余资源选招。先核动作、距离、能量、冷却及友军范围；需要时防御、移动或撤退，不机械重复最高伤害招式。若是隔离演练，目标是完成对练、分出胜负；移动应服务于下一次攻击或明确恢复，不在没有后续计划时反复远离对手。程序面板和结算为准，不自行改数或掷骰。玩家角色的选择交给玩家。';

const nonzero = value => Object.fromEntries(Object.entries(value).filter(([,v]) => Boolean(v)));

// This is a read-only projection, never a second saved character state.
function availableActorActions(a){return [...new Set([...a.abilities,'jump',...(a.state.paidMotion?.phase==='airborne'?['continueJump']:[]),...Object.keys(BASIC_ACTIONS),...(weaponAmmoSpec(a,equipment(a).weapon)?['reload']:[])])];}
function compactPanel(b, a) {
  const p=panel(b,a.id), s=a.state,weapon=equipment(a).weapon;
  const ammo=weaponAmmoSpec(a,weapon),instance=weapon.instanceId?s.possessions.items.find(i=>i.id===weapon.instanceId):null;
  const weaponState=weapon.instanceId||weapon.resourceId?{instanceId:weapon.instanceId??null,resourceId:weapon.resourceId??null,type:ordinaryWeaponType(weapon),
    ...(ammo?{loaded:(instance??a).loaded===true,ammunition:Number.isInteger(a.ammunition)?a.ammunition:null}:{})}:null;
  const health={intact:p.health.intact,B:p.health.B,L:p.health.L,A:p.health.A};
  for(const k of ['temp','coma','deteriorationStopped']) if(p.health[k]) health[k]=p.health[k];
  const {rawDP,dp,...attack}=p.attack;
  const actions={phase:p.actions.phase,standard:p.actions.standard,move:p.actions.move,swift:p.actions.swift};
  for(const k of ['reactionLock','reactionLockEnds','responseDebt','opportunityUsed']) if(p.actions[k]) actions[k]=p.actions[k];
  const buffs=nonzero(Object.fromEntries(Object.entries(a.buffs).filter(([k])=>!['drawnRound','drawUsed'].includes(k))));
  if(a.buffs.drawnRound===b.round&&!a.buffs.drawUsed) buffs.drawReady=true;
  const statuses=[...new Set(s.statuses.map(x=>x.type))].map(type=>{
    const {points,severe}=statusLevel(s,type);
    return {type,points,...(severe?{severe:true}:{}),
      ...(effectiveStatuses(s,type).some(x=>x.restBlocked)?{restBlocked:true}:{})};
  }).filter(x=>x.points>0);
  const result={
    id:p.id,name:p.name,team:p.team,controller:p.controller,abilities:availableActorActions(a),attributes:p.attributes,
    health,hpMax:p.hpMax,life:p.life,position:p.position,reach:a.reach,initiative:p.initiative,speed:p.speed,
    weaponReady:!!weapon.instanceId||!a.sheathed,
    ...(weaponState?{weaponState}:{}),
    attack:{dp,...nonzero(attack)},
    defense:p.defense.pending?{pending:true}:{total:p.defense.total,parts:nonzero(p.defense.parts),extraSuccesses:p.defense.extraSuccesses},
    ...(a.defenseIntent?{declaredDefense:clone(a.defenseIntent)}:{}),
    actions,energy:p.energy,will:p.will,
    ...(s.verticalPosition?{verticalPosition:clone(s.verticalPosition)}:{}),
    ...(s.physicalMotion?{physicalMotion:clone(s.physicalMotion)}:{}),
    ...(s.paidMotion?{paidMotion:clone(s.paidMotion)}:{}),
    ...(s.flightKinematics?{flightKinematics:clone(s.flightKinematics)}:{}),
    ...(p.movementModes.length?{movementModes:p.movementModes}:{}),
    ...(a.kind==='mireya'?{weaponMode:a.weaponMode,loaded:a.loaded,ammunition:a.ammunition,...(a.calibration?{calibration:clone(a.calibration)}:{})}:{}),
  };
  const maps={
    buffs,combos:nonzero(a.combos),
    cooldowns:nonzero(Object.fromEntries(Object.entries(a.cooldowns).map(([id,round])=>[id,Math.max(0,round-b.round)]))),
    used:nonzero(a.used),
  };
  for(const [k,v] of Object.entries(maps)) if(Object.keys(v).length) result[k]=v;
  if(statuses.length) result.statuses=statuses;
  if(frozen(a)) result.immobilized=true;
  if(lifeStatus(s).woundPenalty) result.woundPenalty=lifeStatus(s).woundPenalty;
  if(a.abilities.includes('conversion')) result.damageConversion=a.used.damageConversion?'已用':a.reactions.damageConversion?'已预设':'未预设';
  if(a.squeezed) result.squeezed=a.squeezed;
  const locks=(projectRecoveryLocks(a.state)??a.recoveryLocks??[]).filter(x=>x.count>0);
  if(locks.length) result.recoveryLocks=clone(locks);
  return result;
}

function matchups(actors,b) {
  return actors.flatMap(a=>actors.filter(t=>t.team!==a.team&&(a.id===b.activeId||t.id===b.activeId)).map(t=>{
    const p=attackProfile(b,a.id,{targetId:t.id}), d=resolveDefense(b,t.id,a.id,p);
    if(d.pending)return {attackerId:a.id,targetId:t.id,pendingDefense:true};
    return {attackerId:a.id,targetId:t.id,distanceM:Number(spatialDistance(b.map,a.position,t.position).toFixed(2)),
      inReach:spatialDistance(b.map,a.position,t.position)<=a.reach+1e-8,
      attackDP:p.rawDP,defenseDP:d.total,rollDP:p.rawDP-d.total,
      attackAuto:p.fixed,defenseAuto:d.extraSuccesses,damageCap:p.cap,
      ...(p.aggravate?{aggravate:p.aggravate}:{})};
  }));
}

export function currentContext(b) {
  const actors=Object.values(b.actors).filter(a=>a.present);
  return { scenario:b.scenario, round:b.round, activeId:b.activeId,status:b.status,
    panelNotes:'面板已计当前增益及减益；defense是未指定攻击者的防御。matchups为当前行动者与敌方的普通攻击对位，已计连击、先攻与穿透；rollDP是投骰池，非伤害，非正数投幸运骰。weaponReady/inReach只说明武器与距离，能否行动以legalOptions为准。cooldowns是剩余轮数；actions为当前余量，可标准→移动→迅捷换用。',
    participants:actors.map(a=>compactPanel(b,a)),
    matchups:matchups(actors,b),
    abilities:Object.fromEntries([...new Set(actors.flatMap(a=>availableActorActions(a)))].map(id=>[id,b.actors[b.activeId]?.abilityDefinitions?.[id]??ABILITIES[id]])),
    passiveRules: Object.fromEntries(Object.entries({
      jiang:'拳掌含龙象：力判＋12、忽略4指定伤害防护、实伤后2L和4晕眩；红鹤高速4；破身恶化须破尽盔甲；每轮医疗1B/L。同目标每次攻击加下次增强1，封顶5。',
      huang:'刀身及攻击上限以当前面板为准；先攻高于攻击者基础防御＋5；防御附成3。灵力可用payment:"restraint"代付，但精神束缚会减攻防和速度，超过意志5定身。',
    }).filter(([id])=>b.actors[id]?.present&&b.actors[id].ruleset!=='opening-20261022'&&attackProfile(b,id).legacyCompatible)),
  };
}

export function renderResult(value) {
  const r=value.result??value;
  const name=id=>r.after.participants.find(a=>a.id===id)?.name??({huang:'黄泉',jiang:'姜子尤',lotus:'乱红莲'}[id]??id);
  if(r.after.awaiting) return `${name(r.actorId)}宣言${ABILITIES[r.abilityId]?.name??r.abilityId}；等待${name(r.after.awaiting)}选择受击反应。尚未掷骰或扣除攻击资源。`;
  if(['enter','leave','parameters'].includes(r.abilityId)) return r.notes.join('。')+'。';
  const changes=r.damage.map(x=>`${name(x.targetId)}承受${x.actualDamage}${x.severity}`).join('，')||'无新增伤害';
  const state=r.after.participants.map(a=>`${name(a.id)}：完好${a.health.intact}/B${a.health.B}/L${a.health.L}/A${a.health.A}；能量${Object.entries(a.energy).map(([k,v])=>`${k}${v.current}`).join('、')||'无'}；动作${a.actions.standard}/${a.actions.move}/${a.actions.swift}；位置${a.position}；状态${a.statuses?.map(s=>`${s.type}${s.points}`).join('、')||'无'}`).join('\n\n');
  const victor=r.after.participants.filter(a=>a.team===r.after.winner).map(a=>name(a.id)).join('、')||r.after.winner;
  return `第${r.round}轮 · ${name(r.actorId)}使用${ABILITIES[r.abilityId]?.name??r.abilityId}：${changes}。\n\n${state}\n\n${r.after.status==='finished'?`演练结束，胜方：${victor}。`:`下一行动者：${name(r.after.activeId)}。`}\n\n<details><summary>结算明细（程序记录）</summary>\n\n<rules901_detail>\n\`\`\`json\n${JSON.stringify(r,null,2)}\n\`\`\`\n</rules901_detail>\n\n</details>`;
}
