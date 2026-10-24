import { buildCharacter } from '../../character_builder/builder.mjs';
import { createResourceAdapter } from '../../resource_adapter/adapter.mjs';
import { createNpcDraftPipeline } from '../../npc_draft_pipeline/pipeline.mjs';
import { actionEligibility, beginTurn } from '../core.mjs';
import { settleNpcCheck } from './replay-check.mjs';
import { initializeTestState, readTestOperation, readTestSummary,
  settleAttack, settleCheck } from '../mvu_poc/adapter.mjs';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const copy = value => structuredClone(value);
const exactKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key));

export function parseGmDecision(text) {
  if (typeof text !== 'string' || !text.trim() || text.length > 2048)
    throw new Error('GM request must be a short JSON object');
  let value;
  try { value = JSON.parse(text.trim()); }
  catch { throw new Error('Invalid GM JSON request'); }
  if (!record(value) || typeof value.kind !== 'string')
    throw new Error('GM request kind required');
  if (value.kind === 'check' && value.actorId !== undefined) {
    if (!exactKeys(value, ['kind', 'actorId', 'sceneId', 'triggerId', 'attribute', 'skill',
      'sub', 'dc', 'modifierIds', 'effectChoice', 'opposed', 'consequence']))
      throw new Error('GM request contains fields not permitted for this kind');
    return value; // Full actor/scene validation belongs to the shared NPC path.
  }
  const fields = value.kind === 'no_rule' ? ['kind']
    : value.kind === 'check' ? ['kind', 'checkId', 'dc']
      : value.kind === 'attack' ? ['kind', 'weaponId', 'targetId'] : [];
  if (!fields.length) throw new Error('Unsupported GM request kind');
  if (!exactKeys(value, fields) || fields.some(key => !(key in value)))
    throw new Error('GM request contains fields not permitted for this kind');
  if (value.kind === 'check' &&
      (value.checkId !== 'watch_path' || !Number.isInteger(value.dc) || value.dc < 1 || value.dc > 4))
    throw new Error('Check requires supported scene check and GM DC 1–4');
  if (value.kind === 'attack' &&
      (value.weaponId !== 'demo.training-sword' || value.targetId !== 'npc'))
    throw new Error('Attack must name the configured demo weapon and target');
  return value;
}

function randomDice() {
  const dice = [];
  while (dice.length < 256) {
    const bytes = new Uint8Array(256);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) if (byte < 250 && dice.length < 256)
      dice.push(byte % 10 + 1);
  }
  return dice;
}

const playerDefinition = {
  id: 'gm-test-player', name: '测试玩家', period: 'isolated-runtime-demo',
  sources: ['work/rules_engine/gm_runtime/bridge.mjs: demo-only Builder definition'],
  size: 5,
  attributes: { 力量: 3, 敏捷: 3, 智力: 2, 感知: 3, 意志: 2, 风度: 2 },
  skills: { 运动: { level: 1 }, 求生: { level: 1 }, 洞察: { level: 2 },
    白刃: { level: 2, subs: { 长剑: { level: 1, scope: '演示训练剑',
      scopeId: 'demo.training-sword' } } } },
  equipment: [{ id: 'demo.training-sword', name: '演示训练剑', status: 'DEMO_ONLY',
    description: '仅隔离测试授权，伤害 2L 引用既有 Character Builder 普通攻击样本。' }],
};
const playerInitial = { health: 'healthy', willCurrent: 4, turn: 'ready' };
const demoWeapon = { type: 'melee', sub: '长剑', damage: 2, severity: 'L' };

function validateAuthorization(testAuthorization, npcId) {
  if (testAuthorization?.scope !== 'demo' ||
      typeof testAuthorization.source !== 'string' || !testAuthorization.source.trim() ||
      !Array.isArray(testAuthorization.actorIds) ||
      !['gm-test-player', npcId].every(id => testAuthorization.actorIds.includes(id)))
    throw new Error('Explicit demo-only test authorization for both actors required');
}

function sameReplay(decision, signature) {
  const original = JSON.parse(signature);
  if (decision.kind === 'check') return original.actorId === 'player' &&
    original.checkInput?.attribute === '感知' && original.checkInput?.skill === '洞察' &&
    original.checkInput?.dc === decision.dc;
  return original.attackerId === 'player' && original.targetId === decision.targetId &&
    JSON.stringify(original.attack?.weapon) === JSON.stringify(demoWeapon);
}

