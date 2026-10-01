# R1A-0 — Ainz semantic failure end-to-end trace

Status: `PASS`

Scope: diagnostic trace only. This report does not repair Ainz, alter R2A/R2B/R2C data, approve a profile, update a frozen manifest, define the full R1A schema, or enter Phase 4.

## A. Confirmed symptom

The generated R2C Ainz candidate contains two late-Campaign facts under `biographical_background`:

- `BACKGROUND_AINZ_OOAL_GOWN_HISTORY_1`: Ainz's P3-010 declaration that the two dragon kings were under his protection;
- `BACKGROUND_AINZ_CASSANDRA_NEGOTIATION`: Cassandra's introduction, Ainz's request for consideration, the intervention arrangement, and the proposed meeting with the Emperor in P3-007.

Both records are assigned:

```text
relative_time = Campaign 前史或在 Campaign 中回述的既往历史
reality_status = BIOGRAPHICAL_BACKGROUND
```

That contradicts the R2C design contract, which defines `biographical_background` as pre-Campaign or non-event historical biography, and it contradicts the already-reviewed temporal layer:

- `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION` is an `original_campaign` `CAMPAIGN_EVENT` at `P3-007`;
- `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY` is an `original_campaign` `CAMPAIGN_EVENT` at `P3-010` and contains the source chunk in which Ainz makes the protection declaration.

The same Ainz candidate also contains timeline links to both events. The result is not loss of the event chronology; it is contradictory semantic placement: the old claim is projected as biography/background while the source event is separately projected as Campaign timeline.

The Chinese review faithfully exposes the contradiction rather than causing it. Section 2 labels the two claims “人物背景,” section 6 displays the P3-007/P3-010 timeline events, and section 12 reports both dispositions as `MOVED_TO_BACKGROUND`.

## B. Source-supported semantics

### B.1 Negotiation and diplomatic intervention

Primary source:

`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 4/posts.jsonl`

Relevant source records include:

- post `1072134` / `SRC_P3_P004_POST_0003_1072134`: Cassandra uses Ainz's scroll, brings Yu Linfeng before Ainz, and introduces him;
- post `1072819` / `SRC_P3_P004_POST_0007_1072819`: Ainz asks what the Empire wants and what he receives;
- posts `1072826`, `1073337`, and `1073342`: Yu offers recognition/cooperation, Ainz proposes a meeting with the Emperor, and Yu proposes preliminary talks;
- post `1073364` / `SRC_P3_P004_POST_0011_1073364`: Ainz decides to go personally and assist immediately.

Minimum excerpts:

> “那么我介入这场战争，帝国想要得到什么，我又能获得什么呢？”

> “我与……‘帝’……见上一面应该也不奇怪吧？”

Supported classification:

| Question | Finding |
|---|---|
| Pre-Campaign history | No |
| Campaign-period event | Yes — P3-007 |
| Post-event persistent state | Only the historical fact that the negotiation/intervention occurred persists; no ongoing alliance or obligation is confirmed |
| Current-state information | No character-specific present arrangement; `current_state.md` says the eventual long-term relationship remains undetermined |
| Source statement/testimony | The proposed imperial meeting is a confirmed speech act/proposal; the meeting itself is not confirmed to have occurred |
| Unknown / unresolved | The Emperor's knowledge/acceptance, whether a meeting occurred, and the later long-term relationship |

The R2A event record already expresses the correct semantics: `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION`, `story_order_start=P3-007`, with `CAMPAIGN_EVENT`, relationship-milestone, ability/status, and knowledge classifications.

### B.2 Protection declaration at the Dragon Sanctuary finale

Primary source:

`extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.jsonl`, post `1247358`, source chunk `SRC_P3_P005_POST_0025_1247358`.

Minimum excerpt:

> “两位龙王已在我安兹·乌尔·恭其名的庇护之下。”

Supported classification:

| Question | Finding |
|---|---|
| Pre-Campaign history | No |
| Campaign-period event | Yes — the declaration and immediate confrontation occur in P3-010 |
| Post-event persistent state | Not established as an indefinite policy, alliance, or current obligation |
| Current-state information | `current_state.md` confirms prior intervention/contact but says the later long-term relationship with the Empire, dragons, or White Magician is undetermined |
| Source statement/testimony | It is objectively confirmed that Ainz made the protection declaration; the declaration does not independently prove indefinite protection after the scene |
| Unknown / unresolved | Duration, later scope, and D3 obligations |

