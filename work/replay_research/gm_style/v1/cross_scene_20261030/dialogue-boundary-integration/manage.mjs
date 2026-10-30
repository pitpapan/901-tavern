// Bounded adopted-style asset installation; no card, chat, settings or runtime module writes.
import {readFile,writeFile,readdir,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {selectAdoptedStyle} from '../../../../../rules_engine/gm_runtime/narrative-style-projection.mjs';
const out=import.meta.dirname,root=process.cwd(),home='D:/github/sillyTavern';
const asset='public/901-opening-combat/narrative-style.json',formal='data/default-user/characters/901 帝都初始卡.png';
const originalChat='data/default-user/chats/901 帝都初始卡/901 初始卡石像撤离实测 - 2026-10-22.jsonl';
const entryHash='b1b64b4242a0839a62b30a4ea87a5118923ab6e9a029bc7200e80e17a54b41ab';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
async function absent(p){try{await access(p);}catch(e){if(e.code==='ENOENT')return;throw e;}throw Error('Already exists: '+p);}
function entry(b){for(let i=8;i<b.length;){const n=b.readUInt32BE(i),t=b.subarray(i+4,i+8).toString(),v=b.subarray(i+8,i+8+n);i+=n+12;if(t==='tEXt'&&v.subarray(0,6).toString()==='chara\0'){const card=JSON.parse(Buffer.from(v.subarray(6).toString(),'base64').toString());return card.data.extensions.tavern_helper.scripts.find(s=>s.name==='901 帝都初始卡入口').content;}}throw Error('No card');}
async function snapshot(){const files={};async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files[relative(home,p).replaceAll('\\','/')]=sha(await readFile(p));}}
 for(const dir of ['data/default-user/characters','data/default-user/chats','data/default-user/worlds','public/901-opening-combat'])await walk(resolve(home,dir));
 const settings=await readFile(resolve(home,'data/default-user/settings.json'));
 return {files,settingsSha256:sha(settings),entrySha256:sha(entry(await readFile(resolve(home,formal))))};
}
async function verify(installed){const before=await read(resolve(out,'protected-before.json')),now=await snapshot();
 assert.deepEqual(Object.keys(now.files).sort(),Object.keys(before.files).sort());
 const changed=Object.keys(before.files).filter(p=>before.files[p]!==now.files[p]);assert.deepEqual(changed,installed?[asset]:[]);
 assert.equal(now.settingsSha256,before.settingsSha256);assert.equal(now.entrySha256,entryHash);
 if(installed){const expected=await readFile(resolve(out,'narrative-style.expected.json'));assert.deepEqual(await readFile(resolve(home,asset)),expected);
  const response=await fetch('http://127.0.0.1:8000/901-opening-combat/narrative-style.json',{cache:'no-store'});assert.ok(response.ok);assert.deepEqual(Buffer.from(await response.arrayBuffer()),expected);}
 return {status:'pass',protectedFiles:Object.keys(before.files).length,changedFiles:changed,formalCardByteUnchanged:true,entrySha256:now.entrySha256,settingsByteUnchanged:true,allChatsSavesWorldbooksAndRuntimeModulesUnchanged:true,styleFileSha256:now.files[asset],diskAndHttpMatch:installed};
}
const mode=process.argv[2];
if(mode==='prepare'){
 await absent(resolve(out,'protected-before.json'));const before=await snapshot();assert.equal(before.entrySha256,entryHash);
 assert.equal(before.files[originalChat],'c4be8e3f33a80dde5aa4d1830a85124e63a56ef1cc9fb7df95e95320863c06cc');
 const bytes=await readFile(resolve(home,asset)),old=JSON.parse(bytes.toString()),adopted=selectAdoptedStyle(await read(resolve(root,'work/replay_research/gm_style/v1/authoring.json')));
 const changes=[['【……】表示玩家写下的私人内心，不作标题或强调。即使没有【】','玩家写的[……]与【……】均表示未说出口的私人内心，不作标题或强调。即使没有括号'],['NPC心理通过可观察言行表现，不输出内心独白。','NPC心理通过可观察言行表现；不得输出[……]或【……】形式的NPC内心独白，也不得改用全知旁白直接揭露其未公开的真实想法、动机或判断。']];
 let patched=old;for(const [a,b]of changes){assert.equal(patched.split(a).length,2);patched=patched.replace(a,b);}assert.equal(patched,adopted);assert.equal(old.length,2757);assert.equal(adopted.length,2812);
 const script=entry(await readFile(resolve(home,formal)));assert.ok(script.includes("fetch('/901-opening-combat/narrative-style.json')"));assert.ok(script.includes('retainedBranchMemory'));assert.ok(script.includes('未声明的动作'));
 await save('protected-before.json',before);await writeFile(resolve(out,'formal-card.before.png'),await readFile(resolve(home,formal)));await writeFile(resolve(out,'narrative-style.before.json'),bytes);await save('narrative-style.expected.json',adopted);
 await save('prepared.json',{status:'ready',protectedFiles:Object.keys(before.files).length,onlyAllowedChange:asset,entrySha256:entryHash,beforeCharacters:old.length,afterCharacters:adopted.length,beforeContentSha256:sha(old),afterContentSha256:sha(adopted),exactReplacements:changes});console.log('Prepared protected snapshot and exact two-replacement style asset.');
}else if(mode==='install'){
 await absent(resolve(out,'installation.json'));await verify(false);
 assert.equal(await read(resolve(out,'narrative-style.expected.json')),selectAdoptedStyle(await read(resolve(root,'work/replay_research/gm_style/v1/authoring.json'))));
 await writeFile(resolve(home,asset),await readFile(resolve(out,'narrative-style.expected.json')));
 const result=await verify(true);await save('protection-after.json',result);await save('installation.json',{...result,installedAt:new Date().toISOString(),newModelCalls:0,newUIActions:0,cardWrites:0,chatWrites:0,runtimeModulesInstalled:0,scope:'Only adopted dialogue/private-thought style asset; no new semantic live test'});console.log(JSON.stringify(result));
}else if(mode==='verify'){const result=await verify(true);await save('protection-after.json',result);console.log(JSON.stringify(result));}else throw Error('Use prepare, install or verify');
