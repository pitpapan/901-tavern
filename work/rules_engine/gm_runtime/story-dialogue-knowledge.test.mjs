import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningFixture} from './opening.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';
import {adoptNativeChatBranch} from '../mvu_poc/adapter.mjs';
import {createDialogueSemanticAdapter,prepareDialogueExtraction,prepareBoundDialogueExtraction} from './story-dialogue-knowledge.mjs';
import {makeAssertionInput} from '../../../../901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js';
import {checkAssertionReply} from '../../../../901-trpg-engine/tools/trpg-engine/gm/assertion-extraction.js';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const catalog={id:'dialogue.test',actors:{bright:'布莱特',huang:'黄泉',player:'御临风'},facts:[
 {id:'secret',entityId:'gate',field:'location',value:'东门封闭',certainty:'confirmed',visibility:'private'}]};
function fixture(text='布莱特对黄泉说：“东门封闭。”黄泉听清了。',extract,testCatalog=catalog){
 const chatId='dialogue.isolated',chat=[{mes:text,is_user:false,swipe_id:0}],{actors}=createOpeningFixture();
 const floors={0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId,actors,operations:{}}}}};
 const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(v,{message_id})=>{floors[message_id]=structuredClone(v);}};
 const tavern={chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};
 const getAnchor=()=>({chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id});
 const create=()=>createStoryKnowledgeRuntime({catalog:testCatalog,mvu,tavern,getAnchor,dialogue:{extract,readMemory:()=>({source:'existing-database',text:'仅供定位：旧摘要不能证明接收。'})}});
 return {chat,floors,mvu,tavern,getAnchor,create,source:()=>({...getAnchor(),text:chat.at(-1).mes}),advance(text){floors[chat.length]=structuredClone(floors[chat.length-1]);chat.push({mes:text,is_user:false,swipe_id:0});}};
}
function reply(input,{status='received',mode='asserted',ref=null,unresolved=false,recipients=['huang']}={}){
 const doc=input.assertion.documents[0],span=q=>({documentId:doc.id,start:doc.text.indexOf(q),end:doc.text.indexOf(q)+q.length,quote:q});
 const full={documentId:doc.id,start:0,end:doc.text.length,quote:doc.text};
 const claim={id:'speech',type:'utterance',args:{speaker:'布莱特',content:'东门封闭'},argumentSpans:{speaker:span('布莱特'),content:span('东门封闭')},mode,
 scope:{time:null,condition:mode==='conditional'?'如果':null,attribution:null},scopeSpans:{time:null,condition:mode==='conditional'?full:null,attribution:null},anchor:full};
 return {contextRef:input.contextRef,assertions:{schemaVersion:'gm-assertion-output/1',inputRef:input.assertion.inputRef,units:[{id:'turn',status:unresolved?'unresolved':'extracted',claims:[claim],unresolved:unresolved?[{span:full,reason:'接收范围不明'}]:[]}]},
 receptions:[{id:'receipt',claimId:'speech',speakerId:'bright',recipientIds:recipients,recipientSpans:recipients.map(()=>span('黄泉')),evidence:full,status,propositionRef:ref,reason:status==='uncertain'?'不确定黄泉是否听清':''}]};
}
const facts=(k,id)=>k.context().actorKnowledge.find(a=>a.actorId===id).facts;
// Authored adapter fixture, never a migration or repair of a recorded model reply.
function boundReply(input){const r=reply(input),unit=r.assertions.units[0],{claimId,...receipt}=r.receptions[0];return {schemaVersion:'dialogue-reception/2',contextRef:r.contextRef,inputRef:r.assertions.inputRef,
 units:[{id:unit.id,status:unit.status,claims:[],utterances:[{claim:unit.claims[0],receptions:[receipt]}],unresolved:[],coverage:{status:'recorded',evidence:unit.claims[0].anchor,reason:'原文明示接收'}}]};}

test('ordinary dialogue forwards generated schema to the existing completion callback without changing messages',async()=>{
 const f=fixture(),input={sourceAnchor:f.source(),history:[],actors:catalog.actors,facts:{},memory:null},p=await prepareBoundDialogueExtraction(input);
 assert.equal(p.responseFormat?.type,'json_schema');assert.equal(p.responseFormat.json_schema.strict,true);
 let calls=0;const adapter=createDialogueSemanticAdapter({outputContract:'dialogue-reception/2',complete:async req=>{calls++;assert.deepEqual(req.messages,p.messages);assert.deepEqual(req.responseFormat,p.responseFormat);return JSON.stringify(boundReply(p.input));}});
 const {coverage,canApprove,semanticCompletenessVerified,...canonical}=p.check(await adapter.extract(p.input,p.messages,p.responseFormat));assert.deepEqual(canonical,reply(p.input));assert.equal(coverage.length,1);assert.equal(canApprove,false);assert.equal(semanticCompletenessVerified,false);assert.equal(calls,1);
 let seen;const wired=fixture(undefined,async(i,m,format)=>{seen=format;return reply(i);});await wired.create().observeDialogue(wired.source());assert.equal(seen.json_schema.strict,true);
});

test('five actual failures stay unchanged and rejected; valid saved replies satisfy generation schema',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/parallel-ten-20261114/live/',import.meta.url),cases=[];
 for(const id of ['01-received-new','02-received-rumor','03-not-heard','04-not-yet-said','05-partial-first','06-partial-second','07-ambiguous-hearing','08-ambiguous-listener']){
  const request=JSON.parse(await readFile(new URL(id+'.request.json',base),'utf8')),content=await readFile(new URL(id+'.content.txt',base),'utf8'),input=JSON.parse(request.messages[1].content),p=await prepareDialogueExtraction(input);
  assert.deepEqual(p.messages,request.messages);assert.equal(p.responseFormat?.type,'json_schema');
  if(id.startsWith('05')||id.startsWith('06'))assert.throws(()=>JSON.parse(content),SyntaxError);
  else{const value=JSON.parse(content),valid=['03','04','08'].includes(id.slice(0,2));cases.push({name:id,schema:p.responseFormat.json_schema.schema,value,valid});if(valid)p.check(value);else assert.throws(()=>p.check(value));}
  assert.equal(await readFile(new URL(id+'.content.txt',base),'utf8'),content);
 }
 const check=spawnSync('python',['-c','import sys,json,jsonschema\nfor c in json.loads(sys.stdin.buffer.read().decode("utf-8")):\n jsonschema.Draft202012Validator.check_schema(c["schema"])\n assert jsonschema.Draft202012Validator(c["schema"]).is_valid(c["value"]) == c["valid"], c["name"]'],{input:JSON.stringify(cases),encoding:'utf8'});assert.equal(check.status,0,check.stderr);
});

