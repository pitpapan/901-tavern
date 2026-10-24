import { effectiveAttribute, effectiveSkill,baseHealthCapacity } from '../core.mjs';

export class RuleInputError extends Error {
  constructor(message, field) { super(message); this.name='RuleInputError'; this.code='NEEDS_INPUT'; this.field=field; }
}
export class IllegalAction extends Error {
  constructor(message) { super(message); this.name='IllegalAction'; this.code='UNAVAILABLE'; }
}
export const value=(a,key)=>effectiveAttribute(a.state,key);
export const automatic=(a,key)=>{
  const level=n=>Math.max(0,Math.floor((n-1)/5));
  return Math.max(0,(a.state.attributeAuto?.[key]??level(a.state.attributes[key]))-level(a.state.attributes[key])+level(value(a,key)));
};
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
    equipment:{weapon:{damage:8,attackBonus:3,blockBonus:3,ap:0,magic:8,strengthRequirement:4,rangePerStrength:50},
      armor:{defense:4,dr:1,energyResistance:1,defenseAuto:1,reflexExtra:1}}},
};
export function profile(a) {
  const p=a.combatProfile??PROFILES[a.kind];
  if(!p) throw new RuleInputError(`未配置${a.name}的战斗资源`,`${a.id}.profile`);
  return p;
}
export function equipment(a) {
  const eq=a.equipment??profile(a).equipment;
  if(a.kind==='mireya'&&a.weaponMode==='club')return {...eq,weapon:{damage:2,attackBonus:0,blockBonus:0,ap:0,magic:0}};
  return {...eq,weapon:{...eq.weapon,...(a.kind==='bright'&&Number.isInteger(a.parameters?.bowStrength)?{strengthRequirement:a.parameters.bowStrength}:{})}};
}
export function derived(a) {
  const p=profile(a), s=a.state, armor=equipment(a).armor;
  const strength=value(a,'力量'), agility=value(a,'敏捷');
  if(a.ruleset==='opening-20261022')return {
    hpMax:p.hpFixed??baseHealthCapacity(s.attributes.力量,s.size??5,p.hpBonus??0),
    speed:strength+agility+(s.size??5)+(p.speed??0)+(a.kind==='yulin'&&a.buffs.tengzhuan?20:0),
    initiative:agility+value(a,p.initiativeAttribute??'风度')+(p.initiative??0),
    willMax:p.willOverride??value(a,'意志')+value(a,'风度'),
  };
  return {
    hpMax:(s.size??5)+2*s.attributes.力量+2*Math.max(0,Math.floor((s.attributes.力量-1)/5))+p.hp,
    speed:strength+agility+(s.size??5)+p.speed+(a.kind==='yulin'?2-(armor.speedPenalty??0)+(a.buffs.tengzhuan?20:0):0),
    initiative:a.kind==='bright'?agility+value(a,'意志')+automatic(a,'敏捷')+p.initiative:agility+value(a,'风度')+p.initiative,
    willMax:value(a,'意志')+value(a,'风度')+p.will,
  };
}
export function refreshDerived(a) {
  const d=derived(a), old=a.state.derived.hpMax;
  if(d.hpMax!==old) {
    const intact=a.state.health.intact+d.hpMax-old;
    if(intact<0) throw new RuleInputError('生命上限下降超过完好槽，须裁定既有伤势如何处理',`${a.id}.health`);
    a.state.health.intact=intact;
  }
  a.state.derived={...a.state.derived,...d};
  a.state.will.max=d.willMax;
  a.state.will.current=Math.min(a.state.will.current,d.willMax);
}
export function attackSkill(a) { const p=profile(a); return a.kind==='mireya'&&a.weaponMode==='club'?skill(a,'白刃','短棍'):skill(a,p.main,p.sub); }
export function blockValue(a) {
  const w=equipment(a).weapon;
  if(a.ruleset==='opening-20261022')return a.kind==='bright'?skill(a,'白刃').level:attackSkill(a).level+(w.blockBonus??0);
  if(a.kind==='huang') return attackSkill(a).level+w.blockBonus+automatic(a,'意志');
  if(a.kind==='yulin') return (a.buffs.zheng?skill(a,'学识').level:attackSkill(a).level)+w.blockBonus;
  return a.kind==='jiang'?attackSkill(a).level:skill(a,'肉搏').level;
}
export function saveProfile(a,type,{recognizable=false,speed=0}={}) {
  let dp,fixed,extra=0;
  if(a.ruleset==='opening-20261022') {
    const key=type==='fort'?'力量':type==='reflex'?'敏捷':null;
    const arena=['radwick','mireya'].includes(a.kind);
    const sk=type==='fort'?skill(a,'求生',arena?'耐受':undefined):type==='reflex'?skill(a,'运动',arena?'自我保护':undefined):{level:0,auto:0};
    dp=key?value(a,key)+sk.level:value(a,'意志')+value(a,'风度')+(profile(a).steelWill??0);
    if(type==='reflex'&&a.kind==='yulin')dp+=(a.buffs.tengzhuan?4:2)+(a.buffs.flow??0)*2;
    fixed=key?automatic(a,key)+sk.auto:automatic(a,'意志')+automatic(a,'风度');
    return {dp:dp-(type==='reflex'?speed:0),fixed,extra:0};
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
  return {dp:dp-(type==='reflex'?speed:0),fixed,extra};
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
