# R1C-0 — 语义信任层审计

状态：**PASS**  
审计性质：只读诊断；没有修复任何人物档案，也没有进入 Phase 4。  
建议重建基线：**`SOURCE_EXTRACTION`**

## 1. 结论

本轮对 29 条端到端事实/相关性轨迹进行了逐层核验。原始帖子抽取、帖子顺序、正文内容和稳定 post ID 在抽样内均完整可读；没有发现足以要求重新抽取全部原始来源的损坏。最早的不可信层是 **R2A reviewed source semantics**：它既包含实质误读，也包含把 `whole_post` 标为已审阅、却没有把帖内关键人物事实写入事件语义的系统性遗漏。

因此不能以 R2A、R2B、Phase 3、R2C 或可读审批层作为新一轮重建的语义底座。建议保留现有 source extraction 与 source-chunk ledger，回到 **`SOURCE_EXTRACTION`**，重新审阅每个 source chunk 的原子语义，然后重建 R2A 及所有人物下游层。

R2A chronology 与 R2B 的 1:1 派生并不是本轮观察到的首错点：抽样中的错误在 reviewed event/semantic decision 已经存在；chronology 和 R2B 只是继续传播。故本轮 `r2a_chronology` 首错计数为 0，不表示 chronology 内容可信。

## 2. 审计规模与首错分布

- 端到端轨迹：29
- 来源核实：23
- 人工复核假设：1
- 未支持或仍未解决：5
- source extraction 首错：0
- R2A semantic review 首错：14
- R2A chronology 首错：0
- Phase 3 character extraction 首错：3
- R2C 首错：5
- readable projection 首错：0
- 没有发现管线错误、但保留人工不确定边界或作为控制项：7

完整逐层数据位于 `work/remediation/r1c0/semantic_trust_matrix.jsonl`；每层均使用 `CORRECT / INCORRECT / MISSING / NOT_APPLICABLE`。

## 3. 命运支流专项审计

原帖 #188 同时发生两件事：悠悠掌心留下淡乳白色光芒；信息如河水进入御临风意识，使他看见两条巨大可能支流。第一条是击败死亡之翼、白魔随后取得魔宝石并毁掉已经撤空的秘境；第二条是先囚住白魔、但死亡之翼在盲眼黑龙与古神帮助下击溃帝国军。原文随后明确说悠悠**本想指引**御临风走第一条，并保留御临风自由抉择。

#189 中御临风没有说“我选择第一条”。他识别盲眼黑龙是关键，要求本多说明取出/毁掉魔宝石的方法，并重新筹划。#191 中他明确要毁掉秘境，同时仍把击败死亡之翼列为当务之急并追索盲眼黑龙。这些是后续计划动作，不等于在 #188/#189 当场明确选择了第一条支流。最终确实击败死亡之翼且白魔取走宝石，也不能反向证明当时已经选择了第一条。

错误第一次出现于 `work/phase3d_r2/reviewed_inputs/events_part3.jsonl` 的 `EVENT_P3_008_FATE_BRANCH_SELECTION`：其摘要写成“御临风选择第一条并准备毁灭秘境”。这是 **preferred branch → selected branch** 的语义升级。R2A chronology、R2B、Phase 3、R2C 和中文审批材料随后稳定传播同一错误。

人工反馈中的“御临风选择了第三条路”有较强计划行为支持，但原帖没有找到同样明确的“我选择第三条”句子；因此本轮不把该措辞升级为 Canon。人工反馈中“她传的是乳白力量”只说对了一半：乳白保护力量确实存在，信息/可能未来的传输也同样明确发生。

## 4. hub event：御临风遇刺后的反应链

原始场景至少包含以下人物专属后果：

- 御临风失去听觉、视觉并昏倒；手中牌冒黑烟后化为灰烬。
- 悠悠立即赶到并极度担心。
- 龙王制止他人贸然触碰。
- 赫伯特检查并判断暂无即时生命危险，认为更像特异能力，建议详细检查。
- 黄泉质疑龙族安保，龙王与群龙一时无言。
- 罗伯以帝国使者身份提出帝国方参与检查。
- 本多同意赫伯特协助并让龙族着手调查。
- 瑟坦特在随后场景正式自报元素龙王身份，握手并把前日事件称作“龙族的失态”。
- 暗场明确给出卡珊德拉供物、道歉、预言与建议排除风险的有限参与证据。