test('schema metadata does not repair syntax or retry completion failures',async()=>{
 const f=fixture(),p=await prepareBoundDialogueExtraction({sourceAnchor:f.source(),history:[],actors:catalog.actors,facts:{},memory:null});let calls=0;
 const adapter=createDialogueSemanticAdapter({outputContract:'dialogue-reception/2',complete:async()=>{calls++;return '{"receptions":[{status:"received"}]}';}});
 await assert.rejects(adapter.extract(p.input,p.messages,p.responseFormat),SyntaxError);assert.equal(calls,1);
});

test('schema does not replace the existing receipt-to-utterance check or convert action claims',async()=>{
 const f=fixture(),p=await prepareDialogueExtraction({sourceAnchor:f.source(),history:[],actors:catalog.actors,facts:{},memory:null});
 assert.equal(p.responseFormat.json_schema.schema.properties.receptions.items.properties.claimId.type,'string');
 const r=reply(p.input),c=r.assertions.units[0].claims[0],s=c.argumentSpans.speaker;
 c.type='action';c.args={actor:'布莱特',verb:'说',object:'东门封闭'};c.argumentSpans={actor:s,verb:{documentId:'current',start:6,end:7,quote:'说'},object:c.argumentSpans.content};
 const original=JSON.stringify(r);assert.throws(()=>p.check(r),/Invalid dialogue reception/);assert.equal(JSON.stringify(r),original);
});

test('actual action-linked receptions still fail and omitted receptions are not reconstructed',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/schema-reference-20261114/live/',import.meta.url);
 for(const id of ['02-received-rumor','05-partial-first','06-partial-second','07-ambiguous-hearing']){
  const request=JSON.parse(await readFile(new URL(id+'.request.json',base),'utf8')),raw=await readFile(new URL(id+'.content.txt',base),'utf8'),actual=JSON.parse(raw),p=await prepareDialogueExtraction(JSON.parse(request.messages[1].content));
  if(id.startsWith('02'))assert.throws(()=>p.check(actual),/Invalid dialogue reception/);
  else{assert.deepEqual(p.check(actual).receptions,[]);assert.equal(checkAssertionReply(actual.assertions,p.input.assertion).semanticCompletenessVerified,false);}
  assert.equal(await readFile(new URL(id+'.content.txt',base),'utf8'),raw);assert.deepEqual(actual,JSON.parse(raw));
 }
});

test('coexisting action and utterance projections preserve one reception or one pending item, without duplicate knowledge',async()=>{
 for(const status of ['received','not_received','uncertain']){
  const f=fixture(undefined,async input=>{const r=reply(input,{status}),c=r.assertions.units[0].claims[0];
   r.assertions.units[0].claims.push({...structuredClone(c),id:'speech-action',type:'action',args:{actor:'布莱特',verb:'说',object:'东门封闭'},argumentSpans:{actor:c.argumentSpans.speaker,verb:{documentId:'current',start:6,end:7,quote:'说'},object:c.argumentSpans.content}});return r;
  }),k=f.create(),result=await k.observeDialogue(f.source());
  assert.equal(facts(k,'huang').length,status==='received'?1:0);assert.equal(facts(k,'player').length,0);
  assert.equal(result.pending.length,status==='uncertain'?1:0);assert.equal(k.dialogueQuestions([]).length,0);
  if(status==='received')assert.equal(facts(k,'huang')[0].belief,'uncertain');
 }
});

