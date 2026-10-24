# 901 重玩 T0 运行候选

## 人物基线

[`yulinfeng_replay_t0.baseline.json`](../../character_builder/real_character/yulinfeng_replay_t0.baseline.json) 保留人物卡资料集的御临风完整更新卡（source message 843579，第 229—524 行）作为来源快照，状态为 `APPROVED_REPLAY_BASELINE`。重玩开局沿用六属性与技能等级；派生值和资源按作者确认的开局边界由 [`yulinfeng_replay_opening.mjs`](../../character_builder/real_character/yulinfeng_replay_opening.mjs) 投影。此前 [`yulinfeng_t0.candidate.json`](../../character_builder/real_character/yulinfeng_t0.candidate.json) 和考据文件仍记录原团历史 T0 问题，但不再阻断重玩。后期卡面叙事经历、知识与原团事件没有随数值进入新分支。

| 卡面 | Builder | 处理 |
| --- | --- | --- |
| 六属性 6/7/6/5/5/4，体积 5 | `attributes`、`size` | 照录；不按历史 XP 重算 |
| 运动1、白刃5／长剑4等 | `skills` | 生存映射为求生；制造主技能空白，不补 0；炼药2保留在 `unmappedCardFields` |
| HP15、速度28、先攻11、防御5、意志上限9 | 来源快照的 `overrides.derived` | 完整更新卡原值仅供溯源；开局投影移除这些最终覆盖并重算 |
| 专长、大能、剑法、魔力和耶各能力 | `abilities` | 保留摘要和卡面行号，全部 `UNSUPPORTED`；不虚构通用加值 |
| 卡面防具、弃风、披风、手套、戒指与羽毛标本 | `equipment` | 记录列明状态；当前穿戴及特殊机制未证实，不直接执行攻击/防御 |

防御行写“5（基本防御5+2身法+1闪避加值）”，分解与最终值冲突。候选保留明确写出的 5，不把 +2、+1 再叠入。卡面另列 1 立场防御，不并入 core 通用防御。魔力写 106/106，但同页公式与强化文字无法直接调成同一上限；不从此处算重玩余额。

作者已确认重玩开档健康、意志按已确认上限回满、XP 0；穿普通帝国制式盔甲，其基础与风之忧郁相同，但没有风之忧郁的特殊效果。开局持有修复前弃风，有风迹，没有魔力和修复后弃风剑池；后期卡列装备均不带入。完整卡的六属性和技能等级保留，派生值按开局资源重算。旧隔离测试仍沿完整卡面派生值构筑测试状态，不写入正式存档；新的开局投影供 Builder 与 Adapter 单独验证。

### 一次性开档投影与未适配参数

开局投影保留体积 5、六属性与技能等级，移除完整更新卡的最终派生值覆盖、后期装备和后期能力摘要。Builder 得到规则基础生命 14、速度 18、防御 5、先攻 11、意志上限 9、反射 8、强韧 7，健康为 14/14、意志为 9/9、XP 为 0。甲的基础防护／惩罚、修复前弃风的攻击参数与是否持剑、风迹的上限／余额／消费机制尚无可执行数值；因此基础防御和速度不能宣称为穿甲后的最终值，特殊攻击和能量消费继续待适配。后期卡面的 HP15、速度28 不再填入开局运行卡。

执行 `node work/character_builder/real_character/yulinfeng_replay_t0.demo.mjs` 可看到 Builder → core 的普通洞察检定。JS 检定池 6，示例六个 8 为 6 个投骰成功，DC2 成功；它是可复现示例，不是一次游戏随机投骰。

## 统一门禁

[`adjudication-gate.mjs`](adjudication-gate.mjs) 要求每条玩家行动先得到 `NO_CHECK`、`DIRECT_EFFECT`、`CHECK_REQUIRED`、`NEEDS_INPUT` 或 `UNRESOLVED`。`NO_CHECK` 可以自然回应、确定成功或拒绝，但不写规则数值；`DIRECT_EFFECT` 先按本地可信模板经 JS 与 MVU 验证并保存，再叙述。在待裁定或缺输入时，门禁只发固定文本与含原玩家楼层、swipe、operation ID 的元数据。普通检定交给 [`replay-check.mjs`](replay-check.mjs)，它从可信 Builder 卡构筑测试状态，使用 core 与现有 MVU Adapter 结算、读回并按 operation ID 去重。叙述失败时相同 ID 读取已保存操作，不重投。攻击、特殊能力和未知资源消费目前返回缺项。

