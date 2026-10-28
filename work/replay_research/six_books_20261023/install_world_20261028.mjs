// User-authorized formal installation; merge the known entry, never import a replacement card.
// --prepare is local only. --apply requires the prepared inputs and makes a private backup first.
import {readFile,writeFile,mkdir,copyFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd(),base=resolve(root,'output/replay_tavern/six_books_20261023_candidate');
const out=resolve(base,'formal-installation-20261028'),home='D:/github/sillyTavern';
const privateBackup=resolve(root,'../world-install-backups/20261028-sixbooks');
const avatar='901 帝都初始卡.png',cardPath=resolve(home,'data/default-user/characters',avatar);
const settingsPath=resolve(home,'data/default-user/settings.json');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const sha=async p=>hash(await readFile(p));
const save=async(p,x)=>{await mkdir(dirname(p),{recursive:true});await writeFile(p,JSON.stringify(x,null,2)+'\n');};
const exists=async p=>{try{await access(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
function card(buf){for(let at=8;at<buf.length;){const n=buf.readUInt32BE(at),kind=buf.subarray(at+4,at+8).toString(),body=buf.subarray(at+8,at+8+n);at+=12+n;if(kind==='tEXt'&&body.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(body.subarray(6).toString(),'base64').toString());}throw Error('Missing card metadata');}
async function files(dir){let found=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);found.push(...(e.isDirectory()?await files(p):[p]));}return found;}
async function hashes(paths){return Object.fromEntries(await Promise.all(paths.map(async p=>[relative(home,p).split(sep).join('/'),await sha(p)])));}
async function protectedHashes(){return hashes([...(await files(resolve(home,'data/default-user/chats'))),...(await files(resolve(home,'data/default-user/characters'))).filter(p=>p!==cardPath)]);}
async function inputs(){
 const manifest=await read(resolve(base,'runtime_patch_manifest.json'));
 const candidate=await read(resolve(base,'import/901_帝都初始卡_六书候选.card.json'));
 const sources=[resolve(base,'runtime_patch_manifest.json'),resolve(base,'import/901_帝都初始卡_六书候选.card.json'),...manifest.profile_books.map(n=>resolve(base,'import',n+'.json')),...manifest.modules.map(m=>resolve(base,m.destination))];
 for(const m of manifest.modules)assert.equal(await sha(resolve(base,m.destination)),m.sha256,'Candidate module mismatch');
 return {manifest,candidate,hashes:Object.fromEntries(await Promise.all(sources.map(async p=>[relative(root,p),await sha(p)])))};
}
async function prepare(){
 const {manifest,candidate,hashes:sourceHashes}=await inputs();
 assert.equal((await read(resolve(base,'verification.json'))).status,'pass');
 const current=card(await readFile(cardPath)),prior=await read(resolve(base,'formal-card-merge.json'));
 const scripts=structuredClone(current.data.extensions.tavern_helper.scripts);
 const entry=scripts.find(s=>s.name==='901 帝都初始卡入口');assert(entry);
 const old=prior.data.extensions.tavern_helper.scripts.find(s=>s.id===entry.id);assert.equal(entry.content,old.content,'Unreviewed entry customization');
 let content=candidate.data.extensions.tavern_helper.scripts.find(s=>s.name===entry.name).content;
 // Existing formal chat uses its database memory configuration, not our disposable Summary fixture.
 const memoryImport="const {retainedBranchMemory}=await import('/901-opening-combat/work/replay_research/six_books_20261023/branch-memory.mjs');\n";
 const memoryInsert="\n      ...(retainedBranchMemory(SillyTavern.chat)?[{role:'system',content:retainedBranchMemory(SillyTavern.chat)}]:[]),";
 assert(content.includes(memoryImport)&&content.includes(memoryInsert));
 content=content.replace(memoryImport,'').replace(memoryInsert,'');assert(!content.includes('retainedBranchMemory'));
 entry.content=content;
 const marker='\n\n## 2026-10-23 六书接入\n\n';
 assert.equal(current.data.description,prior.description,'Description customized since known installation');
 assert.equal(current.data.description.split(marker).length,2);
 const routing=await readFile(resolve(base,'texts/901_六书路由说明.txt'),'utf8'),anchor=await readFile(resolve(base,'texts/901_通用主持迁移段.txt'),'utf8');
 const description=current.data.description.split(marker)[0]+marker+routing+'\n\n'+anchor;
 const patch={avatar,description,data:{description,extensions:{world:manifest.profile_books[0],tavern_helper:{...current.data.extensions.tavern_helper,scripts}},character_book:candidate.data.character_book}};
 const settings=await read(settingsPath),beforeHashes=await protectedHashes();
 const targets=[cardPath,settingsPath,...manifest.profile_books.map(n=>resolve(home,'data/default-user/worlds',n+'.json'))];
 for(const m of manifest.modules){const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));assert(!rel.startsWith('..')&&rel.startsWith('work'+sep));targets.push(resolve(home,'public/901-opening-combat',rel));}
 const targetHashes={};for(const p of targets)targetHashes[relative(home,p).split(sep).join('/')]=await exists(p)?await sha(p):null;
 const plan={avatar,entryId:entry.id,books:manifest.profile_books,moduleCount:manifest.modules.length,sourceHashes,targetHashes,protectedHashes:beforeHashes,
  memory:'preserve existing formal database memory; optional native Summary injection omitted',
  model:settings.oai_settings.google_model,privateBackup,patch};
 await save(resolve(out,'prepared.json'),plan);console.log(JSON.stringify({status:'prepared',avatar,books:plan.books.length,modules:plan.moduleCount,protectedFiles:Object.keys(beforeHashes).length,memory:plan.memory}));
}
async function verify(){
 const plan=await read(resolve(out,'prepared.json')),{manifest}=await inputs();
 for(const [p,h] of Object.entries(plan.sourceHashes))assert.equal(await sha(resolve(root,p)),h,'Candidate changed after prepare');
 const before=card(await readFile(resolve(privateBackup,'data/default-user/characters',avatar))),after=card(await readFile(cardPath));
 const expected=structuredClone(before);expected.description=plan.patch.description;expected.data.description=plan.patch.description;
 expected.data.extensions.world=plan.books[0];expected.data.extensions.tavern_helper=plan.patch.data.extensions.tavern_helper;expected.data.character_book=plan.patch.data.character_book;
 assert.deepEqual(after,expected,'Unrelated card field changed');
 const beforeSettings=await read(resolve(privateBackup,'data/default-user/settings.json')),settings=await read(settingsPath);
 const expectedSettings=structuredClone(beforeSettings),wi=expectedSettings.world_info_settings.world_info;
 wi.charLore??=[];let binding=wi.charLore.find(x=>x.name===avatar.slice(0,-4));if(!binding){binding={name:avatar.slice(0,-4),extraBooks:[]};wi.charLore.push(binding);}
 binding.extraBooks=[...new Set([...(binding.extraBooks??[]).filter(n=>!plan.books.includes(n)),...plan.books.slice(1)])];
 assert.deepEqual(settings,expectedSettings,'Settings outside formal book binding changed');
 const currentHashes=await protectedHashes();assert.deepEqual(currentHashes,plan.protectedHashes,'Chat or other character changed');
 for(const name of plan.books)assert.deepEqual(await read(resolve(home,'data/default-user/worlds',name+'.json')),await read(resolve(base,'import',name+'.json')));
 for(const m of manifest.modules){const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));assert.equal(await sha(resolve(home,'public/901-opening-combat',rel)),m.sha256);}
 const result={status:'pass',avatar,books:plan.books.length,entries:580,embeddedEntries:after.data.character_book.entries.length,modules:manifest.modules.length,
  protectedFilesUnchanged:Object.keys(currentHashes).length,chatFilesUnchanged:Object.keys(currentHashes).filter(p=>p.startsWith('data/default-user/chats/')).length,
  model:settings.oai_settings.google_model,memory:plan.memory,privateBackup,sourceCommit:await read(resolve(out,'installation.json')).then(x=>x.sourceCommit),
  scope:'six books, known host entry and full runtime closure; existing chats/state preserved; no model request or initialization'};
 await save(resolve(out,'verification.json'),result);console.log(JSON.stringify(result));
}
async function apply(){
 const plan=await read(resolve(out,'prepared.json')),{manifest,hashes:sourceHashes}=await inputs();assert.deepEqual(sourceHashes,plan.sourceHashes);
 assert(!(await exists(privateBackup)),'Backup already exists; inspect journal rather than overwrite');
 for(const [rel,h] of Object.entries(plan.targetHashes))assert.equal(await exists(resolve(home,rel))?await sha(resolve(home,rel)):null,h,'Installation target changed');
 assert.deepEqual(await protectedHashes(),plan.protectedHashes,'Protected chat/card changed before installation');
 // Back up every replaced target and all chats before the first installed write. Full settings stay outside Git.
 for(const rel of new Set([...Object.keys(plan.targetHashes),...Object.keys(plan.protectedHashes)])){
  const src=resolve(home,rel);if(!(await exists(src)))continue;const dest=resolve(privateBackup,rel);await mkdir(dirname(dest),{recursive:true});await copyFile(src,dest);
 }
 const journal={status:'backed-up',avatar,privateBackup,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),completed:[]};
 const record=async name=>{journal.completed.push(name);await save(resolve(out,'installation.json'),journal);};await save(resolve(out,'installation.json'),journal);
 const csrf=await fetch('http://localhost:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
 const post=async(path,data)=>{const r=await fetch('http://localhost:8000'+path,{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error(path+' HTTP '+r.status);};
 for(const m of manifest.modules){const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination)),dest=resolve(home,'public/901-opening-combat',rel);await mkdir(dirname(dest),{recursive:true});await copyFile(resolve(base,m.destination),dest);}await record('112 runtime modules');
 for(const name of plan.books)await post('/api/worldinfo/edit',{name,data:await read(resolve(base,'import',name+'.json'))});await record('six books');
 await post('/api/characters/merge-attributes',plan.patch);await record('formal card fields');
 const settings=await read(settingsPath),wi=settings.world_info_settings.world_info;wi.charLore??=[];
 let binding=wi.charLore.find(x=>x.name===avatar.slice(0,-4));if(!binding){binding={name:avatar.slice(0,-4),extraBooks:[]};wi.charLore.push(binding);}
 binding.extraBooks=[...new Set([...(binding.extraBooks??[]).filter(n=>!plan.books.includes(n)),...plan.books.slice(1)])];
 await post('/api/settings/save',settings);await record('five extra book bindings');
 await verify();journal.status='installed-and-verified';await save(resolve(out,'installation.json'),journal);
}
if(process.argv.includes('--prepare'))await prepare();else if(process.argv.includes('--apply'))await apply();else if(process.argv.includes('--verify'))await verify();else throw Error('Use --prepare, --apply, or --verify');
