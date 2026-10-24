import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { check } from '../rules_engine/core.mjs';
import { createResourceAdapter } from '../resource_adapter/adapter.mjs';
import { loadNodeCatalog } from '../resource_adapter/catalog.node.mjs';
import { createNpcDraftPipeline } from './pipeline.mjs';

const adapter = () => createResourceAdapter(loadNodeCatalog(), { mode: 'production' });
const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const existing = readJson('../character_builder/real_character/ranhonglian.candidate.json');
const existingBlueprint = readJson('./existing_ranhonglian.blueprint.json');
const pipeline = () => createNpcDraftPipeline({ adapter: adapter(), existingCharacters: [existing],
  existingBlueprints: [existingBlueprint] });
const newBlueprint = readJson('./new_patrol.blueprint.json');
const proposedNumbers = readJson('./new_patrol.candidate.json');

test('existing character keeps source card, period and unsupported abilities; numeric proposal is rejected', () => {
  const result = pipeline().evaluate({ mode: 'existing_character', blueprint: existingBlueprint });
  assert.equal(result.ok, true, JSON.stringify(result.report));
  assert.equal(result.builderCandidate.definition.period, existing.definition.period);
  assert.deepEqual(result.builderCandidate.definition.attributes, existing.definition.attributes);
  assert.equal(result.previewState.derived.hpMax, 20);
  assert.equal(result.previewState.derived.defense, 10);
  assert.equal(result.previewState.derived.speed, 26);
  assert.ok(result.report.unsupported.some(item => item.id === 'ranhonglian.roar-wave'));
  assert.equal(result.builderCandidate.fieldEvidence.currentHealthWillAndTurn.status, 'UNKNOWN_DEMO_ASSUMPTION');
  assert.equal(result.formalDefinition, null);
  const tampered = pipeline().evaluate({ mode: 'existing_character', blueprint: existingBlueprint,
    candidate: { attributes: { 力量: 999 } } });
  assert.equal(tampered.ok, false);
  assert.match(tampered.report.errors.join(' '), /rejects numeric proposals/);
});

test('existing source card is captured before the request and cannot be replaced per call', () => {
  const trustedCopy = structuredClone(existing);
  const service = createNpcDraftPipeline({ adapter: adapter(), existingCharacters: [trustedCopy],
    existingBlueprints: [existingBlueprint] });
  trustedCopy.definition.attributes.力量 = 999;
  const result = service.evaluate({ mode: 'existing_character', blueprint: existingBlueprint });
  assert.equal(result.builderCandidate.definition.attributes.力量, 8);
  const injected = service.evaluate({ mode: 'existing_character', blueprint: existingBlueprint,
    sourceCandidate: { ...existing, definition: { ...existing.definition,
      attributes: { ...existing.definition.attributes, 力量: 999 } } } });
  assert.equal(injected.ok, false);
});

test('existing narrative claims and their source references come only from the loaded Blueprint', () => {
  const service = pipeline();
  const baseline = service.evaluate({ mode: 'existing_character', blueprint: existingBlueprint });
  assert.equal(baseline.ok, true, JSON.stringify(baseline.report));
  assert.deepEqual(baseline.blueprint.narrativeSources, existingBlueprint.narrativeSources);
  for (const mutation of [
    blueprint => { blueprint.narrativeRole = '改写为新身份'; },
    blueprint => { blueprint.combatProfile.style = '不存在的远程法术'; },
    blueprint => { blueprint.abilityConcepts.push({ id: 'fake', name: '新增能力', description: '无来源' }); },
    blueprint => { blueprint.narrativeSources.narrativeRole = 'invented:source'; },
  ]) {
    const changed = structuredClone(existingBlueprint);
    mutation(changed);
    const result = service.evaluate({ mode: 'existing_character', blueprint: changed });
    assert.equal(result.ok, false);
    assert.equal(result.previewState, null);
  }
});

