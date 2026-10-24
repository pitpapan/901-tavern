// A single pre-narration controller for an isolated chat. The caller must stop
// SillyTavern's ordinary generation before entering this function.
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const key = anchor => `gm-runtime/${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`;
const anchorValid = value => record(value) && typeof value.chatId === 'string' && !!value.chatId &&
  Number.isInteger(value.messageId) && value.messageId >= 0 &&
  Number.isInteger(value.swipeId) && value.swipeId >= 0 &&
  typeof value.text === 'string' && !!value.text.trim();
const safeProse = prose => typeof prose === 'string' && !!prose.trim() &&
  !/<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc|"op"\s*:\s*"(?:add|remove|replace)"/i.test(prose);
// Narrow independent guard for the concrete bypasses observed in the isolated
// chat. This is not a general natural-language risk classifier.
const explicitMechanicalRisk = text =>
  /攻击|挥剑|刺向|砍向|射击/.test(text) ||
  /(?:车流|疾驰.{0,4}马车).{0,12}(?:冲|穿|闯|越)|(?:冲|穿|闯|越).{0,12}(?:车流|疾驰.{0,4}马车)/.test(text) ||
  /(?:攀|爬).{0,12}(?:湿滑|城墙|外墙)|(?:湿滑|城墙|外墙).{0,12}(?:攀|爬)/.test(text);

// Filter the host's freshly loaded entry arrays BEFORE its normal activation,
// recursion and depth placement. Never mutate global book selections or entries.
export async function withReplayLorebook({ book, eventOn, event, generate }) {
  if (typeof book !== 'string' || !book || typeof eventOn !== 'function' || !event)
    throw new Error('901 character worldbook isolation unavailable');
  const listener = eventOn(event, lores => {
    for (const name of ['globalLore', 'characterLore', 'chatLore', 'personaLore']) {
      const entries = lores[name];
      // The host retains these array references after emitting the event.
      for (let i = entries.length - 1; i >= 0; i--)
        if (entries[i].world !== book) entries.splice(i, 1);
    }
  });
  try { return await generate(); }
  finally { listener.stop(); }
}

export function replayPendingFromChat(chat, player) {
  const meta = message => message?.extra?.['901_replay_gate'];
  const completed = entry => ['APPLIED', 'NO_CHECK'].includes(entry?.status);
  const recoverLegacy = pending => {
    if (pending.request !== null || pending.narrationDecision) return pending;
    // Older notices omitted the NO_CHECK decision. Only a recorded continuation
    // failure permits reclassification; an unresolved rule action stays blocked.
    const failedContinuation = chat.some(message => {
      const entry = meta(message);
      return entry?.status === 'UNRESOLVED' && entry.pending?.operationId === pending.operationId &&
        entry.pending?.original?.text === pending.original.text &&
        entry.diagnostic?.failureStage?.startsWith('continuation') &&
        entry.diagnostic.narrationRequests > 0;
    });
    return failedContinuation ? { ...pending, retryNoCheck: true } : pending;
  };
  for (let i = chat.length - 1; i > player.messageId; i--) {
    if (chat[i]?.extra?.['901_combat_return']?.operationId) return null;
    const entry = meta(chat[i]);
    if (completed(entry)) return null;
    if (entry?.pending?.original?.messageId === player.messageId &&
        entry.pending.original.swipeId === player.swipeId) return recoverLegacy(entry.pending);
  }
  const anchored = meta(chat[player.messageId]);
  if (completed(anchored)) return null;
  if (anchored?.pending?.original?.swipeId === player.swipeId &&
      anchored.pending.original.text === player.text) return recoverLegacy(anchored.pending);
  for (let i = player.messageId - 1; i >= 0; i--) {
    if (chat[i]?.is_user) break;
    if (chat[i]?.extra?.['901_combat_return']?.operationId) return null;
    const entry = meta(chat[i]);
    if (completed(entry)) return null;
    if (entry?.pending) return recoverLegacy(entry.pending);
  }
  return null;
}

