# Phase 3A Review

## Result

Phase 3A establishes the Character Continuity Data Model and stops at the requested architecture/schema/validator boundary. No real NPC Profile or Player Character Continuity Profile was created. No Character Card, GM Card, SillyTavern export, future plot, Director prompt, or runtime configuration was generated.

The formal Worldbook and every protected Phase 1/2 review artifact remain byte-identical to their baselines.

## Created files

- `docs/character_profile_architecture.md`
- `docs/pc_control_boundary.md`
- `docs/profile_runtime_projection_contract.md`
- `schema/character_profile_common.schema.json`
- `schema/npc_profile.schema.json`
- `schema/pc_continuity_profile.schema.json`
- `templates/npc_profile.example.json`
- `templates/pc_continuity_profile.example.json`
- `templates/npc_profile_draft.md`
- `templates/pc_continuity_update.md`
- `scripts/validate_character_profiles.py`
- `tests/test_validate_character_profiles.py`
- `work/phase3a_field_mapping.md`
- `work/phase3a_review.md`

## Minimal Phase 2.7 extensions

Modified only the permitted framework surfaces needed to add the two profile targets:

- `schema/authorial_supplement.schema.json`
- `schema/canon_patch.schema.json`
- `config/content_routing_rules.json`
- `docs/content_routing_guide.md`
- `tests/test_validate_authoring_framework.py`

No prior Phase 2.7 semantic barrier was relaxed. `npc_profiles` and `pc_continuity` are accepted supplement/patch targets; the legacy singular `npc_profile` supplement value remains accepted for backward compatibility. The router remains `recommend_only` with `can_apply_mutation=false`. Director material and pending continuation events still cannot directly source a profile Canon patch.

`scripts/validate_authoring_framework.py` required no behavioral change because it reads the target enums from the JSON Schemas rather than duplicating them in Python.

## Data model decisions

### Shared and specialized schemas

`character_profile_common.schema.json` is a closed, offline definition library for `ProfileClaim`, `RelationshipRecord`, `KnowledgeItem`, `GoalItem`, dynamic state, presence, provenance, and fixed permission blocks. The NPC and PC root schemas are separate closed contracts and reference those shared definitions locally.

- NPC IDs use `NPC_<SEMANTIC_ID>` and `profile_kind=npc`.
- PC IDs use `PC_<SEMANTIC_ID>` and `profile_kind=pc_continuity`.
- Both map to one `CHARACTER_*` Worldbook entry.
- `CAND_*`, duplicate profile IDs, and duplicate Worldbook mappings are rejected.

### PC hard boundary

The PC schema fixes `control_mode=user_controlled`. It fixes dialogue, voluntary actions, private thoughts, and new goals to false while permitting external effects, involuntary physical reactions, summaries of user-declared actions, and references to established history. A profile patch cannot loosen these schema constants.

### Claims, knowledge, and provenance

Substantive claims require evidence mode, origin, stability, and precise sources. A single observed behavior cannot become a stable trait. Direct beliefs and suspicions may omit `fact_ref` when no objective fact record exists; their attributed statement and subject remain required, avoiding fabricated Worldbook facts.

Knowledge truth and character cognition remain separate. `knowledge_partition=true` is required for beliefs, suspicions, explicit non-knowledge, secrets, and restricted material. `knows`/`secrets` cannot coexist with `does_not_know` for the same fact.

Root `canon_origin` records the provenance source class and may include `authorial_supplement`; it is distinct from `canon_layers`. Patch provenance is checked, when supplied, for an actual approved/applied patch, explicit approval, matching profile database, and a target that includes the profile.

### Depth, activation, and presence

`profile_depth` means the RP fidelity required when active, not evidence quantity, future importance, or expected frequency. Sparse evidence remains an explicit gap. `activation_policy` is a projection ceiling and does not guarantee a scene appearance.

Life status and narrative availability are independent. Deceased characters cannot be normally available; historical-only retrieval is valid. Unknown/missing does not mean dead. Special Interlude-only profiles cannot be normally available in the main world.

The Phase 2.5 erratum remains binding: no unsupported “普伦达” identity was reintroduced. Phase 3A creates no profile for 贞子 or any other campaign character.

## Examples and dry-run mapping

The two JSON examples use explicit placeholder IDs and `SOURCE_REF_REQUIRED`; they are neutral schema demonstrations, not campaign profiles. The two Markdown templates are review worksheets and cannot become Canon by being filled out.

