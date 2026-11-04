"""Bounded isolated lifecycle tests, controlled fixtures are not played Canon."""
from pathlib import Path
import sys,json,copy,base64,struct,zlib,shutil,re
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE.parent/'prompt-consolidation'))
import probe_consolidation as old
# Import candidate by explicit path: the previous module already imported its candidate.
import importlib.util
spec=importlib.util.spec_from_file_location('lifecycle_candidate',HERE/'candidate.py')
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
p=old.p;lab=p.lab;read=old.read;profile=old.profile
L=Path('C:/Users/pit/AppData/Local/901-memory-lifecycle-20261104');U=L/'data/default-user'
CHRON='sheet_ji_yao_biao';SUMMARY='sheet_da_zong_jie';NPC='sheet_zhong_yao_jue_se_biao';QUEST=p.KEY
RECALL='我问黄泉：“前些天大家当面约定的取物记号是什么？黎舟究竟做什么营生，你和掌柜、黎舟现在各是什么关系？铜钥匙、药包、限时凭证和替苏岚送信这几件事，各办到了哪一步？我有没有告诉过你另一个备用记号？”我等她回答。'
OLD_SUMMARY='上一阶段：御临风与黄泉结伴到客店；掌柜曾误称黎舟为信使。苏岚托御临风送封未拆的信给黎舟，御临风接下。黄泉听见这项约定。'
EVENTS=[
('身份订正','掌柜当着御临风和黄泉澄清：黎舟是修伞匠，先前称他信使是认错人。黎舟不曾承诺替人送信。'),
('取物约定','掌柜、御临风与黄泉当面约定取物记号“苇灯六结”；这只是取回寄存物的核验，不是新接头任务。'),
('私人备用','御临风心想[备用记号可以是瓷雀二鸣]，始终未说出口，也未写下；黄泉、掌柜和黎舟均不知情。'),
('共同赶路','一拨镇民经过，人数和来向都未交代；御临风与黄泉只听见谈笑，未辨认他们的身份。'),
('借伞未还','黎舟借黄泉一把青竹伞；黄泉答应归还，现在尚未归还。借物不代表亲属或恋人关系。'),
('旧债结清','掌柜付清先前欠黄泉的修缮费；双方旧债已结清，黄泉仍会按约付住宿钱。'),
('关系的两面','黄泉认可掌柜守约付清旧债，但因掌柜曾泄露她行程，不愿告诉他下一站；感谢与保留并存。御临风在场。'),
('持续送信','御临风已接下替苏岚把未拆信交给黎舟；信仍在御临风手里。黄泉知其有此托付，不知信中内容。'),
('铜钥匙委托','御临风接下掌柜寻找铜钥匙的委托，尚未找到，期限与奖罚未约定。黄泉知情。'),
('药包委托','御临风接下给黎舟送药包的委托；途中药包毁损，尚未向黎舟说明，当前尚未结案。'),
('限时凭证','掌柜交托御临风在2026年2月5日00:00前登记凭证；尚未登记。期限是当面明示的，奖励和惩罚均未约定。'),
('非敌非友','黄泉与黎舟仅合作修过伞，认可能力但不信他转述的传闻；黎舟本人没有证实传闻内容。'),
('暂时离场','苏岚暂时离开客店去买纸，未说永久离开。御临风仍欠她送信的答复，不应因为人不在场删去记录。'),
('阶段末时刻','当前已明确为2026年2月4日23:55，御临风、黄泉、掌柜和黎舟在客店。旧任务仍依上述进度，苏岚暂离。')]
CASES={
'below':{'input':'（桌外：核对现有记忆，本轮无新增剧情或状态变化，不重复记录。）','reply':'（桌外：无新增剧情。）'},
'closeout':{'input':'从已知的2026年2月4日23:55起，实际过了20分钟。我把找回的铜钥匙交还掌柜，他当面确认委托完成；我向黎舟说明药包已毁损无法交付，黎舟确认这项送药委托失败并结束。掌柜也核对了凭证仍未登记，确认限时委托已过期结束。替苏岚送信的委托仍未完成，信还在我手里。黄泉当着我对黎舟说：“你这回如实说明了情况，我现在信任你处理修伞的事，不过那把青竹伞我还没还。”她没有改变对掌柜保留下一站去向的态度。[我仍未把备用记号瓷雀二鸣告诉任何人。]',
'reply':'掌柜收回铜钥匙，确认寻钥委托完成，又确认凭证委托已逾期。黎舟接受送药失败的说明，结束这项委托。黄泉说明了对黎舟的新信任，仍欠着借伞；她和掌柜间已结清旧债，但对行程仍有所保留。苏岚暂时离场，未拆信仍由御临风持有，送信尚待完成。'},
'summary':{'input':'（桌外：整理当前可见纪要，本轮没有新增剧情、时间或关系变化；按已有阶段规则处理。）','reply':'（桌外：无新增剧情。）'},
'repeat':{'input':'（桌外：再核对一次；本轮没有新增剧情、时间或人物状态变化。）','reply':'（桌外：无新增剧情。）'}}

