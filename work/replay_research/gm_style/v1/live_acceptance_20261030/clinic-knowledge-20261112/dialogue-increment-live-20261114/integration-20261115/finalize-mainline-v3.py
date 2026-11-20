from pathlib import Path
import json,hashlib,zipfile
E=Path(__file__).resolve().parent;N=E/'mainline-v3-20261115';I=E/'iteration-200-20261115'
R=next(p for p in E.parents if p.name=='TRPG outputs');W=R.parent
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
browser=read(N/'browser-verification.json');ledger=read(I/'run.json');assert ledger['used']==71 and ledger['remaining']==129 and ledger['closed']
assert 'pass 38' in (N/'ui-regression.log').read_text(encoding='utf8')
sources=['901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js','TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs','TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs']
for s in sources:assert sha(W/s)==ledger['attempts'][-1]['sourceHashes'][s]
assessment='''十二阶段主线已回接当前v3本地候选（405断点，2026-11-15）

范围与结论
本轮补齐399版本缺少的实际普通入口集成证据与候选打包，复用原十二阶段已完成且未改动的机制；没有重开全文抽取、自动批准或修订路线。正式酒馆未部署，正式剧情未写入，默认语义适配仍disabled。
当前链路：普通玩家请求→有待核才判断依赖→必要时原确认UI→原分类/叙事→先保存正文→原严格v3接收校验→MVU回执→下一轮逐人投影。contentSpan实际进入保存、待核、确认和下一轮知情，未把前半收到扩大成整句。

十二阶段核对
1 基线：mainline-v3-20261115/before及baseline.json保留380候选、账本65/200、隔离原卡/聊天/后端；22正式保护文件哈希保持。
2 调用链：沿原adapter/runtime/replay gate/MVU/只读记忆，无新执行器或正式可写副本。
3 绑定：原显式configureDialogueHost保留，默认disabled；验收卡启用仅在隔离副本。
4 保存恢复：A1实际接收已保存，A1重开MVU逐项相同，无新增抽取；错误/恢复/processed幂等沿原回归。
5 待核与续行：B1实际401输出产生真实后半句待核；403依赖它后，UI只显示“明早从南桥走。”，隔离选择布莱特收到后原玩家请求仅出现一次。
6 下一轮投影：A2只有御临风知道整句话，布莱特未知；B2布莱特仅前半，B3确认后投影两段但各自来源保留。未把来源说法提升为世界真相。
7 浏览器链：A明确接收/重开/下一轮、B部分接收/闲聊/相关追问/确认/续行均实际操作普通入口。400—405六份外发请求与UI捕获逐项一致，原始HTTP响应精确回放。
8 来源/分支：现有来源、swipe、上下文绑定与分支规则未改，复用此前相关回归；本轮未重新做全部分支浏览器矩阵。
9 回归候选：复用399版本284/284相关回归；本轮仅新增弹窗显示修复后38/38控制器回归通过。135模块+3原资产+入口/清单，ZIP141项，当前源与隔离加载闭包一致。
10 模型：本轮400—405共6次，本轮指定指标均通过；200总额度已用71，余129，历史累计405。没有重试，全部旧请求/响应与63条旧逐次账目保持，另核验此前335/336两份原件；没有把本地分类和夹具计算为模型调用。
11 体验：实际404自然回答“南桥。黄泉刚才说的是明早从南桥走。”，保留来源归属，不添加约定条件或关系，不以必须披露为标准。发现深色主题弹窗浅底浅字，仅在原chooseDialogueReceipt补显示样式；用403—405原请求/原响应再次回放，最终MVU完全一致，无新增模型调用。
12 交付：DELIVERY/CANDIDATE/统一计划当前段/接口文档/候选ZIP/差异与验证均更新。隔离浏览器关闭、服务停止，无后台调用。

证据的边界
A1/B1的起始短叙事、A2/B2的纯动作后续及其空接收是预先声明的非Canon接口夹具；原分类仍为本地NO_CHECK，记忆表为只读夹具。不是两条全程新模型叙事链，真实新叙事只有404，真实接收为400/401/405，真实依赖为402/403。此前357的完整有限叙事链证据继续保留为历史版本，不能冒充当前版本。
405对真实404抽取保留一段完整回答、布莱特说话者及御临风接收，当前“他”明确指向布莱特，未无依据授予黄泉。401前半contentSpan含原逗号，未多含后半命题。所有消息仍是来源说法，belief=uncertain；确认接收并不判定真伪、强制披露或自动采用剧情。
有限样例不能证明模型长期稳定、任意长篇或数十角色准确、全部action/mode语义正确；程序并没有通用漏抽/错认语义审查。保留旧失败，不补回执、不纠坐标、不放宽校验。其他否认接收/暂不确定分支沿原离线和历史UI证据，本轮没有另做实际模型调用。

阅读顺序
browser-verification.json：实际保存、重开、pending继承、原请求续行、模型原件与22正式文件验证。
verification.json：最终源/闭包/候选ZIP、预算及限制；ui-regression.log：38项控制器回归。
complete-outputs.txt：本轮六份模型正文全文与判断；../iteration-200-20261115/main.*保存完整外发请求及原始HTTP响应。
captures/与ui-style-captures/：原普通入口实际请求与精确回放交付记录；fixture.json明示本地内容。
A1-after/A1-reopened/A2-after/B1-after/B2-after/B3-prompted/B3-after/B3-style-after.chat.jsonl保留隔离保存。
confirmation-fixed.jpg与resumed-final.jpg：当前UI核对。恢复仍沿原communication-20261113/recovery/manifest.json，未执行正式恢复或部署。
'''
(N/'ASSESSMENT.txt').write_text(assessment,encoding='utf8')
parts=[]
for x in ledger['attempts'][-6:]:
 parts += [f"custom{x['customRequest']} {x['id']}\n{x['assessment']}\n",(I/(x['id']+'.content.txt')).read_text(encoding='utf8'),'\n\n']
