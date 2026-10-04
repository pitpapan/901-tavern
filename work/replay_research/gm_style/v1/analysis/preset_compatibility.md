# GM 文风提示词包：本地兼容性研究

日期：2026-10-03。范围：只读检查 `D:/github/sillyTavern` 的本地 SillyTavern 1.19.0 代码及已安装 shujuku 源码。未操作界面、未导入、未请求模型，也未读取用户密钥或连接配置。

## 结论与交付建议

使用 Prompt Manager 的**提示词列表导入包**，文件名可为 `901_GM文风.prompts.json`。这是可并入用户预设的文风模块，不能称作已完成模型配置的完整采样预设。

推荐只增加独立自定义提示，不覆盖 `main`、`jailbreak`，不复制主持卡 F3 全部规则，不写全局 marker 排序。正文与短示例都放入这个自定义提示中，才能共同受生成类型限制。角色卡的 `mes_example` 默认由 `dialogueExamples` marker 注入；其默认设置没有相同类型过滤，不能宣称放进卡片的例子会随文风条目一起避开 Quiet。

最小可靠结构：

```json
{
  "version": 1,
  "type": "full",
  "data": {
    "prompts": [
      {
        "identifier": "901-gm-style-v1",
        "name": "901·GM文风",
        "system_prompt": false,
        "marker": false,
        "role": "system",
        "content": "文风规则与少量安全示例置于这里。",
        "injection_position": 0,
        "injection_depth": 4,
        "injection_order": 100,
        "injection_trigger": ["normal", "continue", "swipe", "regenerate"],
        "forbid_overrides": false
      }
    ],
    "prompt_order": []
  }
}
```

`system_prompt:false` 表示可由用户管理的自定义条目，并不把消息的 `role:system` 改为其他角色。`injection_position:0` 是相对列表位置；depth 在此模式不决定绝对插入深度。条目最后位于何处，按用户在提示词列表中拖放的位置。

## 为什么不直接导入只有 prompts 的 Chat Completion 预设

完整 Chat Completion 预设导入读取普通 JSON，没有要求必须存在采样字段（`public/scripts/openai.js:4766` 起）；导入后选择该预设并运行 `onSettingsPresetChange`。

- `openai.js:5057` 仅在 `preset[key] !== undefined` 时应用大部分字段。因此省略模型、连接、采样字段通常保留现有值，缺字段不是全体回退为默认。
- 例外：`openai.js:5052–5054` 对 `extensions` 无条件执行 `oai_settings.extensions = preset.extensions || {}`。所以一个只带 prompts/order 的完整预设仍可能清空当前预设的扩展配置区。
- `openai.js:5042–5044,5067–5073` 在绑定连接时还会清空自定义模型 UI 列表、触发连接来源变更处理。没有必要为了文风触及此路径。
- `loadOpenAISettings` 的缺字段回退默认行为（`openai.js:4340–4342`）属于加载持久化设置，与选择一个 partial preset 的路径不同，不应混淆。

提示词列表导入直接使用 `PromptManager.import`，只合并 prompts/可选顺序并保存设置，不执行以上预设连接和 extensions 更新路径。

## 导入、合并和排序的确切语义

代码：`public/scripts/PromptManager.js`。

- `1819–1849`：验证顶层 version/type/data，按 identifier 合并 prompts；同 ID 时新导入条目覆盖旧条目。
- `1852–1855`：global 策略执行 `Object.assign(promptOrder, importData.data.prompt_order)`。空数组没有可枚举索引，因此不修改已有顺序。不要提供一份缩短的顺序表：这里不是安全的整体替换，原顺序末尾可能留存。
- `1857–1860`：只有 character 策略才看 `type === 'character'`。本地 Chat Completion 使用 global，所以换 type 并不能代替空 order 的保障。
- `1877–1889`：prompt_order 可缺省；为了易于理解，明确写 `[]`。
- `961–965`：插入条目时，若未存在，会 unshift 到列表顶部，初始 `enabled:false`。仅导入文件不会自动激活。
- `1620–1623`：底部下拉列出 `system_prompt:false` 条目。
- `templates/promptManagerFooter.html:2–8`：下拉旁的链条图标是 Insert prompt；文件导入图标为 Import a prompt list。
- `675–696`：Prompt Manager 导入时会弹同 ID 覆盖提醒，再读取 JSON 调用 import。

