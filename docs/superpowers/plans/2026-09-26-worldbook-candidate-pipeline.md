# Canonical Worldbook Candidate Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the six requested first-stage worldbook artifacts without creating canonical worldbook prose.

**Architecture:** Two dependency-free Python CLIs share the schema contract but remain operationally independent. Extraction is structure-first, deterministic, provenance-preserving, and guarded against overwriting reviewed rows; validation is read-only and line-oriented.

**Tech Stack:** Python 3 standard library, JSON Schema Draft 2020-12, `unittest`.

**Spec:** `docs/superpowers/specs/2026-09-26-worldbook-candidate-pipeline-design.md`

## Global Constraints

- Do not modify source references or `current_state.md`.
- Do not create `output/worldbook_source.jsonl`.
- Only `world`, `faction`, `location`, `character`, `concept`, and `event` are valid entry types.
- Automatic extraction must remain reviewable and must not overwrite non-pending candidates.
- Raw posts are not first-pass semantic extraction sources.
- Use stable ordering and stable IDs for identical input.

## Review Focus

- Duplicate basenames in different campaign phases must retain distinct provenance paths.
- Dream-only headings must not leak into ordinary main-world candidates.
- Alias syntax must merge confirmed variants without merging mere fuzzy matches.
- A rerun must stop before touching a file containing reviewed rows.
- Malformed JSONL must not prevent later valid lines from being diagnosed.

---

### Task 1: Candidate extractor and report

**Files:**
- Create: `scripts/extract_candidates.py`
- Test: `tests/test_extract_candidates.py`

**Interfaces:**
- Consumes: `--project-root PATH`, optional `--campaign-root PATH`.
- Produces: `work/candidates.jsonl`, `work/candidate_report.md`, exit codes 0/1/2.

- [ ] Write integration tests for deterministic extraction, provenance, aliases, event filtering, dream exclusion, and reviewed-row protection.
- [ ] Run the tests and confirm they fail because the CLI is absent.
- [ ] Implement discovery, structural parsing, classification, deduplication, analysis, guarded writes, and report rendering.
- [ ] Run the extractor tests and confirm they pass.

### Task 2: Worldbook schema and validator

**Files:**
- Create: `schema/worldbook_entry.schema.json`
- Create: `scripts/validate_worldbook.py`
- Test: `tests/test_validate_worldbook.py`

**Interfaces:**
- Consumes: a JSONL path, defaulting to `output/worldbook_source.jsonl`.
- Produces: line-specific errors/warnings and process exit code 0 when there are no errors.

- [ ] Write integration tests for valid rows, malformed JSON, duplicate IDs/content/names, enums, empty required arrays, shared-key warnings, content-length warnings, and uncertainty-language warnings.
- [ ] Run the tests and confirm they fail because the CLI/schema are absent.
- [ ] Add the closed Draft 2020-12 schema and implement the read-only standard-library validator.
- [ ] Run validator tests and confirm they pass.

### Task 3: Project policy and real campaign generation

**Files:**
- Create: `AGENTS.md`
- Generate: `work/candidates.jsonl`
- Generate: `work/candidate_report.md`

**Interfaces:**
- Consumes: discovered campaign sources under the project and its campaign parent.
- Produces: the requested review bundle only.

- [ ] Add the canonical-database operating rules to `AGENTS.md`.
- [ ] Run the full test suite.
- [ ] Run extraction against the real campaign root.
- [ ] Parse every candidate row, inspect report coverage and issue sections, rerun extraction, and byte-compare outputs for determinism.
- [ ] Run validator smoke fixtures and Python compilation checks.
