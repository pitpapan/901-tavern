import { act, panel, stateResult, opportunityActors } from './engine.mjs';
import { potentialTargets } from './runtime.mjs';
import { IllegalAction } from './mechanics.mjs';
import {canObserve,lastVisiblePoint,distance} from './map.mjs';

function remember(before,b,c,result) {
  b.knowledge??={};
  for(const observer of Object.values(b.actors).filter(a=>a.present)) {
    for(const target of Object.values(b.actors).filter(a=>a.present&&a.id!==observer.id)) {
      const wasSeen=Boolean(before.actors[observer.id]?.present&&before.actors[target.id]?.present&&
        canObserve(before,before.actors[target.id],observer.id)),isSeen=canObserve(b,target,observer.id);
      const moving=target.id===c.actorId&&result.movement&&!target.hiddenFrom?.includes(observer.id);
      const pathSeen=moving?lastVisiblePoint(b.map,before.actors[observer.id].position,result.movement.path):null;
      const position=isSeen?target.position:pathSeen??(wasSeen?before.actors[target.id].position:null);
      const knowledge=b.knowledge[observer.id]??={};
      if(position) {
        const observed=knowledge[target.id]??={abilities:[]};
        observed.lastSeen={name:target.name,team:target.team,position:[...position],round:before.round};
        if(target.id===c.actorId&&(wasSeen||isSeen||pathSeen)) {
          observed.abilities??=[];if(!observed.abilities.includes(c.abilityId))observed.abilities.push(c.abilityId);
        }
      }
      const seen=knowledge[target.id]?.lastSeen;
      if(!isSeen&&seen&&observer.id===c.actorId&&result.movement&&distance(observer.position,seen.position)<.3)seen.searched=true;
    }
  }
}

// The declaration is saved before the choice. No actual dice are drawn or
// costs debited until all reactions are chosen; a refresh resumes this record.
export function resolveStep(input,c,options={}) {
  const b=structuredClone(input);
  if(b.pending?.kind==='opportunity') {
    const p=b.pending;
    if(!options.playerAuthorized||c.actorId!==p.awaiting||c.abilityId!=='opportunityReact'||
      !['decline','strike'].includes(c.choice)||Object.keys(c).some(k=>!['actorId','abilityId','choice'].includes(k)))
      throw new IllegalAction('请由玩家声明是否进行这次借机攻击。');
    const declarations={...p.opportunityDeclarations,[c.actorId]:c.choice==='strike'};
    delete b.pending;
    return resolveStep(b,p.command,{...options,opportunityDeclarations:declarations,playerAuthorized:p.playerAuthorized});
  }
  if(b.pending) {
    const pending=b.pending,a=b.actors[pending.awaiting];
    if(c.actorId!==a.id||c.abilityId!=='react'||!['decline','conversion'].includes(c.choice)||
      Object.keys(c).some(k=>!['actorId','abilityId','choice','defense','grappleDefense'].includes(k)))
      throw new IllegalAction('须由当前受击者选择使用或保留伤害转换');
    if(a.controller==='player'&&!options.playerAuthorized) throw new IllegalAction('反应须由玩家选择');
    if(b.actors[pending.command.actorId]?.kind==='chuul'&&a.controller==='player') {
      if(!['strength','agility'].includes(c.grappleDefense))throw new IllegalAction('须选择力量＋肉搏挣脱或敏捷＋运动逃脱');
      (pending.grappleDefenses??={})[a.id]=c.grappleDefense;
    }
    if(b.playerDefenseDeclarations&&a.controller==='player') {
      const defense=c.defense??a.defenseIntent?.mode;
      if(!['normal','block'].includes(defense))throw new IllegalAction('请先声明本次使用基础防御，还是已就绪的格挡。');
      if(defense==='block'&&!a.buffs.block)throw new IllegalAction('格挡尚未就绪；不能在受击时自动补用移动动作。');
      (pending.defenses??={})[a.id]=defense;
    }
    if(c.choice==='conversion'&&(!a.abilities.includes('conversion')||a.used.damageConversion))
      throw new IllegalAction('伤害转换当前不可用');
    pending.choices[a.id]=c.choice;
    pending.queue.shift();pending.awaiting=pending.queue[0];
    if(pending.awaiting) return {battle:b,result:stateResult(b,c.actorId,'react',['等待下一名受击者反应'])};
    delete b.pending;
    const prior={};
    for(const [id,choice] of Object.entries(pending.choices)) {
      prior[id]=b.actors[id].reactions.damageConversion;
      if(choice==='conversion') b.actors[id].reactions.damageConversion=true;
    }
    const guards={};
    for(const [id,mode] of Object.entries(pending.defenses??{}))if(mode==='normal') {
      guards[id]={block:b.actors[id].buffs.block,zheng:b.actors[id].buffs.zheng};
      delete b.actors[id].buffs.block;delete b.actors[id].buffs.zheng;
    }
    const out=act(b,pending.command,{...options,playerAuthorized:pending.playerAuthorized,defenseDeclarations:pending.defenses,grappleDeclarations:pending.grappleDefenses,
      opportunityDeclarations:pending.opportunityDeclarations});
    for(const [id,guard] of Object.entries(guards))for(const [key,value] of Object.entries(guard))
      if(value!==undefined)out.battle.actors[id].buffs[key]=value;
    // A declined/missed one-off reaction must not silently arm a future attack.
    for(const [id,armed] of Object.entries(prior)) out.battle.actors[id].reactions.damageConversion=armed&&!out.battle.actors[id].used.damageConversion;
    remember(b,out.battle,pending.command,out.result);
    return out;
  }
  if(c.abilityId==='react') throw new IllegalAction('没有等待反应的攻击');
  if(b.reactionWindows) {
    // Legality check uses disposable fixed dice, never the actual dice provider.
    act(b,c,{drawDice:()=>Array(1024).fill(1),playerAuthorized:options.playerAuthorized,deferPlayerDefense:true});
    const opportunity=b.playerDefenseDeclarations&&opportunityActors(b,c).find(a=>a.controller==='player'&&!Object.hasOwn(options.opportunityDeclarations??{},a.id));
    if(opportunity) {
      b.pending={kind:'opportunity',command:structuredClone(c),awaiting:opportunity.id,
        opportunityDeclarations:options.opportunityDeclarations??{},playerAuthorized:options.playerAuthorized===true};
      return {battle:b,result:stateResult(b,c.actorId,c.abilityId,['等待玩家声明是否进行借机攻击；尚未移动'])};
    }
    const queue=[...new Set(potentialTargets(b,c,options))].filter(id=>{
      const a=b.actors[id];
      return a&&panel(b,id).life==='可行动'&&(
        b.actors[c.actorId]?.kind==='chuul'&&a.controller==='player'||
        b.playerDefenseDeclarations&&a.controller==='player'&&!a.defenseIntent||
        a.abilities.includes('conversion')&&!a.used.damageConversion&&!a.reactions.damageConversion);
    });
    if(queue.length) {
      b.pending={command:structuredClone(c),queue,awaiting:queue[0],choices:{},playerAuthorized:options.playerAuthorized===true,
        ...(options.opportunityDeclarations?{opportunityDeclarations:options.opportunityDeclarations}:{})};
      return {battle:b,result:stateResult(b,c.actorId,c.abilityId,['攻击已宣言，等待反应；尚未掷骰或扣除攻击资源'])};
    }
  }
  const out=act(b,c,options);remember(b,out.battle,c,out.result);return out;
}
