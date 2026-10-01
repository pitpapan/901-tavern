# 奥修特尔

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_OSHUTORU`；状态：`existing`；类型：`npc`。

- 奥修特尔在团录中向悠悠自报本名，此前以右近之名活动。。  
  追踪：`IDENTITY_OSHUTORU_IDENTITY`；来源：`extracted-first/21/posts.md:右近自报本名奥修特尔（lines 175-177）`
- 右近自报本名为奥修特尔。。  
  追踪：`IDENTITY_CLAIM_OSHUTORU_HISTORY_2_1`；来源：`extracted-first/21/posts.md:右近自报本名奥修特尔、朝见时以奥修特尔署名（lines 175-177, 602-606）`
- 以右近之名活动时，他是帝国八柱将所属的右近卫大将。。  
  追踪：`IDENTITY_CLAIM_OSHUTORU_HISTORY_1_1`；来源：`extracted-first/6/posts.md:右近卫大将右近介入达卡斯出征安排（lines 452-466）`

## 2. 人物背景

- 奥修特尔赏识哈克的智谋并邀请他成为部下。；证据层：人物背景。  
  追踪：`BACKGROUND_CLAIM_OSHUTORU_RELATIONSHIP_1`；来源：`设定 人物/妄想大陆设定集_检索版.md:哈克（lines 90-97）`

## 3. 人格、价值观、行为模式

### 核心人格

- 人物资料把奥修特尔描述为清廉正直、责任心极强。；证据层：角色信念。  
  追踪：`PERSONA_OSHUTORU_DUTY`；来源：`设定 人物/人物卡资料集_叙事检索版.md:奥修特尔（lines 154-160）`
- 人物参考把奥修特尔明确写为富有正义感的年轻剑士。；证据层：角色信念。  
  追踪：`PERSONA_OSHUTORU_REFERENCE_IDENTITY`；来源：`设定 人物/人物卡资料集_叙事检索版.md:154-165`、`设定 人物/妄想大陆设定集_检索版.md:90-97,165`

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P1-007 — 帝都分线

角色以“actor”参与；御临风被带去会见右近，双方以兄弟会关系与诗句试探；右近确认达卡斯存在问题并派人核查边关。

角色作用：actor。
人物后果：御临风注意到右近对大陆称谓的异常，并开始形成有限信任。；御临风与右近建立基于共同线索的初次合作。；右近获知队伍的边关报告。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_007_UKON_BROTHERHOOD_CONTACT`；story_order `P1-007`；Canon 层 `original_campaign`。
证据：`extracted-first/4/posts.jsonl post 817699`、`extracted-first/5/posts.jsonl post 818236`、`extracted-first/5/posts.jsonl post 818405`、`extracted-first/5/posts.jsonl post 818416`

### P1-009 — 边关真相

角色以“commander”参与；右近说明黄祸龙狼率魔兽逼近帝都并请求队伍追踪达卡斯；雪老复盘边关陷落的战术变化，包括龙背投兵、反魔箭、盾阵、萨满强化、科多扰乱与强敌收尾。

角色作用：commander。
人物后果：御临风意识到自己的边关记忆可能被改动。；布莱特安排孤儿院后事，黄泉适应新刀。；主要参与者得知魔兽战术已发生组织化变化。
未决边界：哈克的才能评价来自右近归因，不在此升级为全知事实。

追踪：event_ref `EVENT_P1_009_BORDER_TRUTH_AND_PURSUIT_MISSION`；story_order `P1-009`；Canon 层 `original_campaign`。
证据：`extracted-first/6/posts.jsonl post 821604`、`extracted-first/7/posts.jsonl post 822916`、`extracted-first/7/posts.jsonl post 824464`、`extracted-first/7/posts.jsonl post 824748`

### P1-014 — 血与火后篇

角色以“commander”参与；达卡斯调动军队，布莱特与黄泉被卡泽追击；御临风等人与接应者会合，帝与八柱将的援军落场，凌迟伪装的达卡斯身份及计划败露。

角色作用：commander。
人物后果：御临风濒死时仍传出空间龙位置信息。；布莱特交出麻痹匕首，黄泉以纵火牵制。；队伍的侦察成为帝国收网的一部分，但不是收网唯一主体。；参与者确认达卡斯身份与凌迟计划存在欺骗。
未决边界：卡泽等早期敌方角色需要独立 retention，而不能因后期消失而省略。

追踪：event_ref `EVENT_P1_014_DAKAS_PLOT_EXPOSED`；story_order `P1-014`；Canon 层 `original_campaign`。
证据：`extracted-first/17/posts.jsonl post 844064`、`extracted-first/18/posts.jsonl post 844648`、`extracted-first/19/posts.jsonl post 845112`、`extracted-first/19/posts.jsonl post 845600`

### P1-015 — 血与火后篇

角色以“actor”参与；右近使用假面与伏龙梅对抗黑泥龙；御临风与姜子尤昏迷后在草原醒来，银发女孩悠悠治愈二人并自报芬尔德·特兰希尔，御临风赠她玫瑰念珠。

