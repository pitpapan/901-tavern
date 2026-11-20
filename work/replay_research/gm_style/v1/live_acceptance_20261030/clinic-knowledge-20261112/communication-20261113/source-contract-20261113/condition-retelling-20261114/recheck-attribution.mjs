// Offline evidence check only; no linguistic classifier, model transport, or state writer.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const base=new URL('./',import.meta.url),read=async p=>JSON.parse(await readFile(p,'utf8')),sha=s=>createHash('sha256').update(s).digest('hex');
const {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')));
const {CLINIC_KNOWLEDGE_CATALOG:catalog}=await import(pathToFileURL(resolve('TRPG outputs/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs')));
const plan=await read(new URL('prepared.json',base)),parent=await read(new URL('../prepared.json',base)),expected=parent.cases.find(c=>c.id==='pending').context;
const results=[];
for(const item of plan.cases){
 const raw=await readFile(new URL('live/'+item.id+'.request.json',base)),request=JSON.parse(raw);assert.equal(sha(raw),item.request.sha256);
 const rows=(await readFile(new URL(item.id+'.ready.seed.jsonl',base),'utf8')).trim().split(/\r?\n/).map(JSON.parse),chat=rows.slice(1),variables=chat.at(-1).variables[chat.at(-1).swipe_id??0],chatId=variables.stat_data['901_rules_poc'].chatId;
 const before=JSON.stringify(rows),k=createStoryKnowledgeRuntime({catalog,mvu:{getMvuData:()=>variables},tavern:{chatId,chat},getAnchor:()=>({chatId,messageId:chat.length-1,swipeId:0})});
 const state=k.read(),context=k.context(),marker='\n【901逐角色知情投影】\n',last=request.messages.at(-1).content;
 assert.deepEqual(context,expected);assert.deepEqual(context,JSON.parse(last.split(marker)[1].split('\n')[0]));
 const projected=await k.generate({request:{user_input:last.split(marker)[0]},event:'capture',eventOn:()=>{},eventRemoveListener:()=>{},generateRaw:async r=>r});assert.equal(projected.user_input,last);
 const sources=context.actorKnowledge.find(a=>a.actorId==='bright').facts[0].sources;
 for(const s of sources){assert.deepEqual(s.sourceAnchor,state.events[s.eventRef].data.sourceAnchor);assert.equal(s.sourceAnchor.text,chat[s.sourceAnchor.messageId].mes);assert.deepEqual(s.disclosure,state.events[s.eventRef].data.disclosure??null);}
 assert.equal(last.endsWith(STORY_COMMUNICATION_INSTRUCTION),true);assert.equal(JSON.stringify(rows),before);
 const responseRaw=await readFile(new URL('live/'+item.id+'.raw-response.txt',base)),capture=await read(new URL('live/'+item.id+'.response.json',base));
 assert.equal(sha(responseRaw),capture.responseBodySha256BeforePrivacyRedaction);
 assert.equal(JSON.parse(responseRaw).choices[0].message.content,await readFile(new URL('live/'+item.id+'.content.txt',base),'utf8'));
 results.push({id:item.id,requestSha256:sha(raw),rawResponseSha256:sha(responseRaw),savedSourceToContextToGenerateToSentExact:true,sourceEvidence:sources,knowledgeCounts:context.actorKnowledge.map(a=>a.facts.length),stateUnchanged:true,completeCurrentInstructionPresent:true});
}
for(const [path,hash] of Object.entries(plan.protectedFiles))assert.equal(sha(await readFile(path)),hash,path);
assert.equal(sha(await readFile('TRPG outputs/work/rules_engine/gm_runtime/story-knowledge.mjs')),plan.sourceSha256);
const log=await readFile(new URL('attribution-offline-regression.log',base),'utf8');assert.match(log,/tests 28/);assert.match(log,/pass 28/);assert.match(log,/fail 0/);
const report={status:'attribution-source-and-projection-recheck-passed',requestsVerified:results.length,sourceProjectionsVerified:results.reduce((n,r)=>n+r.sourceEvidence.length,0),offlineRegression:{tests:28,passed:28,failed:0,log:'attribution-offline-regression.log'},modelCalls:0,productChanges:0,cumulativeRequestAttempts:260,formalProtectedFilesUnchanged:Object.keys(plan.protectedFiles).length,semanticAssessment:'Manual, separate from these byte/state assertions',results};
await writeFile(new URL('attribution-recheck.json',base),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,results:undefined}));
