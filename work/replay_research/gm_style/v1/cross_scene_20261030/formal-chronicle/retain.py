"""Retain test artifacts only, excluding credentials and raw logs."""
from inspect_run import L,U
from merge import *
if __name__=='__main__':
    evidence=Path('C:/Users/pit/AppData/Local/901-formal-chronicle-evidence-20261104')
    assert read(HERE/'verification.json')['formalAutoUpdateEnabled'] is False
    evidence.mkdir(exist_ok=False)
    import shutil
    targets=[Path('characters')/(lab.NAME+'.png'),Path('chats')/lab.NAME/(lab.CHAT+'.jsonl'),Path('worlds')/(lab.BOOK+'.json')]
    for rel in targets:
        dst=evidence/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(U/rel,dst)
    lab.put(evidence/'tested-fill-rule.json',{'autoUpdateEnabled':False,'charCardPrompt':profile(read(U/'settings.json'))[2]['charCardPrompt']})
    shutil.copyfile(live_style,evidence/'narrative-style.json')
    shutil.copyfile(HERE/'verification.json',evidence/'verification.json')
    print(evidence)
