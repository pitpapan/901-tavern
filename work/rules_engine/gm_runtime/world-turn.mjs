import { worldRuleGate } from './native-tool.mjs';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const RISK = /(?:攀|爬|跳|跃|冲|穿越|横穿|车流|闪避|躲避|追逐|逃脱|攻击|砍|刺|搏斗|偷|潜入|撬|施法|强行|试图|尝试|危险|检定|赌|防御)/;
const DIALOGUE = /(?:说|问|询问|告诉|打招呼|交谈|聊天|回应|点头|道谢|致意)/;

export function parseWorldDecision(text, playerText) {
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('GM decision must be JSON'); }
  if (!record(value) || !['no_rule', 'check', 'attack', 'needs_input'].includes(value.kind) ||
      typeof value.reason !== 'string' || !value.reason.trim() || value.reason.length > 200 ||
      Object.keys(value).some(key => !['kind', 'reason', 'basis'].includes(key)))
    throw new Error('Invalid world turn decision');
  if (value.kind === 'no_rule') {
    if (!['ordinary_dialogue', 'visible_fact', 'deterministic'].includes(value.basis))
      throw new Error('No-rule decision needs an explicit basis');
    if (RISK.test(playerText) || value.basis === 'ordinary_dialogue' && !DIALOGUE.test(playerText))
      return { kind: 'needs_input', reason: 'Action may have an uncertain mechanical outcome' };
  } else if ('basis' in value) throw new Error('Basis is only for no-rule decisions');
  return value;
}

function playerAnchor(tavern, expectedChatId) {
  if (!tavern || (tavern.chatId || tavern.getCurrentChatId?.()) !== expectedChatId)
    throw new Error('Isolated chat ID changed');
  for (let messageId = tavern.chat.length - 1; messageId >= 0; messageId--) {
    const message = tavern.chat[messageId];
    if (message?.is_user && !message.is_system && typeof message.mes === 'string' && message.mes.trim())
      return { chatId: expectedChatId, messageId, swipeId: message.swipe_id ?? 0, text: message.mes };
  }
  throw new Error('Current player message required');
}

// Use only when the isolated chat routes ALL replies through this function.
// Pending actions never reach a prose model; the fixed response cannot assert an outcome.
export async function runWorldTurn({ expectedChatId, tavern, classify, narrate, post,
  nativeNoRule = false } = {}) {
  if (typeof classify !== 'function' || typeof post !== 'function' ||
      !nativeNoRule && typeof narrate !== 'function')
    throw new Error('Classification, narration and posting functions required');
  const anchor = playerAnchor(tavern, expectedChatId);
  const stable = () => {
    const current = playerAnchor(tavern, expectedChatId);
    if (current.messageId !== anchor.messageId || current.swipeId !== anchor.swipeId ||
        current.text !== anchor.text) throw new Error('Player action changed during adjudication');
  };
  const raw = await classify(anchor.text, anchor);
  stable();
  const decision = parseWorldDecision(raw, anchor.text);
  const operationId = `gm-runtime/${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`;
  if (decision.kind !== 'no_rule') {
    const request = ['check', 'attack'].includes(decision.kind)
      ? { kind: decision.kind, reason: decision.reason } : null;
    const result = request
      ? worldRuleGate({ expectedChatId, request }, { tavern })
      : { status: 'needs_input', computed: false, revision: null,
          anchor: { chatId: anchor.chatId, messageId: anchor.messageId, swipeId: anchor.swipeId },
          missing: [decision.reason] };
    stable();
    const safeText = '这项行动仍待规则裁定；目前没有确定成功、失败或伤害。请补齐当期人物数值与必要场景条件。';
    await post(safeText, { operationId, anchor: result.anchor ?? {
      chatId: anchor.chatId, messageId: anchor.messageId, swipeId: anchor.swipeId,
    }, status: result.status, missing: result.missing ?? [] });
    return { ...result, operationId, playerText: anchor.text, narrationStatus: 'fixed_pending' };
  }
  if (nativeNoRule) return { status: 'no_rule', computed: false, operationId, anchor,
    basis: decision.basis, narrationStatus: 'native_permitted' };
  const prose = await narrate(anchor.text, decision);
  stable();
  if (typeof prose !== 'string' || !prose.trim()) throw new Error('Empty GM narration');
  if (/<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc|"op"\s*:\s*"(?:add|remove|replace)"/i.test(prose))
    throw new Error('Narration contains state update syntax');
  await post(prose);
  return { status: 'no_rule', computed: false, operationId, anchor,
    basis: decision.basis, narrationStatus: 'posted' };
}
