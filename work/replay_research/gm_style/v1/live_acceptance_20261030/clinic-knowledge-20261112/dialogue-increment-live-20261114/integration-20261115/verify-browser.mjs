import {readFile,readdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {prepareBoundDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
import {pathToFileURL} from 'node:url';
const setup=JSON.parse(await readFile(new URL('browser-setup.json',import.meta.url),'utf8'));
const {flattenSchema}=await import(pathToFileURL(setup.app+'/src/util.js'));
const base=new URL('./',import.meta.url),dir=new URL('browser-evidence/',base),results=[];
for(const name of (await readdir(dir)).filter(n=>n.endsWith('.json'))){
 const row=JSON.parse(await readFile(new URL(name,dir),'utf8'));if(!row.requestBody)continue;
 assert.equal(row.synthetic,true);assert.equal(row.upstreamCalls,0);
 const request=row.requestBody;
 if(row.kind==='reception'){
  const input=JSON.parse(request.messages[1].content),p=await prepareBoundDialogueExtraction(input);
  assert.deepEqual(request.messages,p.messages);
  const expected=structuredClone(p.responseFormat);expected.json_schema.schema=flattenSchema(expected.json_schema.schema,'custom');
  assert.ok(JSON.stringify(request.response_format)===JSON.stringify(expected),'host-flattened Schema differs');
  const checked=p.check(JSON.parse(row.content));
  results.push({file:name,kind:row.kind,exactMessages:true,exactHostFlattenedSchema:true,originalCheck:true,characters:input.sourceAnchor.text.length,requestBytes:Buffer.byteLength(JSON.stringify(request)),coverage:checked.coverage.map(c=>c.status)});
 }else if(row.kind==='dependency'){
  const input=JSON.parse(request.messages[1].content),reply=JSON.parse(row.content);
  assert.equal(reply.inputRef,input.inputRef);assert.ok(reply.required.every(id=>input.pending.some(p=>p.id===id)));
  results.push({file:name,kind:row.kind,required:reply.required,requestBytes:Buffer.byteLength(JSON.stringify(request))});
 }else results.push({file:name,kind:row.kind,requestBytes:Buffer.byteLength(JSON.stringify(request))});
}
await writeFile(new URL('browser-request-audit.json',base),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results));
