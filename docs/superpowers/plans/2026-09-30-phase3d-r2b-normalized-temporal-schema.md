# Phase 3D-R2B Normalized Temporal Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a versioned temporal schema layer whose normalized event store is a deterministic, semantically lossless 1:1 derivative of R2A chronology and whose 36 character indexes contain only mechanical references.

**Architecture:** A strict event schema validates the existing 66 R2A records without renaming fields. A single deterministic builder verifies frozen inputs, round-trips events, writes a derived-only normalized store, applies an explicit source/profile Canon-layer crosswalk, and constructs per-profile lookup indexes from exact `character_ref` matches only.

**Tech Stack:** Python 3.12 standard library, `jsonschema`, JSON Schema Draft 2020-12, `unittest`, UTF-8 JSON/JSONL/Markdown.

**Spec:** `docs/superpowers/specs/2026-09-30-phase3d-r2b-normalized-temporal-schema-design.md`

## Global Constraints

- R2A chronology and the listed R2A review artifacts are authoritative read-only inputs; do not reconstruct chronology.
- Preserve all 66 stable event IDs, input line order, story-order values and 38 revelation IDs.
- The normalized store is always regenerated from R2A and never accepted as an authoring source.
- Preserve R2A Canon-layer source values and profile mappings simultaneously.
- The 36 temporal indexes are mechanical only; no R2C background, timeline, relationship, knowledge, ability/status or current-state migration.
- Use semantic round-trip equality as the losslessness gate and an independent deterministic byte-equality test.
- Do not infer profile IDs from `character_label`, aliases, consequences, prose or routing.
- Do not approve/apply patches, modify formal profile data, create formal NPC/PC databases, change Worldbook/Current State, implement runtime projection or enter Phase 4.
- Human-facing reports are primarily Simplified Chinese.
- Git commands are unavailable in this checkout because of the repository ownership guard; record task completion in the SDD ledger and preserve frozen hashes instead of committing.

## Review Focus

- An R2A participant with `character_label` plus optional `participant_kind` must validate and remain unresolved rather than becoming a profile link.
- `original_campaign_special_interlude` and `transition_canon` must remain unchanged in events while mapping to `special_interlude` and `transition` in indexes.
- The one event with `sequence` and the 65 without it must both round-trip without adding or dropping the field.
- Four Transition events with `source_span: null` and all other source-span arrays must preserve exact JSON types and values.
- A reviewed profile with no explicit event/revelation `character_ref` must receive an empty valid index rather than a guessed link.

---

### Task 1: Freeze authoritative inputs and define exact R2B schemas

**Files:**
- Create: `work/phase3d_r2b/reviewed_inputs/authoritative_input_manifest.json`
- Create: `work/phase3d_r2b/reviewed_inputs/canon_layer_crosswalk.json`
- Create: `schema/r2b_campaign_event.schema.json`
- Create: `schema/r2b_character_temporal_index.schema.json`
- Create: `schema/r2b_canon_layer_crosswalk.schema.json`
- Create: `tests/test_phase3d_r2b.py`

**Interfaces:**
- Consumes: authoritative R2A paths and actual event shapes documented by the spec.
- Produces: JSON schemas and reviewed manifest/crosswalk loaded by `scripts/build_phase3d_r2b.py`.

- [ ] **Step 1: Write failing schema-contract tests**

Add tests named:

- `test_authoritative_manifest_covers_every_declared_r2a_input`
- `test_all_66_r2a_events_validate_without_shape_loss`
- `test_event_schema_accepts_actual_optional_sequence_and_null_span_shapes`
- `test_crosswalk_preserves_source_and_profile_layer_namespaces`

The tests load real R2A records and require the new files and exact counts/enums.

- [ ] **Step 2: Run tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BSchemaContractTests -v`

Expected: FAIL because the R2B schemas and reviewed inputs do not exist.

- [ ] **Step 3: Add the minimal closed schemas and reviewed inputs**

Use Draft 2020-12, `additionalProperties: false`, exact R2A optionality, and no normalization aliases. The manifest lists SHA-256 for every declared file, including every file in the two authoritative directories.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BSchemaContractTests -v`

Expected: 4 tests pass.

- [ ] **Step 5: Record completion in the SDD ledger**

Record the test command and result; no Git commit is possible under the ownership guard.

### Task 2: Build the lossless derived event store

**Files:**
- Create: `scripts/build_phase3d_r2b.py`
- Modify: `tests/test_phase3d_r2b.py`
- Create: `work/phase3d_r2b/normalized/campaign_events.jsonl`
- Create: `work/phase3d_r2b/normalized/derivation_manifest.json`
- Create: `work/phase3d_r2b/reports/schema_compatibility_report.md`
- Create: `work/phase3d_r2b/reports/lossless_migration_report.json`

**Interfaces:**
- Consumes: Task 1 schemas, authoritative manifest/crosswalk and R2A chronology.
- Produces: `load_authoritative_events() -> list[dict]`, `validate_event_records(events, schema) -> list[dict]`, `semantic_round_trip(events) -> list[dict]`, `build_normalized_store() -> dict`.

- [ ] **Step 1: Write failing builder tests**

Add tests named:

- `test_normalized_store_is_semantically_equal_one_to_one`
- `test_normalized_store_preserves_ids_line_order_story_order_and_revelations`
- `test_derivation_manifest_names_only_r2a_as_authority`
- `test_schema_defect_stops_before_any_migration_output`
- `test_check_mode_detects_manually_changed_derived_store`

Use a temporary output root for the failure/alteration cases.