// Frozen parallel cases use authored offline replies; model acceptance is recorded separately.
const parallelCases=JSON.parse(await readFile(new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/parallel-ten-20261114/cases.json',import.meta.url),'utf8'));
function parallelReply(input,c){
 const doc=input.assertion.documents[0],span=q=>({documentId:doc.id,start:doc.text.indexOf(q),end:doc.text.indexOf(q)+q.length,quote:q}),full=span(doc.text),ambiguous=c.id.startsWith('08'),planned=c.id.startsWith('04');
 const claim={id:'speech',type:planned?'state':'utterance',args:planned?{entity:catalog.actors[c.speaker],name:'意图',value:'向御临风转告：“渡船今晚停航。”'}:{speaker:catalog.actors[c.speaker],content:c.content},argumentSpans:planned?{entity:span('黄泉'),name:span('准备'),value:span('向御临风转告：“渡船今晚停航。”')}:{speaker:span(catalog.actors[c.speaker]),content:span(c.content)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:full};
 return {contextRef:input.contextRef,assertions:{schemaVersion:'gm-assertion-output/1',inputRef:input.assertion.inputRef,units:[{id:'turn',status:ambiguous?'unresolved':'extracted',claims:[claim],unresolved:ambiguous?[{span:span('两人中有一人'),reason:'不知道具体哪位没有听清'}]:[]}]},receptions:planned?[]:[{id:'reception',claimId:claim.id,speakerId:c.speaker,recipientIds:c.recipient?[c.recipient]:[],recipientSpans:c.recipient?[span(catalog.actors[c.recipient])]:[],evidence:full,status:c.id.startsWith('03')?'not_received':c.id.startsWith('07')||ambiguous?'uncertain':'received',propositionRef:c.known?'well.closed':null,reason:''}]};
}
for(const c of parallelCases.cases)test('parallel '+c.id+' uses changed speaker, recipient and message with original reception engine',async()=>{
 const localCatalog={...catalog,facts:[{id:'well.closed',entityId:'well',field:'reported_status',value:'北街水井暂时停用',certainty:'rumor',visibility:'private'}]};
 const f=fixture(c.text,async i=>parallelReply(i,c),localCatalog),k=f.create();
 if(c.known)await k.receive({id:'known',status:'received',authority:'host-confirmed',sourceAnchor:f.source(),recipientIds:[c.speaker],propositionRefs:['well.closed'],channel:'message',belief:'rumor'});
 const result=await k.observeDialogue(f.source()),positive=['01','02','05','06'].includes(c.id.slice(0,2));
 assert.equal(result.pending.length,['07','08'].includes(c.id.slice(0,2))?1:0);
 for(const id of Object.keys(catalog.actors))assert.equal(facts(k,id).length,positive&&id===c.recipient||c.known&&id===c.speaker?1:0);
 if(positive){const heard=facts(k,c.recipient)[0];assert.notEqual(heard.belief,'confirmed');if(!c.known){assert.equal(heard.content.text,c.content);assert.equal(heard.content.speakerId,c.speaker);}else assert.equal(heard.belief,'rumor');}
 assert.equal(f.chat[0].mes,c.text);
});
for(const c of parallelCases.followups)test('parallel '+c.id+' consumes persisted pending through original dependency callback',async()=>{
 const parent=parallelCases.cases.find(x=>x.id===c.parent),f=fixture(parent.text,async i=>parallelReply(i,parent)),k=f.create(),pending=(await k.observeDialogue(f.source())).pending;assert.equal(pending.length,1);
 const reopened=f.create();let asked=0;const adapter=createDialogueSemanticAdapter({outputContract:'dialogue-reception/2',complete:async request=>{assert.equal(request.purpose,'dialogue-dependency');const input=JSON.parse(request.messages[1].content);assert.deepEqual(input.pending,pending);assert.equal(input.request.text,c.text);return {inputRef:input.inputRef,required:c.id.startsWith('09')?[]:[pending[0].id]};}});
 reopened.configureDialogue({...adapter,ask:async()=>{asked++;return null;}});
 const result=await reopened.prepareDialogueTurn({text:c.text});assert.equal(asked,c.id.startsWith('09')?0:1);assert.equal(result.status,c.id.startsWith('09')?'ready':'deferred');assert.equal(reopened.dialogueQuestions([pending[0].id]).length,1);
 for(const id of Object.keys(catalog.actors))assert.equal(facts(reopened,id).length,0);
});

test('custom290 nonempty unresolved with extracted status remains rejected without status repair',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/final-four-types-20261114/live/',import.meta.url);
 const req=JSON.parse(await readFile(new URL('08-ambiguous-listener.request.json',base),'utf8')),input=JSON.parse(req.messages[1].content),raw=await readFile(new URL('08-ambiguous-listener.raw-response.txt',base),'utf8');
 const actual=JSON.parse(JSON.parse(raw).choices[0].message.content),before=structuredClone(actual),p=await prepareDialogueExtraction(input);
 assert.deepEqual(p.messages.slice(1),req.messages.slice(1));assert.equal(actual.assertions.units[0].status,'extracted');assert.equal(actual.assertions.units[0].unresolved.length,1);
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ASSERTION_UNIT');assert.throws(()=>p.check(actual),/Invalid dialogue extraction/);assert.deepEqual(actual,before);
});

test('custom288 invented type remains rejected without conversion or partial reception adoption',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/final-four-pairing-20261114/live/',import.meta.url);
 const req=JSON.parse(await readFile(new URL('07-ambiguous-hearing.request.json',base),'utf8')),input=JSON.parse(req.messages[1].content),raw=await readFile(new URL('07-ambiguous-hearing.raw-response.txt',base),'utf8');
 const actual=JSON.parse(JSON.parse(raw).choices[0].message.content),before=structuredClone(actual),p=await prepareDialogueExtraction(input);
 assert.deepEqual(p.messages.slice(1),req.messages.slice(1));assert.equal(actual.assertions.units[0].claims.find(c=>c.id==='c2').type,'manner');
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ASSERTION_CLAIM');assert.throws(()=>p.check(actual),/Invalid dialogue extraction/);assert.deepEqual(actual,before);
});

test('custom287 missing normalized degree span stays rejected; generated pair table reaches the same ordinary input',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/final-four-20261114/live/',import.meta.url);
 const req=JSON.parse(await readFile(new URL('07-ambiguous-hearing.request.json',base),'utf8')),input=JSON.parse(req.messages[1].content),raw=await readFile(new URL('07-ambiguous-hearing.raw-response.txt',base),'utf8'),content=await readFile(new URL('07-ambiguous-hearing.content.txt',base),'utf8');
 assert.equal(JSON.parse(raw).choices[0].message.content,content);const actual=JSON.parse(content),before=structuredClone(actual),p=await prepareDialogueExtraction(input);
 assert.deepEqual(p.messages.slice(1),req.messages.slice(1));assert.ok(p.messages[0].content.includes('args.property ↔ argumentSpans.property'));
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ROLE_SPAN');assert.throws(()=>p.check(actual),/Invalid dialogue extraction/);assert.deepEqual(actual,before);
 assert.equal(actual.receptions[0].status,'uncertain');assert.equal(actual.assertions.units[0].claims[0].argumentSpans.property,null);
});

test('reception reason contract specifies string and empty explanation without conflating explanation and status',async()=>{
 const f=fixture(),p=await prepareDialogueExtraction({sourceAnchor:f.source(),history:[],actors:catalog.actors,facts:{},memory:null});
 for(const rule of ['reception.reason必须为字符串','没有补充说明时填空字符串','不能为null、对象或数组','reason只是解释，不能代替status、接收者或内容范围'])assert.ok(p.messages[0].content.includes(rule),rule);
});

test('empty and nonempty reasons preserve explicit receipt status; invalid reason types reject without coercion',async()=>{
 for(const reason of ['', '只听清明确记录的内容',null,{},[],0,false]){
  const f=fixture(undefined,async i=>{const r=reply(i);r.receptions[0].reason=reason;return r;}),k=f.create();
  if(typeof reason==='string'){assert.equal((await k.observeDialogue(f.source())).pending.length,0);assert.equal(facts(k,'huang').length,1);assert.equal(Object.values(k.read().dialogueBatches)[0].rows[0].extractionReason,reason);}
  else {await assert.rejects(k.observeDialogue(f.source()),/Invalid dialogue reception/);assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);}
 }
});

test('an empty reason cannot upgrade uncertain or unreceived reception',async()=>{
 for(const status of ['uncertain','not_received']){
  const f=fixture(undefined,async i=>{const r=reply(i,{status});r.receptions[0].reason='';return r;}),k=f.create(),result=await k.observeDialogue(f.source());
  assert.equal(facts(k,'huang').length,0);assert.equal(result.pending.length,status==='uncertain'?1:0);
 }
});