角色作用：actor。
人物后果：御临风从仇恨追逐中转向保护悠悠。；御临风与悠悠建立救命、赠礼与初次私人联系。；御临风与姜子尤得到悠悠治疗。；雪老从前线角色转为后方。；御临风等人得知悠悠的姓名。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE`；story_order `P1-015`；Canon 层 `original_campaign`。
证据：`extracted-first/19/posts.jsonl post 845604`、`extracted-first/20/posts.jsonl post 845644`、`extracted-first/20/posts.jsonl post 845659`、`extracted-first/20/posts.jsonl post 845699`

### P1-017 — 皇宫朝见

间接但人物连续性关键：帝与八柱将接见队伍；威廉以孔雀和法印检查御临风，确认其记忆与魔力异常，悠悠的空间龙身份、诅咒与风险进入帝国高层审议。

角色作用：indirect continuity subject。
人物后果：御临风的异常记忆/魔力被检测。；悠悠处于受限制状态。；帝国高层获得关于御临风异常和悠悠身份的信息。
未决边界：检测结果不证明所有记忆异常的单一原因。

追踪：event_ref `EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`；story_order `P1-017`；Canon 层 `original_campaign`。
证据：`extracted-first/21/posts.jsonl post 846113`、`extracted-first/22/posts.jsonl post 846373`、`extracted-first/22/posts.jsonl post 846645`、`extracted-first/22/posts.jsonl post 846744`

### P1-019 — 诅咒转移准备

角色以“participant”参与；雪老纠正御临风把悠悠选择归咎于自己的说法；御临风转而求助艾利、阿德莱德、慕少艾、宝石翁与帝，得知诅咒只能转移后自愿承接，并继续确认执行条件。

角色作用：participant。
人物后果：御临风从自责转向寻求共同帮助并承担代价。；雪老以训斥维护悠悠选择的主体性。；御临风得知转移是当时可行的主要救治方案及其死亡风险。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION`；story_order `P1-019`；Canon 层 `original_campaign`。
证据：`extracted-first/24/posts.jsonl post 849058`、`extracted-first/25/posts.jsonl post 849066`、`extracted-first/25/posts.jsonl post 851802`、`extracted-first/27/posts.jsonl post 856896`、`extracted-first/27/posts.jsonl post 859329`

### P2-020 — 空间龙旧史与预言线

间接但人物连续性关键：谢尔伦讲述空间龙秘境因凌迟获救而暴露、随后被不明势力灭族等旧史；肯达要求御临风放弃考验或婚约，并透露黑龙中曾有具预言能力的白色异类。

角色作用：indirect continuity subject。
人物后果：肯达公开要求御临风放弃考验或婚约，双方立场冲突加深。；御临风从谢尔伦获得空间龙灭族 testimony，从肯达获得白色黑龙预言 testimony。
未决边界：空间龙灭族袭击者身份仍未确认；白色异类预言的准确范围需按肯达归属保存。

追踪：event_ref `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`；story_order `P2-020`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl post 971561`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl post 972331`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl post 974324`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.jsonl post 974730`

### P2-029 — 死亡之翼战场与封印警示

间接但人物连续性关键：现实线回归后御临风在雪地与队伍分离；死亡之翼带黑龙冲击战场，红月干扰魔法和通讯。御临风救援侦察兵并临时接过指挥；耶各手套警示其前往受荣之道，让悠悠在那里等待，称那里有死亡之翼最后一道封印。

角色作用：indirect continuity subject。
人物后果：御临风临时接过侦察兵指挥并向雷光报告，雷光派奥斯卡贝接应。；红月干扰魔法与远程通讯；御临风救下两名士兵。；耶各手套警示受荣之道存在死亡之翼最后一道封印，并要求悠悠在那里等待。
未决边界：警示的全部机制、封印具体状态及死亡之翼与白魔配合程度仍待后续事件确认。

