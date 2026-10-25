import {ruleRequestValid} from './rule-actions.mjs';
import {ruleActionInstructions} from './rule-reference.mjs';
// A single pre-narration controller for an isolated chat. The caller must stop
// SillyTavern's ordinary generation before entering this function.
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const CHECK_ATTRIBUTES = Object.freeze(['力量', '敏捷', '智力', '感知', '意志', '风度']);
const key = anchor => `gm-runtime/${anchor.chatId}/${anchor.messageId}/${anchor.swipeId}`;
const anchorValid = value => record(value) && typeof value.chatId === 'string' && !!value.chatId &&
  Number.isInteger(value.messageId) && value.messageId >= 0 &&
  Number.isInteger(value.swipeId) && value.swipeId >= 0 &&
  typeof value.text === 'string' && !!value.text.trim();
const safeProse = prose => typeof prose === 'string' && !!prose.trim() &&
  !/<\/?(?:jsonpatch|mvu|update)\b|901_rules_poc|"op"\s*:\s*"(?:add|remove|replace)"/i.test(prose);

export function validRecoveryRequest(request) {
  if(!record(request)||request.kind!=='recovery')return false;
  if(request.type==='sequence')return Object.keys(request).every(k=>['kind','type','steps'].includes(k))&&
    Array.isArray(request.steps)&&request.steps.length>=2&&request.steps.every(step=>record(step)&&
      step.kind===undefined&&step.type!=='sequence'&&validRecoveryRequest({kind:'recovery',...step}));
  const allowed={medicine:['kind','type','medicine','resource','choice','statusIndex'],
    rest:['kind','type','rest','minutes','attribute','statusIndex'],meditate:['kind','type','minutes','resource']};
  if(!allowed[request.type]||Object.keys(request).some(k=>!allowed[request.type].includes(k)))return false;
  if(request.type==='medicine')return ['雪莲子','培元丹','药A','药B','药C','雷霆药剂'].includes(request.medicine)&&
    (request.choice===undefined||['heal','status'].includes(request.choice))&&
    (request.statusIndex===undefined||Number.isInteger(request.statusIndex)&&request.statusIndex>=0)&&
    (request.resource===undefined||typeof request.resource==='string'&&!!request.resource);
  if(request.attribute!==undefined&&!['力量','敏捷','智力','感知','意志','风度'].includes(request.attribute))return false;
  if(request.statusIndex!==undefined&&(!Number.isInteger(request.statusIndex)||request.statusIndex<0))return false;
  return Number.isInteger(request.minutes)&&(request.type==='rest'
    ? request.rest==='short'&&request.minutes===15||request.rest==='long'&&request.minutes===480
    : request.minutes>=15&&request.minutes%15===0);
}

