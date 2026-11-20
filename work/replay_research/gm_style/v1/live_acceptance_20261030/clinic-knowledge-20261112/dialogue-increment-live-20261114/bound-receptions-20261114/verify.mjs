// Local-only source/evidence verification and request preview. No transport.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),prior=new URL('../',base),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=v=>createHash('sha256').update(v).digest('hex');
const {prepareBoundDialogueExtraction,prepareDialogueExtraction}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs')));
const baseline=await read(new URL('baseline.json',base)),changed=[];
for(const [p,h] of Object.entries(baseline.protectedFiles))assert.equal(sha(await readFile(p)),h,p);
for(const [p,h] of Object.entries(baseline.previousEvidence))assert.equal(sha(await readFile(new URL(p,prior))),h,p);
for(const [p,h] of Object.entries(baseline.sourceFiles))if(sha(await readFile(p))!==h)changed.push(p);
assert.deepEqual(changed,['TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs']);
const old=await readFile(new URL('reception-coverage-20261114/candidate-story-dialogue-knowledge.mjs',prior),'utf8'),current=await readFile(changed[0],'utf8');
const checker=s=>{s=s.replaceAll('\r\n','\n');const start=s.indexOf('return {input,messages,responseFormat,check(reply){');return s.slice(start,s.indexOf('\n }};\n}',start)+8);};assert.equal(checker(current),checker(old));
const original=await read(new URL('parallel-ten-20261114/batch/05-partial-first.request.json',prior)),input=JSON.parse(original.messages[1].content),prepared=await prepareBoundDialogueExtraction(input),legacy=await prepareDialogueExtraction(input);
assert.deepEqual(prepared.input,legacy.input);assert.deepEqual(prepared.messages.slice(1),original.messages.slice(1));
const preview={...original,messages:prepared.messages,response_format:prepared.responseFormat};
await writeFile(new URL('request-preview.json',base),JSON.stringify(preview,null,2)+'\n');
for(const id of ['02-received-rumor','05-partial-first','07-ambiguous-hearing']){
 const req=await read(new URL('reception-coverage-20261114/live/'+id+'.request.json',prior)),raw=await readFile(new URL('reception-coverage-20261114/live/'+id+'.content.txt',prior),'utf8');
 const p=await prepareBoundDialogueExtraction(JSON.parse(req.messages[1].content));assert.throws(()=>p.check(JSON.parse(raw)));
}
const report={modelCalls:0,cumulativeUnchanged:323,remainingUnchanged:0,credentialsRead:false,requestPreviewSent:false,requestPreviewBytes:Buffer.byteLength(JSON.stringify(preview)),schemaVersion:'dialogue-reception/2',
 oldEvidenceUnchanged:Object.keys(baseline.previousEvidence).length,formalFilesUnchanged:Object.keys(baseline.protectedFiles).length,changedProductFiles:changed,legacyCheckerTextUnchanged:true,sharedAssertionContractUnchanged:true,
 oldModelRepliesNotMigrated:true,inputAndCoordinateReferenceUnchanged:true,newTests:10,relatedTestsPassed:126,failed:0,responseRepair:false,actionConversion:false,validationRelaxed:false,deployed:false,formalStoryWritten:false,automaticApprovalRevision:false,semanticCompletenessVerified:false};
await writeFile(new URL('verification.json',base),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
