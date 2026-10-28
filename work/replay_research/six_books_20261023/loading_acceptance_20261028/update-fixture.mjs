// Refresh only the already installed W4 fixture after a reviewed fix.
import {readFile,writeFile,cp} from 'node:fs/promises';
import {resolve} from 'node:path';
const base=resolve('output/replay_tavern/six_books_20261023_candidate');
const out=resolve(base,'scene_test/world-loading-20261028');
const config=JSON.parse(await readFile(resolve(out,'config.json'),'utf8'));
if(config.name!=='901 世界书加载验收 20261028')throw Error('Wrong fixture');
const chat=resolve('D:/github/sillyTavern/data/default-user/chats',config.name,config.chatId+'.jsonl');
await writeFile(resolve(out,process.argv[2]||'listener-failure.jsonl'),await readFile(chat),{flag:'wx'});
await cp(resolve(out,'runtime'),resolve('D:/github/sillyTavern/public/901-world-loading-20261028'),{recursive:true});
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
for(const name of config.books){
 const original=name.replace(/^W4_20261028_/,'');
 const data=JSON.parse(await readFile(resolve(base,'import',original+'.json'),'utf8'));
 const r=await fetch('http://localhost:8000/api/worldinfo/edit',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({name,data})});
 if(!r.ok)throw Error(name+' '+r.status);
}
console.log('Updated isolated W4 scripts/books; original mixed evidence backed up, no chat overwritten.');
