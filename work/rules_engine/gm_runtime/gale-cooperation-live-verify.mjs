// Verify actual saved acceptance evidence; this never invokes a model or writes a live save.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {resolveDefense,attackProfile} from '../combat/engine.mjs';
const base=new URL('../../../output/replay_tavern/narrative_combat_20261020_candidate/',import.meta.url);
async function saved(name) {
  const rows=(await readFile(new URL(name,base),'utf8')).trim().split('\n').map(JSON.parse);
  const floor=rows.findLast(r=>r.variables?.[r.swipe_id??0]?.stat_data?.['901_rules_poc']);
  return {rows,root:floor.variables[floor.swipe_id??0].stat_data['901_rules_poc']};
}
const gale=await saved('live-gale-final.jsonl'),galeRefresh=await saved('live-gale-refresh.jsonl');
assert.deepEqual(gale.root,galeRefresh.root);
const attack=Object.entries(gale.root.operations).find(([,o])=>o.summary.result.abilityId==='gale'&&o.summary.result.damage.length);
assert.ok(attack);assert.deepEqual([...new Set(attack[1].summary.result.damage.map(d=>d.targetId))],['huang','jiang']);
assert.equal(gale.root.actors.player.state.resources.风池.current,9);assert.equal(gale.root.actors.player.state.health.intact,21);
assert.equal(gale.root.actors.player.state.turn.swift,1);assert.equal(gale.root.battle.activeId,'player');
const prior=await saved('live-gale-attack-stage.jsonl');
assert.equal(prior.root.actors.player.state.resources.风池.current,10);
assert.equal(prior.root.actors.huang.state.health.intact,23);assert.equal(prior.root.actors.jiang.state.health.intact,35);
const priorBattle=structuredClone(prior.root.battle);
for(const [id,a]of Object.entries(priorBattle.actors))a.state=prior.root.actors[id].state;
const profile=attackProfile(priorBattle,'player',{abilityId:'gale'});
const huangGuard=resolveDefense(priorBattle,'huang','player',profile).parts.block;
assert.equal(huangGuard,0);
const result={galeSuperseded:{status:'SUPERSEDED: 用户最新纠正狂岚仅攻击敌人，此旧错误版友伤记录不能作为当前通过证据',revision:gale.root.revision,refreshRootEqual:true,attackOperation:attack[0],
  pendingRevision:prior.root.revision,pendingCostsAndDamageUnchanged:true,huangActualGuard:huangGuard,
  damage:attack[1].summary.result.damage.map(d=>({targetId:d.targetId,actualDamage:d.actualDamage,severity:d.severity})),
  player:gale.root.actors.player.state.health,flowPool:gale.root.actors.player.state.resources.风池,
  narrativeLimitation:'旧狂岚正文将黄泉无主动格挡写成了格挡，原文保留；新增逐目标防御事实在协同pending后实测。'}};
