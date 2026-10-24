// Read-only probe of the named isolated live chat; optional evidence copy lives in the workspace.
import {readFile,writeFile} from 'node:fs/promises';
import {mapView,measurePath,elevationAt} from '../combat/map.mjs';
const source='D:/github/sillyTavern/data/default-user/chats/901 叙事战斗测试/901 掩体高台门实测 - 2026-10-22.jsonl';
const text=await readFile(source,'utf8'),rows=text.trim().split('\n').map(line=>JSON.parse(line));
const floor=rows.findLast(row=>row.variables?.[row.swipe_id??0]?.stat_data?.['901_rules_poc']);
const root=floor.variables[floor.swipe_id??0].stat_data['901_rules_poc'];
const battle={...root.battle,actors:Object.fromEntries(Object.entries(root.battle.actors).map(([id,a])=>[id,{...a,state:root.actors[id].state}]))};
const ops=Object.values(root.operations).sort((a,b)=>a.summary.revision-b.summary.revision);
const own=root.actors.player.state;
const selected=ops.slice(-5).map(op=>{
  const r=op.summary.result,c=JSON.parse(op.signature);
  return {revision:op.summary.revision,actor:r.actorId,ability:r.abilityId,command:c,
    ...(r.terrain?{terrain:r.terrain}:{}),...(r.movement?{movement:r.movement,routeValid:measurePath(battle.map,r.movement.from,r.movement.to,r.movement.path.slice(1,-1)).valid}:{}),
    ownDamage:[...r.damage,...(r.opportunities??[]).flatMap(x=>x.damage)].filter(x=>x.targetId==='player'),
    ...(c.targetId==='player'&&r.attack?.defense?{ownDefense:r.attack.defense}:{}),
    ownStatus:r.after.participants.find(a=>a.id==='player')?.statuses};
});
const stage=process.argv[2];
if(stage) {
  if(!/^[a-z0-9-]+$/.test(stage))throw Error('Invalid evidence name');
  await writeFile(new URL(`../../../output/replay_tavern/narrative_combat_20261020_candidate/live-map-interaction-${stage}.jsonl`,import.meta.url),text);
}
console.log(JSON.stringify({messages:rows.length-1,revision:root.revision,round:battle.round,active:battle.activeId,pending:battle.pending??null,
  position:battle.actors.player.position,elevation:elevationAt(battle.map,battle.actors.player.position),health:own.health,energy:own.resources,actions:own.turn,
  map:mapView(battle),operations:selected,lastMessages:rows.slice(-2).map(r=>({user:r.is_user,text:r.mes,metadata:r.extra?.['901_narrative']}))},null,2));