test('new proposal labels every submitted number, keeps resource authorization separate, and runs an ordinary check', () => {
  const result = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: proposedNumbers });
  assert.equal(result.ok, true, JSON.stringify(result.report));
  assert.equal(result.builderCandidate.numericStatuses['attributes.力量'], 'PROPOSED');
  assert.equal(result.builderCandidate.numericStatuses['skills.白刃.subs.长剑.level'], 'PROPOSED');
  assert.equal(result.builderCandidate.numericStatuses['initial.willCurrent'], 'PROPOSED');
  assert.equal(result.builderCandidate.definition.power_reference, 'T1');
  assert.equal(result.builderCandidate.definition.abilities[0].engineSupportStatus, 'UNSUPPORTED');
  assert.equal(result.report.resources[0].adoption, 'UNDECIDED');
  assert.equal(result.report.resources[0].candidateStatus, 'PROPOSED');
  assert.equal(result.report.resources[0].engineSupported, false);
  assert.equal(result.report.resources[0].prerequisiteStatus, 'PENDING');
  assert.equal(result.previewState.derived.speed, 10); // 2 + 3 + size 5, no feat bonus
  assert.equal(result.formalDefinition, null);
  const roll = check(result.previewState, { attribute: '感知', skill: '洞察', dc: 1,
    dice: [8, 2, 3, 4, 5] });
  assert.equal(roll.dp, 5);
  assert.equal(roll.success, true);
});

test('missing numbers and failed resource prerequisites are reported without a fabricated valid state', () => {
  const incomplete = structuredClone(proposedNumbers);
  delete incomplete.attributes.意志;
  const missing = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: incomplete });
  assert.equal(missing.ok, false);
  assert.ok(missing.report.missing.includes('attributes.意志'));
  assert.equal(missing.previewState, null);

  const lowStrength = structuredClone(proposedNumbers);
  lowStrength.attributes.力量 = 1;
  const failed = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: lowStrength });
  assert.equal(failed.report.resources[0].prerequisiteStatus, 'FAILED');
  assert.ok(failed.report.unmetResourcePrerequisites.some(item => item.id === 'phb03.feat.swift-foot.1'));
  assert.equal(failed.previewState.derived.speed, 9);
});

test('AI candidate cannot inject Builder resources or final card overrides', () => {
  for (const patch of [{ resources: [{ id: 'phb03.feat.swift-foot.1', adoption: 'CONFIRMED' }] },
    { overrides: { derived: { speed: { mode: 'final', value: 999, source: 'AI' } } } }]) {
    const result = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
      candidate: { ...proposedNumbers, ...patch } });
    assert.equal(result.ok, false);
    assert.equal(result.previewState, null);
  }
});

test('proposal accepts equipment names but not executable weapon numbers or automatic success overrides', () => {
  const withWeaponNumbers = structuredClone(proposedNumbers);
  withWeaponNumbers.equipment[0].damage = 999;
  const weapon = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: withWeaponNumbers });
  assert.equal(weapon.ok, false);

  const withAuto = structuredClone(proposedNumbers);
  withAuto.skills.白刃.auto = { value: 99, source: 'AI' };
  const auto = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: withAuto });
  assert.equal(auto.ok, false);
});

test('runtime Blueprint validation matches the declared shape at every narrative level', () => {
  const invalidBlueprints = [
    { ...newBlueprint, extra: 'silently accepted before' },
    { ...newBlueprint, identity: { ...newBlueprint.identity, alias: 'unverified' } },
    { ...newBlueprint, narrativeRole: '   ' },
    { ...newBlueprint, combatProfile: { ...newBlueprint.combatProfile, strengths: [123] } },
    { ...newBlueprint, combatProfile: { ...newBlueprint.combatProfile, extra: 'unverified' } },
    { ...newBlueprint, abilityConcepts: [{ ...newBlueprint.abilityConcepts[0], executable: true }] },
  ];
  for (const blueprint of invalidBlueprints) {
    const result = pipeline().evaluate({ mode: 'new_character_proposal', blueprint,
      candidate: proposedNumbers });
    assert.equal(result.ok, false, JSON.stringify(blueprint));
    assert.equal(result.previewState, null);
  }
});

test('ok is explicitly scoped to preview validation and never means approval', () => {
  const valid = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: proposedNumbers });
  assert.equal(valid.ok, true);
  assert.equal(valid.okScope, 'BUILDER_PREVIEW_ONLY');
  assert.equal(valid.approved, false);
  assert.equal(valid.formalDefinition, null);

  const incomplete = structuredClone(proposedNumbers);
  delete incomplete.attributes.意志;
  const invalid = pipeline().evaluate({ mode: 'new_character_proposal', blueprint: newBlueprint,
    candidate: incomplete });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.okScope, 'BUILDER_PREVIEW_ONLY');
  assert.equal(invalid.approved, false);
});
