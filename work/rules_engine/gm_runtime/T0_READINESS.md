# 901 T0 readiness：研究候选与隔离门禁

> 历史阶段记录。作者随后决定以现有完整卡面强度作为当前重玩 T0 基线 `APPROVED_REPLAY_BASELINE`；原团历史 T0 的逆推不再是重玩运行阻塞。现行隔离候选与门禁见 [`REPLAY_READINESS.md`](REPLAY_READINESS.md)。以下结论仅描述修订前的测试状态。

此轮只修改隔离测试候选。御临风迁移候选见 [`yulinfeng_t0.candidate.json`](../../character_builder/real_character/yulinfeng_t0.candidate.json)，逐项来源、时期和逆推链见 [`yulinfeng_t0.evidence.md`](../../character_builder/real_character/yulinfeng_t0.evidence.md)。T0 尚无完整六属性、体积、主技能及当前伤势／意志／能量；`buildCharacter()` 返回 `ok:false`。因此该候选不得初始化为御临风的正式 MVU 数值状态。#79 的医学 2、制药子项取得、通用语 2、剩余 2 XP 已保留；制药等级没有明文，不填 1。

## 隔离门禁

[`world-turn.mjs`](world-turn.mjs) 对一条真实玩家楼层做结构化判定，核对当前聊天、楼层、swipe 和原文；风险或输入不足时只返回 `needs_input` 并生成固定待裁定文本。其操作 ID 从这三个锚点确定。待裁定元数据包含操作 ID、原玩家楼层和缺项，由 [`world-boundary-script.example.js`](world-boundary-script.example.js) 写进隔离 GM 消息的 `extra.901_world_boundary`；原玩家消息和待裁定回复均随聊天保存。这里不写规则数值。

角色脚本用酒馆助手的 `GENERATE_AFTER_DATA` 在原生模型请求前拦截；常见风险动作走同步保守分类，其他行动由 `generateRaw()` 返回 JSON。对待裁定结果调用 `SillyTavern.stopGeneration()`，再发布固定文本。不能从角色脚本动态导入 `/script.js`：在本机实际触发了 `SlashCommandParser before initialization`，原生 GM 仍会继续。隔离导入卡在 [`901_帝都T0_强制裁定隔离候选.card.json`](../../../output/replay_tavern/t0_readiness_20261014_candidate/import/901_帝都T0_强制裁定隔离候选.card.json)，保留此前 130 条世界书条目，只增加这条角色脚本。正式 GM 卡和已有存档未修改。

本机 SillyTavern 1.19.0／酒馆助手 4.11.2 实测：普通问话正常叙述；修正停止接口后，湿滑城墙攀爬和危险车流穿越均只出现固定的“待规则裁定”回复，没有成败或伤害叙述。刷新并重新打开隔离聊天，原玩家消息和待裁定回复保留。修复前的两次风险行动仍走了原生工具与 GM 续述；它们虽返回缺数值而未声称成功，但**不算**程序层阻断证据。

## 当前边界

`worldRuleGate()` 对御临风 T0 一律返回 `needs_input`，因为当期已批准 Builder 定义和当前数值状态未齐。尚未以御临风执行有骰检定、MVU 写入或已结算结果续述；这些能力此前仅在独立 demo 角色的 Playable Prototype 路径获得真实浏览器验证。待裁定元数据可在刷新后读取，但“补充输入后自动沿原动作恢复”尚未实测。叙述前门禁目前依赖这张隔离卡的脚本启用与 `stopGeneration()`，无法保证其他卡、手工续写、未覆盖的风险表达或其他独立写入者遵守它；不是 SillyTavern 全局强制策略。不能把有限风险词识别和提示词当成完整通用规则判定。

本轮没有更改原始资料、正式人物卡、正式世界书、旧聊天或底层规则计算。
