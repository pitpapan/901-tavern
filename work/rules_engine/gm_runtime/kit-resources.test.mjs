import {runKitMechanism} from './kit-runtime.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from '../combat/opening.mjs';
import {effectiveAttribute,attrAuto,effectiveSkill} from '../core.mjs';
import {applyKitAcquisition,chooseGuanlanAccumulation,guanlanInsight,settleGuanlanAdventure} from '../kit-state.mjs';
import {attackProfile,resolveDefense,damageEvent} from '../combat/engine.mjs';
import {derived,saveProfile} from '../combat/mechanics.mjs';
import {reduceRecovery} from '../recovery.mjs';
import {RESOURCE_CATALOG} from '../resource-catalog.mjs';
import {reduceRuleAction} from './rule-actions.mjs';
const source='隔离测试／resources正式正文',dice=()=>Array(100).fill(8);
function own(s,id,choices={}){(s.learnedResources??={})[id]={learned:true,source,kind:'technique',grade:'D',tree:'guanlan'};applyKitAcquisition(s,id,{source,...choices});}
function actor(){const a=createOpeningRoster().player;own(a.state,'guanlan-fa',{attributes:{感知:2},poolClassifications:{流风:'generic'}});return a;}
test('All current spells are catalogued once; catalog loading leaves T0 untouched',()=>{
 const before=createOpeningRoster();assert.equal(Object.values(RESOURCE_CATALOG).filter(x=>x.kind==='spell'&&!x.prohibited).length,208);
 assert.equal(Object.values(RESOURCE_CATALOG).filter(x=>x.prohibited).length,7);
 assert.deepEqual(createOpeningRoster(),before);assert.equal(before.player.state.guanlan,undefined);
 assert.equal(before.player.combatProfile.equipment.weapon.damage,6);
});
test('Guanlan attributes include autos; six choices have caps and energy never refills',()=>{
 const s=actor().state;assert.equal(effectiveAttribute(s,'感知'),6);assert.equal(attrAuto(s,'感知'),1);
 for(let i=0;i<6;i++){own(s,'test'+i);chooseGuanlanAccumulation(s,'test'+i,['guanwei','hanyang','yingwu'][Math.floor(i/2)],'流风');}
 assert.equal(effectiveAttribute(s,'感知'),8);assert.deepEqual(s.resources.流风,{current:22,max:32,generic:true,special:false});
 own(s,'test7');assert.throws(()=>chooseGuanlanAccumulation(s,'test7','hanyang','流风'),/两次/);
 assert.throws(()=>chooseGuanlanAccumulation(s,'test0','guanwei'),/已经/);
});
test('Guanlan crisis is a natural single D10, per condition and scene, independent of genetic locks',()=>{
 const s=actor().state;s.xp=0;const p={sceneId:'s',condition:'lethalSelf',qualified:true,source};
 assert.equal(guanlanInsight(s,p,10).success,true);assert.equal(s.guanlan.S,1);assert.equal(s.guanlan.wufaXP,1);assert.equal(s.geneticLock,undefined);
 assert.throws(()=>guanlanInsight(s,p,10),/已判定/);
 assert.equal(guanlanInsight(s,{...p,condition:'filledA'},8).success,false);
 settleGuanlanAdventure(s,'adventure1');assert.equal(s.xp,3);assert.equal(s.guanlan.S,2);assert.equal(s.guanlan.wufaXP,1);
 assert.throws(()=>settleGuanlanAdventure(s,'adventure1'),/已经/);
});
test('Guanlan rest replaces ordinary healing, including two days/two long rests for A',()=>{
 let a=actor();a.state.health.B=3;a.state.health.L=3;a.state.health.A=1;a.state.health.intact-=7;
 a=reduceRecovery(a,{type:'rest',rest:'short',minutes:15},{playerAuthorized:true,drawDice:dice}).actor;
 assert.equal(a.state.health.B,0);assert.equal(a.state.health.L,2);
 a=reduceRecovery(a,{type:'rest',rest:'long',minutes:1440},{playerAuthorized:true,drawDice:dice}).actor;
 assert.equal(a.state.health.A,1);
 a=reduceRecovery(a,{type:'rest',rest:'long',minutes:1440},{playerAuthorized:true,drawDice:dice}).actor;
 assert.equal(a.state.health.A,0);
});
test('Fengyou speed uses highest body-method bonus and current generic energy',()=>{
 const a=actor();a.state.equippedArmorClass='light';own(a.state,'fengyou-sheshibu');
 assert.equal(derived(a).speed,55);a.buffs.tengzhuan=true;assert.equal(derived(a).speed,55);
 a.state.resources.流风.current=0;assert.equal(derived(a).speed,45);assert.equal(a.state.huaJin.max,1);
});
test('Chengxin gift caps main skill, shares special slots without energy refill',()=>{
 const a=actor();a.state.skills.学识.level=4;own(a.state,'chengxin-xuanjian');
 assert.equal(effectiveSkill(a.state,'学识').level,5);assert.equal(effectiveSkill(a.state,'学识').auto,1);
 own(a.state,'fengyou-sheshibu');assert.deepEqual(a.state.huaJin,{current:0,max:2});
});
test('Chengxin observes DC3 once per evidence, routes through JS, target-specific attack and defense',()=>{
 const a=actor();own(a.state,'chengxin-xuanjian');const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.actors.player=a;
 const root={actors:b.actors,ruleScene:{objects:{mirror:{type:'kitResource',resourceId:'chengxin-xuanjian',source,actorIds:['player'],plans:{look:{source,sceneId:'s',targetId:'huang',evidenceId:'motion',observable:true,effectLine:true}}}}}};
 const q={kind:'rule',action:'mechanism',actorId:'player',objectId:'mirror',operation:'observe',part:'look'};
 const out=reduceRuleAction(root,q,{drawDice:dice});assert.equal(out.result.roll.success,true);assert.throws(()=>reduceRuleAction(out,q,{drawDice:dice}),/不能重复/);
 const before=attackProfile(b,'player',{abilityId:'strike',targetId:'huang'}).rawDP;b.actors=out.actors;
 assert.equal(attackProfile(b,'player',{abilityId:'strike',targetId:'huang'}).rawDP,before+2);
 assert.equal(resolveDefense(b,'player','huang',{defenseMode:'normal'}).parts.kitInsight,2);
});
test('Chengxin conversion consumes only declared eligible post-mitigation damage and empty slots',()=>{
 const a=actor();own(a.state,'chengxin-xuanjian');own(a.state,'fengyou-sheshibu');a.state.huaJin.acceptNext=2;
 const result={damage:[]};damageEvent(a,[{amount:3,severity:'L',kind:'physical'}],false,result);
 assert.equal(a.state.huaJin.current,2);assert.equal(a.state.health.L,1);
 a.state.huaJin.acceptNext=2;damageEvent(a,[{amount:2,severity:'L',kind:'physical'}],false,result);assert.equal(a.state.health.L,3);
 a.state.huaJin.current=0;a.state.huaJin.acceptNext=2;damageEvent(a,[{amount:2,severity:'A',kind:'physical'}],false,result);assert.equal(a.state.health.A,2);assert.equal(a.state.huaJin.current,0);
});
test('Yingwu applies once to attack and saves, no weapon or damage cap inflation',()=>{
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}}),a=b.actors.player;
 const attack=attackProfile(b,'player',{abilityId:'strike',targetId:'huang'}),save=saveProfile(a,'reflex').dp;
 own(a.state,'guanlan-fa');own(a.state,'test');chooseGuanlanAccumulation(a.state,'test','yingwu');
 const after=attackProfile(b,'player',{abilityId:'strike',targetId:'huang'});assert.equal(after.rawDP,attack.rawDP+1);assert.equal(after.cap,attack.cap);assert.equal(after.weapon,attack.weapon);assert.equal(saveProfile(a,'reflex').dp,save+1);
});


