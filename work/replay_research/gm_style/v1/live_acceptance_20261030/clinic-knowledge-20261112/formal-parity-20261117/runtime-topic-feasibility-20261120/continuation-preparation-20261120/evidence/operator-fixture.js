
if (window.top.location.origin !== 'http://127.0.0.1:18132') throw Error('Wrong isolation origin');
await waitGlobalInitialized('Mvu');
const {adoptNativeChatBranch, carryTestState, readPersistedTavernChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const selection={"selection": "R3/611", "selectionTiming": "选自已阅过的旧批次，在任何续问生成前冻结", "criteria": ["双方初判N", "有明示传闻框架", "文本支持黄泉确已听着并答话"], "receivedSeed": {"file": "../evidence/received.seed.jsonl", "sha256": "7efa7e890a730e0cda86d4230109df4b96d551d493b67d55957e1430b482868a", "bytes": 1056053}, "actualRequest": {"file": "../question-wording-node-live-20261120/611.request.json", "sha256": "351af2e5759f5591867feafd25a878581237d7a0d73aeba6a1ebe49f434a02ec", "messageIndex": 11}, "actualReply": {"file": "../question-wording-node-live-20261120/611.content.txt", "sha256": "225e9d4d81d8761daffa38b666996531a9d8b4d7c4ec1ae0baa8713c1b7d0c6d", "bytes": 881}, "preservedPlayerQuestion": "御临风问布莱特：“若想向老馆主打听雪老的事，你知道他们有什么来往吗？”黄泉也在旁边。", "identifiedReportedClause": "不过此前确实听过一句传言——九雪医馆那位老馆主和雪老算是有旧识，彼此不是同一人。", "relayBelief": "rumor", "sender": "bright", "propositionRef": "clinic.owner.xuelao.old-friend", "plannedRecipients": {"huang": "听着且紧接着回答「先到了地方再说」", "player": "布莱特偏过头应答御临风提出的问句，是直接受话者"}, "questions": {"huang": "御临风转向黄泉：“你现在对老馆主和雪老的关系了解多少？”", "bright": "御临风问布莱特：“你从哪里听来的？”"}, "authorization": {"modelCalls": 0, "cumulative": 616, "available": 0}, "sourceChat": "901 帝都正式续玩 20261106 - Branch #2", "sourceRevision": 3, "sourceMessage": 9};
const sourceText="布莱特牵着马往前走了两步，避开旁边一个推着两轮菜车经过的汉子，这才偏过头应道：\n\n“他们二人的底细我并不全清楚，不过此前确实听过一句传言——九雪医馆那位老馆主和雪老算是有旧识，彼此不是同一人。至于他们早年具体是怎么结识的、又有过什么深浅交情，我就没听说过了。”\n\n他说到这里顿了顿，语气依旧平稳：“若是想打听，到了医馆当面见着人，顺着求医问药的由头探问一句，总比在街上凭空乱猜要实在。”\n\n黄泉在一旁听着，视线从前方的街口收回，只淡淡接了一句：“先到了地方再说。”\n\n街道两侧的引水渠泛着粼粼波光，水流沿着石槽平稳向东流淌。街上的行人、商贩与往来的轻便马车各自忙碌着，城内深处的街巷向两侧渐次展开。";
const doc=window.top.document;
const storage=window.top.localStorage;
const branchKey='clinic-611-continuation-child';
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
doc.getElementById('clinic-611-continuation')?.remove();
const panel=doc.createElement('section');
panel.id='clinic-611-continuation';
panel.style.cssText='position:fixed;left:10px;top:44px;z-index:100100;background:#223840;color:white;padding:9px;font:13px sans-serif;max-width:238px';
const status=doc.createElement('pre');status.style.whiteSpace='pre-wrap';
status.textContent='611 隔离续接 · '+anchor().chatId;
panel.append(status);doc.body.append(panel);
function control(label,action){
 const el=doc.createElement('button');el.textContent=label;el.style.display='block';
 el.onclick=async()=>{el.disabled=true;try{status.textContent=await action();}catch(e){status.textContent='续接未完成 '+e.message;}finally{el.disabled=false;}};
 panel.append(el);
}
control('续接：绑定原生子分支',async()=>{
 const tip=anchor();
 if(tip.chatId===selection.sourceChat||!tip.chatId.includes('Branch #'))throw Error('Create a native branch from the received floor first');
 const adopted=await adoptNativeChatBranch({mvu:Mvu,tavern:tavern(),expectedParentChatId:selection.sourceChat,expectedRevision:selection.sourceRevision});
 await SillyTavern.saveChat();
 storage.setItem(branchKey,tip.chatId);
 return '续接分支 '+adopted.status+' '+tip.chatId;
});
control('续接：保留问句及 611 原文',async()=>{
 const savedTip=currentChild(),baseIndex=selection.sourceMessage;
 const from={...savedTip,messageId:baseIndex,swipeId:SillyTavern.chat[baseIndex]?.swipe_id??0};
 if(![baseIndex,baseIndex+2].includes(savedTip.messageId)||root(from).revision!==selection.sourceRevision+1)throw Error('Expected the adopted received floor');
 if(savedTip.messageId===baseIndex){
  await createChatMessages([{role:'user',message:selection.preservedPlayerQuestion}]);
  await createChatMessages([{role:'assistant',message:sourceText}]);
 }
 const to=currentChild(),keeper=SillyTavern.chat[to.messageId],ask=SillyTavern.chat[to.messageId-1];
 if(to.messageId!==from.messageId+2||!ask.is_user||ask.mes!==selection.preservedPlayerQuestion||
    keeper.is_user||keeper.is_system)throw Error('Unexpected retained message role or coordinate');
 // The MVU extension decorates a newly inserted assistant floor. Keep the real retained body exactly.
 if(keeper.mes===sourceText+'\n\n<StatusPlaceHolderImpl/>'){
  await setChatMessages([{message_id:to.messageId,message:sourceText}],{refresh:'none'});
 }
 if(SillyTavern.chat[to.messageId].mes!==sourceText)throw Error('Actual retained reply text was changed');
 const carried=await carryTestState({mvu:Mvu,getSourceAnchor:()=>from,getAnchor:anchor,expectedChatId:to.chatId});
 await SillyTavern.saveChat();
 const saved=await readPersistedTavernChat({tavern:tavern(),chatId:to.chatId});
 if(saved[to.messageId]?.mes!==selection.preservedPlayerQuestion||saved[to.messageId+1]?.mes!==sourceText)throw Error('Actual dialogue failed disk equality');
 return '611 原文已保存 '+to.messageId+'/'+to.swipeId+' '+carried.status;
});
control('续接：确认两位听者收到转述',async()=>{
 const tip=currentChild(),msg=SillyTavern.chat[tip.messageId];
 if(tip.messageId!==selection.sourceMessage+2||msg.mes!==sourceText||!msg.mes.includes(selection.identifiedReportedClause))throw Error('611 must be the exact saved assistant floor');
 const receipt={id:'clinic.continuation.611.relay',status:'received',authority:'host-confirmed',
  sourceAnchor:{...tip,text:msg.mes},senderId:'bright',recipientIds:['huang','player'],
  propositionRefs:[selection.propositionRef],channel:'message',belief:'rumor'};
 const result=await window.top.__901StoryKnowledge.receive(receipt);
 await post('clinic-topic-receipt',{chatId:tip.chatId,sourceId:tip.messageId,receipt,result});
 return '续接回执 '+result.status;
});
const label=doc.createElement('input');label.value='retained-before-relay';label.setAttribute('aria-label','续接快照名');panel.append(label);
control('续接：保存与读回快照',async()=>{
 const tip=currentChild();
 await SillyTavern.saveChat();
 const saved=await readPersistedTavernChat({tavern:tavern(),chatId:tip.chatId});
 const active=root(tip);
 const disk=saved[tip.messageId+1].variables[tip.swipeId].stat_data['901_rules_poc'];
 if(JSON.stringify(active)!==JSON.stringify(disk))throw Error('MVU memory differs from saved floor');
 const value=await post('clinic-topic-evidence',{label:label.value,chatId:tip.chatId,anchor:tip,
   root:active,state:active.storyKnowledge,context:window.top.__901StoryKnowledge.context()});
 return '续接快照 '+label.value+' '+value.seedSha256.slice(0,12);
});
control('续接：切回接收前父分支',async()=>{await tavern().openCharacterChat(selection.sourceChat);return '续接父分支已打开';});
control('续接：重开同一子分支',async()=>{
 if(!branch())throw Error('No adopted continuation child');
 await tavern().openCharacterChat(branch());
 return '续接子分支已从服务器重开';
});
window.addEventListener('pagehide',()=>panel.remove());
