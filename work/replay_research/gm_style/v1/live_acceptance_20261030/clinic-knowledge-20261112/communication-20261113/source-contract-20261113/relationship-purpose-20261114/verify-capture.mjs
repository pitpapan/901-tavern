// Offline verification of one actual UI capture, not model evaluation.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createStoryKnowledgeRuntime,STORY_COMMUNICATION_INSTRUCTION} from './package/901-opening-combat/work/rules_engine/gm_runtime/story-knowledge.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './package/901-opening-combat/work/rules_engine/gm_runtime/clinic-knowledge-catalog.mjs';
const base=new URL('./',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,base),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const capture=await read('browser.capture.json'),classification=await read('browser.classification-capture.json'),request=await read('browser.request.json'),baseline=await read('baseline.json');
for(const c of [capture,classification]){assert.equal(c.offline,true);assert.equal(c.upstreamCalls,0);assert.equal(c.endpointUrl,baseline.endpoint);}
assert.deepEqual(capture.requestBody,request);assert.deepEqual({...request,messages:undefined},{...baseline.parameters,messages:undefined});
const rows=(await readFile(new URL('browser.captured.chat.jsonl',base),'utf8')).trim().split(/\r?\n/).map(JSON.parse),chat=rows.slice(1),playerFloor=chat.length-2;
assert.ok(chat.at(-1).mes.startsWith('行动已判定无需检定，叙述尚未完成'));
const variables=chat[playerFloor].variables[0],chatId=variables.stat_data['901_rules_poc'].chatId;
const k=createStoryKnowledgeRuntime({catalog,tavern:{chatId,chat},mvu:{getMvuData:()=>variables},getAnchor:()=>({chatId,messageId:playerFloor,swipeId:0})});
const marker='\n【901逐角色知情投影】\n',last=request.messages.at(-1).content;
assert.deepEqual(JSON.parse(last.split(marker)[1].split('\n')[0]),k.context());
assert.equal(last.split(STORY_COMMUNICATION_INSTRUCTION).length-1,1);
assert.deepEqual(k.projectMessages(request.messages),request.messages);
const notes=catalog.rejectedNarration.filter(s=>s.annotation);
for(const note of notes)assert.equal(request.messages.filter(m=>m.role==='assistant'&&m.content===note.message+'\n'+note.annotation).length,1);
for(const text of ['事项#901301','事项#901302','ISOLATED-REJECTED-10','判断与条件式行动','你以中文主持901当前场景'])assert.ok(request.messages[0].content.includes(text),text);
const setup=await read('browser-setup.json'),manifest=await read('package-manifest.json');
for(const m of manifest)assert.equal(hash(await readFile(m.destination)),m.sha256);
for(const [p,sha] of Object.entries(baseline.protectedFiles))assert.equal(hash(await readFile(p)),sha,p);
const result={status:'actual-browser-capture-verified',modelCalls:0,classificationModelCalls:0,
 browserUrl:'http://127.0.0.1:18123/',kind:'actual UI send through normal narrative entry; local classification fixture and 418 before upstream',
 requestBytes:Buffer.byteLength(JSON.stringify(request)),requestSha256:hash(JSON.stringify(request)),endpoint:capture.endpointUrl,
 currentContractIncludedOnce:true,reviewedAnnotationsPresentOnce:notes.length,nonemptyMemoryRecords:3,
 knowledgeCounts:k.context().actorKnowledge.map(a=>a.facts.length),modules:manifest.length,
 protectedFormalFilesUnchanged:Object.keys(baseline.protectedFiles).length,credentialsRead:false,
 environment:'Sandbox loopback failed; identical guarded server ran outside sandbox. First UI send denied by auto-review; after guard/data-root evidence the same action was approved. No indirect submission.',
 setup:'browser-setup.json',originalUiStubRetained:true};
await writeFile(new URL('browser-verification.json',base),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
