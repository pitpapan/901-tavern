"""Read-only acceptance checks and local evidence; never writes the formal app."""
import importlib.util,json,shutil
from pathlib import Path
import lab
spec=importlib.util.spec_from_file_location('draw_lab',lab.H/'draw-weapon-20261106.py')
d=importlib.util.module_from_spec(spec);spec.loader.exec_module(d)
def root(rows):return rows[-1]['variables'][0]['stat_data']['901_rules_poc']
def auto_values(value):
 if isinstance(value,str) and value.startswith(('{','[')):
  try:return auto_values(json.loads(value))
  except ValueError:return []
 if isinstance(value,dict):return [v for k,v in value.items() if k=='autoUpdateEnabled']+sum((auto_values(v) for v in value.values()),[])
 if isinstance(value,list):return sum((auto_values(v) for v in value),[])
 return []
results={}
for kind,chat in [('noncombat','非战斗最终复测'),('combat','战斗最终复测')]:
 live=d.U/'chats'/d.NAME/(d.NAME+' - '+chat+'.jsonl')
 current=d.rows(live);saved=d.rows(d.S/(kind+'-result.jsonl'))
 assert root(current)==root(saved) and current[-1]['mes']==saved[-1]['mes'] and current[-1].get('extra')==saved[-1].get('extra')
 assert len(current)==len(saved)
 shutil.copy2(live,d.S/(kind+'-refreshed.jsonl'))
 r=root(current);s=r['actors']['player']['state'];w=next(i for i in s['possessions']['items'] if i['id']=='opening.qifeng')
 assert r['revision']==1 and len(r['operations'])==1 and w['held'] and s['equippedWeaponId']==w['id']
 assert not s.get('combatManeuvers',{}).get('weaponUnavailable')
 results[kind]={'messages':len(current)-1,'revision':r['revision'],'operationCount':len(r['operations']),
  'refreshRootAndReplyUnchanged':True,'turn':s['turn'],'held':w['held'],'grip':w['grip'],'health':s['health'],'resources':s['resources']}
seed=root(d.rows(d.S/'combat-final-seed.jsonl'));r=root(d.rows(d.S/'combat-result.jsonl'));s=r['actors']['player']['state'];s0=seed['actors']['player']['state']
res=next(iter(r['operations'].values()))['summary']['result']
assert res['abilityId']=='drawWeapon' and res['receipt']['actions']=={'move':1}
assert res['receipt']['remaining']=={'standard':1,'move':0,'swift':1} and res['receipt']['movement']==0 and not res['damage'] and not res.get('attack')
for key in ['health','resources','will','inventory','statuses']:assert s[key]==s0[key]
assert s['possessions']['items'][0]==s0['possessions']['items'][0]
assert r['actors']['huang']['state']==seed['actors']['huang']['state']
for aid in ['player','huang']:assert r['battle']['actors'][aid]['position']==seed['battle']['actors'][aid]['position']
assert r['battle']['actors']['player']['buffs']==seed['battle']['actors']['player']['buffs']
assert r['battle']['activeId']=='player' and r['battle']['round']==1 and not r['battle']['actors']['player']['sheathed']
results['combat']['receipt']=res['receipt']
n0=root(d.rows(d.S/'noncombat-final-seed.jsonl'));n=root(d.rows(d.S/'noncombat-result.jsonl'))
ns0,ns=n0['actors']['player']['state'],n['actors']['player']['state']
for key in ['health','resources','will','inventory','statuses','turn']:assert ns[key]==ns0[key]
assert ns['possessions']['items'][0]==ns0['possessions']['items'][0]
assert not n.get('battle') and n['actors']['player']['combatCarry']['sheathed']==False
formal_before=d.read(d.S/'formal-before.json');formal_after=lab.snapshot()
changes=[p for p in formal_before.keys()|formal_after.keys() if formal_before.get(p)!=formal_after.get(p)]
assert not changes,changes
settings=d.read(d.U/'settings.json');formal_settings=d.read(lab.F/'settings.json')
assert settings['oai_settings']==formal_settings['oai_settings']
assert auto_values(settings)==[False] and auto_values(formal_settings)==[False]
repo=lab.H.parents[5].parent
modules={}
for name in d.read(d.S/'patched-modules.json'):
 src=repo/'work/rules_engine'/name;installed=d.A/'public/901-opening-combat/work/rules_engine'/name
 # The isolated host only rewrites the browser's absolute module prefix.
 expected=src.read_text(encoding='utf8').replace('/901-rules-runtime/','/901-opening-combat/')
 assert installed.read_text(encoding='utf8')==expected,name
 modules[name]={'authorSha256':lab.sha(src),'isolatedSha256':lab.sha(installed)}
lab.put(d.S/'final-module-hashes.json',modules)
report={'date':'2026-11-06','status':'passed-isolated-only','port':18115,'input':'御临风从腰间拔出弃风剑，右手握住剑柄；不攻击。',
 'scope':'随身武器拔出持握；不追加攻击、下一回合或地面拾取测试',
 'assumptions':'仅隔离夹具：腰间剑鞘、单手需求、完好空闲双手；不自动采用为正式存档资料',
 'rules':['PHB 非战斗行动与战斗行动 211–215：实际佩带/存放位置的取物费用','RE 物品和装备位 235–245：手持与生效武器限制'],
 'fixes':['非战斗equipment draw及战斗drawWeapon接通同一实际实例执行器，复用既有PHB费用与手部校验','精确声明引用允许省略主语并跨逗号，仍核对实际动词位置、物品和顺序','武器面板区分随身收起与持握，实例名称进入叙事投影'],
 'failedAttempts':['原版普通拔剑误入旧能力路径，NEEDS_INPUT且状态未变','第一候选原文引用跨逗号，被旧整句包含校验拒绝，修复后通过','战斗夹具残留100HP于发言前纠正；首轮phase=ready导致合法动作缺失，模型猜错ID被拒，另副本改active后通过'],
 'tests':{'focusedSuite':{'passed':89,'failed':0,'log':'draw-weapon-tests-20261106.log'},'afterFinalQuoteFix':{'passed':7,'failed':0,'log':'draw-weapon-quote-tests-20261106.log'}},
 'actualModel':settings['oai_settings'].get('custom_model'),'completeModelConfigUnchanged':True,'autoUpdateEnabled':False,
 'interaction':'Terra High判断；主会话内置浏览器执行','results':results,
 'narrativeNote':'战斗正文“守势已定”仅措辞；回执明确无防御结算，buffs未变。不当作已准备格挡。',
 'formalProtection':{'files':len(formal_before),'changes':changes,'sourceChatSha256':lab.sha(d.SOURCE),'originalBackupSha256':lab.sha(d.S/'formal-source.jsonl')},
 'installedTo8000':False,'modules':modules,'privateEvidence':str(d.S)}
assert report['formalProtection']['sourceChatSha256']==report['formalProtection']['originalBackupSha256']
lab.put(lab.H/'draw-weapon-acceptance-20261106.json',report)
print(json.dumps({'status':report['status'],'formalChanges':changes,'refreshChecks':{k:v['refreshRootAndReplyUnchanged'] for k,v in results.items()},'autoUpdateEnabled':False}))
