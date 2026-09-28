# Phase 2.7 Review

## Outcome

Phase 2.7 established the Extensible Authoring & Canon Update Framework without modifying the canonical Worldbook, `current_state.md`, frozen Phase 1/2 review artifacts, Phase 2.5 audit outputs, Phase 2.6 formal outputs, original sources, or `schema/worldbook_entry.schema.json`.

The framework is source-first and review-gated:

```text
Authoring source → review → Canon Patch → human approval → canonical target → derived runtime
```

No patch application command was created.

## Created files

### Protocol and routing documentation

- `docs/canon_update_protocol.md`
- `docs/content_routing_guide.md`
- `docs/patch_impact_checklist.md`

### JSON Schemas

- `schema/authorial_supplement.schema.json`
- `schema/canon_patch.schema.json`
- `schema/continuation_event.schema.json`
- `schema/director_item.schema.json`

### Machine-readable routing

- `config/content_routing_rules.json`

### JSON examples

- `templates/authorial_supplement.example.json`
- `templates/canon_patch.example.json`
- `templates/continuation_event.example.json`
- `templates/director_item.example.json`

### Human-fillable templates

- `templates/world_supplement.md`
- `templates/character_supplement.md`
- `templates/rule_supplement.md`
- `templates/continuation_session.md`
- `templates/director_seed.md`

### Validation and tests

- `scripts/validate_authoring_framework.py`
- `tests/test_validate_authoring_framework.py`

### Phase records

- `work/phase2_7_schema_extension_notes.md`
- `work/phase2_7_review.md`

## Created directories

- `sources/supplements/world/`
- `sources/supplements/characters/`
- `sources/supplements/factions/`
- `sources/supplements/locations/`
- `sources/supplements/concepts/`
- `sources/supplements/rules/`
- `sources/continuation/`
- `sources/director/plot_seeds/`
- `sources/director/faction_agendas/`
- `sources/director/mysteries/`
- `sources/director/possible_developments/`
- `work/patches/pending/`
- `work/patches/approved/`
- `work/patches/applied/`
- `work/patches/rejected/`
- `templates/`

Existing `docs/`, `schema/`, `config/`, `scripts/`, `tests/`, and `work/` directories were preserved.

## Validation results

- Four schema files parse as valid JSON and declare closed Draft 2020-12 object contracts.
- Four shipped JSON examples validate together: `Validated 4 document(s): 0 error(s)`.
- Phase 2.7 unit tests: 28 passed.
- Pre-existing project unit tests: 12 passed.
- Full suite: 40 tests passed.

The new tests cover:

1. valid world supplement;
2. valid character supplement;
3. valid Director Item;
4. valid confirmed Continuation Event;
5. duplicate-ID rejection;
6. invalid status rejection;
7. direct Director-to-Canon patch source rejection;
8. pending Continuation Event source rejection;
9. unknown supersedes reference rejection;
10. valid supersede chain acceptance;
11. supersede cycle rejection;
12. destructive delete rejection;
13. valid secret metadata acceptance;
14. missing secret knowledge metadata rejection;
15. contradictory visibility lists rejection;
16. applied patch without approval rejection;
17. confirmed continuation-to-review-patch acceptance;
18. shipped example validation;
19. routing rule coverage and recommend-only enforcement;
20. required directory structure;
21. Director file-reference isolation;
22. pending Continuation file-reference isolation;
23. JSONL continuation line-reference isolation;
24. malformed supersedes input does not crash validation;
25. malformed visibility input does not crash validation;
26. approved patch approval requirement;
27. approved patch with valid human approval;
28. rejected successor cannot complete a supersede chain;
29. Rules and Current State routing assertions.

## Routing cases tested

- objective world fact → `worldbook`
- character personality → `npc_profiles`
- rule mechanism → `rules`
- present state → `current_state`
- occurred continuation → `continuation`
- possible future → `director`
- router mode is `recommend_only`
- router cannot apply mutation

## Protection checks

- Duplicate IDs are rejected across jointly validated files.
- Destructive `delete` is not a valid patch operation.
- Director Item IDs cannot directly source a Canon Patch.
- Pending or rejected Continuation Events cannot source a Canon Patch.
- Approved and applied patches require explicit approval metadata; applied patches also require application metadata.
- Unknown, self-referential, non-reciprocal, and cyclic supersede relationships are rejected where applicable.
- Restricted/secret facts require knowledge metadata; `known_by` and `unknown_to` cannot contradict one another.
- Validator is read-only and contains no Canon apply function.

## Scope confirmations

- No canonical file was modified.
- No Campaign fact was added.
- No future plot was generated.
- No Director hypothesis was promoted to Canon.
- No NPC Profile or Rules database was created.
- No Current State rebuild was performed.
- No Worldbook schema migration was performed.
- No SillyTavern or Character Card output was generated.

## Known Limitations

- NPC Profile schema has not been established.
- Rules database has not been formally established.
- Current State automatic derivation has not been implemented.
- Canon Patch automatic apply has not been implemented.
- Worldbook `canon_origin` migration has not been executed.
- SillyTavern runtime export has not been implemented.
- Automatic ID allocation and concurrent ID locking have not been implemented.
- The validator implements the Draft 2020-12 keyword subset used by the four local schemas; it does not replace a general-purpose JSON Schema library or perform full remote meta-schema resolution.
- The optional human-readable patch preview tool is documented as an interface but not implemented.

## Review status

Framework outputs are ready for human review. Phase 2.7 stops here and does not enter Phase 3.
