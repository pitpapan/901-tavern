from pathlib import Path
import json,shutil,uuid,subprocess
import lab
H=Path(__file__).resolve().parent;L=lab.L/'common-full-live-20261106';L.mkdir(exist_ok=True)
plan=json.loads((lab.L/'equipment-20261106/plan.json').read_text(encoding='utf8'));D=Path(plan['data']);A=Path(plan['app']);assert A.is_relative_to(lab.L)
lab.put(L/'formal-before.json',lab.snapshot());shutil.copy2(D/'settings.json',L/'settings-before.json')
subprocess.run(['node',str(H/'common-full-seed.mjs'),str(L)],check=True)
cases=json.loads((L/'cases.json').read_text(encoding='utf8'));name='901 全项战斗真实模型验收 20261106';card=D/'characters'/(name+'.png');assert not card.exists();shutil.copy2(D/'characters'/(plan['character']+'.png'),card)
def transform(j):
 j['name']=name;j['chat']=cases[0]['name'];j['first_mes']=cases[0]['first'];j['data']['name']=name;j['data']['first_mes']=j['first_mes'];j['data']['scenario']='明确非剧情的常用动作全项试验，当前状态以各独立聊天种子与程序结算为准。试验陪练不是原团人物。'
 for s in j['data']['extensions']['tavern_helper']['scripts']:s['id']=str(uuid.uuid4())
lab.card_transform(card,transform)
old=[json.loads(x) for x in Path(plan['chat']).read_text(encoding='utf8').splitlines()]
for case in cases:
 root=json.loads((L/(case['id']+'-root.json')).read_text(encoding='utf8'));v={'stat_data':{'901_rules_poc':root},'display_data':{},'delta_data':{},'schema':{},'initialized_lorebooks':[]}
 m={'name':name,'is_user':False,'is_system':False,'send_date':'2026-11-06','mes':case['first'],'extra':{},'swipe_id':0,'variables':[v],'TavernDB_ACU_ScopedConfig':old[1]['TavernDB_ACU_ScopedConfig']}
 rows=[{'chat_metadata':{},'user_name':'御临风','character_name':name},m];f=D/'chats'/name/(case['name']+'.jsonl');f.parent.mkdir(exist_ok=True);assert not f.exists();f.write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in rows)+'\n',encoding='utf8');shutil.copy2(f,L/(case['id']+'-seed.jsonl'))
lab.put(L/'plan.json',{'port':18112,'app':str(A),'data':str(D),'character':name,'cases':[{k:v for k,v in c.items() if k!='panels'} for c in cases]});print('Created one isolated card with 13 separate test chats; formal untouched.')
