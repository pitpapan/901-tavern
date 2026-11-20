import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {prepareSelectedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('fragment-selection-followup-20261115/',E),I=new URL('iteration-200-20261115/',E),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const baseline=await read(new URL('baseline.json',N)),ledger=await read(new URL('run.json',I)),before=await read(new URL('before/run.json',N)),cases=await read(new URL('cases.json',N));
assert.deepEqual(ledger.attempts.slice(0,before.attempts.length),before.attempts);assert.equal(ledger.attempts.length-before.attempts.length,2);assert.equal(ledger.cumulative,425);assert.equal(ledger.remaining,109);
let preserved=0;for(const [p,h] of Object.entries(baseline.hashes))if(p.includes('iteration-200')&&!p.endsWith('run.json')){assert.equal(await sha(resolve(p)),h);preserved++;}
const formal=(await read(new URL('normal-play-20261115/baseline.json',E))).formalProtected;for(const [p,h] of Object.entries(formal))assert.equal(await sha(p),h);
const slice=(s,start,end)=>s.slice(s.indexOf(start),s.indexOf(end,s.indexOf(start)));
const shared=await readFile(resolve('901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js'),'utf8'),sharedBefore=await readFile(new URL('before/assertion-contract.js',N),'utf8');
assert.equal(slice(shared,'function resolveAssertionSelection','function buildAssertionMessages'),slice(sharedBefore,'function resolveAssertionSelection','function buildAssertionMessages'));
const local=await readFile(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'),'utf8'),localBefore=await readFile(new URL('before/story-dialogue-knowledge.mjs',N),'utf8');
assert.equal(slice(local,'export async function prepareSelectedDialogueExtraction','export function createDialogueKnowledge'),slice(localBefore,'export async function prepareSelectedDialogueExtraction','export function createDialogueKnowledge'));
assert.equal(slice(local,'return {input,messages,responseFormat,check(wire)','export function prepareScopedDialogueExtraction'),slice(localBefore,'return {input,messages,responseFormat,check(wire)','export function prepareScopedDialogueExtraction'));
const results=[];let full='两份失败复测原始内容（未修补）\n完整请求/原始HTTP响应：../iteration-200-20261115/selection.parents.*\n\n';
for(const c of cases){
 const old=await read(new URL(c.original+'.request.json',I)),req=await read(new URL(c.id+'.request.json',I)),a=ledger.attempts.find(a=>a.id===c.id),p=await prepareSelectedDialogueExtraction(JSON.parse(old.messages[1].content));
 assert.deepEqual(req.messages,p.messages);assert.equal(req.messages[1].content,old.messages[1].content);
 assert.deepEqual(Object.fromEntries(Object.entries(req).filter(([k])=>k!=='messages')),Object.fromEntries(Object.entries(old).filter(([k])=>k!=='messages')));
 assert.deepEqual(JSON.parse(req.messages[2].content).fragments.map(({containerIds,...f})=>f),JSON.parse(old.messages[2].content).fragments);
 assert.equal(await sha(new URL(c.id+'.request.json',I)),await sha(new URL(c.id+'.prepared.json',N)));assert.equal(await sha(new URL(c.id+'.raw-response.txt',I)),a.rawResponseSha256);assert.ok(a.rawUnmodified);
 for(const path of ['901-trpg-engine/tools/trpg-engine/gm/assertion-contract.js','TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs'])assert.equal(await sha(resolve(path)),a.sourceHashes[path]);
 const check=await read(new URL(c.id+'.check.json',N));assert.equal(check.exactCurrentMessages,true);
 results.push({id:c.id,customRequest:a.customRequest,overallVerdict:a.manualVerdict,structuralPass:check.structuralPass,schemaPass:check.schemaPass??null,error:check.error??null,isolatedMvuWrites:check.mvuWrites,assessment:a.assessment});
 full+=a.customRequest+' '+c.id+'\n'+await readFile(new URL(c.id+'.content.txt',I),'utf8')+'\n\n';
}
assert.deepEqual(results.map(r=>r.structuralPass),[false,true]);assert.deepEqual(results.map(r=>r.overallVerdict),['fail','fail']);assert.deepEqual(results.map(r=>r.isolatedMvuWrites),[0,8]);
const report={newCalls:2,cumulative:425,used:91,remaining:109,offline:{campaign:144,engine:50,total:194,newTests:4},results,priorEvidenceUnchanged:preserved,priorLedgerEntriesUnchanged:true,formalFilesUnchanged:Object.keys(formal).length,schemaAndOriginalInputAndParametersUnchanged:true,fragmentIdsTextsAndRangesUnchanged:true,selectionDecoderUnchanged:true,originalV3CheckerUnchanged:true,newSemanticValidator:false,rawResponseRepair:false,deployed:false,formalStoryWritten:false,automaticApprovalOrRevisionRestored:false};
await writeFile(new URL('verification.json',N),JSON.stringify(report,null,2));await writeFile(new URL('complete-outputs.txt',N),full);
ledger.complete=true;ledger.closed=true;ledger.currentScopeResult='Fragment followup generation-only gap fixes;194 offline pass;424 invalidJSON zero writes,425 fragment selection passes but listener/evidence semantics fail in isolated replay.2 calls used;total91/200 remaining109;no retry or further calls scheduled';await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(report));
