"""Install the adopted, already-tested artifact; validate only in a new instance."""
from pathlib import Path
import importlib.util,sys,json,copy,shutil,hashlib,subprocess,os,re
H=Path(__file__).resolve().parent
PRE=H.parent/'summary-coverage'
spec=importlib.util.spec_from_file_location('coverage_acceptance',PRE/'probe.py')
q=importlib.util.module_from_spec(spec);spec.loader.exec_module(q)
p=q.p;d=p.d;a=p.a;read=p.read;put=p.put
SRC=d.SRC
L=Path('C:/Users/pit/AppData/Local/901-summary-formal-test-20261105')
U=L/'data/default-user'
B=Path('C:/Users/pit/AppData/Local/901-summary-formal-source-20261105')
BACKUP=Path('C:/Users/pit/AppData/Local/901-summary-formal-backup-20261105')
EVIDENCE=Path('C:/Users/pit/AppData/Local/901-summary-coverage-evidence-20261105')
sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
def bind():
 q.H=H;q.L=L;q.U=U;p.H=H;p.L=L;p.U=U;d.H=H;d.L=L;d.U=U
 a.H=H;a.L=L;a.U=U
def prepare():
 assert not BACKUP.exists()
 baseline=read(PRE/'build-source.json')
 assert sha(SRC/'index.js')==baseline['formalPluginSha256']
 manifest=read(EVIDENCE/'archive-manifest.json')
 candidate=EVIDENCE/'candidate-extension/index.js'
 assert sha(candidate)==manifest['candidate-extension/index.js']==read(PRE/'build-artifact.json')['testedAndArchivedSha256']
 assert b'[\xe9\x9a\x94\xe7\xa6\xbb\xe6\x95\x85\xe9\x9a\x9c\xe6\xb3\xa8\xe5\x85\xa5' not in candidate.read_bytes()
 targets=list(baseline['files'])
 B.mkdir(parents=True,exist_ok=True)
 for name in targets:
  dest=B/name;dest.parent.mkdir(parents=True,exist_ok=True)
  if (SRC/name).exists():shutil.copyfile(SRC/name,dest)
  elif dest.exists():dest.unlink()
 subprocess.run(['git','-c','core.whitespace=cr-at-eol','apply','--check',str(PRE/'source.patch')],cwd=B,check=True)
 subprocess.run(['git','-c','core.whitespace=cr-at-eol','apply',str(PRE/'source.patch')],cwd=B,check=True)
 helper=B/'src/service/flight-mode/stage-coverage-901.js'
 helper.write_bytes(helper.read_bytes().replace(b'\r\n',b'\n'))
 assert all(sha(B/k)==v for k,v in baseline['files'].items())
 put(H/'source-verification.json',{'allFourSourcesExactlyMatchAcceptedBuild':True,'acceptedCompiledHash':sha(candidate),'formalBaselineHash':sha(SRC/'index.js'),'artifactStrategy':'Install exact prior browser-tested binary; no new build or dependency changes.'})
 put(H/'protected-before.json',d.p.lab.snapshot())
 put(H/'source-before.json',{k:sha(SRC/k) if (SRC/k).exists() else None for k in targets+['index.js','dist/extension/index.js']})
 print('Source patch reproduced exactly; accepted artifact and current formal baseline match.')
