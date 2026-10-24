import { ATTRIBUTES, actionEligibility, checkBeforeAction, check, effectiveAttribute, resolveAttack, resolveGeneticUnlock, rollPool } from '../core.mjs';
import { requireKnownSkill } from '../../character_builder/builder.mjs';
import { createTestRoot, NAMESPACE } from './fixture.mjs';

// This adapter owns only stat_data.901_rules_poc. No chat/global variable writes.
const inFlight = new Set();
const clone = value => structuredClone(value);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const whole = n => Number.isInteger(n) && n >= 0;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// Called only after matching the effect to a trusted local template. Rule
// adoption is authored in that template, never accepted from GM/chat input.
export function requiresEffectChoice(effect) {
  if (['environment', 'roleplay'].includes(effect.category)) return false;
  if (effect.activation !== 'player') return false;
  const use = effect.activeUse;
  const text = value => typeof value === 'string' && value.trim().length > 0;
  if (!['resource', 'ability', 'special'].includes(effect.category) ||
      !record(use) || use.adopted !== true || !text(use.ruleSource) ||
      !(text(use.condition) || record(use.cost)))
    throw new Error('Active effect requires an adopted rule and explicit use condition or supported cost');
  // Only the existing one-check effect lifecycle is supported here. Do not
  // accept an arbitrary resource debit that this adapter cannot actually settle.
  if (use.cost !== undefined && (!record(use.cost) ||
      use.cost.kind !== 'consumeEffect' || Object.keys(use.cost).length !== 1 ||
      effect.duration !== 'nextMatchingCheck'))
    throw new Error('Active effect cost is not supported by this adapter');
  return true;
}

function anchorOf(getAnchor) {
  if (typeof getAnchor !== 'function') throw new Error('getAnchor callback required');
  const anchor = getAnchor();
  if (!anchor || typeof anchor.chatId !== 'string' || !anchor.chatId ||
      !whole(anchor.messageId) || !whole(anchor.swipeId))
    throw new Error('Explicit chatId, nonnegative messageId and swipeId required');
  return anchor;
}

function ensureAnchor(getAnchor, initial) {
  if (!same(anchorOf(getAnchor), initial)) throw new Error('Chat, message, or swipe changed during operation');
}

function read(mvu, anchor) {
  if (typeof mvu?.getMvuData !== 'function' || typeof mvu?.replaceMvuData !== 'function')
    throw new Error('Mvu.getMvuData and Mvu.replaceMvuData required');
  const data = mvu.getMvuData({ type: 'message', message_id: anchor.messageId });
  if (!record(data)) throw new Error('MVU returned no message data');
  if (data.stat_data !== undefined && !record(data.stat_data)) throw new Error('MVU stat_data is invalid');
  return data;
}

function rootOf(data, chatId) {
  const root = data.stat_data?.[NAMESPACE];
  if (!record(root)) throw new Error('Test state not initialized on this message branch');
  if (root.schemaVersion !== 1 || !whole(root.revision) || root.chatId !== chatId ||
      !record(root.actors) || !record(root.operations))
    throw new Error('Test state schema or chat identity mismatch');
  return root;
}

function actorOf(root, id) {
  const actor = root.actors[id];
  if (!record(actor) || !record(actor.state) || typeof actor.name !== 'string')
    throw new Error(`Missing actor: ${id}`);
  const state = actor.state;
  if (!record(state.attributes) || ATTRIBUTES.some(name => !whole(state.attributes[name])) ||
      !record(state.derived) || !whole(state.derived.defense) || !record(state.skills) ||
      !record(state.health) || !record(state.turn) || !Array.isArray(state.statuses))
    throw new Error(`Incomplete actor state: ${id}`);
  const h = state.health;
  if (['intact', 'B', 'L', 'A', 'temp'].some(name => !whole(h[name])) ||
      !whole(state.derived.hpMax) || h.intact + h.B + h.L + h.A !== state.derived.hpMax)
    throw new Error(`Invalid health slots: ${id}`);
  return actor;
}

function summary(root, outcome, operationId, anchor) {
  const trace = outcome.result.attackTrace;
  const successes = trace.find(step => step.step === 'successes');
  const value = {
    status: 'applied', operationId, revision: root.revision, messageId: anchor.messageId,
    swipeId: anchor.swipeId, dp: outcome.result.roll.dp,
    rolledSuccesses: outcome.result.roll.rolledSuccesses,
    attackSuccesses: successes.value, cap: outcome.result.cap,
    actualDamage: outcome.result.actualDamage,
    severity: outcome.result.damage?.finalSeverity ?? null,
    targetHealth: clone(outcome.target.health),
    attackerTurn: clone(outcome.attacker.turn),
  };
  return value;
}

