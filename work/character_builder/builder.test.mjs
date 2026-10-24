import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCharacter, requireKnownSkill, requireOperationSupport } from './builder.mjs';
import { beginTurn, check, resolveAttack, upgradeAttribute, upgradeSkill } from '../rules_engine/core.mjs';

const attrs = { 力量: 6, 敏捷: 3, 智力: 2, 感知: 3, 意志: 3, 风度: 2 };
const base = () => ({ id: 'sample', name: '测试人物', period: 'test', sources: ['fixture'],
  size: 5, attributes: { ...attrs }, skills: { 白刃: { level: 5,
    subs: { 长剑: { level: 3, scope: '长剑攻击' } } },
    运动: { level: 0 }, 求生: { level: 0 } } });
const healthy = { health: 'healthy', willCurrent: 5, turn: 'ready', xp: 0 };

test('JSON definitions produce core-compatible independent ordinary attack states', () => {
  const attackerDef = base();
  const targetDef = { ...base(), id: 'target', attributes: { ...attrs, 力量: 4, 敏捷: 4, 感知: 4 },
    skills: { 白刃: { level: 0, subs: { 长剑: { level: 0, scope: '长剑攻击' } } },
      运动: { level: 0 }, 求生: { level: 0 } },
    overrides: { derived: { hpMax: { mode: 'final', value: 9, source: 'test-card' },
      defense: { mode: 'final', value: 4, source: 'test-card' } } } };
  const original = structuredClone(attackerDef);
  const attacker = buildCharacter(attackerDef, healthy);
  const target = buildCharacter(targetDef, { ...healthy, willCurrent: 5 });
  assert.equal(attacker.ok, true);
  assert.equal(target.ok, true);
  assert.deepEqual(attackerDef, original);
  const outcome = resolveAttack(beginTurn(attacker.state).state, target.state, {
    weapon: { type: 'melee', sub: '长剑', damage: 2, severity: 'L' },
    dice: [8, 8, 8, ...Array(9).fill(1)], defenses: [{ id: 'dr', kind: 'dr', value: 2 }],
  });
  assert.equal(outcome.result.roll.dp, 12);
  assert.equal(outcome.result.attackTrace[1].auto, 2);
  assert.equal(outcome.result.cap, 16);
  assert.equal(outcome.result.attackTrace[2].value, 5);
  assert.equal(outcome.result.actualDamage, 3);
  assert.deepEqual([outcome.target.health.intact, outcome.target.health.L], [6, 3]);
  assert.equal(outcome.attacker.turn.standard, 0);
  assert.equal(buildCharacter(attackerDef, healthy).state.turn.standard, 0);
});

test('main skill is used without a matching subskill and defaults are derived', () => {
  const definition = { ...base(), skills: { 学识: { level: 2,
    subs: { 历史: { level: 1, scope: '历史知识' } } },
    运动: { level: 0 }, 求生: { level: 0 } } };
  const result = buildCharacter(definition, healthy);
  assert.equal(result.ok, true);
  assert.deepEqual([result.state.derived.hpMax, result.state.derived.defense,
    result.state.derived.speed, result.state.derived.initiative,
    result.state.derived.willMax, result.state.derived.reflex,
    result.state.derived.fortitude], [14, 3, 14, 5, 5, 3, 6]);
  const roll = check(result.state, { attribute: '智力', skill: '学识', dice: [8, 1, 1, 1] });
  assert.equal(roll.dp, 4);
  assert.equal(roll.skill.sub, 0);
  assert.throws(() => requireKnownSkill(result.state, '白刃'), /unknown/i);
  assert.deepEqual(requireKnownSkill(result.state, '学识'), { main: '学识', sub: undefined });
});

test('validation reports missing values and rejects main skill above five', () => {
  const invalid = base(); invalid.skills.白刃.level = 6; delete invalid.attributes.敏捷;
  const result = buildCharacter(invalid, {});
  assert.equal(result.ok, false);
  assert.match(result.report.errors.join(' '), /白刃.*5/);
  assert.match(result.report.missing.join(' '), /敏捷/);
  assert.match(result.report.missing.join(' '), /health/);
  assert.match(result.report.missing.join(' '), /willCurrent/);
  assert.equal(result.state, undefined);
});

test('final card override does not get resource bonus again; base override does', () => {
  const d = base();
  d.resources = [{ id: 'amulet', source: 'test-source', adoption: 'ADOPTED', engineSupported: true,
    effects: [{ id: 'hp', kind: 'hpBonus', value: 2 },
      { id: 'defense', kind: 'derivedBonus', field: 'defense', value: 1 }] }];
  d.overrides = { derived: { hpMax: { mode: 'final', value: 20, source: 'card-with-amulet' },
    defense: { mode: 'base', value: 4, source: 'card-base' } } };
  const built = buildCharacter(d, { ...healthy, health: 'healthy' });
  assert.equal(built.ok, true);
  assert.equal(built.state.derived.hpMax, 20);
  assert.equal(built.state.derived.defense, 5);
  assert.equal(built.state.hpBonus, 0);
  assert.equal(built.report.overrides.length, 2);
  assert.deepEqual(built.state.resourceRefs, [{ id: 'amulet', source: 'test-source',
    adoption: 'ADOPTED' }]);
  const duplicated = structuredClone(d);
  duplicated.resources.push(structuredClone(d.resources[0]));
  assert.equal(buildCharacter(duplicated, healthy).ok, false);
});

