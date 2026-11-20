import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as dialogue from './story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from './story-knowledge.mjs';
import {createOpeningFixture} from './opening.mjs';
const text='甲向乙说：“渡口停航，改走山路。”乙听清了前半句，后半句是否听清不明。';
const actors={a:'甲',b:'乙',c:'丙'},span=q=>({documentId:'current',start:text.indexOf(q),end:text.indexOf(q)+q.length,quote:q}),full=span(text);
const options={sourceAnchor:{chatId:'bound.test',messageId:0,swipeId:0,text},history:[],actors,facts:{},memory:null};
const claim=(id='speech',content='渡口停航')=>({id,type:'utterance',args:{speaker:'甲',content},argumentSpans:{speaker:span('甲'),content:span(content)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:span('甲向乙说：“渡口停航，改走山路。”')});
const receipt=(id='r',status='received')=>({id,speakerId:'a',recipientIds:['b'],recipientSpans:[span('乙')],evidence:span(status==='uncertain'?'后半句是否听清不明':'乙听清了前半句'),status,propositionRef:null,reason:''});
function wire(p){return {schemaVersion:'dialogue-reception/2',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],utterances:[{claim:claim(),receptions:[receipt()]}],unresolved:[],coverage:{status:'recorded',evidence:structuredClone(full),reason:'前半句明确接收'}}]};}
const prepare=()=>dialogue.prepareBoundDialogueExtraction(options);

const withoutDescriptions=value=>Array.isArray(value)?value.map(withoutDescriptions):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([k])=>k!=='description').map(([k,v])=>[k,withoutDescriptions(v)])):value;
const expandUnitBranches=format=>{
 const copy=structuredClone(format),items=copy.json_schema.schema.properties.units.items;
 if(items.properties){const {anyOf,...common}=items;copy.json_schema.schema.properties.units.items={anyOf:anyOf.map(branch=>({...common,properties:{...common.properties,...branch.properties}}))};}
 for(const unit of copy.json_schema.schema.properties.units.items.anyOf){const p=unit.properties.utterances.items.properties.receptions.items.properties;if(p.evidence.properties){assert.deepEqual(withoutDescriptions(p.evidence),copy.json_schema.schema.$defs.assertionSpan);p.evidence={$ref:'#/$defs/assertionSpan'};}}
 return copy;
};
test('bound unit schema factors shared fields once without weakening either status branch',async()=>{
 const p=await prepare(),items=p.responseFormat.json_schema.schema.properties.units.items;
 assert.ok(items.properties?.utterances);assert.equal(items.anyOf.length,2);
 assert.deepEqual(Object.keys(items.properties),['id','status','coverage','unresolved','claims','utterances']);
 assert.ok(items.anyOf.every(b=>!b.properties.utterances));
 const old=expandUnitBranches(p.responseFormat),values=[];
 for(const status of ['extracted','unresolved','other',null])for(const unresolved of [[],[{span:full,reason:'未知'}],null]){
  const v=wire(p);v.units[0].status=status;v.units[0].unresolved=unresolved;values.push(v);
 }
 for(const mutate of [v=>delete v.units[0].coverage,v=>v.units.push(null),v=>v.units[0].extra=1,v=>v.units=[],v=>v.units[0].utterances[0].claim.type='action']){const v=wire(p);mutate(v);values.push(v);}
 const run=spawnSync('python',['-c','import sys,json,jsonschema\nx=json.loads(sys.stdin.buffer.read());a=jsonschema.Draft202012Validator(x["a"]);b=jsonschema.Draft202012Validator(x["b"]);assert all(a.is_valid(v)==b.is_valid(v) for v in x["values"])'],{input:JSON.stringify({a:p.responseFormat.json_schema.schema,b:old.json_schema.schema,values}),encoding:'utf8'});assert.equal(run.status,0,run.stderr);
});
test('bound prompt uses one output envelope while retaining shared field and coordinate contracts',async()=>{
 const p=await prepare(),legacy=await dialogue.prepareDialogueExtraction(options);
 assert.ok(!p.messages[0].content.includes('返回{schemaVersion:"gm-assertion-output/1"'));
 assert.ok(!p.messages[0].content.includes('每个target输出{id,status,claims,unresolved}'));
 assert.ok(p.messages[0].content.includes('units:[{id,status,coverage,unresolved,claims,utterances:[{claim,receptions}]}]'));
 assert.ok(p.messages[0].content.includes('scope和scopeSpans均有time/condition/attribution三键'));
 assert.ok(p.messages[0].content.includes('UTF-16'));assert.ok(legacy.messages[0].content.includes('返回{schemaVersion:"gm-assertion-output/1"'));
 assert.deepEqual(p.input,legacy.input);
});
test('bound schema carries recipient response evidence and new-message coverage at the responsible fields',async()=>{
 const p=await prepare(),schema=p.responseFormat.json_schema.schema;
 for(const unit of [schema.properties.units.items]){
  const r=unit.properties.utterances.items.properties.receptions.items.properties;
  assert.match(r.recipientSpans.description,/应答/);assert.match(r.recipientSpans.description,/说话者/);
  assert.match(r.evidence.description,/接收/);assert.match(r.propositionRef.description,/不是/);
  // The existing host resolves a $ref by replacing the whole node, dropping
  // sibling descriptions. This annotated span must survive that projection.
  assert.ok(r.evidence.properties?.quote);assert.equal(r.evidence.$ref,undefined);
  assert.deepEqual(withoutDescriptions(r.evidence),schema.$defs.assertionSpan);
  assert.match(unit.properties.utterances.description,/漏/);assert.match(unit.properties.coverage.description,/未发生/);
 }
 // Annotation-only: the existing wire and strict validation remain identical.
 const previous=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/implicit-reception-20261115/before/story-dialogue-knowledge.mjs',import.meta.url);
 const source=await readFile(previous,'utf8');assert.ok(source.includes("const boundContract='dialogue-reception/2'"));
 const original=wire(p),copy=structuredClone(original);assert.deepEqual(p.check(original).receptions[0].recipientIds,['b']);assert.deepEqual(original,copy);
});

