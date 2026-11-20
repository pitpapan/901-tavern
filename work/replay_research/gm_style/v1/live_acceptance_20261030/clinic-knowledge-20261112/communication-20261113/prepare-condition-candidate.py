"""Package the one-module projection fix; retain the prior candidate and all live evidence."""
from pathlib import Path
import hashlib, importlib.util, json, shutil
O=Path(__file__).resolve().parent; H=O.parent
R=next(p for p in O.parents if p.name=='TRPG outputs')
D=O/'conditions-20261113';D.mkdir(exist_ok=True)
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
spec=importlib.util.spec_from_file_location('runtime_package',R/'work/replay_research/six_books_20261023/runtime_package.py')
runtime=importlib.util.module_from_spec(spec);spec.loader.exec_module(runtime)
previous=read(O/'package-manifest.json');destination=D/'package/901-opening-combat'
manifest=runtime.package_runtime(R,destination,[(R/x['source']).resolve() for x in previous])
assert len(manifest)==len(previous)==133
changes=[]
for before,after in zip(previous,manifest):
 assert before['source']==after['source']
 assert sha(Path(before['destination']))==before['sha256']
 if before['sha256']!=after['sha256']:changes.append({'source':after['source'],'previousSha256':before['sha256'],'candidateSha256':after['sha256'],'candidate':after['destination']})
assert [Path(c['source']).as_posix() for c in changes]==['work/rules_engine/gm_runtime/story-knowledge.mjs'],changes
for asset in ['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']:
 target=destination/asset;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(O/'package/901-opening-combat'/asset,target)
shutil.copy2(O/'candidate-entry.js',D/'candidate-entry.js')
put(D/'package-manifest.json',manifest)
put(D/'candidate-delta.json',{'parentDeploymentDiff':'../deployment-diff.json','recoveryManifest':'../recovery/manifest.json','changes':changes,'otherModulesUnchanged':132,'entryUnchanged':True,'assetsUnchanged':True,'deployed':False})
environment=read(H/'browser-environment.json');A=Path(environment['app'])
assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a').resolve())
backend=(A/'src/endpoints/backends/chat-completions.js').read_text(encoding='utf8');guard=(A/'offline-guard.mjs').read_text(encoding='utf8')
assert 'globalThis.fetch=denied' in guard and 'https.request=denied' in guard and 'upstreamCalls:0' in backend
assert backend.index('return response.status(418)')<backend.index("console.debug('Chat Completion request:'")
assert "connect-src 'self' data: blob:" in (A/'public/index.html').read_text(encoding='utf8')
for path,expected in environment['protected'].items():assert sha(Path(path))==expected
rel=Path('work/rules_engine/gm_runtime/story-knowledge.mjs')
shutil.copy2(destination/rel,A/'public/901-opening-combat'/rel)
for item in manifest:
 rel=Path(item['destination']).relative_to(destination)
 assert sha(A/'public/901-opening-combat'/rel)==item['sha256']
put(D/'browser-setup.json',{'app':str(A),'port':18123,'credentialsRead':False,'upstreamBlocked':True,'formalWrites':False,'captureFilesBefore':[p.name for p in (A/'clinic-captures').glob('*.json')],'modulesVerified':133,'currentCandidateChanges':changes})
print(json.dumps({'modules':133,'changed':len(changes),'otherModulesUnchanged':132,'modelCalls':0,'credentialsRead':False,'formalFilesUnchanged':len(environment['protected'])}))
