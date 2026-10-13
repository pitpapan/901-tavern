# 901 MVU 接入 PoC（隔离测试）

本目录只验证 `core.mjs` 的状态结算能否经 MVU 写入**消息楼层**。`adapter.mjs` 不改公式，不写 MVU 的 `chat`／`character`／`global` 变量，也不写正式人物或 GM 资料。所有数据位于 `stat_data.901_rules_poc`，初始化只允许空命名空间，写入时完整保留读到的其他 MVU 字段。

## 2026-10-13 本机检查

- `D:\github\sillyTavern` 存在，酒馆助手 `JS-Slash-Runner` 在第三方扩展目录中；正式 901 GM 卡及 M1 世界书也存在。本 PoC 未修改它们。
- 未找到单独安装的 `MagVarUpdate` 扩展。`data/default-user/settings.json` 虽有 `mvu_settings` 历史设置，但酒馆助手脚本列表为空；它不能证明 MVU 正在运行。
- 检查时没有运行中的 SillyTavern 页面或相关本地监听端口，因而无法调用真实 `Mvu.getMvuData()`／`Mvu.replaceMvuData()`，也无法验证磁盘保存、刷新、继承、重生、swipe 或编辑。
- 本机酒馆助手类型声明 `@types/iframe/exported.mvu.d.ts` 规定：`getMvuData({type:'message',message_id:n})` 读取指定楼层，`replaceMvuData(data,{type:'message',message_id:n})` 返回 Promise 且**完整替换**。本适配器始终使用非负数字楼层 ID，不使用 `latest` 写入。

参考：[MVU 项目与安装说明](https://github.com/MagicalAstrogy/MagVarUpdate)、[MVU 变量框架说明](https://github.com/StageDog/tavern_resource/blob/main/.agents/skills/mvu-variable-framework/SKILL.md)。两者是 API 资料，不作为 901 数值规则来源。

## 文件与接口

- `fixture.mjs`：两名虚构测试角色、9 槽目标、固定骰序及普通长剑攻击。测试聊天 ID 由运行时提供。
- `adapter.mjs`：`initializeTestState({mvu,getAnchor,expectedChatId})`、`settleAttack({mvu,getAnchor,expectedChatId,operationId,expectedRevision,attackerId,targetId,attack})`、`readDebugState(...)`。`getAnchor()` 返回当前 `{chatId,messageId,swipeId}`。
- `manual-trigger.mjs`：`runManualDemo({mode,expectedChatId,messageId?,operationId?,expectedRevision?})`，仅供测试聊天手动调用；返回结构化结果及简短调试读数。
- `adapter.test.mjs`：Node 内存替身测试；**不是**酒馆端到端测试。

写入前读完整 MVU 数据，检查聊天身份、命名空间版本、角色必要字段和预期修订号；计算仍调用 `core.mjs` 的 `resolveAttack`。写入前再次读取，发现快照变化便停止；`await replaceMvuData(...)` 后再次读取，结果不一致便报错。相同 `operationId`、相同输入返回 `already_applied`，不再次扣血；同号不同输入报错。结果只提供摘要，绝不把整棵 `stat_data` 注入模型上下文。

`replaceMvuData` 没有已证实的原子 compare-and-swap。上述检查只能避免本模块实例内的并发操作及已观察到的旧快照；其他脚本同时写同一楼层时仍可能发生竞态。测试聊天应禁用 AI 更新块及其他数值写入者，正式使用前必须完成真实分支与竞争测试。

## 最小真实酒馆测试步骤（待执行）

1. 在 SillyTavern 新建**一次性测试卡和测试聊天**。不要选择 `901·飘零大陆主持` 或已有 901 游戏聊天；不要启用 `st-901-play` 等同时写人物数值的脚本。
2. 按 MVU 上游安装说明，将 MVU bundle 加载为该测试聊天可用的酒馆助手脚本；等待 `await waitGlobalInitialized('Mvu')` 后确认 `Mvu.getMvuData` 和 `Mvu.replaceMvuData` 都是函数。只在测试聊天加载，不改全局配置。没有该脚本时不能继续真实测试。
3. 把整个 `work/rules_engine/core.mjs` 与 `mvu_poc/{adapter,fixture,manual-trigger}.mjs` 按相同相对目录复制到 SillyTavern `public/901-rules-poc/`，使浏览器可通过 `/901-rules-poc/mvu_poc/manual-trigger.mjs` 导入。纯内核只有标准 ESM 与 `structuredClone`，无需 Node API 或大型打包器。确认浏览器 URL 可加载这三个模块。
4. 在测试聊天当前末尾楼层，通过酒馆助手的**手动执行脚本**调用以下代码。先读取 `SillyTavern.chatId`，把它逐字填入 `TEST_CHAT_ID`；切勿从正式聊天复制 ID。若当前脚本环境只能看到 `SillyTavern.getContext()`，先取得对应的 `chatId`／`chat`，再传给 `runManualDemo` 的第二参数。

```js
await waitGlobalInitialized('Mvu');
const { runManualDemo } = await import('/901-rules-poc/mvu_poc/manual-trigger.mjs');
const TEST_CHAT_ID = '在此填入当前一次性测试聊天的 chatId';
console.log(await runManualDemo({ mode: 'initialize', expectedChatId: TEST_CHAT_ID }));
console.log(await runManualDemo({ mode: 'attack', expectedChatId: TEST_CHAT_ID,
  operationId: 'manual-attack-001', expectedRevision: 0 }));
```

预期读数：DP 12；掷骰成功 3；自动成功 2，合计 5L；伤害上限 16L；DR 2 后伤害 3L；目标 `6 完好 / 0B / 3L / 0A`；攻击者标准动作 0。再次用相同 ID／输入调用，结果应为 `already_applied`，修订号仍为 1。

5. 重新加载网页、重新打开**同一测试聊天**，运行 `runManualDemo({mode:'read',expectedChatId:TEST_CHAT_ID})`，确认修订号和生命槽保持。若新消息已成为末尾，请在该楼层读取；不要把旧楼层当作当前分支。
6. 发出下一条测试消息，读取新末尾楼层，确认继承修订号 1 及 3L；再分别重生、切换 swipe、编辑该消息，确认选中分支中的变量符合当前消息链。每步记录 `chatId/messageId/swipeId/revision/HP`。本模块只在所选末尾楼层写入；回退与各 swipe 的隔离由 MVU／SillyTavern 实际存储行为决定。
7. 在测试副本内尝试错误修订号、遗漏目标及模拟保存失败；必须得到异常且不出现“结算成功”提示。保存失败、页面刷新后的持久化与分支隔离以酒馆实测为准。

## 当前验证范围

`node --test work/rules_engine/core.test.mjs work/rules_engine/mvu_poc/adapter.test.mjs` 覆盖纯内核及内存 MVU 替身：初始化、完整数据保留、固定攻击、读回、重复操作、同号异输入、错误版本、缺失角色、保存拒绝；替身还模拟了下一楼层继承与不同 swipe 的独立副本。真实 SillyTavern 的 A–G 验证均**未完成**，不能据此宣称 MVU 可可靠承担正式游戏分支的状态存储。
