"""Verify and deliver this bounded follow-up; no network or formal writes."""
from pathlib import Path
import json, hashlib, difflib, zipfile, re
E=Path(__file__).resolve().parent
N=E/'implicit-reception-20261115'
I=E/'iteration-200-20261115'
R=next(p for p in E.parents if p.name=='TRPG outputs')
W=R.parent
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
baseline=read(N/'baseline.json')
for path,digest in {**baseline['priorEvidence'],**baseline['formalProtected']}.items():assert sha(Path(path))==digest,path
ledger=read(I/'run.json')
attempts=[x for x in ledger['attempts'] if x['customRequest']>357]
assert len(attempts)==23 and ledger['used']==46 and ledger['remaining']==154 and ledger['cumulative']==380
assert all(x['state']=='completed' and x.get('manualVerdict') for x in attempts)
assert sum(x['manualVerdict']=='pass' for x in attempts)==14
selected=['implicit.original.nested','omission.original.nested','implicit.parallel.nested','implicit.obstacle.nested','implicit.ambiguous.nested','implicit.partial.nested','implicit.unsaid.nested','omission.parallel.nested','implicit.npc_question.nested','implicit.unrelated.nested']
reports={id:read(N/(id+'.check.json')) for id in selected}
for id,report in reports.items():
    assert report['structuralPass'] and not report.get('error'),id
    assert report['noQuestionWithoutDependency'],id
    attempt=next(x for x in attempts if x['id']==id)
    assert attempt['manualVerdict']=='pass'
    for path,digest in attempt['sourceHashes'].items():assert sha(W/path)==digest,(id,path)
def messages(id,actor):return [f['content']['text'] for a in reports[id]['knowledge'] if a['actorId']==actor for f in a['facts']]
assert messages('implicit.original.nested','player')==['风有点凉，不过不算难受。','比山路上好走多了。']
assert messages('implicit.original.nested','bright')==[]
assert len(messages('omission.original.nested','player'))==3 and len(messages('omission.original.nested','bright'))==3
assert len(messages('implicit.parallel.nested','player'))==2
for id in ['implicit.obstacle.nested','implicit.ambiguous.nested','implicit.unsaid.nested','implicit.unrelated.nested']:
    assert all(not a['facts'] for a in reports[id]['knowledge']),id
assert len(reports['implicit.ambiguous.nested']['pending'])==1
assert all(not reports[id]['pending'] for id in selected if id!='implicit.ambiguous.nested')
assert messages('implicit.partial.nested','player')==['日落后锁门，']
assert len(messages('omission.parallel.nested','player'))==2
assert messages('implicit.npc_question.nested','bright')==['日落后就锁门。'] and messages('implicit.npc_question.nested','player')==[]
for report in reports.values():
    for a in report['knowledge']:
        assert all(f['belief']=='uncertain' for f in a['facts'])
def normalize(format):
    format=json.loads(json.dumps(format));items=format['json_schema']['schema']['properties']['units']['items']
    if 'properties' in items:
        branches=items.pop('anyOf');common=items
        format['json_schema']['schema']['properties']['units']['items']={'anyOf':[{**common,'properties':{**common['properties'],**b['properties']}} for b in branches]}
    def strip(v):
        if isinstance(v,list):return [strip(x) for x in v]
        if isinstance(v,dict):return {k:strip(x) for k,x in v.items() if k!='description'}
        return v
    return strip(format)
for final,original in [('implicit.original.nested','B.retry3.reception'),('omission.original.nested','A1.reception.r2')]:
    a,b=[read(I/(id+'.request.json')) for id in [final,original]]
    assert a['messages'][1:]==b['messages'][1:]
    assert {k:v for k,v in a.items() if k not in ['messages','response_format']}=={k:v for k,v in b.items() if k not in ['messages','response_format']}
    assert normalize(a['response_format'])==normalize(b['response_format'])
outputs=[]
for attempt in attempts:
    id=attempt['id']
    assert sha(I/(id+'.request.json'))==attempt['requestSha256']
    assert sha(I/(id+'.raw-response.txt'))==attempt['rawResponseSha256']
    outputs.extend([f"custom{attempt['customRequest']} {id} [{attempt['manualVerdict']}]",attempt['assessment'],(I/(id+'.content.txt')).read_text(encoding='utf8'),''])
(N/'complete-outputs.txt').write_text('\n\n'.join(outputs),encoding='utf8')
contract=read(N/'contract-verification.json');assert all(contract.values())
reg=N/'final-regression-current.log';log=reg.read_text(encoding='utf-8-sig');assert re.search(r'pass 271\b',log) and re.search(r'fail 0\b',log)
sources=[W/'901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js',R/'work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs',R/'work/rules_engine/gm_runtime/story-dialogue-bound.test.mjs']
diff=[]
for p in sources:diff.extend(difflib.unified_diff((N/'before'/p.name).read_text(encoding='utf8').splitlines(True),p.read_text(encoding='utf8').splitlines(True),fromfile='before/'+p.name,tofile=p.relative_to(W).as_posix()))
(N/'change.diff').write_text(''.join(diff),encoding='utf8')

