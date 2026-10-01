# R1A-2 — Repair and Rebuild Report

Status: `BLOCKED_BY_LEDGER_REALIZATION_GAP`

R1A-2 stopped at the mandatory pre-production realization-sufficiency gate. No R2C production package, candidate, Chinese review, global migration ledger, schema, frozen manifest, Canon, Worldbook, Current State, R2A artifact, R2B artifact, or Phase 3C/3D/3D-R input was modified or regenerated.

## 1. Preflight result

The accepted R1A-1 ledger itself remains the reviewed semantic authority. Its structural and exposure checks passed:

| Check | Result |
|---|---|
| Reviewed identities | 145 |
| Identity cohort | 116 |
| Relationship cohort | 29 |
| Profiles | 35 |
| Duplicate semantic identities | 0 |
| Missing live-exposure identities | 0 |
| Extra stale ledger identities | 0 |
| `UNRESOLVED` | 0 |
| Unsupported R2C routes | 0 |
| Unknown R2A event refs | 0 |
| Unique source refs | 206 |
| Source paths resolved | 206/206 (project root or campaign parent root) |
| Excluded pre-existing high-risk reroutes | 16: 2 `MOVED_TO_ABILITY_STATUS`, 4 `MOVED_TO_TIMELINE`, 10 `SPLIT` |
| Frozen inputs | 488/488 matched |

The live raw identity-history population is still 132. Exactly 116 remain in the accepted background-converter exposure, and the 16 accepted explicit reroutes remain outside it. There is no exposure drift, source contradiction, or frozen-input mutation.

## 2. Realization-sufficiency failure

R1A-1 determines destination sections but does not contain destination-specific atomic payloads. Across all 46 records with `split_required=true`, the source claim field union is exactly:

```text
claim
claim_id
context
evidence_mode
exceptions
notes
origin
sources
stability
```

No source claim or ledger record contains `realizations`, `route_payloads`, destination-specific statements, or typed constructor values.

Two split records are sufficient without new judgment because every required target is an already-reviewed R2A event and the only route is `campaign_timeline`:

- `NPC_HONDA_KAI_FERGUS / CLAIM_HONDA_SANCTUARY_WAR`
- `PC_YU_LINFENG / CLAIM_YU_LINFENG_DRAGON_SANCTUARY_HISTORY`

The other 44 records cannot be realized without one or more new semantic decisions. The missing information is not merely formatting. Depending on the destination, the existing schema requires exact atomic values such as:

- background-only statement and temporal scope;
- public identity, durable role, or affiliation statement separated from narrative events;
- persona/value statement plus stability and reality status;
- relationship target, durable baseline text, and/or one change statement per event milestone;
- ability/status `before_state`, `after_state`, `persistence`, and event/background association;
- knowledge proposition, epistemic status, attribution, acquisition event/order, and validity bounds.

The reviewed route list and concise evidence basis explain why a split is required, but they do not freeze the exact atomic content to place in each destination. A deterministic implementation would therefore have to parse conjunctions, select fragments, infer typed state fields, select R2A consequences, or copy a conflated sentence into incompatible fields. Section 5 of the R1A-2 request explicitly prohibits all of those approaches.

## 3. Exact realization gaps

Every row below has an available legacy claim string, the stated number of precise source refs, the R1A-1 evidence basis, and the listed reviewed R2A event refs. What is missing is the exact destination-specific atomic payload identified in the last column.

