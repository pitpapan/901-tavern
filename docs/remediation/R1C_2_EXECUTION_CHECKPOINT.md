# R1C-2 execution checkpoint and shard migration

Status: **CHECKPOINTED**. The current semantic-review run is stopped; no new source document or stage was reviewed during migration. Existing reviewed material remains valid provisional evidence and is marked **PRE_SHARD_REVIEW / PROVISIONAL_PENDING_SHARD_REVALIDATION**.

- Source population: 58 documents, 2,848 posts; hash `6f8fa08645753842f0f8afc344b8dc0c3a1e88d80a308965fd478f643e47f406`, unchanged from R1C-1.
- Saved Pass A: 2 completed source documents (P1 page 1 and P2 page 14), 100 primary posts, 261 proposed facts, 271 dispositions, 383 mentions.
- Pass B: 0 posts. Adjudicated: 0 posts. Frozen shards: 0.
- Recorded unresolved semantic items: 1; contract gaps in saved reviews: 0. The remaining corpus has not been semantically evaluated.
- P2 page 1: 25 already-read posts remain unsaved after the previously reported automatic-review rejections. No retry or reconstruction was performed. Their exact metadata is preserved separately; they do not count as persisted reviews.
- P2 page 13 was used only for neighboring context, without primary ownership.
- Current unit: none; all reviewers are stopped.

`work/rebuild/r1c_vnext/full_source_review/execution_checkpoint.json` records all touched/completed documents, original hashes, review counts, source-order references, outputs and context identities. `shard_manifest.json` registers all 58 documents. Each shard contains explicit stage-status files and the required stage outputs; empty pending-stage files mean NOT_STARTED.

The two completed Pass A documents are copied mechanically from existing immutable checkpoints, including the P1 unresolved supplement and P2 mention supplement. Original files are preserved byte-for-byte. Neither document was redone or promoted to authority. Both require fresh shard-level source-first Pass B, adjudication and verification before FROZEN. The third pre-shard document is registered as UNSAVED_PARTIAL; it is not treated as a completed source review.

`docs/remediation/R1C_2_REVIEW_CONTRACT_MIN.md` is the compact operational contract. A future explicitly resumed unit must reconstruct its context from this contract, one shard's raw source, necessary neighboring context, its compact entity snapshot and its own prior-stage evidence. One source document × one stage uses one fresh semantic context; the next document cannot share that review context.

Production remains 140 files at fingerprint `cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`, and frozen inputs remain 488/488. No chronology, profiles, R1C-3, production migration or Phase 4 was generated. This checkpoint/migration status is not R1C-2 PASS.
