// One explicit format capability probe; no story extraction or retry.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const base=new URL('./',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,base),'utf8')),save=(p,v)=>writeFile(new URL(p,base),JSON.stringify(v,null,2)+'\n');
const sha=s=>createHash('sha256').update(s).digest('hex');
if(process.argv[2]==='prepare'){
 const original=await read('batch/01-received-new.request.json'),defs=original.response_format.json_schema.schema.$defs;
 const span={documentId:'current',start:0,end:1,quote:'甲'};
 const expected={claim:{id:'probe',type:'utterance',args:{speaker:'甲',content:'甲'},argumentSpans:{speaker:span,content:span},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:span}};
 const schema={type:'object',properties:{claim:{$ref:'#/$defs/assertionClaim'}},required:['claim'],additionalProperties:false,$defs:defs};
 const messages=[{role:'system',content:'这是JSON格式能力探针，不处理剧情。逐字返回用户提供的JSON对象，不改类型、不改字段。它符合提供的JSON Schema。'}, {role:'user',content:JSON.stringify(expected)}];
 const request={...original,messages,response_format:{type:'json_schema',json_schema:{name:'assertion_union_probe',strict:true,schema}}};
 await writeFile(new URL('probe.request.json',base),JSON.stringify(request),{flag:'wx'});await save('probe.expected.json',expected);
 console.log(JSON.stringify({bytes:Buffer.byteLength(JSON.stringify(request)),purpose:'must select later utterance branch; explicit copy probe, not semantic acceptance'}));
}else if(process.argv[2]==='send'){
 const ledger=await read('live/run.json');assert.equal(ledger.cumulative,307);assert.equal(ledger.remaining,16);assert.equal(ledger.closed,true);
 const raw=await readFile(new URL('probe.request.json',base),'utf8'),request=JSON.parse(raw);
 const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
 assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
 const keys=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/secrets.json','utf8')).api_key_custom.filter(k=>k.active);assert.equal(keys.length,1);
 await writeFile(new URL('probe.run.json',base),JSON.stringify({baseline:307,limit:16,cumulative:308,remaining:15,state:'reserved',requestSha256:sha(raw)}),{flag:'wx'});
 const response=await captureSavedReview({rawBody:raw,apiKey:keys[0].value,onUpdate:r=>save('probe.response.json',r),timeoutMs:180000});
 if(response.responseText!==undefined)await writeFile(new URL('probe.raw-response.txt',base),response.responseText);
 const report={baseline:307,limit:16,cumulative:308,remaining:15,state:response.outcome,status:response.status,requestSha256:sha(raw),rawResponseSha256:response.responseText?sha(response.responseText):null,closed:true};
 if(response.outcome==='completed'){
  const envelope=JSON.parse(response.responseText),content=envelope.choices?.[0]?.message?.content;report.responseModel=envelope.model;report.finishReason=envelope.choices?.[0]?.finish_reason;
  if(typeof content==='string'){await writeFile(new URL('probe.content.txt',base),content);try{assert.deepEqual(JSON.parse(content),await read('probe.expected.json'));report.exactCopyPassed=true;}catch{report.exactCopyPassed=false;}}
 }
 await save('probe.run.json',report);console.log(JSON.stringify(report));
}else throw Error('prepare or send required');
