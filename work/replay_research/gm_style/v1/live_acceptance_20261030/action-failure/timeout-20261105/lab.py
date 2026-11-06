"""Disposable exact-host reproduction. Never writes the formal installation."""
from pathlib import Path
import json, shutil, hashlib, struct, base64, zlib, subprocess, re, sys
H=Path(__file__).resolve().parent
L=Path('C:/Users/pit/.codex/visualizations/2026/10/28/01a18148-9afe-7661-9f62-b9b7a4d42fe0/.classification-timeout-20261105')
APP=Path('D:/github/sillyTavern'); F=APP/'data/default-user'; A=L/'app'; U=A/'data/default-user'
NAME='901 帝都初始卡 独立事项版 20261105'; CHAT='901 帝都正式开局 20261105'
CP=Path('chats')/NAME/(CHAT+'.jsonl')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf8')
def snapshot():
 paths=[F/'settings.json']
 for folder in ['chats','characters','worlds']:paths+=list((F/folder).rglob('*'))
 paths+=list((APP/'public/901-opening-combat').rglob('*'))
 return {str(p):sha(p) for p in paths if p.is_file()}
def card_transform(path,fn):
 data=path.read_bytes();out=data[:8];i=8
 while i<len(data):
  n=struct.unpack('>I',data[i:i+4])[0];typ=data[i+4:i+8];v=data[i+8:i+8+n];i+=n+12
  if typ==b'tEXt' and v.split(b'\0',1)[0] in (b'chara',b'ccv3'):
   j=json.loads(base64.b64decode(v.split(b'\0',1)[1]));fn(j);v=v.split(b'\0',1)[0]+b'\0'+base64.b64encode(json.dumps(j,ensure_ascii=False).encode())
  out+=struct.pack('>I',len(v))+typ+v+struct.pack('>I',zlib.crc32(typ+v))
 path.write_bytes(out)
def setup():
 assert not A.exists();A.mkdir(parents=True);put(L/'formal-before.json',snapshot())
 ignore=shutil.ignore_patterns('node_modules','.git','*.map')
 shutil.copytree(APP/'src',A/'src');shutil.copytree(APP/'default',A/'default',ignore=ignore)
 (A/'plugins').mkdir();(A/'public').mkdir()
 for p in (APP/'public').iterdir():
  if p.is_dir():
   if p.name.startswith('901-') and p.name not in ('901-opening-combat','901-rules-runtime'):continue
   shutil.copytree(p,A/'public'/p.name,ignore=ignore)
  else:shutil.copyfile(p,A/'public'/p.name)
 for n in ['server.js','package.json','config.yaml','webpack.config.js']:shutil.copyfile(APP/n,A/n)
 subprocess.run(['powershell','-NoProfile','-Command',f"New-Item -ItemType Junction -Path '{A/'node_modules'}' -Target '{APP/'node_modules'}' | Out-Null"],check=True)
 finish_setup()
def finish_setup():
 ignore=shutil.ignore_patterns('node_modules','.git','*.map')
 U.mkdir(parents=True)
 for n in ['OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions','User Avatars']:
  if (F/n).exists():shutil.copytree(F/n,U/n,ignore=ignore)
 for n in ['settings.json','secrets.json']:shutil.copyfile(F/n,U/n)
 (U/'worlds').mkdir();(U/'characters').mkdir()
 for p in (F/'worlds').glob('901*.json'):shutil.copyfile(p,U/'worlds'/p.name)
 shutil.copyfile(F/'characters'/(NAME+'.png'),U/'characters'/(NAME+'.png'))
 card_transform(U/'characters'/(NAME+'.png'),lambda j:j.update(chat=CHAT))
 r=[json.loads(x) for x in (F/CP).read_text(encoding='utf8').splitlines()]
 assert len(r)>=6 and r[4]['is_user'] and r[5]['extra']['901_replay_gate']['diagnostic']['errorCode']=='CLASSIFICATION_TIMEOUT'
 # Replay the same saved failed reply using native regenerate; user text/state unchanged.
 (U/CP).parent.mkdir(parents=True);(U/CP).write_bytes((F/CP).read_bytes());shutil.copyfile(U/CP,L/'seed.jsonl')
 s=json.loads((U/'settings.json').read_text(encoding='utf8'));s['character']=NAME+'.png';put(U/'settings.json',s)
 # Only add timestamps and response metadata; preserve request construction and body.
 target=A/'src/endpoints/backends/chat-completions.js';src=target.read_text(encoding='utf8')
 src=src.replace("console.debug('Chat Completion request:', requestBody);", "const traceStart=Date.now(); console.info('901_TRACE',JSON.stringify({event:'dispatch',at:traceStart,model:requestBody.model,stream:requestBody.stream,maxTokens:requestBody.max_tokens,messageBytes:Buffer.byteLength(JSON.stringify(requestBody.messages))}));\n        controller.signal.addEventListener('abort',()=>console.info('901_TRACE',JSON.stringify({event:'aborted',elapsed:Date.now()-traceStart})),{once:true});")
 head,sep,tail=src.rpartition('const fetchResponse = await fetch(endpointUrl, config);')
 assert sep
 src=head+sep+"\n        console.info('901_TRACE',JSON.stringify({event:'headers',elapsed:Date.now()-traceStart,status:fetchResponse.status}));"+tail
 src=src.replace("console.debug('Chat Completion response:', json);","console.info('901_TRACE',JSON.stringify({event:'complete',elapsed:Date.now()-traceStart,usage:json.usage,finishReason:json.choices?.[0]?.finish_reason,textLength:json.choices?.[0]?.message?.content?.length}));")
 target.write_text(src,encoding='utf8')
 put(H/'setup.json',{'port':18111,'lab':str(L),'model':s['oai_settings'].get('custom_model'),'sourceChat':str(F/CP),'sourceChatSha256':sha(F/CP),'classificationDeadlineMs':60000,'exactChatCopy':True,'serverChange':'timing metadata only','formalWritten':False})
 print('Isolated 18111 prepared. Settings copied; formal files untouched.')