隔离角色脚本 [`replay-gate-script.example.js`](replay-gate-script.example.js) 在 `GENERATE_AFTER_DATA` 先停止原生生成，再调用结构化分类器。只有 `NO_CHECK` 或读回成功的 JS 结果进入模型叙述。此方案的程序边界是“分类后的结算与叙述顺序”；分类器把风险行动误判为 `NO_CHECK` 的语义风险、其他卡/全局脚本、独立写入者与并发原子性仍不能由这段脚本保证。

分类 `generateRaw` 现在只用显式 system 与一条 user_input：原玩家行动、待裁定动作的本次补充、最近一条有效场景叙述、由当前行动名称匹配的既有角色世界书条目、普通技能名及等级、规则状态中的伤势／动作摘要。无有效场景时标明缺项，不编造距离、危险或目标；不放入完整人物描述、世界书、聊天历史或 `stat_data`。`max_chat_history: 0` 配合不包含 `chat_history` 的 `ordered_prompts`；它单独设置时不足以阻止深度注入。续述请求沿用原有角色描述、场景、触发的 `world_info_before/after` 和最近六条聊天。续述期间在 `WORLDINFO_ENTRIES_LOADED` 按当前角色主世界书筛选四类来源的条目数组，再交由宿主执行原有触发、递归和深度放置；130 条 901 世界书没有删除或改写，全局选书设置不变。2026-10-19 已用保存的开场和问候验证实际输入，见文末。

本轮隔离演示增加唯一可信无骰模板 `demo.scene-cue`：GM 可依据当前场景提议给玩家一次“场景线索” `+1 DP`，仅用于下一次匹配的感知＋洞察检定。模板值、对象、来源及终止条件由本地 JS 固定；GM JSON 只选择 ID，同源未消费时不能重复授予。它是**demo-only 的具体场景裁定**，不是 901 普遍扮演奖励表或新 Canon。匹配检定前若有这个尚可选择的效果，脚本在本地弹窗列出“直接投骰／不使用”和使用效果；关闭弹窗保留未裁定状态，不投骰、不消费。无主动选项时自动投骰。当前卡面的通用意志加持数值、适用时机和特殊能力仍未接入，不能套用 RE 的原值；机运与 NPC 检定也尚无此隔离入口。

玩家本地提示只显示 JS 从运行状态读取的属性、主技能、至多一个子技能、已选择的公开修正及可公开小计。默认不显示骰值、成功数、DC、NPC 数值或秘密修正；完整结果留在既有 MVU 操作记录，聊天元数据只留操作 ID 和种类。GM 续述接收简短的已保存成败／效果事实，不再重复注入整份裁定和结算 JSON。这条展示边界覆盖早期“公开全部普通检定结果”的宽泛表述。它是界面与模型输入约束，不构成对存档或开发工具读取的保密承诺。

调用数：`NO_CHECK` 为分类 1 次＋世界书续述 1 次；`CHECK_REQUIRED` 与 `DIRECT_EFFECT` 也是分类 1 次＋保存后续述 1 次，本地面板与 JS/MVU 不调用模型。分类已直接给出完整规则请求，没有独立第三次请求。已保存操作且保有原请求的续述恢复可跳过分类，仅调用续述；分类失败保持 `UNRESOLVED`。将 `NO_CHECK` 的分类与正文合并仍是待对照候选，因为紧凑分类上下文不足以替代当前续述的世界书输入；本轮未据请求数臆称成本下降。

2026-10-14 本轮验证：上述四个运行模块已同步到既有本机 `public/901-rules-runtime` 隔离目录并核对哈希。相关 22 项 Node 测试及角色脚本语法检查通过；测试包括无骰效果写回和同源去重、选择前不抽骰、被篡改的 MVU 效果数值拒绝、公开骰池摘要不包含 DC/成功数。新开一段非 Canon 隔离聊天，普通问话“我问布莱特：进城前要不要先歇一会儿？”最终仍显示 `UNRESOLVED` 固定文本，没有确定性 GM 续述。浏览器未暴露这次分类失败的可靠错误体或实际 `messages`／`usage`，故不能断言错误来自模型服务、脚本初始化或输入组装，也不能把本轮离线测试算作 `DIRECT_EFFECT` 和本地面板的浏览器通过。依本轮停止条件未继续模型重试；本次浏览器尝试发生在最后一项“按行动名称取相关世界书条目”的离线增量之前。无骰效果、选择、JS→MVU→GM 和刷新读回的新版端到端验收仍待服务与诊断可用时进行。

