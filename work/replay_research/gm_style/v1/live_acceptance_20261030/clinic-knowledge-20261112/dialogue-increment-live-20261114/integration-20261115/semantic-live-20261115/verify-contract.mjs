import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareSemanticDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('../',import.meta.url),N=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',E),read=async p=>JSON.parse(await readFile(p,'utf8'));
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const rows=[];
for(const c of await read(new URL('cases.json',N))){
 const req=await read(new URL(c.id+'.request.json',I)),old=await read(new URL(c.original+'.request.json',I)),p=await prepareSemanticDialogueExtraction(JSON.parse(req.messages[1].content)),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 assert.deepEqual(req.messages,p.messages);assert.deepEqual(req.response_format,format);assert.deepEqual(req.messages.slice(1),old.messages.slice(1));
 rows.push({id:c.id,explicitV6:true,actualMessagesAndSchemaMatchCurrentCode:true,inputHistoryMemoryAndFragmentsUnchanged:true});
}
await writeFile(new URL('contract-verification.json',N),JSON.stringify(rows,null,2));console.log(JSON.stringify({verified:rows.length}));
