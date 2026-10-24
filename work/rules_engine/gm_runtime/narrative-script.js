const {registerReplayGate}=await import('/901-host-integration/work/rules_engine/gm_runtime/replay-gate-script.example.js');
const {createChatSessionAccess,INTEGRATION_SCENE}=await import('/901-host-integration/work/rules_engine/gm_runtime/integrated.mjs');
const {createNarrativeSession,narrationRequest}=await import('/901-host-integration/work/rules_engine/gm_runtime/narrative.mjs');
const {mountPlayerStatus}=await import('/901-host-integration/work/rules_engine/gm_runtime/player-status-ui.mjs');
const {mountBattleMap}=await import('/901-host-integration/work/rules_engine/gm_runtime/map-ui.mjs');
const {generateBattleMap}=await import('/901-host-integration/work/rules_engine/combat/map.mjs');
await waitGlobalInitialized('Mvu');
const response=await fetch('/901-host-integration/work/character_builder/real_character/yulinfeng_replay_t0.baseline.json');
if(!response.ok)throw Error('人物来源未安装');
const baseline=await response.json();
const style=await (await fetch('/901-host-integration/narrative-style.json')).json();
function modelOptions() {
  const scene=getSession().storyContext();
  return {should_stream:false,should_silence:true,max_chat_history:6,
    ordered_prompts:['world_info_before','char_description',...(scene?[]:['scenario']),
      'world_info_after','chat_history',
      {role:'system',content:currentSceneText(scene)+
        '\n以上是本次续写的现场依据。聊天用于承接已发生的言行，旧回复中的多余人物或伤势不得覆盖这份结算事实。未见伤势者不能补写交锋造成的伤口或裂痕。'+
        '只写可观察表现，不公开同伴或敌人数值；JS独占规则写回。玩家数值面板由MVU显示，正文不附面板。'},'user_input']};
}
let playerStatus,battleMap;
const sourceCharacter=SillyTavern.characterId;
const getSession=createChatSessionAccess(()=>SillyTavern,tavern=>createNarrativeSession({
  baseline,mvu:Mvu,tavern,generateRaw,createChatMessages,setChatMessages,
  onProgress:()=>{playerStatus?.refresh();battleMap?.refresh();},onStatusRequest:()=>playerStatus?.open(),
  onMapRequest:()=>battleMap?.open(),mapGenerator:b=>generateBattleMap(b,generateRaw),
  narrate:facts=>generateRaw(narrationRequest(facts,style)),
}));
function currentSceneText(scene=getSession().storyContext()) {
  return scene?'\n【当前程序结算确定的现场，优先于旧聊天修辞和人物卡开场】\n'+JSON.stringify(scene)+
    '\n截至最近结算，可观察人物只有：'+scene.participants.map(a=>a.name).join('、')+
    '。没有后续实际到场或转场时，仅承接这些人物；不得从T0开场或旧回复补齐缺席同伴。位置按这份当前相距，未结算声明不是已发生移动。':INTEGRATION_SCENE;
}
playerStatus=mountPlayerStatus({document:window.top.document,
  getState:()=>getSession().currentState(),getChatId:()=>SillyTavern.getCurrentChatId?.()||SillyTavern.chatId,
  isActive:()=>SillyTavern.characterId===sourceCharacter,
  getAvatar:()=>getPersonaAvatarPath('current'),on:eventOn,
  events:[Mvu.events.VARIABLE_INITIALIZED,Mvu.events.VARIABLE_UPDATE_ENDED,Mvu.events.BEFORE_MESSAGE_UPDATE,
    ...['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_SENT','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED',
      'USER_MESSAGE_RENDERED','CHARACTER_MESSAGE_RENDERED','PERSONA_CHANGED'].map(key=>tavern_events[key]),'persona_changed']});
battleMap=mountBattleMap({document:window.top.document,
  getState:()=>getSession().currentState(),getChatId:()=>SillyTavern.getCurrentChatId?.()||SillyTavern.chatId,
  isActive:()=>SillyTavern.characterId===sourceCharacter,on:eventOn,
  onDraft:text=>{const input=window.top.document.getElementById('send_textarea');if(!input)return;
    input.value=[input.value.trim(),text].filter(Boolean).join('\n');input.dispatchEvent(new window.top.Event('input',{bubbles:true}));input.focus();},
  events:[Mvu.events.VARIABLE_INITIALIZED,Mvu.events.VARIABLE_UPDATE_ENDED,Mvu.events.BEFORE_MESSAGE_UPDATE,
    ...['CHAT_CHANGED','MESSAGE_RECEIVED','MESSAGE_SENT','MESSAGE_UPDATED','MESSAGE_SWIPED','MESSAGE_DELETED'].map(key=>tavern_events[key])]});
const combat={
  get busy(){return getSession().busy;},
  get encounterOptions(){return getSession().encounterOptions;},
  resumeEntry:p=>getSession().resumeEntry(p),
  handleTurn:async input=>{try{return await getSession().handleTurn(input);}finally{playerStatus.refresh();battleMap.refresh();}},
  handleFailure:input=>getSession().handleFailure(input),
  enterForPlayer:async(id,p)=>{try{return await getSession().enterForPlayer(id,p);}finally{playerStatus.refresh();battleMap.refresh();}},
};
registerReplayGate({getMvu:async()=>Mvu,combat,
  profile:{debug:false,prepare:()=>getSession().prepare(),loadBaseline:async()=>getSession().baseline,directEffects:false,
    get sceneContext(){return currentSceneText();},classificationTimeoutMs:60000,modelOptions,
    narrationInstruction:'用原团式文字承接当前场景。只描述队友和敌人的可见表现，不公开其数值；不自动开战，不替御临风说话或决定。'}});
window.addEventListener('pagehide',()=>{playerStatus.dispose();battleMap.dispose();try{getSession().dispose();}catch{}});
