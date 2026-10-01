# Phase 3D-R independent semantic recall audit — batch C

This is a source-to-effective-profile check, not approval. The effective profile is `work/phase3d_recall/repaired_candidates/<ID>.json` for WHITE_MAGICIAN, XIERLUN_VON_GILCODE, YOUYOU, and PC_YU_LINFENG; for the other eight it is `work/phase3d/approved_candidates/<ID>.json`. Classifications refer to the effective profile. `MISSING` means a continuity-relevant source claim remains unrepresented; it does not authorize silently adding it. Character thoughts, public claims, prophecy, and observed behavior retain their attribution.

## Original-source inventory notation

The following are *exact file paths*, with the directory stem abbreviated only to keep each per-profile inventory legible:

- `NR` = `../设定 人物/人物卡资料集_叙事检索版.md`; `CR` = `../设定 人物/人物卡资料集_检索版.md`; `WR` = `../设定 人物/妄想大陆设定集_检索版.md`.
- `F<n>` = `extracted-first/<n>/posts.md`.
- `S0` = `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md`; `S<n>` = `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 <n>/posts.md`.
- `T0` = `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。/posts.md`; `T<n>` = `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 <n>/posts.md`.

These inventories are the manifest's `setting` and `campaign_posts` exact-name matches only. Battle reports were navigation aids, never claim authority. Source passages around important direct matches were checked in the original files. The classifications below concern claims, not generic file-level passes; grouped low-value sources carry concrete exclusion reasons. `current_state.md` was considered only for the D3 anchor, outside these original-source counts.

## NPC_SERTANT_LU_YOURLAN — 瑟坦特·卢·优尔兰

Original files reviewed (8): `CR`, `S15`, `S18`, `T0`, `T2`, `T3`, `T4`, `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Identity / earlier war | `CR:580-582` | Element Dragon King named; Yu's notes say he killed Nancy and characterize his temperament, with a *tentative* claim of closeness to the Poison Dragon King. | Identity confirmed; note's `似乎` relationship remains character belief. | Dragon King identity PROFILED; confirmed killing of Nancy MISSING; temperament/possible friendship must retain note attribution, SEEN_NOT_PROMOTED as objective fact. |
| Dragon gathering | `S15:789-819`; `S18:408-447` | Initially absent on business, later personally meets Yu and acknowledges the dragons' lapse. Narration calls him terse. | Direct encounter; limited observed speech behavior. | Absence PROFILED; terse one-scene behavior SEEN_NOT_PROMOTED as stable trait. |
| Sanctuary war / mask | `T2:121-126,437-470`; `T3:214-265`; `T4:188-219` | Xierlun says he and Honda chose the youngest, most battle-ready king to use an imperial mask; wearing it left Sertain asleep. Youyou's light enters him; he rises and activates the mask, later fights White Magician. | Major temporary incapacity and recovery; mask use and war participation. | MISSING. Profile jumps from gathering to final capture; the mask/status transition cannot be inferred from `established_history_2`. |
| After Deathwing | `T5:333-386` | Found unconscious, bound by White Magician's barrier; rescue is pursued. | Captivity before evacuation. | PROFILED; transition evacuation anchored to `current_state.md`, not to inferred later freedom. |

Additional finding: `T2:457-465` explicitly attributes the light to Youyou, while the reason the mask initially caused sleep is given by Youyou as her explanation (`T2:457-459`), not an omniscient mechanism. Grouped `T0` list/name, `T3` planning references, and `T4` repeated battlefield sightings add no separate durable claim beyond the mask-war stage. Unresolved MISSING: confirmed killing of Nancy (`CR:580`) and mask-related temporary incapacitation, awakening, activation, and battle participation (`T2`, `T4`). **Verdict: MISSING_FOUND.**

## NPC_TOLKIEN — 托尔金

Original files reviewed (3): `F21`, `S7`, `S8`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Earlier sword work | `F21:475-499`; `S7:70-80` | Sword reforging endangered his shop/materials; Right Near had salvaged equipment; Tolkien acknowledges his part in the accident. | Established craft history and rescue, no perpetual debt inferred. | Craft role PROFILED; shop rescue and apology ROUTED_ELSEWHERE to `output/worldbook_source.jsonl#CHARACTER_TOLKIEN` only insofar as that record covers the sword work; precise rescue is scene history, SEEN_NOT_PROMOTED. |
| Dragon task preparation | `S7:57-113`; `S8:423-582` | Yu requests equipment for Youyou and party; despite anger at short notice, Tolkien opens the shop and provides magical gear. | Concrete support and a witnessed interaction style. | PROFILED for support; one anger/apology exchange SEEN_NOT_PROMOTED as stable personality. |

