# Phase 3D-R2A 团录年代与覆盖重建设计

## 目标

Phase 3D-R2A 从原始团录出发，按来源顺序重建 Campaign 的事件、人物揭示、参与者及持续后果，用与既有人物中心审计相反的方向证明团录级覆盖完整性。

本阶段只创建证据、年代、覆盖、发现与拟议路由产物。它不修改 Phase 1–3D-R 冻结产物，不重写人物档案，不修改 Schema、Worldbook 或 `current_state.md`，不批准或应用补丁，不创建正式人物数据库，也不进入 Phase 3D-R2B 或 Phase 4。

## 已知来源范围

主团录的原始帖子来源为：

- Part 1：28 页，1,394 条帖子；
- Part 2：25 页，1,204 条帖子；
- Part 3：5 页，250 条帖子；
- Special Interlude：嵌在主团录中的特殊梦境材料；
- Campaign ending：Part 3 末段的原团结束点；
- Transition D0–D3：以 `current_state.md` 为权威锚点。

`posts.jsonl` / `posts.md` 是事件事实的主要证据。`posts.compact.*`、`scene-markers.jsonl`、既有 scene cards、event ledgers、Worldbook 与人物档案只用于导航、交叉检查和路由判断，不能代替原帖核验。

## 总体架构

采用“人工语义核验 + 确定性构建”的混合结构：

```text
原始帖子与参考资料
→ 确定性 source inventory / source chunks
→ 人工核验的事件、人物揭示与 disposition 决策
→ 双时间轴 chronology
→ 参与者与持续后果
→ 显式数据路由
→ 中文审核报告与覆盖指标
```

构建器只组合、排序和验证已经核验的结构化决定；不得从名字匹配直接生成 Canon 事实。自动发现可以提出候选，但不能自动把候选提升为事件、人物身份、alias、动机或世界事实。

## 双时间轴

每个事件同时保存两个互不替代的顺序轴。

### `story_axis`

表示事件在故事世界或 Campaign 叙事中的位置：

- `PRECAMPAIGN-*`：团前背景、古代史或先前经历；
- `P1-*`、`P2-*`、`P3-*`：三部主团；
- `INTERLUDE-*`：特殊幕间；
- `ENDING-*`：原团末点；
- `TRANSITION-D0` 至 `TRANSITION-D3`：最小过渡 Canon。

字段包含 `story_order_start`、可选 `story_order_end`、`temporal_scope` 和 `order_certainty`。背景在 Part 3 才被讲述时，仍可使用 `PRECAMPAIGN-*`，不能因揭示较晚而伪装成 Part 3 新发生的事件。

### `source_axis`

表示证据在团录中出现的位置。每个引用保存：

- `source_order`；
- `source_chunk_id`；
- `document`；
- `post_id`；
- 可选 `segment_index`；
- 精确行号或段落说明。

同一古代事件可以有一个较早的 `story_order`，同时拥有较晚的 `source_order`。构建器分别验证两套顺序，绝不以论坛时间戳充当世界内日期。

## Source-chunk coverage ledger

创建 `work/phase3d_r2/source_coverage/source_chunk_ledger.jsonl`。

最小稳定 chunk 是原始 `posts.jsonl` 的一条帖子记录。若一条长帖包含多个相互独立的事件或揭示，可用 `segment_index` 和段落/行号形成子 chunk，但父 post 仍必须完整结算。

每个 chunk 至少包含：

- `source_chunk_id`；
- Campaign part、页号、post ID、作者；
- `source_order`；
- 原始文件引用；
- `review_status`；
- 一个或多个 `dispositions`。

允许的 disposition 目标为：

- `EVENT`；
- `CHARACTER_REVELATION`；
- `BIOGRAPHICAL_BACKGROUND`；
- `WORLD_FACT`；
- `ROUTED_ELSEWHERE`；
- `SPECIAL_INTERLUDE_ONLY`；
- `SEEN_NOT_PROMOTED`。

