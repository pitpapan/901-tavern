import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { actionEligibility, check } from '../rules_engine/core.mjs';
import { requireKnownSkill } from '../character_builder/builder.mjs';
import { createResourceAdapter } from '../resource_adapter/adapter.mjs';
import { loadNodeCatalog } from '../resource_adapter/catalog.node.mjs';
import { createNpcDraftPipeline } from './pipeline.mjs';

const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const existing = readJson('../character_builder/real_character/ranhonglian.candidate.json');
const pipeline = createNpcDraftPipeline({
  adapter: createResourceAdapter(loadNodeCatalog(), { mode: 'production' }),
  existingCharacters: [existing],
  existingBlueprints: [readJson('./existing_ranhonglian.blueprint.json')],
});
const migrated = pipeline.evaluate({ mode: 'existing_character',
  blueprint: readJson('./existing_ranhonglian.blueprint.json') });
assert.equal(migrated.ok, true, JSON.stringify(migrated.report));
assert.equal(migrated.previewState.derived.hpMax, 20);

const draft = pipeline.evaluate({ mode: 'new_character_proposal',
  blueprint: readJson('./new_patrol.blueprint.json'),
  candidate: readJson('./new_patrol.candidate.json') });
assert.equal(draft.ok, true, JSON.stringify(draft.report));
requireKnownSkill(draft.previewState, '洞察');
assert.equal(actionEligibility(draft.previewState, 'free').allowed, true);
const ordinaryCheck = check(draft.previewState, { attribute: '感知', skill: '洞察', dc: 1,
  dice: [8, 2, 3, 4, 5] });
assert.equal(ordinaryCheck.success, true);

console.log(JSON.stringify({
  existing: { id: migrated.previewState.id, period: migrated.previewState.period,
    hpMax: migrated.previewState.derived.hpMax,
    unsupportedAbilities: migrated.report.unsupported.length,
    approvalRequired: migrated.report.approvalRequired },
  proposal: { id: draft.previewState.id, status: draft.builderCandidate.sourceStatus,
    ok: draft.ok, okScope: draft.okScope, approved: draft.approved,
    size: draft.report.validatedNumbers.size,
    attributes: draft.report.validatedNumbers.attributes,
    speed: draft.previewState.derived.speed,
    resourceStatus: draft.report.resources,
    unmetResourcePrerequisites: draft.report.unmetResourcePrerequisites,
    approvalRequired: draft.report.approvalRequired,
    formalDefinition: draft.formalDefinition,
    ordinaryCheck: { dp: ordinaryCheck.dp, total: ordinaryCheck.total,
      dc: ordinaryCheck.dc, success: ordinaryCheck.success } },
}, null, 2));
