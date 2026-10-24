import { beginTurn, endTurn, spendAction, lifeStatus, statusLevel, rollPool, resolveDamage } from '../core.mjs';
import { ABILITIES, makeLotus } from './catalog.mjs';
import { value, automatic, skill, attackSkill, equipment, profile, derived, refreshDerived, blockValue, saveProfile, rollCombatPool, RuleInputError, IllegalAction } from './mechanics.mjs';

const clone = x => structuredClone(x);
const sum = x => Object.values(x).reduce((n,v) => n + v, 0);
const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);
const points = (a,t) => statusLevel(a.state,t).points;
const auto = automatic;
const frozen = a => ['麻痹','精神束缚','纠缠','冻结'].some(t => statusLevel(a.state,t).severe);
const unconscious = a => !a.diehard && ['dead','unconscious'].includes(lifeStatus(a.state).state)
  || lifeStatus(a.state).state === 'dead' || statusLevel(a.state,'晕眩').severe;
const penalty = a => ['麻痹','精神束缚','晕眩','疲乏'].reduce((n,t) => n+points(a,t),0) + lifeStatus(a.state).woundPenalty;
const fail = text => { throw new IllegalAction(text); };
const requireThat = (ok,text) => { if (!ok) fail(text); };
const physicalActions = new Set(['strike','thunder','cleaveRock','lightning','conduct','move','step','block','draw','sheathe','roar','tornado','gale','zheng','reload','aim']);

export function randomDice() {
  const result = [];
  while (result.length < 512) {
    const bytes = new Uint8Array(640);
    crypto.getRandomValues(bytes);
    for (const x of bytes) if (x < 250 && result.length < 512) result.push(x % 10 + 1);
  }
  return result;
}

function spend(a, kind, behavior) {
  // 死硬 only overrides injury unconsciousness, never death or status incapacity.
  const proxy = clone(a.state);
  if (a.diehard && proxy.health.intact === 0 && lifeStatus(proxy).state !== 'dead') {
    const slot = proxy.health.L ? 'L' : 'B';
    if (proxy.health[slot]) { proxy.health[slot]--; proxy.health.intact++; }
  }
  const out = spendAction(proxy, kind, { behavior, ...(kind==='opportunity'?{enemyLeavesThreat:true}: {}) });
  requireThat(out.result.allowed, out.result.reason);
  a.state.turn = out.state.turn;
}

function pay(a, resource, count, payment = 'pool') {
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
  for (const s of allowed) if (a.state.health[s]) {
    const locks=(a.recoveryLocks??[]).filter(l=>l.severity===s&&l.count>0);
    const locked=locks.reduce((n,l)=>n+l.count,0);
    if(a.state.health[s]<=locked) {
      const healable=locks.find(l=>canHealAggravated&&l.recovery==='aggravated');
      if(!healable) continue;
      healable.count--;
    }
    a.state.health[s]--; a.state.health.intact++; return s;
  }
  return null;
}

