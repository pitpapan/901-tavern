from pathlib import Path
import json, hashlib, importlib.util, shutil, subprocess, difflib
E=Path(__file__).resolve().parent;R=next(p for p in E.parents if p.name=='TRPG outputs');H=E.parent.parent
read=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
spec=importlib.util.spec_from_file_location('runtime',R/'work/replay_research/six_books_20261023/runtime_package.py');runtime=importlib.util.module_from_spec(spec);spec.loader.exec_module(runtime)
previous=H/'communication-20261113/source-contract-20261113/relationship-purpose-20261114';D=E/'package/901-opening-combat';A=Path(read(E/'browser-setup.json')['app'])
assert A.resolve().is_relative_to(Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a').resolve())
old=read(E/'package-manifest.json')
if not (E/'browser-exercise-package-manifest.json').exists():put(E/'browser-exercise-package-manifest.json',old)
manifest=runtime.package_runtime(R,D,[(R/x['source']).resolve() for x in read(previous/'package-manifest.json')]);put(E/'package-manifest.json',manifest)
browserDelta=[]
for m in manifest:
 p=Path(m['destination']);rel=p.relative_to(D);loaded=A/'public/901-opening-combat'/rel
 if sha(loaded)!=m['sha256']:browserDelta.append({'path':rel.as_posix(),'exerciseSha256':sha(loaded),'finalSha256':m['sha256']})
shutil.copytree(D,A/'public/901-opening-combat',dirs_exist_ok=True)
if not (E/'browser-final-delta.json').exists():put(E/'browser-final-delta.json',browserDelta)
else:browserDelta=read(E/'browser-final-delta.json')
code="import {readFile,writeFile} from 'node:fs/promises';import {patchStoryKnowledgeEntry} from "+json.dumps((R/'work/rules_engine/gm_runtime/narrative-style-projection.mjs').as_uri())+";await writeFile(process.argv[2],patchStoryKnowledgeEntry(await readFile(process.argv[1],'utf8')));"
subprocess.run(['node','--input-type=module','-e',code,str(H/'installed-entry.js'),str(E/'candidate-entry.js')],check=True)
this_turn=['work/rules_engine/gm_runtime/'+x for x in ['story-dialogue-knowledge.mjs','replay-gate-script.example.js','narrative-style-projection.mjs','story-knowledge.mjs']]
this_turn += ['shared/901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js']
diff=[]
for name in read(E/'baseline.json')['sources']:
 p=R/name;before=E/'before'/p.name
 if before.exists():diff.extend(difflib.unified_diff(before.read_text(encoding='utf-8').splitlines(True),p.read_text(encoding='utf-8').splitlines(True),fromfile='before/'+name,tofile='after/'+name))
(E/'local-change.diff').write_text(''.join(diff),encoding='utf-8')
installed=Path('D:/github/sillyTavern/public/901-opening-combat');changes=[];prior_delta=[];portable=[]
for m in manifest:
 p=Path(m['destination']);rel=p.relative_to(D);src=(R/m['source']).resolve();assert sha(src)==m['source_sha256'];assert sha(A/'public/901-opening-combat'/rel)==m['sha256']
 assert not any(m[2].startswith('node:') for m in runtime.IMPORT.finditer(p.read_text(encoding='utf-8')))
 portable.append({'path':rel.as_posix(),'source':m['source'],'source_sha256':m['source_sha256'],'sha256':m['sha256']})
 for match in runtime.IMPORT.finditer(p.read_text(encoding='utf-8')):
  if match[2].endswith(('.js','.mjs')):assert (p.parent/match[2]).resolve().is_file(),match[2]
 formal=installed/rel;oldfile=previous/'package/901-opening-combat'/rel
 if not formal.exists() or sha(formal)!=m['sha256']:changes.append({'path':rel.as_posix(),'installedSha256':sha(formal) if formal.exists() else None,'candidateSha256':m['sha256'],'action':'replace' if formal.exists() else 'add','thisTask':rel.as_posix() in this_turn})
 if not oldfile.exists() or sha(oldfile)!=m['sha256']:prior_delta.append({'path':rel.as_posix(),'previousSha256':sha(oldfile) if oldfile.exists() else None,'candidateSha256':m['sha256'],'thisTask':rel.as_posix() in this_turn})
recovery=read(H/'communication-20261113/recovery/manifest.json')
for row in recovery['files']:assert sha(H/'communication-20261113'/row['backup'])==row['sha256']
for row in changes:
 if row['action']=='replace':assert any(Path(x['target']).resolve()==(installed/row['path']).resolve() and x['sha256']==row['installedSha256'] for x in recovery['files']),row['path']
assets=['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']
for s in assets:assert sha(D/s)==sha(previous/'package/901-opening-combat'/s)
put(E/'candidate-manifest.json',{'defaultSemanticCompletion':'disabled','modules':portable,'assets':[{'path':s,'sha256':sha(D/s)} for s in assets],'entrySha256':sha(E/'candidate-entry.js')})
put(E/'candidate-delta.json',{'previousCandidate':str(previous),'changes':prior_delta})
put(E/'deployment-diff.json',{'deployed':False,'changedModules':changes,'changedFromInstalled':len(changes),'thisTaskRuntimeChanges':this_turn,'inheritedDifferencesRemain':True,'recoveryManifest':'../../communication-20261113/recovery/manifest.json','recoveryOriginalsVerified':len(recovery['files']),'entryOriginal':'../../installed-entry.js','restoreRule':'Deployment not performed. Before any future authorized installation, preserve the current card/entry and recheck target hashes. Restore replaced files using the existing recovery manifest; added files may be removed only when they still match the reviewed candidate and a deployment record confirms ownership. No deletions performed.','fixtureControlsIncluded':False})
put(E/'package-verification.json',{'modules':len(manifest),'assets':3,'browserRuntimeMatchesFinal':True,'browserExerciseDelta':browserDelta,'sourceClosureVerified':True,'defaultDisabled':True,'noNodeImports':True,'modelCalls':0,'protectedFileCheck':'pending finalization'})
print(json.dumps({'modules':len(manifest),'changedFromInstalled':len(changes),'changedFromPreviousCandidate':len(prior_delta),'postExerciseDelta':browserDelta}))