The source chunk is reviewed as `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY`. The appropriate durable fact, if retained outside the event, is “Ainz made this declaration at P3-010,” not a newly inferred current alliance or perpetual asylum obligation.

### B.3 Current-state boundary

`current_state.md:85-89` confirms only that Ainz actually intervened and made direct contact, then explicitly leaves his later long-term relations undetermined. It therefore prevents converting either Campaign event into a D3 alliance, obligation, or current policy.

## C. End-to-end trace

### C.1 Negotiation / diplomatic material

| Stage | File / ID | Representation | Classification | Correct? | Produced by |
|---|---|---|---|---|---|
| Original source | `extracted-third/... - 页 4/posts.jsonl`; posts `1072134`, `1072819`, `1072826`, `1073337`, `1073342`, `1073364` | Introduction, exchange of terms, proposed imperial meeting, decision to intervene | Campaign-period diplomatic event; proposed future meeting remains a proposal | Correct | Original Campaign posts |
| Source registration | `work/phase3d_r2/source_coverage/source_chunk_ledger.jsonl`; matching `SRC_P3_P004_*` IDs | Source chunks retain P3 source order | P3 source material | Correct but the base ledger is only inventory; reviewed disposition is in `chunk_decisions.jsonl` | `scripts/build_phase3d_r2.py` inputs/build |
| Reviewed chunk decision | `work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl`; matching source-chunk IDs | `type=EVENT`, target `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION` | Campaign event | Correct | Explicit reviewed R2A decisions |
| R2A chronology | `work/phase3d_r2/chronology/campaign_chronology.jsonl`; `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION` | `story_order_start=P3-007`, `canon_layer=original_campaign`, `continuity_classifications` includes `CAMPAIGN_EVENT` | Campaign-period actual event | Correct | `scripts/build_phase3d_r2.py` from reviewed inputs |
| Old continuity claim | `work/phase3d_recall/repaired_candidates/NPC_AINZ_OOAL_GOWN.json`; `CLAIM_AINZ_CASSANDRA_NEGOTIATION`; `identity.established_history[2]` | Claim context explicitly says “龙族秘境战期间的谈判” and excludes assuming the meeting occurred | Sourced established Campaign history; not pre-Campaign biography | Correct in the old model: `established_history` was a broad sourced-history/event bucket | `scripts/build_phase3d_recall.py:1397-1403`, especially the explicit claim at line 1402 |
| R2B temporal link | `work/phase3d_r2b/indexes/by_profile/NPC_AINZ_OOAL_GOWN.json`; `EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION` | Exact-reference mechanical event link, `story_order_start=P3-007` | Campaign event link | Correct; parallel temporal evidence, not the cause | R2B deterministic index build |
| R2C migration package | `work/phase3d_r2c/migration_packages/NPC_AINZ_OOAL_GOWN.json`; `BACKGROUND_AINZ_CASSANDRA_NEGOTIATION`; old disposition `CLAIM_AINZ_CASSANDRA_NEGOTIATION` | `relative_time=Campaign 前史...`, `reality_status=BIOGRAPHICAL_BACKGROUND`, `MOVED_TO_BACKGROUND`; package also contains P3-007 timeline link | Biographical background plus Campaign timeline | **First incorrect layer** | `scripts/prepare_phase3d_r2c_packages.py:146-160, 570-588, 700-732, 780` |
| Global migration ledger | `work/phase3d_r2c/migration/claim_migration_ledger.jsonl`; `NPC_AINZ_OOAL_GOWN` + `CLAIM_AINZ_CASSANDRA_NEGOTIATION` | Copies package disposition | Background | Incorrect, inherited | `scripts/build_phase3d_r2c.py:220-226` |
| Candidate profile | `work/phase3d_r2c/candidates/by_profile/NPC_AINZ_OOAL_GOWN.json`; `biographical_background[].background_id=BACKGROUND_AINZ_CASSANDRA_NEGOTIATION` | Direct copy of package `background_items`; P3-007 remains in `campaign_timeline` | Contradictory background + Campaign event placement | Incorrect, inherited | `scripts/build_phase3d_r2c.py:682-719`, especially lines 700 and 703 |
| Chinese review | `work/phase3d_r2c/reviews/by_character/NPC_AINZ_OOAL_GOWN.md`; sections 2, 6, and 12 | Displays the item under 人物背景, P3-007 under timeline, and `MOVED_TO_BACKGROUND` | Contradictory review presentation | Incorrect, inherited; renderer is not the origin | `scripts/build_phase3d_r2c.py:389-405, 446-459, 515-522` |

