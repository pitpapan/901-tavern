// Official local Tavern import/save APIs only. Never initializes a battle or dice.
import {readFile,writeFile,access} from 'node:fs/promises';
import {ARENA_OPPONENTS} from './arena.mjs';
const out=new URL('../../../output/replay_tavern/arena_playtest_20261023_candidate/',import.meta.url);
const current=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
const model={source:current.chat_completion_source,model:current.chat_completion_source==='makersuite'?current.google_model:current.openai_model};
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
const installed=[];
const retest=process.argv.includes('--retest');
const selected=retest?[['mireya',ARENA_OPPONENTS.mireya]]:Object.entries(ARENA_OPPONENTS);
for(const [id,opponent]of selected) {
  const card=JSON.parse(await readFile(new URL(`import/901_擂台隔离实测_${opponent.name}.card.json`,out),'utf8'));
  const chatId=`901 擂台 ${opponent.name} 完整场${retest?'复测':'实测'} - 2026-10-23`,name=card.data.name;
  const chatPath=`D:/github/sillyTavern/data/default-user/chats/${name}/${chatId}.jsonl`;
  let exists=false;try{await access(chatPath);exists=true;}catch{}
  if(exists)throw Error(`Refusing to overwrite existing test chat: ${chatId}`);
  let avatar=`${name}.png`;
  if(!retest) {
    const form=new FormData();form.append('avatar',new Blob([JSON.stringify(card)],{type:'application/json'}),`901_擂台隔离实测_${opponent.name}.card.json`);form.append('file_type','json');
    const imported=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers,body:form});
    const result=await imported.json();if(!imported.ok||!result.file_name)throw Error(`Card import failed: ${JSON.stringify(result)}`);
    avatar=result.file_name;
  } else await access(`D:/github/sillyTavern/data/default-user/characters/${avatar}`);
  const row={name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:card.data.first_mes,extra:{},swipe_id:0,swipes:[card.data.first_mes],swipe_info:[{extra:{}}]};
  const chat=[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},row];
  const saved=await fetch('http://localhost:8000/api/chats/save',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({avatar_url:avatar,file_name:chatId,chat})});
  if(!saved.ok)throw Error(`New isolated chat save failed: ${saved.status}`);
  await writeFile(new URL(`${id}${retest?'-retest':''}-initial.jsonl`,out),chat.map(r=>JSON.stringify(r)).join('\n')+'\n');
  installed.push({id,name,avatar,chatId});
}
const result={model,installed,scope:'isolated new cards and story-only chats; no battle or fixed dice'};
await writeFile(new URL(retest?'live-retest-install.json':'live-install.json',out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
