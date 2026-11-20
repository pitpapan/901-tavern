// This panel only runs on the disposable local copy.
if (window.top.location.port !== '18132') throw Error('Wrong isolation origin');
const {adoptNativeChatBranch:labAdopt,carryTestState:labCarry,readPersistedTavernChat:labRead}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const labParent=__PARENT__,labParentRevision=__PARENT_REVISION__;
const labTavern=()=>SillyTavern.getContext?.()??SillyTavern;
const labAnchor=()=>({chatId:SillyTavern.getCurrentChatId?.()??SillyTavern.chatId,messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0});
const labSource='桌外隔离测试告知（test-only，非正式剧情）：一名来客单独对布莱特说：“我听说九雪医馆馆主与雪老有旧，二者是不同的人。递出这条口信时以钴蓝纸燕为记。”布莱特听清原话，御临风与黄泉不在听距内，也未获告。';
const labPost=async(name,body)=>{
 const r=await fetch('/api/backends/chat-completions/'+name,{method:'POST',headers:labTavern().getRequestHeaders(),body:JSON.stringify(body)});
 if(!r.ok)throw Error('Local evidence '+r.status);
 return r.json();
};
const labDoc=window.top.document,labStore=window.top.localStorage,labKey='runtime-topic-test-child';
labDoc.getElementById('runtime-topic-test')?.remove();
const labPanel=labDoc.createElement('section');labPanel.id='runtime-topic-test';
labPanel.style.cssText='position:fixed;right:10px;top:46px;z-index:99999;background:#17292b;color:#fff;padding:12px;max-width:355px;font:13px sans-serif';
const labStatus=labDoc.createElement('pre');labStatus.style.whiteSpace='pre-wrap';
labStatus.textContent='医馆知情 · 隔离捕获 · '+labAnchor().chatId;
labPanel.append(labStatus);labDoc.body.append(labPanel);
function labButton(label,run){
 const button=labDoc.createElement('button');
 button.textContent=label;button.style.display='block';
 button.onclick=async()=>{button.disabled=true;try{const value=await run();if(value)labStatus.textContent=value;}catch(error){labStatus.textContent='未完成 '+error.message;}finally{button.disabled=false;}};
 labPanel.append(button);
}
function labChild(){
 const name=labStore.getItem(labKey);
 if(!name||name===labParent||!name.includes('Branch #'))throw Error('Build the test branch first');
 return name;
}
function labAssertChild(){
 if(labAnchor().chatId!==labChild())throw Error('Open the disposable test branch');
}
labButton('确认测试分支绑定',async()=>{
 const child=labAnchor().chatId;
 if(!child||child===labParent||!child.includes('Branch #'))throw Error('Use the last message to open a native test branch first');
 const result=await labAdopt({mvu:Mvu,tavern:labTavern(),expectedParentChatId:labParent,expectedRevision:labParentRevision});
 labStore.setItem(labKey,child);
 await SillyTavern.saveChat();return '分支绑定 '+result.status;
});
labButton('仅布莱特接收测试告知',async()=>{
 labAssertChild();
 let id=SillyTavern.chat.findIndex(m=>m.mes===labSource);
 if(id<0){
  const old=labAnchor(),root=Mvu.getMvuData({type:'message',message_id:old.messageId}).stat_data['901_rules_poc'];
  const operationId=Object.keys(root.operations).findLast(id=>root.operations[id].summary?.kind!=='knowledge')??Object.keys(root.operations).at(-1);
  await createChatMessages([{role:'system',message:labSource,is_hidden:true,extra:{clinicRuntimeTopicTestSource:true}}]);
  id=SillyTavern.chat.length-1;
  await labCarry({mvu:Mvu,getSourceAnchor:()=>old,getAnchor:labAnchor,expectedChatId:old.chatId,operationId});
  await SillyTavern.saveChat();
 }
 const msg=SillyTavern.chat[id],anchor=labAnchor();
 const result=await window.top.__901StoryKnowledge.receive({id:'clinic.topic.bright.test.20261120',authority:'host-confirmed',status:'received',
  sourceAnchor:{chatId:anchor.chatId,messageId:id,swipeId:msg.swipe_id??0,text:msg.mes},propositionRefs:['clinic.owner.xuelao.old-friend'],
  recipientIds:['bright'],channel:'message',belief:'rumor'});
 await labPost('clinic-topic-receipt',{chatId:anchor.chatId,sourceId:id,result});
 return '测试接收 '+result.status;
});
const labPhase=labDoc.createElement('select');labPhase.setAttribute('aria-label','离线捕获阶段');
for(const name of ['before','received-bright','reopened-bright','received-huang']){
 const option=labDoc.createElement('option');option.value=name;option.textContent=name;labPhase.append(option);
}
labPanel.append(labPhase);
labButton('设置离线捕获阶段',async()=>{
 labAssertChild();await labPost('clinic-topic-phase',{phase:labPhase.value});return '捕获阶段 '+labPhase.value;
});
const labLabel=labDoc.createElement('input');labLabel.setAttribute('aria-label','隔离快照名称');labLabel.value='before';labPanel.append(labLabel);
labButton('保存并核对隔离快照',async()=>{
 labAssertChild();const anchor=labAnchor();await SillyTavern.saveChat();
 const data=Mvu.getMvuData({type:'message',message_id:anchor.messageId});
 const saved=await labRead({tavern:labTavern(),chatId:anchor.chatId});
 if(JSON.stringify(data.stat_data['901_rules_poc'])!==JSON.stringify(saved[anchor.messageId+1].variables[anchor.swipeId].stat_data['901_rules_poc']))throw Error('Active and disk roots differ');
 const context=storyKnowledge.context(),state=storyKnowledge.read();
 const result=await labPost('clinic-topic-evidence',{label:labLabel.value,chatId:anchor.chatId,anchor,root:data.stat_data['901_rules_poc'],
  context,state,dialogueDisabled:(await storyKnowledge.resumeDialogue()).status==='disabled'});
 return '保存与读回一致 '+labLabel.value+' '+result.seedSha256.slice(0,12);
});
labButton('切回隔离父分支',async()=>{await labTavern().openCharacterChat(labParent);return '隔离父分支已打开';});
labButton('重开同一测试分支',async()=>{await labTavern().openCharacterChat(labChild());return '测试分支已从服务器加载';});
window.addEventListener('pagehide',()=>labPanel.remove());
