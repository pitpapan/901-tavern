# SDD ledger — plan: docs/superpowers/plans/2026-09-28-phase3d-recall-audit-repair.md

Pre-flight: Task 1 source inventory feeds Task 2 event decisions; Task 2 decisions feed Task 3 repaired candidates; Task 3 effective profiles feed Task 4 reviews/reports; all outputs feed Task 5 validation. Interfaces agree on stable profile IDs and source-relative paths.

Ruling: work in the current checkout — this is a normal master checkout, but the required Phase 3B/3C/3D inputs are untracked and would be absent from a new worktree; isolation is provided by Phase 3D-R-only output paths and protected content hashes. Cost if wrong: changes share the user's checkout, but frozen-file verification detects overlap.

Ruling: manage the execution ledger manually — the bundled Bash workspace helper cannot start in this Windows environment (`E_ACCESSDENIED`); use the same documented ledger format under `.superpowers/sdd/`. Cost if wrong: helper-generated briefs are unavailable, so each task is executed directly from the saved plan and spec.

Ruling: do not commit during this plan — committing would require sweeping in large user-owned untracked Phase 3 inputs, outside the recall-audit scope. Cost if wrong: audit history remains file- and hash-based rather than commit-based.

Task 1: complete (no commit by ruling; 36 profiles inventoried; 19 full / 15 compact / 2 minimal; protected SHA-256 freeze created; 4/4 focused tests pass; baseline profile validator 36/0 and patch validator 36/0).

Task 2: complete (12 event-identity audits and seven cross-profile propagation audits generated from reopened original sources; White Magician location conflation resolved; Oshira mechanism/cognition uncertainty preserved).

Task 3: complete (32 repaired candidates generated; all Phase 3D claim IDs and PC permissions preserved; 36 historical patches remain byte-identical; 32 separate Phase 3D-R draft/add patches generated; effective profiles 36/0, historical patches 36/0, recall patches 32/0).

Task 4: complete (36 coverage matrices and 36 recall reviews complete; 96 pre-repair MISSING items resolved; gap dimensions reproducibly classified as persona 5, narrative 91, ability/status 33, relationship 45, and knowledge 17; Canon gaps routed without Canon mutation; final report generated).

Task 5: complete (28/28 focused tests and 153/153 full regression tests pass; repaired profiles 32/0, effective profiles 36/0, historical patches 36/0, recall patches 32/0; two rebuilds across 163 generated files produced 0 byte differences; 277 protected files and all 36 historical draft patches match their frozen hashes; independent read-only final review found the Section 31 metric gap, which was fixed via a failing regression test and re-reviewed with no blockers).