`SEEN_NOT_PROMOTED` 必须带具体理由。通过状态禁止 `UNREVIEWED`、空 disposition 或“读过但无记录”的第五状态。一个 chunk 可关联多个目标，但必须解释多目标路由原因。

## 事件粒度规则

事件不是帖子摘要，也不按每个动作建立记录。

建立独立事件的条件至少满足一项：

- 产生持续身份、关系、能力、状态或知识变化；
- 构成重要选择、冲突、营救、背叛、联盟、死亡、失踪或权力转移；
- 揭示会持续影响角色扮演的背景、动机或关系立场；
- 改变 arc 的方向、地点、参与阵容或主要目标；
- 是理解后续事件所必需的因果节点。

相邻帖子在地点、主要参与者、目标和结果保持连续，并共同构成一个因果单元时可以合并为一个事件。只要 WHO、故事阶段、WHERE、主要目标或 RESULT 发生实质变化，就必须拆分事件或使用 parent/subevent 结构。事件不得仅因角色相同而合并。

规则性讨论、骰点噪声、重复描述和没有持续后果的微动作通常路由为 `SEEN_NOT_PROMOTED`，但其中出现的明确人物揭示仍需单独记录。

## Character revelation 独立字段

人物揭示不能埋在事件摘要中。每个事件包含独立的 `character_revelations` 数组；另生成扁平化的 `chronology/character_revelations.jsonl` 以覆盖没有达到事件粒度、但具有持续人物价值的场景。

每条 revelation 至少包含：

- `revelation_id`；
- `character_ref` 或尚待确认的 `character_label`；
- `revelation_types`：personality、value、motive、hatred、affection、loyalty、fear、obsession、desire、decision_pattern、relationship_stance、knowledge、misconception、secrecy、ability、status、identity、background、trauma、obligation；
- 精确陈述；
- `evidence_status` 与 attribution；
- `temporal_scope`；
- source chunk 引用；
- routing decisions。

单次行为不得自动升级为稳定人格。可能未来中的行为不得当成已发生事件，但若原文明确用该未来影像揭示角色当前仇恨、执念或动机，可把“当前动机”与“未来可能性”拆成不同记录。

## 参与者与角色后果

事件参与者使用带角色类型的对象，而不是裸名称数组。允许角色类型包括：

`actor`、`target`、`witness`、`participant`、`rescuer`、`rescued`、`commander`、`information_source`、`recipient`、`absent_but_affected`、`background_actor`。

每个事件分别保存：

- objective results；
- character-specific consequences；
- relationship consequences；
- ability/status consequences；
- knowledge consequences；
- unresolved questions。

参与事件不等于知道事件全貌。所有 belief、theory、rumor、vision 和第三方 testimony 均保留 attribution。

## Canon identity 与 runtime trigger 解耦

R2A 只判断 Canon 身份和资料路由，不设计运行时 trigger。

- 名字短、常见或歧义大不能成为拒绝 Canon entity 的理由；
- 不生成 SillyTavern keys、自动触发词或 runtime activation policy；
- 如需记录未来检索风险，只能写成 `runtime_trigger_deferred: true`，且不得影响 Canon 结论；
- “杨”若被原帖证实为独立角色，创建独立 character discovery、候选实体及 `draft` patch；裸字触发策略留给后续 Runtime Projection 阶段。

## Part 1 retention gate

Part 1 必须独立通过，而不是被全局指标平均掉。

`reports/early_arc_character_retention.md` 枚举所有在 Part 1 中具有材料意义的角色，并分类为：

- `CONTINUES_ACTIVE_LATER`；
- `OCCASIONAL_LATER`；
- `FADES_FROM_MAIN_PLOT`；
- `DECEASED_OR_EXITED`；
- `ONE_OR_FEW_SCENES_BUT_DURABLE_IMPACT`。

每名角色必须记录身份、Part 1 重要事件、与御临风的关系、持续影响、Worldbook/Profile 表示状态和是否需要新候选。Part 1 gate 通过条件为：

