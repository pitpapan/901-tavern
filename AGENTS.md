Project 901 — Campaign Data and Creative Development

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


2026-11-14 第05—10例续测在05语义失败即停：用户新增6次，仅custom283一次HTTP200/stop、8327ms，请求10392字节，最新合同以外业务输入/坐标参照/参数保持。模型已抽出黄泉听清前半句，却仅给完整utterance的uncertain空接收者回执；21引用准确且结构通过，隔离回放知情0、整句待核1、尚未询问。未登记明确听清内容，本例目标失败；06—10未发，09/10未以替代数据构造。1/6用完，余5关闭、累计283，无重试/修补/放宽校验；22正式文件/7产品源/222旧证据保持。完整请求/原始响应及核对见work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/remaining-six-20261114/。无产品修改/部署/正式剧情/自动批准修订。


2026-11-14 第04例命题mode单次复测custom282：仅system加本轮命题范围说明，请求10023字节，其余输入/坐标参照/参数不变。HTTP200/stop、5339ms，完整拟传内容留在asserted意图状态内，未另抽独立世界状态；开口denied、time=还、8处引用准确，receptions/pending空。原隔离seed回放无知情或世界事实增量，revision2仅处理批次。本例目标通过，不证明跨场景稳定。1/1用完、累计282、余额0，无重试/修补/放宽校验；22正式文件/7产品源/207旧证据保持。完整请求、原始响应及核对见work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/proposition-mode-retest-20261114/；无部署/正式剧情/自动批准修订。


2026-11-14 命题mode范围最小实现：仅共享buildAssertionMessages澄清当前命题、外层意图/内层内容、归属/发生与否定/条件范围；完整保留拟传内容、未发生限定和独立明确断言。原校验、枚举、输入绑定和坐标参照不变，不修补回复或加关键词分类。新增引擎6+战役2，相关56+114=170离线通过。281原回复仍结构合法、语义未证明；计划无知情授予/无凭空待核，实际接收仍登记。199旧证据/22正式文件哈希保持。模型0、累计281、余额0，无部署/正式剧情/自动批准修订；真实模型遵从未验证。证据：战役work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/proposition-mode-20261114/。


- 2026-11-14 第04例类型说明复测custom281完成：仅system加类型说明，8519字节，其余业务输入/坐标参照/参数不变；HTTP200/stop，scope.time字符串且独立span，13引用准确，原合同及未接收指标通过，隔离revision2/无知情或世界事实增量/pending空。计划内容另列asserted但保留打算告知归属，完整语气未证实，人工partial。1/1用完，无重试/转型/修补，22正式文件/7产品源/旧证据保持；无部署/正式剧情/自动批准修订。证据dialogue-increment-live-20261114/value-types-retest-20261114，累计281。

- 2026-11-14 args/scope类型说明本地完成：复用共享合同，仅补语义字符串/null与span/null的区别及禁止互填/混用/转换规避，普通入口继承。新增6项，相关162通过，原280仍INVALID_ROLE_SPAN且失败记录保持，177旧证据/22正式文件不变。校验/输入/坐标参照不变，模型0/累计280，无部署/正式剧情/自动批准修订；证据semantic-value-types-20261114，真实效果未验证。

- 2026-11-14 其余九例续测在04失败即停：用户新增9次，custom278–280均HTTP200/stop，02传闻转告/03未听见按本例指标通过；04计划未发生语义保留但scope.time为span对象而非string/null，INVALID_ROLE_SPAN，9处坐标无误、隔离revision0。3/9已用、余6关闭，05–10未实测，无重试/补文。22正式文件/7产品源/135旧证据保持，无部署/正式剧情/自动批准修订；证据dialogue-increment-live-20261114/remaining-nine-20261114，累计280。

- 2026-11-14 坐标参照一次复测custom277完成：相对276仅增坐标规则/第三条参照，7532字节；HTTP200/stop，13处span均准确，原合同/明确接收隔离回放通过，仅黄泉获uncertain来源消息，revision3/pending空。但动作object仍null，完整断言与稳定性未证明，人工partial。1/1用完，无重试/修坐标；22正式文件/7产品源/旧证据保持。未部署/写正式剧情/恢复自动批准修订，证据dialogue-increment-live-20261114/coordinate-retest-20261114。

- 2026-11-14 坐标参照本地候选完成：复用共享assertion-contract生成第三条user坐标数据，明确0基/左闭右开UTF-16，分块保留全局位置、代理对不拆。普通对白原入口直接继承，原输入/绑定/校验不变，无自动补文/修坐标。新增8项，相关156通过，276原始错位仍拒绝，111旧证据/22正式文件保持。首例预览7532字节未发送，模型0/累计276，不部署/写剧情/恢复自动批准修订；证据coordinate-reference-20261114。

