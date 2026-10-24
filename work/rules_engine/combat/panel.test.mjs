import test from 'node:test';
import assert from 'node:assert/strict';
import { createDuel } from './catalog.mjs';
import { act, currentContext, panel } from './engine.mjs';
import { chooseAction, legalCommands } from './runtime.mjs';

const use = (b, actorId, abilityId, extra = {}) =>
  act(b, { actorId, abilityId, ...extra }, { drawDice: () => Array(512).fill(1) }).battle;

test('target-specific panel matches resolution including initiative, combo and penetration', () => {
  let b = use(createDuel(), 'huang', 'draw');
  b = use(b, 'huang', 'block');
  b = use(b, 'huang', 'end');
  b.actors.jiang.combos.huang = 3;
  const before = structuredClone(b);
  const context = currentContext(b);
  const matchup = context.matchups?.find(x => x.attackerId === 'jiang' && x.targetId === 'huang');
  assert.ok(matchup, 'normal attack must be calculated against its actual target');
  assert.equal(matchup.attackDP, 47);
  assert.equal(matchup.defenseDP, 30);
  assert.equal(matchup.rollDP, 17);
  assert.equal(matchup.defenseAuto, 3);
  const out = act(b, { actorId: 'jiang', abilityId: 'strike', targetId: 'huang' },
    { drawDice: () => Array(512).fill(1) });
  assert.equal(matchup.attackDP, out.result.attack.rawDP);
  assert.equal(matchup.defenseDP, out.result.attack.defense.total);
  assert.equal(matchup.rollDP, out.result.attack.rawDP - out.result.attack.defense.total);
  assert.deepEqual(b, before, 'rendering a panel must not mutate combat state');
});

test('compact panel distinguishes readiness and includes only live modifiers', () => {
  const b = createDuel();
  b.round = 5;
  b.actors.huang.buffs = { drawnRound: 1, drawUsed: false, block: false };
  b.actors.huang.cooldowns = { thunder: 4, lightning: 7 };
  b.actors.huang.state.statuses = [
    { type: '疲乏', points: 1, source: 'a' }, { type: '疲乏', points: 2, source: 'b' },
    { type: '麻痹', points: 1, source: 'c' }, { type: '麻痹', points: 2, source: 'd' },
  ];
  b.actors.jiang.squeezed = 6;
  b.actors.jiang.recoveryLocks = [{ severity: 'L', count: 1, recovery: 'aggravated', source: '生命压榨' }];
  const c = currentContext(b), h = c.participants.find(a => a.id === 'huang');
  assert.equal(h.weaponReady, false);
  assert.equal(h.defense.total, panel(b, 'huang').defense.total);
  assert.ok(Object.values(h.defense.parts).every(v => v !== 0));
  assert.deepEqual(h.cooldowns, { lightning: 2 });
  assert.equal(h.buffs?.drawnRound, undefined);
  assert.equal(h.buffs?.drawReady, undefined);
  assert.deepEqual(h.statuses.map(s => [s.type, s.points]), [['疲乏', 3], ['麻痹', 2]]);
  assert.equal(c.participants.find(a => a.id === 'jiang').squeezed, 6);
  assert.equal(c.participants.find(a => a.id === 'jiang').recoveryLocks[0].count, 1);
  assert.equal(c.commandSchema, undefined);
});

test('legal movement uses reduced current speed, not the static base speed', () => {
  const b = use(createDuel(), 'huang', 'draw');
  b.actors.huang.state.statuses.push({ type: '精神束缚', points: 1, source: '代付' });
  const c = legalCommands(b).find(c => c.abilityId === 'move');
  assert.ok(c, 'reduced speed must still allow a legal move');
  assert.deepEqual(c.to, [-22, 0]);
});

test('model gets one coherent snapshot and compact commands still map to trusted actions', async () => {
  const b = use(createDuel(), 'huang', 'draw');
  let reads = 0, sent;
  const runtime = {
    read: () => { reads++; return { battle: b, revision: 7 }; },
    context: () => { const { battle, revision } = runtime.read(); return { ...currentContext(battle), revision }; },
  };
  const out = await chooseAction(runtime,
    async request => {
      sent = JSON.parse(request.user_input);
      return JSON.stringify({ option: sent.legalOptions.findIndex(c => c.abilityId === 'thunder' && !c.payment && !c.strength) });
    });
  assert.equal(reads, 1);
  assert.equal(out.expectedRevision, 7);
  assert.deepEqual(out.command, { actorId: 'huang', abilityId: 'thunder', targetId: 'jiang' });
  assert.ok(sent.legalOptions.every(c => !Object.hasOwn(c, 'actorId')));
  assert.equal(sent.revision, 7);
  assert.ok(JSON.stringify(sent).length < 6491, 'target-aware prompt must remain smaller than the old 6491-character prompt');
});

test('summon joins the projection, recalled actors disappear, and only active matchups are expanded', () => {
  let b = use(createDuel(), 'huang', 'summon');
  let c = currentContext(b);
  assert.ok(c.participants.find(a => a.id === 'lotus').abilities.includes('roar'));
  assert.ok(c.abilities.roar);
  assert.ok(c.matchups.every(m => m.attackerId === 'huang' || m.targetId === 'huang'));
  b = use(b, 'huang', 'end');
  c = currentContext(b);
  assert.ok(c.matchups.every(m => m.attackerId === 'lotus' || m.targetId === 'lotus'));
  b = use(b, 'lotus', 'recall');
  c = currentContext(b);
  assert.ok(!c.participants.some(a => a.id === 'lotus'));
  assert.equal(c.abilities.roar, undefined);
  assert.ok(c.matchups.every(m => m.attackerId !== 'lotus' && m.targetId !== 'lotus'));
});
