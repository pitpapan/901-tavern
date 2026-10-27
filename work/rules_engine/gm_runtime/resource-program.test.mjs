import {healWounds} from '../healing.mjs';
import {reduceRecovery} from '../recovery.mjs';
import {statusActionPermission} from '../status-rules.mjs';
import {advanceSceneTime} from './scene-rules.mjs';
import {timedResourceInstances} from '../resource-instances.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from '../combat/opening.mjs';
import {check,checkModifiers,actionEligibility,statusLevel,applyStatus,effectiveAttribute,beginTurn,endTurn,lifeStatus,recover} from '../core.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {RESOURCE_DEFINITIONS,resourceBonus} from '../resource-definitions.mjs';
import {stackEffects} from '../resource-effects.mjs';
import {resolveDefense,damageEvent,attackProfile,panel,act,settleDamageReactions} from '../combat/engine.mjs';
import {expireResourceEffects} from '../resource-lifecycle.mjs';
import {saveProfile,equipment} from '../combat/mechanics.mjs';
import {advanceTime} from '../recovery.mjs';
import {reduceRuleAction} from './rule-actions.mjs';
import {fireResourceTriggers} from './resource-program.mjs';
import {settleResourceConcentration} from '../resource-channeling.mjs';
import {resolveStep} from '../combat/transitions.mjs';
import {inspectCommands} from '../combat/runtime.mjs';
const dice=()=>Array(200).fill(8),source='隔离规则测试/已获授权的虚构状态';
test('high frequency blade stays on one actual weapon through swapping and transfer, without global casting explosions',()=>{
 const x=scene('高频刃');x.plan.targetIds=['player'];x.plan.weaponId='blade-1';x.plan.weaponTouchConfirmed=true;
 x.plan.components={focus:true};
 const a=x.root.actors.player,base={...equipment(a).weapon,skill:'白刃',sub:'长剑'};
 a.state.possessions={items:['blade-1','blade-2'].map(id=>({id,source,location:'carried',held:true,weapon:structuredClone(base)}))};a.state.equippedWeaponId='blade-1';
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),owner=out.actors.player;
 assert.equal(equipment(owner).weapon.damage,base.damage+2);assert.equal(equipment(owner).weapon.explode,8);
 assert.equal(check(owner.state,{poolBase:1,dice:[8,1],context:{casting:true}}).used,1);
 owner.state.equippedWeaponId='blade-2';assert.equal(equipment(owner).weapon.damage,base.damage);
 const moved=owner.state.possessions.items.splice(0,1)[0],recipient=out.actors.huang;
 recipient.state.possessions={items:[moved]};recipient.state.equippedWeaponId=moved.id;
 assert.equal(equipment(recipient).weapon.damage,base.damage+2);
 assert.equal(attackProfile({actors:out.actors},'huang',{targetId:'player'}).explode,8);
 expireResourceEffects(recipient.state,{scene:true});assert.equal(equipment(recipient).weapon.damage,base.damage);
 assert.equal(owner.state.resources['测试魔力'].current,19);
 x.plan.weaponId='not-owned';assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/实际武器/);
});
test('angel barrier preserves each allocated balance on exit/reentry and replaces recipients only on a new paid cast',()=>{
 const x=scene('天使之障壁');spatial(x);x.plan.targetIds=['player','huang','jiang'];
 x.plan.inputs={temporaryAllocation:{player:6,huang:6,jiang:6}};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.huang.state.health.temp,6);
 damageEvent(out.actors.huang,[{amount:4,severity:'L',kind:'energy',energyType:'force'}],false,{damage:[]});
 out=JSON.parse(JSON.stringify(out));out.ruleScene.spatial.actors.huang.position=[1000,0];
 out=reduceRuleAction(out,fieldCheck,{drawDice:dice});assert.equal(out.actors.huang.state.health.temp,0);
 out.ruleScene.spatial.actors.huang.position=[1,0];out=reduceRuleAction(out,fieldCheck,{drawDice:dice});
 assert.equal(out.actors.huang.state.health.temp,2);
 delete out.actors.player.state.resourceCooldowns[x.id];
 out.ruleScene.objects.spell.plans.use.targetIds=['player','huang','bright'];
 out.ruleScene.objects.spell.plans.use.inputs.temporaryAllocation={player:6,huang:6,bright:6};
 out=reduceRuleAction(out,x.q,{drawDice:dice});
 assert.equal(out.actors.jiang.state.health.temp,0);assert.equal(out.actors.huang.state.health.temp,6);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,18);
 out=reduceRuleAction(out,{kind:'rule',action:'time',actorId:'player',minutes:1,sourceQuote:source},{drawDice:dice});
 assert.equal(out.actors.huang.state.health.temp,0);assert.deepEqual(out.actors.player.state.resourceAuras,{});
});
test('a registered reflex spell can interrupt a pending attack, costs once, and preserves the pending declaration across reload',()=>{
 const x=scene('天堂之盾','C');x.plan.operations=['cast','castReflex'];
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.player.state=x.root.actors.player.state;b.ruleScene=x.root.ruleScene;
 b.actors.player.combatProfile.willOverride=10;b.actors.player.state.will={current:10,max:10};
 b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='huang';b.actors.huang.sheathed=false;
 b.playerDefenseDeclarations=true;b.reactionWindows=true;
 const attack={actorId:'huang',abilityId:'strike',targetId:'player'};
 b=resolveStep(b,attack,{playerAuthorized:true,drawDice:()=>{throw Error('pending declarations must not draw dice');}}).battle;
 const pending=structuredClone(b.pending),will=b.actors.player.state.will.current,enemy=structuredClone(b.actors.huang.state);
 const command={actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'castReflex',part:'use'};
 assert.ok(inspectCommands(b).options.some(o=>JSON.stringify(o.command)===JSON.stringify(command)));
 b=resolveStep(b,command,{playerAuthorized:true,drawDice:dice}).battle;
 assert.deepEqual(b.pending,pending);assert.deepEqual(b.actors.huang.state,enemy);
 assert.equal(b.actors.player.state.will.current,will-3);assert.equal(b.actors.player.state.resources['测试魔力'].current,17);
 assert.equal(b.actors.player.state.health.temp,24);assert.equal(b.actors.player.state.turn.reactionLock,true);
 const before=structuredClone(b);assert.throws(()=>resolveStep(b,command,{playerAuthorized:true,drawDice:dice}),/Reaction locked/);assert.deepEqual(b,before);
 const resumed=resolveStep(JSON.parse(JSON.stringify(b)),{actorId:'player',abilityId:'react',choice:'decline',defense:'normal'},{playerAuthorized:true,drawDice:dice});
 assert.equal(resumed.battle.pending,undefined);assert.equal(resumed.battle.actors.player.state.resources['测试魔力'].current,17);
});
test('heaven shield uses one sourced balance and ends its hardness on exhaustion or scene expiry',()=>{
 const x=scene('天堂之盾','C');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 let a=out.actors.player;assert.equal(a.state.health.temp,24);assert.equal(resourceBonus(a.state,'hardness'),4);
 assert.equal(damageEvent(a,[{amount:10,severity:'L',kind:'energy',energyType:'fire'}],false,{damage:[]}),0);
 assert.equal(a.state.health.temp,18);
 out=reduceRuleAction(out,x.q,{drawDice:dice});a=out.actors.player;
 assert.equal(a.state.health.temp,24);assert.equal(a.state.resources['测试魔力'].current,14);
 const loaded=JSON.parse(JSON.stringify(a));
 assert.equal(damageEvent(loaded,[{amount:30,severity:'L',kind:'energy',energyType:'fire'}],false,{damage:[]}),2);
 assert.equal(loaded.state.health.temp,0);assert.equal(resourceBonus(loaded.state,'hardness'),0);
 expireResourceEffects(a.state,{scene:true});assert.equal(a.state.health.temp,0);assert.equal(resourceBonus(a.state,'hardness'),0);
});
test('Azathoth drains current will, not attributes or save DP, and its own zero condition ends on recovery',()=>{
 const x=scene('阿撒托斯的恐怖诅咒','C');x.root.actors.huang.state.will.current=2;
 const before=structuredClone(x.root.actors.huang),out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const target=out.actors.huang;
 assert.equal(target.state.will.current,0);assert.deepEqual(target.state.attributes,before.state.attributes);
 assert.equal(saveProfile(target,'will').dp,saveProfile(before,'will').dp);
 assert.equal(lifeStatus(target.state).state,'unconscious');
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 const restored=recover(JSON.parse(JSON.stringify(target.state)),{type:'longRest'}).state;
 assert.equal(restored.will.current,1);assert.equal(lifeStatus(restored).state,'awake');
 assert.deepEqual(restored.resourceConditions,{});
 x.root.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',level:3}};
 const immune=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(immune.actors.huang.state.will.current,2);
 assert.equal(immune.result.targets[0].immune,'mind');
});
test('molten armor explodes only casting checks and retaliates once on a melee hit even when protection stops all wounds',()=>{
 const x=scene('熔岩护甲','C'),cast=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const s=cast.actors.player.state;
 const casting=check(s,{poolBase:2,attributeAutoOverride:0,dice:[8,9,1,1],context:{casting:true}});
 assert.equal(casting.used,4);assert.equal(casting.rolledSuccesses,2);
 assert.equal(check(s,{poolBase:2,attributeAutoOverride:0,dice:[8,9,1,1]}).used,2);
 assert.equal(check(s,{poolBase:0,attributeAutoOverride:0,dice:[8],context:{casting:true}}).rolledSuccesses,0);
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.player.state=s;b.actors.player.state.activeResourceEffects.push({sourceId:'test-shield',effects:[{stat:'hardness',value:100}]});
 b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='huang';b.playerDefenseDeclarations=false;b.reactionWindows=false;
 b.actors.huang.sheathed=false;b.actors.huang.state.skills.白刃={level:5,subs:{太刀:{level:40}}};
 const result=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:dice,playerAuthorized:true});
 assert.ok(result.result.attack.amount>0);
 assert.equal(result.result.damage.filter(d=>d.targetId==='player').reduce((n,d)=>n+d.actualDamage,0),0);
 assert.equal(result.result.resourceTriggers.length,1);
 assert.equal(result.result.resourceTriggers[0].damage.reduce((n,d)=>n+d.actualDamage,0),6);
 const missed=structuredClone(b),ms=missed.actors.huang.state;
 ms.attributeAuto=Object.fromEntries(Object.keys(ms.attributes).map(k=>[k,0]));
 ms.skills.白刃.auto=0;ms.skills.白刃.subs.太刀.auto=0;
 const miss=act(missed,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:()=>Array(200).fill(1),playerAuthorized:true});
 assert.equal(miss.result.attack.amount,0);assert.equal(miss.result.resourceTriggers?.length??0,0);
});
test('school resistance uses the selected actual school and blocks matching effects without changing other schools',()=>{
 const x=scene('法术抵御','C');x.plan.inputs={chosenSchool:'塑能'};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.huang.state;
 assert.equal(s.activeResourceEffects[0].version,RESOURCE_DEFINITIONS[x.id].contractVersion);
 assert.equal(s.activeResourceEffects[0].grade,'C');
 assert.equal(resourceBonus(s,'spellResistance',{schools:['塑能']}),21);
 assert.equal(resourceBonus(s,'spellResistance',{schools:['变化']}),0);
 assert.equal(resourceBonus(s,'spellResistance',{schools:['变化','塑能']}),21);
 const attack=scene('魔法飞弹');attack.root.actors.huang.state=JSON.parse(JSON.stringify(s));
 const hit=reduceRuleAction(attack.root,attack.q,{drawDice:dice});
 assert.equal(hit.result.targets[0].effectivePower,0);
 assert.equal(hit.result.targets[0].steps.length,0);
 x.plan.inputs.chosenSchool='任意虚构专业';assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/选择合法/);
});
test('angel blessing validates the complete six-attribute allocation and preserves base stats through save and expiry',()=>{
 const x=scene('天使之赐福'),before=structuredClone(x.root.actors.huang.state);
 x.plan.inputs={attributeAllocation:{力量:2,意志:2}};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.huang.state;
 assert.deepEqual(s.attributes,before.attributes);assert.deepEqual(s.skills,before.skills);
 assert.equal(effectiveAttribute(s,'力量'),effectiveAttribute(before,'力量')+2);
 assert.equal(s.derived.hpMax,before.derived.hpMax+4);
 assert.equal(s.health.intact,before.health.intact+4);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
 const restored=JSON.parse(JSON.stringify(s));expireResourceEffects(restored,{scene:true});
 assert.equal(restored.derived.hpMax,before.derived.hpMax);assert.deepEqual(restored.health,before.health);
 assert.deepEqual(x.root.actors.huang.state,before);
 for(const allocation of [{力量:3,意志:1},{力量:2},{力量:2,体质:2},{力量:1.5,意志:2.5}]){
  x.plan.inputs.attributeAllocation=allocation;assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/属性分配/);
  assert.equal(x.root.actors.player.state.resources['测试魔力'].current,20);
 }
});
function scene(name,rank='D'){
 const id=Object.values(RESOURCE_CATALOG).find(x=>x.name===name)?.id;
 assert.ok(id,name);assert.ok(RESOURCE_DEFINITIONS[id].programs?.cast,name+'执行程序');
 const actors=createOpeningRoster(),a=actors.player;
 a.state.casting={imperial:{grade:rank,pool:'测试魔力'}};
 a.state.resources['测试魔力']={current:20,max:20};
 a.state.learnedResources={[id]:{learned:true,grade:rank,source}};
 a.state.skills.神秘={level:3,subs:Object.fromEntries(RESOURCE_DEFINITIONS[id].subskills.map(x=>[x,{level:1}]))};
 const plan={source,targetIds:['huang'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true}};
 const root={actors,ruleScene:{objects:{spell:{type:'kitResource',resourceId:id,source,actorIds:['player'],plans:{use:plan}}}}};
 return {id,root,plan,q:{kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'}};
}
test('group penalties remain effective; same-kind bonuses and penalties each take their strongest',()=>{
 assert.equal(stackEffects([{group:'curse',value:-3},{group:'curse',value:-2}]).value,-3);
 assert.equal(stackEffects([{group:'enhancement',value:3},{group:'enhancement',value:6},{group:'enhancement',value:-2}]).value,4);
});
test('spell casts spend the actual tier cost once without mutating the input or T0',()=>{
 for(const grade of ['D','C']){const x=scene('魔法飞弹',grade),before=structuredClone(x.root);const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(out.actors.player.state.resources['测试魔力'].current,20-(grade==='D'?1:3));assert.deepEqual(x.root,before);assert.ok(out.result.targets[0].steps.some(x=>x.op==='damage'));}
 assert.equal(createOpeningRoster().player.state.casting,undefined);
});
test('timed check bonuses participate in ordinary JS checks and expire with scene time',()=>{
 const x=scene('侦测潜行');x.plan.targetIds=['player'];const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 const plain=check(x.root.actors.player.state,{attribute:'感知',skill:'调查',dice:dice(),context:{purpose:'detection'}});
 assert.equal(check(a.state,{attribute:'感知',skill:'调查',dice:dice(),context:{purpose:'detection'}}).dp,plain.dp+12);
 advanceTime(a,10000);assert.equal(check(a.state,{attribute:'感知',skill:'调查',dice:dice(),context:{purpose:'detection'}}).dp,plain.dp);
});
test('force defense enters the actual AP-removable defense category',()=>{
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 const a=b.actors.player;a.state.activeResourceEffects=[{sourceId:'test',effects:[{stat:'defense',group:'force',value:12}]}];
 assert.equal(resolveDefense(b,'player','huang',{defenseMode:'normal'}).parts.force,12);
 assert.equal(resolveDefense(b,'player','huang',{defenseMode:'normal',ap:12}).parts.force,0);
});
test('declared absorption applies once across damage segments, then expires',()=>{
 const a=createOpeningRoster().player;a.state.activeResourceEffects=[{sourceId:'test',remainingMinutes:1,effects:[{stat:'absorb',group:'physicalShield',value:2}]}];
 const out={damage:[]};assert.equal(damageEvent(a,[{amount:2,severity:'L',kind:'energy',energyType:'fire'},{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,out),1);
 advanceTime(a,1);assert.equal(damageEvent(a,[{amount:2,severity:'L',kind:'energy',energyType:'fire'}],false,{damage:[]}),2);
});
test('spell resistance reduces target-effective power without draining extra energy or affecting other targets',()=>{
 const x=scene('魔法飞弹');x.root.actors.huang.state.activeResourceEffects=[{sourceId:'test',effects:[{stat:'spellResistance',value:3}]}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(out.result.targets[0].effectivePower,0);assert.equal(out.result.targets[0].steps.length,0);assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
});
test('periodic damage keeps cast-time power and consumes exactly ten events',()=>{
 const x=scene('腐蚀术');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 out.actors.huang.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};out.actors.player.state.attributes.智力+=20;
 let damage=0;for(let i=0;i<11;i++)damage+=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice}).flatMap(x=>x.damage).reduce((n,x)=>n+x.actualDamage,0);
 assert.equal(damage,10);assert.equal(Object.keys(out.actors.huang.state.resourceTriggers).length,0);assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
});
test('a next-melee rider ignores other weapon attacks, fires once and does not create a second attack',()=>{
 const x=scene('炽焰斩');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.deepEqual(fireResourceTriggers(out,'player','attackResolved',{targetId:'huang',context:{melee:false,skill:'射击',hit:true},drawDice:dice}),[]);
 const fired=fireResourceTriggers(out,'player','attackResolved',{targetId:'huang',context:{melee:true,skill:'白刃',hit:true},drawDice:dice});assert.equal(fired.length,1);assert.equal(fired[0].damage[0].actualDamage,3);
 assert.equal(out.actors.huang.state.statuses.find(x=>x.type==='燃烧').points,3);
 assert.deepEqual(fireResourceTriggers(out,'player','attackResolved',{targetId:'huang',context:{melee:true,skill:'白刃',hit:true},drawDice:dice}),[]);
});
test('field caster resolves through saved-state records plus actor templates, without importing their mature state',()=>{
 const x=scene('火焰冲击'),actorTemplates=structuredClone(x.root.actors);
 x.root.actors=Object.fromEntries(Object.entries(x.root.actors).map(([id,a])=>[id,{name:a.name,state:a.state}]));
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice,actorTemplates});assert.equal(out.actors.player.state.resources['测试魔力'].current,19);assert.equal(out.actors.player.combatProfile,undefined);assert.ok(out.result.targets[0].steps.some(x=>x.op==='save'));
});
test('failed concentration loses the declared cast cost but cannot replace rolled successes with fixed autos',()=>{
 const x=scene('魔法飞弹');x.root.actors.player.state.statuses=[{type:'耳鸣',points:2,source:'test'}];x.root.actors.player.state.attributeAuto.意志=100;
 const before=structuredClone(x.root.actors.huang.state.health),out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.concentrationFailure,true);assert.equal(out.result.concentration.total,0);assert.equal(out.actors.player.state.resources['测试魔力'].current,19);assert.deepEqual(out.actors.huang.state.health,before);
});
test('a lower-tier recast retains the stronger same-source bonus and refreshes its duration',()=>{
 const x=scene('侦测潜行','C');x.root.actors.player.state.learnedResources[x.id].versions=['D','C'];x.plan.targetIds=['player'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});advanceTime(out.actors.player,1);
 out.ruleScene.objects.spell.plans.use.grade='D';out=reduceRuleAction(out,x.q,{drawDice:dice});
 const effect=out.actors.player.state.activeResourceEffects[0];assert.equal(effect.effects[0].value,24);assert.equal(effect.remainingMinutes,40);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,16);
});
test('resisted statuses preserve source actor and explicit stacking instead of losing the source rule',()=>{
 let s=createOpeningRoster().huang.state;
 for(let i=0;i<2;i++)s=applyStatus(s,{type:'恐惧',source:'test',sourceActorId:'player',points:2,properties:{stacking:'add',scene:true},dice:Array(200).fill(1)}).state;
 assert.equal(statusLevel(s,'恐惧').points,4);assert.equal(s.statuses[0].sourceActorId,'player');assert.equal(s.statuses[0].scene,true);
});
test('field elapsed time resolves corrosion before expiry and cannot postpone its ten ticks into later combat',()=>{
 const x=scene('腐蚀术'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
 target.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
 target.state.activeResourceEffects=[{id:'brief-shield',sourceId:'test',remainingMinutes:.1,effects:[{stat:'absorb',value:1}]}];
 advanceTime(target,2,[],{drawDice:dice});assert.equal(target.state.health.L,9);assert.equal(Object.keys(target.state.resourceTriggers).length,0);
 assert.deepEqual(fireResourceTriggers(out,'huang','turnStart',{drawDice:dice}),[]);
});
test('a healing spell respects natural-only wounds and spends four healing points for a wound treated as aggravated',()=>{
 const x=scene('疗伤'),target=x.root.actors.huang;
 target.state.health.L=3;target.state.health.intact-=3;target.recoveryLocks=[{severity:'L',count:1,recovery:'naturalOnly'},{severity:'L',count:1,recovery:'aggravated'}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(out.actors.huang.state.health.L,1);
 assert.deepEqual(out.actors.huang.recoveryLocks,[{severity:'L',count:1,recovery:'naturalOnly'}]);
});

test('magic blast repeats independent attacks at C, including the same target, without energy-weapon conversion',()=>{
 for(const grade of ['D','C']){
  const x=scene('魔能爆',grade);x.plan.targetIds=grade==='C'?['huang','huang']:['huang'];
  x.root.actors.huang.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
  assert.equal(out.result.targets.length,grade==='C'?2:1);
  assert.ok(out.result.targets.every(t=>t.steps.find(s=>s.op==='attack').weapon===(grade==='C'?15:7)));
  assert.equal(out.actors.player.state.resources['测试魔力'].current,grade==='C'?17:19);
  assert.equal(out.actors.huang.state.health.A,x.root.actors.huang.state.health.A);
 }
 const x=scene('魔能爆','C'),before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/目标次数/);assert.deepEqual(x.root,before);
});
test('searing pain chooses pain or hatred from actual inflicted damage and a separate will save',()=>{
 for(const chosenStatus of ['剧痛','仇恨']){
  const x=scene('灼热之痛');x.plan.inputs={chosenStatus};let rolls=0;
  const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++rolls===1?dice():Array(200).fill(1)});
  const steps=out.result.targets[0].steps,damage=steps.find(s=>s.op==='damage').actualDamage;
  assert.ok(damage>0);assert.equal(out.actors.huang.state.statuses.find(s=>s.type===chosenStatus).points,damage);
  assert.equal(rolls,2);
 }
 const x=scene('灼热之痛');x.plan.inputs={chosenStatus:'冻结'};
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/chosenStatus/);
});
test('selected-target fire spell charges once; two-ball fire spell charges each and requires free hands',()=>{
 const many=scene('惹事人烈焰','C');many.plan.targetIds=['huang','jiang'];
 const out=reduceRuleAction(many.root,many.q,{drawDice:dice});assert.equal(out.result.targets.length,2);assert.equal(out.result.cost,3);
 for(const n of [1,2]){
  const x=scene('茜卓的旋炎咒','C');x.plan.targetIds=Array(n).fill('huang');x.plan.components.freeHands=2;
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(out.result.targets.length,n);assert.equal(out.result.cost,3*n);
 }
 const x=scene('茜卓的旋炎咒','C');x.plan.targetIds=['huang','huang'];x.plan.components.freeHands=1;
 const before=structuredClone(x.root);assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/双手/);assert.deepEqual(x.root,before);
});
test('fear howl applies only to enemy area targets and never grants fear spell ownership',()=>{
 const x=scene('恐惧嚎叫','C');x.plan.targetIds=['huang'];x.plan.areaComplete=true;x.root.actors.huang.team='enemy';let rolls=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++rolls===1?dice():Array(200).fill(1)});
 const fear=out.actors.huang.state.statuses.find(s=>s.type==='恐惧');assert.ok(fear.points>0&&fear.points<=18);assert.equal(fear.decayPerRound,1);
 assert.deepEqual(Object.keys(out.actors.player.state.learnedResources),[x.id]);assert.equal(out.actors.player.state.statuses.length,0);
});
test('enemy area selection filters allies and requires actual allegiance before payment',()=>{
 const x=scene('恐惧嚎叫','C');x.plan.targetIds=['huang','player'];x.plan.areaComplete=true;
 x.root.actors.huang.team='enemy';x.root.actors.player.team='party';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.deepEqual(out.result.targets.map(t=>t.targetId),['huang']);
 assert.deepEqual(out.actors.player.state.statuses,[]);
 delete x.root.actors.huang.team;
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/敌我/);
 assert.equal(x.root.actors.player.state.resources['测试魔力'].current,20);
});
test('maintained spells end on wound unconsciousness or sleep even with no pending damage receipt',()=>{
 for(const condition of ['wounds','sleep']){
  const x=scene('吸取生命'),out=reduceRuleAction(x.root,x.q,{drawDice:dice});
  const s=out.actors.player.state;
  if(condition==='wounds')s.health={...s.health,intact:0,L:s.derived.hpMax,B:0,A:0,coma:false};
  else s.sleeping={source:'test'};
  const saved=JSON.parse(JSON.stringify(out));
  const results=settleResourceConcentration(saved,saved,()=>{throw Error('unconscious targets cannot roll to preserve focus');});
  assert.deepEqual(saved.actors.player.state.resourceChannels,{});assert.equal(results[0].reason,'unconscious');
 }
});
test('bane requires a lost opposed save and penalizes actual attacks and saves with no ordinary skill penalty',()=>{
 const x=scene('灾祸术');let rolls=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++rolls===1?dice():Array(200).fill(1)});
 assert.equal(out.actors.huang.state.activeResourceEffects[0].effects[0].value,-6);
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 const normalAttack=attackProfile(b,'huang',{targetId:'player'}).rawDP,normalSave=saveProfile(b.actors.huang,'will').dp;
 b.actors.huang.state=out.actors.huang.state;
 assert.equal(attackProfile(b,'huang',{targetId:'player'}).rawDP,normalAttack-6);
 assert.equal(saveProfile(b.actors.huang,'will').dp,normalSave-6);
 const before=check(x.root.actors.huang.state,{attribute:'力量',skill:'运动',dice:dice()});
 assert.equal(check(out.actors.huang.state,{attribute:'力量',skill:'运动',dice:dice()}).dp,before.dp);
 rolls=0;const resisted=reduceRuleAction(x.root,x.q,{drawDice:()=>++rolls===1?Array(200).fill(1):dice()});
 assert.equal(resisted.actors.huang.state.activeResourceEffects?.length??0,0);
 const tied=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(resourceBonus(tied.actors.huang.state,'attack'),-6); // active wins ties under casting rules
});

