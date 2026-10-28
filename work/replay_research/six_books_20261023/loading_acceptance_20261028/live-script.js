// Isolated W4 acceptance: real host scan and generateRaw, production lore filter.
// No classifier, dice, MVU initialization, or changes to official game data.
const config=await (await fetch('/901-world-loading-20261028/config.json')).json();
const {withReplayLorebook}=await import('/901-world-loading-20261028/work/rules_engine/gm_runtime/adjudication-gate.mjs');
const doc=window.top.document;
if(SillyTavern.characters[SillyTavern.characterId]?.name!==config.name)throw Error('Wrong test character');
const source=SillyTavern.characterId;
const panel=doc.createElement('section');panel.id='world-loading-acceptance';
panel.style.cssText='padding:8px;background:#19232c;color:white;border:1px solid #799;max-width:100%;box-sizing:border-box;';
const heading=doc.createElement('strong');heading.textContent='世界书加载验收 · 580条隔离副本';panel.append(heading);
const buttons=doc.createElement('div');buttons.style.cssText='display:flex;flex-wrap:wrap;gap:5px;margin:6px 0';panel.append(buttons);
const status=doc.createElement('div');status.textContent='就绪：只操作本卡，测试不推进正式剧情';panel.append(status);
const output=doc.createElement('pre');output.style.cssText='white-space:pre-wrap;max-height:220px;overflow:auto;font-size:12px';panel.append(output);
(doc.querySelector('#sheld')||doc.body).prepend(panel);
let busy=false;
const summarize=e=>({world:e.world,uid:e.uid,name:e.comment,constant:e.constant,disabled:e.disable});
const asArray=x=>Array.from(x||[]);
// Use the original callback identity: the installed helper's returned stop
// handle passes its wrapper to a map keyed by the original listener.
const listen=(event,listener)=>{eventOn(event,listener);return {stop:()=>eventRemoveListener(event,listener)};};
async function persist(run){
  const prior=SillyTavern.chatMetadata.world_loading_acceptance||{version:1,runs:[]};
  prior.runs.push(structuredClone(run));SillyTavern.updateChatMetadata({world_loading_acceptance:prior});
  await SillyTavern.saveChat();
}
async function runCase(test){
  if(busy||SillyTavern.characterId!==source)return;
  busy=true;for(const b of buttons.children)b.disabled=true;
  const run={id:test.id,harnessRevision:5,worldContextGuidance:config.worldContextGuidance,hostScanPatch:config.hostScanPatch,candidateHashes:config.candidateHashes,started:new Date().toISOString(),input:test.input,history:test.history||[],hold:test.hold||[],scan:[],activated:[],requests:[]};
  status.textContent='运行中：'+test.label;
  const listeners=[];const originalLength=SillyTavern.chat.length;let historyCreated=false;
  try{
    if(test.history?.length){
      await createChatMessages(test.history.map(m=>({role:m.role,message:m.content,extra:{world_loading_fixture:true}})));
      historyCreated=true;run.actualHistory=SillyTavern.chat.slice(-test.history.length).map(m=>({role:m.is_user?'user':'assistant',content:m.mes}));
    }
    listeners.push(listen(tavern_events.WORLDINFO_SCAN_DONE,x=>run.scan.push({state:x.state,budget:x.budget,
      matched:asArray(x.new.all).map(summarize),successful:asArray(x.new.successful).map(summarize),
      activated:asArray(x.activated.entries).map(summarize)})));
    listeners.push(listen(tavern_events.WORLD_INFO_ACTIVATED,es=>run.activated.push(es.map(summarize))));
    listeners.push(listen(tavern_events.GENERATE_AFTER_DATA,(x,dryRun)=>{
      run.prepared={dryRun,messages:structuredClone(x.prompt)};
    }));
    listeners.push(listen(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>{
      run.requests.push({model:x.model,max_tokens:x.max_tokens,stream:x.stream,messages:structuredClone(x.messages)});
    }));
    run.response=await withReplayLorebook({book:config.books[0],books:config.books,eventOn:listen,event:tavern_events.WORLDINFO_ENTRIES_LOADED,
      generate:async()=>{
        const loaded=listen(tavern_events.WORLDINFO_ENTRIES_LOADED,x=>{
          // Host load arrays are request-local copies. Explicit scene selection
          // holds only enabled public subjects, without rewriting the book.
          for(const item of test.hold||[]){
            const entry=Object.values(x).flat().find(e=>e.world===config.books[item.book]&&e.uid===item.uid);
            if(!entry||entry.disable)throw Error('Hold must select an existing enabled subject');
            entry.constant=true;
          }
          run.loaded=Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v.map(summarize)]));
        });
        try{return await generateRaw({generation_id:'w4-'+test.id+'-'+Date.now(),should_stream:false,should_silence:false,
          user_input:test.input,max_chat_history:6,
          overrides:{scenario:'这是独立的世界书测试夹具，各题互不继承剧情。',chat_history:{author_note:''}},
          ordered_prompts:['world_info_before','char_description','scenario','world_info_after','chat_history',
            {role:'system',content:config.worldContextGuidance+'\n仅处理本题明确现场，遵守世界书的来源、时期与知情边界。不要为测试虚构新设定，不替御临风说话、思想或决定。回复控制在200字以内，不显示数值或世界书元数据。'},'user_input']});}
        finally{loaded.stop();}
      }});
    run.status='completed';
  }catch(error){run.status='error';run.error=String(error?.stack||error);}
  finally{
    for(const listener of listeners)listener.stop();
    if(historyCreated){
      const ids=Array.from({length:SillyTavern.chat.length-originalLength},(_,i)=>i+originalLength);
      if(ids.some(i=>!SillyTavern.chat[i].extra?.world_loading_fixture))throw Error('Unexpected message in disposable test history');
      await deleteChatMessages(ids,{refresh:'all'});
    }
    run.finished=new Date().toISOString();
    await persist(run);
    status.textContent=(run.status==='completed'?'已完成：':'失败：')+test.label;
    output.textContent=JSON.stringify({id:run.id,status:run.status,model:run.requests.at(-1)?.model,
      loaded:run.activated.at(-1)?.map(e=>e.name),budget:run.scan.at(-1)?.budget,response:run.response,error:run.error},null,2);
    busy=false;for(const b of buttons.children)b.disabled=false;
  }
}
for(const test of config.cases){const b=doc.createElement('button');b.className='menu_button';b.textContent=test.label;b.onclick=()=>runCase(test);buttons.append(b);}
window.addEventListener('pagehide',()=>panel.remove());

await import('/901-world-loading-20261028/lifecycle-script.js');
