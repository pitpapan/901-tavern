import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const out=new URL('../../../output/replay_tavern/recovery_sequence_20261023_candidate/',import.meta.url);
const load=async name=>{
  const rows=(await readFile(new URL(name,out),'utf8')).trim().split('\n').map(JSON.parse);
  const floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
  if(!floor)throw Error(`No persisted MVU in ${name}`);
  return {rows,root:floor.variables[floor.swipe_id??0].stat_data['901_rules_poc']};
};
const initial=await load('sequence-initial.jsonl'),before=await load('sequence-before-regenerate.jsonl');
const regenerated=await load('sequence-regenerate.jsonl'),refreshed=await load('sequence-refresh.jsonl');
assert.deepEqual(regenerated.root,before.root,'same-floor regeneration must preserve the complete root');
assert.deepEqual(refreshed.root,before.root,'reload must preserve the complete root');
const users=before.rows.filter(r=>r.is_user===true);
assert.equal(users.length,1);assert.equal(users[0].mes,'服下培元丹，然后长休八小时');
assert.equal(initial.root.revision,0);assert.equal(Object.keys(initial.root.operations).length,0);
const root=refreshed.root,state=root.actors.player.state;
assert.deepEqual(Object.keys(root.actors),['player']);assert.equal(root.revision,1);assert.equal(Object.keys(root.operations).length,1);
const operation=Object.values(root.operations)[0],command=JSON.parse(operation.signature).command,result=operation.summary.result;
assert.equal(command.type,'sequence');assert.equal(command.steps.length,2);
assert.deepEqual(command.steps.map(s=>s.type),['medicine','rest']);
assert.equal(command.steps[0].medicine,'培元丹');assert.equal(command.steps[1].rest,'long');assert.equal(command.steps[1].minutes,480);
assert.equal(result.type,'sequence');assert.equal(result.steps.length,2);
assert.equal(result.steps[0].type,'medicine');assert.equal(result.steps[0].medicine,'培元丹');
assert.equal(result.steps[1].type,'rest');assert.equal(result.steps[1].rest,'long');assert.equal(result.steps[1].minutes,480);
assert.deepEqual([state.health.intact,state.health.B,state.health.L,state.health.A],[8,0,4,0]);
assert.equal(state.inventory.find(x=>x.name==='培元丹').quantity,2);
for(const name of ['雪莲子','药A','药B','药C','雷霆药剂','恶灵提示符'])assert.equal(state.inventory.find(x=>x.name===name).quantity,initial.root.actors.player.state.inventory.find(x=>x.name===name).quantity);
assert.deepEqual(state.resources.流风,{current:22,max:22});assert.deepEqual(state.will,{current:2,max:3});
assert.deepEqual(state.pendingRecoveryEffects,[]);assert.equal(state.recoveryClock.minutes,480);assert.equal(state.recoveryClock.longRests,1);assert.equal(state.xp,0);
const medicineChanges=result.steps[0].changes,restChanges=result.steps[1].changes;
assert.ok(medicineChanges.some(c=>c.source==='培元丹'&&c.consumed===1&&c.remaining===2));
assert.ok(restChanges.some(c=>c.source==='培元丹'&&c.severity==='A'&&c.healed===3));
assert.ok(restChanges.some(c=>c.source==='培元丹'&&c.severity==='L'&&c.healed===2));
const source=JSON.parse(await readFile(new URL('../flow_guidance_20261018_candidate/import/901_帝都主持.card.json',out),'utf8'));
const card=JSON.parse(await readFile(new URL('import/901_药品休息隔离实测.card.json',out),'utf8'));
assert.equal(card.data.character_book.entries.length,136);assert.deepEqual(card.data.character_book.entries,source.data.character_book.entries);
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
const prose=before.rows.findLast(r=>r.is_user===false)?.mes;
const report={scope:'one actual compound declaration; no other medicine chain repeated',declaration:users[0].mes,
  revision:1,operations:1,orderedChildren:command.steps,health:state.health,peiyuanStock:2,flow:state.resources.流风,will:state.will,
  pendingEmpty:true,elapsedMinutes:480,regenerateFullRootEqual:true,refreshFullRootEqual:true,worldbookEntriesUnchanged:136,
  deployedFilesHashEqual:deployedFiles,modelUnchanged:true,model,prose};
await writeFile(new URL('sequence-verification-result.json',out),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
