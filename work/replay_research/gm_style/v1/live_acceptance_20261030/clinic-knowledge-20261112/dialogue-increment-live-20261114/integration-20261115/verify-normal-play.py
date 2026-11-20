from pathlib import Path
import json,hashlib
E=Path(__file__).resolve().parent;N=E/'normal-play-20261115';I=E/'iteration-200-20261115';root=next(p for p in E.parents if p.name=='TRPG outputs')
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
b=read(N/'baseline.json'); ledger=read(I/'run.json'); calls=[x for x in ledger['attempts'] if x['customRequest']>405]
assert len(calls)==15 and ledger['cumulative']==420 and ledger['remaining']==114
for p,digest in b['formalProtected'].items():assert sha(Path(p))==digest,p
for m in b['candidate']['modules']:assert sha(root/m['source'])==m['source_sha256'],m['source']
assert read(E/'candidate-manifest.json')==b['candidate']
for a in calls:
 assert sha(I/(a['id']+'.request.json'))==a['requestSha256']
 assert sha(I/(a['id']+'.raw-response.txt'))==a['rawResponseSha256']
 assert a['manualVerdict'] and a['rawUnmodified']
start=[json.loads(x) for x in (N/'start.chat.jsonl').read_text(encoding='utf8').splitlines()]
rows=[json.loads(x) for x in (N/'final.chat.jsonl').read_text(encoding='utf8').splitlines()]
new=rows[len(start):]; players=[r for r in new if r.get('is_user')]; replies=[r for r in new if not r.get('is_user')]
assert len(players)==len(replies)==5
narrations=[a for a in calls if a['id'].endswith('narration-or-memory')]
for row,a in zip(replies,narrations):
 raw=read(I/(a['id']+'.raw-response.txt'))['choices'][0]['message']['content']
 assert row['mes']==raw+'\n\n<StatusPlaceHolderImpl/>'
failed=[r for r in replies if r.get('extra',{}).get('901_knowledge_status',{}).get('status')=='unprocessed']
assert len(failed)==3
before=[json.loads(x) for x in (N/'round3-before-reopen.chat.jsonl').read_text(encoding='utf8').splitlines()]
after=[json.loads(x) for x in (N/'round3-reopened.chat.jsonl').read_text(encoding='utf8').splitlines()]
assert before==after
checks=[read(N/(a['id']+'.check.json')) for a in calls if a['id'].endswith('reception')]
assert [r['structuralPass'] for r in checks]==[True,False,False,False,True]
assert all(r['mvuWrites']==0 for r in checks if not r['structuralPass'])
report=dict(completedRounds=5,actualNewModelCalls=15,cumulative=420,used=86,remaining=114,formalFilesUnchanged=len(b['formalProtected']),candidateModulesUnchanged=len(b['candidate']['modules']),allRawResponsesUnmodified=True,allFiveBodiesPreserved=True,reopenExact=True,receptionPasses=2,receptionFailures=3,unprocessedFlagsPreserved=3,failedExtractionWrites=0,classificationReplay=dict(source=415,newCalls=0,exactRequest=True),productChanges=0,regressionRerun=False,reason='Only acceptance timeout and evidence helpers changed; original product checks retained.',memory='Existing real database read path retained, automatic updates originally off and summary originally frozen; not proof of automatic memory writes.',notCovered=['Natural pending/dependency confirmation: no valid pending produced in these five rounds','Stable extraction of normal dialogue','Long-term or many-character generalization','Formal deployment'],narrativeLimit='Round5 seal detail was not present in request; unverified scene addition, not adopted as canonical.')
(N/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
ledger.update(complete=True,closed=True,currentScopeResult='5 ordinary rounds completed; 15 actual calls; reception2/5 passes,3 strict failures preserved; exact reopen; product unchanged; remaining114 not scheduled')
(I/'run.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
