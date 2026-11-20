import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {prepareBoundDialogueExtraction,createDialogueSemanticAdapter} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const base=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [mode,id,source]=process.argv.slice(2);
const setup=await read(new URL('browser-setup.json',base));
const {flattenSchema}=await import(pathToFileURL(setup.app+'/src/util.js'));
if(mode==='prepare'){
 const request=await read(new URL(source,base));
 const p=await prepareBoundDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.equal(p.messages[1].content,request.messages[1].content);
 const format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 assert.deepEqual(format,request.response_format);
 request.messages=p.messages;
 await writeFile(new URL(id+'.prepared.json',I),JSON.stringify(request),{flag:'wx'});
 console.log(JSON.stringify({id,bytes:Buffer.byteLength(JSON.stringify(request)),sameInput:true,sameSchema:true}));
}else if(mode==='dependency'){
 const request=await read(new URL(id+'.request.json',I)),raw=await readFile(new URL(id+'.content.txt',I),'utf8');
 const {inputRef,...input}=JSON.parse(request.messages[1].content);
 const adapter=createDialogueSemanticAdapter({complete:async x=>{assert.deepEqual(x.messages,request.messages);return raw;}});
 const report={id,required:await adapter.dependencies(input),inputRef,exactMessages:true};
 await writeFile(new URL(id+'.check.json',I),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}else if(mode==='check'){
 const request=await read(new URL(id+'.request.json',I));
 const p=await prepareBoundDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.deepEqual(request.messages,p.messages);
 const raw=await readFile(new URL(id+'.content.txt',I),'utf8');
 const report={id};try{report.checked=p.check(JSON.parse(raw));report.pass=true;}catch(e){report.pass=false;report.error=e.message;}
 await writeFile(new URL(id+'.check.json',I),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}else throw Error('Unknown mode');
