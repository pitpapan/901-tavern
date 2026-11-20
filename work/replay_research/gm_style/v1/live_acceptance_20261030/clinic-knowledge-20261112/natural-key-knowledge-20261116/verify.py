"""Checks this experiment's actual state/save path, paid responses and same budget."""
from pathlib import Path
import json, hashlib, ast, struct, base64
E=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
setup=load(E/'setup.json');app=Path(setup['app'])
samples=[load(E/name) for name in ['01-before-startup.json','02-received-received.json','03-reopened-startup.json']]
rows=[]
for index, sample in enumerate(samples):
    root=sample['mvuData']['stat_data']['901_rules_poc']
    assert sample['sameSavedRoot']
    assert sample['dialogueHost']['enabled'] is False and sample['disableResult']['status']=='disabled'
    assert root==sample['savedPage']['stat_data']['901_rules_poc']
    expected=[('player',0),('bright',int(index>0)),('huang',0)]
    actual=[(a['actorId'],len(a['facts'])) for a in sample['context']['actorKnowledge']]
    assert actual==expected
    assert root['revision']==int(index>0)
    assert not sample['knowledge'].get('dialogueBatches')
    rows.append({'state':sample['label'],'revision':root['revision'],'facts':dict(actual),'activeEqualsSaved':True,'extractionDisabled':True})
received=samples[1]['mvuData']['stat_data']['901_rules_poc']
reopened=samples[2]['mvuData']['stat_data']['901_rules_poc']
assert received==reopened and samples[1]['context']==samples[2]['context']
assert samples[0]['mvuData']['stat_data']['901_rules_poc']['actors']==received['actors']
k=received['storyKnowledge'];assert len(k['knowledge'])==1
receipt=k['events']['received.natural.clinic.received']
assert receipt['data']['knowerIds']==['bright']
assert '御临风与黄泉均未听到' in receipt['data']['sourceAnchor']['text']
assert receipt['data']['sourceAnchor']['messageId']==11
requests=[]
names=['01-before.02.narration','02-received.04.narration','03-reopened.06.narration']
ledger=load(E/'ledger-final.json')
newAttempts=[a for a in ledger['attempts'] if a['id'].startswith('natural-clinic.')]
assert len(newAttempts)==3
for name in names:
    p=E/'captures'/(name+'.request.json');r=load(p);c=load(E/'captures'/(name+'.capture.json'))
    assert c['kind']=='narration' and c['browserUpstreamCalls']==0
    assert c['endpointUrl']=='https://cdn.sta1n.cn/v1/chat/completions'
    attempt=next(a for a in newAttempts if a['id']=='natural-clinic.'+name)
    assert p.read_bytes()==(E/'captures'/(name+'.sent-request.json')).read_bytes()
    rawPath=E/'captures'/(name+'.raw-response.txt');raw=load(rawPath)
    assert attempt['rawUnmodified'] and attempt['rawResponseSha256']==sha(rawPath)
    assert attempt['status']==200 and attempt['finishReason']=='stop' and attempt['state']=='completed'
    assert (E/'captures'/(name+'.content.txt')).read_bytes().decode('utf-8')==raw['choices'][0]['message']['content']
    assert attempt['requestSha256']==sha(p)
    assert (E/'captures'/(name+'.capture-only-release.json')).exists()
    requests.append({'id':name,'file':'captures/'+p.name,'bytes':p.stat().st_size,'sha256':sha(p),'messages':len(r['messages']),
        'sent':True,'customRequest':attempt['customRequest'],'responseModel':attempt['responseModel'],
        'rawResponseSha256':sha(rawPath),'manualVerdict':attempt['manualVerdict']})
