# 凌迟

> 本文是 R2C provisional 人工审核投影，不构成 Canon、人物档案或补丁批准。

## 1. 身份

档案 ID：`NPC_LINGCHI`；状态：`existing`；类型：`npc`。

- 凌迟曾统一妄想山脉多支魔兽并发动全面侵攻。。  
  追踪：`IDENTITY_LINGCHI_IDENTITY`；来源：`设定 人物/妄想大陆设定集_检索版.md:魔兽条目中的凌迟上位、侵攻、达卡斯伪装与处斩（lines 39-44）`

## 2. 人物背景

- 峡谷收网时，达卡斯的凌迟身份暴露，凌迟承认局势失利并迎战两名八柱将。；证据层：人物背景。  
  追踪：`BACKGROUND_LINGCHI_HISTORY_1`；来源：`extracted-first/19/posts.md:峡谷收网中达卡斯的凌迟身份败露（lines 627-666）`
- 凌迟随后在宫中被公开处斩。；证据层：人物背景。  
  追踪：`BACKGROUND_LINGCHI_HISTORY_2`；来源：`extracted-first/28/posts.md:凌迟在宫中被处斩（lines 392-404）`
- 设定资料的魔兽条目记载，凌迟被魔兽抓拿后自愿化魔，并因机缘巧合继承了魔兽中传说的力量；他随后整合魔兽兵力并攻破边关。；证据层：人物背景。  
  追踪：`BACKGROUND_LINGCHI_MONSTER_TRANSFORMATION`；来源：`设定 人物/妄想大陆设定集_检索版.md:39-43`
- 同一设定集的悠悠条目另把被其母亲救下时的凌迟描述为‘被诅咒感染成半人半魔兽’。；证据层：人物背景。  
  追踪：`BACKGROUND_LINGCHI_CURSED_HALF_MONSTER_REFERENCE`；来源：`设定 人物/妄想大陆设定集_检索版.md:112-119`
- 凌迟以达卡斯身份向帝都提供虚假报告，并试图利用空间龙把兵力带入帝都；计划被揭露后，其部队在帝都附近被击败。设定同时把其追击线连到旧空间龙族惨案，但人物调查笔记仍对该旧案保留疑问。；证据层：人物背景。  
  追踪：`BACKGROUND_LINGCHI_DAKAS_OBJECTIVE`；来源：`设定 人物/妄想大陆设定集_检索版.md:43`、`extracted-first/6/posts.md:443-466`、`extracted-first/19/posts.md:640-666`、`设定 人物/人物卡资料集_检索版.md:618-624`
- 被俘后的审讯没有取得新情报，凌迟在处刑前已表现出认知受损；之后他被公开斩首。；证据层：人物背景。  
  追踪：`BACKGROUND_LINGCHI_PRE_EXECUTION_STATE`；来源：`extracted-first/27/posts.md:54-58`、`extracted-first/28/posts.md:392-404`

## 3. 人格、价值观、行为模式

人格证据稀疏：现有来源不足以安全形成稳定人格、价值观、说话方式或决策模式。

## 4. 动机

- 没有足够来源支持独立动机；不从参与事件或结果反推原因。

## 5. 目标

- 没有足够来源支持具体目标；历史行动不自动延续为当前目标。

## 6. 主要经历时间线

### P1-004 — 九雪医馆与达卡斯疑云

角色以“absent_but_affected”参与；御临风向军方报告边关陷落，但军方以达卡斯声称守住关卡为由拒绝；队伍转往九雪医馆，发现医馆被封、露露缇耶被捕。

角色作用：absent_but_affected。
人物后果：御临风在警讯被拒后感到愤怒和无力。；露露缇耶处于被捕状态。；队伍得知医馆被控与刺杀达卡斯有关。
未决边界：本事件没有另列未决问题。

追踪：event_ref `EVENT_P1_004_WARNING_REJECTED_CLINIC_SEALED`；story_order `P1-004`；Canon 层 `original_campaign`。
证据：`extracted-first/2/posts.jsonl post 816648`、`extracted-first/2/posts.jsonl post 816665`、`extracted-first/3/posts.jsonl post 816708`、`extracted-first/3/posts.jsonl post 816730`

### P1-005 — 九雪医馆与达卡斯疑云

角色以“commander”参与；队伍向大妈询问医馆与露露缇耶；达卡斯带兵包围，大妈用烟雾脱离，御临风以兄弟会线索求取信任，三人分散逃亡。

角色作用：commander。
人物后果：大妈与雪老/兄弟会的联系成为队伍求援线索。；队伍确认达卡斯对医馆线进行具体追捕。
未决边界：大妈的正式姓名在此阶段未确认。

