// Bounded, synthetic scenario test. No existing card or chat is replaced.
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),out=resolve(root,'output/replay_tavern/six_books_20261023_candidate/scene_test');
const candidate=resolve(out,'..'),route='/901-scene-smoke',name='901 判定场景隔离测试';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(p,d)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(d,null,2)+'\n');};
const plan=await read(resolve(out,'scenario-plan.json'));
const {createOpeningFixture}=await import(pathToFileURL(resolve(root,'work/rules_engine/gm_runtime/opening.mjs')));
const {initializeTestState}=await import(pathToFileURL(resolve(root,'work/rules_engine/mvu_poc/adapter.mjs')));
const fixture=createOpeningFixture();
const player=fixture.actors.player;
if(player.state.health.intact!==12||player.state.health.L||player.state.health.A||player.state.health.B)throw Error('Healthy opening fixture required');
const stage=resolve(out,'public/901-scene-smoke');
const info=await read(resolve(root,'output/replay_tavern/opening_combat_20261022_candidate/build-info.json'));
for(const file of info.runtimeFiles){
  const target=resolve(stage,file);await mkdir(dirname(target),{recursive:true});
  let source=(await readFile(resolve(root,file),'utf8')).replaceAll('/901-rules-runtime/',route+'/').replaceAll('/901-opening-combat/',route+'/').replaceAll('/901-combat-runtime/',route+'/');
  if(file.endsWith('/replay-gate-script.example.js'))source=source.replace("mark('response_received');","mark('response_received', { classificationDecision: lastDecision });");
  await writeFile(target,source);
}
await writeFile(resolve(stage,'work/rules_engine/gm_runtime/scene-fixture.mjs'),`import {createOpeningFixture} from './opening.mjs';
export const SCENE_CONTEXT='本聊天是独立非Canon判定测试。当前现场与参数仅按本聊天开场；不引入旧开场同伴、敌人或既往伤势。';
export function createHealthySceneFixture(){const f=createOpeningFixture();return {...f,actors:{player:f.actors.player},encounters:{},encounterOptions:[]};}
`);
await save(resolve(stage,'work/character_builder/real_character/yulinfeng_opening_20261022.baseline.json'),fixture.baseline);
await save(resolve(stage,'scene-binding.json'),{bindings:[]});
await writeFile(resolve(stage,'narrative-style.json'),await readFile(resolve(root,'output/replay_tavern/opening_combat_20261022_candidate/public/901-opening-combat/narrative-style.json')));
const card=await read(resolve(candidate,'import/901_帝都初始卡_六书候选.card.json'));
card.name=name;card.data.name=name;card.data.scenario='独立非Canon判定测试，具体场景由每个新聊天开场提供。只有御临风采用真实初始卡；不改变正式剧情、关系、奖励或库存。';
card.data.first_mes=card.data.scenario;
const books=(await read(resolve(candidate,'minimal_test/live-install.json'))).books;
card.data.extensions.world=books[0];card.data.character_book.name=books[0];
const script=card.data.extensions.tavern_helper.scripts[1];
script.content=script.content.replaceAll('/901-opening-combat/',route+'/')
  .replace(/profile:\{lorebooks:\[[^\]]+\],debug:false,/,`profile:{lorebooks:${JSON.stringify(books)},debug:true,`)
  .replace('{createOpeningFixture,OPENING_SCENE:INTEGRATION_SCENE}','{createHealthySceneFixture:createOpeningFixture,SCENE_CONTEXT:INTEGRATION_SCENE}')
  .replace("/gm_runtime/opening.mjs'","/gm_runtime/scene-fixture.mjs'")
  .replace(':INTEGRATION_SCENE;',':(SillyTavern.chat[0]?.mes||INTEGRATION_SCENE);');
await save(resolve(out,'scenario-test.card.json'),card);
if(!process.argv.includes('--install')){console.log(JSON.stringify({stage,name,cases:plan.cases.map(c=>c.id),health:player.state.health}));process.exit(0);}
const cases=plan.cases.map(c=>({...c,chatId:`901 判定场景 ${c.id} - 2026-10-23`}));
for(const c of cases){let exists=false;try{await access(`D:/github/sillyTavern/data/default-user/chats/${name}/${c.chatId}.jsonl`);exists=true;}catch{}if(exists)throw Error('Existing test chat; refusing overwrite');}
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
async function post(path,data){const r=await fetch('http://localhost:8000'+path,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error(`${path}: ${r.status}`);return r.json();}
const form=new FormData();form.append('avatar',new Blob([JSON.stringify(card)],{type:'application/json'}),'scenario-test.card.json');form.append('file_type','json');
const response=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers,body:form}),imported=await response.json();
if(!response.ok||!imported.file_name)throw Error('Test card import failed');
const avatar=imported.file_name;
const settings=await read('D:/github/sillyTavern/data/default-user/settings.json');
settings.world_info_settings.world_info.charLore??=[];
settings.world_info_settings.world_info.charLore.push({name:avatar.replace(/\.png$/,''),extraBooks:books.slice(1)});
await post('/api/settings/save',settings);
for(const c of cases){
  let data={initialized_lorebooks:{},stat_data:{},schema:{},display_data:{},delta_data:{}};
  await initializeTestState({mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},expectedChatId:c.chatId,
    getAnchor:()=>({chatId:c.chatId,messageId:0,swipeId:0}),actors:{player:structuredClone(player)}});
  const mes=`【${c.title}｜独立非Canon测试】\n${c.scene}`;
  const rows=[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},
    {name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes,extra:{},swipe_id:0,swipes:[mes],swipe_info:[{extra:{}}],variables:[data]}];
  await post('/api/chats/save',{avatar_url:avatar,file_name:c.chatId,chat:rows});
  await writeFile(resolve(out,`${c.id}-initial.jsonl`),rows.map(JSON.stringify).join('\n')+'\n');
}
const oai=settings.oai_settings,result={name,avatar,route,books,model:{source:oai.chat_completion_source,model:oai.google_model},cases};
await save(resolve(out,'live-install.json'),result);console.log(JSON.stringify({name,avatar,model:result.model,cases:cases.map(c=>({id:c.id,chatId:c.chatId}))},null,2));
