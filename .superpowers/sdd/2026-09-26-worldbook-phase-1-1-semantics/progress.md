# SDD ledger — plan: docs/superpowers/plans/2026-09-26-worldbook-phase-1-1-semantics.md

Workspace: in-place because the project is not a Git repository; no worktree or commit ranges exist.
Pre-flight: schema produces the validator contract; manual configuration and source parsers produce candidate rows; candidate analysis produces the report. Interfaces agree with the spec.
Ruling: `canon_layer_hint` is a scalar provisional value, while mixed-layer evidence is retained in provenance and review notes — this keeps the required hint reviewable without silently promoting dream material — cost if wrong: the candidate schema would need a list-valued migration.
Ruling: slash-delimited non-character H2 titles produce separate candidates plus mutual review notes — this preserves both named topics without inventing an alias relation — cost if wrong: a reviewer may later merge explicitly related concepts.
Task 1: complete (tests added and observed failing for schema layers, slash compounds, substring characters, dream isolation, manual candidates, event coverage, validator enum crashes, and deterministic/review-protected writes).
Task 2: complete (schema owns required fields/enums; manual and alias evidence are configuration-owned and provenance-checked).
Task 3: complete (cross-layer Special Interlude separation, type-aware aliases, location precedence, plot-volume events, ledger_match_found, and dream-range propagation implemented).
Final review: fresh read-only reviewer found four Important issues and one stale-artifact Minor.
Final: fixed Special Interlude cross-layer merge — same-name main/special regression RED→GREEN.
Final: fixed dream-range propagation to later scene locations/events and plot locations/concepts — dream tower and dream concept regressions RED→GREEN.
Final: fixed compound-title re-collapse and descriptive parenthetical aliasing — compound body alias and parenthetical regressions RED→GREEN.
Final: fixed validator crash on unhashable enum JSON — malformed enum followed by later-line diagnostic regression RED→GREEN.
Task 4: complete (full suite 9/9, Python compile pass, real extraction 91 candidates, candidate/report reruns byte-identical, required report sections present, current_state unchanged during generation, forbidden output absent).
Final: fixed stale generated artifacts — regenerated twice; candidates SHA-256 5638FB5566CE50882D85E4278B91A0B9E36F8BF923DAB87C9DE0677C92480B3B, report SHA-256 98EA7C7D5623DF20AD4862066A28F823ED85384CE1562BA5F58C5897499ACE97.
