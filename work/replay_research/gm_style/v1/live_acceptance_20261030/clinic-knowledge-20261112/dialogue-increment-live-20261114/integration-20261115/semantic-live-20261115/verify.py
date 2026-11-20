from pathlib import Path
import json,hashlib,re
N=Path(__file__).resolve().parent;E=N.parent;I=E/'iteration-200-20261115'
read=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json');before=read(N/'before/run.json');ledger=read(I/'run.json');cases=read(N/'cases.json')
assert ledger['attempts'][:len(before['attempts'])]==before['attempts']
attempts=ledger['attempts'][len(before['attempts']):]
assert len(attempts)==7 and (ledger['used'],ledger['remaining'],ledger['cumulative'])==(150,50,484)
for category in ['originalEvidence','formalProtected']:
 for name,h in b[category].items():assert sha(Path(name))==h,name
changed=[name for name,h in b['sourceHashes'].items() if sha(Path(name))!=h]
assert [Path(name).resolve() for name in changed]==[(E/'implicit-reception-check.mjs').resolve()],changed
log=(N/'campaign-tests.log').read_text(encoding='utf8');assert 'tests 174' in log and 'pass 174' in log and 'fail 0' in log
rows=[];outputs=[];params=lambda x:{k:v for k,v in x.items() if k not in ('messages','response_format')}
for a in attempts:
 c=next(c for c in cases if c['id']==a['id']);reqfile=I/(a['id']+'.request.json');req=read(reqfile);old=read(I/(c['original']+'.request.json'))
 assert sha(reqfile)==a['requestSha256']==c['requestSha256'];assert reqfile.read_bytes()==(N/(a['id']+'.prepared.json')).read_bytes()
 assert req['messages'][1:]==old['messages'][1:] and params(req)==params(old)
 assert req['response_format']['json_schema']['name']=='dialogue_reception_v6' and req['response_format']['json_schema']['strict']
 assert a['state']=='completed' and a['rawUnmodified'] and a['finishReason']=='stop' and a['usage']['completion_tokens']<req['max_tokens']
 for name,h in a['sourceHashes'].items():assert sha(Path(name))==h
 raw=I/(a['id']+'.raw-response.txt');capture=read(I/(a['id']+'.response.json'));assert sha(raw)==a['rawResponseSha256']==capture['responseBodySha256BeforePrivacyRedaction']
 content=(I/(a['id']+'.content.txt')).read_text(encoding='utf8');assert content==read(raw)['choices'][0]['message']['content']
 check=read(N/(a['id']+'.check.json'));assert check['exactCurrentMessages']
 try:value=json.loads(content);syntax=None
 except json.JSONDecodeError as e:syntax={'message':e.msg,'position':e.pos,'excerpt':content[max(0,e.pos-45):e.pos+45]}
 if a['customRequest'] in [480,484]:
  assert syntax is None and check['schemaPass'] and check['structuralPass'] and not check.get('runtimeError')
  assert check['pending']==[] and check['noQuestionWithoutDependency'];assert (N/(a['id']+'.after.seed.json')).exists()
  if a['customRequest']==480:
   assert a['manualVerdict']=='fail' and check['mvuWrites']==3
   u=value['units'][0]['utterances'][0];assert u['scope']['condition']['value']=='null' and u['scope']['attribution']['value']=='null'
   by_actor={x['actorId']:x['facts'] for x in check['knowledge']};assert len(by_actor['bright'])==1 and not by_actor['player'] and not by_actor['huang']
   assert by_actor['bright'][0]['content']['text']=='渡口今晚停航。'
  else:
   assert a['manualVerdict']=='pass' and check['mvuWrites']==2 and check['checked']['receptions']==[]
   assert check['state']['knowledge']=={} and check['state']['events']=={} and check['state']['facts']==json.loads(req['messages'][1]['content'])['facts']
 else:assert syntax and a['manualVerdict']=='fail' and check['mvuWrites']==0 and check['replayStateUnchanged']
 rows.append({'id':a['id'],'call':a['customRequest'],'verdict':a['manualVerdict'],'syntax':syntax,'schemaPass':check.get('schemaPass',False),'structuralPass':check['structuralPass'],'isolatedWrites':check['mvuWrites'],'assessment':a['assessment'],'explicitReuseRefsInRaw':len(re.findall(r'"ref"\s*:',content))})
 outputs.append(str(a['customRequest'])+' '+a['id']+'\n'+content+'\n')
report={'newCalls':7,'used':150,'remaining':50,'cumulative':484,'relatedOfflineTestsPassed':174,'syntaxFailures':5,'structurallyValid':2,'semanticFailureAfterStructuralPass':1,'scopedUnsaidPasses':1,'partialReceptionAccepted':False,'ambiguityPendingAccepted':False,'followupDependencyCalls':0,'productSourcesUnchanged':True,'originalEvidencePreserved':len(b['originalEvidence']),'formalProtectedUnchanged':len(b['formalProtected']),'actualInputsAndParametersUnchanged':True,'allOriginalRawBytesPreserved':True,'results':rows,'rawRepair':False,'validationRelaxed':False,'deployed':False,'formalStoryWritten':False,'automaticApprovalOrRevisionRestored':False}
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');(N/'complete-outputs.txt').write_text('478—484显式v6完整原始模型正文；未经修补。\n\n'+'\n'.join(outputs),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='Explicit v6 seven frozen inputs478-484:5 raw JSON failures,480 structural/reception binding pass but semantic null-string scope failure,484 unsaid scoped pass. No valid partial/ambiguity pending for followup.174 offline pass; product unchanged.150/200 used50 remaining.683 old evidence/22 formal protected. No retry,repair,relaxation,deployment,formal story or automatic routes.')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=True))
