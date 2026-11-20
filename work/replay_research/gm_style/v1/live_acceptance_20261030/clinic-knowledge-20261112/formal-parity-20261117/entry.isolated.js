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
const {CLINIC_KNOWLEDGE_CATALOG}=await import('/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs');
const storyKnowledge=createStoryKnowledgeRuntime({mvu:Mvu,tavern:SillyTavern,catalog:{...CLINIC_KNOWLEDGE_CATALOG,rejectedNarration:[]},
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

storyKnowledge.configureDialogue(null);
window.addEventListener('pagehide',()=>{if(SillyTavern.characterId===sourceCharacter)delete window.top.__901StoryKnowledge;});
// Explicit manual test controls, present only in the isolated card.
if(window.top.location.port!=='18129')throw Error('Isolated clinic controls require top-level port 18129');
const {adoptNativeChatBranch:adoptParityBranch,carryTestState:carryParityState,readPersistedTavernChat:readParityChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const parityParent="901 帝都正式续玩 20261106",parityParentRevision=0;
const parityDocument=window.top.document;
parityDocument.getElementById('clinic-parity-controls')?.remove();
const parityPanel=parityDocument.createElement('section');parityPanel.id='clinic-parity-controls';
parityPanel.style.cssText='position:fixed;right:8px;top:45px;z-index:99999;background:#142c30;color:white;padding:10px;max-width:330px;font:13px sans-serif';
const parityStatus=parityDocument.createElement('pre');parityStatus.style.cssText='white-space:pre-wrap';
parityStatus.textContent='医馆旧交 · 正式同构隔离\n人工确认接收；通用抽取关闭\n请求经隔离中转；次数以本轮账本为准';parityPanel.append(parityStatus);parityDocument.body.append(parityPanel);
const parityTavern=()=>SillyTavern.getContext?.()??SillyTavern;
const parityAnchor=()=>({chatId:SillyTavern.getCurrentChatId?.()??SillyTavern.chatId,messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0});
const parityPost=async(path,data)=>{const r=await fetch('/api/backends/chat-completions/'+path,{method:'POST',headers:parityTavern().getRequestHeaders(),body:JSON.stringify(data)});if(!r.ok)throw Error('Local evidence '+r.status);return r.json();};
function parityButton(label,action){const b=parityDocument.createElement('button');b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await action();}catch(e){parityStatus.textContent='未完成：'+e.message;}finally{b.disabled=false;}};parityPanel.append(b);}
parityButton('绑定当前原生测试分支',async()=>{
 const result=await adoptParityBranch({mvu:Mvu,tavern:parityTavern(),expectedParentChatId:parityParent,expectedRevision:parityParentRevision});
 await SillyTavern.saveChat();parityStatus.textContent='原生分支已绑定：'+result.status+'\n未初始化人物；请保存baseline快照';
});
const paritySource='桌外隔离验收事件（非正式剧情）：一名来客避开御临风和黄泉，只对布莱特说：“九雪医馆馆主与雪老有旧，二者是不同的人。”布莱特听清了这句话；御临风与黄泉没有听见。';
parityButton('人工测试告知：仅布莱特收到',async()=>{
 let sourceId=SillyTavern.chat.findIndex(m=>m.mes===paritySource);
 if(sourceId<0){
  const old=parityAnchor(),root=Mvu.getMvuData({type:'message',message_id:old.messageId}).stat_data['901_rules_poc'];
  const operationId=Object.keys(root.operations).findLast(id=>root.operations[id].summary?.kind!=='knowledge')??Object.keys(root.operations).at(-1);
  await createChatMessages([{role:'system',message:paritySource,is_hidden:true,extra:{clinicParityTestSource:true}}]);
  sourceId=SillyTavern.chat.length-1;
  await carryParityState({mvu:Mvu,getSourceAnchor:()=>old,getAnchor:parityAnchor,expectedChatId:old.chatId,operationId});
  await SillyTavern.saveChat();
 }
 const source=SillyTavern.chat[sourceId],anchor=parityAnchor();
 const result=await window.top.__901StoryKnowledge.receive({id:'clinic.parity.bright.20261117',authority:'host-confirmed',status:'received',
  sourceAnchor:{chatId:anchor.chatId,messageId:sourceId,swipeId:source.swipe_id??0,text:source.mes},
  propositionRefs:['clinic.owner.xuelao.old-friend'],recipientIds:['bright'],channel:'message',belief:'confirmed'});
 parityStatus.textContent='人工确认已提交原receive：'+result.status+'\n来源原文已保存；仅布莱特收到';
});
// The operator clicks only after reading the actual retained utterance and confirming audibility.
parityButton('人工确认当前对白：御临风与黄泉听清',async()=>{
 const anchor=parityAnchor(),source=SillyTavern.chat[anchor.messageId];
 if(!['after','reopen'].includes(parityPhase.value)||source.is_user||source.is_system||source.extra?.['901_replay_gate']?.status!=='NO_CHECK')throw Error('Select after/reopen and retain an actual completed assistant utterance first');
 const result=await window.top.__901StoryKnowledge.receive({id:'clinic.parity.public.'+parityPhase.value+'.20261117',authority:'host-confirmed',status:'received',
  sourceAnchor:{...anchor,text:source.mes},propositionRefs:['clinic.owner.xuelao.old-friend'],recipientIds:['player','huang'],senderId:'bright',channel:'message',belief:'confirmed'});
 parityStatus.textContent='人工确认实际对白接收：'+result.status+'\n原告知不重复授予；当前来源为实际保存的模型正文';
});
const parityPhase=parityDocument.createElement('select');parityPhase.setAttribute('aria-label','三状态捕获阶段');
for(const phase of ['before','after','reopen']){const o=parityDocument.createElement('option');o.value=phase;o.textContent=phase;parityPhase.append(o);}parityPanel.append(parityPhase);
parityButton('切换请求捕获阶段',async()=>{await parityPost('clinic-parity-phase',{phase:parityPhase.value});parityStatus.textContent='仅捕获真实入口请求：'+parityPhase.value+'\n分类使用实际模型响应；次数见账本';});
const parityLabel=parityDocument.createElement('input');parityLabel.setAttribute('aria-label','三状态快照名称');parityLabel.value='baseline';parityPanel.append(parityLabel);
parityButton('保存当前swipe与磁盘快照',async()=>{
 await SillyTavern.saveChat();const anchor=parityAnchor(),saved=await readParityChat({tavern:SillyTavern,chatId:anchor.chatId});
 const pages=SillyTavern.chat.map((_,i)=>Mvu.getMvuData({type:'message',message_id:i}));
 const result=await parityPost('clinic-parity-evidence',{label:parityLabel.value,chatId:anchor.chatId,nonCanon:true,modelCalls:'server-ledger',
  anchor,chat:structuredClone(SillyTavern.chat),pages,saved,knowledgeContext:storyKnowledge.context(),
  dialogueDisabled:(await storyKnowledge.resumeDialogue()).status==='disabled'});
 parityStatus.textContent='已保存：'+parityLabel.value+'\n知情 '+storyKnowledge.context().actorKnowledge.map(a=>a.name+':'+a.facts.length).join(' / ')+'\n模型调用：'+result.modelCalls+'，累计'+result.cumulative+'\n磁盘seed：'+result.seedSha256.slice(0,12);
});
window.addEventListener('pagehide',()=>parityPanel.remove());