- 2026-11-14 普通对白知情完整对照复测首例失败即停：用户明确新增最多10次，custom276仅1次HTTP200/stop；与275完全相同6186字节请求，c3人物/动作/anchor及接收evidence坐标错位，原切片不匹配quote，INVALID_ASSERTION_CLAIM，隔离revision0/无授予。余9未用、关闭不续发，02–10未实测；原文无修补，22正式文件/7产品源/79旧证据不变。无部署/正式剧情/自动批准修订；证据dialogue-increment-live-20261114/full-retest-20261114，不能称稳定通过。

- 2026-11-14 规范化说明一次复测custom275完成：相对274仅system加说明，6186字节，HTTP200/stop。原始回复合同/明确接收回放通过；name/value共用“封闭”span，只有黄泉获uncertain来源消息，隔离revision3/pending空。但听清动作object留null，完整断言无遗漏未证实，人工总体partial。1/1已用、余额0、无重试/补文，22正式文件/7产品源/旧证据保持；未部署/写正式剧情/恢复自动批准修订。证据dialogue-increment-live-20261114/normalized-label-retest-20261114。

- 2026-11-14 规范化标签/共用引用通用说明本地完成：沿共享assertion-contract澄清标签词不必逐字出现，但含义必须有原文依据；多个字段可共用且逐个显式引用，歧义保留不猜补。校验/输入绑定不变，无关键词补丁。新增6项，相关38+110=148通过；原273/274失败及57旧证据/22正式文件保持，模型0/累计274，无部署/正式剧情/自动批准修订。证据dialogue-increment-live-20261114/normalized-label-guidance-20261114，生成效果未实测。

- 2026-11-14 首例引用说明一次复测custom274已失败即停：仅system补说明，5416字节，其余输入/参数不变；HTTP200/stop，原听清object span已给出，但state.args.name=状态对应span=null，仍INVALID_ROLE_SPAN，隔离revision0/无知情授予。原始响应保存且未修补，1/1额度耗尽、无重试；22正式文件/7产品源/此前证据不变。证据dialogue-increment-live-20261114/span-retest-20261114，未部署/写剧情/恢复自动批准或修订；不能称模型通过。

- 2026-11-14 span生成合同说明已本地补齐：复用同级引擎assertion-contract的原提示入口，澄清字段/引用成对、跨句/歧义，不改引用校验或自动补文；普通对白继承同一说明。新增7项通用回归，相关引擎33+战役109共142通过，原custom273及35份历史证据/22正式文件保持。模型0，未部署/写剧情/恢复自动批准或修订；证据dialogue-increment-live-20261114/span-guidance-20261114，不能宣称模型已解决缺span。

- 2026-11-14 正面reason误阻断已本地修复：对白候选将extractionReason原解释与身份/内容/未决/取得依据的阻断分开，保留原接收状态与引用校验。新增4项正反例，相关四套件108/108通过；原custom273仍因缺span拒绝，30份旧证据及22正式文件哈希不变。未补原文/改提示/重发/部署/写正式剧情/恢复自动批准或修订；证据在dialogue-increment-live-20261114/reason-fix-20261114。下条“未修产品”为此前验证阶段历史。

- 2026-11-14 普通对白知情真实验证：授权10次，首例273 HTTP200/stop但非空object缺span，原样回放失败、无知情写入，立即停止；余9次未用、账本关闭。离线补span副本又暴露正面reason被当作阻断原因的程序缺口，未修产品。证据clinic-knowledge-20261112/dialogue-increment-live-20261114；22正式文件/7产品源保持，无部署、正式剧情写入或自动批准/修订。

- 2026-11-14 普通对白知情增量本地候选：`gm_runtime/story-dialogue-knowledge.mjs`复用引擎`gm/assertion-contract.js`原断言校验、既有数据库只读记忆和story-knowledge/MVU回执。新消息只登记来源说法；待核随分支保存，后续依赖才询问，暂缓不重复弹窗。默认未绑定真实语义传输，不恢复自动批准/修订。战役132+引擎27离线通过，无新模型调用/部署/正式剧情写入；入口及限制见gm_runtime/story-dialogue-knowledge.md与统一计划顶部。

- 2026-11-14 关系/目的归属候选与六次实测已收口：本地仅改story-knowledge原指令，新增六组成对例，相关3套件79/79通过；133模块候选与隔离普通入口截获通过。用户随后批准6次，267–272均HTTP200/stop，四份独立首轮不带旧纠错链，05/06固定承接02/03真实回复。关系范围/来源目的首轮指标有正面证据，但定金要求无依据、拟议来访逐渐确定化及等待式收尾仍在，不能称整体语义/文风全面通过。累计272、余额0、无重试；全文/判断/核验见relationship-purpose-20261114/live/。22正式文件与产品/候选包不变，本轮未重跑前阶段79项。上游自报模型带-n，与旧链版本等价未证实。未部署/写剧情/恢复自动路线；统一计划顶部为当前断点。

