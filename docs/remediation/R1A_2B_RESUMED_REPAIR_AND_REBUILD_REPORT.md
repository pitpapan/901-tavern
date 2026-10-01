# R1A-2B-R — Resumed Deterministic R2C Repair and Rebuild

Status: `PASS`

Next: `READY_FOR_R1A_FINAL_REVIEW`

This report records the successful continuation of the previously blocked R1A-2B run. It does not revise Canon, approve any profile candidate, enter Phase 4, or replace the historical blocked report at `docs/remediation/R1A_2B_REPAIR_AND_REBUILD_REPORT.md`.

## 1. Accepted blocker history

The earlier R1A-2B attempt stopped because seven reviewed relationship-milestone groups lacked an authorized enclosing `RelationshipRecord`. R1A-2A.1 subsequently reviewed all seven cases and closed them under the frozen schema: five exact new containers, two exact existing-container selections, twenty exact milestone assignments, and zero schema gaps. The restored pre-repair R2C production tree was verified before this run as 138 files with zero path-hash differences from the preserved snapshot; its previously accepted aggregate hash is `571b2e36690a396aff9f81602b6003ce1774ee2662e29794087e30123f190ccc`.

## 2. R1A-2A.1 authority integration

Production now loads the materialized, reviewed authority stack only:

- R1A-1 semantic ledger: 145 identities.
- R1A-2A realization ledger: 145 identities and 275 destination instances.
- R1A-2A.1 container ledger: 7 decisions and 20 exact milestone assignments.

No semantic materializer is imported by the production path. Authority preflight verifies counts, exact seven profile/target pairs, exact assignment payloads, source/event lineage, complete parent schema validity, and all accepted SHA-256 values before any production write.

## 3. Combined authority model

The implementation keeps the two authority classes separate:

- `CLAIM_REALIZATION_AUTHORITY`: 275 R1A-2A destination instances.
- `RELATIONSHIP_CONTAINER_AUTHORITY`: 7 container decisions, including 5 authorized new containers, 2 existing-container selections, and 20 exact milestone assignments.

The five new baselines are classified as `R1A2A1_AUTHORIZED_CONTAINER`, not as unreviewed claim-realization extras. R1A-2A.1 authorizes no object outside its exact seven decisions.

## 4. Strict serializer architecture

`scripts/r1a2b_realization_serializer.py` retains hard failures for missing identities/realizations, duplicate instances, route or target mismatch, unsupported modes, unresolved refs, invalid schema payloads, stale migration destinations, and semantic fallback. Audited legacy claims remain filtered before the old generic background converter.

Runtime mode realization is exact:

- `REUSE_R2A_EVENT`: 105/105.
- `REUSE_EXISTING_ATOMIC_VALUE`: 32/32.
- `REVIEWED_TYPED_PAYLOAD_REQUIRED`: 138/138.

Event reuse creates no rewritten event object; it retains stable R2A event refs and profile-local timeline projections.

## 5. Relationship-container implementation

The seven exact R1A-2A.1 decisions are applied before reviewed milestones. Lookup is keyed by `(profile_id, target_profile_id, destination_instance_key)` and resolves directly to the reviewed stable container ID. The prior list-order/unique-target fallback was removed.

Results:

- decisions resolved: 7/7;
- new reviewed containers: 5/5;
- existing reviewed selections: 2/2;
- milestone assignments: 20/20, each exactly once;
- runtime container inference: 0;
- schema-valid complete reviewed containers: 7/7;
- schema-valid complete relationship records across production: 56/56.

All applicable reviewed `current_stance` values remain `null`. Separate engagement-facet records for Youyou and Yu Linfeng remain present and were not merged into the comprehensive selected containers. The four PC autonomy permissions remain `false`; no private thought, current emotion, permanent commitment/loyalty, future choice, or inferred consent was introduced.

## 6. Independent actual-production inventory

The validator constructs `ExpectedAuthorityInventory` from the reviewed ledgers and independently starts `ActualProductionInventory` from actual production migration destinations and relationship structures. Expected-to-actual and actual-to-expected differences are both checked.

Results:

- expected claim instances: 275;
- actual claim instances: 275;
- missing: 0;
- unauthorized extra claim instances: 0;
- reviewed structural objects inspected for the seven container decisions: 27;
- classifications: 5 `R1A2A1_AUTHORIZED_CONTAINER`, 20 `R1A2A_AUTHORIZED_REALIZATION`, 2 `PRE_EXISTING_AUTHORIZED_OBJECT`;
- `UNAUTHORIZED_EXTRA`: 0.

Mutation tests confirm that an extra migration destination or an extra unreviewed milestone is rejected with `BLOCKED_BY_UNAUTHORIZED_EXTRA_OBJECT`.

## 7. Bidirectional equivalence result

R1A-2A semantic identities are realized 145/145 and destination instances 275/275. All 46 split-required identities match exact destination-instance equality. The full 29-record relationship-history cohort is realized 29/29. No raw-object-count comparison to 275 is used.

## 8. Exact sixteen-reroute preservation

