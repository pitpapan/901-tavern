# 901 GM Runtime：正式开场接入与历史测试

## 2026-10-23 观澜法减费接入后的当前结果

正式「901 帝都初始卡」继续关联六本世界书、173条。**D1–D14及用户提供的观澜法减费条文已接入；最新批次更新6个运行模块和能力书2个条目，完整35模块及六书均已读回核验。** 普通行动与战斗声明分类器已同步。本批备份位于 `installation-backup/guanlan-growth/`，原有备份保留；卡片与聊天存档未改。刷新SillyTavern继续原聊天，不要初始化。

此前“5组条件资源只有参考”“3类PHB状态没有执行器”的结论已经过时。这8组中具有明确来源的部分现已实现，具体未定口径只阻止依赖它的操作。世界书继续保存定义和来源，当前实例、扣费、持续时间、状态与事件完成情况由JS/MVU保存；出现资料不代表人物已经持有该物件。

| 审查单位 | 当前可执行内容 |
|---|---|
| 19种宿主路由 | check/save/opposed/extended/growth/feat/resource/first_aid/status/deterioration/node/chapter/reward/inventory/time/mechanism/ability/hypnosis_resist/status_event；真实骰源、状态读回、重复操作复用 |
| 传送 | 下位距离/视线/目标意愿/携物DC与费用，超大他者按体积超过5的部分计入携物；上位距离向上取整为千米段、每分钟累计、失去施法行动能力自动失败并退还下取整一半；结界的空间阻挡 |
| 魔力体质 | 容量公式及沐瞳所学法术变体；感知范围（感知＋波动等级）×11米；器物－2级、施法者－3级；睡眠恢复跨时间段累计取整和每日额度；每小时冥想；已登记器物供能 |
| Wizard | 标准3魔力变身、迅捷换属性；四形态属性/判定/防御、替换甲8、剑枪召出/切换/攻击、火伤拆分和免疫；水攻击叠加减防、移动格挡/迅捷格挡、枪械响应；风相邻目标与地形；土吸收/力场/穿透；Defend四属性及土墙；使魔召唤、结构/硬度/反射、飞行、固定侦查/隐藏骰池、干扰和场景撤除 |
| Phantom戒指 | Sleep标准1魔力、固定DC4意志豁免、普通睡眠与唤醒；Engage整轮0魔力、肉身留原处，整轮退出返回原肉身、目标醒来返回，内外时间1:1；特殊困锁另需实际来源 |
| 厌魔石 | 实际符文锁链锁闭/解除及相应施法、能量封锁；矿物自身A及以下魔幻能量免疫按已确认例外判定；普通物理行动不被连带封锁 |
| 肢体专项 | 按实际肢体扣判定、失能、按移动方式和受损数量减速；永久肢体损失保留；普通玩家旧检定入口同样检查肢体 |
| 情绪专项 | 惊惧当前感知与逃离选择约束；来源命令、特殊额外抵抗、强制命令例外和执行后完成；玩家仍选择具体行动 |
| 永久后果与冷热 | 只有来源明确允许时产生毁灭性后果；失明/失聪/肢体损失/恶心失能/痴迷/已裁定精神后果持久保存；自然/黏附/魔法火、扑灭限制、默认自身行动末结算一次；抵抗后的有效冷热状态按1:1抵消，不倒退伤害 |
| 已有审查项目 | 核心状态与伤势、冻结特殊抵抗/冰封再冻结、逐轮恶化、急救、AP映射；四位当前同伴、安装者/催眠魔兽/Chuul/常态古雷姆林；魔物之盒/两阵；13项作者资料差异；节点/章节/奖励和成长保留；基因锁新增一/二阶活动状态、主动费用、二阶属性/自动成功、时限/反噬和MVU；魔物之盒补原帖魔眼恐惧/气息感知 |

Defend及水形态减防按施术者的轮次到期，不提前在全局回合换轮时扣掉一轮。进入战斗后使用战斗动作预算；场外机制不提供绕过战斗结算的入口。使魔侦查/隐藏固定骰池已接入，但裸骰结果本身不等于自动发现或自动隐藏，目标、掩蔽、动作时间和对抗仍要依据当前场景。

## D1–D14：已采用并实现

旧R1–R10已逐项回查原卡、PHB原始HTML与已采用901规则。燃烧行动末、风防护恰好12DP、传送中断通则、PHB基因锁普通一/二阶程序均不再待裁定；原帖另补魔物之盒两项遗漏。

