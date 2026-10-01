# HAP-0-R 中文人物连续性审批包设计

## 目标

从已关闭、已验证的 R2C production 生成 37 份中文优先、以人物语义为中心的人工审批档案，以及中文总索引、分批审批说明和 R1A 关闭清单。审批材料只是 `final repaired production -> readable projection`，不得成为新 authority，也不得修改 production。

## 输入与冻结边界

- 语义输入：`work/phase3d_r2c/candidates/by_profile/*.json` 与对应 `migration_packages/*.json`。
- 修复说明输入：R1A realization lineage、R1A-FIX-1 amendment 和已发布审计结果。
- 生产基线必须是 140 文件，aggregate SHA-256 `cfcaa00b3e93c83f1fc49839dbf5c7b9aee646dfcd4ebd22cdb2365aa2aefad3`。
- R1A-FIX-1 amendment 必须是 `b6e3e29da8aa3f7a9f4c22c931fed2c84c56b414e6fac9d59a691f1786724817`。
- 生成前后 production 指纹必须一致。

## 投影结构

每份档案以人物中文名为标题，依次包含人物概览、已确认背景、按自然阶段合并的主要经历、人格与价值观、核心关系、知识与传闻、能力装备状态、当前可确认状态、未知/禁止延伸事项、R1A 修复变化（仅受影响人物）、人工审核重点、人工决定，以及末尾技术附录。

正文使用 production 已有陈述的保守组合，不创造因果、动机或当前状态。Timeline 仅按稳定 story-order 大阶段分组，并把多个相邻记录合并成段落；event/claim/source/destination ID 仅进入附录。关系 `current_stance = null` 显示为“当前关系立场：未确认”，不得改写为中立、疏远或亲密。

知识状态、持续性、生命状态和不确定性使用固定中文词汇映射。英文 relationship baseline 仅使用有限、显式的逐值中文映射；未知值不得猜译，生成器应失败。

PC `PC_YU_LINFENG` 额外显示“PC 控制边界”，明确历史事实可引用，但不得生成私密思想、自主对白、未做决定、永久承诺或未来计划。

## 生成架构

新增单一确定性生成器 `scripts/build_hap0r_approval_package.py`：

1. 验证 frozen fingerprint、amendment hash、37 个 candidate/package 一一对应；
2. 构造只含现有语义的中文正文投影；
3. 生成 37 份 profile Markdown、中文审批索引、中文 batch 文件、closure manifest；
4. 对正文和附录分界后执行可读性扫描；
5. 在临时目录完整生成两次并逐字节比较；
6. 仅在验证通过后原子替换审批输出，不触碰 production。

## 可读性与一致性验证

- 主体不得以 `EVENT_` 或 `CLAIM_` 作为标题，不得连续堆叠技术 ID、raw JSON 或 schema 字段。
- 主体不得出现未翻译的内部 enum，亦不得显示 `current_stance = null`。
- 37 份档案必须覆盖 36 NPC + 1 PC，无缺失、无额外文件。
- 每份档案的证据附录保留 profile、event、claim、destination 与 source lineage。
- 所有关系对象、knowledge proposition、ability transition、evidence gap 必须可追溯到对应 candidate/package；生成器不得调用语义推断或 source prose 重解读。
- 悠悠/御临风、安兹以及 PC control boundary 设专门回归锚点。

## 输出

- `docs/remediation/R1A_CLOSURE_MANIFEST.md`
- `docs/human_approval/R1A_CLOSED_PROFILE_APPROVAL_INDEX.md`
- `docs/human_approval/R1A_CLOSED_APPROVAL_BATCHES.md`
- `work/human_approval/r1a_closed/by_profile/<PROFILE_ID>.md`

最终状态仅为 `READY_FOR_HUMAN_PROFILE_REVIEW`，不进入 Phase 4。
