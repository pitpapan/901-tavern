# Character Continuity Data Model

## Purpose and authority

Phase 3A adds two non-Worldbook continuity stores:

- **NPC Profile** records source-supported roleplay continuity for a non-player character.
- **Player Character Continuity Profile** records only established continuity for a user-controlled player character.

Neither profile kind is Canon merely because a JSON file exists. A profile must be created or changed through the reviewed supplement → Canon patch flow. The Worldbook remains authoritative for persistent identity, durable world position, objective relationships, historical events, locations, factions, concepts, and world facts. Profiles reference a `CHARACTER_*` Worldbook entry and must not copy its prose wholesale.

The model does not rank characters by future importance, expected scene frequency, or plot priority. `profile_depth` describes the RP fidelity required when the character is active, even when the available evidence is sparse. Evidence gaps remain explicit and must never be filled by invention. `activation_policy` describes how much reviewed material may be projected in a scene. Promotion and reduction require an approved patch; runtime use never rewrites the source profile.

## Files and identifiers

| Record | Schema | Identifier | `profile_kind` |
| --- | --- | --- | --- |
| Shared definitions | `schema/character_profile_common.schema.json` | not an instance store | n/a |
| NPC Profile | `schema/npc_profile.schema.json` | `NPC_<SEMANTIC_ID>` | `npc` |
| PC Continuity Profile | `schema/pc_continuity_profile.schema.json` | `PC_<SEMANTIC_ID>` | `pc_continuity` |

`CAND_*` identifiers are forbidden. `worldbook_id` must be a `CHARACTER_*` ID and, when the Worldbook is supplied to the validator, must resolve to a character entry. One profile ID and one Worldbook mapping may occur only once in a validation set.

## Common structure

Both specialized schemas use the same structural sections:

- `identity`
- `core_personality`
- `values`
- `speech_style`
- `decision_patterns`
- `relationships`
- `epistemic_state`
- `goals`
- `dynamic_state`
- `presence`
- `rp_constraints`
- `provenance`
- `evidence_gaps`

The sections have different authority under the NPC and PC schemas. A field being structurally present in a PC profile does not authorize the runtime to invent its future value.

### ProfileClaim

Source-bearing descriptive sections use `ProfileClaim`:

| Field | Meaning |
| --- | --- |
| `claim_id` | Stable local claim identifier |
| `claim` | Narrow, attributed statement |
| `evidence_mode` | How the claim is supported |
| `origin` | Canon or authorial source class |
| `stability` | `stable`, `conditional`, or `observed_only` |
| `context` | Conditions in which the observation applies |
| `exceptions` | Recorded counterexamples or limits |
| `sources` | Precise supporting references |
| `notes` | Review notes; not additional facts |

Allowed evidence modes are:

- `explicit_source_statement`
- `repeated_observed_behavior`
- `single_observed_behavior`
- `authorial_definition`
- `continuation_confirmed`

A single observed behavior may be preserved as `observed_only` or, where justified, `conditional`; it cannot silently become a stable trait. `authorial_definition` requires `authorial_supplement` origin. `continuation_confirmed` requires continuation origin and a confirmed `CONT_*` source when the source material is validated together.

### Relationships

`RelationshipRecord` keeps objective continuity separate from subjective stance:

- `established_history`: sourced events and durable relationship history.
- `current_stance`: the character's sourced present stance.
- `obligations` and `tensions`: sourced, attributed claims.
- `known_shared_experiences`: references to shared events or records.
- `visibility`: who may receive the relationship information.

Numeric trust, friendship, affection, rank, or tier scores are not part of this model. They falsely imply precision and encourage unsourced progression.

### Epistemic state

Each `KnowledgeItem` records a subject/fact reference, a statement, an epistemic type, visibility, acquisition context, and provenance. The epistemic types are `knows`, `believes`, `suspects`, `does_not_know`, and `secrets`.

`assertion_scope=character_cognition` means the item describes the character's epistemic state. `confirmed_world_fact` may be used only when the item also points to separately established world fact; a belief or suspicion can never be promoted by changing this flag.

