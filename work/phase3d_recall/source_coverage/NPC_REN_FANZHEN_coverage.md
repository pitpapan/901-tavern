# NPC_REN_FANZHEN Source Coverage

## Character / Profile

- Character: 任帆真
- Profile ID: `NPC_REN_FANZHEN`
- Profile depth: `compact`
- Source phase: `phase3c`
- Effective candidate: `work/phase3d_recall/repaired_candidates/NPC_REN_FANZHEN.json`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_b.md`
- Post-repair verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 2

## Previously Used Sources

- `TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md`
- `current_state.md:D3 state check`
- `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:任帆真视角与特工背景（lines 872-890）`
- `output/worldbook_source.jsonl#CHARACTER_REN_FANZHEN`
- `work/phase3c/evidence/NPC_REN_FANZHEN_evidence.md`

## Additional Sources Discovered

- `../战报/901作者标记与故事评价.md`
- `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md`
- `../战报/901第三部分_全页源文顺读版战报/01_源记录事件台账.md`
- `../战报/901第三部分_全页源文顺读版战报/02_剧情分段目录.md`
- `../战报/901第三部分_全页源文顺读版战报/15_现代灵异梦境开端.md`
- `../战报/901第三部分_全页源文顺读版战报/99_遗漏反查报告.md`

## Major Narrative Stages

### Campaign report / navigation

- Source: `../战报/901作者标记与故事评价.md`
- Coverage outcome: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.

### Canonical Worldbook summary

- Source: `output/worldbook_source.jsonl`
- Coverage outcome: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.

### Late Campaign / Dragon Sanctuary and Deathwing segment

- Source: `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/01_源记录事件台账.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/02_剧情分段目录.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/15_现代灵异梦境开端.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/99_遗漏反查报告.md`
- Source: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

## Claim-Specific Character Timeline

| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |
|---|---|---|---|---|---|
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:任帆真视角与特工背景（lines 872-890）` | 任帆真是现代灵异特殊梦境中负责研讨会安保的国家特工。 | Only the Campaign-specific identity is retained; outside-franchise completion is excluded. 仅保留来源直接支持的范围。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_REN_FANZHEN_IDENTITY` | PROFILED |
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:872-876` | 特殊梦境中，任帆真的退休特工父亲私下留下异常物品并教他使用；叙述称父子似乎都倾向保密，父亲告诫他隐藏这些物品。任帆真知道基础异常规则，但此前没有处理过同类事件。 | Special Interlude 内的继承、训练与经验边界。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[0]` / `CLAIM_REN_PATERNAL_INHERITANCE` | PROFILED |
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:875-894` | 他以清洁工身份掩护校园会议安保工作，掌握与会者档案，但周正的受限细节不在其权限内。 | 未完成特殊梦境中的任务与知识权限。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[1]` / `CLAIM_REN_UNDERCOVER_CLEARANCE` | PROFILED |
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:任帆真视角与特工背景（lines 872-890）` | life_status=unknown; narrative_availability=special_interlude_only | Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. stability=conditional | `$.presence` / `STATUS_NPC_REN_FANZHEN_PRESENCE` | PROFILED |

## Matched Source File Dispositions

- [PROFILED] `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md` — supports `CLAIM_REN_FANZHEN_IDENTITY`, `CLAIM_REN_PATERNAL_INHERITANCE`, `CLAIM_REN_UNDERCOVER_CLEARANCE`, `STATUS_NPC_REN_FANZHEN_PRESENCE`
- [SEEN_NOT_PROMOTED] `../战报/901作者标记与故事评价.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/01_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/02_剧情分段目录.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/15_现代灵异梦境开端.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/99_遗漏反查报告.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [ROUTED_ELSEWHERE] `output/worldbook_source.jsonl` — The Canonical Worldbook remains authoritative for persistent entity facts.

## Significant Source-Backed Items

### PROFILED

- `CLAIM_REN_FANZHEN_IDENTITY` — 任帆真是现代灵异特殊梦境中负责研讨会安保的国家特工。 Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:任帆真视角与特工背景（lines 872-890）`
- `CLAIM_REN_PATERNAL_INHERITANCE` — 特殊梦境中，任帆真的退休特工父亲私下留下异常物品并教他使用；叙述称父子似乎都倾向保密，父亲告诫他隐藏这些物品。任帆真知道基础异常规则，但此前没有处理过同类事件。 Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:872-876`
- `CLAIM_REN_UNDERCOVER_CLEARANCE` — 他以清洁工身份掩护校园会议安保工作，掌握与会者档案，但周正的受限细节不在其权限内。 Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:875-894`
- `STATUS_NPC_REN_FANZHEN_PRESENCE` — life_status=unknown; narrative_availability=special_interlude_only Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:任帆真视角与特工背景（lines 872-890）`

### ROUTED_ELSEWHERE

- Persistent entity facts → `output/worldbook_source.jsonl#CHARACTER_REN_FANZHEN`; profile carries only continuity-relevant detail.

### SEEN_NOT_PROMOTED

- `../战报/901作者标记与故事评价.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/01_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/02_剧情分段目录.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/15_现代灵异梦境开端.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/99_遗漏反查报告.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.

### MISSING

- Resolved before completion: 父亲遗留物与受限训练 → PROFILED in repaired candidate.
- Resolved before completion: 清洁工掩护与受限档案权限 → PROFILED in repaired candidate.
- MISSING remaining: 0

## Ability / Status Transitions

- Presence reviewed: life_status=`unknown`, narrative_availability=`special_interlude_only` — PROFILED.
- special-interlude inherited objects and bounded prior experience — PROFILED after explicit transition review.

## Classification Summary

- PROFILED: 4
- ROUTED_ELSEWHERE: 1
- SEEN_NOT_PROMOTED: 6
- MISSING found before repair: 2
- MISSING remaining: 0
- Forbidden fifth-state items: 0

## Classification Rules

- `PROFILED`: adequately represented in the effective profile.
- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.
- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.
- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.
