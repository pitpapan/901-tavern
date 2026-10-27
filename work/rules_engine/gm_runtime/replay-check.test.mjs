import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createReplayCheckRuntime } from './replay-check.mjs';
import {createOpeningFixture} from './opening.mjs';
import {createRecoveryFixture} from './recovery-fixture.mjs';
import { playerCheckDisplay, runGuardedTurn, savedDecisionForRecovery,
  replayClassificationRequest } from './adjudication-gate.mjs';

const baseline = JSON.parse(readFileSync(new URL('../../character_builder/real_character/yulinfeng_replay_t0.baseline.json', import.meta.url)));

test('ordered recovery commits one operation and replays the complete saved medicine/rest/meditation sequence',async()=>{
  const fixture=createRecoveryFixture();let data={stat_data:{}},draws=0,writes=0;
  let anchor={chatId:'sequence-test',messageId:0,swipeId:0};
  const opts={baseline:fixture.baseline,expectedChatId:anchor.chatId,getAnchor:()=>anchor,
    mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async value=>{writes++;data=structuredClone(value);}},
    drawDice:()=>{draws++;return Array(256).fill(8);}};
  let runtime=createReplayCheckRuntime(opts);await runtime.initialize({openingAssumption:true});
  data.stat_data['901_rules_poc'].actors=structuredClone(fixture.actors);
  const request={kind:'recovery',type:'sequence',steps:[{type:'medicine',medicine:'培元丹'},
    {type:'rest',rest:'long',minutes:480}]};
  const text='服下培元丹，然后长休八小时',p={...anchor,text};
  const operationId='gm-runtime/sequence-test/0/0';
  const before=structuredClone(data),savedWrites=writes;
  for(const bad of [{...request,steps:request.steps.toReversed()},
    {kind:'recovery',...request.steps[0]},
    {...request,steps:[...request.steps,{type:'meditate',minutes:15}]}]) {
    assert.equal((await runtime.settle({operationId,request:bad,context:{original:p,latest:p}})).status,'needs_input');
    assert.deepEqual(data,before);
  }
  assert.equal((await runtime.settle({operationId,request:{kind:'recovery',...request.steps[0]},
    context:{original:p,latest:{...p,messageId:1,text:'服下培元丹'}}})).status,'needs_input');
  assert.deepEqual(data,before,'a later partial repeat cannot omit the original long rest');
  const out=await runtime.settle({operationId,request,context:{original:p,latest:p}});
  assert.equal(out.status,'applied');assert.equal(writes,savedWrites+1);
  const root=data.stat_data['901_rules_poc'],state=root.actors.player.state;
  assert.equal(root.revision,1);assert.deepEqual(Object.keys(root.operations),[operationId]);
  assert.deepEqual(out.result.steps.map(s=>s.type),['medicine','rest']);
  assert.deepEqual([state.health.intact,state.health.A,state.health.L,state.health.B],[8,0,4,0]);
  assert.equal(state.inventory.find(i=>i.name==='培元丹').quantity,2);
  assert.deepEqual(state.pendingRecoveryEffects,[]);assert.equal(state.recoveryClock.minutes,480);
  assert.equal(state.resources.流风.current,22);assert.equal(state.will.current,2);
  const committed=structuredClone(data);anchor={...anchor,messageId:2,swipeId:1};runtime=createReplayCheckRuntime(opts);
  assert.equal((await runtime.settle({operationId,request})).status,'already_applied');
  assert.deepEqual(data,committed);assert.equal(writes,savedWrites+1);assert.equal(draws,0);
  // A sequence containing actual dice also returns before reducer/dice on reload.
  const meditate={kind:'recovery',type:'sequence',steps:[{type:'meditate',minutes:15},{type:'rest',rest:'short',minutes:15}]};
  const m={...anchor,text:'打坐十五分钟，然后短休十五分钟'},id='gm-runtime/sequence-test/2/1';
  assert.equal((await runtime.settle({operationId:id,request:meditate,context:{original:m,latest:m}})).status,'applied');
  const afterMeditation=structuredClone(data);assert.equal(draws,1);
  runtime=createReplayCheckRuntime(opts);
  assert.equal((await runtime.settle({operationId:id,request:meditate})).status,'already_applied');
  assert.equal(draws,1);assert.deepEqual(data,afterMeditation);
});

