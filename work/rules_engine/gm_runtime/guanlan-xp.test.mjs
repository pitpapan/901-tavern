import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter,upgradeAttribute,upgradeSkill,upgradeFeat} from '../core.mjs';
import {reduceRuleAction,ruleRequestValid} from './rule-actions.mjs';
import {growthPrice} from '../growth-pricing.mjs';
import {createReplayCheckRuntime} from './replay-check.mjs';
import {createOpeningFixture} from './opening.mjs';
import {ruleActionInstructions} from './rule-reference.mjs';
const source='2026-10-23用户提供观澜法完整减费条文／隔离测试';
function state(owned=true){const s=createCharacter({attributes:{力量:4,敏捷:4,智力:4,感知:4,意志:4,风度:4},skills:{白刃:{level:2,subs:{长剑:{level:2}}},运动:{level:2,subs:{攀爬:{level:2}}},学识:{level:2,subs:{历史:{level:2}}},社交:{level:2,subs:{谈判:{level:2}}}},xp:100});s.xp=100;if(owned)s.guanlan={acquired:true,source,wufaXP:10};return s;}
function root(){return {actors:{player:{name:'御临风',state:state()},other:{name:'对照人物',state:state(false)}},ruleScene:{growthWindow:{id:'gap',source,open:true,actorIds:['player','other']},feats:{f:{id:'f',source,adopted:true,maxLevel:5}},learningOffers:{}}};}
function offer(extra={}){return {id:'art',resourceId:'guanlan.art',name:'隔离D级技艺',source,adopted:true,actorIds:['player'],requirementsMet:true,kind:'technique',tree:'guanlan',grade:'D',baseCost:8,...extra};}
function learn(r,extra={}){return reduceRuleAction(r,{kind:'rule',action:'resource',actorId:'player',offerId:'art',...extra});}

