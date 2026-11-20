import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as dialogue from './story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';
import {createOpeningFixture} from './opening.mjs';

const text='甲对乙和丙说：“渡口停航，明早走山路。”乙听清全部，丙听清前半句，后半句是否听清不明。';
const actors={a:'甲',b:'乙',c:'丙'},at=q=>({documentId:'current',start:text.indexOf(q),end:text.indexOf(q)+q.length,quote:q});
const options={sourceAnchor:{chatId:'scoped.test',messageId:0,swipeId:0,text},history:[],actors,facts:{},memory:null};
const full='渡口停航，明早走山路。';
function fixtureWire(input){
 const receipt=(id,who,q,status,evidence)=>({id,contentSpan:at(q),speakerId:'a',recipientIds:[who],recipientSpans:[at(actors[who])],evidence:at(evidence),status,propositionRef:null,reason:''});
 return {schemaVersion:'dialogue-reception/3',contextRef:input.contextRef,inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],unresolved:[],coverage:{status:'uncertain',evidence:at(text),reason:'按听者和接收内容范围分别记录'},utterances:[{claim:{id:'speech',type:'utterance',args:{speaker:'甲',content:full},argumentSpans:{speaker:at('甲'),content:at(full)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:at('甲对乙和丙说：“渡口停航，明早走山路。”')},receptions:[receipt('all','b',full,'received','乙听清全部'),receipt('front','c','渡口停航','received','丙听清前半句'),receipt('back','c','明早走山路。','uncertain','后半句是否听清不明')]}]}]};
}
const prepare=()=>dialogue.prepareScopedDialogueExtraction(options);

test('v3 exposes required exact content spans while reusing the old utterance and citation contracts',async()=>{
 const p=await prepare(),v2=await dialogue.prepareBoundDialogueExtraction(options),w=fixtureWire(p.input),copy=structuredClone(w);
 assert.deepEqual(p.input,v2.input);assert.deepEqual(p.messages.slice(1),v2.messages.slice(1));
 assert.equal(p.responseFormat.json_schema.name,'dialogue_reception_v3');
 const item=p.responseFormat.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items;
 assert.ok(item.required.includes('contentSpan'));assert.ok(item.properties.contentSpan.properties.quote);
 assert.deepEqual(p.responseFormat.json_schema.schema.$defs,v2.responseFormat.json_schema.schema.$defs);
 assert.equal(p.check(w).receptions[1].contentSpan.quote,'渡口停航');assert.deepEqual(w,copy);
 assert.equal(p.check(w).assertions.units[0].claims.length,1); // No synthetic fragment utterances.
 assert.ok(!p.messages[0].content.includes('完整言说和不同接收范围的内容分片各用独立id'));
});