手动步骤：

1. 在 Chat Completion 的预设区域把当前设置另存为专用于 901 的预设（保留用户自己的连接与采样）。
2. 找到 Prompt Manager / 提示词管理器，在其底部使用 **Import a prompt list / 导入提示词列表**。不要点顶部完整预设的导入。
3. 选 `901_GM文风.prompts.json`；同 ID 覆盖提醒是酒馆自己的常规提醒，首次独立 ID 不替换原 Main Prompt。
4. 从底部下拉选 **901·GM文风**，点链条 **Insert prompt / 插入提示词**。
5. 启用这行，并拖到 Main Prompt 后（其余标记相对顺序保持不变）。
6. 保存当前 901 专用预设。正常生成时文风模块随该预设使用；切换其他剧本可换回其原预设。

说明：这里研究的是单主持卡的 Chat Completion 提示管理，不是要求用户新建第二个故事会话。

## generation triggers 与 Quiet

- `public/index.html:7321–7327` 的真实值为 `normal/continue/impersonate/swipe/regenerate/quiet`。
- `PromptManager.js:1516–1530` 将本次类型规范为小写并按条目 enabled + shouldTrigger 过滤。
- `PromptManager.js:1549–1552`：未设置或空数组 = 任何生成类型；非空数组 = includes 匹配。
- `openai.js:1470` 传入本次 type 获取 Prompt Collection。

因此指定 normal/continue/swipe/regenerate 可排除**经过这套原生 Prompt Manager 的 quiet 和 impersonate**。它不是全局拦截器，不能承诺所有扩展、第三方脚本或未来版本都服从该标志。

建议文风正文加一条短的任务范围说明：文风针对场景叙事；显式的数据提取、摘要或填表任务遵循其结构要求，不作剧情表演。这是防误用辅助，不能替代扩展独立消息构造。

## shujuku 现有代码的边界

只检查已安装版本当前的生成通道，不验证用户实际选择了哪个 API 模式。

- `src/service/ai/prompt-builder/prompt-api-call.ts:314–317`：表格填充的 Chat Completion 连接预设路径，把已构造的 messages 交给直接请求。
- 同文件 `394–397`：主 Chat Completion 连接也走直接消息请求；不通过原生 quiet 的提示词组装。
- `src/data/gateways/ai-gateway.ts:149–169`：主连接请求直接使用传入 messages，加模型和采样参数；未把 Prompt Manager 的 prompts 拼入。
- 同文件 `263–296`：连接预设转生成参数后，显式以插件传入 messages 覆盖消息序列。
- `src/service/ai/api-call.ts:535–570`：通用 API 预设调用同样存在 Chat Completion 直接路径；其他通道会回退连接服务或 `generateRaw({ordered_prompts: messages,...})`。

据此，当前检查到的 shujuku Chat Completion 填表路径**通常不会自动继承这个原生提示词模块**，隔离来自插件自己构造 messages，而非 Quiet 过滤。未穷举扩展全部功能，也未运行模型试验；不能扩展为“插件任何模式一定不会读到文风”。尤其不要手动把文风提示加入填表模板、全局世界书或其独立系统提示。

## prompt_order 的 ID 含义

`role` 是 system/user/assistant；`character_id` 是顺序表所属的角色或占位 ID，不是权限级别或消息角色。

- `PromptManager.js:336` 的类默认 dummyId 是 100000。
- `openai.js:696–699` 的实际 Chat Completion 配置覆盖为 global + dummyId 100001。
- `PromptManager.js:1207–1208` 用 character.id 查匹配顺序。
- bundled Default.json 留有 100000 与 100001 两份历史/默认顺序，本机运行路径使用 100001。
- 若其他文件出现 character_id 400，只能确定它是顺序归属 ID；未有该文件上下文，不能把 400 解释成“系统角色”或固定用途。

本交付的提示词列表包无需填写这些 ID。

## 验证范围

完成静态读取与代码路径比对。没有实际导入、没有修改 SillyTavern 文件、没有调用模型。本备忘是技术兼容性说明，不属于原团 canon，也不应作为世界书正文加载。