Additional finding: Snow Elder and Lulutie are present with him (`S7:50-57,95-100`); the Worldbook character entry explicitly retains their closeness. The profile's evidence gap says this relation needs deeper original review; these passages support observed familiarity, but do not establish a familial tie or enduring obligation. `S8` inventory of individual items is equipment ownership detail, not a series of character claims. Unresolved MISSING: none identified beyond the explicitly bounded relationship uncertainty. **Verdict: NO_UNRESOLVED_MISSING.**

## NPC_WHITE_MAGICIAN — 白色魔法使

Original files reviewed (20): `CR`, `WR`, `S3`, `S4`, `S6`, `S8`, `S9`, `S12`, `S13`, `S14`, `S18`, `S19`, `S20`, `S24`, `S25`, `T0`, `T2`, `T3`, `T4`, `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Imprisonment / Phantom activity | `WR:123-130` | Previously held atop Prison Tower, escaped during beast tide with Muto's aid. Reference separately says he gave Muto a Wizard Driver and was then inducing many Phantoms; motive unknown. | Distinct historical prison and demonstrated Phantom role. | Prison/escape PROFILED; Wizard Driver and mass Phantom activity MISSING. The reference's `目前` is its document time, not D3. |
| Underground factory pursuit | `S20:127-169,285-340,406-479,525-530` | Following the factory attack, the pursuit enters a cave. There White Magician fights imperial teams and Yu, self-identifies as Fueki Kanade, offers Tristan for Yu's prophecy information, then teleports away with Tristan. | Encounter and adversarial bargaining. | Main history repair PROFILED. However `relationships[0].established_history[0].context` still says `监狱塔后续与龙族秘境终局`; MISSING correction / EVENT_CONFLATION remains in the effective profile. |
| Sanctuary war | `T2:478-500`; `T3:32-123`; `T4:188-234`; `T5:371-386` | Record attributes Oshira's control to White Magician and later shows White Magician's multiple manifestations restraining two kings. | Oshira control and final capture, with mechanism/Deathwing joint action unresolved. | PROFILED conservatively; exact mechanism remains uncertain. |
| Final exchange | `T5:390-470` | Takes the sanctuary gem and explains a theory of fate, family survival, and an ideal world in a negotiation with Yu and Ainz. | Gem possession, stated goals/theory, unresolved relationship. | PROFILED; cosmology and sincerity remain attributed belief/public statement. |

Grouped `CR` mention and `S3-4,S6,S8-9,S12-14,S18-19,S24-25,T0` comprise foreshadowing, target/search reports, other characters' suspicion, or repeated references to his activity; they do not place the cave confrontation in Prison Tower. `T4` battle tactics do not establish a stable conflict rule. Unresolved MISSING: the distinct `WR:125-127` Wizard Driver/Phantom history and removal of the old Prison Tower event label in the repaired relationship context. **Verdict: MISSING_FOUND.**

## NPC_WILLIAM — 威廉

Original files reviewed (12): `CR`, `F22`, `F23`, `F24`, `F25`, `F26`, `F27`, `F28`, `S0`, `S2`, `S9`, `S20`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Identity and memory recovery | `F22:369-375,417-449`; `F23:1-72`; `CR:254` | He introduces himself as **威廉信长**, examines Han Nuo's exchange mark, and uses peacock and seals to restore Yu's emotions and Border Gate memories. | Full stated name and major intervention. | Intervention PROFILED; self-introduced full name MISSING from profile and Worldbook naming. |
| Curse investigation / treatment | `F24:199`; `F25:7-60`; `F26:55-73`; `F27:52-193`; `F28:173-377` | Investigates Youyou's curse, treats her, later helps conduct transfer to Yu with the other mages. | He has firsthand involvement in the curse's diagnosis and transfer. | Transfer PROFILED; the investigation and treatment only appear in `output/worldbook_source.jsonl#CHARACTER_WILLIAM`, ROUTED_ELSEWHERE. Do not assume he fully understood the curse. |
| Continued contact | `S0:93-134,419-448` | Runs a wine house and speaks with Yu again about the curse. | Confirmed business and contact. | Wine house PROFILED; individual conversations SEEN_NOT_PROMOTED. |

