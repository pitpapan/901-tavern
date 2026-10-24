// Install only the six status-audit follow-up modules; preserve the first backup.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,relative,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
const base=resolve('output/replay_tavern/six_books_20261023_candidate');
const runtime=resolve('D:/github/sillyTavern/public/901-opening-combat');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=await read(resolve(base,'runtime_patch_manifest.json'));
const journal=await read(resolve(base,'installation.json'));
if((await read(resolve(base,'verification.json'))).status!=='pass')throw Error('Package verification required');
const changes=[];
for(const m of manifest.modules){
 const staged=resolve(base,m.destination),rel=relative(resolve(base,'runtime_patch/901-opening-combat'),staged);
 if(rel.startsWith('..')||!rel.startsWith('work'+sep))throw Error('Invalid runtime path');
 const dest=resolve(runtime,rel),bytes=await readFile(staged),old=await readFile(dest);
 if(hash(bytes)!==m.sha256)throw Error('Stage changed');
 if(hash(old)===m.sha256)continue;
 const installed=journal.modules.find(x=>resolve(x.path)===dest);
 if(!installed||hash(old)!==installed.sha256)throw Error('Runtime changed since installation: '+rel);
 changes.push({m,staged,dest,rel,installed,old});
}
for(const c of changes){
 const backup=resolve(base,'installation-backup/status-followup',c.rel);
 await mkdir(dirname(backup),{recursive:true});await writeFile(backup,c.old,{flag:'wx'});
 await copyFile(c.staged,c.dest);
 if(hash(await readFile(c.dest))!==c.m.sha256)throw Error('Readback failed');
 c.installed.sha256=c.m.sha256;c.installed.followupBackup=backup;
}
journal.statusFollowup={installedAt:new Date().toISOString(),modules:changes.map(c=>c.rel),tests:293,chatFilesModified:false};
await writeFile(resolve(base,'installation.json'),JSON.stringify(journal,null,2)+'\n');
console.log(JSON.stringify({status:'installed-and-readback-verified',changed:changes.length,chatFilesModified:false}));
