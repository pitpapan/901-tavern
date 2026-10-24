# Sol High：DC、状态抵抗、主动对抗与社交隔离测试判读

最终结论：普通观察与社交两例机械结算通过；状态抵抗与主动对抗两例均安全停止，未伪结算，但仍未接通酒馆端到端接口。另发现一处分类输出契约问题、一处未结算原因展示问题。四例均只发送一次实际行动，无重试。设计与判读由 Sol High 执行；实际酒馆分类与旁白由父代理使用 Gemini 执行。本判读未调用模型 API、未修改引擎或正式存档。

范围为 `scenario-plan.json` 的四个非Canon小场景；固定 DC2 是测试预先写明的场景依据，不是规则默认值，也不验证主持自动制定DC的能力。主角使用 `createOpeningFixture()` 的健康初始卡，未沿用前轮药品恢复夹具。四例初始与最终 JSONL 中，主角始终为完整生命12，B/L/A及状态均0，意志3/3、流风22/22；逐项比较主角 state，前后完全一致。

| 场景 | 核心支持 | 当前酒馆入口 | 实际首轮结果 | 判读 |
|---|---|---|---|---|
| 普通观察，感知＋洞察，明确 DC2 | `check` 支持 | 支持普通 check | `CHECK_REQUIRED → APPLIED`，revision1、操作1；Gemini旁白辨出暗记 | 当前场景通过 |
| 1点普通恐惧状态抵抗 | `applyStatus` 支持，意志1＋求生1＝2DP，成功数抵消状态点数 | 未接通通用状态施加／抵抗 | 正常 `UNRESOLVED`，revision0、操作0、无旁白生成 | 安全阻断符合边界；原因说明与玩家提示有缺陷；不能算已接通 |
| 明确主动／被动短跑对抗 | `oppose` 支持，先被动后主动，主动成功数≥被动则胜 | 未接通双角色对抗 | 模型识别未支持，但 `request:null` 被解析校验拒绝；最终 `UNRESOLVED`，revision0、操作0 | 未伪结算；分类协议首轮不通过；不能算已接通 |
| 寒暄后要求门卫改变决定，明确 DC2 | 普通 `check` 支持 | 支持风度＋社交普通检定 | `CHECK_REQUIRED → APPLIED`，revision1、操作1；Gemini旁白开门 | 当前场景通过 |

普通观察首轮按明示场景提交感知＋洞察、DC2，感知4＋洞察1＝5DP，无补造技能等级、子项或修正。保存骰序的实际消耗前缀为 `8,4,7,9,1`，8与9各为1成功，总成功2达到DC2。已用核心 `rollPool` 独立复算，结果一致。最终 MVU 为revision1，只有一条保存操作。Gemini旁白辨出了浅暗记，与JS `success:true` 一致；没有擅增后续剧情或机械收益。

社交首轮正确识别了改变决定这一不确定目标，没有被前半句问候降为 `NO_CHECK`。请求为风度＋社交、DC2，风度2＋社交2＝4DP，无补造子技能或修正。保存骰序的实际消耗前缀是 `1,3,4,10,8`：先投4颗，10产生1成功并追加一颗8，再得1成功，总成功2达到DC2。已用核心 `rollPool` 对保存骰序独立复算，结果一致。最终 MVU 只有一条保存操作，Gemini旁白中门卫实际开门，与JS `success:true` 一致；未增加伤势、状态、资源消耗或玩家新决定。

两个正常结算用例使用运行时随机源产生骰序，本判读只复算已保存结果，没有用固定骰替换真实抽取。本轮未实际进行刷新重试，一次性恢复的证据来自既有离线测试，不能冒充本轮刷新实测。两个正常用例恰好均成功，本轮也没有实际覆盖失败旁白。

对抗首轮的实际失败点已用原始分类结果离线重放定位：`adjudication-gate.mjs` 的 `decisionOf` 对 `UNRESOLVED` 最后执行 `else if ('request' in value)`，因此 `request:null` 虽无可执行请求，仍因字段存在抛出 `Unsettled decision cannot carry a rule request`。诊断随即记录 `response_parse / invalid_model_response`。原样重放可复现；只删除这个 null 字段，原结果即可正常进入 `UNRESOLVED`，两种重放均没有调用结算或旁白。对照证据见 `null-request-probe.jsonl`。这说明模型已识别入口限制，但其结构输出不符合当前契约；不能把最终相同的 `UNRESOLVED` 当成完整分类流程通过。模型理由把限制泛称为“无法自动运行NPC检定”也不够精确：可信宿主提供完整人物和场景授权时，`settleNpcCheck` 已能做普通NPC检定；本题缺的是双角色对抗接口，不能用两个普通检定或固定DC暗中替代。

状态抵抗首轮正常返回了不带 request 的 `UNRESOLVED`，没有进入结算或旁白生成。主角仍无恐惧状态，操作与revision都为0，未口头裁定成败。但模型理由把“对应属性及固有DC定义缺失”与“没有机械接口”混在一起：普通恐惧关键属性已有规则依据，而且这里是成功数抵消1点状态的机制，不需要固定DC。真正的阻断是酒馆未接状态抵抗接口。`runGuardedTurn` 又把 `NEEDS_INPUT` 和 `UNRESOLVED` 共用“请补齐必要信息”提示，未向玩家呈现本次真实的未接入原因；补参本身不能让这条入口执行状态抵抗。

离线验证已完成一次：`core.test.mjs`、`adjudication-gate.test.mjs`、`replay-check.test.mjs` 合计71项通过，另运行Builder中2项相关技能资格用例并通过，无失败或跳过。完整日志为 `offline-tests.tap` 与 `offline-skill-qualification.tap`。覆盖普通DP及自动成功分项、对抗同值主动成功、普通状态抵抗、未知技能／子技能不按0、普通问候、无DC依据时的分类提示契约、操作保存和重试。分类相关离线测试采用受控响应或提示文本断言，不代表Gemini已经实测通过“问候无需掷骰”或“删DC后正确补参”；本轮没有额外发送这两类真实请求。

证据：`scenario-plan.json`、`live-results.json`、`dc-observation-final.jsonl`、`status-resistance-final.jsonl`、`active-opposition-final.jsonl`、`social-compound-final.jsonl`、四例相应 `*-initial.jsonl`，以及上述离线日志与null字段重放记录。当前可确认“明示难度的普通检定与社交检定各一次实测通过”；不能据此声称“自动定DC、所有豁免或对抗已经在酒馆端到端接通”。未在本任务中扩大测试或修复入口。