- [ ] **Step 2: Run tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BLosslessStoreTests -v`

Expected: FAIL because the builder API does not exist.

- [ ] **Step 3: Implement the lossless preflight and normalized writer**

Implement strict manifest verification, schema validation before writes, JSON serialize/reparse semantic equality, deterministic serialization, atomic file replacement, a derivation manifest, Chinese reports, and `--check` mode. On validation/round-trip failure, return non-zero and write only a blocker report.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BLosslessStoreTests -v`

Expected: 5 tests pass.

- [ ] **Step 5: Run the real build and record completion**

Run: `python scripts/build_phase3d_r2b.py`

Expected: reports 66/66 semantically equal events and no schema defect. Record results in the ledger.

### Task 3: Generate 36 mechanical character temporal indexes

**Files:**
- Modify: `scripts/build_phase3d_r2b.py`
- Modify: `tests/test_phase3d_r2b.py`
- Create: `work/phase3d_r2b/indexes/character_temporal_indexes.jsonl`
- Create: `work/phase3d_r2b/indexes/by_profile/<PROFILE_ID>.json` for 36 profiles
- Create: `work/phase3d_r2b/reports/unresolved_character_labels.md`

**Interfaces:**
- Consumes: Task 2 in-memory normalized events and Task 1 crosswalk.
- Produces: `load_reviewed_profile_population() -> dict[str, str]`, `build_temporal_indexes(events, profiles, crosswalk) -> list[dict]`.

- [ ] **Step 1: Write failing mechanical-index tests**

Add tests named:

- `test_exactly_36_indexes_are_generated_and_validate`
- `test_links_come_only_from_exact_participant_or_revelation_refs`
- `test_index_keeps_source_layer_and_profile_mapping_together`
- `test_empty_profile_index_is_preserved_without_inference`
- `test_yang_and_other_labels_are_not_promoted_to_profile_ids`
- `test_indexes_contain_no_r2c_semantic_migration_fields`

- [ ] **Step 2: Run tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BTemporalIndexTests -v`

Expected: FAIL because index generation does not exist.

- [ ] **Step 3: Implement minimal exact-reference indexing**

Select the 32 repaired candidates and four unchanged Phase 3D candidates by profile ID. Link only exact participant/revelation `character_ref` values. Copy roles, revelation IDs, story order and both layer values. Preserve label occurrences only in the unresolved-label report.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BTemporalIndexTests -v`

Expected: 6 tests pass.

- [ ] **Step 5: Run the real build and record completion**

Run: `python scripts/build_phase3d_r2b.py`

Expected: 36 valid indexes, no inferred label links. Record results in the ledger.

### Task 4: Enforce phase boundaries and produce the final R2B review

**Files:**
- Modify: `scripts/build_phase3d_r2b.py`
- Modify: `tests/test_phase3d_r2b.py`
- Create: `work/phase3d_r2b/reports/r2b_review.md`

**Interfaces:**
- Consumes: all Task 1-3 validation and output metrics.
- Produces: final status and boundary report.

- [ ] **Step 1: Write failing completion-gate tests**

Add tests named:

- `test_final_report_declares_ready_only_after_all_gates_pass`
- `test_r2a_authoritative_inputs_remain_byte_identical`
- `test_no_formal_profile_database_patch_approval_or_r2c_output_is_created`
- `test_pc_permissions_and_existing_profile_candidates_remain_unchanged`

- [ ] **Step 2: Run tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BBoundaryTests -v`

Expected: FAIL because the final report and boundary manifest are incomplete.

- [ ] **Step 3: Implement the final gate and report**

Render a Simplified Chinese report with schema compatibility, lossless equality, derivation-only authority, crosswalk, index limits, unresolved labels, frozen artifacts, tests and stop boundary. Emit ready status only when all build-time gates pass.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `python -m unittest tests.test_phase3d_r2b.Phase3DR2BBoundaryTests -v`

Expected: 4 tests pass.

- [ ] **Step 5: Record completion in the SDD ledger**

Record the focused test result and build status.

### Task 5: Determinism, regression suite and final review

**Files:**
- Modify only if a verified defect is found: `scripts/build_phase3d_r2b.py`, `tests/test_phase3d_r2b.py`, or R2B schemas
- Update: `.superpowers/sdd/2026-09-30-phase3d-r2b-normalized-temporal-schema/progress.md`

**Interfaces:**
- Consumes: complete R2B implementation.
- Produces: final verification evidence and review findings.

- [ ] **Step 1: Run the focused R2B suite**

Run: `python -m unittest tests.test_phase3d_r2b -v`

Expected: all R2B tests pass.

- [ ] **Step 2: Run two complete builds and compare generated bytes**

Hash every generated file below `work/phase3d_r2b/normalized`, `indexes`, and generated `reports` after each build.

Expected: identical file sets and zero SHA-256 differences.

- [ ] **Step 3: Run read-only check mode**

Run: `python scripts/build_phase3d_r2b.py --check`

Expected: derived outputs equal a fresh in-memory derivation; no files change.

- [ ] **Step 4: Run the complete regression suite**

Run: `python -m unittest discover -s tests`

Expected: zero failures and zero errors.

- [ ] **Step 5: Perform whole-change review**

Review against the spec with special attention to the five Review Focus cases, schema optionality, source authority, semantic-vs-byte equality and R2C leakage. Fix any Critical/Important issue through a fresh RED→GREEN test cycle; ledger deferred Minor findings.

- [ ] **Step 6: Record final verification**

Record focused/full test counts, semantic equality count, deterministic file count/differences, frozen-input count and final status in the SDD ledger.