assessment='''隐含听者引用与漏抽专项（最终380断点，2026-11-15）

结论
原349/350隐含听者输入、原338漏抽输入及预先冻结的8份相近正反例，均以原文/历史/生成参数完成最终同版本的有限验收。没有用明确指定交谈对象替换原失败。最终相关离线271/271通过。
本轮新增23次（358—380）：14次通过本轮指标、9次中间失败，全部原件保留；不能拿14/23当独立准确率。原200次总账已用46次、余154次，历史累计380。余量未安排后台调用。未部署、未写正式剧情、未恢复自动批准或修订。

实际修复
1 复用原dialogue-reception/2的recipientSpans/evidence/propositionRef/utterances/coverage，在字段旁明确直接指代、隐含应答、旁听范围与目录外新消息。先覆盖实际言说及接收，再关联facts；没有新字段或关键词分类器。
2 新版此前仍携带旧gm-assertion-output/1返回外壳，造成两套结构说明并存。共享buildAssertionMessages增加默认true的includeEnvelope；仅新版关闭旧外壳，保留共享字段/引用/语义规则，改用唯一嵌套结构示意。默认共享消息逐字不变。
3 evidence原以$ref附description，现有宿主flattenSchema替换引用时丢掉同级说明。本轮复用原assertionSpan定义在该字段展开，实际发送请求已包含说明；没有更改宿主或放宽span定义。
4 Schema只把两个状态分支共有字段提取一次，保持extracted→unresolved空、unresolved→非空、required/additionalProperties等全部约束；展示顺序先同级元数据后深层言说。原两个请求约105KB降到约67KB。归一展开与旧Schema约束逐项相等，变异正反例一致；这不是新输出协议或回复修补。
修改产品源仅共享assertion-contract.js及story-dialogue-knowledge.mjs；正反例在原story-dialogue-bound.test.mjs。原receive/MVU/记忆/存档、来源检查、校验器源码和叙事文风均未改。

最终十例
380 原349/350：两片实际回答完整；听者引用及接收依据引用各自回答，由历史确定御临风，布莱特未知。
371 原338：三段言说不再因无关clinic事实目录被漏掉；御临风的称谓/代词与布莱特的姓名/实际听取关系分别保留，propositionRef为null的新说法。
372 相近双片隐含应答：只给提问者两条说法，不漏补充片段。
373 提问后离场：not_received，无授予或凭空待核。
374 两名提问者中仅一人听清、身份未知：recipientIds空/uncertain，真实待核1，零授予，无依赖不问。
375 部分听见：前半收到，后半明确未收到；只登记“日落后锁门”，不扩成整句。
376 内心拟答未开口：没有实际utterance接收，零授予/待核。
377 否认另有消息后补充新消息：两片都保留，不把否认、facts不匹配当漏抽理由。
378 提问者是另一名NPC：按实际历史识别布莱特，未将user楼层自动等同玩家，御临风未知。
379 无关独语：不与先前问题拼成回答，保留实际言说与not_received，零授予。
这十份原始模型结果均通过JSON Schema、现有严格引用/上下文检查及原回执隔离重放；输入未塞预期答案。相近例为预先冻结的非Canon测试，不是正式剧情。没有新增浏览器轮次，不能称本轮重新做了真实UI验收。

失败及限制
358：null额外单元、coverage换行双转义。359/361/365/366：非法JSON或闭合错误。363：旁听者套用提问者应答引用。367：两个speaker引用坐标多一字。368：接收依据仅为说话动作/语气。370：coverage/unresolved错放根层。全部按原样失败，未删字段、补括号、挪层级、纠坐标或修回执。
363/368的语义失败本地结构检查可以通过，由本轮离线核对判失败；不能称程序新增了通用语义审查能力。格式/坐标通过也不证明任意同名、长篇、多人物指代或漏抽率可靠。当前结果是同一轮迭代后有限样例的改善，没有独立统计稳定性证明；不能把每项改变的单独因果效果从此试验中分离。
371的问句也以实际说过的utterance/uncertain来源消息保存，未批准其内容为世界事实；本轮只验收接收覆盖、来源/听者引用，不宣称全部mode与非言说断言分类通过。人物知道、相信、是否披露继续分开。
原schema不要求模型reason非空解释，程序未据reason自行补接收；本轮无新依赖模型调用，374“无依赖不问”由现有dialogueQuestions([])离线行为核对，不冒称再次实测相关依赖识别。

交付与追溯
verification.json：原件哈希、正式保护文件、源版本、十例具体状态、旧默认合同/校验不变、候选一致性。
cases.json：模型调用前冻结的输入及人工验收目标；预期目标从未送入模型请求。
complete-outputs.txt：本轮23份模型内容全文和逐次判断；完整请求及HTTP原响应仍在../iteration-200-20261115/各对应文件。
change.diff、各失败先行及回归日志保留。最终候选沿上级dialogue-integration-candidate.zip，旧包在before/保留。默认disabled，未安装，原22正式文件保持。
'''
(N/'ASSESSMENT.txt').write_text(assessment,encoding='utf8')

