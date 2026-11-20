from pathlib import Path
import json,hashlib,difflib

root=Path.cwd();e=Path(__file__).resolve().parent;n=e/'reception-range-20261115';i=e/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(n/'baseline.json');ledger=read(i/'run.json');old=read(n/'before/run.json')
assert ledger['attempts'][:len(old['attempts'])]==old['attempts']
unchanged=0
for name,digest in b['priorEvidence'].items():
    if Path(name).name=='run.json':continue
    assert sha(root/name)==digest,name
    unchanged+=1
for name,digest in b['formalProtected'].items():assert sha(Path(name))==digest,name
attempts=ledger['attempts'][len(old['attempts']):];assert len(attempts)==6 and all(a.get('manualVerdict') for a in attempts)
assert ledger['remaining']==141 and ledger['used']==59 and ledger['cumulative']==393
assert (i/'range.original.request.json').read_bytes()==(i/'scope.partial.request.json').read_bytes()
reg=(n/'regression.log').read_text(encoding='utf-8');assert 'tests 279' in reg and 'pass 279' in reg and 'fail 0' in reg
summary=[];outputs=[]
for a in attempts:
    ident=a['id'];request=read(i/(ident+'.request.json'));raw=read(i/(ident+'.raw-response.txt'));content=(i/(ident+'.content.txt')).read_text(encoding='utf-8');check=read(n/(ident+'.check.json'))
    assert sha(i/(ident+'.request.json'))==a['requestSha256'] and sha(i/(ident+'.raw-response.txt'))==a['rawResponseSha256']
    assert raw['choices'][0]['message']['content']==content and a['rawUnmodified'] and check['exactCurrentMessages']
    assert request==read(n/(ident+'.prepared.json'))
    for path,digest in a['sourceHashes'].items():assert sha(root/path)==digest,path
    if a['manualVerdict']=='fail':assert check['mvuWrites']==0 and check['replayStateUnchanged']
    summary.append({'id':ident,'request':a['customRequest'],'verdict':a['manualVerdict'],'assessment':a['assessment'],'schemaPass':check.get('schemaPass',False),'localCheckPass':check['structuralPass'],'mvuWrites':check['mvuWrites'],'runtimeError':check.get('runtimeError'),'returnedModel':a['responseModel']})
    inp=json.loads(request['messages'][1]['content']);outputs.append(f"{ident} / custom{a['customRequest']} / {a['manualVerdict']}\n原文：\n{inp['sourceAnchor']['text']}\n完整模型content：\n{content}\n判定：{a['assessment']}\n")
historical=read(n/'scope.partial.check.json');assert historical['schemaPass'] and not historical['structuralPass'] and historical['mvuWrites']==0 and historical['replayStateUnchanged']
source=root/'TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'
before=(n/'before/story-dialogue-knowledge.mjs').read_text(encoding='utf-8');after=source.read_text(encoding='utf-8')
assert before.split('export async function prepareBoundDialogueExtraction')[1]==after.split('export async function prepareBoundDialogueExtraction')[1]
assert before.split('return {input,messages,responseFormat,check(reply)')[0]==after.split('return {input,messages,responseFormat,check(reply)')[0]
diff=[]
for name in ['story-dialogue-knowledge.mjs','story-dialogue-bound.test.mjs']:
    diff+=list(difflib.unified_diff((n/'before'/name).read_text(encoding='utf-8').splitlines(True),(source.parent/name).read_text(encoding='utf-8').splitlines(True),fromfile='before/'+name,tofile='current/'+name))
