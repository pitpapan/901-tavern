// Disposable replay T0 card. Every player turn enters this controller before
// model prose. The constant below is an explicit isolated-test assumption.
const REPLAY_OPENING_ASSUMPTION = true;
// Remove or set false after this isolated diagnosis. No prompts or response bodies are recorded.
const REPLAY_GATE_DEBUG = true;
const { runGuardedTurn, replayGateReadiness, replaySceneFromChat,
  replayClassificationRequest, classifyWithDeadline, parseReplayDecision, playerCheckDisplay,
  compactNarrationFacts, savedDecisionForRecovery,
  relevantLorebookFacts, replayLorebookNames, withReplayLorebook,
  replayPendingFromChat } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/adjudication-gate.mjs');
const { createReplayCheckRuntime } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/replay-check.mjs');
const { createDialogueSemanticAdapter,createTavernDialogueCompletion } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs');
const { carryTestState, readTestOperation, persistTavernRuleState } = await import('/901-rules-runtime/work/rules_engine/mvu_poc/adapter.mjs');
let running = false;
// TavernHelper executes scripts in a zero-size iframe. Player UI belongs to
// the host document, as in the existing isolated diagnostic panel.
const hostDocument = window.top.document;
window.addEventListener('pagehide', () => {
  hostDocument.getElementById('901-replay-public-pool')?.remove();
  hostDocument.getElementById('901-replay-choice')?.remove();
  hostDocument.getElementById('901-knowledge-status')?.remove();
});
function safeFailure(error, stage) {
  const status = Number(error?.status ?? error?.statusCode ?? error?.response?.status);
  if (error?.code === 'CLASSIFICATION_TIMEOUT') return { reason: 'deadline', httpStatus: null };
  if (error?.code === 'CLASSIFICATION_CANCELLED') return { reason: 'cancelled', httpStatus: null };
  if (Number.isInteger(status) && status >= 100 && status <= 599)
    return { reason: 'http_error', httpStatus: status };
  if (stage === 'response_parse') return { reason: 'invalid_model_response', httpStatus: null };
  if (stage === 'gate_validation') return { reason: 'gate_rejected_decision', httpStatus: null };
  if (stage?.startsWith('request_') && stage !== 'request_dispatched')
    return { reason: 'request_construction_failed', httpStatus: null };
  if (['request_dispatched', 'messages_assembled'].includes(stage))
    return { reason: 'transport_or_host_error', httpStatus: null };
  if (stage === 'state_persistence') return { reason: 'state_persistence_failed', httpStatus: null };
  if (stage?.startsWith('continuation')) return { reason: 'continuation_failed', httpStatus: null };
  return { reason: 'runtime_or_readiness_failed', httpStatus: null };
}
function failureDetails(error) {
  // Persist only known codes/statuses, never provider response bodies, prompts,
  // credentials or arbitrary error text in ordinary chat metadata.
  const details={};
  if(['INVALID_DECISION_JSON','INVALID_DECISION_STATUS','INVALID_DECISION_REASON','INVALID_DECISION_REQUEST','INVALID_CHECK_ATTRIBUTE',
    'CLASSIFICATION_TIMEOUT','CLASSIFICATION_CANCELLED'].includes(error?.code))details.errorCode=error.code;
  const localErrors={
    'Player floor changed during adjudication':'PLAYER_ANCHOR_CHANGED',
    'MVU operation already in progress':'MVU_OPERATION_IN_PROGRESS',
    'MVU state version conflict':'MVU_VERSION_CONFLICT',
    'MVU data changed before save':'MVU_CHANGED_BEFORE_SAVE',
    'MVU save was not confirmed by readback':'MVU_READBACK_FAILED',
    'Test state not initialized on this message branch':'MVU_STATE_MISSING',
    'Test state schema or chat identity mismatch':'MVU_STATE_IDENTITY_MISMATCH',
  };
  if(Object.hasOwn(localErrors,error?.message??''))details.errorCode=localErrors[error.message];
  let body;
  try { if(typeof error?.message==='string'&&error.message.trim().startsWith('{'))body=JSON.parse(error.message); } catch {}
  const upstream=error?.error??error?.response?.data?.error??error?.cause?.error??body?.error;
  if(Number.isInteger(upstream?.code)&&upstream.code>=400&&upstream.code<=599)details.upstreamHttpStatus=upstream.code;
  if(['RESOURCE_EXHAUSTED','UNAUTHENTICATED','PERMISSION_DENIED','UNAVAILABLE','INTERNAL','INVALID_ARGUMENT']
    .includes(upstream?.status))details.upstreamStatus=upstream.status;
  return details;
}
function showPublicPool(basis) {
  let panel = hostDocument.getElementById('901-replay-public-pool');
  if (!panel) {
    panel = hostDocument.createElement('div');
    panel.id = '901-replay-public-pool';
    panel.setAttribute('role', 'status');
    panel.style.cssText = 'position:fixed;right:1rem;bottom:1rem;z-index:9999;padding:.75rem 1rem;max-width:28rem;background:#202329;color:#fff;border:1px solid #888;border-radius:.5rem';
    hostDocument.body.append(panel);
  }
  panel.textContent = `本次检定依据：${playerCheckDisplay(basis)}`;
}
function chooseLocalOption(basis, choices) {
  return new Promise(resolve => {
    const dialog = hostDocument.createElement('dialog');
    dialog.id = '901-replay-choice';
    dialog.setAttribute('aria-label', '901 检定主动选择');
    const title = hostDocument.createElement('p');
    title.textContent = `本次检定依据：${playerCheckDisplay(basis)}`;
    dialog.append(title);
    let selected = null;
    for (const choice of choices) {
      const button = hostDocument.createElement('button');
      button.type = 'button';
      button.textContent = choice.label;
      button.addEventListener('click', () => { selected = choice.id; dialog.close(); });
      dialog.append(button);
    }
    dialog.addEventListener('close', () => { dialog.remove(); resolve(selected); }, { once: true });
    hostDocument.body.append(dialog);
    dialog.showModal();
  });
}
function chooseDialogueReceipt(question){
 return new Promise(resolve=>{
  const dialog=hostDocument.createElement('dialog');dialog.id='901-replay-choice';dialog.setAttribute('aria-label','确认消息接收范围');
  dialog.style.cssText='background:#202329;color:#fff;border:1px solid #888;border-radius:.5rem;padding:1rem;max-width:min(44rem,90vw);max-height:85vh;overflow:auto;color-scheme:dark';
  const style=hostDocument.createElement('style');style.textContent='#901-replay-choice label{display:flex;align-items:center;gap:.5rem;margin:.5rem 0;color:inherit}#901-replay-choice input[type=checkbox]{width:auto;margin:0}#901-replay-choice select,#901-replay-choice textarea,#901-replay-choice button{background:#15181d;color:#fff;border:1px solid #888;border-radius:.25rem;padding:.4rem}#901-replay-choice textarea{flex:1;min-width:0}#901-replay-choice button{margin:.5rem .5rem 0 0}';dialog.append(style);
  const title=hostDocument.createElement('p');title.textContent=`后续行动需要这条消息：${question.content??'内容未确定'}。${question.reason}。这次谁实际收到？`;dialog.append(title);
  const inputs=[],speaker=hostDocument.createElement('select'),quote=hostDocument.createElement('textarea');
  for(const [id,name] of Object.entries(question.actors)){const option=hostDocument.createElement('option');option.value=id;option.textContent=name;speaker.append(option);}
  speaker.value=question.speakerId??'';quote.value=question.content??'';
  const source=hostDocument.createElement('details'),summary=hostDocument.createElement('summary'),original=hostDocument.createElement('p');
  summary.textContent='查看原记录';original.textContent=question.sourceAnchor.text;source.append(summary,original);dialog.append(source);
  const speakerLabel=hostDocument.createElement('label');speakerLabel.append(hostDocument.createTextNode('消息说话者'),speaker);
  const contentLabel=hostDocument.createElement('label');contentLabel.append(hostDocument.createTextNode('实际收到的原文片段'),quote);dialog.append(speakerLabel,contentLabel);
  for(const [id,name] of Object.entries(question.actors)){
   const label=hostDocument.createElement('label'),input=hostDocument.createElement('input');input.type='checkbox';input.checked=question.recipientIds.includes(id);
   label.append(input,hostDocument.createTextNode(name));dialog.append(label);inputs.push({id,input});
  }
  let answer=null;
  for(const [label,received] of [['确认选中人物收到',true],['这次没有收到',false],['暂不确定',null]]){
   const button=hostDocument.createElement('button');button.type='button';button.textContent=label;
   button.addEventListener('click',()=>{
    const recipientIds=inputs.filter(x=>x.input.checked).map(x=>x.id),start=question.sourceAnchor.text.indexOf(quote.value);
    if(received&&(!recipientIds.length||!speaker.value||!quote.value||start<0))return;
    answer=received===null?null:{received,recipientIds:received?recipientIds:[],...(received?{speakerId:speaker.value,contentSpan:{start,end:start+quote.value.length,quote:quote.value}}:{})};dialog.close();
   });dialog.append(button);
  }
  dialog.addEventListener('close',()=>{dialog.remove();resolve(answer);},{once:true});hostDocument.body.append(dialog);dialog.showModal();
 });
}
function showKnowledgeStatus(status,knowledge,resolveAnswer){
 hostDocument.getElementById('901-knowledge-status')?.remove();
 if(!['deferred','unavailable','unprocessed'].includes(status.status)||!hostDocument.createElement)return;
 const panel=hostDocument.createElement('aside');panel.id='901-knowledge-status';
 panel.textContent=status.status==='unprocessed'?'本轮正文已保存，知情整理尚未完成。':'这项行动依赖尚未确认的消息；可先进行不依赖它的对话。';
 for(const q of status.questions??[]){const button=hostDocument.createElement('button');button.textContent='处理这条消息';button.type='button';
  button.addEventListener('click',async()=>{if(running)return;const answer=await chooseDialogueReceipt({...q,actors:Object.fromEntries(knowledge.context().actorKnowledge.map(a=>[a.actorId,a.name]))});if(answer){await resolveAnswer({id:q.id,...answer});button.remove();}});panel.append(button);}
 hostDocument.body.append(panel);
}
const chatId = () => SillyTavern.chatId || SillyTavern.getCurrentChatId?.();
const model = { should_stream: false, should_silence: true,
  ordered_prompts: ['world_info_before', 'char_description', 'scenario',
    { role: 'system', content: '你是901帝都重玩T0隔离主持。现有卡面强度已获作者作为重玩基线批准，但原团后期事件未自动发生。只使用当前场景相关世界书和近期聊天；NPC秘密不自动成为玩家知识。御临风行动由玩家决定，JS独占规则数值写入。只回答当前请求，不写JSONPatch或MVU变量。' },
    'world_info_after', 'chat_history', 'user_input'], max_chat_history: 6 };
