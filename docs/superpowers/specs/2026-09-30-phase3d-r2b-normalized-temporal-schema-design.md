# Phase 3D-R2B — Normalized Event Store and Character Temporal Index Design

## 1. Purpose and stop boundary

Phase 3D-R2B turns the reviewed R2A chronology into a versioned, machine-validated temporal data layer. It does not reconstruct chronology, reinterpret campaign evidence, approve character patches, create formal NPC/PC databases, perform runtime projection, or enter Phase 4.

R2B stops after producing:

- a strict event schema shaped around the actual R2A records;
- a normalized event store that is a deterministic 1:1 derivative of the authoritative R2A chronology;
- an explicit Canon-layer crosswalk that preserves both the R2A source value and the corresponding profile-layer value;
- 36 mechanically derived character temporal indexes;
- lossless, deterministic, frozen-input and boundary reports.

The success state is:

```text
R2B_NORMALIZED_TEMPORAL_SCHEMA_READY_FOR_REVIEW
```

If any R2A event cannot validate and semantically round-trip without information loss, the status is:

```text
R2B_SCHEMA_DEFECT_BEFORE_MIGRATION
```

No normalized store or temporal indexes may be emitted in that failure state.

## 2. Authoritative inputs

The following reviewed R2A artifacts are read-only authorities for temporal design:

- `work/phase3d_r2/chronology/campaign_chronology.jsonl`
- `work/phase3d_r2/chronology/campaign_chronology.md`
- `work/phase3d_r2/reports/chronology_coverage_metrics.json`
- `work/phase3d_r2/reports/early_arc_character_retention.md`
- every file under `work/phase3d_r2/character_discoveries/`
- every file under `work/phase3d_r2/event_audits/`
- `work/phase3d_r2/reports/r2a_review.md`

R2B records their SHA-256 hashes in a frozen reviewed-input manifest. The builder verifies that manifest before any derived output is written. R2B never edits these files and never returns to original campaign posts to create a parallel chronology.

## 3. Architecture

R2B uses two normalized layers.

### 3.1 Derived normalized event store

`work/phase3d_r2b/normalized/campaign_events.jsonl` contains exactly one record for each record in the authoritative R2A chronology, in the same line order. Each output JSON object is semantically equal to its input object. The builder performs deterministic serialization, so repeated builds are also byte-identical.

The store is not an independent human-maintained source. Its derivation manifest identifies the sole authority, source hash, output hash, schema version and record count. Every build regenerates it from R2A; `--check` compares the existing derived files against a fresh in-memory derivation without rewriting them.

No R2B code may accept the normalized store as authoring input.

### 3.2 Character temporal indexes

R2B creates one index for each of the 36 existing reviewed character profiles. An index is a lookup aid, not migrated character Canon. It may contain only mechanically copied or derived linkage data:

- `profile_id` and the selected reviewed candidate path;
- stable `event_id`;
- exact `story_order_start` and nullable `story_order_end` copied from the event;
- exact source event Canon-layer value and exact `story_axis.temporal_scope` value;
- profile Canon-layer mapping from the explicit crosswalk;
- explicit participant roles attached to that exact `character_ref`;
- explicit revelation IDs whose `character_ref` equals the profile ID;
- link basis: `participant_ref`, `revelation_subject`, or both.

R2B must not populate background, established-history, relationship, knowledge, ability/status, current-state, personality, motivation, or other semantic profile fields. R2B must not infer a character link from prose, aliases, labels, consequences, routing labels, or name similarity. Those operations belong to R2C.

All 36 indexes are emitted both as individual JSON files and as a deterministic aggregate JSONL file. Profiles with no explicit R2A `character_ref` receive a valid empty index rather than an inferred link.

## 4. Event schema

`schema/r2b_campaign_event.schema.json` is a closed JSON Schema Draft 2020-12 contract. It represents the actual R2A event shape without flattening or renaming:

- stable `event_id`;
- `campaign_part`, `source_campaign_part`, and `arc`;
- `story_axis` with `story_order_start`, nullable `story_order_end`, `order_certainty`, and `temporal_scope`;
- `source_axis` entries with document, post, reference, chunk ID and source order;
- nullable `source_span`;
- location label and certainty;
- participants identified either by `character_ref` or unresolved `character_label`, including the one existing optional `participant_kind` form;
- event summary, results and all five consequence arrays;
- independent embedded character revelations, including the existing optional `source_campaign_part` and either `character_ref` or `character_label`;
- routing records with optional `source_routing_label`;
- continuity classifications and unresolved questions;
- optional ordered `sequence`.

The schema preserves current R2A enums and optionality. It does not require absent fields or discard optional ones.

## 5. Canon-layer crosswalk

