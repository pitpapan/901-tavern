// Local preparation/replay only. Network remains in the existing budgeted runner.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {prepareBoundDialogueExtraction,prepareScopedDialogueExtraction,prepareSelectedDialogueExtraction,prepareRelatedDialogueExtraction,createDialogueSemanticAdapter} from '../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from '../../../../../../../rules_engine/gm_runtime/story-knowledge.mjs';
import {createOpeningFixture} from '../../../../../../../rules_engine/gm_runtime/opening.mjs';
const E=new URL('./',import.meta.url),N=new URL(process.env.DIALOGUE_EVIDENCE_DIR??'implicit-reception-20261115/',E),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),put=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n');
const strip=v=>Array.isArray(v)?v.map(strip):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>k!=='description').map(([k,x])=>[k,strip(x)])):v;
const normalized=format=>{const copy=structuredClone(format),items=copy.json_schema.schema.properties.units.items;if(items.properties){const {anyOf,...common}=items;copy.json_schema.schema.properties.units.items={anyOf:anyOf.map(b=>({...common,properties:{...common.properties,...b.properties}}))};}return strip(copy);};
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
const [mode,id,source]=process.argv.slice(2);
if(mode==='refresh'){
 const original=await read(new URL(source+'.prepared.json',N)),p=await prepareBoundDialogueExtraction(JSON.parse(original.messages[1].content));
 assert.equal(p.messages[1].content,original.messages[1].content);assert.deepEqual(p.messages.slice(2),original.messages.slice(2));
 const format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
 assert.deepEqual(normalized(format),normalized(original.response_format));
 await writeFile(new URL(id+'.prepared.json',N),JSON.stringify({...original,messages:p.messages,response_format:format}),{flag:'wx'});
 console.log(JSON.stringify({id,source,inputCoordinatesParametersAndSchemaConstraintsUnchanged:true,fieldDescriptionsChanged:JSON.stringify(format)!==JSON.stringify(original.response_format)}));
}else if(mode==='freeze'){
 const original=await read(new URL('B.retry3.reception.request.json',I)),oldA=await read(new URL('A1.reception.r2.request.json',I));
 const b=JSON.parse(original.messages[1].content);
 const cases=[
  {id:'implicit.original',request:original,expected:'原349/350同输入：两段实际回答分别收到player；recipientSpans为回答原文或确切应答关系，不是speaker代词/语气；bright不授予，不继承旧车声障碍。'},
  {id:'omission.original',request:oldA,expected:'原338同输入：不得因clinic事实目录不匹配而none，保留实际否认提过消息/先前问路安排的说法；御临风实际接收，布莱特只在明确侧耳听两人动静范围判断；问句不批准新世界事实。'},
  {id:'implicit.parallel',history:'黄泉，库房今晚什么时候关门？',text:'黄泉把钥匙收进袖袋，答道：“日落后就锁门。”她稍作停顿，又补了一句：“明早再来吧。”',expected:'两片回答给player，不能指向她/黄泉作为听者，不能漏第二片；bright未知。'},
  {id:'implicit.obstacle',history:'黄泉，库房今晚什么时候关门？',text:'御临风问完便走远，已听不到这里的声音。黄泉没有察觉，仍答道：“日落后就锁门。”',expected:'实际说出但player明确未收到，不因问答关系而received，无知情增量。'},
  {id:'implicit.ambiguous',history:'御临风和布莱特先后问黄泉库房什么时候关门。',text:'黄泉答道：“日落后就锁门。”两人中只有一人听见，无法确定是谁。',expected:'保留unknown listener，recipientIds空/uncertain或unresolved，无授予，待核且无关时不询问。'},
  {id:'implicit.partial',history:'黄泉，库房什么时候关门，明早在哪里碰头？',text:'黄泉答道：“日落后锁门，明早在渡口碰头。”御临风只听清前半句，后半句被钟声盖住。',expected:'前半日落后锁门received/player；后半明早渡口明确not_received，不给全句，不凭空uncertain。'},
  {id:'implicit.unsaid',history:'黄泉，库房今晚什么时候关门？',text:'黄泉心里拟好了“日落后就锁门”的回答，却始终没有开口。',expected:'不因有历史问题/引号而登记实际接收，无新增知情或凭空待核。'},
  {id:'omission.parallel',history:'黄泉，刚才你要补充的消息是什么？',text:'黄泉摇头：“我没说有别的消息。”她想了想，又答：“只是外面的桥正在修，暂时别从那边走。”',expected:'两片实际回答都覆盖，否定有别的消息不等于未发生言说，桥修新消息propositionRef null，不局限clinic目录。'},
  {id:'implicit.npc_question',history:'布莱特问黄泉：“库房今晚什么时候关门？”御临风在远处，听不到这里。',text:'黄泉答道：“日落后就锁门。”',expected:'通过history中明确说话者识别bright提问，不把user楼层一律映射player；bright收到player不收。'},
  {id:'implicit.unrelated',history:'黄泉，库房今晚什么时候关门？',text:'黄泉没有回答，只在心里盘算归程。街另一端，布莱特独自低声念道：“渡口停航。”其他人都没有听到。',expected:'不能把历史提问和当前无关独语连成回答；无任何接收授予，不能漏实际未被收到的言说记录。'},
 ];
 for(const c of cases){
  if(!c.request){const input={sourceAnchor:{...b.sourceAnchor,chatId:'implicit.offline.'+c.id,messageId:1,text:c.text},history:[{messageId:0,role:'user',text:c.history}],actors:b.actors,facts:b.facts,memory:null};const p=await prepareBoundDialogueExtraction(input);c.request={...original,messages:p.messages,response_format:p.responseFormat};}
  const p=await prepareBoundDialogueExtraction(JSON.parse(c.request.messages[1].content)),format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
  if(c.id.endsWith('.original')){assert.equal(p.messages[1].content,c.request.messages[1].content);assert.deepEqual(p.messages.slice(2),c.request.messages.slice(2));assert.deepEqual(strip(format),strip(c.request.response_format));}
  const request={...c.request,messages:p.messages,response_format:format};
  await writeFile(new URL(c.id+'.prepared.json',N),JSON.stringify(request),{flag:'wx'});
 }
 await put(new URL('cases.json',N),cases.map(({request,...c})=>c));
 console.log(JSON.stringify({frozen:cases.length,originalInputsUnchanged:2,originalSchemaConstraintsUnchanged:true}));
}else if(mode==='check'){
 const request=await read(new URL(id+'.request.json',I)),raw=await readFile(new URL(id+'.content.txt',I),'utf8');
 // Historical offline replay selects the recorded contract explicitly. The
 // production adapter never falls back based on the returned model content.
 const v5=request.response_format.json_schema.name==='dialogue_reception_v5',v4=request.response_format.json_schema.name==='dialogue_reception_v4',v3=request.response_format.json_schema.name==='dialogue_reception_v3',p=await (v5?prepareRelatedDialogueExtraction:v4?prepareSelectedDialogueExtraction:v3?prepareScopedDialogueExtraction:prepareBoundDialogueExtraction)(JSON.parse(request.messages[1].content));
 const report={id,exactCurrentMessages:JSON.stringify(request.messages)===JSON.stringify(p.messages)};
 try{
  const value=await createDialogueSemanticAdapter({outputContract:v5?'dialogue-reception/5':v4?'dialogue-reception/4':v3?'dialogue-reception/3':'dialogue-reception/2',complete:async()=>raw}).extract(p.input,p.messages,p.responseFormat),schemaResult=spawnSync('python',['-c','import sys,json,jsonschema\nx=json.loads(sys.stdin.buffer.read());errors=list(jsonschema.Draft202012Validator(x["schema"]).iter_errors(x["value"]));print(json.dumps([{ "path":list(e.path),"validator":e.validator,"message":e.message[:200]} for e in errors],ensure_ascii=True));sys.exit(bool(errors))'],{input:JSON.stringify({value,schema:request.response_format.json_schema.schema}),encoding:'utf8'});assert.equal(schemaResult.status,0,schemaResult.stdout);
  report.schemaPass=true;
  const checked=p.check(value);assert.equal(JSON.stringify(value),JSON.stringify(JSON.parse(raw)));report.structuralPass=true;report.checked=checked;report.receptionBindings=checked.receptionBindings;
 }catch(e){report.structuralPass=false;report.error=e.message;}
 let replayState,replayBefore,writes=0;
 try{
  const input=p.input,anchor=input.sourceAnchor,chat=Array.from({length:anchor.messageId+1},()=>({mes:'',is_user:false}));
  for(const h of input.history)chat[h.messageId]={mes:h.text,is_user:h.role==='user'};chat[anchor.messageId]={mes:anchor.text,is_user:false,swipe_id:anchor.swipeId};
  const root={schemaVersion:1,revision:0,chatId:anchor.chatId,actors:createOpeningFixture().actors,operations:{}};
  replayState={stat_data:{'901_rules_poc':root}};replayBefore=structuredClone(replayState);
  const mvu={getMvuData:()=>structuredClone(replayState),replaceMvuData:async v=>{writes++;replayState=structuredClone(v);}};
  const tavern={chatId:anchor.chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(replayState)]}))]};
  const adapter=createDialogueSemanticAdapter({outputContract:v5?'dialogue-reception/5':v4?'dialogue-reception/4':v3?'dialogue-reception/3':'dialogue-reception/2',complete:async()=>raw,readMemory:async()=>input.memory});
  const k=createStoryKnowledgeRuntime({mvu,tavern,getAnchor:()=>({chatId:anchor.chatId,messageId:anchor.messageId,swipeId:anchor.swipeId}),catalog:{id:'implicit.regression',actors:input.actors,facts:Object.values(input.facts)},dialogue:adapter});
  // The real adapter consumes the unchanged raw text. Original context binding
  // includes the history window, reconstructed exactly for observeDialogue.
  await k.observeDialogue(anchor);
  report.knowledge=k.context().actorKnowledge;report.pending=Object.values(k.read().dialogueBatches).flatMap(b=>b.rows.filter(r=>r.status==='pending'));
  report.noQuestionWithoutDependency=k.dialogueQuestions([]).length===0;report.state=k.read();
 }catch(e){report.runtimeError=e.message;}
 report.mvuWrites=writes;report.replayStateUnchanged=JSON.stringify(replayState)===JSON.stringify(replayBefore);
 await put(new URL(id+'.check.json',N),report);
 console.log(JSON.stringify({id,schemaPass:report.schemaPass,structuralPass:report.structuralPass,error:report.error,runtimeError:report.runtimeError,mvuWrites:writes,replayStateUnchanged:report.replayStateUnchanged,utterances:report.checked?.assertions.units.flatMap(u=>u.claims.filter(c=>c.type==='utterance').map(c=>({id:c.id,mode:c.mode,text:c.argumentSpans.content?.quote}))),receipts:report.checked?.receptions.map(r=>({speaker:r.speakerId,to:r.recipientIds,content:r.contentSpan?.quote,status:r.status,refs:r.recipientSpans.map(s=>s.quote),evidence:r.evidence.quote,reason:r.reason,proposition:r.propositionRef})),knowledge:report.knowledge?.map(a=>({actor:a.actorId,messages:a.facts.map(f=>f.content)})),pending:report.pending?.map(r=>({id:r.id,to:r.recipientIds,content:r.content,span:r.contentSpan,reason:r.reason}))}));
}else throw Error('Unknown mode');
