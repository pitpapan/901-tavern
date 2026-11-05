"""Compression candidate: disposable build and 18108 only. No formal writes."""
from pathlib import Path
import importlib.util,json,sys,shutil,hashlib,subprocess,copy,re
H=Path(__file__).resolve().parent
sp=importlib.util.spec_from_file_location('stage_formal',H.parent/'summary-formal/deploy.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
read=m.read;put=m.put;sha=m.sha;SRC=m.SRC
B=Path('C:/Users/pit/AppData/Local/901-summary-compression-build-20261105')
L=Path('C:/Users/pit/AppData/Local/901-summary-compression-test-20261105');U=L/'data/default-user'
DEST=U/'extensions/shujuku-901-summary-compression'
BASE='src/service/flight-mode/stage-coverage-base-901.js'
HELPER='src/service/flight-mode/stage-coverage-901.js'
def bind():m.H=H;m.L=L;m.U=U;m.bind()
def prepare():
 assert not L.exists()
 assert all(sha(SRC/k)==v for k,v in read(H.parent/'summary-formal/installation.json')['installedHashes'].items())
 put(H/'protected-before.json',m.d.p.lab.snapshot())
 put(H/'plugin-before.json',{k:sha(SRC/k) for k in read(H.parent/'summary-formal/installation.json')['installedHashes']})
 shutil.copytree(SRC,B,dirs_exist_ok=True,ignore=shutil.ignore_patterns('.git','node_modules','dist'))
 (B/BASE).write_bytes((SRC/HELPER).read_bytes())
 (B/HELPER).write_text((H/'compact.mjs').read_text(encoding='utf8').replace('./stage-coverage-base-901.mjs','./stage-coverage-base-901.js'),encoding='utf8')
 lock=Path('C:/Users/pit/AppData/Local/901-summary-coverage-evidence-20261105/candidate-build-package-lock.json');shutil.copyfile(lock,B/'package-lock.json')
 # Reuse the approved real-provider tests with the new compressed representation.
 pre=H.parent/'summary-coverage'
 fixture=read(H.parent/'summary-formal/initial.json')
 put(B/'tests/service/table/901-stage-fixture.json',fixture)
 r=m.a.rows(m.p.A/'chat.jsonl')
 def seek(x):
  if isinstance(x,dict):
   if 'sheet_ji_yao_biao' in x and isinstance(x['sheet_ji_yao_biao'],dict) and len(x['sheet_ji_yao_biao'].get('content',[]))>1:return x
   for v in x.values():
    y=seek(v)
    if y is not None:return y
  elif isinstance(x,list):
   for v in x:
    y=seek(v)
    if y is not None:return y
  return None
 data=copy.deepcopy(seek(list(reversed(r))));assert data is not None
 for k,rows in fixture['tables'].items():data[k]['content']=copy.deepcopy(rows)
 assert len(data['sheet_ji_yao_biao']['content'])==16
 put(B/'tests/service/table/901-stage-full-fixture.json',data)
 for target,snippet in [('tests/service/table/table-update-commit.test.ts','commit-tests.txt'),('tests/service/flight-mode/flight-mode-hidden-rows.test.ts','hidden-tests.txt')]:
  with (B/target).open('a',encoding='utf8') as f:f.write('\n'+(pre/snippet).read_text(encoding='utf8'))
 test=B/'tests/service/table/sql-table-service.test.ts';text=test.read_text(encoding='utf8');at=text.rfind('\n});',0,text.index("\ndescribe('901 adopted chronicle sequence"));assert at>0
 text=text[:at]+'\n'+(pre/'sql-sync-tests.txt').read_text(encoding='utf8').replace('【阶段保真汇编 v1】','【阶段保真压缩 v2】')+text[at:];test.write_text(text,encoding='utf8')
 put(H/'build-source.json',{'formalUnchanged':True,'baseGuardExactCopy':sha(B/BASE)==sha(SRC/HELPER),'files':{k:sha(B/k) for k in [BASE,HELPER]}})
 print('Disposable source prepared; original coverage guard retained byte-for-byte.')
def setup():
 bind();m.setup()
 card=U/'characters'/(m.a.TEST+'.png')
 def patch(j):
  rec=next(x for x in j['data']['extensions']['tavern_helper']['scripts'] if x['name']=='数据库事实验收采集');rec['content']=rec['content'].replace('localhost:18107','localhost:18108')
 card.write_bytes(m.a.png(card,patch))
 s=read(U/'settings.json');disabled=s['extension_settings'].setdefault('disabledExtensions',[]);disabled.append('third-party/shujuku');put(U/'settings.json',s)
 DEST.mkdir(parents=True);manifest=read(SRC/'manifest.json');manifest['display_name']='901 阶段压缩（仅隔离）';put(DEST/'manifest.json',manifest)
 for f in (B/'dist/extension').iterdir():
  if f.is_file() and f.name!='manifest.json':shutil.copyfile(f,DEST/f.name)
 rec=read(H/'setup.json');rec.update(port=18108,pluginMode='isolated user-local compression build; formal plugin disabled only in isolated settings',compiledSha256=sha(DEST/'index.js'));put(H/'setup.json',rec)
 m.p.archive('before-reject')
 print('18108 isolated fixture ready; formal header/template unchanged, automatic filling off.')
def serve(mode):
 raw=(B/'dist/extension/index.js').read_text(encoding='utf8')
 if mode=='reject':
  anchor='function assertStageCoverage901(';assert raw.count(anchor)==1
  at=raw.index('{',raw.index(anchor))+1
  fault='if(arguments[0]?.sheet_relationship_facts&&arguments[2]?.enabled){const k=arguments[2].bigSummarySheetKey,b=arguments[0][k]?.content,a=arguments[1][k]?.content;if(a?.length>b?.length)a[a.length-1][1]=a[a.length-1][1].split("\\n").filter(l=>!l.includes("\\tAM0003\\t")).join("\\n");}'
  raw=raw[:at]+fault+raw[at:]
  put(H/'fault-injection.json',{'scope':'isolated served binary only, not candidate source','fault':'omit AM0003 private-knowledge chronicle just before real coverage gate','code':fault})
 (DEST/'index.js').write_text(raw,encoding='utf8');put(H/('served-'+mode+'.json'),{'mode':mode,'sha256':sha(DEST/'index.js')})
 print('Isolated served mode:',mode)
def rejected():bind();m.q.after_fill('rejected')
def accepted():
 bind();r=m.p.rows();t=m.p.tables(r);b=read(H/'initial.json')['tables'];c=m.p.C;s=m.p.S;rel=m.p.R
 text=t[s][-1][1]
 # Decode the actual saved format in Node as an independent check of all values.
 temp=L/'actual-summary.txt';temp.write_bytes(text.encode('utf8'))
 code="import fs from 'node:fs';import {decodeStage901} from "+json.dumps((H/'compact.mjs').as_uri())+";process.stdout.write(JSON.stringify(decodeStage901(fs.readFileSync(process.argv[1],'utf8'))));"
 decoded=json.loads(subprocess.check_output(['node','--input-type=module','-e',code,str(temp)],text=True,encoding='utf8'))
 checks={'decodedChroniclesExactlyMatch':decoded['chronicles']==b[c],'decodedRelationshipsExactlyMatch':decoded['relationships']==b[rel],'oldChroniclesUnchanged':t[c]==b[c],'oldSummariesUnchanged':t[s][:-1]==b[s],'relationshipsUnchanged':t[rel]==b[rel],'runtimeEqualsPersisted':r[0]['chat_metadata']['relationship_load']['tables']==t,'hiddenOnlyCoveredRows':sorted(map(int,m.p.hidden(r)))==list(range(1,16)),'explicitBorrowDirection':'黄泉向黎舟借入青竹伞' in text}
 baseline=read(H.parent/'summary-formal/accepted.json')['newSummary'];checks['actuallyShorter']=len(text)<len(baseline)
 put(H/'accepted.json',{'checks':checks,'newSummary':text,'tables':t,'hidden':m.p.hidden(r),'characters':{'formalFull':len(baseline),'compressed':len(text),'reductionPercent':round((1-len(text)/len(baseline))*100,2)}})
 m.p.archive('accepted');print(json.dumps({'checks':checks,'characters':read(H/'accepted.json')['characters']},ensure_ascii=False,indent=2));assert all(checks.values())
def reload():bind();m.q.reload()
def return_case():bind();m.p.append('return')
def inspect_return():bind();m.p.inspect()
def recall():bind();m.q.recall()
def protect():
 now=m.d.p.lab.snapshot();before=read(H/'protected-before.json');assert now==before
 assert all(sha(SRC/k)==v for k,v in read(H/'plugin-before.json').items())
 assert m.a.p.profile(read(m.a.F/'settings.json'))[2]['autoUpdateEnabled'] is False
 assert m.a.p.profile(read(U/'settings.json'))[2]['autoUpdateEnabled'] is False
 log=(L/'stdout.log').read_text(encoding='utf8',errors='replace')
 put(H/'protection.json',{'unchangedFormalFiles':len(before),'formalPluginUnchanged':True,'formalAndIsolatedAutoFillOff':True,'requests':log.count('Chat Completion request:'),'responses':log.count('Chat Completion response:')})
 print('Formal protected files and plugin unchanged; automatic filling off.')
if __name__=='__main__':
 if sys.argv[1]=='serve':serve(sys.argv[2])
 else:globals()[sys.argv[1]]()
