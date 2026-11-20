// Prepare three independent original-failure retests; no transport or reply edits.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {prepareSelectedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('fragment-selection-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const cases=[];
for(const [old,id] of [['play.006.reception','selection.play006'],['play.009.reception','selection.play009'],['play.014.reception','selection.play014']]){
 const original=await read(new URL(old+'.request.json',I)),p=await prepareSelectedDialogueExtraction(JSON.parse(original.messages[1].content));
 assert.equal(p.messages[1].content,original.messages[1].content);
 const response_format=structuredClone(p.responseFormat);response_format.json_schema.schema=flattenSchema(response_format.json_schema.schema,'custom');
 const request={...original,messages:p.messages,response_format};
 assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k))),Object.fromEntries(Object.entries(original).filter(([k])=>!['messages','response_format'].includes(k))));
 const raw=JSON.stringify(request);await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id,original:old,originalBytes:Buffer.byteLength(JSON.stringify(original)),bytes:Buffer.byteLength(raw),originalInputUnchanged:true,generationParametersUnchanged:true,fragments:JSON.parse(p.messages[2].content).fragments.length});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));
const ledger=await read(new URL('run.json',I));assert.equal(ledger.cumulative,420);assert.equal(ledger.remaining,114);
ledger.complete=false;ledger.closed=false;ledger.activeScope='fragment-selection-20261115: three original failures once each, same200 budget, no reply repair/deployment/formal writes/automatic approval or revision';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(cases));
