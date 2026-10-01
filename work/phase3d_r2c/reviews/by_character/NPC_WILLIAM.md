# 威廉

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_WILLIAM`；状态：`existing`；类型：`npc`。

- 威廉在帝都经营酒屋。。  
  追踪：`IDENTITY_WILLIAM_HISTORY_2`；来源：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md:威廉的酒屋及其与御临风的持续接触（lines 93-134, 419-448）`

## 2. 人物背景

- 威廉参与了把悠悠诅咒转移给御临风的法阵仪式。；证据层：人物背景。  
  追踪：`BACKGROUND_WILLIAM_HISTORY_1`；来源：`extracted-first/28/posts.md:威廉参与诅咒转移法阵（lines 266-377）`
- 威廉曾在帝都施术帮助御临风恢复感情与边关记忆。；证据层：人物背景。  
  追踪：`BACKGROUND_WILLIAM_IDENTITY`；来源：`extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）`
- 他在与御临风初次交涉时自我介绍为‘威廉信长’。；证据层：人物背景。  
  追踪：`BACKGROUND_WILLIAM_FULL_NAME`；来源：`extracted-first/22/posts.md:369-375`

## 3. 人格、价值观、行为模式

人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P1-017 — 皇宫朝见

角色以“actor”参与；帝与八柱将接见队伍；威廉以孔雀和法印检查御临风，确认其记忆与魔力异常，悠悠的空间龙身份、诅咒与风险进入帝国高层审议。

角色作用：actor。
人物后果：御临风的异常记忆/魔力被检测。；悠悠处于受限制状态。；帝国高层获得关于御临风异常和悠悠身份的信息。
未决边界：检测结果不证明所有记忆异常的单一原因。

追踪：event_ref `EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`；story_order `P1-017`；Canon 层 `original_campaign`。
证据：`extracted-first/21/posts.jsonl post 846113`、`extracted-first/22/posts.jsonl post 846373`、`extracted-first/22/posts.jsonl post 846645`、`extracted-first/22/posts.jsonl post 846744`

### P1-021 — 耶各诅咒转移

角色以“actor”参与；威廉、宝石翁与慕少艾完成转移阵式；御临风在明确死亡风险后坐到悠悠身旁，黑水与能量从悠悠转入御临风，悠悠获得新生，御临风承受耶各诅咒。

角色作用：actor。
人物后果：御临风的历史选择完成，但不授权 AI 生成其未来选择。；御临风—悠悠关系新增自愿代受诅咒里程碑。；诅咒从悠悠转移到御临风。；御临风获得伴随诅咒的魔力与生存限制。；御临风获知自身预计仅有数日寿命及诅咒暴走条件。
未决边界：诅咒文字差异与完整机制在此未解决。

追踪：event_ref `EVENT_P1_021_JERGAL_TRANSFER`；story_order `P1-021`；Canon 层 `original_campaign`。
证据：`extracted-first/28/posts.jsonl post 861478`、`extracted-first/28/posts.jsonl post 861484`、`extracted-first/28/posts.jsonl post 861774`、`extracted-first/28/posts.jsonl post 862100`、`extracted-first/28/posts.jsonl post 862152`

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
- 禁止推断：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。（`CONSTRAINT_WILLIAM_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_WILLIAM_HISTORY_2` → `MIGRATED` → `IDENTITY_WILLIAM_HISTORY_2`：威廉在帝都经营酒屋。
- `CLAIM_WILLIAM_HISTORY_1` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WILLIAM_HISTORY_1`：威廉参与了把悠悠诅咒转移给御临风的法阵仪式。
- `CLAIM_WILLIAM_IDENTITY` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WILLIAM_IDENTITY`：威廉曾在帝都施术帮助御临风恢复感情与边关记忆。
- `CLAIM_WILLIAM_FULL_NAME` → `MOVED_TO_BACKGROUND` → `BACKGROUND_WILLIAM_FULL_NAME`：他在与御临风初次交涉时自我介绍为‘威廉信长’。
- `CONSTRAINT_WILLIAM_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_WILLIAM_EVIDENCE_BOUNDARY`：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_WILLIAM.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_WILLIAM.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_WILLIAM.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
