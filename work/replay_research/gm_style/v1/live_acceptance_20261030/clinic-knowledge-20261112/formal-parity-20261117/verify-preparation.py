"""Verify actual browser state and offline requests, without sending a model request."""
from pathlib import Path
import hashlib,json,sys
sys.stdout.reconfigure(encoding='utf-8')
E=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
setup=load(E/'setup.json'); A=Path(setup['app']); F=Path(setup['formalApp'])
protected=load(E/'formal-before.json')
assert all(sha(F/path)==digest for path,digest in protected.items())
snapshots={name:load(E/'browser'/(name+'.json')) for name in ['baseline','before-captured','after-received','after-captured','reopened-preserved','reopen-captured','ready-for-review']}
roots={}
for name,s in snapshots.items():
    anchor=s['anchor'];root=s['pages'][anchor['messageId']]['stat_data']['901_rules_poc']
    saved=s['saved'][anchor['messageId']+1]['variables'][anchor['swipeId']]['stat_data']['901_rules_poc']
    assert root==saved and root['chatId']==anchor['chatId']==s['chatId']
    assert s['dialogueDisabled'] and not root.get('storyKnowledge',{}).get('dialogueBatches')
    roots[name]=root
assert roots['baseline']==roots['before-captured']
after=roots['after-received'];before=roots['baseline']
assert all(roots[name]==after for name in ['after-captured','reopened-preserved','reopen-captured','ready-for-review'])
assert after['actors']==before['actors'] and after['revision']==before['revision']+1
new={k:v for k,v in after['operations'].items() if k not in before['operations']}
assert list(new)==['story-knowledge/clinic.parity.bright.20261117']
assert all(after['operations'][k]==v for k,v in before['operations'].items())
knowledge=after['storyKnowledge'];assert len(knowledge['knowledge'])==1
assert sorted(e['kind'] for e in knowledge['events'].values())==['knowledge.granted','message.arrived']
event=knowledge['events']['received.clinic.parity.bright.20261117']
source=event['data']['sourceAnchor'];assert event['data']['knowerIds']==['bright']
assert event['data']['propositionRefs']==['clinic.owner.xuelao.old-friend']
assert source['text']==snapshots['after-received']['chat'][source['messageId']]['mes']
assert snapshots['after-received']['chat'][source['messageId']]['is_system']
for name in ['after-received','reopened-preserved','ready-for-review']:
    assert snapshots[name]['chat'][:9]==snapshots['baseline']['chat']
assert (E/'browser/after-received.seed.jsonl').read_bytes()==(E/'browser/reopened-preserved.seed.jsonl').read_bytes()==(E/'browser/ready-for-review.seed.jsonl').read_bytes()
counts=lambda c:{a['actorId']:len(a['facts']) for a in c['actorKnowledge']}
assert counts(snapshots['baseline']['knowledgeContext'])=={'player':0,'bright':0,'huang':0}
expected={'player':0,'bright':1,'huang':0}
assert all(counts(snapshots[name]['knowledgeContext'])==expected for name in ['after-received','reopened-preserved','ready-for-review'])
requests=[]; bodies={};marker='【901逐角色知情投影】'
for phase,snapshot in [('before','baseline'),('after','after-received'),('reopen','reopened-preserved')]:
    captures=list((E/'browser/captures').glob(phase+'.classification.*.capture.json'));assert len(captures)==1
    capture=load(captures[0]);request=captures[0].with_name(captures[0].name.replace('.capture.json','.request.json'))
    assert sha(request)==capture['requestSha256'] and capture['classificationFixture'] is False and capture['externalModelCalls']==0
    assert capture['endpoint']=='https://cdn.sta1n.cn/v1/chat/completions'
    body=load(request);bodies[phase]=request.read_bytes()
    marked=[m['content'] for m in body['messages'] if marker in m.get('content','')];assert len(marked)==1
    projected=json.loads(marked[0].split(marker,1)[1].strip().split('\n',1)[0])
    assert projected==snapshots[snapshot]['knowledgeContext']
    if phase=='before':assert '九雪医馆馆主与雪老有旧' not in '\n'.join(m.get('content','') for m in body['messages'])
    requests.append({'phase':phase,'kind':'classification','request':str(request.relative_to(E)),
        'sha256':sha(request),'bytes':request.stat().st_size,'parameters':capture['parameters'],
        'knowledgeCounts':counts(projected),'classificationFixture':False,'sent':False})
