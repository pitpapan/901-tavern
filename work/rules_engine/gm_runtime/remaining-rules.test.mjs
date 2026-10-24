import test from 'node:test';import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from '../combat/opening.mjs';
import {createCharacter,beginTurn,endTurn,check,oppose,effectiveAttribute} from '../core.mjs';
import {reduceRuleAction,ruleRequestValid} from './rule-actions.mjs';
import {runSceneMechanism} from './scene-rules.mjs';
import {act,panel,attackProfile,resolveDefense,damageEvent,opportunityActors} from '../combat/engine.mjs';
import {resolveStep} from '../combat/transitions.mjs';
import {inspectCommands,createCombatRuntime} from '../combat/runtime.mjs';
import {wizardFireSegments} from '../wizard-rules.mjs';
import {statusEvent,statusActionPermission} from '../status-rules.mjs';
import {advanceTime} from '../recovery.mjs';
import {settleCombat,settleRuleAction} from '../mvu_poc/adapter.mjs';
import {ruleActionInstructions} from './rule-reference.mjs';
import {clearLine,canObserve} from '../combat/map.mjs';
import {settleInterruptedTeleports} from './conditional-resources.mjs';
const ones=()=>Array(1024).fill(1),eights=()=>Array(1024).fill(8),source='隔离验收／人物卡资料集1016–1098、1676–1693';
const object=(type,extra={})=>({type,source,actorIds:['player'],manaResource:'测试魔力',...extra});
const plan=extra=>({source,...extra});
function root(objects){const actors=createOpeningRoster();actors.player.state.resources.测试魔力={current:60,max:60};return {actors,ruleScene:{objects}};}
const request=(objectId,operation,part)=>({kind:'rule',action:'mechanism',actorId:'player',objectId,operation,...(part?{part}:{})});
const run=(r,o,operation,part,dice=eights)=>reduceRuleAction(r,request(o,operation,part),{drawDice:dice});
const belt=()=>object('ancientBelt',{equipped:true,forms:['fire','water','wind','earth'],swordGunOwned:true,casting:{source,attribute:'智力',skill:'神秘学'},weaponSkills:{sword:{main:'白刃'},gun:{main:'射击'}},garudaId:'testGaruda',garudaInitiative:1});
function battle(form='fire',mode='sword'){
 const b=createOpeningEncounter({id:'remaining',participants:['player','jiang'],positions:{player:[0,0],jiang:[1.5,0]}});b.playerDefenseDeclarations=false;b.reactionWindows=false;b.actors.player.team='A';b.actors.jiang.team='B';b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;
 b.actors.player.state.resources.测试魔力={current:60,max:60};b.ruleScene={objects:{belt:belt()}};b.actors.player.state.wizard={form,weaponDrawn:true,weaponMode:mode,weaponSkills:{sword:{main:'白刃'},gun:{main:'射击'}}};return b;
}
test('lower teleport checks actual carrying DC and cost, then writes position transactionally',()=>{
 const r=root({tele:object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:30,visible:true,unobstructed:true,carriedVolume:3,position:[30,0]})}})});
 const out=run(r,'tele','lower','there');assert.equal(out.result.cost,2);assert.equal(out.result.roll.dc,3);assert.deepEqual(out.actors.player.state.position,[30,0]);assert.equal(out.actors.player.state.resources.测试魔力.current,58);assert.equal(r.actors.player.state.resources.测试魔力.current,60);
});
test('upper teleport accrues minute periods and actual failure refunds floor half',()=>{
 let r=root({tele:object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:2000,samePlane:true,visited:true,remembered:true,position:[2000,0]})}})});
 r=run(r,'tele','upper','there');assert.equal(r.result.target,200);assert.equal(r.result.periods,1);assert.equal(r.result.cost,10);assert.equal(r.result.elapsedMinutes,1);
 r.ruleScene.events={failure:{source,actorIds:['player'],type:'channelFailure',objectId:'tele'}};r=reduceRuleAction(r,{kind:'rule',action:'status_event',actorId:'player',eventId:'failure'},{drawDice:ones});r=run(r,'tele','upperFail','there');assert.equal(r.result.refund,5);assert.equal(r.actors.player.state.resources.测试魔力.current,55);
 const fractional=root({tele:object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:1500,samePlane:true,visited:true,remembered:true})}})});assert.equal(run(fractional,'tele','upper','there').result.cost,10);
});
test('magic constitution senses at the source range and carries sleep fractions across intervals',()=>{
 let r=root({mana:object('magicConstitution',{plans:{sense:plan({activationLevel:4,kind:'item',distance:50}),first:plan({minutes:30,dayId:'day1',intervalId:'a'}),second:plan({minutes:30,dayId:'day1',intervalId:'b'}),meditate:plan({minutes:60})}})});r.actors.player.state.resources.测试魔力.current=0;
 const sensed=run(r,'mana','sense','sense');assert.equal(sensed.result.range,(effectiveAttribute(r.actors.player.state,'感知')+2)*11);
 r=run(r,'mana','sleep','first');assert.equal(r.result.recovered,7);r=run(r,'mana','sleep','second');assert.equal(r.result.recovered,8);assert.equal(r.actors.player.state.resources.测试魔力.current,15);assert.throws(()=>run(r,'mana','sleep','second'),/已结算/);
 const meditated=run(r,'mana','meditate','meditate');assert.equal(meditated.result.recovered,meditated.result.roll.total);assert.equal(meditated.actors.player.state.magicSleep.day1.credited,15);
});
test('mana capacity uses actual learned spells without granting current energy',()=>{
 const r=root({mana:object('magicConstitution',{variant:'mutou',learnedSpells:[{source,separateSystem:false},{source,separateSystem:false},{source,separateSystem:true}]})});r.actors.player.state.resources.测试魔力.current=1;
 const out=run(r,'mana','capacity');assert.equal(out.result.maximum,r.actors.player.state.attributes.智力+r.actors.player.state.attributes.感知+2);assert.equal(out.actors.player.state.resources.测试魔力.current,1);
});
test('Sleep fixed DC4 saves, prevents reactions, and damage/standard waking clears sleep',()=>{
 const r=root({rings:object('phantomRings',{plans:{wearer:plan({wearerId:'jiang',ringWorn:true})}})});const out=run(r,'rings','sleep','wearer',ones);assert.equal(out.result.dc,4);assert.equal(out.result.sleeping,true);
 const s=out.actors.jiang.state;assert.equal(check(s,{attribute:'敏捷',context:{reflex:true},dice:eights()}).total,0);
 const b=battle();b.actors.jiang.state=s;b.activeId='jiang';assert.doesNotThrow(()=>act(b,{actorId:'jiang',abilityId:'end'},{drawDice:ones}));
 b.activeId='player';const woken=act(b,{actorId:'player',abilityId:'wake',targetId:'jiang'},{playerAuthorized:true,drawDice:ones});assert.equal(woken.battle.actors.jiang.state.sleeping,undefined);assert.equal(woken.battle.actors.player.state.turn.standard,0);
});
test('processed locked anti-magic chain blocks energy but leaves ordinary physical checks',()=>{
 let r=root({chain:object('antiMagicRock',{plans:{lock:plan({targetId:'player',runeProcessed:true,energyResources:['流风','测试魔力'],action:'standard'})}}),tele:object('teleport',{plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:10,visible:true,unobstructed:true,carriedVolume:0,position:[10,0]})}})});
 r=run(r,'chain','lock','lock');assert.throws(()=>run(r,'tele','lower','there'),/锁闭/);assert.equal(reduceRuleAction(r,{kind:'rule',action:'check',actorId:'player',attribute:'力量',dc:1},{drawDice:eights}).result.eligible,true);
 r=run(r,'chain','unlock','lock');assert.equal(run(r,'tele','lower','there').result.success,true);
});
test('Wizard transform costs three once, replaces armor and shifts for swift without invented fee',()=>{
 let b=battle();delete b.actors.player.state.wizard;const c={actorId:'player',abilityId:'mechanism',objectId:'belt',operation:'transform',part:'earth'};
 let out=act(b,c,{playerAuthorized:true,drawDice:eights});assert.equal(out.battle.actors.player.state.resources.测试魔力.current,57);assert.equal(resolveDefense(out.battle,'player','jiang').parts.armor,8);assert.equal(resolveDefense(out.battle,'player','jiang').parts.force,4);
 out=act(out.battle,{...c,operation:'shift',part:'wind'},{playerAuthorized:true,drawDice:eights});assert.equal(out.battle.actors.player.state.resources.测试魔力.current,57);assert.equal(out.battle.actors.player.state.turn.swift,0);assert.equal(out.result.mechanism.instantUninterruptible,false);
});
test('Wizard fire splits and floors damage once, earth absorbs three, wind ignores fall',()=>{
 assert.deepEqual(wizardFireSegments(7).map(x=>[x.amount,x.severity]),[[4,'L'],[2,'L'],[1,'A']]);
 const b=battle('earth'),a=b.actors.player,log={damage:[]};assert.equal(damageEvent(a,[{amount:5,severity:'L',kind:'physical'}],false,log),2);
 a.state.wizard.form='fire';assert.equal(damageEvent(a,[{amount:5,severity:'L',kind:'energy',energyType:'fire'}],false,{damage:[]}),0);a.state.wizard.form='wind';assert.equal(damageEvent(a,[{amount:5,severity:'L',kind:'energy',energyType:'fall'}],false,{damage:[]}),0);
});
test('water Defend considers total magical hit, and water attacks penalize even on a miss',()=>{
 const b=battle('water'),a=b.actors.player;a.state.timedEffects={wizardDefend:{form:'water',remainingMinutes:1}};
 assert.equal(damageEvent(a,[{amount:3,severity:'L',kind:'energy',energyType:'force',magical:true},{amount:3,severity:'L',kind:'energy',energyType:'force',magical:true}],false,{damage:[]}),3);
 const out=act(b,{actorId:'player',abilityId:'strike',targetId:'jiang'},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.actors.jiang.state.timedEffects.wizardWaterPenalty.points,2);assert.equal(out.battle.actors.jiang.state.timedEffects.wizardWaterPenalty.remainingMinutes,.2);
});
test('water combines move and block; entering gun threat triggers a free response',()=>{
 let b=battle('water','gun');b.actors.jiang.position=[10,0];const before=structuredClone(b.actors.player.state.turn);const c={actorId:'jiang',abilityId:'move',to:[2,0]};assert.deepEqual(opportunityActors(b,c).map(x=>x.id),['player']);
 b.activeId='jiang';b.actors.jiang.state=beginTurn(b.actors.jiang.state).state;const out=act(b,c,{playerAuthorized:true,drawDice:ones});assert.equal(out.result.opportunities[0].freeResponse,true);assert.deepEqual(out.battle.actors.player.state.turn,before);
 b=battle('water');b.actors.jiang.position=[10,0];const moved=act(b,{actorId:'player',abilityId:'move',to:[0,2],block:true},{playerAuthorized:true,drawDice:ones});assert.equal(moved.battle.actors.player.buffs.block,true);assert.equal(moved.battle.actors.player.state.turn.standard,1);
});
test('wind adjacent attack consumes one standard action and all-check bonus reaches ordinary opposed checks',()=>{
 const b=battle('wind');b.actors.third=structuredClone(b.actors.jiang);b.actors.third.id='third';b.actors.third.position=[1.5,1];b.actors.player.reach=3;
 const out=act(b,{actorId:'player',abilityId:'strike',targetId:'jiang',adjacentTargetIds:['third']},{playerAuthorized:true,drawDice:ones});assert.equal(out.result.adjacentAttacks.length,1);assert.equal(out.battle.actors.player.state.turn.standard,0);
 const s=b.actors.player.state,base=structuredClone(s);delete base.wizard;assert.equal(check(s,{attribute:'智力',dice:ones()}).dp-check(base,{attribute:'智力',dice:ones()}).dp,2);
 s.wizard.form='earth';const opposed=oppose(s,base,{attribute:'力量',dice:ones()},{attribute:'力量',dice:ones()});assert.ok(opposed.active.autoSuccesses>=2);
});
test('Garuda summon creates a runnable, fixed-stat combat participant and legal interference',()=>{
 const b=battle();const out=resolveStep(b,{actorId:'player',abilityId:'mechanism',objectId:'belt',operation:'garuda'},{playerAuthorized:true,drawDice:ones});
 const g=out.battle.actors.testGaruda;assert.equal(g.state.derived.hpMax,15);assert.equal(panel(out.battle,g.id).speed,30);assert.equal(resolveDefense(out.battle,g.id,'jiang',{ranged:true}).parts.natural,12);
 out.battle.activeId=g.id;out.battle.actors.jiang.position=[1,0];const options=inspectCommands(out.battle);assert.ok(options.options.some(x=>x.command.abilityId==='garudaInterfere'));
 const interfered=act(out.battle,{actorId:g.id,abilityId:'garudaInterfere',targetId:'jiang'},{playerAuthorized:true,drawDice:ones});assert.equal(interfered.battle.actors.jiang.state.timedEffects.garudaInterference.points,1);
});
test('status context events update perception; source orders finish once; sleep hidden check loses one success',()=>{
 const s=createCharacter({attributes:{力量:3,敏捷:3,智力:3,感知:3,意志:3,风度:3}});s.sleeping={source:'Sleep'};const r={actors:{player:{state:s},target:{state:structuredClone(s)}},ruleScene:{events:{sense:{source,type:'sleepPerception',actorIds:['player'],skill:'洞察',targetId:'target',distance:20,passive:{attribute:'敏捷'}}}}};
 const result=statusEvent(r,{actorId:'player',eventId:'sense'},{drawDice:eights});assert.equal(result.active.total,2);assert.equal(result.range,40);assert.equal(result.targetHidden,true);
 s.statuses=[{type:'恐惧',source:'fear',points:4,perceived:true,escapeActions:[{abilityId:'move',to:[20,0]}]}];assert.throws(()=>statusActionPermission(s,{abilityId:'move',to:[2,0]},{escape:true}),/最有效/);
});
test('conditional mechanism MVU operation is idempotent and persists mana / position',async()=>{
 const r=root({tele:object('teleport',{plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:10,visible:true,unobstructed:true,carriedVolume:0,position:[10,0]})}})});Object.assign(r,{schemaVersion:1,chatId:'remaining',revision:0,operations:{}});let data={stat_data:{'901_rules_poc':r}};
 const args={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async n=>{data=n;}},getAnchor:()=>({chatId:'remaining',messageId:0,swipeId:0}),expectedChatId:'remaining',operationId:'tele/1',expectedRevision:0,request:request('tele','lower','there'),reduce:(root,r)=>reduceRuleAction(root,r,{drawDice:ones})};
 assert.equal((await settleRuleAction(args)).status,'applied');assert.equal((await settleRuleAction(args)).status,'already_applied');assert.equal(data.stat_data['901_rules_poc'].actors.player.state.resources.测试魔力.current,59);
});
test('classifier advertises executable conditional and sourced status routes',()=>{
 assert.equal(ruleRequestValid({kind:'rule',action:'status_event',actorId:'player',eventId:'confirmed'}),true);
 const prompt=ruleActionInstructions({objects:{belt:belt()}});for(const s of ['status_event','upperFail','drawWeapon'])assert.ok(prompt.includes(s));
 assert.ok(prompt.includes('各形态甲8/8'));assert.ok(!prompt.includes('各形态完整数值'));
});
test('Defend wall blocks its actual direction and expires at caster next turn',()=>{
 let b=battle('earth');b.map={bounds:[-10,-10,40,40],features:[]};b.ruleScene.objects.belt.plans={wall:plan({wall:{rect:[.5,-1,.2,2]}})};
 let count=0;const dice=()=>{const out=ones();if(count++===0)out[0]=8;return out;};b.actors.player.state.attributes.智力=1;b.actors.player.state.attributeAuto.智力=0;
 let out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'belt',operation:'defend',part:'wall'},{playerAuthorized:true,drawDice:dice});assert.equal(out.result.mechanism.rounds,1);assert.equal(clearLine(out.battle.map,[0,0],[1.5,0]),false);
 for(let n=0;n<3&&out.battle.map.features.length;n++)out=act(out.battle,{actorId:out.battle.activeId,abilityId:'end'},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.map.features.length,0);
});
test('wind reflection requests shooter reaction and settles without demanding protected target defense',()=>{
 const b=battle('wind');b.actors.player.state.timedEffects={wizardDefend:{form:'wind',remainingMinutes:1}};
 const shooter=b.actors.jiang;shooter.controller='player';shooter.state.wizard={form:'water',weaponDrawn:true,weaponMode:'gun',weaponSkills:{gun:{main:'射击'}}};shooter.state.attributes.敏捷=1;shooter.state.skills.射击={level:0};shooter.position=[10,0];
 delete b.actors.player.state.wizard; // Defend is an already active duration, independent of current weapon.
 b.activeId='jiang';shooter.state=beginTurn(shooter.state).state;b.reactionWindows=true;b.playerDefenseDeclarations=true;
 const c={actorId:'jiang',abilityId:'strike',targetId:'player'},pending=resolveStep(b,c,{playerAuthorized:true,drawDice:ones});assert.equal(pending.battle.pending.awaiting,'jiang');
 const out=resolveStep(pending.battle,{actorId:'jiang',abilityId:'react',choice:'decline',defense:'normal'},{playerAuthorized:true,drawDice:ones});assert.equal(out.result.reflected.targetId,'jiang');assert.equal(out.battle.actors.jiang.state.turn.standard,0);
});
test('Garuda persists through MVU summon/readback and expires when its combat scene ends',async()=>{
 const b=battle();let data={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'garuda',revision:0,operations:{},actors:structuredClone(b.actors),ruleScene:structuredClone(b.ruleScene)}}};
 const env={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async n=>{data=n;}},getAnchor:()=>({chatId:'garuda',messageId:0,swipeId:0}),expectedChatId:'garuda'};
 await settleCombat({...env,operationId:'summon',expectedRevision:0,command:{abilityId:'mechanism'},createBattle:()=>b,reduce:b=>act(b,{actorId:'player',abilityId:'mechanism',objectId:'belt',operation:'garuda'},{drawDice:ones,playerAuthorized:true})});
 const runtime=createCombatRuntime({...env,drawDice:ones});assert.equal(runtime.read().battle.actors.testGaruda.state.derived.hpMax,15);
 data.stat_data['901_rules_poc'].battle.status='finished';await runtime.leave({operationId:'leave',expectedRevision:1});assert.equal(data.stat_data['901_rules_poc'].actors.testGaruda.present,false);
});

