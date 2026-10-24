import test from 'node:test';
import assert from 'node:assert/strict';
import { runGuardedTurn, replayGateReadiness, replaySceneFromChat,
  replayClassificationRequest, classifyWithDeadline, playerCheckDisplay,
  compactNarrationFacts, savedDecisionForRecovery, playerFacingResult } from './adjudication-gate.mjs';
import { relevantLorebookFacts } from './adjudication-gate.mjs';
import * as gate from './adjudication-gate.mjs';
test('a positive meditation declaration cannot authorize an explicitly excluded pool',()=>{
 const r={kind:'recovery',type:'meditate',minutes:60,resource:'魔力'};
 assert.equal(gate.explicitRecoveryDeclaration(r,'我打坐60分钟，魔力池先不恢复'),false);
 assert.equal(gate.explicitRecoveryDeclaration(r,'我打坐60分钟，不恢复魔力'),false);
 assert.equal(gate.explicitRecoveryDeclaration(r,'我打坐60分钟，恢复魔力'),true);
});

test('recovery sequence schema and authorization preserve the complete declaration order',()=>{
  const medicine={type:'medicine',medicine:'培元丹'},rest={type:'rest',rest:'long',minutes:480};
  const request={kind:'recovery',type:'sequence',steps:[medicine,rest]},text='服下培元丹，然后长休八小时';
  assert.equal(gate.validRecoveryRequest(request),true);
  assert.equal(gate.explicitRecoveryDeclaration(request,text),true);
  for(const steps of [[rest,medicine],[medicine,rest,rest],[{type:'medicine',medicine:'药A'},rest]])
    assert.equal(gate.explicitRecoveryDeclaration({...request,steps},text),false);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',...medicine},text),false,'cannot omit the rest');
  assert.equal(gate.validRecoveryRequest({...request,steps:[medicine,{...rest,patch:{health:99}}]}),false);
  assert.equal(gate.validRecoveryRequest({...request,steps:[medicine,request]}),false);
  for(const phrase of ['如果服下培元丹，然后长休八小时','准备服下培元丹，然后长休八小时','不服下培元丹，也不长休八小时','服下培元丹然后长休八小时有用吗？'])
    assert.equal(gate.explicitRecoveryDeclaration(request,phrase),false,phrase);
  const twice={kind:'recovery',type:'sequence',steps:[medicine,medicine,rest]};
  assert.equal(gate.explicitRecoveryDeclaration(twice,'服下培元丹，再服下培元丹，然后长休八小时'),true);
  assert.equal(gate.explicitRecoveryDeclaration(request,'服下培元丹，再服下培元丹，然后长休八小时'),false);
  assert.equal(gate.explicitRecoveryDeclaration({...request,steps:[rest,medicine]},'长休八小时，然后服下培元丹'),true);
  const prompt=replayClassificationRequest({context:{original:player(text),latest:player(text)}});
  assert.match(prompt.user_input,/sequence.*steps/);
  assert.doesNotMatch(prompt.user_input,/一次恢复请求只结算一个动作|请分开声明/);
});

test('sequence narration uses final pending and preserves actual order and residual injury',()=>{
  const facts=compactNarrationFacts({kind:'recovery',result:{type:'sequence',steps:[
    {type:'medicine',medicine:'培元丹',pending:[{medicine:'培元丹'}]},
    {type:'rest',rest:'long',pending:[]}],pending:[],changes:[{source:'培元丹',severity:'A',healed:3}]}},
    {health:{B:0,L:4,A:0},resources:{流风:{current:22,max:22}}});
  assert.match(facts,/服用培元丹，然后长休/);assert.match(facts,/整个序列最终pending：\[\]/);
  assert.match(facts,/已结算的药效须描述实际恢复/);assert.match(facts,/仍有严重伤害/);
  assert.doesNotMatch(facts,/本次只服下药品并扣除库存/);
});

