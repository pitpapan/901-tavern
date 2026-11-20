"""Use the existing compiler; install only the three changed modules in the lab."""
from pathlib import Path
import json,importlib.util,shutil
E=Path(__file__).resolve().parent
R=next(p for p in E.parents if p.name=='TRPG outputs')
A=Path(json.loads((E/'browser-prepared.json').read_text(encoding='utf-8'))['app'])
spec=importlib.util.spec_from_file_location('runtime_package',R/'work/replay_research/six_books_20261023/runtime_package.py')
compiler=importlib.util.module_from_spec(spec);spec.loader.exec_module(compiler)
names=['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']
base=Path('work/rules_engine/gm_runtime')
manifest=compiler.package_runtime(R,E/'compiled',[R/base/n for n in names])
for name in names:shutil.copy2(E/'compiled'/base/name,A/'public/901-opening-combat'/base/name)
(E/'candidate-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'compiledClosure':len(manifest),'installedChangedModules':names}))
