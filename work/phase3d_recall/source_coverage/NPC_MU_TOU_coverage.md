# NPC_MU_TOU Source Coverage

## Character / Profile

- Character: 沐透
- Profile ID: `NPC_MU_TOU`
- Profile depth: `compact`
- Source phase: `phase3c`
- Effective candidate: `work/phase3d_recall/repaired_candidates/NPC_MU_TOU.json`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_b.md`
- Post-repair verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 2

## Previously Used Sources

- `current_state.md:D3 state check`
- `output/worldbook_source.jsonl#CHARACTER_MU_TOU`
- `work/phase3c/evidence/NPC_MU_TOU_evidence.md`
- `设定 人物/人物卡资料集_叙事检索版.md`
- `设定 人物/人物卡资料集_叙事检索版.md:沐透`
- `设定 人物/人物卡资料集_叙事检索版.md:沐透（lines 87-110）`
- `设定 人物/妄想大陆设定集_检索版.md`
- `设定 人物/妄想大陆设定集_检索版.md:白色魔法使（lines 123-128）`

## Additional Sources Discovered

- `../设定 人物/人物卡资料集_检索版.md`
- `extracted-first/1/posts.md`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md`

## Major Narrative Stages

### Canonical Worldbook summary

- Source: `output/worldbook_source.jsonl`
- Coverage outcome: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.

### Early Campaign / first campaign segment

- Source: `extracted-first/1/posts.md`
- Coverage outcome: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.

### Middle Campaign / second campaign segment

- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md`
- Coverage outcome: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.

### Setting / character-reference background

