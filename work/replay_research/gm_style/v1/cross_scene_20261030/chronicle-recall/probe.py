"""Next-turn narrative acceptance of the installed build, on a disposable copy."""
from pathlib import Path
import importlib.util,json,sys,shutil,hashlib,copy
H=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('chronicle_deploy',H.parent/'chronicle-formal/deploy.py')
d=importlib.util.module_from_spec(spec);spec.loader.exec_module(d)
L=Path('C:/Users/pit/AppData/Local/901-chronicle-recall-20261105');U=L/'data/default-user'
A=Path('C:/Users/pit/AppData/Local/901-chronicle-formal-evidence-20261105')
read=d.read;put=d.put;a=d.p.a
QUESTION='我问黄泉：“青竹伞原来是谁向谁借的，现在还欠着吗？你对黎舟修伞和他转述的传闻分别怎么看？刚才你说这些时，谁在场听见？我有没有告诉过你备用记号？”我等她回答。'

def prepare():
 put(H/'protected-before.json',d.p.lab.snapshot())
 installed=read(H.parent/'chronicle-formal/installation.json')['installedHashes']
 assert all(d.sha(d.SRC/k)==v for k,v in installed.items())
 d.H=H;d.L=L;d.U=U;d.setup()
 r=a.rows(A/'reload/chat.jsonl');r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None);r[0]['chat_metadata'].pop('relationship_load',None)
 r[0]['chat_metadata']['task_boundary_case']='正式纪要与独立事项盲续写；自动填表关闭'
 a.write_rows(U/a.TESTPATH,r)
 shutil.copyfile(A/'results/first/book.json',U/'worlds'/(d.p.lab.BOOK+'.json'))
 original_host=[];isolated_host=[]
 def patch(j):
  host=a.host_of(j);original_host.append(host['content'])
  assert host['content'].count("max_chat_history:'all'")==1
  host['content']=host['content'].replace("max_chat_history:'all'","max_chat_history:0",1);isolated_host.append(host['content'])
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
  rec['content']=rec['content'].replace('localhost:18103','localhost:18104').replace("status.textContent='待执行；不要发送剧情消息';","status.textContent='请先开始采集，再发送续写验收问题；不填表';")
  rec['content']+="\nbtn.remove();\n"
 card=U/'characters'/(a.TEST+'.png');card.write_bytes(a.png(card,patch))
 assert all(x==original_host[0] for x in original_host)
 assert isolated_host[0].replace('max_chat_history:0',"max_chat_history:'all'",1)==original_host[0]
 tables=a.p.v.latest_tables(r);assert len(tables[d.p.CHRONICLE])==17 and tables[d.p.CHRONICLE][-1][1]=='AM0016'
 put(H/'baseline.json',{'tables':tables,'messageCount':len(r)-1,'hidden':r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']})
 put(H/'setup.json',{'port':18104,'source':str(A/'reload/chat.jsonl'),'formalPluginSha256':d.sha(d.SRC/'index.js'),'formalHostSha256':hashlib.sha256(original_host[0].encode()).hexdigest(),'isolatedHostSha256':hashlib.sha256(isolated_host[0].encode()).hexdigest(),'onlyHostChange':'max_chat_history all -> 0 (test copy only)','question':QUESTION,'autoFillOff':a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False})
 (H/'question.txt').write_text(QUESTION,encoding='utf8')
 # Replace inherited installation-test metadata with this run's actual scope.
 put(H/'isolation.json',{'port':18104,'pluginMode':'installed global extension','historyMode':'0 (isolated test only)','manualFillButtonRemoved':True})
 # Bootstrap artifacts describe the superseded pre-return fixture, not this run.
 for name in ('return-input.json','new-template.json'):(H/name).unlink()
 print('18104 restored AM0016 and all seven items; only isolated history window changed; no fill.')

def inspect():
 r=a.rows(U/a.TESTPATH);run=r[0]['chat_metadata']['memory_lifecycle_evidence']
 requests=run['requests'];qs=[q for q in requests if any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in q.get('messages',[]))];assert len(qs)==1
 q=qs[0];joined='\n'.join(m['content'] for m in q['messages'] if isinstance(m.get('content'),str))
 reply=[x['text'] for x in run['afterMessages'] if not x['user']][-1]
 base=read(H/'baseline.json');chronicle=base['tables'][d.p.CHRONICLE][-1];table_now=a.p.v.latest_tables(r)
 lines=[x for x in joined.splitlines() if x.startswith('事项#')]
 # Entire old player/GM messages must be absent; memory prose can legitimately overlap facts.
 old=a.rows(A/'reload/chat.jsonl')
 # The first greeting is also the card's scenario text; it contains no tested
 # return/relationship facts and remains part of the unchanged formal card.
 old_texts=[x['mes'] for x in old[2:] if len(x.get('mes',''))>30]
 e={'model':q['model'],'capturedRequests':len(requests),'oldChatMessagesAbsent':all(x not in joined for x in old_texts),'newChronicleCodeLoaded':'AM0016' in joined,'newChronicleTextLoaded':chronicle[4] in joined,'independentReaderLoaded':'【独立关系事项：' in joined,'memoryLines':lines,'relationshipCount':len(lines),'privateCodeInMemoryWithUnspokenBoundary':chronicle[4] in joined and '未将心中的备用记号' in chronicle[4],'privateCodeNotInReply':'瓷雀二鸣' not in reply,'tablesUnchanged':table_now==base['tables'],'hiddenUnchanged':r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']==base['hidden'],'question':QUESTION,'reply':reply}
 e['sharedCardOpeningStillPresent']=old[1]['mes'] in joined
 e['noHistoricalChatRoleMessages']=all(m['role']!='assistant' for m in q['messages']) and sum(m['role']=='user' for m in q['messages'])==1
 relations=base['tables']['sheet_relationship_facts'][1:]
 e['allKnowledgeScopesLoaded']=all(any(line.startswith('事项#'+str(row[0])+'：') and str(row[7]) in line for line in lines) for row in relations)
 put(H/'recall.json',e)
 evidence=L/'evidence';evidence.mkdir(exist_ok=True);put(evidence/'request.json',q);shutil.copyfile(U/a.TESTPATH,evidence/'chat.jsonl');shutil.copyfile(U/'worlds'/(d.p.lab.BOOK+'.json'),evidence/'book.json')
 assert e['oldChatMessagesAbsent'] and e['newChronicleCodeLoaded'] and e['newChronicleTextLoaded'] and e['independentReaderLoaded'] and len(lines)==7
 assert e['privateCodeNotInReply'] and e['tablesUnchanged'] and e['hiddenUnchanged'] and e['allKnowledgeScopesLoaded'] and e['noHistoricalChatRoleMessages']
 print(json.dumps(e,ensure_ascii=False,indent=2))

def protect():
 assert d.p.lab.snapshot()==read(H/'protected-before.json')
 assert all(d.sha(d.SRC/k)==v for k,v in read(H.parent/'chronicle-formal/installation.json')['installedHashes'].items())
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 cfg=a.p.profile(read(U/'settings.json'))[2];assert cfg['autoUpdateEnabled'] is False
 formal=a.p.profile(read(a.F/'settings.json'))[2];assert formal['autoUpdateEnabled'] is False
 put(H/'protection.json',{'formalFilesUnchanged':len(d.p.lab.snapshot()),'formalPluginUnchanged':True,'formalAutoFillOff':True,'isolatedAutoFillOff':True,'actualModelRequests':log.count('Chat Completion request:'),'actualModelResponses':log.count('Chat Completion response:')})
 print('Formal files and plugin unchanged; both auto-fill flags off.')

if __name__=='__main__':globals()[sys.argv[1]]()