test('attack penalties from declared effects also enter spell attack rolls',()=>{
 const x=scene('火球术（射弹）');const clean=reduceRuleAction(x.root,x.q,{drawDice:dice});
 x.root.actors.player.state.activeResourceEffects=[{id:'bane',sourceId:'test',effects:[{stat:'attack',value:-6,group:'luck'}]}];
 const cursed=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(cursed.result.targets[0].steps[0].roll.dp,clean.result.targets[0].steps[0].roll.dp-6);
});

function spatial(x){
 x.root.ruleScene.spatial={source,actors:Object.fromEntries(Object.keys(x.root.actors).map(id=>[id,{position:[0,0],team:id==='bright'?'enemy':'party'}]))};
 return x.root.ruleScene.spatial;
}
const fieldCheck={kind:'rule',action:'check',actorId:'player',attribute:'力量',dc:1};
test('blessing follows the caster, dynamically admits allies, suspends on exit, and survives a saved-state round trip',()=>{
 const x=scene('祝福术'),positions=spatial(x);positions.actors.huang.position=[61,0];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.player.state,'attack'),6);assert.equal(resourceBonus(out.actors.jiang.state,'save'),6);
 assert.equal(resourceBonus(out.actors.huang.state,'attack'),0);assert.equal(resourceBonus(out.actors.bright.state,'attack'),0);
 out=JSON.parse(JSON.stringify(out));out.ruleScene.spatial.actors.huang.position=[59,0];
 out=reduceRuleAction(out,fieldCheck,{drawDice:dice});assert.equal(resourceBonus(out.actors.huang.state,'attack'),6);
 out.ruleScene.spatial.actors.player.position=[200,0];out=reduceRuleAction(out,fieldCheck,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.huang.state,'attack'),0);assert.equal(resourceBonus(out.actors.player.state,'attack'),6);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
});
test('arcane brilliance retains the selected recipients and cast-time radius without recursive intelligence expansion',()=>{
 const x=scene('奥术光辉'),positions=spatial(x);x.plan.targetIds=['player','huang'];positions.actors.huang.position=[59,0];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(effectiveAttribute(out.actors.player.state,'智力'),8);assert.equal(effectiveAttribute(out.actors.huang.state,'智力'),6);
 assert.equal(effectiveAttribute(out.actors.jiang.state,'智力'),2);
 out.ruleScene.spatial.actors.huang.position=[100,0];out=reduceRuleAction(out,fieldCheck,{drawDice:dice});
 assert.equal(effectiveAttribute(out.actors.huang.state,'智力'),2);
 out.ruleScene.spatial.actors.huang.position=[1,0];out=reduceRuleAction(out,fieldCheck,{drawDice:dice});
 assert.equal(effectiveAttribute(out.actors.huang.state,'智力'),6);
});
test('suppressing aura affects enemies only and refuses unknown field positions without charging',()=>{
 const x=scene('抑制鼓动','C'),before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/位置/);assert.deepEqual(x.root,before);
 spatial(x);const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.bright.state,'attack'),-24);assert.equal(resourceBonus(out.actors.huang.state,'attack'),0);
});

test('combat movement refreshes aura membership immediately, and scene expiry removes its projections',()=>{
 const x=scene('祝福术');let b=createOpeningEncounter({participants:['player','huang','bright'],positions:{player:[0,0],huang:[59,0],bright:[100,0]}});
 b.ruleScene=x.root.ruleScene;b.actors.player.state=x.root.actors.player.state;b.actors.player.state=beginTurn(b.actors.player.state).state;
 b.actors.player.team=b.actors.huang.team='party';b.actors.bright.team='enemy';b.activeId='player';b.playerDefenseDeclarations=false;b.reactionWindows=false;
 b=act(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(resourceBonus(b.actors.huang.state,'attack'),6);
 b.activeId='huang';b.actors.huang.state=beginTurn(b.actors.huang.state).state;
 b=act(b,{actorId:'huang',abilityId:'move',to:[61,0]},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(resourceBonus(b.actors.huang.state,'attack'),0);
 expireResourceEffects(b.actors.player.state,{scene:true});
 b.actors.huang.state=beginTurn(b.actors.huang.state).state;
 b=act(b,{actorId:'huang',abilityId:'move',to:[59,0]},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(resourceBonus(b.actors.huang.state,'attack'),0);assert.equal(resourceBonus(b.actors.player.state,'attack'),0);
});

test('life drain maintains with a standard action but no repeated mana, healing only actual damage',()=>{
 const x=scene('吸取生命');x.root.actors.player.state.health.L=3;x.root.actors.player.state.health.intact-=3;
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.player.state.health.L,0);assert.equal(out.result.cost,1);
 assert.ok(out.actors.player.state.resourceChannels[x.id]);
 out=reduceRuleAction(out,{...x.q,operation:'maintain'},{drawDice:dice});
 assert.equal(out.result.cost,0);assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
 const blocked=scene('吸取生命');blocked.root.actors.player.state.health.L=3;blocked.root.actors.player.state.health.intact-=3;
 blocked.root.actors.huang.state.activeResourceEffects=[{sourceId:'shield',effects:[{stat:'energyResistance',value:3}]}];
 const noDamage=reduceRuleAction(blocked.root,blocked.q,{drawDice:dice});assert.equal(noDamage.actors.player.state.health.L,3);
 const far=JSON.parse(JSON.stringify(out));far.ruleScene.objects.spell.plans.use.distance=1000;
 assert.throws(()=>reduceRuleAction(far,{...x.q,operation:'maintain'},{drawDice:dice}),/距离/);
});
test('maintained fire and ice areas consume mana only when first cast, and release removes the instance',()=>{
 for(const name of ['冰雾神域','炽炎神域']){
  const x=scene(name,'C');x.plan.areaComplete=true;x.plan.centerDistance=1;
  let out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
  assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
  out=reduceRuleAction(out,{...x.q,operation:'maintain'},{drawDice:()=>Array(200).fill(1)});
  assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
  assert.equal(out.actors.huang.state.statuses.find(s=>s.type===(name==='冰雾神域'?'冻结':'燃烧')).points,6);
  out=reduceRuleAction(out,{...x.q,operation:'release'},{drawDice:dice});assert.equal(out.actors.player.state.resourceChannels[x.id],undefined);
  assert.throws(()=>reduceRuleAction(out,{...x.q,operation:'maintain'},{drawDice:dice}),/维持/);
 }
});

test('new adverse status breaks failed concentration without using automatic successes or refunding mana',()=>{
 const x=scene('吸取生命');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 out.actors.player.state.attributeAuto.意志=100;out.actors.player.state.attributeAuto.力量=100;
 out.ruleScene.events={noise:{type:'statusApply',source,actorIds:['player'],status:{type:'耳鸣',points:1}}};
 out=reduceRuleAction(out,{kind:'rule',action:'status_event',actorId:'player',eventId:'noise'},{drawDice:()=>Array(200).fill(1)});
 assert.equal(Object.keys(out.actors.player.state.resourceChannels).length,0);
 assert.equal(out.result.concentration[0].total,0);assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
});
test('damage concentration evidence persists and is resolved before another action',()=>{
 const x=scene('吸取生命');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 damageEvent(out.actors.player,[{amount:2,severity:'L',kind:'energy',energyType:'mental'}],false,{damage:[]});
 out=JSON.parse(JSON.stringify(out));assert.deepEqual(out.actors.player.state.resourceConcentration,[2]);
 out=reduceRuleAction(out,fieldCheck,{drawDice:()=>Array(200).fill(1)});
 assert.equal(Object.keys(out.actors.player.state.resourceChannels).length,0);assert.equal(out.result.concentration[0].success,false);
});
test('a maintained spell cannot use a second standard action and stops when its next turn skips maintenance',()=>{
 const x=scene('吸取生命');let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.ruleScene=x.root.ruleScene;b.actors.player.state=beginTurn(x.root.actors.player.state).state;
 b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='player';b.playerDefenseDeclarations=false;b.reactionWindows=false;
 const cast={actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'};
 b=act(b,cast,{playerAuthorized:true,drawDice:dice}).battle;
 const before=structuredClone(b);assert.throws(()=>act(b,{...cast,operation:'maintain'},{playerAuthorized:true,drawDice:dice}));assert.deepEqual(b,before);
 b.round++;b.actors.player.state=beginTurn(b.actors.player.state).state;
 b=act(b,{actorId:'player',abilityId:'end'},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(b.actors.player.state.resourceChannels[x.id],undefined);assert.equal(b.actors.player.state.resources['测试魔力'].current,19);
});

test('Thoth chant binds its chosen main skill, including later casting checks, without granting ranks',()=>{
 const x=scene('透特之咏');x.plan.inputs={chosenSkill:'神秘'};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),before=x.root.actors.player.state,after=out.actors.player.state;
 for(const [skill,bonus]of [['神秘',9],['学识',0]])assert.equal(check(after,{attribute:'智力',skill,dice:dice()}).dp,check(before,{attribute:'智力',skill,dice:dice()}).dp+bonus);
 assert.deepEqual(after.skills,before.skills);
});
test('fel armor ignores temporary power and cannot recast any tier while active',()=>{
 const x=scene('邪甲术');x.root.actors.player.state.activeResourceEffects=[{sourceId:'temporaryPower',effects:[{stat:'spellPower',value:99}]}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),effect=out.actors.player.state.activeResourceEffects.find(e=>e.sourceId===x.id);
 assert.equal(effect.effects.find(e=>e.stat==='spellPower').value,1);assert.equal(effect.effects.find(e=>e.stat==='defense').value,2);
 out.actors.player.state.casting.imperial.grade='C';out.actors.player.state.learnedResources[x.id].versions=['D','C'];out.ruleScene.objects.spell.plans.use.grade='C';
 const before=structuredClone(out);assert.throws(()=>reduceRuleAction(out,x.q,{drawDice:dice}),/生效期间/);assert.deepEqual(out,before);
});
test('typed energy resistance filters damage and universal resistance shares one allowance across segments',()=>{
 for(const chosenEnergy of ['fire','all']){
  const x=scene('抵抗能量伤害','C');x.plan.targetIds=['player'];x.plan.inputs={chosenEnergy};
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
  a.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
  const segments=chosenEnergy==='fire'?[{amount:30,energyType:'fire'},{amount:5,energyType:'cold'}]:[{amount:5,energyType:'fire'},{amount:5,energyType:'cold'}];
  const damage=damageEvent(a,segments.map(s=>({...s,severity:'L',kind:'energy'})),false,{damage:[]});
  assert.equal(damage,chosenEnergy==='fire'?11:4);
 }
});
test('non-willing contact effects require a touch hit and still pay for a miss',()=>{
 const x=scene('抵抗能量伤害','C');x.plan.inputs={chosenEnergy:'fire'};x.plan.willingTargets=[];
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.targets[0].steps[0].op,'contact');assert.equal(out.result.targets[0].steps[0].hit,false);
 assert.equal(out.actors.huang.state.activeResourceEffects?.length??0,0);assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
});

test('dispel requires the recipient choice and ends linked timed components across reload without removing ownership',()=>{
 const x=scene('驱魔'),s=x.root.actors.huang.state;
 const meta={sourceId:'actual-spell',casterId:'jiang',version:'saved',grade:'C',scene:true};
 s.activeResourceEffects=[{...meta,id:'armor',effects:[{stat:'armor',value:2}]}];
 s.resourceTriggers={heal:{...meta,event:'turnStart',steps:[]}};
 s.learnedResources={'actual-spell':{learned:true,source}};
 const choice=timedResourceInstances(x.root,'huang')[0];
 x.plan.effectChoice={id:choice.id,chosenBy:'player',source};
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/受术者自行选择/);
 x.plan.effectChoice.chosenBy='huang';
 const out=reduceRuleAction(JSON.parse(JSON.stringify(x.root)),x.q,{drawDice:dice});
 assert.equal(out.actors.huang.state.activeResourceEffects.length,0);
 assert.deepEqual(out.actors.huang.state.resourceTriggers,{});
 assert.equal(out.actors.huang.state.learnedResources['actual-spell'].learned,true);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
 s.activeResourceEffects[0].grade='B';s.resourceTriggers.heal.grade='B';
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/等级超过/);
 delete s.activeResourceEffects[0].grade;
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/施放时等级/);
});
test('dispel of one aura recipient survives refresh and reload, preserving other recipients until a paid recast',()=>{
 const x=scene('天使之障壁');spatial(x);x.plan.targetIds=['player','huang','jiang'];
 x.plan.inputs={temporaryAllocation:{player:6,huang:6,jiang:6}};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const d=scene('驱魔');Object.assign(out.actors.player.state.learnedResources,d.root.actors.player.state.learnedResources);
 out.ruleScene.objects.dispel={...d.root.ruleScene.objects.spell};
 const id=timedResourceInstances(out,'huang').find(x=>x.auraId).id;
 out.ruleScene.objects.dispel.plans.use.effectChoice={id,chosenBy:'huang',source};
 out=reduceRuleAction(out,{...d.q,objectId:'dispel'},{drawDice:dice});
 assert.equal(out.actors.huang.state.health.temp,0);assert.equal(out.actors.jiang.state.health.temp,6);
 out=reduceRuleAction(JSON.parse(JSON.stringify(out)),fieldCheck,{drawDice:dice});
 assert.equal(out.actors.huang.state.health.temp,0);
 delete out.actors.player.state.resourceCooldowns[x.id];out=reduceRuleAction(out,x.q,{drawDice:dice});
 assert.equal(out.actors.huang.state.health.temp,6);
});
test('burnout consumes only the selected removable burning source after adding all its points',()=>{
 const x=scene('燃尽','C'),s=x.root.actors.huang.state;
 s.statuses=[{type:'燃烧',source:'fire',sourceActorId:'player',points:2},{type:'燃烧',source:'fire',sourceActorId:'player',points:3},
  {type:'燃烧',source:'fire',sourceActorId:'player',points:4,removable:false},{type:'燃烧',source:'fire',sourceActorId:'jiang',points:6}];
 x.plan.statusSource={source:'fire',sourceActorId:'player'};
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 const steps=out.result.targets[0].steps;
 assert.equal(steps.find(x=>x.op==='statusSource').points,5);
 assert.equal(steps.find(x=>x.op==='consumeStatusSource').removed,5);
 assert.equal(steps.find(x=>x.op==='damage').actualDamage,17);
 assert.deepEqual(out.actors.huang.state.statuses.map(x=>x.points),[4,6]);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 const noChoice=structuredClone(x.root);delete noChoice.ruleScene.objects.spell.plans.use.statusSource;
 assert.equal(reduceRuleAction(noChoice,x.q,{drawDice:()=>Array(200).fill(1)}).result.targets[0].steps.find(x=>x.op==='statusSource').points,0);
});
test('humanoid charm uses sourced target facts, hostility and spell grade immunity without a second save',()=>{
 for(const [hostile,points]of [[false,9],[true,6]]){
  const x=scene('魅惑人类');x.plan.targetFacts={huang:{source,humanoid:true,hostile}};
  const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
  assert.equal(out.actors.huang.state.statuses.find(s=>s.source===x.id).points,points);
  x.plan.targetFacts.huang.humanoid=false;assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/类人生物/);
  x.plan.targetFacts.huang.humanoid=true;
  x.root.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',level:2,source:'actual',scene:true}};
  assert.equal(reduceRuleAction(x.root,x.q,{drawDice:dice}).result.targets[0].immune,'mind');
  delete x.plan.targetFacts;assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/目标资格事实/);
 }
});
test('spell empowerment locks the actual recipient against same-name recasts and ignores temporary power for itself',()=>{
 const x=scene('法术增效','C');x.plan.willingTargets=['huang'];
 x.root.actors.player.state.activeResourceEffects=[{id:'boost',sourceId:'test',scene:true,effects:[{stat:'spellPower',value:2,group:'boost'}]}];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.huang.state,'spellPower'),2);
 const active=structuredClone(out.actors.huang.state.activeResourceEffects);
 out=reduceRuleAction(JSON.parse(JSON.stringify(out)),x.q,{drawDice:dice});
 assert.equal(out.result.targets[0].ineffective,'same-source-active');
 assert.deepEqual(out.actors.huang.state.activeResourceEffects,active);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,14);
 out.ruleScene.objects.spell.plans.use.targetIds=['jiang'];out.ruleScene.objects.spell.plans.use.willingTargets=['jiang'];
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(resourceBonus(out.actors.jiang.state,'spellPower'),2);
});
test('weaker recasts that retain stronger values also retain the stronger saved grade for dispelling',()=>{
 const x=scene('侦测潜行','C');x.plan.targetIds=['huang'];
 x.root.actors.player.state.learnedResources[x.id].versions=['C','D'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const old=structuredClone(out.actors.huang.state.activeResourceEffects[0]);
 out.ruleScene.objects.spell.plans.use.grade='D';
 out=reduceRuleAction(out,x.q,{drawDice:dice});
 const active=out.actors.huang.state.activeResourceEffects[0];
 assert.equal(active.effects[0].value,old.effects[0].value);assert.equal(active.grade,'C');
 assert.equal(timedResourceInstances(out,'huang')[0].level,2);
});
test('spell suppression combines typed immunities and blocks zero-power new casts without rewriting existing effects',()=>{
 for(const [types,expected]of [[[],-4],[['transformation'],-2],[['curse'],-2],[['transformation','curse'],0]]){
  const x=scene('法术抑制','C');x.plan.targetIds=['player'];
  x.root.actors.player.state.resourceCapabilities=Object.fromEntries(types.map(t=>[t,{id:t+'Immunity',source:'actual',level:2,scene:true}]));
  x.root.actors.player.state.activeResourceEffects=[{id:'existing',sourceId:'savedSpell',casterId:'player',grade:'D',scene:true,effects:[{stat:'check',value:7,group:'saved'}]}];
  const old=structuredClone(x.root.actors.player.state.activeResourceEffects[0]);
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(resourceBonus(out.actors.player.state,'spellPower'),expected);
  assert.deepEqual(out.actors.player.state.activeResourceEffects.find(e=>e.id==='existing'),old);
  if(expected===-4){
   const missile=scene('魔法飞弹');Object.assign(out.actors.player.state.learnedResources,missile.root.actors.player.state.learnedResources);
   out.ruleScene.objects.missile=missile.root.ruleScene.objects.spell;
   assert.throws(()=>reduceRuleAction(out,{...missile.q,objectId:'missile'},{drawDice:dice}),/有效威力/);
   assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
   const boost=scene('法术增效','C');Object.assign(out.actors.player.state.learnedResources,boost.root.actors.player.state.learnedResources);
   out.ruleScene.objects.boost=boost.root.ruleScene.objects.spell;out.ruleScene.objects.boost.plans.use.willingTargets=['huang'];
   const boosted=reduceRuleAction(out,{...boost.q,objectId:'boost'},{drawDice:dice});
   assert.equal(boosted.result.targets[0].effectivePower,2);
  }
 }
});

test('physical shield reflex casting uses tiered will cost and one reaction lock without assuming discharge',()=>{
 for(const [rank,cost,will,absorb]of [['D',1,2,2],['C',3,4,4]]){
  const x=scene('物理盾',rank);x.plan.operations=['castReflex'];
  const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
  b.ruleScene=x.root.ruleScene;b.actors.player.state=x.root.actors.player.state;b.activeId='huang';
  b.actors.player.state.will={current:10,max:10};b.actors.player.combatProfile.willOverride=10;
  const out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'castReflex',part:'use'},{playerAuthorized:true,drawDice:dice});
  const state=out.battle.actors.player.state;
  assert.equal(state.will.current,10-will);assert.equal(state.resources['测试魔力'].current,20-cost);
  assert.equal(state.turn.reactionLock,true);assert.equal(resourceBonus(state,'absorb'),absorb);
 }
});
test('morningstar cloak applies actual immunity and absorption without creating armor, and an unwilling contact must hit',()=>{
 const x=scene('晨星斗篷','C');x.plan.willingTargets=['huang'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.huang;
 assert.equal(damageEvent(a,[{amount:100,severity:'A',kind:'physical',magical:false}],false,{damage:[]}),0);
 assert.equal(damageEvent(a,[{amount:6,severity:'L',kind:'energy',energyType:'fire',magical:true}],false,{damage:[]}),4);
 assert.deepEqual(equipment(a).armor,equipment(x.root.actors.huang).armor);
 x.plan.willingTargets=[];x.root.actors.player.state.skills.神秘={level:0,subs:{}};
 out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.targets[0].steps[0].op,'contact');assert.equal(out.result.targets[0].steps[0].hit,false);
 assert.equal(Object.values(out.actors.huang.state.resourceCapabilities??{}).some(c=>c.id==='nonmagicalDamageImmunity'),false);
});
test('next-melee spell is consumed on a miss and still deals its separate energy when physical damage is absorbed',()=>{
 for(const miss of [true,false]){
  const x=scene('炽焰斩'),cast=reduceRuleAction(x.root,x.q,{drawDice:dice});
  const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
  b.actors.player.state=cast.actors.player.state;b.activeId='player';b.playerDefenseDeclarations=false;b.reactionWindows=false;
  b.actors.player.state.turn={...b.actors.player.state.turn,phase:'active',standard:1,move:1,swift:0};
  b.actors.huang.equipment={...equipment(b.actors.huang),armor:{...equipment(b.actors.huang).armor,dr:100,defenseExtra:miss?999:0}};
  const out=act(b,{actorId:'player',abilityId:'strike',targetId:'huang'},{playerAuthorized:true,drawDice:dice});
  assert.equal(Object.keys(out.battle.actors.player.state.resourceTriggers).length,0);
  assert.equal(out.result.damage.reduce((n,r)=>n+r.actualDamage,0),0);
  assert.equal(out.result.resourceTriggers[0].damage.reduce((n,r)=>n+r.actualDamage,0),miss?0:3);
 }
});
test('dread strike spends its rider once, saves after actual damage, and persists next-turn action loss',()=>{
 for(const immune of [false,true]){
  const x=scene('惊惧斩','C');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
  const target=out.actors.huang;
  target.state.turn={phase:'ready',move:0,standard:0,swift:0};
  if(immune)target.state.resourceCapabilities={mind:{id:'mindImmunity',level:2,source:'actual',scene:true}};
  const fired=fireResourceTriggers(out,'player','attackResolved',{targetId:'huang',context:{melee:true,skill:'白刃',hit:true},drawDice:()=>Array(200).fill(1)});
  assert.equal(Object.keys(out.actors.player.state.resourceTriggers).length,0);
  if(immune){assert.equal(fired[0].immune,'mind');assert.equal(target.state.resourceActionLosses,undefined);continue;}
  assert.equal(fired[0].damage.reduce((n,d)=>n+d.actualDamage,0),6);
  assert.equal(target.state.resourceActionLosses[0].sourceId,x.id);
  const restored=beginTurn(JSON.parse(JSON.stringify(target.state))).state;
  assert.equal(restored.turn.move,0);assert.equal(restored.turn.standard,1);
 }
});
test('dispel ends a sourced timed status without deleting permanent consequences or unrelated status rows',()=>{
 const x=scene('驱魔'),s=x.root.actors.huang.state;
 s.statuses=[{type:'疲乏',points:3,scene:true,source:'actual-curse',sourceActorId:'jiang',grade:'D',sourceVersion:'saved'},
 {type:'剧痛',points:2,source:'wound',sourceActorId:'player',grade:'D'}];
 s.permanentConditions=[{kind:'blind',source:'actual-curse'}];
 const choice=timedResourceInstances(x.root,'huang').find(x=>x.sourceId==='actual-curse');
 x.plan.effectChoice={id:choice.id,chosenBy:'huang',source};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.deepEqual(out.actors.huang.state.statuses,[s.statuses[1]]);
 assert.deepEqual(out.actors.huang.state.permanentConditions,s.permanentConditions);
 s.statuses[0].removable=false;
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/不能移除/);
});
test('recompense reacts once to enemy actual life loss, excludes friendly/environmental/absorbed damage and cannot reflect reflection',()=>{
 for(const kind of ['enemy','friendly','environment','absorbed']){
  const x=scene('报偿','C');x.root.actors.player.team='party';x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.huang,enemy=out.actors.jiang;
  enemy.state.resourceTriggers=structuredClone(a.state.resourceTriggers);
  if(kind==='absorbed')a.state.health.temp=20;
  const before=structuredClone(enemy.state.health),player=structuredClone(out.actors.player.state.health),result={damage:[]};
  damageEvent(a,[{amount:2,severity:'L',kind:'physical'},{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},
   {root:out,targetId:'huang',sourceActorId:kind==='environment'?null:kind==='friendly'?'player':'jiang',drawDice:dice});
  if(kind==='enemy'){
   assert.equal(result.resourceTriggers.length,1);
   assert.equal(result.resourceTriggers[0].damage.reduce((n,r)=>n+r.actualDamage,0),6);
   assert.notDeepEqual(enemy.state.health,before);
  }else{assert.deepEqual(enemy.state.health,before);assert.equal(result.resourceTriggers?.length??0,0);}
  assert.deepEqual(out.actors.player.state.health,player);
 }
});
test('a real spell damage operation carries its actual caster into sourced retaliation',()=>{
 const x=scene('报偿','C');x.root.actors.player.team='party';x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const missile=scene('魔法飞弹');out.actors.jiang.state=missile.root.actors.player.state;
 out.ruleScene.objects.enemySpell=missile.root.ruleScene.objects.spell;out.ruleScene.objects.enemySpell.actorIds=['jiang'];
 out=reduceRuleAction(out,{...missile.q,actorId:'jiang',objectId:'enemySpell'},{drawDice:dice});
 assert.equal(out.result.resourceTriggers[0].damage.reduce((n,r)=>n+r.actualDamage,0),6);
 assert.equal(out.actors.jiang.state.resources['测试魔力'].current,19);
});
test('recompense uses the shared original-event budget across additional segments, and a new event can trigger again',()=>{
 const x=scene('报偿','C');x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]},budget={conversion:0};
 const event={root:out,sourceActorId:'jiang',targetId:'huang',drawDice:dice};
 for(let i=0;i<2;i++)damageEvent(out.actors.huang,[{amount:1,severity:'B',kind:'physical'}],false,result,budget,event);
 assert.equal(result.resourceTriggers.length,1);
 damageEvent(out.actors.huang,[{amount:1,severity:'B',kind:'physical'}],false,result,{conversion:0},event);
 assert.equal(result.resourceTriggers.length,2);
});