test('a later missing choice or illegal rest leaves the entire MVU sequence untouched',async()=>{
  const fixture=createRecoveryFixture();let data={stat_data:{}},draws=0;
  const anchor={chatId:'sequence-test',messageId:0,swipeId:0};
  const runtime=createReplayCheckRuntime({baseline:fixture.baseline,expectedChatId:anchor.chatId,getAnchor:()=>anchor,
    mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async value=>{data=structuredClone(value);}},
    drawDice:()=>{draws++;return Array(256).fill(8);}});
  await runtime.initialize({openingAssumption:true});data.stat_data['901_rules_poc'].actors=structuredClone(fixture.actors);
  const before=structuredClone(data);
  const p={...anchor,text:'打坐十五分钟，然后服用药C'};
  assert.equal((await runtime.settle({operationId:'gm-runtime/sequence-test/0/0',request:{kind:'recovery',type:'sequence',
    steps:[{type:'meditate',minutes:15},{type:'medicine',medicine:'药C'}]},context:{original:p,latest:p}})).status,'needs_input');
  assert.deepEqual(data,before);assert.equal(draws,0);
  data.stat_data['901_rules_poc'].battle={mode:'combat'};const combat=structuredClone(data);
  const q={...anchor,text:'服下培元丹，然后长休八小时'};
  await assert.rejects(runtime.settle({operationId:'gm-runtime/sequence-test/0/0',request:{kind:'recovery',type:'sequence',
    steps:[{type:'medicine',medicine:'培元丹'},{type:'rest',rest:'long',minutes:480}]},context:{original:q,latest:q}}),/Combat/);
  assert.deepEqual(data,combat);assert.equal(draws,0);
});

test('option-only clarification completes the original medicine/rest sequence once',async()=>{
  const fixture=createRecoveryFixture();let data={stat_data:{}},writes=0;
  const anchor={chatId:'sequence-choice',messageId:0,swipeId:0};
  const opts={baseline:fixture.baseline,expectedChatId:anchor.chatId,getAnchor:()=>anchor,
    mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async value=>{writes++;data=structuredClone(value);}},
    drawDice:()=>{throw Error('this healing choice needs no dice');}};
  const runtime=createReplayCheckRuntime(opts);await runtime.initialize({openingAssumption:true});
  data.stat_data['901_rules_poc'].actors=structuredClone(fixture.actors);
  const original={...anchor,text:'我服用药C，然后短休十五分钟'},operationId='gm-runtime/sequence-choice/0/0';
  const request={kind:'recovery',type:'sequence',steps:[{type:'medicine',medicine:'药C',choice:'heal'},
    {type:'rest',rest:'short',minutes:15}]};
  const before=structuredClone(data),savedWrites=writes;
  assert.equal((await runtime.settle({operationId,request,context:{original,latest:original}})).status,'needs_input');
  assert.deepEqual(data,before);assert.equal(writes,savedWrites);
  const latest={...anchor,messageId:1,text:'药C用于治疗严重伤害'};
  assert.equal((await runtime.settle({operationId,request,context:{original,latest}})).status,'applied');
  const root=data.stat_data['901_rules_poc'];
  assert.equal(writes,savedWrites+1);assert.equal(root.revision,1);
  assert.deepEqual(Object.keys(root.operations),[operationId]);
  assert.equal(root.actors.player.state.health.L,0);
  assert.equal(root.actors.player.state.inventory.find(i=>i.name==='药C').quantity,3);
  assert.equal(root.actors.player.state.recoveryClock.minutes,15);
  const committed=structuredClone(data);
  assert.equal((await createReplayCheckRuntime(opts).settle({operationId,request})).status,'already_applied');
  assert.deepEqual(data,committed);assert.equal(writes,savedWrites+1);
});