test('recovery selectors require explicit player execution and preserve saved retry decision',async()=>{
  const request={kind:'recovery',type:'medicine',medicine:'药B'};
  for(const text of ['药B怎么用？','我不服用药B','我准备服用药B','如果受伤就服用药B','我问他能否服用药B'])
    assert.equal(gate.explicitRecoveryDeclaration(request,text),false,text);
  assert.equal(gate.explicitRecoveryDeclaration(request,'我服用药B'),true);
  assert.equal(gate.explicitRecoveryDeclaration(request,'我服用药B，但不休息'),true);
  assert.equal(gate.explicitRecoveryDeclaration(request,'我服用药B，不结束回合'),true);
  assert.equal(gate.explicitRecoveryDeclaration(request,'我不攻击，服用药B'),true);
  assert.equal(gate.validRecoveryRequest({...request,patch:{health:99}}),false);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',type:'rest',rest:'short',minutes:15},'战斗结束了'),false);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',type:'rest',rest:'short',minutes:15},'我短休15分钟'),true);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',type:'rest',rest:'short',minutes:15},'我短休1分钟'),false);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',type:'rest',rest:'long',minutes:480},'我长休四小时'),false);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',type:'meditate',minutes:15},'我打坐十五分钟'),true);
  assert.equal(gate.explicitRecoveryDeclaration({kind:'recovery',type:'meditate',minutes:30},'我打坐15分钟'),false);
  const saved={summary:{status:'applied',kind:'recovery'},signature:JSON.stringify({actorId:'player',command:{type:'medicine',medicine:'药B'}})};
  assert.deepEqual(savedDecisionForRecovery(null,saved).request,request);
  const result=await runGuardedTurn({player:player('我服用药B'),classify:async()=>({status:'RECOVERY_REQUIRED',reason:'明确服药',request}),
    settle:async({operationId})=>({status:'applied',operationId,kind:'recovery',result:{medicine:'药B'}}),
    narrate:async()=> '你服下药丸。',post:async()=>{}});
  assert.equal(result.status,'APPLIED');
  await assert.rejects(runGuardedTurn({player:player('我服用药B'),
    classify:async()=>({status:'NO_CHECK',basis:'deterministic',reason:'误判为服药自动成功'}),
    settle:async()=>{throw Error('must not settle');},narrate:async()=>{throw Error('must not narrate');},post:async()=>{}}),/mechanical risk/);
});

test('pending C narration facts describe consumption without immediate healing and keep numbers in the MVU view',()=>{
  const pending={medicine:'药C',choice:'heal'};
  const result={status:'applied',kind:'recovery',result:{kind:'recovery',type:'medicine',medicine:'药C',
    changes:[{source:'药C',consumed:1,remaining:3}],pending:[pending]}};
  const before=structuredClone(result),facts=compactNarrationFacts(result);
  assert.match(facts,/药C/);
  assert.match(facts,/只服下药品并扣除库存/);
  assert.match(facts,/伤势和异常状态没有改善/);
  assert.match(facts,/药效要等所需休息完成后才生效/);
  assert.match(facts,/不得描写.*疼痛减轻.*行动恢复/);
  assert.match(facts,/数字和库存留在自身MVU界面.*不附状态面板/);
  assert.deepEqual(result,before);
});

test('recovery narration retains remaining severe wounds and a partially filled energy pool without numeric prose facts',()=>{
  const currentState={health:{B:0,L:6,A:0},resources:{流风:{current:13,max:22}}};
  const before=structuredClone(currentState);
  const results=[
    {kind:'recovery',result:{kind:'recovery',type:'rest',rest:'long',minutes:480,
      changes:[{source:'药A',severity:'A',healed:3}],pending:[]}},
    {kind:'recovery',result:{kind:'recovery',type:'medicine',medicine:'雪莲子',
      changes:[{source:'雪莲子',resource:'流风',restored:3}],pending:[]}},
  ];
  for(const result of results) {
    const facts=compactNarrationFacts(result,currentState);
    const qualitative=facts.slice(facts.indexOf('结算后'));
    assert.match(qualitative,/仍有严重伤害/);
    assert.match(qualitative,/余伤没有痊愈/);
    assert.match(qualitative,/流风仍有存量，但尚未回满/);
    assert.match(qualitative,/不要虚构此前已经耗尽.*不要把部分恢复写成回满/);
    assert.doesNotMatch(qualitative,/\d|冲击伤害|恶性伤害/);
  }
  assert.deepEqual(currentState,before);
});

const player = (text, messageId = 1, swipeId = 0) => ({ chatId: 'isolation',
  messageId, swipeId, text });

test('ordinary classifier receives legal attributes, success-count DC and GM difficulty responsibility', () => {
  const action='我请门卫开门取回水壶';
  const request=replayClassificationRequest({context:{original:player(action),latest:player(action)},
    scene:'门卫有权开门，但已经拒绝；水壶近在门边，取回只需片刻。',skills:{社交:{level:2}}});
  const prompt=JSON.stringify(request);
  assert.match(prompt,/力量、敏捷、智力、感知、意志、风度/);
  assert.match(prompt,/社交是技能.*不是属性/);
  assert.match(prompt,/DC是所需成功数.*不是单颗骰子的点数/);
  assert.match(prompt,/自然场景条件充分.*自主设定/);
  assert.match(prompt,/reason.*为什么选择该数值/);
  assert.doesNotMatch(prompt,/普通.*固定DC[12]|简单.*固定DC[12]/);
});

