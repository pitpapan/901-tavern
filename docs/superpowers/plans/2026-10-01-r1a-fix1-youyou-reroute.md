# R1A-FIX-1 Youyou Reroute Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the dangling Youyou engagement-history migration destination, enforce migration-destination referential integrity globally, rebuild atomically, and independently close R1A.

**Architecture:** Preserve the 16 original high-risk decisions as historical authority and overlay one separately hashed R1A-FIX-1 amendment. The production preparer applies that exact amendment mechanically, while a general resolver inventories real local objects and R2A events and rejects every dangling migration destination. The existing two-stage atomic rebuild remains the only publication path; the independent verifier parses the amendment directly rather than importing production logic.

**Tech Stack:** Python 3 standard library, JSON/JSONL, SHA-256, unittest, PowerShell.

**Spec:** User-supplied `R1A-FIX-1 — Reconcile, Repair, and Re-verify the Single Dangling High-Risk Reroute` request in this session.

## Global Constraints

- Scope semantic review to `NPC_YOUYOU / CLAIM_YOUYOU_ENGAGEMENT_HISTORY` and directly overlapping Youyou → Yu Linfeng authority.
- Do not rewrite R1A-1, R1A-2A, R1A-2A.1, source, R2A, R2B, schema, Canon, Worldbook, Current State, or frozen manifests.
- Preserve the blocked 140-file fingerprint and its manifest as historical evidence.
- Publish only after complete staging validation and deterministic A/B equality.
- Do not enter Phase 4.

## Review Focus

- A coarse legacy milestone must not be restored if its four event semantics are already represented atomically.
- A migration destination may resolve to a local typed object or an authorized R2A event, never merely to a string present in authority.
- The amendment must fail closed if the historical row it overlays drifts.
- Nested goal buckets and every other legitimate migration destination type must be inventoried.
- The independent verifier must consume the amendment directly without sharing the production resolver.

---

### Task 1: Freeze the single semantic amendment

**Files:**
- Create: `work/remediation/r1a_fix1/high_risk_reroute_amendments.jsonl`

**Interfaces:**
- Consumes: original claim/source, old object, R1A-2A atomic instances, R1A-2A.1 selected container.
- Produces: one canonical amendment from the old aggregate ID to four exact reviewed atomic milestone IDs.

- [ ] Record the `SUPERSEDED_BY_REVIEWED_ATOMIC_REALIZATIONS` decision with previous/effective destinations, four replacement instance keys, event refs, source refs, and a no-loss/PC-boundary rationale.
- [ ] Compute and freeze its SHA-256 without changing older authorities.

### Task 2: Add referential-integrity behavior test-first

**Files:**
- Create: `tests/test_r1a_fix1_migration_destination_integrity.py`
- Modify: `scripts/r1a2b_realization_serializer.py`
- Modify: `scripts/prepare_phase3d_r2c_packages.py`

**Interfaces:**
- Consumes: the single amendment and raw package/R2A event objects.
- Produces: amendment loader/overlay, effective high-risk authority, and `validate_migration_destination_references(packages, events)`.

- [ ] Write failing tests for nonexistent milestone rejection, valid local milestone, valid external R2A event, object-removal mutation, exact 15 unchanged + 1 amended high-risk rows, and the global production scan.
- [ ] Run the focused test and confirm RED because the amendment/resolver API is absent.
- [ ] Implement strict amendment hashing/shape validation and mechanical overlay.
- [ ] Implement explicit local object inventory for all production destination kinds plus R2A event resolution.
- [ ] Apply the overlay after the original high-risk ruling and call the validator from canonical preparation/production validation.
- [ ] Run focused and existing R1A-2B/R2C tests to GREEN.

### Task 3: Update the independent verifier and rebuild atomically

**Files:**
- Modify: `scripts/audit_r1a_final_independent.py`
- Create: `work/remediation/r1a_fix1/repaired_r2c_manifest.jsonl`

**Interfaces:**
- Consumes: raw amendment authority and newly published R2C files.
- Produces: independent effective high-risk/referential proof and new stable fingerprint.

- [ ] Add a verifier regression that fails while it still treats the original dangling row as effective.
- [ ] Update the independent verifier to parse/hash the amendment directly and independently resolve all migration destinations.
- [ ] Build staging A and B, run every mandatory validation, require byte equality, and atomically publish.
- [ ] Run both canonical check modes, focused suites, and full discovery.
- [ ] Re-run the independent verifier twice and require identical PASS summaries/manifests.

### Task 4: Record the reconciliation and closure evidence

**Files:**
- Create: `docs/remediation/R1A_FIX1_YOUYOU_REROUTE_RECONCILIATION.md`
- Create: `.superpowers/sdd/2026-10-01-r1a-fix1-youyou-reroute/progress.md`

**Interfaces:**
- Consumes: semantic decision, amendment, test/build/fingerprint evidence.
- Produces: final human-readable R1A-FIX-1 report without rewriting the historical blocked R1A-FINAL report.

- [ ] Record the old payload, exact four-way supersession mapping, global resolver counts, tests, determinism, hashes, new fingerprint, and independent R1A-FINAL result.
- [ ] Verify no frozen or accepted authority changed and no Phase 4 artifact was created.
