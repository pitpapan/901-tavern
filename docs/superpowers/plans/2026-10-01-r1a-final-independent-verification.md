# R1A-FINAL Independent Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Independently verify the published repaired R2C generation without importing or calling the production serializer/equivalence implementation.

**Architecture:** A standalone read-only verifier parses the four accepted authority files, frozen manifest, schema, production packages/candidates/reviews, original R2A chronology, and production source code directly. It builds its own expected and actual inventories, writes a production-external manifest, returns a machine-readable audit summary, and never invokes production generation. Separate shell verification performs immutable check-mode, full-suite, two-stage determinism, old-baseline drift, and source spot-check review.

**Tech Stack:** Python 3 standard library, JSON/JSONL, SHA-256, unittest CLI, PowerShell.

**Spec:** User-supplied `R1A-FINAL — Independent Read-Only Verification of the Repaired R2C Generation` request in this session.

## Global Constraints

- Do not modify production implementation, authority, schema, source, production artifacts, tests, Canon, or Phase 4 state.
- The verifier must not import `scripts/r1a2b_realization_serializer.py` or reuse its semantic/equivalence functions.
- Only the independent helper, remediation manifest, plan/ledger, and final report may be added.
- Any mismatch yields a blocker report; it is not repaired during R1A-FINAL.

## Review Focus

- Common-mode failure: verifier must derive expected and actual inventory through separate code paths.
- Zero-local-object event reuse: require timeline projection without inventing pseudo-event objects.
- Relationship facets: exact R1A-2A.1 selected containers must not erase separate reviewed facets.
- Pre-existing reroutes: exact 16 identities and destinations, not histogram-only checks.
- Read-only proof: production fingerprint must remain unchanged across check mode, tests, and staging determinism.

---

### Task 1: Independent verifier and repaired fingerprint

**Files:**
- Create: `scripts/audit_r1a_final_independent.py`
- Create: `work/remediation/r1a_final/repaired_r2c_manifest.jsonl`

**Interfaces:**
- Consumes: raw authority JSONL, frozen schema, R2A chronology, published packages/candidates/reviews.
- Produces: `run_audit(write_manifest: bool = True) -> dict`, deterministic manifest and aggregate fingerprint.

- [ ] Run a RED import probe proving the verifier does not yet exist.
- [ ] Implement direct authority fingerprint/count validation and deterministic tree manifest.
- [ ] Implement independent expected/actual claim inventories, container checks, parent schema checks, exact reroutes, contradictions, package/candidate/review fidelity, PC boundary, and static implementation/publication audits.
- [ ] Run the verifier twice and require identical summary and manifest bytes.

### Task 2: External read-only verification

**Files:**
- Create: `.superpowers/sdd/2026-10-01-r1a-final-independent-verification/progress.md`

**Interfaces:**
- Consumes: Task 1 summary and manifest.
- Produces: read-only evidence for canonical checks, regression, drift, and staging determinism.

- [ ] Fingerprint production before checks.
- [ ] Run both canonical `--check` commands and the complete 300-test suite.
- [ ] Build two complete generations in temporary staging without publication; compare A/B and published fingerprints.
- [ ] Recompute old/new path drift against the preserved old snapshot.
- [ ] Fingerprint production after checks and require equality.

### Task 3: Source-backed spot-check and final report

**Files:**
- Create: `docs/remediation/R1A_FINAL_INDEPENDENT_VERIFICATION.md`

**Interfaces:**
- Consumes: Tasks 1–2 evidence plus cited original sources.
- Produces: final PASS/BLOCKED report and R1A closure recommendation.

- [ ] Inspect the required Ainz, Cassius, knowledge, ability/status, relationship, Youyou/Yu, and PC cases against raw authority and cited source excerpts.
- [ ] Record Chinese-review fidelity, production drift classification, runtime boundary, and publication review.
- [ ] Write the final report without changing production.
- [ ] Re-run the independent verifier and production fingerprint check before final status.

