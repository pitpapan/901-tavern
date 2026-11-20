# 普通对白知情增量：本地最小实现（2026-11-14）

2026-11-15 最新合同08—10补测3/3通过本例指标：custom332/08保留两人中一人未听清的身份歧义，utterance绑定/coverage uncertain，Schema及7引用通过，无授予、待核1、当轮不问；333/09与334/10沿原from08文本，使用本次332真实待核和同一after.seed作平行对照，分别required空/ready/0问与真实ID/deferred/1问，不代答不授予。状态核对09完全不变，10仅标prompted；非手工待核或旧结果替换。3次用尽、累计334、余0，无重试；796旧证据/22正式文件/7产品源不变，无代码修改/补回执/action转换/放宽校验/部署/正式剧情/自动批准修订。仅有限样例，不证明稳定性或正式部署；证据沿战役dialogue-increment-live-20261114/last-three-20261115/ASSESSMENT.txt及verification.json。

2026-11-14 直接接收说明遗漏修复并完成余7次验收：story-dialogue-knowledge原有“直接告知无障碍、不强求复述确认；计划/假设/内心话不算接收”提为共享常量供新旧合同复用，新版仅插入该句，Schema/输入/坐标/seed/参数/校验不变。新增2项先1失败，最终相关128/128通过。325—331共7次逐例通过本轮知情指标：02传闻直接接收、05/06仅听清分片、07保留待核1且不问、01新消息来源登记、03未听见/04未开口不授予；7份Schema及61引用通过。729旧证据含324失败/22正式文件保持，无补回执/action转换/修补/放宽校验。余额0累计331；08及09—10未重测，不证明稳定性或全部动作分类。328上游返回control、其余n，请求模型未改。未部署/正式剧情/自动批准修订。证据沿战役dialogue-increment-live-20261114/direct-reception-guidance-20261114/ASSESSMENT.txt及verification.json。

2026-11-14 新版绑定/覆盖模型首例复测失败即停：新增8次仅用custom324/02一次，HTTP200，27951字节；utterance内嵌回执及coverage均输出，Schema/原校验/6引用通过，但要求接收者明确反馈而标uncertain，隔离新增知情0、待核1、询问0。旧“直接告知无障碍、不强求复述确认”规则未投影进新版实际请求，遗漏已证实，不能断言唯一原因；本轮未修复或重发。余7例未测、批次关闭，累计324；699旧证据/22正式文件/7产品源保持。无补回执/action转换/放宽校验/部署/正式剧情/自动批准修订。完整证据沿战役dialogue-increment-live-20261114/bound-receptions-live-20261114/ASSESSMENT.txt及verification.json。

2026-11-14 直接绑定回执与逐目标覆盖本地实现：原story-dialogue-knowledge新增prepareBoundDialogueExtraction，模型适配器显式使用dialogue-reception/2；utterances内嵌原utterance及无claimId接收项，程序只以父id做确定性关联，仍走原严格检查与MVU回执。每target必填recorded/uncertain/none及原文依据/理由，覆盖随原批次receptionCoverage保存；不从coverage补回执/未决项，不转换action。旧检查API仅保留历史/显式宿主兼容，新模型无旧格式自动回退。新增10项，相关126/126通过；旧检查函数/共享合同未改，692旧证据及22正式文件保持。仅本地结构与合成处理通过，模型可能误报none或漏抽，语义完整/真实模型效果未证明。模型0、累计323余额0，未部署/正式剧情/自动批准修订。证据沿战役dialogue-increment-live-20261114/bound-receptions-20261114/ASSESSMENT.txt、verification.json；请求预览28460字节未发送。

2026-11-14 action回执/接收与歧义漏抽专项：仅试验普通入口生成覆盖说明，未改校验或Schema。相关117项通过后用余8次（316—323）：7剧情均JSON/Schema/坐标有效，但02/07/01/03仍引用action而拒绝，05/06空回执漏抽仍失败，只有04未开口知情边界通过。321使用同完整嵌套Schema复制utterance+回执成功，不能把问题归咎于必然强制首分支；不算剧情通过。08因插入探针未发送。未找到新的确定性本地接线缺口，说明试验无改善已全部撤回，7产品源恢复本轮开始哈希；保留2项新增真实失败/正反例回归，最终116/116通过。615旧证据/22正式文件保持，累计323、余额0，原30次授权用完。核心模型选择/覆盖仍未验收，不修补回复、不放宽校验、不部署/正式剧情/自动批准修订。完整证据见战役dialogue-increment-live-20261114/reception-coverage-20261114/ASSESSMENT.txt及verification.json。

