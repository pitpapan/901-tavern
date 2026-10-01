# NPC_WILLIAM Review

Source candidate: `work/phase3c/profiles/NPC_WILLIAM.json`

Evidence packet: `work/phase3c/evidence/NPC_WILLIAM_evidence.md`

Review class: C

Reviewed populated ProfileClaims: 3

## Identity

REVISE

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- `CLAIM_WILLIAM_HISTORY_2` in `identity.public_identity`: 威廉在帝都经营酒屋。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！/posts.md:威廉的酒屋及其与御临风的持续接触（lines 93-134, 419-448）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- `CLAIM_WILLIAM_HISTORY_1` in `identity.established_history`: 威廉参与了把悠悠诅咒转移给御临风的法阵仪式。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/28/posts.md:威廉参与诅咒转移法阵（lines 266-377）
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- `CLAIM_WILLIAM_IDENTITY` in `identity.established_history`: 威廉曾在帝都施术帮助御临风恢复感情与边关记忆。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）
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
- Sources checked: extracted-first/22/posts.md:威廉施术协助御临风恢复感情和边关记忆（lines 420-470）
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["original_campaign"]`
- provenance.canon_origin = `["original_campaign"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_WILLIAM", "work/phase3c/evidence/NPC_WILLIAM_evidence.md"]`
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

- Populated ProfileClaims checked: 3.
- Distinct claim source references checked: 3.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

## Required Corrections

- Replaced the inferred treatment-role identity with the directly supported durable fact that 威廉 operated a winehouse in the imperial capital.
- Moved CLAIM_WILLIAM_IDENTITY to established history and limited it to the documented memory-restoration action.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
