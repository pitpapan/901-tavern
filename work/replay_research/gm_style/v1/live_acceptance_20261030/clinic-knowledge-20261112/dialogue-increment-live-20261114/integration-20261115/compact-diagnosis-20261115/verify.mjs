import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const N=new URL('./',import.meta.url),I=new URL('../iteration-200-20261115/',N),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=x=>createHash('sha256').update(x).digest('hex');
const baseline=await read(new URL('baseline.json',N)),before=await read(new URL('ledger-before.json',N)),ledger=await read(new URL('run.json',I));
for(const [url,hash] of Object.entries(baseline.originalEvidence))assert.equal(sha(await readFile(new URL(url))),hash,url);
for(const [path,hash] of Object.entries(baseline.formalProtected))assert.equal(sha(await readFile(path)),hash,path);
const sources={};for(const path of Object.keys(baseline.sourceHashes))sources[path]=sha(await readFile(path));
const changed='TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
for(const path of Object.keys(sources).filter(p=>p!==changed))assert.equal(sources[path],baseline.sourceHashes[path]);
const oldCoverage='每轮明确coverage.status和evidence：recorded有接收记录，uncertain仍有歧义，none确无接收；不能用none省略实际言说。';
const newCoverage='每轮明确coverage.status和evidence，状态互斥：uncertain：有unknown接收或非空unresolved，优先于其他状态；recorded：接收记录非空且没有上述歧义；none：接收记录和unresolved均为空。不能用none省略实际言说。';
assert.equal((await readFile(new URL('story-dialogue-knowledge.mjs.before',N),'utf8')).replace(oldCoverage,newCoverage),await readFile(changed,'utf8'));
assert.deepEqual(ledger.attempts.slice(0,before.attempts.length),before.attempts);
const calls=ledger.attempts.slice(before.attempts.length);assert.equal(calls.length,12);assert.equal(ledger.cumulative,522);assert.equal(ledger.used,188);assert.equal(ledger.remaining,12);
const params=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!['messages','response_format'].includes(k))),plan=await read(new URL('../model-batch/plan.json',N));
let full='',passed=0,failed=0;
for(const a of calls){
 assert.equal(a.state,'completed');assert.equal(a.status,200);assert.equal(a.finishReason,'stop');assert.equal(a.rawUnmodified,true);assert.ok(a.manualVerdict);
 const req=await readFile(new URL(a.id+'.request.json',I)),raw=await readFile(new URL(a.id+'.raw-response.txt',I)),content=await readFile(new URL(a.id+'.content.txt',I),'utf8'),request=JSON.parse(req);
 assert.equal(sha(req),a.requestSha256);assert.equal(sha(raw),a.rawResponseSha256);assert.equal(JSON.parse(raw).choices[0].message.content,content);assert.deepEqual(params(request),plan.modelAndParameters);
 for(const [path,hash] of Object.entries(a.sourceHashes))assert.equal(hash,a.customRequest<=516?baseline.sourceHashes[path]:sources[path]);
 full+='Request '+a.customRequest+' '+a.id+'\n'+a.manualVerdict+': '+a.assessment+'\n'+content+'\n\n';
 if(a.manualVerdict==='fail')failed++;else passed++;
 if(a.id==='v7.coverage.recovery.followup')continue;
 const check=await read(new URL(a.id+'.check.json',N));assert.equal(check.schemaPass,true);
 if(a.manualVerdict==='fail'){
  assert.equal(check.structuralPass,false);assert.equal(check.observation.status,'unprocessed');assert.ok(check.knowledge.every(a=>!a.facts.length));assert.equal(Object.keys(check.state.events).length,0);
  const b=Object.values(check.state.dialogueBatches)[0];assert.equal(b.attempts[0].rawReply,content);assert.equal(b.rows[0].kind,'unprocessed');
 }else assert.equal(check.structuralPass,true);
}
assert.equal(passed,5);assert.equal(failed,7);
for(const c of (await read(new URL('cases.json',N))).filter(c=>c.kind==='exact-failed-reproduction')){
 const a=await readFile(new URL(c.id+'.request.json',I)),b=await readFile(new URL(c.original+'.request.json',I));assert.ok(a.equals(b));
}
for(const c of await read(new URL('coverage-cases.json',N))){
 const request=await read(new URL(c.id+'.request.json',I)),original=await read(new URL(c.sourceRequest));original.messages[0].content=original.messages[0].content.replace(oldCoverage,newCoverage);assert.deepEqual(request,original);
}
const r=await read(new URL('v7.coverage.recovery.result.turn.json',N));assert.equal(r.result.status,'deferred');assert.deepEqual(r.counts,{writes:5,asked:1});assert.equal(r.result.questions.length,1);
const batch=Object.values(r.state.dialogueBatches)[0];assert.equal(batch.attempts.length,2);assert.equal(batch.recoveryAttempted,true);assert.equal(batch.attempts[0].rawReply,await readFile(new URL('v7.accept.uncertain.content.txt',I),'utf8'));assert.equal(batch.attempts[1].rawReply,await readFile(new URL('v7.coverage.recovery.content.txt',I),'utf8'));assert.equal(r.knowledge.find(a=>a.actorId==='bright').facts[0].content.text,'山路已经封闭了');
const p=await read(new URL('v7.coverage.partial.check.json',N));assert.deepEqual(p.checked.receptions.map(r=>[r.contentSpan.quote,r.status]),[['石桥今晚停用','received'],['明早在北门碰面','uncertain']]);assert.equal(p.observation.pending.length,1);assert.equal(p.counts.asked,0);assert.equal(p.knowledge.find(a=>a.actorId==='bright').facts.length,1);
assert.match(await readFile(new URL('related-tests.log',N),'utf8'),/tests 240[\s\S]*pass 240[\s\S]*fail 0/);
const report={oldEvidencePreserved:Object.keys(baseline.originalEvidence).length,formalFilesPreserved:Object.keys(baseline.formalProtected).length,oldLedgerPrefixPreserved:true,sourceHashes:sources,onlyCoverageDefinitionChanged:true,schemaAndValidatorsUnchanged:true,originalFiveRequestsByteIdentical:true,changedRequestsOnlyCoverageDefinition:true,offline:{tests:240,pass:240},live:{calls:12,extractions:11,extractionPass:4,extractionFail:7,dependency:1,dependencyPass:1,afterFixExtractions:5,afterFixPass:3,afterFixFail:2,cumulative:522,totalBudget:200,used:188,remaining:12},realFailedSeedRecoveryToSemanticPendingVerified:true,rawResponsesPreserved:true,noFormalStateOrDeploymentWrites:true,limits:['No reliable fix for implicit reply identity selection.','Long-form semantic binding remains unaccepted.','Two successful coverage retests do not establish stable generation or isolate causality.','Old failed outputs still rejected; no salvage.']};
await writeFile(new URL('verification.json',N),JSON.stringify(report,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',N),full);
ledger.complete=true;ledger.closed=true;ledger.currentScope='Five failures diagnosed: no original local loss. Coverage definition overlap evidenced by512/516; only replace mutual-exclusion definition,240 offline pass.511-522 twelve calls,11 extractions4 pass7 fail plus1 real recovery dependency pass.Implicit/long binding unresolved.12 calls retained; no blind repeats.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(report));