// A classifier selects a supported request; only the player's own execution
// declaration authorizes it. Mere discussion, negation and future plans do not.
function matchesRecoveryDeclaration(request,text,state={}) {
  if(!validRecoveryRequest(request)||typeof text!=='string')return false;
  const action=request.type==='medicine'?'服用|服下|服药|吞服|吞下|吃下|吃掉|喝下|饮下|使用':
    request.type==='rest'?'短休|长休|休息|睡眠|睡觉':'打坐|冥想';
  const negated=new RegExp(`(?:不|未|没有|别|勿|取消|暂缓|打算|准备|如果|要是)(?:再|要|会|曾)?\\s*.{0,8}(?:${action})`);
  const clauses=text.split(/[。！!；;\n，,]|但是|不过|但/).filter(s=>s.trim()&&
    !/[？?]|能否|可否|是否|能不能/.test(s)&&!negated.test(s));
  const positive=clauses.join('；');
  if(request.resource){const escaped=request.resource.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    if(new RegExp(`(?:${escaped}).{0,8}(?:不|别|勿|暂缓|取消).{0,4}(?:恢复|回满|回补)|(?:不|别|勿|暂缓|取消).{0,8}(?:恢复|回满|回补).{0,4}${escaped}`).test(text))return false;
  }
  const asNumber=value=>{
    if(/^\d+$/.test(value))return Number(value);
    const digits={零:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9};
    if(value.includes('十')){const [tens,units]=value.split('十');return (tens?digits[tens]:1)*10+(units?digits[units]:0);}
    return digits[value];
  };
  const durations=s=>[...s.matchAll(/(\d+|[零一二两三四五六七八九十]+)\s*(?:个)?\s*(分钟|小时)/g)]
    .map(([,n,unit])=>asNumber(n)*(unit==='小时'?60:1));
  if(request.type==='medicine') {
    if(!clauses.some(s=>s.includes(request.medicine)&&/服用|服下|服药|吞服|吞下|吃下|吃掉|喝下|饮下|使用/.test(s)))return false;
    if(request.resource&&!positive.includes(request.resource))return false;
    if(request.choice==='heal'&&!/疗伤|治疗|恢复.{0,8}伤|移除.{0,8}伤/.test(positive))return false;
    if(request.choice==='status') {
      const status=state.statuses?.[request.statusIndex];
      if(!status||!positive.includes(status.type)||!/移除|解除|消除/.test(positive))return false;
    }
    return true;
  }
  if(request.attribute&&!positive.includes(request.attribute))return false;
  if(request.statusIndex!==undefined&&!positive.includes(state.statuses?.[request.statusIndex]?.type??'\u0000'))return false;
  if(request.type==='rest')return clauses.some(s=>(request.rest==='short'
    ? /短休(?:息)?|休息\s*(?:15|十五)\s*分钟/.test(s)
    : /长休(?:息)?|(?:休息|睡眠|睡觉)\s*(?:8|八)\s*(?:个)?小时/.test(s))&&
    durations(s).every(minutes=>minutes===request.minutes));
  return /打坐|冥想/.test(positive)&&durations(positive).length>0&&durations(positive).every(minutes=>minutes===request.minutes)&&
    (!request.resource||positive.includes(request.resource));
}

