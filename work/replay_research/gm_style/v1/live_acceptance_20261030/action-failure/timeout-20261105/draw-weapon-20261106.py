"""Disposable 18115 copy for real-model draw acceptance; never writes 8000."""
import copy,json,shutil,subprocess,sys
from pathlib import Path
import lab
S=lab.L/'draw-weapon-20261106'; A=S/'app'; U=A/'data/default-user'
NAME='901 弃风拔出隔离验收 20261106'
ORIGINAL='901 帝都正式续玩 20261106'
SOURCE=lab.F/'chats'/lab.NAME/(ORIGINAL+'.jsonl')
def read(p):return json.loads(p.read_text(encoding='utf8'))
def rows(p):return [json.loads(x) for x in p.read_text(encoding='utf8').splitlines()]
def write_rows(p,a):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in a)+'\n',encoding='utf8')
def seed(chat):
 a=json.loads(json.dumps(rows(SOURCE),ensure_ascii=False).replace(ORIGINAL,chat))
 a[0]['character_name']=NAME
 a[0]['chat_metadata']['isolatedDrawAcceptance']={'testOnly':True,'source':str(SOURCE),'assumption':'仅测试：弃风置腰间剑鞘；双手空闲，按单手长剑试验。不写回正式状态。'}
 a[0]['chat_metadata']['note_prompt']+='\n仅此隔离验收：弃风放在腰间剑鞘，双手完好空闲，测试以单手拔取；非正式剧情。'
 for m in a[1:]:
  if not m.get('is_user'):m['name']=NAME
 r=a[-1]['variables'][0]['stat_data']['901_rules_poc'];s=r['actors']['player']['state']
 s['anatomy']={'source':'明确隔离测试条件：完好双手','graspingLimbs':['left-hand','right-hand']}
 w=next(x for x in s['possessions']['items'] if x['id']=='opening.qifeng');w.update(access='worn',oneHanded=True)
 w['handlingSource']='PHB取出物品211–215；仅隔离夹具设定腰间佩剑/单手要求'
 a[-1]['variables'][0]['display_data']=copy.deepcopy(a[-1]['variables'][0]['stat_data'])
 return a
def prepare():
 assert not A.exists();S.mkdir(parents=True,exist_ok=True)
 lab.put(S/'formal-before.json',lab.snapshot());shutil.copy2(SOURCE,S/'formal-source.jsonl')
 ignore=shutil.ignore_patterns('node_modules','.git','*.map','data','backups','cache')
 parent=lab.L/'ground-weapon-20261106/app'
 shutil.copytree(parent,A,ignore=ignore)
 for folder in ['src','public/901-opening-combat']:
  shutil.copytree(lab.APP/folder,A/folder,dirs_exist_ok=True,ignore=shutil.ignore_patterns('*.map'))
 subprocess.run(['powershell','-NoProfile','-Command',f"New-Item -ItemType Junction -Path '{A/'node_modules'}' -Target '{lab.APP/'node_modules'}' | Out-Null"],check=True)
 finish_setup()
def finish_setup():
 U.mkdir(parents=True,exist_ok=True)
 for n in ['OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions','User Avatars','worlds']:
  if (lab.F/n).exists():shutil.copytree(lab.F/n,U/n)
 for n in ['settings.json','secrets.json']:shutil.copy2(lab.F/n,U/n)
 (U/'characters').mkdir();shutil.copy2(lab.F/'characters'/(lab.NAME+'.png'),U/'characters'/(NAME+'.png'))
 chat=NAME+' - 原版复现';write_rows(U/'chats'/NAME/(chat+'.jsonl'),seed(chat))
 def transform(j):j.update(name=NAME,chat=chat);j['data']['name']=NAME
 lab.card_transform(U/'characters'/(NAME+'.png'),transform)
 settings=read(U/'settings.json');settings['character']=NAME+'.png'
 bindings=settings['world_info_settings']['world_info']['charLore'];formal=next(x for x in bindings if x['name']==lab.NAME);bindings.append({'name':NAME,'extraBooks':formal['extraBooks']})
 lab.put(U/'settings.json',settings)
 config=(A/'config.yaml').read_text(encoding='utf8').replace('port: 8000','port: 18115').replace('browserLaunch:\n  enabled: true','browserLaunch:\n  enabled: false')
 (A/'config.yaml').write_text(config,encoding='utf8')
 lab.put(S/'plan.json',{'port':18115,'name':NAME,'baselineChat':chat,'formalSourceSha256':lab.sha(SOURCE),'formalWritten':False})
 print('18115 prepared; formal untouched')
if __name__=='__main__':globals()[sys.argv[1]]()
