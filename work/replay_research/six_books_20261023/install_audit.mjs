import {readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import {resolve,dirname,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),base=resolve(root,'output/replay_tavern/six_books_20261023_candidate'),backup=resolve(base,'installation-backup');
const home='D:/github/sillyTavern',avatar='901 帝都初始卡.png',cardPath=resolve(home,'data/default-user/characters',avatar);
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
function pngCard(buf){for(let at=8;at<buf.length;){const n=buf.readUInt32BE(at),kind=buf.subarray(at+4,at+8).toString(),body=buf.subarray(at+8,at+8+n);at+=12+n;if(kind==='tEXt'&&body.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(body.subarray(6).toString(),'base64').toString());}throw Error('No V2 card metadata');}
const manifest=await read(resolve(base,'runtime_patch_manifest.json')),candidate=await read(resolve(base,'import/901_帝都初始卡_六书候选.card.json'));
const currentPng=await readFile(cardPath),current=pngCard(currentPng),prepared=await read(resolve(base,'scene_test/formal-card-before-audit.json'));
if(JSON.stringify(current)!==JSON.stringify(prepared))throw Error('Formal card changed since review; refusing stale merge');
const verification=await read(resolve(base,'verification.json'));if(verification.status!=='pass')throw Error('Candidate not verified');
const names=manifest.profile_books;
for(const m of manifest.modules){const b=await readFile(resolve(base,m.destination));if(hash(b)!==m.sha256)throw Error('Stage hash mismatch');}
const scripts=structuredClone(current.data.extensions.tavern_helper.scripts),entry=scripts.find(s=>s.name==='901 帝都初始卡入口');
if(!entry||entry.content.split('profile:{debug:false,').length!==2)throw Error('Formal entry no longer matches reviewed profile');
entry.content=entry.content.replace('profile:{debug:false,','profile:{lorebooks:'+JSON.stringify(names)+',debug:false,');
const routing=await readFile(resolve(base,'texts/901_六书路由说明.txt'),'utf8'),anchor=await readFile(resolve(base,'texts/901_通用主持迁移段.txt'),'utf8');
const description=current.data.description+'\n\n## 2026-10-23 六书接入\n\n'+routing+'\n\n'+anchor;
const patch={avatar,description,data:{description,extensions:{world:names[0],tavern_helper:{...current.data.extensions.tavern_helper,scripts}},character_book:candidate.data.character_book}};
await mkdir(backup,{recursive:true});await writeFile(resolve(backup,avatar),currentPng,{flag:'wx'});await writeFile(resolve(base,'formal-card-merge.json'),JSON.stringify(patch,null,2)+'\n');
const csrf=await fetch('http://localhost:8000/csrf-token');const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
async function post(path,data){const r=await fetch('http://localhost:8000'+path,{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error(`${path} HTTP ${r.status}`);return r.text();}
const journal={installedAt:new Date().toISOString(),avatar,modules:[],books:[],card:false,bindings:false,chatFilesModified:false};
const save=()=>writeFile(resolve(base,'installation.json'),JSON.stringify(journal,null,2)+'\n');
await save();
for(const m of manifest.modules){
 const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));if(rel.startsWith('..')||!rel.startsWith('work'+sep))throw Error('Unexpected runtime destination');
 const dest=resolve(home,'public/901-opening-combat',rel),bak=resolve(backup,'runtime',rel);await mkdir(dirname(bak),{recursive:true});
 let existed=true;try{await access(dest);}catch{existed=false;}if(existed)await copyFile(dest,bak);
 await mkdir(dirname(dest),{recursive:true});await copyFile(resolve(base,m.destination),dest);if(hash(await readFile(dest))!==m.sha256)throw Error('Runtime readback mismatch');
 journal.modules.push({path:dest,sha256:m.sha256,backup:existed?bak:null});
}await save();
for(const name of names){const old=resolve(home,'data/default-user/worlds',name+'.json');try{await access(old);await copyFile(old,resolve(backup,name+'.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const data=await read(resolve(base,'import',name+'.json'));await post('/api/worldinfo/edit',{name,data});
 if(JSON.stringify(await read(old))!==JSON.stringify(data))throw Error('Worldbook readback mismatch');journal.books.push({name,entries:Object.keys(data.entries).length});}
await save();await post('/api/characters/merge-attributes',patch);
const after=pngCard(await readFile(cardPath));
if(after.data.description!==description||after.data.extensions.world!==names[0]||after.data.character_book.entries.length!==41||after.data.extensions.tavern_helper.scripts.find(s=>s.id===entry.id)?.content!==entry.content)throw Error('Formal card readback mismatch');
for(const field of ['scenario','first_mes','personality','system_prompt','post_history_instructions','alternate_greetings'])if(JSON.stringify(after.data[field])!==JSON.stringify(current.data[field]))throw Error('Unrelated card field changed: '+field);
journal.card=true;await save();
const settings=await read(resolve(home,'data/default-user/settings.json')),wi=settings.world_info_settings.world_info;
const previous=structuredClone(wi.charLore??[]);await writeFile(resolve(backup,'charLore.json'),JSON.stringify(previous,null,2)+'\n');
wi.charLore??=[];let binding=wi.charLore.find(x=>x.name===avatar.slice(0,-4));if(!binding){binding={name:avatar.slice(0,-4),extraBooks:[]};wi.charLore.push(binding);}binding.extraBooks=[...new Set([...(binding.extraBooks??[]).filter(n=>n!==names[0]),...names.slice(1)])];
await post('/api/settings/save',settings);
const actual=(await read(resolve(home,'data/default-user/settings.json'))).world_info_settings.world_info.charLore.find(x=>x.name===binding.name);
if(!names.slice(1).every(n=>actual.extraBooks.includes(n)))throw Error('Book binding readback mismatch');
journal.bindings=true;journal.status='installed-and-readback-verified';await save();
console.log(JSON.stringify({status:journal.status,modules:journal.modules.length,books:journal.books,card:journal.card,bindings:journal.bindings,chatFilesModified:false}));
