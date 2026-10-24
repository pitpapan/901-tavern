import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCharacter, requireKnownSkill } from '../builder.mjs';
import { actionEligibility, check } from '../../rules_engine/core.mjs';
import { createResourceAdapter } from '../../resource_adapter/adapter.mjs';
import { loadNodeCatalog } from '../../resource_adapter/catalog.node.mjs';

const candidate = JSON.parse(readFileSync(new URL('./ranhonglian.candidate.json', import.meta.url), 'utf8'));
const catalog = loadNodeCatalog();
const adapter = createResourceAdapter(catalog, { mode: 'production' });
const sourceNames = candidate.resourceAudit.sourceResourceNames;
const matchingCatalogIds = catalog.filter(item => sourceNames.includes(item.originalName)).map(item => item.id);
assert.deepEqual(matchingCatalogIds, candidate.catalogResourceIds,
  'Recheck resource adoption and acquisition if the catalog gains a matching item');

const definition = adapter.selectResources(candidate.definition, matchingCatalogIds);
const built = buildCharacter(definition, candidate.demoInitial);
if (!built.ok) throw new Error(JSON.stringify(built.report));
requireKnownSkill(built.state, '求生');
assert.equal(actionEligibility(built.state, 'free').allowed, true);
const result = check(built.state, { attribute: '感知', skill: '求生', dc: 1,
  dice: [8, 2, 3, 4, 5, 6, 7] });
assert.equal(result.success, true);

console.log(JSON.stringify({ characterId: built.state.id, period: built.state.period,
  cardFinals: { hpMax: built.state.derived.hpMax, defense: built.state.derived.defense,
    speed: built.state.derived.speed },
  catalogResourceIds: matchingCatalogIds, unsupportedAbilityCount: built.report.unsupported.length,
  ordinaryCheck: { attribute: '感知', skill: '求生', dp: result.dp,
    rolledSuccesses: result.rolledSuccesses, total: result.total, dc: result.dc,
    success: result.success } }, null, 2));
