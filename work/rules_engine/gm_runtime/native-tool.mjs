import { createDemoRuntime, parseGmDecision } from './bridge.mjs';
import { carryTestState, readTestOperation, tavernAnchor } from '../mvu_poc/adapter.mjs';

const loadJson = async (relative, fetcher) => {
  const response = await fetcher(new URL(relative, import.meta.url));
  if (!response.ok) throw new Error(`Could not load demo fixture: ${relative}`);
  return response.json();
};

// Conservative demo vocabulary: uncertainty stays with the player, never with a dice roll.
export function declaredPlayerIntent(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const words = text.replace(/\s+/g, '');
  if (/(?:不|别|勿|没有|并未|不要)(?:再)?(?:攻击|砍|刺|挥剑|出剑)/.test(words)) return null;
  const actions = words.split(/[，。；,;]/).filter(clause =>
    /^(?:我|本人|咱)(?:要|想|打算|准备|会|来|先|现在)?/.test(clause));
  const strikes = actions.filter(clause => /(?:攻击|砍向|刺向|挥剑|出剑|劈向|击向)/.test(clause));
  const inspections = actions.filter(clause => /(?:观察|查看|察看|检查|搜寻|寻找.{0,6}痕迹|侦察)/.test(clause));
  if (strikes.length && inspections.length) return null;
  if (strikes.length === 1 && /(?:训练剑|长剑|用剑|挥剑|出剑)/.test(strikes[0]) &&
      /(?:测试对手|示例巡逻员|巡逻员|对手)/.test(strikes[0]))
    return { kind: 'attack', actorId: 'player', targetId: 'npc' };
  if (inspections.length === 1 && !strikes.length) return { kind: 'observe', actorId: 'player' };
  return null;
}

function playerIndex(chat) {
  for (let i = chat.length - 1; i >= 0; i--)
    if (chat[i]?.is_user && !chat[i]?.is_system) return i;
  throw new Error('No player message in this chat');
}

// T0 has no approved, period-complete Builder definition yet. Keep the same
// real-chat/player-floor boundary as the playable tool, but never run its demo actors.
export function worldRuleGate({ expectedChatId, request } = {},
  { tavern = globalThis.SillyTavern } = {}) {
  if (!tavern || typeof expectedChatId !== 'string' || !expectedChatId ||
      (tavern.chatId || tavern.getCurrentChatId?.()) !== expectedChatId)
    throw new Error('Explicit isolated chat ID required');
  if (!request || !['check', 'attack'].includes(request.kind) ||
      typeof request.reason !== 'string' || !request.reason.trim() ||
      request.reason.length > 200 ||
      Object.keys(request).some(key => !['kind', 'reason'].includes(key)))
    throw new Error('World rule request fields must be kind and a short reason');
  const messageId = playerIndex(tavern.chat);
  const player = tavern.chat[messageId];
  if (typeof player.mes !== 'string' || !player.mes.trim())
    throw new Error('Actual player action required');
  return {
    status: 'needs_input', computed: false, revision: null,
    anchor: { chatId: expectedChatId, messageId, swipeId: player.swipe_id ?? 0 },
    missing: ['T0 approved Builder definition and current numeric state'],
    instruction: 'Do not roll, change MVU rule fields, or claim success or failure. Ask for the missing period-specific numeric state or a narrow host ruling when this action truly needs a check.',
  };
}

const operationFor = anchor => `gm-runtime/${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`;
const withSeverityName = (result, kind) => ({ ...result, kind,
  ...(kind === 'attack' ? { severityName: { B: '冲击伤害', L: '严重伤害', A: '恶性伤害' }[result.severity] } : {}),
});

