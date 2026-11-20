"""Update the existing delivery and checkpoint, preserving earlier local-only records."""
from pathlib import Path
import json, shutil
E=Path(__file__).resolve().parent
I=E/'iteration-200-20261115'
R=next(p for p in E.parents if p.name=='TRPG outputs')
for name in ['DELIVERY.txt','CANDIDATE.txt','final-verification.json']:
    backup=I/'before'/name
    if not backup.exists(): shutil.copy2(E/name,backup)

candidate='''901 普通对白知情入口集成候选 / 2026-11-15
仅供审查，未部署。135个浏览器模块、3项原资产和candidate-entry.js。
十二阶段本地候选与两条有限真实模型链已完成，267项相关离线回归通过。不是通用模型准确率或正式游玩稳定性证明。
默认语义完成函数disabled；未显式配置不会新增接收抽取/依赖请求。
明确启用原宿主：window.top.__901StoryKnowledge.configureDialogueHost({enabled:true,useExistingHost:true});
或传入{enabled:true,complete}，complete接收purpose/messages/responseFormat，返回原始回复。
关闭使用{enabled:false}。可由宿主在初始化前提供window.top.__901DialogueHost同形配置；产品不保存该配置、不发现凭据、不改模型或采样设置。
普通请求：必要时依赖判断→确认→原分类→正文→保存/读回→接收抽取→原严格校验/MVU→下一轮知情投影。
通常每条完成正文增加1次接收抽取；有待核的后续轮另加1次依赖判断。原分类与叙事调用继续存在。
不存在自动批准世界事实、关系或约定；没有回复修补/坐标修正/action转换/自动重试。
此次任务修改story-dialogue-knowledge、replay-gate-script、narrative-style-projection、story-knowledge及共享assertion-contract；入口生成器不在运行闭包内。
相对正式安装32项模块差异包含此前其他工作；相对上一133模块候选5项差异也包含继承的MVU适配，详见candidate-delta.json/deployment-diff.json，不把整包视为本次成果。
200次总额度已用23次（335—357，含先前335/336），余177未使用。真实浏览器采用原样请求外发、原始响应精确回放；分类为本地NO_CHECK控制，不计模型验收。
已知模型仍可能错坐标、漏抽或错认隐含听者引用。348/349语义失败由验收人工拦下，产品没有新增自动语义审查器。
详见DELIVERY.txt和iteration-200-20261115/final-verification.json。无部署脚本；无测试按钮、合成记忆、seed、capture后端、密钥或完整剧情随包。
'''
(E/'CANDIDATE.txt').write_text(candidate,encoding='utf8')

