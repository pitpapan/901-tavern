# Phase 3D-R2C Character Profile v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the provisional character continuity set as versioned Profile v2 candidates generated from explicit semantic migration packages, with complete chronology, evidence boundaries, Chinese human-review projections and deterministic audit artifacts.

**Architecture:** R2A remains event authority and R2B remains a derived lookup layer. A schema-first fixture gate freezes Profile v2 before an explicit package builder proposes per-character migration decisions; a separate deterministic compiler consumes those packages to generate candidates, ledgers, reviews and reports atomically.

**Tech Stack:** Python 3.12 standard library, `jsonschema`, JSON Schema Draft 2020-12, `unittest`, UTF-8 JSON/JSONL/Markdown.

**Spec:** `docs/superpowers/specs/2026-09-30-phase3d-r2c-character-profile-v2-design.md`

## Global Constraints

- Follow root `AGENTS.md`; do not invent Canon, promote attribution to fact, or erase uncertainty.
- R2A chronology is authoritative; R2B is derived and its exact-reference index is not exhaustive.
- Freeze and verify all Phase 1–3D-R, R2A and R2B inputs before writing R2C output.
- Create versioned schemas under `work/phase3d_r2c/schemas/`; do not mutate frozen schemas.
- Pass all six mandatory schema fixture groups before any full profile migration, then freeze the schema hash.
- Generate candidates and Markdown from migration packages; never maintain them independently.
- Every old claim must receive an explicit migration disposition.
- `dynamic_state` may contain only D3 material supported by `current_state.md`.
- Preserve the PC's four false autonomous-generation permissions.
- Preserve Special Interlude isolation, attribution, uncertainty and source lineage.
- Yang may be only an unapproved `provisional_discovery`; Canon identity and runtime triggers remain decoupled.
- Do not approve/apply patches, mutate Worldbook/Current State, create formal profile databases, generate runtime/cards/Director artifacts, or enter Phase 4.
- Human-facing reports and character reviews are primarily Simplified Chinese.
- Use deterministic UTF-8/LF serialization, temporary build roots and atomic replacement.
- Git is unavailable under the repository ownership guard; record each task in the SDD ledger instead of committing.

## File structure

- `scripts/phase3d_r2c_common.py`: deterministic I/O, hashes, schema loading, source lookup and invariant helpers.
- `scripts/prepare_phase3d_r2c_packages.py`: build explicit provisional migration packages from frozen evidence plus narrow reviewed decision rules.
- `scripts/build_phase3d_r2c.py`: validate/freeze schema, consume packages and atomically generate all candidates, ledgers, reviews and reports.
- `tests/test_phase3d_r2c.py`: fixture, semantic, boundary, readability and determinism tests.
- `work/phase3d_r2c/reviewed_inputs/`: frozen manifest, decision rules and schema fixtures.
- `work/phase3d_r2c/schemas/`: shared, NPC, PC and migration-package contracts.
- `work/phase3d_r2c/migration_packages/`: one explicit package per proposed profile.
- `work/phase3d_r2c/candidates/`, `reviews/`, `migration/`, `reports/`, `patches/`: generated provisional outputs.

## Review Focus

- Indirect continuity: Deathwing must retain `EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY` even without an exact R2B link; Task 4 adds a direct regression.
- Schema freeze: a late character shape must never receive a local workaround; Task 3 tests schema-hash mismatch and full-stop behavior.
- Current-state leakage: historical claims and transition facts must not populate D3 fields; Task 5 tests source whitelisting and empty unknowns.
- Review drift: candidate JSON, ledgers and Chinese Markdown must all derive from the same package; Task 6 rebuilds and cross-checks item identifiers.
- Discovery inflation: generic Part 1 labels must not become stable profiles without sufficient identity evidence; Task 5 tests routed non-promotion while retaining durable impact.

---

### Task 1: Frozen input contract and Profile v2 schema fixture gate

**Files:**
- Create: `work/phase3d_r2c/reviewed_inputs/frozen_input_manifest.json`
- Create: `work/phase3d_r2c/schemas/character_profile_v2.schema.json`
- Create: `work/phase3d_r2c/schemas/npc_profile_v2.schema.json`
- Create: `work/phase3d_r2c/schemas/pc_continuity_v2.schema.json`
- Create: `work/phase3d_r2c/schemas/migration_package.schema.json`
- Create: `work/phase3d_r2c/reviewed_inputs/schema_fixtures/*.json`
- Create: `scripts/phase3d_r2c_common.py`
- Create: `tests/test_phase3d_r2c.py`

