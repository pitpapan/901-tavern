import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster} from './combat/opening.mjs';
import {purchaseLearning} from './growth-pricing.mjs';
import {claimLearningGrant} from './resource-acquisition.mjs';
import {resourceBonus,RESOURCE_DEFINITIONS} from './resource-definitions.mjs';
import {reduceRecovery} from './recovery.mjs';
import {attrAuto} from './core.mjs';
const source='隔离测试/实际取得',offer=(grade,choices)=>({id:'mage'+grade,resourceId:'imperial-mage',name:'帝国法师',kind:'acquisition',grade,baseCost:grade==='D'?15:35,adopted:true,source,actorIds:['player'],requirementsMet:true,acquisitionChoices:choices});
function learn(primary='咒法'){const s=createOpeningRoster().player.state;s.xp=100;return purchaseLearning(s,offer('D',{primary,pool:'普通魔力',initialCurrent:0}),{actorId:'player'}).state;}
test('D acquisition cannot unlock a C secondary specialization or charge XP on rejection',()=>{
 const s=createOpeningRoster().player.state;s.xp=100;const before=structuredClone(s);
 assert.throws(()=>purchaseLearning(s,offer('D',{primary:'塑能',secondary:'心灵',pool:'普通魔力',initialCurrent:0}),{actorId:'player'}),/此等级尚不能选择/);
 assert.deepEqual(s,before);assert.equal(resourceBonus(learn('塑能'),'mindStatusReduction'),0);
});
test('staged acquisition uses a selected single pool, does not refill, and C retains the actual D choices',()=>{
 let s=learn(),before=structuredClone(s),max=s.resources['普通魔力'].max;
 assert.equal(s.xp,85);assert.equal(s.resources['普通魔力'].current,0);
 const out=purchaseLearning(s,offer('C',{secondary:'炼金',sameSource:true}),{actorId:'player'});s=out.state;
 assert.deepEqual(before.resources['普通魔力'],{current:0,max,generic:true,special:false,origin:'imperial-mage'});
 assert.equal(before.learnedResources['imperial-mage'].grade,'D');assert.deepEqual(before.learnedResources['imperial-mage'].appliedStages,['D']);
 assert.equal(s.xp,50);assert.equal(s.resources['普通魔力'].max,max+10);assert.equal(s.resources['普通魔力'].current,0);
 assert.equal(s.casting.imperial.grade,'C');assert.equal(s.casting.imperial.primary,'咒法');assert.equal(s.casting.imperial.secondary,'炼金');
 assert.throws(()=>purchaseLearning(s,offer('C',{sameSource:true}),{actorId:'player'}),/已完整学习/);
});
test('free learning consumes only the matching D grant, never XP or an unrelated school',()=>{
 const s=learn('治愈'),grant='imperial-mage/D/initial';
 const healing=Object.entries(RESOURCE_DEFINITIONS).find(([,d])=>d.grade==='D'&&d.learning&&d.schools?.includes('治愈'))[0];
 const fire=Object.entries(RESOURCE_DEFINITIONS).find(([,d])=>d.grade==='D'&&d.learning&&d.schools?.includes('塑能'))[0];
 assert.throws(()=>claimLearningGrant(s,grant,[fire],RESOURCE_DEFINITIONS,source),/专业/);
 const xp=s.xp;assert.equal(claimLearningGrant(s,grant,[healing],RESOURCE_DEFINITIONS,source).remaining,0);assert.equal(s.xp,xp);
 assert.throws(()=>claimLearningGrant(s,grant,[healing],RESOURCE_DEFINITIONS,source),/名额/);
});
test('a main specialization power bonus applies once, while a secondary grants only entry benefits',()=>{
 const s=purchaseLearning(learn('塑能'),offer('C',{secondary:'心灵',sameSource:true}),{actorId:'player'}).state;
 assert.equal(resourceBonus(s,'spellPower',{schools:['塑能','塑能']}),1);
 assert.equal(resourceBonus(s,'spellPower',{schools:['心灵']}),0);
 assert.equal(resourceBonus(s,'mindStatusReduction'),4);
});
test('mana meditation and full long rest use acquired pool rules without adding another pool',()=>{
 const a=createOpeningRoster().player;a.state=learn();a.state.resources['普通魔力'].current=0;
 const out=reduceRecovery(a,{type:'meditate',resource:'普通魔力',minutes:60},{playerAuthorized:true});
 assert.equal(out.actor.state.resources['普通魔力'].current,Math.min(a.state.resources['普通魔力'].max,attrAuto(a.state,'智力')+attrAuto(a.state,'感知')));
 const rest=reduceRecovery(a,{type:'rest',rest:'long',minutes:480},{playerAuthorized:true});assert.equal(rest.actor.state.resources['普通魔力'].current,a.state.resources['普通魔力'].max);
});
test('D spell upgrade has distinct retain/replace XP and keeps the original acquisition record immutable',()=>{
 const id=Object.keys(RESOURCE_DEFINITIONS).find(id=>id.endsWith(':魔法飞弹'));
 for(const [versionMode,price]of [['retain',25],['replace',15]]){
  const s=createOpeningRoster().player.state;s.xp=50;s.casting={imperial:{grade:'C'}};s.learnedResources={[id]:{learned:true,grade:'D',source}};
  const out=purchaseLearning(s,{id:'upgrade',resourceId:id,name:'魔法飞弹C',grade:'C',kind:'evolution',baseCost:price,versionMode,adopted:true,source,actorIds:['player'],requirementsMet:true},{actorId:'player'});
  assert.equal(out.state.xp,50-price);assert.deepEqual(out.state.learnedResources[id].versions,versionMode==='retain'?['D','C']:['C']);assert.equal(s.learnedResources[id].grade,'D');
 }
});
test('dual-school prerequisites apply to paid and granted spells without spending XP or slots on failure',()=>{
 const id='imperial-magic:C:狂战士之魂',s=learn('幻术');
 s.casting.imperial.grade='C';
 s.skills.神秘={level:4,subs:{变化:{level:1},幻术:{level:1}}};
 const q={id:'dual',resourceId:id,name:'狂战士之魂',grade:'C',kind:'technique',baseCost:25,adopted:true,source,actorIds:['player'],requirementsMet:true};
 const before=structuredClone(s);assert.throws(()=>purchaseLearning(s,q,{actorId:'player'}),/专业资格/);assert.deepEqual(s,before);
 s.skills.神秘.subs.诅咒={level:1};assert.equal(purchaseLearning(s,q,{actorId:'player'}).result.charged,25);
 const grant='imperial-mage/D/initial',illusion='imperial-magic:D:杰斯的幻象';
 assert.throws(()=>claimLearningGrant(s,grant,[illusion],RESOURCE_DEFINITIONS,source),/专业资格/);
 assert.deepEqual(s.learningGrants[grant].used,[]);
 s.skills.神秘.subs.心灵={level:1};claimLearningGrant(s,grant,[illusion],RESOURCE_DEFINITIONS,source);
 assert.deepEqual(s.learningGrants[grant].used,[illusion]);
});
test('learning cannot relabel native C as D or bypass the known D upgrade prerequisite',()=>{
 const s=learn(),before=structuredClone(s);
 const q={id:'spell',resourceId:'imperial-magic:C:阳炎炮',name:'阳炎炮',grade:'D',kind:'technique',baseCost:25,adopted:true,source,actorIds:['player'],requirementsMet:true};
 assert.throws(()=>purchaseLearning(s,q,{actorId:'player'}),/原生C|对应等级/);assert.deepEqual(s,before);
 s.casting.imperial.grade='C';
 assert.throws(()=>purchaseLearning(s,{...q,resourceId:'imperial-magic:D:魔法飞弹',name:'魔法飞弹',grade:'C',baseCost:10},{actorId:'player'}),/先学D版/);
});
