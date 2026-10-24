import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NAMESPACE } from '../mvu_poc/fixture.mjs';

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const blueprint = readJson('../../npc_draft_pipeline/new_patrol.blueprint.json');
const candidate = readJson('../../npc_draft_pipeline/new_patrol.candidate.json');
const catalog = readJson('../../resource_adapter/resources.json');

// Existing mechanically complete candidate, authorized for tests only; no Canon adoption.
const npcContext = { sceneId: 'test-only/patrol', triggerId: 'test-only/search',
  actorIds: ['npc'], protagonistInvolved: true, reason: 'Test NPC searches a trace beside the player',
  modifiers: { light: { value: 1, source: 'test-only/private-light', actorIds: ['npc'],
    attribute: '感知', skill: '洞察' } } };
const npcRequest = { kind: 'check', actorId: 'npc', sceneId: npcContext.sceneId,
  triggerId: npcContext.triggerId, attribute: '感知', skill: '洞察', dc: 2, modifierIds: ['light'] };
async function npcHarness() {
  const { createDemoRuntime } = await import('./bridge.mjs');
  const h = harness();
  let draws = 0;
  const runtime = createDemoRuntime({ mvu: h.mvu, getAnchor: h.getAnchor,
    expectedChatId: 'gm-isolated-chat', catalog, npcBlueprint: blueprint, npcCandidate: candidate,
    npcContext, testAuthorization: { scope: 'demo', source: 'test-only NPC integration',
      actorIds: ['gm-test-player', blueprint.identity.id] },
    drawDice: () => { draws++; return Array(256).fill(8); } });
  await runtime.initialize();
  return { ...h, runtime, draws: () => draws,
    dispatch: request => runtime.dispatch({ gmText: JSON.stringify(request),
      operationId: `gm-runtime/gm-isolated-chat/${h.getAnchor().messageId}/${h.getAnchor().swipeId}` }) };
}

test('NPC uses trusted values and sourced modifiers; narration recovery preserves private records', async () => {
  const { runGuardedTurn, playerFacingResult, compactNarrationFacts, savedDecisionForRecovery } =
    await import('./adjudication-gate.mjs');
  const h = await npcHarness();
  const before = h.read().stat_data[NAMESPACE].actors;
  const player = { ...h.getAnchor(), text: 'Test player remains present while NPC searches' };
  const args = { player, classify: async () => ({ status: 'CHECK_REQUIRED', reason: 'test uncertainty', request: npcRequest }),
    settle: ({ request }) => h.dispatch(request), narrate: async () => { throw Error('test narration failure'); },
    post: async () => { throw Error('must not post before narration'); } };
  await assert.rejects(runGuardedTurn(args), /test narration failure/);
  const root = h.read().stat_data[NAMESPACE];
  const op = root.operations['gm-runtime/gm-isolated-chat/2/0'];
  assert.equal(op.summary.dp, 6); // Trusted perception 3 + insight 2 + sourced light 1.
  assert.equal(op.mechanical.attribute.effective, 3);
  assert.equal(op.mechanical.skill.main, 2);
  assert.equal(op.mechanical.modifiers[0].source, 'test-only/private-light');
  assert.deepEqual(op.mechanical.outcome.dice, Array(6).fill(8));
  assert.deepEqual(root.actors, before);
  const saved = h.read();
  const recovered = savedDecisionForRecovery(null, op);
  assert.deepEqual(recovered.request, npcRequest);
  let posted;
  const outcome = await runGuardedTurn({ ...args, classify: async () => recovered,
    narrate: async (_context, result) => {
      assert.equal(result.success, true);
      assert.deepEqual(playerFacingResult(result), {});
      assert.match(compactNarrationFacts(result), /NPC行动检定：成功/);
      assert.equal(JSON.stringify(result).includes('private-light'), false);
      for (const key of ['dp', 'dice', 'total', 'dc', 'rolledSuccesses', 'modifiers', 'mechanical'])
        assert.equal(key in result, false);
      return '测试NPC查看痕迹后指出了行进方向。';
    }, post: async (text, meta) => { posted = { text, meta }; } });
  assert.equal(outcome.status, 'APPLIED');
  assert.deepEqual(posted.meta.result, {});
  assert.equal(h.draws(), 1);
  assert.deepEqual(h.read(), saved);
  assert.equal(h.runtime.narrationFacts(outcome.result).success, true);
});

