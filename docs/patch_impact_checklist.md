# Canon Patch Impact Checklist

任何 approved patch 在应用前都必须完成本清单。Reviewer 应把结果写入 patch review notes 或独立审核记录；未检查项必须阻止应用。

## A. 身份与来源

- [ ] `patch_id` 唯一且从未复用。
- [ ] `created_from` 中每个 source ID 或文件引用可解析。
- [ ] Authorial Supplement 已完成 authorial/conflict review。
- [ ] Continuation source 为 `confirmed`。
- [ ] Director Item 未被直接作为 Canon source。
- [ ] provenance 能说明提供者、来源、原因和记录时间。

## B. Canon 边界

- [ ] proposed fact 与 source 的确定性一致。
- [ ] rumor、belief、suspicion、lie 和推理未升级成客观事实。
- [ ] `canon_origin` 与 temporal/narrative scope 未混淆。
- [ ] 与 Original Campaign Canon 冲突时已标记 `CANON_CONFLICT`。
- [ ] explicit retcon 有独立人工决定，不是 AI 自动选择。
- [ ] Special Interlude 内容未泄漏到普通主世界层。

## C. 目标数据库影响

- [ ] affected Worldbook entries 已列出并核对。
- [ ] affected NPC Profiles 已列出；Phase 3 前不得实际应用到不存在的数据库。
- [ ] affected Current State 已列出，并确认只保留当前 snapshot。
- [ ] affected Director Items 已列出；Canon 变化不会把未实现方向变成历史事实。
- [ ] affected Rules 已列出。
- [ ] 多目标变更已拆成独立、可审核 patch。

## D. Referential Integrity

- [ ] `target_id` 存在，或 add 操作证明 ID 未占用。
- [ ] `affected_entries` 完整。
- [ ] 所有引用 ID 存在或由同一批准批次先行创建。
- [ ] supersedes / superseded_by 双向关系一致。
- [ ] supersede chain 无循环、无断链、无 ID 复用。
- [ ] deprecate 不会物理删除历史来源或 provenance。

## E. Trigger 与检索影响

- [ ] name / aliases / keys 是否变化已明确。
- [ ] 新 key 已评估 safe / contextual / overbroad。
- [ ] 通用词、单字符和裸 ASCII key 已拒绝或严格门控。
- [ ] 与其他 entry 的 exact key conflict 已检查。
- [ ] near-duplicate 和 alias 关系有强证据或人工决定。
- [ ] runtime trigger rebuild 被列为应用后的派生步骤。

## F. Visibility 与 Knowledge Partition

- [ ] visibility 为 public / restricted / secret 之一。
- [ ] restricted/secret 至少填写 `known_by` 或 `unknown_to`。
- [ ] 同一主体未同时出现在 known_by 与 unknown_to。
- [ ] 客观秘密与 belief/suspicion/rumor/director hypothesis 已区分。
- [ ] NPC knowledge 更新不会泄露玩家未知或角色未知事实。

## G. 数据变更与回滚线索

- [ ] `proposed_changes.before` 精确保存原值。
- [ ] `proposed_changes.after` 精确保存新值。
- [ ] operation 仅为 add / update / supersede / deprecate。
- [ ] 没有 destructive delete。
- [ ] conflict_check 已完成且无 unresolved blocker。
- [ ] 人工 approval 包含批准者和时间。
- [ ] 应用前记录目标数据库 hash 与 entry count。
- [ ] 应用后将记录结果引用、新 hash、validator 和 tests。

## H. 应用门槛

- [ ] 临时合并产物通过目标 schema/validator。
- [ ] unique IDs、unique names 和 key conflicts 已检查。
- [ ] 写入采用 atomic replacement。
- [ ] 正式数据库不会被 draft/review/rejected patch 改动。
- [ ] 应用后 rebuild 只生成 derived artifacts，不反向污染 Canon。

## 审核结论

- Reviewer：`<human reviewer>`
- Review time：`<ISO-8601 timestamp>`
- Baseline hash：`<SHA-256>`
- Result：`approve / reject / return_for_revision`
- Blocking items：`<none or list>`
- Notes：`<review notes>`