test('bounded reception narrows generation scope and supplies exact source ranges without accepting old wrong spans',async()=>{
 const p=await prepare(),legacy=await dialogue.prepareDialogueExtraction(options),ref=JSON.parse(p.messages[2].content);
 assert.deepEqual(p.input,legacy.input);assert.equal(p.messages[1].content,legacy.messages[1].content);
 assert.ok(p.messages[0].content.startsWith('只识别与信息传递相关的言说'));
 assert.equal(ref.targets[0].span.quote,text);assert.deepEqual(p.check(wire(p)).receptions[0].recipientIds,['b']);
 const bad=wire(p);bad.units[0].coverage.evidence.end--;const before=structuredClone(bad);
 assert.throws(()=>p.check(bad),/Invalid reception coverage/);assert.deepEqual(bad,before);
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/live-model-20261115/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('A1.reception.request.json',dir),'utf8')),raw=await readFile(new URL('A1.reception.content.txt',dir),'utf8');
 const actual=await dialogue.prepareBoundDialogueExtraction(JSON.parse(request.messages[1].content));
 assert.throws(()=>actual.check(JSON.parse(raw)),/Invalid reception coverage/);
 assert.equal(await readFile(new URL('A1.reception.content.txt',dir),'utf8'),raw);
});
test('bound prompt retains the existing direct-reception rule without changing schema, input or other guidance',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/bound-receptions-live-20261114/live/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('02-received-rumor.request.json',base),'utf8'));
 const input=JSON.parse(request.messages[1].content),legacy=await dialogue.prepareDialogueExtraction(input),bound=await dialogue.prepareBoundDialogueExtraction(input);
 const rule='明确直接向某人说出且没有接收障碍可以received，不强求复述确认；计划、假设、内心话不算接收。';
 assert.ok(legacy.messages[0].content.includes(rule));assert.ok(bound.messages[0].content.includes(rule));
 assert.ok(bound.messages[0].content.startsWith('只识别与信息传递相关的言说'));
 assert.deepEqual(bound.input,legacy.input);
 assert.deepEqual(bound.messages[1],request.messages[1]);assert.deepEqual(JSON.parse(bound.messages[2].content).documents.map(d=>d.blocks),JSON.parse(request.messages[2].content).documents.map(d=>d.blocks));assert.deepEqual(withoutDescriptions(expandUnitBranches(bound.responseFormat)),withoutDescriptions(request.response_format));
 // The old semantic failure remains unchanged and uncertain, never repaired by preparation/checking.
 const raw=await readFile(new URL('02-received-rumor.content.txt',base),'utf8'),reply=JSON.parse(raw),before=structuredClone(reply);
 const checked=bound.check(reply);assert.equal(checked.receptions[0].status,'uncertain');assert.equal(checked.coverage[0].status,'uncertain');
 assert.deepEqual(reply,before);assert.equal(await readFile(new URL('02-received-rumor.content.txt',base),'utf8'),raw);
});
test('existing fact index does not limit new dialogue reception and never fills a false none',async()=>{
 const p=await prepare(),legacy=await dialogue.prepareDialogueExtraction(options);
 const rule='facts是已有命题索引，不是本轮接收范围；propositionRef仅在内容与已有命题一致时引用其ID，否则null表示新的有来源说法；转述与谎言不自动确认内容为真。';
 assert.ok(p.messages[0].content.includes(rule));assert.ok(legacy.messages[0].content.includes(rule.split('；').slice(1).join('；')));
 const checked=p.check(wire(p));assert.equal(checked.receptions[0].propositionRef,null);
 const none=wire(p);none.units[0].utterances=[];none.units[0].coverage.status='none';
 assert.deepEqual(p.check(none).receptions,[]);assert.equal(p.check(none).semanticCompletenessVerified,false);
});
test('direct speech needs no acknowledgement; explicit obstruction and uncertainty retain their own outcomes',async()=>{
 for(const scenario of [
  {text:'甲对乙说：“渡口停航。”',status:'received',evidence:'甲对乙说：“渡口停航。”',known:1,pending:0},
  {text:'甲对乙说：“渡口停航。”乙没有听见。',status:'not_received',evidence:'乙没有听见',known:0,pending:0},
  {text:'甲对乙说：“渡口停航。”无法确定乙是否听见。',status:'uncertain',evidence:'无法确定乙是否听见',known:0,pending:1}
 ]){
  const at=q=>({documentId:'current',start:scenario.text.indexOf(q),end:scenario.text.indexOf(q)+q.length,quote:q});
  const chat=[{mes:scenario.text,is_user:false,swipe_id:0}],floors={0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'bound.test',actors:createOpeningFixture().actors,operations:{}}}}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(v,{message_id})=>{floors[message_id]=structuredClone(v);}};
  const tavern={chatId:'bound.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};
  let returned;
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async request=>{
   const input=JSON.parse(request.messages[1].content),speech={id:'speech',type:'utterance',args:{speaker:'甲',content:'渡口停航。'},argumentSpans:{speaker:at('甲'),content:at('渡口停航。')},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:at('甲对乙说：“渡口停航。”')};
   returned={schemaVersion:'dialogue-reception/2',contextRef:input.contextRef,inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],utterances:[{claim:speech,receptions:[{id:'r',speakerId:'a',recipientIds:['b'],recipientSpans:[at('乙')],evidence:at(scenario.evidence),status:scenario.status,propositionRef:null,reason:''}]}],unresolved:[],coverage:{status:scenario.status==='uncertain'?'uncertain':'recorded',evidence:at(scenario.text),reason:'按本轮实际接收依据记录'}}]};
   return structuredClone(returned);
  }});
  const k=createStoryKnowledgeRuntime({catalog:{id:'bound.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'bound.test',messageId:0,swipeId:0}),dialogue:adapter});
  const result=await k.observeDialogue({...options.sourceAnchor,text:scenario.text});
  assert.equal(k.context().actorKnowledge.find(a=>a.actorId==='b').facts.length,scenario.known);assert.equal(result.pending.length,scenario.pending);
  assert.deepEqual(k.dialogueQuestions([]),[]);assert.equal(returned.units[0].utterances[0].receptions[0].status,scenario.status);assert.equal(chat[0].mes,scenario.text);
 }
});
test('bound utterance maps only explicit nested receipts and retains mandatory coverage',async()=>{
 const p=await prepare(),w=wire(p),before=structuredClone(w),checked=p.check(w);
 assert.deepEqual(w,before);assert.deepEqual(checked.assertions.units[0].claims,[w.units[0].utterances[0].claim]);
 assert.deepEqual(checked.receptions,[{...receipt(),claimId:'speech'}]);assert.deepEqual(checked.coverage,[{targetId:'turn',...w.units[0].coverage}]);
 assert.equal(p.responseFormat.json_schema.strict,true);
});
test('action, forged reference, missing receipts and omitted target coverage reject without mutation',async()=>{
 const p=await prepare();
 for(const change of [w=>w.units[0].utterances[0].claim.type='action',w=>w.units[0].utterances[0].receptions[0].claimId='other',w=>delete w.units[0].coverage,w=>w.units[0].utterances[0].receptions=[],w=>w.units=[],w=>w.units.push(structuredClone(w.units[0])),w=>w.units[0].coverage.evidence.quote='假的']){
  const w=wire(p);change(w);const before=structuredClone(w);assert.throws(()=>p.check(w));assert.deepEqual(w,before);
 }
});
test('uncertain coverage preserves explicit partial receipt plus uncertainty without blanket blocking',async()=>{
 const p=await prepare(),w=wire(p);w.units[0].utterances.push({claim:claim('second','改走山路'),receptions:[receipt('r2','uncertain')]});w.units[0].coverage.status='uncertain';
 const checked=p.check(w);assert.deepEqual(checked.receptions.map(r=>r.status),['received','uncertain']);assert.equal(checked.assertions.units[0].unresolved.length,0);
 w.units[0].coverage.status='recorded';assert.throws(()=>p.check(w));
});
test('none and unresolved-only coverage require actual source evidence, never synthesize receipts',async()=>{
 const p=await prepare(),none=wire(p);none.units[0].utterances=[];none.units[0].coverage={status:'none',evidence:full,reason:'模型声称无相关接收'};
 const checked=p.check(none);assert.deepEqual(checked.receptions,[]);assert.deepEqual(checked.assertions.units[0].unresolved,[]);
 // A source-backed but semantically false none statement is not an approval.
 assert.equal(checked.semanticCompletenessVerified,false);assert.equal(checked.canApprove,false);
 const unknown=structuredClone(none);unknown.units[0].status='unresolved';unknown.units[0].coverage.status='uncertain';unknown.units[0].unresolved=[{span:span('后半句是否听清不明'),reason:'无法判定接收'}];
 assert.equal(p.check(unknown).assertions.units[0].unresolved.length,1);assert.equal(p.check(unknown).receptions.length,0);
 unknown.units[0].unresolved=[];unknown.units[0].status='extracted';assert.throws(()=>p.check(unknown));
});
test('original source, role, null-pair and identity checks remain in force',async()=>{
 const p=await prepare();
 for(const change of [w=>w.units[0].utterances[0].claim.argumentSpans.content=null,w=>w.units[0].utterances[0].claim.scope.time=full,w=>w.units[0].utterances[0].claim.argumentSpans.content.start++,w=>w.units[0].utterances[0].receptions[0].recipientIds=['missing'],w=>w.units[0].utterances[0].receptions[0].recipientSpans=[]]){const w=wire(p);change(w);assert.throws(()=>p.check(w));}
});
test('schema rejects nested action and missing coverage and allows explicit none and uncertainty',async()=>{
 const p=await prepare(),cases=[{value:wire(p),valid:true}];const bad=wire(p);bad.units[0].utterances[0].claim.type='action';cases.push({value:bad,valid:false});
 const missing=wire(p);delete missing.units[0].coverage;cases.push({value:missing,valid:false});
 const none=wire(p);none.units[0].utterances=[];none.units[0].coverage.status='none';cases.push({value:none,valid:true});
 const r=spawnSync('python',['-c','import sys,json,jsonschema\nd=json.loads(sys.stdin.buffer.read().decode("utf-8"));jsonschema.Draft202012Validator.check_schema(d["schema"])\nfor c in d["cases"]: assert jsonschema.Draft202012Validator(d["schema"]).is_valid(c["value"]) == c["valid"]'],{input:JSON.stringify({schema:p.responseFormat.json_schema.schema,cases}),encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});
test('model adapter uses version2 and original MVU path persists coverage and independent known/pending rows',async()=>{
 const chat=[{mes:text,is_user:false,swipe_id:0}],floors={0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'bound.test',actors:createOpeningFixture().actors,operations:{}}}}};
 const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(v,{message_id})=>{floors[message_id]=structuredClone(v);}};
 const tavern={chatId:'bound.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};let calls=0;
 const adapter=dialogue.createDialogueSemanticAdapter({complete:async request=>{calls++;assert.equal(request.responseFormat.json_schema.name,'dialogue_reception_v2');const p=await prepare(),input=JSON.parse(request.messages[1].content),w=wire({...p,input});w.units[0].utterances.push({claim:claim('second','改走山路'),receptions:[receipt('r2','uncertain')]});w.units[0].coverage.status='uncertain';return JSON.stringify(w);}});
 const k=createStoryKnowledgeRuntime({catalog:{id:'bound.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'bound.test',messageId:0,swipeId:0}),dialogue:adapter});
 const result=await k.observeDialogue(options.sourceAnchor);assert.equal(calls,1);assert.equal(result.pending.length,1);assert.equal(k.context().actorKnowledge.find(a=>a.actorId==='b').facts.length,1);
 assert.equal(Object.values(k.read().dialogueBatches)[0].receptionCoverage[0].status,'uncertain');assert.equal(k.dialogueQuestions([]).length,0);
 await k.observeDialogue(options.sourceAnchor);assert.equal(calls,1);assert.equal(chat[0].mes,text);
});
test('historical flat failures are retained and cannot silently enter the new wire',async()=>{
 const base=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/reception-coverage-20261114/live/',import.meta.url);
 for(const id of ['02-received-rumor','05-partial-first','07-ambiguous-hearing']){const req=JSON.parse(await readFile(new URL(id+'.request.json',base),'utf8')),raw=await readFile(new URL(id+'.content.txt',base),'utf8'),value=JSON.parse(raw),p=await dialogue.prepareBoundDialogueExtraction(JSON.parse(req.messages[1].content));assert.throws(()=>p.check(value));assert.equal(await readFile(new URL(id+'.content.txt',base),'utf8'),raw);}
});

test('model-path invalid coverage writes nothing; explicit unreceived and none never grant or ask',async()=>{
 for(const mode of ['missing-coverage','action-parent','not-received','none']){
  const chat=[{mes:text,is_user:false,swipe_id:0}],floors={0:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'bound.test',actors:createOpeningFixture().actors,operations:{}}}}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(v,{message_id})=>{floors[message_id]=structuredClone(v);}};
  const tavern={chatId:'bound.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};let calls=0;
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async request=>{calls++;const input=JSON.parse(request.messages[1].content),w=wire({input});
   if(mode==='missing-coverage')delete w.units[0].coverage;
   if(mode==='action-parent')w.units[0].utterances[0].claim.type='action';
   if(mode==='not-received')w.units[0].utterances[0].receptions[0].status='not_received';
   if(mode==='none'){w.units[0].utterances=[];w.units[0].coverage={status:'none',evidence:full,reason:'仅用于无事件结构的隔离反例'};}
   return w;
  }});
  const k=createStoryKnowledgeRuntime({catalog:{id:'bound.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'bound.test',messageId:0,swipeId:0}),dialogue:adapter});
  if(['missing-coverage','action-parent'].includes(mode)){await assert.rejects(k.observeDialogue(options.sourceAnchor));assert.equal(floors[0].stat_data['901_rules_poc'].revision,0);}
  else {assert.equal((await k.observeDialogue(options.sourceAnchor)).pending.length,0);assert.equal(Object.values(k.read().dialogueBatches)[0].receptionCoverage[0].status,mode==='none'?'none':'recorded');}
  assert.equal(calls,1);assert.ok(k.context().actorKnowledge.every(a=>a.facts.length===0));assert.deepEqual(k.dialogueQuestions([]),[]);
 }
});

test('planned speech keeps original intent claim and none coverage without creating utterance',async()=>{
 const plannedText='甲打算把消息告诉乙，但还没有开口。',at=q=>({documentId:'current',start:plannedText.indexOf(q),end:plannedText.indexOf(q)+q.length,quote:q});
 const p=await dialogue.prepareBoundDialogueExtraction({...options,sourceAnchor:{...options.sourceAnchor,text:plannedText}});
 const intent={id:'intent',type:'state',args:{entity:'甲',name:'意图',value:'把消息告诉乙'},argumentSpans:{entity:at('甲'),name:at('打算'),value:at('把消息告诉乙')},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:at(plannedText)};
 const w={schemaVersion:'dialogue-reception/2',contextRef:p.input.contextRef,inputRef:p.input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[intent],utterances:[],unresolved:[],coverage:{status:'none',evidence:at('还没有开口'),reason:'只有意图，传达尚未发生'}}]};
 const result=p.check(w);assert.deepEqual(result.assertions.units[0].claims,[intent]);assert.deepEqual(result.receptions,[]);assert.equal(result.coverage[0].reason,w.units[0].coverage.reason);
});