function operationKey(anchor) { return `${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`; }

export async function initializeTestState({ mvu, getAnchor, expectedChatId, actors, battle }) {
  const anchor = anchorOf(getAnchor);
  if (anchor.chatId !== expectedChatId) throw new Error('Refusing write outside the named test chat');
  const key = operationKey(anchor);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial = read(mvu, anchor);
    if (initial.stat_data?.[NAMESPACE] !== undefined)
      throw new Error('Test state already exists; refusing to overwrite');
    const next = clone(initial);
    next.stat_data ??= {};
    const root = actors === undefined ? createTestRoot(anchor.chatId)
      : { schemaVersion: 1, revision: 0, chatId: anchor.chatId,
        operations: {}, actors: clone(actors) };
    if (!record(root.actors) || !Object.keys(root.actors).length)
      throw new Error('Trusted test actors required');
    for (const id of Object.keys(root.actors)) actorOf(root, id);
    if (battle !== undefined) root.battle = combatMetadata(battle);
    next.stat_data[NAMESPACE] = root;
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), initial)) throw new Error('MVU data changed before initialization');
    await mvu.replaceMvuData(next, { type: 'message', message_id: anchor.messageId });
    ensureAnchor(getAnchor, anchor);
    const saved = read(mvu, anchor);
    if (!same(saved, next))
      throw new Error('MVU initialization was not confirmed by readback');
    return { status: 'initialized', revision: 0, messageId: anchor.messageId, swipeId: anchor.swipeId };
  } finally { inFlight.delete(key); }
}

// The combat reducer is trusted application code. Model input only selects an
// ability; it never supplies actor states, dice, revisions or arbitrary patches.
function combatMetadata(battle) {
  const metadata = clone(battle);
  for (const actor of Object.values(metadata.actors)) delete actor.state;
  return metadata;
}

function combatState(root) {
  if (!root.battle) throw new Error('Combat not initialized');
  const battle = clone(root.battle);
  for (const [id, actor] of Object.entries(battle.actors)) actor.state = clone(actorOf(root, id).state);
  return battle;
}

export async function settleCombat({ mvu, getAnchor, expectedChatId, operationId,
  expectedRevision, command, reduce, createBattle }) {
  const anchor = anchorOf(getAnchor);
  if (anchor.chatId !== expectedChatId) throw new Error('Refusing write outside the named test chat');
  if (!operationId?.trim() || !whole(expectedRevision)) throw new Error('Operation ID and revision required');
  const key = operationKey(anchor);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial = read(mvu, anchor), root = rootOf(initial, anchor.chatId);
    const signature = JSON.stringify(command), existing = root.operations[operationId];
    if (existing) {
      if (existing.signature !== signature) throw new Error('Operation ID already used for different input');
      return { ...clone(existing.summary), status: 'already_applied' };
    }
    if (root.revision !== expectedRevision) throw new Error('MVU state version conflict');
    if (!root.battle&&!createBattle) throw new Error('Combat not initialized');
    const workingBattle=createBattle?createBattle(clone(root)):combatState(root);
    workingBattle.ruleScene=clone(root.ruleScene??workingBattle.ruleScene??{});
    const outcome = reduce(workingBattle, clone(command));
    const next = clone(initial), nr = next.stat_data[NAMESPACE];
    nr.battle = combatMetadata(outcome.battle);
    nr.ruleScene=clone(outcome.battle.ruleScene??nr.ruleScene??{});
    nr.actors = {...nr.actors,...Object.fromEntries(Object.entries(outcome.battle.actors)
      .map(([id, actor]) => [id, { ...nr.actors[id], name: actor.name, state: clone(actor.state),
        combatCarry: Object.fromEntries(['equipment','parameters','ammunition','loaded','weaponMode','squeezed','recoveryLocks','knownWeaknesses','weaponSize','durationCarry','cooldownCarry','sceneInstanceId','used','claws','form','underground','weaponsAvailable']
          .filter(key => actor[key] !== undefined).map(key => [key, clone(actor[key])])) }]))};
    for (const id of Object.keys(nr.actors)) actorOf(nr, id);
    nr.revision++;
    const result = { status: 'applied', operationId, revision: nr.revision,
      messageId: anchor.messageId, swipeId: anchor.swipeId, result: outcome.result };
    nr.operations[operationId] = { signature, summary: result };
    nr.lastResult = result;
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), initial)) throw new Error('MVU data changed before save');
    await mvu.replaceMvuData(next, { type: 'message', message_id: anchor.messageId });
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), next)) throw new Error('MVU save was not confirmed by readback');
    return result;
  } finally { inFlight.delete(key); }
}

