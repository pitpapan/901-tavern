# R1A-2 — Exact Semantic Routing Regression Plan

This plan converts the R1A-1 decision surface into executable R1A-2 acceptance tests. Tests must use `(profile_id, old_claim_id)` semantic identity and the reviewed ledger, never source-chunk overlap as a proxy.

## 1. Ledger and exposure contract

Add `Phase3DR2CSemanticRoutingLedgerTests` in `tests/test_phase3d_r2c.py`.

### `test_reviewed_semantic_ledger_exactly_covers_live_exposure`

Assert:

- 145 unique records, 116 identity, 29 relationship, 35 union profiles;
- live exposed keys equal ledger keys exactly;
- no duplicates, omissions, extras, or `UNRESOLVED`;
- every record requires human review;
- ledger order is deterministic;
- every event ref resolves in the authoritative R2A chronology;
- every route is one of the existing R2C sections frozen in R1A-1.

### `test_package_builder_consumes_every_reviewed_route_once`

After package preparation, assert every ledger semantic identity has exactly one migration decision and its realized destination sections equal the ledger route set. Assert no migration exists for an audited identity without ledger lineage in `supporting_refs`.

## 2. Ainz source-derived regression

### `test_ainz_campaign_diplomacy_and_protection_follow_reviewed_events`

For `NPC_AINZ_OOAL_GOWN`, assert:

- `BACKGROUND_AINZ_CASSANDRA_NEGOTIATION` is absent;
- `BACKGROUND_AINZ_OOAL_GOWN_HISTORY_1` is absent;
- `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION` exists once in `timeline_items`;
- `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY` exists once in `timeline_items`;
- the two old-claim migrations do not use `MOVED_TO_BACKGROUND`;
- their destination IDs resolve to the corresponding timeline records;
- no D3 current obligation/alliance is inferred from either event;
- source refs, uncertainty, canon layer, and P3 story order remain those of R2A.

This test must fail against the pre-R1A-2 converter and pass only after the source-derived ledger route is used.

## 3. Generic same-field-family routing regression

### `test_same_legacy_history_field_dispatches_by_reviewed_semantics`

Compare two `NPC_CASSIUS_BRIGHT` claims from the same top-level legacy family:

- `CLAIM_BRIGHT_BACKGROUND` must produce `BACKGROUND_BRIGHT_BACKGROUND`, `BIOGRAPHICAL_BACKGROUND`, and no Campaign event destination;
- `CLAIM_BRIGHT_EARLY_CAMPAIGN` must not produce `BACKGROUND_BRIGHT_EARLY_CAMPAIGN`; it must resolve to the reviewed Campaign timeline including `EVENT_P1_013_SPLIT_RECONNAISSANCE_SPACE_DRAGON`.

Assert that changing only the legacy `source_section` cannot change the reviewed route, while changing the ledger route in an isolated test fixture changes dispatch or is rejected if incompatible with its required event metadata.

### `test_campaign_rulings_transfers_and_deaths_do_not_become_biography`

Assert the reviewed destinations for:

- `CLAIM_CASSANDRA_HISTORY_1` / `EVENT_P3_008_FATE_BRANCH_SELECTION`;
- `CLAIM_EMPEROR_CURSE_RULING` / `EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION`;
- `CLAIM_GREMLIN_HISTORY_3` / `EVENT_P3_002_SANCTUARY_ENTRY`.

For each, assert the old-claim-specific background ID is absent and the event ref remains an actual Campaign timeline event.

## 4. Persistent-state and split regression

### `test_persistent_identity_state_does_not_require_background`

Use `CLAIM_AINZ_NAZARICK_ROLE` and assert its reviewed identity/persona destinations are realized with source refs and attribution, while no biography or Campaign event is fabricated.

### `test_explicit_event_and_state_split_realizes_distinct_targets`

Use `CLAIM_OSHUTORU_HISTORY_2` or `CLAIM_WILLIAM_FULL_NAME`. Assert:

- the reviewed Campaign timeline event exists;
- the source-supported public identity target exists separately;
- migration status is `SPLIT`;
- both destination IDs are listed exactly once;
- neither representation is `BIOGRAPHICAL_BACKGROUND`;
- the state does not inherit unsupported current/D3 validity.

