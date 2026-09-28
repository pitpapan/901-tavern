# Phase 2.7 Schema Extension Notes

## Finding

The current `schema/worldbook_entry.schema.json` uses `canon_layer` to label the narrative layer of an existing canonical entry. That field cannot by itself express where a fact came from, who may know it, or which later supplement/patch changed it.

Phase 2.7 therefore keeps provenance and visibility in the authoring/patch layer and does **not** modify the Worldbook schema or migrate the 79 current entries.

## Candidate future fields

### `canon_origin`

Purpose: identify provenance independently from narrative time.

Candidate values:

- `original_source`
- `authorial_supplement`
- `transition_convention`
- `continuation_play`
- `special_interlude_source`

### `visibility`

Purpose: distinguish public facts from confirmed restricted or secret facts.

Candidate values:

- `public`
- `restricted`
- `secret`

### Knowledge metadata

Candidate fields:

- `known_by`
- `unknown_to`
- optional knowledge-source references

These fields must not be used to encode belief, suspicion, rumor, or Director hypotheses as objective facts.

### Patch provenance

A future migration may need stable references such as:

- `introduced_by_patch`
- `last_modified_by_patch`
- `source_origin_ids`

The canonical database must not rely only on mutable file paths for provenance.

## Migration proposal boundary

A future schema migration must be a separate approved phase and should include:

1. a written mapping from current entries to default origin/visibility values;
2. explicit treatment of special-interlude and transition entries;
3. backward-compatible validator changes;
4. deterministic migration output;
5. atomic replacement and rollback snapshot;
6. full entry-by-entry diff review;
7. runtime rebuild impact analysis.

No default should claim that a later authorial supplement appeared in the original Campaign. Unknown provenance must remain unknown or require human classification.

## Deferred architecture

- NPC Profile schema is not yet defined.
- Rules database schema is not yet defined.
- Current State derivation is not implemented.
- Patch apply is not implemented.
- Runtime export is not implemented.

These gaps are intentional Phase 2.7 boundaries, not permission to store the missing data in Worldbook fields.
