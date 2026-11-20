from pathlib import Path
import json, importlib.util, shutil, subprocess
E=Path(__file__).resolve().parent;R=next(p for p in E.parents if p.name=='TRPG outputs');H=E.parent.parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def module(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
runtime=module('runtime',R/'work/replay_research/six_books_20261023/runtime_package.py')
previous=H/'communication-20261113/source-contract-20261113/relationship-purpose-20261114'
manifest=load(previous/'package-manifest.json');D=E/'package/901-opening-combat'
new=runtime.package_runtime(R,D,[(R/x['source']).resolve() for x in manifest])
for asset in ['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']:
 target=D/asset;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(previous/'package/901-opening-combat'/asset,target)
put(E/'package-manifest.json',new)
code="import {readFile,writeFile} from 'node:fs/promises';import {patchStoryKnowledgeEntry} from "+json.dumps((R/'work/rules_engine/gm_runtime/narrative-style-projection.mjs').as_uri())+";await writeFile(process.argv[2],patchStoryKnowledgeEntry(await readFile(process.argv[1],'utf8')));"
subprocess.run(['node','--input-type=module','-e',code,str(H/'installed-entry.js'),str(E/'candidate-entry.js')],check=True)
A=Path(load(H/'browser-environment.json')['app']);U=A/'data/default-user'
assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a').resolve())
assert 'globalThis.fetch=denied' in (A/'offline-guard.mjs').read_text(encoding='utf-8')
assert "connect-src 'self' data: blob:" in (A/'public/index.html').read_text(encoding='utf-8')
shutil.copytree(D,A/'public/901-opening-combat',dirs_exist_ok=True)
lab=module('lab',H.parent/'action-failure/timeout-20261105/lab.py')
cp=U/'chats'/lab.NAME/'901 帝都正式续玩 20261106.jsonl'
assert not (E/'browser-before.chat.jsonl').exists(), 'Do not reset an active exercise'
shutil.copy2(cp,E/'browser-before.chat.jsonl')
entry="window.top.__901DialogueHost={enabled:true,useExistingHost:true};\n"+(E/'candidate-entry.js').read_text(encoding='utf-8')
entry="window.top.AutoCardUpdaterAPI={exportTableAsJson:()=>({sheet_relationship_facts:{name:'隔离非Canon关系表',content:[['id','主体','对象','事项','类型','状态','来源','知情'],['TEST','御临风','同行者','普通消息','测试','未确认','人工接口夹具','不作为接收证据']]}})};\n"+entry
entry+='\nconst labNotice=window.top.document.createElement("p");labNotice.id="901-dialogue-lab";labNotice.textContent="知情入口隔离演练：正文/分类/抽取均为本地合成夹具，外部调用0";labNotice.style.cssText="position:fixed;top:0;left:0;background:#143d25;color:white;z-index:99999;padding:4px";window.top.document.body.append(labNotice);'
def transform(j):j['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(U/'characters'/(lab.NAME+'.png'),transform)
(E/'browser-entry.fixture.js').write_text(entry,encoding='utf-8')
rows=[json.loads(x) for x in (H/'browser-evidence/received.seed.jsonl').read_text(encoding='utf-8').splitlines()]
for row in rows[1:]:
 for variables in row.get('variables',[]):
  root=variables.get('stat_data',{}).get('901_rules_poc')
  if root:
   root.pop('storyKnowledge',None)
   root['operations']={k:v for k,v in root.get('operations',{}).items() if not k.startswith(('story-dialogue/','story-knowledge/'))}
seed='\n'.join(json.dumps(r,ensure_ascii=False) for r in rows)+'\n'
(E/'browser.seed.jsonl').write_text(seed,encoding='utf-8');cp.write_text(seed,encoding='utf-8')
backend=A/'src/endpoints/backends/chat-completions.js';body=backend.read_text(encoding='utf-8')
(E/'backend.before.js').write_text(body,encoding='utf-8')
start=body.index('        const clinicKind=');end=body.index("        console.debug('Chat Completion request:'",start)
body=body[:start]+(E/'backend-fixture.js').read_text(encoding='utf-8')+'\n'+body[end:];backend.write_text(body,encoding='utf-8')
put(A/'dialogue-lab-state.json',{'scenario':'A','narrations':0})
put(E/'browser-setup.json',{'app':str(A),'port':18123,'modules':len(new),'modelCalls':0,'localSynthetic':True,'formalWrites':False,'credentialsRead':False,'chat':str(cp)})
print(json.dumps({'modules':len(new),'app':str(A),'modelCalls':0}))
