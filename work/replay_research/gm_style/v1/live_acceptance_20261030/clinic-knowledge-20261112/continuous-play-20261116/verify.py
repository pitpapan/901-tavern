"""Verify this one local continuation preparation; never send a model request."""
from pathlib import Path
import json,hashlib,copy
E=Path(__file__).resolve().parent
P=E.parent/'natural-key-knowledge-20261116'
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
s=load(E/'setup.json');app=Path(s['app'])
parent=[json.loads(x) for x in (E/'parent-534.seed.jsonl').read_text(encoding='utf-8').splitlines()]
native=[json.loads(x) for x in (E/'branch-native-before-adoption.seed.jsonl').read_text(encoding='utf-8').splitlines()]
child=[json.loads(x) for x in (E/'branch.ready.seed.jsonl').read_text(encoding='utf-8').splitlines()]
tip=s['sourceMessageId'];assert tip==13 and len(parent)==len(native)==len(child)==15
assert [r['mes'] for r in parent[1:]]==[r['mes'] for r in child[1:]]
assert native[0]['chat_metadata']['main_chat']==s['parentChatId']
assert native[0]['chat_metadata']['integrity']==s['nativeIntegrity']
before=parent[tip+1]['variables'][0]['stat_data']['901_rules_poc']
after=child[tip+1]['variables'][0]['stat_data']['901_rules_poc']
ready=load(E/'branch-ready-state.json');assert ready['sameSavedRoot'] and ready['anchor']['messageId']==13
assert ready['adoption']['status']=='adopted'
expected=copy.deepcopy(before);expected['chatId']=s['branchChatId'];expected['revision']=2
expected['storyKnowledge']['chatId']=s['branchChatId']
for event in expected['storyKnowledge']['events'].values():
    source=event.get('data',{}).get('sourceAnchor')
    if source and source.get('chatId')==s['parentChatId']:source['chatId']=s['branchChatId']
