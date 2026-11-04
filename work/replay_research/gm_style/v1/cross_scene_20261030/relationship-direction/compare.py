"""Same-model isolated legacy control before repairing relationship/summary semantics."""
from pathlib import Path
import sys,json,copy,base64,struct,zlib,shutil,re,importlib.util
H=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('lifecycle',H.parent/'prompt-consolidation-lifecycle/probe.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
p=v.p;lab=v.lab;read=v.read;profile=v.profile
L=Path('C:/Users/pit/AppData/Local/901-relationship-direction-20261104');U=L/'data/default-user'
A=Path('C:/Users/pit/AppData/Local/901-memory-lifecycle-evidence-20261104')

def rows():return [json.loads(x) for x in (U/p.CHAT).read_text(encoding='utf8').splitlines()]
def write(r):(U/p.CHAT).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in r),encoding='utf8')
def sources(mode):
 if mode=='legacy':return read(H/'legacy-prompts.json'),read(H/'legacy-table-rules.json')
 spec=importlib.util.spec_from_file_location('repair_candidate',H/'candidate.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
 prompts=read(H/'legacy-prompts.json');prompts[0]['content']=c.SYSTEM
 rules=read(H/'legacy-table-rules.json')
 for n,r in c.RULES.items():rules[n].update(r)
 return prompts,rules
def patch_all(x,rules):
 if isinstance(x,dict):
  if isinstance(x.get('name'),str) and x['name'] in rules and 'sourceData'in x:
   assert x['sourceData']['ddl']==rules[x['name']]['ddl'];x['sourceData']=copy.deepcopy(rules[x['name']])
  if isinstance(x.get('templateStr'),str):
   t=json.loads(x['templateStr']);patch_all(t,rules);x['templateStr']=json.dumps(t,ensure_ascii=False)
  for child in x.values():patch_all(child,rules)
 elif isinstance(x,list):
  for child in x:patch_all(child,rules)
def configure(mode):
 prompts,rules=sources(mode);s=read(U/'settings.json');store,key,cfg=profile(s)
 cfg['charCardPrompt']=prompts;cfg['manualUpdateContextDepth']=1;cfg['skipUpdateFloors']=0;assert not cfg['autoUpdateEnabled']
 if mode=='repair':cfg['tableMaxRetries']=3 # isolated guard needs the existing correction loop; old controls used 1
 store[key]=json.dumps(cfg,ensure_ascii=False);tk=next(k for k in store if k.endswith('____default____template'));t=json.loads(store[tk]);patch_all(t,rules);store[tk]=json.dumps(t,ensure_ascii=False);lab.put(U/'settings.json',s)
 return rules
def seed(label,mode,source,case):
 # source archive is immutable evidence; source differs only when explicitly named.
 base=(A/'results'/source) if (A/'results'/source).exists() else L/'results'/source
 shutil.copyfile(base/'chat.jsonl',U/p.CHAT);shutil.copyfile(base/'book.json',U/'worlds'/(lab.BOOK+'.json'))
 rules=configure(mode);r=rows();patch_all(r,rules);r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None)
 r[0]['chat_metadata']['task_boundary_case']=label
 fixture=v.CASES[case];r.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':fixture['input'],'extra':{}},{'name':lab.NAME,'is_user':False,'is_system':False,'mes':fixture['reply'],'extra':{},'variables':copy.deepcopy(r[-1]['variables'])}]);write(r)
 lab.put(L/'active.json',{'label':label,'mode':mode,'source':str(base),'case':case,'input':fixture['input'],'requestStart':len((L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:'))-1 if (L/'stdout.log').exists() else 0})
 lab.put(H/(label+'-input.json'),{'source':str(base),'case':case,'messages':fixture,'tablesBefore':v.latest_tables(r),'scope':'isolated controlled test, not Canon'})
 print('Ready',label,mode,len(r)-1,'messages')
def prepare():
 assert not L.exists();lab.put(H/'protected-before.json',lab.snapshot())
 p.f.L=L;p.f.U=U;p.f.FILL_ADD+='\n'+p.EXPLICIT+'\n'+p.RULE;p.f.prepare()
 cfg=profile(read(lab.FORMAL/'settings.json'))[2];assert len(cfg['charCardPrompt'][0]['content'])==1533
 lab.put(H/'legacy-prompts.json',cfg['charCardPrompt']);shutil.copyfile(H.parent/'prompt-consolidation/table-rules.before.json',H/'legacy-table-rules.json')
 src=A/'characters'/(lab.NAME+'.png');out=bytearray(src.read_bytes()[:8])
 for typ,data in p.f.card(src):
  if typ==b'tEXt' and data.split(b'\0',1)[0] in (b'chara',b'ccv3'):
   j=p.f.obj(data);scripts=j['data']['extensions']['tavern_helper']['scripts'];rec=next(s for s in scripts if s['name']=='数据库事实验收采集');assert 'localhost:18098'in rec['content'];rec['content']=rec['content'].replace('localhost:18098','localhost:18099')
   data=data.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
  out.extend(struct.pack('>I',len(data))+typ+data+struct.pack('>I',zlib.crc32(typ+data)))
 (U/'characters'/src.name).write_bytes(out);seed('legacy-closeout','legacy','below','closeout')
def archive(label):
 d=L/'results'/label;d.mkdir(parents=True,exist_ok=True);shutil.copyfile(U/p.CHAT,d/'chat.jsonl');shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),d/'book.json');return d
def inspect():
 state=read(L/'active.json');prompts,rules=sources(state['mode']);r=rows()
 chunks=(L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:')[1:]
 chunks=chunks[state.get('requestStart',0):]
 hits=[x for x in chunks if state['input'] in x.partition('Chat Completion response:')[0] and prompts[0]['content'].splitlines()[0] in x.partition('Chat Completion response:')[0]];assert hits
 req,_,resp=hits[-1].partition('Chat Completion response:')
 e={'label':state['label'],'mode':state['mode'],'loadedSystem':all(x in req for x in prompts[0]['content'].splitlines()),'loadedRules':{n:all(piece in req for line in s['note'].splitlines() for piece in line.split('$RECENT_CHRONICLE_ROWS') if piece and not any(q in piece for q in ('\"', chr(39)))) for n,s in rules.items()},'loadedNpcUpdateLead':rules['重要角色表']['updateNode'].splitlines()[0] in req,'model':re.search(r"\bmodel: '([^']+)'",req).group(1),'sql':[x.strip() for x in resp.splitlines() if any(z in x for z in ('UPDATE ','INSERT INTO','DELETE FROM'))],'tables':v.latest_tables(r),'hidden':r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey']['']['hiddenRowIds']}
 e['attempts']=[{'guardFeedback':'[901关系分项校验]' in x.partition('Chat Completion response:')[0],'sql':[line.strip() for line in x.partition('Chat Completion response:')[2].splitlines() if any(z in line for z in ('UPDATE ','INSERT INTO','DELETE FROM'))]} for x in hits]
 archive(state['label']);lab.put(H/(state['label']+'.json'),e)
 print(json.dumps({k:w for k,w in e.items() if k!='tables'},ensure_ascii=False,indent=2)[:8500])
 print('NPC rows',json.dumps(e['tables'][v.NPC][1:],ensure_ascii=False));print('summary rows',json.dumps(e['tables'][v.SUMMARY][1:],ensure_ascii=False))
def recall(label):
 r=rows();run=r[0]['chat_metadata']['memory_lifecycle_evidence'];selected=[]
 for q in run['requests']:
  if any(m.get('role')=='user' and '裁定路径：'in str(m.get('content')) for m in q.get('messages',[])):selected.append(q)
 assert len(selected)==1;req=selected[0];joined='\n'.join(m['content'] for m in req['messages'] if isinstance(m.get('content'),str));reply=[m['text'] for m in run['afterMessages'] if not m['user']][-1]
 e={'label':label,'model':req['model'],'reply':reply,'oldChatAbsent':v.CASES['closeout']['input'] not in joined,'memoryLines':[x for x in joined.splitlines() if any(t in x for t in ('青竹伞','传闻','上一阶段','瓷雀二鸣','苇灯六结'))],'privateCodeNotSpoken':'瓷雀二鸣' not in reply}
 d=archive(label);lab.put(d/'request.json',req);lab.put(H/(label+'.json'),e);print(json.dumps(e,ensure_ascii=False,indent=2)[:7000])
if __name__=='__main__':
 a=sys.argv[1]
 if a=='prepare':prepare()
 elif a=='seed':seed(*sys.argv[2:])
 elif a=='inspect':inspect()
 elif a=='recall':recall(sys.argv[2])
 elif a=='protect':assert lab.snapshot()==read(H/'protected-before.json');print('Formal hashes unchanged:',len(lab.snapshot()))