// Read one actual scene response. Gate notices carry no scene facts, and the
// model's chat-history/scenario placeholders can bring unrelated injections.
export function replaySceneFromChat(chat, beforeMessageId) {
  if (!Array.isArray(chat) || !Number.isInteger(beforeMessageId)) return '';
  for (let i = Math.min(beforeMessageId - 1, chat.length - 1); i >= 0; i--) {
    const entry = chat[i];
    if (entry?.is_user || entry?.is_system || typeof entry?.mes !== 'string') continue;
    if (['UNRESOLVED', 'NEEDS_INPUT', 'NARRATION_PENDING'].includes(
      entry.extra?.['901_replay_gate']?.status)) continue;
    if (entry.mes.trim()) return entry.mes;
  }
  return '';
}

// TavernHelper supplies entries from the card's existing worldbook. Select
// only names actually stated in this action; the recent scene remains available
// to the classifier for pronouns without bulk-importing every name it contains.
export function relevantLorebookFacts(entries, { action = '', scene = '' } = {}) {
  if (!Array.isArray(entries) || typeof action !== 'string' || typeof scene !== 'string')
    throw new Error('Existing worldbook entries and action required');
  const cues = action;
  return entries.filter(entry => entry?.enabled && typeof entry.content === 'string' &&
    Array.isArray(entry.keys) && entry.keys.some(key => typeof key === 'string' &&
      key.length >= 2 && cues.includes(key))).map(entry => ({
    uid: entry.uid, title: entry.comment, content: entry.content }));
}

// This string is for the player's local UI only. Secret modifiers, DC, dice and
// NPC values are never accepted as fields of this display object.
export function playerCheckDisplay(basis) {
  if (!record(basis) || !record(basis.attribute) || !record(basis.mainSkill) ||
      !Number.isInteger(basis.publicSubtotal) || !Array.isArray(basis.publicModifiers))
    throw new Error('Public pool basis required');
  const terms = [`${basis.attribute.name} ${basis.attribute.value}`,
    `${basis.mainSkill.name} ${basis.mainSkill.value}`];
  if (basis.subSkill) terms.push(`${basis.subSkill.name} ${basis.subSkill.value}`);
  for (const item of basis.publicModifiers)
    terms.push(`${item.source} ${item.value >= 0 ? '+' : ''}${item.value}`);
  return `${terms.join(' ＋ ')}；可公开部分 ${basis.publicSubtotal} DP`;
}

export function compactNarrationFacts(result) {
  if (!record(result)) return '无需规则数值结算。';
  if (result.actorType === 'npc') return `NPC行动检定：${result.success ? '成功' : '失败'}；` +
    '只叙述可观察行为与后果，不公开数值，不新增伤害、加值或资源变化。' +
    (result.possibleMishap ? '可能的不利后果仍待裁定。' : '');
  if (result.kind === 'check')
    return `普通检定：${result.success ? '成功' : '失败'}；结果已由 JS 保存。` +
      (result.fortune && result.possibleMishap
        ? '机运首骰为 1；是否产生不利后果及具体后果待主持裁定。' : '');
  if (result.kind === 'direct_effect')
    return `无骰机械效果已由 JS 保存：${result.effectLabel}；作用至下一次匹配检定。`;
  return '规则结果已由 JS 保存；只叙述可感知后果。';
}

// Only this projection may be written to ordinary chat metadata. The saved MVU
// operation retains trusted mechanics for recovery and GM adjudication.
export function playerFacingResult(result) {
  if (!record(result) || result.visibility === 'secret' || result.actorType === 'npc') return {};
  return { status: result.status, kind: result.kind, operationId: result.operationId };
}

