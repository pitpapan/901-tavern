# 第一版资料格式与使用范围

本目录是F正式编写的审核稿，供作者阅读与后续适配；不是已经导入酒馆的运行包。manifest.json保存用户接受范围、编写状态和原分支文件指纹。

## 世界书

worldbook_source.jsonl沿用项目schema/worldbook_entry.schema.json。每行只写一个持久主题，类型仅world、faction、location、character、concept、event。sources保存精确证据；content中局部注明角色说法、来源冲突和原线时期，notes保存用途与边界。canon_status描述事实的确定性，不表示本次文稿已经通过用户审核。后来发生的原线历史不成为重玩结局。

世界书人物条目只保留身份、持久关系、重要历史与世界位置；完整行为依据和能力在人物作者档案中。

## 人物作者档案与卡稿

characters中的每条以CRC稳定身份标签挂接，作者章节记录来源和确定性，periods记录原线阶段，opening记录T0是否在场及适用范围。worldbook_content是独立写作的简传；runtime_card是按开局或待确认时期整理的扮演卡稿，不是将整个人物经历注入对话。

字段persona、speech_style、decision_style、relationships、abilities与knowledge_boundaries提供人物依据；growth_boundary和activation_notes限制适用时间。单次言行保留发生条件，不自动固化成永久人格。资料薄的角色保留短档和明确空白，不补造口头禅、隐秘目标或能力。

character_dispositions.jsonl解释扩展研究标签的去向：独立人物、确认别名、疑似身份、历史／机制记录或梦境排除。研究标签数量不等于独立人物数量。旧身份猜想和梦境完整资料继续留在原研究目录。

## 御临风

persona目录保存作者档案与开局Persona。玩家可用资料和作者限定资料分开；AI无权决定御临风的新对白、行动、内心、目标和成长。原团后期履历供作者查阅，不用作自动升级路线。

## 后续修改

实体ID保持稳定；修改具体断言、时期或卡稿时保留来源。用户审核反馈以人物或世界主题为单位修改，后续再进行酒馆格式及加载配置。本轮只核对新文稿的结构、来源定位、身份映射与明显时期泄漏，不重跑原库审计。