assert (E/'captures'/(names[1]+'.request.json')).read_bytes()==(E/'captures'/(names[2]+'.request.json')).read_bytes()
captures=[load(p) for p in (E/'captures').glob('*.capture.json')]
assert len(captures)==6
assert sum(c['kind']=='classification' for c in captures)==3
assert all(c['browserUpstreamCalls']==0 for c in captures)
originalLedger=E.parent/'dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/run.json'
assert originalLedger.read_bytes()==(E/'ledger-final.json').read_bytes()
baseline=load(E/'ledger-baseline.json')
assert (E/'ledger-before.json').read_bytes()==(E/'ledger-baseline.json').read_bytes()
assert ledger['attempts'][:len(baseline['attempts'])]==baseline['attempts']
assert (ledger['used'],ledger['remaining'],ledger['cumulative'],ledger['closed'],ledger['complete'])==(200,0,534,True,True)
assert ledger['limit']==baseline['limit']==200
assert [a['customRequest'] for a in newAttempts]==[532,533,534]
for p,digest in load(E/'protected-before.json').items():assert sha(Path(p))==digest
for asset in ['narrative-style.json','scene-binding.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']:
    old=Path(setup['oldChatUntouched']).parents[4]/'public/901-opening-combat'/asset
    assert sha(old)==sha(app/'public/901-opening-combat'/asset)
entry=(E/'entry.fixture.js').read_text(encoding='utf-8')
assert entry.startswith('window.top.__901DialogueHost={enabled:false};')
assert 'window.top.AutoCardUpdaterAPI={' not in entry
assert 'configureDialogueHost({enabled:false})' in entry
card=(app/'data/default-user/characters'/(setup['character']+'.png')).read_bytes();i=8;cardChecked=0
while i<len(card):
    n=struct.unpack('>I',card[i:i+4])[0];kind=card[i+4:i+8];value=card[i+8:i+8+n];i+=n+12
    if kind==b'tEXt' and value.split(b'\0',1)[0] in [b'chara',b'ccv3']:
        data=json.loads(base64.b64decode(value.split(b'\0',1)[1]))
        assert data['data']['extensions']['tavern_helper']['scripts'][1]['content']==entry
        assert data['chat']==setup['chatId'];cardChecked+=1
assert cardChecked>0
browserResults=[]
for phase in ['01-before','02-received','03-reopened']:
    d=E/'live-results'/phase;result=load(d/'result-verification.json');proof=load(d/'release-proof.json')
    assert result['activeEqualsSaved'] and result['wholeRootEqualsFrozenState'] and result['contextEqualsFrozenState']
    assert result['savedContentMatchesActualResponse'] and result['extractionDisabled'] and result['dialogueBatches']==0
    assert result['externalCalls']==0 and proof['exactFrozenRequest'] and proof['responseUnmodified']
    assert sha(Path(result['savedChat']))==result['savedChatSha256']
    assert result['facts']=={'player':0,'bright':int(phase!='01-before'),'huang':0}
    browserResults.append(result)
assert Path(setup['chat']).read_bytes()==(E/'live-results/03-reopened/result.chat.jsonl').read_bytes()
for phase in ['01-before','02-received','03-reopened']:assert (E/(phase+'.capture-failed.chat.jsonl')).exists()
ast.parse((E/'prepare.py').read_text(encoding='utf-8'))
report={'scope':'Isolated state/save/reopen, three paid frozen narration outputs, exact-response replay through ordinary gate and saved MVU',
    'states':rows,'receivedEqualsReopenedWholeRoot':True,'receivedEqualsReopenedContext':True,
    'receivedEqualsReopenedRequestBytes':True,'manualReceptionOnly':True,'automaticReceptionAcceptance':False,
    'requests':requests,'externalCalls':3,'classificationModelCalls':0,'classificationFixtures':6,'extractionCalls':0,
    'ledger':{'sha256':sha(originalLedger),'limit':200,'used':200,'remaining':0,'cumulative':534,'closed':True,'complete':True,'priorAttemptsUnchanged':True},
    'protectedFilesUnchanged':True,'adoptedStyleAndAssetsUnchanged':True,'persistentCardExtractionDisabled':True,
    'capturedFailuresPreserved':3,'browserResults':browserResults,'finalChatContainsActualReopenedOutput':True,
    'narrativeVerdicts':{'01-before':'fail: minor player position continuation','02-received':'pass on this limited input','03-reopened':'uncovered: forward-movement subject ambiguous'},
    'remainingIssue':'State persistence and prompt equality passed. Player control remains imperfect or ambiguous; these samples do not establish general narrative stability or use of the secret when needed. Budget exhausted.'}
(E/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
