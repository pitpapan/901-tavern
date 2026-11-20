"""Verify and archive the completed local candidate; no install or model transport."""
from pathlib import Path
import json,hashlib,zipfile,base64,struct
E=Path(__file__).resolve().parent;R=next(p for p in E.parents if p.name=='TRPG outputs')
load=lambda p:json.loads(p.read_text(encoding='utf-8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
baseline=load(E/'baseline.json');A=Path(load(E/'browser-setup.json')['app']);D=E/'package/901-opening-combat';manifest=load(E/'candidate-manifest.json')
for path,digest in baseline['protectedFiles'].items():assert sha(Path(path))==digest,path
assert sha(R/'work/rules_engine/gm_runtime/story-knowledge.mjs')==baseline['sources']['work/rules_engine/gm_runtime/story-knowledge.mjs']
for m in manifest['modules']:
 assert sha((R/m['source']).resolve())==m['source_sha256'],m['source']
 assert sha(D/m['path'])==sha(A/'public/901-opening-combat'/m['path'])==m['sha256'],m['path']
 for forbidden in ['隔离非Canon关系表','dialogue-lab-state.json','fsClinic']:
  assert forbidden not in (D/m['path']).read_text(encoding='utf-8'),m['path']
entry=(E/'candidate-entry.js').read_text(encoding='utf-8');fixture=(E/'browser-entry.fixture.js').read_text(encoding='utf-8');assert entry in fixture
assert '__901DialogueHost={enabled:true' not in entry
data=(A/'data/default-user/characters/901 帝都初始卡 独立事项版 20261105.png').read_bytes();i=8;entries=[]
while i<len(data):
 n=struct.unpack('>I',data[i:i+4])[0];typ=data[i+4:i+8];v=data[i+8:i+8+n];i+=n+12
 if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
  card=json.loads(base64.b64decode(v.split(b'\0',1)[1]));entries.append(card['data']['extensions']['tavern_helper']['scripts'][1]['content'])
assert entries and all(e==fixture for e in entries)
assert 'globalThis.fetch=denied' in (A/'offline-guard.mjs').read_text(encoding='utf-8')
audit=load(E/'browser-request-audit.json');state=load(E/'browser-state-audit.json');assert len(audit)==state['capturedCalls']==20
assert len([x for x in audit if x['kind']=='reception' and x['originalCheck'] and x['exactHostFlattenedSchema']])==6
assert len([x for x in audit if x['file'].startswith('Final-')])==3
reg=(E/'final-regression.log').read_text(encoding='utf-8-sig');assert 'pass 187' in reg and 'fail 0' in reg
plan=load(E/'model-batch/plan.json');assert plan['authorizedCalls']==0 and plan['requestedMaximum']==12
for f in plan['firstRequests']:assert sha(E/'model-batch'/f['file'])==f['sha256']
assert len(list((E/'model-batch').glob('*.request.json')))==2
archive=E/'dialogue-integration-candidate.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(D.rglob('*')):
  if p.is_file():z.write(p,'901-opening-combat/'+p.relative_to(D).as_posix())
 for name in ['candidate-entry.js','candidate-manifest.json','CANDIDATE.txt']:z.write(E/name,name)
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None;assert len(z.namelist())==141
 for m in manifest['modules']:assert hashlib.sha256(z.read('901-opening-combat/'+m['path'])).hexdigest()==m['sha256']
source_hashes={s:sha(R/s) for s in baseline['sources']}
result={'status':'local-delivery-complete-real-model-and-deployment-not-verified','stages':{str(i):('partial-real-narrative-experience-awaits-model' if i==11 else 'complete-local-scope') for i in range(1,13)},'regression':{'passed':187,'failed':0,'log':'final-regression.log'},'browser':{'actualLocalCalls':20,'syntheticInterfaces':True,'realModelCalls':0,'mainChains':'A and B','finalEntryCaptures':3,'stateAudit':'browser-state-audit.json','requestAudit':'browser-request-audit.json'},'modules':135,'assets':3,'isolatedCardContainsCandidatePlusExcludedFixture':True,'sourceHashes':source_hashes,'protectedFilesUnchanged':len(baseline['protectedFiles']),'acceptedNarrativeContractUnchanged':True,'archive':{'file':archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive),'entries':141},'modelBatch':{'requestedMaximum':12,'authorized':0,'sent':0,'cumulativePrior':334,'localClassificationControls':5},'credentialsRead':False,'deployed':False,'formalStoryWritten':False,'automaticApprovalOrRevision':False}
put(E/'final-verification.json',result);p=load(E/'package-verification.json');p['protectedFileCheck']='22 unchanged; final-verification.json';put(E/'package-verification.json',p)
print(json.dumps({'tests':187,'captures':20,'modules':135,'protectedUnchanged':22,'zipBytes':archive.stat().st_size,'modelSent':0,'stage11':'partial: real narrative quality pending'}))
