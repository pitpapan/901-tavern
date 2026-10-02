# R1C-2 minimal source-review contract

Use with root `AGENTS.md`, the shard source manifest and the requested stage. This operational summary preserves the accepted R1C-1 contract; it does not change its schema or authorize downstream rebuilding.

## Work unit and context

One source document × one review stage is one semantic work unit. Start each shard/stage in a fresh context. Reconstruct context from this contract, that document's full raw `body`, necessary neighboring posts, a compact source-backed entity/alias snapshot, and that shard's prior-stage files when applicable. Do not load the previous conversation, all profiles, all shard facts, or old event/profile summaries. Do not process the next source document in the same semantic context.

Each primary post has exactly one ownership record: `source_path`, `post_id`, `source_chunk_id`, `source_order`, `primary_review: true`, `context_before`, `context_after`. Record the exact additional posts actually read. Context may cross pages and expand as much as meaning requires; a context post is not another primary review. Raw extraction content and resolvable structural IDs/order are trusted. Old routing, reviewed flags, chronology, associations, profiles and readable summaries are not semantic evidence.

## AtomicFact

Required: `fact_id` (unique stable identifier), `revision` (positive revision), `proposition_type` (what kind of proposition), `statement` (source-supported atomic content), `subject_refs` (entities the content describes), `reality_scope`, `narrative_modality`, `evidence_nature`, `polarity`, `source_locators` (at least one precise supporting source).

Use applicable optional fields independently: `actor_refs` (who acts), `speaker_refs` (who says it), `addressee_refs` (who is addressed), `observer_refs` (who perceives it); `story_time` (time of proposition), `utterance_time` (time of statement), `knowledge_time` (supported acquisition); `valid_from`, `valid_until`, `last_confirmed_at`, `persistence` (supported state validity); `conditions`, `quantifiers`, `uncertainty_note`; `supports`, `refutes`, `revises`, `supersedes`, `identity_links`. Omit inapplicable/unknown fields; never invent filler. A fact may cite multiple posts.

A locator contains `source_path`, `post_id`, `source_chunk_id`, `span_start`, `span_end`, `quote`, `post_sha256`, `file_sha256`. Spans are Python character offsets into full `body`, with exclusive end; quote must equal that slice. File hash uses raw bytes. Post hash uses SHA-256 of UTF-8 `json.dumps(post, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n'`.

## Semantic boundaries

- Subject, actor and speaker are separate. The forum author is not automatically the in-story speaker. Preserve unattributed speech as such; do not guess an identity.
- Reality scope concerns where a proposition belongs: e.g. `MAIN_WORLD`, `SPECIAL_INTERLUDE`, `DREAM`, `OTHER_ISOLATED_SCOPE`. Follow source-backed project vocabulary and preserve distinct isolated scenarios where needed.
- Modality concerns actuality/intention/possibility: e.g. `ACTUAL`, `REPORTED_PAST`, `PLAN`, `PREFERENCE`, `DECISION`, `POSSIBLE_FUTURE`, `PREDICTION`, `CONDITIONAL`, `COUNTERFACTUAL`, `QUESTION`, `NOT_STATED`. A question does not automatically express belief. Absence of a statement is not explicit negation.
- Evidence concerns how content is supported: e.g. accepted pilot `NARRATIVE_CONFIRMATION`, `DIRECT_STATEMENT`, `TESTIMONY`, `HEARSAY`, `INFERENCE`, `THEORY`, `DISPUTED`, `UNRESOLVED`. These examples do not introduce a new enum. Reported speech can confirm that a statement occurred while its content remains testimony/hearsay.
- Polarity preserves affirmation versus explicit negation independently from all other dimensions. Do not turn negation into unknown, or conditional/question content into affirmative fact.
- Preserve partial certainty in separate facts/boundaries. Confirmed injury, ability to heal and a healing plan do not establish completed healing. Retirement does not establish an exact later location. A demonstrated contribution does not establish every disputed role in an attack.
- Preserve story, speech and knowledge time separately. Historical states do not automatically persist into D3. A later explicit resolution may revise/refute/supersede an earlier uncertainty, citing the later source; it cannot retroactively establish earlier certainty or an earlier explicit decision.
- Possible future, prediction, preference, decision, plan and actual outcome are separate. A later outcome does not prove an earlier choice.