export function attackProfile(b, id, c = {}) {
  const a = b.actors[id], type = c.abilityId ?? 'strike';
  const w=equipment(a).weapon, sk=attackSkill(a), str=value(a,'力量'), agi=value(a,'敏捷');
  let weapon, rawDP, cap, fixed, ap, magic=0, speed=0, extra=0, ignore=0, aggravate=0;
  let electric=0, reduction=0, range=a.reach, explode=10;
  if (a.kind === 'jiang') {
    const empowered = Boolean(c.empowered);
    weapon = w.damage + (a.buffs.fistQi ? 2 : 0) + (empowered ? 1 : 0);
    const combo = a.combos[c.targetId] ?? 0;
    rawDP = str+sk.level+weapon+3+12+3+(a.spartanBonus??0)+combo;
    cap=weapon+sk.level+str; fixed=auto(a,'力量')+sk.auto; ap=(a.buffs.breakBody?4:w.ap)+(empowered?1:0); speed=4;
    ignore=4+(empowered?1:0); extra=c.finisher&&combo===5 ? 5:0;
  } else if (a.kind === 'huang') {
    const useStrength=c.strength===true;
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
    weapon=w.damage;
    const posture=a.buffs.tengzhuan?4:2, flow=(a.buffs.flow??0)*2;
    rawDP=(c.strength?str:agi)+sk.level+weapon+w.attackBonus+Math.max(w.speedBonus??0,flow)
      +(c.strength?0:posture)+Math.max(a.buffs.bixie??0,type==='gale'?3:0);
    cap=weapon+sk.level+(c.strength?str:0); fixed=auto(a,c.strength?'力量':'敏捷')+sk.auto;
    ap=w.ap; magic=w.magic; reduction=type==='tornado'?8:(w.defenseReduction??0);
    if(['tornado','gale'].includes(type)) range=20;
  } else if(a.kind==='bright') {
    const safe=!a.interfered&&!Object.values(b.actors).some(t=>t.present&&t.team!==a.team&&!unconscious(t)&&distance(a.position,t.position)<=7.5);
    const target=b.actors[c.targetId], unit=str*(w.rangePerStrength??50);
    const autoAim=target&&distance(a.position,target.position)<=unit*3?1+auto(a,'感知'):0;
    const aimed=Math.min(3,autoAim+(a.aim&&a.aim.targetId===c.targetId?a.aim.rounds??0:0));
    const weak=aimed>=3&&a.knownWeaknesses?.includes(c.targetId);
    weapon=w.damage;
    rawDP=agi+(safe?6:0)+sk.level+weapon+w.attackBonus+3+aimed+(weak?6:aimed>=2?2:0);
    if(target) rawDP-=Math.max(0,Math.ceil(distance(a.position,target.position)/unit)-1)*2;
    cap=Number.isInteger(w.strengthRequirement)?weapon*2+sk.level+w.strengthRequirement:null;
    fixed=Math.max(0,Math.floor((agi+(safe?6:0)-1)/5))+sk.auto;
    ap=w.ap; magic=w.magic; range=unit*10; explode=9; aggravate=weak?2:0;
  } else { weapon=w.damage; rawDP=str+sk.level+weapon+w.attackBonus; cap=weapon+sk.level+str; fixed=auto(a,'力量')+sk.auto; ap=w.ap; magic=w.magic; }
  rawDP-=penalty(a);
  if (a.diehard && a.state.health.intact===0) rawDP+=a.state.health.A?3:a.state.health.L?2:1;
  return { rawDP, dp:rawDP, weapon, cap, fixed, ap, magic, speed, extra, ignore, aggravate, electric, reduction, range, explode };
}

function initiative(b,a) { return a.initiativeOverride??derived(a).initiative; }

export function resolveDefense(b, id, attackerId, attack = {}) {
  const a=b.actors[id], attacker=b.actors[attackerId];
  const eq=equipment(a), base=Math.max(0,Math.min(value(a,'敏捷'),value(a,'感知'))-(eq.armor.basePenalty??0));
  let p={base,natural:profile(a).natural,armor:eq.armor.defense,
    dodge:auto(a,'敏捷'),insight:auto(a,'感知'),block:a.buffs.block&&!a.sheathed?blockValue(a):0};
  if(['huang','bright'].includes(a.kind)&&attacker&&initiative(b,a)>initiative(b,attacker)) p.base+=5;
  if(a.kind==='huang') p.cultivation=a.sheathed?0:6;
  if(a.kind==='jiang'||a.kind==='lotus') { p.dodge=0;p.insight=0; }
  if(a.kind==='yulin') {
    p.dodge+=a.buffs.tengzhuan?4:2; p.insight=0;
    p.deflection=a.buffs.zheng?attackSkill(a).level+auto(a,'智力'):2;
    p.force=a.buffs.block?Math.max(1,eq.weapon.force??0):1;
  }
  if (frozen(a) || unconscious(a)) { p.base=0; p.dodge=0; p.block=0; }
  const eat=(keys,n) => { for(const k of keys) { const v=Math.min(p[k]??0,n); p[k]=(p[k]??0)-v; n-=v; } return n; };
  const restraint=points(a,'精神束缚')+points(a,'麻痹')+points(a,'纠缠');
  eat(['base','dodge','block'],restraint+lifeStatus(a.state).woundPenalty);
  if (a.buffs.iaiPenalty) eat(['base','dodge','block','insight','cultivation','armor','natural'],2);
  if (attack.contact) { p.armor=0; p.natural=0; }
  eat(['base','dodge','block','insight','cultivation'],Math.max(0,(attack.speed??0)-(a.kind==='yulin'?5:0)));
  const protectedDeflection=a.buffs.zheng?p.deflection:0;
  if(attack.reduction===8) eat(['base','dodge','block','insight','cultivation','armor','natural','force',...(protectedDeflection?[]:['deflection'])],8);
  else eat(['base','dodge','block'],attack.reduction??0);
  const remainingAP=eat(['cover','force','device','shield','armor','natural'],attack.ap??0);
  eat(['luck','morale','enhancement','holy','technique','performance','intrinsic','unnamed'],attack.magic??0);
  return { total:sum(p), parts:p, remainingAP,
    extraSuccesses:frozen(a)||unconscious(a)?0:auto(a,'敏捷')+auto(a,'感知')+(eq.armor.defenseAuto??0) };
}

