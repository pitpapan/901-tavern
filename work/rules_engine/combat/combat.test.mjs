import test from 'node:test';
import assert from 'node:assert/strict';
import { createDuel } from './catalog.mjs';
import { act, currentContext, panel, resolveDefense } from './engine.mjs';
import { createCombatRuntime, legalCommands, chooseAction } from './runtime.mjs';
import { createTavernCombat } from './tavern.mjs';

const dice = () => Array(400).fill(8);
const use = (b, actorId, abilityId, extra = {}) =>
  act(b, { actorId, abilityId, ...extra }, { drawDice: dice }).battle;

test('model can only choose current legal actions; already drawn weapon is excluded', async () => {
  const b=use(createDuel(),'huang','draw');
  assert.ok(!legalCommands(b).some(c=>c.abilityId==='draw'));
  const options=legalCommands(b), i=options.findIndex(c=>c.abilityId==='thunder'&&!c.payment);
  let sent;
  const out=await chooseAction({read:()=>({battle:b}),context:()=>({...currentContext(b),revision:1})},
    async request=>{ sent=request; return JSON.stringify({option:i}); });
  assert.equal(out.command.abilityId,'thunder');
  assert.equal(sent.max_chat_history,0);
  assert.deepEqual(sent.ordered_prompts.map(x=>typeof x==='string'?x:x.role),['system','user_input']);
});
test('confirmed panels, only combatants loaded, effects do not leak from history', () => {
  const b = createDuel();
  assert.equal(panel(b, 'jiang').health.intact, 35);
  assert.equal(panel(b, 'huang').health.intact, 23);
  assert.equal(panel(b, 'jiang').attack.dp, 44);
  assert.equal(panel(b, 'huang').attack.dp, 37);
  assert.equal(panel(b, 'jiang').speed, 41);
  assert.equal(panel(b, 'huang').speed, 23);
  const context = currentContext(b);
  assert.deepEqual(context.participants.map(x => x.id).sort(), ['huang', 'jiang']);
  assert.ok(!JSON.stringify(context).includes('御临风'));
  assert.ok(!JSON.stringify(context).includes('operations'));
});

test('draw, free block, lightning, then automatic defense/action/energy changes', () => {
  let b = createDuel();
  b = use(b, 'huang', 'draw');
  b = use(b, 'huang', 'block');
  assert.equal(panel(b, 'huang', 'jiang').defense.total, 37);
  const out = act(b, { actorId: 'huang', abilityId: 'thunder', targetId: 'jiang' }, { drawDice: dice });
  b = out.battle;
  assert.equal(b.actors.huang.state.resources.灵力.current, 5);
  assert.equal(b.actors.huang.state.turn.standard, 0);
  assert.equal(panel(b, 'huang', 'jiang').defense.total, 35);
  assert.equal(out.result.attack.rawDP, 55);
  assert.equal(out.result.attack.cap, 14);
  assert.equal(out.result.attack.defense.total, 3);
  assert.equal(out.result.damage.reduce((n, d) => n + d.actualDamage, 0), 14);
  assert.equal(b.actors.jiang.state.health.intact, 21);
  assert.throws(() => use(b, 'huang', 'thunder', { targetId: 'jiang' }));
  b = use(b, 'huang', 'end');
  assert.equal(b.activeId, 'jiang');
  b = use(b, 'jiang', 'end');
  assert.equal(b.round, 2);
  assert.equal(b.actors.jiang.state.health.intact, 22);
  assert.equal(panel(b, 'huang', 'jiang').defense.total, 28);
});

test('RE penetration consumes only matching defense and does not duplicate reductions', () => {
  let b = createDuel();
  b = use(b, 'huang', 'draw');
  b = use(b, 'huang', 'block');
  const d = resolveDefense(b, 'huang', 'jiang', { ap: 3, speed: 4, magic: 0 });
  assert.equal(d.total, 30);
  assert.equal(d.parts.armor, 5);
  assert.equal(d.parts.base, 7);
  assert.equal(d.extraSuccesses, 3);
});

test('combo belongs to target, qi is not inner power, rejected command leaves input unchanged', () => {
  let b = use(createDuel(), 'huang', 'end');
  b = use(b, 'jiang', 'fistQi');
  assert.equal(panel(b, 'jiang').attack.dp, 46);
  assert.equal(b.actors.jiang.state.resources.气.current, 1);
  const before = structuredClone(b);
  assert.throws(() => use(b, 'jiang', 'strike', { targetId: 'huang', empowered: true }), /气/);
  assert.deepEqual(b, before);
  b = use(b, 'jiang', 'strike', { targetId: 'huang' });
  assert.equal(b.actors.jiang.combos.huang, 1);
  assert.equal(b.actors.jiang.state.resources.内力.current, 28);
});

