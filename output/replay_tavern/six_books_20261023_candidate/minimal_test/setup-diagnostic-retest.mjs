import {readFile,writeFile,access} from 'node:fs/promises';
const out=new URL('./',import.meta.url),install=JSON.parse(await readFile(new URL('live-install.json',out),'utf8'));
const chatId='901 六书JS诊断修复复测 - 2026-10-23';
let exists=false;try{await access(`D:/github/sillyTavern/data/default-user/chats/${install.name}/${chatId}.jsonl`);exists=true;}catch{}
if(exists)throw Error('Retest chat already exists; refusing overwrite');
const rows=(await readFile(new URL('initial.jsonl',out),'utf8')).trim().split('\n').map(JSON.parse);
rows[1].variables[0].stat_data['901_rules_poc'].chatId=chatId;
rows[1].send_date=new Date().toISOString();
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const r=await fetch('http://localhost:8000/api/chats/save',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},
  body:JSON.stringify({avatar_url:install.avatar,file_name:chatId,chat:rows})});
if(!r.ok)throw Error(`New retest chat failed: ${r.status}`);
await writeFile(new URL('diagnostic-retest-install.json',out),JSON.stringify({name:install.name,avatar:install.avatar,chatId},null,2)+'\n');
console.log(JSON.stringify({name:install.name,chatId}));
