# Phase 3C Batch Character Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build evidence-backed, human-review-only NPC profile candidates for every remaining eligible Worldbook character selected by the Phase 2.5 runtime-role inventory.

**Architecture:** Derive a deterministic inventory by joining canonical `CHARACTER_*` entries to reviewed runtime roles, then process five operational batches. Each built NPC receives a source-first evidence packet, a schema-valid profile, and one draft add patch; batch and final reviews prove contamination, provenance, runtime-safety, and protected-artifact boundaries.

**Tech Stack:** Markdown evidence/review artifacts, JSON NPC profiles and Canon patches, Python `unittest`, existing profile and authoring validators.

**Spec:** `C:/Users/pit/.codex/attachments/445a257e-2d5a-4d09-873d-63848ce9f6e9/已粘贴的文本.txt`

## Global Constraints

- Do not create Character Cards, GM Cards, runtime engines, SillyTavern exports, Director material, future plot, or future character roles.
- Do not approve or apply patches and do not create a formal NPC database.
- Do not mutate protected Phase 1–3B artifacts.
- Every profile claim must preserve source, origin, evidence mode, stability, context, and exceptions.
- Preserve Canon-layer, knowledge, relationship, goal, presence, deceased, Special Interlude, and PC-control boundaries.
- Evidence scarcity produces sparse data or deferral, never invention.
- Forbidden fields and the unsupported erroneous entity name remain absent.

## Review Focus

- Runtime-role rows created before Phase 2.6 have blank `worldbook_id`: join them to the new canonical entries by exact canonical name without inventing aliases.
- Current state is sparse for most NPCs: historical last appearance must not become current location, alliance, emotion, or intent.
- Deceased characters must remain `historical_only`; Deathwing's defeated current body must not become permanent death.
- Special Interlude profiles must remain `special_interlude_only` and never leak to main-world projection.
- Full/compact/minimal depth must remain independent from future importance and narrative availability.

---

### Task 1: Preflight, Protected Baseline, and Authoritative Inventory

**Files:**
- Create: `work/phase3c/protected_baseline.json`
- Create: `work/phase3c_inventory.md`
- Create: `tests/test_phase3c_profiles.py`

**Interfaces:**
- Consumes: canonical character rows, reviewed Phase 2.5 runtime roles, Phase 3B prototype mappings.
- Produces: exact 36-character disposition inventory, exact 31-profile build set, deterministic batch membership, protected hash baseline.

- [ ] Write inventory/profile-set tests first and run them to observe missing-artifact failures.
- [ ] Record protected hashes for the complete Phase 1–3B set.
- [ ] Build the inventory with all required fields and dispositions; mark Phase 3B subjects `ALREADY_PROTOTYPED`, the PC `EXCLUDE_NON_NPC`, and the remaining reviewed NPCs by BUILD depth.
- [ ] Run the inventory tests and the existing full suite.

### Task 2: Batch 01 — Full Companion and Relationship-Heavy Profiles

**Files:**
- Create evidence/profile/patch artifacts for `NPC_CASSIUS_BRIGHT`, `NPC_HAKU`, `NPC_YOMI_ISAYAMA`, `NPC_ELDER_XUE`, `NPC_JIANG_ZIYOU`.
- Create: `work/phase3c/batches/batch_01_review.md`

**Interfaces:**
- Consumes: inventory build set and primary Campaign/character-reference sources.
- Produces: five full candidates and PATCH_4001–PATCH_4005.

- [ ] Extend tests for exact batch mappings and run RED.
- [ ] Read primary source material and create evidence packets before JSON.
- [ ] Build profiles and draft patches.
- [ ] Validate batch profiles/patches, inspect gaps/contamination, run full regression, and write exact batch review.

### Task 3: Batch 02 — Full Authority and Knowledge-Complex Profiles

**Files:**
- Create evidence/profile/patch artifacts for `NPC_AINZ_OOAL_GOWN`, `NPC_XIERLUN_VON_GILCODE`, `NPC_OSHUTORU`, `NPC_MU_SHAOAI`, `NPC_WOSIS`.
- Create: `work/phase3c/batches/batch_02_review.md`

