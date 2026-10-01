# NPC_EMPEROR Review

Source candidate: `work/phase3b/prototypes/NPC_EMPEROR.json`

Evidence packet: `work/phase3b/evidence/NPC_EMPEROR_evidence.md`

Review class: A

Reviewed populated ProfileClaims: 6

## Identity

PASS

Findings:
Identity and historical-action placement were checked against cited excerpts; no outside-franchise completion was accepted.

- `CLAIM_EMPEROR_IDENTITY` in `identity.public_identity`: 帝是帝国最高统治者，也是飘零大陆长期秩序的核心人物。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: 设定 人物/妄想大陆设定集_检索版.md:70-79; output/worldbook_source.jsonl#CHARACTER_EMPEROR
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- `CLAIM_EMPEROR_BROTHERHOOD_ROLE` in `identity.durable_roles`: 帝掌控兄弟会，并有权授予获准者使用假面。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: 设定 人物/妄想大陆设定集_检索版.md:23-31; output/worldbook_source.jsonl#CHARACTER_EMPEROR
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- `CLAIM_EMPEROR_CURSE_RULING` in `identity.established_history`: 在悠悠诅咒审议中，帝听取调查与当事人意见，并准许御临风自愿承接诅咒。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/27/posts.md:171-269; output/worldbook_source.jsonl#CHARACTER_EMPEROR
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

- `CLAIM_EMPEROR_FORMAL_REGISTER` in `speech_style`: 在正式审议场景中，帝以“余”自称并用“汝”称呼对象。
  - Evidence metadata: `single_observed_behavior` / `original_campaign` / `observed_only`.
  - Sources checked: extracted-first/27/posts.md:171-269
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

## Decision Patterns

PASS

Findings:
Observed-only actions retain bounded context and do not become universal behavior rules.

- `CLAIM_EMPEROR_HEARING_PATTERN` in `decision_patterns`: 在悠悠诅咒审议中，他先询问多方调查结果并反复追问御临风的选择，再作出许可。
  - Evidence metadata: `single_observed_behavior` / `original_campaign` / `observed_only`.
  - Sources checked: extracted-first/27/posts.md:171-269
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.

## Relationships

PASS

Findings:
Only documented relationship history is retained; cooperation, rescue, kinship, and conflict were not inflated.

- `RELATIONSHIP_EMPEROR_YU_LINFENG` → `CHARACTER_YU_LINFENG`; type `sovereign and imperial subordinate`; visibility `public`.
- `CLAIM_EMPEROR_YU_AUDIENCE` in `relationships.established_history`: 御临风以帝国下属身份向帝汇报，并在诅咒审议中获得其许可。
  - Evidence metadata: `explicit_source_statement` / `original_campaign` / `stable`.
  - Sources checked: extracted-first/27/posts.md:171-309
  - Evidence conclusion: `SUPPORTED_AS_SCOPED`; retained wording and exceptions do not exceed the cited evidence.
- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.
- No populated claim in this field; the absence is preserved.

## Knowledge

PASS

Findings:
Knowledge, belief, suspicion, rumor, public claim, and world fact remain partitioned by assertion scope.

- `KNOWLEDGE_EMPEROR_BOX_AT_HEARING` about `CONCEPT_MONSTER_BOX`: 在御临风当场报告前，帝并未掌握他把魔物之盒交给悠悠保管的这一具体信息。
  - Scope: `does_not_know` / `character_cognition` / visibility `restricted`.
  - Sources checked: extracted-first/27/posts.md:274-309
  - Evidence conclusion: `SUPPORTED_AS_CHARACTER_SCOPED`; cognition is not promoted to unqualified world truth.

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
- current_location_ref = ``; current_faction_role = `帝国最高统治者`
- current_conditions = `[]`; current_obligations = `[]`; current_concerns = `[]`
- Sources checked: 设定 人物/妄想大陆设定集_检索版.md:70-79; current_state.md:D3; output/worldbook_source.jsonl#CHARACTER_EMPEROR
- Evidence conclusion: `SUPPORTED_OR_LEFT_EMPTY`; the D3 check does not create facts from silence.

## Presence

PASS

Findings:
Life status, narrative availability, realm scope, and presence sources were checked together; depth does not authorize presence.

- life_status = `alive`
- narrative_availability = `normal`
- realm_scope = `["original_campaign", "transition"]`
- Sources checked: current_state.md:D3; output/worldbook_source.jsonl#CHARACTER_EMPEROR
- Evidence conclusion: `SUPPORTED_AS_SCOPED`; availability remains independent from profile depth.

## Canon Layers / Provenance

PASS

Findings:
Claim origins, runtime layers, presence sources, and profile provenance were checked without naive layer equality.

- canon_layers = `["original_campaign", "transition"]`
- provenance.canon_origin = `["original_campaign", "transition"]`
- provenance.source_origin_ids = `["output/worldbook_source.jsonl#CHARACTER_EMPEROR", "work/phase3b/evidence/NPC_EMPEROR_evidence.md"]`
- Evidence conclusion: `CONSISTENT`; authorial provenance is not treated as a runtime realm and cross-layer facts remain separable.

## Evidence Gaps

PASS

Findings:
Material unknowns remain explicit; sparse fields were not filled for convenience.

- 真名、年龄与能力未公开。
- 没有确认的私人目标或价值体系。
- 跨情境语言与决策语料不足。
- D3 精确位置与即时议程未知。

## Evidence Packet Completeness

PASS

Findings:
The packet supports review of populated fields; original sources were reopened only for ambiguous or stronger-than-source wording.

- Populated ProfileClaims checked: 6.
- Distinct claim source references checked: 5.
- Evidence conclusion: `SUFFICIENT_FOR_REVIEW`; omissions remain explicit gaps and material rejected evidence is recorded below when applicable.

Material evidence disposition:
Rumor and character-level interpretation were not promoted into objective identity or motive.

## Required Corrections

- None. The frozen candidate is carried forward byte-semantically unchanged except for Phase 3D review-state notes.

## Final Review Status

RECOMMENDED_FOR_APPROVAL

This is a Codex review recommendation only. Human approval is not present; the profile and its draft/add patch remain unapproved and unapplied.
