import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCharacter, effectiveAttribute, rollPool, check, oppose, effectiveSkill, beginTurn, endTurn, spendAction, advanceMultiRoundAction,
  applyWounds, lifeStatus, advanceDeterioration, checkBeforeAction, firstAid, resolveAttack, resolveDamage,
  recover, applyStatus, spendWill, changeDefinedResource, upgradeAttribute, upgradeSkill, settleNode,
} from './core.mjs';

const attrs = { 力量: 4, 敏捷: 3, 智力: 2, 感知: 3, 意志: 3, 风度: 2 };
const person = overrides => createCharacter({ attributes: attrs, size: 5, ...overrides });

test('D10 explosions, luck die, and no invented success on luck 8', () => {
  assert.deepEqual(rollPool(2, [10, 8, 10, 7]).dice, [10, 8, 10, 7]);
  assert.equal(rollPool(2, [10, 8, 10, 7]).rolledSuccesses, 3);
  assert.equal(rollPool(0, [8]).rolledSuccesses, 0);
  assert.equal(rollPool(-2, [10, 8]).rolledSuccesses, 2);
  assert.equal(rollPool(0, [1]).luckMishap, true);
});

test('main and one matching sub contribute to pool and autos even with zero rolled successes', () => {
  const c = person({ attributes: { ...attrs, 力量: 6 },
    skills: { 白刃: { level: 5, subs: { 长剑: { level: 5 }, 斧: { level: 5 } } } } });
  assert.deepEqual(effectiveSkill(c, '白刃', '长剑'), { level: 10, auto: 2, main: 5, sub: 5 });
  const result = check(c, { attribute: '力量', skill: '白刃', sub: '长剑',
    dice: Array(16).fill(1), dc: 3, reExtraSuccesses: 5 });
  assert.equal(result.rolledSuccesses, 0);
  assert.equal(result.autoSuccesses, 3);
  assert.equal(result.reExtraSuccesses, 0);
  assert.equal(result.success, true);
  assert.equal(check(c, { eligible: false, dice: [] }).eligible, false);
});

test('ordinary active opposition succeeds at equal successes', () => {
  const c = person();
  const result = oppose(c, c,
    { attribute: '力量', dice: [8, 1, 1, 1] },
    { attribute: '力量', dice: [8, 1, 1, 1] });
  assert.equal(result.success, true);
  assert.equal(result.margin, 0);
});

test('PHB action counts, one-way conversions, reflex lock and response debt', () => {
  let c = beginTurn(person()).state;
  assert.equal(beginTurn(c).result.allowed, false);
  c = spendAction(c, 'attack').state;
  assert.equal(spendAction(c, 'attack').result.allowed, false);
  c = spendAction(c, 'move').state;
  c = spendAction(c, 'swift').state;
  assert.equal(spendAction(c, 'swift').result.allowed, false);
  c = endTurn(c).state;
  c = beginTurn(c).state;
  c = spendAction(c, 'reflex').state;
  assert.equal(spendAction(c, 'swift').result.allowed, false);
  c = endTurn(c).state;
  c = beginTurn(c).state;
  assert.equal(spendAction(c, 'swift').result.allowed, false);
  c = endTurn(c).state;
  c = spendAction(c, 'response', { betweenActions: true }).state;
  assert.equal(spendAction(c, 'opportunity', { enemyLeavesThreat: true }).result.allowed, false);
  c = beginTurn(c).state;
  assert.equal(c.turn.phase, 'skipped');
  assert.equal(spendAction(c, 'opportunity', { enemyLeavesThreat: true }).result.allowed, false);
});

test('multi-round action uses one full round on each turn and tracks completion', () => {
  let c = beginTurn(person()).state;
  let step = advanceMultiRoundAction(c, { id: 'reload', totalRounds: 2 });
  assert.equal(step.result.completed, false);
  assert.equal(spendAction(step.state, 'attack').result.allowed, false);
  c = beginTurn(endTurn(step.state).state).state;
  step = advanceMultiRoundAction(c, { id: 'reload', totalRounds: 2 });
  assert.equal(step.result.completed, true);
});

test('PHB B/L/A pointwise upgrades differ for B and L', () => {
  const base = person({ health: { intact: 0, B: 1, L: 1, A: 0 } });
  assert.deepEqual(applyWounds(base, { B: 2 }).state.health,
    { intact: 0, B: 0, L: 1, A: 1, temp: 0, coma: false, deteriorationStopped: false });
  assert.deepEqual(applyWounds(base, { L: 1 }).state.health,
    { intact: 0, B: 0, L: 1, A: 1, temp: 0, coma: false, deteriorationStopped: false });
  const mixed = applyWounds(person({ health: { intact: 1, B: 1, L: 0, A: 0 } }), { B: 1, L: 1 });
  assert.deepEqual(mixed.result.changes.map(c => `${c.from}->${c.to}`), ['intact->B', 'B->A']);
});

