// Branch-specific projection. Keep the complete updated card as evidence;
// build a new replay opening from the author's narrower opening decisions.
export function projectYulinfengReplayOpening(baseline) {
  if (baseline?.baselineStatus !== 'APPROVED_REPLAY_BASELINE' ||
      baseline.definition?.id !== 'PC_YULINFENG_REPLAY_T0' ||
      !baseline.openingState?.confirmedInitial)
    throw new Error('approved Yulinfeng replay baseline and opening decision required');

  const card = baseline.definition;
  const opening = baseline.openingState;
  const armor = {
    id: 'opening.imperial-standard-armor', name: '帝国制式盔甲',
    source: '作者决定：重玩开局穿帝国制式盔甲；普通基础同风之忧郁，无其特殊效果',
    status: 'OPENING_EQUIPPED', equipped: true,
    baseReference: '风之忧郁的普通制式甲基础', specialEffects: [],
    engineSupportStatus: 'UNSUPPORTED',
  };
  const sword = {
    id: 'yulinfeng.qifeng.pre-repair', name: '弃风（修复前）',
    source: 'work/replay_research/opening_state_consolidated.md#御临风的早期装备与剑气；作者决定：只保留早期已确认物品',
    status: 'OPENING_OWNED_EQUIPPED_UNKNOWN', engineSupportStatus: 'UNSUPPORTED',
  };
  const windTrace = {
    id: 'opening.yulinfeng.wind-trace', name: '风迹',
    source: '人物卡资料集_检索版.md#御临风:406-435；作者决定：开局仅有风迹作为能量来源',
    summary: '风迹存在；能量上限、当前余额与具体消费尚未适配。卡面白刃等级已照录，不额外叠加风迹 +2。',
    engineSupportStatus: 'UNSUPPORTED',
  };
  const definition = {
    id: card.id, name: card.name, period: card.period,
    sources: [...structuredClone(card.sources), '作者决定：重玩开局仅有早期物品、风迹；按开局资源重算派生值'],
    size: card.size, attributes: structuredClone(card.attributes),
    skills: structuredClone(card.skills),
    equipment: [armor, sword], abilities: [windTrace],
  };
  return {
    definition,
    initial: structuredClone(opening.confirmedInitial),
    derivedStatus: 'BASE_VALUES_ONLY_PENDING_OPENING_RESOURCE_ADAPTATION',
    unresolved: [
      { id: armor.id, issue: '基础防护与速度惩罚等数值未核定；基础防御和速度不能视为穿甲后的最终值' },
      { id: sword.id, issue: '修复前攻击参数、是否持剑及特殊效果未核定；不得套用修复后 6L／风池' },
      { id: windTrace.id, issue: '开局能量上限和余额未核定；不得创建魔力池或修复后弃风风池' },
    ],
  };
}