test('custom284 malformed original stays rejected despite correct fragment receptions',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/partial-reception-20261114/live/',import.meta.url);
 const req=JSON.parse(await readFile(new URL('05-partial-first.request.json',base),'utf8')),input=JSON.parse(req.messages[1].content),raw=await readFile(new URL('05-partial-first.raw-response.txt',base),'utf8'),content=await readFile(new URL('05-partial-first.content.txt',base),'utf8');
 assert.equal(JSON.parse(raw).choices[0].message.content,content);const actual=JSON.parse(content),before=structuredClone(actual);
 const p=await prepareDialogueExtraction(input);assert.deepEqual(p.messages.slice(1),req.messages.slice(1));
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ROLE_SPAN');assert.throws(()=>p.check(actual),/Invalid dialogue extraction/);
 assert.equal(actual.receptions[0].status,'received');assert.equal(actual.receptions[0].reason,null);
 const f=fixture(input.assertion.documents[0].text,async i=>({...structuredClone(actual),contextRef:i.contextRef})),k=f.create();await assert.rejects(k.observeDialogue(f.source()),/Invalid dialogue extraction/);assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
 assert.deepEqual(actual,before);assert.equal(await readFile(new URL('05-partial-first.raw-response.txt',base),'utf8'),raw);
});

// Authored controls for existing reception semantics, not post-processing model replies.
function fragmentReply(input,rows){
 const r=reply(input),doc=input.assertion.documents[0],span=q=>({documentId:doc.id,start:doc.text.indexOf(q),end:doc.text.indexOf(q)+q.length,quote:q});
 const speech=r.assertions.units[0].claims[0],start=doc.text.indexOf('“')+1,end=doc.text.indexOf('”');
 speech.args.content=doc.text.slice(start,end);speech.argumentSpans.content=span(speech.args.content);r.receptions=[];
 for(const [index,row] of rows.entries()){
  const claim={...structuredClone(speech),id:'part'+index,args:{speaker:'布莱特',content:row.content},argumentSpans:{speaker:span('布莱特'),content:span(row.content)}};
  r.assertions.units[0].claims.push(claim);
  r.receptions.push({id:'receipt'+index,claimId:claim.id,speakerId:'bright',recipientIds:[row.actor],recipientSpans:[span(catalog.actors[row.actor])],evidence:span(row.evidence),status:row.status,propositionRef:null,reason:row.status==='uncertain'?'未确定是否听清':'原文明示的接收范围'});
 }
 return r;
}

test('partial reception guidance pairs each receipt with a content-scoped utterance without altering input or coordinates',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/remaining-six-20261114/live/',import.meta.url);
 const original=JSON.parse(await readFile(new URL('05-partial-first.request.json',base),'utf8')),input=JSON.parse(original.messages[1].content),p=await prepareDialogueExtraction(input);
 for(const rule of ['每条reception的claimId必须指向与该条接收范围一致的utterance','保留原完整言说','拆分是同一言说的内容投影','不得因未完整接收整句而将明确听清的部分降为uncertain','不得把听者的听清状态claim当作原说话者的utterance','不得拼接不连续片段伪造quote'])assert.ok(p.messages[0].content.includes(rule),rule);
 assert.deepEqual(p.messages.slice(1),original.messages.slice(1));
});

test('first and second fragments register independently while the explicitly unheard fragment is ignored',async()=>{
 for(const heard of ['渡口停航','改走山路']){
  const unheard=heard==='渡口停航'?'改走山路':'渡口停航',evidence='黄泉只听清“'+heard+'”，没听清“'+unheard+'”。';
  const text='布莱特对黄泉说：“渡口停航，改走山路。”'+evidence;
  const f=fixture(text,async i=>fragmentReply(i,[{actor:'huang',content:heard,evidence,status:'received'},{actor:'huang',content:unheard,evidence,status:'not_received'}])),k=f.create();
  assert.equal((await k.observeDialogue(f.source())).pending.length,0);
  assert.deepEqual(facts(k,'huang').map(x=>x.content.text),[heard]);assert.equal(facts(k,'player').length,0);
  assert.deepEqual(facts(f.create(),'huang').map(x=>x.content.text),[heard]);assert.equal(f.chat[0].mes,text);
 }
});

test('different listeners keep distinct contents and only genuinely uncertain reception stays pending',async()=>{
 const text='布莱特对黄泉和御临风说：“渡口停航，改走山路。”黄泉只听清“渡口停航”。御临风听清“改走山路”，不确定他是否听清“渡口停航”。';
 const f=fixture(text,async i=>fragmentReply(i,[
  {actor:'huang',content:'渡口停航',evidence:'黄泉只听清“渡口停航”。',status:'received'},
  {actor:'player',content:'改走山路',evidence:'御临风听清“改走山路”',status:'received'},
  {actor:'player',content:'渡口停航',evidence:'不确定他是否听清“渡口停航”。',status:'uncertain'}
 ])),k=f.create(),result=await k.observeDialogue(f.source());
 assert.deepEqual(facts(k,'huang').map(x=>x.content.text),['渡口停航']);assert.deepEqual(facts(k,'player').map(x=>x.content.text),['改走山路']);
 assert.equal(result.pending.length,1);assert.equal(result.pending[0].content,'渡口停航');assert.deepEqual(result.pending[0].recipientIds,['player']);
});

test('partial claims cannot use forged spans or a listener state as a speech receipt',async()=>{
 const text='布莱特对黄泉说：“渡口停航，改走山路。”黄泉听清“渡口停航”。';
 for(const kind of ['span','state']){
  const f=fixture(text,async i=>{const r=fragmentReply(i,[{actor:'huang',content:'渡口停航',evidence:'黄泉听清“渡口停航”。',status:'received'}]),c=r.assertions.units[0].claims[1];
   if(kind==='span')c.argumentSpans.content.quote='渡口恢复通航';
   else {c.type='state';c.args={entity:'黄泉',name:'听清内容',value:'渡口停航'};const doc=i.assertion.documents[0],s=q=>({documentId:doc.id,start:text.indexOf(q),end:text.indexOf(q)+q.length,quote:q});c.argumentSpans={entity:s('黄泉'),name:s('听清'),value:s('渡口停航')};}
   return r;
  }),k=f.create();await assert.rejects(k.observeDialogue(f.source()),/Invalid dialogue/);assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
 }
});

