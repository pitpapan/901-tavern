// Temporary isolated TavernHelper role script. All model calls require a
// deliberate button click. Disable the 901 replay gate while using this panel.
const { replayClassificationRequest, replaySceneFromChat, relevantLorebookFacts,
  classifyWithDeadline, parseReplayDecision } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/adjudication-gate.mjs');
const { createReplayCheckRuntime } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/replay-check.mjs');

const STORE_KEY = '901-model-path-diagnostic-v1';
const MAX_LOGS = 60;
// Character scripts run inside nested TavernHelper frames. The immediate
// parent can be a hidden frame; mount controls in the visible ST document.
const hostDocument = window.top.document;
const oldPanel = hostDocument.getElementById('901-model-path-diagnostic');
oldPanel?.remove();
const panel = hostDocument.createElement('section');
panel.id = '901-model-path-diagnostic';
panel.style.cssText = 'position:absolute;right:1rem;bottom:6rem;z-index:10000;width:min(36rem,90vw);max-height:40vh;overflow:auto;padding:.7rem;background:#202329;color:#fff;border:1px solid #aaa;border-radius:.5rem;font:12px/1.4 monospace';
const title = hostDocument.createElement('strong');
title.textContent = '901 模型调用路径诊断（隔离）';
panel.append(title, hostDocument.createElement('br'));
const controls = hostDocument.createElement('div');
const output = hostDocument.createElement('pre');
output.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:9rem;overflow:auto;margin:.5rem 0 0';
panel.append(controls, output);
hostDocument.body.append(panel);

