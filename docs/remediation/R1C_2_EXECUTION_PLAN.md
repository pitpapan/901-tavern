# R1C-2 execution plan

Spec: `docs/remediation/R1C_2_FULL_SOURCE_REVIEW_SPEC.md`.
User explicitly authorizes execution in the existing repository/worktree.

## Constraints

Preserve 140 production files, fingerprint `cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`, and 488 frozen inputs. Keep the accepted AtomicFact contract unchanged. No production, chronology, profile, worldbook, or R1C-3 writes. All semantics are model-authored from full raw source; scripts only validate, serialize and index reviewed records.

## Tasks and verification

1. Save supplied spec verbatim; recompute source population and frozen baseline. Record byte fingerprints of accepted R1C-1 artifacts. Expected population hash: `6f8fa08645753842f0f8afc344b8dc0c3a1e88d80a308965fd478f643e47f406`. Stop on drift.
2. Assign exclusive primary ownership by document/source order: P1 all pages; P2 pages 1–13; P2 pages 14–25 and P3. Save actual Pass A semantics in immutable checkpoints following REVIEW_PROTOCOL.md. Primary ownership assignments alone never count as review completion.
3. Implement `scripts/r1c_vnext/validate_r1c2.py` using tests in `tests/test_r1c_vnext_full_review.py`. Test incomplete review rejection, duplicate ownership, locator forgery, missing secondary units, absent cross-character indexes, unsafe identity merge and unauthorized semantic changes before implementation. Validator is read-only and cannot repair or semantically approve input.
4. Rotate reviewers to different source assignments. Each Pass B reviewer saves source-first inventories before reading A. Record every comparison and finding. Root independently adjudicates disagreements from supporting raw sources; extraction never silently self-approves.
5. Assemble required JSONL only from saved reviews/adjudications. Authority records remain pending until complete review. Deterministic indexes cite reviewed facts, mentions and unresolved items; compare independent derivation twice.
6. Review all 29 historical cases and 48 pilot scenes against full authority, preserving pilot history. Freeze fresh QA strata after full adjudication; isolated source-first reviewer inspects the sample before authority. Fix substantive findings and draw a fresh confirmation sample.
7. Retain R1C-1 validation/mutations; add all nine R1C-2 mutation classes using actual reviewed evidence/assertions. Explicitly distinguish semantic review assertions from mechanical integrity checks.
8. Run canonical validation and meaningful test suite, recompute production/frozen fingerprints, write report and return exact specification format. Any incomplete coverage prevents PASS. R1C-3 remains unexecuted even on PASS.

## Review focus

Cross-page pronouns and speaker attribution; mixed OOC/story posts; named and title-only entities outside existing profiles; later evidence resolving historical uncertainty without retroactive certainty; distinct dream/interlude scopes and explicitly sourced carry-back. All five are checked by source reviewers and QA; mechanical tests cannot substitute for those checks.

## Progress

- Spec saved; live population matches accepted hash; accepted R1C-1 validation PASS.
- Pass A dispatched to three isolated agents with exclusive document ownership.
- Validator test implementation begins; no downstream authority approved.