test('source medicine settles atomically once and refresh reuses it before dice or debit',async()=>{
  let saved={stat_data:{unrelated:{keep:3}}},draws=0;
  const anchor={chatId:'replay-test',messageId:0,swipeId:0};
  const opts={baseline,expectedChatId:'replay-test',getAnchor:()=>anchor,
    mvu:{getMvuData:()=>structuredClone(saved),replaceMvuData:async value=>{saved=structuredClone(value);}},
    drawDice:()=>{draws++;return Array(256).fill(8);}};
  let runtime=createReplayCheckRuntime(opts);await runtime.initialize({openingAssumption:true});
  const state=saved.stat_data['901_rules_poc'].actors.player.state;
  state.health.intact-=6;state.health.L+=6;state.inventory=[{name:'药B',quantity:3,source:'初始卡'}];
  const request={kind:'recovery',type:'medicine',medicine:'药B'},operationId='gm-runtime/replay-test/0/0';
  const before=structuredClone(saved);
  assert.equal((await runtime.settle({operationId,request})).status,'needs_input');
  assert.deepEqual(saved,before);
  const compound='我服药A，然后长休八小时';
  assert.equal((await runtime.settle({operationId,request:{kind:'recovery',type:'medicine',medicine:'药A'},
    context:{original:{...anchor,text:compound},latest:{...anchor,text:compound}}})).status,'needs_input');
  assert.deepEqual(saved,before,'compound declarations cannot debit or partially rest');
  const context={original:{...anchor,text:'我服用药B'},latest:{...anchor,text:'我服用药B'}};
  const first=await runtime.settle({operationId,request,context});
  assert.equal(first.status,'applied');assert.equal(first.kind,'recovery');
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.inventory[0].quantity,2);
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.health.L,1);
  const committed=structuredClone(saved);runtime=createReplayCheckRuntime(opts);
  assert.equal((await runtime.settle({operationId,request})).status,'already_applied');
  assert.deepEqual(saved,committed);assert.equal(draws,0);assert.equal(saved.stat_data.unrelated.keep,3);
});

test('old T0 story snapshots get only approved recovery rules without resetting HP or stock',async()=>{
  const fixture=createOpeningFixture(),actor=structuredClone(fixture.actors.player);
  delete actor.state.recoveryRules;actor.state.resources.流风.current=2;
  actor.state.health.intact-=3;actor.state.health.L+=3;
  let saved={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'old-t0',revision:0,operations:{},actors:{player:actor}}}};
  const anchor={chatId:'old-t0',messageId:0,swipeId:0},opts={baseline:fixture.baseline,expectedChatId:'old-t0',
    getAnchor:()=>anchor,mvu:{getMvuData:()=>structuredClone(saved),replaceMvuData:async v=>{saved=structuredClone(v);}},
    drawDice:()=>Array(256).fill(8)};
  const runtime=createReplayCheckRuntime(opts),before=structuredClone(saved);
  runtime.recoveryState();assert.deepEqual(saved,before,'UI reads never migrate a save');
  const p={...anchor,text:'我服用雪莲子恢复流风'};
  assert.equal((await runtime.settle({operationId:'gm-runtime/old-t0/0/0',
    request:{kind:'recovery',type:'medicine',medicine:'雪莲子',resource:'流风'},context:{original:p,latest:p}})).status,'applied');
  const state=saved.stat_data['901_rules_poc'].actors.player.state;
  assert.equal(state.health.L,3);assert.equal(state.resources.流风.current,5);
  assert.equal(state.inventory.find(i=>i.name==='雪莲子').quantity,0);
  assert.equal(state.inventory.find(i=>i.name==='药B').quantity,3);
  const med={...anchor,text:'我打坐十五分钟'};
  assert.equal((await runtime.settle({operationId:'gm-runtime/old-t0/0/1',
    request:{kind:'recovery',type:'meditate',minutes:15},context:{original:med,latest:med}})).status,'applied');
  assert.ok(saved.stat_data['901_rules_poc'].actors.player.state.resources.流风.current>5);
});
const testTrigger = () => ({ id: 'test-only/arrival', condition: 'Test actor entered the configured window',
  satisfied: true, anchor: { chatId: 'replay-test', messageId: 0, swipeId: 0 } });