test('NPC applicable subskill uses trusted state; unrelated or missing data never rolls', async () => {
  const h = await npcHarness();
  const request = { ...npcRequest, attribute: '力量', skill: '白刃', sub: '长剑', modifierIds: [] };
  await h.dispatch(request);
  assert.equal(h.read().stat_data[NAMESPACE].operations['gm-runtime/gm-isolated-chat/2/0'].summary.dp, 5);
  h.setAnchor({ ...h.getAnchor(), messageId: 3 });
  const { sub, ...mainOnly } = request;
  await h.dispatch(mainOnly);
  assert.equal(h.read().stat_data[NAMESPACE].operations['gm-runtime/gm-isolated-chat/3/0'].summary.dp, 4);
  h.setAnchor({ ...h.getAnchor(), messageId: 4 });
  const before = h.read();
  for (const invalid of [{ ...request, sub: '死灵学' }, { ...request, actorId: 'missing' },
    { ...request, actorId: 'player' }, { ...request, triggerId: 'unjustified' },
    { ...npcRequest, modifierIds: ['invented'] }])
    assert.equal((await h.dispatch(invalid)).status, 'needs_input');
  await assert.rejects(h.dispatch({ ...request, attributes: { 力量: 99 } }), /not permitted/);
  assert.equal((await h.dispatch({ ...request, consequence: { damage: 2 } })).status, 'deferred');
  const corrupt = h.read();
  delete corrupt.stat_data[NAMESPACE].actors.npc.state.attributes.力量;
  await h.mvu.replaceMvuData(corrupt);
  assert.equal((await h.dispatch(request)).status, 'needs_input');
  assert.equal(h.draws(), 2);
  assert.equal(h.read().stat_data[NAMESPACE].revision, before.stat_data[NAMESPACE].revision);
});

test('NPC/player opposition math exists; paired runtime commit is deferred without taking player decisions', async () => {
  const { oppose } = await import('../core.mjs');
  const { playerFacingResult } = await import('./adjudication-gate.mjs');
  const h = await npcHarness();
  const actors = h.read().stat_data[NAMESPACE].actors;
  const math = oppose(actors.npc.state, actors.player.state,
    { attribute: '感知', skill: '洞察', dice: Array(5).fill(8) },
    { attribute: '感知', skill: '洞察', dice: Array(5).fill(1) });
  assert.equal(math.success, true);
  assert.deepEqual(playerFacingResult({ actorType: 'npc', ...math }), {});
  const before = h.read();
  assert.equal((await h.dispatch({ ...npcRequest, opposed: { actorId: 'player' } })).status, 'deferred');
  assert.equal(h.draws(), 0);
  assert.deepEqual(h.read(), before);
});

test('unresolved NPC request does not publish private request or adjudication reason in chat metadata', async () => {
  const { runGuardedTurn } = await import('./adjudication-gate.mjs');
  const h = await npcHarness();
  let meta;
  await runGuardedTurn({ player: { ...h.getAnchor(), text: 'test-only NPC scene' },
    classify: async () => ({ status: 'CHECK_REQUIRED', reason: 'private DC 9 and hidden modifier',
      request: { ...npcRequest, dc: 9, consequence: { damage: 9 } } }),
    settle: ({ request }) => h.dispatch(request),
    narrate: async () => { throw Error('Unsupported result must not narrate'); },
    post: async (_text, value) => { meta = value; } });
  assert.equal(meta.status, 'UNRESOLVED');
  assert.equal(meta.pending.request, null);
  assert.equal(JSON.stringify(meta).includes('private DC'), false);
  assert.equal(JSON.stringify(meta).includes('damage'), false);
  assert.equal(h.draws(), 0);
});

function harness() {
  let data = { stat_data: { unrelated: { value: 9 } } };
  let anchor = { chatId: 'gm-isolated-chat', messageId: 2, swipeId: 0 };
  const mvu = {
    getMvuData: () => structuredClone(data),
    replaceMvuData: async value => { data = structuredClone(value); },
  };
  return { mvu, getAnchor: () => ({ ...anchor }), read: () => structuredClone(data),
    setAnchor: value => { anchor = value; } };
}

test('GM request parser rejects numeric authority and accepts explicit no-rule decision', async () => {
  const { parseGmDecision } = await import('./bridge.mjs');
  assert.deepEqual(parseGmDecision('{"kind":"no_rule"}'), { kind: 'no_rule' });
  assert.deepEqual(parseGmDecision('{"kind":"check","checkId":"watch_path","dc":1}'),
    { kind: 'check', checkId: 'watch_path', dc: 1 });
  assert.throws(() => parseGmDecision('{"kind":"attack","weaponId":"demo.sword","targetId":"npc","dice":[10]}'), /not permitted/);
  assert.throws(() => parseGmDecision('{"kind":"check","checkId":"watch_path","dc":1,"xp":99}'), /not permitted/);
  assert.throws(() => parseGmDecision('some prose {"kind":"no_rule"}'), /JSON/);
});

