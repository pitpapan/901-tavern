from pathlib import Path
import json,hashlib,difflib
root=Path.cwd();e=Path(__file__).resolve().parent;n=e/'scoped-reception-20261115';i=e/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
baseline=read(n/'baseline.json');ledger=read(i/'run.json');oldLedger=read(n/'before/run.json')
assert ledger['attempts'][:len(oldLedger['attempts'])]==oldLedger['attempts']
unchanged=0
for name,digest in baseline['priorEvidence'].items():
    if Path(name).name=='run.json':continue
    assert sha(root/name)==digest,name
    unchanged+=1
for name,digest in baseline['formalProtected'].items():assert sha(Path(name))==digest,name
attempts=ledger['attempts'][len(oldLedger['attempts']):]
assert len(attempts)==6 and all(a.get('manualVerdict')=='pass' for a in attempts)
assert ledger['used']==65 and ledger['remaining']==135 and ledger['cumulative']==399
reg=(n/'regression.log').read_text(encoding='utf-8');assert 'tests 284' in reg and 'pass 284' in reg and 'fail 0' in reg
cases={c['id']:c for c in read(n/'cases.json')};summaries=[];outputs=[]
for a in attempts:
    ident=a['id'];request=read(i/(ident+'.request.json'));prior=read(i/(cases[ident]['prior']+'.request.json'));raw=read(i/(ident+'.raw-response.txt'));content=(i/(ident+'.content.txt')).read_text(encoding='utf-8');check=read(n/(ident+'.check.json'))
    assert sha(i/(ident+'.request.json'))==a['requestSha256'] and sha(i/(ident+'.raw-response.txt'))==a['rawResponseSha256']
    assert raw['choices'][0]['message']['content']==content and a['rawUnmodified']
    assert request==read(n/(ident+'.prepared.json')) and request['messages'][1:]==prior['messages'][1:]
    assert {k:v for k,v in request.items() if k not in ['messages','response_format']}=={k:v for k,v in prior.items() if k not in ['messages','response_format']}
    assert check['exactCurrentMessages'] and check['schemaPass'] and check['structuralPass'] and not check.get('runtimeError')
    for path,digest in a['sourceHashes'].items():assert sha(root/path)==digest,path
    summaries.append({'id':ident,'request':a['customRequest'],'prior':cases[ident]['prior'],'verdict':a['manualVerdict'],'assessment':a['assessment'],'returnedModel':a['responseModel'],'requestBytes':a['requestBytes'],'mvuWrites':check['mvuWrites'],'pendingCount':len(check['pending'])})
    inp=json.loads(request['messages'][1]['content']);outputs.append(f"{ident} / custom{a['customRequest']} / pass\n原文：\n{inp['sourceAnchor']['text']}\n完整模型content：\n{content}\n核对：{a['assessment']}\n")
original=read(n/'scoped.original.check.json');known=lambda report,actor:[f['content']['text'] for a in report['knowledge'] if a['actorId']==actor for f in a['facts']]
assert known(original,'bright')==['渡口今晚停航'] and len(original['pending'])==1 and original['pending'][0]['content']=='明早从南桥走。' and original['noQuestionWithoutDependency']
assert known(read(n/'scoped.back.check.json'),'bright')==['明早从石桥走。']
listeners=read(n/'scoped.listeners.check.json');assert known(listeners,'player')==['西门今晚关闭，'] and known(listeners,'bright')==['明早从石桥走。']
assert known(read(n/'scoped.none.check.json'),'bright')==[]
source=root/'TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'
diff=[]
for name in ['story-dialogue-knowledge.mjs','story-dialogue-bound.test.mjs','story-dialogue-knowledge.test.mjs','replay-gate-script.test.mjs','story-dialogue-scoped.test.mjs']:
    before=(n/'before'/name).read_text(encoding='utf-8') if (n/'before'/name).exists() else ''
    diff.extend(difflib.unified_diff(before.splitlines(True),(source.parent/name).read_text(encoding='utf-8').splitlines(True),fromfile='before/'+name,tofile='current/'+name))
