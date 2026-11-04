// Isolated read-only request recorder; only the explicit save button writes chat evidence.
const arm=document.createElement('button'),save=document.createElement('button');
arm.textContent='开始长期记忆采集';save.textContent='保存长期记忆证据';
panel.append(arm,save);let run=null,off=null;
arm.onclick=()=>{if(!valid())return;run={beforeCount:ctx().chat.length,requests:[]};off=eventOn(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>run.requests.push({model:x.model,messages:structuredClone(x.messages)}));status.textContent='长期记忆采集中；可发送验收问题';};
save.onclick=async()=>{if(!valid()||!run)return;if(typeof off==='function')off();else off?.stop?.();run.afterMessages=ctx().chat.slice(run.beforeCount).map(m=>({user:m.is_user,text:m.mes}));ctx().chatMetadata.memory_lifecycle_evidence=run;ctx().updateChatMetadata(ctx().chatMetadata);await ctx().saveChat();status.textContent='长期记忆证据已保存';};
