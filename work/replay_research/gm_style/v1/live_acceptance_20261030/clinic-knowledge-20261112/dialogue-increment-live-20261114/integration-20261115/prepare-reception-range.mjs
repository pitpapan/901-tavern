// Offline frozen controls. Network and budget remain in the existing runner.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {prepareBoundDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('reception-range-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),put=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const originalRaw=await readFile(new URL('scope.partial.request.json',I),'utf8'),original=JSON.parse(originalRaw),input=JSON.parse(original.messages[1].content);
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const cases=[
 {id:'range.original',expected:'原385请求字节不变。player完整接收；bright只收到前半，后半uncertain，分别绑定实际原文范围。若再次整句received+uncertain应原样拒绝且零写入，拒绝不算模型通过。'},
 {id:'range.back',text:'黄泉对御临风说：“西门今晚关闭，明早从石桥走。”布莱特没听见前半句，只听清了“明早从石桥走”。',expected:'player完整；bright前半明确not_received、后半received，不能把不同状态绑整句或丢弃实际言说。'},
 {id:'range.full',text:'黄泉对御临风和布莱特说：“西门今晚关闭，明早从石桥走。”两人都听清了整句话。',expected:'两人都完整收到，不应强迫拆分或制造待核；同范围同状态可共用回执。'},
 {id:'range.none',text:'黄泉对御临风说：“西门今晚关闭，明早从石桥走。”御临风听清了整句话。布莱特离得太远，一句也没听见。',expected:'player完整received，bright完整not_received；不同人物在同范围状态不同合法，不授予bright。'},
 {id:'range.listeners',text:'黄泉对御临风和布莱特说：“西门今晚关闭，明早从石桥走。”御临风听清了前半句，没听见后半句；布莱特没听见前半句，听清了后半句。',expected:'同一言说按内容分片及逐人状态处理：player只前半、bright只后半，彼此不同状态不冲突。'},
 {id:'range.repeat',text:'黄泉对布莱特说：“西门今晚关闭。”布莱特听清了。黄泉又对布莱特说了一遍：“西门今晚关闭。”这一次布莱特没听见。',expected:'两次相同文字在不同坐标，首句received后句not_received，不能按字符串相同误拒绝或合并发生次数。'},
];
for(const c of cases){
 const options=c.text?{sourceAnchor:{...input.sourceAnchor,chatId:'range.offline.'+c.id,messageId:1,text:c.text},history:[{messageId:0,role:'user',text:'御临风、黄泉和布莱特正在街边交谈。'}],actors:input.actors,facts:input.facts,memory:input.memory}:input;
 const p=await prepareBoundDialogueExtraction(options),format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const request={...original,messages:p.messages,response_format:format};
 if(!c.text){assert.deepEqual(request,original);await writeFile(new URL(c.id+'.prepared.json',N),originalRaw,{flag:'wx'});}
 else await put(new URL(c.id+'.prepared.json',N),request);
}
await put(new URL('cases.json',N),cases);
await put(new URL('request-verification.json',N),{originalRequestByteIdentical:true,promptUnchanged:true,schemaUnchanged:true,inputCoordinatesParametersUnchanged:true,caseCount:cases.length});
console.log(JSON.stringify({frozen:cases.length,originalRequestByteIdentical:true,noPromptOrSchemaChanges:true}));