test('once per scene damage conversion is explicit and converts entire mixed hit', () => {
  let b = createDuel();
  b.actors.jiang.reactions.damageConversion = true;
  b = use(b, 'huang', 'draw');
  const out = act(b, { actorId: 'huang', abilityId: 'thunder', targetId: 'jiang' }, { drawDice: dice });
  assert.equal(out.battle.actors.jiang.used.damageConversion, true);
  assert.equal(out.battle.actors.jiang.state.health.A, 0);
  assert.equal(out.battle.actors.jiang.state.health.L, 2);
  assert.equal(out.battle.actors.jiang.state.health.B, 12);
});

test('summon has independent turn and persists health and once-per-scene uses across recall', () => {
  let b = createDuel();
  b = use(b, 'huang', 'summon');
  assert.equal(b.actors.huang.state.resources.灵力.current, 3);
  assert.ok(currentContext(b).participants.some(x => x.id === 'lotus'));
  b = use(b, 'huang', 'end');
  assert.equal(b.activeId, 'lotus');
  b = act(b, { actorId: 'lotus', abilityId: 'roar', targetId: 'jiang' },
    { drawDice: () => Array(400).fill(1) }).battle;
  assert.equal(b.actors.lotus.used.roar, true);
  assert.equal(b.actors.lotus.state.turn.swift, 0);
  assert.equal(b.actors.jiang.state.health.intact, 27); // C级咆哮8L，零成功反射。
});

test('movement triggers one legal opportunity, five-foot step avoids it', () => {
  let b=use(createDuel(),'huang','draw');
  b=use(b,'huang','end');
  const moved=act(b,{actorId:'jiang',abilityId:'move',to:[4,0]},{drawDice:dice});
  assert.equal(moved.result.opportunities.length,1);
  assert.equal(moved.battle.actors.huang.state.turn.opportunityUsed,true);
  const stepped=act(b,{actorId:'jiang',abilityId:'step',to:[2.5,0]},{drawDice:dice});
  assert.equal(stepped.result.opportunities,undefined);
  assert.equal(stepped.battle.actors.jiang.state.health.intact,35);
});

test('restraint payment affects subsequent panels and immobilizes beyond will', () => {
  let b=use(createDuel(),'huang','draw');
  b=use(b,'huang','thunder',{targetId:'jiang',payment:'restraint'});
  assert.equal(panel(b,'huang').attack.dp,36);
  assert.equal(panel(b,'huang').speed,22);
  assert.equal(b.actors.huang.state.resources.灵力.current,6);
  b.actors.huang.state.statuses[0].points=6;
  assert.equal(panel(b,'huang').speed,0);
  assert.throws(()=>use(b,'huang','strike',{targetId:'jiang'}),/定身/);
});

test('龙象 ignores four points of conversion, not four free bonus damage', () => {
  let b=use(createDuel(),'huang','draw');
  b=use(b,'huang','conversion',{enabled:true});
  b=use(b,'huang','end');
  const out=act(b,{actorId:'jiang',abilityId:'strike',targetId:'huang'},
    {drawDice:()=>[...Array(21).fill(8),...Array(400).fill(1)]});
  assert.equal(out.battle.actors.huang.state.health.L,4);
  assert.equal(out.battle.actors.huang.state.health.B,19);
  assert.equal(out.battle.actors.huang.state.health.intact,0);
});

test('life squeezing records increasing recovery restrictions and rapid healing respects them', () => {
  let b=use(createDuel(),'huang','end');
  b.actors.jiang.squeezed=5;
  b.actors.jiang.state.resources.气.current=0;
  b=use(b,'jiang','squeeze',{resource:'气'});
  assert.equal(b.actors.jiang.recoveryLocks[0].recovery,'aggravated');
  b=use(b,'jiang','end');
  assert.equal(b.actors.jiang.state.health.L,1);
});