| Profile | Claim | Reviewed destinations / events | Available evidence | Exact missing atomic realization information |
|---|---|---|---|---|
| `NPC_CASSIUS_BRIGHT` | `CLAIM_BRIGHT_LATE_FATE` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P3_002_SANCTUARY_ENTRY` | legacy claim + 3 source refs + R1A-1 basis | knowledge proposition, epistemic status, attribution, and acquisition mapping distinct from the reusable event |
| `NPC_DEATHWING` | `CLAIM_DEATHWING_XIERLUN_HISTORY` | `biographical_background`; `relationships[].relationship_milestones`; `EVENT_P3_009_DEATHWING_FINAL_WAR` | legacy claim + 4 source refs + R1A-1 basis | background-only statement/temporal scope and event-specific relationship change payload |
| `NPC_ELDER_XUE` | `CLAIM_ELDER_XUE_ABILITY_TRANSITION` | `biographical_background`; `ability_status_transitions` | legacy claim + 2 source refs + R1A-1 basis | separate background statement plus ability before/after state, persistence, and background association |
| `NPC_ELDER_XUE` | `CLAIM_ELDER_XUE_RETIREMENT_AND_MEMORY_REQUEST` | `campaign_timeline`; `identity.durable_roles`; `EVENT_P1_014_DAKAS_PLOT_EXPOSED`; `EVENT_P1_022_EXECUTION_TAIL_HOOK` | legacy claim + 4 source refs + R1A-1 basis | durable-role statement and validity boundary separated from the two reusable events |
| `NPC_GREMLIN` | `CLAIM_GREMLIN_A_HISTORY` | `biographical_background`; `knowledge_timeline` | legacy claim + 2 source refs + R1A-1 basis | objective background statement separated from attributed testimony, including proposition and epistemic status |
| `NPC_HAKU` | `CLAIM_HAKU_OSHUTORU_SERVICE` | `biographical_background`; `identity.durable_roles`; `campaign_timeline`; `EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE` | legacy claim + 3 source refs + R1A-1 basis | distinct rescue/background statement and durable service-role statement; event can be reused |
| `NPC_HAKU` | `CLAIM_HAKU_RELATIONSHIP` | `biographical_background`; `relationships[].relationship_baseline` | legacy claim + 1 source ref + R1A-1 basis | relationship-formation background statement and exact durable baseline/target, without inventing current stance |
| `NPC_JERGAL` | `CLAIM_JERGAL_HISTORY_1` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P2_001_CURSE_AND_CLINIC_OPENING` | legacy claim + 1 source ref + R1A-1 basis | attributed knowledge proposition/status/acquisition payload distinct from the reusable speech event |
| `NPC_JEWEL_ELDER` | `CLAIM_JEWEL_ELDER_TRANSFER_LIMIT` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION`; `EVENT_P1_021_JERGAL_TRANSFER` | legacy claim + 2 source refs + R1A-1 basis | exact propositions and their acquisition/event mapping across the two events |
| `NPC_JIANG_ZIYOU` | `CLAIM_JIANG_DRAGON_ELEPHANT_ART` | `campaign_timeline`; `ability_status_transitions`; `EVENT_INTERLUDE_003_EIGHT_DRAGONS_VAULT_REWARDS`; `EVENT_P1_014_DAKAS_PLOT_EXPOSED` | legacy claim + 2 source refs + R1A-1 basis | ability before/after/persistence and explicit carry-back association, separate from reward/use events |
| `NPC_JIANG_ZIYOU` | `CLAIM_JIANG_DEPARTURE` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P2_009_AFTERMATH_HAKU_KNOWLEDGE` | legacy claim + 3 source refs + R1A-1 basis | departure event mapping plus exact attributed “unknown whereabouts” knowledge proposition/status |
| `NPC_KENDA_KAI_FERGUS` | `CLAIM_KENDA_ASSASSINATION_ALLEGATION` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION` | legacy claim + 2 source refs + R1A-1 basis | allegation proposition, speaker/observer attribution, epistemic status, and acquisition mapping |
| `NPC_KUON` | `CLAIM_KUON_APOTHECARY_STAGE` | `identity.durable_roles`; `campaign_timeline`; `EVENT_P2_001_CURSE_AND_CLINIC_OPENING`; `EVENT_P2_004_BAIT_PLAN_PREPARATION` | legacy claim + 4 source refs + R1A-1 basis | durable apothecary-role statement/validity separate from the two reusable Campaign actions |
| `NPC_KUON` | `CLAIM_KUON_REMOVAL` | `campaign_timeline`; `ability_status_transitions`; `EVENT_P2_005_GREMLIN_MANSION_BATTLE`; `EVENT_P2_010_SEWER_SEARCH_AND_PREPARATION` | legacy claim + 3 source refs + R1A-1 basis | exact transition after-state/persistence and which event establishes/remains evidence for the missing state |
| `NPC_KUON` | `CLAIM_KUON_RELATIONSHIP` | `biographical_background`; `relationships[].relationship_baseline` | legacy claim + 1 source ref + R1A-1 basis | formation/background statement and exact durable relationship baseline/target |
| `NPC_LEI_GUANG` | `CLAIM_LEI_GUANG_COMMAND_HISTORY` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P2_011_REVIVAL_DILEMMA_WOSIS_BORDER`; `EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY` | legacy claim + 5 source refs + R1A-1 basis | event-by-event command/testimony propositions, attribution, epistemic status, and acquisition mapping |
| `NPC_LINGCHI` | `CLAIM_LINGCHI_MONSTER_TRANSFORMATION` | `biographical_background`; `ability_status_transitions` | legacy claim + 1 source ref + R1A-1 basis | pre-Campaign biography statement plus ability before/after state and persistence |
| `NPC_LINGCHI` | `CLAIM_LINGCHI_DAKAS_OBJECTIVE` | `campaign_timeline`; `biographical_background`; `knowledge_timeline`; `EVENT_P1_009_BORDER_TRUTH_AND_PURSUIT_MISSION`; `EVENT_P1_014_DAKAS_PLOT_EXPOSED` | legacy claim + 4 source refs + R1A-1 basis | separate prior-history statement, uncertain investigation proposition/status, and event-to-knowledge mapping |
| `NPC_LULUTIYE` | `CLAIM_LULUTIYE_MEMORY_BOUNDARY` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P1_022_EXECUTION_TAIL_HOOK` | legacy claim + 1 source ref + R1A-1 basis | post-treatment knowledge boundary proposition/status/validity separate from treatment event |
| `NPC_LULUTIYE` | `CLAIM_LULUTIYE_RELATIONSHIP` | `relationships[].relationship_baseline`; `biographical_background` | legacy claim + 1 source ref + R1A-1 basis | exact kinship baseline/target and separate residence/background statement |
| `NPC_MU_SHAOAI` | `CLAIM_MU_SHAOAI_HISTORY_3` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P2_001_CURSE_AND_CLINIC_OPENING` | legacy claim + 1 source ref + R1A-1 basis | explained proposition, attribution, epistemic status, and acquisition payload distinct from the speech event |
| `NPC_MU_SHAOAI` | `CLAIM_MU_SHAOAI_RELATIONSHIPS` | `relationships[].relationship_baseline`; `relationships[].relationship_milestones`; `EVENT_P1_008_DWARF_SHOP_RESCUE`; `EVENT_P1_020_MONSTER_BOX_DISASTER` | legacy claim + 2 source refs + R1A-1 basis | relationship target/baseline payloads and one exact change statement per reviewed event |
| `NPC_MU_SHAOAI` | `CLAIM_MU_SHAOAI_CURSE_LIMIT` | `campaign_timeline`; `knowledge_timeline`; `ability_status_transitions`; `EVENT_P1_019_XUE_REBUKE_AND_TRANSFER_DECISION`; `EVENT_P1_021_JERGAL_TRANSFER`; `EVENT_P2_001_CURSE_AND_CLINIC_OPENING` | legacy claim + 3 source refs + R1A-1 basis | knowledge proposition/status plus ability before/after/persistence and exact event associations |
| `NPC_MU_TOU` | `CLAIM_MU_TOU_WIZARD_TRANSITION` | `biographical_background`; `ability_status_transitions` | legacy claim + 2 source refs + R1A-1 basis | prison-tower background statement plus exact Wizard Driver/ring before/after state and persistence |
| `NPC_NOSURI` | `CLAIM_NOSURI_IDENTITY` | `relationships[].relationship_baseline`; `campaign_timeline`; `EVENT_P2_004_BAIT_PLAN_PREPARATION` | legacy claim + 1 source ref + R1A-1 basis | exact sibling baseline/target distinct from participation in the reusable event |
| `NPC_OSHIRA` | `CLAIM_OSHIRA_YOUYOU_HISTORY` | `relationships[].relationship_baseline`; `relationships[].relationship_milestones`; `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY`; `EVENT_P2_021_DRAGON_RITUAL_AND_ASSASSINATION` | legacy claim + 2 source refs + R1A-1 basis | exact uncle/elder baseline plus one event-specific relationship change per event |
| `NPC_OSHUTORU` | `CLAIM_OSHUTORU_HISTORY_2` | `campaign_timeline`; `identity.public_identity`; `EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION` | legacy claim + 1 source ref + R1A-1 basis | identity-only name statement/attribution distinct from the self-identification event |
| `NPC_OSHUTORU` | `CLAIM_OSHUTORU_MASK_BATTLE` | `campaign_timeline`; `ability_status_transitions`; `EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE` | legacy claim + 2 source refs + R1A-1 basis | mask/ability before/after state and persistence distinct from the battle event |
| `NPC_OSHUTORU` | `CLAIM_OSHUTORU_RELATIONSHIPS` | `relationships[].relationship_baseline`; `campaign_timeline`; `EVENT_P1_007_UKON_BROTHERHOOD_CONTACT`; `EVENT_P1_009_BORDER_TRUTH_AND_PURSUIT_MISSION` | legacy claim + 4 source refs + R1A-1 basis | exact durable relationship target/baseline separate from the two Campaign actions |
| `NPC_OSHUTORU` | `CLAIM_OSHUTORU_RELATIONSHIP` | `biographical_background`; `relationships[].relationship_baseline` | legacy claim + 1 source ref + R1A-1 basis | invitation/formation background statement and exact superior/subordinate baseline/target |
| `NPC_WILLIAM` | `CLAIM_WILLIAM_FULL_NAME` | `campaign_timeline`; `identity.public_identity`; `EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT` | legacy claim + 1 source ref + R1A-1 basis | public-identity statement/attribution distinct from the introduction event |
| `NPC_WURAI` | `CLAIM_WURAI_HISTORY_1` | `campaign_timeline`; `identity.durable_roles`; `EVENT_P2_008_MAGE_TOWER_MASSACRE` | legacy claim + 1 source ref + R1A-1 basis | durable Eight Pillar General role statement/validity distinct from the attack event |
| `NPC_XIERLUN_VON_GILCODE` | `CLAIM_XIERLUN_ALLIANCE_AND_ENGAGEMENT_PLANNING` | `biographical_background`; `relationships[].relationship_baseline` | legacy claim + 1 source ref + R1A-1 basis | separate prior-history statement(s) and exact durable relationship baseline/target |
| `NPC_XIERLUN_VON_GILCODE` | `CLAIM_XIERLUN_COMBAT_BACKGROUND` | `biographical_background`; `ability_status_transitions` | legacy claim + 1 source ref + R1A-1 basis | ancient-war biography statement and exact reference-time ability state/persistence |
| `NPC_XIERLUN_VON_GILCODE` | `CLAIM_XIERLUN_ENGAGEMENT_RELATIONSHIP` | `biographical_background`; `relationships[].relationship_milestones`; `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY` | legacy claim + 2 source refs + R1A-1 basis | engagement-planning background statement and P2-018 relationship change payload |
| `NPC_YOMI_ISAYAMA` | `CLAIM_YOMI_LION_KING_TRANSITION` | `campaign_timeline`; `ability_status_transitions`; `EVENT_P1_017_IMPERIAL_AUDIENCE_CURSE_EXAMINATION` | legacy claim + 3 source refs + R1A-1 basis | equipment/ability before/after state and persistence distinct from return/unsealing event |
| `NPC_YOUYOU` | `CLAIM_YOUYOU_YU_LATE_MILESTONES` | `relationships[].relationship_milestones`; `relationships[].relationship_baseline`; `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY`; `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`; `EVENT_P3_003_TEIRESIAS_REVELATION`; `EVENT_P3_009_DEATHWING_FINAL_WAR` | legacy claim + 4 source refs + R1A-1 basis | bounded engagement baseline plus one exact relationship change per reviewed event |
| `NPC_ZHENZI` | `CLAIM_ZHENZI_RELATIONSHIP` | `biographical_background`; `relationships[].relationship_baseline` | legacy claim + 1 source ref + R1A-1 basis | sacrifice/rescue background statement and exact historical relationship baseline without current obligation |
| `PC_YU_LINFENG` | `CLAIM_YU_LINFENG_EARLY_BONDS` | `biographical_background`; `relationships[].relationship_baseline`; `knowledge_timeline` | legacy claim + 2 source refs + R1A-1 basis | separate bond/biography facts, exact relationship baselines/targets, and attributed self-report proposition/status |
| `PC_YU_LINFENG` | `CLAIM_YU_LINFENG_MEMORY_RESTORATION` | `campaign_timeline`; `knowledge_timeline`; `EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT` | legacy claim + 2 source refs + R1A-1 basis | restored/removed knowledge propositions, status, and validity after the treatment event |
| `PC_YU_LINFENG` | `CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY` | `campaign_timeline`; `relationships[].relationship_baseline`; `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY`; `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING` | legacy claim + 2 source refs + R1A-1 basis | exact non-permanent engagement baseline preserving both characters' choice boundaries |
| `PC_YU_LINFENG` | `CLAIM_YU_LINFENG_YOUYOU_HISTORY` | `relationships[].relationship_milestones`; `EVENT_P1_015_UKON_BATTLE_YOUYOU_RESCUE`; `EVENT_P1_021_JERGAL_TRANSFER` | legacy claim + 3 source refs + R1A-1 basis | one exact relationship-change payload per event; the ledger lists events but not their milestone text mapping |
| `PC_YU_LINFENG` | `CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY` | `relationships[].relationship_milestones`; `relationships[].relationship_baseline`; `EVENT_P2_018_YANG_AND_DRAGON_BANQUET_ENTRY`; `EVENT_P2_020_SPACE_DRAGON_HISTORY_AND_KENDA_WARNING`; `EVENT_P3_003_TEIRESIAS_REVELATION`; `EVENT_P3_009_DEATHWING_FINAL_WAR` | legacy claim + 4 source refs + R1A-1 basis | bounded engagement baseline plus one exact relationship change per reviewed event, preserving PC control |
| `PC_YU_LINFENG` | `CLAIM_YU_LINFENG_ZHENZI_HISTORY` | `biographical_background`; `relationships[].relationship_milestones`; `knowledge_timeline`; `EVENT_P1_018_GRAVES_COMPANIONSHIP_PRISON_VISIT` | legacy claim + 2 source refs + R1A-1 basis | prior rescue/sacrifice background, memory-restoration relationship change, and exact knowledge proposition/status |

