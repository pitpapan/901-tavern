import { readFileSync } from 'node:fs';
import { buildCharacter } from '../builder.mjs';
import { check } from '../../rules_engine/core.mjs';

const baseline = JSON.parse(readFileSync(new URL('./yulinfeng_replay_t0.baseline.json', import.meta.url)));
const built = buildCharacter(baseline.definition, baseline.openingState.isolatedTestInitial);
if (!built.ok) throw new Error(JSON.stringify(built.report));
const result = check(built.state, { attribute: '感知', skill: '洞察', dc: 2,
  dice: [8, 8, 8, 8, 8, 8] });
console.log(JSON.stringify({ baselineStatus: baseline.baselineStatus,
  openingStatus: baseline.openingState.isolatedTestInitialStatus,
  character: built.state.name, hpMax: built.state.derived.hpMax,
  defense: built.state.derived.defense, speed: built.state.derived.speed,
  unsupportedCount: built.report.unsupported.length,
  check: { dp: result.dp, rolledSuccesses: result.rolledSuccesses,
    autoSuccesses: result.autoSuccesses, total: result.total,
    dc: result.dc, success: result.success } }, null, 2));
