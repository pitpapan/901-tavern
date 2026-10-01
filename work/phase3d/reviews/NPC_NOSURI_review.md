# NPC_NOSURI Review

Source candidate: `work/phase3c/profiles/NPC_NOSURI.json`

Evidence packet: `work/phase3c/evidence/NPC_NOSURI_evidence.md`

Review class: C

Reviewed populated ProfileClaims: 2

## Identity

REVISE

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.
- `CLAIM_NOSURI_HISTORY_1` in `identity.established_history`: 宅邸战中，诺斯莉以弓箭参与围攻古雷姆林，并在其逃离时继续追击。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 5/posts.md:宅邸战援助、反击与追击（lines 381-487）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- `CLAIM_NOSURI_IDENTITY` in `identity.established_history`: 诺斯莉是欧基称作姐姐的人物，并参与了围捕古雷姆林的计划。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.md:诺斯莉参与诱饵与围捕计划（lines 11-38, 147-220）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

## Personality

PASS

Findings:
Populated claims were checked for stable-vs-observed scope; empty fields remain intentionally empty.

- No populated claim in this field; the absence is preserved.

## Values

PASS

Findings:
No event choice was generalized into a durable value without direct support.

- No populated claim in this field; the absence is preserved.

## Speech

PASS

Findings:
No isolated quotation was generalized into a permanent voice rule.

- No populated claim in this field; the absence is preserved.

## Decision Patterns

PASS

Findings:
Observed-only actions retain bounded context and do not become universal behavior rules.

- No populated claim in this field; the absence is preserved.

## Relationships

PASS

Findings:
Only documented relationship history is retained; cooperation, rescue, kinship, and conflict were not inflated.

- No populated relationship record; no relation is inferred from absence.

## Knowledge

PASS

Findings:
Knowledge, belief, suspicion, rumor, public claim, and world fact remain partitioned by assertion scope.

- No populated knowledge item; no knowledge is inferred.

## Goals

PASS

Findings:
No past action or public statement was converted into a current/private goal without direct support.

- No populated goal; past action and public statement were not converted into current intent.

## Dynamic State

PASS

Findings:
Only current-state-anchored data is populated; absent location, agenda, and concern remain absent.

- as_of = `current_state.md D3 baseline`
- current_location_ref = ``; current_faction_role = ``
- current_conditions = `[]`; current_obligations = `[]`; current_concerns = `[]`
- Sources checked: current_state.md:D3 state check
- Evidence conclusion: `SUPPORTED_OR_LEFT_EMPTY`; the D3 check does not create facts from silence.

## Presence

PASS

Findings:
Life status, narrative availability, realm scope, and presence sources were checked together; depth does not authorize presence.

- life_status = `unknown`
- narrative_availability = `inactive`
- realm_scope = `["original_campaign"]`
- Sources checked: extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 4/posts.md:诺斯莉参与诱饵与围捕计划（lines 11-38, 147-220）
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["original_campaign"]`
- provenance.canon_origin = `["original_campaign"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_NOSURI", "work/phase3c/evidence/NPC_NOSURI_evidence.md"]`
- Evidence conclusion: `CONSISTENT`; authorial provenance is not treated as a runtime realm and cross-layer facts remain separable.

## Evidence Gaps

PASS

Findings:
Material unknowns remain explicit; sparse fields were not filled for convenience.

- 稳定人格、价值排序与跨情境声线证据不足。
- D3 精确位置、即时议程与当前目标未知。

## Evidence Packet Completeness

PASS

Findings:
The packet supports review of populated fields; original sources were reopened only for ambiguous or stronger-than-source wording.

- Populated ProfileClaims checked: 2.
- Distinct claim source references checked: 2.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

## Required Corrections

- Moved CLAIM_NOSURI_IDENTITY from public identity to established history because the cited statement and ambush participation are event-specific.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
