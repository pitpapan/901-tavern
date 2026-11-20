"""Verify local browser captures, retained inputs and delivery differences. No network."""
from pathlib import Path
import json,hashlib,shutil
O=Path(__file__).resolve().parent;H=O.parent;E=O/'browser-evidence'
read=lambda p:json.loads(p.read_text(encoding='utf8'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
setup=read(E/'setup.json');A=Path(setup['app']);environment=read(H/'browser-environment.json')
paths=[p for p in sorted((A/'clinic-captures').glob('*.json')) if p.name not in setup['captureFilesBefore']]
assert len(paths)==10,[p.name for p in paths]
labels=['entry-promise','memory-unknown','memory-relayed','chain-A-first','chain-B-first']
parameters=read(H/'prepared-requests.json')['parameters'];results=[]
def context(body):
 text='\n'.join(m.get('content','') for m in body['messages']);marker='【901逐角色知情投影】\n'
 assert text.count(marker)==1
 return json.JSONDecoder().raw_decode(text.split(marker,1)[1])[0]
for i,label in enumerate(labels):
 pair=[]
 for p in paths[2*i:2*i+2]:
  shutil.copy2(p,E/p.name);data=read(p);assert data['offline'] and data['upstreamCalls']==0
  body=data['requestBody'];ctx=context(body);counts=[len(a['facts']) for a in ctx['actorKnowledge']]
  assert counts==([0,1,1] if i==2 else [0,1,0]),(label,counts)
  flat='\n'.join(m.get('content','') for m in body['messages'])
  assert '知情不等于必须说出' in flat
  notes=[s['disclosure'] for a in ctx['actorKnowledge'] for f in a['facts'] for s in f['sources'] if s['disclosure']]
  assert len(notes)==(1 if i in [0,1,4] else 0),(label,notes)
  if i>0:
   for value in ['先交推荐信再询问住宿','作者事实','不自动共享','ISOLATED-REJECTED-10','用户已拒绝此处人物知情']:
    assert value in flat,(label,data['kind'],value)
  if data['kind']=='narration':
   for key,value in parameters.items():
    if key in body:assert body[key]==value,(key,body[key],value)
   assert 'AutoCardUpdater' not in body.get('model','')
   if i>=3:
    chain=read(O/'continuations/prepared.json')['chains'][i-3]
    assert chain['precedingResponse']['content'] in flat
    assert chain['first'] in flat
    raw=json.dumps(body,ensure_ascii=False,separators=(',',':')).encode()
    target=O/'continuations'/('AB'[i-3]+'.first.request.json');target.write_bytes(raw)
  pair.append({'file':p.name,'kind':data['kind'],'sha256':sha(p),'knowledgeCounts':counts,'explicitNotes':len(notes),'context':ctx})
 assert [r['kind'] for r in pair]==['classification','narration']
 assert pair[0]['context']==pair[1]['context']
 results.append({'label':label,'captures':pair})
before=read(E/'03-relay-ui.json');after=read(E/'03-relay-reopened-ui.json')
assert before['knowledge']==after['knowledge'];assert before['database']==after['database']
assert after['context']['actorKnowledge'][2]['facts'][0]['sources'][0]['senderId']=='bright'
for file,expected in environment['protected'].items():assert sha(Path(file))==expected,file
manifest=read(O/'package-manifest.json');diff=[]
package=O/'package/901-opening-combat';formal=Path('D:/github/sillyTavern/public/901-opening-combat')
for item in manifest:
 path=Path(item['destination']);relative=path.relative_to(package)
 assert sha(path)==item['sha256'];assert sha(A/'public/901-opening-combat'/relative)==item['sha256']
 installed=formal/relative
 actual=sha(installed) if installed.is_file() else None
 if actual!=item['sha256']:diff.append({'path':relative.as_posix(),'installedSha256':actual,'candidateSha256':item['sha256'],'action':'replace' if actual else 'add'})
assets=[]
for name in ['scene-binding.json','narrative-style.json','work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json']:
 assert sha(package/name)==sha(formal/name);assets.append({'path':name,'unchanged':True,'sha256':sha(package/name)})
backend=(A/'src/endpoints/backends/chat-completions.js').read_text(encoding='utf8');guard=(A/'offline-guard.mjs').read_text(encoding='utf8')
assert backend.index('return response.status(418)')<backend.index("console.debug('Chat Completion request:'")
assert 'globalThis.fetch=denied' in guard and 'https.request=denied' in guard
assert "connect-src 'self' data: blob:" in (A/'public/index.html').read_text(encoding='utf8')
ledger=read(H/'live-20261113/run.json');assert ledger['cumulative']==248 and ledger['remaining']==0
plan=read(O/'continuations/prepared.json')
for chain in plan['chains']:
 p=O/'continuations'/(chain['id']+'.first.request.json')
 chain['firstCapturedRequest']={'file':p.name,'bytes':p.stat().st_size,'sha256':sha(p),'status':'captured-not-sent'}
 seedLines=(O/'continuations'/chain['seedFile']).read_text(encoding='utf8').splitlines()
 captureChat=E/('04-chain-A.chat.jsonl' if chain['id']=='A' else '05-chain-B.chat.jsonl')
 capturedLines=captureChat.read_text(encoding='utf8').splitlines()
 assert len(capturedLines)==len(seedLines)+2
 for old,new in zip(seedLines[1:],capturedLines[1:len(seedLines)]):assert json.loads(old)['mes']==json.loads(new)['mes']
 ready=O/'continuations'/(chain['id']+'.ready.seed.jsonl');ready.write_text('\n'.join(capturedLines[:len(seedLines)])+'\n',encoding='utf8')
 chain['readySeed']={'file':ready.name,'sha256':sha(ready),'includesActualMemory':True,'captureFailureTailIncluded':False}
put(O/'continuations/prepared.json',plan)
report={'status':'local-browser-input-verified','modelCallsThisTask':0,'credentialsRead':False,'cumulative':248,'remaining':0,'newCaptures':10,'syntheticClassificationControls':5,'upstreamStoppedNarrations':5,'packagedModulesVerified':len(manifest),'explicitRelayReopened':True,'nonemptyMemoryRetained':True,'formalProtectedFilesUnchanged':True,'currentRegressionRun':False,'priorRegressionRecord':{'tests':135,'failures':0,'log':'offline-regression.log'},'results':results,'limits':['No new continuous model response.','Memory labels and controlled projections are retained; semantic model compliance is not proven.','Free-text memory source/known_by fields do not constitute machine-validated grants.','No general secrecy audit or world-clock binding.']}
put(E/'verification.json',report);put(O/'deployment-diff.json',{'deployed':False,'changedModules':diff,'unchangedAssets':assets,'entryCandidate':'candidate-entry.js','entryOriginal':'../installed-entry.js','fixtureControlsIncluded':False})
print(json.dumps({'captures':len(paths),'modules':len(manifest),'changedVsInstalled':len(diff),'added':sum(d['action']=='add' for d in diff),'modelCalls':0,'relayReopened':True,'formalUnchanged':True,'requests':[c['firstCapturedRequest'] for c in plan['chains']]},ensure_ascii=False))