(n/'change.diff').write_text(''.join(diff),encoding='utf-8');(n/'complete-outputs.txt').write_text('\n\n'.join(outputs),encoding='utf-8')
report={'offline':{'pass':284,'fail':0,'newScopedTests':5},'model':{'calls':6,'pass':6,'fail':0,'usedOf200':65,'remaining':135,'cumulative':399,'attempts':summaries},'verified':{'originalBusinessInputsAndCoordinatesUnchanged':True,'generationParametersUnchanged':True,'rawResponsesPreserved':True,'oldEvidenceUnchanged':unchanged,'formalProtectedUnchanged':len(baseline['formalProtected']),'oldLedgerAttemptsUnchanged':True,'schemaConstraintsRetainedWithRequiredReceiptSpan':True,'noAutomaticRepairOrFallback':True,'noDeploymentFormalStoryOrAutomaticApprovalRevision':True},'limits':['本轮六份各一次，不能证明长期稳定或全部语义范围正确。','精确引用与父范围检查不能自动证明语义完整：模型仍可能选择包含太多内容的合法范围，或省略否定/条件限定。','未知范围继续用原uncertain/unresolved，不能从reason自动补范围。','旧记录不迁移、不重抽；旧380候选ZIP和隔离安装未更新。']}
put(n/'verification.json',report)
assessment='''回执显式内容范围：399断点

结论
本次原385/388失败输入在394通过指定接收范围指标，五份相近对照395—399也通过。不是单纯多加提醒：v2回执没有自己的范围，要为部分接收复制完整utterance；原模型已能写出前后半理由，却反复未完成这种重组。v3在原回执内要求contentSpan，减少这层间接绑定。完整言说仍保留，模型直接给出每条接收的原文内容范围。

实现与不变边界
复用prepareDialogueExtraction/check、prepareBoundDialogueExtraction及原MVU：新增prepareScopedDialogueExtraction配置同一构造器。contentSpan复用原assertionSpan，必填且连续、精确匹配UTF-16坐标、包含于父claim的content引用；原跨回执范围冲突检查改用该显式范围。登记和待核内容直接取已校验的contentSpan.quote，原收到/未收到/未知逻辑不变。没有生成替代utterance、从reason推断范围、自动补字段、修坐标或转换action。原始返回未修改。
新版dialogue-reception/3由默认语义适配器选用；v2仅显式历史回放/既有回调使用，不按模型回复自动回退。旧保存批次不迁移、不重抽。人工确认已有contentSpan时仍走原手动确认，保持保存范围与最终quote一致，不恢复自动批准/修订。
旧分片说明替换成新字段合同，未叠加逐案例关键词提示。原业务输入、history、facts、memory、坐标消息和生成参数逐项不变；Schema仅版本和必填范围字段变化，其他约束等价并保留。实际请求经过原宿主Schema展开，范围字段及说明均在完整请求中。

离线
284/284通过。新增5项覆盖结构/引用继承、缺范围/伪造/父范围外/互斥范围拒绝、旧失败不迁移、真实适配器登记与保存重开/待核/手动范围确认、未接收及未知听者边界。新版缺范围在任何MVU写入前拒绝。旧v2测试显式选择v2，默认宿主入口测试与新增完整回放使用v3。

真实6次：各份业务输入复用388—393，不更换原例
394原例：一个完整utterance，player整句received，bright前半received/后半uncertain。实际MVU只给bright“渡口今晚停航”，后半“明早从南桥走。”保留1待核，无关不问。没有整句误授予。
395反向部分：bright前半not_received、后半received，只登记后半；player完整收到，无待核。
396完整接收：两人共用完整contentSpan，均整句收到，无待核，不强制分片。
397不同听者：player完整received、bright完整not_received，bright无新增，无待核。
398各听一半：仍只有一个完整utterance，四条回执分别填写前后范围与逐人状态，player只前半、bright只后半，无待核。
399重复言说：两条相同文本保留不同发生坐标，contentSpan各在对应父言说内，第一次收到第二次没收到；bright只登记第一次，无待核。
以上均通过原JSON/Schema、引用、父范围/冲突检查和真实适配器的隔离MVU回放，没有修补返回。

实际改善和限制
原例无需模型复制utterance即可直接给出正确接收范围，本次避免了整句误绑；反向、双听者和重复言说也通过。但每例只测一次，不能证明长期稳定、泛化成功或纯因果增益。若模型选择一个原文内合法却语义过宽的范围，或者遗漏限定，结构检查仍不等于语义证明。本轮不扩大自动语义审查。
6次已记账，原200总额已用65、余135，历史累计399；本批关闭，不自动消耗余额。285份旧证据、既有账本attempts、22正式保护文件保持，完整请求/原响应/content及检查均保留。
未部署、未写正式剧情、未恢复自动批准/修订；旧候选ZIP/隔离安装仍为380断点，本轮仅本地源码与证据更新。
'''
(n/'ASSESSMENT.txt').write_text(assessment,encoding='utf-8')
checkpoint='2026-11-15 显式接收范围v3专项（399断点）：回执新增必填contentSpan，复用原精确引用/父言说边界/范围冲突和MVU登记，完整言说保留，不再要求复制utterance来表达部分接收；旧分片说明替换为字段合同，无关键词堆叠。284/284离线通过；394原385/388输入与395—399五份对照均通过本轮范围指标，bright原例仅前半知情/后半1待核且无关不问。原200已用65、余135，本批关闭；285旧证据/22正式文件不变。证据scoped-reception-20261115/ASSESSMENT.txt、verification.json；有限样例不证明语义稳定性，无自动修补/放宽/部署/正式剧情/自动批准修订。旧380候选ZIP未更新。'
plan=root/'TRPG outputs/docs/unified-development-plan.md';s=plan.read_text(encoding='utf-8');marker='<!-- dialogue-integration-current -->';assert checkpoint not in s;s=s.replace(marker,marker+'\n'+checkpoint+'\n',1);plan.write_text(s,encoding='utf-8')
doc=source.with_suffix('.md');s=doc.read_text(encoding='utf-8');marker='## 2026-11-15 本地集成候选接口与调用链';assert checkpoint not in s;s=s.replace(marker,marker+'\n\n'+checkpoint,1)
s=s.replace('新模型适配器使用 `dialogue-reception/2`：','新模型适配器使用 `dialogue-reception/3`：')
s=s.replace('不改claim类型或补回执。','不改claim类型或补回执。v3每条接收必填`contentSpan`，原文精确引用且限于父言说内容内；登记/待核直接消费该范围，缺范围不默认整句。完整言说只需保留一次，听者和内容范围不同用各自回执。',1)
s=s.replace('新版仍为`dialogue-reception/2`，未加输出字段。','380断点历史版本为`dialogue-reception/2`，当时未加输出字段。')
s=s.replace('新模型适配器的extract显式标注v2输出合同，由observeDialogue选择 `prepareBoundDialogueExtraction`；旧 `prepareDialogueExtraction` 及显式宿主回调保留历史格式验证能力。v2模型返回旧平铺格式会被拒绝，没有自动兼容、修补或重发。旧保存批次不迁移、不重抽。','新模型适配器的extract默认标注v3输出合同，由observeDialogue选择 `prepareScopedDialogueExtraction`，复用原构造器与校验器；`prepareBoundDialogueExtraction`、v2显式回调及旧 `prepareDialogueExtraction` 保留历史验证能力。v3模型返回旧版或缺少contentSpan会被拒绝，没有自动回退、补范围或重发。旧保存批次不迁移、不重抽。')
doc.write_text(s,encoding='utf-8')
ledger['complete']=True;ledger['closed']=True;ledger['currentScopeResult']='399：v3显式回执范围，284离线通过；6模型本轮范围指标全部通过，原例仅前半知情/后半待核；余135未安排。';put(i/'run.json',ledger)
print(json.dumps({'offline':report['offline'],'newCalls':6,'modelPass':6,'remaining':135,'priorEvidenceUnchanged':unchanged,'formalProtected':len(baseline['formalProtected'])}))
