// Isolated acceptance runner. No production binding, semantic approval or rewriting.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
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
const routedFollowups=async plan=>{try{return (await read(file('followup-routing.json'))).followups;}catch(e){if(e.code==='ENOENT')return plan.followups;throw e;}};
const catalog={id:'isolated.dialogue.live.v1',actors:{bright:'布莱特',huang:'黄泉',player:'御临风'},facts:[
 {id:'well.closed',entityId:'well',field:'reported_status',value:'北街水井暂时停用',certainty:'rumor',visibility:'private'}]};
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
 const chatId='isolated.dialogue.parallel.'+id,{actors}=createOpeningFixture();
 const f=fixture({chatId,chat:[{mes:known?'隔离事件：黄泉收到一则未经核实的消息：“北街水井暂时停用”。':text,is_user:false,swipe_id:0}],
 floors:{0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId,actors,operations:{}}}}}});
 if(known){await f.knowledge.receive({id:'isolated.prior',status:'received',authority:'host-confirmed',sourceAnchor:f.source(),recipientIds:['huang'],propositionRefs:['well.closed'],channel:'message',belief:'rumor'});f.advance(text);}
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
 const previous=new URL('parallel-ten-20261114/',prior),oldPlan=await read(new URL('batch/prepared.json',previous)),oldLedger=await read(new URL('schema-single-target-20261114/live/run.json',prior));
 assert.equal(oldLedger.cumulative,310);assert.equal(oldLedger.remaining,13);
 const ids=['01-received-new','02-received-rumor','05-partial-first','06-partial-second','07-ambiguous-hearing'];
 const plan={authorization:'继续诊断五例失败并改善输出格式遵从；沿用前轮30次授权剩余13次（304—310含一次格式探针均已计入），不重置额度。先原五例各一次，后续根据真实结果诊断，不自动修补/放宽校验/部署/正式剧情/自动批准修订。',baseline:310,limit:13,endpoint:oldPlan.endpoint,parameters:oldPlan.parameters,cases:[],followups:[]};
 for(const id of ids){
  const job=oldPlan.cases.find(c=>c.id===id),seed=await read(new URL('batch/'+id+'.seed.json',previous)),oldRequest=await read(new URL('batch/'+id+'.request.json',previous)),captured=await captureReception(seed);
  assert.deepEqual(captured.messages,oldRequest.messages);assert.equal(captured.responseFormat.json_schema.strict,true);
  const body={...oldPlan.parameters,messages:captured.messages,response_format:captured.responseFormat},raw=JSON.stringify(body);
  assert.deepEqual({...body,response_format:undefined},{...oldRequest,response_format:undefined});
  await json(file('batch/'+id+'.seed.json'),seed,true);await writeFile(file('batch/'+id+'.request.json'),raw,{flag:'wx'});
  plan.cases.push({...job,purpose:captured.purpose,requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),change:'response_format only; original messages, coordinates, parameters and seed identical'});
 }
 const baseline=await read(file('baseline.json'));baseline.candidateSourceFiles={};
 for(const p of Object.keys(baseline.sourceFiles))baseline.candidateSourceFiles[p]=sha(await readFile(p));
 baseline.changedProductFiles=Object.keys(baseline.sourceFiles).filter(p=>baseline.sourceFiles[p]!==baseline.candidateSourceFiles[p]);
 assert.equal(baseline.changedProductFiles.length,2);
 await json(file('baseline.json'),baseline);await json(file('batch/prepared.json'),plan,true);
 await json(file('live/run.json'),{authorization:plan.authorization,originalAuthorization:30,alreadyUsed:17,baseline:310,limit:13,cumulative:310,remaining:13,attempts:[],closed:false,retries:0,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false},true);
 console.log(JSON.stringify({cases:plan.cases.map(c=>({id:c.id,bytes:c.requestBytes})),changedProducts:baseline.changedProductFiles}));
}else if(mode==='--send'){
 const plan=await read(file('batch/prepared.json')),ledger=await read(file('live/run.json')),order=[...plan.cases,...await routedFollowups(plan)].map(c=>c.id),baseline=await read(file('baseline.json'));
 assert.equal(ledger.closed,false);assert.equal(order[ledger.attempts.length],id);assert.ok(ledger.remaining>0);assert.ok(ledger.attempts.every(a=>a.manualVerdict==='pass'||a.diagnosedContinuation));
 for(const [p,hash] of Object.entries({...baseline.candidateSourceFiles,...baseline.protectedFiles}))assert.equal(sha(await readFile(p)),hash);
 const job=plan.cases.find(c=>c.id===id)??await read(file('batch/'+id+'.prepared.json'));
 const raw=await readFile(file('batch/'+id+'.request.json'),'utf8');assert.equal(sha(raw),job.requestSha256);
 const request=JSON.parse(raw);assert.deepEqual({...request,messages:undefined,response_format:undefined},{...plan.parameters,messages:undefined,response_format:undefined});
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
 f.knowledge.configureDialogue(createDialogueSemanticAdapter({complete:async request=>{calls++;assert.deepEqual(request.messages,savedRequest.messages);assert.deepEqual(request.responseFormat,savedRequest.response_format);return content;}}));
 let result,error;
 try{result=job.parent?await f.knowledge.prepareDialogueTurn({text:job.text},{ask:async q=>{asked.push(q);return null;}}):await f.knowledge.observeDialogue(f.source());}catch(e){error={name:e.name,message:e.message};}
 assert.equal(calls,1);assert.deepEqual(f.snapshot().chat,before.chat);
 const report={id,localProtocolPassed:!error,error,result,asked,state:f.knowledge.read(),context:f.knowledge.context(),semanticAssessment:'pending-manual'};
 if(error){const ledger=await read(file('live/run.json'));ledger.closed=true;ledger.stopReason='local-protocol-failure';await json(file('live/run.json'),ledger);}
 await json(file('live/'+id+'.applied.json'),report);await json(file('live/'+id+'.after.seed.json'),f.snapshot());
 console.log(JSON.stringify({id,localProtocolPassed:!error,error,result,asked:asked.length,knowledge:report.context.actorKnowledge.map(a=>({actorId:a.actorId,facts:a.facts})),revision:f.snapshot().floors[f.getAnchor().messageId].stat_data['901_rules_poc'].revision}));
}else if(mode==='--followups'||mode==='--followups-from08'){
 const plan=await read(file('batch/prepared.json')),ledger=await read(file('live/run.json'));
 const parentId=mode==='--followups-from08'?'08-ambiguous-listener':'07-ambiguous-hearing';
 assert.ok(ledger.attempts.some(a=>a.id===parentId&&a.manualVerdict==='pass'));
 const parent=await read(file('live/'+parentId+'.applied.json'));assert.ok(parent.result.pending.length);
 let followups=plan.followups;
 if(mode==='--followups-from08'){
  assert.equal(ledger.attempts.length,8);
  assert.equal(ledger.attempts.find(a=>a.id==='07-ambiguous-hearing').manualVerdict,'fail');
  followups=[
   {id:'09-unrelated-from08',parent:parentId,text:'我和御临风谈谈午饭的口味，再整理一下衣领。',expected:'required=[]; ready; no question or knowledge grant'},
   {id:'10-dependent-from08',parent:parentId,text:'让御临风依据黄泉刚才说的交货地点，决定把货物运到哪里。',expected:'require real parent pending ID; deferred; one question; no invented answer or knowledge grant'}
  ];
  await json(file('followup-routing.json'),{reason:'Original07 rejected; original09/10 blocked. Separate new branch from actual validated08, frozen before followup calls. No original result replaced.',blockedOriginal:plan.followups,followups,parentCustomRequest:301,parentRawResponseSha256:sha(await readFile(file('live/'+parentId+'.raw-response.txt')))},true);
 }
 for(const followup of followups){
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
}else if(mode==='--continue-independent'){
 const plan=await read(file('batch/prepared.json')),ledger=await read(file('live/run.json')),last=ledger.attempts.at(-1),next=[...plan.cases,...plan.followups][ledger.attempts.length];
 assert.equal(ledger.closed,true);assert.ok(['fail','partial'].includes(last.manualVerdict));assert.ok(ledger.remaining>0&&next);assert.ok(!next.parent||ledger.attempts.some(a=>a.id===next.parent&&a.manualVerdict==='pass'));assert.ok(id?.trim());
 last.diagnosedContinuation={reason:id,nextCase:next.id,originalFailureRetained:true};ledger.closed=false;ledger.stopReason='diagnosed-failure-continue-next-independent-frozen-case';await json(file('live/run.json'),ledger);console.log(JSON.stringify({next:next.id,remaining:ledger.remaining,priorFailure:last.id}));
}else if(mode==='--verify'){
 const baseline=await read(file('baseline.json')),ledger=await read(file('live/run.json'));let full='';
 for(const [p,hash] of Object.entries({...baseline.protectedFiles,...baseline.candidateSourceFiles}))assert.equal(sha(await readFile(p)),hash,p);
 for(const a of ledger.attempts){
  assert.equal(sha(await readFile(file('live/'+a.id+'.request.json'))),a.requestSha256);
  if(a.rawResponseSha256)assert.equal(sha(await readFile(file('live/'+a.id+'.raw-response.txt'))),a.rawResponseSha256);
  if(a.state==='completed')full+=a.id+'\n'+await readFile(file('live/'+a.id+'.content.txt'),'utf8')+'\n人工核对：'+(a.manualAssessment??'未核对')+'\n\n';
 }
 await writeFile(file('complete-outputs.txt'),full);
 for(const [p,hash] of Object.entries(baseline.previousEvidence))assert.equal(sha(await readFile(new URL(p,prior))),hash,p);
 const report={previousEvidenceUnchanged:Object.keys(baseline.previousEvidence).length,attempts:ledger.attempts.length,cumulative:ledger.cumulative,remaining:ledger.remaining,closed:ledger.closed,stopReason:ledger.stopReason,protectedFilesUnchanged:Object.keys(baseline.protectedFiles).length,candidateSourceFilesVerified:Object.keys(baseline.candidateSourceFiles).length,changedProductFiles:baseline.changedProductFiles,retries:0,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false};
 await json(file('verification.json'),report);console.log(JSON.stringify(report));
}else throw Error('Unknown mode');