export function createDemoRuntime({ mvu, getAnchor, expectedChatId, catalog,
  npcBlueprint, npcCandidate, testAuthorization, drawDice = randomDice, npcContext } = {}) {
  if (!Array.isArray(catalog) || !record(npcBlueprint) || !record(npcCandidate) ||
      typeof drawDice !== 'function') throw new Error('Trusted runtime inputs required');
  validateAuthorization(testAuthorization, npcBlueprint.identity?.id);
  const adapter = createResourceAdapter(catalog, { mode: 'production' });
  const npcDraft = createNpcDraftPipeline({ adapter }).evaluate({
    mode: 'new_character_proposal', blueprint: npcBlueprint, candidate: npcCandidate });
  if (!npcDraft.ok || npcDraft.approved || npcDraft.formalDefinition !== null)
    throw new Error(`NPC draft cannot enter demo: ${JSON.stringify(npcDraft.report)}`);
  const player = buildCharacter(playerDefinition, playerInitial);
  if (!player.ok) throw new Error(`Player Builder input invalid: ${JSON.stringify(player.report)}`);
  const actors = {
    player: { name: playerDefinition.name, state: beginTurn(player.state).state },
    npc: { name: npcBlueprint.identity.name, state: beginTurn(npcDraft.previewState).state },
  };
  for (const actor of Object.values(actors))
    if (!actionEligibility(actor.state, 'attack').allowed || actor.state.turn.standard !== 1)
      throw new Error('Both test actors must be able to act');
  const options = { mvu, getAnchor, expectedChatId };
  return {
    npcDraft,
    initialize: () => initializeTestState({ ...options, actors }),
    read: () => readTestSummary(options),
    async dispatch({ gmText, playerIntent, operationId } = {}) {
      const decision = parseGmDecision(gmText);
      if (decision.kind === 'no_rule') return { status: 'no_rule', kind: 'no_rule' };
      if (typeof operationId !== 'string' || !operationId.trim())
        throw new Error('Trusted operation ID required');
      if (decision.kind === 'check' && decision.actorId !== undefined)
        return settleNpcCheck({ ...options, operationId, request: decision, npcContext, drawDice });
      if (!record(playerIntent) || playerIntent.actorId !== 'player' ||
          (decision.kind === 'check' && playerIntent.kind !== 'observe') ||
          (decision.kind === 'attack' &&
            (playerIntent.kind !== 'attack' || playerIntent.targetId !== decision.targetId)))
        throw new Error('GM request does not match explicit player intent');
      const existing = readTestOperation({ ...options, operationId });
      if (existing) {
        if (!sameReplay(decision, existing.signature))
          throw new Error('Operation ID already used for different input');
        return { ...copy(existing.summary), status: 'already_applied' };
      }
      const expectedRevision = readTestSummary(options).revision;
      const dice = drawDice();
      if (!Array.isArray(dice)) throw new Error('Trusted dice source must return an array');
      if (decision.kind === 'check') return settleCheck({ ...options, operationId,
        expectedRevision, actorId: 'player',
        checkInput: { attribute: '感知', skill: '洞察', dc: decision.dc, dice } });
      return settleAttack({ ...options, operationId, expectedRevision,
        attackerId: 'player', targetId: decision.targetId,
        attack: { weapon: copy(demoWeapon), defenses: [], dice } });
    },
    narrationFacts(result, extra = {}) {
      if (!record(result) || !record(extra) || !exactKeys(extra, ['sceneText']))
        throw new Error('GM may not change JS result fields');
      if (result.actorType === 'npc') return { status: result.status, kind: 'check',
        actorType: 'npc', success: result.success, consequences: result.consequences,
        ...(extra.sceneText ? { sceneText: extra.sceneText } : {}) };
      return { operationId: result.operationId, status: result.status,
        ...(result.kind === 'check' ? { kind: 'check', total: result.total,
          dc: result.dc, success: result.success }
          : { kind: 'attack', actualDamage: result.actualDamage,
            severity: result.severity, targetHealth: copy(result.targetHealth) }),
        ...(extra.sceneText ? { sceneText: extra.sceneText } : {}) };
    },
  };
}
