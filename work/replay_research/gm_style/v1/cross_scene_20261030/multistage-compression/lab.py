"""Three-stage acceptance. Synthetic memory seeds are not campaign events."""
from pathlib import Path
import importlib.util,json,sys,copy,shutil,subprocess,re
H=Path(__file__).resolve().parent
sp=importlib.util.spec_from_file_location('formal_compression',H.parent/'summary-compression-formal/deploy.py');f=importlib.util.module_from_spec(sp);sp.loader.exec_module(f)
m=f.m;p=m.p;a=m.a;read=f.read;put=f.put;sha=f.sha;SRC=f.SRC
L=Path('C:/Users/pit/AppData/Local/901-multistage-compression-test-20261105');U=L/'data/default-user';DEST=U/'extensions/shujuku-901-multistage'
A=Path('C:/Users/pit/AppData/Local/901-compression-formal-evidence-20261105/results/return')
C=p.C;S=p.S;R=p.R
QUESTION='我问黄泉：“先前与掌柜当面约定的取物记号是什么？后来那件包裹现在该凭什么标记领取，旧标记还作数吗？黎舟实际做什么？青竹伞是谁向谁借的，现在还欠着吗？修伞与转述传闻，你分别怎么看？谁已知道你们以前合作修伞？掌柜知道你的下一站了吗？我是否告诉过你另一个备用记号？还有，苏岚先前离店去做什么、是永久离开吗？她托付的信现在在哪，你知道信的内容吗？此前路过那拨镇民的人数和来向，我们能确定吗？”我等她回答。'
def bind():
 f.H=H;f.L=L;f.U=U;f.bind();p.tables=tables
def tables(rows):
 # This batch uses public JSON imports, persisted as data_replace logs rather
 # than per-sheet checkpoints. The old probe did not read those operations.
 result={}
 for row in rows:
  frame=row.get('TavernDB_ACU_IsolatedData',{}).get('',{}).get('storageFrame',{})
  full=frame.get('checkpoint',{}).get('data')
  if full is not None:result={k:v['content'] for k,v in full.items() if k.startswith('sheet_') and isinstance(v,dict) and 'content' in v}
  checkpoints=frame.get('perSheetCheckpoints',{})
  for entry in frame.get('logEntries',[]):
   for op in entry['operations']:
    if op['kind']=='data_replace':result={k:v['content'] for k,v in op['data'].items() if k.startswith('sheet_') and isinstance(v,dict) and 'content' in v}
    elif op['kind']=='sheet_replace':result[op['sheetKey']]=op['sheet']['content']
    elif op['kind']=='sql_sheet_batch':assert op['sheetKey'] in checkpoints,'SQL operation requires the corresponding persisted checkpoint'
    else:raise AssertionError('Unhandled operation '+op['kind'])
  for k,v in checkpoints.items():result[k]=v['data']['content']
 return result