`S2,S9` are other characters' passing references; `S20:767` is **William Shakespeare**, an unrelated homonym and expressly excluded. Unresolved MISSING: the character's own full self-introduction `威廉信长` (`F22:372`). **Verdict: MISSING_FOUND.**

## NPC_WOSIS — 沃西斯

Original files reviewed (13): `CR`, `WR`, `F19`, `F21`, `F28`, `S2`, `S7`, `S9`, `S10`, `S15`, `S16`, `S17`, `S18`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Imperial office | `WR:23-26`; `F19:371-377`; `F21:612`; `F28:394` | One of the eight generals; setting says the daily imperial office is chiefly run by Wosis and Lightning, and his deputy attends military matters. | Durable government/world position. | Compact profile gives Eight General identity; fuller office/intelligence role ROUTED_ELSEWHERE to `output/worldbook_source.jsonl#CHARACTER_WOSIS`. `F21`'s “智将” is an observer comparison, not a new power. |
| Escort mission briefing | `S9:9-63` | On Emperor's instruction explains Youyou escort route, resources, secrecy, and that the team alone cannot solve the dragon prophecy. | Direct mission authority. | PROFILED in durable role. |
| Identity interrogation | `S9:87-120,121-229`; later `S10,S15-S18` recall it | Sends Youyou out, questions Yu/Yomi/Jiang's records and affiliations, threatens to bar departure until answers. | Establishes investigation and Yu relationship context, not proof every suspicion is true. | PROFILED in observed pattern, relationship, epistemic item. |

`CR:262` is Yu's conjecture about what Wosis knew; `S2,S7,S10,S15-S18` mostly contain Yu's speculation, retrospective references, or equipment/route follow-up. These cannot establish Wosis's private knowledge beyond his spoken investigation. No additional profile-specific durable fact found. Unresolved MISSING: none; administrative role is named in the Worldbook. **Verdict: NO_UNRESOLVED_MISSING.**

## NPC_WURAI — 武赖

Original files reviewed (8): `WR`, `F21`, `S6`, `S7`, `S8`, `S16`, `S17`, `S24`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Imperial role / mask | `WR:164-169`; `F21:144`; `S16:236` | Setting names him the Fire God mask holder; records name him a general assigned to border campaign and later command. | Durable equipment/role at reference stage. | Eight General identity PROFILED; explicit Fire God mask-holder status MISSING. Do not project its possession to a later date without a later anchor. |
| Mage Tower aftermath | `S6:487-516`; `S7:211-241`; `S8:41` | Arrives from the air, strikes A with fire, burns surrounding ground and bodies; tells Munetika compassion is boring and goes to report to Emperor. | Major action and casualty-accounting consequence. | Fire attack PROFILED/Worldbook. Single blunt reply and disregard for bodies are scene behavior, SEEN_NOT_PROMOTED as a stable moral value; could be recorded as observed-only if compact RP fidelity requires it. |

`S17,S24` are assignment/retrospective mentions without a separate status change. Unresolved MISSING: Fire God mask holder (`WR:167`), kept as historical reference-stage fact. **Verdict: MISSING_FOUND.**

## NPC_XIERLUN_VON_GILCODE — 谢尔伦·冯·吉尔科德