test('source recheck: wind Defend includes exactly 12 DP in the minus-six branch',()=>{
 const b=battle('water','gun');
 b.actors.player.state.attributes.敏捷=2;b.actors.player.state.skills.射击={level:0};b.actors.jiang.position=[10,0];
 b.actors.jiang.state.timedEffects={wizardDefend:{form:'wind',remainingMinutes:1}};
 assert.equal(attackProfile(b,'player',{targetId:'jiang'}).rawDP,12);
 const out=act(b,{actorId:'player',abilityId:'strike',targetId:'jiang'},{playerAuthorized:true,drawDice:ones});
 assert.equal(out.result.reflected,undefined);assert.equal(out.result.attack.rawDP,6);
});
test('source recheck: sub-actions do not burn, own action ending burns once',()=>{
 const b=battle();b.actors.player.state.statuses=[{type:'燃烧',source,points:2,fireKind:'adhesive'}];delete b.actors.player.state.wizard;
 b.actors.jiang.position=[10,0];const before=b.actors.player.state.health.L;
 let out=act(b,{actorId:'player',abilityId:'move',to:[0,1]},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.actors.player.state.health.L,before);
 out=act(out.battle,{actorId:'player',abilityId:'end'},{playerAuthorized:true,drawDice:ones});assert.equal(out.battle.actors.player.state.health.L,before+2);
});
test('source recheck: damage alone continues teleport, inability refunds once without actor action',()=>{
 let r=root({tele:object('teleport',{casting:{source,attribute:'智力',skill:'神秘学'},plans:{there:plan({languageAvailable:true,gesturesAvailable:true,distance:1000,samePlane:true,visited:true,remembered:true,position:[1000,0]})}})});
 r=run(r,'tele','upper','there');r.actors.player.state.health.intact--;r.actors.player.state.health.L++;
 assert.deepEqual(settleInterruptedTeleports(r),[]);
 r.actors.player.state.sleeping={source:'实际Sleep'};const refund=settleInterruptedTeleports(r);assert.equal(refund[0].refund,4);
 assert.equal(r.actors.player.state.resources.测试魔力.current,55);assert.deepEqual(settleInterruptedTeleports(r),[]);
});
test('source recheck: genetic unlock uses combat move/full budget, shift is swift, and time advances debts',()=>{
 let b=battle();delete b.actors.player.state.wizard;b.actors.player.state.xp=30;
 b.actors.player.state.geneticLock={highestStage:1,successfulUnlocks:{1:1,2:0}};
 b.ruleScene.objects.gene=object('geneticLock',{plans:{first:plan({mode:'voluntary',stage:1,authorized:true,operations:['unlock']}),second:plan({mode:'voluntary',stage:2,attribute:'敏捷',authorized:true,operations:['unlock']}),strength:plan({attribute:'力量',operations:['shift']})}});
 const tens=()=>[10,10,...ones()];let out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'gene',operation:'unlock',part:'first'},{drawDice:tens,playerAuthorized:true});
 assert.equal(out.battle.actors.player.state.turn.move,0);assert.equal(out.battle.actors.player.state.geneticLock.activeStage,1);
 out.battle.actors.player.state=beginTurn(endTurn(out.battle.actors.player.state).state).state;
 out=act(out.battle,{actorId:'player',abilityId:'mechanism',objectId:'gene',operation:'unlock',part:'second'},{drawDice:tens,playerAuthorized:true});
 assert.equal(out.battle.actors.player.state.turn.standard,0);assert.equal(out.battle.actors.player.state.turn.move,0);assert.equal(out.battle.actors.player.state.geneticLock.activeStage,2);
 out.battle.actors.player.state=beginTurn(endTurn(out.battle.actors.player.state).state).state;
 out=act(out.battle,{actorId:'player',abilityId:'mechanism',objectId:'gene',operation:'shift',part:'strength'},{drawDice:tens,playerAuthorized:true});assert.equal(out.battle.actors.player.state.turn.swift,0);
 const state=out.battle.actors.player.state;advanceTime(out.battle.actors.player,.1,[],{drawDice:ones});assert.equal(state.geneticLock.active[2].rounds,1);
});
test('source recheck: second-stage lifecycle is saved to MVU once and exposed to the classifier',async()=>{
 const gene=object('geneticLock',{plans:{second:plan({authorized:true,stage:2,mode:'voluntary',attribute:'敏捷',operations:['unlock']})}});
 const r=root({gene});r.actors.player.state.xp=30;r.actors.player.state.geneticLock={highestStage:1,successfulUnlocks:{1:1,2:0},activeStage:1,active:{1:{rounds:0,limit:3,pain:0,damage:0}}};
 Object.assign(r,{schemaVersion:1,chatId:'gene',revision:0,operations:{}});let data={stat_data:{'901_rules_poc':r}},draws=0;
 const args={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async n=>{data=n;}},getAnchor:()=>({chatId:'gene',messageId:0,swipeId:0}),expectedChatId:'gene',operationId:'gene/second',expectedRevision:0,request:request('gene','unlock','second'),reduce:(root,r)=>reduceRuleAction(root,r,{drawDice:()=>{draws++;return [10,10,...ones()];}})};
 assert.equal((await settleRuleAction(args)).status,'applied');assert.equal((await settleRuleAction(args)).status,'already_applied');assert.equal(draws,1);
 assert.equal(data.stat_data['901_rules_poc'].actors.player.state.geneticLock.activeStage,2);assert.equal(data.stat_data['901_rules_poc'].actors.player.state.xp,30);
 assert.ok(ruleActionInstructions({objects:{gene}}).includes('allocateBacklash'));
});
test('original demon-box post: gaze is unresisted, escalates, does not reset, and ends when eyes close',()=>{
 const r=root({box:object('demonBox',{open:true,sleep:3,activationAction:'move'})});
 r.ruleScene.events={look:{source,actorIds:['player'],type:'demonGaze',objectId:'box',looking:true},still:{source,actorIds:['player'],type:'demonGaze',objectId:'box',looking:true},closed:{source,actorIds:['player'],type:'demonGaze',objectId:'box',looking:false}};
 let draws=0;statusEvent(r,{actorId:'player',eventId:'look'},{drawDice:()=>{draws++;return ones();}});assert.equal(draws,0);assert.equal(r.actors.player.state.statuses[0].points,5);
 advanceTime(r.actors.player,.2);assert.equal(r.actors.player.state.statuses[0].points,7);
 statusEvent(r,{actorId:'player',eventId:'still'},{drawDice:ones});assert.equal(r.actors.player.state.statuses[0].points,7);
 statusEvent(r,{actorId:'player',eventId:'closed'},{drawDice:ones});assert.equal(r.actors.player.state.statuses.length,0);
});
test('original demon-box post: A-grade sense detects box and S-grade holder aura is not masked',()=>{
 const r=root({box:object('demonBox',{plans:{sense:plan({monsterSense:true,senseGrade:'A',holderAuraGrade:'S'})}})});
 const out=run(r,'box','sense','sense');assert.equal(out.result.boxDetected,true);assert.equal(out.result.holderMasked,false);
});
