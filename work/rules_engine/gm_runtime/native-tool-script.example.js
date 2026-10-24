// Tavern Helper role script for the disposable 901 Playable Prototype card only.
await waitGlobalInitialized('Mvu');
const { runNativeRule } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/native-tool.mjs');
const TOOL_NAME = 'trpg901_demo_resolve';
const chatId = () => SillyTavern.chatId || SillyTavern.getCurrentChatId?.();

async function ensureState(expectedChatId) {
  if (!expectedChatId) throw new Error('No current test chat');
  try {
    await runNativeRule({ mode: 'read', expectedChatId });
  } catch (error) {
    if (!/not initialized on this message branch/.test(error.message)) throw error;
    await runNativeRule({ mode: 'initialize', expectedChatId });
  }
}

SillyTavern.unregisterFunctionTool?.(TOOL_NAME);
SillyTavern.registerFunctionTool({
  name: TOOL_NAME,
  displayName: '901 测试规则结算',
  description: '仅当玩家当前消息明确主动观察环境，或明确用训练剑攻击测试对手时调用。普通对话不调用。意图模糊时先询问玩家。工具从真实玩家消息核对意图，并由 JS 投骰与写入 MVU；不得输入骰子、伤害、HP、XP 或人物授权。若工具返回 clarify，必须询问玩家。若已有保存结果，直接依据结果叙述，不重新调用。',
  parameters: {
    type: 'object', additionalProperties: false, required: ['kind'],
    properties: {
      kind: { type: 'string', enum: ['check', 'attack'] },
      checkId: { type: 'string', enum: ['watch_path'] },
      dc: { type: 'integer', minimum: 1, maximum: 4 },
      weaponId: { type: 'string', enum: ['demo.training-sword'] },
      targetId: { type: 'string', enum: ['npc'] },
    },
  },
  shouldRegister: () => Boolean(chatId()) && SillyTavern.canPerformToolCalls?.('normal') === true,
  action: async args => {
    const expectedChatId = chatId();
    await ensureState(expectedChatId);
    const result = await runNativeRule({ mode: 'resolve', expectedChatId,
      decision: args });
    console.log('[901-PLAYABLE-TOOL]', JSON.stringify(result));
    return JSON.stringify(result);
  },
});
let carryQueue = Promise.resolve();
async function syncFinalMessage() {
  try {
    const result = await runNativeRule({ mode: 'carry', expectedChatId: chatId() });
    if (result.status !== 'skipped') console.log('[901-PLAYABLE-CARRY]', JSON.stringify(result));
  } catch (error) {
    console.error('[901-PLAYABLE-CARRY]', error);
  }
}
function scheduleCarry() {
  carryQueue = carryQueue.then(syncFinalMessage, syncFinalMessage);
}
eventMakeLast(tavern_events.MESSAGE_RECEIVED, messageId => {
  if (messageId === SillyTavern.chat.length - 1) scheduleCarry();
});
// Streaming regeneration may skip MESSAGE_RECEIVED; the completed generation still fires this.
eventMakeLast(tavern_events.GENERATION_ENDED, scheduleCarry);
console.log('[901-PLAYABLE-TOOL] registered', { chatId: chatId(),
  supported: SillyTavern.canPerformToolCalls?.('normal') });
