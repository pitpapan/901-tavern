# Phase 3D Human Review and Approval Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Semantically review all 36 frozen Phase 3B/3C profiles, produce corrected review candidates and approval material, and stop at `READY_FOR_HUMAN_APPROVAL` without formal integration because no explicit human approval has been supplied.

**Architecture:** A deterministic Phase 3D builder inventories frozen candidates, hashes the full protected set, copies reviewed candidates into a separate Phase 3D directory, and emits review/approval artifacts from explicit review decisions. Structural tests guard population, lineage, draft patch state, PC separation, frozen-input integrity, and the absence of formal databases. Semantic decisions remain explicit per-profile records and never mutate Phase 3B/3C artifacts.

**Tech Stack:** Python 3.12 standard library, JSON/JSONL, Markdown, `unittest`, existing offline validators.

**Spec:** `C:/Users/pit/.codex/attachments/6cd51c9e-27c1-41f0-aab6-5065a4ce972e/已粘贴的文本.txt`

## Global Constraints

- Stop at `READY_FOR_HUMAN_APPROVAL`; do not create `output/npc_profiles.jsonl` or `output/pc_continuity.jsonl` without explicit human approval.
- Preserve Phase 1–3C artifacts byte-for-byte; Phase 3B/3C candidates, evidence, and batch files are immutable.
- Do not create Character/GM Cards, runtime systems, Director material, future plot, SillyTavern exports, or continuation play.
- Every correction weakens, scopes, or repairs existing material; Phase 3D does not discover NPCs or enrich sparse profiles.
- All 36 patches remain `operation=add`, `status=draft`, with no approval/application metadata.
- PC control permissions remain fixed and no NPC relation may authorize PC speech, thought, emotion, goal, decision, or action.

## Review Focus

- Candidate/evidence path mismatches must fail inventory construction instead of silently dropping a profile.
- A profile marked `RECOMMENDED_FOR_APPROVAL` must have a complete per-profile review and a Phase 3D candidate with preserved lineage.
- Presence facts sourced only from `current_state.md` must preserve transition provenance without making `authorial_supplement` a runtime realm.
- Human approval must remain pending across manifests, patches, and the absence of formal databases.
- Protected hash coverage must include every Phase 3B/3C profile, evidence packet, batch review, and prior review artifact.

---

### Task 1: Preflight inventory and protected hash freeze

**Files:**
- Create: `scripts/build_phase3d_review.py`
- Create: `tests/test_phase3d_review.py`
- Create: `work/phase3d_preflight.md`
- Create: `work/phase3d_review_manifest.json`

**Interfaces:**
- Consumes: frozen Phase 3B/3C profile/evidence/patch paths and `output/worldbook_source.jsonl`.
- Produces: deterministic 36-row manifest plus a complete `protected_files` SHA-256 mapping used by Tasks 2–4.

- [ ] Write failing inventory/hash tests for exact 35 NPC + 1 PC counts, unique mappings, exact candidate/evidence/patch paths, PC boundary, and required protected path classes.
- [ ] Run `python -m unittest tests.test_phase3d_review -v` and confirm failure because Phase 3D artifacts do not exist.
- [ ] Implement deterministic discovery, count/stat extraction, patch linkage, and protected-hash inventory.
- [ ] Generate the preflight Markdown and JSON manifest.
- [ ] Re-run the Phase 3D tests and existing profile/patch validators.

### Task 2: Semantic review and corrected candidate set

**Files:**
- Modify: `scripts/build_phase3d_review.py`
- Modify: `tests/test_phase3d_review.py`
- Create: `work/phase3d/approved_candidates/*.json`
- Create: `work/phase3d/reviews/*_review.md`

**Interfaces:**
- Consumes: Task 1 manifest plus all 36 frozen profiles and evidence packets.
- Produces: 36 separately stored reviewed candidates and 36 review records with A/B/C class, section verdicts, corrections, rejected-evidence notes, and final `RECOMMENDED_FOR_APPROVAL` or blocker status.

- [ ] Write failing tests for exact review/candidate counts, immutable lineage hashes, required review headings, no unsupported entity, PC permissions, draft patch state, and explicit approval-pending status.
- [ ] Run the focused tests and confirm they fail for missing review artifacts.
- [ ] Inspect every populated claim/state field against its evidence packet; reopen cited sources only where support, layer, presence, relationship, or knowledge scope is unclear.
- [ ] Encode only necessary targeted corrections and generate the separate reviewed candidate set and per-profile reviews.
- [ ] Validate all 36 reviewed candidates together and run the focused tests.

### Task 3: Approval manifest and Phase 3D report

**Files:**
- Modify: `scripts/build_phase3d_review.py`
- Modify: `tests/test_phase3d_review.py`
- Create: `work/phase3d_approval_manifest.md`
- Create: `work/phase3d_review.md`

**Interfaces:**
- Consumes: Tasks 1–2 manifest, reviews, corrected candidates, validator results, and explicit human-approval state (absent in this run).
- Produces: exact-count approval/report artifacts with every profile `PENDING_HUMAN_APPROVAL`, patches still draft, and formal integration explicitly withheld.

- [ ] Write failing tests for all 36 approval rows, zero `APPROVED`, exact integration ineligibility, report sections/counts, and absent formal databases.
- [ ] Run the focused tests and confirm failure for missing approval/report artifacts.
- [ ] Generate deterministic approval and final review reports from reviewed artifacts.
- [ ] Re-run focused tests and validators.

### Task 4: Final integrity, determinism, and independent review

**Files:**
- Modify only Phase 3D artifacts or tests when a verified finding requires it.

**Interfaces:**
- Consumes: complete Phase 3D output set.
- Produces: fresh verification evidence and final `READY_FOR_HUMAN_APPROVAL` stop state.

- [ ] Regenerate Phase 3D artifacts twice and compare all generated bytes.
- [ ] Verify the protected manifest against disk with zero mismatches.
- [ ] Run both validators and `python -m unittest discover -s tests -v`.
- [ ] Dispatch a fresh read-only final reviewer against the Phase 3D spec and artifacts; fix Critical/Important findings with regression coverage.
- [ ] Re-run all final verification and stop without Phase 4 or formal integration.