### `test_background_valid_split_keeps_background_without_losing_other_route`

Choose a ledger record classified `BACKGROUND_VALID` with `split_required=true`. Assert the background item is retained and the additional reviewed destination is also realized, proving `BACKGROUND_VALID` does not mean “discard other supported semantics.”

## 5. Relationship-path regression

### `test_relationship_campaign_event_uses_event_milestone_not_background_converter`

Use `CLAIM_CASSIUS_BRIGHT_RELATIONSHIP`. Assert:

- `BACKGROUND_REL_CASSIUS_BRIGHT_RELATIONSHIP` is absent unless expressly listed by its reviewed route;
- `MILESTONE_CASSIUS_BRIGHT_RELATIONSHIP` (or its deterministic replacement) carries the reviewed R2A event ref/story order and actual-event semantics;
- migration status/destinations resolve only to reviewed relationship/timeline sections.

### `test_relationship_persistent_state_uses_baseline_or_state_route`

Select a `PERSISTENT_STATE` relationship ledger record (for example the first deterministically sorted fixture). Assert its durable relationship representation is source-supported, does not invent `current_stance`, and does not generate an event or biography unless those routes are explicitly listed.

### `test_relationship_background_valid_case_is_not_generalized`

Use the sole relationship `BACKGROUND_VALID` record and assert its background representation remains legal. In the same test, compare a Campaign relationship record to prove the shared legacy relationship field does not control routing.

### `test_relationship_split_realizes_event_and_durable_relation_separately`

Use a relationship record with `SPLIT_EVENT_AND_STATE`. Assert distinct event milestone and durable relationship destinations, shared provenance, and no conflation into a biography milestone.

## 6. Contradictory-duplication invariant

### `test_semantic_identity_rejects_unreviewed_background_event_duplication`

Construct an isolated package realization for one ledger semantic identity whose reviewed route is only `campaign_timeline`, then add an old-claim-specific background target. The validator must fail with the exact profile/claim key and both conflicting sections.

### `test_explicit_event_plus_persistent_state_split_is_legal`

Construct an isolated reviewed split with event and persistent-state targets. The validator must pass when all destinations are distinct, listed, and source-linked.

### `test_shared_source_chunk_does_not_define_semantic_identity`

Construct two different old claim IDs with the same source ref: one reviewed background, one reviewed Campaign event. The validator must pass. This prevents reintroduction of the prohibited source-overlap invariant.

### `test_missing_or_extra_realized_destination_fails`

For a multi-route record, omit one target and then add an unreviewed target in separate subtests. Both must fail before write.

## 7. Existing behavior and boundary regressions

Retain and rerun all current high-risk semantic tests. Add explicit assertions that:

- all 16 pre-existing non-background identity overrides outside the 145-record population retain their reviewed destinations;
- Special Interlude events remain `special_interlude` and never become ordinary main-world present state;
- uncertain, rumor, and character-belief material retain attribution/status;
- all four PC autonomous-generation permissions remain false;
- no historical fact populates D3 `dynamic_state` without Current State support;
- candidates and Chinese reviews remain pure package projections and do not make semantic decisions.

## 8. Determinism, schemas, and frozen inputs

### `test_semantic_routing_rebuild_is_byte_deterministic`

Build packages and downstream artifacts twice from identical inputs and compare the complete generated file inventory and bytes. Assert no missing, extra, or differing file.

### `test_semantic_routing_preserves_frozen_inputs`

Verify all 488 frozen manifest entries before and after rebuild. Assert byte equality for R2A chronology, R2B indexes, Phase 3D-R profiles, schemas, reviewed inputs, Canon, Worldbook, and Current State.

### Required command gate

```powershell
python -m unittest tests.test_phase3d_r2c
python -m unittest discover -s tests
python scripts/prepare_phase3d_r2c_packages.py --check
python scripts/build_phase3d_r2c.py --check
python scripts/audit_r1a1_semantic_routes.py --check
```

R1A-2 cannot be reported complete until every focused regression, existing test, schema validation, frozen hash, and two-build byte comparison passes without modifying an expected result to force green.
