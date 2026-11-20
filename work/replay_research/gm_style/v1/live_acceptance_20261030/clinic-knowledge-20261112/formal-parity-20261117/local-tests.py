from pathlib import Path
import importlib.util, json, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')
E=Path(__file__).resolve().parent
R=next(p for p in E.parents if p.name=='TRPG outputs')
A=Path(json.loads((E/'setup.json').read_text(encoding='utf-8'))['app'])
runtime=A/'public/901-opening-combat'; out=E/'node-runtime'
spec=importlib.util.spec_from_file_location('package',R/'work/replay_research/six_books_20261023/runtime_package.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
names=['replay-gate-script.example.js','story-knowledge.mjs','clinic-knowledge-catalog.mjs']
module=Path('work/rules_engine/gm_runtime')
p.package_runtime(runtime,out,[runtime/module/name for name in names])
controller=out/module/names[0]
def absolute(match):
    return match[1]+(controller.parent/match[2]).resolve().as_uri()+match[3] if match[2].startswith('.') else match[0]
controller.write_text(p.IMPORT.sub(absolute,controller.read_text(encoding='utf-8')),encoding='utf-8')
for name in ['story-knowledge.test.mjs','adjudication-gate.test.mjs','replay-gate-script.test.mjs']:
    source=R/module/name; body=source.read_text(encoding='utf-8')
    body=body.replace("new URL('./replay-gate-script.example.js', import.meta.url)",'new URL('+json.dumps(controller.as_uri())+')')
    body=body.replace('import.meta.url',json.dumps(source.as_uri()))
    def test_import(match):
        if not match[2].startswith('.'):return match[0]
        candidate=(out/module/match[2]).resolve()
        target=candidate if candidate.is_file() else (source.parent/match[2]).resolve()
        return match[1]+target.as_uri()+match[3]
    (E/name).write_text(p.IMPORT.sub(test_import,body),encoding='utf-8')
commands=[['node','--test',str(E/'story-knowledge.test.mjs'),str(E/'adjudication-gate.test.mjs')],
 ['node','--test','--test-name-pattern=ordinary story generation consumes recipient knowledge|ordinary classifier and narration both consume|unclassified technical failure|a second classification failure|host saved recovery',str(E/'replay-gate-script.test.mjs')]]
for label,command in zip(['knowledge-and-gate','controller'],commands):
    result=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    (E/(label+'-tests.log')).write_bytes(result.stdout)
    print(result.stdout.decode('utf-8',errors='replace')[-2600:])
    if result.returncode:raise SystemExit(result.returncode)