### C.2 Protection declaration

| Stage | File / ID | Representation | Classification | Correct? | Produced by |
|---|---|---|---|---|---|
| Original source | `extracted-third/... - 页 5/posts.jsonl`; post `1247358` | Ainz makes the protection declaration while confronting White Magician | Campaign-period speech act/event | Correct | Original Campaign post |
| Source registration | `work/phase3d_r2/source_coverage/source_chunk_ledger.jsonl`; `SRC_P3_P005_POST_0025_1247358` | P3 source chunk | P3 source material | Correct inventory | R2A source inventory |
| Reviewed chunk decision | `work/phase3d_r2/reviewed_inputs/chunk_decisions.jsonl`; same chunk | `type=EVENT`, target `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY` | Campaign event | Correct | Explicit reviewed R2A decision |
| R2A chronology | `work/phase3d_r2/chronology/campaign_chronology.jsonl`; `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY` | `story_order_start=P3-010`, source axis contains post `1247358` | Campaign-period actual event; theory fields stay separately attributed | Correct | `scripts/build_phase3d_r2.py` from reviewed inputs |
| Evidence packet | `work/phase3c/evidence/NPC_AINZ_OOAL_GOWN_evidence.md`; `CLAIM_AINZ_OOAL_GOWN_HISTORY_1` | Candidate target `identity.established_history`; limitation says it does not establish future behavior, motive, or allegiance | Atomic Campaign historical fact | Correct | `scripts/build_phase3c_candidates.py` |
| Old continuity claim | `work/phase3d_recall/repaired_candidates/NPC_AINZ_OOAL_GOWN.json`; `CLAIM_AINZ_OOAL_GOWN_HISTORY_1`; `identity.established_history[0]` | Same atomic fact and future-boundary wording | Sourced established Campaign history | Correct in the old model | Phase 3C/3D claim preserved through Phase 3D-R |
| R2B temporal link | `work/phase3d_r2b/indexes/by_profile/NPC_AINZ_OOAL_GOWN.json`; `EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY` | Exact-reference link at `P3-010` | Campaign event link | Correct; parallel temporal evidence | R2B deterministic index build |
| R2C migration package | `work/phase3d_r2c/migration_packages/NPC_AINZ_OOAL_GOWN.json`; `BACKGROUND_AINZ_OOAL_GOWN_HISTORY_1`; old disposition `CLAIM_AINZ_OOAL_GOWN_HISTORY_1` | Hard-coded biographical background, while P3-010 also appears in `timeline_items` | Biographical background plus Campaign timeline | **First incorrect layer** | `scripts/prepare_phase3d_r2c_packages.py:146-160, 570-588, 700-732, 780` |
| Global migration ledger | `work/phase3d_r2c/migration/claim_migration_ledger.jsonl`; `NPC_AINZ_OOAL_GOWN` + `CLAIM_AINZ_OOAL_GOWN_HISTORY_1` | Copies package disposition | Background | Incorrect, inherited | `scripts/build_phase3d_r2c.py:220-226` |
| Candidate profile | `work/phase3d_r2c/candidates/by_profile/NPC_AINZ_OOAL_GOWN.json`; `BACKGROUND_AINZ_OOAL_GOWN_HISTORY_1` | Direct package projection into `biographical_background`; P3-010 remains in `campaign_timeline` | Contradictory background + Campaign event placement | Incorrect, inherited | `scripts/build_phase3d_r2c.py:682-719` |
| Chinese review | `work/phase3d_r2c/reviews/by_character/NPC_AINZ_OOAL_GOWN.md`; sections 2, 6, and 12 | Displays the background, P3-010, and `MOVED_TO_BACKGROUND` disposition | Contradictory review presentation | Incorrect, inherited | `scripts/build_phase3d_r2c.py:389-405, 446-459, 515-522` |

## D. Earliest divergence

### D.1 `CLAIM_AINZ_CASSANDRA_NEGOTIATION`