export function savedDecisionForRecovery(pending, saved) {
  if (saved?.summary?.kind === 'scripted_fortune' && saved.summary.status === 'applied') {
    const opportunityId = JSON.parse(saved.signature).spec?.runtimeRequestId;
    if (opportunityId) return { status: 'CHECK_REQUIRED', reason: '复用已保存的规则操作',
      request: { kind: 'scripted_fortune', opportunityId } };
  }
  if (saved?.summary?.actorType === 'npc' && saved.summary.status === 'applied') {
    const request = JSON.parse(saved.signature).checkInput?.npcRequest;
    if (request) return { status: 'CHECK_REQUIRED', reason: '复用已保存的NPC操作', request };
  }
  if (!pending?.request && saved?.summary?.status === 'applied' && typeof saved.signature === 'string') {
    const original = JSON.parse(saved.signature);
    if (original.actorId === 'player' && saved.summary.kind === 'check' && original.checkInput) {
      const { attribute, skill, sub, dc } = original.checkInput;
      return { status: 'CHECK_REQUIRED', reason: '复用已保存的规则操作',
        request: { kind: 'check', attribute, skill, ...(sub ? { sub } : {}), dc } };
    }
    if (original.actorId === 'player' && saved.summary.kind === 'direct_effect' && original.effect?.id)
      return { status: 'DIRECT_EFFECT', reason: '复用已保存的规则操作',
        request: { kind: 'direct_effect', effectId: original.effect.id } };
  }
  if (!record(pending?.request) || saved?.summary?.status !== 'applied') return null;
  const kind = pending.request.kind;
  if (kind !== saved.summary.kind) return null;
  const status = kind === 'direct_effect' ? 'DIRECT_EFFECT'
    : ['check', 'attack', 'genetic_unlock', 'scripted_fortune'].includes(kind) ? 'CHECK_REQUIRED' : null;
  return status ? { status, reason: '复用已保存的原操作', request: pending.request } : null;
}

export function replayClassificationRequest({ context, scene = '', skills = {}, state = null,
  unsupported = [], directEffects = [], relatedFacts = [], scriptedOpportunityIds = [], encounters = [] } = {}) {
  if (!anchorValid(context?.original) || !anchorValid(context?.latest) ||
      typeof scene !== 'string' || !record(skills)) throw new Error('Classification input required');
  const action = context.original.text;
  const supplement = context.pending && context.latest.messageId !== context.original.messageId
    ? `\n本次补充：${context.latest.text}` : '';
  const knownSkills = Object.entries(skills).filter(([, value]) => record(value) &&
    Number.isInteger(value.level)).map(([name, value]) => `${name}${value.level}`);
  const namedUnsupported = unsupported.filter(name => typeof name === 'string' &&
    name && action.includes(name));
  const system = '你是901行动分类器。分类玩家已声明的行动以及玩家明确要求启动的已登记事件；不要叙述成败或投骰。' +
    (encounters.length ? '先判断是否要求启动已登记战斗，包括玩家旁观的NPC对战。明确开始演练即COMBAT_REQUIRED；“我不参加”仅排除玩家参战，不否定其他人开战，不能据此返回NO_CHECK。只有明确不让演练开始才不启动。' : '') +
    '判断整条行动的实际后果，不因形式上是对话就忽略要求NPC改变决定的不确定目标。' +
    '识别出需要检定与具备可执行请求是两步：若角色输入或场景难度依据明确缺失，必须返回NEEDS_INPUT，不能自行填写dc；' +
    '只有这些输入齐备才返回带数值dc的CHECK_REQUIRED。只返回一个JSON对象。';
  const user_input = `玩家原始行动：${action}${supplement}\n` +
    `最近已叙述场景：${scene || '未提供；不可补造场景条件'}\n` +
    (relatedFacts.length ? `本次匹配的现有世界书资料（保留原文确定性与知情边界）：\n${relatedFacts.map(fact =>
      `[UID ${fact.uid} ${fact.title}] ${fact.content}`).join('\n')}\n` : '') +
    `可用普通技能：${knownSkills.join('、') || '未提供'}\n` +
    `当前规则状态摘要：${state ? JSON.stringify(state) : '未提供'}\n` +
    (encounters.length ? `当前宿主登记的遭遇：${JSON.stringify(encounters)}。玩家明确要求开始、参战或当前场景确已发生冲突时，可交给战斗接口；仅询问、谈论或否定开战不启动。不要将进场解释为已替玩家执行攻击。\n` : '') +
    (scriptedOpportunityIds.length ? `当前可信宿主授权的机运机会ID：${scriptedOpportunityIds.join('、')}。仅可选择这些ID，不可推测额外机会、改写骰制或公布秘密机会。\n` : '') +
    (directEffects.length ? `仅可提议的隔离无骰效果：${directEffects.map(effect =>
      `${effect.id}（${effect.label}，${effect.attribute}＋${effect.skill} ${effect.value > 0 ? '+' : ''}${effect.value}DP，仅下一次匹配检定）`).join('；')}\n` : '') +
    (namedUnsupported.length ? `已列明但尚未适配的能力：${namedUnsupported.join('、')}\n` : '') +
    '只返回JSON：{"status":"NO_CHECK","basis":"ordinary_dialogue|visible_fact|deterministic","reason":"理由"}；' +
    (encounters.length ? '{"status":"COMBAT_REQUIRED","reason":"当前触发依据","request":{"kind":"combat","encounterId":"已登记ID"}}；未登记战斗返回UNRESOLVED，不自造角色数值；' : '') +
    (directEffects.length ? '{"status":"DIRECT_EFFECT","reason":"场景依据","request":{"kind":"direct_effect","effectId":"已列ID"}}；' : '') +
    'CHECK_REQUIRED 的普通检定 request 须为 {"kind":"check","attribute":"六属性名","skill":"已列主技能名","dc":整数}，dc 只能是有当前场景依据的 1 至 10 整数，不能从示例推定默认值；' +
    (scriptedOpportunityIds.length ? '{"status":"CHECK_REQUIRED","reason":"已授权机会","request":{"kind":"scripted_fortune","opportunityId":"已列ID"}}；' : '') +
    '{"status":"NEEDS_INPUT","reason":"缺项"}；或{"status":"UNRESOLVED","reason":"需主持裁定"}。' +
    '先看整条行动：复合行动中只要有一个具机械风险的子动作，就不能用寒暄等无风险部分将整条判为NO_CHECK；只为需要结算的子动作提出一次请求。' +
    '普通对话、明确可见事实或依据已知条件能确定的成功／拒绝／前提不成立，可选NO_CHECK；说明具体依据，不得更改规则数值。' +
    '人物卡未列技艺不等于不会；已知训练与实践可支持有限普通操作，玩家与NPC同准，行动重要性不改变资格；不得补造经历、专有资源效果或数值。' +
    '有失败后果或重要不确定性时优先识别普通检定；缺少目标、距离、角色输入或难度依据时选NEEDS_INPUT并指出真正缺项，不编造dc；缺少受支持的机械结算接口时选UNRESOLVED。' +
    '不可编造场景事实、投骰、伤害、XP或未列技能等级。';
  return { should_stream: false, should_silence: true,
    ordered_prompts: [{ role: 'system', content: system }, 'user_input'],
    max_chat_history: 0, user_input };
}

