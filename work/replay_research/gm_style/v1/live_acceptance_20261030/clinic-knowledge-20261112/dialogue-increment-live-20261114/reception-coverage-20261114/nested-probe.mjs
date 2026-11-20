// One full-wrapper copy probe, separate from semantic acceptance. No retries.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {captureSavedReview}=await import(pathToFileURL(resolve('901-trpg-engine/tools/trpg-engine/samples/gm-host/saved-review-diagnostic.mjs')));
const {prepareDialogueExtraction}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs')));
const base=new URL('./',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,base),'utf8')),save=(p,v)=>writeFile(new URL(p,base),JSON.stringify(v,null,2)+'\n'),sha=s=>createHash('sha256').update(s).digest('hex');
if(process.argv[2]==='prepare'){
 const request=await read('batch/02-received-rumor.request.json'),input=JSON.parse(request.messages[1].content),p=await prepareDialogueExtraction(input);
 const text=input.sourceAnchor.text,span=q=>({documentId:'current',start:text.indexOf(q),end:text.indexOf(q)+q.length,quote:q});
 const expected={contextRef:input.contextRef,assertions:{schemaVersion:'gm-assertion-output/1',inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[{id:'speech',type:'utterance',args:{speaker:'黄泉',content:'北街水井暂时停用。'},argumentSpans:{speaker:span('黄泉'),content:span('北街水井暂时停用。')},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:span(text)}],unresolved:[]}]},receptions:[{id:'r',claimId:'speech',speakerId:'huang',recipientIds:['player'],recipientSpans:[span('御临风')],evidence:span(text),status:'received',propositionRef:'well.closed',reason:''}]};
 p.check(expected);assert.deepEqual(p.responseFormat,request.response_format);
 request.messages=[{role:'system',content:'这是完整嵌套JSON格式复制探针，不是剧情抽取。用户提供的对象符合本请求Schema。请原样返回该JSON对象，不改类型、字段或值，不补说明。'}, {role:'user',content:JSON.stringify(expected)}];
 await writeFile(new URL('nested-probe.request.json',base),JSON.stringify(request),{flag:'wx'});await save('nested-probe.expected.json',expected);
 console.log(JSON.stringify({fullWrapperSchemaUnchanged:true,originalValidatorPassed:true,bytes:Buffer.byteLength(JSON.stringify(request))}));
}else if(process.argv[2]==='send'){
 const ledger=await read('live/run.json');assert.equal(ledger.cumulative,320);assert.equal(ledger.remaining,3);assert.equal(ledger.closed,true);
 const raw=await readFile(new URL('nested-probe.request.json',base),'utf8'),request=JSON.parse(raw),settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
 assert.equal(settings.custom_url,'https://cdn.sta1n.cn/v1');assert.equal(settings.custom_model,request.model);
 const keys=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/secrets.json','utf8')).api_key_custom.filter(k=>k.active);assert.equal(keys.length,1);
 const record={customRequest:321,state:'reserved',requestSha256:sha(raw),cumulative:321,remaining:2};
 await writeFile(new URL('nested-probe.run.json',base),JSON.stringify(record),{flag:'wx'});
 ledger.cumulative=321;ledger.remaining=2;ledger.externalFormatProbes=[{customRequest:321,record:'nested-probe.run.json',counted:true}];await save('live/run.json',ledger);
 const response=await captureSavedReview({rawBody:raw,apiKey:keys[0].value,onUpdate:r=>save('nested-probe.response.json',r),timeoutMs:180000});
 if(response.responseText!==undefined)await writeFile(new URL('nested-probe.raw-response.txt',base),response.responseText);
 Object.assign(record,{state:response.outcome,status:response.status,closed:true,rawResponseSha256:response.responseText?sha(response.responseText):null});
 if(response.outcome==='completed'){
  const envelope=JSON.parse(response.responseText),content=envelope.choices?.[0]?.message?.content;record.responseModel=envelope.model;record.finishReason=envelope.choices?.[0]?.finish_reason;
  if(typeof content==='string'){await writeFile(new URL('nested-probe.content.txt',base),content);try{assert.deepEqual(JSON.parse(content),await read('nested-probe.expected.json'));record.exactCopyPassed=true;}catch{record.exactCopyPassed=false;}}
 }
 await save('nested-probe.run.json',record);console.log(JSON.stringify(record));
}else throw Error('prepare or send required');
