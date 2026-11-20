// Offline generation-hook preview only. No transport, credentials, or formal chat writes.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),parent=new URL('../',base),probe=new URL('attribution-probe-20261114/',parent);
const read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')));
const {CLINIC_KNOWLEDGE_CATALOG:catalog}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs')));
const {CLINIC_KNOWLEDGE_CATALOG:priorCatalog}=await import(new URL('../conditions-20261113/package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs',parent));
assert.deepEqual({...catalog,rejectedNarration:catalog.rejectedNarration.slice(0,1)},priorCatalog);
const notes=catalog.rejectedNarration.filter(s=>s.annotation);assert.deepEqual(notes.map(s=>s.messageId),[27,29]);
const plan=await read(new URL('prepared.json',probe)),run=await read(new URL('live/run.json',probe));assert.equal(run.cumulative,261);assert.equal(run.closed,true);
const originalRaw=await readFile(new URL('live/01.request.json',probe)),original=JSON.parse(originalRaw);assert.equal(sha(originalRaw),plan.cases[0].request.sha256);
const replyRaw=await readFile(new URL('live/01.raw-response.txt',probe)),capture=await read(new URL('live/01.response.json',probe));assert.equal(sha(replyRaw),capture.responseBodySha256BeforePrivacyRedaction);
const reply=await readFile(new URL('live/01.content.txt',probe),'utf8');assert.equal(JSON.parse(replyRaw).choices[0].message.content,reply);
const rows=(await readFile(new URL('01.ready.seed.jsonl',probe),'utf8')).trim().split(/\r?\n/).map(JSON.parse),variables=structuredClone(rows.at(-1).variables[0]);
rows.push({name:'布莱特',is_user:false,is_system:false,mes:reply,swipe_id:0,variables:[variables],extra:{nonCanon:true,actualResponseId:JSON.parse(replyRaw).id}});
const before=JSON.stringify(rows),chat=rows.slice(1),chatId=variables.stat_data['901_rules_poc'].chatId;
const k=createStoryKnowledgeRuntime({catalog,tavern:{chatId,chat},mvu:{getMvuData:()=>variables},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
const expected=JSON.parse(original.messages.at(-1).content.split('【901逐角色知情投影】\n')[1].split('\n')[0]);assert.deepEqual(k.context(),expected);
const history=[...original.messages.slice(0,-2),{role:'assistant',content:reply},original.messages.at(-2)];
let listener,actual;
await k.generate({request:{user_input:'离线生成入口核验，不发送模型请求。',ordered_prompts:['原历史','原文风','user_input']},event:'capture',eventOn:(_,fn)=>{listener=fn;},eventRemoveListener:()=>{listener=null;},generateRaw:async request=>{
 actual={kind:'offline-input-preview-not-sent',messages:[...structuredClone(history),{role:'user',content:request.user_input}]};listener(actual);listener(actual);return '';
}});
assert.equal(listener,null);assert.equal(JSON.stringify(rows),before);
const changed=[];
for(const [i,message] of history.entries())if(actual.messages[i].content!==message.content){
 const note=notes.find(n=>message.role==='assistant'&&n.message===message.content);assert.ok(note,'Only reviewed historical messages may change.');
 assert.equal(actual.messages[i].content,note.message+'\n'+note.annotation);changed.push({messageIndex:i,retainedMessageId:note.messageId,sourceAnchors:note.sourceAnchors});
}
assert.equal(changed.length,2);assert.ok(actual.messages.at(-1).content.endsWith(STORY_COMMUNICATION_INSTRUCTION));assert.deepEqual(k.projectMessages(actual.messages),actual.messages);
for(const n of notes)assert.ok(n.sourceAnchors.every(s=>chat[s.messageId].mes===s.text&&(chat[s.messageId].swipe_id??0)===s.swipeId));
// Verify all original model evidence in both predecessor runs remains exact.
let originalResponsesVerified=0;
for(const folder of ['condition-retelling-20261114/','attribution-probe-20261114/']){
 const root=new URL(folder,parent),ledger=await read(new URL('live/run.json',root));
 for(const a of ledger.attempts){
  assert.equal(sha(await readFile(new URL('live/'+a.id+'.request.json',root))),a.requestSha256);
  const raw=await readFile(new URL('live/'+a.id+'.raw-response.txt',root));assert.equal(sha(raw),a.rawResponseSha256);
  assert.equal(JSON.parse(raw).choices[0].message.content,await readFile(new URL('live/'+a.id+'.content.txt',root),'utf8'));originalResponsesVerified++;
 }
}
for(const [path,hash] of Object.entries(plan.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
const red=await readFile(new URL('red.log',base),'utf8'),green=await readFile(new URL('green.log',base),'utf8');assert.match(red,/fail 5/);assert.match(green,/tests 67/);assert.match(green,/pass 67/);assert.match(green,/fail 0/);
const modules=[];
for(const file of ['story-knowledge.mjs','clinic-knowledge-catalog.mjs']){
 const source=await readFile('TRPG outputs/work/rules_engine/gm_runtime/'+file);await writeFile(new URL(file+'.snapshot.txt',base),source);modules.push({file,sha256:sha(source)});
}
await writeFile(new URL('input-preview.json',base),JSON.stringify(actual,null,2)+'\n');
await writeFile(new URL('projection-notes.txt',base),notes.map(n=>'保留楼层 '+n.messageId+'\n'+n.message+'\n\n'+n.annotation).join('\n\n────────────────\n\n')+'\n');
const result={status:'offline-attribution-projection-verified',modelCalls:0,credentialsRead:false,productModulesChanged:2,redFailures:5,greenTests:67,greenFailures:0,changedMessages:changed,originalResponsesVerified,originalCatalogOtherFieldsUnchanged:true,knowledgeCounts:expected.actorKnowledge.map(a=>a.facts.length),knowledgeAndOriginalChatUnchanged:true,formalProtectedFilesUnchanged:Object.keys(plan.protectedFiles).length,modules,automaticRoutesResumed:false,deployed:false,formalStoryWritten:false};
await writeFile(new URL('verification.json',base),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,changedMessages:changed.map(({messageIndex,retainedMessageId})=>({messageIndex,retainedMessageId}))}));
