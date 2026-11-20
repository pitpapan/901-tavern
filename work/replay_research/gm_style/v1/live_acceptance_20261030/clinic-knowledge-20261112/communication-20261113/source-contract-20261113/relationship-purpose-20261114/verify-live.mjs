// Integrity and state checks only. Manual semantic findings are retained in the ledger.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION} from './package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as oldCatalog} from './package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('./',import.meta.url),batch=new URL('batch/',base),live=new URL('live/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const plan=await read(new URL('prepared.json',batch)),run=await read(new URL('run.json',live)),baseline=await read(new URL('baseline.json',base)),local=await read(new URL('local-verification.json',base));
assert.equal(run.closed,true);assert.equal(run.baseline,266);assert.equal(run.cumulative,272);assert.equal(run.remaining,0);assert.equal(run.attempts.length,6);assert.equal(run.retries,0);assert.equal(run.classificationCalls,0);
const order=[...plan.cases.map(c=>c.id),...plan.followups.map(c=>c.id)];assert.deepEqual(run.attempts.map(a=>a.id),order);
const results=[],transcript=[];
for(const [i,id] of order.entries()){
 const job=plan.cases.find(c=>c.id===id)??await read(new URL(id+'.prepared.json',batch)),attempt=run.attempts[i];
 assert.equal(attempt.state,'completed');assert.equal(attempt.status,200);assert.equal(attempt.customRequest,267+i);assert.ok(attempt.manualVerdict);
 const raw=await readFile(new URL(id+'.request.json',live)),request=JSON.parse(raw);
 assert.deepEqual(raw,await readFile(new URL(job.request.file,batch)));assert.equal(raw.length,job.request.bytes);assert.equal(sha(raw),job.request.sha256);assert.equal(sha(raw),attempt.requestSha256);
 assert.deepEqual({...request,messages:undefined},{...plan.parameters,messages:undefined});
 const flat=request.messages.map(m=>m.content).join('\n');assert.equal(flat.split(STORY_COMMUNICATION_INSTRUCTION).length-1,1);
 for(const n of oldCatalog.rejectedNarration)assert.ok(!flat.includes(n.annotation??n.projectedFragment));
 assert.ok(!flat.includes('ISOLATED-REJECTED-10'));
 const rows=(await readFile(new URL(job.seed,batch),'utf8')).trim().split(/\r?\n/).map(JSON.parse),chat=rows.slice(1),variables=chat.at(-1).variables[0],chatId=variables.stat_data['901_rules_poc'].chatId;
 const catalog=await read(new URL((job.sourceCatalog??id+'.catalog.json'),batch));
 const k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 assert.deepEqual(k.context(),job.context);assert.deepEqual(k.context().actorKnowledge.map(a=>a.facts.length),[1,2,1]);
 assert.deepEqual(JSON.parse(request.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]),job.context);
 assert.deepEqual(k.projectMessages(request.messages),request.messages);
 if(job.parent){
  const parentRequest=await readFile(new URL(job.parent+'.request.json',live)),parentRaw=await readFile(new URL(job.parent+'.raw-response.txt',live)),parentContent=await readFile(new URL(job.parent+'.content.txt',live),'utf8');
  assert.equal(sha(parentRequest),job.parentRequestSha256);assert.equal(sha(parentRaw),job.parentRawResponseSha256);assert.equal(sha(parentContent),job.parentContentSha256);
  assert.equal(JSON.parse(parentRaw).choices[0].message.content,parentContent);
  assert.equal(rows.at(-2).mes,parentContent);assert.equal(request.messages.at(-4).content,parentContent);
  const previous=JSON.parse(parentRequest);assert.deepEqual(request.messages.slice(0,previous.messages.length-2),previous.messages.slice(0,-2));
  assert.deepEqual(variables,rows.at(-2).variables[0]);
 }else assert.ok(!request.messages.some(m=>m.role==='assistant'));
 const responseRaw=await readFile(new URL(id+'.raw-response.txt',live)),capture=await read(new URL(id+'.response.json',live)),response=JSON.parse(responseRaw),content=await readFile(new URL(id+'.content.txt',live),'utf8');
 assert.equal(capture.bodyComplete,true);assert.equal(capture.status,200);assert.equal(responseRaw.toString('utf8'),capture.responseText);
 assert.equal(responseRaw.length,capture.responseBytes);assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);assert.equal(sha(responseRaw),attempt.rawResponseSha256);
 assert.equal(response.choices[0].finish_reason,'stop');assert.equal(response.choices[0].message.content,content);
 const before=k.read();chat.push({is_user:false,mes:content,swipe_id:0,variables:[structuredClone(variables)]});assert.deepEqual(k.read(),before);assert.deepEqual(k.context(),job.context);
 results.push({id,customRequest:attempt.customRequest,status:200,finishReason:'stop',requestBytes:raw.length,requestSha256:sha(raw),rawResponseBytes:responseRaw.length,rawResponseSha256:sha(responseRaw),rawResponseUnmodified:true,responseModel:response.model,parent:job.parent??null,knowledgeCounts:[1,2,1],newKnowledgeReceipts:0,manualVerdict:attempt.manualVerdict});
 transcript.push(`${id} / custom${attempt.customRequest}\n玩家输入：\n${job.input}\n\n完整模型回复：\n${content}\n\n人工核对：\n${attempt.manualAssessment}`);
}
for(const [path,hash] of Object.entries(baseline.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
for(const [path,hash] of Object.entries(local.sourceFiles))assert.equal(sha(await readFile('TRPG outputs/'+path)),hash,path);
assert.equal(sha(await readFile(new URL(local.archive.file,base))),local.archive.sha256);
const report={status:'six-authorized-narrations-integrity-verified',modelCalls:6,completeResponses:6,cumulativeRequestAttempts:272,remaining:0,retries:0,classificationModelCalls:0,
 firstTurns:4,naturalFollowups:2,priorClinicChainExcluded:true,newKnowledgeReceipts:0,formalProtectedFilesUnchanged:Object.keys(baseline.protectedFiles).length,
 productAndCandidateUnchanged:true,regressionSuitesRerun:false,priorLocalTests:79,deployed:false,formalStoryWritten:false,automaticRoutesResumed:false,
 semanticScope:'Manual bounded judgments in run.json, not an automatic semantic score; do not combine with the old correction chain or claim overall literary quality passed.',
 modelLabelNote:'Request label unchanged: [抗截断]gemini-3.8-flash. All six upstream responses self-identify as gemini-3.8-flash-n; earlier clinic responses used gemini-3.8-flash. Cross-run routing/version equivalence is not established.',results};
await writeFile(new URL('verification.json',live),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('complete-outputs.txt',live),transcript.join('\n\n────────────────\n\n')+'\n');
console.log(JSON.stringify(report));