// Called by one native SillyTavern tool on a disposable GM card. The tool args are GM input;
// player intent, chat anchor, MVU revision and dice come from separate trusted inputs.
export async function runNativeRule({ mode = 'resolve', expectedChatId, decision } = {}, {
  mvu = globalThis.Mvu, tavern = globalThis.SillyTavern,
  fetcher = globalThis.fetch, drawDice,
} = {}) {
  if (!mvu || !tavern || typeof fetcher !== 'function')
    throw new Error('SillyTavern, MVU and fixture fetch are required');
  if (typeof expectedChatId !== 'string' || !expectedChatId ||
      (tavern.chatId || tavern.getCurrentChatId?.()) !== expectedChatId)
    throw new Error('Explicit isolated test chat ID required');
  const tip = tavern.chat.length - 1;
  const index = mode === 'resolve' ? playerIndex(tavern.chat)
    : tavern.chat.some(message => message?.is_user && !message?.is_system)
      ? playerIndex(tavern.chat) : tip;
  const anchor = index === tip ? tavernAnchor(index, tavern) : {
    chatId: expectedChatId, messageId: index, swipeId: tavern.chat[index].swipe_id ?? 0,
  };
  const playerText = tavern.chat[index]?.mes;
  const getAnchor = () => {
    if ((tavern.chatId || tavern.getCurrentChatId?.()) !== expectedChatId ||
        tavern.chat.length - 1 !== tip ||
        (tavern.chat[index]?.swipe_id ?? 0) !== anchor.swipeId ||
        tavern.chat[index]?.mes !== playerText)
      throw new Error('Chat or player swipe changed during operation');
    return index === tip ? tavernAnchor(index, tavern) : anchor;
  };
  if (mode === 'carry') {
    const last = tavern.chat[tip];
    if (index === tip || last?.is_user || last?.is_system || !last?.mes?.trim())
      return { status: 'skipped' };
    const operationId = operationFor(anchor);
    let saved;
    try { saved = readTestOperation({ mvu, getAnchor, operationId }); }
    catch (error) {
      if (/not initialized on this message branch/.test(error.message))
        return { status: 'skipped' };
      throw error;
    }
    if (!saved) return { status: 'skipped' };
    const finalAnchor = tavernAnchor(tip, tavern);
    const finalText = last.mes;
    const getFinalAnchor = () => {
      if (tavern.chat[tip]?.mes !== finalText) throw new Error('Final GM message changed during sync');
      return tavernAnchor(tip, tavern);
    };
    return carryTestState({ mvu, getSourceAnchor: getAnchor, getAnchor: getFinalAnchor,
      expectedChatId, operationId });
  }
  const [catalog, npcBlueprint, npcCandidate] = await Promise.all([
    loadJson('../../resource_adapter/resources.json', fetcher),
    loadJson('../../npc_draft_pipeline/new_patrol.blueprint.json', fetcher),
    loadJson('../../npc_draft_pipeline/new_patrol.candidate.json', fetcher),
  ]);
  const runtime = createDemoRuntime({ mvu, getAnchor, expectedChatId,
    catalog, npcBlueprint, npcCandidate, ...(drawDice ? { drawDice } : {}),
    testAuthorization: { scope: 'demo', source: 'isolated playable prototype card only',
      actorIds: ['gm-test-player', npcBlueprint.identity.id] } });
  if (mode === 'initialize') return { result: await runtime.initialize(), summary: runtime.read() };
  if (mode === 'read') return { summary: runtime.read() };
  if (mode !== 'resolve') throw new Error('Unsupported native tool mode');
  const parsed = parseGmDecision(JSON.stringify(decision));
  if (!['check', 'attack'].includes(parsed.kind))
    throw new Error('Use ordinary narration without a rule tool for no-rule actions');
  const intent = declaredPlayerIntent(tavern.chat[index].mes);
  const matches = intent && (parsed.kind === 'check' && intent.kind === 'observe' ||
    parsed.kind === 'attack' && intent.kind === 'attack' && intent.targetId === parsed.targetId);
  if (!matches) return { status: 'clarify',
    question: '玩家未明确声明与本次规则请求一致的行动。请询问玩家要做什么，不要结算或声称行动已发生。' };
  const operationId = operationFor(anchor);
  if (index !== tip) {
    const last = tavern.chat[tip];
    if (last?.is_system && Array.isArray(last.extra?.tool_invocations)) {
      const saved = readTestOperation({ mvu, getAnchor, operationId });
      if (!saved) throw new Error('No saved operation to replay after the tool message');
      const prior = JSON.parse(saved.signature);
      if (parsed.kind === 'check' && prior.checkInput?.dc !== parsed.dc ||
          parsed.kind === 'attack' && prior.targetId !== parsed.targetId)
        throw new Error('Operation ID already used for different input');
      return withSeverityName({ ...saved.summary, status: 'already_applied' }, parsed.kind);
    }
    if (last?.is_user || last?.is_system || last?.mes !== '')
      throw new Error('A newer chat message prevents settlement on the old player floor');
  }
  const result = await runtime.dispatch({ gmText: JSON.stringify(parsed),
    playerIntent: intent, operationId });
  return withSeverityName(result, parsed.kind);
}
