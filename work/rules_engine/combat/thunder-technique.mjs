import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {RESOURCE_DATA} from '../resource-data.mjs';
import {weaponHandling} from '../resource-weapons.mjs';
import {equipment,profile,value,skill,IllegalAction,RuleInputError} from './mechanics.mjs';

// Versioned clauses, not an executor. Existing attack, payment, protection,
// paralysis, reaction and MVU transaction code remain the only execution chain.
// Capture version identities from the generated data-only module. Runtime
// clauses still go through the ABI-checked registry; mechanics can import this
// reader for initiative without dereferencing that registry during its cycle.
const definition=RESOURCE_DATA['huang.thunder_sword'];
export const THUNDER_ADAPTED=Object.freeze({definitionId:'huang.thunder_sword',version:definition?.contractVersion,readingHash:definition?.reading?.sha256});

function compiledTerms(def){
 const t=def?.technique,p=t?.effects?.[0]?.params;
 if(t?.schemaVersion!=='901-weapon-technique/1'||t.mode!=='active'||t.action!=='standard'||t.effects?.length!==1||t.effects[0].op!=='weapon_technique'||
  p?.attack!=='melee_blades'||p.weapon!=='katana'||p.attacksPerTarget!==1||p.damageCap!=='current_weapon_native_cap'||p.protection!=='normal'||
  p.bonusType!=='增强'||p.paralysisBasis!=='actual_electric_damage'||p.save!=='fortitude'||!Number.isFinite(p.attackDP)||p.attackDP<0||
  !Number.isFinite(p.maxElectricFraction)||p.maxElectricFraction<0||p.maxElectricFraction>1||
  typeof t.cost?.sourcePool!=='string'||!t.cost.sourcePool||!Number.isSafeInteger(t.cost.amount)||t.cost.amount<0||!Number.isSafeInteger(t.cooldownRounds)||t.cooldownRounds<0)
  throw new RuleInputError('雷鸣剑编译条款缺失或当前旧JS不支持','definition.technique');
 return {t,p};
}

// Trusted authoring/migration helper. Returns a candidate; never writes MVU,
// grants ownership, changes the character ruleset or refreshes any resource.
export function adoptThunderTechnique(actor){
 if(!actor?.abilities?.includes('thunder'))throw new IllegalAction('须已持有雷鸣剑，规则采用不授予技能');
 if(actor.techniqueBindings?.thunder)thunderTerms(actor);
 const next=structuredClone(actor);
 next.techniqueBindings={...next.techniqueBindings,thunder:{...THUNDER_ADAPTED}};
 thunderTerms(next);
 return next;
}

export function thunderTerms(actor,command={}){
 const binding=actor.techniqueBindings?.thunder,adapted=binding!==undefined;
 let shared;
 if(adapted){
  const def=RESOURCE_DEFINITIONS[THUNDER_ADAPTED.definitionId];
  if(!binding||Object.keys(binding).length!==3||Object.entries(THUNDER_ADAPTED).some(([k,v])=>binding[k]!==v)||
    def?.contractVersion!==binding.version||def.reading?.sha256!==binding.readingHash)
   throw new RuleInputError('雷鸣剑适配条款版本或来源不符','techniqueBindings.thunder');
  shared=compiledTerms(def);
  if(!actor.abilities?.includes('thunder'))throw new IllegalAction('须已持有雷鸣剑');
  const w=equipment(actor).weapon,actual=!!(w.instanceId||w.resourceId||w.unarmed);
  const main=actual?w.skill:w.skill??profile(actor).main,sub=actual?w.sub:w.sub??profile(actor).sub;
  if(w.unarmed||main!=='白刃'||sub!=='太刀'||['bow','gun','natural','thrown'].includes(w.type))throw new IllegalAction('适配雷鸣剑须使用实际太刀作近战白刃攻击');
  if(command.tier!==undefined)throw new IllegalAction('未接通或取得的二之太刀不可由动作请求启用');
 }else if(command.electricFraction!==undefined)throw new IllegalAction('电击比例选择须已采用适配条款');
 if(!adapted&&actor.kind!=='huang')return null;
 const opening=actor.ruleset==='opening-20261022',oldValue=opening?4:15;
 const source=THUNDER_ADAPTED.definitionId,contribution={sourceInstanceId:actor.state.learnedResources?.[source]?.instanceId??'legacy-technique/'+actor.id+'/thunder',clauseId:'attack-enhancement',consumer:'attack'};
 const legacy={source,stat:'attack',origin:'legacy',value:oldValue,...(adapted?{group:'enhancement'}:{}),contribution};
 const fraction=command.electricFraction??shared?.p.maxElectricFraction??0.5;
 if(adapted&&(!Number.isFinite(fraction)||fraction<0||fraction>shared.p.maxElectricFraction))throw new IllegalAction('雷鸣剑转电比例超过已采用条款');
 return {adapted,contributions:[legacy,...(adapted?[{...legacy,origin:'definition',value:shared.p.attackDP,provenance:{...THUNDER_ADAPTED}}]:[])],
  electricMode:adapted||!opening?'fraction':'fixed',electric:adapted?fraction:opening?2:0.5,
  cost:adapted?{pool:shared.t.cost.sourcePool,amount:shared.t.cost.amount}:{pool:'灵力',amount:1},cooldownRounds:adapted?shared.t.cooldownRounds:1};
}

