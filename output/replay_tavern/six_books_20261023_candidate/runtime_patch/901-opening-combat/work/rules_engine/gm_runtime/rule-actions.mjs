import {settleResourceDeaths} from '../resource-death.mjs';
import {flushAutomaticResourceEvents} from './resource-program.mjs';
import {jumpCheckContext,resolveJumpDistance} from '../resource-jumping.mjs';
import {syncActorWounds} from '../resource-wounds.mjs';
import {changeWill} from '../resource-counters.mjs';
import {settleGuanlanAdventure} from '../kit-state.mjs';
import {refreshResourceAuras} from '../resource-auras.mjs';
import {settleResourceConcentration} from '../resource-channeling.mjs';
import {purchaseLearning} from '../growth-pricing.mjs';
import {act,damageEvent} from '../combat/engine.mjs';
import {createOpeningEncounter} from '../combat/opening.mjs';
import {ATTRIBUTES,check,oppose,upgradeAttribute,upgradeSkill,firstAid,applyStatus,
  spendAction,actionEligibility,checkBeforeAction,advanceDeterioration,settleNode,recover,beginTurn,upgradeFeat} from '../core.mjs';
import {saveProfile,refreshDerived} from '../combat/mechanics.mjs';
import {requireKnownSkill} from '../../character_builder/builder.mjs';
import {advanceTime,advanceActorsTime} from '../recovery.mjs';
import {ringTransfer} from '../possessions.mjs';
import {actorCheckRules,CHECK_PURPOSES} from './actor-rules.mjs';
import {runSceneMechanism,advanceSceneTime} from './scene-rules.mjs';
import {statusEvent,statusActionPermission,burningDamage,limbEffects,completeStatusOrder} from '../status-rules.mjs';
import {settleInterruptedTeleports,settleEngageReturns,assertEmbodied} from './conditional-resources.mjs';

const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
const natural=x=>Number.isSafeInteger(x)&&x>=0;
const fields={
  resume_effects:['actorId'],
  check:['actorId','attribute','skill','sub','dc','limbIds','targetId','purpose','willpower','objectId','part'],
  save:['actorId','type','dc','sourceQuote','willpower'],
  opposed:['active','passive','sourceQuote'],
  extended:['actorId','taskId','attribute','skill','sub','target','periodMinutes','maxPeriods','sourceQuote'],
  growth:['actorId','attribute','skill','sub'],
  feat:['actorId','featId'],
  resource:['actorId','offerId','paymentId'],
  first_aid:['actorId','targetId'],
  status:['actorId','type','points','sourceQuote'],
  deterioration:['actorId','from','sourceQuote'],
  node:['actorId','eventId'],
  chapter:['actorId','eventId'],
  reward:['actorId','eventId'],
  inventory:['actorId','operation','itemId'],
  time:['actorId','minutes','sourceQuote'],
  mechanism:['actorId','objectId','operation','part','willpower'],
  ability:['actorId','abilityId','tier','weapon'],
  hypnosis_resist:['actorId','statusSource','eventId'],
  status_event:['actorId','eventId'],
};
const selector=x=>record(x)&&Object.keys(x).every(k=>['actorId','attribute','attributes','skill','sub','willpower'].includes(k))&&
  text(x.actorId)&&(x.willpower===undefined||typeof x.willpower==='boolean')&&(ATTRIBUTES.includes(x.attribute)&&x.attributes===undefined||x.attribute===undefined&&Array.isArray(x.attributes)&&x.attributes.length>0&&new Set(x.attributes).size===x.attributes.length&&x.attributes.every(n=>ATTRIBUTES.includes(n)))&&(x.skill===undefined||text(x.skill))&&(x.sub===undefined||text(x.skill)&&text(x.sub));
