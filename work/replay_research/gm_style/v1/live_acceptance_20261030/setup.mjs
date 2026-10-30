import {readFile,writeFile,mkdir,readdir,copyFile,access} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const out=resolve('work/replay_research/gm_style/v1/live_acceptance_20261030');
const home='D:/github/sillyTavern',data=resolve(home,'data/default-user');
const name='901 叙事隔离验收 20261030',route='/901-narrative-acceptance-20261030/';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const save=async(p,v)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(v,null,2)+'\n');};
function pngCard(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
const formal=pngCard(await readFile(resolve(data,'characters/901 帝都初始卡.png')));
const entry=formal.data.extensions.tavern_helper.scripts.find(x=>x.name==='901 帝都初始卡入口');
const settings=await read(resolve(data,'settings.json')),o=settings.oai_settings;
assert.equal(o.chat_completion_source,'custom');assert.equal(o.custom_model,'[抗截断]gemini-3.8-flash');
const style=o.prompts.find(x=>x.identifier==='901-gm-style-v1').content;
const books=(await read('output/replay_tavern/six_books_20261023_candidate/runtime_patch_manifest.json')).profile_books;
const scene='【隔离合成场景，不属于正式战役】雨后傍晚，御临风、布莱特与黄泉在洛汀一间普通客店的柜台前暂避雨。店主正在整理空杯；门边石地留着湿脚印，窗边有一张空桌。三人尚未订房、付费或点餐。布莱特失明，人物性格与其余既有事实按已加载资料；客店不新增正式专名或特殊机构。主持从接下来的对白接起，正常叙事，不总结验收规则。';
const rounds=[
 {id:'01-人物场景',input:'御临风停在柜台前，对店主说：“我们想先避一会儿雨。这里有能修补旅行袋的人吗？”他又对布莱特说：“你刚才说想找个安静的地方，这里怎么样？”\n【御临风的私人记录：铜牌背面是27号，仍收在外衣内袋，没有给任何人看过。他猜店主也许认识肯达，但还没有说出或打听这个名字。】'},
 {id:'02-对白与边界',input:'御临风只向黄泉问道：“你觉得这里怎么样？”他没有答应订房、点餐、交出旅行袋或转移座位。'},
 {id:'03-节奏与有限代办',input:'御临风对店主说：“麻烦说一下修补通常要等多久，我先了解一下。”若店主已经回答过，就承接已有回答，不再追问同一件事。这次只问修补安排，没有委托修理或付款。'},
 {id:'04-记忆与知情',input:'桌外核对，不推进场景：本聊天铜牌号码是什么、放在哪里、是否出示过？谁知道御临风关于店主与肯达的私人猜测？目前是否已经订房、付款或把旅行袋交给别人？只按本聊天明确内容回答；找不到依据的项明确说无法确认。'},
 {id:'05-收束与重复',input:'回到柜台前的交谈。御临风对店主说：“谢谢，我先不订房，也先不修。雨停后再说。”这次只承接这句话，保留在场局面。'}
];
const cfg={name,route,chatId:name+' - 01连续场景',books,rounds,model:{source:o.chat_completion_source,model:o.custom_model},styleSha256:hash(style),formalEntrySha256:hash(entry.content),scene};
const protectedFiles={};
async function capture(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await capture(p);else protectedFiles[relative(home,p).replaceAll('\\','/')]=hash(await readFile(p));}}
for(const d of ['characters','chats','worlds'])await capture(resolve(data,d));await capture(resolve(home,'public/901-opening-combat'));
const baseline={files:protectedFiles,oaiHash:hash(JSON.stringify(o)),memoryHash:hash(JSON.stringify(settings.extension_settings.memory)),model:cfg.model};
const clone=structuredClone(formal);clone.name=name;clone.data.name=name;clone.chat=cfg.chatId;
clone.first_mes=scene;clone.data.first_mes=scene;clone.scenario=scene;clone.data.scenario=scene;clone.data.alternate_greetings=[];
clone.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'叙事验收只读采集',content:`await import('${route}recorder.js');`,info:'Manual evidence capture on isolated card only.',button:{enabled:false,buttons:[]},data:{}});
assert.equal(clone.data.extensions.tavern_helper.scripts.find(x=>x.id===entry.id).content,entry.content);
await save(resolve(out,'config.json'),cfg);await save(resolve(out,'isolated.card.json'),clone);
if(!process.argv.includes('--install')){console.log(JSON.stringify({prepared:true,name,model:cfg.model,rounds:rounds.length}));process.exit(0);}
try{await access(resolve(out,'installation.json'));throw Error('Already installed');}catch(e){if(e.code!=='ENOENT')throw e;}
await save(resolve(out,'protected-before.json'),baseline);
const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
const post=async(path,obj)=>{const r=await fetch('http://127.0.0.1:8000'+path,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(obj)});assert(r.ok,path+' '+r.status);return r.json();};
const dest=resolve(home,'public/901-narrative-acceptance-20261030');await mkdir(dest,{recursive:false});
for(const f of ['config.json','recorder.js'])await copyFile(resolve(out,f),resolve(dest,f));
const form=new FormData();form.append('avatar',new Blob([JSON.stringify(clone)],{type:'application/json'}),'narrative.card.json');form.append('file_type','json');
const response=await fetch('http://127.0.0.1:8000/api/characters/import',{method:'POST',headers,body:form});const imported=await response.json();assert(response.ok&&imported.file_name);
const current=await read(resolve(data,'settings.json'));current.world_info_settings.world_info.charLore??=[];assert(!current.world_info_settings.world_info.charLore.some(x=>x.name===name));
current.world_info_settings.world_info.charLore.push({name,extraBooks:books.slice(1)});await post('/api/settings/save',current);
await post('/api/chats/save',{avatar_url:imported.file_name,file_name:cfg.chatId,chat:[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},{name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:scene,extra:{}}]});
await save(resolve(out,'installation.json'),{name,avatar:imported.file_name,chatId:cfg.chatId,model:cfg.model,formalEntryIdentical:true,protectedFiles:Object.keys(protectedFiles).length});
console.log(JSON.stringify({installed:true,name,chatId:cfg.chatId,protectedFiles:Object.keys(protectedFiles).length}));