export function readCombat({ mvu, getAnchor }) {
  const anchor = anchorOf(getAnchor), root = rootOf(read(mvu, anchor), anchor.chatId);
  if (!root.battle) throw new Error('Combat not initialized');
  return { revision: root.revision, battle: combatState(root), lastResult: clone(root.lastResult ?? null) };
}

// Trusted recovery reducer owns all costs and effects. Commit them together with
// the operation record; a saved retry is returned before reduction or dice.
export async function settleRecovery({mvu,getAnchor,expectedChatId,operationId,
  expectedRevision,actorId='player',command,reduce,playerAuthorized=false}) {
  const anchor=anchorOf(getAnchor);
  if(anchor.chatId!==expectedChatId)throw Error('Refusing write outside the named test chat');
  if(!operationId?.trim()||!whole(expectedRevision)||!record(command)||typeof reduce!=='function')
    throw Error('Recovery operation, revision, command and trusted reducer required');
  const key=operationKey(anchor);
  if(inFlight.has(key))throw Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial=read(mvu,anchor),root=rootOf(initial,anchor.chatId);
    const signature=JSON.stringify({actorId,command}),existing=root.operations[operationId];
    if(existing){
      if(existing.signature!==signature)throw Error('Operation ID already used for different input');
      return {...clone(existing.summary),status:'already_applied'};
    }
    if(!playerAuthorized)throw Error('Explicit player recovery declaration required');
    if(root.revision!==expectedRevision)throw Error('MVU state version conflict');
    if(root.battle&&root.battle.mode!=='story')throw Error('Combat recovery must use the combat action budget');
    const actor=actorOf(root,actorId);
    const outcome=reduce({...clone(root.battle?.actors?.[actorId]??{}),id:actorId,name:actor.name,
      ...clone(actor.combatCarry??{}),state:clone(actor.state)},clone(command));
    if(!record(outcome?.actor?.state)||!record(outcome.result))throw Error('Trusted recovery result required');
    const next=clone(initial),nr=next.stat_data[NAMESPACE],target=nr.actors[actorId];
    target.state=clone(outcome.actor.state);
    target.combatCarry??={};
    for(const name of ['durationCarry','cooldownCarry'])if(outcome.actor[name]!==undefined)
      target.combatCarry[name]=clone(outcome.actor[name]);
    if(nr.battle?.actors?.[actorId])for(const name of ['buffs','cooldowns','durationCarry','cooldownCarry'])
      if(outcome.actor[name]!==undefined)nr.battle.actors[actorId][name]=clone(outcome.actor[name]);
    actorOf(nr,actorId);
    nr.revision++;
    const result={status:'applied',kind:'recovery',operationId,revision:nr.revision,
      messageId:anchor.messageId,swipeId:anchor.swipeId,result:clone(outcome.result)};
    nr.operations[operationId]={signature,summary:result};nr.lastResult=result;
    ensureAnchor(getAnchor,anchor);
    if(!same(read(mvu,anchor),initial))throw Error('MVU data changed before save');
    await mvu.replaceMvuData(next,{type:'message',message_id:anchor.messageId});
    ensureAnchor(getAnchor,anchor);
    if(!same(read(mvu,anchor),next))throw Error('MVU save was not confirmed by readback');
    return result;
  }finally{inFlight.delete(key);}
}

// One transaction for ordinary noncombat rules, including two actors. The
// reducer is application code; no model-provided state or JSON patch is accepted.
export async function settleRuleAction({mvu,getAnchor,expectedChatId,operationId,expectedRevision,request,reduce}) {
  const anchor=anchorOf(getAnchor);
  if(anchor.chatId!==expectedChatId)throw Error('Refusing write outside the named test chat');
  if(!operationId?.trim()||!whole(expectedRevision)||!record(request)||typeof reduce!=='function')throw Error('Complete rule transaction required');
  const key=operationKey(anchor);if(inFlight.has(key))throw Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial=read(mvu,anchor),root=rootOf(initial,anchor.chatId),signature=JSON.stringify({request});
    const saved=root.operations[operationId];
    if(saved){if(saved.signature!==signature)throw Error('Operation ID already used for different input');return {...clone(saved.summary),status:'already_applied'};}
    if(root.revision!==expectedRevision)throw Error('MVU state version conflict');
    if(root.battle&&root.battle.mode!=='story')throw Error('Combat rules must use the combat action budget');
    const outcome=reduce({actors:clone(root.actors),ruleScene:clone(root.ruleScene??{}),...(root.battle?{battle:clone(root.battle)}:{})},clone(request));
    if(!record(outcome?.actors)||!record(outcome.result))throw Error('Trusted rule result required');
    const next=clone(initial),nr=next.stat_data[NAMESPACE];nr.actors=clone(outcome.actors);
    for(const id of Object.keys(nr.actors))actorOf(nr,id);
    if(outcome.battle)nr.battle=clone(outcome.battle);
    if(outcome.ruleScene)nr.ruleScene=clone(outcome.ruleScene);
    nr.revision++;
    const result={status:'applied',kind:'rule',operationId,revision:nr.revision,messageId:anchor.messageId,swipeId:anchor.swipeId,result:clone(outcome.result)};
    nr.operations[operationId]={signature,summary:result};nr.lastResult=result;
    ensureAnchor(getAnchor,anchor);if(!same(read(mvu,anchor),initial))throw Error('MVU data changed before save');
    await mvu.replaceMvuData(next,{type:'message',message_id:anchor.messageId});ensureAnchor(getAnchor,anchor);
    if(!same(read(mvu,anchor),next))throw Error('MVU save was not confirmed by readback');
    return result;
  }finally{inFlight.delete(key);}
}