export function ruleRequestValid(r) {
  if(!record(r)||r.kind!=='rule'||!fields[r.action]||Object.keys(r).some(k=>!['kind','action',...fields[r.action],'preActionDC'].includes(k)))return false;
  if(r.willpower!==undefined&&typeof r.willpower!=='boolean')return false;
  if(r.preActionDC!==undefined&&(!Number.isSafeInteger(r.preActionDC)||r.preActionDC<1))return false;
  if(r.sourceQuote!==undefined&&!text(r.sourceQuote))return false;
  if(r.limbIds!==undefined&&(!Array.isArray(r.limbIds)||!r.limbIds.length||!r.limbIds.every(text)))return false;
  if(r.targetId!==undefined&&!text(r.targetId))return false;
  if(r.action==='check'&&(r.objectId!==undefined||r.part!==undefined)&&(r.purpose!=='jump'||!text(r.objectId)||!text(r.part)))return false;
  if(r.purpose!==undefined&&!CHECK_PURPOSES.includes(r.purpose))return false;
  if(r.action==='opposed')return selector(r.active)&&selector(r.passive)&&r.active.actorId!==r.passive.actorId;
  if(!text(r.actorId))return false;
  switch(r.action) {
    case 'resume_effects':return true;
    case 'check':return selector(Object.fromEntries(['actorId','attribute','skill','sub'].filter(k=>r[k]!==undefined).map(k=>[k,r[k]])))&&natural(r.dc);
    case 'save':return ['will','reflex','fort'].includes(r.type)&&natural(r.dc);
    case 'extended':return selector(Object.fromEntries(['actorId','attribute','skill','sub'].filter(k=>r[k]!==undefined).map(k=>[k,r[k]])))&&
      text(r.taskId)&&natural(r.target)&&r.target>0&&natural(r.periodMinutes)&&r.periodMinutes>0&&natural(r.maxPeriods)&&r.maxPeriods>0;
    case 'growth':return (ATTRIBUTES.includes(r.attribute)&&r.skill===undefined&&r.sub===undefined)||
      (r.attribute===undefined&&text(r.skill)&&(r.sub===undefined||text(r.sub)));
    case 'first_aid':return text(r.targetId);
    case 'ability':return ['flow','tengzhuan','draw','sheathe','stowWeapon','readyWeapon','reload'].includes(r.abilityId)&&(r.abilityId==='flow'?[1,2].includes(r.tier):r.tier===undefined)&&(r.weapon===undefined||['bow','longknife','dagger'].includes(r.weapon));
    case 'hypnosis_resist':return text(r.statusSource)&&text(r.eventId);
    case 'feat':return text(r.featId);
    case 'resource':return text(r.offerId)&&(r.paymentId===undefined||text(r.paymentId));
    case 'status_event':return text(r.eventId);
    case 'status':return text(r.type)&&natural(r.points)&&text(r.sourceQuote);
    case 'deterioration':return r.from===undefined||['B','L'].includes(r.from);
    case 'node':case 'chapter':case 'reward':return text(r.eventId);
    case 'inventory':return ['store','retrieve'].includes(r.operation)&&text(r.itemId);
    case 'time':return Number.isFinite(r.minutes)&&r.minutes>0&&text(r.sourceQuote);
    case 'mechanism':return text(r.objectId)&&text(r.operation)&&(r.part===undefined||text(r.part));
    default:return false;
  }
}

function requireGrowthWindow(root,r){
 const window=root.ruleScene?.growthWindow;
 if(!window?.source||window.open!==true||!window.actorIds?.includes(r.actorId))throw Error('当前尚未登记可强化节点／故事间隙');
 if(window.allowedChoices&&!window.allowedChoices.some(x=>Object.entries(x).every(([k,v])=>r[k]===v)))throw Error('此强化尚不满足当前节点登记的学习条件');
}