**Interfaces:**
- Consumes: inventory and primary Campaign/setting sources.
- Produces: five full candidates and PATCH_4006–PATCH_4010.

- [ ] Extend tests and run RED.
- [ ] Create evidence packets from Campaign-only evidence, excluding franchise knowledge.
- [ ] Build profiles/patches with authority, disguise, political, and epistemic partitions.
- [ ] Validate batch and accumulated set, run contamination/full tests, and write review.

### Task 4: Batch 03 — Full Approved Referential and Historical Profiles

**Files:**
- Create evidence/profile/patch artifacts for `NPC_DEATHWING`, `NPC_KENDA_KAI_FERGUS`, `NPC_CASSANDRA`, `NPC_JERGAL`, `NPC_ZHENZI`.
- Create: `work/phase3c/batches/batch_03_review.md`

**Interfaces:**
- Consumes: Phase 2.5/2.6 reviewed identity boundaries and primary Campaign sources.
- Produces: five full candidates and PATCH_4011–PATCH_4015.

- [ ] Extend tests and run RED.
- [ ] Build evidence packets that separate body defeat from death, theory from fact, and deceased history from availability.
- [ ] Build profiles/patches.
- [ ] Validate batch/accumulated set, run regression, and write review.

### Task 5: Batch 04 — Compact Main-World Support Profiles

**Files:**
- Create evidence/profile/patch artifacts for `NPC_ELLIE`, `NPC_KUON`, `NPC_MU_TOU`, `NPC_LEI_GUANG`, `NPC_HONDA_KAI_FERGUS`, `NPC_OSHIRA`, `NPC_WURAI`, `NPC_LULUTIYE`.
- Create: `work/phase3c/batches/batch_04_review.md`

**Interfaces:**
- Consumes: inventory and localized setting/Campaign sources.
- Produces: eight compact candidates and PATCH_4016–PATCH_4023.

- [ ] Extend tests and run RED.
- [ ] Create source-first evidence packets; retain empty sections where evidence is absent.
- [ ] Build compact profiles/patches without upgrading rank or single actions into personality/politics.
- [ ] Validate batch/accumulated set, run regression, and write review.

### Task 6: Batch 05 — Compact, Minimal, Historical, and Special-Interlude Profiles

**Files:**
- Create evidence/profile/patch artifacts for `NPC_GREMLIN`, `NPC_NOSURI`, `NPC_LINGCHI`, `NPC_WILLIAM`, `NPC_JEWEL_ELDER`, `NPC_REN_FANZHEN`, `NPC_ZHOU_ZHENG`, `NPC_SERTANT_LU_YOURLAN`.
- Create: `work/phase3c/batches/batch_05_review.md`

**Interfaces:**
- Consumes: inventory, original Campaign sources, Special Interlude sources, deceased-state Canon.
- Produces: seven compact and one minimal candidate, PATCH_4024–PATCH_4031.

- [ ] Extend tests and run RED.
- [ ] Create evidence packets with deceased and Special Interlude isolation.
- [ ] Build profiles/patches; keep Sertant sparse and Worldbook-until-promoted.
- [ ] Validate batch/accumulated set, run regression, and write review.

### Task 7: Cross-Batch Quality, Runtime Dry Run, and Final Review

**Files:**
- Create: `work/phase3c_profile_quality_review.md`
- Create: `work/phase3c_runtime_projection_dryrun.md`
- Create: `work/phase3c_review.md`

**Interfaces:**
- Consumes: all 31 profiles/evidence packets/patches and five batch reviews.
- Produces: exact aggregate statistics, per-profile A–N review, representative runtime dry run, final protected-hash proof.

- [ ] Complete A–N quality review for every generated profile.
- [ ] Perform representative full/compact/minimal/deceased/inactive/knowledge/relationship dry runs without future content.
- [ ] Run accumulated profile validation, patch validation, full tests, forbidden-content checks, unique mapping checks, and protected hash comparison.
- [ ] Write exact final report and dispatch one fresh read-only reviewer; fix any Critical/Important findings under TDD, then re-run all verification.

