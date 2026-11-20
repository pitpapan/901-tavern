// Bounded host scan and manual native-summary tests. Only the named W4 chat.
const cfg=await (await fetch('/901-world-loading-20261028/lifecycle-config.json')).json();
const {withReplayLorebook}=await import('/901-world-loading-20261028/work/rules_engine/gm_runtime/adjudication-gate.mjs');
const memoryReader=cfg.memoryAdapter?(await import('/901-world-loading-20261028/work/replay_research/six_books_20261023/branch-memory.mjs')).retainedBranchMemory:()=>'';
const doc=window.top.document;
const ctx=()=>window.top.SillyTavern.getContext();
const valid=()=>ctx().characters[ctx().characterId]?.name===cfg.name&&ctx().chatId===cfg.chatId;
if(!valid())throw Error('Lifecycle fixture requires the named W4 chat');
const panel=doc.createElement('section');panel.id='world-lifecycle-acceptance';
panel.style.cssText='padding:8px;border:1px solid #aba;background:#182626;color:white';
const title=doc.createElement('strong');title.textContent='W4/W5预算与分支验收';panel.append(title);
const row=doc.createElement('div');panel.append(row);
const status=doc.createElement('pre');status.style.cssText='white-space:pre-wrap;max-height:200px;overflow:auto';status.textContent='就绪';panel.append(status);
doc.querySelector('#world-loading-acceptance').after(panel);
const listen=(event,fn)=>{eventOn(event,fn);return()=>eventRemoveListener(event,fn);};
const brief=e=>({uid:e.uid,world:e.world,name:e.comment,constant:e.constant,disabled:e.disable});
const key=e=>e.world+':'+e.uid;
let busy=false;
async function save(run){
  const state=ctx().chatMetadata.world_loading_lifecycle||{runs:[]};
  state.runs.push(structuredClone(run));ctx().updateChatMetadata({world_loading_lifecycle:state});await ctx().saveChat();
}
async function run(id,action){
  if(busy||!valid())return;busy=true;for(const b of row.children)b.disabled=true;
  const r={id,started:new Date().toISOString(),memoryAdapter:cfg.memoryAdapter,candidateHashes:cfg.candidateHashes,scan:[],activated:[],requests:[]};
  const stops=[];status.textContent='运行中：'+id;
  try{
    if(!ctx().extensionSettings.memory.memoryFrozen)throw Error('Manual memory fixture requires existing frozen setting');
    stops.push(listen(tavern_events.WORLDINFO_SCAN_DONE,x=>r.scan.push({phase:r.phase,budget:x.budget,matched:Array.from(x.new.all||[]).map(brief),activated:Array.from(x.activated.entries?.values()||[]).map(brief)})));
    stops.push(listen(tavern_events.WORLD_INFO_ACTIVATED,es=>r.activated.push({phase:r.phase,entries:es.map(brief)})));
    stops.push(listen(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>r.requests.push({model:x.model,messages:structuredClone(x.messages)})));
    await action(r);r.status='completed';
  }catch(e){r.status='error';r.error=String(e.stack||e);}
  finally{for(const stop of stops)stop();r.finished=new Date().toISOString();await save(r);status.textContent=JSON.stringify({id,status:r.status,budget:r.scan.map(x=>x.budget),response:r.response,missing:r.missing,error:r.error},null,2);busy=false;for(const b of row.children)b.disabled=false;}
}
async function request(r,input,selected=null){
  r.phase='request';
  r.nativeMemory=ctx().extensionPrompts['1_memory']?.value||'';
  r.selectedMemory=memoryReader(ctx().chat);
  r.chatSnapshot=ctx().chat.map((m,i)=>({messageId:i,swipeId:m.swipe_id??0,text:m.mes,memory:m.extra?.memory||''}));
  r.memorySource=ctx().chat.map((m,i)=>({messageId:i,swipeId:m.swipe_id??0,memory:m.extra?.memory||'',fixture:!!m.extra?.world_lifecycle_fixture})).filter(m=>m.memory);
  r.response=await withReplayLorebook({book:cfg.books[0],books:cfg.books,eventOn:(ev,fn)=>({stop:listen(ev,fn)}),event:tavern_events.WORLDINFO_ENTRIES_LOADED,generate:async()=>{
    const stop=listen(tavern_events.WORLDINFO_ENTRIES_LOADED,x=>{
      for(const k of Object.keys(x)){
        if(selected)for(let i=x[k].length-1;i>=0;i--)if(!selected.has(key(x[k][i])))x[k].splice(i,1);
        for(const e of x[k])if(cfg.hold.includes(e.uid)){if(e.disable)throw Error('Disabled hold');e.constant=true;}
      }
      r.loaded=Object.values(x).flat().map(brief);
    });
    try{return await generateRaw({generation_id:'wl-'+r.id+'-'+Date.now(),should_stream:false,should_silence:false,max_chat_history:6,user_input:input,
      overrides:{scenario:'隔离验收，保留本测试聊天当前分支；不推进正式剧情。',chat_history:{author_note:''}},
      ordered_prompts:['world_info_before','char_description','scenario','world_info_after','chat_history',
        ...(r.selectedMemory?[{role:'system',content:r.selectedMemory}]:[]),
        {role:'system',content:cfg.worldContextGuidance+'\n请只依据当前保留分支回答本题。传闻、私人猜测、已发出和已送达分别处理，不替御临风说话或决定。200字以内。'},'user_input']});}
    finally{stop();}
  }});
}
async function budget(r,tiny=false){
  r.phase='bounded-scan';
  const tokens=await ctx().getTokenCountAsync(cfg.required.map(e=>e.content).join('\n')+'\n');
  const limit=tiny?128:tokens+256;r.contextLimit=limit;r.requiredTokens=tokens;
  await withReplayLorebook({book:cfg.books[0],books:cfg.books,eventOn:(ev,fn)=>({stop:listen(ev,fn)}),event:tavern_events.WORLDINFO_ENTRIES_LOADED,generate:async()=>{
    const stop=listen(tavern_events.WORLDINFO_ENTRIES_LOADED,x=>{
      for(const e of Object.values(x).flat())if(cfg.hold.includes(e.uid)){if(e.disable)throw Error('Disabled hold');e.constant=true;}
      r.initialLoaded=Object.values(x).flat().map(brief);
    });
    try{const result=await ctx().getWorldInfoPrompt([cfg.budgetInput],limit,false);r.boundedPrompt=result.worldInfoString;}
    finally{stop();}
  }});
  let selected=r.activated.find(x=>x.phase==='bounded-scan')?.entries||[];
  r.crowdedMissing=cfg.required.filter(e=>!selected.some(x=>x.uid===e.uid)).map(e=>e.name);
  if(!tiny){
    // Explicitly apply the operator's short scene list, as prescribed by W4/M1.
    // This is a manual selection test, not an automatic relevance algorithm.
    r.phase='focused-scan';
    const chosen=new Set(cfg.required.map(e=>e.uid));
    await withReplayLorebook({book:cfg.books[0],books:cfg.books,eventOn:(ev,fn)=>({stop:listen(ev,fn)}),event:tavern_events.WORLDINFO_ENTRIES_LOADED,generate:async()=>{
      const stop=listen(tavern_events.WORLDINFO_ENTRIES_LOADED,x=>{
        for(const entries of Object.values(x))for(let i=entries.length-1;i>=0;i--)if(!chosen.has(entries[i].uid))entries.splice(i,1);
        for(const e of Object.values(x).flat())if(cfg.hold.includes(e.uid))e.constant=true;
      });
      try{const result=await ctx().getWorldInfoPrompt([cfg.budgetInput],limit,false);r.focusedPrompt=result.worldInfoString;r.focusedTokens=await ctx().getTokenCountAsync(result.worldInfoString);}
      finally{stop();}
    }});
    selected=r.activated.find(x=>x.phase==='focused-scan')?.entries||[];
  }
  r.missing=cfg.required.filter(e=>!selected.some(x=>x.uid===e.uid)).map(e=>e.name);
  r.retained=selected;r.dropped=(r.scan[0]?.matched||[]).filter(e=>!selected.some(s=>key(s)===key(e)));
  if(r.missing.length){r.disposition='需要收窄场景或增加可用上下文；本例不发送缺失必需条目的模型请求';return;}
  if(tiny)throw Error('Expected essential-content shortage');
  await request(r,cfg.budgetInput,new Set(selected.map(key)));
}
async function prepare(r){
  if(ctx().chat.length!==1)throw Error('Prepare requires original greeting only');
  const extra={world_lifecycle_fixture:true};
  const messages=[{role:'assistant',message:'信使取走了给雪老的密封信，尚无送达回报。',extra},
    ...['铜壶中的水沸了。','窗外传来细雨声。','有人挪了挪椅子。','炉火安静地亮着。','街面有人走过。','桌上的茶渐渐凉了。'].map((message,i)=>({role:i%2?'user':'assistant',message,extra}))];
  await createChatMessages(messages);
  // Seed canonical native swipe records; the helper setter flattens swipe_info.
  const m=ctx().chat[1];
  m.swipe_id=0;m.swipes=['信使取走了给雪老的密封信，尚无送达回报。','信使没有接下委托，信还没有发出。'];
  m.swipe_info=[{send_date:m.send_date,extra:{...extra,memory:cfg.memoryA}},{send_date:m.send_date,extra:{...extra,memory:cfg.memoryB}}];
  m.extra=structuredClone(m.swipe_info[0].extra);await ctx().saveChat();
  r.prepared=ctx().chat.map((m,i)=>({i,mes:m.mes,swipe:m.swipe_id,extra:m.extra}));
  if(ctx().chat[1].extra?.memory!==cfg.memoryA)throw Error('Native summary was not attached to selected candidate');
}
async function switchMemory(r){
  if(!ctx().chat[1]?.extra?.world_lifecycle_fixture)throw Error('No prepared branch');
  await ctx().swipe.to(null,'right',{source:'swipe_picker',message:ctx().chat[1],forceMesId:1,forceSwipeId:1,forceDuration:0});
  if(ctx().chat[1].extra?.memory!==cfg.memoryB)throw Error('Candidate B did not select its own memory');
  r.selectedSwipe=ctx().chat[1].swipe_id;r.selectedMemory=ctx().chat[1].extra.memory;
}
async function cleanup(r){
  const ids=ctx().chat.map((m,i)=>m.extra?.world_lifecycle_fixture?i:null).filter(i=>i!==null);
  if(ids.length)await deleteChatMessages(ids,{refresh:'all'});
  if(ctx().chat.length!==1)throw Error('Unexpected non-fixture message remains');r.remainingMessages=1;
}
async function prepareAdoption(r){
  if(ctx().chat.length!==1)throw Error('Prepare requires original greeting only');
  const extra={world_lifecycle_fixture:true};
  await createChatMessages([{role:'assistant',message:cfg.rejectedReply,extra},
    {role:'user',message:'当前在洛汀，猫音在场。请核对已有记录，不推进剧情。',extra}]);
  r.rejectedReply=cfg.rejectedReply;
  r.instruction='人工先编辑保留回复，再在原生Summary输入已审记忆；准备步骤不写记忆。';
}
async function readAdoption(r){
  if(ctx().chat[1]?.mes!==cfg.reviewedReply)throw Error('Retained reply has not been manually corrected');
  if(ctx().chat[1]?.extra?.memory!==cfg.reviewedMemory)throw Error('Reviewed memory has not been manually saved through Summary');
  r.reviewedReply=cfg.reviewedReply;r.reviewedMemory=cfg.reviewedMemory;
  await request(r,cfg.adoptionQuestion);
}
for(const [label,id,fn] of [
  ['11 有限预算裁剪','budget-limited',r=>budget(r)],['12 必需内容不足','budget-shortage',r=>budget(r,true)],
  ['13 准备人工记忆A','memory-prepare',prepare],['14 读取当前记忆','memory-read',r=>request(r,cfg.question)],
  ['15 切换保留候选B','memory-switch',switchMemory],['16 清理本轮夹具','memory-cleanup',cleanup],
  ['17 准备人工采纳对照','adoption-prepare',prepareAdoption],['18 核验人工采纳并续写','adoption-read',readAdoption]]){
  const b=doc.createElement('button');b.className='menu_button';b.textContent=label;b.onclick=()=>run(id,fn);row.append(b);
}
window.addEventListener('pagehide',()=>panel.remove());