let active = null;
let records;
try { records = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
catch { records = []; }
if (!Array.isArray(records)) records = [];
function render() {
  output.textContent = records.map(row => JSON.stringify(row)).join('\n');
  output.scrollTop = output.scrollHeight;
}
function log(test, stage, metadata = {}) {
  const row = { time: new Date().toISOString(), test, stage, ...metadata };
  records.push(row);
  records = records.slice(-MAX_LOGS);
  localStorage.setItem(STORE_KEY, JSON.stringify(records));
  render();
  console.info('[901-MODEL-PATH]', row);
}
function button(label, action) {
  const item = hostDocument.createElement('button');
  item.type = 'button';
  item.textContent = label;
  item.style.cssText = 'margin:.35rem .35rem 0 0;padding:.25rem .45rem;color:#111;background:#eee;border:1px solid #aaa';
  item.addEventListener('click', action);
  controls.append(item);
  return item;
}
function safeError(error) {
  const status = Number(error?.status ?? error?.statusCode ?? error?.response?.status);
  const message = typeof error?.message === 'string' ? error.message : '';
  const reason = error?.code === 'CLASSIFICATION_TIMEOUT' ? 'deadline'
    : Number.isInteger(status) && status >= 400 && status <= 599 ? 'http_error'
    : /service unavailable/i.test(message) ? 'service_unavailable_text'
    : /internal server error/i.test(message) ? 'internal_server_error_text'
    : 'transport_or_host_error';
  return { reason, httpStatus: Number.isInteger(status) && status >= 100 && status <= 599 ? status : null };
}
function playerFloor() {
  const chat = SillyTavern.chat;
  for (let i = chat.length - 1; i >= 0; i--) {
    const entry = chat[i];
    if (entry?.is_user && !entry.is_system && entry.mes?.trim())
      return { chatId: SillyTavern.chatId || SillyTavern.getCurrentChatId?.(),
        messageId: i, swipeId: entry.swipe_id ?? 0, text: entry.mes };
  }
  throw new Error('No player message in this isolated chat');
}
function byteCount(value) { return new TextEncoder().encode(JSON.stringify(value)).length; }
function responseShape(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';
  if (trimmed.startsWith('```')) return 'code_fence';
  if (trimmed.startsWith('{')) return 'object_prefix';
  if (trimmed.startsWith('[')) return 'array_prefix';
  if (trimmed.startsWith('<')) return 'markup_prefix';
  return 'other_prefix';
}

eventOn(tavern_events.GENERATION_STARTED, () => {
  if (active?.test === 'A') log('A', 'native_started', { elapsedMs: Math.round(performance.now() - active.started) });
});
eventOn(tavern_events.CHAT_COMPLETION_SETTINGS_READY, data => {
  if (!active || !Array.isArray(data?.messages)) return;
  active.assembledCount = (active.assembledCount ?? 0) + 1;
  log(active.test, 'messages_assembled', { messageCount: data.messages.length,
    messageBytes: byteCount(data.messages), roles: data.messages.map(message => message.role),
    assemblyCount: active.assembledCount,
    model: typeof data.model === 'string' ? data.model : null,
    source: typeof data.chat_completion_source === 'string' ? data.chat_completion_source : null,
    stream: typeof data.stream === 'boolean' ? data.stream : null,
    temperature: Number.isFinite(data.temperature) ? data.temperature : null,
    maxTokens: Number.isInteger(data.max_tokens) ? data.max_tokens : null,
    responseFormatKind: typeof data.response_format,
    elapsedMs: Math.round(performance.now() - active.started) });
});
eventOn(tavern_events.GENERATION_ENDED, () => {
  if (active?.test === 'A') {
    log('A', 'native_ended', { elapsedMs: Math.round(performance.now() - active.started),
      assemblyCount: active.assembledCount ?? 0 });
    active = null;
  }
});
eventOn(tavern_events.GENERATION_STOPPED, () => {
  if (active?.test === 'A') {
    log('A', 'native_stopped', { elapsedMs: Math.round(performance.now() - active.started) });
    active = null;
  }
});

button('A：布防原生聊天', () => {
  if (active) return log('A', 'busy');
  active = { test: 'A', started: performance.now() };
  log('A', 'armed');
});

async function runRaw(test, makeRequest) {
  if (active) return log(test, 'busy');
  active = { test, started: performance.now() };
  const generationId = `901-path-${test}-${Date.now()}`;
  try {
    const { request, stateSource } = await makeRequest();
    log(test, 'request_constructed', { generationId, explicitRequestBytes: byteCount(request),
      ...(stateSource ? { stateSource } : {}) });
    log(test, 'request_dispatched', { generationId, requestCount: 1 });
    const response = await classifyWithDeadline({ generateRaw, stopGenerationById,
      request, generationId, timeoutMs: 30000 });
    const responseText = typeof response === 'string' ? response : '';
    const result = test === 'B' ? { replyOk: responseText.trim() === 'OK' }
      : (() => {
          try {
            const parsed = parseReplayDecision(responseText);
            const allowed = ['NO_CHECK', 'CHECK_REQUIRED', 'DIRECT_EFFECT', 'NEEDS_INPUT', 'UNRESOLVED'];
            return { validJson: true, responseShape: responseShape(responseText),
              decisionStatus: allowed.includes(parsed?.status) ? parsed.status : 'INVALID' };
          } catch { return { validJson: false, responseShape: responseShape(responseText) }; }
        })();
    log(test, 'response_received', { elapsedMs: Math.round(performance.now() - active.started),
      assemblyCount: active.assembledCount ?? 0,
      responseBytes: new TextEncoder().encode(responseText).length, ...result,
      providerUsage: 'not_exposed_by_generateRaw' });
  } catch (error) {
    log(test, 'failed', { elapsedMs: Math.round(performance.now() - active.started),
      generationId, ...safeError(error) });
  } finally { active = null; }
}

button('B：最小 generateRaw', () => runRaw('B', async () => ({ request: {
  should_stream: false, should_silence: true,
  ordered_prompts: [{ role: 'system', content: '只回复 OK。' }, 'user_input'],
  max_chat_history: 0, user_input: '请回复 OK',
} })));

button('C：实际分类请求（不结算）', () => runRaw('C', async () => {
  const player = playerFloor();
  const response = await fetch('/901-rules-runtime/work/character_builder/real_character/yulinfeng_replay_t0.baseline.json');
  if (!response.ok) throw new Error('Isolated baseline unavailable');
  const baseline = await response.json();
  const runtime = createReplayCheckRuntime({ baseline, mvu: globalThis.Mvu ?? {},
    getAnchor: () => ({ chatId: player.chatId, messageId: player.messageId, swipeId: player.swipeId }),
    expectedChatId: player.chatId });
  let stateSource = 'isolated_test_opening_assumption';
  let state = baseline.openingState.isolatedTestInitial;
  try {
    state = runtime.read().actors.player;
    stateSource = 'current_isolated_mvu';
  } catch { /* Fresh native chat has no initialized 901 test state. */ }
  const scene = replaySceneFromChat(SillyTavern.chat, player.messageId);
  const book = typeof getCurrentCharPrimaryLorebook === 'function'
    ? getCurrentCharPrimaryLorebook() : null;
  const relatedFacts = book && typeof getLorebookEntries === 'function'
    ? relevantLorebookFacts(await getLorebookEntries(book), { action: player.text, scene }) : [];
  return { stateSource, request: replayClassificationRequest({
    context: { original: player, latest: player, pending: false }, scene, relatedFacts,
    skills: baseline.definition.skills,
    state: { health: state.health, turn: state.turn },
    directEffects: runtime.directEffectOptions,
    unsupported: baseline.definition.abilities.map(ability => ability.name),
  }) };
}));

button('复制脱敏日志', async () => {
  await navigator.clipboard.writeText(JSON.stringify(records, null, 2));
  log('UI', 'logs_copied');
});
render();
log('UI', 'ready', { gateMustBeDisabled: true, noAutomaticModelCalls: true,
  responseShapeLogging: true });
