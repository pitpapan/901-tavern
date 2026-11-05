"""Formal stage-summary -> hidden history -> new chronicle -> blind continuation."""
from pathlib import Path
import importlib.util,sys,json,copy,shutil,re,hashlib
H=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('formal_stage_deploy',H.parent/'chronicle-formal/deploy.py')
d=importlib.util.module_from_spec(spec);spec.loader.exec_module(d)
a=d.p.a;read=d.read;put=d.put
L=Path('C:/Users/pit/AppData/Local/901-stage-recall-20261105');U=L/'data/default-user'
A=Path('C:/Users/pit/AppData/Local/901-relationship-facts-evidence-20261105/results/closeout')
C='sheet_ji_yao_biao';S='sheet_da_zong_jie';R='sheet_relationship_facts'
QUESTION='我问黄泉：“先前当面约定的取物记号是什么？黎舟究竟是做什么的？青竹伞原来是谁向谁借的，现在还欠着吗？你对他修伞和转述传闻分别怎么看？刚才说这些时谁在场听见？我有没有告诉过你另一个备用记号？”我等她回答。'
SUMMARY_NOTE='按已完成阶段追加历史总结，已有行不可修改或删除。逐条承接全部可见纪要，不漏掉未被后续取代的事实与变化；压缩表述仍保留时序、因果、结果、持续约定的具体内容和知情范围。新订正写明订正后的事实，不沿袭旧总结的已证错误。关系读独立关系事项表，同一对象的不同事项可并存；涉及借还明确借入方、借出方及待履行者。关系当前状态由事项表持续供续写读取，总结不代替或删除事项行。新增后由系统隐藏已归纳纪要，不自行操作隐藏列。'

def rows():return a.rows(U/a.TESTPATH)
def tables(r):return a.p.v.latest_tables(r)
def hidden(r):return r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']
def archive(label):
 dest=L/'results'/label;dest.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(U/a.TESTPATH,dest/'chat.jsonl');shutil.copyfile(U/'worlds'/(d.p.lab.BOOK+'.json'),dest/'book.json');return dest

def append(case):
 r=rows();before=tables(r);inp=a.p.CASES[case]
 r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None)
 r[0]['chat_metadata']['task_boundary_case']='正式阶段链：'+case+'；自动填表关闭'
 r.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':inp['input'],'extra':{}},{'name':a.TEST,'is_user':False,'is_system':False,'mes':inp['reply'],'extra':{},'variables':copy.deepcopy(r[-1]['variables'])}])
 a.write_rows(U/a.TESTPATH,r)
 count=(L/'stdout.log').read_text(encoding='utf8',errors='replace').count('Chat Completion request:') if (L/'stdout.log').exists() else 0
 put(L/'active.json',{'case':case,'requestStart':count})
 put(H/(case+'-input.json'),{'case':case,'input':inp,'tablesBefore':before})
 print('Prepared',case,'without changing prior table values.')

