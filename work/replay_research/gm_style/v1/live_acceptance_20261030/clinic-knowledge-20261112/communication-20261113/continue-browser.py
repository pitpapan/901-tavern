"""Refresh the existing local capture-only Tavern. Never reads credentials or formal state."""
from pathlib import Path
import importlib.util,json,shutil,hashlib
O=Path(__file__).resolve().parent; H=O.parent
spec=importlib.util.spec_from_file_location('lab',H.parent/'action-failure/timeout-20261105/lab.py');lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
env=json.loads((H/'browser-environment.json').read_text(encoding='utf8'));A=Path(env['app']);U=A/'data/default-user'
assert 'clinic-browser-20261113' in str(A.resolve())
guard=(A/'offline-guard.mjs').read_text(encoding='utf8');backend=(A/'src/endpoints/backends/chat-completions.js').read_text(encoding='utf8')
assert 'globalThis.fetch=denied' in guard and 'CLINIC_CAPTURE_ONLY_NO_MODEL_CALL' in backend and 'upstreamCalls:0' in backend
evidence=O/'browser-evidence';evidence.mkdir(exist_ok=True)
cp=U/'chats'/lab.NAME/'901 帝都正式续玩 20261106.jsonl'
assert not (evidence/'before.chat.jsonl').exists(),'Already prepared; do not reset an active verification'
shutil.copy2(cp,evidence/'before.chat.jsonl')
shutil.copy2(H/'browser-evidence/received.seed.jsonl',cp)
shutil.copytree(O/'package/901-opening-combat',A/'public/901-opening-combat',dirs_exist_ok=True)
entry=(O/'candidate-entry.js').read_text(encoding='utf8')+'\n'+(H/'browser-controls.js').read_text(encoding='utf8')+'\n'+(O/'browser-controls.js').read_text(encoding='utf8')
def transform(j):j['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(U/'characters'/(lab.NAME+'.png'),transform)
fixture={'nonCanon':True,'rows':{
 'sheet_relationship_facts':[
  [901301,'御临风','同行者','先交推荐信再询问住宿','当前提议','尚未交信或获准住宿','隔离测试；保留聊天messageId9玩家提议，不是完成回执','在场者听见该提议，不因此知道馆主旧交'],
  [901302,'九雪医馆馆主','雪老','clinic.owner.xuelao.old-friend：二者有旧且不是同一人','作者事实','关系成立；不表示任何特定角色已获知','隔离测试；clinic-knowledge-catalog.mjs原采用事实','作者资料；逐人取得以当前storyKnowledge显式回执为准，不自动共享']
 ],
 'sheet_ji_yao_biao':[[901303,'ISOLATED-REJECTED-10','保留聊天messageId10','已拒错误回复追溯（非Canon）','旧回复曾让布莱特说“老馆主与雪老有旧”，用户已拒绝此处人物知情；不能据此授予布莱特或同行者知识。来源：clinic-knowledge-catalog.rejectedNarration，原messageId10/swipe0。','该句仅供错误追溯，不是新的实际告知或接收事件。']]
}}
lab.put(O/'memory-fixture.json',fixture);lab.put(A/'public/communication-memory-fixture.json',fixture)
lab.put(evidence/'setup.json',{'app':str(A),'port':18123,'upstreamBlocked':True,'credentialsRead':False,'formalWrites':False,'startingSeed':'browser-evidence/received.seed.jsonl','captureFilesBefore':[p.name for p in (A/'clinic-captures').glob('*.json')],'fixtureEntrySha256':hashlib.sha256(entry.encode()).hexdigest()})
print(json.dumps({'prepared':True,'port':18123,'credentialsRead':False,'upstreamCalls':0}))
