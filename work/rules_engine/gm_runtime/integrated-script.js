const {registerReplayGate}=await import('/901-host-integration/work/rules_engine/gm_runtime/replay-gate-script.example.js');
const {createIntegratedSession,createChatSessionAccess,INTEGRATION_SCENE}=await import('/901-host-integration/work/rules_engine/gm_runtime/integrated.mjs');
const {installCombatHost}=await import('/901-host-integration/work/rules_engine/combat/host-ui.mjs');
const {withReplayLorebook}=await import('/901-host-integration/work/rules_engine/gm_runtime/adjudication-gate.mjs');
await waitGlobalInitialized('Mvu');
const response=await fetch('/901-host-integration/work/character_builder/real_character/yulinfeng_replay_t0.baseline.json');
if(!response.ok)throw Error('整合测试人物来源未安装');
const baseline=await response.json();
const report=text=>{
  const doc=window.top.document;
  let el=doc.getElementById('901-integration-progress');
  if(!el){el=doc.createElement('div');el.id='901-integration-progress';el.setAttribute('role','status');
    el.style.cssText='padding:4px 8px;font-size:0.85em;white-space:pre-wrap';doc.getElementById('send_form').prepend(el);}
  el.textContent=text;
};
const showError=error=>{report(`已停止：${error.message}；已保存的结算保留，可继续恢复。`);window.parent.toastr.error(error.message);};
const modelOptions={should_stream:false,should_silence:true,max_chat_history:6,
  ordered_prompts:['world_info_before','char_description','scenario',
    {role:'system',content:INTEGRATION_SCENE+'仅主持当前隔离分支；JS独占数值写回。不得把原团未来事件视为已经发生，不替御临风作出选择。'},
    'world_info_after','chat_history','user_input']};
const getSession=createChatSessionAccess(()=>SillyTavern,tavern=>createIntegratedSession({baseline,mvu:Mvu,tavern,generateRaw,createChatMessages,setChatMessages,
  makeHost:options=>installCombatHost({...options,document:window.top.document,tavern,registerTool:false,
    onError:showError}),
  narrateReturn:facts=>withReplayLorebook({book:getCurrentCharPrimaryLorebook(),
    eventOn,event:tavern_events.WORLDINFO_ENTRIES_LOADED,
    generate:()=>generateRaw({...modelOptions,max_chat_history:0,
      ordered_prompts:modelOptions.ordered_prompts.filter(x=>x!=='chat_history'),
      user_input:`战斗程序已完成结算并保存，以下是战后可见事实：${JSON.stringify(facts)}。写一小段即时反馈即可，不复述结算表。`})}),
  onProgress:value=>{report(value.status==='saved'?`已保存修订 ${value.revision}。`:`行动未执行：${value.reason??value.status}`);
    console.log('[901-INTEGRATION]',JSON.stringify({status:value.status,revision:value.revision}));},
}));
const combat={
  get busy(){return getSession().busy;},
  get encounterOptions(){return getSession().encounterOptions;},
  resumeEntry:player=>getSession().resumeEntry(player),
  handleTurn:input=>getSession().handleTurn(input),
  enterForPlayer:(id,player)=>getSession().enterForPlayer(id,player),
};
registerReplayGate({getMvu:async()=>Mvu,combat,
  profile:{prepare:()=>getSession().prepare(),loadBaseline:async()=>getSession().baseline,directEffects:false,
    sceneContext:INTEGRATION_SCENE,classificationTimeoutMs:60000,modelOptions,
    narrationInstruction:'简短叙述当前隔离演练场景的即时反馈；这里不是帝都入城开场，演练尚未开始时不让任何人自动进攻。'}});
const run=async fn=>{report('正在处理，请等待当前操作完成。');try{const r=await fn();report(r?.status==='awaiting_player'?'等待玩家选择。':r?.status==='story'?'战斗已结束，回到剧情。':'操作完成。');return r;}catch(error){showError(error);}};
eventOn(getButtonEvent('继续战斗／玩家选择'),()=>run(()=>getSession().handleTurn()));
eventOn(getButtonEvent('查看当前状态'),()=>run(async()=>{
  const state=await getSession().currentState();
  const doc=window.top.document;
  doc.getElementById('901-integration-status')?.remove();
  const panel=doc.createElement('dialog');panel.id='901-integration-status';panel.setAttribute('aria-label','901 当前存档');
  panel.style.cssText='max-width:42rem;max-height:80vh;overflow:auto;background:#202329;color:white;padding:1rem';
  const text=doc.createElement('pre');text.style.whiteSpace='pre-wrap';
  text.textContent=`模式：${state.mode}；修订：${state.revision}\n`+Object.values(state.actors).map(a=>
    `${a.name}：生命 ${a.state.health.intact}/${a.state.derived.hpMax}；B ${a.state.health.B} / L ${a.state.health.L} / A ${a.state.health.A}\n`+
    `能量：${Object.entries(a.state.resources).map(([k,v])=>`${k} ${v.current}/${v.max}`).join('、')||'无'}`
  ).join('\n\n');
  const close=doc.createElement('button');close.textContent='关闭当前存档';
  close.addEventListener('click',()=>panel.remove());panel.append(text,close);doc.body.append(panel);panel.showModal();
  console.log('[901-INTEGRATION-STATE]',JSON.stringify(state));
}));
eventOn(getButtonEvent('主持补参'),()=>run(()=>getSession().showParameters()));
eventOn(getButtonEvent('补发已结算报告'),()=>run(()=>getSession().controller.resumeReport()));
eventOn(getButtonEvent('停止自动推进'),()=>getSession().controller.stop());
window.addEventListener('pagehide',()=>{try{getSession().dispose();}catch{}window.top.document.getElementById('901-integration-status')?.remove();window.top.document.getElementById('901-integration-progress')?.remove();});
console.log('[901-INTEGRATION] READY',SillyTavern.chatId||SillyTavern.getCurrentChatId?.());
report('主持接口已就绪。');
