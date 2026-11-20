window.top.__901DialogueHost={enabled:false};
function renderRelationshipFacts(data) {
  const table=data?.sheet_relationship_facts;
  if (!table?.content?.length) throw new Error('独立关系事项表尚未加载');
  const lines=table.content.slice(1).map(row=>{
    const [id,subject,object,matter,kind,state,source,knownBy]=row;
    let detail=`${subject}对${object}，事项「${matter}」，${kind}：${state ?? '未交代'}`;
    if(kind==='借入') {
      detail=`${subject}向${object}借入${matter}；当前状态：${state ?? '未交代'}`;
      if(state==='未归还')detail+=`；${subject}尚须向${object}归还${matter}`;
      if(state==='已归还')detail+=`；${subject}已向${object}归还${matter}`;
    }
    return `事项#${id}：${detail}。来源：${source || '未交代'}。知情范围：${knownBy || '未交代，不自动共享'}。`;
  });
  return '【独立关系事项：当前记录逐项读取，阶段总结不替代本表；不同事项同时成立，私念不授予NPC知情】\n'+lines.join('\n');
}

const {resolveOpeningBinding}=await import('/901-opening-combat/work/rules_engine/gm_runtime/opening-binding.mjs');
const {registerReplayGate}=await import('/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js');
const {createChatSessionAccess}=await import('/901-opening-combat/work/rules_engine/gm_runtime/integrated.mjs');
const {createOpeningFixture,OPENING_SCENE:INTEGRATION_SCENE}=await import('/901-opening-combat/work/rules_engine/gm_runtime/opening.mjs');
const sceneBinding=await (await fetch('/901-opening-combat/scene-binding.json')).json();
const {createNarrativeSession,narrationRequest}=await import('/901-opening-combat/work/rules_engine/gm_runtime/narrative.mjs');
const {mountPlayerStatus}=await import('/901-opening-combat/work/rules_engine/gm_runtime/player-status-ui.mjs');
const {mountBattleMap}=await import('/901-opening-combat/work/rules_engine/gm_runtime/map-ui.mjs');
const {generateBattleMap}=await import('/901-opening-combat/work/rules_engine/combat/map.mjs');
await waitGlobalInitialized('Mvu');
// Isolated configuration only. Reuse existing native branch adoption; MVU owns writes.
if(window.top.location.port!=='18127')throw Error('Wrong continuation isolation origin');
const continuationParentId="901 医馆自然叙事隔离 20261116";
const continuationTavern=SillyTavern.getContext?.()??SillyTavern;
const continuationChatId=SillyTavern.getCurrentChatId?.()??SillyTavern.chatId;
const continuationMetadata=continuationTavern.chatMetadata??continuationTavern.chat_metadata;
const continuationIsBranch=continuationChatId!==continuationParentId;
let continuationAdoption=null;
if(continuationIsBranch){
 if(continuationMetadata?.main_chat!==continuationParentId)throw Error('Continuation must be a native child of actual saved 534');
 const {adoptNativeChatBranch,persistTavernRuleState}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
 continuationAdoption=await adoptNativeChatBranch({mvu:Mvu,tavern:continuationTavern,expectedParentChatId:continuationParentId,expectedRevision:1});
 await persistTavernRuleState({mvu:Mvu,tavern:continuationTavern,getAnchor:()=>({chatId:SillyTavern.getCurrentChatId?.()??SillyTavern.chatId,messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0})});
}
function continuationCatalog(source){
 const copy=structuredClone(source);
 if(!continuationIsBranch)return copy;
 // Exact source text, fact catalog and lore stay unchanged; bind retained quotes to this native copy.
 const visit=value=>{if(Array.isArray(value)){value.forEach(visit);return;}if(value&&typeof value==='object')for(const key of Object.keys(value)){
  if(key==='chatId'&&value[key]===continuationParentId)value[key]=continuationChatId;else visit(value[key]);
 }};
 visit(copy);return copy;
}