// Keep every occurrence in textual order, including two doses of the same drug.
// This authorizes a classifier's selectors; it never chooses medicine options.
function recoveryDeclarations(text) {
  if(typeof text!=='string')return [];
  const declarations=[],use=/服用|服下|服药|吞服|吞下|吃下|吃掉|喝下|饮下|使用/;
  for(const sentence of text.split(/[。！!；;\n]/)) {
    if(/[？?]|能否|可否|是否|能不能|如果|要是|打算|准备/.test(sentence))continue;
    for(const clause of sentence.split(/[，,]|但是|不过|但/)) {
      const tokens=[...clause.matchAll(/雪莲子|培元丹|药A|药B|药C|雷霆药剂|短休(?:息)?|长休(?:息)?|休息|睡眠|睡觉|打坐|冥想/g)];
      for(let i=0;i<tokens.length;i++) {
        const token=tokens[i],start=i?tokens[i-1].index+tokens[i-1][0].length:0;
        let quote=clause.slice(start,tokens[i+1]?.index??clause.length),request;
        if(/雪莲子|培元丹|药[ABC]|雷霆药剂/.test(token[0])) {
          if(!use.test(clause.slice(start,token.index+1))) {
            if(!i||!/^\s*(?:和|及|与|、)\s*$/.test(clause.slice(start,token.index))||!use.test(clause.slice(0,token.index)))continue;
            quote='服用'+quote;
          }
          request={kind:'recovery',type:'medicine',medicine:token[0]};
        } else if(/打坐|冥想/.test(token[0])) {
          // Duration/options are checked against the classifier step below.
          if(!/不|未|没有|别|勿|取消|暂缓/.test(clause.slice(start,token.index)))
            declarations.push({type:'meditate',quote});
          continue;
        } else {
          const rest=/短休/.test(token[0])||/(?:15|十五)\s*分钟/.test(quote)?'short':'long';
          request={kind:'recovery',type:'rest',rest,minutes:rest==='short'?15:480};
        }
        if(matchesRecoveryDeclaration(request,quote))declarations.push({...request,quote});
      }
    }
  }
  return declarations;
}
export function explicitRecoveryDeclaration(request,text,state={},supplement='') {
  if(!validRecoveryRequest(request))return false;
  // A concise answer may supply selectors for the pending declaration, but it
  // cannot contribute another execution or change the original ordered shape.
  if(supplement&&recoveryDeclarations(supplement).length)return false;
  const declared=recoveryDeclarations(text),steps=request.type==='sequence'?request.steps:[request];
  return declared.length===steps.length&&steps.every((step,i)=>{
    const action=declared[i];
    return step.type===action.type&&(step.type!=='medicine'||step.medicine===action.medicine)&&
      (step.type!=='rest'||step.rest===action.rest)&&matchesRecoveryDeclaration({kind:'recovery',...step},
        [steps.length===1?text:action.quote,supplement].filter(Boolean).join('；'),state);
  });
}
export function recoveryDeclarationOrderMatches(request,text) {
  const declared=recoveryDeclarations(text);
  if(!declared.length)return true;
  const bare=step=>Object.fromEntries(['type','medicine','rest','minutes'].filter(key=>step[key]!==undefined).map(key=>[key,step[key]]));
  return explicitRecoveryDeclaration(request.type==='sequence'?{kind:'recovery',type:'sequence',steps:request.steps.map(bare)}:
    {kind:'recovery',...bare(request)},text);
}
const recoveryDeclarationCount=text=>recoveryDeclarations(text).length;
export const multipleRecoveryDeclarations=text=>recoveryDeclarationCount(text)>1;
// Narrow independent guard for the concrete bypasses observed in the isolated
// chat. This is not a general natural-language risk classifier.
const explicitMechanicalRisk = text =>
  /攻击|挥剑|刺向|砍向|射击/.test(text.replace(
    /(?:不|没(?:有)?|未|勿|别)(?:再|会|要|打算|准备|进行|发动|作|做)*\s*(?:攻击|挥剑|刺向|砍向|射击)/g, '')) ||
  /(?:车流|疾驰.{0,4}马车).{0,12}(?:冲|穿|闯|越)|(?:冲|穿|闯|越).{0,12}(?:车流|疾驰.{0,4}马车)/.test(text) ||
  /(?:攀|爬).{0,12}(?:湿滑|城墙|外墙)|(?:湿滑|城墙|外墙).{0,12}(?:攀|爬)/.test(text);

const explicitPendingCancellation = (text, quote) => typeof quote === 'string' && quote.length >= 4 &&
  quote.length <= 120 && text.includes(quote) && quote.split(/[。！!；;\n]/).some(fragment =>
    /暂不执行|取消|撤回|放弃/.test(fragment) && text.split(/[。！!；;\n]/).some(clause => clause.includes(fragment) &&
      !/[？?]|(?:不|不要|别|勿|未|没有)(?:再|要)?(?:取消|撤回|放弃)/.test(clause)));

// Filter the host's freshly loaded entry arrays BEFORE its normal activation,
// recursion and depth placement. Never mutate global book selections or entries.
export function replayLorebookNames({book,books=[]}) {
  if(typeof book!=='string'||!book||!Array.isArray(books)||books.some(name=>typeof name!=='string'||!name))
    throw new Error('901 character worldbook isolation unavailable');
  return [...new Set([book,...books])];
}

