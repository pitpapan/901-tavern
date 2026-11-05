"""18106 isolated coverage acceptance. Does not install or edit formal files."""
from pathlib import Path
import importlib.util,sys,json,shutil,copy,hashlib,re
H=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('stage_previous',H.parent/'stage-recall/probe.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
d=p.d;a=p.a;read=p.read;put=p.put
L=Path('C:/Users/pit/AppData/Local/901-summary-coverage-20261105');U=L/'data/default-user'
B=Path('C:/Users/pit/AppData/Local/901-summary-coverage-build-20261105')
EXT='shujuku-901-summary-coverage';DEST=U/'extensions'/EXT
C=p.C;S=p.S;R=p.R
def bind():p.H=H;p.L=L;p.U=U
def setup():
 bind();p.prepare()
 card=U/'characters'/(a.TEST+'.png')
 header=read(H.parent/'stage-recall/reader-rule-candidate.json')
 def patch(j):
  host=a.host_of(j);assert header['oldHeader'] in host['content'];host['content']=host['content'].replace(header['oldHeader'],header['newHeader'],1)
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集');rec['content']=rec['content'].replace('localhost:18105','localhost:18106')
 card.write_bytes(a.png(card,patch))
 settings=read(U/'settings.json');disabled=settings['extension_settings'].setdefault('disabledExtensions',[])
 if 'third-party/shujuku' not in disabled:disabled.append('third-party/shujuku')
 put(U/'settings.json',settings)
 DEST.mkdir(parents=True,exist_ok=True)
 manifest=read(d.SRC/'manifest.json');manifest['display_name']='901 阶段覆盖校验（隔离副本）';put(DEST/'manifest.json',manifest)
 for f in (B/'dist/extension').iterdir():
  if f.is_file() and f.name!='manifest.json':shutil.copyfile(f,DEST/f.name)
 put(H/'setup.json',{'port':18106,'formalAutoFillOff':a.p.profile(read(a.F/'settings.json'))[2]['autoUpdateEnabled'] is False,'isolatedAutoFillOff':a.p.profile(settings)[2]['autoUpdateEnabled'] is False,'modelUnchanged':True,'threshold':15,'hostChanges':['history all -> 0 for blind recall','previous isolated knowledge-reader header retained'],'formalGlobalPluginDisabledOnlyInIsolatedSettings':True,'modelSummaryRule':'unchanged formal template; no new summary prompting','compiledSha256':d.sha(DEST/'index.js')})
 print('18106 isolated coverage fixture ready.')
def install(mode):
 raw=(B/'dist/extension/index.js').read_text(encoding='utf8')
 if mode=='reject':
  anchor='function assertStageCoverage901('
  start=raw.index(anchor);at=raw.index('{',start)+1
  # Testing fault only, outside candidate source: corrupt new summary between
  # compilation and the real gate. No public/global switch remains in the build.
  fault='if(arguments[0]?.sheet_relationship_facts&&arguments[2]?.enabled){const k=arguments[2].bigSummarySheetKey,b=arguments[0][k]?.content,a=arguments[1][k]?.content;if(a?.length>b?.length)a[a.length-1][1]+="[隔离故障注入：覆盖缺口]";}'
  raw=raw[:at]+fault+raw[at:]
  put(H/'fault-injection.json',{'scope':'isolated served binary only; candidate source unchanged','position':'assertStageCoverage901 before validation','fault':fault,'purpose':'verify real pre-persist rejection, no chat row/hidden mutation and runtime reload'})
 (DEST/'index.js').write_text(raw,encoding='utf8')
 put(H/('served-'+mode+'.json'),{'mode':mode,'sha256':d.sha(DEST/'index.js'),'formalPluginSha256':d.sha(d.SRC/'index.js')})
 print('Isolated plugin mode:',mode)
def after_fill(label):
 bind();r=p.rows();tables=p.tables(r);base=read(H/'initial.json')['tables']
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 e={'label':label,'tables':tables,'hidden':p.hidden(r),'requests':log.count('Chat Completion request:'),'responses':log.count('Chat Completion response:'),'oldChroniclesUnchanged':tables[C][:len(base[C])]==base[C],'oldSummaryUnchanged':tables[S][:len(base[S])]==base[S],'relationsUnchanged':tables[R]==base[R]}
 if label=='rejected':
  e['allTablesUnchanged']=tables==base;e['hiddenUnchanged']=p.hidden(r)==[];assert e['allTablesUnchanged'] and e['hiddenUnchanged']
  def frames(x):
   out=[]
   def walk(v):
    if isinstance(v,dict):
     for k,w in v.items():
      if k=='storageFrame':out.append(w)
      else:walk(w)
    elif isinstance(v,list):
     for w in v:walk(w)
   walk(x);return out
  e['storageFramesUnchanged']=frames(r)==frames(a.rows(L/'results/before-reject/chat.jsonl'))
  e['actualBrowserRuntimeUnchanged']=r[0]['chat_metadata']['relationship_load']['tables']==base
  assert e['storageFramesUnchanged'] and e['actualBrowserRuntimeUnchanged']
 else:
  text=tables[S][-1][1];e['newSummary']=text
  e['all15SourceRowsComplete']=all(all(str(cell) in text for cell in row[1:] if cell) for row in base[C][1:]);e['explicitBorrowDirection']='黄泉向黎舟借入青竹伞' in text and '黄泉尚须向黎舟归还青竹伞' in text
  assert len(tables[S])==len(base[S])+1 and e['all15SourceRowsComplete'] and e['explicitBorrowDirection'] and sorted(map(int,p.hidden(r)))==list(range(1,16))
  e['actualBrowserRuntimeMatchesPersisted']=r[0]['chat_metadata']['relationship_load']['tables']==tables
  assert e['actualBrowserRuntimeMatchesPersisted']
 assert e['oldChroniclesUnchanged'] and e['oldSummaryUnchanged'] and e['relationsUnchanged']
 put(H/(label+'.json'),e);p.archive(label);print(json.dumps({k:v for k,v in e.items() if k not in ('tables','newSummary')},ensure_ascii=False,indent=2))
def reload():
 bind();r=p.rows();t=r[0]['chat_metadata']['relationship_load']['tables'];assert t==read(H/'accepted.json')['tables'];put(H/'reload.json',{'allTablesEqualAccepted':True,'rows':len(t[C])-1,'summaryRows':len(t[S])-1,'hidden':p.hidden(r)});p.archive('reload');print('Reloaded stage and all source rows identical.')
def return_case():bind();p.append('return')
def inspect_return():bind();p.inspect()
def recall():
 bind();r=p.rows();run=r[0]['chat_metadata']['memory_lifecycle_evidence'];qs=[q for q in run['requests'] if any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in q.get('messages',[]))];assert len(qs)==1
 q=qs[0];joined='\n'.join(m['content'] for m in q['messages'] if isinstance(m.get('content'),str));reply=[x['text'] for x in run['afterMessages'] if not x['user']][-1];base=read(H/'return.json')['tables'];stage=read(H/'accepted.json')['newSummary'];stripped=joined.replace(stage,'');lines=[x for x in joined.splitlines() if x.startswith('事项#')]
 old=a.rows(L/'results/return/chat.jsonl');texts=[x['mes'] for x in old[2:] if len(x.get('mes',''))>30]
 checks={'stageCompilationLoaded':stage in joined,'newAM0016Loaded':base[C][-1][4] in joined,'oldChroniclesAbsentOutsideCompilation':all(row[4] not in stripped for row in read(H/'initial.json')['tables'][C][1:]),'oldPlotMessagesAbsent':all(x not in joined for x in texts),'noAssistantHistory':not any(m['role']=='assistant' for m in q['messages']),'sevenItemsAndKnownScopes':len(lines)==7 and all(any(line.startswith('事项#'+str(row[0])+'：') and str(row[7]) in line for line in lines) for row in base[R][1:]),'privateCodeInMemory':'瓷雀二鸣' in joined,'privateCodeNotSpoken':'瓷雀二鸣' not in reply,'publicCodeRecalled':'苇灯六结' in reply,'tablesUnchanged':p.tables(r)==base}
 put(H/'recall.json',{'checks':checks,'model':q['model'],'reply':reply,'memoryLines':lines});dest=p.archive('recall');put(dest/'request.json',q);print(json.dumps({'checks':checks,'reply':reply},ensure_ascii=False,indent=2));assert all(checks.values())
