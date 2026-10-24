# 008主持体验补充采用及导出

2026-10-18，按UCL_20261018_007采用按需规则讲解、明确反馈调整与相称失败后果，交付[008候选](../../../output/replay_tavern/flow_guidance_20261018_candidate/README.md)。继承007敌人、XP及剧情向简化、NPC自由裁定；玩家强度估算实验继续后置。

先检查source_changes.diff，应用29份源稿及导航修改（含18份场景稿），再检查proposed.diff并从007生成。世界书仅更新通用条目79768996，135条不变；136个UID及加载字段全部保留。未改原团、真实分支状态、旧导出、运行引擎或安装目录。

source_updates.json保存修改前后文本；source_inventory.json保存来源指纹，并核对122条涉及本次修改文件的继承来源行未位移。scene_notes.json对应各场景末节，随包手册保留007／006提示。projected_entries.jsonl及世界书元数据保存来源和007继承链，采用不等于事件发生。

准备／应用脚本为本轮一次性工具，不重新运行旧006／007脚本。build_candidate.py拒绝覆盖008；verify008.mjs沿用本地SillyTavern结构校验与转换函数，另检查本批文本、来源和旧数据不变，不运行模型或战斗模拟。

[静态核验](verification.json) · [打包核验](package_verification.json) · [旧文件指纹](protected_before.json)。没有独立审核者或实际模型行为验收声明。