export async function classifyWithDeadline({ generateRaw, stopGenerationById, request,
  generationId, timeoutMs = 30000 } = {}) {
  if (typeof generateRaw !== 'function' || typeof stopGenerationById !== 'function' ||
      !record(request) || typeof generationId !== 'string' || !generationId ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1)
    throw new Error('Bounded classification dependencies required');
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      let stopResult = null;
      try { stopResult = stopGenerationById(generationId); }
      catch { /* The deadline still closes this turn if host cancellation fails. */ }
      const error = new Error(`Classification deadline exceeded (${timeoutMs} ms)`);
      error.code = 'CLASSIFICATION_TIMEOUT';
      error.stopResult = stopResult;
      reject(error);
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      Promise.resolve().then(() => generateRaw({ ...request, generation_id: generationId })),
      deadline,
    ]);
  } finally { clearTimeout(timer); }
}

export function replayGateReadiness({ mvu, chatId, player, generateRaw,
  createChatMessages, stopGeneration, stopGenerationById, createRuleRuntime } = {}) {
  const missing = [];
  if (typeof mvu?.getMvuData !== 'function' || typeof mvu?.replaceMvuData !== 'function') missing.push('MVU');
  if (typeof createRuleRuntime !== 'function') missing.push('rule runtime');
  if (typeof generateRaw !== 'function') missing.push('GM generation');
  if (typeof stopGenerationById !== 'function') missing.push('classification cancellation');
  if (typeof createChatMessages !== 'function' || typeof stopGeneration !== 'function') missing.push('gate host API');
  if (typeof chatId !== 'string' || !chatId || !anchorValid(player) || player.chatId !== chatId)
    missing.push('player anchor');
  return { ready: missing.length === 0, missing };
}

