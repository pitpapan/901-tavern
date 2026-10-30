// Isolated replay fixture only; never writes the source candidate or formal chat.
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=dirname(fileURLToPath(import.meta.url)),base=resolve(out,'..'),home='D:/github/sillyTavern';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(resolve(out,n),JSON.stringify(v,null,2)+'\n');
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const cfg=await read(resolve(out,'config.json')),sourceCfg=await read(resolve(base,'candidate/config.json'));
assert.equal(cfg.name,'901 正式入口汇合验收 20261030');
const chatPath=c=>resolve(home,'data/default-user/chats',c.name,c.chatId+'.jsonl');
const sourcePath=chatPath(sourceCfg),targetPath=chatPath(cfg),mode=process.argv[2];
assert.notEqual(sourcePath,targetPath);
if(mode==='prepare'){
 try{await access(resolve(out,'attempt-1-chat.jsonl'));throw Error('Attempt backup already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 const failed=await readFile(targetPath,'utf8');await writeFile(resolve(out,'attempt-1-chat.jsonl'),failed);
 await writeFile(resolve(out,'attempt-1-captured-rounds.json'),await readFile(resolve(out,'captured-rounds.json')));
 const sourceText=await readFile(sourcePath,'utf8'),source=sourceText.trim().split(/\r?\n/).map(JSON.parse);
 const page=structuredClone(source[7].variables[0]),original=structuredClone(page.stat_data['901_rules_poc']);
 assert.equal(original.chatId,sourceCfg.chatId);assert.equal(original.schemaVersion,1);assert.equal(original.revision,0);assert.deepEqual(original.operations,{});assert.ok(!original.battle);
 const seed=await read(resolve(out,'seed-chat.json'));assert.equal(seed.length,8);assert.equal(seed[7].mes,source[7].mes);
 page.stat_data['901_rules_poc'].chatId=cfg.chatId;
 const restored=structuredClone(page.stat_data['901_rules_poc']);restored.chatId=sourceCfg.chatId;assert.deepEqual(restored,original);
 seed[7].variables=[page];
 seed[0].chat_metadata.integration_test_seed+=' State on floor6 is replayed from accepted isolated candidate revision0, with chatId rebound; no executed mechanics are inherited.';
 await save('seed-repaired.json',seed);
 await save('seed-repair-summary.json',{sourcePath,targetPath,sourceChatSha256:hash(sourceText),failedChatSha256:hash(failed),sourceFloor:6,targetFloor:6,swipeId:0,schema:'variables[0].stat_data.901_rules_poc',revision:0,operationCount:0,battle:null,sourceRootSha256:hash(original),targetRootSha256:hash(page.stat_data['901_rules_poc']),onlyRootChange:'chatId',seededRounds:3,newLiveRounds:1});
 console.log('PASS: prepared isolated floor6 MVU replay seed; only root.chatId changed; attempt1 backed up.');
}else if(mode==='install'){
 const summary=await read(resolve(out,'seed-repair-summary.json'));
 assert.equal(hash(await readFile(sourcePath,'utf8')),summary.sourceChatSha256);
 assert.equal(hash(await readFile(targetPath,'utf8')),summary.failedChatSha256);
 const seed=await read(resolve(out,'seed-repaired.json'));assert.equal(seed[7].variables[0].stat_data['901_rules_poc'].chatId,cfg.chatId);
 const csrf=await fetch('http://127.0.0.1:8000/csrf-token'),cookie=csrf.headers.getSetCookie().map(c=>c.split(';')[0]).join('; '),{token}=await csrf.json();
 const response=await fetch('http://127.0.0.1:8000/api/chats/save',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':token,'Content-Type':'application/json'},body:JSON.stringify({avatar_url:cfg.name+'.png',file_name:cfg.chatId,chat:seed})});
 assert.ok(response.ok,'Isolated chat save '+response.status);
 const actual=(await readFile(targetPath,'utf8')).trim().split(/\r?\n/).map(JSON.parse);assert.deepEqual(actual,seed);
 assert.equal(hash(await readFile(sourcePath,'utf8')),summary.sourceChatSha256);
 console.log('PASS: only designated isolated chat repaired; disk equals seed; original candidate unchanged.');
}else throw Error('Use prepare or install');