**Interfaces:**
- Consumes: frozen R2A/R2B artifacts, existing effective profile set and `current_state.md`.
- Produces: `load_json(path)`, `load_jsonl(path)`, `sha256_file(path)`, `verify_frozen_manifest(path)`, `schema_errors(instance, schema)` and validated v2 contracts.

- [ ] **Step 1: Write failing schema and manifest tests**

Add tests named:

- `test_frozen_manifest_covers_declared_r2a_r2b_and_profile_inputs`
- `test_shared_v2_schema_has_closed_distinct_semantic_sections`
- `test_npc_and_pc_root_schemas_validate_their_kinds`
- `test_pc_schema_locks_four_autonomous_permissions_false`
- `test_migration_package_schema_requires_every_decision_section`

Assert exact schema version, closed objects, separate biography/timeline, motivations/goals, explicit story order, relationship milestones, knowledge acquisition, reality status, D3 source authority and nullable provisional Worldbook mapping.

- [ ] **Step 2: Run schema tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CSchemaContractTests -v`

Expected: FAIL because the R2C contracts and manifest do not exist.

- [ ] **Step 3: Implement common helpers and minimal closed schemas**

Implement the exact v2 records from the design. Keep `ACTUAL_EVENT`, background, future, prophecy, belief, theory, rumor, testimony, inference and observed behavior machine-readable. Require uncertainty, attribution and source references on semantic items.

- [ ] **Step 4: Create the six mandatory fixture groups and negative controls**

Create valid fixture candidates for White Magician, Cassandra, Deathwing, Oshira, Youyou and PC Yu Linfeng. Add invalid controls that flatten each required distinction or enable PC autonomy.

- [ ] **Step 5: Run fixture gate tests**

Add and run:

- `test_all_six_fixture_groups_validate_without_flattening`
- `test_white_magician_fixture_separates_three_locations_or_events`
- `test_cassandra_fixture_separates_motivation_from_possible_future`
- `test_deathwing_fixture_separates_testimony_battle_and_theory`
- `test_oshira_fixture_preserves_unknown_control_cognition_and_persistence`
- `test_youyou_fixture_has_explicit_ordered_chain`
- `test_pc_fixture_scopes_knowledge_and_preserves_autonomy`

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CFixtureGateTests -v`

Expected: all fixture tests pass.

- [ ] **Step 6: Record schema freeze evidence**

Write `work/phase3d_r2c/reports/schema_validation_report.md` and `fixture_validation_report.md` with the three schema hashes and six fixture results. Record the command and hashes in `.superpowers/sdd/2026-09-30-phase3d-r2c-character-profile-v2/progress.md`.

### Task 2: Explicit migration-package preparation

**Files:**
- Create: `work/phase3d_r2c/reviewed_inputs/migration_rules.json`
- Create: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `tests/test_phase3d_r2c.py`
- Generate: `work/phase3d_r2c/migration_packages/<PROFILE_ID>.json`

**Interfaces:**
- Consumes: `load_effective_profiles()`, R2A events/revelations/routes/audits/discoveries/retention, R2B indexes, D3 state and narrow explicit rules.
- Produces: `prepare_package(profile_id: str) -> dict`, `prepare_all_packages() -> list[dict]`, `old_claim_inventory(profile: dict) -> list[dict]`.

- [ ] **Step 1: Write failing package completeness tests**

Add tests named:

- `test_effective_population_starts_with_35_npc_and_1_pc`
- `test_each_old_claim_has_exactly_one_explicit_disposition`
- `test_package_considers_direct_and_indirect_evidence_classes`
- `test_package_items_use_only_existing_event_revelation_and_source_refs`
- `test_mu_tou_and_zhenzi_packages_survive_empty_r2b_indexes`

