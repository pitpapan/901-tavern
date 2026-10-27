import {flushAutomaticResourceEvents} from './resource-program.mjs';
import {additionalDamageCandidates} from '../resource-additional-damage.mjs';
import {socialResourceContext} from '../resource-social.mjs';
import {effectiveStatuses} from '../resource-status-applicability.mjs';
import {timedResourceInstances} from '../resource-instances.mjs';
import { buildCharacter, requireKnownSkill } from '../../character_builder/builder.mjs';
import {reduceRuleAction,ruleRequestValid} from './rule-actions.mjs';
import {createOpeningRoster} from '../combat/opening.mjs';
import {actorCheckRules,CHECK_PURPOSES} from './actor-rules.mjs';
import { statusLevel,statusPenaltyPoints,effectiveAttribute, effectiveSkill, resolveGeneticUnlock, actionEligibility,checkModifiers } from '../core.mjs';
import { reduceRecovery, OPENING_RECOVERY_RULES } from '../recovery.mjs';
import { validRecoveryRequest, explicitRecoveryDeclaration, recoveryDeclarationOrderMatches } from './adjudication-gate.mjs';
import { initializeTestState, readTestOperation, readTestSummary,
  readTestActorState,readTestActorRecord, readTestOpportunity, settleCheck, settleDirectEffect,
  settleGeneticUnlock, settleScriptedFortune, requiresEffectChoice, settleRecovery,settleRuleAction } from '../mvu_poc/adapter.mjs';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const ATTRIBUTES = new Set(['力量', '敏捷', '智力', '感知', '意志', '风度']);
// Isolated demonstration only: this is an explicit scene award, not a 901
// universal roleplay bonus or a newly adopted PHB/RE resource.
const DIRECT_EFFECTS = Object.freeze({
  'demo.scene-cue': Object.freeze({ id: 'demo.scene-cue', label: '场景线索',
    source: 'isolated-demo/scene-cue', attribute: '感知', skill: '洞察',
    value: 1, duration: 'nextMatchingCheck', visibility: 'public' }),
});
const validCheck = request => record(request) && request.kind === 'check' &&
  Object.keys(request).every(k => ['kind', 'attribute', 'skill', 'sub', 'dc', 'purpose','preActionDC','limbIds'].includes(k)) &&
  (request.limbIds===undefined||Array.isArray(request.limbIds)&&request.limbIds.length>0&&request.limbIds.every(x=>typeof x==='string')) &&
  (request.preActionDC===undefined||Number.isSafeInteger(request.preActionDC)&&request.preActionDC>0) &&
  (request.purpose === undefined || CHECK_PURPOSES.includes(request.purpose)) &&
  ATTRIBUTES.has(request.attribute) && typeof request.skill === 'string' &&
  Number.isSafeInteger(request.dc) && request.dc >= 1;
const matches = (effect, request) => effect.attribute === request.attribute &&
  effect.skill === request.skill && (effect.sub ?? null) === (request.sub ?? null);
// The host confirms an adopted rule's trigger for this exact branch. Model
// requests can select the map key only, never supply this authorization.
function scriptedOpportunityReady(spec, anchor) {
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const trigger = spec?.trigger;
  const condition = spec?.successCondition;
  return record(spec) && spec.authorized === true && spec.resolved === false &&
    spec.rollType === 'phb_fortune' && ['public', 'secret'].includes(spec.visibility) &&
    text(spec.sourceId) && text(spec.opportunityId) && record(condition) &&
    Object.keys(condition).every(key => key === 'minimum') &&
    Number.isInteger(condition.minimum) && condition.minimum >= 1 &&
    record(trigger) && text(trigger.id) && text(trigger.condition) && trigger.satisfied === true &&
    trigger.anchor?.chatId === anchor.chatId && trigger.anchor?.messageId === anchor.messageId &&
    trigger.anchor?.swipeId === anchor.swipeId;
}
function randomDice() {
  const dice = [];
  while (dice.length < 256) {
    const bytes = new Uint8Array(256);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) if (byte < 250 && dice.length < 256) dice.push(byte % 10 + 1);
  }
  return dice;
}