R2A 的 `EVENT_P2_021` 只保留受袭、典礼中断和共同调查的粗粒度结果；它没有逐角色 reaction、stance、knowledge、first appearance 与 participant attribution。首错在 reviewed source decision/R2A semantic record，而不是后续中文渲染。

## 5. 跨角色证言

### 帝

雪老原话把帝描述为教会人们开垦、种植、管理土地、传授武技并撰写魔法的文明奠基者；另有帖子称帝统治数千年。两个事实来自不同叙述位置，不能统一伪装成“雪老一句话证明全部”。更严重的是，包含雪老证言的 P1 #778 被 chunk decision 路由到 `EVENT_INTERLUDE_003_EIGHT_DRAGONS_VAULT_REWARDS`；语义从 R2A 起完全丢失。

### 死亡之翼

奥希拉先声明“我也只是听说”，随后讲述死亡之翼出生获先祖和元素精灵祝福、率龙族征战、使龙族成为妄想山脉最强种族、晚年欲望扩大并研究邪法、黑龙失控、其他族长联合击败黑龙以及龙王制建立。R2A 正确把它标为奥希拉 testimony，并把路由目标写成 `DEATHWING_BACKGROUND_AUDIT`；但记录的 `character_ref` 仍是说话者奥希拉。Phase 3 没有把这份被描述历史投射到死亡之翼档案。

这说明存在一类系统性失败：**speaker/actor 有索引，semantic subject 没有结构化索引**。修复时应同时保留 speaker、subject 和 epistemic status，而不能把证言升级为客观古史。

人工提出的“统一魔兽山脉”超过原文（原文只说龙族成为最强种族）；“古神腐化死亡之翼”目前只见角色推理、理论和可能未来；两者均未进入 verified fact。

## 6. transition / current-state 审计

- **肯达**：谢尔伦明确报告其死亡并说明死亡发生于传递背叛消息。该帖被分给泰蕾斯古史事件却未抽取；Phase 3D-R 后来独立补回。R2C 又错误借用 P3_003 作为承载事件，导致可读层出现整段与肯达无关的泰蕾斯剧情。
- **雪老**：退休已由来源、Phase 3D-R、R2C 与可读档案记录；人工意见“完全错误”不适用于退休事实本身。真正缺陷是关系覆盖过窄。D3 精确位于帝都养老仍缺 Current State 级证据，不能把历史上在帝都活动自动升级为当前精确位置。
- **艾利**：手部冻伤与恢复能力/意图有明文，实际完成治愈没有明文。本轮保留“是否持续未知”；人工记忆作为待核验假设。
- **布莱特**：被捕、面容死亡、盲眼幼龙出现都有来源；“盲眼幼龙就是布莱特转化而成”只在御临风疑问中出现，身份连续性仍未确认。

## 7. R2C 人物相关性与 fan-out

五个抽查档案均可复现同一实现路径：`prepare_phase3d_r2c_packages.py::timeline_item()` 一旦事件被 direct index 或 `indirect_events` 选中，就把完整 `event_summary` 放入 `character_specific_summary`；同时又把事件的全部 character/relationship/ability/knowledge consequences 合并为人物后果，而不是只选该角色相关项。

结果是：

- 本多得到 P3_003、P3_009 等“间接关键”整段剧情；
- 布莱特的终局被错挂在 P3_002 秘境入口整段摘要；
- 肯达的死亡报告被错挂在 P3_003 泰蕾斯整段摘要；
- 露露缇耶得到 P2_009 与 P3_004 的他人剧情；
- 奥希拉得到 P3_003/P3_010 的宽摘要，而其真正相关的是更窄的受控状态与后果。

因此首错层是 R2C package projection。中文 renderer 只是忠实暴露污染，并不是独立注入无关内容。不能把 source-chunk 同现、宽事件 participant、间接 continuity rule 或一个旧 claim 的 event_ref 当成人物相关性的充分条件。

## 8. 逐层矩阵（人类摘要）

