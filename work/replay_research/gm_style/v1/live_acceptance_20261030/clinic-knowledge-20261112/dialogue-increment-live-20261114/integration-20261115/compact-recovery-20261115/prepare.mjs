import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {prepareCompactDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('../',import.meta.url),N=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const cases=[];
for(const old of await read(new URL('semantic-live-20261115/cases.json',E))){
 const original=await read(new URL(old.id+'.request.json',I)),input=JSON.parse(original.messages[1].content),p=await prepareCompactDialogueExtraction(input),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 assert.deepEqual(p.messages.slice(1),original.messages.slice(1));
 const id=old.id.replace('v6.accept.','v7.accept.'),request={...original,messages:p.messages,response_format:format},raw=JSON.stringify(request);
 assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k))),Object.fromEntries(Object.entries(original).filter(([k])=>!['messages','response_format'].includes(k))));
 await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id,original:old.id,expected:old.expected,bytes:Buffer.byteLength(raw),oldBytes:Buffer.byteLength(JSON.stringify(original)),requestSha256:sha(raw),originalInputAndParametersUnchanged:true});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2),{flag:'wx'});
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,36);assert.equal(ledger.cumulative,498);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
ledger.complete=false;ledger.closed=false;ledger.currentScope='User approved compact v7 and failure-isolation validation within remaining36; seven frozen original inputs, then actual pending/unprocessed dependent controls as available. Offline235 passed first. No identical retries/repair/relaxation/deployment/formal story/auto approval or revision.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(cases));