候选卡在 [`901_帝都T0_重玩基线隔离候选.card.json`](../../../output/replay_tavern/replay_baseline_20261014_candidate/import/901_帝都T0_重玩基线隔离候选.card.json)，沿用 005 的 130 条世界书。**本机 SillyTavern 1.19.0 导入 JSON 后，酒馆助手 4.11.2 没有自动装入 `data.extensions.tavern_helper.scripts`：角色脚本列表为空、总开关关闭。** 因此在新隔离聊天中需打开酒馆助手角色脚本，新增并启用原有可玩原型的 MVU 加载脚本，以及 [`replay-gate-loader.example.js`](replay-gate-loader.example.js) 的内容；角色脚本总开关也须打开。门禁关键入口是：

```js
const { registerReplayGate } = await import('/901-rules-runtime/work/rules_engine/gm_runtime/replay-gate-script.example.js');
registerReplayGate({ getMvu: async () => {
  await Promise.race([
    waitGlobalInitialized('Mvu'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('MVU initialization timed out')), 5000)),
  ]);
  return Mvu;
} });
```

上述路径和 Builder/core/MVU 依赖需放在 SillyTavern 本机 `public/901-rules-runtime/work` 对应位置。它只用于隔离测试卡；正式 GM 卡和已有存档未改。

## 本次验证及限制

Node 测试验证两种风险表述停在待裁定、待裁定行动跨轮保持原操作 ID、补输入后进入 JS 结果、叙述异常时幂等重用，以及御临风普通检定经 MVU 保存一次且保留其他数据。本机浏览器里，新候选卡导入后出现 130 条世界书，但角色脚本未随 JSON 自动启用。首次手工入口发现 `Mvu is not defined`；旧入口在注册前等待 MVU 又让一次普通对话走了原生叙述。改为**先注册拦截器、先停止原生生成，再等待 MVU**后，漏装 MVU 脚本的测试闭锁为 `UNRESOLVED`，未叙述成功。补装原有 MVU 加载脚本后，页面显示变量初始化成功；随后两次普通对话的模型请求都返回 `Internal Server Error`，即使第三次缩小了分类提示上下文仍返回相同错误，门禁均闭锁为 `UNRESOLVED`，没有结算或确定叙述。刷新后待裁定记录仍在。因模型服务不可用，浏览器端的 `NO_CHECK` 正常续述、风险行动分类、真实随机检定到 GM 续述及刷新读回仍待验收。不能把 Node 替身测试或旧 Playable Prototype 的浏览器结果算作新门禁已完成端到端验证。

## 2026-10-14 浏览器阻塞复查

隔离聊天使用 SillyTavern 1.19.0、酒馆助手 4.11.2；API 为聊天补全／自定义 OpenAI 兼容端点 `https://catiecli.sukaka.top/v1`（请求路径 `/chat/completions`），界面所选模型 `3.5-flash`。未记录密钥。SillyTavern 的“发送测试消息”显示“API 连接成功”；同一配置下 TavernHelper `generateRaw` 的最小普通文本 A 返回“收到。”（44,007 ms），最小 JSON 分类 B 返回合法 `NO_CHECK` JSON（126,383 ms）。此前实际门禁请求经 TavernHelper → SillyTavern 聊天补全生成路径，界面报 `Internal Server Error`（HTTP 500），角色脚本日志报 `blocked Error: Internal Server Error`，随后固定回复为 `UNRESOLVED`。浏览器主页面控制台没有可用的相关错误记录，本机未找到可读取的 SillyTavern 服务端日志或 500 响应体；因此尚不能认定上游还是适配器的具体根因。

第三层诊断将实际分类文字放在仅含 system/user 的请求 C1，未带世界书、scenario 或 chat_history。C1 超过数分钟没有响应，刷新隔离页以结束悬挂请求；附带场景与最近聊天的 C2 因 C1 未结束而未执行。A/B 成功说明模型连接与 JSON 文本输出本身可用；C1 悬挂说明不能把问题仅归于 130 条世界书。**实际分类器仍未恢复，不得标记浏览器闭环通过。** 悬挂的临时诊断脚本已禁用，正式隔离门禁重新启用；原聊天的 `UNRESOLVED` 消息在刷新和重开后保留。