export async function withReplayLorebook({ book, books, eventOn, event, generate }) {
  const allowed=new Set(replayLorebookNames({book,books}));
  if (typeof eventOn !== 'function' || !event)
    throw new Error('901 character worldbook isolation unavailable');
  const listener = eventOn(event, lores => {
    for (const name of ['globalLore', 'characterLore', 'chatLore', 'personaLore']) {
      const entries = lores[name];
      // The host retains these array references after emitting the event.
      for (let i = entries.length - 1; i >= 0; i--)
        if (!allowed.has(entries[i].world)) entries.splice(i, 1);
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
// explicit action/current scene names and constant rules. Loading facts never
// grants resources or makes a person present.
export function relevantLorebookFacts(entries, { action = '', scene = '' } = {}) {
  if (!Array.isArray(entries) || typeof action !== 'string' || typeof scene !== 'string')
    throw new Error('Existing worldbook entries and action required');
  const cues = `${action}\n${scene}`;
  return entries.filter(entry => entry?.enabled && typeof entry.content === 'string' &&
    (entry.constant===true||entry.type==='constant'||Array.isArray(entry.keys) && entry.keys.some(key => typeof key === 'string' &&
      key.length >= 2 && cues.includes(key)))).map(entry => ({
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

export function compactNarrationFacts(result,currentState) {
  if(result?.prevented||result?.result?.prevented)return `行动前力量检定失败，人物陷入昏迷；原本声明的行动没有执行。不得把这次检定写成原行动的成败。`;
  if(result?.kind==='rule')return `已由JS保存的规则结果：${JSON.stringify(result.result)}。只叙述已结算成败与实际后果，不公开骰值、DC、NPC数值或秘密，不追加玩家动作。`;
  if (!record(result)) return '无需规则数值结算。';
  if(result.kind==='recovery') {
    const recovery=result.result;
    const waiting=recovery?.type==='medicine'&&recovery.pending?.some(p=>p.medicine===recovery.medicine);
    const remaining=currentState?.health&&Object.entries({B:'冲击伤害',L:'严重伤害',A:'恶性伤害'})
      .filter(([key])=>currentState.health[key]>0).map(([,label])=>label);
    const condition=remaining?(remaining.length?`结算后仍有${remaining.join('、')}，余伤没有痊愈；不得写成伤痛尽消或身体完全恢复。`:'结算后已没有这三类生命伤害。'):'';
    const energy=Object.entries(currentState?.resources??{}).map(([name,pool])=>`${name}${pool.current===0?'目前为空':pool.current===pool.max?'目前已回满':'仍有存量，但尚未回满'}`).join('；');
    return `玩家明确声明的恢复操作已保存：${JSON.stringify(recovery)}。`+
      (recovery?.type==='sequence'?`按玩家顺序叙述已完成的动作：${recovery.steps.map(step=>step.type==='medicine'?`服用${step.medicine}`:step.type==='rest'?step.rest==='long'?'长休':'短休':'打坐').join('，然后')}。各步骤中的pending只是当时的中间状态；药效是否仍待休息只看整个序列最终pending：${JSON.stringify(recovery.pending)}。后续休息已结算的药效须描述实际恢复，不能沿用服药步骤的尚未生效。`:'')+
      (waiting?'本次只服下药品并扣除库存，伤势和异常状态没有改善。药效要等所需休息完成后才生效。正文只写服药过程及目前仍有的伤势；不得描写药力已经化解重创、疼痛减轻、呼吸改善或行动恢复。':
        '只叙述记录中实际发生的恢复，不因服药就宣告所有伤势痊愈。')+
      condition+(energy?`当前能量：${energy}。不要虚构此前已经耗尽，也不要把部分恢复写成回满。`:'')+
      '数字和库存留在自身MVU界面；不附状态面板，不增加休息、恢复或新行动。';
  }
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
  if(saved?.summary?.kind==='rule'&&saved.summary.status==='applied')return {status:'CHECK_REQUIRED',reason:'复用已保存规则操作',request:JSON.parse(saved.signature).request};
  if(saved?.summary?.kind==='recovery'&&saved.summary.status==='applied') {
    const original=JSON.parse(saved.signature);
    if(original.actorId==='player'&&original.command)return {status:'RECOVERY_REQUIRED',reason:'复用已保存的恢复操作',
      request:{kind:'recovery',...original.command}};
  }
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
      const { attribute, skill, sub, dc, purpose, preActionDC } = original.checkInput;
      return { status: 'CHECK_REQUIRED', reason: '复用已保存的规则操作',
        request: { kind: 'check', attribute, skill, ...(sub ? { sub } : {}), ...(purpose ? {purpose} : {}), ...(preActionDC!==undefined?{preActionDC}:{}), dc } };
    }
    if (original.actorId === 'player' && saved.summary.kind === 'direct_effect' && original.effect?.id)
      return { status: 'DIRECT_EFFECT', reason: '复用已保存的规则操作',
        request: { kind: 'direct_effect', effectId: original.effect.id } };
  }
  if (!record(pending?.request) || saved?.summary?.status !== 'applied') return null;
  const kind = pending.request.kind;
  if (kind !== saved.summary.kind) return null;
  const status = kind === 'recovery' ? 'RECOVERY_REQUIRED' : kind === 'direct_effect' ? 'DIRECT_EFFECT'
    : ['check', 'attack', 'genetic_unlock', 'scripted_fortune'].includes(kind) ? 'CHECK_REQUIRED' : null;
  return status ? { status, reason: '复用已保存的原操作', request: pending.request } : null;
}

export function replayClassificationRequest({ context, scene = '', skills = {}, state = null,
  unsupported = [], directEffects = [], relatedFacts = [], scriptedOpportunityIds = [], encounters = [],ruleContext={} } = {}) {
  if (!anchorValid(context?.original) || !anchorValid(context?.latest) ||
      typeof scene !== 'string' || !record(skills)) throw new Error('Classification input required');
  const action = context.original.text;
  const supplement = context.pending && context.latest.messageId !== context.original.messageId
    ? `\n本次补充：${context.latest.text}` : '';
  const knownSkills = Object.entries(skills).filter(([, value]) => record(value) &&
    Number.isInteger(value.level)).map(([name, value]) => `${name}${value.level}`+
      (Object.keys(value.subs??{}).length?`（子技能：${Object.entries(value.subs).map(([n,s])=>`${n}${s.level}`).join('、')}）`:''));
  const namedUnsupported = unsupported.filter(name => typeof name === 'string' &&
    name && action.includes(name));
  const system = '你是901行动分类器。分类玩家已声明的行动以及玩家明确要求启动的已登记事件；不要叙述成败或投骰。' +
    `普通检定的attribute只能从这六个属性中选择：${CHECK_ATTRIBUTES.join('、')}。skill从下列普通技能中另选；社交是技能，不是属性，不能填写attribute:"社交"。` +
    '玩家的攻击、移动、防御、技能使用及判定，必须由玩家明确声明相应行动触发。不可把凝视、语气、站姿等扮演细节自行扩成侦察、威吓、备战或技能检定。' +
    (encounters.length ? '先判断是否要求启动已登记战斗，包括玩家旁观的NPC对战。明确开始演练即COMBAT_REQUIRED；“我不参加”仅排除玩家参战，不否定其他人开战，不能据此返回NO_CHECK。只有明确不让演练开始才不启动。' : '') +
    '判断整条行动的实际后果，不因形式上是对话就忽略要求NPC改变决定的不确定目标。' +
    '识别出需要检定与具备可执行请求是两步：若角色输入或场景难度依据明确缺失，必须返回NEEDS_INPUT，不能自行填写dc；' +
    '对受支持的普通固定难度检定，你同时承担主持裁定职责：自然场景条件充分时可自主设定DC，不要求玩家先提供数字；关键条件未知才询问缺项。' +
    '只有这些输入齐备才返回带数值dc的CHECK_REQUIRED。只返回一个JSON对象。所有路径必须有status和reason；reason为1至300字的简短理由。request只能放在这个完整对象内，不能单独返回。';
  const user_input = `玩家原始行动：${action}${supplement}\n` +
    `最近已叙述场景：${scene || '未提供；不可补造场景条件'}\n` +
    (relatedFacts.length ? `本次匹配的现有世界书资料（保留原文确定性与知情边界）：\n${relatedFacts.map(fact =>
      `[UID ${fact.uid} ${fact.title}] ${fact.content}`).join('\n')}\n` : '') +
    `${ruleActionInstructions({...ruleContext,topics:action+' '+scene})}\n可用普通技能：${knownSkills.join('、') || '未提供'}\n` +
    `当前规则状态摘要：${state ? JSON.stringify(state) : '未提供'}\n` +
    (encounters.length ? `当前宿主登记的遭遇：${JSON.stringify(encounters)}。玩家明确要求开始、参战或当前场景确已发生冲突时，可交给战斗接口；仅询问、谈论或否定开战不启动。不要将进场解释为已替玩家执行攻击。\n` : '') +
    (scriptedOpportunityIds.length ? `当前可信宿主授权的机运机会ID：${scriptedOpportunityIds.join('、')}。仅可选择这些ID，不可推测额外机会、改写骰制或公布秘密机会。\n` : '') +
    (directEffects.length ? `仅可提议的隔离无骰效果：${directEffects.map(effect =>
      `${effect.id}（${effect.label}，${effect.attribute}＋${effect.skill} ${effect.value > 0 ? '+' : ''}${effect.value}DP，仅下一次匹配检定）`).join('；')}\n` : '') +
    (namedUnsupported.length ? `已列明但尚未适配的能力：${namedUnsupported.join('、')}\n` : '') +
    '只返回JSON：{"status":"NO_CHECK","basis":"ordinary_dialogue|visible_fact|deterministic","reason":"理由"}；' +
    (encounters.length ? '{"status":"COMBAT_REQUIRED","reason":"当前触发依据","request":{"kind":"combat","encounterId":"已登记ID"}}；未登记战斗返回UNRESOLVED，不自造角色数值；' : '') +
    (directEffects.length ? '{"status":"DIRECT_EFFECT","reason":"场景依据","request":{"kind":"direct_effect","effectId":"已列ID"}}；' : '') +
    '玩家明确服药、短休15分钟、长休8小时或完成以15分钟为单位的打坐可返回RECOVERY_REQUIRED，request为{"kind":"recovery","type":"medicine","medicine":"雪莲子|培元丹|药A|药B|药C|雷霆药剂"}、{"kind":"recovery","type":"rest","rest":"short|long","minutes":15或480}或{"kind":"recovery","type":"meditate","minutes":明确分钟数}。一句明确声明多个恢复动作时必须完整保留玩家顺序，返回{"kind":"recovery","type":"sequence","steps":[单步恢复对象（不带kind）,...]}；例如“服下培元丹，然后长休八小时”为steps:[{"type":"medicine","medicine":"培元丹"},{"type":"rest","rest":"long","minutes":480}]。不得遗漏、交换、重复或添加动作；尚未指定的选项一律NEEDS_INPUT，不先执行前半段。雪莲子须带玩家指定resource；药C须带玩家选择choice:"heal"或"status"，解除状态还须statusIndex；不替玩家选择。药品数量和效果由本地初始卡规则结算，不能输入数值修改。谈论、询问、未来打算、战斗结束都不触发服药或休息。未知数量的雷霆药剂返回NEEDS_INPUT。' +
    '恢复动作完整返回示例：{"status":"RECOVERY_REQUIRED","reason":"玩家明确服用药B","request":{"kind":"recovery","type":"medicine","medicine":"药B"}}。序列也使用相同外层status、reason、request，不能只返回steps或内部恢复对象。示例不是执行授权，只能选择玩家本次明确声明的动作。' +
    `CHECK_REQUIRED 的普通检定 request 须为 {"kind":"check","attribute":"${CHECK_ATTRIBUTES.join('|')}","skill":"已列主技能名","dc":整数}；attribute只填其中一个名称，不填整段枚举。dc须为有当前场景与具体规则依据的正整数；不得把累计成功目标当作单次DC，不能从示例推定默认值。` +
    // PHB 基本规则；非战斗行动与战斗行动：关键属性+技能，固定难度由ST设定。
    '本系统使用D10骰池，每颗8至10产生1成功，10继续加骰；DC是所需成功数，不是单颗骰子的点数，也不是D20检定难度。' +
    '普通非战斗检定通常是关键属性＋关键技能；观察细节通常感知＋洞察，口头说服通常风度＋社交，具体选择须符合实际行动，不把所有对话都判作说服。' +
    'PHB将非战斗固定难度交由主持设定，没有通用的数字难度档表。若场景或已采用规则已给DC，应沿用；否则按现有有利与不利条件估计，不因剧情重要或玩家骰池高而提高门槛。' +
    '普通CHECK_REQUIRED的reason必须同时说明属性技能选择、具体DC及为什么选择该数值，权衡有利条件与实际障碍；只解释“需要检定”不够。不得为了给出理由添加新障碍，失败代价不等于任务本身更难。' +
    (scriptedOpportunityIds.length ? '{"status":"CHECK_REQUIRED","reason":"已授权机会","request":{"kind":"scripted_fortune","opportunityId":"已列ID"}}；' : '') +
    '{"status":"NEEDS_INPUT","reason":"真正缺失的条件"}；或{"status":"UNRESOLVED","reason":"当前规则流程无法处理的具体原因"}。NO_CHECK、NEEDS_INPUT、UNRESOLVED不带request字段。' +
    '先看整条行动：复合行动中只要有一个具机械风险的子动作，就不能用寒暄等无风险部分将整条判为NO_CHECK；只为需要结算的子动作提出一次请求。' +
    (context.pending ? '若本次补充明确取消或暂不执行此前未结算行动，改看本次补充的整条当前声明；仅当前整条无需结算时返回NO_CHECK，并加cancelPending字段，逐字引用最新声明中明确取消或暂不执行的原文片段。普通闲聊、问候不表示取消；不要取消已结算操作或待恢复旁白。' : '') +
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
  catch { throw Object.assign(new Error('Invalid structured decision JSON'),{code:'INVALID_DECISION_JSON'}); }
}

function decisionOf(value) {
  value = parseReplayDecision(value);
  if (!record(value) || !['NO_CHECK', 'DIRECT_EFFECT', 'CHECK_REQUIRED', 'COMBAT_REQUIRED', 'RECOVERY_REQUIRED', 'NEEDS_INPUT', 'UNRESOLVED'].includes(value.status))
    throw Object.assign(new Error('Invalid structured decision'),{code:'INVALID_DECISION_STATUS'});
  if(typeof value.reason !== 'string' || !value.reason.trim() || value.reason.length > 300)
    throw Object.assign(new Error('Invalid structured decision'),{code:'INVALID_DECISION_REASON'});
  // An explicit null is semantically no request; never coerce an executable payload.
  if (['NO_CHECK','NEEDS_INPUT','UNRESOLVED'].includes(value.status) && value.request === null) {
    value = { ...value };delete value.request;
  }
  if (value.status === 'NO_CHECK') {
    if (!['ordinary_dialogue', 'visible_fact', 'deterministic'].includes(value.basis))
      throw new Error('NO_CHECK needs a supported basis');
    if ('request' in value) throw new Error('NO_CHECK cannot carry a rule request');
  } else if (value.status === 'COMBAT_REQUIRED') {
    if (!record(value.request) || value.request.kind !== 'combat' ||
        typeof value.request.encounterId !== 'string' || !value.request.encounterId.trim() ||
        Object.keys(value.request).some(key => !['kind','encounterId'].includes(key)))
      throw new Error('Combat decision requires a registered encounter ID');
  } else if(value.status==='RECOVERY_REQUIRED') {
    if(!validRecoveryRequest(value.request))throw Error('Supported source-backed recovery request required');
  } else if (value.status === 'DIRECT_EFFECT') {
    if (!record(value.request) || value.request.kind !== 'direct_effect' ||
        typeof value.request.effectId !== 'string' || !value.request.effectId ||
        Object.keys(value.request).some(key => !['kind', 'effectId'].includes(key)))
      throw new Error('DIRECT_EFFECT needs a supported direct effect request');
  } else if (value.status === 'CHECK_REQUIRED') {
    const request = value.request;
    if (!record(request) || !['check', 'rule', 'genetic_unlock', 'scripted_fortune'].includes(request.kind))
      throw new Error('CHECK_REQUIRED needs a rule request');
    if(request.kind==='rule'&&!ruleRequestValid(request))throw Error('Invalid rule action request');
    if (request.kind === 'scripted_fortune' &&
        (typeof request.opportunityId !== 'string' || !request.opportunityId.trim() ||
         Object.keys(request).some(key => !['kind', 'opportunityId'].includes(key))))
      throw new Error('Scripted fortune requires only a trusted opportunity ID');
    if (request.kind === 'check' && !CHECK_ATTRIBUTES.includes(request.attribute))
      throw Object.assign(new Error('Invalid check attribute'),{code:'INVALID_CHECK_ATTRIBUTE'});
    if (request.kind === 'check' &&
        (typeof request.skill !== 'string' || !request.skill.trim() ||
        !Number.isSafeInteger(request.dc) || request.dc < 1))
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
  ensureStable = () => {}, onStage = () => {}, enterCombat, canCancelPending = () => false } = {}) {
  if (!anchorValid(player) || pending !== null &&
      (!record(pending) || !anchorValid(pending.original) ||
       pending.original.chatId !== player.chatId || pending.original.messageId > player.messageId ||
       pending.operationId !== key(pending.original)))
    throw new Error('Current player or pending action anchor invalid');
  if ([classify, settle, narrate, post, ensureStable, onStage].some(fn => typeof fn !== 'function'))
    throw new Error('Guarded turn callbacks required');
  let original = pending?.original ?? player;
  let operationId = key(original);
  let context = { original, latest: player, operationId, pending: !!pending };
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
  if (pending && decision.status === 'NO_CHECK' && !narrationRetry) {
    if (!explicitPendingCancellation(player.text, decision.cancelPending))
      throw new Error('A pending action cannot silently become NO_CHECK');
    if (typeof canCancelPending !== 'function' || await canCancelPending(pending) !== true)
      throw new Error('Cannot cancel a committed operation or pending narration');
    ensureStable();
    pending = null;original = player;operationId = key(player);
    context = { original, latest: player, operationId, pending: false };
  }
  if (decision.status === 'NO_CHECK' && (explicitMechanicalRisk(original.text)||recoveryDeclarationCount(original.text)>0))
    throw new Error('Explicit mechanical risk cannot use NO_CHECK');
  const pendingMeta = { original, operationId, request: decision.request ?? pending?.request ?? null };
  // A pending NPC request contains private DC/modifier selectors. Keep it in
  // trusted execution context, never ordinary chat metadata; saved operations
  // supply the complete request for post-commit recovery.
  const publicPending = pendingMeta.request?.actorId !== undefined || pendingMeta.request?.kind === 'scripted_fortune'
    ? { original, operationId, request: null } : pendingMeta;
  if (decision.status === 'NEEDS_INPUT' || decision.status === 'UNRESOLVED') {
    onStage('state_persistence');
    await post(decision.status === 'NEEDS_INPUT'
      ? '这项行动尚未裁定；没有确定成功、失败或机械后果。请补齐必要信息。'
      : '这项行动尚未裁定；需要主持处理当前未解决的规则问题，没有确定成败或机械后果。',
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
