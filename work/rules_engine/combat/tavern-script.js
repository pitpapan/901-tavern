await waitGlobalInitialized('Mvu');
const { createTavernCombat } = await import('/901-combat-runtime/work/rules_engine/combat/tavern.mjs');
const expectedChatId = SillyTavern.chatId || SillyTavern.getCurrentChatId?.();
const battle901 = createTavernCombat({mvu:Mvu,tavern:SillyTavern,generateRaw,createChatMessages,expectedChatId,
  onProgress:value=>console.log('[901-COMBAT]',JSON.stringify(value))});
async function perform(mode) {
  try {
    const value = mode==='initialize' ? await battle901.initialize()
      : mode==='read' ? battle901.read()
      : mode==='resume' ? await battle901.resumeReport()
      : await battle901.run({single:mode==='step'});
    if(mode==='run'&&battle901.read().battle.status==='finished') await battle901.returnToStory();
    console.log('[901-COMBAT]',JSON.stringify({mode,...value}));
    window.parent.toastr.info(`901：${value.status??value.battle?.status??'已读取'}；修订${value.revision??'见聊天'}`);
  } catch(error) {
    console.error('[901-COMBAT]',error.message);
    window.parent.toastr.error(`901：${error.message}`);
  }
}
eventOn(getButtonEvent('初始化演练'),()=>perform('initialize'));
eventOn(getButtonEvent('模型行动一次'),()=>perform('step'));
eventOn(getButtonEvent('运行至结束'),()=>perform('run'));
eventOn(getButtonEvent('读取存档'),()=>perform('read'));
eventOn(getButtonEvent('补发已结算报告'),()=>perform('resume'));
eventOn(getButtonEvent('停止演练'),()=>battle901.stop());
