"""Adopt relationship memory in a new formal card/chat; never rewrite old saves."""
from pathlib import Path
import sys,importlib.util,json,copy,hashlib,base64,struct,zlib,shutil,os,tempfile
H=Path(__file__).resolve().parent
sys.path.insert(0,str(H.parent/'relationship-facts'))
spec=importlib.util.spec_from_file_location('facts_probe',H.parent/'relationship-facts/probe.py')
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
schema=p.schema;lab=p.lab;read=p.read;put=lab.put
F=lab.FORMAL
NAME='901 帝都初始卡 独立事项版 20261105'
CHAT='901 原聊天迁移副本 20261105'
SOURCE=Path('chats/901 帝都初始卡/901 初始卡石像撤离实测 - 2026-10-22.jsonl')
TARGET=Path('chats')/NAME/(CHAT+'.jsonl')
L=Path('C:/Users/pit/AppData/Local/901-formal-relationship-20261105')
U=L/'data/default-user'
sha=lambda b:hashlib.sha256(b).hexdigest()
TARGET_RULES={k:schema.RULES[k] for k in ('重要角色表','独立关系事项','大总结')}

def patch(x):
 if isinstance(x,dict):
  for v in list(x.values()):patch(v)
  if isinstance(x.get('templateStr'),str):
   t=json.loads(x['templateStr']);patch(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
  npc=x.get('sheet_zhong_yao_jue_se_biao')
  if isinstance(npc,dict) and 'sourceData' in npc and schema.KEY not in x:x[schema.KEY]=schema.table(npc)
  if isinstance(x.get('name'),str) and x['name'] in TARGET_RULES and 'sourceData' in x:
   x['sourceData'].update(copy.deepcopy(TARGET_RULES[x['name']]))
   if x['name']=='重要角色表':
    for row in x.get('content',[])[1:]:
     assert row[9] in (None,''),'Nonempty old relation requires explicit migration'
     row[9]=None
 elif isinstance(x,list):
  for v in x:patch(v)

def png(src,transform):
 out=bytearray(src.read_bytes()[:8]);count=0
 for typ,data in p.p.f.card(src):
  if typ==b'tEXt' and data.split(b'\0',1)[0] in (b'chara',b'ccv3'):
   j=p.p.f.obj(data);transform(j);data=data.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode());count+=1
  out.extend(struct.pack('>I',len(data))+typ+data+struct.pack('>I',zlib.crc32(typ+data)))
 assert count;return out

def host_of(j):return next(s for s in j['data']['extensions']['tavern_helper']['scripts'] if s['name']=='901 帝都初始卡入口')
def rows(path):return [json.loads(x) for x in path.read_text(encoding='utf8').splitlines()]
def write_rows(path,r):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in r),encoding='utf8')

def prepare():
 if (H/'protected-before.json').exists():assert lab.snapshot()==read(H/'protected-before.json')
 else:put(H/'protected-before.json',lab.snapshot())
 original=rows(F/SOURCE);r=copy.deepcopy(original)
 before=p.v.latest_tables(r);assert all(len(v)==1 for v in before.values()),'Expected empty formal tables'
 patch(r)
 meta=r[0]['chat_metadata']
 for field in ('TavernDB_ACU_ScopedConfig','TavernDB_ACU_InternalSheetGuide'):meta[field+'__chatId']=CHAT
 meta['901_relationship_migration']={'source':str(SOURCE),'version':1,'relationshipsMigrated':0,'reason':'All nine source tables empty; no inferred reconstruction'}
 after=p.v.latest_tables(r);assert set(after)==set(before)|{schema.KEY}
 assert all(after[k]==v for k,v in before.items())
 for a,b in zip(original,r):
  for k in ('mes','swipes','swipe_info','variables','is_user','send_date'):assert a.get(k)==b.get(k),(k,'changed')
 write_rows(H/'new-chat.jsonl',r)
 template=json.loads(meta['TavernDB_ACU_ScopedConfig']['template']['']['templateStr'])
 put(H/'new-template.json',template)
 reader=(H.parent/'relationship-facts/reader.mjs').read_text(encoding='utf8').replace('export function ','function ')
 def transform(j):
  j['name']=NAME;j['data']['name']=NAME;j['chat']=CHAT
  host=host_of(j);body=host['content'];anchor="{role:'system',content:style}"
  assert body.count(anchor)==1 and "max_chat_history:'all'" in body
  host['content']=reader+'\n'+body.replace(anchor,anchor+",{role:'system',content:renderRelationshipFacts(window.top.AutoCardUpdaterAPI.exportTableAsJson())}")
  # Review artifact normalizes legacy CRCRLF; embedded installed code stays exact.
  (H/'host.js').write_bytes((host['content'].replace('\r','').rstrip()+'\n').encode())
 (H/'new-card.png').write_bytes(png(F/'characters/901 帝都初始卡.png',transform))
 put(H/'migration.json',{'source':str(F/SOURCE),'target':str(F/TARGET),'messages':len(r)-1,'allMessageTextSwipesAndVariablesPreserved':True,'oldTableValuesPreserved':True,'oldTablesEmpty':True,'newRelationshipRows':0,'targetedRules':list(TARGET_RULES),'globalFillSystemUnchanged':True,'formalHistoryMode':'all'})
 print('Prepared new card/chat; 31 original messages preserved; new relationship table empty.')