就绪检查现已在门禁启动和每次规则请求前核对 MVU 读写接口、规则运行入口、模型生成、消息发布、停止原生生成、当前聊天／玩家楼层／swipe。缺项显示 `NOT_READY`，请求闭锁；日志出现 `pre-narration hook registered; readiness pending` 只表示拦截器已注册，**只有 `READY` 才表示这些接口在该聊天可用**。浏览器刷新后实际看到了 `READY`，但这不表示模型分类可用。导入卡片后仍须手动在酒馆助手角色脚本列表新增／启用 MVU 加载脚本与门禁 loader，并确认角色脚本总开关；这是宿主的脚本安全边界，不能靠卡片 JSON 自动绕过。启用后刷新隔离聊天，在日志查看器核对 `READY`，再发送测试行动。

`NO_CHECK` 现对已观察的车流穿越、湿滑墙面攀爬及明确攻击词作独立拦截；已有待裁定动作也不能改判为 `NO_CHECK`。这是针对性程序阻断，**不是完整自然语言风险识别**。其他表述仍依赖模型分类，且分类失败一律 `UNRESOLVED`。真实随机御临风检定、MVU 保存、GM 续述、刷新读回及失败后去重在本次分类器故障期间未执行，不能用 Node 测试代替浏览器验收。

## 分类器最后一轮定界诊断

2026-10-14 在同一隔离聊天对 `generateRaw` 做两项有限对照。测试时暂时停用门禁以排除并发生成，结束后立即恢复并刷新；日志重新显示 `[901-REPLAY-GATE] READY`。这不是关闭门禁后的游戏验收。诊断脚本已停用，未记录密钥或消息正文。请求经过 TavernHelper `generateRaw`、SillyTavern 聊天补全生成、现有 custom OpenAI 兼容端点；界面模型和生成事件均显示 `3.5-flash`。生成事件位于发送至 SillyTavern 后端前，所以下列参数是**前端待提交数据**，不是上游收到的 HTTP 原始包。

| 对照 | 实际 messages 形状 | 字节／粗略 token 估算 | 参数 | 结果 |
| --- | --- | --- | --- | --- |
| A 最小 JSON，沿用分类器 `system + scenario + chat_history + user_input`、最多 4 条历史 | 4 条 system、3 条 assistant、2 条 user；其中一条 system 99,248 字符 | messages JSON 208,464 UTF-8 字节；按字符数÷4 粗估约 25,717 token，**非真实 tokenizer 计数** | `response_format=null`、`json_schema=false`、`stream=false`、`temperature=1`、`max_tokens=4096`、`top_p=1`、`include_reasoning=true` | 13,757 ms 返回合法 `NO_CHECK` JSON |
| B 实际分类器文字，只有 `system + user_input`，无场景／历史／世界书占位符 | 1 条 system、1 条 user | messages JSON 998 UTF-8 字节；同法粗估约 155 token | 与 A 相同 | 5,239 ms 返回合法 `NO_CHECK` JSON |

两次生成事件分别在请求开始后约 1,123 ms 与 729 ms 出现。非流式调用只在完整响应时返回；首字节／首 token 时间、成功请求的原始 HTTP 状态与响应体未由酒馆助手接口暴露。此前实际门禁曾显示 HTTP 500／`Internal Server Error`，另一次仅 system/user 的实际文字请求持续数分钟无响应；本轮没有复现 500，不能把其原因归给大消息。可以确认的是：**分类器同参数路径会在前端组装出额外的约 99,248 字符（204,160 UTF-8 字节）system 文本**，其来源尚未锁定；A 与 B 的显著请求大小差异不能归结为用户文字本身。第一轮采样曾和门禁并发，已剔除，不用于上表结论。当前只有这一条已配置模型端点；没有足够可比的第二调用路径，故未做 C。

结论为 **C：链路曾 500 和数分钟无响应，根因仍未证实**。本轮两次快速成功仅说明功能偶尔可用，不足以证明每轮实时分类可靠。后续若获准作最小替代，应先使分类请求只携带必要场景事实、限制远程调用等待；缺少场景条件时保持 `NEEDS_INPUT`／`UNRESOLVED`。极明确的无机械后果对话可以考虑严格本地放行，其余行动继续经门禁及 JS；任何超时都不得自动转成 `NO_CHECK`。该替代方案尚未实施。

