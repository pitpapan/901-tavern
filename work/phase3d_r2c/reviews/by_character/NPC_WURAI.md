# 武赖

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_WURAI`；状态：`existing`；类型：`npc`。

- 武赖是帝国八柱将之一，并被称为帝国最强之矛。。  
  追踪：`IDENTITY_WURAI_IDENTITY`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:武赖的八柱将身份与称号（lines 211-241）`

## 2. 人物背景

- 法师塔事件后，现场记录把造成火柱的攻击归于武赖，并称其为八柱将。；证据层：人物背景。  
  追踪：`BACKGROUND_WURAI_HISTORY_1`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:八柱将身份及火柱造成的伤亡统计困难（lines 211-241）`
- 设定资料明确把武赖记为火神假面的持有者。；证据层：人物背景。  
  追踪：`BACKGROUND_WURAI_FIRE_MASK`；来源：`设定 人物/妄想大陆设定集_检索版.md:164-169`

## 3. 人格、价值观、行为模式

人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P2-008 — 法师塔惨案

角色以“actor”参与；A 的异常控制引发法师塔灾难，武赖以火柱制裁 A，宗近接管现场；布莱特和艾利参与救援。记录称平民死亡规模接近三千，法师死亡过百。

角色作用：actor。
人物后果：A 线从个人悲剧扩大为帝都级灾难；武赖、宗近、布莱特与艾利分别承担制裁或救援。；帝都法师力量因百余名法师死亡而受到重大损失。；帝都确认 A 的失控已造成大规模平民与法师死亡。
未决边界：A 异常控制的完整来源与责任边界仍需保留原文层次。

追踪：event_ref `EVENT_P2_008_MAGE_TOWER_MASSACRE`；story_order `P2-008`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914301`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914868`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.jsonl post 915324`

## 7. 关系时间线

- 没有足够来源支持独立关系条目；同场参与不自动构成关系。

## 8. 能力 / 身份 / 状态变化

- 没有独立迁移的重大能力、身份或状态变化。

## 9. 知识时间线

- 没有足够证据形成独立知识条目；世界事实与在场不等于角色知情。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：稳定人格、价值排序与跨情境声线证据不足。
- 未解决：D3 精确位置、即时议程与当前目标未知。
- 禁止推断：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。（`CONSTRAINT_WURAI_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_WURAI_IDENTITY` → `MIGRATED` → `IDENTITY_WURAI_IDENTITY`：武赖是帝国八柱将之一，并被称为帝国最强之矛。
- `CLAIM_WURAI_HISTORY_1` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WURAI_HISTORY_1`：法师塔事件后，现场记录把造成火柱的攻击归于武赖，并称其为八柱将。
- `CLAIM_WURAI_FIRE_MASK` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WURAI_FIRE_MASK`：设定资料明确把武赖记为火神假面的持有者。
- `CONSTRAINT_WURAI_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_WURAI_EVIDENCE_BOUNDARY`：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_WURAI.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_WURAI.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_WURAI.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
