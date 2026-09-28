# Phase 3C Runtime Projection Dry Run

This is a read-only contract audit. No runtime code, dialogue, scene, future event, or continuation plot was generated.

## Projection rules used

- Active NPC: project only source-backed claims relevant to the immediate context, plus constraints and presence.
- Supporting NPC: project compact identity, relevant established history, applicable relationship records, and safety constraints.
- Inactive NPC: do not inject the full profile; at most retain the canonical Worldbook identity when independently triggered.
- Historical-only, restricted, and special-interlude-only availability overrides profile depth.
- Empty profile fields stay empty; projection must not synthesize missing voice, personality, knowledge, or goals.

## Representative cases

| Case | Profile | Hypothetical state | Expected projection | Result |
|---|---|---|---|---|
| full | NPC_AINZ_OOAL_GOWN | active | identity, directly relevant sanctuary history, D3 presence, and unresolved-alliance constraint; no outside lore | PASS |
| compact | NPC_ELLIE | supporting | healer/support identity and only the event history relevant to support; no virtue labels or full-profile expansion | PASS |
| minimal | NPC_SERTANT_LU_YOURLAN | inactive | Worldbook identity only; no voice, politics, motives, or active scene insertion | PASS |
| deceased/historical | NPC_ZHENZI | attempted active | block normal activation; expose historical rescue/sacrifice only when continuity-relevant | PASS |
| inactive | NPC_CASSIUS_BRIGHT | inactive | do not inject full relationship/history; profile depth does not summon him | PASS |
| knowledge-boundary complex | NPC_WOSIS / NPC_JERGAL | active-relevance request | keep Wosis's interrogation suspicion character-scoped; for Jergal expose only attributed curse/contract research and constraints, without manufacturing cognition or cosmology | PASS |
| relationship complex | NPC_ZHENZI | supporting historical reference | relationship history may be supplied, but must not generate 御临风's feelings, speech, decisions, or actions | PASS |
| restricted | NPC_DEATHWING | supporting reference | current-body defeat and unresolved status only; no permanent death, resurrection, or ancient-god explanation | PASS |
| special interlude | NPC_REN_FANZHEN | main-world active request | reject profile projection outside `special_interlude`; do not import the modern supernatural setting | PASS |

## State-transition checks

- `active → supporting`: reduces the projected set; it does not invent a summary personality.
- `supporting → inactive`: removes profile-detail projection; the Worldbook remains the identity authority.
- `inactive → active`: requires an external cast decision outside Phase 3C; profile existence alone cannot cause activation.
- `historical_only`, `restricted`, and `special_interlude_only` are not silently converted to `normal` by any state request.

## Safety findings

- Inactive NPCs do not leak full profiles.
- Supporting NPCs receive compact, relevant, sourced context only.
- Active NPCs receive no unsupported completion of sparse fields.
- Character-scoped knowledge is not replaced by world truth. The one epistemic item is Wosis's `suspects` record, marked `character_cognition`; Jergal cosmology remains attributed or unknown.
- Director information and future plot instructions are absent.
- Full profiles do not force scene presence.
- Relationships with 御临风 do not authorize control of the player character.

Overall result: PASS for the reviewed contract, subject to the documented evidence gaps.
