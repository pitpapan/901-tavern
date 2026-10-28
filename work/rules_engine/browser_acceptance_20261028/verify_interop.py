"""Read-only disk evidence for native regenerate and independent action-budget refusal."""
import pathlib,json,hashlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028'
ST=pathlib.Path('D:/github/sillyTavern')
chat_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms'
chat=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'/f'{chat_id}.jsonl'
def rows(p):return [json.loads(s) for s in p.read_text(encoding='utf8').splitlines() if s][1:]
def root(m):return m.get('variables',[{}])[m.get('swipe_id',0)].get('stat_data',{}).get('901_rules_poc')
def sha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
phase=sys.argv[1];assert phase.replace('-','').isalnum()
(OUT/f'interop-{phase}.jsonl').write_bytes(chat.read_bytes())
current=rows(chat);r=root(current[-1]);s=r['actors']['player']['state'];b=r['battle']
before=rows(OUT/'retention-final.jsonl');original=root(before[-1]);
assert all(root(current[i]) is None for i in [1,2,3,4])
assert s['xp']==50 and s['resources']['精神魔力']['current']==12
assert (s.get('resourceCooldowns') or {}).get('imperial-magic:D:魔能爆',0)==0
assert all(r['actors'][k]['state']['health']==original['actors'][k]['state']['health'] for k in r['actors'])
assert r['revision']==len(r['operations'])
assert 'combat-acceptance/'+chat_id+'/D-second' not in r['operations']
if phase=='entered':assert b['mode']=='combat' and b['activeId']=='player' and s['turn']['standard']==1
if phase=='defended':
 assert b['mode']=='combat' and b['activeId']=='player' and s['turn']['standard']==0
 added=set(r['operations'])-set(original['operations'])
 defenses=[k for k in added if json.loads(r['operations'][k]['signature']).get('abilityId')=='fullDefense' or json.loads(r['operations'][k]['signature']).get('command',{}).get('abilityId')=='fullDefense']
 assert len(defenses)==1,(added,defenses)
if phase in ['ap-rejected','regen-open','regen-cancel','regen-reloaded']:
 saved=rows(OUT/'interop-defended.jsonl')
 assert len(current)==len(saved) and r==root(saved[-1])
 assert current[-1]['mes']==saved[-1]['mes']
 assert current[-1].get('swipe_id',0)==saved[-1].get('swipe_id',0)
 assert current[-1]['variables']==saved[-1]['variables']
if phase=='final':assert b['mode']=='story' and b['status']=='finished' and b.get('pending') is None
cleanup=json.loads((ST/'data/default-user/settings.json').read_text(encoding='utf8'))['extension_settings']['mvu_settings']['自动清理变量']
assert cleanup==json.loads((OUT/'combat-mvu-cleanup.json').read_text(encoding='utf8'))['configuration']
protected=json.loads((OUT/'protected-before.json').read_text(encoding='utf8'))
assert all(hashlib.sha256((ST/p).read_bytes()).hexdigest()==h for p,h in protected.items())
package=json.loads((OUT/'package.json').read_text(encoding='utf8'));deployment=ST/'public/901-resource-acceptance-20261028'
assert all(hashlib.sha256((deployment/e['path']).read_bytes()).hexdigest()==e['sha256'] for e in package['modules'])
assert hashlib.sha256((deployment/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
result={'status':'pass','phase':phase,'floorCount':len(current),'lastFloor':len(current)-1,'swipeId':current[-1].get('swipe_id',0),'revision':r['revision'],'operations':len(r['operations']),'mode':b['mode'],'battleStatus':b['status'],'round':b['round'],'activeId':b['activeId'],'playerTurn':s['turn'],'mental':s['resources']['精神魔力']['current'],'xp':s['xp'],'cooldowns':s.get('resourceCooldowns',{}),'huangHealth':r['actors']['huang']['state']['health'],'rootSha256':sha(r),'reportSha256':sha(current[-1]['mes']),'oldClearedFloorsUntouched':[1,2,3,4],'globalCleanupUnchanged':True,'protectedFilesUnchanged':len(protected),'moduleHashesMatched':len(package['modules'])}
(OUT/f'interop-{phase}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2))
