import test from 'node:test';import assert from 'node:assert/strict';
import {createCharacter,check,statusLevel,beginTurn,resolveDamage} from './core.mjs';
import {limbMovement,limbEffects,statusActionPermission,statusEvent,burningDamage} from './status-rules.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
const dice=()=>Array(512).fill(1);
const state=()=>createCharacter({attributes:{力量:3,敏捷:3,智力:3,感知:3,意志:3,风度:3},skills:{运动:{level:1},求生:{level:1}},xp:0});
const root=events=>({actors:{player:{state:beginTurn(state()).state}},ruleScene:{events}});
const event=(type,more)=>({type,source:'已确认测试来源',actorIds:['player'],...more});
test('limb impairment is specific to limbs and movement modes, with sourced threshold',()=>{
 const s=state();s.statuses=[{type:'肢体妨害',limbId:'leftLeg',points:2,source:'创伤'}];s.anatomy={movementModes:{land:{source:'人类双腿步行',limbs:['leftLeg','rightLeg'],fullPenaltyAt:2},swim:{source:'本次仅用双手划水',limbs:['leftArm','rightArm'],fullPenaltyAt:2}}};
 assert.equal(limbMovement(s,11),10);assert.equal(limbMovement(s,11,'swim'),11);assert.equal(limbEffects(s,['leftArm']).penalty,0);
 s.statuses.push({type:'肢体妨害',limbId:'rightLeg',points:4,source:'创伤'});assert.equal(limbMovement(s,11),1);assert.equal(limbEffects(s,['rightLeg']).disabled,true);
 assert.equal(check(s,{attribute:'力量',context:{limbIds:['rightLeg']},dice:dice()}).eligible,false);
});
test('source-enabled permanent blindness survives ordinary status removal',()=>{
 const r=root({blind:event('statusApply',{status:{type:'目眩',points:9},catastrophicAllowed:true})});
 statusEvent(r,{actorId:'player',eventId:'blind'},{drawDice:dice});r.actors.player.state.statuses=[];
 assert.equal(statusLevel(r.actors.player.state,'目眩').severe,true);
 assert.equal(check(r.actors.player.state,{attribute:'感知',context:{visual:true},dice:dice()}).eligible,false);
 assert.throws(()=>statusEvent(r,{actorId:'player',eventId:'blind'},{drawDice:dice}),/已结算/);
});
test('ordinary direct status does not silently acquire catastrophic permission',()=>{
 const r=root({blind:event('statusApply',{status:{type:'目眩',points:9}})});statusEvent(r,{actorId:'player',eventId:'blind'},{drawDice:dice});
 assert.equal(r.actors.player.state.permanentConditions,undefined);
});
test('fear requires actual perception and an escape, without selecting an action',()=>{
 const s=state();s.statuses=[{type:'恐惧',points:4,source:'恐惧',perceived:true}];
 assert.throws(()=>statusActionPermission(s,{abilityId:'strike'}),/逃离/);
 assert.doesNotThrow(()=>statusActionPermission(s,{abilityId:'move'},{escape:true}));s.statuses[0].perceived=false;
 assert.doesNotThrow(()=>statusActionPermission(s,{abilityId:'strike'}));
});
test('irresistible source order permits only its declared action under depression',()=>{
 const r=root({order:event('statusOrder',{statusSource:'压抑',text:'记录这里的声音',irresistible:true,actions:[{action:'check',attribute:'感知'}]})});
 r.actors.player.state.statuses=[{type:'沮丧',source:'压抑',points:4}];
 statusEvent(r,{actorId:'player',eventId:'order'},{drawDice:dice});
 const out=reduceRuleAction(r,{kind:'rule',action:'check',actorId:'player',attribute:'感知',dc:1},{drawDice:dice});assert.equal(out.result.eligible,true);
 assert.throws(()=>reduceRuleAction(r,{kind:'rule',action:'check',actorId:'player',attribute:'智力',dc:1},{drawDice:dice}),/沮丧/);
});
test('adopted fire counteraction uses effective cold points and physical extinguishing respects magic',()=>{
 const r=root({fire:event('statusApply',{status:{type:'燃烧',points:3,fireKind:'magic',remainingMinutes:1,tickBoundary:'turn'}}),water:event('extinguish',{method:'water'}),counter:event('statusCounteract',{removals:[{source:'已确认测试来源',type:'燃烧',points:1}]})});
 statusEvent(r,{actorId:'player',eventId:'fire'},{drawDice:dice});assert.throws(()=>statusEvent(r,{actorId:'player',eventId:'water'},{drawDice:dice}),/魔法火焰/);
 r.actors.player.state.statuses.push({type:'冻结',source:'实际寒冷',points:1});statusEvent(r,{actorId:'player',eventId:'counter'},{drawDice:dice});assert.equal(r.actors.player.state.statuses[0].points,2);
 assert.equal(burningDamage(r.actors.player,'action'),null);assert.equal(burningDamage(r.actors.player,'turn').actualDamage,2);
});
test('damage wakes normal magical sleep without removing unrelated state',()=>{
 const s=state();s.sleeping={source:'Sleep'};s.statuses=[{type:'疲乏',points:1,source:'劳累'}];
 const out=resolveDamage(s,{amount:1,severity:'B',kind:'physical'});assert.equal(out.state.sleeping,undefined);assert.equal(out.state.statuses.length,1);
});

test('PHB burning defaults to the end of the actor action, not each sub-action',()=>{
 const r=root({fire:event('statusApply',{status:{type:'燃烧',points:2,fireKind:'adhesive'}})});
 statusEvent(r,{actorId:'player',eventId:'fire'},{drawDice:dice});
 assert.equal(burningDamage(r.actors.player,'action'),null);
 assert.equal(burningDamage(r.actors.player,'turn').actualDamage,2);
 // Existing MVU fires without a boundary follow the same source rule.
 delete r.actors.player.state.statuses[0].tickBoundary;
 assert.equal(burningDamage(r.actors.player,'action'),null);
 assert.equal(burningDamage(r.actors.player,'turn').actualDamage,2);
});
