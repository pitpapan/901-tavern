import {readFile,writeFile,mkdir,readdir,copyFile,access} from 'node:fs/promises';
import {resolve,dirname,relative,sep} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.cwd(),base=resolve(root,'output/replay_tavern/six_books_20261023_candidate');
const out=resolve(base,'scene_test/formal-live-20261028'),home='D:/github/sillyTavern';
const name='901 正式六书隔离加载验收 20261028',route='/901-formal-loading-20261028/';
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const save=async(p,x)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(x,null,2)+'\n');};
function pngCard(buf){for(let at=8;at<buf.length;){const n=buf.readUInt32BE(at),kind=buf.subarray(at+4,at+8).toString(),body=buf.subarray(at+8,at+8+n);at+=12+n;if(kind==='tEXt'&&body.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(body.subarray(6).toString(),'base64').toString());}throw Error('No V2 card');}
const formal=pngCard(await readFile(resolve(home,'data/default-user/characters/901 帝都初始卡.png')));
const manifest=await read(resolve(base,'runtime_patch_manifest.json')),books=manifest.profile_books;
const settings=await read(resolve(home,'data/default-user/settings.json'));
const formalScript=formal.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口');
assert(formalScript.content.includes('/901-opening-combat/')&&!formalScript.content.includes('retainedBranchMemory'));
const prefix='仅做世界资料核对，不执行角色行动或机械结算，不改变当前现场，不替御临风说话或决定。请用三句话以内回答：';
const cases=[
 {id:'qualification',label:'01资格与库存',input:prefix+'猫音已取得什么学术资格？能否由此确认她的具体职业、专业领域或此刻正在处理文书？洛汀岩地矿料与工艺所述地区供料，是否足以确认某店有货或无货？'},
 {id:'secrets',label:'02公开与秘密',input:prefix+'简述银月城可公开了解的城市生活。御临风只听过白色魔法使与肯达·凯·弗格斯的姓名，未调查、未收到秘密报告；是否能因此确认他们的私人目标或隐藏身份？只按当前可知范围回答。'},
 {id:'materials',label:'03产地与用途',input:prefix+'依据洛汀岩地矿料与工艺，说明韧纹铁的产地和导流晶的用途及限制。没有现场样品和库存记录，不安排取出或展示材料，不推定有货或无货。'}
].map(c=>({...c,chatId:name+' - '+c.label}));
const model={source:settings.oai_settings.chat_completion_source,model:settings.oai_settings.google_model,maxContext:settings.oai_settings.openai_max_context,maxTokens:settings.oai_settings.openai_max_tokens};
const config={name,route,books,cases,model,hostEntrySha256:hash(formalScript.content),
 worldContextGuidance:(await read(resolve(base,'创作规划.yaml'))).world_context_guidance.content};
const protectedFiles={};
async function capture(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await capture(p);else protectedFiles[relative(home,p).split(sep).join('/')]=hash(await readFile(p));}}
for(const d of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await capture(resolve(home,d));
for(const m of manifest.modules){const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));assert.equal(hash(await readFile(resolve(home,'public/901-opening-combat',rel))),m.sha256);}
for(const book of books)assert.deepEqual(await read(resolve(home,'data/default-user/worlds',book+'.json')),await read(resolve(base,'import',book+'.json')));
config.bookHashes=Object.fromEntries(await Promise.all(books.map(async n=>[n,hash(await readFile(resolve(home,'data/default-user/worlds',n+'.json')))])));
await save(resolve(out,'config.json'),config);
await save(resolve(out,'protected-before.json'),{files:protectedFiles,model,modelSettingsHash:hash(JSON.stringify(settings.oai_settings)),
 memorySettingsHash:hash(JSON.stringify(settings.extension_settings.memory)),worldSettings:settings.world_info_settings});
const clone=structuredClone(formal);clone.name=name;clone.data.name=name;clone.chat=cases[0].chatId;
clone.data.first_mes='正式安装后加载验收：本聊天仅供独立资料核对，不推进正式剧情。';clone.first_mes=clone.data.first_mes;
clone.data.alternate_greetings=[];
clone.data.extensions.tavern_helper.scripts.push({type:'script',enabled:true,id:randomUUID(),name:'正式安装只读请求采集',content:"await import('"+route+"recorder.js');",info:'Only this disposable card; manual arm/save; does not generate or alter rules.',button:{enabled:false,buttons:[]},data:{}});
assert.equal(clone.data.extensions.tavern_helper.scripts.find(s=>s.id===formalScript.id).content,formalScript.content);
await save(resolve(out,'isolated.card.json'),clone);
if(!process.argv.includes('--install')){console.log(JSON.stringify({status:'prepared',name,cases:cases.length,model}));process.exit(0);}
try{await access(resolve(out,'installation.json'));throw Error('Already installed');}catch(e){if(e.code!=='ENOENT')throw e;}
const csrf=await fetch('http://localhost:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
const post=async(path,data)=>{const r=await fetch('http://localhost:8000'+path,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(data)});assert(r.ok,path+' '+r.status);return r.json();};
const deployed=resolve(home,'public/901-formal-loading-20261028');
await mkdir(deployed,{recursive:false});await copyFile(resolve(out,'config.json'),resolve(deployed,'config.json'));
await copyFile(resolve(root,'work/replay_research/six_books_20261023/formal_acceptance_20261028/recorder.js'),resolve(deployed,'recorder.js'));
const form=new FormData();form.append('avatar',new Blob([JSON.stringify(clone)],{type:'application/json'}),'formal-loading.card.json');form.append('file_type','json');
const res=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers,body:form});const imported=await res.json();assert(res.ok&&imported.file_name,'Card import failed');
const avatar=imported.file_name,current=await read(resolve(home,'data/default-user/settings.json'));
current.world_info_settings.world_info.charLore??=[];
assert(!current.world_info_settings.world_info.charLore.some(x=>x.name===name));
current.world_info_settings.world_info.charLore.push({name,extraBooks:books.slice(1)});await post('/api/settings/save',current);
for(const c of cases)await post('/api/chats/save',{avatar_url:avatar,file_name:c.chatId,chat:[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},{name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:clone.data.first_mes,extra:{}}]});
await save(resolve(out,'installation.json'),{name,avatar,cases:cases.map(c=>c.chatId),model,formalEntryIdentical:true,formalModules:true,formalBooks:true,protectedFiles:Object.keys(protectedFiles).length});
console.log(JSON.stringify({status:'installed-isolated',name,cases:cases.map(c=>c.chatId),model,protectedFiles:Object.keys(protectedFiles).length}));