```text
Last semantically correct layer:
work/phase3d_recall/repaired_candidates/NPC_AINZ_OOAL_GOWN.json
identity.established_history[2] / CLAIM_AINZ_CASSANDRA_NEGOTIATION
(corroborated by R2A EVENT_P3_007 and the R2B Ainz temporal index)

First semantically incorrect layer:
work/phase3d_r2c/migration_packages/NPC_AINZ_OOAL_GOWN.json
BACKGROUND_AINZ_CASSANDRA_NEGOTIATION and its MOVED_TO_BACKGROUND disposition

Transformation responsible:
scripts/prepare_phase3d_r2c_packages.py
build_existing_package() -> convert_background_claim(); generic
identity.established_history -> background_items routing, with no Ainz override

Failure class:
temporal classification error; semantic-type error; migration decision error;
legacy-data inheritance
```

### D.2 `CLAIM_AINZ_OOAL_GOWN_HISTORY_1`

```text
Last semantically correct layer:
work/phase3d_recall/repaired_candidates/NPC_AINZ_OOAL_GOWN.json
identity.established_history[0] / CLAIM_AINZ_OOAL_GOWN_HISTORY_1
(corroborated by R2A EVENT_P3_010 and the R2B Ainz temporal index)

First semantically incorrect layer:
work/phase3d_r2c/migration_packages/NPC_AINZ_OOAL_GOWN.json
BACKGROUND_AINZ_OOAL_GOWN_HISTORY_1 and its MOVED_TO_BACKGROUND disposition

Transformation responsible:
scripts/prepare_phase3d_r2c_packages.py
build_existing_package() -> convert_background_claim(); generic
identity.established_history -> background_items routing, with no Ainz override

Failure class:
temporal classification error; semantic-type error; migration decision error;
legacy-data inheritance
```

There is no evidence that source extraction, R2A chronology, R2B indexing, candidate compilation, or Markdown rendering first introduced either error.

## E. Implementation cause

The unsafe rule exists in the implementation; it is not inferred from output.

1. `load_effective_profiles()` in `scripts/prepare_phase3d_r2c_packages.py:61-69` loads the Phase 3D-R repaired profile for Ainz.
2. `build_existing_package()` at line 588 converts **every** item in `profile["identity"]["established_history"]` with `convert_background_claim()`.
3. `convert_background_claim()` at lines 146-160 unconditionally assigns:

   ```text
   relative_time = Campaign 前史或在 Campaign 中回述的既往历史
   reality_status = BIOGRAPHICAL_BACKGROUND
   related_event_refs = []
   ```

4. The old-claim disposition logic at lines 714-716 independently assigns `MOVED_TO_BACKGROUND` based only on `source_section.startswith("identity.established_history")`.
5. `apply_high_risk_overrides()` can remove selected items from background and reroute them, but its explicit cases cover Cassandra, Deathwing, White Magician, Oshira, and Youyou. There is no Ainz override.
6. `compile_candidate()` at `scripts/build_phase3d_r2c.py:682-719` does no semantic reinterpretation: it copies `package["background_items"]` to `biographical_background` and `package["timeline_items"]` to `campaign_timeline`.
7. `render_character_review()` similarly renders the package as supplied.

Therefore the implementation cause is an actual legacy-field-to-new-field mapping:

```text
legacy identity.established_history
-> convert_background_claim()
-> R2C background_items / MOVED_TO_BACKGROUND
-> candidate.biographical_background
```

It is not a “persistent fact -> background” or “pre-first-appearance -> background” heuristic. No such heuristic was found. The faulty discriminator is simply the legacy source-section name, even though the old architecture allowed `established_history` to contain sourced Campaign events.

## F. Why current validation passed

| Check | What it proves | What it does not prove |
|---|---|---|
| R2C JSON schema validation (`validate_package`, `validate_profile`) | Required keys, types, enums, ID patterns, and that a background item says `BIOGRAPHICAL_BACKGROUND` | That the underlying fact is actually biographical background |
| `test_each_old_claim_has_exactly_one_explicit_disposition` | Every old claim is present once in the decision ledger | That the chosen disposition is semantically correct |
| `test_package_items_use_only_existing_event_revelation_and_source_refs` | Timeline and knowledge references resolve | That a source-matched Campaign event is not also misclassified as background |
| `test_candidate_is_generated_only_from_its_package` | The package is the deterministic source for the candidate | That the package's semantics are correct |
| Candidate schema tests | All candidates fit the frozen schema | That content belongs in the selected semantic field |
| Review-quality tests | All 13 sections exist; event prose and migration IDs are visible | That the review is not displaying an upstream contradictory classification |
| Cross-profile propagation test | Required audit groups, including `CASSANDRA_AINZ_NEGOTIATION`, exist and contain role/consequence text | That Ainz's old negotiation claim is not also in background |
| Frozen hashes, deterministic byte equality, and check mode | Inputs were not changed and regeneration is reproducible | Semantic correctness; the same wrong decision can be reproduced perfectly |
| `test_mapped_campaign_events_are_not_duplicated_as_biographical_background` | A hard-coded set of selected claims for White Magician, Deathwing, Cassandra, and Youyou were explicitly rerouted | A general `campaign event != biographical background` invariant; Ainz is absent from the fixture |

