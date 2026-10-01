# R1A-2A — Full Reviewed Realization Surface

Status: `PASS`

R1A-2A completes the reviewed realization layer between the accepted R1A-1 semantic adjudication and the future R1A-2B serializer. It does not rebuild or modify any R2C production artifact.

## 1. Original R1A-2 blocker

R1A-2 correctly stopped with `BLOCKED_BY_LEDGER_REALIZATION_GAP`. R1A-1 had frozen where 145 legacy semantic identities belong, but 44 of the 46 `split_required` records still lacked exact destination-specific atomic content or typed constructor values. The two campaign-only splits were already mechanically sufficient:

- `NPC_HONDA_KAI_FERGUS / CLAIM_HONDA_SANCTUARY_WAR`
- `PC_YU_LINFENG / CLAIM_YU_LINFENG_DRAGON_SANCTUARY_HISTORY`

This report preserves that historical stop; it does not rewrite the R1A-2 report.

## 2. Full 145-record sufficiency methodology

The accepted R1A-1 ledger remains authoritative for category, destination routes, split requirement, R2A event references, source references, temporal classification, and reviewed uncertainty. R1A-2A performed a second, destination-instance-level review over all 145 identities:

1. expand every reviewed route into an explicit, finite destination-instance set;
2. reuse each authorized campaign event by exact stable R2A event ID rather than rewriting event prose;
3. reuse a legacy value only when it is already atomic for its sole destination;
4. author and freeze an exact existing-schema payload for every conflated or typed route;
5. freeze relationship target and one milestone per reviewed relationship event;
6. validate every source reference, event reference, required schema field, route set, instance key, and instance cardinality;
7. reject any missing decision rather than permitting builder fallback.

The resulting authority chain is:

```text
R1A-1 semantic adjudication
  -> semantic_realization_decisions.jsonl
  -> deterministic semantic_realization_ledger.jsonl
  -> future R1A-2B lookup / validate / serialize only
```

## 3. Confirmed 44 initial gaps

All 44 records listed in `R1A_2_REPAIR_AND_REBUILD_REPORT.md` are classified `KNOWN_INITIAL_GAP` in the decision source. All now have exact destination instances and typed payloads. The result is `44/44 resolved`, with no route changes and no unresolved realization.

The two already-sufficient split records remain pure event reuse. They create one `campaign_timeline` realization instance per accepted R2A event and zero rewritten local event objects.

## 4. Additional 36 multi-route/non-split records

The live accepted ledger contains exactly 36 records satisfying:

```text
multiple intended R2C destinations
AND split_required == false
```

All 36 were inspected. Each had at least one typed non-event destination for which the future builder could not safely choose an atomic statement, epistemic value, transition state, relationship target, or per-event cardinality from R1A-1 alone. All 36 therefore receive `ADDITIONAL_MULTI_ROUTE_GAP` and now have reviewed typed payloads.

Result: `36 checked / 36 additional gaps found / 36 resolved`.

## 5. Single-route typed destinations

The ledger contains 66 single-route identities. Atomic background, identity, role, affiliation, relationship-baseline, and one-event relationship values were reviewed for direct reuse.

Two additional gaps were found among single-route relationship timelines:

- `NPC_WHITE_MAGICIAN / CLAIM_WHITE_MAGICIAN_YU_HISTORY`
- `NPC_YOUYOU / CLAIM_YOUYOU_YU_SHARED_HISTORY`

Each old claim covered two different events, so one copied compound milestone would have left event-to-change mapping to the builder. R1A-2A freezes two separate event-specific milestones for each. `PC_YU_LINFENG / CLAIM_YU_LINFENG_YOUYOU_HISTORY` has the same structural issue, but it was already one of the known 44.

Result: `66 checked / 2 additional gaps found / 2 resolved`.

## 6. Final realization population

| Population | Records |
|---|---:|
| Known initial blocking records | 44 |
| Additional multi-route/non-split gaps | 36 |
| Additional single-route gaps | 2 |
| Final records requiring reviewed typed payloads | 82 |
| R1A-1 semantic identities covered | 145/145 |
| Explicit destination instances | 275/275 |
| `split_required` realization-sufficient | 46/46 |
| `REALIZATION_UNRESOLVED` | 0 |

## 7. Realization modes

- `REUSE_R2A_EVENT` — exact stable R2A event reuse; the realization records `local_object_count: 0`. Count: 105.
- `REUSE_EXISTING_ATOMIC_VALUE` — an existing reviewed single-destination value is already atomic; its complete target-schema payload is frozen in the decision source. Count: 32.
- `REVIEWED_TYPED_PAYLOAD_REQUIRED` — R1A-2A reviewed and froze atomic text, cardinality, target identity, event association, and all required target-schema values. Count: 138.
- `REALIZATION_UNRESOLVED` — evidence cannot determine an exact realization. Count: 0.

## 8. Per-target schema strategy

No schema field was added.

