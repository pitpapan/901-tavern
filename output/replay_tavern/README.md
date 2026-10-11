# 901帝都重玩：当前版本入口

2026-10-11整理。当前运行候选为 **M1_IMPORT_20261008_004**，设定已同步至UCL_20261008_007。作者档案已至UCL_012；长期居住、穿越者处境、组织／商运三组仍待投影，不能视为已装入004。

## 一次取得全部文件

[手动导入ZIP](901_帝都重玩_004_手动导入包_20261011.zip) · [完整导入说明](world_sync_20261008_candidate/手动导入说明.md) · [本机路径清单](world_sync_20261008_candidate/路径清单.txt)

| 用途 | 当前文件 |
|---|---|
| 独立世界书，130条 | [901_帝都重玩_M1_20261008.json](world_sync_20261008_candidate/import/901_帝都重玩_M1_20261008.json) |
| ST主持角色卡，内嵌同一世界书 | [901_帝都主持.card.json](world_sync_20261008_candidate/import/901_帝都主持.card.json) |
| 玩家御临风Persona | [901_御临风.persona.json](world_sync_20261008_candidate/import/901_御临风.persona.json) |
| 文风模块 | [文风_prompt.json](world_sync_20261008_candidate/import/文风_prompt.json) |

已使用002或003时，只更新关联世界书即可；保留原聊天、已有Persona、文风和模型参数。内嵌／独立书择一，不重复注入。首次安装按完整说明区分角色、Persona与提示模块入口。

004原批次16条更新、无新增，130个UID及加载配置保留：6常驻、116关键词、8禁用。[逐项变更](world_sync_20261008_candidate/变更清单.md)。本次只收拢文件与路径，没有修改运行内容。

## 回退、历史与核验

003、002完整包保留供回退。旧版Persona原路径和三条有效文风别名保留；用户指定的playtest_fix_20261005/import/文风_prompt.json仍有效。当前Persona另以相同字节收拢到004。

[清理记录](../../work/maintenance/cleanup_20261011/README.md)说明已删除的旧导出和缓存及Git恢复点。原始团录、作者档案、人工审阅、来源清单、F交付与完整参数预设保留。旧作者记录或manifest中的历史文件路径按形成时期理解，已退役载荷可据清理清单从Git读取。

scripts/export_replay_tavern.py与scripts/check_replay_tavern_format.mjs是旧v1导出工具，不用于维护004，不应为本次交付运行。

[004内容核验](../../work/replay_research/runtime_sync_20261008/verification.json)与[本次打包核验](../../work/maintenance/cleanup_20261011/verification.json)分开记录。未操作酒馆、调用模型或重新试跑，实际运行仍未验收。

[机器入口](latest_release.json) · [004来源与指纹](../../work/replay_research/runtime_sync_20261008/manifest.json) · [作者接续](../../work/replay_research/README.md)
