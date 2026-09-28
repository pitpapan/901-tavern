# 内容路由指南

本指南用于推荐新增信息应该进入哪个 authoring 层。路由结果不是 Canon 审批，也不能直接修改任何数据库。机器可读对应规则位于 `config/content_routing_rules.json`。

## 首要顺序

先问“这是否已经实际发生”，再问“它属于哪个数据库”。如果是未来可能性，立即进入 Director Material；如果是续跑中已发生的事情，先进入 Continuation Event。

## 决策表

| 判断问题 | 是 | 下一步 |
|---|---|---|
| 这是以后可能发生的事情吗？ | Director Material | 不得进入 Canon；实际发生后先写 Continuation Event |
| 这是续跑中已经实际发生的事情吗？ | Continuation Event | 确认后再分析 Worldbook/Profile/State 等目标 |
| 这是世界中的客观、持久事实吗？ | Worldbook candidate | 先写 Supplement，再经 Patch 与人工批准 |
| 这是 NPC 的人格、价值观、语言风格、决策习惯、私人目标或主观关系吗？ | NPC Profiles | 使用 `npc_profile.schema.json`；不得塞入 Worldbook |
| 这是 PC 已声明的目标、已获得的知识、客观当前状态或已建立关系吗？ | PC Continuity | 使用 `pc_continuity_profile.schema.json`；不得扩张 AI 对 PC 的控制权 |
| 这是对 PC 未来行动、台词、思想、情绪或决定的预测吗？ | Forbidden / Director（若只是未来可能性） | 不得写入 PC Continuity，也不得当作 Canon |
| 这是规则机制吗？ | Rules candidate | 进入 rules supplement；等待正式 Rules database |
| 这是当前时间点状态吗？ | Current State candidate | 先确定其来源，再通过 patch 更新 snapshot |
| 这件事客观真实，但玩家或部分 NPC 不知道吗？ | 对应 Canon domain + visibility | 使用 restricted/secret 与 knowledge partition |
| 这是某个角色认为或怀疑为真吗？ | belief / suspicion / rumor | 保留归因，不升级为客观事实 |

## 各目标的准入内容

### Worldbook

适合：持久世界事实、实体身份、客观关系、重要历史、确认能力边界、对现在仍有意义的重大事件结果。

不适合：完整人格提示、台词风格、规则数值、纯当前状态、未来剧情设想。

### NPC Profiles

适合：人格、价值观、语言风格、决策习惯、私人目标、主观关系、RP fidelity 要求。

正式 schema 为 `schema/npc_profile.schema.json`。每条实质性 claim 必须有 evidence mode、origin 和 sources。Profile depth 表示角色实际活跃时所需的 RP fidelity，即使现有证据仍稀疏；证据缺口必须保留，不得用推测补齐。它不表示未来重要性；activation policy 不保证角色出场。

### PC Continuity

适合：PC 已建立的身份与历史、客观关系、已获得的知识、玩家声明或续跑确认的目标、客观当前状态和 provenance。

不适合：自动生成 PC 台词、主动行动、私密思想、情绪、决定或新目标。正式 schema 为 `schema/pc_continuity_profile.schema.json`，其固定权限边界不能由单个 patch 放宽。

### Rules

适合：判定机制、资源机制、设定机制、可重复适用的规则说明。

规则叙述与世界事实同时存在时应拆分：事实去 Worldbook，机制去 Rules。

### Current State

适合：当前位置、当前存活/受伤状态、正在生效的关系或约束、当前任务和近期运行锚点。

`current_state.md` 是 snapshot，不是 Session 历史数据库。

### Continuation

适合：实际发生的战斗、关系改变、知识获得、状态变化、地点变化、势力变化、角色状态变化、物品变化、目标变化和揭示。

只有 confirmed event 可以成为 patch source。

### Director

适合：plot seed、faction agenda、mystery、possible development、open question 和 hypothetical truth。

Director 内容不得进入普通 Worldbook retrieval、NPC knowledge 或旁白确认层。

## 多目标内容

一个输入可能影响多个目标，但不能因此跳过路由。先保存一个 source 对象，再生成多个、各自可审核的 patch。例如一次 confirmed continuation event 可能分别产生：

- Worldbook 历史更新；
- NPC Profile 关系变化；
- PC Continuity 中已确认的关系或知识变化；
- Current State 当前状态；
- Rules 无变化。

每个 patch 必须明确 target database、target ID 和自身影响分析。

## 可见性不是路由目标

`public`、`restricted`、`secret` 描述谁能知道一个真实事实，不决定事实属于 Worldbook、Profile、Rules 还是 State。秘密仍按事实领域路由，并附加 knowledge partition。

Character belief、suspicion、rumor 和 Director hypothesis 不是“秘密事实”的同义词。

PC belief/suspicion 只能作为带 attribution 的 continuity item；它们不能升级为世界事实，也不能被用来预测下一次选择。

## Router 权限

Router 只能输出推荐目标和理由。它不能：

- 改变 source status；
- 生成 approval；
- 应用 patch；
- 修改 Canon；
- 把不确定内容升级为事实。
