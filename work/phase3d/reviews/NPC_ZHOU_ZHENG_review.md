# NPC_ZHOU_ZHENG Review

Source candidate: `work/phase3c/profiles/NPC_ZHOU_ZHENG.json`

Evidence packet: `work/phase3c/evidence/NPC_ZHOU_ZHENG_evidence.md`

Review class: A

Reviewed populated ProfileClaims: 1

## Identity

PASS

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- `CLAIM_ZHOU_ZHENG_IDENTITY` in `identity.public_identity`: 周正是现代灵异特殊梦境中负责大杭市的驭鬼者。
  - Evidence metadata: `explicit_source_statement` / `special_interlude` / `stable`.
  - Sources checked: extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:周正介绍、鬼婴展示与敲门老人交战（lines 586-594, 661-686, 766-847）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.

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
- narrative_availability = `special_interlude_only`
- realm_scope = `["special_interlude"]`
- Sources checked: extracted-third/NO.901MurginMunalos，昼短苦夜长，人间正道是沧桑。 - 页 5/posts.md:周正介绍、鬼婴展示与敲门老人交战（lines 586-594, 661-686, 766-847）
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["special_interlude"]`
- provenance.canon_origin = `["special_interlude"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_ZHOU_ZHENG", "work/phase3c/evidence/NPC_ZHOU_ZHENG_evidence.md"]`
- Evidence conclusion: `CONSISTENT`; authorial provenance is not treated as a runtime realm and cross-layer facts remain separable.

## Evidence Gaps

PASS

Findings:
Material unknowns remain explicit; sparse fields were not filled for convenience.

- 特殊梦境未完成，人物后续状态未知。
- 身体异常的后续结果与稳定人格均未知。

## Evidence Packet Completeness

PASS

Findings:
The packet supports review of populated fields; original sources were reopened only for ambiguous or stronger-than-source wording.

- Populated ProfileClaims checked: 1.
- Distinct claim source references checked: 1.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

## Required Corrections

- None. The frozen candidate is carried forward byte-semantically unchanged except for Phase 3D review-state notes.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
