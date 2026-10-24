import { readFileSync } from 'node:fs';
import { buildCharacter } from '../builder.mjs';
import { createResourceAdapter } from '../../resource_adapter/adapter.mjs';
import { loadNodeCatalog, loadNodeYulinfengReplayRecords } from '../../resource_adapter/catalog.node.mjs';
import { projectYulinfengReplayOpening } from './yulinfeng_replay_opening.mjs';

const baseline = JSON.parse(readFileSync(new URL('./yulinfeng_replay_t0.baseline.json', import.meta.url)));
const opening = projectYulinfengReplayOpening(baseline);
const records = loadNodeYulinfengReplayRecords();
const adapter = createResourceAdapter(loadNodeCatalog(), { mode: 'production',
  adoptionRecords: records.adoptionRecords, grants: records.grants });
const definition = adapter.selectResources(opening.definition,
  records.adoptionRecords.map(item => item.resourceId));
const built = buildCharacter(definition, opening.initial);
if (!built.ok) throw new Error(JSON.stringify(built.report));
console.log(JSON.stringify({
  characterId: built.state.id,
  derivedStatus: opening.derivedStatus,
  derivedBase: built.state.derived,
  health: built.state.health,
  will: built.state.will,
  xp: built.state.xp,
  equipment: built.state.equipment,
  abilityIds: built.state.abilities.map(item => item.id),
  resourceIds: built.state.resourceRefs.map(item => item.id),
  energyPools: built.state.resources,
  unresolved: opening.unresolved,
}, null, 2));
