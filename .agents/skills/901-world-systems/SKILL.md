---
name: 901-world-systems
description: 完善或审查901大陆与地区的社会运行：日常生活、经济利益、生产贸易、政治法律、文化习俗、地理交通及相互作用。Use when a GM needs playable regional rules, ordinary-life examples, faction/resource incentives, or disruption tests. Do not use for macroeconomic simulators, invented statistics, combat math, NPC character-sheet production, or plot writing.
---

# 901 — 大陆社会逻辑与地区差异

**目标**：用最低充分的设定，让单一 GM 能合理呈现日常生活、利益冲突及行动后果。**不建设**人口/GDP/货物流量的完整自动模拟。起始世界资料已完成，此 Skill 是扩写与审查工具，不重新提炼 A 阶段。

## 适用范围
- `generic_rule`：整理一个跨地区常见的制度或因果关系（如雇佣、交换、旅行、传讯）。
- `region_extension`：为已有地区补充社会实践、经济来源、政治限制和文化差异。
- `stress_test`：检查已经编写的社会逻辑是否能承受普通生活与扰动的考验。
- **不负责**独立编写政治阴谋、重要 NPC 个人传记、批量生成人物/机械数值、决定新正史、酒馆打包。对应移交 `901-story-factory`、未来 Builder、`901-canon-review`、上游 `tavern-cards`。

## 执行流程
1. **定位资料**：读取真实仓库 `AGENTS.md`、项目状态、已批准 Canon 索引和目标地区资料。识别原始资料、推断和新增候选；不编造路径、来源、历史、精确数值。资料不足时限制为可验证的结构化建议，并标 `needs_sources`。
2. **聚焦需求**：选一种模式，说明当前社会设定要支持的玩家行为或 NPC 决策，例如“在帝都找工作”“商路阻断会影响谁”。只处理能影响游戏体验的部分。
3. **列出最小因果链**：`参与者/机构 → 需求与利益 → 可用资源/制度与限制 → 可采取的行为 → 玩家可感知的结果`。每条链说明已知事实与新假设的分界，记录 `basis_status`（`confirmed` / `inferred` / `proposed`）与 `basis_refs`（实际出处或本包内部前提条目 ID；原创假设须明确标识）。方法见 [最小因果模型](references/causal-model.md)。
4. **补日常行为**：回答普通人如何谋生、交易、移动、处理纠纷、遵守习俗；体现地区差异。允许平凡场景，不强制剧情化、秘密化和危机升级。
5. **做两项检验**：
   - `ordinary_day`：从真实地点/职业/机构中挑一个普通日子，能否产生可信生活与普通委托？
   - `disruption`：测试一项具体扰动（如商路三天封闭），哪些人知道、谁有能力行动、短期/中期可能怎样变化？不为缺失数值编造价格涨幅。
6. **查冲突与停止条件**：既有 Canon 优先；对新增重大制度/地理/战力事实交 `901-canon-review`。若日常与扰动均能被合理处理、没有未解释的关键约束，则标 `ready_for_review` 并停止扩写。详见 [完成与交接](references/done-and-handoff.md)。
7. **生成可用成果**：按 [地区条目模板](assets/region-packet.yaml) 或 [通用规则模板](assets/generic-rule-packet.yaml) 输出草案；保留来源、未知项、因果规则和测试结果。`stress_test` 复用被测对象对应的模板，将 `mode` 改为 `stress_test`，用原有 `region_id` / `rule_id` 指明对象，记录 `ordinary_day`、`disruption`、缺口和审查结论；除非明确获准扩写，`proposed_rules` / `proposals` 保持空列表，不借测试创作新设定。默认写候选目录，不覆盖批准文件。

## 完成判据
- GM 能用少量条目回答“谁在做什么、为什么、受何限制、出了变化有什么后果”。
- 普通日常与一个合理扰动都成立，包含信息传播/行动时间的限制。
- 同一地区的描述可以支持多种平凡生活，而非反复生成固定任务或世界级阴谋。
- 没有为了完备性而发明逐日宏观经济、精确人口、全大陆价格表或无需求的官员名册。
- 每一条新增设定都标注 `confirmed` / `inferred` / `proposed`；重要新设定在审查前保持草案。