def rows():return [json.loads(x) for x in (U/p.CHAT).read_text(encoding='utf8').splitlines()]
def write_rows(r):(U/p.CHAT).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in r),encoding='utf8')
def append(case):
 r=rows();r[0]['chat_metadata']['task_boundary_case']=case
 inp=CASES[case];r.extend([{'name':'御临风','is_user':True,'is_system':False,'mes':inp['input'],'extra':{}},{'name':lab.NAME,'is_user':False,'is_system':False,'mes':inp['reply'],'extra':{},'variables':copy.deepcopy(r[-1]['variables'])}])
 write_rows(r);lab.put(L/'active-case.json',{'case':case});print('Ready:',case)

def prepare():
 assert not L.exists();lab.put(HERE/'protected-before.json',lab.snapshot())
 p.f.L=L;p.f.U=U;p.f.FILL_ADD+='\n'+p.EXPLICIT+'\n'+p.RULE;p.f.prepare()
 s=read(U/'settings.json');store,key,cfg=profile(s);cfg['charCardPrompt'][0]['content']=c.SYSTEM
 cfg['skipUpdateFloors']=0;cfg['manualUpdateContextDepth']=1;assert not cfg['autoUpdateEnabled']
 store[key]=json.dumps(cfg,ensure_ascii=False);tk=next(k for k in store if k.endswith('____default____template'));tpl=json.loads(store[tk]);c.patch(tpl);store[tk]=json.dumps(tpl,ensure_ascii=False);lab.put(U/'settings.json',s)
 lab.put(HERE/'prompts.candidate.json',cfg['charCardPrompt']);lab.put(HERE/'cases.json',CASES)
 r=rows();meta=r[0]['chat_metadata'];scope=meta['TavernDB_ACU_ScopedConfig']['template'][''];t=json.loads(scope['templateStr']);c.patch(t);scope['templateStr']=json.dumps(t,ensure_ascii=False)
 if isinstance(scope.get('guideData'),dict):c.patch(scope['guideData'])
 c.patch(meta['TavernDB_ACU_InternalSheetGuide']['tags']['']['data'])
 t=r[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']['checkpoint']['data'];c.patch(t)
 for v in t.values():
  if isinstance(v,dict) and 'content'in v:del v['content'][1:]
 t[CHRON]['content'] += [[i,f'AM{i:04d}','未交代',title,body,''] for i,(title,body) in enumerate(EVENTS,1)]
 t[SUMMARY]['content'].append([1,OLD_SUMMARY])
 t['sheet_quan_ju_shu_ju_biao']['content'].append([1,'全局状态','客店',None,None,None,None,'2026-02-04 23:55'])
 t['sheet_zhu_jue_xin_xi_biao']['content'].append([1,'御临风',None,None,None,None,'代苏岚保管未拆信，仍待交黎舟','客店','苏岚的未拆信'])
 t['sheet_bei_bao_wu_pin_biao']['content'].append([1,'苏岚的未拆信','1','替苏岚交给黎舟，尚未交付','信件'])
 t[NPC]['content'] += [
 [1,'黄泉',None,None,'御临风同行者',None,None,'客店','在场','御临风:同行;掌柜:已结清旧债,仍不愿透露下一站;黎舟:合作修伞,借青竹伞未还,尚不信其传闻','见当前纪要；不知道玩家私人备用记号',None],
 [2,'掌柜',None,None,'客店掌柜',None,None,'客店','在场','黄泉:已结清修缮旧债;御临风:委托寻钥及限时登记',None,None],
 [3,'黎舟',None,None,'修伞匠，并非信使',None,None,'客店','在场','黄泉:合作修伞,借出青竹伞未收回;御临风:送药委托尚未结案',None,None],
 [4,'苏岚',None,None,'委托御临风送信给黎舟',None,None,None,'暂时离场','御临风:已托送信,尚待完成','暂去买纸，并未永久离开',None]]
 t[QUEST]['content'] += [[1,'寻找铜钥匙',None,'掌柜','找回铜钥匙','尚未找到',None,None,None],[2,'送药给黎舟',None,'黎舟','交付药包','药包毁损尚未结案',None,None,None],[3,'登记限时凭证',None,'掌柜','登记凭证','未登记','2026-02-05 00:00',None,None],[4,'替苏岚送信',None,'苏岚','未拆信交给黎舟','尚未交付，仍由御临风持有',None,None,None]]
 write_rows(r);lab.put(HERE/'fixture.json',{'scope':'synthetic isolated fixtures only; not Canon','threshold':15,'initialChronicle':EVENTS,'oldSummary':OLD_SUMMARY,'recall':RECALL,'initialTables':t})
 # Recorder and zero-history recall are confined to the copied card.
 src=Path('C:/Users/pit/AppData/Local/901-prompt-consolidation-evidence-20261104/characters')/(lab.NAME+'.png')
 out=bytearray(src.read_bytes()[:8])
 for typ,v in p.f.card(src):
  if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
   j=p.f.obj(v);scripts=j['data']['extensions']['tavern_helper']['scripts'];host=next(s for s in scripts if s['name']=='901 帝都初始卡入口')
   assert host['content'].count("max_chat_history:'all'")==1
   host['content']=host['content'].replace("max_chat_history:'all'","max_chat_history:SillyTavern.chat.some(m=>m.is_user&&m.mes==="+json.dumps(RECALL,ensure_ascii=False)+")?0:'all'")
   rec=next(s for s in scripts if s['name']=='数据库事实验收采集');rec['content']=rec['content'].replace('localhost:18097','localhost:18098')
   rec['content'] += '\n'+(HERE/'recorder.js').read_text(encoding='utf8')
   v=v.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
  out.extend(struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v)))
 (U/'characters'/src.name).write_bytes(out);append('below')

