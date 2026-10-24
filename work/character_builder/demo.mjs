import { readFile } from 'node:fs/promises';
import { buildCharacter, requireKnownSkill, requireOperationSupport } from './builder.mjs';
import { beginTurn, check, resolveAttack } from '../rules_engine/core.mjs';

const readExample = async name => JSON.parse(await readFile(new URL(`./examples/${name}.json`, import.meta.url), 'utf8'));
const requireBuild = result => {
  if (!result.ok) throw new Error(JSON.stringify(result.report));
  return result;
};

const attackExample = await readExample('ordinary_attack');
const attacker = requireBuild(buildCharacter(attackExample.attacker, attackExample.initial.attacker));
const target = requireBuild(buildCharacter(attackExample.target, attackExample.initial.target));
requireKnownSkill(attacker.state, '白刃', attackExample.attack.weapon.sub);
requireOperationSupport(attacker.report, []);
const attack = resolveAttack(beginTurn(attacker.state).state, target.state, attackExample.attack);

const noncombatExample = await readExample('noncombat');
const scholar = requireBuild(buildCharacter(noncombatExample.definition, noncombatExample.initial));
requireKnownSkill(scholar.state, noncombatExample.check.skill);
const knowledge = check(scholar.state, noncombatExample.check);

console.log(JSON.stringify({
  attack: { dp: attack.result.roll.dp, diceSuccesses: attack.result.roll.rolledSuccesses,
    autoSuccesses: attack.result.attackTrace[1].auto, cap: attack.result.cap,
    beforeDR: attack.result.attackTrace[2].value, afterDR: attack.result.actualDamage,
    targetHealth: attack.target.health, attackerTurn: attack.attacker.turn },
  noncombat: { derived: scholar.state.derived, dp: knowledge.dp,
    skill: knowledge.skill, total: knowledge.total },
  reports: { attacker: attacker.report, target: target.report, noncombat: scholar.report },
}, null, 2));
