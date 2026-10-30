import { readFile, writeFile, mkdir, access, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const base = resolve('work/replay_research/gm_style/v1/live_acceptance_20261030');
const out = resolve(base, 'candidate');
const home = 'D:/github/sillyTavern';
const data = resolve(home, 'data/default-user');
const read = async p => JSON.parse(await readFile(p, 'utf8'));
const save = async (name, value) => writeFile(resolve(out, name), JSON.stringify(value, null, 2) + '\n');
const hash = x => createHash('sha256').update(x).digest('hex');
const installed = resolve(out, 'installation.json');
try { await access(installed); throw Error('Candidate already installed; do not recreate it'); }
catch (e) { if (e.code !== 'ENOENT') throw e; }

const oldCfg = await read(resolve(base, 'config.json'));
const cfg = { ...oldCfg, name: '901 叙事修复复验 20261030',
  chatId: '901 叙事修复复验 20261030 - 01连续场景', route: '/901-narrative-retest-20261030/' };
const card = await read(resolve(base, 'isolated.card.json'));
const style = (await readFile(resolve(base, '../901_文风提示_20261029.txt'), 'utf8')).trim();
assert.equal(hash(style), cfg.styleSha256);
const entry = card.data.extensions.tavern_helper.scripts.find(s => s.name === '901 帝都初始卡入口');
assert.equal(hash(entry.content), cfg.formalEntrySha256);
const original = entry.content;
const replaceOnce = (source, from, to) => {
  assert.equal(source.split(from).length, 2, 'Expected exactly one source anchor: ' + from);
  return source.replace(from, to);
};
entry.content = replaceOnce(entry.content,
  "const style=await (await fetch('/901-opening-combat/narrative-style.json')).json();",
  'const style=' + JSON.stringify(style) + ';');
entry.content = replaceOnce(entry.content, 'max_chat_history:6', "max_chat_history:'all'");
entry.content = replaceOnce(entry.content, "ordered_prompts:['world_info_before'",
  "ordered_prompts:[{role:'system',content:style},'world_info_before'");
card.name = card.data.name = cfg.name;
card.chat = cfg.chatId;
const recorder = card.data.extensions.tavern_helper.scripts.find(s => s.name === '叙事验收只读采集');
recorder.id = randomUUID();
recorder.content = `await import('${cfg.route}recorder.js');`;
const recorderSource = (await readFile(resolve(base, 'recorder.js'), 'utf8')).replaceAll(oldCfg.route, cfg.route);
await mkdir(out, { recursive: true });
await save('config.json', cfg);
await save('isolated.card.json', card);
await writeFile(resolve(out, 'host-entry.before.js'), original);
await writeFile(resolve(out, 'host-entry.candidate.js'), entry.content);
await writeFile(resolve(out, 'recorder.js'), recorderSource);
await save('change.json', { sourceEntrySha256: hash(original), candidateEntrySha256: hash(entry.content),
  styleSha256: hash(style), changes: ['explicit adopted style in guarded continuation and combat style argument',
    'history all within existing host context budget instead of six-message cap'],
  formalRuntimeModified: false });
if (!process.argv.includes('--install')) {
  console.log(JSON.stringify({ prepared: true, name: cfg.name })); process.exit(0);
}

const baseline = await read(resolve(base, 'protected-before.json'));
for (const relative of [
  `data/default-user/characters/${oldCfg.name}.png`,
  `data/default-user/chats/${oldCfg.name}/${oldCfg.chatId}.jsonl`,
]) baseline.files[relative] = hash(await readFile(resolve(home, relative)));
const settings = await read(resolve(data, 'settings.json'));
assert.equal(settings.oai_settings.chat_completion_source, cfg.model.source);
assert.equal(settings.oai_settings.custom_model, cfg.model.model);
assert.equal(hash(JSON.stringify(settings.oai_settings)), baseline.oaiHash);
await save('protected-before.json', baseline);

const csrf = await fetch('http://127.0.0.1:8000/csrf-token');
const cookie = csrf.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
const { token } = await csrf.json();
const headers = { Cookie: cookie, 'X-CSRF-Token': token };
const post = async (path, body) => {
  const r = await fetch('http://127.0.0.1:8000' + path, { method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.ok(r.ok, path + ': ' + r.status); return r.json();
};
const publicDir = resolve(home, 'public', cfg.route.slice(1, -1));
await mkdir(publicDir, { recursive: false });
for (const file of ['config.json', 'recorder.js']) await copyFile(resolve(out, file), resolve(publicDir, file));
const form = new FormData();
form.append('avatar', new Blob([JSON.stringify(card)], { type: 'application/json' }), 'narrative-retest.card.json');
form.append('file_type', 'json');
const response = await fetch('http://127.0.0.1:8000/api/characters/import', { method: 'POST', headers, body: form });
const imported = await response.json();
assert.ok(response.ok && imported.file_name);
const current = await read(resolve(data, 'settings.json'));
current.world_info_settings.world_info.charLore ??= [];
assert.ok(!current.world_info_settings.world_info.charLore.some(x => x.name === cfg.name));
current.world_info_settings.world_info.charLore.push({ name: cfg.name, extraBooks: cfg.books.slice(1) });
await post('/api/settings/save', current);
await post('/api/chats/save', { avatar_url: imported.file_name, file_name: cfg.chatId,
  chat: [{ user_name: '御临风', character_name: cfg.name, chat_metadata: { note_prompt: '', variables: {} } },
    { name: cfg.name, is_user: false, is_system: false, send_date: new Date().toISOString(), mes: cfg.scene, extra: {} }] });
await save('installation.json', { name: cfg.name, avatar: imported.file_name, chatId: cfg.chatId,
  model: cfg.model, protectedFiles: Object.keys(baseline.files).length });
console.log(JSON.stringify({ installed: true, name: cfg.name, chatId: cfg.chatId, model: cfg.model }));
