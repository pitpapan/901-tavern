
if (window.top.location.origin !== 'http://127.0.0.1:18132') throw Error('Wrong isolation origin');
await waitGlobalInitialized('Mvu');
const {adoptNativeChatBranch, carryTestState, readPersistedTavernChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const selection={"testOnly": true, "generatedByModel": false, "sourceChat": "901 帝都正式续玩 20261106 - Branch #2", "sourceRevision": 3, "sourceMessage": 9, "sourceSeed": "../evidence/received.seed.jsonl", "sourceSeedSha256": "7efa7e890a730e0cda86d4230109df4b96d551d493b67d55957e1430b482868a", "previousHuangRequest": "../question-wording-node-live-20261120/610.request.json", "previousHuangRequestSha256": "2d56f202057834193b852814a69d64a310044dd0cb9c7b94fd1a96fee4e6569e", "departureUser": "御临风在水渠旁停下，提议先在街口等一会儿。", "departureNarration": "布莱特在岔口停步，说要独自去另一条街的铺子取件，随后拐过街角走远。御临风和黄泉留在原处的水渠边。御临风开口时，布莱特尚未回来，也听不见两人的交谈。", "question": "御临风问黄泉：“你知道老馆主和雪老是否相识、有没有来往吗？”", "priorLedger": "../continuation-node-live-20261120/run.json", "priorLedgerSha256": "7461f114db73e979131d316c308c538c399b59742b85682890afae92245a2ac7", "cumulative": 620, "available": 0, "present": ["player", "huang"], "absent": ["bright"], "changesKnowledge": false};
const sourceText=selection.departureNarration;
const doc=window.top.document;
const storage=window.top.localStorage;
const branchKey='clinic-private-bright-absence-child';
const tavern=()=>SillyTavern.getContext?.()??SillyTavern;
const anchor=()=>({chatId:SillyTavern.getCurrentChatId?.()??SillyTavern.chatId,messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0});
const root=cursor=>Mvu.getMvuData({type:'message',message_id:cursor.messageId}).stat_data['901_rules_poc'];
const branch=()=>storage.getItem(branchKey);
const currentChild=()=>{
 const cursor=anchor();
 if(!branch()||cursor.chatId!==branch()||cursor.chatId===selection.sourceChat)throw Error('Open the adopted continuation child');
 return cursor;
};
const portCheck=()=>{if(window.top.location.port!=='18132')throw Error('Wrong isolation origin');};
const post=async(endpoint,body)=>{
 portCheck();
 const r=await fetch('/api/backends/chat-completions/'+endpoint,{
  method:'POST',headers:tavern().getRequestHeaders(),body:JSON.stringify(body)});
 if(!r.ok)throw Error('Existing isolation evidence service '+r.status);
 return r.json();
};
doc.getElementById('clinic-private-bright-absence')?.remove();
const panel=doc.createElement('section');
panel.id='clinic-private-bright-absence';
panel.style.cssText='position:fixed;left:10px;top:44px;z-index:100100;background:#223840;color:white;padding:9px;font:13px sans-serif;max-width:238px';
const status=doc.createElement('pre');status.style.whiteSpace='pre-wrap';
status.textContent='缺席隔离 · '+anchor().chatId;
panel.append(status);doc.body.append(panel);
function control(label,action){
 const el=doc.createElement('button');el.textContent=label;el.style.display='block';
 el.onclick=async()=>{el.disabled=true;try{status.textContent=await action();}catch(e){status.textContent='缺席未完成 '+e.message;}finally{el.disabled=false;}};
 panel.append(el);
}
control('缺席：绑定原生子分支',async()=>{
 const tip=anchor();
 if(tip.chatId===selection.sourceChat||!tip.chatId.includes('Branch #'))throw Error('Create a native branch from the received floor first');
 const adopted=await adoptNativeChatBranch({mvu:Mvu,tavern:tavern(),expectedParentChatId:selection.sourceChat,expectedRevision:selection.sourceRevision});
 await SillyTavern.saveChat();
 storage.setItem(branchKey,tip.chatId);
 return '缺席分支 '+adopted.status+' '+tip.chatId;
});
control('缺席：保留问句及 人工离场回合',async()=>{
 const savedTip=currentChild(),baseIndex=selection.sourceMessage;
 const from={...savedTip,messageId:baseIndex,swipeId:SillyTavern.chat[baseIndex]?.swipe_id??0};
 if(![baseIndex,baseIndex+2].includes(savedTip.messageId)||root(from).revision!==selection.sourceRevision+1)throw Error('Expected the adopted private-reception floor');
 if(savedTip.messageId===baseIndex){
  await createChatMessages([{role:'user',message:selection.departureUser}]);
  await createChatMessages([{role:'assistant',message:sourceText}]);
 }
 const to=currentChild(),keeper=SillyTavern.chat[to.messageId],ask=SillyTavern.chat[to.messageId-1];
 if(to.messageId!==from.messageId+2||!ask.is_user||ask.mes!==selection.departureUser||
    keeper.is_user||keeper.is_system)throw Error('Unexpected retained message role or coordinate');
 // The MVU extension decorates a newly inserted assistant floor. Keep the real retained body exactly.
 if(keeper.mes===sourceText+'\n\n<StatusPlaceHolderImpl/>'){
  await setChatMessages([{message_id:to.messageId,message:sourceText}],{refresh:'none'});
 }
 if(SillyTavern.chat[to.messageId].mes!==sourceText)throw Error('Actual retained reply text was changed');
 const carried=await carryTestState({mvu:Mvu,getSourceAnchor:()=>from,getAnchor:anchor,expectedChatId:to.chatId});
 await SillyTavern.saveChat();
 const saved=await readPersistedTavernChat({tavern:tavern(),chatId:to.chatId});
 if(saved[to.messageId]?.mes!==selection.departureUser||saved[to.messageId+1]?.mes!==sourceText)throw Error('Actual dialogue failed disk equality');
 return '人工离场回合已保存 '+to.messageId+'/'+to.swipeId+' '+carried.status;
});
const label=doc.createElement('input');label.value='departure';label.setAttribute('aria-label','缺席快照名');panel.append(label);
control('缺席：保存与读回快照',async()=>{
 const tip=currentChild();
 await SillyTavern.saveChat();
 const saved=await readPersistedTavernChat({tavern:tavern(),chatId:tip.chatId});
 const active=root(tip);
 const disk=saved[tip.messageId+1].variables[tip.swipeId].stat_data['901_rules_poc'];
 if(JSON.stringify(active)!==JSON.stringify(disk))throw Error('MVU memory differs from saved floor');
 const value=await post('clinic-topic-evidence',{label:label.value,chatId:tip.chatId,anchor:tip,
   root:active,state:active.storyKnowledge,context:window.top.__901StoryKnowledge.context()});
 return '缺席快照 '+label.value+' '+value.seedSha256.slice(0,12);
});
control('缺席：切回接收前父分支',async()=>{await tavern().openCharacterChat(selection.sourceChat);return '缺席父分支已打开';});
control('缺席：重开同一子分支',async()=>{
 if(!branch())throw Error('No adopted absence child');
 await tavern().openCharacterChat(branch());
 return '续接子分支已从服务器重开';
});
window.addEventListener('pagehide',()=>panel.remove());