test('complete duel uses one resolver for companion and enemy, then stops', () => {
  let b=createDuel(), seed=31, count=0;
  const drawDice=()=>Array.from({length:400},()=>{seed=(seed*1664525+1013904223)>>>0;return seed%10+1;});
  const trace=[];
  while(b.status==='active'&&count++<120) {
    const a=b.actors[b.activeId], options=legalCommands(b);
    const priority=a.kind==='huang'?['draw','block','conversion','thunder','strike','end']
      :['conversion','fistQi','block','strike','end'];
    const c=priority.map(id=>options.find(c=>c.abilityId===id&&!c.payment)).find(Boolean);
    assert.ok(c);
    const out=act(b,c,{drawDice});b=out.battle;trace.push(out.result.abilityId);
  }
  assert.equal(b.status,'finished');
  assert.ok(trace.includes('thunder')&&trace.includes('fistQi')&&trace.includes('strike'));
  assert.ok(b.actors.huang.used.damageConversion&&b.actors.jiang.used.damageConversion);
  for(const a of Object.values(b.actors)) {
    assert.equal(a.state.health.intact+a.state.health.B+a.state.health.L+a.state.health.A,a.state.derived.hpMax);
    assert.ok(Object.values(a.state.resources).every(p=>p.current>=0&&p.current<=p.max));
  }
  assert.throws(()=>use(b,b.activeId,'end'),/结束/);
});

test('MVU settles and writes once, preserves unrelated state, readback supplies next prompt', async () => {
  let data = { stat_data: { world: { weather: '晴' } } };
  let writes = 0, rolls = 0;
  const mvu = { getMvuData: () => structuredClone(data),
    replaceMvuData: async value => { data = structuredClone(value); writes++; } };
  const runtime = createCombatRuntime({ mvu, getAnchor: () => ({ chatId: 'duel', messageId: 0, swipeId: 0 }),
    expectedChatId: 'duel', drawDice: () => { rolls++; return dice(); } });
  await runtime.initialize(createDuel());
  await runtime.dispatch({ operationId: 'draw', expectedRevision: 0,
    command: { actorId: 'huang', abilityId: 'draw' } });
  const request = { operationId: 'hit', expectedRevision: 1,
    command: { actorId: 'huang', abilityId: 'thunder', targetId: 'jiang' } };
  const first = await runtime.dispatch(request);
  const rollCount = rolls;
  const repeated = await runtime.dispatch(request);
  assert.equal(repeated.status, 'already_applied');
  assert.deepEqual(repeated.result, first.result);
  assert.equal(rolls, rollCount);
  assert.equal(writes, 3);
  assert.deepEqual(data.stat_data.world, { weather: '晴' });
  assert.equal(runtime.context().participants.find(x => x.id === 'jiang').health.intact, 21);
  // Existing engine/MVU endpoints own the same actors. Combat must read that
  // authoritative state, not a second stale HP/energy snapshot.
  data.stat_data['901_rules_poc'].actors.jiang.state.resources.内力.current=12;
  assert.equal(runtime.context().participants.find(x=>x.id==='jiang').energy.内力.current,12);
});

test('Tavern controller posts and carries results; refreshing and report replay never settle again', async () => {
  const floors=[{stat_data:{world:{location:'演练场'}}}];
  const tavern={chatId:'browser-test',chat:[{mes:'开场',swipe_id:0}]};
  let calls=0;
  const deps={
    tavern,expectedChatId:'browser-test',
    mvu:{getMvuData:({message_id})=>structuredClone(floors[message_id]),
      replaceMvuData:async(value,{message_id})=>{floors[message_id]=structuredClone(value);}},
    generateRaw:async request=>{
      calls++;
      const context=JSON.parse(request.user_input);
      return JSON.stringify({option:context.legalOptions.findIndex(c=>c.abilityId==='draw')});
    },
    createChatMessages:async messages=>{
      for(const m of messages) {tavern.chat.push({mes:m.message,swipe_id:0});floors.push({stat_data:{world:{location:'演练场'}}});}
    },
  };
  const controller=createTavernCombat(deps);
  await controller.initialize();
  await controller.run({single:true});
  assert.equal(controller.read().revision,1);
  assert.equal(controller.read().battle.actors.huang.sheathed,false);
  const refreshed=createTavernCombat(deps);
  const replay=await refreshed.resumeReport();
  assert.equal(replay.status,'report_replayed');
  assert.equal(calls,1);
  assert.equal(refreshed.read().revision,1);
  assert.match(tavern.chat.at(-1).mes,/没有重新掷骰/);
  assert.deepEqual(floors.at(-1).stat_data.world,{location:'演练场'});
  assert.equal(Object.keys(floors.at(-1).stat_data['901_rules_poc'].operations).length,1);
});
