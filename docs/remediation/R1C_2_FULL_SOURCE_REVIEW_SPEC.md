# R1C-2 — Full-Corpus Source-First Atomic Semantic Review

Save this specification verbatim as:

`docs/remediation/R1C_2_FULL_SOURCE_REVIEW_SPEC.md`

Then execute it.

Continue from the accepted:

- `docs/remediation/R1C_0_SEMANTIC_TRUST_AUDIT.md`
- `docs/remediation/R1C_REBUILD_PLAN.md`
- `docs/remediation/R1C_1_PILOT_REPORT.md`
- `work/rebuild/r1c_vnext/evaluation_cases.jsonl`
- `work/rebuild/r1c_vnext/sampling_manifest.json`
- the accepted R1C-1 AtomicFact / SourceDisposition contract
- all R1C-1 pilot validators and mutation tests

Accepted state:

```text
R1C-1 STATUS:
PASS

NEXT:
READY_FOR_FULL_SOURCE_REVIEW
```

This task performs the full source semantic review only.

Do not rebuild downstream production.

Do not enter Phase 4.

---

# 1. Objective

Review the complete resolvable Campaign source corpus from raw extracted posts and produce the first complete vNext semantic authority:

```text
SOURCE EXTRACTION
    ->
REVIEWED ATOMIC FACT AUTHORITY
```

The authority must be sufficient for later deterministic generation of:

- chronology;
- per-character fact views;
- relationships;
- knowledge;
- state transitions;
- entity registry;
- downstream character profiles.

R1C-2 does NOT generate the final downstream layers.

---

# 2. Trusted input boundary

Trusted as structural/source input:

- extracted source documents;
- stable post IDs;
- source order;
- source paths;
- byte/text content;
- stable source-chunk IDs where they resolve correctly.

Do NOT treat as semantic truth:

- old R2A event routing;
- old R2A reviewed flags;
- old chronology summaries;
- R2B semantic associations;
- Phase 3 profiles;
- R2C candidates;
- old human-readable profiles.

These may be consulted only after source-first review for diagnostic comparison.

---

# 3. Corpus scope

Recompute the live source population.

Expected current baseline:

```text
source posts/chunks: 2848
source documents: 58

P1: 1394
P2: 1204
P3: 250
```

Do not hard-code these counts if the live source manifest differs.

If the population differs from the accepted R1C-1 population hash, stop before review and report:

```text
BLOCKED_BY_SOURCE_POPULATION_DRIFT
```

Do not silently update the corpus.

---

# 4. Primary review ownership

Every source post must have exactly one primary review record.

Adjacent posts may be loaded as context but must not become duplicate primary review units.

For each source post record:

```text
source_path
post_id
source_chunk_id
source_order
primary_review = true
context_before
context_after
```

A fact may cite several posts where semantics span multiple messages.

Do not force one fact to one post.

---

# 5. Scene/context handling

Do not assume every semantic unit fits inside a fixed three-post window.

For each primary post:

1. read enough preceding/following context to resolve pronouns, continuing dialogue, scene identity and immediate consequences;
2. expand context deterministically when the sentence clearly depends on adjacent material;
3. record exactly which additional posts were used as context;
4. do not treat context posts as newly reviewed primary units in that record.

Cross-page continuation must be supported.

The review manifest must make context expansion auditable.

---

# 6. AtomicFact contract

Use the accepted R1C-1 contract.

At minimum preserve independently:

```text
fact_id
revision
proposition_type
statement

subject_refs
actor_refs
speaker_refs
addressee_refs
observer_refs

reality_scope
narrative_modality
evidence_nature
polarity

story_time
utterance_time
knowledge_time

valid_from
valid_until
last_confirmed_at
persistence

conditions
quantifiers
uncertainty_note

supports
refutes
revises
supersedes
identity_links

source_locators
```

Use only fields applicable to the fact.

Do not fill unknown fields with invented values.

---

# 7. Modality must remain orthogonal

Do not collapse these into one enum.

Preserve separately:

## Reality scope

Examples:

```text
MAIN_WORLD
SPECIAL_INTERLUDE
DREAM
OTHER_ISOLATED_SCOPE
```

Use actual project vocabulary.

## Narrative modality

Examples:

```text
ACTUAL
PLAN
PREFERENCE
DECISION
POSSIBLE_FUTURE
PREDICTION
CONDITIONAL
COUNTERFACTUAL
QUESTION
```

## Evidence nature

Examples:

```text
NARRATOR_CONFIRMED
DIRECT_STATEMENT
TESTIMONY
HEARSAY
INFERENCE
THEORY
DISPUTED
UNRESOLVED
```

A fact can simultaneously be:

```text
MAIN_WORLD
+
REPORTED_PAST
+
TESTIMONY
```

Do not encode these as mutually exclusive semantic categories.

---

# 8. Preserve partial certainty

Do not collapse an entire statement to UNKNOWN because one detail is unknown.

Example pattern:

```text
confirmed:
Cassandra supplied the relevant item / participated in planning.

unconfirmed:
whether she personally placed it or independently executed the whole attack.
```

Represent these as separate facts/boundaries.

Likewise distinguish:

```text
retired = confirmed
exact D3 location = unknown
```

and:

```text
injured = confirmed
can heal = confirmed
healing planned = confirmed
healing completed = unresolved unless later source confirms it
```

---

# 9. Cross-character testimony

Every speech/testimony fact must separately preserve:

```text
speaker
semantic subject
content
epistemic/evidence nature
listeners if relevant
```

Example:

```text
speaker = Oshira
subject = Deathwing
evidence = HEARSAY / TESTIMONY
```

Required consequences:

- speaker-side fact can record that Oshira gave the testimony;
- subject-side semantic indexing can find that testimony about Deathwing;
- listeners may receive knowledge only where the scene supports that;
- the content must not become narrator-confirmed ancient history automatically.

---

# 10. Hub-event review

For every multi-character/high-consequence scene, inventory per-character atomic consequences.

At minimum check for:

```text
ACTION
REACTION
STANCE
KNOWLEDGE_CHANGE
RELATIONSHIP_CHANGE
STATUS_CHANGE
ABILITY_CHANGE
FIRST_APPEARANCE
GOAL
PLAN
DECISION
```

Do not let one coarse event summary substitute for this inventory.

The Yu Linfeng assassination scene remains a permanent regression anchor.

---

# 11. First appearances

Record meaningful first appearances independently from event centrality.

When a character first formally appears, review at least:

- self-identification;
- name/title;
- role;
- affiliation;
- explicit action;
- explicit stance;
- relationships revealed.

Do not require the character to be the event's main actor.

---

# 12. Possible futures and branching

Preserve:

```text
possible future
prediction
preference
explicit decision
plan
actual outcome
```

as separate facts.

A later actual outcome must not retroactively prove an earlier explicit choice.

The fate-branch regression is mandatory.

---

# 13. State transitions and longitudinal evidence

Facts may be revised by later facts.

Use explicit links:

```text
revises
supersedes
refutes
identity_links
```

Examples:

```text
injured
-> later healed
```

```text
relationship suspected
-> later confirmed
```

```text
identity questioned
-> later confirmed/refuted
```

Do not freeze R1C-0 unresolved states forever if later source evidence resolves them.

Any promotion from unresolved to confirmed must cite the later source.

---

# 14. Special Interlude / dream isolation

Special/dream material must remain in its own reality scope.

Do not export:

- personality;
- relationships;
- abilities;
- goals;
- current state

into the main world merely because they appeared in an isolated scenario.

A main-world carry-back fact requires explicit main-world evidence or an already-authorized reward/transition rule.

Record the source for the carry-back itself.

---

# 15. PC boundary

For `PC_YU_LINFENG`:

Extract only source-written historical:

- actions;
- dialogue;
- thoughts explicitly present in source;
- choices;
- received effects;
- knowledge;
- relationships/events already enacted.

Do not create:

- new private thoughts;
- future decisions;
- future actions;
- permanent emotions;
- permanent commitments;
- inferred consent.

Source review may record what the historical source explicitly contains.

---

# 16. Entity discovery during review

R1C-2 must not restrict semantic subjects to the existing 37 profiles.

Create a corpus-wide entity mention registry.

For every identifiable character mention record where possible:

```text
mention_id
display_name
canonical_entity_ref if known
aliases/titles
source_refs
first_observed_source
mention_role
```

If an entity cannot safely map to an existing canonical ID:

```text
canonical_entity_ref = null
resolution_status = UNRESOLVED_ENTITY
```

Do not invent a canonical merge.

Do not create full profiles in R1C-2.

This registry is evidence for the later NPC census.

---

# 17. Alias and identity boundaries

Do not merge identities based only on:

- same title;
- similar name;
- same role;
- contextual guess.

Record explicit:

```text
identity_links
```

only when source support exists.

Ambiguous identity must remain unresolved.

This is especially important for titles and transformed/alternate forms.

---

# 18. SourceDisposition coverage

For every primary source post, enumerate semantically relevant units.

Every reviewed semantic unit must receive one explicit disposition:

```text
KEEP
MERGE
DUPLICATE
NON_CONTINUITY
ISOLATED_WORLD
UNRESOLVED
```

Each disposition requires a concise reason.

