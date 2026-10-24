import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestRoot, DEMO_ATTACK, NAMESPACE } from './fixture.mjs';
import { initializeTestState, settleAttack, settleCheck, readDebugState, carryTestState,
  settleGeneticUnlock, settleScriptedFortune, requiresEffectChoice, settleRecovery } from './adapter.mjs';

test('recovery commits inventory, effects and carry once; retry never reruns reducer', async () => {
  const h = harness(), opts = { mvu:h.mvu,getAnchor:h.getAnchor,expectedChatId:'isolated-test-chat',actorId:'attacker' };
  await initializeTestState(opts);
  let calls=0;
  const command={type:'medicine',medicine:'药A'};
  const reduce=actor=>{calls++;actor.state.inventory=[{name:'药A',quantity:1}];
    actor.state.pendingRecoveryEffects=[{medicine:'药A'}];actor.durationCarry={flow:7};
    return {actor,result:{kind:'recovery',type:'medicine',medicine:'药A',changes:[],pending:actor.state.pendingRecoveryEffects}};};
  const first=await settleRecovery({...opts,operationId:'recover/1',expectedRevision:0,command,reduce,playerAuthorized:true});
  const retry=await settleRecovery({...opts,operationId:'recover/1',expectedRevision:0,command,reduce,playerAuthorized:true});
  assert.equal(first.kind,'recovery');assert.equal(retry.status,'already_applied');assert.equal(calls,1);
  const root=h.floors.get(h.key()).stat_data[NAMESPACE];
  assert.equal(root.revision,1);assert.equal(root.actors.attacker.state.inventory[0].quantity,1);
  assert.deepEqual(root.actors.attacker.combatCarry.durationCarry,{flow:7});
  assert.equal(root.actors.attacker.state.pendingRecoveryEffects.length,1);
  await assert.rejects(settleRecovery({...opts,operationId:'recover/2',expectedRevision:0,command,reduce,playerAuthorized:true}),/version conflict/);
  await assert.rejects(settleRecovery({...opts,operationId:'recover/3',expectedRevision:1,command,reduce}),/declaration/);
});

function harness() {
  const floors = new Map();
  let anchor = { chatId: 'isolated-test-chat', messageId: 2, swipeId: 0 };
  let failSave = false;
  let dropSave = false;
  const key = () => `${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`;
  const mvu = {
    getMvuData(options) {
      assert.deepEqual(options, { type: 'message', message_id: anchor.messageId });
      return structuredClone(floors.get(key()) ?? { initialized_lorebooks: {}, stat_data: { untouched: { value: 7 } } });
    },
    async replaceMvuData(data, options) {
      assert.deepEqual(options, { type: 'message', message_id: anchor.messageId });
      if (failSave) throw new Error('save failed');
      if (!dropSave) floors.set(key(), structuredClone(data));
    },
  };
  return { floors, mvu, getAnchor: () => ({ ...anchor }),
    setAnchor: value => { anchor = value; }, setFailSave: value => { failSave = value; },
    setDropSave: value => { dropSave = value; }, key };
}

test('carry initialized state without an operation across empty host floors', async () => {
  const floors = [{ stat_data: { keep: 'source' } }, { stat_data: { keep: 'target' } }];
  const mvu = { getMvuData: ({ message_id }) => structuredClone(floors[message_id]),
    replaceMvuData: async (data, { message_id }) => { floors[message_id] = structuredClone(data); } };
  const anchor = messageId => ({ chatId: 'host-test', messageId, swipeId: 0 });
  await initializeTestState({ mvu, expectedChatId: 'host-test', getAnchor: () => anchor(0) });
  const args = { mvu, expectedChatId: 'host-test', getSourceAnchor: () => anchor(0), getAnchor: () => anchor(1) };
  await carryTestState(args);
  assert.deepEqual(floors[1].stat_data[NAMESPACE], floors[0].stat_data[NAMESPACE]);
  assert.equal(floors[1].stat_data.keep, 'target');
  assert.equal(floors[1].stat_data[NAMESPACE].revision, 0);
  assert.deepEqual(floors[1].stat_data[NAMESPACE].operations, {});
  assert.equal((await carryTestState(args)).status, 'already_synced');
  await assert.rejects(carryTestState({ ...args, operationId: 'missing' }), /No saved source/);
});

