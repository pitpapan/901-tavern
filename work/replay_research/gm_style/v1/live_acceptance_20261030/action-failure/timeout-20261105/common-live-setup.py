"""Creates three new isolated test cards/chats; never writes formal files."""
import json,shutil,subprocess,uuid
from pathlib import Path
import lab
H=Path(__file__).resolve().parent;R=H.parents[5];L=lab.L/'common-actions-20261106'
plan=json.loads((lab.L/'equipment-20261106/plan.json').read_text(encoding='utf8'));A=Path(plan['app']);D=Path(plan['data'])
assert A.is_relative_to(lab.L)
rows=[json.loads(s) for s in Path(plan['chat']).read_text(encoding='utf8').splitlines()]
lab.put(L/'root-template.json',rows[-1]['variables'][0]['stat_data']['901_rules_poc'])
subprocess.run(['node',str(H/'common-live-seed.mjs'),str(L)],check=True)
for public in ['901-opening-combat','901-rules-runtime']:
 for source in (R/'rules_engine').rglob('*.mjs'):
  if source.name.endswith('.test.mjs'):continue
  target=A/'public'/public/'work/rules_engine'/source.relative_to(R/'rules_engine');target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
for kind in ['charge','feint','trip']:
 name='901 常用战斗隔离 20261106 '+kind;target=D/'characters'/(name+'.png');assert not target.exists()
 shutil.copy2(D/'characters'/(plan['character']+'.png'),target)
 def transform(card):
  card['name']=name;card['chat']=name;card['first_mes']='隔离常用动作验收：御临风与黄泉在空旷练习场对练，当前轮到御临风。'+('两人相距6米。' if kind=='charge' else '两人相距1米。')+'武器已在手；没有其他人物。自动填表关闭；玩家动作须明确声明。此分支不计入正式剧情。'
  card['data']['name']=name;card['data']['first_mes']=card['first_mes'];card['data']['scenario']=card['first_mes']
  for script in card['data']['extensions']['tavern_helper']['scripts']:script['id']=str(uuid.uuid4())
 lab.card_transform(target,transform)
 root=json.loads((L/(kind+'-root.json')).read_text(encoding='utf8'))
 first=json.loads((L/'source-card.json').read_text(encoding='utf8'));transform(first)
 message={'name':name,'is_user':False,'is_system':False,'send_date':'2026-11-06','mes':first['first_mes'],'extra':{},'swipe_id':0,'variables':[{'stat_data':{'901_rules_poc':root},'display_data':{},'delta_data':{},'schema':{},'initialized_lorebooks':[]}]}
 config=rows[1].get('TavernDB_ACU_ScopedConfig')
 if config is not None:message['TavernDB_ACU_ScopedConfig']=config
 out=[{'chat_metadata':{},'user_name':'御临风','character_name':name},message]
 chat=D/'chats'/name/(name+'.jsonl');chat.parent.mkdir(parents=True,exist_ok=True);assert not chat.exists();chat.write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in out)+'\n',encoding='utf8');shutil.copy2(chat,L/(kind+'-seed.jsonl'))
lab.put(L/'live-plan.json',{'port':18112,'data':str(D),'characters':['901 常用战斗隔离 20261106 '+k for k in ['charge','feint','trip']]})
print('Created three isolated combat cards/chats at 18112; formal untouched.')
