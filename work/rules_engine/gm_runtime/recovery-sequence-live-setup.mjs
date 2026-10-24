// One NEW synthetic chat, through Tavern's official save API. No generation,
// fixed dice, existing-chat replacement, character reimport, or model change.
import {readFile,writeFile,access,mkdir} from 'node:fs/promises';
import {createRecoveryFixture} from './recovery-fixture.mjs';
import {initializeTestState} from '../mvu_poc/adapter.mjs';
const out=new URL('../../../output/replay_tavern/recovery_sequence_20261023_candidate/',import.meta.url);
const previousOut=new URL('../../../output/replay_tavern/recovery_playtest_20261023_candidate/',import.meta.url);
const prior=JSON.parse(await readFile(new URL('live-install.json',previousOut),'utf8'));
const reference=prior.installed.find(s=>s.id==='main');
const scenario={id:'sequence',name:reference.name,avatar:reference.avatar,chatId:'901 药品休息 复合声明实测 - 2026-10-23'};
let exists=false;try{await access(`D:/github/sillyTavern/data/default-user/chats/${scenario.name}/${scenario.chatId}.jsonl`);exists=true;}catch{}
if(exists)throw Error(`Refusing to overwrite existing sequence chat: ${scenario.chatId}`);
await mkdir(out,{recursive:true});
const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
const model={source:settings.chat_completion_source,model:settings.chat_completion_source==='makersuite'?settings.google_model:settings.openai_model};
const fixture=createRecoveryFixture();
let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
await initializeTestState({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},
  expectedChatId:scenario.chatId,getAnchor:()=>({chatId:scenario.chatId,messageId:0,swipeId:0}),actors:fixture.actors});
const text='【药品与休息复合声明独立验收】\n\n安全、安静的休息室里只有御临风，可以正常睡眠。初始卡和库存沿已确认来源；完好2、冲击1、严重6、恶性3，流风10/22、意志1/3为本聊天专用合成测试缺口，不计正式剧情。尚未服药或休息。';
const row={name:scenario.name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:text,extra:{},swipe_id:0,
  swipes:[text],swipe_info:[{extra:{}}],variables:[data]};
const chat=[{user_name:'御临风',character_name:scenario.name,chat_metadata:{note_prompt:'',variables:{}}},row];
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const saved=await fetch('http://localhost:8000/api/chats/save',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},
  body:JSON.stringify({avatar_url:scenario.avatar,file_name:scenario.chatId,chat})});
if(!saved.ok)throw Error(`New sequence chat save failed: ${saved.status}`);
await writeFile(new URL('sequence-initial.jsonl',out),chat.map(r=>JSON.stringify(r)).join('\n')+'\n');
const result={model,installed:[scenario],scope:'one new synthetic compound-declaration chat; earlier evidence and actual campaign saves untouched'};
await writeFile(new URL('live-install.json',out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
