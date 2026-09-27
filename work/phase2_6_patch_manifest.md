# Phase 2.6 Canonical Patch Manifest

This is a human-approved incremental patch to the Phase 2 canonical database. It adds the reviewed referential entities, applies minimal character/worldbook boundary cleanup, and does not create NPC Profiles, Character Cards, SillyTavern exports, runtime configuration, or future plot material.

## Baseline and result

- Previous worldbook SHA-256: `07878B8E7A3998367B3E4A918DDA2D2B00C38D4213F99A374706A9A5905E53C7`
- New worldbook SHA-256: `342EF5AEDB9B3E6CAEE073FCE6F31CC5034D5E6437483C387BB13B5D9A24747F`
- Previous entry count: 64
- New entry count: 79
- Added entries: 15
- Modified existing entries: 5
- Unchanged previous entries: 59

## Added IDs

- `CHARACTER_DEATHWING` — 死亡之翼
- `CHARACTER_HONDA_KAI_FERGUS` — 本多·凯·弗格斯
- `CHARACTER_SERTANT_LU_YOURLAN` — 瑟坦特·卢·优尔兰
- `CHARACTER_GREMLIN` — 古雷姆林
- `CHARACTER_NOSURI` — 诺斯莉
- `CHARACTER_OSHIRA` — 奥希拉
- `CHARACTER_KENDA_KAI_FERGUS` — 肯达·凯·弗格斯
- `CHARACTER_CASSANDRA` — 卡珊德拉
- `CHARACTER_WURAI` — 武赖
- `CHARACTER_LINGCHI` — 凌迟
- `CHARACTER_JERGAL` — 耶各
- `CHARACTER_LULUTIYE` — 露露缇耶
- `CHARACTER_WILLIAM` — 威廉
- `CHARACTER_JEWEL_ELDER` — 宝石翁
- `CHARACTER_ZHENZI` — 贞子

The unsupported-name error from Phase 2.5 was not added. It is documented exclusively in `work/phase2_5_errata.md`; the approved fifteenth entity is `贞子`.

## Modified IDs

- `CHARACTER_ELLIE`: removed the unsupported objective personality evaluation “细心、善良且可靠”.
- `CHARACTER_HAKU`: removed the profile-like “外表散漫、厌恶麻烦”; retained demonstrated intelligence, command ability, and actions.
- `CHARACTER_JIANG_ZIYOU`: removed the “荒诞喜剧色彩” RP-style evaluation; retained actions and durable identity consequences.
- `CHARACTER_KUON`: retained pharmacist identity and removed “可靠” as an objective personality fact.
- `CHARACTER_MU_TOU`: removed the abstract internal-value summary; retained identity, equipment relationship, and confirmed actions.

`CHARACTER_WHITE_MAGICIAN` was reviewed and left unchanged. Its goal remains framed as an attributed public claim rather than an objectively verified motive.

## HOLD / NO_ENTRY_NEEDED confirmation

- `魔法师A`: remains HOLD; no entry added; bare `A` is not a key.
- `方镜`: remains Special Interlude HOLD; no entry added.
- `黄祸龙狼`: remains carried by existing entries; no independent entry added.
- `欧基`: remains carried by `EVENT_ESTATE_BATTLE`; no independent entry added.
- The source-less Phase 2.5 audit error was not treated as an alias and was not added; see `work/phase2_5_errata.md`.

## Canon boundaries applied

- 死亡之翼: only the current body is confirmed defeated; permanent death, immortality mechanism, and old-god relation remain unresolved.
- 古雷姆林, 凌迟, and 贞子: explicitly marked `deceased`; none is written as currently active.
- 耶各: the curse/contract/name association is retained, while divine identity and cosmology remain attributed character knowledge or belief; entry status is `uncertain`.
- 本多、瑟坦特、奥希拉、肯达: no political stance was inferred from title, kinship, or office.
- 卡珊德拉: actual appearances and actions are separated from future vision, investigation notes, and character inference.
- All 15 added entries use `canon_layer=original_campaign`; no Special Interlude material was promoted.

## Validation

- Schema/validator: `Validated 79 record(s): 0 error(s), 0 warning(s)`.
- Full unit tests: 12 tests run, all passed.
- Unique IDs: 79/79.
- Unique names: 79/79.
- Total trigger keys: 111.
- Exact cross-entry key conflicts: 0.
- Added entry count: 15/15.
- HOLD / NO_ENTRY_NEEDED accidental entries: 0.
- Bare `A` keys: 0.
- Special Interlude leakage among added entries: 0.
- Deceased-state boundary errors for 古雷姆林、凌迟、贞子: 0.

## Source files read

- `output/worldbook_source.jsonl`
- `schema/worldbook_entry.schema.json`
- `current_state.md`
- `work/phase2_review.md`
- `work/phase2_discoveries.md`
- `work/phase2_5_referential_audit.md`
- `work/phase2_5_runtime_roles.jsonl`
- `work/phase2/batch_01_review.md` through `work/phase2/batch_07_review.md`
- `设定 人物/妄想大陆设定集_检索版.md`
- `设定 人物/人物卡资料集_检索版.md`
- `设定 人物/人物卡资料集_叙事检索版.md`
- first- and second-part `01_角色与主题线索表.md`
- first- and third-part `00_顺读场景卡.md`
- `TRPG outputs/extracted-first/19/posts.md`
- `TRPG outputs/extracted-first/22/posts.md`
- `TRPG outputs/extracted-first/24/posts.md`
- `TRPG outputs/extracted-first/25/posts.md`
- `TRPG outputs/extracted-first/27/posts.md`
- `TRPG outputs/extracted-first/28/posts.md`
- second-part root `posts.md`, pages 4–7 and page 15 `posts.md`
- third-part pages 2, 4, and 5 `posts.md`

Only sources that directly support an entry's prose are listed in that entry's `sources` array.
