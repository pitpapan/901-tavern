import {readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {prepareCompactDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('../',import.meta.url),N=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',E),old=new URL('compact-recovery-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=x=>createHash('sha256').update(x).digest('hex'),put=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,24);assert.equal(ledger.cumulative,510);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
await put(new URL('ledger-before.json',N),ledger);
const oldBaseline=await read(new URL('baseline.json',old)),baseline={sourceHashes:{},originalEvidence:{},formalProtected:oldBaseline.formalProtected};
for(const path of Object.keys(oldBaseline.sourceHashes))baseline.sourceHashes[path]=sha(await readFile(path));
for(const [path,hash] of Object.entries(baseline.formalProtected))assert.equal(sha(await readFile(path)),hash);
async function collect(dir){for(const f of await readdir(dir,{withFileTypes:true})){const u=new URL(f.name+(f.isDirectory()?'/':''),dir);if(f.isDirectory())await collect(u);else if(f.name!=='run.json')baseline.originalEvidence[u.href]=sha(await readFile(u));}}
await collect(I);await collect(old);await put(new URL('baseline.json',N),baseline);
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const cases=[],diagnosis=[];
for(const [suffix,id,error] of [['uncertain','v7.accept.uncertain','selection'],['recovery','v7.failure.recover','selection'],['npc_reply','v7.accept.npc_reply','reply'],['long','v7.accept.long','missing'],['obstacle','v7.accept.obstacle','reply']]){
 const raw=await readFile(new URL(id+'.request.json',I)),request=JSON.parse(raw),value=await read(new URL(id+'.content.txt',I)),p=await prepareCompactDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.equal(request.messages[0].content,p.messages[0].content);assert.deepEqual(JSON.parse(request.messages[1].content),JSON.parse(p.messages[1].content));assert.deepEqual(request.messages[2],p.messages[2]);
 const format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');assert.deepEqual(format,request.response_format);
 let actualError;try{p.check(value);}catch(e){actualError=e.message;}assert.ok(actualError);
 const fragments=JSON.parse(request.messages[2].content).fragments;
 const invalidSelections=value.selections.map((s,i)=>({i,...s,selectedText:fragments.find(f=>f.id===s.fragmentId)?.text})).filter(s=>!s.selectedText?.includes(s.quote));
 const missing=value.receptions.map((r,i)=>({i,fields:request.response_format.json_schema.schema.properties.receptions.items.required.filter(k=>!Object.hasOwn(r,k))})).filter(r=>r.fields.length);
 const invalidReply=value.receptions.flatMap((r,i)=>{const u=value.utterances[r.utterance];return r.identityKind==='reply'&&!value.selections[u.content].quote.includes(value.selections[r.identity].quote)?[{i,identity:value.selections[r.identity],answer:value.selections[u.content]}]:[];});
 diagnosis.push({original:id,errorClass:error,actualError,invalidSelections,missing,invalidReply,actualContractMatchesSource:true,conclusion:'Raw output violates existing sent contract; no evidenced local omission. No product change.'});
 const next='v7.diag.'+suffix;await writeFile(new URL(next+'.prepared.json',N),raw,{flag:'wx'});cases.push({id:next,original:id,kind:'exact-failed-reproduction',bytes:raw.length});
 ledger.explicitReproductions??={};ledger.explicitReproductions[next]={of:id,requestSha256:sha(raw),reason:'User explicitly authorized diagnosis of these five failures then retest originals within24; offline239 passed. Exact input once after reviewed contract diagnosis, no blind retry or product/prompt/validator change.'};
}
const base=await read(new URL('v7.accept.uncertain.request.json',I)),input=JSON.parse(base.messages[1].content);
const nearby=[
 ['partial_unknown','黄泉答道：“石桥今晚停用；明早在北门碰面。”布莱特听清了石桥停用一事；至于后面的安排，谁也不能确定他是否听见。','布莱特问黄泉：“今晚能走石桥吗？明早在哪儿碰面？”','received stone bridge only; meeting uncertain, no full-speech binding'],
 ['implicit','黄泉抬起头，答道：“渡船今晚不再开航。”','布莱特问黄泉：“今晚还赶得上渡船吗？”御临风仍在远处整理行李。','implicit bright through real history, no explicit listener inserted'],
 ['obstacle','布莱特问完便转过街角，已听不到身后的声音。黄泉仍回答：“仓库要到明天才开门。”','布莱特问黄泉：“仓库现在能进去吗？”','implicit bright not_received; current answer identity versus independent obstacle'],
 ['multi','黄泉对布莱特说：“北桥已经关闭。”布莱特听清了。随后黄泉对御临风说：“沿河的小路仍能通行。”御临风也听清了。','御临风和布莱特正在打听道路情况。','two explicit recipients each receives its own message; all historyMessageId null']
];
for(const [suffix,text,history,expected] of nearby){
 const options={...input,sourceAnchor:{...input.sourceAnchor,chatId:'v7.diag.'+suffix,text},history:[{messageId:0,role:'user',text:history}]};delete options.assertion;delete options.contextRef;
 const p=await prepareCompactDialogueExtraction(options),format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const request={...base,messages:p.messages,response_format:format},raw=JSON.stringify(request),id='v7.diag.near.'+suffix;
 await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});cases.push({id,kind:'nearby-control',expected,bytes:Buffer.byteLength(raw)});
}
await put(new URL('diagnosis.json',N),diagnosis);await put(new URL('cases.json',N),cases);
let replay=await readFile(new URL('replay.mjs',old),'utf8');
replay=replay.replace("assert.deepEqual(request.messages,p.messages);","assert.deepEqual(request.messages[0],p.messages[0]);assert.deepEqual(JSON.parse(request.messages[1].content),JSON.parse(p.messages[1].content));assert.deepEqual(request.messages[2],p.messages[2]);");
await writeFile(new URL('replay.mjs',N),replay,{flag:'wx'});
// Actual old state needed only to replay the separately authorized recovery request.
await copyFile(new URL('v7.accept.uncertain.after.seed.json',old),new URL('v7.accept.uncertain.after.seed.json',N));
ledger.complete=false;ledger.closed=false;ledger.currentScope='Diagnosed five raw v7 failures; no product gap found. Offline239 pass. User authorizes once-only exact originals plus4 nearby controls within24; no repair/relaxation/deploy/formal/auto approval or revision.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({cases,diagnosis,preserved:Object.keys(baseline.originalEvidence).length}));

