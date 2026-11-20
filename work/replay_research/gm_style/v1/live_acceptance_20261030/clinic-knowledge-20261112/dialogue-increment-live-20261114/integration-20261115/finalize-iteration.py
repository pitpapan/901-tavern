"""Verify the bounded twelve-stage candidate and archive it; never install/send."""
from pathlib import Path
import json, hashlib, zipfile, re, difflib

E=Path(__file__).resolve().parent
I=E/'iteration-200-20261115'
R=next(p for p in E.parents if p.name=='TRPG outputs')
W=R.parent
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

baseline=read(E/'baseline.json')
for path,digest in baseline['protectedFiles'].items():
    assert sha(Path(path))==digest,path
A=Path(read(E/'browser-setup.json')['app'])
D=E/'package/901-opening-combat'
manifest=read(E/'candidate-manifest.json')
assert len(manifest['modules'])==135 and len(manifest['assets'])==3
for m in manifest['modules']:
    assert sha((R/m['source']).resolve())==m['source_sha256'],m['source']
    assert sha(D/m['path'])==sha(A/'public/901-opening-combat'/m['path'])==m['sha256'],m['path']
    text=(D/m['path']).read_text(encoding='utf8')
    for forbidden in ['隔离非Canon关系表','dialogue-lab-state.json','fsClinic']:
        assert forbidden not in text,m['path']
for m in manifest['assets']:assert sha(D/m['path'])==m['sha256']
assert sha(E/'candidate-entry.js')==manifest['entrySha256']
entry=(E/'candidate-entry.js').read_text(encoding='utf8')
assert '__901DialogueHost={enabled:true' not in entry
assert entry in (E/'browser-entry.fixture.js').read_text(encoding='utf8')
assert 'globalThis.fetch=denied' in (A/'offline-guard.mjs').read_text(encoding='utf8')

def communication(p):
    s=p.read_text(encoding='utf8')
    return s.split('export const STORY_COMMUNICATION_INSTRUCTION=',1)[1].split('\n\nexport async',1)[0]
assert communication(I/'before/story-knowledge.mjs')==communication(R/'work/rules_engine/gm_runtime/story-knowledge.mjs')
reg=I/'final-regression-current.log'
assert re.search(r'pass 267\b',reg.read_text(encoding='utf-8-sig'))
assert re.search(r'fail 0\b',reg.read_text(encoding='utf-8-sig'))
ar=read(I/'A-verification.json')['A']
br=read(I/'B-verification.json')
assert ar['reopenExactMVU'] and ar['classificationAndNarrationProjectionEqual']
assert br['B']['finalPending']==0 and br['B']['samePlayerRequestCount']==1
assert br['rawEvidence']['attempts']==23 and br['rawEvidence']['allOriginalRequestAndResponseHashesMatch']
ledger=read(I/'run.json')
assert ledger['used']==23 and ledger['remaining']==177 and ledger['cumulative']==357
assert len(ledger['attempts'])==21 and all(x['state']=='completed' for x in ledger['attempts'])
for path,digest in ledger['attempts'][-1]['sourceHashes'].items():assert sha(W/path)==digest,path
old=read(E/'live-model-20261115/run.json')
assert old['closed'] is True and len(old['attempts'])==2
assert br['rawEvidence']['verdictCounts']=={'pass':15,'fail':7,'uncovered':1}

delta=read(E/'deployment-diff.json')
assert delta['deployed'] is False and delta['changedFromInstalled']==32
assert delta['recoveryOriginalsVerified']==16
assert len(read(E/'candidate-delta.json')['changes'])==5
for m in read(E/'candidate-delta.json')['changes']:
    expected=m['path']!='work/rules_engine/mvu_poc/adapter.mjs'
    assert m['thisTask']==expected,m['path']

source_paths=list(baseline['sources'])+['work/rules_engine/gm_runtime/story-knowledge.test.mjs']
source_paths=[(R/p).resolve() for p in source_paths]
source_paths += [W/'901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js',W/'901-trpg-engine/tools/trpg-engine/tests/gm-assertion-coordinates.test.js']
source_hashes={p.relative_to(W).as_posix():sha(p) for p in source_paths}
diff=[]
for name,target in [('assertion-contract.js',W/'901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js'),
                    ('story-dialogue-knowledge.mjs',R/'work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'),
                    ('story-knowledge.mjs',R/'work/rules_engine/gm_runtime/story-knowledge.mjs'),
                    ('gm-assertion-coordinates.test.js',W/'901-trpg-engine/tools/trpg-engine/tests/gm-assertion-coordinates.test.js'),
                    ('story-dialogue-bound.test.mjs',R/'work/rules_engine/gm_runtime/story-dialogue-bound.test.mjs')]:
    diff.extend(difflib.unified_diff((I/'before'/name).read_text(encoding='utf8').splitlines(True),target.read_text(encoding='utf8').splitlines(True),fromfile='before/'+name,tofile='after/'+target.relative_to(W).as_posix()))
