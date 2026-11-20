"""Necessary checks for the six actual sequential outputs and their ordinary save chain."""
from pathlib import Path
import json,hashlib,sys
sys.stdout.reconfigure(encoding='utf-8')
L=Path(__file__).resolve().parent;E=L.parent;P=E.parent/'natural-key-knowledge-20261116'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
run=load(L/'run.json');auth=load(L/'authorization.json');s=load(E/'setup.json')
assert (run['baseline'],run['limit'],run['used'],run['remaining'],run['cumulative'],run['closed'],run['complete'])==(534,12,6,6,540,True,True)
assert auth['maximumCalls']==12 and auth['ceiling']==546 and auth['userText']=='授权12次'
old=E.parent/'dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/run.json'
assert sha(old)==auth['previousLedgerSha256'] and old.read_bytes()==(E/'old-ledger.before.json').read_bytes()
initial=load(E/'branch-ready-state.json')['mvuData']['stat_data']['901_rules_poc']
allBodies=[];rounds=[]
for n,a in enumerate(run['attempts'],1):
    id=f'round-{n:02}';assert a['id']==id and a['customRequest']==534+n
    assert a['state']=='completed' and a['status']==200 and a['finishReason']=='stop' and a['rawUnmodified']
    reqPath=L/(id+'.request.json');request=load(reqPath);rawPath=L/(id+'.raw-response.txt');response=load(rawPath)
    assert sha(reqPath)==a['requestSha256'] and sha(rawPath)==a['rawResponseSha256']
    body=(L/(id+'.content.txt')).read_bytes().decode('utf-8');assert response['choices'][0]['message']['content']==body
    assert response['model']==a['responseModel']=='gemini-3.8-flash'
    joined='\n'.join(m.get('content','') for m in request['messages'] if isinstance(m.get('content'),str))
    for prior in allBodies:assert any(m['role']=='assistant' and prior in m.get('content','') for m in request['messages'])
    player=(E/'player-input.01.txt' if n==1 else L/(id+'.player-input.txt')).read_text(encoding='utf-8').strip()
    assert player in request['messages'][-1]['content']
    if n==1:assert reqPath.read_bytes()==(E/'round-01.request.json').read_bytes()
    proof=load(L/(id+'.release-proof.json'));assert proof['exactRequestBytes'] and proof['requestSha256']==a['requestSha256'] and proof['responseSha256']==a['rawResponseSha256']
    state=load(L/(id+'.state.json'));saved=load(L/(id+'.save-proof.json'))
    assert state['sameSavedRoot'] and saved['savedActualBodyUnchanged'] and saved['activeEqualsSaved']
    assert state['savedMessage']==body+'\n\n<StatusPlaceHolderImpl/>'
    assert state['anchor']['messageId']==13+2*n and state['anchor']['chatId']==s['branchChatId']
    root=state['mvuData']['stat_data']['901_rules_poc'];assert root['actors']==initial['actors']
    assert len(root['storyKnowledge']['facts'])==1 and not root['storyKnowledge'].get('dialogueBatches')
    assert state['dialogueHost']['enabled'] is False
    counts={x['actorId']:len(x['facts']) for x in state['context']['actorKnowledge']}
    assert counts==({'player':0,'bright':1,'huang':0} if n==1 else {'player':1,'bright':1,'huang':1})
    assert root['revision']==(2 if n==1 else 3)
    assert sha(L/(id+'.chat.jsonl'))==saved['savedChatSha256']
    story=(L/'CONTINUOUS-STORY.md').read_bytes().decode('utf-8');assert body in story and player in story
    rounds.append({'round':n,'customRequest':a['customRequest'],'bytes':reqPath.stat().st_size,'allPreviousActualOutputsRetained':True,'exactOriginalResponseSaved':True,'verdict':a['manualVerdict']})
    allBodies.append(body)
received=load(L/'round-01.received-state.json');rr=received['mvuData']['stat_data']['901_rules_poc']
assert received['sameSavedRoot'] and rr['revision']==3
event=rr['storyKnowledge']['events']['received.continuous.round01.heard-old-friend']
assert event['data']['knowerIds']==['player','huang'] and event['data']['senderId']=='bright'
assert event['data']['sourceAnchor']['messageId']==15 and event['data']['sourceAnchor']['text']==allBodies[0]+'\n\n<StatusPlaceHolderImpl/>'
assert load(L/'round-01.manual-reception.json')['manualTest'] is True
captures=[load(p) for p in (L/'browser/captures').glob('*.capture.json')]
assert len(captures)==12 and sum(c['kind']=='classification' for c in captures)==6 and sum(c['kind']=='narration' for c in captures)==6
assert all(c['browserUpstreamCalls']==0 for c in captures)
final=load(L/'browser/continuation-branch-startup.json');last=load(L/'round-06.state.json')
assert final['sameSavedRoot'] and final['anchor']['messageId']==25 and final['adoption']['status']=='already_bound'
assert final['adoption']['messageId']==13
assert final['mvuData']['stat_data']['901_rules_poc']==last['mvuData']['stat_data']['901_rules_poc']
assert final['context']==last['context'] and final['dialogueHost']['enabled'] is False
actualRows=[json.loads(x) for x in Path(s['branchChat']).read_text(encoding='utf-8').splitlines()]
assert len(actualRows)==27 and actualRows[26]['mes']==allBodies[-1]+'\n\n<StatusPlaceHolderImpl/>'
assert actualRows[26]['variables'][0]['stat_data']['901_rules_poc']==last['mvuData']['stat_data']['901_rules_poc']
for p,digest in load(E/'protected-before.json').items():assert sha(Path(p))==digest
oldApp=Path(load(P/'setup.json')['app']);app=Path(s['app']);unchanged=0
for item in load(P/'package-manifest.json'):
    oldFile=Path(item['destination']);assert sha(oldFile)==sha(app/oldFile.relative_to(oldApp));unchanged+=1
report={'status':'six-continuous-rounds-complete','used':6,'limit':12,'remaining':6,'cumulative':540,'batchClosed':True,
    'rounds':rounds,'protocolFailures':0,'retries':0,'classificationModelCalls':0,'genericExtractionCalls':0,'modelReviewCalls':0,
    'manualReceptionOnly':True,'controlledFactCatalogSize':1,'newOrdinaryInformationKeptInHistory':True,
    'finalReopenStateAndContextUnchanged':True,'forkBindingNotRepeatedAtNewTip':True,
    'actorMechanicalStateUnchanged':True,'old200CallLedgerUnchanged':True,'priorDeliveryAndProtectedFilesUnchanged':True,
    'compiledRuntimeFilesUnchanged':unchanged,'memoryLimitation':'Original ten tables were empty; no nonempty memory continuity claim or new memory engineering.',
    'story':'CONTINUOUS-STORY.md','assessment':'ASSESSMENT.txt','scopeLimit':'This continuous example was playable; formulaic narrative phrasing remains. Not general narrative stability, automatic receipt or deployment acceptance.'}
(L/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
