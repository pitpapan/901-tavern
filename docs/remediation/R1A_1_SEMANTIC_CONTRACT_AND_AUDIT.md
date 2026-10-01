# R1A-1 — Semantic Migration Contract and Full R2C Converter Audit

Status: `PASS`

Scope: contract freeze and source-backed adjudication only. This work does not repair or rebuild any R2C migration package, candidate, Chinese review, Canon artifact, Worldbook, Current State, schema, or frozen manifest. It does not enter Phase 4.

## 1. Normative semantic contract

The following requirements are binding for R1A-2.

### C1 — Legacy storage location is not semantic type

Neither `identity.established_history` nor relationship `established_history` determines an R2C semantic destination. A legacy section is an inventory address, not evidence that a fact is biography, event, relationship, state, knowledge, persona, or ability/status material.

### C2 — Campaign events remain Campaign history/events

An occurrence in the original Campaign must remain represented as Campaign history/event material. It must not become `BIOGRAPHICAL_BACKGROUND` because it is established history, predates a later appearance, remains consequential, has a persistent result, or was stored under an `established_history` field.

### C3 — Background requires background semantics

`biographical_background` is permitted only for an atomic pre-Campaign biographical fact or another genuinely non-event historical/background fact under the R2C contract. The timestamp of the source post does not determine the fact's time: a Campaign post can state an earlier biographical fact, while an old profile field can contain a Campaign event.

### C4 — Event and persistent consequence are distinct

When a Campaign event also creates a separately supported durable state, R2C must preserve the event representation and create the state representation separately. The state must retain its source/event linkage where the existing schema permits it. The original event cannot be relabeled as background or present state.

### C5 — Semantic identity matters more than shared source chunk

Contradiction checks operate on the reviewed atomic claim/fact identity, represented here by `(profile_id, old_claim_id)`, plus the explicit split decision. Source-chunk overlap alone is not a semantic identity test: one chunk can contain both an event occurring in the scene and a statement about earlier biography.

### C6 — Rendering is not the semantic decision layer

Chinese review rendering displays and may flag upstream decisions. It must not infer, rewrite, or repair migration semantics.

## 2. Audit population and method

The exposure was reproduced from the 37 existing R2C migration packages and their effective Phase 3D-R source profiles. The machine procedure selects:

- Cohort A: `identity.established_history*` migrations currently marked `MOVED_TO_BACKGROUND`;
- Cohort B: relationship `established_history*` migrations that use the same background converter, including the converter-created `BACKGROUND_REL_*` target as well as the relationship milestone target.

The reproduced population exactly matches R1A-0:

| Cohort | Records | Profiles |
|---|---:|---:|
| `IDENTITY_ESTABLISHED_HISTORY` | 116 | 33 |
| `RELATIONSHIP_ESTABLISHED_HISTORY` | 29 | 23 |
| Combined union | 145 | 35 |

The raw effective profiles contain 132 top-level `identity.established_history` claims. Sixteen already use explicit high-risk reroutes (`2 MOVED_TO_ABILITY_STATUS`, `4 MOVED_TO_TIMELINE`, `10 SPLIT`) and are outside the accepted 116-record defect population. R1A-1 does not undo or reinterpret those 16 decisions.

For every exposed record, the audit inspected the source-bound old claim and its precise source refs, then used reviewed R2A decisions/chronology and story order, Phase 3C/3D/3D-R material, R2B only as temporal corroboration, and Current State only where D3 persistence was at issue. Legacy placement, current R2C placement, `MOVED_TO_BACKGROUND`, and character-specific override code were not treated as evidence.

## 3. Audit vocabulary

| Category | Normative meaning |
|---|---|
| `BACKGROUND_VALID` | The atomic fact has genuine pre-Campaign/non-event background semantics. It may still require an additional independently supported route when `split_required=true`. |
| `CAMPAIGN_EVENT` | The primary semantic identity is an original-Campaign occurrence, decision, speech act, encounter, transition, intervention, ruling, death, or transfer. |
| `RELATIONSHIP_EVENT` | The record is a Campaign-period relationship milestone/event. |
| `PERSISTENT_STATE` | The atomic claim is a durable state, role, affiliation, identity, relationship baseline, ability/status, knowledge state, or source-attributed profile state rather than the creating event. |
| `SPLIT_EVENT_AND_STATE` | One legacy record conflates an event and a separately supported durable state; both representations are required. |
| `UNRESOLVED` | Available evidence is insufficient or contradictory. R1A-1 found none. |

These categories are audit vocabulary, not new R2C schema enums. `intended_semantic_route` in the enriched ledger names only existing R2C sections.

## 4. Complete adjudication result

| Category | Identity | Relationship | Total |
|---|---:|---:|---:|
| `BACKGROUND_VALID` | 21 | 1 | 22 |
| `CAMPAIGN_EVENT` | 66 | 0 | 66 |
| `RELATIONSHIP_EVENT` | 0 | 15 | 15 |
| `PERSISTENT_STATE` | 11 | 10 | 21 |
| `SPLIT_EVENT_AND_STATE` | 18 | 3 | 21 |
| `UNRESOLVED` | 0 | 0 | 0 |
| **Total** | **116** | **29** | **145** |

