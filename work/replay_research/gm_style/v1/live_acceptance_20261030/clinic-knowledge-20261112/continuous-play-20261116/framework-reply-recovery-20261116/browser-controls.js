// Disposable local fault injection. All generated decisions/prose are fixtures.
const {readPersistedTavernChat:readDiagnosticChat}=await import('/901-opening-combat/work/rules_engine/mvu_poc/adapter.mjs');
const diagnosticDocument=window.top.document;
diagnosticDocument.getElementById('reply-recovery-lab')?.remove();
const diagnosticPanel=diagnosticDocument.createElement('section');diagnosticPanel.id='reply-recovery-lab';
diagnosticPanel.style.cssText='position:fixed;right:8px;top:40px;z-index:99999;background:#172b29;color:white;padding:10px;max-width:320px;font:13px sans-serif';
const diagnosticStatus=diagnosticDocument.createElement('pre');diagnosticStatus.style.cssText='white-space:pre-wrap';
diagnosticStatus.textContent='框架恢复诊断 · 隔离非Canon\n全部分类与正文为本地夹具；外部调用0\n可选知情整理已关闭';diagnosticPanel.append(diagnosticStatus);
diagnosticDocument.body.append(diagnosticPanel);
storyKnowledgeController.configureKnowledgeDialogueHost({enabled:false});
const diagnosticContext=()=>SillyTavern.getContext?.()??SillyTavern;
const diagnosticPost=async(path,value)=>{
 const response=await fetch('/api/backends/chat-completions/'+path,{method:'POST',headers:diagnosticContext().getRequestHeaders(),body:JSON.stringify(value)});
 if(!response.ok)throw Error('Local diagnostic request failed '+response.status);return response.json();
};
function diagnosticButton(text,action){const b=diagnosticDocument.createElement('button');b.textContent=text;b.onclick=async()=>{b.disabled=true;try{await action();}catch(e){diagnosticStatus.textContent='诊断操作未完成：'+e.message;}finally{b.disabled=false;}};diagnosticPanel.append(b);}
for(const [text,mode] of [['下一次分类格式错误','malformed'],['下一轮两次分类超时','timeout'],['恢复本地正常分类','normal']])
 diagnosticButton(text,async()=>{await diagnosticPost('reply-diagnostic-mode',{mode});diagnosticStatus.textContent='本地注入模式：'+mode+'\n分类与正文均为夹具；外部调用0';});
diagnosticButton('注入正文后整理失败',async()=>{
 storyKnowledgeController.configureKnowledgeDialogueHost({enabled:true,outputContract:'dialogue-reception/7',complete:async()=>{throw Error('local optional extraction failure');}});
 diagnosticStatus.textContent='下一份正常正文保存后，整理回调将本地失败\n不会外发抽取请求';
});
diagnosticButton('关闭可选整理',async()=>{storyKnowledgeController.configureKnowledgeDialogueHost({enabled:false});diagnosticStatus.textContent='可选整理已关闭；旧待核及来源原样保留';});
const diagnosticLabel=diagnosticDocument.createElement('input');diagnosticLabel.setAttribute('aria-label','诊断快照名称');diagnosticLabel.value='snapshot';diagnosticPanel.append(diagnosticLabel);
async function diagnosticAudit(label){
 await SillyTavern.saveChat();
 const saved=await readDiagnosticChat({tavern:SillyTavern,chatId:continuationChatId});
 const pages=SillyTavern.chat.map((m,i)=>Mvu.getMvuData({type:'message',message_id:i}));
 const value={label,nonCanon:true,externalModelCalls:0,fixtureNarration:true,chatId:continuationChatId,
  nativeParent:continuationMetadata?.main_chat,adoption:continuationAdoption,chat:structuredClone(SillyTavern.chat),pages,saved};
 await diagnosticPost('reply-diagnostic-evidence',value);
 diagnosticStatus.textContent='已保存诊断快照：'+label+'\n聊天 '+SillyTavern.chat.length+' 楼；外部调用0\n分类与正文均为本地夹具';
}
diagnosticButton('保存诊断快照',()=>diagnosticAudit(diagnosticLabel.value));
await diagnosticAudit('startup-'+SillyTavern.chat.length+'-'+Date.now());
window.addEventListener('pagehide',()=>diagnosticPanel.remove());
