# HAP-0-R Readable Profile Approval Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic Chinese-first human approval projection for all 37 closed R2C character profiles without modifying production.

**Architecture:** A strict Python generator reads frozen candidates/packages, applies fixed presentation mappings only, validates semantic/readability invariants, renders all outputs into staging twice, byte-compares them, and atomically publishes only the approval tree and three requested docs. Tests exercise the real generator against production and controlled mutations.

**Tech Stack:** Python 3 standard library, `unittest`, Markdown, JSON/JSONL.

**Spec:** `docs/superpowers/specs/2026-10-01-hap0r-readable-profile-approval-design.md`

## Global Constraints

- Chinese-first main body; technical IDs only in the appendix.
- No Canon, Worldbook, Current State, R2A, R2B, schema, frozen manifest, or R2C production change.
- Production fingerprint must remain `cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`.
- Amendment hash must remain `b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817`.
- Approval Markdown is a readable projection, never semantic authority.
- No Phase 4 work.

## Review Focus

- An unknown English relationship baseline must fail rather than leak or receive an inferred translation.
- Main-body readability scanning must exclude the technical appendix but reject ID headings and raw dumps before it.
- Null relationship stance must render only as “未确认”.
- PC facts must not authorize private thought, dialogue, future choice, or commitment.
- A failed second-stage comparison or production-fingerprint change must prevent publication.

---

### Task 1: Readable projection core

**Files:**
- Create: `tests/test_hap0r_readable_approval.py`
- Create: `scripts/build_hap0r_approval_package.py`

**Interfaces:**
- Consumes: frozen R2C candidate/package JSON and fixed hashes.
- Produces: `render_profile(candidate, package, context) -> str`, `audit_profile_markdown(text) -> dict`, and staged approval files.

- [ ] Write failing tests for structure, Chinese-first headings, appendix separation, null stance, unknown-baseline failure, Youyou/Ainz/PC anchors, and mutation detection.
- [ ] Run the tests and verify they fail because the generator does not exist.
- [ ] Implement the minimal deterministic projection and validators.
- [ ] Run the focused suite and verify it passes.

### Task 2: Index, batches, closure manifest, and publication

**Files:**
- Modify: `tests/test_hap0r_readable_approval.py`
- Modify: `scripts/build_hap0r_approval_package.py`
- Generate: `docs/remediation/R1A_CLOSURE_MANIFEST.md`
- Generate: `docs/human_approval/R1A_CLOSED_PROFILE_APPROVAL_INDEX.md`
- Generate: `docs/human_approval/R1A_CLOSED_APPROVAL_BATCHES.md`
- Generate: `work/human_approval/r1a_closed/by_profile/*.md`

**Interfaces:**
- Consumes: Task 1 rendering/audit functions.
- Produces: `build_staged_package(root) -> BuildResult`, deterministic A/B comparison, and atomic approval publication.

- [ ] Add failing tests for 37/36/1 coverage, exact batch membership, no extras, required files, deterministic bytes, and production fingerprint preservation.
- [ ] Run the tests and verify the new assertions fail before implementation.
- [ ] Implement staging, aggregate validation, A/B comparison, and approval-only atomic publication.
- [ ] Run focused and full test suites.

### Task 3: Final evidence and self-review

**Files:**
- Update: `.superpowers/sdd/2026-10-01-hap0r-readable-profile-approval/progress.md`

**Interfaces:**
- Consumes: published approval package and test output.
- Produces: final HAP-0-R metrics and review record.

- [ ] Recompute production fingerprint and amendment hash after publication.
- [ ] Generate twice into independent temporary roots and require zero byte differences.
- [ ] Run readability and semantic-consistency audits across all profiles.
- [ ] Run canonical checks and complete unittest discovery.
- [ ] Perform a separate whole-change self-review because subagent delegation was not requested and is disallowed by the active developer instruction.