**[原文复核与D1–D14采用表](source-recheck-20261023.md)记录依据和逐项接入位置。** 冷热比例、多足通式、Wizard护甲/解除/连射、传送分段/大体型、Engage、厌魔石、意志基本用法、基因锁解除/双开/缩HP、RE难度参照、多人擒抱和盒子开关/重置均已按用户采用口径启用。实际人物选择、物件来源与当前场景参数仍从存档和主持登记读取。

强化须先在实际节点开放 `ruleScene.growthWindow`，或结算带 `growthAllowed:true` 的节点事件。玩家声明强化项目后，分类器只选择项目，JS读取当前等级自动计价、检查XP并将升级与扣费一并写入MVU；重复操作复用已存结果。登记示例见上述采用表。

## 集中待补表：实际实例信息

这些不是新增规则裁定，也不要求现在一次性补齐所有未来物件；实际用到时提供对应事实即可。

| 实例 | 需要记录的事实 |
|---|---|
| 传送 | 当期施法属性/主子技能、适用魔力池、真实距离/落点/视线、携物体积、目标意愿和相对站位 |
| 魔力体质 | 持有人、普通或沐瞳变体、实际当前池值/所学法术、当天及时间段ID；器物适用性/费用/动作；被掩饰波动的实际隐藏规则 |
| Wizard | 腰带与戒指实际持有/佩戴、感应手可用、施法和剑枪技能；土墙方向与几何、来物硬度；使魔先攻及主动侦查/隐藏任务的动作时间；水压是否过高 |
| 睡眠/控制/肢体 | 实际佩戒对象、唤醒接触、恐惧源是否仍可感知、有效逃离选项、真实命令；受伤肢体、动作使用肢体与移动方式；来源是否确实允许毁灭性后果，精神后果的主持描述 |
| 厌魔石与既有物件 | 实际符文加工/锁闭、对象、被封锁能量；盒子当前睡眠值、开关状态及重封的真实结果；两阵节点/边界/供能；药品真实数量、戒指佩戴和制造主技能；土遁到期可用出口 |

登记入口仍为 `/901-scene` 的 `kind:"ruleScene"`。objects保存实际物件及其plans；events保存独立、有来源的状态/失败等事件；anatomies保存肢体映射；environments保存适温恢复。`mechanismPlans:{物件ID:{新计划ID:{source, ...实际参数}}}` 可给既有物件追加新的目标或时间段，不重置费用、进度或旧计划。战斗中可追加事件和新操作计划，既有对象与人物配置不在战中重置。每个sleep计划须独立intervalId，避免同一段时间重复恢复。

机制操作用 `kind:"rule",action:"mechanism",actorId,objectId,operation,part`，状态事件用 `kind:"rule",action:"status_event",actorId,eventId`；战斗则选legalOptions中的mechanism/statusEvent或相应动作。分类器已同步这些入口和具体资源规则；请求只选择已登记项，不能提交任意数值补丁。场外明确场景结束可登记sceneEnd事件撤除本场使魔，战斗结束返回剧情自动撤除。

## 验证证据

- **观澜法已修复并安装**：[367项回归](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/guanlan-regression.tap)及[43次真实执行器/MVU计费](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/guanlan-xp-smoke.json)通过。属性6/12→5/11，白刃/运动/学识及其子技能3/9→2/8；专长不变。本树完整D技艺减1最低1，本体/进化/树外不减；免费不返XP。新增逐项核价资源学习交易、分期整门一次减免、悟法专用支付与实际奖励事件。重复请求、重载、人物隔离、余额不足均有覆盖。学习记录不虚构未适配技艺的执行效果。[修复前审查](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/guanlan-xp-audit.json)保留作历史证据。具体取得与报价登记见[用户原文与接入说明](source-recheck-20261023.md)。本轮没有额外Gemini外发，也没有给正式T0人物授予观澜。

- [D1–D14回归351/351通过](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/adopted-decisions.tap)。[强化扣费测试](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/adopted-xp-smoke.json)：力量4→5扣6XP（30→24），5→6扣12XP（24→12），获得1自动成功和1巨力选择额度；重复请求不再扣费，未开放节点及余额不足不改状态。本批采用本地JS与隔离MVU读回测试，未新增真实Gemini测试；沿用下述测试范围。

- [原文复核后330/330通过](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/source-recheck.tap)，新增12项相关回归；sourceRecheck安装批次14文件、34模块全部哈希读回。依赖核验现在同时检查相对路径和本地绝对路径动态导入。

