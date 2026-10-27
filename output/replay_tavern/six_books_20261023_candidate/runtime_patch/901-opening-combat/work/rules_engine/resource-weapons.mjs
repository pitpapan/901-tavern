import {effectValue,effectMatches,stackEffects,retainStrongerEffects} from './resource-effects.mjs';
import {RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {spendAction} from './core.mjs';

const need=(message,field)=>{const e=new Error(message);e.code='NEEDS_INPUT';e.field=field;throw e;};
const unavailable=message=>{const e=new Error(message);e.code='UNAVAILABLE';throw e;};
// PHB 非战斗行动与战斗行动 209–215; 即时备战 337–342. These
// declarative choices use the actual storage location and acquired feat only.
const DRAW_RULES=[
 {when:{test:'eq',left:{context:'access'},right:'backpack'},action:'full'},
 {when:{all:[{test:'gte',left:{context:'quickDraw'},right:1},{test:'in',left:{context:'access'},values:['worn','accessible']}]},action:'swift'},
 {when:{test:'eq',left:{context:'access'},right:'worn'},action:'move'},
 {when:{all:[{test:'eq',left:{context:'access'},right:'accessible'},{test:'eq',left:{context:'small'},right:true}]},action:'swift'},
];
export function equipWeaponInstance(actor,resourceId,plan,{combat=false,preActionCleared=false}={}){
 const item=weaponInstance(actor.state,plan.itemId);
 if(item.resourceId!==resourceId||item.location!=='carried')unavailable('该实例不是当前随身持有的对应装备');
 let action=null;
 if(combat){
  if(item.held)unavailable('该武器已经持握，不能重复拔取');
  if(typeof item.oneHanded!=='boolean'||!Number.isInteger(plan.availableHands))need('须实际武器持握需求与当前空闲手数','resource.equip.hands');
  if(plan.availableHands<(item.oneHanded?1:2))unavailable('没有足够的实际空闲手');
  const feat=actor.state.feats?.['即时备战'];
  action=DRAW_RULES.find(r=>effectMatches(r.when,actor.state,{...item,quickDraw:feat?.source?feat.level:0}))?.action;
  if(!action)need('须实际佩带或存放位置；不能把背包中的武器当成腰间武器','resource.equip.storage');
  const spent=spendAction(actor.state,action,{preActionCleared});if(!spent.result.allowed)unavailable(spent.result.reason);
  actor.state=spent.state;
 }else if(plan.completed!==true)need('须确认实际装备已完成','resource.equip.completed');
 const actual=weaponInstance(actor.state,plan.itemId);actual.held=true;
 actor.state.equippedWeaponId=actual.id;(actor.state.equippedResources??={}).weapon=resourceId;
 actor.sheathed=false;
 return {equipped:resourceId,itemId:actual.id,slot:'weapon',action};
}

export function weaponInstance(state,id){
 const item=state.possessions?.items?.find(x=>x.id===id);
 if(!item?.source||!(item.weapon||RESOURCE_DEFINITIONS[item.resourceId]?.equipment?.weapon)){
  const e=new Error('须有带来源的实际武器实例：'+id);e.code='NEEDS_INPUT';e.field='resource.weaponId';throw e;
 }
 return item;
}
function itemBonus(item,stat,state){
 const rows=(item.resourceEffects??[]).filter(e=>e.remainingRounds!==0&&e.remainingMinutes!==0).flatMap(e=>(e.effects??[])
  .filter(x=>x.stat===stat&&effectMatches(x.when,state,{weaponId:item.id})).map(x=>({...x,source:e.sourceId,value:effectValue(x.value,state,{weaponId:item.id})})));
 return stackEffects(rows).value;
}
export function instanceWeapon(state){
 if(!state.equippedWeaponId)return null;
 const item=weaponInstance(state,state.equippedWeaponId);
 if(item.location!=='carried'||item.held!==true){const e=new Error('所选武器当前没有实际持握');e.code='UNAVAILABLE';throw e;}
 const base=item.weapon??RESOURCE_DEFINITIONS[item.resourceId].equipment.weapon;
 return {...base,instanceId:item.id,resourceId:item.resourceId,
  ...(item.grip?{grip:item.grip}:{}),...(typeof item.oneHanded==='boolean'?{hands:item.oneHanded?1:2}:{}),
  damage:base.damage+itemBonus(item,'weaponDamage',state),
  explode:Math.min(base.explode??10,10-Math.min(2,itemBonus(item,'weaponExplodeReduction',state)))};
}
export function enchantWeapon(item,active){
 const old=(item.resourceEffects??[]).find(e=>e.sourceId===active.sourceId);
 retainStrongerEffects(active,old);
 item.resourceEffects=(item.resourceEffects??[]).filter(e=>e.sourceId!==active.sourceId);
 item.resourceEffects.push(active);
}

// PHB 非战斗行动与战斗行动148–150,166–174,178–180;
// PHB 基本规则29–30. Baseline grip uses the printed requirement. Alternative
// grip only applies when actual held hands and the weapon's normal grip exist.
export function weaponHandling(weapon,{strength,mode=weapon.type==='gun'?'firearm':weapon.type??'melee',rangeUnit,rangeUnits,distance=0}={}){
 let requirement=weapon.strengthRequirement??0,aimMultiplier=1,gripPenalty=0;
 const grip=weapon.grip;
 if(grip){
  if(!grip.source||![1,2].includes(grip.hands))need('须有来源的实际持握手数','resource.weapon.grip');
  if(mode==='bow'&&grip.hands!==2)unavailable('弓箭必须双手使用');
  if(mode!=='bow'){
   if(![1,2].includes(weapon.hands))need('须武器原本单手或双手要求','resource.weapon.hands');
   if(weapon.hands===1&&grip.hands===2){requirement=Math.max(0,requirement-1);if(mode==='thrown')gripPenalty=2;}
   if(weapon.hands===2&&grip.hands===1){
    if(!Number.isFinite(weapon.size))need('单手持用双手武器须实际体积','resource.weapon.size');
    requirement+=Math.floor(weapon.size/(mode==='firearm'?1:2));if(mode==='firearm')aimMultiplier=.5;
   }
  }
 }
 const deficit=Math.max(0,requirement-strength),strengthPenalty=deficit*2;
 const excess=rangeUnit>0?Math.max(0,Math.ceil(distance/rangeUnit)-1):0;
 return {requirement,deficit,strengthPenalty,gripPenalty,aimMultiplier,
  distancePenalty:['bow','thrown','firearm'].includes(mode)?2*deficit*excess:0,
  ...(rangeUnit>0&&Number.isFinite(rangeUnits)?{range:rangeUnit*Math.max(0,rangeUnits-(mode==='bow'?deficit:0))}:{})};
}

export function ordinaryWeaponType(weapon){
 if(weapon.type)return weapon.type==='firearm'?'gun':weapon.type;
 if(weapon.skill==='白刃')return 'melee';if(weapon.skill==='肉搏')return 'natural';
 return null;
}
// Ammunition is an actual carried counter; loading belongs to the selected
// instance. Swapping or transferring a bow cannot copy another bow's readiness.
export function weaponAmmoSpec(actor,weapon){
 if(weapon.instanceId||weapon.resourceId)return weapon.ammunition??(ordinaryWeaponType(weapon)==='bow'?{kind:'arrow',cost:1,loadingAction:'swift'}:null);
 return actor.kind==='bright'&&(!actor.weaponMode||actor.weaponMode==='bow')||actor.kind==='mireya'&&actor.weaponMode!=='club'?{kind:'arrow',cost:1,loadingAction:'swift'}:null;
}
export function weaponAmmoState(actor,weapon){
 const spec=weaponAmmoSpec(actor,weapon);if(!spec)return null;
 if(spec.kind!=='arrow')unavailable('这类弹药的存取尚未接入（实现缺口）');
 if(!Number.isInteger(actor.ammunition)||actor.ammunition<0)need('须提供当前实际普通箭数量','ammunition');
 const holder=weapon.instanceId?weaponInstance(actor.state,weapon.instanceId):actor;
 return {spec,holder,loaded:holder.loaded===true,available:actor.ammunition};
}
export function consumeWeaponAmmo(actor,weapon){
 const ammo=weaponAmmoState(actor,weapon);if(!ammo)return;
 if(!ammo.loaded)unavailable('须先为当前武器上箭');
 if(ammo.available<ammo.spec.cost)unavailable('没有可用箭矢');
 ammo.holder.loaded=false;actor.ammunition-=ammo.spec.cost;delete actor.aim;delete actor.calibration;
}
export function loadWeaponAmmo(actor,weapon,{preActionCleared=false,payAction}={}){
 const ammo=weaponAmmoState(actor,weapon);if(!ammo)unavailable('当前武器不使用已登记弹药');
 if(ammo.loaded||ammo.available<ammo.spec.cost)unavailable('当前武器已上箭或没有箭矢');
 if(payAction)payAction(ammo.spec.loadingAction);
 else {const spent=spendAction(actor.state,ammo.spec.loadingAction,{preActionCleared,context:actor.statusPermission});
 if(!spent.result.allowed)unavailable(spent.result.reason);actor.state=spent.state;}
 weaponAmmoState(actor,weapon).holder.loaded=true;
 return {kind:ammo.spec.kind,action:ammo.spec.loadingAction};
}