The former 2/4/10 histogram-only check was replaced with exact identity preservation. For every accepted reroute the validator freezes and compares profile ID, old claim ID, migration status, and ordered destination IDs.

- exact accepted reroutes: 16/16;
- missing: 0;
- changed: 0;
- unexpected replacement: 0.

The histogram remains only a secondary sanity check. The historical `MILESTONE_YOUYOU_YU_LATE_MILESTONES` destination remains intact alongside the separately reviewed R1A-2A late-history realization.

## 9. Atomic publication implementation

`scripts/run_r1a2br_rebuild.py` performs the production workflow in complete sibling staging trees:

1. verifies frozen inputs and authority hashes;
2. builds packages, candidates, reviews, global ledgers, and reports in staging;
3. runs package/schema, equivalence, contradiction, exact-reroute, drift, and canonical checks against staging;
4. builds a second identical staging tree and compares every file byte-for-byte;
5. publishes the complete `work/phase3d_r2c` root through one recoverable tree transaction.

Failure-injection tests prove that a first rename failure leaves the live tree untouched and an install failure restores the complete old tree. No package/candidate/review/ledger prefix is published before all mandatory validation passes. The transaction prevents mixed-generation installation. As with a two-rename Windows directory transaction, readers may observe a brief absent-path interval during the swap; it does not provide an atomic pointer abstraction.

Publication result: `PASS`; backup-cleanup warning: none.

## 10. Production diff classification

The restored baseline had 138 files. The repaired generation has 140 files: 108 changed, 2 added, 0 removed, and 32 byte-unchanged. The added files are the realization lineage and semantic-realization audit.

Semantic classification:

- `EXPECTED_REMEDIATION_CHANGE`: 275 reviewed claim instances;
- `AUTHORIZED_R1A2A1_CONTAINER_CHANGE`: 5 reviewed new containers;
- `UNCHANGED_FILES`: 32;
- `UNEXPECTED_DRIFT`: 0.

Two unaudited packages remain byte-identical. Arbitrary structural-carrier note text is no longer accepted as authorization for a new relationship.

## 11. Semantic contradiction result

- unauthorized event/background conflicts: 0;
- unauthorized duplicate relationship semantics: 0;
- stale `MOVED_TO_BACKGROUND` dispositions: 0;
- reviewed split destinations missing: 0;
- unreviewed semantic destinations: 0;
- builder semantic fallbacks: 0.

## 12. Canonical check-mode result

Both canonical read-only checks pass against the published repaired generation:

```text
python scripts/prepare_phase3d_r2c_packages.py --check
prepared 37 provisional migration packages

python scripts/build_phase3d_r2c.py --check
R2C_CANDIDATES_MATCH (37)
```

Check mode compares bytes and does not write when `check=True`.

## 13. Tests

Required focused suites pass:

- `tests.test_r1a1_semantic_audit`: 9/9;
- `tests.test_r1a2a_realization_surface`: 7/7;
- `tests.test_r1a2a1_relationship_containers`: 8/8;
- `tests.test_r1a2b_realization_serializer`: 16/16;
- `tests.test_r1a2br_resumed_rebuild`: 4/4;
- `tests.test_phase3d_r2c`: 57/57.

Final full discovery:

```text
Ran 300 tests in 132.653s
OK
```

Transitional errors remaining: 0. Failures: 0. Errors: 0.

## 14. Frozen inputs and authority hashes

Frozen input manifest: 488/488 verified.

- R1A-1: `4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7`.
- R1A-2A decisions: `d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d`.
- R1A-2A ledger: `0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b`.
- R1A-2A.1 ledger: `bc426551e4438b59d96ed43ffb8d3870eca7f70974cfce8ce2e97f57086682e1`.

All match the accepted values. No authority file was rewritten to fit output.

## 15. Deterministic rebuild

Two complete independently staged repaired generations were compared across 140 files.

- deterministic rebuild: `PASS`;
- byte differences: 0.

The comparison is repaired-generation to repaired-generation, not repaired output to the old defective 138-file tree.

## 16. Runtime heuristic audit

The production path reports zero introduced behavior for all prohibited categories:

- clause splitting;
- keyword routing;
- nearest-event inference;
- relationship-target inference;
- container-selection inference;
- persistence inference;
- epistemic inference;
- behavior-to-persona inference;
- runtime paraphrasing;
- legacy-claim semantic fallback.

## 17. Remaining risks and boundaries

- All outputs remain provisional and require the existing human approval process; this run does not approve or apply profile candidates.
- The transaction uses a recoverable whole-directory swap, not an atomic filesystem pointer, so it cannot guarantee uninterrupted visibility of the directory path to concurrent readers during the two renames.
- The independent inventory is deliberately scoped to audited claim realizations plus the exact R1A-2A.1 structural consequences; unrelated pre-existing objects remain protected by the production drift audit.
- No Worldbook, Current State, Canon, R2A, R2B, schema, frozen manifest, formal character database, runtime card, or Phase 4 artifact was created or modified.

## Conclusion

`R1A-2B-R STATUS: PASS`

`NEXT: READY_FOR_R1A_FINAL_REVIEW`
