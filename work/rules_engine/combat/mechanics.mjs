import {stackEffects} from '../resource-effects.mjs';
import {syncActorWounds} from '../resource-wounds.mjs';
import {resourceCapability} from '../resource-lifecycle.mjs';
import {instanceWeapon} from '../resource-weapons.mjs';
import {syncCounterConditions} from '../resource-counters.mjs';
import {resourceBonus,resourceEffects,RESOURCE_DEFINITIONS,resolveResourceContributions} from '../resource-definitions.mjs';
import { lifeStatus,statusLevel,geneticCheckBonus,effectiveAttribute, effectiveSkill,baseHealthCapacity,attrAuto,resizeHealthCapacity,activeResourceHealthBonus } from '../core.mjs';
import {wizardWeapon,wizardAttribute} from '../wizard-rules.mjs';

export class RuleInputError extends Error {
  constructor(message, field) { super(message); this.name='RuleInputError'; this.code='NEEDS_INPUT'; this.field=field; }
}
export class IllegalAction extends Error {
  constructor(message) { super(message); this.name='IllegalAction'; this.code='UNAVAILABLE'; }
}
export const value=(a,key)=>effectiveAttribute(a.state,key);
export const automatic=(a,key)=>attrAuto(a.state,key);
export const skill=(a,main,sub)=>effectiveSkill(a.state,main,sub);
// Fixed values here are resource bonuses, not copies of attributes or skills.
export const PROFILES={
  jiang:{hp:4,speed:22,initiative:4,will:10,main:'肉搏',sub:'拳击',natural:3,
    equipment:{weapon:{damage:7,attackBonus:0,blockBonus:0,ap:3,magic:0},armor:{defense:4}}},
  huang:{hp:2,speed:0,initiative:12,will:0,main:'白刃',sub:'太刀',natural:0,
    equipment:{weapon:{damage:8,attackBonus:3,blockBonus:3,ap:8,magic:8,size:3,willBonus:4},armor:{defense:8}}},
  lotus:{hp:0,speed:0,initiative:0,will:0,main:'肉搏',sub:'爪',natural:6,
    equipment:{weapon:{damage:6,attackBonus:0,blockBonus:0,ap:4,magic:4},armor:{defense:0}}},
  yulin:{hp:2,speed:10,initiative:0,will:0,main:'白刃',sub:'长剑',natural:0,
    equipment:{weapon:{damage:16,attackBonus:24,blockBonus:24,ap:8,magic:8,size:3,speedBonus:3,defenseReduction:3,force:2,energyAbsorb:2},
      armor:{defense:7,basePenalty:1,speedPenalty:2,dr:2,drBypass:'神兵',energyAbsorb:1}}},
  bright:{hp:1,speed:24,initiative:8,will:0,main:'射击',sub:'长弓',natural:0,
    equipment:{weapon:{type:'bow',damage:8,attackBonus:3,blockBonus:3,ap:0,magic:8,strengthRequirement:4,rangePerStrength:50},
      armor:{defense:4,dr:1,energyResistance:1,defenseAuto:1,reflexExtra:1}}},
};
export function profile(a) {
  let p=a.combatProfile??PROFILES[a.kind];
  if(!p) throw new RuleInputError(`未配置${a.name}的战斗资源`,`${a.id}.profile`);
  for(const [id,owned]of Object.entries(a.state.learnedResources??{}))if(owned.learned){
    const replacement=RESOURCE_DEFINITIONS[id]?.legacyProfile;
    if(replacement?.ruleset===a.ruleset&&replacement.kind===a.kind){
      p={...p,...replacement.set};for(const [key,n]of Object.entries(replacement.add??{}))p[key]=(p[key]??0)+n;
    }
  }
  return p;
}
export function equipment(a) {
  let eq=a.equipment??profile(a).equipment;
  for(const [slot,id]of Object.entries(a.state.equippedResources??{})){
   const item=RESOURCE_DEFINITIONS[id]?.equipment;if(!item||!a.state.learnedResources?.[id]?.learned)continue;
   if(slot==='weapon')eq={...eq,weapon:{...item.weapon,resourceId:id}};
   if(slot==='armor')eq={...eq,armor:{...item.armor,resourceId:id}};
  }
  const clothingId=a.state.equippedResources?.clothing,clothing=RESOURCE_DEFINITIONS[clothingId]?.equipment;
  if(clothing&&a.state.learnedResources?.[clothingId]?.learned)eq={...eq,armor:{...eq.armor,defense:Math.max(eq.armor.defense,clothing.armor.defense),ballisticProof:eq.armor.ballisticProof||clothing.armor.ballisticProof,energyWeaponProof:eq.armor.energyWeaponProof||clothing.armor.energyWeaponProof}};
  const instance=instanceWeapon(a.state);if(instance)eq={...eq,weapon:instance};
  if(a.state.wizard?.form){const old=equipment({...a,state:{...a.state,wizard:undefined}});return {...old,armor:{defense:8,ballisticProof:true,energyWeaponProof:true},weapon:wizardWeapon(a.state)??old.weapon};}
  if(!eq.weapon.instanceId&&!eq.weapon.resourceId&&a.ruleset==='opening-20261022'&&a.kind==='bright'&&['longknife','dagger','empty'].includes(a.weaponMode))
    return {...eq,weapon:{damage:a.weaponMode==='longknife'?2:a.weaponMode==='dagger'?1:0,attackBonus:a.weaponMode==='empty'?0:1,blockBonus:0,ap:0,magic:0}};
  if(!eq.weapon.instanceId&&!eq.weapon.resourceId&&a.kind==='mireya'&&a.weaponMode==='club')return {...eq,weapon:{damage:2,attackBonus:0,blockBonus:0,ap:0,magic:0}};
  return {...eq,weapon:{...eq.weapon,...(!eq.weapon.instanceId&&!eq.weapon.resourceId&&a.kind==='bright'&&Number.isInteger(a.parameters?.bowStrength)?{strengthRequirement:a.parameters.bowStrength}:{})}};
}
export function derived(a) {
  const p=profile(a), s=a.state, armor=equipment(a).armor;
  const strength=value(a,'力量'), agility=value(a,'敏捷');
  const speedBonus=resourceBonus(s,'speed',{},a.kind==='yulin'?{bodyMethod:10+(a.buffs.tengzhuan?20:0)}:{});
  if(a.ruleset==='opening-20261022')return {
    hpMax:(p.hpFixed??baseHealthCapacity(s.attributes.力量+wizardAttribute(s,'力量'),s.size??5,p.hpBonus??0))+2*resourceBonus(s,'attribute',{attribute:'力量'})+(s.geneticLock?.hpBonus??0),
    speed:speedBonus+strength+agility+(s.size??5)+(p.speed??0)+(a.kind==='yulin'&&a.buffs.tengzhuan?20:0),
    initiative:agility+value(a,p.initiativeAttribute??'风度')+(p.initiative??0)+resourceBonus(s,'initiative'),
    willMax:(p.willOverride??value(a,'意志')+value(a,'风度'))+resourceBonus(s,'willMax'),
  };
  return {
    hpMax:(s.size??5)+2*s.attributes.力量+2*Math.max(0,Math.floor((s.attributes.力量-1)/5))+p.hp+2*resourceBonus(s,'attribute',{attribute:'力量'})+(s.geneticLock?.hpBonus??0),
    speed:speedBonus+strength+agility+(s.size??5)+p.speed+(a.kind==='yulin'?2-(armor.speedPenalty??0)+(a.buffs.tengzhuan?20:0):0),
    initiative:(a.kind==='bright'?agility+value(a,'意志')+automatic(a,'敏捷')+p.initiative:agility+value(a,'风度')+p.initiative)+resourceBonus(s,'initiative'),
    willMax:value(a,'意志')+value(a,'风度')+p.will+resourceBonus(s,'willMax'),
  };
}
export function refreshDerived(a) {
  syncActorWounds(a);
  const d=derived(a);
  resizeHealthCapacity(a.state,d.hpMax);syncActorWounds(a);
  const activeBonus=activeResourceHealthBonus(a.state);
  if(activeBonus||Object.hasOwn(a.state,'resourceHealthBonus'))a.state.resourceHealthBonus=activeBonus;
  a.state.derived={...a.state.derived,...d};
  syncCounterConditions(a.state);a.state.will.max=d.willMax;
  a.state.will.current=Math.min(a.state.will.current,d.willMax);
}
export function attackSkill(a) { const p=profile(a);if(wizardWeapon(a.state)){const choice=a.state.wizard.weaponSkills?.[a.state.wizard.weaponMode];if(!choice?.main)throw new RuleInputError('须登记本人剑枪对应的实际技能/子技能','wizard.weaponSkills');return skill(a,choice.main,choice.sub);}const weapon=equipment(a).weapon;if((weapon.resourceId||weapon.instanceId)&&weapon.skill)return skill(a,weapon.skill,weapon.sub);return a.kind==='bright'&&a.ruleset==='opening-20261022'&&a.weaponMode&&a.weaponMode!=='bow'?skill(a,'白刃'):a.kind==='mireya'&&a.weaponMode==='club'?skill(a,'白刃','短棍'):skill(a,p.main,p.sub); }
export function blockValue(a) {
  const w=equipment(a).weapon;
  if(a.ruleset==='opening-20261022')return a.kind==='bright'?skill(a,'白刃').level:attackSkill(a).level+(w.blockBonus??0);
  if(a.kind==='huang') return attackSkill(a).level+w.blockBonus+automatic(a,'意志');
  if(a.kind==='yulin') return (a.buffs.zheng?skill(a,'学识',a.buffs.zhengSub).level:attackSkill(a).level)+w.blockBonus;
  return a.kind==='jiang'?attackSkill(a).level:skill(a,'肉搏').level;
}
export function combatRuleContext(a,details={}){
 const state=a.state,life=lifeStatus(state);
 const immobile=['麻痹','精神束缚','纠缠','冻结'].some(t=>statusLevel(state,t).severe);
 const incapacitated=life.state==='dead'||life.reason==='resource-condition'||!a.diehard&&life.state==='unconscious'||a.construct&&state.health.intact===0||['晕眩','剧痛'].some(t=>statusLevel(state,t).severe);
 const flat=details.flatFootedLevel!==undefined&&(resourceCapability(state,'flatFootedImmunity')?.level??-1)<details.flatFootedLevel;
 const canDodge=!immobile&&!incapacitated&&!flat&&!state.sleeping&&!state.underworld&&!statusLevel(state,'沮丧').severe;
 const baseDefense=details.baseDefense??Math.max(0,Math.min(value(a,'敏捷'),value(a,'感知'))-(equipment(a).armor.basePenalty??0))+geneticCheckBonus(state,{willEligible:true});
 const context={...details,baseDefense,canDodge,blocking:canDodge&&!!a.buffs?.block&&!a.sheathed};
 context.tags=[...new Set(resourceEffects(state,'tag',context).filter(e=>e.value>0).map(e=>e.tag))];
 return context;
}
// Bounded compatibility facts from the existing cards; no acquisition is created.
export function compatibleContribution(a,stat,context={}){
 const legacy=[];
 const add=(source,clauseId,value,group,provenance)=>legacy.push({source,stat,value,group,origin:'legacy',provenance,
  contribution:{sourceInstanceId:a.state.learnedResources?.[source]?.instanceId??source,clauseId,consumer:stat}});
 if(stat==='ignoreSpeed'&&a.kind==='yulin')add('legacy:legendary-evasion','ignore-speed',a.buffs?.bulletTime?8:5,undefined,
  '人物卡资料集_检索版.md:519–521；兼有子弹时间5改8');
 if(stat==='initiativeDefense'&&['huang','bright'].includes(a.kind)){
  const raw=a.combatProfile??PROFILES[a.kind],value=a.ruleset==='opening-20261022'?raw.initiativeDefense??0:5;
  if(value)add(a.kind+'.improved_initiative','initiative-defense',value,'feat','已确认旧卡精通先攻2级；只替换此防御条款');
 }
 return resolveResourceContributions(a.state,stat,context,legacy,{combine:'maximum'});
}
export function saveProfile(a,type,{recognizable=false,speed=0,mental=false,areaAttack=false,...details}={}) {
  const attributes=type==='reflex'?['敏捷']:type==='fort'?['力量']:['意志','风度'];
  const context=combatRuleContext(a,{...details,type,mental,areaAttack,incomingSpeed:speed,attribute:attributes.length===1?attributes[0]:undefined,attributes});
  const bonus=stackEffects(['save','attributeCheck'].flatMap(stat=>resourceEffects(a.state,stat,context))).value;
  if(type==='reflex')speed=Math.max(0,speed-compatibleContribution(a,'ignoreSpeed',context).value);
  if(a.kind==='garuda'&&type==='reflex')return {dp:6,fixed:0,extra:0};
  if(a.kind==='garuda'&&type==='will')throw new RuleInputError('迦楼罗没有心智属性，不能虚构意志骰池','garuda.will');
  let dp,fixed,extra=0;
  if(a.ruleset==='opening-20261022') {
    const key=type==='fort'?'力量':type==='reflex'?'敏捷':null;
    const arena=['radwick','mireya'].includes(a.kind);
    const sk=type==='fort'?skill(a,'求生',arena?'耐受':undefined):type==='reflex'?skill(a,'运动',arena?'自我保护':undefined):{level:0,auto:0};
    dp=key?value(a,key)+sk.level:value(a,'意志')+value(a,'风度')+(profile(a).steelWill??0);
    if(type==='reflex'&&a.kind==='yulin')dp+=(a.buffs.tengzhuan?4:2)+(a.buffs.flow??0)*2;
    fixed=key?automatic(a,key)+sk.auto:automatic(a,'意志')+automatic(a,'风度');
    return {dp:bonus+dp-(type==='reflex'?speed:0)+(type==='will'?(equipment(a).weapon.willBonus??0):0),fixed,extra:type==='reflex'?equipment(a).armor.athleticsExtra??0:0};
  }
  if(type==='fort') {
    dp=value(a,'力量')+skill(a,'求生').level+(a.kind==='jiang'?12+(a.spartanBonus??0):0);
    fixed=automatic(a,'力量')+skill(a,'求生').auto;
  } else if(type==='reflex') {
    dp=value(a,'敏捷')+skill(a,'运动',a.kind==='jiang'?'自我保护':undefined).level;
    if(a.kind==='yulin') dp+=(a.buffs.flow??0)*2+(a.buffs.tengzhuan?4:2);
    if(a.kind==='huang'&&recognizable) dp+=6;
    fixed=automatic(a,'敏捷')+skill(a,'运动').auto;
    extra=equipment(a).armor.reflexExtra??0;
    // 御临风的旧卡反射9已包含被动身法2，基础运动不再重复贡献。
    if(a.kind==='yulin') dp-=skill(a,'运动').level;
  } else {
    dp=value(a,'意志')+value(a,'风度')+(a.kind==='huang'?(equipment(a).weapon.willBonus??0):({jiang:6,yulin:2,bright:6,lotus:0}[a.kind]));
    fixed=automatic(a,'意志')+automatic(a,'风度');
  }
  return {dp:bonus+dp-(type==='reflex'?speed:0),fixed,extra};
}

export function rollCombatPool(dp,dice,threshold=10) {
  const luck=dp<=0;
  let pending=luck?1:dp,used=0,rolledSuccesses=0;
  while(pending>0) {
    const die=dice[used++];
    if(!Number.isInteger(die)||die<1||die>10) throw new Error('攻击骰源不足或无效');
    pending--;
    if(die===10||(!luck&&die>=threshold)) {rolledSuccesses++;pending++;}
    else if((!luck||used>1)&&die>=8) rolledSuccesses++;
  }
  return {dp,luck,dice:dice.slice(0,used),used,rolledSuccesses,luckMishap:luck&&dice[0]===1};
}
