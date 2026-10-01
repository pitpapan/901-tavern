# R1A-2A.1 Relationship Container Authority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Review and freeze one exact source-supported relationship-container decision for each of the seven R1A-2B blocker pairs without modifying production R2C or the frozen schema.

**Architecture:** A hand-reviewed JSONL decision source records the seven semantic decisions. A read-only validator deterministically enriches it with the accepted R1A-2A milestone payloads, validates complete `RelationshipRecord` candidates against the frozen schema, and writes a separate ledger. Production builders do not consume or write these artifacts in this task.

**Tech Stack:** Python 3.12, JSONL, `unittest`, existing `phase3d_r2c_common` schema validator and atomic writers.

**Spec:** User request “R1A-2A.1 — Resolve the Seven Reviewed Relationship Container Gaps” (2026-10-01), with `docs/remediation/R1A_2B_REPAIR_AND_REBUILD_REPORT.md` as blocker record.

## Global Constraints

- Do not modify schema, Canon, Worldbook, Current State, R2A/R2B, R1A-1/R1A-2A authority, frozen manifest, or production R2C.
- Preserve every accepted R1A-2A milestone payload and instance key unless direct source contradiction is proved.
- Use only `USE_EXISTING_CONTAINER`, `CREATE_REVIEWED_CONTAINER`, `MERGE_REVIEWED_EXISTING_CONTAINERS`, or `SCHEMA_GAP_CONFIRMED`.
- No structural baseline, runtime target selection, unsupported current stance, PC private state, or future commitment.
- Deterministic generation and byte-strict `--check` are mandatory.

## Review Focus

- Existing-container compatibility must be source-semantic, never list-order based.
- New baselines must be atomic source-supported relationship propositions, not schema placeholders.
- All accepted milestone instance keys must be assigned exactly once with no extras.
- Complete containers—not isolated milestones—must validate against the frozen schema.
- The restored 138-file production tree and three prior authority hashes must remain unchanged.

---

### Task 1: Evidence review and decision contract

**Files:**
- Create: `work/remediation/r1a2a1/relationship_container_decisions.jsonl`
- Test: `tests/test_r1a2a1_relationship_containers.py`

**Interfaces:**
- Consumes: seven exact blocker pairs, effective Phase 3D-R profiles, source refs, R2A events, R1A-2A milestone instances.
- Produces: seven exact decision records with the required fields and source-backed payloads.

- [x] Write failing tests for exact pair coverage, field contract, allowed outcomes, milestone-key coverage, and no placeholder baseline.
- [x] Run the tests and confirm failure because the authority/validator is absent.
- [x] Complete the seven source reviews and write only source-supported decisions.

### Task 2: Deterministic container validator and ledger

**Files:**
- Create: `scripts/audit_r1a2a1_relationship_containers.py`
- Create: `work/remediation/r1a2a1/relationship_container_ledger.jsonl`
- Modify: `tests/test_r1a2a1_relationship_containers.py`

**Interfaces:**
- Consumes: decision JSONL, accepted R1A-2A ledger, effective profiles, frozen Profile v2 schema.
- Produces: `build_ledger()`, `summarize()`, deterministic JSONL rendering, write/check CLI.

- [x] Add failing tests for complete-container schema validation, exact target/container resolution, assigned milestone multiset equality, zero runtime selection, duplicates/extras, and deterministic check mode.
- [x] Run tests RED for missing validator.
- [x] Implement the minimal read-only validator and deterministic ledger projection.
- [x] Run tests GREEN; generate ledger twice and prove byte equality.

### Task 3: Report and freeze verification

**Files:**
- Create: `docs/remediation/R1A_2A1_RELATIONSHIP_CONTAINER_REVIEW.md`

**Interfaces:**
- Consumes: validated ledger summary and evidence decisions.
- Produces: final seven-case review report and handoff status.

- [x] Render all seven evidence/container decisions, candidate containers, milestone assignments, schema results, PC boundary, and any genuine gaps.
- [x] Verify 488 frozen inputs, prior authority hashes, production 138-file aggregate hash, and no production file mutation.
- [x] Run R1A-1, R1A-2A, R1A-2A.1, read-only R1A-2B preflight, R2C baseline, and full discovery tests.
- [x] Request an independent final review and fix any Critical/Important finding with a RED→GREEN test.

## Self-review

The plan covers all required artifacts, all seven cases, complete-container validation, deterministic projection, production freeze, exact milestone equality, PC control, final reporting, and the requested verification commands. It introduces no production consumer or schema change.
