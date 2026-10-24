import { readFileSync } from 'node:fs';

// Node-only loader. Browser callers fetch resources.json and pass its parsed array
// to createResourceAdapter from adapter.mjs.
export function loadNodeCatalog() {
  return JSON.parse(readFileSync(new URL('./resources.json', import.meta.url), 'utf8'));
}

export function loadNodeYulinfengReplayRecords() {
  return JSON.parse(readFileSync(new URL('./yulinfeng_replay_t0.records.json', import.meta.url), 'utf8'));
}
