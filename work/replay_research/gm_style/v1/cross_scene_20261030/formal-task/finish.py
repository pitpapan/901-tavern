"""Retain only credential-free isolated evidence before removing temporary data."""
from integrate import *
verify()
dst=L.with_name('901-formal-task-evidence-20261104');assert not dst.exists()
shutil.copytree(L/'results',dst/'results')
shutil.copytree(U/'characters',dst/'characters')
p.lab.put(dst/'fill-rule.json',profile(read(U/'settings.json'))[2]['charCardPrompt'])
shutil.copyfile(HERE/'cases.json',dst/'cases.json')
print('Retained no-credential evidence:',dst)
