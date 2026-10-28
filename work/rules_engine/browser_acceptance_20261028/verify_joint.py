"""Read the one authorized joint recovery case; never modify host state."""
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[3];H=Path(__file__).parent;O=R/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028';ST=Path('D:/github/sillyTavern')
phase=sys.argv[1];assert phase in ['prepared','settled','final','reloaded']
parent='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms';child=parent+' - Branch #1';directory=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'
load=lambda p:[json.loads(x) for x in p.read_text(encoding='utf8').splitlines() if x]
sha=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
root=lambda m:m.get('variables',[{}])[m.get('swipe_id',0)].get('stat_data',{}).get('901_rules_poc')
path=directory/(child+'.jsonl');(O/f'joint-{phase}.jsonl').write_bytes(path.read_bytes());raw=load(path);ms=raw[1:];r=root(ms[-1]);before=load(O/'branch-checkpoint-reloaded.jsonl');baseline=root(before[-1]);pr=load(directory/(parent+'.jsonl'));assert pr==load(O/'branch-parent-return-parent.jsonl'),'Parent chat changed'
config=json.loads((H/'joint-config.json').read_text(encoding='utf8'));assert raw[0]['chat_metadata']['resource_joint_profile']==config
for item in config['bookFiles']:assert hashlib.sha256((ST/'data/default-user/worlds'/(item['name']+'.json')).read_bytes()).hexdigest()==item['sha256']
assert r['chatId']==child and r['actors']['player']['state']['xp']==50
assert all(r['actors'][k]==baseline['actors'][k] for k in ['huang','jiang','bright'])
assert ms[:30]==before[1:31],'Copied historical messages changed'
assert root(ms[30])==baseline and ms[30]['variables'][0].get('snapshot') is True
assert ms[30]['mes']==before[-1]['mes']
assert all(r['operations'][k]==v for k,v in baseline['operations'].items())
result={'status':'pass','phase':phase,'messages':len(ms),'revision':r['revision'],'rootSha256':sha(r),'parentUnchanged':True,'historicalPagesUnchanged':True,'worldCopiesUnchanged':6}
if phase=='prepared':assert len(ms)==31 and r==baseline
else:
 assert len(ms)==33 and r['revision']==32 and len(r['operations'])==32
 assert ms[31]['is_user'] and ms[31]['mes']==config['input']
 assert root(ms[31])==r
 opkeys=set(r['operations'])-set(baseline['operations']);assert len(opkeys)==1
 op=r['operations'][next(iter(opkeys))];result['operation']=op
 assert r['actors']['player']['state']['resources']['精神魔力']['current']==12
 assert not any(r['actors']['player']['state'].get('resourceCooldowns',{}).values())
 expected=json.loads(json.dumps(baseline['actors']['player']));es=expected['state'];es['resources']['精神魔力']['current']=12;es['resourceCooldowns']={};es['recoveryClock']['longRests']+=1;es['recoveryClock']['minutes']+=480
 assert r['actors']['player']==expected,'Unexpected player change outside actual long rest'
 gate=ms[-1]['extra']['901_replay_gate'];assert gate['status']=='APPLIED' and gate['kind']=='recovery'
 result['gate']=gate;result['response']=ms[-1]['mes']
 if phase in ['final','reloaded']:
  run=raw[0]['chat_metadata']['resource_joint_acceptance'];assert run['input']==config['input'];assert run['final']['revision']==32
  classifiers=[q for q in run['requests'] if len(q['messages'])==2 and str(q['messages'][-1].get('content','')).startswith('玩家原始行动：'+config['input'])]
  assert len(classifiers)==1 and classifiers[0]['model']=='gemini-3.5-flash-lite'
  diagnostic=gate['diagnostic'];assert diagnostic['classificationRequests']==diagnostic['narrationRequests']==1
  assert diagnostic['narrationContainsVariableMarkup'] is False
  actual=[q for q in run['requests'] if any('裁定路径：RECOVERY_REQUIRED' in str(m.get('content','')) for m in q['messages'])]
  assert len(actual)==1,'Expected one actual joint narration prompt'
  request=actual[0];joined='\n'.join(str(m.get('content','')) for m in request['messages'])
  assert config['scene'] in joined and config['worldContextGuidance'] in joined
  assert request['model']=='gemini-3.5-flash-lite'
  books={b:json.loads((ST/'data/default-user/worlds'/(b+'.json')).read_text(encoding='utf8')) for b in config['books']}
  included=[];disabled=[]
  for book,v in books.items():
   for e in v['entries'].values():
    body=e.get('content','').strip()
    if not body:continue
    n=joined.count(body)
    if n:
     item={'world':book,'uid':e['uid'],'name':e.get('comment'),'count':n,'constant':e.get('constant',False)}
     (disabled if e.get('disable') else included).append(item)
  assert included and not disabled and all(e['count']==1 for e in included)
  assert any(e['constant'] for e in included)
  result.update(settingsCaptureEvents=len(run['requests']),classificationRequests=len(classifiers),outerNativePreparedButStoppedEvents=len(run['requests'])-len(classifiers)-len(actual),actualNarrationRequests=len(actual),included=included,disabledIncluded=disabled,scans=run['scan'],model=request['model'],guidanceSha256=config['guidanceSha256'])
package=json.loads((O/'package.json').read_text(encoding='utf8'));deploy=ST/'public/901-resource-acceptance-20261028';assert all(hashlib.sha256((deploy/e['path']).read_bytes()).hexdigest()==e['sha256'] for e in package['modules'])
assert hashlib.sha256((deploy/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
assert hashlib.sha256((deploy/'joint-config.json').read_bytes()).hexdigest()==package['joint_config_sha256']
protected=json.loads((O/'protected-before.json').read_text(encoding='utf8'));assert all(hashlib.sha256((ST/p).read_bytes()).hexdigest()==h for p,h in protected.items())
result.update(moduleHashesMatched=len(package['modules']),protectedFilesUnchanged=len(protected))
(O/f'joint-{phase}.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(result,ensure_ascii=False,indent=2))