test('existing Tavern completion maps exact messages and schema without settings or response repair',async()=>{
 const p=await prepare();let listener,removed=false,seen;
 const complete=dialogue.createTavernDialogueCompletion({event:'settings',eventOn:(_,fn)=>{listener=fn;},eventRemoveListener:(_,fn)=>{assert.equal(fn,listener);removed=true;},generateRaw:async config=>{
  assert.deepEqual(config.ordered_prompts,p.messages);assert.equal(config.max_chat_history,0);assert.equal(config.should_stream,false);assert.equal(config.custom_api,undefined);
  seen={messages:[...p.messages,{role:'system',content:'host injection'}],temperature:.7,custom_prompt_post_processing:'merge'};listener(seen);
  return ' invalid raw JSON ';
 }});
 assert.equal(await complete({purpose:'dialogue-reception',messages:p.messages,responseFormat:p.responseFormat}),' invalid raw JSON ');
 assert.deepEqual(seen.messages,p.messages);assert.deepEqual(seen.json_schema,{name:p.responseFormat.json_schema.name,value:p.responseFormat.json_schema.schema,strict:true});assert.equal(seen.temperature,.7);assert.equal(seen.custom_prompt_post_processing,'');assert.ok(removed);
});

test('listener references can ground a current reply but cannot refer to its speaker',async()=>{
 const p=await prepare();assert.match(p.responseFormat.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items.properties.recipientSpans.description,/不是引用说话者/);
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 for(const id of ['A.scene2.reception','B.retry2.reception','B.retry3.reception','A1.reception.r2']){
  const req=JSON.parse(await readFile(new URL(id+'.request.json',dir),'utf8')),raw=await readFile(new URL(id+'.content.txt',dir),'utf8');
  const prepared=await dialogue.prepareBoundDialogueExtraction(JSON.parse(req.messages[1].content)),result=prepared.check(JSON.parse(raw));
  assert.equal(result.semanticCompletenessVerified,false);assert.equal(await readFile(new URL(id+'.content.txt',dir),'utf8'),raw);
 }
});

