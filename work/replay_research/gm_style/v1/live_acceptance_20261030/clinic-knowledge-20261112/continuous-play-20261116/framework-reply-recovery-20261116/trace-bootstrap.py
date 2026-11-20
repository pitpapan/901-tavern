from pathlib import Path
import importlib.util,json
E=Path(__file__).resolve().parent
R=next(p for p in E.parents if p.name=='TRPG outputs')
A=Path(json.loads((E/'browser-prepared.json').read_text(encoding='utf-8'))['app'])
entry=(E/'entry.fixture.js').read_text(encoding='utf-8')
assert 'diagnosticBoot' not in entry
entry="""const diagnosticBoot=window.top.document.createElement('pre');diagnosticBoot.id='diagnostic-bootstrap';diagnosticBoot.style.cssText='position:fixed;right:0;top:0;z-index:999999;background:#123;color:white';window.top.document.body.append(diagnosticBoot);diagnosticBoot.textContent='恢复诊断：加载原模块';
window.addEventListener('unhandledrejection',e=>{diagnosticBoot.textContent='恢复诊断初始化错误：'+e.reason?.message;});
"""+entry
for anchor,label in [("const sceneBinding=",'读取场景绑定'),("await waitGlobalInitialized('Mvu');",'等待MVU'),("const continuationParentId=",'核对原生分支'),("const storyKnowledge=",'创建关键知情运行时'),("const storyKnowledgeController=",'注册普通入口'),("// Disposable local fault injection.",'挂载本地故障控制')]:
 assert entry.count(anchor)==1,anchor
 entry=entry.replace(anchor,"diagnosticBoot.textContent='恢复诊断："+label+"';\n"+anchor)
entry+="\ndiagnosticBoot.remove();\n"
(E/'entry.fixture.js').write_text(entry,encoding='utf-8')
helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
setup=json.loads((E.parent/'setup.json').read_text(encoding='utf-8'))
def transform(c):c['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(A/'data/default-user/characters'/(setup['character']+'.png'),transform)
