import { beginTurn, createCharacter, resolveAttack } from './core.mjs';

const attacker = beginTurn(createCharacter({
  attributes: { 力量: 6, 敏捷: 3, 智力: 2, 感知: 3, 意志: 3, 风度: 2 },
  size: 5, skills: { 白刃: { level: 5, subs: { 长剑: { level: 3 } } } },
})).state;
const target = createCharacter({
  attributes: { 力量: 4, 敏捷: 4, 智力: 2, 感知: 4, 意志: 3, 风度: 2 }, size: 5,
});
const outcome = resolveAttack(attacker, target, {
  weapon: { type: 'melee', sub: '长剑', damage: 2, severity: 'L' },
  dice: [8, 8, 8, ...Array(9).fill(1)],
  defenses: [{ id: 'ordinary-DR', kind: 'dr', value: 2 }],
});
console.log(JSON.stringify({
  dp: outcome.result.roll.dp,
  diceSuccesses: outcome.result.roll.rolledSuccesses,
  cap: outcome.result.cap,
  attack: outcome.result.attackTrace,
  defenseAndWounds: outcome.result.damage.trace,
  actualDamage: outcome.result.actualDamage,
  targetHealth: outcome.target.health,
  attackerActions: outcome.attacker.turn,
}, null, 2));