2026-11-14 五例格式失败后续：仅共享assertion-contract增加同源buildAssertionSchema，普通对白原prepare/extract/complete回调传递responseFormat；原消息/坐标/参数/校验不变，不恢复路线。单目标省去冗余contains计数（304上游400不支持minContains/maxContains），多目标恰好一次仍保留。新增8项，最终引擎85+战役114=199通过。本轮304—315共12次（400一次、独立格式探针一次、剧情10份），累计315，剩余8。10份剧情JSON可解析、9份Schema通过，但01仍有坐标/类型失败，02/05/07存在action引用或回执/歧义遗漏；仅309/06知情目标通过且另有动作误抽，完整语义未通过。308非首utterance分支探针通过，不把集中action归咎于强制首分支。claimId字段旁description试验无改善，已撤回；保留基础Schema本地候选，strict不代表上游可靠执行。原失败及565旧证据/22正式文件保持；无回复修补/校验放宽/部署/正式剧情/自动批准修订。剩余8不盲目耗用；原始完整请求/响应、调用记账校正及限制见战役dialogue-increment-live-20261114/schema-reference-20261114/ASSESSMENT.txt、verification.json。

2026-11-14 第01—10类新平行例对照：新增10项离线测试，相关战役136/136通过（作者构造回复，非模型效果）。用户授权30次，本轮294—303共10次，5份通过/5份失败：03未听见、04未开口、08接收人歧义保持边界；01/02把scope语义值写成span对象，05/06原始JSON缺status键引号，07非法manner类型，均原样拒绝且无新知情。原07→09/10受阻，另冻结08真实301待核的09/10对照并通过无关0问/依赖1问，无代答或授予。失败先诊断后仅继续不同冻结输入，不重发、不替换失败；不能认定稳定成功。本轮只改测试/证据/记录，不改产品提示或校验；398旧证据、22正式文件、7产品源哈希保持。累计303，余20未用，无部署/正式剧情/自动批准修订。逐例输入、完整输出及限制见work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/parallel-ten-20261114/ASSESSMENT.txt、complete-outputs.txt。

2026-11-14 第07—10例研发与验收完成本例目标：共享抽取提示复用assertionSlots生成逐字段值/span配对表，明确type封闭枚举、unit.status与unresolved空/非空配对；校验/输入/坐标/输出格式不变，不修补回复。新增7项最终60+126=186离线通过。10次额度使用7（287—293），287缺span、288非法type、290单元状态矛盾原样保留；289/07无知情且待核1，291/08不猜接收者且待核1，292/09无关闲聊不询问，293/10依赖真实289待核id询问1次且不代答。09/10逐字复用真实07隔离seed。累计293，余3未用、本任务关闭；没有重置额度或盲目重发。359旧证据/22正式文件保持，无部署/正式剧情/自动批准修订。有限场景通过不证明稳定性或所有样例以最终提示重测。证据沿战役dialogue-increment-live-20261114/final-four-unit-status-20261114/ASSESSMENT.txt及pool-summary.json。


2026-11-14 接收reason合同迭代：284缺span/order端点违反已发送规则；reason字符串及空值用法为明确提示遗漏，仅补原生成说明，校验/引用/接收逻辑不变。新增4项先1失败，相关123+56=179通过，284原样仍拒绝。用户明确继续后使用前次3次授权余2，custom285/286均HTTP200/stop，05只登记东门封闭、06只登记改走南门；未听清部分不授予、其他人不共享、pending空，均为uncertain来源说法，无世界真相升级。每份26处引用准确，原合同与隔离回放通过，revision3。原3次额度3/3用完、累计286、余额0，无重试；07—10未完成，不能称全套或稳定性通过。22正式文件/270旧证据保持，未部署/正式剧情/自动批准修订。证据work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/receipt-reason-20261114/。


