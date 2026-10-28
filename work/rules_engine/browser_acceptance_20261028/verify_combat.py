"""Read-only capture/verification of the isolated combat acceptance chat."""
import hashlib,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028'
ST=pathlib.Path('D:/github/sillyTavern')
chat_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms'
chat=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'/f'{chat_id}.jsonl'
def rows(path):return [json.loads(x) for x in path.read_text(encoding='utf-8').splitlines() if x][1:]
def root(row):return row['variables'][row.get('swipe_id',0)]['stat_data']['901_rules_poc']
phase=sys.argv[1] if len(sys.argv)>1 else 'inspect'
current=rows(chat);r=root(current[-1]);base=rows(OUT/'combat-before.jsonl')
pruned=[]
for i in range(12):
 assert current[i]['mes']==base[i]['mes'] and current[i].get('swipe_id',0)==base[i].get('swipe_id',0)
 variables=current[i]['variables'][current[i].get('swipe_id',0)]
 if 'stat_data' not in variables:pruned.append(i)
 else:assert root(current[i])==root(base[i]),f'earlier retained root changed: {i}'
if pruned:
 assert phase=='final' and len(current)==25 and pruned==[1,2,3,4],pruned
 settings=json.loads((ST/'data/default-user/settings.json').read_text(encoding='utf-8'))
 cleanup=settings['extension_settings']['mvu_settings']['自动清理变量']
 assert cleanup=={'启用':True,'快照保留间隔':50,'要保留变量的最近楼层数':20,'触发恢复变量的最近楼层数':10}
assert r['actors']['player']['state']['xp']==50
assert all(r['actors'][k]==root(base[-1])['actors'][k] for k in ['jiang','bright'])
before=json.loads((OUT/'protected-before.json').read_text(encoding='utf-8'))
changed=[p for p,h in before.items() if not (ST/p).exists() or hashlib.sha256((ST/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
package=json.loads((OUT/'package.json').read_text(encoding='utf-8'))
deployed=ST/'public/901-resource-acceptance-20261028'
mismatched=[i['path'] for i in package['modules'] if hashlib.sha256((deployed/i['path']).read_bytes()).hexdigest()!=i['sha256']]
assert not mismatched,mismatched
assert hashlib.sha256((deployed/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
b=r.get('battle',{});s=r['actors']['player']['state']
summary={'phase':phase,'floor':len(current)-1,'revision':r['revision'],'operationCount':len(r['operations']),
 'pool':s['resources']['精神魔力'],'turn':s['turn'],'cooldowns':s.get('resourceCooldowns'),
 'battle':{k:b.get(k) for k in ['id','round','activeId','mode','status','pending']},'huangHealth':r['actors']['huang']['state']['health'],
 'lastResult':r.get('lastResult'),'earlierRootsUnchanged':not pruned,'retainedEarlierRootsUnchanged':True,
 'historicalFloorsPrunedByExistingMvuPolicy':pruned,'spectatorsUnchanged':True,'protectedFilesUnchanged':len(before),'moduleHashesMatched':len(package['modules'])}
if phase=='final':
 pre=root(rows(OUT/'combat-before-cast.jsonl')[-1]);cast=root(rows(OUT/'combat-cast.jsonl')[-1])
 assert pre['battle']['round']==3 and pre['battle']['activeId']=='player'
 assert pre['actors']['player']['state']['turn']['standard']==1
 assert cast['actors']['player']['state']['turn']['standard']==0
 assert all(cast['actors']['player']['state']['turn'][k]==1 for k in ['move','swift'])
 assert pre['actors']['player']['state']['resources']['精神魔力']['current']==11
 assert cast['actors']['player']['state']['resources']['精神魔力']['current']==10
 op='combat-acceptance/'+chat_id+'/D-cast';record=cast['operations'][op]
 assert json.loads(record['signature'])=={'actorId':'player','abilityId':'mechanism','objectId':'eldritchBlast','operation':'cast','part':'DCombat'}
 result=record['summary']['result']['mechanism'];assert result['cost']==1 and result['pool']=='精神魔力'
 roll=result['targets'][0]['steps'][0]['roll'];assert roll['rolledSuccesses']==sum(d>=8 for d in roll['dice'])==3
 assert sum(d['actualDamage'] for d in result['damage'])==3
 assert all(d['severity']=='L' and d['energyType']=='force' for d in result['damage'])
 assert cast['actors']['huang']['state']['health']['L']-pre['actors']['huang']['state']['health']['L']==3
 for name in ['report-fixed','duplicate-rejected','regenerated','regenerated-settled','reloaded']:
  assert root(rows(OUT/f'combat-{name}.jsonl')[-1])==cast,name
 round4=root(rows(OUT/'combat-round4.jsonl')[-1]);assert round4['battle']['round']==4 and round4['battle']['activeId']=='player'
 assert all(round4['actors']['player']['state']['turn'][k]==1 for k in ['standard','move','swift'])
 assert round4['actors']['player']['state']['resources']['精神魔力']['current']==10
 assert b['mode']=='story' and b['status']=='finished' and not b.get('pending')
 assert s['resources']['精神魔力']['current']==10 and s['health']==root(base[-1])['actors']['player']['state']['health']
 assert r['actors']['huang']['state']['health']==cast['actors']['huang']['state']['health']
 assert r['operations'][op]==record
 summary.update(status='pass',scope='current and retained recent combat state; historical snapshots outside MVU retention window are not certified',dice=roll['dice'],addedDamage={'L':3},combatActionPaidOnce=True,
  sameOperationRootUnchanged=True,regenerationRootUnchanged=True,reloadRootUnchanged=True,roundBudgetRestored=True,
  safeExitPreservedHealthAndEnergy=True,limitations=['new same-turn cast rejected by cooldown before action-budget check; no separate live insufficient-AP branch proof','NPC target received only the agreed end-turn option; not free-tactics or instruction-following validation','native regeneration briefly hid the report in the DOM; refresh restored the persisted report; display fix remains TODO','existing MVU cleanup pruned floors 1–4 and their swipes at 25 floors; historical rollback outside the retention window remains TODO'])
 (OUT/'combat-disk-verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
if phase!='inspect':
 assert phase.replace('-','').isalnum()
 (OUT/f'combat-{phase}.jsonl').write_bytes(chat.read_bytes())
 (OUT/f'combat-{phase}.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
