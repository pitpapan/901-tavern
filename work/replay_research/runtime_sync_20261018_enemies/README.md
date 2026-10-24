# 007帝都敌人与XP采用及导出

2026-10-18，按UCL_20261018_006整版采用[七类敌人与XP](../capital_enemy_builds_rewards_draft.md)，交付[007候选](../../../output/replay_tavern/enemy_xp_20261018_candidate/README.md)。作者设计与实际事件、实际奖励分开，玩家强度估算后置。

本轮先检查source_changes.diff，应用20份已有源稿修订，再检查proposed.diff并从006一致性修订版生成。2条旧正文更新、6条新增、9条仅刷新来源行号；原130个UID与加载字段保留，现136条、6常驻、121关键词、9禁用。

source_updates.json保存本次源稿前后内容；source_inventory.json保存当前来源指纹；projected_entries.jsonl与每条901_replay元数据保存来源、采用与006继承链。新增UID来自稳定来源ID散列并检查无冲突，未通过第三方forge往返重排旧UID。完整短卡和场景补充随包，新增角色条目不携完整技能列表。

integrate_sources.py是一轮性的准备／应用脚本，不重复执行；prepare_projection.py只准备差异；build_candidate.py拒绝覆盖已存在的007。verify007.mjs使用本地SillyTavern校验器和转换函数做静态核对。没有独立审核者或模型行为验收声明，不自动安装、修改引擎或发放XP。

[核验](verification.json) · [打包核验](package_verification.json) · [受保护文件指纹](protected_before.json)。旧004／005／006与实验候选保留；latest_release.json不变。
