# R1A-2A.1 — Seven Reviewed Relationship Container Decisions

## 1. Status

`PASS`

- blocked profile/target pairs reviewed: 7
- resolved under the frozen schema: 7
- confirmed schema gaps: 0
- runtime relationship-container inference required: 0
- reviewed milestones expected / assigned exactly once: 20 / 20
- complete `RelationshipRecord` candidates passing the frozen schema: 7 / 7

`NEXT: READY_TO_RESUME_R1A_2B`

This review does not resume R1A-2B, write production R2C artifacts, change the frozen schema, or change Canon.

## 2. Why R1A-2B stopped

R1A-2B correctly stopped when its serializer reached seven profile/target groups for which R1A-2A supplied valid `RelationshipMilestone` objects but did not supply a unique enclosing `RelationshipRecord`. Five groups had no exact-target baseline/container authority. Two groups had an original Phase 3D-R exact-target record plus additional R1A-2A exact-target baseline realizations, so choosing a milestone container by list order would have been an unreviewed semantic decision.

The frozen schema requires every relationship record to contain a nonempty `relationship_baseline`. Creating a neutral carrier such as “they interacted” would have added unsupported semantics. The stop therefore protected the source boundary.

## 3. Why this was reviewed as container authority before schema design

The defect appeared at the container boundary, not inside the already accepted milestone payloads. The review therefore used this order for each pair:

1. exact-target Phase 3D-R relationship records;
2. the original evidence cited by the old claim;
3. the reviewed R2A event;
4. Phase 3C / Phase 3D evidence;
5. Current State only for D3/current-stance limits;
6. R1A-1 and R1A-2A reasoning.

No defective old R2C background projection was used as semantic evidence. A schema gap would have been confirmed only if a valid milestone had neither a compatible existing container nor any source-supported substantive baseline. Direct review found a source-supported, narrowly bounded baseline for all five no-container groups and a uniquely justified existing comprehensive container for both ambiguous groups. The frozen schema is therefore sufficient for these seven cases.

## 4. Reviewed decisions

| Profile → target | Action | Selected/new container | Baseline boundary | Current stance |
|---|---|---|---|---|
| `NPC_HONDA_KAI_FERGUS` → `NPC_YOUYOU` | `CREATE_REVIEWED_CONTAINER` | `RELATIONSHIP_HONDA_KAI_FERGUS_YOUYOU` | Honda's historical role as the dragon king who hosted Youyou's P2-020 succession ceremony | `null` |
| `NPC_JIANG_ZIYOU` → `NPC_CASSIUS_BRIGHT` | `CREATE_REVIEWED_CONTAINER` | `RELATIONSHIP_JIANG_ZIYOU_CASSIUS_BRIGHT` | companions in the Mysterious Sea dream adventure; Special Interlude only | `null` |
| `NPC_KENDA_KAI_FERGUS` → `PC_YU_LINFENG` | `CREATE_REVIEWED_CONTAINER` | `RELATIONSHIP_KENDA_KAI_FERGUS_YU_LINFENG` | parties taking opposed stated positions in the P2-020 match/engagement negotiation | `null` |
| `NPC_LULUTIYE` → `NPC_YOUYOU` | `CREATE_REVIEWED_CONTAINER` | `RELATIONSHIP_LULUTIYE_YOUYOU_HOME_PRESENCE` | at P3-004, Youyou explicitly included Lulutiye among those whose presence made the foreign place feel like home | `null` |
| `NPC_XIERLUN_VON_GILCODE` → `PC_YU_LINFENG` | `CREATE_REVIEWED_CONTAINER` | `RELATIONSHIP_XIERLUN_YU_ENGAGEMENT_PLANNING` | historical participant in planning Yu Linfeng and Youyou's engagement arrangement | `null` |
| `NPC_YOUYOU` → `PC_YU_LINFENG` | `USE_EXISTING_CONTAINER` | `RELATIONSHIP_YOUYOU_YU_LINFENG` | existing comprehensive “mutual life-saving history” record | `null` |
| `PC_YU_LINFENG` → `NPC_YOUYOU` | `USE_EXISTING_CONTAINER` | `RELATIONSHIP_YU_LINFENG_YOUYOU` | existing comprehensive “mutual life-saving history” record | `null` |

Action totals: 2 use existing, 5 create reviewed, 0 merge, 0 schema gap.

## 5. Case evidence and exact decision basis

### 5.1 Honda → Youyou

Phase 3D-R contains only Honda → Kenda, so no exact-target container can be reused. The P2 source states that Honda formally begins the ceremony, announces Youyou's succession and inherited name, and addresses her directly (`extracted-second/...页 17/posts.md:671-683`). This supports the atomic historical ceremony-host baseline. It does not support guardianship, private affection, permanent obligation, political support, or a D3 stance.

Assigned milestone:

- `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`

### 5.2 Jiang Ziyou → Cassius Bright

Phase 3D-R contains Jiang → Yu Linfeng, not Jiang → Bright. The original cited span records Jiang, Yu, and Bright together during the attack (`extracted-first/11/posts.md:63-102`). The later direct wording calls the group teammates/companions and names Bright (`extracted-first/11/posts.md:424-426`). This independently supports a Special-Interlude companion baseline. It does not transfer dream companionship into a present main-world relationship.

