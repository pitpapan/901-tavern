# Phase 3D-R2C Character Profile v2 Rebuild & Repair Design

**Status:** Approved design contract for execution  
**Phase outcome:** `READY_FOR_HUMAN_APPROVAL_AFTER_R2`  
**Authority:** User-approved Phase 3D-R2C specification dated 2026-09-30

## 1. Purpose and stop boundary

R2C rebuilds the provisional Character Continuity Profile set around the reviewed chronology and temporal model produced by R2A and R2B. It separates stable identity, biography, in-campaign chronology, persona, motivations, goals, relationship changes, ability/status transitions, knowledge acquisition, D3 state and portrayal constraints without promoting testimony, theory, belief, prophecy, possible futures or inference into objective Canon.

R2C produces versioned schemas, explicit semantic migration packages, provisional v2 candidates, migration ledgers, Chinese human-review projections and audit reports. It does not approve or apply profiles or patches, mutate Worldbook or `current_state.md`, create formal NPC/PC databases, generate runtime projections or cards, design Active Cast or scene selection, generate Director material, or enter Phase 4.

## 2. Authority and evidence model

The authority chain is:

```text
R2A reviewed chronology and evidence (event authority)
        -> R2B normalized temporal layer (deterministic lookup aid)
        -> R2C semantic migration package (reviewable interpretation)
        -> deterministic compiler
        -> provisional profile + ledgers + review projection + reports
```

R2A chronology remains the authoritative event source. R2B is never an independent Canon authority, and its character temporal index is not an exhaustive history. An event omitted from a profile's exact-reference index can still be character-critical; `EVENT_P2_022_DEATHWING_HISTORY_TESTIMONY` is the mandatory regression case.

Every migration package must record the inputs considered: existing profile claims, direct R2B links, indirect continuity events, R2A revelations and routing, event audits, discoveries, Part 1 retention, valid Phase 3D-R repairs, D3 evidence and relevant Worldbook references. Generic name matching, fuzzy matching, embedding similarity and broad promotion heuristics are forbidden.

Original campaign sources are fallback evidence only. Each fallback records the profile, question, source, reason, result and whether the Canon interpretation changed. Unresolved evidence remains unresolved.

## 3. Versioned schema architecture

R2C creates new schemas below `work/phase3d_r2c/schemas/`; it does not mutate the frozen Phase 3D schemas.

The shared `character_profile_v2` schema defines closed reusable records. `npc_profile_v2` and `pc_continuity_v2` are authoritative root contracts. All semantic records carry machine-readable evidence/reality status, attribution, uncertainty and precise source references.

### 3.1 Root metadata and identity

Every candidate contains:

- `schema_version`, fixed to `2.0`;
- `phase`, fixed to `3D-R2C`;
- `id` and `profile_kind`;
- `profile_status`, distinguishing at least `existing`, `provisional_discovery`, `historical_only` and `blocked`;
- nullable `worldbook_id` plus an explicit mapping status, so provisional discoveries are not treated as approved Worldbook entities;
- name and verified aliases only;
- profile depth, Canon layers, control mode and permissions;
- `identity`, limited to stable identity, species/entity identity, durable roles and durable affiliation.

Runtime triggers are not part of the R2C schema. Canon identity and trigger suitability remain decoupled.

### 3.2 Evidence and reality status

The schema distinguishes at least:

`ACTUAL_EVENT`, `BIOGRAPHICAL_BACKGROUND`, `POSSIBLE_FUTURE_VISION`, `PROPHECY`, `BELIEF`, `THEORY`, `RUMOR`, `TESTIMONY`, `INFERENCE`, and `OBSERVED_BEHAVIOR`.

Uncertainty distinguishes `confirmed`, `uncertain`, `rumor`, and `character_belief`. Attribution identifies the speaker, observer, source class or authorial basis. A source-backed attribution does not make the attributed proposition objective world truth.

### 3.3 Biography

`biographical_background` holds pre-Campaign or historical biography that is not naturally an in-Campaign event. Each item contains:

- `background_id` and statement;
- temporal scope and approximate relative time;
- evidence/reality status, evidence mode and attribution;
- source references and related event references;
- uncertainty and notes.

Approximate background chronology must not be assigned invented Campaign story order. White Magician's Prison Tower imprisonment and beast-tide release with Mu Tou assistance belong here, separate from the underground military-factory confrontation.

### 3.4 Persona, motivations and goals

`persona` contains `core_personality`, `values`, `speech_style`, and `decision_patterns`. Stable claims and single observed behavior remain distinct. Persona claims may reference supporting events and revelations.

`motivations` is a first-class persona subsection answering why the character acts. Each item records stability (`persistent`, `situational`, `historical`, or `unresolved`), temporal validity, support, evidence mode, attribution and uncertainty.

`goals` answers what concrete outcome the character wants and separates historical, current, long-term and explicitly supported private goals. Old goals do not remain current automatically. Historical planning does not create future obligation.

### 3.5 Campaign chronology

