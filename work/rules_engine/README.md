# 901 JavaScript 规则内核：第一阶段

独立的 Node.js ESM 模块；没有数据库、SillyTavern、界面、AP 池或外部依赖。规则权威为 `../rules_fusion/901-core-rules-v0.1.md`、`901-rules-compatibility.md`、`901-open-decisions.md`，原文路径写在这三份文件内。运行 `node --test work/rules_engine/core.test.mjs`；运行 `node work/rules_engine/demo.mjs` 查看一次完整攻击。

第二阶段的隔离 MVU 接入 PoC 见 [`mvu_poc/README.md`](mvu_poc/README.md)。该适配层调用本内核，当前只通过 Node 替身测试；真实 SillyTavern/MVU 保存尚未验证。

## 状态与接口

`createCharacter(input)` 仅补新建人物或缺失字段的基础值。输入中的 `derived`、现有 `health`、`will`、技能自动成功、资源余额和明确卡面异式优先保存。状态是普通 JSON 对象，适合后续持久化；规则函数不改传入对象，返回 `{state, result}`，攻击返回 `{attacker, target, result}`。

```js
{
  attributes: { 力量: 6, 敏捷: 3, 智力: 2, 感知: 3, 意志: 3, 风度: 2 },
  attributeAuto: { 力量: 1 },
  skills: { 白刃: { level: 5, auto: 1,
    subs: { 长剑: { level: 3 } } } },
  size: 5,
  derived: { hpMax: 13, defense: 3, speed: 14, initiative: 5, willMax: 5, vision: 30 },
  health: { intact: 13, B: 0, L: 0, A: 0, temp: 0,
    coma: false, deteriorationStopped: false },
  statuses: [{ type: '疲乏', source: 'march', points: 2 }],
  attributeDamage: {}, will: { current: 5, max: 5 }, xp: 0,
  greatPowersAvailable: 0, legendaryIntelligence: 0,
  resources: {}, turn: { /* PHB action availability */ }, nodeLedger: []
}
```

`attributeAuto`、`skill.auto` 可显式覆盖自动推算，以保留旧卡和特式。主技能 `level≤5`；`subs` 下仅取一次最匹配的子技能。`derivedOverrides` 自动记录显式卡面字段，升级属性时只重算其余派生值；明确 HP 卡面值和容量不会批量重算。`resources` 原样透传，不建立通用能量池或特殊资源价格。

`attributeDamage` 会降低检定、攻击及状态门槛采用的**有效属性**；跨过 6/11 等门槛时，相应等级自动成功暂时失效。它不重排既有生命槽，也不改写已确认的卡面 HP 容量；涉及特殊属性伤害对生命上限的即时影响仍须按具体来源确认。

| 操作 | 主要输入 | 输出要点 |
| --- | --- | --- |
| `rollPool(dp, dice)` | 完整 D10 骰序，先列初始池，再列爆骰 | 实际用骰、普通／机运骰、掷骰成功数、机运 1 标记 |
| `check(state, opts)`、`oppose(...)` | 属性、主／子技能、修正、DC、资格、骰序 | DP、掷骰／901 自动／RE 附加成功分项、总数与胜负 |
| `beginTurn`、`spendAction`、`endTurn` | 动作种类与反射／响应／威胁上下文 | 可否执行、PHB 次数和下一轮债务；无 AP 字段 |
| `advanceMultiRoundAction` | 行动 ID、来源规定的总轮数 | 每轮消耗整轮动作，并记录进度；中断后果由具体来源定 |
| `resolveAttack(attacker,target,input)` | 武器、骰序、目标最终防御覆盖、来源明确的防护 | 攻击方／目标新状态和 A/B/C 阶段结果 |
| `resolveDamage`、`applyWounds` | 单段伤害、伤型、防护来源；或 B/L/A 点数 | 实际生命槽变化与当前生存状态 |
| `checkBeforeAction`、`advanceDeterioration`、`firstAid` | GM DC／骰序；混有 B/L 时的选槽；急救者状态 | 昏迷、稳定、每轮恶化或死亡 |
| `applyStatus`、`statusLevel`、`recover` | 常见状态来源与骰序、休息／节点／章节事件 | 状态抵抗、六属性门槛、基础恢复 |
| `spendWill`、`changeDefinedResource` | 已接入能力明示的费用或已定义资源池的增减 | 有界的资源余额；不生成价格或资源池 |
| `upgradeAttribute`、`upgradeSkill`、`settleNode` | 学习资格、技能层级、节点 ID／主持 XP | XP 扣发、自动成功、大能待选数、节点清算红利 |

所有骰子由调用方注入；爆骰需要额外提供骰值。只有 `dice` 被消耗的前缀进入结果。资格须在掷骰前给出；需要训练或剧情条件的能力不得仅凭 XP 购买。`settleNode` 使用唯一 ID 防重复；单个节点发 XP 并回 1 意志，明确的“节点清算”才按已确认传奇智力点数发一次 1／2／4／6／8XP。

`resolveAttack` 支持天生、白刃、投掷、弓、枪的 PHB 基础 DP／上限。调用方负责确认距离、定位、最低力量和武器特殊限制，并用 `eligible`、`distancePenalty`、`modifier` 输入结果；`targetDefense` 表示已经算完的**最终防御**，若不提供则用卡面基础防御减伤势减值。普通攻击需先 `beginTurn`，然后自动花一个标准动作。`resolveDamage` 接受 `physical` 或带 `energyType` 的 `energy` 单段伤害；防护条目按 `kind` 标记 `immunity`、`reduce`、`ignore`、`hardness`、`absorb`、`dr`、`energyResistance`、`cancel`、`downgrade`。非 DR／能量抗力的多个同阶段来源须显式标注叠加；硬度等仅在能力确有来源时传入。临时生命从 `health.temp` 扣除。

无完好槽且最重为 B 的行动必须传 `preActionCheck: {dc,dice}`；PHB 没指定 DC，内核不代定。A 伤逐轮恶化同时有 B、L 时，`advanceDeterioration(state,{from:'B'|'L'})` 必须指定选槽。全 A 死亡不接受自然恢复；急救成功只止恶化，不恢复完好槽。

常见异常支持六属性关键值、抵抗、同名取最高（疲乏合计）、重度门槛和休息。剧痛／疲乏若来源明确允许毁灭性后果，`applyStatus` 以 `catastrophicAllowed: true` 与 `attributeDamageAllocation` 输入承受者／主持选定的分配；内核不替他们分配。恢复事件由调用方在实际满足 15 分钟、8 小时、两天或七天及所需长休次数时触发，不在内核中模拟日历。

## 当前边界

- 未接入特殊技能、专长、破甲／破魔／高速、混合或额外多段伤害、定值伤害、物体伤害、特殊感官、复杂异常和来源特定治疗。
- 未推断 AP 减费、恢复、额外动作，也未定自学能力、补正、负面特性、血统、改造或能量池的价格与效果。
- 反射的具体中断效果、响应的目标选择、威胁范围几何、远程射程和资源资格由调用方按场景及具体条目先行确认；内核处理已给定的动作费用和普通数值结算。
- 规则状态可序列化，但目前没有持久化、网络接口、Character Builder 或 Tavern Cards 连接。