export async function settleCheck({ mvu, getAnchor, expectedChatId, operationId,
  expectedRevision, actorId, checkInput, trustedEffects = {}, actorType = 'player' }) {
  const anchor = anchorOf(getAnchor);
  if (anchor.chatId !== expectedChatId) throw new Error('Refusing write outside the named test chat');
  if (typeof operationId !== 'string' || !operationId.trim() || !whole(expectedRevision))
    throw new Error('Nonempty operationId and expectedRevision required');
  if (typeof actorId !== 'string' || !actorId || !record(checkInput) ||
      typeof checkInput.attribute !== 'string' || typeof checkInput.skill !== 'string' ||
      !whole(checkInput.dc) || !Array.isArray(checkInput.dice))
    throw new Error('Complete check input and deterministic dice required');
  const key = operationKey(anchor);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial = read(mvu, anchor);
    const root = rootOf(initial, anchor.chatId);
    const signature = JSON.stringify({ actorId, checkInput, ...(actorType === 'npc' ? { actorType } : {}) });
    if (root.operations[operationId]) {
      if (root.operations[operationId].signature !== signature)
        throw new Error('Operation ID already used for different input');
      return { ...clone(root.operations[operationId].summary), status: 'already_applied' };
    }
    if (root.revision !== expectedRevision) throw new Error('MVU state version conflict');
    const actor = actorOf(root, actorId);
    const eligibility = actionEligibility(actor.state, 'free');
    if (!eligibility.allowed || eligibility.requiresBCheck && !Number.isSafeInteger(checkInput.preActionDC))
      throw new Error(`Check requires GM ruling: ${eligibility.reason ?? 'pre-action Strength DC required'}`);
    requireKnownSkill(actor.state, checkInput.skill, checkInput.sub);
    const matching = (actor.state.checkEffects ?? []).filter(effect =>
      effect.attribute === checkInput.attribute && effect.skill === checkInput.skill &&
      (effect.sub ?? null) === (checkInput.sub ?? null));
    if (matching.some(effect => !same(effect, trustedEffects[effect.id])))
      throw new Error('Active effect differs from trusted template');
    if (matching.length > 1) throw new Error('Multiple active check effects need a separate ruling');
    const choice = checkInput.effectChoice;
    const active = matching.filter(requiresEffectChoice);
    if (active.length && choice === undefined)
      throw new Error('Active optional effect requires player choice before dice');
    if (!active.length && choice !== undefined)
      throw new Error('No active effect for this choice');
    if (active.length && choice !== 'skip' && choice !== active[0].id)
      throw new Error('Player choice does not match active effect');
    const chosenModifier = matching.filter(effect => !active.includes(effect) || effect.id === choice)
      .reduce((sum, effect) => sum + effect.value, 0);
    const before=eligibility.requiresBCheck?checkBeforeAction(actor.state,{dc:checkInput.preActionDC,dice:checkInput.dice}):null;
    const prevented=before?.result.allowed===false;
    const outcome = prevented?before.result.check:check(before?.state??actor.state, { ...checkInput,
      dice:checkInput.dice.slice(before?.result.check?.used??0),modifier: (checkInput.modifier ?? 0) + chosenModifier });
    if (!outcome.eligible) throw new Error(`Check rejected: ${outcome.reason}`);
    const next = clone(initial);
    const nextRoot = next.stat_data[NAMESPACE];
    if(before)nextRoot.actors[actorId].state=before.state;
    if (!prevented && matching.length) nextRoot.actors[actorId].state.checkEffects =
      (nextRoot.actors[actorId].state.checkEffects ?? []).filter(effect => effect.id !== matching[0].id);
    nextRoot.revision++;
    const result = { status: 'applied', kind: 'check', operationId,
      ...(actorType === 'npc' ? { actorType } : {}),
      revision: nextRoot.revision, messageId: anchor.messageId, swipeId: anchor.swipeId,
      actorId, ...(before?{preActionCheck:before.result,prevented}:{}), dp: outcome.dp, rolledSuccesses: outcome.rolledSuccesses,
      total: outcome.total, dc: outcome.dc, success: outcome.success,
      fortune: outcome.luck, possibleMishap: outcome.luckMishap };
    nextRoot.operations[operationId] = { signature, summary: result,
      ...(actorType === 'npc' ? { mechanical: {
        attribute: { name: checkInput.attribute, base: actor.state.attributes[checkInput.attribute],
          effective: effectiveAttribute(actor.state, checkInput.attribute) },
        skill: clone(outcome.skill), modifiers: clone(checkInput.contextModifiers ?? []),
        effects: clone(matching), outcome: clone(outcome) } } : {}) };
    nextRoot.lastResult = result;
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), initial))
      throw new Error('MVU data changed before save; retry from a fresh snapshot');
    await mvu.replaceMvuData(next, { type: 'message', message_id: anchor.messageId });
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), next))
      throw new Error('MVU save was not confirmed by readback');
    return result;
  } finally { inFlight.delete(key); }
}

