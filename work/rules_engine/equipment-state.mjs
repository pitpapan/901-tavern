// RE 物品和装备位 144–269; adopted for equipment changes 2026-11-06.
// First live slice: sourced, single-layer physical armor outside combat. Other
// slots/layered armor retain their rules but are not silently flattened here.
const text=x=>typeof x==='string'&&x.trim().length>0;
const need=message=>{throw Object.assign(new Error(message),{code:'NEEDS_INPUT'});};
const unsupported=message=>{throw Object.assign(new Error(message),{code:'UNAVAILABLE'});};
export const EQUIPMENT_SOURCE='901_rules_source_library/content/RE/01_rules/04_附录/物品和装备位.md:144–269';

// Explicit opt-in for a NEW branch at the confirmed pre-removal opening anchor.
// Never called to backfill an arbitrary existing chat or on page refresh.
export function openingArmorRegistration(){
 return {equipmentState:{version:1,managedSlots:['armor'],source:EQUIPMENT_SOURCE},
  possessions:{items:[{id:'opening.imperial-light-armor',name:'帝国制式轻甲',
   aliases:['帝国制式盔甲','帝国制式铠甲','帝国制式甲','铠甲','盔甲','护甲'],slot:'armor',armorClass:'light',
   armor:{defense:3},location:'carried',worn:true,
   source:'work/character_builder/real_character/御临风_初始卡_20261021.txt:86; work/replay_research/opening_roster_p1_001_016.md:25,29; work/replay_research/opening_scene_evidence.md:18',
   appearance:'饱经战损；未确认数值损坏'}]}};
}

export function equipmentRequestValid(r){
 return r?.kind==='rule'&&r.action==='equipment'&&r.actorId==='player'&&Array.isArray(r.steps)&&r.steps.length>0&&r.steps.length<=8&&
  r.steps.every(s=>s&&Object.keys(s).every(k=>['operation','itemId','sourceQuote'].includes(k))&&
   ['equip','unequip'].includes(s.operation)&&text(s.itemId)&&text(s.sourceQuote));
}
function physicalText(input){
 return String(input??'').replace(/\[[\s\S]*?\]|【[\s\S]*?】/g,'').replace(/“[^”]*”|「[^」]*」|『[^』]*』|"[^"]*"/g,'');
}
const verbs=/卸下|卸除|脱下|脱去|穿上|穿回|穿戴/g;
const isUnequip=verb=>/卸|脱/.test(verb);
export function equipmentDeclarations(input,state){
 const out=[];
 for(const clause of physicalText(input).split(/[，,。；;\n！？!?]/)){
  if(/是否|能否|可否|要不要|该不该|应该|打算|想要|准备|计划|假如|如果|等.+再|之后再|以后|别|不要|不想|没有|尚未|暂不|不(?:穿|脱|卸)|未(?:穿|脱|卸)/.test(clause))continue;
  for(const match of clause.matchAll(verbs)){
   const items=(state?.possessions?.items??[]).filter(i=>[i.name,...(i.aliases??[])].some(n=>n&&clause.includes(n)));
   if(!items.length&&!/铠甲|盔甲|护甲/.test(clause))continue;
   out.push({operation:isUnequip(match[0])?'unequip':'equip',clause,verb:match[0],itemIds:items.map(i=>i.id)});
  }
 }
 return out;
}
export function equipmentDeclarationMatches(request,input,state){
 if(!equipmentRequestValid(request))return false;
 const declarations=equipmentDeclarations(input,state);
 return declarations.length===request.steps.length&&declarations.every((d,i)=>{
  const s=request.steps[i];return d.operation===s.operation&&d.itemIds.length===1&&d.itemIds[0]===s.itemId&&
   physicalText(input).includes(s.sourceQuote)&&s.sourceQuote.includes(d.verb)&&
   (d.clause.includes(s.sourceQuote)||s.sourceQuote.includes(d.clause.trim()));
 });
}
export function equipmentStateSummary(state){
 if(!state.equipmentState)return null;
 return {managedSlots:state.equipmentState.managedSlots,items:(state.possessions?.items??[]).filter(i=>i.slot)
  .map(i=>({id:i.id,name:i.name,aliases:i.aliases,slot:i.slot,armorClass:i.armorClass,worn:i.worn,location:i.location}))};
}
function armorItems(state){
 if(!state.equipmentState?.managedSlots?.includes('armor'))return null;
 return (state.possessions?.items??[]).filter(i=>i.slot==='armor');
}
export function instanceArmor(state){
 const items=armorItems(state);if(items===null)return null;
 const worn=items.filter(i=>i.worn);
 if(worn.length>1)unsupported('多层盔甲需按RE层次、内层特性和逐层破甲结算；当前穿脱接口尚未接入，不合并为单件');
 if(!worn.length)return {defense:0};
 const item=worn[0];
 if(!item.source||item.location!=='carried'||!Number.isFinite(item.armor?.defense))need('穿戴护甲须有实际物品、来源和已确认的护甲数值');
 return {...item.armor,instanceId:item.id};
}
// Mutates only the reducer's private clone. The enclosing MVU transaction
// commits all steps and elapsed time once, or leaves the saved state untouched.
export function changeEquipment(root,request){
 if(root.battle&&root.battle.mode!=='story')unsupported('战斗中的穿脱须使用战斗动作预算；本接口仅支持非战斗');
 if(!equipmentRequestValid(request))need('请明确穿脱的实际装备');
 const state=root.actors[request.actorId]?.state;
 if(!state?.equipmentState)need('当前分支尚未登记实际装备；不从人物卡历史自动补发');
 const steps=[];
 for(const step of request.steps){
  const item=state.possessions?.items?.find(i=>i.id===step.itemId);
  if(!item?.source||item.location!=='carried')need('该装备没有登记为当前随身实际物品');
  if(item.slot!=='armor')unsupported('此装备位尚未接入穿脱执行，不按护甲规则套用');
  if(!['light','heavy'].includes(item.armorClass))need('须先核定这件盔甲的轻甲或重甲类别');
  if(typeof item.worn!=='boolean')need('须确认当前实际穿戴状态');
  const worn=step.operation==='equip';
  if(worn===item.worn)need(worn?'这件盔甲已经穿戴':'这件盔甲已经卸下');
  if(state.equippedResources?.armor)unsupported('已有资源护甲占位，须先明确对应实例，不能覆盖');
  if(worn&&armorItems(state).some(i=>i.id!==item.id&&i.worn))unsupported('多层着甲须核定兼容、内外层及完整规则；不能自动替换或叠加');
  instanceArmor(state);item.worn=worn;instanceArmor(state);
  steps.push({itemId:item.id,name:item.name,operation:step.operation,worn,location:item.location,
   elapsedMinutes:item.armorClass==='light'?1:5,source:EQUIPMENT_SOURCE});
 }
 return {steps,elapsedMinutes:steps.reduce((n,s)=>n+s.elapsedMinutes,0),armor:instanceArmor(state)};
}
