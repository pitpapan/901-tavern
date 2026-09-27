# Worldbook Phase 1.1 Semantic Boundary Design

## Purpose

Tighten the candidate extractor so syntax and weak string similarity never make canon decisions. Phase 1.1 remains a provisional, human-reviewed extraction stage and must not create `output/worldbook_source.jsonl` or modify `current_state.md`.

## Canon layers

Formal entries require `canon_layer` with one of `original_campaign`, `transition`, `continuation`, or `special_interlude`. Candidate rows carry the provisional scalar `canon_layer_hint`. Ordinary historical sources default to Original Campaign; the destruction of the dragon sanctuary is Transition; the unfinished modern supernatural dream is Special Interlude. A Special Interlude candidate remains separate from ordinary main-world candidates unless a campaign source explicitly records a reward, fact, item, or consequence crossing back.

## Contract ownership

`schema/worldbook_entry.schema.json` is the sole machine-readable contract for required fields and the `type`, `canon_status`, `canon_layer`, and `importance` enums. The dependency-free validator loads those values from the schema and applies the remaining cross-record and editorial checks without restating the contract as Python constants.

## Names, aliases, and duplicates

- Slash is not a universal alias operator. Non-character compound headings split into separate provisional candidates and receive an alias-review note.
- Character aliases are accepted only from explicit character-source structures or a human-confirmed alias map. Substring and similarity relations never merge candidates.
- `aliases_hint` contains source-supported alias candidates. `alias_requires_review` records weaker or stage-sensitive relationships.
- Duplicate suspects require strong evidence: near-identical normalization, an explicit alias bridge, or the same event core. Plain containment is only a low-confidence alias review hint.
- Location suffixes are evaluated before faction tokens, so `龙族秘境` is a location despite containing `族`.

## Manual candidates

`config/manual_candidates.json` is the single configuration source for important entities not reliably exposed by Markdown H2 structure. Each entry supplies a type, canon-layer hint, precise source reference, and reason. The extractor validates and loads the configuration; the Python module does not duplicate those semantic seeds.

## Events and coverage

Every volume in an available `03_剧情分段目录` is treated as an event-candidate source. The candidate keeps the volume's core function, ending boundary, and required Event IDs in its provenance/reason where available. A ledger match sets only `ledger_match_found`; it never claims semantic verification. Missing plot-directory or ledger coverage for `901第二部分_16-25页` and `901第三部分` remains explicit in `unresolved_event_coverage`.

## Report

The report exposes coverage confidence, manually added candidates, alias review, cross-type name conflicts, unresolved event coverage, and special-interlude candidates. It makes no claim that source-content semantic conflicts were checked.

## Safety

Deterministic ordering, byte-identical reruns, atomic replacement, refusal to overwrite reviewed candidates, and precise provenance remain mandatory.

