import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runNativeRule, declaredPlayerIntent } from './native-tool.mjs';
import { NAMESPACE } from '../mvu_poc/fixture.mjs';

const fetcher = async url => ({ ok: true, json: async () => JSON.parse(readFileSync(url, 'utf8')) });
const dice = () => [8, 9, 2, 5, 1, 3, 4, 6, 1, 1, 1, 1, 1, 1, 1, 1];

function scene(text) {
  const tavern = { chatId: 'prototype-chat', chat: [{ is_user: true, mes: text, swipe_id: 0 }] };
  let data = { stat_data: { other: { keep: true } } };
  const mvu = { getMvuData: () => structuredClone(data),
    replaceMvuData: async next => { data = structuredClone(next); } };
  return { tavern, mvu, read: () => structuredClone(data),
    context: { tavern, mvu, fetcher, drawDice: dice } };
}

const auth = { expectedChatId: 'prototype-chat' };
const attack = { kind: 'attack', weaponId: 'demo.training-sword', targetId: 'npc' };
const check = { kind: 'check', checkId: 'watch_path', dc: 1 };

test('actual player text grants only explicit single actions', () => {
  assert.equal(declaredPlayerIntent('我用训练剑攻击面前的测试对手。').kind, 'attack');
  assert.equal(declaredPlayerIntent('我仔细观察前方道路。').kind, 'observe');
  assert.equal(declaredPlayerIntent('我和巡逻员打个招呼。'), null);
  assert.equal(declaredPlayerIntent('我不攻击测试对手，只和他交谈。'), null);
  assert.equal(declaredPlayerIntent('巡逻员攻击我。'), null);
  assert.equal(declaredPlayerIntent('我和他交谈，巡逻员用训练剑攻击测试对手。'), null);
  assert.equal(declaredPlayerIntent('我先观察再用剑攻击测试对手。'), null);
});

test('native GM tool settles a declared check and attack, rejects unsolicited attack', async () => {
  const s = scene('我仔细观察前方道路。');
  const first = await runNativeRule({ mode: 'initialize', ...auth }, s.context);
  assert.equal(first.summary.revision, 0);
  const denied = await runNativeRule({ mode: 'resolve', ...auth, decision: attack }, s.context);
  assert.equal(denied.status, 'clarify');
  assert.equal(s.read().stat_data[NAMESPACE].revision, 0);
  const observation = await runNativeRule({ mode: 'resolve', ...auth, decision: check }, s.context);
  assert.equal(observation.status, 'applied');
  assert.equal(observation.kind, 'check');
  assert.equal(s.read().stat_data[NAMESPACE].revision, 1);
  s.tavern.chat.push({ is_user: true, mes: '我用训练剑攻击面前的测试对手。', swipe_id: 0 });
  const hit = await runNativeRule({ mode: 'resolve', ...auth, decision: attack }, s.context);
  assert.equal(hit.status, 'applied');
  assert(hit.actualDamage > 0);
  assert.equal(hit.severityName, '严重伤害');
  assert.equal(s.read().stat_data[NAMESPACE].revision, 2);
  assert.equal(s.read().stat_data[NAMESPACE].actors.player.state.turn.standard, 0);
  assert.equal(s.read().stat_data[NAMESPACE].actors.npc.state.health.L, hit.actualDamage);
  assert.equal(s.read().stat_data.other.keep, true);
});

test('saved native operation is returned after tool-message retry without a new roll', async () => {
  const s = scene('我用训练剑攻击面前的测试对手。');
  await runNativeRule({ mode: 'initialize', ...auth }, s.context);
  const first = await runNativeRule({ mode: 'resolve', ...auth, decision: attack }, s.context);
  const saved = s.read();
  s.tavern.chat.push({ is_user: false, is_system: true, mes: 'tool invocation',
    swipe_id: 0, extra: { tool_invocations: [{}] } });
  const again = await runNativeRule({ mode: 'resolve', ...auth, decision: attack },
    { ...s.context, drawDice: () => { throw new Error('rerolled'); } });
  assert.equal(again.status, 'already_applied');
  assert.equal(again.actualDamage, first.actualDamage);
  assert.deepEqual(s.read(), saved);
  const changed = await runNativeRule({ mode: 'resolve', ...auth, decision: check }, s.context);
  assert.equal(changed.status, 'clarify');
  assert.deepEqual(s.read(), saved);
});

test('native invocation accepts SillyTavern provisional GM floor after the player message', async () => {
  const s = scene('我仔细观察前方道路。');
  s.tavern.chat.push({ is_user: false, is_system: false, mes: '', swipe_id: 0 });
  await runNativeRule({ mode: 'initialize', ...auth }, s.context);
  const result = await runNativeRule({ mode: 'resolve', ...auth, decision: check }, s.context);
  assert.equal(result.status, 'applied');
  assert.equal(result.kind, 'check');
  assert.equal(result.messageId, 0);
  assert.equal(s.read().stat_data[NAMESPACE].revision, 1);
  assert.match(result.operationId, /\/0\/0$/);
});

test('final GM message receives the saved JS operation even when MVU did not inherit it', async () => {
  const tavern = { chatId: 'prototype-chat', chat: [
    { is_user: true, mes: '我用训练剑攻击面前的测试对手。', swipe_id: 0 },
  ] };
  const floors = new Map([[0, { stat_data: { other: { keep: true } } }]]);
  const mvu = { getMvuData: ({ message_id }) => structuredClone(floors.get(message_id)),
    replaceMvuData: async (next, { message_id }) => floors.set(message_id, structuredClone(next)) };
  const context = { tavern, mvu, fetcher, drawDice: dice };
  await runNativeRule({ mode: 'initialize', ...auth }, context);
  const hit = await runNativeRule({ mode: 'resolve', ...auth, decision: attack }, context);
  tavern.chat.push({ is_user: false, is_system: true, mes: 'tool result', swipe_id: 0,
    extra: { tool_invocations: [{}] } });
  floors.set(1, { stat_data: { other: { keep: true } } });
  assert.equal((await runNativeRule({ mode: 'carry', ...auth }, context)).status, 'skipped');
  assert.equal(floors.get(1).stat_data[NAMESPACE], undefined);
  tavern.chat.push({ is_user: false, is_system: false, mes: '依据结算叙述。', swipe_id: 0 });
  floors.set(2, { stat_data: { other: { keep: true } } });
  const carried = await runNativeRule({ mode: 'carry', ...auth }, context);
  assert.equal(carried.status, 'carried');
  assert.equal(floors.get(2).stat_data[NAMESPACE].revision, 1);
  assert.equal(floors.get(2).stat_data[NAMESPACE].actors.npc.state.health.L, hit.actualDamage);
  assert.equal(floors.get(2).stat_data.other.keep, true);
  assert.equal((await runNativeRule({ mode: 'carry', ...auth }, context)).status, 'already_synced');
});
