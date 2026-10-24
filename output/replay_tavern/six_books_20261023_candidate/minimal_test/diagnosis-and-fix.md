# 首次未结算的诊断与修复

2026-10-23，用户要求继续诊断并修复。首次原始分类返回和异常未保存，不能追溯到唯一根因；本次修复已确认的返回格式说明缺口与异常记录缺陷，并完成一次无重试的真实 Gemini 复测。

## 已确认的诊断结果

直接读取首次 `live-attempt.jsonl` 的玩家楼层 MVU 全量快照，在内存中运行真实 `createReplayCheckRuntime`、`runGuardedTurn` 和恢复 reducer。有效分类返回可正常结算：药B 3→2、生命2→7、revision 0→1，其他命名空间不变。因此该快照没有足以稳定阻止结算的药品或伤势数据问题。宿主写入在离线复放中为模拟，不能排除当时浏览器的并发或写入异常。

对照三个明确标注的模拟输入：缺少reason的分类返回停在response_parse，保留药B请求但没有结算；本地写入拒绝停在settlement，同样保留请求且没有结算；分类API 429在返回前失败，没有药B请求。前两者均与旧记录相容，不能把其中任何一种模拟当作首次实际异常。证据与复现入口为 `offline-diagnosis.json`、`diagnose-first-attempt.mjs`。

旧恢复提示给出内部request示例，却没有像其他路径一样提供完整status/reason/request示例；校验器又要求所有路径含1至300字reason。这是实际存在的说明缺口，不是已经证实的首次模型错误。另一个明确缺陷是profile.debug=false会丢弃失败阶段和类别，导致首次失败无法区分格式、传输和本地状态异常。

## 实际修复

- 分类系统提示明确所有返回必须包含status与reason；恢复路径补上完整JSON示例和序列外层规则。没有放宽校验，没有自动补reason或推定玩家行动。
- JSON、status、reason校验错误获得稳定错误码。
- 失败元数据始终保存failureStage、调用计数、已有分类错误类别，以及可获得的HTTP状态、结构化上游状态。关闭debug仅关闭详细调试展示，不再丢掉故障定位信息。
- 已知本地锚点、MVU版本冲突、保存前变更和读回失败有可辨认的代码。日志不保存任意错误正文、完整提示词或凭据；若宿主已经丢弃上游详情，不能凭空恢复上游状态。
- 多书过滤与分类读取修复继续保留；既有单书入口仍兼容。

## 验证与部署

新增两个定向回归，先在旧逻辑复现debug关闭后诊断字段缺失，再验证修复。运行 `node --test work/rules_engine/gm_runtime/replay-gate-script.test.mjs work/rules_engine/gm_runtime/adjudication-gate.test.mjs`：49项全部通过，包括未授权动作拒绝、已结算重试不重复消耗、旁白失败恢复和六书隔离。

真实复测使用新的合成聊天“901 六书JS诊断修复复测 - 2026-10-23”，同一初始状态、相同行动、debug=false，模型继续为Gemini gemini-3.5-flash-lite。仅发送一次玩家行动，没有重试：APPLIED、revision1、operation1，药B剩2份，完好7、B1、L1、A3。续写激活六书15条、外来书0条。详见 `diagnostic-retest-result.json`、`diagnostic-retest-final.jsonl`、`diagnostic-retest-activation.json` 和 `diagnostic-retest.png`。首次旧证据全部保留。

仓库源码、候选runtime_patch、独立测试运行目录已同步。两个模块也已安装到 `D:/github/sillyTavern/public/901-opening-combat/work/rules_engine/gm_runtime/`；安装前核对旧文件与备份一致，安装后核对SHA256。记录见 `formal-runtime-install.json`，备份在 `formal-runtime-before-diagnostic-fix/`。已打开的正式酒馆页面需刷新以加载新模块。正式世界书关联、现用卡入口名单、剧情和MVU存档没有变更；关联六书仍按包内应用说明处理。

结论：确认并修复了提示说明与故障记录缺陷，新实测首轮通过。原始异常因历史证据缺失仍无法唯一归因；本次没有证据证明免费额度耗尽，也没有查询账户余额。不要将新一轮成功写成对旧异常根因的证明。
