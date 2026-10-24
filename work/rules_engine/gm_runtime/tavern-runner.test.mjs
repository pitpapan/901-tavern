import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runTavernTurn } from './tavern-runner.mjs';
import { NAMESPACE } from '../mvu_poc/fixture.mjs';

test('two GM generations use compact JS facts and narration cannot alter MVU results', async () => {
  const tavern = { chatId: 'gm-isolated-chat', chat: [
    { is_user: true, mes: '我查看前方道路是否有异常痕迹。', swipe_id: 0 },
  ] };
  const floors = new Map([[0, { stat_data: { untouched: { value: 3 } } }]]);
  const mvu = {
    getMvuData: ({ message_id }) => structuredClone(floors.get(message_id)),
    replaceMvuData: async (data, { message_id }) => { floors.set(message_id, structuredClone(data)); },
  };
  const fetcher = async url => ({ ok: true, json: async () =>
    JSON.parse(readFileSync(url, 'utf8')) });
  const created = [];
  const createChatMessages = async messages => {
    for (const message of messages) {
      created.push(message);
      const last = tavern.chat.length - 1;
      floors.set(last + 1, structuredClone(floors.get(last)));
      tavern.chat.push({ is_user: false, mes: message.message, swipe_id: 0 });
    }
  };
  const context = { mvu, tavern, fetcher, createChatMessages,
    drawDice: () => [8, 9, 2, 5, 1, 3, 4, 6, 1, 1, 1, 1, 1, 1, 1, 1] };
  const initialized = await runTavernTurn({ mode: 'initialize', expectedChatId: tavern.chatId }, context);
  assert.equal(initialized.summary.revision, 0);
  const modelInputs = [];
  const checkResponses = ['{"kind":"check","checkId":"watch_path","dc":1}', '你在路边看见新近的蹄印，及时提醒了同伴。'];
  const checkResult = await runTavernTurn({ mode: 'resolve', expectedChatId: tavern.chatId,
    playerIntent: { kind: 'observe', actorId: 'player' } },
  { ...context, generateRaw: async options => { modelInputs.push(options.user_input); return checkResponses.shift(); } });
  assert.equal(checkResult.result.kind, 'check');
  assert.equal(checkResult.result.success, true);
  assert.equal(checkResult.narrationStatus, 'posted');
  assert.equal(floors.get(1).stat_data[NAMESPACE].revision, 1);
  assert.equal(floors.get(1).stat_data.untouched.value, 3);
  assert(!modelInputs.some(text => text.includes('resourceRefs') || text.includes('stat_data')));

  tavern.chat.push({ is_user: true, mes: '我用训练剑攻击面前的测试对手。', swipe_id: 0 });
  floors.set(2, structuredClone(floors.get(1)));
  const attackResponses = ['{"kind":"attack","weaponId":"demo.training-sword","targetId":"npc"}', '训练剑击中对手，他踉跄后退。'];
  const attack = await runTavernTurn({ mode: 'resolve', expectedChatId: tavern.chatId,
    playerIntent: { kind: 'attack', actorId: 'player', targetId: 'npc' } },
  { ...context, generateRaw: async () => attackResponses.shift() });
  assert.equal(attack.narrationStatus, 'posted');
  assert(attack.result.actualDamage > 0);
  assert.equal(floors.get(3).stat_data[NAMESPACE].actors.npc.state.health.L, attack.result.actualDamage);
  assert.equal(floors.get(3).stat_data[NAMESPACE].actors.player.state.turn.standard, 0);
  assert.equal(created.length, 2);
});

test('narration can resume after model rate limit without a second settlement', async () => {
  const tavern = { chatId: 'gm-isolated-chat', chat: [
    { is_user: true, mes: '我用训练剑攻击面前的测试对手。', swipe_id: 0 },
  ] };
  let data = { stat_data: {} };
  const mvu = { getMvuData: () => structuredClone(data),
    replaceMvuData: async next => { data = structuredClone(next); } };
  const fetcher = async url => ({ ok: true, json: async () => JSON.parse(readFileSync(url, 'utf8')) });
  const base = { mvu, tavern, fetcher,
    drawDice: () => [8, 9, 2, 5, 1, 3, 4, 6, 1, 1, 1, 1, 1, 1, 1, 1],
    createChatMessages: async messages => tavern.chat.push({ is_user: false,
      mes: messages[0].message, swipe_id: 0 }) };
  await runTavernTurn({ mode: 'initialize', expectedChatId: tavern.chatId }, base);
  let calls = 0;
  const first = await runTavernTurn({ mode: 'resolve', expectedChatId: tavern.chatId,
    playerIntent: { kind: 'attack', actorId: 'player', targetId: 'npc' } },
  { ...base, generateRaw: async () => ++calls === 1
    ? '{"kind":"attack","weaponId":"demo.training-sword","targetId":"npc"}'
    : Promise.reject(new Error('Too Many Requests')) });
  assert.equal(first.narrationStatus, 'pending');
  const saved = structuredClone(data);
  const second = await runTavernTurn({ mode: 'narrate', expectedChatId: tavern.chatId },
    { ...base, generateRaw: async () => '训练剑击中对手，他向后退了一步。' });
  assert.equal(second.narrationStatus, 'posted');
  assert.equal(second.result.actualDamage, first.result.actualDamage);
  assert.deepEqual(data, saved);
});