const response=await fetch('/901-opening-combat/work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json');
if(!response.ok)throw Error('人物来源未安装');
const baseline=await response.json();
const style=await (await fetch('/901-opening-combat/narrative-style.json')).json();
function modelOptions() {
  const scene=getSession().storyContext();
  return {should_stream:false,should_silence:true,max_chat_history:'all',
    ordered_prompts:[{role:'system',content:style},{role:'system',content:renderRelationshipFacts(window.top.AutoCardUpdaterAPI.exportTableAsJson())},'world_info_before','char_description',...(scene?[]:['scenario']),
      'world_info_after','chat_history',
      {role:'system',content:"世界书中的产地、供料与工艺是背景知识，不是本次现场清单。仅讲解材料用途时，用一般性说明或人物口头讲解；没有已确认的样品时，不安排指向、取出或展示样品，也不补写材料堆放。普通桌椅、光声和人物姿态仍可按场景描写，不能借这些细节把背景资源变成本店现货或人物持有物。当前聊天已经确认的实物及本次真实取得、交付照常承接；库存未定不等于缺货。 当前请求提到的主题未必已经载入，关键词不等于主题正文。只回答本题需要且资料已给出的事实；不凭学士资格补全具体领域的知识，不将未提供的库存写成存在或不存在。与本题无关的未知项直接省略。"+'\n'+currentSceneText(scene)+
        '\n以上是本次续写的现场依据。聊天用于承接已发生的言行，旧回复中的多余人物或伤势不得覆盖这份结算事实。未见伤势者不能补写交锋造成的伤口或裂痕。'+
        '只写可观察表现，不公开同伴或敌人数值；JS独占规则写回。玩家数值面板由MVU显示，正文不附面板。'},'user_input']};
}
let playerStatus,battleMap;
const sourceCharacter=SillyTavern.characterId;
const getSession=createChatSessionAccess(()=>SillyTavern,tavern=>createNarrativeSession({
  baseline,fixtureFactory:b=>createOpeningFixture(b,sceneBinding),resolveEncounterBinding:input=>resolveOpeningBinding(input,generateRaw),mvu:Mvu,tavern,generateRaw,createChatMessages,setChatMessages,
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
const {createStoryKnowledgeRuntime}=await import('/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs');
const {CLINIC_KNOWLEDGE_CATALOG:CONTINUATION_SOURCE_CATALOG}=await import('/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs');
const CLINIC_KNOWLEDGE_CATALOG=continuationCatalog(CONTINUATION_SOURCE_CATALOG);
const storyKnowledge=createStoryKnowledgeRuntime({mvu:Mvu,tavern:SillyTavern,catalog:CLINIC_KNOWLEDGE_CATALOG,
  dialogue:{readMemory:()=>({source:'existing-database',data:window.top.AutoCardUpdaterAPI?.exportTableAsJson?.()??null})},
  getAnchor:()=>({chatId:SillyTavern.getCurrentChatId?.()??SillyTavern.chatId,messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0})});
const storyKnowledgeController=registerReplayGate({getMvu:async()=>Mvu,combat,knowledge:storyKnowledge,
  profile:{lorebooks:["901_01_世界基础设定_20261023", "901_02_政治与势力_20261023", "901_03_人物资料库_20261023", "901_04_能力与战力_20261023", "901_05_历史与事件_20261023", "901_06_当前剧本与局势_20261023"],debug:false,prepare:()=>getSession().prepare(),loadBaseline:async()=>getSession().baseline,directEffects:false,
    get sceneContext(){return currentSceneText();},classificationTimeoutMs:60000,modelOptions,
    narrationInstruction:'承接本轮已声明言行的客观后果和相关人物的回应，不补御临风未声明的动作、台词、心理、选择或承诺。普通应答完成即可结束，未变化的环境、站位和闲置动作无需逐人复述；不以等待安排交棒。感官只呈现已有现场可支持的观察；普通休息、闲聊没有线索依据时不新增可疑人物或暗示危险。不公开NPC数值，不自动开战。'}});
window.addEventListener('pagehide',()=>{playerStatus.dispose();battleMap.dispose();try{getSession().dispose();}catch{}});

const {mountOpeningSceneHost}=await import('/901-opening-combat/work/rules_engine/gm_runtime/opening-scene-ui.mjs');
const openingHost=mountOpeningSceneHost({document:window.top.document,getSession,tavern:SillyTavern,isActive:()=>SillyTavern.characterId===sourceCharacter});
window.addEventListener('pagehide',()=>openingHost.dispose());

window.top.__901StoryKnowledge={context:()=>storyKnowledge.context(),receive:receipt=>{if(SillyTavern.characterId!==sourceCharacter)throw Error('Inactive story character');return storyKnowledgeController.receiveKnowledge(receipt);}};
Object.assign(window.top.__901StoryKnowledge,{
 configureDialogueHost:config=>{if(SillyTavern.characterId!==sourceCharacter)throw Error('Inactive story character');return storyKnowledgeController.configureKnowledgeDialogueHost(config);},
 configureDialogue:adapter=>{if(SillyTavern.characterId!==sourceCharacter)throw Error('Inactive story character');return storyKnowledgeController.configureKnowledgeDialogue(adapter);},
 questions:refs=>{if(SillyTavern.characterId!==sourceCharacter)throw Error('Inactive story character');return storyKnowledgeController.dialogueQuestions(refs);},
 resolve:answer=>{if(SillyTavern.characterId!==sourceCharacter)throw Error('Inactive story character');return storyKnowledgeController.resolveKnowledgeDialogue(answer);}
});
// Host-owned explicit configuration is optional and is never persisted in story state.
if(window.top.__901DialogueHost?.enabled===true)window.top.__901StoryKnowledge.configureDialogueHost(window.top.__901DialogueHost);
window.addEventListener('pagehide',()=>{if(SillyTavern.characterId===sourceCharacter)delete window.top.__901StoryKnowledge;});


window.top.__901StoryKnowledge.configureDialogueHost({enabled:false});

// Continuation evidence only. No automatic receipt, extraction or external sender.
const {readPersistedTavernChat:readContinuationChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const continuationDocument=window.top.document;
continuationDocument.getElementById('continuation-clinic-lab')?.remove();
const continuationPanel=continuationDocument.createElement('section');continuationPanel.id='continuation-clinic-lab';
continuationPanel.style.cssText='position:fixed;right:10px;top:42px;z-index:99999;background:#172b29;color:white;padding:10px;border:1px solid #9ab;font:13px sans-serif;max-width:345px';
const continuationStatus=continuationDocument.createElement('pre');continuationStatus.style.cssText='white-space:pre-wrap';continuationPanel.append(continuationStatus);continuationDocument.body.append(continuationPanel);
const continuationDisabled=window.top.__901StoryKnowledge.configureDialogueHost({enabled:false});
async function continuationAudit(suffix){
 const anchor={chatId:SillyTavern.getCurrentChatId(),messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0};
 await SillyTavern.saveChat();
 const mvuData=Mvu.getMvuData({type:'message',message_id:anchor.messageId});
 const saved=await readContinuationChat({tavern:SillyTavern,chatId:anchor.chatId});
 const savedPage=saved[anchor.messageId+1]?.variables?.[anchor.swipeId];
 const context=storyKnowledge.context();
 const evidence={label:'continuation-'+(continuationIsBranch?'branch':'parent')+'-'+suffix,nonCanon:true,
  anchor,metadata:continuationMetadata,adoption:continuationAdoption,dialogueHost:window.top.__901DialogueHost,
  disableResult:continuationDisabled,context,mvuData,savedPage,knowledge:storyKnowledge.read(),
  savedMessage:saved[anchor.messageId+1]?.mes,messages:SillyTavern.chat.length,savedMessages:saved.length-1,
  memory:window.top.AutoCardUpdaterAPI?.exportTableAsJson?.()??null,
  sameSavedRoot:JSON.stringify(mvuData.stat_data?.['901_rules_poc'])===JSON.stringify(savedPage?.stat_data?.['901_rules_poc'])};
 const ctx=SillyTavern.getContext?.()??SillyTavern;
 const r=await fetch('/api/backends/chat-completions/clinic-natural-evidence',{method:'POST',headers:ctx.getRequestHeaders(),body:JSON.stringify(evidence)});
 if(!r.ok||!evidence.sameSavedRoot)throw Error('Continuation saved state readback failed');
 continuationStatus.textContent='连续剧情 · 隔离非Canon\n'+(continuationIsBranch?'534的独立续玩分支':'534实际正文母本')+
  '\n抽取关闭；分类为本地NO_CHECK\n外部额度0；当前仅准备首轮请求\nrevision '+mvuData.stat_data['901_rules_poc'].revision+' / 保存读回一致\n'+context.actorKnowledge.map(a=>a.name+'：'+a.facts.length+'项关键知情').join('\n');
 return evidence;
}
const continuationAuditButton=continuationDocument.createElement('button');continuationAuditButton.textContent='核对并保存续玩状态';
continuationAuditButton.onclick=async()=>{continuationAuditButton.disabled=true;try{await continuationAudit('manual');}catch(e){continuationStatus.textContent='隔离准备失败：'+e.message;}finally{continuationAuditButton.disabled=false;}};
continuationPanel.append(continuationAuditButton);
await continuationAudit('startup');
window.addEventListener('pagehide',()=>continuationPanel.remove());
