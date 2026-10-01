# Phase 3D-R2A Campaign Chronology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从原始团录按来源顺序建立带双时间轴、全 source-chunk 覆盖与 Part 1 retention gate 的 Campaign 年代审计，并停在 R2A 证据/路由层。

**Architecture:** 确定性构建器先冻结 Phase 1–3D-R 并枚举每条原始帖子为 source chunk，再读取人工核验的事件、人物揭示与 disposition 输入，生成 chronology、覆盖 ledger、专项审计、人物发现和中文报告。所有 Canon 事实来自原帖或权威现状锚点，自动化只负责发现、验证、排序与渲染，不负责事实提升。

**Tech Stack:** Python 3.12 standard library、JSON/JSONL、Markdown、`unittest`、现有离线 validators。

**Spec:** `docs/superpowers/specs/2026-09-29-phase3d-r2a-campaign-chronology-design.md`

## Global Constraints

- Phase 1–3D-R 所有既有报告、候选、补丁、Worldbook、Current State 与 Schema 均为冻结历史产物。
- R2A 只写 `work/phase3d_r2/`、新构建脚本、新测试和本计划/设计文档。
- 所有 Markdown 人类报告以简体中文为主。
- 原始 `posts.jsonl` / `posts.md` 是事件事实主来源；compact、scene markers、既有报告和档案只作导航或交叉检查。
- 双时间轴必须同时保存 story order 与 source order；论坛日期不得当成世界内日期。
- 每个 source chunk 必须有最终 disposition；禁止未记录的第五状态。
- `character_revelations` 独立于事件摘要，并覆盖 revelation-only 场景。
- Canon identity 与 runtime trigger policy 解耦；R2A 不生成 trigger keys。
- Part 1 retention gate 必须单独通过。
- 不重写人物档案、不改 Schema、不批准/应用补丁、不生成正式数据库、不进入 R2B 或 Phase 4。

## Review Focus

- 一条长 GM 帖同时包含规则说明、背景揭示和当前事件时，分段 coverage 必须完整，不能整帖以单一 disposition 掩盖材料事实。
- 古代背景在晚期才被叙述时，`story_order` 与 `source_order` 必须分离，不能制造错误年代。
- 可能未来中的角色行为不得成为已发生事件，但来源直接陈述的当前动机必须保留为 revelation。
- 单字名“杨”不得因 trigger 歧义被拒绝 Canon 身份，也不得未经证据生成 alias。
- Part 1 中仅短暂出现但造成持续影响的角色必须进入 retention gate，即使后期完全消失。

---

### Task 1: 冻结预检与双时间轴数据契约

**Files:**
- Create: `scripts/build_phase3d_r2.py`
- Create: `tests/test_phase3d_r2.py`
- Create: `work/phase3d_r2/preflight_manifest.json`
- Create: `work/phase3d_r2/reviewed_inputs/events.jsonl`
- Create: `work/phase3d_r2/reviewed_inputs/revelations.jsonl`
- Create: `work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl`

**Interfaces:**
- Consumes: 原始三部 `posts.jsonl`、`current_state.md`、Phase 3D-R protected inputs。
- Produces: `discover_source_posts() -> list[SourceChunk]`、`validate_event_record(record) -> list[str]`、冻结 SHA-256 manifest 与空的 reviewed-input 数据契约。

- [ ] 写失败测试：来源人口必须为 28/25/5 页和 1394/1204/250 帖；事件必须同时具有 story/source axes；冻结清单覆盖 Phase 1–3D-R。
- [ ] 运行 `python -m unittest tests.test_phase3d_r2.Phase3DR2PreflightTests -v`，确认因实现不存在而失败。
- [ ] 实现确定性来源发现、双轴验证、原子写与预检 manifest。
- [ ] 运行专项测试，确认通过。

### Task 2: Source-chunk coverage ledger

**Files:**
- Modify: `scripts/build_phase3d_r2.py`
- Modify: `tests/test_phase3d_r2.py`
- Create: `work/phase3d_r2/source_coverage/source_inventory.json`
- Create: `work/phase3d_r2/source_coverage/source_chunk_ledger.jsonl`
- Create: `work/phase3d_r2/source_coverage/*_coverage.md`

