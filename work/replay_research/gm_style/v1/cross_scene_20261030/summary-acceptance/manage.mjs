// Reuses the established isolated card/chat/recorder workflow. No original chat writes.
import {readFile,writeFile,readdir,mkdir,access,copyFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const base=import.meta.dirname, parent=resolve(base,'..'),home='D:/github/sillyTavern';
const name='901 剧情摘要采纳验收 20261030',chatId=name+' - 01已采纳剧情记忆',route='/901-summary-adoption-20261030/';
const sourceName='901 跨场景记忆复验 20261030',sourceChat=sourceName+' - 01离场与返回';
const sourcePath=resolve(home,'data/default-user/chats',sourceName,sourceChat+'.jsonl');
const sha=x=>createHash('sha256').update(x).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,x)=>writeFile(resolve(base,n),JSON.stringify(x,null,2)+'\n');
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
function cardFromPng(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
async function snapshot(){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=sha(await readFile(p));}}
 for(const p of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,p));
 const s=await read(resolve(home,'data/default-user/settings.json'));return {files,oaiHash:sha(JSON.stringify(s.oai_settings)),memoryHash:sha(JSON.stringify(s.extension_settings.memory)),model:s.oai_settings.custom_model,memoryFrozen:s.extension_settings.memory.memoryFrozen};}
