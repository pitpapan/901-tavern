import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as dialogue from './story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';
import {createOpeningFixture} from './opening.mjs';

const text='😀甲对乙和丙说：“渡口停航，明早走山路。”\r\n乙听清全部，丙听清前半句，后半句是否听清不明。';
const actors={a:'甲',b:'乙',c:'丙'},full='渡口停航，明早走山路。';
const options={sourceAnchor:{chatId:'selection.test',messageId:0,swipeId:0,text},history:[],actors,facts:{},memory:null};
const prepare=()=>dialogue.prepareSelectedDialogueExtraction(options);
function selection(p,quote){
 const list=JSON.parse(p.messages[2].content).fragments.filter(f=>f.text.includes(quote)&&f.text.indexOf(quote)===f.text.lastIndexOf(quote));
 list.sort((a,b)=>a.text.length-b.text.length);assert.ok(list.length,quote);return {fragmentId:list[0].id,quote};
}
function wire(p){
 const s=q=>selection(p,q),r=(id,who,q,status,evidence)=>({id,contentSpan:s(q),speakerId:'a',recipientIds:[who],recipientSpans:[s(actors[who])],evidence:s(evidence),status,propositionRef:null,reason:''});
 return {schemaVersion:'dialogue-reception/4',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],unresolved:[],coverage:{status:'uncertain',evidence:s(text),reason:'接收范围分别保留'},utterances:[{claim:{id:'speech',type:'utterance',args:{speaker:'甲',content:full},argumentSpans:{speaker:s('甲'),content:s(full)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:s('甲对乙和丙说：“'+full+'”')},receptions:[r('all','b',full,'received','乙听清全部'),r('front','c','渡口停航','received','丙听清前半句'),r('back','c','明早走山路。','uncertain','后半句是否听清不明')]}]}]};
}
test('v4 selects text, program derives UTF16 coordinates, preserves input and partial receipt',async()=>{
 const p=await prepare(),old=await dialogue.prepareScopedDialogueExtraction(options),w=wire(p),copy=structuredClone(w),checked=p.check(w);
 assert.deepEqual(p.input,old.input);assert.equal(p.messages[1].content,old.messages[1].content);
 assert.equal(p.responseFormat.json_schema.name,'dialogue_reception_v4');assert.equal(JSON.parse(p.messages[2].content).schemaVersion,'gm-assertion-fragments/1');
 assert.ok(!JSON.stringify(p.responseFormat).includes('"start"'));assert.ok(!JSON.stringify(JSON.parse(p.messages[2].content)).includes('"end"'));
 assert.ok(!p.messages[0].content.includes('span为{documentId,start,end,quote}'));
 const span=checked.receptions[1].contentSpan;assert.deepEqual(span,{documentId:'current',start:text.indexOf('渡口停航'),end:text.indexOf('渡口停航')+4,quote:'渡口停航'});
 assert.equal(checked.receptions[2].status,'uncertain');assert.deepEqual(w,copy);assert.equal(checked.semanticCompletenessVerified,false);
 const result=spawnSync('python',['-c','import json,sys,jsonschema\nx=json.load(sys.stdin);jsonschema.Draft202012Validator(x["schema"]).validate(x["value"])'],{input:JSON.stringify({schema:p.responseFormat.json_schema.schema,value:w}),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
});
test('rejects missing, forged, ambiguous, legacy-coordinate and out-of-parent selections unchanged',async()=>{
 const p=await prepare();
 for(const mutate of [
  w=>delete w.units[0].utterances[0].receptions[0].contentSpan,
  w=>w.units[0].coverage.evidence.fragmentId='not-present',
  w=>w.units[0].coverage.evidence.quote='伪造',
  w=>w.units[0].coverage.evidence.start=0,
  w=>w.units[0].coverage.evidence={documentId:'current',start:0,end:text.length,quote:text},
  w=>w.units[0].utterances[0].receptions[0].recipientSpans[0]={fragmentId:selection(p,text).fragmentId,quote:'丙'},
  w=>w.units[0].utterances[0].receptions[1].contentSpan=selection(p,'丙听清前半句'),
  w=>w.units[0].utterances[0].receptions[1].contentSpan=selection(p,full),
  w=>w.contextRef='stale',w=>w.schemaVersion='dialogue-reception/3',
  w=>w.units[0].utterances[0].claim.argumentSpans.speaker=null,
  w=>w.units[0].utterances[0].claim.type='action',
 ]){const w=wire(p);mutate(w);const before=structuredClone(w);assert.throws(()=>p.check(w));assert.deepEqual(w,before);}
});
test('repeated identical text selects the intended occurrence; ambiguous full target rejects',async()=>{
 const source='甲说：“好。”\n乙说：“好。”',p=await dialogue.prepareSelectedDialogueExtraction({...options,sourceAnchor:{...options.sourceAnchor,text:source}}),fragments=JSON.parse(p.messages[2].content).fragments;
 const make=sel=>({schemaVersion:'dialogue-reception/4',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'unresolved',claims:[],utterances:[],unresolved:[{span:sel,reason:'声音来源未确定'}],coverage:{status:'uncertain',evidence:selection(p,source),reason:'有歧义'}}]});
 const second=fragments.find(f=>f.text.includes('乙说')&&f.text.includes('好')&&!f.text.includes('甲'));
 const good=make({fragmentId:second.id,quote:'好'});assert.equal(p.check(good).assertions.units[0].unresolved[0].span.start,source.lastIndexOf('好'));
 assert.throws(()=>p.check(make({fragmentId:selection(p,source).fragmentId,quote:'好'})));
});
test('default adapter persists partial knowledge, pending and reopen through existing MVU without repair',async()=>{
 for(const invalid of [false,true]){
  const chat=[{mes:text,is_user:false,swipe_id:0}];let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'selection.test',actors:createOpeningFixture().actors,operations:{}}}},writes=0,calls=0;
  const mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{writes++;state=structuredClone(v);}};
  const tavern={chatId:'selection.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]};let original;
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async req=>{calls++;assert.equal(req.responseFormat.json_schema.name,'dialogue_reception_v4');const p=await dialogue.prepareSelectedDialogueExtraction(JSON.parse(req.messages[1].content));const w=wire(p);if(invalid)w.units[0].utterances[0].receptions[1].contentSpan.quote='不存在';original=JSON.stringify(w);return original;}});
  const create=()=>createStoryKnowledgeRuntime({catalog:{id:'selection.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'selection.test',messageId:0,swipeId:0}),dialogue:adapter}),k=create(),before=structuredClone(state);
  if(invalid){await assert.rejects(k.observeDialogue(options.sourceAnchor));assert.equal(writes,0);assert.deepEqual(state,before);assert.ok(original.includes('不存在'));}
  else {const result=await k.observeDialogue(options.sourceAnchor);assert.deepEqual(k.context().actorKnowledge.find(a=>a.actorId==='c').facts.map(f=>f.content.text),['渡口停航']);assert.equal(result.pending.length,1);assert.equal(result.pending[0].content,'明早走山路。');assert.deepEqual(k.dialogueQuestions([]),[]);const reopened=create();await reopened.observeDialogue(options.sourceAnchor);assert.equal(calls,1);assert.equal(reopened.dialogueQuestions([result.pending[0].id]).length,1);await reopened.resolveDialogue({id:result.pending[0].id,received:true,recipientIds:['c']});assert.equal(reopened.dialogueQuestions([result.pending[0].id]).length,0);}
 }
});
test('none and not_received do not invent receipts or grant knowledge; semantic omissions stay unverified',async()=>{
 const p=await prepare(),w=wire(p);w.units[0].utterances=[];w.units[0].coverage.status='none';assert.deepEqual(p.check(w).receptions,[]);
 const other=wire(p);for(const r of other.units[0].utterances[0].receptions)r.status='not_received';other.units[0].coverage.status='recorded';assert.ok(p.check(other).receptions.every(r=>r.status==='not_received'));
});
test('three original failed replies remain unchanged and rejected by both historical and selected contracts',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['play.006.reception','play.009.reception','play.014.reception']){
  const request=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),input=JSON.parse(request.messages[1].content);
  const old=await dialogue.prepareScopedDialogueExtraction(input),next=await dialogue.prepareSelectedDialogueExtraction(input);assert.throws(()=>old.check(JSON.parse(raw)));assert.throws(()=>next.check(JSON.parse(raw)));assert.deepEqual(next.input,old.input);assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
});

