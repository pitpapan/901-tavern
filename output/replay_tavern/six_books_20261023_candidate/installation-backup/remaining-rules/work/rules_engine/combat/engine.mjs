import {pathFeatures} from './map.mjs';
import { beginTurn, endTurn, spendAction, lifeStatus, statusLevel, rollPool, resolveDamage,checkBeforeAction,advanceDeterioration,firstAid,checkModifiers,check,applyStatus } from '../core.mjs';
import {measurePath,clearLine,canObserve,blocking,contains,terrainCover,nearestPoint,spatialDistance,elevationAt,earthPath} from './map.mjs';
import {rememberTactic} from './tactics.mjs';
import { ABILITIES, makeLotus } from './catalog.mjs';
import {objectiveSatisfied} from './opening.mjs';
import {grappleChoice,grappleContest,attachClaw,releaseGrapple} from './grapple.mjs';
import {runSceneMechanism,advanceSceneTime,sceneBarriers} from '../gm_runtime/scene-rules.mjs';
import {reduceRecovery,advanceTime} from '../recovery.mjs';
import {triggerSpiritWard,ringTransfer} from '../possessions.mjs';
import { value, automatic, skill, attackSkill, equipment, profile, derived, refreshDerived, blockValue, saveProfile, rollCombatPool, RuleInputError, IllegalAction } from './mechanics.mjs';

const clone = x => structuredClone(x);
const sum = x => Object.values(x).reduce((n,v) => n + v, 0);
const points = (a,t) => statusLevel(a.state,t).points;
const auto = automatic;
const frozen = a => ['麻痹','精神束缚','纠缠','冻结'].some(t => statusLevel(a.state,t).severe);
const unconscious = a => a.construct&&a.state.health.intact===0 || !a.diehard && ['dead','unconscious'].includes(lifeStatus(a.state).state)
  || lifeStatus(a.state).state === 'dead' || statusLevel(a.state,'晕眩').severe || statusLevel(a.state,'剧痛').severe;
const penalty = a => ['麻痹','精神束缚','冻结','纠缠','晕眩','疲乏'].reduce((n,t) => n+points(a,t),0) + lifeStatus(a.state).woundPenalty;
const fail = text => { throw new IllegalAction(text); };
const requireThat = (ok,text) => { if (!ok) fail(text); };
const physicalActions = new Set(['strike','thunder','cleaveRock','lightning','conduct','move','step','block','draw','sheathe','roar','tornado','gale','zheng','reload','aim','door','destroy','shieldPush','calibrate','drawClub','readyBow','medicine']);

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
  if ((a.diehard||a.preActionCleared) && proxy.health.intact === 0 && lifeStatus(proxy).state !== 'dead') {
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
  if(a.ruleset==='opening-20261022') {
    weapon=w.damage;ap=w.ap??0;magic=w.magic??0;
    const target=b.actors[c.targetId],strengthAttack=c.strength===true||a.kind==='bright'&&a.weaponMode&&a.weaponMode!=='bow'||!['yulin','huang','bright'].includes(a.kind)&&!(a.kind==='mireya'&&a.weaponMode!=='club');
    rawDP=(strengthAttack?str:agi)+sk.level+weapon+(w.attackBonus??0);
    cap=profile(a).cap??weapon+sk.level+(strengthAttack?str:0);fixed=auto(a,strengthAttack?'力量':'敏捷')+sk.auto;
    if(a.kind==='yulin') {rawDP+=(strengthAttack?0:a.buffs.tengzhuan?4:2)+(a.buffs.flow??0)*2+(type==='gale'?3:0);reduction=type==='tornado'?8:w.defenseReduction??0;if(['tornado','gale'].includes(type))range=20;}
    if(a.kind==='huang') {
      const drawn=type==='strike'&&a.buffs.drawnRound===b.round&&!a.buffs.drawUsed;
      rawDP+=drawn?2:type==='thunder'?4:0;
      if(drawn&&target&&initiative(b,a)>initiative(b,target))extra=1;
      if(type==='thunder')electric=2;
      if(type==='cleaveRock'){ap+=4;ignore=1;}
    }
    if(a.kind==='jiang') {
      const bare=target&&!target.construct&&equipment(target).armor.defense===0;
      if(bare){weapon+=4;rawDP+=4;cap+=4;fixed++;}
      rawDP+=Math.min(1,a.combos[c.targetId]??0);speed=5;
      if(c.empowered)requireThat(false,'初始卡没有强化一击');
    }
    if(a.kind==='bright'&&(!a.weaponMode||a.weaponMode==='bow')) {
      const unit=w.rangeUnit??40,located=target&&spatialDistance(b.map,a.position,target.position)<=40;
      const aimed=Math.min(3,(located?1:0)+(a.aim&&a.aim.targetId===c.targetId?a.aim.rounds??0:0));
      rawDP+=aimed+(aimed>=2?2:0);cap=weapon*2+sk.level+w.strengthRequirement;
      if(target)rawDP-=Math.max(0,Math.ceil(spatialDistance(b.map,a.position,target.position)/unit)-1)*2;
      range=unit*8;aggravate=aimed>=3?1:0;extra=aimed>=3?1:0;
    }
    if(a.kind==='mireya'&&a.weaponMode!=='club') {
      const unit=w.rangeUnit;
      const calibration=a.calibration?.ready&&a.calibration.targetId===c.targetId&&canObserve(b,target,a.id)?3:0;
      rawDP+=calibration;cap=weapon*2+sk.level+w.strengthRequirement;
      if(target)rawDP-=Math.max(0,Math.ceil(spatialDistance(b.map,a.position,target.position)/unit)-1)*2;
      range=unit*8;
    }
  } else if (a.kind === 'jiang') {
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
    const safe=!a.interfered&&!Object.values(b.actors).some(t=>t.present&&t.team!==a.team&&!unconscious(t)&&spatialDistance(b.map,a.position,t.position)<=7.5);
    const obstacle=c.featureId&&b.map?.features.find(f=>f.id===c.featureId);
    const target=b.actors[c.targetId]??(obstacle?{position:nearestPoint(a.position,obstacle)}:null), unit=str*(w.rangePerStrength??50);
    const autoAim=target&&spatialDistance(b.map,a.position,target.position)<=unit*3?1+auto(a,'感知'):0;
    const aimed=Math.min(3,autoAim+(a.aim&&a.aim.targetId===c.targetId?a.aim.rounds??0:0));
    const weak=aimed>=3&&a.knownWeaknesses?.includes(c.targetId);
    weapon=w.damage;
    rawDP=agi+(safe?6:0)+sk.level+weapon+w.attackBonus+3+aimed+(weak?6:aimed>=2?2:0);
    if(target) rawDP-=Math.max(0,Math.ceil(spatialDistance(b.map,a.position,target.position)/unit)-1)*2;
    cap=Number.isInteger(w.strengthRequirement)?weapon*2+sk.level+w.strengthRequirement:null;
    fixed=Math.max(0,Math.floor((agi+(safe?6:0)-1)/5))+sk.auto;
    ap=w.ap; magic=w.magic; range=unit*10; explode=9; aggravate=weak?2:0;
  } else { weapon=w.damage; rawDP=str+sk.level+weapon+w.attackBonus; cap=weapon+sk.level+str; fixed=auto(a,'力量')+sk.auto; ap=w.ap; magic=w.magic; }
  rawDP-=checkModifiers(a.state,{context:{attack:true,physical:true,visual:!a.windSense&&!a.spiritSight}}).penalty;
  if(type==='doubleStrike')rawDP-=2;
  if(a.state.timedEffects?.thunderPotion?.remainingMinutes>0)rawDP+=4;
  rawDP-=a.state.grapple?.margin??0;
  if (a.diehard && a.state.health.intact===0) rawDP+=a.state.health.A?3:a.state.health.L?2:1;
  return { rawDP, dp:rawDP, weapon, cap, fixed, ap, magic, speed, extra, ignore, aggravate, electric, reduction, range, explode,spiritEligible:a.spiritStrike===true||magic>0 };
}

