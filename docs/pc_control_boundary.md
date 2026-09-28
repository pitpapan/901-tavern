# Player Character Control Boundary

## Non-negotiable authority

A Player Character Continuity Profile belongs to the user-controlled side of play. It preserves continuity; it does not delegate authorship of the PC to the model.

Every PC profile must have:

```text
profile_kind = pc_continuity
control_mode = user_controlled
```

The four autonomous permissions are permanently false:

- `may_generate_dialogue`
- `may_choose_voluntary_actions`
- `may_generate_private_thoughts`
- `may_assign_new_goals`

The four continuity permissions are true:

- `may_describe_external_effects`
- `may_describe_involuntary_physical_reactions`
- `may_summarize_user_declared_actions`
- `may_reference_established_history`

## Allowed output

The runtime may:

- state an externally observable consequence already determined by the scene or rules;
- describe an involuntary physical reaction without adding a voluntary decision, emotion, or interpretation;
- summarize an action the user already declared without changing its intent;
- retrieve established history, objective relationships, known information, and sourced current conditions;
- present options, external stimuli, and NPC behavior for the user to answer.

Examples of allowed forms:

- “The impact knocks the character back two steps.”
- “The cold causes an involuntary shiver.”
- “After the user-declared search, the character reaches the marked door.”
- “This person is recognized from the previously recorded meeting.”

## Forbidden output

The runtime may not:

- write new PC dialogue, including short acknowledgements;
- choose a voluntary movement, attack, refusal, acceptance, lie, promise, or plan;
- state an unprovided private thought, emotion, preference, realization, or moral judgment;
- infer that a past pattern compels the next choice;
- assign a new goal, ambition, relationship stance, or loyalty;
- convert personality evidence into an instruction such as “the PC should act aggressively”;
- resolve an ambiguity in the user's declaration by choosing the more consequential interpretation;
- treat a Director possibility as the PC's intention;
- use a continuity profile to play the PC during user absence.

Examples of forbidden forms:

- “The character agrees and says yes.”
- “Remembering the loss, the character decides to seek revenge.”
- “The character secretly distrusts the visitor.”
- “The character's established courage means they charge first.”

## Personality and decision evidence

PC profiles may preserve source-supported statements about past behavior, declared values, prior speech, and decision history. These records exist to prevent continuity loss when the user refers back to them. They are never predictive commands.

For a PC, `single_observed_behavior` remains `observed_only` or conditional. Repeated behavior may be stored as a sourced continuity pattern, but the runtime must still ask the user for the next voluntary choice.

## Goals

PC goals have only two accepted routes:

- `declared_goals`: explicitly declared by the player;
- `confirmed_continuation_goals`: established in confirmed play.

An inferred goal is not a gap-filling convenience. If the evidence is absent, record an evidence gap and leave the goal unset.

## Knowledge and secrets

The PC's knowledge state is not the player's knowledge state and not the world's truth database. The profile can retrieve only what the character knows, believes, suspects, explicitly does not know, or holds as secret, with the recorded visibility and sources. Restricted GM knowledge must not leak into the PC projection.

## Boundary failures

If a requested runtime action would cross this boundary, the system should preserve the external situation and return control to the user. It must not “complete the obvious action” or produce placeholder dialogue. Any permanent change to the boundary requires a schema revision and human review; a patch to an individual PC profile cannot loosen these fixed permissions.
