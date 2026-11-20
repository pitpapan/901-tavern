# 901 完整 Chat Completion 预设 v1

## 2026-10-28 独立引擎隔离共存 profile

新增 [901-engine-isolated](../../../output/replay_tavern/model_preset_v1/梦鲸思客V5-1025-exp-fix1-901-engine-isolated.json)，用于用户已授权的 `127.0.0.1:18010` 隔离酒馆。它是功能迁移后的共存配置，**不是原版 V5 全部宏、脚本及事件生命周期的兼容承诺**。原下载文件与原 `901-local` 候选均保留；下方“继续暂缓／未安装”是上一轮记录，本节只完成可导入产物与本地验收，实际导入、活动状态和浏览器检查由接入主任务记录。

引擎解释、正文、摘要和幕后请求由 `901-trpg-engine/tools/trpg-engine/gm/model-protocol.js` 构造。它只接受相应角色投影、偏好与显式任务输入，不走 ST 原生 prompt 拼接。第三人称、篇幅等由 901 偏好控制；不把 V5 预设参数、宏、世界书或聊天历史自动算成引擎输入。

| 项目 | 源码核对与此次处置 |
| --- | --- |
| 基米工具／JSON | 原脚本纯函数 `x/A` 要求 enabled、模型名不分大小写包含 `modelNameIncludes`、受支持渠道，并排除 quiet/impersonate；未检查顶层 function_calling。当前 Gemini／makersuite 的普通生成会符合原筛选条件。原钩子监听 CHAT_COMPLETION_PROMPT_READY／SETTINGS_READY 并包装浏览器 fetch，不能据此推断服务器独立请求也受影响。profile 禁脚本及两处 tool_output_bridge。引擎只收完整 JSON，拒绝工具调用、Dream XML 和空正文。 |
| 世界书与绿灯缓存 | 原消息脚本按 character／character_additional／chat／persona／global 多来源提取。缓存存于聊天变量，身份为 world+uid+content_hash，锚点为 message_id+swipe_id，并保存 message_hash。`ro/oo` 检查楼层、swipe 存在及消息哈希，`co` 比较书条目哈希并移除失效项，`lo` 要求当前请求锚点；代码不是“完全没有失效处理”。但这些 ST 锚点不等于 901 branchRef，聊天复制、编辑、切换后的完整事件链未实测。profile 禁消息处理，不执行重排或缓存回注；独立引擎从自身分支读取资料。 |
| 摘要与隐藏历史 | 原小摘要开关关闭，不代表旧消息上的 dream_summary 不生效。两条正则仍会在 10 层内隐藏摘要、11 层起只发送摘要。预设助手 `pt/it` 会写 is_hidden；direct 模式也会隐藏总结前普通楼层，worldbook／first_message 是另外的写回选项。原助手有 CHAT_CHANGED／MESSAGE_SWIPED 等监听，并为重总结保存 swipe 快照，但未验证实际生命周期。profile 禁助手和全部正则，不自动解隐藏历史：必须使用新合成聊天，不能将旧隐藏状态称为已恢复。901 摘要服务的来源与引用权威保持不变。 |
| 自修复 | 现有候选仅修纯 FIND 算法；原 `k` 只校验 chat id 后直接 setChatMessages，未接 901 更正事件与结算回执，不能允许借修文变更规则结果。脚本和自检 prompt 关闭；既有补丁算法测试通过不代表发布后撤销/swipe 竞态已验收。 |
| 原生正文显示 | 原非 markdownOnly 正则会删 dream_body／paragraph 标签、行首 HTML 注释、正文后思考及多余空行；其他正则会生成交互 HTML。901 原生发布为普通正文，无需这些转换，因此全部 27 条 disabled。由 901 面板展示服务结果；没有启用任何可能隐藏、改写正文或附带旧操作按钮的 V5 显示规则。 |
| 原 prompt 链 | 6 个嵌入脚本全部 disabled；所有 V5 内容 prompt disabled，两个 order 中只启用原生 marker 与 `901-engine-authority`。停止占位符提取后也同时停用依赖这些占位符的宏链，避免残缺原链。未宣称原自动摘要、宏或纠错已移植。 |

构建及本地复现（工作区根目录，Node 26.10）：

```powershell
python -X utf8 'TRPG outputs/work/replay_research/model_preset_v1/fix_mengjing_v5.py' 'C:/Users/pit/Downloads/梦鲸思客V5-1025-exp-fix1.json' --profile 901-engine-isolated
node --test --test-isolation=none 'TRPG outputs/work/replay_research/model_preset_v1/mengjing-v5.test.mjs' 'TRPG outputs/work/replay_research/model_preset_v1/mengjing-engine-isolated.test.mjs' '901-trpg-engine/tools/trpg-engine/tests/gm-model-adapter.test.js'
```

