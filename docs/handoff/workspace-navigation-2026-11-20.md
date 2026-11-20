# 901 工作区架构与复用入口

- 普通对白知情增量本地候选：战役`gm_runtime/story-dialogue-knowledge.mjs`复用引擎`gm/assertion-contract.js`与原story-knowledge/MVU；已知命题转述与新来源说法分开，待核按后续依赖确认。默认未绑定真实语义调用器，未部署；详见战役同目录story-dialogue-knowledge.md。

- 医馆旧交知情本地候选：战役 `gm_runtime/story-knowledge.mjs` 直接复用独立引擎 `gm/knowledge.js`，经原MVU适配保存来源与逐人回执。六书 `runtime_package.py` 仅打包该依赖闭包，入口由 `narrative-style-projection.mjs` 接入普通剧情；未部署，非全世界秘密过滤，也不自动抽取获知事件。

- 雷鸣适配规则唯一维护源：`901-resource-authoring-kit/resources/execution/ed26ad5543a3.rule.json`（工作区相对路径），由现有 `tools/compile_resources.py` 编译。战役 `combat/thunder-technique.mjs` 与独立原生候选只消费编译条款；不要恢复两端数值表。规则来源、当前取得和批准分别核对。

本文件说明当前工作区的模块位置与复用边界。进入子仓库后，同时遵守该仓库的 `AGENTS.md`；具体开发状态以当前用户要求、该库最新记录和原执行计划为准，不用旧 README 或历史 TODO 覆盖较新的决定。

## 主窗口内置浏览器与 Terra