export function panel(b,id,attackerId) {
  const a=clone(b.actors[id]);refreshDerived(a);
  const s=a.state;
  const d=derived(a);
  let speed=d.speed-penalty(a)+lifeStatus(s).woundPenalty;
  if (statusLevel(s,'疲乏').severe) speed-=Math.ceil(d.speed/2);
  if (frozen(a)||unconscious(a)) speed=0;
  return { id, name:a.name, team:a.team, controller:a.controller, attributes:clone(s.attributes),
    health:clone(s.health), hpMax:s.derived.hpMax, life:unconscious(a)?'失去行动能力':'可行动',
    position:clone(a.position), initiative:initiative(b,a), speed:Math.max(0,speed),
    attack:attackProfile(b,id), defense:resolveDefense(b,id,attackerId), actions:clone(s.turn),
    energy:clone(s.resources), will:clone(s.will), statuses:clone(s.statuses),
    buffs:clone(a.buffs), combos:clone(a.combos), cooldowns:clone(a.cooldowns), used:clone(a.used),
    reactions:clone(a.reactions), sheathed:a.sheathed };
}

function saveRoll(a,type,drawDice,{ recognizable=false, speed=0 }={}) {
  const {dp:base,fixed,extra}=saveProfile(a,type,{recognizable,speed});
  const dp=base-(type==='reflex'?points(a,'疲乏'):points(a,'疲乏')*(type==='fort'?1:0))-lifeStatus(a.state).woundPenalty;
  const r=rollPool(dp,drawDice());
  return { ...r, fixed, extra:r.rolledSuccesses>0?extra:0,total:r.rolledSuccesses+fixed+(r.rolledSuccesses>0?extra:0), type };
}

function inflictStatus(a,type,count,source,drawDice) {
  const save=saveRoll(a,'fort',drawDice);
  const remaining=Math.max(0,count-save.total);
  if (remaining) a.state.statuses.push({ type, source, points:remaining });
  return { type, points:count, remaining, save };
}

function damageEvent(a, segments, conversion, result, bypass={conversion:0}) {
  let n=0;
  const armor=equipment(a).armor, weapon=equipment(a).weapon;
  const protection=bypass.protection??(bypass.protection={
    absorb:a.buffs.zheng?1:0,dr:armor.dr??0,
    energy:Math.max(armor.energyAbsorb??0,a.buffs.block?(weapon.energyAbsorb??0):0),
    resistance:armor.energyResistance??0,
  });
  for (const segment of segments) {
    if (!segment.amount) continue;
    let amount=segment.amount;
    for(const key of ['absorb',...(segment.kind==='physical'?['dr']:['energy','resistance'])]) {
      if(key==='dr'&&segment.tags?.includes(armor.drBypass)) continue;
      const ignored=Math.min(protection[key],bypass.defenses??0); bypass.defenses=Math.max(0,(bypass.defenses??0)-ignored);
      protection[key]-=ignored;
      const consumed=Math.min(amount,protection[key]); amount-=consumed; protection[key]-=consumed;
    }
    if(!amount) continue;
    if(conversion) {a.used.damageConversion=true;a.reactions.damageConversion=false;}
    const bypassed=conversion?Math.min(amount,bypass.conversion):0;
    bypass.conversion-=bypassed;
    for(const piece of [{amount:bypassed,convert:false},{amount:amount-bypassed,convert:conversion}]) {
      if(!piece.amount) continue;
      const out=resolveDamage(a.state,{...segment,amount:piece.amount},piece.convert?[{kind:'downgrade',steps:1}]:[]);
      a.state=out.state; n+=out.result.actualDamage;
      result.damage.push({ targetId:a.id, kind:segment.kind, energyType:segment.energyType??null,
        input:piece.amount, inputSeverity:segment.severity, severity:out.result.finalSeverity, actualDamage:out.result.actualDamage });
    }
  }
  return n;
}

