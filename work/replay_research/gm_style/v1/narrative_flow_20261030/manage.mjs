import {readFile,writeFile,mkdir,readdir,access,copyFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const base=import.meta.dirname,home='D:/github/sillyTavern',stage=process.argv[3]??'baseline',out=resolve(base,stage);
assert.ok(['baseline','candidate'].includes(stage));
const name=stage==='baseline'?'901 六轮叙事验收 20261030':'901 六轮叙事复验 20261030',route=`/901-narrative-flow-${stage}-20261030/`,chatId=name+' - 01连续推进';
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=x=>createHash('sha256').update(x).digest('hex');
const save=async(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
function cardFromPng(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
async function capture(){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=hash(await readFile(p));}}
 for(const p of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,p));
 const s=await read(resolve(home,'data/default-user/settings.json'));return {files,oaiHash:hash(JSON.stringify(s.oai_settings)),memoryHash:hash(JSON.stringify(s.extension_settings.memory)),model:{source:s.oai_settings.chat_completion_source,model:s.oai_settings.custom_model}};}
async function verify(){const before=await read(resolve(out,'protected-before.json')),changes=[];for(const[p,h]of Object.entries(before.files))if(hash(await readFile(resolve(home,p)))!==h)changes.push(p);assert.deepEqual(changes,[]);const s=await read(resolve(home,'data/default-user/settings.json'));assert.equal(hash(JSON.stringify(s.oai_settings)),before.oaiHash);assert.equal(hash(JSON.stringify(s.extension_settings.memory)),before.memoryHash);return {protectedFiles:Object.keys(before.files).length,allUnchanged:true,modelAndMemoryUnchanged:true,model:before.model};}
const mode=process.argv[2];
if(mode==='prepare'){
 await absent(out);await mkdir(out,{recursive:true});const protocol=await read(resolve(base,'protocol.json')),before=await capture();await save('protected-before.json',before);
 const card=cardFromPng(await readFile(resolve(home,'data/default-user/characters/901 帝都初始卡.png'))),entry=card.data.extensions.tavern_helper.scripts.find(x=>x.name==='901 帝都初始卡入口');
 const formalEntry=entry.content;await writeFile(resolve(out,'host-entry.before.js'),formalEntry);
 if(stage==='candidate')entry.content=await readFile(resolve(base,'candidate-entry.js'),'utf8');
 const books=(await read(resolve(base,'../live_acceptance_20261030/config.json'))).books;
 card.name=card.data.name=name;card.chat=chatId;card.first_mes=card.data.first_mes=protocol.scene;card.scenario=card.data.scenario=protocol.scene;card.data.alternate_greetings=[];
 card.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'六轮叙事只读采集',content:`await import('${route}recorder.js');`,info:'Isolated evidence only',button:{enabled:false,buttons:[]},data:{}});
 await save('isolated.card.json',card);await save('config.json',{name,chatId,route,books,...protocol,model:before.model,formalEntrySha256:hash(formalEntry),testEntrySha256:hash(entry.content)});
 await writeFile(resolve(out,'host-entry.test.js'),entry.content);
 let recorder=await readFile(resolve(base,'../live_acceptance_20261030/recorder.js'),'utf8');
 recorder=recorder.replaceAll('/901-narrative-acceptance-20261030/',route).replaceAll('narrative_acceptance_20261030','narrative_flow_20261030');
 recorder=recorder.replace("'。等主代理判读，不自动继续。'","'。本轮已保存。'");
 await writeFile(resolve(out,'recorder.js'),recorder);
 await save('seed-chat.json',[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},{name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:protocol.scene,extra:{}}]);
 console.log(JSON.stringify({prepared:true,name,chatId,rounds:6,model:before.model,formalEntryIdentical:formalEntry===entry.content}));
}else if(mode==='install'){
 await absent(resolve(out,'installation.json'));await verify();const dest=resolve(home,'public',route.slice(1,-1));await absent(dest);await absent(resolve(home,'data/default-user/characters',name+'.png'));
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json(),headers={Cookie:cookie,'X-CSRF-Token':token};
 const post=async(p,obj)=>{const r=await fetch('http://127.0.0.1:8000'+p,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(obj)});assert.ok(r.ok,p+' '+r.status);return r.json();};
 await mkdir(dest);for(const f of ['config.json','recorder.js'])await copyFile(resolve(out,f),resolve(dest,f));
 const form=new FormData();form.append('avatar',new Blob([await readFile(resolve(out,'isolated.card.json'))],{type:'application/json'}),'narrative-flow.card.json');form.append('file_type','json');
 const response=await fetch('http://127.0.0.1:8000/api/characters/import',{method:'POST',headers,body:form}),imported=await response.json();assert.ok(response.ok&&imported.file_name);
 const s=await read(resolve(home,'data/default-user/settings.json')),cfg=await read(resolve(out,'config.json'));s.world_info_settings.world_info.charLore??=[];assert.ok(!s.world_info_settings.world_info.charLore.some(x=>x.name===name));s.world_info_settings.world_info.charLore.push({name,extraBooks:cfg.books.slice(1)});await post('/api/settings/save',s);
 await post('/api/chats/save',{avatar_url:imported.file_name,file_name:chatId,chat:await read(resolve(out,'seed-chat.json'))});await save('installation.json',{name,chatId,route,installedAt:new Date().toISOString()});console.log(JSON.stringify(await verify()));
}else if(mode==='capture'){
 const rows=(await readFile(resolve(home,'data/default-user/chats',name,chatId+'.jsonl'),'utf8')).trim().split(/\r?\n/).map(JSON.parse),runs=rows[0].chat_metadata.narrative_flow_20261030??[];
 const roots=rows.slice(1).map((m,i)=>({floor:i,root:m.variables?.[m.swipe_id??0]?.stat_data?.['901_rules_poc']})).filter(x=>x.root);
 if(roots.length){for(const x of roots)assert.deepEqual(x.root,roots[0].root);await save('rule-state-check.json',{status:'pass',checkedFloors:roots.length,firstFloor:roots[0].floor,lastFloor:roots.at(-1).floor,revision:roots[0].root.revision,fullRootUnchanged:true,rootSha256:hash(JSON.stringify(roots[0].root))});}
 await save('captured-rounds.json',runs);const protection=await verify();await save('protection-after.json',protection);
 console.log(JSON.stringify({rounds:runs.map(r=>({id:r.id,requests:r.requests.length,messages:r.messages.map(m=>({id:m.id,user:m.user,text:m.text,status:m.gate?.status,diagnostic:m.gate?.diagnostic})),state:r.afterState})),protection},null,2));
}else throw Error('prepare/install/capture');
