// Add two isolated chats to the existing test card; do not replace prior evidence.
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),base=resolve(root,'output/replay_tavern/six_books_20261023_candidate/scene_test');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const plan=await read(resolve(base,'auto-dc-plan.json'));
const previous=await read(resolve(base,'live-install.json'));
const fixed=process.argv.includes('--fixed');
const out=resolve(base,fixed?'auto-dc-fixed':'auto-dc');await mkdir(out,{recursive:true});
const {createOpeningFixture}=await import(pathToFileURL(resolve(root,'work/rules_engine/gm_runtime/opening.mjs')));
const {initializeTestState}=await import(pathToFileURL(resolve(root,'work/rules_engine/mvu_poc/adapter.mjs')));
const player=createOpeningFixture().actors.player;
const cases=plan.cases.map(c=>({...c,chatId:`901 自动难度${fixed?'修正':''} ${c.id} - 2026-10-23`}));
for(const c of cases){let exists=false;try{await access(`D:/github/sillyTavern/data/default-user/chats/${previous.name}/${c.chatId}.jsonl`);exists=true;}catch{}if(exists)throw Error('Existing chat; refusing overwrite');}
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
for(const c of cases){
  let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
  await initializeTestState({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:c.chatId,
    getAnchor:()=>({chatId:c.chatId,messageId:0,swipeId:0}),actors:{player:structuredClone(player)}});
  const mes=`【${c.title}｜独立非Canon测试】\n${c.scene}`;
  const rows=[{user_name:'御临风',character_name:previous.name,chat_metadata:{note_prompt:'',variables:{}}},
    {name:previous.name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes,extra:{},swipe_id:0,swipes:[mes],swipe_info:[{extra:{}}],variables:[data]}];
  const response=await fetch('http://localhost:8000/api/chats/save',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({avatar_url:previous.avatar,file_name:c.chatId,chat:rows})});
  if(!response.ok)throw Error(`Chat save failed: ${response.status}`);
  await writeFile(resolve(out,`${c.id}-initial.jsonl`),rows.map(JSON.stringify).join('\n')+'\n');
}
await writeFile(resolve(out,'live-install.json'),JSON.stringify({...previous,cases},null,2)+'\n');
console.log(JSON.stringify({name:previous.name,cases:cases.map(c=>({id:c.id,chatId:c.chatId}))}));
