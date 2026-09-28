# Phase 3C Review

## Outcome

Phase 3C completed as a profile-construction and review-preparation phase. It produced evidence-backed candidate files only. No formal NPC database, Character Card, GM Card, runtime engine, SillyTavern export, Director material, future plot, or approved/applied Canon patch was created.

## Inventory Summary

- Canonical character entries inventoried: 36.
- Phase 3B prototypes left frozen: 4 NPCs.
- Player character excluded by the PC boundary: 1.
- Phase 3C NPC candidates selected and built: 31.

## Profiles Built

- full: 15
- compact: 15
- minimal: 1
- deferred / Worldbook-only: 0 new files deferred; the one minimal profile uses `worldbook_until_promoted`

All 31 are human-review candidates, not formal database records.

## Source Coverage

- Evidence packets: 31, each created before its JSON profile and containing all 12 required sections.
- ProfileClaims: 99, each with exactly one statement-level source.
- Distinct actual source documents read: 26.
- Unique claim-source strings retained in profiles: 81.
- Character/setting references, campaign posts, and `current_state.md` were used according to field authority. Navigation tables were not used as factual ProfileClaim sources.
- Candidate reasons and Phase 2.5 analytical labels were not used as personality facts.
- Evidence packets retain source excerpts separately; long raw excerpts were not copied wholesale into profile claims.

## ProfileClaim Statistics

- Total ProfileClaims: 99.
- by evidence mode: `explicit_source_statement` 77; `authorial_definition` 16; `single_observed_behavior` 6; all other modes 0.
- by stability: `stable` 88; `conditional` 5; `observed_only` 6.
- by provenance origin: `original_campaign` 77; `authorial_supplement` 16; `transition` 4; `special_interlude` 2.
- by target area: public identity 31; established history 35; personality 7; values 1; speech 2; decision patterns 8; relationship history 15.
- No single observed action was promoted into a stable trait. The six action-derived claims remain `observed_only`; conditional RP claims retain explicit limits.

## Relationship Statistics

- Relationship records: 15.
- Each records explicit established history only.
- No numeric trust/friendship score, inferred emotion, permanent loyalty, or PC-control instruction was added.

## Knowledge Partition Statistics

- `knows`: 0
- `believes`: 0
- `suspects`: 1
- `does_not_know`: 0
- `secrets`: 0

All 31 profiles keep `knowledge_partition=true`. The sole epistemic item is Wosis's interrogation-time suspicion, marked `assertion_scope=character_cognition`; it is not world truth. Other knowledge-sensitive cases remain attributed, constrained, or empty.

## Goal Statistics

- public goals: 0
- private goals: 0
- current goals: 0
- long-term goals: 0

Past actions and institutional roles were not converted into current or future goals.

## Presence Statistics

- life status: `alive` 4, `deceased` 3, `unknown` 24, `not_applicable` 0.
- narrative availability: `normal` 1, `inactive` 23, `historical_only` 3, `restricted` 2, `special_interlude_only` 2, `missing` 0.
- canon-layer membership: `original_campaign` 29, `transition` 4, `special_interlude` 2, `continuation` 0. Counts overlap where a profile legitimately spans original and transition material. `authorial_supplement` is tracked as provenance, not as a Canon layer.

## Evidence Gaps

- Evidence-gap statements recorded: 63.
- The dominant gaps are stable voice, private values/motives, current D3 location, immediate agenda, and present relationship stance.
- Full profile depth does not authorize filling these gaps. Sparse fields must remain sparse at runtime.

## Human Decisions Required

No unresolved source contradiction requires a Canon decision to understand these candidates. Human approval is still required for every profile and every draft patch. Full-depth candidates with sparse voice/personality evidence should be reviewed especially carefully before any later activation system uses them.

## Draft Patch Results

- Draft add patches created: 31 (`PATCH_4001` through `PATCH_4031`).
- Target database: `npc_profiles`.
- Every Phase 3C patch has `operation=add` and `status=draft`.
- No patch contains `approval` or `application`.
- No patch was approved, applied, or used as evidence for its own candidate.

## Profile Validation

Command: `python scripts/validate_character_profiles.py work/phase3c/profiles --worldbook output/worldbook_source.jsonl`

Result: `Validated 31 profile(s): 0 error(s)`.

## Patch Validation

Command: `python scripts/validate_authoring_framework.py work/patches/pending`

Result: `Validated 36 document(s): 0 error(s)` (31 Phase 3C drafts plus the five frozen Phase 3B drafts).

## Regression Tests

Command after every batch and at final accumulation: `python -m unittest discover -s tests -v`.

Latest full-suite result: 112 tests, all passed.

Deterministic regeneration check covered 98 generated evidence/profile/manifest/patch files; repeated generation changed 0 bytes.

## Protected Artifact Hash Check

- Protected files covered: 67. The 52-file preflight list was supplemented after final review found 15 omissions: 14 tracked Phase 2 batch artifacts were independently confirmed byte-identical to the repository index, and `config/content_routing_rules.json` was confirmed against the SHA-256 already recorded in the pre-Phase-3C `work/phase3a_review.md`.
- Final SHA-256 mismatches: 0.
- `output/worldbook_source.jsonl`, `current_state.md`, Phase 1–2.7 frozen outputs, Phase 3A contracts/reviews, and Phase 3B profiles/evidence/reviews remain byte-identical to the recorded baseline.

## RP Quality Review

Completed in `work/phase3c_profile_quality_review.md`. All 31 candidates were checked against A–N. Available sourced RP evidence was retained, but the principal limitation remains deliberate sparsity: a full-depth label is not permission to fabricate personality, voice, or goals.

## Runtime Projection Dry Run

Completed read-only in `work/phase3c_runtime_projection_dryrun.md`. Representative full, compact, minimal, inactive, historical, restricted, knowledge-boundary, relationship-complex, and special-interlude cases passed the contract audit without runtime implementation or future-event generation.

## New Errata

No new factual errata.

The unsupported erroneous entity name is absent from Phase 3C profiles and evidence, and `CHARACTER_ZHENZI` is used for 贞子.

## Stop Boundary

Phase 3C stops here. It does not integrate these candidates into a formal profile database and does not continue into Character Cards, active-cast selection, runtime projection implementation, knowledge engines, Director material, or future plot design.
