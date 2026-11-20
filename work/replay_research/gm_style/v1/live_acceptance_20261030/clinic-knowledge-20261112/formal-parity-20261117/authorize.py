from pathlib import Path
import hashlib,json,shutil
E=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8'))
assert not (E/'run.json').exists()
auth=load(E/'authorization.json');old=load(E/'call-budget.json')
assert auth['userReply']=='授权最多6次，完成三状态实测' and auth['maximumCalls']==6
assert old['priorCumulative']==546 and old['remaining']==0
shutil.copy2(E/'call-budget.json',E/'call-budget.pre-authorization.json')
shutil.copy2(E/'request-plan.json',E/'request-plan.pre-authorization.json')
prior=E.parent/'continuous-play-20261116/framework-reply-recovery-20261116/real-classification-20261116/run.json'
auth['priorClosedLedgerSha256']=hashlib.sha256(prior.read_bytes()).hexdigest()
(E/'authorization.json').write_text(json.dumps(auth,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run={'authorization':'authorization.json','limit':6,'baseline':546,'used':0,'remaining':6,'cumulative':546,'ceiling':552,'closed':False,'attempts':[]}
for name in ['run.json','call-budget.json']:(E/name).write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
plan=load(E/'request-plan.json');plan.update(status='authorized',newCallsAuthorized=6)
(E/'request-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'authorized':6,'used':0,'cumulative':546,'ceiling':552}))
