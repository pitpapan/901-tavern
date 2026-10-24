import { initializeTestState, settleCombat, readCombat } from '../mvu_poc/adapter.mjs';
import { act, currentContext, panel, TACTICS, stateResult } from './engine.mjs';
import { ABILITIES } from './catalog.mjs';
import { beginTurn, freshTurn } from '../core.mjs';
import { RuleInputError, IllegalAction, refreshDerived, blockValue } from './mechanics.mjs';
import { resolveStep } from './transitions.mjs';

export function visibleTo(b,a,observer) {
  return a.present&&!a.hiddenFrom?.includes(observer.id);
}

function candidatesFor(battle) {
  const a=battle.actors[battle.activeId], candidates=[];
  const add=(abilityId,extra={})=>candidates.push({actorId:a.id,abilityId,...extra});
  const enemies=Object.values(battle.actors).filter(t=>visibleTo(battle,t,a)&&t.team!==a.team);
  for(const id of a.abilities) {
    if(['strike','thunder','cleaveRock','lightning','conduct','roar','tornado','aim','timeBolt','timeHaste'].includes(id)) {
      for(const t of id==='timeHaste'?Object.values(battle.actors).filter(x=>visibleTo(battle,x,a)&&x.team===a.team):enemies) {
        const variants=['lightning','conduct'].includes(id)?[1,2,3]:[undefined];
        for(const tier of variants) {
          const command={targetId:t.id,...(tier?{tier}:{})};
          add(id,command);
          if(['thunder','cleaveRock','lightning','conduct'].includes(id)) add(id,{...command,payment:'restraint'});
          if(id==='strike'&&a.kind==='jiang') {
            add(id,{...command,finisher:true});
            add(id,{...command,empowered:true});
            add(id,{...command,empowered:true,finisher:true});
          }
          if(['strike','thunder','cleaveRock'].includes(id)&&['huang','yulin'].includes(a.kind)) add(id,{...command,strength:true});
          if(id==='tornado') add(id,{...command,resource:'魔力'});
        }
      }
    } else if(['move','step'].includes(id)) {
      for(const t of enemies) {
        const d=Math.hypot(t.position[0]-a.position[0],t.position[1]-a.position[1]);
        if(!d) continue;
        const currentSpeed=panel(battle,a.id).speed;
        const speed=id==='step'?Math.min(1.5,currentSpeed):currentSpeed;
        for(const n of [Math.min(speed,Math.max(0,d-a.reach)), -speed]) if(n) {
          add(id,{to:a.position.map((v,i)=>v+(t.position[i]-v)/d*n)});
        }
      }
    } else if(id==='conversion') {if(!battle.reactionWindows) add(id,{enabled:true});}
    else if(id==='flow') {add(id,{tier:1});add(id,{tier:2});}
    else if(id==='tengzhuan'||id==='gale') {add(id);add(id,{resource:'魔力'});}
    else if(id==='squeeze') { add(id,{resource:'气'}); add(id,{resource:'斗气'}); }
    else add(id);
  }
  return [...new Map(candidates.map(c=>[JSON.stringify(c),c])).values()];
}

export function inspectCommands(battle) {
  if(battle.pending) return {options:['decline','conversion'].map(choice=>({
    command:{actorId:battle.pending.awaiting,abilityId:'react',choice},
    preview:{timing:'攻击宣言后、掷骰前；未掷骰，未扣攻击资源',cost:choice==='conversion'?'实际受伤才消耗一次场景次数':'不使用'},
  })),unavailable:[]};
  const options=[],unavailable=[];
  for(const command of candidatesFor(battle)) {
    try {
      const trial=act(battle,command,{drawDice:()=>Array(1024).fill(1),playerAuthorized:true});
      options.push({command,preview:previewOutcome(battle,command,trial)});
    } catch(error) {
      if(!(error instanceof RuleInputError)&&!(error instanceof IllegalAction)) throw error;
      const entry={abilityId:command.abilityId,status:error.code,reason:error.message,...(error.field?{field:error.field}:{})};
      if(!unavailable.some(x=>JSON.stringify(x)===JSON.stringify(entry))) unavailable.push(entry);
    }
  }
  return {options,unavailable};
}
export function legalCommands(battle) {return inspectCommands(battle).options.map(x=>x.command);}

