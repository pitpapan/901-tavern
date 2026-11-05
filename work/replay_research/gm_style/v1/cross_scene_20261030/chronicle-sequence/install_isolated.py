"""Version-checked bridge into a disposable user-local copy of the database plugin."""
from pathlib import Path
import json,hashlib,shutil
H=Path(__file__).resolve().parent
SRC=Path('D:/github/sillyTavern/public/scripts/extensions/third-party/shujuku')
L=Path('C:/Users/pit/AppData/Local/901-chronicle-sequence-20261105')
DEST=L/'data/default-user/extensions/shujuku-901-chronicle-sequence'
raw=(SRC/'index.js').read_bytes();s=raw.decode('utf8')
expected=json.loads((H.parent/'relationship-facts/protection-result.json').read_text(encoding='utf8'))['globalPluginSha256']
assert hashlib.sha256(raw).hexdigest()==expected,'Plugin changed; review integration anchors before patching'
helper=(H/'sequence.mjs').read_text(encoding='utf8').replace('export function ','function ')
anchor='function materializeSystemRowIdsForSqlInserts_ACU(t,n,o,i){'
assert s.count(anchor)==1
s=s.replace(anchor,helper+'\n'+anchor+'const sequence901=createChronicleSequence901(n,getPhysicalTableNameForSheet_ACU);',1)
start=s.index(anchor);end=s.index('function assertNoHiddenPhysicalColumnMutations_ACU(',start)
body=s[start:end]
guard='C=l[g];if(isSqlMutationKeyword_ACU(C,"REPLACE"))'
assert body.count(guard)==1
body=body.replace(guard,'C=l[g];if(["INSERT","UPDATE","DELETE","REPLACE"].some(k=>isSqlMutationKeyword_ACU(C,k)))sequence901.guard(getSqlMutationTargetToken_ACU(t,l).value,C.value.toUpperCase(),isSqlMutationKeyword_ACU(l[g+1],"OR")&&isSqlMutationKeyword_ACU(l[g+2],"REPLACE"));if(isSqlMutationKeyword_ACU(C,"REPLACE"))')
alloc='const n=t.filter((t,n)=>n!==m);return`(${allocateStableRowId_ACU(E)}, ${n.join(", ")})`'
assert body.count(alloc)==1
body=body.replace(alloc,'const n=sequence901.values(I.value,B.columns.filter((t,n)=>n!==m).map(t=>t.normalized),t.filter((t,n)=>n!==m));return`(${allocateStableRowId_ACU(E)}, ${n.join(", ")})`')
s=s[:start]+body+s[end:]
start=s.index('async function prepareAIInput_ACU(')
anchor='const u=getCurrentFlightModeState_ACU();if(u.enabled&&u.hiddenRowIds.length>0)'
at=s.index(anchor,start);assert at-start<7000
s=s[:at]+'C=withChronicleSequenceNote901(C);'+s[at:]
DEST.mkdir(parents=True,exist_ok=True)
manifest=json.loads((SRC/'manifest.json').read_text(encoding='utf8'));manifest['display_name']='901 隔离纪要编号（数据库副本）'
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False),encoding='utf8')
for f in SRC.glob('*.wasm'):shutil.copyfile(f,DEST/f.name)
(DEST/'index.js').write_text(s,encoding='utf8')
settings=L/'data/default-user/settings.json';obj=json.loads(settings.read_text(encoding='utf8'))
disabled=obj['extension_settings'].setdefault('disabledExtensions',[])
if 'third-party/shujuku' not in disabled:disabled.append('third-party/shujuku')
settings.write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf8')
assert (SRC/'index.js').read_bytes()==raw
receipt={'globalPluginSha256':expected,'isolatedPluginSha256':hashlib.sha256(s.encode()).hexdigest(),'integration':['Prompt note computed before hidden-row projection','Full runtime data read during existing row-id SQL materialization','Only new INSERT code_index allocated; old chronicle mutations rejected','Materialized SQL used for live transaction and V2 replay'],'formalPluginUnchanged':True}
(H/'installation.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf8')
print('User-local isolated plugin patched; global plugin unchanged.')
