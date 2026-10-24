await waitGlobalInitialized('Mvu');
const {createEncounter}=await import('/901-combat-runtime/work/rules_engine/combat/catalog.mjs');
const {createTavernCombat}=await import('/901-combat-runtime/work/rules_engine/combat/tavern.mjs');
const {installCombatHost}=await import('/901-combat-runtime/work/rules_engine/combat/host-ui.mjs');
const expectedChatId=SillyTavern.chatId||SillyTavern.getCurrentChatId?.();
// These values are explicitly test fixtures, not missing historical facts.
const encounter=()=>createEncounter({id:'four-person-exercise',scenario:'四人完整卡隔离演练；测试补参R3、刀体积4、普通箭20，不写入正式人物卡',
  participants:['huang','jiang','yulin','bright'],positions:{huang:[0,0],jiang:[1,0],yulin:[2,0],bright:[30,0]},
  parameters:{bright:{bowStrength:3,ammunition:20},huang:{weaponSize:4}}});
const controller=createTavernCombat({mvu:Mvu,tavern:SillyTavern,generateRaw,createChatMessages,expectedChatId,battleFactory:encounter,
  onProgress:value=>console.log('[901-COMBAT]',JSON.stringify({status:value.status,revision:value.revision}))});
const host=installCombatHost({controller,encounters:{'four-person-exercise':encounter},document:window.top.document,tavern:SillyTavern,
  onError:error=>window.parent.toastr.error(error.message)});
const run=fn=>Promise.resolve().then(fn).catch(error=>window.parent.toastr.error(error.message));
eventOn(getButtonEvent('初始化四人演练'),()=>run(async()=>{await controller.initialize();window.parent.toastr.info('四人演练已初始化');}));
eventOn(getButtonEvent('继续战斗／玩家选择'),()=>run(()=>host.handleTurn()));
eventOn(getButtonEvent('查看当前面板'),()=>run(async()=>{
  const state=await host.read();console.log('[901-COMBAT-PANEL]',JSON.stringify(state));
  window.parent.toastr.info(`当前${state.mode}；修订${state.revision??'见存档'}`);
}));
eventOn(getButtonEvent('主持补参'),()=>host.showParameters());
eventOn(getButtonEvent('补发已结算报告'),()=>run(()=>controller.resumeReport()));
eventOn(getButtonEvent('停止演练'),()=>controller.stop());
window.addEventListener('pagehide',()=>host.dispose());