function visibleSpecial(status, kind, operationId, visibility, mechanical, revision) {
  const base = { status, kind, operationId, visibility, revision };
  return visibility === 'secret' ? base : { ...base, success: mechanical.success,
    pendingNarrative: mechanical.pendingNarrative ?? null };
}

async function commitSpecial({ mvu, getAnchor, expectedChatId, operationId,
  expectedRevision, signature, opportunityKey, visibility, kind, resolve }) {
  const anchor = anchorOf(getAnchor);
  if (anchor.chatId !== expectedChatId) throw new Error('Refusing write outside the named test chat');
  if (typeof operationId !== 'string' || !operationId.trim() || !whole(expectedRevision))
    throw new Error('Nonempty operationId and expectedRevision required');
  if (!['public', 'secret'].includes(visibility)) throw new Error('Explicit visibility required');
  const key = operationKey(anchor);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial = read(mvu, anchor);
    const root = rootOf(initial, anchor.chatId);
    const existing = root.operations[operationId];
    if (existing) {
      if (existing.signature !== signature) throw new Error('Operation ID already used for different input');
      return { ...clone(existing.summary), status: 'already_applied' };
    }
    if (Object.values(root.operations).some(entry => entry.opportunityKey === opportunityKey))
      return { status: 'already_resolved', kind, visibility, operationId };
    if (root.revision !== expectedRevision) throw new Error('MVU state version conflict');
    const outcome = resolve(root);
    if (outcome.status !== 'resolved') return { status: outcome.status, reason: outcome.reason };
    const next = clone(initial);
    const nextRoot = next.stat_data[NAMESPACE];
    if (outcome.actorId) nextRoot.actors[outcome.actorId].state = outcome.state;
    nextRoot.revision++;
    const summary = visibleSpecial('applied', kind, operationId, visibility,
      outcome.mechanical, nextRoot.revision);
    nextRoot.operations[operationId] = { signature, opportunityKey, summary,
      mechanical: clone(outcome.mechanical) };
    nextRoot.lastResult = summary;
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), initial)) throw new Error('MVU data changed before save; retry from a fresh snapshot');
    await mvu.replaceMvuData(next, { type: 'message', message_id: anchor.messageId });
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), next)) throw new Error('MVU save was not confirmed by readback');
    return summary;
  } finally { inFlight.delete(key); }
}

export async function settleGeneticUnlock({ mvu, getAnchor, expectedChatId, operationId,
  expectedRevision, actorId, unlockInput, visibility = 'public' }) {
  if (typeof actorId !== 'string' || !actorId || !record(unlockInput))
    throw new Error('Genetic unlock actor and input required');
  if (visibility !== 'public')
    return { status: 'deferred', reason: 'Genetic D10 checks must be public' };
  if (unlockInput.stage === 2)
    return { status: 'deferred', reason: 'Second-stage resolution is pure math only; state consequences are not integrated' };
  const opportunityId = unlockInput.opportunity?.id;
  return commitSpecial({ mvu, getAnchor, expectedChatId, operationId, expectedRevision,
    signature: JSON.stringify({ actorId, unlockInput, visibility }),
    opportunityKey: `genetic:${actorId}:${opportunityId}`, visibility, kind: 'genetic_unlock',
    resolve(root) {
      const actor = actorOf(root, actorId);
      const outcome = resolveGeneticUnlock(actor.state, unlockInput);
      return outcome.status === 'resolved'
        ? { status: 'resolved', actorId, state: outcome.state, mechanical: outcome.result }
        : outcome;
    } });
}

