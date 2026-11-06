import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {act,attackProfile,resolveDefense,panel} from './engine.mjs';
import {beginTurn,endTurn} from '../core.mjs';
import {inspectCommands} from './runtime.mjs';
import {resolveStep} from './transitions.mjs';
import {beginCommonTurn} from './common-actions.mjs';
import {publicScene,playerDeclarationContext} from './presentation.mjs';
const dice=()=>Array(1024).fill(1);
function battle(){const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;b.actors.player.team='party';b.actors.huang.team='enemy';b.actors.huang.sheathed=false;b.reactionWindows=false;b.playerDefenseDeclarations=false;return b;}
const run=(b,abilityId,extra={})=>act(b,{actorId:'player',abilityId,...extra},{playerAuthorized:true,drawDice:dice});
test('all-out melee uses one standard action and its real +2/-2 expires at next own turn',()=>{
 const b=battle(),base=attackProfile(b,'player',{targetId:'huang'}),def=resolveDefense(b,'player','huang');
 const out=run(b,'allOut',{targetId:'huang'});
 assert.equal(out.result.attack.rawDP,base.rawDP+2);assert.equal(out.battle.actors.player.state.turn.standard,0);
 assert.equal(resolveDefense(out.battle,'player','huang').total,Math.max(0,def.total-2));
 assert.deepEqual(b,battle());
 let next=run(out.battle,'end').battle;
 while(next.activeId!=='player')next=act(next,{actorId:next.activeId,abilityId:'end'},{drawDice:dice}).battle;
 assert.equal(resolveDefense(next,'player','huang').total,def.total);
});
test('fatigue prevents all-out without paying or changing the input state',()=>{
 const b=battle();b.actors.player.state.statuses.push({type:'疲乏',source:'actual',points:1});const before=structuredClone(b);
 assert.throws(()=>run(b,'allOut',{targetId:'huang'}),/疲乏|Fatigue/);assert.deepEqual(b,before);
});
test('drop prone consumes reflex, halves movement, modifies melee/ranged defense, stand consumes move',()=>{
 const b=battle(),def=resolveDefense(b,'player','huang'),speed=panel(b,'player').speed;
 let out=run(b,'dropProne');assert.equal(out.battle.actors.player.state.turn.swift,0);
 assert.equal(panel(out.battle,'player').speed,speed/2);
 assert.equal(resolveDefense(out.battle,'player','huang',{ranged:false}).total,Math.max(0,def.total-2));
 assert.equal(resolveDefense(out.battle,'player','huang',{ranged:true}).total,def.total+2);
 out=run(out.battle,'stand');assert.equal(out.battle.actors.player.state.turn.move,0);
 assert.equal(panel(out.battle,'player').speed,speed);
});
test('available common choices are present without granting a learned skill',()=>{
 const b=battle(),before=structuredClone(b.actors.player.state.learnedResources);
 const ids=inspectCommands(b).options.map(o=>o.command.abilityId);
 assert.ok(ids.includes('allOut'));assert.ok(ids.includes('dropProne'));assert.ok(ids.includes('bullRush'));
 assert.deepEqual(b.actors.player.state.learnedResources,before);
});
test('ordinary item retrieval uses actual access and never duplicates ownership',()=>{
 const b=battle();b.actors.player.state.possessions??={};b.actors.player.state.possessions.items=[{id:'cloth',name:'油布包',source:'isolated fixture',location:'carried',access:'backpack',held:false}];
 const out=run(b,'takeItem',{itemId:'cloth'});
 assert.equal(out.battle.actors.player.state.turn.standard,0);assert.equal(out.battle.actors.player.state.turn.move,0);
 assert.equal(out.battle.actors.player.state.possessions.items.length,1);assert.equal(out.battle.actors.player.state.possessions.items[0].held,true);
 assert.throws(()=>run(out.battle,'takeItem',{itemId:'cloth'}),/已经|持握/);
});

