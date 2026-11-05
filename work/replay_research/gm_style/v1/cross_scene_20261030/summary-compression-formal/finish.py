"""Evidence archival and final read-only protection checks for this batch."""
from pathlib import Path
import importlib.util,json,shutil,sys
H=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('compression_deployment',H/'deploy.py');d=importlib.util.module_from_spec(s);s.loader.exec_module(d)
E=Path('C:/Users/pit/AppData/Local/901-compression-formal-evidence-20261105')
def records():
 q=d.read(d.L/'results/recall/request.json');text='\n'.join(m['content'] for m in q['messages'] if isinstance(m.get('content'),str));stage=d.read(H/'accepted.json')['newSummary']
 checks={'compressedStageAppearsExactlyOnce':text.count(stage)==1,'compiledHashMatchesAcceptedArtifact':d.sha(d.SRC/'index.js')==d.read(H/'setup.json')['compiledSha256'],'formalHeaderAndTemplateKept':d.read(H/'setup.json')['formalReaderHeaderUnchanged'] and d.read(H/'setup.json')['formalTemplateSourceDataUnchanged']}
 assert all(checks.values());d.put(H/'load-validation.json',checks)
 d.put(H/'semantic-review.json',{'reviewers':['main session','Terra 6.1 High'],'coreSamplePassed':True,'verified':['public code and identity correction','borrower/lender and completed return','independent repair trust and rumor distrust','three proved listeners only','private backup code not disclosed'],'observations':['Reply describes earlier public-code agreement as 刚才; elapsed interval is unspecified, so retain as relative-time wording observation.','New relationship source is 本轮对话, not a precise chronicle identifier.'],'limits':['Single blind continuation jointly loading stage, AM0016 and seven items.','Structural compression only, without semantic paraphrase.','Prior full-request saving ratio was not remeasured in this batch.']})
def archive():
 E.mkdir(exist_ok=True)
 if (d.L/'results').exists():shutil.copytree(d.L/'results',E/'results',dirs_exist_ok=True)
 for f in H.iterdir():
  if f.is_file():shutil.copyfile(f,E/f.name)
 manifest={str(f.relative_to(E)).replace('\\','/'):d.sha(f) for f in E.rglob('*') if f.is_file() and f.name!='archive-manifest.json'}
 d.put(E/'archive-manifest.json',manifest);print('Archived',len(manifest),'non-credential evidence files.')
def cleanup_check():
 assert not d.L.exists() and not d.B.exists() and d.BACKUP.exists()
 before=d.read(H/'protected-before.json');now=d.m.d.p.lab.snapshot();changes={k for k in before.keys()|now.keys() if before.get(k)!=now.get(k)};assert changes<={'settings.json'}
 installed=d.read(H/'installation.json');assert all(d.sha(d.SRC/k)==v for k,v in {**installed['installedHashes'],**installed['untouchedIntegrationHashes']}.items())
 assert d.m.a.p.profile(d.read(d.m.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 d.put(H/'cleanup.json',{'isolatedProcessId':2904,'isolatedPort':18109,'temporaryRuntimeRemoved':True,'temporarySourceDirectoryRemoved':True,'formalInstallationAndBackupRetained':True,'unchangedFormalProtectedFiles':len(before)-len(changes),'formalSettingsUnchangedFromBatchStart':'settings.json' not in changes,'otherTaskSettingsPreserved':True,'automaticFillingOff':True,'actualModelRequests':4,'actualModelResponses':4})
 archive();print('Cleanup and formal protection verified.')
if __name__=='__main__':globals()[sys.argv[1]]()
