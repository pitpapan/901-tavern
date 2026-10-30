import {readFile,writeFile,readdir,mkdir,access,copyFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const home='D:/github/sillyTavern',out=resolve(import.meta.dirname),base=resolve(out,'..');
const name='901 行动失败隔离验收 20261030',chatId=name+' - 01原现场复现',route='/901-action-failure-20261030/';
const originalId='901 初始卡石像撤离实测 - 2026-10-22';
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=x=>createHash('sha256').update(x).digest('hex');
const save=async(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
function pngCard(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
async function capture(){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=hash(await readFile(p));}}
 for(const p of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,p));
 const s=await read(resolve(home,'data/default-user/settings.json'));return {files,oaiHash:hash(JSON.stringify(s.oai_settings)),memoryHash:hash(JSON.stringify(s.extension_settings.memory)),model:{source:s.oai_settings.chat_completion_source,model:s.oai_settings.custom_model}};}
async function verify(){const before=await read(resolve(out,'protected-before.json')),changed=[];for(const[p,h]of Object.entries(before.files))if(hash(await readFile(resolve(home,p)))!==h)changed.push(p);assert.deepEqual(changed,[]);const s=await read(resolve(home,'data/default-user/settings.json'));assert.equal(hash(JSON.stringify(s.oai_settings)),before.oaiHash);assert.equal(hash(JSON.stringify(s.extension_settings.memory)),before.memoryHash);return {protectedFiles:Object.keys(before.files).length,unchanged:true,model:before.model};}
if(process.argv[2]==='prepare'){
 await absent(resolve(out,'protected-before.json'));await save('protected-before.json',await capture());
 const original=(await readFile(resolve(home,'data/default-user/chats/901 帝都初始卡',originalId+'.jsonl'),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
 assert.equal(original.length,32);assert.equal(original.at(-1).mes.split('\n')[0],'这次行动尚未执行。请重新生成这条回复，或补充行动声明。');
 // Replay the exact preceding 29 floors; replace only the chat identity throughout cloned state.
 const seed=JSON.parse(JSON.stringify(original.slice(0,-2)).replaceAll(originalId,chatId));
 seed[0].character_name=name;seed[0].chat_metadata.action_failure_source={originalId,originalMessages:31,seedMessages:29,identityRemapped:true};
 const card=pngCard(await readFile(resolve(home,'data/default-user/characters/901 帝都初始卡.png')));card.name=card.data.name=name;card.chat=chatId;
 const entry=card.data.extensions.tavern_helper.scripts.find(x=>x.name==='901 帝都初始卡入口');
 entry.content=entry.content.replace("'/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js'",`'${route}gate.js'`);
 card.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'行动失败隔离采集',content:`await import('${route}recorder.js');`,info:'Isolated evidence only',button:{enabled:false,buttons:[]},data:{}});
 let gate=await readFile(resolve(home,'public/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js'),'utf8');
 const needle="    if(lastDecision?.request?.kind!=='recovery'&&combat?.handleFailure";assert.equal(gate.split(needle).length,2);
 gate=gate.replace(needle,`    const traceContext=window.top.SillyTavern.getContext();
    const traces=structuredClone(traceContext.chatMetadata.action_failure_trace??[]);
    traces.push({...diagnostic,...safeFailure(error,diagnostic.failureStage??diagnostic.stage),...failureDetails(error),decision:lastDecision?.status??null,pendingNarration:!!pending?.narrationDecision});
    traceContext.updateChatMetadata({action_failure_trace:traces});await traceContext.saveChat();
${needle}`);
 await writeFile(resolve(out,'gate.baseline.js'),gate);await save('isolated.card.json',card);await save('seed-chat.json',seed);
 const prior=await read(resolve(base,'config.json')),n=seed.filter(m=>m.is_user).length;
 await save('config.json',{...prior,name,chatId,route,rounds:[...Array(n).fill({id:'seed',input:''}),{id:'natural-repeat',input:'测试'},{id:'ordinary-dialogue',input:'我看着洞穴入口，说：“先停在这里。”'}]});
 await writeFile(resolve(out,'recorder.js'),(await readFile(resolve(base,'recorder.js'),'utf8')).replaceAll(prior.route,route));
 console.log(JSON.stringify({prepared:true,name,chatId,seedMessages:seed.length-1,seedUserMessages:n,protection:await verify()}));
}else if(process.argv[2]==='install'){
 await absent(resolve(out,'installation.json'));await verify();const dest=resolve(home,'public',route.slice(1,-1));await absent(dest);await absent(resolve(home,'data/default-user/characters',name+'.png'));
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json(),headers={Cookie:cookie,'X-CSRF-Token':token};
 const post=async(p,obj)=>{const r=await fetch('http://127.0.0.1:8000'+p,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(obj)});assert.ok(r.ok,p+' '+r.status);return r.json();};
 await mkdir(dest);for(const f of ['config.json','recorder.js'])await copyFile(resolve(out,f),resolve(dest,f));await copyFile(resolve(out,'gate.baseline.js'),resolve(dest,'gate.js'));
 const form=new FormData();form.append('avatar',new Blob([await readFile(resolve(out,'isolated.card.json'))],{type:'application/json'}),'action-failure.card.json');form.append('file_type','json');
 const response=await fetch('http://127.0.0.1:8000/api/characters/import',{method:'POST',headers,body:form}),imported=await response.json();assert.ok(response.ok&&imported.file_name);
 const current=await read(resolve(home,'data/default-user/settings.json')),cfg=await read(resolve(out,'config.json'));current.world_info_settings.world_info.charLore??=[];assert.ok(!current.world_info_settings.world_info.charLore.some(x=>x.name===name));current.world_info_settings.world_info.charLore.push({name,extraBooks:cfg.books.slice(1)});await post('/api/settings/save',current);
 await post('/api/chats/save',{avatar_url:imported.file_name,file_name:chatId,chat:await read(resolve(out,'seed-chat.json'))});await save('installation.json',{name,chatId,route,installedAt:new Date().toISOString()});console.log(JSON.stringify(await verify()));
}else if(process.argv[2]==='capture'){
 const rows=(await readFile(resolve(home,'data/default-user/chats',name,chatId+'.jsonl'),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
 const runs=rows[0].chat_metadata.narrative_acceptance_20261030??[],traces=rows[0].chat_metadata.action_failure_trace??[];
 await save('captured-rounds.json',runs);await save('failure-traces.json',traces);await save('protection-after.json',await verify());
 console.log(JSON.stringify({runs:runs.map(x=>({id:x.id,requests:x.requests.length,messages:x.messages})),traces,protection:await verify()}));
}else throw Error('prepare/install/capture');