追踪：event_ref `EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING`；story_order `P2-029`；Canon 层 `original_campaign`。
证据：`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl post 1031470`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl post 1032053`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.jsonl post 1033262`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl post 1033271`、`extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 25/posts.jsonl post 1033318`

## 7. 关系时间线

### NPC_HAKU — commander and subordinate

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。
### NPC_HAKU — 奥修特尔曾赏识并招揽哈克成为部下。

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。
### NPC_HAKU — 奥修特尔收留哈克进入麾下。

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。
### NPC_KUON — 奥修特尔收留久远进入麾下。

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。
### NPC_MU_SHAOAI — 奥修特尔称慕少艾为朋友。

- 没有可安全锚定的关系里程碑。
- 当前立场：未知；不从历史合作推断当前忠诚或义务。

## 8. 能力 / 身份 / 状态变化

- P1-015：解放水属性假面力量并投入战斗（类型 `mask_power_activation`；持续性 `temporary`；不确定性 `confirmed`；`TRANSITION_CLAIM_OSHUTORU_MASK_BATTLE_EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE`）
  - 边界：R1A-2A reviewed atomic realization; no present state or future conduct is inferred.

## 9. 知识时间线

- P2-020 / `KNOWS` / 角色信念：奥修特尔知道御临风所在单位受其直属指挥。（`KNOWLEDGE_CLAIM_OSHUTORU_LATE_COMMAND_EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_1`）
  - 归因：龙族任务指挥记录；来源角色：`None`。
- P2-029 / `TESTIMONY_HEARD` / 归因证词：战场报告称奥修特尔与武赖所在战线遭袭并失去通讯。（`KNOWLEDGE_CLAIM_OSHUTORU_LATE_COMMAND_EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING_2`）
  - 归因：红月战事后的战场报告；来源角色：`None`。

## 10. D3 当前状态

没有足够的角色专属 D3 证据；当前状态保持未知/空，不从历史或 Transition Canon 反推。
- D3 来源：无角色专属来源

## 11. 未解决问题 / 禁止推断

- 未解决：除本候选已记录的人物参考明示特征外，完整价值排序、跨情境声线与 D3 人格变化仍无充分证据。
- 未解决：D3 精确位置、即时议程与当前目标未知。
- 禁止推断：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。（`CONSTRAINT_OSHUTORU_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_OSHUTORU_IDENTITY` → `MIGRATED` → `IDENTITY_OSHUTORU_IDENTITY`：奥修特尔在团录中向悠悠自报本名，此前以右近之名活动。
- `CLAIM_OSHUTORU_HISTORY_1` → `MIGRATED` → `IDENTITY_CLAIM_OSHUTORU_HISTORY_1_1`：以右近之名活动时，他是帝国八柱将所属的右近卫大将。
- `CLAIM_OSHUTORU_HISTORY_2` → `SPLIT` → `TIMELINE_OSHUTORU_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION`、`IDENTITY_CLAIM_OSHUTORU_HISTORY_2_1`：右近后来向悠悠自报本名为奥修特尔。
- `CLAIM_OSHUTORU_MASK_BATTLE` → `SPLIT` → `TRANSITION_CLAIM_OSHUTORU_MASK_BATTLE_EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE`、`TIMELINE_OSHUTORU_P1_015_UKON_BATTLE_YOUYOU_RESCUE`：峡谷战中，奥修特尔保护御临风，解放水属性假面力量并以伏龙梅迎战黑泥敌人。
- `CLAIM_OSHUTORU_RELATIONSHIPS` → `SPLIT` → `TIMELINE_OSHUTORU_P1_007_UKON_BROTHERHOOD_CONTACT`、`TIMELINE_OSHUTORU_P1_009_BORDER_TRUTH_AND_PURSUIT_MISSION`、`RELATIONSHIP_NPC_HAKU_CLAIM_OSHUTORU_RELATIONSHIPS_NPC_HAKU_1`、`RELATIONSHIP_NPC_KUON_CLAIM_OSHUTORU_RELATIONSHIPS_NPC_KUON_2`、`RELATIONSHIP_NPC_MU_SHAOAI_CLAIM_OSHUTORU_RELATIONSHIPS_NPC_MU_SHAOAI_3`：奥修特尔收留哈克与久远进入其麾下；以右近身份接收御临风的边关报告、识别达卡斯威胁，并称慕少艾为朋友。
- `CLAIM_OSHUTORU_LATE_COMMAND` → `SPLIT` → `TIMELINE_OSHUTORU_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`、`TIMELINE_OSHUTORU_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING`、`KNOWLEDGE_CLAIM_OSHUTORU_LATE_COMMAND_EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_1`、`KNOWLEDGE_CLAIM_OSHUTORU_LATE_COMMAND_EVENT_P2_029_DEATHWING_BATTLEFIELD_AND_SEAL_WARNING_2`：龙族任务中御临风所在单位被记为奥修特尔直属；红月战事后报告称奥修特尔与武赖所在战线遭袭并失去通讯。
- `CLAIM_OSHUTORU_DUTY` → `RETAINED_AS_PERSONA` → `PERSONA_OSHUTORU_DUTY`：人物资料把奥修特尔描述为清廉正直、责任心极强。
- `CLAIM_OSHUTORU_REFERENCE_IDENTITY` → `RETAINED_AS_PERSONA` → `PERSONA_OSHUTORU_REFERENCE_IDENTITY`：人物参考把奥修特尔明确写为富有正义感的年轻剑士。
- `RELATIONSHIP_OSHUTORU_HAKU` → `MOVED_TO_RELATIONSHIP` → `RELATIONSHIP_OSHUTORU_HAKU`：commander and subordinate
- `CLAIM_OSHUTORU_RELATIONSHIP` → `SPLIT` → `BACKGROUND_CLAIM_OSHUTORU_RELATIONSHIP_1`、`RELATIONSHIP_NPC_HAKU_CLAIM_OSHUTORU_RELATIONSHIP_NPC_HAKU`：赏识哈克的智谋并邀请他成为部下。
- `CONSTRAINT_OSHUTORU_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_OSHUTORU_EVIDENCE_BOUNDARY`：不得以单次行为、职业、能力或身份推断稳定人格、私人动机、未来目标或场景必然出席。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_OSHUTORU.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_OSHUTORU.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_OSHUTORU.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
