// Adopt the already tested narrationInstruction only. No model or chat operations.
import {readFile,writeFile,readdir,mkdir,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {patchNarrationInstruction} from '../../../../../rules_engine/gm_runtime/narrative-style-projection.mjs';
const out=import.meta.dirname,base=resolve(out,'..'),root=process.cwd(),home='D:/github/sillyTavern';
const formalPath='data/default-user/characters/901 帝都初始卡.png';
const packageDir=resolve(root,'output/replay_tavern/six_books_20261023_candidate');
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
const change=await read(resolve(base,'candidate-change.json'));
const host=card=>card.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口');
function pngCard(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
async function filesUnder(directory){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(directory,p).replaceAll('\\','/')]=hash(await readFile(p));}}await walk(directory);return files;}
async function liveSnapshot(){const files={};for(const dir of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])for(const [p,h]of Object.entries(await filesUnder(resolve(home,dir))))files[dir+'/'+p]=h;
 const settingsBytes=await readFile(resolve(home,'data/default-user/settings.json')),s=JSON.parse(settingsBytes.toString());
 return {files,settingsFileHash:hash(settingsBytes),oaiHash:hash(JSON.stringify(s.oai_settings)),memoryHash:hash(JSON.stringify(s.extension_settings.memory)),model:{source:s.oai_settings.chat_completion_source,model:s.oai_settings.custom_model}};
}
async function verify(installed){const before=await read(resolve(out,'protected-before.json')),current=await liveSnapshot();assert.deepEqual(Object.keys(current.files).sort(),Object.keys(before.files).sort());
 const changed=Object.keys(before.files).filter(p=>current.files[p]!==before.files[p]);assert.deepEqual(changed,installed?[formalPath]:[]);
 for(const key of ['settingsFileHash','oaiHash','memoryHash'])assert.equal(current[key],before[key]);
 const expected=await read(resolve(out,installed?'formal-card.expected.json':'formal-card.before.json')),actual=pngCard(await readFile(resolve(home,formalPath)));assert.deepEqual(actual,expected);
 const result={status:'pass',protectedFiles:Object.keys(before.files).length,expectedChanges:changed,otherFilesByteUnchanged:true,cardOnlyNarrationInstructionChanged:installed,settingsFileUnchanged:true,modelAndMemoryUnchanged:true,model:current.model,entrySha256:hash(host(actual).content),recoveryGateSha256:current.files['public/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js']};
 if(installed)assert.equal(result.entrySha256,change.afterEntrySha256);return result;
}
const mode=process.argv[2];
if(mode==='prepare'){
 await absent(resolve(out,'protected-before.json'));await mkdir(out,{recursive:true});
 const before=await liveSnapshot();assert.deepEqual(before.model,{source:'custom',model:'[抗截断]gemini-3.8-flash'});
 assert.equal(before.files['public/901-opening-combat/work/rules_engine/gm_runtime/replay-gate-script.example.js'],'f8a5a13bf2085e98a6befbc6a1505c66d7afd24b99f0b006458e41fa6a6e1d1d');
 const png=await readFile(resolve(home,formalPath)),card=pngCard(png),original=host(card).content;
 assert.equal(hash(original),change.beforeEntrySha256);const patched=patchNarrationInstruction(original);
 assert.equal(patched,original.replace(change.before,change.after));assert.equal(hash(patched),change.afterEntrySha256);assert.equal(patched,await readFile(resolve(base,'candidate-entry.js'),'utf8'));
 await save('protected-before.json',before);await writeFile(resolve(out,'formal-card.before.png'),png);await save('formal-card.before.json',card);host(card).content=patched;await save('formal-card.expected.json',card);
 await writeFile(resolve(out,'host-entry.before.js'),original);await writeFile(resolve(out,'host-entry.after.js'),patched);
 await save('prepared.json',{beforeEntrySha256:hash(original),afterEntrySha256:hash(patched),onlyField:change.field,adoptedCandidateIdentical:true,protectedFiles:Object.keys(before.files).length,formalTarget:formalPath});
 console.log('Prepared exact one-string formal patch and backup.');
}else if(mode==='sync-local'){
 await absent(resolve(out,'candidate-projection.json'));const before=await filesUnder(packageDir),changes=[];
 for(const path of ['import/901_六书主持入口.script.json','import/901_帝都初始卡_六书候选.card.json']){
  const file=resolve(packageDir,path),text=await readFile(file,'utf8'),old=JSON.parse(text),entry=old.content===undefined?host(old):old;
  const expected=structuredClone(old),expectedEntry=old.content===undefined?host(expected):expected;expectedEntry.content=patchNarrationInstruction(entry.content);
  assert.equal(text.split(change.before).length,2);const updated=text.replace(change.before,change.after);assert.deepEqual(JSON.parse(updated),expected);
  await writeFile(file,updated);changes.push(path);
 }
 const after=await filesUnder(packageDir);assert.deepEqual(Object.keys(after).sort(),Object.keys(before).sort());assert.deepEqual(Object.keys(before).filter(p=>before[p]!==after[p]).sort(),changes.sort());
 await save('candidate-projection.json',{status:'pass',existingFilesChecked:Object.keys(before).length,changedFiles:changes,otherFilesByteUnchanged:Object.keys(before).length-2,onlyField:change.field,before:Object.fromEntries(changes.map(p=>[p,before[p]])),after:Object.fromEntries(changes.map(p=>[p,after[p]]))});
 console.log('PASS: only narrationInstruction changed in the two generated entry JSON files.');
}else if(mode==='install'){
 await absent(resolve(out,'installation.json'));await verify(false);const expected=await read(resolve(out,'formal-card.expected.json'));
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
 const response=await fetch('http://127.0.0.1:8000/api/characters/merge-attributes',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({avatars:['901 帝都初始卡.png'],data:{data:{extensions:{tavern_helper:{scripts:expected.data.extensions.tavern_helper.scripts}}}}})});
 assert.ok(response.ok,'Character update '+response.status);const result=await response.json();assert.deepEqual(result.updated,['901 帝都初始卡.png']);assert.deepEqual(result.failed,[]);
 const protection=await verify(true);await save('protection-after.json',protection);await save('installation.json',{status:'installed-and-verified',installedAt:new Date().toISOString(),onlyField:change.field,beforeEntrySha256:change.beforeEntrySha256,installedEntrySha256:change.afterEntrySha256,adoptedCandidateIdentical:true,runtimeModulesInstalled:0,worldbooksChanged:0,chatFilesModifiedOrDeleted:0,newModelCalls:0,newUIActions:0});console.log(JSON.stringify(protection));
}else if(mode==='verify'){const result=await verify(true);await save('protection-after.json',result);console.log(JSON.stringify(result));}
else throw Error('Use prepare, sync-local, install or verify');