export async function settleScriptedFortune({ mvu, getAnchor, expectedChatId, operationId,
  expectedRevision, spec, dice }) {
  if (spec?.visibility === 'secret' && spec.rollType !== 'phb_fortune')
    return { status: 'deferred', reason: 'Only adopted fortune rolls may be secret' };
  if (!record(spec) || typeof spec.sourceId !== 'string' || !spec.sourceId.trim() ||
      typeof spec.opportunityId !== 'string' || !spec.opportunityId.trim() ||
      !['public', 'secret'].includes(spec.visibility))
    return { status: 'deferred', reason: 'Source, opportunity, and visibility required' };
  const condition = spec.successCondition;
  if (!record(condition) || Object.keys(condition).some(key => key !== 'minimum') ||
      !Number.isInteger(condition.minimum) ||
      (spec.rollType === 'd10_threshold' && (condition.minimum < 1 || condition.minimum > 10)) ||
      (spec.rollType === 'phb_fortune' && condition.minimum < 1) ||
      !['d10_threshold', 'phb_fortune'].includes(spec.rollType))
    return { status: 'deferred', reason: 'Adopted roll type and complete success condition required' };
  return commitSpecial({ mvu, getAnchor, expectedChatId, operationId, expectedRevision,
    signature: JSON.stringify({ spec, dice }),
    opportunityKey: `scripted:${spec.sourceId}:${spec.opportunityId}`,
    visibility: spec.visibility, kind: 'scripted_fortune',
    resolve(root) {
      if (spec.resolved === true) return { status: 'already_resolved', reason: 'Opportunity already resolved' };
      if (spec.resolved !== false) return { status: 'needs_input', reason: 'Opportunity resolution state required' };
      if (spec.actorId !== undefined) actorOf(root, spec.actorId);
      if (!Array.isArray(dice) || !dice.length) throw new RangeError('A D10 result is required');
      let roll, success;
      if (spec.rollType === 'phb_fortune') {
        roll = rollPool(0, dice);
        success = roll.rolledSuccesses >= condition.minimum;
      } else {
        const die = dice[0];
        if (!Number.isInteger(die) || die < 1 || die > 10) throw new RangeError('D10 result must be 1–10');
        roll = { dice: [die], used: 1 };
        success = die >= condition.minimum;
      }
      return { status: 'resolved', mechanical: { sourceId: spec.sourceId,
        opportunityId: spec.opportunityId, actorId: spec.actorId ?? null,
        rollType: spec.rollType, successCondition: clone(condition), roll, success,
        pendingNarrative: null } };
    } });
}

// A trusted runtime supplies a concrete, source-backed template. GM JSON may
// select its ID but cannot write a numeric modifier into MVU directly.
export async function settleDirectEffect({ mvu, getAnchor, expectedChatId, operationId,
  expectedRevision, actorId, effect }) {
  const anchor = anchorOf(getAnchor);
  if (anchor.chatId !== expectedChatId) throw new Error('Refusing write outside the named test chat');
  if (typeof operationId !== 'string' || !operationId || !whole(expectedRevision) ||
      typeof actorId !== 'string' || !actorId || !record(effect) ||
      typeof effect.id !== 'string' || !effect.id || typeof effect.source !== 'string' || !effect.source ||
      typeof effect.label !== 'string' || !effect.label ||
      !ATTRIBUTES.includes(effect.attribute) || typeof effect.skill !== 'string' || !effect.skill ||
      !Number.isInteger(effect.value) || effect.value === 0 ||
      effect.duration !== 'nextMatchingCheck' || effect.visibility !== 'public')
    throw new Error('Trusted scoped direct effect required');
  const key = operationKey(anchor);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial = read(mvu, anchor);
    const root = rootOf(initial, anchor.chatId);
    const signature = JSON.stringify({ actorId, effect });
    if (root.operations[operationId]) {
      if (root.operations[operationId].signature !== signature)
        throw new Error('Operation ID already used for different input');
      return { ...clone(root.operations[operationId].summary), status: 'already_applied' };
    }
    if (root.revision !== expectedRevision) throw new Error('MVU state version conflict');
    const actor = actorOf(root, actorId);
    requireKnownSkill(actor.state, effect.skill, effect.sub);
    if (!actionEligibility(actor.state, 'free').allowed)
      throw new Error('Target actor is not eligible for this effect');
    if ((actor.state.checkEffects ?? []).some(item => item.id === effect.id || item.source === effect.source))
      throw new Error('Same source effect is already active');
    const next = clone(initial);
    const nextRoot = next.stat_data[NAMESPACE];
    nextRoot.actors[actorId].state.checkEffects ??= [];
    nextRoot.actors[actorId].state.checkEffects.push(clone(effect));
    nextRoot.revision++;
    const result = { status: 'applied', kind: 'direct_effect', operationId,
      revision: nextRoot.revision, actorId, effectId: effect.id,
      effectLabel: effect.label, source: effect.source, duration: effect.duration };
    nextRoot.operations[operationId] = { signature, summary: result };
    nextRoot.lastResult = result;
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), initial)) throw new Error('MVU data changed before save; retry from a fresh snapshot');
    await mvu.replaceMvuData(next, { type: 'message', message_id: anchor.messageId });
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), next)) throw new Error('MVU save was not confirmed by readback');
    return result;
  } finally { inFlight.delete(key); }
}