test('deferred damage reactions wait for all linked parts of the original event',()=>{
 const x=scene('报偿','C');x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]},budget={conversion:0};
 const event={root:out,sourceActorId:'jiang',targetId:'huang',drawDice:dice,deferReactions:true};
 for(let i=0;i<2;i++)damageEvent(out.actors.huang,[{amount:1,severity:'B',kind:'physical'}],false,result,budget,event);
 assert.equal(result.resourceTriggers,undefined);
 settleDamageReactions(result,budget);assert.equal(result.resourceTriggers.length,1);
 assert.equal(budget.pendingLifeLoss,undefined);
 settleDamageReactions(result,budget);assert.equal(result.resourceTriggers.length,1);
});
test('ordinary combat attack settles the protected target damage before the sourced retaliation',()=>{
 const x=scene('报偿','C');x.plan.targetIds=['player'];const cast=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.player.state=cast.actors.player.state;b.activeId='huang';b.playerDefenseDeclarations=false;b.reactionWindows=false;
 b.actors.player.team='party';b.actors.huang.team='enemy';b.actors.huang.sheathed=false;
 b.actors.huang.state.turn={phase:'active',standard:1,move:1,swift:1};
 const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{playerAuthorized:true,drawDice:dice});
 assert.ok(out.result.damage.some(d=>d.targetId==='player'&&d.actualDamage>0));
 const reflected=out.result.resourceTriggers.find(t=>t.sourceId===x.id);
 assert.equal(reflected.targetId,'huang');assert.equal(reflected.damage.reduce((n,d)=>n+d.actualDamage,0),6);
});
test('explicit independent damage types each apply full resistance and emit their own life-loss event',()=>{
 const resist=scene('抵抗能量伤害','C');resist.plan.targetIds=['player'];resist.plan.inputs={chosenEnergy:'all'};
 const guarded=reduceRuleAction(resist.root,resist.q,{drawDice:dice});
 assert.equal(damageEvent(guarded.actors.player,[{amount:5,severity:'L',kind:'energy',energyType:'fire'},{amount:5,severity:'L',kind:'energy',energyType:'cold'}],false,{damage:[]},{conversion:0},{segmentMode:'independent-types'}),0);
 const x=scene('报偿','C');x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]};
 damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'fire'},{amount:1,severity:'L',kind:'energy',energyType:'cold'}],false,result,{conversion:0},
  {root:out,sourceActorId:'jiang',targetId:'huang',drawDice:dice,segmentMode:'independent-types'});
 assert.equal(result.resourceTriggers.length,2);
});
test('frailty curse uses an actual round budget across reload and recast, and never chains from fixed or extra damage',()=>{
 const x=scene('脆弱诅咒');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=1;
 out.actors.huang.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
 const hit=(root,nature='attack')=>{const result={damage:[]};damageEvent(root.actors.huang,[{amount:1,severity:'L',kind:'physical'}],false,result,{conversion:0},
  {root,targetId:'huang',sourceActorId:'jiang',damageNature:nature,drawDice:dice});return result;};
 assert.equal(hit(out).resourceTriggers[0].damage.reduce((n,d)=>n+d.actualDamage,0),3);
 out=JSON.parse(JSON.stringify(out));assert.equal(hit(out).resourceTriggers.length,1);
 assert.equal(hit(out).resourceTriggers.length,0);
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(hit(out).resourceTriggers.length,0);
 out.round=2;
 for(const kind of ['fixed','extra'])assert.equal(hit(out,kind).resourceTriggers.length,0);
 assert.equal(hit(out).resourceTriggers.length,1);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,18);
});

test('adopted cross-caster damage sources settle independently and migrate old policy without resetting quotas',()=>{
 const x=scene('脆弱诅咒');const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const target=out.actors.huang,s=target.state;out.round=1;s.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
 const hit=()=>{const result={damage:[]};damageEvent(target,[{amount:1,severity:'B',kind:'physical'}],false,result,{conversion:0},
  {root:out,targetId:'huang',sourceActorId:'jiang',damageNature:'attack',drawDice:dice});return result;};
 assert.equal(hit().resourceTriggers.length,1);
 const weak=structuredClone(Object.values(target.state.resourceTriggers)[0]);weak.casterId='bright';weak.variables.P=1;weak.quota.used=0;
 target.state.resourceTriggers.weak=weak;weak.sourcePolicy='pending-cross-caster';
 const both=hit();assert.equal(both.resourceTriggers.length,2);
 assert.deepEqual(both.resourceTriggers.map(t=>t.damage.reduce((n,d)=>n+d.actualDamage,0)),[3,1]);
 assert.equal(target.state.resourceTriggers.weak.quota.used,1);
 assert.equal(target.state.resourceTriggers.weak.sourcePolicy,'independent-casters');
 assert.equal(hit().resourceTriggers.length,1);assert.equal(hit().resourceTriggers.length,0);
 delete target.state.resourceTriggers.weak;
 delete out.round;const current=Object.values(target.state.resourceTriggers)[0];current.quota={...current.quota,used:2,round:'field/0'};
 assert.equal(hit().resourceTriggers.length,0);
 advanceSceneTime(out.ruleScene,.1);assert.equal(hit().resourceTriggers.length,1);
});
test('multiple independent damage subscriptions persist each quota even when an earlier subscription clones bearer state',()=>{
 const x=scene('脆弱诅咒');const out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=1;
 const target=out.actors.huang;target.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
 const first=Object.values(target.state.resourceTriggers)[0];first.quota.maximum=1;
 const second=structuredClone(first);second.sourceId='isolated-independent-source';second.stackGroup=second.sourceId;
 target.state.resourceTriggers.second=second;
 const result={damage:[]};damageEvent(target,[{amount:1,severity:'B',kind:'physical'}],false,result,{conversion:0},
  {root:out,targetId:'huang',sourceActorId:'jiang',damageNature:'attack',drawDice:dice});
 assert.equal(result.resourceTriggers.length,2);
 assert.deepEqual(Object.values(target.state.resourceTriggers).map(t=>t.quota.used),[1,1]);
});

test('dimensional anchor uses a ranged touch casting roll, spends on a miss and persists only on a hit',()=>{
 const x=scene('次元锚','C'),before=structuredClone(x.root);
 const miss=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(miss.actors.player.state.resources['测试魔力'].current,17);
 assert.equal(Object.values(miss.actors.huang.state.resourceCapabilities??{}).length,0);
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const attack=out.result.targets[0].steps.find(s=>s.op==='attack');assert.ok(attack.roll.total>0);assert.equal(attack.weapon,0);
 out=JSON.parse(JSON.stringify(out));const block=Object.values(out.actors.huang.state.resourceCapabilities).find(c=>c.id==='effectUseBlock:space');
 assert.equal(block.level,3);assert.equal(block.grade,'C');assert.equal(block.casterId,'player');assert.equal(block.scene,true);
 assert.equal(timedResourceInstances(out,'huang').find(t=>t.sourceId===x.id).level,2);
 assert.deepEqual(x.root,before);
 expireResourceEffects(out.actors.huang.state,{scene:true});assert.deepEqual(out.actors.huang.state.resourceCapabilities,{});
});
test('energy-only temporary health filters real damage types, preserves spent balances on reload, and uses the stronger remaining share on recast',()=>{
 const x=scene('防护能量结界');let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 assert.equal(a.state.health.temp,12);
 for(const [kind,energyType]of [['physical',undefined],['energy','mental'],['energy','force'],['energy','poison']]){
  assert.equal(damageEvent(a,[{amount:1,severity:'L',kind,energyType}],false,{damage:[]}),1);assert.equal(a.state.health.temp,12);
 }
 assert.equal(damageEvent(a,[{amount:5,severity:'L',kind:'energy',energyType:'fire'}],false,{damage:[]}),0);
 assert.equal(a.state.health.temp,7);
 out=JSON.parse(JSON.stringify(out));a=out.actors.player;
 assert.equal(damageEvent(a,[{amount:2,severity:'L',kind:'energy',energyType:'light'}],false,{damage:[]}),0);assert.equal(a.state.health.temp,5);
 // A stored former capacity does not resurrect its spent points on a weaker cast.
 const pool=Object.values(a.state.temporaryHealthPools)[0];pool.capacity=24;
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(out.actors.player.state.health.temp,12);
 expireResourceEffects(out.actors.player.state,{scene:true});assert.equal(out.actors.player.state.health.temp,0);
});
test('energy ward reflex cost follows base mana, including C six will, and keeps the normal reflex lock',()=>{
 for(const [grade,mana,will,capacity]of [['D',1,2,12],['C',3,6,24]]){
  const x=scene('防护能量结界',grade);x.plan.operations=['castReflex'];
  const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
  b.actors.player.state=x.root.actors.player.state;b.ruleScene=x.root.ruleScene;b.activeId='huang';b.actors.player.team='party';b.actors.huang.team='enemy';
  b.actors.player.state.will={current:20,max:20};b.actors.player.combatProfile.willOverride=20;
  const q={actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'castReflex',part:'use'};
  const out=act(b,q,{drawDice:dice,playerAuthorized:true}).battle;
  assert.equal(out.actors.player.state.resources['测试魔力'].current,20-mana);assert.equal(out.actors.player.state.will.current,20-will);assert.equal(out.actors.player.state.health.temp,capacity);
  assert.equal(out.actors.player.state.turn.reactionLock,true);
  assert.throws(()=>act(out,q,{drawDice:dice,playerAuthorized:true}),/Reaction locked/);
 }
});
test('RE all-energy resistance excludes mental, force, poison and physical damage without changing unrelated legacy profiles',()=>{
 const x=scene('抵抗能量伤害','C');x.plan.targetIds=['player'];x.plan.inputs={chosenEnergy:'all'};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 for(const [kind,energyType]of [['physical',undefined],['energy','mental'],['energy','force'],['energy','poison']])assert.equal(damageEvent(a,[{amount:2,severity:'L',kind,energyType}],false,{damage:[]}),2);
 assert.equal(damageEvent(a,[{amount:2,severity:'L',kind:'energy',energyType:'light'}],false,{damage:[]}),0);
 for(const invalid of ['mental','force','poison']){x.plan.inputs.chosenEnergy=invalid;assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/chosenEnergy/);}
});
test('mage armor uses the armor maximum and one most favorable fallback per attack, without multiplying sources or granting damage protection',()=>{
 const x=scene('法师护甲');x.plan.targetIds=['player'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 a.kind='test';a.buffs={};a.combatProfile={main:'白刃',natural:0,equipment:{weapon:{damage:1},armor:{defense:2}}};
 const b={actors:out.actors};
 let d=resolveDefense(b,'player','huang');assert.equal(d.parts.armor,6);assert.equal(d.parts.force??0,0);assert.equal(d.resourceAlternative,undefined);
 a.combatProfile.equipment.armor.defense=10;
 d=resolveDefense(b,'player','huang');assert.equal(d.parts.armor,10);assert.equal(d.parts.force,6);assert.equal(d.resourceAlternative.stat,'defense');
 a.state.activeResourceEffects.push({sourceId:'actual-force',effects:[{stat:'defense',value:8,group:'force'}]});
 d=resolveDefense(b,'player','huang',{ap:6});assert.equal(d.parts.armor,10);assert.equal(d.parts.force,8);assert.equal(d.resourceAlternative.stat,'ignoreAP');
 const active=a.state.activeResourceEffects.find(e=>e.sourceId===x.id);a.state.activeResourceEffects.push({...structuredClone(active),id:'second-caster',casterId:'jiang'});
 const same=resolveDefense(b,'player','huang',{ap:6});assert.equal(same.total,d.total);assert.equal(same.remainingAP,0);
 assert.equal(resourceBonus(a.state,'dr'),0);assert.equal(resourceBonus(a.state,'hardness'),0);
 expireResourceEffects(a.state,{minutes:effectiveAttribute(x.root.actors.player.state,'智力')*60});
 d=resolveDefense(b,'player','huang',{ap:6});assert.equal(d.parts.force,2);assert.equal(d.resourceAlternative,undefined);
});
test('mage armor non-willing touch misses still cost mana and a restriction on space does not prevent unrelated spells',()=>{
 const x=scene('法师护甲');x.plan.willingTargets=[];
 x.root.actors.player.state.resourceCapabilities={anchor:{id:'effectUseBlock:space',level:3,source:'actual'}};
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.targets[0].steps[0].hit,false);assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
 assert.equal(out.actors.huang.state.activeResourceEffects?.length??0,0);
});

test('protection is configuration over the common stance and defense facts, with no separate spell combat implementation',()=>{
 const x=scene('防护','C');x.plan.targetIds=['player'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.player.state=out.actors.player.state;b.actors.player.state=beginTurn(b.actors.player.state).state;b.ruleScene=x.root.ruleScene;
 b.activeId='player';b.actors.player.team='party';b.actors.huang.team='enemy';b.playerDefenseDeclarations=false;b.reactionWindows=false;
 assert.equal(resolveDefense(b,'player','huang').parts.force??0,0);
 b=act(b,{actorId:'player',abilityId:'fullDefense'},{playerAuthorized:true,drawDice:dice}).battle;
 b=act(b,{actorId:'player',abilityId:'block'},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(resolveDefense(b,'player','huang').parts.force,30);
 b=JSON.parse(JSON.stringify(b));assert.equal(resolveDefense(b,'player','huang').parts.force,30);
 b.actors.player.state.activeResourceEffects=b.actors.player.state.activeResourceEffects.filter(e=>e.sourceId!=='basic:full-defense');
 assert.equal(resolveDefense(b,'player','huang').parts.force,15);
 b.actors.player.state.statuses.push({type:'冻结',points:100,source:'isolated'});
 assert.equal(resolveDefense(b,'player','huang').parts.force??0,0);
});
test('adopted independent recompense sources retain caster provenance and each retaliate once without recursion',()=>{
 const x=scene('报偿','C'),out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 out.actors.huang.team='party';out.actors.jiang.team='enemy';
 const target=out.actors.huang,second=structuredClone(Object.values(target.state.resourceTriggers)[0]);
 second.casterId='bright';second.sourcePolicy='pending-cross-caster';target.state.resourceTriggers.second=second;
 const result={damage:[]};damageEvent(target,[{amount:1,severity:'L',kind:'physical'}],false,result,{conversion:0},{root:out,targetId:'huang',sourceActorId:'jiang',drawDice:dice});
 assert.deepEqual(result.resourceTriggers.map(t=>t.casterId),['player','bright']);
 assert.deepEqual(result.resourceTriggers.map(t=>t.damage.reduce((n,d)=>n+d.actualDamage,0)),[6,6]);
 assert.ok(result.resourceTriggers.every(t=>!t.resourceTriggers?.length));
});

test('unavoidable life loss never spends damage-trigger quotas, including deferred shared events',()=>{
 const x=scene('脆弱诅咒'),out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=1;
 const target=out.actors.huang;target.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
 const result={damage:[]},budget={conversion:0};
 const event={root:out,targetId:'huang',sourceActorId:'jiang',damageNature:'attack',drawDice:dice,deferReactions:true};
 assert.equal(damageEvent(target,[{amount:2,severity:'L',kind:'physical',unavoidable:true}],false,result,budget,event),2);
 settleDamageReactions(result,budget);
 assert.equal(result.resourceTriggers,undefined);assert.equal(Object.values(target.state.resourceTriggers)[0].quota.used,0);
 damageEvent(target,[{amount:1,severity:'L',kind:'physical'}],false,result,budget,event);
 settleDamageReactions(result,budget);
 assert.equal(result.resourceTriggers.length,1);assert.equal(Object.values(target.state.resourceTriggers)[0].quota.used,1);
});
test('mixed unavoidable and ordinary wounds expose only ordinary loss to reactions and concentration',()=>{
 const x=scene('报偿','C');x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
 target.state.health={intact:100,B:0,L:0,A:0,temp:0,coma:false};
 target.state.resourceChannels={ongoing:{sourceId:'isolated-channel'}};
 const trigger=Object.values(target.state.resourceTriggers)[0];
 trigger.steps[0].amount={context:'eventActualDamage'};
 const result={damage:[]};
 const n=damageEvent(target,[{amount:2,severity:'L',kind:'physical',unavoidable:true},{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},
  {root:out,targetId:'huang',sourceActorId:'jiang',damageNature:'attack',drawDice:dice});
 assert.equal(n,3);assert.deepEqual(target.state.resourceConcentration,[1]);
 assert.equal(result.resourceTriggers.length,1);
 assert.equal(result.resourceTriggers[0].damage.reduce((n,row)=>n+row.actualDamage,0),1);
});

test('declarative damage preserves its unavoidable policy at the shared damage boundary',()=>{
 const x=scene('报偿','C');x.root.actors.huang.team='party';x.root.actors.jiang.team='enemy';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),enemy=out.actors.jiang;
 enemy.state.health={intact:100,B:0,L:0,A:0,temp:8,coma:false};
 enemy.state.sleeping={source:'实际睡眠'};
 // Isolated trusted program data exercises the common primitive; this does not
 // change the real recompense contract, whose damage remains avoidable.
 Object.values(out.actors.huang.state.resourceTriggers)[0].steps[0].unavoidable=true;
 const result={damage:[]};
 damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'physical'}],false,result,{conversion:0},
  {root:out,targetId:'huang',sourceActorId:'jiang',drawDice:dice});
 assert.equal(enemy.state.health.L,6);assert.equal(enemy.state.health.temp,8);
 assert.deepEqual(enemy.state.sleeping,{source:'实际睡眠'});
});

test('mana drain applies the adopted daily policy and requires the actual game day without charging on missing facts',()=>{
 const x=scene('吸取魔力');x.plan.poolChoices={drainedPool:'内力'};
 x.root.actors.huang.state.resources={内力:{current:6,max:6,generic:true,source}};
 const before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),e=>e.code==='NEEDS_INPUT');
 assert.deepEqual(x.root,before);
 x.plan.dayId='replay-T0/day-1';const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.player.state.resourceDailyUsage['imperial-magic:mana-drain'][x.plan.dayId].basis,'current');
});

test('the common pool-transfer program supports fresh maintenance choices, real days and saved cumulative recovery',()=>{
 const x=scene('吸取魔力');x.plan.poolChoices={drainedPool:'内力'};x.plan.dayId='replay-T0/day-1';
 x.root.actors.huang.state.resources={内力:{current:6,max:6,generic:true,source},气:{current:6,max:6,generic:true,source}};
 x.root.actors.player.state.resources.测试魔力={current:10,max:20};
 const programs=RESOURCE_DEFINITIONS[x.id].programs;
 // This fixture uses a deliberately bounded isolated key; production adoption is checked above.
 const originals=['cast','maintain'].map(key=>programs[key].steps[0].daily);
 try{
  for(const key of ['cast','maintain'])programs[key].steps[0].daily={basis:'current',maximum:{context:'destinationMax'},source:'隔离测试用规则，不表示项目采用'};
  let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
  assert.equal(out.actors.player.state.resources.测试魔力.current,10);assert.equal(out.actors.huang.state.resources.内力.current,3);
  assert.equal(out.actors.player.state.resourceDailyUsage[x.id]['replay-T0/day-1'].used,1);
  out=JSON.parse(JSON.stringify(out));out.ruleScene.objects.spell.plans.use.poolChoices.drainedPool='气';
  out=reduceRuleAction(out,{...x.q,operation:'maintain'},{drawDice:dice});
  assert.equal(out.result.cost,0);assert.equal(out.actors.huang.state.resources.气.current,3);
  assert.equal(out.actors.huang.state.resources.内力.current,3);assert.equal(out.actors.player.state.resources.测试魔力.current,11);
  assert.equal(out.actors.player.state.resourceDailyUsage[x.id]['replay-T0/day-1'].used,2);
  assert.equal(x.root.actors.huang.state.resources.内力.current,6);
 }finally{['cast','maintain'].forEach((key,i)=>programs[key].steps[0].daily=originals[i]);}
});

test('fear and weakness use exactly their declared opposed save without a second status resistance',()=>{
 for(const name of ['恐惧术','虚弱诅咒']){
  const x=scene(name);let rolls=0;
  if(name==='恐惧术')x.root.actors.huang.state.resourceCapabilities={low:{id:'mindImmunity',source,level:1}};
  const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{rolls++;return Array(200).fill(rolls===1?8:1);}});
  assert.equal(rolls,2,name+' only caster and target roll');
  assert.ok(out.actors.huang.state.statuses.some(s=>s.source===x.id&&s.points>0),name+' applies the result');
  const result=out.result.targets[0];assert.equal(result.resistanceReceipts.opposition.resolution.kind,'opposed');
  assert.equal(out.actors.player.state.resources.测试魔力.current,19);
 }
});
test('a mixed program immunizes only its mental component and skips that component save',()=>{
 const x=scene('魔法飞弹'),definition=RESOURCE_DEFINITIONS[x.id],original=definition.programs.cast;
 try{
  definition.programs.cast={...original,cooldown:0,effectComponents:{impact:{families:[]},fear:{families:['mind'],gradeBonus:1}},steps:[
   {op:'damage',component:'impact',kind:'physical',amount:2,severity:'L'},
   {op:'save',component:'fear',type:'will',as:'fearSave'},
   {op:'status',component:'fear',type:'恐惧',points:3,resistance:{receipt:'fearSave',kind:'subtract',perSuccess:1}}
  ]};
  x.root.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',source,level:2}};
  let rolls=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{rolls++;return dice();}});
  assert.equal(out.result.damage.reduce((n,d)=>n+d.actualDamage,0),2);
  assert.equal(rolls,0);assert.equal(out.actors.huang.state.statuses.some(s=>s.source===x.id),false);
  assert.ok(out.result.targets[0].applicability.some(row=>row.component==='fear'&&row.status==='blocked'));
 }finally{definition.programs.cast=original;}
});
test('charm consumes its declared save once, and preserves the exact status grade across JSON',()=>{
 const x=scene('魅惑人类');x.plan.targetFacts={huang:{source,humanoid:true,hostile:false}};let rolls=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{rolls++;return Array(200).fill(1);}});
 assert.equal(rolls,1);const receipt=out.result.targets[0].resistanceReceipts.save;
 const status=JSON.parse(JSON.stringify(out.actors.huang.state.statuses.find(s=>s.source===x.id)));
 assert.equal(status.points,9-receipt.roll.total);assert.equal(status.level,2);assert.equal(status.effectGrade,'C');
 assert.equal(status.resistanceReceipt,'save');
});
test('a persistent typed effect remains as a source while immunity changes its current contribution',()=>{
 const x=scene('法术抑制','C');x.plan.targetIds=['player'];
 x.root.actors.player.state.resourceCapabilities={t:{id:'transformationImmunity',source,level:2},c:{id:'curseImmunity',source,level:2}};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.player.state;
 assert.equal(resourceBonus(s,'spellPower'),0);assert.ok(s.activeResourceEffects.some(e=>e.sourceId===x.id));
 out=JSON.parse(JSON.stringify(out));s=out.actors.player.state;
 delete s.resourceCapabilities.t;assert.equal(resourceBonus(s,'spellPower'),-2);
 delete s.resourceCapabilities.c;assert.equal(resourceBonus(s,'spellPower'),-4);
 s.resourceCapabilities.c={id:'curseImmunity',source,level:2};assert.equal(resourceBonus(s,'spellPower'),-2);
 expireResourceEffects(s,{scene:true});assert.equal(resourceBonus(s,'spellPower'),0);
});

