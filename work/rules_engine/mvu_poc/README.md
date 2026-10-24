# 901 MVU 接入 PoC（隔离测试）

本目录只验证 `core.mjs` 的状态结算能否经 MVU 写入**消息楼层**。`adapter.mjs` 不改公式，不写 MVU 的 `chat`／`character`／`global` 变量，也不写正式人物或 GM 资料。所有数据位于 `stat_data.901_rules_poc`，初始化只允许空命名空间，写入时完整保留读到的其他 MVU 字段。

## 2026-10-13 初次本机检查

- `D:\github\sillyTavern` 存在，酒馆助手 `JS-Slash-Runner` 在第三方扩展目录中；正式 901 GM 卡及 M1 世界书也存在。本 PoC 未修改它们。
- 未找到单独安装的 `MagVarUpdate` 扩展。`data/default-user/settings.json` 虽有 `mvu_settings` 历史设置，但酒馆助手脚本列表为空；它不能证明 MVU 正在运行。
- 初次检查时没有运行中的 SillyTavern 页面或相关本地监听端口。此后的真实运行验收见下文。
- 本机酒馆助手类型声明 `@types/iframe/exported.mvu.d.ts` 规定：`getMvuData({type:'message',message_id:n})` 读取指定楼层，`replaceMvuData(data,{type:'message',message_id:n})` 返回 Promise 且**完整替换**。本适配器始终使用非负数字楼层 ID，不使用 `latest` 写入。

