import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {patchStoryKnowledgeEntry} from './narrative-style-projection.mjs';
import {CLINIC_KNOWLEDGE_CATALOG as catalog} from './clinic-knowledge-catalog.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';

test('actual adopted ordinary entry constructs runtime, passes it to gate and exposes explicit receipts',async()=>{
 const source=readFileSync(new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/installed-entry.js',import.meta.url),'utf8');
 const patched=patchStoryKnowledgeEntry(source);
 assert.ok(patched.includes('AutoCardUpdaterAPI.exportTableAsJson()'));
 assert.ok(!patched.includes('retainedBranchMemory'));
 assert.ok(patched.includes('knowledge:storyKnowledge'));
 assert.ok(patched.includes('storyKnowledgeController.receiveKnowledge(receipt)'));
 const block=patched.slice(patched.indexOf('const {createStoryKnowledgeRuntime}'),patched.indexOf('const storyKnowledgeController='));
 const local=block.replaceAll('/901-opening-combat/',new URL('../../../',import.meta.url).href);
 const tavern={chatId:'isolated-entry',chat:[{mes:'非Canon测试',swipe_id:0}]};
 const mvu={getMvuData:()=>({stat_data:{'901_rules_poc':{chatId:tavern.chatId}}})};
 const api=await new Function('Mvu','SillyTavern',`return (async()=>{${local};return storyKnowledge;})();`)(mvu,tavern);
 assert.equal(api.context().actorKnowledge.length,3);
 assert.ok(api.context().actorKnowledge.every(a=>a.facts.length===0));
});

test('original Host knowledge closure packages as browser imports and stays executable',async()=>{
 const root=fileURLToPath(new URL('../../../',import.meta.url)),destination=mkdtempSync(join(tmpdir(),'901-knowledge-'));
 try{
  const entries=['story-knowledge.mjs','clinic-knowledge-catalog.mjs'].map(n=>join(root,'work/rules_engine/gm_runtime',n));
  const result=spawnSync('python',[join(root,'work/replay_research/six_books_20261023/runtime_package.py')],{input:JSON.stringify({root,destination,entries}),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const manifest=JSON.parse(result.stdout);
  assert.ok(manifest.some(m=>m.source.replaceAll('\\','/').endsWith('901-trpg-engine/tools/trpg-engine/gm/knowledge.js')));
  for(const item of manifest)assert.ok(!readFileSync(item.destination,'utf8').match(/(?:from\s*|import\s*\()\s*['"]node:/));
  const module=await import(pathToFileURL(join(destination,'work/rules_engine/gm_runtime/story-knowledge.mjs')));
  assert.equal(typeof module.createStoryKnowledgeRuntime,'function');
 }finally{rmSync(destination,{recursive:true,force:true});}
});

test('reviewed lore and rejected old utterance are projected without editing original story',()=>{
 const rejected=catalog.rejectedNarration[0],chat=Array.from({length:11},()=>({mes:'原有记录'}));chat[10]={mes:rejected.message,swipe_id:0};
 const tavern={chatId:rejected.chatId,chat},before=JSON.stringify(chat);
 const k=createStoryKnowledgeRuntime({catalog,tavern,mvu:{getMvuData:()=>({stat_data:{'901_rules_poc':{chatId:tavern.chatId}}})},getAnchor:()=>({chatId:tavern.chatId,messageId:10,swipeId:0})});
 const entries=k.projectEntries(catalog.lore.map(l=>({world:l.book,uid:l.uid,content:l.content})));
 assert.deepEqual(entries.map(e=>e.content),catalog.lore.map(l=>l.publicContent));
 assert.ok(!entries.some(e=>/馆主是雪老好友|馆主与雪老有旧|馆主旧交|医馆好友/.test(e.content)));
 const projected=k.projectMessages([{role:'assistant',content:rejected.message}]);
 assert.ok(!projected[0].content.includes(rejected.fragment));assert.equal(JSON.stringify(chat),before);
 assert.ok(k.context().actorKnowledge.every(a=>!a.facts.length));
});

test('only the two reviewed attribution failures are annotated in their real retained continuation',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/communication-20261113/source-contract-20261113/',import.meta.url);
 const rows=readFileSync(new URL('attribution-probe-20261114/01.ready.seed.jsonl',base),'utf8').trim().split(/\r?\n/).map(JSON.parse);
 const reply=readFileSync(new URL('attribution-probe-20261114/live/01.content.txt',base),'utf8');
 const variables=structuredClone(rows.at(-1).variables[0]);rows.push({is_user:false,mes:reply,swipe_id:0,variables:[variables]});
 const chat=rows.slice(1),chatId=variables.stat_data['901_rules_poc'].chatId,before=JSON.stringify(rows);
 const notes=catalog.rejectedNarration.filter(s=>s.annotation);
 assert.equal(notes.length,2,'Only custom260 and custom261 are established attribution failures.');
 assert.deepEqual(notes.map(s=>s.messageId),[27,29]);
 const k=createStoryKnowledgeRuntime({catalog,tavern:{chatId,chat},mvu:{getMvuData:()=>variables},getAnchor:()=>({chatId,messageId:29,swipeId:0})});
 const actual=JSON.parse(readFileSync(new URL('attribution-probe-20261114/live/01.request.json',base),'utf8'));
 const original=[...actual.messages,{role:'assistant',content:reply}],projected=k.projectMessages(original);
 for(const note of notes){
  assert.equal(chat[note.messageId].mes,note.message);
  assert.ok(note.sourceAnchors.every(s=>chat[s.messageId].mes===s.text));
  const i=original.findIndex(m=>m.role==='assistant'&&m.content===note.message);assert.ok(i>=0);
  assert.equal(projected[i].content,note.message+'\n'+note.annotation);
 }
 for(const i of [23,25])assert.ok(projected.some(m=>m.role==='assistant'&&m.content===chat[i].mes),'Uncertain attribution and personal plans remain intact.');
 assert.deepEqual(k.projectMessages(projected),projected);assert.equal(JSON.stringify(rows),before);
 assert.deepEqual(k.context().actorKnowledge.map(a=>a.facts.length),[0,1,0]);
});