- 2026-11-14 两份回复离线复核后追加3次获用户澄清授权：264–266均HTTP200/stop，承接263及逐轮真实回复。模型允许自行调整核实方式和对其他人保留的选择，但不允许单方把两名同伴加入原双方单独确认；本次三项指标通过。纠正说明/原指令/来源/参数不变，累计请求尝试266、本轮余额0，无重试。证据source-contract-20261113/attribution-choice-20261114；连续有提示场景不证明跨场景稳定。22正式文件及产品源未变，不部署/写正式剧情/恢复自动路线。

- 2026-11-14 归属纠正投影两轮实测通过本次指标：用户新增2次授权，262/263均HTTP200/stop，承接261及262真实原文，参数不变，两条来源说明各出现一次。262将当面/核对来意明确归为自己安排；263将原限制明确限于御临风/黄泉，其余保留是自己选择。没有强迫披露或撤销安排；当前场景正面证据不等于稳定性证明。完整记录attribution-validation-20261114；累计请求尝试263，本轮余额0，无重试/产品修改/部署/正式剧情写入/自动路线，22正式文件不变。

- 2026-11-14 归属纠正本地最小实现：story-knowledge原生成合同区分来源要求/个人选择/旧错误对白；原rejectedNarration/projectMessages新增保留整条assistant原文并附annotation的方式，以sourceAnchors复用来源原文/swipe校验，重复投影不叠注。clinic目录仅登记已核定260/261，原约定及261提问均绑定；258混写、259个人安排不一并改判。新增5项先失败后相关67项通过，实际输入预览只加两条说明，逐人0/1/0、原258–261记录及22正式文件保持。证据source-contract-20261113/attribution-projection-20261114；模型0、旧余1未使用，未部署/写正式剧情/恢复自动路线，生成效果未验收。

- 2026-11-14 约定归属模型追问：用户明确新增2次后，承接260发出261，问当面/对清来意是原要求还是个人安排。HTTP200/stop但回答“是对方明确要求的”，所引原文仅支持单独确认，未澄清新增细节归属；按语义失败即停，第二次范围追问未发，剩余1次未使用不自动续发，累计请求尝试261。原文/来源/参数/逐人0/1/0及22正式文件未变，无产品改动、部署或自动路线。证据source-contract-20261113/attribution-probe-20261114；下列“额度待确认”为此前离线阶段记录。

- 2026-11-14 约定归属专项离线核对：258把原约定与会面计划混写，259可读作个人安排；260“我答应的是”把当面/对清来意挂入旧约定，来源无此要求。“暂不对外”范围过宽/含混，但不能证明已对所有人禁言；个人自行当面谈或扩大暂不说的范围本身允许。3份请求/6次来源投影完整、原约定及范围约束已发送，旧模型正文仅在assistant历史，未升级为MVU约定，无新程序遗漏、不改产品。相关28项离线通过、22正式文件未变；证据condition-retelling-20261114/attribution-*。本轮离线阶段新增调用0，末句含混的模型额度已问待确认；不部署/写正式剧情/恢复自动路线。

- 2026-11-14 未确认条件连续转述实测：用户新增3次授权，258–260逐轮承接custom256及前轮真实回复，均HTTP200/stop，无重试，累计请求尝试260余额0。自然追问核实方式→是否同伴参加→第三方求证能否替代，三轮均保留原传话者与布莱特，未确认状态和旧交未披露保持；末轮明确第三方不能替代。但将单独确认扩写为当面/对清来意，并将针对两人的暂缓概括为暂不对外，不能称整段约定完全忠实。完整证据在source-contract-20261113/condition-retelling-20261114；参数/来源投影/逐人0/1/0及22份正式文件未变，不改产品、不部署、不写正式剧情、不恢复自动路线。

- 2026-11-13 DNS对照与原样重发完成：同一Node探针在受限环境lookup/HEAD均ENOTFOUND，获准非受限环境DNS成功、HEAD404，支持运行环境限制；未改端点或网络配置。用户本轮另授权原两份各一次，256/257在非受限环境均HTTP200/stop，冻结体114519/115516字节与完整响应哈希核对通过；累计请求尝试257、余额0，无重试。未确认例自然不提旧交；已确认例明确与原传话者核实，未复现信件来源身份绑定或核对主体混用，但不能证明稳定改善。证据在source-contract-20261113/network-retest-20261113；22份正式文件未变，未改产品/部署/写剧情/恢复自动路线。下列255 DNS失败为保留历史。

- 2026-11-13 来源身份/指代通用合同最小实现：用户批准后仅在story-knowledge.mjs原生成指令追加身份关联与条件参与者保持规则，来源/条件投影、文风、隐瞒及是否披露选择不变；无关键词补丁或自动审查。新增6组正反例及合同检查，先1项失败后相关3文件62项通过。通过后即尝试原未确认对照（255），DNS ENOTFOUND、无HTTP/模型正文，停止且未发送已确认例，不重试。本轮1次传输尝试/0份模型回复；两份请求各只增加680字节通用约束，22份正式文件未变。证据见communication-20261113/source-contract-20261113；未部署、未写正式剧情、未恢复自动路线。模型效果仍未验收，下列254/无产品修改为前轮历史。

