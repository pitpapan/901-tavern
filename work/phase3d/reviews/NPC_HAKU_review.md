# NPC_HAKU Review

Source candidate: `work/phase3c/profiles/NPC_HAKU.json`

Evidence packet: `work/phase3c/evidence/NPC_HAKU_evidence.md`

Review class: B

Reviewed populated ProfileClaims: 4

## Identity

PASS

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- `CLAIM_HAKU_IDENTITY` in `identity.public_identity`: 哈克失去记忆后由久远从雪地救起，并接受久远作为监护人一同行动。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: 设定 人物/妄想大陆设定集_检索版.md:哈克（lines 90-97）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.

## Personality

PASS

Findings:
Populated claims were checked for stable-vs-observed scope; empty fields remain intentionally empty.

- `CLAIM_HAKU_DEMEANOR` in `core_personality`: 哈克常表现得吊儿郎当并厌恶麻烦，但能够分辨轻重缓急。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: 设定 人物/妄想大陆设定集_检索版.md:哈克（lines 90-97）
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

- `CLAIM_HAKU_PROBLEM_SOLVING` in `decision_patterns`: 即使态度消极，哈克仍会设法解决已经面对的问题。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `conditional`.
  - Sources checked: 设定 人物/妄想大陆设定集_检索版.md:哈克（lines 90-97）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

## Relationships

PASS

Findings:
Only documented relationship history is retained; cooperation, rescue, kinship, and conflict were not inflated.

- `RELATIONSHIP_HAKU_KUON` → `CHARACTER_KUON`; type `ward and travelling companion`; visibility `public`.
- `CLAIM_HAKU_RELATIONSHIP` in `relationships.established_history`: 失忆后由久远救起、命名并监护，两人一同行动。
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
- Sources checked: 设定 人物/妄想大陆设定集_检索版.md:哈克（lines 90-97）
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["original_campaign"]`
- provenance.canon_origin = `["original_campaign"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_HAKU", "work/phase3c/evidence/NPC_HAKU_evidence.md"]`
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

- Populated ProfileClaims checked: 4.
- Distinct claim source references checked: 1.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

## Required Corrections

- None. The frozen candidate is carried forward byte-semantically unchanged except for Phase 3D review-state notes.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
