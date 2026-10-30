// Bounded installation: formal entry options and its adopted style asset only.
import {readFile,writeFile,mkdir,readdir,access,copyFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {patchNarrativeEntry,selectAdoptedStyle} from '../../../../../rules_engine/gm_runtime/narrative-style-projection.mjs';

const root=process.cwd(),base=resolve(root,'work/replay_research/gm_style/v1/live_acceptance_20261030');
const out=resolve(base,'formal-integration'),home='D:/github/sillyTavern';
const formalPath='data/default-user/characters/901 帝都初始卡.png';
const stylePath='public/901-opening-combat/narrative-style.json';
const name='901 正式入口汇合验收 20261030',route='/901-narrative-formal-integration-20261030/';
const hash=x=>createHash('sha256').update(x).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
function pngCard(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
const entry=card=>card.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口');
const settings=()=>read(resolve(home,'data/default-user/settings.json'));
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
async function capture(){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=hash(await readFile(p));}}
 for(const p of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,p));
 const s=await settings();return {files,oaiHash:hash(JSON.stringify(s.oai_settings)),memoryHash:hash(JSON.stringify(s.extension_settings.memory)),model:{source:s.oai_settings.chat_completion_source,model:s.oai_settings.custom_model}};
}
async function verify(installed){const before=await read(resolve(out,'protected-before.json')),changed=[];
 for(const [p,h]of Object.entries(before.files))if(hash(await readFile(resolve(home,p)))!==h)changed.push(p);
 assert.deepEqual(changed.sort(),installed?[formalPath,stylePath].sort():[]);
 const s=await settings();assert.equal(hash(JSON.stringify(s.oai_settings)),before.oaiHash);assert.equal(hash(JSON.stringify(s.extension_settings.memory)),before.memoryHash);
 if(installed){const expected=await read(resolve(out,'formal-card.expected.json')),actual=pngCard(await readFile(resolve(home,formalPath)));assert.deepEqual(actual,expected);assert.equal(await readFile(resolve(home,stylePath),'utf8'),await readFile(resolve(out,'narrative-style.json'),'utf8'));}
 const result={checkedFiles:Object.keys(before.files).length,expectedChanges:changed,allOtherFilesUnchanged:true,formalCardOnlyEntryChanged:installed,oaiSettingsUnchanged:true,memorySettingsUnchanged:true,model:before.model};
 await save(installed?'protection-after.json':'protection-preinstall.json',result);return result;
}
const mode=process.argv[2];
if(mode==='prepare'){
 await absent(resolve(out,'protected-before.json'));await mkdir(out,{recursive:true});
 const cfg=await read(resolve(base,'config.json')),author=await read(resolve(base,'../authoring.json')),style=selectAdoptedStyle(author);
 assert.equal(style,(await readFile(resolve(base,'../901_文风提示_20261029.txt'),'utf8')).trim());assert.equal(hash(style),cfg.styleSha256);
 const before=await capture();assert.deepEqual(before.model,cfg.model);await save('protected-before.json',before);
 const png=await readFile(resolve(home,formalPath));await writeFile(resolve(out,'formal-card.before.png'),png);
 const card=pngCard(png);await save('formal-card.before.json',card);const original=entry(card).content;
 // Source is the current installed entry; all other script and card data are retained.
 const patched=patchNarrativeEntry(original);
 entry(card).content=patched;await save('formal-card.expected.json',card);
 await writeFile(resolve(out,'host-entry.before.js'),original);await writeFile(resolve(out,'host-entry.installed.js'),patched);
 await copyFile(resolve(home,stylePath),resolve(out,'narrative-style.before.json'));await save('narrative-style.json',style);
 const isolated=structuredClone(card);isolated.name=isolated.data.name=name;isolated.chat=name+' - 01正式汇合记忆核对';
 isolated.first_mes=isolated.data.first_mes=cfg.scene;isolated.scenario=isolated.data.scenario=cfg.scene;isolated.data.alternate_greetings=[];
 isolated.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'叙事验收只读采集',content:`await import('${route}recorder.js');`,info:'Isolated evidence only.',button:{enabled:false,buttons:[]},data:{}});
 await save('isolated.card.json',isolated);await save('config.json',{...cfg,name,route,chatId:isolated.chat,formalEntrySha256:hash(patched),seededRounds:3,newLiveRounds:1});
 const recorder=(await readFile(resolve(base,'recorder.js'),'utf8')).replaceAll(cfg.route,route);await writeFile(resolve(out,'recorder.js'),recorder);
 const runs=await read(resolve(base,'candidate/captured-rounds.json'));
 const seed=[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{},integration_test_seed:'Replayed first three synthetic rounds from accepted candidate; not fresh model generations.'}},
 {name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:cfg.scene,extra:{}}];
 for(const r of runs.slice(0,3))for(const m of r.messages)seed.push({name:m.user?'御临风':name,is_user:!!m.user,is_system:false,send_date:new Date().toISOString(),mes:m.text,extra:{}});
 assert.equal(seed.filter(m=>m.is_user).length,3);await save('seed-chat.json',seed);
 await save('prepared.json',{formalEntryBeforeSha256:hash(original),formalEntryAfterSha256:hash(patched),styleSha256:hash(style),allowedFormalChanges:[formalPath,stylePath],isolatedName:name,seededRounds:3,newLiveRounds:1,model:before.model});
 console.log(JSON.stringify({prepared:true,protectedFiles:Object.keys(before.files).length,formalEntryBaselineMatchesHandoff:hash(original)===cfg.formalEntrySha256}));
}else if(mode==='install'){
 await absent(resolve(out,'installation.json'));await verify(false);await absent(resolve(home,'public',route.slice(1,-1)));await absent(resolve(home,'data/default-user/characters',name+'.png'));
 const cfg=await read(resolve(out,'config.json')),card=await read(resolve(out,'formal-card.expected.json'));
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();const headers={Cookie:cookie,'X-CSRF-Token':token};
 const post=async(p,obj)=>{const r=await fetch('http://127.0.0.1:8000'+p,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(obj)});assert.ok(r.ok,p+' '+r.status);return r.json();};
 await copyFile(resolve(out,'narrative-style.json'),resolve(home,stylePath));
 const result=await post('/api/characters/merge-attributes',{avatars:['901 帝都初始卡.png'],data:{data:{extensions:{tavern_helper:{scripts:card.data.extensions.tavern_helper.scripts}}}}});assert.deepEqual(result.failed,[]);assert.deepEqual(result.updated,['901 帝都初始卡.png']);
 await verify(true);
 const dest=resolve(home,'public',route.slice(1,-1));await mkdir(dest);for(const f of ['config.json','recorder.js'])await copyFile(resolve(out,f),resolve(dest,f));
 const isolated=await read(resolve(out,'isolated.card.json')),form=new FormData();form.append('avatar',new Blob([JSON.stringify(isolated)],{type:'application/json'}),'formal-integration.card.json');form.append('file_type','json');
 const response=await fetch('http://127.0.0.1:8000/api/characters/import',{method:'POST',headers,body:form}),imported=await response.json();assert.ok(response.ok&&imported.file_name);
 const current=await settings();current.world_info_settings.world_info.charLore??=[];assert.ok(!current.world_info_settings.world_info.charLore.some(x=>x.name===name));current.world_info_settings.world_info.charLore.push({name,extraBooks:cfg.books.slice(1)});await post('/api/settings/save',current);
 await post('/api/chats/save',{avatar_url:imported.file_name,file_name:cfg.chatId,chat:await read(resolve(out,'seed-chat.json'))});
 await save('installation.json',{installed:true,formalChanges:[formalPath,stylePath],isolatedCard:imported.file_name,chatId:cfg.chatId,installedAt:new Date().toISOString(),runtimeModulesChanged:0,worldbooksChanged:0,model:cfg.model});
 console.log(JSON.stringify(await verify(true)));
}else if(mode==='verify'){console.log(JSON.stringify(await verify(true)));}
else if(mode==='capture'){
 const cfg=await read(resolve(out,'config.json')),lines=(await readFile(resolve(home,'data/default-user/chats',name,cfg.chatId+'.jsonl'),'utf8')).trim().split(/\r?\n/).map(JSON.parse),runs=lines[0].chat_metadata.narrative_acceptance_20261030??[];
 await save('captured-rounds.json',runs);console.log(JSON.stringify({savedLiveRounds:runs.length,userMessages:lines.filter(m=>m.is_user).length,protection:await verify(true)}));
}else throw Error('Use prepare, install, verify, capture');
