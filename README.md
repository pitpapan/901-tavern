# 901 · 飘零大陆

2026-10-24：[云端迁移 requirements 与启动步骤](docs/cloud-migration-20261024.md)；[双版本资源开发存档（尚未完成发布）](work/replay_research/six_books_20261023/checkpoint-20261024.md)。

这里保存一个长期TRPG世界的世界书、地区与社会模型、人物资料、原团证据，以及帝都重玩的运行候选。世界中有多族帝国、魔法与武技、跨越漫长寿命的传承，以及仍然危险的山脉和遗迹。

**第一次阅读：[世界总览](world/overview.md) → [地区、社会与人物目录](world/README.md)。** 本仓库主要面向作者与GM，包含秘密和原团后期信息；尚未制作无剧透玩家版。

![飘零大陆当前作者地图](work/replay_research/maps/piaoling_geographic_draft_v02_20261015.png)

地图v02为当前作者层DRAFT，精确距离、边界和部分候选地形未定；图中的聚落是大量城乡网络的抽样，详见[地图说明](work/replay_research/maps/piaoling_atlas_working_20261015.md)。

## 按用途阅读

| 目的 | 入口 |
| --- | --- |
| 了解世界及当前作者设定 | [世界总览](world/overview.md)、[全部主题目录](world/README.md) |
| 连续阅读已有世界书条目 | [182条世界书阅读版](world/worldbook.md)，与其F阶段来源一一对应；后续作者增量从主题目录进入 |
| 查询人物与当期关系 | [人物索引](output/replay_f_review/v1/characters/index.md)、[时期与关系目录](world/README.md#人物剧情与知情) |
| 查证原团、原设定与用户确认 | [来源入口](sources/README.md) |
| 使用SillyTavern候选文件 | [运行资料入口](output/replay_tavern/README.md)；004保留基线、005及10月14日隔离候选分别标明 |
| 了解规则与程序模型 | [规则资料库](901_rules_source_library/README.md)、[规则融合](work/rules_fusion/901-core-rules-v0.1.md)、[规则引擎](work/rules_engine/README.md) |
| 继续作者工作 | [主题工作索引](work/replay_research/README.md)、[项目约定](AGENTS.md) |

## 怎样理解这些资料

- **原团历史**：保留原帖、身份、传闻和人物判断的实际性质。原团后来发生的事情，不保证在重玩中重演。
- **已采用作者设定**：用户已明确采用，仍可保存在作者层DRAFT中。DRAFT不等于“未采用”，采用也不等于新剧情已经发生。
- **未采用候选**：只能作为讨论素材；各主题稿中的采用记录决定范围，不能整篇自动生效。
- **T0与D3**：T0是御临风首次抵达帝都附近的重玩起点；根目录`current_state.md`属于原团续跑D3。
- **运行候选**：是为工具选择、裁剪的内容，拥有自己的截止点。最新作者设定不会自动写进旧导入包。

## 仓库结构

| 目录 | 用途 |
| --- | --- |
| `world/` | 面向读者的总览、主题导航及世界书阅读视图 |
| `sources/`、`extracted-*/` | 可在仓库内查阅的设定参考及原团提取正文 |
| `output/replay_f_review/v1/` | 重玩世界书作者基线、逐人档案与来源；仍在使用 |
| `work/replay_research/` | 当前世界／人物／剧情主题及采用记录；保留有用草案 |
| `output/replay_tavern/` | 分版本的手动导入资料与隔离候选 |
| `work/rules_fusion/`、`work/rules_engine/`等 | 规则融合和在研程序模型，使用状态见各自README |
| `archive/` | 旧phase、重建、审计和审批工程的恢复入口；当前独有版本打包保留 |
| `work/maintenance/` | 清理范围和恢复位置，通常无需顺读 |

## 本次整理范围

2026-10-15补充读者入口和四份原参考快照，退役50份已整合中间稿、旧导航及修订前快照。既有世界书、运行包、原团、采用记录和未提交的人物／剧情／程序工作保留。[清理与恢复说明](work/maintenance/cleanup_20261015/README.md)。

仓库可以在本地完整阅读；不要求安装酒馆、运行脚本或启动模型。没有自动发布或推送，也没有把此次整理视为正式Canon更新或运行验收。

2026-10-15继续清理：旧工程1505份文件退出当前树，其中1229份在D盘内容相同，276份当前独有／差异／无法对照版本存入仓库ZIP；[归档与恢复](archive/legacy_engineering_20261015/README.md)。现用通用工具和规则程序保留，当前仍引用的七份历史依据见[来源快照](sources/legacy_evidence/README.md)。
