# R1A-2B Deterministic R2C Serializer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy-history semantic routing for the audited 145 identities with strict serialization of the accepted 275 R1A-2A destination instances, then deterministically rebuild every downstream R2C artifact.

**Architecture:** A focused realization module loads and validates the accepted ledger, dispatches exact payloads into existing R2C package sections, derives migration disposition from realized output, and audits production equivalence. `prepare_phase3d_r2c_packages.py` keeps existing behavior outside the audited population and the 16 accepted high-risk reroutes, but excludes audited history claims from legacy background conversion before applying the realization serializer.

**Tech Stack:** Python 3.12, `unittest`, existing JSON/JSONL helpers and frozen R2C schemas.

**Spec:** `C:/Users/pit/.codex/attachments/67591608-d894-476f-a88b-a71fefcc7835/已粘贴的文本.txt`; accepted input design: `docs/remediation/R1A_2A_FULL_REALIZATION_SURFACE.md`

## Global Constraints

- R1A-1 and R1A-2A artifacts are read-only runtime authorities.
- Production code must not import or run `scripts/materialize_r1a2a_reviewed_decisions.py`.
- No legacy-prose semantic fallback, clause splitting, target inference, nearest-event selection, persistence inference, or epistemic inference.
- Preserve the 16 accepted high-risk reroutes outside the audited 145 identities.
- Keep the frozen schemas, Canon, Worldbook, Current State, R2A, R2B, Phase 3C/3D/3D-R, and frozen manifests unchanged.
- Preserve PC control and Special Interlude boundaries.
- All production writes happen only after full authority preflight succeeds.

## Review Focus

- Milestone-only relationships without a pre-existing target record must use a non-factual schema carrier and must not invent a durable relationship baseline.
- Event reuse must add only profile-local references to exact R2A event IDs, never pseudo-events or rewritten event identity.
- Audited claims that are also near the 16 high-risk reroutes must not double-create state objects or erase the accepted reroute.
- Multi-instance destinations sharing one route must preserve all instance IDs and event cardinality without accidental deduplication.
- Migration metadata must reflect all realized destination IDs while remaining valid under the frozen migration-package schema.

---

### Task 1: Authority loader and hard-error preflight

**Files:**
- Create: `scripts/r1a2b_realization_serializer.py`
- Create: `tests/test_r1a2b_realization_serializer.py`

**Interfaces:**
- Consumes: `semantic_realization_ledger.jsonl`, R1A-1 ledger, R2A chronology, frozen R2C schemas.
- Produces: `load_realization_authority(root: Path) -> RealizationAuthority` and deterministic validation errors before any production write.

- [ ] Write failing tests for exact 145/275 counts, route equality, mode counts, event/source resolution, duplicate/missing/extra instance rejection, payload-schema rejection, and materializer isolation.
- [ ] Run `python -B -m unittest tests.test_r1a2b_realization_serializer.R1A2BAuthorityTests` and confirm failure because the module/API is absent.
- [ ] Implement immutable authority loading and preflight validation by reusing the accepted R1A-2A audit projection; do not parse legacy claim prose.
- [ ] Run the focused tests and confirm PASS.

### Task 2: Route-specific exact serializer and audited legacy bypass

**Files:**
- Modify: `scripts/r1a2b_realization_serializer.py`
- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `tests/test_r1a2b_realization_serializer.py`

**Interfaces:**
- Consumes: Task 1 `RealizationAuthority`, base package built without audited history projections, R2A event catalog.
- Produces: `apply_realizations(package, authority, events) -> RealizationTrace`; exact destination objects and migration dispositions.

- [ ] Add failing regression tests for Ainz, Bright, Cassandra, Emperor, Gremlin, baseline-only, milestone-only, baseline+milestones, multi-event milestones, genuine background+relationship, testimony, rumor/theory, memory validity, multi-event knowledge, background/event abilities, unknown state/persistence, and PC boundaries.
- [ ] Add failing tests proving audited claims never survive through generic history-to-background conversion and missing authority hard-fails.
- [ ] Implement route dispatch for all eleven accepted destination sections, exact event reuse, relationship target attachment, neutral milestone-only carriers, and exact typed payload copying.
- [ ] Change package preparation so audited identity/relationship history claims bypass generic conversion; retain all non-audited conversions and apply the 16 high-risk overrides unchanged.
- [ ] Derive each audited migration status/destination IDs/reason/supporting refs from realized instances.
- [ ] Run focused tests and `tests.test_phase3d_r2c`; confirm PASS.

### Task 3: Contradiction and production-equivalence audit

**Files:**
- Modify: `scripts/r1a2b_realization_serializer.py`
- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `scripts/build_phase3d_r2c.py`
- Modify: `tests/test_r1a2b_realization_serializer.py`

**Interfaces:**
- Consumes: realized migration packages and Task 2 traces.
- Produces: `audit_realized_packages(packages, authority) -> dict`, hard errors for missing/extra/conflicting realization, and `reports/r1a2b_semantic_equivalence.json` in downstream builds.

- [ ] Add failing tests for 145/275 equivalence, 46 splits, 29 relationship-history identities, exact mode counts, unauthorized event/background duplication, stale `BACKGROUND_REL_*`, unsupported current stance, and 16/16 high-risk preservation.
- [ ] Implement contradiction/equivalence validation keyed by `(profile_id, old_claim_id, destination_section, destination_instance_key)` rather than source chunks.
- [ ] Add the deterministic semantic audit to canonical downstream build outputs without changing frozen schemas.
- [ ] Run focused tests and baseline R2C tests; confirm PASS.

### Task 4: Pre-write snapshot, canonical rebuild, deterministic verification, and report

**Files:**
- Rebuild: `work/phase3d_r2c/migration_packages/`
- Rebuild: `work/phase3d_r2c/migration/`
- Rebuild: `work/phase3d_r2c/candidates/`
- Rebuild: `work/phase3d_r2c/reviews/`
- Rebuild: `work/phase3d_r2c/reports/`
- Create: `work/remediation/r1a2b/semantic_before_after_audit.json`
- Create: `docs/remediation/R1A_2B_REPAIR_AND_REBUILD_REPORT.md`

**Interfaces:**
- Consumes: canonical package preparer, builder, equivalence audit, pre-repair production snapshot.
- Produces: deterministic repaired production R2C tree and final evidence report.

- [ ] Capture pre-rebuild hashes and semantic counts before the first production write.
- [ ] Run authority preflight and frozen-input verification; stop on any mismatch.
- [ ] Run canonical package rebuild followed by downstream build in dependency order.
- [ ] Classify production diffs into reviewed 145-identity consequences versus unexpected drift; hard-fail on unrelated drift.
- [ ] Run package/build `--check` modes, all focused/baseline/full tests, and verify 488/488 frozen inputs.
- [ ] Hash repaired production artifacts, rebuild again, and prove zero byte differences.
- [ ] Search production code for prohibited runtime semantic heuristics and materializer imports.
- [ ] Write the required report with machine-readable before/after counts and the exact final status.
