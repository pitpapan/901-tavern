# PC_YU_LINFENG Evidence Packet

Status: PC continuity only. Evidence does not authorize AI control.

## Identity Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:38-80`; evidence: 御临风 is a fourteen-year-old from the real world who became involved in the war on 飘零大陆; candidate field: `identity.public_identity`; evidence mode: authorial definition; confidence: direct character reference.
- Source: `output/worldbook_source.jsonl#CHARACTER_YU_LINFENG`; evidence: he acts as swordsman, investigator, and later 耶各's agent after accepting the curse; candidate field: `identity.durable_roles` and history; evidence mode: confirmed canonical history; confidence: stable history, not a future action instruction.
- Source: `output/worldbook_source.jsonl#CHARACTER_YU_LINFENG`; `current_state.md:D0`; evidence: during the Original Campaign he escorted 悠悠 into the dragon sanctuary and, with 谢尔伦, defeated Deathwing's current body; candidate field: `identity.established_history`; evidence mode: explicit source statement; confidence: confirmed Original Campaign history, not permanent death.
- Source: `current_state.md:D0-D1`; evidence: after the sanctuary's destruction he completed the transition-stage evacuation; candidate field: `identity.established_history`; evidence mode: explicit source statement; confidence: confirmed Transition history, kept separate from the preceding Original Campaign event.

## Personality Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:38-80`; evidence: the character reference defines responsibility, sentiment, stubbornness, decisiveness, and idealism; candidate field: `core_personality`; evidence mode: authorial definition; confidence: explicit but archival; runtime projection must not use it to choose future actions.

## Values Evidence

- Source: `extracted-first/27/posts.md:224-269`; evidence: in that decision, 御临风 rejects sacrificing 悠悠 for strategy and asks to bear the curse himself; candidate field: historical value evidence; evidence mode: single observed behavior; confidence: strong for that event, not permission to predict every future choice.

## Speech Evidence

No speech-style field is populated. Even a well-supported style could become an unauthorized dialogue generator for a user-controlled PC.

## Decision Evidence

- Source: `extracted-first/27/posts.md:224-269`; `extracted-first/28/posts.md:265-377`; evidence: he voluntarily accepts the curse transfer after stating that he wants to live and has unfinished debts; candidate field: `decision_patterns` as historical episode; evidence mode: single observed behavior; confidence: objective past action only.

## Relationship Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:38-80`; `extracted-first/28/posts.md:265-377`; evidence: 悠悠 earlier saved him and 雪老, and he later accepts her curse; candidate field: `relationships[CHARACTER_YOUYOU]`; evidence mode: explicit history and observed event; confidence: high shared-history depth, no automated current emotion.
- Source: `设定 人物/人物卡资料集_叙事检索版.md:38-80`; evidence: 贞子's death and his later memory recovery are persistent continuity; candidate field: `relationships[CHARACTER_ZHENZI]`; evidence mode: authorial definition / canonical history; confidence: relationship history is explicit; current grief intensity must not be generated.

## Knowledge Evidence

- Source: `extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:#225-#229`; evidence: he hears 白色魔法使's public claims and cosmological theory and voices his own inferences; candidate field: `epistemic_state`; evidence mode: observed campaign cognition; confidence: he knows the statements were made, while the theory remains unverified.

## Goal Evidence

- Source: `extracted-first/28/posts.md:265-377`; evidence: he declares that he wants to live, take revenge, and settle debts before accepting the curse; candidate field: `goals.declared_goals`; evidence mode: player-declared; confidence: historical declaration; current status is unknown and not continuation-confirmed.

## Dynamic State Evidence

- Source: `current_state.md:D3`; `output/worldbook_source.jsonl#CHARACTER_YU_LINFENG`; evidence: after the dragon-sanctuary transition he is alive, has completed evacuation, and retains the established 耶各-agent continuity; candidate field: `dynamic_state`; evidence mode: continuation anchor; confidence: exact location, voluntary next move, and present emotion are not stated.

## Presence Evidence

- Source: `current_state.md:D3`; evidence: 御临风 remains the user-controlled protagonist at the D3 continuation anchor; candidate field: `presence`; evidence mode: continuation anchor; confidence: alive/normal continuity, with absolute PC-control restriction.

## Contradictions / Ambiguities

- Character-card personality definitions are continuity metadata, not an AI license to perform the PC.
- Past declarations about revenge or debts are not automatically active current goals.
- His inferences about 帝, 白色魔法使, fate, or cosmology remain character cognition unless separately confirmed.

## Evidence Gaps

- No confirmed continuation goal after D3.
- No exact D3 location or present emotional state.
- No authorization to generate dialogue, voluntary action, private thought, emotion, decision, or new goal.
- Knowledge acquired during the special interlude must remain isolated from main-world continuity unless explicitly carried back.