def install():
 before=read(H/'source-before.json');protected=read(H/'protected-before.json')
 assert all((sha(SRC/k) if (SRC/k).exists() else None)==v for k,v in before.items())
 current=d.p.lab.snapshot();assert all(current[k]==v for k,v in protected.items() if k!='settings.json')
 assert a.p.profile(read(a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 BACKUP.mkdir()
 for k,v in before.items():
  if v is not None:
   dest=BACKUP/k;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(SRC/k,dest)
 put(BACKUP/'manifest.json',before)
 targets={k:B/k for k in read(PRE/'build-source.json')['files']}
 for k in ('index.js','dist/extension/index.js'):targets[k]=EVIDENCE/'candidate-extension/index.js'
 for k,f in targets.items():
  target=SRC/k;tmp=target.with_name(target.name+'.901-stage-tmp');shutil.copyfile(f,tmp);os.replace(tmp,target)
 after=d.p.lab.snapshot();assert all(after[k]==v for k,v in current.items() if k!='settings.json')
 put(H/'installation.json',{'backup':str(BACKUP),'installedHashes':{k:sha(SRC/k) for k in targets},'previousHashes':before,'formalSettingsWritten':False,'originalChatsAndSavesUnchanged':True,'autoFillOff':True,'acceptedArtifactReused':True})
 print('Installed four exact source files and accepted compiled artifact; no user data written.')
def setup():
 bind();a.setup()
 template=json.loads(a.rows(a.F/a.TARGET)[0]['chat_metadata']['TavernDB_ACU_ScopedConfig']['template']['']['templateStr'])
 put(H/'new-template.json',template);a.prepare_return()
 r=a.rows(p.A/'chat.jsonl');original=p.tables(r)
 def rules(x):
  if isinstance(x,dict):
   for k,v in list(x.items()):
    if k in template and isinstance(v,dict) and 'sourceData' in v:v['sourceData']=copy.deepcopy(template[k]['sourceData'])
    rules(v)
   if isinstance(x.get('templateStr'),str):
    t=json.loads(x['templateStr']);rules(t);x['templateStr']=json.dumps(t,ensure_ascii=False)
  elif isinstance(x,list):
   for v in x:rules(v)
 rules(r);assert p.tables(r)==original
 r[0]['chat_metadata'].pop('memory_lifecycle_evidence',None);r[0]['chat_metadata'].pop('relationship_load',None)
 assert len(original[p.C])==16 and len(original[p.R])==8 and len(original[p.S])==2 and p.hidden(r)==[]
 a.write_rows(U/a.TESTPATH,r);shutil.copyfile(p.A/'book.json',U/'worlds'/(d.p.lab.BOOK+'.json'))
 hashes=[]
 def patch(j):
  host=a.host_of(j);body=host['content'];assert body.count("max_chat_history:'all'")==1
  host['content']=body.replace("max_chat_history:'all'","max_chat_history:0",1)
  hashes.append(hashlib.sha256(body.encode()).hexdigest())
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集')
  rec['content']=rec['content'].replace('localhost:18101','localhost:18107')
 card=U/'characters'/(a.TEST+'.png');card.write_bytes(a.png(card,patch))
 s=read(U/'settings.json');assert 'third-party/shujuku' not in s['extension_settings'].get('disabledExtensions',[])
 formal=read(a.F/'settings.json')
 for k in ('custom_model','custom_include_body','custom_exclude_body'):assert s['oai_settings'].get(k)==formal['oai_settings'].get(k)
 assert a.p.profile(s)[2]['autoUpdateEnabled'] is False
 put(H/'initial.json',{'source':str(p.A),'tables':original,'hidden':[],'summaryThreshold':15})
 put(H/'setup.json',{'port':18107,'pluginMode':'actual installed formal extension, no user-local replacement','formalHostSha256':hashes[0],'hostChanges':['history all -> 0 for blind recall only'],'formalReaderHeaderUnchanged':True,'formalTemplateSourceDataUnchanged':True,'currentRequestOverridesPreserved':True,'copiedSelectedModel':s['oai_settings'].get('custom_model'),'autoFillOff':True,'compiledSha256':sha(SRC/'index.js')})
 (H/'question.txt').write_text(p.QUESTION,encoding='utf8')
 (H/'new-template.json').unlink();(H/'return-input.json').unlink()
 p.archive('initial');p.append('summary')
 print('18107 fixture ready with current formal host/header/template and request settings.')
def accepted():bind();q.after_fill('accepted')
def reload():bind();q.reload()
def return_case():bind();p.append('return')
def inspect_return():bind();p.inspect()
def recall():bind();q.recall()
def model_evidence():
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace');calls=[]
 for i,chunk in enumerate(log.split('Chat Completion request:')[1:],1):
  req,sep,resp=chunk.partition('Chat Completion response:');assert sep
  requested=re.search(r"\bmodel: '([^']+)'",req).group(1)
  reported=re.search(r"\bmodel: '([^']+)'",resp).group(1)
  calls.append({'call':i,'requestedModel':requested,'responseReportedModel':reported})
 assert len(calls)==4 and len({x['requestedModel'] for x in calls})==1
 record={'calls':calls,'source':'server console.debug requestBody immediately before fetch; JSON response after fetch','noModelConfigurationChangesByThisBatch':True,'requestOverrideFieldsAtCopy':'empty; copied current formal state unchanged','responseLabelIsNotProofOfCustomBodyOverride':True}
 put(H/'model-evidence.json',record)
 r=read(H/'recall.json');r['requestedModel']=calls[-1]['requestedModel'];r['responseReportedModel']=calls[-1]['responseReportedModel'];r['modelFieldMeaning']='Frontend/request model identifier; provider response reports a different label.';put(H/'recall.json',r)
 print(json.dumps(record,ensure_ascii=False,indent=2))
def protect():
 before=read(H/'protected-before.json');now=d.p.lab.snapshot()
 changes={k:{'before':before.get(k),'after':now.get(k)} for k in before.keys()|now.keys() if before.get(k)!=now.get(k)}
 assert set(changes)<={'settings.json'},changes
 assert all(sha(SRC/k)==v for k,v in read(H/'installation.json')['installedHashes'].items())
 assert a.p.profile(read(a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 assert a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 put(H/'protection.json',{'unchangedFormalProtectedFiles':len(before)-len(changes),'concurrentSettingsChangesPreserved':changes,'formalSettingsWritten':False,'formalAndIsolatedAutoFillOff':True,'installedPluginUnchanged':True,'actualModelRequests':log.count('Chat Completion request:'),'actualModelResponses':log.count('Chat Completion response:')})
 print('Original chats/saves preserved; installed hashes match; automatic filling off.')
if __name__=='__main__':globals()[sys.argv[1]]()
