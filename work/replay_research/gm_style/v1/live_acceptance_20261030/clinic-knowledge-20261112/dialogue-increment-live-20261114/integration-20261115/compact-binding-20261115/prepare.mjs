import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareCompactDialogueExtraction,prepareSemanticDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('../',import.meta.url),N=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',E),read=async u=>JSON.parse(await readFile(u,'utf8')),sha=x=>createHash('sha256').update(x).digest('hex');
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,12);assert.equal(ledger.cumulative,522);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
const prev=await read(new URL('compact-diagnosis-20261115/baseline.json',E)),baseline={sourceHashes:{...prev.sourceHashes},originalEvidence:{},formalProtected:prev.formalProtected};
for(const path of Object.keys(baseline.sourceHashes))baseline.sourceHashes[path]=path.endsWith('story-dialogue-knowledge.mjs')?sha(await readFile(new URL('story-dialogue-knowledge.mjs.before',N))):sha(await readFile(path));
for(const [path,hash] of Object.entries(baseline.formalProtected))assert.equal(sha(await readFile(path)),hash);
async function collect(dir){for(const f of await readdir(dir,{withFileTypes:true})){const u=new URL(f.name+(f.isDirectory()?'/':''),dir);if(f.isDirectory())await collect(u);else if(f.name!=='run.json')baseline.originalEvidence[u.href]=sha(await readFile(u));}}
for(const name of ['iteration-200-20261115/','compact-recovery-20261115/','compact-diagnosis-20261115/'])await collect(new URL(name,E));
await writeFile(new URL('baseline.json',N),JSON.stringify(baseline,null,2)+'\n',{flag:'wx'});
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const cases=[],diagnosis=[];
const strip=v=>Array.isArray(v)?v.map(strip):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>k!=='description').map(([k,x])=>[k,strip(x)])):v;
const oldCoverage='每轮明确coverage.status和evidence：recorded有接收记录，uncertain仍有歧义，none确无接收；不能用none省略实际言说。',latestCoverage='每轮明确coverage.status和evidence，状态互斥：uncertain：有unknown接收或非空unresolved，优先于其他状态；recorded：接收记录非空且没有上述歧义；none：接收记录和unresolved均为空。不能用none省略实际言说。';
async function save(id,options,base,extra){
 const p=await prepareCompactDialogueExtraction(options),format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const request={...base,messages:p.messages,response_format:format},raw=JSON.stringify(request);
 await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});cases.push({id,...extra,bytes:Buffer.byteLength(raw),requestSha256:sha(raw)});return {p,request};
}
for(const [suffix,original] of [['npc_reply','v7.diag.npc_reply'],['long','v7.diag.long'],['implicit','v7.coverage.near.implicit'],['obstacle','v7.coverage.near.obstacle']]){
 const base=await read(new URL(original+'.request.json',I)),input=JSON.parse(base.messages[1].content),value=await read(new URL(original+'.content.txt',I));
 const {p,request}=await save('v7.binding.'+suffix,input,base,{original,kind:'original-failure',inputAndParametersUnchanged:true});
 assert.deepEqual(request.messages.slice(1),base.messages.slice(1));assert.equal(request.messages[0].content,base.messages[0].content.replace(oldCoverage,latestCoverage));assert.deepEqual(strip(request.response_format),strip(base.response_format));
 let error;try{p.check(value);}catch(e){error=e.message;}assert.match(error,/current answer/);
 const v6=await prepareSemanticDialogueExtraction(input),r=v6.responseFormat.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items.properties;
 diagnosis.push({original,error,oldSchemaDescriptions:{identity:base.response_format.json_schema.schema.properties.receptions.items.properties.identity.description??null,evidence:base.response_format.json_schema.schema.properties.receptions.items.properties.evidence.description??null},existingContractDescriptions:{identity:r.listener.description,evidence:r.evidence.description},newDescriptionsOnly:true,previousCoverageFixApplied:base.messages[0].content!==request.messages[0].content,unsupportedReplySelections:value.receptions.flatMap((r,i)=>r.identityKind==='reply'&&!value.selections[value.utterances[r.utterance].content].quote.includes(value.selections[r.identity].quote)?[{i,identity:value.selections[r.identity].quote,parent:value.selections[value.utterances[r.utterance].content].quote}]:[])});
}
const base=await read(new URL('v7.coverage.near.implicit.request.json',I)),input=JSON.parse(base.messages[1].content);
for(const [id,text,history,expected] of [
 ['multi','布莱特系紧包带，答道：“东门已经关闭。”\n\n黄泉抬眼看了看街口，接着说：“南侧小径还能走。”\n\n路旁的摊贩收起了遮雨布，檐下的灯笼正在风里轻轻晃动。','御临风问：“你们知道今晚哪里的路还通吗？”','two separate answer contents, player as implicit questioner, no narrative-as-reception or cross-binding'],
 ['obstacle','布莱特问完就穿过院门，已经听不到里面的动静。黄泉仍答道：“渡船清晨才恢复通航。”','布莱特问黄泉：“渡船什么时候能开？”','implicit bright known through history but not_received from current obstacle'],
 ['partial','黄泉答道：“渡船今晚停驶；清晨改在西桥集合。”布莱特只听见前一项，后一项是否听到还不清楚。','布莱特问黄泉：“今晚怎么过河？接下来在哪里集合？”','first range received, second uncertain, no full answer grant']
]){
 const options={...input,sourceAnchor:{...input.sourceAnchor,chatId:'v7.binding.near.'+id,text},history:[{messageId:0,role:'user',text:history}]};delete options.assertion;delete options.contextRef;
 await save('v7.binding.near.'+id,options,base,{kind:'nearby-control',expected});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2)+'\n',{flag:'wx'});await writeFile(new URL('diagnosis.json',N),JSON.stringify(diagnosis,null,2)+'\n',{flag:'wx'});
await writeFile(new URL('replay.mjs',N),await readFile(new URL('compact-diagnosis-20261115/replay.mjs',E)),{flag:'wx'});
ledger.complete=false;ledger.closed=false;ledger.currentScope='Restore lost v5/v6 listener/evidence schema descriptions in v7 only. Offline243 passed.4 original failed inputs +3 nearby controls, actual pending followups if useful; within remaining12.No repair/relaxation/deploy/formal/approval/revision.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify({cases,preserved:Object.keys(baseline.originalEvidence).length,diagnosis}));

