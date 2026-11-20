import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {prepareBoundDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const base=new URL('./',import.meta.url),L=new URL('live-model-20261115/',base),[id,mode='request']=process.argv.slice(2);
const read=async p=>JSON.parse(await readFile(p,'utf8')),setup=await read(new URL('browser-setup.json',base));
const request=await read(new URL('browser-captures/'+id+'.request.json',L));
const {flattenSchema}=await import(pathToFileURL(setup.app+'/src/util.js'));
const input=JSON.parse(request.messages[1].content),p=await prepareBoundDialogueExtraction(input);
assert.deepEqual(request.messages,p.messages);const rf=structuredClone(p.responseFormat);rf.json_schema.schema=flattenSchema(rf.json_schema.schema,'custom');assert.ok(JSON.stringify(rf)===JSON.stringify(request.response_format),'Schema mismatch');
const report={id,exactMessages:true,exactHostSchema:true,source:input.sourceAnchor,characters:input.sourceAnchor.text.length,requestBytes:Buffer.byteLength(JSON.stringify(request))};
if(mode==='reply'){
 const raw=await readFile(new URL(id+'.content.txt',L),'utf8');
 try{const parsed=JSON.parse(raw);report.checked=p.check(parsed);report.localProtocolPassed=true;}catch(e){report.localProtocolPassed=false;report.error={name:e.name,message:e.message};}
}
await writeFile(new URL(id+'.'+mode+'-audit.json',L),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({id,exactMessages:true,exactHostSchema:true,characters:report.characters,requestBytes:report.requestBytes,localProtocolPassed:report.localProtocolPassed,error:report.error,checked:report.checked}));