def fixtures():
 second=[
 ('重述修伞合作','黄泉当着御临风对黎舟说明两人以前合作修伞。御临风因此获知此事；此前只有黄泉和黎舟明确知情。'),
 ('另约包裹领取','掌柜与御临风、黄泉当面约定：另一件包裹以竹扣三横为领取标记。这与早先取物记号苇灯六结是两项不同约定。'),
 ('包裹暂存','掌柜将上述包裹继续留在柜内，未交付。三人均知本轮没有领取。'),
 ('伞具归属确认','黎舟收存已归还的青竹伞，黄泉没有再次借伞。御临风在场。'),
 ('传闻态度不变','黄泉向御临风说明仍不相信黎舟转述的传闻，未否定其修伞手艺。'),
 ('修伞信任不变','黄泉当着御临风和黎舟重申信任黎舟处理修伞，未扩大为相信任何传闻。'),
 ('行程仍保密','黄泉仍未向掌柜透露下一站。御临风没有替她说出目的地。'),
 ('身份保持订正','御临风与黄泉仍知黎舟是修伞匠。旧有信使误认没有恢复。'),
 ('钥匙事项未重开','掌柜确认找回铜钥匙的委托早已完成，没有另发寻找铜钥匙的新任务。'),
 ('送药事项未重开','黎舟没有重开已经失败结束的送药委托；旧药包已毁损。'),
 ('旧取物约定保留','御临风与黄泉均未改动与掌柜的苇灯六结约定。另件包裹的标记不替代它。'),
 ('私念保持私密','御临风心中再次想起[瓷雀二鸣仍只是我未说出口的备用记号]。黄泉、掌柜、黎舟均未从他处获知这个记号。'),
 ('包裹仍未领取','本阶段末包裹仍由掌柜保管，没有任何人凭标记取走。'),
 ('阶段没有另约','本阶段未新增人物、任务承接、借贷或下一站披露；此前各项界限不变。')]
 third=[
 ('替换包裹标记','掌柜当着御临风与黄泉明确将同一件尚未领取包裹的领取标记由竹扣三横改为铜环两圈，旧标记作废。苇灯六结是另一项旧取物约定，不受影响。'),
 ('明确替换原因范围','三人确认这次只替换该包裹的标记，不意味着包裹已交付，也不新增运送任务。'),
 ('知情合作保持','御临风、黄泉、黎舟已知两人以前合作修伞；没有证据表明掌柜也听说了这段合作。'),
 ('借伞仍已归还','青竹伞仍在黎舟处，黄泉没有再次借入或产生新的待还义务。'),
 ('不混同两种判断','黄泉依旧信任黎舟处理修伞，却不相信他转述的传闻，没有把两种判断合并。'),
 ('未披露下一站','黄泉没有向掌柜说明下一站，御临风也没有代她透露。'),
 ('身份无后续反转','黎舟仍是修伞匠；没有新证据推翻此前澄清的身份。'),
 ('私念仍未开口','御临风只在心中默念[瓷雀二鸣没有告诉任何人]，没有把它说出。NPC没有额外获知该记号。'),
 ('旧公开约定仍有效','苇灯六结仍是御临风、黄泉、掌柜早前当面约定的取物记号。'),
 ('包裹留存确认','掌柜继续保管该包裹，没有人已经领取，也没有新增交付收据。'),
 ('已完钥匙不重开','铜钥匙委托保持已完成，掌柜没有追加新一轮委托。'),
 ('失败送药不重开','送药委托保持失败结束，药包并未恢复。'),
 ('人物没有新增获知','没有额外人物进入谈话，也没有新增向掌柜披露合作修伞或私人备用记号的事件。'),
 ('两种记号不能替代','御临风与黄泉确认另件包裹的新标记和早前取物记号分属不同事项，不可互相代替。'),
 ('本阶段结束状态','包裹待领取，伞已归还；信任与不信分别保持，旧任务未重开，私念仍未公开。')]
 return {str(n):[[str(i),f'AM{i:04d}','未交代',title,text,''] for i,(title,text) in enumerate(src,start)] for n,src,start in [(2,second,17),(3,third,31)]}