test('recorded social-as-attribute error is typed and never reaches settlement', async () => {
  let settled=0,narrated=0;
  await assert.rejects(runGuardedTurn({player:player('我请门卫开门取水壶'),
    classify:async()=>({status:'CHECK_REQUIRED',reason:'门卫不愿等待',request:{kind:'check',attribute:'社交',skill:'社交',dc:5}}),
    settle:async()=>{settled++;},narrate:async()=>{narrated++;},post:async()=>{}}),
    error=>error.code==='INVALID_CHECK_ATTRIBUTE');
  assert.equal(settled,0);assert.equal(narrated,0);
});

test('null request on an unsettled decision is empty but real requests remain rejected',async()=>{
  const decision={status:'UNRESOLVED',reason:'当前未接通双角色对抗',request:null},posts=[];
  const callbacks={player:player('开始短跑对抗'),classify:async()=>decision,
    settle:async()=>{throw Error('must not settle');},narrate:async()=>{throw Error('must not narrate');},
    post:async(text,meta)=>posts.push({text,meta})};
  const result=await runGuardedTurn(callbacks);
  assert.equal(result.status,'UNRESOLVED');
  assert.doesNotMatch(posts[0].text,/请补齐必要信息/);
  assert.match(posts[0].text,/主持/);
  assert.deepEqual(decision,{status:'UNRESOLVED',reason:'当前未接通双角色对抗',request:null});
  await assert.rejects(runGuardedTurn({...callbacks,classify:async()=>({...decision,request:{kind:'check'}})}),/cannot carry/);
});

test('901 generation excludes foreign global and depth entries without changing worldbook settings', async () => {
  const own = { uid: 1, world: '901_帝都入口_M1_20261012', content: '布莱特', position: 1 };
  const foreign = { uid: 12, world: '开拓者-失落之地V1.1-世界书', content: '<JSONPatch>', position: 4 };
  let listener;
  let stopped = 0;
  const eventOn = (_event, callback) => { listener = callback; return { stop: () => stopped++ }; };
  const lores = { globalLore: [foreign], characterLore: [own], chatLore: [foreign], personaLore: [] };
  const globalReference = lores.globalLore;
  const result = await gate.withReplayLorebook({ book: own.world, eventOn, event: 'worldinfo_entries_loaded',
    generate: async () => { listener(lores); return [...globalReference, ...lores.characterLore, ...lores.chatLore]; } });
  assert.deepEqual(result, [own]);
  assert.equal(foreign.content, '<JSONPatch>');
  assert.equal(stopped, 1);
  await assert.rejects(gate.withReplayLorebook({ book: own.world, eventOn, event: 'worldinfo_entries_loaded',
    generate: async () => { throw Error('transport failed'); } }), /transport failed/);
  assert.equal(stopped, 2);
});

test('saved NO_CHECK narration resumes after refresh without reclassification or settlement', async () => {
  const source = player('我向布莱特点头，说：“我们到了。”');
  const decision = { status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: '普通问候' };
  const pending = { original: source, operationId: 'gm-runtime/isolation/1/0', request: null,
    narrationDecision: decision };
  const posts = [];
  const options = { player: source, pending: JSON.parse(JSON.stringify(pending)),
    classify: async () => { throw Error('must not reclassify'); },
    settle: async () => { throw Error('must not settle'); },
    narrate: async () => '布莱特微微颔首。', post: async (text, meta) => posts.push({ text, meta }) };
  assert.equal((await runGuardedTurn(options)).status, 'NO_CHECK');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].meta.operationId, pending.operationId);
  await assert.rejects(runGuardedTurn({ ...options, player: player('我挥剑攻击守卫', 3) }), /different action/i);
});

test('recorded continuation failure permits NO_CHECK recovery but an unresolved action does not', async () => {
  const source = player('我向布莱特点头，说：“我们到了。”');
  const pending = { original: source, operationId: 'gm-runtime/isolation/1/0', request: null };
  const notice = (failureStage, narrationRequests) => ({ is_user: false, mes: '尚未裁定', extra: {
    '901_replay_gate': { status: 'UNRESOLVED', pending, diagnostic: { failureStage, narrationRequests } } } });
  const chat = [{ mes: '开场' }, { is_user: true, mes: source.text }, notice('continuation', 1),
    { is_user: true, mes: source.text }, notice('gate_validation', 0)];
  const current = player(source.text, 3);
  const recovered = gate.replayPendingFromChat(chat, current);
  let classifications = 0;
  const options = { player: current, pending: recovered,
    classify: async () => { classifications++; return { status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: '普通问候' }; },
    settle: async () => { throw Error('must not settle'); }, narrate: async () => '布莱特点头。', post: async () => {} };
  assert.equal((await runGuardedTurn(options)).status, 'NO_CHECK');
  assert.equal(classifications, 1);
  await assert.rejects(runGuardedTurn({ ...options, pending }), /pending action.*NO_CHECK/i);
  chat[4] = { mes: '布莱特点头。', extra: { '901_replay_gate': { status: 'NO_CHECK' } } };
  assert.equal(gate.replayPendingFromChat(chat, current), null);
});