if(process.argv.includes('--cooperation')) {
  const pending=await saved('live-cooperation-before-refresh.jsonl'),restored=await saved('live-cooperation-after-refresh.jsonl');
  assert.deepEqual(pending.root,restored.root);
  const second=await saved('live-cooperation-second-pending.jsonl'),final=await saved('live-cooperation-final.jsonl'),refresh=await saved('live-cooperation-refresh.jsonl');
  assert.deepEqual(final.root,refresh.root);
  assert.equal(pending.root.battle.pending.command.actorId,'huang');assert.equal(second.root.battle.pending.command.actorId,'lotus');
  for(const p of [pending,second]) {
    assert.equal(p.root.battle.pending.awaiting,'player');
    const op=Object.values(p.root.operations).find(o=>o.summary.revision===p.root.revision);
    assert.equal(op.summary.result.attack,undefined);assert.deepEqual(op.summary.result.damage,[]);
  }
  const ops=Object.entries(final.root.operations).sort(([,a],[,b])=>a.summary.revision-b.summary.revision);
  const snapshots=ops.at(-1)[1].summary.result.after.participants;
  for(const p of snapshots) {
    const state=final.root.actors[p.id].state;
    assert.deepEqual(p.health,state.health);assert.deepEqual(p.energy,state.resources);assert.deepEqual(p.actions,state.turn);assert.deepEqual(p.statuses,state.statuses);
  }
  result.cooperation={revision:final.root.revision,pendingRefreshEqual:true,finalRefreshEqual:true,finalSnapshotMatchesMvu:true,
    player:final.root.actors.player.state.health,statuses:final.root.actors.player.state.statuses,
    operations:ops.map(([id,o])=>({id,revision:o.summary.revision,command:JSON.parse(o.signature),damage:o.summary.result.damage,responses:o.summary.result.responses})),
    firstPendingRevision:pending.root.revision,secondPendingRevision:second.root.revision};
}
if(process.argv.includes('--current')) {
  const current=await saved('live-gale-current-final.jsonl'),refresh=await saved('live-gale-current-refresh.jsonl');
  assert.deepEqual(current.root,refresh.root);
  const ops=Object.entries(current.root.operations).sort(([,a],[,b])=>a.summary.revision-b.summary.revision);
  const settled=ops.find(([,o])=>o.summary.result.abilityId==='gale'&&o.summary.result.responses?.length);
  assert.ok(settled);assert.deepEqual(settled[1].summary.result.responses.map(x=>x.targetId),['jiang']);
  assert.equal(current.root.actors.huang.state.health.intact,23);
  assert.equal(current.root.actors.player.state.health.intact,21);assert.equal(current.root.actors.player.state.resources.风池.current,9);
  assert.equal(ops.filter(([,o])=>JSON.parse(o.signature).actorId==='huang').length,0);
  assert.equal(current.root.actors.player.state.turn.move,1);assert.equal(current.root.actors.player.state.turn.swift,1);
  result.galeCurrent={status:'当前规则：仅合法敌人',revision:current.root.revision,refreshRootEqual:true,friendUnharmedAndNoReaction:true,
    attackOperation:settled[0],damage:settled[1].summary.result.damage,responses:settled[1].summary.result.responses,
    operations:ops.map(([id,o])=>({id,revision:o.summary.revision,command:JSON.parse(o.signature)}))};
}
if(process.argv.includes('--roar')) {
  const pending=await saved('live-roar-pending.jsonl'),final=await saved('live-roar-final.jsonl'),refresh=await saved('live-roar-refresh.jsonl');
  assert.deepEqual(final.root,refresh.root);assert.equal(pending.root.battle.pending.awaiting,'player');
  assert.equal(pending.root.actors.huang.state.health.intact,23);assert.equal(pending.root.actors.player.state.health.intact,21);
  assert.equal(pending.root.battle.actors.lotus.used.roar,undefined);
  const ops=Object.entries(final.root.operations).sort(([,a],[,b])=>a.summary.revision-b.summary.revision);
  const settled=ops.find(([,o])=>o.summary.result.abilityId==='roar'&&o.summary.result.saves.length);
  assert.ok(settled);assert.deepEqual(settled[1].summary.result.saves.map(x=>x.targetId),['huang','player']);
  assert.equal(final.root.battle.actors.lotus.used.roar,true);
  const snapshots=ops.at(-1)[1].summary.result.after.participants;
  for(const p of snapshots) {
    const s=final.root.actors[p.id].state;
    assert.deepEqual(p.health,s.health);assert.deepEqual(p.energy,s.resources);assert.deepEqual(p.actions,s.turn);assert.deepEqual(p.statuses,s.statuses);
  }
  result.roar={selection:'本场明确约定的咆哮能力演示，真实模型调用合法咆哮/目标；不是自由战术选择',revision:final.root.revision,refreshRootEqual:true,
    pendingRevision:pending.root.revision,pendingDamageUnchanged:true,finalSnapshotMatchesMvu:true,attackOperation:settled[0],
    saves:settled[1].summary.result.saves,damage:settled[1].summary.result.damage,player:final.root.actors.player.state.health,
    friend:final.root.actors.huang.state.health,operations:ops.map(([id,o])=>({id,revision:o.summary.revision,command:JSON.parse(o.signature)}))};
}
await writeFile(new URL('live-gale-cooperation-result.json',base),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
