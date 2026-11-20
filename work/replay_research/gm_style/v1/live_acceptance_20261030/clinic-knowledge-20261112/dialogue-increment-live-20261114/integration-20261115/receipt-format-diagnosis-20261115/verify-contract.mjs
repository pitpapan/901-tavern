import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareRelatedDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('../',import.meta.url),N=new URL('receipt-format-diagnosis-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const report=[];
for(const c of await read(new URL('cases.json',N))){
 const req=await read(new URL(c.id+'.request.json',I)),p=await prepareRelatedDialogueExtraction(JSON.parse(req.messages[1].content)),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 assert.deepEqual(req.messages,p.messages);assert.deepEqual(req.response_format,format);
 report.push({id:c.id,actualMessagesEqualCurrentContract:true,actualSchemaEqualCurrentContract:true});
}
await writeFile(new URL('contract-verification.json',N),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
