import {snapshotPeriodicSources} from './resource-periodic-clock.mjs';
import {refreshResourceAuras} from './resource-auras.mjs';
import {advancePhysicalMotion,motionTimeSlice,settleMotionImpacts,syncAutonomousFlight,materializeDescentFall} from './resource-motion.mjs';
import {syncVerticalPosition} from './combat/movement-modes.mjs';
import {resolvePendingFall} from './resource-falling.mjs';
import {completeAccumulatorRest} from './resource-accumulators.mjs';
import {changeWill} from './resource-counters.mjs';
import {resourceBonus,resourceEffects,RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {advancePerception} from './resource-perception.mjs';
import {accrueRoundCosts} from './resource-ongoing.mjs';
import {settleResourceDeaths,accrueEffectiveTriggerRounds} from './resource-death.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
import {healWounds} from './healing.mjs';
import {advanceResourcePeriods,flushResourceTriggerEnds} from './gm_runtime/resource-program.mjs';
import {ATTRIBUTES,check,effectiveAttribute,attrAuto,lifeStatus,recover,spendAction,actionEligibility,statusLevel,applyStatus,rollPool,advanceGeneticLock} from './core.mjs';
import {RuleInputError,IllegalAction,saveProfile} from './combat/mechanics.mjs';

// Period-specific card rules; no inventory or post-growth values are inferred.
export const RECOVERY_SOURCES={
  medicine:'work/character_builder/real_character/御临风_初始卡_20261021.txt:123-154',
  flow:'work/character_builder/real_character/御临风_初始卡_20261021.txt:113-122',
  rest:'PHB01/生存状态:53-56；非战斗行动与战斗行动:122-129',
  composition:'持续无行动的休息按完整15分钟累计B恢复；长休另结算长休效果，不额外生成短休状态检定。',
  peiyuan:'用户2026-10-23确认：任意伤害，按A、L、B优先，合计不超过力量。',
  meditation:'用户2026-10-23确认：敏捷＋感知判定，每成功恢复1流风。',
  medicineC:'初始卡药C明确指定强韧豁免＋8，按战斗强韧（力量＋求生），不套普通麻痹休息恢复的力量/意志低者。',
};
export const MEDICINES={
  雪莲子:{action:'standard',timing:'immediate'},培元丹:{action:'move',timing:'long'},
  药A:{action:'move',timing:'long'},药B:{action:'move',timing:'immediate'},药C:{action:'move',timing:'short'},
  雷霆药剂:{action:'move',timing:'immediate'},
};
export const OPENING_RECOVERY_RULES=Object.freeze({
  flow:{attributes:['敏捷','感知'],physical:true,longRest:true},
  flowRecoveryCheck:{attributes:['敏捷','感知'],source:'用户2026-10-23确认'},
});
const PHYSICAL_STATUSES=new Set(['恶心','麻痹','晕眩','耳鸣','目眩','疲乏','肢体妨害','剧痛']);
const need=(text,field)=>{throw new RuleInputError(text,field);};
const reject=text=>{throw new IllegalAction(text);};
const clean=state=>{state.statuses=state.statuses.filter(s=>s.points>0&&s.remainingMinutes!==0);if(state.health.intact>0){state.health.coma=false;state.health.deteriorationStopped=false;}};
const integer=(n,name,min=0)=>{if(!Number.isInteger(n)||n<min)need(`${name}须为至少${min}的整数`,name);return n;};

function heal(actor,severities,budget,changes,source,mode='magical') {
  const out=healWounds(actor,{budget,order:severities,ratios:{B:1,L:1,...(severities.includes('A')?{A:1}:{})},mode});
  changes.push(...out.changes.map(({severity,amount,restriction})=>({source,severity,healed:amount,...(restriction?{restriction}:{})})));
}
function diceFor(options,meta) {
  if(!options.drawDice)need('该恢复检定需要骰源','drawDice');
  return options.drawDice(meta);
}
function flowPolicy(actor) {
  if(actor.state.recoveryRules?.flow)return actor.state.recoveryRules.flow;
  if(actor.kind!=='yulin'&&!actor.parameters?.flowRecovery)return null;
  return {attributes:['敏捷','感知'],longRest:true,physical:true,
    ...(actor.parameters?.flowRecovery??{})};
}
function poolPolicy(actor,name) {
  if(actor.state.resourceRecovery?.[name])return actor.state.resourceRecovery[name];
  if(name==='流风')return flowPolicy(actor);
  if(name==='魔力'&&actor.state.recoveryRules?.manaLongRestHours===8)return {longRest:true};
  return actor.parameters?.resourceRecovery?.[name]??null;
}
function gain(actor,name,amount,changes,source) {
  const pool=actor.state.resources[name],before=pool.current;
  pool.current=Math.min(pool.max,before+amount);
  changes.push({source,resource:name,restored:pool.current-before});
}
function targetStatus(actor,command) {
  if(!Number.isInteger(command.statusIndex))need('请指定药C要处理的一项肉体异常状态','statusIndex');
  const s=actor.state.statuses[command.statusIndex];
  if(!s||!PHYSICAL_STATUSES.has(s.type))reject('药C仅处理已接入的肉体损失异常；精神异常、冰结和冻结不适用');
  return {type:s.type,source:s.source};
}
function medicine(actor,command,options,changes) {
  const name=command.medicine,entry=actor.state.inventory?.find(x=>x.name===name);
  if(!entry||!Number.isInteger(entry.quantity))need(`${name??'药物'}的现有数量未确定，不能扣除`,'inventory');
  if(entry.quantity<1)reject(`${name}库存不足`);
  const rule=MEDICINES[name];
  if(!rule)need(`${name}尚无完整用药结算规则`,'medicine');
  const eligibility=actionEligibility(actor.state,rule.action);
  if(!eligibility.allowed)reject(eligibility.reason);
  if(eligibility.requiresBCheck&&!options.preActionCleared)need('全冲击伤势需要行动前力量检定与主持难度，尚不能自行服药','preActionCheck');
  if(['麻痹','精神束缚','纠缠','冻结'].some(type=>statusLevel(actor.state,type).severe))reject('定身阻止服药动作');
  let effect;
  if(name==='雪莲子') {
    const resource=command.resource;
    if(!resource)need('请指定雪莲子恢复的能量池','resource');
    const pool=actor.state.resources[resource],policy=poolPolicy(actor,resource);
    if(!pool||!policy)need('该能量池的生理属性与恢复规则尚未确定','resource');
    if(policy.physical!==true||policy.longRest!==true)reject('雪莲子仅恢复基于生理属性且可经长休恢复的能量池');
    const oriental=pool.orientation==='东方'||policy.oriental===true||resource==='流风'&&actor.parameters?.flowOriental===true;
    effect={resource,amount:oriental?4:3};
  } else if(name==='药C') {
    if(!['heal','status'].includes(command.choice))need('药C须选择恢复严重伤害或处理一项肉体异常','choice');
    effect={medicine:name,choice:command.choice,...(command.choice==='status'?{status:targetStatus(actor,command)}:{})};
  } else effect={medicine:name};
  if(options.combat&&options.payAction)options.payAction(actor,rule.action);
  else if(options.combat) {
    const spent=spendAction(actor.state,rule.action,{behavior:rule.action,preActionCleared:options.preActionCleared});
    if(!spent.result.allowed)reject(spent.result.reason);
    actor.state=spent.state;
  }
  // Resolve validation and action availability before changing either inventory or effect.
  actor.state.inventory.find(x=>x.name===name).quantity--;
  changes.push({source:name,consumed:1,remaining:actor.state.inventory.find(x=>x.name===name).quantity,...(options.combat?{action:rule.action}:{})});
  if(name==='雪莲子')gain(actor,effect.resource,effect.amount,changes,name);
  else if(name==='药B')heal(actor,['L'],Math.min(5,effectiveAttribute(actor.state,'力量')+1),changes,name);
  else if(name==='雷霆药剂') {
    if(effectiveAttribute(actor.state,'力量')<3) {
      const resistance=rollPool(1,diceFor(options,{kind:'thunderToxicity'}));
      if(!resistance.rolledSuccesses){const h=actor.state.health;h.A=actor.state.derived.hpMax;h.intact=0;h.B=0;h.L=0;changes.push({source:name,death:true,resistance});return;}
      changes.push({source:name,resistance});
    } else {
      const out=applyStatus(actor.state,{type:'麻痹',source:'雷霆药剂',points:5,dice:diceFor(options,{kind:'thunderParalysis'})});actor.state=out.state;
      for(const s of actor.state.statuses.filter(s=>s.source==='雷霆药剂'))s.decayPerRound=1;
      changes.push({source:name,...out.result});
    }
    (actor.state.timedEffects??={}).thunderPotion={remainingMinutes:5,attack:4,speed:10,source:RECOVERY_SOURCES.medicine};
  }
  else {
    const pending=actor.state.pendingRecoveryEffects??=[];
    if(name==='培元丹'&&pending.some(x=>x.medicine===name))changes.push({source:name,stacked:false});
    else pending.push(effect);
  }
}
// When physical motion is present, advance all participants to the same
// event boundary before refreshing spatial contributions and applying impact.
// An aura must not depend on whether its caster appears first in an object.
export function advanceActorsTime(actors,minutes,changes=[],{root,combatTick=false,drawDice}={}){
 if(!Number.isFinite(minutes)||minutes<0)throw new RuleInputError('经过时间须为非负分钟数','minutes');
 const entries=Object.entries(actors),scene={...root,actors};
 for(const [,a]of entries)syncAutonomousFlight(a);
 const moving=()=>entries.some(([,a])=>a.state.physicalMotion&&a.state.physicalMotion.phase!=='grounded'||a.state.resourceDescent||a.state.verticalPosition?.heightAboveGround>0);
 let remaining=minutes*60;
 do {
  const periodicClock=!combatTick&&entries.some(([,a])=>Object.values(a.state.resourceCapabilities??{}).some(c=>c.id==='periodicDamageRate'&&c.remainingMinutes!==0&&c.remainingRounds!==0)||(a.state.activeResourceEffects??[]).some(x=>x.periodicDamage||x.endCost));
  if(!moving()&&!periodicClock){
   for(const [,a]of entries)advanceTime(a,remaining/60,changes,{combatTick,drawDice,root:scene});
   break;
  }
  if(periodicClock)scene.periodicSourceImmunities=snapshotPeriodicSources(scene);else delete scene.periodicSourceImmunities;
  let seconds=periodicClock?Math.min(remaining,6):remaining;
  if(!combatTick&&entries.some(([,a])=>Object.values(a.state.resourceTriggers??{}).some(t=>t.event==='turnStart')))seconds=Math.min(seconds,6);
  for(const [,a]of entries)seconds=Math.min(seconds,motionTimeSlice(a,seconds,{root:scene,combatTick}));
  const pending=[];
  for(const [,a]of entries)advanceTime(a,seconds/60,changes,{combatTick,drawDice,root:scene,_motionSegment:true,_deferContacts:pending});
  for(const [id,a]of entries)if(a.state.verticalPosition&&a.position&&scene.ruleScene?.spatial?.actors?.[id])scene.ruleScene.spatial.actors[id].position=[...a.position];
  refreshResourceAuras(scene,{combat:!!scene.map});
  for(const {actor,contacts}of pending)changes.push(...settleMotionImpacts(actor,contacts,{root:scene,drawDice}));
  remaining=Math.max(0,remaining-seconds);
 }while(remaining>1e-8);
 return changes;
}
export function advanceTime(actor,minutes,changes=[],{combatTick=false,drawDice,root,map,_motionSegment=false,_deferContacts}={}) {
  if(!Number.isFinite(minutes)||minutes<0)throw new RuleInputError('经过时间须为非负分钟数','minutes');
  const hasPeriods=()=>Object.values(actor.state.resourceTriggers??{}).some(x=>x.event==='turnStart')||(actor.state.activeResourceEffects??[]).some(x=>x.endCost);
  if(!_motionSegment&&!combatTick&&minutes>.100000001&&hasPeriods()){
    let remaining=minutes,clock;
    while(remaining>.100000001&&hasPeriods()){clock=advanceTime(actor,.1,changes,{drawDice,root,map});remaining-=.1;}
    if(remaining>1e-9)clock=advanceTime(actor,remaining,changes,{drawDice,root,map});
    return clock;
  }
  if(!_motionSegment){
    let remaining=minutes*60,clock;
    do {
      const seconds=motionTimeSlice(actor,remaining,{root,map,combatTick});
      clock=advanceTime(actor,seconds/60,changes,{combatTick,drawDice,root,map,_motionSegment:true});
      remaining=Math.max(0,remaining-seconds);
    }while(remaining>1e-8);
    return clock;
  }
  const contacts=advancePhysicalMotion(actor,minutes*60,{drawDice,root,map,deferImpacts:true});
  if(!combatTick)changes.push(...advanceResourcePeriods(actor,minutes,{drawDice,root}));
  advancePerception(actor.state,{root,combat:combatTick,minutes});
  if(!combatTick)accrueRoundCosts(actor.state);
  if(actor.state.resourceEffectiveClock!==undefined||Object.values(actor.state.resourceTriggers??{}).some(t=>t.onDeath)){actor.state.resourceEffectiveClock=(actor.state.resourceEffectiveClock??actor.state.recoveryClock?.minutes??0)+minutes;const actual={...root,actors:{...root?.actors,[actor.id]:actor}};if(!combatTick)accrueEffectiveTriggerRounds(actual,actor.id);}
  for(const id of expireResourceEffects(actor.state,{minutes,rounds:minutes*10,drawDice}))changes.push({expired:id});
  if(actor.state.resourcePendingTriggerEnds?.length){const id=actor.id;changes.push(...flushResourceTriggerEnds({...root,actors:{...root?.actors,[id]:actor}},id,{drawDice,combat:combatTick}));}
  if(!combatTick)accrueRoundCosts(actor.state,{minutes});
  syncVerticalPosition(actor);
  const deathRoot={...root,actors:{...root?.actors,[actor.id]:actor}};changes.push(...settleResourceDeaths(deathRoot));
  const handoff=materializeDescentFall(actor,{map:map??root?.map??root?.ruleScene?.spatial?.map});if(handoff)changes.push({kind:'descent-handoff',...structuredClone(handoff)});
  const fall=resolvePendingFall(actor,{drawDice,root});if(fall)changes.push(fall);syncVerticalPosition(actor);
  if(!combatTick&&actor.state.geneticLock?.active?.[1]){
    const total=(actor.state.geneticLock.roundRemainder??0)+minutes*10,whole=Math.floor(total+1e-9);
    actor.state.geneticLock.roundRemainder=total-whole;
    for(let i=0;i<whole&&actor.state.geneticLock.active?.[1];i++){const out=advanceGeneticLock(actor.state,{drawDice});Object.assign(actor.state,out.state);if(out.result?.ended)changes.push({genetic:out.result});}
  }
  for(const [id,effect]of Object.entries(actor.state.timedEffects??{})) {
    if(combatTick&&effect.clockActorId)continue;
    effect.remainingMinutes=Math.max(0,effect.remainingMinutes-minutes);
    if(effect.remainingTurns!==undefined)effect.remainingTurns=effect.remainingMinutes*10;
    if(!effect.remainingMinutes){delete actor.state.timedEffects[id];changes.push({expired:id});}
  }
  for(const s of actor.state.statuses){
    if(s.demonBoxId){const total=(s.gazeRemainder??0)+minutes*10,whole=Math.floor(total+1e-9);s.gazeRemainder=total-whole;s.gazeRounds+=whole;s.points=5+s.gazeRounds;}
    if(s.remainingMinutes!==undefined&&!(combatTick&&s.clockActorId)){s.remainingMinutes=Math.max(0,s.remainingMinutes-minutes);if(s.remainingTurns!==undefined)s.remainingTurns=s.remainingMinutes*10;}
    if(s.type==='冻结'&&actor.state.statusEnvironment?.freezeRecovery===true&&actor.state.statusEnvironment.source){
      const rounds=(s.freezeRecoveryRemainder??0)+minutes*10,whole=Math.floor(rounds+1e-9);
      const before=s.points;s.points=Math.max(0,s.points-whole);s.freezeRecoveryRemainder=rounds-whole;
      if(before!==s.points)changes.push({status:'冻结',removed:before-s.points,source:actor.state.statusEnvironment.source});
    }
    if(s.decayPerRound){const rounds=(s.decayRemainder??0)+minutes*10;const whole=Math.floor(rounds+1e-9);s.points=Math.max(0,s.points-whole*s.decayPerRound);s.decayRemainder=rounds-whole;}
  }
  actor.state.statuses=actor.state.statuses.filter(s=>s.points>0&&s.remainingMinutes!==0);
  const clock=actor.state.recoveryClock??={minutes:0,longRests:0,L:{minutes:0,longRests:0},A:{minutes:0,longRests:0}};
  const prior=clock.minutes;clock.minutes+=minutes;
  const willHours=Math.floor(clock.minutes/60)-Math.floor(prior/60),willGain=willHours*resourceBonus(actor.state,'willPerHour');
  if(willGain){const before=actor.state.will.current;changeWill(actor.state,willGain);changes.push({source:'资源自然意志恢复',will:actor.state.will.current-before});}
  for(const [key,effect]of Object.entries(actor.durationCarry??{})) {
    effect.remainingRounds=Math.max(0,effect.remainingRounds-minutes*10);
    if(!effect.remainingRounds){delete actor.durationCarry[key];if(actor.buffs)delete actor.buffs[key];changes.push({expired:key});}
  }
  for(const [key,effect]of Object.entries(actor.cooldownCarry??{})) {
    effect.remainingRounds=Math.max(0,effect.remainingRounds-minutes*10);
    if(!effect.remainingRounds){delete actor.cooldownCarry[key];if(actor.cooldowns)delete actor.cooldowns[key];changes.push({cooldownReady:key});}
  }
  // The original phase of the daily cycle is unknown. Count only time declared
  // after this tracker began; never grant an assumed earlier daily recovery.
  const cycles=Math.floor(clock.minutes/1440)-Math.floor(prior/1440);
  if(cycles&&flowPolicy(actor)&&actor.state.resources.流风)gain(actor,'流风',cycles*2,changes,'次级能量强化（已记录时间）');
  if(_deferContacts)_deferContacts.push({actor,contacts});
  else changes.push(...settleMotionImpacts(actor,contacts,{root,drawDice}));
  const lost=syncAutonomousFlight(actor);if(lost)changes.push({kind:'flight-loss',...structuredClone(lost)});
  return clock;
}
function settlePending(actor,restKind,options,changes) {
  const retained=[];
  for(const effect of actor.state.pendingRecoveryEffects??[]) {
    if(effect.medicine==='药C'&&restKind==='short'||restKind==='long') {
      if(effect.medicine==='培元丹')heal(actor,['A','L','B'],effectiveAttribute(actor.state,'力量'),changes,'培元丹');
      else if(effect.medicine==='药A')heal(actor,['A'],effectiveAttribute(actor.state,'力量')+2,changes,'药A');
      else if(effect.medicine==='药C'&&effect.choice==='heal')heal(actor,['L'],10,changes,'药C');
      else if(effect.medicine==='药C') {
        const s=actor.state.statuses.find(s=>s.type===effect.status.type&&s.source===effect.status.source);
        if(s) {
          const before=s.points;
          if(s.points<=5)s.points=0;
          else {
            const save=saveProfile(actor,'fort');
            const resistance=check(actor.state,{poolBase:save.dp+8,attributeAutoOverride:save.fixed,
              dice:diceFor(options,{kind:'medicineResistance',medicine:'药C',dp:save.dp+8})});
            s.points=Math.max(0,s.points-resistance.total);
            changes.push({source:'药C',resistance:resistance.total,bonus:8});
          }
          changes.push({source:'药C',status:s.type,removed:before-s.points,remaining:s.points});
        } else changes.push({source:'药C',status:effect.status.type,remaining:0});
      }
    } else retained.push(effect);
  }
  actor.state.pendingRecoveryEffects=retained;
}
function declaredRest(actor,command,options,changes) {
  const kind=command.rest;
  if(!['short','long'].includes(kind))need('请选择短休或长休','rest');
  const minutes=integer(command.minutes,'minutes',kind==='short'?15:480);
  if(command.completed===false||command.interrupted===true)reject('休息尚未完整完成，不能结算恢复');
  if(command.attribute!==undefined&&!ATTRIBUTES.includes(command.attribute))need('请选择一项已有属性伤害','attribute');
  const natural={type:kind==='short'?'shortRest':'longRest',attribute:command.attribute,statusIndex:command.statusIndex,skipWoundHealing:true};
  if(command.statusIndex!==undefined&&kind==='short')natural.dice=diceFor(options,{kind:'restResistance',statusIndex:command.statusIndex});
  // Core handles one chosen status and long-rest will/attribute recovery. B is
  // separately accumulated by elapsed inactive intervals, without extra rolls.
  const beforeB=actor.state.health.B;
  const recovered=recover(actor.state,natural);
  if(recovered.result.allowed===false)reject(recovered.result.reason);
  actor.state=recovered.state;
  changes.push(...recovered.result.changes.filter(x=>x!=='B->intact'));
  const coreB=beforeB-actor.state.health.B;
  if(coreB){actor.state.health.B+=coreB;actor.state.health.intact-=coreB;}
  const replacement=resourceBonus(actor.state,'shortRestB')>0;
  heal(actor,['B'],replacement?actor.state.health.B:Math.floor(minutes/15),changes,'自然短休间隔','natural');
  const shortL=resourceBonus(actor.state,'shortRestL');if(shortL)heal(actor,['L'],Math.floor(minutes/15)*shortL,changes,'资源短休恢复');
  const clock=advanceTime(actor,minutes,changes,options);
  if(kind==='long'&&!statusLevel(actor.state,'亢奋').severe) {
    clock.longRests++;
    for(const [name,pool]of Object.entries(actor.state.resources))if(poolPolicy(actor,name)?.longRest===true)gain(actor,name,pool.max-pool.current,changes,'长休');
  }
  if(kind==='long')for(const key of completeAccumulatorRest(actor.state,minutes))changes.push({accumulatorReset:key});
  settlePending(actor,kind,options,changes);
  const resourceRecovery=resourceEffects(actor.state,'shortRestL').map(e=>RESOURCE_DEFINITIONS[e.source]?.recovery).find(Boolean);
  const intervals=resourceRecovery?.replaceOrdinary?[['A',resourceRecovery.A.days,resourceRecovery.A.longRests]]:[['L',2,2],['A',7,7]];
  for(const [severity,days,rests]of intervals) {
    const last=clock[severity],count=Math.min(Math.floor((clock.minutes-last.minutes)/(days*1440)),Math.floor((clock.longRests-last.longRests)/rests));
    if(count>0){heal(actor,severity==='A'?['A','L','B']:[severity],count,changes,`${days}日自然恢复`,severity==='A'?'natural-A':'natural');last.minutes+=count*days*1440;last.longRests+=count*rests;}
  }
}
function meditate(actor,command,options,changes) {
  const minutes=integer(command.minutes,'minutes',15),policy=flowPolicy(actor);
  const eligibility=actionEligibility(actor.state,'meditate');
  if(!eligibility.allowed)reject(eligibility.reason);
  if(eligibility.requiresBCheck)need('全冲击伤势需要行动前力量检定与主持难度，尚不能开始打坐','preActionCheck');
  if(statusLevel(actor.state,'亢奋').severe)reject('重度亢奋阻止冥想与打坐恢复');
  if(command.resource){
   const recovery=poolPolicy(actor,command.resource)?.meditation;
   if(!recovery||!actor.state.resources[command.resource])need('该池尚无已登记的冥想规则','resource');
   if(command.completed===false||command.interrupted===true)reject('冥想尚未完成');
   const count=Math.floor(minutes/recovery.intervalMinutes),amount=count*recovery.attributeAutos.reduce((n,k)=>n+attrAuto(actor.state,k),0);
   gain(actor,command.resource,amount,changes,'本职冥想');
   if(resourceBonus(actor.state,'shortRestB'))heal(actor,['B'],actor.state.health.B,changes,'兼容冥想的资源短休');
   const shortL=resourceBonus(actor.state,'shortRestL');if(shortL)heal(actor,['L'],Math.floor(minutes/15)*shortL,changes,'兼容冥想的资源短休');
   advanceTime(actor,minutes,changes,options);return;
  }
  if(!policy||!actor.state.resources.流风)need('流风恢复规则尚未确定','resource');
  const configured=actor.state.recoveryRules?.flowRecoveryCheck??actor.parameters?.flowRecoveryCheck;
  if(!configured)need('流风敏捷/感知关键属性判定的合并方式尚未确定','flowRecoveryCheck');
  if(!Array.isArray(configured.attributes)||!configured.attributes.length||configured.attributes.some(k=>!policy.attributes.includes(k)))need('流风恢复检定须使用已确认的关键属性','flowRecoveryCheck');
  if(command.completed===false||command.interrupted===true)reject('打坐尚未完成，不能恢复能量');
  for(let i=0;i<Math.floor(minutes/15);i++) {
    const result=check(actor.state,{attributes:configured.attributes,dice:diceFor(options,{kind:'flowRecovery',attributes:configured.attributes,interval:i+1})});
    gain(actor,'流风',result.total,changes,'打坐');
    changes.push({source:'打坐',successes:result.total,interval:i+1});
    if(resourceBonus(actor.state,'shortRestB'))heal(actor,['B'],actor.state.health.B,changes,'兼容打坐的资源短休');
    const shortL=resourceBonus(actor.state,'shortRestL');if(shortL)heal(actor,['L'],shortL,changes,'兼容打坐的资源短休');
  }
  advanceTime(actor,minutes,changes,options);
}

// Pure actor transaction. The MVU caller owns operationId/revision replay
// protection and must persist the returned actor state and carry together.
export function reduceRecovery(input,command,options={}) {
  if(options.playerAuthorized!==true)reject('用药与休息须由玩家明确声明');
  if(command.type==='sequence') {
    if(!Array.isArray(command.steps)||command.steps.length<2||command.steps.some(step=>
      !step||!['medicine','rest','meditate'].includes(step.type)))need('恢复顺序须包含至少两个已有恢复动作','steps');
    if(options.combat&&command.steps.some(step=>step.type!=='medicine'))reject('战斗中不能结算休息或打坐');
    // Resolve all player choices before even the first roll. Later rule failures
    // still discard the entire working actor; the caller commits only once.
    for(const step of command.steps) {
      if(step.type==='medicine'&&step.medicine==='雪莲子'&&!step.resource)need('请指定雪莲子恢复的能量池','resource');
      if(step.type==='medicine'&&step.medicine==='药C') {
        if(!['heal','status'].includes(step.choice))need('药C须选择恢复严重伤害或处理一项肉体异常','choice');
        if(step.choice==='status')targetStatus(input,step);
      }
    }
    let actor=input;const steps=[];let interrupted;
    for(const step of command.steps) {
      const outcome=reduceRecovery(actor,step,options);actor=outcome.actor;steps.push(outcome.result);
      if(lifeStatus(actor.state).state==='dead'){interrupted='death';break;}
    }
    return {actor,result:{kind:'recovery',type:'sequence',steps,...(interrupted?{interrupted}:{}),changes:steps.flatMap(step=>step.changes),
      pending:structuredClone(actor.state.pendingRecoveryEffects??[]),life:lifeStatus(actor.state)}};
  }
  const actor=structuredClone(input),changes=[];
  if(options.root?.actors)options.root.actors[actor.id]=actor;
  if(lifeStatus(actor.state).state==='dead')reject('死亡角色不能通过用药或自然休息恢复');
  if(command.type==='medicine')medicine(actor,command,options,changes);
  else {
    if(options.combat)reject('战斗中不能结算休息或打坐');
    if(command.type==='rest')declaredRest(actor,command,options,changes);
    else if(command.type==='meditate')meditate(actor,command,options,changes);
    else need('未知恢复操作','type');
  }
  clean(actor.state);
  changes.push(...settleResourceDeaths({...options.root,actors:{...options.root?.actors,[actor.id]:actor}}));
  return {actor,result:{kind:'recovery',type:command.type,...(command.medicine?{medicine:command.medicine}:{}),
    ...(command.rest?{rest:command.rest}:{}),...(command.minutes!==undefined?{minutes:command.minutes}:{}),
    changes,pending:structuredClone(actor.state.pendingRecoveryEffects??[]),life:lifeStatus(actor.state)}};
}