function conversionFor(a, amount) {
  if (amount>0 && a.reactions.damageConversion && !a.used.damageConversion) {
    return true;
  }
  return false;
}

function strike(b,a,t,c,result,drawDice,{opportunity=false}={}) {
  requireThat(t?.present&&!unconscious(t),'目标不在场或已失去行动能力');
  const range=attackProfile(b,a.id,c).range;
  requireThat(distance(a.position,t.position)<=range+1e-8,'目标不在攻击范围内');
  requireThat(a.kind!=='huang'||!a.sheathed,'须先拔刀');
  if(c.empowered) {
    requireThat(a.kind==='jiang'&&a.buffs.fistQi,'强化一击须先有拳气');
    pay(a,'气',2);
  }
  if(c.finisher) requireThat(a.kind==='jiang'&&(a.combos[t.id]??0)===5,'终结技需要该目标5层');
  const p=attackProfile(b,a.id,c);
  if(p.cap===null) throw new RuleInputError('苍穹弓伤害上限需要武器力量要求',`${a.id}.bowStrength`);
  if(a.kind==='bright') {
    requireThat(a.loaded,'须先上箭');
    requireThat(a.ammunition>0,'没有可用箭矢');
  }
  if(opportunity) spend(a,'opportunity','attack'); else spend(a,'attack','attack');
  const d=resolveDefense(b,t.id,a.id,{...p,contact:c.abilityId==='conduct'});
  const roll=rollCombatPool(p.rawDP-d.total,drawDice(),p.explode);
  const afterDefense=Math.max(0,roll.rolledSuccesses+p.fixed-d.extraSuccesses);
  const extra=roll.rolledSuccesses>0&&afterDefense>0?p.extra:0;
  const amount=Math.min(p.cap,afterDefense+extra);
  result.attack={...p,defense:d,roll,extra,amount};
  if (a.kind==='jiang') a.combos[t.id]=c.finisher?0:Math.min(5,(a.combos[t.id]??0)+1);
  if (a.kind==='huang' && a.buffs.drawnRound===b.round && !a.buffs.drawUsed && c.abilityId!=='conduct') {
    a.buffs.drawUsed=true; a.buffs.iaiPenalty=true;
  }
  if(c.empowered) a.buffs.fistQi=false;
  if(a.kind==='bright') {a.loaded=false;a.ammunition--;delete a.aim;}
  if(a.kind==='yulin') a.attackedRound=b.round;
  if(!amount) return;
  if(a.kind!=='bright') delete t.aim;
  if(c.abilityId==='conduct') {
    result.statuses.push({targetId:t.id,...inflictStatus(t,'麻痹',c.tier*4,'御雷·导电',drawDice)}); return;
  }
  let aggravated=Math.min(amount,p.aggravate);
  if(a.kind==='jiang' && !d.parts.armor) aggravated=Math.min(amount,Math.floor(p.weapon/2),5);
  const electric=Math.floor(amount*p.electric);
  // Allocate the worsened points to the electrical part first. No duplicate damage:
  // total segment amounts must equal the capped attack successes.
  const ea=Math.min(electric,aggravated), pa=aggravated-ea;
  const converted=conversionFor(t,amount);
  const bypass={conversion:a.kind==='jiang'?4:0,defenses:p.ignore};
  const before=result.damage.length;
  const inflicted=damageEvent(t,[
    {amount:ea,severity:'A',kind:'energy',energyType:'electric'},
    {amount:pa,severity:'A',kind:'physical'},
    {amount:electric-ea,severity:'L',kind:'energy',energyType:'electric'},
    {amount:amount-electric-pa,severity:'L',kind:'physical'},
  ],converted,result,bypass);
  if(c.abilityId==='thunder') {
    const actualElectric=result.damage.slice(before).filter(x=>x.energyType==='electric').reduce((n,x)=>n+x.actualDamage,0);
    if(actualElectric) result.statuses.push({targetId:t.id,...inflictStatus(t,'麻痹',actualElectric,'雷鸣剑',drawDice)});
  }
  if(a.kind==='jiang'&&inflicted>0) {
    // 龙象 is part of this attack for the once-per-attack 901 conversion.
    damageEvent(t,[{amount:2,severity:'L',kind:'physical'}],converted,result,bypass);
    result.statuses.push({targetId:t.id,...inflictStatus(t,'晕眩',4,'龙象·沉劲震体',drawDice)});
  }
  if(c.abilityId==='lightning'&&c.tier===3&&inflicted>0) {
    for(const other of Object.values(b.actors)) if(other.present&&other.id!==t.id&&distance(other.position,t.position)<=1.5) {
      const save=saveRoll(other,'reflex',drawDice,{recognizable:other.kind==='huang'&&distance(other.position,a.position)<=30});
      result.saves.push({targetId:other.id,...save});
      const n=Math.max(0,8-save.total);
      damageEvent(other,[{amount:n,severity:'L',kind:'energy',energyType:'electric'}],conversionFor(other,n),result);
    }
  }
}