test('authorized demo actors, GM check and ordinary attack use one MVU state and deduplicate', async () => {
  const { createDemoRuntime } = await import('./bridge.mjs');
  const h = harness();
  const runtime = createDemoRuntime({ mvu: h.mvu, getAnchor: h.getAnchor,
    expectedChatId: 'gm-isolated-chat', catalog, npcBlueprint: blueprint, npcCandidate: candidate,
    testAuthorization: { scope: 'demo', source: 'explicit isolated test',
      actorIds: ['gm-test-player', blueprint.identity.id] },
    drawDice: () => [8, 9, 2, 5, 1, 3, 4, 6, 1, 1, 1, 1, 1, 1, 1, 1] });
  await runtime.initialize();
  const start = h.read();
  assert.equal(start.stat_data.unrelated.value, 9);
  assert.equal(start.stat_data[NAMESPACE].actors.player.state.turn.standard, 1);
  assert.equal(start.stat_data[NAMESPACE].actors.npc.state.turn.standard, 1);
  assert.equal(runtime.npcDraft.approved, false);

  const passive = await runtime.dispatch({ gmText: '{"kind":"no_rule"}',
    playerIntent: { kind: 'observe', actorId: 'player' }, operationId: 'none-1' });
  assert.equal(passive.status, 'no_rule');
  assert.equal(h.read().stat_data[NAMESPACE].revision, 0);
  await assert.rejects(runtime.dispatch({ gmText: '{"kind":"check","checkId":"watch_path","dc":1,"damage":7}',
    playerIntent: { kind: 'observe', actorId: 'player' }, operationId: 'bad-1' }), /not permitted/);
  assert.deepEqual(h.read(), start);

  const check = await runtime.dispatch({ gmText: '{"kind":"check","checkId":"watch_path","dc":1}',
    playerIntent: { kind: 'observe', actorId: 'player' }, operationId: 'check-1' });
  assert.equal(check.status, 'applied');
  assert.equal(check.success, true);
  assert.equal(h.read().stat_data[NAMESPACE].revision, 1);
  assert.equal(h.read().stat_data[NAMESPACE].actors.player.state.turn.standard, 1);

  const attackInput = { gmText: '{"kind":"attack","weaponId":"demo.training-sword","targetId":"npc"}',
    playerIntent: { kind: 'attack', actorId: 'player', targetId: 'npc' }, operationId: 'attack-1' };
  const attack = await runtime.dispatch(attackInput);
  assert.equal(attack.status, 'applied');
  assert(attack.actualDamage > 0);
  const saved = h.read();
  assert.equal(saved.stat_data[NAMESPACE].revision, 2);
  assert.equal(saved.stat_data[NAMESPACE].actors.player.state.turn.standard, 0);
  assert.equal(saved.stat_data[NAMESPACE].actors.npc.state.health.L, attack.actualDamage);
  assert.equal(saved.stat_data.unrelated.value, 9);
  const repeat = await runtime.dispatch(attackInput);
  assert.equal(repeat.status, 'already_applied');
  assert.deepEqual(h.read(), saved);
  assert.throws(() => runtime.narrationFacts(attack, { actualDamage: 999 }), /GM may not change/);
});

test('wrong voluntary action and missing test authorization cannot enter MVU', async () => {
  const { createDemoRuntime } = await import('./bridge.mjs');
  const h = harness();
  const base = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'gm-isolated-chat',
    catalog, npcBlueprint: blueprint, npcCandidate: candidate, drawDice: () => [8, 9, 2, 5, 1, 3] };
  assert.throws(() => createDemoRuntime(base), /test authorization/);
  const runtime = createDemoRuntime({ ...base, testAuthorization: { scope: 'demo',
    source: 'explicit isolated test', actorIds: ['gm-test-player', blueprint.identity.id] } });
  await runtime.initialize();
  const before = h.read();
  await assert.rejects(runtime.dispatch({ gmText: '{"kind":"attack","weaponId":"demo.training-sword","targetId":"npc"}',
    playerIntent: { kind: 'observe', actorId: 'player' }, operationId: 'x' }), /player intent/);
  assert.deepEqual(h.read(), before);
});