A current test does independently express the desired distinction, but only for a hard-coded list of four profiles. There is no general validator and no source-derived Ainz regression verifying that a P3 campaign event cannot become `biographical_background`. This coverage gap allowed all existing R2C checks to pass.

## G. Minimal regression case

No test is added in R1A-0. `tests/test_phase3d_r2c.py`, class `Phase3DR2CHighRiskSemanticsTests`, is an obvious small future location, but adding the assertion now would intentionally make the existing suite fail while this task is prohibited from repairing the migration. The exact proposed fixture is:

```python
def test_ainz_campaign_diplomacy_and_protection_are_not_background(self):
    package = self.packages["NPC_AINZ_OOAL_GOWN"]
    background_ids = {item["background_id"] for item in package["background_items"]}
    timeline_refs = {item["event_ref"] for item in package["timeline_items"]}
    migrations = {item["old_claim_id"]: item for item in package["old_claim_migrations"]}

    assert "BACKGROUND_AINZ_CASSANDRA_NEGOTIATION" not in background_ids
    assert "BACKGROUND_AINZ_OOAL_GOWN_HISTORY_1" not in background_ids
    assert "EVENT_P3_007_AINZ_DIPLOMACY_AND_EVACUATION" in timeline_refs
    assert "EVENT_P3_010_WHITE_MAGE_EXIT_AND_THEORY" in timeline_refs
    assert migrations["CLAIM_AINZ_CASSANDRA_NEGOTIATION"]["migration_status"] != "MOVED_TO_BACKGROUND"
    assert migrations["CLAIM_AINZ_OOAL_GOWN_HISTORY_1"]["migration_status"] != "MOVED_TO_BACKGROUND"
```

Expectation source:

- P3 source posts and reviewed chunk decisions classify the material as actual Campaign events;
- R2A assigns stable event IDs and P3 story order;
- `current_state.md` does not confirm an ongoing alliance or obligation.

If later evidence supports a persistent state, the regression should require two linked but semantically distinct records:

```text
Campaign event/history record
+
separate persistent state/fact with an explicit event/source link
```

It must not permit moving the event itself into backstory merely because its consequences are durable.

## H. Blast radius

The primary mechanical search was intentionally non-semantic:

```text
old_claim_migrations where
source_section starts with identity.established_history
and migration_status == MOVED_TO_BACKGROUND
```

Current result:

- **116 potentially affected claim decisions**;
- across **33 profiles**;
- projected into **99 per-character artifacts** (33 migration packages, 33 candidates, 33 Chinese review documents), plus the global claim-migration ledger.

These are candidates for later semantic review, not 116 confirmed errors. Some are likely legitimate background. The mechanism cannot distinguish them.

Representative examples demonstrating the mixed population:

- `NPC_CASSIUS_BRIGHT / CLAIM_BRIGHT_BACKGROUND`: source-defined prior biography; plausibly appropriate background;
- `NPC_CASSIUS_BRIGHT / CLAIM_BRIGHT_EARLY_CAMPAIGN`: explicitly describes early-Campaign travel and combat; requires semantic review;
- `NPC_CASSANDRA / CLAIM_CASSANDRA_HISTORY_1`: the in-Campaign transfer of the anti-magic talisman; requires semantic review;
- `NPC_EMPEROR / CLAIM_EMPEROR_CURSE_RULING`: an in-Campaign imperial ruling; requires semantic review;
- `NPC_GREMLIN / CLAIM_GREMLIN_HISTORY_3`: an in-Campaign death/burial event; requires semantic review.

An adjacent path uses the same `convert_background_claim()` function for relationship `established_history`: **29 records across 23 profiles**. They are dispositioned as relationships, but their generated milestone/background representations still carry `BIOGRAPHICAL_BACKGROUND`. Combining the primary and adjacent cohorts yields **145 records across 35 profiles** exposed to the converter. This adjacent cohort is not adjudicated here and should be reviewed separately rather than assumed wrong.

