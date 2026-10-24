import { createDemoRuntime } from './bridge.mjs';
import { readTestOperation, tavernAnchor } from '../mvu_poc/adapter.mjs';

const loadJson = async (relative, fetcher) => {
  const response = await fetcher(new URL(relative, import.meta.url));
  if (!response.ok) throw new Error(`Could not load demo fixture: ${relative}`);
  return response.json();
};

// Call only from a Tavern Helper script on a disposable test card and chat.
export async function runTavernTurn({ mode, expectedChatId, playerIntent } = {}, {
  mvu = globalThis.Mvu, tavern = globalThis.SillyTavern,
  generateRaw = globalThis.generateRaw, createChatMessages = globalThis.createChatMessages,
  fetcher = globalThis.fetch, drawDice,
} = {}) {
  if (!tavern || !mvu || typeof fetcher !== 'function')
    throw new Error('SillyTavern, MVU and fixture fetch are required');
  const messageId = tavern.chat.length - 1;
  const getAnchor = () => tavernAnchor(messageId, tavern);
  const anchor = getAnchor();
  if (!expectedChatId || anchor.chatId !== expectedChatId)
    throw new Error('Explicit isolated test chat ID required');
  const [catalog, npcBlueprint, npcCandidate] = await Promise.all([
    loadJson('../../resource_adapter/resources.json', fetcher),
    loadJson('../../npc_draft_pipeline/new_patrol.blueprint.json', fetcher),
    loadJson('../../npc_draft_pipeline/new_patrol.candidate.json', fetcher),
  ]);
  const runtime = createDemoRuntime({ mvu, getAnchor, expectedChatId,
    catalog, npcBlueprint, npcCandidate,
    ...(drawDice ? { drawDice } : {}),
    testAuthorization: { scope: 'demo', source: 'isolated GM runtime test card only',
      actorIds: ['gm-test-player', npcBlueprint.identity.id] } });
  if (mode === 'initialize') return { result: await runtime.initialize(), summary: runtime.read() };
  if (mode === 'read') return { summary: runtime.read() };
  if (!['resolve', 'narrate'].includes(mode))
    throw new Error('Mode must be initialize, read, resolve or narrate');
  const userMessage = tavern.chat[messageId];
  if (!userMessage.is_user || typeof userMessage.mes !== 'string' || !userMessage.mes.trim())
    throw new Error('Resolve must be triggered on the current player message');
  if (typeof generateRaw !== 'function') throw new Error('GM model generateRaw() unavailable');
  const playerText = userMessage.mes;
  const generation = { should_stream: false, should_silence: true,
    ordered_prompts: [{ role: 'system', content: '你是隔离测试主持。只执行本次请求；不注入正式世界书或游戏人物状态。' },
      'user_input'], max_chat_history: 0 };
  const operationId = `gm-runtime/${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`;
  let gmText = null;
  let result;
  if (mode === 'narrate') {
    const stored = readTestOperation({ mvu, getAnchor, operationId });
    if (!stored?.summary || stored.summary.status !== 'applied')
      throw new Error('No settled operation to narrate on this message');
    result = { ...stored.summary, status: 'already_applied' };
  } else {
    const requestPrompt = `你是隔离测试场景的901主持。玩家行动：${playerText}\n` +
      '只返回一个JSON对象，不要代码块或旁白。纯观察、普通对话和无机械后果行动选 {"kind":"no_rule"}。' +
      '需要观察检定选 {"kind":"check","checkId":"watch_path","dc":1}，DC只能是1到4的整数。' +
      '玩家明确攻击测试NPC时选 {"kind":"attack","weaponId":"demo.training-sword","targetId":"npc"}。' +
      '不得输出骰值、伤害、HP、XP、JSONPatch或人物授权。';
    gmText = await generateRaw({ ...generation, user_input: requestPrompt });
    if (typeof gmText !== 'string') throw new Error('GM returned no plain JSON request');
    getAnchor();
    result = await runtime.dispatch({ gmText, playerIntent, operationId });
  }
  const facts = result.status === 'no_rule' ? { kind: 'no_rule' } : runtime.narrationFacts(result);
  const narrationPrompt = `玩家刚才的行动：${playerText}\n` +
    `JS规则结算（不可改写）：${JSON.stringify(facts)}\n` +
    '请用简短中文主持叙述行动后果。不得创造额外伤害、HP、动作、意志或XP变化；' +
    '如果是no_rule，只叙述自然反应，不宣称掷骰。';
  let narration;
  try {
    narration = await generateRaw({ ...generation, user_input: narrationPrompt });
  } catch (error) {
    return { request: gmText, result, facts, narrationStatus: 'pending',
      reason: error.message, summary: runtime.read() };
  }
  if (typeof narration !== 'string' || !narration.trim())
    return { request: gmText, result, facts, narrationStatus: 'pending',
      reason: 'GM returned empty narration', summary: runtime.read() };
  if (/<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc|"op"\s*:\s*"(?:add|remove|replace)"/i.test(narration))
    return { request: gmText, result, facts, narrationStatus: 'rejected',
      reason: 'GM narration contained state-update syntax', summary: runtime.read() };
  const summary = runtime.read();
  // Narration is a chat message only. It never writes 901_rules_poc or JSONPatch.
  if (typeof createChatMessages === 'function') {
    getAnchor();
    await createChatMessages([{ role: 'assistant', message: narration }]);
  }
  return { request: gmText, result, facts, narration,
    narrationStatus: typeof createChatMessages === 'function' ? 'posted' : 'returned_only',
    summary };
}
