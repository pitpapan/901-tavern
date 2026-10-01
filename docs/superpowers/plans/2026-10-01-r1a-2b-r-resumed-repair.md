# R1A-2B-R Resumed Deterministic R2C Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resume the strict R2C repair from the accepted R1A-2A.1 relationship-container authority, publish a fully validated repaired production tree atomically, and prove complete deterministic equivalence without semantic inference.

**Architecture:** Extend the existing strict serializer with a separately loaded, hash-pinned R1A-2A.1 container authority and exact milestone-to-container lookup. Add an independent expected/actual production inventory validator plus exact reroute/contradiction checks. Orchestrate package preparation and all downstream generation in a complete staging tree, validate there, then replace the live R2C root as one recoverable directory transaction.

**Tech Stack:** Python 3.12, JSON/JSONL, `unittest`, existing frozen JSON Schema validator and deterministic atomic writers.

**Spec:** User request “R1A-2B-R — Resume the Deterministic R2C Repair After Relationship-Container Closure” (2026-10-01), with `docs/remediation/R1A_2B_REPAIR_AND_REBUILD_REPORT.md` and `docs/remediation/R1A_2A1_RELATIONSHIP_CONTAINER_REVIEW.md` as historical authority.

## Global Constraints

- Preserve R1A-1, R1A-2A, and R1A-2A.1 authority bytes and required SHA-256 values.
- Do not run semantic materializers, edit the frozen schema, revise Canon, or enter Phase 4.
- Production consumes only reviewed materialized ledgers; runtime semantic inference and fallback remain zero.
- Five R1A-2A.1 containers are authorized structural consequences, not R1A-2A claim-realization extras.
- All seven container decisions and twenty milestone assignments are exact by `(profile_id, target_profile_id, destination_instance_key)`.
- Production publication is whole-tree atomic and happens only after every staging validator passes.
- The restored 138-file baseline must be verified before the first resumed publication.

## Review Focus

- A nonselected exact-target relationship facet must never receive a milestone through list order or target-only matching.
- Independent actual inventory must reject extra audited objects even when all expected objects exist.
- Whole-tree publication failure must restore the previous tree without a mixed generation.
- Exact 16 reroutes must be checked by identity, status, section, and destination—not only histogram.
- Existing and new complete relationship records must all validate at the parent-container level and preserve PC null stance.

---

### Task 1: Complete authority-stack preflight

**Files:**
- Modify: `scripts/r1a2b_realization_serializer.py`
- Modify: `tests/test_r1a2b_realization_serializer.py`

**Interfaces:**
- Consumes: accepted R1A-1/R1A-2A ledgers plus `work/remediation/r1a2a1/relationship_container_ledger.jsonl`.
- Produces: `RelationshipContainerAuthority`, exact pair/milestone lookups, combined preflight summary, and hash/count hard stops.

- [ ] Add failing tests for all four authority hashes, 7 decisions, 20 assignments, 5 create, 2 reuse, 0 merge/gaps/inference, and malformed/missing authority rejection.
- [ ] Run the focused test and verify RED at the missing container-authority interface.
- [ ] Implement strict loading and validation without importing either materializer.
- [ ] Run focused authority tests GREEN.

### Task 2: Exact relationship-container serialization

**Files:**
- Modify: `scripts/r1a2b_realization_serializer.py`
- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `tests/test_r1a2b_realization_serializer.py`
- Modify: `tests/test_phase3d_r2c.py`

**Interfaces:**
- Consumes: Task 1 exact `(profile, target, instance)` decisions.
- Produces: five exact reviewed containers, two exact existing-container selections, and twenty exact milestone attachments; no target inference.

- [ ] Replace the temporary expected-blocker test with failing positive assertions for 7/7, 5/5, 2/2, 20/20, complete-record schema validity, facet preservation, and PC null stance.
- [ ] Run tests RED against the current blocker.
- [ ] Wire `apply_profile_realizations` to pre-create reviewed containers and resolve every governed milestone only through the exact authority key.
- [ ] Preserve existing strict failures and remove only the resolved temporary blocker path for the seven governed pairs.
- [ ] Run serializer and R2C preparation tests GREEN.

