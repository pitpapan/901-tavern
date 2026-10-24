import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWorldDecision, runWorldTurn } from './world-turn.mjs';

const chat = text => ({ chatId: 'isolated', chat: [{ is_user: true, mes: text, swipe_id: 0 }] });
const run = async (text, reply) => {
  const tavern = chat(text);
  const posted = [];
  let narrations = 0;
  const result = await runWorldTurn({ expectedChatId: 'isolated', tavern,
    classify: async () => JSON.stringify(reply),
    narrate: async () => { narrations++; return '只是交谈，没有数值结果。'; },
    post: async (value, pending) => posted.push({ value, pending }) });
  return { result, posted, narrations, tavern };
};

test('ordinary dialogue narrates without rolling or asking for rule state', async () => {
  const { result, posted, narrations } = await run('我问布莱特，附近有马厩吗？',
    { kind: 'no_rule', reason: '交谈', basis: 'ordinary_dialogue' });
  assert.equal(result.status, 'no_rule');
  assert.equal(narrations, 1);
  assert.equal(posted.length, 1);
});

test('risky climb remains tied to player floor and never reaches prose model', async () => {
  const { result, posted, narrations } = await run('我尝试攀爬湿滑的外墙。',
    { kind: 'check', reason: '湿滑墙面与坠落风险' });
  assert.equal(result.status, 'needs_input');
  assert.equal(result.computed, false);
  assert.deepEqual(result.anchor, { chatId: 'isolated', messageId: 0, swipeId: 0 });
  assert.match(result.operationId, /isolated\/0\/0$/);
  assert.equal(narrations, 0);
  assert.match(posted[0].value, /没有确定成功、失败或伤害/);
  assert.equal(posted[0].pending.operationId, result.operationId);
  assert.deepEqual(posted[0].pending.anchor, result.anchor);
});

test('no-rule declaration cannot bypass explicit dangerous traffic crossing', async () => {
  const { result, narrations, posted } = await run('我穿越危险车流。',
    { kind: 'no_rule', reason: 'GM 想直接通过', basis: 'deterministic' });
  assert.equal(result.status, 'needs_input');
  assert.equal(narrations, 0);
  assert.match(posted[0].value, /待规则裁定/);
});

test('GM may not inject dice, damage or arbitrary no-rule basis', () => {
  assert.throws(() => parseWorldDecision('{"kind":"check","reason":"climb","dice":[10]}', '我攀爬'), /Invalid/);
  assert.throws(() => parseWorldDecision('{"kind":"no_rule","reason":"skip","basis":"skip"}', '我跳过'), /basis/);
});

test('changed player swipe or message rejects posting', async () => {
  const tavern = chat('我攀爬墙面。');
  const posted = [];
  await assert.rejects(runWorldTurn({ expectedChatId: 'isolated', tavern,
    classify: async () => { tavern.chat[0].swipe_id = 1; return '{"kind":"check","reason":"攀爬"}'; },
    narrate: async () => '成功', post: async value => posted.push(value) }), /changed/);
  assert.equal(posted.length, 0);
});