(I/'iteration-change.diff').write_text(''.join(diff),encoding='utf8')

archive=E/'dialogue-integration-candidate.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(D.rglob('*')):
        if p.is_file():z.write(p,'901-opening-combat/'+p.relative_to(D).as_posix())
    for name in ['candidate-entry.js','candidate-manifest.json','CANDIDATE.txt']:z.write(E/name,name)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None and len(z.namelist())==141
    allowed={'901-opening-combat/'+m['path'] for m in manifest['modules']+manifest['assets']}|{'candidate-entry.js','candidate-manifest.json','CANDIDATE.txt'}
    assert set(z.namelist())==allowed
    for m in manifest['modules']+manifest['assets']:
        assert hashlib.sha256(z.read('901-opening-combat/'+m['path'])).hexdigest()==m['sha256']
    assert z.read('candidate-entry.js')==(E/'candidate-entry.js').read_bytes()

attempts=old['attempts']+ledger['attempts']
sizes={kind:{'count':len(a),'minBytes':min(a),'maxBytes':max(a)} for kind in ['narration','reception','dependency'] for a in [[x['requestBytes'] for x in attempts if kind in x['id']]]}
report={
    'status':'complete-bounded-local-candidate-and-finite-real-model-chains',
    'stages':{str(i):'complete-in-original-bounded-scope' for i in range(1,13)},
    'regression':{'passed':267,'failed':0,'log':'iteration-200-20261115/final-regression-current.log','sha256':sha(reg)},
    'realBrowser':{'A':'iteration-200-20261115/A-verification.json','B':'iteration-200-20261115/B-verification.json',
                   'AActualModelCalls':[340,341,342,343],'BActualModelCalls':[344,345,351,352,353,354,356,357],
                   'classification':'local NO_CHECK; no claim of model classification acceptance',
                   'transport':'exact browser capture sent upstream, complete raw response replayed unchanged',
                   'testScenario':'controlled non-Canon fixtures; no formal story changes',
                   'browserClosed':True,'isolatedServerStopped':True},
    'budget':{'limit':200,'usedIncluding335And336':23,'newThis200Ledger':21,'remainingUnspent':177,'cumulativeHistorical':357,'automaticFutureCalls':False},
    'requestSizes':sizes,'verdicts':br['rawEvidence']['verdictCounts'],'all23OriginalRequestsAndResponsesHashVerified':True,
    'versionScope':'A and earlier B use recorded earlier guidance. Final B356/357 uses confirmation projection. Do not claim all historical model calls ran final prompt.',
    'modules':135,'assets':3,'defaultSemanticCompletion':'disabled','sourceHashes':source_hashes,
    'protectedFilesUnchanged':len(baseline['protectedFiles']),'acceptedNarrativeContractUnchanged':True,
    'archive':{'file':archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive),'entries':141},
    'recoveryOriginalsVerified':16,'changedFromFormalModules':32,'changedFromPreviousCandidateModules':5,
    'credentialsReadForAuthorizedTests':True,'credentialsIncludedInCandidate':False,
    'deployed':False,'formalStoryWritten':False,'automaticApprovalOrRevision':False,
    'knownLimits':['Coordinates and omitted or semantically wrong listener references remain possible.',
                   '348/349 manually withheld; production validation did not automatically catch semantic errors.',
                   'Alternate explicit-listener B2 is not proof original implicit-listener failures repaired.',
                   'A notice premise conflicted with literacy; only actually spoken messages accepted.',
                   '355 nondisclosure marked uncovered; causal effect of missing confirmation not established.',
                   'Not general accuracy, long-run, large cast, arbitrary request size or production acceptance.']
}
put(I/'final-verification.json',report)
put(E/'final-verification.json',report)
p=read(E/'package-verification.json')
p['packagingModelCalls']=p.pop('modelCalls',0)
p['integrationModelCalls']=23
p['protectedFileCheck']=f"{len(baseline['protectedFiles'])} unchanged; iteration-200-20261115/final-verification.json"
p['latestRealBrowserVersion']='B.fix3.narration/reception matches current source/package; earlier browserExerciseDelta is historical synthetic evidence'
put(E/'package-verification.json',p)
ledger['complete']=True
ledger['closed']=True
ledger['stopReason']='Twelve bounded stages, finite actual A/B chains, final offline regression and candidate delivery complete. Remaining 177 calls unspent; no scheduled retries or deployment.'
ledger['finalVerification']='final-verification.json'
put(I/'run.json',ledger)
print(json.dumps({'stages':12,'testsPassed':267,'protectedUnchanged':len(baseline['protectedFiles']),'archiveBytes':archive.stat().st_size,'used':23,'remaining':177,'deployed':False}))