// This reducer only receives validated selectors. Host-owned templates/events
// determine resource numbers; the classifier cannot submit an actor or patch.
export function reduceRuleAction(input,request,{drawDice,actorTemplates={},events={},feats={}}={}) {
  if(!ruleRequestValid(request))throw Error('无效规则请求');
  const next=structuredClone(input),r=request;
  for(const record of Object.values(next.actors??{}))syncActorWounds(record);
  refreshResourceAuras(next);
  events={...events,...next.ruleScene?.events};feats={...feats,...next.ruleScene?.feats};
  const actor=id=>{if(!next.actors?.[id]?.state)throw Error(`缺少当前人物：${id}`);return next.actors[id];};
  const dice=()=>{if(typeof drawDice!=='function')throw Error('缺少可信骰源');return drawDice();};
  if(r.action==='resume_effects'){actor(r.actorId);return {...next,result:{action:r.action,automaticEvents:flushAutomaticResourceEvents(next,{drawDice:dice,actorTemplates})}};}
  if(Object.values(next.actors).some(a=>a.state.resourceAutomaticEvents?.length)){const e=new Error('须先续算已锁定自动效果');e.code='NEEDS_INPUT';e.field='resourceAutomaticEvents';throw e;}
  const pendingConcentration=settleResourceConcentration(next,next,dice,actorTemplates);
  const passTime=(minutes,changes)=>{
    const fullActors=Object.fromEntries(Object.entries(next.actors).map(([id,record])=>[id,{...structuredClone(actorTemplates[id]??{}),...structuredClone(record),...structuredClone(record.combatCarry??{}),state:record.state,id,position:record.position??next.ruleScene?.spatial?.actors?.[id]?.position??record.combatCarry?.position}]));
    advanceActorsTime(fullActors,minutes,changes,{drawDice:dice,root:next});
    for(const [id,full]of Object.entries(fullActors)){
      const record=next.actors[id];record.state=full.state;
      if(full.state.verticalPosition&&full.position){record.position=full.position;if(next.ruleScene?.spatial?.actors?.[id])next.ruleScene.spatial.actors[id].position=full.position;}
      if(record.combatCarry)for(const key of ['durationCarry','cooldownCarry','buffs','cooldowns','recoveryLocks','position'])if(full[key])record.combatCarry[key]=full[key];
    }
  };
  const opts=spec=>{
    const s=actor(spec.actorId).state;if(spec.skill)requireKnownSkill(s,spec.skill,spec.sub);
    const derived=actorCheckRules({...actorTemplates[spec.actorId],...actor(spec.actorId).combatCarry,state:s},spec);
    if(['力量','敏捷'].includes(spec.attribute)||spec.skill==='手艺')limbEffects(s,spec.limbIds);
    return {...(spec.attributes?{attributes:spec.attributes}:{attribute:spec.attribute}),...(spec.skill?{skill:spec.skill}:{}),...(spec.sub?{sub:spec.sub}:{}),willpower:spec.willpower,modifier:derived.modifier,context:{...derived.context,limbIds:spec.limbIds},dice:dice()};
  };
  let result;
  const activeId=r.action==='opposed'?r.active.actorId:r.actorId;
  let preActionCheck,permission;assertEmbodied(actor(activeId).state,r,next.ruleScene?.objects);
  const completedSleep=r.action==='mechanism'&&(next.ruleScene?.objects?.[r.objectId]?.type==='magicConstitution'&&r.operation==='sleep'||next.ruleScene?.objects?.[r.objectId]?.type==='geneticLock'&&r.operation==='allocateBacklash');
  const activeProjectionObservation=r.action==='status_event'&&next.ruleScene?.events?.[r.eventId]?.type==='projectionEvent'&&next.ruleScene.events[r.eventId].operation==='observe'&&next.ruleScene.events[r.eventId].mode==='active';
  if(!completedSleep&&(['check','opposed','extended','first_aid','inventory','mechanism'].includes(r.action)||activeProjectionObservation)){
    const a=actor(activeId);permission=statusActionPermission(a.state,r);const e=actionEligibility(a.state,'free',permission);if(!e.allowed)throw Error(e.reason);
    if(e.requiresBCheck){if(r.preActionDC===undefined)throw Error('B伤满格须提供行动前力量检定preActionDC');const pre=checkBeforeAction(a.state,{dc:r.preActionDC,dice:dice()});a.state=pre.state;preActionCheck=pre.result;
      if(!pre.result.allowed)return {...next,result:{action:r.action,prevented:true,preActionCheck}};
    }
  }
  if(r.action==='opposed') {
    const active=actor(r.active.actorId),passive=actor(r.passive.actorId);
    result=oppose(active.state,passive.state,opts(r.active),opts(r.passive));
    if(!result.active.eligible||!result.passive.eligible)throw Error(result.active.reason??result.passive.reason);
    changeWill(active.state,-(result.active.willCost??0));changeWill(passive.state,-(result.passive.willCost??0));
  } else {
    const a=actor(r.actorId),s=a.state;
    switch(r.action) {
      case 'status_event':result=statusEvent(next,r,{drawDice:dice,actorTemplates,preActionCleared:preActionCheck?.allowed===true});break;
      case 'ability': {
        const template=actorTemplates[r.actorId];if(!template?.abilities.includes(r.abilityId))throw Error('当前人物没有这项已登记能力');
        const temp=createOpeningEncounter({id:'field-action',scenario:'场外自身能力内部计算',participants:[r.actorId],positions:{[r.actorId]:[0,0]}});
        const full={...structuredClone(template),...structuredClone(a.combatCarry??{}),state:beginTurn(s).state};
        full.buffs={...full.buffs};full.expires={};
        for(const [key,e]of Object.entries(full.durationCarry??{}))if(e.remainingRounds>0){full.buffs[key]=e.value;full.expires[key]=1+e.remainingRounds;}
        temp.actors[r.actorId]=full;temp.activeId=r.actorId;
        const out=act(temp,{actorId:r.actorId,abilityId:r.abilityId,...(r.tier?{tier:r.tier}:{}),...(r.weapon?{weapon:r.weapon}:{}),...(r.preActionDC?{preActionDC:r.preActionDC}:{})},{drawDice:dice,playerAuthorized:true});
        const updated=out.battle.actors[r.actorId];a.state={...updated.state,turn:s.turn};a.combatCarry??={};
        for(const key of ['buffs','weaponMode','sheathed','loaded','ammunition'])if(updated[key]!==undefined)a.combatCarry[key]=updated[key];
        a.combatCarry.durationCarry=Object.fromEntries(Object.entries(updated.expires??{}).filter(([,end])=>end>1).map(([key,end])=>[key,{value:updated.buffs[key],remainingRounds:end-1}]));
        result={abilityId:r.abilityId,...(out.result.preActionCheck?{preActionCheck:out.result.preActionCheck,prevented:!out.result.preActionCheck.allowed}:{}),durationCarry:a.combatCarry.durationCarry,resources:a.state.resources};break;
      }
      case 'hypnosis_resist': {
        const e=events[r.eventId],status=s.statuses.find(x=>x.source===r.statusSource&&x.type==='魅惑'&&x.controllerName==='达卡斯');
        if(!status||e?.type!=='hypnosisOrder'||!e.actorIds?.includes(r.actorId)||!['suicidal','moralViolation'].includes(e.reason))throw Error('须已确认的明显送死或完全违背道德指示事件');
        if(s.ruleEvents?.includes(r.eventId))throw Error('这条指示的额外抵抗已结算');
        const roll=check(s,{attribute:s.attributes.意志<=s.attributes.风度?'意志':'风度',skill:'求生',dice:dice()});
        status.points=Math.max(0,status.points-roll.total);s.statuses=s.statuses.filter(x=>x.points>0);(s.ruleEvents??=[]).push(r.eventId);result={remaining:status.points,resistance:roll};break;
      }
      case 'mechanism':{
        result=runSceneMechanism(next,r,{drawDice:dice,actorTemplates,preActionCleared:preActionCheck?.allowed===true});
        if(result.elapsedMinutes){const changes=[];passTime(result.elapsedMinutes,changes);result.timeChanges=changes;result.sceneChanges=advanceSceneTime(next.ruleScene,result.elapsedMinutes);}
        break;
      }
      case 'inventory': {
        const out=ringTransfer(a,r);a.state=out.actor.state;result=out.result;
        if(out.result.elapsedMinutes)advanceTime(a,out.result.elapsedMinutes,[],{drawDice:dice,root:next});break;
      }
      case 'time': {
        const changes=[];passTime(r.minutes,changes);
        result={minutes:r.minutes,changes,sceneChanges:advanceSceneTime(next.ruleScene,r.minutes)};break;
      }
      case 'check': {
        const jump=r.purpose==='jump'?jumpCheckContext(next,r):null;
        result=check(s,{...opts(r),dc:r.dc,...(jump?{modifierGroups:{enhancement:jump.runUpDP}}:{})});
        if(jump)result=resolveJumpDistance(result,jump);
        if(result.eligible)changeWill(s,-(result.willCost??0));break;
      }
      case 'save': {
        const template=next.battle?.actors?.[r.actorId]??actorTemplates[r.actorId];
        if(template) {
          const full={...structuredClone(template),...structuredClone(a.combatCarry??{}),state:s};
          const p=saveProfile(full,r.type);
          result=check(s,{poolBase:p.dp,attributeAutoOverride:p.fixed,reExtraSuccesses:p.extra,dc:r.dc,dice:dice(),willpower:r.willpower,
            context:{willResistance:r.type==='will',physical:r.type!=='will',motion:r.type==='reflex',reflex:r.type==='reflex'}});
        } else result=check(s,{...(r.type==='will'?{attributes:['意志','风度']}:
          {attribute:r.type==='fort'?'力量':'敏捷',skill:r.type==='fort'?'求生':'运动'}),dc:r.dc,dice:dice(),willpower:r.willpower});
        if(result.eligible)changeWill(s,-(result.willCost??0));
        break;
      }
      case 'extended': {
        const definition={attribute:r.attribute,skill:r.skill,sub:r.sub??null,target:r.target,periodMinutes:r.periodMinutes,maxPeriods:r.maxPeriods};
        s.extendedChecks??={};const progress=s.extendedChecks[r.taskId]??{definition,accumulated:0,periods:0};
        if(JSON.stringify(progress.definition)!==JSON.stringify(definition))throw Error('同一延长行动的目标、周期和技能不可中途更换');
        if(progress.complete)throw Error('延长行动已完成');
        if(progress.periods>=r.maxPeriods)throw Error('延长行动已超过期限');
        const roll=check(s,{...opts(r),context:{...actorCheckRules({...actorTemplates[r.actorId],state:s},r).context,extended:true,periodMinutes:r.periodMinutes}});
        if(!roll.eligible)throw Error(roll.reason);progress.accumulated+=roll.total;progress.periods++;
        progress.complete=progress.accumulated>=r.target;s.extendedChecks[r.taskId]=progress;
        const changes=[];
        passTime(r.periodMinutes,changes);
        advanceSceneTime(next.ruleScene,r.periodMinutes);
        result={...progress,roll,elapsedMinutes:r.periodMinutes,timeChanges:changes,success:progress.complete,expired:!progress.complete&&progress.periods>=r.maxPeriods};break;
      }
      case 'growth': {
        requireGrowthWindow(next,r);
        if(r.skill&&(!s.skills?.[r.skill]||r.sub&&!s.skills[r.skill]?.subs?.[r.sub])){
          const choices=next.ruleScene.growthWindow.allowedChoices;
          if(!choices?.some(x=>x.action==='growth'&&x.skill===r.skill&&x.sub===r.sub))throw Error('首次购买该技能须登记确切的主/子技能学习条件');
        }else if(r.skill)requireKnownSkill(s,r.skill,r.sub);
        const out=r.attribute?upgradeAttribute(s,r.attribute):upgradeSkill(s,r.skill,r.sub);
        if(!out.result.allowed)throw Error(out.result.reason);a.state=out.state;result={...out.result,xpBefore:s.xp,xpAfter:out.state.xp,nodeId:next.ruleScene.growthWindow.id};break;
      }
      case 'resource': {
        requireGrowthWindow(next,r);
        const out=purchaseLearning(s,next.ruleScene?.learningOffers?.[r.offerId],r);
        a.state=out.state;if(actorTemplates[r.actorId])refreshDerived({...structuredClone(actorTemplates[r.actorId]),...a.combatCarry,state:a.state});result={...out.result,xpBefore:s.xp,xpAfter:out.state.xp,nodeId:next.ruleScene.growthWindow.id};break;
      }
      case 'first_aid': {
        if(r.actorId===r.targetId)throw Error('PHB急救须由另一人进行');
        const target=actor(r.targetId),healer=beginTurn(s).state;
        const proxy=structuredClone(healer);if(preActionCheck?.allowed)proxy.health.intact=1;
        const paid=spendAction(proxy,'full');if(!paid.result.allowed)throw Error(paid.result.reason);healer.turn=paid.state.turn;
        const out=firstAid(healer,target.state,{dice:dice(),actionAlreadySpent:true});
        if(!out.result.allowed)throw Error(out.result.reason);
        a.state={...out.healer,turn:structuredClone(s.turn)};target.state=out.patient;result=out.result;break;
      }
      case 'feat': {
        requireGrowthWindow(next,r);
        const out=upgradeFeat(s,feats[r.featId]);if(!out.result.allowed)throw Error(out.result.reason);
        a.state=out.state;result={...out.result,xpBefore:s.xp,xpAfter:out.state.xp,nodeId:next.ruleScene.growthWindow.id};break;
      }
      case 'status': {
        if(['肢体妨害','燃烧'].includes(r.type))throw Error('此状态须先登记具体肢体或燃烧类别，再用status_event结算');
        const out=applyStatus(s,{type:r.type,source:r.sourceQuote,points:r.points,dice:dice()});
        a.state=out.state;result=out.result;break;
      }
      case 'deterioration': {
        syncActorWounds(a);const out=advanceDeterioration(s,{from:r.from,drawDice:dice});a.state=out.state;syncActorWounds(a);result=out.result;break;
      }
      case 'node':case 'chapter':case 'reward': {
        const e=events[r.eventId];if(!e||e.type!==r.action||!e.actorIds?.includes(r.actorId))throw Error('缺少已确认的节点／章节事件');
        if(s.ruleEvents?.includes(r.eventId))throw Error('该事件已结算');
        if(e.pool==='guanlanWufa'){
          if(r.action!=='reward'||!s.guanlan?.acquired||!s.guanlan.source)throw Error('悟法XP奖励须有实际观澜持有者和独立奖励来源');
          s.guanlan.wufaXP=(s.guanlan.wufaXP??0)+e.xp;(s.ruleEvents??=[]).push(r.eventId);
          result={xp:0,wufaXP:e.xp,source:e.source};break;
        }
        const out=r.action==='reward'?{state:{...s,xp:s.xp+e.xp},result:{xp:e.xp,source:e.source}}:r.action==='node'?settleNode(s,{id:r.eventId,xp:e.xp,settlement:e.settlement}):recover(s,{type:'chapter'});
        if(r.action==='node'&&e.growthAllowed!==undefined){
          next.ruleScene??={};next.ruleScene.growthWindow={id:r.eventId,source:e.source,open:e.growthAllowed,actorIds:e.actorIds,...(e.allowedChoices?{allowedChoices:structuredClone(e.allowedChoices)}:{})};
        }
        if(e.completeAdventure===true)out.result.guanlan=settleGuanlanAdventure(out.state,r.eventId);
        (out.state.ruleEvents??=[]).push(r.eventId);
        a.state=out.state;result=out.result;break;
      }
    }
  }
  refreshResourceAuras(next);
  if(result?.eligible===false)throw Error(result.reason);
  const engageReturns=settleEngageReturns(next);if(engageReturns.length)result={...result,engageReturns};
  const interrupted=settleInterruptedTeleports(next);if(interrupted.length)result={...result,interruptedChannels:interrupted};
  completeStatusOrder(actor(activeId).state,permission);
  if(!completedSleep&&(['check','opposed','extended','first_aid','inventory','mechanism'].includes(r.action)||activeProjectionObservation)){
    const record=actor(activeId),full={...structuredClone(actorTemplates[activeId]??{}),...record.combatCarry,state:record.state},log={damage:[]};
    const burn=burningDamage(record,'turn',full.combatProfile||full.kind?amount=>{damageEvent(full,[{amount,severity:'L',kind:'energy',energyType:'fire'}],false,log);record.state=full.state;return log.damage;}:undefined);if(burn)result={...result,burning:burn};
  }
  const deaths=settleResourceDeaths(next);if(deaths.length)result={...result,deaths:[...(result?.deaths??[]),...deaths]};
  if(!result?.automaticEvents?.some(e=>e.status==='pending')&&Object.values(next.actors).some(a=>a.state.resourceAutomaticEvents?.length)){const automatic=flushAutomaticResourceEvents(next,{drawDice:dice,actorTemplates});if(automatic.length)result={...result,automaticEvents:[...(result?.automaticEvents??[]),...automatic]};}
  const concentration=[...pendingConcentration,...settleResourceConcentration(input,next,dice,actorTemplates)];
  if(concentration.length)result={...result,concentration};
  for(const record of Object.values(next.actors??{}))syncActorWounds(record);
  return {...next,result:{...result,...(result?.action?{actionCost:result.action}:{}),...(preActionCheck?{preActionCheck}:{}),action:r.action}};
}