test('initialization and attack use core output, preserve unrelated data, and deduplicate', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  await initializeTestState(options);
  const first = await settleAttack({ ...options, operationId: 'attack-001', expectedRevision: 0, ...DEMO_ATTACK });
  assert.equal(first.status, 'applied');
  assert.deepEqual([first.dp, first.rolledSuccesses, first.attackSuccesses, first.cap, first.actualDamage], [12, 3, 5, 16, 3]);
  const saved = h.floors.get(h.key());
  assert.equal(saved.stat_data.untouched.value, 7);
  assert.equal(saved.stat_data[NAMESPACE].revision, 1);
  assert.deepEqual(saved.stat_data[NAMESPACE].actors.target.state.health,
    { intact: 6, B: 0, L: 3, A: 0, temp: 0, coma: false, deteriorationStopped: false });
  assert.equal(saved.stat_data[NAMESPACE].actors.attacker.state.turn.standard, 0);
  const second = await settleAttack({ ...options, operationId: 'attack-001', expectedRevision: 0, ...DEMO_ATTACK });
  assert.equal(second.status, 'already_applied');
  await assert.rejects(settleAttack({ ...options, operationId: 'attack-001', expectedRevision: 0,
    ...DEMO_ATTACK, attack: { ...DEMO_ATTACK.attack, dice: Array(12).fill(1) } }), /different input/);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
  assert.match(readDebugState(options), /6 完好 \/ 0B \/ 3L \/ 0A/);
  assert.match(readDebugState(options), /结算 attack-001: 3L，版本 1/);
});

test('reject missing state, version conflict, and failed save without reporting success', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  await assert.rejects(settleAttack({ ...options, operationId: 'x', expectedRevision: 0, ...DEMO_ATTACK }), /not initialized/);
  await initializeTestState(options);
  await assert.rejects(settleAttack({ ...options, expectedChatId: 'wrong-chat',
    operationId: 'x', expectedRevision: 0, ...DEMO_ATTACK }), /named test chat/);
  await assert.rejects(settleAttack({ ...options, operationId: 'x', expectedRevision: 1, ...DEMO_ATTACK }), /version conflict/);
  await assert.rejects(settleAttack({ ...options, operationId: 'x', expectedRevision: 0,
    attackerId: 'missing', targetId: 'target', attack: DEMO_ATTACK.attack }), /actor/);
  await assert.rejects(settleAttack({ ...options, operationId: 'x', expectedRevision: 0,
    attackerId: 'target', targetId: 'target', attack: DEMO_ATTACK.attack }), /Distinct/);
  h.setFailSave(true);
  await assert.rejects(settleAttack({ ...options, operationId: 'x', expectedRevision: 0, ...DEMO_ATTACK }), /save failed/);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 0);
  h.setFailSave(false);
  h.setDropSave(true);
  await assert.rejects(settleAttack({ ...options, operationId: 'x', expectedRevision: 0, ...DEMO_ATTACK }), /not confirmed/);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 0);
});

test('a copied next floor inherits state, while different swipe keeps its own copy in the mock', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  await initializeTestState(options);
  const old = structuredClone(h.floors.get(h.key()));
  await settleAttack({ ...options, operationId: 'attack-001', expectedRevision: 0, ...DEMO_ATTACK });
  const after = structuredClone(h.floors.get(h.key()));
  h.setAnchor({ chatId: 'isolated-test-chat', messageId: 2, swipeId: 1 });
  h.floors.set(h.key(), old);
  assert.equal(h.mvu.getMvuData({ type: 'message', message_id: 2 }).stat_data[NAMESPACE].revision, 0);
  h.setAnchor({ chatId: 'isolated-test-chat', messageId: 3, swipeId: 0 });
  h.floors.set(h.key(), after);
  assert.equal(h.mvu.getMvuData({ type: 'message', message_id: 3 }).stat_data[NAMESPACE].revision, 1);
});