- [ ] **Step 2: Run package tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CMigrationPackageTests -v`

Expected: FAIL because the package preparer and decision rules do not exist.

- [ ] **Step 3: Implement old-claim inventory and conservative default routing**

Map identity only to stable identity; established history to background, timeline, relationship, status or knowledge using explicit source-section rules; persona arrays retain their evidence mode; goals and epistemic items remain separate. Any ambiguous claim becomes `UNRESOLVED` or `SEEN_NOT_PROMOTED`, never guessed.

- [ ] **Step 4: Add explicit high-risk decision rules**

Encode reviewed rules for White Magician, Deathwing, Cassandra, Oshira, Honda, Sertant, Youyou, Xierlun, PC Yu Linfeng, Mu Tou and Zhenzi. Include indirect event references, required distinctions, prohibited inferences and D3 exclusions.

- [ ] **Step 5: Add discovery and retention decisions**

Generate `NPC_YANG` only as `provisional_discovery` with nullable Worldbook mapping and no aliases/triggers. Evaluate each Part 1 discovery; create a provisional package only when identity/evidence is sufficient, otherwise emit explicit discovery/human-decision routing while preserving its durable impact.

- [ ] **Step 6: Generate and validate packages**

Run: `python scripts/prepare_phase3d_r2c_packages.py`

Expected: all baseline packages plus eligible provisional discoveries validate, every old claim has one disposition, and no unsupported stable profile is created.

- [ ] **Step 7: Record package metrics**

Record profile/package counts, old-claim count, disposition totals, provisional discoveries and routed discoveries in the SDD ledger.

### Task 3: Deterministic compiler, schema freeze and atomic transaction

**Files:**
- Create: `scripts/build_phase3d_r2c.py`
- Modify: `tests/test_phase3d_r2c.py`
- Generate: `work/phase3d_r2c/candidates/by_profile/*.json`
- Generate: `work/phase3d_r2c/reports/schema_defects.json` only on schema failure

**Interfaces:**
- Consumes: frozen manifest, frozen schema hashes and validated migration packages.
- Produces: `compile_candidate(package: dict) -> dict`, `validate_candidate(candidate: dict) -> list[str]`, `build_all(output_root: Path) -> dict`, `check_all(output_root: Path) -> dict`.

- [ ] **Step 1: Write failing compiler and transaction tests**

Add tests named:

- `test_candidate_is_generated_only_from_its_package`
- `test_all_candidates_validate_against_frozen_schema`
- `test_changed_schema_hash_stops_before_profile_migration`
- `test_invalid_late_package_stops_without_partial_candidate_tree`
- `test_atomic_build_preserves_previous_complete_tree_on_failure`
- `test_check_mode_detects_manual_candidate_drift`

- [ ] **Step 2: Run compiler tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CCompilerTests -v`

Expected: FAIL because the compiler API does not exist.

- [ ] **Step 3: Implement package-to-candidate compilation**

Build the exact root structure from package items. Preserve item IDs and evidence links. Enforce separate NPC/PC roots, Yang's provisional mapping state and PC permissions.

- [ ] **Step 4: Implement frozen-schema and atomic-build gates**

Verify all frozen hashes, schema hashes and packages before creating a staging directory. Validate the complete staged file set before replacing generated outputs. A schema defect emits only `R2C_SCHEMA_BLOCKED` diagnostics; semantic incompleteness emits `R2C_PROFILE_REBUILD_BLOCKED` diagnostics.

- [ ] **Step 5: Run compiler tests to verify GREEN**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CCompilerTests -v`

Expected: all compiler and transaction tests pass.

### Task 4: High-risk semantic regression and cross-profile propagation

**Files:**
- Modify: `work/phase3d_r2c/reviewed_inputs/migration_rules.json`
- Modify or regenerate: `work/phase3d_r2c/migration_packages/*.json`
- Modify: `scripts/build_phase3d_r2c.py`
- Modify: `tests/test_phase3d_r2c.py`
- Generate: `work/phase3d_r2c/migration/cross_profile_event_propagation.jsonl`
- Generate: `work/phase3d_r2c/reports/cross_profile_event_audit.md`

**Interfaces:**
- Consumes: high-risk packages and central R2A events.
- Produces: `build_cross_profile_propagation(packages, events) -> list[dict]`, `audit_required_shared_events(rows) -> dict`.

- [ ] **Step 1: Write failing named-character regressions**

Add tests for requirements 11–25 and 27–32 from the approved contract, including:

- Deathwing P2-022 survives without direct index linkage;
- Cassandra motivation is not her possible future;
- White Magician locations and theories remain separated;
- Oshira control mechanism/cognition/persistence remain unknown;
- Honda/Sertant finale order is exact;
- Youyou's full chain is ordered;
- Xierlun engagement planning creates no current obligation;
- Mu Tou and Zhenzi are retained;
- Yang stays provisional and trigger-free;
- Special Interlude and PC/D3 boundaries hold.

- [ ] **Step 2: Run high-risk tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CHighRiskSemanticTests -v`

Expected: at least the propagation/audit assertions fail before implementation.

- [ ] **Step 3: Implement the nine required propagation audits**

For each required shared event, create character-specific rows containing role, consequence, actual knowledge, relationship changes, ability/status changes and unresolved effects. Reject generic copy-equal summaries across participants and knowledge inferred only from presence.

- [ ] **Step 4: Regenerate packages and candidates**

Run:

`python scripts/prepare_phase3d_r2c_packages.py`

`python scripts/build_phase3d_r2c.py`

Expected: all high-risk candidates and propagation rows validate.

- [ ] **Step 5: Run high-risk tests to verify GREEN**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CHighRiskSemanticTests -v`

Expected: all high-risk tests pass.

### Task 5: Complete population, D3 boundary and gap routing

**Files:**
- Modify: `work/phase3d_r2c/reviewed_inputs/migration_rules.json`
- Modify or regenerate: `work/phase3d_r2c/migration_packages/*.json`
- Modify: `scripts/build_phase3d_r2c.py`
- Modify: `tests/test_phase3d_r2c.py`
- Generate: `work/phase3d_r2c/migration/claim_migration_ledger.jsonl`
- Generate: `work/phase3d_r2c/migration/profile_gap_routing.jsonl`
- Generate: `work/phase3d_r2c/reports/part1_retention_migration_audit.md`
- Generate: `work/phase3d_r2c/reports/unresolved_profile_questions.md`
- Generate: `work/phase3d_r2c/reports/pc_control_boundary_report.md`
- Generate: `work/phase3d_r2c/reports/source_fallback_log.jsonl`

**Interfaces:**
- Consumes: every validated package and old-claim inventory.
- Produces: `build_claim_ledger(packages)`, `build_gap_routes(packages)`, `audit_part1_retention(packages, routes)` and boundary reports.

- [ ] **Step 1: Write failing population and boundary tests**

Add tests named:

- `test_every_old_claim_appears_once_in_claim_ledger`
- `test_every_unresolved_issue_uses_allowed_gap_route`
- `test_part1_durable_impact_is_profiled_or_explicitly_routed`
- `test_generic_part1_labels_are_not_promoted_without_identity_support`
- `test_dynamic_state_sources_are_current_state_d3_only`
- `test_historical_and_transition_material_does_not_become_d3_state`
- `test_pc_control_report_confirms_all_four_false_permissions`
- `test_source_fallback_rows_have_all_required_audit_fields`

- [ ] **Step 2: Run boundary tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CPopulationBoundaryTests -v`

Expected: FAIL because complete ledgers and reports do not yet exist.

- [ ] **Step 3: Implement complete ledgers and routing**

Generate exactly one old-claim ledger row per claim and explicit routes for every unresolved relevant issue. Preserve all permitted route enums and draft-only cross-layer patches without applying them.

- [ ] **Step 4: Enforce D3 and PC source boundaries**

Reject any dynamic-state item whose evidence is not explicitly `current_state.md:D3`. Report absent character-specific current facts as unknown rather than copying history. Validate the PC permissions in both package and candidate.

- [ ] **Step 5: Generate population audits and rerun tests**

Run:

`python scripts/prepare_phase3d_r2c_packages.py`

`python scripts/build_phase3d_r2c.py`

`python -m unittest tests.test_phase3d_r2c.Phase3DR2CPopulationBoundaryTests -v`

Expected: all population/boundary tests pass.

### Task 6: Chinese human-review projections and audit summaries

**Files:**
- Modify: `scripts/build_phase3d_r2c.py`
- Modify: `tests/test_phase3d_r2c.py`
- Generate: `work/phase3d_r2c/reviews/by_character/<PROFILE_ID>.md`
- Generate: `work/phase3d_r2c/reports/human_review_quality_report.md`
- Generate: `work/phase3d_r2c/reports/migration_summary.md`

**Interfaces:**
- Consumes: package, generated candidate, central event titles and ledgers.
- Produces: `render_character_review(package, candidate, event_catalog) -> str`, `review_quality_errors(markdown, package) -> list[str]`.

- [ ] **Step 1: Write failing review quality tests**

Add tests named:

- `test_every_candidate_has_one_thirteen_section_chinese_review`
- `test_review_explains_events_without_requiring_id_decoding`
- `test_review_item_ids_and_claim_dispositions_match_candidate_and_ledgers`
- `test_timeline_headings_include_story_order_and_chinese_title`
- `test_sparse_persona_and_unknown_current_state_are_stated_explicitly`
- `test_review_calls_out_theory_testimony_future_and_prohibited_inference`

- [ ] **Step 2: Run review tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CHumanReviewTests -v`

Expected: FAIL because the renderer and review files do not exist.

- [ ] **Step 3: Implement the thirteen-section renderer**

Render readable Chinese descriptions first, followed by event/revelation/source provenance. Never use a technical ID as the only explanation. Include retained, moved, split, added, demoted, removed/routed and unresolved changes from the old profile.

- [ ] **Step 4: Implement readability gates and reports**

Require all sections, readable event titles, non-empty explanation for each technical event, and explicit unknown/prohibited-inference sections. Generate per-profile results and aggregate quality metrics.

- [ ] **Step 5: Build reviews and verify GREEN**

Run:

`python scripts/build_phase3d_r2c.py`

`python -m unittest tests.test_phase3d_r2c.Phase3DR2CHumanReviewTests -v`

Expected: every candidate review passes.

### Task 7: Final boundary report, determinism and full regression

**Files:**
- Modify: `scripts/build_phase3d_r2c.py`
- Modify: `tests/test_phase3d_r2c.py`
- Generate: `work/phase3d_r2c/reports/r2c_review.md`
- Update: `.superpowers/sdd/2026-09-30-phase3d-r2c-character-profile-v2/progress.md`

**Interfaces:**
- Consumes: every focused gate and generated artifact.
- Produces: final completion status, `--check` mode and verification evidence.

- [ ] **Step 1: Write failing completion-boundary tests**

Add tests named:

- `test_ready_status_requires_all_schema_semantic_review_and_boundary_gates`
- `test_frozen_earlier_artifacts_remain_byte_identical`
- `test_no_worldbook_or_current_state_mutation`
- `test_no_approved_or_applied_patch`
- `test_no_formal_profile_database_runtime_card_director_or_phase4_output`
- `test_check_mode_detects_generated_drift_without_rewriting`

- [ ] **Step 2: Run completion tests to verify RED**

Run: `python -m unittest tests.test_phase3d_r2c.Phase3DR2CCompletionTests -v`

Expected: FAIL until the final gate/report and check mode exist.

- [ ] **Step 3: Implement final gate and review report**

Emit `READY_FOR_HUMAN_APPROVAL_AFTER_R2` only when every required gate passes. Otherwise emit the exact blocked status and defects without weakening validation.

- [ ] **Step 4: Run the complete focused suite**

Run: `python -m unittest tests.test_phase3d_r2c -v`

Expected: all R2C tests pass.

- [ ] **Step 5: Perform two independent builds and byte comparison**

Build into two temporary roots using the same packages, compare relative file sets and SHA-256 for every generated R2C artifact.

Expected: zero missing files and zero byte differences.

- [ ] **Step 6: Run read-only check mode**

Run: `python scripts/build_phase3d_r2c.py --check`

Expected: all committed generated artifacts equal a fresh in-memory/staged build; no files change.

- [ ] **Step 7: Run the entire regression suite**

Run: `python -m unittest discover -s tests`

Expected: zero failures and zero errors.

- [ ] **Step 8: Whole-change self-review and final ledger entry**

Review all forty mandatory requirements, named character safeguards, package/candidate/review consistency, source fallback, schema freeze, frozen hashes, forbidden artifacts and final stop boundary. Fix any verified defect through a fresh RED-to-GREEN cycle. Record focused/full test counts, candidate/package counts, claim/route metrics, deterministic file count, frozen-file count and final status.
