"""Install adopted drawing modules; create new test chats, never migrate play saves."""
import json,shutil,subprocess,sys,urllib.request
from pathlib import Path
import lab
R=lab.H.parents[6];S=lab.L/'draw-formal-install-20261106';PREV=lab.L/'draw-weapon-20261106'
REL=Path('public/901-opening-combat/work/rules_engine')
NAME='901 正式战斗加载验收 20261106'
CASES={'noncombat':'901 正式弃风拔出验收 20261106 - 非战斗','combat':'901 正式弃风拔出验收 20261106 - 战斗'}
read=lambda p:json.loads(p.read_text(encoding='utf8'))
rows=lambda p:[json.loads(x) for x in p.read_text(encoding='utf8').splitlines()]
def database(settings):
 v=settings['extension_settings']['__userscripts']['shujuku_v120__userscript_settings_v1']['shujuku_v120_profile_v1____default____settings']
 return json.loads(v) if isinstance(v,str) else v
def prepare():
 assert not S.exists();S.mkdir()
 report=read(lab.H/'draw-weapon-acceptance-20261106.json')
 lab.put(S/'protected-before.json',lab.snapshot());shutil.copy2(lab.F/'settings.json',S/'settings.before.json')
 assert database(read(S/'settings.before.json'))['autoUpdateEnabled'] is False
 shutil.copy2(lab.F/'characters'/(NAME+'.png'),S/'test-card.before.png')
 hashes={}
 for name,proof in report['modules'].items():
  src=R/'work/rules_engine'/name;target=lab.APP/REL/name
  assert lab.sha(src)==proof['authorSha256'],name
  assert lab.sha(target)==lab.sha(PREV/'original-modules'/name),'Formal module changed: '+name
  candidate=S/'candidate'/name;candidate.parent.mkdir(parents=True,exist_ok=True)
  candidate.write_text(src.read_text(encoding='utf8').replace('/901-rules-runtime/','/901-opening-combat/').replace('/901-combat-runtime/','/901-opening-combat/'),encoding='utf8',newline='\n')
  assert candidate.read_text(encoding='utf8')==(PREV/'app'/REL/name).read_text(encoding='utf8'),name
  backup=S/'backup'/name;backup.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(target,backup)
  hashes[name]={'source':lab.sha(src),'before':lab.sha(target),'installed':lab.sha(candidate)}
 for key,chat in CASES.items():
  seed=rows(PREV/(key+'-final-seed.jsonl'));old='901 弃风拔出隔离验收 20261106 - '+('非战斗最终复测' if key=='noncombat' else '战斗最终复测')
  seed=json.loads(json.dumps(seed,ensure_ascii=False).replace(old,chat));seed[0]['character_name']=NAME
  seed[0]['chat_metadata']['formal_draw_acceptance']={'testOnly':True,'source':key+'-final-seed.jsonl','fixtureOnly':'腰间剑鞘、单手、双手可用；不写回正式续玩档'}
  for m in seed[1:]:
   if not m.get('is_user'):m['name']=NAME
  (S/(key+'-seed.jsonl')).write_text('\n'.join(json.dumps(x,ensure_ascii=False) for x in seed)+'\n',encoding='utf8')
  assert not (lab.F/'chats'/NAME/(chat+'.jsonl')).exists()
 lab.put(S/'plan.json',{'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'modules':hashes,'name':NAME,'chats':CASES})
 print('Prepared 12 backed-up modules and 2 new isolated chats; no formal writes')
def install():
 assert not (S/'installed.json').exists();plan=read(S/'plan.json');raw=(lab.F/'settings.json').read_bytes()
 assert raw==(S/'settings.before.json').read_bytes(),'Settings changed since preparation'
 for name,h in plan['modules'].items():
  assert lab.sha(lab.APP/REL/name)==h['before'] and lab.sha(S/'candidate'/name)==h['installed'],name
 for key,chat in CASES.items():assert not (lab.F/'chats'/NAME/(chat+'.jsonl')).exists()
 for name in plan['modules']:shutil.copy2(S/'candidate'/name,lab.APP/REL/name)
 for key,chat in CASES.items():shutil.copy2(S/(key+'-seed.jsonl'),lab.F/'chats'/NAME/(chat+'.jsonl'))
 for name in plan['modules']:
  with urllib.request.urlopen('http://127.0.0.1:8000/'+(REL/name).as_posix().removeprefix('public/')+'?draw=20261106',timeout=20) as response:
   assert response.read()==(lab.APP/REL/name).read_bytes(),name
 assert (lab.F/'settings.json').read_bytes()==raw
 lab.put(S/'installed.json',{**plan,'httpReadbackMatches':True,'settingsWritten':False})
 print('Installed 12 modules; HTTP matches. Added only 2 test chats; no settings/card/play-save writes.')
if __name__=='__main__':globals()[sys.argv[1]]()