test('a Builder state can be initialized and a check is saved once without changing the actor', async () => {
  const { settleCheck } = await import('./adapter.mjs');
  const { buildCharacter } = await import('../../character_builder/builder.mjs');
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  const built = buildCharacter({ id: 'player', name: '测试玩家', period: 'demo', sources: ['demo'],
    size: 5, attributes: { 力量: 2, 敏捷: 2, 智力: 2, 感知: 3, 意志: 2, 风度: 2 },
    skills: { 运动: { level: 1 }, 求生: { level: 1 }, 洞察: { level: 2 } } },
  { health: 'healthy', willCurrent: 4, turn: 'ready' });
  assert.equal(built.ok, true);
  await initializeTestState({ ...options, actors: { player: { name: '测试玩家', state: built.state } } });
  const before = structuredClone(h.floors.get(h.key()).stat_data[NAMESPACE].actors.player.state);
  const request = { ...options, operationId: 'check-001', expectedRevision: 0,
    actorId: 'player', checkInput: { attribute: '感知', skill: '洞察', dc: 1, dice: [8, 9, 2, 5, 1] } };
  const first = await settleCheck(request);
  assert.deepEqual([first.status, first.dp, first.total, first.success], ['applied', 5, 2, true]);
  assert.deepEqual(h.floors.get(h.key()).stat_data[NAMESPACE].actors.player.state, before);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
  const repeated = await settleCheck(request);
  assert.equal(repeated.status, 'already_applied');
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
  await assert.rejects(settleCheck({ ...request, operationId: 'check-002', expectedRevision: 1,
    checkInput: { ...request.checkInput, skill: '未记录技能' } }), /unknown main skill/);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
});

test('committed genetic unlock increments trusted history once and recovery does not reroll', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  const root = createTestRoot('isolated-test-chat');
  root.actors.attacker.state.geneticLock = { successfulUnlocks: { 1: 0 }, highestStage: 0, activeStage: 0 };
  await initializeTestState({ ...options, actors: root.actors });
  const input = { ...options, operationId: 'unlock-1', expectedRevision: 0, actorId: 'attacker', visibility: 'public',
    unlockInput: { stage: 1, opportunity: { id: 'crisis-1', source: 'scene-1', kind: 'qualifying_crisis' },
      dice: [10] } };
  h.setFailSave(true);
  await assert.rejects(settleGeneticUnlock(input), /save failed/);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].actors.attacker.state.geneticLock.successfulUnlocks[1], 0);
  h.setFailSave(false);
  const first = await settleGeneticUnlock(input);
  const again = await settleGeneticUnlock(input);
  assert.equal(first.success, true);
  assert.equal(again.status, 'already_applied');
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].actors.attacker.state.geneticLock.successfulUnlocks[1], 1);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
  assert.equal((await settleGeneticUnlock({ ...input, operationId: 'unlock-2', expectedRevision: 1 })).status,
    'already_resolved');
});

test('genetic unlock defaults public, rejects secret, and failure preserves history', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  const root = createTestRoot('isolated-test-chat');
  root.actors.attacker.state.geneticLock = { successfulUnlocks: { 1: 0 }, highestStage: 0, activeStage: 0 };
  await initializeTestState({ ...options, actors: root.actors });
  const input = { ...options, operationId: 'public-unlock', expectedRevision: 0,
    actorId: 'attacker', unlockInput: { stage: 1,
      opportunity: { id: 'crisis', source: 'scene', kind: 'qualifying_crisis' }, dice: [9] } };
  for (const stage of [1, 2]) {
    assert.equal((await settleGeneticUnlock({ ...input, visibility: 'secret',
      unlockInput: { ...input.unlockInput, stage } })).status, 'deferred');
    assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 0);
  }
  const result = await settleGeneticUnlock(input);
  assert.equal(result.status, 'applied');
  assert.equal(result.visibility, 'public');
  assert.equal(result.success, false);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].actors.attacker.state.geneticLock.successfulUnlocks[1], 0);
});