test('custom283 original uncertain whole-speech receipt remains unchanged and is not repaired into partial knowledge',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/remaining-six-20261114/live/',import.meta.url);
 const req=JSON.parse(await readFile(new URL('05-partial-first.request.json',base),'utf8')),input=JSON.parse(req.messages[1].content);
 const raw=await readFile(new URL('05-partial-first.raw-response.txt',base),'utf8'),content=await readFile(new URL('05-partial-first.content.txt',base),'utf8');assert.equal(content,JSON.parse(raw).choices[0].message.content);
 const actual=JSON.parse(content),before=structuredClone(actual),p=await prepareDialogueExtraction(input);assert.doesNotThrow(()=>p.check(actual));
 assert.equal(actual.receptions[0].status,'uncertain');assert.deepEqual(actual.receptions[0].recipientIds,[]);
 const f=fixture(input.assertion.documents[0].text,async i=>({...structuredClone(actual),contextRef:i.contextRef})),k=f.create(),result=await k.observeDialogue(f.source());
 assert.equal(facts(k,'huang').length,0);assert.equal(result.pending.length,1);assert.equal(result.pending[0].content,'东门封闭，改走南门。');assert.deepEqual(actual,before);
 assert.equal(await readFile(new URL('05-partial-first.raw-response.txt',base),'utf8'),raw);
});

test('planned speech with full content grants no knowledge or questions; actual received speech still registers',async()=>{
 const text='布莱特准备向黄泉传达东门封闭的消息，尚未出声。';let candidate;
 const f=fixture(text,async i=>{
  const span=q=>({documentId:'current',start:text.indexOf(q),end:text.indexOf(q)+q.length,quote:q});
  candidate={contextRef:i.contextRef,assertions:{schemaVersion:'gm-assertion-output/1',inputRef:i.assertion.inputRef,units:[{id:'turn',status:'extracted',unresolved:[],claims:[
   {id:'intent',type:'state',args:{entity:'布莱特',name:'意图',value:'向黄泉传达东门封闭的消息'},argumentSpans:{entity:span('布莱特'),name:span('准备'),value:span('向黄泉传达东门封闭的消息')},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:span(text)},
   {id:'speech',type:'action',args:{actor:'布莱特',verb:'出声',object:null},argumentSpans:{actor:span('布莱特'),verb:span('出声'),object:null},mode:'denied',scope:{time:'尚未',condition:null,attribution:null},scopeSpans:{time:span('尚未'),condition:null,attribution:null},anchor:span(text)}
  ]}]},receptions:[]};return candidate;
 }),k=f.create();
 const result=await k.observeDialogue(f.source());assert.equal(result.pending.length,0);
 for(const id of Object.keys(catalog.actors))assert.equal(facts(k,id).length,0);
 assert.equal(candidate.assertions.units[0].claims[0].args.value,'向黄泉传达东门封闭的消息');
 assert.equal(candidate.assertions.units[0].claims[1].mode,'denied');
 const actual=fixture(undefined,async i=>reply(i)),received=actual.create();
 assert.equal((await received.observeDialogue(actual.source())).pending.length,0);assert.equal(facts(received,'huang').length,1);assert.equal(facts(received,'player').length,0);
});