The blast-radius counts were obtained from the existing 37 migration packages only. No profile was rebuilt or semantically re-reviewed to produce them.

## I. Recommended R1A contract requirement

The smallest requirements demonstrated by this failure are:

1. A legacy field name is not a semantic type. `identity.established_history` must not map to `biographical_background` without source-supported temporal classification.
2. A Campaign-period event cannot become biographical background solely because it is established history, predates first appearance, remains important, or has durable consequences.
3. If a claim maps to a reviewed R2A Campaign event, the event/history representation remains an event reference. Any separately supported durable state is represented independently and linked to that event/source.
4. A migration validator must detect the same source-bound fact or claim being assigned incompatible `ACTUAL_EVENT` and `BIOGRAPHICAL_BACKGROUND` semantics. Explicit linked event + persistent-state representations are allowed; contradictory duplication is not.
5. Human-review rendering must not be treated as the semantic decision layer. It should display and, where possible, flag upstream contradictions rather than being expected to correct them.

These are contract proposals only. They do not define the full R1A schema or prescribe the final repair mechanism.

## Verification record

No expected result was changed to obtain a pass.

| Command | Result |
|---|---|
| `python -m unittest tests.test_phase3d_r2c` | PASS — 57 tests, 0 failures |
| `python -m unittest discover -s tests` | PASS — 256 tests, 0 failures |
| `python scripts/prepare_phase3d_r2c_packages.py --check` | PASS — read-only preparation of 37 provisional packages |
| `python scripts/build_phase3d_r2c.py --check` | PASS — `R2C_CANDIDATES_MATCH`, 37 candidates |
| `python -c "from scripts.phase3d_r2c_common import verify_frozen_manifest; ..."` | PASS — `FROZEN_BEFORE_R2C_BUILD`; all 488 listed frozen inputs matched |
| `git --git-dir=... --work-tree=... diff --stat` | No tracked diff; Git emitted only existing LF/CRLF warnings |
| `git --git-dir=... --work-tree=... diff` | No tracked diff; Git emitted only existing LF/CRLF warnings |
| `git diff --no-index --stat -- NUL docs/remediation/R1A_0_AINZ_TRACE.md` | Expected exit 1 for a new file; 1 file, 330 insertions before this verification update |
| `git diff --no-index --check -- NUL docs/remediation/R1A_0_AINZ_TRACE.md` | No whitespace errors; expected exit 1 because the compared files differ |

Git's repository-ownership safety check rejects the ordinary implicit-worktree form under the current process SID, so the required `git diff --stat` and `git diff` inspections were run with explicit read-only `--git-dir` and `--work-tree` paths. Normal Git diff does not show untracked files; the supplementary no-index diff inspected the new report.

Final `git status --short` showed:

```text
?? docs/remediation/
?? work/phase3d_r2c/candidates/
?? work/phase3d_r2c/migration_packages/
```

The two R2C directories were already untracked in the pre-task baseline. The only task-created file is `docs/remediation/R1A_0_AINZ_TRACE.md`. No source archive, generated R2A/R2B/R2C artifact, schema, manifest, Worldbook, Current State, profile candidate, patch, or test file was modified.

## Stop status

```text
R1A-0 STATUS:
PASS

LAST CORRECT LAYER:
Phase 3D-R repaired Ainz profile claims (corroborated by R2A chronology and R2B temporal index)

FIRST INCORRECT LAYER:
R2C Ainz migration package: the two MOVED_TO_BACKGROUND decisions and generated background_items

ROOT CAUSE:
scripts/prepare_phase3d_r2c_packages.py unconditionally maps legacy
identity.established_history items to BIOGRAPHICAL_BACKGROUND, then assigns
MOVED_TO_BACKGROUND by source-section name; Ainz has no explicit reroute override.

POTENTIAL BLAST RADIUS:
116 top-level claim decisions across 33 profiles (99 per-character projections),
plus an adjacent 29 relationship-history records across 23 profiles using the same converter;
all require later semantic review and are not presumed wrong.

FILES CHANGED:
docs/remediation/R1A_0_AINZ_TRACE.md

TESTS RUN:
57/57 R2C tests and 256/256 full-suite tests passed;
R2C package --check, candidate --check, and all 488 frozen-input hashes passed.

NEXT DECISION REQUIRED:
Approve the minimal R1A semantic contract and decide whether the next step should add the
source-derived Ainz regression before designing the broader migration repair.
```