`knowledge_partition` must be true if the profile contains belief, suspicion, explicit non-knowledge, secrets, or restricted information. The same fact cannot be both `knows` and `does_not_know` in one snapshot. Secret knowledge still needs source provenance.

### Goals

NPC goals are separated into public, private, current, and long-term collections. PC goals are limited to player-declared goals and goals confirmed by continuation play. A `GoalItem` records status (`active`, `paused`, `completed`, `failed`, `abandoned`, or `unknown`), basis, origin, sources, and notes.

Goals describe an established intention or its historical status. They never guarantee that a future event will happen. The runtime cannot invent or assign a new PC goal.

### Dynamic state

`dynamic_state` is a character-scoped snapshot: current conditions, obligations, location reference, faction role, and current concerns. It is not a copy of `current_state.md`, a session log, or a historical ledger. `as_of` and `sources` are mandatory so later updates can be compared against an explicit anchor.

### Presence

Presence separates physical existence from narrative availability:

| Dimension | Values |
| --- | --- |
| `life_status` | `alive`, `deceased`, `unknown`, `not_applicable` |
| `narrative_availability` | `normal`, `inactive`, `missing`, `historical_only`, `special_interlude_only`, `restricted` |

`deceased + normal` is invalid; `deceased + historical_only` is valid. `unknown` or `missing` is not shorthand for death. A profile whose only layer/realm is `special_interlude` cannot be normally available in the main world.

The earlier Phase 2.5 erratum remains binding: the unsupported name “普伦达” must not be recreated. The reviewed historical entity is 贞子, whose life status is deceased; this architecture does not itself create her profile.

## NPC authority

An NPC Profile may support generated dialogue, voluntary choices, private thoughts, physical reactions, and decisions when the NPC is active, constrained by sources, visibility, established goals, and knowledge partitions. It does not authorize:

- new Canon facts;
- new long-term goals or hidden motives;
- knowledge the NPC has not acquired;
- revival or ordinary activity for a deceased character;
- main-world access for a Special Interlude-only character;
- forced scene importance based on profile depth.

`may_assign_new_goals` is false in the Phase 3A schema. New durable goals require a confirmed event or an approved authorial supplement and patch.

## PC continuity authority

The PC schema fixes `control_mode=user_controlled`. It is an anti-autonomy contract, not an NPC profile with a different label. See `docs/pc_control_boundary.md` for the complete boundary.

## Provenance and updates

Root provenance records:

- `canon_origin` (the source class, including an authorial supplement where applicable; distinct from the profile's Canon layers)
- optional `introduced_by_patch`
- optional `last_modified_by_patch`
- `source_origin_ids`

Substantive claims, relationships, knowledge, goals, dynamic state, presence, and RP constraints also carry local sources. Root provenance cannot substitute for per-claim evidence.

The accepted update path is:

1. Record an authorial supplement, confirmed continuation event, or other permitted source.
2. Route it to `npc_profiles` or `pc_continuity`.
3. Prepare a reviewable Canon patch.
4. Check identity mapping, evidence, knowledge visibility, presence, and PC authority.
5. Apply only after explicit human approval.

Director material and pending continuation events cannot directly source profile patches. Runtime projection is read-only and cannot promote, demote, merge, or rewrite profiles.

## Validation boundary

Run:

```text
python scripts/validate_character_profiles.py <profile files> --schema-dir schema
```

Optional `--worldbook` enables referential checks. Repeated `--source` arguments enable confirmation of `CONT_*` and `PATCH_*` provenance. The validator reports errors and never rewrites data.

The validator rejects malformed schema data, duplicate profile IDs and Worldbook mappings, invalid ID/kind combinations, PC permission escalation, ranking fields, invalid presence combinations, Special Interlude leakage, knowledge contradictions, unsupported stable traits, unsourced claims, improper origin modes, invalid goals, and unresolvable references when their source databases are supplied.