test('declaration choices identify actual carried objects by name and storage',()=>{
 const b=battle();b.actors.player.state.possessions={items:[
  {id:'cloth',name:'试验布条',source:'fixture',location:'carried',access:'accessible',small:true,held:false},
  {id:'pack',name:'试验油布包',source:'fixture',location:'carried',access:'backpack',held:false}]};
 const c=playerDeclarationContext(b,0);
 assert.deepEqual(c.items.filter(i=>i.ownerId==='player').map(i=>[i.id,i.name,i.access]),[['cloth','试验布条','accessible'],['pack','试验油布包','backpack']]);
});
test('incoming bull rush waits for the player choice and persists it across serialization',()=>{
 let b=battle();b.activeId='huang';b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.playerDefenseDeclarations=true;b.reactionWindows=true;
 let rolls=0;const out=resolveStep(b,{actorId:'huang',abilityId:'bullRush',targetId:'player',mode:'push'},{drawDice:()=>{rolls++;return dice();}});
 assert.ok(out.battle.pending);assert.equal(rolls,0);assert.deepEqual(out.battle.actors.player.position,[0,0]);
 b=JSON.parse(JSON.stringify(out.battle));assert.ok(inspectCommands(b).options.some(o=>o.command.grappleDefense==='agility'));
 assert.throws(()=>resolveStep(b,{actorId:'player',abilityId:'react',choice:'decline',defense:'normal'},{playerAuthorized:true,drawDice:dice}),/抵挡|避让|选择/);
 const done=resolveStep(b,{actorId:'player',abilityId:'react',choice:'decline',defense:'normal',grappleDefense:'agility'},{playerAuthorized:true,drawDice:dice});
 assert.equal(done.battle.pending,undefined);assert.equal(done.result.contest.defense,'agility');
 assert.equal(done.battle.actors.huang.state.turn.standard,0);
});
test('ordinary grapple enters the existing hold, suppression and escape system without damage',()=>{
 const b=battle();b.actors.player.parameters={freeHands:1,freeHandsSource:'isolated fixture'};
 b.actors.player.state.attributes.力量=11;b.actors.player.state.skills.肉搏={level:5,auto:1,subs:{}};
 let rolls=0;
 const out=act(b,{actorId:'player',abilityId:'grapple',targetId:'huang',attribute:'strength'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===3?1:8)});
 assert.equal(out.battle.actors.huang.state.grapple.holderId,'player');
 assert.equal(out.result.damage.length,0);assert.deepEqual(out.battle.actors.huang.state.health,b.actors.huang.state.health);
 assert.ok(inspectCommands({...out.battle,activeId:'huang'}).options.some(x=>x.command.abilityId==='escapeGrip')||out.battle.actors.huang.state.turn.phase!=='active');
 const next=out.battle;next.round++;next.actors.player.state=beginTurn(endTurn(next.actors.player.state).state).state;
 const pressed=act(next,{actorId:'player',abilityId:'pressGrip',targetId:'huang'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(8)});
 assert.equal(pressed.result.grapple.success,true);assert.equal(pressed.battle.actors.huang.state.grapple.pressed,true);
});
test('ordinary aiming pays a full round and a swift reload does not cancel it',()=>{
 let b=createOpeningEncounter({participants:['bright','huang'],positions:{bright:[0,0],huang:[10,0]}});b.activeId='bright';b.actors.bright.state=beginTurn(b.actors.bright.state).state;b.actors.huang.team='enemy';b.playerDefenseDeclarations=false;
 b=act(b,{actorId:'bright',abilityId:'aim',targetId:'huang'},{drawDice:dice}).battle;
 assert.equal(b.actors.bright.state.turn.standard,0);assert.equal(b.actors.bright.state.turn.move,0);
 b.actors.bright.loaded=false;b.actors.bright.ammunition=2;
 b=act(b,{actorId:'bright',abilityId:'reload'},{drawDice:dice}).battle;
 assert.equal(b.actors.bright.aim.targetId,'huang');assert.equal(b.actors.bright.state.turn.swift,0);
});
test('charge pays move plus standard, stops at nearest melee range and saves its temporary penalty',()=>{
 const b=battle();b.actors.huang.position=[6,0];beginCommonTurn(b,b.actors.player);
 const raw=attackProfile(b,'player',{targetId:'huang'}).rawDP,def=resolveDefense(b,'player','huang').total;
 const out=run(b,'charge',{targetId:'huang'}),bonus=Math.min(4,b.actors.player.state.attributes.力量);
 assert.deepEqual(out.battle.actors.player.position,[4.5,0]);assert.equal(out.result.movement.length,4.5);
 assert.equal(out.result.attack.rawDP,raw+bonus);assert.equal(out.battle.actors.player.state.turn.move,0);assert.equal(out.battle.actors.player.state.turn.standard,0);
 assert.equal(resolveDefense(out.battle,'player','huang').total,Math.max(0,def-bonus));
 const saved=JSON.parse(JSON.stringify(out.battle));beginCommonTurn(saved,saved.actors.player);assert.equal(resolveDefense(saved,'player','huang').total,def);
 const blocked=battle();blocked.actors.huang.position=[6,0];beginCommonTurn(blocked,blocked.actors.player);blocked.actors.player.state.combatManeuvers.startVisible=[];
 assert.throws(()=>run(blocked,'charge',{targetId:'huang'}),/回合开始/);
});
test('feint has one target, removes only basic defense and is consumed by the next melee attack',()=>{
 const b=battle();b.actors.player.state.attributes.智力=8;b.actors.player.state.skills.社交={level:5,subs:{唬骗:{level:2}},auto:1};
 let rolls=0;const out=act(b,{actorId:'player',abilityId:'feint',targetId:'huang'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===1?8:1)});
 assert.equal(out.result.contest.won,true);assert.equal(resolveDefense(out.battle,'huang','player').parts.base,0);
 assert.ok(resolveDefense(out.battle,'huang','player').parts.armor>0);
 out.battle.actors.player.state=beginTurn(endTurn(out.battle.actors.player.state).state).state;beginCommonTurn(out.battle,out.battle.actors.player);
 const hit=run(out.battle,'strike',{targetId:'huang'});assert.equal(hit.result.attack.defense.parts.base,0);
 assert.equal(hit.battle.actors.player.state.combatManeuvers.feints.huang,undefined);
});
test('trip is a contact contest, knocks down on success and never damages the creature',()=>{
 const b=battle();b.actors.player.state.attributes.力量=11;b.actors.player.state.skills.肉搏={level:5};
 let rolls=0;const out=act(b,{actorId:'player',abilityId:'trip',targetId:'huang'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===1?8:1)});
 assert.equal(out.result.contest.won,true);assert.equal(out.battle.actors.huang.state.combatManeuvers.prone,true);
 assert.deepEqual(out.battle.actors.huang.state.health,b.actors.huang.state.health);assert.equal(out.result.damage.length,0);
});
function armedTarget(){const b=battle();b.actors.player.state.attributes.力量=15;b.actors.player.state.skills.白刃={level:5};b.actors.player.state.attributes.敏捷=12;
 const t=b.actors.huang;t.state.possessions??={};t.state.possessions.items=[{id:'test-sword',name:'隔离测试剑',source:'explicit isolated fixture',location:'carried',held:true,oneHanded:true,grip:{hands:1,source:'fixture'},weapon:{type:'melee',skill:'白刃',damage:1,severity:'L',size:2,ap:0,magic:0,attackBonus:0,blockBonus:0},durability:{current:3,max:3,hardness:1}}];t.state.equippedWeaponId='test-sword';return b;}
