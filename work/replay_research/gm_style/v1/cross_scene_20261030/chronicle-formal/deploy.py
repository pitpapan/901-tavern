"""Build and install the adopted chronicle change; leave all user data untouched."""
from pathlib import Path
import sys,json,hashlib,shutil,importlib.util,difflib
H=Path(__file__).resolve().parent
PRE=H.parent/'chronicle-sequence'
SRC=Path('D:/github/sillyTavern/public/scripts/extensions/third-party/shujuku')
B=Path('C:/Users/pit/AppData/Local/901-chronicle-formal-build-20261105')
BACKUP=Path('C:/Users/pit/AppData/Local/901-chronicle-formal-backup-20261105')
L=Path('C:/Users/pit/AppData/Local/901-chronicle-formal-test-20261105')
U=L/'data/default-user'
spec=importlib.util.spec_from_file_location('sequence_probe',PRE/'probe.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
read=p.read;put=p.put
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
TABLE='src/service/table/sql-table-service.ts'
PROMPT='src/service/ai/prompt-builder/prompt-prepare.ts'
HELPER='src/service/table/chronicle-sequence-901.js'
TEST='tests/service/table/sql-table-service.test.ts'

def replace_once(s,old,new):
 assert s.count(old)==1,(old,s.count(old))
 return s.replace(old,new,1)

def prepare():
 assert sha(SRC/'index.js')==read(PRE/'installation.json')['globalPluginSha256']
 put(H/'protected-before.json',p.lab.snapshot())
 put(H/'source-before.json',{k:sha(SRC/k) for k in (TABLE,PROMPT,TEST,'index.js','dist/extension/index.js','manifest.json')})
 (B/HELPER).write_bytes((PRE/'sequence.mjs').read_bytes())
 s=(B/TABLE).read_text(encoding='utf8')
 s="import { createChronicleSequence901 } from './chronicle-sequence-901.js';\n"+s
 s=replace_once(s,'  const reservations = buildRowIdReservationsByRuntimeTable_ACU(tableData, additionalReservations);','  const sequence901 = createChronicleSequence901(tableData, getPhysicalTableNameForSheet_ACU);\n  const reservations = buildRowIdReservationsByRuntimeTable_ACU(tableData, additionalReservations);')
 start=s.index('export function materializeSystemRowIdsForSqlInserts_ACU(')
 prefix=s[:start];s=s[start:]
 s=s.replace('    const action = tokens[actionIndex];','''    const action = tokens[actionIndex];
    if (['INSERT', 'UPDATE', 'DELETE', 'REPLACE'].some(keyword => isSqlMutationKeyword_ACU(action, keyword))) {
      sequence901.guard(getSqlMutationTargetToken_ACU(statement, tokens).value, action.value.toUpperCase(),
        isSqlMutationKeyword_ACU(tokens[actionIndex + 1], 'OR') && isSqlMutationKeyword_ACU(tokens[actionIndex + 2], 'REPLACE'));
    }''',1)
 s=prefix+s
 s=replace_once(s,'      const businessValues = values.filter((_, index) => index !== suppliedRowIdIndex);','''      const businessValues = sequence901.values(target.value,
        normalizedColumns.filter((_, index) => index !== suppliedRowIdIndex),
        values.filter((_, index) => index !== suppliedRowIdIndex));''')
 (B/TABLE).write_text(s,encoding='utf8')
 s=(B/PROMPT).read_text(encoding='utf8')
 s="import { withChronicleSequenceNote901 } from '../../table/chronicle-sequence-901.js';\n"+s
 s=replace_once(s,'    const flightMode = getCurrentFlightModeState_ACU();','    workingTableData = withChronicleSequenceNote901(workingTableData);\n    const flightMode = getCurrentFlightModeState_ACU();')
 (B/PROMPT).write_text(s,encoding='utf8')
 tests=(H/'integration-tests.txt').read_text(encoding='utf8')
 with (B/TEST).open('a',encoding='utf8') as f:f.write('\n'+tests)
 patch=''.join(''.join(difflib.unified_diff((SRC/rel).read_text(encoding='utf8').splitlines(True) if (SRC/rel).exists() else [],(B/rel).read_text(encoding='utf8').splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=0)) for rel in (TABLE,PROMPT,HELPER,TEST))
 (H/'source.patch').write_text(patch,encoding='utf8')
 print('Source integration prepared in separate build directory.')

def install():
 baseline=read(H/'source-before.json')
 assert all(sha(SRC/k)==v for k,v in baseline.items()),'Formal plugin changed during build'
 assert p.lab.snapshot()==read(H/'protected-before.json')
 assert not (SRC/HELPER).exists()
 assert not BACKUP.exists();BACKUP.mkdir()
 targets={TABLE:B/TABLE,PROMPT:B/PROMPT,HELPER:B/HELPER,TEST:B/TEST,'index.js':B/'dist/extension/index.js','dist/extension/index.js':B/'dist/extension/index.js'}
 for rel in targets:
  if (SRC/rel).exists():
   out=BACKUP/rel;out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(SRC/rel,out)
 put(BACKUP/'manifest.json',{'previousHashes':baseline,'newFiles':[HELPER]})
 for rel,src in targets.items():shutil.copyfile(src,SRC/rel)
 assert sha(SRC/'index.js')==sha(B/'dist/extension/index.js')
 assert p.lab.snapshot()==read(H/'protected-before.json')
 put(H/'installation.json',{'sourcePatch':'source.patch','formalPlugin':str(SRC),'backup':str(BACKUP),'previousHashes':baseline,'installedHashes':{k:sha(SRC/k) for k in targets},'userFilesUnchanged':len(p.lab.snapshot()),'autoFillOff':p.a.p.profile(read(p.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False})
 print('Formal source and compiled extension installed; all protected user files unchanged.')

def setup():
 p.H=H;p.L=L;p.U=U;p.bind();p.a.setup()
 shutil.copyfile(PRE/'new-template.json',H/'new-template.json');p.a.prepare_return()
 card=U/'characters'/(p.a.TEST+'.png')
 def rec(j):
  x=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
  x['content']=x['content'].replace('localhost:18101','localhost:18103')
  old="status.textContent='迁移加载已保存：'+Object.keys(tables).length+'张表；'+ctx().chat.length+'条消息';"
  new="const codes=tables.sheet_ji_yao_biao.slice(1).map(r=>Number(String(r[1]).slice(2)));status.textContent='正式构建纪要读取：'+codes.length+'条；最大AM'+String(Math.max(0,...codes)).padStart(4,'0');"
  assert old in x['content'];x['content']=x['content'].replace(old,new).replace('仅隔离：检查迁移加载','仅隔离：检查纪要落盘')
 card.write_bytes(p.a.png(card,rec))
 r=p.rows(U/p.a.TESTPATH)
 put(H/'baseline.json',{'tables':p.a.p.v.latest_tables(r),'hidden':r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']})
 put(L/'active.json',{'case':'first','requestStart':0})
 # Use the actual installed global plugin, with no user-local copy or binary patch.
 s=read(U/'settings.json');disabled=s['extension_settings'].get('disabledExtensions',[])
 assert 'third-party/shujuku' not in disabled
 put(H/'isolation.json',{'port':18103,'pluginMode':'actual installed global extension','installedHash':sha(SRC/'index.js'),'autoFillOff':p.a.p.profile(s)[2]['autoUpdateEnabled'] is False})
 print('18103 isolated fixture ready; actual formal global extension enabled.')

def inspect():
 p.H=H;p.L=L;p.U=U;p.bind();p.inspect()

def reload():
 r=p.rows(U/p.a.TESTPATH);t=r[0]['chat_metadata']['relationship_load']['tables'];first=read(H/'first.json')['tables']
 assert t==first
 put(H/'reload.json',{'rows':len(t[p.CHRONICLE])-1,'lastCode':t[p.CHRONICLE][-1][1],'allTablesEqualFirst':True})
 print('Browser reload returned all unchanged tables and AM0016.')

def verify():
 first=read(H/'first.json');reloaded=read(H/'reload.json');base=read(H/'baseline.json')
 r=p.rows(U/p.a.TESTPATH);ops=[]
 def walk(x):
  if isinstance(x,dict):
   if x.get('kind')=='sql_sheet_batch' and x.get('sheetKey')==p.CHRONICLE:ops.append(x)
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(r)
 final=[x for x in ops if any('AM0016' in s for s in x.get('statements',[]))]
 put(H/'materialized-sql.json',final)
 relations=first['tables']['sheet_relationship_facts'][1:]
 checks={
  'old15ChroniclesUnchanged':first['tables'][p.CHRONICLE][1:16]==base['tables'][p.CHRONICLE][1:],
  'newCodeAM0016':first['newCodes']==['AM0016'] and first['uniqueCodes'],
  'fullMaximumLoaded':first['computedSequenceHintLoaded'],
  'hiddenAndSummaryUnchanged':first['hiddenIdsUnchanged'] and first['oldSummariesUnchanged'],
  'oneOriginalModelCall':first['actualFillRequests']==1 and first['model']=='[抗截断]gemini-3.8-flash',
  'reloadAllTablesEqual':reloaded['allTablesEqualFirst'] and reloaded['rows']==16 and reloaded['lastCode']=='AM0016',
  'replayContainsMaterializedCode':bool(final) and all('row_id' in s for x in final for s in x['statements']),
  'sevenRelationshipItemsRetained':len(relations)==7,
  'privateCodeNotInRelations':all('瓷雀二鸣' not in str(x) for x in relations),
  'formalUserFilesUnchanged':p.lab.snapshot()==read(H/'protected-before.json'),
  'formalAutoFillOff':p.a.p.profile(read(p.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False,
  'isolatedAutoFillOff':p.a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False,
  'installedBuildUnchanged':sha(SRC/'index.js')==read(H/'installation.json')['installedHashes']['index.js'],
 }
 put(H/'verification.json',checks);print(json.dumps(checks,ensure_ascii=False,indent=2));assert all(checks.values())

if __name__=='__main__':globals()[sys.argv[1]]()
