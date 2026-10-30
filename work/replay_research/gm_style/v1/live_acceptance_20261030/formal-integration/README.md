# 正式主持入口两项汇合（2026-10-30）

用户授权由资源引擎线接手世界书线提交 `10be5f8` 的两项调用修复：完整已采用文风进入实际主持续写，以及解除续写额外的六条历史上限。两项已完成生成链汇合、正式有界安装和新隔离复验；见本目录 `installation.json`、`protection-after.json`、`final-verification.json` 及实际采集记录。

Astra独立验收：修正夹具后的实测包含1次分类、1次实际续写；第三个settings事件属于被拦截的原生组装。续写system完整包含同一2757字符文风一次，7条既存历史正文全部保留，分类器不加载旧历史。新回复准确回答27号、外衣内袋、未出示、私人猜测未公开及未订房付款交包。磁盘完整规则root与零结算种子相同，revision0、operations为空；262份既有文件保护通过。实际请求回归2/2通过，不把首次readiness阻止算成模型调用或成功样本。

## 范围

- 正式目标：8000 的 `901 帝都初始卡` 中 `901 帝都初始卡入口`，及其 `/901-opening-combat/narrative-style.json`。
- 入口基于现场内容，只修改 `modelOptions` 的 `max_chat_history` 和显式文风 system 消息；其余卡字段、脚本、六书筛选、场景约束与规则门控保持。
- 文风来自作者 `authoring.json` 的稳定标识 `901-gm-style-v1`，2757 字符，SHA256 `19361c47654c8559968aa0fb245178c8a0ce0186fd52a96777e2d5959f78f62a`。全文不重新改写。
- 续写用 `'all'` 交给宿主既有上下文预算；分类器仍为 `0`。战斗沿原 `narrationRequest(facts,style)` 取得同一正文。
- 本次不安装任何运行模块或六书，不部署未提交的冰霜 D/C 候选。历史“行动尚未执行”的异常诊断缺口另行保留。

## 保护及隔离实测方法

`manage.mjs prepare` 对当前262份角色、聊天、世界书和正式运行资源记录哈希。正式阶段仅允许正式卡PNG和文风JSON两份文件变化，另对整张解析后的卡校验仅入口内容变化；完整 `oai_settings` 和 memory 设置保持原哈希。正式聊天全部按字节保护，31楼不重生成。现场原卡及文风备份仅供本地回退，原卡备份不提交。

新卡 `901 正式入口汇合验收 20261030` 从本次正式预期卡复制，保留正式资源路径，增加只读采集器。前三轮使用先前候选复验已保存的合成对话文本作为重放输入，不声称三轮是本次新生成；本次实际题目仅为第4轮记忆与知情核对。新卡额外书绑定独立添加，不修改正式绑定或模型参数。

首次尝试仅放入文本，触发 `integrated.mjs prepare()` 对“已有多轮聊天缺失规则存档”的既有保护：`failureStage:readiness`，分类和续写请求均0。完整失败采集保留在 `attempt-1-readiness.json`；不是模型回复质量失败，也没有改动正式保护逻辑。Astra修正隔离夹具：从既有候选隔离聊天第6楼读取 `variables[0].stat_data.901_rules_poc`，核实revision0、无battle、operations为空，仅重绑定chatId后放入新卡种子末楼。来源和目标哈希见 `seed-repair-summary.json`。原候选聊天未写入，正式聊天未读取或迁移状态；失败聊天原文件另在本地备份。随后只对修正后的同一隔离题目复试，不运行第5轮。

采集检查按含“裁定路径”的用户消息识别实际门控续写。被拦截的原生组装事件不计为实际续写或计费请求。结果须验证完整文风和首轮私人记录进入实际请求，并人工核对新回复的27号、外衣内袋、未出示与私人猜测边界。

交互由 Terra High 使用内置浏览器完成；源代码修复、定向战斗参数检查与结果验收由 Astra 负责。此次不新增现场战斗结算，不将参数测试表述为战斗模型实测，不宣称无限上下文或长期记忆通过。

## 生成链和定向检查

`narrative-style-projection.mjs` 按稳定identifier提取全文，并对旧入口只补两处参数。`build-integrated.mjs` 不再按旧段首正则摘取战斗文风；六书 `build_candidate.py --runtime` 直接投影该入口并生成文风JSON及资产哈希，即使中间CARD尚旧也不会退回六条历史或漏载文风。

88项定向测试通过，含新文风测试和既有narrative、adjudication、replay-gate测试；首个真实回归失败记录及Windows测试编码失败记录保留。六书验证通过：6书、580条、282资源，并核验完整依赖哈希及新增文风资产。当前开发候选1412份既有文件中只改两个入口JSON和manifest，另新增文风JSON；其余字节不变，验证运行后1413份文件哈希仍无额外变化。证据在 `work/rules_engine/gm_runtime/narrative-style-{final,six-books}-20261030.log` 和 `narrative-style-candidate-sync-20261030.json`。

## 复核入口

在战役库根执行：

```powershell
node work/replay_research/gm_style/v1/live_acceptance_20261030/formal-integration/manage.mjs verify
node work/replay_research/gm_style/v1/live_acceptance_20261030/check-capture.mjs formal-integration
```

`prepare` 和 `install` 为一次性操作，不重复运行。新卡的原生UI请求由用户要求的 Terra 交互产生，管理脚本不调用模型生成。
