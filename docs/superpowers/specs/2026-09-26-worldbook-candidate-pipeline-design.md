# Canonical Worldbook Candidate Pipeline Design

## Purpose

Build a deterministic, auditable first-stage data pipeline for a long-running TRPG campaign. The pipeline discovers the existing campaign reference files, extracts a reviewable list of worldbook entry candidates, defines the future canonical entry contract, and validates later JSONL sources. It does not generate canonical entry prose or `output/worldbook_source.jsonl`.

## Source model

- `current_state.md` is the authority for the continuation time anchor and is read-only.
- Setting, character, and battle-report references may live beside the project directory. The extractor accepts an explicit campaign root and otherwise discovers the nearest ancestor containing the known source names.
- Source references use campaign-root-relative paths so identically named report files remain distinguishable.
- Raw `posts.jsonl` and `posts.md` are inventory/verification material only and are not mined for first-pass entities.

## Extraction architecture

The extractor uses Markdown structure rather than unrestricted named-entity extraction:

1. Setting entries come from level-two headings below setting, character, and terminology sections.
2. Character-card entries come only from level-two character headings below participant/NPC sections; skills and equipment subheadings are ignored.
3. Event entries come from event-like phrases in plot-directory and scene-card headings. Event-ledger rows can corroborate an event candidate but never become candidates one-for-one.
4. Two explicit transition anchors—Deathwing's defeat and destruction of the dragon sanctuary—may be recognized from `current_state.md`; no general mechanical splitting of current state is allowed.
5. The modern supernatural dream section and other headings explicitly marked as dream material are excluded from ordinary candidates and reported for future review.

Exact normalized name/type matches merge provenance. Explicit slash or parenthetical variants become aliases. Near matches are reported but not silently merged. Type conflicts remain separate candidates and are reported. Deterministic sorting precedes sequential `CAND_0001` numbering.

## Safety and review

Generated candidates always start as `pending`. If an existing candidate file contains any non-pending row, extraction refuses to overwrite it. Writes use a temporary file followed by an atomic replacement. The report exposes missing sources, coverage gaps, duplicate suspicions, conflicts, uncertain classifications, granularity concerns, and high-priority review items.

## Validation

The JSON Schema is Draft 2020-12 and closes the object shape. The standalone validator uses only the Python standard library, reports line-specific errors and cross-record warnings, never rewrites input, and exits nonzero on errors. Warnings cover long Chinese content, too many keys, over-shared keys, and uncertainty language inside confirmed entries.

## Verification

Integration tests run both command-line scripts against temporary fixtures. They cover deterministic extraction, alias merging, dream exclusion, reviewed-file overwrite protection, valid source acceptance, malformed/duplicate rejection, and required warnings. The real campaign extraction is then run twice and byte-compared for determinism.
