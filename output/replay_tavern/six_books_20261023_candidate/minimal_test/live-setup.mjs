// One isolated Gemini/JS smoke. Official local APIs; never replaces a prior chat.
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const fixture=await import(pathToFileURL(resolve(root,'work/rules_engine/gm_runtime/recovery-fixture.mjs')));
const {initializeTestState}=await import(pathToFileURL(resolve(root,'work/rules_engine/mvu_poc/adapter.mjs')));
const base=resolve(root,'output/replay_tavern/six_books_20261023_candidate');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(p,d)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(d,null,2)+'\n');};
const route='/901-six-books-smoke',name='901 六书JS最小实测',chatId='901 六书JS最小实测 - 2026-10-23';
const card=await read(resolve(base,'import/901_帝都初始卡_六书候选.card.json'));
const books=(await read(resolve(base,'runtime_patch_manifest.json'))).books;
// Read the explicit profile names, so the staged test always follows this candidate.
const script=card.data.extensions.tavern_helper.scripts[1];
const originals=JSON.parse(script.content.match(/profile:\{lorebooks:(\[[^\]]+\])/)[1]);
const names=originals.map(n=>'SMOKE_'+n);
const stage=resolve(base,'minimal_test/public/901-six-books-smoke');
const info=await read(resolve(root,'output/replay_tavern/opening_combat_20261022_candidate/build-info.json'));
for(const file of [...info.runtimeFiles,'work/rules_engine/gm_runtime/recovery-fixture.mjs']){
  const dest=resolve(stage,file);await mkdir(dirname(dest),{recursive:true});
  const content=(await readFile(resolve(root,file),'utf8')).replaceAll('/901-rules-runtime/',route+'/').replaceAll('/901-combat-runtime/',route+'/').replaceAll('/901-opening-combat/',route+'/');
  await writeFile(dest,content);
}
await save(resolve(stage,'work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json'),fixture.createRecoveryFixture().baseline);
await save(resolve(stage,'scene-binding.json'),{bindings:[]});
await writeFile(resolve(stage,'narrative-style.json'),await readFile(resolve(root,'output/replay_tavern/opening_combat_20261022_candidate/public/901-opening-combat/narrative-style.json')));
card.name=name;card.data.name=name;card.data.scenario=fixture.RECOVERY_SCENE;
card.data.first_mes='【六书与JS隔离测试】\n'+fixture.RECOVERY_SCENE;
card.data.extensions.world=names[0];card.data.character_book.name=names[0];
script.content=script.content.replaceAll('/901-opening-combat/',route+'/');
originals.forEach((n,i)=>{script.content=script.content.replaceAll(n,names[i]);});
script.content=script.content.replace("{createOpeningFixture,OPENING_SCENE:INTEGRATION_SCENE}","{createRecoveryFixture:createOpeningFixture,RECOVERY_SCENE:INTEGRATION_SCENE}").replace("/gm_runtime/opening.mjs'","/gm_runtime/recovery-fixture.mjs'");
script.content+="\neventOn(tavern_events.WORLD_INFO_ACTIVATED,entries=>console.log('[901-SIX-SMOKE-ACTIVATED]',JSON.stringify(entries.map(e=>({world:e.world,uid:e.uid,comment:e.comment})))));\nconsole.log('[901-SIX-SMOKE-READY]');";
await save(resolve(base,'minimal_test/smoke.card.json'),card);
if(!process.argv.includes('--install')){console.log(JSON.stringify({stage,name,books:names.length}));process.exit(0);}
let exists=false;try{await access(`D:/github/sillyTavern/data/default-user/chats/${name}/${chatId}.jsonl`);exists=true;}catch{}
if(exists)throw Error('Test chat exists; refusing replacement');
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
async function post(path,data){const r=await fetch('http://localhost:8000'+path,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error(`${path}: ${r.status}`);return r.json();}
const existing=await post('/api/worldinfo/list',{});
if(names.some(n=>existing.some(e=>e.name===n)))throw Error('Test books exist; refusing replacement');
for(let i=0;i<names.length;i++)await post('/api/worldinfo/edit',{name:names[i],data:await read(resolve(base,'import',originals[i]+'.json'))});
const form=new FormData();form.append('avatar',new Blob([JSON.stringify(card)],{type:'application/json'}),'six-books-smoke.card.json');form.append('file_type','json');
const r=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers,body:form});const imported=await r.json();if(!r.ok||!imported.file_name)throw Error('Card import failed');
const avatar=imported.file_name;
const settings=await read('D:/github/sillyTavern/data/default-user/settings.json');
const model={source:settings.oai_settings.chat_completion_source,model:settings.oai_settings.google_model};
const wi=settings.world_info_settings.world_info;
wi.charLore??=[];wi.charLore.push({name:avatar.replace(/\.png$/,''),extraBooks:names.slice(1)});
await post('/api/settings/save',settings);
let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
await initializeTestState({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:chatId,getAnchor:()=>({chatId,messageId:0,swipeId:0}),actors:fixture.createRecoveryFixture().actors});
const mes=card.data.first_mes,row={name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes,extra:{},swipe_id:0,swipes:[mes],swipe_info:[{extra:{}}],variables:[data]};
const chat=[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},row];
await post('/api/chats/save',{avatar_url:avatar,file_name:chatId,chat});
await writeFile(resolve(base,'minimal_test/initial.jsonl'),chat.map(x=>JSON.stringify(x)).join('\n')+'\n');
const result={name,avatar,chatId,model,books:names,route};await save(resolve(base,'minimal_test/live-install.json'),result);console.log(JSON.stringify(result,null,2));