test('public breakdown identifies the selected attribute, main skill and applicable subskill', async () => {
  let saved = { stat_data: {} };
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => structuredClone(saved),
      replaceMvuData: async value => { saved = structuredClone(value); } } });
  await runtime.initialize({ openingAssumption: true });
  const request = { kind: 'check', attribute: '智力', skill: '学识', sub: '死灵学', dc: 3 };
  const before = structuredClone(saved);
  const { publicBasis } = runtime.prepareCheck(request);
  assert.deepEqual(publicBasis, {
    attribute: { name: '智力', value: 6 }, mainSkill: { name: '学识', value: 4 },
    subSkill: { name: '死灵学', value: 2 }, publicModifiers: [], publicSubtotal: 12, partial: true,
  });
  assert.equal(playerCheckDisplay(publicBasis), '智力 6 ＋ 学识 4 ＋ 死灵学 2；可公开部分 12 DP');
  // A wrong-but-known selection is visible to the player, not silently corrected.
  const wrong = runtime.prepareCheck({ ...request, attribute: '风度' }).publicBasis;
  assert.equal(playerCheckDisplay(wrong), '风度 4 ＋ 学识 4 ＋ 死灵学 2；可公开部分 10 DP');
  assert.throws(() => runtime.prepareCheck({ ...request, sub: '长剑' }), /sub|子|Unknown/i);
  assert.deepEqual(saved, before);
});

test('approved replay card settles an ordinary check once through MVU', async () => {
  let saved = { stat_data: { unrelated: { marker: 7 } } };
  let draws = 0;
  const anchor = { chatId: 'replay-test', messageId: 3, swipeId: 1 };
  const mvu = { getMvuData: () => structuredClone(saved),
    replaceMvuData: async value => { saved = structuredClone(value); } };
  const runtime = createReplayCheckRuntime({ baseline, mvu,
    expectedChatId: 'replay-test', getAnchor: () => anchor,
    drawDice: () => { draws++; return Array(256).fill(8); } });
  await runtime.initialize({ openingAssumption: true });
  const request = { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 };
  const first = await runtime.settle({ operationId: 'gm-runtime/replay-test/3/1', request });
  const second = await runtime.settle({ operationId: 'gm-runtime/replay-test/3/1', request });
  assert.equal(first.status, 'applied');
  assert.equal(second.status, 'already_applied');
  assert.equal(first.total, 6);
  assert.equal(first.success, true);
  assert.equal(draws, 1);
  assert.equal(saved.stat_data.unrelated.marker, 7);
  assert.equal(saved.stat_data['901_rules_poc'].revision, 1);
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.derived.hpMax, 15);
  await assert.rejects(runtime.settle({ operationId: 'gm-runtime/replay-test/3/1',
    request: { ...request, dc: 3 } }), /different/);
});

test('unknown opening state cannot silently initialize or spend resources', async () => {
  const mvu = { getMvuData: () => ({ stat_data: {} }), replaceMvuData: async () => {} };
  const runtime = createReplayCheckRuntime({ baseline, mvu,
    expectedChatId: 'replay-test', getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    drawDice: () => Array(256).fill(8) });
  await assert.rejects(runtime.initialize({}), /opening assumption/);
  const result = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0',
    request: { kind: 'check', attribute: '意志', skill: '洞察', dc: 2,
      resourceId: 'card.energy' } });
  assert.equal(result.status, 'needs_input');
});

