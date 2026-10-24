import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { worldRuleGate } from './native-tool.mjs';

const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

test('isolated capital card preserves the adopted 005 worldbook and opening without demo actors', () => {
  const source = json('../../../output/replay_tavern/capital_entry_20261012_candidate/import/901_帝都主持.card.json').data;
  const candidate = json('../../../output/replay_tavern/world_runtime_20261014_candidate/import/901_帝都T0_隔离运行.card.json').data;
  assert.deepEqual(candidate.character_book, source.character_book);
  assert.equal(candidate.description, source.description);
  assert.equal(candidate.scenario, source.scenario);
  assert.equal(candidate.first_mes, source.first_mes);
  assert.match(candidate.system_prompt, /current_state\.md.*D3/);
  assert.doesNotMatch(candidate.system_prompt, /demo\.training-sword|测试玩家|示例巡逻员/);
  assert.equal(candidate.extensions.tavern_helper.scripts.length, 1);
  const script = candidate.extensions.tavern_helper.scripts[0].content;
  assert.match(script, /trpg901_t0_rule_gate/);
  assert.equal(script, readFileSync(new URL('./world-tool-script.example.js', import.meta.url), 'utf8'));
  assert.doesNotMatch(script, /waitGlobalInitialized\('Mvu'\)/);
});

test('T0 world gate binds a rule request to the player floor and refuses demo numbers', () => {
  const tavern = { chatId: 'isolated-capital-chat', chat: [
    { is_user: false, mes: '帝都城门在前。' },
    { is_user: true, mes: '我试着从马背跃过拥挤的车流。', swipe_id: 2 },
    { is_user: false, mes: '' },
  ] };
  const result = worldRuleGate({ expectedChatId: 'isolated-capital-chat',
    request: { kind: 'check', reason: '跃过车流' } }, { tavern });
  assert.equal(result.status, 'needs_input');
  assert.equal(result.computed, false);
  assert.deepEqual(result.anchor, { chatId: 'isolated-capital-chat', messageId: 1, swipeId: 2 });
  assert(result.missing.includes('T0 approved Builder definition and current numeric state'));
  assert.equal(tavern.chat[1].mes, '我试着从马背跃过拥挤的车流。');
  assert.throws(() => worldRuleGate({ expectedChatId: 'different-chat',
    request: { kind: 'check', reason: '跃过车流' } }, { tavern }), /chat ID/i);
  assert.throws(() => worldRuleGate({ expectedChatId: 'isolated-capital-chat',
    request: { kind: 'check', reason: '跃过车流', dice: [10] } }, { tavern }), /fields/i);
});