`campaign_timeline` references central events rather than copying complete event objects. Each item contains:

- `timeline_id`, `event_ref` and explicit story-order start/end;
- profile Canon layer;
- the character's role, character-specific summary and consequence;
- revelation and evidence references;
- uncertainty and notes.

Array position, filename order and prose such as “later” are never the sole chronology mechanism.

### 3.6 Relationships

Each relationship identifies a resolved character reference or an unresolved label, a baseline, ordered milestones and a current stance only when supported. Each milestone references an event or background item, carries explicit story order where applicable, and records the change, evidence mode, attribution and uncertainty.

Cooperation is not current loyalty; engagement planning is not romance, marriage or present obligation; friendship history is not permanent alliance; co-participation is not itself a relationship.

### 3.7 Ability and status transitions

`ability_status_transitions` represents gains, losses, curses, name/title inheritance, role/faction changes, imprisonment/release, control, injury/recovery, death, body destruction, sourced resurrection, protection, memory change and other major transitions. Each record references an event or background item and carries story order when applicable, before/after state, persistence, evidence mode, attribution and uncertainty. Unknown persistence stays unknown.

### 3.8 Knowledge timeline

Knowledge records contain the proposition, epistemic status, acquisition event and story order, attributed source, supersession links, validity interval, uncertainty and notes. Supported states include `KNOWS`, `BELIEVES`, `SUSPECTS`, `MISCONCEPTION`, `TESTIMONY_HEARD`, `THEORY`, `RUMOR`, and `PROPHECY_RECEIVED`.

Participation does not imply knowledge. World, GM or Director knowledge does not imply character knowledge. Later knowledge cannot leak into earlier portrayals.

### 3.9 D3 state, presence and portrayal

`dynamic_state` represents D3 only and may use only `current_state.md:D3`-supported material. Missing current location, concern, obligation, faction role, loyalty or emotion remains empty or unknown; historical evidence cannot fill it.

`presence` distinguishes life status and narrative availability without using profile depth as a prediction of future importance.

`rp_constraints` preserves anti-inference boundaries including unsupported loyalty, romance, knowledge, resurrection, teleportation, motive, future certainty and outside-franchise completion.

`provenance` and `evidence_gaps` preserve lineage and every significant unresolved issue.

### 3.10 PC authority

`PC_YU_LINFENG` remains user-controlled. The schema requires these permissions to remain false:

- `may_generate_dialogue`;
- `may_choose_voluntary_actions`;
- `may_generate_private_thoughts`;
- `may_assign_new_goals`.

Historical PC behavior never authorizes future control. Existing permissions for external effects, involuntary reactions, user-declared-action summaries and established history remain bounded as already defined.

## 4. Schema fixture gate and freeze

Before any full migration, six fixture groups must validate without semantic collapse:

1. White Magician: Prison Tower background != underground military factory != Dragon Sanctuary finale.
2. Cassandra: present revenge motivation != possible future violent revenge.
3. Deathwing: ancient testimony != actual campaign battle != White Magician theory.
4. Oshira: lineage testimony != non-voluntary control != unknown cognition/persistence.
5. Youyou: curse -> transfer -> survival -> inheritance -> ceremony -> prophecy/seal -> protection -> final war -> D3.
6. PC Yu Linfeng: time-scoped knowledge acquisition plus unchanged autonomy.

Failure emits `R2C_SCHEMA_BLOCKED` with exact defects and stops before profile migration.

After the fixtures pass, the schema hash is frozen for the migration run. A genuine defect found later stops the run; the schema is revised centrally, all fixtures and schema tests rerun, and every candidate is rebuilt from the beginning. Per-character schema drift is forbidden.

## 5. Semantic migration packages

Each profile has one reviewable package under `work/phase3d_r2c/migration_packages/`. A package enumerates every input consulted, every old-claim disposition, and the complete proposed items for all v2 sections. It also includes gap routing and human-review notes.

Every old claim receives one of:

`MIGRATED`, `SPLIT`, `MERGED_WITH_EVENT_REFERENCE`, `MOVED_TO_BACKGROUND`, `MOVED_TO_TIMELINE`, `MOVED_TO_RELATIONSHIP`, `MOVED_TO_ABILITY_STATUS`, `MOVED_TO_KNOWLEDGE`, `MOVED_TO_MOTIVATION`, `MOVED_TO_GOAL`, `RETAINED_AS_PERSONA`, `DEMOTED_TO_OBSERVED_BEHAVIOR`, `SEEN_NOT_PROMOTED`, or `UNRESOLVED`.

No old claim silently disappears. Migration packages are reviewable interpretation layers, not new Canon authorities. Final candidate JSON and review Markdown are generated from them and are not hand-maintained independently.

## 6. Population and discovery policy

The baseline population is the existing 35 NPC + 1 PC. Empty R2B indexes do not erase Mu Tou or Zhenzi.

R2A discoveries and Part 1 retention records are evaluated explicitly. A stable profile is not created merely to increase the count. Insufficient identity or evidence is routed to `CHARACTER_DISCOVERY_REQUIRED` or `HUMAN_DECISION_REQUIRED`.

