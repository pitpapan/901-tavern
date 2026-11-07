"""One disposable exact-host action sweep, preserving the complete formal app."""
import json,shutil,subprocess,sys
from pathlib import Path
import lab
S=lab.L/'action-sweep-20261107';A=S/'app';U=A/'data/default-user';NAME='901 动作集中验收 20261107'
def setup():
 assert not A.exists()
 shutil.copytree(lab.L/'draw-weapon-20261106/app',A,ignore=shutil.ignore_patterns('node_modules','.git','data','backups','cache','*.log','*.map'))
 shutil.copytree(lab.APP/'public/901-opening-combat',A/'public/901-opening-combat',dirs_exist_ok=True)
 U.mkdir(parents=True)
 for n in ['OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions','User Avatars','worlds']:
  if (lab.F/n).exists():shutil.copytree(lab.F/n,U/n)
 for n in ['settings.json','secrets.json']:shutil.copy2(lab.F/n,U/n)
 (U/'characters').mkdir();shutil.copy2(lab.F/'characters'/('901 正式战斗加载验收 20261106.png'),U/'characters'/(NAME+'.png'))
 def transform(j):
  j['name']=j['data']['name']=NAME;j['chat']='901 集中 01 姿态全力 20261107'
  j['data']['scenario']='非Canon隔离动作验收，初态与测试物品见本聊天。试验人物不是正式剧情人物。'
 lab.card_transform(U/'characters'/(NAME+'.png'),transform)
 finish()
def finish():
 s=json.loads((U/'settings.json').read_text(encoding='utf8'));s['character']=NAME+'.png'
 bindings=s['world_info_settings']['world_info']['charLore'];old=next(x for x in bindings if x['name']==lab.NAME);bindings.append({'name':NAME,'extraBooks':old['extraBooks']})
 s['world_info_settings']['world_info']['globalSelect']=[]
 for v in s['power_user'].get('persona_descriptions',{}).values():
  if isinstance(v,dict) and v.get('lorebook'):v['lorebook']=''
 lab.put(U/'settings.json',s)
 config=(A/'config.yaml').read_text(encoding='utf8').replace('port: 18115','port: 18116').replace('port: 8000','port: 18116')
 (A/'config.yaml').write_text(config,encoding='utf8')
 subprocess.run(['powershell','-NoProfile','-Command',f"New-Item -ItemType Junction -Path '{A/'node_modules'}' -Target '{lab.APP/'node_modules'}' | Out-Null"],check=True)
 print('Prepared isolated 18116 host, model/settings copied, formal untouched')
if __name__=='__main__':globals()[sys.argv[1] if len(sys.argv)>1 else 'setup']()
