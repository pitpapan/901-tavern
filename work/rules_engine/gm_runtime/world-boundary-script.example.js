// Disposable T0 card only. This hook runs after the player floor is saved but
// before the ordinary SillyTavern model request is sent.
const { runWorldTurn } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/world-turn.mjs');
// TavernHelper's SillyTavern context exposes this already. Importing /script.js
// from a character script during generation creates a circular module load.
const stopNativeGeneration = () => {
  if (typeof SillyTavern.stopGeneration !== 'function')
    throw new Error('SillyTavern stopGeneration unavailable');
  return SillyTavern.stopGeneration();
};
let preflighting = false;
const currentChatId = () => SillyTavern.chatId || SillyTavern.getCurrentChatId?.();
const obviousRisk = /(?:攀|爬|跳|跃|冲|穿越|横穿|车流|闪避|躲避|追逐|逃脱|攻击|砍|刺|搏斗|偷|潜入|撬|施法|强行|危险|赌)/;
const config = { should_stream: false, should_silence: true,
  ordered_prompts: [{ role: 'system', content: '你是 901 隔离测试的行动分类器。只输出一个 JSON 对象，不写叙述。' }, 'user_input'],
  max_chat_history: 0 };
eventMakeFirst(tavern_events.GENERATE_AFTER_DATA, async (_data, dryRun) => {
  if (dryRun || preflighting || !currentChatId() || !SillyTavern.chat?.some(m => m?.is_user && !m?.is_system)) return;
  preflighting = true;
  try {
    const playerText = [...SillyTavern.chat].reverse().find(m => m?.is_user && !m?.is_system)?.mes || '';
    const result = await runWorldTurn({ expectedChatId: currentChatId(), tavern: SillyTavern,
      nativeNoRule: true,
      // The synchronous conservative path prevents a nested model call from
      // delaying the stop for common physical risks. Other actions use GM JSON.
      classify: obviousRisk.test(playerText)
        ? async () => JSON.stringify({ kind: 'check', reason: 'Risk requires adjudication' })
        : async text => generateRaw({ ...config, user_input:
        `玩家原消息：${text}\n` +
        '只返回 {"kind":"no_rule","reason":"简短依据","basis":"ordinary_dialogue|visible_fact|deterministic"}、' +
        '{"kind":"check","reason":"为何需要检定"}、' +
        '{"kind":"attack","reason":"为何需要攻击结算"} 或' +
        '{"kind":"needs_input","reason":"所缺输入"}。' +
        '交谈和明确可见事实可选 no_rule。攀爬、穿越危险车流、攻击等有真实不确定性的行动必须选 check/attack；' +
        '不得自行给出成功、失败、骰值、伤害或 XP。' }),
      post: async (message, pending) => {
        stopNativeGeneration();
        await createChatMessages([{ role: 'assistant', message,
          extra: { '901_world_boundary': pending } }]);
      } });
    console.log('[901-WORLD-BOUNDARY]', JSON.stringify(result));
  } catch (error) {
    // SillyTavern's EventEmitter swallows listener exceptions. Stop explicitly.
    stopNativeGeneration();
    console.error('[901-WORLD-BOUNDARY] fail closed', error);
    await createChatMessages([{ role: 'assistant',
      message: '本次行动分类或规则输入核对未完成；行动结果待定，请勿把它叙述为成功或失败。' }]);
  } finally { preflighting = false; }
});
console.log('[901-WORLD-BOUNDARY] pre-narration hook registered', currentChatId());
