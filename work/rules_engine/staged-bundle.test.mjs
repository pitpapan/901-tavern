import test,{beforeEach,afterEach,describe} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RESOURCE_DEFINITIONS as definitions,resourceBonus} from './resource-definitions.mjs';
import {createOpeningRoster} from './combat/opening.mjs';
import {purchaseLearning} from './growth-pricing.mjs';
import {claimLearningGrant} from './resource-acquisition.mjs';
import {reduceRecovery} from './recovery.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
import {RESOURCE_CATALOG} from './resource-catalog.mjs';
import {createOpeningFixture} from './gm_runtime/opening.mjs';
import {createIntegratedSession} from './gm_runtime/integrated.mjs';
import {createReplayCheckRuntime} from './gm_runtime/replay-check.mjs';
const id='candidate-901-magic-bundle-ba577210e69dafd5',source='隔离测试/已登记授学';
const doc=JSON.parse(fs.readFileSync(new URL('../../../901-resource-authoring-kit/outputs/施法体系适配-20261024/execution/contracts/'+id+'.rule.json',import.meta.url)));
describe('arcane staged acquisition',()=>{
let old,oldCatalog;
beforeEach(()=>{old=definitions[id];oldCatalog=RESOURCE_CATALOG[id];definitions[id]={...structuredClone(doc.definition),identity:doc.identity,contractVersion:doc.version,operations:['claimLearning']};RESOURCE_CATALOG[id]={id,name:'法师',kind:'bundle',source:doc.reading.path};});
afterEach(()=>{if(old)definitions[id]=old;else delete definitions[id];if(oldCatalog)RESOURCE_CATALOG[id]=oldCatalog;else delete RESOURCE_CATALOG[id];});
const offer=(grade='D',choices={specialization:'奥术',pool:'精神魔力',initialCurrent:0})=>({id:'mage-'+grade,resourceId:id,name:'法师·奥术',kind:'acquisition',grade,baseCost:grade==='D'?15:35,adopted:true,source,actorIds:['player'],requirementsMet:true,contractVersion:doc.version,acquisitionChoices:choices});
function fresh(){const s=createOpeningRoster().player.state;s.xp=100;return s;}
const buy=(s,o)=>purchaseLearning(s,o,{actorId:'player'}).state;
const learned=()=>buy(fresh(),offer());
test('arcane D then C acquisition pays increments and preserves sources, wounds, current pools and T0',()=>{
 const s=fresh(),before=structuredClone(s);let d=buy(s,offer());assert.deepEqual(s,before);
 assert.equal(d.xp,85);assert.equal(d.resources.精神魔力.current,0);
 assert.equal(d.resources.精神魔力.max,Math.floor((s.attributes.智力+s.attributes.感知)/4));
 const max=d.resources.精神魔力.max;d=buy(JSON.parse(JSON.stringify(d)),offer('C',{}));
 assert.equal(d.xp,50);assert.equal(d.resources.精神魔力.max,max+10);assert.equal(d.resources.精神魔力.current,0);
 assert.deepEqual(d.health,before.health);assert.deepEqual(d.attributes,before.attributes);
 assert.deepEqual(d.learnedResources[id].completedStages,['D','C']);assert.equal(d.casting[id].grade,'C');
 assert.deepEqual(d.learningGrants[id+'/D/gift'].used,[]);assert.deepEqual(d.learningGrants[id+'/C/gift'].used,[]);
 assert.equal(createOpeningRoster().player.state.learnedResources?.[id],undefined);
});
test('bundle rejects skipped, repeated, unsupported, repriced and changed choices before mutation',()=>{
 for(const o of [offer('C',{}),{...offer(),baseCost:1},{...offer(),contractVersion:'old'},offer('D',{specialization:'火焰',pool:'精神魔力',initialCurrent:0}),offer('B',{})]){
  const s=fresh(),before=structuredClone(s);assert.throws(()=>buy(s,o));assert.deepEqual(s,before);
 }
 const d=learned(),before=structuredClone(d);
 for(const o of [offer(),offer('C',{pool:'别的池'}),offer('C',{specialization:'冰霜'}),offer('C',{initialCurrent:99})])assert.throws(()=>buy(d,o));
 assert.deepEqual(d,before);const c=buy(d,offer('C',{}));assert.throws(()=>buy(c,offer('C',{})));
});
test('bundle installments validate choices before charging, bind contract and grant only at completion',()=>{
 const s=fresh(),o={...offer(),payments:{a:{xp:5},b:{xp:10}}};
 const a=purchaseLearning(s,o,{actorId:'player',paymentId:'a'});assert.equal(a.state.xp,95);assert.equal(a.state.learnedResources?.[id],undefined);
 assert.throws(()=>purchaseLearning(a.state,o,{actorId:'player',paymentId:'a'}));
 const b=purchaseLearning(JSON.parse(JSON.stringify(a.state)),o,{actorId:'player',paymentId:'b'});assert.equal(b.state.xp,85);assert.equal(b.state.casting[id].grade,'D');
 const bad={...o,acquisitionChoices:{...o.acquisitionChoices,initialCurrent:999}};
 assert.throws(()=>purchaseLearning(s,bad,{actorId:'player',paymentId:'a'}));assert.equal(s.xp,100);
});
test('opening another sourced mental pool grants five capacity once and preserves other caster functions',()=>{
 const s=fresh();s.resources.精神魔力={kind:'精神魔力',generic:true,special:false,origin:'other',current:2,max:8};
 s.casting={imperial:{grade:'C',pool:'旧池'}};const old=structuredClone(s.casting.imperial);
 const d=buy(s,offer('D',{specialization:'奥术',pool:'精神魔力'}));assert.equal(d.resources.精神魔力.max,13);assert.equal(d.resources.精神魔力.current,2);
 const c=buy(d,offer('C',{}));assert.equal(c.resources.精神魔力.max,23);assert.deepEqual(c.casting.imperial,old);
 const bad=fresh();bad.resources.精神魔力={current:2,max:8,generic:true};assert.throws(()=>buy(bad,offer()));
});
test('each stage grants one legal matching spell without XP or replacing the D gift',()=>{
 let s=learned();const dspell='imperial-magic:D:魔能爆';
 claimLearningGrant(s,id+'/D/gift',[dspell],definitions,source);assert.equal(s.xp,85);
 assert.equal(s.learnedResources[dspell].casterSource,id);assert.throws(()=>claimLearningGrant(s,id+'/D/gift',[dspell],definitions,source));
 s=buy(s,offer('C',{}));const cspell=Object.keys(definitions).find(k=>definitions[k].grade==='C'&&definitions[k].learning&&!definitions[k].requiresAllSchools&&!definitions[k].prohibited&&definitions[k].identity?.tree==='imperial');
 assert.ok(cspell);assert.throws(()=>claimLearningGrant(s,id+'/C/gift',['imperial-magic:D:魔法飞弹'],definitions,source));
 claimLearningGrant(s,id+'/C/gift',[cspell],definitions,source);assert.equal(s.xp,50);assert.equal(s.learnedResources[dspell].grade,'D');
 assert.equal(s.learnedResources[cspell].grade,'C');assert.deepEqual(s.learningGrants[id+'/D/gift'].used,[dspell]);
});
test('arcane spell DP uses the actual damage type and acquired record; mental recovery uses actual time',()=>{
 let s=learned();assert.equal(resourceBonus(s,'check',{casting:true,spellDamageTypes:['force']}),6);
 assert.equal(resourceBonus(s,'check',{casting:true,spellDamageTypes:['fire']}),0);
 assert.equal(resourceBonus(s,'check',{casting:false,spellDamageTypes:['force']}),0);
 const bad=structuredClone(s);bad.learnedResources[id].qualificationVersion='old';assert.equal(resourceBonus(bad,'check',{casting:true,spellDamageTypes:['force']}),0);
 const empty=structuredClone(s);empty.resources.精神魔力.max=0;assert.equal(resourceBonus(empty,'check',{casting:true,spellDamageTypes:['force']}),0);
 const a=createOpeningRoster().player;a.state=s;const rested=reduceRecovery(a,{type:'rest',rest:'long',minutes:480},{playerAuthorized:true});
 assert.equal(rested.actor.state.resources.精神魔力.current,s.resources.精神魔力.max);
});
test('C gift may upgrade the already granted D spell while retaining its original version and source',()=>{
 let s=learned();const spell='imperial-magic:D:魔能爆';claimLearningGrant(s,id+'/D/gift',[spell],definitions,source);
 const prior=structuredClone(s.learnedResources[spell]);s=buy(s,offer('C',{}));
 claimLearningGrant(s,id+'/C/gift',[spell],definitions,source);
 assert.equal(s.xp,50);assert.equal(s.learnedResources[spell].grade,'C');assert.deepEqual(s.learnedResources[spell].versions,['D','C']);
 assert.equal(s.learnedResources[spell].source,prior.source);assert.deepEqual(s.learnedResources[spell].grantHistory,[id+'/D/gift',id+'/C/gift']);
});
test('granted spell executes using the new caster and pool, with arcane DP in the actual attack roll',()=>{
 const actors=createOpeningRoster(),s=learned(),spell='imperial-magic:D:魔能爆';
 claimLearningGrant(s,id+'/D/gift',[spell],definitions,source);s.resources.精神魔力.current=s.resources.精神魔力.max;
 s.skills.神秘={level:3,subs:{塑能:{level:1}}};actors.player.state=s;
 const plan={source,targetIds:['huang'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true}};
 const root={actors,ruleScene:{objects:{spell:{type:'kitResource',resourceId:spell,source,actorIds:['player'],plans:{use:plan}}}}};
 const q={kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'},dice=()=>Array(200).fill(8);
 const baseline=structuredClone(root);delete baseline.actors.player.state.learnedResources[id];baseline.actors.player.state.casting={imperial:{grade:'D',pool:'精神魔力'}};delete baseline.actors.player.state.learnedResources[spell].casterSource;
 const plain=reduceRuleAction(baseline,q,{drawDice:dice}),out=reduceRuleAction(root,q,{drawDice:dice});
 assert.equal(out.actors.player.state.resources.精神魔力.current,s.resources.精神魔力.current-1);
 const attack=x=>x.result.targets[0].steps.find(x=>x.op==='attack').roll.dp;assert.equal(attack(out),attack(plain)+6);
});
for(const specialization of ['奥术','冰霜'])test(specialization+' registered D/C offers and gift choice survive MVU reload without duplicate charges or free ownership',async()=>{
 const opening=createOpeningFixture(),original=structuredClone({actors:opening.actors,baseline:opening.baseline}),actors=structuredClone(opening.actors);actors.player.state.xp=100;
 const chat=[{is_user:false,mes:'隔离取得测试',swipe_id:0}],floors={};
 const tavern={chatId:'arcane-acquisition-test',chat,saveChat:async()=>{}};
 const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(v,{message_id})=>{floors[message_id]=JSON.parse(JSON.stringify(v));}};
 const getAnchor=()=>({chatId:tavern.chatId,messageId:chat.length-1,swipeId:0});
 const session=createIntegratedSession({baseline:opening.baseline,mvu,tavern,fixtureFactory:()=>({...opening,actors}),generateRaw:async()=>{throw Error('No external model');},createChatMessages:async()=>{},setChatMessages:async()=>{}});
 await session.prepare();
 const current=()=>floors[chat.length-1].stat_data['901_rules_poc'];
 const register=async grade=>session.registerRuleScene({source,growthWindow:{id:'study',source,open:true,actorIds:['player']},learningOffers:{['mage-'+grade]:offer(grade,grade==='D'?{specialization,pool:'精神魔力',initialCurrent:0}:{})},objects:{bundle:{type:'kitResource',resourceId:id,source,actorIds:['player'],plans:{gift:{source,grantId:id+'/D/gift',resourceIds:['imperial-magic:D:魔能爆']}}}}});
 const opts={baseline:opening.baseline,mvu,getAnchor,expectedChatId:tavern.chatId};
 const settle=(operation,request,text)=>createReplayCheckRuntime(opts).settle({operationId:'gm-runtime/'+tavern.chatId+'/'+operation,request,context:{latest:{text}}});
 const request=grade=>({kind:'rule',action:'resource',actorId:'player',offerId:'mage-'+grade});
 await register('D');assert.equal(current().actors.player.state.learnedResources?.[id],undefined);
 let out=await settle('D',request('D'),'我学习法师·奥术D阶，使用普通XP付清。');assert.equal(out.status,'applied',JSON.stringify(out));assert.equal(out.result.charged,15);
 out=await settle('gift',{kind:'rule',action:'mechanism',actorId:'player',objectId:'bundle',operation:'claimLearning',part:'gift'},'我选择魔能爆作为赠术。');assert.equal(out.status,'applied',JSON.stringify(out));
 chat.push({is_user:true,mes:'继续进阶',swipe_id:0});await session.prepare();await register('C');
 out=await settle('C',request('C'),'我学习法师·奥术C阶，使用普通XP付清。');assert.equal(out.status,'applied',JSON.stringify(out));assert.equal(out.result.charged,35);
 const saved=structuredClone(current());out=await settle('C',request('C'),'我学习法师·奥术C阶，使用普通XP付清。');assert.equal(out.status,'already_applied');assert.deepEqual(current(),saved);
 assert.equal(saved.actors.player.state.xp,50);assert.equal(saved.actors.player.state.learnedResources['imperial-magic:D:魔能爆'].casterSource,id);
 for(const actorId of Object.keys(actors).filter(x=>x!=='player'))assert.deepEqual(saved.actors[actorId].state,actors[actorId].state);
 assert.deepEqual({actors:opening.actors,baseline:opening.baseline},original);
});


test('frost D/C keeps its own capacity and cold DP; C discounts actual spells to at least one',()=>{
 const frost=grade=>offer(grade,grade==='D'?{specialization:'冰霜',pool:'精神魔力',initialCurrent:0}:{});
 let d=buy(fresh(),frost('D'));const max=d.resources.精神魔力.max;
 assert.equal(resourceBonus(d,'check',{casting:true,spellDamageTypes:['cold']}),6);
 assert.equal(resourceBonus(d,'check',{casting:true,spellDamageTypes:['force']}),0);
 const c=buy(d,frost('C'));assert.equal(c.resources.精神魔力.max,max);assert.equal(c.xp,50);
 assert.deepEqual(c.learnedResources[id].completedStages,['D','C']);
 assert.throws(()=>buy(c,offer('C',{specialization:'奥术'})));
 for(const spell of ['imperial-magic:D:寒冰箭','imperial-magic:D:魔能爆']){
  const initial=fresh();initial.resources.精神魔力={kind:'精神魔力',generic:true,origin:'test-existing-pool',max:8,current:8};let state=buy(initial,offer('D',{specialization:'冰霜',pool:'精神魔力'}));claimLearningGrant(state,id+'/D/gift',[spell],definitions,source);
  state=buy(state,frost('C'));claimLearningGrant(state,id+'/C/gift',[spell],definitions,source);
  state.resources.精神魔力.current=state.resources.精神魔力.max;
  state.skills.神秘={level:3,subs:{塑能:{level:1}}};
  for(const grade of ['D','C']){
   const actors=createOpeningRoster();actors.player.state=structuredClone(state);
   const plan={source,grade,targetIds:grade==='C'&&spell.endsWith('魔能爆')?['huang','huang']:['huang'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true}};
   const r={actors,ruleScene:{objects:{spell:{type:'kitResource',resourceId:spell,source,actorIds:['player'],plans:{use:plan}}}}};
   const out=reduceRuleAction(r,{kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'},{drawDice:()=>Array(200).fill(8)});
   assert.equal(out.result.cost,grade==='C'?2:1);
   const plain=structuredClone(r);delete plain.actors.player.state.learnedResources[id];plain.actors.player.state.casting={imperial:{grade:'C',pool:'精神魔力'}};delete plain.actors.player.state.learnedResources[spell].casterSource;
   const baseline=reduceRuleAction(plain,{kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'},{drawDice:()=>Array(200).fill(8)});
   assert.equal(baseline.result.cost,grade==='C'?3:1);
   const dp=x=>x.result.targets[0].steps.find(step=>step.op==='attack').roll.dp;assert.equal(dp(out)-dp(baseline),spell.endsWith('寒冰箭')?6:0);assert.equal(out.actors.player.state.resources.精神魔力.current,state.resources.精神魔力.max-out.result.cost);
   assert.deepEqual(out.actors.player.state.resources.流风,state.resources.流风);
  }
 }
});


test('frost cost uses the final one-pool debit for all mana kinds, repetitions and minimum; other energy and zero stay unchanged',()=>{
 const spell='imperial-magic:D:魔能爆',original=definitions[spell];
 try{
  let state=buy(fresh(),offer('D',{specialization:'冰霜',pool:'精神魔力',initialCurrent:0}));
  claimLearningGrant(state,id+'/D/gift',[spell],definitions,source);state=buy(state,offer('C',{}));claimLearningGrant(state,id+'/C/gift',[spell],definitions,source);
  for(const [kind,base,extra,expected]of [['精神魔力',3,0,2],['天生魔力',3,0,2],['生命魔力',3,0,2],['流风',3,0,3],['精神魔力',1,0,1],['精神魔力',0,0,0],['精神魔力',3,2,4]]){
   definitions[spell]=structuredClone(original);const program=definitions[spell].programs.cast;program.cost=base;program.repetition={maximum:2,extraCost:extra};
   const actors=createOpeningRoster();actors.player.state=structuredClone(state);actors.player.state.resources.精神魔力={...state.resources.精神魔力,kind,max:10,current:expected};
   const plan={source,grade:'C',targetIds:['huang','huang'],distance:1,effectLine:true,precise:true,components:{posture:true,language:true,focus:true}};
   // Exercise the existing learned-choice energy policy as well as ordinary caster payment.
   program.executionPolicy={ranks:{C:{level:2,power:2}},pool:{selection:'learned-choice',choice:'pool',kind}};actors.player.state.learnedResources[spell].choices={pool:'精神魔力'};
   if(kind==='天生魔力'){actors.player.state.resources.精神魔力.kind='未标定';actors.player.state.learnedResources[spell].qualifications={energyPools:{精神魔力:{kind,source}}};}
   const root={actors,ruleScene:{objects:{spell:{type:'kitResource',resourceId:spell,source,actorIds:['player'],plans:{use:plan}}}}},q={kind:'rule',action:'mechanism',actorId:'player',objectId:'spell',operation:'cast',part:'use'};
   const out=reduceRuleAction(root,q,{drawDice:()=>Array(200).fill(8)});assert.equal(out.result.cost,expected);assert.equal(out.actors.player.state.resources.精神魔力.current,0);
   if(expected){root.actors.player.state.resources.精神魔力.current=expected-1;const before=structuredClone(root);assert.throws(()=>reduceRuleAction(root,q,{drawDice:()=>Array(200).fill(8)}),/施法能量不足/);assert.deepEqual(root,before);}
  }
 }finally{definitions[spell]=original;}
});

});
