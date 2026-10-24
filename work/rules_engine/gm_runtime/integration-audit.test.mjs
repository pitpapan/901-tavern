import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter,createOpeningEnemy} from '../combat/opening.mjs';
import {reduceRuleAction} from './rule-actions.mjs';
import {settleCheck} from '../mvu_poc/adapter.mjs';
import {attachClaw,releaseGrapple} from '../combat/grapple.mjs';
import {resolveStep} from '../combat/transitions.mjs';
import {beginTurn} from '../core.mjs';
import {act,panel} from '../combat/engine.mjs';
import {clearLine} from '../combat/map.mjs';
import {runSceneMechanism,sceneBarriers} from './scene-rules.mjs';
const dice=()=>Array(512).fill(8);
const roster=createOpeningRoster();
const options={drawDice:dice,actorTemplates:roster};

test('B-only ordinary check commits failed pre-action coma, does not execute original check or reroll',async()=>{
 const a=structuredClone(roster.player);a.state.health.B+=a.state.health.intact;a.state.health.intact=0;
 let data={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'b',revision:0,operations:{},actors:{player:a}}}};
 const p={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async n=>{data=n;}},getAnchor:()=>({chatId:'b',messageId:0,swipeId:0}),expectedChatId:'b',operationId:'b/check',expectedRevision:0,actorId:'player',checkInput:{attribute:'感知',skill:'洞察',dc:2,preActionDC:100,dice:dice()}};
 const first=await settleCheck(p);assert.equal(first.prevented,true);assert.equal(data.stat_data['901_rules_poc'].actors.player.state.health.coma,true);
 assert.equal((await settleCheck(p)).status,'already_applied');assert.equal(data.stat_data['901_rules_poc'].revision,1);
});
test('field flow debits once, changes later check pool, and expires through time action',()=>{
 let root={actors:structuredClone(roster)};const before=root.actors.player.state.resources.流风.current;
 root=reduceRuleAction(root,{kind:'rule',action:'ability',actorId:'player',abilityId:'flow',tier:2},options);
 assert.equal(root.actors.player.state.resources.流风.current,before-2);
 const r={kind:'rule',action:'check',actorId:'player',attribute:'敏捷',skill:'运动',dc:1};
 const active=reduceRuleAction(root,r,options).result;
 root=reduceRuleAction(root,{kind:'rule',action:'time',actorId:'player',minutes:1,sourceQuote:'等一分钟'},options);
 assert.equal(active.dp-reduceRuleAction(root,r,options).result.dp,4);
});
test('reward event does not restore will and remains idempotent across distinct operations',()=>{
 const root={actors:structuredClone(roster),ruleScene:{events:{award:{type:'reward',actorIds:['player'],xp:3,source:'已确认测试奖励'}}}};
 root.actors.player.state.will.current=0;const before=root.actors.player.state.xp;
 const r={kind:'rule',action:'reward',actorId:'player',eventId:'award'};const out=reduceRuleAction(root,r,options);
 assert.equal(out.actors.player.state.xp,before+3);assert.equal(out.actors.player.state.will.current,0);assert.throws(()=>reduceRuleAction(out,r,options),/已结算/);
});
test('opposed selector supports actual will plus presence without a fabricated skill',()=>{
 const out=reduceRuleAction({actors:structuredClone(roster)},{kind:'rule',action:'opposed',active:{actorId:'player',attributes:['意志','风度']},passive:{actorId:'huang',attributes:['意志','风度']}},options);
 assert.ok(Number.isFinite(out.result.active.total));assert.ok(Number.isFinite(out.result.passive.total));
});
function encounter(){const b=createOpeningEncounter({id:'chuul-test',scenario:'规则验证',participants:['player','huang'],enemies:[{id:'chuul',type:'chuul'}],positions:{player:[0,0],huang:[0,2],chuul:[1,0]},map:{bounds:[-5,-5,20,20],features:[]}});b.activeId='chuul';b.actors.chuul.state=beginTurn(b.actors.chuul.state).state;return b;}
test('combat panels apply freezing speed/defense, deafness initiative and pain unconsciousness',()=>{
 const b=encounter();b.playerDefenseDeclarations=false;const before=panel(b,'player','chuul');
 b.actors.player.state.statuses=[{type:'冻结',points:1,source:'寒气'}];
 const cold=panel(b,'player','chuul');assert.equal(cold.speed,before.speed-1);assert.equal(cold.defense.total,before.defense.total-1);
 b.actors.player.state.statuses=[{type:'耳鸣',points:100,source:'音波'}];
 assert.equal(panel(b,'player','chuul').initiative,Math.floor(before.initiative/2));
 b.actors.player.state.statuses=[{type:'剧痛',points:100,source:'创伤'}];
 const pain=panel(b,'player','chuul');assert.equal(pain.speed,0);assert.equal(pain.defense.parts.base,0);assert.equal(pain.defense.parts.dodge,0);
});
test('Chuul declaration awaits player grapple defense before actual dice, then uses chosen response',()=>{
 let b=encounter(),draws=0;const draw=()=>{draws++;return dice();};
 const pending=resolveStep(b,{actorId:'chuul',abilityId:'strike',targetId:'player'},{drawDice:draw});
 assert.equal(pending.battle.pending.awaiting,'player');assert.equal(draws,0);
 const out=resolveStep(pending.battle,{actorId:'player',abilityId:'react',defense:'normal',choice:'decline',grappleDefense:'agility'},{drawDice:draw,playerAuthorized:true});
 assert.ok(draws>0);assert.equal(out.result.grapples[0].passive.skill.main,out.battle.actors.player.state.skills.运动.level);assert.equal(out.result.grapples[0].passive.dp,6);
});
test('two claws on one target release only the declared claw and escape clears the rest',()=>{
 let b=encounter();b.playerDefenseDeclarations=false;const h=b.actors.chuul,t=b.actors.player;
 attachClaw(b,h,t,{drawDice:dice,defense:'strength',claw:0});attachClaw(b,h,t,{drawDice:dice,defense:'strength',claw:1});
 assert.deepEqual(t.state.grapple.claws,[0,1]);b=act(b,{actorId:'chuul',abilityId:'releaseGrip',claw:0}).battle;
 assert.deepEqual(b.actors.chuul.claws,[null,'player']);assert.deepEqual(b.actors.player.state.grapple.claws,[1]);
 releaseGrapple(b,b.actors.player);assert.deepEqual(b.actors.chuul.claws,[null,null]);assert.equal(b.actors.player.state.grapple,undefined);
});
test('physical and spatial arrays remain independent and only physical blocks walking',()=>{
 const a=structuredClone(roster.player);const part={installed:true,circuitIntact:true,nodeIntact:true,powerReady:true,operators:['player'],cuttableBy:['player'],active:false};
 const root={actors:{player:a},ruleScene:{objects:{array:{type:'arrays',source:'测试现场',actorIds:['player'],boundary:[0,0,5,5],arrays:{physical:structuredClone(part),spatial:structuredClone(part)}}}}};
 runSceneMechanism(root,{actorId:'player',objectId:'array',operation:'activate',part:'physical'});
 const map={features:[],ruleBarriers:sceneBarriers(root.ruleScene)};assert.equal(clearLine(map,[2,2],[8,2]),false);assert.equal(clearLine(map,[1,1],[2,2]),true);
 runSceneMechanism(root,{actorId:'player',objectId:'array',operation:'activate',part:'spatial'});runSceneMechanism(root,{actorId:'player',objectId:'array',operation:'cut',part:'physical'});
 map.ruleBarriers=sceneBarriers(root.ruleScene);assert.equal(clearLine(map,[2,2],[8,2]),true);assert.equal(root.ruleScene.objects.array.arrays.spatial.active,true);
});

test('extended period advances all saved actors and removes an expired Chuul status',()=>{
 const root={actors:structuredClone(roster)};root.actors.huang.state.statuses.push({type:'麻痹',source:'Chuul毒',points:2,remainingMinutes:1});
 root.actors.huang.state.timedEffects={spiritWard:{remainingMinutes:1}};
 const out=reduceRuleAction(root,{kind:'rule',action:'extended',actorId:'player',taskId:'clock',attribute:'感知',skill:'洞察',target:50,periodMinutes:5,maxPeriods:3},options);
 assert.equal(out.actors.huang.state.statuses.length,0);assert.equal(out.actors.huang.state.timedEffects.spiritWard,undefined);
});
test('template reflex save applies paralysis and dizziness without double-counting skills',()=>{
 const root={actors:structuredClone(roster)},r={kind:'rule',action:'save',actorId:'player',type:'reflex',dc:2};
 const normal=reduceRuleAction(root,r,options).result.dp;
 root.actors.player.state.statuses.push({type:'麻痹',source:'a',points:1},{type:'晕眩',source:'b',points:2});
 const out=reduceRuleAction(root,r,options);assert.equal(normal-out.result.dp,3);
});
