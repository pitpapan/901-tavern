# 宝石翁

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_JEWEL_ELDER`；状态：`existing`；类型：`npc`。

- 无足够证据形成该类条目。

## 2. 人物背景

- 诅咒转移仪式中，宝石翁完成法阵并参与主持转移。；证据层：人物背景。  
  追踪：`BACKGROUND_JEWEL_ELDER_HISTORY_1`；来源：`extracted-first/28/posts.md:宝石翁完成法阵并主持转移仪式（lines 269-377）`
- 宝石翁与慕少艾一同向帝汇报了对悠悠诅咒的调查。；证据层：人物背景。  
  追踪：`BACKGROUND_JEWEL_ELDER_IDENTITY`；来源：`extracted-first/27/posts.md:宝石翁说明诅咒转移条件及准备（lines 201-259, 269-323）`
- 宝石翁向帝报告封印力量会在悠悠死亡时触发，并提议秘密把她送回魔兽山脉、利用该效果对付魔物军。；证据层：人物背景。  
  追踪：`BACKGROUND_JEWEL_ELDER_STRATEGIC_PROPOSAL`；来源：`extracted-first/27/posts.md:200-213`
- 宝石翁说明诅咒无法真正移除，但可以转移给自愿承接者；他随后准备法阵并在确认御临风意愿后参与转移。；证据层：人物背景。  
  追踪：`BACKGROUND_JEWEL_ELDER_TRANSFER_LIMIT`；来源：`extracted-first/27/posts.md:245-248`、`extracted-first/28/posts.md:269-377`

## 3. 人格、价值观、行为模式

人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P1-017 — 皇宫朝见

角色以“information_source”参与；帝与八柱将接见队伍；威廉以孔雀和法印检查御临风，确认其记忆与魔力异常，悠悠的空间龙身份、诅咒与风险进入帝国高层审议。

角色作用：information_source。
人物后果：御临风的异常记忆/魔力被检测。；悠悠处于受限制状态。；帝国高层获得关于御临风异常和悠悠身份的信息。
未决边界：检测结果不证明所有记忆异常的单一原因。

追踪：event_ref `EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`；story_order `P1-017`；Canon 层 `original_campaign`。
证据：`extracted-first/21/posts.jsonl post 846113`、`extracted-first/22/posts.jsonl post 846373`、`extracted-first/22/posts.jsonl post 846645`、`extracted-first/22/posts.jsonl post 846744`

### P1-019 — 诅咒转移准备

角色以“information_source”参与；雪老纠正御临风把悠悠选择归咎于自己的说法；御临风转而求助艾利、阿德莱德、慕少艾、宝石翁与帝，得知诅咒只能转移后自愿承接，并继续确认执行条件。

角色作用：information_source。
人物后果：御临风从自责转向寻求共同帮助并承担代价。；雪老以训斥维护悠悠选择的主体性。；御临风得知转移是当时可行的主要救治方案及其死亡风险。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION`；story_order `P1-019`；Canon 层 `original_campaign`。
证据：`extracted-first/24/posts.jsonl post 849058`、`extracted-first/25/posts.jsonl post 849066`、`extracted-first/25/posts.jsonl post 851802`、`extracted-first/27/posts.jsonl post 856896`、`extracted-first/27/posts.jsonl post 859329`

### P1-021 — 耶各诅咒转移

角色以“actor”参与；威廉、宝石翁与慕少艾完成转移阵式；御临风在明确死亡风险后坐到悠悠身旁，黑水与能量从悠悠转入御临风，悠悠获得新生，御临风承受耶各诅咒。

角色作用：actor。
人物后果：御临风的历史选择完成，但不授权 AI 生成其未来选择。；御临风—悠悠关系新增自愿代受诅咒里程碑。；诅咒从悠悠转移到御临风。；御临风获得伴随诅咒的魔力与生存限制。；御临风获知自身预计仅有数日寿命及诅咒暴走条件。
未决边界：诅咒文字差异与完整机制在此未解决。

追踪：event_ref `EVENT_P1_021_JERGAL_TRANSFER`；story_order `P1-021`；Canon 层 `original_campaign`。
证据：`extracted-first/28/posts.jsonl post 861478`、`extracted-first/28/posts.jsonl post 861484`、`extracted-first/28/posts.jsonl post 861774`、`extracted-first/28/posts.jsonl post 862100`、`extracted-first/28/posts.jsonl post 862152`

### P2-007 — 宫廷汇报与黑龙危机

角色以“examiner”参与；御临风向宫廷汇报耶各交易、黑龙画面与可能的末世危机；宫廷人员核验代行者装备，但对天启真伪与含义保持未知。

角色作用：examiner。
人物后果：没有由中央事件单独确认的角色专属后果。
未决边界：耶各身份、动机与天启真实性仍未被完全证实。

追踪：event_ref `EVENT_P2_007_COURT_BLACK_DRAGON_WARNING`；story_order `P2-007`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 913724`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914095`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914156`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.jsonl post 914271`

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
- 禁止推断：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。（`CONSTRAINT_JEWEL_ELDER_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_JEWEL_ELDER_HISTORY_1` → `MOVED_TO_BACKGROUND` → `BACKGROUND_JEWEL_ELDER_HISTORY_1`：诅咒转移仪式中，宝石翁完成法阵并参与主持转移。
- `CLAIM_JEWEL_ELDER_IDENTITY` → `MOVED_TO_BACKGROUND` → `BACKGROUND_JEWEL_ELDER_IDENTITY`：宝石翁与慕少艾一同向帝汇报了对悠悠诅咒的调查。
- `CLAIM_JEWEL_ELDER_STRATEGIC_PROPOSAL` → `MOVED_TO_BACKGROUND` → `BACKGROUND_JEWEL_ELDER_STRATEGIC_PROPOSAL`：宝石翁向帝报告封印力量会在悠悠死亡时触发，并提议秘密把她送回魔兽山脉、利用该效果对付魔物军。
- `CLAIM_JEWEL_ELDER_TRANSFER_LIMIT` → `MOVED_TO_BACKGROUND` → `BACKGROUND_JEWEL_ELDER_TRANSFER_LIMIT`：宝石翁说明诅咒无法真正移除，但可以转移给自愿承接者；他随后准备法阵并在确认御临风意愿后参与转移。
- `CONSTRAINT_JEWEL_ELDER_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_JEWEL_ELDER_EVIDENCE_BOUNDARY`：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_JEWEL_ELDER.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_JEWEL_ELDER.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_JEWEL_ELDER.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
