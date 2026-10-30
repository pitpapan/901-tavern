// Isolated UI evidence only. Does not generate, modify rules, or intercept requests.
const cfg=await(await fetch('/901-cross-scene-20261030/config.json')).json();
const doc=window.top.document,ctx=()=>window.top.SillyTavern.getContext();
const valid=()=>ctx().characters[ctx().characterId]?.name===cfg.name&&ctx().chatId===cfg.chatId;
if(!valid())throw Error('Wrong narrative acceptance card/chat');
await waitGlobalInitialized('Mvu');
const panel=doc.createElement('section');panel.id='narrative-acceptance-recorder';panel.style.cssText='padding:8px;background:#183132;color:white;border:1px solid #9bd';
const title=doc.createElement('b');title.textContent='20261030 叙事隔离验收';panel.append(title);
const arm=doc.createElement('button');arm.className='menu_button';arm.textContent='开始本轮采集';panel.append(arm);
const finish=doc.createElement('button');finish.className='menu_button';finish.textContent='保存本轮证据';panel.append(finish);
const status=doc.createElement('pre');status.style.cssText='white-space:pre-wrap;max-height:160px;overflow:auto';panel.append(status);
(doc.querySelector('#sheld')||doc.body).prepend(panel);
let run=null;const stops=[];
const state=()=>{const r=Mvu.getMvuData({type:'message',message_id:ctx().chat.length-1})?.stat_data?.['901_rules_poc'];return r?{chatId:r.chatId,revision:r.revision,battleMode:r.battle?.mode??null,operations:r.operations??null}:null;};
const brief=x=>({world:x.world,uid:x.uid,name:x.comment,disabled:x.disable});
function listen(e,f){eventOn(e,f);stops.push(()=>eventRemoveListener(e,f));}
function next(){const count=ctx().chat.filter(x=>x.is_user).length;status.textContent='下一轮 '+(cfg.rounds[count]?.id??'全部完成')+'\n'+(cfg.rounds[count]?.input??'不要再发送。');}
arm.onclick=()=>{try{if(!valid()||run)throw Error('Wrong chat or already recording');const count=ctx().chat.filter(x=>x.is_user).length,test=cfg.rounds[count];if(!test)throw Error('All rounds done');
 run={id:test.id,input:test.input,started:new Date().toISOString(),beforeMessages:ctx().chat.length,beforeState:state(),requests:[],activated:[]};
 listen(tavern_events.CHAT_COMPLETION_SETTINGS_READY,x=>{run.requests.push({model:x.model,messages:structuredClone(x.messages)});status.textContent='采集 '+test.id+'；settings事件 '+run.requests.length;});
 listen(tavern_events.WORLD_INFO_ACTIVATED,x=>run.activated.push(x.map(brief)));
 status.textContent='已开始 '+test.id+'\n用原生发送框发送：'+test.input;arm.disabled=true;
}catch(e){status.textContent=String(e.message);}};
finish.onclick=async()=>{try{if(!run||!valid())throw Error('No recording');for(const stop of stops.splice(0))stop();
 run.finished=new Date().toISOString();run.afterState=state();run.messages=ctx().chat.slice(run.beforeMessages).map((x,i)=>({id:run.beforeMessages+i,user:x.is_user,text:x.mes,gate:x.extra?.['901_replay_gate'],narrative:x.extra?.['901_narrative']}));
 const runs=structuredClone(ctx().chatMetadata.cross_scene_20261030??[]);runs.push(run);ctx().updateChatMetadata({cross_scene_20261030:runs});await ctx().saveChat();status.textContent='已保存 '+run.id+'；settings事件 '+run.requests.length+'。本轮已保存。';run=null;arm.disabled=false;
}catch(e){status.textContent=String(e.message);}};
next();window.addEventListener('pagehide',()=>{for(const stop of stops)stop();panel.remove();});