delivery=(N/'before/DELIVERY.txt').read_text(encoding='utf8')
prefix='''最新续作完成：隐含听者引用与漏抽（380断点）
本轮已在原349/350与338输入及8份冻结正反例完成最终同版本有限验收，没有明确指定交谈对象绕开原失败。271/271离线通过；本轮23次模型调用，9份中间失败保留；总46/200已用、余154未安排调用。
最新说明与证据：implicit-reception-20261115/ASSESSMENT.txt、verification.json、complete-outputs.txt。产品两处生成合同修复，校验/来源/MVU/文风不变；候选已更新，默认disabled，未部署/正式剧情/自动批准修订。此次没有再跑UI，原十二阶段浏览器证据仍属于357时版本。
以下保留357断点的十二阶段历史交付；其中267项/23次/余177等是当时统计，当前续作以本段和新verification为准。

'''
(E/'DELIVERY.txt').write_text(prefix+delivery,encoding='utf8')
c=(N/'before/CANDIDATE.txt').read_text(encoding='utf8').replace('267项相关离线回归','271项相关离线回归').replace('200次总额度已用23次（335—357，含先前335/336），余177未使用。','200次总额度已用46次（335—380），余154未使用；本轮新增23次，原输入2例及相近8例最终通过本轮指标。').replace('详见DELIVERY.txt和iteration-200-20261115/final-verification.json。','详见DELIVERY.txt和implicit-reception-20261115/verification.json。')
c+='本轮只更新生成合同及其Schema投影；原349/350和338以相同原文/历史复测，没有新增点名替代。9份中间失败保留，有限通过不保证长期准确。最新候选未重跑浏览器UI。\n'
(E/'CANDIDATE.txt').write_text(c,encoding='utf8')

doc=R/'work/rules_engine/gm_runtime/story-dialogue-knowledge.md';s=doc.read_text(encoding='utf8')
marker='## 2026-11-15 本地集成候选接口与调用链\n'
update='''
2026-11-15 隐含听者/漏抽续作完成：原349/350及338未改正文/历史复测，连同8份预先冻结正反例在最终同版本通过本轮指标；271项离线通过。本轮23次、原200总账46已用/154余，9份中间失败全部保留。详见`integration-20261115/implicit-reception-20261115/ASSESSMENT.txt`。下方357断点是此前十二阶段状态，不能替代本次版本证据。

新版仍为`dialogue-reception/2`，未加输出字段。`recipientSpans`区分当前直接指代、唯一隐含应答与旁听者听取关系；`evidence`保留当前实际接收/障碍；先覆盖言说再匹配facts，目录外新说法继续用null。说明放在对应Schema字段旁，`evidence`复用原span定义内联以避免宿主展开$ref时丢失同级description。共享消息构造可选`includeEnvelope:false`，仅新版使用，以免旧断言返回外壳与新结构并存；默认旧消息逐字不变。unit的公共Schema只保留一次，两个status/unresolved分支约束完全等价，校验器源码未改。嵌套说明明确coverage/unresolved属于unit，不能移到根层。没有回复转换、坐标修补、自动补回执或新的语义审查器。

模型仍可能输出格式错误、坐标错位或语义错绑；结构通过不能自动证明选对听者。此次结果是有限模型对照，未重新做浏览器UI/长期多人物验收，候选默认disabled、未部署。
'''
assert marker in s;s=s.replace(marker,marker+update,1);doc.write_text(s,encoding='utf8')
plan=R/'docs/unified-development-plan.md';s=plan.read_text(encoding='utf8');start=s.index('当前续作（用户追加要求）');end=s.index('\n',start)
s=s[:start]+'''当前续作已完成（380断点）：原349/350隐含听者和338漏抽输入未增加点名/修改正文，连同8份冻结正反例最终同版本通过指定接收指标；271/271离线通过。复用原合同，修旧/新返回外壳混杂及evidence说明被宿主$ref展开丢失，字段旁区分应答/旁听/新消息；Schema等价合并/排序，校验器/MVU/来源/文风不变。本轮358—380共23次，14有限通过/9中间失败全保留；总46/200，余154未安排调用。最终十例371—380通过本轮指标，不作泛化统计。新证据implicit-reception-20261115/ASSESSMENT.txt、verification.json；候选更新未部署，正式22保护文件不变，无正式剧情/自动批准修订。下方十二阶段是357历史断点。'''+s[end:]
plan.write_text(s,encoding='utf8')

