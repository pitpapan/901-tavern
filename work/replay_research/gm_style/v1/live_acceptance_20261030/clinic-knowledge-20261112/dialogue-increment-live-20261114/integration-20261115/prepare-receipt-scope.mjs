// Frozen, isolated acceptance inputs. No network or formal story writes.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {prepareBoundDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('receipt-scope-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const put=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const original=await read(new URL('omission.original.nested.request.json',I)),input=JSON.parse(original.messages[1].content);
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const strip=v=>Array.isArray(v)?v.map(strip):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>k!=='description').map(([k,x])=>[k,strip(x)])):v;
const cases=[
 {id:'scope.original',expected:'原371输入/历史/坐标/参数完全不变。三段实际言说不能遗漏；player直接回应无障碍可收到，evidence保留应答/传达关系而非孤立代词/目光。bright旁听范围没有明确覆盖起止，不把全三段确定授予；保留未知范围，不反推明确未听见或按文本顺序杜撰开始时间。'},
 {id:'scope.full',text:'黄泉对御临风说：“渡口今晚停航。”她又说：“明早从南桥走。”布莱特从第一句起就一直在旁边听，两句话都听清了。',expected:'player和bright均收到两句；明确全程依据可共用，不因旁听叙述在末尾就错误缩成最后一句或全部待核。'},
 {id:'scope.late',text:'黄泉对御临风说：“渡口今晚停航。”这句话布莱特没听见。随后布莱特走近听着两人的交谈。黄泉接着对御临风说：“明早从南桥走。”这句布莱特听清了。',expected:'player两句，bright只第二句；首句明确not_received，不能共用后续听取追溯前句。'},
 {id:'scope.unknown',text:'黄泉对御临风说：“渡口今晚停航。”她又说：“明早从南桥走。”布莱特听到了其中一句，但无法确定是哪一句。',expected:'player两句，bright不能确定授予任一句；保留范围不明待核，不能说两句都未听见或删掉接收。'},
 {id:'scope.partial',text:'黄泉对御临风说：“渡口今晚停航，明早从南桥走。”布莱特只听清“渡口今晚停航”，后半句有没有听见无法确定。',expected:'player完整内容；bright明确前半句单独登记，后半句uncertain，不能整句授予或全部阻断。'},
 {id:'scope.absent',text:'黄泉对御临风说：“渡口今晚停航。”她又说：“明早从南桥走。”布莱特站在远处，一句也没听到。',expected:'player两句；bright明确未接收，无新增知情或待核，不能用在场推定听见。'},
 {id:'scope.reply',history:'御临风问黄泉：“渡口今晚开不开，明早走哪条路？”布莱特在远处听不到他们。',text:'黄泉答道：“渡口今晚停航。”她略想了想，又答：“明早从南桥走。”',expected:'隐含应答两句均给player，不强求复述；evidence可用回答内容，不引用孤立动作/代词，bright不授予。'},
];
for(const c of cases){
 const options=c.text?{sourceAnchor:{...input.sourceAnchor,chatId:'scope.offline.'+c.id,messageId:1,text:c.text},history:[{messageId:0,role:'user',text:c.history??'御临风与黄泉交谈，布莱特也在附近。'}],actors:input.actors,facts:input.facts,memory:null}:input;
 const p=await prepareBoundDialogueExtraction(options),format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const request={...original,messages:p.messages,response_format:format};
 if(!c.text){assert.deepEqual(request.messages,original.messages);assert.deepEqual(strip(format),strip(original.response_format));}
 await put(new URL(c.id+'.prepared.json',N),request);
}
await put(new URL('cases.json',N),cases);
const next=await read(new URL('scope.original.prepared.json',N)),oldProps=original.response_format.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items.properties,newProps=next.response_format.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items.properties;
const changed=Object.keys(newProps).filter(k=>JSON.stringify(newProps[k])!==JSON.stringify(oldProps[k]));assert.deepEqual(changed,['evidence','reason']);
await put(new URL('request-verification.json',N),{originalMessagesAndCoordinatesUnchanged:true,parametersUnchanged:true,schemaConstraintsUnchanged:true,changedSchemaFields:changed,fieldDescriptionsDelivered:true,caseCount:cases.length});
console.log(JSON.stringify({prepared:cases.length,changedFieldsOnly:changed}));