- 2026-11-13 来源身份/指代专项核对：253实际输入已分开村医推荐信与未具名来客，并明确原来客与布莱特是单独确认双方；“托付信件的来客”为模型无依据绑定，“咱们”为生成侧指代含混，不能证明已替换参与者。两份实际请求/5条来源的保存→投影→生成→发送一致，无新程序遗漏，不改代码或堆提示。证据见conditions-20261113/live-20261113/source-identity-*；模型0、累计254余额0，未部署或写正式剧情，专项已收口。

- 2026-11-13 B条件对照已实测：用户新增2次授权后253/254原样发送，两份均完整返回，无重试；累计254余额0。pending保留单独核对前提、未泄露，但无依据增加“托付信件的来客”身份，“咱们”仍有主体歧义，不能完整判通过；confirmed承接明确确认来源后披露可成立，并非必须披露才通过。本轮无新程序改动，完整证据在conditions-20261113/live-20261113；22份正式文件哈希未变，不自动授予接收者知情，未部署或写正式剧情。下列252/未发送记录为历史。

- 2026-11-13 B条件本地收口：发现真实B1/B2隐藏来源未进入聊天历史，context只带sourceQuote/楼层号而漏掉原文主体语境；story-knowledge.mjs现仅在sources.sourceAnchor补text，原read来源校验/MVU/指令不变。新增2项先失败后通过，本模块21项+普通入口2项共23项通过。conditions-20261113候选相对前版仅1模块变化；两份实际浏览器最终请求113839/114836字节已冻结、均未发送，前文是真实B2，区别为原来客确认未发生/已发生。累计252余额0，本轮密钥读取和模型0；不借持续授权外发。输入缺口已修，不等于模型条件理解已通过；详见统一计划顶部，未部署或写正式剧情。

- 2026-11-13 连续场景模型续测完成：用户明确新增4次叙事并允许现有密钥/当前端点完整剧情传输，249–252均HTTP200完整返回，分类沿本地NO_CHECK、无重试，累计252剩0。A两轮保持旧交未披露，普通安排向黄泉传达；B未泄露并回到送信事务，但“换地点后细说”未保留原“单独确认后”条件，不能判约定理解完整通过。原sourceQuote和confirmed已在实际请求中，不是已证实程序漏接。次轮逐字承接各自首轮真实回复，22份正式文件哈希未变；无产品修改、部署或正式剧情写入。完整证据见communication-20261113/continuations/live-20261113；下列248/本地阶段限额为历史记录。

- 2026-11-13 本地续行收口：新版知情/披露候选已在原18123隔离酒馆经真实普通入口截获5组分类/叙事请求，上游均截停，模型0。3条非空测试记忆保留来源与知情说明，实际转告重开仍逐人有效；无明确新程序遗漏，未改产品模块。两条连续场景首轮完整请求与真实05/08前文已准备，后续须等实际回复再组装。累计248、剩0；本轮续行明确不授权正式密钥读取或外发，后续需按当前范围另确认，不沿用历史授权绕过。候选30模块差异与16份恢复原件见communication-20261113，详细证据/限制见统一计划顶部。

- 2026-11-13 医馆旧交知情与披露选择候选：`work/rules_engine/gm_runtime/story-knowledge.mjs` 复用同级引擎grantKnowledge/projectKnowledge、原MVU与普通剧情入口；`clinic-knowledge-catalog.mjs`保存本案例来源投影。已知消息投影逐条取得来源及显式原文披露约定，由现有人物/处境决定说不说，private不自动要求保密；不从正文自动授予知识。新增4项先失败后通过，相关135项离线通过，133模块候选未安装。新版4份实际模型回复已完整保存：知情直接问可答、未知不确认、有约定未泄露，但主动隐瞒动机与一般稳定性仍未证明。累计248、本次8次额度已用完。最新断点见统一计划。

- 2026-11-13 持续传输授权：用户针对读取 `D:/github/sillyTavern/data/default-user/secrets.json` 中启用密钥，并向当前端点 `https://cdn.sta1n.cn/v1/chat/completions` 发送完整私有剧情请求的明确确认问题，回复“永远授权”。本项目后续同类任务不重复询问这两项操作；密钥只用于认证、不展示或写入证据。调用数量继续按用户给定额度执行，改变端点、部署或写正式剧情不由本授权推定。

- 2026-11-07 法术宿主桥仅扩展combat/runtime.mjs的合法方案只读预览：法术名/版本/目标/区域及意志/材料费用，公开context过滤不可见目标。外部GM宿主复用原kitResource mechanism执行与MVU，不改法术数值、取得或批准。验收/边界见同级901-trpg-engine原2026-10-26计划与TODO；模型和部署暂停，真实剧情资源不写。

