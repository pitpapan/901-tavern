"""Read back only this test chat and hashes of preexisting protected files."""
import hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/'output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028'
ST=pathlib.Path('D:/github/sillyTavern')
before=json.loads((OUT/'protected-before.json').read_text(encoding='utf-8'))
changed=[p for p,h in before.items() if not (ST/p).exists() or hashlib.sha256((ST/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
chat_id='901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms'
chat=ST/'data/default-user/chats/901 资源取得隔离验收 20261028'/f'{chat_id}.jsonl'
rows=[json.loads(x) for x in chat.read_text(encoding='utf-8').splitlines() if x]
assert len(rows)==2,'No generated messages expected'
root=rows[1]['variables'][0]['stat_data']['901_rules_poc']
s=root['actors']['player']['state'];rid='candidate-901-magic-bundle-ba577210e69dafd5'
assert root['revision']==4 and s['xp']==50
assert s['learnedResources'][rid]['completedStages']==['D','C']
assert s['resources']['精神魔力']['current']==0 and s['resources']['精神魔力']['max']==12
assert s['learnedResources']['imperial-magic:D:魔能爆']['casterSource']==rid
assert len(root['operations'])==4
package=json.loads((OUT/'package.json').read_text(encoding='utf-8'))
target=ST/'public/901-resource-acceptance-20261028'
for m in package['modules']:
 assert hashlib.sha256((target/m['path']).read_bytes()).hexdigest()==m['sha256'],m['path']
assert hashlib.sha256((target/'live-script.js').read_bytes()).hexdigest()==package['script_sha256']
result={'status':'pass','scope':'isolated acquisition UI and actual disk readback; not full live certification',
 'chatId':chat_id,'messageId':0,'swipeId':0,'revision':root['revision'],'xp':s['xp'],
 'stages':s['learnedResources'][rid]['completedStages'],'mentalPool':s['resources']['精神魔力'],
 'gift':s['learnedResources']['imperial-magic:D:魔能爆'],'operationCount':len(root['operations']),
 'protectedPreexistingFiles':len(before),'changedProtectedFiles':changed,'isolatedRuntimeModules':len(package['modules']),
 'externalModelRequests':0,'formalInstallationChanged':False,
 'chatSha256':hashlib.sha256(chat.read_bytes()).hexdigest()}
(OUT/'disk-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
