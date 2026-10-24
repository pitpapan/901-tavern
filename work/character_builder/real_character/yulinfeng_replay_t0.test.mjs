import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCharacter, requireOperationSupport } from '../builder.mjs';
import { check } from '../../rules_engine/core.mjs';
import { createResourceAdapter } from '../../resource_adapter/adapter.mjs';
import { loadNodeCatalog, loadNodeYulinfengReplayRecords } from '../../resource_adapter/catalog.node.mjs';
import { projectYulinfengReplayOpening } from './yulinfeng_replay_opening.mjs';

const candidate = JSON.parse(readFileSync(new URL('./yulinfeng_replay_t0.baseline.json', import.meta.url)));

test('approved replay strength uses one card and final overrides without additive duplication', () => {
  assert.equal(candidate.baselineStatus, 'APPROVED_REPLAY_BASELINE');
  const built = buildCharacter(candidate.definition, candidate.openingState.isolatedTestInitial);
  assert.equal(built.ok, true, JSON.stringify(built.report));
  assert.deepEqual(built.state.attributes,
    { 力量: 6, 敏捷: 7, 智力: 6, 感知: 5, 意志: 5, 风度: 4 });
  assert.equal(built.state.derived.hpMax, 15);
  assert.equal(built.state.derived.speed, 28);
  assert.equal(built.state.derived.defense, 5);
  assert.equal(built.state.derived.initiative, 11);
  assert.equal(built.state.derived.willMax, 9);
  assert.equal(built.state.skills.白刃.subs.长剑.level, 4);
  assert.equal(built.state.skills.制造, undefined);
  assert(built.report.unsupported.some(item => item.id === 'card.sword-arts'));
  assert.deepEqual(built.state.resources, {});
  assert.equal(candidate.openingState.status, 'PARTIALLY_CONFIRMED');
  assert.deepEqual(candidate.openingState.confirmedInitial,
    { health: 'healthy', willCurrent: 9, turn: 'ready', xp: 0 });
});

test('ordinary insight check executes without unknown energy balances', () => {
  const built = buildCharacter(candidate.definition, candidate.openingState.isolatedTestInitial);
  const result = check(built.state, { attribute: '感知', skill: '洞察', dc: 2,
    dice: Array(6).fill(8) });
  assert.equal(result.eligible, true);
  assert.equal(result.dp, 6);
  assert.equal(result.total, 6);
  assert.equal(result.success, true);
});

test('approved replay card can exercise two narrow check resources in isolation', () => {
  const ids = ['phb03.feat.direction-sense.1',
    'card.yulinfeng.jergal.death-world-knowledge'];
  const grants = ids.map(resourceId => ({ characterId: candidate.definition.id, resourceId,
    source: 'approved replay baseline; isolated adaptation test' }));
  const adapter = createResourceAdapter(loadNodeCatalog(), { mode: 'demo', grants });
  const definition = adapter.selectResources(candidate.definition, ids);
  const built = buildCharacter(definition, candidate.openingState.isolatedTestInitial);
  assert.equal(built.ok, true, JSON.stringify(built.report));
  const direction = check(built.state, { attribute: '感知', skill: '求生', dc: 1,
    modifier: adapter.checkModifier(built.state, ids[0],
      { checkId: 'survival.find-direction', skill: '求生' }), dice: Array(12).fill(1) });
  assert.equal(direction.dp, 12);
  assert.throws(() => adapter.checkModifier(built.state, ids[0],
    { checkId: 'survival.find-food', skill: '求生' }), /context/i);
  const deathWorld = check(built.state, { attribute: '智力', skill: '学识', dc: 1,
    modifier: adapter.checkModifier(built.state, ids[1],
      { checkId: 'knowledge.death-world', skill: '学识' }), dice: Array(16).fill(1) });
  assert.equal(deathWorld.dp, 16);
  assert.throws(() => adapter.checkModifier(built.state, ids[1],
    { checkId: 'knowledge.general', skill: '学识' }), /context/i);
  const production = createResourceAdapter(loadNodeCatalog(), { mode: 'production', grants });
  const unadopted = buildCharacter(production.selectResources(candidate.definition, ids),
    candidate.openingState.isolatedTestInitial);
  assert.equal(unadopted.report.unsupported.filter(item => ids.includes(item.id)).length, 2);
});

