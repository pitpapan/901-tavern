# Phase 3D Preflight

## Boundary

Phase 3D begins with no explicit human approval for the 36 profile patches. The permitted stop state for this run is `READY_FOR_HUMAN_APPROVAL`; formal integration is not authorized.

## Frozen Input Population

- 35 NPC profile candidates
- 1 PC continuity profile candidate (`PC_YU_LINFENG`)
- 36 evidence packets
- 36 draft/add patches
- 134 ProfileClaims
- 21 relationship records
- 5 epistemic items
- 3 goal records
- 83 evidence-gap statements

## Integrity Freeze

- Hash algorithm: SHA-256
- Protected artifacts: 175
- Timestamps are not used as integrity evidence.
- Candidate, evidence, batch, review, Worldbook, Current State, schema, contract, and draft patch inputs are protected by content hash.

## Review Inventory

| profile_id | kind | source | depth | activation | layers | life | availability | claims | relations | knowledge | goals | gaps | patch |
|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| NPC_AINZ_OOAL_GOWN | npc | phase3c | full | full_when_active | original_campaign, transition | alive | normal | 4 | 0 | 0 | 0 | 2 | PATCH_4006 |
| NPC_CASSANDRA | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 4 | 0 | 0 | 0 | 2 | PATCH_4013 |
| NPC_CASSIUS_BRIGHT | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 5 | 1 | 0 | 0 | 2 | PATCH_4001 |
| NPC_DEATHWING | npc | phase3c | full | full_when_active | original_campaign, transition | unknown | restricted | 4 | 1 | 0 | 0 | 3 | PATCH_4011 |
| NPC_ELDER_XUE | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 2 | 1 | 0 | 0 | 2 | PATCH_4004 |
| NPC_ELLIE | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 2 | 0 | 0 | 0 | 2 | PATCH_4016 |
| NPC_EMPEROR | npc | phase3b | full | full_when_active | original_campaign, transition | alive | normal | 6 | 1 | 1 | 0 | 4 | PATCH_3003 |
| NPC_GREMLIN | npc | phase3c | compact | compact_when_supporting | original_campaign | deceased | historical_only | 4 | 0 | 0 | 0 | 2 | PATCH_4024 |
| NPC_HAKU | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 4 | 1 | 0 | 0 | 2 | PATCH_4002 |
| NPC_HONDA_KAI_FERGUS | npc | phase3c | compact | compact_when_supporting | original_campaign, transition | alive | inactive | 4 | 1 | 0 | 0 | 2 | PATCH_4020 |
| NPC_JERGAL | npc | phase3c | full | full_when_active | original_campaign | unknown | restricted | 2 | 0 | 0 | 0 | 2 | PATCH_4014 |
| NPC_JEWEL_ELDER | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 2 | 0 | 0 | 0 | 2 | PATCH_4028 |
| NPC_JIANG_ZIYOU | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 4 | 1 | 0 | 0 | 2 | PATCH_4005 |
| NPC_KENDA_KAI_FERGUS | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 4 | 1 | 0 | 0 | 2 | PATCH_4012 |
| NPC_KUON | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 2 | 1 | 0 | 0 | 2 | PATCH_4017 |
| NPC_LEI_GUANG | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 2 | 0 | 0 | 0 | 2 | PATCH_4019 |
| NPC_LINGCHI | npc | phase3c | compact | compact_when_supporting | original_campaign | deceased | historical_only | 3 | 0 | 0 | 0 | 2 | PATCH_4026 |
| NPC_LULUTIYE | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 3 | 1 | 0 | 0 | 2 | PATCH_4023 |
| NPC_MU_SHAOAI | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 6 | 1 | 0 | 0 | 2 | PATCH_4009 |
| NPC_MU_TOU | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 4 | 0 | 0 | 0 | 2 | PATCH_4018 |
| NPC_NOSURI | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 2 | 0 | 0 | 0 | 2 | PATCH_4025 |
| NPC_OSHIRA | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 1 | 0 | 0 | 0 | 2 | PATCH_4021 |
| NPC_OSHUTORU | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 5 | 1 | 0 | 0 | 2 | PATCH_4008 |
| NPC_REN_FANZHEN | npc | phase3c | compact | compact_when_supporting | special_interlude | unknown | special_interlude_only | 1 | 0 | 0 | 0 | 2 | PATCH_4029 |
| NPC_SERTANT_LU_YOURLAN | npc | phase3c | minimal | worldbook_until_promoted | original_campaign, transition | alive | inactive | 4 | 0 | 0 | 0 | 2 | PATCH_4031 |
| NPC_TOLKIEN | npc | phase3b | minimal | worldbook_until_promoted | original_campaign | unknown | inactive | 4 | 1 | 0 | 0 | 4 | PATCH_3004 |
| NPC_WHITE_MAGICIAN | npc | phase3b | full | full_when_active | original_campaign, transition | alive | normal | 8 | 1 | 2 | 2 | 4 | PATCH_3002 |
| NPC_WILLIAM | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 3 | 0 | 0 | 0 | 2 | PATCH_4027 |
| NPC_WOSIS | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 3 | 1 | 1 | 0 | 2 | PATCH_4010 |
| NPC_WURAI | npc | phase3c | compact | compact_when_supporting | original_campaign | unknown | inactive | 2 | 0 | 0 | 0 | 2 | PATCH_4022 |
| NPC_XIERLUN_VON_GILCODE | npc | phase3c | full | full_when_active | original_campaign | alive | inactive | 4 | 1 | 0 | 0 | 2 | PATCH_4007 |
| NPC_YOMI_ISAYAMA | npc | phase3c | full | full_when_active | original_campaign | unknown | inactive | 3 | 1 | 0 | 0 | 2 | PATCH_4003 |
| NPC_YOUYOU | npc | phase3b | full | full_when_active | original_campaign, transition | alive | normal | 7 | 1 | 0 | 0 | 4 | PATCH_3001 |
| NPC_ZHENZI | npc | phase3c | full | full_when_active | original_campaign | deceased | historical_only | 5 | 1 | 0 | 0 | 2 | PATCH_4015 |
| NPC_ZHOU_ZHENG | npc | phase3c | compact | compact_when_supporting | special_interlude | unknown | special_interlude_only | 1 | 0 | 0 | 0 | 2 | PATCH_4030 |
| PC_YU_LINFENG | pc_continuity | phase3b | full | full_when_active | original_campaign, transition | alive | normal | 10 | 2 | 1 | 1 | 4 | PATCH_3005 |

## Preflight Result

Population and source-path discovery completed deterministically. All patches remain draft/add and contain no approval or application metadata. Semantic review has not yet granted human approval, and no formal database may be created in this state.
