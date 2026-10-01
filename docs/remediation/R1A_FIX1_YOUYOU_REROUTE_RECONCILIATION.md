# R1A-FIX-1 — Youyou High-Risk Reroute Reconciliation

Status: `PASS`

Semantic outcome: `SUPERSEDED_BY_REVIEWED_ATOMIC_REALIZATIONS`

R1A status: `CLOSED`

Next: `READY_FOR_HUMAN_APPROVAL`

This report closes the single production-authority mismatch found by the independent R1A-FINAL audit. It does not revise Canon, Worldbook, Current State, R2A, R2B, the frozen schema, or any earlier accepted semantic authority, and it does not enter Phase 4.

## 1. R1A-FINAL blocker

R1A-FINAL found one dangling destination in the accepted historical high-risk reroute for `NPC_YOUYOU / CLAIM_YOUYOU_ENGAGEMENT_HISTORY`. The row declared:

- `TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION`, which resolved; and
- `MILESTONE_YOUYOU_YU_LATE_MILESTONES`, which was absent from the repaired package and candidate.

The blocked production fingerprint is retained as historical evidence: 140 files, aggregate SHA-256 `8f3fb134090342b22f29d9d7e2bf5df94c261b2019c7a52f74fdda3e8e8c3dde`.

## 2. Preserved old milestone contents

The preserved pre-remediation snapshot showed `MILESTONE_YOUYOU_YU_LATE_MILESTONES` as one relationship milestone with:

- `reality_status = BIOGRAPHICAL_BACKGROUND`;
- `event_ref = null`;
- `story_order = null`; and
- a single `change` combining four distinct campaign developments: Yu Linfeng's temporary protective acceptance of the engagement arrangement with Youyou's future choice retained, Honda's public fiancé/love assertion, Youyou and Yu Linfeng entering the Path of Honor together, and Youyou's power protecting Yu Linfeng during the Deathwing war.

The object therefore preserved source citations but compressed four separately locatable campaign events into one aggregate background carrier.

## 3. Original source evidence reviewed

The reconciliation inspected the original legacy claim and every direct source family used by the old milestone:

- `设定 人物/妄想大陆设定集_检索版.md:148-153`;
- second campaign page 15, lines 390-450: Xierlun's engagement planning, Yu Linfeng's temporary protective acceptance, and Youyou's retained future choice;
- second campaign page 17, lines 671-683: Honda's public assertion that Yu Linfeng was Youyou's fiancé and that the two were in love;
- third campaign page 2, lines 162-414: shared entry into the Path of Honor; and
- third campaign page 5, lines 123-135: Youyou's power protecting Yu Linfeng during the final war.

The relevant reviewed R2A records were also checked directly: `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY`, `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`, `EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION`, `EVENT_P3_003_TEIRESIAS_REVELATION`, and `EVENT_P3_009_DEATHWING_FINAL_WAR`.

No source establishes a current emotional stance, permanent engagement, permanent romantic commitment, permanent loyalty, inferred consent, or future choice by the PC.

## 4. Overlap with reviewed atomic realizations

The old aggregate's supported content maps completely to four already accepted R1A-2A destination instances:

| Old aggregate semantic component | Reviewed replacement realization |
| --- | --- |
| Temporary protective acceptance; Youyou retains later choice | `MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY_1` |
| Honda's public fiancé/love assertion, retained as Honda's statement | `MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_2` |
| Shared entry into the Path of Honor | `MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P3_003_TEIRESIAS_REVELATION_3` |
| Youyou's power protects Yu Linfeng in the Deathwing war | `MILESTONE_CLAIM_YOUYOU_YU_LATE_MILESTONES_EVENT_P3_009_DEATHWING_FINAL_WAR_4` |

Each replacement is typed `ACTUAL_EVENT`, has its exact R2A `event_ref`, preserves story order and source lineage, and is assigned by R1A-2A.1 to the reviewed comprehensive container `RELATIONSHIP_YOUYOU_YU_LINFENG`.

R1A-2A.1 deliberately preserves the separate engagement-facet relationship baseline `RELATIONSHIP_PC_YU_LINFENG_CLAIM_YOUYOU_YU_LATE_MILESTONES_PC_YU_LINFENG`; it is not merged into the comprehensive container. Applicable `current_stance` values remain `null`.

## 5. Semantic outcome

The reviewed outcome is `SUPERSEDED_BY_REVIEWED_ATOMIC_REALIZATIONS`.

No fifth or independently meaningful relationship change exists in the old object beyond the four mapped event clauses. Retiring the aggregate loses no supported content. Restoring it would create an aggregate-over-atomic duplicate, repeat the same four source-backed changes, and weaken their reviewed event typing by reintroducing `BIOGRAPHICAL_BACKGROUND` with no event or story-order link.

The decision is semantic, not ID-driven: the old stable ID is retired because its complete content is already represented more precisely, not because the serializer happened to omit it.

## 6. Reviewed supersession authority

A separate amendment authority was added at `work/remediation/r1a_fix1/high_risk_reroute_amendments.jsonl`. Its SHA-256 is:

`b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817`

It preserves the historical row, declares `MILESTONE_YOUYOU_YU_LATE_MILESTONES` superseded, and makes the effective destination set:

1. `TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION`;
2. the P2-018 atomic milestone;
3. the P2-020 atomic milestone;
4. the P3-003 atomic milestone; and
5. the P3-009 atomic milestone.

