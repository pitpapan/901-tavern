# Canon 增量更新协议

## 1. 目的与边界

本协议定义 Phase 2.7 之后的长期创作、续跑记录和 Canon 增量更新流程。它不增加任何 Campaign 事实，也不授权工具自动修改正式数据库。

唯一允许的数据流是：

```text
Source / Authoring Input
        ↓
Review
        ↓
Canon Patch
        ↓
Human Approval
        ↓
Canonical Database
        ↓
Derived Runtime Artifacts
```

Authorial Supplement、Continuation Event 和 Director Item 都不是正式 Worldbook 条目。任何 Canon 变更必须先成为 Canon Patch；任何 patch 在 `applied` 之前都不得改变正式数据库。

Phase 2.7 不执行 patch，不重建 `current_state.md`，不修改 `schema/worldbook_entry.schema.json`，不创建 NPC Profile、Character Card、GM Card 或 SillyTavern export。

## 2. 信息来源的四类边界

### 2.1 Original / Historical Sources

原帖、原设定集、原人物卡、战报导航和原 Campaign 事件属于历史来源。它们继续保留在原位置，Phase 2.7 不迁移、不重写。引用时必须保留精确 provenance，并按照事实字段选择适当来源权威。

### 2.2 Authorial Supplement

用户后来主动补充、并希望可能成为世界真实设定的信息。Supplement 只是待审 source：

```text
supplement → review → patch → human approval → canonical target
```

它可以面向 `worldbook`、未来的 `npc_profiles`、未来的 `rules`、`current_state` 或多个目标，但不能直接写入任何目标数据库。

### 2.3 Continuation Record

真实续跑中已经发生的事件先写成 Continuation Event。只有 `canon_status=confirmed` 的 event 才能成为 patch 来源。记录事件不等于自动更新 Worldbook、NPC Profile 或 Current State。

### 2.4 Director Material

剧情种子、势力计划、谜团、开放问题和可能发展属于假设空间。它们不是事实、不是角色知识，也不是被保证会发生的未来。

Director Item 只有在未来实际发生、被写入 Continuation Event 且确认为 `confirmed` 后，才能间接成为 Canon Patch 的来源。Director ID 不得直接出现在 Canon Patch 的 `created_from` 中。

## 3. Canon Origin 与叙事时间范围

“事实来自哪里”和“事实在世界中何时适用”是两个不同维度。

### canon_origin

建议的来源维度：

- `original_source`
- `authorial_supplement`
- `transition_convention`
- `continuation_play`
- `special_interlude_source`

### temporal_or_narrative_scope

建议的时间或叙事适用范围：

- `preexisting_world`
- `original_campaign`
- `transition`
- `continuation`
- `special_interlude`

Authorial Supplement 使用 `effective_scope` 表达后一维度。后来记录的 supplement 可以描述一直存在于世界中的事实，因此 `canon_origin=authorial_supplement` 与 `effective_scope=preexisting_world` 可以同时成立。这不能被改写成“原 Campaign 已明确出现”。

现有 Worldbook 的 `canon_layer` 目前只承担既有数据库的叙事层标记，不能完整表达 provenance。正式增加 `canon_origin`、visibility 或 knowledge metadata 必须经过独立 schema migration；Phase 2.7 不静默修改 Worldbook schema 或现有 79 条记录。

## 4. 数据对象与生命周期

### 4.1 Authorial Supplement

Schema：`schema/authorial_supplement.schema.json`。

生命周期：`draft → review → approved | rejected`。后来被新 supplement 替代时，旧记录变为 `superseded`，历史文件仍保留。

关键字段：

- `supplement_type`：内容性质。
- `target_domain`：建议进入的数据库，不等于批准。
- `effective_scope`：事实适用范围，不等于来源类型。
- `visibility`、`known_by`、`unknown_to`：知识可见性。
- `supersedes` / `superseded_by`：不可覆盖的替代链。
- `provenance`：谁提供、来源说明、记录时间。

### 4.2 Canon Patch

Schema：`schema/canon_patch.schema.json`。

Patch 是唯一允许提出 Canon database 变更的中间格式。支持：

- `add`
- `update`
- `supersede`
- `deprecate`

普通工作流不支持 destructive `delete`。`deprecate` 保留历史身份和追踪关系；它不是物理删除。

生命周期分为两条明确分支：`draft → review → approved → applied`；或 `draft → review → rejected` 并终止。已应用 patch 随后可以被新 patch 标记为 `superseded`，但 rejected patch 永远不能进入 applied。

Patch 必须保存：

- `created_from`：来源 ID 或精确文件引用；
- `target_database` 与 `target_id`；
- `reason`；
- `proposed_changes.before` 与 `proposed_changes.after`；
- `affected_entries`；
- `conflict_check`；
- 人工 `approval`；
- applied 时的 `application` 记录。

`approved` 与 `applied` patch 都必须带有明确的人工 approval；`applied` 还必须带有 application 记录。Phase 2.7 validator 只读检查，不提供 apply 命令。

### 4.3 Continuation Event

Schema：`schema/continuation_event.schema.json`。

Continuation Event 记录“过去发生了什么”。`current_state.md` 只回答“现在是什么样”。不得把全部 Session 历史不断追加进 Current State。

正确流向：

```text
Continuation Events
        ↓
Canonical changes through patches
        ↓
Current State rebuild/update
```

Current State 应保持短、面向当前，只包含仍有运行价值的信息。理想派生关系是：

```text
Canonical facts + Continuation Events + NPC state → Current State
```

### 4.4 Director Item

Schema：`schema/director_item.schema.json`。

