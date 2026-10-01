# R1A-FINAL — Independent Read-Only Verification of the Repaired R2C Generation

## Status

```text
R1A-FINAL STATUS: BLOCKED
R1A STATUS: OPEN
NEXT: BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH
```

The repaired R2C generation is reproducible and realizes the complete R1A-2A claim-realization authority, but it does not preserve one accepted pre-existing high-risk reroute destination object. R1A therefore cannot be closed and the published tree is not ready for human approval.

No production file, accepted authority, schema, source, test, Canon artifact, Worldbook artifact, Current State artifact, or frozen manifest was modified during this verification. This task did not enter Phase 4 and did not repair the mismatch.

## 1. Independent-verifier boundary

The audit used `scripts/audit_r1a_final_independent.py`, a new read-only verifier written for this phase. It directly parses the raw authority files, frozen input manifest, frozen schema, R2A chronology, published migration packages, candidates, reviews, and production source code.

The verifier:

- imports only the Python standard library;
- does not import or call `scripts/r1a2b_realization_serializer.py`;
- does not import or call any R1A-2B semantic-equivalence helper;
- constructs expected authority inventories and actual production inventories through separate parsing paths;
- does not use serializer-produced inventory data as proof;
- writes only the production-external fingerprint manifest under `work/remediation/r1a_final/`.

Result:

```text
production_serializer_logic_reused: no
production_equivalence_logic_reused: no
project_semantic_modules_imported: 0
```

The accepted staging builder was invoked separately only for the required A/B determinism reproduction. Its output was fingerprinted by the independent verifier and was not used to establish semantic equivalence.

## 2. Accepted authority fingerprints and frozen inputs

All four accepted hashes match exactly:

| Authority | Expected and observed SHA-256 | Status |
|---|---|---|
| R1A-1 semantic ledger | `4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7` | PASS |
| R1A-2A decisions | `d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d` | PASS |
| R1A-2A realization ledger | `0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b` | PASS |
| R1A-2A.1 container ledger | `bc426551e4438b59d96ed43ffb8d3870eca7f70974cfce8ce2e97f57086682e1` | PASS |

Frozen upstream inputs: `488/488`.

Direct R1A-1 reconstruction found:

```text
semantic identities: 145
identity cohort: 116
relationship cohort: 29
duplicates: 0
UNRESOLVED: 0
```

## 3. Repaired-production fingerprint

The deterministic manifest is:

`work/remediation/r1a_final/repaired_r2c_manifest.jsonl`

Each line contains the relative path, byte size, and SHA-256 of one published R2C file. Rows are sorted by relative path. The aggregate is the SHA-256 of the canonical JSONL manifest bytes.

```text
files: 140
aggregate SHA-256: 8f3fb134090342b22f29d9d7e2bf5df94c261b2019c7a52f74fdda3e8e8c3dde
independent calculation A == calculation B: yes
fingerprint before checks == fingerprint after checks: yes
```

Because R1A-FINAL is blocked, this is recorded as the stable **observed published fingerprint**, not as an R1A-closed or human-approved baseline. The historical 138-file fingerprint was not overwritten.

## 4. R1A-2A claim-realization equivalence

The independent parser reconstructed the R1A-2A authority as follows:

```text
semantic identities: 145
destination instances: 275
REUSE_R2A_EVENT: 105
REUSE_EXISTING_ATOMIC_VALUE: 32
REVIEWED_TYPED_PAYLOAD_REQUIRED: 138
REALIZATION_UNRESOLVED: 0
split_required identities: 46
```

The R1A-1 and R1A-2A semantic identity sets are exactly equal. Every identity's reviewed destination-section set agrees with R1A-1.

The independently enumerated production claim inventory gives:

```text
production-realized identities: 145/145
production-realized destination instances: 275/275
missing claim instances: 0
unauthorized extra claim instances: 0
REUSE_R2A_EVENT: 105/105
REUSE_EXISTING_ATOMIC_VALUE: 32/32
REVIEWED_TYPED_PAYLOAD_REQUIRED: 138/138
split_required exact destination-instance sets: 46/46
```

The comparison is bidirectional. Event reuse was checked by reviewed R2A event ID, profile projection, and provenance; zero-local-object instances were not incorrectly required to create pseudo-events. No duplicate pseudo-event identity was found.

