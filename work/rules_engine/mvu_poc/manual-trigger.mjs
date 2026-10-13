import { initializeTestState, readDebugState, settleAttack, tavernAnchor } from './adapter.mjs';
import { DEMO_ATTACK } from './fixture.mjs';

// Invoke only from a Tavern Helper script attached to a disposable test chat.
export async function runManualDemo({ mode, expectedChatId, messageId, operationId,
  expectedRevision = 0 } = {}, { mvu = globalThis.Mvu, tavern = globalThis.SillyTavern } = {}) {
  if (!tavern) throw new Error('SillyTavern context unavailable');
  const selectedMessageId = messageId ?? tavern.chat.length - 1;
  const getAnchor = () => tavernAnchor(selectedMessageId, tavern);
  const anchor = getAnchor();
  if (anchor.chatId !== expectedChatId) throw new Error('Name the isolated test chat ID explicitly');
  const options = { mvu, getAnchor, expectedChatId };
  if (mode === 'read') return { anchor, display: readDebugState(options) };
  const result = mode === 'initialize' ? await initializeTestState(options)
    : mode === 'attack' ? await settleAttack({ ...options, operationId, expectedRevision, ...DEMO_ATTACK })
      : (() => { throw new Error('Mode must be initialize, attack, or read'); })();
  return { result, display: readDebugState(options) };
}
