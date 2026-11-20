"""Restore a retained seed only inside this new disposable experiment."""
from pathlib import Path
import hashlib,json,shutil,sys,re
E=Path(__file__).resolve().parent
setup=json.loads((E/'setup.json').read_text(encoding='utf-8'))
A=Path(setup['app']).resolve();label=sys.argv[1];tag=sys.argv[2] if len(sys.argv)>2 else label
assert re.fullmatch(r'[-A-Za-z0-9]+',tag)
assert label in ['baseline','after-received','reopened-preserved']
snapshot=json.loads((E/'browser'/(label+'.json')).read_text(encoding='utf-8'))
chat=snapshot['chatId'];assert 'Branch #' in chat and not any(x in chat for x in ['/','\\'])
target=(A/'data/default-user/chats'/setup['character']/(chat+'.jsonl')).resolve()
assert target.is_relative_to(A) and str(A).startswith('C:')
source=E/'browser'/(label+'.seed.jsonl')
before=E/'browser'/('before-restore-'+tag+'.jsonl')
assert not before.exists();shutil.copy2(target,before);shutil.copy2(source,target)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(source)==sha(target)
(E/'browser'/('restore-'+tag+'.json')).write_text(json.dumps({'label':label,'tag':tag,'sourceSha256':sha(source),
 'beforeRestorationArchived':before.name,'chatId':chat,'restoredOnlyDisposableTestChat':True,
 'modelCallsThisRestoration':0,'purpose':'Parallel three-state preparation; locally intercepted failure notices archived, not reused as story history. Global model usage is recorded in run.json.'},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'restoredSeed':label,'chatId':chat,'messages':len(snapshot['chat']),'modelCallsThisRestoration':0},ensure_ascii=True))
