# Phase 2.5 Errata

## 普伦达 → 贞子

`普伦达`是 Phase 2.5 审核中的错误实体名称，不是 Campaign 实体，也不是`贞子`的 alias。

### Evidence

- 对 `D:\备份文件\901记录` 下原始团录、战报、设定资料和提取文件执行全范围搜索后，`普伦达`只出现在 Phase 2.5 两份审核输出中，没有任何独立 Campaign 来源。
- `设定 人物/人物卡资料集_叙事检索版.md` 的“御临风／背景与关系”明确记载：贞子是魔兽山脉中游荡的幽魂，曾救下御临风与雪老；她的牺牲给御临风留下持续创伤。
- `TRPG outputs/extracted-first/22/posts.md` 记录御临风恢复边关记忆：贞子在黄祸龙狼追击中救下御临风，并以自己的全部作为交易代价换取御临风生还。
- `TRPG outputs/extracted-first/24/posts.md` 记录御临风明确说“贞子，早就在当初就死了，为了救我而死了”。
- `TRPG outputs/extracted-first/25/posts.md` 记录御临风向雪老告知贞子死亡及其持续自责。

### Cause

Phase 2.5 把实际属于`贞子`的御临风人物关系、已故状态和创伤连续性错误归给了一个无来源名称`普伦达`。该错误来自审核归属失配，不能转化为 alias 或 Canon。

### Correction

- 从 `work/phase2_5_referential_audit.md` 和 `work/phase2_5_runtime_roles.jsonl` 删除`普伦达`。
- 以`贞子`重建同一审核位置，referential decision 为 `APPROVE`，proposed type 为 `character`，canon layer 为 `original_campaign`。
- `贞子`当前存在状态明确为 `deceased`。
- 保留 `existing_relationship_depth_with_yulinfeng=high`、`continuity_sensitivity=high`、`profile_depth=full`、`activation_policy=full_when_active`、`knowledge_partition=true`。
- 上述 runtime 结论不推导当前存活、复活、梦境出场或未来主线地位。

除本项 factual erratum 外，Phase 2.5 的其他人工决定未重新开启或改写。