function initiative(b,a) { const n=a.initiativeOverride??derived(a).initiative-points(a,'亢奋');return statusLevel(a.state,'耳鸣').severe?Math.floor(n/2):n; }

export function resolveDefense(b, id, attackerId, attack = {}) {
  const source=b.actors[id], attacker=b.actors[attackerId];
  const defenseMode=attack.defenseMode??source.defenseIntent?.mode;
  if(b.playerDefenseDeclarations&&source.controller==='player'&&!defenseMode)return {pending:true};
  const a=b.playerDefenseDeclarations&&source.controller==='player'&&defenseMode==='normal'
    ?{...source,buffs:{...source.buffs,block:false,zheng:false}}:source;
  const eq=equipment(a), base=Math.max(0,Math.min(value(a,'敏捷'),value(a,'感知'))-(eq.armor.basePenalty??0));
  let p={base,natural:profile(a).natural,armor:eq.armor.defense,
    dodge:auto(a,'敏捷'),insight:auto(a,'感知'),block:a.buffs.block&&!a.sheathed?blockValue(a):0};
  p.cover=attacker?terrainCover(b.map,attacker.position,a.position):0;
  if(a.ruleset==='opening-20261022') {p.dodge=0;p.insight=0;}
  p.dodge+=a.dodgeBonus??0;
  if(eq.armor.shield)p.shield=eq.armor.shield;
  if(a.kind==='radwick'&&a.buffs.brace&&!attack.nonphysical)p.enhancement=3;
  if(['huang','bright'].includes(a.kind)&&attacker&&initiative(b,a)>initiative(b,attacker)) p.base+=a.ruleset==='opening-20261022'?profile(a).initiativeDefense??0:5;
  if(a.kind==='huang'&&a.ruleset!=='opening-20261022') p.cultivation=a.sheathed?0:6;
  if(a.kind==='jiang'||a.kind==='lotus') { p.dodge=0;p.insight=0; }
  if(a.kind==='yulin') {
    p.dodge+=a.buffs.tengzhuan?4:2; p.insight=0;
    p.deflection=a.buffs.zheng?attackSkill(a).level+auto(a,'智力'):a.state.possessions?.phaseRing?.worn===false?0:2;
    if(a.ruleset!=='opening-20261022')p.force=a.buffs.block?Math.max(1,eq.weapon.force??0):1;
  }
  if (frozen(a) || unconscious(a)) { p.base=0; p.dodge=0; p.block=0; }
  if(statusLevel(a.state,'沮丧').severe){p.dodge=0;p.block=0;}
  if(a.state.grapple?.pressed){p.base=0;p.dodge=0;p.block=0;}
  if(attacker&&(a.state.grapple&&a.state.grapple.holderId!==attackerId||a.claws?.some(id=>id&&id!==attackerId)))p.base=0;
  const eat=(keys,n) => { for(const k of keys) { const v=Math.min(p[k]??0,n); p[k]=(p[k]??0)-v; n-=v; } return n; };
  const restraint=points(a,'精神束缚')+points(a,'麻痹')+points(a,'纠缠')+points(a,'冻结')+points(a,'剧痛');
  eat(['base','dodge','block'],restraint+lifeStatus(a.state).woundPenalty);
  eat(['block'],a.state.grapple?.margin??0);
  const terrainPenalty=Math.max(0,...(b.map?.features??[]).filter(f=>!f.destroyed&&contains(a.position,f)).map(f=>f.defensePenalty??0));
  eat(['base','dodge','block'],Math.max(0,terrainPenalty-(a.kind==='yulin'&&a.buffs.tengzhuan?5:0))+points(a,'亢奋'));
  if (a.buffs.iaiPenalty) eat(['base','dodge','block','insight','cultivation','armor','natural'],2);
  if (attack.contact) { p.armor=0; p.natural=0; }
  eat(['base','dodge','block','insight','cultivation'],Math.max(0,(attack.speed??0)-(a.kind==='yulin'?(a.buffs.bulletTime?8:5):0)));
  const protectedDeflection=a.buffs.zheng?p.deflection:0;
  if(attack.reduction===8) eat(['base','dodge','block','insight','cultivation','armor','natural','force',...(protectedDeflection?[]:['deflection'])],8);
  else eat(['base','dodge','block'],attack.reduction??0);
  const remainingAP=eat(['cover','force','device','shield','armor','natural'],attack.ap??0);
  eat(['luck','morale','enhancement','holy','technique','performance','intrinsic','unnamed'],attack.magic??0);
  return { total:sum(p), parts:p, remainingAP,guarded:Boolean(a.buffs.block&&!a.sheathed&&!frozen(a)&&!unconscious(a)),
    extraSuccesses:frozen(a)||unconscious(a)?0:a.ruleset==='opening-20261022'?(p.block? (a.kind==='bright'?skill(a,'白刃').auto:attackSkill(a).auto):0):auto(a,'敏捷')+auto(a,'感知')+(eq.armor.defenseAuto??0) };
}

export function panel(b,id,attackerId) {
  const a=clone(b.actors[id]);refreshDerived(a);
  const s=a.state;
  const d=derived(a);
  let speed=(points(a,'纠缠')?Math.floor(d.speed/2):d.speed)-penalty(a)+lifeStatus(s).woundPenalty;
  if(statusLevel(s,'目眩').severe&&!a.windSense)speed-=Math.ceil(d.speed/2);
  if (statusLevel(s,'疲乏').severe) speed-=Math.ceil(d.speed/2);
  if (frozen(a)||unconscious(a)) speed=0;
  else if(a.state.timedEffects?.thunderPotion?.remainingMinutes>0)speed+=10;
  if(a.landMultiplier)speed*=a.landMultiplier;
  if(a.underground)speed=Math.min(8,Math.max(0,d.speed-penalty(a)));
  return { id, name:a.name, team:a.team, controller:a.controller, attributes:clone(s.attributes),
    health:clone(s.health), hpMax:s.derived.hpMax, life:unconscious(a)?'失去行动能力':'可行动',
    position:clone(a.position), initiative:initiative(b,a), speed:Math.max(0,speed),
    attack:attackProfile(b,id), defense:resolveDefense(b,id,attackerId), actions:clone(s.turn),
    energy:clone(s.resources), will:clone(s.will), statuses:clone(s.statuses),
    buffs:clone(a.buffs), combos:clone(a.combos), cooldowns:clone(a.cooldowns), used:clone(a.used),
    reactions:clone(a.reactions), sheathed:a.sheathed };
}

function saveRoll(a,type,drawDice,{ recognizable=false, speed=0, cover=0 }={}) {
  const {dp:base,fixed,extra}=saveProfile(a,type,{recognizable,speed});
  const dp=base+(type==='reflex'?cover:0)-checkModifiers(a.state,{context:{willResistance:type==='will',physical:type!=='will',motion:type==='reflex',reflex:type==='reflex'}}).penalty;
  const r=rollPool(dp,drawDice());
  return { ...r, fixed, extra:r.rolledSuccesses>0?extra:0,total:r.rolledSuccesses+fixed+(r.rolledSuccesses>0?extra:0), type };
}