`work/phase3a_field_mapping.md` performs only a field-needs audit for:

- 悠悠 — NPC, full / full_when_active
- 白色魔法使 — NPC, full / full_when_active
- 帝 — NPC, full / full_when_active
- 托尔金 — NPC, minimal / worldbook_until_promoted
- 御临风 — PC continuity; full fidelity does not grant NPC authority

The mapping preserves known review boundaries—stage-bearing names, attributed goals, epistemic partitions, single-character names, minimal-profile non-demotion, and PC control—but contains no profile claims.

## Validator coverage

`scripts/validate_character_profiles.py` resolves local `$ref` values offline and performs schema plus cross-record checks. It is read-only and reports rather than repairs.

Covered failures include:

- malformed data without traceback/early abort;
- invalid ID/profile-kind mixing;
- duplicate profile IDs and Worldbook mappings;
- missing/non-character Worldbook references when supplied;
- PC permission escalation and autonomy prompt fields;
- future-importance/rank/trust score fields;
- invalid depth/activation policy;
- deceased/normal and Special Interlude/main-world contradictions;
- missing knowledge partitions and known/unknown conflicts;
- belief promoted to confirmed world fact;
- unsourced claims or secret knowledge;
- single observation promoted to stable trait;
- authorial/continuation origin mismatches;
- pending continuation claims or PC goals;
- malformed relationships and numeric trust scores;
- future-event guarantees and inferred PC goals;
- rejected/unrelated profile patch provenance.

## Verification results

Final commands and results:

- `python -m unittest discover -s tests` → **81 tests passed**.
  - 38 Phase 3A character-profile tests.
  - 31 Phase 2.7 authoring-framework tests.
  - 12 existing candidate-extraction and Worldbook tests.
- `python scripts/validate_character_profiles.py templates/npc_profile.example.json templates/pc_continuity_profile.example.json --schema-dir schema` → **2 profiles, 0 errors**.
- `python scripts/validate_authoring_framework.py ... --schema-dir schema` over all four shipped Phase 2.7 JSON examples → **4 documents, 0 errors**.
- `python scripts/validate_worldbook.py output/worldbook_source.jsonl --schema schema/worldbook_entry.schema.json` → **79 records, 0 errors, 0 warnings**.

An independent final review found no Critical issues. Seven Important issues and one stale documentation line were found; all were addressed in one regression-backed fix pass. The added cases cover malformed semantic values, confirmed-continuation PC goals, belief without a fabricated fact reference, authorial root provenance, secret/non-knowledge contradiction, and rejected patch provenance.

## SHA-256 — Phase 3A and extended files

| File | SHA-256 |
| --- | --- |
| `docs/character_profile_architecture.md` | `79892E94CE4C4012AA7688D34611B5452E2F3E5E8FE9A5A80F9BC081E0972B44` |
| `docs/pc_control_boundary.md` | `E09AB54A9EF2D8CDB225AC073E8C20BF1B1DB47A500A9F6BC9E5E33827115541` |
| `docs/profile_runtime_projection_contract.md` | `A3D8BFF892D73AC118CC79B057904A3B7D65CE2906FA5ADBA889D283E3E82F61` |
| `schema/character_profile_common.schema.json` | `6BA12E8A34263492B50A75A9368A1DE487865955ADAE92BCBCD8DECDE0623027` |
| `schema/npc_profile.schema.json` | `2F7139CF67C821A1EB69A595B08D675AEEBFE629576E9AB2F5FAE98825B1AD22` |
| `schema/pc_continuity_profile.schema.json` | `22EDEFEED6806141ABBED4CBED80D5E88F7EF61E86A53DD4A0DC9DAAC45126B3` |
| `templates/npc_profile.example.json` | `6E7A69C52CB3E586609A8D679B8A7C61F45B221B3D35F30B49E8490D91ECB9AA` |
| `templates/pc_continuity_profile.example.json` | `B867326D4212A24A6FE7A54BDA6B5EAE2E86B1673A7E7477852D6C0A05CF2764` |
| `templates/npc_profile_draft.md` | `7FFCDD8E8625D9573FB0848B149CBCB3F55920D1C433FFF3075D59E39BDF5DD6` |
| `templates/pc_continuity_update.md` | `8AF50CF34C793E3EEF28467FF3F1010BF2213AAE014B88F6D8F5DE9BB107D067` |
| `scripts/validate_character_profiles.py` | `3FE54EBAC1065293CDDAF5AEEAEC24F101D251FFF44C7AF4597A9B0F7D8291DB` |
| `tests/test_validate_character_profiles.py` | `01D36AEBCF4744BA5049F0016A67DE2CE8FBC33A6874A5B089A3F442453A4B36` |
| `work/phase3a_field_mapping.md` | `27DB8A881B9C9581B4FC7A0272330664233CA7F5EB18C1757F8B3881B785CB91` |
| `schema/authorial_supplement.schema.json` | `F18EEE41E51EF7EF1FB969CD403D1DB74AE1A9BDAC027D3FD2D5FE55BA3E9222` |
| `schema/canon_patch.schema.json` | `8990BD6A5CA0E8A0B8E1844F75146038A7CFF9461E37827476BAB6D8970D0E72` |
| `config/content_routing_rules.json` | `A0CE4F1EDB2797F6AEBC7C19433752F25E3006141172038A96D486F1E22642CE` |
| `docs/content_routing_guide.md` | `09784FD38DC89FEB5E3AC62EF0543E34E5B049F2F81A567C60EAA8D639905077` |
| `tests/test_validate_authoring_framework.py` | `E6371C83CAF2994CFE18423D48EC140FED8FDBC969CC812B848B3E6AC61CD743` |