test('selected wire states JSON serialization in the existing envelope instruction without a second pseudo-object',async()=>{
 const p=await prepare();assert.ok(p.messages[0].content.includes('单个合法JSON对象'));assert.ok(!p.messages[0].content.includes('返回嵌套结构{schemaVersion'));
 const old=await dialogue.prepareScopedDialogueExtraction(options);assert.ok(old.messages[0].content.includes('返回嵌套结构{schemaVersion'));assert.equal(p.messages[1].content,old.messages[1].content);
 const a=dialogue.createDialogueSemanticAdapter({complete:async()=>'{"value":"原文" extra}'});await assert.rejects(a.extract(p.input,p.messages,p.responseFormat),SyntaxError);
});

test('v4 failed raw JSON and out-of-fragment originals still reject; valid original423 decodes identically',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/',import.meta.url);
 for(const suffix of ['play006','play009','play014']){
  const id='selection.'+suffix,req=JSON.parse(await readFile(new URL('iteration-200-20261115/'+id+'.request.json',dir),'utf8')),raw=await readFile(new URL('iteration-200-20261115/'+id+'.content.txt',dir),'utf8'),p=await dialogue.prepareSelectedDialogueExtraction(JSON.parse(req.messages[1].content));
  const oldRef=JSON.parse(req.messages[2].content),newRef=JSON.parse(p.messages[2].content);
  assert.deepEqual(newRef.fragments.map(({containerIds,...f})=>f),oldRef.fragments);
  if(suffix==='play014'){const check=JSON.parse(await readFile(new URL('fragment-selection-20261115/'+id+'.check.json',dir),'utf8'));assert.deepEqual(p.check(JSON.parse(raw)),check.checked);}
  else assert.throws(()=>p.check(JSON.parse(raw)));
  assert.equal(await readFile(new URL('iteration-200-20261115/'+id+'.content.txt',dir),'utf8'),raw);
 }
});

