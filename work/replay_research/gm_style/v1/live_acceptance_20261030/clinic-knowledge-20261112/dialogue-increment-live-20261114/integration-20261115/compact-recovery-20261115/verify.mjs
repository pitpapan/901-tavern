// Offline only; no model or formal-state writes.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const N=new URL('./',import.meta.url),I=new URL('../iteration-200-20261115/',N);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=x=>createHash('sha256').update(x).digest('hex');
const baseline=await read(new URL('baseline.json',N)),before=await read(new URL('ledger-before.json',N)),ledger=await read(new URL('run.json',I)),preserved={};
for(const key of ['originalEvidence','formalProtected']){
 for(const [path,hash] of Object.entries(baseline[key]))assert.equal(sha(await readFile(path)),hash,path);
 preserved[key]=Object.keys(baseline[key]).length;
}
const sourceHashes={};
for(const path of Object.keys(baseline.sourceHashes))sourceHashes[path]=sha(await readFile(path));
const priorCode=await readFile(new URL('story-dialogue-knowledge.mjs.before',N),'utf8'),currentCode=await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs','utf8');
assert.equal(priorCode.slice(priorCode.indexOf('export async function prepareDialogueExtraction'),priorCode.indexOf('export function createDialogueKnowledge')).trim(),currentCode.slice(currentCode.indexOf('export async function prepareDialogueExtraction'),currentCode.indexOf('// Explicit v7:')).trim());
for(const path of ['901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js','TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs'])assert.equal(sourceHashes[path],baseline.sourceHashes[path]);
assert.deepEqual(ledger.attempts.slice(0,before.attempts.length),before.attempts);
const attempts=ledger.attempts.slice(before.attempts.length);
assert.equal(attempts.length,12);assert.equal(ledger.used,176);assert.equal(ledger.remaining,24);assert.equal(ledger.cumulative,510);
const parameters=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!['messages','response_format'].includes(k))),plan=await read(new URL('../model-batch/plan.json',N));
let outputs='';
for(const a of attempts){
 assert.ok(a.manualVerdict);assert.equal(a.state,'completed');assert.equal(a.status,200);assert.equal(a.finishReason,'stop');assert.equal(a.rawUnmodified,true);
 const request=await readFile(new URL(a.id+'.request.json',I)),raw=await readFile(new URL(a.id+'.raw-response.txt',I)),content=await readFile(new URL(a.id+'.content.txt',I),'utf8');
 assert.equal(sha(request),a.requestSha256);assert.equal(request.length,a.requestBytes);assert.equal(sha(raw),a.rawResponseSha256);assert.equal(JSON.parse(raw).choices[0].message.content,content);
 assert.deepEqual(parameters(JSON.parse(request)),plan.modelAndParameters);
 for(const [path,hash] of Object.entries(a.sourceHashes))assert.equal(hash,sourceHashes[path]);
 outputs+='Request '+a.customRequest+': '+a.id+'\n'+a.manualVerdict+': '+a.assessment+'\n'+content+'\n\n';
}
for(const c of await read(new URL('cases.json',N))){
 const a=await read(new URL(c.id+'.request.json',I)),b=await read(new URL(c.original+'.request.json',I));
 assert.deepEqual(a.messages.slice(1),b.messages.slice(1));assert.deepEqual(parameters(a),parameters(b));
}
for(const name of ['uncertain','npc_reply','long','obstacle']){
 const r=await read(new URL('v7.accept.'+name+'.check.json',N)),batch=Object.values(r.state.dialogueBatches)[0];
 assert.equal(r.structuralPass,false);assert.equal(r.observation.status,'unprocessed');assert.equal(Object.keys(r.state.events).length,0);assert.ok(r.knowledge.every(a=>a.facts.length===0));assert.deepEqual(r.counts,{writes:1,asked:0});
 assert.equal(batch.status,'failed');assert.equal(batch.rows.length,1);assert.equal(batch.rows[0].kind,'unprocessed');assert.equal(batch.attempts[0].rawReply,await readFile(new URL('v7.accept.'+name+'.content.txt',I),'utf8'));
}
for(const [result,parent] of [['v7.failure.unrelated.result','v7.accept.uncertain'],['v7.pending.unrelated.result','v7.accept.identity_unknown']]){
 const r=await read(new URL(result+'.turn.json',N));assert.equal(r.result.status,'ready');assert.deepEqual(r.counts,{writes:0,asked:0});
 assert.deepEqual(await read(new URL(result+'.after.seed.json',N)),await read(new URL(parent+'.after.seed.json',N)));
}
const recovered=await read(new URL('v7.failure.after_recovery_dependency.turn.json',N)),batch=Object.values(recovered.state.dialogueBatches)[0];
assert.equal(recovered.result.status,'unavailable');assert.deepEqual(recovered.result.questions,[]);assert.deepEqual(recovered.counts,{writes:2,asked:0});assert.equal(batch.recoveryAttempted,true);assert.equal(batch.attempts.length,2);assert.ok(recovered.knowledge.every(a=>a.facts.length===0));
assert.equal(batch.attempts[0].rawReply,await readFile(new URL('v7.accept.uncertain.content.txt',I),'utf8'));assert.equal(batch.attempts[1].rawReply,await readFile(new URL('v7.failure.recover.content.txt',I),'utf8'));
const oldRequest=await read(new URL('v7.accept.uncertain.request.json',I)),recovery=await read(new URL('v7.failure.recover.request.json',I));
assert.deepEqual(recovery.messages[0],oldRequest.messages[0]);assert.deepEqual(JSON.parse(recovery.messages[1].content),JSON.parse(oldRequest.messages[1].content));assert.deepEqual(recovery.messages[2],oldRequest.messages[2]);assert.equal(recovery.messages.length,4);assert.deepEqual(recovery.response_format,oldRequest.response_format);
const dependent=await read(new URL('v7.pending.dependent.result.turn.json',N)),pending=await read(new URL('v7.accept.identity_unknown.check.json',N));
assert.equal(dependent.result.status,'deferred');assert.equal(dependent.result.questions.length,1);assert.deepEqual(dependent.counts,{writes:1,asked:1});assert.equal(dependent.result.questions[0].id,pending.observation.pending[0].id);
const expected=structuredClone(pending.state);Object.values(expected.dialogueBatches)[0].rows[0].prompted=true;assert.deepEqual(dependent.state,expected);
const partial=await read(new URL('v7.accept.partial.check.json',N));assert.equal(partial.structuralPass,true);
assert.deepEqual(partial.checked.receptions.map(r=>({to:r.recipientIds,text:r.contentSpan.quote,status:r.status})),[{to:['bright'],text:'山路已经封闭了',status:'received'},{to:['bright'],text:'明早在渡口会合',status:'not_received'}]);
assert.equal(partial.observation.pending.length,0);assert.equal(partial.knowledge.find(a=>a.actorId==='bright').facts.length,1);
const log=await readFile(new URL('related-tests.log',N),'utf8');assert.match(log,/tests 235/);assert.match(log,/pass 235/);assert.match(log,/fail 0/);
const report={preserved,sourceHashes,oldLedgerPrefixUnchanged:true,offline:{tests:235,pass:235,fail:0},live:{calls:12,extractions:8,extractionPass:3,extractionFail:5,dependencyCalls:4,dependencyPass:4,cumulative:510,totalBudget:200,used:176,remaining:24},actualFailureIsolationChecked:true,realPendingDependencyChecked:true,originalInputAndParametersUnchanged:true,completeRequestsAndRawResponsesPreserved:true,noDeploymentOrFormalWrites:true,limits:['Structural pass is not semantic completeness.','Successful recovery and partial-plus-unknown range are offline-only in this batch; actual503 recovery failed.','Current provider still produces missing fields and wrong selections.','No production UI or deployment acceptance.']};
await writeFile(new URL('verification.json',N),JSON.stringify(report,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',N),outputs);
ledger.complete=true;ledger.closed=true;ledger.currentScope='Compact v7 finite acceptance complete:499-510,12 calls;8 extractions3 pass5 fail,4 dependency controls pass. Failure isolation verified; semantic reliability not accepted.24 calls retained, no automatic retry.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(report));