## Protected baseline check

All checked files match their pre-Phase-3A SHA-256 baselines:

| Protected file | SHA-256 | Result |
| --- | --- | --- |
| `output/worldbook_source.jsonl` | `342EF5AEDB9B3E6CAEE073FCE6F31CC5034D5E6437483C387BB13B5D9A24747F` | unchanged |
| `current_state.md` | `95ADABA5591F088BF24BB465E4FD81C5D77A78A3C5A7447F3C116EB051CD5C59` | unchanged |
| `work/candidates.jsonl` | `6B3035D43D217EB1EE45D444AB28422D2B32E9F5CF4D709924E00976EF998878` | unchanged |
| `work/candidate_report.md` | `F4CC15B27D3862C02EE9A61C2EB9F358D04283F45758D12B0FECC8D1444270DF` | unchanged |
| `config/review_decisions.json` | `95FB03A7A2AD80D340774CDAAE4B7A0DF63D82FD78822440A93E42979627145B` | unchanged |
| `config/alias_evidence.json` | `3C60943B26BB3BD7DB5C87323EB0D57629F12A5C27C40238F65D225AD2F46F49` | unchanged |
| `config/manual_candidates.json` | `E23C141E03BCEAB2CB8679604CB6CC9693FF281EA7DE93E252C95C5963DCB7D0` | unchanged |
| `schema/worldbook_entry.schema.json` | `C9F68B54081EC29EA03EC7559968C2B9D8428E66C67DAAC09C9F00C5DEA11579` | unchanged |
| `work/phase2_review.md` | `FF698EFF6CD599BEABED75CE07709BC299420CF7C8083F7168313FC6911BDA63` | unchanged |
| `work/phase2_discoveries.md` | `5E7B82E451702CF971CD21FF3651E9D02B61E2C67EB022E2E9E5B7AECAE3076B` | unchanged |
| `work/phase2_5_referential_audit.md` | `7A393CEFFF96E3C9E92B22FF0720945953FD54E36D7CA908019D8C7257F63951` | unchanged |
| `work/phase2_5_runtime_roles.jsonl` | `BB4E1B65CFA897C2DDDA62D8005F8110FF8D45896E6E527A95FF6E0CD7C683DE` | unchanged |
| `work/phase2_6_patch_manifest.md` | `6BF74FE4105372F2751A0CEB53AA8EB94E6AC4E355C2C8468C5D6BBAD5FA9D21` | unchanged |
| `work/phase2_6_trigger_delta.md` | `65DE01439E9402361EF8B35DA9A030E0B3068F390A454471F247A5CB4BD94012` | unchanged |

## Limits and future human decisions

- Actual profile generation still requires source-by-source human review and an approved patch.
- Profile depth and activation policy for characters not already reviewed remain human decisions.
- Uncertain personality, speech, private goal, relationship stance, and knowledge claims must remain evidence gaps until supported.
- Runtime context-selection thresholds and storage locations are not implemented in Phase 3A.
- Special Interlude promotion, resurrection, main-world availability, and PC authority can never be inferred from having a profile.
- This phase did not decide future plots, scene frequency, or character importance.

Phase 3A is complete and intentionally stops before creating any real character profile.