用户指定 Terra 浏览主窗口时，主代理打开或沿用当前聊天的内置标签，由 Terra 根据回传的页面决定下一步。主代理在同一标签执行并回传实时结果。详见[战役库的浏览器协作流程](<TRPG outputs/AGENTS.md#主窗口内置浏览器与-terra>)。

## 模型实测与传输工作流

本项目模型实测复用已验证的 Node 发送路径，按冻结输入和额度执行；共同连接错误先停批诊断，保留失败与原始回复。完整步骤及成功执行记录见[战役库的模型实测工作流](<TRPG outputs/AGENTS.md#模型实测与传输工作流>)。

## 三个独立仓库

| 目录 | 职责 | 入口 |
| --- | --- | --- |
| `TRPG outputs/` | 战役来源、世界／人物／剧情、六书、现有酒馆 JS／MVU 运行链路及交付包 | [工作约定](<TRPG outputs/AGENTS.md>)、[阅读入口](<TRPG outputs/README.md>)、[战役统一计划](<TRPG outputs/docs/unified-development-plan.md>) |
| `901-resource-authoring-kit/` | PHB／RE 来源、901 规则快照、资源正文、执行契约与 Python 检索／编译工具 | [工作约定](901-resource-authoring-kit/AGENTS.md)、[资源索引](901-resource-authoring-kit/resources/README.md)、[本库计划](901-resource-authoring-kit/development-plan.md) |
| `901-trpg-engine/` | 独立规则引擎、Game IR、SQLite、新 GM Host 与酒馆扩展 | [工作约定](901-trpg-engine/AGENTS.md)、[引擎说明](901-trpg-engine/README.zh-CN.md)、[GM 验收与缺口](901-trpg-engine/docs/gm/901-gm-acceptance.md) |

它们是同级 Git 仓库，不是一个 npm monorepo，也不是 Git submodule。跨库依赖按现有相对布局使用；独立资源撰写不要求其他仓库存在。

## 模块位置

下表路径相对工作区根目录。先定位负责该行为的模块，再按任务读取其 README、实现、相关测试与最新记录。

| 功能 | 已有位置 |
| --- | --- |
| 设定来源、原团提取正文 | `TRPG outputs/sources/`、`TRPG outputs/extracted-*/` |
| 世界总览、地理、文化、势力、人物导航 | `TRPG outputs/world/` |
| 世界／人物／剧情作者稿及采用记录 | `TRPG outputs/work/replay_research/`；既有作者基线在 `TRPG outputs/output/replay_f_review/v1/` |
| 六书编排、生成与加载验证 | `TRPG outputs/work/replay_research/six_books_20261023/` |
| 六书、角色卡、主持脚本、文风与运行交付 | `TRPG outputs/output/replay_tavern/`；各版本的状态分别核对，不把整个 output 当作当前安装 |
| 901 规则融合、兼容与未决项 | `TRPG outputs/work/rules_fusion/` |
| 人物新实例构筑／NPC 草案预览／资源授权适配 | `TRPG outputs/work/character_builder/`、`TRPG outputs/work/npc_draft_pipeline/`、`TRPG outputs/work/resource_adapter/` |
| 战役版检定、伤势、成长、资源、装备与施放 | `TRPG outputs/work/rules_engine/`；核心为 `core.mjs`，资源模块为 `resource-*.mjs` |
| 既有战斗／主持／MVU 状态适配 | `TRPG outputs/work/rules_engine/combat/`、`TRPG outputs/work/rules_engine/gm_runtime/`、`TRPG outputs/work/rules_engine/mvu_poc/` |
| PHB／RE 原文、原 HTML 与来源档案 | `901-resource-authoring-kit/content/`、`901-resource-authoring-kit/source_html/`、`901-resource-authoring-kit/source_archives/` |
| 资源编写规范、规则卡、预算和样板 | `901-resource-authoring-kit/authoring/`、`901-resource-authoring-kit/rules/` |
| 已整理能力、法术、装备及执行契约 | `901-resource-authoring-kit/resources/`、`901-resource-authoring-kit/resources/execution/` |
| 资源检索、检查与执行契约编译 | `901-resource-authoring-kit/tools/`；主要入口 `library.py`、`check_resources.py`、`compile_resources.py` |
| Game IR 归一化、审阅、技能迁移、目录编译 | `901-trpg-engine/tools/trpg-ir/src/` |
| 独立引擎规则计算 | `901-trpg-engine/tools/trpg-engine/src/` |
| SQLite 存档、事务、历史、分支、备份、本地服务 | `901-trpg-engine/tools/trpg-engine/node/` |
| 新 GM Host、行动解释、权限、知识、任务、NPC、幕后、摘要、叙事 | `901-trpg-engine/tools/trpg-engine/gm/` |
| 独立引擎人物页面／酒馆面板与桥接 | `901-trpg-engine/tools/trpg-engine/web/`、`901-trpg-engine/tools/trpg-engine/tavern/` |

## 开发前先核对复用

- 针对本次行为，用 `rg` 搜索上述已有模块、调用方及相关测试；说明将复用哪个入口、实际缺口是什么，再修改负责该行为的模块。不要因为新 Host 尚未接通，就认定底层机制不存在并另造执行器。
- 现有数据流为：来源／采用记录 → 作者资料与资源正文 → 六书或执行契约／编译目录 → 主持与规则执行 → 对应分支存档。来源收录、901 采用、人物取得、引擎支持、实际部署与验收分别核对。
- **两条运行链路并存：**战役库的酒馆 JS／MVU，与独立引擎库的 Node.js／SQLite／新 GM Host。离线合成测试通过不代表真实战役迁移、生产绑定或模型验收完成。
- **2026-11-07 已确认的整合方向：**暂停重复开发原生技能执行器。现有酒馆 JS 已有战斗转场／反应、伤害／电击／麻痹、冷却／支付、狂风循环、MVU 幂等／读回及按来源条款替换贡献。优先复用既有执行链，仅从旧人物分支抽离与版本绑定的技能条款，不整体换成后期人物模板。
- 雷鸣、斩岩、居合、狂岚的共享条款已在战役库原 `combat/thunder-technique.mjs` 读取，通过旧贡献机制替换；仍复用原执行器。资格/实际武器/合用池用可信绑定，不从模型动作取得。当前仅本地合成采用，未改正式技能持有或资源；真实采用与新Host其余动作另核。
- 单动作本地接线已在引擎库 `node/legacy-combat-backend.js`、`gm/legacy-combat.js` 接入原 host/service/tavern-bridge，复用旧雷鸣、斩岩、拔刀/收刀/普通攻击（居合）、狂岚群袭/龙卷、react及原 controller/panel；待选沿原队列、回执关联原声明。仅基础命令合成控制与隔离存档验收；真实绑定、任务／共创消费及其余附加声明仍待完成。
- 通用法术资源本地桥已复用旧runtime的登记方案/合法选项；原previewOutcome投影名称、目标和费用，Host接受有该投影的kitResource mechanism，旧JS/MVU继续唯一结算。反射法术保留原待攻击并独立确认；任意临时方案编写、真实取得/绑定及所有法术完备性不因此通过。
- 新 GM Host 已完成上述有界命令／待选／回执的合成本地映射；剩余是可信真实旧后端绑定、持久来源核验、其余动作与任务／共创的联合消费。按引擎库原执行计划与现有 TODO 推进，不把本地贯通当真实迁入。
- 旧分支仍以 **MVU 为唯一机械状态写入方**；桥接不能另建可写的 SQLite 人物副本或伪造原生执行回执。独立引擎自己的合成／原生分支继续使用各自 SQLite 存档，不能混作真实旧分支。
- 新增或移动模块、改变状态写入归属时，同步更新本导航和受影响仓库的入口；沿用既有计划与交接记录，不另建一套重复开发队列。普通文字修改只核对相关段落与链接，不启动代码或模型测试。

`archive/`、安装／文风备份、临时验收目录及 ZIP 用于追溯或恢复，不作新功能的默认实现源。正式战役目录是 `TRPG outputs/`；字面名称为 `TRPG%20outputs/` 的目录是另一条路径，不可混用。
