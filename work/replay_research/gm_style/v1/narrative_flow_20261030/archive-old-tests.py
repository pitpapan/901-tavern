"""Archive the four reviewed test groups; never modify Tavern data."""
from pathlib import Path
import hashlib,json,zipfile
from datetime import datetime,timezone

base=Path(__file__).resolve().parent
home=Path('D:/github/sillyTavern').resolve()
out=base/'archive'
out.mkdir(exist_ok=True)
target=out/'four-completed-tests-20261030.zip'
assert not target.exists(), 'Archive already exists; inspect manifest instead of replacing it'
inventory=json.loads((base/'cleanup-inventory.json').read_text(encoding='utf-8'))
selected=[r for r in inventory['rows'] if r['status']=='archive_then_cleanup_candidate']
assert len(selected)==4
configs=[base/'../live_acceptance_20261030/config.json',base/'../live_acceptance_20261030/candidate/config.json',base/'../live_acceptance_20261030/formal-integration/config.json',base/'../live_acceptance_20261030/action-failure/config.json']
routes={}
for p in configs:
 c=json.loads(p.read_text(encoding='utf-8'));routes[c['name']]=c['route']
sha=lambda b:hashlib.sha256(b).hexdigest()
sources={};groups=[]
for row in selected:
 name=row['name'];assert name!='901 帝都初始卡' and not name.startswith('901 六轮叙事')
 card=(home/'data/default-user/characters'/f'{name}.png').resolve()
 chat_dir=(home/'data/default-user/chats'/name).resolve()
 static=(home/'public'/routes[name].strip('/')).resolve()
 for p in (card,chat_dir,static):assert p.is_relative_to(home)
 assert card.is_file() and chat_dir.is_dir() and static.is_dir()
 files=[card]+sorted(p for p in chat_dir.rglob('*') if p.is_file())+sorted(p for p in static.rglob('*') if p.is_file())
 assert {p.name for p in chat_dir.glob('*.jsonl')}=={c['name']+'.jsonl' for c in row['chats']},'Chat inventory changed'
 for p in files:
  data=p.read_bytes();sources[p.relative_to(home).as_posix()]={'path':p,'data':data,'sha256':sha(data)}
 groups.append({'name':name,'chats':[c['name'] for c in row['chats']],'staticRoute':routes[name],'evidence':row['evidence']})
settings=json.loads((home/'data/default-user/settings.json').read_text(encoding='utf-8'))
names={r['name'] for r in selected}
bindings=[x for x in settings['world_info_settings']['world_info']['charLore'] if x['name'] in names]
assert {x['name'] for x in bindings}==names
binding_bytes=(json.dumps({'charLore':bindings,'restorePolicy':'Merge these four named bindings only; do not replace global settings. Shared six books and formal modules remain external dependencies.'},ensure_ascii=False,indent=2)+'\n').encode('utf-8')
with zipfile.ZipFile(target,'x',zipfile.ZIP_DEFLATED) as z:
 for rel,item in sources.items():z.writestr(rel,item['data'])
 z.writestr('restore-bindings.json',binding_bytes)
with zipfile.ZipFile(target) as z:
 assert z.testzip() is None
 for rel,item in sources.items():
  assert sha(z.read(rel))==item['sha256']
  assert sha(item['path'].read_bytes())==item['sha256'],'Source changed during archive'
 assert z.read('restore-bindings.json')==binding_bytes
manifest={'status':'archive-verified','createdAt':datetime.now(timezone.utc).isoformat(),'archive':str(target),'archiveBytes':target.stat().st_size,'archiveSha256':sha(target.read_bytes()),'groups':groups,'sourceFileCount':len(sources),'sourceBytes':sum(len(x['data']) for x in sources.values()),'files':[{'path':p,'bytes':len(x['data']),'sha256':x['sha256']} for p,x in sources.items()],'selectedBindingsBackedUp':len(bindings),'sourceFilesByteUnchanged':True,'tavernFilesWrittenOrDeleted':0,'sharedDependenciesCopied':False}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:manifest[k] for k in ['status','archiveBytes','sourceFileCount','sourceBytes','selectedBindingsBackedUp','tavernFilesWrittenOrDeleted']},ensure_ascii=False))