(N/'complete-outputs.txt').write_text('\n'.join(parts),encoding='utf8')
(E/'DELIVERY.txt').write_text(assessment+'\n以下保留380/357历史交付；旧预算、合同、包状态以各历史断点理解。\n\n'+(N/'before/DELIVERY.txt').read_text(encoding='utf8'),encoding='utf8')
(E/'CANDIDATE.txt').write_text('''901 普通对白知情入口集成候选 / 2026-11-15 / 405断点
仅供审查，未部署。135个浏览器模块、3项原资产和candidate-entry.js，ZIP141项。
默认语义完成disabled；明确启用原宿主：window.top.__901StoryKnowledge.configureDialogueHost({enabled:true,useExistingHost:true});
也可传入{enabled:true,complete}，complete接收purpose/messages/responseFormat并返回原始回复；关闭{enabled:false}。初始化前window.top.__901DialogueHost可提供同形配置。产品不保存配置、不读取凭据、不改模型/采样设置。
默认dialogue-reception/3逐回执contentSpan绑定原言说范围；旧v2仅显式历史兼容，不按模型返回自动回退。
普通入口：必要时依赖判断→原确认→原分类→正文→保存读回→接收抽取→严格校验/MVU→下一轮知情投影。通常每条保留正文另加一次抽取，有pending的后续轮另加一次依赖判断，分类与叙事另计。
复用399断点284项回归；本轮显示修复后38项控制器回归通过。最新浏览器验证覆盖保存重开、部分接收、无关不问、依赖才问和确认后原请求续行。起始场景/纯动作/分类/记忆为明示夹具；实际新模型为400—405六次，不能冒称两条全程真实叙事。
总200次授权已用71、余129，累计405；没有后台调用安排。本轮六次指定指标通过不代表泛化准确率，历史失败全部保留。
无回复修补、坐标修正、action转换、自动重试、自动批准或修订。消息知情、真实性与披露自主选择分开。未写正式剧情，未部署。
详见DELIVERY.txt及mainline-v3-20261115/verification.json。相对正式安装差异包含既有其他工作，不能把整包当成本轮修改。部署/恢复仍需按已有授权和当时目标核验处理。
本包不含密钥、完整剧情、实验服务器、合成记忆、seed、捕获记录或测试按钮。
''',encoding='utf8')
manifest=read(E/'candidate-manifest.json');D=E/'package/901-opening-combat';app=Path(read(E/'browser-setup.json')['app'])
assert len(manifest['modules'])==135 and len(manifest['assets'])==3 and manifest['defaultSemanticCompletion']=='disabled'
for m in manifest['modules']:
 assert sha((R/m['source']).resolve())==m['source_sha256']
for m in manifest['modules']+manifest['assets']:
 assert sha(D/m['path'])==m['sha256']==sha(app/'public/901-opening-combat'/m['path'])
assert sha(E/'candidate-entry.js')==manifest['entrySha256']
old=read(N/'before/candidate-manifest.json');oldmods={m['path']:m['sha256'] for m in old['modules']}
changed=[m['path'] for m in manifest['modules'] if oldmods.get(m['path'])!=m['sha256']]
assert {m['path']:m['sha256'] for m in old['assets']}=={m['path']:m['sha256'] for m in manifest['assets']}
archive=E/'dialogue-integration-candidate.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for m in manifest['modules']+manifest['assets']:z.write(D/m['path'],'901-opening-combat/'+m['path'])
 for name in ['candidate-entry.js','candidate-manifest.json','CANDIDATE.txt']:z.write(E/name,name)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and len(z.namelist())==141
 for m in manifest['modules']+manifest['assets']:assert hashlib.sha256(z.read('901-opening-combat/'+m['path'])).hexdigest()==m['sha256']