## 分类输入收束与 30 秒等待（2026-10-14）

本地酒馆助手 4.11.2 的 `generateRaw` 路径已定位额外输入的**组装入口**：旧分类的 `ordered_prompts` 含 `scenario` 和 `chat_history`。其中 179 字符的 system 对应卡面 `scenario`；只要 `chat_history` 在 order 中，`generateRaw.ts` 的 `processChatHistoryAndInject()` 就调用 `populationInjectionPrompts()`，把作者注释、人物深度描述、世界书深度条目、扩展提示词和显式 injects 按深度并入历史。`max_chat_history` 只裁切历史条数，不关闭这条注入路径。先前 99,248 字符的额外 system 属于这条历史注入路径；旧采样没有保存其正文，**无法再精确归属到某一个扩展 prompt 或作者注释**，也不能据此认定它造成 HTTP 500。卡面 130 条世界书条目记录为 `after_char`，不能把这条大 system 直接说成整本世界书。

本轮修改 [`adjudication-gate.mjs`](adjudication-gate.mjs) 与 [`replay-gate-script.example.js`](replay-gate-script.example.js)：分类只取最近一条真正的场景叙述，跳过待裁定固定通知；原行动与不同楼层的补充各提交一次。分类 `ordered_prompts` 仅含 system＋`user_input`，不含场景／历史／世界书占位符，不传完整状态树。现有模型、端点、温度、`max_tokens` 和输出格式未改；GM 续述配置未改。分类设 30 秒上限，使用独立 `generation_id` 和 `stopGenerationById(id)`；超时只使该分类闭锁为 `UNRESOLVED`，不重试或触发迟到结果。停止接口只能证明本地已尝试取消，不能保证上游不再计算或计费。

实际在新建的**非 Canon 隔离聊天**中发送普通问话“我问布莱特：进城前要不要先歇一会儿？”。门禁就绪，基线加载、Builder 运行时构筑和隔离 MVU 初始化均完成。酒馆助手前端待发送 `messages` 为 **2 条（system、user），JSON 共 2,408 UTF-8 字节**，组装耗时 911 ms；没有旧采样中的大段 system、场景／历史占位符或深度注入。分类在约 **1,503 ms** 返回错误文字 `Service Unavailable`，未拿到结构化决定，也无可用 `usage` 或明确 HTTP 状态码。门禁发布 `UNRESOLVED` 固定文本，未进行 JS 机械结算或 GM 成败叙述。按本轮停止条件，没有继续发模型请求测试风险行动及完整检定，也没有把完整上下文作为备用路径。先前 HTTP 500 的根因仍未知；本次简短请求的错误不能归因于输入规模。

本地针对性测试覆盖：显式两消息请求、原行动不重复、未决固定文本不作场景、30 秒截止只取消对应 ID 且迟到结果不进入结算。真实浏览器中的超时、成功分类、JS→MVU→GM 续述与刷新读回仍待服务恢复后验收；Node 测试不能代替它们。较早 `PROPOSED_REPLAY_OPENING` 的余额和防御 5／8 待批准说法已由上述作者决定替代；当前缺项是制式甲、修复前弃风与风迹的具体参数。

## 有界阶段诊断（2026-10-14）

隔离脚本的 `REPLAY_GATE_DEBUG` 暂设为 `true`；诊断结束可改为 `false`。阶段记录只含操作／生成 ID、阶段、显式请求和最终消息的字节数、消息数、耗时、模型请求次数、可见 HTTP 状态及归一化原因；不保存提示正文或密钥。门禁的阶段回调把模型返回解析、门禁校验、结算、续述与持久化分开。受控模型响应的离线测试覆盖一次 `NO_CHECK` 分类和一次续述，以及非法 JSON 在续述前被拒绝。

