import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareSelectedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('fragment-selection-followup-20261115/',E),I=new URL('iteration-200-20261115/',E),read=async p=>JSON.parse(await readFile(p,'utf8'));
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const cases=[];
for(const suffix of ['play006','play009']){
 const old='selection.'+suffix,id='selection.parents.'+suffix,original=await read(new URL(old+'.request.json',I)),p=await prepareSelectedDialogueExtraction(JSON.parse(original.messages[1].content));
 const format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 assert.deepEqual(format,original.response_format);assert.equal(p.messages[1].content,original.messages[1].content);
 const oldRef=JSON.parse(original.messages[2].content),ref=JSON.parse(p.messages[2].content);assert.deepEqual(ref.fragments.map(({containerIds,...f})=>f),oldRef.fragments);
 const request={...original,messages:p.messages};assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>k!=='messages')),Object.fromEntries(Object.entries(original).filter(([k])=>k!=='messages')));
 const raw=JSON.stringify(request);await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id,original:old,bytes:Buffer.byteLength(raw),schemaInputParametersFragmentIdsAndTextsUnchanged:true});
}
// Diagnose the valid JSON failure without repairing it or feeding a corrected copy to runtime.
const r=await read(new URL('selection.play009.request.json',I)),p=await prepareSelectedDialogueExtraction(JSON.parse(r.messages[1].content)),fragments=JSON.parse(p.messages[2].content).fragments;
const priorAudit=await read(new URL('fragment-selection-20261115/selection.play009.selection-audit.json',E));
const evidence=priorAudit.bad.map(b=>{const f=fragments.find(f=>f.id===b.selection.fragmentId);return {...b,availableContainers:f.containerIds.filter(id=>fragments.find(p=>p.id===id).text.includes(b.selection.quote))};});
assert.ok(evidence.every(e=>e.availableContainers.length));
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));await writeFile(new URL('diagnosis.json',N),JSON.stringify({rawJSONFailure:'421 includes non-JSON text; no parsing repair. Schema was present, so upstream noncompliance remains.',fragmentFailure:evidence,localScope:'Pure JSON serialization at existing envelope and deterministic container projection; no validator changes or guaranteed causal attribution.'},null,2));
const ledger=await read(new URL('run.json',I));assert.equal(ledger.cumulative,423);assert.equal(ledger.remaining,111);ledger.complete=false;ledger.closed=false;ledger.activeScope='fragment-selection-followup-20261115: diagnose421/422, bounded contract/interface fix, two original failures once each using remaining111; no repair/deployment/formal writes/approval/revision';await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(cases));
