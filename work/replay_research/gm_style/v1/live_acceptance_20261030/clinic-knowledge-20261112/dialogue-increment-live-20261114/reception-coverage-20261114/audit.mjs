// Offline evaluation; original output is never normalized or completed.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const {prepareDialogueExtraction}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs')));
const {checkAssertionReply}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js')));
const base=new URL('./',import.meta.url),prior=new URL('../',base),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=v=>createHash('sha256').update(v).digest('hex');
const baseline=await read(new URL('baseline.json',base)),ledger=await read(new URL('live/run.json',base)),plan=await read(new URL('batch/prepared.json',base));
for(const [p,h] of Object.entries({...baseline.protectedFiles,...baseline.sourceFiles}))assert.equal(sha(await readFile(p)),h,p);
for(const [p,h] of Object.entries(baseline.previousEvidence))assert.equal(sha(await readFile(new URL(p,prior))),h,p);
const withdrawal=await read(new URL('withdrawn-guidance.json',base));assert.equal(sha(await readFile(new URL('candidate-story-dialogue-knowledge.mjs',base))),withdrawal.candidateSourceSha256);
const rows=[],schemaCases=[];let full='',guidance;
for(const a of ledger.attempts){
 const requestRaw=await readFile(new URL('live/'+a.id+'.request.json',base),'utf8'),raw=await readFile(new URL('live/'+a.id+'.raw-response.txt',base),'utf8'),content=await readFile(new URL('live/'+a.id+'.content.txt',base),'utf8');
 assert.equal(sha(requestRaw),a.requestSha256);assert.equal(sha(raw),a.rawResponseSha256);assert.equal(JSON.parse(raw).choices[0].message.content,content);
 const request=JSON.parse(requestRaw),input=JSON.parse(request.messages[1].content),current=await prepareDialogueExtraction(input),output=JSON.parse(content),applied=await read(new URL('live/'+a.id+'.applied.json',base));
 assert.deepEqual({...request,messages:undefined,response_format:undefined},{...plan.parameters,messages:undefined,response_format:undefined});
 assert.deepEqual(request.messages.slice(1),current.messages.slice(1));assert.ok(request.messages[0].content.startsWith(current.messages[0].content));
 const suffix=request.messages[0].content.slice(current.messages[0].content.length);guidance??=suffix;assert.equal(suffix,guidance);assert.ok(suffix.includes('本轮接收事实必须有可引用的utterance投影'));assert.deepEqual(request.response_format,current.responseFormat);
 const check=checkAssertionReply(output.assertions,input.assertion);delete check.value;
 let protocol=true;try{current.check(output);}catch{protocol=false;}assert.equal(protocol,applied.localProtocolPassed);
 const row={id:a.id,customRequest:a.customRequest,status:a.status,model:a.responseModel,verdict:a.manualVerdict,assessment:a.manualAssessment,assertionCheck:check,originalProtocolPassed:protocol,knowledgeCounts:applied.context.actorKnowledge.map(k=>({actor:k.actorId,count:k.facts.length})),pending:applied.result?.pending?.length??null,spanCount:0,invalidSpans:[],receptions:output.receptions.map(r=>({status:r.status,claimId:r.claimId,claimType:output.assertions.units.flatMap(u=>u.claims).find(c=>c.id===r.claimId)?.type,recipients:r.recipientIds}))};
 const scan=x=>{if(!x||typeof x!=='object')return;if(Object.hasOwn(x,'documentId')&&Object.hasOwn(x,'quote')){row.spanCount++;const doc=input.assertion.documents.find(d=>d.id===x.documentId);if(!doc||!Number.isInteger(x.start)||!Number.isInteger(x.end)||x.start<0||x.end<=x.start||doc.text.slice(x.start,x.end)!==x.quote)row.invalidSpans.push(x);}for(const v of Object.values(x))scan(v);};scan(output);
 schemaCases.push({id:a.customRequest,schema:request.response_format.json_schema.schema,value:output});rows.push(row);
 full+='custom'+a.customRequest+' '+a.id+'\n'+content+'\n核对：'+a.manualAssessment+'\n\n';
}
const schemaResult=spawnSync('python',['-c','import sys,json,jsonschema\nprint(json.dumps([{ "id":c["id"], "valid":jsonschema.Draft202012Validator(c["schema"]).is_valid(c["value"])} for c in json.loads(sys.stdin.buffer.read().decode("utf-8"))]))'],{input:JSON.stringify(schemaCases),encoding:'utf8'});assert.equal(schemaResult.status,0,schemaResult.stderr);for(const s of JSON.parse(schemaResult.stdout))rows.find(r=>r.customRequest===s.id).schemaValid=s.valid;
const probe=await read(new URL('nested-probe.run.json',base)),probeRequest=await read(new URL('nested-probe.request.json',base));assert.equal(sha(await readFile(new URL('nested-probe.request.json',base))),probe.requestSha256);assert.equal(sha(await readFile(new URL('nested-probe.raw-response.txt',base))),probe.rawResponseSha256);
assert.deepEqual(probeRequest.response_format,(await read(new URL('batch/02-received-rumor.request.json',base))).response_format);
const probeContent=await readFile(new URL('nested-probe.content.txt',base),'utf8');assert.equal(probeContent,JSON.parse(await readFile(new URL('nested-probe.raw-response.txt',base),'utf8')).choices[0].message.content);assert.deepEqual(JSON.parse(probeContent),await read(new URL('nested-probe.expected.json',base)));
full+='custom321 full-wrapper copy probe (not semantic acceptance)\n'+probeContent+'\n';
assert.equal(ledger.cumulative,323);assert.equal(ledger.remaining,0);assert.equal(ledger.attempts.length+ledger.externalFormatProbes.length,8);
const report={actualRequests:8,sceneReplies:rows.length,formatProbes:1,sceneTargetPasses:rows.filter(r=>r.verdict==='pass').length,sceneFailures:rows.filter(r=>r.verdict==='fail').length,cumulative:323,remaining:0,allRawRequestsAndResponsesVerified:true,onlySystemAppendChanged:true,baseSchemaAndInputsUnchanged:true,trialGuidanceWithdrawn:true,productSourcesRestored:Object.keys(baseline.sourceFiles).length,protectedFilesUnchanged:Object.keys(baseline.protectedFiles).length,previousEvidenceUnchanged:Object.keys(baseline.previousEvidence).length,notCalled:['08-ambiguous-listener'],automaticRetry:false,responseRepair:false,validationRelaxed:false,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false,probe,rows};
await writeFile(new URL('verification.json',base),JSON.stringify(report,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',base),full);
console.log(JSON.stringify({...report,probe:undefined,rows:rows.map(r=>({id:r.id,request:r.customRequest,schema:r.schemaValid,protocol:r.originalProtocolPassed,badSpans:r.invalidSpans.length,verdict:r.verdict}))}));
