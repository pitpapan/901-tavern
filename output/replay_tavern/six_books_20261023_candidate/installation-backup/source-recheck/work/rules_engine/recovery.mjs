import {ATTRIBUTES,check,effectiveAttribute,lifeStatus,recover,spendAction,actionEligibility,statusLevel,applyStatus,rollPool} from './core.mjs';
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

function heal(actor,severities,budget,changes,source) {
  for(const severity of severities) {
    const locked=(actor.recoveryLocks??[]).filter(x=>x.severity===severity).reduce((n,x)=>n+(x.count??0),0);
    const amount=Math.min(budget,Math.max(0,actor.state.health[severity]-locked));
    if(amount>0){actor.state.health[severity]-=amount;actor.state.health.intact+=amount;budget-=amount;changes.push({source,severity,healed:amount});}
    if(!budget)break;
  }
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
  if(options.combat) {
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
export function advanceTime(actor,minutes,changes=[],{combatTick=false}={}) {
  if(!Number.isFinite(minutes)||minutes<0)throw new RuleInputError('经过时间须为非负分钟数','minutes');
  for(const [id,effect]of Object.entries(actor.state.timedEffects??{})) {
    if(combatTick&&effect.clockActorId)continue;
    effect.remainingMinutes=Math.max(0,effect.remainingMinutes-minutes);
    if(effect.remainingTurns!==undefined)effect.remainingTurns=effect.remainingMinutes*10;
    if(!effect.remainingMinutes){delete actor.state.timedEffects[id];changes.push({expired:id});}
  }
  for(const s of actor.state.statuses){
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
  const natural={type:kind==='short'?'shortRest':'longRest',attribute:command.attribute,statusIndex:command.statusIndex};
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
  heal(actor,['B'],Math.floor(minutes/15),changes,'自然短休间隔');
  const clock=advanceTime(actor,minutes,changes);
  if(kind==='long'&&!statusLevel(actor.state,'亢奋').severe) {
    clock.longRests++;
    for(const [name,pool]of Object.entries(actor.state.resources))if(poolPolicy(actor,name)?.longRest===true)gain(actor,name,pool.max-pool.current,changes,'长休');
  }
  settlePending(actor,kind,options,changes);
  for(const [severity,days,rests]of [['L',2,2],['A',7,7]]) {
    const last=clock[severity],count=Math.min(Math.floor((clock.minutes-last.minutes)/(days*1440)),Math.floor((clock.longRests-last.longRests)/rests));
    if(count>0){heal(actor,[severity],count,changes,`${days}日自然恢复`);last.minutes+=count*days*1440;last.longRests+=count*rests;}
  }
}
function meditate(actor,command,options,changes) {
  const minutes=integer(command.minutes,'minutes',15),policy=flowPolicy(actor);
  const eligibility=actionEligibility(actor.state,'meditate');
  if(!eligibility.allowed)reject(eligibility.reason);
  if(eligibility.requiresBCheck)need('全冲击伤势需要行动前力量检定与主持难度，尚不能开始打坐','preActionCheck');
  if(statusLevel(actor.state,'亢奋').severe)reject('重度亢奋阻止冥想与打坐恢复');
  if(!policy||!actor.state.resources.流风)need('流风恢复规则尚未确定','resource');
  const configured=actor.state.recoveryRules?.flowRecoveryCheck??actor.parameters?.flowRecoveryCheck;
  if(!configured)need('流风敏捷/感知关键属性判定的合并方式尚未确定','flowRecoveryCheck');
  if(!Array.isArray(configured.attributes)||!configured.attributes.length||configured.attributes.some(k=>!policy.attributes.includes(k)))need('流风恢复检定须使用已确认的关键属性','flowRecoveryCheck');
  if(command.completed===false||command.interrupted===true)reject('打坐尚未完成，不能恢复能量');
  for(let i=0;i<Math.floor(minutes/15);i++) {
    const result=check(actor.state,{attributes:configured.attributes,dice:diceFor(options,{kind:'flowRecovery',attributes:configured.attributes,interval:i+1})});
    gain(actor,'流风',result.total,changes,'打坐');
    changes.push({source:'打坐',successes:result.total,interval:i+1});
  }
  advanceTime(actor,minutes,changes);
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
    let actor=input;const steps=[];
    for(const step of command.steps) {
      const outcome=reduceRecovery(actor,step,options);actor=outcome.actor;steps.push(outcome.result);
    }
    return {actor,result:{kind:'recovery',type:'sequence',steps,changes:steps.flatMap(step=>step.changes),
      pending:structuredClone(actor.state.pendingRecoveryEffects??[]),life:lifeStatus(actor.state)}};
  }
  const actor=structuredClone(input),changes=[];
  if(lifeStatus(actor.state).state==='dead')reject('死亡角色不能通过用药或自然休息恢复');
  if(command.type==='medicine')medicine(actor,command,options,changes);
  else {
    if(options.combat)reject('战斗中不能结算休息或打坐');
    if(command.type==='rest')declaredRest(actor,command,options,changes);
    else if(command.type==='meditate')meditate(actor,command,options,changes);
    else need('未知恢复操作','type');
  }
  clean(actor.state);
  return {actor,result:{kind:'recovery',type:command.type,...(command.medicine?{medicine:command.medicine}:{}),
    ...(command.rest?{rest:command.rest}:{}),...(command.minutes!==undefined?{minutes:command.minutes}:{}),
    changes,pending:structuredClone(actor.state.pendingRecoveryEffects??[]),life:lifeStatus(actor.state)}};
}