R2A event layers and profile layers are separate namespaces. The crosswalk is explicit and lossless:

| R2A event `canon_layer` | R2A `story_axis.temporal_scope` | Profile mapping |
| --- | --- | --- |
| `original_campaign` | `original_campaign` | `original_campaign` |
| `original_campaign_special_interlude` | `special_interlude` | `special_interlude` |
| `transition_canon` | `transition_canon` | `transition` |

Event records retain both R2A source values unchanged. Temporal links store `source_canon_layer`, `source_story_temporal_scope`, and `profile_canon_layer`; none replaces either source value.

This crosswalk is temporal plumbing, not a Canon claim. It does not promote Special Interlude material into ordinary main-world Canon.

## 6. Identity boundary

Only exact existing `character_ref` values create profile links. `character_label` remains unresolved unless a separately approved identity mapping already exists.

In particular, the R2A discovery for 杨 is an authoritative reviewed discovery input but its draft patch remains unapproved. R2B preserves the label occurrence and discovery provenance in an unresolved-label report; it does not invent `NPC_YANG`, a Worldbook mapping, aliases, triggers, or a formal profile.

The same rule applies to Part 1 retention candidates and approximate-name leads.

## 7. Losslessness and determinism

### 7.1 Semantic round-trip equality

Before migration, every input event must validate against the R2B event schema. The builder then serializes and reparses the proposed normalized record and compares the complete JSON values recursively. Equality includes every key, null, array order, string, number and nested object.

The migration proceeds only when:

```text
parsed R2A record == reparsed normalized record
```

This is semantic equality, not textual equality; harmless whitespace and object-key serialization order do not affect the gate.

### 7.2 Deterministic byte equality

The builder uses UTF-8, LF newlines, stable key ordering and fixed JSON separators. Two complete builds must produce the same file set and identical SHA-256 values for every generated R2B artifact. This test is separate from semantic round-trip equality.

### 7.3 Stable identity and ordering

All 66 R2A event IDs and their input line order remain unchanged. All 66 `story_order_start` values and every nullable `story_order_end` remain unchanged. All 38 revelation IDs and their event ownership remain unchanged.

## 8. Builder transaction and failure behavior

The builder performs work in this order:

1. Verify the frozen authoritative-input manifest.
2. Parse the authoritative R2A JSONL.
3. Validate all events against the proposed schema in memory.
4. Perform semantic round-trip comparison in memory.
5. Validate the crosswalk against all source layer values.
6. Build 36 mechanical indexes from exact references.
7. Validate every generated record.
8. Atomically replace generated outputs only after all gates pass.

Schema validation or round-trip failure writes only a blocker report and exits non-zero. It must not leave a partial normalized store or partial index set.

Validators report; they do not rewrite authoritative inputs.

## 9. Outputs

R2B creates:

```text
schema/
    r2b_campaign_event.schema.json
    r2b_character_temporal_index.schema.json
    r2b_canon_layer_crosswalk.schema.json

work/phase3d_r2b/
    reviewed_inputs/
        authoritative_input_manifest.json
        canon_layer_crosswalk.json
    normalized/
        campaign_events.jsonl
        derivation_manifest.json
    indexes/
        character_temporal_indexes.jsonl
        by_profile/<PROFILE_ID>.json
    reports/
        schema_compatibility_report.md
        lossless_migration_report.json
        unresolved_character_labels.md
        r2b_review.md
```

The human-facing Markdown is primarily Simplified Chinese. IDs, keys, enums, paths and API terms remain in English where required.

## 10. Validation gates

R2B passes only when all of the following hold:

- all frozen R2A authoritative inputs match the reviewed manifest;
- all 66 R2A events validate against the new event schema;
- normalized records are semantically equal 1:1 to R2A records;
- event IDs, line order, story order and 38 revelation IDs are unchanged;
- the normalized store is derived only from R2A chronology;
- Canon-layer source values and profile mappings coexist explicitly;
- exactly 36 indexes exist and validate;
- every index link comes only from an exact participant or revelation `character_ref`;
- no `character_label` is promoted to a profile ID;
- no R2C semantic migration fields appear in any index;
- Special Interlude and Transition boundaries remain intact;
- PC permissions and all existing profile data remain untouched;
- two builds have zero byte differences;
- the full regression suite passes;
- no formal NPC/PC database, runtime artifact, Character Card, GM Card, Worldbook change, Current State change, patch approval or Phase 4 output is created.

## 11. Review and future phase boundary

R2B outputs remain provisional and reviewable. R2C may later use the event store and indexes to propose character background, timeline, relationship, knowledge, ability/status and current-state migrations. That later phase must make semantic decisions explicitly and cannot treat the mechanical R2B links as permission to promote every event consequence into every linked profile.