test('no intact B needs explicit DC; A deterioration needs explicit B/L choice and all A kills', () => {
  const b = person({ health: { intact: 0, B: 2, L: 0, A: 0 } });
  assert.equal(lifeStatus(b).state, 'B-check');
  const bTurn = beginTurn(b).state;
  assert.equal(spendAction(bTurn, 'attack').result.allowed, false);
  assert.equal(spendAction(bTurn, 'attack', { preActionCheck: { dc: 1, dice: [8, 1, 1, 1] } }).result.allowed, true);
  assert.throws(() => checkBeforeAction(b, { dice: [1, 1, 1, 1] }), /supply GM DC/);
  const failed = checkBeforeAction(b, { dc: 1, dice: [1, 1, 1, 1] });
  assert.equal(lifeStatus(failed.state).state, 'unconscious');
  const a = person({ health: { intact: 0, B: 1, L: 1, A: 1 } });
  assert.throws(() => advanceDeterioration(a), /supply from/);
  const once = advanceDeterioration(a, { from: 'B' });
  assert.equal(once.state.health.A, 2);
  const dead = advanceDeterioration(once.state);
  assert.equal(dead.result.life.state, 'dead');
  assert.equal(recover(dead.state, { type: 'sevenDays', longRests: 7 }).result.allowed, false);
});

test('first aid stops A deterioration without healing a slot', () => {
  const healer = beginTurn(person({ skills: { 医学: { level: 1 } } })).state;
  const patient = person({ health: { intact: 0, B: 1, L: 0, A: 1 } });
  const result = firstAid(healer, patient, { dice: [8, 1, 1, 1] });
  assert.equal(result.result.success, true);
  assert.equal(result.patient.health.intact, 0);
  assert.equal(result.result.life.deteriorating, false);
});

test('ordinary melee attack traces A/B/C and PHB L wound on a healthy target', () => {
  const attacker = beginTurn(person({ attributes: { ...attrs, 力量: 6 },
    skills: { 白刃: { level: 5, subs: { 长剑: { level: 3 } } } } })).state;
  const target = person({ health: { intact: 9, B: 0, L: 0, A: 0 } });
  const result = resolveAttack(attacker, target, {
    weapon: { type: 'melee', sub: '长剑', damage: 2, severity: 'L' },
    dice: [8, 8, 8, ...Array(10).fill(1)],
    defenses: [{ id: 'armor', kind: 'dr', value: 2 }],
  });
  assert.equal(result.result.hit, true);
  assert.equal(result.result.cap, 16);
  assert.equal(result.result.roll.rolledSuccesses, 3);
  assert.equal(result.result.actualDamage, 3); // 3 dice + 2 autos - 2 DR
  assert.deepEqual(result.target.health, { intact: 6, B: 0, L: 3, A: 0,
    temp: 0, coma: false, deteriorationStopped: false });
  assert.equal(resolveAttack(result.attacker, result.target, {
    weapon: { type: 'melee', damage: 2, severity: 'L' }, dice: [],
  }).result.allowed, false);
});

test('same-category DR takes maximum except explicitly additive source', () => {
  const target = person();
  const result = resolveDamage(target, { amount: 6, severity: 'B', kind: 'physical' }, [
    { kind: 'dr', value: 2 }, { kind: 'dr', value: 3 }, { kind: 'dr', value: 1, stacking: 'add' },
  ]);
  assert.equal(result.result.actualDamage, 2);
});

test('energy resistance applies by type, then temporary HP absorbs at C stage', () => {
  const target = person({ health: { intact: 9, B: 0, L: 0, A: 0, temp: 1 } });
  const outcome = resolveDamage(target, { amount: 5, severity: 'L', kind: 'energy', energyType: 'fire' }, [
    { kind: 'dr', value: 9 },
    { kind: 'energyResistance', energyType: 'cold', value: 9 },
    { kind: 'energyResistance', energyType: 'fire', value: 2 },
  ]);
  assert.equal(outcome.result.causedDamage, true);
  assert.equal(outcome.result.actualDamage, 2);
  assert.equal(outcome.state.health.temp, 0);
  assert.equal(target.health.temp, 1); // no mutation
});

