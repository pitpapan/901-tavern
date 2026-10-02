# R1C 人物语义链重构计划

状态：R1C-1 执行设计（仅依据核实、契约、抽样和端到端试点）  
上游结论：R1C-0 建议从 `SOURCE_EXTRACTION` 重新建立语义层  
本阶段成功终点：`READY_FOR_FULL_SOURCE_REVIEW`

## 1. 目标与边界

R1C 保留已有原始抽取、稳定帖子 ID、来源顺序和可复用的通用工程工具，但不再把旧 source ledger 的语义路由、R2A 事件摘要、R2C 人物投影或中文审批稿当作新事实依据。新链路从原帖和可定位 source chunk 开始，经人工语义审阅形成原子事实，再分别派生 chronology 视图与人物专属事实视图。

R1C-1 只证明这套方法值得进入全量来源审阅。它不全量重建语料，不替换 140-file R2C production，不修改 488 项冻结输入、旧 authority、Canon、Worldbook、Current State 或生产 schema，不批准人物，也不进入 Phase 4。

## 2. 续作与历史保留

- `docs/remediation/R1C_0_SEMANTIC_TRUST_AUDIT.md`、旧 matrix、旧 golden 和旧生成器原样保留，作为诊断历史与待核实目录。
- 新评价数据写入 `work/rebuild/r1c_vnext/`；它不会覆盖 `work/remediation/r1c0/`。
- R1C-0 生成器的固定结论不能进入新验证器。新验证器只接受可解析的 source/post/span、独立保存的审阅记录和本文件冻结的结构约束。
- 任帆真、周正不进入本轮主世界人物输出；沐透档案冻结。原帖中的引用仍可保留。
- 特殊梦境与主世界分离；只有来源明确结算且经认可的奖励可以建立主世界承接事实。
- 御临风只记录来源中已经写出的历史言行、知识或内心内容；不得生成未来选择、未来行为、新私密思想或永久承诺。

## 3. 可定位评价记录

`evaluation_cases.jsonl` 把 29 个历史案例改造成可检查断言。每条记录至少含：

- 历史 case/regression ID 与本轮 assertion ID；
- 真实文件、稳定 post ID、source chunk、字符 span、短引文及文件/帖子 SHA-256；
- 已阅读的上下文窗口；
- `prefilled_diagnosis`（历史诊断，不作事实 oracle）；
- `source_verification`（本轮是否回看原文）；
- `direct_support`、`interpretive_summary`、`must_preserve`、`must_not_assert`；
- 预期 chronology/character/readable 断言和未决点。

验证状态与故事真值分开。例如“奥希拉确实说过一段传说”可以是已核实来源事实，但传说内容仍是带说话者归属的证言，不能因此变成客观古史。

五个 `R2C_RELEVANCE_*` 案例是投影契约测试：记录造成污染的实际生产对象、它复制的具体摘要、真实 source/post/span 以及该人物在场景中的准确角色。它们不再使用“registered source chunks”之类占位字符串。

## 4. 最小原子事实契约

### 4.1 SourceLocator

`source_path`、`post_id`、`source_chunk_id`、`span_start`、`span_end`、`quote`、`post_sha256` 和 `file_sha256`。验证器从原始 JSONL 重新定位帖子，校验字符切片、短引文和 hash。旧语义路由不参与该校验。

### 4.2 AtomicFact

核心字段只有 `fact_id`、`revision`、`proposition_type`、`statement`、`subject_refs`、`reality_scope`、`narrative_modality`、`evidence_nature`、`polarity`、`source_locators`。复杂事实按需增加：

- 参与角色：`actor_refs`、`speaker_refs`、`addressee_refs`、`observer_refs`；
- 时间：`story_time`、`utterance_time`、`knowledge_time`；
- 状态：`valid_from`、`valid_until`、`last_confirmed_at`、`persistence`；
- 限制：`conditions`、`quantifiers`、`uncertainty_note`；
- 图关系：`supports`、`refutes`、`revises`、`supersedes`、`identity_links`。

这些维度互不替代。`SPECIAL_INTERLUDE` 是现实范围，不是叙述模态；`PLAN` 是模态，不是证据性质；`HEARSAY` 是证据性质，不自动决定命题真假；`NOT_STATED` 只表示已检查场景没有明确写出该命题。

### 4.3 SourceDisposition

每个被审阅的来源语义单元必须标为 `KEEP`、`MERGE`、`DUPLICATE`、`NON_CONTINUITY`、`ISOLATED_WORLD` 或 `UNRESOLVED`，并保存理由。形式处置完成不等于语义完整；独立复核还必须从整段原文反向寻找漏抽事实。