Original files reviewed (6): `CR`, `WR`, `S15`, `S20`, `T0`, `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Long background | `WR:148-153` | Oldest Frost Dragon King, longtime friend of Emperor, both described as real planners of Empire–Dragon union; helped plan Yu/Youyou engagement; amicable with other kings, balanced dragon factions, respected among tribes. | Durable social/political position and history. | PROFILED specifically in repaired identity and relationship claims; no implied D3 stance. |
| Combat and scholarship | `WR:152-153` | Ancient war combatant against Deathwing/black dragons; age lowered bodily and magical level, but experience and rare objects retain frontline strength; studied other continents and once traveled incognito through Empire/read early imperial library. | Explicit combat boundary and scholarly history. | PROFILED in separate repaired claims, not collapsed into “alliance coordinator.” |
| Proposal / war | `S15:390-455`; `T0` name/roster; `T5:231-283` | Explains engagement plan; later restrains Deathwing, covers Yu's attack and confirms its body defeated. | Historical planner and battle participant. | PROFILED; Yu's acceptance conditions are a cross-profile gap, not evidence of Xierlun's present sentiment. |

`CR` is a character note naming him, and `S20` includes scene interaction/temporary antagonism toward Yu; this does not revise the setting record of his long friendship with Emperor or establish D3 private stance. `T0` roster is navigation. Unresolved MISSING in Xierlun's own effective profile: none found. **Verdict: NO_UNRESOLVED_MISSING.**

## NPC_YOMI_ISAYAMA — 谏山黄泉

Original files reviewed (48): `NR`, `CR`, `F1`, `F2`, `F3`, `F4`, `F5`, `F6`, `F7`, `F8`, `F9`, `F10`, `F12`, `F13`, `F14`, `F15`, `F16`, `F17`, `F18`, `F19`, `F20`, `F21`, `F22`, `F23`, `F24`, `F26`, `F27`, `F28`, `S0`, `S2`, `S3`, `S4`, `S5`, `S6`, `S7`, `S8`, `S9`, `S10`, `S11`, `S12`, `S13`, `S14`, `S15`, `S17`, `S18`, `S19`, `S20`, `T2`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Character reference prehistory | `CR:636-660`; `NR:64-77` | Card states she was adopted by Naraku, raised alongside Kagura, trained as an exorcist, had an engagement to Iizuna Noriyuki that was later broken, lost Naraku and Lion King sword, was severely maimed by Mitogawa and offered a Killing Stone. | Defining background and relationship history *as recorded by this character reference*. | Profile has only exorcist/swordswoman and generic calm/resilient. Most named history and relationship transitions MISSING. Do not add outside-franchise events beyond these lines or assume old goals/engagement remain active. |
| Early campaign / canyon | `F1-F10`, `F12-F20`, especially `F18:428-439,607-611` and `F20:629` | Party travel, skirmishes and canyon reconnaissance; she fights major opponents and suffers then recovers from major injuries. | Campaign companionship and demonstrated combat style. | Broad companionship ROUTED_ELSEWHERE to `output/worldbook_source.jsonl#CHARACTER_YOMI_ISAYAMA`; transient injuries and repeated combat beats SEEN_NOT_PROMOTED as current conditions. |
| Imperial sword return | `F21:575,770-776`; `F22:196-218,283-289`; `F23:129-134` | She says she belongs to the Ninth Unit; Lion King is returned with seal lifted and spirit Ran Kouren accessible, and she communicates with it. | Important equipment/ability transition, not just a skill list. | MISSING. Her retrospective thought about having “died” before arrival is subjective framing; no confirmed current death. |
| Later imperial / dragon mission | `F24,F26-F28`; `S0,S2-S20`; `T2` | Continues to fight/escort; distinct dream sequence `S11-S13` gives her independent branch, while `S14` records Lion King's intervention against Gremlin. | Continued companion role, separately staged dream participation. | Generic companion claim PROFILED; persistent sword/spirit connection remains MISSING. Interlude dream knowledge not carried into main-world present without an explicit transfer. |

Grouped exclusions: `F3-F10,F12-F17,F19-F20,S0,S2-S10,S15,S17-S20` contain combat turns, travel, watch duty, and repeated sword use, not independent durable transitions once role and sword are represented. `S11-S13` is dream activity; `T2` references her in others' recollection rather than proving present location. Unresolved MISSING: card-defined family/engagement/broken engagement and injuries (`CR:648-660`), plus the Lion King/Ran Kouren seal and communication transition (`F22:196-218,283-289`). **Verdict: MISSING_FOUND.**

## NPC_YOUYOU — 悠悠

