from pathlib import Path
import json,shutil,importlib.util
E=Path(__file__).resolve().parent;L=E/'live-model-20261115';H=E.parent.parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'));cfg=load(E/'browser-setup.json');A=Path(cfg['app']);chat=Path(cfg['chat'])
assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a').resolve())
assert not (L/'browser-before.chat.jsonl').exists()
shutil.copy2(chat,L/'browser-before.chat.jsonl');shutil.copy2(E/'model-batch/noncanon-base.chat.jsonl',chat)
backend=A/'src/endpoints/backends/chat-completions.js';body=backend.read_text(encoding='utf-8');(L/'backend.before.js').write_text(body,encoding='utf-8')
start=body.index('        // ISOLATED synthetic interfaces only.');end=body.index("        console.debug('Chat Completion request:'",start)
backend.write_text(body[:start]+(E/'live-backend.fragment.js').read_text(encoding='utf-8')+'\n'+body[end:],encoding='utf-8')
plan=load(E/'model-batch/plan.json');(A/'dialogue-live-config.json').write_text(json.dumps({'captureDir':str(L/'browser-captures'),'liveDir':str(L),'steps':plan['dynamicCalls'],'cursor':0}),encoding='utf-8')
spec=importlib.util.spec_from_file_location('lab',H.parent/'action-failure/timeout-20261105/lab.py');lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
entry=(E/'browser-entry.fixture.js').read_text(encoding='utf-8').replace('知情入口隔离演练：正文/分类/抽取均为本地合成夹具，外部调用0','知情模型验收：分类本地控制；正文/语义仅回放本批原始响应，不自动外发')
def transform(card):card['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(A/'data/default-user/characters'/(lab.NAME+'.png'),transform);(L/'browser-entry.fixture.js').write_text(entry,encoding='utf-8')
(L/'A1.narration.release.json').write_text(json.dumps({'rawResponse':True,'purpose':'Replay already saved actual response 335 only after request equality'}),encoding='utf-8')
print(json.dumps({'browserOutbound':False,'currentRawReplay':335,'liveDir':str(L)}))