Director Material 可以影响 AI GM 的考虑范围，但不得：

- 被 NPC 当成已知事实；
- 被旁白当成已确认真相；
- 直接进入 Worldbook 或 Current State；
- 直接成为 NPC knowledge；
- 自动完成谜团；
- 直接成为 Canon Patch 来源。

`possible_directions` 永远是假设。

## 5. 可见性与知识边界

统一 visibility：

- `public`
- `restricted`
- `secret`

`restricted` 或 `secret` 必须至少通过 `known_by` 或 `unknown_to` 表达知识分区。同一主体不得同时出现在两个列表。

下列状态必须保持严格区分：

| 类别 | 含义 | 能否作为客观事实加载 |
|---|---|---|
| confirmed secret | 客观真实，但知识受限 | 只在满足 knowledge partition 时 |
| character belief | 角色相信为真 | 否；必须归因 |
| character suspicion | 角色怀疑 | 否；必须归因 |
| rumor | 流传说法 | 否；保留 rumor 状态 |
| director hypothesis | 未来推演假设 | 否；只供导演层考虑 |

它们不得互相自动升级。

## 6. NPC Profile 兼容边界

Phase 3 尚未建立正式 `npc_profiles` schema，因此 Phase 2.7 不创建 NPC Profile。

人物人格、价值观、说话风格、决策习惯、私人目标和主观关系应按以下路径保留：

```text
character supplement → review → patch(target_database=npc_profiles)
→ human approval → future npc_profiles database
```

这些内容不得为了“先有地方存”而进入 Worldbook。

## 7. 标准工作流

### Workflow A：新增世界设定

```text
User supplement
→ authorial supplement
→ conflict review
→ canon patch
→ human approval
→ worldbook update
→ runtime rebuild
```

### Workflow B：补 NPC 人格

```text
Character supplement
→ evidence / authorial review
→ NPC profile patch
→ human approval
→ npc_profiles update
→ character-card rebuild
```

### Workflow C：续跑事件

```text
Session record
→ continuation event
→ confirm
→ affected-target analysis
→ patches
→ worldbook / profiles / state update
→ runtime rebuild
```

### Workflow D：未来剧情想法

```text
Idea
→ director item
→ no Canon mutation
→ AI may consider during simulation
→ if actually realized: continuation event → Canon patch
```

### Workflow E：修改后来补充的设定

```text
new supplement
→ references previous supplement
→ superseding patch
→ impact analysis
→ human approval
→ rebuild
```

## 8. Supersede 与 Retcon

不得覆盖或删除历史来源。新 supplement 使用 `supersedes` 指向旧 supplement；旧 supplement 使用 `superseded_by` 指向新记录，并将 status 改为 `superseded`。所有 patch history 保留。

如果新设定与 Original Campaign Canon 冲突，必须标记 `CANON_CONFLICT`，并由人工选择：

1. reject supplement；
2. reinterpret scope；
3. explicit retcon。

Explicit Retcon 是独立人工操作，AI 和 validator 都不得自动执行。Retcon 仍必须保留原来源、冲突说明、审批者和应用 patch。

## 9. Patch 审核与应用门槛

每个 approved patch 在应用前必须完成 `docs/patch_impact_checklist.md`。至少检查 Worldbook、NPC Profiles、Current State、Director Items、Rules、aliases/trigger keys、knowledge partition 和 canon-layer implications。

应用程序未来必须采用 deterministic、atomic-write 和 review protection：

1. 验证输入与目标 baseline；
2. 生成完整 preview；
3. 确认人工 approval；
4. 在临时文件中合并；
5. 验证新数据库；
6. 原子替换正式文件；
7. 记录 application result 和新 hash。

Phase 2.7 没有实现该应用程序。

## 10. ID 生命周期

稳定 ID 前缀：

- `SUPPLEMENT_XXXX`
- `PATCH_XXXX`
- `CONT_XXXX`
- `DIRECTOR_XXXX`

其中 `XXXX` 为至少四位、单调分配的数字。ID 一旦分配不得复用，即使记录被 rejected、superseded 或 deprecated。ID 不依赖数组位置、文件排序或标题文本。文件移动不改变 ID。

分配新 ID 前，应扫描同类 source 目录与历史 patch 目录，选择从未出现过的下一个值。并发分配需要由未来的 registry 或锁机制解决；Phase 2.7 不实现自动 ID allocator。

## 11. Runtime / Compiled Outputs

以下均属于 derived runtime artifact：

- SillyTavern World Info；
- Character Card；
- GM / Narrator Card；
- runtime trigger config；
- active cast context；
- director prompt projection。

直接手改 runtime artifact 不会自动成为 Canon。需要永久保留的修改必须反向整理为 Supplement、Continuation Event 或 Director Item，经过 Review 与 Patch 后再进入 canonical source。

## 12. Optional Patch Preview 接口

Phase 2.7 不实现 `preview_canon_patch.py`。未来只读 preview 工具应接受一个 draft/review patch 与目标数据库，输出：

- target database 与 target ID；
- old value；
- proposed new value；
- affected entries；
- conflict items；
- alias / trigger implications；
- baseline hash。

Preview 不能写文件、改变 patch status、添加 approval 或调用 apply。

## 13. Validation

运行：

```text
python scripts/validate_authoring_framework.py <file-or-directory> [...]
```

Validator 联合读取所给 JSON/JSONL 文件，以便检查 duplicate ID、supersede 引用和 continuation source 状态。它使用四个本地 JSON Schema，并额外执行跨文档语义检查。返回错误不触发任何数据改写。
