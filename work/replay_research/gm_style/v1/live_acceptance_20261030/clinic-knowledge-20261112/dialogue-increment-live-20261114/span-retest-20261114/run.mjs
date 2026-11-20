// One authorized extraction retest. Isolated saved seed only; no repair or retry.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.cwd(),base=new URL('./',import.meta.url),parent=new URL('../',base);
const local=p=>new URL(p,base),prior=p=>new URL(p,parent);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const json=(p,v,exclusive=false)=>writeFile(p,JSON.stringify(v,null,2)+'\n',exclusive?{flag:'wx'}:{});
const sha=v=>createHash('sha256').update(v).digest('hex');
const imp=p=>import(pathToFileURL(resolve(root,p)));
const {prepareDialogueExtraction,createDialogueSemanticAdapter}=await imp('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs');
const {createStoryKnowledgeRuntime}=await imp('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs');
const {checkAssertionReply}=await imp('901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js');
const {captureSavedReview}=await imp('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs');
const mode=process.argv[2];
async function allFiles(dir,prefix=''){
 const result=[];
 for(const e of await readdir(dir,{withFileTypes:true})){
  if(!prefix&&e.name==='span-retest-20261114')continue;
  const name=prefix+e.name;
  if(e.isDirectory())result.push(...await allFiles(new URL(e.name+'/',dir),name+'/'));
  else if(e.isFile())result.push(name);
 }
 return result;
}
if(mode==='--prepare'){
 const old=await read(prior('live/01-received-new.request.json')),input=JSON.parse(old.messages[1].content);
 const prepared=await prepareDialogueExtraction(input),fresh=structuredClone(old);fresh.messages=prepared.messages;
 assert.equal(fresh.messages.length,old.messages.length);assert.deepEqual(fresh.messages[1],old.messages[1]);
 const system=fresh.messages[0].content,start=system.indexOf('\n角色值与对应引用成对生成'),end=system.indexOf('\n本次只识别本轮普通对白');
 assert.ok(start>=0&&end>start);assert.equal(system.slice(0,start)+system.slice(end),old.messages[0].content);
 assert.equal(fresh.messages[0].role,old.messages[0].role);
 assert.deepEqual({...fresh,messages:undefined},{...old,messages:undefined});
 const oldLedger=await read(prior('live/run.json'));assert.equal(oldLedger.cumulative,273);assert.equal(oldLedger.closed,true);
 const oldBaseline=await read(prior('baseline.json')),baseline={protectedFiles:{},sourceFiles:{},previousEvidence:{}};
 for(const [path,hash] of Object.entries(oldBaseline.protectedFiles)){baseline.protectedFiles[path]=sha(await readFile(path));assert.equal(baseline.protectedFiles[path],hash);}
 for(const path of Object.keys(oldBaseline.sourceFiles))baseline.sourceFiles[path]=sha(await readFile(path));
 for(const path of await allFiles(parent))baseline.previousEvidence[path]=sha(await readFile(prior(path)));
 const raw=JSON.stringify(fresh),oldRaw=await readFile(prior('live/01-received-new.request.json'));
 await writeFile(local('request.json'),raw,{flag:'wx'});await writeFile(local('added-guidance.txt'),system.slice(start,end),{flag:'wx'});
 await json(local('baseline.json'),baseline,true);
 await json(local('prepared.json'),{authorization:'用户新增一次明确接收首例复测，仅更新引用说明，其余输入/参数不变；失败即停，无重试、补文、放宽引用、部署、正式剧情或自动批准修订。',endpoint:'https://cdn.sta1n.cn/v1/chat/completions',requestBytes:Buffer.byteLength(raw),requestSha256:sha(raw),originalRequestBytes:oldRaw.length,originalRequestSha256:sha(oldRaw),addedGuidanceBytes:Buffer.byteLength(system.slice(start,end)),onlySystemGuidanceChanged:true,parametersUnchanged:true,userInputUnchanged:true,requestTimeoutMs:180000},true);
 await json(local('run.json'),{baseline:273,limit:1,cumulative:273,remaining:1,attempts:[],closed:false,retries:0,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false},true);
 console.log(JSON.stringify(await read(local('prepared.json'))));
}else if(mode==='--send'){
 const p=await read(local('prepared.json')),ledger=await read(local('run.json')),baseline=await read(local('baseline.json'));
 assert.equal(ledger.closed,false);assert.equal(ledger.remaining,1);assert.equal(ledger.attempts.length,0);
 for(const [path,hash] of Object.entries({...baseline.sourceFiles,...baseline.protectedFiles}))assert.equal(sha(await readFile(path)),hash,path);
 const raw=await readFile(local('request.json'),'utf8');assert.equal(sha(raw),p.requestSha256);
 const request=JSON.parse(raw),settings=(await read('D:/github/sillyTavern/data/default-user/settings.json')).oai_settings;
 assert.equal(settings.chat_completion_source,'custom');assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
 const keys=(await read('D:/github/sillyTavern/data/default-user/secrets.json')).api_key_custom.filter(k=>k.active);assert.equal(keys.length,1);const apiKey=keys[0].value;
 const attempt={customRequest:274,state:'reserved',requestSha256:p.requestSha256,requestBytes:p.requestBytes};
 await json(local('attempt.json'),attempt,true);ledger.attempts.push(attempt);ledger.cumulative=274;ledger.remaining=0;ledger.closed=true;ledger.stopReason='single-attempt-reserved';await json(local('run.json'),ledger);
 console.log(JSON.stringify({event:'sending',customRequest:274,bytes:p.requestBytes}));
 const response=await captureSavedReview({rawBody:raw,apiKey,timeoutMs:180000,onUpdate:r=>json(local('response.json'),{...r,kind:'dialogue-reception'})});
 Object.assign(attempt,{state:response.outcome,status:response.status,elapsedMs:response.elapsedMs});
 if(response.responseText!==undefined){await writeFile(local('raw-response.txt'),response.responseText,{flag:'wx'});attempt.rawResponseSha256=sha(response.responseText);attempt.rawUnmodified=attempt.rawResponseSha256===response.responseBodySha256BeforePrivacyRedaction;}
 if(response.outcome==='completed'){
  let body;try{body=JSON.parse(response.responseText);}catch{}
  const choice=body?.choices?.[0];attempt.finishReason=choice?.finish_reason;attempt.responseModel=body?.model;attempt.usage=body?.usage;
  if(typeof choice?.message?.content!=='string'||!choice.message.content.trim()||choice.finish_reason!=='stop')attempt.state='protocol-error';
  else await writeFile(local('content.txt'),choice.message.content,{flag:'wx'});
 }
 ledger.stopReason=attempt.state==='completed'?'single-call-complete-no-further-calls':attempt.state;
 await json(local('attempt.json'),attempt);await json(local('run.json'),ledger);console.log(JSON.stringify(ledger));
}else if(mode==='--apply'){
 const ledger=await read(local('run.json'));assert.equal(ledger.attempts.length,1);assert.equal(ledger.attempts[0].state,'completed');
 const request=await read(local('request.json')),input=JSON.parse(request.messages[1].content),content=await readFile(local('content.txt'),'utf8');
 const seed=await read(prior('batch/01-received-new.seed.json')),before=structuredClone(seed),{chatId,chat,floors}=seed;
 const catalog={id:'isolated.dialogue.live.v1',actors:input.actors,facts:[{id:'harbor.closed',entityId:'harbor',field:'reported_status',value:'码头停航',certainty:'rumor',visibility:'private'}]};
 const getAnchor=()=>({chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0});
 const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(data,{message_id})=>{floors[message_id]=structuredClone(data);}};
 const tavern={chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};
 const knowledge=createStoryKnowledgeRuntime({catalog,mvu,tavern,getAnchor,dialogue:{readMemory:()=>input.memory}});let calls=0,result,error,contract;
 knowledge.configureDialogue(createDialogueSemanticAdapter({complete:async r=>{calls++;assert.deepEqual(r.messages,request.messages);return content;}}));
 try{const reply=JSON.parse(content);contract=checkAssertionReply(reply.assertions,input.assertion);result=await knowledge.observeDialogue({...getAnchor(),text:chat.at(-1).mes});}catch(e){error={name:e.name,message:e.message};}
 assert.deepEqual(chat,before.chat);assert.ok(calls<=1);
 const report={localProtocolPassed:!error,contract,result,error,offlineCompletionCallbacks:calls,context:knowledge.context(),state:knowledge.read(),revision:floors[0].stat_data['901_rules_poc'].revision,semanticAssessment:'pending-manual'};
 await json(local('applied.json'),report,true);await json(local('after.seed.json'),seed,true);
 if(error)ledger.stopReason='local-protocol-failure';else ledger.stopReason='single-call-complete-awaiting-manual-assessment';
 ledger.attempts[0].localProtocolPassed=!error;await json(local('run.json'),ledger);console.log(JSON.stringify(report));
}else if(mode==='--verify'){
 const baseline=await read(local('baseline.json')),ledger=await read(local('run.json')),p=await read(local('prepared.json'));
 for(const [path,hash] of Object.entries({...baseline.protectedFiles,...baseline.sourceFiles}))assert.equal(sha(await readFile(path)),hash,path);
 for(const [path,hash] of Object.entries(baseline.previousEvidence))assert.equal(sha(await readFile(prior(path))),hash,path);
 assert.equal(sha(await readFile(local('request.json'))),p.requestSha256);
 for(const attempt of ledger.attempts)if(attempt.rawResponseSha256)assert.equal(sha(await readFile(local('raw-response.txt'))),attempt.rawResponseSha256);
 const report={attempts:ledger.attempts.length,cumulative:ledger.cumulative,remaining:ledger.remaining,closed:ledger.closed,protectedFilesUnchanged:Object.keys(baseline.protectedFiles).length,sourceFilesUnchanged:Object.keys(baseline.sourceFiles).length,previousEvidenceUnchanged:Object.keys(baseline.previousEvidence).length,retries:0,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false};
 await json(local('verification.json'),report);console.log(JSON.stringify(report));
}else throw Error('Unknown mode');
