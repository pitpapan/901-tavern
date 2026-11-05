"""Install accepted compression only; all live interaction uses 18109 isolation."""
from pathlib import Path
import importlib.util,sys,json,hashlib,shutil,os,subprocess,re,base64
H=Path(__file__).resolve().parent;PRE=H.parent/'summary-compression'
sp=importlib.util.spec_from_file_location('stage_formal_base',H.parent/'summary-formal/deploy.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
read=m.read;put=m.put;sha=m.sha;SRC=m.SRC
B=Path('C:/Users/pit/AppData/Local/901-compression-formal-source-20261105')
BACKUP=Path('C:/Users/pit/AppData/Local/901-compression-formal-backup-20261105')
L=Path('C:/Users/pit/AppData/Local/901-compression-formal-test-20261105');U=L/'data/default-user'
A=Path('C:/Users/pit/AppData/Local/901-summary-compression-evidence-20261105')
BASE='src/service/flight-mode/stage-coverage-base-901.js';HELPER='src/service/flight-mode/stage-coverage-901.js'
def bind():m.H=H;m.L=L;m.U=U;m.bind()
def prepare():
 assert not B.exists() and not BACKUP.exists() and not L.exists()
 original=read(H.parent/'summary-formal/installation.json')['installedHashes'];assert all(sha(SRC/k)==v for k,v in original.items())
 expected=read(PRE/'build-source.json')['files'];artifact=A/'candidate-extension/index.js'
 assert sha(artifact)==read(PRE/'served-accepted.json')['sha256']==read(A/'archive-manifest.json')['candidate-extension/index.js']
 wasm=base64.b64encode((A/'candidate-extension/sql-wasm.wasm').read_bytes())
 assert wasm in (SRC/'index.js').read_bytes() and wasm in artifact.read_bytes()
 assert not (SRC/BASE).exists()
 (B/BASE).parent.mkdir(parents=True);(B/BASE).write_bytes((SRC/HELPER).read_bytes())
 (B/HELPER).write_text((PRE/'compact.mjs').read_text(encoding='utf8').replace('./stage-coverage-base-901.mjs','./stage-coverage-base-901.js'),encoding='utf8')
 assert all(sha(B/k)==v for k,v in expected.items())
 put(H/'protected-before.json',m.d.p.lab.snapshot());put(H/'source-before.json',{**original,BASE:None})
 put(H/'source-verification.json',{'sourceHashesMatchAcceptedBuild':True,'baseGuardIsExactFormalCopy':True,'wasmAssetUnchanged':True,'acceptedArtifactHash':sha(artifact),'strategy':'Use exact browser-tested candidate; no dependency changes or new build.'})
 print('Formal baseline, both accepted source files, wasm and tested artifact verified.')
def install():
 before=read(H/'source-before.json');assert all((sha(SRC/k) if (SRC/k).exists() else None)==v for k,v in before.items())
 current=m.d.p.lab.snapshot();protected=read(H/'protected-before.json');assert all(current[k]==v for k,v in protected.items() if k!='settings.json')
 assert m.a.p.profile(read(m.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 targets={BASE:B/BASE,HELPER:B/HELPER,'index.js':A/'candidate-extension/index.js','dist/extension/index.js':A/'candidate-extension/index.js'}
 BACKUP.mkdir()
 for k in targets:
  if (SRC/k).exists():
   dest=BACKUP/k;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(SRC/k,dest)
 put(BACKUP/'manifest.json',{'previousHashes':before,'newFiles':[BASE]})
 for k,f in targets.items():
  dest=SRC/k;temp=dest.with_name(dest.name+'.901-compression-tmp');shutil.copyfile(f,temp);os.replace(temp,dest)
 after=m.d.p.lab.snapshot();assert all(after[k]==v for k,v in current.items() if k!='settings.json')
 unchanged={k:v for k,v in before.items() if k not in targets};assert all(sha(SRC/k)==v for k,v in unchanged.items())
 put(H/'installation.json',{'backup':str(BACKUP),'installedHashes':{k:sha(SRC/k) for k in targets},'untouchedIntegrationHashes':unchanged,'formalSettingsWritten':False,'originalChatsAndSavesUnchanged':True,'autoFillOff':True})
 print('Installed exact accepted compression; original guard and integration wiring retained.')
def setup():
 bind();m.setup()
 card=U/'characters'/(m.a.TEST+'.png')
 def patch(j):
  x=next(s for s in j['data']['extensions']['tavern_helper']['scripts'] if s['name']=='数据库事实验收采集');x['content']=x['content'].replace('localhost:18107','localhost:18109')
 card.write_bytes(m.a.png(card,patch))
 s=read(U/'settings.json');assert 'third-party/shujuku' not in s['extension_settings'].get('disabledExtensions',[])
 assert not (U/'extensions/shujuku-901-summary-compression').exists()
 info=read(H/'setup.json');info.update(port=18109,pluginMode='actual installed formal compression, no local substitute');put(H/'setup.json',info)
 print('18109 isolated fixture uses exact current formal host/header/template and model settings.')
def accepted():
 bind();r=m.p.rows();t=m.p.tables(r);b=read(H/'initial.json')['tables'];c=m.p.C;s=m.p.S;rel=m.p.R;text=t[s][-1][1]
 temp=L/'actual-summary.txt';temp.write_bytes(text.encode('utf8'))
 code="import fs from 'node:fs';import {decodeStage901} from "+json.dumps((PRE/'compact.mjs').as_uri())+";process.stdout.write(JSON.stringify(decodeStage901(fs.readFileSync(process.argv[1],'utf8'))));"
 decoded=json.loads(subprocess.check_output(['node','--input-type=module','-e',code,str(temp)],text=True,encoding='utf8'))
 checks={'decodedChroniclesExactlyMatch':decoded['chronicles']==b[c],'decodedRelationshipsExactlyMatch':decoded['relationships']==b[rel],'oldChroniclesUnchanged':t[c]==b[c],'oldSummariesUnchanged':t[s][:-1]==b[s],'relationshipsUnchanged':t[rel]==b[rel],'runtimeEqualsPersisted':r[0]['chat_metadata']['relationship_load']['tables']==t,'hiddenOnlyCoveredRows':sorted(map(int,m.p.hidden(r)))==list(range(1,16)),'explicitBorrowDirection':'黄泉向黎舟借入青竹伞' in text,'sameAcceptedCompression':text==read(PRE/'accepted.json')['newSummary']}
 put(H/'accepted.json',{'checks':checks,'newSummary':text,'characters':len(text),'tables':t,'hidden':m.p.hidden(r)});m.p.archive('accepted');print(json.dumps(checks,ensure_ascii=False,indent=2));assert all(checks.values())
def reload():bind();m.q.reload()
def return_case():bind();m.p.append('return')
def inspect_return():bind();m.p.inspect()
def recall():bind();m.q.recall()
def validate_return():
 bind();r=m.p.rows();t=m.p.tables(r);b=read(H/'initial.json')['tables'];rels=t[m.p.R];items={tuple(x[1:5]):x for x in rels[1:]}
 loan=items[('黄泉','黎舟','青竹伞','借入')];rumor=items[('黄泉','黎舟','转述传闻','可信度')];repair=items[('黄泉','黎舟','处理修伞','信任')]
 checks={'runtimeEqualsPersisted':r[0]['chat_metadata']['relationship_load']['tables']==t,'sevenItemsRetained':len(rels)==8,'priorFourItemsUnchanged':rels[1:5]==b[m.p.R][1:5],'borrowedFromCorrectPersonAndReturned':loan[5]=='已归还','rumorDistrustPreserved':rumor[5]=='不信','repairTrustPreserved':repair[5]=='信任','knowledgeScopeExactlyThree':all(set(x[7].split('、'))=={'御临风','黄泉','黎舟'} for x in (loan,rumor,repair)),'timeUnspecified':t[m.p.C][-1][2]=='未交代','privateCodeNotInRelationshipFacts':'瓷雀二鸣' not in json.dumps(rels,ensure_ascii=False)}
 put(H/'return-validation.json',checks);print(json.dumps(checks,ensure_ascii=False,indent=2));assert all(checks.values())
def model_evidence():
 bind();m.model_evidence()
def protect():
 before=read(H/'protected-before.json');now=m.d.p.lab.snapshot();changes={k:{'before':before.get(k),'after':now.get(k)} for k in before.keys()|now.keys() if before.get(k)!=now.get(k)};assert set(changes)<={'settings.json'},changes
 installation=read(H/'installation.json');assert all(sha(SRC/k)==v for k,v in {**installation['installedHashes'],**installation['untouchedIntegrationHashes']}.items())
 assert m.a.p.profile(read(m.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 assert m.a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 put(H/'protection.json',{'unchangedFormalFiles':len(before)-len(changes),'concurrentSettingsChangesPreserved':changes,'formalSettingsWritten':False,'installedPluginVerified':True,'formalAndIsolatedAutoFillOff':True,'requests':log.count('Chat Completion request:'),'responses':log.count('Chat Completion response:')});print('Formal chats/saves protected; settings retained; auto fill off.')
if __name__=='__main__':globals()[sys.argv[1]]()