追踪：event_ref `EVENT_P1_005_DAKAS_SURROUNDS_AUNT`；story_order `P1-005`；Canon 层 `original_campaign`。
证据：`extracted-first/3/posts.jsonl post 816731`、`extracted-first/3/posts.jsonl post 816803`、`extracted-first/3/posts.jsonl post 817134`、`extracted-first/3/posts.jsonl post 817164`

### P1-014 — 血与火后篇

角色以“commander”参与；达卡斯调动军队，布莱特与黄泉被卡泽追击；御临风等人与接应者会合，帝与八柱将的援军落场，凌迟伪装的达卡斯身份及计划败露。

角色作用：commander。
人物后果：御临风濒死时仍传出空间龙位置信息。；布莱特交出麻痹匕首，黄泉以纵火牵制。；队伍的侦察成为帝国收网的一部分，但不是收网唯一主体。；参与者确认达卡斯身份与凌迟计划存在欺骗。
未决边界：卡泽等早期敌方角色需要独立 retention，而不能因后期消失而省略。

追踪：event_ref `EVENT_P1_014_DAKAS_PLOT_EXPOSED`；story_order `P1-014`；Canon 层 `original_campaign`。
证据：`extracted-first/17/posts.jsonl post 844064`、`extracted-first/18/posts.jsonl post 844648`、`extracted-first/19/posts.jsonl post 845112`、`extracted-first/19/posts.jsonl post 845600`

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
- 禁止推断：凌迟已被处斩；达卡斯仅作为其已确认的历史伪装身份，不得写成当前身份。（`CONSTRAINT_LINGCHI_EVIDENCE_BOUNDARY`）

## 12. 与旧 Profile 相比的变化

- `CLAIM_LINGCHI_IDENTITY` → `MIGRATED` → `IDENTITY_LINGCHI_IDENTITY`：凌迟曾统一妄想山脉多支魔兽并发动全面侵攻。
- `CLAIM_LINGCHI_HISTORY_1` → `MOVED_TO_BACKGROUND` → `BACKGROUND_LINGCHI_HISTORY_1`：峡谷收网时，达卡斯的凌迟身份暴露，凌迟承认局势失利并迎战两名八柱将。
- `CLAIM_LINGCHI_HISTORY_2` → `MOVED_TO_BACKGROUND` → `BACKGROUND_LINGCHI_HISTORY_2`：凌迟随后在宫中被公开处斩。
- `CLAIM_LINGCHI_MONSTER_TRANSFORMATION` → `MOVED_TO_BACKGROUND` → `BACKGROUND_LINGCHI_MONSTER_TRANSFORMATION`：设定资料的魔兽条目记载，凌迟被魔兽抓拿后自愿化魔，并因机缘巧合继承了魔兽中传说的力量；他随后整合魔兽兵力并攻破边关。
- `CLAIM_LINGCHI_CURSED_HALF_MONSTER_REFERENCE` → `MOVED_TO_BACKGROUND` → `BACKGROUND_LINGCHI_CURSED_HALF_MONSTER_REFERENCE`：同一设定集的悠悠条目另把被其母亲救下时的凌迟描述为‘被诅咒感染成半人半魔兽’。
- `CLAIM_LINGCHI_DAKAS_OBJECTIVE` → `MOVED_TO_BACKGROUND` → `BACKGROUND_LINGCHI_DAKAS_OBJECTIVE`：凌迟以达卡斯身份向帝都提供虚假报告，并试图利用空间龙把兵力带入帝都；计划被揭露后，其部队在帝都附近被击败。设定同时把其追击线连到旧空间龙族惨案，但人物调查笔记仍对该旧案保留疑问。
- `CLAIM_LINGCHI_PRE_EXECUTION_STATE` → `MOVED_TO_BACKGROUND` → `BACKGROUND_LINGCHI_PRE_EXECUTION_STATE`：被俘后的审讯没有取得新情报，凌迟在处刑前已表现出认知受损；之后他被公开斩首。
- `CONSTRAINT_LINGCHI_EVIDENCE_BOUNDARY` → `MIGRATED` → `CONSTRAINT_LINGCHI_EVIDENCE_BOUNDARY`：凌迟已被处斩；达卡斯仅作为其已确认的历史伪装身份，不得写成当前身份。

## 13. 来源与追踪

- migration package：`work/phase3d_r2c/migration_packages/NPC_LINGCHI.json`
- candidate：`work/phase3d_r2c/candidates/by_profile/NPC_LINGCHI.json`
- source profile：`work/phase3d_recall/repaired_candidates/NPC_LINGCHI.json`
- 输入类别：`old_claims`、`direct_temporal_links`、`indirect_continuity_events`、`revelations`、`event_audits`、`retention_records`、`discoveries`、`d3_state`、`worldbook_references`
- schema：`2.0`；生成器：`scripts/build_phase3d_r2c.py`。