test('implicit response positive and obstacle/ambiguity/unsaid controls use original receipts without filling gaps',async()=>{
 const cases=[
  {text:'甲答道：“渡口停航。”',quote:'渡口停航。',status:'received',ids:['b'],known:1,pending:0},
  {text:'乙已经离开，没听见甲回答：“渡口停航。”',quote:'渡口停航。',status:'not_received',ids:['b'],known:0,pending:0},
  {text:'甲答道：“渡口停航。”乙和丙中只有一人听清，但无法确定是谁。',quote:'渡口停航。',status:'uncertain',ids:[],known:0,pending:1},
  {text:'甲心里拟好回答，却一直没有开口。',quote:null,status:null,ids:[],known:0,pending:0},
 ];
 for(const scenario of cases){
  const at=q=>({documentId:'current',start:scenario.text.indexOf(q),end:scenario.text.indexOf(q)+q.length,quote:q});
  const chat=[{mes:'乙问甲：“渡口现在怎样？”',is_user:true},{mes:scenario.text,is_user:false,swipe_id:0}];
  const floors={1:{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'bound.test',actors:createOpeningFixture().actors,operations:{}}}}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]),replaceMvuData:async(v,{message_id})=>{floors[message_id]=structuredClone(v);}};
  const tavern={chatId:'bound.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map((m,i)=>({...m,variables:[structuredClone(floors[i])]}))]};let returned;
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async request=>{
   const input=JSON.parse(request.messages[1].content);
   const item=scenario.quote?{claim:{...claim('speech',scenario.quote),argumentSpans:{speaker:at('甲'),content:at(scenario.quote)},anchor:at(scenario.text)},receptions:[{id:'receipt',speakerId:'a',recipientIds:scenario.ids,recipientSpans:scenario.ids.map(()=>scenario.status==='received'?at(scenario.quote):at('乙')),evidence:at(scenario.text),status:scenario.status,propositionRef:null,reason:'依当前回应与实际障碍分别处理'}]}:null;
   returned={schemaVersion:'dialogue-reception/2',contextRef:input.contextRef,inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],utterances:item?[item]:[],unresolved:[],coverage:{status:scenario.status==='uncertain'?'uncertain':item?'recorded':'none',evidence:at(scenario.text),reason:'本轮实际言说与接收范围'}}]};
   return structuredClone(returned);
  }});
  const k=createStoryKnowledgeRuntime({catalog:{id:'bound.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'bound.test',messageId:1,swipeId:0}),dialogue:adapter});
  const result=await k.observeDialogue({chatId:'bound.test',messageId:1,swipeId:0,text:scenario.text});
  assert.equal(k.context().actorKnowledge.find(a=>a.actorId==='b').facts.length,scenario.known);assert.equal(result.pending.length,scenario.pending);
  assert.deepEqual(k.dialogueQuestions([]),[]);assert.equal(chat[1].mes,scenario.text);
  assert.equal(k.context().actorKnowledge.find(a=>a.actorId==='c').facts.length,0);
  assert.equal(returned.units[0].utterances.length,scenario.quote?1:0);
 }
});
test('spoken content excludes intervening narration while source checks remain unchanged',async()=>{
 const source='甲对乙说：“渡口停航。”甲收起地图，接着说：“明早再问。”';
 const at=q=>({documentId:'current',start:source.indexOf(q),end:source.indexOf(q)+q.length,quote:q});
 const p=await dialogue.prepareBoundDialogueExtraction({...options,sourceAnchor:{...options.sourceAnchor,text:source}});
 assert.ok(p.messages[0].content.includes('content及argumentSpans.content只覆盖实际说出口的连续原文'));
 const w=wire(p);w.units[0].coverage.evidence=at(source);w.units[0].utterances=['渡口停航。','明早再问。'].map((q,i)=>({claim:{...claim('s'+i,q),argumentSpans:{speaker:at('甲'),content:at(q)},anchor:at(source)},receptions:[{...receipt('r'+i),recipientSpans:[at('乙')],evidence:at(source)}]}));
 const before=structuredClone(w),checked=p.check(w);assert.deepEqual(w,before);assert.deepEqual(checked.assertions.units[0].claims.map(c=>c.argumentSpans.content.quote),['渡口停航。','明早再问。']);
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 const request=JSON.parse(await readFile(new URL('B.scene2.reception.request.json',dir),'utf8')),raw=await readFile(new URL('B.scene2.reception.content.txt',dir),'utf8');
 const failed=await dialogue.prepareBoundDialogueExtraction(JSON.parse(request.messages[1].content));
 const result=failed.check(JSON.parse(raw));assert.equal(result.semanticCompletenessVerified,false);assert.equal(await readFile(new URL('B.scene2.reception.content.txt',dir),'utf8'),raw);
});

