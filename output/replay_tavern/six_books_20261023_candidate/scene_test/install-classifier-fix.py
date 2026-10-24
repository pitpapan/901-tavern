import hashlib
import json
import sys
from pathlib import Path

out=Path(__file__).resolve().parent
root=out.parents[3]
formal='--formal' in sys.argv
route='901-opening-combat' if formal else '901-scene-smoke'
relative=Path('work/rules_engine/gm_runtime')
target=Path('D:/github/sillyTavern/public')/route/relative
backup=out/('formal-before-classifier-fix' if formal else 'scene-before-classifier-fix')
backup.mkdir(exist_ok=True)
records=[]
for name in ['adjudication-gate.mjs','replay-gate-script.example.js']:
    previous=(target/name).read_bytes()
    if not (backup/name).exists():
        (backup/name).write_bytes(previous)
    content=(root/relative/name).read_text(encoding='utf-8')
    for old in ['901-rules-runtime','901-opening-combat','901-combat-runtime']:
        content=content.replace('/'+old+'/', '/'+route+'/')
    if not formal and name=='replay-gate-script.example.js':
        content=content.replace("mark('response_received');", "mark('response_received', { classificationDecision: lastDecision });")
    stage=(out/'public'/route/relative/name) if not formal else (out.parent/'runtime_patch'/route/relative/name)
    stage.parent.mkdir(parents=True,exist_ok=True)
    if formal:
        assert stage.read_text(encoding='utf-8') == content.rstrip()+'\n'
        data=stage.read_bytes()
    else:
        data=content.encode('utf-8')
        stage.write_bytes(data)
    (target/name).write_bytes(data)
    assert (target/name).read_bytes()==data
    records.append({'path':str(target/name),'sha256':hashlib.sha256(data).hexdigest(),'backup':str(backup/name)})
(out/('formal-classifier-install.json' if formal else 'scene-classifier-install.json')).write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records))