- 雷鸣适配规则唯一维护源：`901-resource-authoring-kit/resources/execution/ed26ad5543a3.rule.json`（工作区相对路径），由现有 `tools/compile_resources.py` 编译。战役 `combat/thunder-technique.mjs` 与独立原生候选只消费编译条款；不要恢复两端数值表。规则来源、当前取得和批准分别核对。

Maintain the campaign's canonical records and support explicitly requested worldbuilding, character development, and plot design. Keep inherited facts, creative proposals, and events actually played distinguishable. Installing a skill or changing models grants no additional authority.

## 架构位置与复用边界

- 工作区总导航见 [上级 AGENTS.md](../AGENTS.md)。本库负责战役资料、世界／人物／剧情、六书和既有酒馆 JS／MVU 链路；资源正文与执行契约编写在同级 `901-resource-authoring-kit/`，独立 SQLite 引擎与新 GM Host 在同级 `901-trpg-engine/`。同级库缺失时不影响本库资料阅读，也不凭空重建其功能。
- 世界内容从 `world/`、`work/replay_research/` 进入；六书生成器在 `work/replay_research/six_books_20261023/`，交付在 `output/replay_tavern/`。规则运行从 `work/rules_engine/` 进入，已有 `combat/`、`gm_runtime/`、`mvu_poc/`；构筑、资源适配、NPC 预览分别在 `work/character_builder/`、`work/resource_adapter/`、`work/npc_draft_pipeline/`。
- 开发前先搜索已有实现、调用方和相关测试，说明实际缺口。既有酒馆 JS 已有战斗转场／反应、伤害／电击／麻痹、冷却／支付、狂风循环、MVU 幂等／读回及按来源条款替换贡献；新 Host 未接通不代表这些机制需要重写。
- 2026-11-07 的整合方向是复用现有执行链，补新 Host 的可信后端绑定、命令／待选／回执映射和持久来源核验。旧分支以 MVU 为唯一机械写入方，不建立第二份可写原生人物存档；只抽离版本绑定的技能条款，不整体替换人物为后期模板。
- 四技共享条款入口沿用 `work/rules_engine/combat/thunder-technique.mjs`（雷鸣/斩岩/居合/狂岚）；可信采用只绑定已持有动作的版本与资格/武器/池，旧 `engine.mjs` 仍是唯一执行链。居合修行用training、首击用technique，只恶化L；狂岚模式标记决定减防路径，不靠数值猜模式。当前是本地合成验收，正式存档未启用；其他缺项继续沿原纠偏TODO，不复制执行器。
- 本库内容／资源工作沿用 `docs/unified-development-plan.md`；独立 GM 对接沿用引擎库原计划和最新记录。来源收录、作者采用、人物取得、引擎支持和实际部署分别核对；新增／移动模块时更新架构入口，不另建重复开发队列。

1. Task scope and direct collaboration
- Follow the current request and previously confirmed decisions. Do not reopen settled questions or require repeated approval within an already authorized scope.
- For extraction, organization, or factual review, preserve the evidence and its gaps. Never invent missing lore, motives, relationships, powers, history, or explanations.
- An explicit creative request authorizes new proposals within that scope. Lack of an original-campaign source does not invalidate an authorized proposal. DRAFT alone grants no creative permission.
- Keep decisions about tone, personality, narrative direction, and player choices in direct conversation with the user. Ask about a material unresolved choice; do not interrupt for every reversible detail.
- When asked to deliver a draft or implement an agreed change, proceed with the known requirements. Do not add mandatory brainstorming, planning documents, or another approval round.
- Develop material needed for the active task. Leave unused background and endgame antagonists unexpanded unless requested.
- Preserve the player's control of 御临风. Resolve already authorized actions within the user's delegated limits; do not add player dialogue, thoughts, goals, or decisions.
2. Agent roles, sessions, and model preferences
Roles describe work, not mandatory extra sessions or installed agents. Keep authorial discussion with the user in the active main session.
Role	Preferred model	Responsibility
Workshop — single-session mode	Sol High	Related worldbuilding, existing NPC development, and local plot work in one conversation.
World — split-session mode	Sol High	Social operation, regions, factions, and institutions; primarily 901-world-systems.
Story — split-session mode	Sol High; user-selected Astra for major design	Existing important characters and behind-the-scenes plots; primarily 901-story-factory.
Researcher	Sol Medium	Bounded, read-only evidence retrieval and relevant file discovery.
Canon Reviewer	Sol High	Bounded, read-only assessment using 901-canon-review when section 3 calls for it.
Maintenance	Sol Medium	Bounded organization, formatting, scripts, and file maintenance within assigned paths.