27/27 本地测试通过（新 profile／协议专项 5 项、原 V5 算法与配置 6 项、引擎模型适配 16 项），见 [日志](mengjing-engine-isolated-verification.log)。只执行经过审读的两个纯工具筛选函数和既有纯修文算法；不启动原脚本 bundle、DOM、事件钩子或 fetch 包装。模拟传输覆盖实际 Host 与协议解析，没有新增真实模型调用。原件 SHA256 仍为 `7ecaa3edf394eb1fa684acdd834a1df679fd5829cc68948577fc98d51a2fb488`；隔离 profile SHA256 为 `f6e4c7c7dd6a018aff55dc30af2a87843c34b53d8f916353c31483ffecfae01d`。

最小隔离浏览器验收流程（尚未由本专项执行）：

1. 在 18010 的新合成聊天，通过聊天补全预设导入上述 JSON；不得在正式实例或战役聊天加载。该文件无凭据、模型选择、代理地址；不会替使用者合并其他 preset extensions。
2. 活动下拉 `#settings_preset_openai` 应为 `梦鲸思客V5-1025-exp-fix1-901-engine-isolated`；重载后再次确认。核对当前 oai_settings 中六脚本 false、27 正则 disabled、双工具桥 false，active order 只有 markers 与 901-engine-authority。确认已加载的其他全局／角色扩展不另行启动同名脚本；本候选不能关闭别处安装的独立副本。
3. 导入源码入口为 `public/scripts/openai.js:onPresetImportFileChange`：emit OAI_PRESET_IMPORT_READY，再 POST `/api/presets/save` `{apiId:'openai',name,preset}`，随后更新下拉并触发 change。只调用 save API 仅保存文件，不能声称已激活。实际文件在隔离 data/default-user/OpenAI Settings 内；由隔离服务的账号目录决定，不写正式目录。
4. 原生 prompt 预览中不应残留梦鲸占位符、publish_story 指令、历史摘要替代或缓存注入；这只能证明 native prompt 的停用配置。901 模型最终请求应由独立服务器证据确认：两条 messages、JSON response_format、无 tools／V5 宏／ST 历史。合并进已安排的真实调用检查，不为本专项另开收费调用。
5. 在新合成聊天通过901面板执行一次既定动作，检查原生正文与面板正文一致且不空；刷新、切换隔离聊天再返回，回执／时间不重复执行。branch/swipe 对应关系使用901实际分支绑定验收，不以切换 ST swipe 冒充引擎分支已经切换。原 V5 缓存／隐藏／纠错生命周期仍未验收，维持关闭。

## 2026-10-28 梦鲸 V5 本地候选修复（未安装）

本节是现有战役T7／独立引擎MW与NEXT-03B4的接续，不另立开发排期。用户授权补齐核对遗漏并修复本地问题，明确酒馆接入、实测继续暂缓。下文旧v1安装描述为历史记录，不代表本候选已应用。

- 输入：用户下载的`梦鲸思客V5-1025-exp-fix1.json`，SHA256 `7ecaa3edf394eb1fa684acdd834a1df679fd5829cc68948577fc98d51a2fb488`；原件未改。
- 输出：[V5 901本地候选](../../../output/replay_tavern/model_preset_v1/梦鲸思客V5-1025-exp-fix1-901-local.json)。这是独立的完整预设候选，包含原文件的扩展和脚本；不替换旧v1.2，不自动与酒馆现有扩展合并，也不是独立GM引擎可直接使用的JSON模型协议。
- 修正写作模式的MVU约束变量：setvar清空改为getvar展开，并在候选中启用“MVU不更新”、关闭“MVU强制”。仅隐藏UpdateVariable的正则不能阻止执行。
- 修正自修复脚本纯算法：字面唯一匹配，所有FIND基于原文，拒绝重复定位、重叠、跨行、无变化及前补丁生成的新文本；原记录结构保留。去除至少三项改动的强制要求。脚本与自检仍默认禁用；未验收原事件生命周期和撤销UI，不把本地算法通过当成已发布文本更正已接引擎。
- 项目候选保持第三人称、有限代办，不补主角对白／心理／决定；不开每轮共创、行动菜单与原版平行事件。场景栏保留未知，不猜精确时间地点；叙事者只调表达节奏，不以文风改变既定难度或结果。通用引擎默认参数没有被全局改写。
- 基米工具（含工具桥enabled）、格式补全、思维链提取和自修复脚本暂时关闭，保留代码供后续兼容核对。世界书提取／绿灯缓存未擅自改写，仍须NEXT-03B4验收；不能因此将本候选称为可直接正式安装版。
- 统一已有order与prompt.enabled的元数据；小摘要按原有效order保持关闭。大总结普通发送关闭但可由专用入口使用；默认direct，不等于自动写世界书／首层。原摘要替代10层外正文和总结后隐藏历史的路径仍需核对，不因输出美化正则开启就宣布相应生成功能开启。

战役运行时同时修复`replaySceneFromChat`：只保留当前正文，排除思考、平行事件、摘要、共创、自检、菜单、显示栏和变量块；兼容旧无body包装输出，只有附加内容的消息回溯上一条现场。回归直接验证幕后名字不会触发相关世界书。已同步现有六书候选中的单个运行模块及清单，未改书正文、真实角色或MVU。

复现（战役库根目录；输入必须为上面的已核对原件）：