2026-11-14 部分接收范围最小修复与验收：原283整句uncertain回执不是本地丢项；已有分片utterance可登记，但合同未明确reception与内容范围配对。仅story-dialogue-knowledge原提示补齐完整言说/内容投影/逐人状态，不改校验或自动修补。新增5项先1失败后相关119+56=175通过。用户新增3次，仅custom284/05发送，HTTP200/stop，模型已拆为前半句received/后半句not_received，但4字段缺span、order端点类型及reason=null错误，原校验INVALID_ROLE_SPAN，隔离revision0，整体失败即停。余2关闭，累计284；06/07未发，08—10亦未完成。244旧证据/22正式文件保持，无部署/正式剧情/自动批准修订。完整诊断/差异/回归/请求与原始响应见work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/partial-reception-20261114/。


2026-11-14 命题mode范围最小实现：仅共享buildAssertionMessages澄清当前命题、外层意图/内层内容、归属/发生与否定/条件范围；完整保留拟传内容、未发生限定和独立明确断言。原校验、枚举、输入绑定和坐标参照不变，不修补回复或加关键词分类。新增引擎6+战役2，相关56+114=170离线通过。281原回复仍结构合法、语义未证明；计划无知情授予/无凭空待核，实际接收仍登记。199旧证据/22正式文件哈希保持。模型0、累计281、余额0，无部署/正式剧情/自动批准修订；真实模型遵从未验证。证据：战役work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/proposition-mode-20261114/。


用户批准上一轮方案的最小实现与正反例离线回归。本轮无模型调用、部署、正式剧情或安装写入，不恢复正文自动批准或修订。此前关系/目的候选的六次实测及用户阶段认可保持原记录；本变更尚未打入其已交付 ZIP。

## 复用与新增

- `story-dialogue-knowledge.mjs` 复用同级引擎的断言合同：输入绑定、每目标一次、原文/角色/scope引用、否定/条件/转述和unresolved；新增有限的接收候选，不判断全文能否通过，不改写正文。
- 引擎 `assertion-extraction.js` 的原校验主体拆到 `assertion-contract.js`，以注入摘要函数复用；Node旧导出与SHA-256绑定不变，浏览器用WebCrypto计算相同摘要。没有复制另一套抽取校验器或恢复旧语义审查路线。
- 合同绑定contextRef，涵盖原文分支/楼层/swipe、必要前文、人物、已有命题和记忆。新模型适配器使用 `dialogue-reception/3`：每个unit包含非言说claims、`utterances:[{claim,receptions}]`、unresolved及必填coverage。嵌套claim必须是原合同的utterance；receptions不再提供claimId，只填写原说话者/接收者/引用/状态/命题字段。程序按父项id映射为内部原assertions/receptions后，继续通过原检查器；不改claim类型或补回执。v3每条接收必填`contentSpan`，原文精确引用且限于父言说内容内；登记/待核直接消费该范围，缺范围不默认整句。完整言说只需保留一次，听者和内容范围不同用各自回执。
- 每个target的coverage必须带status/evidence/reason：recorded须有明确接收或未接收记录；uncertain须有uncertain记录或显式unresolved；none须无接收记录和未决项，并说明原文依据。原文真实不代表理由正确，不据此批准语义完整。覆盖说明自身不生成回执或unresolved。
- 原 `story-knowledge.mjs.receive`、`grantKnowledge/reduceKnowledge` 和MVU事务仍负责授予、去重、持久化与读回。新消息只建立private、uncertain的来源说法，内容使用实际引用原文：`{kind:'reported_message',speakerId,text}`。不自动证明这段话为世界真相，不批准关系/时间/约定变更。
- 既有命题转述保留发送者取得依据与belief，不把传闻升级为确认。缺失取得依据保留待核；仅人工声明“听见”也不能绕过原发送者检查。
- 候选和待核记录存于原 `storyKnowledge.dialogueBatches`，新版coverage随批次保存于 `receptionCoverage`，没有第二个SQLite人物副本。原生分支采用一并重绑这些记录的来源；各分支后续决定独立。
- 普通入口沿现有数据库 `AutoCardUpdaterAPI.exportTableAsJson()` 只读提供记忆上下文，不加Summary来源、不写数据库表、不将摘要当接收凭据。

## 2026-11-15 本地集成候选接口与调用链