test('missing, forged, out-of-parent and contradictory receipt spans reject without repair',async()=>{
 const p=await prepare();
 for(const change of [w=>delete w.units[0].utterances[0].receptions[1].contentSpan,w=>w.units[0].utterances[0].receptions[1].contentSpan=null,w=>w.units[0].utterances[0].receptions[1].contentSpan.quote='伪造',w=>w.units[0].utterances[0].receptions[1].contentSpan.start++,w=>w.units[0].utterances[0].receptions[1].contentSpan=at('丙听清前半句'),w=>w.units[0].utterances[0].receptions[1].contentSpan=at(full)]){
  const w=fixtureWire(p.input);change(w);const before=structuredClone(w);assert.throws(()=>p.check(w));assert.deepEqual(w,before);
 }
 const valid=fixtureWire(p.input),missing=structuredClone(valid);delete missing.units[0].utterances[0].receptions[0].contentSpan;
 const r=spawnSync('python',['-c','import sys,json,jsonschema\nx=json.loads(sys.stdin.buffer.read());v=jsonschema.Draft202012Validator(x["schema"]);assert v.is_valid(x["valid"]);assert not v.is_valid(x["missing"])'],{input:JSON.stringify({schema:p.responseFormat.json_schema.schema,valid,missing}),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});

test('v2 failures stay untouched and cannot enter the default v3 model path',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['scope.partial','range.original']){
  const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8');
  const p=await dialogue.prepareScopedDialogueExtraction(JSON.parse(req.messages[1].content));assert.throws(()=>p.check(JSON.parse(raw)));assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
 const adapter=dialogue.createDialogueSemanticAdapter({outputContract:'dialogue-reception/3',complete:async()=>{throw Error('must not call');}}),v2=await dialogue.prepareBoundDialogueExtraction(options);
 assert.equal(adapter.extract.outputContract,'dialogue-reception/3');await assert.rejects(adapter.extract(v2.input,v2.messages,v2.responseFormat),/contract required/);
});

test('actual adapter registers only explicit received spans, persists unknown slice, and never fills a missing range',async()=>{
 for(const invalid of [false,true]){
  const chat=[{mes:text,is_user:false,swipe_id:0}];let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'scoped.test',actors:createOpeningFixture().actors,operations:{}}}},writes=0,calls=0;
  const mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{writes++;state=structuredClone(v);}};
  const tavern={chatId:'scoped.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]};let returned;
  const adapter=dialogue.createDialogueSemanticAdapter({outputContract:'dialogue-reception/3',complete:async request=>{calls++;assert.equal(request.responseFormat.json_schema.name,'dialogue_reception_v3');returned=fixtureWire(JSON.parse(request.messages[1].content));if(invalid)delete returned.units[0].utterances[0].receptions[1].contentSpan;return JSON.stringify(returned);}});
  const create=()=>createStoryKnowledgeRuntime({catalog:{id:'scoped.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'scoped.test',messageId:0,swipeId:0}),dialogue:adapter}),k=create(),before=structuredClone(state);
  if(invalid){await assert.rejects(k.observeDialogue(options.sourceAnchor));assert.equal(writes,0);assert.deepEqual(state,before);assert.equal(returned.units[0].utterances[0].receptions[1].contentSpan,undefined);}
  else{
   const result=await k.observeDialogue(options.sourceAnchor);assert.deepEqual(k.context().actorKnowledge.find(a=>a.actorId==='b').facts.map(f=>f.content.text),[full]);assert.deepEqual(k.context().actorKnowledge.find(a=>a.actorId==='c').facts.map(f=>f.content.text),['渡口停航']);
   assert.equal(result.pending.length,1);assert.equal(result.pending[0].content,'明早走山路。');assert.deepEqual(result.pending[0].contentSpan,at('明早走山路。'));assert.deepEqual(k.dialogueQuestions([]),[]);
   const reopened=create();await reopened.observeDialogue(options.sourceAnchor);assert.equal(calls,1);assert.equal(reopened.dialogueQuestions([result.pending[0].id]).length,1);
   await reopened.resolveDialogue({id:result.pending[0].id,received:true,recipientIds:['c'],contentSpan:at('明早走山路')});
   const saved=Object.values(reopened.read().dialogueBatches)[0].rows.find(r=>r.id===result.pending[0].id);assert.deepEqual(saved.contentSpan,at('明早走山路'));assert.equal(saved.quote,'明早走山路');
  }
  assert.equal(calls,1);assert.equal(chat[0].mes,text);
 }
});

test('unreceived ranges and unknown listeners keep existing no-grant boundaries',async()=>{
 const p=await prepare(),w=fixtureWire(p.input);w.units[0].utterances[0].receptions[2].status='not_received';w.units[0].coverage.status='recorded';
 assert.equal(p.check(w).receptions[2].contentSpan.quote,'明早走山路。');
 const u=w.units[0].utterances[0].receptions[2];u.status='uncertain';u.recipientIds=[];u.recipientSpans=[];w.units[0].coverage.status='uncertain';
 assert.deepEqual(p.check(w).receptions[2].recipientIds,[]);
});