Assigned milestone:

- `EVENT_INTERLUDE_002_MONSTER_BOX_ACQUIRED_2`

### 5.3 Kenda → Yu Linfeng

Phase 3D-R contains Kenda → Honda, not Kenda → Yu. In the private P2-020 exchange, Kenda asks Yu to lose the match and abandon the engagement; Yu explicitly refuses (`extracted-second/...页 17/posts.md:378-408`). This supports only the historical fact that they were negotiating parties with conflicting expressed positions. It does not establish permanent enmity, Kenda's true motive, Yu's D3 emotion, or Yu's future choice.

Assigned milestone:

- `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`

### 5.4 Lulutiye → Youyou

There is no existing exact-target container. P2-009 directly establishes recognition and reunion (`extracted-second/...页 7/posts.md:48-57`). More importantly, in P3-004 Youyou explicitly names Lulutiye among the people whose presence makes the foreign place feel like home (`extracted-third/...页 2/posts.md:655-660`).

The reviewed baseline preserves exactly that attributed, time-bounded relationship state. It is not the neutral structural claim “they interacted,” and it does not relabel Lulutiye as family or infer reciprocity, permanent friendship, obligation, inner thought, or present persistence. Because the schema record's notes and the separate temporal boundary freeze these limits and `current_stance` remains `null`, the source-supported statement can be represented without invention. This case therefore does not prove a schema gap.

Assigned milestones:

- `EVENT_P2_009_AFTERMATH_HAKU_KNOWLEDGE_1`
- `EVENT_P3_004_SERTANT_AWAKENING_AND_HOME_2`

### 5.5 Xierlun → Yu Linfeng

The existing Phase 3D-R engagement container targets Youyou, so it cannot be repurposed. The setting reference explicitly states Xierlun's participation in planning the engagement (`设定 人物/妄想大陆设定集_检索版.md:148-153`), and P2-018 records his proposal and explanation to Yu (`extracted-second/...页 15/posts.md:390-450`). The baseline is limited to that historical planner role. It does not establish D3 support, continuing engagement validity, Yu's current emotion, permanent commitment, future obligation, or future choice.

Assigned milestone:

- `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY`

### 5.6 Youyou → Yu Linfeng

Candidate inventory:

- `RELATIONSHIP_YOUYOU_YU_LINFENG`: original Phase 3D-R comprehensive shared-history container; baseline `mutual life-saving history`; spans rescue, curse transfer, conditional engagement, inheritance passage, and later protection; `current_stance = null` after schema conversion.
- `RELATIONSHIP_PC_YU_LINFENG_CLAIM_YOUYOU_YU_LATE_MILESTONES_PC_YU_LINFENG`: R1A-2A historical engagement-facet baseline; explicitly temporary/protective and preserves Youyou's later choice; no current stance.

These are different relationship facets and are not semantic duplicates, so they are not merged. The original Phase 3D-R container explicitly owns both the early and late shared history and is therefore selected for all six reviewed milestones. This selection is evidence-based, not order-based. The R1A-2A baseline remains separate and unchanged.

Assigned milestones:

- `EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE_1`
- `EVENT_P1_021_JERGAL_TRANSFER_2`
- `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY_1`
- `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_2`
- `EVENT_P3_003_TEIRESIAS_REVELATION_3`
- `EVENT_P3_009_DEATHWING_FINAL_WAR_4`

### 5.7 Yu Linfeng → Youyou

Candidate inventory:

- `RELATIONSHIP_YU_LINFENG_YOUYOU`: original Phase 3D-R comprehensive PC-continuity shared-history container; baseline `mutual life-saving history`; includes rescue, curse transfer, escort, inheritance witnessing, and later protection; no current stance.
- `RELATIONSHIP_NPC_YOUYOU_CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY_NPC_YOUYOU`: R1A-2A temporary protective-engagement baseline; no milestone route in that claim; no current stance.
- `RELATIONSHIP_NPC_YOUYOU_CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY_NPC_YOUYOU`: R1A-2A late-history engagement-facet baseline; no current stance.

The two engagement baselines are distinct facets and are not merged into the comprehensive shared-history record. The original Phase 3D-R container is source-compatible with all eight milestones, including the inheritance-witness milestones, so it is selected explicitly. No PC emotion, current consent, loyalty, promise, permanent commitment, or future action is added.

Assigned milestones:

- `EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE_1`
- `EVENT_P1_021_JERGAL_TRANSFER_2`
- `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY_1`
- `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_1`
- `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING_2`
- `EVENT_P3_003_TEIRESIAS_REVELATION_2`
- `EVENT_P3_003_TEIRESIAS_REVELATION_3`
- `EVENT_P3_009_DEATHWING_FINAL_WAR_4`

## 6. Milestone assignment equality

The validator derives the expected population directly from the unchanged R1A-2A semantic realization ledger by exact `(profile_id, target_profile_id, destination_instance_key)` identity.

