// Stage first. --install creates only uniquely named test books/card/chat/modules.
import {readFile,writeFile,mkdir,readdir,cp,access} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
const root=process.cwd(),stage=resolve(root,'work/replay_research/six_books_20261023/loading_acceptance_20261028');
const base=resolve(root,'output/replay_tavern/six_books_20261023_candidate');
const out=resolve(base,'scene_test/world-loading-20261028'),home='D:/github/sillyTavern';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const save=async(p,x)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(x,null,2)+'\n');};
const name='901 世界书加载验收 20261028',chatId=name+' - W4',route='/901-world-loading-20261028/';
const manifest=await read(resolve(base,'runtime_patch_manifest.json'));
const plan=await read(resolve(base,'创作规划.yaml'));
const originals=plan.books.map(b=>b.file.split('/').at(-1).replace(/\.json$/,''));
const books=originals.map(n=>'W4_20261028_'+n);
const filler=Array.from({length:5},(_,i)=>({role:i%2?'assistant':'user',content:['铜壶中的水沸了。','店主将碗摆在桌上。','窗外正下着小雨。','远处的钟响过一声。','有人搬来一张木凳。'][i]}));
const oldHistory=[{role:'assistant',content:'此前停留在洛汀，谈过洛汀岩地矿料与工艺。'},...filler];
const cases=[
 {id:'city',label:'1 帝都日常',input:'御临风在帝都街边买早餐。只描写眼前摊位与居民日常，不代写他的言语或选择。'},
 {id:'silver',label:'2 银月隔离',input:'旅人初到银月城。请简述能公开见到的城市生活与礼节，不替他获得未经接触的家传知识。'},
 {id:'cat',label:'3 猫音资格',input:'猫音与御临风首次见面。请让她介绍自己已经取得的学术资格；具体职业岗位和研究课题没有现场依据，不自动安排。不代写御临风。'},
 {id:'white',label:'4 白魔与肯达',input:'御临风只听过白色魔法使与肯达·凯·弗格斯的姓名，没有调查或收到秘密报告。他问两人的私人目标和隐藏身份。主持只能依据目前可知回答。'},
 {id:'lotin-enter',label:'5 洛汀进入',input:'洛汀的工匠正在介绍洛汀岩地矿料与工艺。请以其中两种当地材料说明各自用途，未谈库存、价格或机械数值。'},
 {id:'lotin-held',label:'6 超窗保持',history:oldHistory,hold:[{book:0,uid:25657482},{book:0,uid:plan.entries.find(e=>e.name==='洛汀岩地矿料与工艺').uid}],input:'仍在这座城的同一工坊。请接着说明当地两种矿料的工艺用途，不创造库存或法术效果。'},
 {id:'lotin-exit',label:'7 离场退出',history:oldHistory,input:'场景已切换到帝都的普通茶馆，不再讨论上一地点的矿料。请只描写眼前的喝茶闲谈。'},
 {id:'worldtree',label:'8 世界树消歧',input:'请说明远西的世界树在人们生活中的位置，不要把它与异界游戏混同。'},
 {id:'sword',label:'9 弃风边界',input:'御临风仅仅查看手中的弃风剑，没有修复、重铸、唤醒或获得任何回应。请只写可观察状态，不推进动作或奖励。'},
 {id:'budget',label:'10 多主题预算',input:'只做资料核对：帝国公共消息与民间见识、飘零大陆共同节令与年度生活、帝国学士与长期研习、洛汀岩地矿料与工艺、白暮寒地材料与器材、风门山前魔法生态、帝国邻里与私人交往、银月城、远西魔法林材与特殊木材。请用三句话举三个来自不同主题的已知事实，保持各自适用范围。'},
];
const config={name,chatId,books,cases,scope:'native world-info scan + production lore filter + generateRaw continuation; not classifier or MVU'};
config.hostScanPatch='latest-first-20261028';
// Read the same author paragraph as build_candidate.py so isolated world tests
// can continue while resource-line execution proofs are being refreshed.
const guidanceSource=await readFile(resolve(root,'work/replay_research/knowledge_projection.md'),'utf8');
config.worldContextGuidance=guidanceSource.replaceAll('\r\n','\n').split('### W4续写入口：背景与现场\n\n')[1].split('\n\n')[0].trim();
config.candidateHashes=Object.fromEntries(await Promise.all(originals.map(async n=>[n,sha(await readFile(resolve(base,'import',n+'.json')))])));
await save(resolve(out,'config.json'),config);
for(const m of manifest.modules){
 const src=resolve(base,m.destination),data=await readFile(src);if(sha(data)!==m.sha256)throw Error('Stale candidate '+src);
 const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),src),dst=resolve(out,'runtime',rel);
 await mkdir(dirname(dst),{recursive:true});await writeFile(dst,data.toString('utf8').replaceAll('/901-opening-combat/',route));
}
await cp(resolve(stage,'live-script.js'),resolve(out,'runtime/live-script.js'));
await save(resolve(out,'runtime/config.json'),config);
const card=await read(resolve(base,'import/901_帝都初始卡_六书候选.card.json'));
card.name=name;card.data.name=name;card.data.scenario='隔离世界书加载测试，各题独立，不推进正式剧情。';
card.data.first_mes='世界书加载验收已就绪。通过上方编号按钮提交真实模型请求；所有输出与场景只保存在本测试卡。';
card.data.alternate_greetings=[];card.data.extensions.world=books[0];card.data.character_book.name=books[0];
card.data.extensions.tavern_helper={scripts:[{type:'script',enabled:true,id:randomUUID(),name:'世界书加载证据采集',
 content:"await import('/901-world-loading-20261028/live-script.js');",info:'真实宿主扫描与模型请求；仅此隔离卡，无MVU与规则结算。',button:{enabled:false,buttons:[]},data:{}}],variables:{}};