function previewOutcome(b,c,out) {
  const a=b.actors[c.actorId], after=out.battle.actors[a.id], attack=out.result.attack;
  const preview={};
  if(c.abilityId!=='end') {
    preview.actions=Object.fromEntries(['standard','move','swift'].map(k=>[k,a.state.turn[k]-after.state.turn[k]]).filter(([,n])=>n>0));
    preview.energy=Object.fromEntries(Object.entries(a.state.resources).map(([k,v])=>[k,v.current-after.state.resources[k].current]).filter(([,n])=>n!==0));
    if(c.payment==='restraint') preview.payment=`精神束缚＋${Math.max(0,...after.state.statuses.filter(s=>s.type==='精神束缚').map(s=>s.points))-Math.max(0,...a.state.statuses.filter(s=>s.type==='精神束缚').map(s=>s.points))}`;
  }
  if(attack) preview.attack={dp:attack.rawDP,defense:attack.defense.total,rollDP:attack.rawDP-attack.defense.total,
    auto:attack.fixed,defenseAuto:attack.defense.extraSuccesses,cap:attack.cap,ap:attack.ap,magic:attack.magic,speed:attack.speed};
  if(['block','zheng','tengzhuan','flow','fistQi','breakBody'].includes(c.abilityId)) {
    const p=panel(out.battle,a.id);
    preview.after={attackDP:p.attack.dp,defenseDP:p.defense.total,defenseAuto:p.defense.extraSuccesses,speedM:p.speed};
  }
  if(['gale','roar'].includes(c.abilityId)||c.abilityId==='lightning'&&c.tier===3) preview.affected=potentialTargets(b,c);
  return preview;
}
export function potentialTargets(b,c) {
  const a=b.actors[c.actorId],target=b.actors[c.targetId], actors=Object.values(b.actors).filter(x=>x.present);
  const d=(x,y)=>Math.hypot(x.position[0]-y.position[0],x.position[1]-y.position[1]);
  if(c.abilityId==='gale') return actors.filter(x=>x.team!==a.team&&d(a,x)<=20).map(x=>x.id);
  if(c.abilityId==='roar'&&target) {
    const len=d(a,target),vx=(target.position[0]-a.position[0])/len,vy=(target.position[1]-a.position[1])/len;
    return actors.filter(x=>{const dx=x.position[0]-a.position[0],dy=x.position[1]-a.position[1];return x.id!==a.id&&dx*vx+dy*vy>=0&&dx*vx+dy*vy<=100&&Math.abs(dx*vy-dy*vx)<=1;}).map(x=>x.id);
  }
  if(c.abilityId==='lightning'&&c.tier===3&&target) return actors.filter(x=>d(x,target)<=1.5).map(x=>x.id);
  if(c.abilityId==='move') return actors.some(x=>x.team!==a.team&&d(x,a)<=x.reach&&Math.hypot(x.position[0]-c.to[0],x.position[1]-c.to[1])>x.reach)?[a.id]:[];
  return ['strike','thunder','cleaveRock','lightning','tornado','timeBolt'].includes(c.abilityId)&&target?[target.id]:[];
}