test('explicit cancellation of the unexecuted medicine declaration continues the actual current turn only', async () => {
  // Verbatim player declarations saved in radwick-story-recheck-failed.jsonl,
  // floors 15 and 17 of the isolated live arena chat.
  const original=player('【隔离测试玩家声明】我现在要使用自己库存中的一份药B，给自己处理本场留下的伤势。请按已接入的实际规则结算消耗与治疗；若用药尚未接入，明确告知我，不能只在正文写成已经喝下或已经治好。',15);
  const latest=player('【隔离测试玩家声明】用药暂不执行。我仍在原地，只看着拉德维克，问一句：“你现在感觉怎样？”不移动、不治疗，也不再动手。',17);
  const pending={original,operationId:'gm-runtime/isolation/15/0',request:null};
  const decision={status:'NO_CHECK',basis:'ordinary_dialogue',reason:'取消尚未执行的用药，只在原地问候',cancelPending:'用药暂不执行。我仍在原地，只看着拉德维克，问一句：“你现在感觉怎样？”不移动、不治疗，也不再动手。'};
  let narrations=0;const posts=[];
  const options={player:latest,pending,canCancelPending:async()=>true,classify:async()=>decision,
    settle:async()=>{throw Error('must not settle medicine or dialogue');},narrate:async context=>{
      narrations++;assert.deepEqual(context.original,latest);assert.equal(context.operationId,'gm-runtime/isolation/17/0');assert.equal(context.pending,false);return '拉德维克回答了你的问候。';
    },post:async(text,meta)=>posts.push({text,meta})};
  assert.equal((await runGuardedTurn(options)).operationId,'gm-runtime/isolation/17/0');assert.equal(narrations,1);
  assert.equal(posts[0].meta.operationId,'gm-runtime/isolation/17/0');
  await assert.rejects(runGuardedTurn({...options,canCancelPending:async()=>false}),/cancel|取消/i);
  await assert.rejects(runGuardedTurn({...options,pending:{...pending,narrationDecision:{status:'NO_CHECK',basis:'ordinary_dialogue',reason:'旁白待恢复'}}}),/different action/i);
  await assert.rejects(runGuardedTurn({...options,classify:async()=>({...decision,cancelPending:undefined})}),/pending action.*NO_CHECK/i);
  await assert.rejects(runGuardedTurn({...options,player:player('用药暂不执行。我挥剑攻击守卫。',17),classify:async()=>({...decision,cancelPending:'用药暂不执行'})}),/mechanical risk/i);
  for(const text of ['我不取消用药。','可以取消用药吗？'])await assert.rejects(runGuardedTurn({...options,player:player(text,17),classify:async()=>({...decision,cancelPending:'取消用药'})}),/pending action.*NO_CHECK/i);
  assert.equal(narrations,1);
});

test('player-facing result metadata omits check numbers and secret roll existence', () => {
  assert.deepEqual(playerFacingResult({ status: 'applied', kind: 'check', operationId: 'x',
    dp: 0, total: 1, dc: 2, success: false }),
  { status: 'applied', kind: 'check', operationId: 'x' });
  assert.deepEqual(playerFacingResult({ status: 'applied', kind: 'scripted_fortune',
    visibility: 'secret', operationId: 'y', success: true }), {});
});

test('routine conversation enters prose only after structured NO_CHECK', async () => {
  let settled = 0;
  const posts = [];
  const result = await runGuardedTurn({ player: player('我询问城门何时关闭'),
    classify: async () => ({ status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: '问话' }),
    settle: async () => { settled++; }, narrate: async () => '守卫回答了时辰。',
    post: async (text, meta) => posts.push({ text, meta }) });
  assert.equal(result.status, 'NO_CHECK');
  assert.equal(settled, 0);
  assert.match(posts[0].text, /守卫回答/);
});

