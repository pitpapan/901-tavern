# NPC_WILLIAM Source Coverage

## Character / Profile

- Character: 威廉
- Profile ID: `NPC_WILLIAM`
- Profile depth: `compact`
- Source phase: `phase3c`
- Effective candidate: `work/phase3d_recall/repaired_candidates/NPC_WILLIAM.json`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_c.md`
- Post-repair verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 3

## Previously Used Sources

- `TRPG outputs/extracted-first/22/posts.md`
- `TRPG outputs/extracted-first/28/posts.md`
- `TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md`
- `current_state.md:D3 state check`
- `extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）`
- `extracted-first/28/posts.md:威廉参与诅咒转移法阵（lines 266-377）`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md:威廉的酒屋及其与御临风的持续接触（lines 93-134, 419-448）`
- `output/worldbook_source.jsonl#CHARACTER_WILLIAM`
- `work/phase3c/evidence/NPC_WILLIAM_evidence.md`

## Additional Sources Discovered

- `../设定 人物/人物卡资料集_检索版.md`
- `extracted-first/23/posts.md`
- `extracted-first/24/posts.md`
- `extracted-first/25/posts.md`
- `extracted-first/26/posts.md`
- `extracted-first/27/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md`
- `../战报/901第一部分_全页源文顺读版战报/00_顺读场景卡.md`
- `../战报/901第一部分_全页源文顺读版战报/02_源记录事件台账.md`
- `../战报/901第一部分_全页源文顺读版战报/03_剧情分段目录.md`
- `../战报/901第一部分_全页源文顺读版战报/11_皇宫朝见与审判前夜.md`
- `../战报/901第一部分_全页源文顺读版战报/12_魔物之盒_耶各诅咒与尾声.md`
- `../战报/901第一部分_全页源文顺读版战报/99_遗漏反查报告.md`

## Major Narrative Stages

### Canonical Worldbook summary

- Source: `output/worldbook_source.jsonl`
- Coverage outcome: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.

### Early Campaign / first campaign segment

- Source: `../战报/901第一部分_全页源文顺读版战报/00_顺读场景卡.md`
- Source: `../战报/901第一部分_全页源文顺读版战报/02_源记录事件台账.md`
- Source: `../战报/901第一部分_全页源文顺读版战报/03_剧情分段目录.md`
- Source: `../战报/901第一部分_全页源文顺读版战报/11_皇宫朝见与审判前夜.md`
- Source: `../战报/901第一部分_全页源文顺读版战报/12_魔物之盒_耶各诅咒与尾声.md`
- Source: `../战报/901第一部分_全页源文顺读版战报/99_遗漏反查报告.md`
- Source: `extracted-first/22/posts.md`
- Source: `extracted-first/23/posts.md`
- Source: `extracted-first/24/posts.md`
- Source: `extracted-first/25/posts.md`
- Source: `extracted-first/26/posts.md`
- Source: `extracted-first/27/posts.md`
- Source: `extracted-first/28/posts.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

### Middle Campaign / second campaign segment

- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

### Setting / character-reference background

- Source: `../设定 人物/人物卡资料集_检索版.md`
- Coverage outcome: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.

## Claim-Specific Character Timeline

| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |
|---|---|---|---|---|---|
| Early Campaign / first campaign segment | `extracted-first/22/posts.md:369-375` | 他在与御临风初次交涉时自我介绍为‘威廉信长’。 | 角色亲口提供的全名。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[2]` / `CLAIM_WILLIAM_FULL_NAME` | PROFILED |
| Early Campaign / first campaign segment | `extracted-first/28/posts.md:威廉参与诅咒转移法阵（lines 266-377）` | 威廉参与了把悠悠诅咒转移给御临风的法阵仪式。 | Atomic historical fact only; it does not establish a future behavior, motive, or allegiance. 仅保留来源直接支持的范围。 stability=stable | `$.identity.established_history[0]` / `CLAIM_WILLIAM_HISTORY_1` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md:威廉的酒屋及其与御临风的持续接触（lines 93-134, 419-448）` | 威廉在帝都经营酒屋。 | Campaign-specific public identity only; outside-franchise completion is excluded. 仅保留来源直接支持的范围。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_WILLIAM_HISTORY_2` | PROFILED |
| Early Campaign / first campaign segment | `extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）` | 威廉曾在帝都施术帮助御临风恢复感情与边关记忆。 | Atomic historical fact only; it does not establish a profession, permanent role, motive, or allegiance. 仅保留来源直接支持的范围。 stability=stable | `$.identity.established_history[1]` / `CLAIM_WILLIAM_IDENTITY` | PROFILED |
| Early Campaign / first campaign segment | `extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）` | life_status=unknown; narrative_availability=inactive | Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. stability=conditional | `$.presence` / `STATUS_NPC_WILLIAM_PRESENCE` | PROFILED |

