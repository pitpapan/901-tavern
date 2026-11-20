// Offline evidence for the disclosure-choice candidate; never sends requests.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),out=new URL('communication-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=v=>createHash('sha256').update(v).digest('hex');
const prepared=await read(new URL('prepared-requests.json',out));
const originals=await read(new URL('prepared-requests.json',base));
const manifest=await read(new URL('package-manifest.json',out));
for(const item of manifest)assert.equal(hash(await readFile(item.destination)),item.sha256);
const {createStoryKnowledgeRuntime}=await import(new URL('package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs',out));
const {CLINIC_KNOWLEDGE_CATALOG:catalog}=await import(new URL('package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs',out));
const results=[];
for(const p of prepared.probes){
 const raw=await readFile(new URL(p.requestFile,base));assert.equal(hash(raw),p.requestSha256);assert.equal(raw.length,p.requestBytes);
 const body=JSON.parse(raw),original=originals.probes.find(j=>j.id===p.originalBrowserProbe);
 const beforeRaw=await readFile(new URL(original.requestFile,base)),before=JSON.parse(beforeRaw);assert.equal(hash(beforeRaw),p.originalRequestSha256);
 assert.deepEqual({...body,messages:[]},{...before,messages:[]});
 const allowed=[body.messages.length-3,body.messages.length-1];if(p.id==='08-confidential-asked')allowed.push(body.messages.length-4);
 assert.equal(body.messages.length,before.messages.length);
 for(let i=0;i<body.messages.length;i++)if(!allowed.includes(i))assert.deepEqual(body.messages[i],before.messages[i]);
 const saved=(await readFile(new URL(p.sourceSeed,out),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s)),chat=saved.slice(1);
 const state=chat.at(-1).variables[chat.at(-1).swipe_id??0],chatId=state.stat_data['901_rules_poc'].chatId;
 const runtime=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>state},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0})});
 assert.deepEqual(runtime.context(),p.context);
 const message=body.messages.at(-1).content;assert.ok(message.includes(JSON.stringify(p.context)));assert.equal(message.split('知情不等于必须说出').length,2);
 const counts=p.context.actorKnowledge.map(a=>a.facts.length);
 assert.deepEqual(counts,p.id==='07-unknown-asked'?[0,0,0]:[0,1,0]);
 const notes=p.context.actorKnowledge.flatMap(a=>a.facts.flatMap(f=>f.sources.filter(s=>s.disclosure)));
 assert.equal(notes.length,p.id==='08-confidential-asked'?1:0);
 results.push({id:p.id,requestBytes:raw.length,requestSha256:hash(raw),reopenedPackagedContextMatches:true,knowledgeCounts:counts,explicitNotes:notes.length});
}
const environment=await read(new URL('browser-environment.json',base));
for(const [file,sha] of Object.entries(environment.protected))assert.equal(hash(await readFile(file)),sha,file);
const ledger=await read(new URL('live-20261113/run.json',base));
const log=await readFile(new URL('offline-regression.log',out),'utf8'),tests=Number(log.match(/ℹ tests (\d+)/)?.[1]),failures=Number(log.match(/ℹ fail (\d+)/)?.[1]);
assert.equal(tests,135);assert.equal(failures,0);
const report={offline:true,tests,failures,packagedModules:manifest.length,realProtectedFilesUnchanged:true,derivedFromBrowserCaptures:true,newBrowserCapture:false,cumulativeModelCalls:ledger.cumulative,remainingCalls:ledger.remaining,results};
if(ledger.attempts.some(a=>a.customRequest>244)){
 const live=new URL('live-20261113/',base),complete=[];report.liveResults=[];
 for(const attempt of ledger.attempts.filter(a=>a.customRequest>244)){
  const p=prepared.probes.find(p=>p.id===attempt.id);assert.ok(p);
  assert.equal(hash(await readFile(new URL(p.id+'.request.json',live))),p.requestSha256);
  const capture=await read(new URL(p.id+'.response.json',live)),raw=await readFile(new URL(p.id+'.raw-response.txt',live));
  assert.equal(hash(raw),capture.responseBodySha256BeforePrivacyRedaction);assert.equal(raw.toString('utf8'),capture.responseText);
  const body=JSON.parse(raw),content=await readFile(new URL(p.id+'.content.txt',live),'utf8');
  assert.equal(body.choices[0].message.content,content);assert.equal(body.choices[0].finish_reason,'stop');assert.equal(capture.status,200);
  report.liveResults.push({id:p.id,customRequest:attempt.customRequest,status:200,finishReason:'stop',requestMatchesFrozen:true,rawResponseSha256:hash(raw),rawResponsePreservedWithoutRedaction:true,contentMatchesRawResponse:true});
  complete.push(p.id+'\n\n'+content);
 }
 await writeFile(new URL('complete-outputs.txt',out),complete.join('\n\n--------------------\n\n')+'\n');
}
await writeFile(new URL('verification.json',out),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
