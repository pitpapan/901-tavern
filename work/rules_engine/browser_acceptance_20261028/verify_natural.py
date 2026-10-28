"""Verify saved isolated live-model cases, mechanics and preexisting-file protection."""
import hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028'
ST=pathlib.Path('D:/github/sillyTavern')
chat_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms'
chat=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'/f'{chat_id}.jsonl'
def rows(path):return [json.loads(x) for x in path.read_text(encoding='utf-8').splitlines() if x][1:]
def root(row):return row['variables'][row.get('swipe_id',0)]['stat_data']['901_rules_poc']
current=rows(chat)
assert len(current)==12
initial=rows(OUT/'before-natural-language.jsonl')
assert all(root(current[i])==root(initial[i]) for i in range(3))
scene,no_cast,rest,failed,cast=[root(current[i]) for i in [3,5,7,9,11]]
assert scene==no_cast and scene['revision']==7
assert current[5]['extra']['901_replay_gate']['status']=='NO_CHECK'
assert rest['revision']==8 and len(rest['operations'])==8
assert rest['lastResult']['kind']=='recovery' and rest['lastResult']['result']['minutes']==480
assert rest['actors']['player']['state']['resources']['精神魔力']['current']==12
assert all(rest['actors'][k]==no_cast['actors'][k] for k in ['huang','jiang','bright'])
# Preserve the failed classifier case as failure evidence, not successful casting.
assert failed['revision']==9 and failed['lastResult']['result']['action']=='check'
assert failed['actors']==rest['actors']
result=cast['lastResult']['result']
assert cast['revision']==10 and len(cast['operations'])==10
request=json.loads(cast['operations'][cast['lastResult']['operationId']]['signature'])['request']
assert request=={'kind':'rule','action':'mechanism','actorId':'player','objectId':'eldritchBlast','operation':'cast','part':'D'}
assert result['resourceId']=='imperial-magic:D:魔能爆' and result['operation']=='cast'
assert result['cost']==1 and result['pool']=='精神魔力'
state=cast['actors']['player']['state']
assert state['xp']==50 and state['resources']['精神魔力']['current']==11
assert state['learnedResources']['imperial-magic:D:魔能爆']['versions']==['D','C']
assert all(cast['actors'][k]==failed['actors'][k] for k in ['jiang','bright'])
assert state['health']==failed['actors']['player']['state']['health']
attack=result['targets'][0]['steps'][0]
assert result['targets'][0]['targetId']=='huang' and attack['op']=='attack'
roll=attack['roll'];assert roll['rolledSuccesses']==sum(d>=8 for d in roll['dice'])
damage=sum(d['actualDamage'] for d in result['damage'])
assert all(d['severity']=='L' and d['energyType']=='force' for d in result['damage'])
assert cast['actors']['huang']['state']['health']['L']==damage
assert cast['actors']['huang']['state']['health']['intact']==12-damage
fresh=rows(OUT/'natural-final-before-regenerate.jsonl')
assert current[11]['mes']==fresh[11]['mes'] and root(current[11])==root(fresh[11])
assert '轻度' not in current[11]['mes']
before=json.loads((OUT/'protected-before.json').read_text(encoding='utf-8'))
changed=[p for p,h in before.items() if not (ST/p).exists() or hashlib.sha256((ST/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
package=json.loads((OUT/'package.json').read_text(encoding='utf-8'))
deployed=ST/'public/901-resource-acceptance-20261028'
for item in package['modules']:
 assert hashlib.sha256((deployed/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
assert hashlib.sha256((deployed/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
report={'status':'pass','scope':'isolated live classifier, NO_CHECK, long rest, D cast, native regeneration and reload',
 'model':'gemini-3.5-flash-lite (existing SillyTavern configuration)','uiSteps':'GPT-6.1 Terra High, parent tool relay',
 'chatId':chat_id,'revision':10,'xp':50,'mentalPool':{'current':11,'max':12},'damage':{'L':damage},
 'operationCount':10,'dice':roll['dice'],'regenerateUnchanged':True,'spectatorsUnchanged':True,
 'protectedPreexistingFiles':len(before),'changedProtectedFiles':changed,'formalInstallationChanged':False,
 'chatSha256':hashlib.sha256(chat.read_bytes()).hexdigest(),
 'limits':['bounded live cases, not general classifier accuracy','no full combat-turn test','six-book full live loading not tested']}
(OUT/'natural-disk-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