| fact_id | 人物 | 原始来源 | reviewed decision | R2A | Phase 3 | R2C | 可读层 | 最早失败层 | 失败类 |
|---|---|---|---|---|---|---|---|---|---|
| `FATE_BRANCH_TRANSMISSION_AND_DECISION_BOUNDARY` | PC_YU_LINFENG, NPC_YOUYOU | 正确 | 错误 | 错误 | 错误 | 错误 | 错误 | `REVIEWED_SOURCE_DECISION` | `preferred_branch_promoted_to_selected_branch` |
| `CASSIUS_CAPTURE_BY_GREMLIN` | NPC_CASSIUS_BRIGHT | 正确 | 错误 | 缺失 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `whole_post_semantics_omitted` |
| `CASSIUS_FACE_DEATH_AND_FINAL_MESSAGE` | NPC_CASSIUS_BRIGHT | 正确 | 错误 | 缺失 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `hub_scene_semantics_omitted` |
| `CASSIUS_BLIND_DRAGON_IDENTITY_BOUNDARY` | NPC_CASSIUS_BRIGHT | 正确 | 错误 | 缺失 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `epistemic_boundary_omitted` |
| `CASSANDRA_ASSASSINATION_PARTICIPATION` | NPC_CASSANDRA, PC_YU_LINFENG | 正确 | 错误 | 缺失 | 错误 | 错误 | 错误 | `REVIEWED_SOURCE_DECISION` | `participant_attribution_omitted` |
| `CASSANDRA_PROPHECY_ABILITY_EVIDENCE` | NPC_CASSANDRA | 正确 | 错误 | 缺失 | 错误 | 错误 | 错误 | `REVIEWED_SOURCE_DECISION` | `ability_evidence_collapsed_into_uncertainty` |
| `DRAGON_KING_REACTIONS_AFTER_ASSASSINATION` | NPC_HONDA_KAI_FERGUS, NPC_SERTANT_LU_YOURLAN, PC_YU_LINFENG | 正确 | 错误 | 错误 | 缺失 | 缺失 | 缺失 | `REVIEWED_SOURCE_DECISION` | `hub_event_consequences_omitted` |
| `SERTANT_FIRST_FORMAL_APPEARANCE` | NPC_SERTANT_LU_YOURLAN | 正确 | 错误 | 缺失 | 缺失 | 缺失 | 缺失 | `REVIEWED_SOURCE_DECISION` | `first_appearance_semantics_omitted` |
| `KENDA_REPORTED_DEATH` | NPC_KENDA_KAI_FERGUS | 正确 | 错误 | 缺失 | 正确 | 错误 | 错误 | `REVIEWED_SOURCE_DECISION` | `transition_report_omitted_and_wrong_event_reused` |
| `XUE_YU_MENTOR_FRIEND_RELATIONSHIP` | NPC_ELDER_XUE, PC_YU_LINFENG | 正确 | 正确 | 正确 | 错误 | 错误 | 错误 | `PHASE3_CHARACTER_EXTRACTION` | `multi_event_relationship_undercoverage` |
| `XUE_RETIREMENT_CONFIRMED` | NPC_ELDER_XUE | 正确 | 错误 | 错误 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `final_state_confirmation_omitted` |
| `XUE_D3_CAPITAL_LOCATION_BOUNDARY` | NPC_ELDER_XUE | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_unresolved_human_hypothesis` |
| `ELLIE_FROSTBITE_HEALING_BOUNDARY` | NPC_ELLIE | 正确 | 错误 | 缺失 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `ability_status_transition_omitted` |
| `EMPEROR_LONG_RULE_AND_CIVILIZATIONAL_ROLE` | NPC_EMPEROR, NPC_ELDER_XUE | 正确 | 错误 | 缺失 | 缺失 | 缺失 | 缺失 | `REVIEWED_SOURCE_DECISION` | `speaker_subject_and_scene_routing_failure` |
| `DEATHWING_ELEMENTAL_BLESSING_TESTIMONY` | NPC_DEATHWING, NPC_OSHIRA | 正确 | 正确 | 正确 | 缺失 | 缺失 | 缺失 | `PHASE3_CHARACTER_EXTRACTION` | `cross_character_testimony_not_projected_to_subject` |
| `DEATHWING_MOUNTAIN_SUPREMACY_NOT_UNIFICATION` | NPC_DEATHWING, NPC_OSHIRA | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_unsupported_human_hypothesis` |
| `DEATHWING_OLD_GOD_CAUSATION_BOUNDARY` | NPC_DEATHWING, PC_YU_LINFENG | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_unsupported_human_hypothesis` |
| `DEATHWING_DEFEAT_BY_OTHER_CLAN_HEADS_TESTIMONY` | NPC_DEATHWING, NPC_OSHIRA | 正确 | 正确 | 正确 | 缺失 | 缺失 | 缺失 | `PHASE3_CHARACTER_EXTRACTION` | `cross_character_testimony_not_projected_to_subject` |
| `WHITE_MAGICIAN_GEM_UTOPIA_FAMILY_GOAL` | NPC_WHITE_MAGICIAN | 正确 | 错误 | 缺失 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `explicit_goal_omitted` |
| `WHITE_MAGICIAN_DAUGHTER_RESURRECTION_BOUNDARY` | NPC_WHITE_MAGICIAN | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_special_interlude_conflation_rejected` |
| `AINZ_DRAGON_KING_PROTECTION_DECLARATION_BOUNDARY` | NPC_AINZ_OOAL_GOWN | 正确 | 错误 | 缺失 | 正确 | 正确 | 正确 | `REVIEWED_SOURCE_DECISION` | `direct_action_omitted` |
| `CONTROL_TOLKIEN_EQUIPMENT_SUPPORT` | NPC_TOLKIEN | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_control` |
| `CONTROL_WURAI_EIGHT_PILLAR_AND_FIRE_RESPONSE` | NPC_WURAI | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_control` |
| `CONTROL_WILLIAM_CURSE_EXAMINATION_AND_TRANSFER` | NPC_WILLIAM | 正确 | 正确 | 正确 | 正确 | 正确 | 正确 | `NONE` | `none_control` |
| `R2C_RELEVANCE_HONDA` | NPC_HONDA_KAI_FERGUS | 正确 | 正确 | 正确 | 正确 | 错误 | 错误 | `R2C_PACKAGE_PROJECTION` | `broad_event_wholesale_summary_fanout` |
| `R2C_RELEVANCE_CASSIUS` | NPC_CASSIUS_BRIGHT | 正确 | 正确 | 正确 | 正确 | 错误 | 错误 | `R2C_PACKAGE_PROJECTION` | `broad_event_wholesale_summary_fanout` |
| `R2C_RELEVANCE_KENDA` | NPC_KENDA_KAI_FERGUS | 正确 | 正确 | 正确 | 正确 | 错误 | 错误 | `R2C_PACKAGE_PROJECTION` | `broad_event_wholesale_summary_fanout` |
| `R2C_RELEVANCE_LULUTIYE` | NPC_LULUTIYE | 正确 | 正确 | 正确 | 正确 | 错误 | 错误 | `R2C_PACKAGE_PROJECTION` | `broad_event_wholesale_summary_fanout` |
| `R2C_RELEVANCE_OSHIRA` | NPC_OSHIRA | 正确 | 正确 | 正确 | 正确 | 错误 | 错误 | `R2C_PACKAGE_PROJECTION` | `broad_event_wholesale_summary_fanout` |


