# NPC_OSHUTORU Review

Source candidate: `work/phase3c/profiles/NPC_OSHUTORU.json`

Evidence packet: `work/phase3c/evidence/NPC_OSHUTORU_evidence.md`

Review class: B

Reviewed populated ProfileClaims: 5

## Identity

PASS

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- `CLAIM_OSHUTORU_IDENTITY` in `identity.public_identity`: 奥修特尔在团录中向悠悠自报本名，此前以右近之名活动。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/21/posts.md:右近自报本名奥修特尔（lines 175-177）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- `CLAIM_OSHUTORU_HISTORY_1` in `identity.established_history`: 以右近之名活动时，他是帝国八柱将所属的右近卫大将。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/6/posts.md:右近卫大将右近介入达卡斯出征安排（lines 452-466）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- `CLAIM_OSHUTORU_HISTORY_2` in `identity.established_history`: 右近后来向悠悠自报本名为奥修特尔。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/21/posts.md:右近自报本名奥修特尔、朝见时以奥修特尔署名（lines 175-177, 602-606）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

## Personality

PASS

Findings:
Populated claims were checked for stable-vs-observed scope; empty fields remain intentionally empty.

- `CLAIM_OSHUTORU_DUTY` in `core_personality`: 人物资料把奥修特尔描述为清廉正直、责任心极强。
  - Evidence metadata: `authorial_definition` / `authorial_supplement` / `stable`.
  - Sources checked: 设定 人物/人物卡资料集_叙事检索版.md:奥修特尔（lines 154-160）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

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

- `RELATIONSHIP_OSHUTORU_HAKU` → `CHARACTER_HAKU`; type `commander and subordinate`; visibility `public`.
- `CLAIM_OSHUTORU_RELATIONSHIP` in `relationships.established_history`: 赏识哈克的智谋并邀请他成为部下。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: 设定 人物/妄想大陆设定集_检索版.md:哈克（lines 90-97）
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
- Sources checked: extracted-first/4/posts.md:右近自我介绍并接收御临风情报（around line 426）
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["original_campaign"]`
- provenance.canon_origin = `["original_campaign", "authorial_supplement"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_OSHUTORU", "work/phase3c/evidence/NPC_OSHUTORU_evidence.md"]`
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

- Populated ProfileClaims checked: 5.
- Distinct claim source references checked: 5.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

## Required Corrections

- None. The frozen candidate is carried forward byte-semantically unchanged except for Phase 3D review-state notes.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
