"""Read only the isolated retention case; snapshot metadata never restores old cleared floors."""
import pathlib,json,hashlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[3];OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028';ST=pathlib.Path('D:/github/sillyTavern')
chat_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms';chat=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'/f'{chat_id}.jsonl'
rows=lambda p:[json.loads(x) for x in p.read_text(encoding='utf8').splitlines() if x][1:]
def variables(row,swipe=None):return row.get('variables',[])[row.get('swipe_id',0) if swipe is None else swipe]
def root(row,swipe=None):return variables(row,swipe).get('stat_data',{}).get('901_rules_poc')
def sha(value):return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
phase=sys.argv[1] if len(sys.argv)>1 else 'inspect'
if phase!='inspect':assert phase.replace('-','').isalnum();(OUT/f'retention-{phase}.jsonl').write_bytes(chat.read_bytes())
current=rows(chat);baseline=rows(OUT/'retention-before.jsonl');base=root(baseline[-1]);assert base['revision']==23
assert all(root(current[i]) is None for i in [1,2,3,4]),'Old cleared floors must not be backfilled'
cleanup=json.loads((ST/'data/default-user/settings.json').read_text(encoding='utf8'))['extension_settings']['mvu_settings']['自动清理变量']
assert cleanup==json.loads((OUT/'combat-mvu-cleanup.json').read_text(encoding='utf8'))['configuration']
protected=json.loads((OUT/'protected-before.json').read_text(encoding='utf8'));assert all(hashlib.sha256((ST/p).read_bytes()).hexdigest()==h for p,h in protected.items())
package=json.loads((OUT/'package.json').read_text(encoding='utf8'));deployed=ST/'public/901-resource-acceptance-20261028'
assert all(hashlib.sha256((deployed/i['path']).read_bytes()).hexdigest()==i['sha256'] for i in package['modules'])
assert hashlib.sha256((deployed/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
pages=[]
if len(current)>25:
 for index,v in enumerate(current[25].get('variables',[])):
  r=root(current[25],index);pages.append({'swipeId':index,'snapshot':v.get('snapshot',False),'revision':r and r['revision'],'mental':r and r['actors']['player']['state']['resources']['精神魔力']['current'],'rootSha256':sha(r)})
 assert root(current[25],0)==base and variables(current[25],0).get('snapshot') is True
if phase in ['pages','window','window-reloaded','rollback-page1','rollback-page0','rollback-reloaded','final']:
 assert len(pages)==2 and all(p['snapshot'] is True for p in pages)
 alternate=root(current[25],1);assert alternate['revision']==24 and alternate['actors']['player']['state']['resources']['精神魔力']['current']==12
 assert len(alternate['operations'])==len(base['operations'])+1==24
 assert all(alternate['actors'][k]==base['actors'][k] for k in ['huang','jiang','bright'])
 op=alternate['operations']['gm-runtime/'+chat_id+'/ui-retention-rest'];assert json.loads(op['signature'])=={'actorId':'player','command':{'type':'rest','rest':'long','minutes':480}}
 assert op['summary']['result']['minutes']==480
 if phase!='pages':
  original=rows(OUT/'retention-pages.jsonl')[25]
  assert all(root(current[25],i)==root(original,i) for i in range(2))
 if phase in ['window','window-reloaded']:
  assert len(current)==50
  assert all(root(current[i])==alternate for i in range(30,50))
  assert all(root(current[i]) is None for i in range(26,30))
 if phase in ['rollback-page1','rollback-page0','rollback-reloaded','final']:
  assert len(current)==26
  assert current[25]['swipe_id']==(0 if phase=='rollback-page0' else 1)
summary={'status':'pass','phase':phase,'floorCount':len(current),'tipRevision':root(current[-1]) and root(current[-1])['revision'],'selectedSwipe':current[-1].get('swipe_id',0),'checkpointPages':pages,'globalCleanupUnchanged':cleanup,'oldClearedFloorsUntouched':[1,2,3,4],'protectedFilesUnchanged':len(protected),'moduleHashesMatched':len(package['modules'])}
if phase!='inspect':(OUT/f'retention-{phase}.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
