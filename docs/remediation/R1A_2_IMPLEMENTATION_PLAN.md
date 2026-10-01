# R1A-2 Semantic Routing Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:test-driven-development` for each implementation task and `superpowers:verification-before-completion` before reporting completion.

**Goal:** Replace legacy-section-driven background conversion for the 145 audited records with the exact reviewed semantic routes frozen by R1A-1, then deterministically rebuild all R2C provisional artifacts without changing frozen inputs or Canon.

**Architecture:** `semantic_adjudication_ledger.jsonl` is the sole reviewed semantic routing surface for the audited population. Package preparation validates exact live exposure, dispatches each atomic semantic identity to existing R2C constructors, realizes explicit splits, and records destination lineage. Candidate/review generation remains a deterministic projection of packages. A semantic-identity validator rejects incompatible unsanctioned duplication.

**Tech Stack:** Python 3.12, `unittest`, JSON/JSONL, existing R2C schemas and deterministic/atomic-write helpers.

**Spec:** `docs/remediation/R1A_1_SEMANTIC_CONTRACT_AND_AUDIT.md`

## Global constraints

- Do not alter the adjudication ledger to make implementation tests pass. A disputed semantic decision returns to R1A-1 review.
- Do not modify original sources, Phase 3C, Phase 3D/3D-R inputs, R2A, R2B, schemas, frozen manifests, Canon, Worldbook, or Current State.
- Do not infer D3 state from historical persistence.
- Preserve Special Interlude isolation, uncertainty, attribution, source refs, stable R2A event IDs, story order, PC control boundaries, atomic writes, deterministic ordering, and frozen hashes.
- Keep all outputs provisional and human-reviewable. Do not create formal profile databases or enter Phase 4.
- The 16 top-level identity claims already using non-background high-risk reroutes are not in the 145-record ledger; preserve them and deduplicate compatible realized targets.
- Stop before regeneration if an adjudicated route cannot be represented losslessly by the frozen R2C schema.

## Review focus

Reviewers should concentrate on exact ledger coverage, route-specific reality/temporal semantics, split provenance, relationship routing, duplicate prevention, and the semantic-identity invariant. Formatting-only review is insufficient.

---

### Task 1: Add a strict R1A-1 ledger loader

**Files:**

- Create: `scripts/phase3d_r2c_semantic_routes.py`
- Modify: `tests/test_phase3d_r2c.py`
- Read: `work/remediation/r1a1/semantic_adjudication_ledger.jsonl`

**Step 1 — Write failing tests**

Add tests that require:

- exactly 145 unique `(profile_id, old_claim_id)` records;
- 116 identity and 29 relationship records across 35 profiles;
- exact equality between the live exposed key set and ledger key set;
- rejection of duplicates, missing/extra decisions, `UNRESOLVED`, unknown destination sections, unknown event refs, unsorted records, and `human_semantic_review_required != true`;
- routes restricted to the existing field-level vocabulary frozen in R1A-1.

Run:

```powershell
python -m unittest tests.test_phase3d_r2c.Phase3DR2CSemanticRoutingLedgerTests
```

Expected: FAIL because the production loader does not exist.

**Step 2 — Implement the minimum loader**

Implement immutable loading/indexing helpers. Reuse deterministic JSONL utilities. Do not import audit decisions directly: production consumes the enriched ledger and verifies its exact key coverage against live package/profile exposure.

**Step 3 — Run the focused tests**

Expected: PASS with no production artifact writes.

### Task 2: Add route-specific constructors and realization tests

**Files:**

- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `scripts/phase3d_r2c_semantic_routes.py`
- Modify: `tests/test_phase3d_r2c.py`

**Step 1 — Write failing constructor/dispatch tests**

For synthetic source claims and reviewed ledger records, assert that each allowed route creates an item in exactly the named R2C section with preserved statement, source refs, uncertainty, attribution, ledger lineage, and event refs. Assert that `split_required` records realize every listed route as distinct destination IDs.

Expected: FAIL because current code has only unconditional history-to-background conversion plus special overrides.

**Step 2 — Implement explicit route dispatch**

Add route-specific builders for:

- `biographical_background`;
- `campaign_timeline` by reuse/merge of the existing `timeline_item` for each reviewed R2A `event_ref`;
- `identity.public_identity`, `identity.durable_roles`, and `identity.durable_affiliations`;
- `persona.core_personality` and `persona.values`;
- `relationships[].relationship_baseline` and `relationships[].relationship_milestones`;
- `ability_status_transitions`;
- `knowledge_timeline`.

Do not synthesize a second event when the package already has the same R2A `event_ref`. Link the old claim migration to the existing timeline destination ID. Where a state item requires temporal fields, populate only source-supported values; keep unsupported bounds null/uncertain.

**Step 3 — Make migration disposition destination-derived**

Choose from existing schema statuses according to realized destinations:

- single biography: `MOVED_TO_BACKGROUND`;
- single timeline: `MOVED_TO_TIMELINE` or `MERGED_WITH_EVENT_REFERENCE` when reusing an existing timeline item;
- single relationship: `MOVED_TO_RELATIONSHIP`;
- single ability/status: `MOVED_TO_ABILITY_STATUS`;
- single knowledge: `MOVED_TO_KNOWLEDGE`;
- identity/persona migration: existing compatible `MIGRATED` / `RETAINED_AS_PERSONA`;
- multiple distinct destinations: `SPLIT`.