export function decisionContext(b,revision,inspection=inspectCommands(b)) {
  const observer=b.actors[b.pending?.awaiting??b.activeId], full=currentContext(b);
  const known=b.knowledge?.[observer.id]??{};
  const visible=Object.values(b.actors).filter(a=>visibleTo(b,a,observer));
  const canSeeStats=id=>id===observer.id||known[id]?.stats===true;
  const participants=visible.map(a=>{
    if(canSeeStats(a.id)) return full.participants.find(p=>p.id===a.id);
    return {id:a.id,name:a.name,team:a.team,position:a.position,
      condition:a.state.health.intact===a.state.derived.hpMax?'未见伤势':a.state.health.intact>0?'可见受伤':'倒地',
      observedAbilities:(known[a.id]?.abilities??[]).map(id=>ABILITIES[id]?.name??id)};
  });
  const ids=new Set(inspection.options.map(x=>x.command.abilityId));
  // Keep the actor's preparation abilities available for short-horizon planning.
  for(const id of observer.abilities) if(['fistQi','breakBody','tengzhuan','reload','draw'].includes(id)) ids.add(id);
  const previews=[];
  const legalOptions=inspection.options.map(({command,preview})=>{
    const {actorId,...choice}=command, p=structuredClone(preview);
    if(p.attack&&!canSeeStats(command.targetId)) {delete p.attack.defense;delete p.attack.rollDP;delete p.attack.defenseAuto;p.attack.targetDefense='未知';}
    if(p.affected) p.affected=p.affected.filter(id=>visible.some(a=>a.id===id));
    for(const key of ['actions','energy']) if(p[key]&&!Object.keys(p[key]).length) delete p[key];
    if(p.attack) {
      const x=p.attack;
      p.attack=[`${x.dp}DP`,`自动${x.auto}`,`上限${x.cap}`,
        ...(x.rollDP!==undefined?[`对位投骰${x.rollDP}DP`,`防御附成${x.defenseAuto}`]:[]),
        ...(x.ap?[`破甲${x.ap}`]:[]),...(x.magic?[`破魔${x.magic}`]:[]),...(x.speed?[`高速${x.speed}`]:[])].join('，');
    }
    const key=JSON.stringify(p);
    let index=previews.findIndex(x=>JSON.stringify(x)===key);
    if(index<0) {index=previews.length;previews.push(p);}
    return {...choice,preview:index};
  });
  return {scenario:b.scenario,round:b.round,activeId:observer.id,revision,status:b.status,
    phase:b.pending?'reaction':'action',participants,legalOptions,previews,
    abilities:Object.fromEntries([...ids].map(id=>[id,id==='block'?{...ABILITIES.block,
      action:observer.kind==='huang'?'自由':'移动',
      text:`获得${blockValue(observer)}格挡加值，持续至下次本人行动开始；须能行动并具备相应武器。`}:ABILITIES[id]])),
    unavailable:inspection.unavailable.filter(x=>x.status==='NEEDS_INPUT'),
    notes:'仅明确共享或已知数值可见；未知防御不能当作0。选项preview是previews下标，为支出预览而非伤害结果。',
    ...(b.pending?{incoming:{actorId:b.pending.command.actorId,abilityId:b.pending.command.abilityId}}:{})};
}