test('scripted secret opportunities need explicit rules and cannot reroll across operation IDs', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  await initializeTestState(options);
  const spec = { sourceId: 'adopted-scene-rule', opportunityId: 'window-1', actorId: 'attacker',
    visibility: 'secret', rollType: 'phb_fortune', successCondition: { minimum: 1 }, resolved: false };
  const nonFortune = await settleScriptedFortune({ ...options, operationId: 'not-fortune', expectedRevision: 0,
    spec: { ...spec, rollType: 'd10_threshold' }, dice: [10] });
  assert.equal(nonFortune.status, 'deferred');
  const missing = await settleScriptedFortune({ ...options, operationId: 'missing', expectedRevision: 0,
    spec: { ...spec, successCondition: undefined }, dice: [10] });
  assert.equal(missing.status, 'deferred');
  const ambiguous = await settleScriptedFortune({ ...options, operationId: 'ambiguous', expectedRevision: 0,
    spec: { ...spec, successCondition: { minimum: 8, extraChance: 0.5 } }, dice: [10] });
  assert.equal(ambiguous.status, 'deferred');
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 0);
  const first = await settleScriptedFortune({ ...options, operationId: 'event-1', expectedRevision: 0, spec, dice: [10, 8] });
  assert.equal(first.status, 'applied');
  assert.equal('success' in first, false);
  const second = await settleScriptedFortune({ ...options, operationId: 'event-2', expectedRevision: 1, spec, dice: [1] });
  assert.equal(second.status, 'already_resolved');
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
  const fortune = await settleScriptedFortune({ ...options, operationId: 'event-3', expectedRevision: 1,
    spec: { ...spec, opportunityId: 'window-2', visibility: 'public', rollType: 'phb_fortune',
      successCondition: { minimum: 2 } }, dice: [10, 8] });
  assert.equal(fortune.success, true);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 2);
  const publicD10 = await settleScriptedFortune({ ...options, operationId: 'event-4', expectedRevision: 2,
    spec: { ...spec, opportunityId: 'window-3', visibility: 'public', rollType: 'd10_threshold',
      successCondition: { minimum: 8 } }, dice: [8] });
  assert.equal(publicD10.success, true);
  assert.equal(publicD10.visibility, 'public');
});

test('non-demo environment and roleplay awards stay automatic even if marked player-activated', async () => {
  for (const category of ['environment', 'roleplay']) {
    const h = harness();
    const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
    const effect = { id: `test-only.${category}-award`, source: `test-only/${category}`,
      label: `TEST ONLY ${category}`, category, activation: 'player',
      attribute: '力量', skill: '白刃', value: 1, duration: 'nextMatchingCheck', visibility: 'public' };
    assert.equal(requiresEffectChoice(effect), false); // Same policy used to construct the panel.
    const root = createTestRoot('isolated-test-chat');
    root.actors.attacker.state.checkEffects = [effect];
    await initializeTestState({ ...options, actors: root.actors });
    const input = { ...options, operationId: 'automatic-award', expectedRevision: 0,
      actorId: 'attacker', trustedEffects: { [effect.id]: effect },
      checkInput: { attribute: '力量', skill: '白刃', modifier: -11, dc: 1, dice: [8] } };
    await assert.rejects(settleCheck({ ...input, checkInput: { ...input.checkInput, effectChoice: 'skip' } }),
      /No active effect/);
    assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 0);
    const result = await settleCheck(input);
    assert.equal(result.dp, 1);
    assert.equal(result.fortune, false);
    assert.equal((await settleCheck(input)).status, 'already_applied');
    assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].revision, 1);
  }
});

