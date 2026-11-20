"""Back up formal runtime and user story/save files before any formal mutation."""
from pathlib import Path
import json,hashlib,shutil,datetime
E=Path(__file__).resolve().parent
A=Path('D:/github/sillyTavern').resolve()
B=(A/'backups'/'901-reply-recovery-20261116').resolve()
assert B.is_relative_to((A/'backups').resolve()) and not B.exists()
assert not (E/'backup.json').exists(),'Never overwrite a backup receipt'
roots=['public/901-opening-combat','data/default-user/chats','data/default-user/group chats','data/default-user/groups',
 'data/default-user/characters','data/default-user/worlds','data/default-user/OpenAI Settings','data/default-user/context',
 'data/default-user/instruct','data/default-user/sysprompt','data/default-user/settings.json']
files={}
for relative in roots:
 p=A/relative
 if not p.exists():continue
 for f in ([p] if p.is_file() else sorted(p.rglob('*'))):
  if f.is_file():
   assert f.resolve().is_relative_to(A)
   files[str(f.relative_to(A))]=f
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before={relative:sha(f) for relative,f in files.items()}
B.mkdir(parents=True)
for relative,f in files.items():
 dest=B/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
 assert sha(dest)==before[relative],relative
assert all(sha(f)==before[relative] for relative,f in files.items()),'Source changed during backup; do not install'
receipt={'completed':True,'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'app':str(A),'backupDirectory':str(B),
 'scope':roots,'fileCount':len(files),'bytes':sum(f.stat().st_size for f in files.values()),'files':before,
 'credentialsReadOrCopied':False,'modelCalls':0,'rollbackScope':'Restore only the two changed runtime modules; never replace later gameplay with old chat backups.'}
(B/'backup-manifest.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(E/'backup.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'backupCompleted':True,'directory':str(B),'files':len(files),'bytes':receipt['bytes'],'sourceUnchanged':True,'modelCalls':0}))
