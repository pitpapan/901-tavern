# Continuation Session Record

> 本模板记录实际发生的续跑。计划、备选方向和未发生内容不得写成 confirmed event。

- Session ID: `SESSION_XXXX`
- Date/time: `<ISO-8601 or session date>`
- Source record: `<path or recording reference>`
- Recorder: `<name/ID>`
- Review status: `<draft | reviewed>`

## Session summary

`<short factual summary of what actually happened>`

## Event records

为每个有独立持续影响的事件建立一条 `CONT_XXXX`：

### CONT_XXXX — `<event title>`

- Event type: `<event | relationship_change | knowledge_change | state_change | location_change | faction_change | character_status_change | item_change | goal_change | revelation>`
- Actors: `<stable IDs or names>`
- Canon status: `<pending | confirmed | rejected>`
- Summary: `<what actually happened>`
- Facts established: `<confirmed facts only>`
- Relationships changed: `<before → after, or none>`
- Knowledge changed: `<who learned what, or none>`
- State changes: `<before → after, or none>`
- Source reference: `<timestamp/post/section>`
- Uncertainty or attribution: `<none or explicit boundary>`
- Notes: `<placeholder>`

## Non-events and proposed directions

`<list ideas that were discussed but did not happen; route them to Director Material, not Continuation Canon>`

## Affected-target analysis

- Worldbook candidates: `<IDs or none>`
- NPC Profile candidates: `<IDs or none>`
- Current State candidates: `<items or none>`
- Rules candidates: `<items or none>`
- Director items resolved/affected: `<IDs or none>`

No database is updated from this template alone. Confirm events first, then create separate patches.
