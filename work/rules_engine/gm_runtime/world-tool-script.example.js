// Isolated T0 rule gate. It never rolls or writes MVU.
const { worldRuleGate } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/native-tool.mjs');
const TOOL_NAME = 'trpg901_t0_rule_gate';
const testChat = { chatId: SillyTavern.chatId || SillyTavern.getCurrentChatId?.(), chat: SillyTavern.chat };
SillyTavern.unregisterFunctionTool?.(TOOL_NAME);
SillyTavern.registerFunctionTool({
  name: TOOL_NAME,
  displayName: '901 T0 规则输入核对',
  description: '仅当御临风明确行动确需数值检定或攻击时调用。返回当期数值缺项，不投骰、不改伤势或资源。普通对话与可直接看见的事实无需调用。',
  parameters: { type: 'object', additionalProperties: false, required: ['kind', 'reason'], properties: {
    kind: { type: 'string', enum: ['check', 'attack'] },
    reason: { type: 'string', description: '本次为何需要规则结算，简短说明' },
  } },
  action: async request => JSON.stringify(testChat.chatId
    ? worldRuleGate({ expectedChatId: testChat.chatId, request }, { tavern: testChat })
    : { status: 'needs_input', computed: false, revision: null,
        missing: ['current chat anchor'], instruction: 'No roll or state write without a bound chat.' }),
});
console.log('[901-WORLD-GATE] registered', { chatId: testChat.chatId, chatLength: testChat.chat?.length });
