import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {act,resolveDefense} from './engine.mjs';
import {inspectCommands} from './runtime.mjs';
import {saveProfile} from './mechanics.mjs';
import {beginTurn,endTurn,spendAction,effectiveAttribute} from '../core.mjs';
const dice=()=>Array(1000).fill(8);
function battle(){const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;b.actors.player.team='party';b.actors.huang.team='enemy';b.playerDefenseDeclarations=false;b.reactionWindows=false;return b;}
test('a universal action runs from a trusted non-spell definition without learning, mana, or a dedicated combat case',()=>{
 const b=battle(),before=structuredClone(b.actors.player.state),base=resolveDefense(b,'player','huang');
 assert.equal(b.actors.player.abilities.includes('fullDefense'),false);
 assert.ok(inspectCommands(b).options.some(o=>o.command.abilityId==='fullDefense'));
 const out=act(b,{actorId:'player',abilityId:'fullDefense'},{playerAuthorized:true,drawDice:dice}).battle;
 const a=out.actors.player,d=resolveDefense(out,'player','huang');
 assert.equal(d.parts.dodge,Math.max(base.parts.dodge,base.parts.base));assert.equal(d.total-base.total,Math.max(0,base.parts.base-base.parts.dodge));assert.equal(a.state.turn.standard,0);assert.equal(a.state.turn.move,1);
 assert.deepEqual(a.state.learnedResources,before.learnedResources);assert.deepEqual(a.state.resources,before.resources);
 assert.deepEqual(b.actors.player.state,before);
});
test('live declarative effects follow current facts and expire on successful configured actions, not on rounds or failed requests',()=>{
 let b=act(battle(),{actorId:'player',abilityId:'fullDefense'},{playerAuthorized:true,drawDice:dice}).battle;
 b=JSON.parse(JSON.stringify(b));const a=b.actors.player;
 a.state=endTurn(a.state).state;a.state=beginTurn(a.state).state;
 assert.ok(a.state.activeResourceEffects.some(e=>e.sourceId==='basic:full-defense'));
 const before=resolveDefense(b,'player','huang');a.state.attributes.敏捷+=1;a.state.attributes.感知+=1;
 const after=resolveDefense(b,'player','huang');assert.equal(after.parts.dodge-before.parts.dodge,1);
 a.state=spendAction(a.state,'move').state;assert.ok(a.state.activeResourceEffects.some(e=>e.sourceId==='basic:full-defense'));
 a.state.turn.standard=0;const failed=spendAction(a.state,'standard');assert.equal(failed.result.allowed,false);assert.ok(failed.state.activeResourceEffects.some(e=>e.sourceId==='basic:full-defense'));
 a.state.turn.standard=1;a.state=spendAction(a.state,'standard').state;assert.equal(a.state.activeResourceEffects.some(e=>e.sourceId==='basic:full-defense'),false);
});
test('the same declared stance modifies only area reflex saves and loses dodge when frozen or flat-footed',()=>{
 const b=battle(),original=saveProfile(b.actors.player,'reflex',{areaAttack:true});
 const out=act(b,{actorId:'player',abilityId:'fullDefense'},{playerAuthorized:true,drawDice:dice}).battle,a=out.actors.player;
 const defense=resolveDefense(out,'player','huang');
 assert.equal(saveProfile(a,'reflex',{areaAttack:true}).dp-original.dp,defense.parts.base);
 assert.equal(saveProfile(a,'reflex').dp,saveProfile(b.actors.player,'reflex').dp);
 assert.equal(resolveDefense(out,'player','huang',{flatFootedLevel:1}).parts.dodge,0);
 a.state.statuses.push({type:'冻结',points:100,source:'隔离测试'});
 assert.equal(resolveDefense(out,'player','huang').parts.dodge,0);
 assert.equal(saveProfile(a,'reflex',{areaAttack:true}).dp,saveProfile(a,'reflex').dp);
});
test('declared speed suppression applies to a visible firearm and does not grant general immunity to speed',()=>{
 const b=battle(),out=act(b,{actorId:'player',abilityId:'fullDefense'},{playerAuthorized:true,drawDice:dice}).battle;
 const plain=resolveDefense(out,'player','huang',{speed:0});
 const firearm=resolveDefense(out,'player','huang',{speed:100,firearm:true});
 assert.equal(firearm.total,plain.total);
 assert.ok(resolveDefense(out,'player','huang',{speed:100,firearm:false}).total<plain.total);
 out.actors.huang.hidden=true;
 // No source actor means there is no established visible gunner.
 assert.ok(resolveDefense(out,'player',undefined,{speed:100,firearm:true}).total<plain.total);
});

