# Worldbook Phase 1.1 Semantic Boundary Implementation Plan

**Goal:** Correct candidate-layer, alias, duplicate, event-coverage, and report semantics while preserving extraction safety.

**Spec:** `docs/superpowers/specs/2026-09-26-worldbook-phase-1-1-semantics-design.md`

## Global constraints

- Never modify `current_state.md` or generate `output/worldbook_source.jsonl`.
- Preserve deterministic output, atomic writes, review protection, and provenance.
- Use the JSON Schema as the validator's contract source.

### Task 1: Lock the revised contract with failing tests

- Add `canon_layer` schema/validator tests.
- Add extraction regressions for slash compounds, substring characters, location precedence, duplicate containment, manual candidates, special-interlude isolation, ledger-match wording, reviewed-file protection, and byte identity.
- Run the focused tests and observe failures against the existing implementation.

### Task 2: Implement schema ownership and manual configuration

- Add required `canon_layer` to the schema.
- Load schema required/enums in the validator.
- Add and validate `config/manual_candidates.json`.
- Make candidate records carry `canon_layer_hint`, `alias_requires_review`, and `ledger_match_found`.

### Task 3: Correct extraction semantics

- Replace universal slash splitting with type-aware compound handling.
- Remove substring character merging and containment duplicate classification.
- Prioritize location suffixes.
- Detect dream-only character references and emit Special Interlude candidates.
- Extract event candidates from every available plot-directory volume and keep unresolved coverage explicit.

### Task 4: Update reporting and regenerate

- Rename type-conflict reporting and add all requested review sections.
- Run the full test suite and syntax checks.
- Regenerate `work/candidates.jsonl` and `work/candidate_report.md` twice and byte-compare.
- Verify forbidden outputs and source files were untouched.

## Review focus

- No syntax-only or substring-only alias merge remains.
- `魔物`, `魔物之潮`, `魔兽之潮`, and `魔物之盒` remain distinct.
- Dream-only characters cannot acquire a main-world canon-layer hint.
- Event coverage is broader without claiming ledger verification.
- Every manual seed is provenance-bearing and configuration-owned.