def inspect(case):
 r=rows();entries=read(U/'worlds'/(lab.BOOK+'.json'))['entries']
 chunks=(L/'stdout.log').read_text(encoding='utf8',errors='replace').split('Chat Completion request:')[1:]
 hits=[x for x in chunks if CASES[case]['input'] in x.partition('Chat Completion response:')[0] and c.SYSTEM.splitlines()[0] in x.partition('Chat Completion response:')[0]]
 assert hits;req,_,resp=hits[-1].partition('Chat Completion response:')
 e={'case':case,'attempts':len(hits),'loadedSystem':all(x in req for x in c.SYSTEM.splitlines()),'loadedNotes':{n:all(x in req for x in v['note'].split('$RECENT_CHRONICLE_ROWS')) for n,v in c.RULES.items()},'threshold15':'可见纪要达到15条' in req,'model':re.search(r"\bmodel: '([^']+)'",req).group(1),'auto':profile(read(U/'settings.json'))[2]['autoUpdateEnabled'],'sqlLines':[x.strip() for x in resp.splitlines() if any(z in x for z in ['INSERT INTO','UPDATE ','DELETE FROM'])],'exports':{v['comment']:v['content'] for v in entries.values() if 'TavernDB-'in v.get('comment','') or v.get('comment','').startswith('大总结')},'flight':{k:v for k,v in r[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['flightModeByIsolationKey'][''].items() if k!='archive'}}
 e['tables']=latest_tables(r)
 e['loadedRelationUpdate']=c.RULES['重要角色表']['updateNode'] in req
 e['loadedSummaryInsert']=all(x in req for x in c.RULES['大总结']['insertNode'].split('$RECENT_CHRONICLE_ROWS'))
 lab.put(HERE/(case+'.json'),e);dest=L/'results'/case;dest.mkdir(parents=True,exist_ok=True);shutil.copyfile(U/p.CHAT,dest/'chat.jsonl');shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),dest/'book.json')
 print(json.dumps({k:v for k,v in e.items() if k not in ('exports','tables')},ensure_ascii=False,indent=2)[:9000])
 print('Exports:',[(v['comment'],v.get('disable')) for v in entries.values() if 'TavernDB-'in v.get('comment','') or v.get('comment','').startswith('大总结')])

