# NPC_WURAI Source Coverage

## Character / Profile

- Character: 武赖
- Profile ID: `NPC_WURAI`
- Profile depth: `compact`
- Source phase: `phase3c`
- Effective candidate: `work/phase3d_recall/repaired_candidates/NPC_WURAI.json`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_c.md`
- Post-repair verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 2

## Previously Used Sources

- `TRPG outputs/extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md`
- `current_state.md:D3 state check`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.md:武赖抵达、火柱攻击与宗近交涉（lines 487-516）`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:八柱将身份及火柱造成的伤亡统计困难（lines 211-241）`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:武赖的八柱将身份与称号（lines 211-241）`
- `output/worldbook_source.jsonl#CHARACTER_WURAI`
- `work/phase3c/evidence/NPC_WURAI_evidence.md`

## Additional Sources Discovered

- `../设定 人物/妄想大陆设定集_检索版.md`
- `extracted-first/21/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md`
- `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md`
- `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md`
- `../战报/901第二部分_1-15页源文顺读版战报/06_代行者与法师塔惨案.md`

## Major Narrative Stages

### Canonical Worldbook summary

- Source: `output/worldbook_source.jsonl`
- Coverage outcome: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.

### Early Campaign / first campaign segment

- Source: `extracted-first/21/posts.md`
- Coverage outcome: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.

### Middle Campaign / second campaign segment

- Source: `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md`
- Source: `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md`
- Source: `../战报/901第二部分_1-15页源文顺读版战报/06_代行者与法师塔惨案.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

### Setting / character-reference background

- Source: `../设定 人物/妄想大陆设定集_检索版.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

## Claim-Specific Character Timeline

| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |
|---|---|---|---|---|---|
| Setting / character-reference background | `设定 人物/妄想大陆设定集_检索版.md:164-169` | 设定资料明确把武赖记为火神假面的持有者。 | 设定参考阶段的假面身份。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[1]` / `CLAIM_WURAI_FIRE_MASK` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:八柱将身份及火柱造成的伤亡统计困难（lines 211-241）` | 法师塔事件后，现场记录把造成火柱的攻击归于武赖，并称其为八柱将。 | Atomic historical fact only; it does not establish a future behavior, motive, or allegiance. 仅保留来源直接支持的范围。 stability=stable | `$.identity.established_history[0]` / `CLAIM_WURAI_HISTORY_1` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:武赖的八柱将身份与称号（lines 211-241）` | 武赖是帝国八柱将之一，并被称为帝国最强之矛。 | Only the Campaign-specific identity is retained; outside-franchise completion is excluded. 仅保留来源直接支持的范围。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_WURAI_IDENTITY` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.md:武赖抵达、火柱攻击与宗近交涉（lines 487-516）` | life_status=unknown; narrative_availability=inactive | Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. stability=conditional | `$.presence` / `STATUS_NPC_WURAI_PRESENCE` | PROFILED |

## Matched Source File Dispositions

- [PROFILED] `../设定 人物/妄想大陆设定集_检索版.md` — supports `CLAIM_WURAI_FIRE_MASK`
- [SEEN_NOT_PROMOTED] `extracted-first/21/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [PROFILED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.md` — supports `STATUS_NPC_WURAI_PRESENCE`
- [PROFILED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md` — supports `CLAIM_WURAI_HISTORY_1`, `CLAIM_WURAI_IDENTITY`
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/06_代行者与法师塔惨案.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [ROUTED_ELSEWHERE] `output/worldbook_source.jsonl` — The Canonical Worldbook remains authoritative for persistent entity facts.

## Significant Source-Backed Items

### PROFILED

- `CLAIM_WURAI_FIRE_MASK` — 设定资料明确把武赖记为火神假面的持有者。 Sources: `设定 人物/妄想大陆设定集_检索版.md:164-169`
- `CLAIM_WURAI_HISTORY_1` — 法师塔事件后，现场记录把造成火柱的攻击归于武赖，并称其为八柱将。 Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:八柱将身份及火柱造成的伤亡统计困难（lines 211-241）`
- `CLAIM_WURAI_IDENTITY` — 武赖是帝国八柱将之一，并被称为帝国最强之矛。 Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:武赖的八柱将身份与称号（lines 211-241）`
- `STATUS_NPC_WURAI_PRESENCE` — life_status=unknown; narrative_availability=inactive Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 6/posts.md:武赖抵达、火柱攻击与宗近交涉（lines 487-516）`

### ROUTED_ELSEWHERE

- Persistent entity facts → `output/worldbook_source.jsonl#CHARACTER_WURAI`; profile carries only continuity-relevant detail.

### SEEN_NOT_PROMOTED

- `extracted-first/21/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 16/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 17/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 24/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第二部分_1-15页源文顺读版战报/06_代行者与法师塔惨案.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.

### MISSING

- Resolved before completion: 火神面具持有者身份 → PROFILED in repaired candidate.
- MISSING remaining: 0

## Ability / Status Transitions

- Presence reviewed: life_status=`unknown`, narrative_availability=`inactive` — PROFILED.
- The required transition categories were checked; no additional durable source-backed transition was found beyond the effective profile.

## Classification Summary

- PROFILED: 4
- ROUTED_ELSEWHERE: 1
- SEEN_NOT_PROMOTED: 8
- MISSING found before repair: 1
- MISSING remaining: 0
- Forbidden fifth-state items: 0

## Classification Rules

- `PROFILED`: adequately represented in the effective profile.
- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.
- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.
- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.