(n/'change.diff').write_text(''.join(diff),encoding='utf-8')
(n/'complete-outputs.txt').write_text('\n\n'.join(outputs),encoding='utf-8')
report={'offline':{'pass':279,'fail':0,'newTests':5},'model':{'newCalls':6,'pass':4,'fail':2,'usedOf200':59,'remaining':141,'cumulative':393,'attempts':summary},'verified':{'original385NowRejectedWithZeroWrites':True,'new388RejectedWithZeroWrites':True,'originalRequestByteIdentical':True,'noPromptSchemaParameterChanges':True,'noReplyRepair':True,'priorEvidenceUnchanged':unchanged,'oldLedgerAttemptsUnchanged':True,'formalProtectedUnchanged':len(b['formalProtected']),'noDeploymentOrFormalStoryOrAutomaticApprovalRevision':True},'limits':['只拒绝同一听者在重叠原文范围上的互斥状态，不判断reason语义。','原例模型仍未分片；单条整句received配部分听清理由仍不能由该关系检查识别。','检查失败整批拒绝，不自动选取其中可用条目，也不修复既有记录。','候选ZIP和隔离安装仍为380版本，本轮只更新源码及离线证据。']}
put(n/'verification.json',report)
assessment='''部分听清与整句绑定专项：393断点

修复结论
现有utterance/argumentSpans.content已能表达完整言说及接收分片，模型原385未遵从该合同。明确程序缺口是检查器只逐条检查，没有拒绝同一接收人、同一原文发生范围上的互斥状态。此次仅在原prepareDialogueExtraction.check补范围关系检查，新版嵌套入口复用它：坐标相交、听者ID相交、status不同则原样拒绝。不同claim ID不能绕过；不同听者、不相交范围、重复文字的不同发生坐标仍独立处理。
没有新字段或提示词，没有Schema/参数改动，没有关键词判定、自动拆分、补回执、action转换、选择一条状态或放宽引用校验。原MVU/记忆/文风/人物选择未改。

离线回归
279/279通过，新增5项：原385虽Schema合法但现在必须拒绝；同/跨claim的重叠范围互斥；相邻/分离范围与不同/未知听者；相同文字的不同发生位置；真实适配器零写入与独立作者构造的合法分片登记。新增3项先红再绿。原385原件重新通过真实适配器，Conflicting dialogue reception ranges、MVU写入0，隔离初始状态完全不变。

真实模型6次（388—393）
388原失败：请求按字节与385完全相同。仍把bright received/uncertain绑定整句，JSON/Schema通过，但新关系检查拒绝，真实适配器MVU零写入。阻断通过，模型分片失败。
389反向部分接收：可读内容拆出前后半及相应received/not_received，但JSON层级/括号错误，零写入；不修补，不算通过。
390全部接收：完整言说加两人共用received回执，两人各得整句、无待核，通过。
391不同听者：同一整句player received、bright not_received，player1条、bright0条、无待核，通过。
392两人各听一半：完整言说保留无回执，另有两段分片及逐人相反状态，player只前半、bright只后半、无待核，通过。
393重复言说：相同文本在不同坐标出现两次，第一次received、第二次not_received，bright只获第一条、无待核，通过，未按字符串相同误拒绝。

实际改善与边界
已解决这类显式互斥回执静默导致整句知情登记的程序漏洞，合法内容分片继续可用。未证明模型稳定按范围分片，原失败仍未通过。只输出一条整句received并在reason写“只听清部分”时，没有另一条范围矛盾，此检查仍不能识别其语义错误；本轮不扩大自动语义审查。失败整批拒绝，不自动采用其中看似正确部分。
本轮请求、原始响应、content和逐例原MVU回放全部保留。旧261份证据文件、旧账本全部既有attempts、22个正式保护文件保持。用了6次，原200总额已用59，剩141，历史累计393；关闭本批，不自动消耗余额。原样复测通过显式--retest记录retestOf，要求上一相同请求已判失败且产品源码发生变化，同版盲重试仍拒绝。
未部署、未写正式剧情、未恢复自动批准或修订路线；未更新旧380候选ZIP/隔离安装。
'''
(n/'ASSESSMENT.txt').write_text(assessment,encoding='utf-8')
checkpoint='2026-11-15 部分接收范围一致性专项（393断点）：原检查器漏验同一听者/重叠原文范围的互斥status；仅补原prepareDialogueExtraction.check关系检查，复用现有言说分片、严格引用及MVU，不改提示/Schema/生成参数。279/279离线通过；原385及原样复测388现原样拒绝、零写入。6次模型4通过/2失败，原例模型分片仍未通过；392双听者分片正确，单条整句误报不由该结构检查识别。原200已用59、余141，本批关闭；证据reception-range-20261115/ASSESSMENT.txt及verification.json。旧261证据/既有账本attempts/22正式文件保持，无部署/正式剧情/自动批准修订；旧候选ZIP仍为380断点。'
plan=root/'TRPG outputs/docs/unified-development-plan.md';s=plan.read_text(encoding='utf-8');marker='<!-- dialogue-integration-current -->';assert checkpoint not in s;s=s.replace(marker,marker+'\n'+checkpoint+'\n',1);plan.write_text(s,encoding='utf-8')
doc=source.with_suffix('.md');s=doc.read_text(encoding='utf-8');marker='## 2026-11-15 本地集成候选接口与调用链';assert checkpoint not in s;s=s.replace(marker,marker+'\n\n'+checkpoint,1);doc.write_text(s,encoding='utf-8')
ledger['complete']=True;ledger['closed']=True;ledger['currentScopeResult']='393：原范围互斥检查补齐，279离线通过；6模型4通过2失败，原模型分片仍失败但零写入；余141未安排。';put(i/'run.json',ledger)
print(json.dumps({'offline':report['offline'],'modelCalls':6,'passed':4,'failed':2,'remaining':141,'oldEvidence':unchanged,'formalProtected':len(b['formalProtected'])}))
