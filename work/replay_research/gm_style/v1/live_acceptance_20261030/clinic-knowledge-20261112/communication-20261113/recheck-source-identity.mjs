// Bounded offline provenance checks for the two already-saved condition requests.
// Human interpretation is recorded separately; no semantic review, extraction or transport.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime} from './conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('conditions-20261113/',import.meta.url),live=new URL('live-20261113/',base);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const prepared=await read(new URL('prepared.json',base)),run=await read(new URL('run.json',live)),results=[];
assert.equal(run.cumulative,254);assert.equal(run.remaining,0);assert.equal(run.closed,true);
for(const item of prepared.cases){
 const raw=await readFile(new URL(item.id+'.request.json',live));assert.equal(sha(raw),item.request.sha256);assert.deepEqual(raw,await readFile(new URL(item.request.file,base)));
 const body=JSON.parse(raw),actual=JSON.parse(body.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);
 const rows=(await readFile(new URL(item.id+'.captured.chat.jsonl',base),'utf8')).trim().split(/\r?\n/).map(s=>JSON.parse(s)),chat=rows.slice(1);
 const variables=rows.at(-1).variables[rows.at(-1).swipe_id??0],chatId=variables.stat_data['901_rules_poc'].chatId;
 const before=JSON.stringify(rows),k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 assert.deepEqual(k.context(),actual);
 const projected=await k.generate({request:{user_input:'离线来源投影检查'},event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});
 assert.deepEqual(JSON.parse(projected.user_input.split('【901逐角色知情投影】\n')[1].split('\n')[0]),actual);
 const state=k.read(),sources=actual.actorKnowledge.find(a=>a.actorId==='bright').facts[0].sources;
 const evidence=sources.map(s=>{
  const event=state.events[s.eventRef];assert.deepEqual(s.sourceAnchor,event.data.sourceAnchor);assert.equal(s.sourceAnchor.text,chat[s.sourceAnchor.messageId].mes);
  assert.equal(s.senderId,event.data.senderId??null);assert.deepEqual(s.disclosure,event.data.disclosure??null);
  return {eventRef:s.eventRef,savedSenderIdPresent:Object.hasOwn(event.data,'senderId'),projectedSenderId:s.senderId,sourceAnchor:s.sourceAnchor,disclosure:s.disclosure};
 });
 assert.equal(JSON.stringify(rows),before,'Read-only projection must not alter retained knowledge or chat.');
 const responseRaw=await readFile(new URL(item.id+'.raw-response.txt',live)),capture=await read(new URL(item.id+'.response.json',live)),response=JSON.parse(responseRaw);
 assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);
 assert.equal(response.choices[0].message.content,await readFile(new URL(item.id+'.content.txt',live),'utf8'));
 results.push({id:item.id,requestSha256:sha(raw),rawResponseSha256:sha(responseRaw),savedToContextToGenerateToSentExact:true,sourceEvidence:evidence,knowledgeCounts:actual.actorKnowledge.map(a=>a.facts.length)});
}
const request=await read(new URL('pending.request.json',live)),messages=request.messages;
const excerpts=[];
for(let i=0;i<messages.length-1;i++)for(const [j,line] of messages[i].content.split('\n').entries()){
 if(line.includes('村医写给九雪医馆的新推荐信')||line.includes('推荐信是村医托付的由头')||line.includes('原来客与布莱特尚未进行'))excerpts.push({messageIndex:i,role:messages[i].role,line:j+1,text:line});
}
assert.equal(excerpts.length,3);
const protectedFiles=(await read(new URL('../../browser-environment.json',base))).protected;
for(const [path,expected] of Object.entries(protectedFiles))assert.equal(sha(await readFile(path)),expected,path);
const manifest=await read(new URL('package-manifest.json',base));
const module=manifest.find(m=>m.source.replaceAll('\\','/')==='work/rules_engine/gm_runtime/story-knowledge.mjs');
assert.equal(sha(await readFile(new URL('../../../../../../../rules_engine/gm_runtime/story-knowledge.mjs',base))),module.source_sha256);
const report={status:'offline-provenance-recheck-passed',modelCalls:0,cumulative:254,remaining:0,productChanges:0,prior23Or135RegressionsRerun:false,formalProtectedFilesUnchanged:Object.keys(protectedFiles).length,productSourceUnchanged:true,letterAndConfirmationExcerpts:excerpts,results};
await writeFile(new URL('source-identity-recheck.json',live),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,requestsVerified:results.length,sourceContextsVerified:results.reduce((n,r)=>n+r.sourceEvidence.length,0),formalProtectedFilesUnchanged:report.formalProtectedFilesUnchanged,productChanges:0,modelCalls:0,cumulative:254}));
