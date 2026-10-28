"""Stage a unique test card and the existing candidate module closure; never deploy."""
import hashlib, json, pathlib, uuid
ROOT=pathlib.Path(__file__).resolve().parents[3]
HERE=pathlib.Path(__file__).resolve().parent
BASE=ROOT/'output/replay_tavern/six_books_20261023_candidate'
OUT=BASE/'scene_test/resource-acquisition-20261028'
OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads((BASE/'runtime_patch_manifest.json').read_text(encoding='utf-8'))
staged=[]
for item in manifest['modules']:
    src=BASE/pathlib.Path(item['destination'])
    data=src.read_bytes()
    if hashlib.sha256(data).hexdigest()!=item['sha256']: raise ValueError('Candidate changed: '+str(src))
    rel=src.relative_to(BASE/'runtime_patch/901-opening-combat')
    dst=OUT/'runtime'/rel;dst.parent.mkdir(parents=True,exist_ok=True)
    dst.write_bytes(data.replace(b'/901-opening-combat/',b'/901-resource-acceptance-20261028/'))
    staged.append({'path':rel.as_posix(),'sha256':hashlib.sha256(dst.read_bytes()).hexdigest()})
# The base replay gate closure omits the optional existing combat dialog.
rel=pathlib.Path('work/rules_engine/combat/host-ui.mjs')
if not any(item['path']==rel.as_posix() for item in staged):
    data=(ROOT/rel).read_bytes()
    dst=OUT/'runtime'/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
    staged.append({'path':rel.as_posix(),'sha256':hashlib.sha256(data).hexdigest()})
live=(HERE/'live-script.js').read_text(encoding='utf-8')
(OUT/'runtime/live-script.js').write_text(live,encoding='utf-8')
base=json.loads((ROOT/'work/rules_engine/combat/duel-v2.card.json').read_text(encoding='utf-8'))
mvu=base['data']['extensions']['tavern_helper']['scripts'][0]
mvu['id']=str(uuid.uuid4())
name='901 资源取得隔离验收 20261028'
entry={'type':'script','enabled':True,'id':str(uuid.uuid4()),'name':name,
       'content':"await import('/901-resource-acceptance-20261028/live-script.js');",
       'info':'仅隔离卡手动按钮，无模型请求。','button':{'enabled':False,'buttons':[]},'data':{}}
data={k:'' for k in ['personality','scenario','mes_example','system_prompt','post_history_instructions']}
data.update(name=name,description='资源取得隔离验收。所有角色及100XP仅为测试夹具，不是正式剧情或实际取得。',
 first_mes='隔离验收已打开。请通过上方测试按钮执行，不发送剧情消息。',creator_notes='独立卡、独立模块路径；不修改正式卡与正式聊天。',
 alternate_greetings=[],tags=['901','isolated'],creator='901',character_version='resource-acceptance-20261028',
 extensions={'tavern_helper':{'scripts':[mvu,entry],'variables':{}}})
(OUT/'resource-acquisition.card.json').write_text(json.dumps({'spec':'chara_card_v2','spec_version':'2.0','data':data},ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'package.json').write_text(json.dumps({'status':'staged-not-installed','modules':staged,'script_sha256':hashlib.sha256((OUT/'runtime/live-script.js').read_bytes()).hexdigest()},indent=2),encoding='utf-8')
print(json.dumps({'out':str(OUT),'modules':len(staged),'card':name},ensure_ascii=False))