- 所有 Part 1 重大事件参与者均出现在 retention 表；
- 所有 revelation 中的人物均有 retention 或明确非角色路由；
- 高风险三类不存在未解释遗漏；
- Canon 身份不因 trigger suitability 被拒绝；
- 所有待确认身份均进入 `unresolved_identity_aliases.md`，并明确是否构成阻断。

## 路由模型

每个 material item 必须路由到一个或多个目标：

- `WORLDBOOK`；
- `CHARACTER_BACKGROUND`；
- `CHARACTER_TIMELINE`；
- `RELATIONSHIP_TIMELINE`；
- `KNOWLEDGE_TIMELINE`；
- `ABILITY_STATUS_TIMELINE`；
- `CURRENT_STATE`；
- `SPECIAL_INTERLUDE`；
- `SEEN_NOT_PROMOTED`。

多目标路由必须分别给出理由。路由是候选建议，不是 Canon 批准或数据库写入。

## 输出结构

新增：

```text
scripts/build_phase3d_r2.py
tests/test_phase3d_r2.py
work/phase3d_r2/
    preflight_manifest.json
    reviewed_inputs/
    chronology/
        campaign_chronology.jsonl
        campaign_chronology.md
        character_revelations.jsonl
    event_audits/
    character_discoveries/
    patches/
    source_coverage/
        source_inventory.json
        source_chunk_ledger.jsonl
        part1_coverage.md
        part2_coverage.md
        part3_coverage.md
        special_interlude_coverage.md
        transition_coverage.md
    reports/
        early_arc_character_retention.md
        chronology_coverage_report.md
        chronology_coverage_metrics.json
        deathwing_background_audit.md
        cassandra_motivation_audit.md
        yang_character_audit.md
        dragon_sanctuary_finale_audit.md
        unresolved_identity_aliases.md
        r2a_review.md
```

所有人类阅读的 Markdown 以简体中文为主；ID、字段名、枚举和代码术语保留英文。

## 必审专项

### Deathwing

分别记录世界事实、龙族 testimony、奥希拉归因陈述、白魔理论和未决项。预言、祝福之子、黑龙血脉诅咒、古代龙史、古神影响与异常不死性不得互相自动证明。

### Cassandra

将可能未来影像与当前动机拆分。未来中反复攻击白魔、投入深渊等画面只能作为 possible future；原文直接描述的当前仇恨、复仇驱动或病态执念可以成为当前 character revelation。

### 杨

核验其自我介绍、史莱姆身份、边境与斩首分析、龙族介入判断、与御临风的合作/尊重及后续分析角色。证实后建立 Canon candidate 和独立 `draft` patch；不生成 runtime trigger。

### 龙族秘境终局

重建死亡之翼战后御临风与安兹返回秘境的顺序，核验在场龙王、受制状态、白魔行动、笛剑、屏障/束缚、魔宝石被取走前后的相对次序。“瑟西斯”“凯多”只作搜索词，未经来源确认不得建 alias。

## 构建与保护

构建器采用稳定排序与 atomic write。首次预检记录 Phase 1–3D-R 冻结文件的 SHA-256；后续构建先验证冻结哈希，再写 R2A 目录。不得修改冻结 baseline 来掩盖差异。

通过前执行两次独立构建，所有生成文件必须 0 byte differences。测试同时确认没有创建正式人物数据库、没有改变 patch approval、没有进入 R2B/Phase 4。

## 完成状态

只有以下条件全部满足才能输出：

```text
STATUS:
R2A_CHRONOLOGY_READY_FOR_SCHEMA_REVISION
```

- 三部主团、Special Interlude、ending 与 Transition 有明确覆盖；
- source chunk ledger 没有未审或空 disposition；
- Part 1 retention gate 通过；
- 双时间轴和事件粒度验证通过；
- Deathwing、Cassandra、杨、龙族秘境终局专项审计完成；
- 没有因 runtime trigger 风险拒绝 Canon identity；
- 冻结 Phase 1–3D-R 哈希全部一致。

若来源缺失、身份冲突、Schema 冲突或需要新的人工 Canon 决策，则输出 `R2A_BLOCKED` 并列出精确阻断项，不得自行裁决。
