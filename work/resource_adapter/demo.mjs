import { buildCharacter, requireOperationSupport } from '../character_builder/builder.mjs';
import { beginTurn, resolveAttack } from '../rules_engine/core.mjs';
import { createResourceAdapter } from './adapter.mjs';
import { loadNodeCatalog } from './catalog.node.mjs';

const base = { id: 'resource-demo', name: '仅供测试的构筑人物', period: 'demo',
  sources: ['work/resource_adapter/demo.mjs'], size: 5,
  attributes: { 力量: 4, 敏捷: 4, 智力: 2, 感知: 3, 意志: 3, 风度: 2 },
  skills: { 运动: { level: 3, subs: { 飞镖: { level: 1, scope: '飞镖投掷',
    scopeId: 'weapon.dart' } } }, 求生: { level: 0 },
    白刃: { level: 3, subs: {
      长剑: { level: 1, scope: '长剑攻击', scopeId: 'weapon.long_sword' },
      匕首: { level: 1, scope: '匕首攻击', scopeId: 'weapon.dagger' },
    } } },
  equipment: [{ id: 'sword-fixture', equipped: true, weaponClass: '细长直刃剑',
    type: 'melee', sub: '长剑' }],
};
const initial = { health: 'healthy', willCurrent: 5, turn: 'ready' };
const ids = [
  'phb03.weapon.portable-dart', 'phb03.feat.swift-foot.1',
  'phb03.feat.sword-thrust.1', 're103.feat.russian-saber.double-strike.5',
];
const adapter = createResourceAdapter(loadNodeCatalog(), { mode: 'demo',
  grants: ids.map(resourceId => ({ characterId: base.id, resourceId,
    source: 'isolated demo grant',
    ...(resourceId === 'phb03.weapon.portable-dart'
      ? { instance: { quantity: 1, held: true } } : {}),
  })) });
const selected = adapter.selectResources(base, ids);
const built = buildCharacter(selected, initial);
const target = buildCharacter({ ...base, id: 'resource-demo-target', name: '测试目标' }, initial);
if (!built.ok || !target.ok) throw new Error(JSON.stringify({ built: built.report, target: target.report }));

requireOperationSupport(built.report, ['phb03.weapon.portable-dart']);
const dart = adapter.weaponInput(built.state, 'phb03.weapon.portable-dart');
// Range and subsequent ammunition consumption remain explicit caller duties.
const thrown = resolveAttack(beginTurn(built.state).state, target.state, {
  weapon: dart, dice: [8, 8, 1, 1, 1, 1],
});
const swordInput = { technique: '刺击',
  weapon: { itemId: 'sword-fixture', type: 'melee', sub: '长剑', damage: 2, severity: 'L' },
  dice: Array(8).fill(1) };
const thrustDpBonus = adapter.swordThrustModifier(built.state, swordInput);
const swordAttack = resolveAttack(beginTurn(built.state).state, target.state,
  { ...swordInput, modifier: thrustDpBonus });
console.log(JSON.stringify({
  catalogAdoption: adapter.getResource('phb03.feat.swift-foot.1').adoption,
  sampleScope: built.state.resourceRefs[0].adoptionScope,
  speed: built.state.derived.speed,
  thrown: { dp: thrown.result.roll.dp, actualDamage: thrown.result.actualDamage,
    targetHealth: thrown.target.health },
  swordThrustDpBonus: thrustDpBonus,
  swordAttackDp: swordAttack.result.roll.dp,
  unsupported: built.report.unsupported.map(item => ({ id: item.id,
    prerequisiteStatus: item.prerequisiteStatus, reason: item.unsupportedReason })),
}, null, 2));
