import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from './core.mjs';
const dice=Array(200).fill(1);
const opportunity={id:'source-test',source:'PHB 基因锁17–36',kind:'explicit_rule'};
const person=()=>core.createCharacter({attributes:{力量:5,敏捷:5,智力:6,感知:6,意志:5,风度:5},xp:30,geneticLock:{highestStage:1,successfulUnlocks:{1:1,2:0}}});
test('PHB voluntary unlock pays only on failure and applies immediate mapped backlash',()=>{
 const s=person();const success=core.resolveGeneticUnlock(s,{stage:1,mode:'voluntary',opportunity,dice:[9]});
 assert.equal(success.state.xp,30);assert.equal(success.state.geneticLock.activeStage,1);
 const failed=core.resolveGeneticUnlock(s,{stage:1,mode:'voluntary',opportunity,dice:[1]});
 assert.equal(failed.state.xp,23);assert.equal(failed.state.attributeDamage.力量,2);
 assert.equal(core.statusLevel(failed.state,'剧痛').points,10);
});
test('PHB stage two commits selected physical bonus, extra successes, history and doubled first duration',()=>{
 let s=core.resolveGeneticUnlock(person(),{stage:1,opportunity,dice:[9]}).state;
 s=core.resolveGeneticUnlock(s,{stage:2,attribute:'敏捷',opportunity,dice:[10,10]}).state;
 assert.equal(s.geneticLock.successfulUnlocks[2],1);assert.equal(s.geneticLock.activeStage,2);
 assert.equal(core.effectiveAttribute(s,'敏捷'),10);
 assert.equal(core.check(s,{attribute:'敏捷',dice}).autoSuccesses,3);
 assert.equal(s.geneticLock.active[1].limit,10);assert.equal(s.geneticLock.active[2].limit,5);
 assert.equal(core.geneticCheckBonus(s,{willEligible:true}),1);
 assert.equal(core.effectiveSkill(s,'原先未学').trained,true);
});
test('PHB genetic overtime debt is deferred and ending applies each stage backlash once',()=>{
 let s=core.resolveGeneticUnlock(person(),{stage:1,opportunity,dice:[9]}).state;
 for(let n=0;n<8;n++)s=core.advanceGeneticLock(s,{dice}).state;
 assert.equal(s.attributeDamage.力量??0,0);assert.equal(core.statusLevel(s,'剧痛').points,0);
 assert.equal(s.geneticLock.active[1].pain,6);assert.equal(s.geneticLock.active[1].damage,2);
 const ended=core.endGeneticLock(s,{dice});assert.equal(ended.state.attributeDamage.力量,2);
 assert.equal(core.statusLevel(ended.state,'剧痛').points,14);assert.equal(ended.state.geneticLock.activeStage,0);
 assert.throws(()=>core.endGeneticLock(ended.state,{dice}),/未开启/);
});
test('stage two strength temporarily changes HP and returns it without granting permanent capacity',()=>{
 const base=person();let s=core.resolveGeneticUnlock(base,{stage:1,opportunity,dice:[9]}).state;
 s=core.resolveGeneticUnlock(s,{stage:2,attribute:'力量',opportunity,dice:[10,10]}).state;
 assert.equal(s.derived.hpMax,base.derived.hpMax+10);assert.equal(s.health.intact,base.health.intact+10);
 s=core.endGeneticLock(s,{dice}).state;assert.equal(s.derived.hpMax,base.derived.hpMax);assert.equal(s.health.intact,base.health.intact);
 assert.equal(s.geneticLock.temporaryGreatPowers,undefined);
});