`destination_ids` must list every realized target once in deterministic order. `reason` must state that the R1A-1 reviewed route was applied. `supporting_refs` must retain the effective source profile and add `work/remediation/r1a1/semantic_adjudication_ledger.jsonl#<profile_id>:<old_claim_id>`.

### Task 3: Replace identity-history section routing

**Files:**

- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `tests/test_phase3d_r2c.py`

**Step 1 — Add the source-derived Ainz and generic RED regressions from the regression plan.**

Expected: the current implementation fails because Ainz Campaign claims remain background.

**Step 2 — Replace unconditional conversion for the 116 audited identity records.**

Iterate the live legacy claims, look up their exact ledger records, realize the reviewed routes, and remove the legacy-section-based `MOVED_TO_BACKGROUND` branch for that population. Do not add character-name conditionals.

**Step 3 — Preserve existing high-risk reroutes outside the audited set.**

Keep the 16 already-rerouted identity decisions semantically unchanged. Refactor their application only as needed to avoid duplicate destinations; assert their prior expected results.

**Step 4 — Run focused identity and high-risk test classes.**

Expected: PASS.

### Task 4: Replace relationship-history conversion with a dedicated path

**Files:**

- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `tests/test_phase3d_r2c.py`

**Step 1 — Add RED tests for one background-valid, one Campaign milestone, one persistent baseline/state, and one split relationship record.**

Assert no unconditional `BACKGROUND_REL_*` item is created.

**Step 2 — Implement relationship-specific routing.**

Locate the existing relationship record by legacy relationship identity. Route:

- pre-Campaign relationship biography only when expressly listed;
- Campaign milestones to `relationship_milestones` with R2A `event_ref`, story order, and actual-event semantics;
- durable relationship facts to `relationship_baseline`/source-supported relationship state without inventing current stance;
- split records to distinct linked targets.

Relationship data must no longer pass through `convert_background_claim()` by default.

**Step 3 — Run the relationship-focused tests.**

Expected: PASS and all 29 decisions consumed once.

### Task 5: Add the semantic-identity contradiction validator

**Files:**

- Modify: `scripts/phase3d_r2c_semantic_routes.py`
- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `tests/test_phase3d_r2c.py`

**Step 1 — Write RED unit tests**

The validator must reject:

- one audited `(profile_id, old_claim_id)` realized as both biography and Campaign event when the reviewed route does not include both and `split_required=false`;
- missing listed destinations;
- extra unreviewed destinations;
- two destination records sharing the same semantic destination identity accidentally.

It must accept an explicit event + persistent-state split and a Campaign source chunk that contains a separately adjudicated background claim.

**Step 2 — Implement and call validation before every write/check comparison.**

Index realized targets using migration destination IDs and their R2C sections. Compare them with the reviewed route set for the semantic identity. Never use source-ref overlap as the contradiction key.

**Step 3 — Run focused validator tests.**

Expected: PASS.

### Task 6: Rebuild provisional R2C outputs atomically

**Files generated by existing builders:**

- `work/phase3d_r2c/migration_packages/`
- `work/phase3d_r2c/candidates/by_profile/`
- `work/phase3d_r2c/reviews/by_character/`
- R2C migration/report projections produced by `scripts/build_phase3d_r2c.py`

**Step 1 — Run package generation in normal mode.**

```powershell
python scripts/prepare_phase3d_r2c_packages.py
```

The builder must validate all 145 decisions before atomic output replacement.

**Step 2 — Build candidates/reviews/reports in normal mode.**

```powershell
python scripts/build_phase3d_r2c.py
```

**Step 3 — Inspect representative diffs.**

Inspect Ainz, Cassius Bright, relationship cases, all `SPLIT` migrations, and any artifact outside the expected 35-profile semantic surface. Unexpected changes stop the task.

### Task 7: Full verification and handoff

Run, in order:

```powershell
python -m unittest tests.test_phase3d_r2c
python -m unittest discover -s tests
python scripts/prepare_phase3d_r2c_packages.py --check
python scripts/build_phase3d_r2c.py --check
python scripts/audit_r1a1_semantic_routes.py --check
```

Then verify all 488 frozen manifest entries with the repository helper; rebuild twice and compare every generated R2C file byte-for-byte; confirm PC autonomous-control permissions remain false; inspect Git diff/status; and update only the R1A-2 remediation report with observed results.

Completion requires:

- 145/145 reviewed decisions consumed exactly once;
- zero unresolved/unknown routes;
- zero unsanctioned biography/event semantic conflicts;
- all schemas and tests green;
- deterministic byte equality;
- all frozen hashes unchanged;
- no Canon, Worldbook, Current State, schema, R2A, R2B, Phase 3C, or Phase 3D/3D-R changes.

Stop at `R1A_2_R2C_SEMANTIC_ROUTING_REPAIRED_READY_FOR_HUMAN_REVIEW`. Do not approve profiles or enter Phase 4.