- Source: `../设定 人物/人物卡资料集_叙事检索版.md`
- Source: `../设定 人物/人物卡资料集_检索版.md`
- Source: `../设定 人物/妄想大陆设定集_检索版.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

## Claim-Specific Character Timeline

| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |
|---|---|---|---|---|---|
| Setting / character-reference background | `设定 人物/妄想大陆设定集_检索版.md:白色魔法使（lines 123-128）` | 设定资料记录沐透协助白色魔法使逃离监狱塔，并从白魔处获得 Wizard 驱动器。 | Atomic historical fact only; it does not establish a future behavior, motive, or allegiance. 仅保留来源直接支持的范围。 stability=stable | `$.identity.established_history[0]` / `CLAIM_MU_TOU_HISTORY_1` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:沐透（lines 87-110）` | 人物资料把成为他人的希望记为沐透的行动方向。 | 行动方向不等同于对所有事件的内在动机解释。 仅保留来源直接支持的范围。 stability=conditional | `$.values[0]` / `CLAIM_MU_TOU_HOPE` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:沐透` | 沐透是十九岁的异乡魔法使，借助 Wizard 驱动器与指环变身。 | Only the Campaign-specific identity is retained; outside-franchise completion is excluded. 仅保留来源直接支持的范围。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_MU_TOU_IDENTITY` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:沐透（lines 87-110）` | 沐透使用较现代、常带轻松与吐槽感的口吻。 | 严肃场景不要求持续玩笑。 仅保留来源直接支持的范围。 stability=conditional | `$.speech_style[0]` / `CLAIM_MU_TOU_MODERN_REGISTER` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:87-110`; `设定 人物/人物卡资料集_检索版.md:869-890` | 人物参考记载沐透是十九岁的异界来客，在点击神秘对话框后跨越世界；参考把他写为随和、自由。 | 人物卡来源与明确人物定义。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[1]` / `CLAIM_MU_TOU_ORIGIN` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:87-110`; `设定 人物/人物卡资料集_检索版.md:869-890` | 人物参考把沐透明确写为随和、自由。 | 人物参考中的稳定但有限的人格定义。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.core_personality[0]` / `CLAIM_MU_TOU_REFERENCE_TRAITS` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_检索版.md:893-927`; `设定 人物/妄想大陆设定集_检索版.md:125-126` | 监狱塔危机中，沐透在自己的 Underworld 见到幻魔百首黄金龙；他在交易中释放白色魔法使，并获得 Wizard Driver 与戒指魔法。 | 幻魔接触与 Wizard 身份转变。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[2]` / `CLAIM_MU_TOU_WIZARD_TRANSITION` | PROFILED |
| Setting / character-reference background | `设定 人物/人物卡资料集_叙事检索版.md:沐透` | life_status=unknown; narrative_availability=inactive | Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. stability=conditional | `$.presence` / `STATUS_NPC_MU_TOU_PRESENCE` | PROFILED |

## Matched Source File Dispositions

- [PROFILED] `../设定 人物/人物卡资料集_叙事检索版.md` — supports `CLAIM_MU_TOU_HOPE`, `CLAIM_MU_TOU_IDENTITY`, `CLAIM_MU_TOU_MODERN_REGISTER`, `CLAIM_MU_TOU_ORIGIN`, `CLAIM_MU_TOU_REFERENCE_TRAITS`, `STATUS_NPC_MU_TOU_PRESENCE`
- [PROFILED] `../设定 人物/人物卡资料集_检索版.md` — supports `CLAIM_MU_TOU_ORIGIN`, `CLAIM_MU_TOU_REFERENCE_TRAITS`, `CLAIM_MU_TOU_WIZARD_TRANSITION`
- [PROFILED] `../设定 人物/妄想大陆设定集_检索版.md` — supports `CLAIM_MU_TOU_HISTORY_1`, `CLAIM_MU_TOU_WIZARD_TRANSITION`
- [SEEN_NOT_PROMOTED] `extracted-first/1/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [SEEN_NOT_PROMOTED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [ROUTED_ELSEWHERE] `output/worldbook_source.jsonl` — The Canonical Worldbook remains authoritative for persistent entity facts.

## Significant Source-Backed Items

### PROFILED

- `CLAIM_MU_TOU_HISTORY_1` — 设定资料记录沐透协助白色魔法使逃离监狱塔，并从白魔处获得 Wizard 驱动器。 Sources: `设定 人物/妄想大陆设定集_检索版.md:白色魔法使（lines 123-128）`
- `CLAIM_MU_TOU_HOPE` — 人物资料把成为他人的希望记为沐透的行动方向。 Sources: `设定 人物/人物卡资料集_叙事检索版.md:沐透（lines 87-110）`
- `CLAIM_MU_TOU_IDENTITY` — 沐透是十九岁的异乡魔法使，借助 Wizard 驱动器与指环变身。 Sources: `设定 人物/人物卡资料集_叙事检索版.md:沐透`
- `CLAIM_MU_TOU_MODERN_REGISTER` — 沐透使用较现代、常带轻松与吐槽感的口吻。 Sources: `设定 人物/人物卡资料集_叙事检索版.md:沐透（lines 87-110）`
- `CLAIM_MU_TOU_ORIGIN` — 人物参考记载沐透是十九岁的异界来客，在点击神秘对话框后跨越世界；参考把他写为随和、自由。 Sources: `设定 人物/人物卡资料集_叙事检索版.md:87-110`; `设定 人物/人物卡资料集_检索版.md:869-890`
- `CLAIM_MU_TOU_REFERENCE_TRAITS` — 人物参考把沐透明确写为随和、自由。 Sources: `设定 人物/人物卡资料集_叙事检索版.md:87-110`; `设定 人物/人物卡资料集_检索版.md:869-890`
- `CLAIM_MU_TOU_WIZARD_TRANSITION` — 监狱塔危机中，沐透在自己的 Underworld 见到幻魔百首黄金龙；他在交易中释放白色魔法使，并获得 Wizard Driver 与戒指魔法。 Sources: `设定 人物/人物卡资料集_检索版.md:893-927`; `设定 人物/妄想大陆设定集_检索版.md:125-126`
- `STATUS_NPC_MU_TOU_PRESENCE` — life_status=unknown; narrative_availability=inactive Sources: `设定 人物/人物卡资料集_叙事检索版.md:沐透`

### ROUTED_ELSEWHERE

- Persistent entity facts → `output/worldbook_source.jsonl#CHARACTER_MU_TOU`; profile carries only continuity-relevant detail.

### SEEN_NOT_PROMOTED

- `extracted-first/1/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.

### MISSING

- Resolved before completion: 异界来历与人物参考边界 → PROFILED in repaired candidate.
- Resolved before completion: 人物参考中的随和与自由 → PROFILED in repaired candidate.
- Resolved before completion: 幻魔、Underworld与Wizard转变 → PROFILED in repaired candidate.
- MISSING remaining: 0

## Ability / Status Transitions

- Presence reviewed: life_status=`unknown`, narrative_availability=`inactive` — PROFILED.
- Phantom / Underworld encounter and Wizard Driver transition — PROFILED after explicit transition review.

## Classification Summary

- PROFILED: 8
- ROUTED_ELSEWHERE: 1
- SEEN_NOT_PROMOTED: 2
- MISSING found before repair: 3
- MISSING remaining: 0
- Forbidden fifth-state items: 0

## Classification Rules

- `PROFILED`: adequately represented in the effective profile.
- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.
- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.
- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.
