# 901 Resource Adapter v0.1

本目录含四项 PHB／RE 通用样本及御临风重玩基线的两项条件检定效果。`resources.json` 分别记录来源、901 采用、前提适配和引擎支持状态；目录自身的采用状态均为 `UNDECIDED`。御临风两项能力的重玩分支采用与取得记录另存在 `yulinfeng_replay_t0.records.json`，不授权其他人物或资源。四项通用样本仍只在隔离 demo 中验证。

从 `TRPG outputs` 目录运行：

```sh
node work/resource_adapter/demo.mjs
node --test work/resource_adapter/adapter.test.mjs
```

## 加载与信任边界

`adapter.mjs` 是浏览器可导入的纯 ESM，不使用 Node 内置模块。Node 由 `catalog.node.mjs` 读取同一份 JSON。浏览器可用：

```js
import { createResourceAdapter } from './adapter.mjs';
const response = await fetch(new URL('./resources.json', import.meta.url));
if (!response.ok) throw new Error(`resource catalog HTTP ${response.status}`);
const catalog = await response.json();
const adapter = createResourceAdapter(catalog, { mode: 'production',
  adoptionRecords: trustedAuthorAdoptions, grants: trustedCharacterGrants });
```

正式集成必须从受控资源文件取得目录，从独立作者采用记录取得 `adoptionRecords`（`resourceId`、`status`、`source`），从独立人物资料取得 `grants`（`characterId`、`resourceId`、`source`，以及所需实例状态）。这些输入应在人物构筑请求之前由集成层加载与核对，不能来自同一次模型调用或聊天变量。目录条目的 `adoption` 保留原始目录状态；正式授权由独立记录决定。目前只有御临风重玩分支的两项条件检定有正式记录；直接使用目录的 production 模式不会赋予任何样本资源。`createResourceAdapter` 本身无法证明调用方提供的外部记录真实；把聊天变量作为目录、采用记录或人物取得记录会破坏这条边界。

`adapter.selectResources(definition, ids)` 只接受稳定 ID 数组。调用者不能在选择时声明采用状态或取得来源。适配器按独立 901 采用记录、独立人物取得记录与引擎支持状态决定是否交给 Builder；未通过的资源仍可保留说明，但 Builder 不应用数值。`mode: 'demo'` 允许预先注入隔离测试 grants，生成 `adoptionScope: 'demo'`；production 适配器拒绝执行这类状态。选择不会修改传入的人物定义或目录。一个定义已有其他 `resources` 时，适配器拒绝合并，避免绕过目录校验；该输入须由正式集成先行处理。

`translateApActionPrice(ap)` 与 `adapter.actionPrice(resourceId)` 只解释目录里的动作价格，不执行能力或证明取得资格。已确认映射为 2AP→`swift`、4AP→`move`、6AP→`standard`、8AP→`standard`＋`swift`，返回 `phbActions` 数组。其他数值须逐项适配；901 仍按 PHB 动作次数与替换关系运行，不建立 RE AP 池。

Builder 仍负责 `derivedBonus`、效果来源去重和卡面 `base`／`final` 防重叠。构筑后的 `state.resourceRefs` 只保存资源 ID、出处和采用／取得记录、前提状态、必要实例状态；不保存目录参数或效果。攻击时 `weaponInput` 与 `swordThrustModifier` 从适配器加载的目录读取伤害和加值，即使运行状态中被插入同名 `parameters` 也不会使用。目录必须由集成层视为可信输入；运行时物品数量等实例状态仍需要存档生命周期保证。

`checkModifier(state, resourceId, {checkId, skill})` 对已授权且已取得的条件检定资源读取目录加值，并校验准确的检定情境。调用方须由可信裁定确定 `checkId`，再把返回值交给 `core.check` 的 `modifier`；玩家的自然语言或同次模型输出不能直接证明触发条件。它只提供数值，不代替原能力的其他叙事效果。

## 四项样本

| 资源 | 当前适配 |
| --- | --- |
| PHB 便携飞镖 | 已持有且手持、数量至少 1 时给 `core.mjs` 普通投掷武器输入：1L、射程单位 20 米；是否在射程内及投掷后扣除库存仍由调用方处理。 |
| PHB 健步如飞 1 级 | 取得记录及力量前提通过后，经 Builder 给基础速度 +1。2 级是提升到 +3，未来不能与 1 级累加。 |
| PHB 剑击 1 级“刺击” | demo 范围内要求明确声明刺击，且攻击输入中的 `weapon.itemId` 与当前装备的细长直刃剑一致，返回 +1 攻击 DP，再由 `core.mjs` 结算。其他剑的原文 -1 DP 尚未接入；正式模式需要可信剑类装备来源，故此条标为 `DEMO_ONLY`。 |
| RE 俄罗斯军刀术 5 级“砍与刺” | 原文 6 AP、两次匕首近战攻击、冷却 1 轮。动作价格转换为 PHB `standard`，能力仍标为 `UNSUPPORTED`；不建立 AP 池或虚构两次普通攻击。 |

## 御临风重玩基线：首批条件检定

| 卡面能力 | 已适配的窄范围 | 尚未接入 |
| --- | --- | --- |
| PHB 方向感 1 级 | `survival.find-direction` 且使用求生技能时 +6DP。 | “不会迷失方向”的叙事适用边界不由数值接口自动裁定。 |
| 耶各代行者·下层位面学 | `knowledge.death-world` 死亡世界学知识检定 +6DP。 | 未知事实、弱点和免疫力仍须按知识检定结果与角色知识裁定。 |

两项原文与御临风卡面均写 +3DP；+6DP 是作者针对 901 重玩分支的明确数值决定，目录同时保留原文数值。当前 RE 核心分包未提供这两项的 +6DP 条目，故不推出其他特性一律翻倍。

两项均来自已批准的御临风重玩强度基线和对应卡面；作者又明确决定两项均为 +6DP。独立的 `yulinfeng_replay_t0.records.json` 仅登记这两项在重玩分支的采用和御临风取得；`real_character/yulinfeng_replay_t0.test.mjs` 同时验证隔离与 production 授权路径。开档健康、意志 9/9、XP 0 已确认。开局投影只保留普通帝国制式甲、修复前弃风和风迹，数值未知的甲、剑、风迹机制暂未由 Adapter 提供可执行资源；条件检定授权不自动启用其他卡面能力。

旧技能数字前提只看主技能和目录明确指定、且人物资料 `scopeId` 精确匹配的子技能；不会用名字包含“剑”来推定适用。旧“专业：匕首”要求 `白刃.匕首` 至少 1 级且领域 ID 匹配。RE 条目即使不支持执行，也检查能核验的属性、技能与专业；先前 4 级的取得记录缺失时写 `prerequisiteStatus: 'PENDING'`，不会当作已满足。正式学习资格和取得事实由独立记录提供，资源原文中的 XP 或取得说明不会自动给人物发放能力。

依赖未适配资源的操作须调用 Builder 的 `requireOperationSupport(report, [id])`。特殊防御、混合伤害、额外动作、RE 双击与冷却，以及正式资源采用／人物授权记录的接入仍按需处理。