test('controlled model response crosses dispatch, parse, gate and continuation once', async () => {
  const stages = [];
  const requests = [];
  let narrationCalls = 0;
  let posts = 0;
  const source = player('我问城门何时关闭');
  const result = await runGuardedTurn({ player: source,
    onStage: stage => stages.push(stage),
    classify: async context => {
      const request = replayClassificationRequest({ context, skills: {} });
      return classifyWithDeadline({ request, generationId: 'controlled-classification',
        timeoutMs: 1000, stopGenerationById: () => {},
        generateRaw: async sent => {
          requests.push(sent);
          return JSON.stringify({ status: 'NO_CHECK', basis: 'ordinary_dialogue', reason: '问话' });
        } });
    },
    settle: async () => { throw Error('ordinary dialogue must not settle'); },
    narrate: async () => { narrationCalls++; return '城门守卫答道：日落关闭。'; },
    post: async () => { posts++; } });
  assert.equal(result.status, 'NO_CHECK');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].generation_id, 'controlled-classification');
  assert.equal(narrationCalls, 1);
  assert.equal(posts, 1);
  assert.deepEqual(stages, ['classification', 'response_parse', 'gate_validation',
    'continuation', 'state_persistence']);
});

test('malformed model response is isolated at response_parse before narration', async () => {
  const stages = [];
  let narrationCalls = 0;
  await assert.rejects(runGuardedTurn({ player: player('我问好'),
    onStage: stage => stages.push(stage), classify: async () => 'not JSON',
    settle: async () => { throw Error('must not settle'); },
    narrate: async () => { narrationCalls++; return '回答'; }, post: async () => {} }),
  /Invalid structured decision JSON/);
  assert.deepEqual(stages, ['classification', 'response_parse']);
  assert.equal(narrationCalls, 0);
});

test('a fenced JSON decision follows the ordinary gate without another request', async () => {
  let settled = 0;
  let narrated = 0;
  const result = await runGuardedTurn({ player: player('你好'),
    classify: async () => '```json\n{"status":"NO_CHECK","basis":"ordinary_dialogue","reason":"问候"}\n```',
    settle: async () => { settled++; },
    narrate: async () => { narrated++; return '守卫点头致意。'; }, post: async () => {} });
  assert.equal(result.status, 'NO_CHECK');
  assert.equal(settled, 0);
  assert.equal(narrated, 1);
  await assert.rejects(runGuardedTurn({ player: player('你好'),
    classify: async () => '说明：\n```json\n{"status":"NO_CHECK","basis":"ordinary_dialogue","reason":"问候"}\n```',
    settle: async () => { throw Error('must not settle'); },
    narrate: async () => { throw Error('must not narrate'); }, post: async () => {} }),
  /Invalid structured decision JSON/);
});

test('DIRECT_EFFECT requires a saved JS result before narration', async () => {
  const sequence = [];
  const operationId = 'gm-runtime/isolation/1/0';
  const result = await runGuardedTurn({ player: player('我指给同伴看墙上的暗号'),
    classify: async () => ({ status: 'DIRECT_EFFECT', reason: '明确的场景线索',
      request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } }),
    settle: async () => { sequence.push('settle'); return { status: 'applied', operationId,
      kind: 'direct_effect', effectId: 'demo.scene-cue' }; },
    narrate: async () => { sequence.push('narrate'); return '同伴记住了暗号。'; },
    post: async () => { sequence.push('post'); } });
  assert.equal(result.status, 'APPLIED');
  assert.deepEqual(sequence, ['settle', 'narrate', 'post']);
  await assert.rejects(runGuardedTurn({ player: player('我鼓舞同伴'),
    classify: async () => ({ status: 'DIRECT_EFFECT', reason: '凭空加值',
      request: { kind: 'direct_effect', value: 999 } }),
    settle: async () => { throw Error('must not'); }, narrate: async () => '成功', post: async () => {} }),
  /direct effect/i);
});

