"""Exact-response local release, then archive actual normal-gate state. No upstream calls."""
from pathlib import Path
import json,sys,shutil,hashlib
sys.stdout.reconfigure(encoding='utf-8')
L=Path(__file__).resolve().parent;E=L.parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
s=load(E/'setup.json');mode,id,*args=sys.argv[1:]
if mode=='release':
    stem=args[0];prefix=L/'browser/captures'/stem
    at=lambda suffix:Path(str(prefix)+suffix)
    assert at('.request.json').read_bytes()==(L/(id+'.request.json')).read_bytes(),'Live browser request differs from actually sent request'
    assert not at('.release.json').exists()
    shutil.copy2(L/(id+'.request.json'),at('.sent-request.json'))
    shutil.copy2(L/(id+'.raw-response.txt'),at('.raw-response.txt'))
    proof={'round':id,'browserStem':stem,'exactRequestBytes':True,'requestSha256':sha(at('.request.json')),'responseSha256':sha(at('.raw-response.txt')),'externalCalls':0}
    (L/(id+'.release-proof.json')).write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
    at('.release.json').write_text(json.dumps({'rawResponse':True,'actualResponseFrom':id,'externalCalls':0}),encoding='utf-8')
    print(json.dumps(proof))
elif mode=='archive':
    sample=load(L/'browser/continuation-branch-manual.json')
    assert sample['sameSavedRoot'] and sample['dialogueHost']['enabled'] is False
    assert sample['anchor']['chatId']==s['branchChatId']
    content=(L/(id+'.content.txt')).read_bytes().decode('utf-8')
    assert sample['savedMessage']==content+'\n\n<StatusPlaceHolderImpl/>'
    assert not sample['knowledge'].get('dialogueBatches')
    chat=Path(s['branchChat']);rows=[json.loads(x) for x in chat.read_text(encoding='utf-8').splitlines()]
    index=sample['anchor']['messageId'];assert index==len(rows)-2
    assert rows[index+1]['variables'][sample['anchor']['swipeId']]['stat_data']['901_rules_poc']==sample['mvuData']['stat_data']['901_rules_poc']
    for target in [L/(id+'.state.json'),L/(id+'.chat.jsonl')]:assert not target.exists()
    shutil.copy2(L/'browser/continuation-branch-manual.json',L/(id+'.state.json'));shutil.copy2(chat,L/(id+'.chat.jsonl'))
    proof={'round':id,'anchor':sample['anchor'],'savedActualBodyUnchanged':True,'activeEqualsSaved':True,'revision':sample['mvuData']['stat_data']['901_rules_poc']['revision'],'facts':{a['actorId']:len(a['facts']) for a in sample['context']['actorKnowledge']},'dialogueBatches':0,'savedChatSha256':sha(L/(id+'.chat.jsonl'))}
    (L/(id+'.save-proof.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(proof,ensure_ascii=False))
else:raise ValueError(mode)
