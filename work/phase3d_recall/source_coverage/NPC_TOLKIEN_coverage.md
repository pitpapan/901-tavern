# NPC_TOLKIEN Source Coverage

## Character / Profile

- Character: 托尔金
- Profile ID: `NPC_TOLKIEN`
- Profile depth: `minimal`
- Source phase: `phase3b`
- Effective candidate: `work/phase3d/approved_candidates/NPC_TOLKIEN.json`

## Independent Manual Semantic Audit

- Audit: `work/phase3d_recall/manual_audits/batch_c.md`
- Post-repair verdict: `NO_UNRESOLVED_MISSING`
- Claim-level timeline rows: 2

## Previously Used Sources

- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:76-113`
- `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582`
- `output/worldbook_source.jsonl#CHARACTER_TOLKIEN`
- `work/phase3b/evidence/NPC_TOLKIEN_evidence.md`

## Additional Sources Discovered

- `extracted-first/21/posts.md`
- `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md`
- `../战报/901第二部分_1-15页源文顺读版战报/01_角色与主题线索表.md`
- `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md`
- `../战报/901第二部分_1-15页源文顺读版战报/07_帝都余波_装备整备与边关攻防.md`
- `../战报/901第二部分_1-15页源文顺读版战报/99_遗漏反查报告.md`

## Major Narrative Stages

### Canonical Worldbook summary

- Source: `output/worldbook_source.jsonl`
- Coverage outcome: ROUTED_ELSEWHERE — durable world facts remain in the canonical Worldbook.

### Early Campaign / first campaign segment

- Source: `extracted-first/21/posts.md`
- Coverage outcome: SEEN_NOT_PROMOTED — exact-name matches were reviewed and yielded no additional stable character-continuity item.

### Middle Campaign / second campaign segment

- Source: `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md`
- Source: `../战报/901第二部分_1-15页源文顺读版战报/01_角色与主题线索表.md`
- Source: `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md`
- Source: `../战报/901第二部分_1-15页源文顺读版战报/07_帝都余波_装备整备与边关攻防.md`
- Source: `../战报/901第二部分_1-15页源文顺读版战报/99_遗漏反查报告.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md`
- Source: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md`
- Coverage outcome: PROFILED — continuity-relevant facts from this stage are represented; remaining mentions were reviewed.

## Claim-Specific Character Timeline

| Stage | Source | What happened / established | Persistent consequence / boundary | Current representation | Status |
|---|---|---|---|---|---|
| Canonical Worldbook summary | `output/worldbook_source.jsonl#CHARACTER_TOLKIEN` | 他为队伍提供过锻造与魔法装备支援。 | 弃风剑重铸与龙族任务准备。 记录已发生支援。 stability=stable | `$.identity.durable_roles[0]` / `CLAIM_TOLKIEN_CRAFT_ROLE` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582` | 他为队伍提供过锻造与魔法装备支援。 | 弃风剑重铸与龙族任务准备。 记录已发生支援。 stability=stable | `$.identity.durable_roles[0]` / `CLAIM_TOLKIEN_CRAFT_ROLE` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582` | 队伍远行前，他为悠悠与同行者准备并开放一批魔法装备。 | 龙族任务准备阶段。 不扩写装备清单之外的新物品。 stability=stable | `$.identity.established_history[0]` / `CLAIM_TOLKIEN_EQUIPMENT_HISTORY` | PROFILED |
| Canonical Worldbook summary | `output/worldbook_source.jsonl#CHARACTER_TOLKIEN` | 托尔金是帝都的矮人工匠并经营铁匠铺。 | 原团帝都阶段。 minimal profile 仅保留公开身份。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_TOLKIEN_IDENTITY` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:76-113` | 托尔金是帝都的矮人工匠并经营铁匠铺。 | 原团帝都阶段。 minimal profile 仅保留公开身份。 stability=stable | `$.identity.public_identity[0]` / `CLAIM_TOLKIEN_IDENTITY` | PROFILED |
| Middle Campaign / second campaign segment | `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:76-113`; `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582` | 御临风向托尔金请求为悠悠与队伍准备装备，托尔金随后实际提供支援。 | 龙族任务准备。 仅保留已确认共同经历。 stability=stable | `$.relationships[0].established_history[0]` / `CLAIM_TOLKIEN_YU_SUPPORT` | PROFILED |
| Canonical Worldbook summary | `output/worldbook_source.jsonl#CHARACTER_TOLKIEN` | life_status=unknown; narrative_availability=inactive | 未知不等于死亡；在 promotion 前仅使用 Worldbook。 未知不等于死亡；在 promotion 前仅使用 Worldbook。 stability=conditional | `$.presence` / `STATUS_NPC_TOLKIEN_PRESENCE` | PROFILED |