test('actual424 raw bracket failure is rejected by the unchanged adapter before any result is returned',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url),id='selection.parents.play006';
 const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),p=await dialogue.prepareSelectedDialogueExtraction(JSON.parse(req.messages[1].content));
 assert.deepEqual(p.messages,req.messages);assert.equal(req.response_format.json_schema.strict,true);let calls=0;
 const a=dialogue.createDialogueSemanticAdapter({complete:async()=>{calls++;return raw;}});
 await assert.rejects(a.extract(p.input,p.messages,p.responseFormat),SyntaxError);assert.equal(calls,1);assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
});

test('actual425 exact citations do not certify listener semantics and remain inspectable without a new filter',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url),id='selection.parents.play009';
 const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8'),p=await dialogue.prepareSelectedDialogueExtraction(JSON.parse(req.messages[1].content));
 assert.deepEqual(p.messages,req.messages);const w=JSON.parse(raw),copy=structuredClone(w),checked=p.check(w);
 assert.equal(checked.canApprove,false);assert.equal(checked.semanticCompletenessVerified,false);
 assert.equal(checked.receptions[0].recipientIds[0],'player');assert.equal(checked.receptions[0].evidence.quote,'布莱特听到这话');
 // The original quote is present but describes the speaker hearing the previous
 // question. No keyword filter or altered receipt is introduced for this case.
 assert.deepEqual(w,copy);assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
});
