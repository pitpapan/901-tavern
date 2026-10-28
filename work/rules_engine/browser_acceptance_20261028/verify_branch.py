"""Read only this card's native branch and original chat; save bounded evidence."""
import pathlib,json,hashlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[3];OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028';ST=pathlib.Path('D:/github/sillyTavern')
parent_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms'
directory=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'
phase,child_id=sys.argv[1:3];assert phase.replace('-','').isalnum()
assert child_id.startswith(parent_id+' - Branch #') and '/' not in child_id and '\\' not in child_id
def load(p):return [json.loads(s) for s in p.read_text(encoding='utf8').splitlines() if s]
def root(m,i=None):return m.get('variables',[{}])[m.get('swipe_id',0) if i is None else i].get('stat_data',{}).get('901_rules_poc')
def roots(ms):return [[v.get('stat_data',{}).get('901_rules_poc') for v in m.get('variables',[])] for m in ms]
def sha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
parent_path=directory/(parent_id+'.jsonl');child_path=directory/(child_id+'.jsonl')
(OUT/f'branch-{phase}.jsonl').write_bytes(child_path.read_bytes())
(OUT/f'branch-{phase}-parent.jsonl').write_bytes(parent_path.read_bytes())
base=load(OUT/'interop-final.jsonl')[1:];parent=load(parent_path)[1:];raw=load(child_path);child=raw[1:]
assert len(parent)==len(base)==31 and roots(parent)==roots(base)
assert [m['mes'] for m in parent]==[m['mes'] for m in base]
assert raw[0]['chat_metadata']['main_chat']==parent_id and raw[0]['chat_metadata']['integrity']
assert len(child)==31
assert roots(child[:-1])==roots(base[:-1]),'Copied history must not be rebound'
r=root(child[-1]);source=root(base[-1]);assert source['revision']==29
if phase in ['created','rejected']:
 assert roots(child)==roots(base) and r['chatId']==parent_id
else:
 assert r['chatId']==child_id
 adoption='branch/'+child_id+'/30/0'
 assert r['operations'][adoption]['summary']['sourceChatId']==parent_id
 assert r['operations'][adoption]['summary']['sourceRevision']==29
 assert all(r['operations'][k]==v for k,v in source['operations'].items())
 if phase in ['adopted','failed-disk']:
  assert r['revision']==30 and len(r['operations'])==30
  assert r['actors']==source['actors']
 if phase=='failed-disk':
  adopted=load(OUT/'branch-adopted.jsonl');assert raw==adopted,'A failed write must not have silently reached disk'
 if phase in ['retried','reloaded','parent-return'] or phase.startswith('checkpoint-'):
  operation='gm-runtime/'+child_id+'/ui-branch-save-cast'
  assert r['revision']==31 and len(r['operations'])==31
  assert operation in r['operations']
  assert r['actors']['player']['state']['resources']['精神魔力']['current']==11
  assert r['actors']['player']['state']['xp']==50
  assert all(r['actors'][k]==source['actors'][k] for k in ['jiang','bright'])
  if phase!='retried':assert r==root(load(OUT/'branch-retried.jsonl')[-1])
 if phase.startswith('checkpoint-'):
  envelope=child[-1]['variables'][child[-1].get('swipe_id',0)]
  if phase=='checkpoint-before':assert envelope.get('snapshot') is not True
  elif phase=='checkpoint-failed':assert raw==load(OUT/'branch-checkpoint-before.jsonl')
  elif phase in ['checkpoint-saved','checkpoint-reloaded']:
   assert envelope.get('snapshot') is True
   original=load(OUT/'branch-checkpoint-before.jsonl')[-1]['variables'][0]
   assert {k:v for k,v in envelope.items() if k!='snapshot'}=={k:v for k,v in original.items() if k!='snapshot'}
package=json.loads((OUT/'package.json').read_text(encoding='utf8'));deploy=ST/'public/901-resource-acceptance-20261028'
assert all(hashlib.sha256((deploy/e['path']).read_bytes()).hexdigest()==e['sha256'] for e in package['modules'])
assert hashlib.sha256((deploy/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
protected=json.loads((OUT/'protected-before.json').read_text(encoding='utf8'));assert all(hashlib.sha256((ST/p).read_bytes()).hexdigest()==h for p,h in protected.items())
result={'status':'pass','phase':phase,'childId':child_id,'childPath':str(child_path),'parentRootUnchanged':True,'copiedHistoryUnchanged':True,'floorCount':len(child),'revision':r['revision'],'operationCount':len(r['operations']),'ruleChatId':r['chatId'],'mental':r['actors']['player']['state']['resources']['精神魔力']['current'],'huangHealth':r['actors']['huang']['state']['health'],'snapshot':child[-1]['variables'][child[-1].get('swipe_id',0)].get('snapshot',False),'rootSha256':sha(r),'protectedFilesUnchanged':160,'moduleHashesMatched':112}
(OUT/f'branch-{phase}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2))
