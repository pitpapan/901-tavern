import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {prepareSemanticDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const E=new URL('../',import.meta.url),N=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',E),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const ledger=await read(new URL('run.json',I));assert.equal(ledger.remaining,57);assert.equal(ledger.cumulative,477);assert.ok(ledger.attempts.every(a=>a.manualVerdict));
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const originals=[
 ['partial','uncertaintycheck.reproduce.partial','bright仅前半山路封闭received，后半渡口会合not_received；引用不能用答道旁白。'],
 ['uncertain','uncertaintycheck.probe.partial','bright前半received；后半接收不明只待核该范围；无关时不问，不猜未收到。'],
 ['npc_reply','bindingjson.reproduce.npc_reply','bright唯一隐含听者；当前回答引用与history0绑定；player不接收。'],
 ['long','bindingjson.reproduce.long','原长文三段言说均保留；区分回答对象、当前接收依据与范围，不凭在场或说话动作授予。'],
 ['identity_unknown','relation.ambiguous','原两人中谁听见未知，不猜身份；保留待核且无关不问。'],
 ['obstacle','uncertaintycheck.reproduce.obstacle','bright为回答对象但已走远听不到，not_received，无新增知情。'],
 ['unsaid','receiptformat.probe.unsaid','只拟答未开口，不生成实际接收或凭空待核。'],
],cases=[];
for(const [name,original,expected] of originals){
 const id='v6.accept.'+name,base=await read(new URL(original+'.request.json',I)),input=JSON.parse(base.messages[1].content),p=await prepareSemanticDialogueExtraction(input),format=structuredClone(p.responseFormat);
 assert.deepEqual(p.input,input);assert.deepEqual(p.messages.slice(1),base.messages.slice(1));
 format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 const request={...base,messages:p.messages,response_format:format},raw=JSON.stringify(request);
 assert.deepEqual(Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k))),Object.fromEntries(Object.entries(base).filter(([k])=>!['messages','response_format'].includes(k))));
 assert.ok(!ledger.attempts.some(a=>a.requestSha256===sha(raw)));
 await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id,original,expected,requestSha256:sha(raw),bytes:Buffer.byteLength(raw),inputAndFragmentMessagesUnchanged:true,generationParametersUnchanged:true});
}
await writeFile(new URL('cases.json',N),JSON.stringify(cases,null,2));
ledger.complete=false;ledger.closed=false;ledger.currentScope='Explicit v6 acceptance within remaining57: seven frozen prior failure/control inputs; only generation contract changed, inspect each raw reply and diagnose failures before proceeding, no identical blind retry or product change.';
await writeFile(new URL('run.json',I),JSON.stringify(ledger,null,2)+'\n');console.log(JSON.stringify(cases));
