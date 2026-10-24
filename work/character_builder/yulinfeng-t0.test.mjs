import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCharacter } from './builder.mjs';

const candidate = JSON.parse(readFileSync(new URL('./real_character/yulinfeng_t0.candidate.json', import.meta.url)));

test('T0 migration preserves confirmed growth but refuses unknown runtime values', () => {
  assert.equal(candidate.initial.xp, 2);
  assert.equal(candidate.definition.skills.医疗.level, 2);
  assert.equal(candidate.definition.skills.制造.subs.炼药.level, null);
  assert.equal(candidate.definition.overrides.derived.hpMax, undefined);
  assert.equal(candidate.initial.health, null);
  const built = buildCharacter(candidate.definition, candidate.initial);
  assert.equal(built.ok, false);
  assert.ok(built.report.missing.includes('attributes.力量'));
  assert.ok(built.report.missing.includes('initial.health'));
  assert.ok(candidate.definition.equipment.every(item => item.id !== 'yulinfeng.qifeng.repaired'));
});
