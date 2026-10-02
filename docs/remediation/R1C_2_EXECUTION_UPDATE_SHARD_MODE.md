IMPORTANT EXECUTION UPDATE — DO NOT DISCARD CURRENT WORK.

The R1C-2 semantic design remains valid, but the execution strategy must change because a single long-lived context creates unacceptable omission and context-saturation risk.

Do NOT restart the project and do NOT delete work already completed.

## Immediate action

1. Finish ONLY the source document / review unit currently in progress.
2. Do not begin another source document after that.
3. Persist every completed result to disk.
4. Create a checkpoint describing exactly what has already been processed.
5. Stop the current semantic-review run after the checkpoint.

If the current session has already reviewed multiple source documents, preserve them all, but mark them:

`PRE_SHARD_REVIEW`

They are provisional reviewed material and must later receive the same shard-level Pass-B/adjudication checks as all other material.

## Do not claim

Do not claim that already-reviewed material is invalid merely because it was reviewed in a long session.

Do not claim it is final authority either.

Its status is:

`PROVISIONAL_PENDING_SHARD_REVALIDATION`

unless it has already independently satisfied the equivalent checks defined below.

## Required checkpoint

Create:

`work/rebuild/r1c_vnext/full_source_review/execution_checkpoint.json`

It must record at minimum:

- current source population hash;
- documents touched;
- documents completed;
- posts reviewed in Pass A;
- posts reviewed in Pass B;
- posts adjudicated;
- current source document;
- current review stage;
- produced AtomicFact files;
- produced disposition files;
- unresolved items;
- contract gaps;
- context/session identifier if available;
- whether each reviewed document was processed before or after shard mode was introduced.

Also create:

`docs/remediation/R1C_2_EXECUTION_CHECKPOINT.md`

with a concise human-readable summary.

## Migrate execution to shard mode

After checkpointing, do not continue full-corpus review in the same session.

Use:

`one source document × one review stage = one semantic work unit`

The preferred unit is one of the 58 source documents already identified in R1C-1.

For each source document create a shard directory, for example:

`work/rebuild/r1c_vnext/full_source_review/shards/<shard_id>/`

with:

- `source_manifest.json`
- `pass_a_atomic_facts.jsonl`
- `pass_a_dispositions.jsonl`
- `pass_b_source_inventory.jsonl`
- `pass_b_findings.jsonl`
- `adjudicated_facts.jsonl`
- `source_dispositions.jsonl`
- `entity_mentions.jsonl`
- `unresolved.jsonl`
- `shard_status.json`

A shard may reference neighboring posts as context, including a cross-page continuation, but only the shard's primary source posts receive primary-review ownership.

## Session/context rule

Do not process the next source document in the same semantic-review context.

Project state must live in files, not in model conversational memory.

Each new shard/stage must reconstruct its working context from:

1. the minimal R1C semantic-review contract;
2. that shard's source document;
3. required neighboring context;
4. a compact entity/alias snapshot;
5. its own prior-stage files where applicable.

Do not load the full previous R1C conversation, all 37 profiles, all prior shard facts, or all old R2A/R2C material into every review context.

## Minimal review contract

Create a compact reusable document:

`docs/remediation/R1C_2_REVIEW_CONTRACT_MIN.md`

It should contain only the operational rules required for semantic review:

- AtomicFact fields and meanings;
- subject / actor / speaker separation;
- reality scope;
- modality;
- evidence nature;
- polarity;
- temporal and persistence boundaries;
- SourceDisposition rules;
- PC_YU_LINFENG boundary;
- Special Interlude isolation;
- cross-character testimony;
- possible-future/preference/decision separation;
- prohibition on whole-event-summary character projection;
- requirement to preserve partial certainty;
- output formats.

Do not require every shard reviewer to reread the full R1C-0/R1C-1 reports.

## Pre-shard work reconciliation

For every source document already processed before this update:

- do not redo it immediately;
- register its outputs in the shard manifest;
- mark it `PRE_SHARD_REVIEW`;
- later run a fresh source-first Pass B against it;
- adjudicate differences;
- only then mark the shard `FROZEN`.

If a pre-shard document already has source-first Pass A, source-first Pass B, adjudication, source-locator validation, and complete disposition coverage equivalent to the new shard contract, it may be promoted after verification rather than manually redone.

The promotion must be evidence-based, not assumed.

## Global manifest

Create/update:

`work/rebuild/r1c_vnext/full_source_review/shard_manifest.json`

Each shard must record:

- shard_id;
- source document;
- primary post count;
- previous/next context refs;
- execution mode: `PRE_SHARD_REVIEW` or `SHARD_MODE`;
- Pass A status;
- Pass B status;
- adjudication status;
- unresolved count;
- contract-gap count;
- frozen status;
- output hashes.

## No downstream rebuild

Still do not start:

- R1C-3;
- replacement chronology;
- replacement Phase 3 profiles;
- replacement R2C;
- production migration;
- Phase 4.

## Production protection remains unchanged

Production must remain:

- 140 files;
- fingerprint `cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`;
- frozen inputs 488/488.

## Final response for this interruption

Return only the checkpoint/migration status:

```yaml
R1C-2 EXECUTION:
CHECKPOINTED

CURRENT_UNIT:
<source document>
<stage>

WORK_COMPLETED_BEFORE_SHARD_MODE:
documents: <n>
primary_posts: <n>
pass_a: <n>
pass_b: <n>
adjudicated: <n>

PRESERVED:
true

PRE_SHARD_REVALIDATION_REQUIRED:
documents: <n>

SHARD_MANIFEST:
<path>

MINIMAL_REVIEW_CONTRACT:
<path>

PRODUCTION:
UNCHANGED

NEXT:
READY_TO_RESUME_R1C_2_IN_SHARD_MODE
```

Do not continue reviewing another source document after returning this checkpoint.