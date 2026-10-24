import test from 'node:test';
import assert from 'node:assert/strict';
import { createResourceAdapter, translateApActionPrice } from './adapter.mjs';
import { loadNodeCatalog } from './catalog.node.mjs';
import { buildCharacter, requireOperationSupport } from '../character_builder/builder.mjs';
import { beginTurn, resolveAttack } from '../rules_engine/core.mjs';

const DART = 'phb03.weapon.portable-dart';
const SPEED = 'phb03.feat.swift-foot.1';
const THRUST = 'phb03.feat.sword-thrust.1';
const RE = 're103.feat.russian-saber.double-strike.5';
const catalog = loadNodeCatalog();
const grants = [DART, SPEED, THRUST, RE].map(resourceId => ({
  characterId: 'resource-sample', resourceId, source: 'isolated demo grant',
  ...(resourceId === DART ? { instance: { quantity: 2, held: true } } : {}),
}));
const demo = createResourceAdapter(catalog, { mode: 'demo', grants });
const production = createResourceAdapter(catalog, { mode: 'production', grants });
const definition = () => ({ id: 'resource-sample', name: '资源测试人物', period: 'demo',
  sources: ['fixture'], size: 5,
  attributes: { 力量: 4, 敏捷: 4, 智力: 2, 感知: 3, 意志: 3, 风度: 2 },
  skills: { 运动: { level: 3, subs: { 飞镖: { level: 1, scope: '飞镖投掷',
    scopeId: 'weapon.dart' } } }, 求生: { level: 0 },
    白刃: { level: 3, subs: {
      长剑: { level: 1, scope: '长剑攻击', scopeId: 'weapon.long_sword' },
      匕首: { level: 1, scope: '匕首攻击', scopeId: 'weapon.dagger' },
    } } },
  equipment: [{ id: 'sword-fixture', equipped: true, weaponClass: '细长直刃剑',
    type: 'melee', sub: '长剑' }],
});
const initial = { health: 'healthy', willCurrent: 5, turn: 'ready' };
const sword = { itemId: 'sword-fixture', type: 'melee', sub: '长剑', damage: 2, severity: 'L' };

test('confirmed AP prices translate 2/4/6/8 without executing a resource', () => {
  assert.deepEqual(translateApActionPrice(2), { originalAp: 2, phbActions: ['swift'] });
  assert.deepEqual(translateApActionPrice(4), { originalAp: 4, phbActions: ['move'] });
  assert.deepEqual(translateApActionPrice(6), { originalAp: 6, phbActions: ['standard'] });
  assert.deepEqual(translateApActionPrice(8), { originalAp: 8, phbActions: ['standard', 'swift'] });
  assert.deepEqual(demo.actionPrice(RE), { originalAp: 6, phbActions: ['standard'] });
  assert.throws(() => translateApActionPrice(10), /specific adaptation/i);
  assert.throws(() => demo.actionPrice('missing'), /unknown resource/i);
  assert.throws(() => demo.actionPrice(SPEED), /specific adaptation/i);
});

test('catalog lookup keeps stable provenance separate from adoption and returns a copy', () => {
  const dart = demo.getResource(DART);
  assert.equal(dart.originalName, '飞镖');
  assert.equal(dart.edition, 'PHB v0.3');
  assert.equal(dart.adoption, 'UNDECIDED');
  dart.parameters.damage = 999;
  assert.equal(demo.getResource(DART).parameters.damage, 1);
  assert.equal(demo.getResource('missing'), undefined);
});

test('production cannot turn a per-call assertion or demo state into authorization', () => {
  const bare = buildCharacter(definition(), initial);
  assert.equal(bare.state.derived.speed, 13);
  assert.deepEqual(bare.state.resourceRefs, []);
  assert.throws(() => production.selectResources(definition(),
    [{ id: SPEED, adoption: 'CONFIRMED', adoptionSource: 'anything' }]), /IDs only/i);
  const unadopted = buildCharacter(production.selectResources(definition(), [SPEED]), initial);
  assert.equal(unadopted.state.derived.speed, 13);
  assert.equal(unadopted.report.unsupported[0].id, SPEED);
  const demoState = buildCharacter(demo.selectResources(definition(), [DART]), initial).state;
  assert.throws(() => production.weaponInput(demoState, DART), /scope|adoption/i);
});