def prepare():
 put(H/'protected-before.json',d.p.lab.snapshot())
 installed=read(H.parent/'chronicle-formal/installation.json')['installedHashes'];assert all(d.sha(d.SRC/k)==v for k,v in installed.items())
 d.H=H;d.L=L;d.U=U;d.setup()
 template=read(H/'new-template.json');r=a.rows(A/'chat.jsonl');original=tables(r)
 def formal_rules(x):
  if isinstance(x,dict):
   for k,v in list(x.items()):
    if k in template and isinstance(v,dict) and 'sourceData' in v:v['sourceData']=copy.deepcopy(template[k]['sourceData'])
    formal_rules(v)
   if isinstance(x.get('templateStr'),str):
    t=json.loads(x['templateStr']);formal_rules(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
  elif isinstance(x,list):
   for v in x:formal_rules(v)
 formal_rules(r);assert tables(r)==original
 r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None);r[0]['chat_metadata'].pop('relationship_load',None)
 assert len(original[C])==16 and len(original[R])==8 and len(original[S])==2 and hidden(r)==[]
 assert original[R][5][5]=='未归还'
 a.write_rows(U/a.TESTPATH,r);shutil.copyfile(A/'book.json',U/'worlds'/(d.p.lab.BOOK+'.json'))
 host_hashes=[]
 def card_patch(j):
  host=a.host_of(j);body=host['content'];assert body.count("max_chat_history:'all'")==1
  host['content']=body.replace("max_chat_history:'all'","max_chat_history:0",1)
  host_hashes.append(hashlib.sha256(body.encode()).hexdigest())
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
  rec['content']=rec['content'].replace('localhost:18103','localhost:18105')
 card=U/'characters'/(a.TEST+'.png');card.write_bytes(a.png(card,card_patch))
 put(H/'initial.json',{'source':str(A),'tables':original,'hidden':[],'summaryThreshold':15,'newTemplateChangesOnlySourceData':True})
 put(H/'setup.json',{'port':18105,'formalPluginSha256':d.sha(d.SRC/'index.js'),'formalHostSha256':host_hashes[0],'isolatedHostOnlyChange':'max_chat_history all -> 0','thresholdUnchanged':15,'autoFillOff':a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False,'question':QUESTION})
 (H/'question.txt').write_text(QUESTION,encoding='utf8')
 for name in ('baseline.json','return-input.json','new-template.json','isolation.json'):(H/name).unlink()
 archive('initial');append('summary')

def inspect():
 active=read(L/'active.json');case=active['case'];log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 chunks=log.split('Chat Completion request:')[1:][active['requestStart']:]
 hits=[x for x in chunks if 'CREATE TABLE chronicle' in x and 'Chat Completion response:' in x];assert len(hits)==1,len(hits)
 req,_,resp=hits[0].partition('Chat Completion response:');r=rows();now=tables(r);before=read(H/(case+'-input.json'))['tablesBefore']
 e={'case':case,'actualFillRequests':1,'model':re.search(r"\bmodel: '([^']+)'",req).group(1),'threshold15Loaded':'可见纪要达到15条' in req,'sql':[x.strip() for x in resp.splitlines() if any(y in x for y in ('INSERT INTO','UPDATE ','DELETE FROM'))],'tables':now,'hidden':hidden(r),'oldChroniclesUnchanged':now[C][:len(before[C])]==before[C],'oldSummariesUnchanged':now[S][:len(before[S])]==before[S]}
 if case=='summary':
  e.update(newSummary=now[S][-1][1],onlyOneNewSummary=len(now[S])==len(before[S])+1,noNewChronicle=now[C]==before[C],relationsUnchanged=now[R]==before[R])
 else:
  e.update(newCodes=[x[1] for x in now[C][len(before[C]):]],fullMaximumLoaded='最大编号AM0015，下一个AM0016' in req,stageSummaryUnchanged=now[S]==before[S])
 e['restoredCoverageRuleLoaded']=SUMMARY_NOTE in req
 put(H/(case+'.json'),e);archive(case)
 assert e['threshold15Loaded'] and e['oldChroniclesUnchanged'] and e['oldSummariesUnchanged'] and sorted(int(x) for x in hidden(r))==list(range(1,16))
 if case=='summary':assert e['onlyOneNewSummary'] and e['noNewChronicle'] and e['relationsUnchanged']
 else:
  assert e['newCodes']==['AM0016'] and e['fullMaximumLoaded'] and e['stageSummaryUnchanged'] and len(now[R])==8
  rel={tuple(x[1:5]):x for x in now[R][1:]}
  assert rel[('黄泉','黎舟','青竹伞','借入')][5]=='已归还'
  rumor=rel[('黄泉','黎舟','转述传闻','可信度')];assert rumor[5]=='不信' and all(n in rumor[7] for n in ('御临风','黄泉','黎舟'))
 print(json.dumps({k:v for k,v in e.items() if k!='tables'},ensure_ascii=False,indent=2))

