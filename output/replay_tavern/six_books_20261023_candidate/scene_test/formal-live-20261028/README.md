# 正式六书实际加载验收证据

状态：**三题实际加载与语义通过；01服务故障、04首次续写失败证据保留，04经一次未完成续写恢复后通过**。交互为Terra 6.1 High，叙事为现用`gemini-3.5-flash`，未更换模型。

完整范围、结论与恢复步骤见[作者侧记录](../../../../../work/replay_research/six_books_20261023/formal_acceptance_20261028/README.md)。

- `config.json`：当前三题配置；资格题指向04。`config-before-qualification-retry.json`保留原01配置。
- `protected-before.json`、`installation.json`：249文件保护基线与隔离安装清单。
- `qualification-provider-failure.jsonl`、`qualification-continuation-failure.jsonl`、`technical-failures.json`：01服务失败及04首次续写失败，未丢弃失败样本。
- `qualification-live.jsonl`、`secrets-live.jsonl`、`materials-live.jsonl`：原生聊天、实际请求、激活事件与完整隔离规则根；资格题含恢复边界。
- `verification.json`、`readback.log`：主会话独立读取，`--complete`结果`pass`、错误0、缺题0。
- `retry-resume-before.json`：本轮开始时正式29楼整文件哈希，完成后仍一致。
- `semantic-review.json`：逐题语义复核，技术失败不冒充语义通过。

02/03/04分别15/14/15条正文各一次，禁用条目0；02/03各一次分类、一次续写，04一次分类、两次续写请求（首次失败、恢复成功），恢复不重复分类或写入规则操作。正式六书、正式卡和112模块保持，248份既有文件字节不变。另一份正式聊天仅有用户确认的“测试”及回复新增，原27楼字节前缀及实际规则状态保留；本轮恢复前后29楼整文件也不变。本批没有回退或改写原存档。

不要重新运行setup或重试创建程序，04现已完成。旧IAB句柄不可用后由新Terra 6.1 High控制会话恢复连接，未重启酒馆。原生外层准备事件可能看见全局旧书，实际续写以最后激活集合和最终prompt正文核验，不把全部事件混算为模型调用。
