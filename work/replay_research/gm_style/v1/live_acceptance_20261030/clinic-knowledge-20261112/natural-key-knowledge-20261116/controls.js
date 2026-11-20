// Disposable local controls; reuses original receive, carry and persisted readback.
if(window.top.location.port!=='18126')throw Error('Wrong isolation origin');
const {carryTestState,readPersistedTavernChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const naturalDoc=window.top.document;
naturalDoc.getElementById('natural-clinic-lab')?.remove();
const naturalPanel=naturalDoc.createElement('section');naturalPanel.id='natural-clinic-lab';
naturalPanel.style.cssText='position:fixed;right:12px;top:42px;z-index:99999;background:#172b29;color:white;padding:12px;border:1px solid #9ab;font:13px sans-serif;max-width:345px';
const naturalStatus=naturalDoc.createElement('pre');naturalStatus.style.cssText='white-space:pre-wrap;max-height:170px;overflow:auto';naturalPanel.append(naturalStatus);naturalDoc.body.append(naturalPanel);
const naturalAnchor=()=>({chatId:SillyTavern.getCurrentChatId(),messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0});
let naturalPhase=Object.keys(storyKnowledge.read().knowledge).length?'03-reopened':'01-before';
const naturalDisabled=window.top.__901StoryKnowledge.configureDialogueHost({enabled:false});
async function naturalAudit(suffix){
 const anchor=naturalAnchor();
 await SillyTavern.saveChat();
 const mvuData=Mvu.getMvuData({type:'message',message_id:anchor.messageId});
 const saved=await readPersistedTavernChat({tavern:SillyTavern,chatId:anchor.chatId});
 const savedPage=saved[anchor.messageId+1]?.variables?.[anchor.swipeId];
 const root=mvuData.stat_data?.['901_rules_poc'];
 const savedRoot=savedPage?.stat_data?.['901_rules_poc'];
 const context=storyKnowledge.context();
 const evidence={label:naturalPhase+'-'+suffix,nonCanon:true,anchor,dialogueHost:window.top.__901DialogueHost,
  disableResult:naturalDisabled,context,mvuData,savedPage,knowledge:storyKnowledge.read(),
  memory:window.top.AutoCardUpdaterAPI?.exportTableAsJson?.()??null,
  sameSavedRoot:JSON.stringify(root)===JSON.stringify(savedRoot),savedMessage:saved[anchor.messageId+1]?.mes,
  messages:SillyTavern.chat.length,savedMessages:saved.length-1};
 const ctx=SillyTavern.getContext?.()??SillyTavern;
 const response=await fetch('/api/backends/chat-completions/clinic-natural-evidence',{method:'POST',headers:ctx.getRequestHeaders(),body:JSON.stringify(evidence)});
 if(!response.ok)throw Error('Evidence save failed '+response.status);
 if(!evidence.sameSavedRoot)throw Error('Active MVU differs from saved current floor');
 naturalStatus.textContent='医馆自然叙事 · 隔离非Canon\n通用对白抽取：关闭（重开仍关闭）\n分类：本地NO_CHECK，非分类验收\n'+naturalPhase+' / MVU revision '+root.revision+' / 已保存读回一致\n'+context.actorKnowledge.map(a=>a.name+'：'+a.facts.length+'项关键知情').join('\n');
 return evidence;
}
async function naturalReceive(){
 if(Object.keys(storyKnowledge.read().knowledge).length)throw Error('This isolated receipt already exists');
 const before=naturalAnchor();
 const text='桌外隔离验收事件（非正式剧情）：可信来客私下向布莱特告知：九雪医馆馆主与雪老有旧。布莱特已实际听到；御临风与黄泉均未听到。';
 await createChatMessages([{role:'system',name:'隔离事件来源',message:text,extra:{clinicFixture:true,manualReception:true}}]);
 await carryTestState({mvu:Mvu,getSourceAnchor:()=>before,getAnchor:naturalAnchor,expectedChatId:before.chatId});
 await SillyTavern.saveChat();
 await window.top.__901StoryKnowledge.receive({id:'natural.clinic.received',status:'received',authority:'host-confirmed',
  sourceAnchor:{...naturalAnchor(),text},recipientIds:['bright'],propositionRefs:[CLINIC_KNOWLEDGE_CATALOG.facts[0].id],channel:'message',belief:'confirmed'});
 naturalPhase='02-received';await naturalAudit('received');
}
for(const [label,run] of [['核对并保存状态',()=>naturalAudit('manual')],['仅布莱特接收（人工测试）',naturalReceive]]){
 const b=naturalDoc.createElement('button');b.textContent=label;b.style.cssText='display:block;margin:5px 0;color:#111;background:#ddd';
 b.onclick=async()=>{b.disabled=true;try{await run();}catch(e){naturalStatus.textContent='实验失败：'+e.message;}finally{b.disabled=false;}};naturalPanel.append(b);
}
await naturalAudit('startup');
window.addEventListener('pagehide',()=>naturalPanel.remove());