test('status-specific graded immunity blocks its component without treating increased power as a higher grade',()=>{
 const x=scene('恐惧术');
 x.root.actors.player.state.activeResourceEffects=[{sourceId:'test-power',effects:[{stat:'spellPower',value:1,group:'enhancement'}]}];
 x.root.actors.huang.state.resourceCapabilities={fear:{id:'status:恐惧Immunity',source,level:2}};
 let rolls=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{rolls++;return dice();}});
 assert.equal(rolls,1);assert.equal(out.result.targets[0].effectivePower,4);
 assert.equal(out.actors.huang.state.statuses.some(s=>s.source===x.id),false);
 assert.equal(out.actors.player.state.resources.测试魔力.current,19);
});
test('area resistance receipts remain target-local and immunity skips only the affected target save',()=>{
 const x=scene('恐惧嚎叫','C');x.plan.targetIds=['huang','jiang'];x.plan.areaComplete=true;
 x.root.actors.player.team='party';x.root.actors.huang.team=x.root.actors.jiang.team='enemy';
 x.root.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',source,level:3}};
 x.root.actors.jiang.state.resourceCapabilities={mind:{id:'mindImmunity',source,level:2}};
 let rolls=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(++rolls===1?8:1)});
 assert.equal(rolls,2);
 assert.equal(out.result.targets[0].resistanceReceipts,undefined);
 assert.equal(out.result.targets[1].resistanceReceipts.opposition.targetId,'jiang');
 assert.ok(out.actors.jiang.state.statuses.some(s=>s.source===x.id&&s.points>0));
 assert.equal(out.actors.huang.state.statuses.some(s=>s.source===x.id),false);
});
test('threshold save output selects a result branch without another roll or treating the target pool as DC',()=>{
 const x=scene('魔法飞弹'),definition=RESOURCE_DEFINITIONS[x.id],original=definition.programs.cast;
 const dc=saveProfile(x.root.actors.huang,'will').fixed+1;
 try{
  definition.programs.cast={...original,steps:[
   {op:'save',type:'will',resolve:{kind:'threshold',dc},resultAs:'gate'},
   {op:'effect',when:{test:'eq',left:{context:'gate.success'},right:true},scene:true,effects:[{stat:'check',value:1,group:'isolated-threshold'}]}
  ]};
  for(const success of [true,false]){
   let rolls=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{rolls++;return Array(200).fill(success?8:1);}});
   assert.equal(rolls,1);assert.equal(out.result.targets[0].resistanceReceipts.gate.resolution.success,success);
   assert.equal(out.actors.huang.state.activeResourceEffects?.some(e=>e.sourceId===x.id)??false,success);
  }
 }finally{definition.programs.cast=original;}
});
test('a curse suppressed at casting retains its source and resumes its numeric contribution without recasting',()=>{
 const x=scene('槲寄生诅咒');x.root.actors.huang.state.resourceCapabilities={ward:{id:'curseImmunity',source,level:1}};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.huang.state;
 assert.equal(resourceBonus(s,'check'),0);assert.equal(s.activeResourceEffects.filter(e=>e.sourceId===x.id).length,1);
 out=JSON.parse(JSON.stringify(out));s=out.actors.huang.state;
 delete s.resourceCapabilities.ward;assert.equal(resourceBonus(s,'check'),-3);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
 s.resourceCapabilities.ward={id:'curseImmunity',source,level:1};expireResourceEffects(s,{scene:true});
 delete s.resourceCapabilities.ward;assert.equal(resourceBonus(s,'check'),0);
});
test('a latent frailty subscription keeps actual event usage across immunity changes, reload and recast',()=>{
 const x=scene('脆弱诅咒');x.root.actors.huang.state.resourceCapabilities={ward:{id:'curseImmunity',source,level:1}};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=1;
 const key=x.id+'/player/afterLifeLoss';
 assert.ok(out.actors.huang.state.resourceTriggers[key]);
 const trigger=()=>fireResourceTriggers(out,'huang','afterLifeLoss',{context:{allowsExtraDamage:true},drawDice:dice});
 assert.equal(trigger()[0].damage.length,0);assert.equal(out.actors.huang.state.resourceTriggers[key].quota.used,1);
 out=JSON.parse(JSON.stringify(out));delete out.actors.huang.state.resourceCapabilities.ward;
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(out.actors.huang.state.resourceTriggers[key].quota.used,1);
 assert.equal(trigger()[0].damage.reduce((n,d)=>n+d.actualDamage,0),3);
 assert.equal(trigger().length,0);assert.equal(out.actors.huang.state.resourceTriggers[key].quota.used,2);
 expireResourceEffects(out.actors.huang.state,{scene:true});out.round=2;assert.deepEqual(trigger(),[]);
});
test('a morale field evaluates each recipient immunity and does not disappear when its caster is immune',()=>{
 const x=scene('祝福术');spatial(x);
 for(const id of ['player','huang'])x.root.actors[id].state.resourceCapabilities={ward:{id:'mindImmunity',source,level:1}};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(Object.keys(out.actors.player.state.resourceAuras).length,1);
 assert.equal(resourceBonus(out.actors.player.state,'attack'),0);
 assert.equal(resourceBonus(out.actors.huang.state,'save'),0);
 assert.equal(resourceBonus(out.actors.jiang.state,'attack'),6);
 out=JSON.parse(JSON.stringify(out));delete out.actors.huang.state.resourceCapabilities.ward;
 assert.equal(resourceBonus(out.actors.huang.state,'save'),6);
 out.ruleScene.spatial.actors.huang.position=[1000,0];out=reduceRuleAction(out,fieldCheck,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.huang.state,'save'),0);
 out.ruleScene.spatial.actors.huang.position=[1,0];out=reduceRuleAction(out,fieldCheck,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.huang.state,'save'),6);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
});
test('suppressed periodic components consume scheduled pulses without replaying them when immunity ends',()=>{
 const x=scene('腐蚀术'),definition=RESOURCE_DEFINITIONS[x.id],original=definition.programs.cast;
 try{
  definition.programs.cast={...original,effectComponents:{curse:{families:['curse']}},steps:[
   {op:'trigger',component:'curse',immunityLifecycle:'suppress',event:'turnStart',count:3,rounds:3,
    steps:[{op:'damage',component:'curse',amount:1,kind:'energy',energy:'acid'}]}
  ]};
  x.root.actors.huang.state.resourceCapabilities={ward:{id:'curseImmunity',source,level:1}};
  let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),key=x.id+'/player/turnStart';
  assert.ok(out.actors.huang.state.resourceTriggers[key]);
  assert.equal(fireResourceTriggers(out,'huang','turnStart',{drawDice:dice})[0].damage.length,0);
  assert.equal(out.actors.huang.state.resourceTriggers[key].remaining,2);
  expireResourceEffects(out.actors.huang.state,{rounds:1});
  out=JSON.parse(JSON.stringify(out));delete out.actors.huang.state.resourceCapabilities.ward;
  const next=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice});
  assert.equal(next.length,1);assert.equal(next[0].damage.reduce((n,d)=>n+d.actualDamage,0),1);
  assert.equal(out.actors.huang.state.resourceTriggers[key].remaining,1);
  assert.equal(out.actors.huang.state.resourceTriggers[key].remainingRounds,2);
  expireResourceEffects(out.actors.huang.state,{rounds:2});assert.deepEqual(fireResourceTriggers(out,'huang','turnStart',{drawDice:dice}),[]);
 }finally{definition.programs.cast=original;}
});
test('existing fear suppresses its penalties and escape constraint while its points keep decaying',()=>{
 const x=scene('恐惧术');let calls=0;
 let out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(++calls===1?8:1)}),s=out.actors.huang.state;
 const fear=s.statuses.find(t=>t.source===x.id);fear.perceived=true;
 assert.ok(statusLevel(s,'恐惧').severe);
 assert.throws(()=>statusActionPermission(s,{abilityId:'strike'}),/逃离/);
 const before=fear.points;
 s.resourceCapabilities={ward:{id:'mindImmunity',source,level:2}};
 assert.equal(statusLevel(s,'恐惧').points,0);
 assert.doesNotThrow(()=>statusActionPermission(s,{abilityId:'strike'}));
 assert.equal(checkModifiers(s,{context:{mentalPower:true}}).entries.some(e=>e.source==='恐惧'),false);
 out=JSON.parse(JSON.stringify(out));
 advanceTime(out.actors.huang,.1,[],{drawDice:dice});
 s=out.actors.huang.state;assert.equal(s.statuses.find(t=>t.source===x.id).points,before-1);
 delete s.resourceCapabilities.ward;assert.equal(statusLevel(s,'恐惧').points,before-1);
 assert.throws(()=>statusActionPermission(s,{abilityId:'strike'}),/逃离/);
});
test('a suppressed charm cannot compel an order or bypass another active condition',()=>{
 const x=scene('魅惑人类');x.plan.targetFacts={huang:{source,humanoid:true,hostile:false}};
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)}),s=out.actors.huang.state;
 const charm=s.statuses.find(t=>t.source===x.id);assert.ok(charm);
 s.statusOrders=[{id:'actual-order',statusSource:x.id,pending:true,irresistible:true,actions:[{abilityId:'strike'}]}];
 assert.equal(statusActionPermission(s,{abilityId:'strike'}).compelled,true);
 s.resourceCapabilities={ward:{id:'mindImmunity',source,level:2}};
 s.statuses.push({type:'沮丧',points:20,source:'higher-grade-source'});
 const p=statusActionPermission(s,{abilityId:'strike'});
 assert.equal(p.compelled,false);assert.equal(actionEligibility(s,'standard',p).allowed,false);
 assert.equal(s.statusOrders[0].pending,true);assert.equal(s.statuses.find(t=>t.source===x.id).points,charm.points);
 delete s.resourceCapabilities.ward;assert.equal(statusActionPermission(s,{abilityId:'strike'}).compelled,true);
});
test('a status blocked on initial application is never queued for later immunity loss',()=>{
 const x=scene('恐惧术');x.root.actors.huang.state.resourceCapabilities={ward:{id:'mindImmunity',source,level:2}};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});delete out.actors.huang.state.resourceCapabilities.ward;
 assert.equal(statusLevel(out.actors.huang.state,'恐惧').points,0);
 assert.equal(out.actors.huang.state.statuses.some(t=>t.source===x.id),false);
});
test('suppressed acquired points do not inflate casting or channel concentration, and restoration counts as effective points',()=>{
 const x=scene('魔法飞弹');const s=x.root.actors.player.state;
 s.statuses=[{type:'恐惧',source:'isolated-acquired-fear',points:3,applicability:{families:['mind'],grade:'C'}}];
 s.resourceCapabilities={ward:{id:'mindImmunity',source,level:2}};
 let draws=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{draws++;return dice();}});
 assert.equal(draws,0);assert.equal(out.result.concentration,undefined);
 out.actors.player.state.resourceChannels={test:{lastRound:0}};
 const before=structuredClone(out);
 assert.deepEqual(settleResourceConcentration(before,out,()=>{throw Error('suppressed points must not cause a roll');}),[]);
 delete out.actors.player.state.resourceCapabilities.ward;
 const results=settleResourceConcentration(before,out,()=>{draws++;return dice();});
 assert.equal(draws,2);assert.equal(results[0].dc,3);assert.equal(results[0].success,true);
});

test('haste selects actual area recipients, charges its casting cost and never grants benefits to unselected actors',()=>{
 const x=scene('加速术','C');const positions=spatial(x);positions.actors.huang.position=[1,0];
 x.plan.center=[1,0];x.plan.targetIds=['huang'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(resourceBonus(out.actors.huang.state,'speed'),30);
 assert.equal(resourceBonus(out.actors.player.state,'speed'),0);assert.equal(resourceBonus(out.actors.jiang.state,'speed'),0);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 assert.equal(out.actors.huang.state.activeResourceEffects.find(e=>e.sourceId===x.id).actionPrice.discount,2);
 const before=structuredClone(x.root);positions.actors.huang.position=[1000,0];
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/范围/);
 assert.equal(x.root.actors.player.state.resources['测试魔力'].current,before.actors.player.state.resources['测试魔力'].current);
});

test('haste casting pays standard plus swift and a competing caster requires the adopted recipient choice',()=>{
 const x=scene('加速术','C');x.plan.center=[1,0];x.plan.targetIds=['huang'];
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.activeId='player';b.actors.huang.team='enemy';b.actors.player.state=beginTurn(x.root.actors.player.state).state;b.ruleScene=x.root.ruleScene;
 const c={actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'};
 const out=act(b,c,{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(out.actors.player.state.turn.standard,0);assert.equal(out.actors.player.state.turn.swift,0);assert.equal(out.actors.player.state.turn.move,1);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 const y=scene('加速术','C');spatial(y);y.plan.center=[1,0];
 let field=reduceRuleAction(y.root,y.q,{drawDice:dice});
 field.actors.jiang.state=structuredClone(y.root.actors.player.state);
 field.ruleScene.objects.spell.actorIds.push('jiang');
 const before=structuredClone(field);
 assert.throws(()=>reduceRuleAction(field,{...y.q,actorId:'jiang'},{drawDice:dice}),{code:'NEEDS_INPUT'});
 assert.deepEqual(field,before);
});

test('recipe-expanded execution reports its versioned rule source and stable step identity',()=>{
 const x=scene('恐惧术');let rolls=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(++rolls===1?8:1)});
 assert.equal(out.result.programSource.recipeId,'opposed-status');assert.equal(out.result.programSource.templateVersion,1);
 assert.equal(out.result.programSource.resourceId,x.id);assert.equal(out.result.programSource.clauseId,'base');
 assert.deepEqual(out.result.targets[0].steps.map(s=>s.stepId),['cast/resist','cast/apply']);
});

test('adopted exclusive choices belong to the recipient; keeping or replacing both pay and preserve the round quota',()=>{
 const x=scene('加速术','C');spatial(x);x.plan.center=[1,0];
 const initial=reduceRuleAction(x.root,x.q,{drawDice:dice});
 initial.actors.jiang.state=structuredClone(x.root.actors.player.state);
 initial.actors.jiang.state.activeResourceEffects=[{sourceId:'isolated-weaker-power',effects:[{stat:'spellPower',value:-1}]}];
 initial.ruleScene.objects.spell.actorIds.push('jiang');
 const old=structuredClone(initial.actors.huang.state.activeResourceEffects.find(e=>e.sourceId===x.id));
 initial.actors.huang.state.resourceActionUsage={haste:{roundKey:'combat/test/1',used:1,sourceId:x.id}};
 const q={...x.q,actorId:'jiang'},choice={source,chosenBy:'huang',existingId:old.id};
 for(const decision of ['keep','replace']){
  const input=structuredClone(initial);input.ruleScene.objects.spell.plans.use.exclusiveChoices={huang:{haste:{...choice,decision}}};
  const out=reduceRuleAction(input,q,{drawDice:dice}),effects=out.actors.huang.state.activeResourceEffects.filter(e=>e.exclusiveGroup==='haste');
  assert.equal(out.actors.jiang.state.resources['测试魔力'].current,17);assert.equal(effects.length,1);
  assert.deepEqual(out.actors.huang.state.resourceActionUsage,initial.actors.huang.state.resourceActionUsage);
  if(decision==='keep')assert.deepEqual(effects[0],old);
  else {assert.equal(effects[0].casterId,'jiang');assert.equal(resourceBonus(out.actors.huang.state,'speed'),25);assert.equal(effects[0].actionPrice.discount,1);}
 }
 const input=structuredClone(initial);input.ruleScene.objects.spell.plans.use.exclusiveChoices={huang:{haste:{...choice,decision:'replace',chosenBy:'jiang'}}};
 assert.throws(()=>reduceRuleAction(input,q,{drawDice:dice}),{code:'NEEDS_INPUT'});
 assert.equal(input.actors.jiang.state.resources['测试魔力'].current,20);
});

test('pain suppression ignores numerical status penalties without erasing points or their severe action thresholds',()=>{
 const x=scene('伤痛抑制','C');x.plan.willingTargets=['huang'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.huang.state;
 s.statuses.push({type:'疲乏',points:2,source:'actual-fatigue'},{type:'麻痹',points:7,source:'actual-paralysis'});
 const mods=checkModifiers(s,{attribute:'力量',context:{physical:true,motion:true}});
 assert.equal(mods.entries.find(x=>x.source==='疲乏'),undefined);assert.equal(mods.entries.find(x=>x.source==='麻痹').value,1);
 assert.equal(statusLevel(s,'麻痹').points,7);assert.equal(statusLevel(s,'麻痹').severe,true);
 assert.equal(actionEligibility(s,'move').allowed,false);
 out=JSON.parse(JSON.stringify(out));s=out.actors.huang.state;
 expireResourceEffects(s,{minutes:120});assert.equal(checkModifiers(s,{attribute:'力量',context:{physical:true,motion:true}}).entries.find(x=>x.source==='麻痹').value,7);
 assert.equal(s.statuses.find(x=>x.type==='麻痹').points,7);
});
test('pain suppression prevents injury coma but neither death, deterioration nor unrelated incapacity',()=>{
 const x=scene('伤痛抑制','C');x.plan.willingTargets=['huang'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.huang.state,h=s.health,max=s.derived.hpMax;
 Object.assign(h,{intact:0,B:0,L:max-1,A:1,coma:true});
 assert.equal(lifeStatus(s).state,'awake');assert.equal(lifeStatus(s).deteriorating,true);
 s.statuses.push({type:'剧痛',points:100,source:'actual-pain'});assert.equal(actionEligibility(s,'standard').allowed,false);
 s.statuses=[];h.L=0;h.A=max;assert.equal(lifeStatus(s).state,'dead');
 h.A=1;h.L=max-1;expireResourceEffects(s,{minutes:120});assert.equal(lifeStatus(s).state,'unconscious');
});

test('pain suppression restores only numerical defense and movement penalties, leaving stored points intact',()=>{
 const x=scene('伤痛抑制','C');x.plan.willingTargets=['huang'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.huang.state=out.actors.huang.state;
 const before=resolveDefense(b,'huang','player').total;
 b.actors.huang.state.statuses.push({type:'麻痹',source:'actual',points:2});
 assert.equal(resolveDefense(b,'huang','player').total,before);
 assert.equal(statusLevel(b.actors.huang.state,'麻痹').points,2);
 expireResourceEffects(b.actors.huang.state,{minutes:120});assert.ok(resolveDefense(b,'huang','player').total<before);
});

test('concentration ignores each status type once without deleting multiple acquired sources',()=>{
 const x=scene('魔法飞弹'),s=x.root.actors.player.state;
 s.activeResourceEffects=[{sourceId:'isolated-suppression',effects:[{stat:'statusPenaltyIgnore',value:6,group:'suppression'}]}];
 s.statuses=[{type:'恐惧',source:'first',points:4,perceived:false},{type:'恐惧',source:'second',points:4,perceived:false},{type:'亢奋',source:'third',points:2}];
 let rolls=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{rolls++;return dice();}});
 assert.equal(rolls,2);assert.equal(out.result.concentration.dc,2);
 assert.deepEqual(out.actors.player.state.statuses,s.statuses);
});

test('ongoing concentration uses the same per-type allowance through save and expiry',()=>{
 const x=scene('魔法飞弹'),s=x.root.actors.player.state;
 s.resourceChannels={ongoing:{sourceId:'isolated-channel'}};
 s.activeResourceEffects=[{sourceId:'isolated-suppression',remainingMinutes:1,effects:[{stat:'statusPenaltyIgnore',value:6,group:'suppression'}]}];
 s.statuses=[{type:'恐惧',source:'first',points:4,perceived:false}];
 const next=JSON.parse(JSON.stringify(x.root));
 next.actors.player.state.statuses.push({type:'恐惧',source:'second',points:4,perceived:false},{type:'亢奋',source:'third',points:2});
 const results=settleResourceConcentration(x.root,next,dice);
 assert.equal(results.length,1);assert.equal(results[0].dc,2);assert.equal(results[0].success,true);
 assert.ok(next.actors.player.state.resourceChannels.ongoing);
 const before=structuredClone(next);expireResourceEffects(next.actors.player.state,{minutes:1});
 const expired=settleResourceConcentration(before,next,dice);
 assert.equal(expired.length,1);assert.equal(expired[0].dc,10);
 assert.deepEqual(next.actors.player.state.statuses,before.actors.player.state.statuses);
});


test('a registered healing plan cannot put serious wounds ahead of enabled aggravated healing',()=>{
 const x=scene('疗伤'),target=x.root.actors.huang;
 target.state.health.A=1;target.state.health.L=3;target.state.health.intact-=4;
 x.plan.healOrder=['L','A','B'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.huang.state.health.A,0);
 assert.equal(out.actors.huang.state.health.L,1);
 const steps=out.result.targets[0].steps.find(x=>x.op==='heal');
 assert.deepEqual(steps.changes,[{severity:'A',amount:1},{severity:'L',amount:2}]);
});

test('life tap records unavoidable L at A recovery price and shares actual daily restoration across D/C',()=>{
 const x=scene('生命分流'),a=x.root.actors.player;
 x.plan.dayId='replay/day-1';a.state.resources.测试魔力.current=5;
 a.state.health.temp=9;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.player.state;
 assert.equal(s.health.L,3);assert.equal(s.health.temp,9);assert.equal(s.resources.测试魔力.current,7);
 assert.equal(s.resourceDailyUsage['imperial-magic:life-tap'][x.plan.dayId].used,2);
 assert.equal(s.woundLedger.batches.find(b=>b.restrictions.length).restrictions[0].recovery,'aggravated');
 const restored=JSON.parse(JSON.stringify(out));restored.actors.player.state.learnedResources[x.id].versions=['D','C'];
 restored.ruleScene.objects.spell.plans.use.grade='C';restored.actors.player.state.casting.imperial.grade='C';
 const second=reduceRuleAction(restored,x.q,{drawDice:dice});
 assert.equal(second.actors.player.state.health.L,9);
 const daily=second.actors.player.state.resourceDailyUsage['imperial-magic:life-tap'][x.plan.dayId];
 assert.equal(daily.used,6);assert.equal(daily.maximum,second.actors.player.state.derived.hpMax*2);
});

test('dark form pays at activation, retains dark accumulation across toggles, and expires its coma after eight hours',()=>{
 const x=scene('暗夜之型','C'),s=x.root.actors.player.state;
 s.attributes.力量=2;s.resources.测试魔力.generic=true;
 const base=s.attributes.智力;
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.player.state.health.L,1);
 assert.equal(effectiveAttribute(out.actors.player.state,'智力'),base+3);
 assert.equal(out.actors.player.state.resourceAccumulators['imperial-magic:dark-form'].value,1);
 out=reduceRuleAction(out,{...x.q,operation:'end'},{drawDice:dice});
 assert.equal(effectiveAttribute(out.actors.player.state,'智力'),base);
 assert.equal(out.actors.player.state.resourceAccumulators['imperial-magic:dark-form'].value,1);
 out=reduceRuleAction(JSON.parse(JSON.stringify(out)),x.q,{drawDice:dice});
 assert.equal(out.actors.player.state.health.L,2);assert.equal(out.actors.player.state.resources.测试魔力.current,14);
 assert.equal(lifeStatus(out.actors.player.state).state,'unconscious');
 const actor=out.actors.player;advanceTime(actor,479,[],{drawDice:dice});
 assert.equal(lifeStatus(actor.state).state,'unconscious');assert.equal(actor.state.resourceAccumulators['imperial-magic:dark-form'].value,2);
 advanceTime(actor,1,[],{drawDice:dice});
 assert.equal(lifeStatus(actor.state).state,'awake');assert.equal(actor.state.resourceAccumulators['imperial-magic:dark-form'].value,0);
 assert.equal(actor.state.health.L,2);
});
test('dark periodic costs are independent of closure and ordinary healing cannot clear the accumulated counter',()=>{
 const x=scene('暗夜之型','C');x.root.actors.player.state.attributes.力量=8;
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 fireResourceTriggers(out,'player','turnStart',{drawDice:dice});
 assert.equal(out.actors.player.state.health.L,2);assert.equal(out.actors.player.state.resourceAccumulators['imperial-magic:dark-form'].value,2);
 out=reduceRuleAction(out,{...x.q,operation:'end'},{drawDice:dice});
 assert.deepEqual(fireResourceTriggers(out,'player','turnStart',{drawDice:dice}),[]);
 assert.equal(out.actors.player.state.resourceAccumulators['imperial-magic:dark-form'].value,2);
 healWounds(out.actors.player,{budget:8,ratios:{A:4,L:1,B:1}});
 assert.equal(out.actors.player.state.health.L,0);assert.equal(out.actors.player.state.resourceAccumulators['imperial-magic:dark-form'].value,2);
 const rested=reduceRecovery(out.actors.player,{type:'rest',rest:'long',minutes:480},{playerAuthorized:true,drawDice:dice});
 assert.equal(rested.actor.state.resourceAccumulators['imperial-magic:dark-form'].value,0);
});

test('temporary health replacement pays normally and an explicitly replaced aura share never returns on refresh',()=>{
 const x=scene('天使之障壁');spatial(x);x.plan.inputs={temporaryAllocation:{player:6,huang:6,jiang:6}};x.plan.targetIds=['player','huang','jiang'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const old=Object.values(out.actors.huang.state.temporaryHealthPools)[0];
 const y=scene('天堂之盾','C');(out.actors.huang.state.learnedResources??={})[y.id]=structuredClone(y.root.actors.player.state.learnedResources[y.id]);
 out.actors.huang.state.casting=structuredClone(y.root.actors.player.state.casting);
 out.actors.huang.state.resources.测试魔力={current:20,max:20};
 out.ruleScene.objects.other=structuredClone(y.root.ruleScene.objects.spell);out.ruleScene.objects.other.actorIds=['huang'];
 const plan=out.ruleScene.objects.other.plans.use;plan.temporaryHealthChoices={huang:{source,chosenBy:'huang',existingId:old.id,decision:'replace'}};
 out=reduceRuleAction(out,{...y.q,actorId:'huang',objectId:'other'},{drawDice:dice});
 assert.equal(out.actors.huang.state.resources.测试魔力.current,17);
 assert.equal(out.actors.huang.state.temporaryHealthPools[old.id],undefined);
 const saved=JSON.parse(JSON.stringify(out));
 // Any later scene action refreshes moving aura membership.
 saved.ruleScene.spatial.actors.huang.position=[1000,0];
 let closed=reduceRuleAction(saved,fieldCheck,{drawDice:dice});
 closed.ruleScene.spatial.actors.huang.position=[0,0];closed=reduceRuleAction(closed,fieldCheck,{drawDice:dice});
 assert.equal(closed.actors.huang.state.temporaryHealthPools[old.id],undefined);
 assert.equal(closed.actors.jiang.state.temporaryHealthPools[old.id].remaining,6);
});

test('inspire changes current initiative immediately, defers order until caster ends, and never grants an already-taken turn',()=>{
 for(const alreadyActed of [false,true]){
  const x=scene('振奋','C');x.plan.willingTargets=['huang'];
  let b=createOpeningEncounter({id:'inspire-actual-encounter',participants:['player','huang','bright'],positions:{player:[0,0],huang:[1,0],bright:[2,0]}});
  b.ruleScene=x.root.ruleScene;b.actors.player.state=beginTurn(x.root.actors.player.state).state;
  b.actors.player.team=b.actors.huang.team='party';b.actors.bright.team='enemy';b.activeId='player';
  b.order=['player','huang','bright'];b.turnTaken=alreadyActed?['huang']:[];
  b.actors.player.initiativeOverride=20;b.actors.huang.initiativeOverride=18;b.actors.bright.initiativeOverride=10;
  const baseline=attackProfile(b,'huang',{targetId:'player'}).rawDP;
  b=act(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'},{playerAuthorized:true,drawDice:dice}).battle;
  assert.equal(panel(b,'huang').initiative,22);assert.deepEqual(b.order,['player','huang','bright']);assert.equal(b.activeId,'player');
  assert.equal(attackProfile(b,'huang',{targetId:'player'}).rawDP,baseline+18);
  b=JSON.parse(JSON.stringify(b));
  b=act(b,{actorId:'player',abilityId:'end'},{playerAuthorized:true,drawDice:dice}).battle;
  assert.deepEqual(b.order,['huang','player','bright']);assert.equal(b.activeId,alreadyActed?'bright':'huang');assert.equal(b.round,1);
  assert.equal(b.actors.player.state.resources['测试魔力'].current,17);
  assert.deepEqual(b.actors.huang.state.resourceTurnOrder,[]);
  b.actors.player.initiativeOverride=23;
  assert.equal(attackProfile(b,'huang',{targetId:'player'}).rawDP,baseline);
 }
});

test('inspire scene quota belongs to recipient and spell, survives dispel/reload, and resets only at real scene end',()=>{
 const x=scene('振奋','C');x.plan.willingTargets=['huang'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.huang.state.resourceSceneUsage[x.id].used,1);
 assert.equal(out.actors.huang.state.resourceTurnOrder?.length??0,0);
 out=JSON.parse(JSON.stringify(out));out.actors.huang.state.activeResourceEffects=[];
 const before=structuredClone(out);
 assert.throws(()=>reduceRuleAction(out,x.q,{drawDice:dice}),/场景.*次数/);assert.deepEqual(out,before);
 out.actors.bright.state=structuredClone(x.root.actors.player.state);out.ruleScene.objects.spell.actorIds.push('bright');
 assert.throws(()=>reduceRuleAction(out,{...x.q,actorId:'bright'},{drawDice:dice}),/场景.*次数/);
 expireResourceEffects(out.actors.huang.state,{minutes:480});
 assert.equal(out.actors.huang.state.resourceSceneUsage[x.id].used,1);
 expireResourceEffects(out.actors.huang.state,{scene:true});
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(out.actors.player.state.resources['测试魔力'].current,14);
});

test('inspire respects same-grade mind immunity and real willingness, and its morale enters spell attacks only against lower initiative',()=>{
 const x=scene('振奋','C');const before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/自愿/);assert.deepEqual(x.root,before);
 x.plan.willingTargets=['huang'];x.root.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',level:2}};
 const immune=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(resourceBonus(immune.actors.huang.state,'currentInitiative'),0);
 assert.equal(immune.actors.huang.state.resourceSceneUsage?.[x.id],undefined);
 delete x.root.actors.huang.state.resourceCapabilities;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 out.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',level:2}};
 assert.equal(resourceBonus(out.actors.huang.state,'currentInitiative'),0);
 assert.equal(resourceBonus(out.actors.huang.state,'attack',{higherInitiative:true}),0);
 assert.equal(out.actors.huang.state.resourceSceneUsage[x.id].used,1);
 delete out.actors.huang.state.resourceCapabilities;
 assert.equal(resourceBonus(out.actors.huang.state,'currentInitiative'),4);
 const y=scene('火球术（射弹）');y.root.actors.player.state.activeResourceEffects=structuredClone(out.actors.huang.state.activeResourceEffects);
 y.root.actors.player.initiativeOverride=30;y.root.actors.huang.initiativeOverride=10;
 const buffed=reduceRuleAction(y.root,y.q,{drawDice:dice});
 y.root.actors.huang.initiativeOverride=40;
 const unbuffed=reduceRuleAction(y.root,y.q,{drawDice:dice});
 assert.equal(buffed.result.targets[0].steps[0].roll.dp-unbuffed.result.targets[0].steps[0].roll.dp,18);
});

test('calm emotions preflights recipient source allocation before dice and shares one budget per type',async()=>{
 const {socialResourceContext}=await import('../resource-social.mjs');
 const x=scene('安定心神');x.plan.areaComplete=true;x.plan.centerDistance=1;
 const t=x.root.actors.huang.state;t.statuses=[{type:'恐惧',source:'a',points:9,perceived:false},{type:'恐惧',source:'b',points:5,perceived:false},{type:'沮丧',source:'c',points:8},{type:'魅惑',source:'d',points:4}];
 let draws=0;const before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{draws++;return dice();}}),e=>e.code==='NEEDS_INPUT');
 assert.equal(draws,0);assert.deepEqual(x.root,before);
 x.plan.statusBudgetChoices={huang:{source,chosenBy:'huang',allocations:[{type:'恐惧',source:'a',points:4},{type:'恐惧',source:'b',points:2}]}};
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++draws===1?dice():Array(200).fill(1)}),s=out.actors.huang.state;
 assert.deepEqual(Object.fromEntries(s.statuses.map(x=>[x.source,x.points])),{a:5,b:3,c:2});
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);assert.equal(draws,2);
 assert.equal(socialResourceContext(s,{attitude:'hostile',source}).attitude,'indifferent');
 assert.equal(socialResourceContext(s).attitude,null);assert.equal(socialResourceContext(s).canChooseCombat,true);
 s.statuses.push({type:'亢奋',source:'new',points:4});assert.equal(statusLevel(s,'亢奋').points,4);
 const loaded=JSON.parse(JSON.stringify(out));advanceTime(loaded.actors.huang,.1,[],{combatTick:true});
 assert.equal(socialResourceContext(loaded.actors.huang.state,{attitude:'hostile',source}).attitude,'hostile');
 assert.equal(socialResourceContext(loaded.actors.huang.state).strongEmotionsSuppressed,true);
 loaded.actors.huang.state.resourceCapabilities.ward={id:'mindImmunity',level:1};
 assert.equal(socialResourceContext(loaded.actors.huang.state).strongEmotionsSuppressed,false);
 expireResourceEffects(s,{scene:true});assert.equal(socialResourceContext(s).strongEmotionsSuppressed,false);
});
test('calm emotions neither removes sources from immune recipients nor ignores a successful opposed save',()=>{
 const x=scene('安定心神');x.plan.areaComplete=true;x.plan.centerDistance=1;
 x.root.actors.huang.state.statuses=[{type:'沮丧',source:'c',points:8}];
 let n=0;const resisted=reduceRuleAction(x.root,x.q,{drawDice:()=>++n===1?Array(200).fill(1):dice()});
 assert.equal(resisted.actors.huang.state.statuses[0].points,8);
 x.root.actors.huang.state.resourceCapabilities={mind:{id:'mindImmunity',level:1}};
 const immune=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(immune.actors.huang.state.statuses[0].points,8);
 assert.equal(immune.actors.player.state.resources['测试魔力'].current,19);
});