test('original custom281 keeps asserted plus intent attribution; updated shared guidance does not repair or certify it',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/value-types-retest-20261114/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('request.json',base),'utf8'));
 const raw=await readFile(new URL('raw-response.txt',base),'utf8'),content=await readFile(new URL('content.txt',base),'utf8');assert.equal(content,JSON.parse(raw).choices[0].message.content);
 const actual=JSON.parse(content),before=structuredClone(actual),input=JSON.parse(request.messages[1].content);
 const checked=checkAssertionReply(actual.assertions,input.assertion);assert.equal(checked.ok,true);assert.equal(checked.semanticCompletenessVerified,false);assert.equal(checked.canApprove,false);
 const c=actual.assertions.units[0].claims.find(c=>c.id==='c2');assert.equal(c.mode,'asserted');assert.equal(c.scope.attribution,'布莱特打算告知的内容');assert.deepEqual(actual.receptions,[]);
 const prepared=await prepareDialogueExtraction(input);assert.deepEqual(prepared.messages.slice(1),request.messages.slice(1));
 assert.ok(prepared.messages[0].content.includes('mode针对当前claim所表达的命题'));assert.doesNotThrow(()=>prepared.check(actual));assert.deepEqual(actual,before);
 const f=fixture(input.assertion.documents[0].text,async i=>({...structuredClone(actual),contextRef:i.contextRef})),k=f.create();
 assert.equal((await k.observeDialogue(f.source())).pending.length,0);for(const id of Object.keys(catalog.actors))assert.equal(facts(k,id).length,0);
 assert.equal(await readFile(new URL('raw-response.txt',base),'utf8'),raw);
});
test('received explanation is retained as explanation, not a registration blocker',async()=>{
 for(const explanation of ['布莱特直接对黄泉说话，且原文明确记录黄泉听清了。', '', '内容已传达给指定听者。']){
  const f=fixture(undefined,async i=>{const r=reply(i);r.receptions[0].reason=explanation;return r;}),k=f.create();
  const result=await k.observeDialogue(f.source());assert.equal(result.pending.length,0);
  assert.equal(facts(k,'huang').length,1);assert.equal(facts(k,'player').length,0);
  const row=Object.values(k.read().dialogueBatches)[0].rows[0];
  assert.equal(row.extractionReason,explanation);assert.equal(row.reason,'');assert.equal(row.status,'registered');
  assert.equal(facts(f.create(),'huang').length,1);
 }
});
test('positive explanation cannot bypass status, scope, unresolved, identity, recipients or source acquisition',async()=>{
 const cases=[
  ['uncertain',r=>{r.receptions[0].status='uncertain';},'pending'],
  ['not received',r=>{r.receptions[0].status='not_received';},'ignored'],
  ['unresolved',r=>{const u=r.assertions.units[0];u.status='unresolved';u.unresolved=[{span:u.claims[0].anchor,reason:'接收者未定'}];},'pending'],
  ['identity',r=>{r.receptions[0].recipientIds=['player'];},'pending'],
  ['no recipients',r=>{r.receptions[0].recipientIds=[];r.receptions[0].recipientSpans=[];},'pending'],
  ['no sender knowledge',r=>{r.receptions[0].propositionRef='secret';},'pending'],
  ['denied',r=>{r.assertions.units[0].claims[0].mode='denied';},'ignored'],
  ['conditional',r=>{const c=r.assertions.units[0].claims[0];c.mode='conditional';c.scope.condition='条件尚未完成';c.scopeSpans.condition=c.anchor;},'ignored'],
 ];
 for(const [name,mutate,expected] of cases){
  const f=fixture(undefined,async i=>{const r=reply(i);r.receptions[0].reason='明确收到的解释';mutate(r);return r;}),k=f.create();
  const result=await k.observeDialogue(f.source());assert.equal(facts(k,'huang').length,0,name);assert.equal(facts(k,'player').length,0,name);
  assert.equal(result.pending.length,expected==='pending'?1:0,name);
  if(name==='identity')assert.match(result.pending[0].reason,/身份|指代/);
  if(name==='no sender knowledge')assert.match(result.pending[0].reason,/取得依据/);
 }
});
test('positive explanation never repairs a missing or forged role span',async()=>{
 for(const span of [null,{documentId:'current',start:9,end:13,quote:'伪造消息'}]){
  const f=fixture(undefined,async i=>{const r=reply(i);r.receptions[0].reason='已明确听清';r.assertions.units[0].claims[0].argumentSpans.content=span;return r;}),k=f.create();
  await assert.rejects(k.observeDialogue(f.source()),/Invalid dialogue extraction/);assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
 }
});
test('original custom273 response still fails INVALID_ROLE_SPAN unchanged; no source auto-completion',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('live/01-received-new.request.json',base),'utf8'));
 const raw=await readFile(new URL('live/01-received-new.raw-response.txt',base),'utf8'),body=JSON.parse(raw);
 const text=await readFile(new URL('live/01-received-new.content.txt',base),'utf8');assert.equal(text,body.choices[0].message.content);
 const actual=JSON.parse(text),before=JSON.stringify(actual),input=JSON.parse(request.messages[1].content);
 assert.equal(actual.assertions.units[0].claims.find(c=>c.id==='c3').argumentSpans.object,null);
 const checked=checkAssertionReply(actual.assertions,input.assertion);assert.equal(checked.ok,false);assert.equal(checked.issues[0].code,'INVALID_ROLE_SPAN');
 const prepared=await prepareDialogueExtraction(input);
 assert.equal(prepared.messages[1].content,request.messages[1].content);
 assert.ok(request.messages[0].content.includes('每个非null角色值配一个原文span'));
 assert.ok(prepared.messages[0].content.includes('角色值与对应引用成对生成'));
 assert.throws(()=>prepared.check(actual),/Invalid dialogue extraction/);assert.equal(JSON.stringify(actual),before);
 const applied=JSON.parse(await readFile(new URL('live/01-received-new.applied.json',base),'utf8'));assert.equal(applied.localProtocolPassed,false);
 assert.equal(await readFile(new URL('live/01-received-new.raw-response.txt',base),'utf8'),raw);
});
test('original custom274 normalized label without span remains rejected; new guidance reaches ordinary extraction',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/span-retest-20261114/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('request.json',base),'utf8'));
 const raw=await readFile(new URL('raw-response.txt',base),'utf8'),body=JSON.parse(raw),content=await readFile(new URL('content.txt',base),'utf8');
 assert.equal(content,body.choices[0].message.content);
 const actual=JSON.parse(content),before=structuredClone(actual),input=JSON.parse(request.messages[1].content);
 const claim=actual.assertions.units[0].claims.find(c=>c.id==='claim.1');assert.equal(claim.args.name,'状态');assert.equal(claim.argumentSpans.name,null);
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ROLE_SPAN');
 const prepared=await prepareDialogueExtraction(input);assert.equal(prepared.messages[1].content,request.messages[1].content);
 assert.ok(prepared.messages[0].content.includes('多个字段可以共用同一个span'));
 assert.ok(prepared.messages[0].content.includes('标签词未逐字出现不等于属性未表达'));
 assert.throws(()=>prepared.check(actual),/Invalid dialogue extraction/);assert.deepEqual(actual,before);
 const applied=JSON.parse(await readFile(new URL('applied.json',base),'utf8'));assert.equal(applied.localProtocolPassed,false);assert.equal(applied.revision,0);
 assert.equal(await readFile(new URL('raw-response.txt',base),'utf8'),raw);
});
test('original custom276 shifted spans remain rejected with deterministic coordinates present',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/full-retest-20261114/live/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('01-received-new.request.json',base),'utf8'));
 const raw=await readFile(new URL('01-received-new.raw-response.txt',base),'utf8'),body=JSON.parse(raw),content=await readFile(new URL('01-received-new.content.txt',base),'utf8');
 assert.equal(content,body.choices[0].message.content);
 const actual=JSON.parse(content),before=structuredClone(actual),input=JSON.parse(request.messages[1].content);
 const prepared=await prepareDialogueExtraction(input);assert.equal(prepared.messages[1].content,request.messages[1].content);
 const ref=JSON.parse(prepared.messages[2].content);assert.equal(ref.inputRef,input.assertion.inputRef);
 assert.deepEqual(ref.documents[0].blocks[0].cells[15],[15,16,'黄']);
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ASSERTION_CLAIM');
 assert.throws(()=>prepared.check(actual),/Invalid dialogue extraction/);assert.deepEqual(actual,before);
 const failed=JSON.parse(await readFile(new URL('01-received-new.applied.json',base),'utf8'));
 const seed=JSON.parse(await readFile(new URL('01-received-new.after.seed.json',base),'utf8'));
 assert.equal(failed.localProtocolPassed,false);assert.equal(seed.floors[0].stat_data['901_rules_poc'].revision,0);
 assert.equal(await readFile(new URL('01-received-new.raw-response.txt',base),'utf8'),raw);
});
test('original custom280 object in scope.time still fails unchanged under explicit scalar instructions',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/remaining-nine-20261114/live/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('04-not-yet-said.request.json',base),'utf8'));
 const raw=await readFile(new URL('04-not-yet-said.raw-response.txt',base),'utf8'),content=await readFile(new URL('04-not-yet-said.content.txt',base),'utf8');assert.equal(content,JSON.parse(raw).choices[0].message.content);
 const actual=JSON.parse(content),before=structuredClone(actual),input=JSON.parse(request.messages[1].content),claim=actual.assertions.units[0].claims.find(c=>c.id==='c2');
 assert.equal(typeof claim.scope.time,'object');assert.deepEqual(claim.scope.time,claim.scopeSpans.time);
 assert.equal(checkAssertionReply(actual.assertions,input.assertion).issues[0].code,'INVALID_ROLE_SPAN');
 const prepared=await prepareDialogueExtraction(input);assert.deepEqual(prepared.messages.slice(1),request.messages.slice(1));
 assert.ok(prepared.messages[0].content.includes('args和scope的每个字段只能是非空字符串或null'));
 assert.throws(()=>prepared.check(actual),/Invalid dialogue extraction/);assert.deepEqual(actual,before);
 const failed=JSON.parse(await readFile(new URL('04-not-yet-said.applied.json',base),'utf8')),seed=JSON.parse(await readFile(new URL('04-not-yet-said.after.seed.json',base),'utf8'));
 assert.equal(failed.localProtocolPassed,false);assert.equal(seed.floors[0].stat_data['901_rules_poc'].revision,0);
 assert.equal(await readFile(new URL('04-not-yet-said.raw-response.txt',base),'utf8'),raw);
});
test('shared span guidance reaches ordinary extraction; partial hearing retains only received content',async()=>{
 const text='布莱特对黄泉说：“东门封闭，码头停航。”黄泉只听清了“东门封闭”。';
 const f=fixture(text,async i=>{
  const r=reply(i),start=text.indexOf('黄泉只听清');
  r.receptions[0].evidence={documentId:'current',start,end:text.length,quote:text.slice(start)};
  return r;
 }),k=f.create();
 const prepared=await prepareDialogueExtraction({sourceAnchor:f.source(),history:[],actors:catalog.actors,facts:{},memory:null});
 assert.ok(prepared.messages[0].content.includes('跨句承接'));
 assert.ok(prepared.messages[0].content.includes('多个可能先行项'));
 await k.observeDialogue(f.source());
 assert.equal(facts(k,'huang').length,1);assert.equal(facts(k,'huang')[0].content.text,'东门封闭');
 assert.equal(facts(k,'player').length,0);
});
test('ordinary prose: new message is attributed information, not a new world truth; persisted and idempotent',async()=>{
 let calls=0;const f=fixture(undefined,async input=>{calls++;assert.equal(input.memory.source,'existing-database');return reply(input);}),k=f.create();
 const result=await k.observeDialogue(f.source());
 assert.equal(result.status,'processed');assert.equal(calls,1);
 const heard=facts(k,'huang');assert.equal(heard.length,1);assert.equal(heard[0].belief,'uncertain');
 assert.equal(heard[0].content.kind,'reported_message');assert.equal(heard[0].content.text,'东门封闭');assert.equal(heard[0].content.speakerId,'bright');
 assert.equal(facts(k,'player').length,0);assert.equal(k.read().facts.secret.value,'东门封闭');
 assert.equal(facts(f.create(),'huang').length,1);await f.create().observeDialogue(f.source());assert.equal(calls,1);
 assert.equal(f.chat[0].mes,f.source().text);
});
test('existing proposition relay keeps rumor and rejects invented sender acquisition',async()=>{
 const f=fixture(undefined,async input=>reply(input,{ref:'secret'})),k=f.create();
 const first=await k.observeDialogue(f.source());assert.equal(first.pending.length,1);assert.equal(facts(k,'huang').length,0);
 const g=fixture(undefined,async input=>reply(input,{ref:'secret'})),known=g.create();
 await known.receive({id:'prior',status:'received',authority:'host-confirmed',recipientIds:['bright'],propositionRefs:['secret'],channel:'message',belief:'rumor',sourceAnchor:g.source()});
 await known.observeDialogue(g.source());assert.equal(facts(known,'huang')[0].belief,'rumor');
});
for(const [name,options] of [['planned',{mode:'conditional'}],['denied',{mode:'denied'}],['question',{mode:'question'}],['not received',{status:'not_received'}]])
 test(name+' never grants knowledge or prompts',async()=>{const f=fixture(undefined,async i=>reply(i,options)),k=f.create();await k.observeDialogue(f.source());assert.equal(facts(k,'huang').length,0);assert.equal(k.dialogueQuestions(['secret']).length,0);});
