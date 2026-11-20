from pathlib import Path
import json, hashlib, difflib

root=Path.cwd()
e=Path(__file__).resolve().parent
n=e/'receipt-scope-20261115'
i=e/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
baseline=read(n/'baseline.json')
unchanged=[]
for name,digest in baseline['priorEvidence'].items():
    if Path(name).name=='run.json': continue  # authorized append-only attempt accounting
    assert sha(root/name)==digest,name
    unchanged.append(name)
for name,digest in baseline['formalProtected'].items(): assert sha(Path(name))==digest,name
source=root/'TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'
before=(n/'before/story-dialogue-knowledge.mjs').read_text(encoding='utf-8')
after=source.read_text(encoding='utf-8')
marker='return {input,messages,responseFormat,check(wire)'
assert before.split(marker)[1]==after.split(marker)[1], 'Validator/runtime unexpectedly changed'
assert before.split('export async function prepareBoundDialogueExtraction')[0]==after.split('export async function prepareBoundDialogueExtraction')[0]
cases=read(n/'cases.json'); ledger=read(i/'run.json'); attempts=[x for x in ledger['attempts'] if x['id'] in {c['id'] for c in cases}]
assert len(attempts)==7 and all(x.get('manualVerdict') for x in attempts)
assert ledger['cumulative']==387 and ledger['remaining']==147 and ledger['used']==53
regression=(n/'regression.log').read_text(encoding='utf-8')
assert 'tests 274' in regression and 'pass 274' in regression and 'fail 0' in regression
outputs=[]; summaries=[]
for attempt in attempts:
    ident=attempt['id']; request=read(i/(ident+'.request.json')); raw=read(i/(ident+'.raw-response.txt')); content=(i/(ident+'.content.txt')).read_text(encoding='utf-8'); check=read(n/(ident+'.check.json'))
    assert sha(i/(ident+'.request.json'))==attempt['requestSha256']
    assert sha(i/(ident+'.raw-response.txt'))==attempt['rawResponseSha256']
    assert raw['choices'][0]['message']['content']==content and attempt['rawUnmodified']
    assert request==read(n/(ident+'.prepared.json')) and check['exactCurrentMessages']
    for path,digest in attempt['sourceHashes'].items(): assert sha(root/path)==digest,path
    original=read(i/'omission.original.nested.request.json')
    assert {k:v for k,v in request.items() if k not in ['messages','response_format']}=={k:v for k,v in original.items() if k not in ['messages','response_format']}
    if ident=='scope.original': assert request['messages']==original['messages']
    inp=json.loads(request['messages'][1]['content'])
    outputs.append(f"{ident} / custom{attempt['customRequest']} / {attempt['manualVerdict']}\n原文：\n{inp['sourceAnchor']['text']}\n模型原始完整content：\n{content}\n逐例判定：{attempt['assessment']}\n")
    summaries.append({'id':ident,'customRequest':attempt['customRequest'],'verdict':attempt['manualVerdict'],'structuralPass':check['structuralPass'],'assessment':attempt['assessment'],'responseModel':attempt['responseModel'],'requestBytes':attempt['requestBytes']})
partial=read(n/'scope.partial.check.json')
assert any(f['content']['text']=='渡口今晚停航，明早从南桥走。' for a in partial['knowledge'] if a['actorId']=='bright' for f in a['facts'])
assert len(partial['pending'])==1 and partial['noQuestionWithoutDependency']
report={'scope':'仅接收依据与旁听范围','offline':{'passed':274,'failed':0},'model':{'newCalls':7,'pass':4,'fail':3,'remaining':147,'usedOf200':53,'cumulative':387,'attempts':summaries},'invariants':{'historicalFilesUnchanged':len(unchanged),'formalProtectedUnchanged':len(baseline['formalProtected']),'originalInputMessagesCoordinatesUnchanged':True,'generationParametersUnchanged':True,'schemaConstraintsUnchanged':True,'runtimeAndValidatorUnchanged':True,'rawResponsesPreserved':True,'noDeployment':True,'noFormalStoryWrites':True,'noAutomaticApprovalOrRevision':True},'limitations':['原例未通过：格式错误与原接收范围过推仍在。','范围未知对照虽写uncertain，但JSON错误，不能算通过。','部分听清对照结构合法但没有分片，隔离MVU实际过授予整句；产品未自动识别该语义错配。','正例仅有限接收范围指标通过，不证明新说明带来稳定因果改善。','旧候选ZIP仍是380断点，本轮未重打包或更新隔离安装。']}
put(n/'verification.json',report)
(n/'complete-outputs.txt').write_text('\n\n'.join(outputs),encoding='utf-8')
diff=[]
for filename in ['story-dialogue-knowledge.mjs','story-dialogue-bound.test.mjs']:
    old=(n/'before'/filename).read_text(encoding='utf-8'); new=(source.parent/filename).read_text(encoding='utf-8')
    diff.extend(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='before/'+filename,tofile='current/'+filename))
