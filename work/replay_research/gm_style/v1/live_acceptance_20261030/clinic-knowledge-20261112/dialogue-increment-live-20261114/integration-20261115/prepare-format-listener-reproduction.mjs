// Exactly two explicit reproductions after offline diagnosis, no model transport.
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {prepareSelectedDialogueExtraction} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('./',import.meta.url),N=new URL('format-listener-diagnosis-20261115/',E),I=new URL('iteration-200-20261115/',E),read=async p=>JSON.parse(await readFile(p,'utf8'));
const ledger=await read(new URL('run.json',I));assert.equal(ledger.cumulative,425);assert.equal(ledger.remaining,109);const cases=[],diagnosis=[];
for(const suffix of ['play006','play009']){
 const old='selection.parents.'+suffix,id='selection.reproduce.'+suffix,raw=await readFile(new URL(old+'.request.json',I),'utf8'),req=JSON.parse(raw),p=await prepareSelectedDialogueExtraction(JSON.parse(req.messages[1].content));assert.deepEqual(p.messages,req.messages);
 const a=ledger.attempts.find(a=>a.id===old);assert.equal(a.manualVerdict,'fail');const hash=createHash('sha256').update(raw).digest('hex');assert.equal(hash,a.requestSha256);
 const json=(await read(new URL(old+'.raw-response.txt',I))),descriptions=[];
 const walk=v=>{if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object'){if(v.description&&!descriptions.includes(v.description))descriptions.push(v.description);Object.values(v).forEach(walk);}};walk(req.response_format);
 assert.ok(req.messages[0].content.includes('单个合法JSON对象'));assert.ok(descriptions.some(d=>d.includes('应答引用只指向被回应者')));assert.ok(descriptions.some(d=>d.includes('单独的称谓、代词、目光或说话动作不足')));
 assert.equal(json.choices[0].finish_reason,'stop');assert.ok(json.usage.completion_tokens<req.max_tokens);
 diagnosis.push({original:old,strictSchemaSent:req.response_format.json_schema.strict,finishReason:json.choices[0].finish_reason,completionTokens:json.usage.completion_tokens,maxTokens:req.max_tokens,syntaxRuleSent:true,listenerAndEvidenceRulesSent:true,localRequestOmissionFound:false,receiverRule:descriptions.find(d=>d.includes('应答引用只指向被回应者')),evidenceRule:descriptions.find(d=>d.includes('单独的称谓、代词、目光或说话动作不足'))});
 await copyFile(new URL(old+'.request.json',I),new URL(id+'.prepared.json',N));cases.push({id,original:old,requestSha256:hash,bytes:Buffer.byteLength(raw)});
 ledger.explicitReproductions??={};assert.ok(!ledger.explicitReproductions[id]);ledger.explicitReproductions[id]={of:old,requestSha256:hash,reason:'Current user requests retest after diagnosis/regression with remaining109. No proven product gap; two unchanged failed-input reproductions, not a claimed fix or automatic retry.'};
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));await writeFile(new URL('diagnosis.json',N),JSON.stringify(diagnosis,null,2));
ledger.complete=false;ledger.closed=false;ledger.activeScope='format-listener-diagnosis-20261115: no proven product omission, two user-requested unchanged failed-input reproductions after offline regression; no repair/relaxed validation/deployment/formal writes/auto approval or revision';await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(cases));
