"""One inspected local helper fix; preserve exact preimages for rollback."""
from pathlib import Path
import hashlib
import json

ROOT=Path(__file__).resolve().parents[4]
HOST=Path('D:/github/sillyTavern/public/scripts/extensions/third-party/JS-Slash-Runner')
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/world-loading-20261028/host-backup'
source=HOST/'src/function/generate/dataProcessor.ts'
bundle=HOST/'dist/index.js'
old_source="      return world_info_include_names ? `${name}: ${x.content}` : x.content;\n    })\n    .reverse();"
new_source="      return world_info_include_names ? `${name}: ${x.content}` : x.content;\n    }); // oaiMessages is already latest-first; WI depth starts at the latest message."
old_bundle='async function SW(e,t,n){let r=e.filter(e=>e.role!==`system`).map(e=>{let t=e.role===`user`?ve:ye;return ot?`${t}: ${e.content}`:e.content}).reverse(),i=le()'
new_bundle=old_bundle.replace('}).reverse(),i=le()','}),i=le()')
changes=[]
for path,old,new in [(source,old_source,new_source),(bundle,old_bundle,new_bundle)]:
    data=path.read_bytes();text=data.decode('utf-8');newline='\r\n' if '\r\n' in text else '\n'
    old=old.replace('\n',newline);new=new.replace('\n',newline)
    assert text.count(old)==1,path
    changes.append((path,data,text.replace(old,new).encode('utf-8')))
OUT.mkdir(parents=True,exist_ok=True)
records=[]
for path,before,after in changes:
    backup=OUT/path.name
    with backup.open('xb') as f:f.write(before)
    path.write_bytes(after)
    records.append({'path':str(path),'backup':str(backup.relative_to(ROOT)),'before':hashlib.sha256(before).hexdigest(),'after':hashlib.sha256(after).hexdigest()})
(OUT/'patch.json').write_text(json.dumps({'reason':'generateRaw WI adapter reversed an already latest-first history; four-message scan retained old scenes','files':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'patched':len(records),'backup':str(OUT)},ensure_ascii=False))
