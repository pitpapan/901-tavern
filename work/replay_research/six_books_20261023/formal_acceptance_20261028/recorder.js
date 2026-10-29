// Instrumentation only: native input and the unchanged installed host entry do all generation.
const cfg=await(await fetch('/901-formal-loading-20261028/config.json')).json();
const doc=window.top.document,ctx=()=>window.top.SillyTavern.getContext();
const valid=()=>ctx().characters[ctx().characterId]?.name===cfg.name;
if(!valid())throw Error('Wrong isolated card');
await waitGlobalInitialized('Mvu');
const panel=doc.createElement('section');panel.id='formal-loading-recorder';panel.style.cssText='padding:8px;border:1px solid #8ba;background:#152a29;color:white';
const title=doc.createElement('b');title.textContent='正式安装加载验收 · 只读采集';panel.append(title);
const arm=doc.createElement('button');arm.className='menu_button';arm.textContent='开始本聊天采集';panel.append(arm);
const recover=doc.createElement('button');recover.className='menu_button';recover.textContent='采集一次未完成续写的恢复';panel.append(recover);
const finish=doc.createElement('button');finish.className='menu_button';finish.textContent='保存本聊天证据';panel.append(finish);
const status=doc.createElement('pre');status.style.whiteSpace='pre-wrap';status.textContent='先开始采集，再用原生发送框输入对应题目；回复完成后保存。';panel.append(status);
(doc.querySelector('#sheld')||doc.body).prepend(panel);
let run=null;const stops=[],refs=[];
const root=()=>Mvu.getMvuData({type:'message',message_id:ctx().chat.length-1})?.stat_data?.['901_rules_poc'];
const brief=e=>({world:e.world,uid:e.uid,name:e.comment,constant:e.constant,disabled:e.disable});
function listen(event,fn){eventOn(event,fn);stops.push(()=>eventRemoveListener(event,fn));}
function start(recovery=false){
 try{
  if(!valid())throw Error('Wrong card');const test=cfg.cases.find(c=>c.chatId===ctx().chatId);if(!test)throw Error('Wrong chat');
  const prior=ctx().chatMetadata.formal_world_acceptance;
  if(recovery){
   if(test.id!=='qualification'||!prior||prior.recovery||ctx().chat.at(-1)?.extra?.['901_replay_gate']?.status!=='NARRATION_PENDING')throw Error('Only one pending qualification continuation recovery is allowed');
  }else if(ctx().chat.some(m=>m.is_user)||prior)throw Error('Case already used; do not sample again');
  for(const stop of stops.splice(0))stop();refs.length=0;
  run=recovery?structuredClone(prior):{id:test.id,input:test.input,chatId:test.chatId,started:new Date().toISOString(),entrySha256:cfg.hostEntrySha256,bookHashes:cfg.bookHashes,beforeRoot:structuredClone(root()??null),requests:[],scan:[],activated:[],loaded:[]};
  if(recovery)run.recovery={started:new Date().toISOString(),requestOffset:run.requests.length,beforeRoot:structuredClone(root()??null),priorGate:structuredClone(ctx().chat.at(-1).extra['901_replay_gate'])};
  listen(tavern_events.WORLDINFO_ENTRIES_LOADED,x=>refs.push(x));
  listen(tavern_events.WORLDINFO_SCAN_DONE,x=>run.scan.push({budget:x.budget,matched:Array.from(x.new.all||[]).map(brief)}));
  listen(tavern_events.WORLD_INFO_ACTIVATED,x=>run.activated.push(x.map(brief)));
  listen(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>{run.requests.push({model:x.model,messages:structuredClone(x.messages)});status.textContent='采集中：'+test.label+'；settings事件 '+run.requests.length+'（不等于实际模型调用数）';});
  status.textContent=recovery?'已开始恢复采集：仅用原生重新生成恢复未完成续写，不发送新消息。':'已开始：'+test.label+'\n请原生发送：'+test.input;arm.disabled=true;recover.disabled=true;
 }catch(e){status.textContent=String(e.stack||e);}
}
arm.onclick=()=>start(false);
recover.onclick=()=>start(true);
finish.onclick=async()=>{
 try{
  if(!run||!valid()||ctx().chatId!==run.chatId)throw Error('No active case');
  for(const stop of stops.splice(0))stop();
  run.loaded=(run.loaded||[]).concat(refs.map(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v.map(brief)]))));
  run.afterRoot=structuredClone(root()??null);run.messages=ctx().chat.map((m,i)=>({id:i,user:m.is_user,text:m.mes,gate:m.extra?.['901_replay_gate']}));
  run.finished=new Date().toISOString();
  ctx().updateChatMetadata({formal_world_acceptance:structuredClone(run)});await ctx().saveChat();
  status.textContent='已保存：'+run.id+'；消息 '+ctx().chat.length+'；settings事件 '+run.requests.length;
  finish.disabled=true;
 }catch(e){status.textContent=String(e.stack||e);}
};
window.addEventListener('pagehide',()=>{for(const stop of stops)stop();panel.remove();});
