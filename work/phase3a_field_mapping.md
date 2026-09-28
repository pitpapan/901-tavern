# Phase 3A Dry-Run Field Mapping

This is a field-needs audit, not a set of profiles. It creates no character data and makes no new claims. The mapping uses existing Worldbook identifiers and the frozen Phase 2.5 runtime-role review only to determine which schema sections would need future source reading.

| Character | Kind / Worldbook mapping | Existing reviewed depth / activation | Fields that would require source-backed population | Required safeguards and gaps |
| --- | --- | --- | --- | --- |
| 悠悠 | NPC / `CHARACTER_YOUYOU` | full / full_when_active | identity (including reviewed names by historical stage), relationships, epistemic state, goals, dynamic state, presence, source-supported personality/values/speech/decision claims | Preserve 悠悠、芬尔德·特兰希尔、芬尔德·琳·特兰希尔 as potentially stage-bearing names rather than spelling variants; partition curse, space-dragon, marriage, and other knowledge by acquisition time; do not infer motives from later names. |
| 白色魔法使 | NPC / `CHARACTER_WHITE_MAGICIAN` | full / full_when_active | identity and confirmed aliases, attributed public goals, established actions, relationships, knowledge/secret partitions, contextual speech and decision evidence, presence | 白魔 and 笛木奏 remain source-supported aliases; public goal statements stay attributed rather than becoming inner truth; concealed knowledge and character inference require separate items. |
| 帝 | NPC / `CHARACTER_EMPEROR` | full / full_when_active | identity/role, established decisions and actions, relationships, public goals if sourced, epistemic state, dynamic state, presence, RP constraints | Single-character name is valid and must not be discarded; separate public decisions, rumor, undisclosed knowledge, and other characters' interpretations; do not infer political stance from title alone. |
| 托尔金 | NPC / `CHARACTER_TOLKIEN` | minimal / worldbook_until_promoted | identity reference, presence, any narrowly established relationship or knowledge boundary; most profile sections may remain empty with evidence gaps | Minimal means the evidence need is currently small, not that the character is unimportant. No automatic promotion, invented personality, voice, goals, or future role. |
| 御临风 | PC continuity / `CHARACTER_YU_LINFENG` | full / full_when_active (continuity depth only) | established identity/history, objective relationships, PC knowledge partition, player-declared or confirmed-continuation goals, objective dynamic state, presence, provenance | Must use `control_mode=user_controlled`; no dialogue, voluntary action, private thought, emotion, decision, or new goal may be generated. High continuity depth does not create NPC authority. |

## Source work required before any real profile

For each future profile, reviewers must return to the Worldbook entry only for identity linkage, then read the cited campaign/character sources for each profile claim. Phase 2.5 runtime rows determine fidelity and activation policy but are not substitutes for personality, goal, relationship, or knowledge evidence. `current_state.md` may anchor current objective state but must not be copied into the profile.

No profile has been created by this dry run.
