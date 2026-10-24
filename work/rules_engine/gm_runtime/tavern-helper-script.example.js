// Paste into a Tavern Helper role script on a disposable test card only.
// Replace this ID with the exact current disposable chat ID before enabling.
const EXPECTED_CHAT_ID = 'REPLACE_WITH_DISPOSABLE_TEST_CHAT_ID';
await waitGlobalInitialized('Mvu');
const { runTavernTurn } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/tavern-runner.mjs');

async function run901(mode, playerIntent) {
  try {
    const value = await runTavernTurn({ mode, expectedChatId: EXPECTED_CHAT_ID, playerIntent });
    console.log('[901-GM-RUNTIME]', JSON.stringify(value));
    window.parent?.toastr?.info?.(`901: ${value.result?.status ?? 'read'}; 修订 ${value.summary?.revision ?? '?'}`);
  } catch (error) {
    console.error('[901-GM-RUNTIME]', error);
    window.parent?.toastr?.error?.(`901: ${error.message}`);
  }
}

eventOn(getButtonEvent('901 GM 初始化'), () => run901('initialize'));
eventOn(getButtonEvent('901 GM 观察'), () => run901('resolve', { kind: 'observe', actorId: 'player' }));
eventOn(getButtonEvent('901 GM 攻击'), () => run901('resolve',
  { kind: 'attack', actorId: 'player', targetId: 'npc' }));
eventOn(getButtonEvent('901 GM 读取'), () => run901('read'));
eventOn(getButtonEvent('901 GM 续述'), () => run901('narrate'));