def install():
 assert lab.snapshot()==read(H/'protected-before.json')
 card=F/'characters'/(NAME+'.png');chat=F/TARGET
 assert not card.exists() and not chat.exists()
 sfile=F/'settings.json';raw=sfile.read_bytes();s=json.loads(raw)
 assert p.profile(s)[2]['autoUpdateEnabled'] is False
 lore=s['world_info_settings']['world_info']['charLore'];source=next(x for x in lore if x['name']=='901 帝都初始卡')
 assert not any(x['name']==NAME for x in lore);new=copy.deepcopy(source);new['name']=NAME;lore.append(new)
 # Narrow JSON-string splice preserves all bytes except the appended character binding.
 needle=json.dumps(source,ensure_ascii=False,separators=(',',':')).encode()
 # The live file may be pretty-printed; match the exact charLore array instead.
 import re
 start=raw.index(b'"charLore"');a=raw.index(b'[',start);decoder=json.JSONDecoder();oldarr,n=decoder.raw_decode(raw[a:].decode())
 assert oldarr==lore[:-1]
 arrraw=raw[a:a+len(raw[a:].decode()[:n].encode())]
 updated=raw[:a]+arrraw[:-1]+b','+json.dumps(new,ensure_ascii=False).encode()+b']'+raw[a+len(arrraw):]
 assert json.loads(updated)==s
 card.write_bytes((H/'new-card.png').read_bytes());chat.parent.mkdir(parents=True);shutil.copyfile(H/'new-chat.jsonl',chat)
 assert sfile.read_bytes()==raw
 with tempfile.NamedTemporaryFile(dir=F,prefix='.901-rel-',suffix='.tmp',delete=False) as f:f.write(updated);tmp=Path(f.name)
 os.replace(tmp,sfile)
 put(H/'installation.json',{'card':str(card),'chat':str(chat),'cardSha256':sha(card.read_bytes()),'chatSha256':sha(chat.read_bytes()),'settingsBeforeSha256':sha(raw),'settingsAfterSha256':sha(updated),'settingsChange':'append only new card extraBooks binding','autoUpdateEnabled':False})
 verify()

def verify():
 before=read(H/'protected-before.json');after=lab.snapshot()
 assert all(k in after and after[k]==v for k,v in before.items() if k!='settings.json')
 cfg=p.profile(read(F/'settings.json'))[2];assert cfg['autoUpdateEnabled'] is False
 rec=read(H/'installation.json');assert sha((F/'settings.json').read_bytes())==rec['settingsAfterSha256']
 assert sha((F/'characters'/(NAME+'.png')).read_bytes())==rec['cardSha256']
 assert sha((F/TARGET).read_bytes())==rec['chatSha256']
 put(H/'protection.json',{'originalProtectedFilesUnchanged':len(before)-1,'settingsOnlyNewCardLoreBinding':True,'originalChatAndCardUnchanged':True,'newCopyUnmodifiedAfterInstall':True,'autoUpdateEnabled':False})
 print('Formal original files preserved; new copy installed; auto fill off.')

if __name__=='__main__':globals()[sys.argv[1]]()