test('short and long rest, node and chapter recover separately', () => {
  const c = person({ health: { intact: 7, B: 1, L: 1, A: 0 },
    will: { current: 2, max: 5 }, attributeDamage: { 力量: 1 } });
  const short = recover(c, { type: 'shortRest' }).state;
  assert.equal(short.health.intact, 8);
  const long = recover(short, { type: 'longRest', attribute: '力量' }).state;
  assert.equal(long.will.current, 3);
  assert.equal(long.attributeDamage.力量, 0);
  const twoDays = recover(long, { type: 'twoDays', longRests: 2 }).state;
  assert.equal(twoDays.health.L, 0);
  assert.equal(recover(twoDays, { type: 'node' }).state.will.current, 4);
  assert.equal(recover(twoDays, { type: 'chapter' }).state.will.current, 5);
});

test('will and already-defined special pools change only by explicit costs', () => {
  const c = person({ resources: { blood: { current: 3, max: 4 } } });
  assert.equal(spendWill(c, 2).state.will.current, 3);
  assert.equal(changeDefinedResource(c, 'blood', -2).state.resources.blood.current, 1);
  assert.throws(() => changeDefinedResource(c, 'undefinedPool', -1), /already be defined/);
});

test('common status resistance and severity use six attributes', () => {
  const c = person({ skills: { 求生: { level: 1 } } });
  const outcome = applyStatus(c, { type: '疲乏', source: 'march', points: 6,
    dice: [1, 1, 1, 1, 1] });
  assert.equal(outcome.result.remaining, 6);
  assert.equal(outcome.result.level.severe, true);
  const exhausted = beginTurn(outcome.state).state;
  assert.equal(exhausted.turn.move, 0);
  assert.equal(spendAction(exhausted, 'charge').result.allowed, false);
  const nausea = person({ statuses: [{ type: '恶心', source: 'poison', points: 5 }] });
  const nauseated = beginTurn(nausea).state;
  assert.deepEqual([nauseated.turn.standard, nauseated.turn.move, nauseated.turn.swift], [0, 1, 0]);
  const pain = applyStatus(c, { type: '剧痛', source: 'fall', points: 16,
    dice: [1, 1, 1, 1, 1], catastrophicAllowed: true,
    attributeDamageAllocation: { 力量: 1, 意志: 1 } });
  assert.equal(pain.result.attributeDamage, 2);
  assert.deepEqual([pain.state.attributeDamage.力量, pain.state.attributeDamage.意志], [1, 1]);
});

test('temporary attribute damage affects checks without rewriting card HP', () => {
  const c = person({ attributes: { ...attrs, 力量: 6 }, attributeDamage: { 力量: 1 } });
  assert.equal(effectiveAttribute(c, '力量'), 5);
  assert.equal(c.derived.hpMax, 13);
  const result = check(c, { attribute: '力量', dice: [1, 1, 1, 1, 1] });
  assert.equal(result.dp, 5);
  assert.equal(result.autoSuccesses, 0);
});

test('attribute/skill XP milestones, main cap, card overrides, node settlement', () => {
  let c = person({ attributes: { ...attrs, 力量: 5 }, xp: 50,
    skills: { 白刃: { level: 4, subs: { 长剑: { level: 4 } } } },
    legendaryIntelligence: 2, will: { current: 2, max: 5 } });
  const oldHP = c.derived.hpMax;
  let result = upgradeAttribute(c, '力量'); c = result.state;
  assert.deepEqual([result.result.cost, result.result.autoGained, result.result.greatPowerChoiceGained], [12, 1, 1]);
  assert.equal(c.derived.hpMax, oldHP + 3);
  result = upgradeSkill(c, '白刃'); c = result.state;
  assert.deepEqual([result.result.cost, result.result.autoGained], [9, 1]);
  assert.equal(upgradeSkill(c, '白刃').result.allowed, false);
  result = upgradeSkill(c, '白刃', '长剑'); c = result.state;
  assert.deepEqual([result.result.cost, result.result.autoGained], [9, 1]);
  const node = settleNode(c, { id: 'node-1', xp: 3 });
  assert.equal(node.result.bonus, 0);
  assert.equal(node.state.will.current, 3);
  const settlement = settleNode(node.state, { id: 'settlement-1', settlement: true });
  assert.equal(settlement.result.bonus, 2);
  assert.equal(settlement.state.will.current, 3);
  assert.equal(settleNode(settlement.state, { id: 'settlement-1', settlement: true }).result.applied, false);
  const oldCard = person({ derived: { hpMax: 20, defense: 9 }, health: { intact: 20, B: 0, L: 0, A: 0 }, xp: 20 });
  assert.equal(upgradeAttribute(oldCard, '力量').state.derived.hpMax, 20);
});