function inflictStatus(a,type,count,source,drawDice) {
  if(type==='麻痹'&&a.immunities?.includes('nerveParalysis'))return {type,points:count,remaining:0,immune:true};
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

function strike(b,a,t,c,result,drawDice,{opportunity=false,deferPlayerDefense=false,defenseDeclarations={},grappleDeclarations={},feature}={}) {
  requireThat(t?.present&&(feature||!unconscious(t)),'目标不在场或已失去行动能力');
  const range=attackProfile(b,a.id,c).range;
  if(a.territory)requireThat(Math.hypot(t.position[0]-a.territory.center[0],t.position[1]-a.territory.center[1])<=a.territory.radius,'目标已在固定阵地圈外');
  requireThat(spatialDistance(b.map,a.position,t.position)<=range+1e-8,'目标不在攻击范围内');
  requireThat(clearLine(b.map,a.position,t.position),'攻击路线被实体障碍阻挡');
  requireThat(canObserve(b,t,a.id),'目标不在视线内；当前能力没有盲攻判定');
  requireThat(a.kind!=='huang'||!a.sheathed,'须先拔刀');
  requireThat(!a.state.grapple&&!a.claws?.includes(t.id),'擒抱中的攻击须使用擒抱内攻击动作');
  if(a.kind==='chuul') {
    requireThat(a.claws.some(x=>!x),'所有螯已被占用');
    if(!deferPlayerDefense&&t.state.size<=7)grappleChoice(t,grappleDeclarations[t.id]);
  }
  if(c.empowered) {
    requireThat(a.kind==='jiang'&&a.buffs.fistQi,'强化一击须先有拳气');
    pay(a,'气',2);
  }
  if(c.finisher) requireThat(a.kind==='jiang'&&(a.combos[t.id]??0)===(a.ruleset==='opening-20261022'?1:5),a.ruleset==='opening-20261022'?'D级终结需要该目标1层':'终结技需要该目标5层');
  const p=attackProfile(b,a.id,c);
  requireThat(!t.spirit||p.spiritEligible,'当前武器没有攻击灵体的资格');
  requireThat(!(a.kind==='bright'&&a.weaponMode==='empty'),'须先取出已持有的武器');
  if(p.cap===null) throw new RuleInputError('苍穹弓伤害上限需要武器力量要求',`${a.id}.bowStrength`);
  if(a.kind==='bright'&&(!a.weaponMode||a.weaponMode==='bow')||a.kind==='mireya'&&a.weaponMode!=='club') {
    requireThat(a.loaded,'须先上箭');
    requireThat(a.ammunition>0,'没有可用箭矢');
  }
  if(opportunity&&lifeStatus(a.state).state==='B-check'&&!a.preActionCleared){
    const dc=a.parameters?.preActionDC;if(!Number.isSafeInteger(dc))throw new RuleInputError('借机行动前须给力量检定DC',`${a.id}.preActionDC`);
    const pre=checkBeforeAction(a.state,{dc,dice:drawDice()});a.state=pre.state;result.preActionCheck=pre.result;if(!pre.result.allowed)return;a.preActionCleared=true;
  }
  if(opportunity) spend(a,'opportunity','attack'); else spend(a,'attack','attack');
  if(opportunity)delete a.preActionCleared;
  if(b.playerDefenseDeclarations&&t.controller==='player'&&deferPlayerDefense&&!t.defenseIntent) {
    result.attack={...p,pendingDefense:true};return;
  }
  if(a.evilSpirit&&!feature) {
    const ward=triggerSpiritWard(t.state);t.state=ward.state;
    if(ward.result.protected){result.spiritWard={targetId:t.id,...ward.result};result.notes.push('恶灵提示符燃烧保护，恶灵这次攻击不能伤害持有者。');return;}
  }
  const linkedIds=feature?[]:[...new Set([t.state.grapple?.holderId,...(t.claws??[])].filter(id=>id&&id!==a.id))];
  let grappleDefense;
  if(linkedIds.length){
    const members=[t,...linkedIds.map(id=>b.actors[id])];
    if(members.some(m=>!m))throw new RuleInputError('擒抱人物缺少当前状态','grapple.members');
    if(deferPlayerDefense){result.attack={...p,pendingDefense:true};return;}
    const defenses=members.map(m=>resolveDefense(b,m.id,a.id,{...p,defenseMode:defenseDeclarations[m.id]}));
    requireThat(defenses.every(d=>!d.pending),'须先声明擒抱中可能受击者的防御');
    grappleDefense=defenses.reduce((low,d)=>d.total<low.total?d:low);
    const sizes=new Set(members.map(m=>m.state.size));
    if(members.length!==2||sizes.size!==1)throw new RuleInputError('第三方攻击擒抱：体积不同或多人时须先裁定各方命中权重，尚未投实际攻击骰','grapple.hitWeights');
    const chosen=drawDice()[0]<=5?0:1;t=members[chosen];result.grappleTarget={declared:c.targetId,actual:t.id,defense:grappleDefense.total};
  }
  const d=grappleDefense??(feature?{total:0,parts:{},remainingAP:p.ap,extraSuccesses:0}:resolveDefense(b,t.id,a.id,{...p,contact:c.abilityId==='conduct',defenseMode:defenseDeclarations[t.id]}));
  requireThat(!d.pending,'须先由玩家声明本次防御方式，再计算防御');
  if(!feature&&t.kind==='radwick')delete t.buffs.brace;
  if(!feature)(result.responses??=[]).push({targetId:t.id,guarded:d.guarded});
  const roll=rollCombatPool(p.rawDP-d.total,drawDice(),p.explode);
  const afterDefense=Math.max(0,roll.rolledSuccesses+p.fixed-d.extraSuccesses);
  const extra=roll.rolledSuccesses>0&&afterDefense>0?p.extra:0;
  const amount=Math.min(p.cap,afterDefense+extra);
  result.attack={...p,defense:d,roll,extra,amount};
  if (a.kind==='jiang'&&!feature) {
    if(a.ruleset==='opening-20261022') {
      delete a.combos[t.id];delete a.comboExpires?.[t.id];
      if(afterDefense>0&&!c.finisher){a.combos[t.id]=1;(a.comboExpires??={})[t.id]=b.round+1;}
    }
    else a.combos[t.id]=c.finisher?0:Math.min(5,(a.combos[t.id]??0)+1);
  }
  if (a.kind==='huang' && a.buffs.drawnRound===b.round && !a.buffs.drawUsed && c.abilityId!=='conduct') {
    a.buffs.drawUsed=true; a.buffs.iaiPenalty=true;
  }
  if(c.empowered) a.buffs.fistQi=false;
  if(a.kind==='bright'&&(!a.weaponMode||a.weaponMode==='bow')||a.kind==='mireya'&&a.weaponMode!=='club') {a.loaded=false;a.ammunition--;delete a.aim;delete a.calibration;}
  if(a.kind==='yulin') a.attackedRound=b.round;
  if(feature) {
    // Use the same normal weapon roll, cap, ammo and attack action. Structural
    // damage cannot inflict living-target ailments or pass through to a second target.
    const hardness=Math.max(0,feature.durability.hardness-p.ignore),before=feature.durability.current;
    const structuralDamage=Math.min(before,Math.max(0,amount-hardness));
    feature.durability.current-=structuralDamage;
    if(feature.durability.current===0)feature.destroyed=true;
    result.terrain={featureId:feature.id,label:feature.label,kind:'damage',structuralDamage,
      destroyed:feature.destroyed===true,outcome:feature.destroyed?'障碍所标记的这一段已被破坏，通路打开':structuralDamage?(feature.kind==='door'&&feature.open?'打开的门扇受损，通路仍然开放':'障碍受损，仍然阻挡通行'):'这一击未能破坏障碍'};
    return;
  }
  if(!amount) return;
  if(a.kind==='chuul'&&c.abilityId!=='doubleStrike'&&!unconscious(t))
    (result.grapples??=[]).push(attachClaw(b,a,t,{drawDice,defense:grappleDeclarations[t.id]}));
  if(range<=a.reach)delete t.calibration;
  if(a.kind!=='bright') delete t.aim;
  if(c.abilityId==='conduct') {
    result.statuses.push({targetId:t.id,...inflictStatus(t,'麻痹',c.tier*4,'御雷·导电',drawDice)}); return;
  }
  let aggravated=Math.min(amount,p.aggravate);
  if(a.kind==='jiang'&&a.ruleset!=='opening-20261022' && !d.parts.armor) aggravated=Math.min(amount,Math.floor(p.weapon/2),5);
  const electric=a.ruleset==='opening-20261022'?Math.min(amount,p.electric):Math.floor(amount*p.electric);
  // Allocate the worsened points to the electrical part first. No duplicate damage:
  // total segment amounts must equal the capped attack successes.
  const ea=Math.min(electric,aggravated), pa=aggravated-ea;
  const converted=conversionFor(t,amount);
  const bypass={conversion:a.kind==='jiang'&&a.ruleset!=='opening-20261022'?4:0,defenses:p.ignore};
  const before=result.damage.length;
  const inflicted=damageEvent(t,[
    {amount:ea,severity:'A',kind:'energy',energyType:'electric'},
    {amount:pa,severity:'A',kind:'physical'},
    {amount:electric-ea,severity:'L',kind:'energy',energyType:'electric'},
    {amount:amount-electric-pa,severity:profile(a).severity??'L',kind:'physical'},
  ],converted,result,bypass);
  if(c.abilityId==='thunder') {
    const actualElectric=result.damage.slice(before).filter(x=>x.energyType==='electric').reduce((n,x)=>n+x.actualDamage,0);
    if(actualElectric) result.statuses.push({targetId:t.id,...inflictStatus(t,'麻痹',actualElectric,'雷鸣剑',drawDice)});
  }
  if(a.kind==='jiang'&&a.ruleset!=='opening-20261022'&&inflicted>0) {
    // 龙象 is part of this attack for the once-per-attack 901 conversion.
    damageEvent(t,[{amount:2,severity:'L',kind:'physical'}],converted,result,bypass);
    result.statuses.push({targetId:t.id,...inflictStatus(t,'晕眩',4,'龙象·沉劲震体',drawDice)});
  }
  if(c.abilityId==='lightning'&&c.tier===3&&inflicted>0) {
    for(const other of Object.values(b.actors)) if(other.present&&other.id!==t.id&&spatialDistance(b.map,other.position,t.position)<=1.5&&clearLine(b.map,t.position,other.position)) {
      const save=saveRoll(other,'reflex',drawDice,{recognizable:other.kind==='huang'&&spatialDistance(b.map,other.position,a.position)<=30,cover:terrainCover(b.map,t.position,other.position)});
      result.saves.push({targetId:other.id,...save});
      const n=Math.max(0,8-save.total);
      damageEvent(other,[{amount:n,severity:'L',kind:'energy',energyType:'electric'}],conversionFor(other,n),result);
    }
  }
}

function finishIfNeeded(b) {
  if(b.status==='finished')return;
  if(b.arena) {
    const stopped=Object.values(b.actors).filter(a=>a.present&&(unconscious(a)||a.state.health.intact<=b.arena.stopIntact));
    if(stopped.length) {
      const remaining=Object.values(b.actors).filter(a=>a.present&&!stopped.includes(a));
      b.status='finished';b.winner=remaining.length===1?remaining[0].team:'平局';
      b.resolution={kind:'refereeStop',taskComplete:false,xpAwarded:0,stoppedActorIds:stopped.map(a=>a.id),text:'按本场预告的终止条件，练习结束；现有伤势与资源保留。'};return;
    }
  }
  if(objectiveSatisfied(b)){b.status='finished';b.winner=b.objective.label;b.resolution={kind:b.objective.resolutionKind??'objective',taskComplete:false,xpAwarded:0,text:b.objective.description};return;}
  const teams=new Set(Object.values(b.actors).filter(a=>a.present&&!unconscious(a)).map(a=>a.team));
  if(teams.size<=1) { b.status='finished'; b.winner=[...teams][0]??'平局'; }
}

function advance(b,result,choices={},drawDice=randomDice) {
  const old=b.actors[b.activeId]; old.state=endTurn(old.state).state;
  for(const s of old.state.statuses.filter(s=>s.roundResistance==='chuul')) {
    const key=value(old,'力量')<=value(old,'意志')?'力量':'意志',res=check(old.state,{attribute:key,skill:'求生',dice:drawDice()});
    s.points=Math.max(0,s.points-res.total);result.saves.push({targetId:old.id,status:s.type,...res});
  }
  old.state.statuses=old.state.statuses.filter(s=>s.points>0);
  if(old.ruleset==='opening-20261022')for(const [target,expiry]of Object.entries(old.comboExpires??{}))
    if(expiry<=b.round){delete old.combos[target];delete old.comboExpires[target];}
  b.turnTaken??=[]; if(!b.turnTaken.includes(old.id)) b.turnTaken.push(old.id);
  const oldIndex=b.order.indexOf(old.id);
  if(old.buffs.timeHaste&&oldIndex>0&&!b.actors[b.order[oldIndex-1]].buffs.timeHaste) {
    const previous=b.actors[b.order[oldIndex-1]];
    b.order.splice(oldIndex,1);b.order.splice(oldIndex-1,0,old.id);
    old.initiativeOverride=initiative(b,previous)+1;
  }
  if(!b.order.some(id=>!b.turnTaken.includes(id)&&b.actors[id].present&&!unconscious(b.actors[id]))) {
      b.round++; b.elapsedRounds++;
      (result.sceneChanges??=[]).push(...advanceSceneTime(b.ruleScene,.1));
      b.turnTaken=[];
      for(const a of Object.values(b.actors)) if(a.kind==='jiang'&&!unconscious(a)) {
        const healed=heal(a,['L','B']); if(healed) result.healing.push({actorId:a.id,severity:healed});
      }
      for(const a of Object.values(b.actors)) {
        advanceTime(a,.1);
        a.state.statuses=a.state.statuses.filter(s=>!s.expiresRound||s.expiresRound>b.round);
        if(a.underground&&a.underground.expiresRound<=b.round) {
          if(!(b.map?.features??[]).some(f=>!f.destroyed&&f.earthExit&&contains(a.position,f)))throw new RuleInputError('土遁期限已到，当前位置缺少可用出口；须处理实际出口',`${a.id}.earthExit`);
          a.underground.mustEmerge=true;result.notes.push(`${a.name}土遁期限到，下次必须标准动作出土。`);
        }
        if(a.present&&lifeStatus(a.state).deteriorating) {
          if(a.state.health.B&&a.state.health.L&&!choices[a.id])throw new RuleInputError('本轮恶化须主持指定将B或L转为A',`deteriorationChoices.${a.id}`);
          const deterioration=advanceDeterioration(a.state,{from:choices[a.id]});a.state=deterioration.state;
          (result.deterioration??=[]).push({actorId:a.id,...deterioration.result});
        }
        if(a.kind==='yulin'&&a.ruleset!=='opening-20261022') a.buffs.bixie=a.attackedRound===b.round-1?Math.min(attackSkill(a).level,(a.buffs.bixie??0)+1):0;
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
    delete a.defenseIntent;
    if(a.aim?.pendingRound<b.round) {a.aim.rounds=Math.min(3,(a.aim.rounds??0)+1);delete a.aim.pendingRound;}
    if(a.calibration) {
      if(a.calibration.ready||!canObserve(b,b.actors[a.calibration.targetId],a.id))delete a.calibration;
      else a.calibration.ready=true;
    }
    a.state=beginTurn(a.state).state;
    return;
  }
  finishIfNeeded(b);
  if(b.status!=='finished') { b.status='paused'; result.notes.push('无可行动单位，需要处理异常状态。'); }
}

export function opportunityActors(b,c) {
  if(c.abilityId!=='move'||!Array.isArray(c.to))return [];
  const a=b.actors[c.actorId];
  const threatens=(foe,p)=>Math.min(Math.abs(p[0]-foe.position[0]),Math.abs(p[1]-foe.position[1]))<1e-8&&
    spatialDistance(b.map,foe.position,p)<=Math.min(foe.reach,b.map?.gridSize??1.5)+1e-8;
  return Object.values(b.actors).filter(foe=>foe.present&&foe.team!==a.team&&!unconscious(foe)&&!frozen(foe)&&
    !foe.state.turn.opportunityUsed&&!foe.sheathed&&threatens(foe,a.position)&&[...(c.via??[]),c.to].some(p=>!threatens(foe,p))&&clearLine(b.map,foe.position,a.position));
}

// Use the same affected set for actual damage, previews and reaction windows.
export function galeTargets(b,c) {
  const a=b.actors[c.actorId];
  return Object.values(b.actors).filter(x=>x.present&&x.id!==a.id&&x.team!==a.team&&!unconscious(x)&&
    spatialDistance(b.map,a.position,x.position)<=20&&canObserve(b,x,a.id)&&clearLine(b.map,a.position,x.position));
}

// Sight-only cover does not stop the roar's area effect; solid terrain does.
export function roarTargets(b,c) {
  const a=b.actors[c.actorId],t=b.actors[c.targetId];
  if(!a?.present||!t?.present)return [];
  const len=spatialDistance(b.map,a.position,t.position);if(!len)return [];
  const vx=(t.position[0]-a.position[0])/len,vy=(t.position[1]-a.position[1])/len,vz=(elevationAt(b.map,t.position)-elevationAt(b.map,a.position))/len;
  return Object.values(b.actors).filter(other=>{
    if(!other.present||other.id===a.id)return false;
    const dx=other.position[0]-a.position[0],dy=other.position[1]-a.position[1],dz=elevationAt(b.map,other.position)-elevationAt(b.map,a.position);
    const along=dx*vx+dy*vy+dz*vz,across=Math.sqrt(Math.max(0,dx*dx+dy*dy+dz*dz-along*along));
    return along>=0&&along<=100&&across<=1&&clearLine(b.map,a.position,other.position);
  });
}

function summonPosition(b,a,to) {
  if(to!==undefined)requireThat(Array.isArray(to)&&to.length===2&&to.every(Number.isFinite)&&
    spatialDistance(b.map,a.position,to)>0&&spatialDistance(b.map,a.position,to)<=1.5+1e-8,'召唤落点须为相邻1.5米内的有效坐标');
  // Preserve the old default in open terrain; blocked defaults try the other
  // adjacent directions. An explicitly declared point is never substituted.
  const directions=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,-1],[-1,1]];
  const candidates=to===undefined?directions.map(v=>a.position.map((n,i)=>n+v[i]*1.5/Math.hypot(...v))):[to];
  const position=candidates.find(p=>measurePath(b.map,a.position,p).valid&&!blocking(b.map).some(f=>contains(p,f)));
  requireThat(position,'没有可用的相邻召唤落点；须避开实体障碍和封闭边界');
  return [...position];
}

