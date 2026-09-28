# Profile Runtime Projection Contract

## Scope

This contract defines a read-only projection from reviewed character profiles into a future runtime context. It does not define a SillyTavern export, Character Card, prompt, or retrieval implementation.

Projection never mutates a profile, changes Canon, promotes a character, creates goals, or selects future plot. It returns only the minimum source-supported fields needed for the current scene.

## Inputs

A projection request may include:

- profile ID and Worldbook character ID;
- scene participation state (`active`, `supporting`, or `inactive`);
- scene canon layer and realm;
- requesting perspective;
- permitted visibility classes;
- current continuation anchor;
- requested knowledge subjects.

The projector must first enforce life status, narrative availability, realm scope, visibility, and knowledge partition. A missing source or failed guard means omission, not inference.

## NPC projections

### Active / full

Used only when an NPC with `full_when_active` is actually participating. It may include:

- identity reference and public/durable roles;
- sourced core personality, values, speech style, and decision patterns with contexts and exceptions;
- relevant objective relationship history and the NPC's current stance;
- scene-relevant public and private goals;
- only the knowledge items available to this NPC;
- character-scoped dynamic state;
- RP constraints and evidence gaps relevant to the scene.

It must not include unrelated secrets, every historical event, other characters' private stances, Director material, or future-importance metadata.

### Supporting / compact

Used for a supporting NPC or a compact profile. It includes only:

- identity and current role;
- one or more directly relevant behavioral/voice constraints;
- scene-relevant relationship stance;
- immediately relevant goal and knowledge boundaries;
- presence and current condition needed to avoid continuity error.

The projection must not flatten nuance into a global trait. Context and exceptions travel with any selected claim.

### Inactive / Worldbook-only

Used for `worldbook_until_promoted`, inactive, missing, historical-only, restricted, or out-of-realm profiles. It normally returns:

- Worldbook identity reference;
- presence/availability guard;
- a reason the profile body was not projected.

A deceased historical character may be retrieved for established history but may not be projected as a currently acting speaker. A Special Interlude-only character may not be projected into ordinary main-world runtime.

## PC continuity projection

PC projection is always continuity-only, regardless of depth:

- identity and established history references;
- objective relationships and previously declared relationship facts;
- current objective conditions and externally established state;
- knowledge items available to the PC;
- player-declared or confirmed-continuation goals;
- the complete fixed no-autonomy permission block.

It excludes generative speech style instructions, next-action recommendations, private-thought completion, emotion assignment, inferred goals, and decision simulation. A richer PC profile improves recall; it never increases AI control.

## Knowledge partition algorithm

For each candidate knowledge item:

1. Verify that the profile owns the item.
2. Verify the scene/perspective visibility.
3. Preserve `knows`, `believes`, `suspects`, `does_not_know`, or `secrets` exactly.
4. Include acquisition context when it prevents timeline leakage.
5. Do not include the corresponding objective world fact unless separately authorized by the Worldbook/runtime layer.

Belief and suspicion stay attributed. Explicit non-knowledge prevents the runtime from filling the gap. Secret visibility does not imply objective truth.

## Context budget and isolation

Projection should select claims by direct scene relevance, not profile order or profile depth. It must avoid:

- context overload from dumping whole profiles;
- personality bleed between similarly named characters;
- alias-based identity merging without reviewed mapping;
- knowledge leakage between characters;
- carrying Special Interlude material into the main world;
- treating old dynamic state as current after a newer continuation anchor;
- using historical-only characters as active agents.

`profile_depth` is not a retrieval priority. `activation_policy` is a ceiling, not a promise of scene presence.

## Update and promotion boundary

Runtime observations may be written only to a review queue or continuation record. They cannot automatically become stable traits or profile updates. Promotion from minimal/compact to full, reduction, activation-policy changes, new knowledge, new goals, and presence changes all require the normal reviewed patch path.

No runtime field may encode predicted importance, expected scene frequency, or future plot role.
