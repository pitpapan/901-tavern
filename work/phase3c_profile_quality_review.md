# Phase 3C Profile Quality Review

## Review method

All 31 generated candidates were reviewed against questions A–N from the Phase 3C specification. The review is conservative: an empty field is a valid result when the campaign evidence does not support it.

The following checks apply to every candidate:

| Question | Result for all 31 candidates |
|---|---|
| B — stable traits sufficiently supported | Pass with bounded coverage. Seven stable personality claims use direct Campaign setting or authorial-supplement character definitions; authorial definitions are explicitly marked as such, and conditional voice/value/decision claims retain explicit limits. Most profiles remain sparse. |
| C — single-scene overgeneralization | Pass. Six single-scene action claims remain `single_observed_behavior` + `observed_only`; none became a stable personality or universal decision rule. |
| G — schema fields filled merely because present | Pass. Personality, values, speech, decision, knowledge, and goal arrays remain empty where evidence is insufficient; populated fields are statement-level sourced. |
| I — identity versus dynamic state | Pass. Stable identity/history are separate from D3 state and presence. |
| J — depth versus narrative importance | Pass. Depth follows the reviewed runtime role and never forces importance or scene presence. |
| K — indirect PC control | Pass. NPC permissions cannot assign goals to or summarize actions for 御临风; relationship history grants no PC control. |
| L — outside-franchise/model knowledge | Pass. Names with external inspirations received no outside-work facts, voice, motives, or abilities. |
| M — belief/rumor/public claim promoted to fact | Pass. Investigation notes, inferred motives, rumors, cosmology, and future visions remain constrained or omitted. |

## Per-profile A, D, E, F, H, N review

Here, A is distinguishability; D is what remains unknown; E is the main leakage risk; F checks relationship inflation; H states runtime value beyond a Worldbook paragraph; N judges fitness for the intended activation policy.