(n/'change.diff').write_text(''.join(diff),encoding='utf-8')
assessment='''接收依据与旁听范围专项（2026-11-15，387断点）

结论：最小合同澄清和离线回归完成；原例尚未通过模型验收，不称整体修复成功。
原371不存在本地丢回执或扩大内容的接线错误：模型将同一旁听依据挂到三条received。原合同已要求逐内容范围与部分听清拆分；但字段说明未明确区分身份依据/接收依据及旁听时间范围。只在现有evidence/reason字段澄清，未改输入、坐标、参数、Schema约束或校验器/登记程序。不以引用长短作门槛，不要求直接接收必须复述。

离线274/274：增加字段交付约束、全程/后来/范围不明/部分/未接收五组原MVU回放，以及371原失败不修补回归。字段交付测试先红后绿；合成回执不代表模型效果。
真实7次（381—387），4份通过本例接收范围指标、3份失败：
381原例：JSON括号与层级错误；可读内容仍用目光/“问你是”作evidence，bright三段全部received，未通过。
382全程：末尾明确从第一句起两句听清，双方各得两句，0待核；共享依据范围准确。
383后来：player两句，bright只第二句；首句not_received，0待核。
384范围未知：可读内容保留bright两句uncertain，但JSON括号错误，失败，无合法回放。
385部分：Schema/原校验通过，理由分前后半但回执都绑定完整句，未拆分内容；隔离MVU把整句登记给bright并留下1待核，语义失败。现有合同已明确分片，属于模型未遵从，不从reason自动改写父内容或补回执。
386完全未听见：player两句，bright无新增、0待核。第二条“她又说：”是承接前句明确对象的连续发言依据，需结合前文，并非单条引用独立自足的证明。
387隐含应答：回答引用准确，接收依据包含实际回答；player两句、bright无新增、0待核，不强求复述。

本轮没有同输入重试，没有新增自动语义审查。保留7份完整请求、上游原始响应、content和离线检查；原有233份证据文件（不含授权追加的账本）与22个正式保护文件保持。共用原200账本，已用53、剩147，累计387；本批关闭，不自动消耗余额。
本轮仅本地源码和证据变更，未部署、未写正式剧情、未恢复自动批准/修订。旧候选ZIP与隔离安装仍为380断点，未假称包含本轮改动。
不能证明稳定性或泛化成功：原例未通过，部分接收仍可结构合法地过授予。4份正反例通过也不能单独证明是新说明造成改善，未做同输入统计对照。
'''
(n/'ASSESSMENT.txt').write_text(assessment,encoding='utf-8')
ledger['complete']=True;ledger['closed']=True;ledger['currentScopeResult']='387断点：合同最小澄清、274离线通过；7模型4有限通过3失败，原例仍失败；保留147，不自动继续。';put(i/'run.json',ledger)
checkpoint='2026-11-15 接收依据/旁听范围专项完成（387断点）：仅evidence/reason生成说明澄清身份与接收依据、共用依据时间/内容范围；Schema/校验/MVU/原例输入未改。274/274离线通过，381—387共7次，4有限通过/3失败；原例格式及整段旁听误判仍失败，部分听清例结构通过却未分片、隔离登记整句。未发现可证实的本地丢项或扩大范围接线错误，不自动修补。原200已用53，余147，本批关闭。证据receipt-scope-20261115/ASSESSMENT.txt及verification.json；233旧证据/22正式文件保持。本轮未重打包，旧候选ZIP仍为380断点；未部署/正式剧情/自动批准修订。'
plan=root/'TRPG outputs/docs/unified-development-plan.md'; s=plan.read_text(encoding='utf-8'); start=s.index('<!-- dialogue-integration-current -->')+len('<!-- dialogue-integration-current -->'); s=s[:start]+'\n'+checkpoint+'\n\n'+s[start:].lstrip('\n');plan.write_text(s,encoding='utf-8')
doc=source.with_suffix('.md');s=doc.read_text(encoding='utf-8');title='## 2026-11-15 本地集成候选接口与调用链';s=s.replace(title,title+'\n\n'+checkpoint,1);doc.write_text(s,encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))