## 5. Relationship-history and container authority

All `29/29` relationship-history semantic identities realize their reviewed R1A-2A routes. The independent R1A-2A.1 reconstruction found seven decisions, five `CREATE_REVIEWED_CONTAINER`, two `USE_EXISTING_CONTAINER`, zero merges, zero schema gaps, and 20 unique milestone assignments.

| Profile → target | Reviewed action | Exact container | Result |
|---|---|---|---|
| `NPC_HONDA_KAI_FERGUS` → `NPC_YOUYOU` | create | `RELATIONSHIP_HONDA_KAI_FERGUS_YOUYOU` | PASS |
| `NPC_JIANG_ZIYOU` → `NPC_CASSIUS_BRIGHT` | create | `RELATIONSHIP_JIANG_ZIYOU_CASSIUS_BRIGHT` | PASS |
| `NPC_KENDA_KAI_FERGUS` → `PC_YU_LINFENG` | create | `RELATIONSHIP_KENDA_KAI_FERGUS_YU_LINFENG` | PASS |
| `NPC_LULUTIYE` → `NPC_YOUYOU` | create | `RELATIONSHIP_LULUTIYE_YOUYOU_HOME_PRESENCE` | PASS |
| `NPC_XIERLUN_VON_GILCODE` → `PC_YU_LINFENG` | create | `RELATIONSHIP_XIERLUN_YU_ENGAGEMENT_PLANNING` | PASS |
| `NPC_YOUYOU` → `PC_YU_LINFENG` | use existing | `RELATIONSHIP_YOUYOU_YU_LINFENG` | PASS |
| `PC_YU_LINFENG` → `NPC_YOUYOU` | use existing | `RELATIONSHIP_YU_LINFENG_YOUYOU` | PASS |

Results:

```text
container decisions: 7/7
new reviewed containers: 5/5
reviewed existing-container selections: 2/2
R1A-2A.1 milestones assigned exactly once: 20/20
missing assignments: 0
duplicate assignments: 0
alternative runtime-style container outcomes: 0
```

All applicable reviewed `current_stance` values remain `null`. The distinct engagement-facet containers remain separate from the selected comprehensive Youyou ↔ Yu Linfeng containers.

The raw production inventory contains 56 complete relationship records. Every discovered record, including its nested milestones, independently validates as a complete `RelationshipRecord` against the frozen schema.

No unconditional generic `BACKGROUND_REL_*` carrier remains without reviewed authority.

## 6. Blocking mismatch: one dangling accepted reroute destination

The accepted exact high-risk reroute for:

```text
profile_id: NPC_YOUYOU
old_claim_id: CLAIM_YOUYOU_ENGAGEMENT_HISTORY
migration_status: SPLIT
```

still declares these exact destinations:

```text
TIMELINE_YOUYOU_P2_021_DRAGON_RITUAL_AND_ASSASSINATION
MILESTONE_YOUYOU_YU_LATE_MILESTONES
```

The timeline destination exists. The relationship milestone destination does not.

Independent evidence:

```text
MILESTONE_YOUYOU_YU_LATE_MILESTONES
occurrences in preserved old 138-file production snapshot: 1
occurrences in published repaired migration packages/candidates: 0
```

The old milestone was contained by `RELATIONSHIP_YOUYOU_YU_LINFENG`. The repaired comprehensive container exists and correctly receives its six reviewed R1A-2A milestones, but it does not contain the accepted legacy destination object above. No replacement object with the accepted destination identity is present.

The dangling ID remains visible in:

- `work/phase3d_r2c/migration/claim_migration_ledger.jsonl`;
- `work/phase3d_r2c/migration_packages/NPC_YOUYOU.json`;
- `work/phase3d_r2c/reviews/by_character/NPC_YOUYOU.md`.

Therefore the exact-reroute result is:

```text
route rows unchanged: 16/16
destination objects present: 15/16
missing: 1
changed route rows: 0
unexpected replacement: 0
```

This is a production-authority mismatch, not an authority drift, schema problem, source adjudication question, or audit-helper false positive. The earlier R1A-2B-R report states that this historical destination remains intact, but direct enumeration disproves that statement.

Per the R1A-FINAL read-only boundary, the missing object was not restored and the accepted migration row was not edited.

## 7. Unauthorized extras and contradiction scan

