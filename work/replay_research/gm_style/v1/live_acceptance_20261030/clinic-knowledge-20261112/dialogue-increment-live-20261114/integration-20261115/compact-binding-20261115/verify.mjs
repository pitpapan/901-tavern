import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const N=new URL('./',import.meta.url),I=new URL('../iteration-200-20261115/',N),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=x=>createHash('sha256').update(x).digest('hex');
const baseline=await read(new URL('baseline.json',N)),before=await read(new URL('ledger-before.json',N)),ledger=await read(new URL('run.json',I));
for(const [url,hash] of Object.entries(baseline.originalEvidence))assert.equal(sha(await readFile(new URL(url))),hash,url);
for(const [path,hash] of Object.entries(baseline.formalProtected))assert.equal(sha(await readFile(path)),hash,path);
const sourceHashes={},main='TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
for(const path of Object.keys(baseline.sourceHashes)){sourceHashes[path]=sha(await readFile(path));if(path!==main)assert.equal(sourceHashes[path],baseline.sourceHashes[path]);}
const prior=await readFile(new URL('story-dialogue-knowledge.mjs.before',N),'utf8'),current=await readFile(main,'utf8'),start='export async function prepareCompactDialogueExtraction';
assert.equal(prior.slice(0,prior.indexOf(start)),current.slice(0,current.indexOf(start)));
const offset=s=>s.indexOf(" const messages=[{role:'system',content:",s.indexOf(start));assert.equal(prior.slice(offset(prior)),current.slice(offset(current)));
assert.deepEqual(ledger.attempts.slice(0,before.attempts.length),before.attempts);
const calls=ledger.attempts.slice(before.attempts.length);assert.equal(calls.length,9);assert.equal(ledger.cumulative,531);assert.equal(ledger.used,197);assert.equal(ledger.remaining,3);
const params=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!['messages','response_format'].includes(k))),plan=await read(new URL('../model-batch/plan.json',N));
let outputs='';
for(const a of calls){
 assert.equal(a.state,'completed');assert.equal(a.status,200);assert.equal(a.finishReason,'stop');assert.equal(a.rawUnmodified,true);assert.ok(a.manualVerdict);
 const req=await readFile(new URL(a.id+'.request.json',I)),raw=await readFile(new URL(a.id+'.raw-response.txt',I)),content=await readFile(new URL(a.id+'.content.txt',I),'utf8');
 assert.equal(sha(req),a.requestSha256);assert.equal(sha(raw),a.rawResponseSha256);assert.equal(JSON.parse(raw).choices[0].message.content,content);assert.deepEqual(params(JSON.parse(req)),plan.modelAndParameters);
 for(const [path,hash] of Object.entries(a.sourceHashes))assert.equal(hash,sourceHashes[path]);
 outputs+='Request '+a.customRequest+' '+a.id+'\n'+a.manualVerdict+': '+a.assessment+'\n'+content+'\n\n';
}
const strip=v=>Array.isArray(v)?v.map(strip):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>k!=='description').map(([k,x])=>[k,strip(x)])):v;
const oldCoverage='每轮明确coverage.status和evidence：recorded有接收记录，uncertain仍有歧义，none确无接收；不能用none省略实际言说。',latestCoverage='每轮明确coverage.status和evidence，状态互斥：uncertain：有unknown接收或非空unresolved，优先于其他状态；recorded：接收记录非空且没有上述歧义；none：接收记录和unresolved均为空。不能用none省略实际言说。';
for(const c of await read(new URL('cases.json',N))){
 const r=await read(new URL(c.id+'.check.json',N));assert.equal(r.structuralPass,true);assert.equal(r.schemaPass,true);assert.equal(r.observation.status,'processed');
 if(c.original){
  const a=await read(new URL(c.id+'.request.json',I)),b=await read(new URL(c.original+'.request.json',I));
  assert.deepEqual(a.messages.slice(1),b.messages.slice(1));assert.deepEqual(params(a),params(b));assert.deepEqual(strip(a.response_format),strip(b.response_format));assert.equal(a.messages[0].content,b.messages[0].content.replace(oldCoverage,latestCoverage));
  assert.ok(a.response_format.json_schema.schema.properties.receptions.items.properties.identity.description);assert.ok(a.response_format.json_schema.schema.properties.receptions.items.properties.evidence.description);
 }
}
const long=await read(new URL('v7.binding.long.check.json',N));assert.equal(long.counts.writes,8);assert.equal(long.checked.receptions.length,6);assert.equal(Object.keys(long.state.events).filter(id=>id.startsWith('received.')).length,6);
const denied=await read(new URL('v7.binding.implicit.check.json',N));assert.equal(denied.checked.assertions.units[0].claims[0].mode,'denied');assert.ok(denied.knowledge.every(a=>a.facts.length===0));assert.equal(denied.counts.writes,2);assert.equal(denied.observation.pending.length,0);
const parent=await read(new URL('v7.binding.near.partial.check.json',N));assert.deepEqual(parent.checked.receptions.map(r=>[r.contentSpan.quote,r.status]),[['渡船今晚停驶','received'],['清晨改在西桥集合','uncertain']]);assert.equal(parent.counts.asked,0);
const known=await read(new URL('v7.binding.known.result.turn.json',N));assert.equal(known.result.status,'ready');assert.deepEqual(known.counts,{writes:0,asked:0});assert.deepEqual(known.state,parent.state);
const dependent=await read(new URL('v7.binding.pending.result.turn.json',N));assert.equal(dependent.result.status,'deferred');assert.deepEqual(dependent.counts,{writes:1,asked:1});assert.equal(dependent.result.questions[0].id,parent.observation.pending[0].id);
const expected=structuredClone(parent.state);Object.values(expected.dialogueBatches)[0].rows.find(r=>r.status==='pending').prompted=true;assert.deepEqual(dependent.state,expected);
assert.match(await readFile(new URL('related-tests.log',N),'utf8'),/tests 243[\s\S]*pass 243[\s\S]*fail 0/);
const report={oldEvidencePreserved:Object.keys(baseline.originalEvidence).length,formalFilesPreserved:Object.keys(baseline.formalProtected).length,oldLedgerPrefixPreserved:true,sourceHashes,onlyCompactSchemaMetadataChanged:true,allSystemInstructionsAndChecksUnchangedThisTurn:true,schemaConstraintsUnchanged:true,olderTwoRequestsInheritPreviousCoverageFix:true,offline:{tests:243,pass:243},live:{calls:9,extractions:7,schemaAndReferencePass:7,semanticPass:5,semanticFail:2,dependencies:2,dependencyPass:2,cumulative:531,totalBudget:200,used:197,remaining:3},realPendingDependencyVerified:true,rawResponsesPreserved:true,noFormalStateOrDeploymentWrites:true,limitations:{long:{structuralPass:true,semanticPass:false,isolatedWrites:8,receivedEvents:6,reason:'Unsupported overheard relations still admitted by structural checks.'},implicit:{structuralPass:true,semanticPass:false,isolatedWrites:2,receivedEvents:0,reason:'Asserted spoken negative content incorrectly marked denied; reception omitted.'}}};
await writeFile(new URL('verification.json',N),JSON.stringify(report,null,2)+'\n');await writeFile(new URL('complete-outputs.txt',N),outputs);
ledger.complete=true;ledger.closed=true;ledger.currentScope='v7 restores existing listener/evidence schema descriptions only;243 offline pass.523-531:7 structural passes,5 semantic passes2 semantic failures plus2 real pending dependency passes.197/200 used,3 retained.No repair/relaxation/deploy/formal or approval/revision.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(report));