## Testimony, reactions and entities

For cross-character testimony preserve speaker, semantic subject, content, evidence nature and supported listeners separately. Subject-side indexing must find testimony about the subject. Do not promote hearsay to narrator-confirmed history, count repeated hearsay as independent objective confirmation, or invent listener knowledge.

For multi-character scenes inventory individual actions, reactions, stances, knowledge/relationship/status/ability changes, first appearances, goals, plans and decisions. Formal appearances retain self-identification, title/role/affiliation and explicit behavior even for secondary participants. No whole-event summary may substitute for individual consequences or enter a character projection as that person's experience.

Discover all identifiable entity mentions, beyond existing profiles. Mention records contain `mention_id`, `entity_ref`, `display_name`, `canonical_entity_ref` if safely known, source-backed aliases/titles, `source_refs`, `first_observed_source`, `mention_role`, `resolution_status`. Unknown canonical identity is null with `UNRESOLVED_ENTITY`. Do not merge identities from shared titles, names, roles, transformed forms or contextual guesses. Supported identity links require locators. Register unresolved local refs explicitly; do not create profiles.

## PC and isolated-world protection

For `PC_YU_LINFENG` record only source-written historical actions, dialogue, explicit thoughts/choices, received effects, knowledge and enacted relations. Never create private thoughts, future choices/actions, permanent feelings/commitments, consent or new play.

Dream/Special Interlude personality, relationships, abilities, goals and states remain isolated. Main-world carry-back requires explicitly sourced main-world settlement or an already-authorized rule, and evidence for the carry-back itself. No external fictional lore or inferred cosmology.

## Disposition and review stages

Every relevant semantic unit receives `KEEP`, `MERGE`, `DUPLICATE`, `NON_CONTINUITY`, `ISOLATED_WORLD` or `UNRESOLVED`, with unique `unit_id`, primary `source_chunk_id`, precise `source_locators`, concise `reason`, and applicable `fact_refs`. KEEP/merged/duplicate/isolated narrative units reference the retained facts. Pure rules or OOC may be NON_CONTINUITY only with a specific reason; it is not a dumping category. Disposition completeness is not semantic completeness.

Pass A: read full source/context, independently author unit inventory, candidate facts, dispositions and mentions. Save genuine reviewed coverage only.

Pass B: fresh context; read source/context and save an independent `pass_b_source_inventory.jsonl` before inspecting A. Then compare for omitted themes/characters, wrong subject/attribution, strengthening, modality/polarity/scope/validity errors and identity assumptions. Save explicit comparisons and `pass_b_findings.jsonl`, including honest zero-findings results. Do not claim blind review without evidence.

Adjudication is another stage/context. Account for every disagreement as `RESOLVED_WITH_SOURCE`, `UNRESOLVED` or `CONTRACT_GAP`, with source rationale. The extractor must not silently approve its own output. Genuine disputed items remain unresolved while unrelated work proceeds. A representation gap is recorded with evidence; never silently change the contract.

## Shard outputs and state

Per shard: `source_manifest.json`, `pass_a_atomic_facts.jsonl`, `pass_a_dispositions.jsonl`, `pass_b_source_inventory.jsonl`, `pass_b_findings.jsonl`, `adjudicated_facts.jsonl`, `source_dispositions.jsonl`, `entity_mentions.jsonl`, `unresolved.jsonl`, `shard_status.json`; auxiliary review/adjudication/contract-gap records may be kept separately. JSONL is UTF-8, one object per line. Source manifests and statuses are JSON. Empty pending-stage files mean NOT_STARTED, not completed zero findings.

Preserve existing pre-shard originals, register hashes and mark `PRE_SHARD_REVIEW` / `PROVISIONAL_PENDING_SHARD_REVALIDATION`. Do not immediately redo completed A. Run fresh source-first B and adjudication later. A shard becomes `FROZEN` only after source-first A/B, explicit adjudication, locator validation and full disposition coverage are independently verified; promotion is evidence-based. Never overwrite reviewed records automatically; revisions are explicit. Validators report and do not repair source data.

Do not generate replacement chronology, profiles, production, worldbook or R1C-3/Phase 4. Mechanical integrity is not semantic truth. Full-corpus regressions, fresh QA and mutation gates remain required before the complete R1C-2 authority can pass.
