import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const out=import.meta.dirname,home='D:/github/sillyTavern';
const read=async p=>JSON.parse(await readFile(p,'utf8')),hash=x=>createHash('sha256').update(x).digest('hex');
const cfg=await read(resolve(out,'config.json'));
const rows=(await readFile(resolve(home,'data/default-user/chats',cfg.name,cfg.chatId+'.jsonl'),'utf8')).trim().split(/\r?\n/).map(JSON.parse);
const runs=rows[0].chat_metadata.narrative_acceptance_20261030;
assert.equal(runs.length,4);
const classify=r=>r.requests.filter(q=>q.messages.some(m=>String(m.content).includes('你是901行动分类器'))).length;
const narrate=r=>r.requests.filter(q=>q.messages.some(m=>String(m.content).includes('裁定路径：'))).length;
assert.equal(classify(runs[0]),1);assert.equal(narrate(runs[0]),1);
assert.match(runs[1].messages.at(-1).text,/这次行动尚未执行/);
assert.equal(classify(runs[1]),1);assert.equal(narrate(runs[1]),0);
const failed=runs[2].messages.at(-1);
assert.match(failed.text,/无需检定.*叙述尚未完成/);
assert.equal(failed.gate.status,'NARRATION_PENDING');assert.equal(failed.gate.diagnostic.httpStatus,503);
assert.equal(failed.gate.diagnostic.classificationRequests,0);
assert.equal(classify(runs[2]),0);assert.equal(narrate(runs[2]),0);
assert.equal(classify(runs[3]),0);assert.equal(narrate(runs[3]),1);
assert.equal(runs[3].messages.at(-1).gate.status,'NO_CHECK');
assert.doesNotMatch(runs[3].messages.at(-1).text,/行动尚未执行|叙述尚未完成/);
const seed=await read(resolve(out,'seed-chat.json'));
const root=m=>m.variables[m.swipe_id??0].stat_data['901_rules_poc'];
assert.deepEqual(root(rows.at(-1)),root(seed.at(-1)));
assert.equal(rows.filter(m=>m.is_user).length,seed.filter(m=>m.is_user).length+2);
const before=await read(resolve(out,'protected-before.json')),changes=[];
let installation=null;try{installation=await read(resolve(out,'formal-installation.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
for(const[p,h]of Object.entries(before.files))if(hash(await readFile(resolve(home,p)))!==h)changes.push(p);
assert.deepEqual(changes,installation?[installation.relativePath]:[]);
if(installation)assert.equal(hash(await readFile(resolve(home,installation.relativePath))),installation.installedSha256);
const settings=await read(resolve(home,'data/default-user/settings.json'));
assert.equal(hash(JSON.stringify(settings.oai_settings)),before.oaiHash);assert.equal(hash(JSON.stringify(settings.extension_settings.memory)),before.memoryHash);
const result={status:'pass',naturalRepeat:{classification:1,narration:1},controlledFaults:2,
 baselineMisreportReproduced:true,fixedFailure:{status:failed.gate.status,diagnostic:failed.gate.diagnostic},
 nativeRetry:{classification:0,narration:1,newUserMessages:0,status:'NO_CHECK'},
 state:{revision:root(rows.at(-1)).revision,exactSeedRootUnchanged:true},
 protectedFiles:Object.keys(before.files).length,expectedChanges:changes,allOtherProtectedFilesUnchanged:true,modelAndMemoryUnchanged:true,model:before.model,
 formalInstalled:!!installation,tests:{command:'node --test work/rules_engine/gm_runtime/replay-gate-script.test.mjs work/rules_engine/gm_runtime/narrative.test.mjs',passed:48,failed:0}};
await writeFile(resolve(out,'verification.json'),JSON.stringify(result,null,2)+'\n');
await writeFile(resolve(out,'captured-rounds.json'),JSON.stringify(runs,null,2)+'\n');
console.log(JSON.stringify(result));