// NPC ordinary checks share the existing actor/check/commit path. The scene
// authorization and modifier catalogue come from the host, never model JSON.
export async function settleNpcCheck({ mvu, getAnchor, expectedChatId, operationId,
  request, npcContext, drawDice = randomDice } = {}) {
  const missing = () => ({ status: 'needs_input', kind: 'check', actorType: 'npc',
    missing: ['NPC检定需要完整可信人物数据及当前场景授权；未结算。'] });
  if (!record(request) || request.kind !== 'check' || typeof request.actorId !== 'string' ||
      !request.actorId || request.actorId === 'player') return missing();
  if ('opposed' in request || 'consequence' in request)
    return { status: 'deferred', kind: 'check', actorType: 'npc',
      reason: 'NPC opposed checks and additional mechanical consequences are not integrated' };
  if (Object.keys(request).some(k => !['kind', 'actorId', 'sceneId', 'triggerId', 'attribute',
    'skill', 'sub', 'dc', 'modifierIds', 'effectChoice'].includes(k)) ||
      !ATTRIBUTES.has(request.attribute) || typeof request.skill !== 'string' ||
      !Number.isInteger(request.dc) || request.dc < 1 || request.dc > 10 ||
      !Array.isArray(request.modifierIds ?? []) ||
      new Set(request.modifierIds ?? []).size !== (request.modifierIds ?? []).length) return missing();
  const opts = { mvu, getAnchor, expectedChatId };
  const anchor = getAnchor();
  if (anchor.chatId !== expectedChatId || operationId !== `gm-runtime/${expectedChatId}/${anchor.messageId}/${anchor.swipeId}`)
    return missing();
  const project = result => ({ status: result.status, kind: 'check', actorType: 'npc', operationId,
    success: result.success, fortune: result.fortune, possibleMishap: result.possibleMishap,
    consequences: 'No additional numerical consequences authorized' });
  let saved;
  try { saved = readTestOperation({ ...opts, operationId }); } catch { return missing(); }
  if (saved) {
    const old = JSON.parse(saved.signature);
    if (old.actorType !== 'npc' || JSON.stringify(old.checkInput?.npcRequest) !== JSON.stringify(request))
      return missing();
    return project({ ...saved.summary, status: 'already_applied' });
  }
  if (!record(npcContext) || !npcContext.sceneId || !npcContext.triggerId ||
      request.sceneId !== npcContext.sceneId || request.triggerId !== npcContext.triggerId ||
      !npcContext.actorIds?.includes(request.actorId) || npcContext.protagonistInvolved !== true ||
      typeof npcContext.reason !== 'string' || !npcContext.reason.trim()) return missing();
  let state, modifiers, expectedRevision;
  const trustedEffects = npcContext.trustedEffects ?? {};
  try {
    state = readTestActorState({ ...opts, actorId: request.actorId });
    requireKnownSkill(state, request.skill, request.sub);
    effectiveAttribute(state, request.attribute);
    effectiveSkill(state, request.skill, request.sub);
    const eligible = actionEligibility(state, 'free');
    if (!eligible.allowed || eligible.requiresBCheck) return missing();
    modifiers = (request.modifierIds ?? []).map(id => {
      const modifier = npcContext.modifiers?.[id];
      if (!record(modifier) || !Number.isInteger(modifier.value) ||
          typeof modifier.source !== 'string' || !modifier.source.trim() ||
          !modifier.actorIds?.includes(request.actorId) || modifier.attribute !== request.attribute ||
          modifier.skill !== request.skill || (modifier.sub ?? null) !== (request.sub ?? null))
        throw Error('Unsupported contextual modifier');
      return { id, value: modifier.value, source: modifier.source };
    });
    const effects = (state.checkEffects ?? []).filter(e => matches(e, request));
    if (effects.length > 1 || effects.some(e => JSON.stringify(e) !== JSON.stringify(trustedEffects[e.id])))
      return missing();
    const active = effects.filter(requiresEffectChoice);
    if (active.length ? !['skip', active[0].id].includes(request.effectChoice)
      : request.effectChoice !== undefined) return missing();
    expectedRevision = readTestSummary(opts).revision;
  } catch { return missing(); }
  const result = await settleCheck({ ...opts, operationId, expectedRevision,
    actorId: request.actorId, actorType: 'npc', trustedEffects,
    checkInput: { attribute: request.attribute, skill: request.skill,
      ...(request.sub === undefined ? {} : { sub: request.sub }), dc: request.dc,
      modifier: modifiers.reduce((sum, item) => sum + item.value, 0),
      ...(request.effectChoice === undefined ? {} : { effectChoice: request.effectChoice }),
      npcRequest: structuredClone(request), contextModifiers: modifiers, dice: drawDice() } });
  return project(result);
}

