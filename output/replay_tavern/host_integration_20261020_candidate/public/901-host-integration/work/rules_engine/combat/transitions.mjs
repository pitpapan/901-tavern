import { act, panel, stateResult } from './engine.mjs';
import { potentialTargets } from './runtime.mjs';
import { IllegalAction } from './mechanics.mjs';

function remember(b,c) {
  b.knowledge??={};
  for(const a of Object.values(b.actors)) {
    if(!a.present||b.actors[c.actorId]?.hiddenFrom?.includes(a.id)) continue;
    const observed=((b.knowledge[a.id]??={})[c.actorId]??={abilities:[]});
    observed.abilities??=[];if(!observed.abilities.includes(c.abilityId)) observed.abilities.push(c.abilityId);
  }
}

// The declaration is saved before the choice. No actual dice are drawn or
// costs debited until all reactions are chosen; a refresh resumes this record.
export function resolveStep(input,c,options={}) {
  const b=structuredClone(input);
  if(b.pending) {
    const pending=b.pending,a=b.actors[pending.awaiting];
    if(c.actorId!==a.id||c.abilityId!=='react'||!['decline','conversion'].includes(c.choice)||
      Object.keys(c).some(k=>!['actorId','abilityId','choice'].includes(k)))
      throw new IllegalAction('须由当前受击者选择使用或保留伤害转换');
    if(a.controller==='player'&&!options.playerAuthorized) throw new IllegalAction('反应须由玩家选择');
    pending.choices[a.id]=c.choice;
    pending.queue.shift();pending.awaiting=pending.queue[0];
    if(pending.awaiting) return {battle:b,result:stateResult(b,c.actorId,'react',['等待下一名受击者反应'])};
    delete b.pending;
    const prior={};
    for(const [id,choice] of Object.entries(pending.choices)) {
      prior[id]=b.actors[id].reactions.damageConversion;
      if(choice==='conversion') b.actors[id].reactions.damageConversion=true;
    }
    const out=act(b,pending.command,{...options,playerAuthorized:pending.playerAuthorized});
    // A declined/missed one-off reaction must not silently arm a future attack.
    for(const [id,armed] of Object.entries(prior)) out.battle.actors[id].reactions.damageConversion=armed&&!out.battle.actors[id].used.damageConversion;
    remember(out.battle,pending.command);
    return out;
  }
  if(c.abilityId==='react') throw new IllegalAction('没有等待反应的攻击');
  if(b.reactionWindows) {
    // Legality check uses disposable fixed dice, never the actual dice provider.
    act(b,c,{drawDice:()=>Array(1024).fill(1),playerAuthorized:options.playerAuthorized});
    const queue=[...new Set(potentialTargets(b,c))].filter(id=>{
      const a=b.actors[id];
      return a?.abilities.includes('conversion')&&!a.used.damageConversion&&!a.reactions.damageConversion&&panel(b,id).life==='可行动';
    });
    if(queue.length) {
      b.pending={command:structuredClone(c),queue,awaiting:queue[0],choices:{},playerAuthorized:options.playerAuthorized===true};
      return {battle:b,result:stateResult(b,c.actorId,c.abilityId,['攻击已宣言，等待反应；尚未掷骰或扣除攻击资源'])};
    }
  }
  const out=act(b,c,options);remember(out.battle,c);return out;
}
