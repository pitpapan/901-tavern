"""Keep credential-free test artifacts and verify formal data before cleanup."""
import json,shutil,importlib.util
from pathlib import Path
H=Path(__file__).resolve().parent
probe_spec=importlib.util.spec_from_file_location('lifecycle_probe',H/'probe.py');p=importlib.util.module_from_spec(probe_spec);probe_spec.loader.exec_module(p)
spec=importlib.util.spec_from_file_location('final_candidate',H/'candidate.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
before=p.read(H.parent/'prompt-consolidation/table-rules.before.json')
after={n:{**v,**c.RULES[n]} for n,v in before.items()}
size={'system':len(c.SYSTEM),'tableRules':sum(len(v) for t in c.RULES.values() for v in t.values()),'ddlUnchanged':all(before[n]['ddl']==after[n]['ddl'] for n in before)}
size['total']=size['system']+size['tableRules'];size['reductionFrom10437']=round((1-size['total']/10437)*100,2)
p.lab.put(H/'size-comparison.json',size);p.lab.put(H/'table-rules.candidate.json',after)
current=p.lab.snapshot();assert current==p.read(H/'protected-before.json')
dest=Path('C:/Users/pit/AppData/Local/901-memory-lifecycle-evidence-20261104');assert not dest.exists();dest.mkdir()
shutil.copytree(p.L/'results',dest/'results');(dest/'characters').mkdir();shutil.copyfile(p.U/'characters'/(p.lab.NAME+'.png'),dest/'characters'/(p.lab.NAME+'.png'))
for n in ('fixture.json','cases.json','prompts.candidate.json','table-rules.candidate.json','verification.json','recall.json'):shutil.copyfile(H/n,dest/n)
p.lab.put(H/'protection-after.json',{'protectedCount':len(current),'allHashesMatch':True,'autoFillFormal':p.profile(p.read(p.lab.FORMAL/'settings.json'))[2]['autoUpdateEnabled'],'candidateNotInstalled':True,'archive':str(dest),'archivedCredentials':False,'size':size})
print(json.dumps({'protected':len(current),'archive':str(dest),'size':size},ensure_ascii=False))
