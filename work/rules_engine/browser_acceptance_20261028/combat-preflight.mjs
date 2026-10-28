import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createOpeningFixture} from '../gm_runtime/opening.mjs';
import {createIntegratedSession} from '../gm_runtime/integrated.mjs';
import {createCombatRuntime} from '../combat/runtime.mjs';
const out=new URL('../../../output/replay_tavern/six_books_20261023_candidate/scene_test/resource-acquisition-20261028/',import.meta.url);
const path='D:/github/sillyTavern/data/default-user/chats/901 资源取得隔离验收 20261028/901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms.jsonl';
const raw=fs.readFileSync(new URL('combat-before.jsonl',out),'utf8');
const rows=raw.trim().split('\n').map(JSON.parse).slice(1),last=rows.at(-1);
const floors={0:structuredClone(last.variables[last.swipe_id??0])},chat=[{mes:'test',swipe_id:0}],f=createOpeningFixture();
const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(d,{message_id})=>{floors[message_id]=structuredClone(d);}};
const tavern={chat,chatId:'901 资源取得隔离验收 20261028 - 2026-10-28@08h03m47s108ms',saveChat:async()=>{}};
const script=fs.readFileSync(new URL('live-script.js',import.meta.url),'utf8');
const body=script.match(/const generateCombat=async request=>\{([\s\S]*?)\n  };/)[1];
const generateCombat=new Function('generateRaw','combatScene','return async request=>{'+body+'}') (async r=>{const c=JSON.parse(r.user_input);assert.equal(c.legalOptions.length,1);assert.equal(c.legalOptions[0].abilityId,'end');return '{"option":0}';},'隔离回合预演');
const session=createIntegratedSession({baseline:f.baseline,fixtureFactory:()=>createOpeningFixture(),mvu,tavern,
createChatMessages:async msgs=>{for(const m of msgs)chat.push({mes:m.message,swipe_id:0});},setChatMessages:async()=>{},
generateRaw:generateCombat,prepareBattle:b=>{b.actors.huang.abilities=['end'];return b;},drawDice:()=>Array.from({length:1024},(_,i)=>i%4===0?8:1)});
const source='隔离回合预演';
await session.registerEncounter({id:'resource-turn-20261028',scenario:source,participants:['player','huang'],positions:{player:[0,0],huang:[1,0]},teams:{player:'施法方',huang:'受术方'},objective:{kind:'exitRadius',actorIds:['player'],center:[0,0],radius:3},map:{bounds:[-6,-6,12,12],ground:'stone',gridSize:1,features:[]}});
const root=()=>floors[chat.length-1].stat_data['901_rules_poc'];
await session.registerRuleScene({source,mechanismPlans:{eldritchBlast:{DCombat:{...root().ruleScene.objects.eldritchBlast.plans.D,source,operations:['cast']}}}});
await session.enter('resource-turn-20261028');
console.log('inheritedCooldown',root().actors.player.state.resourceCooldowns); for(let i=0;i<4 && root().actors.player.state.resourceCooldowns?.['imperial-magic:D:魔能爆']>0;i++){const o=session.controller.options();await session.playerChoice({option:o.options.findIndex(x=>x.command.abilityId==='end'),expectedRevision:o.revision});} const before=structuredClone(root()),opts=session.controller.options();
const choice=opts.options.find(o=>o.command.objectId==='eldritchBlast');if(!choice)console.log(JSON.stringify({active:root().battle.activeId,unavailable:opts.unavailable,scene:root().ruleScene.objects.eldritchBlast},null,2));assert.ok(choice);assert.equal(choice.preview.actions.standard,1);assert.equal(choice.preview.energy.精神魔力,1);
await session.controller.submitCommand({command:choice.command,expectedRevision:before.revision,operationId:'preflight-cast'});
assert.equal(root().actors.player.state.resources.精神魔力.current,10);assert.equal(root().actors.player.state.turn.standard,0);
assert.ok(!session.controller.options().options.some(o=>o.command.objectId==='eldritchBlast'));
assert.deepEqual(root().actors.jiang,before.actors.jiang);assert.deepEqual(root().actors.bright,before.actors.bright);
const settled=structuredClone(root());
await assert.rejects(()=>session.controller.submitCommand({command:choice.command,expectedRevision:root().revision,operationId:'preflight-second'}),/冷却|动作/);assert.deepEqual(root(),settled);
const resumed=createCombatRuntime({mvu,expectedChatId:tavern.chatId,getAnchor:()=>({chatId:tavern.chatId,messageId:chat.length-1,swipeId:0})});
const duplicate=await resumed.dispatch({command:choice.command,expectedRevision:root().revision,operationId:'preflight-cast',playerAuthorized:true});assert.equal(duplicate.status,'already_applied');assert.deepEqual(root(),settled);
console.log(JSON.stringify({status:'pass',duplicate:duplicate.status,rejectedNewRequestUnchanged:true,kind:'offline preflight only, synthetic dice',beforeRevision:before.revision,afterRevision:root().revision,option:choice,health:root().actors.huang.state.health,active:root().battle.activeId},null,2));



