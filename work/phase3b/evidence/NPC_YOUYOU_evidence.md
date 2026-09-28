# NPC_YOUYOU Evidence Packet

Status: evidence collection only; not a canonical profile database.

## Identity Evidence

- Source: `设定 人物/妄想大陆设定集_检索版.md:112-119`; evidence: 悠悠被记为十一岁的空间龙与精灵混血变异体，并能在人形与幼龙形态间变化； candidate field: `identity.public_identity`; evidence mode: explicit source statement; confidence: direct setting statement.
- Source: `设定 人物/妄想大陆设定集_检索版.md:112-119`; evidence: 本名“芬尔德·特兰希尔”，龙族秘境后继承“琳”而成为“芬尔德·琳·特兰希尔”； candidate field: `aliases` and `identity.established_history`; evidence mode: explicit source statement; confidence: direct, but names mark stages rather than spelling variants.
- Source: `设定 人物/人物卡资料集_叙事检索版.md:171-194`; evidence: 人物卡以“芬尔德·特兰希尔／悠悠”定位该角色； candidate field: `name`, `aliases`; evidence mode: authorial definition; confidence: direct character reference.

## Personality Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:171-194`; evidence: 人物卡定义其沉静、少言，行动往往比语言直接； candidate field: `core_personality`; evidence mode: authorial definition; confidence: explicit authorial description, not inferred from age.

## Values Evidence

No source cleanly states a durable value hierarchy. Helping 御临风 and 雪老 is retained as history, not generalized into altruism.

## Speech Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:171-194`; `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:13-45`; evidence: the reference says she is laconic and the palace scene uses brief, direct replies; candidate field: `speech_style`; evidence mode: authorial definition with campaign corroboration; confidence: strong for brevity, not for every emotional context.

## Decision Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:171-194`; evidence: she previously rescued the injured 御临风 and 雪老; candidate field: historical action only, not a general decision rule; evidence mode: explicit source statement; confidence: direct history.

## Relationship Evidence

- Source: `设定 人物/人物卡资料集_叙事检索版.md:171-194`; `extracted-first/28/posts.md:265-377`; evidence: she saved 御临风 and 雪老, and 御临风 later accepted the curse transfer to preserve her life; candidate field: `relationships[CHARACTER_YU_LINFENG]`; evidence mode: explicit source statement / observed campaign event; confidence: high for shared history, insufficient for an unrestricted current emotional label.

## Knowledge Evidence

The record does not clearly establish what 悠悠 consciously learned during the curse-transfer sequence; she was incapacitated for material parts of it. No knowledge item is promoted from reader knowledge.

## Goal Evidence

No durable current or long-term goal is explicitly supported. The prototype keeps all goal arrays empty.

## Dynamic State Evidence

- Source: `current_state.md:D1-D3`; `output/worldbook_source.jsonl#CHARACTER_YOUYOU`; evidence: her name inheritance and evacuation-linked continuity precede the D3 anchor; candidate field: `dynamic_state`; evidence mode: continuation anchor plus canonical history; confidence: exact current location and immediate concerns are not stated.

## Presence Evidence

- Source: `current_state.md:D1-D3`; `output/worldbook_source.jsonl#CHARACTER_YOUYOU`; evidence: the current baseline contains no death or disappearance state and preserves her as a continuing character; candidate field: `presence`; evidence mode: continuation anchor; confidence: alive is supported by the current continuity, but scene-level availability remains selector-dependent.

## Contradictions / Ambiguities

- The three names are stage-bearing. They must not be flattened into pure spelling aliases.
- The setting calls her the first dragon to truly join the Empire, but this does not by itself establish political opinions or loyalty in every scene.

## Evidence Gaps

- No source-confirmed current goal.
- No precise D3 location.
- No sufficiently explicit knowledge boundary for the unconscious curse-transfer interval.
- No evidence for a broad moral-value summary beyond recorded actions.