Do not use `NON_CONTINUITY` as a generic dumping category.

---

# 19. Two-pass full review

Perform two full source-first passes.

## Pass A — extraction

For every primary source post:

- read source + context;
- inventory continuity-relevant semantic units;
- create candidate AtomicFacts;
- create dispositions.

## Pass B — omission/strengthening review

Pass B must start from the source text.

For every primary post:

1. independently list what continuity-relevant material the source contains;
2. only then inspect Pass A output;
3. check for:
   - omitted secondary themes;
   - omitted characters;
   - speaker/subject errors;
   - attribution loss;
   - modality strengthening;
   - polarity errors;
   - reality-scope contamination;
   - state persistence inference;
   - alias/identity assumptions.

Record Pass B findings explicitly.

If tool/runtime supports isolated reviewers/subagents, use them.

If true context isolation is unavailable, label the result:

```text
sequential_source_first_review
```

Do not claim blind review.

---

# 20. Adjudication

Resolve Pass A / Pass B disagreements into an adjudicated fact authority.

Never let the extractor silently self-approve.

Every disagreement must be:

```text
RESOLVED_WITH_SOURCE
UNRESOLVED
CONTRACT_GAP
```

with rationale.

Do not force unresolved material to zero.

---

# 21. Contract gaps

If a source-supported semantic phenomenon cannot be represented without distortion:

- record `CONTRACT_GAP`;
- preserve source locators;
- do not invent a workaround;
- continue reviewing other source material.

Do not silently modify the R1C-1 contract during the full review.

At the end:

- if zero contract gaps: normal PASS;
- if contract gaps exist: `BLOCKED_BY_CONTRACT_GAPS`.

Do not build downstream authority until they are resolved.

---

# 22. Golden-regression handling

Run the 29 R1C-0/R1C-1 historical evaluation cases against the new full authority.

Do not require their old provisional status to remain unchanged when later source evidence exists.

Rules:

## Existing verified fact

Must remain represented with correct boundaries.

## Existing unresolved / unsupported

May become resolved only if additional source evidence explicitly supports the change.

Record:

```text
previous_status
new_status
new_supporting_sources
reason
```

## Human hypothesis

Must not become Canon without source support.

---

# 23. R1C-1 development and holdout preservation

Re-evaluate all R1C-1 development and holdout scenes against the full authority.

Require all previously observed issues to remain correctly handled.

Do not rewrite their first-pass history.

Preserve:

- original first-pass finding;
- corrected adjudication;
- full-corpus result.

---

# 24. Full-corpus entity and semantic indexes

After adjudication, deterministically derive read-only indexes:

```text
facts_by_subject
facts_by_speaker
facts_by_actor
facts_by_source
facts_by_reality_scope
facts_by_modality
facts_by_evidence
facts_by_story_order
entity_mentions
unresolved_items
```

These are indexes only.

They must not invent facts.

---

# 25. No chronology yet

Do NOT generate the replacement R2A chronology in R1C-2.

Do NOT group facts into final events except where event association is explicitly needed for review context.

R1C-3 will generate chronology from frozen facts.

Reason:

```text
facts must be reviewed independently
before event grouping can become downstream authority
```

---

# 26. No character profiles yet

Do NOT generate replacement Phase 3 or R2C profiles.

Do not attempt to fix the current 37.

Do not create profiles for newly discovered entities.

Only produce:

```text
AtomicFact authority
SourceDisposition authority
entity mention registry
indexes
review records
```

---

# 27. Quality review across the full corpus

In addition to 100% Pass B review, create a frozen post-adjudication QA sample from the corpus.

Sample from the completed authority without using known-error targeting.

Stratify by at least:

- P1/P2/P3;
- source position;
- long/medium/short;
- single/multi-author;
- high fact count;
- multi-subject;
- testimony;
- uncertain/modal content;
- isolated reality scope.

Do not reuse the R1C-1 holdout as the sole QA set.

The QA reviewer must inspect raw source before seeing adjudicated facts.

Record newly discovered:

```text
OMISSION
STRENGTHENING
WRONG_SUBJECT
WRONG_ATTRIBUTION
WRONG_SCOPE
WRONG_MODALITY
WRONG_POLARITY
WRONG_VALIDITY
IDENTITY_ERROR
OTHER
```

If substantive errors are found, fix the reviewed authority and draw a fresh QA sample for confirmation.

Do not repeatedly reuse the same sample as proof.

---

# 28. Mutation tests

Retain all R1C-1 mutations and add at minimum:

