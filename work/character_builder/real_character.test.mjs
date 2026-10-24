import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCharacter, requireKnownSkill, requireOperationSupport } from './builder.mjs';
import { actionEligibility, check } from '../rules_engine/core.mjs';
import { createResourceAdapter } from '../resource_adapter/adapter.mjs';
import { loadNodeCatalog } from '../resource_adapter/catalog.node.mjs';
import { readDebugState } from '../rules_engine/mvu_poc/adapter.mjs';

const candidate = JSON.parse(readFileSync(new URL('./real_character/ranhonglian.candidate.json', import.meta.url), 'utf8'));

test('GM card values survive construction and unsupported powers stay descriptive', () => {
  assert.equal(candidate.fieldEvidence.cardFinals.status, 'CONFIRMED_FINAL_VALUES');
  assert.equal(candidate.fieldEvidence.currentHealthWillAndTurn.status, 'UNKNOWN_DEMO_ASSUMPTION');
  const adapter = createResourceAdapter(loadNodeCatalog(), { mode: 'production' });
  const selected = adapter.selectResources(candidate.definition, candidate.catalogResourceIds);
  const built = buildCharacter(selected, candidate.demoInitial);
  assert.equal(built.ok, true, JSON.stringify(built.report));
  assert.deepEqual(built.state.attributes, { 力量: 8, 敏捷: 6, 智力: 2, 感知: 4, 意志: 3, 风度: 2 });
  assert.equal(built.state.size, 12);
  assert.equal(built.state.derived.hpMax, 20);
  assert.equal(built.state.derived.defense, 10);
  assert.equal(built.state.derived.speed, 26);
  assert.equal(built.state.health.intact, 20);
  assert.deepEqual(built.state.resourceRefs, []);
  assert.ok(built.report.unsupported.some(item => item.id === 'ranhonglian.roar-wave'));
  assert.throws(() => requireOperationSupport(built.report, ['ranhonglian.roar-wave']), /unsupported/);
});

test('ordinary survival check uses sourced skill and state fits MVU actor shape', () => {
  const built = buildCharacter(candidate.definition, candidate.demoInitial);
  assert.equal(built.ok, true, JSON.stringify(built.report));
  requireKnownSkill(built.state, '求生');
  assert.equal(actionEligibility(built.state, 'free').allowed, true);
  const result = check(built.state, { attribute: '感知', skill: '求生', dc: 1,
    dice: [8, 2, 3, 4, 5, 6, 7] });
  assert.equal(result.eligible, true);
  assert.equal(result.dp, 7);
  assert.equal(result.total, 1);
  assert.equal(result.success, true);
  const root = { schemaVersion: 1, revision: 0, chatId: 'migration-local', operations: {},
    actors: { ranhonglian: { name: built.state.name, state: built.state } } };
  assert.equal(root.actors.ranhonglian.state.derived.defense, 10);
  assert.deepEqual(Object.keys(root.actors.ranhonglian.state.attributes).sort(),
    ['力量', '敏捷', '智力', '感知', '意志', '风度'].sort());
  assert.equal(typeof root.actors.ranhonglian.state.turn, 'object');
  assert.ok(Array.isArray(root.actors.ranhonglian.state.statuses));
  const output = readDebugState({ getAnchor: () => ({ chatId: 'migration-local', messageId: 0, swipeId: 0 }),
    mvu: { getMvuData: () => ({ stat_data: { '901_rules_poc': root } }),
      replaceMvuData: () => { throw new Error('read-only interface check must not write'); } } });
  assert.match(output, /乱红莲: 20 完好/);
  assert.equal(built.state.health.intact + built.state.health.B + built.state.health.L + built.state.health.A,
    built.state.derived.hpMax);
});
