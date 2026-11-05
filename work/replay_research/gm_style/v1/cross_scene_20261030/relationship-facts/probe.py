"""Disposable 18100 experiment. Never installs into the formal user or plugin."""
from pathlib import Path
import copy,json,sys,re,shutil,importlib.util,base64,struct,zlib
import schema
H=Path(__file__).resolve().parent
sp=importlib.util.spec_from_file_location('rel_previous_probe',H.parent/'relationship-direction/compare.py');old=importlib.util.module_from_spec(sp);sp.loader.exec_module(old)
v=old.v;p=old.p;lab=old.lab;read=old.read;profile=old.profile
L=Path('C:/Users/pit/AppData/Local/901-relationship-facts-20261105');U=L/'data/default-user'
A=Path('C:/Users/pit/AppData/Local/901-memory-lifecycle-evidence-20261104')
PREVIOUS=Path('C:/Users/pit/AppData/Local/901-relationship-direction-evidence-20261104')
CASES=copy.deepcopy(v.CASES)
CASES['return']={'input':'黄泉当着御临风把青竹伞归还黎舟，黎舟当面收妥。黄泉说：“伞还给你了。修伞仍信你，但你转述的传闻我仍不信。”[我仍未把备用记号瓷雀二鸣说出口。]', 'reply':'黎舟接回青竹伞，确认已经收妥。黄泉对修伞手艺的信任与对传闻的保留没有改变。'}
FOCUSED='我问黄泉：“你信任黎舟修伞，是否也相信他转述的传闻？那把青竹伞原来是谁向谁借的，现在还欠着吗？我有没有告诉过你备用记号？”我等她回答。'
def rows():return [json.loads(x) for x in (U/p.CHAT).read_text(encoding='utf8').splitlines()]
def write(r):(U/p.CHAT).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in r),encoding='utf8')
def patch_templates(x):
 if isinstance(x,dict):
  if isinstance(x.get('templateStr'),str):
   t=json.loads(x['templateStr']);schema.patch(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
  for y in x.values():patch_templates(y)
 elif isinstance(x,list):
  for y in x:patch_templates(y)
def prepare():
 if not L.exists():
  lab.put(H/'protected-before.json',lab.snapshot())
  p.f.L=L;p.f.U=U;p.f.FILL_ADD+='\n'+p.EXPLICIT+'\n'+p.RULE;p.f.prepare()
 else:assert (H/'protected-before.json').exists() and not (L/'stdout.log').exists(), 'Only resume interrupted pre-start fixture setup'
 s=read(U/'settings.json');store,key,cfg=profile(s)
 prompts=read(H.parent/'relationship-direction/legacy-prompts.json');prompts[0]['content']=schema.SYSTEM
 cfg.update(charCardPrompt=prompts,manualUpdateContextDepth=1,skipUpdateFloors=0,tableMaxRetries=2)
 assert cfg['autoUpdateEnabled'] is False
 store[key]=json.dumps(cfg,ensure_ascii=False)
 tk=next(k for k in store if k.endswith('____default____template'));t=json.loads(store[tk]);schema.patch(t);store[tk]=json.dumps(t,ensure_ascii=False);lab.put(U/'settings.json',s)
 r=[json.loads(x) for x in (A/'results/below/chat.jsonl').read_text(encoding='utf8').splitlines()]
 original=copy.deepcopy(v.latest_tables(r))
 full=copy.deepcopy(r[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']['checkpoint']['data'])
 for k,cp in r[-1]['TavernDB_ACU_IsolatedData']['']['storageFrame']['perSheetCheckpoints'].items():full[k]=copy.deepcopy(cp['data'])
 schema.patch(r);patch_templates(r);schema.patch(full)
 full[schema.KEY]=schema.table(full[v.NPC],schema.INITIAL)
 frame=copy.deepcopy(r[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']);frame['checkpoint']['data']=full;frame['logEntries']=[]
 r[-1]['TavernDB_ACU_IsolatedData']['']['storageFrame']=frame
 write(r);shutil.copyfile(A/'results/below/book.json',U/'worlds'/(lab.BOOK+'.json'))
 lab.put(H/'migration.json',{'source':str(A/'results/below'),'beforeTables':original,'afterTables':v.latest_tables(r),'relationships':schema.INITIAL,'tasks':'旧人物行的委托重复信息退出关系列；现有任务表与AM0008/9/10/11/13仍完整保留。仅受控夹具明确迁移，不宣称通用自动迁移。'})
 src=PREVIOUS/'characters'/(lab.NAME+'.png');out=bytearray(src.read_bytes()[:8]);reader=(H/'reader.mjs').read_text(encoding='utf8').replace('export function ','function ')
 for typ,data in p.f.card(src):
  if typ==b'tEXt' and data.split(b'\0',1)[0] in (b'chara',b'ccv3'):
   j=p.f.obj(data);scripts=j['data']['extensions']['tavern_helper']['scripts'];rec=next(x for x in scripts if x['name']=='数据库事实验收采集');rec['content']=rec['content'].replace('localhost:18099','localhost:18100')
   host=next(x for x in scripts if x['name']=='901 帝都初始卡入口');body=host['content'];anchor="{role:'system',content:style}";assert body.count(anchor)==1
   body=reader+'\n'+body.replace(anchor,anchor+",{role:'system',content:renderRelationshipFacts(window.top.AutoCardUpdaterAPI.exportTableAsJson())}")
   body,n=re.subn(r"max_chat_history:SillyTavern.chat.some\(.*?\)\?0:'all'","max_chat_history:0",body,flags=re.S);assert n==1
   host['content']=body
   data=data.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
  out.extend(struct.pack('>I',len(data))+typ+data+struct.pack('>I',zlib.crc32(typ+data)))
 (U/'characters'/src.name).write_bytes(out)
 lab.put(H/'cases.json',{'closeout':CASES['closeout'],'summary':CASES['summary'],'return':CASES['return'],'recall':v.RECALL,'focused':FOCUSED})
 archive('initial');append('closeout')
def append(case):
 r=rows();r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None);r[0]['chat_metadata']['task_boundary_case']='facts-'+case
 c=CASES[case];before=copy.deepcopy(v.latest_tables(r))
 r.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':c['input'],'extra':{}},{'name':lab.NAME,'is_user':False,'is_system':False,'mes':c['reply'],'extra':{},'variables':copy.deepcopy(r[-1]['variables'])}]);write(r)
 count=len((L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:'))-1 if (L/'stdout.log').exists() else 0
 lab.put(L/'active.json',{'case':case,'input':c['input'],'requestStart':count});lab.put(H/(case+'-input.json'),{'case':case,'messages':c,'tablesBefore':before});print('Ready',case,len(r)-1,'messages')
def archive(label):
 d=L/'results'/label;d.mkdir(parents=True,exist_ok=True);shutil.copyfile(U/p.CHAT,d/'chat.jsonl');shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),d/'book.json');return d
def inspect():
 a=read(L/'active.json');chunks=(L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:')[1:][a['requestStart']:]
 hits=[x for x in chunks if a['input'] in x.partition('Chat Completion response:')[0] and schema.SYSTEM.splitlines()[0] in x.partition('Chat Completion response:')[0]];assert hits
 req,_,resp=hits[-1].partition('Chat Completion response:');r=rows()
 e={'case':a['case'],'attempts':len(hits),'model':re.search(r"\bmodel: '([^']+)'",req).group(1),'newDdlLoaded':'CREATE TABLE relationship_facts' in req,'newRulesLoaded':schema.RULES['独立关系事项']['note'] in req,'oldRelationDisabled':schema.RULES['重要角色表']['note'] in req,'sql':[x.strip() for x in resp.splitlines() if any(z in x for z in ('INSERT INTO','UPDATE ','DELETE FROM'))],'tables':v.latest_tables(r),'hidden':r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']}
 e['knowledgeUpdateRuleLoaded']=schema.RULES['独立关系事项']['updateNode'] in req
 archive(a['case']);lab.put(H/(a['case']+'.json'),e);print(json.dumps({k:x for k,x in e.items() if k!='tables'},ensure_ascii=False,indent=2));print('RELATIONS',json.dumps(e['tables'].get(schema.KEY),ensure_ascii=False))
def recall(label):
 r=rows();run=r[0]['chat_metadata']['memory_lifecycle_evidence'];req=[q for q in run['requests'] if any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in q.get('messages',[]))];assert len(req)==1
 q=req[0];joined='\n'.join(m['content'] for m in q['messages'] if isinstance(m.get('content'),str));reply=[m['text'] for m in run['afterMessages'] if not m['user']][-1]
 e={'model':q['model'],'originalChatAbsent':CASES['closeout']['input'] not in joined and CASES['return']['input'] not in joined,'independentReaderLoaded':'【独立关系事项：' in joined,'privateCodeNotSpoken':'瓷雀二鸣' not in reply,'memoryLines':[x for x in joined.splitlines() if x.startswith('事项#')],'reply':reply}
 d=archive(label);lab.put(d/'request.json',q);lab.put(H/(label+'.json'),e);print(json.dumps(e,ensure_ascii=False,indent=2))
if __name__=='__main__':
 a=sys.argv[1]
 if a=='prepare':prepare()
 elif a=='append':append(sys.argv[2])
 elif a=='inspect':inspect()
 elif a=='recall':recall(sys.argv[2])
 elif a=='protect':assert lab.snapshot()==read(H/'protected-before.json');print('Unchanged formal files',len(lab.snapshot()))