Original files reviewed (39): `NR`, `CR`, `WR`, `F15`, `F20`, `F21`, `F22`, `F23`, `F24`, `F25`, `F26`, `F27`, `F28`, `S2`, `S3`, `S4`, `S6`, `S7`, `S8`, `S9`, `S10`, `S12`, `S13`, `S14`, `S15`, `S16`, `S17`, `S18`, `S19`, `S20`, `S21`, `S22`, `S24`, `S25`, `T0`, `T2`, `T3`, `T4`, `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Origin / arrival | `WR:112-119`; `F20:10-45`; `NR:171-194` | Reference describes her mother sheltering cursed Ling Chi, human force discovering the hidden Space Dragon sanctuary, clan destruction and her survival; she later arrives at imperial capital during beast plan. | Loss of clan and survival are defining background; perpetrator details beyond reference remain unresolved. | Identity and arrival broadly PROFILED; massacre/survivor history MISSING from profile and the current Worldbook character entry. |
| Sword / curse | `F22:389-485`; `F23-F28`, especially `F28:265-377` | Attempts to stabilize Yu's sword, is burned and dangerously overdrawn; curse manifests, she is detained, then Yu accepts transfer. | Explains major physical danger and how the rescue/curse relationship developed. | Curse transfer PROFILED; sword rescue and detention are MISSING as distinct relationship/history milestones. |
| Engagement proposal | `S15:390-450`; `S17:671-683`; `CR:262,530-541` | Xierlun proposes arrangement; Yu expressly agrees *temporarily* as a shield and asks that her future wishes lead. Honda later publicly calls him her fiancé and claims it followed mutual love. | Public engagement milestone with a limited private response and potentially discrepant public narrative. | Arrangement/public announcement PROFILED; Yu's condition and Honda's `相爱` claim are flattened or not attributed in Youyou's relationship account: MISSING qualification. Her present consent/feelings remain unknown. |
| Name / clan leadership | `S17:671-683`; `WR:112-119` | Honda formally declares her Space Dragon chief and gives ancestor-character `琳`. | Name and status transition. | PROFILED; no automatic power inferred from naming alone. |
| Path of Honor / war | `T2:340-414,457-465`; `T3,T4`; `T5:123-135,257-283` | Light from the predecessor gathers on her; she reports impending destruction and confirms being the last seal; she supplies light that helps awaken Sertain. Later narrator calls Yu's protective light “来自悠悠的保护.” | Prophecy-related knowledge, last-seal position, protection; awakening of Sertain is separate consequential action. | Path/last seal/Yu protection PROFILED; Sertain awakening MISSING. No evidence that name inheritance itself caused these abilities. |
| End / D3 | `T5:5-10`; `current_state.md` | Escorted away before final gem confrontation; present D3 location and future wishes not established. | Alive/continuation anchor. | Present anchor ROUTED_ELSEWHERE to `current_state.md`; no invented current love, consent, or prophecy omniscience. |

Grouped exclusions: `F15,F21,F24-F27,S2-S10,S12-S14,S16,S18-S22,S24-S25,T0` include repeated rescue/curse discussion, escorted travel, social interaction, or dream play. The modern London dream in `S21-S24` does not become ordinary main-world lore. `T3-T4` tactical moves matter where they directly affect Sertain; isolated attacks/positioning do not each merit claims. Unresolved MISSING: clan destruction/survivor background, sword stabilization and detention, limited terms of Yu's initial response/attribution of Honda's public `相爱` assertion, and light-assisted awakening of Sertain. **Verdict: MISSING_FOUND.**

## NPC_ZHENZI — 贞子

Original files reviewed (19): `NR`, `CR`, `F17`, `F20`, `F21`, `F22`, `F23`, `F24`, `F25`, `S7`, `S8`, `S15`, `S16`, `S17`, `S19`, `S20`, `T2`, `T3`, `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Earlier aid | `CR:247-254`; `NR:49-53`; `F17,F20-F21` | Yu's retrospective account says she saved him several times; narrative reference identifies her as a wandering ghost, not his established lover. | Rescuer bond. | PROFILED as history; his subjective descriptions remain attributed to Yu. |
| Border fall / loss | `F22:438-465`; `F24:219-227`; `F25:21-26` | Injured by Yellow Calamity Dragon Wolf, offers Han Nuo everything to keep Yu alive; later Yu confirms she died. | Death and Yu's restored memory. | PROFILED; deceased/historical-only presence preserved. |
| Later remembrance / dream | `S7-S8,S15-S20`; `T2-T3`; `T5:175-213` | Yu repeatedly recalls her. `T5` explicitly presents a dream created by the sword sequence, in which she appears and does not speak. | Yu's remembrance, not proof of resurrection. | SEEN_NOT_PROMOTED as a living presence or new Zhenzi action. |

`F23`, `S16-S20`, `T2-T3` are Yu's comparisons, hopes, and suspicions; they do not establish Zhenzi's post-death cognition or action. Unresolved MISSING: none. **Verdict: NO_UNRESOLVED_MISSING.**

## NPC_ZHOU_ZHENG — 周正

Original files reviewed (1): `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| Special Interlude seminar | `T5:583-680` | Introduces himself as a Great Hangzhou ghost-controller, teaches the four ghost principles as his own claims, displays swollen/necrotic abdomen containing ghost infant. | Interlude identity and demonstrated condition. | Identity PROFILED; body/ghost condition ROUTED_ELSEWHERE to `output/worldbook_source.jsonl#CHARACTER_ZHOU_ZHENG`, which explicitly records it. Principles remain attributed/interlude only. |
| Knocking Elder attack | `T5:766-848` | Calls for help on golden phone, extends ghost infant limbs to suppress Elder briefly, tells meeting participants to flee. | Consequential interlude rescue and limit of his control. | ROUTED_ELSEWHERE to same Worldbook entry, which records exact event; incomplete dream gives no later outcome. |

