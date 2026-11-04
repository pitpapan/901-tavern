"""Retain credential-free evidence and record formal preservation."""
from probe_consolidation import *
assert p.lab.snapshot()==read(HERE/'protected-before.json')
dst=L.with_name('901-prompt-consolidation-evidence-20261104');assert not dst.exists()
shutil.copytree(L/'results',dst/'results');shutil.copytree(U/'characters',dst/'characters')
for name in ('cases.json','prompts.candidate.json','table-rules.candidate.json'):
    shutil.copyfile(HERE/name,dst/name)
p.lab.put(HERE/'protection-after.json',{'formalFilesUnchanged':len(p.lab.snapshot()),'formalAutoUpdateEnabled':profile(read(p.lab.FORMAL/'settings.json'))[2]['autoUpdateEnabled'], 'isolatedAutoUpdateEnabled':profile(read(U/'settings.json'))[2]['autoUpdateEnabled'],'evidenceDirectory':str(dst),'testedPort':18097})
print('All formal files unchanged; retained credential-free evidence:',dst)