export function readTestActorState({ mvu, getAnchor, actorId }) {
  const anchor = anchorOf(getAnchor);
  const root = rootOf(read(mvu, anchor), anchor.chatId);
  return clone(actorOf(root, actorId).state);
}
export function readTestActorRecord({mvu,getAnchor,actorId}) {
  const anchor=anchorOf(getAnchor);return clone(actorOf(rootOf(read(mvu,anchor),anchor.chatId),actorId));
}

export async function settleAttack({ mvu, getAnchor, expectedChatId, operationId, expectedRevision,
  attackerId, targetId, attack }) {
  const anchor = anchorOf(getAnchor);
  if (anchor.chatId !== expectedChatId) throw new Error('Refusing write outside the named test chat');
  if (typeof operationId !== 'string' || !operationId.trim() || !whole(expectedRevision))
    throw new Error('Nonempty operationId and expectedRevision required');
  if (typeof attackerId !== 'string' || typeof targetId !== 'string' || attackerId === targetId)
    throw new Error('Distinct attacker and target actor IDs required');
  if (!record(attack) || !record(attack.weapon) || !Array.isArray(attack.dice) ||
      !Array.isArray(attack.defenses) || !Number.isInteger(attack.weapon.damage) ||
      attack.weapon.damage < 0 || !['B', 'L', 'A'].includes(attack.weapon.severity))
    throw new Error('Complete attack input, deterministic dice, and defenses required');
  const key = operationKey(anchor);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const initial = read(mvu, anchor);
    const root = rootOf(initial, anchor.chatId);
    const signature = JSON.stringify({ attackerId, targetId, attack });
    if (root.operations[operationId]) {
      if (root.operations[operationId].signature !== signature)
        throw new Error('Operation ID already used for different input');
      return { ...clone(root.operations[operationId].summary), status: 'already_applied' };
    }
    if (root.revision !== expectedRevision) throw new Error('MVU state version conflict');
    const attacker = actorOf(root, attackerId);
    const target = actorOf(root, targetId);
    const outcome = resolveAttack(attacker.state, target.state, attack);
    if (!outcome.result.allowed) throw new Error(`Attack rejected: ${outcome.result.reason}`);
    const next = clone(initial);
    const nextRoot = next.stat_data[NAMESPACE];
    nextRoot.actors[attackerId].state = outcome.attacker;
    nextRoot.actors[targetId].state = outcome.target;
    nextRoot.revision++;
    const result = summary(nextRoot, outcome, operationId, anchor);
    nextRoot.operations[operationId] = { signature, summary: result };
    nextRoot.lastResult = result;
    ensureAnchor(getAnchor, anchor);
    if (!same(read(mvu, anchor), initial)) throw new Error('MVU data changed before save; retry from a fresh snapshot');
    await mvu.replaceMvuData(next, { type: 'message', message_id: anchor.messageId });
    ensureAnchor(getAnchor, anchor);
    const saved = read(mvu, anchor);
    if (!same(saved, next))
      throw new Error('MVU save was not confirmed by readback');
    return result;
  } finally { inFlight.delete(key); }
}

