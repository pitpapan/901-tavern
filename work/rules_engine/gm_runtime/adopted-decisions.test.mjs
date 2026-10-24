import test from 'node:test';import assert from 'node:assert/strict';
import {createCharacter,beginTurn,check,applyStatus,counteractTemperature,statusLevel,shiftGeneticLock,lifeStatus} from '../core.mjs';
import {limbMovement,statusEvent} from '../status-rules.mjs';
import {createOpeningRoster,createOpeningEncounter} from '../combat/opening.mjs';
import {act,attackProfile,resolveDefense,damageEvent} from '../combat/engine.mjs';
import {resolveStep} from '../combat/transitions.mjs';
import {inspectCommands} from '../combat/runtime.mjs';
import {grappleMembers,weightedGrappleTarget} from '../combat/grapple.mjs';
import {reduceRuleAction,ruleRequestValid} from './rule-actions.mjs';
import {advanceSceneTime} from './scene-rules.mjs';
import {settleEngageReturns,assertEnergyAllowed} from './conditional-resources.mjs';
import {settleRuleAction} from '../mvu_poc/adapter.mjs';
import {ruleActionInstructions} from './rule-reference.mjs';
import {createReplayCheckRuntime} from './replay-check.mjs';
import {createOpeningFixture} from './opening.mjs';
import {normalizeMap} from '../combat/map.mjs';
import {validateStep} from './narrative.mjs';
const source='D1–D14已采用／隔离验收',ones=()=>Array(1024).fill(1),eights=()=>Array(1024).fill(8);
const plan=x=>({source,...x}),object=(type,x={})=>({source,type,actorIds:['player'],manaResource:'测试魔力',...x});
const request=(objectId,operation,part)=>({kind:'rule',action:'mechanism',actorId:'player',objectId,operation,...(part?{part}:{})});
function root(objects={}){const actors=createOpeningRoster();actors.player.state.resources.测试魔力={current:60,max:60};return {actors,ruleScene:{objects}};}
const run=(r,id,op,part,dice=eights)=>reduceRuleAction(r,request(id,op,part),{drawDice:dice});
const belt=()=>object('ancientBelt',{equipped:true,forms:['fire','water','wind','earth'],swordGunOwned:true,weaponSkills:{sword:{main:'白刃'},gun:{main:'射击'}}});
function battle(form='water',mode='gun',participants=['player','jiang']){
 const b=createOpeningEncounter({id:'adopted',participants,positions:{player:[0,0],jiang:[3,0],huang:[3,1.5]}});
 b.playerDefenseDeclarations=false;b.reactionWindows=false;b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;
 b.actors.player.team='A';b.actors.jiang.team='B';b.ruleScene={objects:{belt:belt()}};
 b.actors.player.state.wizard={form,weaponDrawn:true,weaponMode:mode,weaponSkills:{sword:{main:'白刃'},gun:{main:'射击'}}};return b;
}
function gene(s){s.xp=30;s.geneticLock={source,highestStage:1,successfulUnlocks:{1:1,2:0},active:{},activeStage:0};return s;}
test('D1 resistance precedes effective cold/fire netting; weaker nonstacking sources do not sum',()=>{
 const r=root();const s=r.actors.player.state;s.statuses=[{type:'燃烧',source:'a',points:5,fireKind:'magic'},{type:'燃烧',source:'b',points:3}];
 const out=applyStatus(s,{type:'冻结',source:'c',points:3,dice:ones()});assert.equal(statusLevel(out.state,'燃烧').points,2);assert.equal(statusLevel(out.state,'冻结').points,0);assert.deepEqual(out.state.health,s.health);
 out.state.statuses.push({type:'冻结',source:'d',points:4});counteractTemperature(out.state);assert.equal(statusLevel(out.state,'冻结').points,2);assert.equal(statusLevel(out.state,'燃烧').points,0);
});
test('D2 actual six-legged anatomy defaults to half limbs while explicit examples remain',()=>{
 const s=root().actors.player.state;s.anatomy={source,movementModes:{land:{source,limbs:['a','b','c','d','e','f']}}};s.statuses=['a','b'].map(limbId=>({type:'肢体妨害',source:limbId,limbId,points:2}));
 assert.equal(limbMovement(s,20),19);s.statuses.push({type:'肢体妨害',source:'c',limbId:'c',points:2});assert.equal(limbMovement(s,20),18);
});
test('D3 Wizard bulletproof downgrades physical bullets, and full armor bypass removes it',()=>{
 const b=battle();b.activeId='jiang';const a=b.actors.jiang;a.state=beginTurn(a.state).state;a.kind='test';a.reach=100;
 a.equipment={weapon:{damage:4,ap:0,magic:0,ballistic:true,range:100},armor:{defense:0}};a.state.attributes.力量=25;
 let out=act(b,{actorId:'jiang',abilityId:'strike',targetId:'player'},{drawDice:eights});assert.ok(out.result.damage.length);assert.ok(out.result.damage.every(x=>x.severity==='B'));
 a.equipment.weapon.ap=100;out=act(b,{actorId:'jiang',abilityId:'strike',targetId:'player'},{drawDice:eights});assert.ok(out.result.damage.every(x=>x.severity==='L'));
 a.equipment.weapon={damage:4,ap:0,magic:0,energyWeapon:true,range:100};out=act(b,{actorId:'jiang',abilityId:'strike',targetId:'player'},{drawDice:eights});assert.ok(out.result.damage.every(x=>x.severity==='L'));
 a.equipment.weapon.ap=100;out=act(b,{actorId:'jiang',abilityId:'strike',targetId:'player'},{drawDice:eights});assert.ok(out.result.damage.some(x=>x.severity==='A'));
});
test('D4 Wizard ends with swift and no extra mana, but cannot act while asleep',()=>{
 const b=battle();const out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'belt',operation:'end'},{playerAuthorized:true,drawDice:ones});
 assert.equal(out.battle.actors.player.state.wizard,undefined);assert.equal(out.battle.actors.player.state.turn.swift,0);assert.equal(out.battle.actors.player.state.turn.standard,1);
 b.actors.player.state.sleeping={source};assert.throws(()=>act(b,{actorId:'player',abilityId:'mechanism',objectId:'belt',operation:'end'},{playerAuthorized:true}),/睡眠/);
});
test('D5 rapid fire includes adjacent ally, one standard, no recursion or duplicate adjacent hit',()=>{
 const b=battle('water','gun',['player','jiang','huang']);b.actors.huang.team='A';const base=attackProfile(b,'player',{targetId:'jiang'}).rawDP;
 const out=act(b,{actorId:'player',abilityId:'strike',targetId:'jiang',rapidFire:true},{playerAuthorized:true,drawDice:ones});
 assert.equal(out.result.attack.rawDP,base+2);assert.deepEqual(out.result.adjacentAttacks.map(x=>x.targetId),['huang']);assert.equal(out.battle.actors.player.state.turn.standard,0);
 assert.equal(out.result.adjacentAttacks[0].attack.rawDP,base-1);assert.deepEqual(out.battle.actors.player.rapidAdjacentHits,['huang']);
 out.battle.actors.player.state.turn.standard=1;const again=act(out.battle,{actorId:'player',abilityId:'strike',targetId:'jiang',rapidFire:true},{playerAuthorized:true,drawDice:ones});assert.equal(again.result.adjacentAttacks,undefined);
});
test('D6 upper fractional km rounds up; size 6 lower target without cargo adds no fee',()=>{
 const r=root({tele:object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{up:plan({languageAvailable:true,gesturesAvailable:true,distance:1001,samePlane:true,visited:true,remembered:true,position:[1001,0]}),low:plan({languageAvailable:true,gesturesAvailable:true,targetId:'jiang',willing:true,casterDistance:1,distance:20,visible:true,unobstructed:true,carriedVolume:0,position:[20,0]})}})});r.actors.jiang.state.size=6;
 const up=run(r,'tele','upper','up');assert.equal(up.result.cost,10);assert.equal(up.result.target,200);
 const low=run(r,'tele','lower','low');assert.equal(low.result.cost,1);assert.equal(low.result.roll,null);assert.deepEqual(low.actors.jiang.state.position,[20,0]);
});
test('D7 Engage leaves vulnerable body, blocks physical action, exits on wake or full action',()=>{
 const r=root({rings:object('phantomRings',{plans:{go:plan({ringWorn:true,wearerId:'jiang'})}})});r.actors.player.state.position=[4,6];r.actors.jiang.state.sleeping={source};
 let out=run(r,'rings','engage','go');assert.deepEqual(out.actors.player.state.position,[4,6]);assert.equal(out.actors.player.state.underworld.timeRatio,1);
 assert.throws(()=>reduceRuleAction(out,{kind:'rule',action:'check',actorId:'player',attribute:'力量',skill:'运动',dc:1},{drawDice:ones}),/Underworld/);
 const before=out.actors.player.state.health.intact;damageEvent(out.actors.player,[{amount:1,severity:'L',kind:'physical'}],false,{damage:[]});assert.ok(out.actors.player.state.health.intact<before);
 delete out.actors.jiang.state.sleeping;assert.equal(settleEngageReturns(out)[0].returned,true);assert.equal(out.actors.player.state.underworld,undefined);
 out=run(run(r,'rings','engage','go'),'rings','exit','go');assert.equal(out.result.actionCost,'full');assert.equal(out.actors.player.state.underworld,undefined);
});
test('D8 antiMagic defaults immune only for mineral and actual energy; sourced exceptions and chains',()=>{
 const r=root({rock:object('antiMagicRock',{plans:{hit:plan({grade:'A',magicalEnergy:true}),exception:plan({grade:'A',magicalEnergy:true,exception:true,exceptionSource:'明确穿透能力'}),lock:plan({targetId:'player',runeProcessed:true,energyResources:['测试魔力'],action:'move'})}})});
 assert.equal(run(r,'rock','resistance','hit').result.immune,true);assert.equal(run(r,'rock','resistance','exception').result.immune,false);
 const locked=run(r,'rock','lock','lock');assert.throws(()=>assertEnergyAllowed(locked.actors.player.state,{magical:true}),/厌魔石/);assert.doesNotThrow(()=>assertEnergyAllowed(locked.actors.player.state,{}));
});
test('D9 rule check spends one will only on explicit selector and stacks stage 1/2 increments',()=>{
 const r=root();const s=r.actors.player.state;s.attributes.智力=6;s.attributes.感知=11;s.attributeAuto.智力=1;s.attributeAuto.感知=2;s.geneticLock={active:{1:{},2:{attribute:'力量'}}};
 const q={kind:'rule',action:'check',actorId:'player',attribute:'意志',skill:'求生',dc:1};
 const ordinary=reduceRuleAction(r,q,{drawDice:ones}),boost=reduceRuleAction(r,{...q,willpower:true},{drawDice:ones});
 assert.equal(boost.result.dp-ordinary.result.dp,9);assert.equal(boost.result.autoSuccesses-ordinary.result.autoSuccesses,2);assert.equal(boost.actors.player.state.will.current,s.will.current-1);assert.equal(ordinary.actors.player.state.will.current,s.will.current);
 assert.equal(ruleRequestValid({kind:'rule',action:'extended',actorId:'player',taskId:'e',attribute:'意志',skill:'求生',target:10,periodMinutes:1,maxPeriods:3,willpower:true}),false);
 s.flatFooted=true;assert.throws(()=>reduceRuleAction(r,{...q,willpower:true},{drawDice:ones}),/措手不及/);
});
test('D9 player attack/defense choice charges once after reaction, previews do not spend',()=>{
 const b=battle();const w=b.actors.player.state.will.current;const options=inspectCommands(b);assert.ok(options.options.some(x=>x.command.willpower));assert.equal(b.actors.player.state.will.current,w);
 const boosted=act(b,{actorId:'player',abilityId:'strike',targetId:'jiang',willpower:true},{drawDice:ones,playerAuthorized:true});assert.equal(boosted.battle.actors.player.state.will.current,w-1);
 b.actors.jiang.position=[1.5,0];b.activeId='jiang';b.actors.jiang.state=beginTurn(b.actors.jiang.state).state;b.reactionWindows=true;b.playerDefenseDeclarations=true;
 let out=resolveStep(b,{actorId:'jiang',abilityId:'strike',targetId:'player'},{drawDice:ones});assert.equal(out.battle.actors.player.state.will.current,w);assert.ok(inspectCommands(out.battle).options.some(x=>x.command.willpower));
 out=resolveStep(out.battle,{actorId:'player',abilityId:'react',choice:'decline',defense:'normal',willpower:true},{drawDice:ones,playerAuthorized:true});assert.equal(out.battle.actors.player.state.will.current,w-1);assert.equal(out.result.attack.defense.parts.will,3);assert.equal(out.battle.actors.player.willDefenseReady,undefined);
});
test('D10 simultaneous unlock prechecks 21 XP; first failure stops, second failure charges only 14',()=>{
 const r=root({gene:object('geneticLock',{plans:{both:plan({authorized:true,mode:'voluntary',attribute:'力量',operations:['unlockBoth']}),end:plan({})}})});gene(r.actors.player.state);let draws=0;
 let out=run(r,'gene','unlockBoth','both',()=>{draws++;return ones();});assert.equal(draws,1);assert.equal(out.actors.player.state.xp,23);assert.equal(out.result.stages.length,1);
 draws=0;out=run(r,'gene','unlockBoth','both',()=>++draws===1?[10]:ones());assert.equal(draws,2);assert.equal(out.actors.player.state.xp,16);assert.ok(out.actors.player.state.geneticLock.active[1]);
 out=run(r,'gene','unlockBoth','both',()=>[10,10,...ones()]);assert.equal(out.actors.player.state.xp,30);assert.ok(out.actors.player.state.geneticLock.active[2]);
 out=run(out,'gene','end','end',ones);assert.equal(out.result.actionCost,'free');assert.deepEqual(out.actors.player.state.geneticLock.active,{});
 r.actors.player.state.xp=20;draws=0;assert.throws(()=>run(r,'gene','unlockBoth','both',()=>{draws++;return ones();}),/21XP/);assert.equal(draws,0);
});
test('D11 losing temporary HP remaps wounds with overflow, never leaves pending shrink or heals wounds',()=>{
 const s=createCharacter({attributes:{力量:3,敏捷:3,智力:3,感知:3,意志:3,风度:3}});s.geneticLock={active:{1:{},2:{attribute:'力量'}},hpBonus:10,temporaryGreatPowers:{attribute:'力量'}};s.derived.hpMax=18;s.health={...s.health,intact:0,B:0,L:0,A:18};
 const out=shiftGeneticLock(s,'敏捷');assert.equal(out.derived.hpMax,8);assert.equal(out.health.A,8);assert.equal(lifeStatus(out).state,'dead');assert.equal(out.geneticLock.pendingHpShrink,undefined);
});
test('D12 classifier receives actual adopted reference DCs and boundaries independent of world triggers',()=>{
 const prompt=ruleActionInstructions();for(const text of ['野外辨方向DC1','知识简单2、一般3、困难4、冷门6','装置简单1、较难2、困难3、几乎不可能10','对抗保持对抗','willpower:true'])assert.ok(prompt.includes(text));
});
test('D13 multi-member group and weighted draw are exact including unequal sizes',()=>{
 const b=battle('water','gun',['player','jiang','huang']);b.actors.huang.present=true;b.actors.jiang.claws=['huang'];b.actors.huang.state.grapple={holderId:'jiang'};
 const members=grappleMembers(b,'huang','player');assert.equal(members.length,2);members[0].state.size=2;members[1].state.size=3;
 const counts={};for(let d=1;d<=10;d++){const hit=weightedGrappleTarget(members,()=>[d]);counts[hit.target.id]=(counts[hit.target.id]??0)+1;}assert.deepEqual(Object.values(counts).sort(),[4,6]);
 const third=structuredClone(b.actors.huang);third.id='third';third.state.grapple={holderId:'jiang'};b.actors.third=third;assert.equal(grappleMembers(b,'huang','player').length,3);
 b.ruleScene.grappleOcclusion={player:{source,excludedIds:['third']}};assert.equal(grappleMembers(b,'huang','player').length,2);
 const out=act(b,{actorId:'player',abilityId:'strike',targetId:'huang'},{playerAuthorized:true,drawDice:ones});assert.ok(out.result.grappleTarget);assert.equal(out.result.grappleTarget.weights.length,2);
});
test('D14 box move operation, cap 3 and sourced reseal reset',()=>{
 const b=battle();b.ruleScene.objects.box=object('demonBox',{sleep:2,open:false,plans:{back:plan({outcome:'returned'})}});
 let out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'box',operation:'open'},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.actors.player.state.turn.move,0);assert.equal(out.battle.actors.player.state.turn.standard,1);
 const o=out.battle.ruleScene.objects.box;o.open=false;advanceSceneTime(out.battle.ruleScene,10*1440);assert.equal(o.sleep,3);o.released=true;o.sleep=0;
 const r=root({box:o});out=run(r,'box','reseal','back');assert.equal(out.result.sleep,3);assert.equal(out.ruleScene.objects.box.released,false);
});