Sessions and context
- Use one Workshop for a connected workstream. When World and Story become recurring workstreams with substantial distinct discussion, use two interactive sessions. Honor the user's selected arrangement; do not repeatedly redesign it or open sessions without their direction.
- One Workshop and a World/Story pair are alternative arrangements. Do not add a coordinator, standing review session, GM session, or a separate session for every skill, model, character, or task.
- World and Story are areas of focus. Either main session may use another relevant skill within the authorized scope when that avoids an unnecessary handoff. Keep tightly coupled work together.
- Changing model does not require changing session. Major design remains directly interactive in the active session; a separate Astra session requires the user's choice.
- Independent sessions use saved project material for handoffs. Do not assume access to another session's unsaved decisions or the ability to command it. Separate sessions do not automatically synchronize conversation context.
- At a meaningful handoff, update existing task or candidate material with the relevant decisions, unresolved questions, branch/period, and source or approval references. Preserve a rejected direction only when needed to prevent reopening it. Reference the material; do not copy complete transcripts, duplicate databases, or create a coordination registry.
- Read only the other workstream's material needed for the current task. Reopen changed relevant material before relying on it. Keep detailed search logs and unrelated design exploration out of the other main session.
- Assign each actively edited file to one writer in the current task instructions. Avoid simultaneous writes to shared Canon or exports; use the existing authorized integration procedure. Do not introduce locks, new worktrees, or synchronization systems for ordinary sequential work.
Models and bounded delegation
- Model names above are project preferences. Actual availability, model IDs, and effort settings come from the environment. Do not claim a model switch or another agent's work without an actual tool result.
- Use the selected model. Recommend an upgrade only for a specific difficulty; do not automatically repeat work with a more expensive model.
- Standing delegation is limited to useful, bounded, read-only research and targeted Canon review within the active authorized task. It permits delegation without asking again each time; it does not authorize new creative scope or routine review of every draft.
- Use Researcher when substantial source retrieval would clutter the main discussion. Read a few known passages directly. Use Canon Reviewer only for a requested review, disputed evidence, concrete continuity conflict, or consequential adoption/change needing assessment. Research does not automatically trigger review.
- Delegate a specific question, relevant source references or search scope, active branch/period, allowed tools and output paths, and a completion condition. Return concise findings with precise references; keep raw exploration output in the child thread. The parent uses the result rather than repeating the whole search.
- Keep personality, tone, narrative direction, and consequential choices in direct user conversation. A subagent returns unresolved choices to its parent. Relay the user's correction accurately and cancel or redirect obsolete work instead of continuing an abandoned brief.
- Review and research agents report findings without editing files. Maintenance may write only within an explicitly assigned task and paths. Start one child for a bounded job; add parallel children only for genuinely independent work. Children do not spawn further agents or initiate review chains.
- Use actual available agent tools and supported model settings. If delegation is unavailable, perform the bounded task directly when feasible. Do not fabricate a delegation result or silently substitute a more expensive model.

### 主窗口内置浏览器与 Terra

- 用户指定此模式时，主代理在当前聊天打开或沿用内置浏览器标签，确认地址和目标实例，再让 Terra 子代理参与浏览。调用工具支持的 Terra 模型标识，例如 `gpt-6.1-terra`。
- 主代理把当前标签的可见页面、控件和状态发给 Terra。Terra 根据这些观察提出具体的下一步并解读结果。主代理使用 `mcp__cua_repl` 在同一标签执行该动作，取得新页面状态后回传给 Terra，直至完成。
- Terra 通过主代理取得实时观察和执行浏览动作，无需在子代理会话绑定主窗口标签，也不另开浏览器。若浏览动作失败，回传实际页面或工具结果，由 Terra 据此调整。
- 浏览、提交表单、写入存档和外部模型调用沿用当前任务分别授予的范围。酒馆隔离验收先核对实例地址和分支。交付时说明 Terra 的判断、主代理执行的动作，以及实际页面证据。

### 模型实测与传输工作流

适用于本项目获授权的隔离模型实测。2026-11-20 的601–608因Python证书校验失败而无正文；609–616沿前次Node路径全部取得完整回复。后续同类批次按以下流程复用，不重造发送方式或扩大验收范围。