test('granted demo scene modifier applies automatically once on the matching check', async () => {
  let saved = { stat_data: { unrelated: true } };
  let draws = 0;
  const anchor = { chatId: 'replay-test', messageId: 3, swipeId: 0 };
  const mvu = { getMvuData: () => structuredClone(saved),
    replaceMvuData: async value => { saved = structuredClone(value); } };
  const runtime = createReplayCheckRuntime({ baseline, mvu, expectedChatId: 'replay-test',
    getAnchor: () => anchor, drawDice: () => { draws++; return Array(256).fill(8); } });
  await runtime.initialize({ openingAssumption: true });
  const direct = { kind: 'direct_effect', effectId: 'demo.scene-cue' };
  const operationId = 'gm-runtime/replay-test/3/0';
  const first = await runtime.settle({ operationId, request: direct });
  const again = await runtime.settle({ operationId, request: direct });
  assert.equal(first.status, 'applied');
  assert.equal(again.status, 'already_applied');
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.checkEffects.length, 1);
  assert.equal(draws, 0);
  await assert.rejects(runtime.settle({ operationId: 'gm-runtime/replay-test/3/1', request: direct }),
    /already active/);
  anchor.messageId = 4;
  const checkRequest = { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 };
  const prepared = runtime.prepareCheck(checkRequest);
  assert.equal(prepared.publicBasis.attribute.value, 5);
  assert.equal(prepared.publicBasis.mainSkill.value, 1);
  assert.equal(prepared.publicBasis.publicSubtotal, 7);
  assert.equal('dc' in prepared.publicBasis, false);
  assert.deepEqual(prepared.choices, []);
  assert.deepEqual(prepared.publicBasis.publicModifiers, [{ source: '场景线索', value: 1 }]);
  const declined = await runtime.settle({ operationId: 'gm-runtime/replay-test/4/0', request: checkRequest, choiceId: 'skip' });
  assert.equal(declined.status, 'needs_input');
  assert.equal(draws, 0);
  const result = await runtime.settle({ operationId: 'gm-runtime/replay-test/4/0',
    request: checkRequest });
  assert.equal(result.status, 'applied');
  assert.equal(result.dp, 7);
  assert.equal(draws, 1);
  assert.equal((await runtime.settle({ operationId: 'gm-runtime/replay-test/4/0', request: checkRequest })).status, 'already_applied');
  assert.equal(draws, 1);
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.checkEffects.length, 0);
  assert.equal(saved.stat_data.unrelated, true);
});

test('ordinary check without choices rolls automatically and public basis omits hidden values', async () => {
  let saved = { stat_data: {} };
  let draws = 0;
  const mvu = { getMvuData: () => structuredClone(saved),
    replaceMvuData: async value => { saved = structuredClone(value); } };
  const runtime = createReplayCheckRuntime({ baseline, mvu, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    drawDice: () => { draws++; return Array(256).fill(8); } });
  await runtime.initialize({ openingAssumption: true });
  const request = { kind: 'check', attribute: '感知', skill: '洞察', dc: 4 };
  const prepared = runtime.prepareCheck(request);
  assert.deepEqual(prepared.choices, []);
  assert.equal(JSON.stringify(prepared.publicBasis).includes('4'), false);
  const result = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0', request });
  assert.equal(result.status, 'applied');
  assert.equal(draws, 1);
});

test('edited MVU effect value cannot become authoritative or appear in public pool', async () => {
  let saved = { stat_data: {} };
  const mvu = { getMvuData: () => structuredClone(saved),
    replaceMvuData: async value => { saved = structuredClone(value); } };
  const runtime = createReplayCheckRuntime({ baseline, mvu, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    drawDice: () => { throw Error('tampered effect must not roll'); } });
  await runtime.initialize({ openingAssumption: true });
  await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0',
    request: { kind: 'direct_effect', effectId: 'demo.scene-cue' } });
  saved.stat_data['901_rules_poc'].actors.player.state.checkEffects[0].value = 999;
  const request = { kind: 'check', attribute: '感知', skill: '洞察', dc: 2 };
  assert.throws(() => runtime.prepareCheck(request), /trusted.*effect|effect.*trusted/i);
  const next = await runtime.settle({ operationId: 'gm-runtime/replay-test/1/0',
    request, choiceId: 'demo.scene-cue' });
  assert.equal(next.status, 'needs_input');
});

test('runtime defers genetic unlock with unknown history before drawing', async () => {
  let saved = { stat_data: {} };
  let draws = 0;
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => structuredClone(saved),
      replaceMvuData: async value => { saved = structuredClone(value); } },
    geneticOpportunities: { crisis: { id: 'crisis', source: 'adopted-scene', kind: 'qualifying_crisis', visibility: 'public' } },
    drawDice: () => { draws++; return [10, 10]; } });
  await runtime.initialize({ openingAssumption: true });
  const result = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0',
    request: { kind: 'genetic_unlock', stage: 1, opportunityId: 'crisis' } });
  assert.equal(result.status, 'needs_input');
  assert.equal(draws, 0);
});

