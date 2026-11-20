// Additional controls for the existing isolated fixture, excluded from the candidate package.
async function communicationPromise(){
 const before=clinicAnchor(),sourceQuote='这件事先不要向御临风和黄泉透露，等我们单独确认后再说。';
 const text='桌外隔离验收事件（非正式剧情）：同一来客向布莱特补充约定：“'+sourceQuote+'”布莱特听到并答应了该约定；另两人未听见。';
 await createChatMessages([{role:'system',name:'隔离事件来源',message:text,extra:{clinicFixture:true}}]);
 await carryTestState({mvu:Mvu,getSourceAnchor:()=>before,getAnchor:clinicAnchor,expectedChatId:before.chatId});
 await SillyTavern.saveChat();
 await storyKnowledgeController.receiveKnowledge({id:'browser.communication.promise',status:'received',authority:'host-confirmed',sourceAnchor:{...clinicAnchor(),text},recipientIds:['bright'],propositionRefs:[CLINIC_KNOWLEDGE_CATALOG.facts[0].id],channel:'message',belief:'confirmed',disclosure:{sourceQuote}});
 clinicInspect();
}
async function communicationMemory(){
 const api=window.top.AutoCardUpdaterAPI,data=structuredClone(api.exportTableAsJson());
 const fixtures=await (await fetch('/communication-memory-fixture.json')).json();
 for(const [key,rows] of Object.entries(fixtures.rows)){
  const table=data[key];if(!table?.content)throw Error('Missing original memory table '+key);
  for(const row of rows)if(!table.content.some(old=>String(old[0])===String(row[0])))table.content.push(row);
 }
 if(!await api.importTableAsJson(JSON.stringify(data),{persist:true}))throw Error('Original memory import rejected');
 clinicInspect();
}
for(const [label,run] of [['登记明确约定（隔离）',communicationPromise],['加载非空记忆（隔离）',communicationMemory]]){
 const button=clinicDoc.createElement('button');button.textContent=label;button.style.cssText='display:block;margin:5px 0;color:#111;background:#ddd';
 button.onclick=async()=>{button.disabled=true;try{await run();}catch(e){clinicStatus.textContent='隔离操作失败：'+e.message;}finally{button.disabled=false;}};clinicPanel.append(button);
}