只做了一次新的真实浏览器普通问话。酒馆助手角色脚本总开关及“901 重玩 T0 统一门禁（隔离）”均处于启用状态；新隔离聊天中，门禁到达 `messages_assembled`，说明脚本、入口、状态读取和请求构造均已运行。该分类显式请求为 5,368 UTF-8 字节，前端最终消息为 2 条、5,257 UTF-8 字节；没有第三条大 system 消息。17,532 ms 后门禁发布 `UNRESOLVED`，未收到可解析的模型决定；诊断记录显示分类请求 **1 次**、GM 续述 **0 次**。该次错误对象没有可记录的 HTTP 状态，浏览器日志也未提供响应体或上游信息，因此只能定界为**最终消息组装之后、模型响应交给解析器之前的调用失败**；不能进一步区分宿主传输、HTTP 错误或未知上游。它不是脚本未启用、请求构造失败、JSON 解析、门禁校验、MVU 写入或续述失败的证据。显示的通用失败原因来自诊断归类覆盖错误，现已修正为保留首次分类失败原因；修正后未再发模型请求。无 provider `usage`，不估算 token 用量。

按本轮停止条件未继续执行本地选择面板和 `DIRECT_EFFECT` 浏览器验收，也没有重试或切换模型端点。正式卡、世界书和既有存档未修改。

## GM 续述失败定界（2026-10-19）

本次按作者要求追查既有失败，不再要求玩家重复发送问候。原聊天 `901 帝都 T0 重玩基线门禁候选 v0.1 - 2026-10-19@19h12m01s388ms` 的第一条问候已完成分类，记录为分类请求 1 次、续述请求 1 次，92,020 ms 后在 `continuation / continuation_failed` 闭锁。紧接着的重复问候在 `gate_validation / gate_rejected_decision` 闭锁，续述请求为 0 次。此前缺少 `scriptedOpportunityIds()` 的本机运行模块问题已同步修复；它不能解释这些已经到达续述阶段的失败。该次 92 秒失败没有保存原始异常或模型返回，不能回溯断言它具体是传输失败、空回复还是正文校验拒绝。

已证实两处具体问题：

1. **全局世界书污染了 901 续述输入。** 原 SillyTavern `settings.json` 的 `world_info_settings.world_info.globalSelect` 为 `开拓者-失落之地V1.1-世界书`。该书不是当前 901 角色世界书，却以全局配置参加组装。其 UID 12 `[mvu_update]变量输出格式` 和 UID 14 `[mvu_update]变量更新规则` 均已启用、常驻、按深度注入；前者要求每次回复末尾输出 JSON Patch。这与 901 的“JS 独占规则写入”和 `safeProse()` 拒收变量更新正文直接冲突。实际捕获同时含强制 JSON Patch 指令、`901_rules_poc` 状态树及大量另一张卡的内容。
2. **普通续述失败被保存成待裁定行动，下一次问候无法恢复。** `replay-gate-script.example.js` 的异常分支将失败的 `NO_CHECK` 也保存为 `pending: { original, operationId, request: null }`；而 `adjudication-gate.mjs` 对所有存在 pending 的 `NO_CHECK` 都抛出 `A pending action cannot silently become NO_CHECK`。用原存档 pending 离线重放，能精确复现第二次问候在续述前被拒绝。这是恢复状态混用，不是要求玩家换一种问候。

在独立临时数据目录中复制同一角色、世界书和开场，仅保留那一条已保存的玩家问候。两次离线组装均在模型传输前取消；只在副本中把 `globalSelect` 清空，其余续述提示配置保持不变：

| 组装条件 | messages | messages JSON UTF-8 字节 | 强制 JSON Patch 指令／完整状态树 |
| --- | --- | --- | --- |
| 保留原全局世界书 | 10 | 730,563 | 有 |
| 只保留 901 角色世界书 | 8 | 30,483 | 无 |

原全局配置把输入扩大至约 24 倍。此对照证实输入污染和输出约束冲突，不能单凭输入大小认定它就是历史 92 秒失败的唯一原因。另将既有聊天中一条含 JSON Patch 的真实原生回复交给现有门禁，得到 `Unsafe or empty narration`、正文发布 0 次、规则结算 0 次；普通无更新文本则通过。

作者随后明确批准**一次**真实续述验证：仅发送已保存问候及上述约 30 KB 的 901 上下文，目的地为当前配置的 Google Gemini 官方 API `generativelanguage.googleapis.com`，模型 `gemini-3.5-flash-lite`，不新增聊天消息。发送前验证最终 messages 的 SHA-256 与已检查的请求一致（`c49d1e078855ee8042a037d9b72e6b8f26fb35a4de24f506c23897025f5c8089`），没有自动重试。结果：

