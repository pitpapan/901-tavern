# 托尔金

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_TOLKIEN`；状态：`existing`；类型：`npc`。

- 托尔金是帝都的矮人工匠并经营铁匠铺。。  
  追踪：`IDENTITY_TOLKIEN_IDENTITY`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:76-113`、`output/worldbook_source.jsonl#CHARACTER_TOLKIEN`
- 他为队伍提供过锻造与魔法装备支援。。  
  追踪：`IDENTITY_TOLKIEN_CRAFT_ROLE`；来源：`output/worldbook_source.jsonl#CHARACTER_TOLKIEN`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582`

## 2. 人物背景

- 无足够证据形成该类条目。

## 3. 人格、价值观、行为模式

人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P2-010 — 帝都余波与整备

角色以“supplier”参与；下水道追查无果后艾利加入后续行动；御临风请求托尔金为悠悠准备装备，并在雪翁提醒下再次面对贞子遗憾与保护悠悠的动机。

角色作用：supplier。
人物后果：艾利由外部支援转为队伍同行者。；御临风把保护悠悠落实为装备准备，并再次把此事与贞子遗憾相连。；悠悠取得托尔金提供的出行装备。；下水道追查失败，相关目标位置仍未知。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P2_010_SEWER_SEARCH_AND_PREPARATION`；story_order `P2-010`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl post 917739`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl post 919205`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl post 920942`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.jsonl post 921071`

## 7. 关系时间线

### PC_YU_LINFENG — craft and equipment support history

- 御临风向托尔金请求为悠悠与队伍准备装备，托尔金随后实际提供支援。（`MILESTONE_CLAIM_TOLKIEN_YU_SUPPORT_EVENT_P2_010_SEWER_SEARCH_AND_PREPARATION`；证据层：实际事件）
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- 没有独立迁移的重大能力、身份或状态变化。

## 9. 知识时间线

- 没有足够证据形成独立知识条目；世界事实与在场不等于角色知情。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：没有稳定人格、价值观、语言风格或决策模式证据。
- 未解决：没有来源确认的当前目标与知识分区。
- 未解决：D3 的位置与生存状态没有精确确认。
- 未解决：雪老与露露缇耶关系尚缺本轮深入原文审查。
- 禁止推断：在获得更多审核证据前，不把单场粗声、发怒或直率台词扩写为稳定人格与口癖。（`CONSTRAINT_TOLKIEN_MINIMAL`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_TOLKIEN_IDENTITY` → `MIGRATED` → `IDENTITY_TOLKIEN_IDENTITY`：托尔金是帝都的矮人工匠并经营铁匠铺。
- `CLAIM_TOLKIEN_CRAFT_ROLE` → `MIGRATED` → `IDENTITY_TOLKIEN_CRAFT_ROLE`：他为队伍提供过锻造与魔法装备支援。
- `CLAIM_TOLKIEN_EQUIPMENT_HISTORY` → `MOVED_TO_TIMELINE` → `TIMELINE_TOLKIEN_P2_010_SEWER_SEARCH_AND_PREPARATION`：队伍远行前，他为悠悠与同行者准备并开放一批魔法装备。
- `RELATIONSHIP_TOLKIEN_YU_LINFENG` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_TOLKIEN_YU_LINFENG`：craft and equipment support history
- `CLAIM_TOLKIEN_YU_SUPPORT` → `MOVED_TO_RELATIONSHIP` → `MILESTONE_CLAIM_TOLKIEN_YU_SUPPORT_EVENT_P2_010_SEWER_SEARCH_AND_PREPARATION`：御临风向托尔金请求为悠悠与队伍准备装备，托尔金随后实际提供支援。
- `CONSTRAINT_TOLKIEN_MINIMAL` → `MIGRATED` → `CONSTRAINT_TOLKIEN_MINIMAL`：在获得更多审核证据前，不把单场粗声、发怒或直率台词扩写为稳定人格与口癖。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_TOLKIEN.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_TOLKIEN.json`
- source profile：`work/phase3d/approved_candidates/NPC_TOLKIEN.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
