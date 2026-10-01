# Phase 3D-R Character Continuity Recall Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all 36 Phase 3D profiles for source-coverage recall, repair confirmed omissions without weakening precision boundaries, and prepare a new human-approval gate without formal integration.

**Architecture:** A deterministic Phase 3D-R builder freezes Phase 1–3D inputs, inventories original-source matches for every character, applies only explicit reviewed recall decisions to separate repaired candidates, and emits per-character coverage/review records plus cross-profile event audits. Regression tests pin verified factual repairs, Phase 3D lineage, PC authority, patch draft state, deterministic output, and protected hashes.

**Tech Stack:** Python 3.12 standard library, JSON/JSONL, Markdown, PowerShell source inspection, `unittest`, existing offline validators.

**Spec:** `C:/Users/pit/.codex/attachments/69435536-ddc8-4d81-bb68-17710ad8687a/已粘贴的文本.txt`

## Global Constraints

- Preserve all Phase 1–3D historical artifacts byte-for-byte; write recall outputs only under `work/phase3d_recall/` and `work/phase3d_recall_review.md`, except draft patch references when a repaired profile requires them.
- Treat human-raised leads as search leads until original sources confirm exact scope.
- Keep all 36 patches `operation=add`, `status=draft`, with no approval or application metadata.
- Do not create formal profile databases, Phase 4 runtime systems, cards, exports, Director material, continuation play, or future plot.
- Preserve PC no-autonomy permissions exactly.
- Every high-value source-backed item must be `PROFILED`, `ROUTED_ELSEWHERE`, or `SEEN_NOT_PROMOTED`; no unresolved high-value `MISSING` or `EVENT_CONFLATION` item may remain for a passing result.

## Review Focus

- Source matching must distinguish a character name from unrelated homonyms and generic aliases.
- Event identity must preserve WHO/WHEN/WHERE/WHAT/RESULT, especially Prison Tower versus underground military factory.
- Compact/minimal depth must not suppress a major control, inheritance, death, or relationship milestone.
- Cross-profile repairs must preserve each participant's knowledge scope instead of cloning objective prose.
- Repaired candidates and modified draft patches must retain all valid Phase 3D corrections and remain deterministic.

---

### Task 1: Preflight freeze and source-coverage inventory

**Files:**
- Create: `scripts/build_phase3d_recall.py`
- Create: `tests/test_phase3d_recall.py`
- Create: `work/phase3d_recall/preflight_manifest.json`
- Create: `work/phase3d_recall/source_coverage_manifest.json`
- Create: `work/phase3d_recall/source_coverage/*_coverage.md`

**Interfaces:**
- Consumes: 36 Phase 3D candidates, Phase 3B/C evidence packets, original Campaign/setting sources, Phase 3D protected manifest.
- Produces: exact 36-profile inventory, protected SHA-256 map, discovered source-file matches, and per-profile coverage skeletons consumed by later tasks.

- [x] Write failing tests for exact population/depth counts, 36 coverage files, source-search scope, frozen Phase 3D hashes, and required coverage headings/classification vocabulary.
- [x] Run focused tests and confirm failure because Phase 3D-R artifacts do not exist.
- [x] Implement deterministic discovery, source search, hash freeze, and atomic coverage generation.
- [x] Generate Task 1 artifacts and run focused tests plus existing validators.

### Task 2: Mandatory lead and major-event evidence audit

**Files:**
- Modify: `scripts/build_phase3d_recall.py`
- Modify: `tests/test_phase3d_recall.py`
- Create: `work/phase3d_recall/event_audits/*.md`
- Create: `work/phase3d_recall/cross_profile_audits/*.md`

**Interfaces:**
- Consumes: Task 1 source inventory plus reopened original sources.
- Produces: resolved WHO/WHEN/WHERE/WHAT/RESULT records and profile-specific propagation decisions for Youyou, Xierlun, White Magician, Oshira, Deathwing, Yu Linfeng, and other affected profiles.

- [x] Reopen and record original source excerpts for the eight mandatory events and all human-raised leads.
- [x] Write failing factual-regression tests only after source verification, including event-location identity and cross-profile participation boundaries.
- [x] Generate event and cross-profile audits with objective facts, cognition limits, consequences, affected profiles, and representation status.
- [x] Run focused tests and verify zero unresolved event conflation.

### Task 3: Recall repairs and draft-patch lineage

**Files:**
- Modify: `scripts/build_phase3d_recall.py`
- Modify: `tests/test_phase3d_recall.py`
- Create: `work/phase3d_recall/repaired_candidates/*.json`
- Modify only when required: `work/patches/pending/PATCH_*.json`

**Interfaces:**
- Consumes: Task 2 verified decisions and Phase 3D candidates.
- Produces: separate repaired profiles for every confirmed omission, preserving Phase 3D corrections; corresponding draft patches point to repaired candidates.

- [x] Write failing tests for every verified repair, Phase 3D correction preservation, PC permissions, major-history retention independent of depth, and exact patch draft/add state.
- [x] Implement the minimal evidence-backed repairs with atomic deterministic writes.
- [x] Generate separate recall-patch lineage/payload references without approval metadata while preserving historical patches byte-for-byte.
- [x] Validate the complete effective profile set and all patches; run focused tests.

### Task 4: Complete 36-profile recall reviews and Canon-gap reporting

**Files:**
- Modify: `scripts/build_phase3d_recall.py`
- Modify: `tests/test_phase3d_recall.py`
- Create: `work/phase3d_recall/reviews/*_recall_review.md`
- Create: `work/phase3d_recall/reports/canon_gap_report.md`
- Create: `work/phase3d_recall_review.md`

**Interfaces:**
- Consumes: source coverage, event audits, and the effective repaired/unchanged profile set.
- Produces: 36 explicit completeness decisions, exact coverage metrics, Canon-gap routing, reclassified approval recommendations, and the final stop state.

- [x] Write failing tests for all required review/report headings, exact 36 statuses, zero silent fifth-state items, exact metrics, and absent formal databases.
- [x] Generate per-profile recall reviews and final reports from explicit decisions.
- [x] Confirm all high-value items resolve to the permitted classifications and no unresolved blocker is hidden.
- [x] Run focused tests and validators.

### Task 5: Determinism, protected hashes, regression, and independent review

**Files:**
- Modify only Phase 3D-R artifacts/tests or mutable draft patches when a verified finding requires it.

**Interfaces:**
- Consumes: complete Phase 3D-R output set.
- Produces: fresh validation evidence and either `READY_FOR_HUMAN_APPROVAL_AFTER_RECALL_AUDIT` or an exact blocker list.

- [x] Rebuild Phase 3D-R outputs twice and compare every generated byte.
- [x] Verify all protected hashes, including byte-identical historical draft patches.
- [x] Run profile validation, patch validation, focused tests, and the full regression suite.
- [x] Dispatch one fresh read-only final reviewer against the spec, Review Focus, sources, repairs, and reports; fix Critical/Important findings via RED→GREEN.
- [x] Re-run final verification and stop without approval, formal integration, or Phase 4.
