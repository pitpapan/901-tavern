// Bounded evidence controls only; classification and narration use real responses.
const {readPersistedTavernChat:readLiveClassificationChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const liveClassDocument=window.top.document;
liveClassDocument.getElementById('reply-recovery-lab')?.remove();
liveClassDocument.getElementById('real-classification-lab')?.remove();
const liveClassPanel=liveClassDocument.createElement('section');liveClassPanel.id='real-classification-lab';
liveClassPanel.style.cssText='position:fixed;right:8px;top:40px;z-index:99999;background:#172b29;color:white;padding:10px;max-width:310px;font:13px sans-serif';
const liveClassStatus=liveClassDocument.createElement('pre');liveClassStatus.style.cssText='white-space:pre-wrap';
liveClassStatus.textContent='真实分类＋正文 · 隔离非Canon\n两轮合计上限4次；失败和重试计入\n自动知情整理关闭，旧记录保留';liveClassPanel.append(liveClassStatus);liveClassDocument.body.append(liveClassPanel);
storyKnowledgeController.configureKnowledgeDialogueHost({enabled:false});
const liveClassLabel=liveClassDocument.createElement('input');liveClassLabel.setAttribute('aria-label','验证快照名称');liveClassLabel.value='snapshot';liveClassPanel.append(liveClassLabel);
async function liveClassAudit(label){
 await SillyTavern.saveChat();
 const saved=await readLiveClassificationChat({tavern:SillyTavern,chatId:continuationChatId});
 const pages=SillyTavern.chat.map((m,i)=>Mvu.getMvuData({type:'message',message_id:i}));
 const value={label,nonCanon:true,browserUpstreamCalls:0,classificationFixture:false,narrationFixture:false,modelLedger:'run.json',
  chatId:continuationChatId,nativeParent:continuationMetadata?.main_chat,adoption:continuationAdoption,chat:structuredClone(SillyTavern.chat),pages,saved};
 const context=SillyTavern.getContext?.()??SillyTavern;
 const response=await fetch('/api/backends/chat-completions/reply-diagnostic-evidence',{method:'POST',headers:context.getRequestHeaders(),body:JSON.stringify(value)});
 if(!response.ok)throw Error('保存验证快照失败 '+response.status);
 liveClassStatus.textContent='已保存验证快照：'+label+'\n分类与正文均消费原模型原始响应\n浏览器直接外发0；实际调用另记账';
}
const liveClassSave=liveClassDocument.createElement('button');liveClassSave.textContent='保存验证状态';
liveClassSave.onclick=async()=>{liveClassSave.disabled=true;try{await liveClassAudit(liveClassLabel.value);}catch(e){liveClassStatus.textContent=e.message;}finally{liveClassSave.disabled=false;}};liveClassPanel.append(liveClassSave);
await liveClassAudit('startup-'+SillyTavern.chat.length+'-'+Date.now());
diagnosticBoot.remove();
window.addEventListener('pagehide',()=>liveClassPanel.remove());