test('Guanlan all six attributes discount once per level including milestones',()=>{
 for(const name of ['力量','敏捷','智力','感知','意志','风度']){
  const s=state(),a=upgradeAttribute(s,name);assert.equal(a.result.cost,5);assert.equal(a.state.xp,95);
  const b=upgradeAttribute(a.state,name);assert.equal(b.result.cost,11);assert.equal(b.result.autoGained,1);assert.equal(b.result.greatPowerChoiceGained,1);
  assert.equal(upgradeAttribute(state(false),name).result.cost,6);
 }
});
test('Guanlan only three main skills and their children discount; main cap remains',()=>{
 for(const main of ['白刃','运动','学识'])for(const sub of [undefined,Object.keys(state().skills[main].subs)[0]]){
  const s=state();assert.equal(upgradeSkill(s,main,sub).result.cost,2);
  (sub?s.skills[main].subs[sub]:s.skills[main]).level=4;
  const out=upgradeSkill(s,main,sub);assert.equal(out.result.cost,8);assert.equal(out.result.autoGained,1);
  if(!sub)assert.equal(upgradeSkill(out.state,main).result.allowed,false);
 }
 assert.equal(upgradeSkill(state(),'社交').result.cost,3);assert.equal(upgradeSkill(state(),'社交','谈判').result.cost,3);
});
test('Guanlan never discounts feats or spends dedicated Wufa XP on them',()=>{
 let s=state();for(let level=1;level<=3;level++){const out=upgradeFeat(s,{id:'f',adopted:true,source,maxLevel:3});assert.equal(out.result.cost,level*3);assert.equal(out.state.guanlan.wufaXP,10);s=out.state;}
});
test('Guanlan resource learning has actual route and eligible whole-technique discount',()=>{
 const r=root();r.ruleScene.learningOffers.art=offer();
 assert.equal(ruleRequestValid({kind:'rule',action:'resource',actorId:'player',offerId:'art'}),true);
 const out=learn(r);assert.equal(out.result.cost,7);assert.equal(out.actors.player.state.xp,93);assert.equal(out.actors.player.state.learnedResources['guanlan.art'].learned,true);
});
test('Guanlan D technique categories share exactly one discount, floor one, free stays free',()=>{
 for(const techniqueType of ['武技','心法','身法','法术','辅助技艺']){
  const r=root();r.ruleScene.learningOffers.art=offer({techniqueType,skill:'白刃'});
  assert.equal(learn(r).result.discount,1);
 }
 for(const baseCost of [0,1,2]){
  const r=root();r.ruleScene.learningOffers.art=offer({baseCost});const out=learn(r);
  assert.equal(out.result.cost,baseCost===0?0:1);assert.equal(out.actors.player.state.xp,100-out.result.cost);
 }
});
test('Guanlan acquisition, evolution, higher grade, other tree and other resources never discount',()=>{
 for(const extra of [{kind:'acquisition',resourceId:'guanlan'},{kind:'evolution'},{grade:'C'},{tree:'other'},{kind:'other'}]){
  const r=root();r.ruleScene.learningOffers.art=offer(extra);assert.equal(learn(r).result.cost,8);
 }
 const s=state();assert.equal(growthPrice(s,3,{kind:'skill',skill:'社交',sub:'白刃'}).cost,3);
});
test('Guanlan ownership is actor-specific and absent on initial character; no global discount',()=>{
 const r=root(),before=structuredClone(r.actors.other);r.ruleScene.learningOffers.art=offer();
 let out=learn(r);assert.deepEqual(out.actors.other,before);
 out=reduceRuleAction(out,{kind:'rule',action:'growth',actorId:'other',attribute:'力量'});assert.equal(out.result.cost,6);
 const s=state(false);s.guanlan={acquired:true};assert.equal(upgradeAttribute(s,'力量').result.cost,6);
});
test('Guanlan installment locks whole price, charges 1 discount once, grants only upon completion',()=>{
 let r=root();r.ruleScene.learningOffers.art=offer({payments:{first:{xp:3,wufaXP:0},second:{xp:4,wufaXP:0}}});
 r=learn(r,{paymentId:'first'});assert.equal(r.result.cost,7);assert.equal(r.result.complete,false);assert.equal(r.actors.player.state.learnedResources,undefined);
 const before=structuredClone(r);assert.throws(()=>learn(r,{paymentId:'first'}),/已经支付/);assert.deepEqual(r,before);
 r=learn(r,{paymentId:'second'});assert.equal(r.result.cost,7);assert.equal(r.result.charged,4);assert.equal(r.actors.player.state.xp,93);assert.equal(r.result.complete,true);
 assert.throws(()=>learn(r),/已完整学习/);
 r.ruleScene.learningOffers.art=offer({id:'art'});assert.throws(()=>learn(r),/已完整学习/);
});
test('Wufa XP remains tree D technique-only, separately charged and never converted',()=>{
 const r=root();r.ruleScene.learningOffers.art=offer({payments:{insight:{xp:0,wufaXP:7}}});const out=learn(r,{paymentId:'insight'});
 assert.equal(out.actors.player.state.xp,100);assert.equal(out.actors.player.state.guanlan.wufaXP,3);
 for(const extra of [{kind:'evolution'},{kind:'acquisition'},{tree:'other'},{grade:'C'},{kind:'other'}]){
  const f=root();f.ruleScene.learningOffers.art=offer({...extra,payments:{insight:{xp:2,wufaXP:5}}});const before=structuredClone(f);
  assert.throws(()=>learn(f,{paymentId:'insight'}),/悟法XP只可/);assert.deepEqual(f,before);
 }
 for(const request of [{action:'growth',attribute:'力量'},{action:'growth',skill:'白刃'},{action:'feat',featId:'f'}]){
  const f=root();f.actors.player.state.xp=0;const before=structuredClone(f);
  assert.throws(()=>reduceRuleAction(f,{kind:'rule',actorId:'player',...request}),/Insufficient XP/);assert.deepEqual(f,before);
 }
});
test('Wufa cannot mix ordinary XP, pay installments or finish ordinary installments',()=>{
 for(const payments of [{bad:{xp:2,wufaXP:5}},{bad:{xp:0,wufaXP:2}}]){const r=root();r.ruleScene.learningOffers.art=offer({payments});assert.throws(()=>learn(r,{paymentId:'bad'}),/一次|混付/);}
 let r=root();r.ruleScene.learningOffers.art=offer({payments:{first:{xp:2},last:{xp:0,wufaXP:5}}});r=learn(r,{paymentId:'first'});assert.throws(()=>learn(r,{paymentId:'last'}),/一次|混付/);
});

