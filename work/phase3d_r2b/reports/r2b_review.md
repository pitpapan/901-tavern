# Phase 3D-R2B 审核报告

最终状态：`R2B_NORMALIZED_TEMPORAL_SCHEMA_READY_FOR_REVIEW`

## 权威来源与派生边界

R2B normalized event store 仅由 `work/phase3d_r2/chronology/campaign_chronology.jsonl` 确定性生成。它不是可独立人工维护的第二权威源，也不会被 builder 当作输入。

## Gate

- `authoritative_inputs_frozen`：`PASS`
- `event_schema_compatible`：`PASS`
- `semantic_round_trip`：`PASS`
- `derived_only_authority`：`PASS`
- `canon_layer_crosswalk`：`PASS`
- `mechanical_indexes_only`：`PASS`
- `r2c_semantic_migration_absent`：`PASS`

## 无损结果

- R2A event：66
- Schema valid：66
- Semantic round-trip equal：66
- Semantic differences：0
- Character revelation：38
- event ID、输入行序与完整 `story_axis` 均保持。

## Canon layer crosswalk

事件层保留原始 `canon_layer` 与 `story_axis.temporal_scope`；机械索引同时携带二者及 profile mapping：`original_campaign`、`special_interlude`、`transition`。

## 人物时序索引

- Index：36
- Mechanical event links：237
- Empty indexes：NPC_MU_TOU, NPC_ZHENZI
- 建链依据仅限 exact participant `character_ref` 与 revelation subject `character_ref`。
- 杨及其他 `character_label` 未被自动提升为 profile ID。

## R2C 边界

R2B 未迁移 background、timeline、relationship、knowledge、ability/status、current state、personality 或 motivation。机械关联不构成语义晋升许可。

## 冻结与权限

R2A 权威输入、现有人物候选、PC 权限、Worldbook、Current State 与历史 patch 均未修改。杨的 patch 仍为 draft、未批准、未应用。

## Stop boundary

未生成正式 `output/npc_profiles.jsonl` 或 `output/pc_continuity.jsonl`；未进入 R2C、runtime projection 或 Phase 4。
