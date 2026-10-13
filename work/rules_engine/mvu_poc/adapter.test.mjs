import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestRoot, DEMO_ATTACK, NAMESPACE } from './fixture.mjs';
import { initializeTestState, settleAttack, readDebugState } from './adapter.mjs';

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
