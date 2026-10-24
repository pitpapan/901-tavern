// Preserve the original and status-followup backups. Only runtime modules change.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,relative,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
const base=resolve('output/replay_tavern/six_books_20261023_candidate'),runtime=resolve('D:/github/sillyTavern/public/901-opening-combat');
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=await read(resolve(base,'runtime_patch_manifest.json')),journal=await read(resolve(base,'installation.json'));
const tests=await readFile(resolve(base,'scene_test/remaining-audit.tap'),'utf8');
if(!/# tests 318\r?\n/.test(tests)||!/# pass 318\r?\n/.test(tests)||!/# fail 0\r?\n/.test(tests))throw Error('Final regression evidence required');
if((await read(resolve(base,'verification.json'))).status!=='pass')throw Error('Package verification required');
const changes=[];
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
if(!process.argv.includes('--apply')){console.log(JSON.stringify({status:'ready',totalModules:manifest.modules.length,changes:changes.map(x=>({path:x.rel,new:!x.old})),tests:318}));process.exit(0);}
for(const c of changes){
 let backup=null;if(c.old){backup=resolve(base,'installation-backup/remaining-rules',c.rel);await mkdir(dirname(backup),{recursive:true});await writeFile(backup,c.old,{flag:'wx'});}
 await mkdir(dirname(c.dest),{recursive:true});await copyFile(c.staged,c.dest);
 if(hash(await readFile(c.dest))!==c.m.sha256)throw Error('Installed readback failed: '+c.rel);
 if(c.installed){c.installed.sha256=c.m.sha256;c.installed.remainingRulesBackup=backup;}
 else journal.modules.push({path:c.dest,sha256:c.m.sha256,backup:null,addedBy:'remainingRules'});
}
for(const m of manifest.modules){const rel=relative(resolve(base,'runtime_patch/901-opening-combat'),resolve(base,m.destination));if(hash(await readFile(resolve(runtime,rel)))!==m.sha256)throw Error('Final closure mismatch');}
journal.remainingRules={installedAt:new Date().toISOString(),modules:changes.map(c=>c.rel),totalModules:manifest.modules.length,tests:318,testReport:'scene_test/remaining-audit.tap',chatFilesModified:false,cardFilesModified:false};
await writeFile(resolve(base,'installation.json'),JSON.stringify(journal,null,2)+'\n');
console.log(JSON.stringify({status:'installed-and-readback-verified',changed:changes.length,totalModules:manifest.modules.length,tests:318,chatFilesModified:false,cardFilesModified:false}));
