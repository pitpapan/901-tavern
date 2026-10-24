// Imports a NEW isolated card and chats through official local Tavern APIs.
// No generation endpoint, model change, combat round, or game dice is invoked.
import {readFile,writeFile,access} from 'node:fs/promises';
import {createRecoveryFixture} from './recovery-fixture.mjs';
import {initializeTestState} from '../mvu_poc/adapter.mjs';
const out=new URL('../../../output/replay_tavern/recovery_playtest_20261023_candidate/',import.meta.url);
const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
const model={source:settings.chat_completion_source,model:settings.chat_completion_source==='makersuite'?settings.google_model:settings.openai_model};
const card=JSON.parse(await readFile(new URL('import/901_药品休息隔离实测.card.json',out),'utf8'));
const name=card.data.name;
const retest=process.argv.includes('--retest');
const prior=retest?JSON.parse(await readFile(new URL('live-install.json',out),'utf8')):null;
const scenarios=retest?[{id:'main',chatId:'901 药品休息 主链复测 - 2026-10-23'}]:[{id:'main',chatId:'901 药品休息 主链实测 - 2026-10-23'},{id:'medicine-a',chatId:'901 药品休息 药A实测 - 2026-10-23'}];
for(const scenario of scenarios) {
  let exists=false;try{await access(`D:/github/sillyTavern/data/default-user/chats/${name}/${scenario.chatId}.jsonl`);exists=true;}catch{}
  if(exists)throw Error(`Refusing to overwrite existing test chat: ${scenario.chatId}`);
}
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
let avatar=prior?.installed.find(s=>s.id==='main').avatar;
if(!retest) {
  const form=new FormData();form.append('avatar',new Blob([JSON.stringify(card)],{type:'application/json'}),'901_药品休息隔离实测.card.json');form.append('file_type','json');
  const imported=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers,body:form});
  const importedData=await imported.json();if(!imported.ok||!importedData.file_name)throw Error('New recovery card import failed');
  avatar=importedData.file_name;
}
const installed=prior?prior.installed.filter(s=>s.id!=='main'):[];
for(const scenario of scenarios) {
  const fixture=createRecoveryFixture();
  let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
  await initializeTestState({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},
    expectedChatId:scenario.chatId,getAnchor:()=>({chatId:scenario.chatId,messageId:0,swipeId:0}),actors:fixture.actors});
  const row={name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:card.data.first_mes,extra:{},
    swipe_id:0,swipes:[card.data.first_mes],swipe_info:[{extra:{}}],variables:[data]};
  const chat=[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},row];
  const saved=await fetch('http://localhost:8000/api/chats/save',{method:'POST',headers:{...headers,'Content-Type':'application/json'},
    body:JSON.stringify({avatar_url:avatar,file_name:scenario.chatId,chat})});
  if(!saved.ok)throw Error(`New isolated recovery chat save failed: ${saved.status}`);
  await writeFile(new URL(`${scenario.id}-initial.jsonl`,out),chat.map(r=>JSON.stringify(r)).join('\n')+'\n');
  installed.push({...scenario,name,avatar});
}
const result={model:prior?.model??model,installed,...(prior?{previousMain:prior.installed.find(s=>s.id==='main')}:{}),scope:'new isolated card/chats; synthetic fixture only; no generated game events or fixed dice'};
await writeFile(new URL('live-install.json',out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