1. **准备与授权。** 沿当前任务和已有记录确认端点、请求模型、完整外发内容、最多尝试次数、失败计数口径及是否允许重试。既有同范围传输/凭证授权继续有效，不重复索取；调用次数单独按最新授权和账本核对，不能因换窗口重置。冻结完整请求、参数、顺序和判据，并记录各件字节数、SHA-256及相对基线的精确差异。先完成可审核的本地准备，再处理尚缺的授权。
2. **复用成功传输。** 对当前同端点正文批次，沿已成功的Windows主机 Node `https.request` 路径，`agent:false`，证书校验保持开启，冻结请求的原始Buffer直接作为POST正文。先定位下方记录中的实际成功执行方式，不为书写方便改用Python或另一套客户端。更换运行环境或客户端须有具体理由，并先验证其连接条件；不能拿整批生成额度测试传输。沙箱DNS失败只说明该环境不可达，不能直接断言正式服务或模型失效；主机执行沿工具权限及已有授权，不绕过审批。密钥仅用于认证，不显示或写入证据。
3. **逐槽发送与立即停止。** 每次尝试前保存对应请求并更新账本，核对冻结哈希；按排程逐槽执行，不自动重试、补槽或换模型。首个DNS、TLS、无法取得HTTP响应等共同连接错误，或认证/限流等共同拒绝，立即停止后续槽并报告，保留未尝试槽；“最多N次”不是必须用尽。只有语义问题而传输正常时，是否继续沿本批冻结方案，不能临时改题或挑选成功样本。
4. **诊断与计数。** 分开记录调用尝试、HTTP响应、完整正文、失败、重试、未尝试槽及额度；按本批约定计入失败，未尝试不算消耗。共同连接故障可先在同一网络环境做不带密钥/剧情、不发送HTTP的TLS握手对照，诊断另记，不当作正文调用或旧失败的原始详情；已有有效证据时不逐批重复探测。不得用关闭证书校验解决连接问题。记录错误阶段及原始code/message，证书错误包括可取得的verify_code/verify_message；过滤凭证，不只保存异常类名。额度用完后不自行补发；新授权批次关联旧账并另存，保留旧失败。
5. **原文与技术核对。** 保存各次实际请求字节、原始响应字节、提取正文、时间、HTTP状态、返回模型、结束标识及哈希。无HTTP响应就明确记无响应，不制造空白正文或成功样本；外层命令退出码0不代表模型成功。核对实际请求等于冻结件、正文等于响应中的原文，保留失败和重试记录。正文评阅前先确认技术结果，不能把连接失败写成模型拒答或叙事失败。
6. **评阅与交付。** 沿冻结判据及用户校准逐条引用原文；无正文不填叙事F/N/U/X，待核不算通过。不从单个词机械判错，不把普通、无冲突的补全都判为知情越界。按用户安排由总控审核，保留执行方/审核方各自初判和分歧，最终结论另记；不因本流程自动创建评审代理。明确人工接收、固定分类、独立正文、保存重开和连续试玩各自实际完成的范围；相同输入的随机输出差异不归因于重开，单格样本不宣称因果改善。结果回写原统一计划；测试授权不自动扩展到代码修改、部署或正式剧情。

复用入口：[成功批次的发送与原文记录](work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/formal-parity-20261117/runtime-topic-feasibility-20261120/question-wording-node-live-20261120/RUN.md)、[成功账本](work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/formal-parity-20261117/runtime-topic-feasibility-20261120/question-wording-node-live-20261120/run.json)（`previousSuccessfulExecution`定位原发送命令）、[TLS失败与独立诊断审核](work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/formal-parity-20261117/runtime-topic-feasibility-20261120/question-wording-live-20261120/ASSESSMENT.md)。具体当前状态沿[统一计划](docs/unified-development-plan.md)，不把这两批的历史额度当作可用额度。

