# NPC ordinary checks v0.1 — bounded offline integration

The existing GM Runtime now resolves ordinary NPC checks using trusted MVU actor state, the same `check()`/D10 rules as players, and the existing single-writer commit/readback path. No new classifier, NPC generator, Canon actor, or background simulation was added.

## Request and host authorization

`createDemoRuntime(...).dispatch({ gmText, operationId })` accepts this request without `playerIntent`. `createReplayCheckRuntime(...).settle({ request, operationId })` uses the same exported `settleNpcCheck()` implementation.

```json
{
  "kind": "check",
  "actorId": "npc",
  "sceneId": "test-only/patrol",
  "triggerId": "test-only/search",
  "attribute": "感知",
  "skill": "洞察",
  "dc": 2,
  "modifierIds": ["light"]
}
```

Optional `sub` selects one known subskill under the main skill. Optional `effectChoice` selects an existing, trusted NPC-owned active effect or `skip`; it never opens the player panel. Unknown numeric character fields are rejected. DC remains GM adjudication input, not character authority.

The host supplies `npcContext` separately from model input: `sceneId`, `triggerId`, `actorIds`, `protagonistInvolved: true`, and a nonempty `reason` supporting the current action. Its optional `modifiers` catalogue maps IDs to `{ value, source, actorIds, attribute, skill, sub? }`. Optional `trustedEffects` uses the existing template/active-use validation. These are explicit local authorizations; the code does not infer whether narrative behavior justifies a check.

The NPC must already exist with complete mechanical state in the selected MVU branch. The replay initializer still initializes only its existing player; it does not fabricate or import NPCs. The tests use the existing mechanically complete patrol candidate through its existing explicit demo authorization, without approving that candidate. `registerReplayGate({ npcContext })` passes trusted scene configuration to the replay runtime; no default NPC authorization is installed.

The host supplies `operationId = gm-runtime/<chatId>/<messageId>/<swipeId>` matching the current anchor. A committed identical request recovers before dice; changed requests cannot reuse the same ID. This version permits one operation per such anchor, following the existing convention.

## Visibility and persistence

- **Trusted MVU record:** signature retains actor/request, contextual modifier sources and supplied dice. `mechanical` retains base/effective attribute, effective main/subskill, matched effects and complete core outcome (used dice, DP, successes and DC). Existing revision, save/readback and branch guards apply.
- **GM/tool result:** `{ status, kind: 'check', actorType: 'npc', operationId, success, fortune, possibleMishap, consequences }`. It contains no NPC numerical mechanics. Consequences explicitly prohibit adding uncommitted numerical effects. `compactNarrationFacts()` provides a similarly compact narration instruction.
- **Player projection:** `playerFacingResult()` returns `{}` for NPC results. Public pending metadata omits the NPC request and private adjudication reason. The script bypasses the player pool/choice UI and recovers saved NPC requests from trusted operation records.

An information-only check changes only the operation journal/revision. It does not spend actions, damage characters, or change attributes/resources. Existing matching effects retain their already-defined lifecycle. Requests for additional numerical consequences are deferred before drawing.

This is presentation isolation, not cryptographic secrecy against local-state inspection. Model prose still needs live acceptance for following the narration restrictions.

## Validation and limits

Focused tests cover trusted NPC main-skill DP, applicable versus unrelated subskills, sourced modifiers, absent/incomplete actors, rejected numeric authority, no player permission/panel, no invented effects, filtered successful/unresolved metadata, and narration-failure recovery with one draw and unchanged actors. Existing player display, active choice, fortune, genetic and MVU tests are reused.

Result: 46 tests passed across `bridge.test.mjs`, `replay-check.test.mjs`, `adjudication-gate.test.mjs` and `../mvu_poc/adapter.test.mjs`. The isolated gate script also passed `node --check`.

Core `oppose()` already supports NPC/player mathematical comparison; one deterministic example is checked with NPC output filtered. Paired runtime persistence and the player's decision window are not integrated, so requests containing `opposed` are deferred without drawing or consuming anything. No new opposed-check mechanics were invented.

No actual browser run was performed for this change. The prior player-host acceptance is not NPC browser evidence. Current player classification prompts and native tool schemas were not expanded to solicit NPC actions: live GM selection and host scene/NPC provisioning remain explicit integration work. There were no external LLM calls, original-save writes, formal card/worldbook edits or Canon changes.

Changed source files: `replay-check.mjs`, `bridge.mjs`, `adjudication-gate.mjs`, `replay-gate-script.example.js`, `../mvu_poc/adapter.mjs`. Focused tests are in `bridge.test.mjs`; this document describes the interface.
