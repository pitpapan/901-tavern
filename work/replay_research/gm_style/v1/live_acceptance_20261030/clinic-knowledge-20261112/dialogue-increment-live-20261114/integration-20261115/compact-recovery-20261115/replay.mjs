// Offline only. Actual network calls remain in the existing budgeted runner.
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {prepareCompactDialogueExtraction,createDialogueSemanticAdapter} from '../../../../../../../../rules_engine/gm_runtime/story-dialogue-knowledge.mjs';
import {createStoryKnowledgeRuntime} from '../../../../../../../../rules_engine/gm_runtime/story-knowledge.mjs';
import {createOpeningFixture} from '../../../../../../../../rules_engine/gm_runtime/opening.mjs';
const E=new URL('../',import.meta.url),N=new URL('./',import.meta.url),I=new URL('iteration-200-20261115/',E);
const read=async p=>JSON.parse(await readFile(p,'utf8')),put=(p,v)=>writeFile(p,JSON.stringify(v,null,2)+'\n');
const {flattenSchema}=await import(pathToFileURL((await read(new URL('browser-setup.json',E))).app+'/src/util.js'));
function make(input,{seed,complete,followup}){
 const anchor=input.sourceAnchor,chat=Array.from({length:anchor.messageId+1},()=>({mes:'',is_user:false}));
 for(const h of input.history)chat[h.messageId]={mes:h.text,is_user:h.role==='user'};
 chat[anchor.messageId]={mes:anchor.text,is_user:false,swipe_id:anchor.swipeId};
 if(followup!==undefined)chat.push({mes:followup,is_user:true,swipe_id:0});
 let state=structuredClone(seed??{stat_data:{'901_rules_poc':{schemaVersion:1,revision:0,chatId:anchor.chatId,actors:createOpeningFixture().actors,operations:{}}}}),writes=0,asked=0;
 const mvu={getMvuData:()=>structuredClone(state),replaceMvuData:async v=>{writes++;state=structuredClone(v);}};
 const tavern={chatId:anchor.chatId,chat,saveChat:async()=>{},readSavedChat:async()=>[{},...chat.map(m=>({...m,variables:[structuredClone(state)]}))]};
 const adapter=createDialogueSemanticAdapter({outputContract:'dialogue-reception/7',complete,readMemory:async()=>input.memory});
 const k=createStoryKnowledgeRuntime({mvu,tavern,getAnchor:()=>({chatId:anchor.chatId,messageId:chat.length-1,swipeId:chat.at(-1).swipe_id??0}),catalog:{id:'compact.regression',actors:input.actors,facts:Object.values(input.facts)},dialogue:{...adapter,ask:async()=>{asked++;return null;}}});
 return {k,state:()=>structuredClone(state),counts:()=>({writes,asked})};
}
const [mode,id,...args]=process.argv.slice(2);
if(mode==='check'){
 const request=await read(new URL(id+'.request.json',I)),raw=await readFile(new URL(id+'.content.txt',I),'utf8'),input=JSON.parse(request.messages[1].content),p=await prepareCompactDialogueExtraction(input);
 const format=structuredClone(p.responseFormat);format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');assert.deepEqual(request.messages,p.messages);assert.deepEqual(request.response_format,format);
 const report={id,actualMessagesAndSchemaMatch:true};
 try{
  const value=await createDialogueSemanticAdapter({outputContract:'dialogue-reception/7',complete:async()=>raw}).extract(p.input,p.messages,p.responseFormat);
  const check=spawnSync('python',['-c','import json,sys,jsonschema\nx=json.loads(sys.stdin.buffer.read());jsonschema.Draft202012Validator.check_schema(x["schema"]);e=list(jsonschema.Draft202012Validator(x["schema"]).iter_errors(x["value"]));print(json.dumps([v.message for v in e]));sys.exit(bool(e))'],{input:JSON.stringify({schema:request.response_format.json_schema.schema,value}),encoding:'utf8'});
  assert.equal(check.status,0,check.stdout);report.schemaPass=true;report.checked=p.check(value);report.structuralPass=true;
 }catch(e){report.structuralPass=false;report.error=e.message;}
 const rt=make(input,{complete:async req=>{assert.deepEqual(req.messages[0],p.messages[0]);assert.deepEqual(JSON.parse(req.messages[1].content),JSON.parse(p.messages[1].content));assert.deepEqual(req.messages.slice(2),p.messages.slice(2));return raw;}});report.observation=await rt.k.observeDialogue(input.sourceAnchor);report.state=rt.k.read();report.knowledge=rt.k.context().actorKnowledge;report.counts=rt.counts();
 await put(new URL(id+'.check.json',N),report);await put(new URL(id+'.after.seed.json',N),rt.state());
 console.log(JSON.stringify({id,schemaPass:report.schemaPass,structuralPass:report.structuralPass,error:report.error,status:report.observation.status,receipts:report.checked?.receptions.map(r=>({speaker:r.speakerId,to:r.recipientIds,content:r.contentSpan.quote,status:r.status,evidence:r.evidence.quote})),knowledge:report.knowledge.map(a=>({actor:a.actorId,messages:a.facts.map(f=>f.content)})),pending:report.observation.pending?.map(r=>({id:r.id,kind:r.kind,content:r.content,reason:r.reason})),counts:report.counts}));
}else if(mode==='turn'){
 const [parent,text,...responses]=args,request=await read(new URL(parent+'.request.json',I)),input=JSON.parse(request.messages[1].content),seed=await read(new URL(parent+'.after.seed.json',N));
 const params=Object.fromEntries(Object.entries(request).filter(([k])=>!['messages','response_format'].includes(k)));
 let index=0,captured=null;const rt=make(input,{seed,followup:text,complete:async req=>{
  const format=req.responseFormat?structuredClone(req.responseFormat):null;if(format)format.json_schema.schema=flattenSchema(format.json_schema.schema,'custom');
  const body={...params,messages:req.messages,...(format?{response_format:format}:{})};
  if(index>=responses.length){captured={purpose:req.purpose,request:body};throw Error('OFFLINE_CAPTURE_ONLY');}
  const name=responses[index++],actual=await read(new URL(name+'.request.json',I));assert.deepEqual(actual,body);return readFile(new URL(name+'.content.txt',I),'utf8');
 }});
 let result,error;try{result=await rt.k.prepareDialogueTurn({text});}catch(e){error=e.message;}
 if(captured){await writeFile(new URL(id+'.prepared.json',N),JSON.stringify(captured.request),{flag:'wx'});await put(new URL(id+'.capture.json',N),{parent,text,responses,consumed:index,purpose:captured.purpose,sourceSeed:parent+'.after.seed.json',captureOnly:true,discardedSimulationState:true});console.log(JSON.stringify({id,nextPurpose:captured.purpose,bytes:Buffer.byteLength(JSON.stringify(captured.request)),priorRealResponses:responses,captureOnly:true}));}
 else{if(error)throw Error(error);assert.equal(index,responses.length);const report={id,parent,text,responses,result,state:rt.k.read(),knowledge:rt.k.context().actorKnowledge,counts:rt.counts()};await put(new URL(id+'.turn.json',N),report);await put(new URL(id+'.after.seed.json',N),rt.state());console.log(JSON.stringify({id,result,counts:rt.counts(),knowledge:report.knowledge.map(a=>({actor:a.actorId,messages:a.facts.map(f=>f.content)}))}));}
}else throw Error('Unknown offline mode');
