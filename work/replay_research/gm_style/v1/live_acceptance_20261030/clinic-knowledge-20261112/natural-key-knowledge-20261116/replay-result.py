"""Replay one already-paid exact HTTP response through the original local gate."""
from pathlib import Path
import json,sys,shutil,hashlib
sys.stdout.reconfigure(encoding='utf-8')
E=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
setup=load(E/'setup.json');app=Path(setup['app']);chat=Path(setup['chat'])
assert chat.resolve().is_relative_to(app.resolve())
mode,case=sys.argv[1:3]
names={'01-before':'01-before.02.narration','02-received':'02-received.04.narration','03-reopened':'03-reopened.06.narration'}
assert case in names
D=E/'live-results'/case
original=E/'captures'/names[case]
at=lambda suffix:Path(str(original)+suffix)
if mode=='prepare':
    assert not D.exists();D.mkdir(parents=True)
    backup=E/'live-results/pre-send-final.chat.jsonl'
    if not backup.exists():shutil.copy2(chat,backup)
    config=app/'clinic-natural-config.json'
    shutil.copy2(config,D/'config-before.json')
    seed=E/('before.seed.jsonl' if case=='01-before' else '02-received.ready.seed.jsonl')
    chat.write_bytes(seed.read_bytes())
    cfg={'evidenceDir':str(D),'phase':case,'sequence':0,'captureDir':str(D/'captures')}
    config.write_text(json.dumps(cfg),encoding='utf-8')
    (D/'replay-plan.json').write_text(json.dumps({'case':case,'seed':str(seed),'seedSha256':sha(seed),
       'frozenRequest':str(at('.request.json')),'sourceRawResponse':str(at('.raw-response.txt')),
       'sourceResponseSha256':sha(at('.raw-response.txt')),'externalCalls':0,
       'purpose':'Exact original-response replay after paid external generation; not a new model call or a new immediate-receipt event.'},indent=2),encoding='utf-8')
    print(json.dumps({'prepared':case,'seed':seed.name,'externalCalls':0}))
elif mode=='release':
    candidates=list((D/'captures').glob('*.narration.request.json'));assert len(candidates)==1
    request=candidates[0];prefix=Path(str(request)[:-len('.request.json')])
    assert request.read_bytes()==at('.sent-request.json').read_bytes(),'Fresh browser request differs from actually sent frozen request; do not release'
    assert request.read_bytes()==at('.request.json').read_bytes()
    shutil.copy2(at('.sent-request.json'),Path(str(prefix)+'.sent-request.json'))
    shutil.copy2(at('.raw-response.txt'),Path(str(prefix)+'.raw-response.txt'))
    release={'rawResponse':True,'alreadyPaidOriginalResponse':str(at('.raw-response.txt')),'exactRequestBytes':True,'externalCalls':0}
    Path(str(prefix)+'.release.json').write_text(json.dumps(release),encoding='utf-8')
    (D/'release-proof.json').write_text(json.dumps({'case':case,'browserRequest':str(request),'exactFrozenRequest':True,
        'requestSha256':sha(request),'rawResponseSha256':sha(at('.raw-response.txt')),'responseUnmodified':True,'externalCalls':0},indent=2),encoding='utf-8')
    print(json.dumps({'released':case,'exactRequestBytes':True,'responseUnmodified':True,'externalCalls':0}))
elif mode=='archive':
    evidence=list(D.glob('*-manual.json'));assert len(evidence)==1
    sample=load(evidence[0]);assert sample['sameSavedRoot'] and sample['dialogueHost']['enabled'] is False
    root=sample['mvuData']['stat_data']['901_rules_poc']
    expected=load(E/('01-before-startup.json' if case=='01-before' else '02-received-received.json'))
    assert root==expected['mvuData']['stat_data']['901_rules_poc']
    assert sample['context']==expected['context'];assert not sample['knowledge'].get('dialogueBatches')
    raw=load(at('.raw-response.txt'));content=raw['choices'][0]['message']['content']
    saved=sample['savedMessage'];suffix='\n\n<StatusPlaceHolderImpl/>'
    if saved==content+suffix:normalization='none; original content plus original host suffix'
    else:
        assert saved.replace('\r\n','\n')==(content+suffix).replace('\r\n','\n'),'Saved body differs beyond line-ending presentation'
        normalization='CRLF/LF presentation only; raw response preserved separately'
    dest=D/'result.chat.jsonl';assert not dest.exists();shutil.copy2(chat,dest)
    captures=[load(p) for p in (D/'captures').glob('*.capture.json')]
    assert len(captures)==2 and sorted(c['kind'] for c in captures)==['classification','narration']
    result={'case':case,'activeEqualsSaved':True,'wholeRootEqualsFrozenState':True,'contextEqualsFrozenState':True,
        'revision':root['revision'],'facts':{a['actorId']:len(a['facts']) for a in sample['context']['actorKnowledge']},
        'savedContentMatchesActualResponse':True,'presentation':normalization,'extractionDisabled':True,
        'dialogueBatches':0,'savedChat':str(dest),'savedChatSha256':sha(dest),'externalCalls':0,'classificationFixture':1}
    (D/'result-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
else:raise ValueError(mode)
