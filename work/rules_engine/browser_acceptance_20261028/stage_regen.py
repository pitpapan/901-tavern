"""Apply only the native-regenerate event fix to the pinned acceptance runtime."""
from pathlib import Path
import json,hashlib,difflib
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate'
REL='work/rules_engine/gm_runtime/replay-gate-script.example.js'
source=(ROOT/REL).read_text(encoding='utf8')
start=source[source.index('// Native regenerate removes'):source.index('const readinessOf =')]
capture='  const regeneration=nativeCombatRegeneration;\n  nativeCombatRegeneration=null;\n'
restore=source[source.index('    if(regeneration?.chatId'):source.index('    await profile.prepare?.')]
isolated=OUT/'scene_test/resource-acquisition-20261028'
p=isolated/'runtime'/REL
old=p.read_text(encoding='utf8')
assert '// Native regenerate removes' not in old
new=old.replace('const readinessOf =',start+'const readinessOf =',1)
new=new.replace('  running = true;\n',capture+'  running = true;\n',1)
new=new.replace('    await profile.prepare?.',restore+'    await profile.prepare?.',1)
p.write_bytes(new.encode('utf8'))
(Path(__file__).parent/'regen-gate.patch').write_text(''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='pinned-isolated-gate-before',tofile='pinned-isolated-gate-after')),encoding='utf8')
package=json.loads((isolated/'package.json').read_text(encoding='utf8'))
entry=next(e for e in package['modules'] if e['path']==REL)
entry['sha256']=hashlib.sha256(p.read_bytes()).hexdigest()
package['combatBaselineNote']='Pinned deployed replay gate plus native combat regenerate restoration; concurrent shared-candidate listener changes remain excluded from this isolated runtime.'
(isolated/'package.json').write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
# Shared candidate receives the same event patch only; preserve all unrelated contents.
candidate=OUT/'runtime_patch/901-opening-combat'/REL
before=candidate.read_text(encoding='utf8')
assert '// Native regenerate removes' not in before
after=before.replace('const readinessOf =',start+'const readinessOf =',1).replace('  running = true;\n',capture+'  running = true;\n',1).replace('    await profile.prepare?.',restore+'    await profile.prepare?.',1)
candidate.write_bytes(after.encode('utf8'))
manifest=json.loads((OUT/'runtime_patch_manifest.json').read_text(encoding='utf8'))
entry2=next(e for e in manifest['modules'] if e['source'].replace('\\','/')==REL)
entry2['source_sha256']=hashlib.sha256((ROOT/REL).read_bytes()).hexdigest()
entry2['sha256']=hashlib.sha256(candidate.read_bytes()).hexdigest()
(OUT/'runtime_patch_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'isolatedSource':str(p),'destination':'D:/github/sillyTavern/public/901-resource-acceptance-20261028/'+REL,'sha256':entry['sha256'],'updatedOnly':REL,'liveScriptUnchanged':package['script_sha256']},ensure_ascii=False,indent=2))