test('production requires separate adoption provenance and a character grant', () => {
  const record = { resourceId: SPEED, status: 'ADOPTED',
    source: 'separate author adoption record' };
  const withoutSource = createResourceAdapter(catalog, { mode: 'production', grants,
    adoptionRecords: [{ resourceId: SPEED, status: 'ADOPTED' }] });
  assert.equal(buildCharacter(withoutSource.selectResources(definition(), [SPEED]), initial)
    .state.derived.speed, 13);
  const withoutGrant = createResourceAdapter(catalog, { adoptionRecords: [record] });
  assert.equal(buildCharacter(withoutGrant.selectResources(definition(), [SPEED]), initial)
    .state.derived.speed, 13);
  const authorized = createResourceAdapter(catalog, { mode: 'production', grants,
    adoptionRecords: [record] });
  const built = buildCharacter(authorized.selectResources(definition(), [SPEED]), initial);
  assert.equal(built.state.derived.speed, 14);
  assert.equal(built.state.resourceRefs[0].adoptionScope, '901');
  assert.equal(built.state.resourceRefs[0].adoptionSource, 'separate author adoption record');
  assert.equal(authorized.getResource(SPEED).adoption, 'UNDECIDED');
  const demoOnlyAdoption = createResourceAdapter(catalog, { mode: 'production', grants,
    adoptionRecords: [{ resourceId: THRUST, status: 'ADOPTED', source: 'separate record' }] });
  const thrust = buildCharacter(demoOnlyAdoption.selectResources(definition(), [THRUST]), initial);
  assert.equal(thrust.report.unsupported[0].id, THRUST);
  assert.throws(() => demoOnlyAdoption.swordThrustModifier(thrust.state,
    { technique: '刺击', weapon: sword }), /scope|unsupported/i);
});

test('isolated grant feeds Builder bonus once and stores only a resource reference', () => {
  const original = definition();
  const selected = demo.selectResources(original, [SPEED]);
  const built = buildCharacter(selected, initial);
  assert.equal(built.ok, true);
  assert.equal(built.state.derived.speed, 14);
  assert.equal(built.state.derivedBonuses.speed, 1);
  assert.deepEqual(built.state.resourceRefs[0], { id: SPEED, source: demo.getResource(SPEED).source,
    adoption: 'CONFIRMED', adoptionScope: 'demo', adoptionSource: 'isolated demo catalog',
    acquisitionSource: 'isolated demo grant', prerequisiteStatus: 'CHECKED' });
  assert.equal(built.state.resourceRefs[0].parameters, undefined);
  assert.equal(original.resources, undefined);
  assert.throws(() => demo.selectResources(selected, [SPEED]), /duplicate/i);
  const withFinalCard = demo.selectResources({ ...definition(), overrides: { derived: {
    speed: { mode: 'final', value: 20, source: 'sample card includes feat' } } } }, [SPEED]);
  assert.equal(buildCharacter(withFinalCard, initial).state.derived.speed, 20);
});

test('old skill prerequisite uses only an explicitly mapped matching subskill', () => {
  const weak = definition(); weak.skills.白刃.level = 2;
  assert.doesNotThrow(() => demo.selectResources(weak, [THRUST]));
  weak.skills.白刃.subs.长剑.level = 0;
  weak.skills.白刃.subs.剑舞 = { level: 10, scope: '剑术表演', scopeId: 'performance.sword' };
  assert.throws(() => demo.selectResources(weak, [THRUST]), /白刃.*3/);
  assert.throws(() => demo.selectResources(definition(), ['missing']), /unknown resource/i);
});