manifest=read(E/'candidate-manifest.json');D=E/'package/901-opening-combat'
assert len(manifest['modules'])==135 and len(manifest['assets'])==3
for m in manifest['modules']:
    assert sha((R/m['source']).resolve())==m['source_sha256']
    assert sha(D/m['path'])==m['sha256']
for m in manifest['assets']:assert sha(D/m['path'])==m['sha256']
assert manifest['defaultSemanticCompletion']=='disabled'
assert sha(E/'candidate-entry.js')==manifest['entrySha256']
oldmanifest=read(N/'before/candidate-manifest.json');oldassets={m['path']:m['sha256'] for m in oldmanifest['assets']}
assert oldassets=={m['path']:m['sha256'] for m in manifest['assets']}
oldmodules={m['path']:m['sha256'] for m in oldmanifest['modules']}
changed=[m['path'] for m in manifest['modules'] if oldmodules.get(m['path'])!=m['sha256']]
assert sorted(changed)==sorted(['work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs','shared/901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js'])
archive=E/'dialogue-integration-candidate.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(D.rglob('*')):
        if p.is_file():z.write(p,'901-opening-combat/'+p.relative_to(D).as_posix())
    for name in ['candidate-entry.js','candidate-manifest.json','CANDIDATE.txt']:z.write(E/name,name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert set(z.namelist())=={'901-opening-combat/'+m['path'] for m in manifest['modules']+manifest['assets']}|{'candidate-entry.js','candidate-manifest.json','CANDIDATE.txt'}
    for m in manifest['modules']+manifest['assets']:assert hashlib.sha256(z.read('901-opening-combat/'+m['path'])).hexdigest()==m['sha256']
report={'status':'complete-finite-original-and-nearby-reception-tests','regression':{'passed':271,'failed':0,'log':'final-regression-current.log','sha256':sha(reg)},
 'budget':{'newCalls':23,'newPassesOnSpecifiedMetrics':14,'newFailuresPreserved':9,'totalLimit':200,'totalUsed':46,'remainingUnspent':154,'historicalCumulative':380},
 'finalSelectedCalls':[next(x['customRequest'] for x in attempts if x['id']==id) for id in selected],
 'allTenUseCurrentSourceHashes':True,'originalBusinessInputHistoryCoordinatesParametersUnchanged':True,'originalSchemaConstraintsEquivalent':True,
 'contractCompatibility':contract,'sourceHashes':{p.relative_to(W).as_posix():sha(p) for p in sources},
 'rawOriginalRequestsAndResponsesVerified':23,'previousEvidenceFilesUnchanged':len(baseline['priorEvidence']),'protectedFormalFilesUnchanged':len(baseline['formalProtected']),
 'candidate':{'modules':135,'assets':3,'changedFrom357':changed,'defaultDisabled':True,'archiveBytes':archive.stat().st_size,'sha256':sha(archive),'entries':141},
 'deployed':False,'formalStoryWritten':False,'automaticApprovalOrRevision':False,'newBrowserValidation':False,
 'limits':['Finite iterated samples, not independent accuracy/stability evidence.','No automatic semantic error detection; 363/368 accepted structurally but manually failed.','No general mode/non-utterance classification or long-cast guarantee.','Original UI evidence belongs to earlier candidate; latest change verified by offline original host mapping and exact-request model tests.']}
put(N/'verification.json',report);put(E/'final-verification.json',report)
pack=read(E/'package-verification.json');pack['packagingModelCalls']=pack.pop('modelCalls',0);pack['integrationModelCalls']=46;pack['protectedFileCheck']='22 unchanged; implicit-reception-20261115/verification.json';pack['latestUIValidation']='Not rerun; previous357 browser evidence retained';put(E/'package-verification.json',pack)
ledger.update(complete=True,closed=True,stopReason='Original implicit-listener and omission inputs plus eight frozen controls passed final bounded metrics; all failures preserved; no additional scheduled calls.',finalVerification='../implicit-reception-20261115/verification.json')
put(I/'run.json',ledger)
print(json.dumps({'newCalls':23,'remaining':154,'originalAndNearbyFinalCases':10,'regressionPassed':271,'protectedUnchanged':22,'candidateBytes':archive.stat().st_size}))