assert bodies['after']==bodies['reopen']
assert len(list((E/'browser/captures').glob('*.request.json')))==3
assert not list((E/'browser/captures').glob('*.release.json'))
changed=[]
for path,digest in protected.items():
    if path.startswith('public/901-opening-combat/'):
        assert (A/path).exists()
        if sha(A/path)!=digest:changed.append(path)
assert set(changed)=={'public/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs',
    'public/901-opening-combat/work/rules_engine/gm_runtime/adjudication-gate.mjs',
    'public/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js'}
for p in ['data/default-user/worlds','data/default-user/OpenAI Settings','data/default-user/context','data/default-user/instruct','data/default-user/sysprompt']:
    formal=F/p
    for file in formal.rglob('*'):
        if file.is_file(): assert sha(file)==sha(A/p/file.relative_to(formal))
assert sha(F/'public/901-opening-combat/narrative-style.json')==sha(A/'public/901-opening-combat/narrative-style.json')
assert json.loads((A/'data/default-user/secrets.json').read_text(encoding='utf-8'))=={}
budget=load(E/'call-budget.json');assert (budget['usedThisTask'],budget['remaining'],budget['priorCumulative'])==(0,0,546)
for file,number in [('knowledge-and-gate-tests.log',86),('controller-tests.log',5)]:
    text=(E/file).read_text(encoding='utf-8-sig');assert 'pass '+str(number) in text and 'fail 0' in text
plan={'status':'waiting_for_separate_authorization','newCallsAuthorized':0,'usedThisTask':0,'priorCumulative':546,
    'proposedMaximumCalls':6,'proposedCeilingIfAuthorized':552,'failuresAndRetriesIncluded':True,
    'endpoint':requests[0]['parameters']['model'] and 'https://cdn.sta1n.cn/v1/chat/completions',
    'model':requests[0]['parameters']['model'],'parameters':requests[0]['parameters'],
    'frozenClassificationRequests':requests,
    'narrationRequests':[{'phase':phase,'frozen':False,'sent':False,'dependsOn':'Accepted real '+phase+' classification',
      'reason':'The original gate must accept a real decision before assembling the prose request; no guessed NO_CHECK or mechanical result.'} for phase in ['before','after','reopen']],
    'dataScope':['actual formal character and six lorebooks','unchanged formal style and model parameters','native branch through original message 8',
      'existing database memory context','artificial non-Canon retained source received only by bright','per-recipient knowledge and saved mechanical context','this test question and resulting replies'],
    'comparison':'Parallel inputs from one retained native branch; after/reopen use the exact same received seed, before either unknown prose response. Not automatic sequential reception tracking.'}
(E/'request-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
result={'localPreparationPassed':True,'realModelPerformanceVerified':False,'modelCalls':0,'budgetRemaining':0,
 'nativeBranch':snapshots['baseline']['chatId'],'nativeCutMessageId':8,'originalRetainedMessages':9,
 'before':{'revision':before['revision'],'knowledge':{'player':0,'bright':0,'huang':0}},
 'after':{'revision':after['revision'],'knowledge':expected,'sourceEvents':1,'grantAuditEvents':1,'grants':1,'newKnowledgeOperations':1},
 'reopen':{'sameFullRuleRoot':True,'sameKnowledgeContext':True,'sameExactSavedSeed':True,'sameClassificationRequestBytes':True},
 'activeCurrentSwipeEqualsSavedDisk':True,'mechanicalActorsUnchanged':True,'oldOperationsUnchanged':True,
 'genericExtractionDisabled':True,'preparationFailureNoticesArchivedAndExcludedFromCleanSeeds':True,
 'formalProtectedFilesUnchanged':len(protected),'formalRuntimeFiles':setup['formalRuntimeFiles'],
 'changedExistingRuntimeFiles':changed,'addedDependencies':len(load(E/'new-dependencies.json')['addedFiles']),
 'formalStyleWorldbooksAndMemorySettingsPreserved':True,'credentialsCopied':False,
 'localTestsPassed':91,'classificationRequestsPrepared':3,'narrationRequestsPrepared':0,
 'classificationRequests':requests,'newPromptsOrModelOutputRepair':False,'deployed':False,'committedOrPushed':False}
(E/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'prepared':True,'localTests':91,'classifications':[r['bytes'] for r in requests],
 'beforeKnowledge':[0,0,0],'afterAndReopenKnowledge':[0,1,0],'sameSavedSeed':True,
 'formalUnchanged':len(protected),'modelCalls':0,'awaitingAuthorization':True},ensure_ascii=False,indent=2))