test('scripted fortune crosses the existing gate and recovers private continuation without rerolling', async () => {
  let data = { stat_data: {} }, draws = 0;
  let anchor = { chatId: 'replay-test', messageId: 0, swipeId: 0 };
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: anchor.chatId,
    getAnchor: () => anchor, mvu: { getMvuData: () => structuredClone(data),
      replaceMvuData: async value => { data = structuredClone(value); } },
    scriptedOpportunities: { hidden: { sourceId: 'test-only/adopted-rule', opportunityId: 'window-1',
      authorized: true, trigger: testTrigger(),
      visibility: 'secret', rollType: 'phb_fortune', successCondition: { minimum: 1 }, resolved: false } },
    drawDice: () => { draws++; return [10, 8]; } });
  await runtime.initialize({ openingAssumption: true });
  const request = { kind: 'scripted_fortune', opportunityId: 'hidden' };
  const decision = { status: 'CHECK_REQUIRED', reason: '可信规则授权', request };
  const posts = [];
  const args = { player: { ...anchor, text: '我经过岗亭。' }, classify: async () => decision,
    settle: input => runtime.settle(input),
    narrate: async () => { throw Error('test continuation failure'); },
    post: async (text, meta) => posts.push({ text, meta }) };
  const prompt = replayClassificationRequest({ context: { original: args.player, latest: args.player },
    scriptedOpportunityIds: ['hidden'] });
  assert.match(prompt.user_input, /scripted_fortune/);
  await assert.rejects(runGuardedTurn(args), /test continuation failure/);
  assert.equal(posts.length, 0);
  const operationId = 'gm-runtime/replay-test/0/0';
  const snapshot = structuredClone(data);
  const saved = data.stat_data['901_rules_poc'].operations[operationId];
  const recovery = savedDecisionForRecovery(null, saved);
  assert.deepEqual(recovery.request, request);
  const done = await runGuardedTurn({ ...args, classify: async () => recovery,
    narrate: async (_context, result) => {
      assert.equal('success' in result, false);
      const facts = runtime.scriptedNarrationFacts(operationId);
      assert.match(facts, /条件满足/);
      assert.doesNotMatch(facts, /window-1|test-only|\bDP\b|\bDC\b|\[10/);
      return '你注意到岗亭门边有一处可辨认的痕迹。';
    } });
  assert.equal(done.status, 'APPLIED');
  assert.deepEqual(posts[0].meta.result, {});
  assert.doesNotMatch(JSON.stringify(posts), /hidden|window-1|scripted_fortune|successCondition/);
  assert.equal(draws, 1);
  assert.deepEqual(data, snapshot);
  anchor = { ...anchor, messageId: 1 };
  const duplicate = await runGuardedTurn({ ...args, player: { ...anchor, text: '我继续走。' } });
  assert.equal(duplicate.status, 'UNRESOLVED');
  assert.equal(duplicate.pending.request, null);
  assert.equal(posts.length, 1);
  assert.equal(draws, 1);
  assert.deepEqual(data, snapshot);
});

test('gate rejects supplied fortune mechanics and runtime refuses untrusted or non-fortune opportunities', async () => {
  let data = { stat_data: {} };
  const player = { chatId: 'replay-test', messageId: 0, swipeId: 0, text: '我经过岗亭。' };
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: player.chatId,
    getAnchor: () => player, mvu: { getMvuData: () => structuredClone(data),
      replaceMvuData: async value => { data = structuredClone(value); } },
    scriptedOpportunities: {
      threshold: { sourceId: 'test-only', opportunityId: 'threshold', visibility: 'public',
        rollType: 'd10_threshold', successCondition: { minimum: 8 }, resolved: false },
      incomplete: { sourceId: 'test-only', opportunityId: 'incomplete', visibility: 'secret',
        rollType: 'phb_fortune', resolved: false }
    }, drawDice: () => { throw Error('must not draw'); } });
  await runtime.initialize({ openingAssumption: true });
  const before = structuredClone(data);
  const args = { player, settle: input => runtime.settle(input),
    narrate: async () => { throw Error('must not narrate'); },
    post: async () => { throw Error('must not reveal hidden failure'); } };
  for (const opportunityId of ['invented', 'threshold', 'incomplete']) {
    const result = await runGuardedTurn({ ...args, classify: async () => ({ status: 'CHECK_REQUIRED',
      reason: '不公开的机会理由', request: { kind: 'scripted_fortune', opportunityId } }) });
    assert.equal(result.status, opportunityId === 'incomplete' ? 'NEEDS_INPUT' : 'UNRESOLVED');
  }
  await assert.rejects(runGuardedTurn({ ...args, classify: async () => ({ status: 'CHECK_REQUIRED',
    reason: '试图自带规则', request: { kind: 'scripted_fortune', opportunityId: 'invented',
      rollType: 'phb_fortune', successCondition: { minimum: 1 } } }) }), /only a trusted opportunity ID/);
  assert.deepEqual(data, before);
});