```powershell
python -X utf8 work/replay_research/model_preset_v1/fix_mengjing_v5.py 'C:\Users\pit\Downloads\梦鲸思客V5-1025-exp-fix1.json'
node --test --test-isolation=none work/rules_engine/gm_runtime/adjudication-gate.test.mjs work/replay_research/model_preset_v1/mengjing-v5.test.mjs
```

本轮针对性检查44/44、战役完整JS回归965/965通过（0失败、0跳过），六书静态核验通过；候选JSON与6个内嵌脚本语法检查通过，原件SHA256未变。[修改前复现](mengjing-local-red.log)、[修复后回归](mengjing-local-green.log)、[战役完整JS回归](mengjing-local-full.log)、[六书静态核验](mengjing-sixbooks-verification.log)。运行模块变更使既有奥术取得证明的依赖哈希过期，已用原check-acquisition流程重跑9项取得测试并刷新acquisition-verification.json，编译器--check通过，生成契约内容无需修改。未重跑仅改文档的独立引擎测试。全部是本地／合成证据，不含真实模型、浏览器事件顺序、最终prompt或已安装版本证明。

摘要／平行的新服务到面板、原生消息发布、文字更正与实际撤销、V5工具/XML协议与引擎JSON协议分工、世界书缓存／历史隐藏以及真实语义验收，统一见[独立引擎现有TODO](../../../../901-trpg-engine/TODO.md)。2026-10-28后续已沿该队列完成MW-01/03/06离线API、18项新增测试及完整引擎436/436；这是独立引擎后续实现，不是本候选修文即完成移植。酒馆新控件、真实语义和六书合并仍未完成，本预设候选保持未安装。

## 以下为旧v1开发与安装记录

本版是可在 SillyTavern 的「聊天补全预设」导入的完整 JSON，包含生成参数、原生提示词标记与当前 GM 文风。它不是原先只导入两条提示词的 prompts.json。适配对象是本机实际使用的 OpenAI-compatible custom 渠道，模型别名 3.5-flash；仅凭这个别名不能确认它对应哪一个官方 Gemini 版本，因此本版不写入厂商专有参数。

## 参数与内容

- 上下文预算 32768，单次输出上限 4096 token。前者控制 ST 拼接历史的预算；后者留足一次交涉或复杂行动所需空间，并不要求每轮写满。服务商实际上限尚未核实。若长聊后状态丢失，先检查历史裁剪与数据库注入，再决定扩大预算。
- 温度 1、top_p 1，频率/存在惩罚 0，其他采样器保持中性，n=1。本版没有声称这是模型最优参数，也没有用温度参数替代人物卡和事实修正。
- 开启最新版 901·GM文风及短示例，分别 1187 / 446 字符。两者只在 normal、continue、swipe、regenerate 注入，不要求数据库的 quiet 更新模仿叙事格式。
- 保留 World Info before/after、Persona、角色描述/性格/场景、Chat Examples、Chat History、Post-History 等原生位置关系。F3 主持规则继续由角色描述承担，不在预设复制第二份。
- Enhance Definitions 保持关闭，避免默认提示鼓励模型凭外部知识补写本团设定。它在修改前也已关闭，不能把已出现的错误归因于这一项。
- 不添加深度思考链、每轮自检表、固定段数或固定选项菜单。数据更新、生成摘要等任务沿用自己的格式。

## 本机更新时保留扩展配置

这份可分享 JSON 不包含渠道地址、密钥、模型切换字段或当前用户的插件配置。导入不会主动切换 chat_completion_source/custom_model，但 ST 1.19.0 的完整预设加载器会把缺省的 extensions 当作空对象。本机现有 oai_settings.extensions 含 baibaiToolkit 配置，因此不能不经保留就直接导入共享文件。

本轮执行方式：先在 ST 私有备份目录备份原资料；读取本机当前 oai_settings.extensions，仅在 ST 私有目录生成本机导入副本，为共享预设补上完整原 extensions 对象，再从界面导入该副本。不得把该私有副本提交到仓库。另一种等效方式是只合并 research 目录下 safe_oai_settings_patch.json 所列字段，保留其余 settings 键；这份 patch 不是可直接导入的 ST preset。

## 现场观察与核对范围

修改前活动预设叫 Default，响应上限 300，上下文预算 2000000；100001 全局顺序中的旧版 GM 文风为 disabled，短示例没有加入活动顺序。旧模块虽然存在于列表，并不等于已经启用。未发现除项目文风外的自定义 prompt。

源代码核对：本地 public/scripts/openai.js 的 settingsToUpdate（306 起）、getChatCompletionPreset（4582 起）、onPresetImportFileChange（4766 起）、onSettingsPresetChange（5020 起）；PromptManager 配置明确使用 global / dummyId 100001（openai.js 696 起）。默认字段及原生顺序取自 default/content/presets/openai/Default.json。100000 兼容顺序同步同一内容。

本轮仅做一次本地 JSON/schema/标记顺序/隐私字段检查。模型 API 没有调用；是否已导入、持久化及正在活动，以本轮主任务记录为准。后续真实续演只需观察一轮：既有医馆事实是否被承接、布莱特与黄泉是否有区别、结尾是否自然，不需要重跑大量校验。
