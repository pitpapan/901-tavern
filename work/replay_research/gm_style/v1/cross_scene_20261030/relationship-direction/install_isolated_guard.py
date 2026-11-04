"""Reproducible bundle bridge for this test only; never writes the global plugin."""
from pathlib import Path
import hashlib,json,re,shutil
H=Path(__file__).resolve().parent
SRC=Path('D:/github/sillyTavern/public/scripts/extensions/third-party/shujuku')
DEST=Path('C:/Users/pit/AppData/Local/901-relationship-direction-20261104/data/default-user/extensions/shujuku-901-relation-guard')
assert DEST.parent == Path('C:/Users/pit/AppData/Local/901-relationship-direction-20261104/data/default-user/extensions')
raw=(SRC/'index.js').read_bytes();text=raw.decode('utf8');guard=(H/'relation-guard.mjs').read_text(encoding='utf8').replace('export function ','function ')
pattern=r'function assertNoHiddenPhysicalColumnMutations_ACU\(([^)]*)\)\{'
matches=list(re.finditer(pattern,text));assert len(matches)==1
m=matches[0];first=m[1].split(',')[0];assert first=='t'
patched=text[:m.start()]+guard+'\n'+text[m.start():m.end()]+'assertRelationshipItemPreservation_ACU('+first+');'+text[m.end():]
DEST.mkdir(exist_ok=True)
manifest=json.loads((SRC/'manifest.json').read_text(encoding='utf-8-sig'));manifest['display_name']='901 隔离关系校验（数据库副本）';(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False),encoding='utf8')
for f in SRC.glob('*.wasm'):shutil.copyfile(f,DEST/f.name)
(DEST/'index.js').write_text(patched,encoding='utf8')
assert (SRC/'index.js').read_bytes()==raw
receipt={'scope':'18099 disposable user-local extension only','globalIndexSha256':hashlib.sha256(raw).hexdigest(),'isolatedIndexSha256':hashlib.sha256(patched.encode()).hexdigest(),'guardSha256':hashlib.sha256((H/'relation-guard.mjs').read_bytes()).hexdigest(),'anchor':m[0],'uniqueLocalExtension':True,'integration':'Call guard beside hidden-column validation inside requestGroupFill retry try/catch; thrown errors use existing ModelOutputRetryError and no batch commit.'}
(H/'guard-install.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf8')
print('Installed user-local guard; global extension unchanged.')

settingsPath=DEST.parent.parent/'settings.json'
settings=json.loads(settingsPath.read_text(encoding='utf8'))
disabled=settings['extension_settings'].setdefault('disabledExtensions',[])
if 'third-party/shujuku' not in disabled:disabled.append('third-party/shujuku')
settingsPath.write_text(json.dumps(settings,ensure_ascii=False,indent=2),encoding='utf8')