export function parseReplayDecision(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const fence = /^```(?:json)?[ \t]*\r?\n([\s\S]*?)\r?\n```$/i.exec(trimmed);
  try { return JSON.parse(fence ? fence[1] : trimmed); }
  catch { throw new Error('Invalid structured decision JSON'); }
}

function decisionOf(value) {
  value = parseReplayDecision(value);
  if (!record(value) || !['NO_CHECK', 'DIRECT_EFFECT', 'CHECK_REQUIRED', 'COMBAT_REQUIRED', 'NEEDS_INPUT', 'UNRESOLVED'].includes(value.status) ||
      typeof value.reason !== 'string' || !value.reason.trim() || value.reason.length > 300)
    throw new Error('Invalid structured decision');
  if (value.status === 'NO_CHECK') {
    if (!['ordinary_dialogue', 'visible_fact', 'deterministic'].includes(value.basis))
      throw new Error('NO_CHECK needs a supported basis');
    if ('request' in value) throw new Error('NO_CHECK cannot carry a rule request');
  } else if (value.status === 'COMBAT_REQUIRED') {
    if (!record(value.request) || value.request.kind !== 'combat' ||
        typeof value.request.encounterId !== 'string' || !value.request.encounterId.trim() ||
        Object.keys(value.request).some(key => !['kind','encounterId'].includes(key)))
      throw new Error('Combat decision requires a registered encounter ID');
  } else if (value.status === 'DIRECT_EFFECT') {
    if (!record(value.request) || value.request.kind !== 'direct_effect' ||
        typeof value.request.effectId !== 'string' || !value.request.effectId ||
        Object.keys(value.request).some(key => !['kind', 'effectId'].includes(key)))
      throw new Error('DIRECT_EFFECT needs a supported direct effect request');
  } else if (value.status === 'CHECK_REQUIRED') {
    const request = value.request;
    if (!record(request) || !['check', 'attack', 'genetic_unlock', 'scripted_fortune'].includes(request.kind))
      throw new Error('CHECK_REQUIRED needs a rule request');
    if (request.kind === 'scripted_fortune' &&
        (typeof request.opportunityId !== 'string' || !request.opportunityId.trim() ||
         Object.keys(request).some(key => !['kind', 'opportunityId'].includes(key))))
      throw new Error('Scripted fortune requires only a trusted opportunity ID');
    if (request.kind === 'check' &&
        (!['力量', '敏捷', '智力', '感知', '意志', '风度'].includes(request.attribute) ||
        typeof request.skill !== 'string' || !request.skill.trim() ||
        !Number.isInteger(request.dc) || request.dc < 1 || request.dc > 10))
      throw new Error('Incomplete check request');
    if (request.kind === 'genetic_unlock' &&
        (![1, 2].includes(request.stage) || typeof request.opportunityId !== 'string' ||
         !request.opportunityId.trim() || Object.keys(request).some(key =>
           !['kind', 'stage', 'opportunityId', 'roleplayModifier'].includes(key))))
      throw new Error('Incomplete genetic unlock request');
  } else if ('request' in value) throw new Error('Unsettled decision cannot carry a rule request');
  return value;
}