export function readDebugState({ mvu, getAnchor }) {
  const anchor = anchorOf(getAnchor);
  const root = rootOf(read(mvu, anchor), anchor.chatId);
  const lines = Object.values(root.actors).map(actor => {
    const h = actor.state.health;
    const action = actor.state.turn;
    return `${actor.name}: ${h.intact} 完好 / ${h.B}B / ${h.L}L / ${h.A}A; ` +
      `动作 ${action.phase}, 标准 ${action.standard}, 移动 ${action.move}, 迅捷 ${action.swift}`;
  });
  if (root.lastResult) {
    const kind = root.lastResult.kind ??
      (Number.isInteger(root.lastResult.actualDamage) ? 'attack' : undefined);
    if (kind === 'check')
      lines.push(`检定 ${root.lastResult.operationId}: ${root.lastResult.total} 成功数，版本 ${root.revision}`);
    else if (kind === 'attack')
      lines.push(`结算 ${root.lastResult.operationId}: ${root.lastResult.actualDamage}` +
        `${root.lastResult.severity ?? ''}，版本 ${root.revision}`);
    else lines.push(`结算 ${root.lastResult.operationId}: ${kind}，版本 ${root.revision}`);
  }
  return lines.join('\n');
}

export function readTestSummary({ mvu, getAnchor }) {
  const anchor = anchorOf(getAnchor);
  const root = rootOf(read(mvu, anchor), anchor.chatId);
  return { revision: root.revision, messageId: anchor.messageId, swipeId: anchor.swipeId,
    ruleScene:clone(root.ruleScene??{}),
    actors: Object.fromEntries(Object.entries(root.actors).map(([id, actor]) =>
      [id, { name: actor.name, health: clone(actor.state.health),
        turn: clone(actor.state.turn) }])),
    lastResult: clone(root.lastResult ?? null) };
}

export function readTestOperation({ mvu, getAnchor, operationId }) {
  const anchor = anchorOf(getAnchor);
  const root = rootOf(read(mvu, anchor), anchor.chatId);
  return clone(root.operations[operationId] ?? null);
}

export function readTestOpportunity({ mvu, getAnchor, opportunityKey }) {
  const anchor = anchorOf(getAnchor);
  const root = rootOf(read(mvu, anchor), anchor.chatId);
  const entry = Object.values(root.operations).find(item => item.opportunityKey === opportunityKey);
  return entry ? clone(entry.summary) : null;
}

// Propagate a verified namespace snapshot to a later floor. An operation ID,
// when supplied, additionally requires that committed operation at the source.
// Only this namespace is copied; unrelated MVU data on the target is preserved.
export async function carryTestState({ mvu, getSourceAnchor, getAnchor,
  expectedChatId, operationId }) {
  const source = anchorOf(getSourceAnchor);
  const target = anchorOf(getAnchor);
  if (source.chatId !== expectedChatId || target.chatId !== expectedChatId ||
      target.messageId <= source.messageId)
    throw new Error('Source and final GM floor must belong to the named test chat');
  const key = operationKey(target);
  if (inFlight.has(key)) throw new Error('MVU operation already in progress');
  inFlight.add(key);
  try {
    const sourceData = read(mvu, source);
    const sourceRoot = rootOf(sourceData, expectedChatId);
    if (operationId !== undefined && !sourceRoot.operations[operationId])
      throw new Error('No saved source operation to carry');
    const initial = read(mvu, target);
    const existing = initial.stat_data?.[NAMESPACE];
    if (existing !== undefined) {
      const current = rootOf(initial, expectedChatId);
      if (same(current, sourceRoot)) return { status: 'already_synced', revision: current.revision };
      if (current.revision >= sourceRoot.revision)
        throw new Error('Final GM floor has a conflicting 901 state');
    }
    const next = clone(initial);
    next.stat_data ??= {};
    next.stat_data[NAMESPACE] = clone(sourceRoot);
    ensureAnchor(getSourceAnchor, source);
    ensureAnchor(getAnchor, target);
    if (!same(read(mvu, source), sourceData) || !same(read(mvu, target), initial))
      throw new Error('MVU data changed before final floor sync');
    await mvu.replaceMvuData(next, { type: 'message', message_id: target.messageId });
    ensureAnchor(getSourceAnchor, source);
    ensureAnchor(getAnchor, target);
    if (!same(read(mvu, target), next))
      throw new Error('MVU final floor sync was not confirmed by readback');
    return { status: 'carried', revision: sourceRoot.revision,
      messageId: target.messageId, swipeId: target.swipeId };
  } finally { inFlight.delete(key); }
}

// For a manually triggered script in an isolated SillyTavern chat.
export function tavernAnchor(messageId, tavern = globalThis.SillyTavern) {
  if (!tavern || !whole(messageId) || !tavern.chat?.[messageId])
    throw new Error('Current SillyTavern message unavailable');
  if (messageId !== tavern.chat.length - 1)
    throw new Error('Manual PoC writes only to the selected chat tip');
  const chatId = tavern.getCurrentChatId?.() || tavern.chatId;
  const swipeId = tavern.chat[messageId].swipe_id ?? 0;
  return { chatId, messageId, swipeId };
}