function finishIfNeeded(b) {
  const teams=new Set(Object.values(b.actors).filter(a=>a.present&&!unconscious(a)).map(a=>a.team));
  if(teams.size<=1) { b.status='finished'; b.winner=[...teams][0]??'平局'; }
}

function advance(b,result) {
  const old=b.actors[b.activeId]; old.state=endTurn(old.state).state;
  b.turnTaken??=[]; if(!b.turnTaken.includes(old.id)) b.turnTaken.push(old.id);
  const oldIndex=b.order.indexOf(old.id);
  if(old.buffs.timeHaste&&oldIndex>0&&!b.actors[b.order[oldIndex-1]].buffs.timeHaste) {
    const previous=b.actors[b.order[oldIndex-1]];
    b.order.splice(oldIndex,1);b.order.splice(oldIndex-1,0,old.id);
    old.initiativeOverride=initiative(b,previous)+1;
  }
  if(!b.order.some(id=>!b.turnTaken.includes(id)&&b.actors[id].present&&!unconscious(b.actors[id]))) {
      b.round++; b.elapsedRounds++;
      b.turnTaken=[];
      for(const a of Object.values(b.actors)) if(a.kind==='jiang'&&!unconscious(a)) {
        const healed=heal(a,['L','B']); if(healed) result.healing.push({actorId:a.id,severity:healed});
      }
      for(const a of Object.values(b.actors)) {
        if(a.kind==='yulin') a.buffs.bixie=a.attackedRound===b.round-1?Math.min(attackSkill(a).level,(a.buffs.bixie??0)+1):0;
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
  for(const id of b.order) {
    const a=b.actors[id];
    if(b.turnTaken.includes(id)||!a.present||unconscious(a)) continue;
    b.activeId=a.id;
    delete a.buffs.block; delete a.buffs.zheng; delete a.buffs.iaiPenalty;
    if(a.aim?.pendingRound<b.round) {a.aim.rounds=Math.min(3,(a.aim.rounds??0)+1);delete a.aim.pendingRound;}
    a.state=beginTurn(a.state).state;
    return;
  }
  finishIfNeeded(b);
  if(b.status!=='finished') { b.status='paused'; result.notes.push('无可行动单位，需要处理异常状态。'); }
}

export function act(input,command,{drawDice=randomDice,playerAuthorized=false}={}) {
  const b=clone(input), c=clone(command), a=b.actors[c.actorId], id=c.abilityId;
  for(const actor of Object.values(b.actors)) refreshDerived(actor);
  requireThat(!b.pending,'须先处理待定反应');
  requireThat(b.status==='active','战斗已结束或暂停');
  requireThat(a?.present,'参战者不存在');
  requireThat(a.controller!=='player'||playerAuthorized,'玩家角色须由玩家明确选择动作');
  requireThat(a.abilities.includes(id),'该参战者没有此能力');
  requireThat(Object.keys(c).every(k=>['actorId','abilityId','targetId','tier','empowered','finisher','strength','payment','to','enabled','resource'].includes(k)),'请求只能选择能力、目标与合法选项，不能给出骰值或结算数值');
  requireThat(id==='conversion'||a.id===b.activeId,'尚未轮到该参战者');
  requireThat(!unconscious(a),'已失去行动能力');
  requireThat(!physicalActions.has(id)||!frozen(a),'定身阻止该动作');
  const result={actorId:a.id,abilityId:id,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes:[]};
  const t=b.actors[c.targetId];
  const coolKey=['lightning','conduct'].includes(id)?'lightning':id;
  requireThat((a.cooldowns[coolKey]??0)<=b.round,'能力仍在冷却');
  if(['thunder','cleaveRock','lightning','conduct'].includes(id)) {
    if(['lightning','conduct'].includes(id)) requireThat([1,2,3].includes(c.tier),'御雷须选择tier1/2/3');
    pay(a,'灵力',['lightning','conduct'].includes(id)?[1,3,5][c.tier-1]:1,c.payment);
    a.cooldowns[coolKey]=b.round+1;
  }
  if(a.kind==='bright'&&!['strike','aim','conversion','end'].includes(id)) delete a.aim;
  switch(id) {
    case 'strike': case 'thunder': case 'cleaveRock': case 'lightning': case 'conduct':
      strike(b,a,t,c,result,drawDice); break;
    case 'draw':
      requireThat(a.sheathed,'刀已出鞘'); spend(a,'move'); a.sheathed=false;
      a.buffs.drawnRound=b.round; a.buffs.drawUsed=false; break;
    case 'sheathe':
      requireThat(!a.sheathed,'刀已在鞘'); spend(a,'move'); a.sheathed=true; delete a.buffs.block; break;
    case 'block':
      requireThat(!a.buffs.block,'本回合已格挡');
      requireThat(a.kind!=='huang'||!a.sheathed,'持刀才能白刃格挡');
      spend(a,a.kind==='huang'?'free':'move'); a.buffs.block=true; break;
    case 'zheng':
      requireThat(!a.buffs.block,'已经格挡');spend(a,'move');a.buffs.block=true;a.buffs.zheng=true;break;
    case 'tengzhuan':
      requireThat(!a.buffs.tengzhuan,'腾转已经生效');spend(a,'standard');
      requireThat(['风池','魔力'].includes(c.resource??'风池'),'需要合用能量');pay(a,c.resource??'风池',1);
      a.buffs.tengzhuan=true;(a.expires??={}).tengzhuan=b.round+10;break;
    case 'flow': {
      if(!['standard','move','swift','free'].includes(a.parameters?.flowAction)||!Number.isInteger(a.parameters?.flowMax))
        throw new RuleInputError('流风需要完整池上限与启动动作',`${a.id}.flow`);
      requireThat(!a.buffs.flow,'流风加速已经生效');
      requireThat([1,2].includes(c.tier),'流风选择1或2点');spend(a,a.parameters.flowAction);pay(a,'流风',c.tier);
      a.buffs.flow=c.tier;(a.expires??={}).flow=b.round+10;break;
    }
    case 'tornado': case 'gale': {
      requireThat(['风池','魔力'].includes(c.resource??'风池'),'需要合用能量');
      pay(a,c.resource??'风池',1);a.sheathed=false;
      const targets=id==='tornado'?[t]:Object.values(b.actors).filter(x=>x.present&&x.team!==a.team&&!unconscious(x)&&distance(a.position,x.position)<=20);
      requireThat(targets.length>0,'范围内无有效目标');
      for(let i=0;i<targets.length;i++) {
        if(i) a.state.turn.standard=1;
        strike(b,a,targets[i],{...c,targetId:targets[i].id},result,drawDice);
      }
      break;
    }
    case 'reload':
      if(!Number.isInteger(a.ammunition)) throw new RuleInputError('须提供当前普通箭数量',`${a.id}.ammunition`);
      requireThat(!a.loaded&&a.ammunition>0,'已上箭或没有箭矢');spend(a,'swift');a.loaded=true;break;
    case 'aim':
      requireThat(t?.present&&t.team!==a.team,'瞄准需要有效敌方目标');
      requireThat(a.aim?.pendingRound!==b.round,'本轮已瞄准');spend(a,'standard');
      a.aim={targetId:t.id,rounds:a.aim?.targetId===t.id?a.aim.rounds:0,pendingRound:b.round};break;
    case 'timeBolt': case 'timeHaste': {
      requireThat(t?.present&&distance(a.position,t.position)<=50,'目标须在50米内');
      if(id==='timeHaste') requireThat(!t.buffs.timeHaste,'时间加速已生效');
      spend(a,id==='timeHaste'?'full':'standard');pay(a,'导力',1);
      if(id==='timeHaste') t.buffs.timeHaste=true;
      else {
        const n=damageEvent(t,[{amount:1,severity:'B',kind:'energy',energyType:'mental'}],conversionFor(t,1),result);
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
      requireThat(!a.buffs.fistQi,'拳气已经生效'); spend(a,'swift'); pay(a,'气',1); a.buffs.fistQi=true; break;
    case 'breakBody':
      requireThat(!a.buffs.breakBody,'破身拳运功已经生效'); spend(a,'free'); pay(a,'斗气',1); a.buffs.breakBody=true; break;
    case 'restoreSwift':
      requireThat(!a.used.restoreSwift&&!a.state.turn.swift&&!a.state.turn.reactionLock,'迅捷未耗用、已使用过恢复或被反射锁定');
      a.used.restoreSwift=true; a.state.turn.swift=1;
      a.state.statuses.push({type:'疲乏',points:2,source:'高速恢复'}); break;
    case 'selfHeal': {
      requireThat(!a.used.selfHeal,'自我医疗已使用'); spend(a,'standard');
      const healed=heal(a,['A','L','B'],true); requireThat(healed,'没有可由本能力治疗的伤势');
      a.used.selfHeal=true; result.healing.push({actorId:a.id,severity:healed}); break;
    }
    case 'squeeze': {
      requireThat(['气','斗气'].includes(c.resource),'压榨须指定气或斗气');
      const p=a.state.resources[c.resource]; requireThat(p.current<p.max,'池已满');
      spend(a,'free'); a.squeezed++; p.current++;
      const strength=a.state.attributes.力量, will=a.state.attributes.意志;
      const severity=a.squeezed>strength+will?'A':'L';
      const recovery=a.squeezed>(strength+will)/2?'naturalOnly':a.squeezed>strength/2?'aggravated':null;
      const beforeA=a.state.health.A;
      damageEvent(a,[{amount:1,severity,kind:'physical'}],false,result);
      if(recovery) (a.recoveryLocks??=[]).push({severity:a.state.health.A>beforeA?'A':severity,count:1,recovery,source:'生命压榨'});
      break;
    }
    case 'conversion':
      requireThat(typeof c.enabled==='boolean'&&!a.used.damageConversion,'须设置enabled，且伤害转换尚未使用');
      requireThat(a.reactions.damageConversion!==c.enabled,'该伤害转换策略已设置，无需重复');
      a.reactions.damageConversion=c.enabled; break;
    case 'summon': {
      requireThat(!b.actors.lotus?.present,'乱红莲已经在场');
      requireThat(!b.actors.lotus||lifeStatus(b.actors.lotus.state).state!=='dead','乱红莲沉睡中');
      spend(a,'standard'); pay(a,'灵力',3,c.payment);
      b.actors.lotus??=makeLotus(a);
      const lotus=b.actors.lotus; lotus.present=true;
      lotus.position=[a.position[0],a.position[1]+1.5];
      if(!b.order.includes('lotus')) b.order.splice(b.order.indexOf(a.id)+1,0,'lotus');
      break;
    }
    case 'recall':
      requireThat(b.actors.lotus?.present,'乱红莲不在场'); spend(a,a.kind==='lotus'?'free':'standard');
      b.actors.lotus.present=false;
      if(a.kind==='lotus') advance(b,result);
      break;
    case 'roar': {
      requireThat(!a.used.roar,'本场景已咆哮'); requireThat(t?.present,'需要指定射线方向目标');
      spend(a,'full'); spend(a,'swift'); a.used.roar=true;
      const len=distance(a.position,t.position); requireThat(len>0,'射线方向无效');
      const vx=(t.position[0]-a.position[0])/len,vy=(t.position[1]-a.position[1])/len;
      for(const other of Object.values(b.actors)) {
        if(!other.present||other.id===a.id) continue;
        const dx=other.position[0]-a.position[0],dy=other.position[1]-a.position[1];
        const along=dx*vx+dy*vy,across=Math.abs(dx*vy-dy*vx);
        if(along<0||along>100||across>1) continue;
        const save=saveRoll(other,'reflex',drawDice,{recognizable:other.kind==='huang'&&distance(a.position,other.position)<=30});
        result.saves.push({targetId:other.id,...save});
        const n=Math.max(0,16+auto(b.actors[a.ownerId],'意志')-save.total);
        damageEvent(other,[{amount:n,severity:'L',kind:'energy',energyType:'force'}],conversionFor(other,n),result);
      }
      break;
    }
    case 'move': case 'step': {
      requireThat(Array.isArray(c.to)&&c.to.length===2&&c.to.every(Number.isFinite),'移动需to:[x,y]');
      const length=distance(a.position,c.to), maximum=id==='step'?Math.min(1.5,panel(b,a.id).speed):panel(b,a.id).speed;
      requireThat(length>0&&length<=maximum+1e-8,'移动距离超过可用速度');
      spend(a,id==='step'?'fiveFootStep':'move');
      if(id==='move') for(const foe of Object.values(b.actors)) {
        if(!foe.present||foe.team===a.team||unconscious(foe)||frozen(foe)||foe.state.turn.opportunityUsed||foe.sheathed) continue;
        if(distance(foe.position,a.position)<=foe.reach&&distance(foe.position,c.to)>foe.reach) {
          const sub={actorId:foe.id,abilityId:'strike',damage:[],statuses:[],saves:[]};
          // Opportunity trigger is supplied by this geometry, not by model input.
          strike(b,foe,a,{actorId:foe.id,abilityId:'strike',targetId:a.id},sub,drawDice,{opportunity:true});
          result.opportunities??=[]; result.opportunities.push(sub);
        }
      }
      if(!unconscious(a)) a.position=clone(c.to); break;
    }
    case 'end': advance(b,result); break;
    default: throw new RuleInputError('尚未适配的能力',`${a.id}.${id}`);
  }
  finishIfNeeded(b);
  result.after=stateResult(b,a.id,id).after;
  return {battle:b,result};
}

export function stateResult(b,actorId,abilityId,notes=[]) {
  return {actorId,abilityId,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes,
    after:{status:b.status,winner:b.winner,activeId:b.activeId,...(b.pending?{awaiting:b.pending.awaiting}:{}),
      participants:Object.values(b.actors).filter(x=>x.present).map(x=>({id:x.id,name:x.name,team:x.team,health:clone(x.state.health),energy:clone(x.state.resources),actions:clone(x.state.turn),position:clone(x.position),statuses:clone(x.state.statuses)}))}};
}

export const TACTICS='敌人与同伴沿用相同流程：按目标、已知信息和剩余资源选招。先核动作、距离、能量、冷却及友军范围；需要时防御、移动或撤退，不机械重复最高伤害招式。若是隔离演练，目标是完成对练、分出胜负；移动应服务于下一次攻击或明确恢复，不在没有后续计划时反复远离对手。程序面板和结算为准，不自行改数或掷骰。玩家角色的选择交给玩家。';

const nonzero = value => Object.fromEntries(Object.entries(value).filter(([,v]) => Boolean(v)));

// This is a read-only projection, never a second saved character state.
function compactPanel(b, a) {
  const p=panel(b,a.id), s=a.state;
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
      ...(s.statuses.some(x=>x.type===type&&x.restBlocked)?{restBlocked:true}:{})};
  }).filter(x=>x.points>0);
  const result={
    id:p.id,name:p.name,team:p.team,controller:p.controller,abilities:[...a.abilities],attributes:p.attributes,
    health,hpMax:p.hpMax,life:p.life,position:p.position,reach:a.reach,initiative:p.initiative,speed:p.speed,
    weaponReady:!a.sheathed,
    attack:{dp,...nonzero(attack)},
    defense:{total:p.defense.total,parts:nonzero(p.defense.parts),extraSuccesses:p.defense.extraSuccesses},
    actions,energy:p.energy,will:p.will,
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
  const locks=(a.recoveryLocks??[]).filter(x=>x.count>0);
  if(locks.length) result.recoveryLocks=clone(locks);
  return result;
}

function matchups(actors,b) {
  return actors.flatMap(a=>actors.filter(t=>t.team!==a.team&&(a.id===b.activeId||t.id===b.activeId)).map(t=>{
    const p=attackProfile(b,a.id,{targetId:t.id}), d=resolveDefense(b,t.id,a.id,p);
    return {attackerId:a.id,targetId:t.id,distanceM:Number(distance(a.position,t.position).toFixed(2)),
      inReach:distance(a.position,t.position)<=a.reach+1e-8,
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
    abilities:Object.fromEntries([...new Set(actors.flatMap(a=>a.abilities))].map(id=>[id,ABILITIES[id]])),
    passiveRules: Object.fromEntries(Object.entries({
      jiang:'拳掌含龙象：力判＋12、忽略4指定伤害防护、实伤后2L和4晕眩；红鹤高速4；破身恶化须破尽盔甲；每轮医疗1B/L。同目标每次攻击加下次增强1，封顶5。',
      huang:'刀16L/破甲8/破魔8；敏捷攻击上限22；先攻高于攻击者基础防御＋5；防御附成3。灵力可用payment:"restraint"代付，但精神束缚会减攻防和速度，超过意志5定身。',
    }).filter(([id])=>b.actors[id]?.present)),
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