export function createCombatRuntime({mvu,getAnchor,expectedChatId,drawDice}) {
  const environment={mvu,getAnchor,expectedChatId};
  return {
    initialize(battle) {
      return initializeTestState({...environment,battle,
        actors:Object.fromEntries(Object.entries(battle.actors).map(([id,a])=>[id,{name:a.name,state:a.state}]))});
    },
    read() { return readCombat(environment); },
    context() { const {battle,revision}=readCombat(environment); return {...currentContext(battle),revision}; },
    dispatch({operationId,expectedRevision,command,playerAuthorized=false}) {
      return settleCombat({...environment,operationId,expectedRevision,command,
        reduce:(b,c)=>resolveStep(b,c,{drawDice,playerAuthorized})});
    },
    enter({operationId,expectedRevision,battle}) {
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'enter',encounterId:battle.id},
        createBattle:root=>{
          if(root.battle?.status==='active'||root.battle?.pending) throw new Error('仍有进行中的战斗');
          const next=structuredClone(battle);
          for(const [id,a] of Object.entries(next.actors)) if(root.actors[id]) {
            a.state=structuredClone(root.actors[id].state);a.state.turn=freshTurn();
            const prior=root.actors[id].combatCarry??root.battle?.actors[id];
            for(const key of ['equipment','parameters','ammunition','squeezed','recoveryLocks','knownWeaknesses','weaponSize']) if(prior?.[key]!==undefined) a[key]=structuredClone(prior[key]);
          }
          for(const a of Object.values(next.actors)) refreshDerived(a);
          next.order.sort((x,y)=>next.actors[y].state.derived.initiative-next.actors[x].state.derived.initiative);
          next.activeId=next.order.find(id=>panel(next,id).life==='可行动');
          if(!next.activeId) throw new Error('没有可行动的参战者');
          next.actors[next.activeId].state=beginTurn(next.actors[next.activeId].state).state;
          next.mode='combat';return next;
        },reduce:b=>({battle:b,result:stateResult(b,b.activeId,'enter',['进入战斗；沿用现有伤势与能量'])})});
    },
    leave({operationId,expectedRevision}) {
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'leave'},reduce:b=>{
        if(b.status!=='finished'||b.pending) throw new Error('须先结束战斗与待定反应');
        b.mode='story';
        for(const a of Object.values(b.actors)) {
          a.buffs={};a.combos={};a.cooldowns={};a.state.turn=freshTurn();a.reactions.damageConversion=false;
          delete a.aim;delete a.expires;delete a.initiativeOverride;
        }
        return {battle:b,result:stateResult(b,b.activeId,'leave',['返回剧情；保留伤势、能量和恢复限制'])};
      }});
    },
    supplyParameters({operationId,expectedRevision,actorId,values}) {
      const integerKeys=['bowStrength','weaponSize','flowMax','flowCurrent','ammunition'];
      for(const [k,v] of Object.entries(values)) {
        if(integerKeys.includes(k)?!Number.isInteger(v)||v<0:k==='flowAction'?!['standard','move','swift','free'].includes(v):true)
          throw new Error('主持参数只接受已列出的缺项与合法值');
      }
      return settleCombat({...environment,operationId,expectedRevision,command:{kind:'parameters',actorId,values},reduce:b=>{
        if(b.pending) throw new Error('待定攻击期间不能修改参数');
        const a=b.actors[actorId];if(!a) throw new Error('未知参战者');
        a.parameters={...a.parameters,...values};
        if(values.weaponSize!==undefined) a.weaponSize=values.weaponSize;
        if(values.ammunition!==undefined) a.ammunition=values.ammunition;
        if(values.flowMax!==undefined||values.flowCurrent!==undefined) {
          const current=values.flowCurrent??a.state.resources.流风?.current;
          if(!Number.isInteger(current)||!Number.isInteger(a.parameters.flowMax)||current>a.parameters.flowMax) throw new Error('流风必须同时有有效的当前值和上限');
          a.state.resources.流风={current,max:a.parameters.flowMax};
        }
        return {battle:b,result:stateResult(b,actorId,'parameters',['主持已补齐指定参数'])};
      }});
    },
  };
}

export async function chooseAction(runtime,generateRaw,{rejection=null}={}) {
  const {battle,revision}=runtime.read();
  const context=decisionContext(battle,revision);
  if(context.status!=='active') throw new Error('Combat is not active');
  const actor=context.participants.find(a=>a.id===context.activeId);
  if(actor.controller==='player') return {status:'awaiting_player',actorId:actor.id};
  const options=legalCommands(battle);
  if(!options.length) throw new Error('没有合法行动，需主持处理当前状态');
  const prompt=JSON.stringify(context);
  const text=await generateRaw({
    should_stream:false,should_silence:true,max_chat_history:0,
    ordered_prompts:[{role:'system',content:TACTICS+'\n从legalOptions选择一项。只返回{"option":从0开始的下标}。若本轮准备攻击，先考虑能影响该攻击的自由/迅捷增益和合法格挡，再攻击；标准动作增益会占用本轮攻击。装填、射距、友伤与退路优先核实。反应阶段按威胁和剩余生命决定是否使用转换。未知对手数值不是0。完成有用动作后选end，避免无意义往返。'},'user_input'],
    user_input:prompt+(rejection?`\n上一选择未执行：${rejection}。重新选合法动作。`:''),
  });
  const trimmed=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
  let selection;
  try {selection=JSON.parse(trimmed);}
  catch {throw new IllegalAction('模型须返回含option编号的JSON');}
  if(!Number.isInteger(selection?.option)||!options[selection.option]) throw new IllegalAction('模型须选择当前合法选项编号');
  const command=options[selection.option];
  return {command,expectedRevision:context.revision,promptChars:prompt.length};
}
