# NPC_AINZ_OOAL_GOWN Source Coverage

## Character / Profile

- Character: 安兹·乌尔·恭
- Profile ID: `NPC_AINZ_OOAL_GOWN`
- Profile depth: `full`
- Source phase: `phase3c`
- Effective candidate: `work/phase3d_recall/repaired_candidates/NPC_AINZ_OOAL_GOWN.json`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_a.md`
- Post-repair verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 3

## Previously Used Sources

- `TRPG outputs/current_state.md`
- `TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md`
- `TRPG outputs/extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md`
- `current_state.md:D3 state check`
- `current_state.md:白色魔法使、安兹与当前未决关系（lines 77-89）`
- `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md:lines 59-223`
- `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:安兹参与战役收束并与白魔对峙（lines 324-410）`
- `output/worldbook_source.jsonl#CHARACTER_AINZ_OOAL_GOWN`
- `work/phase3c/evidence/NPC_AINZ_OOAL_GOWN_evidence.md`
- `设定 人物/人物卡资料集_叙事检索版.md`
- `设定 人物/人物卡资料集_叙事检索版.md:安兹·乌尔·恭（lines 138-152）`

## Additional Sources Discovered

- `../设定 人物/人物卡资料集_检索版.md`
- `../设定 人物/妄想大陆设定集_检索版.md`
- `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md`
- `../战报/901第三部分_全页源文顺读版战报/11_谢尔伦战线与卡珊德拉交易.md`
- `../战报/901第三部分_全页源文顺读版战报/12_安兹外交与命运分流.md`
- `../战报/901第三部分_全页源文顺读版战报/14_白魔退场与天命理论.md`

## Major Narrative Stages

### Canonical Worldbook summary

- Source: `output/worldbook_source.jsonl`
- Coverage outcome: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.

### Late Campaign / Dragon Sanctuary and Deathwing segment

- Source: `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/11_谢尔伦战线与卡珊德拉交易.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/12_安兹外交与命运分流.md`
- Source: `../战报/901第三部分_全页源文顺读版战报/14_白魔退场与天命理论.md`
- Source: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md`
- Source: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

### Setting / character-reference background

- Source: `../设定 人物/人物卡资料集_叙事检索版.md`
- Source: `../设定 人物/人物卡资料集_检索版.md`
- Source: `../设定 人物/妄想大陆设定集_检索版.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

## Claim-Specific Character Timeline

| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |
|---|---|---|---|---|---|
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md:14-140` | 卡珊德拉用安兹的卷轴把御临风带到安兹面前并作为中介介绍；安兹询问回报，并在提供协助后提出与帝会面的设想。 | 龙族秘境战期间的谈判。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[2]` / `CLAIM_AINZ_CASSANDRA_NEGOTIATION` | PROFILED |
| Setting / character-reference background | `设定 人物/妄想大陆设定集_检索版.md:56-59,136-142` | 战役设定把安兹记为纳萨力克的幸存统治者；其明示优先事项围绕纳萨力克的利益。 | Campaign 内的组织身份与公开利益边界。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[1]` / `CLAIM_AINZ_NAZARICK_ROLE` | PROFILED |
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:安兹参与战役收束并与白魔对峙（lines 324-410）` | 战役收束时，安兹公开宣称赤炎龙王与元素龙王处于其庇护之下。 | Atomic historical fact only; it does not establish a future behavior, motive, or allegiance. 仅保留来源直接支持的范围。 stability=stable | `$.identity.established_history[0]` / `CLAIM_AINZ_OOAL_GOWN_HISTORY_1` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:安兹·乌尔·恭（lines 138-152）` | 安兹·乌尔·恭是以骷髅形态活动的不死生物魔法咏唱者。 | Only the Campaign-specific identity is retained; outside-franchise completion is excluded. 仅保留来源直接支持的范围。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_AINZ_OOAL_GOWN_IDENTITY` | PROFILED |
| Late Campaign / Dragon Sanctuary and Deathwing segment | `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md:lines 59-223` | 在御临风提出请求后，安兹实际转移并收治龙族伤员、牵制死亡之翼。 | 只限龙族秘境干预，不推出长期联盟。 仅保留来源直接支持的范围。 stability=observed_only | `$.decision_patterns[0]` / `CLAIM_AINZ_OOAL_GOWN_SANCTUARY_INTERVENTION` | PROFILED |
| D0 and Transition D1-D3 anchor | `current_state.md:白色魔法使、安兹与当前未决关系（lines 77-89）` | life_status=alive; narrative_availability=normal | Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. stability=conditional | `$.presence` / `STATUS_NPC_AINZ_OOAL_GOWN_PRESENCE` | PROFILED |