`T5:849-end` provides escape reactions, not a confirmed later state for Zhou; the profile correctly keeps him `special_interlude_only`. No main-world projection. Unresolved MISSING: none because the authoritative Worldbook character entry preserves both major history and condition, though profile projection should fetch that entry when interlude play is relevant. **Verdict: NO_UNRESOLVED_MISSING.**

## PC_YU_LINFENG — 御临风

Original files reviewed (61): `NR`, `CR`, `WR`, `F1`, `F2`, `F3`, `F4`, `F5`, `F6`, `F7`, `F8`, `F9`, `F10`, `F11`, `F12`, `F13`, `F14`, `F15`, `F16`, `F17`, `F18`, `F19`, `F20`, `F21`, `F22`, `F23`, `F24`, `F25`, `F26`, `F27`, `F28`, `S0`, `S2`, `S3`, `S4`, `S5`, `S6`, `S7`, `S8`, `S9`, `S10`, `S11`, `S12`, `S13`, `S14`, `S15`, `S16`, `S17`, `S18`, `S19`, `S20`, `S21`, `S22`, `S23`, `S24`, `S25`, `T0`, `T2`, `T3`, `T4`, `T5`.

| Stage | Original source | What happened | Persistent consequence | Effective representation / classification |
|---|---|---|---|---|
| PC background / early bonds | `CR:229-254`; `NR:38-62`; `F1-F21` | His card names sword teacher Yi Leng, Snow Elder as mentor/friend, Zhenzi as rescuer; he recounts 698 dead under his command and felt responsibility. | Defining historical bonds and a *past self-statement*, not D3 emotion or obligation. | Zhenzi relationship PROFILED; Yi Leng/Snow Elder relation and 698-person historical burden MISSING from full PC profile (Worldbook only gives broader identity). |
| Memory, sword, curse | `F22:417-465`; `F23-F28`, especially `F28:265-377`; `S0,S2-S9` | William restores feelings/border memory erased after Han Nuo deal; Yu transfers Youyou's curse and later gains Jerg representative status. | Major memory/knowledge and externally imposed status changes. | Curse/Jerg PROFILED; precise memory erasure and restoration MISSING from PC `established_history` or epistemic continuity (Zhenzi relation only alludes to restoration). |
| Empire / dragon mission | `S9:87-120`; `S15:390-450`; `S17:671-683`; `S18-S20` | Wosis interrogates him; Xierlun presses a marriage arrangement. Yu says he can **temporarily** accept as a shield, asks for time to know prior suitor and explicitly says Youyou's later wishes must prevail. Honda publicly announces fiancé status and states they love each other. | Historical acceptance with narrow conditions plus a separately attributable public announcement. | Repaired profile's `CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY` says unqualified `接受...婚约安排`; relationship milestone similarly compresses it. MISSING qualification and risk of overstated consent. Honda's `相爱` is his claim, not independent evidence of Yu's feelings. |
| Sanctuary / Deathwing | `T0,T2-T5`, especially `T2:340-414`; `T5:123-135,231-283` | Yu witnesses Youyou's last-seal revelation, receives her protective light, fights Deathwing with Xierlun. | Shared history/external protection. | PROFILED without granting future protected charges or autonomous combat. `T5:257` is Yu's own theory about ancestral spirit, not proof of a separate permanent power grant. |
| D3 / dream boundary | `current_state.md`; `S21-S24`; `T5:580-end` | D3 anchor follows evacuation; modern London and modern supernatural dream scenes are interlude material. | Main-world PC knowledge is not enlarged automatically. | `current_state.md` ROUTED_ELSEWHERE; dream material SEEN_NOT_PROMOTED absent explicit carry-back. |

Grouped exclusions: `F2-F19` repeated movement/combat, puzzle detail and damage rolls; `S2-S8,S10-S14,S18-S20` momentary tactics, suspicions and rules mechanics; `S21-S24` a modern-setting dream branch; `T0,T3-T4` tactical discussions and speculative cosmology. They are not free-standing PC future instructions. The repaired profile remains `control_mode=user_controlled`; its autonomy permissions (`may_generate_dialogue`, `may_choose_voluntary_actions`, `may_generate_private_thoughts`, `may_assign_new_goals`) must stay false. Even recorded past speech/choices do not authorize generated dialogue, voluntary action, thought, emotion, consent, or a future marriage decision. Unresolved MISSING: Yi Leng/Snow Elder relationship milestones and 698 dead as attributed past perspective, memory erasure/restoration as status/knowledge history, and the PC's conditional temporary acceptance of the engagement. **Verdict: MISSING_FOUND.**

