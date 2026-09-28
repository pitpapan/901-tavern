# Player Character Continuity Update

This worksheet preserves user-controlled continuity. It never authorizes the AI to speak, choose, think, feel, decide, or create goals for the PC.

## Record

- Proposed ID: `PC_<SEMANTIC_ID>`
- Worldbook ID: `CHARACTER_<SEMANTIC_ID>`
- Name:
- Confirmed aliases:
- Canon layers:
- Continuation anchor:

Fixed values:

```text
profile_kind = pc_continuity
control_mode = user_controlled
may_generate_dialogue = false
may_choose_voluntary_actions = false
may_generate_private_thoughts = false
may_assign_new_goals = false
may_describe_external_effects = true
may_describe_involuntary_physical_reactions = true
may_summarize_user_declared_actions = true
may_reference_established_history = true
```

## Established identity and history

Add only source-supported continuity needed beyond the Worldbook reference.

## Past behavior evidence

Record as history or a contextual claim, never as an instruction for the next action.

## Relationships

Separate objective shared history from player-declared stance. Do not infer feelings or trust scores.

## Knowledge state

List knows / believes / suspects / does_not_know / secrets with acquisition context, visibility, and sources. Do not import player or GM knowledge.

## Goals

- Player-declared goals:
- Goals confirmed in continuation play:

Do not add inferred or AI-assigned goals.

## Dynamic state

Record objective conditions, obligations, current location/faction references, `as_of`, and sources. Do not copy the whole `current_state.md`.

## Presence

- Life status:
- Narrative availability:
- Realm scope:
- Sources:

## Provenance and evidence gaps

- Canon origin:
- Introduced by patch:
- Last modified by patch:
- Source origin IDs:
- Evidence gaps:

## Boundary check

- [ ] No generated dialogue or voluntary action
- [ ] No invented private thought, emotion, decision, or preference
- [ ] No inferred new goal
- [ ] No Director possibility treated as PC intent
- [ ] All substantive fields have sources