test('weapon input uses trusted catalog numbers and current inventory state', () => {
  const attacker = buildCharacter(demo.selectResources(definition(), [DART, SPEED]), initial);
  const target = buildCharacter({ ...definition(), id: 'target' }, initial);
  assert.equal(attacker.ok, true);
  const tampered = structuredClone(attacker.state);
  tampered.resourceRefs[0].parameters = { damage: 999, rangeUnitMeters: 999 };
  const weapon = demo.weaponInput(tampered, DART);
  assert.deepEqual(weapon, { resourceId: DART, type: 'thrown', skill: '运动',
    sub: '飞镖', damage: 1, severity: 'L', rangeUnit: 20 });
  const outcome = resolveAttack(beginTurn(attacker.state).state, target.state,
    { weapon, dice: [8, 8, ...Array(5).fill(1)] });
  assert.equal(outcome.result.roll.dp, 6);
  assert.equal(outcome.result.actualDamage, 2);
  tampered.resourceRefs[0].instance.quantity = 0;
  assert.throws(() => demo.weaponInput(tampered, DART), /inventory/i);
  assert.throws(() => demo.weaponInput(target.state, DART), /not selected/i);
});

test('ordinary throw works without a dart subskill; unrelated subskill is ignored', () => {
  const noSub = definition(); delete noSub.skills.运动.subs.飞镖;
  noSub.skills.运动.subs.飞镖舞 = { level: 9, scope: '飞镖表演', scopeId: 'performance.dart' };
  const built = buildCharacter(demo.selectResources(noSub, [DART]), initial);
  assert.deepEqual(demo.weaponInput(built.state, DART), { resourceId: DART,
    type: 'thrown', skill: '运动', damage: 1, severity: 'L', rangeUnit: 20 });
});

test('thrust reads catalog bonus and checks the same equipped weapon passed to core', () => {
  const built = buildCharacter(demo.selectResources(definition(), [THRUST]), initial);
  const tampered = structuredClone(built.state);
  tampered.resourceRefs[0].parameters = { attackDpBonus: 999 };
  const input = { weapon: sword, technique: '刺击', dice: Array(8).fill(1) };
  assert.equal(demo.swordThrustModifier(tampered, input), 1);
  assert.equal(demo.swordThrustModifier(tampered,
    { ...input, technique: '普通攻击' }), 0);
  const target = buildCharacter({ ...definition(), id: 'sword-target' }, initial).state;
  const ordinary = resolveAttack(beginTurn(built.state).state, target,
    { weapon: sword, dice: Array(8).fill(1) });
  const thrust = resolveAttack(beginTurn(built.state).state, target,
    { ...input, modifier: demo.swordThrustModifier(tampered, input) });
  assert.equal(ordinary.result.roll.dp, 7);
  assert.equal(thrust.result.roll.dp, 8);
  assert.throws(() => demo.swordThrustModifier(tampered,
    { ...input, weapon: { ...sword, itemId: 'wrong' } }), /equipped/i);
  tampered.equipment[0].equipped = false;
  assert.throws(() => demo.swordThrustModifier(tampered, input), /equipped/i);
});

test('unsupported RE item records unverified prior rank and never invents two attacks', () => {
  const selected = demo.selectResources(definition(), [RE]);
  const built = buildCharacter(selected, initial);
  assert.equal(built.ok, true);
  assert.equal(built.state.derived.speed, 13);
  assert.equal(built.state.resourceRefs[0].prerequisiteStatus, 'PENDING');
  assert.equal(built.report.unsupported[0].id, RE);
  assert.match(built.report.unsupported[0].unsupportedReason, /两次攻击.*冷却/);
  assert.throws(() => requireOperationSupport(built.report, [RE]), /unsupported/i);
  const unqualified = definition(); delete unqualified.skills.白刃.subs.匕首;
  const failed = buildCharacter(demo.selectResources(unqualified, [RE]), initial);
  assert.equal(failed.state.resourceRefs[0].prerequisiteStatus, 'FAILED');
  assert.match(failed.report.unsupported[0].prerequisiteReasons.join(' '), /白刃.匕首/);
  const proved = createResourceAdapter(catalog, { mode: 'demo', grants: grants.map(grant =>
    grant.resourceId === RE ? { ...grant, priorRanks: { 俄罗斯军刀术: 4 } } : grant) });
  const stillUnsupported = buildCharacter(proved.selectResources(definition(), [RE]), initial);
  assert.equal(stillUnsupported.state.resourceRefs[0].prerequisiteStatus, 'CHECKED');
  assert.equal(stillUnsupported.report.unsupported[0].id, RE);
});