export async function runGuardedTurn({ player, pending = null, classify, settle, narrate, post,
  ensureStable = () => {}, onStage = () => {}, enterCombat } = {}) {
  if (!anchorValid(player) || pending !== null &&
      (!record(pending) || !anchorValid(pending.original) ||
       pending.original.chatId !== player.chatId || pending.original.messageId > player.messageId ||
       pending.operationId !== key(pending.original)))
    throw new Error('Current player or pending action anchor invalid');
  if ([classify, settle, narrate, post, ensureStable, onStage].some(fn => typeof fn !== 'function'))
    throw new Error('Guarded turn callbacks required');
  const original = pending?.original ?? player;
  const operationId = key(original);
  const context = { original, latest: player, operationId, pending: !!pending };
  const savedNarrationDecision = pending?.narrationDecision ? decisionOf(pending.narrationDecision) : null;
  if (savedNarrationDecision && (savedNarrationDecision.status !== 'NO_CHECK' || pending.request !== null))
    throw new Error('Invalid saved narration decision');
  const narrationRetry = !!savedNarrationDecision || pending?.retryNoCheck === true && pending.request === null;
  if (narrationRetry && player.text !== original.text)
    throw new Error('Recover pending narration before a different action');
  onStage(savedNarrationDecision ? 'narration_recovery' : 'classification');
  const rawDecision = savedNarrationDecision ?? await classify(context);
  onStage('response_parse');
  const decision = decisionOf(rawDecision);
  onStage('gate_validation');
  ensureStable();
  if (decision.status === 'COMBAT_REQUIRED') {
    if (typeof enterCombat !== 'function') throw new Error('Combat host unavailable');
    onStage('combat_handoff');
    const result = await enterCombat({context,request:decision.request});
    return {status:'COMBAT_HANDLED',operationId,result};
  }
  if (pending && decision.status === 'NO_CHECK' && !narrationRetry)
    throw new Error('A pending action cannot silently become NO_CHECK');
  if (decision.status === 'NO_CHECK' && explicitMechanicalRisk(original.text))
    throw new Error('Explicit mechanical risk cannot use NO_CHECK');
  const pendingMeta = { original, operationId, request: decision.request ?? pending?.request ?? null };
  // A pending NPC request contains private DC/modifier selectors. Keep it in
  // trusted execution context, never ordinary chat metadata; saved operations
  // supply the complete request for post-commit recovery.
  const publicPending = pendingMeta.request?.actorId !== undefined || pendingMeta.request?.kind === 'scripted_fortune'
    ? { original, operationId, request: null } : pendingMeta;
  if (decision.status === 'NEEDS_INPUT' || decision.status === 'UNRESOLVED') {
    onStage('state_persistence');
    await post('这项行动尚未裁定；没有确定成功、失败或机械后果。请补齐必要信息。',
      { status: decision.status, operationId, pending: publicPending, missing: decision.missing ?? [decision.reason] });
    return { status: decision.status, operationId, pending: pendingMeta };
  }
  if (decision.status === 'NO_CHECK') {
    onStage('continuation');
    const prose = await narrate(context, null, decision);
    ensureStable();
    if (!safeProse(prose)) throw new Error('Unsafe or empty narration');
    onStage('state_persistence');
    await post(prose, { status: 'NO_CHECK', operationId, basis: decision.basis });
    return { status: 'NO_CHECK', operationId, basis: decision.basis };
  }
  onStage('settlement');
  const result = await settle({ context, operationId, request: decision.request, decision });
  ensureStable();
  if (!record(result) || !['applied', 'already_applied'].includes(result.status)) {
    const status = result?.status === 'needs_input' ? 'NEEDS_INPUT' : 'UNRESOLVED';
    // An unresolved or duplicate hidden opportunity must not announce its
    // existence through the ordinary failure notice or pending metadata.
    if (decision.request.kind === 'scripted_fortune')
      return { status, operationId, pending: publicPending };
    const missing = result?.actorType === 'npc'
      ? ['NPC行动尚缺可信输入或受支持的结算路径。']
      : Array.isArray(result?.missing) ? result.missing : [decision.reason];
    onStage('state_persistence');
    await post('这项行动尚未裁定；没有确定成功、失败或机械后果。请补齐必要信息。',
      { status, operationId, pending: publicPending, missing });
    return { status, operationId, pending: pendingMeta, missing };
  }
  if (result.operationId !== operationId) throw new Error('Settled operation ID differs from player action');
  // Narration can fail after a confirmed save. Retry must use the same operation ID;
  // the settle callback is responsible for reading the saved operation before dice.
  onStage('continuation');
  const prose = await narrate(context, result, decision);
  ensureStable();
  if (!safeProse(prose)) throw new Error('Unsafe or empty narration');
  onStage('state_persistence');
  await post(prose, { status: 'APPLIED', operationId, result: playerFacingResult(result) });
  return { status: 'APPLIED', operationId, result };
}
