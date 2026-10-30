import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = resolve('work/replay_research/gm_style/v1/live_acceptance_20261030');
const folder = process.argv[2] ? resolve(base, process.argv[2]) : base;
const runs = JSON.parse(await readFile(resolve(folder, 'captured-rounds.json'), 'utf8'));
const style = (await readFile(resolve(base, '../901_文风提示_20261029.txt'), 'utf8')).trim();
// Identify the guarded continuation by its request content, not event order:
// the intercepted native request can contain the style without producing prose.
const continuations = r => r.requests.filter(q => q.messages?.some(m =>
  m.role === 'user' && typeof m.content === 'string' && m.content.includes('裁定路径：')));
const text = q => q.messages.map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join('\n');

test('actual guarded continuation receives the adopted narrative style', () => {
  assert.ok(runs.length > 0, 'No saved live runs');
  for (const r of runs) {
    const requests = continuations(r);
    assert.ok(requests.length > 0, `No continuation captured for ${r.id}`);
    for (const q of requests) assert.ok(text(q).includes(style), `Style absent from ${r.id} continuation`);
  }
});
test('fourth-round request and reply retain first-round private record', () => {
  const r = runs.find(r => r.id === '04-记忆与知情');
  assert.ok(r, 'Fourth round not saved');
  const requests = continuations(r);
  assert.ok(requests.length > 0);
  assert.ok(requests.every(q => text(q).includes('铜牌背面是27号，仍收在外衣内袋，没有给任何人看过。')),
    'First-round record was removed from the actual continuation');
  const answer = r.messages.filter(m => !m.user).map(m => m.text).join('\n');
  assert.match(answer, /27/);
  assert.match(answer, /外衣内袋/);
});