- [上一批测试318/318通过](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/remaining-audit.tap)：原293项＋7项状态专项＋18项条件资源/衔接测试。包括真实执行器的扣费、状态、动作、反应声明、按施术者计时、使魔MVU读回和重复请求。排除原有 `world-runtime.test.mjs` 的历史卡片/005文本漂移，不代表整个仓库全部测试。
- [安装记录](../../../output/replay_tavern/six_books_20261023_candidate/installation.json)：remainingRules记录本批17文件、33模块闭包及哈希；[静态包核验](../../../output/replay_tavern/six_books_20261023_candidate/verification.json)检查六书格式、来源映射和包依赖。
- [先前四例真实Gemini测试](../../../output/replay_tavern/six_books_20261023_candidate/scene_test/audit-live/results.json)：社交对抗、意志豁免、流风、累计检定；本地后端＋文件MVU夹具，不是浏览器端到端。该证据只覆盖先前四例，新增条件资源没有另发Gemini测试。此前Sol High发现模型reason把对手DP叫DC、把风度叫技能、误述周期，JS未据此改数；提示已修正，未声称模型解释问题已经根治。

六书仍为41/23/40/33/15/21条，3常驻、151关键词、19禁用。99份人物全档及未来时期资料不自动变成T0当前实例；本轮不重新发装备、不改变已玩剧情。

## 以下为历史隔离测试记录

以下2026-10-14/20记录描述当时的测试包和白名单，“未接入正式卡”等陈述仅对当时成立。当前正式状态以上表与安装记录为准。历史demo仍仅使用自己的测试聊天，不能在正式聊天运行初始化。

## 008 主持正文整合测试（2026-10-20）

[主持整合包](../../../output/replay_tavern/host_integration_20261020_candidate/README.md) 复用 008 主持正文、文风和 136 条世界书，在独立完整卡测试场景中连通普通对话、普通检定、已登记战斗、MVU 写回与战后续述。它不替换正式卡或帝都 T0 存档。

`integrated.mjs` 提供共用 `actors.player` 的测试配置与宿主；`integrated-script.js` 是角色脚本；`build-integrated.mjs` 生成可导入卡和独立运行目录。`registerReplayGate` 可通过 `profile` 指定场景、基线、初始化与模型上下文；整合配置关闭旧演示的无骰加值。分类器返回 `COMBAT_REQUIRED` 后按已登记遭遇 ID 交接，进场与战后续述按操作编号恢复。测试记录见包内 `verification.md`。

## 战斗接入

`replay-gate-script.example.js` 的 `registerReplayGate({getMvu, combat})` 接受可选战斗宿主。在普通行动分类前调用 `combat.handleTurn()`；战斗进行中由战斗模块结算，玩家回合／受击反应等待玩家选择，战斗完毕保存状态并返回剧情。无战斗时沿用下文原有流程。

宿主由 `../combat/host-ui.mjs` 的 `installCombatHost({controller,encounters,document,tavern})` 创建；控制器使用 `../combat/tavern.mjs` 的 `createTavernCombat()`。将返回的 `host` 传给 `registerReplayGate({getMvu,combat:host})`，并在角色脚本卸载时调用 `host.dispose()`。`encounters` 由主持提供对应时期的可信遭遇工厂，模型只能选择已登记的 ID，不能提交角色卡或授予资源。先加载对应时期的现有 `901_rules_poc.actors` 存档，再用 `host.enter(id)` 开战；不要使用测试卡的满状态初始化替代正式存档。

完整四人脚本、玩家选择界面及独立验收卡见 [战斗接口](../combat/README.md)。自动测试已覆盖战斗拦截普通分类、完整战斗写回、战后返回剧情及下一场保留伤势／能量。该接入点已经实现，现有正式主持卡没有被自动更换。

## 可玩原型：直接用玩家聊天行动

[`901-playable-prototype.card.json`](901-playable-prototype.card.json) 是可导入的 V2 隔离测试 GM 卡。它内嵌 MVU 加载脚本和 [`native-tool-script.example.js`](native-tool-script.example.js)，通过 SillyTavern 的原生 function tool 调用 [`native-tool.mjs`](native-tool.mjs)。以下流程不需要测试按钮：

1. 将下文“手动安装与触发”列出的浏览器 ESM 文件，以及 `native-tool.mjs`，放到 SillyTavern `public/901-rules-runtime/work/` 对应位置。用独立测试卡导入 JSON，在新聊天中明确启用其两条角色脚本；需要支持原生工具调用的模型连接。不要把此卡用于正式 901 聊天。
2. 玩家直接发送普通文本。日常对话由 GM 叙述；明确的观察或训练剑攻击由 GM 选择 `trpg901_demo_resolve`，只提供检定条件或攻击目标。脚本从真实玩家楼层核对行动，使用当前聊天 ID、楼层、swipe 和 MVU 修订；骰子和伤害由 JS 产生。模糊或不匹配的请求返回 `clarify`，不会结算。
3. 攻击和检定写入玩家楼层，读回确认；GM 回复完成后，角色脚本监听普通回复及流式生成结束事件，把该次已确认的 `901_rules_poc` 命名空间同步到最终 GM 楼层，保留楼层上其他 MVU 数据。重复 operation ID 只读取原结果。若续述失败，保留玩家楼层的已保存结果，恢复时必须基于同一结果续述，不重新投骰。