test('separate replay records authorize only the two confirmed +6DP resources', () => {
  const records = loadNodeYulinfengReplayRecords();
  assert.equal(records.branch, 'replay/T0');
  assert.equal(records.characterId, candidate.definition.id);
  const adapter = createResourceAdapter(loadNodeCatalog(), { mode: 'production',
    adoptionRecords: records.adoptionRecords, grants: records.grants });
  const ids = records.adoptionRecords.map(item => item.resourceId);
  const built = buildCharacter(adapter.selectResources(candidate.definition, ids),
    candidate.openingState.confirmedInitial);
  assert.equal(built.ok, true, JSON.stringify(built.report));
  assert.deepEqual(built.state.resourceRefs.map(ref => ref.adoptionScope), ['901', '901']);
  assert.equal(adapter.checkModifier(built.state, ids[0],
    { checkId: 'survival.find-direction', skill: '求生' }), 6);
  assert.equal(adapter.checkModifier(built.state, ids[1],
    { checkId: 'knowledge.death-world', skill: '学识' }), 6);
  const other = { ...candidate.definition, id: 'different-character' };
  const otherBuilt = buildCharacter(adapter.selectResources(other, ids),
    candidate.openingState.confirmedInitial);
  assert.equal(otherBuilt.report.unsupported.filter(item => ids.includes(item.id)).length, 2);
});

test('replay opening projects confirmed resources and recalculates base derived values', () => {
  const projected = projectYulinfengReplayOpening(candidate);
  const { definition, initial, unresolved } = projected;
  assert.deepEqual(definition.attributes, candidate.definition.attributes);
  assert.deepEqual(definition.skills, candidate.definition.skills);
  assert.deepEqual(definition.overrides?.derived ?? {}, {});
  assert.deepEqual(definition.equipment.map(item => item.id),
    ['opening.imperial-standard-armor', 'yulinfeng.qifeng.pre-repair']);
  assert.equal(definition.equipment[0].equipped, true);
  assert.equal(definition.equipment[1].equipped, undefined);
  assert.deepEqual(definition.abilities.map(item => item.id), ['opening.yulinfeng.wind-trace']);
  assert.equal(definition.equipment.some(item => item.id === 'card.wind-sorrow'), false);
  assert.equal(definition.abilities.some(item => item.id === 'card.movement'), false);
  assert.deepEqual(initial, { health: 'healthy', willCurrent: 9, turn: 'ready', xp: 0 });
  const records = loadNodeYulinfengReplayRecords();
  const adapter = createResourceAdapter(loadNodeCatalog(), { mode: 'production',
    adoptionRecords: records.adoptionRecords, grants: records.grants });
  const selected = adapter.selectResources(definition,
    records.adoptionRecords.map(item => item.resourceId));
  const built = buildCharacter(selected, initial);
  assert.equal(built.ok, true, JSON.stringify(built.report));
  assert.equal(built.state.derived.hpMax, 14);
  assert.equal(built.state.derived.speed, 18);
  assert.equal(built.state.derived.defense, 5);
  assert.equal(built.state.derived.initiative, 11);
  assert.equal(built.state.derived.willMax, 9);
  assert.equal(built.state.derived.reflex, 8);
  assert.equal(built.state.derived.fortitude, 7);
  assert.equal(built.state.health.intact, 14);
  assert.deepEqual(built.state.resources, {});
  assert.equal(built.state.will.current, 9);
  assert.equal(built.state.xp, 0);
  assert.equal(unresolved.some(item => item.id === 'opening.imperial-standard-armor'), true);
  assert.equal(unresolved.some(item => item.id === 'yulinfeng.qifeng.pre-repair'), true);
  assert.equal(unresolved.some(item => item.id === 'opening.yulinfeng.wind-trace'), true);
  for (const item of unresolved)
    assert.equal(built.report.unsupported.some(entry => entry.id === item.id), true);
  assert.throws(() => requireOperationSupport(built.report,
    ['yulinfeng.qifeng.pre-repair']), /unsupported resources/);
  assert.equal(adapter.checkModifier(built.state, 'phb03.feat.direction-sense.1',
    { checkId: 'survival.find-direction', skill: '求生' }), 6);
  assert.equal(adapter.checkModifier(built.state, 'card.yulinfeng.jergal.death-world-knowledge',
    { checkId: 'knowledge.death-world', skill: '学识' }), 6);
  assert.equal(candidate.definition.overrides.derived.hpMax.value, 15);
  assert.equal(candidate.definition.equipment.length, 7);
});