test('flight grants only actual willing recipients a timed movement source and expiry on the ground does not invent altitude',()=>{
 const x=scene('飞行术','C');x.plan.targetIds=['player','huang'];x.plan.willingTargets=['player','huang'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),sources=Object.values(out.actors.huang.state.resourceCapabilities);
 assert.equal(sources.length,1);assert.equal(sources[0].movement.speed,180);assert.equal(sources[0].onEnd.rounds,6);
 assert.equal(out.actors.huang.state.learnedResources?.[x.id],undefined);assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 assert.equal(out.actors.huang.state.verticalPosition,undefined);
 advanceTime(out.actors.huang,sources[0].remainingMinutes,[],{drawDice:dice});
 assert.equal(out.actors.huang.state.resourceDescent,undefined);assert.equal(out.actors.huang.state.pendingFall,undefined);
});

test('closed operation fields are validated before a real resource cast can pay or roll',()=>{
 const x=scene('疗伤'),program=RESOURCE_DEFINITIONS[x.id].programs.cast,step=program.steps.find(s=>s.op==='heal');
 const before=structuredClone(x.root);step.recipient='everyone';
 try{assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{throw Error('invalid input reached dice');}}),e=>e.code==='INVALID_OPERATION_INPUT'&&e.path.endsWith('.recipient'));}
 finally{delete step.recipient;}
 assert.deepEqual(x.root,before);
});

test('protection training improves one self-cast armor or force source before stacking and never its AP alternative',()=>{
 const x=scene('法师护甲');x.plan.targetIds=['player'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 a.kind='test';a.buffs={};a.combatProfile={main:'白刃',natural:0,equipment:{weapon:{damage:1},armor:{defense:2}}};
 a.state.learnedResources['imperial-mage']={learned:true,grade:'D',choices:{primary:'结界'},source};
 const b={actors:out.actors};
 let d=resolveDefense(b,'player','huang');assert.equal(d.parts.armor,9);assert.equal(d.selfProtection.bonus,3);
 const active=a.state.activeResourceEffects[0];active.casterId='huang';
 assert.equal(resolveDefense(b,'player','huang').parts.armor,6);active.casterId='player';
 a.combatProfile.equipment.armor.defense=8;
 d=resolveDefense(b,'player','huang');assert.equal(d.parts.armor,8);assert.equal(d.parts.force,9);
 a.combatProfile.equipment.armor.defense=10;
 d=resolveDefense(b,'player','huang');assert.equal(d.parts.armor,10);assert.equal(d.parts.force,9);
 a.state.activeResourceEffects.push({id:'other-force',sourceId:'actual-force',effects:[{stat:'defense',value:12,group:'force'}]});
 d=resolveDefense(b,'player','huang',{ap:6});assert.equal(d.parts.armor,10);assert.equal(d.parts.force,12);assert.equal(d.resourceAlternative.stat,'ignoreAP');assert.equal(d.selfProtection,undefined);
 a.state.activeResourceEffects.pop();
 a.state.activeResourceEffects.push({id:'mental/player',sourceId:'imperial-magic:D:精神护甲',casterId:'player',scene:true,effects:[{stat:'defense',value:8,group:'force'}]});
 a.combatProfile.equipment.armor.defense=2;
 d=resolveDefense(b,'player','huang');assert.equal(d.parts.armor+d.parts.force,17);
 const saved=JSON.parse(JSON.stringify(b));assert.equal(resolveDefense(saved,'player','huang').total,d.total);
});
test('self-cast transformation walking doubles the native speed candidate without multiplying other speed increases',async()=>{
 const {movementSpeed,movementModes}=await import('../combat/movement-modes.mjs');
 const x=scene('加速术','C');x.plan.targetIds=['player'];x.plan.willingTargets=['player'];x.plan.center=[0,0];
 x.root.ruleScene.spatial={source,map:{features:[]},actors:{player:{position:[0,0]},huang:{position:[1,0]}}};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 a.kind='test';a.buffs={};a.ruleset='opening-20261022';a.combatProfile={speed:0,initiative:0,hp:0,main:'白刃',natural:0,equipment:{weapon:{damage:1},armor:{defense:0}}};
 a.state.attributes.力量=20;a.state.attributes.敏捷=20;a.state.size=5;
 a.state.learnedResources['imperial-mage']={learned:true,grade:'C',choices:{primary:'变化'},source};
 assert.equal(movementSpeed(a),90); // native 45 x 2 beats native 45 + haste 30.
 a.state.activeResourceEffects[0].casterId='huang';assert.equal(movementSpeed(a),75);
 a.state.activeResourceEffects[0].casterId='player';
 a.state.activeResourceEffects.push({id:'other-speed',sourceId:'other',effects:[{stat:'speed',value:60,group:'enhancement'}]});
 assert.equal(movementSpeed(a),105); // max(45 + 60, 45 x 2), never 210.
 a.state.resourceCapabilities={flight:{id:'flight',source:'actual-flight',level:2,movement:{mode:'flight',speed:180,maneuverability:'perfect'}}};
 assert.equal(movementModes(a)[0].speed,180);
 a.state.activeResourceEffects.pop(); // remove the separate +60 speed source.
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[180,0]}});
 b.activeId='player';b.map={bounds:[-200,-200,400,400],bounded:true,features:[]};
 b.actors.player=structuredClone(a);b.actors.player.position=[0,0];b.actors.player.state=beginTurn(b.actors.player.state).state;
 const moved=act(JSON.parse(JSON.stringify(b)),{actorId:'player',abilityId:'move',to:[85,0]},{playerAuthorized:true,drawDice:dice}).battle;
 assert.deepEqual(moved.actors.player.position,[85,0]);assert.equal(moved.actors.player.state.turn.move,0);
 a.state.statuses=[{type:'纠缠',points:100}];assert.equal(movementSpeed(a),0);
});

test('invalid damage operation is rejected before the real spell pays or draws dice',()=>{
 const x=scene('魔法飞弹'),step=RESOURCE_DEFINITIONS[x.id].programs.cast.steps.find(s=>s.op==='damage'),before=structuredClone(x.root),amount=step.amount;
 step.amount=true;
 try{assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{throw Error('invalid damage reached dice');}}),e=>e.code==='INVALID_OPERATION_INPUT'&&e.path.endsWith('.amount'));}
 finally{step.amount=amount;}
 assert.deepEqual(x.root,before);
});

test('elemental curse modifies an incoming energy amount after its cap and before real protection, not as a second damage event',()=>{
 const x=scene('元素诅咒','C');x.plan.targetIds=['huang'];
 let draws=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++draws===1?Array(200).fill(8):Array(200).fill(1)}),a=out.actors.huang;
 a.combatProfile.equipment.armor={defense:0,dr:0,energyResistance:2};
 const result={damage:[]};
 assert.equal(damageEvent(a,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},{root:out,sourceActorId:'player',targetId:'huang',damageNature:'fixed',drawDice:dice}),2);
 assert.equal(result.damageAdjustments[0].stage,'before-protection');assert.equal(result.damageAdjustments[0].added,3);
 assert.equal(result.damage.length,1);
 const physical={damage:[]};assert.equal(damageEvent(a,[{amount:1,severity:'L',kind:'physical'}],false,physical),1);assert.equal(physical.damageAdjustments,undefined);
 const before=structuredClone(a.state.health);a.state.resourceCapabilities={curse:{id:'curseImmunity',level:2}};
 const blocked={damage:[]};assert.equal(damageEvent(a,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,blocked),0);assert.deepEqual(a.state.health,before);
});

test('Q16 routes the whole incoming increase to the lightest existing severity before protection',()=>{
 const x=scene('火球术（射弹）');x.plan.targetIds=['huang'];
 x.root.actors.huang.state.activeResourceEffects=[{id:'actual-curse',sourceId:'actual-curse',casterId:'player',grade:'C',effects:[{stat:'incomingDamage',value:3,damageAllocation:'lightest-existing',stacking:'highest-source-grade',when:{test:'eq',left:{context:'kind'},right:'energy'}}]}];
 x.root.actors.huang.combatProfile.equipment.armor.energyWeaponProof=false;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.ok(out.result);assert.ok(out.actors.huang.state.health.A>0);
});

test('mirror shield requires a real held mirror before payment and creates only ranged-attack temporary health',()=>{
 const x=scene('镜枪水箭','C');x.plan.targetIds=['player'];const before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{throw Error('must not roll');}}),e=>e.code==='NEEDS_INPUT'&&e.field==='resource.itemChoices.mirror');
 assert.deepEqual(x.root,before);
 x.root.actors.player.state.possessions={items:[{id:'real-mirror',source,location:'carried',held:true,tags:['mirror']}]};x.plan.itemChoices={mirror:'real-mirror'};
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 assert.equal(a.state.health.temp,21);assert.equal(a.state.resources['测试魔力'].current,17);assert.equal(a.state.possessions.items.length,1);
 assert.equal(out.result.materialItems[0].itemId,'real-mirror');
 damageEvent(a,[{amount:3,severity:'L',kind:'energy',energyType:'force'}],false,{damage:[]},undefined,{damageNature:'attack',ranged:true});
 assert.equal(a.state.health.temp,18);
 out=reduceRuleAction({...x.root,actors:out.actors},x.q,{drawDice:dice});assert.equal(out.actors.player.state.health.temp,21);
});

test('declared free dismissal removes only the casting actor source and exposes the retained weaker curse',()=>{
 const x=scene('元素诅咒','C');let draws=0;
 let out=reduceRuleAction(x.root,x.q,{drawDice:()=>++draws===1?dice():Array(200).fill(1)});
 const a=out.actors.huang,own=a.state.activeResourceEffects.find(e=>e.sourceId===x.id),other=structuredClone(own);
 other.id+='/other';other.casterId='huang';other.effects[0].value=2;a.state.activeResourceEffects.push(other);
 const energy=out.actors.player.state.resources['测试魔力'].current,health=structuredClone(a.state.health);
 out=reduceRuleAction({...x.root,actors:out.actors},{...x.q,operation:'end'},{drawDice:()=>{throw Error('dismissal must not roll');}});
 assert.equal(out.actors.player.state.resources['测试魔力'].current,energy);assert.deepEqual(out.actors.huang.state.health,health);
 assert.equal(out.actors.huang.state.activeResourceEffects.length,1);assert.equal(out.actors.huang.state.activeResourceEffects[0].casterId,'huang');
 assert.equal(resourceBonus(out.actors.huang.state,'incomingDamage',{kind:'energy',energyType:'fire'}),2);
});

test('dragon flight reads current land speed and expires into actual inertia without magical descent',async()=>{
 const {movementModes,movementSpeed}=await import('../combat/movement-modes.mjs');
 const x=scene('龙翔术','C');x.plan.targetIds=['player'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.player;
 const [id,cap]=Object.entries(a.state.resourceCapabilities).find(([,v])=>v.id==='flight');
 assert.equal(cap.remainingMinutes,240);assert.equal(movementModes(a)[0].speed,4*movementSpeed(a,undefined,'land',{ignoreStall:true}));
 const before=movementModes(a)[0].speed;
 a.state.activeResourceEffects=[{id:'actual-haste',sourceId:'actual-haste',casterId:'player',effects:[{stat:'speed',value:10,group:'enhancement'}]}];
 assert.equal(movementModes(a)[0].speed,before+40);
 a.position=[0,0,10];a.state.verticalPosition={heightAboveGround:10,groundElevation:0,supportInstanceId:id,source:'actual position'};
 a.state.flightKinematics={position:[0,0,10],velocity:[2,0,0],supportInstanceId:id,source:'actual continuous flight'};
 cap.remainingMinutes=.1;cap.movement.used=true;out.map={features:[]};
 const changes=[];advanceTime(a,7/60,changes,{root:out,drawDice:()=>Array(200).fill(1)});
 assert.equal(a.state.resourceDescent,undefined);assert.equal(a.state.physicalMotion.kind,'flight-end');
 assert.ok(Math.abs(a.position[0]-2)<1e-7);assert.ok(Math.abs(a.position[2]-5.1)<1e-7);
});

test('real spell attack routing reaches ranged-only protection while a fixed spell bypasses that pool',async()=>{
 const {registerTemporaryHealth}=await import('../resource-temporary-health.mjs');
 const addShield=a=>registerTemporaryHealth(a.state,{id:'mirror',sourceId:'actual-mirror',remaining:100,capacity:100,damageFilter:{all:[{test:'eq',left:{context:'attack'},right:true},{test:'eq',left:{context:'ranged'},right:true}]}});
 const attack=scene('火球术（射弹）');addShield(attack.root.actors.huang);
 const before=attack.root.actors.huang.state.health.intact;
 const blocked=reduceRuleAction(attack.root,attack.q,{drawDice:dice});
 assert.equal(blocked.actors.huang.state.health.intact,before);assert.ok(blocked.actors.huang.state.health.temp<100);
 const fixed=scene('魔法飞弹');addShield(fixed.root.actors.huang);
 const passed=reduceRuleAction(fixed.root,fixed.q,{drawDice:dice});
 assert.equal(passed.actors.huang.state.health.temp,100);assert.ok(passed.actors.huang.state.health.intact<fixed.root.actors.huang.state.health.intact);
});


test('adopted hatred uses excitement mechanics and default recovery without forced behavior or scene expiry',()=>{
 const a=createOpeningRoster().player,s=a.state;s.statuses=[{type:'仇恨',source:'old-save',points:4}];s.attributes.意志=3;
 assert.equal(statusLevel(s,'亢奋').points,4);assert.equal(statusLevel(s,'仇恨').severe,true);
 assert.equal(checkModifiers(s,{skill:'社交'}).penalty,4);
 assert.equal(checkModifiers(s,{context:{extended:true,periodMinutes:1}}).allowed,false);
 assert.equal(actionEligibility(s,'standard').allowed,true);
 assert.equal(statusLevel(s,'仇恨').catastrophicThreshold,false);
 const saved=JSON.parse(JSON.stringify(s));expireResourceEffects(saved,{scene:true});assert.equal(saved.statuses[0].points,4);
 const restored=recover(saved,{type:'longRest',statusIndex:0});assert.equal(restored.state.statuses[0].points,1);
 const short=recover(saved,{type:'shortRest',statusIndex:0,dice:Array(200).fill(8)});assert.equal(statusLevel(short.state,'仇恨').points,0);
 assert.equal(s.statuses[0].type,'仇恨');assert.equal(s.statuses[0].points,4);
});
test('allocated projectiles share one target resistance reduction and retain independent additive marks',()=>{
 const x=scene('刺目光箭','C');x.plan.targetIds=['huang','jiang'];x.plan.targetAllocations={arrows:{huang:2,jiang:4}};
 x.root.actors.huang.state.activeResourceEffects=[{id:'resistance',sourceId:'test',effects:[{stat:'spellResistance',value:2}]}];
 let draws=0;let out=reduceRuleAction(x.root,x.q,{drawDice:()=>{draws++;return dice();}});
 assert.equal(draws,0);assert.equal(out.result.cost,3);
 assert.equal(out.result.targets[0].allocation.effective,0);assert.equal(out.result.targets[1].allocation.effective,4);
 assert.equal(out.actors.huang.state.statuses.some(s=>s.type==='目眩'),false);
 assert.equal(statusLevel(out.actors.jiang.state,'目眩').points,4);
 assert.equal(resourceBonus(out.actors.jiang.state,'check',{skill:'躲藏'}),-8);
 out=JSON.parse(JSON.stringify(out));out.actors.jiang.state.statuses=[];
 assert.equal(resourceBonus(out.actors.jiang.state,'check',{skill:'躲藏'}),-8);
 delete out.actors.player.state.resourceCooldowns[x.id];
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(resourceBonus(out.actors.jiang.state,'check',{skill:'躲藏'}),-16);
 expireResourceEffects(out.actors.jiang.state,{scene:true});assert.equal(resourceBonus(out.actors.jiang.state,'check',{skill:'躲藏'}),0);
 x.plan.targetAllocations.arrows.jiang=5;const before=JSON.stringify(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{throw Error('must preflight');}}),/分配/);assert.equal(JSON.stringify(x.root),before);
});
test('target progression commits on resolution, saves across rounds and targets, and clears only at scene end',()=>{
 const x=scene('奥术冲击','C');x.root.actors.player.state.resources['测试魔力']={current:100,max:100};
 const miss=()=>Array(200).fill(1);
 let out=reduceRuleAction(x.root,x.q,{drawDice:miss});
 assert.equal(out.result.cost,3);assert.equal(out.result.targets[0].progression.after.baseDamage,12);
 out=JSON.parse(JSON.stringify(out));out.round=12;
 out.actors.player.state.activeResourceEffects=[{id:'power',sourceId:'test',effects:[{stat:'spellPower',value:1}]}];
 out=reduceRuleAction(out,x.q,{drawDice:miss});assert.equal(out.result.cost,6);assert.equal(out.result.targets[0].progression.after.baseDamage,19);
 out.ruleScene.objects.spell.plans.use.targetIds=['jiang'];out=reduceRuleAction(out,x.q,{drawDice:miss});assert.equal(out.result.cost,3);assert.equal(out.result.targets[0].progression.after.baseDamage,14);
 out.ruleScene.objects.spell.plans.use.targetIds=['huang'];out=reduceRuleAction(out,x.q,{drawDice:miss});assert.equal(out.result.cost,9);assert.equal(out.result.targets[0].progression.after.baseDamage,26);
 expireResourceEffects(out.actors.player.state,{scene:true});assert.equal(Object.keys(out.actors.player.state.resourceProgressions??{}).length,0);
 out=reduceRuleAction(out,x.q,{drawDice:miss});assert.equal(out.result.cost,3);
});
test('paid armor and concentration failures do not advance target progression but full resistance does',()=>{
 const x=scene('奥术冲击','C');x.root.actors.player.state.resources['测试魔力']={current:100,max:100};
 x.root.actors.player.state.equippedArmorClass='heavy';
 let out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.armorFailure,true);assert.equal(out.actors.player.state.resources['测试魔力'].current,97);assert.equal(out.actors.player.state.resourceProgressions,undefined);
 out.actors.player.state.equippedArmorClass='none';out.actors.player.state.statuses=[{type:'剧痛',source:'test',points:1}];
 out=reduceRuleAction(out,x.q,{drawDice:()=>Array(200).fill(1)});assert.equal(out.result.concentrationFailure,true);assert.equal(out.result.cost,3);assert.equal(out.actors.player.state.resourceProgressions,undefined);
 out.actors.player.state.statuses=[];out.actors.huang.state.activeResourceEffects=[{id:'fort',sourceId:'test',effects:[{stat:'save',value:30}]}];let n=0;out=reduceRuleAction(out,x.q,{drawDice:()=>++n===1?Array(200).fill(1):dice()});
 assert.equal(out.result.targets[0].steps.find(s=>s.op==='damage').actualDamage,0);assert.equal(out.result.targets[0].progression.after.baseDamage,12);
 out=reduceRuleAction(out,x.q,{drawDice:()=>Array(200).fill(1)});assert.equal(out.result.cost,6);
});

