import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { buildChatRequest, parseChatResponse } from '../../../../901-trpg-engine/tools/trpg-engine/gm/model-protocol.js';

const directory = new URL('../../../output/replay_tavern/model_preset_v1/', import.meta.url);
const local = JSON.parse(readFileSync(new URL('梦鲸思客V5-1025-exp-fix1-901-local.json', directory), 'utf8'));
const isolated = JSON.parse(readFileSync(new URL('梦鲸思客V5-1025-exp-fix1-901-engine-isolated.json', directory), 'utf8'));

test('isolated profile disables every executable V5 hook and text-transforming regex', () => {
  assert.equal(isolated.extensions.tavern_helper.scripts.length, 6);
  for (const s of isolated.extensions.tavern_helper.scripts) assert.equal(s.enabled, false, s.name);
  assert.equal(isolated.extensions.tool_output_bridge.enabled, false);
  assert.equal(isolated.extensions.tavern_helper.scripts.find(s => s.name === '基米工具 1.0').data.tool_output_bridge.enabled, false);
  assert.equal(isolated.function_calling, false);
  for (const r of isolated.extensions.regex_scripts) assert.equal(r.disabled, true, r.scriptName);
  // The older candidate retains its unverified native V5 paths and is not silently overwritten.
  assert.equal(local.extensions.tavern_helper.scripts[0].enabled, true);
});

test('isolated active prompt chain has native markers and 901 authority only, without V5 macros', () => {
  for (const group of isolated.prompt_order) {
    const enabled = group.order.filter(e => e.enabled).map(e => isolated.prompts.find(p => p.identifier === e.identifier));
    assert.equal(enabled.filter(p => !p.marker).length, 1);
    assert.equal(enabled.find(p => !p.marker).identifier, '901-engine-authority');
    for (const p of enabled) assert.doesNotMatch(p.content ?? '', /\{\{|dream_|publish_story/);
  }
  for (const p of isolated.prompts) {
    for (const group of isolated.prompt_order) {
      const order = group.order.find(e => e.identifier === p.identifier);
      if (order) assert.equal(p.enabled, order.enabled, p.name);
    }
  }
  for (const key of ['api_key', 'reverse_proxy', 'proxy_password', 'custom_url', 'custom_model', 'chat_completion_source', 'model']) assert.equal(isolated[key], undefined);
});

test('reviewed pure V5 tool predicate filters model, channel and generation type, not function_calling', () => {
  const source = local.extensions.tavern_helper.scripts.find(s => s.name === '基米工具 1.0').content;
  // Execute only the reviewed two pure functions x/A; never the bundle, event hooks or fetch wrapper.
  const start = source.indexOf('function x(e,t){return t.enabled');
  const end = source.indexOf('function C(', start);
  assert.ok(start >= 0 && end > start);
  const matches = runInNewContext(source.slice(start, end) + ';x', Object.create(null), { timeout: 1000 });
  const request = { model: 'gemini-3.5-flash-lite', type: 'normal', chat_completion_source: 'makersuite', function_calling: false };
  const config = { enabled: true, modelNameIncludes: 'Gemini' };
  assert.equal(matches(request, config), true);
  for (const type of ['normal', 'continue', 'swipe', 'regenerate']) assert.equal(matches({ ...request, type }, config), true);
  for (const type of ['quiet', 'impersonate']) assert.equal(matches({ ...request, type }, config), false);
  assert.equal(matches({ ...request, model: 'different-model' }, config), false);
  assert.equal(matches({ ...request, chat_completion_source: 'unsupported' }, config), false);
  assert.equal(matches(request, { ...config, enabled: false }), false);
});

const packet = { schemaVersion: 'gm-narration/1', packetRef: 'packet.v5', binding: { branchRef: 'branch.current', viewToken: 'view.current' }, view: 'character', facts: [], observations: [{ publicRef: 'ref.clock', kind: 'world_time', value: 1 }], checkDisplay: [], options: [], prompts: [], publicRefs: ['ref.clock'] };
const input = { packet, style: { tone: '克制', person: 'third', length: 'medium', innerMonologue: false } };
const response = message => ({ status: 200, body: { choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', ...message } }] } });

test('actual engine JSON protocol does not consume V5 macros, native cache, hidden history or swipes', () => {
  const result = buildChatRequest('narrate', input, { model: 'synthetic.gemini' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.response_format, { type: 'json_object' });
  assert.equal(result.value.tools, undefined);
  assert.equal(result.value.messages.length, 2);
  assert.deepEqual(JSON.parse(result.value.messages[1].content), input);
  for (const extra of [{ history: ['old-summary'] }, { swipes: ['discarded-branch'] }, { worldbook: ['stale-green-cache'] }]) {
    assert.equal(buildChatRequest('narrate', { ...input, ...extra }, { model: 'synthetic.gemini' }).ok, false);
  }
  const changed = { ...input, packet: { ...packet, binding: { branchRef: 'branch.other', viewToken: 'view.other' } } };
  assert.deepEqual(JSON.parse(buildChatRequest('narrate', changed, { model: 'synthetic.gemini' }).value.messages[1].content).packet.binding, changed.packet.binding);
});

test('actual engine parser rejects V5 XML, publish_story tool output and empty content', () => {
  const draft = { packetRef: packet.packetRef, text: '守卫仍在门边。', claims: [], optionRefs: [] };
  assert.equal(parseChatResponse(response({ content: JSON.stringify(draft) }), { kind: 'narrate', input }).ok, true);
  for (const message of [
    { content: '<dream_body>守卫仍在门边。</dream_body>' },
    { content: '' },
    { content: JSON.stringify(draft), tool_calls: [{ type: 'function', function: { name: 'publish_story', arguments: JSON.stringify({ story: draft.text }) } }] },
  ]) assert.equal(parseChatResponse(response(message), { kind: 'narrate', input }).ok, false);
});