## 4. Why deterministic code cannot fill the gap

The missing values cannot be obtained by a schema-neutral mechanical projection:

- R2A events can safely supply the event identity and chronology, but they do not select which clause of a compound legacy claim becomes a durable role, relationship baseline, knowledge proposition, or ability state.
- Existing Phase 3D-R claims preserve evidence and uncertainty but expose one compound `claim` string, not reviewed per-route payloads.
- Existing relationship structures sometimes provide a subject and generic relationship type, but they do not specify the reviewed atomic baseline text or one change payload per event for these compound claims.
- Existing ability/status schemas require typed before/after/persistence values not present in the ledger.
- Existing knowledge schemas require an epistemic status and attribution not frozen per route in the ledger.

Using keyword matching, conjunction splitting, consequence selection, nearest-event selection, or LLM-authored paraphrase would be a new semantic adjudication inside migration code. Copying the full compound sentence into every target would violate atomicity and the explicit prohibition on blind duplication.

## 5. Required remediation before R1A-2 can resume

Extend the reviewed decision surface—not the production router—with explicit destination payloads for the 44 blocked records. A sufficient shape would be one reviewed `realizations[]` entry per destination object, containing only fields required by the existing schema, for example:

```json
{
  "profile_id": "...",
  "old_claim_id": "...",
  "realizations": [
    {
      "route": "ability_status_transitions",
      "statement_or_after_state": "reviewed atomic text",
      "before_state": null,
      "persistence": "unknown",
      "event_refs": ["EVENT_..."],
      "source_refs": ["..."],
      "uncertainty": "confirmed",
      "attribution": "..."
    }
  ]
}
```

