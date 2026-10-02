# R1C-2 review checkpoint protocol

Authority: `docs/remediation/R1C_2_FULL_SOURCE_REVIEW_SPEC.md` and root `AGENTS.md`.
This is a storage/coordination protocol, not a replacement semantic contract.
Production and every accepted R1C-1 artifact remain frozen.

Review raw `body` text, never `body_compact`, previews, old event summaries or profiles. The old source ledger supplies only path, post/chunk ID, part, page and order. Read complete primary text without truncation. Expand context across page boundaries when needed, and record all context IDs actually used. Keep later evidence at its own source time.

Checkpoints live in `checkpoints/pass_a/P1_P001.json` (analogous part/page names), then `checkpoints/pass_b_inventory/P1_P001.json`, then `checkpoints/pass_b/P1_P001.json`. Never overwrite a saved review checkpoint. Corrections go in a separate revision file. Root assembles required JSONL after reviews; no existing authority is overwritten.

Pass A document checkpoint object:

```
stage: PASS_A
reviewer: agent task name
document: raw source path
reviews: [primary post review records]
facts: [full accepted AtomicFact objects]
dispositions: [semantic-unit SourceDisposition objects]
mentions: [source-backed entity mention objects]
unresolved_items: [genuine disputed semantic items]
contract_gaps: [genuine unrepresentable semantic items]
```

Each review record has `source_path`, `post_id`, `source_chunk_id`, `source_order`, `primary_review: true`, `context_before`, `context_after` (lists of chunk IDs), `source_inventory` (authored list of all relevant semantic units), `unit_refs`, `fact_refs`, `reviewer`. Context includes only posts read; do not count context as primary reviewed.

Each disposition has unique `unit_id`, primary `source_chunk_id`, `source_locators`, `disposition` (KEEP/MERGE/DUPLICATE/NON_CONTINUITY/ISOLATED_WORLD/UNRESOLVED), `reason`, `fact_refs`. KEEP and ISOLATED_WORLD units need facts. Numerical rules/OOC can be NON_CONTINUITY with specific reasons. Isolated narrative still needs facts. Do not use one broad summary to hide distinct modality/speaker/consequences. Quote spans must be exact Python character slices in `body`.

AtomicFact uses accepted R1C-1 fields, with applicable independent roles/time/validity/links. IDs: `R1C2_<chunk_id>_F001`, etc. Do not infer speaker from forum author. Use source-supported speaker attribution; otherwise preserve unresolved attribution. Actual narrated actions use `NARRATIVE_CONFIRMATION` (accepted pilot vocabulary). Questions remain QUESTION, speculative content remains INFERENCE/THEORY/HEARSAY, plans stay PLAN. Story time can be `{source_order: ..., description: ...}`; no fabricated calendar dates. State persistence must not be assumed. One fact can cite multiple posts.

Entity references: use known canonical IDs only for unambiguous source-backed mappings. Every other entity uses a local `UNRESOLVED_ENTITY:<chunk_id>:<name>` reference, supported by a mention. Each mention has `mention_id`, `entity_ref`, `display_name`, `canonical_entity_ref` (null if unknown), `resolution_status` (UNRESOLVED_ENTITY if unknown), `aliases`/`titles` only if supported, `source_refs` (full locators), `first_observed_source`, `mention_role`. Distinct appearances may remain distinct local references pending later identity adjudication. Do not merge same titles or alternate forms.

Locator: `source_path`, `post_id`, `source_chunk_id`, `span_start`, `span_end`, `quote`, `post_sha256`, `file_sha256`. Post hash is SHA256 of UTF-8 `json.dumps(post, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n'`. File hash is raw file bytes. Preserve quote text and exact spans.

Pass B: read raw source/context first. Save an inventory checkpoint (stage PASS_B_SOURCE_INVENTORY, reviewer, document, reviews with per-post independently authored source_inventory and context IDs) BEFORE opening any Pass A checkpoint for that document. Then inspect A. Save PASS_B checkpoint with `reviews` (each primary chunk ID, reviewed unit/fact refs and check results), `findings` (finding_id, source_chunk_id, kind, description, source_locators, affected_fact_refs, proposed_correction, status), and `added_facts`/`revised_facts`/`added_dispositions`/`added_mentions` where source supports corrections. Root adjudicates every disagreement. A zero-findings record requires an explicit per-post comparison, not an automatic empty array.

Check every primary for omitted themes/characters, attribution, subject, modality, polarity, scope, validity, identity. Record epistemic boundaries and later resolutions separately. No claim of blind review. Different agents review each other's documents with fresh source-first inventories.

Checkpoints report primary posts total, Pass A reviewed, Pass B reviewed, adjudicated, unresolved, contract gaps. Incomplete documents may be saved as separate partial checkpoints listing only actually reviewed posts. Never manufacture review coverage or run a heuristic as semantic review. A mechanical assembler/validator cannot approve natural-language meaning.