当前405断点已将v3接收范围接回十二阶段本地候选：实际普通入口保存/重开/无关不问/相关确认/原请求续行已验收，六次新模型调用400—405，起始场景与分类为明示夹具。范围合同沿399版，38项控制器回归验证本轮弹窗显示修复，原284项范围回归复用。候选135模块/3资产已更新，默认disabled、未部署；证据见`integration-20261115/mainline-v3-20261115/ASSESSMENT.txt`。下方旧断点均为历史记录。

2026-11-15 显式接收范围v3专项（399断点）：回执新增必填contentSpan，复用原精确引用/父言说边界/范围冲突和MVU登记，完整言说保留，不再要求复制utterance来表达部分接收；旧分片说明替换为字段合同，无关键词堆叠。284/284离线通过；394原385/388输入与395—399五份对照均通过本轮范围指标，bright原例仅前半知情/后半1待核且无关不问。原200已用65、余135，本批关闭；285旧证据/22正式文件不变。证据scoped-reception-20261115/ASSESSMENT.txt、verification.json；有限样例不证明语义稳定性，无自动修补/放宽/部署/正式剧情/自动批准修订。旧380候选ZIP未更新。

2026-11-15 部分接收范围一致性专项（393断点）：原检查器漏验同一听者/重叠原文范围的互斥status；仅补原prepareDialogueExtraction.check关系检查，复用现有言说分片、严格引用及MVU，不改提示/Schema/生成参数。279/279离线通过；原385及原样复测388现原样拒绝、零写入。6次模型4通过/2失败，原例模型分片仍未通过；392双听者分片正确，单条整句误报不由该结构检查识别。原200已用59、余141，本批关闭；证据reception-range-20261115/ASSESSMENT.txt及verification.json。旧261证据/既有账本attempts/22正式文件保持，无部署/正式剧情/自动批准修订；旧候选ZIP仍为380断点。

2026-11-15 接收依据/旁听范围专项完成（387断点）：仅evidence/reason生成说明澄清身份与接收依据、共用依据时间/内容范围；Schema/校验/MVU/原例输入未改。274/274离线通过，381—387共7次，4有限通过/3失败；原例格式及整段旁听误判仍失败，部分听清例结构通过却未分片、隔离登记整句。未发现可证实的本地丢项或扩大范围接线错误，不自动修补。原200已用53，余147，本批关闭。证据receipt-scope-20261115/ASSESSMENT.txt及verification.json；233旧证据/22正式文件保持。本轮未重打包，旧候选ZIP仍为380断点；未部署/正式剧情/自动批准修订。

2026-11-15 隐含听者/漏抽续作完成：原349/350及338未改正文/历史复测，连同8份预先冻结正反例在最终同版本通过本轮指标；271项离线通过。本轮23次、原200总账46已用/154余，9份中间失败全部保留。详见`integration-20261115/implicit-reception-20261115/ASSESSMENT.txt`。下方357断点是此前十二阶段状态，不能替代本次版本证据。

380断点历史版本为`dialogue-reception/2`，当时未加输出字段。`recipientSpans`区分当前直接指代、唯一隐含应答与旁听者听取关系；`evidence`保留当前实际接收/障碍；先覆盖言说再匹配facts，目录外新说法继续用null。说明放在对应Schema字段旁，`evidence`复用原span定义内联以避免宿主展开$ref时丢失同级description。共享消息构造可选`includeEnvelope:false`，仅新版使用，以免旧断言返回外壳与新结构并存；默认旧消息逐字不变。unit的公共Schema只保留一次，两个status/unresolved分支约束完全等价，校验器源码未改。嵌套说明明确coverage/unresolved属于unit，不能移到根层。没有回复转换、坐标修补、自动补回执或新的语义审查器。

模型仍可能输出格式错误、坐标错位或语义错绑；结构通过不能自动证明选对听者。此次结果是有限模型对照，未重新做浏览器UI/长期多人物验收，候选默认disabled、未部署。

最新真实验收：十二阶段本地候选与A/B有限真实链完成，最终267项相关回归通过，总计23/200次请求（335—357，含此前2次），余177未使用。完整证据和限制见`integration-20261115/DELIVERY.txt`及`iteration-200-20261115/final-verification.json`。A340—343完成实际言说接收、保存重开和承接；B344/345/351—354/356/357从真实听者歧义到无关不问、相关确认、同一请求续行。分类仍本地NO_CHECK。含旧336共7份失败/1份未覆盖保留，不称所有模型问题已解决；正式安装未改。