## Matched Source File Dispositions

- [PROFILED] `../设定 人物/人物卡资料集_叙事检索版.md` — supports `CLAIM_AINZ_OOAL_GOWN_IDENTITY`
- [SEEN_NOT_PROMOTED] `../设定 人物/人物卡资料集_检索版.md` — reviewed setting match; remaining text is duplicate, scene-irrelevant, or outside the character-continuity scope
- [PROFILED] `../设定 人物/妄想大陆设定集_检索版.md` — supports `CLAIM_AINZ_NAZARICK_ROLE`
- [PROFILED] `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md` — supports `CLAIM_AINZ_CASSANDRA_NEGOTIATION`, `CLAIM_AINZ_OOAL_GOWN_SANCTUARY_INTERVENTION`
- [PROFILED] `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md` — supports `CLAIM_AINZ_OOAL_GOWN_HISTORY_1`
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/11_谢尔伦战线与卡珊德拉交易.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/12_安兹外交与命运分流.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第三部分_全页源文顺读版战报/14_白魔退场与天命理论.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [ROUTED_ELSEWHERE] `output/worldbook_source.jsonl` — The Canonical Worldbook remains authoritative for persistent entity facts.

## Significant Source-Backed Items

### PROFILED

- `CLAIM_AINZ_CASSANDRA_NEGOTIATION` — 卡珊德拉用安兹的卷轴把御临风带到安兹面前并作为中介介绍；安兹询问回报，并在提供协助后提出与帝会面的设想。 Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md:14-140`
- `CLAIM_AINZ_NAZARICK_ROLE` — 战役设定把安兹记为纳萨力克的幸存统治者；其明示优先事项围绕纳萨力克的利益。 Sources: `设定 人物/妄想大陆设定集_检索版.md:56-59,136-142`
- `CLAIM_AINZ_OOAL_GOWN_HISTORY_1` — 战役收束时，安兹公开宣称赤炎龙王与元素龙王处于其庇护之下。 Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:安兹参与战役收束并与白魔对峙（lines 324-410）`
- `CLAIM_AINZ_OOAL_GOWN_IDENTITY` — 安兹·乌尔·恭是以骷髅形态活动的不死生物魔法咏唱者。 Sources: `设定 人物/人物卡资料集_叙事检索版.md:安兹·乌尔·恭（lines 138-152）`
- `CLAIM_AINZ_OOAL_GOWN_SANCTUARY_INTERVENTION` — 在御临风提出请求后，安兹实际转移并收治龙族伤员、牵制死亡之翼。 Sources: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.md:lines 59-223`
- `STATUS_NPC_AINZ_OOAL_GOWN_PRESENCE` — life_status=alive; narrative_availability=normal Sources: `current_state.md:白色魔法使、安兹与当前未决关系（lines 77-89）`

### ROUTED_ELSEWHERE

- Persistent entity facts → `output/worldbook_source.jsonl#CHARACTER_AINZ_OOAL_GOWN`; profile carries only continuity-relevant detail.

### SEEN_NOT_PROMOTED

- `../设定 人物/人物卡资料集_检索版.md` — reviewed setting match; remaining text is duplicate, scene-irrelevant, or outside the character-continuity scope.
- `../战报/901第三部分_全页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/11_谢尔伦战线与卡珊德拉交易.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/12_安兹外交与命运分流.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第三部分_全页源文顺读版战报/14_白魔退场与天命理论.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.

### MISSING

- Resolved before completion: 纳萨力克领导与利益边界 → PROFILED in repaired candidate.
- Resolved before completion: 与卡珊德拉的中介关系及会见帝的提议 → PROFILED in repaired candidate.
- MISSING remaining: 0

## Ability / Status Transitions

- Presence reviewed: life_status=`alive`, narrative_availability=`normal` — PROFILED.
- The required transition categories were checked; no additional durable source-backed transition was found beyond the effective profile.

## Classification Summary

- PROFILED: 6
- ROUTED_ELSEWHERE: 1
- SEEN_NOT_PROMOTED: 5
- MISSING found before repair: 2
- MISSING remaining: 0
- Forbidden fifth-state items: 0

## Classification Rules

- `PROFILED`: adequately represented in the effective profile.
- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.
- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.
- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.
