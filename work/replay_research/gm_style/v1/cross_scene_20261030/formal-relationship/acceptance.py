"""Isolated acceptance of the installed formal host and scoped table rules."""
from integrate import *
A=Path('C:/Users/pit/AppData/Local/901-relationship-facts-evidence-20261105')
TEST=lab.NAME
TESTCHAT=lab.CHAT
TESTPATH=Path('chats')/TEST/(TESTCHAT+'.jsonl')

def recorder(name,chat):
 src=A/'characters'/(TEST+'.png')
 j=next(p.p.f.obj(v) for typ,v in p.p.f.card(src) if typ==b'tEXt' and v.startswith(b'chara\0'))
 rec=copy.deepcopy(next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集'))
 s=rec['content'].replace('localhost:18100','localhost:18101')
 s=s.replace('const NAME='+json.dumps(TEST,ensure_ascii=False)+',CHAT='+json.dumps(TESTCHAT,ensure_ascii=False)+';','const NAME='+json.dumps(name,ensure_ascii=False)+',CHAT='+json.dumps(chat,ensure_ascii=False)+';')
 s+='''
const check=doc.createElement('button');check.textContent='仅隔离：检查迁移加载';panel.append(check);
check.onclick=async()=>{if(!valid())return;const data=window.top.AutoCardUpdaterAPI.exportTableAsJson();const tables=Object.fromEntries(Object.entries(data).filter(([k])=>k.startsWith('sheet_')).map(([k,v])=>[k,v.content]));ctx().chatMetadata.relationship_load={name:NAME,chat:CHAT,messageCount:ctx().chat.length,tables};ctx().updateChatMetadata(ctx().chatMetadata);await ctx().saveChat();status.textContent='迁移加载已保存：'+Object.keys(tables).length+'张表；'+ctx().chat.length+'条消息';};
'''
 rec['content']=s;return rec

def setup():
 assert not L.exists();U.mkdir(parents=True)
 shutil.copyfile(lab.APP/'config.yaml',L/'config.yaml')
 s=read(F/'settings.json');store,key,cfg=p.profile(s)
 assert cfg['autoUpdateEnabled'] is False
 for api in [cfg]+cfg['apiPresets']:
  api['apiMode']='custom';api['apiConfig'].update(useMainApi=True,apiKey='',url='',requestHeaders='')
 cfg['manualUpdateContextDepth']=1;cfg['skipUpdateFloors']=0
 store[key]=json.dumps(cfg,ensure_ascii=False);put(U/'settings.json',s)
 active=[r for r in read(F/'secrets.json')['api_key_custom'] if r.get('active')];assert len(active)==1
 put(U/'secrets.json',{'api_key_custom':active})
 for key in ('OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions'):
  shutil.copytree(F/key,U/key,ignore=shutil.ignore_patterns('.git','node_modules'))
 (U/'worlds').mkdir();(U/'characters').mkdir()
 for book in (F/'worlds').glob('901_0*.json'):shutil.copyfile(book,U/'worlds'/book.name)
 shutil.copyfile(F/'worlds/901_帝都重玩_T0_v1.json',U/'worlds/901_帝都重玩_T0_v1.json')
 (U/'User Avatars').mkdir();shutil.copyfile(F/'User Avatars/901-yulinfeng-t0-v1.png',U/'User Avatars/901-yulinfeng-t0-v1.png')
 (U/TARGET).parent.mkdir(parents=True);shutil.copyfile(F/TARGET,U/TARGET)
 def add(j):j['data']['extensions']['tavern_helper']['scripts'].append(recorder(NAME,CHAT))
 (U/'characters'/(NAME+'.png')).write_bytes(png(F/'characters'/(NAME+'.png'),add))
 print('18101 ready: installed host unchanged; copy of 31-message migrated chat; auto fill off.')

def check_load():
 r=rows(U/TARGET);e=r[0]['chat_metadata']['relationship_load']
 assert e['messageCount']==31 and len(e['tables'])==10 and len(e['tables'][schema.KEY])==1
 assert all(len(t)==1 for t in e['tables'].values())
 put(H/'migration-load.json',e);print('PASS: actual browser exports ten empty tables, 31 messages retained.')

def prepare_return():
 # Close the migration page first. Only this throwaway environment is replaced.
 original=rows(A/'results/recall/chat.jsonl');r=copy.deepcopy(original)
 template=read(H/'new-template.json')
 def formal_rules(x):
  if isinstance(x,dict):
   for k,v in list(x.items()):
    if k in template and isinstance(v,dict) and 'sourceData' in v:v['sourceData']=copy.deepcopy(template[k]['sourceData'])
    formal_rules(v)
   if isinstance(x.get('templateStr'),str):
    t=json.loads(x['templateStr']);formal_rules(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
  elif isinstance(x,list):
   for v in x:formal_rules(v)
 formal_rules(r)
 r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None)
 r[0]['chat_metadata']['task_boundary_case']='正式独立事项归还与知情更新'
 case=p.CASES['return'];before=p.v.latest_tables(r)
 r.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':case['input'],'extra':{}},{'name':TEST,'is_user':False,'is_system':False,'mes':case['reply'],'extra':{},'variables':copy.deepcopy(r[-1]['variables'])}])
 write_rows(U/TESTPATH,r);shutil.copyfile(A/'results/recall/book.json',U/'worlds'/(lab.BOOK+'.json'))
 installed=next(p.p.f.obj(v) for typ,v in p.p.f.card(F/'characters'/(NAME+'.png')) if typ==b'tEXt' and v.startswith(b'chara\0'))
 host=host_of(installed)['content']
 def add(j):host_of(j)['content']=host;next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集').update(recorder(TEST,TESTCHAT))
 (U/'characters'/(TEST+'.png')).write_bytes(png(A/'characters'/(TEST+'.png'),add))
 # Scope setup already selects the existing test card's six-book bindings.
 s=read(U/'settings.json');store,key,cfg=p.profile(s);tk=next(k for k in store if k.endswith('____default____template'))
 store[tk]=json.dumps(template,ensure_ascii=False);put(U/'settings.json',s)
 put(H/'return-input.json',{'input':case,'tablesBefore':before,'installedHostExact':True,'historyMode':'all','formalSystemUnchanged':True})
 print('Prepared same return input with exact installed host and formal scoped template rules.')

def inspect():
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 chunks=log.split('Chat Completion request:')[1:];hits=[x for x in chunks if p.CASES['return']['input'] in x.partition('Chat Completion response:')[0] and 'CREATE TABLE relationship_facts' in x]
 assert len(hits)==1,len(hits)
 import re
 req,_,resp=hits[0].partition('Chat Completion response:')
 r=rows(U/TESTPATH);t=p.v.latest_tables(r)
 # Node util.inspect prints multiline strings as quoted line concatenations.
 system=p.profile(read(F/'settings.json'))[2]['charCardPrompt'][0]['content']
 positions=[req.find(line) for line in system.splitlines()]
 e={'model':re.search(r"\bmodel: '([^']+)'",req).group(1),'actualFillRequests':len(hits),'newDdlLoaded':'CREATE TABLE relationship_facts' in req,'knowledgeRuleLoaded':schema.RULES['独立关系事项']['updateNode'] in req,'formalSystemLoaded':all(i>=0 for i in positions) and positions==sorted(positions),'sql':[x.strip() for x in resp.splitlines() if any(z in x for z in ('INSERT INTO','UPDATE ','DELETE FROM'))],'tables':t}
 put(H/'return.json',e)
 d={tuple(x[1:5]):x for x in t[schema.KEY][1:]}
 assert len(d)==7
 assert d[('黄泉','黎舟','青竹伞','借入')][5]=='已归还'
 rumor=d[('黄泉','黎舟','转述传闻','可信度')];assert rumor[5]=='不信' and all(n in rumor[7] for n in ('御临风','黄泉','黎舟'))
 assert all(e[k] for k in ('newDdlLoaded','knowledgeRuleLoaded','formalSystemLoaded'))
 print(json.dumps({k:v for k,v in e.items() if k!='tables'},ensure_ascii=False,indent=2))

def recall():
 r=rows(U/TESTPATH);run=r[0]['chat_metadata']['memory_lifecycle_evidence']
 qs=[q for q in run['requests'] if any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in q.get('messages',[]))];assert len(qs)==1
 q=qs[0];joined='\n'.join(x['content'] for x in q['messages'] if isinstance(x.get('content'),str));reply=run['afterMessages'][-1]['text']
 e={'model':q['model'],'readerLoaded':'【独立关系事项：' in joined,'memoryLines':[x for x in joined.splitlines() if x.startswith('事项#')],'privateCodeNotSpoken':'瓷雀二鸣' not in reply,'reply':reply,'historyMode':'all (exact formal host)'}
 assert e['readerLoaded'] and len(e['memoryLines'])==7 and e['privateCodeNotSpoken']
 put(H/'recall.json',e)
 dest=L/'evidence';dest.mkdir(exist_ok=True);put(dest/'request.json',q);shutil.copyfile(U/TESTPATH,dest/'chat.jsonl');shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),dest/'book.json')
 print(json.dumps(e,ensure_ascii=False,indent=2))

if __name__=='__main__':globals()[sys.argv[1]]()