3. Skills and context
- Before the first 901-* use in a session, read the relevant parts of docs/901_skills_integration.md if they are not already in context. It identifies real project paths, branch entry points, and approved integration boundaries.
- Reuse unchanged instructions already available. Reread only what changed, was lost from context, or is needed to resolve a concrete question. Read task-relevant files rather than the whole repository.
- 901-world-systems: social operation, regional development, and explicitly requested stress tests, within the authorized scope.
- 901-story-factory: explicit invocation only; existing important-character development and behind-the-scenes plot planning. Continue authorized follow-up work without demanding reinvocation each turn. New-character production and mechanical builds remain outside its remit.
- Explicitly authorized resource creation, character-build gaps, and growth proposals use the existing [Character Builder authoring guide](work/character_builder/README.md#资源撰写模式) in the current creative session. The Builder program is not a separate installed Skill or Agent; read this guidance only for the relevant creation task, not on every GM turn.
- 901-canon-review: invoke for a requested review, disputed source claim, concrete continuity conflict, or a consequential adoption/change requiring targeted assessment. It is not a mandatory stage after ordinary drafting.
- This file defines project-wide workflow and validation defaults. Generic skill workflows do not add mandatory reviews, tests, or planning stages. Preserve task-relevant output contracts and the integration document's data, authorization, and export boundaries.
4. Canon discipline and provenance
- Never promote inference, suspicion, rumor, lies, mistaken belief, or internal monologue into world fact. Preserve confirmed, uncertain, rumor, and character_belief as applicable.
- Every formal worldbook entry needs precise provenance. Inherited claims cite authoritative source locations; adopted original claims cite the approved proposal or decision record. Mixed entries distinguish their sources. Never fabricate campaign citations.
- Setting references guide world/faction/concept facts; character references guide identity and background; campaign records establish events. Apply the branch-specific state authority below.
- A later update to a setting or character reference does not make its contents true at every earlier date. Preserve relevant period and character knowledge.
- Document source conflicts rather than silently resolving them for narrative convenience. Missing evidence remains a gap; continue unaffected work.
- Workflow states such as DRAFT and PASS supplement, never replace, factual certainty, provenance, period, branch, and knowledge boundaries. Approval of a future plan does not establish that it happened.
- Creative content remains provisional until adopted through the existing approval process. Honor recorded approvals, including scoped batch approvals; do not ask again. Store durable adoption decisions in existing records, without creating approval paperwork for every draft detail.
5. Timeline state and Canon layers
- current_state.md governs the original continuation D3 anchor. It is not the current-state authority for replay T0 or the replay branch. Do not overwrite it or mechanically split it into worldbook entries.
- Replay T0 and actual replay events use their own approved records and the real entry points in docs/901_skills_integration.md. For ongoing replay work, use the existing yulinfeng-tavern-plan worktree; do not invent paths or create a replacement workspace.
- Use the active branch's state record for its present anchor and campaign records for historical facts. Do not merge D3 state into replay or treat original post-cut events as inevitable replay events.
- Facts explicitly recorded in the original campaign belong to Original Campaign Canon, retaining their actual certainty and perspective.
- Transition Canon contains only the minimum agreed bridge around the destruction of the dragon sanctuary. Do not expand it by inference or creative convenience.
- Continuation Canon covers new play after the third day following that destruction in the original continuation. Replay records retain their separate branch identity; preserve existing schemas and labels.
- The unfinished special dream is Original Campaign / Special Interlude material. Its modern supernatural setting is not ordinary present-day main-world lore. Inherited dream rewards, knowledge, and cosmological implications enter main-world Canon only where campaign records explicitly carry them back.
6. Worldbook entry scope
- Use only world, faction, location, character, concept, and event. One entry covers one core topic.
- Character worldbook entries contain identity, durable relationships, important history, and world position. Keep full roleplay prompts and skill lists in their designated character materials.
- Historical event entries state what happened, the result, and the continuing effect. Do not add literary interpretation or create entries per post, skill, or minor action beat.
- Trigger keys contain formal names, common short names, and confirmed aliases. Avoid generic high-frequency words.
- Surface encountered duplicates, alias/name conflicts, uncertain types, and granularity problems where they affect the current task. Do not silently merge them or launch an unrelated repository-wide audit.
7. Proportionate review, validation, and tests
Match checks to the changed behavior and actual stakes. A normal drafting pass includes attention to supplied constraints; it does not require a separate review job.
Work performed	Default check
Discussion or creative draft	Check the requested scope and known relevant constraints while composing. No independent review, scripts, or formal test report.
Wording-only change to Markdown, AGENTS.md, or a skill	Read the changed passage for consistency with affected instructions. No code tests or model-test campaign.
Machine-readable template or output-contract change	Parse the affected format and check the changed fields against their stated contract. Use one representative example where the consumer's behavior changed.
Program or validator change	Check the changed behavior with relevant existing tests after the final edit. For a bug, reproduce the actual failure and add a focused regression when practical.
Authorized Canon adoption or export	Check affected claims, sources/approval, branch, and output compatibility; inspect the proposed diff before applying it.
Explicit review or test request	Perform the requested scope once. Report concrete findings and fix authorized, relevant issues.


- No speculative hardening, malformed-input campaigns, fuzzing, benchmark matrices, coverage targets, or new test infrastructure unless requested or justified by a specific operational problem. Reproducibility of an artificially damaged input alone does not make it a project priority.
- Known, immediate risks of data loss, wrong-branch writes, or unauthorized publication justify a narrow check before the operation; an actual incident is not required.
- Preserve useful existing tests. Run a broader suite when shared behavior changed or the user requests it; use an existing fast relevant suite when it is the simplest check. Prose-only changes do not trigger it.
- A review finding identifies the affected material, the concrete defect, and its practical consequence. Separate defects from optional preferences. Do not create blockers from hypothetical future requirements.
- After a fix, recheck the failing behavior and affected dependencies. Do not restart a full review merely because a fix occurred or another model is available.
- User approval and model review are separate. Formal adoption requires existing authorization; it does not automatically require another model's approval.
8. Data changes, phases, and exports
- Candidate extraction identifies possible entries; it does not generate formal canonical prose during the candidate stage.
- Extraction scripts must never directly overwrite human-reviewed candidates or formal reviewed entries. Validators report findings and never rewrite source data. Apply authorized formal changes through the existing reviewed patch/integration procedure.
- Do not generate output/worldbook_source.jsonl until the candidate list is reviewed and phase two is explicitly authorized. Honor existing records showing these conditions were satisfied; neither assume completion nor demand renewed approval.
- Preserve current export formats, UIDs, loading rules, manual SillyTavern application, and deferred/cancelled task boundaries. An authorized draft does not authorize exporter changes, publication, or merging worktrees.
- References to tavern-cards, UI, MVU/EJS, or Character Builder are handoff suggestions, not permission to implement or run them. Reuse existing files and structures rather than introducing new registries or orchestration layers.
9. Delivery and stopping
Deliver the requested artifact or answer. For file changes, briefly state what changed, relevant checks actually run, and any concrete unresolved limitation. Never describe static parsing as a successful model behavior test.
Stop when the requested result is complete and no concrete task-blocking issue remains. Record unrelated observations briefly without fixing them or starting another review. Do not expand the task to justify additional work.
