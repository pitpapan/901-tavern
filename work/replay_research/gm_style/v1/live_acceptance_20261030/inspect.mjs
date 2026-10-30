import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const base = resolve('work/replay_research/gm_style/v1/live_acceptance_20261030');
const folder = process.argv.includes('--candidate') ? resolve(base, 'candidate') : base;
const home = 'D:/github/sillyTavern';
const readJson = async p => JSON.parse(await readFile(p, 'utf8'));
const cfg = await readJson(resolve(folder, 'config.json'));
const lines = (await readFile(resolve(home, 'data/default-user/chats', cfg.name, cfg.chatId + '.jsonl'), 'utf8'))
  .trim().split(/\r?\n/).map(JSON.parse);
const [header, ...chat] = lines;
const runs = header.chat_metadata?.narrative_acceptance_20261030 ?? [];
const style = (await readFile(resolve(base, '../901_文风提示_20261029.txt'), 'utf8')).trim();
const contentText = c => typeof c === 'string' ? c : JSON.stringify(c ?? '');
const review = {
  capturedAt: new Date().toISOString(),
  chatId: cfg.chatId,
  userMessages: chat.filter(m => m.is_user).length,
  savedRounds: runs.length,
  rounds: runs.map(r => ({
    id: r.id, beforeState: r.beforeState, afterState: r.afterState,
    settingsEvents: r.requests.map((q, i) => {
      const text = (q.messages ?? []).map(m => contentText(m.content)).join('\n');
      return { index: i, model: q.model, messageCount: q.messages?.length,
        chars: text.length, fullNewStylePresent: text.includes(style),
        newStyleOpeningPresent: text.includes(style.slice(0, 100)),
        syntheticScenePresent: text.includes('隔离合成场景'),
        privateNumberPresent: text.includes('27号'),
        roles: q.messages?.map(m => m.role) };
    }),
    activated: r.activated,
    messages: r.messages,
  })),
  messages: chat.map((m, i) => ({ id: i, user: !!m.is_user, text: m.mes,
    gate: m.extra?.['901_replay_gate'] ? {
      status: m.extra['901_replay_gate'].status,
      diagnostic: m.extra['901_replay_gate'].diagnostic,
    } : undefined,
    narrative: m.extra?.['901_narrative'] })),
};
if (process.argv.includes('--preservation')) {
  const baseline = await readJson(resolve(folder, 'protected-before.json'));
  const hash = x => createHash('sha256').update(x).digest('hex');
  const changed = [];
  for (const [path, expected] of Object.entries(baseline.files)) {
    try { if (hash(await readFile(resolve(home, path))) !== expected) changed.push(path); }
    catch (e) { changed.push({ path, error: e.code }); }
  }
  const settings = await readJson(resolve(home, 'data/default-user/settings.json'));
  review.preservation = { checkedFiles: Object.keys(baseline.files).length, changed,
    oaiSettingsUnchanged: hash(JSON.stringify(settings.oai_settings)) === baseline.oaiHash,
    memorySettingsUnchanged: hash(JSON.stringify(settings.extension_settings.memory)) === baseline.memoryHash,
    model: { source: settings.oai_settings.chat_completion_source, model: settings.oai_settings.custom_model } };
}
if (process.argv.includes('--save')) {
  await writeFile(resolve(folder, 'live-review.json'), JSON.stringify(review, null, 2) + '\n');
  await writeFile(resolve(folder, 'captured-rounds.json'), JSON.stringify(runs, null, 2) + '\n');
}
console.log(JSON.stringify({ ...review, rounds: review.rounds.map(r => ({
  id: r.id, beforeState: r.beforeState, afterState: r.afterState,
  settingsEvents: r.settingsEvents,
  activatedBooks: [...new Set(r.activated.flat().map(e => e.world))],
})), }, null, 2));