def check():
 before=json.loads((L/'formal-before.json').read_text(encoding='utf8'));after=snapshot()
 changes=[k for k in before.keys()|after.keys() if before.get(k)!=after.get(k)]
 print(json.dumps({'protectedFiles':len(before),'changes':changes},ensure_ascii=False))
def archive(label,log='candidate.stdout.log'):
 r=[json.loads(x) for x in (U/CP).read_text(encoding='utf8').splitlines()]
 seed=[json.loads(x) for x in (L/'seed.jsonl').read_text(encoding='utf8').splitlines()]
 def root(rows):
  for row in reversed(rows[1:]):
   variables=row.get('variables',[])
   if isinstance(variables,list) and variables:
    value=variables[row.get('swipe_id',0)].get('stat_data',{}).get('901_rules_poc')
    if value:return value
  raise AssertionError('Missing rule state')
 traces=[json.loads(x.split('901_TRACE ',1)[1]) for x in (L/log).read_text(encoding='utf8',errors='replace').splitlines() if '901_TRACE ' in x]
 shutil.copyfile(U/CP,L/(label+'.jsonl'))
 evidence={'trace':traces,'gate':r[-1].get('extra',{}).get('901_replay_gate'),
  'messages':len(r)-1,'playerTextsUnchanged':[x['mes'] for x in r if x.get('is_user')]==[x['mes'] for x in seed if x.get('is_user')],
  'fullRuleRootUnchanged':root(r)==root(seed),'ruleRevision':root(r)['revision']}
 put(H/(label+'.json'),evidence)
 print(json.dumps({k:v for k,v in evidence.items() if k!='trace'},ensure_ascii=False))
def candidate():
 shutil.copyfile(L/'seed.jsonl',U/CP)
 shutil.copyfile(F/'characters'/(NAME+'.png'),U/'characters'/(NAME+'.png'))
 card_transform(U/'characters'/(NAME+'.png'),lambda j:j.update(chat=CHAT))
 source=H.parents[5]/'rules_engine/gm_runtime/replay-gate-script.example.js'
 assert source.exists(),source
 target=A/'public/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js'
 if not (L/'gate-before.js').exists():shutil.copyfile(target,L/'gate-before.js')
 target.write_text(source.read_text(encoding='utf8').replace('/901-rules-runtime/','/901-opening-combat/'),encoding='utf8',newline='\n')
 backend=A/'src/endpoints/backends/chat-completions.js';src=backend.read_text(encoding='utf8')
 src="import fs901 from 'node:fs';\n"+src.replace("import { createHmac }", "import { createHmac, createHash }")
 src=src.replace("messageBytes:Buffer.byteLength(JSON.stringify(requestBody.messages))", "messageBytes:Buffer.byteLength(JSON.stringify(requestBody.messages)),requestHash:createHash('sha256').update(JSON.stringify(requestBody)).digest('hex')")
 anchor='        const fetchResponse = await fetch(endpointUrl, config);'
 assert src.count(anchor)==2
 injection='''        if (fs901.existsSync('timeout-once.flag') && JSON.stringify(requestBody.messages).includes('你是901行动分类器')) {
            fs901.unlinkSync('timeout-once.flag');
            console.info('901_TRACE', JSON.stringify({event:'controlled_delay_before_upstream',elapsed:Date.now()-traceStart}));
            await new Promise((resolve,reject)=>{
                const timer=setTimeout(resolve,65000);
                controller.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new Error('901 isolated injected wait cancelled'));},{once:true});
            });
        }
'''
 head,sep,tail=src.rpartition(anchor)
 backend.write_text(head+injection+sep+tail,encoding='utf8')
 (A/'timeout-once.flag').write_text('Explicit isolated fault: first classification stalls before upstream dispatch.',encoding='utf8')
 print('Candidate and one-shot server wait installed only in isolated app; 60s deadline restored.')
if __name__=='__main__':globals()[sys.argv[1]](*sys.argv[2:])