当前本地候选新增显式宿主配置，默认仍disabled；未经用户调用配置不会发送语义请求。实际正式安装未修改。入口保留原`configureDialogue(adapter)`，另提供：

```js
// 自备、明确授权的完成函数；函数接收原purpose/messages/responseFormat。
window.top.__901StoryKnowledge.configureDialogueHost({enabled:true,complete});
// 或复用当前酒馆模型/端点/采样参数（启用后会消耗语义请求）。
window.top.__901StoryKnowledge.configureDialogueHost({enabled:true,useExistingHost:true});
// 停止后续语义抽取和依赖调用，已保存记录与只读记忆保留。
window.top.__901StoryKnowledge.configureDialogueHost({enabled:false});
```

宿主如需在脚本重载后继续显式启用，可在初始化前提供`window.top.__901DialogueHost`同形配置；产品不把它持久化到剧情或设置、不读取凭据，未提供即关闭。完成函数返回原始文本或结构，后续由现有适配器解析/校验；无重发或修补。未解决的pending在依赖能力关闭后保持unavailable，不自动继续。

已有`generateRaw`支持`ordered_prompts`、`json_schema:{name,value,strict}`。薄映射仅在明确`useExistingHost`时使用该接口：消息按原顺序传入、历史长度0；原settings-ready hook只对包含本请求绑定的语义消息投影冻结messages和Schema，避免普通预设附加内容改变抽取输入；实际隔离宿主的custom_prompt_post_processing=merge_tools会在服务端合并相邻user消息，因此只在此语义请求内清空该后处理字段；不改全局设置或model/temperature/top_p/端点。正文仍走原generateKnown及文风/数据库入口。下游服务将json_schema映射为response_format；隔离浏览器验证记录单独说明，不宣称所有宿主版本天然兼容。

调用链：玩家原请求→（已有pending才调用dependencies）→相关时原确认对话框→原resolve→同一控制器续行→原分类→正文生成→保存与读回→observeDialogue→原严格检查/回执→原MVU dialogueBatches/knowledge→下一轮分类与叙事context。每个普通回复最多新增1次接收抽取；存在pending的下一轮另需1次依赖判断，二者都计模型额度。非模态处理继续当前原player楼层，不自动新发消息；若玩家已换请求，拒绝拿旧确认自动执行新请求。

恢复复用原prepared/processed记录：resumeDialogue只处理已保存prepared，不读取旧正文重新抽取；完成回复复用和后续请求在消费context前恢复。普通原生重生成沿已有楼层快照恢复机制保留知识与回执，不从上一楼重算。无效抽取正文保留unprocessed，不因重开自动重发。来源变化仍按原保留版本/聊天/状态校验拒绝。

最终本地验收：相关187/187通过；A明确接收保存/重开/下一轮投影，B待核/无关不问/相关确认/同一请求续行均经实际隔离界面。另完成未收到局部回放、暂缓不重复询问以及最终包入口捕获，共20份本地接口请求；所有正文、分类和语义接口都是合成夹具，模型0。prepared恢复成功后只清除对应仍匹配来源的unprocessed标记，真正无效回复的失败标记保留。

现有酒馆服务通过flattenSchema展开$defs；本次实际请求与浏览器捕获逐项一致，原约束未放宽，回包仍由原严格检查消费。本轮正文108317—113380字节、接收96865—106308字节、依赖3317—3401字节的具体请求已获HTTP200；不保证任意长度或长期稳定。每份实际字节、返回模型、用量与完整原始响应在账本中，验收原样回放不另计上游调用。

接收目的调用共享`buildAssertionMessages(input,{purpose:'reception'})`：仅聚焦信息传递及必要命题，原全文默认合同不变；确定性坐标参照增加可复制的目标、逐行与通用标点片段，不自动修坐标。v2复用新来源说法定义，`facts`是可引用目录而非抽取范围。言说内容引用直接成为消息，不能混入间隔旁白；当前应答允许结合历史消歧，但仍须提供当前原文依据。隐含听者引用仍有真实失败，不能据结构通过判语义完整。

