"""Release the exact model response to its original held browser request; no send."""
from pathlib import Path
import json,sys,shutil,hashlib
E=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
round_id,stem=sys.argv[1:]
assert round_id in ['round-01','round-02']
prefix=E/'browser/captures'/stem
at=lambda s:Path(str(prefix)+s)
run=load(E/'run.json');a=run['attempts'][-1]
assert a['id']==round_id and a['state']=='completed' and a['finishReason']=='stop' and a['rawUnmodified']
assert at('.request.json').read_bytes()==(E/(round_id+'.request.json')).read_bytes()
assert not at('.release.json').exists()
shutil.copy2(E/(round_id+'.request.json'),at('.sent-request.json'))
shutil.copy2(E/(round_id+'.raw-response.txt'),at('.raw-response.txt'))
proof={'round':round_id,'stem':stem,'customRequest':a['customRequest'],'sameRequestBytes':True,'requestSha256':sha(at('.request.json')),'rawResponseSha256':sha(at('.raw-response.txt')),'browserUpstreamCalls':0}
(E/(round_id+'.'+stem+'.release-proof.json')).write_text(json.dumps(proof,indent=2)+'\n',encoding='utf-8')
at('.release.json').write_text(json.dumps({'rawResponse':True,'actualResponseFrom':round_id,'externalCalls':0}),encoding='utf-8')
print(json.dumps(proof))