| Profile | A | D | E | F | H | N |
|---|---|---|---|---|---|---|
| NPC_CASSIUS_BRIGHT | Blind hunter, scout, and ranged-support history distinguish him | voice, values, D3 state | outside-franchise and inferred loyalty | companion history only | presence, evidence gaps, PC-safe relation | conditional full; sparse voice must remain sparse |
| NPC_HAKU | amnesiac strategist and command history distinguish him | identity mystery, voice breadth, D3 state | outside-franchise identity completion | Kuon/Oshutoru history only | role and relationship boundaries | conditional full; no invented banter |
| NPC_YOMI_ISAYAMA | exorcist and independent action line distinguish her | cross-context voice and current stance | outside-franchise biography | companion history only | preserves independent agency without PC control | conditional full |
| NPC_ELDER_XUE | retired border veteran and Brotherhood history distinguish him | D3 location and current obligations | converting mentorship into obedience | protection/advice history only | deceased-relative and retirement continuity | conditional full |
| NPC_JIANG_ZIYOU | martial breakthrough and identity-mistaking history distinguish him | stable values, voice, current status | comic framing becoming personality law | companion history only | consequential-action scope | conditional full |
| NPC_AINZ_OOAL_GOWN | sanctuary intervention and magic role distinguish him | long-term alignment and current agenda | outside-franchise lore and alliance assumptions | no emotional relation asserted | active-state and alliance constraint | sufficient only with sparse-field guard |
| NPC_XIERLUN_VON_GILCODE | ice dragon king, coordinator, and battle history distinguish him | post-evacuation state and politics | title-based political inference | Emperor friendship is history only | transition-aware presence | conditional full |
| NPC_OSHUTORU | imperial general and verified actions distinguish him | private motives and D3 state | identity/title used to invent politics | Haku command relation only | role-bound continuity | conditional full |
| NPC_MU_SHAOAI | healer-investigator and curse work distinguish him | values, voice breadth, current work | helpful actions becoming unconditional loyalty | healer relation only | explicit treatment and investigation scope | conditional full |
| NPC_WOSIS | mission authority and interrogation history distinguish him | private belief and lasting stance | interrogation becoming personality certainty | examiner relation only | strict information-boundary constraint | conditional full |
| NPC_DEATHWING | current-body battle facts distinguish it | permanent death and metaphysics | immortality and ancient-god claims | adversary history only | restricted presence and body-death boundary | conditional full; never auto-reactivate |
| NPC_KENDA_KAI_FERGUS | kinship and banquet contact distinguish him | life-status investigation and politics | character notes becoming world fact | son relation only | investigation-note boundary | conditional full |
| NPC_CASSANDRA | observed negotiation and item transfer distinguish her | purpose, prophecy, assassination claims | future vision and inference leakage | none asserted | action/inference partition | conditional full |
| NPC_JERGAL | curse/contract connection distinguishes the entry | objective cosmology, voice, current agency | belief and proxy knowledge leakage | none asserted | restricted cosmology boundary | conditional full; knowledge must stay sparse |
| NPC_ZHENZI | rescue, sacrifice, and memory continuity distinguish her | fuller voice and any post-death agency | resurrection or false-name leakage | relation records sacrifice, not current emotion | historical-only relationship continuity | sufficient for historical projection only |
| NPC_ELLIE | healer and magical-support actions distinguish her | stable voice and present state | virtue labels restored as fact | none asserted | compact support scope | sufficient compact |
| NPC_KUON | healer, rescuer, and guardian history distinguish her | current agenda and broad voice | outside-franchise elaboration | guardian history only | compact relationship boundary | sufficient compact |
| NPC_MU_TOU | Wizard-driver history distinguishes him | personal motives and present alignment | shared-goal inference with White Magician | none asserted | explicit cooperation boundary | sufficient compact |
| NPC_LEI_GUANG | recorded strategic counteroffensive distinguishes him | private politics and present agenda | competence becoming universal foresight | none asserted | command-history scope | sufficient compact |
| NPC_HONDA_KAI_FERGUS | red-flame dragon king and banquet role distinguish him | politics and post-evacuation state | title-based faction stance | father relation only | transition-aware compact scope | sufficient compact |
| NPC_OSHIRA | black-dragon clan leader and limited offer of help distinguish him | actual political stance and current state | one offer becoming permanent allegiance | none asserted | explicit anti-inference constraint | sufficient compact |
| NPC_WURAI | documented fire attack distinguishes him | motive, stable temperament, current state | attack becoming preferred behavior | none asserted | consequence-preserving history | sufficient compact |
| NPC_LULUTIYE | Snow Elder kinship and disaster trauma distinguish her | current memory/state and voice | trauma used as permanent behavior prompt | granddaughter history only | memory-treatment boundary | sufficient compact |
| NPC_GREMLIN | Phantom role, conflict, execution, and burial distinguish him | motives and voice | living-enemy reactivation | none asserted | deceased historical constraint | sufficient historical compact |
| NPC_NOSURI | pursuit and ranged-support actions distinguish her | values, voice, present state | competence becoming stable personality | none asserted | compact action history | sufficient compact |
| NPC_LINGCHI | invasion, disguise, exposure, and execution distinguish him | inner motives beyond recorded choice | current Dakas identity or living status | none asserted | deceased/disguise boundary | sufficient historical compact |
| NPC_WILLIAM | healing and curse-transfer work distinguish him | motives, voice, current practice | helpful action becoming loyalty | none asserted | ritual-role continuity | sufficient compact |
| NPC_JEWEL_ELDER | curse-transfer conditions and ritual role distinguish him | broader identity, motives, current state | outside-franchise completion | none asserted | precise ritual scope | sufficient compact |
| NPC_REN_FANZHEN | special-interlude agent role distinguishes him | unfinished dream outcome and temperament | main-world leakage | none asserted | realm isolation | sufficient only inside interlude |
| NPC_ZHOU_ZHENG | special-interlude ghost-controller role distinguishes him | unfinished outcome and stable personality | main-world leakage | none asserted | realm and condition isolation | sufficient only inside interlude |
| NPC_SERTANT_LU_YOURLAN | confirmed elemental-dragon identity distinguishes him | almost all RP traits and current state | title-based politics and outside lore | none asserted | minimal safe mapping | sufficient minimal; remain Worldbook-only until promoted |

## Overall finding

The candidates are structurally safe for human review. Available Campaign evidence and explicitly labeled authorial-supplement definitions for personality, voice, value, and observed action were retained, while unsupported fields remain intentionally sparse. This is a fidelity limitation, not a validation error. Human reviewers should not approve richer RP behavior unless additional Campaign evidence is supplied.