- remove a secondary topic from a long post;
- delete a cross-character subject index;
- merge two ambiguous identities;
- convert later confirmation into retroactive earlier certainty;
- incorrectly carry a dream relationship into main world;
- treat repeated hearsay as independent objective confirmations;
- convert explicit negation into absence/unknown;
- convert a question into belief;
- convert speaker statement into listener knowledge without evidence.

All must be detected by the appropriate validation/review mechanism.

---

# 29. Mechanical validation

Validate:

```text
all source locators resolve
all post hashes/spans match
all fact IDs unique
all referenced entity IDs resolve or are explicitly unresolved
all fact links resolve
all source dispositions resolve
all primary source posts reviewed exactly once
all required Pass B records exist
all adjudication disagreements accounted for
all indexes derive only from facts
all isolated reality scopes remain isolated
```

These checks do not prove semantic truth.

Document that limitation.

---

# 30. Required outputs

Create under:

```text
work/rebuild/r1c_vnext/full_source_review/
```

at minimum:

```text
source_review_manifest.jsonl
pass_a_atomic_facts.jsonl
pass_a_dispositions.jsonl

pass_b_source_inventory.jsonl
pass_b_findings.jsonl

adjudication_ledger.jsonl
atomic_facts.jsonl
source_dispositions.jsonl

entity_mentions.jsonl
entity_resolution_issues.jsonl

unresolved_items.jsonl
contract_gaps.jsonl

indexes/
```

Also create:

```text
docs/remediation/R1C_2_FULL_SOURCE_REVIEW_REPORT.md
```

and one canonical read-only validator:

```text
scripts/r1c_vnext/validate_r1c2.py
```

Use repository conventions if a slightly different split is demonstrably cleaner.

---

# 31. Review progress safety

This is a large semantic review.

Checkpoint work deterministically by source document / source order.

Do not use profile-based review units.

Each checkpoint must report:

```text
primary posts total
reviewed Pass A
reviewed Pass B
adjudicated
unresolved
contract gaps
```

Restarting the task must not require re-reviewing completed source units.

Process checkpoints are not semantic authority until final adjudication passes.

---

# 32. Historical production protection

Before and after R1C-2 verify:

```text
production files: 140

production fingerprint:
cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3

frozen inputs:
488/488
```

No production write is authorized.

---

# 33. Success criteria

R1C-2 may return PASS only if:

```text
live source population:
100% primary review ownership

Pass A:
100%

Pass B:
100%

adjudication:
100% of disagreements accounted for

unresolved:
explicitly recorded, not silently eliminated

contract gaps:
0

source locator failures:
0

silent source units:
0

old-R2A semantic inheritance:
0

R1C-1 historical cases:
all preserved or source-justified revised

R1C-1 development/holdout findings:
all remain correctly represented

cross-character testimony:
subject-indexed

hub-event reactions:
individually represented

possible-future boundaries:
preserved

dream/special-interlude isolation:
preserved

entity mentions:
not limited to 37 profiles

production:
unchanged

frozen inputs:
488/488

deterministic derived indexes:
PASS
```

PASS means only:

```text
READY_FOR_R1C_3_DOWNSTREAM_REBUILD
```

It does not mean:

- all characters approved;
- NPC coverage complete;
- chronology rebuilt;
- Worldbook complete;
- Phase 4 authorized.

---

# 34. Required final response format

Return exactly:

```yaml
R1C-2 STATUS:
PASS | BLOCKED | FAIL

SOURCE POPULATION:
documents: <n>
primary_posts: <n>
population_drift: <n>

PASS A:
reviewed: <n>/<total>
atomic_facts_proposed: <n>

PASS B:
reviewed: <n>/<total>
omissions_found: <n>
strengthenings_found: <n>
subject_errors_found: <n>
other_findings: <n>

ADJUDICATION:
facts_final: <n>
disagreements: <n>
resolved: <n>
unresolved: <n>
contract_gaps: <n>

EPISTEMIC/MODALITY:
testimony_facts: <n>
possible_future_facts: <n>
plan_facts: <n>
preference_facts: <n>
decision_facts: <n>

ENTITY DISCOVERY:
mentions: <n>
resolved_entities: <n>
unresolved_entities: <n>
entities_without_existing_profile: <n>

R1C REGRESSIONS:
historical_cases: <n>
preserved: <n>
source_justified_revisions: <n>
failures: <n>

FULL QA:
samples_reviewed: <n>
first_pass_substantive_findings: <n>
confirmation_sample_findings: <n>

CONTRACT:
gaps: <n>
changed_during_review: no

PRODUCTION:
UNCHANGED

FROZEN INPUTS:
<n>/488

DETERMINISM:
<summary>

NEXT:
READY_FOR_R1C_3_DOWNSTREAM_REBUILD
or
<exact blocking condition>
```

Do not begin R1C-3 in this task.
