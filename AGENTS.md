# Canonical Campaign Database Rules

This project maintains a canonical data source for a long-running TRPG campaign. It is not a novel generator, a plot-continuation engine, or a place to make the setting more internally convenient.

## Canon discipline

- Never invent lore, missing motives, relationships, powers, history, or explanations.
- Never promote a character's inference, suspicion, rumor, lie, mistaken belief, or internal monologue into world fact.
- Preserve uncertainty explicitly with `confirmed`, `uncertain`, `rumor`, or `character_belief`.
- Preserve provenance. Every formal worldbook entry needs at least one precise source reference; conflicting sources remain documented rather than silently reconciled.
- Source authority depends on the field: setting references guide world/faction/concept facts, character references guide identity and background, campaign records guide events, and `current_state.md` governs the continuation-time state.
- A continuously updated setting or character reference may contain facts from a later historical stage. Its presence does not make the fact true at every earlier point.

## Current State and World Book

- `current_state.md` answers “where the story is now.” Do not overwrite or mechanically split it into worldbook entries.
- The world book answers “what persistent entities, places, organizations, concepts, and consequential historical events exist.”
- If present state and historical detail appear to conflict, use `current_state.md` for the present anchor and return to the campaign record for historical facts.

## Entry scope

- Use only these entry types: `world`, `faction`, `location`, `character`, `concept`, `event`.
- One entry covers one core topic.
- A character worldbook entry is not a roleplay card. Keep public identity, durable relationships, important history, and world position; omit full personality prompts and skill lists.
- Historical event entries state what happened, the result, and the continuing effect. Do not add literary interpretation.
- Do not create entries per forum post, per skill, or per minor action beat.
- Trigger keys contain only the formal name, common short name, and confirmed aliases. Avoid generic high-frequency words.

## Canon layers and dream material

- Facts explicitly recorded in the original campaign are Original Campaign Canon.
- Only the minimum agreed bridge around the destruction of the dragon sanctuary is Transition Canon.
- New play after the third day following that destruction is Continuation Canon.
- The unfinished special dream is Original Campaign / Special Interlude material, but its modern supernatural setting is not ordinary present-day main-world lore.
- Dream rewards, knowledge, and cosmological implications enter main-world canon only when the campaign record explicitly carries them back.

## Automation and review

- Every automatic result is provisional and must support human review.
- Candidate extraction identifies possible entries; it does not write canonical entry prose.
- Scripts must never directly overwrite human-reviewed candidates or formal reviewed entries.
- Validators report errors and warnings but never rewrite source data.
- Near duplicates, aliases, name conflicts, source conflicts, uncertain types, and granularity concerns must be surfaced for review rather than silently decided.
- Do not generate `output/worldbook_source.jsonl` until the candidate list has been reviewed and the second phase is explicitly requested.