test('sunder uses hit then opposed roll, subtracts item hardness and never injures the holder',()=>{
 const b=armedTarget();let rolls=0;
 const out=act(b,{actorId:'player',abilityId:'sunder',targetId:'huang',itemId:'test-sword'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===3?1:8)});
 assert.ok(out.result.attack.amount>0);assert.ok(out.result.equipmentDamage.structuralDamage>0);
 assert.equal(out.battle.actors.huang.state.possessions.items[0].destroyed,true);
 assert.deepEqual(out.battle.actors.huang.state.health,b.actors.huang.state.health);assert.equal(out.result.damage.length,0);
 assert.doesNotThrow(()=>panel(out.battle,'huang'));assert.equal(attackProfile(out.battle,'huang').weapon,0);
 const scene=publicScene({battle:out.battle,actors:out.battle.actors,operations:{}});
 assert.equal(scene.participants.find(a=>a.id==='huang').arms,'当前徒手，主手没有可用武器');
});
test('disarm keeps the actual item on the ground and prevents the old weapon from returning by fallback',()=>{
 const b=armedTarget();let rolls=0;
 const out=act(b,{actorId:'player',abilityId:'disarm',targetId:'huang',itemId:'test-sword'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===3?1:8)});
 const item=out.battle.actors.huang.state.possessions.items[0];assert.equal(item.location,'ground');assert.equal(item.held,false);assert.deepEqual(item.position,[1,0]);
 assert.equal(attackProfile(out.battle,'huang').weapon,0);assert.equal(item.destroyed,undefined);
 const scene=publicScene({battle:out.battle,actors:Object.fromEntries(Object.entries(out.battle.actors).map(([id,a])=>[id,{name:a.name,state:a.state}])),operations:{}});
 assert.equal(scene.participants.find(a=>a.id==='huang').arms,'当前徒手，主手没有可用武器');
 assert.deepEqual(item.durability,b.actors.huang.state.possessions.items[0].durability);
});
test('unavailable weapon flag alone does not invent its loss cause or inspect unrelated inventory',()=>{
 const b=armedTarget(),a=b.actors.huang;
 delete a.state.equippedWeaponId;a.state.combatManeuvers={weaponUnavailable:true};
 a.state.possessions.items[0].name='未公开的备用剑';
 const scene=publicScene({battle:b,actors:b.actors,operations:{}});
 const arms=scene.participants.find(x=>x.id==='huang').arms;
 assert.equal(arms,'当前徒手，主手没有可用武器');
 assert.doesNotMatch(arms,/损毁|脱手|落地|备用剑|太刀/);
});
test('a pending attack accepts explicit reflex prone without resolving or replacing the attack',()=>{
 let b=battle();b.activeId='huang';b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.reactionWindows=true;b.playerDefenseDeclarations=true;
 b=resolveStep(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice}).battle;
 const old=structuredClone(b.pending),out=resolveStep(b,{actorId:'player',abilityId:'dropProne'},{playerAuthorized:true,drawDice:dice});
 assert.deepEqual(out.battle.pending,old);assert.equal(out.battle.actors.player.state.combatManeuvers.prone,true);
 assert.equal(out.battle.actors.huang.state.turn.standard,1);assert.equal(out.battle.actors.player.state.turn.reactionLock,true);
});
test('resisted bull rush offers a paid optional counter without rerolling the original contest',()=>{
 let b=battle();b.actors.huang.state.attributes.力量=12;b.actors.huang.state.attributes.敏捷=1;b.actors.huang.state.skills.运动={level:5};b.reactionWindows=true;
 let rolls=0;const out=resolveStep(b,{actorId:'player',abilityId:'bullRush',targetId:'huang',mode:'push'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===1?1:8)});
 assert.equal(out.result.contest.won,false);assert.equal(out.battle.pending.kind,'counterRush');const n=rolls;
 const declined=resolveStep(JSON.parse(JSON.stringify(out.battle)),{actorId:'huang',abilityId:'counterRush',mode:'decline'},{drawDice:()=>{rolls++;return dice();}});
 assert.equal(rolls,n);assert.equal(declined.battle.pending,undefined);assert.equal(declined.battle.actors.player.state.turn.standard,0);
});

