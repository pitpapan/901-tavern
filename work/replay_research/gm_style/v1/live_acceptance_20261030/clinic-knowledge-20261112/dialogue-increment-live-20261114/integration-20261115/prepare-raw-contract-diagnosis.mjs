// Offline only. Reproductions explicitly authorized by the current user request.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareRelatedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('raw-contract-diagnosis-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,73);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
const originals=['boundary.reproduce.long_json','boundary.reproduce.identity'];
const labels=['long','identity'],cases=[];
for(const [i,original] of originals.entries()){
 const id='rawcheck.reproduce.'+labels[i],raw=await readFile(new URL(original+'.request.json',I),'utf8'),request=JSON.parse(raw),p=await prepareRelatedDialogueExtraction(JSON.parse(request.messages[1].content));
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
 {id:'rawcheck.probe.reply',history:'布莱特问黄泉：“山路能走吗？”',text:'黄泉停下脚步，答道：“山路已经封闭了。”',expected:'bright唯一隐含回答对象；reply身份和依据选当前回答，history0仅消歧，不授予player，不要求复述。'},
]){
 const p=await prepareRelatedDialogueExtraction({sourceAnchor:{...input.sourceAnchor,chatId:c.id,text:c.text},history:[{messageId:0,role:'user',text:c.history}],actors:input.actors,facts:input.facts,memory:null}),format=structuredClone(p.responseFormat);
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const raw=JSON.stringify({...base,messages:p.messages,response_format:format});
 await writeFile(new URL(c.id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id:c.id,original:null,mode:'--send',expected:c.expected,requestSha256:sha(raw),bytes:Buffer.byteLength(raw)});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));
ledger.complete=false;ledger.closed=false;ledger.currentScope='Current user: diagnose JSON/extra fields/grounding; no product gap proved; two representative unchanged failed-request reproductions plus one nearby implicit-reply contrast; bounded subset, no new code gap evidenced, inspect each; no automatic loop or repair.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');
console.log(JSON.stringify(cases));