Apart from the missing legacy reroute destination, the independent actual-production inventory found:

```text
unauthorized extra audited objects: 0
unauthorized extra claim instances: 0
stale BACKGROUND_* objects: 0
stale BACKGROUND_REL_* objects: 0
duplicated event-derived biography: 0
duplicate R1A-2A.1 milestones: 0
synthetic neutral relationship containers: 0
duplicate pseudo-events: 0
unauthorized event/background conflicts: 0
unauthorized duplicate relationship semantics: 0
stale MOVED_TO_BACKGROUND dispositions: 0
missing R1A-2A split destinations: 0
unreviewed destination sections: 0
```

The blocker is outside the 275 R1A-2A destination-instance universe: it concerns exact preservation of one separately accepted pre-existing high-risk migration destination. That is why `275/275` can pass while the complete production verification is blocked.

## 8. Source-backed semantic spot-check

The mechanical check was exhaustive. The following high-risk cases were also checked against cited source material and reviewed authority.

### Ainz

- Cassandra negotiation remains Campaign history through `P3-007`; it is not biographical background.
- The dragon-king protection declaration remains Campaign history through `P3-010`; it does not establish an unsupported D3 obligation.

### Mixed legacy field

- Cassius Bright's valid biography remains biography.
- Cassius Bright's early-Campaign claim maps to three Campaign events.
- Identical legacy-field family did not control their semantic route.

### Knowledge

Five cases covered testimony, theory, rumor, memory validity, and multi-event acquisition. Epistemic status was not strengthened:

- Haku succession knowledge preserves testimony semantics;
- Gremlin terminal-transformation material remains theory;
- Oshira lineage material remains rumor;
- Lulutiye memory keeps its validity boundary;
- Jiang Ziyou's lookalike-attack knowledge keeps the two reviewed acquisition events.

### Ability/status

Checks covered a background-derived transition, a Campaign transition, a nullable/unknown before-state, and unknown persistence. Elder Xue, Ellie, and Honda retained their reviewed typed values and uncertainty boundaries.

### Relationships and PC boundary

All five new R1A-2A.1 baselines were checked against their cited original source passages. Each baseline is a narrow historical statement supported by the source. Neither those baselines nor the two selected Youyou ↔ Yu Linfeng comprehensive containers add private thought, present emotion, permanent romance, permanent loyalty, inferred consent, future choice, or an unmade promise.

```text
new baselines source-checked: 5/5
selected comprehensive containers checked: 2/2
unresolved source refs: 0
epistemic strengthening: 0
unsupported D3 obligations: 0
PC-control regressions: 0
```

## 9. Chinese review fidelity

Across all generated reviews, migration dispositions and rendered production semantics agree with their packages. The two repaired Ainz claims no longer appear as biography, and repaired relationships appear under relationship structures.

No package-to-review mismatch was found. However, the `NPC_YOUYOU` review faithfully repeats the package's dangling migration destination. Review/package agreement therefore does not resolve the missing-object blocker.

## 10. Package/candidate consistency

All 37 package/candidate pairs agree on the independently inventoried audited semantic fields:

```text
direct package-to-candidate semantic mismatches: 0
profiles compared: 37/37
```

The compiler did not independently alter relationship targets, container assignment, knowledge epistemic status, ability/status typed values, or biography classification. Nevertheless, both layers omit the same accepted legacy milestone object while retaining the migration reference. Package/candidate agreement therefore reproduces rather than cures the blocker.

## 11. Production drift review

The preserved old snapshot was available at audit time and was compared path by path.

```text
old files: 138
repaired files: 140
different paths: 108
modified paths: 106
added: 2
removed: 0
unchanged: 32
```

Classification:

```text
EXPECTED_REMEDIATION_CHANGE: 93
AUTHORIZED_R1A2A1_CONTAINER_CHANGE: 15
UNCHANGED: 32
UNEXPECTED_DRIFT: 0
```

The two added files are the reviewed lineage and semantic-audit outputs. The semantic blocker occurs inside an otherwise expected remediation change; it is not an unclassified path drift, so `UNEXPECTED_DRIFT` remains zero.

## 12. Static runtime-boundary audit

Read-only code inspection confirmed:

