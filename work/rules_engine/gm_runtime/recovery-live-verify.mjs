import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const out=new URL('../../../output/replay_tavern/recovery_playtest_20261023_candidate/',import.meta.url);
const rootFrom=async name=>{
  const rows=(await readFile(new URL(name,out),'utf8')).trim().split('\n').map(JSON.parse);
  const floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
  if(!floor)throw Error(`No persisted MVU in ${name}`);
  return floor.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
};
const before=await rootFrom('main-before-refresh.jsonl'),after=await rootFrom('main-refresh.jsonl');
assert.deepEqual(after,before,'refresh must preserve full MVU');
const beforeRegen=await rootFrom('main-before-regenerate.jsonl'),afterRegen=await rootFrom('main-regenerate.jsonl');
assert.deepEqual(afterRegen,beforeRegen,'same-floor regeneration must not debit or settle twice');
const initial=await rootFrom('main-initial.jsonl'),state=after.actors.player.state;
const stateFrom=async stage=>(await rootFrom(`main-${stage}.jsonl`)).actors.player.state;
const amount=(s,name)=>s.inventory.find(x=>x.name===name).quantity;
const afterB=await stateFrom('after-b');
assert.deepEqual([afterB.health.intact,afterB.health.B,afterB.health.L,afterB.health.A],[7,1,1,3]);
assert.equal(amount(afterB,'药B'),2);
const afterC=await stateFrom('after-c');
assert.deepEqual(afterC.health,initial.actors.player.state.health);assert.equal(amount(afterC,'药C'),3);
assert.ok(afterC.pendingRecoveryEffects.some(e=>e.medicine==='药C'));
const afterShort=await stateFrom('after-short');
assert.deepEqual([afterShort.health.intact,afterShort.health.B,afterShort.health.L,afterShort.health.A],[9,0,0,3]);
assert.equal(afterShort.will.current,1);assert.equal(afterShort.resources.流风.current,10);
const afterPeiyuan=await stateFrom('after-peiyuan');
assert.deepEqual(afterPeiyuan.health,afterShort.health);assert.equal(amount(afterPeiyuan,'培元丹'),2);
assert.ok(afterPeiyuan.pendingRecoveryEffects.some(e=>e.medicine==='培元丹'));
const afterLotus=await stateFrom('after-lotus');
assert.equal(afterLotus.resources.流风.current,13);assert.equal(amount(afterLotus,'雪莲子'),0);
const afterMeditate=await stateFrom('after-meditate');
const rootLotus=await rootFrom('main-after-lotus.jsonl'),rootMeditate=await rootFrom('main-after-meditate.jsonl');
const meditationOperations=Object.entries(rootMeditate.operations).filter(([id])=>!Object.hasOwn(rootLotus.operations,id));
assert.equal(meditationOperations.length,1,'one completed meditation adds exactly one operation');
const meditationResult=meditationOperations[0][1].summary.result;
assert.equal(meditationResult.type,'meditate');assert.equal(meditationResult.minutes,15);
assert.equal(afterMeditate.recoveryClock.minutes-afterLotus.recoveryClock.minutes,15);
const successes=meditationResult.changes.filter(c=>c.source==='打坐'&&Number.isInteger(c.successes)).reduce((n,c)=>n+c.successes,0);
assert.equal(afterMeditate.resources.流风.current,Math.min(22,13+successes));
assert.deepEqual(afterMeditate.health,afterPeiyuan.health);
assert.deepEqual([state.health.intact,state.health.B,state.health.L,state.health.A],[12,0,0,0]);
assert.equal(state.will.current,2);assert.equal(state.resources.流风.current,22);
assert.deepEqual(state.pendingRecoveryEffects,[]);
assert.equal(state.derived.hpMax,12);assert.deepEqual(Object.keys(after.actors),['player']);
assert.equal(state.resources.流风.max,22);assert.equal(state.xp,0);
assert.ok(after.revision>initial.revision,'live declarations must perform real operations');
assert.equal(after.revision,7);assert.equal(Object.keys(after.operations).length,7);
const aPending=(await rootFrom('medicine-a-after-a.jsonl')).actors.player.state;
assert.deepEqual(aPending.health,initial.actors.player.state.health);
assert.equal(amount(aPending,'药A'),1);assert.ok(aPending.pendingRecoveryEffects.some(e=>e.medicine==='药A'));
const aRoot=await rootFrom('medicine-a-after-long.jsonl'),aFinal=aRoot.actors.player.state;
assert.deepEqual([aFinal.health.intact,aFinal.health.B,aFinal.health.L,aFinal.health.A],[6,0,6,0]);
assert.equal(amount(aFinal,'药A'),1);assert.deepEqual(aFinal.pendingRecoveryEffects,[]);
assert.equal(aRoot.revision,2);assert.equal(Object.keys(aRoot.operations).length,2);
const aProseRoot=await rootFrom('medicine-a-after-prose-short.jsonl'),aProse=aProseRoot.actors.player.state;
assert.equal(aProseRoot.revision,3);assert.equal(Object.keys(aProseRoot.operations).length,3);
assert.deepEqual(aProse.health,aFinal.health,'additional short rest must retain all six L');
assert.deepEqual(aProse.inventory,aFinal.inventory);assert.deepEqual(aProse.will,aFinal.will);
assert.equal(aProse.recoveryClock.minutes-aFinal.recoveryClock.minutes,15);
const aProseRows=(await readFile(new URL('medicine-a-after-prose-short.jsonl',out),'utf8')).trim().split('\n').map(JSON.parse);
const aProseText=aProseRows.findLast(r=>r.is_user===false)?.mes;
assert.match(aProseText,/未[愈痊]|伤痛并未完全退去/,'actual continuation should acknowledge remaining injury');
const source=JSON.parse(await readFile(new URL('../flow_guidance_20261018_candidate/import/901_帝都主持.card.json',out),'utf8'));
const card=JSON.parse(await readFile(new URL('import/901_药品休息隔离实测.card.json',out),'utf8'));
assert.deepEqual(card.data.character_book.entries,source.data.character_book.entries);
assert.equal(card.data.character_book.entries.length,136);
let deployedFiles=0;
async function walk(dir,prefix='') {
  for(const file of await readdir(dir,{withFileTypes:true})) {
    if(file.isDirectory())await walk(new URL(file.name+'/',dir),prefix+file.name+'/');
    else {
      const name=prefix+file.name,src=await readFile(new URL(file.name,dir)),dst=await readFile(resolve('D:/github/sillyTavern/public/901-recovery-playtest',name));
      assert.equal(createHash('sha256').update(src).digest('hex'),createHash('sha256').update(dst).digest('hex'),name);deployedFiles++;
    }
  }
}
await walk(new URL('public/901-recovery-playtest/',out));
const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
const model={source:settings.chat_completion_source,model:settings.chat_completion_source==='makersuite'?settings.google_model:settings.openai_model};
const install=JSON.parse(await readFile(new URL('live-install.json',out),'utf8'));assert.deepEqual(model,install.model);
const result={scope:'isolated medicine/rest live chat; scenario effects verified from operation snapshots',
  revision:after.revision,operations:Object.keys(after.operations).length,refreshFullRootEqual:true,sameFloorRegenerateFullRootEqual:true,
  sourceEffectsVerified:['药C跨楼确认及短休延迟','药B立即恢复5L','培元丹长休恢复A3','雪莲子恢复流风3','打坐15分钟按实际成功数恢复','长休意志+1与流风回满','药A独立长休恢复A3且保留L6'],
  meditation:{successes,minutes:15,before:13,after:afterMeditate.resources.流风.current},
  medicineA:{revision:aRoot.revision,operations:Object.keys(aRoot.operations).length,health:aFinal.health,stock:amount(aFinal,'药A'),
    proseShort:{revision:aProseRoot.revision,minutes:15,healthUnchanged:true,remainingInjuryExplicit:true,text:aProseText}},
  health:state.health,will:state.will,resources:state.resources,inventory:state.inventory,
  worldbookEntries:136,worldbookEntriesUnchanged:true,deployedFilesHashEqual:deployedFiles,modelRestored:true,model};
await writeFile(new URL('live-verification-result.json',out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