def restore_summary():
 assert not (H/'summary-original-failure.json').exists()
 shutil.copyfile(H/'summary.json',H/'summary-original-failure.json')
 shutil.copytree(L/'results/summary',L/'results/summary-original-failure')
 shutil.copyfile(H/'summary-input.json',H/'summary-original-input.json')
 r=a.rows(L/'results/initial/chat.jsonl');original_tables=tables(r);before=copy.deepcopy(r);changed=0;old_notes=set()
 def patch(x):
  nonlocal changed
  if isinstance(x,dict):
   if x.get('name')=='大总结' and 'sourceData' in x:
    old_notes.add(x['sourceData']['note']);x['sourceData']['note']=SUMMARY_NOTE;changed+=1
   if isinstance(x.get('templateStr'),str):
    t=json.loads(x['templateStr']);patch(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
   for v in x.values():patch(v)
  elif isinstance(x,list):
   for v in x:patch(v)
 patch(r);assert changed>0 and tables(r)==original_tables and hidden(r)==[]
 a.write_rows(U/a.TESTPATH,r);shutil.copyfile(L/'results/initial/book.json',U/'worlds'/(d.p.lab.BOOK+'.json'))
 s=read(U/'settings.json');store,key,cfg=a.p.profile(s);tk=next(k for k in store if k.endswith('____default____template'));t=json.loads(store[tk]);patch(t);store[tk]=json.dumps(t,ensure_ascii=False);put(U/'settings.json',s)
 assert cfg['autoUpdateEnabled'] is False
 put(H/'summary-rule-candidate.json',{'scope':'isolated only; not adopted or installed formally','field':'大总结.sourceData.note','originalNotes':sorted(old_notes),'candidateNote':SUMMARY_NOTE,'restoredSource':'prompt-consolidation-lifecycle/candidate.py 大总结.note','thresholdInsertNodeUnchanged':True,'tableDataUnchanged':True,'patchOccurrences':changed})
 append('summary')
 assert read(H/'summary-input.json')==read(H/'summary-original-input.json')
 put(H/'same-input-proof.json',{'sameTables':True,'sameSummaryInput':True,'sameHiddenStart':True,'formalGlobalSystemUnchanged':a.p.profile(read(U/'settings.json'))[2]['charCardPrompt']==a.p.profile(read(a.F/'settings.json'))[2]['charCardPrompt'],'sameFormalPlugin':d.sha(d.SRC/'index.js')==read(H/'setup.json')['formalPluginSha256'],'onlyCandidateField':'大总结.sourceData.note'})
 print('Original failure preserved; same input restored with one summary-note field merged.')

def recall():
 r=rows();run=r[0]['chat_metadata']['memory_lifecycle_evidence'];qs=[q for q in run['requests'] if any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in q.get('messages',[]))];assert len(qs)==1
 q=qs[0];joined='\n'.join(m['content'] for m in q['messages'] if isinstance(m.get('content'),str));reply=[x['text'] for x in run['afterMessages'] if not x['user']][-1]
 base=read(H/'return.json')['tables'];summary=read(H/'summary.json')['newSummary'];initial=read(H/'initial.json')['tables'];without_summaries=joined
 for row in base[S][1:]:without_summaries=without_summaries.replace(row[1],'')
 lines=[x for x in joined.splitlines() if x.startswith('事项#')]
 old=a.rows(L/'results/return/chat.jsonl');texts=[x['mes'] for x in old[2:] if len(x.get('mes',''))>30]
 checks={'newStageSummaryLoaded':summary in joined,'oldStageSummaryLoaded':initial[S][1][1] in joined,'newAM0016Loaded':base[C][-1][4] in joined and 'AM0016' in joined,'hiddenChroniclesNotSeparatelyLoaded':all(row[4] not in without_summaries for row in initial[C][1:]),'originalPlotMessagesAbsent':all(x not in joined for x in texts),'noHistoricalChatRoleMessages':all(m['role']!='assistant' for m in q['messages']) and sum(m['role']=='user' for m in q['messages'])==1,'allSevenItemsLoaded':len(lines)==7,'allKnowledgeScopesLoaded':all(any(line.startswith('事项#'+str(row[0])+'：') and str(row[7]) in line for line in lines) for row in base[R][1:]),'privateCodeInMemory':'瓷雀二鸣' in joined,'privateCodeNotSpoken':'瓷雀二鸣' not in reply,'publicCodeRecalled':'苇灯六结' in reply,'tablesUnchanged':tables(r)==base,'hiddenUnchanged':hidden(r)==read(H/'return.json')['hidden']}
 e={'model':q['model'],'capturedSettingsEvents':len(run['requests']),'checks':checks,'memoryLines':lines,'newStageSummary':summary,'reply':reply};put(H/'recall.json',e)
 dest=archive('recall');put(dest/'request.json',q)
 print(json.dumps(e,ensure_ascii=False,indent=2));assert all(checks.values())