test('counter rush chooses a reflex action and preserves the first paid contest',()=>{
 let b=battle();b.actors.huang.state.attributes.力量=12;b.actors.huang.state.attributes.敏捷=1;b.actors.huang.state.skills.运动={level:5};b.reactionWindows=true;
 let rolls=0;const first=resolveStep(b,{actorId:'player',abilityId:'bullRush',targetId:'huang',mode:'push'},{playerAuthorized:true,drawDice:()=>Array(1024).fill(++rolls===1?1:8)});
 assert.deepEqual(inspectCommands(first.battle).options.map(o=>o.command.mode),['decline','push','knockdown']);
 const next=resolveStep(first.battle,{actorId:'huang',abilityId:'counterRush',mode:'knockdown'},{drawDice:dice});
 assert.equal(next.battle.pending.command.abilityId,'counterRush');assert.equal(rolls,2);
 const out=resolveStep(next.battle,{actorId:'player',abilityId:'react',choice:'decline',grappleDefense:'agility'},{playerAuthorized:true,drawDice:dice});
 assert.equal(out.battle.actors.huang.state.turn.reactionLock,true);assert.equal(out.battle.actors.huang.state.turn.standard,1);
 assert.equal(out.battle.actors.player.state.turn.standard,0);assert.equal(out.battle.counterRushAllowance,undefined);
});
test('aim does not create an incoming attack window and missing durability cannot damage an item',()=>{
 const b=armedTarget();delete b.actors.huang.state.possessions.items[0].durability;const before=structuredClone(b);
 assert.throws(()=>run(b,'sunder',{targetId:'huang',itemId:'test-sword'}),/耐久|硬度/);assert.deepEqual(b,before);
 assert.ok(!inspectCommands(b).options.some(o=>o.command.abilityId==='counterRush'));
});
test('prone appears in the actual pending choices and a second prone cannot spend again',()=>{
 let b=battle();b.activeId='huang';b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.reactionWindows=true;b.playerDefenseDeclarations=true;
 b=resolveStep(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice}).battle;
 assert.ok(inspectCommands(b).options.some(o=>o.command.abilityId==='dropProne'));
 const next=resolveStep(b,{actorId:'player',abilityId:'dropProne'},{playerAuthorized:true,drawDice:dice});
 assert.ok(!inspectCommands(next.battle).options.some(o=>o.command.abilityId==='dropProne'));
});
