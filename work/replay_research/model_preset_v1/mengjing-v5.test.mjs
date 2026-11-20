import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const preset = JSON.parse(readFileSync(new URL('../../../output/replay_tavern/model_preset_v1/梦鲸思客V5-1025-exp-fix1-901-local.json', import.meta.url), 'utf8'));
const prompt = name => preset.prompts.find(p => p.name === name);
const script = name => preset.extensions.tavern_helper.scripts.find(s => s.name === name);
const source = script('梦境自修复 1.0').content;
// Only the reviewed, pure patch parser/matcher is evaluated; no imports, UI or event handlers.
const pure = source.slice(source.indexOf("const t='dream_self_repair'"), source.indexOf('function l('));
const patch = runInNewContext(pure + ';d', Object.create(null), { timeout: 1000 });
const body = text => `<dream_body>${text}</dream_body>`;

test('FIND matches literal punctuation and replacement text remains literal', () => {
  const r = patch(body('HP+1；伤害1x5；伤害1.5'), 'FIND: HP+1\nREPLACE: HP+2 $&\n\nFIND: 伤害1.5\nREPLACE: 伤害2');
  assert.equal(r.success_count, 2);
  assert.equal(r.message, body('HP+2 $&；伤害1x5；伤害2'));
});

test('ambiguous FIND across prose and parallel segments changes neither', () => {
  const text = body('守卫点头。') + '<dream_parallel_event>守卫点头。</dream_parallel_event>';
  const r = patch(text, 'FIND: 守卫点头。\nREPLACE: 守卫摇头。');
  assert.equal(r.success_count, 0);
  assert.equal(r.message, text);
  assert.match(r.errors.join(''), /唯一/);
});

test('patches use the original message and reject cascading or overlapping edits', () => {
  const r = patch(body('甲乙丙；丁。'), 'FIND: 甲乙\nREPLACE: 新词\n\nFIND: 新词\nREPLACE: 连锁\n\nFIND: 乙丙\nREPLACE: 重叠\n\nFIND: 丁\nREPLACE: 戊');
  assert.equal(r.success_count, 2);
  assert.equal(r.skipped_count, 2);
  assert.equal(r.message, body('新词丙；戊。'));
  assert.equal(r.records[0].before, '甲乙');
  assert.equal(r.records[1].before, '丁');
});

test('patches do not target thought, report or status containers', () => {
  const text = body('公开正文') + '<dream_parallel_event><simple_thinking>内部推演</simple_thinking>幕后正文</dream_parallel_event><dream_self_check>内部推演</dream_self_check>';
  const r = patch(text, 'FIND: 内部推演\nREPLACE: 改动');
  assert.equal(r.success_count, 0);
  assert.equal(r.message, text);
});

test('901 candidate expands the no-MVU instruction and preserves order metadata consistency', () => {
  assert.match(prompt('写作模式').content, /\{\{getvar::sleep_var_mvu_no_update\}\}/);
  assert.doesNotMatch(prompt('写作模式').content, /\{\{setvar::sleep_var_mvu_no_update::\}\}/);
  assert.equal(prompt('MVU不更新 - 额外模型解析打开').enabled, true);
  for (const p of preset.prompts) {
    const order = preset.prompt_order[0].order.find(o => o.identifier === p.identifier);
    if (order) assert.equal(p.enabled, order.enabled, p.name);
  }
  assert.doesNotMatch(prompt('梦境自检修复 - 反八股').content, /至少三项/);
});

test('901 candidate keeps unverified publishing scripts inactive and uses campaign controls', () => {
  for (const name of ['基米工具 1.0', '格式补全 1.2', '思维链提取到正文 1.0', '梦境自修复 1.0'])
    assert.equal(script(name).enabled, false, name);
  for (const name of ['转述抢话', '梦境平行事件', '思客大调查 - 展现你的剧情理解吧'])
    assert.equal(prompt(name).enabled, false, name);
  assert.equal(prompt('第三人称').enabled, true);
  assert.equal(prompt('转述不抢话').enabled, true);
  assert.match(prompt('梦境场景信息').content, /未知/);
  assert.doesNotMatch(prompt('梦境场景信息').content, /禁止使用“未明确”|推断出一个合理的精确日期/);
  assert.doesNotMatch(prompt('思客：温和叙者').content, /灵活调配挑战难度/);
});
