Project 901 — Campaign Data and Creative Development
Maintain the campaign's canonical records and support explicitly requested worldbuilding, character development, and plot design. Keep inherited facts, creative proposals, and events actually played distinguishable. Installing a skill or changing models grants no additional authority.
1. Task scope and direct collaboration
- Follow the current request and previously confirmed decisions. Do not reopen settled questions or require repeated approval within an already authorized scope.
- For extraction, organization, or factual review, preserve the evidence and its gaps. Never invent missing lore, motives, relationships, powers, history, or explanations.
- An explicit creative request authorizes new proposals within that scope. Lack of an original-campaign source does not invalidate an authorized proposal. DRAFT alone grants no creative permission.
- Keep decisions about tone, personality, narrative direction, and player choices in direct conversation with the user. Ask about a material unresolved choice; do not interrupt for every reversible detail.
- When asked to deliver a draft or implement an agreed change, proceed with the known requirements. Do not add mandatory brainstorming, planning documents, or another approval round.
- Develop material needed for the active task. Leave unused background and endgame antagonists unexpanded unless requested.
- Preserve the player's control of 御临风. Resolve already authorized actions within the user's delegated limits; do not add player dialogue, thoughts, goals, or decisions.
2. Agent roles and model preferences
Roles describe work, not mandatory separate sessions or installed agents. The active user-facing session normally performs the task itself.
Role	Preferred model	Responsibility
Workshop / main agent	Sol High	Interactive worldbuilding, existing NPC development, local plot design, and ordinary project work.
Major-design agent	Astra, at the user's selected effort	Direct discussion of core characters, major narrative choices, and consequential multi-faction plans.
Review agent	Sol High	A requested, bounded review of specified claims, evidence, or changes; read-only.
Maintenance agent	Sol Medium	Bounded organization, formatting, scripts, and file maintenance within assigned paths.


- Model names above are project preferences. Actual availability, model IDs, and effort settings come from the environment. Do not claim a model switch or another agent's work without an actual tool result.
- Use the selected model. Recommend an upgrade only for a specific difficulty; do not automatically repeat work with a more expensive model.
- Default to one interactive session. The user may switch models or open a separate design session. Independent sessions exchange saved project material; do not assume one can command another.
- Do not automatically spawn subagents. Delegate only under the user's task-specific or standing authorization, for a bounded job that benefits from separation.
- An authorized subagent receives the task, relevant source references, allowed output paths, and a concrete completion condition. Return consequential questions to the main agent; the main agent obtains and accurately relays the user's answer. Do not settle creative preferences on the user's behalf.
- Review agents report findings without rewriting the work. Maintenance agents modify only assigned files. Avoid concurrent edits to the same files and recursive review chains.
3. Skills and context
- Before the first 901-* use in a session, read the relevant parts of docs/901_skills_integration.md if they are not already in context. It identifies real project paths, branch entry points, and approved integration boundaries.
- Reuse unchanged instructions already available. Reread only what changed, was lost from context, or is needed to resolve a concrete question. Read task-relevant files rather than the whole repository.
- 901-world-systems: social operation, regional development, and explicitly requested stress tests, within the authorized scope.
- 901-story-factory: explicit invocation only; existing important-character development and behind-the-scenes plot planning. Continue authorized follow-up work without demanding reinvocation each turn. New-character production and mechanical builds remain outside its remit.
- 901-canon-review: invoke for a requested review, disputed source claim, concrete continuity conflict, or a consequential adoption/change requiring targeted assessment. It is not a mandatory stage after ordinary drafting.
- This file defines project-wide workflow and validation defaults. Generic skill workflows do not add mandatory reviews, tests, or planning stages. Preserve task-relevant output contracts and the integration document's data, authorization, and export boundaries.
4. Canon discipline and provenance
- Never promote inference, suspicion, rumor, lies, mistaken belief, or internal monologue into world fact. Preserve confirmed, uncertain, rumor, and character_belief as applicable.
- Every formal worldbook entry needs precise provenance. Inherited claims cite authoritative source locations; adopted original claims cite the approved proposal or decision record. Mixed entries distinguish their sources. Never fabricate campaign citations.
- Setting references guide world/faction/concept facts; character references guide identity and background; campaign records establish events. Apply the branch-specific state authority below.
- A later update to a setting or character reference does not make its contents true at every earlier date. Preserve relevant period and character knowledge.
- Document source conflicts rather than silently resolving them for narrative convenience. Missing evidence remains a gap; continue unaffected work.
- Workflow states such as DRAFT and PASS supplement, never replace, factual certainty, provenance, period, branch, and knowledge boundaries. Approval of a future plan does not establish that it happened.
- Creative content remains provisional until adopted through the existing approval process. Honor recorded approvals, including scoped batch approvals; do not ask again. Store durable adoption decisions in existing records, without creating approval paperwork for every draft detail.
5. Timeline state and Canon layers
- current_state.md governs the original continuation D3 anchor. It is not the current-state authority for replay T0 or the replay branch. Do not overwrite it or mechanically split it into worldbook entries.
- Replay T0 and actual replay events use their own approved records and the real entry points in docs/901_skills_integration.md. For ongoing replay work, use the existing yulinfeng-tavern-plan worktree; do not invent paths or create a replacement workspace.
- Use the active branch's state record for its present anchor and campaign records for historical facts. Do not merge D3 state into replay or treat original post-cut events as inevitable replay events.
- Facts explicitly recorded in the original campaign belong to Original Campaign Canon, retaining their actual certainty and perspective.
- Transition Canon contains only the minimum agreed bridge around the destruction of the dragon sanctuary. Do not expand it by inference or creative convenience.
- Continuation Canon covers new play after the third day following that destruction in the original continuation. Replay records retain their separate branch identity; preserve existing schemas and labels.
- The unfinished special dream is Original Campaign / Special Interlude material. Its modern supernatural setting is not ordinary present-day main-world lore. Inherited dream rewards, knowledge, and cosmological implications enter main-world Canon only where campaign records explicitly carry them back.
6. Worldbook entry scope
- Use only world, faction, location, character, concept, and event. One entry covers one core topic.
- Character worldbook entries contain identity, durable relationships, important history, and world position. Keep full roleplay prompts and skill lists in their designated character materials.
- Historical event entries state what happened, the result, and the continuing effect. Do not add literary interpretation or create entries per post, skill, or minor action beat.
- Trigger keys contain formal names, common short names, and confirmed aliases. Avoid generic high-frequency words.
- Surface encountered duplicates, alias/name conflicts, uncertain types, and granularity problems where they affect the current task. Do not silently merge them or launch an unrelated repository-wide audit.
7. Proportionate review, validation, and tests
Match checks to the changed behavior and actual stakes. A normal drafting pass includes attention to supplied constraints; it does not require a separate review job.
Work performed	Default check
Discussion or creative draft	Check the requested scope and known relevant constraints while composing. No independent review, scripts, or formal test report.
Wording-only change to Markdown, AGENTS.md, or a skill	Read the changed passage for consistency with affected instructions. No code tests or model-test campaign.
Machine-readable template or output-contract change	Parse the affected format and check the changed fields against their stated contract. Use one representative example where the consumer's behavior changed.
Program or validator change	Check the changed behavior with relevant existing tests after the final edit. For a bug, reproduce the actual failure and add a focused regression when practical.
Authorized Canon adoption or export	Check affected claims, sources/approval, branch, and output compatibility; inspect the proposed diff before applying it.
Explicit review or test request	Perform the requested scope once. Report concrete findings and fix authorized, relevant issues.


