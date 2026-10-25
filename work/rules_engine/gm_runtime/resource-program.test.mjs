import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from '../combat/opening.mjs';
import {check,statusLevel,applyStatus,applyWounds} from '../core.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {RESOURCE_DEFINITIONS} from '../resource-definitions.mjs';
import {stackEffects} from '../resource-effects.mjs';
import {resolveDefense,damageEvent} from '../combat/engine.mjs';
import {advanceTime} from '../recovery.mjs';
import {reduceRuleAction} from './rule-actions.mjs';
import {fireResourceTriggers} from './resource-program.mjs';
const dice=()=>Array(200).fill(8),source='隔离规则测试/已获授权的虚构状态';
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
test('an incomplete saved caster is missing input rather than permission to cast a D spell',()=>{
 const x=scene('疗伤');delete x.root.actors.player.state.casting.imperial.grade;
 const before=structuredClone(x.root);assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/等级施法职能/);assert.deepEqual(x.root,before);
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
test('a next-melee rider waits for a matching hit, fires once and does not create a second attack',()=>{
 const x=scene('炽焰斩');let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.deepEqual(fireResourceTriggers(out,'player','hit',{targetId:'huang',context:{melee:false,skill:'射击'},drawDice:dice}),[]);
 const fired=fireResourceTriggers(out,'player','hit',{targetId:'huang',context:{melee:true,skill:'白刃'},drawDice:dice});assert.equal(fired.length,1);assert.equal(fired[0].damage[0].actualDamage,3);
 assert.equal(out.actors.huang.state.statuses.find(x=>x.type==='燃烧').points,3);
 assert.deepEqual(fireResourceTriggers(out,'player','hit',{targetId:'huang',context:{melee:true,skill:'白刃'},drawDice:dice}),[]);
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
test('fear howl affects only the actual enemies in its complete field area',()=>{
 const x=scene('恐惧嚎叫','C');x.root.actors.huang.team='enemy';x.plan.areaComplete=true;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 assert.equal(out.actors.huang.state.statuses.find(s=>s.type==='恐惧').scene,true);
 x.plan.targetIds=['player'];assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/敌方|阵营/);
});
test('Thoth hymn fixes the selected main skill and shares same-source recast policy',()=>{
 const x=scene('透特之咏');x.plan.targetIds=['player'];x.q.operation='castLore';
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const get=(s,skill)=>check(s,{attribute:'智力',skill,dice:dice()}).dp;
 assert.equal(get(out.actors.player.state,'学识')-get(x.root.actors.player.state,'学识'),9);
 assert.equal(get(out.actors.player.state,'神秘'),get(x.root.actors.player.state,'神秘'));
 out=reduceRuleAction(out,{...x.q,operation:'cast'},{drawDice:dice});
 assert.equal(get(out.actors.player.state,'学识'),get(x.root.actors.player.state,'学识'));
 assert.equal(get(out.actors.player.state,'神秘')-get(x.root.actors.player.state,'神秘'),9);
});
test('Bane applies declared lucky attack/save penalties after a successful opposed spell',()=>{
 const x=scene('灾祸术');x.root.actors.huang.state.attributes.意志=0;x.root.actors.huang.state.attributes.风度=0;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 const effects=out.actors.huang.state.activeResourceEffects[0].effects;
 assert.deepEqual(effects.map(e=>e.value),[-6,-6]);
 assert.equal(effects[0].group,'luck');
});
test('Troublemaker fire pays once and resolves every selected target separately',()=>{
 const x=scene('惹事人烈焰','C');x.plan.targetIds=['huang','jiang'];x.plan.distances={huang:1,jiang:1};
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.result.targets.length,2);assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 assert.ok(out.result.targets.every(t=>t.steps.some(s=>s.op==='attack')));
});
test('Searing Pain selection is a registered variant with no free-form numeric status',()=>{
 const x=scene('灼热之痛');x.q.operation='castHatred';
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.ok(out.result.targets[0].steps.some(s=>s.op==='attack'));
 assert.equal(out.actors.player.state.resources['测试魔力'].current,19);
 assert.ok(!out.actors.huang.state.statuses.some(s=>s.type==='剧痛'));
});
test('resistance analysis bypasses resistance and its reduction stays scoped to the actual caster',()=>{
 const x=scene('解析抗力'),missile=scene('魔法飞弹').id;
 x.root.actors.huang.state.activeResourceEffects=[{sourceId:'test',effects:[{stat:'spellResistance',value:5}]}];
 let out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.result.targets[0].steps.find(s=>s.op==='inspect').value,5);
 out.actors.player.state.learnedResources[missile]={learned:true,grade:'D',source};
 out.ruleScene.objects.spell.resourceId=missile;
 out.actors.second=structuredClone(out.actors.player);out.actors.second.id='second';
 out.ruleScene.objects.spell.actorIds.push('second');
 const own=reduceRuleAction(out,x.q,{drawDice:dice});
 assert.equal(own.result.targets[0].effectivePower,3); // never 3 + an unused reduction
 const other=reduceRuleAction(out,{...x.q,actorId:'second'},{drawDice:dice});
 assert.equal(other.result.targets[0].effectivePower,0);
 assert.equal(other.result.targets[0].steps.length,0);
});
test('school resistance requires an authored enum choice and only resists that school after reload',()=>{
 const x=scene('法术抵御','C');const before=structuredClone(x.root);
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/专业|specialization/);assert.deepEqual(x.root,before);
 x.plan.inputs={specialization:'塑能'};
 const out=JSON.parse(JSON.stringify(reduceRuleAction(x.root,x.q,{drawDice:dice})));
 const s=out.actors.huang.state;
 const effect=s.activeResourceEffects[0].effects[0];assert.equal(effect.value,21);
 assert.equal(effect.when.right,'塑能');
 const other=scene('魔法飞弹');other.root.actors.huang.state=s;
 assert.equal(reduceRuleAction(other.root,other.q,{drawDice:dice}).result.targets[0].effectivePower,0);
 other.plan.inputs={specialization:'任意数值'};
 assert.equal(out.actors.player.state.resources['测试魔力'].current,17);
 x.plan.inputs.specialization='任意数值';assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/专业|specialization/);
});
test('declarative repetitions charge extra projectiles once and may repeat an actual target',()=>{
 const x=scene('魔法飞弹','C');x.plan.targetIds=['huang','huang'];
 const before=structuredClone(x.root),out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.result.targets.length,2);assert.equal(out.result.cost,5);
 assert.equal(out.actors.player.state.resources['测试魔力'].current,15);assert.deepEqual(x.root,before);
 x.plan.targetIds.push('huang');assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/次数|枚数/);
});
test('Chandra double projectile checks free hands and pays for every independently rolled fireball',()=>{
 const x=scene('茜卓的旋炎咒','C');x.plan.targetIds=['huang','huang'];
 assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/双手|前提/);
 x.plan.inputs={handsFree:true};const out=reduceRuleAction(x.root,x.q,{drawDice:dice});
 assert.equal(out.result.cost,6);assert.equal(out.result.targets.length,2);
 assert.ok(out.result.targets.every(t=>t.steps.some(s=>s.op==='attack')));
});
test('Eldritch blast has exactly spell-rank attacks with a single casting cost',()=>{
 const x=scene('魔能爆','C');x.plan.targetIds=['huang','huang'];
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice});assert.equal(out.result.cost,3);
 assert.equal(out.result.targets.length,2);
 x.plan.targetIds=['huang'];assert.throws(()=>reduceRuleAction(x.root,x.q,{drawDice:dice}),/次数|枚数/);
});
test('temporary strength resizes actual slots and expiry converts overflow without healing or resetting the save',()=>{
 const x=scene('大地之力');x.plan.willingTargets=['huang'];
 const original=x.root.actors.huang.state.derived.hpMax;
 const out=reduceRuleAction(x.root,x.q,{drawDice:dice}),target=out.actors.huang;
 assert.equal(target.state.derived.hpMax,original+8);
 assert.equal(target.state.health.intact,original+8);
 target.state=applyWounds(target.state,{L:original+4}).state;
 const saved={xp:target.state.xp,resources:structuredClone(target.state.resources)};
 advanceTime(target,1,[],{drawDice:dice}); // a scene effect does not end with a minute
 assert.equal(target.state.derived.hpMax,original+8);
 target.state.activeResourceEffects[0].remainingMinutes=1;
 advanceTime(target,1,[],{drawDice:dice});
 assert.equal(target.state.derived.hpMax,original);
 assert.equal(target.state.health.intact,0);assert.equal(target.state.health.L,original-4);assert.equal(target.state.health.A,4);
 assert.equal(target.state.xp,saved.xp);assert.deepEqual(target.state.resources,saved.resources);
});
