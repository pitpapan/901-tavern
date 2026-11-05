from pathlib import Path
import sys,json,copy,importlib.util,shutil,re
H=Path(__file__).resolve().parent
sys.path.insert(0,str(H.parent/'formal-relationship'))
spec=importlib.util.spec_from_file_location('sequence_acceptance',H.parent/'formal-relationship/acceptance.py')
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
L=Path('C:/Users/pit/AppData/Local/901-chronicle-sequence-20261105');U=L/'data/default-user'
read=a.read;put=a.put;rows=a.rows;lab=a.lab
CHRONICLE='sheet_ji_yao_biao'
def bind():a.H=H;a.L=L;a.U=U

def prepare():
 put(H/'protected-before.json',lab.snapshot())
 bind();a.setup()
 shutil.copyfile(H.parent/'formal-relationship/new-template.json',H/'new-template.json')
 a.prepare_return()
 card=U/'characters'/(a.TEST+'.png')
 def update(j):
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
  rec['content']=rec['content'].replace('localhost:18101','localhost:18102')
 card.write_bytes(a.png(card,update))
 r=rows(U/a.TESTPATH);r[0]['chat_metadata']['task_boundary_case']='隐藏15条历史后的编号续接'
 a.write_rows(U/a.TESTPATH,r)
 put(H/'baseline.json',{'tables':a.p.v.latest_tables(r),'hidden':r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']})
 put(L/'active.json',{'case':'first','requestStart':0})
 print('18102 same-input fixture ready, hidden rows 1-15; auto off; model unchanged.')

def inspect():
 active=read(L/'active.json');case=active['case']
 chunks=(L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:')[1:][active['requestStart']:]
 hits=[s for s in chunks if 'CREATE TABLE chronicle' in s and 'Chat Completion response:' in s];assert len(hits)==1,len(hits)
 req,_,response=hits[0].partition('Chat Completion response:')
 r=rows(U/a.TESTPATH);tables=a.p.v.latest_tables(r)
 before=read(H/('baseline.json' if case=='first' else 'first.json'))['tables']
 prior=before[CHRONICLE][1:];now=tables[CHRONICLE][1:]
 max_code=max(int(x[1][2:]) for x in prior);added=now[len(prior):]
 hidden=r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']
 e={'case':case,'model':re.search(r"\bmodel: '([^']+)'",req).group(1),'actualFillRequests':len(hits),'fullHistoryMaximum':max_code,'computedSequenceHintLoaded':f'最大编号AM{max_code:04d}，下一个AM{max_code+1:04d}' in req,'oldChroniclesByteEquivalent':now[:len(prior)]==prior,'newCodes':[x[1] for x in added],'uniqueCodes':len(set(x[1] for x in now))==len(now),'hiddenIdsUnchanged':hidden==read(H/'baseline.json')['hidden'],'oldSummariesUnchanged':tables['sheet_da_zong_jie']==before['sheet_da_zong_jie'],'sql':[x.strip() for x in response.splitlines() if any(k in x for k in ('INSERT INTO','UPDATE ','DELETE FROM'))],'tables':tables}
 put(H/(case+'.json'),e)
 d=L/'results'/case;d.mkdir(parents=True,exist_ok=True);shutil.copyfile(U/a.TESTPATH,d/'chat.jsonl')
 shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),d/'book.json')
 assert e['computedSequenceHintLoaded'] and e['oldChroniclesByteEquivalent'] and e['uniqueCodes'] and e['hiddenIdsUnchanged'] and e['oldSummariesUnchanged']
 assert len(added)==1 and added[0][1]==f'AM{max_code+1:04d}'
 print(json.dumps({k:v for k,v in e.items() if k!='tables'},ensure_ascii=False,indent=2))

def second():
 r=rows(U/a.TESTPATH);before=a.p.v.latest_tables(r);assert before[CHRONICLE][-1][1]=='AM0016'
 text='黎舟当着御临风和黄泉的面，把已收回的青竹伞放进自己的柜子，说：“伞收好了。”[瓷雀二鸣仍是我没有告诉任何人的备用记号。]'
 reply='黎舟收好青竹伞，柜门合上。黄泉在旁看见，没有改变对修伞与传闻的态度。'
 r.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':text,'extra':{}},{'name':a.TEST,'is_user':False,'is_system':False,'mes':reply,'extra':{},'variables':copy.deepcopy(r[-1]['variables'])}])
 r[0]['chat_metadata']['task_boundary_case']='重新加载后继续追加AM0017'
 a.write_rows(U/a.TESTPATH,r)
 count=(L/'stdout.log').read_text(encoding='utf8').count('Chat Completion request:')
 put(L/'active.json',{'case':'second','requestStart':count});put(H/'second-input.json',{'input':text,'reply':reply,'priorChronicleCount':len(before[CHRONICLE])-1})
 card=U/'characters'/(a.TEST+'.png')
 def diagnostic(j):
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
  old="status.textContent='迁移加载已保存：'+Object.keys(tables).length+'张表；'+ctx().chat.length+'条消息';"
  assert old in rec['content']
  rec['content']=rec['content'].replace('仅隔离：检查迁移加载','仅隔离：检查纪要落盘').replace(old,"const codes=tables.sheet_ji_yao_biao.slice(1).map(r=>Number(String(r[1]).slice(2)));status.textContent='纪要读取已保存：'+codes.length+'条；最大AM'+String(Math.max(0,...codes)).padStart(4,'0');")
 card.write_bytes(a.png(card,diagnostic))
 print('Second distinct event ready after persisted AM0016; reopen in a new tab.')

def check_reload():
 r=rows(U/a.TESTPATH);tables=r[0]['chat_metadata']['relationship_load']['tables']
 prior=read(H/'first.json')['tables']
 assert tables[CHRONICLE]==prior[CHRONICLE]
 assert tables['sheet_da_zong_jie']==prior['sheet_da_zong_jie']
 put(H/'reload.json',{'actualBrowserRuntimeRows':len(tables[CHRONICLE])-1,'lastCode':tables[CHRONICLE][-1][1],'all16RowsEqualPersistedFirst':True,'summariesEqual':True})
 print('Actual browser reload exported all 16 unchanged rows through AM0016.')

def protect():
 assert lab.snapshot()==read(H/'protected-before.json');print('All original and newly installed formal files unchanged:',len(lab.snapshot()))

if __name__=='__main__':globals()[sys.argv[1]]()
