import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {prepareCompactDialogueExtraction} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
const N=new URL('./',import.meta.url),I=new URL('../iteration-200-20261115/',N),read=async u=>JSON.parse(await readFile(u,'utf8'));
const before='每轮明确coverage.status和evidence：recorded有接收记录，uncertain仍有歧义，none确无接收；不能用none省略实际言说。';
const after='每轮明确coverage.status和evidence，状态互斥：uncertain：有unknown接收或非空unresolved，优先于其他状态；recorded：接收记录非空且没有上述歧义；none：接收记录和unresolved均为空。不能用none省略实际言说。';
const oldSource=await readFile(new URL('story-dialogue-knowledge.mjs.before',N),'utf8'),source=await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-dialogue-knowledge.mjs','utf8');assert.equal(oldSource.replace(before,after),source);
const cases=[];
for(const [id,original,url] of [
 ['v7.coverage.recovery','v7.diag.recovery',new URL('v7.diag.recovery.request.json',I)],
 ['v7.coverage.partial','v7.diag.near.partial_unknown',new URL('v7.diag.near.partial_unknown.request.json',I)],
 ...['implicit','obstacle','multi'].map(x=>['v7.coverage.near.'+x,'v7.diag.near.'+x,new URL('v7.diag.near.'+x+'.prepared.json',N)])]){
 const originalRequest=await read(url),request=structuredClone(originalRequest),p=await prepareCompactDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.equal(request.messages[0].content.replace(before,after),p.messages[0].content);
 request.messages[0].content=p.messages[0].content;
 assert.deepEqual({...request,messages:originalRequest.messages},originalRequest);assert.deepEqual(request.messages.slice(1),originalRequest.messages.slice(1));
 const raw=JSON.stringify(request);await writeFile(new URL(id+'.prepared.json',N),raw,{flag:'wx'});
 cases.push({id,original,sourceRequest:url.href,onlyCoverageDefinitionChanged:true,bytes:Buffer.byteLength(raw)});
}
await writeFile(new URL('coverage-cases.json',N),JSON.stringify(cases,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(cases));