export function act(input,command,{drawDice=randomDice,playerAuthorized=false,deferPlayerDefense=false,defenseDeclarations={},grappleDeclarations={},opportunityDeclarations={}}={}) {
  const b=clone(input), c=clone(command), a=b.actors[c.actorId], id=c.abilityId;
  if(b.map)b.map.ruleBarriers=sceneBarriers(b.ruleScene);
  for(const actor of Object.values(b.actors)) refreshDerived(actor);
  requireThat(!b.pending,'须先处理待定反应');
  requireThat(b.status==='active','战斗已结束或暂停');
  requireThat(a?.present,'参战者不存在');
  requireThat(a.controller!=='player'||playerAuthorized,'玩家角色须由玩家明确选择动作');
  requireThat(a.abilities.includes(id)||['firstAid','escapeGrip','pressGrip','grappleAttack','ringStore','ringRetrieve','mechanism'].includes(id)||id==='medicine'&&a.state.inventory||id==='door'||id==='destroy'&&a.abilities.includes('strike'),'该参战者没有此能力');
  const commandKeys=id==='medicine'?['actorId','abilityId','medicine','resource','choice','statusIndex']:['door','destroy'].includes(id)?['actorId','abilityId','featureId',...(id==='door'?['open']:[])]:['actorId','abilityId','targetId','tier','empowered','finisher','strength','payment','to','via','enabled','resource'];
  commandKeys.push('preActionDC','deteriorationChoices',...(id==='readyWeapon'?['weapon']:[]),...(id==='doubleStrike'?['secondTargetId']:[]),...(id==='morph'?['form']:[]),...(id==='releaseGrip'?['claw']:[]),...(id==='escapeGrip'?['method']:[]),...(['move','step'].includes(id)?['run','climb']:[]));
  if(['ringStore','ringRetrieve'].includes(id))commandKeys.push('itemId');
  if(id==='mechanism')commandKeys.push('objectId','operation','part');
  requireThat(Object.keys(c).every(k=>commandKeys.includes(k)),'请求只能选择能力、目标与合法选项，不能给出骰值或结算数值');
  requireThat(id==='conversion'||a.id===b.activeId,'尚未轮到该参战者');
  requireThat(!unconscious(a),'已失去行动能力');
  requireThat(!a.underground?.mustEmerge||['emerge','end'].includes(id),'土遁期限已到，须标准动作出土');
  requireThat(!a.underground||['move','emerge','end'].includes(id),'地下不能攻击或使用地面动作');
  requireThat(!physicalActions.has(id)||!frozen(a),'定身阻止该动作');
  const result={actorId:a.id,abilityId:id,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes:[]};
  if(id!=='end'&&id!=='conversion'&&!a.diehard&&lifeStatus(a.state).state==='B-check') {
    const dc=c.preActionDC??a.parameters?.preActionDC;
    if(!Number.isSafeInteger(dc)||dc<1)throw new RuleInputError('B伤满格须主持给出行动前力量检定DC',`${a.id}.preActionDC`);
    const pre=checkBeforeAction(a.state,{dc,dice:drawDice()});a.state=pre.state;result.preActionCheck=pre.result;
    if(!pre.result.allowed){result.notes.push('行动前力量检定失败，昏迷；原行动未执行。');finishIfNeeded(b);result.after=stateResult(b,a.id,id).after;return {battle:b,result};}
    a.preActionCleared=true;
  }
  const t=b.actors[c.targetId];
  const coolKey=['lightning','conduct'].includes(id)?'lightning':id;
  requireThat((a.cooldowns[coolKey]??0)<=b.round,'能力仍在冷却');
  if(['thunder','cleaveRock','lightning','conduct'].includes(id)) {
    if(['lightning','conduct'].includes(id)) requireThat([1,2,3].includes(c.tier),'御雷须选择tier1/2/3');
    pay(a,'灵力',['lightning','conduct'].includes(id)?[1,3,5][c.tier-1]:1,c.payment);
    a.cooldowns[coolKey]=b.round+1;
  }
  if(a.kind==='bright'&&!['strike','aim','conversion','end'].includes(id)) delete a.aim;
  if(a.kind==='mireya'&&['move','step','block','drawClub','readyBow','door','destroy','aim'].includes(id))delete a.calibration;
  switch(id) {
    case 'mechanism':result.mechanism=runSceneMechanism(b,c,{combat:true,preActionCleared:a.preActionCleared});if(b.map)b.map.ruleBarriers=sceneBarriers(b.ruleScene);break;
    case 'ringStore':case 'ringRetrieve': {
      const out=ringTransfer(a,{operation:id==='ringStore'?'store':'retrieve',itemId:c.itemId},{combat:true,preActionCleared:a.preActionCleared});Object.assign(a,out.actor);result.inventory=out.result;break;
    }
    case 'escapeGrip': {
      const g=a.state.grapple,holder=b.actors[g?.holderId];requireThat(holder&&['strength','agility'].includes(c.method),'须选择当前擒抱的逃脱方式');
      spend(a,'attack');const contest=grappleContest(a,holder,{drawDice,activeAgility:c.method==='agility',defense:'strength'});
      if(contest.success){if(g.pressed)g.pressed=false;else releaseGrapple(b,a);}result.grapple=contest;break;
    }
    case 'pressGrip':case 'grappleAttack': {
      const g=t?.state.grapple;requireThat(g?.holderId===a.id,'目标并未被自己擒抱');
      requireThat(id!=='pressGrip'||g.sinceRound<b.round,'下一轮才能压制');
      if(id==='pressGrip') {
        spend(a,'attack');const contest=grappleContest(a,t,{drawDice,defense:grappleDeclarations[t.id]});
        if(contest.success){g.pressed=true;g.margin=contest.margin;}result.grapple=contest;
      } else {
        requireThat(a.kind==='chuul'||(equipment(a).weapon.size??a.weaponSize??Infinity)<=a.state.size-3,'该武器体积不适于擒抱内攻击');
        spend(a,g.pressed?'standard':'full');const contest=g.pressed?{success:true}:grappleContest(a,t,{drawDice,defense:grappleDeclarations[t.id]});result.grapple=contest;
        if(contest.success){const roll=check(a.state,{attribute:'力量',skill:'肉搏',dice:drawDice(),context:{physical:true,attack:true}});result.grappleAttack=roll;
          damageEvent(t,[{amount:roll.total,severity:'B',kind:'physical'}],conversionFor(t,roll.total),result);}
      }break;
    }
    case 'hypnotize': {
      const facts=b.sceneFacts?.hypnosis?.[a.id]?.[c.targetId];
      requireThat(t?.present&&!t.construct&&!t.immunities?.includes('charm')&&spatialDistance(b.map,a.position,t.position)<=10,'目标不在催眠范围或不能受心智影响');
      requireThat(canObserve(b,t,a.id)&&canObserve(b,a,t.id)&&facts?.understands&&facts?.hears&&facts?.recognizesDakas&&typeof facts.instruction==='string'&&facts.instruction.trim(),'催眠须双方看见、听懂指示，并有已确认的达卡斯形象与一条指示');
      spend(a,'standard');pay(a,'魔力',2);
      const roll=check(a.state,{attribute:'风度',skill:'魔法',sub:'催眠',dice:drawDice(),context:{mentalPower:true}});
      const source=`催眠:${a.id}`,out=applyStatus(t.state,{type:'魅惑',source,points:roll.total,dice:drawDice()});t.state=out.state;
      for(const s of t.state.statuses.filter(s=>s.source===source))Object.assign(s,{restBlocked:true,controllerName:'达卡斯',instruction:facts.instruction,magic:true});
      result.statuses.push({targetId:t.id,roll,...out.result});break;
    }
    case 'doubleStrike': {
      requireThat(a.kind==='chuul'?a.claws.every(x=>!x):a.weaponsAvailable===2,'双击需要两件可用武器或两只空螯');
      requireThat(a.state.turn.standard&&a.state.turn.move&&a.state.turn.swift,'双击须标准、移动、迅捷均可用');
      const targets=[t,b.actors[c.secondTargetId??c.targetId]];requireThat(targets.every(x=>x?.present&&!unconscious(x)),'双击目标须在场');
      spend(a,'full');spend(a,'swift');result.attacks=[];
      for(const target of targets) {
        if(unconscious(target)){result.notes.push('前一击已使后续目标失去行动能力，后续刀击不重复结算。');continue;}
        a.state.turn.standard=1;strike(b,a,target,{...c,targetId:target.id},result,drawDice,{deferPlayerDefense,defenseDeclarations,grappleDeclarations});
        result.attacks.push(result.attack);
      }
      if(a.kind==='chuul'&&!deferPlayerDefense)for(const [index,attack]of result.attacks.entries())if(attack.amount>0&&!unconscious(targets[index]))
        (result.grapples??=[]).push(attachClaw(b,a,targets[index],{drawDice,defense:grappleDeclarations[targets[index].id],claw:index}));
      a.state.turn.standard=0;break;
    }
    case 'tentacles': {
      requireThat(t?.present&&a.claws?.includes(t.id)&&spatialDistance(b.map,a.position,t.position)<=3,'触须毒须用于当前自己夹住且3米内的目标');
      spend(a,'standard');
      const source=`Chuul毒:${a.id}`,out=applyStatus(t.state,{type:'麻痹',source,points:8,dice:drawDice(),eligible:!t.immunities?.includes('poison')});t.state=out.state;
      for(const s of t.state.statuses.filter(s=>s.source===source))Object.assign(s,{roundResistance:'chuul',remainingMinutes:1});
      result.statuses.push({targetId:t.id,...out.result});break;
    }
    case 'releaseGrip': {
      requireThat(a.kind==='chuul'&&[0,1].includes(c.claw)&&a.claws[c.claw],'该螯未夹住目标');spend(a,'free');
      const target=b.actors[a.claws[c.claw]];a.claws[c.claw]=null;
      if(target?.state.grapple){const remaining=a.claws.map((id,i)=>id===target.id?i:-1).filter(i=>i>=0);if(remaining.length){target.state.grapple.claws=remaining;target.state.grapple.claw=remaining[0];}else delete target.state.grapple;}break;
    }
    case 'burrow': {
      requireThat(!a.underground&&!a.state.grapple,'当前无法开始土遁');const path=earthPath(b.map,a.position,a.position);requireThat(path.valid,path.reason);
      spend(a,'standard');pay(a,'魔力',2);a.underground={expiresRound:b.round+5};break;
    }
    case 'emerge':
      requireThat(a.underground&&(b.map?.features??[]).some(f=>!f.destroyed&&f.earthExit&&contains(a.position,f)),'须在当前可用土层出口出土');spend(a,'standard');delete a.underground;break;
    case 'morph':
      requireThat(['空','Phantom'].includes(c.form)&&c.form!==a.form,'只能切换空的外貌与Phantom形态');spend(a,'standard');a.form=c.form;break;
    case 'firstAid': {
      requireThat(t&&t.id!==a.id&&spatialDistance(b.map,a.position,t.position)<=1.5&&clearLine(b.map,a.position,t.position),'急救须能接触另一名伤者');
      spend(a,'full');
      const out=firstAid(a.state,t.state,{dice:drawDice(),actionAlreadySpent:true});requireThat(out.result.allowed,out.result.reason);
      a.state=out.healer;t.state=out.patient;result.firstAid=out.result;break;
    }
    case 'stowWeapon':
      requireThat(a.kind==='bright'&&a.weaponMode!=='empty','当前没有可收起的武器');spend(a,'move');a.weaponMode='empty';a.loaded=false;delete a.buffs.block;break;
    case 'readyWeapon':
      requireThat(a.kind==='bright'&&a.weaponMode==='empty'&&['bow','longknife','dagger'].includes(c.weapon),'先收起当前武器，再选已持有的弓、长刀或匕首');spend(a,'move');a.weaponMode=c.weapon;break;
    case 'medicine': {
      const out=reduceRecovery(a,{...c,type:'medicine'},{drawDice,playerAuthorized,combat:true,preActionCleared:a.preActionCleared});
      Object.assign(a,out.actor);result.recovery=out.result;
      result.notes.push(`服用${c.medicine}；库存与即时或延后效果一并结算`);
      for(const change of out.result.changes)if(change.healed)result.healing.push({targetId:a.id,severity:change.severity,amount:change.healed});
      break;
    }
    case 'concede':
      requireThat(b.arena,'本场没有擂台认输结算');
      b.status='finished';b.winner=Object.values(b.actors).find(x=>x.team!==a.team)?.team??'平局';
      b.resolution={kind:'concede',actorId:a.id,taskComplete:false,xpAwarded:0,text:`${a.name}主动认输，本场停止交锋，保留伤势与资源，不发XP。`};break;
    case 'brace':
      requireThat(a.kind==='radwick'&&!a.buffs.brace,'该次稳身准备已成立或没有持盾资格');
      spend(a,'free');pay(a,'斗气',1);a.buffs.brace=true;break;
    case 'shieldPush': {
      requireThat(a.kind==='radwick'&&t?.present&&!unconscious(t)&&t.team!==a.team,'盾推需要有效敌人和盾');
      requireThat(spatialDistance(b.map,a.position,t.position)<=1.5&&canObserve(b,t,a.id)&&clearLine(b.map,a.position,t.position),'盾推须近身且路线可通');
      spend(a,'standard');
      if(deferPlayerDefense&&b.playerDefenseDeclarations&&t.controller==='player'&&!t.defenseIntent)break;
      if(b.playerDefenseDeclarations&&t.controller==='player')requireThat(defenseDeclarations[t.id]||t.defenseIntent,'须先由玩家声明本次受击反应，再作盾推强韧对抗');
      if(c.empowered)pay(a,'斗气',1);
      const sk=skill(a,'肉搏','盾推'),dp=value(a,'力量')+sk.level+(c.empowered?3:0)-penalty(a),fixed=auto(a,'力量')+sk.auto;
      const roll=rollPool(dp,drawDice()),save=saveRoll(t,'fort',drawDice),total=roll.rolledSuccesses+fixed;
      result.contest={kind:'shieldPush',dp,fixed,roll,total,targetTotal:save.total,won:total>save.total};result.saves.push({targetId:t.id,...save});
      if(total>save.total) {
        const len=Math.hypot(t.position[0]-a.position[0],t.position[1]-a.position[1]);requireThat(len>0,'重合站位须先补齐盾推方向');
        const to=t.position.map((n,i)=>n+(n-a.position[i])/len*2),path=measurePath(b.map,t.position,to);
        if(path.valid&&!Object.values(b.actors).some(x=>x.present&&x.id!==t.id&&spatialDistance(b.map,x.position,to)<.01)) {
          result.forcedMovement={targetId:t.id,from:clone(t.position),to:clone(to),length:2};t.position=to;delete t.calibration;
        } else result.notes.push('盾推对抗胜出，但2米落点或路线不合法；未擅自穿墙、出界或移动推人者。');
      }
      break;
    }
    case 'calibrate':
      requireThat(a.kind==='mireya'&&a.weaponMode!=='club','定点校准须双手持弓');
      requireThat(t?.present&&t.team!==a.team&&spatialDistance(b.map,a.position,t.position)<=60&&canObserve(b,t,a.id),'校准目标须在60米内持续可定位');
      spend(a,'full');a.calibration={targetId:t.id,ready:false};break;
    case 'drawClub': case 'readyBow':
      requireThat(a.kind==='mireya'&&(id==='drawClub'?a.weaponMode!=='club':a.weaponMode==='club'),'当前持握方式不需重复切换');
      spend(a,'move');a.weaponMode=id==='drawClub'?'club':'bow';delete a.buffs.block;
      a.visibleArms=id==='drawClub'?'包毡短棍在手，另一手持弓':'双手持缓冲竞技弓，短棍收于腰侧';break;
    case 'door': case 'destroy': {
      const f=b.map?.features.find(f=>f.id===c.featureId);
      requireThat(f&&!f.destroyed&&!f.hiddenFrom?.includes(a.id),'地形目标不存在、已破坏或尚未发现');
      const at=nearestPoint(a.position,f);
      requireThat(clearLine(b.map,a.position,at,{sight:true})&&clearLine(b.map,a.position,at),'地形目标被其他障碍遮挡');
      if(id==='door') {
        requireThat(f.kind==='door'&&typeof c.open==='boolean','开关门须指定门和open布尔值');
        requireThat(f.open!==c.open,'门已处于声明的状态');
        requireThat(!c.open||!f.locked,'门已上锁，需要另行声明开锁或破坏');
        requireThat(spatialDistance(b.map,a.position,at)<=1.5+1e-8,'开关门须在相邻1.5米内');
        requireThat(c.open||!Object.values(b.actors).some(x=>x.present&&contains(x.position,f)),'门口有人占据，不能关闭');
        spend(a,'move');f.open=c.open;
        result.terrain={featureId:f.id,label:f.label,kind:'door',open:f.open,outcome:f.open?'门已打开，通路打开':'门已关闭，通路被阻挡'};
      } else {
        requireThat(['obstacle','door'].includes(f.kind),'只能破坏独立标记的障碍或门');
        if(!f.durability)throw new RuleInputError('障碍缺少已确认的耐久与硬度',`map.${f.id}.durability`);
        strike(b,a,{id:`terrain/${f.id}`,present:true,position:at},c,result,drawDice,{feature:f});
      }
      break;
    }
    case 'strike': case 'thunder': case 'cleaveRock': case 'lightning': case 'conduct':
      strike(b,a,t,c,result,drawDice,{deferPlayerDefense,defenseDeclarations,grappleDeclarations}); break;
    case 'draw':
      requireThat(a.sheathed,'刀已出鞘'); spend(a,'move'); a.sheathed=false;
      a.buffs.drawnRound=b.round; a.buffs.drawUsed=false; break;
    case 'sheathe':
      requireThat(!a.sheathed,'刀已在鞘'); spend(a,'move'); a.sheathed=true; delete a.buffs.block; break;
    case 'block':
      requireThat(!a.buffs.block,'本回合已格挡');
      requireThat(a.kind!=='mireya'||a.weaponMode==='club','弓不能格挡；须先花移动取短棍，再另付移动格挡');
      requireThat(a.kind!=='bright'||a.ruleset!=='opening-20261022'||['longknife','dagger'].includes(a.weaponMode),'须实际持长刀或匕首才能格挡');
      requireThat(a.kind!=='huang'||!a.sheathed,'持刀才能白刃格挡');
      spend(a,a.kind==='huang'&&a.ruleset!=='opening-20261022'?'free':'move'); a.buffs.block=true;
      if(b.playerDefenseDeclarations&&a.controller==='player')a.defenseIntent={mode:'block',source:id};break;
    case 'zheng':
      requireThat(!a.buffs.block,'已经格挡');spend(a,'move');a.buffs.block=true;a.buffs.zheng=true;
      if(b.playerDefenseDeclarations&&a.controller==='player')a.defenseIntent={mode:'block',source:id};break;
    case 'tengzhuan':
      requireThat(!a.buffs.tengzhuan,'腾转已经生效');spend(a,'standard');
      requireThat((a.ruleset==='opening-20261022'?['流风']:['风池','魔力']).includes(c.resource??(a.ruleset==='opening-20261022'?'流风':'风池')),'需要合用能量');pay(a,c.resource??(a.ruleset==='opening-20261022'?'流风':'风池'),1);
      a.buffs.tengzhuan=true;(a.expires??={}).tengzhuan=b.round+10;break;
    case 'flow': {
      if(!['standard','move','swift','free'].includes(a.parameters?.flowAction)||!Number.isInteger(a.parameters?.flowMax))
        throw new RuleInputError('流风需要完整池上限与启动动作',`${a.id}.flow`);
      requireThat(!a.buffs.flow,'流风加速已经生效');
      requireThat([1,2].includes(c.tier),'流风选择1或2点');spend(a,a.parameters.flowAction);pay(a,'流风',c.tier);
      a.buffs.flow=c.tier;(a.expires??={}).flow=b.round+10;break;
    }
    case 'tornado': case 'gale': {
      if(id==='tornado')requireThat(t?.present,'需要指定已知角色ID作为目标');
      requireThat((a.ruleset==='opening-20261022'?['流风']:['风池','魔力']).includes(c.resource??(a.ruleset==='opening-20261022'?'流风':'风池')),'需要合用能量');
      pay(a,c.resource??(a.ruleset==='opening-20261022'?'流风':'风池'),1);a.sheathed=false;
      const targets=id==='tornado'?[t]:galeTargets(b,c);
      requireThat(targets.length>0,'范围内无有效目标');
      for(let i=0;i<targets.length;i++) {
        if(i) a.state.turn.standard=1;
        strike(b,a,targets[i],{...c,targetId:targets[i].id},result,drawDice,{deferPlayerDefense,defenseDeclarations});
      }
      break;
    }
    case 'reload':
      requireThat(a.kind!=='bright'||!a.weaponMode||a.weaponMode==='bow','须先取出长弓');
      requireThat(a.kind!=='mireya'||a.weaponMode!=='club','持棍时不能双手持弓上箭');
      if(!Number.isInteger(a.ammunition)) throw new RuleInputError('须提供当前普通箭数量',`${a.id}.ammunition`);
      requireThat(!a.loaded&&a.ammunition>0,'已上箭或没有箭矢');spend(a,'swift');a.loaded=true;break;
    case 'aim':
      requireThat(a.kind!=='bright'||!a.weaponMode||a.weaponMode==='bow','须先取出长弓');
      requireThat(t?.present&&t.team!==a.team,'瞄准需要有效敌方目标');
      requireThat(canObserve(b,t,a.id),'目标不在视线内，无法瞄准');
      requireThat(a.aim?.pendingRound!==b.round,'本轮已瞄准');spend(a,'standard');
      a.aim={targetId:t.id,rounds:a.aim?.targetId===t.id?a.aim.rounds:0,pendingRound:b.round};break;
    case 'timeBolt': case 'timeHaste': {
      requireThat(t?.present&&spatialDistance(b.map,a.position,t.position)<=50,'目标须在50米内');
      requireThat(clearLine(b.map,a.position,t.position),'法术效果线被实体障碍阻挡');
      requireThat(canObserve(b,t,a.id),'目标不在视线内，无法指定法术目标');
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
      const position=summonPosition(b,a,c.to);
      spend(a,'standard'); pay(a,'灵力',3,c.payment);
      b.actors.lotus??=makeLotus(a);
      const lotus=b.actors.lotus; lotus.present=true;
      lotus.position=position;
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
      const len=spatialDistance(b.map,a.position,t.position); requireThat(len>0,'射线方向无效');
      for(const other of roarTargets(b,c)) {
        const save=saveRoll(other,'reflex',drawDice,{recognizable:other.kind==='huang'&&spatialDistance(b.map,a.position,other.position)<=30,cover:terrainCover(b.map,a.position,other.position)});
        result.saves.push({targetId:other.id,...save});
        const n=Math.max(0,8+auto(b.actors[a.ownerId],'意志')-save.total);
        damageEvent(other,[{amount:n,severity:'L',kind:'energy',energyType:'force'}],conversionFor(other,n),result);
      }
      break;
    }
    case 'move': case 'step': {
      requireThat(Array.isArray(c.to)&&c.to.length===2&&c.to.every(Number.isFinite),'移动需to:[x,y]');
      if(a.territory)requireThat([...(c.via??[]),c.to].every(p=>Math.hypot(p[0]-a.territory.center[0],p[1]-a.territory.center[1])<=a.territory.radius),'固定阵地单位不能离开有效圈');
      requireThat(!c.climb||a.wallClimb,'当前人物无免检攀爬资格');
      requireThat(!c.run||a.waterRun,'当前人物无水面奔跑资格');
      const path=a.underground?earthPath(b.map,a.position,c.to,c.via):measurePath(b.map,a.position,c.to,c.via,{ignoreDifficult:a.ignoreDifficult,climb:c.climb});requireThat(path.valid,path.reason);
      const crossed=pathFeatures(b.map,path.path);
      if(crossed.some(f=>f.surface==='water'))requireThat(a.waterRun&&c.run,'水面路径须有水面奔跑资格并声明奔跑；游泳须另有判定');
      const terrainPenalty=Math.max(0,...crossed.map(f=>f.speedPenalty??0));
      path.cost+=Math.max(0,terrainPenalty-(a.kind==='yulin'&&a.buffs.tengzhuan||a.waterRun&&c.run?5:0));
      const length=path.cost, maximum=id==='step'?Math.min(1.5,panel(b,a.id).speed):panel(b,a.id).speed;
      requireThat(length>0&&length<=maximum+1e-8,'移动距离超过可用速度');
      const linked=a.state.grapple?b.actors[a.state.grapple.holderId]:b.actors[a.claws?.find(Boolean)];
      if(linked) {
        requireThat(new Set(a.claws?.filter(Boolean)).size!==2,'牵带两个目标尚须明确负重和分别对抗，不能默认拖动');
        const g=a.state.grapple??linked.state.grapple;
        requireThat(!a.state.grapple?.pressed,'被压制者不能移动');
        if(g.pressed)requireThat(length<=maximum/2,'压制后牵带最多半速');
        else {const contest=grappleContest(a,linked,{drawDice,drag:true});result.grapple=contest;
          if(!contest.success||path.length>contest.margin){spend(a,'move');result.notes.push('牵带力量对抗不足以完成声明距离，动作已消耗、双方未移动。');break;}}
        const offset=c.to.map((n,i)=>n-a.position[i]),to=linked.position.map((n,i)=>n+offset[i]);
        requireThat(measurePath(b.map,linked.position,to).valid,'被牵带者路线受阻');linked.position=to;
      }
      spend(a,id==='step'?'fiveFootStep':'move');
      if(id==='move') for(const foe of opportunityActors(b,c)) {
        if(b.playerDefenseDeclarations&&foe.controller==='player'&&opportunityDeclarations[foe.id]!==true)continue;
          const sub={actorId:foe.id,abilityId:'strike',damage:[],statuses:[],saves:[]};
          // Opportunity trigger is supplied by this geometry, not by model input.
          strike(b,foe,a,{actorId:foe.id,abilityId:'strike',targetId:a.id},sub,drawDice,{opportunity:true,deferPlayerDefense,defenseDeclarations});
          result.opportunities??=[]; result.opportunities.push(sub);
      }
      if(!unconscious(a)){result.movement={from:clone(a.position),to:clone(c.to),path:path.path,length:path.length,cost:path.cost};a.position=clone(c.to);} break;
    }
    case 'end': advance(b,result,c.deteriorationChoices,drawDice); break;
    default: throw new RuleInputError('尚未适配的能力',`${a.id}.${id}`);
  }
  delete a.preActionCleared;
  for(const held of Object.values(b.actors))if(held.state.grapple&&unconscious(b.actors[held.state.grapple.holderId]))releaseGrapple(b,held);
  finishIfNeeded(b);
  for(const observer of Object.values(b.actors))if(observer.calibration&&!canObserve(b,b.actors[observer.calibration.targetId],observer.id))delete observer.calibration;
  rememberTactic(input,b,c,result);
  result.after=stateResult(b,a.id,id).after;
  return {battle:b,result};
}

