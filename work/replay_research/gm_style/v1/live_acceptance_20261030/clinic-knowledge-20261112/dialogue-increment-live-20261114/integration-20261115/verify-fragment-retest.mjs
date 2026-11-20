import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {prepareScopedDialogueExtraction,prepareSelectedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('fragment-selection-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const baseline=await read(new URL('baseline.json',N)),ledger=await read(new URL('run.json',I)),before=await read(new URL('before/run.json',N)),cases=await read(new URL('cases.json',N));
assert.deepEqual(ledger.attempts.slice(0,before.attempts.length),before.attempts);
assert.equal(ledger.attempts.length-before.attempts.length,3);assert.equal(ledger.cumulative,423);assert.equal(ledger.remaining,111);
let oldEvidence=0;
for(const [p,digest] of Object.entries(baseline.hashes))if(p.includes('iteration-200')&&!p.endsWith('run.json')){assert.equal(await sha(resolve(p)),digest);oldEvidence++;}
const protectedFiles=(await read(new URL('normal-play-20261115/baseline.json',E))).formalProtected;
for(const [p,digest] of Object.entries(protectedFiles))assert.equal(await sha(p),digest,p);
const results=[];let full='三份原失败复测全文：模型原始内容，不修补；完整HTTP响应与请求保存在../iteration-200-20261115/。\n\n';
for(const c of cases){
 const old=await read(new URL(c.original+'.request.json',I)),request=await read(new URL(c.id+'.request.json',I)),attempt=ledger.attempts.find(a=>a.id===c.id);
 assert.equal(request.messages[1].content,old.messages[1].content);
 const params=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!['messages','response_format'].includes(k)));
 assert.deepEqual(params(request),params(old));
 assert.equal(await sha(new URL(c.id+'.request.json',I)),await sha(new URL(c.id+'.prepared.json',N)));
 assert.equal(await sha(new URL(c.id+'.raw-response.txt',I)),attempt.rawResponseSha256);assert.ok(attempt.rawUnmodified);
 const historical=await prepareScopedDialogueExtraction(JSON.parse(old.messages[1].content));assert.deepEqual(historical.messages,old.messages);
 const prepared=await prepareSelectedDialogueExtraction(JSON.parse(old.messages[1].content));assert.deepEqual(prepared.messages,request.messages);
 const original=await readFile(new URL(c.original+'.content.txt',I),'utf8');assert.throws(()=>historical.check(JSON.parse(original)));assert.throws(()=>prepared.check(JSON.parse(original)));
 const check=await read(new URL(c.id+'.check.json',N));assert.equal(check.exactCurrentMessages,true);
 if(!check.structuralPass)assert.equal(check.mvuWrites,0);
 results.push({id:c.id,original:c.original,customRequest:attempt.customRequest,verdict:attempt.manualVerdict,schemaPass:check.schemaPass??false,strictPass:check.structuralPass,mvuWrites:check.mvuWrites,error:check.error??null,originalInputAndParametersUnchanged:true,rawUnmodified:true});
 full+='原例 '+c.original+' → '+attempt.customRequest+' '+c.id+'\n'+await readFile(new URL(c.id+'.content.txt',I),'utf8')+'\n\n';
}
assert.deepEqual(results.map(r=>r.verdict),['fail','fail','pass']);
const sources=['901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js','TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'];
const sourceHashes=Object.fromEntries(await Promise.all(sources.map(async p=>[p,await sha(resolve(p))])));
for(const a of ledger.attempts.slice(-3))for(const p of sources)assert.equal(a.sourceHashes[p],sourceHashes[p]);
const report={results,newCalls:3,cumulative:423,used:89,remaining:111,oldEvidenceFilesUnchanged:oldEvidence,allPriorLedgerAttemptsUnchanged:true,formalProtectedFilesUnchanged:Object.keys(protectedFiles).length,sourceHashes,offlineTests:{campaign:142,engine:48,total:190},newBehaviorTests:8,oldV3MessagesUnchanged:true,oldFailedRepliesStillRejected:true,programCoordinatesOnlyAfterValidSelection:true,rawRepair:false,validationRelaxed:false,deployed:false,formalStoryWritten:false,automaticApprovalOrRevisionRestored:false,candidatePackage:'405 historical package retained; current v4 source verified through existing temporary package-closure test, no installation or historical ZIP overwrite'};
await writeFile(new URL('verification.json',N),JSON.stringify(report,null,2));await writeFile(new URL('complete-outputs.txt',N),full);
ledger.complete=true;ledger.closed=true;ledger.currentScopeResult='v4 deterministic fragment decoding implemented; offline190 pass; three original failures retested421-423 once:2 failures preserved,1 pass; used89/200 remaining111, no further calls scheduled';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(report));
