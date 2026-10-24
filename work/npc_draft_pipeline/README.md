# 901 NPC Draft Pipeline v0.1

此目录只把 Story Factory 的人物定位与**独立 AI 步骤提出的数值**交给现有 Character Builder 验证。AI 不在 Builder 内运行；预览状态不是正式人物初始定义。`formalDefinition` 始终为 `null`，正式采用仍须独立的主持或作者批准及初始状态确认。

## 输入格式

Blueprint 见 `blueprint.schema.json`，两个实例如 `existing_ranhonglian.blueprint.json` 与 `new_patrol.blueprint.json`。必填 `identity.id/name`、`period`、`narrativeRole`、`combatProfile.style/strengths/weaknesses`、`abilityConcepts`、`sourceStatus`；`powerReference` 可选，仅允许 `T0` 至 `T8`，原样交给 Builder 作为作者参照，绝不换算属性、技能或军职强度。

`existing_character` 使用 `sourceStatus: "EXISTING_SOURCE"`，且须为叙事定位和战斗方式提供 `narrativeSources`。调用前把已核来源卡和叙事 Blueprint 分别放进 `createNpcDraftPipeline({ existingCharacters, existingBlueprints, adapter })`；单次请求只能引用与预加载 Blueprint 一致的内容，不接受改写叙事、替代数值或来源卡。输出沿用原卡六属性、时期、卡面最终覆盖与逐字段证据。乱红莲的 `demoInitial` 仍标为未知状态下的演示假设。

`new_character_proposal` 使用 `sourceStatus: "PROPOSED"`。独立 AI 步骤可提出 `size`、六属性、主／子技能、描述性 `equipment`、`resourceIds` 和演示 `initial`；实例如 `new_patrol.candidate.json`。接口为每个提交的数值路径输出 `numericStatuses[path] = "PROPOSED"`，Builder 计算的数值也只标为 `PROPOSED` 预览。能力概念只进入 `abilities` 说明，统一标为引擎未支持。候选不能直接注入资源效果、卡面最终覆盖、自动成功覆盖或可执行武器参数。

资源 ID 交给创建接口时预先配置的 production Resource Adapter。报告分别列出资源候选状态、来源是否存在、901 采用、人物取得、前提状态和引擎支持；待定资源不产生 Builder 效果。`report` 同时给出合法预览数值、缺项、未适配内容、未满足的资源前提及待批准项目。返回值的 `okScope: "BUILDER_PREVIEW_ONLY"` 明确限定 `ok`：它只表示候选通过当前转换与 Builder 预览验证，不表示任何检定已执行、作者批准或可写入正式存档；`approved` 恒为 `false`，`formalDefinition` 恒为 `null`。

## 运行

从 `TRPG outputs` 根目录执行：

```sh
node work/npc_draft_pipeline/demo.mjs
node --test work/npc_draft_pipeline/pipeline.test.mjs
```

Demo 同时检查乱红莲原时期及生命 20 不变，并用技术样本“示例巡逻员”完成感知＋洞察普通检定。样本的训练木剑仅是装备提案；PHB 健步如飞 1 级仅是资源候选，没有 901 采用及取得记录，所以速度不加 1。此人不进入 901 Canon。
