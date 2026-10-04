# F4 导入格式核对

核对日期：2026-10-03。作者技术笔记，不进入模型正文。最终依据是用户提供的本机 SillyTavern **1.19.0**（`D:/github/sillyTavern/package.json:118`），再以官方文档和原始 V2 规范交叉核对。本任务仅读取程序代码，未读取 settings、凭据或人物档案，未安装、启动、导入或改动酒馆。

## 交付形态

建议主要入口为一张 **Character Card V2 JSON 主持卡，内嵌一个 character_book**。JSON 可直接走角色管理的导入；没有头像时本机代码使用默认头像。主持卡负责主持，御临风仍使用原生 Persona。世界书包含经过本轮投影选择的设定与 NPC 资料，按关键词取用，不把全书复制到卡的 description。[本地 JSON 导入代码](D:/github/sillyTavern/src/endpoints/characters.js:883)；[官方角色设计](https://docs.sillytavern.app/usage/core-concepts/characterdesign/)

不能宣称“单击后全部自动配置”。本机导入角色后，会按用户选项弹出内嵌书导入确认，或提示使用角色菜单 **More → Import Card Lore**；这一步才把内嵌书转成酒馆原生 World Info 并关联角色。Persona、摘要选项和全局 World Info 预算另行设置。[本地关联代码](D:/github/sillyTavern/public/scripts/world-info.js:5697)；[官方 World Info](https://docs.sillytavern.app/usage/core-concepts/worldinfo/)

独立原生 World Info JSON 可作为更新/备用入口；它与卡内嵌书是同一份内容的两种包装。使用内嵌导入路径时，不再另导入并激活不同名称的同内容世界书；同样不需要再将这份书绑定到 Persona、聊天或全局。现有重名书可能被覆盖，版本名应清楚。

## Character Card V2 最小结构

以下内容是格式占位示例，不是正式资料，不能作为设定事实。交付时把占位正文替换成已有 F3 和已选择的运行正文。

```json
{
  "spec": "chara_card_v2",
  "spec_version": "2.0",
  "data": {
    "name": "901 主持",
    "description": "此处放主持规则正文。",
    "personality": "",
    "scenario": "此处放已确认的开局锚点。",
    "first_mes": "此处放不替玩家作决定的开场。",
    "mes_example": "",
    "creator_notes": "作者说明；不承担运行规则。",
    "system_prompt": "",
    "post_history_instructions": "",
    "alternate_greetings": [],
    "tags": ["901", "TRPG"],
    "creator": "901 档案项目",
    "character_version": "F4-v1",
    "extensions": {},
    "character_book": {
      "name": "901 帝都重玩 F4 v1",
      "description": "本次重玩的运行资料。",
      "extensions": {},
      "entries": [
        {
          "id": 0,
          "keys": ["示例专名"],
          "secondary_keys": [],
          "content": "此处放能够独立理解的完整正文。",
          "enabled": true,
          "insertion_order": 100,
          "comment": "示例专名",
          "selective": false,
          "constant": false,
          "position": "before_char",
          "extensions": {
            "scan_depth": 4,
            "case_sensitive": false,
            "match_whole_words": false,
            "exclude_recursion": true,
            "prevent_recursion": true,
            "probability": 100,
            "useProbability": true,
            "vectorized": false,
            "ignore_budget": false
          }
        }
      ]
    }
  }
}
```

空的 system_prompt 与 post_history_instructions 让卡不另覆盖用户预设；实际主持规则放 description。creator_notes 用于导入说明，不用它承载主持约束。`character_book.entries` 是数组，entry 的 `extensions` 不可省；采用规范字段并使用本机支持的扩展。[V2 原始规范](https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md)

**重要映射**：V2 扩展采用 `exclude_recursion` / `prevent_recursion` / `scan_depth` / `match_whole_words`；本机原生条目采用 `excludeRecursion` / `preventRecursion` / `scanDepth` / `matchWholeWords`。`useProbability` 在两边均保持这个拼写。V2 顶层 `case_sensitive` 不应作为酒馆覆盖的唯一依据，本机转换实际读取 entry.extensions.case_sensitive。[本地转换](D:/github/sillyTavern/public/scripts/world-info.js:5617)；[上游对应转换](https://github.com/SillyTavern/SillyTavern/blob/release/public/scripts/world-info.js#L5206)

V2 规范允许书级 `scan_depth`、`token_budget`、`recursive_scanning`，但本机 `convertCharacterBook` 不将这些书级值应用到全局扫描设置。不能仅写入这些字段就声称已设置预算/关闭递归；每条扫描覆盖和一次性的全局配置各负其责。

## 原生 World Info JSON

原生根对象的 `entries` 是按 uid 编号的对象，不是 V2 的数组。最小清楚的单条结构如下；可加其他默认字段，但没有必要手工复制全部软件设置。

```json
{
  "entries": {
    "0": {
      "uid": 0,
      "key": ["示例专名"],
      "keysecondary": [],
      "comment": "示例专名",
      "content": "此处放能够独立理解的完整正文。",
      "constant": false,
      "selective": false,
      "selectiveLogic": 0,
      "order": 100,
      "position": 0,
      "disable": false,
      "addMemo": true,
      "scanDepth": 4,
      "caseSensitive": false,
      "matchWholeWords": false,
      "excludeRecursion": true,
      "preventRecursion": true,
      "delayUntilRecursion": false,
      "probability": 100,
      "useProbability": true,
      "vectorized": false,
      "ignoreBudget": false
    }
  }
}
```

原生 `position:0` 对应 Before Character；`disable:false` 对应启用。导入入口至少要求根对象含 entries，前端实际使用条目字段。[本地原生入口](D:/github/sillyTavern/src/endpoints/worldinfo.js:99)；[官方仓库原生入口](https://github.com/SillyTavern/SillyTavern/blob/release/src/endpoints/worldinfo.js#L91)

来源定位保留于作者侧映射/自定义 extensions，不塞入 content；需要区分的角色证词、有效时期和不确定性仍留在运行正文。标题和触发键本身不会自动进入模型上下文，因此正文必须写出对象姓名和关系。

## 扫描与预算建议

这是本项目的起始选择，尚不是运行测试得出的最优参数：

| 选项 | 建议 | 理由 |
|---|---|---|
| Scan Depth | 4 条消息 | 短场景内可维持相关信息，不倒扫整场历史 |
| Min Activations | 0 | 不为凑条数把陈旧话题拉回来 |
| Recursive Scan | 关闭 | 人名/势力引用不继续串联全书 |
| Non-recursable / excludeRecursion | 普通条目 true | 该条不被其他条目正文间接触发 |
| Prevent further recursion / preventRecursion | 普通条目 true | 该条正文不触发更多条目 |
| Match whole words | false | 中文词语通常没有空格分隔 |
| Probability | 100 | 正常设定不随机缺席 |
| Context % / cap | 20% / 5000 tokens | 预算取二者较小值，为对话留下空间 |
| Vector matching、自动脚本、额外卡片/Persona匹配 | 不启用 | 当前靠已确认专名触发即可 |

核心常驻条目若有，保持少而短；常驻同样占预算。普通条目按准确专名/确认别名触发，避免用“帝”“龙”“魔法”“军队”这种高频泛词。递归关闭只控制资料载入，不妨碍模型根据已经载入的关系推理。超预算可能丢掉已触发的条目；进入 G 时只需看一轮实际上下文确认关键资料是否齐全，不建立大批模拟测试。[官方扫描说明](https://docs.sillytavern.app/usage/core-concepts/worldinfo/#activation-settings)

本机保存位置是 `settings.world_info_settings`，不是 `extension_settings`。配置参考对象如下；**这不是整个 settings 备份，也不是导入预设文件，本轮不得用它覆盖现有设置**。

```json
{
  "world_info_settings": {
    "world_info_depth": 4,
    "world_info_min_activations": 0,
    "world_info_recursive": false,
    "world_info_match_whole_words": false,
    "world_info_budget": 20,
    "world_info_budget_cap": 5000
  }
}
```

依据：[本机设置汇集](D:/github/sillyTavern/public/scripts/world-info.js:795)、[本机保存 payload](D:/github/sillyTavern/public/script.js:8080)、[本机预算取较小值](D:/github/sillyTavern/public/scripts/world-info.js:4737)。

## Persona 原生备份导入

本机支持如下单 Persona 备份结构。描述直接复用既有 Persona 纯正文，不带作者字段；本笔记不读取或重审这份正文。

```json
{
  "personas": {
    "901-yulinfeng-t0-v1.png": "御临风"
  },
  "persona_descriptions": {
    "901-yulinfeng-t0-v1.png": {
      "description": "此处逐字复用既有 Persona 正文。",
      "position": 0,
      "depth": 2,
      "role": 0,
      "lorebook": "",
      "connections": [],
      "title": "901 帝都开局"
    }
  },
  "default_persona": null
}
```

key 是内部头像文件名；缺图时恢复流程使用默认头像。同 key 的已有 Persona 和描述会被跳过，不能用重复恢复当作更新；新版本需有明确更新步骤。`default_persona:null` 不改用户全局默认。导入后选中它并锁定本次聊天。description position 0 是普通提示位置；depth 仅在选用深度位置时起作用。保留空 lorebook，避免把同一本主持世界书再绑一次。也可在原生 Persona 面板创建后粘贴正文，不需要备份入口。[本机 Persona 备份和恢复](D:/github/sillyTavern/public/scripts/personas.js:1743)；[官方 Persona](https://docs.sillytavern.app/usage/core-concepts/personas/)

## Summarize 起步配置

F4 交付摘要提示词和字段说明；G 再导入并试用。建议原生 Summarize 使用 Main API，先暂停自动更新，关键场景结束时手动 Summarize now，不增加 Extras 服务。摘要 prompt 用既有 F3 版本。Raw, blocking 只处理需要摘要的对话和此前摘要，避免把世界书设定误当已发生剧情；手动模式也不要求玩家逐轮维护状态表。[官方摘要说明](https://docs.sillytavern.app/extensions/summarize/)

本机字段位于 `settings.extension_settings.memory`。下列是**配置参考片段**，并非可直接覆盖全 settings 的导入文件：

```json
{
  "source": "main",
  "memoryFrozen": true,
  "promptInterval": 0,
  "promptForceWords": 0,
  "prompt_builder": 1,
  "SkipWIAN": true,
  "scan": false,
  "position": 0,
  "role": 0,
  "depth": 2,
  "prompt": "此处放 F3 摘要提示词。",
  "template": "[本分支已发生事实与现状\n{{summary}}]",
  "overrideResponseLength": 0,
  "maxMessagesPerRequest": 0
}
```

`memoryFrozen:true` 暂停自动摘要，Main API 仍可手动触发；`scan:false` 避免旧摘要里的大量名词持续唤醒世界书。`prompt_builder:1` 是 Raw, blocking；SkipWIAN 在 Raw 下已经由构造方式排除，保留 true 也便于切换 Classic。`position:0` 是扩展的普通提示位置，勿与 World Info 的 position 枚举混为一谈。response length 0 继承当前 API 设置，后续若出现摘要截断再调。摘要文本存在聊天消息 extra.memory，不存入这个全局设置片段。[本机默认字段](D:/github/sillyTavern/public/scripts/extensions/memory/index.js:109)、[本机摘要持久化](D:/github/sillyTavern/public/scripts/extensions/memory/index.js:964)、[本机提示位置枚举](D:/github/sillyTavern/public/script.js:484)

本轮只需要有限检查：JSON 可解析、原生/V2 对应正文和触发一致、uid 唯一、梦境/旧结局/作者考据不进入默认运行正文、Persona 正文与既有版本一致。真正导入、模型连通、实际首轮与摘要接续留给 G，不把文件格式核对冒充运行验证。
