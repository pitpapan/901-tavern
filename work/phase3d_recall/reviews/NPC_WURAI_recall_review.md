# NPC_WURAI Completeness Review

## Persona Coverage

REVIEWED — setting, character reference, and Campaign matches were checked; no additional stable persona trait met the promotion threshold.

## Narrative Continuity Coverage

PASS — every matched source file has exactly one disposition and every explicit pre-repair MISSING item has its required repair claim.

## Source Coverage

- Source files with direct name/alias matches checked: 12
- Additional source files beyond prior evidence references: 9
- Coverage matrix: `work/phase3d_recall/source_coverage/NPC_WURAI_coverage.md`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_c.md`
- Verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 2

## Major Timeline Stages

- Canonical Worldbook summary: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.
- Early Campaign / first campaign segment: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.
- Middle Campaign / second campaign segment: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.
- Setting / character-reference background: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

### Claim-Specific Timeline

| Stage | What happened / established | Persistent consequence / boundary | Current representation |
|---|---|---|---|
| Setting / character-reference background | 设定资料明确把武赖记为火神假面的持有者。 | 设定参考阶段的假面身份。 Phase 3D-R source-recall repair; no future state is inferred. stability=stable | `$.identity.established_history[1]` / `CLAIM_WURAI_FIRE_MASK` |
| Middle Campaign / second campaign segment | 法师塔事件后，现场记录把造成火柱的攻击归于武赖，并称其为八柱将。 | Atomic historical fact only; it does not establish a future behavior, motive, or allegiance. 仅保留来源直接支持的范围。 stability=stable | `$.identity.established_history[0]` / `CLAIM_WURAI_HISTORY_1` |
| Middle Campaign / second campaign segment | 武赖是帝国八柱将之一，并被称为帝国最强之矛。 | Only the Campaign-specific identity is retained; outside-franchise completion is excluded. 仅保留来源直接支持的范围。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_WURAI_IDENTITY` |
| Middle Campaign / second campaign segment | life_status=unknown; narrative_availability=inactive | Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. Profile depth does not force scene presence; inactive, restricted, historical, and interlude boundaries remain operative. stability=conditional | `$.presence` / `STATUS_NPC_WURAI_PRESENCE` |

## Missing Information Found

- 火神面具持有者身份

## PROFILED

- 4 explicit claim/knowledge/goal/status items in the effective candidate.

## ROUTED_ELSEWHERE

- 1 authoritative-layer routing decisions; see the coverage matrix for exact destinations.

## SEEN_NOT_PROMOTED

- 8 reviewed source matches excluded with file-specific reasons in the coverage matrix.

## MISSING

- Found before repair: 1
- Remaining after repair: 0
- MISSING: resolved; no unresolved item.

## Event Conflation Findings

- No unresolved EVENT_CONFLATION; relevant multi-character events were checked against the event audits.

## Ability / Status Transition Findings

- Required transition categories checked; no unrepresented durable transition found.

## Relationship Continuity Findings

- Cross-profile relationship milestones in the repair list were propagated only to explicitly affected profiles.

## Knowledge Continuity Findings

- Participation was not treated as full knowledge; statements, observations, inferences, unconsciousness, and unknowns remain separated.

## Repairs Applied

- Repaired candidate: `work/phase3d_recall/repaired_candidates/NPC_WURAI.json`
- Resolved: 火神面具持有者身份
- The historical draft patch remains frozen; a Phase 3D-R draft patch points to the repaired candidate.

## Remaining Ambiguities

- 稳定人格、价值排序与跨情境声线证据不足。
- D3 精确位置、即时议程与当前目标未知。

## Final Recall Status

COMPLETE

- Approval recommendation: `RECOMMENDED_FOR_APPROVAL`
- Human approval has not been granted or applied.