## Cross-profile checks and priorities

1. The `S15:429-436` conditional acceptance and `S17:671-676` public announcement must be represented without conflating their perspectives in `PC_YU_LINFENG`, `NPC_YOUYOU`, and the Xierlun-linked engagement history. A public declaration of mutual love does not prove either child's private present feeling.
2. The `S20` White Magician encounter is factory pursuit → cave confrontation. His Prison Tower imprisonment belongs to `WR:123-125`. The repaired White Magician profile still has one wrong location context in the Yu relationship claim.
3. Sertain's mask incapacity/awakening (`T2`) intersects Youyou's light assistance and sanctuary battle. Both effective profiles currently omit that historical crossover.
4. No source licenses an NPC profile to choose Yu's next action, speech, thoughts, emotions, consent, or goals. `T5:187-213` is a sword-induced dream of Zhenzi, not her resurrection; `T5:580-end` is Special Interlude, not ordinary D3 main-world lore.

The batch has unresolved source-backed claims. **Batch verdict: MISSING_FOUND.**

## Post-repair resolution (independent recheck)

The earlier `MISSING_FOUND` labels above record the *pre-repair* audit and are retained as its history. This section checks the present effective candidate under the same source and scope rules. A claim mentioned below was inspected with its claim text, source references, attribution and temporal exceptions; a claim's mere existence was not treated as sufficient.

### NPC_SERTANT_LU_YOURLAN

`CLAIM_SERTANT_NANCY_HISTORY` preserves the character reference's recorded killing of Nancy without adopting its tentative friendship claim. `CLAIM_SERTANT_MASK_AWAKENING` now records Xierlun/Honda's mask choice, temporary sleep, Youyou's light, awakening, activation and battle participation; its exception keeps the proposed sleep mechanism attributed to Youyou. The two earlier unresolved items are covered. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_TOLKIEN

No repair was required. The original three-file source set, equipment support and Worldbook-routed Snow Elder/Lulutie closeness remain represented as described above; no new independent durable profile claim was found. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_WHITE_MAGICIAN

`CLAIM_WHITE_MAGICIAN_WIZARD_PHANTOM_HISTORY` now separates the dated Wizard Driver/Phantom activity from the D3 state and leaves motive unknown. `CLAIM_WHITE_MAGICIAN_YU_HISTORY.context` now says `地下兵工厂追击与龙族秘境终局`; the erroneous Prison Tower label is gone while `CLAIM_WHITE_MAGICIAN_ESCAPE_HISTORY` retains imprisonment as a separate earlier event. Both earlier unresolved items are covered. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_WILLIAM

`CLAIM_WILLIAM_FULL_NAME` now quotes his self-introduction as `威廉信长` and cites `F22:369-375`, resolving the missing prose claim. However the effective profile still has `name=威廉` and `aliases=[威廉大人]`; the confirmed full name is absent from its structured identity/alias fields, and `output/worldbook_source.jsonl#CHARACTER_WILLIAM` still lacks it. A lookup by `威廉信长` can therefore miss the character despite the prose claim. Remaining MISSING: add the source-confirmed full name to the reviewable identity/alias path or document an equivalent deterministic lookup; do not import the unrelated `S20` Shakespeare hit. Post-repair verdict: **MISSING_FOUND**.

Final closure: the effective candidate now has `aliases=[威廉大人, 威廉信长]`. Together with `CLAIM_WILLIAM_FULL_NAME` and its `F22:369-375` source, the structured profile can match the confirmed full name. The earlier profile-level retrieval gap is closed; the Worldbook's separate alias state is outside this profile-only resolution. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_WOSIS

No repair was required. `CLAIM_WOSIS_IDENTITY`, `CLAIM_WOSIS_INTERROGATION`, the Yu relationship and knowledge item still cover the source-backed mission/interrogation stages. The broader administrative and intelligence role is explicitly retained in `output/worldbook_source.jsonl#CHARACTER_WOSIS`, with no extra cognition inferred from Yu's suspicions. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_WURAI

`CLAIM_WURAI_FIRE_MASK` now records the setting reference's Fire God mask-holder role and limits it to the reference stage; the profile also retains the Mage Tower action in `CLAIM_WURAI_HISTORY_1`. The earlier unresolved mask item is covered without asserting D3 possession. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_XIERLUN_VON_GILCODE

