# Phase 2 Canonical Worldbook Design

## 1. Objective

Phase 2 converts the frozen Phase 1 candidate pool into a provenance-backed canonical source database for future TRPG use. It does not create a SillyTavern export, character cards, director prompts, plot continuation, or new lore.

The deliverables are:

- `work/phase2/batch_01.jsonl` through `batch_07.jsonl`
- one `batch_XX_review.md` beside every batch
- `work/phase2_discoveries.md`
- `output/worldbook_source.jsonl`
- `work/phase2_review.md`

Each formal entry must conform to `schema/worldbook_entry.schema.json` and be supported by sources actually read during Phase 2.

## 2. Frozen Inputs

The following files are immutable Phase 2 inputs. Their SHA-256 values establish the baseline:

| File | SHA-256 |
| --- | --- |
| `work/candidates.jsonl` | `6B3035D43D217EB1EE45D444AB28422D2B32E9F5CF4D709924E00976EF998878` |
| `work/candidate_report.md` | `F4CC15B27D3862C02EE9A61C2EB9F358D04283F45758D12B0FECC8D1444270DF` |
| `config/review_decisions.json` | `95FB03A7A2AD80D340774CDAAE4B7A0DF63D82FD78822440A93E42979627145B` |
| `config/alias_evidence.json` | `3C60943B26BB3BD7DB5C87323EB0D57629F12A5C27C40238F65D225AD2F46F49` |
| `config/manual_candidates.json` | `E23C141E03BCEAB2CB8679604CB6CC9693FF281EA7DE93E252C95C5963DCB7D0` |
| `schema/worldbook_entry.schema.json` | `C9F68B54081EC29EA03EC7559968C2B9D8428E66C67DAAC09C9F00C5DEA11579` |
| `current_state.md` | `95ADABA5591F088BF24BB465E4FD81C5D77A78A3C5A7447F3C116EB051CD5C59` |

Phase 2 must not modify these files or any original source. It must not rerun Phase 1 discovery logic or use full-text NER to enlarge the candidate pool.

## 3. Eligibility Rules

The frozen pool contains 91 candidates. Seventy are eligible for source verification:

- 53 non-event candidates with `pending` or `approved`
- 17 events with `approved`

The remaining candidates are handled as follows:

- `merged` (4): no independent entry; confirmed aliases, useful facts, and supporting sources are absorbed into the target entry.
- `rejected` (15): no entry; may be used only as navigation to source material.
- `deferred` (2: `A`, `杨`): no entry in this phase.
- `event + pending`: ineligible if encountered; no entry.

Pending non-event candidates are not automatically promoted. Each becomes either `generated` after evidence review or `HOLD` with a reason in the batch review.

## 4. Batch Partition

Each eligible candidate appears in exactly one batch.

### Batch 01 — World and factions (9)

`妄想大陆`, `兄弟会`, `八柱将`, `娜迦`, `帝国`, `游击士协会`, `纳萨力克地下大坟墓`, `魔兽`, `龙族`.

### Batch 02 — Locations (12)

`九雪医馆`, `妄想山脉`, `尸体城堡`, `帝都`, `无法地带`, `法师塔`, `皇宫`, `监狱塔`, `神秘海域`, `边境关卡`, `飘零大陆`, `龙族秘境`.

The merged `秘境` candidate contributes to `龙族秘境` and does not receive its own entry.

### Batch 03 — Concepts (9)

`假面`, `厌魔石`, `死亡秩序`, `耶各诅咒`, `腰带`, `魔兽之潮`, `魔物`, `魔物之潮`, `魔物之盒`.

`魔兽之潮`, `魔物`, `魔物之潮`, and `魔物之盒` remain separate entries if their own evidence supports stable definitions. Name similarity is never merger evidence.

### Batch 04 — Core characters (11)

`卡西乌斯·布莱特`, `帝`, `御临风`, `悠悠`, `哈克`, `安兹·乌尔·恭`, `白色魔法使`, `艾利`, `谏山黄泉`, `谢尔伦·冯·吉尔科德`, `雪老`.

Merged sources contribute `布莱特` to `卡西乌斯·布莱特` and `黄泉` to `谏山黄泉`.

### Batch 05 — Remaining characters (12)

`久远`, `任帆真`, `右近`, `周正`, `奥修特尔`, `姜子尤`, `慕少艾`, `托尔金`, `方镜`, `沃西斯`, `沐透`, `雷光`.

`任帆真`, `周正`, and `方镜` are evaluated only as `special_interlude` characters. `A` and `杨` remain deferred and are not included.

### Batch 06 — Early approved events (9)

`第一次魔兽大侵攻`, `峡谷战`, `矮人铺突围`, `边关真相`, `神秘海域，德雷克的宝藏`, `空间龙事件`, `皇宫朝见`, `耶各诅咒转移`, `魔物之盒灾变`.

### Batch 07 — Later, cutoff, and interlude events (8)

`宅邸战`, `法师塔惨案`, `边关攻防`, `龙族宴会`, `龙族撤离`, `死亡之翼之战`, `现代灵异梦境开端`, `龙族秘境毁灭`.

The merged `死亡之翼讨伐` candidate contributes to `死亡之翼之战` and does not receive its own entry.

## 5. Evidence Workflow

Every candidate follows the same evidence sequence:

1. Read the candidate only as an index: name, type, layer hint, review status, aliases, and locators.
2. Open every potentially useful source locator and read enough surrounding text to understand the claim.
3. Apply field-specific source authority:
   - setting reference for world, faction, location, and concept definitions;
   - character references for identity, background, durable equipment, and relationships;
   - plot directory, ledger, and scene cards for event navigation;
   - original `posts.md` or `posts.jsonl` for consequential event facts and quotations or self-identification;
   - `current_state.md` for continuation-time state and Transition Canon only.
4. Separate source claims into confirmed fact, uncertain claim, rumor, character belief, or chronology.
5. Decide `generated` or `HOLD` for pending non-events.
6. Retain only the source references that actually support the written entry.

Candidate `reason` text is never evidence and must not be paraphrased into `content` without source verification.

## 6. Entry Construction

### Identity and keys

- IDs are stable, semantic ASCII identifiers: `WORLD_*`, `FACTION_*`, `LOCATION_*`, `CHAR_*`, `CONCEPT_*`, or `EVENT_*`.
- IDs never use `CAND_XXXX`.
- Keys contain one to four formal names, stable short names, or confirmed aliases only.
- Generic high-frequency terms and the deferred single-letter `A` are prohibited.
- `name` is unique across the final database. `id` is unique and never reassigned within Phase 2.

### Content

- Normal target length is 100–450 Chinese characters.
- Content answers what the topic is, its stable world position, confirmed durable relationships, consequential history, and current status when relevant.
- Character entries omit roleplay instructions, speech guidance, skill lists, and speculative psychology.
- Event entries use background → occurrence → result → continuing effect, not turn-by-turn retelling.
- World entries remain high level; faction and location facts stay in their own entries.
- Literary interpretation, future hooks, author intent, and invented connective lore are forbidden.

### Canon dimensions

- `canon_status` expresses epistemic certainty.
- `canon_layer` expresses campaign layer.
- These dimensions are never substituted for one another.
- An entry marked `confirmed` contains only confirmed core claims. Unresolved claims are omitted from content or described in `notes` as unresolved, not promoted.
- `龙族秘境` remains an `original_campaign` location while its destruction is explicitly identified as a Transition Canon state change.
- `龙族秘境毁灭` is `confirmed` + `transition`.
- Special Interlude entries explicitly state that their internal reality is isolated from the ordinary main world.

### Conflicts and chronology

- Contradictory sources are not reconciled silently. The entry uses an appropriate non-confirmed `canon_status`, and `notes` records `CONFLICT:` with both sources.
- A later state change is chronology, not conflict; content records the before/after sequence and cites both stages when needed.

## 7. Batch Artifacts

Each `batch_XX.jsonl` contains only generated entries, one schema-valid object per line. Held, merged, rejected, and deferred candidates never appear in batch JSONL.

Each `batch_XX_review.md` contains:

1. candidates evaluated;
2. generated entries and formal IDs;
3. held candidates with reasons;
4. source conflicts;
5. uncertain facts or entries;
6. source files actually read;
7. entries requiring human attention;
8. validator result and warnings reviewed.

`work/phase2_discoveries.md` records important missing candidate discoveries without promoting them. Each discovery includes proposed type, source locator, why it may matter, and the statement that it was not added.

## 8. Merge and Validation Flow

After each batch:

1. Validate the batch JSONL structurally.
2. Concatenate generated entries from completed batches in batch order into a temporary file.
3. Check unique IDs and names and verify the absence of held, rejected, merged-source, and deferred candidates.
4. Atomically replace `output/worldbook_source.jsonl` only after the temporary result passes validation.
5. Run `scripts/validate_worldbook.py` against the merged output.
6. Fix every error before continuing. Inspect every warning; resolve it or record the disposition in the batch review.

Batch files are the auditable authoring artifacts; the merged output is deterministic from them. No tool may modify the frozen inputs or original sources.

## 9. Special Cases

- `卡西乌斯·布莱特` includes alias `布莱特`.
- `谏山黄泉` includes alias `黄泉`.
- `白色魔法使` includes `白魔` and `笛木奏`; the latter is supported only by the campaign self-identification and gains no outside-franchise lore.
- `悠悠`, `芬尔德·特兰希尔`, and `芬尔德·琳·特兰希尔` are retained with a note about possible stage-dependent naming.
- `神秘海域` and its treasure event remain `special_interlude`.
- The dream acquisition of `魔物之盒` is Special Interlude history; its later presence and disaster in the main-world record are Original Campaign facts.
- `死亡之翼之战` records confirmed battle facts while leaving immortality, permanent destruction, fate, balance, and Ancient God mechanisms unresolved.
- Transition Canon is limited to the minimum bridge documented in `current_state.md`; no new treaty, death, conspiracy, political settlement, or unseen major event is inferred.

## 10. Final Review

`work/phase2_review.md` reports:

- final entry count;
- counts by type, canon layer, and canon status;
- held, deferred, merged, and rejected candidates;
- source conflicts and uncertain entries;
- Special Interlude and Transition entries;
- unresolved event coverage gaps;
- Phase 2 discoveries not promoted;
- validator command and final result;
- confirmation that frozen inputs and `current_state.md` still match their baseline hashes.

Phase 2 stops when `output/worldbook_source.jsonl` and `work/phase2_review.md` are complete and validated. No downstream export or narrative artifact is created.