test('XP full runtime chain: node opens window, selected 4→5→6 costs 6/12, duplicate and insufficient XP do not charge',async()=>{
 const fixture=createOpeningFixture();
 let data={stat_data:{}};const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async x=>{data=structuredClone(x);}};
 const rt=createReplayCheckRuntime({mvu,getAnchor:()=>({chatId:'xp-adopted',messageId:1,swipeId:0}),expectedChatId:'xp-adopted',baseline:fixture.baseline,drawDice:ones});
 await rt.initialize({openingAssumption:true});const saved=data.stat_data['901_rules_poc'];saved.actors.player.state.attributes.力量=4;saved.actors.player.state.xp=30;saved.ruleScene={events:{rest:{source,type:'node',actorIds:['player'],xp:0,growthAllowed:true}}};
 const q={kind:'rule',action:'growth',actorId:'player',attribute:'力量'},context={latest:{text:'我把力量提升一级'}};
 let out=await rt.settle({operationId:'gm-runtime/xp-adopted/closed',request:q,context});assert.equal(out.status,'needs_input');assert.equal(data.stat_data['901_rules_poc'].actors.player.state.xp,30);
 await rt.settle({operationId:'gm-runtime/xp-adopted/node',request:{kind:'rule',action:'node',actorId:'player',eventId:'rest'}});
 out=await rt.settle({operationId:'gm-runtime/xp-adopted/first',request:q,context});assert.equal(out.status,'applied');assert.equal(out.result.cost,6);assert.equal(out.result.xpAfter,24);
 assert.equal((await rt.settle({operationId:'gm-runtime/xp-adopted/first',request:q,context})).status,'already_applied');assert.equal(data.stat_data['901_rules_poc'].actors.player.state.xp,24);
 out=await rt.settle({operationId:'gm-runtime/xp-adopted/second',request:q,context});assert.equal(out.result.cost,12);assert.equal(out.result.xpAfter,12);assert.equal(out.result.autoGained,1);assert.equal(out.result.greatPowerChoiceGained,1);
 data.stat_data['901_rules_poc'].actors.player.state.xp=5;const before=structuredClone(data);out=await rt.settle({operationId:'gm-runtime/xp-adopted/poor',request:q,context});assert.equal(out.status,'needs_input');assert.deepEqual(data,before);
 assert.equal(rt.ruleContext().growthWindow.open,true);assert.equal(rt.ruleContext().actors.find(x=>x.id==='player').xp,5);
});
test('XP skill and feat pricing uses current next level and registered learning scope',()=>{
 const r=root();r.actors.player.state.xp=30;r.actors.player.state.skills.运动={level:4,subs:{攀爬:{level:4}}};r.ruleScene.growthWindow={id:'gap',source,open:true,actorIds:['player']};
 let out=reduceRuleAction(r,{kind:'rule',action:'growth',actorId:'player',skill:'运动'},{drawDice:ones});assert.equal(out.result.cost,9);assert.equal(out.result.xpAfter,21);
 out=reduceRuleAction(out,{kind:'rule',action:'growth',actorId:'player',skill:'运动',sub:'攀爬'},{drawDice:ones});assert.equal(out.result.cost,9);assert.equal(out.result.xpAfter,12);
 out.ruleScene.feats={trained:{id:'trained',adopted:true,source,maxLevel:3}};out.actors.player.state.feats={trained:{level:1}};
 out=reduceRuleAction(out,{kind:'rule',action:'feat',actorId:'player',featId:'trained'},{drawDice:ones});assert.equal(out.result.cost,6);assert.equal(out.result.xpAfter,6);
 out.ruleScene.growthWindow.open=false;assert.throws(()=>reduceRuleAction(out,{kind:'rule',action:'feat',actorId:'player',featId:'trained'}),/可强化/);
});
test('D9 single spell opt-in deducts one will; upper extended spell is ineligible',()=>{
 const r=root({tele:object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{go:plan({languageAvailable:true,gesturesAvailable:true,distance:20,visible:true,unobstructed:true,carriedVolume:2,position:[20,0]})}})});
 const before=r.actors.player.state.will.current,q={...request('tele','lower','go'),willpower:true};const out=reduceRuleAction(r,q,{drawDice:eights});
 assert.equal(out.result.roll.willCost,1);assert.equal(out.actors.player.state.will.current,before-1);
 assert.throws(()=>reduceRuleAction(r,{...q,operation:'upper'},{drawDice:eights}),/单次施法/);
});
test('D7 and D10 adopted exit defaults are reachable in combat without extra ruling plans',()=>{
 const b=battle();b.ruleScene.objects.rings=object('phantomRings');b.actors.player.state.underworld={source,wearerId:'jiang',objectId:'rings'};
 let options=inspectCommands(b).options;assert.ok(options.some(o=>o.command.operation==='exit'));assert.ok(!options.some(o=>o.command.abilityId==='strike'));
 let out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'rings',operation:'exit'},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.actors.player.state.turn.standard,0);assert.equal(out.battle.actors.player.state.turn.move,0);
 const g=battle();g.ruleScene.objects.gene=object('geneticLock');gene(g.actors.player.state);g.actors.player.state.geneticLock.active={1:{rounds:0,pain:0,damage:0,limit:3}};
 out=act(g,{actorId:'player',abilityId:'mechanism',objectId:'gene',operation:'end'},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.actors.player.state.turn.standard,1);assert.equal(out.battle.actors.player.state.turn.move,1);assert.deepEqual(out.battle.actors.player.state.geneticLock.active,{});
});
test('D8 sourced mineral survives map normalization and energy hits while ordinary wearer does not inherit immunity',()=>{
 const b=battle();const map=normalizeMap({bounds:[-10,-10,30,30],features:[{id:'rock',label:'厌魔石',kind:'obstacle',rect:[5,5,1,1],material:'antiMagicRock',durability:{current:20,max:20,hardness:0,source}}]},b);assert.equal(map.features[0].material,'antiMagicRock');
 const a=b.actors.player;a.state.wizard=undefined;a.equipment={weapon:{damage:1},armor:{defense:0}};
 const ordinary=structuredClone(a),mineral=structuredClone(a);mineral.material='antiMagicRock';
 const hit=[{amount:3,severity:'L',kind:'energy',energyType:'force',grade:'A'}];assert.equal(damageEvent(mineral,hit,false,{damage:[]}),0);assert.equal(damageEvent(ordinary,hit,false,{damage:[]}),3);
});
test('actual narrative classifier cannot silently spend will or choose rapid fire for a normal attack',()=>{
 const b=battle(),command={abilityId:'strike',targetId:'jiang',willpower:true};
 assert.throws(()=>validateStep({quote:'我射击姜子尤',command},'我射击姜子尤',b),/明确选择/);
 assert.throws(()=>validateStep({quote:'我射击姜子尤',command:{...command,willpower:false,rapidFire:true}},'我射击姜子尤',b),/明确选择剑枪连射/);
 const text='我花1意志射击姜子尤';assert.equal(validateStep({quote:text,command},text,b).willpower,true);
});