No new repair was required. `CLAIM_XIERLUN_ALLIANCE_AND_ENGAGEMENT_PLANNING`, `CLAIM_XIERLUN_DRAGON_BALANCE_ROLE`, `CLAIM_XIERLUN_COMBAT_BACKGROUND`, and `CLAIM_XIERLUN_SCHOLARLY_HISTORY` still keep the full setting background separate. `CLAIM_XIERLUN_ENGAGEMENT_RELATIONSHIP` preserves his proposal; the conditions of Yu's reply are carried in the PC profile and must not be converted into Xierlun's current stance. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_YOMI_ISAYAMA

`CLAIM_YOMI_REFERENCE_BACKGROUND` now stores the character-reference family, adoption, broken engagement and injury history as reference-defined *past* background with an explicit no-outside-franchise/no-current-status exception. `CLAIM_YOMI_LION_KING_TRANSITION` records the unsealed Lion King and communication with Ran Kouren from `F22`, without treating dream material as present-world knowledge. The earlier unresolved items are covered. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_YOUYOU

`CLAIM_YOUYOU_CLAN_SURVIVOR_HISTORY`, `CLAIM_YOUYOU_SWORD_AND_DETENTION`, and `CLAIM_YOUYOU_SERTANT_AWAKENING` cover the clan-loss, sword/curse/detention, and Sertain awakening omissions. The engagement gap is only partly repaired across profiles: `PC_YU_LINFENG.CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY` now states Yu's temporary protective acceptance, but `NPC_YOUYOU.CLAIM_YOUYOU_ENGAGEMENT_HISTORY` and `CLAIM_YOUYOU_YU_LATE_MILESTONES` still compress the relationship to `婚约安排及仪式公开确认`. They do not preserve that Yu's private response was conditional, and do not explicitly mark Honda's `相爱之后定下的约定` as *his public assertion*, distinct from evidence of either party's feelings. The generic no-current-consent exception does not recover the historical limitation. Remaining MISSING: qualify the Youyou relationship's historical engagement milestone or route it expressly to the qualified PC claim; preserve Honda's attribution. Post-repair verdict: **MISSING_FOUND**.

Final closure: `CLAIM_YOUYOU_ENGAGEMENT_HISTORY` and `CLAIM_YOUYOU_YU_LATE_MILESTONES` now state that Yu accepted only temporarily as a protective measure and preserved Youyou's later choice. Both distinguish Honda's public assertion of mutual love from independently established feelings, with explicit exceptions against inferring D3 consent or future marriage intent. The earlier relationship-history qualification gap is closed. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_ZHENZI

No repair was required. The rescue, death, and Yu relationship claims remain; `presence.life_status=deceased` and `narrative_availability=historical_only` still prevent the `T5` sword dream from becoming a resurrection. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### NPC_ZHOU_ZHENG

No repair was required. His witnessed ghost-infant condition and brief resistance to the Knocking Elder remain explicitly in `output/worldbook_source.jsonl#CHARACTER_ZHOU_ZHENG`; the profile stays `special_interlude_only`. The unfinished dream supplies no confirmed later outcome or main-world presence. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

### PC_YU_LINFENG

`CLAIM_YU_LINFENG_EARLY_BONDS` now records Yi Leng/Snow Elder and attributes the 698-dead responsibility to Yu's past self-statement. `CLAIM_YU_LINFENG_MEMORY_RESTORATION` records the Han Nuo removal and William's restoration. `CLAIM_YU_LINFENG_ENGAGEMENT_HISTORY` and `CLAIM_YU_LINFENG_YOUYOU_LATE_HISTORY` now explicitly say temporary, protective acceptance and retain Youyou's later choice; Honda's public fiancé announcement stays a separate attributed event. No current feeling, consent, obligation, or future marriage choice follows. `control_mode=user_controlled` and all four autonomous `ai_permissions` remain `false`. The earlier PC-specific missing items are covered. Post-repair verdict: **NO_UNRESOLVED_MISSING**.

Post-repair batch verdict: **MISSING_FOUND** — William structured full-name retrieval and Youyou engagement-history qualification remain unresolved. No profile, code, Canon, or other output was edited in this independent recheck.

Final closure for batch C: both blockers named in the preceding historical post-repair verdict were checked again against the effective repaired candidates and are resolved as documented in their sections. Final post-repair batch verdict: **NO_UNRESOLVED_MISSING**.
