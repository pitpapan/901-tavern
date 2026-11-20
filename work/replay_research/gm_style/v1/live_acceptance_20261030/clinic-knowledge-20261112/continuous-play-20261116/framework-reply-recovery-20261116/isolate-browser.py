"""Use a separate local port/process; restore the previous lab before testing."""
from pathlib import Path
import json,shutil,importlib.util
E=Path(__file__).resolve().parent
info=json.loads((E/'browser-prepared.json').read_text(encoding='utf-8'))
A=Path(info['app']);D=A.parents[1]/'clinic-reply-recovery-20261116/app'
assert not D.exists()
D.mkdir(parents=True)
ignore=shutil.ignore_patterns('node_modules','.git','*.map','backups','cache')
for folder in ['src','default','public','data']:
 shutil.copytree(A/folder,D/folder,ignore=ignore)
for name in ['server.js','package.json','config.yaml','webpack.config.js','offline-guard.mjs','clinic-natural-config.json']:
 shutil.copy2(A/name,D/name)
(D/'plugins').mkdir(exist_ok=True)
R=next(p for p in E.parents if p.name=='TRPG outputs')
helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
setup=json.loads((E.parent/'setup.json').read_text(encoding='utf-8'))
entry=(E/'entry.fixture.js').read_text(encoding='utf-8').replace("location.port!=='18127'","location.port!=='18128'")
(E/'entry.fixture.js').write_text(entry,encoding='utf-8')
def transform(c):c['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
card=Path('data/default-user/characters')/(setup['character']+'.png')
lab.card_transform(D/card,transform)
shutil.copy2(E/'card.before.png',A/card)
shutil.copy2(E/'backend.before.js',A/'src/endpoints/backends/chat-completions.js')
shutil.copy2(E/'lab-config.before.json',A/'clinic-natural-config.json')
for name in ['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']:
 shutil.copy2(E/(name+'.installed-before'),A/'public/901-opening-combat/work/rules_engine/gm_runtime'/name)
info.update(app=str(D),port=18128,previousLabRestored=True)
(E/'browser-prepared.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'app':str(D),'port':18128,'previousLabRestored':True}))
