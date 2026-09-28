# Phase 3B Runtime Projection Dry Run

This is a read-only manual projection review against `docs/profile_runtime_projection_contract.md`. It does not implement a projector, generate dialogue, select future plot, or mutate Canon.

## Scenario Inputs

| Profile | Participation | Contract path |
|---|---|---|
| `NPC_YOUYOU` | active | NPC active/full |
| `NPC_WHITE_MAGICIAN` | active | NPC active/full |
| `NPC_EMPEROR` | supporting | NPC supporting/compact |
| `NPC_TOLKIEN` | inactive | inactive/Worldbook-only |
| `PC_YU_LINFENG` | PC continuity | PC continuity projection |

## NPC_YOUYOU — active

Projected fields:

- Identity: 悠悠; both full names retained with their historical stages; mixed space-dragon/elf identity; imperial affiliation with its political-inference exception.
- Behavioral continuity: the source-defined quiet/laconic baseline and brief-speech condition, including the exception for complex or consequential situations.
- Relevant relationship: only the objective mutual life-saving history with 御临风; no generated trust, dependence, affection, or current emotion.
- Dynamic/presence guards: D3 anchor, exact location unknown, alive/normal, full only because the scenario explicitly marks her active.
- Constraints/gaps: stage-bearing names, no confirmed current goal, uncertain conscious knowledge during the curse-transfer interval.

Omitted: values, decision patterns, goals, and epistemic items because the prototype does not have sufficient evidence. No missing field is filled from stereotype, age, species, or relationship depth.

Result: enough to identify her and preserve a distinct, source-backed interaction baseline without leaking 御临风's thoughts or inventing emotional attachment.

## NPC_WHITE_MAGICIAN — active

Projected fields:

- Identity/history: 白色魔法使／白魔／笛木奏, imperial imprisonment/escape, and the confirmed magic-gem event.
- Behavioral continuity: negotiation/exchange behavior and the conditional terms-and-theory speech structure, with their observed-only/conditional limits.
- Relationship: only the documented adversarial negotiation history with 御临风; no alliance is inferred.
- Knowledge partition: arcane knowledge is available to this NPC; the fate/cosmology account remains `believes` plus `character_cognition`, never an objective world fact.
- Goals: family/ideal-world and quiet-research claims remain explicitly public/attributed; private goals remain empty.
- Dynamic/presence: currently holds the magic gem; exact location and next action remain unknown.

Omitted: unconfirmed private motive, outside-work identity knowledge, objective confirmation of his theory, Director material, and predicted next action.

Result: distinct enough for an active projection while maintaining the most important motive and knowledge boundaries.

## NPC_EMPEROR — supporting

Projected fields:

- Identity/current role: 帝, current highest ruler, and Brotherhood authority only if institutionally relevant.
- Directly relevant behavior/voice: formal “余／汝” register only for a comparable formal context; the multi-party hearing behavior travels with its single-event exception.
- Relevant relationship: sovereign/subordinate history with 御临风 only if the scene invokes that institutional relation.
- Presence: alive/current ruler; appearance is not implied merely by high world agency.

Omitted: the full historical hearing, the historical magic-box non-knowledge item unless that exact past timepoint is queried, all rumored powers, private motives, and empty goal/value fields.

Result: compact and recognizable without allowing political stature to become invented personality.

## NPC_TOLKIEN — inactive

Projected fields:

- Worldbook reference: `CHARACTER_TOLKIEN` / 托尔金, dwarf craft and historical equipment-support identity.
- Presence guard: `life_status=unknown`, `narrative_availability=inactive`.
- Omission reason: `worldbook_until_promoted`; the scenario marks him inactive and the evidence is deliberately sparse.

Omitted: the entire profile body, including the one reviewed relationship record. No speech, personality, goal, thought, or current action is generated to compensate for sparse evidence.

Result: meets the inactive/Worldbook-only contract and prevents fictional completion.

## PC_YU_LINFENG — continuity only

Projected fields:

- Identity and established history: real-world origin, established campaign roles, curse transfer, dragon-sanctuary history, and D3 continuity.
- Objective relationships: confirmed shared histories with 悠悠 and deceased 贞子; no present emotion is assigned.
- Objective state: alive; established curse/耶各-agent continuity; exact location and current concern absent.
- Knowledge: he heard 白色魔法使's claims; this does not validate their content.
- Goals: the historical player declaration may be recalled with `status=unknown`; it cannot be treated as an active continuation goal.
- Complete permission block: no generated dialogue, voluntary action, private thought, new goal, emotion, or decision; external effects, involuntary reactions, established history, and summaries of user-declared actions remain permitted.

Explicitly excluded: personality-to-action projection, speech generation, next-action advice written as his choice, inferred current grief, and Special Interlude knowledge without carry-back evidence.

Result: continuity is available while the PC remains completely user-controlled.

## Boundary Checks

- Character recognition: pass for all five at their intended depth/participation state.
- Distinctive personality: pass for active 悠悠 and 白色魔法使 using sourced claims; 帝 uses only compact contextual cues; 托尔金 is intentionally not portrayed from sparse data.
- Knowledge isolation: pass; white-magician cosmology remains attributed, Emperor's historical non-knowledge is time-bounded, and PC knowledge contains only what he encountered.
- Director isolation: pass; no Director item or future-importance metadata is present.
- Context budget: pass; supporting/inactive projections omit full bodies, and active projections select relevant claims with exceptions.
- PC control: pass; fixed no-autonomy block is complete.
- Sparse-profile protection: pass; Tolkien remains Worldbook-only and receives no invented completion.
