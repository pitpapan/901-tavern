// Continuation evidence only. No automatic receipt, extraction or external sender.
const {readPersistedTavernChat:readContinuationChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const continuationDocument=window.top.document;
continuationDocument.getElementById('continuation-clinic-lab')?.remove();
const continuationPanel=continuationDocument.createElement('section');continuationPanel.id='continuation-clinic-lab';
continuationPanel.style.cssText='position:fixed;right:10px;top:42px;z-index:99999;background:#172b29;color:white;padding:10px;border:1px solid #9ab;font:13px sans-serif;max-width:345px';
const continuationStatus=continuationDocument.createElement('pre');continuationStatus.style.cssText='white-space:pre-wrap';continuationPanel.append(continuationStatus);continuationDocument.body.append(continuationPanel);
const continuationDisabled=window.top.__901StoryKnowledge.configureDialogueHost({enabled:false});
async function continuationAudit(suffix){
 const anchor={chatId:SillyTavern.getCurrentChatId(),messageId:SillyTavern.chat.length-1,swipeId:SillyTavern.chat.at(-1)?.swipe_id??0};
 await SillyTavern.saveChat();
 const mvuData=Mvu.getMvuData({type:'message',message_id:anchor.messageId});
 const saved=await readContinuationChat({tavern:SillyTavern,chatId:anchor.chatId});
 const savedPage=saved[anchor.messageId+1]?.variables?.[anchor.swipeId];
 const context=storyKnowledge.context();
 const evidence={label:'continuation-'+(continuationIsBranch?'branch':'parent')+'-'+suffix,nonCanon:true,
  anchor,metadata:continuationMetadata,adoption:continuationAdoption,dialogueHost:window.top.__901DialogueHost,
  disableResult:continuationDisabled,context,mvuData,savedPage,knowledge:storyKnowledge.read(),
  savedMessage:saved[anchor.messageId+1]?.mes,messages:SillyTavern.chat.length,savedMessages:saved.length-1,
  memory:window.top.AutoCardUpdaterAPI?.exportTableAsJson?.()??null,
  sameSavedRoot:JSON.stringify(mvuData.stat_data?.['901_rules_poc'])===JSON.stringify(savedPage?.stat_data?.['901_rules_poc'])};
 const ctx=SillyTavern.getContext?.()??SillyTavern;
 const r=await fetch('/api/backends/chat-completions/clinic-natural-evidence',{method:'POST',headers:ctx.getRequestHeaders(),body:JSON.stringify(evidence)});
 if(!r.ok||!evidence.sameSavedRoot)throw Error('Continuation saved state readback failed');
 continuationStatus.textContent='连续剧情 · 隔离非Canon\n'+(continuationIsBranch?'534的独立续玩分支':'534实际正文母本')+
  '\n抽取关闭；分类为本地NO_CHECK\n外部额度0；当前仅准备首轮请求\nrevision '+mvuData.stat_data['901_rules_poc'].revision+' / 保存读回一致\n'+context.actorKnowledge.map(a=>a.name+'：'+a.facts.length+'项关键知情').join('\n');
 return evidence;
}
const continuationAuditButton=continuationDocument.createElement('button');continuationAuditButton.textContent='核对并保存续玩状态';
continuationAuditButton.onclick=async()=>{continuationAuditButton.disabled=true;try{await continuationAudit('manual');}catch(e){continuationStatus.textContent='隔离准备失败：'+e.message;}finally{continuationAuditButton.disabled=false;}};
continuationPanel.append(continuationAuditButton);
await continuationAudit('startup');
window.addEventListener('pagehide',()=>continuationPanel.remove());