op=ready['adoption']['operationId'];expected['operations'][op]=after['operations'][op]
assert expected==after and after['actors']==before['actors']
assert after==ready['mvuData']['stat_data']['901_rules_poc']==ready['savedPage']['stat_data']['901_rules_poc']
assert [(a['actorId'],len(a['facts'])) for a in ready['context']['actorKnowledge']]==[('player',0),('bright',1),('huang',0)]
assert not after['storyKnowledge'].get('dialogueBatches')
assert ready['dialogueHost']['enabled'] is False and ready['disableResult']['status']=='disabled'
assert Path(s['branchChat']).read_bytes()==(E/'branch.ready.seed.jsonl').read_bytes()
assert (E/'round-01.capture-only.chat.jsonl').exists()
request=E/'round-01.request.json';r=load(request);plan=load(E/'prepared-batch.json')
assert sha(request)==plan['firstRequest']['sha256'] and request.stat().st_size==110154
assert request.read_bytes()==(E/plan['firstRequest']['capturedFile']).read_bytes()
actual534=(P/'captures/03-reopened.06.narration.content.txt').read_bytes().decode('utf-8')
assert any(m['role']=='assistant' and actual534 in m.get('content','') for m in r['messages'])
q=(E/'player-input.01.txt').read_text(encoding='utf-8').strip()
assert q in r['messages'][-1]['content'] and not any(x in q for x in ['有旧','旧交','好友'])
projected,_=json.JSONDecoder().raw_decode(r['messages'][-1]['content'].split('【901逐角色知情投影】\n',1)[1])
assert [(a['actorId'],len(a['facts'])) for a in projected['actorKnowledge']]==[('player',0),('bright',1),('huang',0)]
assert projected['actorKnowledge'][1]['facts'][0]['id']=='clinic.owner.xuelao.old-friend'
assert projected['actorKnowledge'][1]['facts'][0]['sources'][0]['sourceAnchor']['chatId']==s['branchChatId']
assert {k:v for k,v in r.items() if k!='messages'}=={'model':'[抗截断]gemini-3.8-flash','temperature':1,'max_tokens':4096,'stream':False,'presence_penalty':0,'frequency_penalty':0,'top_p':1}
captures=[load(p) for p in (E/'captures').glob('*.capture.json')]
assert len(captures)==2 and sorted(c['kind'] for c in captures)==['classification','narration']
assert all(c['browserUpstreamCalls']==0 and c['endpointUrl']=='https://cdn.sta1n.cn/v1/chat/completions' for c in captures)
assert not list((E/'captures').glob('*.sent-request.json')) and not list((E/'captures').glob('*.raw-response.txt'))
oldMemory=load(P/'live-results/03-reopened/03-reopened-manual.json')['memory']
newMemory=ready['memory']
tables={k:v['content'] for k,v in oldMemory.items() if isinstance(v,dict) and isinstance(v.get('content'),list)}
assert len(tables)==10 and all(len(v)==1 and newMemory[k]['content']==v for k,v in tables.items())
note=parent[0]['chat_metadata']['note_prompt'];assert note and note==child[0]['chat_metadata']['note_prompt']
joined='\n'.join(m.get('content','') for m in r['messages'] if isinstance(m.get('content'),str));assert note in joined
ledger=E.parent/'dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/run.json'
assert ledger.read_bytes()==(E/'old-ledger.before.json').read_bytes()==(P/'ledger-final.json').read_bytes()
l=load(ledger);assert (l['used'],l['remaining'],l['cumulative'],l['closed'],l['complete'])==(200,0,534,True,True)
budget=load(E/'budget-proposal.json');assert budget['authorizedNewCalls']==budget['usedNewCalls']==0
assert budget['mainNarrationCalls']==4 and budget['conditionalNarrationReserve']==2
for p,digest in load(E/'protected-before.json').items():assert sha(Path(p))==digest
oldApp=Path(load(P/'setup.json')['app'])
runtimeCount=0
for item in load(P/'package-manifest.json'):
    oldFile=Path(item['destination']);relative=oldFile.relative_to(oldApp)
    assert sha(oldFile)==sha(app/relative);runtimeCount+=1
final=load(E/'continuation-branch-startup.json')
assert final['sameSavedRoot'] and final['adoption']['status']=='already_adopted'
assert final['mvuData']['stat_data']['901_rules_poc']==after
report={'status':'prepared-not-sent','externalCalls':0,'currentAllowance':0,'cumulative':534,
    'branchChatId':s['branchChatId'],'nativeBranchCreatedFromActual534':True,'adoptionReused':'adoptNativeChatBranch / persistTavernRuleState',
    'revision':2,'onlyBranchIdentityRevisionAndOperationChanged':True,'all14RetainedMessageTextsUnchanged':True,
    'onlyBrightKnowsControlledFact':True,'extractionDisabled':True,'activeAndSavedStateEqual':True,'normalReopenDidNotAdoptTwice':True,
    'firstActualRequest':{'file':'round-01.request.json','bytes':request.stat().st_size,'sha256':sha(request),'messages':len(r['messages']),
        'actual534InHistory':True,'fullRetainedChatNoteInRequest':True,'questionDoesNotSupplyAnswer':True,'onlyBrightHasFactInGenerationContext':True},
    'model':r['model'],'endpoint':'https://cdn.sta1n.cn/v1/chat/completions','classificationFixtures':1,'classificationModelCalls':0,'extractionCalls':0,
    'memory':'Original actual-534 and branch exports each have ten identical header-only tables. History and nonempty chat note preserved; no nonempty database-memory acceptance claimed.',
    'compiledRuntimeFilesUnchanged':runtimeCount,'priorDeliveryAndProtectedFilesUnchanged':True,'originalLedgerUnchanged':True,
    'proposedCalls':{'main':4,'conditionalReserve':2,'maximum':6,'authorized':0},'futureInputs':'Only round01 frozen; later player inputs depend on preceding actual outputs, no ideal responses prefilled.'}
(E/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