**Interfaces:**
- Consumes: Task 1 `SourceChunk` inventory 与 `chunk_decisions.jsonl`。
- Produces: `build_chunk_ledger(chunks, decisions) -> list[dict]`；每个父 post 恰好一个最终 coverage row，可引用多个 event/revelation/background/routing 目标。

- [ ] 写失败测试：2,848 个父 post 全覆盖；无空 disposition/UNREVIEWED；长帖 segment 不得使父帖剩余文本失去结算。
- [ ] 运行 focused tests 并确认失败。
- [ ] 实现 ledger 合并、合法 disposition 枚举、重复/缺失 chunk 检查和分部覆盖渲染。
- [ ] 运行 focused tests 并确认通过。

### Task 3: Part 1 年代与 retention gate

**Files:**
- Modify: `work/phase3d_r2/reviewed_inputs/*.jsonl`
- Modify: `scripts/build_phase3d_r2.py`
- Modify: `tests/test_phase3d_r2.py`
- Create: `work/phase3d_r2/reports/early_arc_character_retention.md`
- Create: `work/phase3d_r2/character_discoveries/part1_*.md|json`

**Interfaces:**
- Consumes: Part 1 原帖、scene markers、既有导航与 Worldbook/Profile 表示状态。
- Produces: 经来源核验的 `P1-*` / `PRECAMPAIGN-*` events、Part 1 revelations、所有 Part 1 chunk decisions、`validate_part1_retention(...)` gate。

- [ ] 顺序阅读 Part 1 各页，以 compact/marker 导航、原帖复核每个重大场景并记录 chunk disposition。
- [ ] 写失败测试：所有 Part 1 事件参与者与 revelation 人物均在 retention 表或有明确非角色路由；高风险三类不得遗漏。
- [ ] 生成 Part 1 reviewed inputs、人物发现与 retention 报告。
- [ ] 运行 Part 1 focused tests；任何未决 Canon 身份进入 blocker 而非自动裁决。

### Task 4: Part 2 年代重建

**Files:**
- Modify: `work/phase3d_r2/reviewed_inputs/*.jsonl`
- Modify: `tests/test_phase3d_r2.py`

**Interfaces:**
- Consumes: Part 2 原帖与 Task 2 ledger contract。
- Produces: `P2-*` events/revelations、Part 2 chunk decisions、关系/能力/知识后果。

- [ ] 顺序阅读 Part 2 各页并记录每个 chunk 的最终 disposition。
- [ ] 写失败测试：Part 2 所有页有覆盖、事件 story order 唯一可排序、每个 material item 有路由。
- [ ] 添加核验事件与 revelation 输入。
- [ ] 运行 Part 2 focused tests 并确认通过。

### Task 5: Part 3、结局与龙族秘境终局

**Files:**
- Modify: `work/phase3d_r2/reviewed_inputs/*.jsonl`
- Modify: `tests/test_phase3d_r2.py`
- Create: `work/phase3d_r2/reports/dragon_sanctuary_finale_audit.md`
- Create: `work/phase3d_r2/event_audits/*.md`

**Interfaces:**
- Consumes: Part 3 原帖与既有 Phase 3D-R event audits。
- Produces: `P3-*`/`ENDING-*` events、终局 sequence、龙王参与/受制状态和未决 alias 清单。

- [ ] 顺序阅读 Part 3，核验死亡之翼战后返回秘境、笛剑、屏障/束缚、白魔与魔宝石的相对顺序。
- [ ] 写失败测试：监狱塔与兵工厂事件仍分离；终局 WHO/WHEN/WHERE/RESULT 完整；“瑟西斯/凯多”不得无证据成为 alias。
- [ ] 写入 reviewed inputs 与中文专项审计。
- [ ] 运行 focused tests 并确认通过。

### Task 6: Special Interlude、ending 与 D0–D3 Transition

**Files:**
- Modify: `work/phase3d_r2/reviewed_inputs/*.jsonl`
- Modify: `tests/test_phase3d_r2.py`
- Modify: `work/phase3d_r2/source_coverage/special_interlude_coverage.md`
- Modify: `work/phase3d_r2/source_coverage/transition_coverage.md`