// The remaining legacy techniques use the same compiled source and the same
// trusted actor binding. These functions only read clauses; they do not settle
// attacks, pay, roll dice, grant qualifications, or write a save.
const sharedIds={cleaveRock:'huang.rock_cleaver',iai:'huang.iai',kuanglan:'kuanglan'};
const sharedVersions=Object.fromEntries(Object.entries(sharedIds).map(([key,id])=>[key,Object.freeze({definitionId:id,version:RESOURCE_DATA[id]?.contractVersion,readingHash:RESOURCE_DATA[id]?.reading?.sha256})]));
const finite=n=>Number.isFinite(n)&&n>=0;
function sharedTechnique(a,key){
 const binding=a.techniqueBindings?.[key];if(binding===undefined)return null;
 const expected=sharedVersions[key],d=RESOURCE_DEFINITIONS[expected.definitionId],t=d?.technique;
 if(!binding||Object.keys(binding).some(k=>!['definitionId','version','readingHash','evidence'].includes(k))||
  Object.entries(expected).some(([k,v])=>binding[k]!==v)||d?.contractVersion!==binding.version||d.reading?.sha256!==binding.readingHash||
  t?.schemaVersion!=='901-weapon-technique/1'||!Array.isArray(t.effects)||!t.effects.length||!Array.isArray(t.limits)||
  !Array.isArray(t.optionalAcquiredBranches)||t.optionalAcquiredBranches.some(b=>b.canActivate!==false))throw new RuleInputError('技能编译条款、版本或来源不符','techniqueBindings.'+key);
 const e=binding.evidence;
 if(typeof e?.sourceRef!=='string'||!e.sourceRef||typeof e.weaponRef!=='string'||!e.weaponRef)throw new RuleInputError('须可信的已有技能与武器资格来源','techniqueBindings.'+key+'.evidence');
 const owns=key==='iai'?a.abilities?.includes('draw'):key==='kuanglan'?a.abilities?.some(x=>['gale','tornado'].includes(x)):a.abilities?.includes(key);
 if(!owns)throw new IllegalAction('规则采用不授予未持有的技能');
 return {t,e,binding,p:t.effects[0].params};
}
function currentWeapon(a,e){
 const w=equipment(a).weapon,actual=!!(w.instanceId||w.resourceId||w.unarmed),ref=w.instanceId??w.resourceId??'legacy-weapon/'+a.id;
 return {w,actual,matched:!w.unarmed&&e.weaponRef===ref,main:actual?w.skill:w.skill??profile(a).main,sub:actual?w.sub:w.sub??profile(a).sub};
}
export function techniqueContributions(a,key,stat,clauseId,oldValue,newValue,group){
 const source=sharedIds[key],binding=a.techniqueBindings[key],row={source,stat,group,origin:'legacy',value:oldValue,
  contribution:{sourceInstanceId:a.state.learnedResources?.[source]?.instanceId??'legacy-technique/'+a.id+'/'+key,clauseId,consumer:stat}};
 return [row,{...row,origin:'definition',value:newValue,provenance:{definitionId:binding.definitionId,version:binding.version,readingHash:binding.readingHash}}];
}
export function adoptWeaponTechnique(actor,key,evidence){
 if(!sharedIds[key])throw new RuleInputError('未支持的条款绑定','technique');
 if(actor.techniqueBindings?.[key])sharedTechnique(actor,key);
 const next=structuredClone(actor);next.techniqueBindings={...next.techniqueBindings,[key]:{...sharedVersions[key],evidence:structuredClone(evidence)}};
 if(key==='cleaveRock')rockTerms(next);else if(key==='iai'){if(!iaiTerms(next).applicable)throw new IllegalAction('须补齐当前居合资格及适用武器');}else galeTerms(next,next.abilities.includes('gale')?'gale':'tornado');
 return next;
}
export function rockTerms(a,c={}){
 const s=sharedTechnique(a,'cleaveRock');if(!s)return null;
 const {t,p,e}=s,{w,actual,matched,main,sub}=currentWeapon(a,e);
 if(t.mode!=='active'||t.action!=='standard'||t.effects.length!==1||t.effects[0].op!=='weapon_technique'||p.attack!=='melee_blades'||p.weapon!=='katana'||p.hands!==2||p.attacksPerTarget!==1||
  p.damageCap!=='current_weapon_native_cap'||p.protection!=='normal'||!Array.isArray(p.tags)||p.tags.some(x=>x!=='威猛')||
  ![p.weaponValueDelta,p.armorPenetration,p.ignoreReductionOrHardness].every(finite)||typeof t.cost?.sourcePool!=='string'||!t.cost.sourcePool||!Number.isSafeInteger(t.cost.amount)||t.cost.amount<0||!Number.isSafeInteger(t.cooldownRounds)||t.cooldownRounds<0)
  throw new RuleInputError('斩岩编译条款不受当前消费者支持','definition.technique');
 const hands=actual?(w.grip?.source?w.grip.hands:undefined):e.hands;
 if(!matched||main!=='白刃'||sub!=='太刀'||['bow','gun','natural','thrown'].includes(w.type)||hands!==p.hands)throw new IllegalAction('斩岩须用已有实际太刀双手近战');
 if(c.tier!==undefined)throw new IllegalAction('未取得或未接通的二之太刀不能启用');
 return {...s,contributions:techniqueContributions(a,'cleaveRock','weapon','weapon-value',a.ruleset==='opening-20261022'?0:2,p.weaponValueDelta),cost:{pool:t.cost.sourcePool,amount:t.cost.amount},cooldownRounds:t.cooldownRounds};
}
export function iaiTerms(a){
 const s=sharedTechnique(a,'iai');if(!s)return null;
 const {t,p,e}=s,q=t.prerequisites,{w,actual,matched,main,sub}=currentWeapon(a,e);
 if(t.mode!=='triggered'||t.action!=='passive_weapon_trigger'||t.cost!==null||t.cooldownRounds!==null||t.effects.length!==1||t.effects[0].op!=='drawn_weapon_first_strike'||
  p.weapon!=='slender_curved_blade'||p.twoHandKatanaLengthException!=='existing_training_only'||p.normalWieldingRequired!==true||p.initiativeCondition!=='wear_applicable_weapon'||p.initiativeBonusType!=='修行'||
  p.attack!=='first_melee_blades_attack_in_unsheathing_turn'||p.bonusType!=='招式'||p.aggravateCondition!=='initiative_ahead_of_target'||p.defensePenaltyStarts!=='after_strike'||p.defensePenaltyExpires!=='next_own_action_start'||p.grantsQuickDraw!==false||p.grantsExtraAttack!==false||
  ![p.oneHandBladeMaxArmspanFraction,p.initiativeBonus,p.attackDP,p.aggravateMaxL,p.defensePenalty,q?.DEX,q?.PRE,q?.WIL,q?.effectiveBlades].every(finite)||q.bladeSubskill!=='existing_qualification'||q.quickDraw!=='existing_qualification')throw new RuleInputError('居合编译条款不受当前消费者支持','definition.technique');
 if(e.quickDraw!==true||e.bladeQualification!==true||typeof e.wearing!=='boolean'||!finite(e.legacyInitiativeContribution))throw new RuleInputError('居合须已有快拔、刀剑与旧先攻贡献依据','techniqueBindings.iai.evidence');
 const qualified=value(a,'敏捷')>=q.DEX&&value(a,'风度')>=q.PRE&&value(a,'意志')>=q.WIL&&skill(a,'白刃',sub).level>=q.effectiveBlades;
 // Normal wielding uses the established consumer, including its legal
 // strength-deficit penalties. Invalid grip data cannot grant initiative.
 if(actual&&matched)weaponHandling(w,{strength:value(a,'力量')});
 const hands=actual?(w.grip?.source?w.grip.hands:w.hands):e.twoHandKatanaTraining?2:1;
 const length=hands===2&&sub==='太刀'&&e.twoHandKatanaTraining===true||hands===1&&finite(e.bladeLength)&&finite(e.armspan)&&e.armspan>0&&e.bladeLength<=e.armspan*p.oneHandBladeMaxArmspanFraction;
 const applicable=qualified&&matched&&main==='白刃'&&sub==='太刀'&&!['bow','gun','natural','thrown'].includes(w.type)&&length&&e.wearing;
 return {...s,applicable,initiativeContributions:techniqueContributions(a,'iai','initiative','worn-initiative',e.legacyInitiativeContribution,applicable?p.initiativeBonus:0,'training')};
}
export function galeTerms(a,mode){
 const s=sharedTechnique(a,'kuanglan');if(!s)return null;
 const {t,e}=s,p=t.effects.find(x=>x.params?.mode===mode)?.params,{w,matched,main}=currentWeapon(a,e);
 if(t.mode!=='active'||t.action!=='standard'||t.cooldownRounds!==null||t.effects.length!==2||t.effects.some(x=>x.op!=='weapon_technique')||!p||p.weapon!=='usable_current_qifeng'||p.attack!=='blades'||p.exclusiveModes!==true||p.damageCap!=='current_weapon_native_cap'||p.protection!=='normal'||p.damageType!=='current_weapon'||p.duration!=='this_attack_only'||p.drawIfSheathed!=='within_same_action'||p.stackLegacyReduction!==false||p.requiresLocalization!==true||p.requiresLineOfEffect!==true||p.excludeAllies!==true||p.separateRolls!==true||p.attacksPerTarget!==1||p.paymentsPerAction!==1||
  p.targets!==(mode==='gale'?'all_eligible_enemies_in_radius':'one_eligible_enemy')||p.bonusType!==(mode==='gale'?'招式':'none')||p.defenseReductionType!==(mode==='gale'?'combined_multiattack_and_environment':'unspecified_total')||![p.rangeMeters,p.attackDP,p.defenseReduction].every(finite)||t.cost?.sourcePool!=='eligible_melee_concept_regular_energy'||!Number.isSafeInteger(t.cost.amount)||t.cost.amount<0)
  throw new RuleInputError('狂岚编译条款不受当前消费者支持','definition.technique');
 if(!Array.isArray(e.resourcePools)||!e.resourcePools.length||new Set(e.resourcePools).size!==e.resourcePools.length||e.resourcePools.some(n=>typeof n!=='string'||!a.state.resources?.[n]))throw new RuleInputError('须既有合用能量池的可信映射','techniqueBindings.kuanglan.evidence.resourcePools');
 if(!matched||main!=='白刃'||['bow','gun','natural','thrown'].includes(w.type))throw new IllegalAction('狂岚须使用可信绑定的当前弃风');
 return {...s,p,contributions:techniqueContributions(a,'kuanglan','attack','mode-'+mode,mode==='gale'?3:0,p.attackDP,'technique'),cost:t.cost.amount};
}