delivery='''普通对白知情入口集成：十二阶段交付（2026-11-15，最终357断点）

结论与范围
十二阶段已完成“普通对白知情增量进入真实普通入口的完整本地候选”，并在实际隔离酒馆完成A、B两条有限真实模型链。未安装到正式酒馆、未写正式剧情、未恢复全文自动批准或修订，也未提交推送。实际默认仍disabled。
最终267/267项相关离线回归通过；本任务总计23/200次模型请求（含此前335/336），余177未使用，历史累计357。原12次批次已关闭，不重新消费其余额；本次停止是任务既定有限链和交付完成，不是所有模型问题消失。最终验证见iteration-200-20261115/final-verification.json；旧187项合成交付及335/336失败原档保留。

十二阶段与证据
1 基线：baseline.json、before/、iteration-200-20261115/before/保存起点、原失败、22正式保护文件；原始任务见task-authorization.txt，后续200次授权见新run.json。
2 调用图：复用createDialogueSemanticAdapter、createStoryKnowledgeRuntime、registerReplayGate、原MVU及只读记忆，没有另造执行器、HTTP产品客户端或人物存档。
3 显式宿主绑定：configureDialogueHost可用明确complete或原generateRaw。默认disabled；冻结消息/Schema，仅当前语义请求清空merge_tools后处理；参数和普通文风入口保留。
4 保存与恢复：正文保存读回后observeDialogue；prepared恢复、processed幂等；错误保留正文与unprocessed，不重复机械结算。原合成浏览器与相关离线测试覆盖恢复；A真实重开状态完全一致。
5 待核交互：实际B界面从真实345待核选择布莱特，resolve后继续同一玩家请求；最终聊天中该请求仅一次。暂不确定/未收到沿之前合成UI和原控制器回归，不冒称两分支另有新模型验证。
6 下一轮投影：A新消息进入分类/叙事；B显式确认进入sources.receptionConfirmation，原听者不明正文仍保留，belief仍uncertain。确认只解决谁收到，不改变消息真伪或强制披露。
7 两条实际浏览器链：A340—343（4次）；B344/345/351—354/356/357（8次）。每份外发完整请求与浏览器捕获一致、原始响应精确回放；分类本地NO_CHECK，不称真实分类通过。详见A-verification.json、B-verification.json与截图。
8 来源和分支：复用当前来源/回复版本/聊天身份/分支继承校验，相关回归覆盖过期结果拒绝与分支独立。本次补普通重生成快照、prepared恢复与残留未处理标记清理；未扩建并发压力平台。
9 回归与候选：最终267项通过，135模块+3原资产+入口及清单，ZIP共141项。复用六书打包器，闭包/源哈希/隔离加载版本/恢复原件均核验。默认disabled，实验服务和非Canon材料不入包。
10 真实批次：原12次方案是A4+B8。335/336首次失败后关闭；用户另授权总200次持续诊断。诊断和必要更正共23次：8叙事、12接收、3依赖。不是23个独立成功样本。完整账本、参数、HTTP原文、返回模型和用量留存。
11 剧情体验：阅读实际连贯正文。A人物按既有能力回应并提出建议，未替玩家采纳；B歧义不擅自补全、天气闲聊不打断、必要确认后自然回答原问题。正文没有被改写为审核说明，知情与披露自主选择分开。具体限制见下。
12 交付：本说明、接口文档、统一计划当前断点、候选ZIP、差异与恢复依据、完整请求/响应/截图/状态都已更新。隔离浏览器已关闭、隔离服务已停止，没有后台新调用。

本次改善与复用
普通入口：玩家楼层→有pending才dependencies→相关时原确认界面/resolve→原分类→generateKnown叙事→保存及读回→接收抽取→严格v2结构/引用/上下文校验→原receive/saveBatch→MVU→下一轮context。只读数据库记忆继续使用，不自动写记忆表事实、不扫描旧全文。
共享抽取合同仅为接收目的收窄任务范围，并给出确定性target/逐行/通用标点区间，保持0起点、左闭右开UTF-16。默认全文合同保持，原分块/字符参照保留。没有输出坐标纠正或自动补引用。
v2复用旧合同中null表示“新的有来源说法”的定义，明确facts不是抽取范围；实际消息内容引用应是连续言说，叙述间断则分片。当前应答可由历史消歧听者，但历史不冒充当前引用。没有逐称谓关键词表。
已存在的接收确认row.decision此前没有随来源投影，现按保留批次、接收者和原grant.eventRef匹配投影receptionConfirmation；不新写状态、不修改原文。仅出现确认时解释其已解决原接收歧义，消息真伪和人物自主选择保持。
原STORY_COMMUNICATION_INSTRUCTION、人物baseline及文风资产保持不变。只有有证据的接线或合同遗漏被修复；不因模型一句话不理想而扩大自动审查。

真实结果及不能证明的内容
A的告示测试起点与既有“不识字”设定冲突，模型依人物设定回复不识字并建议找路人。验收的是实际收到这两条话、保存重开和下一轮承接；告示本身的取水消息未传达，不记为通过。
B1真实正文说明两人中一人听清但身份未知，345生成实际pending，零授予/当轮不问。B2替代天气问答指定黄泉对布莱特说，351无依赖，353只登记真实NPC互答，原取货pending逐字不变。354才要求原pending；UI确认后bright获得原说法、player仍无；356自然转述后357才让player取得同一命题，均uncertain。
336/337/339：引用坐标错误严格拒绝。338：结构通过却误把facts当范围漏抽。348：内容夹入旁白。349/350：隐含听者引用错指说话者或语气。保留7份失败；不能宣称引用语义自动可靠。348/349由验收人工不放行，实际产品校验并不能自动识别这些语义错绑；未新增自动审查。
355在确认后仍说没听清，可能是未承接也可能是人物回避，记未覆盖，不以必须披露判失败。程序确实漏投影接收决定，但不能据一次回复断言其因果。356仅更新这处投影及解释（20条消息中第19索引变更，其余参数/消息相同），得到正确承接；仍是有限观察。
B2替代输入绕开了原隐含交谈对象歧义，不能把351—353当348—350相同输入已修复。A/B是连续且受控的非Canon场景，不是泛化准确率、完整分类、长篇、多人物规模或正式长期稳定性的证明。7失败、1未覆盖、15有限通过分属不同目的与版本，不计算成功率。
本轮正文108317—113380字节、接收96865—106308字节、依赖3317—3401字节（每次精确值见账本），包含实际宿主展开Schema和剧情；这些具体请求HTTP200不代表任意长度可接受。模型返回gemini-3.8-flash-n，请求模型仍[抗截断]gemini-3.8-flash，temperature1/top_p1/max_tokens4096/streamfalse等原参数保持。生成长文本或坐标参照仍有成本。

使用、差异及恢复
默认不启用；配置代码见CANDIDATE.txt及story-dialogue-knowledge.md。每条保留正文通常多1次接收抽取；存在pending时后续请求多1次依赖判断，原分类/正文另计。未绑定能力返回disabled/unavailable，不伪装无变化。
本任务产品源为story-dialogue-knowledge、replay-gate-script、narrative-style-projection、story-knowledge和共享assertion-contract。相对正式安装32个模块差异包括其他工作线；相对上一133模块候选5项，其中MVU适配是继承变化。candidate-delta.json/deployment-diff.json逐项说明，生成入口另列。
恢复复用../../communication-20261113/recovery/manifest.json和../../installed-entry.js，16份原件及22正式保护文件核验。未执行部署、恢复或删除。将来明确授权安装时仍须保存当时角色卡/入口、复核目标哈希；新增文件只能依实际部署记录和匹配哈希处理。
dialogue-integration-candidate.zip仅有运行闭包、原资产、入口和使用清单；完整私有剧情证据留在验收目录，未随包。

阅读证据
iteration-200-20261115/run.json：预算、请求版本、每次判定；complete-outputs.txt：23次模型内容全文及逐次判断；各*.request.json、*.raw-response.txt是完整原件。
iteration-200-20261115/A-verification.json、B-verification.json：真实状态/请求核对；B-final.chat.jsonl及B-final-confirmed-and-resumed.jpg为最终B保存与界面；A1-reopened.chat.jsonl、A2-complete.jpg为A重开/承接。
iteration-200-20261115/final-regression-current.log：最终267/267；final-verification.json：当前源/包/正式保护文件/原始证据核验。早期187项本地结果和本轮中间版本不冒充最终版本。
'''
(E/'DELIVERY.txt').write_text(delivery,encoding='utf8')

