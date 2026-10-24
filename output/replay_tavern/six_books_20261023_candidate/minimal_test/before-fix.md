# 六书过滤最小复现（补丁前）

模型：gpt-6.1-sol，high。命令：

```powershell
node output/replay_tavern/six_books_20261023_candidate/minimal_test/six-book-filter-smoke.mjs
```

结果：退出码 1；候选六书各取一条可用条目，并加入一条无关世界书。事件 stub 仅模拟宿主把加载条目数组交给监听器，实际过滤执行 `withReplayLorebook`。候选条目过滤前 6、过滤后 1（仅 `901_01_世界基础设定_20261023`）；无关条目过滤前 1、过滤后 0。监听器已停止一次。主持卡内嵌 01 共 36 条，抽样条目正文与独立 01 JSON 一致。

断言失败：`candidateAfter` 实际 1，预期 6。原因是 `work/rules_engine/gm_runtime/adjudication-gate.mjs:139-149` 仅按传入的一个 `book` 名保留条目，而 `replay-gate-script.example.js:356-357` 给普通续述传入 `getCurrentCharPrimaryLorebook()`。本复现未运行 SillyTavern Prompt 组装或 Sol API。
