// Offline request preparation only. Existing runner owns network and budget.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareRelatedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('relation-binding-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const originals=await Promise.all(['selection.reproduce.play006','selection.reproduce.play009'].map(async id=>({id,request:await read(new URL(id+'.request.json',I))})));
const cases=originals.map((o,i)=>({id:'relation.original.'+(i?'009':'006'),original:o.id,request:o.request,expected:i?'三段回答完整；当前回答对应玩家，接收依据不误用布莱特听上轮提问；无依据不互授整段。':'三段言说完整；黄泉回答给玩家，布莱特听黄泉按实际范围；布莱特回答不凭同行或咱们给黄泉授予全段。'}));
const contrasts=[
 {id:'direct',history:'黄泉，今晚还能走渡口吗？',text:'黄泉对御临风说：“渡口今晚停航。”御临风继续整理行囊，没有复述这句话。布莱特在另一间隔音房内，听不到这里。',expected:'玩家直接接收，不要求复述；布莱特不接收。'},
 {id:'npc_reply',history:'布莱特问黄泉：“今晚还能走渡口吗？”御临风在远处，听不到他们说话。',text:'黄泉答道：“渡口今晚停航。”',expected:'唯一被回应者bright，引用当前回答承接历史，不把user楼层当作player身份，不给player授予。'},
 {id:'partial',history:'黄泉，路线怎么安排？',text:'黄泉对御临风说：“渡口今晚停航，明早从山路绕行。”御临风听清了全部。布莱特只听清“渡口今晚停航”，后半句被车声盖住。',expected:'玩家全段；bright仅前半received，后半not_received；不得全句误绑。'},
 {id:'ambiguous',history:'御临风和布莱特先后问黄泉路线怎么安排。',text:'黄泉答道：“明早从山路绕行。”两人中只有一人听见，但无法确定是谁。',expected:'保留实际言说和未知听者待核，不授予任一人，无关时不问。'},
 {id:'obstacle',history:'黄泉，今晚还能走渡口吗？',text:'御临风问完便走远，已听不到这里的声音。黄泉没有察觉，仍答道：“渡口今晚停航。”',expected:'实际言说保留；玩家not_received，不能因问答身份而received。'},
 {id:'unsaid',history:'黄泉，今晚还能走渡口吗？',text:'黄泉在心里拟好了“渡口今晚停航”的回答，却始终没有开口。',expected:'不产生实际言说接收/新知情，coverage none；内心内容不当asserted世界事实。'},
];
const base=originals[1].request,input=JSON.parse(base.messages[1].content);
for(const c of contrasts)cases.push({...c,id:'relation.'+c.id,request:{...base,messages:[null,{content:JSON.stringify({sourceAnchor:{...input.sourceAnchor,chatId:'relation.offline.'+c.id,messageId:1,text:c.text},history:[{messageId:0,role:'user',text:c.history}],actors:input.actors,facts:input.facts,memory:null})}]}});
const summaries=[];
for(const c of cases){
 const input=JSON.parse(c.request.messages[1].content),p=await prepareRelatedDialogueExtraction(input),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 if(c.original){assert.equal(p.messages[1].content,c.request.messages[1].content);assert.deepEqual(p.messages[2],c.request.messages[2]);}
 const request={...c.request,messages:p.messages,response_format:format},raw=JSON.stringify(request);
 assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k))),Object.fromEntries(Object.entries(base).filter(([k])=>!['messages','response_format'].includes(k))));
 await writeFile(new URL(c.id+'.prepared.json',N),raw,{flag:'wx'});
 summaries.push({id:c.id,original:c.original??null,expected:c.expected,bytes:Buffer.byteLength(raw),requestSha256:sha(raw),inputAndCatalogueUnchanged:!!c.original});
}
await writeFile(new URL('cases.json',N),JSON.stringify(summaries,null,2));
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,107);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
ledger.complete=false;ledger.closed=false;ledger.currentScope='User-authorized v5 listener/evidence relation validation: 2 failed originals + 6 contrasts, one each; inspect each raw result, no repair or automatic retries.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify(summaries));
