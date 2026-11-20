// Offline only. Reproductions explicitly authorized by the current user request.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareRelatedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('binding-format-followup-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,88);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
const originals=['relation.followup.006','relation.followup.009','relation.followup.direct','relation.followup.npc_reply','relation.followup.partial.strict','relation.followup.ambiguous','relation.followup.obstacle','relation.followup.new_direct'];
const labels=['006','009','direct','npc_reply','partial','ambiguous','obstacle','new_direct'],cases=[];
for(const [i,original] of originals.entries()){
 const id='binding.reproduce.'+labels[i],raw=await readFile(new URL(original+'.request.json',I),'utf8'),request=JSON.parse(raw),p=await prepareRelatedDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.deepEqual(p.messages,request.messages);
 const a=ledger.attempts.findLast(a=>a.requestSha256===sha(raw));assert.equal(a.id,original);assert.equal(a.manualVerdict,'fail');
 const unchangedSource=(await Promise.all(Object.entries(a.sourceHashes).map(async([path,hash])=>sha(await readFile(path))===hash))).every(Boolean);
 await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 const reason='Current user explicitly authorizes retesting diagnosed failures after offline regression; no new product gap found, source/request unchanged. One diagnostic reproduction, not a claimed fix.';
 if(unchangedSource)(ledger.explicitReproductions??={})[id]={of:original,requestSha256:sha(raw),reason};
 cases.push({id,original,mode:unchangedSource?'--reproduce-failure':'--retest',requestSha256:sha(raw),bytes:Buffer.byteLength(raw)});
}
const base=await read(new URL('relation.direct.request.json',I)),input=JSON.parse(base.messages[1].content);
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
for(const c of [
 {id:'binding.probe.reply',history:'布莱特问黄泉：“货栈午后还开门吗？”',text:'黄泉答道：“午后就闭门了。”',expected:'bright为唯一隐含被回应者；当前回答作为reply身份和依据，history0仅消歧，不凭user楼层授予player。'},
 {id:'binding.probe.obstacle',history:'黄泉，山路今天能走吗？',text:'御临风已经转过街角，听不到这里的说话声。黄泉仍答道：“山路今天封闭。”',expected:'player明确未接收；身份明示或reply均可，reply须引用当前回答，障碍引用离场听不到；不额外授予他人。'},
]){
 const p=await prepareRelatedDialogueExtraction({sourceAnchor:{...input.sourceAnchor,chatId:c.id,text:c.text},history:[{messageId:0,role:'user',text:c.history}],actors:input.actors,facts:input.facts,memory:null}),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const raw=JSON.stringify({...base,messages:p.messages,response_format:format});
 await writeFile(new URL(c.id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id:c.id,original:null,mode:'--send',expected:c.expected,requestSha256:sha(raw),bytes:Buffer.byteLength(raw)});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));
ledger.complete=false;ledger.closed=false;ledger.currentScope='Current user: diagnose JSON/extra fields/grounding; no product gap proved; eight unchanged failed-request reproductions plus two new contrasts, inspect each; no automatic loop or repair.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify(cases));