function withPrice(){const b=battle();b.actors.player.state.activeResourceEffects=[{id:'test-price/player',sourceId:'test-price',scene:true,effects:[],actionPrice:{family:'physical',discount:2,baseByAction:{weaponAttack:5,move:4},minimumAP:1,perRound:1,quotaKey:'haste'}}];return b;}
test('a declared action discount pays a movement action for a held weapon attack once in the real round',()=>{
 let b=withPrice();
 const c={actorId:'player',abilityId:'strike',targetId:'huang',actionDiscount:'test-price/player'};
 assert.ok(inspectCommands(b).options.some(o=>o.command.actionDiscount===c.actionDiscount&&o.command.abilityId==='strike'));
 const out=act(b,c,{playerAuthorized:true,drawDice:()=>Array(1000).fill(1)});b=out.battle;
 assert.equal(b.actors.player.state.turn.standard,1);assert.equal(b.actors.player.state.turn.move,0);assert.equal(b.actors.player.state.turn.swift,1);
 assert.equal(out.result.actionPrice.ap,3);
 b=JSON.parse(JSON.stringify(b));assert.throws(()=>act(b,c,{playerAuthorized:true,drawDice:dice}),/额度/);
 assert.equal(b.actors.player.state.resourceActionUsage.haste.used,1);
});
test('movement discount is optional, physical only, and cannot bypass movement ineligibility',()=>{
 let b=withPrice();const c={actorId:'player',abilityId:'move',to:[0,1],actionDiscount:'test-price/player'};
 let out=act(b,c,{playerAuthorized:true,drawDice:dice});
 assert.equal(out.battle.actors.player.state.turn.swift,0);assert.equal(out.battle.actors.player.state.turn.move,1);
 out=act(b,{actorId:'player',abilityId:'move',to:[0,1]},{playerAuthorized:true,drawDice:dice});
 assert.equal(out.battle.actors.player.state.turn.swift,1);assert.equal(out.battle.actors.player.state.turn.move,0);
 assert.equal(out.battle.actors.player.state.resourceActionUsage,undefined);
 b.actors.player.state.statuses.push({type:'冻结',source:'actual',points:100});const before=structuredClone(b);
 assert.throws(()=>act(b,c,{playerAuthorized:true,drawDice:dice}),/定身|状态|动作/);assert.deepEqual(b,before);
 assert.throws(()=>act(withPrice(),{actorId:'player',abilityId:'fullDefense',actionDiscount:'test-price/player'},{playerAuthorized:true,drawDice:dice}),/选项|减费/);
});

test('discount selection survives a pending defense and is charged once when the saved attack resumes',async()=>{
 const {resolveStep}=await import('./transitions.mjs');
 let b=withPrice();b.activeId='huang';b.playerDefenseDeclarations=true;b.reactionWindows=true;
 b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.actors.huang.sheathed=false;
 b.actors.huang.state.activeResourceEffects=structuredClone(b.actors.player.state.activeResourceEffects);
 const c={actorId:'huang',abilityId:'strike',targetId:'player',actionDiscount:'test-price/player'};
 let out=resolveStep(b,c,{playerAuthorized:true,drawDice:dice});b=JSON.parse(JSON.stringify(out.battle));
 assert.ok(b.pending);
 out=resolveStep(b,{actorId:'player',abilityId:'react',choice:'decline',defense:'normal'},{playerAuthorized:true,drawDice:()=>Array(1000).fill(1)});
 assert.equal(out.battle.actors.huang.state.resourceActionUsage.haste.used,1);
 assert.equal(out.battle.actors.huang.state.turn.standard,1);assert.equal(out.battle.actors.huang.state.turn.move,0);
});

test('legacy initiative defense is retired by its acquired clause, not by a matching category or character name',async()=>{
 const {compatibleContribution}=await import('./mechanics.mjs');
 const b=battle(),a=b.actors.huang,id='huang.improved_initiative';
 delete (a.state.learnedResources??={})[id];
 let out=compatibleContribution(a,'initiativeDefense');assert.equal(out.value,2);assert.equal(out.legacy.length,1); // actual opening card has +2; acquired RE feat replaces it with +5
 a.state.learnedResources[id]={learned:true,source:'actual acquired feat'};
 out=compatibleContribution(a,'initiativeDefense');assert.equal(out.value,5);assert.equal(out.legacy.length,0);assert.equal(out.replacedSources.length,1);
 a.name='另一个实际持有者';a.kind='custom';
 assert.equal(compatibleContribution(a,'initiativeDefense').value,5);
 delete a.state.learnedResources[id];assert.equal(compatibleContribution(a,'initiativeDefense').value,0);
 assert.equal(a.state.learnedResources['later:弃风'],undefined);
});
test('speed ignoring uses one shared legacy contribution for defense and saves while other real sources retain the adopted maximum',async()=>{
 const {compatibleContribution}=await import('./mechanics.mjs');
 const b=battle(),a=b.actors.player;
 assert.equal(compatibleContribution(a,'ignoreSpeed').value,5);
 a.buffs.bulletTime=true;assert.equal(compatibleContribution(a,'ignoreSpeed').value,8);
 a.state.activeResourceEffects=[{id:'other/actual',sourceId:'other',effects:[{stat:'ignoreSpeed',value:9,group:'divination',when:{test:'eq',left:{context:'incomingSpeed'},right:10}}]}];
 assert.equal(compatibleContribution(a,'ignoreSpeed',{incomingSpeed:10}).value,9);
 assert.equal(compatibleContribution(a,'ignoreSpeed').value,8);
 const normal=saveProfile(a,'reflex',{speed:0}),fast=saveProfile(a,'reflex',{speed:10});assert.equal(normal.dp-fast.dp,1);
 const d0=resolveDefense(b,'player','huang',{speed:0}),d10=resolveDefense(b,'player','huang',{speed:10});assert.equal(d0.total-d10.total,1);
});