`NPC_YANG` may be generated only as `provisional_discovery`, without a Worldbook mapping, invented surname, full name, alias, title, trigger or automatic Worldbook entry. It remains unapproved and unapplied.

Part 1 characters with durable continuity impact remain represented even if they later disappear or die. Where evidence does not justify a profile, the retention result remains visible in discovery or gap routing rather than being discarded.

## 7. Character-specific and cross-profile safeguards

The compiler and audits enforce the user-approved rules for White Magician, Deathwing, Cassandra, Oshira, Honda, Sertant, Youyou, Xierlun, PC Yu Linfeng, Mu Tou, Zhenzi, Yang and important Part 1 discoveries.

The cross-profile propagation ledger covers curse transfer, Youyou's ceremony, the Dragon Sanctuary finale, Oshira's control, Deathwing's final battle, White Magician's gem extraction, Cassandra/Ainz negotiation, Emperor/Haku succession and Xierlun engagement planning. Each row records the character-specific role, consequence, actual knowledge, relationship change, ability/status transition and unresolved effects. It never copies a generic event summary into every profile or infers knowledge from presence.

## 8. Gap routing

Every unresolved relevant issue is routed to one or more of:

`PROFILE_ONLY`, `WORLDBOOK_REQUIRED`, `EVENT_LAYER_REQUIRED`, `CURRENT_STATE_REQUIRED`, `CHARACTER_DISCOVERY_REQUIRED`, `HUMAN_DECISION_REQUIRED`, or `SEEN_NOT_PROMOTED`.

Cross-layer corrections are reported and may receive draft-only patch candidates, but R2C never applies them.

## 9. Deterministic compiler and transaction model

The compiler consumes frozen inputs plus migration packages and deterministically generates:

- Profile v2 candidate JSON;
- claim migration ledger;
- cross-profile propagation ledger;
- gap routing ledger;
- Chinese review Markdown;
- audit summaries and blocker reports.

Before writing output, it verifies hashes for all frozen earlier-phase inputs. It builds into a temporary directory, validates every schema and invariant, verifies the frozen schema hash, and atomically replaces the generated R2C tree only after all gates pass. Validators never rewrite authoritative input or migration decisions.

Schema failure writes diagnostic material only and returns `R2C_SCHEMA_BLOCKED`. A safe-schema but incomplete semantic migration returns `R2C_PROFILE_REBUILD_BLOCKED`. Neither condition may be bypassed by weakening the schema or evidence rules.

Two independent complete builds must yield identical file sets and zero byte differences.

## 10. Human-review projection

Every candidate receives a Simplified Chinese Markdown review that can be understood without opening event IDs, revelations or raw JSON. Its thirteen sections cover identity, biography, persona, motivations, goals, readable chronology, relationships, ability/status transitions, knowledge timeline, D3 state, unresolved issues/prohibited inference, differences from the old profile, and technical provenance.

Readable headings combine story order and a Chinese event title, for example `P2-023 — 地下兵工厂交锋`. Technical IDs and sources appear beneath the explanation. A review fails if a human cannot answer the acceptance questions directly from the document.

## 11. Output tree

```text
work/phase3d_r2c/
    schemas/
        character_profile_v2.schema.json
        npc_profile_v2.schema.json
        pc_continuity_v2.schema.json
    migration_packages/<PROFILE_ID>.json
    candidates/by_profile/<PROFILE_ID>.json
    reviews/by_character/<PROFILE_ID>.md
    migration/
        claim_migration_ledger.jsonl
        cross_profile_event_propagation.jsonl
        profile_gap_routing.jsonl
    reports/
        schema_validation_report.md
        fixture_validation_report.md
        migration_summary.md
        cross_profile_event_audit.md
        unresolved_profile_questions.md
        part1_retention_migration_audit.md
        pc_control_boundary_report.md
        human_review_quality_report.md
        source_fallback_log.jsonl
        r2c_review.md
    patches/
        draft-only patch candidates where required
```

No R2C build may create `output/npc_profiles.jsonl`, `output/pc_continuity.jsonl`, runtime projections, cards or Phase 4 artifacts.

## 12. Verification and completion

Tests cover all forty mandatory regression requirements from the approved R2C contract, including schema validity, structural separation, explicit chronology, relationship ordering, knowledge acquisition/supersession, uncertainty, evidence/reality boundaries, indirect Deathwing continuity, all named high-risk regressions, Part 1 retention, Yang's provisional status, D3-only state, Special Interlude isolation, PC permissions, human-review readability, complete old-claim disposition and absence of forbidden outputs or mutations.

The focused suite is followed by two independent complete builds, byte comparison, frozen-hash verification and the entire existing regression suite.

The compiler emits `READY_FOR_HUMAN_APPROVAL_AFTER_R2` only when every schema, semantic, review, boundary, determinism and regression gate passes. Human approval is the next and only next gate.
