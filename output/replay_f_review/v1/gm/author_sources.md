# 主持机制的依据与设计归属

本轮编写的是运行规则提案，未新增原团正典。已核对[酒馆原生功能分工](sillytavern_mapping.md)，优先复用Persona、世界书、聊天分支与摘要。程序式步骤、字段名和存档约定属于F3设计；其中使用的世界事实、人物关系和开局条件来自以下既有材料。

| 用途 | 来源 |
|---|---|
| 本轮F3授权及原生功能核对要求 | [用户澄清014](../../../../work/replay_research/user_clarifications.md:299) |
| 整体顺序与F3任务 | [原规划](../../../../docs/superpowers/specs/2026-10-02-yulinfeng-tavern-replay-plan.md:307) |
| 单主持、条件推进与短状态的早期设计 | [既有运行设计](../../../../docs/superpowers/specs/2026-10-02-tavern-story-runtime-design.md:1) |
| 玩家决定主动选择，主持处理外部后果 | [PC控制边界](../../../../docs/pc_control_boundary.md:1) |
| 相关人物片段、人物知识归属与投影范围 | [人物运行投影约定](../../../../docs/profile_runtime_projection_contract.md:1) |
| 首次入都三人、交通、资源缺口、时期与报信对象 | [开局整合](../../../../work/replay_research/opening_state_consolidated.md:1)及[逐项依据](../../../../work/replay_research/opening_state_consolidated.jsonl:1) |
| 既定历史、独立行动、成长选择 | [用户因果原则](../../../../work/replay_research/user_clarifications.md:42)及[成长边界](../../../../work/replay_research/user_clarifications.md:70) |
| 双潮、白魔在T0前脱逃、悠悠责任、黄泉疲劳、布莱特终局排除 | [本轮用户更正](../../../../work/replay_research/user_clarifications.md:243) |
| 人物声线、职责与行为 | [F2人物索引](../characters/index.md)及[帝国人物研究](../../../../work/replay_research/empire_character_dossiers.md:1) |
| 事件前提、消息与成果依赖 | [26组事件入口](../../../../work/replay_research/event_causality_overview.md:1) |
| 转述、相信、研究与通信不能直接视为真相或成果 | [知情与传播资料](../../../../work/replay_research/knowledge_projection.md:1) |

用户已经授权推进F3：交付主持推演规则、每轮流程和状态记录方案，附简短示例。F1/F2未因此被整版批准，F4的酒馆格式、加载配置与接入实现仍后置。所有演示结果均标明假设，不写入真实分支。

原项目投影约定要求正式人物与知识档案修改经过审阅；本稿将“日常游玩中的分支状态”单独保存。角色听见一句话可以立即成为保留聊天中的新知情，不必为每次对话修改正式人物档案；只有将该变化提升为长期作者资料时，才审阅相应条目。

这一方案通过只提供当前相关资料降低混淆和提前泄露的机会。同一模型同时持有主持秘密与人物资料时，人物之间的知情区分是运行约束，不构成技术上的严格隔离；尚未进行导入或模型效果验证。
