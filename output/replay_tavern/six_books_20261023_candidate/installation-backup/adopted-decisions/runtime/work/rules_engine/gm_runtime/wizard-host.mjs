import {createCharacter,beginTurn,check,rollPool,spendAction} from '../core.mjs';
import {WIZARD_FORMS} from '../wizard-rules.mjs';
import {RuleInputError,IllegalAction} from '../combat/mechanics.mjs';
const need=(m,k)=>{throw new RuleInputError(m,k);},fail=m=>{throw new IllegalAction(m);};
export function runWizard(root,r,o,a,{combat,preActionCleared,drawDice,mana,cast,paid}){
 let result,action;
 if(o.equipped!==true)need('须实际佩戴驱动器并持有所选戒指','wizard.equipped');
 if(o.sensingHandAvailable===false)fail('戒指感应所需的手当前不可使用');
 if(['transform','shift'].includes(r.operation)){
   if(!WIZARD_FORMS[r.part]||!o.forms?.includes(r.part))fail('没有实际持有该形态戒指');
   if(r.operation==='transform'){
     if(a.state.wizard?.form)fail('已经变身，换属性使用shift');action='standard';paid(a,action,combat,preActionCleared);mana(a,o,3);
     a.state.wizard={form:r.part,source:o.source,objectId:r.objectId,weaponMode:'sword',weaponSkills:structuredClone(o.weaponSkills??{})};result={cost:3,form:r.part,instantUninterruptible:true};
   }else{
     if(!a.state.wizard?.form)fail('尚未变身');action='swift';paid(a,action,combat,preActionCleared);mana(a,o,0);a.state.wizard.form=r.part;result={form:r.part,cost:0,instantUninterruptible:false};
   }
 }else if(['drawWeapon','weaponMode'].includes(r.operation)){
   if(!a.state.wizard?.form||o.swordGunOwned!==true)need('须实际变身并拥有Wizard剑枪','wizard.weapon');
   if(!['sword','gun'].includes(r.part))fail('剑枪模式须选sword或gun');action='swift';paid(a,action,combat,preActionCleared);mana(a,o,0);a.state.wizard.weaponMode=r.part;a.state.wizard.weaponDrawn=true;result={weaponMode:r.part};
 }else if(r.operation==='end'){
   if(!o.ending?.source||!o.ending.action)need('解除变身的动作须有实际采用规则','wizard.ending');action=o.ending.action;paid(a,action,combat,preActionCleared);delete a.state.wizard;delete a.state.timedEffects?.wizardDefend;result={transformed:false};
 }else if(r.operation==='defend'){
   if(!a.state.wizard?.form)fail('Defend须使用当前已变身属性');
   const p=o.plans?.[r.part];if(a.state.wizard.form==='earth'&&(!p?.source||!p.wall))need('土Defend须按实际方向登记掩蔽土层位置','defend.wall');
   action='standard';paid(a,action,combat,preActionCleared);mana(a,o,1);const roll=cast(a,o,drawDice);if(!roll.eligible)fail(roll.reason);
   if(roll.total>0){(a.state.timedEffects??={}).wizardDefend={form:a.state.wizard.form,source:o.source,remainingMinutes:roll.total/10,...(combat?{remainingTurns:roll.total,clockActorId:r.actorId}:{})};
     if(a.state.wizard.form==='earth'){
       if(!root.map)need('土Defend须有实际场景地图','map');
       const wall={...structuredClone(p.wall),id:`wizard-wall/${r.actorId}/${root.round??0}`,kind:'obstacle',label:'Defend土层',blocksMovement:true,blocksSight:true,durability:{current:20,max:20,hardness:10},wizardOwner:r.actorId,source:o.source};root.map.features.push(wall);
     }
   }result={cost:1,roll,rounds:roll.total,form:a.state.wizard.form};
 }else if(r.operation==='garuda'){
   if(!o.garudaId)need('须给本场使魔一个稳定实例ID','garudaId');if(root.actors[o.garudaId]?.present)fail('当前已有此使魔');
   if(combat&&!Number.isFinite(o.garudaInitiative))need('原条目未给使魔先攻，须登记本场采用值','garudaInitiative');
   action='standard';paid(a,action,combat,preActionCleared);mana(a,o,1);
   const state=createCharacter({attributes:{力量:1,敏捷:4,智力:0,感知:0,意志:0,风度:0},size:1,skills:{},resources:{},health:{intact:15,B:0,L:0,A:0,temp:0}});state.derived.hpMax=15;
   const g={id:o.garudaId,name:'迦楼罗',kind:'garuda',ruleset:'opening-20261022',state:beginTurn(state).state,ownerId:r.actorId,team:a.team,controller:a.controller,present:true,position:[...(a.position??a.state.position??[0,0])],initiativeOverride:o.garudaInitiative,
     construct:true,sceneBound:true,flight:true,parameters:{garudaActions:structuredClone(o.garudaActions??{})},combatProfile:{hpFixed:15,speed:24,initiative:0,natural:9,main:'肉搏',cap:0,equipment:{weapon:{damage:0,ap:0,magic:0},armor:{defense:0,hardness:4}}},
     rangedNatural:12,abilities:['move','garudaScout','garudaHide','garudaInterfere','end'],buffs:{},expires:{},cooldowns:{},used:{},combos:{},reactions:{},reach:0};
   root.actors[o.garudaId]=g;if(combat){root.order.push(g.id);root.order.sort((x,y)=>(root.actors[y].initiativeOverride??root.actors[y].state.derived.initiative)-(root.actors[x].initiativeOverride??root.actors[x].state.derived.initiative));}result={cost:1,summoned:g.id,sceneBound:true};
 }else if(r.operation==='interceptItem'){
   if(a.state.timedEffects?.wizardDefend?.form!=='fire')fail('没有持续的火Defend');
   const p=o.plans?.[r.part],item=root.ruleScene?.objects?.[p?.itemId];if(!p?.source||p.approaching!==true||!item?.source||!Number.isFinite(item.hardness))need('须登记实际靠近火罩的物品及硬度','incomingItem');
   if(item.hardness<=2)item.destroyed=true;result={itemId:p.itemId,destroyed:item.destroyed===true};action='free';
 }else if(r.operation==='environment'){
   if(!a.state.wizard?.form)fail('须已变身');const p=o.plans?.[r.part];
   if(!p?.source||!['space','underwater'].includes(p.environment)||p.environment==='underwater'&&typeof p.pressureNotTooHigh!=='boolean')need('须登记实际环境；原文未给过高水压的数值界线','environment');
   result={survival:p.environment==='space'||p.pressureNotTooHigh===true,source:o.source};action='free';
 }else if(r.operation==='garudaCheck'){
   const g=root.actors[o.garudaId];if(!g?.present)fail('使魔不在本场');const pools={scout:[7,1],hide:[6,1],reflex:[6,0]},p=pools[r.part];if(!p)fail('使魔只执行已有侦查、隐藏、反射数值');
   const roll=rollPool(p[0],drawDice());result={actorId:g.id,roll:{...roll,autoSuccesses:p[1],total:roll.rolledSuccesses+p[1]}};action='free';
 }else return null;
 return {objectId:r.objectId,type:o.type,operation:r.operation,action,...result};
}
