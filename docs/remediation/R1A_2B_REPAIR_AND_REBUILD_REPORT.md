# R1A-2B Repair and Rebuild Report

## Status

`BLOCKED_BY_SCHEMA_REALIZATION_GAP`

R1A-2B did not complete production migration. The attempted rebuilt tree was quarantined and the exact pre-R1A-2B 138-file `work/phase3d_r2c` tree was restored.

## 1. Implemented architecture

`scripts/r1a2b_realization_serializer.py` implements a strict loader for the accepted materialized R1A-2A authority, exact `(profile_id, old_claim_id)` lookup, reviewed-mode dispatch, and existing-schema serialization. `scripts/prepare_phase3d_r2c_packages.py` filters audited legacy history before the generic background converter can see it. No missing realization falls back to legacy prose.

## 2. Authority preflight

The following checks pass without production writes:

- R1A-1 identities: 145
- R1A-2A identities: 145
- identity mismatches: 0
- destination instances: 275
- mode counts: 105 `REUSE_R2A_EVENT`, 32 `REUSE_EXISTING_ATOMIC_VALUE`, 138 `REVIEWED_TYPED_PAYLOAD_REQUIRED`
- route mismatches: 0
- unsupported routes/modes: 0
- unresolved event refs: 0
- unresolved source refs: 0
- typed payload schema errors at the individual-instance level: 0

Runtime reads `work/remediation/r1a2/semantic_realization_ledger.jsonl`. It does not import or execute `scripts/materialize_r1a2a_reviewed_decisions.py`.

## 3. Blocking schema defect

The frozen schema permits relationship milestones only inside a `RelationshipRecord`. Every such record requires a nonempty `relationship_baseline`. R1A-2A freezes several milestone instances with exact target and milestone payload but provides no authorized baseline record for seven profile/target containers, or leaves more than one existing exact-target record with no reviewed choice of container.

| Profile | Exact target | Problem |
|---|---|---|
| `NPC_HONDA_KAI_FERGUS` | `NPC_YOUYOU` | no authorized baseline container |
| `NPC_JIANG_ZIYOU` | `NPC_CASSIUS_BRIGHT` | no authorized baseline container |
| `NPC_KENDA_KAI_FERGUS` | `PC_YU_LINFENG` | no authorized baseline container |
| `NPC_LULUTIYE` | `NPC_YOUYOU` | no authorized baseline container |
| `NPC_XIERLUN_VON_GILCODE` | `PC_YU_LINFENG` | no authorized baseline container |
| `NPC_YOUYOU` | `PC_YU_LINFENG` | multiple exact-target records; no reviewed container choice |
| `PC_YU_LINFENG` | `NPC_YOUYOU` | multiple exact-target records; no reviewed container choice |

Creating a neutral or structural baseline would still add an unreviewed relationship statement, ID, uncertainty decision, and rendered relationship heading. Choosing among multiple records would be relationship-target inference. Both are forbidden.

The serializer therefore raises `BLOCKED_BY_SCHEMA_REALIZATION_GAP` before any package write when it encounters the first unrepresentable milestone.

## 4. Why the earlier `schema gaps: 0` result is insufficient

R1A-2A validated each milestone payload against `RelationshipMilestone` plus its target wrapper. It did not prove that the payload could be embedded into a complete frozen `RelationshipRecord` without inventing the required baseline or selecting an ambiguous existing record. R1A-2B exposed that container-level mismatch. This report does not edit R1A-2A authority to conceal it.

## 5. Hard-error behavior

The implementation also hard-fails for missing/duplicate identities, missing realizations, duplicate instance keys, route/count mismatch, unsupported modes, schema-invalid payloads, unknown sources/events, unauthorized events, target mismatch, stale migration destinations, and semantic fallback.

## 6. Unsafe audited routing removal

The code path for the 145 audited claims is filtered before `convert_background_claim()`. This implementation remains staged, but production was not replaced because the relationship schema defect prevents a complete safe build.

## 7. Realization modes and serializers

Event, background, identity, persona, ability/status, and knowledge dispatch are implemented from frozen payloads. Relationship baseline and milestone dispatch is implemented only when a reviewed baseline container exists unambiguously. Missing or ambiguous containers block rather than synthesize content.

## 8. Migration metadata

The staged implementation derives migration disposition from actual reviewed destinations and records instance keys/event refs in lineage. These results are not claimed as production-complete while the schema blocker remains.

## 9. Validator findings still open

Independent review found two additional weaknesses in the staged implementation:

1. the equivalence validator walks expected instances and does not yet build a complete independent inventory capable of proving that arbitrary unreviewed extra objects are absent;
2. the high-risk preservation check currently proves the 2/4/10 status histogram, not the exact 16 identities, destinations, and objects.

These are open items for the resumed R1A-2B attempt. No 275/275 production-equivalence PASS is claimed.

## 10. Atomic publication finding

The downstream compiler currently publishes candidate/review directories before all auxiliary ledgers. A later auxiliary-write failure could leave a mixed generation. The resumed attempt must stage and publish the complete downstream set atomically, or publish authority ledgers before consumers.

## 11. Production rollback

Before the attempted write, the original tree was copied to:

`C:\Users\pit\AppData\Local\Temp\codex-r1a2b-pre-rebuild-20261001\phase3d_r2c`

The attempted rebuilt tree was moved intact to:

`C:\Users\pit\AppData\Local\Temp\codex-r1a2b-blocked-output-20261001`

The original tree was restored to `work/phase3d_r2c`.

- restored files: 138
- restored aggregate hash: `571b2e36690a396aff9f81602b6003ce1774ee2662e29794087e30123f190ccc`
- equal to pre-write snapshot: yes
- invalid structural carriers remaining in production: 0

## 12. Frozen inputs

Frozen manifest verification passed for 488/488 inputs before the attempted migration. No schema, Canon, Worldbook, Current State, R2A chronology, R1A-1 authority, or R1A-2A authority was modified.

- R1A-1 ledger: `4db290bbb287a28576b8e84bf8e399eb6db3a37d1acb6935da56cee1ad76a8b7`
- R1A-2A decisions: `d5f53cad4ebb2068e460e8b13bc49d712e4d393b6b309eae491ce7109cd2c40d`
- R1A-2A ledger: `0000abfd6cbb6946ae5bbcb50875c69fc4c17a4f0960ed3bec031bad0613e66b`

## 13. Test interpretation

Before independent review exposed the container-level defect, the staged implementation reached 284/284 tests and a deterministic 140-file attempted build. Those results are debugging evidence only, not a PASS: the test oracle allowed unreviewed structural carriers.

After correction, the R1A-2B preflight test asserts the required schema-gap stop. Production rebuild and repaired-output check modes are intentionally not claimed as passing.

## 14. Materializer and heuristic audit

The production modules do not import the one-shot R1A-2A materializer. No clause splitting, keyword routing, nearest-event selection, persistence inference, epistemic reinterpretation, relationship-target inference, behavior-to-persona inference, runtime paraphrasing, or missing-realization fallback was added.

## 15. Required human decision

R1A-2B can resume only after one reviewed solution is authorized for the seven relationship container gaps:

1. revise the frozen schema to support milestone-only relationship records without a semantic baseline; or
2. extend R1A-2A reviewed authority with exact baseline/container decisions for all seven cases.

Either option is a new schema or Canon/semantic decision point and requires human approval. The resumed attempt must also complete the independent extra-instance inventory, exact 16-reroute preservation check, and atomic full downstream publication before PASS.

## Conclusion

`BLOCKED_BY_SCHEMA_REALIZATION_GAP`

Phase 4 was not entered.