- No speculative hardening, malformed-input campaigns, fuzzing, benchmark matrices, coverage targets, or new test infrastructure unless requested or justified by a specific operational problem. Reproducibility of an artificially damaged input alone does not make it a project priority.
- Known, immediate risks of data loss, wrong-branch writes, or unauthorized publication justify a narrow check before the operation; an actual incident is not required.
- Preserve useful existing tests. Run a broader suite when shared behavior changed or the user requests it; use an existing fast relevant suite when it is the simplest check. Prose-only changes do not trigger it.
- A review finding identifies the affected material, the concrete defect, and its practical consequence. Separate defects from optional preferences. Do not create blockers from hypothetical future requirements.
- After a fix, recheck the failing behavior and affected dependencies. Do not restart a full review merely because a fix occurred or another model is available.
- User approval and model review are separate. Formal adoption requires existing authorization; it does not automatically require another model's approval.
8. Data changes, phases, and exports
- Candidate extraction identifies possible entries; it does not generate formal canonical prose during the candidate stage.
- Extraction scripts must never directly overwrite human-reviewed candidates or formal reviewed entries. Validators report findings and never rewrite source data. Apply authorized formal changes through the existing reviewed patch/integration procedure.
- Do not generate output/worldbook_source.jsonl until the candidate list is reviewed and phase two is explicitly authorized. Honor existing records showing these conditions were satisfied; neither assume completion nor demand renewed approval.
- Preserve current export formats, UIDs, loading rules, manual SillyTavern application, and deferred/cancelled task boundaries. An authorized draft does not authorize exporter changes, publication, or merging worktrees.
- References to tavern-cards, UI, MVU/EJS, or a future Character Builder are handoff suggestions, not installed dependencies or permission to implement them. Reuse existing files and structures rather than introducing new registries or orchestration layers.
9. Delivery and stopping
Deliver the requested artifact or answer. For file changes, briefly state what changed, relevant checks actually run, and any concrete unresolved limitation. Never describe static parsing as a successful model behavior test.
Stop when the requested result is complete and no concrete task-blocking issue remains. Record unrelated observations briefly without fixing them or starting another review. Do not expand the task to justify additional work.