test('player display exposes only public pool construction and compact GM facts omit logs', () => {
  const display = playerCheckDisplay({ attribute: { name: '感知', value: 5 },
    mainSkill: { name: '洞察', value: 1 }, publicModifiers: [{ source: '场景线索', value: 1 }],
    publicSubtotal: 7, partial: true });
  assert.match(display, /感知 5/);
  assert.match(display, /洞察 1/);
  assert.match(display, /场景线索 \+1/);
  assert.match(display, /可公开部分 7/);
  const facts = compactNarrationFacts({ kind: 'check', success: true, total: 9,
    dc: 4, rolledSuccesses: 7, dice: [10, 8] });
  assert.equal(facts, '普通检定：成功；结果已由 JS 保存。');
  assert.doesNotMatch(display + facts, /DC|成功数|骰值|\[10/);
  assert.match(compactNarrationFacts({ kind: 'check', success: false, fortune: true,
    possibleMishap: true }), /主持裁定/);
});

test('saved operation resumes its original adjudication without another model classification', () => {
  const pending = { original: player('我检查墙上暗号'),
    operationId: 'gm-runtime/isolation/1/0',
    request: { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 } };
  assert.deepEqual(savedDecisionForRecovery(pending,
    { summary: { kind: 'check', status: 'applied' } }), {
    status: 'CHECK_REQUIRED', reason: '复用已保存的原操作', request: pending.request });
  assert.equal(savedDecisionForRecovery({ ...pending, request: null },
    { summary: { kind: 'check', status: 'applied' } }), null);
});

test('committed player operation recovers classification after a lost failure notice', () => {
  const check = { summary: { kind: 'check', status: 'applied' },
    signature: JSON.stringify({ actorId: 'player', checkInput: {
      attribute: '感知', skill: '洞察', sub: '搜索', dc: 2, dice: [7, 9] } }) };
  assert.deepEqual(savedDecisionForRecovery(null, check), {
    status: 'CHECK_REQUIRED', reason: '复用已保存的规则操作',
    request: { kind: 'check', attribute: '感知', skill: '洞察', sub: '搜索', dc: 2 },
  });
  const effect = { summary: { kind: 'direct_effect', status: 'applied' },
    signature: JSON.stringify({ actorId: 'player', effect: { id: 'demo.scene-cue', value: 1 } }) };
  assert.deepEqual(savedDecisionForRecovery(null, effect), {
    status: 'DIRECT_EFFECT', reason: '复用已保存的规则操作',
    request: { kind: 'direct_effect', effectId: 'demo.scene-cue' },
  });
  assert.equal(savedDecisionForRecovery(null,
    { ...check, signature: JSON.stringify({ actorId: 'npc', checkInput: { skill: '洞察' } }) }), null);
});

test('different risky phrasings both require a result before prose', async () => {
  for (const action of ['我沿湿滑的外墙向上攀行', '我趁两辆疾驰马车间的空隙冲向对街']) {
    let narrations = 0;
    const posts = [];
    const result = await runGuardedTurn({ player: player(action),
      classify: async () => ({ status: 'CHECK_REQUIRED', reason: '有失败后果',
        request: { kind: 'check', attribute: '敏捷', skill: '运动', dc: 2 } }),
      settle: async () => ({ status: 'needs_input', missing: ['场景风险与距离'] }),
      narrate: async () => { narrations++; return '行动成功'; },
      post: async (text, meta) => posts.push({ text, meta }) });
    assert.equal(result.status, 'NEEDS_INPUT');
    assert.equal(narrations, 0);
    assert.equal(posts[0].meta.pending.original.text, action);
    assert.match(posts[0].text, /尚未裁定/);
  }
});

test('pending action keeps original operation ID across a later input message', async () => {
  const first = player('我试着攀上城墙', 1, 2);
  const pending = { original: first, operationId: 'gm-runtime/isolation/1/2' };
  let classifiedContext;
  const posts = [];
  const result = await runGuardedTurn({ player: player('墙高三米，墙面湿滑', 3), pending,
    classify: async context => { classifiedContext = context; return {
      status: 'CHECK_REQUIRED', reason: '攀爬',
      request: { kind: 'check', attribute: '力量', skill: '运动', dc: 2 } }; },
    settle: async ({ operationId }) => ({ status: 'applied', operationId, kind: 'check',
      total: 3, dc: 2, success: true }),
    narrate: async (_context, result) => `检定 ${result.total}/${result.dc}，顺利攀上墙。`,
    post: async (text, meta) => posts.push({ text, meta }) });
  assert.equal(classifiedContext.original.text, first.text);
  assert.equal(classifiedContext.latest.text, '墙高三米，墙面湿滑');
  assert.equal(result.operationId, pending.operationId);
  assert.equal(result.status, 'APPLIED');
  assert.equal(posts[0].meta.operationId, pending.operationId);
});

test('UNRESOLVED and invalid classification cannot narrate success', async () => {
  let narrations = 0;
  const posts = [];
  const input = { player: player('我进入车流'), settle: async () => { throw Error('must not'); },
    narrate: async () => { narrations++; return '已穿过'; },
    post: async (text, meta) => posts.push({ text, meta }) };
  const result = await runGuardedTurn({ ...input,
    classify: async () => ({ status: 'UNRESOLVED', reason: '行动条件不清' }) });
  assert.equal(result.status, 'UNRESOLVED');
  assert.equal(narrations, 0);
  assert.equal(posts[0].meta.pending.original.text, '我进入车流');
  await assert.rejects(runGuardedTurn({ ...input,
    classify: async () => ({ status: 'NO_CHECK', basis: 'free_pass', reason: '跳过' }) }), /basis/);
});

test('negating an attack does not block ordinary observation or erase a separate declared attack', async () => {
  let narrated = 0;
  const input = {
    classify: async () => ({ status: 'NO_CHECK', basis: 'visible_fact', reason: '原地观察' }),
    settle: async () => { throw Error('observation must not settle'); },
    narrate: async () => { narrated++; return '石像仍在圈内。'; },
    post: async () => {},
  };
  const result = await runGuardedTurn({ ...input,
    player: player('我仍留在原地，安静看着圈内的石像，不移动、不治疗、不攻击。') });
  assert.equal(result.status, 'NO_CHECK');
  assert.equal(narrated, 1);
  await assert.rejects(runGuardedTurn({ ...input,
    player: player('我不攻击石像，转身射击另一名敌人。') }), /risk.*NO_CHECK/i);
  assert.equal(narrated, 1);
});

test('NO_CHECK cannot clear the reported traffic and climbing risks', async () => {
  for (const action of ['我趁疾驰马车间的空隙穿过车流', '我沿湿滑城墙向上攀爬']) {
    let narrated = false;
    await assert.rejects(runGuardedTurn({ player: player(action),
      classify: async () => ({ status: 'NO_CHECK', basis: 'deterministic', reason: '直接成功' }),
      settle: async () => { throw Error('must not settle'); },
      narrate: async () => { narrated = true; return '成功。'; },
      post: async () => {} }), /risk.*NO_CHECK/i);
    assert.equal(narrated, false);
  }
});

test('gate readiness names missing runtime dependencies and player anchor', () => {
  const absent = replayGateReadiness({});
  assert.equal(absent.ready, false);
  assert.ok(absent.missing.includes('MVU'));
  assert.ok(absent.missing.includes('player anchor'));
  const ready = replayGateReadiness({ chatId: 'isolation', player: player('我问好'),
    mvu: { getMvuData() {}, replaceMvuData() {} },
    generateRaw() {}, createChatMessages() {}, stopGeneration() {}, stopGenerationById() {},
    createRuleRuntime() {} });
  assert.deepEqual(ready, { ready: true, missing: [] });
});

test('failed narration can retry saved operation without changing operation ID', async () => {
  const source = player('我检查车辙', 4);
  const operationId = 'gm-runtime/isolation/4/0';
  const saved = { status: 'applied', operationId, kind: 'check', total: 2, dc: 2, success: true };
  const operations = new Map();
  let draws = 0;
  const settle = async ({ operationId: key }) => {
    if (!operations.has(key)) { draws++; operations.set(key, saved); }
    return operations.get(key);
  };
  const base = { player: source,
    classify: async () => ({ status: 'CHECK_REQUIRED', reason: '查找痕迹',
      request: { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 } }),
    settle, post: async () => {} };
  await assert.rejects(runGuardedTurn({ ...base,
    narrate: async () => { throw Error('rate limit'); } }), /rate limit/);
  const result = await runGuardedTurn({ ...base, narrate: async () => '发现车辙。' });
  assert.equal(result.status, 'APPLIED');
  assert.equal(result.operationId, operationId);
  assert.equal(draws, 1);
});

test('classifier request includes only explicit action, current scene and relevant state', () => {
  const chat = [
    { is_user: false, mes: '帝都城门外，车马正在通行；布莱特在身边。' },
    { is_user: true, mes: '我问路。' },
    { is_user: false, mes: '行动尚未裁定。', extra: { '901_replay_gate': { status: 'UNRESOLVED' } } },
    { is_user: true, mes: '我趁车流空隙穿过道路。' },
  ];
  const scene = replaySceneFromChat(chat, 3);
  assert.match(scene, /车马正在通行/);
  const request = replayClassificationRequest({
    context: { original: player(chat[3].mes, 3), latest: player(chat[3].mes, 3), pending: false },
    scene, skills: { 运动: { level: 1 }, 洞察: { level: 1 } },
    state: { health: { B: 0, L: 0, A: 0 }, turn: { standard: 1 } },
    unsupported: ['腾转挪移'],
  });
  assert.equal(request.max_chat_history, 0);
  assert.equal(request.ordered_prompts.length, 2);
  assert.deepEqual(request.ordered_prompts[1], 'user_input');
  assert.equal((request.user_input.match(/我趁车流空隙穿过道路/g) ?? []).length, 1);
  assert.match(request.user_input, /车马正在通行/);
  assert.doesNotMatch(JSON.stringify(request.ordered_prompts), /scenario|chat_history|world_info|char_description/);
  assert.doesNotMatch(request.user_input, /stat_data/);
});

test('classifier request does not offer an invented default DC for an uncertain compound action', () => {
  const action = '我先向同伴道谢，然后攀上湿滑的外墙去查看墙顶。';
  const request = replayClassificationRequest({
    context: { original: player(action), latest: player(action), pending: false },
    scene: '外墙湿滑，失足会坠落；墙高和可用抓点未知。',
    skills: { 运动: { level: 1 } },
  });
  assert.doesNotMatch(request.user_input, /"dc"\s*:\s*2\b/);
  assert.match(request.user_input, /复合行动/);
  assert.match(request.user_input, /缺少.*难度依据.*NEEDS_INPUT/s);
  assert.match(request.ordered_prompts[0].content, /难度依据.*缺失.*NEEDS_INPUT/);
});

test('current action selects a named NPC worldbook entry without unrelated entries', () => {
  const entries = [
    { uid: 1, enabled: true, keys: ['布莱特'], comment: '布莱特', content: '失明弓手；不能读平面文字。' },
    { uid: 2, enabled: true, keys: ['帝国皇帝'], comment: '帝国皇帝', content: '幕后秘密。' },
  ];
  const facts = relevantLorebookFacts(entries, {
    action: '我问布莱特能否读这封信', scene: '布莱特站在身旁。' });
  assert.equal(facts.length, 1);
  assert.equal(facts[0].uid, 1);
  const request = replayClassificationRequest({
    context: { original: player('我问布莱特能否读这封信'), latest: player('我问布莱特能否读这封信') },
    scene: '布莱特站在身旁。', skills: {}, relatedFacts: facts });
  assert.match(request.user_input, /不能读平面文字/);
  assert.doesNotMatch(request.user_input, /幕后秘密/);
  assert.equal(relevantLorebookFacts(entries, { action: '我问他能否读信',
    scene: '帝国皇帝和布莱特都在场。' }).length, 2);
});

test('classification deadline stops only its generation and ignores a late result', async () => {
  let complete;
  let settled = 0;
  const stopped = [];
  const posts = [];
  const turn = runGuardedTurn({ player: player('我攀上湿滑城墙'),
    classify: async () => classifyWithDeadline({
      generateRaw: () => new Promise(resolve => { complete = resolve; }),
      stopGenerationById: id => { stopped.push(id); return true; },
      request: { should_silence: true }, generationId: '901-classify-one', timeoutMs: 5,
    }),
    settle: async () => { settled++; },
    narrate: async () => '成功了。', post: async (text, meta) => posts.push({ text, meta }),
  });
  await assert.rejects(turn, /deadline/i);
  complete(JSON.stringify({ status: 'CHECK_REQUIRED', reason: '危险',
    request: { kind: 'check', attribute: '力量', skill: '运动', dc: 2 } }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(stopped, ['901-classify-one']);
  assert.equal(settled, 0);
  assert.equal(posts.length, 0);
});
test('registered encounter decisions hand off before ordinary checks and narration', async () => {
  const player = {chatId:'integrated',messageId:1,swipeId:0,text:'开始姜黄演练'};
  const calls=[];
  const result=await runGuardedTurn({player,
    classify:async()=>({status:'COMBAT_REQUIRED',reason:'开始已登记演练',
      request:{kind:'combat',encounterId:'jiang-huang'}}),
    enterCombat:async input=>{calls.push(input);return {handled:true,status:'awaiting_player'};},
    settle:async()=>{throw Error('must not use ordinary check');},
    narrate:async()=>{throw Error('must not narrate before combat');},
    post:async()=>{throw Error('combat host publishes its own result');},
  });
  assert.equal(result.status,'COMBAT_HANDLED');
  assert.equal(calls[0].request.encounterId,'jiang-huang');
  assert.equal(calls[0].context.original.text,player.text);
});

test('saved return to story closes an earlier interrupted combat handoff', () => {
  const original=player('开始姜黄演练',1);
  const pending={original,operationId:'gm-runtime/isolation/1/0',
    request:{kind:'combat',encounterId:'jiang-huang'}};
  const chat=[{is_user:false,mes:'开场'},
    {is_user:true,mes:original.text},
    {is_user:false,extra:{'901_replay_gate':{status:'UNRESOLVED',pending}}},
    {is_user:false,mes:'演练结束',extra:{'901_combat_return':{operationId:'leave/20'}}},
    {is_user:true,mes:'我问布莱特刚才发生了什么'}];
  assert.equal(gate.replayPendingFromChat(chat,player(chat[4].mes,4)),null);
});