## 9. 黄金语义回归集

`work/remediation/r1c0/golden_semantic_regressions.jsonl` 含 29 条与矩阵一一对应的 provisional regression records：

- `verified_source_fact`：23
- `human_review_hypothesis`：1
- `unsupported_or_unresolved`：5

该文件不是 Canon。它的作用是让下一阶段在重建前先冻结“来源到底支持什么、不能推出什么”。

## 10. 推荐重建范围

1. 保留 raw extraction、post IDs、source order 与 source-chunk ledger。
2. 重新审阅 R2A 的每个 `whole_post`：审阅完成必须意味着帖内每个高价值原子事实都有 disposition，而不只是帖子被分到某个大事件。
3. 为 speech/testimony 建立 `speaker`、`semantic_subject`、`epistemic_status` 三分结构。
4. 为 hub event 建立逐角色 consequence ledger，包括 reaction、knowledge、stance、first appearance 与 state transition。
5. 从修订后的 R2A 重建 chronology 和 R2B；不要手改 R2B。
6. 重建 Phase 3 character extraction，并以本黄金集做回归。
7. 重建 R2C 时禁止 whole-event summary fan-out；人物 timeline 必须由角色专属原子 consequence 组成。
8. 最后再生成中文 readable projection；保持 PC 控制、Special Interlude 隔离与 D3 未知边界。

## 11. 冻结与非目标

本任务没有修改 raw source、source extraction、R2A、R2B、Phase 3C/3D/3D-R、R2C production、schema、Canon、Worldbook、Current State 或 R1A authority。没有修复任何 profile，没有扩充人物人口，也没有进入 Phase 4。

## 12. 产物指纹

- matrix SHA-256：`14f888a26eff534fb901faa59cdcdbc30220c1564034dd3b5a417ccc6c9e120c`
- golden SHA-256：`5cf3129447b4b7f0fdcc6632f06fb0fbcfa3a4e218a2f7399cf1cc26d274b8fc`
- 生成器：`scripts/build_r1c0_semantic_trust_audit.py`
