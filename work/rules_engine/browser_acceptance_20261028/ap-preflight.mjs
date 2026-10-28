import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=new URL('../../../output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028/',import.meta.url);
const {createOpeningFixture}=await import(new URL('runtime/work/rules_engine/gm_runtime/opening.mjs',out));
const {createIntegratedSession}=await import(new URL('runtime/work/rules_engine/gm_runtime/integrated.mjs',out));
const rows=fs.readFileSync(new URL('retention-final.jsonl',out),'utf8').trim().split('\n').map(JSON.parse).slice(1);
const last=rows.at(-1),floors={0:structuredClone(last.variables[last.swipe_id])},chat=[{mes:'test',swipe_id:0}];
const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(d,{message_id})=>{floors[message_id]=structuredClone(d);}};
const tavern={chat,chatId:'901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms',saveChat:async()=>{}};
const session=createIntegratedSession({baseline:createOpeningFixture().baseline,fixtureFactory:()=>createOpeningFixture(),mvu,tavern,
  createChatMessages:async messages=>{for(const m of messages)chat.push({mes:m.message,swipe_id:0});},setChatMessages:async()=>{},
  generateRaw:async request=>{const d=JSON.parse(request.user_input);return JSON.stringify({option:d.legalOptions.findIndex(o=>o.abilityId==='end')});},
  prepareBattle:b=>{b.actors.huang.abilities=['end'];return b;},drawDice:()=>Array.from({length:1024},(_,i)=>i%4===0?8:1)});
const root=()=>floors[chat.length-1].stat_data['901_rules_poc'];
await session.prepare();
await session.enter('resource-turn-20261028');
const before=structuredClone(root()),o=session.controller.options();
assert.equal(before.battle.activeId,'player');assert.equal(before.actors.player.state.resourceCooldowns['imperial-magic:D:魔能爆']??0,0);
const choice=o.options.find(x=>x.command.abilityId==='fullDefense');assert.ok(choice);
await session.controller.submitCommand({command:choice.command,expectedRevision:o.revision,operationId:'offline-full-defense'});
const defended=structuredClone(root());
assert.equal(defended.actors.player.state.turn.standard,0);
assert.deepEqual(defended.actors.player.state.resources,before.actors.player.state.resources);
assert.deepEqual(defended.actors.player.state.resourceCooldowns,before.actors.player.state.resourceCooldowns);
let reason;
await assert.rejects(()=>session.controller.submitCommand({operationId:'offline-no-standard',expectedRevision:defended.revision,
  command:{actorId:'player',abilityId:'mechanism',objectId:'eldritchBlast',operation:'cast',part:'DCombat'}}),error=>{reason=error.message;return reason==='Standard action spent';});
assert.deepEqual(root(),defended);
console.log(JSON.stringify({status:'pass',kind:'offline only; synthetic initiative and NPC end selection',beforeRevision:before.revision,defendedRevision:defended.revision,standard:defended.actors.player.state.turn.standard,cooldowns:defended.actors.player.state.resourceCooldowns,mental:defended.actors.player.state.resources.精神魔力.current,rejection:reason,failedRequestRootUnchanged:true},null,2));