test('target progression is caster-local and resets through sourced sceneEnd',()=>{
 const x=scene('奥术冲击','C');const miss=()=>Array(200).fill(1);
 let out=reduceRuleAction(x.root,x.q,{drawDice:miss});
 const second=out.actors.jiang.state,first=out.actors.player.state;
 second.casting=structuredClone(first.casting);second.resources['测试魔力']={current:20,max:20};second.learnedResources=structuredClone(first.learnedResources);second.skills.神秘=structuredClone(first.skills.神秘);
 out.ruleScene.objects.spell.actorIds.push('jiang');
 out=reduceRuleAction(out,{...x.q,actorId:'jiang'},{drawDice:miss});assert.equal(out.result.cost,3);assert.equal(out.result.targets[0].progression.uses,1);
 out=reduceRuleAction(out,x.q,{drawDice:miss});assert.equal(out.result.cost,6);
 out.ruleScene.events={end:{type:'sceneEnd',source,actorIds:['player']}};
 out=reduceRuleAction(out,{kind:'rule',action:'status_event',actorId:'player',eventId:'end'},{drawDice:miss});
 assert.deepEqual(out.actors.player.state.resourceProgressions,{});assert.deepEqual(out.actors.jiang.state.resourceProgressions,{});
});

test('cone spells use the actual 45 degree area, one cast roll and each recipients selected save',()=>{
 const x=scene('冰锥术','C');const pos=spatial(x);
 for(const a of Object.values(pos.actors))a.position=[-10,0];
 pos.actors.player.position=[0,0];pos.actors.huang.position=[10,0];pos.actors.jiang.position=[10,2];pos.actors.bright.position=[10,10];
 x.plan.aim=[1,0];x.plan.targetIds=['bright'];
 x.plan.saveChoices={huang:{defense:{type:'reflex',chosenBy:'huang',source}},jiang:{defense:{type:'fort',chosenBy:'jiang',source}}};
 const before=JSON.stringify(x.root);let rolls=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++rolls===1?dice():Array(200).fill(1)});
 assert.deepEqual(out.result.targets.map(t=>t.targetId).sort(),['huang','jiang']);
 assert.equal(out.result.area.angleDegrees,45);assert.equal(rolls,5);
 assert.equal(out.result.targets[0].steps.find(s=>s.op==='save').profile,'reflex');
 assert.equal(out.result.targets[1].steps.find(s=>s.op==='save').profile,'fort');
 for(const id of ['huang','jiang'])assert.equal(statusLevel(out.actors[id].state,'晕眩').points,out.result.targets.find(t=>t.targetId===id).steps.find(s=>s.op==='damage').actualDamage);
 assert.equal(JSON.stringify(x.root),before);
 delete x.plan.saveChoices.jiang;assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:()=>{throw Error('no dice before choices');}}),/受术者/);
});
test('dragon breath uses the same cone and real obstacles rather than selected or enemy-only targets',()=>{
 const x=scene('龙息术','C');const pos=spatial(x);
 for(const a of Object.values(pos.actors))a.position=[-10,0];pos.actors.player.position=[0,0];pos.actors.huang.position=[10,0];pos.actors.jiang.position=[10,3];
 pos.map={features:[{id:'wall',kind:'obstacle',rect:[5,-.1,1,.2]}]};x.plan.aim=[1,0];
 let n=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>++n===1?dice():Array(200).fill(1)});
 assert.deepEqual(out.result.targets.map(t=>t.targetId),['jiang']);assert.equal(out.result.targets[0].steps.find(s=>s.op==='save').profile,'reflex');assert.equal(out.result.cost,3);
});

test('cone combat action pays one standard action and does not require seeing each area victim',()=>{
 const x=scene('龙息术','C');let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[3,0]}});
 b.actors.player.state=x.root.actors.player.state;b.ruleScene=x.root.ruleScene;b.ruleScene.objects.spell.plans.use.aim=[1,0];
 b.activeId='player';b.actors.player.state=beginTurn(b.actors.player.state).state;
 b.actors.huang.invisible=true;
 let n=0;b=resolveStep(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'},{playerAuthorized:true,drawDice:()=>++n===1?dice():Array(200).fill(1)}).battle;
 assert.equal(b.actors.player.state.turn.standard,0);assert.equal(b.actors.player.state.resources['测试魔力'].current,17);assert.ok(statusLevel(b.actors.huang.state,'晕眩').points>0);
});

test('casting a sourced empty cone still pays and rolls rather than inventing a victim',()=>{
 const x=scene('龙息术','C'),pos=spatial(x);for(const a of Object.values(pos.actors))a.position=[-10,0];pos.actors.player.position=[0,0];x.plan.aim=[1,0];
 let n=0;const out=reduceRuleAction(x.root,x.q,{drawDice:()=>{n++;return dice();}});
 assert.deepEqual(out.result.targets,[]);assert.equal(n,1);assert.equal(out.result.cost,3);assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
});

test('periodic slowdown gates damage only, preserves original trigger lifetime and cancels clocks with the source',async()=>{
 const {installPeriodicRate}=await import('../resource-periodic-clock.mjs');
 const x=scene('腐蚀术');x.root.round=4;let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const state=out.actors.huang.state,cap={id:'periodicDamageRate',source:'adopted-clock-fixture',grade:'C',power:6,periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},scene:true};
 installPeriodicRate(state,cap,{root:out,combat:true});(state.resourceCapabilities??={}).time=cap;
 let fired=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice});assert.equal(fired[0].steps[0].actualDamage,0);
 out.round=5;fired=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice});assert.equal(fired[0].steps[0].actualDamage,0);
 out=JSON.parse(JSON.stringify(out));out.round=6;fired=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice});assert.equal(fired[0].steps[0].actualDamage,1);
 const key=Object.keys(out.actors.huang.state.resourceTriggers)[0];assert.equal(out.actors.huang.state.resourceTriggers[key].remaining,7);assert.equal(out.actors.huang.state.resourceTriggers[key].elapsed,3);
 const {endTimedResource}=await import('../resource-instances.mjs');const selected=timedResourceInstances(out,'huang').find(r=>r.sourceId===x.id);assert.ok(selected);
 const health=structuredClone(out.actors.huang.state.health);endTimedResource(out,'huang',selected);
 out.round=7;assert.deepEqual(fireResourceTriggers(out,'huang','turnStart',{drawDice:dice}),[]);assert.deepEqual(out.actors.huang.state.health,health);
});
test('non-damage periodic healing and unavoidable maintenance costs keep their ordinary timing',async()=>{
 const {installPeriodicRate}=await import('../resource-periodic-clock.mjs');
 for(const name of ['魔甲术','暗夜之型']){
  const x=scene(name,'C');x.plan.targetIds=['player'];let out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=3;
  const s=out.actors.player.state,cap={id:'periodicDamageRate',source:'clock',grade:'C',power:6,periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},scene:true};installPeriodicRate(s,cap,{root:out,combat:true});(s.resourceCapabilities??={}).time=cap;
  if(name==='魔甲术'){s.health.intact--;s.health.L++;}
  const fired=fireResourceTriggers(out,'player','turnStart',{drawDice:dice});assert.equal(fired.length,1);
  assert.equal(fired[0].periodicClocks,undefined);assert.equal(fired[0].steps[0].op,name==='魔甲术'?'heal':'damage');
  if(name==='暗夜之型')assert.equal(fired[0].steps[0].actualDamage,1);else assert.equal(fired[0].steps[0].changes[0].amount,1);
 }
});

test('field periodic source immunity uses the same boundary snapshot regardless of actor iteration order',async()=>{
 const {installPeriodicRate}=await import('../resource-periodic-clock.mjs');const {advanceActorsTime}=await import('../recovery.mjs');
 for(const order of [['player','huang'],['huang','player']]){
  const x=scene('腐蚀术');const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
  const cap={id:'periodicDamageRate',source:'clock',grade:'C',power:6,periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},scene:true};installPeriodicRate(out.actors.huang.state,cap,{root:out});(out.actors.huang.state.resourceCapabilities??={}).slow=cap;
  (out.actors.player.state.resourceCapabilities??={}).immunity={id:'timeImmunity',source:'real source immunity',comparison:{mode:'up-to',maximumGrade:'C',inclusive:true},remainingMinutes:.1};
  const actors=Object.fromEntries(order.map(id=>[id,out.actors[id]])),before=actors.huang.state.health.intact;
  advanceActorsTime(actors,.1,[],{root:{...out,actors},drawDice:dice});assert.equal(actors.huang.state.health.intact,before-1);
 }
});

test('declarative periodic-rate capability records its actual combat activation round without granting a resource',async()=>{
 const {runResourceProgram}=await import('./resource-program.mjs'),id='fixture:periodic-rate';
 RESOURCE_DEFINITIONS[id]={access:'common',grade:'C',source,contractVersion:'fixture/1',programs:{on:{action:'free',target:'self',casting:false,cost:0,steps:[{op:'capability',id:'periodicDamageRate',periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},scene:true}]}}};
 try{
  const actors=createOpeningRoster(),root={id:'fixture-battle',round:8,activeId:'player',actors,ruleScene:{objects:{clock:{resourceId:id,plans:{use:{source}}}}}};actors.player.state=beginTurn(actors.player.state).state;
  const result=runResourceProgram(root,{actorId:'player',objectId:'clock',operation:'on',part:'use'},{combat:true,drawDice:()=>{throw Error('no roll');}});
  const capability=result.targets[0].steps[0].capability;assert.deepEqual(capability.periodicOrigin,{battleId:'fixture-battle',round:8});assert.equal(capability.periodicDamage.multiplier,2);assert.equal(actors.player.state.learnedResources?.[id],undefined);
 }finally{delete RESOURCE_DEFINITIONS[id];}
});
test('time magic executes both modes through shared instances: activation round, covered debt and selected ending',()=>{
 const x=scene('时间魔术','C');x.root.round=4;x.root.instanceId='time-test';x.root.activeId='player';x.plan.inputs={mode:'haste'};x.plan.targetIds=['player'];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});let s=out.actors.player.state;
 assert.equal(s.resources['测试魔力'].current,17);assert.equal(resourceBonus(s,'attributeCheck',{attribute:'敏捷'}),6);
 assert.equal(s.activeResourceEffects[0].accruedCost.amount,1);const first=timedResourceInstances(out,'player').find(x=>x.sourceId=== 'imperial-magic:C:时间魔术');
 out.ruleScene.objects.spell.plans.use.inputs.mode='slow';out=reduceRuleAction(out,x.q,{drawDice:dice});s=out.actors.player.state;
 assert.equal(resourceBonus(s,'attributeCheck',{attribute:'敏捷'}),-6);assert.equal(s.health.A,0);assert.equal(s.activeResourceEffects.length,2);
 out.ruleScene.objects.spell.plans.use.effectChoices={player:first.id};out=reduceRuleAction(out,{...x.q,operation:'end'},{drawDice:dice});
 assert.equal(out.actors.player.state.health.A,1);assert.equal(resourceBonus(out.actors.player.state,'attributeCheck',{attribute:'敏捷'}),-6);
 assert.equal(out.actors.player.state.activeResourceEffects.length,1);
});
test('time magic modifies actual agility checks, reflex and agility attacks without changing attributes or strength attacks',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'haste'};
 const base=x.root.actors.player,baseReflex=saveProfile(base,'reflex').dp,baseFort=saveProfile(base,'fort').dp;
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.actors.player.state=structuredClone(base.state);
 const baseAttack=attackProfile(b,'player',{targetId:'huang'}).rawDP,baseStrength=attackProfile(b,'player',{targetId:'huang',strength:true}).rawDP;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.player.state;b.actors.player.state=s;
 assert.equal(saveProfile(out.actors.player,'reflex').dp,baseReflex+6);assert.equal(saveProfile(out.actors.player,'fort').dp,baseFort);
 assert.equal(attackProfile(b,'player',{targetId:'huang'}).rawDP,baseAttack+6);assert.equal(attackProfile(b,'player',{targetId:'huang',strength:true}).rawDP,baseStrength);
 assert.equal(check(s,{attribute:'敏捷',dice:dice()}).dp,check(base.state,{attribute:'敏捷',dice:dice()}).dp+6);
 assert.equal(effectiveAttribute(s,'敏捷'),effectiveAttribute(base.state,'敏捷'));
});
test('combat time activation counts the current round after spent standard action; mandatory move cost cannot be omitted',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'haste'};
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[10,0]}});
 b.activeId='player';b.actors.player.state=beginTurn(x.root.actors.player.state).state;b.actors.player.state.turn.standard=0;b.actors.huang.team='enemy';b.ruleScene=x.root.ruleScene;
 const command={actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'};
 b=act(b,command,{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(b.actors.player.state.activeResourceEffects[0].accruedCost.amount,1);
 b.ruleScene.objects.spell.plans.use.inputs.mode='slow';b=act(b,command,{playerAuthorized:true,drawDice:dice}).battle;
 const before=structuredClone(b);assert.throws(()=>act(b,{actorId:'player',abilityId:'move',to:[0,1]},{playerAuthorized:true,drawDice:dice}),{code:'UNAVAILABLE',message:'Standard action spent'});assert.deepEqual(b,before);
 b.actors.player.state=beginTurn(endTurn(b.actors.player.state).state).state;
 b=act(b,{actorId:'player',abilityId:'move',to:[0,1]},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(b.actors.player.state.turn.standard,0);assert.equal(b.actors.player.state.turn.move,1);
 assert.equal(b.actors.player.state.resourceActionUsage['time-magic'].used,1);
});
test('field upkeep pays active six-second periods and does not charge the boundary at which its source expires',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'haste'};let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const actor=out.actors.player;actor.state.activeResourceEffects[0].remainingMinutes=.1;
 advanceTime(actor,.3,[],{root:out,drawDice:dice});assert.equal(actor.state.health.A,1);assert.equal(actor.state.activeResourceEffects.length,0);
});

