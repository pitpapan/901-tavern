# Sol High 六书接入最小测试判定

执行角色：gpt-6.1-sol，high；酒馆剧情主持模型配置：`makersuite` / `gemini-3.5-flash-lite`（`live-install.json`）。判定范围限于这一次隔离测试聊天及一条药B恢复行动。

**有范围通过。** 六本候选原生世界书能经当前 JS 过滤器保留，外来世界书在续述阶段被隔离；同一玩家行动重试后，由 Gemini 续写并由 JS/MVU 完成一次恢复结算。首次尝试是 `UNRESOLVED`、revision 0，原始失败诊断不可用；不能据后续成功认定首次失败的根因已被修复。

本地真实过滤函数的最小命令：

```powershell
node output/replay_tavern/six_books_20261023_candidate/minimal_test/six-book-filter-smoke.mjs
node --test --test-name-pattern="a Builder state can be initialized and a check is saved once without changing the actor" work/rules_engine/mvu_poc/adapter.test.mjs
```

两命令均退出 0。六书各取一条可用原生 JSON 条目，外加一条无关书，经 `withReplayLorebook` 后候选 6→6、外来 1→0；定向 MVU 检定持久化测试 1 通过、0 失败。补丁前同一输入候选 6→1、外来 1→0，见 `before-fix.md`。主持卡内嵌的 01 有 36 条，样本正文与独立 01 JSON 一致。宿主事件在本地脚本中为 stub，过滤器本身是真实模块函数。

酒馆证据在 `live-attempt.jsonl`、`live-final.jsonl`、`live-result.json`、`activation-log.json` 和 `live-result.png`。首次回复保留为 `UNRESOLVED` 且无结算；重试后玩家楼层和最终回复为 `APPLIED`。MVU revision 0→1，仅有 1 个 operation；药B库存 3→2，严重伤害 6→1，完好生命 2→7。诊断记录分类调用 1 次、续述调用 1 次，最终分类器消息 2 条。第二次 `WORLD_INFO_ACTIVATED` 回调记录续述激活 15 条，六书分布为 01:5、02:1、03:1、04:3、05:1、06:4，外来书 0。第一次回调共 105 条，含旧书和外来书，发生在分类器原生扫描；它不能当作续述白名单失败，因为最终分类器只组装了显式的 2 条消息。这里依据激活回调与诊断记录判断，没有逐字保存最终发送的 Gemini Prompt。

关键代码：`work/rules_engine/gm_runtime/adjudication-gate.mjs:139-158`（去重名单和四类宿主数组过滤）、`:350`（分类器显式消息）、`work/rules_engine/gm_runtime/replay-gate-script.example.js:254-256`（分类器按名单读书）、`:357-358`（普通续述按名单过滤）、`work/rules_engine/gm_runtime/replay-check.mjs:199-234`（恢复请求结算）。首次 `UNRESOLVED` 的请求 `药B` 符合 `validRecoveryRequest`、`recoveryDeclarationOrderMatches` 和 `explicitRecoveryDeclaration`；未保存的诊断仍不足以定位那次失败。
