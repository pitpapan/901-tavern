// Isolated acceptance runner. No production binding, semantic approval or rewriting.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.cwd(),base=new URL('./',import.meta.url),file=s=>new URL(s,base);
const importRoot=s=>import(pathToFileURL(resolve(root,s)));
const {createStoryKnowledgeRuntime}=await importRoot('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs');
const {createDialogueSemanticAdapter}=await importRoot('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs');
const {createOpeningFixture}=await importRoot('TRPG outputs/work/rules_engine/gm_runtime/opening.mjs');
const {captureSavedReview}=await importRoot('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs');
const prior=new URL('../',base);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const json=async(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const sha=v=>createHash('sha256').update(v).digest('hex');
const catalog={id:'isolated.dialogue.live.v1',actors:{bright:'布莱特',huang:'黄泉',player:'御临风'},facts:[
 {id:'harbor.closed',entityId:'harbor',field:'reported_status',value:'码头停航',certainty:'rumor',visibility:'private'}]};
const memory={source:'existing-database',data:{sheet_isolated:{name:'纪要表',content:[['编码索引','纪要'],['TEST0001','三人在工坊外。此条纪要不证明任何本轮消息已经传达。']]}}};
function fixture(seed){
 const chat=structuredClone(seed.chat),floors=structuredClone(seed.floors),chatId=seed.chatId;
 const getAnchor=()=>({chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0});
 const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(data,{message_id})=>{floors[message_id]=structuredClone(data);}};
 const tavern={chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};
 const knowledge=createStoryKnowledgeRuntime({catalog,mvu,tavern,getAnchor,dialogue:{readMemory:()=>memory}});
 return {knowledge,getAnchor,source:()=>({...getAnchor(),text:chat.at(-1).mes}),snapshot:()=>({chatId,chat,floors}),advance(text){floors[chat.length]=structuredClone(floors[chat.length-1]);chat.push({mes:text,is_user:false,swipe_id:0});}};
}
async function seedCase(id,text,known=false){
 const chatId='isolated.dialogue.live.'+id,{actors}=createOpeningFixture();
 const f=fixture({chatId,chat:[{mes:known?'隔离事件：布莱特收到一则未经核实的消息：“码头停航”。':text,is_user:false,swipe_id:0}],
 floors:{0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId,actors,operations:{}}}}}});
 if(known){await f.knowledge.receive({id:'isolated.prior',status:'received',authority:'host-confirmed',sourceAnchor:f.source(),recipientIds:['bright'],propositionRefs:['harbor.closed'],channel:'message',belief:'rumor'});f.advance(text);}
 return f.snapshot();
}
async function captureReception(seed){
 const f=fixture(seed);let captured;
 f.knowledge.configureDialogue(createDialogueSemanticAdapter({complete:async request=>{captured=request;throw Error('LOCAL_CAPTURE_ONLY');}}));
 await assert.rejects(f.knowledge.observeDialogue(f.source()),/LOCAL_CAPTURE_ONLY/);assert.ok(captured);return captured;
}
const [mode,id,verdict,...noteParts]=process.argv.slice(2);
if(mode==='--prepare'){
 await mkdir(file('batch/'),{recursive:true});await mkdir(file('live/'),{recursive:true});
 const old=await read(new URL('batch/prepared.json',prior)),ledger=await read(new URL('normalized-label-retest-20261114/run.json',prior));assert.equal(ledger.cumulative,275);assert.equal(ledger.closed,true);
 const cases=[
  ['01-received-new','布莱特对黄泉说：“东门封闭。”黄泉听清了。','黄泉获得东门封闭这一来源说法；其他人不共享；不确认世界事实。'],
  ['02-received-rumor','布莱特对黄泉说：“码头停航。”','明确直接告知不强求复述；黄泉取得相同传闻或等价的未确认来源说法，不能升级为确认。',true],
  ['03-not-heard','布莱特对黄泉说：“东门封闭。”黄泉戴着隔音耳罩，没有听见。','不得给黄泉登记消息；明确未接收不应要求确认。'],
  ['04-not-yet-said','布莱特打算告诉黄泉：“东门封闭。”他还没有开口。','计划未发生，不授予任何接收者，不应要求确认。'],
  ['05-partial-first','布莱特对黄泉说：“东门封闭，改走南门。”黄泉只听清“东门封闭”，没听清后半句。','黄泉仅获得东门封闭，不能获得改走南门。'],
  ['06-partial-second','布莱特对黄泉说：“东门封闭，改走南门。”黄泉只听清“改走南门”，没听清前半句。','黄泉仅获得改走南门，不能获得东门封闭。'],
  ['07-ambiguous-hearing','布莱特低声说：“仓库换了锁。”黄泉站在门边，不确定她是否听清。','不确定是否听清应待核；不直接授予黄泉。'],
  ['08-ambiguous-listener','布莱特对黄泉和御临风说：“见面改在钟楼。”其中一人没听清，记录没有说明是谁。','不得猜测哪个人听清；接收范围待核。']
 ];
 const plan={authorization:'用户授权十次普通对白知情增量模型验证；不部署、不写正式剧情、不恢复自动批准或修订。按已声明策略：失败即停、不重试。',baseline:275,limit:10,endpoint:old.endpoint,parameters:old.parameters,cases:[],followups:[
 {id:'09-unrelated',parent:'07-ambiguous-hearing',text:'我整理衣袖，和黄泉聊聊今天的饭菜。',expected:'不依赖待核消息，required为空，不询问。'},
 {id:'10-dependent',parent:'07-ambiguous-hearing',text:'让黄泉根据布莱特刚才告知的仓库情况，判断能否用旧钥匙进去。',expected:'实际依赖黄泉是否收到仓库换锁消息，应返回相关待核id并触发询问；不代替用户回答。'}],
 kind:'actual-semantic-adapter-requests-with-isolated-synthetic-prose',browserCapture:false};
 for(const [caseId,text,expected,known] of cases){
  const seed=await read(new URL('batch/'+caseId+'.seed.json',prior)),captured=await captureReception(seed),body={...old.parameters,messages:captured.messages},raw=JSON.stringify(body);
  await json(file('batch/'+caseId+'.seed.json'),seed,true);await writeFile(file('batch/'+caseId+'.request.json'),raw,{flag:'wx'});
  plan.cases.push({id:caseId,text,expected,purpose:captured.purpose,requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw)});
 }
 const protectedFiles=(await read(new URL('baseline.json',prior))).protectedFiles,baseline={protectedFiles:{},sourceFiles:{}};
 for(const p of Object.keys(protectedFiles))baseline.protectedFiles[p]=sha(await readFile(p));
 for(const p of ['TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs','TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs','TRPG outputs/work/rules_engine/gm_runtime/replay-gate-script.example.js','TRPG outputs/work/rules_engine/gm_runtime/narrative-style-projection.mjs','TRPG outputs/work/rules_engine/mvu_poc/adapter.mjs','901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js','901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js'])baseline.sourceFiles[p]=sha(await readFile(p));
 await json(file('baseline.json'),baseline,true);await json(file('batch/prepared.json'),plan,true);
 await json(file('live/run.json'),{authorization:plan.authorization,baseline:275,limit:10,cumulative:275,remaining:10,attempts:[],closed:false,retries:0,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false},true);
 console.log(JSON.stringify({status:'prepared',cases:plan.cases.map(c=>({id:c.id,bytes:c.requestBytes})),followups:plan.followups,credentialsRead:false}));
}else if(mode==='--send'){
 const plan=await read(file('batch/prepared.json')),ledger=await read(file('live/run.json')),order=[...plan.cases,...plan.followups].map(c=>c.id),baseline=await read(file('baseline.json'));
 assert.equal(ledger.closed,false);assert.equal(order[ledger.attempts.length],id);assert.ok(ledger.remaining>0);assert.ok(ledger.attempts.every(a=>a.manualVerdict==='pass'));
 for(const [p,hash] of Object.entries(baseline.sourceFiles))assert.equal(sha(await readFile(p)),hash);
 const job=plan.cases.find(c=>c.id===id)??await read(file('batch/'+id+'.prepared.json'));
 const raw=await readFile(file('batch/'+id+'.request.json'),'utf8');assert.equal(sha(raw),job.requestSha256);
 const request=JSON.parse(raw);assert.deepEqual({...request,messages:undefined},{...plan.parameters,messages:undefined});
 const settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
 assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
 const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(k=>k.active);assert.equal(keys.length,1);const apiKey=keys[0].value;
 await writeFile(file('live/'+id+'.request.json'),raw,{flag:'wx'});
 const attempt={id,customRequest:ledger.cumulative+1,state:'reserved',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw)};
 ledger.attempts.push(attempt);ledger.cumulative++;ledger.remaining--;await json(file('live/run.json'),ledger);
 const response=await captureSavedReview({rawBody:raw,apiKey,onUpdate:r=>json(file('live/'+id+'.response.json'),{...r,kind:job.purpose}),timeoutMs:180000});
 Object.assign(attempt,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
 if(response.responseText!==undefined){await writeFile(file('live/'+id+'.raw-response.txt'),response.responseText);attempt.rawResponseSha256=sha(response.responseText);attempt.rawUnmodified=attempt.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
 if(response.outcome==='completed'){
  let value;try{value=JSON.parse(response.responseText);}catch{}
  const choice=value?.choices?.[0];attempt.finishReason=choice?.finish_reason;attempt.responseModel=value?.model;attempt.usage=value?.usage;
  if(typeof choice?.message?.content!=='string'||!choice.message.content.trim()||choice.finish_reason!=='stop')attempt.state='protocol-error';
  else await writeFile(file('live/'+id+'.content.txt'),choice.message.content);
 }
 if(attempt.state!=='completed'){ledger.closed=true;ledger.stopReason=attempt.state;}
 await json(file('live/run.json'),ledger);console.log(JSON.stringify({...attempt,remaining:ledger.remaining,closed:ledger.closed}));
}else if(mode==='--apply'){
 const plan=await read(file('batch/prepared.json')),content=await readFile(file('live/'+id+'.content.txt'),'utf8');
 const job=plan.cases.find(c=>c.id===id)??await read(file('batch/'+id+'.prepared.json'));
 const f=fixture(await read(file('batch/'+id+'.seed.json'))),before=f.snapshot();let calls=0,asked=[];
 const savedRequest=await read(file('batch/'+id+'.request.json'));
 f.knowledge.configureDialogue(createDialogueSemanticAdapter({complete:async request=>{calls++;assert.deepEqual(request.messages,savedRequest.messages);return content;}}));
 let result,error;
 try{result=job.parent?await f.knowledge.prepareDialogueTurn({text:job.text},{ask:async q=>{asked.push(q);return null;}}):await f.knowledge.observeDialogue(f.source());}catch(e){error={name:e.name,message:e.message};}
 assert.equal(calls,1);assert.deepEqual(f.snapshot().chat,before.chat);
 const report={id,localProtocolPassed:!error,error,result,asked,state:f.knowledge.read(),context:f.knowledge.context(),semanticAssessment:'pending-manual'};
 if(error){const ledger=await read(file('live/run.json'));ledger.closed=true;ledger.stopReason='local-protocol-failure';await json(file('live/run.json'),ledger);}
 await json(file('live/'+id+'.applied.json'),report);await json(file('live/'+id+'.after.seed.json'),f.snapshot());
 console.log(JSON.stringify({id,localProtocolPassed:!error,error,result,asked:asked.length,knowledge:report.context.actorKnowledge.map(a=>({actorId:a.actorId,facts:a.facts})),revision:f.snapshot().floors[f.getAnchor().messageId].stat_data['901_rules_poc'].revision}));
}else if(mode==='--followups'){
 const plan=await read(file('batch/prepared.json')),ledger=await read(file('live/run.json'));assert.ok(ledger.attempts.some(a=>a.id==='07-ambiguous-hearing'&&a.manualVerdict==='pass'));
 const parent=await read(file('live/07-ambiguous-hearing.applied.json'));assert.ok(parent.result.pending.length);
 for(const followup of plan.followups){
  const seed=await read(file('live/'+followup.parent+'.after.seed.json')),f=fixture(seed);let captured;
  f.knowledge.configureDialogue(createDialogueSemanticAdapter({complete:async request=>{captured=request;throw Error('LOCAL_CAPTURE_ONLY');}}));
  await assert.rejects(f.knowledge.prepareDialogueTurn({text:followup.text}),/LOCAL_CAPTURE_ONLY/);
  const raw=JSON.stringify({...plan.parameters,messages:captured.messages});
  await writeFile(file('batch/'+followup.id+'.request.json'),raw,{flag:'wx'});await json(file('batch/'+followup.id+'.seed.json'),seed,true);
  await json(file('batch/'+followup.id+'.prepared.json'),{...followup,purpose:captured.purpose,requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),parentRawResponseSha256:sha(await readFile(file('live/'+followup.parent+'.raw-response.txt')))},true);
  console.log(JSON.stringify({id:followup.id,bytes:Buffer.byteLength(raw),parent:followup.parent}));
 }
}else if(mode==='--mark'){
 assert.ok(['pass','fail','partial'].includes(verdict));const ledger=await read(file('live/run.json')),attempt=ledger.attempts.at(-1);assert.equal(attempt.id,id);
 attempt.manualVerdict=verdict;attempt.manualAssessment=noteParts.join(' ');
 if(verdict!=='pass'||ledger.remaining===0){ledger.closed=true;ledger.stopReason=verdict==='pass'?'budget-exhausted':'manual-'+verdict;}
 await json(file('live/run.json'),ledger);console.log(JSON.stringify({id,verdict,remaining:ledger.remaining,closed:ledger.closed}));
}else if(mode==='--verify'){
 const baseline=await read(file('baseline.json')),ledger=await read(file('live/run.json'));let full='';
 for(const [p,hash] of Object.entries({...baseline.protectedFiles,...baseline.sourceFiles}))assert.equal(sha(await readFile(p)),hash,p);
 for(const a of ledger.attempts){
  assert.equal(sha(await readFile(file('live/'+a.id+'.request.json'))),a.requestSha256);
  if(a.rawResponseSha256)assert.equal(sha(await readFile(file('live/'+a.id+'.raw-response.txt'))),a.rawResponseSha256);
  if(a.state==='completed')full+=a.id+'\n'+await readFile(file('live/'+a.id+'.content.txt'),'utf8')+'\n人工核对：'+(a.manualAssessment??'未核对')+'\n\n';
 }
 await writeFile(file('complete-outputs.txt'),full);
 const report={attempts:ledger.attempts.length,cumulative:ledger.cumulative,remaining:ledger.remaining,closed:ledger.closed,stopReason:ledger.stopReason,protectedFilesUnchanged:Object.keys(baseline.protectedFiles).length,sourceFilesUnchanged:Object.keys(baseline.sourceFiles).length,retries:0,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false};
 await json(file('verification.json'),report);console.log(JSON.stringify(report));
}else throw Error('Unknown mode');
