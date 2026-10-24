# Bounded offline/browser acceptance — 2026-10-15

Follow-up: [actual SillyTavern/TavernHelper/MVU host acceptance](HOST_OFFLINE_ACCEPTANCE.md) now verifies pending-choice refresh, cancellation and native regeneration using a disposable profile and loopback-only responses. This document retains the earlier shim pass as its historical evidence.

No external LLM API calls were made. Controlled adjudication and narration exist only in `offline-browser.mjs`, which no card or runtime loader imports. No deployment to SillyTavern, Canon, formal GM card, worldbook, baseline, willpower rule, or existing game save was performed.

## Confirmed offline functionality

25 tests passed across `adjudication-gate.test.mjs`, `replay-check.test.mjs`, and `../mvu_poc/adapter.test.mjs`; the isolated gate script also passed `node --check`. One new test checks the trusted subskill breakdown, a visibly different wrong-but-known attribute selection, rejection of an unrelated subskill, and no preparation-time state mutation.

- `NO_CHECK` never settles a mechanical operation. Invalid classifications and explicit known mechanical-risk bypasses remain blocked.
- Trusted Builder/MVU data supplies attribute and skill values. Knowledge: 智力6 + 学识4 + 死灵学2 = 12 DP. Choosing 风度 instead visibly changes the basis to 风度4 and 10 DP; this exposes the selection but does not prove the model chose the appropriate rule.
- Public basis/display excludes DC, dice, success counts, hidden modifiers and NPC values. The boundary is the player panel, not developer access to saved operation records.
- Existing demo effect, pre-choice dice guard, trusted-template validation, readback, revision checks and operation deduplication pass.

## Confirmed browser functionality without an LLM

Executed in the Codex browser at loopback port 9019. The fixture imports the actual `replay-gate-script.example.js`, adjudication gate, replay runtime, Builder, core and MVU adapter. Only TavernHelper/SillyTavern host callbacks and backing persistence are a small sessionStorage shim. The actual browser dialog and actual crypto dice source run. This is browser integration evidence, **not a real SillyTavern/MVU-host acceptance claim**.

| Check | Observed evidence |
|---|---|
| NO_CHECK | Initial isolated setup at revision 0, no operation or random draw. Later NO_CHECK left revision 4, four operations and six random-byte batches unchanged. Initial setup is the one expected initialization write. |
| Automatic check | No dialog without active choices; observation displayed 感知5 + 洞察1 = 6 DP and committed revision 1. |
| Applicable subskill | Knowledge displayed 智力6 + 学识4 + 死灵学2 = 12 DP; revision 2. |
| DIRECT_EFFECT + replay | `demo.scene-cue` committed revision 3, exactly one effect; replay retained revision 3 and the same effect, without drawing dice. |
| Active choice | Modal displayed base 6 DP, skip and existing +1 option. No draw or commit before choice. |
| Refresh and cancellation | Same original player floor 9/swipe 0, request and operation ID survived refresh and Escape. Revision 3, one effect, four random-byte batches, and five player turns remained unchanged. Recovery reused the request without another classification. |
| Selected public modifier | Choosing the effect displayed 7 DP, committed revision 4 and removed the one-use effect. |
| Narration failure/recovery | Controlled narration failure produced NARRATION_PENDING after commit. Refresh/recovery kept revision 4, four operations, six random-byte batches and five player turns; no new classification. |
| Committed regeneration | Same committed check regenerated without new dice or revision. A following NO_CHECK was not trapped by old pending notices. |
| Explicit skip | A fresh demo effect followed by skip resolved at 6 DP. The existing nextMatchingCheck duration expired the effect on that check; this is distinct from Escape/cancellation, which preserves it. |

Random-byte batches count `crypto.getRandomValues` calls, not individual rolls: rejection sampling can use more than one batch per roll. Local panel/recovery interactions added no player messages. Assistant pending notices are saved to preserve the decision.

### Defect reproduced and fixed

Before the change, refreshing while the modal was open left no persisted pending request (`pending: []`). The script now saves an assistant pending notice **before** awaiting the modal, reuses that classified request for local-choice recovery, and preserves it after cancellation. A later APPLIED notice supersedes earlier pending notices, preventing an already completed choice from capturing the next turn. The failing browser scenario was rerun successfully after the fix.

## Still requiring live-model or real-host acceptance

- Actual model classification quality, appropriate attribute/subskill selection, DC reasoning, worldbook context and faithful private-safe GM narration. Fixed test responses do not establish these.
- New pending-notice persistence and modal recovery in the actual installed TavernHelper/MVU/SillyTavern host, including real regeneration/swipe lifecycle. The fixture exercises the same script entry point but does not implement the host's full event or persistence semantics.
- Provider failures, transport cancellation and real model continuation remain untested this phase. The expired subscription blocks live-model acceptance. Multi-writer atomicity remains the existing limitation.

No simulated normal-play fallback was installed. No new willpower values or generalized direct effects were introduced.

## Files changed and reproduction

- `replay-gate-script.example.js`: pending-choice persistence/recovery and completed-notice precedence.
- `replay-check.test.mjs`: one focused public-basis/subskill check.
- `offline-browser.html`, `offline-browser.mjs`, `offline-browser-server.mjs`: disposable, explicitly test-only fixture and loopback static server; no model/API proxy.
- `offline-choice.png`: browser panel evidence.
- This report.

From the repository root (`TRPG outputs`):

```sh
node --test work/rules_engine/gm_runtime/adjudication-gate.test.mjs work/rules_engine/gm_runtime/replay-check.test.mjs work/rules_engine/mvu_poc/adapter.test.mjs
node --check work/rules_engine/gm_runtime/replay-gate-script.example.js
node work/rules_engine/gm_runtime/offline-browser-server.mjs
```

Open `http://127.0.0.1:9019/work/rules_engine/gm_runtime/offline-browser.html`. Reset the disposable fixture; exercise NO_CHECK, CHECK_REQUIRED, subskill, effect, same-turn regeneration, then check with a choice. Refresh while open, recover, Escape, recover again and select the +1. Use the failure checkbox to interrupt narration after commit, then refresh/recover. All persistence is confined to that tab's sessionStorage. Stop the server when finished; it was stopped after this acceptance pass.