### Task 3: Independent equivalence, contradiction, and reroute audit

**Files:**
- Create: `scripts/audit_r1a2br_production_equivalence.py`
- Create: `work/remediation/r1a2b_r/high_risk_reroute_authority.jsonl`
- Modify: `scripts/r1a2b_realization_serializer.py`
- Modify: `scripts/audit_r1a2b_production_drift.py`
- Create or modify: `tests/test_r1a2br_production_equivalence.py`

**Interfaces:**
- Consumes: combined reviewed authority and generated packages/candidates.
- Produces: independently built `ExpectedAuthorityInventory`, `ActualProductionInventory`, bidirectional classifications, exact 16-reroute audit, contradiction summary, and drift categories.

- [ ] Add failing mutation tests for an unauthorized extra object, missing reviewed object, wrong container, wrong reroute destination, stale background, missing split destination, and incomplete parent relationship record.
- [ ] Run tests RED against the expected-only current validator/histogram-only reroute check.
- [ ] Implement independent actual enumeration and four-way classification.
- [ ] Freeze and validate the exact sixteen accepted reroutes including IDs/refs and keep the 2/4/10 histogram secondary.
- [ ] Prove 145 identities, 275 claim instances, 46 splits, 29 relationship identities, mode counts, zero contradictions/extras/fallbacks/heuristics.
- [ ] Run equivalence and regression tests GREEN.

### Task 4: Whole-tree staging and atomic publication

**Files:**
- Modify: `scripts/prepare_phase3d_r2c_packages.py`
- Modify: `scripts/build_phase3d_r2c.py`
- Create: `scripts/rebuild_r1a2br_phase3d_r2c.py`
- Create or modify: `tests/test_r1a2br_atomic_publication.py`

**Interfaces:**
- Consumes: verified 138-file baseline, reviewed authorities, Task 3 validators.
- Produces: complete staged R2C tree, validated publication manifest, recoverable whole-root replace, and deterministic `--check` support.

- [ ] Add failing tests injecting a late auxiliary/validator failure and assert the live tree stays byte-identical.
- [ ] Add a failing successful-publication test requiring all packages, candidates, reviews, ledgers, reports, and preserved frozen inputs to switch together.
- [ ] Run tests RED against incremental live writes.
- [ ] Implement stage-copy, in-stage prepare/build/audit/check, then one recoverable root replacement.
- [ ] Verify Windows-safe rollback on injected publication failure and GREEN tests.

### Task 5: Canonical rebuild, drift proof, determinism, and report

**Files:**
- Create: `docs/remediation/R1A_2B_RESUMED_REPAIR_AND_REBUILD_REPORT.md`
- Modify: R1A-2B-R tests as required by discovered defects.

**Interfaces:**
- Consumes: Tasks 1–4 and restored live baseline.
- Produces: repaired production tree, passing canonical check modes, zero unexpected drift, byte-identical second staging rebuild, and final report.

- [ ] Verify the live starting tree is the accepted 138-file baseline before publication.
- [ ] Run the resumed canonical rebuild once and publish only after all staging gates pass.
- [ ] Run package/build `--check` modes against repaired production.
- [ ] Build again into staging and compare every downstream byte.
- [ ] Classify production drift against the restored baseline and require zero unexpected changes.
- [ ] Run all named focused suites, additional equivalence/atomic suites, and full discovery with zero errors/failures.
- [ ] Reverify 488 frozen inputs and all four authority hashes.
- [ ] Write the resumed report without modifying the historical blocked report.
- [ ] Request a fresh final code review; fix Critical/Important findings through RED→GREEN tests.

## Self-review

The plan separates claim realization from R1A-2A.1 structural authority, includes bidirectional actual inventory, exact reroutes, whole-tree atomic publication, canonical checks, deterministic rebuild, drift classification, and all stop/success conditions. The tasks share explicit authority and staging interfaces in dependency order; no task permits semantic reinterpretation or Phase 4 work.