await save(resolve(out,'world-loading.card.json'),card);
if(!process.argv.includes('--install')){console.log(JSON.stringify({out,name,cases:cases.length,books:books.length}));process.exit(0);}
try{await access(resolve(out,'installation.json'));throw Error('Already installed; do not duplicate');}catch(e){if(e.code!=='ENOENT')throw e;}
const protectedFiles={};
async function capture(dir){for(const ent of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,ent.name);if(ent.isDirectory())await capture(p);else protectedFiles[relative(home,p)]=sha(await readFile(p));}}
for(const d of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await capture(resolve(home,d));
const settings=await read(resolve(home,'data/default-user/settings.json'));
await save(resolve(out,'protected-before.json'),{files:protectedFiles,modelSettingsHash:sha(JSON.stringify(settings.oai_settings)),model:{source:settings.oai_settings.chat_completion_source,model:settings.oai_settings.google_model,maxContext:settings.oai_settings.openai_max_context,maxTokens:settings.oai_settings.openai_max_tokens},world:settings.world_info_settings,existingCharLore:settings.world_info_settings.world_info.charLore});
const csrf=await fetch('http://localhost:8000/csrf-token');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const headers={Cookie:cookie,'X-CSRF-Token':token};
async function post(path,data){const r=await fetch('http://localhost:8000'+path,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error(path+' '+r.status);return r.json();}
const existing=await post('/api/worldinfo/list',{});
if(books.some(n=>existing.some(e=>e.name===n)))throw Error('Test book exists');
await cp(resolve(out,'runtime'),resolve(home,'public/901-world-loading-20261028'),{recursive:true,errorOnExist:true,force:false});
for(let i=0;i<books.length;i++)await post('/api/worldinfo/edit',{name:books[i],data:await read(resolve(base,'import',originals[i]+'.json'))});
const form=new FormData();form.append('avatar',new Blob([JSON.stringify(card)],{type:'application/json'}),'world-loading.card.json');form.append('file_type','json');
const response=await fetch('http://localhost:8000/api/characters/import',{method:'POST',headers,body:form});
const imported=await response.json();if(!response.ok||!imported.file_name)throw Error('Card import failed');
const avatar=imported.file_name;
const current=await read(resolve(home,'data/default-user/settings.json'));
current.world_info_settings.world_info.charLore??=[];
current.world_info_settings.world_info.charLore.push({name:avatar.replace(/\.png$/,''),extraBooks:books.slice(1)});
await post('/api/settings/save',current);
await post('/api/chats/save',{avatar_url:avatar,file_name:chatId,chat:[{user_name:'御临风',character_name:name,chat_metadata:{note_prompt:'',variables:{}}},{name,is_user:false,is_system:false,send_date:new Date().toISOString(),mes:card.data.first_mes,extra:{}}]});
await save(resolve(out,'installation.json'),{name,avatar,chatId,books,route,scope:config.scope,protectedFiles:Object.keys(protectedFiles).length});
console.log(JSON.stringify({name,avatar,chatId,books:books.length,protectedFiles:Object.keys(protectedFiles).length}));