def setup():
 bind();assert not L.exists()
 installed=read(H.parent/'summary-compression-formal/installation.json');hashes={**installed['installedHashes'],**installed['untouchedIntegrationHashes']};assert all(sha(SRC/k)==v for k,v in hashes.items())
 put(H/'plugin-before.json',hashes);put(H/'protected-before.json',m.d.p.lab.snapshot())
 f.setup()
 current=p.rows();template={}
 def find(x):
  if isinstance(x,dict):
   for k,v in x.items():
    if k.startswith('sheet_') and isinstance(v,dict) and 'sourceData' in v:template[k]=v['sourceData']
    find(v)
  elif isinstance(x,list):
   for v in x:find(v)
 find(current)
 r=a.rows(A/'chat.jsonl')
 def rules(x):
  if isinstance(x,dict):
   for k,v in list(x.items()):
    if k in template and isinstance(v,dict) and 'sourceData' in v:v['sourceData']=copy.deepcopy(template[k])
    rules(v)
   if isinstance(x.get('templateStr'),str):
    t=json.loads(x['templateStr']);rules(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
  elif isinstance(x,list):
   for v in x:rules(v)
 rules(r)
 for k in ['memory_lifecycle_evidence','relationship_load']:r[0]['chat_metadata'].pop(k,None)
 a.write_rows(U/a.TESTPATH,r);shutil.copyfile(A/'book.json',U/'worlds'/(m.d.p.lab.BOOK+'.json'))
 put(H/'baseline.json',{'tables':p.tables(r),'hidden':p.hidden(r),'source':str(A),'syntheticSeedsAreNotModelGenerated':True})
 seeds=fixtures();put(H/'synthetic-seeds.json',seeds)
 script=(H/'seed-controls.js').read_text(encoding='utf8').replace('__SEEDS__',json.dumps(seeds,ensure_ascii=False))
 card=U/'characters'/(a.TEST+'.png')
 def patch(j):
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集');rec['content']=rec['content'].replace('localhost:18109','localhost:18110')+'\n'+script
 card.write_bytes(a.png(card,patch))
 settings=read(U/'settings.json');settings['extension_settings'].setdefault('disabledExtensions',[]).append('third-party/shujuku');put(U/'settings.json',settings)
 DEST.mkdir(parents=True);manifest=read(SRC/'manifest.json');manifest['display_name']='901 多阶段压缩（隔离验收）';put(DEST/'manifest.json',manifest);shutil.copyfile(SRC/'index.js',DEST/'index.js')
 info=read(H/'setup.json');info.update(port=18110,pluginMode='isolated exact formal byte copy; only fault probe modifies local copy',compiledSha256=sha(DEST/'index.js'),stage1Source=str(A),syntheticSeedMethod='explicit isolated UI import through plugin public persistence API');put(H/'setup.json',info)
 (H/'question.txt').write_text(QUESTION,encoding='utf8');p.archive('baseline');next_stage('2')
 print('18110 isolated baseline and seed controls ready; formal untouched.')
def next_stage(n):
 bind();p.append('summary');r=p.rows();r[0]['chat_metadata']['task_boundary_case']='多阶段压缩 S'+n+'；自动填表关闭';a.write_rows(U/a.TESTPATH,r);put(L/'stage.json',{'stage':int(n)})
def seed_check(n):
 bind();r=p.rows();actual=p.tables(r);seed=r[0]['chat_metadata']['multistage_seed'];before=seed['before'];expect=copy.deepcopy(before);expect[C]+=fixtures()[n]
 if n=='2':expect[R][4][6]='AM0017：黄泉当面说明以前合作修伞';expect[R][4][7]='御临风、黄泉、黎舟'
 assert seed['stage']==int(n) and actual==expect and r[0]['chat_metadata']['relationship_load']['tables']==actual
 assert p.hidden(r)==seed['hiddenBefore'] and actual[S]==before[S]
 put(H/('stage'+n+'-before.json'),{'tables':actual,'hidden':p.hidden(r),'importOnlyExpectedChanges':True,'runtimeEqualsPersisted':True});p.archive('stage'+n+'-before');print('Stage',n,'seed exact; prior summaries/hidden preserved.')
def inspect(n):
 bind();r=p.rows();t=p.tables(r);b=read(H/('stage'+n+'-before.json'));visible=[b['tables'][C][0],*[x for x in b['tables'][C][1:] if str(x[0]) not in b['hidden']]];text=t[S][-1][1]
 temp=L/'summary.txt';temp.write_bytes(text.encode('utf8'));code="import fs from 'node:fs';import {decodeStage901} from "+json.dumps((H.parent/'summary-compression/compact.mjs').as_uri())+";process.stdout.write(JSON.stringify(decodeStage901(fs.readFileSync(process.argv[1],'utf8'))));"
 decoded=json.loads(subprocess.check_output(['node','--input-type=module','-e',code,str(temp)],text=True,encoding='utf8'))
 checks={'exactVisibleChronicles':decoded['chronicles']==visible,'exactRelationshipSnapshot':decoded['relationships']==b['tables'][R],'oldChroniclesUnchanged':t[C]==b['tables'][C],'allOldSummariesUnchanged':t[S][:-1]==b['tables'][S],'onlyOneNewSummary':len(t[S])==len(b['tables'][S])+1,'allOtherTablesUnchanged':all(t[k]==v for k,v in b['tables'].items() if k!=S),'hiddenExactlyCovered':set(p.hidden(r))==set(b['hidden'])|{str(x[0]) for x in visible[1:]},'runtimeEqualsPersisted':r[0]['chat_metadata']['relationship_load']['tables']==t}
 put(H/('stage'+n+'-accepted.json'),{'checks':checks,'newSummary':text,'tables':t,'hidden':p.hidden(r),'visibleSourceCount':len(visible)-1,'stageCharacters':len(text)});p.archive('stage'+n+'-accepted');print(json.dumps(checks,ensure_ascii=False));assert all(checks.values())
def serve(mode):
 raw=(SRC/'index.js').read_bytes().decode('utf8')
 if mode=='reject':
  anchor='function assertStageCoverage901(';assert raw.count(anchor)==1;at=raw.index('{',raw.index(anchor))+1
  fault='if(arguments[0]?.sheet_relationship_facts&&arguments[2]?.enabled){const k=arguments[2].bigSummarySheetKey,b=arguments[0][k]?.content,a=arguments[1][k]?.content;if(a?.length>b?.length)a[a.length-1][1]=a[a.length-1][1].split("\\n").filter(l=>!l.includes("\\tAM0031\\t")).join("\\n");}'
  raw=raw[:at]+fault+raw[at:];put(H/'fault-injection.json',{'scope':'isolated local binary only','omittedRow':'AM0031 (replacement marker)','position':'real guard beforePersist','code':fault})
 (DEST/'index.js').write_bytes(raw.encode('utf8'));put(H/('served-'+mode+'.json'),{'sha256':sha(DEST/'index.js'),'formalSha256':sha(SRC/'index.js')});print(mode,sha(DEST/'index.js'))
def reject():
 bind();r=p.rows();b=read(H/'stage3-before.json');t=p.tables(r)
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
 checks={'allTablesUnchanged':t==b['tables'],'hiddenUnchanged':p.hidden(r)==b['hidden'],'runtimeUnchanged':r[0]['chat_metadata']['relationship_load']['tables']==b['tables'],'storageFramesUnchanged':frames(r)==frames(a.rows(L/'results/stage3-before/chat.jsonl'))}
 put(H/'stage3-rejected.json',checks);p.archive('stage3-rejected');print(json.dumps(checks));assert all(checks.values())
def recall(n):
 bind();r=p.rows();run=r[0]['chat_metadata']['memory_lifecycle_evidence'];qs=[q for q in run['requests'] if any(x.get('role')=='user' and '裁定路径：' in str(x.get('content')) for x in q.get('messages',[]))];assert len(qs)==1;q=qs[0];joined='\n'.join(x['content'] for x in q['messages'] if isinstance(x.get('content'),str));reply=[x['text'] for x in run['afterMessages'] if not x['user']][-1];base=read(H/('stage'+n+'-accepted.json'))['tables'];stages=[x[1] for x in base[S][1:]];lines=[x for x in joined.splitlines() if x.startswith('事项#')]
 outside=joined
 for stage in stages:outside=outside.replace(stage,'')
 old=a.rows(L/('results/stage'+n+'-accepted/chat.jsonl'));texts=[x['mes'] for x in old[2:] if len(x.get('mes',''))>30 and x['mes']!=QUESTION]
 checks={'everySummaryLoadedExactlyOnce':all(joined.count(s)==1 for s in stages),'sevenCurrentItemsAndKnownScopes':len(lines)==7 and all(any(line.startswith('事项#'+str(row[0])+'：') and str(row[7]) in line for line in lines) for row in base[R][1:]),'hiddenChroniclesNotDuplicatedOutsideSummaries':all(row[4] not in outside for row in base[C][1:]),'oldPlotMessagesAbsent':all(x not in joined for x in texts),'noAssistantHistory':not any(x['role']=='assistant' for x in q['messages']),'privateCodeInMemory':'瓷雀二鸣' in joined,'privateCodeNotSpoken':'瓷雀二鸣' not in reply,'earlyPublicCodeRecalled':'苇灯六结' in reply,'currentParcelMarkerRecalled':('竹扣三横' if n=='2' else '铜环两圈') in reply,'tablesUnchanged':p.tables(r)==base}
 checks['sameQuestionAppearsOnlyOnce']=joined.count(QUESTION)==1
 put(H/('stage'+n+'-recall.json'),{'checks':checks,'reply':reply,'model':q['model'],'memoryLines':lines,'summaryCountIncludingLegacy':len(stages),'compressedStageCount':int(n),'requestCharacters':len(joined),'allSummaryCharacters':sum(map(len,stages))});dest=p.archive('stage'+n+'-recall');put(dest/'request.json',q);print(json.dumps({'checks':checks,'reply':reply},ensure_ascii=False,indent=2));assert all(checks.values())
def reload():
 bind();r=p.rows();expected=read(H/'stage3-accepted.json');checks={'allTablesEqual':p.tables(r)==expected['tables'],'runtimeEqualsPersisted':r[0]['chat_metadata']['relationship_load']['tables']==expected['tables'],'hiddenEqual':p.hidden(r)==expected['hidden']};put(H/'reload.json',checks);assert all(checks.values());p.archive('reload');print(checks)
def protect():
 bind();before=read(H/'protected-before.json');now=m.d.p.lab.snapshot();changes={k for k in before.keys()|now.keys() if before.get(k)!=now.get(k)};assert changes<={'settings.json'};assert all(sha(SRC/k)==v for k,v in read(H/'plugin-before.json').items())
 assert a.p.profile(read(a.F/'settings.json'))[2]['autoUpdateEnabled'] is False and a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace');calls=[]
 for i,chunk in enumerate(log.split('Chat Completion request:')[1:],1):
  req,sep,resp=chunk.partition('Chat Completion response:');assert sep;calls.append({'call':i,'requestedModel':re.search(r"\bmodel: '([^']+)'",req).group(1),'responseReportedModel':re.search(r"\bmodel: '([^']+)'",resp).group(1)})
 assert len({x['requestedModel'] for x in calls})==1;put(H/'model-evidence.json',calls)
 put(H/'protection.json',{'unchangedFormalFiles':len(before)-len(changes),'formalChangedKeysPreserved':sorted(changes),'formalPluginUnchanged':True,'formalAndIsolatedAutoFillOff':True,'requests':len(calls),'responses':log.count('Chat Completion response:')});print('Formal data/plugin protected, both auto off.',len(calls),'calls.')
if __name__=='__main__':globals()[sys.argv[1]](*sys.argv[2:])
