"""Read only the named isolated chat; verify swipe state and protected file hashes."""
import hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028'
ST=pathlib.Path('D:/github/sillyTavern')
before=json.loads((OUT/'protected-before.json').read_text(encoding='utf-8'))
changed=[p for p,h in before.items() if not (ST/p).exists() or hashlib.sha256((ST/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
chat_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms'
chat=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'/f'{chat_id}.jsonl'
rows=[json.loads(x) for x in chat.read_text(encoding='utf-8').splitlines() if x][1:]
failure=[json.loads(x) for x in (OUT/'swipe-failure.jsonl').read_text(encoding='utf-8').splitlines() if x][1:]
predelete=[json.loads(x) for x in (OUT/'before-delete-fixed.jsonl').read_text(encoding='utf-8').splitlines() if x][1:]
assert len(rows)==3 and rows[1]['swipe_id']==2
assert len(rows[1]['variables'])==3
namespace='901_rules_poc';rid='candidate-901-magic-bundle-ba577210e69dafd5';spell='imperial-magic:D:魔能爆'
def root(message,swipe):return message['variables'][swipe]['stat_data'][namespace]
assert root(rows[0],0)==root(failure[0],0), 'original floor changed'
assert root(rows[1],0)==root(failure[1],0), 'original D swipe changed'
assert root(rows[1],1)['revision']==4  # Failed pre-fix swipe remains as evidence, not repaired silently.
selected=root(rows[1],2)
assert selected==root(predelete[1],2), 'deletion or refresh changed the repaired swipe'
assert selected==root(rows[2],0), 'new floor differs from selected source'
assert selected['revision']==6 and len(selected['operations'])==6
s=selected['actors']['player']['state']
assert s['xp']==50 and s['learnedResources'][rid]['completedStages']==['D','C']
assert (s['resources']['精神魔力']['current'],s['resources']['精神魔力']['max'])==(0,12)
assert s['learnedResources'][spell]['grade']=='C'
assert s['learnedResources'][spell]['versions']==['D','C']
assert len(s['learnedResources'][spell]['grantHistory'])==2
assert {k:v for k,v in selected['actors'].items() if k!='player'}=={k:v for k,v in root(rows[0],0)['actors'].items() if k!='player'}
assert rows[1]['variables'][2]['schema']==rows[0]['variables'][0]['schema']
assert rows[1]['variables'][2]['initialized_lorebooks']==rows[0]['variables'][0]['initialized_lorebooks']
package=json.loads((OUT/'package.json').read_text(encoding='utf-8'))
target=ST/'public/901-resource-acceptance-20261028'
for m in package['modules']:
    assert hashlib.sha256((target/m['path']).read_bytes()).hexdigest()==m['sha256'],m['path']
assert hashlib.sha256((target/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
result={'status':'pass','scope':'isolated swipes, explicit carry, delete-and-recreate, reload persistence',
    'chatId':chat_id,'revision':6,'xp':50,'selectedSource':{'messageId':1,'swipeId':2},
    'finalFloor':2,'giftVersions':['D','C'],'operationCount':6,'otherActorsUnchanged':True,
    'originalFloorAndOriginalSwipeUnchanged':True,'missingMetadataInherited':True,
    'protectedPreexistingFiles':len(before),'changedProtectedFiles':changed,
    'isolatedRuntimeModules':len(package['modules']),'formalInstallationChanged':False,
    'chatSha256':hashlib.sha256(chat.read_bytes()).hexdigest()}
(OUT/'swipe-disk-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
