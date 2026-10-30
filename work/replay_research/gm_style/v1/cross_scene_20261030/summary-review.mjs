// Independent read-only Tavern review. Writes evidence only beside this script.
import {readFile,writeFile,readdir,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base=import.meta.dirname,home='D:/github/sillyTavern';
const formal='data/default-user/characters/901 帝都初始卡.png';
const originalChat='data/default-user/chats/901 帝都初始卡/901 初始卡石像撤离实测 - 2026-10-22.jsonl';
const sha=x=>createHash('sha256').update(x).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
function cardFromPng(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0')return JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());}throw Error('No card');}
const entry=c=>c.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口');
async function snapshot(){
 const files={};
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=sha(await readFile(p));}}
 for(const p of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,p));
 const s=await read(resolve(home,'data/default-user/settings.json'));
 return {files,settingsSha256:sha(await readFile(resolve(home,'data/default-user/settings.json'))),model:s.oai_settings.custom_model,memorySource:s.extension_settings.memory.source,memoryFrozen:s.extension_settings.memory.memoryFrozen};
}
const baselinePath=resolve(base,'summary-review-before.json');
if(process.argv[2]==='capture'){
 try{await access(baselinePath);throw Error('Review baseline exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 const s=await snapshot(),card=cardFromPng(await readFile(resolve(home,formal))),before=entry(card).content;
 assert.equal(sha(before),'b7148f4d6d84a3f8212f16b299f0ba5c59168c36bf9a42c2c28fbd56557f253a');
 entry(card).content=(await read(resolve(base,'summary-entry.expected.json'))).content;
 const rows=(await readFile(resolve(home,originalChat),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
 assert.equal(rows.length-1,31);
 const result={...s,expectedScope:'Manual native Summary read only; original chat, empty database, model and frozen Summary settings unchanged',expectedCardJsonSha256:sha(JSON.stringify(card)),expectedEntrySha256:sha(entry(card).content),entryBeforeSha256:sha(before),originalMessages:31,originalSummaryFloors:rows.slice(1).flatMap((m,i)=>m.extra?.memory?[i]:[])};
 await writeFile(baselinePath,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:'captured',protectedFiles:Object.keys(s.files).length,originalMessages:31,nativeSummaryFloors:result.originalSummaryFloors,model:s.model,memoryFrozen:s.memoryFrozen}));
}else if(process.argv[2]==='verify'){
 const before=await read(baselinePath),after=await snapshot();
 const changes=Object.keys(before.files).filter(p=>after.files[p]!==before.files[p]);
 assert.deepEqual(changes,[formal]);assert.equal(after.settingsSha256,before.settingsSha256);
 const card=cardFromPng(await readFile(resolve(home,formal)));
 assert.equal(sha(JSON.stringify(card)),before.expectedCardJsonSha256);
 assert.equal(entry(card).content,(await read(resolve(base,'summary-entry.expected.json'))).content);
 assert.equal(sha(entry(card).content),before.expectedEntrySha256);
 const result={status:'pass',protectedFiles:Object.keys(before.files).length,expectedChanges:changes,otherFilesByteUnchanged:true,fullSettingsByteUnchanged:true,formalCardOnlyExpectedEntryChange:true,entryEqualsExpectedInstallation:true,expectedScope:before.expectedScope,entrySha256:sha(entry(card).content),originalChatSha256:after.files[originalChat],originalMessages:31,model:after.model,memorySource:after.memorySource,memoryFrozen:after.memoryFrozen};
 await writeFile(resolve(base,'summary-review-after.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}else throw Error('capture or verify');
