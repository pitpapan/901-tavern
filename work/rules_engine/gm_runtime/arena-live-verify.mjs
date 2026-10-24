import {readFile,writeFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {ARENA_OPPONENTS} from './arena.mjs';
const out=new URL('../../../output/replay_tavern/arena_playtest_20261023_candidate/',import.meta.url);
const rootFrom=async file=>{const rows=(await readFile(file,'utf8')).trim().split('\n').map(JSON.parse),floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);return floor.variables[floor.swipe_id??0].stat_data['901_rules_poc'];};
const source=JSON.parse(await readFile(new URL('../flow_guidance_20261018_candidate/import/901_帝都主持.card.json',out),'utf8'));
const selected=process.argv[2]?[process.argv[2]]:Object.keys(ARENA_OPPONENTS),results={};
for(const id of selected) {
  const opponent=ARENA_OPPONENTS[id];if(!opponent)throw Error('unknown opponent');
  const before=await rootFrom(new URL(`${id}-before-refresh.jsonl`,out)),saved=await rootFrom(new URL(`${id}-refresh.jsonl`,out));
  assert.deepEqual(saved,before,'refresh must preserve complete root');
  assert.equal(saved.battle.mode,'story');assert.equal(saved.battle.status,'finished');assert.equal(saved.battle.pending,undefined);
  assert.equal(saved.battle.resolution.taskComplete,false);assert.equal(saved.battle.resolution.xpAwarded,0);
  assert.equal(saved.actors.player.state.xp,0);assert.equal(saved.actors.player.state.derived.hpMax,12);
  assert.deepEqual(Object.keys(saved.actors),['player',id]);
  const final=Object.values(saved.operations).map(o=>o.summary).filter(o=>o.result).sort((a,b)=>a.revision-b.revision).at(-1).result.after.participants;
  for(const actor of final) {
    assert.deepEqual(actor.health,saved.actors[actor.id].state.health);
    assert.deepEqual(actor.energy,saved.actors[actor.id].state.resources);
    assert.deepEqual(actor.position,saved.battle.actors[actor.id].position);
  }
  const card=JSON.parse(await readFile(new URL(`import/901_擂台隔离实测_${opponent.name}.card.json`,out),'utf8'));
  assert.deepEqual(card.data.character_book.entries,source.data.character_book.entries);
  if(id==='radwick') {
    assert.deepEqual([saved.actors.player.state.health.intact,saved.actors.player.state.health.B],[11,1]);
    assert.equal(saved.actors.player.state.resources.流风.current,20);
    const inventory=saved.actors.player.state.inventory;
    assert.equal(inventory.find(x=>x.name==='药B').quantity,3,'unsupported medicine must not consume inventory');
    const cancellationBefore=await rootFrom(new URL('radwick-cancellation-before-refresh.jsonl',out));
    const cancellationRefresh=await rootFrom(new URL('radwick-cancellation-refresh.jsonl',out));
    assert.deepEqual(cancellationBefore,saved);assert.deepEqual(cancellationRefresh,saved);
    const finalRows=(await readFile(new URL('radwick-cancellation-refresh.jsonl',out),'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(finalRows.at(-1).extra?.['901_replay_gate']?.status,'NO_CHECK');
  } else {
    assert.equal(saved.revision,12);assert.equal(Object.keys(saved.operations).length,12);
    assert.deepEqual([saved.actors.player.state.health.intact,saved.actors.player.state.health.B],[9,3]);
    assert.equal(saved.actors.player.state.resources.流风.current,20);
    assert.deepEqual([saved.actors.mireya.state.health.intact,saved.actors.mireya.state.health.B],[3,9]);
    assert.equal(saved.battle.actors.mireya.ammunition,17);assert.equal(saved.battle.actors.mireya.loaded,false);
    assert.deepEqual(saved.battle.actors.player.position,[11,0]);assert.deepEqual(saved.battle.actors.mireya.position,[29,0]);
    assert.equal(saved.actors.mireya.combatCarry.ammunition,17);assert.equal(saved.actors.mireya.combatCarry.loaded,false);
    assert.equal(saved.actors.mireya.combatCarry.weaponMode,'bow');
    const commands=Object.values(saved.operations).map(o=>JSON.parse(o.signature));
    assert.ok(commands.some(c=>c.actorId==='mireya'&&c.abilityId==='reload'));
    assert.ok(commands.some(c=>c.actorId==='mireya'&&c.abilityId==='strike'));
    assert.ok(commands.some(c=>c.actorId==='player'&&c.abilityId==='opportunityReact'&&c.choice==='strike'));
  }
  results[id]={revision:saved.revision,operations:Object.keys(saved.operations).length,refreshRootDeepEqual:true,finalSnapshotMatchesMVU:true,
    mode:saved.battle.mode,resolution:saved.battle.resolution,player:{health:saved.actors.player.state.health,resources:saved.actors.player.state.resources,
      will:saved.actors.player.state.will,xp:0,position:saved.battle.actors.player.position,inventory:saved.actors.player.state.inventory},
    opponent:{health:saved.actors[id].state.health,position:saved.battle.actors[id].position,ammunition:saved.battle.actors[id].ammunition,
      loaded:saved.battle.actors[id].loaded,weaponMode:saved.battle.actors[id].weaponMode},worldbookEntries:136,worldbookEntriesUnchanged:true};
}
let deployedFiles=0;
async function walk(dir,prefix='') {
  for(const file of await readdir(dir,{withFileTypes:true})) {
    if(file.isDirectory())await walk(new URL(file.name+'/',dir),prefix+file.name+'/');
    else {
      const name=prefix+file.name,src=await readFile(new URL(file.name,dir)),dst=await readFile(resolve('D:/github/sillyTavern/public/901-arena-playtest',name));
      assert.equal(createHash('sha256').update(src).digest('hex'),createHash('sha256').update(dst).digest('hex'),name);deployedFiles++;
    }
  }
}
await walk(new URL('public/901-arena-playtest/',out));
const settings=JSON.parse(await readFile('D:/github/sillyTavern/data/default-user/settings.json','utf8')).oai_settings;
const model={source:settings.chat_completion_source,model:settings.chat_completion_source==='makersuite'?settings.google_model:settings.openai_model};
const installed=JSON.parse(await readFile(new URL('live-install.json',out),'utf8'));assert.deepEqual(model,installed.model);
const result={scope:'two real isolated matches only; prose findings reported separately',results,deployedFilesHashEqual:deployedFiles,modelUnchanged:true,model};
await writeFile(new URL(selected.length===2?'live-verification-result.json':`${selected[0]}-verification-result.json`,out),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