- 1,376 ms 返回 111 字符正常场景正文，无 JSON Patch、MVU 更新或 `901_rules_poc`。
- 服务端记录唯一一次 Google 响应，`finishReason: STOP`；provider usage 为输入 7,437 token、输出 96 token、合计 7,533 token。
- 将该真实正文离线交给现有 `runGuardedTurn`，以受控 `NO_CHECK` 分类验证正文路径：状态 `NO_CHECK`，内存发布 1 次、规则结算 0 次。此核对不再调用模型，也不写原聊天。

**当前结论：** 901 专用输入的单次真实续述已通过；全局世界书污染与失败后 pending 阻塞均有可复现证据。原全局设置、角色脚本和既有聊天未在此次诊断中修改，因此不宣称现用配置已经修好，也不把本次独立续述算作“真实分类 → JS/MVU → GM → 刷新恢复”的整链验收。修复应针对 901 输入边界、已分类普通对话的续述恢复，以及保留区分传输／空回复／禁止变量输出的错误原因；不需要再次让玩家发送问候来定位这两处问题。

本机证据目录：`C:/Users/pit/.codex/visualizations/2026/10/19/01a1553d-6c20-7392-8782-be998f17b9b5/gm-diagnosis/`。`request-with-global-book.json` 与 `request-901-only.json` 为前端实际组装输入；`offline-reproduction.json` 为失败重放；`real-result.json`、`real-verification.json` 为获准的单次真实返回和本地门禁核对。它们包含私有团务上下文，仅供本地诊断，不纳入导出或 Canon。

诊断结束后已关闭临时页面、停止两个诊断服务，并删除复制的数据目录（包括复制的凭据）；仅保留本地诊断脚本、输入／返回证据和日志。

## 输入隔离与续述恢复修复（2026-10-19）

作者已授权修复上述两处问题，要求复用既有记录、不再发送问候测试。已更新 `adjudication-gate.mjs` 与 `replay-gate-script.example.js`，并同步到本机 SillyTavern 的 `public/901-rules-runtime/work/rules_engine/gm_runtime/`，两个运行文件与源文件 SHA-256 一致。原件备份保存在下述 `gm-fix/runtime-before/`；没有修改全局世界书设置、角色世界书内容或原聊天。

- **世界书输入：** 续述调用临时监听宿主 `WORLDINFO_ENTRIES_LOADED`，原位过滤 `globalLore`、`characterLore`、`chatLore` 和 `personaLore`，只保留当前角色绑定的主世界书。保留宿主原有激活算法；调用完成或抛错均注销监听。缺少隔离接口或主世界书时停止续述。分类请求继续使用既有紧凑输入。
- **新失败记录：** 通过门禁校验的 `NO_CHECK` 在调用续述前将完整判定存到玩家楼层，状态为 `NARRATION_PENDING`，立即保存。刷新或原生重新生成删除失败提示后仍能恢复；恢复复用判定和原操作 ID，不重复分类、不进入规则结算。成功后清除玩家锚点的 pending，`NO_CHECK` 与 `APPLIED` 一样终止向前查找旧 pending。不同的新行动不能借续述恢复跳过分类。
- **兼容既有失败：** 旧记录没有保存完整判定，仅当同一原操作存在明确的 continuation 失败诊断且 `request: null` 时，允许重新分类原行动后恢复 `NO_CHECK`；普通 `UNRESOLVED` 仍不能静默转成 `NO_CHECK`。这是旧记录所需的一次分类，不自动调用模型或自动重试。实际使用时可重新生成现有失败回复，无需新增玩家问候。

验证全部复用已有记录或受控响应，**本轮真实模型请求为 0**：

1. 在无 API 凭据、仅配置拒绝生成的本地端点的临时宿主副本中，保留原来启用的《开拓者-失落之地》全局世界书，使用原开场及一条已保存问候。应用修复后捕获最终 messages 并在发送前取消：8 条、30,483 UTF-8 字节，与上轮成功的纯 901 请求逐字相同，SHA-256 同为 `c49d1e078855ee8042a037d9b72e6b8f26fb35a4de24f506c23897025f5c8089`。证明隔离由代码完成，无需清空其他角色使用的全局配置。
2. 直接读取 `19h12m01s388ms` 原 JSONL 的失败与重复问候记录，使用受控普通对话分类及上轮真实返回正文离线重放：`NO_CHECK`，保留原操作 ID，内存发布 1 次、规则结算 0 次，原 JSONL 字节不变。
3. 实际入口脚本的 Node 宿主测试覆盖：续述异常、玩家楼层保存判定、删除失败提示、脚本重新加载、续述恢复及成功清理。全过程仅 1 次受控分类，规则状态不变，玩家输入始终 1 条，临时世界书监听已移除。
4. 门禁、GM runtime 与 MVU Adapter 相关测试共 68 项，67 项通过。唯一失败为 `world-runtime.test.mjs` 的 `isolated capital card preserves the adopted 005 worldbook and opening without demo actors`：其第 12 行比较两份未在本次修改的旧候选卡 `description`，内容已不一致；不属于本次两个修复，未改动卡内容或放宽测试。新增回归与受影响的门禁／入口／恢复检查均通过，入口脚本语法检查通过。

