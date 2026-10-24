import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCharacter, requireKnownSkill } from '../../character_builder/builder.mjs';
import { beginTurn, check, createCharacter, resolveAttack } from '../../rules_engine/core.mjs';
import { createResourceAdapter } from '../../resource_adapter/adapter.mjs';
import { loadNodeCatalog } from '../../resource_adapter/catalog.node.mjs';
import { createNpcDraftPipeline } from '../pipeline.mjs';

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const blueprint = readJson('./border_tracker.blueprint.json');
const candidate = readJson('./border_tracker.candidate.json');
const catalog = loadNodeCatalog();
const adapter = createResourceAdapter(catalog, { mode: 'production' });
const draft = createNpcDraftPipeline({ adapter }).evaluate({
  mode: 'new_character_proposal', blueprint, candidate,
});
assert.equal(draft.ok, true, JSON.stringify(draft.report));
assert.equal(draft.okScope, 'BUILDER_PREVIEW_ONLY');
assert.equal(draft.approved, false);
assert.equal(draft.formalDefinition, null);
assert.equal(draft.builderCandidate.sourceStatus, 'PROPOSED');
assert(Object.values(draft.builderCandidate.numericStatuses).every(value => value === 'PROPOSED'));

const built = buildCharacter(draft.builderCandidate.definition, draft.builderCandidate.initial);
assert.equal(built.ok, true, JSON.stringify(built.report));
assert.deepEqual(built.state.derived, draft.previewState.derived);

const dartReport = draft.report.resources.find(item => item.id === 'phb03.weapon.portable-dart');
assert(dartReport?.sourceExists);
assert.equal(dartReport.adoption, 'UNDECIDED');
assert.equal(dartReport.acquisitionSource, null);
assert.equal(dartReport.engineSupported, false);
assert.throws(() => adapter.weaponInput(draft.previewState, dartReport.id),
  /resource scope mismatch|resource adoption or acquisition not verified/);
assert(draft.report.unsupported.some(item => item.id === 'proposal.border_tracker.beast_trace_alert'));
assert.equal(draft.previewState.derived.speed, 10); // No unapproved resource bonus.

requireKnownSkill(draft.previewState, '洞察');
const observation = check(draft.previewState, {
  attribute: '感知', skill: '洞察', dc: 1, dice: [8, 9, 2, 5, 1],
});
assert.equal(observation.dp, 5);
assert.equal(observation.success, true);

// Counterfactual rules demonstration only: the proposed dart is assumed held
// at 5 m here. This never creates an adoption or acquisition record.
const dart = catalog.find(item => item.id === 'phb03.weapon.portable-dart');
assert(dart);
const target = createCharacter({
  id: 'TRIAL_TARGET_ONLY', size: 5,
  attributes: { 力量: 1, 敏捷: 1, 智力: 1, 感知: 1, 意志: 1, 风度: 1 },
});
const turn = beginTurn(draft.previewState);
assert.equal(turn.result.allowed, true);
requireKnownSkill(turn.state, dart.parameters.skill, dart.parameters.sub);
const attack = resolveAttack(turn.state, target, {
  weapon: {
    type: dart.parameters.weaponType, skill: dart.parameters.skill,
    sub: dart.parameters.sub, damage: dart.parameters.damage,
    severity: dart.parameters.severity,
  },
  distancePenalty: 0, eligible: true,
  dice: [8, 9, 2, 5, 1, 3],
});
assert.equal(attack.result.allowed, true);
assert.equal(attack.result.hit, true);
assert.equal(attack.result.actualDamage, 2);

console.log(JSON.stringify({
  character: { id: draft.previewState.id, name: draft.previewState.name,
    period: draft.previewState.period, status: 'PROPOSED' },
  validation: { ok: draft.ok, okScope: draft.okScope, approved: draft.approved,
    errors: draft.report.errors, missing: draft.report.missing,
    unmetResourcePrerequisites: draft.report.unmetResourcePrerequisites,
    approvalRequired: draft.report.approvalRequired },
  builder: { attributes: draft.previewState.attributes, size: draft.previewState.size,
    skills: draft.previewState.skills, derived: draft.previewState.derived },
  resources: draft.report.resources,
  unsupported: draft.report.unsupported.map(item => ({ id: item.id, name: item.name ?? item.originalName ?? null })),
  ordinaryCheck: { attribute: '感知', skill: '洞察', dp: observation.dp,
    successes: observation.total, dc: observation.dc, success: observation.success },
  conditionalOrdinaryAttack: {
    assumption: '提案中的飞镖已获许可且实物持握；目标在 5 米处、无护甲；仅作规则计算',
    weaponSource: dart.source, dp: attack.result.roll.dp,
    successes: attack.result.attackTrace[1].value,
    damageCap: attack.result.cap, severity: dart.parameters.severity,
    hit: attack.result.hit, actualDamage: attack.result.actualDamage,
  },
}, null, 2));
