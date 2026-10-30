// Restore the formal card's database mode by removing only the two Summary insertions.
import {readFile,writeFile,readdir,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {patchSummaryMemory} from '../../../../../rules_engine/gm_runtime/narrative-style-projection.mjs';
const out=import.meta.dirname,home='D:/github/sillyTavern';
const formal='data/default-user/characters/901 帝都初始卡.png',style='public/901-opening-combat/narrative-style.json';
const hashes={before:'b1b64b4242a0839a62b30a4ea87a5118923ab6e9a029bc7200e80e17a54b41ab',after:'b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a',style:'1c0d8e03aa91e14a5bd94650199d1493ce344ce6b54e59f7935671cf73b3ffcb'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
const entry=c=>c.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口');
function card(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
async function snapshot(){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=sha(await readFile(p));}}
 for(const dir of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,dir));
 return {files,settingsSha256:sha(await readFile(resolve(home,'data/default-user/settings.json')))};
}
async function verify(installed){const before=await read(resolve(out,'protected-before.json')),now=await snapshot();assert.deepEqual(Object.keys(now.files).sort(),Object.keys(before.files).sort());
 const changed=Object.keys(before.files).filter(p=>before.files[p]!==now.files[p]);assert.deepEqual(changed,installed?[formal]:[]);assert.equal(now.settingsSha256,before.settingsSha256);assert.equal(now.files[style],hashes.style);
 const actual=card(await readFile(resolve(home,formal))),expected=await read(resolve(out,installed?'formal-card.expected.json':'formal-card.before.json'));assert.deepEqual(actual,expected);assert.equal(sha(entry(actual).content),installed?hashes.after:hashes.before);
 return {status:'pass',protectedFiles:Object.keys(before.files).length,changedFiles:changed,entrySha256:sha(entry(actual).content),summaryWiringRemoved:installed,onlyTwoSummaryInsertionsRemoved:installed,styleSha256:now.files[style],fullSettingsUnchanged:true,allOtherFilesByteUnchanged:true};
}
const mode=process.argv[2];
if(mode==='prepare'){
 await absent(resolve(out,'protected-before.json'));const before=await snapshot();assert.equal(before.files[style],hashes.style);
 const png=await readFile(resolve(home,formal)),originalCard=card(png),original=entry(originalCard).content;assert.equal(sha(original),hashes.before);
 const insertions=["const {retainedBranchMemory}=await import('/901-opening-combat/work/replay_research/six_books_20261023/branch-memory.mjs');\n","\n      ...(retainedBranchMemory(SillyTavern.chat)?[{role:'system',content:retainedBranchMemory(SillyTavern.chat)}]:[]),"];
 let restored=original;for(const insertion of insertions){assert.equal(restored.split(insertion).length,2);restored=restored.replace(insertion,'');}
 assert.equal(sha(restored),hashes.after);assert.equal(patchSummaryMemory(restored),original);assert.ok(!restored.includes('retainedBranchMemory'));assert.ok(restored.includes('未声明的动作'));assert.ok(restored.includes("fetch('/901-opening-combat/narrative-style.json')"));
 await save('protected-before.json',before);await writeFile(resolve(out,'formal-card.before.png'),png);await save('formal-card.before.json',originalCard);const expected=structuredClone(originalCard);entry(expected).content=restored;await save('formal-card.expected.json',expected);
 await writeFile(resolve(out,'host-entry.before.js'),original);await writeFile(resolve(out,'host-entry.after.js'),restored);
 await save('prepared.json',{status:'pass',...hashes,protectedFiles:Object.keys(before.files).length,exactRemovals:insertions,roundTripSummaryPatchRestoresOriginal:true,onlyAllowedChange:formal});console.log('Prepared exact Summary removal, round-trip assertion passed; all other bytes preserved.');
}else if(mode==='install'){
 await absent(resolve(out,'installation.json'));await verify(false);const expected=await read(resolve(out,'formal-card.expected.json'));
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
 const response=await fetch('http://127.0.0.1:8000/api/characters/merge-attributes',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({avatars:['901 帝都初始卡.png'],data:{data:{extensions:{tavern_helper:{scripts:expected.data.extensions.tavern_helper.scripts}}}}})});
 assert.ok(response.ok);const result=await response.json();assert.deepEqual(result.updated,['901 帝都初始卡.png']);assert.deepEqual(result.failed,[]);
 const proof=await verify(true);await save('protection-after.json',proof);await save('installation.json',{...proof,installedAt:new Date().toISOString(),mode:'formal database memory; Summary optional for isolated copies',newUIActions:0,newModelCalls:0,chatWrites:0,runtimeModulesInstalled:0});console.log(JSON.stringify(proof));
}else if(mode==='verify'){const proof=await verify(true);await save('protection-after.json',proof);console.log(JSON.stringify(proof));}else throw Error('Use prepare, install or verify');
