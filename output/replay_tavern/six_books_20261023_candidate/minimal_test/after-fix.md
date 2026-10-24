# 六书过滤与 MVU 定向复测（补丁后）

模型：gpt-6.1-sol，high。

```powershell
node output/replay_tavern/six_books_20261023_candidate/minimal_test/six-book-filter-smoke.mjs
node --test --test-name-pattern="a Builder state can be initialized and a check is saved once without changing the actor" work/rules_engine/mvu_poc/adapter.test.mjs
```

两条命令退出码均为 0。六书各取一条可用原生 JSON 条目，外加一条无关世界书，给真实 `withReplayLorebook` 传入六书显式名单；事件 stub 只模拟宿主事件。候选条目过滤前 6、过滤后 6；无关条目过滤前 1、过滤后 0。四类加载数组均经真实过滤函数处理，监听器停止一次。主持卡内嵌 01 共 36 条，抽样正文与独立 01 JSON 一致。MVU 检定持久化定向测试 1 通过、0 失败。

相关代码：`work/rules_engine/gm_runtime/adjudication-gate.mjs:139-158` 的显式名单与过滤；`work/rules_engine/gm_runtime/replay-gate-script.example.js:254-256` 的分类器取书，以及 `:357-358` 的续述过滤调用。这里未运行 SillyTavern 实际 Prompt 组装、Gemini 或 Sol API。
