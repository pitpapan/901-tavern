"""Update only the existing disposable localhost lab; no external transport."""
from pathlib import Path
import hashlib,json,shutil,importlib.util
E=Path(__file__).resolve().parent
P=E.parent
A=Path(json.loads((P/'setup.json').read_text(encoding='utf-8'))['app'])
R=next(p for p in E.parents if p.name=='TRPG outputs')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
put=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert not (E/'browser-prepared.json').exists(),'Do not overwrite an existing diagnostic setup'
setup=json.loads((P/'setup.json').read_text(encoding='utf-8'))
card=A/'data/default-user/characters'/ (setup['character']+'.png')
backend=A/'src/endpoints/backends/chat-completions.js'
protected={str(p):sha(p) for p in (A/'data/default-user/chats'/setup['character']).glob('*.jsonl')}
protected[str(P/'live/run.json')]=sha(P/'live/run.json')
put(E/'browser-protected-before.json',protected)
shutil.copy2(card,E/'card.before.png');shutil.copy2(backend,E/'backend.before.js');shutil.copy2(A/'clinic-natural-config.json',E/'lab-config.before.json')
for name in ['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']:
 target=A/'public/901-opening-combat/work/rules_engine/gm_runtime'/name
 shutil.copy2(target,E/(name+'.installed-before'))
 shutil.copy2(R/'work/rules_engine/gm_runtime'/name,target)
entry=(P/'live/entry.fixture.js').read_text(encoding='utf-8').split('// Continuation evidence only.')[0]
entry=entry.replace('const continuationParentId="'+setup['parentChatId']+'";','const continuationParentId='+json.dumps(setup['branchChatId'],ensure_ascii=False)+';')
entry=entry.replace('expectedRevision:1','expectedRevision:3').replace('sourceRevision===1','sourceRevision===3')
entry=entry.replace("value[key]===continuationParentId", "[continuationParentId,"+json.dumps(setup['parentChatId'],ensure_ascii=False)+"].includes(value[key])")
entry=entry.replace('classificationTimeoutMs:60000','classificationTimeoutMs:500')
entry+='\n'+(E/'browser-controls.js').read_text(encoding='utf-8')
(E/'entry.fixture.js').write_text(entry,encoding='utf-8')
# Resolve the established PNG metadata helper directly from its known location.
helper=R/'work/replay_research/gm_style/v1/live_acceptance_20261030/action-failure/timeout-20261105/lab.py'
spec=importlib.util.spec_from_file_location('lab',helper);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
def transform(c):
 c['data']['extensions']['tavern_helper']['scripts'][1]['content']=entry
lab.card_transform(card,transform)
body=backend.read_text(encoding='utf-8')
anchor="        if(kind==='classification')return response.json"
assert body.count(anchor)==1
insert="""        if(lab.replyDiagnostic){
          const reply=content=>response.json({choices:[{message:{role:'assistant',content},finish_reason:'stop'}]});
          if(kind==='classification'){
            const mode=lab.replyMode??'normal';
            if(mode==='malformed'){lab.replyMode='normal';fsClinic.writeFileSync('clinic-natural-config.json',JSON.stringify(lab));return reply('{invalid local classification');}
            if(mode==='timeout'){
              lab.timeoutLeft=(lab.timeoutLeft??2)-1;if(!lab.timeoutLeft)lab.replyMode='normal';fsClinic.writeFileSync('clinic-natural-config.json',JSON.stringify(lab));
              await new Promise(resolve=>setTimeout(resolve,1600));return reply('{abandoned local timeout');
            }
            return reply(JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',reason:'本地正常分类夹具，非模型输出'}));
          }
          if(kind==='narration')return reply('<dream_body>【本地恢复夹具，非模型正文】布莱特点头：“我在听，你继续说。”</dream_body>');
          return response.status(418).json({error:{message:'DIAGNOSTIC_EXTRACTION_NOT_SENT'}});
        }
"""
body=body.replace(anchor,insert+anchor)
body+='''
// Disposable diagnostic controls, restricted to this already offline local lab.
router.post('/reply-diagnostic-mode',async(request,response)=>{
 const lab=JSON.parse(fsClinic.readFileSync('clinic-natural-config.json','utf8'));
 if(!lab.replyDiagnostic||!['normal','malformed','timeout'].includes(request.body.mode))return response.sendStatus(400);
 lab.replyMode=request.body.mode;lab.timeoutLeft=2;fsClinic.writeFileSync('clinic-natural-config.json',JSON.stringify(lab));response.json({mode:lab.replyMode,externalCalls:0});
});
router.post('/reply-diagnostic-evidence',async(request,response)=>{
 const lab=JSON.parse(fsClinic.readFileSync('clinic-natural-config.json','utf8'));
 if(!lab.replyDiagnostic||!/^[-a-zA-Z0-9]+$/.test(request.body.label))return response.sendStatus(400);
 const prefix=lab.evidenceDir+'/'+request.body.label;
 if(fsClinic.existsSync(prefix+'.json'))return response.sendStatus(409);
 fsClinic.writeFileSync(prefix+'.json',JSON.stringify(request.body,null,2),{flag:'wx'});response.json({saved:true,externalCalls:0});
});
'''
backend.write_text(body,encoding='utf-8')
(E/'browser').mkdir();(E/'browser/captures').mkdir()
put(A/'clinic-natural-config.json',{'evidenceDir':str(E/'browser'),'captureDir':str(E/'browser/captures'),'phase':'reply-recovery','sequence':0,'replyDiagnostic':True,'replyMode':'normal'})
put(E/'browser-prepared.json',{'app':str(A),'port':18127,'parentChatId':setup['branchChatId'],'expectedParentRevision':3,'fixtureNarration':True,'externalModelCalls':0,'productModules':[sha(R/'work/rules_engine/gm_runtime'/n) for n in ['adjudication-gate.mjs','replay-gate-script.example.js','story-dialogue-knowledge.mjs']]})
print(json.dumps({'prepared':True,'externalCalls':0}))