test('ambiguous hearing persists across reopen and asks only for matching dependencies; explicit answer resolves once',async()=>{
 const f=fixture(undefined,async i=>reply(i,{status:'uncertain'})),k=f.create();const result=await k.observeDialogue(f.source());
 assert.equal(result.pending.length,1);const ref=result.pending[0].id;
 assert.deepEqual(k.dialogueQuestions([]),[]);assert.deepEqual(k.dialogueQuestions(['unrelated']),[]);
 const reopened=f.create();assert.equal(reopened.dialogueQuestions([ref]).length,1);
 await reopened.resolveDialogue({id:ref,received:true,recipientIds:['huang']});
 assert.equal(facts(reopened,'huang').length,1);assert.deepEqual(reopened.dialogueQuestions([ref]),[]);
 await reopened.resolveDialogue({id:ref,received:true,recipientIds:['huang']});assert.equal(facts(reopened,'huang').length,1);
});
test('unresolved extraction cannot auto grant even if reception says received',async()=>{
 const f=fixture(undefined,async i=>reply(i,{unresolved:true})),k=f.create();assert.equal((await k.observeDialogue(f.source())).pending.length,1);assert.equal(facts(k,'huang').length,0);
});
test('invalid span or recipient rejects entire candidate batch before any write',async()=>{
 for(const corrupt of [r=>{r.receptions[0].evidence.quote='虚构';},r=>{r.receptions[0].recipientIds=['ghost'];},r=>{r.assertions.units=[];}]){
 const f=fixture(undefined,async i=>{const r=reply(i);corrupt(r);return r;}),k=f.create();await assert.rejects(k.observeDialogue(f.source()));assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
 }
});
test('source changes while extraction waits: no knowledge write',async()=>{
 const f=fixture(undefined,async i=>{f.chat[0].swipe_id=1;return reply(i);}),k=f.create();await assert.rejects(k.observeDialogue(f.source()));assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
});
test('missing extractor is explicit disabled, not empty successful extraction',async()=>{
 const f=fixture(),k=f.create();assert.equal((await k.observeDialogue(f.source())).status,'disabled');assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
});
test('extractor failure is not cached as no change and does not write story',async()=>{
 const f=fixture(undefined,async()=>{throw Error('offline failure');}),k=f.create();await assert.rejects(k.observeDialogue(f.source()),/offline failure/);assert.equal(f.floors[0].stat_data['901_rules_poc'].revision,0);
});
test('dependency callback gates questions, dismissal is not repeated on every turn',async()=>{
 const f=fixture(undefined,async i=>reply(i,{status:'uncertain'})),k=f.create();const result=await k.observeDialogue(f.source());
 let relevant=false,asked=0;
 k.configureDialogue({dependencies:async()=>relevant?[result.pending[0].id]:[],ask:async()=>{asked++;return null;}});
 assert.equal((await k.prepareDialogueTurn({text:'闲聊'})).status,'ready');assert.equal(asked,0);
 relevant=true;assert.equal((await k.prepareDialogueTurn({text:'依此办事'})).status,'deferred');assert.equal(asked,1);
 assert.equal((await k.prepareDialogueTurn({text:'再次依此办事'})).status,'deferred');assert.equal(asked,1);
 await k.resolveDialogue({id:result.pending[0].id,received:false,recipientIds:[]});assert.equal((await k.prepareDialogueTurn({text:'继续'})).status,'ready');
});
test('new content uses quoted words, never model normalization as an added fact',async()=>{
 const f=fixture(undefined,async i=>{const r=reply(i);r.assertions.units[0].claims[0].args.content='东门已经永远封闭';return r;}),k=f.create();
 await k.observeDialogue(f.source());assert.equal(facts(k,'huang')[0].content.text,'东门封闭');
});
test('prepared batch resumes without extracting again after receipt persistence interruption',async()=>{
 let calls=0;const f=fixture(undefined,async i=>{calls++;return reply(i);}),k=f.create(),original=k.receive;
 k.receive=async()=>{throw Error('interrupted');};await assert.rejects(k.observeDialogue(f.source()),/interrupted/);
 k.receive=original;await f.create().observeDialogue(f.source());assert.equal(calls,1);assert.equal(facts(k,'huang').length,1);
});
test('native fork retains unresolved questions on its own branch',async()=>{
 const parent=fixture(undefined,async i=>reply(i,{status:'uncertain'})),p=parent.create(),result=await p.observeDialogue(parent.source());
 const child=fixture();child.tavern.chatId='dialogue.child';child.floors[0]=structuredClone(parent.floors[0]);
 child.tavern.chatMetadata={main_chat:parent.tavern.chatId,integrity:'dialogue.fork'};
 await adoptNativeChatBranch({mvu:child.mvu,tavern:child.tavern,expectedParentChatId:parent.tavern.chatId,expectedRevision:parent.floors[0].stat_data['901_rules_poc'].revision});
 const k=createStoryKnowledgeRuntime({catalog,mvu:child.mvu,tavern:child.tavern,getAnchor:()=>({chatId:'dialogue.child',messageId:0,swipeId:0})});
 assert.equal(k.dialogueQuestions([result.pending[0].id]).length,1);
 await k.resolveDialogue({id:result.pending[0].id,received:false,recipientIds:[]});assert.equal(p.dialogueQuestions([result.pending[0].id]).length,1);
});
test('unresolved-only semantic output is retained, not falsely treated as no changes',async()=>{
 const f=fixture(undefined,async i=>{const r=reply(i,{unresolved:true});r.assertions.units[0].claims=[];r.receptions=[];return r;}),k=f.create();
 const result=await k.observeDialogue(f.source());assert.equal(result.pending.length,1);
 await k.resolveDialogue({id:result.pending[0].id,received:true,recipientIds:['huang'],speakerId:'bright',contentSpan:{start:9,end:13,quote:'东门封闭'}});
 assert.equal(facts(k,'huang').length,1);
});
test('browser extraction uses the same frozen assertion SHA contract as existing Node extractor',async()=>{
 const f=fixture(),p=await prepareDialogueExtraction({sourceAnchor:f.source(),history:[],actors:catalog.actors,facts:{},memory:null});
 const input=p.input.assertion;
 assert.deepEqual(input,makeAssertionInput({stage:'source',documents:input.documents,targets:input.targets}));
});
test('explicit semantic adapter accepts offline completion and binds dependency response; no review routes',async()=>{
 const purposes=[];const adapter=createDialogueSemanticAdapter({outputContract:'dialogue-reception/2',complete:async request=>{
  purposes.push(request.purpose);const input=JSON.parse(request.messages[1].content);
  if(request.purpose==='dialogue-reception')return JSON.stringify(boundReply(input));
  return JSON.stringify({inputRef:input.inputRef,required:null});
 }});
 const f=fixture(undefined,adapter.extract);await f.create().observeDialogue(f.source());
 assert.equal(await adapter.dependencies({request:{text:'未知依赖'},pending:[],memory:null}),null);
 assert.deepEqual(purposes,['dialogue-reception','dialogue-dependency']);
});
test('an unrelated unresolved passage does not prevent explicit reception in the same turn',async()=>{
 const text='布莱特对黄泉说：“东门封闭。”黄泉听清了。另一件事的接收者不明。',cut=text.indexOf('另一件');
 const f=fixture(text,async i=>{const r=reply(i),u=r.assertions.units[0];
  const evidence={documentId:'current',start:0,end:cut,quote:text.slice(0,cut)};u.claims[0].anchor=evidence;r.receptions[0].evidence=evidence;
  u.status='unresolved';u.unresolved=[{span:{documentId:'current',start:cut,end:text.length,quote:text.slice(cut)},reason:'另一条消息接收人未定'}];return r;
 }),k=f.create();const result=await k.observeDialogue(f.source());assert.equal(facts(k,'huang').length,1);assert.equal(result.pending.length,1);
});
test('explicit contradictory actor mapping stays pending rather than granting the wrong actor',async()=>{
 const f=fixture(undefined,async i=>{const r=reply(i);r.receptions[0].recipientIds=['player'];return r;}),k=f.create();
 const result=await k.observeDialogue(f.source());assert.equal(result.pending.length,1);assert.equal(facts(k,'player').length,0);
});
test('unknown or reported assertions do not automatically grant reception',async()=>{
 for(const mode of ['unknown','reported']){
  const f=fixture(undefined,async i=>{const r=reply(i);r.assertions.units[0].claims[0].mode=mode;
   if(mode==='reported'){r.assertions.units[0].claims[0].scope.attribution='布莱特';r.assertions.units[0].claims[0].scopeSpans.attribution=r.assertions.units[0].claims[0].argumentSpans.speaker;}return r;}),k=f.create();
  assert.equal((await k.observeDialogue(f.source())).pending.length,1);assert.equal(facts(k,'huang').length,0);
 }
});
