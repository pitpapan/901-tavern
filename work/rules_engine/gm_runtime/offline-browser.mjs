// TEST ONLY. Never import this from a card, loader, or normal-play script.
// Small host shim around the unchanged production entry point; not an MVU host test.
const key = '901-offline-browser-acceptance-v1';
const fresh = () => ({ chat: [], floors: {}, draws: 0, classifications: 0, narrations: 0,
  stops: 0, writes: 0, selected: 'no' });
let data = JSON.parse(sessionStorage.getItem(key) || 'null') || fresh();
let hook;
const decisions = {
  no: { status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: 'test dialogue' },
  check: { status: 'CHECK_REQUIRED', reason: 'test observation',
    request: { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 } },
  sub: { status: 'CHECK_REQUIRED', reason: 'test knowledge',
    request: { kind: 'check', attribute: '智力', skill: '学识', sub: '死灵学', dc: 3 } },
  effect: { status: 'DIRECT_EFFECT', reason: 'test scene cue',
    request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } },
};
const texts = { no: '测试：我问候同行者。', check: '测试：我观察道路痕迹。',
  sub: '测试：我回想死灵学知识。', effect: '测试：我记录场景线索。' };
function save() { sessionStorage.setItem(key, JSON.stringify(data)); render(); }
function render() {
  const player = data.chat.findLastIndex(m => m.is_user);
  const root = data.floors[player]?.stat_data?.['901_rules_poc'];
  document.querySelector('#state').textContent = JSON.stringify({
    playerTurns: data.chat.filter(m => m.is_user).length,
    revision: root?.revision ?? null, operations: Object.keys(root?.operations || {}).length,
    effects: root?.actors.player.state.checkEffects?.length ?? 0,
    randomByteBatches: data.draws, classifications: data.classifications,
    narrations: data.narrations, stops: data.stops, mvuWrites: data.writes,
    pending: data.chat.map(m => m.extra?.['901_replay_gate']?.pending).filter(Boolean),
    lastStatus: data.chat.at(-1)?.extra?.['901_replay_gate']?.status ?? null,
    resources: root ? { health: root.actors.player.state.health,
      turn: root.actors.player.state.turn, will: root.actors.player.state.will,
      xp: root.actors.player.state.xp } : null,
  }, null, 2);
  document.querySelector('#chat').replaceChildren(...data.chat.map(m => {
    const p = document.createElement('p'); p.textContent = `${m.is_user ? 'Player' : 'Test assistant'}: ${m.mes}`; return p;
  }));
}
globalThis.SillyTavern = { chatId: 'offline-browser-only', chat: data.chat,
  saveChat: async () => save(),
  stopGeneration() { data.stops++; save(); } };
globalThis.tavern_events = { GENERATE_AFTER_DATA: 'test-generation', WORLDINFO_ENTRIES_LOADED: 'test-worlds' };
globalThis.getCurrentCharPrimaryLorebook = () => 'offline-test-only';
globalThis.eventOn = () => ({ stop() {} });
globalThis.eventMakeFirst = (_event, listener) => { hook = listener; };
globalThis.stopGenerationById = () => true;
globalThis.generateRaw = async request => {
  if (request.generation_id) { data.classifications++; save(); return JSON.stringify(decisions[data.selected]); }
  data.narrations++; save();
  if (document.querySelector('#fail').checked) {
    document.querySelector('#fail').checked = false; throw Error('Controlled test narration failure');
  }
  return '【离线测试续述占位；非模型输出、非游戏事实】';
};
globalThis.createChatMessages = async messages => {
  for (const m of messages) {
    if (m.role !== 'assistant') throw Error('Panel attempted to add a player turn');
    const i = data.chat.length;
    data.floors[i] = structuredClone(data.floors[i - 1] || { stat_data: {} });
    data.chat.push({ is_user: false, mes: m.message, extra: m.extra, swipe_id: 0 });
  }
  save();
};
globalThis.setChatMessages = async messages => {
  for (const m of messages) data.chat[m.message_id].extra = structuredClone(m.extra);
  save();
};
globalThis.Mvu = {
  getMvuData: ({ message_id }) => structuredClone(data.floors[message_id] || { stat_data: {} }),
  replaceMvuData: async (value, { message_id }) => {
    data.floors[message_id] = structuredClone(value); data.writes++; save();
  },
};
// Count actual random resolution, without changing the generated dice.
const random = crypto.getRandomValues.bind(crypto);
crypto.getRandomValues = array => { data.draws++; save(); return random(array); };
const { registerReplayGate } = await import('./replay-gate-script.example.js');
registerReplayGate();
async function run() { await hook({}, false); save(); }
document.querySelectorAll('[data-case]').forEach(button => button.onclick = async () => {
  data.selected = button.dataset.case;
  const i = data.chat.length;
  data.floors[i] = structuredClone(data.floors[i - 1] || { stat_data: { untouched: 'fixture' } });
  data.chat.push({ is_user: true, mes: texts[data.selected], swipe_id: 0 });
  save(); await run();
});
document.querySelector('#retry').onclick = run;
document.querySelector('#reset').onclick = () => { sessionStorage.removeItem(key); location.reload(); };
document.querySelectorAll('button').forEach(button => { button.disabled = false; });
render();