## Matched Source File Dispositions

- [SEEN_NOT_PROMOTED] `../设定 人物/人物卡资料集_检索版.md` — reviewed setting match; remaining text is duplicate, scene-irrelevant, or outside the character-continuity scope
- [PROFILED] `extracted-first/22/posts.md` — supports `CLAIM_WILLIAM_FULL_NAME`, `CLAIM_WILLIAM_IDENTITY`, `STATUS_NPC_WILLIAM_PRESENCE`
- [SEEN_NOT_PROMOTED] `extracted-first/23/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-first/24/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-first/25/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-first/26/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-first/27/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [PROFILED] `extracted-first/28/posts.md` — supports `CLAIM_WILLIAM_HISTORY_1`
- [PROFILED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md` — supports `CLAIM_WILLIAM_HISTORY_2`
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `../战报/901第一部分_全页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第一部分_全页源文顺读版战报/02_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第一部分_全页源文顺读版战报/03_剧情分段目录.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第一部分_全页源文顺读版战报/11_皇宫朝见与审判前夜.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第一部分_全页源文顺读版战报/12_魔物之盒_耶各诅咒与尾声.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第一部分_全页源文顺读版战报/99_遗漏反查报告.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [ROUTED_ELSEWHERE] `output/worldbook_source.jsonl` — The Canonical Worldbook remains authoritative for persistent entity facts.

## Significant Source-Backed Items

### PROFILED

- `CLAIM_WILLIAM_FULL_NAME` — 他在与御临风初次交涉时自我介绍为‘威廉信长’。 Sources: `extracted-first/22/posts.md:369-375`
- `CLAIM_WILLIAM_HISTORY_1` — 威廉参与了把悠悠诅咒转移给御临风的法阵仪式。 Sources: `extracted-first/28/posts.md:威廉参与诅咒转移法阵（lines 266-377）`
- `CLAIM_WILLIAM_HISTORY_2` — 威廉在帝都经营酒屋。 Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md:威廉的酒屋及其与御临风的持续接触（lines 93-134, 419-448）`
- `CLAIM_WILLIAM_IDENTITY` — 威廉曾在帝都施术帮助御临风恢复感情与边关记忆。 Sources: `extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）`
- `STATUS_NPC_WILLIAM_PRESENCE` — life_status=unknown; narrative_availability=inactive Sources: `extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）`

### ROUTED_ELSEWHERE

- Persistent entity facts → `output/worldbook_source.jsonl#CHARACTER_WILLIAM`; profile carries only continuity-relevant detail.

### SEEN_NOT_PROMOTED

- `../设定 人物/人物卡资料集_检索版.md` — reviewed setting match; remaining text is duplicate, scene-irrelevant, or outside the character-continuity scope.
- `extracted-first/23/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-first/24/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-first/25/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-first/26/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-first/27/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 2/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 20/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 9/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `../战报/901第一部分_全页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第一部分_全页源文顺读版战报/02_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第一部分_全页源文顺读版战报/03_剧情分段目录.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第一部分_全页源文顺读版战报/11_皇宫朝见与审判前夜.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第一部分_全页源文顺读版战报/12_魔物之盒_耶各诅咒与尾声.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第一部分_全页源文顺读版战报/99_遗漏反查报告.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.

### MISSING

- Resolved before completion: 自我介绍的全名威廉信长 → PROFILED in repaired candidate.
- MISSING remaining: 0

## Ability / Status Transitions

- Presence reviewed: life_status=`unknown`, narrative_availability=`inactive` — PROFILED.
- The required transition categories were checked; no additional durable source-backed transition was found beyond the effective profile.

## Classification Summary

- PROFILED: 5
- ROUTED_ELSEWHERE: 1
- SEEN_NOT_PROMOTED: 15
- MISSING found before repair: 1
- MISSING remaining: 0
- Forbidden fifth-state items: 0

## Classification Rules

- `PROFILED`: adequately represented in the effective profile.
- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.
- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.
- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.