def protect():
 assert d.p.lab.snapshot()==read(H/'protected-before.json');assert all(d.sha(d.SRC/k)==v for k,v in read(H.parent/'chronicle-formal/installation.json')['installedHashes'].items())
 assert a.p.profile(read(a.F/'settings.json'))[2]['autoUpdateEnabled'] is False and a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 put(H/'protection.json',{'formalFilesUnchanged':len(d.p.lab.snapshot()),'formalPluginUnchanged':True,'formalAutoFillOff':True,'isolatedAutoFillOff':True,'actualModelRequests':log.count('Chat Completion request:'),'actualModelResponses':log.count('Chat Completion response:')})
 print('Formal files/plugin unchanged; automatic filling remains off.')

def restore_recall():
 assert not (H/'recall-original-failure.json').exists()
 shutil.copyfile(H/'recall.json',H/'recall-original-failure.json')
 shutil.copytree(L/'results/recall',L/'results/recall-original-failure')
 r=a.rows(L/'results/return/chat.jsonl');before=tables(r)
 r[0]['chat_metadata']['task_boundary_case']='阶段链知情读取同题复测；自动填表关闭'
 a.write_rows(U/a.TESTPATH,r)
 shutil.copyfile(L/'results/return/book.json',U/'worlds'/(d.p.lab.BOOK+'.json'))
 old='【独立关系事项：当前记录逐项读取，阶段总结不替代本表；不同事项同时成立，私念不授予NPC知情】'
 new='【独立关系事项：当前记录逐项读取，阶段总结不替代本表；不同事项同时成立；知情范围仅列已证获知者，在场不自动证明听见，未交代者保持未知；私念不授予NPC知情】'
 hashes=[]
 def patch(j):
  host=a.host_of(j);body=host['content'];assert body.count(old)==1
  host['content']=body.replace(old,new,1)
  hashes.append({'before':hashlib.sha256(body.encode()).hexdigest(),'after':hashlib.sha256(host['content'].encode()).hexdigest()})
 card=U/'characters'/(a.TEST+'.png');card.write_bytes(a.png(card,patch))
 assert tables(rows())==before==read(H/'return.json')['tables']
 put(H/'reader-rule-candidate.json',{'scope':'isolated only; not adopted or installed formally','oldHeader':old,'newHeader':new,'onlyHeaderChanged':True,'hostHashes':hashes,'sameReturnSnapshot':True,'sameQuestion':QUESTION,'sameModel':read(H/'recall-original-failure.json')['model'],'automaticFillingOff':a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False,'interpretation':'Unlisted witnesses remain unknown, not proved absent or ignorant.'})
 print('First recall failure preserved; restored same post-return tables and question; only isolated reader header changed.')

if __name__=='__main__':
 if sys.argv[1]=='append':append(sys.argv[2])
 else:globals()[sys.argv[1]]()