`context().actorKnowledge[].facts[].sources[]`可附`receptionConfirmation:{rowId,received,recipientIds,speakerId,quote}`：只来自当前保留且processed的批次中已registered/received的原decision，匹配接收者及授予eventRef。它投影已有确认，不产生新确认或写存档。出现该字段时叙事补充“原接收歧义已解决”的说明，保留旧正文、消息belief与披露自主权；无该字段时不增加说明。

最终135模块与3原资产、生成入口已同步打包，默认disabled。真实链采用受控非Canon场景；A只验收实际“不识字/问路人”消息，B替代闲聊明确指定交谈对象，不把它称原隐含听者失败已修复。348/349是验收人工截停，并非新增自动语义审查。原通用文风合同未改，未部署或写正式剧情。

本轮详细证据与最终版本见原验收目录`dialogue-increment-live-20261114/integration-20261115/`；下述早期“未绑定真实complete/未打包”是当时状态。候选是否完成浏览器验证和交付以该目录最终记录及统一计划当前断点为准。

## 普通入口行为

1. 正常回复按原文保存、承接MVU并落盘后，调用 `observeDialogue`。仅APPLIED/NO_CHECK普通完成路径接入；没有扫描旧全文或自动补历史。
2. 未绑定extract回调时返回disabled，不发送请求。`createDialogueSemanticAdapter({complete,readMemory})` 可将宿主明确提供的既有语义完成函数适配为extract/dependencies；模块无fetch、密钥读取、端点、模型选择或重试。默认不绑定complete；本地候选可用configureDialogueHost显式启用，正式安装未启用。
   新模型适配器的extract默认标注v3输出合同，由observeDialogue选择 `prepareScopedDialogueExtraction`，复用原构造器与校验器；`prepareBoundDialogueExtraction`、v2显式回调及旧 `prepareDialogueExtraction` 保留历史验证能力。v3模型返回旧版或缺少contentSpan会被拒绝，没有自动回退、补范围或重发。旧保存批次不迁移、不重抽。
3. 全部候选先通过结构/引用/上下文校验。明确收到、角色与内容有界且无相关歧义的候选自动经原回执登记；计划、否定、问题、明确未收到不授予。无法确定的接收、身份或内容保留待核；同轮无关歧义不阻挡另一条明确接收。
4. 原文、回复版本或知识状态在抽取期间变化，拒绝提交。prepared批次保存后可恢复，不重复抽取或重复授予。失败不当作“没有变化”。
5. 下一轮在规则处理前，只有存在待核事项才调用dependencies，输入为本次请求和待核候选。无依赖不询问；相关候选才进入原本地选择对话框，可确认接收者/说话者/原文片段，或确认未收到、暂不确定。
6. 暂不确定不默认通过、不每轮再弹同一问题；涉及该消息的请求保持deferred，非相关对白继续。非模态状态入口可重新处理。依赖识别不可用或返回无法判断时显示unavailable，不假装成功或猜测继续；这可能暂停当前请求，是明确保留的能力限制。
7. 接收整理失败时原正文与完成状态不改，标记unprocessed，不重新生成正文、重复结算或暗中重试。

入口可显式绑定：`window.top.__901StoryKnowledge.configureDialogue(adapter)`。可按依赖查询 `questions(refs)`，显式处理 `resolve(answer)`。角色切换和当前操作忙碌仍受检查。模型不会拿到这些可写接口，只返回候选数据。

语义适配器未来执行时会消耗语义调用：本轮接收抽取一次；存在待核事项时，后续请求另需依赖判断。当前已在隔离验收外发，未在正式游玩启用；不承诺与原填表合并或零额外调用。不能把默认disabled称为正式游玩已经自动登记。

## 验证及实际限制

2026-11-14 类型说明补充：普通入口继承共享合同对args/scope字符串/null与*Spans引用/null的明确区分，不混用grounded配对格式、不自动转型。新增6项后相关50+112=162离线通过，280原始类型错误仍拒绝；原业务输入、坐标消息和校验不变。177旧证据/22正式文件保持，无模型/部署/自动路线。序列化对象、删除限定等语义错误即使结构合法也不视作语义通过，真实生成效果待验证。

