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
const baselinePath=resolve(base,'dialogue-review-before.json');
const stylePath='public/901-opening-combat/narrative-style.json';
if(process.argv[2]==='capture'){
 try{await access(baselinePath);throw Error('Review baseline exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 const before=await snapshot();
 assert.equal(sha(await readFile(resolve(home,stylePath))),'001c122ec20f37b82b26ee633ca00f28a9a6aa0bf3cc06c6242a88efc225a5b8');
 const expected=await readFile(resolve(base,'dialogue-style.expected.json'));
 const result={...before,expectedChange:stylePath,expectedStyleSha256:sha(expected),expectedStyleChars:JSON.parse(expected.toString()).length,scope:'Only approved speech/private thought/NPC disclosure style; no chat, card, settings or other runtime changes'};
 await writeFile(baselinePath,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:'captured',protectedFiles:Object.keys(before.files).length,expectedStyleChars:result.expectedStyleChars}));
}else if(process.argv[2]==='verify'){
 const before=await read(baselinePath),after=await snapshot();
 const changes=Object.keys(before.files).filter(p=>before.files[p]!==after.files[p]);
 assert.deepEqual(changes,[stylePath]);assert.equal(after.settingsSha256,before.settingsSha256);
 assert.equal(after.files[stylePath],before.expectedStyleSha256);
 const result={status:'pass',protectedFiles:Object.keys(before.files).length,onlyChangedFile:stylePath,formalCardUnchanged:true,originalChatSha256:after.files[originalChat],allOtherProtectedFilesUnchanged:true,fullSettingsUnchanged:true,styleSha256:after.files[stylePath],styleChars:before.expectedStyleChars,model:after.model,memoryFrozen:after.memoryFrozen,newModelCalls:0,semanticLiveTest:false};
 await writeFile(resolve(base,'dialogue-review-after.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}else throw Error('capture or verify');