export function stateResult(b,actorId,abilityId,notes=[]) {
  return {actorId,abilityId,round:b.round,damage:[],statuses:[],saves:[],healing:[],notes,
    after:{status:b.status,winner:b.winner,activeId:b.activeId,...(b.pending?{awaiting:b.pending.awaiting}:{}),
      visibleTo:Object.fromEntries([...Object.values(b.actors),...Object.values(b.observers??{})].filter(a=>a.present).map(a=>[a.id,Object.values(b.actors).filter(t=>canObserve(b,t,a.id)).map(t=>t.id)])),
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
    defense:p.defense.pending?{pending:true}:{total:p.defense.total,parts:nonzero(p.defense.parts),extraSuccesses:p.defense.extraSuccesses},
    ...(a.defenseIntent?{declaredDefense:clone(a.defenseIntent)}:{}),
    actions,energy:p.energy,will:p.will,
    ...(a.kind==='mireya'?{weaponMode:a.weaponMode,loaded:a.loaded,ammunition:a.ammunition,...(a.calibration?{calibration:clone(a.calibration)}:{})}:{}),
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
    if(d.pending)return {attackerId:a.id,targetId:t.id,pendingDefense:true};
    return {attackerId:a.id,targetId:t.id,distanceM:Number(spatialDistance(b.map,a.position,t.position).toFixed(2)),
      inReach:spatialDistance(b.map,a.position,t.position)<=a.reach+1e-8,
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
    abilities:Object.fromEntries([...new Set(actors.flatMap(a=>a.abilities))].map(id=>[id,b.actors[b.activeId]?.abilityDefinitions?.[id]??ABILITIES[id]])),
    passiveRules: Object.fromEntries(Object.entries({
      jiang:'拳掌含龙象：力判＋12、忽略4指定伤害防护、实伤后2L和4晕眩；红鹤高速4；破身恶化须破尽盔甲；每轮医疗1B/L。同目标每次攻击加下次增强1，封顶5。',
      huang:'刀身及攻击上限以当前面板为准；先攻高于攻击者基础防御＋5；防御附成3。灵力可用payment:"restraint"代付，但精神束缚会减攻防和速度，超过意志5定身。',
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