The amendment records the four exact destination-instance keys, all source refs, all relevant event refs, and the reviewed decision basis. R1A-1, R1A-2A decisions, R1A-2A ledger, and R1A-2A.1 ledger were not rewritten.

## 7. Production implementation

The strict serializer now loads and hash-pins the one-record amendment authority. It validates the amendment against both the original historical reroute and the raw accepted R1A-2A instances, then overlays it after the historical high-risk decision is constructed. A changed historical row, changed replacement instance, unknown event/source reference, extra amendment, or semantic fallback is a hard failure.

The effective historical high-risk result is:

- unchanged: 15;
- explicitly reviewed amendment: 1;
- unresolved: 0;
- all effective destinations resolved: 16/16.

The production migration package, global migration ledger, compiled candidate, and Chinese review all expose the same effective destination set. The retired milestone ID does not appear as a live destination or rendered review object.

## 8. Global migration-destination referential integrity

A general typed destination resolver now inventories actual production objects and accepted external R2A event references independently of the declared migration rows. It covers timeline/event refs, backgrounds, public identity, durable roles and affiliations, persona and values, relationship containers/baselines/milestones, ability/status transitions, knowledge, projections, constraints, and gaps.

The final global scan found:

- migration rows checked: 304;
- destination IDs checked: 450;
- local object resolutions: 450;
- authorized external event resolutions: 0 in current production (the supported external-event path is mutation-tested);
- dangling destinations: 0;
- ambiguous resolutions: 0;
- destination-type mismatches: 0.

The scan covers all production migration records, including all 145 remediated identities and all 16 effective high-risk reroutes. No second dangling destination was found.

## 9. Canonical-check strengthening

`prepare_phase3d_r2c_packages.py` now validates the complete authority stack, the effective amendment, and global destination resolution before accepting either write or `--check` mode. Downstream candidate validation invokes the same strict production validation surface without performing semantic adjudication.

Final read-only checks:

- `python scripts/prepare_phase3d_r2c_packages.py --check`: PASS, 37 provisional packages match;
- `python scripts/build_phase3d_r2c.py --check`: PASS, 37 candidates match.

The repaired production fingerprint remained stable across check mode.

## 10. Regression coverage

`tests/test_r1a_fix1_migration_destination_integrity.py` proves that:

1. a nonexistent relationship-milestone destination fails because the object is absent;
2. a valid local milestone destination passes;
3. a valid R2A event reference passes;
4. removing a real destination object is detected;
5. the one exact amendment yields 15 unchanged plus 1 explicitly amended high-risk reroute;
6. all generated production migration destinations resolve; and
7. the independent R1A-FINAL logic accepts the effective authority without importing production equivalence code.

Focused remediation/R2C verification passed 104/104 tests. Full discovery passed 307/307 tests with zero failures and zero errors.

## 11. Semantic validation

The repaired output retains:

- R1A-2A identities: 145/145;
- R1A-2A destination instances: 275/275;
- split-required identities: 46/46;
- relationship-history identities: 29/29;
- R1A-2A.1 container decisions: 7/7;
- reviewed container milestone assignments: 20/20;
- unauthorized extra claim instances: 0;
- unauthorized event/background conflicts: 0;
- relationship semantic conflicts: 0;
- stale background dispositions: 0;
- unreviewed destination sections: 0;
- PC-control regressions: 0;
- runtime semantic fallbacks: 0; and
- runtime semantic heuristics: 0.

The Youyou review preserves Honda's statement as attributed speech and Yu Linfeng's acceptance as temporary/protective with Youyou's later choice retained. It does not create a current stance, private feeling, permanent commitment, obligation, consent, or future action.

## 12. Atomic publication and determinism

The existing transaction architecture built and validated two complete staging trees before publication. The two staged trees contained 140 files each and had zero byte differences. Only the validated first tree was installed by the whole-tree publication transaction; no production consumer directory was deliberately exposed before mandatory validation completed.

Publication result: `atomic = true`, `installed = true`, no backup-cleanup warning.

## 13. New repaired production fingerprint

The post-fix deterministic manifest is stored outside production at `work/remediation/r1a_fix1/repaired_r2c_manifest.jsonl`.

- files: 140;
- aggregate SHA-256: `cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`;
- independent calculations: 2;
- manifest byte differences: 0;
- stable: yes.

The historical blocked fingerprint and the historical blocked R1A-FINAL report remain preserved.

## 14. Independent R1A-FINAL re-verification

The independent verifier was rerun twice after publication. It imports neither production serializer logic nor production equivalence logic. Both runs returned `PASS` with:

- authority hashes and frozen inputs: valid, 488/488;
- identities: 145/145;
- destination instances: 275/275;
- splits: 46/46;
- relationship history: 29/29;
- container decisions: 7/7;
- container milestone assignments: 20/20;
- effective high-risk reroutes: 15 unchanged, 1 explicit amendment, 0 unresolved;
- global dangling destinations: 0;
- package/candidate mismatches: 0;
- Chinese review mismatches: 0;
- unauthorized extras and contradictions: 0;
- PC-control regressions: 0;
- unexpected drift: 0; and
- production fingerprint: stable.

R1A-FINAL therefore passes on the effective reviewed authority. R1A is closed and the next state is `READY_FOR_HUMAN_APPROVAL`, not Phase 4.