2026-11-14 坐标参照：共享buildAssertionMessages现附第三条user数据消息，原assertion/user输入和哈希绑定不变，普通对白重写第二条业务输入时保留参照。参照只从documents原文生成，同inputRef、分块全局UTF-16坐标，不引用history/memory，不改写模型回复。新增8项后相关45+111=156项离线通过，原276仍拒绝；111旧证据/22正式文件保持。首例预览7532字节未发送，模型效果和长篇开销未实测。坐标正确也不能自动证明选对同名片段或没有漏抽；没有放宽校验/恢复自动路线。

2026-11-14 规范化标签说明补充：普通入口继承共享合同对规范化语义依据、同主体/限定的共用span及未表达/歧义区别的说明，校验与输入绑定保持。新增6项，相关引擎38+战役110=148离线通过。原273/274仍缺span拒绝，不补原文；模型0，未部署。语义推断、错绑与清空字段仍可能结构合法，测试不将其视为语义通过，也不自动批准。详见统一计划顶部及normalized-label-guidance-20261114。

2026-11-14 引用说明补充：原共享断言提示现明确值/span成对、documents内唯一跨句承接、未陈述角色与歧义的区别及禁止删断言规避；普通入口直接继承。校验器、输入绑定与正文不变。新增引擎6项及普通对白部分听见1项，相关33+109=142项离线通过；原缺span回复仍失败。语义错绑或漏抽可结构合法，测试显式保持semanticCompletenessVerified=false/canApprove=false，不据此批准正文。本轮无模型调用或部署，旧失败记录不自动修补。

2026-11-14 后续最小修复：模型`reason`是解释，不再因非空独立阻断明确接收；以`extractionReason`保留，真正的身份/内容/未决/取得依据阻断优先写入待核原因。其余状态、来源和引用校验保持。新增4项正反例后，本轮相关四套件108/108通过，原custom273缺span回复仍原样拒绝；旧证据及正式文件不变，无新增模型调用或旧失败记录自动采用。修复不回溯修改已保存的旧pending批次，不能证明真实模型已学会正确引用。证据见统一计划顶部及dialogue-increment-live-20261114/reason-fix-20261114；下列132+27为初次实现阶段的历史验证。

离线正反例在 `story-dialogue-knowledge.test.mjs`；普通真实控制器的桩测补在 `replay-gate-script.test.mjs`。样本验证的是指定语义结果经程序处理后的行为，不是模型理解准确率。没有按“定金”“来客”等特定措辞加关键词表，也没有改原叙事文风合同。

最终执行：

```
node --test work/rules_engine/gm_runtime/story-dialogue-knowledge.test.mjs work/rules_engine/gm_runtime/story-knowledge.test.mjs work/rules_engine/gm_runtime/story-knowledge-entry.test.mjs work/rules_engine/gm_runtime/replay-gate-script.test.mjs work/rules_engine/gm_runtime/narrative-style.test.mjs work/rules_engine/mvu_poc/adapter.test.mjs
```

战役侧132/132通过，包括原浏览器依赖闭包的临时目录打包检查；未重建已交付候选包。

```
node --test tools/trpg-engine/tests/gm-assertion-extraction.test.js tools/trpg-engine/tests/gm-assertion-grounded.test.js tools/trpg-engine/tests/gm-assertion-scope.test.js
```

引擎侧27/27通过，使用冻结样本/离线桩，无上游请求。合计159项通过；测试仅在隔离内存或临时文件中写状态。

已覆盖：新消息不升级世界事实、只授予接收者、传闻转述、无依据发送者、计划/否定/未接收、歧义持久化与按需确认、拒绝后不再询问、暂缓不反复弹窗、来源/swipe改变、角色映射冲突、无关歧义与明确接收共存、批次中断恢复、分支继承、语义回调错误、原文保留、普通入口接线和既有抽取合同兼容。

不能证明：语义模型不会误识别听者、漏抽或误判后续依赖；Schema通过和准确引用不证明语义正确。未知的说话者仍需映射到已登记人物；没有自动创建人物或授予其背景知识。新消息登记为“听到该说法”，不推定理解、相信、真实动机或披露条件完成。当前无实际浏览器交互验收或模型准确率验收，不给覆盖百分比。
