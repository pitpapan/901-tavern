import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareScopedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('scoped-reception-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),put=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const strip=v=>Array.isArray(v)?v.map(strip):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>k!=='description').map(([k,x])=>[k,strip(x)])):v;
const cases=await read(new URL('reception-range-20261115/cases.json',E));
const frozen=[];
for(const prior of cases){
 const id=prior.id.replace('range.','scoped.'),original=await read(new URL(prior.id+'.request.json',I)),p=await prepareScopedDialogueExtraction(JSON.parse(original.messages[1].content));
 assert.deepEqual(p.messages.slice(1),original.messages.slice(1));
 const format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 // Apart from version and required receipt scope, constraints are identical.
 const oldEquivalent=structuredClone(format);oldEquivalent.json_schema.name=original.response_format.json_schema.name;oldEquivalent.json_schema.schema.properties.schemaVersion.enum=['dialogue-reception/2'];
 const receipts=oldEquivalent.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items;
 delete receipts.properties.contentSpan;receipts.required=receipts.required.filter(k=>k!=='contentSpan');
 assert.deepEqual(strip(oldEquivalent),strip(original.response_format));
 const r=format.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items;
 assert.ok(r.required.includes('contentSpan'));assert.ok(r.properties.contentSpan.description.includes('父claim'));
 const request={...original,messages:p.messages,response_format:format};await put(new URL(id+'.prepared.json',N),request);
 frozen.push({...prior,id,prior:prior.id,expected:prior.expected+' v3按每条reception.contentSpan显式记录范围，无需复制utterance；缺少或非法范围原样拒绝。'});
}
await put(new URL('cases.json',N),frozen);await put(new URL('request-verification.json',N),{count:frozen.length,allOriginalBusinessInputsAndCoordinatesUnchanged:true,parametersUnchanged:true,schemaChangesOnlyVersionAndMandatoryReceiptSpan:true,fieldDescriptionDelivered:true});
console.log(JSON.stringify({prepared:frozen.length,inputCoordinatesParametersUnchanged:true,mandatoryContentSpanDelivered:true}));