**Interfaces:**
- Consumes: 梦境原帖、主线带回证据、`current_state.md`。
- Produces: `INTERLUDE-*`、`ENDING-*`、`TRANSITION-D0..D3` records，并保持主世界/梦境隔离。

- [ ] 核验每个 Special Interlude 段落及其是否明确带回主世界。
- [ ] 写失败测试：dream-only material 不得路由为普通主世界事实；Transition 不补写 current_state 未规定的撤离细节。
- [ ] 添加 interlude/transition 输入与 coverage decisions。
- [ ] 运行 focused tests 并确认通过。

### Task 7: Deathwing、Cassandra、杨与人物揭示专项

**Files:**
- Modify: `work/phase3d_r2/reviewed_inputs/*.jsonl`
- Modify: `tests/test_phase3d_r2.py`
- Create: `work/phase3d_r2/reports/deathwing_background_audit.md`
- Create: `work/phase3d_r2/reports/cassandra_motivation_audit.md`
- Create: `work/phase3d_r2/reports/yang_character_audit.md`
- Create: `work/phase3d_r2/reports/unresolved_identity_aliases.md`
- Create when verified: `work/phase3d_r2/character_discoveries/CHARACTER_YANG.json`
- Create when verified: `work/phase3d_r2/patches/PATCH_*_character_yang.json`

**Interfaces:**
- Consumes: 全部 source ledger、event/revelation records、既有 Canon 表示。
- Produces: 四项 human leads 的证据结论；`character_revelations.jsonl`；杨的 Canon candidate/draft patch 或明确非角色结论。

- [ ] 直接核验 Deathwing 预言/祝福之子/诅咒/古史/古神/不死性材料并分隔事实、testimony、理论与 unknown。
- [ ] 直接核验 Cassandra possible future 与当前仇恨/复仇/执念，写失败测试防止二者混同。
- [ ] 核验杨的自我介绍、身份、分析与合作；写失败测试保证 trigger suitability 不参与 Canon 判定。
- [ ] 生成专项报告、人物 revelation 和必要的独立 `draft` patch；运行 focused tests。

### Task 8: Chronology、指标与最终报告

**Files:**
- Modify: `scripts/build_phase3d_r2.py`
- Modify: `tests/test_phase3d_r2.py`
- Create: `work/phase3d_r2/chronology/campaign_chronology.jsonl`
- Create: `work/phase3d_r2/chronology/campaign_chronology.md`
- Create: `work/phase3d_r2/chronology/character_revelations.jsonl`
- Create: `work/phase3d_r2/reports/chronology_coverage_metrics.json`
- Create: `work/phase3d_r2/reports/chronology_coverage_report.md`
- Create: `work/phase3d_r2/reports/r2a_review.md`

**Interfaces:**
- Consumes: Tasks 2–7 全部 reviewed inputs 与 coverage ledger。
- Produces: 稳定排序 chronology、按 Part 分列指标、中文总报告和最终 gate status。

- [ ] 写失败测试：所有 required outputs/headings；各部分独立指标；事件/revelation/source chunk 数量可重算；每个 material item 有路由。
- [ ] 实现 chronology/render/report 聚合与完成 gate。
- [ ] 构建全部 R2A 产物并修复验证错误。
- [ ] 运行 `python -m unittest tests.test_phase3d_r2 -v`。

### Task 9: 冻结保护、确定性和最终复核

**Files:**
- Modify only R2A script/tests/reviewed inputs/outputs when a verified finding requires it.

**Interfaces:**
- Consumes: 完整 R2A 产物。
- Produces: 0 byte-difference 证明、冻结哈希证明、全量回归结果与最终状态。

- [ ] 连续构建两次，比较全部 R2A 生成文件并要求 0 byte differences。
- [ ] 验证 Phase 1–3D-R protected hashes、历史补丁、Worldbook、Current State 与 Schema 均未变化。
- [ ] 运行 Phase 3D-R2A 专项测试、现有 validators 与完整 `python -m unittest discover -s tests -v`。
- [ ] 对照设计和 Review Focus 做完整只读终审；Critical/Important 发现以 RED→GREEN 修复。
- [ ] 仅在全部 gate 通过时写 `R2A_CHRONOLOGY_READY_FOR_SCHEMA_REVISION`，否则写 `R2A_BLOCKED` 与精确 blocker；停止在 R2B 前。