test('Wufa reward preserves ordinary XP and deduplicates its actual event',()=>{
 const r=root();r.ruleScene.events={insight:{type:'reward',pool:'guanlanWufa',actorIds:['player'],xp:3,source}};
 const q={kind:'rule',action:'reward',actorId:'player',eventId:'insight'},out=reduceRuleAction(r,q);
 assert.equal(out.actors.player.state.xp,100);assert.equal(out.actors.player.state.guanlan.wufaXP,13);assert.throws(()=>reduceRuleAction(out,q),/已结算/);
});
test('Unmet learning conditions, insufficient ordinary/Wufa balances and closed nodes do not mutate',()=>{
 for(const variation of ['requirements','ordinary','wufa','closed']){
  const r=root();r.ruleScene.learningOffers.art=offer({payments:{insight:{xp:2,wufaXP:5}}});
  if(variation==='requirements')r.ruleScene.learningOffers.art.requirementsMet=false;
  if(variation==='ordinary')r.actors.player.state.xp=1;
  if(variation==='wufa')r.actors.player.state.guanlan.wufaXP=4;
  if(variation==='closed')r.ruleScene.growthWindow.open=false;
  const before=structuredClone(r);assert.throws(()=>learn(r,{paymentId:'insight'}));assert.deepEqual(r,before);
 }
 const s=state();s.xp=5;assert.equal(upgradeAttribute(s,'力量').result.allowed,true);s.xp=4;assert.equal(upgradeAttribute(s,'力量').result.allowed,false);
});
test('New skill purchase is allowed only under specifically registered learning conditions',()=>{
 const r=root();delete r.actors.player.state.skills.白刃;
 const q={kind:'rule',action:'growth',actorId:'player',skill:'白刃'};assert.throws(()=>reduceRuleAction(r,q),/首次购买/);
 r.ruleScene.growthWindow.allowedChoices=[{action:'growth',skill:'白刃'}];const out=reduceRuleAction(r,q);
 assert.equal(out.result.cost,2);assert.equal(out.actors.player.state.skills.白刃.level,1);
 out.ruleScene.growthWindow.allowedChoices=[{action:'growth',skill:'白刃',sub:'短剑'}];
 assert.equal(reduceRuleAction(out,{...q,sub:'短剑'}).result.cost,2);
});
test('Guanlan has no per-adventure quota and cannot stack with itself',()=>{
 let s=state();s.guanlan.copies=3;
 for(let i=0;i<12;i++){const out=upgradeAttribute(s,'智力');assert.equal(out.result.discount,1);s=out.state;}
 assert.equal(s.guanlan.wufaXP,10);assert.equal(s.guanlan.remainingDiscount,undefined);
});
test('Acquiring Guanlan charges full body price and enables only subsequent eligible growth',()=>{
 const r=root();delete r.actors.player.state.guanlan;r.ruleScene.learningOffers.art=offer({resourceId:'guanlan',kind:'acquisition',grantsGuanlan:true});
 const out=learn(r);assert.equal(out.result.cost,8);assert.equal(out.actors.player.state.guanlan.wufaXP,0);
 assert.equal(upgradeAttribute(out.actors.player.state,'力量').result.cost,5);
});
test('Runtime/MVU persists full Wufa payment and duplicate operation after reload; explicit Wufa required',async()=>{
 const baseline=createOpeningFixture().baseline,anchor={chatId:'guanlan-test',messageId:0,swipeId:0};let data={stat_data:{}};
 const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=structuredClone(next);}};
 const opts={baseline,mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId};let rt=createReplayCheckRuntime(opts);await rt.initialize({openingAssumption:true});
 assert.equal(rt.currentPlayer().guanlan,undefined);
 data.stat_data['901_rules_poc'].actors=root().actors;data.stat_data['901_rules_poc'].ruleScene=root().ruleScene;
 data.stat_data['901_rules_poc'].ruleScene.learningOffers.art=offer({payments:{first:{label:'足额',xp:0,wufaXP:7}}});
 const request={kind:'rule',action:'resource',actorId:'player',offerId:'art',paymentId:'first'},operationId='gm-runtime/guanlan-test/first';
 let out=await rt.settle({operationId,request,context:{latest:{text:'我学习隔离D级技艺。'}}});assert.equal(out.status,'needs_input');
 const context={latest:{text:'我学习隔离D级技艺，按足额方案支付，使用悟法XP。'}};
 out=await rt.settle({operationId,request,context});assert.equal(out.status,'applied');assert.equal(out.result.charged,0);assert.equal(out.result.wufaCharged,7);assert.equal(out.result.complete,true);
 const before=structuredClone(data);rt=createReplayCheckRuntime(opts);assert.equal((await rt.settle({operationId,request,context})).status,'already_applied');assert.deepEqual(data,before);
 const unchanged=structuredClone(data);
 for(const req of [{kind:'rule',action:'growth',actorId:'player',attribute:'力量'},{kind:'rule',action:'feat',actorId:'player',featId:'f'},{kind:'rule',action:'resource',actorId:'player',offerId:'art'}]){
  const denied=await rt.settle({operationId:'gm-runtime/guanlan-test/no-silent-conversion-'+req.action,request:req,context:{latest:{text:'我用悟法XP学习隔离D级技艺，提升力量和f。'}}});assert.equal(denied.status,'needs_input');assert.deepEqual(data,unchanged);
 }
 assert.equal(rt.currentPlayer().xp,100);assert.equal(rt.currentPlayer().guanlan.wufaXP,3);
 assert.equal(rt.ruleContext().learningOffers[0].id,'art');assert.equal(rt.ruleContext().actors[0].guanlan.wufaXP,3);
 assert.equal(ruleRequestValid({...request,discount:1}),false);assert.equal(ruleRequestValid({...request,xp:1}),false);
 assert.ok(ruleActionInstructions(rt.ruleContext()).includes('悟法XP'));assert.ok(ruleActionInstructions(rt.ruleContext()).includes('offerId'));
});
