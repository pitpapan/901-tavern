// Isolated browser fixture only. Never included in the candidate runtime package.
if(window.top.location.port!=='18123')throw Error('Clinic fixture requires the isolated port');
const {carryTestState}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const clinicDoc=window.top.document;
clinicDoc.getElementById('clinic-fixture-controls')?.remove();
const clinicPanel=clinicDoc.createElement('section');clinicPanel.id='clinic-fixture-controls';
clinicPanel.style.cssText='position:fixed;right:8px;top:48px;z-index:99990;background:#17202b;color:white;padding:10px;max-width:320px;border:1px solid #789;font:13px sans-serif';
const clinicStatus=clinicDoc.createElement('pre');clinicStatus.style.cssText='white-space:pre-wrap;max-height:180px;overflow:auto';
clinicPanel.append(clinicStatus);clinicDoc.body.append(clinicPanel);
const clinicAnchor=()=>({chatId:SillyTavern.getCurrentChatId(),messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0});
function clinicInspect(){
 const context=storyKnowledge.context(),anchor=clinicAnchor();
 clinicStatus.textContent='隔离验收 · 上游调用 0\n'+context.actorKnowledge.map(a=>a.name+'：'+a.facts.length+'项已知事实').join('\n')+'\n来源楼层 '+anchor.messageId+'\n数据库记忆：'+(window.top.AutoCardUpdaterAPI?'已装载':'未装载');
 clinicPanel.dataset.evidence=JSON.stringify({nonCanon:true,anchor,context,knowledge:storyKnowledge.read(),database:window.top.AutoCardUpdaterAPI?.exportTableAsJson()});
}
async function clinicReceive(relay){
 const before=clinicAnchor(),id=relay?'browser.relay':'browser.received';
 const text=relay?'桌外隔离验收事件（非正式剧情）：布莱特私下向黄泉转告：九雪医馆馆主与雪老有旧。黄泉已实际听到；御临风未听到。':'桌外隔离验收事件（非正式剧情）：可信来客私下向布莱特告知：九雪医馆馆主与雪老有旧。布莱特已实际听到；御临风与黄泉均未听到。';
 await createChatMessages([{role:'system',name:'隔离事件来源',message:text,extra:{clinicFixture:true}}]);
 await carryTestState({mvu:Mvu,getSourceAnchor:()=>before,getAnchor:clinicAnchor,expectedChatId:before.chatId});
 await SillyTavern.saveChat();
 await storyKnowledgeController.receiveKnowledge({id,status:'received',authority:'host-confirmed',sourceAnchor:{...clinicAnchor(),text},recipientIds:[relay?'huang':'bright'],propositionRefs:[CLINIC_KNOWLEDGE_CATALOG.facts[0].id],channel:'message',belief:'confirmed',...(relay?{senderId:'bright'}:{})});
 clinicInspect();
}
for(const [label,run] of [['检查知情与记忆',clinicInspect],['布莱特接收（隔离）',()=>clinicReceive(false)],['黄泉接收转告（隔离）',()=>clinicReceive(true)]]){
 const button=clinicDoc.createElement('button');button.textContent=label;button.style.cssText='display:block;margin:5px 0;color:#111;background:#ddd';
 button.onclick=async()=>{button.disabled=true;try{await run();}catch(e){clinicStatus.textContent='隔离操作失败：'+e.message;}finally{button.disabled=false;}};clinicPanel.append(button);
}
clinicInspect();
window.addEventListener('pagehide',()=>clinicPanel.remove());
