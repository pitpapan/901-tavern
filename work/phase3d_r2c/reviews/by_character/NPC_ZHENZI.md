# 贞子

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_ZHENZI`；状态：`existing`；类型：`npc`。

- 贞子是曾在魔兽山脉活动并救助御临风与雪老的幽魂。。  
  追踪：`IDENTITY_ZHENZI_IDENTITY`；来源：`设定 人物/人物卡资料集_叙事检索版.md:御临风背景与关系：贞子的幽魂身份、救援与牺牲影响（lines 45-53）`

## 2. 人物背景

- 边关陷落时，贞子救下御临风，并在黄祸龙狼追击下身受重伤。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_ZHENZI_HISTORY_1_1`；来源：`extracted-first/22/posts.md:御临风恢复边关记忆、贞子救援与以自身换取其生还（lines 438-470）`
- 御临风恢复记忆后明确陈述贞子已经为救他而死。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_ZHENZI_HISTORY_2_1`；来源：`extracted-first/24/posts.md:御临风向悠悠确认贞子已为救他而死（lines 219-227）`
- 边关陷落时，贞子救下御临风，并以自身为代价换取其生还。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_ZHENZI_RELATIONSHIP_1`；来源：`extracted-first/22/posts.md:lines 438-470`

## 3. 人格、价值观、行为模式

### 决策模式

- 边关陷落时，贞子以自己的全部作为代价换取御临风生还。；证据层：观察到的行为。  
  追踪：`PERSONA_ZHENZI_SACRIFICE`；来源：`extracted-first/22/posts.md:lines 438-470`

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

- R2B 无 exact-reference link，且本次未确认可安全加入的中央事件；这不表示人物没有背景历史。
## 7. 关系时间线

### PC_YU_LINFENG — rescuer and enduring deceased relation

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。
### PC_YU_LINFENG — 贞子是边关陷落时救下御临风的历史救命者。

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- 没有独立迁移的重大能力、身份或状态变化。

## 9. 知识时间线

- 取得时间未知 / `BELIEVES` / 角色信念：御临风相信贞子已经为救他而死。（`KNOWLEDGE_CLAIM_ZHENZI_HISTORY_2_1`）
  - 归因：御临风恢复记忆后的陈述；来源角色：`PC_YU_LINFENG`。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：现有资料不足以概括稳定声线与完整人格。
- 未解决：死亡后的任何行动可能性均无证据。
- 禁止推断：贞子已故；档案不得暗示复活、当前行动或以无来源名称替代她。（`CONSTRAINT_ZHENZI_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_ZHENZI_IDENTITY` → `MIGRATED` → `IDENTITY_ZHENZI_IDENTITY`：贞子是曾在魔兽山脉活动并救助御临风与雪老的幽魂。
- `CLAIM_ZHENZI_HISTORY_1` → `MOVED_TO_BACKGROUND` → `BACKGROUND_CLAIM_ZHENZI_HISTORY_1_1`：边关陷落时，贞子救下御临风，并在黄祸龙狼追击下身受重伤。
- `CLAIM_ZHENZI_HISTORY_2` → `SPLIT` → `BACKGROUND_CLAIM_ZHENZI_HISTORY_2_1`、`KNOWLEDGE_CLAIM_ZHENZI_HISTORY_2_1`：恢复记忆后，御临风明确说贞子已经为救他而死。
- `CLAIM_ZHENZI_SACRIFICE` → `DEMOTED_TO_OBSERVED_BEHAVIOR` → `PERSONA_ZHENZI_SACRIFICE`：边关陷落时，贞子以自己的全部作为代价换取御临风生还。
- `RELATIONSHIP_ZHENZI_YU_LINFENG` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_ZHENZI_YU_LINFENG`：rescuer and enduring deceased relation
- `CLAIM_ZHENZI_RELATIONSHIP` → `SPLIT` → `BACKGROUND_CLAIM_ZHENZI_RELATIONSHIP_1`、`RELATIONSHIP_PC_YU_LINFENG_CLAIM_ZHENZI_RELATIONSHIP_PC_YU_LINFENG`：边关陷落时，贞子救下御临风，并以自身为代价换取其生还。
- `CONSTRAINT_ZHENZI_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_ZHENZI_EVIDENCE_BOUNDARY`：贞子已故；档案不得暗示复活、当前行动或以无来源名称替代她。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_ZHENZI.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_ZHENZI.json`
- source profile：`work/phase3d/approved_candidates/NPC_ZHENZI.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
