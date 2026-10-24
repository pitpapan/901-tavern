import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,relative,dirname,sep} from 'node:path';import {createHash} from 'node:crypto';
const base=resolve('output/replay_tavern/six_books_20261023_candidate'),home='D:/github/sillyTavern',runtime=resolve(home,'public/901-opening-combat');
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=await read(resolve(base,'runtime_patch_manifest.json')),journal=await read(resolve(base,'installation.json')),baseline=await read(resolve(base,'adopted-baseline.json'));
const tests=await readFile(resolve(base,'scene_test/guanlan-regression.tap'),'utf8');
if(!/# tests 367\r?\n/.test(tests)||!/# pass 367\r?\n/.test(tests)||!/# fail 0\r?\n/.test(tests))throw Error('Final 367-test regression evidence required');
if((await read(resolve(base,'verification.json'))).status!=='pass'||(await read(resolve(base,'scene_test/guanlan-xp-smoke.json'))).status!=='pass')throw Error('Package and XP verification required');
const changes=[],books=[];
for(const m of manifest.modules){
 const staged=resolve(base,m.destination),rel=relative(resolve(base,'runtime_patch/901-opening-combat'),staged);
 if(rel.startsWith('..')||!rel.startsWith('work'+sep))throw Error('Invalid module path');
 const dest=resolve(runtime,rel),bytes=await readFile(staged);if(hash(bytes)!==m.sha256)throw Error('Staged module changed');
 let old;try{old=await readFile(dest);}catch(e){if(e.code!=='ENOENT')throw e;}
 if(old&&hash(old)===m.sha256)continue;
 const installed=journal.modules.find(x=>resolve(x.path)===dest);
 if(old&&(!installed||hash(old)!==installed.sha256)||!old&&installed)throw Error('Runtime differs from installed journal: '+rel);
 changes.push({m,staged,dest,rel,installed,old});
}
for(const b of baseline.books){
 const old=await readFile(b.path),data=await read(resolve(base,'import',b.name+'.json'));
 if(JSON.stringify(JSON.parse(old))===JSON.stringify(data))continue;
 const expected=journal.guanlanGrowth?.books?.find(x=>x.name===b.name)?.sha256??journal.adoptedDecisions?.books?.find(x=>x.name===b.name)?.sha256??b.sha256;
 if(hash(old)!==expected)throw Error('Worldbook changed since reviewed baseline: '+b.name);
 const before=JSON.parse(old);if(Object.keys(data.entries).join()!==Object.keys(before.entries).join())throw Error('Unexpected UID change');
 books.push({...b,old,data,changedEntries:Object.keys(data.entries).filter(k=>JSON.stringify(data.entries[k])!==JSON.stringify(before.entries[k]))});
}
if(hash(await readFile(baseline.card.path))!==baseline.card.sha256)throw Error('Card changed since preflight');
if(books.some(b=>b.name===manifest.profile_books[0]))throw Error('Primary embedded worldbook needs separate reviewed merge');
if(!process.argv.includes('--apply')){console.log(JSON.stringify({status:'ready',totalModules:manifest.modules.length,modules:changes.map(c=>c.rel),books:books.map(b=>({name:b.name,changedEntries:b.changedEntries})),tests:367,cardFilesModified:false,chatFilesModified:false}));process.exit(0);}
const csrf=await fetch('http://localhost:8000/csrf-token');if(!csrf.ok)throw Error('Local server unavailable');
const cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
const save=()=>writeFile(resolve(base,'installation.json'),JSON.stringify(journal,null,2)+'\n');
for(const c of changes){
 const backup=c.old?resolve(base,'installation-backup/guanlan-growth/runtime',c.rel):null;
 if(backup){await mkdir(dirname(backup),{recursive:true});await writeFile(backup,c.old,{flag:'wx'});}
 await mkdir(dirname(c.dest),{recursive:true});await copyFile(c.staged,c.dest);
 if(hash(await readFile(c.dest))!==c.m.sha256)throw Error('Runtime readback failed');
 if(c.installed){c.installed.sha256=c.m.sha256;c.installed.guanlanGrowthBackup=backup;}
 else journal.modules.push({path:c.dest,sha256:c.m.sha256,backup,addedBy:'guanlanGrowth'});
 await save();
}
const bookEvidence=[];
for(const b of books){
 const backup=resolve(base,'installation-backup/guanlan-growth/worlds',b.name+'.json');await mkdir(dirname(backup),{recursive:true});await writeFile(backup,b.old,{flag:'wx'});
 const response=await fetch('http://localhost:8000/api/worldinfo/edit',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({name:b.name,data:b.data})});
 if(!response.ok)throw Error('Worldbook edit HTTP '+response.status);
 const bytes=await readFile(b.path);if(JSON.stringify(JSON.parse(bytes))!==JSON.stringify(b.data))throw Error('Worldbook readback failed');
 bookEvidence.push({name:b.name,path:b.path,sha256:hash(bytes),backup,changedEntries:b.changedEntries});
}
for(const m of manifest.modules){const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));if(hash(await readFile(resolve(runtime,rel)))!==m.sha256)throw Error('Final runtime closure mismatch');}
for(const b of baseline.books)if(JSON.stringify(await read(b.path))!==JSON.stringify(await read(resolve(base,'import',b.name+'.json'))))throw Error('Final six-book readback mismatch');
if(hash(await readFile(baseline.card.path))!==baseline.card.sha256)throw Error('Unrelated card changed');
journal.guanlanGrowth={installedAt:new Date().toISOString(),modules:changes.map(c=>c.rel),totalModules:manifest.modules.length,books:bookEvidence,tests:367,testReport:'scene_test/guanlan-regression.tap',xpReport:'scene_test/guanlan-xp-smoke.json',status:'installed-and-readback-verified',cardFilesModified:false,chatFilesModified:false};
await save();console.log(JSON.stringify({status:journal.guanlanGrowth.status,changedModules:changes.length,totalModules:manifest.modules.length,changedBooks:books.length,changedEntries:books.reduce((n,b)=>n+b.changedEntries.length,0),tests:367,cardFilesModified:false,chatFilesModified:false}));