The exact schema can be smaller, but it must deterministically freeze:

1. the atomic content for each reviewed destination;
2. the destination's required typed values;
3. the relationship target or event-to-milestone mapping where applicable;
4. source/event lineage and uncertainty/attribution;
5. whether multiple event refs reuse one target or create separate targets.

This is an R1A-1 ledger-realization completion step, not a request to change the accepted primary categories or destination routes.

## 6. Implementation and artifact status

- Explicit production ledger loader: not added; work stopped at its mandatory sufficiency precondition.
- Route-specific constructors: not added.
- Legacy unsafe path: unchanged and not executed in write mode.
- Relationship converter: unchanged.
- Semantic contradiction validator: not added.
- Production artifacts regenerated: none.
- Semantic-equivalence audit: not run because no compliant realization exists.
- Before/after semantic change inventory: no after state exists.

## 7. Verification performed before stopping

| Command/check | Result |
|---|---|
| `python -m unittest tests.test_r1a1_semantic_audit` | PASS — 9/9 |
| `python -m unittest tests.test_phase3d_r2c` | PASS — 57/57 baseline |
| `python scripts/audit_r1a1_semantic_routes.py --check` | PASS — 145 exact reviewed records |
| `verify_frozen_manifest()` | PASS — 488/488 |
| live identity-history status inventory | PASS — 132 raw, 116 exposed, 16 accepted reroutes excluded |
| source-path resolution | PASS — 206/206 unique refs resolved from project/campaign roots |
| split source-field inspection | 46/46 inspected; 0 contain route-specific realization payloads |

These are preflight/baseline checks, not an R1A-2 implementation success claim. Full-suite, rebuild, post-rebuild equivalence, and deterministic regenerated-artifact checks were intentionally not run because the mandatory stop condition fired before production changes.

## 8. Remaining risks

- The 36 multi-route records with `split_required=false` may also benefit from explicit typed realization payloads. They were not needed to establish the mandatory blocker and must be checked when the reviewed realization surface is completed.
- The two structurally sufficient campaign-only split records were not applied because partial production regeneration is prohibited.
- R1A-2 remains unimplemented; current R2C artifacts retain the known R1A-0/R1A-1 semantic defects.

## 9. Stop status

```text
R1A-2 STATUS:
BLOCKED_BY_LEDGER_REALIZATION_GAP

blocked reviewed records: 44
split_required reviewed records: 46
split records structurally sufficient without new content: 2
production artifacts written: 0
```
