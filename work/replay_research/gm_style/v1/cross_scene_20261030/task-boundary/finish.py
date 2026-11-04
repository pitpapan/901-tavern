"""Retain credential-free evidence after UI testing; service stop is explicit."""
import shutil,json
from probe import L,U,HERE,lab,profile,read
target=L.with_name('901-task-boundary-evidence-20261104')
assert not target.exists()
assert lab.snapshot()==read(HERE/'protected-before.json')
shutil.copytree(L/'results',target/'results')
shutil.copytree(U/'characters',target/'characters')
cfg=profile(read(U/'settings.json'))[2]
lab.put(target/'fill-rule.json',cfg['charCardPrompt'])
for name in ('candidate.json','cases.json','table-rule-diff.json'):
    shutil.copyfile(HERE/name,target/name)
lab.put(HERE/'protection-after.json',{
    'unchanged':True,'formalFileCount':len(lab.snapshot()),
    'formalAutoUpdateEnabled':profile(read(lab.FORMAL/'settings.json'))[2]['autoUpdateEnabled'],
    'isolatedAutoUpdateEnabled':cfg['autoUpdateEnabled'],
    'evidenceDirectory':str(target),'testedPort':18095,
})
print('Formal snapshot unchanged; credential-free evidence saved:',target)
