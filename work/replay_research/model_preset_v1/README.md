# 901 完整 Chat Completion 预设 v1

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