doc=R/'work/rules_engine/gm_runtime/story-dialogue-knowledge.md'
s=doc.read_text(encoding='utf8')
start=s.index('最新真实验收（本地交付之后）')
end=s.index('\n\n当前本地候选新增',start)
s=s[:start]+'''最新真实验收：十二阶段本地候选与A/B有限真实链完成，最终267项相关回归通过，总计23/200次请求（335—357，含此前2次），余177未使用。完整证据和限制见`integration-20261115/DELIVERY.txt`及`iteration-200-20261115/final-verification.json`。A340—343完成实际言说接收、保存重开和承接；B344/345/351—354/356/357从真实听者歧义到无关不问、相关确认、同一请求续行。分类仍本地NO_CHECK。含旧336共7份失败/1份未覆盖保留，不称所有模型问题已解决；正式安装未改。'''+s[end:]
start=s.index('现有酒馆服务会通过flattenSchema')
end=s.index('\n\n本轮详细证据',start)
s=s[:start]+'''现有酒馆服务通过flattenSchema展开$defs；本次实际请求与浏览器捕获逐项一致，原约束未放宽，回包仍由原严格检查消费。本轮正文108317—113380字节、接收96865—106308字节、依赖3317—3401字节的具体请求已获HTTP200；不保证任意长度或长期稳定。每份实际字节、返回模型、用量与完整原始响应在账本中，验收原样回放不另计上游调用。

接收目的调用共享`buildAssertionMessages(input,{purpose:'reception'})`：仅聚焦信息传递及必要命题，原全文默认合同不变；确定性坐标参照增加可复制的目标、逐行与通用标点片段，不自动修坐标。v2复用新来源说法定义，`facts`是可引用目录而非抽取范围。言说内容引用直接成为消息，不能混入间隔旁白；当前应答允许结合历史消歧，但仍须提供当前原文依据。隐含听者引用仍有真实失败，不能据结构通过判语义完整。

`context().actorKnowledge[].facts[].sources[]`可附`receptionConfirmation:{rowId,received,recipientIds,speakerId,quote}`：只来自当前保留且processed的批次中已registered/received的原decision，匹配接收者及授予eventRef。它投影已有确认，不产生新确认或写存档。出现该字段时叙事补充“原接收歧义已解决”的说明，保留旧正文、消息belief与披露自主权；无该字段时不增加说明。

最终135模块与3原资产、生成入口已同步打包，默认disabled。真实链采用受控非Canon场景；A只验收实际“不识字/问路人”消息，B替代闲聊明确指定交谈对象，不把它称原隐含听者失败已修复。348/349是验收人工截停，并非新增自动语义审查。原通用文风合同未改，未部署或写正式剧情。'''+s[end:]
s=s.replace('当前既未外发，也没有承诺与原填表合并或零额外调用。','当前已在隔离验收外发，未在正式游玩启用；不承诺与原填表合并或零额外调用。')
doc.write_text(s,encoding='utf8')

