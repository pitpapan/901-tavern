import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { withReplayLorebook } from '../../../../work/rules_engine/gm_runtime/adjudication-gate.mjs';

const read = file => JSON.parse(readFileSync(new URL(`../import/${file}`, import.meta.url), 'utf8'));
const filenames = [
  '901_01_世界基础设定_20261023.json',
  '901_02_政治与势力_20261023.json',
  '901_03_人物资料库_20261023.json',
  '901_04_能力与战力_20261023.json',
  '901_05_历史与事件_20261023.json',
  '901_06_当前剧本与局势_20261023.json',
];
const books = filenames.map(filename => {
  const name = filename.slice(0, -'.json'.length);
  const raw = read(filename);
  const entry = Object.values(raw.entries).find(value => !value.disable);
  assert.ok(entry, `${name} has an enabled entry`);
  return { name, entry: { uid: entry.uid, world: name, comment: entry.comment,
    content: entry.content, position: entry.position } };
});
const card = read('901_帝都初始卡_六书候选.card.json');
assert.equal(card.data.character_book.name, books[0].name);
const embedded = card.data.character_book.entries.find(entry => entry.id === books[0].entry.uid);
assert.equal(embedded?.content, books[0].entry.content);

const foreign = { uid: -1, world: '无关世界书', comment: '异书', content: '外部内容', position: 4 };
const lores = {
  globalLore: [foreign],
  characterLore: books.slice(0, 5).map(book => book.entry),
  chatLore: [books[5].entry],
  personaLore: [],
};
const before = Object.fromEntries(Object.entries(lores).map(([key, entries]) => [key, entries.map(entry => entry.world)]));
let callback;
let stopped = 0;
const eventOn = (event, listener) => {
  assert.equal(event, 'worldinfo_entries_loaded');
  callback = listener;
  return { stop: () => { stopped++; } };
};
const after = await withReplayLorebook({
  book: books[0].name,
  books: books.map(book => book.name),
  eventOn,
  event: 'worldinfo_entries_loaded',
  generate: async () => {
    callback(lores); // Host event stub: real function filters the actual arrays.
    return Object.fromEntries(Object.entries(lores).map(([key, entries]) => [key, entries.map(entry => entry.world)]));
  },
});
const retained = Object.values(after).flat();
const report = {
  cardPrimaryBook: card.data.character_book.name,
  cardEmbeddedEntries: card.data.character_book.entries.length,
  cardSampleMatchesNative01: true,
  before,
  after,
  counts: { candidateBefore: 6, foreignBefore: 1,
    candidateAfter: retained.filter(world => books.some(book => book.name === world)).length,
    foreignAfter: retained.filter(world => world === foreign.world).length },
  listenerStopped: stopped,
  sixBooksRetained: books.every(book => retained.includes(book.name)),
  foreignExcluded: !retained.includes(foreign.world),
};
console.log(JSON.stringify(report, null, 2));
assert.equal(stopped, 1);
assert.equal(report.counts.foreignAfter, 0);
assert.equal(report.counts.candidateAfter, 6, 'all six candidate books must survive the filter');
