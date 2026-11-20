from pathlib import Path
import json,jsonschema,hashlib
E=Path(__file__).resolve().parent;I=E/'iteration-200-20261115';read=lambda p:json.loads(p.read_text(encoding='utf8'))
def state(name):return read_rows(name)[-1]['variables'][0]['stat_data']['901_rules_poc']
def read_rows(name):return [json.loads(x) for x in (I/name).read_text(encoding='utf8').splitlines()]
def projection(r):
 for m in r['messages']:
  marker='【901逐角色知情投影】\n'
  if marker in m['content']:
   return json.JSONDecoder().raw_decode(m['content'].split(marker)[1])[0]
 raise AssertionError('No projection')
def check_projection(p):
 actors={a['actorId']:a for a in p['actorKnowledge']};facts=actors['player']['facts'];assert len(facts)==2;assert not actors['bright']['facts'];assert all(f['belief']=='uncertain' and f['content']['speakerId']=='huang' for f in facts);return [f['content']['text'] for f in facts]
a=state('A1-after.chat.jsonl');b=state('A1-reopened.chat.jsonl');assert a==b
k=a['storyKnowledge'];assert len(k['knowledge'])==2 and len(k['dialogueBatches'])==1;assert all(g['knowerId']=='player' for g in k['knowledge'].values())
classifications=sorted((I/'browser-captures').glob('*classification.json'));assert len(classifications)==2
cp=projection(read(classifications[1])['requestBody']);np=projection(read(I/'A.scene2.narration.request.json'));assert cp==np;messages=check_projection(cp)
c=state('A2-after.chat.jsonl');assert c['actors']==a['actors'];assert len(c['storyKnowledge']['knowledge'])==3;assert len(c['storyKnowledge']['dialogueBatches'])==2;assert all(g['knowerId']=='player' for g in c['storyKnowledge']['knowledge'].values())
for id in ['A.scene1.reception','A.scene2.reception']:
 r=read(I/(id+'.request.json'));reply=read(I/(id+'.content.txt'));jsonschema.validate(reply,r['response_format']['json_schema']['schema']);assert read(I/(id+'.check.json'))['pass']
for id in ['A.scene1.narration','A.scene1.reception','A.scene2.narration','A.scene2.reception']:
 assert read(I/(id+'.request.json'))==read(I/('browser-captures/'+id+'.request.json'));assert read(I/('browser-captures/'+id+'.delivered.json'))['rawReplay']
report={'A':{'realCalls':[340,341,342,343],'classification':'local NO_CHECK, 2 calls, not model acceptance','exactRawRequestReplay':True,'actualMessages':messages,'advertisedWaterMessageTransmitted':False,'reopenExactMVU':True,'noExtraExtractionOnReopen':True,'classificationAndNarrationProjectionEqual':True,'belief':'uncertain source messages','grantsAfterRound1':2,'grantsAfterRound2':3,'knowers':['player'],'mechanicsUnchanged':True,'pending':0,'fixtureLimitation':'Initial reading-notice premise conflicts with established literacy. Actual output corrected it; acceptance covers actual literacy statement and ask-passersby proposal, not water notice.'}}
(I/'A-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False))