def protect():
 bind();before=read(H/'protected-before.json');now=d.p.lab.snapshot()
 changes={k:{'before':before.get(k),'after':now.get(k)} for k in before.keys()|now.keys() if before.get(k)!=now.get(k)}
 assert set(changes)<= {'settings.json'},changes
 assert all(d.sha(d.SRC/k)==v for k,v in read(H.parent/'chronicle-formal/installation.json')['installedHashes'].items())
 formal=read(a.F/'settings.json');isolated=read(U/'settings.json')
 assert a.p.profile(formal)[2]['autoUpdateEnabled'] is False and a.p.profile(isolated)[2]['autoUpdateEnabled'] is False
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 put(H/'protection.json',{'unchangedFormalProtectedFiles':len(before)-len(changes),'formalFileChanges':changes,'formalPluginUnchanged':True,'formalAutoFillOff':True,'isolatedAutoFillOff':True,'actualModelRequests':log.count('Chat Completion request:'),'actualModelResponses':log.count('Chat Completion response:'),'settingsException':'Formal settings.json changed during run; custom include/exclude body differs from initial isolated copy; origin pending user clarification. Kept current file, no rollback or overwrite.' if changes else None})
 print('Protection checked; changed formal file keys:',list(changes),'(retained, not overwritten).')
if __name__=='__main__':
 if sys.argv[1] in ('install','after_fill'):globals()[sys.argv[1]](sys.argv[2])
 else:globals()[sys.argv[1]]()
