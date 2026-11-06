"""Capture only the two new formal-host test chats; verify original-save protection."""
import base64,importlib.util,json,shutil,struct,sys
import lab
sp=importlib.util.spec_from_file_location('f',lab.H/'draw-formal-install-20261106.py')
f=importlib.util.module_from_spec(sp);sp.loader.exec_module(f)
def root(a):return a[-1]['variables'][0]['stat_data']['901_rules_poc']
def capture(key,phase):
 p=lab.F/'chats'/f.NAME/(f.CASES[key]+'.jsonl');a=f.rows(p);seed=f.rows(f.S/(key+'-seed.jsonl'))
 r,r0=root(a),root(seed);s,s0=r['actors']['player']['state'],r0['actors']['player']['state']
 assert len(a)==len(seed)+2 and r['revision']==1 and len(r['operations'])==1
 w=next(i for i in s['possessions']['items'] if i['id']=='opening.qifeng')
 assert w['held'] and w['grip']['hands']==1 and s['equippedWeaponId']==w['id'] and not s['combatManeuvers'].get('weaponUnavailable')
 for k in ['health','resources','will','inventory','statuses']:assert s[k]==s0[k],k
 assert s['possessions']['items'][0]==s0['possessions']['items'][0]
 assert a[0]['chat_metadata']['901_fresh_opening']['initialPartySupplies']==seed[0]['chat_metadata']['901_fresh_opening']['initialPartySupplies']
 result=next(iter(r['operations'].values()))['summary']['result']
 if key=='noncombat':
  assert s['turn']==s0['turn'] and not r.get('battle') and result['elapsedMinutes']==0 and result['steps'][0]['action'] is None
 else:
  assert result['abilityId']=='drawWeapon' and result['receipt']['actions']=={'move':1}
  assert result['receipt']['remaining']=={'standard':1,'move':0,'swift':1} and result['receipt']['movement']==0 and not result['damage'] and not result.get('attack')
  assert r['actors']['huang']['state']==r0['actors']['huang']['state']
  for aid in ['player','huang']:assert r['battle']['actors'][aid]['position']==r0['battle']['actors'][aid]['position']
  assert r['battle']['actors']['player']['buffs']==r0['battle']['actors']['player']['buffs']
  assert r['battle']['activeId']=='player' and r['battle']['round']==1 and not r['battle']['actors']['player']['sheathed']
 if phase=='refreshed':
  old=f.rows(f.S/(key+'-result.jsonl'));assert root(old)==r and len(old)==len(a)
  assert old[-1]['mes']==a[-1]['mes'] and old[-1].get('extra')==a[-1].get('extra')
 shutil.copy2(p,f.S/(key+'-'+phase+'.jsonl'))
 out={'messages':len(a)-1,'revision':1,'operations':1,'held':True,'refreshUnchanged':phase=='refreshed','result':result}
 lab.put(f.S/(key+'-'+phase+'-check.json'),out);print(json.dumps({'case':key,'phase':phase,'passed':True,'messages':len(a)-1}))
def diff(a,b,p=''):
 if isinstance(a,str) and isinstance(b,str):
  try:a,b=json.loads(a),json.loads(b)
  except (ValueError,TypeError):pass
 if isinstance(a,dict) and isinstance(b,dict):return sum((diff(a.get(k),b.get(k),p+'/'+k) for k in a.keys()|b.keys()),[])
 return [] if a==b else [p]
def chunks(p):
 data=p.read_bytes();i=8;out={}
 while i<len(data):
  n=struct.unpack('>I',data[i:i+4])[0];typ=data[i+4:i+8];v=data[i+8:i+8+n];i+=n+12
  if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):out[v.split(b'\0',1)[0].decode()]=json.loads(base64.b64decode(v.split(b'\0',1)[1]))
 return out
def finish():
 plan=f.read(f.S/'installed.json');before=f.read(f.S/'protected-before.json');after=lab.snapshot()
 changed=[p for p in before if before[p]!=after.get(p)];new=[p for p in after if p not in before]
 allowed=[str(lab.APP/f.REL/n) for n in plan['modules']]+[str(lab.F/'settings.json'),str(lab.F/'characters'/(f.NAME+'.png'))]
 assert not set(changed)-set(allowed),set(changed)-set(allowed)
 assert set(new)=={str(lab.F/'chats'/f.NAME/(chat+'.jsonl')) for chat in f.CASES.values()}
 for name,h in plan['modules'].items():assert lab.sha(lab.APP/f.REL/name)==h['installed'],name
 s0=f.read(f.S/'settings.before.json');s=f.read(lab.F/'settings.json');assert s['oai_settings']==s0['oai_settings']
 assert f.database(s)['autoUpdateEnabled'] is False
 cd=diff(chunks(f.S/'test-card.before.png'),chunks(lab.F/'characters'/(f.NAME+'.png')))
 assert all(p in ['/chara/chat','/ccv3/chat'] for p in cd),cd
 results={k:f.read(f.S/(k+'-refreshed-check.json')) for k in f.CASES}
 report={'date':'2026-11-06','status':'passed-formal-install-isolated-chats','commit':plan['commit'],'port':8000,
  'modules':plan['modules'],'httpReadbackMatches':True,'interaction':'Terra High判断、主会话IAB执行',
  'model':s['oai_settings'].get('custom_model'),'completeModelConfigUnchanged':True,'autoUpdateEnabled':False,
  'testCard':f.NAME,'chats':f.CASES,'results':results,'protectedFiles':len(before),'changedFiles':changed,'newFiles':new,
  'allExistingChatsAndFormalPlayCardUnchanged':True,'testCardChanges':cd,'settingsChangedPaths':diff(s0,s),
  'scope':'腰间、单手、双手可用仅测试条件；不迁移原聊天，不追加攻击或回合','privateEvidence':str(f.S)}
 lab.put(lab.H/'draw-formal-acceptance-20261106.json',report)
 print(json.dumps({'status':report['status'],'protected':len(before),'existingChatsUnchanged':True,'settingsChangedPaths':report['settingsChangedPaths']},ensure_ascii=True))
if __name__=='__main__':
 if sys.argv[1]=='finish':finish()
 else:capture(*sys.argv[1:])