report={'status':'twelve-stage-local-candidate-refreshed-v3','browser':browser,'regression':{'reusedScoped':284,'scopedEvidence':'../scoped-reception-20261115/verification.json','afterDisplayFix':38,'newLog':'ui-regression.log'},'budget':{'newCalls':6,'total':200,'used':71,'remaining':129,'cumulative':405},'candidate':{'modules':135,'assets':3,'entries':141,'changedFrom380':changed,'sha256':sha(archive),'bytes':archive.stat().st_size,'defaultDisabled':True,'sourceAndIsolatedClosureMatch':True},'sourceHashes':{s:sha(W/s) for s in sources},'displaySourceSha256':sha(R/'work/rules_engine/gm_runtime/replay-gate-script.example.js'),'deployed':False,'formalStoryWritten':False,'automaticApprovalOrRevision':False,'rawPreserved':True,'serviceStopped':True,'limits':browser['limits']}
put(N/'verification.json',report);put(E/'final-verification.json',report)
put(E/'browser-final-delta.json',{'currentEvidence':'mainline-v3-20261115','deltaAfterFinalBrowserReplay':[],'note':'400-405 actual calls precede display-only fix; exact403-405 replay after fix matches final MVU; historical357 delta retained in mainline before backup'})
pack=read(E/'package-verification.json');pack.update(browserExerciseDelta=[],latestUIValidation='mainline-v3-20261115/browser-verification.json; final display fix replayed with exact saved responses',packagingModelCalls=0,integrationModelCalls=71,protectedFileCheck='22 unchanged; mainline-v3-20261115/browser-verification.json');pack.pop('modelCalls',None);put(E/'package-verification.json',pack)
ledger.update(finalVerification='../mainline-v3-20261115/verification.json',currentScope='十二阶段主线回接v3；本轮6次有限UI集成模型调用，之后显示修复仅回放原响应',currentScopeResult='405断点：六次指定指标通过，71/200已用、余129，候选更新默认disabled，未部署');put(I/'run.json',ledger)
plan=R/'docs/unified-development-plan.md';s=plan.read_text(encoding='utf8');start=s.index('<!-- dialogue-integration-current -->');end=s.index('<!-- /dialogue-integration-current -->')+len('<!-- /dialogue-integration-current -->')
if not (N/'prior-plan-current.txt').exists():(N/'prior-plan-current.txt').write_text(s[start:end],encoding='utf8')
current='''<!-- dialogue-integration-current -->
## 2026-11-15 普通对白知情：十二阶段主线回接v3（405断点）
完整本地候选已更新，默认disabled、未部署/正式剧情/自动批准修订。原有阶段1—8机制沿用，本轮重点补齐v3普通入口保存、重开、范围待核、依赖询问与同请求续行，阶段9—12更新回归/有限模型/UI/候选交付。
400—405六次指定指标通过：A明确接收自动保存/重开一致/下一轮投影；B只登记前半、后半真实待核，闲聊required空且待核不变，依赖时仅询问后半，隔离确认后404自然回应，405登记实际应答。六份完整请求和原始响应保存。初始场景/纯动作后续/分类/记忆为声明夹具，不能冒称两条全程模型叙事；原357完整有限链为历史证据。
复用399版本284/284离线回归；本轮修原接收确认弹窗深色主题浅底浅字，38/38控制器回归通过。403—405原请求/响应零新调用回放后MVU完全相同。范围合同/严格校验/文风/原记忆机制不变，无回复修补或关键词分类。
候选135模块+3原资产，ZIP141项，源/隔离闭包/清单哈希一致；原71次请求响应及22正式保护文件完整。200总额已用71、余129，累计405，本轮关闭，浏览器和隔离服务已停。
证据：integration-20261115/mainline-v3-20261115/ASSESSMENT.txt、browser-verification.json、verification.json、complete-outputs.txt及两张UI截图；上级DELIVERY.txt与候选ZIP已更新。399以前阶段记录保留在prior-plan-current.txt和各历史验收目录。
完成的是有界本地集成和有限模型验收；模型仍可能漏抽、错指代或错坐标，不证明长篇/多角色长期稳定，未新增自动语义审查。下一步为用户审阅候选，无自动部署或余额消耗安排。
<!-- /dialogue-integration-current -->'''
plan.write_text(s[:start]+current+s[end:],encoding='utf8')
doc=R/'work/rules_engine/gm_runtime/story-dialogue-knowledge.md';s=doc.read_text(encoding='utf8');marker='## 2026-11-15 本地集成候选接口与调用链\n';assert marker in s
note='\n当前405断点已将v3接收范围接回十二阶段本地候选：实际普通入口保存/重开/无关不问/相关确认/原请求续行已验收，六次新模型调用400—405，起始场景与分类为明示夹具。范围合同沿399版，38项控制器回归验证本轮弹窗显示修复，原284项范围回归复用。候选135模块/3资产已更新，默认disabled、未部署；证据见`integration-20261115/mainline-v3-20261115/ASSESSMENT.txt`。下方旧断点均为历史记录。\n'
if note not in s:doc.write_text(s.replace(marker,marker+note,1),encoding='utf8')
print(json.dumps({'complete':True,'newCalls':6,'remaining':129,'candidateChangedFrom380':changed,'candidateBytes':archive.stat().st_size},ensure_ascii=True))
