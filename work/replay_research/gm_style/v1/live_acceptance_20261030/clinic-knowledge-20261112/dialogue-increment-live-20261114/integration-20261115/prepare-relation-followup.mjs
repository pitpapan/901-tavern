// Offline only. Reproductions explicitly authorized by the current user request.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareRelatedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('relation-followup-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,98);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
const originals=['relation.original.006.network','relation.original.009','relation.direct','relation.npc_reply','relation.partial','relation.ambiguous','relation.obstacle'];
const labels=['006','009','direct','npc_reply','partial','ambiguous','obstacle'],cases=[];
for(const [i,original] of originals.entries()){
 const id='relation.followup.'+labels[i],raw=await readFile(new URL(original+'.request.json',I),'utf8'),request=JSON.parse(raw),p=await prepareRelatedDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.deepEqual(p.messages,request.messages);
 const a=ledger.attempts.findLast(a=>a.requestSha256===sha(raw));assert.equal(a.id,original);assert.equal(a.manualVerdict,'fail');
 await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 const reason='Current user explicitly authorizes retesting diagnosed failures after offline regression; no new product gap found, source/request unchanged. One diagnostic reproduction, not a claimed fix.';
 (ledger.explicitReproductions??={})[id]={of:original,requestSha256:sha(raw),reason};
 cases.push({id,original,mode:'--reproduce-failure',requestSha256:sha(raw),bytes:Buffer.byteLength(raw)});
}
const base=await read(new URL('relation.direct.request.json',I)),input=JSON.parse(base.messages[1].content);
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
for(const c of [
 {id:'relation.followup.new_direct',history:'黄泉，货栈今天开到什么时候？',text:'黄泉对御临风说：“货栈午后闭门。”御临风没有复述，继续整理缰绳。布莱特已到街外，听不到这番话。',expected:'玩家直接received不要求复述；bright明确not_received，不新增字段。'},
 {id:'relation.followup.new_partial',history:'黄泉，钥匙在哪里，明天去哪里等你？',text:'黄泉对御临风说：“钥匙在柜上，明早到码头等我。”御临风只听清前半句，后半句是否听清尚不确定。',expected:'玩家前半received，后半uncertain，保留实际内容范围且无关时不问，不猜bright接收。'},
]){
 const p=await prepareRelatedDialogueExtraction({sourceAnchor:{...input.sourceAnchor,chatId:c.id,text:c.text},history:[{messageId:0,role:'user',text:c.history}],actors:input.actors,facts:input.facts,memory:null}),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const raw=JSON.stringify({...base,messages:p.messages,response_format:format});
 await writeFile(new URL(c.id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id:c.id,original:null,mode:'--send',expected:c.expected,requestSha256:sha(raw),bytes:Buffer.byteLength(raw)});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));
ledger.complete=false;ledger.closed=false;ledger.currentScope='Current user: diagnose JSON/extra fields/grounding; no product gap proved; seven unchanged failed-request reproductions plus two new contrasts, inspect each; no automatic loop or repair.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify(cases));