The explicit `split_required` field is true for 46 records. This is intentionally independent of the primary category: it records that source wording must be decomposed into distinct atomic representations, not merely that the final record links to more than one schema section. Of the 22 `BACKGROUND_VALID` records, 14 have only a background route and 8 also require another reviewed semantic route; six of those eight require textual/atomic splitting.

The ledger routes resolve to the existing R2C structure:

- `biographical_background`
- `campaign_timeline`
- `identity.public_identity`
- `identity.durable_roles`
- `identity.durable_affiliations`
- `persona.core_personality`
- `persona.values`
- `relationships[].relationship_baseline`
- `relationships[].relationship_milestones`
- `ability_status_transitions`
- `knowledge_timeline`

No schema conflict was found. Existing R2C v2 structures can represent every adjudicated record without information loss, including multi-destination records, provided the builder creates distinct source-linked representations instead of relabeling one representation.

## 5. Confirmed defect scope

At least 123 of 145 exposed records have a primary category other than background and therefore cannot remain solely `BIOGRAPHICAL_BACKGROUND`:

- 95/116 identity records: 66 Campaign events, 11 persistent states, and 18 event/state splits;
- 28/29 relationship records: 15 relationship events, 10 persistent states, and 3 event/state splits.

The remaining 22 records have a valid background component, but eight also need another semantic destination. Consequently only 14/145 records support a background-only destination. Exposure and defect are not equated: those 14 legitimate background-only outcomes must be preserved by R1A-2.

The current converter also creates contradictory projections for relationship history: every relationship record produces a `BACKGROUND_REL_*` item and a milestone whose `reality_status` is `BIOGRAPHICAL_BACKGROUND`. That representation is wrong for 28/29 records. The one background-valid relationship record still needs explicit relationship handling and must not justify the unconditional shared converter. R1A-2 therefore needs a dedicated relationship semantic route, not inheritance from top-level biography conversion.

## 6. Representative source-backed decisions

| Record | Decision | R2A event / basis | Required result |
|---|---|---|---|
| `NPC_AINZ_OOAL_GOWN / CLAIM_AINZ_CASSANDRA_NEGOTIATION` | `CAMPAIGN_EVENT` | `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION` | P3 Campaign timeline; no generated biography item. |
| `NPC_AINZ_OOAL_GOWN / CLAIM_AINZ_OOAL_GOWN_HISTORY_1` | `CAMPAIGN_EVENT` | `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY` | P3 Campaign timeline; no generated biography item. The declaration does not prove a D3 obligation. |
| `NPC_CASSIUS_BRIGHT / CLAIM_BRIGHT_BACKGROUND` | `BACKGROUND_VALID` | character reference supports prior biography | Preserve as biography, proving the source-field family is semantically mixed. |
| `NPC_CASSIUS_BRIGHT / CLAIM_BRIGHT_EARLY_CAMPAIGN` | `CAMPAIGN_EVENT` | `EVENT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON` | Preserve as Campaign history/event. |
| `NPC_CASSANDRA / CLAIM_CASSANDRA_HISTORY_1` | `CAMPAIGN_EVENT` | source occurrence is covered by `EVENT_P3_008_FATE_BRANCH_SELECTION` | Preserve the in-Campaign talisman transfer as Campaign history/event. |
| `NPC_EMPEROR / CLAIM_EMPEROR_CURSE_RULING` | `CAMPAIGN_EVENT` | `EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION` | Preserve the in-Campaign ruling as Campaign history/event. |
| `NPC_GREMLIN / CLAIM_GREMLIN_HISTORY_3` | `CAMPAIGN_EVENT` | source occurrence is covered by `EVENT_P3_002_SANCTUARY_ENTRY` | Preserve death/burial history as Campaign history/event. |

These cases are regression anchors, not templates applied mechanically to other claims.

## 7. Machine-readable decision surface

R1A-1 creates two related files:

- `work/remediation/r1a1/semantic_adjudication_decisions.jsonl`: the compact hand-adjudicated decision source, one record per exposed semantic identity;
- `work/remediation/r1a1/semantic_adjudication_ledger.jsonl`: the deterministic enriched projection that R1A-2 must consume.

Each enriched record contains the required profile/claim identity, legacy section and cohort, current disposition and generated targets, source refs, R2A event refs, story-order anchors and canon layer, audit category, exact R2C destination sections, evidence basis, split flag, and human-review flag. Ordering is deterministic by profile, cohort, legacy source section, and claim ID.

The helper `scripts/audit_r1a1_semantic_routes.py` reconstructs exposure from existing packages, rejects missing or extra decisions, validates every R2A event ref, attaches reviewed temporal anchors, projects compact routes onto actual R2C field names, and supports byte-exact `--check`. It does not write any R2C artifact. Per AGENTS.md, all 145 records remain `human_semantic_review_required=true`; the completed audit is sufficient for implementation but is not formal Canon approval.