## Matched Source File Dispositions

- [SEEN_NOT_PROMOTED] `extracted-first/21/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity
- [PROFILED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md` — supports `CLAIM_TOLKIEN_IDENTITY`, `CLAIM_TOLKIEN_YU_SUPPORT`
- [PROFILED] `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md` — supports `CLAIM_TOLKIEN_CRAFT_ROLE`, `CLAIM_TOLKIEN_EQUIPMENT_HISTORY`, `CLAIM_TOLKIEN_YU_SUPPORT`
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/01_角色与主题线索表.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/07_帝都余波_装备整备与边关攻防.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [SEEN_NOT_PROMOTED] `../战报/901第二部分_1-15页源文顺读版战报/99_遗漏反查报告.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims
- [ROUTED_ELSEWHERE] `output/worldbook_source.jsonl` — The Canonical Worldbook remains authoritative for persistent entity facts.

## Significant Source-Backed Items

### PROFILED

- `CLAIM_TOLKIEN_CRAFT_ROLE` — 他为队伍提供过锻造与魔法装备支援。 Sources: `output/worldbook_source.jsonl#CHARACTER_TOLKIEN`; `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582`
- `CLAIM_TOLKIEN_EQUIPMENT_HISTORY` — 队伍远行前，他为悠悠与同行者准备并开放一批魔法装备。 Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582`
- `CLAIM_TOLKIEN_IDENTITY` — 托尔金是帝都的矮人工匠并经营铁匠铺。 Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:76-113`; `output/worldbook_source.jsonl#CHARACTER_TOLKIEN`
- `CLAIM_TOLKIEN_YU_SUPPORT` — 御临风向托尔金请求为悠悠与队伍准备装备，托尔金随后实际提供支援。 Sources: `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 7/posts.md:76-113`; `extracted-second/NO.901MurginMunalos，我重临世界之日，诸逆臣皆当死去！ - 页 8/posts.md:423-582`
- `STATUS_NPC_TOLKIEN_PRESENCE` — life_status=unknown; narrative_availability=inactive Sources: `output/worldbook_source.jsonl#CHARACTER_TOLKIEN`

### ROUTED_ELSEWHERE

- Persistent entity facts → `output/worldbook_source.jsonl#CHARACTER_TOLKIEN`; profile carries only continuity-relevant detail.

### SEEN_NOT_PROMOTED

- `extracted-first/21/posts.md` — reviewed direct-name/alias match; remaining mentions are scene detail, repeated facts, roleplay mechanics, or character inference without additional durable continuity.
- `../战报/901第二部分_1-15页源文顺读版战报/00_顺读场景卡.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第二部分_1-15页源文顺读版战报/01_角色与主题线索表.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第二部分_1-15页源文顺读版战报/02_源记录事件台账.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第二部分_1-15页源文顺读版战报/07_帝都余波_装备整备与边关攻防.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.
- `../战报/901第二部分_1-15页源文顺读版战报/99_遗漏反查报告.md` — derived navigation/report duplicate; original posts or setting source was used for formal claims.

### MISSING

- None found after the source recall audit.
- MISSING remaining: 0

## Ability / Status Transitions

- Presence reviewed: life_status=`unknown`, narrative_availability=`inactive` — PROFILED.
- The required transition categories were checked; no additional durable source-backed transition was found beyond the effective profile.

## Classification Summary

- PROFILED: 5
- ROUTED_ELSEWHERE: 1
- SEEN_NOT_PROMOTED: 6
- MISSING found before repair: 0
- MISSING remaining: 0
- Forbidden fifth-state items: 0

## Classification Rules

- `PROFILED`: adequately represented in the effective profile.
- `ROUTED_ELSEWHERE`: preserved in another named authoritative record and unnecessary to duplicate.
- `SEEN_NOT_PROMOTED`: reviewed and excluded for the concrete reason shown above.
- `MISSING`: explicit and materially relevant; every item found in this audit was repaired before completion.