plan=R/'docs/unified-development-plan.md'
s=plan.read_text(encoding='utf8')
a=s.index('<!-- dialogue-integration-current -->');b=s.index('<!-- /dialogue-integration-current -->',a)+len('<!-- /dialogue-integration-current -->')
checkpoint='''<!-- dialogue-integration-current -->
## 2026-11-15 普通对白知情入口：十二阶段本地候选及有限真实链完成
总200次授权已用23次（335—357，含此前335/336），余177未使用，历史累计357；账本在integration-20261115/iteration-200-20261115/run.json。任务终点是完整候选和有限真实链交付，不是泛化模型问题全部解决。不部署、不写正式剧情、不恢复自动批准/修订、不修补回复或放宽校验；隔离浏览器与服务已关闭。
阶段1—8完成原链路本地接线与边界：显式宿主绑定默认disabled、原MVU/只读记忆、正文先保存、prepared恢复、processed幂等、原待核UI resolve续行、逐人投影、重生成/分支来源。原187项与20份合成浏览器证据保留；新增真实A/B见各自verification与截图，不把合成分类称模型通过。
阶段9完成最终267/267相关回归，135模块/3原资产/入口/清单候选；阶段10完成真实外发与完整原件保存；阶段11完成A/B实际连贯正文及交互体验核对；阶段12完成DELIVERY、接口、差异/恢复、保护核验和ZIP。最终当前版本及限制以I/final-verification.json与DELIVERY.txt为准，旧历史状态不覆盖当前。
本次共享合同仅接收purpose收窄范围并增加确定性target/逐行/标点引用；补v2遗漏的新来源说法定义、实际言说片段与当前听者依据。确认row.decision现由原保留批次按actor/eventRef投影sources.receptionConfirmation，保留原文/uncertain和披露自主权。原通用文风合同与资产不变，没有新执行器或自动语义审查。
A340—343通过实际“不识字/问路人建议”接收→保存重开→下一轮承接，bright未自动赋知；测试告示前提与既有人物设定冲突，告示内容未传达。B344/345真实听者不明产生1待核/零授予；351—353明确交谈对象的无关天气闲聊不问且原待核不变；354依赖原真实ID，实际UI确认bright后356承接并转述，357才让player收到同一消息，belief仍uncertain、原请求只出现一次。
336/337/339坐标失败、338漏抽、348内容夹旁白、349/350隐含听者引用错误共7份失败保留；348/349是验收人工截停，产品并未自动识别这类语义错绑。355可能未承接也可能回避，记未覆盖而非强制披露失败。B替代天气明确指定对象，不宣称旧隐含听者问题已修好。所有23次请求/原响应哈希核对；有限通过15、失败7、未覆盖1，不计算泛化成功率。
证据根：work/replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/。335/336原件在live-model-20261115，新增及最终证据在iteration-200-20261115（I）。完整回复见I/complete-outputs.txt。下一步为用户审阅候选；无自动部署或后台消耗余额安排。
<!-- /dialogue-integration-current -->'''
plan.write_text(s[:a]+checkpoint+s[b:],encoding='utf8')
print('Updated existing delivery, interface and single current checkpoint; earlier delivery archived.')