## 8. R1A-2 repair architecture

R1A-2 must use this single explicit chain:

```text
legacy record semantic identity
    -> exact reviewed R1A-1 ledger record
    -> one or more existing R2C semantic destinations
    -> source-linked migration disposition
```

It must remove this chain for the audited population:

```text
legacy section name
    -> convert_background_claim()
    -> unconditional BIOGRAPHICAL_BACKGROUND / MOVED_TO_BACKGROUND
```

The smallest safe architecture is a ledger loader and semantic router inside the package preparation layer:

1. load the deterministic enriched ledger;
2. require exact 145-record coverage against live exposure and reject missing, extra, duplicate, unresolved, or unknown routes;
3. use route-specific constructors for biography, timeline, identity, persona, relationship baseline/milestone, ability/status, and knowledge;
4. reuse existing R2A timeline items by `event_ref` instead of creating duplicate event identities;
5. create every required distinct destination for `split_required` records and preserve source/event links;
6. derive `migration_status`, `destination_ids`, reason, and supporting refs from realized destinations, including ledger lineage;
7. leave the 16 existing non-background high-risk identity reroutes outside this audit intact, while preventing duplicate targets;
8. validate semantic identity, not shared source refs: a claim cannot receive incompatible background/event semantics unless the reviewed record explicitly authorizes a split with distinct representations.

The relationship cohort must use a relationship-specific route. Campaign milestones get event refs and actual-event semantics; durable relationship facts populate the baseline/state representation; mixed records create linked, distinct targets; background is emitted only when the ledger expressly includes `biographical_background`.

No schema revision is required for this repair. If implementation discovers a record that cannot be realized without information loss, that is a schema defect and R1A-2 must stop before regeneration rather than improvise a new field or Canon decision.

## 9. Frozen boundaries and provenance

R1A-1 changed only remediation documentation, its read-only audit helper/test, and the new remediation ledger directory. It did not modify original sources, Phase 3C, Phase 3D/3D-R profiles, R2A chronology/reviewed inputs, R2B indexes, R2C packages/candidates/reviews/migration outputs, schemas, manifests, Canon, Worldbook, or Current State.

R1A-1-created files:

- `docs/remediation/R1A_1_SEMANTIC_CONTRACT_AND_AUDIT.md`
- `docs/remediation/R1A_2_IMPLEMENTATION_PLAN.md`
- `docs/remediation/R1A_2_REGRESSION_PLAN.md`
- `work/remediation/r1a1/semantic_adjudication_decisions.jsonl`
- `work/remediation/r1a1/semantic_adjudication_ledger.jsonl`
- `scripts/audit_r1a1_semantic_routes.py`
- `tests/test_r1a1_semantic_audit.py`

The full implementation sequence is in `docs/remediation/R1A_2_IMPLEMENTATION_PLAN.md`; exact regression assertions are in `docs/remediation/R1A_2_REGRESSION_PLAN.md`.

## 10. Verification record

The final command results are recorded here after the complete R1A-1 verification run. No expected production result is changed to obtain a pass.

| Check | Result |
|---|---|
| R1A-1 audit unit tests | PASS — 9/9 |
| `python -m unittest tests.test_phase3d_r2c` | PASS — 57/57 |
| `python -m unittest discover -s tests` | PASS — 265/265 |
| `python scripts/prepare_phase3d_r2c_packages.py --check` | PASS — 37 provisional packages matched; no write |
| `python scripts/build_phase3d_r2c.py --check` | PASS — `R2C_CANDIDATES_MATCH`, 37 candidates; no write |
| frozen manifest verification | PASS — all 488 listed inputs matched |
| ledger generation twice / byte equality / `--check` | PASS — both builds SHA-256 `4DB290BBB287A28576B8E84BF8E399EB6DB3A37D1ACB6935DA56CEE1AD76A8B7`; check mode matched |
| Python syntax compilation | PASS — helper and test compiled |
| Git diff/status inspection | PASS — final inventory recorded below; no tracked production/frozen artifact changed |

The frozen verifier completed successfully. An initial reporting one-liner then attempted to print a nonexistent optional `label` key and raised `KeyError` after verification; rerunning the same verifier while printing only the actual file count produced `FROZEN_MANIFEST_OK 488`. This was a display-command error and caused no file mutation.

Git status uses three directory-level untracked entries because the repository already contained untracked R2C output directories and the earlier accepted R1A-0 report. The pre-R1A-1 untracked baseline was:

```text
?? docs/remediation/
?? work/phase3d_r2c/candidates/
?? work/phase3d_r2c/migration_packages/
```

R1A-1 created only the files listed in section 9 under the already-untracked remediation tree plus the new helper and test. The two R2C output directories pre-existed this task and remained byte-matched by both builders' check modes.

## 11. Stop status

There are zero `UNRESOLVED` records and no new Canon decision point or schema conflict. R1A-1 is complete and the repository is `READY_FOR_R1A_2`; R1A-2 production repair has not begun.