- `campaign_timeline`: exact R2A event reference only; no pseudo-event prose and no local event object.
- `biographical_background`: full `BackgroundItem` payload with background-only statement, temporal scope, relative time, provenance, uncertainty, and reviewed event association.
- identity role/affiliation/public identity: full `IdentityClaim` payload with atomic statement and attribution.
- persona/value: full `PersonaClaim` payload with supported proposition and reviewed stability; no behavior-to-trait inference.
- relationships: exact target plus either a complete `RelationshipRecord` baseline or a complete `RelationshipMilestone`.
- ability/status: full `AbilityStatusTransition` with explicit before state (nullable only where genuinely unknown), after state, persistence, event/background association, and provenance.
- knowledge: full `KnowledgeItem` with proposition, epistemic status, attribution/source character, acquisition event/order, and validity boundary.

Every payload validates against the existing `character_profile_v2.schema.json` definition for its target. The schema can represent all reviewed realizations without information loss.

## 9. Relationship realization strategy

Relationship baselines and milestones are separate destination instances. Every baseline freezes its target and historical/durable statement; `current_stance` remains null unless an accepted source explicitly supports it. Historical relationships do not create current emotion, loyalty, obligation, or future conduct.

Every relationship route with R2A events has an event-set equality check: the set of realized milestone event IDs must equal the accepted R1A-1 event set. Multiple relationships embedded in one old claim are represented as separate target instances. The audit rejects identical baseline and milestone prose copied across sections.

## 10. Knowledge realization strategy

Knowledge payloads distinguish `KNOWS`, `BELIEVES`, `SUSPECTS`, `TESTIMONY_HEARD`, `THEORY`, and `RUMOR`. Testimony, investigation notes, character interpretation, and rumor remain attributed and are not promoted to objective Canon.

Memory removal is represented as a validity boundary on previously held knowledge rather than inventing a new belief. Multi-event claims such as the Jewel Elder transfer explanation have separate propositions tied to the exact acquisition/confirmation events.

## 11. Ability/status realization strategy

Each transition freezes `transition_type`, `before_state`, `after_state`, `persistence`, and the exact authorized event or background association. The validator rejects identical non-null before/after states. Unknown before states and unknown persistence remain null/`unknown`; no missing state is inferred merely to make a transition look complete.

Dream-derived reward carry-back is represented only where a later main-world Campaign event explicitly demonstrates the ability. Special Interlude material is otherwise isolated.

## 12. PC control-boundary verification

All `PC_YU_LINFENG` payloads remain historical records of sourced actions, statements, received effects, memories, or relationships. They do not create private thoughts, unmade choices, future actions, or permanent emotional commitments.

The engagement baseline states that the arrangement was temporarily accepted as a protective expedient, retains 悠悠's later choice, leaves `current_stance` null, and explicitly does not create a permanent emotional commitment. The four existing PC generation permissions remain outside this task and unchanged.

## 13. Unresolved and contradiction result

- `REALIZATION_UNRESOLVED`: 0
- R1A-1 route contradictions: 0
- R1A-1 route changes: 0
- unsupported routes: 0
- unresolved R2A event refs: 0
- unresolved source refs: 0
- builder-time semantic inference requirements: 0

No `BLOCKED_BY_R1A1_CONTRADICTION` or `BLOCKED_BY_SCHEMA_REALIZATION_GAP` condition was found.

## 14. Deterministic ledger verification

`scripts/audit_r1a2a_realizations.py` is read-only with respect to source decisions and production R2C artifacts. It deterministically projects the 145 decision records into `semantic_realization_ledger.jsonl`, sorts destination instances, validates schema compatibility and lineage, and has a byte-strict `--check` mode.

`scripts/materialize_r1a2a_reviewed_decisions.py` records the one-shot source-review decomposition used to create the decision artifact and refuses to overwrite an existing decision file. It is provenance for this review, not a runtime authority: R1A-2B must read the materialized decision/ledger artifacts and must not import or rerun the materializer.

Two independent projections are byte-identical, and the checked-in ledger passes `--check`.

## 15. Production freeze verification

R1A-2A writes only its remediation decision/ledger, documentation, audit helper, and tests. It does not modify or regenerate migration packages, R2C candidates, Chinese reviews, migration ledgers, original sources, Phase 3C/3D/3D-R, R2A, R2B, schemas, Canon, Worldbook, Current State, or frozen manifests.

Verification confirms:

- frozen inputs: `488/488` hash matches;
- R2C production tree: byte-unchanged during the test run;
- production R2C writes: 0;
- deterministic ledger check: PASS;
- R1A-2A tests: 7/7 PASS;
- R1A-1 tests: 9/9 PASS;
- R2C baseline tests: 57/57 PASS;
- full test discovery: `272/272` PASS.

## 16. R1A-2B handoff boundary

R1A-2B may consume only the exact destination instances in `semantic_realization_ledger.jsonl`. Missing lookup, missing instance, route mismatch, payload schema failure, or new event/source reference must be a hard error. R1A-2B must not split clauses, select nearest events, infer relationship targets, infer epistemic status, infer persistence, or fall back to the legacy claim.

R1A-2B has not been started. Phase 4 has not been entered.