export function techniqueDescription(a,id){
 if(!a)return null;
 const key=id==='draw'?'iai':['gale','tornado'].includes(id)?'kuanglan':id;
 if(!sharedIds[key]||!a.techniqueBindings?.[key])return null;
 const {t}=sharedTechnique(a,key),p=t.effects.find(x=>key!=='kuanglan'||x.params.mode===id).params;
 const limits=t.limits.join('');
 if(key==='cleaveRock')return {name:'斩岩剑（适配版）',action:`标准＋${t.cost.amount}${t.cost.sourcePool}`,text:`双手太刀近战；武器伤害＋${p.weaponValueDelta}、破甲${p.armorPenetration}、${p.tags.join('、')}，该击忽略${p.ignoreReductionOrHardness}点减免或硬度，冷却${t.cooldownRounds}轮。${limits}`};
 if(key==='iai')return {name:'拔刀（居合适配版）',action:'沿既有拔刀资格',text:`佩带适用武器先攻＋${p.initiativeBonus}修行；出鞘当回合首次白刃攻击＋${p.attackDP}招式，先攻高时至多${p.aggravateMaxL}L恶化为A；该击后防御－${p.defensePenalty}至下次本人行动。${limits}`};
 return {name:id==='gale'?'狂岚·群袭（适配版）':'狂岚·聚风龙卷（适配版）',action:`标准＋${t.cost.amount}合用能量`,text:`${p.rangeMeters}米内${id==='gale'?'每个合法敌人':'单个合法敌人'}，攻击＋${p.attackDP}，本次减防${p.defenseReduction}，使用当前弃风，每目标一次攻击、全动作一次支付。${limits}`};
}