test('Guanlan insight rejects real resource unconsciousness and wounds without spending the opportunity or drawing',()=>{
 for(const cause of ['resource','wounds','sleep']){
  const a=actor(),s=a.state,p={source,sceneId:'actual-crisis',condition:'lethalSelf',qualified:true};
  if(cause==='resource')s.resourceConditions={dark:{effect:'unconscious',remainingMinutes:480}};
  if(cause==='wounds'){s.health.L=s.health.intact;s.health.intact=0;}
  if(cause==='sleep')s.sleeping={source};
  const before=structuredClone(s);
  assert.throws(()=>guanlanInsight(s,p,10),/意识|清醒/);assert.deepEqual(s,before);
  const root={actors:{player:a},ruleScene:{objects:{insight:{type:'kitResource',resourceId:'guanlan-fa',source,actorIds:['player'],plans:{actual:p}}}}};
  let draws=0;
  assert.throws(()=>runKitMechanism(root,{actorId:'player',objectId:'insight',operation:'insight',part:'actual'},{drawDice:()=>{draws++;return [10];}}),/意识|清醒/);
  assert.equal(draws,0);assert.deepEqual(root.actors.player.state,before);
 }
});


test('Guanlan insight uses the completed B-only consciousness check instead of requiring another roll',()=>{
 const a=actor(),s=a.state,p={source,sceneId:'actual-B-crisis',condition:'lethalSelf',qualified:true};
 s.health.B=s.health.intact;s.health.intact=0;
 assert.throws(()=>guanlanInsight(s,p,10),e=>e.code==='NEEDS_INPUT'&&e.field==='health.consciousness');
 const root={actors:{player:a},ruleScene:{objects:{insight:{type:'kitResource',resourceId:'guanlan-fa',source,actorIds:['player'],plans:{actual:p}}}}};
 let draws=0;
 const out=reduceRuleAction(root,{kind:'rule',action:'mechanism',actorId:'player',objectId:'insight',operation:'insight',part:'actual',preActionDC:1},{drawDice:()=>++draws===1?dice():[10]});
 assert.equal(draws,2);assert.equal(out.actors.player.state.guanlan.wufaXP,1);
 assert.equal(out.actors.player.state.guanlan.insightEvents.length,1);
});
