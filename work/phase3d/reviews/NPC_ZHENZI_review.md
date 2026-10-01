# NPC_ZHENZI Review

Source candidate: `work/phase3c/profiles/NPC_ZHENZI.json`

Evidence packet: `work/phase3c/evidence/NPC_ZHENZI_evidence.md`

Review class: A

Reviewed populated ProfileClaims: 5

## Identity

PASS

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- `CLAIM_ZHENZI_IDENTITY` in `identity.public_identity`: 贞子是曾在魔兽山脉活动并救助御临风与雪老的幽魂。
  - Evidence metadata: `authorial_definition` / `authorial_supplement` / `stable`.
  - Sources checked: 设定 人物/人物卡资料集_叙事检索版.md:御临风背景与关系：贞子的幽魂身份、救援与牺牲影响（lines 45-53）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- `CLAIM_ZHENZI_HISTORY_1` in `identity.established_history`: 边关陷落时，贞子救下御临风，并在黄祸龙狼追击下身受重伤。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/22/posts.md:御临风恢复边关记忆、贞子救援与以自身换取其生还（lines 438-470）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- `CLAIM_ZHENZI_HISTORY_2` in `identity.established_history`: 恢复记忆后，御临风明确说贞子已经为救他而死。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/24/posts.md:御临风向悠悠确认贞子已为救他而死（lines 219-227）
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

- `CLAIM_ZHENZI_SACRIFICE` in `decision_patterns`: 边关陷落时，贞子以自己的全部作为代价换取御临风生还。
  - Evidence metadata: `single_observed_behavior` / `original_campaign` / `observed_only`.
  - Sources checked: extracted-first/22/posts.md:lines 438-470
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

## Relationships

PASS

Findings:
Only documented relationship history is retained; cooperation, rescue, kinship, and conflict were not inflated.

- `RELATIONSHIP_ZHENZI_YU_LINFENG` → `CHARACTER_YU_LINFENG`; type `rescuer and enduring deceased relation`; visibility `public`.
- `CLAIM_ZHENZI_RELATIONSHIP` in `relationships.established_history`: 边关陷落时，贞子救下御临风，并以自身为代价换取其生还。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/22/posts.md:lines 438-470
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.

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
- current_conditions = `["deceased"]`; current_obligations = `[]`; current_concerns = `[]`
- Sources checked: current_state.md:D3 state check
- Evidence conclusion: `SUPPORTED_OR_LEFT_EMPTY`; the D3 check does not create facts from silence.

## Presence

PASS

Findings:
Life status, narrative availability, realm scope, and presence sources were checked together; depth does not authorize presence.

- life_status = `deceased`
- narrative_availability = `historical_only`
- realm_scope = `["original_campaign"]`
- Sources checked: extracted-first/24/posts.md:御临风向悠悠确认贞子已为救他而死（lines 219-227）
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["original_campaign"]`
- provenance.canon_origin = `["original_campaign", "authorial_supplement"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_ZHENZI", "work/phase3c/evidence/NPC_ZHENZI_evidence.md"]`
- Evidence conclusion: `CONSISTENT`; authorial provenance is not treated as a runtime realm and cross-layer facts remain separable.

## Evidence Gaps

PASS

Findings:
Material unknowns remain explicit; sparse fields were not filled for convenience.

- 现有资料不足以概括稳定声线与完整人格。
- 死亡后的任何行动可能性均无证据。

## Evidence Packet Completeness

PASS

Findings:
The packet supports review of populated fields; original sources were reopened only for ambiguous or stronger-than-source wording.

- Populated ProfileClaims checked: 5.
- Distinct claim source references checked: 4.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

## Required Corrections

- None. The frozen candidate is carried forward byte-semantically unchanged except for Phase 3D review-state notes.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
