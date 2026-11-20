from pathlib import Path
import json,shutil,importlib.util
E=Path(__file__).resolve().parent;N=E/'mainline-v3-20261115';H=E.parent.parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
cfg=read(E/'browser-setup.json');A=Path(cfg['app']);assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a').resolve())
assert 'globalThis.fetch=denied' in (A/'offline-guard.mjs').read_text(encoding='utf-8')
backend=A/'src/endpoints/backends/chat-completions.js';body=backend.read_text(encoding='utf-8');start=body.index('        // Isolated capture / exact raw replay.');end=body.index("        console.debug('Chat Completion request:'",start)
backend.write_text(body[:start]+(E/'mainline-v3-backend.fragment.js').read_text(encoding='utf-8')+'\n'+body[end:],encoding='utf-8')
seed=(E/'model-batch/noncanon-base.chat.jsonl').read_text(encoding='utf-8');(N/'base.chat.jsonl').write_text(seed,encoding='utf-8');Path(cfg['chat']).write_text(seed,encoding='utf-8')
spec=importlib.util.spec_from_file_location('lab',H.parent/'action-failure/timeout-20261105/lab.py');lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
entry='window.top.__901DialogueHost={enabled:true,useExistingHost:true};\n'+(E/'candidate-entry.js').read_text(encoding='utf-8')
entry="window.top.AutoCardUpdaterAPI={exportTableAsJson:()=>({sheet_relationship_facts:{name:'隔离非Canon关系表',content:[['id','主体','对象','事项','类型','状态','来源','知情'],['TEST','御临风','同行者','普通消息','测试','未确认','人工接口夹具','不作为接收证据']]}})};\n"+entry
entry+='\nconst labNotice=window.top.document.createElement("p");labNotice.id="901-dialogue-lab";labNotice.textContent="v3主线隔离验收：声明场景/分类为夹具，接收与依赖为实际模型；非正式剧情";labNotice.style.cssText="position:fixed;top:0;left:0;background:#143d25;color:white;z-index:99999;padding:4px";window.top.document.body.append(labNotice);'
def transform(card):card['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(A/'data/default-user/characters'/(lab.NAME+'.png'),transform);(N/'browser-entry.fixture.js').write_text(entry,encoding='utf-8')
quiet='三人沿街慢行，暂时没有交谈。'
plans={
'A':[{'id':'main.A1.narration.fixture','kind':'narration','fixtureText':'黄泉对御临风说：“西门今晚关闭，明早从石桥走。”御临风听清了整句话。布莱特离得太远，一句也没听见。'},{'id':'main.A1.reception','kind':'reception'},{'id':'main.A2.narration.fixture','kind':'narration','fixtureText':quiet},{'id':'main.A2.reception.fixture','kind':'reception','fixtureNone':True,'expectedText':quiet}],
'B':[{'id':'main.B1.narration.fixture','kind':'narration','fixtureText':'黄泉对御临风说：“渡口今晚停航，明早从南桥走。”布莱特只听清“渡口今晚停航”，后半句有没有听见无法确定。'},{'id':'main.B1.reception','kind':'reception'},{'id':'main.B2.dependency','kind':'dependency'},{'id':'main.B2.narration.fixture','kind':'narration','fixtureText':quiet},{'id':'main.B2.reception.fixture','kind':'reception','fixtureNone':True,'expectedText':quiet},{'id':'main.B3.dependency','kind':'dependency'},{'id':'main.B3.narration','kind':'narration'},{'id':'main.B3.reception','kind':'reception'}]
}
for scenario,steps in plans.items():
 config={'captureDir':str(N/'captures'),'liveDir':str(E/'iteration-200-20261115'),'steps':steps,'cursor':0,'scenario':scenario}
 (N/(scenario+'.config.json')).write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copy2(N/'A.config.json',A/'dialogue-live-config.json')
(N/'plan.json').write_text(json.dumps({'maximumNewCalls':6,'classification':'local NO_CHECK','initialNarration':'declared nonCanon fixture, not model narrative','actualCalls':['main.A1.reception','main.B1.reception','main.B2.dependency','main.B3.dependency','main.B3.narration','main.B3.reception'],'uiChoices':'B3 confirm bright received only pending second half; isolated predetermined test choice, not user canon approval','failurePolicy':'preserve failure; no blind retry; finish independent local packaging/evidence','remainingBefore':135,'formalWrites':False,'deployed':False},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'prepared':True,'maximumNewCalls':6,'scenario':'A','browserOutboundBlocked':True}))
