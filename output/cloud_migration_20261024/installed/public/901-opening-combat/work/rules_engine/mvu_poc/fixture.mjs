import { beginTurn, createCharacter } from '../core.mjs';

export const NAMESPACE = '901_rules_poc';
export const DEMO_DICE = [8, 8, 8, ...Array(9).fill(1)];
export const DEMO_ATTACK = {
  attackerId: 'attacker', targetId: 'target',
  attack: {
    weapon: { type: 'melee', sub: '长剑', damage: 2, severity: 'L' },
    dice: DEMO_DICE,
    defenses: [{ id: 'test-physical-dr', kind: 'dr', value: 2 }],
  },
};

export function createTestRoot(chatId) {
  const attacker = beginTurn(createCharacter({
    name: '测试攻击者',
    attributes: { 力量: 6, 敏捷: 3, 智力: 2, 感知: 3, 意志: 3, 风度: 2 },
    size: 5, skills: { 白刃: { level: 5, subs: { 长剑: { level: 3 } } } },
  })).state;
  const target = createCharacter({
    name: '测试目标',
    attributes: { 力量: 4, 敏捷: 4, 智力: 2, 感知: 4, 意志: 3, 风度: 2 },
    size: 5,
    health: { intact: 9, B: 0, L: 0, A: 0, temp: 0, coma: false, deteriorationStopped: false },
    derived: { hpMax: 9, defense: 4 },
  });
  return { schemaVersion: 1, revision: 0, chatId, operations: {},
    actors: { attacker: { name: '测试攻击者', state: attacker },
      target: { name: '测试目标', state: target } } };
}
