"""Disposable exact Tavern copy, using the existing lab copy/card approach. No live writes."""
from pathlib import Path
import json, shutil, subprocess, importlib.util, hashlib, sys
H=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('lab',H.parent/'action-failure/timeout-20261105/lab.py');lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
A=Path('C:/Users/pit/.codex/visualizations/2026/11/11/01a1cca4-1b4e-7ba3-99d2-1ab863fea37a/clinic-browser-20261113/app')
F=lab.F; U=A/'data/default-user'; name=lab.NAME; chat='901 帝都正式续玩 20261106'
if '--resume-after-copy' not in sys.argv:
 assert not A.exists(), 'Isolated app already exists; inspect instead of overwriting'
 A.mkdir(parents=True)
 ignore=shutil.ignore_patterns('node_modules','.git','*.map','backups','cache')
 for folder in ['src','default','public']:shutil.copytree(lab.APP/folder,A/folder,ignore=ignore)
 for file in ['server.js','package.json','config.yaml','webpack.config.js']:shutil.copy2(lab.APP/file,A/file)
 (A/'plugins').mkdir(exist_ok=True);U.mkdir(parents=True)
 for folder in ['OpenAI Settings','context','instruct','sysprompt','TextGen Settings','themes','extensions','User Avatars','worlds']:
  if (F/folder).exists():shutil.copytree(F/folder,U/folder,ignore=ignore)
 settings=json.loads((F/'settings.json').read_text(encoding='utf8'))
 # Local copy only: no real credentials. Preserve model/generation settings.
 for key in ['proxy_password','api_key','api_key_custom']:
  if key in settings.get('oai_settings',{}):settings['oai_settings'][key]=''
 lab.put(U/'settings.json',settings);lab.put(U/'secrets.json',{})
 (U/'characters').mkdir();shutil.copy2(F/'characters'/(name+'.png'),U/'characters'/(name+'.png'))
 cp=Path('chats')/name/(chat+'.jsonl');(U/cp).parent.mkdir(parents=True);shutil.copy2(F/cp,U/cp)
 shutil.copytree(H/'package/901-opening-combat',A/'public/901-opening-combat',dirs_exist_ok=True)
 entry=(H/'candidate-entry.js').read_text(encoding='utf8')
 def transform(j):
  j['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
 lab.card_transform(U/'characters'/(name+'.png'),transform)
else:
 assert (U/'settings.json').is_file() and (U/'characters'/(name+'.png')).is_file()
 settings=json.loads((U/'settings.json').read_text(encoding='utf8'));cp=Path('chats')/name/(chat+'.jsonl')
shutil.copytree(lab.APP/'node_modules',A/'node_modules',dirs_exist_ok=True)
guard="""import http from 'node:http';import https from 'node:https';import {syncBuiltinESMExports} from 'node:module';
const denied=()=>{throw Error('ISOLATED_OFFLINE_OUTBOUND_BLOCKED');};http.request=denied;http.get=denied;https.request=denied;https.get=denied;globalThis.fetch=denied;syncBuiltinESMExports();
"""
(A/'offline-guard.mjs').write_text(guard,encoding='utf8')
backend=A/'src/endpoints/backends/chat-completions.js';body=backend.read_text(encoding='utf8')
body="import fsClinic from 'node:fs';\n"+body
body=body.replace("router.post('/status', async function (request, statusResponse) {","router.post('/status', async function (request, statusResponse) { return statusResponse.json({data:[{id:"+json.dumps(settings['oai_settings']['custom_model'])+"}],isolatedOffline:true});")
anchor="        console.debug('Chat Completion request:', requestBody);"
assert body.count(anchor)==1
capture="""        const clinicKind=JSON.stringify(requestBody.messages).includes('你是901行动分类器')?'classification':'narration';
        fsClinic.mkdirSync('clinic-captures',{recursive:true});
        const clinicFile='clinic-captures/'+Date.now()+'-'+clinicKind+'.json';
        fsClinic.writeFileSync(clinicFile,JSON.stringify({kind:clinicKind,endpointUrl,requestBody,source:request.body.chat_completion_source,offline:true,upstreamCalls:0},null,2));
        if(clinicKind==='classification')return response.json({choices:[{message:{role:'assistant',content:JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',reason:'隔离路径控制：已声明送信讨论；该值不是模型输出'})},finish_reason:'stop'}]});
        return response.status(418).json({error:{message:'CLINIC_CAPTURE_ONLY_NO_MODEL_CALL'}});
"""
body=body.replace(anchor,capture+anchor);backend.write_text(body,encoding='utf8')
# Browser connections stay on the isolated origin; normal local libraries remain available.
index=A/'public/index.html';html=index.read_text(encoding='utf8');html=html.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="connect-src \'self\' data: blob:">',1);index.write_text(html,encoding='utf8')
protected=[F/'settings.json',F/cp,F/'characters'/(name+'.png'),lab.APP/'public/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js']+list((F/'worlds').glob('901*.json'))
lab.put(H/'browser-environment.json',{'app':str(A),'port':18123,'upstreamBlocked':True,'secretsCopied':False,'controlledClassification':'NO_CHECK fixture, not model evidence','protected':{str(p):lab.sha(p) for p in protected}})
print(json.dumps({'app':str(A),'port':18123,'secretsCopied':False}))
