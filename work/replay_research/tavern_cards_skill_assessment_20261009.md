# tavern-cards 对901项目的适用性评估

评估日期：2026-10-09（Europe/Paris）。用户指定仓库：[ai4rpg/tavern-cards](https://github.com/ai4rpg/tavern-cards)。本次通过GitHub API确认main为 **e28fb561f114a4c0636921878c245e5fc181bf33**，提交日期2026-09-18；以下引用固定在该版本。范围为技能与关键代码路径的只读审阅，并与本地004导出字段、SillyTavern 1.19.0加载代码对照。未安装技能、未执行第三方代码、未迁移或实跑酒馆。

**结论：对作者工作的方法整理和未来状态维护有用，当前不宜整套接管901项目，更不能直接替换004打包链。**本评估不是采用其叙事规则、启动难度引擎或恢复文风复跑的授权。

## 组成与收益

| 部分 | 实际提供什么 | 对901的判断 |
|---|---|---|
| tavern-design | 材料转化、角色／世界讨论、叙事设计与设计文档 | 借鉴原文提取、引用核验、人物原句及上下文。保留901自己的来源、时期、不确定性和分支结构，不迁成另一套故事大纲 |
| tavern-cards | 条目创作与检查、目录工程、配置、卡与独立世界书导出 | 去重、压缩及运行条目独立可读等检查有用；现有人工审阅与导出链已覆盖不少功能，整体迁移收益有限 |
| MVU／EJS | Schema与初值、变量更新规则、状态约束、条件投放 | 未来可服务地点、同场人物、已发生事件与已获知信息；状态正确性和更新权限必须另外控制 |
| tavern-ui | Tavern-Helper下的消息状态栏、表单与前端构建 | 可作为后期显示层，当前非必需；可选无UI／纯文本／前端形式，复杂界面不先于可靠状态 |

来源：[总览](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/README.md)、[核心技能](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/SKILL.md)、[转化流程](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-design/references/conversion.md)、[人物原句结构](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-design/references/conversion/outline-spec.md)。这是一组给创作代理使用的技能与工具，不是只导入酒馆就自动改善主持判断的运行补丁。

## 已核对的打包兼容问题

以下均为静态代码对照结论，未以我们的文件实际执行unpack或pack。

1. **关键词激活误分类。**004启用条目为6常驻、116关键词，另8禁用；130条selective均false。ST的selective用于次要关键词逻辑，主关键词仍正常工作。forge导入却仅在selective为真且constant为假时识别关键词策略，其余默认常驻；再导出会使116条变为常驻。参见[导入分支](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/scripts/tavern-cards-forge.mjs#L149023-L149028)、[输出分支](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/scripts/tavern-cards-forge.mjs#L144691-L144704)。
2. **标识和来源不能无损保留。**pack按序重编UID；004的稳定大整数UID与每条extensions.901_replay来源信息没有对应透传。参见[输出字段](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/scripts/tavern-cards-forge.mjs#L144691-L144745)。
3. **配置和格式会发生额外变化。**部分显式加载值转为默认／全局继承；嵌入书元数据未完整保留，整卡改输出V3；configure还会重排order。参见[卡与嵌入书构建](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/scripts/tavern-cards-forge.mjs#L144635-L144681)、[顺序分配](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/scripts/tavern-cards-forge.mjs#L152899-L152925)。V3不等于必然不能导入，但已超出004验证过的V2路径。

本地对照：[004核验记录](runtime_sync_20261008/verification.json)、[当前独立世界书](../../output/replay_tavern/world_sync_20261008_candidate/import/901_帝都重玩_M1_20261008.json)、[本地ST次要关键词判断](D:/github/sillyTavern/public/scripts/world-info.js:4925)。本次仅统计实际字段并读代码，不改变运行状态。

工具确实支持独立世界书，不能说它只会做角色卡；split与完整工程unpack／pack也不是同一路径。当前判断专指把901包交给完整工程流程作无损往返不成立，并非所有命令均不可参考。

## 内容工作流的适配边界

- **有忠实提取机制，也有创作机制。**转化流程要求引用与语义核验，值得借鉴；设计指南中的人物弧光、关系方向、阶段揭示和关键事件安排则不能原样用于重玩。应转为已有关系、T0知识和条件性因果，原团未来仍开放。[设计指南](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-design/references/design-guide.md)
- **它的规划不是我们的事实权威。**核心技能将创作规划作为项目级事实入口；901继续以原团、设定／人物参考、用户确认、时期及分支为依据。其大纲不能替代逐事实确定性与知情范围。[核心技能](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/SKILL.md)、[大纲结构](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-design/references/conversion/outline-spec.md)
- **语言检查只能选择性使用。**禁模糊词、要求关键名称具体化等规则，不适合直接清洗证言、未具名组织或存疑线索。原文中的保留语和未知不能为了文风被补成事实。具体行为与原句可用于人物表现参考，不能无来源造例子填满模板。[写作规则](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/rules.md)、[检查规则](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/rules-check.md)
- **不重启既有创作与审核。**当前已有工作树、来源库、运行候选和手动步骤，宽泛触发后新建规划／解包工程会增加重复维护。修改文档自身也允许局部编辑和保留旧风格，故可裁剪；无需因使用工具强制重写全部条目。[已有卡修改](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/modify-existing.md)

## MVU与EJS能解决什么

MVU可记录结构化状态并检查字段类型、取值范围等；自然语言更新规则仍需要模型或外部逻辑据事件执行。它不因此具备可信的先手、距离、命中、时间与代价裁定，也不能证明一次变量变化确实发生。我们的难度引擎继续后置。[MVU流程](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/mvu/guide.md)、[更新规则](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/mvu/update-rules-guide.md)

EJS可依变量选择条目或段落，适合过滤当前场景相关内容。但作者秘密、NPC知情、rumor与confirmed仍须明确建模，错误状态会导致错误资料投放；不能用原线章节进度自动安排未来。[EJS指南](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/ejs/guide.md)

该工具工作流将MVU/EJS限制在角色卡形式，与独立世界书项目区分；这不是ST本体的普遍限制。若以后采用，需要另安排主持卡／脚本承载及状态迁移，不能仅替换004独立世界书就获得这些能力。[项目设置](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/references/project-setup.md)

UI支持CDN、自托管和内联，公开发布并非必要条件；运行依赖Tavern-Helper，默认MVU资产还有外部脚本引用。显示、状态更新与裁定分开设计，优先考虑无UI或只读状态表。[UI技能](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-ui/SKILL.md)、[默认MVU补丁](https://github.com/ai4rpg/tavern-cards/blob/e28fb561f114a4c0636921878c245e5fc181bf33/tavern-cards/assets/mvu-patch.json)

## 推荐处理

1. 现在作为方法与技术参考，保留现有作者库、UID、导出及ST原生校验。可在以后必要修改时借鉴小范围证据语料、去重和条目独立可读检查，不另做文风复跑。
2. 到既定状态／引擎阶段，再单独评估最小MVU＋EJS方案，明确谁可以改哪些状态、依据和撤销方式；不把变量系统视为已完成难度裁定。
3. 若将来确需采用forge，先修复关键词策略识别、稳定ID和未知扩展保留，再在隔离副本做一次无修改往返差异检查。该项只是后续条件，本次未实施。

仓库README声明个人使用、修改注明出处；如后来摘用或改造其技能，应保留来源说明。本次仅评估，没有安装、复制到技能目录、运行第三方脚本、创建新项目或改变004包。作者世界设定仍截至UCL_20261008_012，本报告不新增世界事实。