- expected: 20
- assigned exactly once: 20
- missing: 0
- extra: 0
- duplicate assignments: 0

The enriched ledger embeds the accepted R1A-2A milestone payloads verbatim and only adds the reviewed container association. No milestone text, ID, event reference, story order, uncertainty, attribution, or source reference was rewritten.

## 7. Complete-container schema validation

For each resolved pair the validator constructs an in-memory object from:

`reviewed baseline/container payload + exact accepted milestone payloads + deterministic source union`

It then validates the complete object against `$defs.RelationshipRecord` in the frozen `character_profile_v2` schema. Results:

- complete records passed: 7
- failed: 0
- baseline-only validation substituted for full validation: 0

The decision layer contains the baseline payload with an empty milestone array; the deterministic ledger contains the complete schema-valid record with all assigned milestones.

## 8. Schema-gap result

Confirmed genuine schema gaps: 0.

No baseline was synthesized from schema necessity. The five new baselines are substantive, source-supported historical relationship statements with explicit temporal/current-state restrictions. The two reused records already contain the relevant shared history. Therefore no optional baseline, milestone-only record, structural-neutral baseline, renderer change, or candidate/profile schema change is justified by these seven cases.

## 9. PC control boundary

Status: preserved.

All four records involving `PC_YU_LINFENG` keep `current_stance = null`. The review adds no private thought, present emotion, permanent romantic commitment, permanent loyalty, unmade promise, future choice, voluntary action, or new goal. The accepted historical facts remain limited to recorded negotiations, temporary protective acceptance, retained future choice, witnessed events, and other completed source events.

## 10. Separate authority and determinism

The historical R1A-2A decisions and ledger were not rewritten. R1A-2A.1 is a separate authority layer:

- `work/remediation/r1a2a1/relationship_container_decisions.jsonl`
- `work/remediation/r1a2a1/relationship_container_ledger.jsonl`

The ledger is sorted deterministically by profile/target. Two independent generations produced byte-identical output.

- decisions SHA-256: `e70a1dde0b6dd17f4ed0d5d1efd23cba516db8791c5d3ab869b0f63a35a1f95d`
- ledger SHA-256 on both runs: `bc426551e4438b59d96ed43ffb8d3870eca7f70974cfce8ce2e97f57086682e1`

## 11. Frozen authority and production verification

Frozen input manifest verification: 488 / 488.

Existing authority hashes remain unchanged:

- R1A-1 ledger: `4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7`
- R1A-2A decisions: `d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d`
- R1A-2A ledger: `0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b`

The restored production `work/phase3d_r2c` tree still contains 138 files. A path-by-path SHA-256 comparison against the preserved pre-R1A-2B snapshot found 0 added, removed, or changed files. Because the current tree is byte-identical to that snapshot, the previously recorded aggregate hash remains:

`571b2e36690a396aff9f81602b6003ce1774ee2662e29794087e30123f190ccc`

No production package, candidate, review, migration ledger, schema, Canon, Worldbook, Current State, R2A, R2B, or frozen manifest was written.

## 12. Verification and test interpretation

Passing focused suites:

- R1A-1: 9 / 9
- R1A-2A: 7 / 7
- R1A-2A.1: 8 / 8
- R1A-2B authority/preflight: 7 / 7

Required broader runs were also executed:

- R2C baseline: `python -m unittest tests.test_phase3d_r2c` — 39 run, 27 passed, 12 errors.
- Full discovery: `python -m unittest discover -s tests -p 'test*.py'` — 269 run, 257 passed, 12 errors.

The 12 errors are explicit carry-forward state, not concealed PASSes:

- 4 build/check tests reach the staged R1A-2B production-realization audit and reject the restored pre-R1A-2B package destination for `NPC_AINZ_OOAL_GOWN/CLAIM_AINZ_OOAL_GOWN_HISTORY_1` (`TIMELINE` expected by the new authority, restored production still has `BACKGROUND`).
- 8 preparation-dependent tests stop at `BLOCKED_BY_SCHEMA_REALIZATION_GAP` beginning with Honda → Youyou because this task was expressly forbidden to wire the new R1A-2A.1 ledger into or resume the R1A-2B runtime.

The focused R1A-2B preflight intentionally still asserts that stop. Turning these 12 tests green would require resuming R1A-2B serializer/build integration, which is the declared next task and outside this task's production freeze. R1A-2A.1's `PASS` therefore means that all seven reviewed container-authority gaps are resolved under the frozen schema; it does not claim that the deliberately unresumed R1A-2B build path is green. Production remained untouched.

## 13. Files added

- `docs/remediation/R1A_2A1_RELATIONSHIP_CONTAINER_REVIEW.md`
- `scripts/audit_r1a2a1_relationship_containers.py`
- `tests/test_r1a2a1_relationship_containers.py`
- `work/remediation/r1a2a1/relationship_container_decisions.jsonl`
- `work/remediation/r1a2a1/relationship_container_ledger.jsonl`

The implementation plan and execution ledger were also added under `docs/superpowers/plans/` and `.superpowers/sdd/`; they are process records, not remediation authority or production artifacts.