test('runtime scripted opportunity resolves once without leaking secret roll data', async () => {
  let saved = { stat_data: {} };
  let draws = 0;
  const spec = { sourceId: 'adopted-rule', opportunityId: 'window-1', actorId: 'player',
    authorized: true, trigger: testTrigger(),
    visibility: 'secret', rollType: 'phb_fortune', successCondition: { minimum: 1 }, resolved: false };
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => structuredClone(saved),
      replaceMvuData: async value => { saved = structuredClone(value); } },
    scriptedOpportunities: { hidden: spec },
    drawDice: () => { draws++; return [10, 8]; } });
  await runtime.initialize({ openingAssumption: true });
  const request = { kind: 'scripted_fortune', opportunityId: 'hidden' };
  const first = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0', request });
  const recovered = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0', request });
  const other = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/1', request });
  assert.equal(first.status, 'applied');
  assert.equal(recovered.status, 'already_applied');
  assert.equal(other.status, 'already_resolved');
  assert.equal(draws, 1);
  assert.equal('success' in first, false);
  assert.equal('roll' in first, false);
});

test('scripted opportunity requires explicit authorization and a satisfied current-branch trigger', async () => {
  let data = { stat_data: {} }, draws = 0;
  const anchor = { chatId: 'replay-test', messageId: 0, swipeId: 0 };
  const spec = { sourceId: 'test-only/rule', opportunityId: 'window', visibility: 'secret',
    rollType: 'phb_fortune', successCondition: { minimum: 1 }, resolved: false };
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: anchor.chatId,
    getAnchor: () => anchor, scriptedOpportunities: { hidden: spec },
    mvu: { getMvuData: () => structuredClone(data),
      replaceMvuData: async value => { data = structuredClone(value); } },
    drawDice: () => { draws++; return [1]; } });
  await runtime.initialize({ openingAssumption: true });
  const input = { operationId: 'gm-runtime/replay-test/0/0',
    request: { kind: 'scripted_fortune', opportunityId: 'hidden' } };
  for (const patch of [
    {}, { authorized: true }, { trigger: { ...testTrigger(), satisfied: false } },
    { trigger: { ...testTrigger(), condition: '' } },
    { trigger: { ...testTrigger(), anchor: { ...anchor, swipeId: 1 } } }
  ]) {
    Object.assign(spec, patch);
    assert.deepEqual(runtime.scriptedOpportunityIds(), []);
    assert.equal((await runtime.settle(input)).status, 'needs_input');
    assert.equal(draws, 0);
    assert.equal(data.stat_data['901_rules_poc'].revision, 0);
  }
  spec.trigger = testTrigger();
  assert.deepEqual(runtime.scriptedOpportunityIds(), ['hidden']);
  assert.equal((await runtime.settle(input)).status, 'applied');
  assert.deepEqual(runtime.scriptedOpportunityIds(), []);
  assert.match(runtime.scriptedNarrationFacts(input.operationId), /条件未满足/);
  const snapshot = structuredClone(data);
  spec.trigger.satisfied = false;
  assert.equal((await runtime.settle(input)).status, 'already_applied');
  assert.equal(draws, 1);
  assert.deepEqual(data, snapshot);
});

test('runtime does not draw for an unspecified event chance', async () => {
  let saved = { stat_data: {} };
  let draws = 0;
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => structuredClone(saved),
      replaceMvuData: async value => { saved = structuredClone(value); } },
    scriptedOpportunities: { hidden: { sourceId: 'scene', opportunityId: 'window',
      visibility: 'secret', rollType: 'd10_threshold', resolved: false } },
    drawDice: () => { draws++; return [10]; } });
  await runtime.initialize({ openingAssumption: true });
  const result = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0',
    request: { kind: 'scripted_fortune', opportunityId: 'hidden' } });
  assert.equal(result.status, 'deferred');
  assert.equal(draws, 0);
  assert.equal(saved.stat_data['901_rules_poc'].revision, 0);
});