## 5. 双投影接口

同一组审定 `AtomicFact` 分别派生：

1. `ChronologyView`：按故事时间组织实际发生、被陈述、计划或可能未来；保留模态和归属。
2. `CharacterFactView`：只有事实显式说明该人物的角色时才进入人物视图，并记录 `projection_role`（本人行动、被描述历史、关系证据、知识、状态、背景语境等）。

人物投影不得读取 event summary 文本，也不得因宽事件共现而复制全场后果。少量语境必须引用单独获准的 context fact，不能冒充人物经历。

## 6. 父容器与中文层

试点使用隔离的 vNext 父容器：完整人物候选含人物事实、chronology refs、完整关系对象、状态/知识边界和来源。关系对象允许 `baseline = null`，但此时必须明确 `baseline_status = NOT_ESTABLISHED`；有一次互动证据不能为了满足旧 schema 编造持续关系。生产 schema 保持不变，vNext 到旧格式只记录兼容性结果，不执行迁移。

中文样页是审定事实的可读投影。正文按身份、个人经历、关系和最后确认状态组织；技术 ID 放附录。每个句子在 sidecar 中映射到 fact ID。不得用整段 event summary、他人剧情或模板化审计术语填充。

## 7. 抽样与隔离

- 已知回归集：29 个历史 case 及其必要连续上下文。
- 开发集：从全部 2,848 个 source-chunk 元数据对应的真实帖子总体中，排除已知 case 的场景组后，按 campaign part、来源前中后段、作者、长度和多主题特征分层，确定性抽取 24 个连续窗口。
- 留出集：用同一预声明规则从剩余互不相邻场景组抽取 24 个窗口。开发与留出不得共享帖子、相邻延续或重复副本。

`sampling_manifest.json` 保存 seed、总体 hash、候选总体、分层规则、窗口、上下文扩展、排除和交叠检查。24+24 是试点预算，不是全量正确性保证。

当前没有独立 agent/session 隔离，因此抽取者 A 与复核者 B 的工作以分文件、分步骤保存，但诚实标记为 `sequential_review`。复核记录先列“从原文应保留的信息”，再比对 A 输出；不得称为盲审。

## 8. 端到端试点

试点至少覆盖命运支流、嵌套证言、hub-event 多人物反应、状态有效期、梦境隔离和一个普通控制场景，并实际生成：

`原帖 → extraction → reviewer inventory → adjudicated facts → chronology/character views → complete relationships/profile candidates → Chinese sample + sentence map`

所有父容器均整体校验。若旧生产 schema 无法不失真地表达 `baseline = null`，只在 vNext 隔离 schema 中记录差异，不改生产 schema。

## 9. 独立核验与错误注入

生成器和验证器不共享语义 expected-inventory 函数；只共享通用 JSON/hash 读取。验证器双向检查：

- 每个输出对象必须有审定 fact/明确授权；
- 每个要求投影的 fact 必须有目标；
- 每个 source locator 可解析且 hash/span 匹配；
- 每个人物后果具有准确角色，不以事件共现替代；
- reality/time/modality/evidence/polarity/validity 在投影中保持。

变异测试必须检出：悬空 destination、错误主体、偏好升级为决定、预测升级为事实、证言去归属、说话者与主体互换、第二主题/关键反应漏抽、治疗计划升级为完成、历史状态延续到 D3、梦境污染、疑问/否定/条件升级为肯定，以及伪造 locator/golden 自证。

机械错误由程序拒绝；需要理解原文的语义错误由冻结断言与独立复核拒绝。报告不得宣称 schema 自动理解了语义。

## 10. 决定性与保护

人工/模型审阅自然语言本身不要求可重复生成。审定后的 JSONL 到索引、结构化试点、样页装配和报告统计必须两次 byte-identical。保护门在构建前后重算 140-file production 指纹与 488 项 frozen manifest；任何变化均停止。

## 11. R1C-1 关卡

- Gate A：29 个案例均有真实证据或明确 `NOT_VERIFIED`；契约能表达已见语义。
- Gate B：开发与留出分别报告首次错误、遗漏、强化、未知和修订次数；未解决的抽取错误为零。
- Gate C：完整父容器、人物相关性、中文输出与 sentence map 一致。
- Gate D：生产/冻结输入未变，变异测试通过，审定数据的两次派生构建 byte-identical。

只有四门均通过才返回 `R1C-1 PASS`，其含义仅是 `READY_FOR_FULL_SOURCE_REVIEW`。R1C-2 至 R1C-4 在本任务中不执行。