test('unsupported abilities stay visible and explicit wounds and pool balances persist', () => {
  const d = base();
  d.resources = [{ id: 'mana', source: 'adopted-card', adoption: 'ADOPTED', engineSupported: true,
    pool: { max: 7 } },
    { id: 'mask', source: 'adopted-lore', adoption: 'ADOPTED', engineSupported: false,
      description: 'special release', effects: [{ id: 'release', kind: 'specialAttack', value: 9 }] }];
  const initial = { health: { intact: 11, B: 1, L: 2, A: 0, temp: 0, coma: false,
    deteriorationStopped: false }, willCurrent: 2, resourceBalances: { mana: 3 }, xp: 11,
    turn: 'ready' };
  const first = buildCharacter(d, initial);
  const second = buildCharacter(d, initial);
  assert.equal(first.ok, true);
  assert.deepEqual([first.state.health.intact, first.state.health.B, first.state.health.L], [11, 1, 2]);
  assert.deepEqual(first.state.resources.mana, { current: 3, max: 7 });
  assert.equal(first.state.will.current, 2);
  assert.equal(first.state.xp, 11);
  assert.equal(first.report.unsupported[0].id, 'mask');
  assert.throws(() => requireOperationSupport(first.report, ['mask']), /unsupported/i);
  assert.doesNotThrow(() => requireOperationSupport(first.report, []));
  first.state.health.L = 0;
  first.state.resources.mana.current = 0;
  assert.equal(second.state.health.L, 2);
  assert.equal(second.state.resources.mana.current, 3);
  assert.equal(initial.health.L, 2);
  assert.match(buildCharacter(d, { ...initial, resourceBalances: {} }).report.missing.join(' '), /mana/);
  assert.equal(buildCharacter(d, initial, { existingState: first.state }).ok, false);
});

test('unknown derived skill and subskill scope are reported instead of assumed zero', () => {
  const d = base(); delete d.skills.运动; delete d.skills.白刃.subs.长剑.scope;
  const result = buildCharacter(d, healthy);
  assert.equal(result.ok, false);
  assert.match(result.report.missing.join(' '), /skills.运动.level/);
  assert.match(result.report.missing.join(' '), /scope/);
});

test('core growth keeps a numeric resource bonus without freezing the base formula', () => {
  const d = base();
  d.attributes = { ...attrs, 力量: 5, 感知: 4 };
  d.resources = [{ id: 'charm', source: 'fixture', adoption: 'ADOPTED', engineSupported: true,
    effects: [{ id: 'hp', kind: 'hpBonus', value: 2 },
      { id: 'guard', kind: 'derivedBonus', field: 'defense', value: 1 }] }];
  const built = buildCharacter(d, { ...healthy, health: 'healthy', xp: 20 });
  assert.equal(built.ok, true);
  assert.deepEqual([built.state.derived.hpMax, built.state.derived.defense], [14, 4]);
  const stronger = upgradeAttribute(built.state, '力量').state;
  assert.equal(stronger.derived.hpMax, 16);
  const faster = upgradeAttribute(stronger, '敏捷').state;
  assert.equal(faster.derived.defense, 5);
});

test('explicit card automatic successes retain provenance without threshold double count', () => {
  const d = base();
  d.attributeAuto = { 力量: { value: 2, source: 'confirmed-card' } };
  d.skills.白刃.auto = { value: 2, source: 'confirmed-card' };
  const built = buildCharacter(d, healthy);
  assert.equal(built.ok, true);
  const checked = check(built.state, { attribute: '力量', skill: '白刃', sub: '长剑',
    dice: Array(14).fill(1) });
  assert.equal(checked.autoSuccesses, 4);
  assert.deepEqual(built.report.overrides.map(item => item.source),
    ['confirmed-card', 'confirmed-card']);
});

test('unadapted pool and nonnumeric special effect stay visible without inventing balances', () => {
  const d = base();
  d.resources = [{ id: 'mystery', source: 'source', adoption: 'ADOPTED', engineSupported: false,
    pool: { max: 'unknown' }, effects: [{ id: 'portal', kind: 'special', description: 'unknown' }] }];
  const built = buildCharacter(d, healthy);
  assert.equal(built.ok, true);
  assert.equal(built.report.unsupported[0].id, 'mystery');
  assert.equal(built.state.resources.mystery, undefined);
});

test('core skill growth refreshes builder reflex and fortitude', () => {
  const d = base();
  const built = buildCharacter(d, { ...healthy, xp: 10 });
  const moved = upgradeSkill(built.state, '运动').state;
  const survived = upgradeSkill(moved, '求生').state;
  assert.equal(survived.derived.reflex, 4);
  assert.equal(survived.derived.fortitude, 7);
});

test('malformed starting slots and action usage cannot enter core state', () => {
  const badHealth = buildCharacter(base(), { ...healthy,
    health: { intact: 12, B: 1, L: 0, A: 0, temp: -1 } });
  assert.equal(badHealth.ok, false);
  assert.match(badHealth.report.errors.join(' '), /health/);
  const badTurn = buildCharacter(base(), { ...healthy, turn: { phase: 'active', standard: -1 } });
  assert.equal(badTurn.ok, false);
  assert.match(badTurn.report.errors.join(' '), /turn/);
});

test('a seventh legacy attribute is rejected rather than silently carried into state', () => {
  const d = base(); d.attributes.耐力 = 3;
  const result = buildCharacter(d, healthy);
  assert.equal(result.ok, false);
  assert.match(result.report.errors.join(' '), /耐力/);
});