test('runtime refuses secret genetic and non-fortune event rolls before drawing', async () => {
  let saved = { stat_data: {} };
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => structuredClone(saved),
      replaceMvuData: async value => { saved = structuredClone(value); } },
    geneticOpportunities: { crisis: { id: 'crisis', source: 'test-only',
      kind: 'qualifying_crisis', visibility: 'secret' } },
    scriptedOpportunities: { event: { sourceId: 'test-only', opportunityId: 'event',
      visibility: 'secret', rollType: 'd10_threshold', successCondition: { minimum: 8 }, resolved: false } },
    drawDice: () => { throw Error('Unsupported secret check must not draw'); } });
  await runtime.initialize({ openingAssumption: true });
  for (const request of [
    { kind: 'genetic_unlock', stage: 1, opportunityId: 'crisis' },
    { kind: 'genetic_unlock', stage: 2, opportunityId: 'crisis' },
    { kind: 'scripted_fortune', opportunityId: 'event' },
  ]) assert.equal((await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0', request })).status, 'deferred');
  assert.equal(saved.stat_data['901_rules_poc'].revision, 0);
});

test('explicit sourced history lets a new isolated runtime commit first unlock once', async () => {
  let saved = { stat_data: {} };
  let draws = 0;
  const runtime = createReplayCheckRuntime({ baseline, expectedChatId: 'replay-test',
    getAnchor: () => ({ chatId: 'replay-test', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => structuredClone(saved),
      replaceMvuData: async value => { saved = structuredClone(value); } },
    initialGeneticLock: { source: 'explicit-test-history', successfulUnlocks: { 1: 0 },
      highestStage: 0, activeStage: 0 },
    geneticOpportunities: { crisis: { id: 'crisis', source: 'explicit-scene',
      kind: 'qualifying_crisis' } },
    drawDice: () => { draws++; return [10]; } });
  await runtime.initialize({ openingAssumption: true });
  const request = { kind: 'genetic_unlock', stage: 1, opportunityId: 'crisis',
    roleplayModifier: { value: 0, source: 'GM', reason: 'No added reward' } };
  const first = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0', request });
  const again = await runtime.settle({ operationId: 'gm-runtime/replay-test/0/0', request });
  assert.equal(first.status, 'applied');
  assert.equal(first.visibility, 'public');
  assert.equal(first.success, true);
  assert.equal(again.status, 'already_applied');
  assert.equal(draws, 1);
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.geneticLock.successfulUnlocks[1], 1);
  assert.equal(saved.stat_data['901_rules_poc'].actors.player.state.geneticLock.activeStage, 1);
});

test('classifier state distinguishes stored status points from current contributions without rewriting MVU',async()=>{
 const fixture=createRecoveryFixture();let data={stat_data:{}},writes=0;
 const anchor={chatId:'status-applicability-test',messageId:0,swipeId:0};
 const rt=createReplayCheckRuntime({baseline:fixture.baseline,expectedChatId:anchor.chatId,getAnchor:()=>anchor,
  mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async value=>{writes++;data=structuredClone(value);}}});
 await rt.initialize({openingAssumption:true});
 const s=data.stat_data['901_rules_poc'].actors.player.state;
 s.statuses=[{type:'恐惧',source:'actual-fear',points:5,applicability:{families:['mind'],grade:'C'}}];
 s.resourceCapabilities={ward:{id:'mindImmunity',source:'actual-ward',level:2}};
 const saved=structuredClone(data),count=writes;
 let actor=rt.ruleContext().actors.find(x=>x.id==='player');
 assert.deepEqual(actor.statusContributions,[{statusIndex:0,active:false,effectivePoints:0}]);
 assert.equal(actor.statuses[0].points,5);assert.deepEqual(data,saved);assert.equal(writes,count);
 delete s.resourceCapabilities.ward;
 actor=rt.ruleContext().actors.find(x=>x.id==='player');
 assert.deepEqual(actor.statusContributions,[{statusIndex:0,active:true,effectivePoints:5}]);
 assert.equal(writes,count);
});