async function verify(){const before=await read(resolve(base,'protected-before.json')),changes=[];for(const[p,h]of Object.entries(before.files))if(sha(await readFile(resolve(home,p)))!==h)changes.push(p);assert.deepEqual(changes,[]);const s=await read(resolve(home,'data/default-user/settings.json'));assert.equal(sha(JSON.stringify(s.oai_settings)),before.oaiHash);assert.equal(sha(JSON.stringify(s.extension_settings.memory)),before.memoryHash);return {status:'pass',protectedFiles:Object.keys(before.files).length,allExistingFilesUnchanged:true,modelAndMemoryUnchanged:true,model:before.model,memoryFrozen:before.memoryFrozen};}
function rebind(x){if(x===sourceChat)return chatId;if(Array.isArray(x))return x.map(rebind);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,rebind(v)]));return x;}
const rounds=[
 {id:'12-对白与私人思考',input:'我仍站在客店门旁，对布莱特和黄泉说：“袋子先不修了。你们刚才说愿意一起走，接下来更想随便逛逛，还是找个地方歇一会儿？”[我仍在想店主是否认识肯达，暂时不打算问出口，也不想把47号铜牌拿出来。]我只听他们的回答，暂不出发。'},
 {id:'13-授权移动与歇脚',input:'我提着旅行袋，与两人沿客店门前的普通街道走出一小段，然后在不妨碍通行的路边停下，对他们说：“先在这里歇一会儿吧。”[店主的事先放一放，我还没有证据，不准备向他们提这件事。]'},
 {id:'14-剧情记忆与知情核对',input:'桌外核对，不推进剧情：请依据本聊天分别说明旅行袋的修补安排是否成立、袋子现在由谁持有；客店不接客的说法来自谁、后来店主怎样答复；我对店主的私人猜测是否说出口、NPC是否因此获知；铜牌的位置及出示情况；目前我们在哪里、还有什么未办完。只按已发生内容回答，不补NPC内心或新事件。'}
];
const mode=process.argv[2];
if(mode==='prepare'){
 await absent(resolve(base,'config.json'));
 const cfg=await read(resolve(parent,'candidate/config.json')),raw=await readFile(sourcePath),original=raw.toString('utf8').trim().split(/\r?\n/).map(JSON.parse);assert.equal(original.length-1,23);
 const seed=rebind(structuredClone(original));delete seed[0].chat_metadata.cross_scene_20261030;seed[0].character_name=name;
 // Keep the database empty and isolated; existing __chatId values are branch identifiers.
 for(const k of Object.keys(seed[0].chat_metadata))if(k.endsWith('__chatId'))seed[0].chat_metadata[k]=chatId;
 let removedMemories=0;for(const m of seed.slice(1)){if(m.extra?.memory){delete m.extra.memory;removedMemories++;}if(!m.is_user)m.name=name;}
 const corrected=seed[5];assert.equal(corrected.is_user,false);assert.ok(corrected.mes.includes('顺着御临风示意的方向，'));corrected.mes=corrected.mes.replace('顺着御临风示意的方向，','');if(corrected.swipes)corrected.swipes[corrected.swipe_id??0]=corrected.mes;
 const draft=await readFile(resolve(parent,'narrative-summary-draft.txt'),'utf8');
 const adopted=draft.replace('待人工采纳的剧情摘要；仅属客店—修补摊隔离分支，不计正式战役','已人工采纳的剧情摘要（截至第11轮）；仅属客店—修补摊隔离分支，不计正式战役');assert.notEqual(draft,adopted);
 seed.at(-1).extra={...seed.at(-1).extra,memory:adopted};
 if(seed.at(-1).swipe_info?.[seed.at(-1).swipe_id??0])seed.at(-1).swipe_info[seed.at(-1).swipe_id??0].extra={...seed.at(-1).swipe_info[seed.at(-1).swipe_id??0].extra,memory:adopted};
 const roots=seed.slice(1).flatMap(m=>(m.variables??[]).flatMap(v=>v?.stat_data?.['901_rules_poc']?[v.stat_data['901_rules_poc']]:[]));assert.equal(roots.length,7);for(const r of roots){assert.equal(r.chatId,chatId);assert.deepEqual(r,roots[0]);assert.equal(r.revision,0);}
 const card=cardFromPng(await readFile(resolve(home,'data/default-user/characters/901 帝都初始卡.png')));
 card.name=card.data.name=name;card.chat=chatId;card.first_mes=card.data.first_mes=cfg.scene;card.scenario=card.data.scenario=cfg.scene;card.data.alternate_greetings=[];
 const entry=card.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口');entry.content=(await read(resolve(parent,'summary-entry.expected.json'))).content;
 card.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'剧情摘要采纳只读采集',content:`await import('${route}recorder.js');`,info:'Isolated evidence only',button:{enabled:false,buttons:[]},data:{}});
 let recorder=await readFile(resolve(parent,'../live_acceptance_20261030/recorder.js'),'utf8');recorder=recorder.replaceAll('/901-narrative-acceptance-20261030/',route).replaceAll('narrative_acceptance_20261030','summary_adoption_20261030').replaceAll('cfg.rounds[count]','cfg.rounds[count-cfg.seedUserCount]');
 await writeFile(resolve(base,'recorder.js'),recorder);await writeFile(resolve(base,'adopted-summary.txt'),adopted);await copyFile(sourcePath,resolve(base,'source-chat.jsonl'));
 await save('seed-chat.json',seed);await save('isolated.card.json',card);await save('config.json',{name,chatId,route,books:cfg.books,seedUserCount:11,seedMessages:23,rounds,styleChars:2812,entrySha256:sha(entry.content)});
 await save('preparation.json',{sourceName,sourceChat,sourceSha256:sha(raw),seedMessages:23,adoption:'User approved narrative summary for a new isolated copy only',summaryFloor:22,removedPriorActiveMemories:removedMemories,summarySha256:sha(adopted),correction:{floor:4,removed:'顺着御临风示意的方向，',reason:'Prior accepted review found this player gesture was not declared'},ruleSnapshots:roots.length,ruleChanges:'chatId only; complete snapshots retained',modelCalls:0});
 console.log(JSON.stringify({prepared:true,name,chatId,seedMessages:23,rounds:3}));
}else if(mode==='baseline'){
 await absent(resolve(base,'protected-before.json'));const formal=cardFromPng(await readFile(resolve(home,'data/default-user/characters/901 帝都初始卡.png')));assert.equal(sha(formal.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口').content),'b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a');
 const s=await snapshot();await save('protected-before.json',s);console.log(JSON.stringify({captured:true,protectedFiles:Object.keys(s.files).length,model:s.model}));
}else if(mode==='install'){
 await absent(resolve(base,'installation.json'));await verify();const dest=resolve(home,'public',route.slice(1,-1));await absent(dest);await absent(resolve(home,'data/default-user/characters',name+'.png'));
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json(),headers={Cookie:cookie,'X-CSRF-Token':token};
 const post=async(p,obj)=>{const r=await fetch('http://127.0.0.1:8000'+p,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(obj)});assert.ok(r.ok,p+' '+r.status);return r.json();};
 await mkdir(dest);for(const f of ['config.json','recorder.js'])await copyFile(resolve(base,f),resolve(dest,f));
 const form=new FormData();form.append('avatar',new Blob([await readFile(resolve(base,'isolated.card.json'))],{type:'application/json'}),'summary-adoption.card.json');form.append('file_type','json');
 const response=await fetch('http://127.0.0.1:8000/api/characters/import',{method:'POST',headers,body:form}),imported=await response.json();assert.ok(response.ok&&imported.file_name);
 const s=await read(resolve(home,'data/default-user/settings.json')),cfg=await read(resolve(base,'config.json'));s.world_info_settings.world_info.charLore??=[];assert.ok(!s.world_info_settings.world_info.charLore.some(x=>x.name===name));s.world_info_settings.world_info.charLore.push({name,extraBooks:cfg.books.slice(1)});await post('/api/settings/save',s);
 await post('/api/chats/save',{avatar_url:imported.file_name,file_name:chatId,chat:await read(resolve(base,'seed-chat.json'))});await save('installation.json',{name,chatId,route,installedAt:new Date().toISOString(),summary:'User adopted narrative summary; new isolated copy only'});console.log(JSON.stringify(await verify()));
}else if(mode==='capture'){
 const rows=(await readFile(resolve(home,'data/default-user/chats',name,chatId+'.jsonl'),'utf8')).trim().split(/\r?\n/).map(JSON.parse),runs=rows[0].chat_metadata.summary_adoption_20261030??[],seed=await read(resolve(base,'seed-chat.json'));
 const expectedRoot=seed.at(-1).variables[0].stat_data['901_rules_poc'];let checked=0;for(const m of rows.slice(1))for(const v of m.variables??[]){const r=v?.stat_data?.['901_rules_poc'];if(r){assert.deepEqual(r,expectedRoot);checked++;}}
 const memory=rows[23].extra?.memory;assert.equal(memory,await readFile(resolve(base,'adopted-summary.txt'),'utf8'));
 await save('captured-rounds.json',runs);await save('rule-state-check.json',{status:'pass',checkedFloors:checked,fullRootUnchanged:true,revision:expectedRoot.revision,rootSha256:sha(JSON.stringify(expectedRoot))});const protection=await verify();await save('protection-after.json',protection);
 console.log(JSON.stringify({messages:rows.length-1,rounds:runs.map(r=>({id:r.id,requests:r.requests.length,messages:r.messages,afterState:r.afterState})),protection},null,2));
}else throw Error('prepare/baseline/install/capture');