def latest_tables(r):
 result={}
 for row in r:
  f=row.get('TavernDB_ACU_IsolatedData',{}).get('',{}).get('storageFrame',{})
  full=f.get('checkpoint',{}).get('data',{})
  for k,v in full.items():
   if isinstance(v,dict) and 'content'in v:result[k]=v['content']
  for k,v in f.get('perSheetCheckpoints',{}).items():result[k]=v['data']['content']
 return result

def retry(label='first'):
 # Preserve the real failure, restore only this disposable chat to its below result.
 shutil.copytree(L/'results/closeout',L/('results/closeout-'+label+'-attempt'))
 shutil.copyfile(L/'results/below/chat.jsonl',U/p.CHAT)
 shutil.copyfile(L/'results/below/book.json',U/'worlds'/(lab.BOOK+'.json'))
 s=read(U/'settings.json');store,key,cfg=profile(s);cfg['charCardPrompt'][0]['content']=c.SYSTEM;store[key]=json.dumps(cfg,ensure_ascii=False)
 tk=next(k for k in store if k.endswith('____default____template'));t=json.loads(store[tk]);c.patch(t);store[tk]=json.dumps(t,ensure_ascii=False);lab.put(U/'settings.json',s)
 r=rows()
 def visit(x):
  if isinstance(x,dict):
   if 'sourceData'in x and x.get('name')in c.RULES:x['sourceData'].update(c.RULES[x['name']])
   if isinstance(x.get('templateStr'),str):
    t=json.loads(x['templateStr']);c.patch(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
   for v in x.values():visit(v)
  elif isinstance(x,list):
   for v in x:visit(v)
 visit(r);write_rows(r);append('closeout')

def recall():
 r=rows();run=r[0]['chat_metadata']['memory_lifecycle_evidence']
 selected=[]
 for q in run['requests']:
  msgs=q.get('messages',[])
  if not any(m.get('role')=='user' and '裁定路径：' in str(m.get('content')) for m in msgs):continue
  joined='\n'.join(m.get('content','') for m in msgs if isinstance(m.get('content'),str))
  selected.append((q,joined))
 assert selected,'Actual narrative request not captured'
 q,joined=selected[-1];summary=read(HERE/'summary.json')['tables'][SUMMARY][-1][1]
 replies=[x['text'] for x in run['afterMessages'] if not x['user']];assert replies
 reply=replies[-1]
 checks={'actualNarrativeRequestCaptured':True,'sameModel':q['model']=='[抗截断]gemini-3.8-flash','newStageSummaryLoaded':summary in joined,'oldStageSummaryLoaded':OLD_SUMMARY in joined,'originalCloseoutInputAbsent':CASES['closeout']['input'] not in joined,'originalCloseoutReplyAbsent':CASES['closeout']['reply'] not in joined,'privateCodePresentInMemory':'瓷雀二鸣' in joined,'privateCodeNotSpokenInReply':'瓷雀二鸣' not in reply,'publicCodeRecalled':'苇灯六结' in reply,'correctedProfessionRecalled':'修伞' in reply,'unfinishedLetterRecalled':'信' in reply and '黎舟' in reply,'autoOff':profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False}
 e={'model':q['model'],'capturedRequests':len(run['requests']),'narrativeRequests':len(selected),'input':RECALL,'reply':reply,'checks':checks,'memoryExcerpt':[line for line in joined.splitlines() if any(x in line for x in ('苇灯六结','瓷雀二鸣','上一阶段：'))]}
 lab.put(HERE/'recall.json',e);dest=L/'results/recall';dest.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(U/p.CHAT,dest/'chat.jsonl');shutil.copyfile(U/'worlds'/(lab.BOOK+'.json'),dest/'book.json');lab.put(dest/'request.json',q)
 print(json.dumps(e,ensure_ascii=False,indent=2)[:6500])

if __name__=='__main__':
 a=sys.argv[1]
 if a=='prepare':prepare()
 elif a=='retry':retry(sys.argv[2] if len(sys.argv)>2 else 'first')
 elif a=='recall':recall()
 elif a=='append':append(sys.argv[2])
 elif a=='inspect':inspect(sys.argv[2])
 elif a=='protect':
  assert lab.snapshot()==read(HERE/'protected-before.json');print('All formal files unchanged:',len(lab.snapshot()))