test('active marker alone cannot authorize a panel choice or settlement', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  const effect = { id: 'test-only.unsourced-active', source: 'test-only/invalid', label: 'TEST ONLY',
    activation: 'player', category: 'ability', attribute: '力量', skill: '白刃',
    value: 1, duration: 'nextMatchingCheck', visibility: 'public' };
  for (const activeUse of [undefined, { adopted: true, ruleSource: 'test-only/rule' },
    { adopted: false, ruleSource: 'test-only/rule', condition: 'before check' }]) {
    assert.throws(() => requiresEffectChoice({ ...effect, activeUse }), /adopted rule/);
  }
  const use = { adopted: true, ruleSource: 'test-only/rule' };
  assert.equal(requiresEffectChoice({ ...effect, activeUse: { ...use, cost: { kind: 'consumeEffect' } } }), true);
  assert.throws(() => requiresEffectChoice({ ...effect,
    activeUse: { ...use, cost: { kind: 'willpower', amount: 1 } } }), /not supported/);
  const root = createTestRoot('isolated-test-chat');
  root.actors.attacker.state.checkEffects = [effect];
  await initializeTestState({ ...options, actors: root.actors });
  const before = structuredClone(h.floors.get(h.key()));
  await assert.rejects(settleCheck({ ...options, operationId: 'invalid-active', expectedRevision: 0,
    actorId: 'attacker', trustedEffects: { [effect.id]: effect }, checkInput: {
      attribute: '力量', skill: '白刃', dc: 1, dice: Array(12).fill(8), effectChoice: effect.id } }), /adopted rule/);
  assert.deepEqual(h.floors.get(h.key()), before);
});

test('test-only active sample waits for a decision and modifies DP before fortune selection', async () => {
  // Fixture only: an explicitly activated one-check token, not a scene/roleplay award.
  const effect = { id: 'test-only.active-token', label: 'TEST ONLY 主动样本',
    source: 'test-only/choice-regression', activation: 'player', attribute: '力量', skill: '白刃',
    category: 'resource', activeUse: { adopted: true, ruleSource: 'test-only/active-token-rule',
      condition: 'TEST ONLY: explicitly activate this granted token before the matching check' },
    value: 1, duration: 'nextMatchingCheck', visibility: 'public' };
  for (const choice of ['skip', effect.id]) {
    const h = harness();
    const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
    const root = createTestRoot('isolated-test-chat');
    root.actors.attacker.state.checkEffects = [effect];
    await initializeTestState({ ...options, actors: root.actors });
    const input = { ...options, operationId: 'active-sample', expectedRevision: 0,
      actorId: 'attacker', trustedEffects: { [effect.id]: effect },
      checkInput: { attribute: '力量', skill: '白刃', modifier: -11, dc: 1, dice: [8] } };
    const before = structuredClone(h.floors.get(h.key()));
    await assert.rejects(settleCheck(input), /requires player choice/);
    assert.deepEqual(h.floors.get(h.key()), before);
    const result = await settleCheck({ ...input, checkInput: { ...input.checkInput, effectChoice: choice } });
    assert.equal(result.dp, choice === 'skip' ? 0 : 1);
    assert.equal(result.fortune, choice === 'skip');
    // Existing attribute/skill automatic successes remain independent of the die.
    assert.equal(result.rolledSuccesses, choice === 'skip' ? 0 : 1);
  }
});

test('MVU ordinary check persists finalized fortune path and mishap without applying harm', async () => {
  const h = harness();
  const options = { mvu: h.mvu, getAnchor: h.getAnchor, expectedChatId: 'isolated-test-chat' };
  await initializeTestState(options);
  const zero = await settleCheck({ ...options, operationId: 'fortune-zero', expectedRevision: 0,
    actorId: 'attacker', checkInput: { attribute: '力量', skill: '白刃', modifier: -11,
      dc: 2, dice: [10, 8] } });
  assert.equal(zero.dp, 0);
  assert.equal(zero.fortune, true);
  assert.equal(zero.success, true);
  const below = await settleCheck({ ...options, operationId: 'fortune-below', expectedRevision: 1,
    actorId: 'attacker', checkInput: { attribute: '力量', skill: '白刃', modifier: -12,
      dc: 1, dice: [1] } });
  assert.equal(below.fortune, true);
  assert.equal(below.possibleMishap, true);
  assert.equal(h.floors.get(h.key()).stat_data[NAMESPACE].actors.attacker.state.health.A, 0);
  const positive = await settleCheck({ ...options, operationId: 'ordinary-positive', expectedRevision: 2,
    actorId: 'attacker', checkInput: { attribute: '力量', skill: '白刃', modifier: -10,
      dc: 1, dice: [8] } });
  assert.equal(positive.fortune, false);
});