参考：[MVU 项目与安装说明](https://github.com/MagicalAstrogy/MagVarUpdate)、[MVU 变量框架说明](https://github.com/StageDog/tavern_resource/blob/main/.agents/skills/mvu-variable-framework/SKILL.md)。两者是 API 资料，不作为 901 数值规则来源。

## 文件与接口

- `fixture.mjs`：两名虚构测试角色、9 槽目标、固定骰序及普通长剑攻击。测试聊天 ID 由运行时提供。
- `adapter.mjs`：`initializeTestState({mvu,getAnchor,expectedChatId})`、`settleAttack({mvu,getAnchor,expectedChatId,operationId,expectedRevision,attackerId,targetId,attack})`、`readDebugState(...)`。`getAnchor()` 返回当前 `{chatId,messageId,swipeId}`。
- `manual-trigger.mjs`：`runManualDemo({mode,expectedChatId,messageId?,operationId?,expectedRevision?})`，仅供测试聊天手动调用；返回结构化结果及简短调试读数。
- `adapter.test.mjs`：Node 内存替身测试；**不是**酒馆端到端测试。

写入前读完整 MVU 数据，检查聊天身份、命名空间版本、角色必要字段和预期修订号；计算仍调用 `core.mjs` 的 `resolveAttack`。写入前再次读取，发现快照变化便停止；`await replaceMvuData(...)` 后再次读取，结果不一致便报错。相同 `operationId`、相同输入返回 `already_applied`，不再次扣血；同号不同输入报错。结果只提供摘要，绝不把整棵 `stat_data` 注入模型上下文。

`replaceMvuData` 没有已证实的原子 compare-and-swap。上述检查只能避免本模块实例内的并发操作及已观察到的旧快照；其他脚本同时写同一楼层时仍可能发生竞态。测试聊天应禁用 AI 更新块及其他数值写入者，正式使用前必须完成真实分支与竞争测试。

## 2026-10-13 真实运行验收

在本机 SillyTavern 1.19.0、酒馆助手 JS-Slash-Runner 4.11.2 中，为一次性角色卡 `901 MVU PoC 隔离测试` 加载官方 MagVarUpdate bundle（运行时报告 build `2026-10-07 01:40 (d804275)`）。这是角色脚本，未改全局脚本、正式 GM 卡或既有聊天。四个 ESM 文件放在本机 `D:\github\sillyTavern\public\901-rules-poc\`，浏览器从该目录导入；`stat_data.901_rules_poc` 只由手动 JS 适配器写入。

| 项目 | 实测结果 |
| --- | --- |
| MVU API | **通过**：`waitGlobalInitialized('Mvu')` 完成，`getMvuData`、`replaceMvuData` 均为函数。 |
| 初始读取与攻击写回 | **通过**：测试聊天第 0 楼由 9 完好、标准动作 1 起步；固定骰序得 DP 12、掷骰成功 3、自动成功 2、伤害上限 16L、DR 2 后 3L。MVU 即时读回为目标 6 完好／3L、攻击者标准动作 0、修订号 1。 |
| 磁盘、刷新与重开 | **通过**：聊天 JSONL 的 `message.variables.stat_data.901_rules_poc` 保存相同数值；刷新并重开该测试聊天后，MVU 再读仍为修订号 1、6 完好／3L。其他原有 `stat_data` 字段保留。 |
| 下一楼层 | **通过**：用 `/send`、`/sendas` 添加测试消息后，新楼层继承修订号 1、6 完好／3L。 |
| 重复操作 | **通过**：同一 `operation_id` 再执行返回 `already_applied`，刷新重开后仍不会再次扣血或消耗动作。 |
| Swipe 与编辑 | **通过（所测范围）**：测试聊天的两个手工 swipe 中，攻击只留在原 swipe；切换并刷新后另一 swipe 仍无 `901_rules_poc`。编辑后续叙述消息不改变已继承状态。 |
| 真正重新生成 | **通过（所测范围）**：连接的模型实际生成回复；在该回复第 1 楼完成 3L 攻击后执行 `/regenerate`，新回复显示为 `1/1`，当前 MVU 读不到旧攻击状态，磁盘上的新消息也无 `901_rules_poc`。本次酒馆行为是替换当前回复，不能据此声称旧回复仍可作为 swipe 返回。开场白直接 `/regenerate` 曾因没有前置用户消息而触发 MVU 初始化提示；正式测试改用有前置用户消息的模型回复。 |
| 错误输入与版本 | **通过**：错误修订号、缺失目标和缺失攻击输入均报错，前后读回未变。 |
| 真实保存失败 | **未执行**：尚未在真实 MVU 中注入 `replaceMvuData` 保存失败；只有 Node 替身测试覆盖保存拒绝。 |

局限：MVU 的 `replaceMvuData` 没有原子 compare-and-swap 保证，因此多个独立脚本同时写同一楼层的并发安全未证实。刷新重开后，手动触发按钮曾出现已显示但无响应；将该测试卡的手动脚本关闭再开启后恢复。这是角色脚本加载时序问题，不能当作无条件可靠启动。测试卡还触发了现有全局世界书的其他 `stat_data` 字段；适配器完整保留这些字段，但正式接入前仍需检查实际运行配置。上述结果只证明隔离测试条件下的单写入方闭环。

## 2026-10-19 当前适配器复测

- 当前 `adapter.mjs` 依赖 Character Builder 的 `builder.mjs`。测试时把这两个模块连同 `core.mjs`、`fixture.mjs`、`manual-trigger.mjs` 复制到新的 `public/901-rules-poc-20261019/work/` 镜像目录，未覆盖 10 月 13 日的静态测试副本。Node 端 `core.test.mjs` 与 `adapter.test.mjs` 共 32 项通过。
- 在新建的一次性角色卡 `901 MVU PoC 隔离复测 20261019` 上，酒馆助手 4.11.3 的角色脚本加载官方 MVU；`Mvu.getMvuData` 与 `Mvu.replaceMvuData` 均可调用。当前 JS 内核再次算出 DP 12、掷骰成功 3、自动成功 2、DR 2 后 3L；MVU 结果为目标 6 完好／3L、攻击者标准动作 0、修订号 1。同一操作 ID 重复提交返回 `already_applied`。
- 聊天 JSONL 的当前布局是 `message.variables[0].stat_data.901_rules_poc`；磁盘读回修订号 1、6 完好／3L、标准动作 0、操作记录 1 条。第一次刷新并重开测试卡后，再读仍为该结果；但“角色脚本”总开关在刷新后为关闭，需要手动开启。
- 这次酒馆助手显示的测试按钮点击后未触发回调；编辑并保存同一角色脚本会执行其中的一次性测试操作。攻击数值未受影响。由此发现 `readDebugState` 对未标记 `kind` 的已有攻击结果显示 `undefined`；已用先失败后通过的回归断言修正，保留旧状态的兼容读数。
- 第二次刷新后，测试卡 PNG 从 `data/default-user/characters/` 消失；对应聊天 JSONL 仍存在并保留修订号 1、6 完好／3L。用户确认当时有同步或清理流程运行，测试卡消失与该流程相符；尚未追踪到具体删除操作。因此**不能把本次第二次重开标为通过**，须在同步结束后重新测试。酒馆助手源码显示，角色脚本总开关按角色 avatar 名称保存在全局扩展设置中，采用延迟保存；本次刷新后开关关闭的直接原因尚未确定。真实 MVU 保存失败注入和多写入方原子性仍未验证；正式游戏存档未参与测试。

## 最小真实酒馆复现步骤

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

`node --test work/rules_engine/core.test.mjs work/rules_engine/mvu_poc/adapter.test.mjs` 覆盖纯内核及内存 MVU 替身：初始化、完整数据保留、固定攻击、读回、重复操作、同号异输入、错误版本、缺失角色、保存拒绝；替身还模拟了下一楼层继承与不同 swipe 的独立副本。真实验收已覆盖上表所列的单写入方行为；真实保存失败和多写入方并发仍未验证，因此尚不能把本 PoC 直接用于正式游戏存档。
