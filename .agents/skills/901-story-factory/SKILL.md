---
name: 901-story-factory
description: 为901世界书深化已有重要人物的性格、动机和背景，或在关键剧情节点编写幕后剧情方案。Use for npc-develop and plot-design against existing 901 Canon and current-timeline records. Do not use for batch NPC creation, new character production, mechanical character builds, daily GM roleplay, or SillyTavern packaging.
---

# 901 — 重要人物深化与幕后剧情规划

## 边界
本 Skill 只负责 **`npc-develop`（已有重要人物深化）** 和 **`plot-design`（幕后剧情规划）**。适用于开发期或重大节点的低频幕后工作；**不在 SillyTavern 中自动运行，也不要求常驻多智能体**。普通游玩由单一 GM 继续。

**不负责**批量 NPC 生产、新角色首次构筑、初始六属性/主技能/子技能/HP/能量的分配、特殊资源/能力设计与等级平衡。此 Skill 遇到这些需求只给出**需求占位**；用户明确授权创作时，由当前主会话按现有 [Character Builder 创作指导](../../../work/character_builder/README.md#资源撰写模式)处理。Builder 程序不是另一个已安装的 Skill 或 Agent。

## 模式路由（每次仅选一个主模式）
- **`npc-develop`**：输入已经存在的角色 ID、档案和经历，补足性格、动机、关系、心理矛盾、行为依据与个人背景。见 [人物深化](references/npc-develop.md)，使用 [人物深化模板](assets/character-development.yaml)。
- **`plot-design`**：输入已发生事件和现有势力/人物，针对重要转折构思冲突、幕后真相、证据、可能行动及开放式后果。见 [幕后剧情规划](references/plot-design.md)，使用 [剧情包模板](assets/plot-packet.yaml)。
- 任务只是创建人物名单、批量候选、第一次选用跨作品角色并制作角色卡：**本 Skill 不执行**。未获构筑授权时只标 `PENDING_BUILDER`；已获授权时按上文现有创作指导处理，不假装本 Skill 完成了构筑。

## 共同执行流程
1. **读真实资料**：检查实际 901 仓库中的 Approved Canon、重开切入点、当前时间线事件记录、既有人物/势力索引与当前任务。不可猜测路径或编造原团事实；来源缺失时仅给有限 `DRAFT`，列出所缺材料。
2. **定范围**：确定人物 ID 或剧情冲突、当前游戏时间、涉及地区、已知事实与 GM 隐藏信息；优先复用既有角色和矛盾。
3. **先做证据区分**：分别列出原团已核准事实、当前时间线的既成事实、来源作品参考、新创作提案与未知项。跨作品本土化或穿越角色只有经过确认的部分可继承。
4. **针对性设计**：按主模式生成最小足用结果。人物无需统一模板化成悲惨身世；剧情无需固定玩家选择、强制高潮或必须出现终局反派。
5. **锁定边界**：真实发生的行动、已展示的证据和已确立的历史不能事后改写。仍属候选的背景、动机和未来计划可以修订；重要隐藏事实一旦成为行动原因或留下可验证证据，应先固定再继续推进。
6. **审查**：使用 `901-canon-review` 的证据与一致性原则检查重大新设定。记录矛盾与未确认信息，不将创作草案直接升级为正史。
7. **交接**：只写入明确允许的草案或 GM 幕后资料位置。需要新人物、角色战力、特殊资源时输出需求清单；经明确授权再由当前主会话按上文创作指导处理。需要酒馆条目转换时交给上游 `tavern-cards`。

## 事实状态与玩家权利
- `DRAFT`：可修改的创作草案；`ELIGIBLE`：通过一致性核查的可用候选，尚未自动成为事实。
- `ESTABLISHED` 只能引用**已经在当前时间线生效、并有记录支持**的事实；不能靠本 Skill 自己批准或宣布成立。
- 御临风的行动、台词、内心与最终选择由玩家决定；幕后规划不得预定他会接受任务、发现秘密、必胜或必败。

## 输出合同
两种模式共同写明 `mode`、`scope`、`source_files`、`established_constraints`、`unknowns`、`continuity_checks`、`status`、`handoff`。
- `npc-develop`：额外包含已有 `character_id` 与分组 `proposals`（依据[人物模板](assets/character-development.yaml)）。
- `plot-design`：额外包含 `plot_id`、`premise`、`actors`、`hidden_facts`、`leads`、`next_actions`、`contingencies`、`resolution_conditions`、`visibility` 和 `role_requirements`（可为空）；这些分组共同承载剧情提案，不再另增内容重复的顶层 `proposals`（依据[剧情模板](assets/plot-packet.yaml)）。
每条提案与已确立约束分开；涉及重要人物知情范围时记录人物 ID、所知事实或误信、信息来源与获知时点。**不要输出未经请求的新 NPC 正式卡或战斗资源配置。**