本卡测试白名单只认识“主动观察”和“用训练剑攻击测试对手”。它不会替玩家选择能力、XP 支付或新行动；普通对话无需工具。角色卡与两名 Builder 角色都是 demo-only。此接口不提供多写入方原子 compare-and-swap，也不把 NPC Draft 候选、资源许可或装备假设提升为 Canon。

### 真实 SillyTavern 验证（2026-10-14）

在本机 SillyTavern 1.19.0、酒馆助手 4.11.2 的新测试聊天中，以普通发送框输入，未点规则测试按钮：

- 对话“今天路上还平静吗？”得到叙述，没有规则工具调用。
- “我仔细观察前方道路，寻找异常痕迹。”触发 GM 原生 `check` 请求；JS 返回 5 DP、3 成功、DC 1，MVU revision 1，GM 据此叙述。
- “我用训练剑攻击面前的测试对手。”触发原生 `attack` 请求；JS 返回 5 DP、2 成功、实际 2L（严重伤害），NPC 5 完好／2L，玩家标准动作 0，MVU revision 2。最终 GM 楼层读回同一 revision 2。
- “我不攻击，只对巡逻员说：请继续巡逻吧。”没有工具调用，也没有新 operation。刷新并重新打开聊天后，上述叙述和 revision 2 仍在，后续普通对话楼层也继承 revision 2。
- 另建隔离聊天，在观察工具已返回 5 DP、3 成功、DC 2、revision 1 后中止 GM 续述。SillyTavern 的“重新生成”再次请求同一规则操作，工具明确返回 `already_applied`、仍为 3 成功、revision 1；最终 GM 回复已写入相同 revision 1，operation 数仍为 1。恢复与重生成都没有再次投骰。

本次人为中止覆盖了“工具已保存、GM 未完成叙述”的恢复路径；真实 API 限流未在原生工具路径再次发生。当前全局提示词还会在 GM 文本后追加时间／变量检查列表，这是测试酒馆的格式设置干扰，规则字段未由该列表写入。

## 调用边界

- `bridge.mjs` 将 GM 的单个 JSON 决定解析为 `no_rule`、`watch_path` 观察检定或演示训练剑攻击。额外字段（骰子、伤害、XP、HP、JSONPatch 等）被拒绝。GM 可在本演示的 1—4 范围内定观察 DC；这只是测试场景白名单，不是 901 通用难度公式。
- 玩家行动另以可信的 `playerIntent` 传入：只有玩家明确观察，才接受观察检定；只有玩家明确攻击指定目标，才接受攻击请求。GM 不能单凭自己的 JSON 决定玩家动作、能力选择或 XP 支付。
- 两名角色的测试数据由 Builder 生成。普通 NPC 使用既有 `new_patrol` Blueprint 与候选，经 production Resource Adapter 和 NPC Draft Pipeline 预览后，以**独立的 demo-only 测试授权**进入这次测试。Pipeline 仍给出 `approved: false`、`formalDefinition: null`；其候选资源“健步如飞”未获 901 采用及人物取得，不产生速度效果。
- 训练剑 `2L` 来自既有 Character Builder 普通攻击样本，明确是本隔离场景的装备假设，不意味着正式 PHB 装备批量授权。未适配能力不变成数值加值。
- 骰子由可信 JS 骰源提供，GM 请求不含骰值。检定和攻击都交给 `core.mjs`。`mvu_poc/adapter.mjs` 延用楼层／swipe 锚点、revision、读回确认与 operation ID 去重；只由 JS 写动作、伤势、意志和 XP 等规则字段。GM 叙述作为普通聊天文本发布，不提交规则字段或 JSONPatch。
- `tavern-runner.mjs` 使用酒馆助手的 `generateRaw()` 请求模型，限定只带本轮玩家行动和本次结果摘要，不每轮注入完整角色状态树或正式世界书。第 2 次模型调用失败时，`narrate` 模式从 MVU 已保存结果继续叙述，不重算攻击。

## 手动安装与触发