test('field upkeep samples covered sources at six-second boundaries before a longer time advance expires them',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'haste'};const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),actor=out.actors.player;actor.state.activeResourceEffects[0].remainingMinutes=.25;
 advanceTime(actor,.3,[],{root:out,drawDice:dice});assert.equal(actor.state.health.A,3);
});
test('known physical raw prices use mandatory slow surcharge for drawing, blocking and bow loading',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'slow'};const s=reduceRuleAction(x.root,x.q,{drawDice:dice}).actors.player.state;
 for(const [actorId,abilityId,expected]of [['huang','draw','standard'],['jiang','block','standard'],['bright','reload','move']]){
  const b=createOpeningEncounter({participants:['player',actorId],positions:{player:[10,0],[actorId]:[0,0]}});b.activeId=actorId;
  b.actors[actorId].state.activeResourceEffects=structuredClone(s.activeResourceEffects);b.actors[actorId].state=beginTurn(endTurn(b.actors[actorId].state).state).state;
  const out=act(b,{actorId,abilityId},{playerAuthorized:true,drawDice:dice}).battle;
  assert.equal(out.actors[actorId].state.turn[expected],0);assert.equal(out.actors[actorId].state.resourceActionUsage['time-magic'].used,1);
 }
});
test('Q28 previously unmapped physical action pays the adopted fallback rather than evading its surcharge',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'slow'};const s=reduceRuleAction(x.root,x.q,{drawDice:dice}).actors.player.state;
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[10,0]}});b.activeId='player';b.actors.player.state=s;
 b.actors.player.state=beginTurn(endTurn(b.actors.player.state).state).state;
 const out=act(b,{actorId:'player',abilityId:'step',to:[0,1]},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(out.actors.player.state.turn.standard,0);assert.equal(out.actors.player.state.turn.move,1);assert.equal(out.actors.player.state.resourceActionUsage['time-magic'].used,1);
});
test('Q29 free legacy block remains free and leaves surcharge for the next paid physical action',async()=>{
 const {createDuel}=await import('../combat/catalog.mjs');
 const x=scene('时间魔术','C');x.plan.inputs={mode:'slow'};const slowed=reduceRuleAction(x.root,x.q,{drawDice:dice}).actors.player.state;
 const b=createDuel();b.activeId='huang';
 const a=b.actors.huang;a.state.activeResourceEffects=structuredClone(slowed.activeResourceEffects);a.state=beginTurn(endTurn(a.state).state).state;a.sheathed=false;
 const out=act(b,{actorId:'huang',abilityId:'block'},{drawDice:dice}).battle.actors.huang;
 assert.equal(out.state.turn.standard,1);assert.equal(out.state.turn.move,1);assert.equal(out.state.turn.swift,1);assert.equal(out.state.resourceActionUsage?.['time-magic'],undefined);
});
test('Q28 medicine action uses its own slots and consumes one quota with the actual inventory update',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'slow'};const s=reduceRuleAction(x.root,x.q,{drawDice:dice}).actors.player.state;
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[10,0]}});b.activeId='player';b.actors.player.state=s;
 s.turn=endTurn(s).state.turn;s.turn=beginTurn(s).state.turn;s.inventory=[{name:'培元丹',quantity:1}];
 const out=act(b,{actorId:'player',abilityId:'medicine',medicine:'培元丹'},{playerAuthorized:true,drawDice:dice}).battle.actors.player.state;
 assert.equal(out.turn.standard,0);assert.equal(out.turn.move,1);assert.equal(out.inventory[0].quantity,0);assert.equal(out.resourceActionUsage['time-magic'].used,1);
});
test('pain curse keeps a six-occurrence schedule and settles shortened remaining segments through separate defenses',async()=>{
 const {endTimedResource}=await import('../resource-instances.mjs');
 const x=scene('痛苦诅咒');x.root.actors.huang.state.activeResourceEffects=[{id:'mental-ward',sourceId:'test/ward',effects:[{stat:'energyResistance',value:1}]}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});const hp=out.actors.huang.state.health.intact;
 assert.equal(out.actors.huang.state.health.intact,hp);
 for(let i=0;i<2;i++)fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false});
 assert.equal(out.actors.huang.state.health.intact,hp);
 const row=timedResourceInstances(out,'huang').find(row=>row.sourceId===x.id);
 const ended=endTimedResource(out,'huang',row,{drawDice:dice,combat:false});
 assert.equal(out.actors.huang.state.health.intact,hp-6);
 assert.deepEqual(ended.settlements.map(x=>x.tick),[3,4,5,6]);
 assert.equal(Object.keys(out.actors.huang.state.resourceTriggers).length,0);
 assert.equal(fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false}).length,0);
});
test('pain curse natural six starts use cast-time resistance once and do not gain a seventh damage segment',()=>{
 const x=scene('痛苦诅咒','C');x.root.actors.huang.state.activeResourceEffects=[{id:'resistance',sourceId:'test',effects:[{stat:'spellResistance',value:3}]}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),hp=out.actors.huang.state.health.intact;
 const inputs=[];for(let i=0;i<7;i++)inputs.push(...fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false}).flatMap(x=>x.damage.map(x=>x.input)));
 assert.deepEqual(inputs,[1,1,2,2,3,3]);assert.equal(out.actors.huang.state.health.intact,hp-12);
});
test('pain curse recast covers without settling or resetting the older schedule, and selected dispel restores its current segment',async()=>{
 const {endTimedResource}=await import('../resource-instances.mjs');
 const x=scene('痛苦诅咒');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 for(let i=0;i<2;i++)fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false});
 advanceTime(out.actors.player,.2,[],{root:out,drawDice:dice});const before=out.actors.huang.state.health.intact;
 out=reduceRuleAction(out,x.q,{drawDice:dice});assert.equal(out.actors.huang.state.health.intact,before);
 let triggers=Object.values(out.actors.huang.state.resourceTriggers);assert.equal(triggers.length,2);const olderId=triggers[0].id;
 let event=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false});assert.equal(event.filter(x=>x.suppressed).length,1);assert.deepEqual(event.flatMap(x=>x.damage.map(x=>x.input)),[1]);
 const row=timedResourceInstances(out,'huang').find(x=>x.components.some(c=>c.key!==olderId));
 endTimedResource(out,'huang',row,{drawDice:dice,combat:false});
 triggers=Object.values(out.actors.huang.state.resourceTriggers);assert.equal(triggers.length,1);assert.equal(triggers[0].elapsed,3);
 event=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false});assert.deepEqual(event.flatMap(x=>x.damage.map(x=>x.input)),[2]);
});
test('pain curse expiry settles residual schedule after elapsed field ticks and respects current immunity',()=>{
 for(const immune of [false,true]){
  const x=scene('痛苦诅咒'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang,hp=target.state.health.intact;
  Object.values(target.state.resourceTriggers)[0].remainingRounds=2;
  if(immune)target.state.resourceCapabilities={test:{id:'curseImmunity',level:1,source:'actual fixture immunity'}};
  advanceTime(target,.2,[],{root:out,drawDice:dice});assert.equal(target.state.health.intact,hp-(immune?0:12));
  assert.deepEqual(target.state.resourcePendingTriggerEnds,[]);assert.deepEqual(target.state.resourceTriggers,{});
 }
});
test('pain curse keeps the sixth target-start when cast after the target acted; common round expiry cannot remove it early',()=>{
 const x=scene('痛苦诅咒'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
 const inputs=[];
 for(let round=2;round<=7;round++){out.round=round;expireResourceEffects(target.state,{rounds:1});inputs.push(...fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:true}).flatMap(x=>x.damage.map(x=>x.input)));}
 assert.deepEqual(inputs,[1,1,2,2,3,3]);assert.deepEqual(target.state.resourceTriggers,{});
});
test('pain curse queued residual segments survive reload and settle exactly once, without replaying past delayed ticks',async()=>{
 const {flushResourceTriggerEnds}=await import('./resource-program.mjs');
 const x=scene('痛苦诅咒'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),s=out.actors.huang.state;
 // The existing slow clock skips the first original segment; ending pays only
 // original segments that have not elapsed, not the skipped historical tick.
 s.activeResourceEffects=[{id:'slow',sourceId:'test-time',grade:'C',power:6,effects:[],periodicDamage:{multiplier:2,sourceImmunityFamily:'time'},periodicEpoch:1}];
 assert.deepEqual(fireResourceTriggers(out,'huang','turnStart',{drawDice:dice,combat:false}).flatMap(x=>x.damage),[]);
 Object.values(s.resourceTriggers)[0].remainingRounds=1;expireResourceEffects(s,{rounds:1});
 assert.equal(s.resourcePendingTriggerEnds.length,1);const loaded=JSON.parse(JSON.stringify(out));
 const result=flushResourceTriggerEnds(loaded,'huang',{drawDice:dice,combat:false});
 assert.deepEqual(result.map(x=>x.tick),[2,3,4,5,6]);assert.deepEqual(result.flatMap(x=>x.damage.map(x=>x.input)),[1,2,2,3,3]);
 const after=JSON.stringify(loaded);assert.deepEqual(flushResourceTriggerEnds(loaded,'huang',{drawDice:dice,combat:false}),[]);assert.equal(JSON.stringify(loaded),after);
});
test('time magic retains the common concentration component; free activation does not waive it',()=>{
 const x=scene('时间魔术','C');x.plan.inputs={mode:'haste'};delete x.plan.components.focus;
 const before=JSON.stringify(x.root);assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/focus/);assert.equal(JSON.stringify(x.root),before);
});
test('hunter mark uses post-protection attack damage, before temporary health, without reusing spent defenses',()=>{
 const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
 target.state.health.temp=20;target.state.activeResourceEffects=[{id:'ward',sourceId:'test',effects:[{stat:'energyResistance',value:2},{stat:'hardness',value:2}]}];
 const result={damage:[]};damageEvent(target,[{amount:5,severity:'L',kind:'energy',energyType:'fire',magical:true}],false,result,{conversion:0},{root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice});
 assert.equal(target.state.health.temp,15);assert.equal(result.damage.reduce((n,x)=>n+x.actualDamage,0),0);
 assert.deepEqual(result.damage.map(x=>x.input),[1,4]);assert.equal(result.damageEvents[0].causedDamage,true);assert.equal(result.damageEvents[0].temporaryAbsorbed,5);
});
test('hunter mark does not trigger on blocked, fixed, other-caster or fully converted damage; partial conversion excludes extras',()=>{
 for(const mode of ['blocked','fixed','other','converted','partial']){
  const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
  if(mode==='blocked')target.state.activeResourceEffects=[{id:'ward',sourceId:'test',effects:[{stat:'energyResistance',value:20}]}];
  if(['converted','partial'].includes(mode)){target.state.learnedResources={'chengxin-xuanjian':{learned:true,source}};target.state.huaJin={current:0,max:20,acceptNext:mode==='converted'?20:2};}
  const result={damage:[]};damageEvent(target,[{amount:3,severity:'L',kind:'energy',energyType:'fire',magical:true}],false,result,{conversion:0},{root:out,sourceActorId:mode==='other'?'bright':'player',targetId:'huang',damageNature:mode==='fixed'?'fixed':'attack',drawDice:dice});
  assert.equal(result.damage.filter(x=>x.additional).length,mode==='partial'?1:0,mode);
  if(mode==='converted'){assert.equal(result.damageEvents[0].causedDamage,false);assert.equal(target.state.huaJin.current,3);}
  if(mode==='partial'){assert.equal(target.state.huaJin.current,2);assert.equal(result.damage.find(x=>x.additional).actualDamage,4);}
 }
});
test('hunter mark same-type follows lightest post-protection severity, stays outside ordinary damage conversion and cannot recurse',()=>{
 const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]};
 damageEvent(out.actors.huang,[{amount:1,severity:'A',kind:'energy',energyType:'fire',magical:true},{amount:1,severity:'L',kind:'energy',energyType:'fire',magical:true}],true,result,{conversion:0},{root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice});
 assert.deepEqual(result.damage.map(x=>[x.input,x.severity]),[[1,'L'],[1,'B'],[4,'L']]);
 assert.equal(result.damageEvents.length,1);assert.equal(result.damageEvents[0].additionalActualDamage,4);assert.equal(result.damageEvents[0].actualDamage,2);
});
test('hunter mark divination immunity compares spell grade plus one and preserves the suppressed actual source',()=>{
 for(const level of [1,2]){
  const x=scene('猎人印记');x.root.actors.huang.state.resourceCapabilities={ward:{id:'divinationImmunity',level,source:'actual fixture'}};
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]};
  assert.equal(Object.keys(out.actors.huang.state.resourceTriggers).length,1);
  damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},{root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice});
  assert.equal(result.damage.filter(x=>x.additional).length,level===1?1:0);
 }
});
test('hunter mark same-grade recast covers once across reload; multiple actual grades require chosen source order',()=>{
 const x=scene('猎人印记');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 advanceTime(out.actors.player,.4,[],{root:out,drawDice:dice});out=reduceRuleAction(out,x.q,{drawDice:dice});out=JSON.parse(JSON.stringify(out));
 let result={damage:[]};const event={root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice};
 damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},event);
 assert.equal(result.damage.filter(x=>x.additional).length,1);
 const copy=structuredClone(Object.values(out.actors.huang.state.resourceTriggers).at(-1));copy.id+='/C';copy.rank='C';copy.variables.P=6;copy.selection.group+='C';
 out.actors.huang.state.resourceTriggers[copy.id]=copy;
 const ids=[Object.values(out.actors.huang.state.resourceTriggers).at(-2).id,copy.id];
 assert.throws(()=>damageEvent(structuredClone(out.actors.huang),[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,{damage:[]},{conversion:0},event),/顺序/);
 result={damage:[]};damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},{...event,additionalDamageOrder:ids.slice().reverse()});
 assert.deepEqual(result.damage.filter(x=>x.additional).map(x=>x.input),[7,4]);
});
test('hunter mark chaos cannot add same-type damage; independent single-type events each retain their own defenses',()=>{
 const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const event={root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice};let result={damage:[]};
 damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'chaos'}],false,result,{conversion:0},event);assert.equal(result.damage.filter(x=>x.additional).length,0);
 out.actors.huang.state.activeResourceEffects=[{id:'ward',sourceId:'test',effects:[{stat:'energyResistance',value:1}]}];result={damage:[]};
 damageEvent(out.actors.huang,['fire','cold'].map(energyType=>({amount:2,severity:'L',kind:'energy',energyType})),false,result,{conversion:0},{...event,segmentMode:'independent-types'});
 assert.deepEqual(result.damage.map(x=>[x.input,x.energyType]),[[1,'fire'],[4,'fire'],[1,'cold'],[4,'cold']]);assert.equal(result.damageEvents.length,2);
});
test('hunter mark participates in actual weapon and declarative spell attacks without changing unrelated hit triggers',()=>{
 const x=scene('猎人印记'),marked=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.activeId='player';
 b.actors.huang.state=structuredClone(marked.actors.huang.state);b.actors.player.state=beginTurn(endTurn(b.actors.player.state).state).state;
 const weapon=act(b,{actorId:'player',abilityId:'strike',targetId:'huang'},{playerAuthorized:true,drawDice:dice});
 assert.equal(weapon.result.damage.filter(x=>x.additional).length,1);
 const arrow=scene('暗影箭');arrow.root.actors.huang.state=structuredClone(marked.actors.huang.state);
 const spell=reduceRuleAction(arrow.root,arrow.q,{drawDice:dice});assert.equal(spell.result.damage.filter(x=>x.additional).length,1);
 assert.equal(spell.result.damage.find(x=>x.additional).energyType,spell.result.damage[0].energyType);
});
test('additional damage is consumed once across linked calls in one original attack flow',()=>{
 const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]},bypass={conversion:0};
 const event={root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice};
 for(let i=0;i<2;i++)damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,bypass,event);
 assert.deepEqual(result.damage.map(x=>x.input),[1,4,1]);
});
test('multiple added sources need their actual order before attack dice or payment',()=>{
 const x=scene('猎人印记'),marked=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const s=marked.actors.huang.state,original=Object.values(s.resourceTriggers)[0],copy=structuredClone(original);copy.id+='/C';copy.rank='C';copy.selection.group+='C';s.resourceTriggers[copy.id]=copy;
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.activeId='player';b.actors.huang.state=s;
 const before=JSON.stringify(b);assert.throws(()=>act(b,{actorId:'player',abilityId:'strike',targetId:'huang'},{playerAuthorized:true,drawDice:()=>{throw Error('must not roll');}}),e=>e.code==='NEEDS_INPUT'&&e.field==='additionalDamageOrder');assert.equal(JSON.stringify(b),before);
 const choices=inspectCommands(b).additionalDamageSources.huang;assert.equal(choices.length,2);
});
test('resistance analysis ignores resistance itself and reduces only its real caster, never raising spell power above base',()=>{
 const x=scene('解析抗力');x.root.actors.huang.state.activeResourceEffects=[{id:'ward',sourceId:'actual-ward',effects:[{stat:'spellResistance',value:12,group:'ward'}]}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(out.result.targets[0].effectivePower,3);
 const observed=out.result.targets[0].steps.find(x=>x.op==='inspectStat');assert.equal(observed.observation.information.value,12);
 const bolt=scene('魔法飞弹');bolt.root.actors.huang.state=structuredClone(out.actors.huang.state);
 let cast=reduceRuleAction(bolt.root,bolt.q,{drawDice:dice});assert.equal(cast.result.targets[0].effectivePower,0);
 bolt.root.actors.huang.state.activeResourceEffects[0].effects[0].value=5;
 cast=reduceRuleAction(bolt.root,bolt.q,{drawDice:dice});assert.equal(cast.result.targets[0].effectivePower,3);
 const other=structuredClone(bolt.root);other.actors.bright.state=structuredClone(other.actors.player.state);other.ruleScene.objects.spell.actorIds=['bright'];
 cast=reduceRuleAction(other,{...bolt.q,actorId:'bright'},{drawDice:dice});assert.equal(cast.result.targets[0].effectivePower,0);
});
test('resistance analysis applies to allocated spells and ongoing auras only for the recorded caster after reload',()=>{
 const x=scene('解析抗力');x.root.actors.huang.state.activeResourceEffects=[{id:'ward',sourceId:'actual-ward',effects:[{stat:'spellResistance',value:5}]}];
 const analyzed=JSON.parse(JSON.stringify(reduceRuleAction(x.root,x.q,{drawDice:dice}))).actors.huang.state;
 const light=scene('刺目光箭','C');light.root.actors.huang.state=structuredClone(analyzed);light.plan.targetAllocations={arrows:{huang:6}};
 const allocated=reduceRuleAction(light.root,light.q,{drawDice:dice});assert.equal(allocated.result.targets[0].allocation.resistance,0);assert.equal(allocated.result.targets[0].allocation.effective,6);
 const aura=scene('祝福术');spatial(aura);aura.root.actors.huang.state=structuredClone(analyzed);
 const own=reduceRuleAction(aura.root,aura.q,{drawDice:dice});assert.equal(resourceBonus(own.actors.huang.state,'attack'),6);
 aura.root.actors.bright.state=structuredClone(aura.root.actors.player.state);aura.root.ruleScene.objects.spell.actorIds=['bright'];aura.root.ruleScene.spatial.actors.bright.team='party';
 const other=reduceRuleAction(aura.root,{...aura.q,actorId:'bright'},{drawDice:dice});assert.equal(resourceBonus(other.actors.huang.state,'attack'),0);
});
test('resistance inspection keeps cast-time information in the common delayed perception queue and respects divination immunity',()=>{
 const x=scene('解析抗力');x.root.actors.huang.state.activeResourceEffects=[{id:'ward',sourceId:'test',effects:[{stat:'spellResistance',value:5}]},{id:'slow-B',sourceId:'actual-time-source',grade:'B',effects:[],detectionDelay:{rounds:3,belowLevel:3,sourceImmunityFamily:'time'}}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});const observation=out.result.targets[0].steps.find(x=>x.op==='inspectStat').observation;
 assert.equal(observation.pending,true);assert.equal(observation.information,undefined);const saved=JSON.parse(JSON.stringify(out));
 saved.actors.huang.state.activeResourceEffects[0].effects[0].value=20;advanceTime(saved.actors.huang,.3,[],{root:saved,drawDice:dice});
 assert.equal(saved.actors.huang.state.resourcePerceptionQueue[0].information.value,5);assert.equal(saved.actors.huang.state.resourcePerceptionQueue[0].delivered,true);
 const immune=scene('解析抗力');immune.root.actors.huang.state.resourceCapabilities={ward:{id:'divinationImmunity',level:2,source:'actual fixture'}};
 const blocked=reduceRuleAction(immune.root,immune.q,{drawDice:dice});assert.equal(blocked.result.targets[0].steps.find(x=>x.op==='inspectStat').immune,true);assert.equal(blocked.actors.huang.state.resourcePerceptionQueue,undefined);
});
test('added damage cannot activate another extra-damage trigger when only the addition reaches actual wounds',()=>{
 const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),curse=scene('脆弱诅咒');
 const cursed=reduceRuleAction(curse.root,curse.q,{drawDice:dice});Object.assign(out.actors.huang.state.resourceTriggers,cursed.actors.huang.state.resourceTriggers);out.actors.huang.state.health.temp=1;
 const result={damage:[]};damageEvent(out.actors.huang,[{amount:1,severity:'L',kind:'energy',energyType:'fire'}],false,result,{conversion:0},{root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',drawDice:dice});
 assert.equal(result.damage.reduce((n,x)=>n+x.actualDamage,0),4);assert.ok(!(result.resourceTriggers??[]).some(x=>x.sourceId===curse.id));
});
test('Q30 mixed additions share one total and only reuse defenses consumed by that damage type',()=>{
 const x=scene('猎人印记'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
 target.state.activeResourceEffects=[{id:'wards',sourceId:'test',effects:[{stat:'absorb',value:2},{stat:'dr',value:1},{stat:'energyResistance',value:2}]}];
 const result={damage:[]};damageEvent(target,[{amount:4,severity:'L',kind:'physical'},{amount:6,severity:'A',kind:'energy',energyType:'electric'}],false,result,{conversion:0},{root:out,sourceActorId:'player',targetId:'huang',damageNature:'attack',additionalDamageTypeOrder:['physical','energy:electric'],drawDice:dice});
 assert.deepEqual(result.damageEvents[0].additionalAllocations.map(x=>x.allocated),[1,3]);
 assert.deepEqual(result.damage.filter(x=>x.additional).map(x=>[x.input,x.energyType]),[[1,null],[1,'electric']]);
 assert.equal(result.damageEvents.length,1);assert.equal(result.damageEvents[0].additionalSources.length,1);
});
test('Q31/Q32 frozen armor snapshots a new roll, pays once, and bursts only after original damage finishes',()=>{
 const x=scene('寒冰护体','C');spatial(x);let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const caster=out.actors.player,pool=Object.values(caster.state.temporaryHealthPools)[0];
 assert.equal(pool.remaining,12);assert.equal(caster.state.resources['测试魔力'].current,17);assert.ok(pool.onDepleted.check);
 const snapshot=structuredClone(pool.onDepleted);caster.state.attributes.智力+=20;caster.state.skills.神秘.level=5;caster.state.resources['测试魔力'].current=0;
 const before=caster.state.health.intact,result={damage:[]};
 damageEvent(caster,[{amount:13,severity:'L',kind:'energy',energyType:'force'}],false,result,{conversion:0},{root:out,sourceActorId:'huang',targetId:'player',drawDice:dice,damageNature:'fixed'});
 assert.equal(result.damage[0].actualDamage,1);assert.equal(result.automaticEvents.length,1);
 assert.equal(result.automaticEvents[0].casting.dp,snapshot.check.dp);assert.equal(result.automaticEvents[0].area.radius,15*snapshot.variables.INT);
 assert.equal(caster.state.health.intact,before-3);assert.equal(caster.state.resources['测试魔力'].current,0);
 assert.deepEqual(caster.state.resourceAutomaticEvents,[]);assert.equal(caster.state.learnedResources['imperial-magic:D:寒冷新星'],undefined);
});
test('Q32 depletion remains locked through lethal original wounds and a linked attack finishes before the burst',()=>{
 const x=scene('寒冰护体','C');spatial(x);const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),caster=out.actors.player,result={damage:[]},bypass={conversion:0};
 damageEvent(caster,[{amount:50,severity:'A',kind:'energy',energyType:'force'}],false,result,bypass,{root:out,sourceActorId:'huang',targetId:'player',drawDice:dice,damageNature:'fixed',deferReactions:true});
 assert.equal(lifeStatus(caster.state).state,'dead');assert.equal(result.automaticEvents,undefined);assert.equal(caster.state.resourceAutomaticEvents.length,1);
 assert.equal(timedResourceInstances(out,'player').some(row=>row.sourceId===x.id),false);
 settleDamageReactions(result,bypass);assert.equal(result.automaticEvents.length,1);assert.equal(result.automaticEvents[0].status,'resolved');assert.deepEqual(caster.state.resourceAutomaticEvents,[]);
});
test('Q31 automatic trigger needs no conscious caster, action, mana, or separate ownership after establishment',()=>{
 const x=scene('寒冰护体','C');spatial(x);const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),caster=out.actors.player;
 caster.state.sleeping=true;caster.state.resources['测试魔力'].current=0;caster.state.turn={phase:'ended',standard:0,move:0,swift:0};
 const turns=structuredClone(caster.state.turn),result={damage:[]};
 damageEvent(caster,[{amount:12,severity:'L',kind:'energy',energyType:'force'}],false,result,{conversion:0},{root:out,sourceActorId:'huang',targetId:'player',drawDice:dice});
 assert.equal(result.automaticEvents[0].status,'resolved');assert.deepEqual(caster.state.turn,turns);assert.equal(caster.state.resources['测试魔力'].current,0);
});
test('automatic area queues survive missing geometry and JSON reload; resume uses current targets without another hit',async()=>{
 const {flushAutomaticResourceEvents}=await import('./resource-program.mjs');
 const x=scene('寒冰护体','C'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]};
 damageEvent(out.actors.player,[{amount:12,severity:'L',kind:'energy',energyType:'force'}],false,result,{conversion:0},{root:out,sourceActorId:'huang',targetId:'player',drawDice:()=>{throw Error('missing geometry must not draw');}});
 assert.equal(result.automaticEvents[0].status,'pending');const loaded=JSON.parse(JSON.stringify(out));
 const view={root:loaded};spatial(view);loaded.ruleScene.spatial.actors.bright.position=[1000,0];
 const results=flushAutomaticResourceEvents(loaded,{drawDice:dice});assert.equal(results.length,1);assert.equal(results[0].area.targetIds.includes('bright'),false);assert.ok(results[0].area.targetIds.includes('player'));
 const saved=JSON.stringify(loaded);assert.deepEqual(flushAutomaticResourceEvents(loaded,{drawDice:dice}),[]);assert.equal(JSON.stringify(loaded),saved);
});
test('automatic depletion crosses the actual MVU transaction boundary and a resumed operation cannot cast twice',async()=>{
 const {initializeTestState,settleRuleAction}=await import('../mvu_poc/adapter.mjs');const {NAMESPACE}=await import('../mvu_poc/fixture.mjs');
 const x=scene('寒冰护体','C'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]};
 damageEvent(out.actors.player,[{amount:12,severity:'L',kind:'energy',energyType:'force'}],false,result,{conversion:0},{root:out,sourceActorId:'huang',targetId:'player',drawDice:dice});
 assert.equal(result.automaticEvents[0].status,'pending');
 let floor={};const anchor={chatId:'automatic-queue-test',messageId:0,swipeId:0},mvu={getMvuData:()=>structuredClone(floor),replaceMvuData:async value=>{floor=structuredClone(value);}},options={mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId};
 await initializeTestState({...options,actors:out.actors});spatial({root:out});floor.stat_data[NAMESPACE].ruleScene=out.ruleScene;
 const args={...options,operationId:'resume-auto/1',expectedRevision:0,request:{kind:'rule',action:'resume_effects',actorId:'player'},reduce:(root,request)=>reduceRuleAction(root,request,{drawDice:dice,actorTemplates:createOpeningRoster()})};
 const first=await settleRuleAction(args);assert.equal(first.result.automaticEvents.filter(x=>x.status==='resolved').length,1);
 const saved=JSON.stringify(floor);const retry=await settleRuleAction({...args,reduce:()=>{throw Error('must not reexecute');}});assert.equal(retry.status,'already_applied');assert.equal(JSON.stringify(floor),saved);
 assert.deepEqual(floor.stat_data[NAMESPACE].actors.player.state.resourceAutomaticEvents,[]);
});
test('automatic pool replacement and scene expiration never produce a burst; unsupported higher armor grades do not silently use D nova',()=>{
 const x=scene('寒冰护体','C');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 damageEvent(out.actors.player,[{amount:1,severity:'L',kind:'energy',energyType:'force'}],false,{damage:[]});
 expireResourceEffects(out.actors.player.state,{minutes:.2,rounds:2});out=reduceRuleAction(out,x.q,{drawDice:dice});
 assert.equal(Object.values(out.actors.player.state.temporaryHealthPools)[0].remaining,12);assert.equal(out.actors.player.state.resourceAutomaticEvents,undefined);
 expireResourceEffects(out.actors.player.state,{scene:true});assert.equal(out.actors.player.state.resourceAutomaticEvents,undefined);
 const higher=scene('寒冰护体','B'),before=JSON.stringify(higher.root);assert.throws(()=>reduceRuleAction(higher.root,higher.q,{drawDice:dice}),e=>e.code==='UNSUPPORTED_OPERATION');assert.equal(JSON.stringify(higher.root),before);
});

test('nova and armor reference share the explicitly additive freezing declaration below icebound threshold',()=>{
 for(const name of ['寒冷新星','寒冰护体']){
  const x=scene(name,name==='寒冰护体'?'C':'D');spatial(x);x.plan.areaComplete=true;x.plan.targetIds=Object.keys(x.root.actors);
  const target=x.root.actors.huang;target.state.attributes.力量=20;target.state.attributes.敏捷=20;
  target.state.statuses=[{type:'冻结',points:2,source:'prior-nova',stacking:'add'}];
  const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
  if(name==='寒冰护体')damageEvent(out.actors.player,[{amount:12,severity:'L',kind:'energy',energyType:'force'}],false,{damage:[]},{conversion:0},{root:out,targetId:'player',sourceActorId:'huang',drawDice:()=>Array(200).fill(1)});
  const rows=out.actors.huang.state.statuses.filter(s=>s.type==='冻结');
  assert.ok(rows.length>1,name);assert.equal(rows.at(-1).stacking,'add',name);
  assert.equal(statusLevel(out.actors.huang.state,'冻结').points,rows.reduce((n,s)=>n+s.points,0),name);
 }
});