const playerFloor = () => {
  for (let i = SillyTavern.chat.length - 1; i >= 0; i--) {
    const message = SillyTavern.chat[i];
    if (message?.is_user && !message.is_system && message.mes?.trim())
      return { chatId: chatId(), messageId: i, swipeId: message.swipe_id ?? 0, text: message.mes };
  }
  throw new Error('Actual player message required');
};
const latestPending = () => replayPendingFromChat(SillyTavern.chat, playerFloor());
export function registerReplayGate({ getMvu = async () => globalThis.Mvu, npcContext,
  scriptedOpportunities = {}, geneticOpportunities={},initialGeneticLock,ruleEvents={},ruleFeats={},combat = null, profile = {},knowledge=null } = {}) {
const debug=profile.debug??REPLAY_GATE_DEBUG;
let deferredDialogue=null;
const resolveAndResume=async answer=>{
 if(running||combat?.busy)throw Error('Wait for current story operation');
 const pendingPlayer=deferredDialogue;
 if(pendingPlayer&&JSON.stringify(playerFloor())!==JSON.stringify(pendingPlayer))throw Error('Pending dialogue request changed');
 await knowledge.resolveDialogue(answer);
 if(pendingPlayer){deferredDialogue=null;hostDocument.getElementById('901-knowledge-status')?.remove();await handleTurn({},false);}
};
const resumeKnowledge=async()=>{
 const status=await knowledge?.resumeDialogue?.();if(!status)return;
 let changed=false;
 for(const batch of Object.values(knowledge.read?.().dialogueBatches??{})){
  const source=batch.sourceAnchor,row=SillyTavern.chat[source.messageId];
  if(batch.status!=='processed'||source.chatId!==chatId()||row?.mes!==source.text||(row.swipe_id??0)!==source.swipeId||row.extra?.['901_knowledge_status']?.status!=='unprocessed')continue;
  delete row.extra['901_knowledge_status'];changed=true;
 }
 if(changed){await SillyTavern.saveChat();await (profile.onKnowledgeStatus??(value=>showKnowledgeStatus(value,knowledge,resolveAndResume)))(status);}
};
const generateKnown=request=>knowledge?knowledge.generate({request,generateRaw,eventOn,eventRemoveListener,
  event:tavern_events.CHAT_COMPLETION_SETTINGS_READY}):generateRaw(request);
if (typeof getMvu !== 'function') throw new Error('MVU provider required');
if (typeof eventMakeFirst !== 'function' || !tavern_events?.GENERATE_AFTER_DATA)
  throw new Error('Pre-narration hook unavailable');
// Native regenerate removes the last assistant message before GENERATE_AFTER_DATA.
// Keep its actual pages for this generation only: the report can own the sole
// latest combat state. Never reconstruct that state from the preceding floor.
let nativeCombatRegeneration=null;
if(tavern_events.GENERATION_STARTED && typeof getChatMessages==='function')
  eventMakeFirst(tavern_events.GENERATION_STARTED,async(type,_options,dryRun)=>{
    nativeCombatRegeneration=null;
    if(type!=='regenerate'||dryRun||running||combat?.busy)return;
    const id=chatId(),messageId=SillyTavern.chat.length-1;
    const last=SillyTavern.chat[messageId];
    if(!id||!last||last.is_user||last.is_system)return;
    const mvu=await getMvu();
    const root=mvu.getMvuData({type:'message',message_id:messageId})?.stat_data?.['901_rules_poc'];
    if(!(combat&&root?.battle?.mode==='combat')&&!(knowledge&&root?.storyKnowledge&&['APPLIED','NO_CHECK'].includes(last.extra?.['901_replay_gate']?.status)))return;
    const message=getChatMessages(String(messageId),{include_swipes:true})[0];
    nativeCombatRegeneration={chatId:id,message:structuredClone(message),extra:structuredClone(last.extra??{})};
  });
const readinessOf = (mvu, player) => replayGateReadiness({ mvu, chatId: chatId(), player,
  generateRaw: typeof generateRaw === 'function' ? generateRaw : null,
  createChatMessages: typeof createChatMessages === 'function' ? createChatMessages : null,
  stopGeneration: SillyTavern.stopGeneration,
  stopGenerationById: typeof stopGenerationById === 'function' ? stopGenerationById : null,
  createRuleRuntime: createReplayCheckRuntime });
const handleTurn=async (_data, dryRun) => {
  if (dryRun || running || combat?.busy || !chatId() || !SillyTavern.chat?.some(m => m?.is_user && !m?.is_system)) return;
  const regeneration=nativeCombatRegeneration;
  nativeCombatRegeneration=null;
  running = true;
  const player = playerFloor();
  const expectedChatId = player.chatId;
  const startedAt = performance.now();
  const diagnostic = { stage: 'hook_entered', operationId:
    `gm-runtime/${player.chatId}/${player.messageId}/${player.swipeId}`,
    classificationRequests: 0, narrationRequests: 0 };
  const mark = (stage, details = {}) => {
    diagnostic.stage = stage;
    Object.assign(diagnostic, details);
    diagnostic.elapsedMs = Math.round(performance.now() - startedAt);
    if (debug) console.info('[901-REPLAY-GATE] stage', { ...diagnostic });
  };
  // This is the actual pre-narration boundary. Stop before any asynchronous
  // classification call, including for ordinary dialogue.
  SillyTavern.stopGeneration();
  let mvu;
  const getAnchor = () => ({ chatId: expectedChatId, messageId: player.messageId, swipeId: player.swipeId });
  const stable = () => {
    const actual = playerFloor();
    if (actual.chatId !== expectedChatId || actual.messageId !== player.messageId ||
        actual.swipeId !== player.swipeId || actual.text !== player.text)
      throw new Error('Player floor changed during adjudication');
  };
  let runtime;
  let pending = null;
  let lastDecision = null;
  let trustedRuleContext = {};
  // A retained battle snapshot also exists in story mode. Only an exception
  // from a combat call belongs to its recovery route, not later story work.
  let handlingCombat = false;
  const combatCall = async call => {
    handlingCombat = true;
    const result = await call();
    handlingCombat = false;
    return result;
  };
  try {
    mark('readiness');
    mvu = await getMvu();
    if(regeneration?.chatId===expectedChatId && SillyTavern.chat.length===regeneration.message.message_id){
      const message=regeneration.message,swipe=message.swipe_id;
      mark('combat_report_restore');
      await createChatMessages([{role:message.role,name:message.name,is_hidden:message.is_hidden,
        message:message.swipes[swipe],data:message.swipes_data[swipe],extra:message.swipes_info[swipe]}]);
      await setChatMessages([message]);
      // Native swipe_info includes dates and an extra envelope; the helper's
      // swiped-message setter assigns that envelope to message.extra. Restore
      // the actual report metadata so the narrative cache finds this report.
      SillyTavern.chat[message.message_id].extra=structuredClone(regeneration.extra);
      await SillyTavern.saveChat();
    }
    await profile.prepare?.({mvu,player});
    if(combat) {
      const resumed=await combatCall(()=>combat.resumeEntry?.(player));
      if(resumed?.handled) {mark('combat_entry_resumed');return;}
      const handled=await combatCall(()=>combat.handleTurn({player}));
      if(handled?.handled) {mark('combat_handled');return;}
    }
    const readiness = readinessOf(mvu, player);
    if (!readiness.ready) throw new Error(`Replay gate NOT_READY: ${readiness.missing.join(', ')}`);
    const playerMeta = SillyTavern.chat[player.messageId]?.extra?.['901_replay_gate'];
    const cached = playerMeta?.completed;
    // A later clarification can complete an earlier declaration. Its saved
    // operation remains the original one when this reply is regenerated.
    const completedOperationId = cached?.status === 'APPLIED' &&
      cached.playerText === player.text && playerMeta.operationId === cached.operationId &&
      cached.meta?.status === cached.status && cached.meta.operationId === cached.operationId &&
      typeof cached.operationId === 'string' && cached.operationId.startsWith(`gm-runtime/${expectedChatId}/`)
      ? cached.operationId : diagnostic.operationId;
    const completedOffset = SillyTavern.chat.slice(player.messageId + 1).findLastIndex(message =>
      !message?.is_user && ['APPLIED', 'NO_CHECK'].includes(message?.extra?.['901_replay_gate']?.status) &&
      message.extra['901_replay_gate'].operationId === completedOperationId);
    const completedIndex = completedOffset < 0 ? -1 : player.messageId + 1 + completedOffset;
    const completed = SillyTavern.chat[completedIndex];
    if (completed) {
      stable();
      const applied = completed.extra['901_replay_gate'].status === 'APPLIED';
      if (applied && readTestOperation({ mvu, getAnchor, operationId: completedOperationId })?.summary?.status !== 'applied')
        throw new Error('Completed narration has no saved rule operation');
      const projected = mvu.getMvuData({ type: 'message', message_id: completedIndex })
        ?.stat_data?.['901_rules_poc'];
      if (!projected || applied && !projected.operations?.[completedOperationId]) {
        await carryTestState({ mvu, expectedChatId,
          ...(applied ? { operationId: completedOperationId } : {}),
          getSourceAnchor: getAnchor,
          getAnchor: () => ({ chatId: expectedChatId, messageId: completedIndex,
            swipeId: completed.swipe_id ?? 0 }) });
        await SillyTavern.saveChat();
      }
      if (!cached && typeof completed.mes === 'string' && completed.mes.trim()) {
        const meta = completed.extra['901_replay_gate'];
        await setChatMessages([{ message_id: player.messageId, message: player.text, extra: {
          ...SillyTavern.chat[player.messageId].extra, '901_replay_gate': {
            ...SillyTavern.chat[player.messageId].extra?.['901_replay_gate'],
            completed: { status: meta.status, operationId: meta.operationId,
              playerText: player.text, message: completed.mes, meta },
          },
        } }], { refresh: 'none' });
        await SillyTavern.saveChat();
      }
      mark('completed_reuse');
      await resumeKnowledge();
      return;
    }
    if (cached?.operationId === completedOperationId && cached.playerText === player.text &&
        ['APPLIED', 'NO_CHECK'].includes(cached.status) && cached.meta?.status === cached.status &&
        cached.meta.operationId === cached.operationId &&
        typeof cached.message === 'string' && cached.message.trim()) {
      if (cached.status === 'APPLIED' &&
          readTestOperation({ mvu, getAnchor, operationId: completedOperationId })?.summary?.status !== 'applied')
        throw new Error('Completed narration has no saved rule operation');
      mark('completed_restore');
      await createChatMessages([{ role: 'assistant', message: cached.message,
        extra: { '901_replay_gate': cached.meta } }]);
      const finalIndex = SillyTavern.chat.length - 1;
      await carryTestState({ mvu, expectedChatId,
        ...(cached.status === 'APPLIED' ? { operationId: cached.operationId } : {}),
        getSourceAnchor: getAnchor,
        getAnchor: () => ({ chatId: expectedChatId, messageId: finalIndex,
          swipeId: SillyTavern.chat[finalIndex]?.swipe_id ?? 0 }) });
      await SillyTavern.saveChat();
      return;
    }
    console.log('[901-REPLAY-GATE] READY', expectedChatId, player.messageId, player.swipeId);
    mark('baseline_load');
    const baseline = profile.loadBaseline ? await profile.loadBaseline() : await (async()=>{
      const response = await fetch('/901-rules-runtime/work/character_builder/real_character/yulinfeng_replay_t0.baseline.json');
      if (!response.ok) throw new Error('Replay card baseline unavailable');
      return response.json();
    })();
    console.log('[901-REPLAY-GATE] baseline loaded');
    mark('state_read');
    runtime = createReplayCheckRuntime({ baseline, mvu, getAnchor,
        expectedChatId, npcContext, scriptedOpportunities,geneticOpportunities,initialGeneticLock,ruleEvents,ruleFeats });
    console.log('[901-REPLAY-GATE] runtime built');
    pending = latestPending();
    try { runtime.read(); }
    catch (error) {
      if (!/not initialized on this message branch/.test(error.message)) throw error;
      // Real MVU does not necessarily copy variables onto newly added floors.
      // Carry only the nearest selected prior snapshot, never reinitialize it.
      let sourceId = player.messageId - 1;
      while (sourceId >= 0 && !mvu.getMvuData({ type: 'message', message_id: sourceId })
        ?.stat_data?.['901_rules_poc']) sourceId--;
      if (sourceId >= 0) {
        const sourceSwipe = SillyTavern.chat[sourceId]?.swipe_id ?? 0;
        await carryTestState({ mvu, expectedChatId, getAnchor,
          getSourceAnchor: () => ({ chatId: expectedChatId, messageId: sourceId, swipeId: sourceSwipe }) });
        runtime.read();
      } else {
        const firstPlayerFloor = SillyTavern.chat.filter(m => m?.is_user && !m?.is_system).length === 1;
        if (!firstPlayerFloor || pending) throw error;
        console.log('[901-REPLAY-GATE] initializing isolated state');
        await runtime.initialize({ openingAssumption: REPLAY_OPENING_ASSUMPTION });
      }
    }
    console.log('[901-REPLAY-GATE] state ready');
    if(knowledge?.prepareDialogueTurn){
      await resumeKnowledge();
      const readiness=await knowledge.prepareDialogueTurn({text:player.text,sourceAnchor:player},{ask:profile.askKnowledge??chooseDialogueReceipt});
      stable();
      if(readiness.status!=='ready'){
        mark('knowledge_dependency_pending');
        deferredDialogue=structuredClone(player);
        await (profile.onKnowledgeStatus??(status=>showKnowledgeStatus(status,knowledge,resolveAndResume)))(readiness);
        return;
      }
      deferredDialogue=null;
    }
    const result = await runGuardedTurn({ player, pending, ensureStable: stable,
      canCancelPending: candidate => !candidate.narrationDecision && !candidate.retryNoCheck &&
        !readTestOperation({ mvu, getAnchor, operationId: candidate.operationId }),
      onStage: stage => mark(stage),
      enterCombat: combat?.enterForPlayer ? ({context,request})=>
        combatCall(()=>combat.enterForPlayer(request.encounterId,context.original)) : undefined,
      classify: async context => {
        // The gate may start a fresh message after an unclassified technical
        // failure. Keep later errors anchored to that actual current request.
        if(!context.pending)pending=null;
        diagnostic.operationId=context.operationId;
        mark('request_construction');
        const saved = readTestOperation({ mvu, getAnchor, operationId: context.operationId });
        const recovered = savedDecisionForRecovery(pending, saved);
        if (recovered) { lastDecision = recovered; return recovered; }
        if (pending?.localChoice === true && pending.request?.kind === 'check') {
          lastDecision = { status: 'CHECK_REQUIRED', reason: '恢复尚未完成的本地选择',
            request: pending.request };
          return lastDecision;
        }
        mark('request_state_read');
        const summary = runtime.read().actors.player;
        mark('request_scene_read');
        const recentScene=replaySceneFromChat(SillyTavern.chat,context.latest.messageId);
        const scene = [profile.sceneContext,recentScene].filter(Boolean).join('\n');
        const ruleContext=runtime.ruleContext(),currentPlayer=runtime.currentPlayer();
        trustedRuleContext={scene:recentScene,actorIds:ruleContext.actors.filter(a=>a.id==='player'||
          `${recentScene}\n${context.original.text}`.includes(a.name)).map(a=>a.id)};
        mark('request_lorebook_read');
        const book = typeof getCurrentCharPrimaryLorebook === 'function'
          ? getCurrentCharPrimaryLorebook() : null;
        const entries = book && typeof getLorebookEntries === 'function'
          ? (await Promise.all(replayLorebookNames({book,books:profile.lorebooks})
            .map(async name=>(await getLorebookEntries(name)).map(e=>({...e,world:name}))))).flat() : [];
        const relatedFacts=relevantLorebookFacts(knowledge?knowledge.projectEntries(entries):entries,{action:context.original.text,scene});
        mark('request_build');
        const request = replayClassificationRequest({ context,
          scene, relatedFacts,
          skills: currentPlayer.skills,ruleContext,
          state: { health: summary.health, turn: summary.turn,...runtime.recoveryState(),equipment:runtime.equipmentState() },
          directEffects: profile.directEffects === false ? [] : runtime.directEffectOptions,
          encounters: combat?.encounterOptions ?? [],
          scriptedOpportunityIds: runtime.scriptedOpportunityIds(),
          unsupported: baseline.definition.abilities.map(ability => ability.name) });
        const firstGenerationId = `901-classify-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        let generationId = firstGenerationId;
        let cancelled = false;
        const deadlineStops = new Set();
        const onStop = id => {
          if (id !== undefined && deadlineStops.has(id)) return;
          if (id === undefined || id === generationId) cancelled = true;
        };
        const stopListener = typeof eventOn === 'function' && tavern_events?.GENERATION_STOPPED
          ? eventOn(tavern_events.GENERATION_STOPPED, onStop) : null;
        // Keep the native generation blocked throughout this asynchronous hook.
        // A non-silent helper request re-enables native send controls on cleanup.
        const cancelParent = hostDocument.getElementById('leftSendForm');
        const cancelButton = cancelParent && hostDocument.createElement('button');
        if (cancelButton) {
          cancelButton.type = 'button';
          cancelButton.id = '901-classification-stop';
          cancelButton.className = 'menu_button';
          cancelButton.textContent = '停止判断';
          cancelButton.onclick = () => { cancelled = true; stopGenerationById(generationId); };
          cancelParent.append(cancelButton);
        }
        const stillCurrent = () => {
          stable();
          if (cancelled) throw Object.assign(new Error('Classification cancelled by user'), {code:'CLASSIFICATION_CANCELLED'});
        };
        mark('request_serialization');
        mark('request_constructed', { generationId,
          explicitRequestBytes: new TextEncoder().encode(JSON.stringify(request)).length });
        const started = performance.now();
        let inspected = false;
        const inspectMessages = data => {
            if (inspected || !Array.isArray(data.messages) ||
                !data.messages.some(message => String(message.content ?? '').includes('你是901行动分类器'))) return;
            inspected = true;
            const bytes = new TextEncoder().encode(JSON.stringify(data.messages)).length;
            mark('messages_assembled', { finalMessageCount: data.messages.length,
              finalMessageBytes: bytes });
            console.log('[901-REPLAY-GATE] classifier messages',
              JSON.stringify({ count: data.messages.length, bytes,
                roles: data.messages.map(message => message.role),
                elapsedToAssemblyMs: Math.round(performance.now() - started) }));
          };
        const listener = typeof eventOn === 'function' && tavern_events?.CHAT_COMPLETION_SETTINGS_READY
          ? eventOn(tavern_events.CHAT_COMPLETION_SETTINGS_READY, inspectMessages) : null;
        try {
          let decision;
          // Retry only an acknowledged deadline cancellation before any rule
          // result exists. A new ID isolates the abandoned request's cleanup.
          for (let attempt = 0; attempt < 2; attempt++) {
            stillCurrent();
            generationId = attempt ? `${firstGenerationId}-retry-1` : firstGenerationId;
            inspected = false;
            mark('request_dispatched', { generationId,
              classificationRequests: diagnostic.classificationRequests + 1 });
            try {
              decision = await classifyWithDeadline({ generateRaw:generateKnown,
                stopGenerationById: id => { deadlineStops.add(id); return stopGenerationById(id); },
                request, generationId, timeoutMs: profile.classificationTimeoutMs ?? 30000 });
              stillCurrent();
              break;
            } catch (error) {
              stillCurrent();
              if (attempt !== 0 || error?.code !== 'CLASSIFICATION_TIMEOUT' ||
                  error.stopResult !== true || !stopListener) throw error;
              mark('classification_timeout_retry', { classificationRecovery: {
                reason:'CLASSIFICATION_TIMEOUT', attempts:2,
                timeoutMs:profile.classificationTimeoutMs ?? 30000 } });
            }
          }
          try { lastDecision = parseReplayDecision(decision); }
          catch { lastDecision = null; }
          mark('response_received');
          console.log('[901-REPLAY-GATE] classifier complete',
            Math.round(performance.now() - started), 'ms');
          return decision;
        } catch (error) {
          const safe = safeFailure(error, diagnostic.stage);
          mark('classification_failed', { failureStage: diagnostic.stage, ...safe });
          throw error;
        } finally {
          cancelButton?.remove();
          listener?.stop();
          if (typeof eventRemoveListener === 'function' && tavern_events?.CHAT_COMPLETION_SETTINGS_READY)
            eventRemoveListener(tavern_events.CHAT_COMPLETION_SETTINGS_READY, inspectMessages);
          stopListener?.stop();
          if (typeof eventRemoveListener === 'function' && tavern_events?.GENERATION_STOPPED)
            eventRemoveListener(tavern_events.GENERATION_STOPPED, onStop);
        }
      },
      settle: async ({ context, operationId, request }) => {
        if(profile.directEffects===false&&request.kind==='direct_effect')
          return {status:'needs_input',missing:['当前场景未授权演示用无骰增益']};
          if (request.kind !== 'check' || request.actorId !== undefined)
             return runtime.settle({ operationId, request, context,ruleContext:trustedRuleContext });
        // A saved result takes precedence over a new choice, including after
        // narration failure or a regenerated assistant swipe.
        const saved = readTestOperation({ mvu, getAnchor, operationId });
        if (saved) return runtime.settle({ operationId, request });
        const prepared = runtime.prepareCheck(request);
        showPublicPool(prepared.publicBasis);
        if (!prepared.choices.length) return runtime.settle({ operationId, request });
        // Persist the adjudicated request BEFORE opening the modal: refresh can
        // interrupt the await without firing close. No dice or resource writes.
        pending = { original: context.original, operationId, request, localChoice: true };
        stable();
        // TavernHelper 4.11.2 applies `extra` only on the message/data update
        // branch. Supply the unchanged text; this edits no player action.
        await setChatMessages([{ message_id: player.messageId, message: player.text, extra: {
          ...SillyTavern.chat[player.messageId].extra,
          '901_replay_gate': { status: 'NEEDS_INPUT', operationId, pending },
        } }], { refresh: 'none' });
        if (JSON.stringify(SillyTavern.chat[player.messageId]?.extra?.['901_replay_gate']?.pending)
            !== JSON.stringify(pending)) throw new Error('Pending choice anchor was not saved');
        await createChatMessages([{ role: 'assistant',
          message: '检定等待本地选择；尚未投骰或消耗资源。',
          extra: { '901_replay_gate': { status: 'NEEDS_INPUT', operationId, pending } } }]);
        // TavernHelper's default message write is debounced. Flush before UI
        // yields to a refresh, not merely after its in-memory update.
        await SillyTavern.saveChat();
        stable();
        const choiceId = await chooseLocalOption(prepared.publicBasis, prepared.choices);
        stable();
        if (choiceId === null) return { status: 'needs_input', missing: ['玩家尚未完成本地检定选择；没有投骰或消耗'] };
        showPublicPool(runtime.prepareCheck(request, choiceId).publicBasis);
        return runtime.settle({ operationId, request, choiceId });
      },
      narrate: async (context, settled, decision) => {
        if(settled){
          mark('state_persistence');
          await persistTavernRuleState({mvu,tavern:SillyTavern,getAnchor,readSavedChat:profile.readSavedChat});
        }
        if (decision.status === 'NO_CHECK') {
          // Persist the validated decision on the player floor BEFORE generation:
          // native regeneration may remove the failure notice, and refresh can
          // interrupt the request without reaching catch.
          pending = { original: context.original, operationId: context.operationId,
            request: null, narrationDecision: decision };
          stable();
          await setChatMessages([{ message_id: player.messageId, message: player.text, extra: {
            ...SillyTavern.chat[player.messageId].extra,
            '901_replay_gate': { status: 'NARRATION_PENDING', operationId: context.operationId, pending },
          } }], { refresh: 'none' });
          await SillyTavern.saveChat();
          stable();
        }
        mark('continuation', { narrationRequests: diagnostic.narrationRequests + 1 });
        const currentScene=profile.sceneContext;
        const modelOptions=typeof profile.modelOptions==='function'?profile.modelOptions():profile.modelOptions;
        let prose;
        try { prose = await withReplayLorebook({
          book: getCurrentCharPrimaryLorebook(), books:profile.lorebooks,
          // This host build's stop handle removes the wrapper instead of the
          // original callback. Explicit removal prevents a filter escaping its request.
          eventOn:(event,listener)=>{eventOn(event,listener);return {stop:()=>eventRemoveListener(event,listener)};},
          event: tavern_events.WORLDINFO_ENTRIES_LOADED,
          eventRemoveListener,projectEntries:knowledge?entries=>knowledge.projectEntries(entries):undefined,
          generate: () => generateKnown({ ...model, ...modelOptions, user_input:
        `玩家行动：${context.original.text}\n` +
        (context.latest.messageId !== context.original.messageId ? `本次补充：${context.latest.text}\n` : '') +
        `裁定路径：${decision.status}\n` +
        (runtime.equipmentState()?`当前已保存装备状态：${JSON.stringify(runtime.equipmentState())}。物品仍在不等于仍在穿戴，按worn承接；旧回复不能恢复已卸下装备的效果。\n`:'')+
        (currentScene?`当前实际现场：${currentScene}\n开场背景与旧回复不能覆盖这份当前现场，未实际到场的人不能补入。\n`:'')+
        `规则事实：${settled?.kind === 'scripted_fortune'
          ? runtime.scriptedNarrationFacts(settled.operationId) : compactNarrationFacts(settled,settled?.kind==='recovery'?runtime.recoveryState():undefined)}\n` +
        (profile.narrationInstruction ?? '简短叙述帝都T0场景的即时反馈。') +
        '若有JS结果，必须遵守成败及数值；不得添加伤害、XP或资源变化。' +
        '不要公开骰值、成功数、DC、NPC数值或秘密修正。不得把原团后期事件当作重玩已发生，不替御临风选择新行动或心理。' }) });
        } catch (error) {
          mark('continuation_request_failed', { narrationErrorName: String(error?.name ?? 'Error').slice(0, 40) });
          throw error;
        }
        mark('continuation_response', { narrationResponseType: typeof prose,
          narrationResponseBytes: typeof prose === 'string' ? new TextEncoder().encode(prose).length : 0,
          narrationEmpty: typeof prose !== 'string' || !prose.trim(),
          narrationContainsVariableMarkup: typeof prose === 'string' &&
            /<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc|"op"\s*:\s*"(?:add|remove|replace)"/i.test(prose) });
        return prose;
      },
      post: async (message, meta) => {
        stable();
        const publicMeta = meta.status === 'APPLIED'
          ? { status: meta.status, operationId: meta.operationId, kind: meta.result?.kind }
          : { ...meta, ...(meta.pending && pending?.localChoice ? { pending } : {}) };
        await createChatMessages([{ role: 'assistant', message, extra: { '901_replay_gate': {
          ...publicMeta,
          ...(diagnostic.classificationRecovery ? {classificationRecovery:diagnostic.classificationRecovery} : {}),
          ...(debug ? { diagnostic: { ...diagnostic } } : {}) } } }]);
        if (meta.status === 'APPLIED' || meta.status === 'NO_CHECK') {
          const finalIndex = SillyTavern.chat.length - 1;
          await carryTestState({ mvu, expectedChatId,
            ...(meta.status === 'APPLIED' ? { operationId: meta.operationId } : {}),
            getSourceAnchor: getAnchor,
            getAnchor: () => ({ chatId: expectedChatId, messageId: finalIndex,
              swipeId: SillyTavern.chat[finalIndex]?.swipe_id ?? 0 }) });
          await setChatMessages([{ message_id: player.messageId, message: player.text, extra: {
            ...SillyTavern.chat[player.messageId].extra, '901_replay_gate': {
              ...publicMeta, completed: { status: meta.status, operationId: meta.operationId,
                playerText: player.text, message,
                meta: SillyTavern.chat[finalIndex].extra['901_replay_gate'] },
            },
          } }], { refresh: 'none' });
        }
        if(meta.status==='APPLIED'||meta.status==='NO_CHECK')
          await persistTavernRuleState({mvu,tavern:SillyTavern,readSavedChat:profile.readSavedChat});
        else await SillyTavern.saveChat();
        if(['APPLIED','NO_CHECK'].includes(meta.status)&&knowledge?.observeDialogue){
          const messageId=SillyTavern.chat.length-1,row=SillyTavern.chat[messageId];
          try{
            const status=await knowledge.observeDialogue({chatId:expectedChatId,messageId,swipeId:row.swipe_id??0,text:row.mes});
            await (profile.onKnowledgeStatus??(value=>showKnowledgeStatus(value,knowledge,resolveAndResume)))(status);
          }catch(error){
            // Prose is already saved. Extraction failure must not regenerate it or settle actions again.
            row.extra??={};row.extra['901_knowledge_status']={status:'unprocessed',reason:'dialogue-extraction-failed'};
            await SillyTavern.saveChat();await (profile.onKnowledgeStatus??(value=>showKnowledgeStatus(value,knowledge,resolveAndResume)))(row.extra['901_knowledge_status']);
          }
        }
      } });
    mark('complete');
    console.log('[901-REPLAY-GATE]', result.status, result.operationId);
  } catch (error) {
    if(handlingCombat&&combat?.handleFailure&&chatId()===expectedChatId&&await combat.handleFailure({player,error}))return;
    // Do not expose a private opportunity via error notices/debug chat text.
    // A committed result remains recoverable directly from its MVU operation.
    if (lastDecision?.request?.kind === 'scripted_fortune') return;
    const failureStage = diagnostic.failureStage ?? diagnostic.stage;
    mark('blocked', { failureStage,
      ...(diagnostic.reason ? { reason: diagnostic.reason, httpStatus: diagnostic.httpStatus }
        : safeFailure(error, failureStage)), ...failureDetails(error) });
    if (chatId() !== expectedChatId) return;
    const original = pending?.original ?? player;
    const operationId = `gm-runtime/${original.chatId}/${original.messageId}/${original.swipeId}`;
    let saved = null;
    try { saved = readTestOperation({ mvu, getAnchor,
      operationId }); }
    catch { /* no state on this branch */ }
    const narrationPending = !!saved || !!pending?.narrationDecision;
    const message = error?.code==='CHAT_PERSISTENCE_UNCONFIRMED'
      ? '规则状态仍在当前页面内存中，但聊天持久保存未确认；请保持页面并恢复本次操作，不要重复付费或重新投骰。'
      : saved
      ? '规则结果已保存，叙述尚未完成；请恢复本次操作，不要重新投骰。'
      : pending?.narrationDecision ? '行动已判定无需检定，叙述尚未完成；重新生成本条回复即可恢复，无需重复发送行动。'
      : error?.code === 'CLASSIFICATION_CANCELLED' ? '已停止消息处理；本轮没有执行规则结算。'
      : error?.code === 'CLASSIFICATION_TIMEOUT' ? '消息处理请求超时，尚未生成回复；本轮没有执行规则结算。可重新生成本条回复重试，或发送下一条消息继续。'
      : error?.code === 'INVALID_CHECK_ATTRIBUTE' ? '主持模型生成的检定属性不合法，本次尚未掷骰或结算，需要纠正判定输入。'
      : failureStage === 'response_parse' ? '消息处理返回的格式不完整，尚未生成回复；本轮没有执行规则结算。可重新生成本条回复重试，或发送下一条消息继续。'
      : '行动判断或规则输入未完成；本次行动尚未裁定，没有确定成败。';
    await createChatMessages([{ role: 'assistant', message: debug
      ? `${message}\n【隔离诊断：${diagnostic.failureStage} / ${diagnostic.reason}】` : message, extra: {
      '901_replay_gate': { status: narrationPending ? 'NARRATION_PENDING' : 'UNRESOLVED',
        operationId,
        pending: { original, operationId, request:
          (failureStage === 'response_parse' && !pending?.request) || (lastDecision?.request ?? pending?.request)?.actorId !== undefined
            ? null : lastDecision?.request ?? pending?.request ?? null,
          ...(pending?.narrationDecision ? { narrationDecision: pending.narrationDecision } : {}),
          ...(pending?.retryNoCheck ? { retryNoCheck: true } : {}) },
        diagnostic: { ...diagnostic } },
    } }]);
    if (saved) {
      const finalIndex = SillyTavern.chat.length - 1;
      try { await carryTestState({ mvu, expectedChatId,
        operationId,
        getSourceAnchor: getAnchor,
        getAnchor: () => ({ chatId: expectedChatId, messageId: finalIndex,
          swipeId: SillyTavern.chat[finalIndex]?.swipe_id ?? 0 }) }); }
      catch (carryError) { console.error('[901-REPLAY-GATE] saved result not carried', carryError); }
    }
    await SillyTavern.saveChat();
  } finally { running = false; }
};
eventMakeFirst(tavern_events.GENERATE_AFTER_DATA,handleTurn);
console.log('[901-REPLAY-GATE] pre-narration hook registered; readiness pending', chatId());
void (async () => {
  try {
    const readiness = readinessOf(await getMvu(), playerFloor());
    console.log('[901-REPLAY-GATE]', readiness.ready ? 'READY' : 'NOT_READY', readiness.missing);
  } catch (error) { console.warn('[901-REPLAY-GATE] NOT_READY', error?.message); }
})();
return {configureKnowledgeDialogue:adapter=>{if(running||combat?.busy)throw Error('Wait for current story operation');return knowledge.configureDialogue(adapter);},
 configureKnowledgeDialogueHost:({enabled=false,complete,useExistingHost=false,outputContract}={})=>{
  if(running||combat?.busy)throw Error('Wait for current story operation');
  if(!enabled)return knowledge.configureDialogue(null);
  if(useExistingHost&&complete)throw Error('Choose one dialogue completion source');
  knowledge.configureDialogue(createDialogueSemanticAdapter({outputContract,complete:useExistingHost?createTavernDialogueCompletion({generateRaw,eventOn,eventRemoveListener,event:tavern_events.CHAT_COMPLETION_SETTINGS_READY}):complete}));return {status:'enabled'};
 },
 dialogueQuestions:refs=>knowledge.dialogueQuestions(refs),
 resolveKnowledgeDialogue:resolveAndResume,
 receiveKnowledge:receipt=>{
  if(!knowledge)throw Error('Story knowledge is not configured');
  if(running||combat?.busy)throw Error('Wait for the current story operation before confirming knowledge');
  return knowledge.receive(receipt);
}};
}