本机验证文件位于 `C:/Users/pit/.codex/visualizations/2026/10/19/01a1553d-6c20-7392-8782-be998f17b9b5/gm-fix/`：`input-verification.json`、`record-replay.json`、`tests.log`。本轮没有生成新的游戏正文，没有把离线响应发布到原聊天，也没有宣称整条规则结算链已完成真实模型验收。酒馆页面重新加载后会使用已同步的模块。

离线验证结束后已关闭临时页面、停止两个临时服务并删除副本数据目录，保留修复前运行文件备份与验证证据。

## 2026-10-19 门禁恢复补强

- 已完成回复的重新生成在模型调用前复用原叙述；宿主移除原回复时从玩家楼层恢复原文。续述失败提示丢失但 JS 操作已提交时，普通玩家检定和隔离无骰效果从保存的操作还原请求，不再次分类或投骰；仍需一次续述才能补上未完成的正文。
- 聊天消息标记为 `APPLIED` 时，必须在玩家楼层找到同一操作的已提交 JS 记录。最终助手楼层缺少 `901_rules_poc` 投影时，从玩家楼层补齐后才把该回复视为完整。此修正不赋予聊天元数据规则权威。
- 相关 Node 测试 41 项通过。隔离浏览器在旧聊天重新生成一次，仍为 8 条消息、MVU 修订 2、操作 2 条，没有新增叙述。缺失投影与伪造完成标记使用受控宿主测试验证；未人为破坏真实聊天存档来复现。普通新行动仍分别调用分类和续述，合并方案留待裁定准确性对照。

## 2026-10-19 分类准确性针对性对照

沿用现有 `generateRaw` 分类路径、同一隔离模型配置（本次实际组装显示 `gemini-3.5-flash-lite` / `makersuite`）、同一非 Canon 输入，诊断按钮每次只发一条分类请求，不结算、不写聊天、不续述。旧提示的 C03 守卫交涉误判为 `NO_CHECK`；C12 在已知墙高与难度依据缺失时输出 `CHECK_REQUIRED` 和无效 `dc:12`。C07 已知身体前提不成立，旧提示正确返回确定性 `NO_CHECK`。

修改现有 `replayClassificationRequest()`：去掉示例中的默认 `dc:2`，明确整条复合行动的判定顺序，并把“识别需检定”与“具备可执行检定输入”分开。第一次对照 C03 返回 `NEEDS_INPUT`、C07 保持 `NO_CHECK`，但 C12 仍猜测 `dc:4`；于是只把“明确缺少角色输入或难度依据时必须先 `NEEDS_INPUT`”提升到现有分类 system 指令。最终同输入下，C12 返回 `NEEDS_INPUT`（缺墙高与难度依据），C03 仍返回 `NEEDS_INPUT`（缺可信交涉技能与难度依据）。输入齐备的 C12 正向对照则返回 `CHECK_REQUIRED`，请求为力量＋运动、已给定的 DC 2。最后一次 system 修订后未再单独复测 C07；其正确结果来自前一次修订。

本次共 **8 次真实分类模型请求**，每次最终均为 2 条消息；响应耗时 1.2–6.6 秒，无超时或传输失败。TavernHelper 未提供 provider usage，不据字节数推算 Token 或费用。该对照证明这几个固定案例的输出改善，不代表任意自然语言风险都能正确识别；也未测试完整 GM 续述或 JS 结算。相关门禁、规则入口与恢复 Node 测试 **42/42 通过**。临时诊断按钮已撤销，诊断角色脚本关闭，隔离门禁重新启用；原聊天维持 8 条消息。