- audited legacy history is filtered before the generic background converter;
- production consumes already-materialized reviewed authority;
- semantic materializers are not imported by the runtime production path;
- missing reviewed realization is a hard failure;
- the seven container decisions use exact R1A-2A.1 authority;
- no new semantic fallback was introduced.

Static counts:

```text
builder semantic fallbacks: 0
production materializer imports: 0
clause splitting: 0
keyword semantic routing: 0
nearest-event inference: 0
relationship-target inference: 0
container-selection inference: 0
persistence inference: 0
epistemic inference: 0
behavior-to-persona inference: 0
runtime paraphrasing: 0
legacy-claim semantic fallback: 0
```

## 13. Publication implementation review

Read-only inspection of `scripts/run_r1a2br_rebuild.py` confirms the normal successful path performs a complete staging build and staging validation, a deterministic second-build comparison, and then whole-tree publication. No normal production consumer directory is deliberately published before mandatory validation succeeds.

The documented Windows two-rename visibility limitation remains present and is accepted for this review.

## 14. Canonical checks and production immutability

Production fingerprint before check mode:

```text
140 files
8f3fb134090342b22f29d9d7e2bf5df94c261b2019c7a52f74fdda3e8e8c3dde
```

Commands and results:

```text
python scripts/prepare_phase3d_r2c_packages.py --check
PASS — 37 provisional packages

python scripts/build_phase3d_r2c.py --check
PASS — R2C_CANDIDATES_MATCH, 37 candidates
```

Production fingerprint after check mode is identical. These check modes pass because their present validation surface does not require every accepted high-risk migration destination ID to resolve to an actual production object.

## 15. Regression suite

The unchanged complete suite was run:

```text
python -m unittest discover -s tests -p "test*.py"
Ran 300 tests in 131.803s
OK
failures: 0
errors: 0
```

The tests pass but do not establish R1A-FINAL PASS: the existing exact-reroute regression checks the accepted migration row and destination ID list, not the existence of every listed destination object.

No test or expected output was modified.

## 16. Determinism

Two complete generations were produced in separate temporary staging directories without publication. Each was independently fingerprinted and compared with the published tree.

```text
staged generation A: 140 files, 8f3fb134090342b22f29d9d7e2bf5df94c261b2019c7a52f74fdda3e8e8c3dde
staged generation B: 140 files, 8f3fb134090342b22f29d9d7e2bf5df94c261b2019c7a52f74fdda3e8e8c3dde
published production: 140 files, 8f3fb134090342b22f29d9d7e2bf5df94c261b2019c7a52f74fdda3e8e8c3dde
A == B: yes
A == published: yes
byte differences: 0
```

Determinism passes. It deterministically reproduces the missing milestone destination and therefore cannot override the semantic blocker.

## 17. Final verification matrix

| Requirement | Result |
|---|---:|
| Authority hashes | PASS |
| Frozen inputs | 488/488 |
| R1A-1 identities | 145/145 |
| R1A-2A destination instances | 275/275 |
| Realization modes | 105/105, 32/32, 138/138 |
| Exact splits | 46/46 |
| Relationship history | 29/29 |
| Container decisions | 7/7 |
| New containers | 5/5 |
| Existing selections | 2/2 |
| Container milestone assignments | 20/20 |
| Complete relationship records | 56/56 schema-valid |
| Exact pre-existing high-risk reroutes | **15/16 destination-complete** |
| Unauthorized extras | 0 |
| Semantic contradictions | 0 |
| Package/candidate direct mismatches | 0 |
| PC-control regressions | 0 |
| Runtime semantic fallbacks/heuristics | 0 |
| Canonical checks | PASS |
| Full tests | 300/300 PASS |
| Determinism | PASS, 0 byte differences |
| Unexpected path drift | 0 |
| Production fingerprint stable | yes |

## 18. Final decision

The repaired output is internally deterministic and faithfully realizes the complete reviewed R1A-2A/R1A-2A.1 authority stack, but the complete production obligation also includes exact preservation of the accepted pre-existing high-risk reroutes. One such reroute advertises a relationship milestone object that is absent from both package and candidate output.

Accordingly:

```text
R1A-FINAL STATUS: BLOCKED
R1A STATUS: OPEN
NEXT: BLOCKED_BY_PRODUCTION_AUTHORITY_MISMATCH
```

No repair is performed in R1A-FINAL. Phase 4 is not authorized.