test('reception evidence distinguishes identity from reception and limits reused evidence to its supported scope',async()=>{
 const p=await prepare(),r=p.responseFormat.json_schema.schema.properties.units.items.properties.utterances.items.properties.receptions.items.properties;
 assert.ok(r.evidence.description.includes('识别听者不等于证明接收'));
 assert.ok(r.evidence.description.includes('不按引用字数判断充分性'));
 assert.ok(r.evidence.description.includes('不能把叙述位置直接当作听取起点'));
 assert.ok(r.evidence.description.includes('范围不明用uncertain'));
 assert.ok(r.reason.description.includes('多个内容范围共用依据'));
 assert.ok(p.messages[0].content.includes('明确直接向某人说出且没有接收障碍可以received，不强求复述确认'));
 // No new minimum quote length or semantic validator: literal citation checks stay strict.
 assert.deepEqual(withoutDescriptions(r.evidence),p.responseFormat.json_schema.schema.$defs.assertionSpan);
 assert.deepEqual(withoutDescriptions(r.reason),{type:'string'});
});

test('reused listening evidence preserves explicit full, limited, unknown and absent reception through existing MVU',async()=>{
 const cases=[
  {tail:'丙从头到尾听清了两句。',statuses:['received','received'],known:['渡口停航。','明早改走山路。'],pending:0},
  {tail:'丙第一句没听见，只听清了第二句。',statuses:['not_received','received'],known:['明早改走山路。'],pending:0},
  {tail:'丙正在旁听，无法确定听到了哪句。',statuses:['uncertain','uncertain'],known:[],pending:2},
  {tail:'丙只听清了第一句，不确定第二句是否听见。',statuses:['received','uncertain'],known:['渡口停航。'],pending:1},
  {tail:'丙一直站在远处，两句都没听见。',statuses:['not_received','not_received'],known:[],pending:0},
 ];
 for(const c of cases){
  const source='甲对乙说：“渡口停航。”随后又说：“明早改走山路。”'+c.tail;
  const at=q=>({documentId:'current',start:source.indexOf(q),end:source.indexOf(q)+q.length,quote:q});
  const chat=[{mes:source,is_user:false,swipe_id:0}];let state={stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:'bound.test',actors:createOpeningFixture().actors,operations:{}}}},returned;
  const mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{state=structuredClone(v);}};
  const tavern={chatId:'bound.test',chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]};
  const adapter=dialogue.createDialogueSemanticAdapter({complete:async request=>{
   const input=JSON.parse(request.messages[1].content),items=['渡口停航。','明早改走山路。'].map((q,i)=>({claim:{...claim('s'+i,q),argumentSpans:{speaker:at('甲'),content:at(q)},anchor:at(source)},receptions:[
    {id:'direct'+i,speakerId:'a',recipientIds:['b'],recipientSpans:[at('乙')],evidence:at('甲对乙说：“渡口停航。”随后又说：“明早改走山路。”'),status:'received',propositionRef:null,reason:'直接告知，无接收障碍'},
    {id:'overheard'+i,speakerId:'a',recipientIds:['c'],recipientSpans:[at('丙')],evidence:at(c.tail),status:c.statuses[i],propositionRef:null,reason:'依据中的逐句范围分别对应当前内容'}
   ]}));
   returned={schemaVersion:'dialogue-reception/2',contextRef:input.contextRef,inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],utterances:items,unresolved:[],coverage:{status:c.pending?'uncertain':'recorded',evidence:at(source),reason:'逐人逐内容记录范围'}}]};return structuredClone(returned);
  }});
  const k=createStoryKnowledgeRuntime({catalog:{id:'bound.catalog',actors,facts:[]},mvu,tavern,getAnchor:()=>({chatId:'bound.test',messageId:0,swipeId:0}),dialogue:adapter});
  const result=await k.observeDialogue({...options.sourceAnchor,text:source});
  const messages=id=>k.context().actorKnowledge.find(a=>a.actorId===id).facts.map(f=>f.content.text);
  assert.deepEqual(messages('c'),c.known);assert.equal(messages('b').length,2);assert.equal(result.pending.length,c.pending);
  assert.deepEqual(k.dialogueQuestions([]),[]);assert.equal(chat[0].mes,source);
  assert.deepEqual(returned.units[0].utterances.map(u=>u.receptions[1].status),c.statuses);
 }
});

test('historical short evidence and blanket overhearing remain preserved rather than silently corrected',async()=>{
 const dir=new URL('../../replay_research/gm_style/v1/live_acceptance_20261030/clinic-knowledge-20261112/dialogue-increment-live-20261114/integration-20261115/iteration-200-20261115/',import.meta.url);
 const req=JSON.parse(await readFile(new URL('omission.original.nested.request.json',dir),'utf8')),raw=await readFile(new URL('omission.original.nested.content.txt',dir),'utf8'),w=JSON.parse(raw),before=structuredClone(w);
 const p=await dialogue.prepareBoundDialogueExtraction(JSON.parse(req.messages[1].content)),checked=p.check(w);
 assert.equal(checked.semanticCompletenessVerified,false);assert.deepEqual(w,before);
 assert.ok(checked.receptions.some(r=>r.evidence.quote==='你'));
 assert.equal(checked.receptions.filter(r=>r.recipientIds.includes('bright')&&r.status==='received').length,3);
 assert.equal(await readFile(new URL('omission.original.nested.content.txt',dir),'utf8'),raw);
});