// Isolated replay test only. Baseline JSON must come from the trusted local card
// artifact, never from a chat variable or GM request.
export function createReplayCheckRuntime({ baseline, mvu, getAnchor, expectedChatId,
  drawDice = randomDice, geneticOpportunities = {}, scriptedOpportunities = {},
  initialGeneticLock, npcContext, ruleEvents={},ruleFeats={},actorTemplates } = {}) {
  if (baseline?.baselineStatus !== 'APPROVED_REPLAY_BASELINE' ||
      typeof expectedChatId !== 'string' || !expectedChatId ||
      typeof getAnchor !== 'function' || typeof drawDice !== 'function')
    throw new Error('Trusted replay baseline and isolated chat required');
  const opts = { mvu, getAnchor, expectedChatId };
  const built = buildCharacter(baseline.definition, baseline.openingState.isolatedTestInitial);
  if (!built.ok) throw new Error(`Replay Builder input invalid: ${JSON.stringify(built.report)}`);
  if (initialGeneticLock !== undefined && (!record(initialGeneticLock) ||
      typeof initialGeneticLock.source !== 'string' || !initialGeneticLock.source.trim() ||
      !record(initialGeneticLock.successfulUnlocks) ||
      !Number.isInteger(initialGeneticLock.successfulUnlocks[1]) || initialGeneticLock.successfulUnlocks[1] < 0 ||
      !Number.isInteger(initialGeneticLock.highestStage) || initialGeneticLock.highestStage < 0 ||
      !Number.isInteger(initialGeneticLock.activeStage) || initialGeneticLock.activeStage < 0 ||
      (initialGeneticLock.successfulUnlocks[2] !== undefined &&
        (!Number.isInteger(initialGeneticLock.successfulUnlocks[2]) || initialGeneticLock.successfulUnlocks[2] < 0))))
    throw new Error('Explicit sourced genetic-lock history required');
  const initialPlayerState = structuredClone(built.state);
  actorTemplates??=baseline.definition.id==='PC_YULINFENG_OPENING_20261022'?createOpeningRoster():{};
  const currentRules=request=>{
    const a=readTestActorRecord({...opts,actorId:'player'});
    return actorCheckRules({...actorTemplates.player,...a.combatCarry,state:a.state},request);
  };
  if (initialGeneticLock !== undefined) initialPlayerState.geneticLock = structuredClone(initialGeneticLock);
  return {
    buildReport: built.report,
    directEffectOptions: Object.values(DIRECT_EFFECTS).map(effect => ({
      id: effect.id, label: effect.label, attribute: effect.attribute,
      skill: effect.skill, value: effect.value, duration: effect.duration })),
    async initialize({ openingAssumption = false } = {}) {
      if (!openingAssumption) throw new Error('Explicit replay opening assumption required');
      return initializeTestState({ ...opts, actors: {
        player: { name: baseline.definition.name, state: initialPlayerState },
      } });
    },
    read: () => readTestSummary(opts),
    currentPlayer:()=>readTestActorState({...opts,actorId:'player'}),
    ruleContext() {
      const scene=readTestSummary(opts).ruleScene;
      const actual={actors:Object.fromEntries(Object.keys(readTestSummary(opts).actors).map(id=>[id,{state:readTestActorState({...opts,actorId:id})}]))};
      return {spatial:scene.spatial??null,learningOffers:Object.values(scene.learningOffers??{}),growthWindow:scene.growthWindow??null,objects:scene.objects??{},actors:Object.entries(readTestSummary(opts).actors).map(([id,a])=>{
        const s=readTestActorState({...opts,actorId:id}),effective=new Set(effectiveStatuses(s));
        const statusLevels=[...new Set(s.statuses.map(x=>x.type))].map(type=>({type,...statusLevel(s,type),penaltyPoints:statusPenaltyPoints(s,type)}));
        const statusContributions=s.statuses.map((status,statusIndex)=>({statusIndex,active:effective.has(status),effectivePoints:effective.has(status)?status.points:0}));
        return {id,name:a.name,socialConstraints:socialResourceContext(s),timedResourceInstances:timedResourceInstances(actual,id),xp:s.xp,guanlan:s.guanlan,learnedResources:s.learnedResources,learningPurchases:s.learningPurchases,resources:s.resources,casting:s.casting,learningGrants:s.learningGrants,equippedResources:s.equippedResources,equippedWeaponId:s.equippedWeaponId,activeResourceEffects:s.activeResourceEffects,resourceCapabilities:s.resourceCapabilities,resourceTriggers:s.resourceTriggers,additionalDamageSources:additionalDamageCandidates(s),resourcePendingTriggerEnds:s.resourcePendingTriggerEnds,resourceAutomaticEvents:s.resourceAutomaticEvents,resourceAutomaticSerial:s.resourceAutomaticSerial,resourceAutomaticClock:s.resourceAutomaticClock,resourceDeathHandled:s.resourceDeathHandled,resourceDeathRestrictions:s.resourceDeathRestrictions,resourceDeathCause:s.resourceDeathCause,resourceLastRecovery:s.resourceLastRecovery,resourceEffectiveClock:s.resourceEffectiveClock,temporaryHealthPools:s.temporaryHealthPools,temporaryHealthSource:s.temporaryHealthSource,resourceConditions:s.resourceConditions,verticalPosition:s.verticalPosition,physicalMotion:s.physicalMotion,paidMotion:s.paidMotion,flightKinematics:s.flightKinematics,resourceDescent:s.resourceDescent,pendingFall:s.pendingFall,resourceAccumulators:s.resourceAccumulators,woundLedger:s.woundLedger,resourceActionLosses:s.resourceActionLosses,resourceHealthBonus:s.resourceHealthBonus,resourceAuras:s.resourceAuras,resourceChannels:s.resourceChannels,resourceDailyUsage:s.resourceDailyUsage,resourceSceneUsage:s.resourceSceneUsage,resourceProgressions:s.resourceProgressions,resourceEffectSerial:s.resourceEffectSerial,resourceTimeEpoch:s.resourceTimeEpoch,resourceUpkeepClock:s.resourceUpkeepClock,resourceDetectionContests:s.resourceDetectionContests,resourcePendingPerceptions:s.resourcePendingPerceptions,resourceDiscoveries:s.resourceDiscoveries,resourceLocationClues:s.resourceLocationClues,resourceSensoryCues:s.resourceSensoryCues,resourceTurnSerial:s.resourceTurnSerial,resourceMovementSerial:s.resourceMovementSerial,resourceMovementHistory:s.resourceMovementHistory,resourcePerceptionClock:s.resourcePerceptionClock,resourcePerceptionSerial:s.resourcePerceptionSerial,resourcePerceptionQueue:s.resourcePerceptionQueue,resourceTurnOrder:s.resourceTurnOrder,resourceActionUsage:s.resourceActionUsage,resourceConcentration:s.resourceConcentration,resourceCooldowns:s.resourceCooldowns,resourceUseWindows:s.resourceUseWindows,will:s.will,underworld:s.underworld,attributes:s.attributes,skills:s.skills,statuses:s.statuses,statusContributions,statusLevels,anatomy:s.anatomy,permanentConditions:s.permanentConditions,statusOrders:s.statusOrders,sleeping:s.sleeping,wizard:s.wizard,timedEffects:s.timedEffects,channeling:s.channeling,geneticLock:s.geneticLock,antiMagicRestraints:s.antiMagicRestraints,extendedChecks:s.extendedChecks??{},possessions:s.possessions,inventory:s.inventory};
      }),events:Object.entries({...ruleEvents,...scene.events}).map(([id,e])=>({id,...e})),feats:Object.values({...ruleFeats,...scene.feats}),
      genetic:Object.entries({...geneticOpportunities,...readTestSummary(opts).ruleScene.geneticOpportunities}).map(([id,e])=>({id,stage:e.stage??1,condition:e.condition??e.source}))};
    },
    recoveryState() {
      const state=readTestActorState({...opts,actorId:'player'});
      return Object.fromEntries(['health','woundLedger','resourceAccumulators','resourceConditions','inventory','pendingRecoveryEffects','statuses','resources']
        .filter(key=>state[key]!==undefined).map(key=>[key,structuredClone(state[key])]));
    },
    scriptedOpportunityIds: () => Object.keys({...scriptedOpportunities,...readTestSummary(opts).ruleScene.scriptedOpportunities}).filter(id => {
      const spec = {...scriptedOpportunities,...readTestSummary(opts).ruleScene.scriptedOpportunities}[id];
      return scriptedOpportunityReady(spec, getAnchor()) && !readTestOpportunity({ ...opts,
        opportunityKey: `scripted:${spec.sourceId}:${spec.opportunityId}` });
    }),
    // GM-only continuation facts. Never put these in public tool/chat metadata.
    scriptedNarrationFacts(operationId) {
      const saved = readTestOperation({ ...opts, operationId });
      if (saved?.summary?.kind !== 'scripted_fortune' || saved.summary.status !== 'applied')
        throw new Error('Saved scripted result required');
      return `已授权机会的条件${saved.mechanical.success ? '满足' : '未满足'}。` +
        '只叙述规则授权且玩家可感知的后果；不公布机会、投骰存在或机械数值，不新增数值效果。';
    },
    prepareCheck(request, choiceId) {
      if (!validCheck(request)) throw new Error('Supported ordinary check required');
      const state = readTestActorState({ ...opts, actorId: 'player' });
      requireKnownSkill(state, request.skill, request.sub);
      const eligibility=actionEligibility(state,'free');
      if(!eligibility.allowed)throw Error(`当前无法行动：${eligibility.reason}`);
      if(eligibility.requiresBCheck&&request.preActionDC===undefined)throw Error('仅B填满生命槽：须先给出行动前力量检定的主持DC（preActionDC）；未投骰。');
      const skill = effectiveSkill(state, request.skill, request.sub);
      const available = (state.checkEffects ?? []).filter(effect => matches(effect, request));
      if (available.some(effect => !Object.hasOwn(DIRECT_EFFECTS, effect.id) ||
          JSON.stringify(effect) !== JSON.stringify(DIRECT_EFFECTS[effect.id])))
        throw new Error('Active effect differs from trusted template');
      if (available.length > 1) throw new Error('Multiple active effects need a separate ruling');
      const active = available.filter(requiresEffectChoice);
      if (choiceId !== undefined && choiceId !== 'skip' && !active.some(e => e.id === choiceId))
        throw new Error('Unknown player choice');
      const attribute = effectiveAttribute(state, request.attribute);
      const modifiers = available.filter(e => !active.includes(e) || e.id === choiceId)
        .map(e => ({ source: e.label, value: e.value }));
      modifiers.push(...currentRules(request).modifiers);
      const adjustments=checkModifiers(state,{...request,context:currentRules(request).context});
      if(!adjustments.allowed)throw Error(adjustments.reason);
      modifiers.push(...adjustments.entries.map(e=>({source:e.source,value:-e.value})));
      return { publicBasis: { attribute: { name: request.attribute, value: attribute },
        mainSkill: { name: request.skill, value: skill.main },
        ...(request.sub ? { subSkill: { name: request.sub, value: skill.sub } } : {}),
        publicModifiers: modifiers,
        publicSubtotal: attribute + skill.main + skill.sub + modifiers.reduce((n, e) => n + e.value, 0),
        partial: true },
        choices: active.length ? [{ id: 'skip', label: '直接投骰／不使用' },
          ...active.map(e => ({ id: e.id, label: `${e.label} ${e.value > 0 ? '+' : ''}${e.value}DP` }))] : [] };
    },
    async settle({ operationId, request, choiceId, context,ruleContext={} } = {}) {
      if(request?.kind==='rule') {
        if(!ruleRequestValid(request)||choiceId!==undefined)return {status:'needs_input',missing:['规则请求字段不完整']};
        if(!operationId?.startsWith(`gm-runtime/${expectedChatId}/`))throw Error('Trusted replay operation ID required');
        const saved=readTestOperation({...opts,operationId});
        if(saved){if(saved.signature!==JSON.stringify({request}))throw Error('Operation ID already used for different input');return {...saved.summary,status:'already_applied'};}
        const declaration=[context?.original?.text,context?.latest?.text].filter(Boolean).join('；');
        if(['growth','feat','resource'].includes(request.action)&&(!/提升|升级|提高|学习|购买|支付|付清/.test(declaration)||!/^(?!.*(?:暂不|不要|取消|能否|可否|是否)).*$/s.test(declaration)||
          !declaration.includes((request.action==='resource'?readTestSummary(opts).ruleScene.learningOffers?.[request.offerId]?.name:undefined)??request.attribute??request.sub??request.skill??({...ruleFeats,...readTestSummary(opts).ruleScene.feats})[request.featId]?.name??request.featId)))return {status:'needs_input',missing:['需要玩家明确声明提升的属性、技能、专长或资源；不自动花费XP。']};
        if(['growth','feat','resource'].includes(request.action)&&declaration.includes('悟法')&&(request.action!=='resource'||request.paymentId===undefined))return {status:'needs_input',missing:['悟法XP只能按已登记付款方案用于观澜树D级技艺；不能改扣普通XP。']};
        if(request.action==='resource'&&request.paymentId!==undefined){
          const payment=readTestSummary(opts).ruleScene.learningOffers?.[request.offerId]?.payments?.[request.paymentId];
          if(!payment||!declaration.includes(payment.label??request.paymentId)||(payment.wufaXP>0&&!declaration.includes('悟法')))return {status:'needs_input',missing:['分次支付须明确选择已登记付款方案的名称；使用悟法XP须明确选择悟法。']};
        }
        const willSelectors=request.action==='opposed'?[request.active,request.passive]:[request];
        if(willSelectors.some(x=>x.willpower===true)&&(!/(?:花费|消耗|使用|用|花)\s*(?:1|一|一点|1点)?\s*(?:点)?意志/.test(declaration)||/不(?:用|花|消耗)|不要|暂不/.test(declaration)))return {status:'needs_input',missing:['意志增强须由玩家明确选择；每次消耗1意志。']};
        const ids=request.action==='opposed'?[request.active.actorId,request.passive.actorId]:[request.actorId,...(request.targetId?[request.targetId]:[])];
        if(ids.some(id=>id!=='player'&&!ruleContext.actorIds?.includes(id)))return {status:'needs_input',missing:['请确认本次行动涉及的在场人物，不能仅凭世界书或历史记录结算。']};
        if(request.action==='status'&&(!ruleContext.scene?.includes(request.sourceQuote)||!request.sourceQuote.includes(request.type)||
          !request.sourceQuote.includes(String(request.points))))return {status:'needs_input',missing:['异常需要当前已确认的效果、状态名称和点数。']};
        if(request.action==='time'&&!declaration.includes(request.sourceQuote)&&!ruleContext.scene?.includes(request.sourceQuote))return {status:'needs_input',missing:['经过时间需要玩家声明或当前已经确定的时间原文。']};
        if(request.action==='ability'&&(!/启动|开启|使用|发动|拔刀|收刀|上箭|取出|收起/.test(declaration)||/不要|暂不|能否|可否/.test(declaration)))return {status:'needs_input',missing:['须玩家明确使用能力或操作装备，不能把讨论当作执行']};
        if(request.action==='inventory'&&(!/取出|放入|存入|取回/.test(declaration)||/不要|暂不|能否|可否/.test(declaration)))return {status:'needs_input',missing:['戒指存取须有玩家明确的实际操作声明。']};
        try{return await settleRuleAction({...opts,operationId,expectedRevision:readTestSummary(opts).revision,request,
          reduce:(root,r)=>reduceRuleAction(root,r,{drawDice,actorTemplates,events:ruleEvents,feats:ruleFeats})});}
        catch(error){if(/MVU|Operation ID|Chat, message/.test(error.message))throw error;return {status:'needs_input',missing:[error.message]};}
      }
      if(request?.kind==='recovery') {
        if(!validRecoveryRequest(request)||choiceId!==undefined)
          return {status:'needs_input',missing:['请明确药品、恢复选项或已完成的休息时长；不能提交任意数值修改。']};
        if(typeof operationId!=='string'||!operationId.startsWith(`gm-runtime/${expectedChatId}/`))
          throw Error('Trusted replay operation ID required');
        const {kind,...command}=request;
        const saved=readTestOperation({...opts,operationId});
        if(saved) {
          if(saved.signature!==JSON.stringify({actorId:'player',command}))throw Error('Operation ID already used for different input');
          return {...saved.summary,status:'already_applied'};
        }
        const state=readTestActorState({...opts,actorId:'player'});
        const original=context?.original,latest=context?.latest;
        if(!recoveryDeclarationOrderMatches(request,original?.text))return {status:'needs_input',
          missing:['须保留原声明中全部恢复动作及其顺序；补充选择不能遗漏、交换或增加动作。']};
        // A later confirmation may repeat the original action. It is evidence
        // for the same pending operation, never an extra dose in that sequence.
        const declaration=[latest?.text,original?.text].find(text=>explicitRecoveryDeclaration(request,text,state))??
          [original?.text,...(original?.text===latest?.text?[]:[latest?.text])].filter(Boolean).join('；');
        if(!explicitRecoveryDeclaration(request,declaration,state)&&
          !explicitRecoveryDeclaration(request,original?.text,state,latest?.text))
          return {status:'needs_input',missing:['需要玩家明确声明服用该药、恢复选项或完成相应时长的休息／打坐。']};
        try {
          return await settleRecovery({...opts,operationId,expectedRevision:readTestSummary(opts).revision,
            command,playerAuthorized:true,reduce:(actor,input,root)=>{
              // Old opening snapshots predate recovery policy metadata. The
              // trusted baseline supplies rules only; saved stock/HP stay intact.
              if(baseline.definition.id==='PC_YULINFENG_OPENING_20261022'&&!actor.state.recoveryRules)
                actor.state.recoveryRules=structuredClone(OPENING_RECOVERY_RULES);
              const scene={...root,actors:Object.fromEntries(Object.entries(root.actors).map(([id,row])=>[id,{...structuredClone(actorTemplates[id]??{}),...row,...structuredClone(row.combatCarry??{}),id,state:row.state}]))};
              const outcome=reduceRecovery(actor,input,{drawDice,playerAuthorized:true,root:scene});scene.actors[actor.id]=outcome.actor;
              const automaticEvents=flushAutomaticResourceEvents(scene,{drawDice});if(automaticEvents.length)outcome.result.automaticEvents=automaticEvents;
              return {...outcome,actor:scene.actors[actor.id],affectedActors:scene.actors};
            }});
        }catch(error) {
          if(error.name==='IllegalAction'||error.name==='RuleInputError')return {status:'needs_input',missing:[error.message]};
          throw error;
        }
      }
      if (request?.kind === 'check' && request.actorId !== undefined) {
        if (choiceId !== undefined) return { status: 'needs_input', missing: ['NPC检定不使用玩家选择面板'] };
        return settleNpcCheck({ ...opts, operationId, request, npcContext, drawDice });
      }
      if (record(request) && ['genetic_unlock', 'scripted_fortune'].includes(request.kind)) {
        if (typeof operationId !== 'string' || !operationId.startsWith(`gm-runtime/${expectedChatId}/`))
          throw new Error('Trusted replay operation ID required');
        if (choiceId !== undefined) return { status: 'needs_input', missing: ['Special roll has no ordinary check choice'] };
        const genetic = request.kind === 'genetic_unlock';
        const allowed = genetic ? ['kind', 'stage', 'opportunityId', 'roleplayModifier']
          : ['kind', 'opportunityId'];
        if (Object.keys(request).some(key => !allowed.includes(key)) ||
            typeof request.opportunityId !== 'string' || !request.opportunityId)
          return { status: 'needs_input', missing: ['Complete special opportunity request required'] };
        const opportunity = genetic ? {...geneticOpportunities,...readTestSummary(opts).ruleScene.geneticOpportunities}[request.opportunityId]
          : {...scriptedOpportunities,...readTestSummary(opts).ruleScene.scriptedOpportunities}[request.opportunityId];
        if (!record(opportunity)) return { status: 'deferred', reason: 'No adopted rule for this opportunity' };
        if (!genetic && opportunity.rollType !== 'phb_fortune')
          return { status: 'deferred', reason: 'This request path requires an explicitly authorized PHB fortune opportunity' };
        if (genetic && (opportunity.visibility ?? 'public') !== 'public')
          return { status: 'deferred', reason: 'Genetic D10 checks must be public' };
        if (!genetic && opportunity.visibility === 'secret' && opportunity.rollType !== 'phb_fortune')
          return { status: 'deferred', reason: 'Only adopted fortune rolls may be secret' };
        let saved;
        try { saved = readTestOperation({ ...opts, operationId }); }
        catch (error) {
          if (/not initialized on this message branch/.test(error.message))
            return { status: 'needs_input', missing: ['隔离 MVU 人物状态尚未初始化或未承接至当前楼层'] };
          throw error;
        }
        if (saved) {
          const old = JSON.parse(saved.signature);
          const matches = genetic ? old.actorId === 'player' && old.unlockInput?.stage === request.stage &&
            old.unlockInput?.opportunity?.id === opportunity.id &&
            JSON.stringify(old.unlockInput?.roleplayModifier) === JSON.stringify(request.roleplayModifier)
            : old.spec?.sourceId === opportunity.sourceId &&
              old.spec?.opportunityId === opportunity.opportunityId;
          if (!matches) throw new Error('Operation ID already used for different input');
          return { ...saved.summary, status: 'already_applied' };
        }
        const opportunityKey = genetic ? `genetic:player:${opportunity.id}`
          : `scripted:${opportunity.sourceId}:${opportunity.opportunityId}`;
        if (readTestOpportunity({ ...opts, opportunityKey }))
          return { status: 'already_resolved', kind: request.kind, visibility: opportunity.visibility ?? 'public', operationId };
        const expectedRevision = readTestSummary(opts).revision;
        if (genetic) {
          const unlockInput = { stage: request.stage, opportunity, mode:opportunity.mode??'natural', attribute:opportunity.attribute,
            specialModifiers: opportunity.specialModifiers ?? [],
            ...(request.roleplayModifier === undefined ? {} : { roleplayModifier: request.roleplayModifier }) };
          const state = readTestActorState({ ...opts, actorId: 'player' });
          const prepared = resolveGeneticUnlock(state, unlockInput);
          if (prepared.status !== 'ready') return prepared;
          return settleGeneticUnlock({ ...opts, operationId, expectedRevision, actorId: 'player',
            visibility: opportunity.visibility ?? 'public',
            unlockInput: { ...unlockInput, dice: drawDice() } });
        }
        if (opportunity.resolved === true) return { status: 'already_resolved', kind: request.kind };
        if (!scriptedOpportunityReady(opportunity, getAnchor()))
          return { status: 'needs_input', missing: ['Trusted authorization, current branch trigger and complete fortune rule required'] };
        return settleScriptedFortune({ ...opts, operationId, expectedRevision,
          spec: { ...opportunity, runtimeRequestId: request.opportunityId }, dice: drawDice() });
      }
      if (!validCheck(request) && !(record(request) && request.kind === 'direct_effect' &&
          Object.keys(request).every(k => ['kind', 'effectId'].includes(k)) &&
          Object.hasOwn(DIRECT_EFFECTS, request.effectId)))
        return { status: 'needs_input', missing: ['可执行的普通检定输入；特殊资源尚未适配'] };
      if (request.kind === 'direct_effect' && choiceId !== undefined)
        return { status: 'needs_input', missing: ['无骰效果不接受玩家检定选择'] };
      try { if (request.kind === 'check') requireKnownSkill(readTestActorState({...opts,actorId:'player'}), request.skill, request.sub); }
      catch { return { status: 'needs_input', missing: [`未知技能 ${request.skill}`] }; }
      if (typeof operationId !== 'string' || !operationId.startsWith(`gm-runtime/${expectedChatId}/`))
        throw new Error('Trusted replay operation ID required');
      let saved;
      try { saved = readTestOperation({ ...opts, operationId }); }
      catch (error) {
        if (/not initialized on this message branch/.test(error.message))
          return { status: 'needs_input', missing: ['隔离 MVU 人物状态尚未初始化或未承接至当前楼层'] };
        throw error;
      }
      if (saved) {
        const old = JSON.parse(saved.signature);
        if (request.kind === 'direct_effect') {
          if (old.actorId !== 'player' || old.effect?.id !== request.effectId)
            throw new Error('Operation ID already used for different direct effect');
          return { ...saved.summary, status: 'already_applied' };
        }
        const input = old.checkInput;
        if (!input || old.actorId !== 'player' || input.attribute !== request.attribute ||
            input.skill !== request.skill || input.sub !== request.sub || input.dc !== request.dc || input.purpose !== request.purpose || input.preActionDC !== request.preActionDC||JSON.stringify(input.limbIds)!==JSON.stringify(request.limbIds))
          throw new Error('Operation ID already used for different check input');
        return { ...saved.summary, status: 'already_applied' };
      }
      const expectedRevision = readTestSummary(opts).revision;
      if (request.kind === 'direct_effect')
        return settleDirectEffect({ ...opts, operationId, expectedRevision,
          actorId: 'player', effect: DIRECT_EFFECTS[request.effectId] });
      let prepared;
      try { prepared = this.prepareCheck(request, choiceId); }
      catch (error) { return { status: 'needs_input', missing: [error.message] }; }
      if (prepared.choices.length && choiceId === undefined)
        return { status: 'needs_choice', publicBasis: prepared.publicBasis, choices: prepared.choices };
      if (!prepared.choices.length && choiceId !== undefined)
        return { status: 'needs_input', missing: ['当前没有可用的主动选项'] };
      const dice = drawDice();
      if (!Array.isArray(dice)) throw new Error('Trusted dice source must return an array');
      return settleCheck({ ...opts, operationId, expectedRevision, actorId: 'player',
        trustedEffects: DIRECT_EFFECTS,actorTemplate:actorTemplates.player,
        checkInput: { attribute: request.attribute, skill: request.skill,
          ...(request.sub ? { sub: request.sub } : {}),...(request.limbIds?{limbIds:request.limbIds}:{}), dc: request.dc,
          ...(request.preActionDC!==undefined?{preActionDC:request.preActionDC}:{}),...(request.purpose ? {purpose:request.purpose} : {}),modifier:currentRules(request).modifier,contextModifiers:currentRules(request).modifiers,context:currentRules(request).context,
          ...(choiceId ? { effectChoice: choiceId } : {}), dice } });
    },
  };
}
