import { ATTRIBUTES, resolveAttack } from '../core.mjs';
import { createTestRoot, NAMESPACE } from './fixture.mjs';

// This adapter owns only stat_data.901_rules_poc. No chat/global variable writes.
const inFlight = new Set();
const clone = value => structuredClone(value);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const whole = n => Number.isInteger(n) && n >= 0;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

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

export async function initializeTestState({ mvu, getAnchor, expectedChatId }) {
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
    next.stat_data[NAMESPACE] = createTestRoot(anchor.chatId);
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
  if (root.lastResult) lines.push(`结算 ${root.lastResult.operationId}: ${root.lastResult.actualDamage}` +
    `${root.lastResult.severity ?? ''}，版本 ${root.revision}`);
  return lines.join('\n');
}

// For a manually triggered script in an isolated SillyTavern chat.
export function tavernAnchor(messageId, tavern = globalThis.SillyTavern) {
  if (!tavern || !whole(messageId) || !tavern.chat?.[messageId])
    throw new Error('Current SillyTavern message unavailable');
  if (messageId !== tavern.chat.length - 1)
    throw new Error('Manual PoC writes only to the selected chat tip');
  const chatId = tavern.chatId || tavern.getCurrentChatId?.();
  const swipeId = tavern.chat[messageId].swipe_id ?? 0;
  return { chatId, messageId, swipeId };
}