1. 使用一次性测试卡和**新测试聊天**。本机实测复用了已有 `901 MVU PoC 隔离测试` 卡，其角色脚本已加载官方 MVU bundle；未修改正式主持卡。需要另一台机器时可用当前项目已有的 V2 卡 JSON 输出方式建立最小测试卡，无需引入 tavern-cards forge。不要在已存在 `901_rules_poc` 的聊天里初始化。
2. 保持目录结构，将 `core.mjs`、`mvu_poc/{adapter,fixture}.mjs`、`gm_runtime/{bridge,tavern-runner}.mjs`、`character_builder/builder.mjs`、`resource_adapter/{adapter.mjs,resources.json}`、`npc_draft_pipeline/{pipeline.mjs,new_patrol.blueprint.json,new_patrol.candidate.json}` 复制到 SillyTavern `public/901-rules-runtime/work/` 对应位置。浏览器从 `/901-rules-runtime/work/rules_engine/gm_runtime/tavern-runner.mjs` 导入。`catalog.node.mjs` 和其他 Node 专用文件不进浏览器。
3. 在测试卡创建一条**角色脚本**，将 [`tavern-helper-script.example.js`](tavern-helper-script.example.js) 粘入，替换 `EXPECTED_CHAT_ID` 为当前一次性聊天的精确 ID，并添加同名的五个按钮：`901 GM 初始化`、`901 GM 观察`、`901 GM 攻击`、`901 GM 读取`、`901 GM 续述`。这条脚本只给测试卡启用。
4. 在空命名空间的当前楼层点“初始化”。用 `/send 我查看前方道路是否有异常痕迹。` 添加玩家消息，不让酒馆默认回复抢先生成；点“观察”。观察、日常对话等无机械后果时，模型可返回 `{"kind":"no_rule"}`，不会调用 core 或写 MVU。
5. 再用 `/send 我用训练剑攻击面前的测试对手。` 添加玩家消息，点“攻击”。按钮提供玩家明确的 `playerIntent`，GM 模型自动形成 JSON 规则请求。检查“读取”的修订号、生命槽和动作。若模型叙述被限流，仍保留已写入的规则结果；点“续述”只重试第二次模型调用。
6. 刷新页面、重新打开同一测试聊天，点“读取”。当前选中楼层和 swipe 的值应保留。不要把本测试脚本与其他数值写入器共同用于正式游戏聊天。

接口依据为本机 SillyTavern 1.19.0、酒馆助手 4.11.2 的 `generateRaw`、`createChatMessages` 声明和既有 [`MVU PoC README`](../mvu_poc/README.md)。项目已有 V2 Tavern Cards JSON 输出和人工导入流程；本轮没有引入新转换工具链。

## 本机 2026-10-14 实际交互

测试聊天：`901 MVU PoC 隔离测试 - 2026-10-14@08h20m54s418ms`，非 Canon。两名 Builder 测试角色初始化后均健康，标准动作各 1。GM 模型接收到玩家观察文字，返回 `{"kind":"check","checkId":"watch_path","dc":1}`；JS 结果是 **5 DP、1 成功、DC 1 成功**。MVU 修订 1，生命和动作未变。GM 随后叙述玩家辨认出地面的异常痕迹。

玩家随后明确攻击。GM 模型返回 `{"kind":"attack","weaponId":"demo.training-sword","targetId":"npc"}`；JS 算出 **5 DP、3 成功、上限 8、实际 3L**。MVU 修订 2，NPC 变为 **4 完好／3L**，玩家标准动作变为 **0**。生成攻击叙述的模型调用首次遇到 `Too Many Requests`，状态没有回滚；刷新并重新打开聊天后，`续述` 从已保存的同一 operation 生成了攻击叙述。再次读回仍为修订 2、4 完好／3L、标准动作 0。

本次浏览器实测覆盖：模型自动生成两类结构化请求、内核检定和攻击、MVU 即时写回、模型叙述、叙述失败后的不重算恢复、刷新重开持久化。非法字段／玩家意图不符／同 ID 重复的拒绝由 Node 集成测试覆盖；既有 MVU PoC 曾在真实酒馆验证同 ID 去重及 swipe 分支。本轮没有在真实酒馆重复每一种错误输入或多写入方竞争。`replaceMvuData` 仍没有已证实的原子 compare-and-swap，正式多脚本并发运行尚不可用。

## 本地验证

```sh
node --test work/character_builder/*.test.mjs work/resource_adapter/*.test.mjs work/npc_draft_pipeline/*.test.mjs work/rules_engine/*.test.mjs work/rules_engine/mvu_poc/*.test.mjs work/rules_engine/gm_runtime/*.test.mjs
```