test('arc action variants declare their effect tier and real cost independently for D and C',()=>{
 for(const [grade,power,cost]of [['D',3,1],['C',6,3]])for(const [operation,tier,paid]of [['castSwift',1,false],['castMove',2,false],['cast',3,false],['castSwiftBoost',2,true],['castMoveBoost',3,true],['castBoost',3,true]]){
  const x=scene('流电弧',grade);x.q.operation=operation;
  const out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)}),expected=Math.floor(power*tier/3);
  assert.equal(out.result.cost,paid?cost:0,operation);assert.equal(out.result.damage[0].input,expected,operation);
  assert.equal(out.result.targets[0].steps.find(s=>s.op==='status').points,expected,operation);
  const status=out.actors.huang.state.statuses.find(s=>s.source===x.id);if(status)assert.equal(status.remainingMinutes,.1);
  assert.equal(out.actors.player.state.resources['测试魔力'].current,20-(paid?cost:0));
  assert.equal(out.result.resourceUse.cooldownStarted,grade==='D');
 }
});
test('arc C standard then move in the same combat round shares the threshold and does not turn the second cast into another round',()=>{
 const x=scene('流电弧','C');let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.activeId='player';b.actors.huang.team='enemy';b.actors.player.state=beginTurn(x.root.actors.player.state).state;b.ruleScene=x.root.ruleScene;
 const command={actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'};
 b=resolveStep(b,command,{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(b.actors.player.state.resourceCooldowns?.[x.id],undefined);
 b=JSON.parse(JSON.stringify(b));b=resolveStep(b,{...command,operation:'castMove'},{playerAuthorized:true,drawDice:dice}).battle;
 assert.equal(b.actors.player.state.resourceUseWindows[x.id].used,2);assert.equal(b.actors.player.state.resourceCooldowns[x.id],2);
 assert.throws(()=>resolveStep(b,{...command,operation:'castSwift'},{playerAuthorized:true,drawDice:dice}),/冷却/);
 assert.equal(b.actors.player.state.resources['测试魔力'].current,20);
});
test('combat inspection exposes persisted automatic resumption even for an unconscious inactive owner',()=>{
 const x=scene('寒冰护体','C'),out=reduceRuleAction(x.root,x.q,{drawDice:dice}),result={damage:[]};
 damageEvent(out.actors.player,[{amount:12,severity:'L',kind:'energy',energyType:'force'}],false,result,{conversion:0},{root:out,targetId:'player',sourceActorId:'huang',drawDice:dice});
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.activeId='huang';b.actors.player.state=out.actors.player.state;b.actors.player.state.sleeping=true;
 assert.ok(inspectCommands(b).options.some(o=>o.command.abilityId==='resumeEffects'));
 const mana=b.actors.player.state.resources['测试魔力'].current;
 const next=resolveStep(b,{actorId:'player',abilityId:'resumeEffects'},{playerAuthorized:true,drawDice:dice});
 assert.equal(next.result.automaticEvents[0].status,'resolved');assert.equal(next.battle.actors.player.state.resources['测试魔力'].current,mana);
 assert.deepEqual(next.battle.actors.player.state.resourceAutomaticEvents,[]);
});

test('Q34 fixed area finishes all original targets before either armor burst and charges once',()=>{
 const armor=scene('寒冰护体','C');spatial(armor);const protectedRoot=reduceRuleAction(armor.root,armor.q,{drawDice:dice});
 const x=scene('寒冷新星');spatial(x);x.plan.areaComplete=true;x.plan.targetIds=['player','huang'];
 for(const id of x.plan.targetIds){const a=x.root.actors[id];a.state.temporaryHealthPools=structuredClone(protectedRoot.actors.player.state.temporaryHealthPools);a.state.temporaryHealthSource=protectedRoot.actors.player.state.temporaryHealthSource;for(const pool of Object.values(a.state.temporaryHealthPools))pool.remaining=1;a.state.health.temp=1;}
 const before=JSON.stringify(x.root),out=reduceRuleAction(x.root,x.q,{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.cost,1);assert.equal(JSON.stringify(x.root),before);
 assert.deepEqual(out.result.damageEvents.map(e=>[e.targetId,e.temporaryHealthDepleted?.length]),[['player',1],['huang',1]]);
 assert.equal(out.result.automaticEvents.length,2);assert.ok(out.result.automaticEvents.every(e=>e.status==='resolved'));
});
test('Q34 saved exhaustion resumes an area chain without repeating the original damage',async()=>{
 const {flushAutomaticResourceEvents}=await import('./resource-program.mjs');const x=scene('寒冰护体','C');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 out.actors.huang.state.temporaryHealthPools=structuredClone(out.actors.player.state.temporaryHealthPools);out.actors.huang.state.temporaryHealthSource=out.actors.player.state.temporaryHealthSource;for(const pool of Object.values(out.actors.huang.state.temporaryHealthPools))pool.remaining=1;out.actors.huang.state.health.temp=1;
 const result={damage:[]};damageEvent(out.actors.player,[{amount:12,severity:'L',kind:'energy',energyType:'force'}],false,result,{conversion:0},{root:out,targetId:'player',sourceActorId:'huang',drawDice:dice});
 assert.equal(result.automaticEvents[0].code,'NEEDS_INPUT');out=JSON.parse(JSON.stringify(out));spatial({root:out});
 const events=flushAutomaticResourceEvents(out,{drawDice:()=>Array(200).fill(1)});assert.equal(events.length,2);assert.ok(events.every(e=>e.status==='resolved'));assert.deepEqual(flushAutomaticResourceEvents(out,{drawDice:dice}),[]);
});
test('seed death uses effective rounds even when periodic damage is fully resisted, excludes the caster, and never charges again',()=>{
 const x=scene('腐蚀之种','C');spatial(x);const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),victim=out.actors.huang;
 victim.state.activeResourceEffects=[{id:'resistance',sourceId:'test',effects:[{stat:'energyResistance',value:100}]}];
 const periodic=fireResourceTriggers(out,'huang','turnStart',{drawDice:dice});assert.equal(periodic[0].steps.find(s=>s.op==='damage').actualDamage,0);
 const result={damage:[]};damageEvent(victim,[{amount:100,severity:'A',kind:'physical',unavoidable:true}],false,result,{conversion:0},{root:out,targetId:'huang',sourceActorId:'player',drawDice:()=>Array(200).fill(1)});
 const blast=result.automaticEvents[0];assert.equal(blast.status,'resolved');assert.equal(blast.area.targetIds.includes('player'),false);assert.equal(blast.targets.find(t=>t.targetId==='jiang').effectivePower,6);
 const step=blast.targets.find(t=>t.targetId==='jiang').steps;assert.equal(blast.damage.find(d=>d.targetId==='jiang').input,Math.max(0,6-step.find(s=>s.op==='save').total));
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);assert.deepEqual(victim.state.resourceTriggers,{});assert.deepEqual(victim.state.resourceAutomaticEvents,[]);
});

test('seed keeps source power separate from host resistance and applies each explosion recipient resistance once',()=>{
 const x=scene('腐蚀之种','C');spatial(x);
 x.root.actors.huang.state.activeResourceEffects=[{id:'host-resistance',sourceId:'test',effects:[{stat:'spellResistance',value:2}]}];
 x.root.actors.jiang.state.activeResourceEffects=[{id:'other-resistance',sourceId:'test',effects:[{stat:'spellResistance',value:1}]}];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),t=Object.values(out.actors.huang.state.resourceTriggers)[0];assert.equal(t.variables.P,4);assert.equal(t.variables.basePower,6);
 const result={damage:[]};damageEvent(out.actors.huang,[{amount:100,severity:'A',kind:'physical',unavoidable:true}],false,result,{conversion:0},{root:out,targetId:'huang',drawDice:()=>Array(200).fill(1)});
 assert.equal(result.automaticEvents[0].targets.find(t=>t.targetId==='jiang').effectivePower,5);assert.equal(result.automaticEvents[0].area.radius,30*t.variables.INT);
});
test('actual deterioration death locks and executes a seed without passing through damageEvent',()=>{
 const x=scene('腐蚀之种','C');spatial(x);let out=reduceRuleAction(x.root,x.q,{drawDice:dice});const a=out.actors.huang;
 a.state.health={...a.state.health,intact:0,B:0,L:1,A:a.state.derived.hpMax-1};
 out=reduceRuleAction(out,{kind:'rule',action:'deterioration',actorId:'huang',from:'L'},{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.result.deaths[0].actorId,'huang');assert.equal(out.result.automaticEvents[0].status,'resolved');assert.equal(out.actors.huang.state.resourceDeathHandled,true);
});
test('medicine death and its multi-actor blast commit in one MVU recovery transaction and retry never executes twice',async()=>{
 const {initializeTestState,settleRecovery}=await import('../mvu_poc/adapter.mjs');const {NAMESPACE}=await import('../mvu_poc/fixture.mjs');const {flushAutomaticResourceEvents}=await import('./resource-program.mjs');
 const x=scene('腐蚀之种','C');spatial(x);const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 out.actors.huang.state.attributes.力量=1;out.actors.huang.state.inventory=[{name:'雷霆药剂',quantity:1}];
 let floor={};const anchor={chatId:'death-recovery',messageId:0,swipeId:0},mvu={getMvuData:()=>structuredClone(floor),replaceMvuData:async v=>{floor=structuredClone(v);}},opts={mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId};
 await initializeTestState({...opts,actors:out.actors});floor.stat_data[NAMESPACE].ruleScene=out.ruleScene;
 const before=out.actors.jiang.state.health.intact,args={...opts,actorId:'huang',operationId:'poison/1',expectedRevision:0,playerAuthorized:true,command:{type:'medicine',medicine:'雷霆药剂'},reduce:(actor,command,root)=>{
  const result=reduceRecovery(actor,command,{root,drawDice:()=>Array(200).fill(1),playerAuthorized:true});root.actors.huang=result.actor;
  result.result.automaticEvents=flushAutomaticResourceEvents(root,{drawDice:()=>Array(200).fill(1),actorTemplates:createOpeningRoster()});return {...result,actor:root.actors.huang,affectedActors:root.actors};
 }};
 const first=await settleRecovery(args);assert.equal(first.result.automaticEvents[0].status,'resolved');
 assert.ok(floor.stat_data[NAMESPACE].actors.jiang.state.health.intact<before);assert.equal(floor.stat_data[NAMESPACE].actors.huang.state.inventory[0].quantity,0);
 const saved=JSON.stringify(floor);assert.equal((await settleRecovery({...args,reduce:()=>{throw Error('retry must not run');}})).status,'already_applied');assert.equal(JSON.stringify(floor),saved);
});

test('expiry shrinking actual health capacity commits death and its saved seed at the time boundary',async()=>{
 const {syncResourceHealth}=await import('../core.mjs');const x=scene('腐蚀之种','C');spatial(x);let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const s=out.actors.huang.state,base=s.derived.hpMax;(s.activeResourceEffects??=[]).push({id:'temporary-strength',sourceId:'test',remainingMinutes:.1,effects:[{stat:'attribute',value:2,group:'enhancement',when:{test:'eq',left:{context:'attribute'},right:'力量'}}]});syncResourceHealth(s);
 assert.equal(s.derived.hpMax,base+4);s.health={...s.health,intact:4,B:0,L:0,A:base};
 out=reduceRuleAction(out,{kind:'rule',action:'time',actorId:'player',minutes:.1,sourceQuote:source},{drawDice:()=>Array(200).fill(1)});
 assert.equal(out.actors.huang.state.health.dead,true);assert.equal(out.actors.huang.state.derived.hpMax,base);assert.deepEqual(out.actors.huang.state.resourceAutomaticEvents,[]);
 assert.ok(out.result.automaticEvents?.some(e=>e.sourceId===x.id&&e.status==='resolved'));
});

import {resolveResourceInstantDeath} from '../resource-death.mjs';
import {flushAutomaticResourceEvents} from './resource-program.mjs';
test('death ward C installs a paid timed source, locks recovery before cleanup and shares quota across recasts',()=>{
 const x=scene('防死结界','C');x.plan.willingTargets=['huang'];const before=structuredClone(x.root);let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);assert.deepEqual(x.root,before);
 let a=out.actors.huang;assert.equal(a.state.activeResourceEffects[0].remainingMinutes,240);
 damageEvent(a,[{amount:100,severity:'A',kind:'physical',unavoidable:true}],false,{damage:[]},{conversion:0},{root:out,targetId:'huang',drawDice:dice});
 assert.equal(a.state.health.L,1);assert.equal(a.state.resourceSceneUsage[x.id].used,1);assert.equal(a.state.health.dead,undefined);
 out=reduceRuleAction(JSON.parse(JSON.stringify(out)),x.q,{drawDice:dice});a=out.actors.huang;
 assert.equal(resolveResourceInstantDeath(out,'huang',{sourceId:'test/instant',grade:'B'}).blocked,true);
 assert.equal(a.state.resourceSceneUsage[x.id].used,2);
 out=reduceRuleAction(out,x.q,{drawDice:dice});a=out.actors.huang;
 damageEvent(a,[{amount:1,severity:'B',kind:'physical',unavoidable:true}],false,{damage:[]},{conversion:0},{root:out,targetId:'huang',drawDice:dice});
 assert.equal(lifeStatus(a.state).state,'dead');assert.equal(a.state.resourceSceneUsage[x.id].used,2);
});
test('incineration C prevents equal-grade death ward, D allows C recovery; nonlethal damage does not poison later deaths',()=>{
 for(const grade of ['D','C']){
  const w=scene('防死结界','C'),x=scene('焚化',grade);w.plan.willingTargets=['huang'];let root=reduceRuleAction(w.root,w.q,{drawDice:dice});
  root.actors.player.state=x.root.actors.player.state;root.ruleScene=x.root.ruleScene;
  const h=root.actors.huang.state.health;h.intact=0;h.B=0;h.L=1;h.A=root.actors.huang.state.derived.hpMax-1;
  let n=0;const out=reduceRuleAction(root,x.q,{drawDice:()=>++n===1?Array(200).fill(8):Array(200).fill(1)}),s=out.actors.huang.state;
  assert.equal(out.actors.player.state.resources['测试魔力'].current,20-(grade==='D'?1:3));
  if(grade==='C'){assert.equal(lifeStatus(s).state,'dead');assert.equal(s.resourceDeathRestrictions[0].sourceId,x.id);assert.equal(s.resourceSceneUsage?.[w.id],undefined);}
  else {assert.notEqual(lifeStatus(s).state,'dead');assert.equal(s.health.L,1);assert.equal(s.resourceSceneUsage[w.id].used,1);}
 }
});
test('death ward on an instant-death victim resets life without inventing damage or restoring ended effects',()=>{
 const x=scene('防死结界','C');x.plan.willingTargets=['huang'];const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.huang;
 const h=structuredClone(a.state.health);
 resolveResourceInstantDeath(out,'huang',{sourceId:'test/A',grade:'A'});
 assert.equal(a.state.health.intact,h.intact);assert.equal(a.state.health.A,h.A);
 const events=flushAutomaticResourceEvents(out,{drawDice:dice});
 assert.equal(events[0].recovered,true);assert.equal(a.state.health.L,1);assert.equal(a.state.health.A,a.state.derived.hpMax-1);assert.deepEqual(a.state.activeResourceEffects,[]);
 assert.equal(a.state.woundLedger.batches.reduce((n,b)=>n+b.count,0),a.state.derived.hpMax);
});
test('adopted special wound reset preserves natural-only restrictions and updates the compatibility view',()=>{
 const x=scene('防死结界','C');x.plan.willingTargets=['huang'];let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.huang,result={damage:[]};
 damageEvent(a,[{amount:100,severity:'A',kind:'physical',unavoidable:true,recovery:'naturalOnly',sourceId:'special'}],false,result,{conversion:0},{root:out,targetId:'huang',drawDice:()=>{throw Error('one source needs no random choice');}});
 assert.notEqual(lifeStatus(a.state).state,'dead');assert.equal(result.automaticEvents[0].recovered,true);assert.equal(a.state.resourceSceneUsage[x.id].used,1);
 assert.equal(a.state.health.L,1);assert.equal(a.state.woundLedger.batches.find(b=>b.severity==='L').restrictions[0].recovery,'naturalOnly');
 assert.equal(a.recoveryLocks.find(b=>b.severity==='L').count,1);
 const ledger=structuredClone(a.state.woundLedger);out=JSON.parse(JSON.stringify(out));
 assert.deepEqual(flushAutomaticResourceEvents(out,{drawDice:dice}),[]);assert.deepEqual(out.actors.huang.state.woundLedger,ledger);
 assert.deepEqual(healWounds(out.actors.huang,{budget:100,mode:'magical'}).changes,[]);
});
test('generic instantDeath and revive operators use component grades through the actual program dispatcher',async()=>{
 const {runResourceProgram}=await import('./resource-program.mjs'),x=scene('防死结界','C');x.plan.willingTargets=['huang'];
 const root=reduceRuleAction(x.root,x.q,{drawDice:dice}),id='fixture:death-operators';
 RESOURCE_DEFINITIONS[id]={access:'common',grade:'C',source,contractVersion:'fixture/1',subskills:['结界'],schools:['结界'],programs:{kill:{action:'standard',target:'single',casting:true,cost:0,components:[],steps:[{op:'instantDeath',gradeBonus:2}]},raise:{action:'standard',target:'single',casting:true,cost:0,components:[],steps:[{op:'revive',mode:'one-impact-from-death',gradeBonus:1}]}}};
 root.actors.player.state.learnedResources[id]={learned:true,grade:'C'};root.ruleScene.objects.fixture={type:'kitResource',resourceId:id,source,plans:{use:{source,targetIds:['huang'],effectLine:true,precise:true}}};
 try{
  const killed=runResourceProgram(root,{actorId:'player',objectId:'fixture',operation:'kill',part:'use'},{drawDice:dice});
  assert.equal(killed.targets[0].steps[0].killed,true);assert.equal(killed.automaticEvents[0].recovered,true);
  root.actors.huang.state.health.dead=true;root.actors.huang.state.resourceDeathRestrictions=[{sourceId:'restriction',maximumLevel:2}];
  const raised=runResourceProgram(root,{actorId:'player',objectId:'fixture',operation:'raise',part:'use'},{drawDice:dice});
  assert.equal(raised.targets[0].steps[0].recovered,true);
 }finally{delete RESOURCE_DEFINITIONS[id];}
});
test('a nonlethal incineration hit leaves no restriction on a later unrelated death',()=>{
 const x=scene('防死结界','C');x.plan.willingTargets=['huang'];const root=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=root.actors.huang;
 const result={damage:[]};damageEvent(a,[{amount:1,severity:'L',kind:'energy',energyType:'fire',unavoidable:true,sourceId:'incineration',grade:'C',deathRestriction:{maximumLevel:2}}],false,result,{conversion:0},{root,targetId:'huang',drawDice:dice});
 assert.equal(a.state.resourceDeathRestrictions,undefined);
 damageEvent(a,[{amount:100,severity:'A',kind:'physical',unavoidable:true}],false,result,{conversion:0},{root,targetId:'huang',drawDice:dice});
 assert.equal(a.state.health.L,1);assert.notEqual(lifeStatus(a.state).state,'dead');
});
test('revival does not cancel an already locked later death burst or restore its consumed source',()=>{
 const w=scene('防死结界','C');w.plan.willingTargets=['huang'];let root=reduceRuleAction(w.root,w.q,{drawDice:dice});
 const seed=scene('腐蚀之种','C');spatial(seed);root.ruleScene=seed.root.ruleScene;root.actors.player.state=seed.root.actors.player.state;
 root=reduceRuleAction(root,seed.q,{drawDice:dice});const result={damage:[]};
 damageEvent(root.actors.huang,[{amount:100,severity:'A',kind:'physical',unavoidable:true}],false,result,{conversion:0},{root,targetId:'huang',drawDice:()=>Array(200).fill(1)});
 assert.equal(result.automaticEvents.length,2);assert.equal(result.automaticEvents[0].sourceId,w.id);assert.equal(result.automaticEvents[0].recovered,true);
 assert.equal(result.automaticEvents[1].sourceId,seed.id);assert.equal(result.automaticEvents[1].status,'resolved');assert.equal(lifeStatus(root.actors.huang.state).state,'dead');
 assert.equal(root.actors.huang.state.resourceSceneUsage[w.id].used,1);assert.deepEqual(root.actors.huang.state.resourceAutomaticEvents,[]);
});
test('MVU saves actual death recovery, wound provenance and shared quota once across operation retry',async()=>{
 const {initializeTestState,settleRuleAction}=await import('../mvu_poc/adapter.mjs');const {NAMESPACE}=await import('../mvu_poc/fixture.mjs');
 const x=scene('防死结界','C');x.plan.willingTargets=['huang'];const root=reduceRuleAction(x.root,x.q,{drawDice:dice});
 root.actors.huang.state.health={...root.actors.huang.state.health,intact:0,B:0,L:1,A:root.actors.huang.state.derived.hpMax-1};
 let floor={};const anchor={chatId:'death-ward-persist',messageId:0,swipeId:0},mvu={getMvuData:()=>structuredClone(floor),replaceMvuData:async v=>{floor=structuredClone(v);}},opts={mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId};
 await initializeTestState({...opts,actors:root.actors});floor.stat_data[NAMESPACE].ruleScene=root.ruleScene;
 const args={...opts,operationId:'death/1',expectedRevision:0,request:{kind:'rule',action:'deterioration',actorId:'huang',from:'L'},reduce:(r,q)=>reduceRuleAction(r,q,{drawDice:dice,actorTemplates:createOpeningRoster()})};
 await settleRuleAction(args);const state=floor.stat_data[NAMESPACE].actors.huang.state;
 assert.equal(state.health.L,1);assert.equal(state.health.dead,undefined);assert.equal(state.resourceSceneUsage[x.id].used,1);assert.equal(state.woundLedger.batches.reduce((n,b)=>n+b.count,0),state.derived.hpMax);
 const saved=JSON.stringify(floor);assert.equal((await settleRuleAction({...args,reduce:()=>{throw Error('already applied');}})).status,'already_applied');assert.equal(JSON.stringify(floor),saved);
});
test('marking strike consumes the next melee blade opportunity even on miss, without granting a new duration',()=>{
 const x=scene('印记斩');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 expireResourceEffects(out.actors.player.state,{minutes:.04,rounds:.4});
 const fired=fireResourceTriggers(out,'player','attackResolved',{targetId:'huang',context:{melee:true,skill:'白刃',hit:true,actualDamage:0,causedDamage:true},drawDice:dice});
 assert.equal(fired[0].damage[0].input,3);
 const mark=out.actors.huang.state.activeResourceEffects.find(e=>e.sourceId===x.id);assert.equal(mark.suppression.maximumLevel,2);assert.equal(mark.remainingRounds,.6);
 assert.deepEqual(out.actors.player.state.resourceTriggers,{});expireResourceEffects(out.actors.huang.state,{minutes:.06,rounds:.6});assert.equal(out.actors.huang.state.activeResourceEffects.some(e=>e.sourceId===x.id),false);
 out=reduceRuleAction(x.root,x.q,{drawDice:dice});const miss=fireResourceTriggers(out,'player','attackResolved',{targetId:'huang',context:{melee:true,skill:'白刃',hit:false,actualDamage:0,causedDamage:false},drawDice:dice});
 assert.deepEqual(miss[0].damage,[]);assert.deepEqual(out.actors.player.state.resourceTriggers,{});assert.equal(out.actors.huang.state.activeResourceEffects?.some(e=>e.sourceId===x.id)??false,false);
});
test('real melee attack blocked only by temporary life still triggers marking strike and its detection suppression',()=>{
 const x=scene('印记斩'),b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.player.state=beginTurn(x.root.actors.player.state).state;b.ruleScene=x.root.ruleScene;b.activeId='player';b.actors.player.team='party';b.actors.huang.team='enemy';b.actors.player.sheathed=false;b.actors.huang.state.health.temp=100;
 let out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'},{drawDice:dice,playerAuthorized:true}).battle;
 out=act(out,{actorId:'player',abilityId:'strike',targetId:'huang'},{drawDice:dice,playerAuthorized:true}).battle;
 assert.ok(out.actors.huang.state.activeResourceEffects.some(e=>e.sourceId===x.id));assert.equal(out.actors.huang.state.health.L,0);
 assert.deepEqual(out.actors.player.state.resourceTriggers,{});
});
test('an actual declarative spell attack exposes only the caster origin after resolution without another roll or cost',()=>{
 const x=scene('火球术（射弹）');const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[2,0]}});
 b.map={features:[]};b.activeId='player';b.actors.player.state=beginTurn(x.root.actors.player.state).state;b.actors.player.hiddenFrom=['huang'];b.actors.player.team='party';b.actors.huang.team='enemy';b.ruleScene=x.root.ruleScene;b.playerDefenseDeclarations=false;
 const out=act(b,{actorId:'player',abilityId:'mechanism',objectId:'spell',operation:'cast',part:'use'},{drawDice:()=>Array(200).fill(1),playerAuthorized:true});
 assert.deepEqual(out.battle.actors.huang.state.resourceLocationClues.player.position,[0,0]);
 assert.equal(out.battle.actors.huang.state.resourceDiscoveries.player.everLocated,true);
 assert.equal(out.battle.actors.player.state.resources['测试魔力'].current,19);
 assert.equal(out.result.resource?.locationDisclosures?.[0]?.precision??out.result.mechanism?.locationDisclosures?.[0]?.precision,'vague');
});

test('Q41/Q42 invisibility programs use actual source grades, discovery history, all senses and suppression',async()=>{
 const {detectionLimit}=await import('../resource-detection.mjs');
 for(const name of ['隐形术','幻身咒'])for(const rank of ['D','C']){
  const x=scene(name,rank);x.plan.targetIds=['huang'];x.plan.willingTargets=['huang'];x.plan.contactConfirmed=true;
  let out=reduceRuleAction(x.root,x.q,{drawDice:dice}),a=out.actors.huang,d=out.actors.player;
  const level=rank==='D'?1:2;assert.equal(Object.values(a.state.resourceCapabilities).find(c=>c.id==='antiDetection').level,level+1);
  assert.equal(d.state.resources['测试魔力'].current,rank==='D'?19:17);
  out.map={features:[]};out.round=1;d.windSense=false;out.playerDefenseDeclarations=false;a.position=[1,0];d.position=[0,0];
  d.senseSources={vision:{source:'actual test sight',grade:'none',sensitiveRange:20,rangeBand:'sensitive',contest:{source:'actual check',observer:{total:1},target:{total:2}}}};
  assert.equal(resolveDefense(out,'player','huang').flatFooted.level,level);
  d.state.resourceDiscoveries={huang:{everLocated:true}};out=JSON.parse(JSON.stringify(out));
  assert.equal(resolveDefense(out,'player','huang').flatFooted.level,0);
  delete out.actors.player.state.resourceDiscoveries;
  const auditory=detectionLimit(out,{observerId:'player',targetId:'huang',sense:{source:'actual hearing',grade:'none',channel:'auditory',visual:false,rangeBand:'sensitive',contest:{source:'actual check',concealmentWaived:true}}});
  assert.equal(auditory.precision,'vague');
  out.actors.huang.state.activeResourceEffects.push({id:'suppress',sourceId:'actual suppression',scene:true,effects:[],suppression:{family:'antiDetection',maximumLevel:level+1}});
  assert.notEqual(resolveDefense(out,'player','huang').flatFooted?.level,level);
 }
});
test('actual detection spells feed the shared sensory scheduler and visual investigation bonus',async()=>{
 const {schedulePassivePerception}=await import('../resource-perception-scheduler.mjs');const {locationPrecision}=await import('../combat/map.mjs');
 for(const rank of ['D','C']){
  const x=scene('识破隐形',rank);x.plan.targetIds=['player'];x.plan.willingTargets=['player'];
  const out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=1;out.instanceId='detection-spell';out.map={features:[]};
  const observer=out.actors.player;observer.windSense=false;observer.position=[0,0];observer.senseSources={vision:{source:'actual sight',grade:'none',sensitiveRange:10,vagueRange:20}};
  const target=out.actors.huang;target.position=[5,0];target.state.resourceCapabilities={veil:{id:'antiDetection',source:'actual source',grade:'D',level:2,mode:'sensory',scene:true}};
  out.actors=Object.fromEntries(['player','huang'].map(k=>[k,out.actors[k]]));
  schedulePassivePerception(out,{drawDice:()=>Array(200).fill(1)});
  assert.equal(locationPrecision(out,target,'player'),rank==='D'?'vague':'exact');
  assert.ok(Object.values(observer.state.resourceDetectionContests).some(r=>r.sense.automaticDetection));
  assert.equal(Object.keys(createOpeningRoster().player.senseSources??{}).length,0);
 }
 const x=scene('侦测潜行');x.plan.targetIds=['player'];let out=reduceRuleAction(x.root,x.q,{drawDice:dice});out.round=1;out.map={features:[]};out.instanceId='detect-bonus';out.actors.player.windSense=false;
 out.actors.player.position=[0,0];out.actors.huang.position=[1,0];out.actors=Object.fromEntries(['player','huang'].map(k=>[k,out.actors[k]]));out.ruleScene.perception={source,enabled:true,concealmentWaived:['huang']};
 const plain=structuredClone(out);plain.actors.player.state.activeResourceEffects=[];
 schedulePassivePerception(out,{drawDice:dice});schedulePassivePerception(plain,{drawDice:dice});
 const receipt=b=>Object.values(b.actors.player.state.resourceDetectionContests)[0].contest.observer;
 assert.equal(receipt(out).dp-receipt(plain).dp,12);
});
test('actual language components leave sound evidence without declaring every effect noisy',()=>{
 const x=scene('隐形术');x.plan.targetIds=['player'];x.plan.willingTargets=['player'];x.root.round=4;x.root.instanceId='spoken-spell';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const sound=out.actors.player.state.resourceSensoryCues[0];assert.equal(sound.kind,'sound');assert.equal(sound.suppression,'unavoidable');assert.equal(sound.round,4);assert.equal(sound.source,x.id);
});
