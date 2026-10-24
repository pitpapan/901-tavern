import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
import {createOpeningFixture} from '../../rules_engine/gm_runtime/opening.mjs';
import {createReplayCheckRuntime} from '../../rules_engine/gm_runtime/replay-check.mjs';
const source='用户2026-10-23观澜法条文；本次御临风已取得的假设与8XP技艺价格仅为隔离夹具';
const rows=[];
async function fixture(){
 const anchor={chatId:'guanlan-xp-smoke',messageId:0,swipeId:0};let data={stat_data:{}};
 const mvu={getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=structuredClone(next);}};
 const opts={baseline:createOpeningFixture().baseline,mvu,getAnchor:()=>anchor,expectedChatId:anchor.chatId};let runtime=createReplayCheckRuntime(opts);
 await runtime.initialize({openingAssumption:true});const saved=()=>data.stat_data['901_rules_poc'];const s=saved().actors.player.state;
 assert.equal(s.guanlan,undefined);s.xp=100;s.guanlan={acquired:true,source,wufaXP:10};
 saved().ruleScene={growthWindow:{id:'gap',source,open:true,actorIds:['player']},feats:{feat:{id:'feat',name:'测试专长',source,adopted:true,maxLevel:5}},learningOffers:{}};
 return {saved,get runtime(){return runtime;},reload(){runtime=createReplayCheckRuntime(opts);}};
}
async function step(f,id,request,text){const before=structuredClone(f.runtime.currentPlayer());const result=await f.runtime.settle({operationId:`gm-runtime/guanlan-xp-smoke/${id}`,request:{kind:'rule',actorId:'player',...request},context:{latest:{text}}});const after=f.runtime.currentPlayer();const row={id,status:result.status,baseCost:result.result?.baseCost,wholeCost:result.result?.cost,discount:result.result?.discount??0,charged:before.xp-after.xp,wufaCharged:before.guanlan.wufaXP-after.guanlan.wufaXP,xpBefore:before.xp,xpAfter:after.xp,wufaBefore:before.guanlan.wufaXP,wufaAfter:after.guanlan.wufaXP,complete:result.result?.complete,missing:result.missing};rows.push(row);return row;}
for(const attribute of ['力量','敏捷','智力','感知','意志','风度'])for(const level of [4,5]){
 const f=await fixture();f.saved().actors.player.state.attributes[attribute]=level;
 const row=await step(f,attribute+level,{action:'growth',attribute},`我把${attribute}提升一级。`);assert.equal(row.charged,level===4?5:11);assert.equal(row.wufaCharged,0);
}
for(const skill of ['白刃','运动','学识','社交'])for(const layer of ['main','sub'])for(const level of [2,4]){
 const f=await fixture();f.saved().actors.player.state.skills[skill]={level,subs:{测试子技能:{level}}};
 const row=await step(f,skill+layer+level,{action:'growth',skill,...(layer==='sub'?{sub:'测试子技能'}:{})},`我把${layer==='sub'?'测试子技能':skill}提升一级。`);
 assert.equal(row.charged,(level===2?3:9)-(skill==='社交'?0:1));assert.equal(row.wufaCharged,0);
}
for(const level of [0,1,2]){const f=await fixture();f.saved().actors.player.state.feats={feat:{level}};const row=await step(f,'feat'+level,{action:'feat',featId:'feat'},'我学习测试专长。');assert.equal(row.charged,(level+1)*3);}
const spec=extra=>({id:'art',resourceId:'test.art',name:'测试技艺',source,adopted:true,actorIds:['player'],requirementsMet:true,kind:'technique',tree:'guanlan',grade:'D',baseCost:8,...extra});
for(const [name,extra,cost] of [['本树D',{},7],['本体',{kind:'acquisition'},8],['进化',{kind:'evolution'},8],['树外',{tree:'other'},8],['C级',{grade:'C'},8],['普通资源',{kind:'other'},8],['最低价',{baseCost:1},1],['免费',{baseCost:0},0]]){
 const f=await fixture();f.saved().ruleScene.learningOffers.art=spec(extra);const row=await step(f,name,{action:'resource',offerId:'art'},'我学习测试技艺。');assert.equal(row.charged,cost);assert.equal(row.status,'applied');
}
const f=await fixture();f.saved().ruleScene.learningOffers.art=spec({payments:{first:{label:'首期',xp:2,wufaXP:2},second:{label:'尾款',xp:0,wufaXP:3}}});
const request={action:'resource',offerId:'art',paymentId:'first'},text='我学习测试技艺，使用悟法XP按首期方案支付。';
assert.equal((await step(f,'first',request,text)).complete,false);f.reload();const duplicate=await step(f,'first',request,text);assert.equal(duplicate.status,'already_applied');assert.equal(duplicate.charged,0);assert.equal(duplicate.wufaCharged,0);
assert.equal((await step(f,'second',{...request,paymentId:'second'},'我学习测试技艺，使用悟法XP按尾款方案支付。')).complete,true);
assert.equal(f.runtime.currentPlayer().xp,98);assert.equal(f.runtime.currentPlayer().guanlan.wufaXP,5);
const rejected=await step(f,'wufa-attribute',{action:'growth',attribute:'力量'},'我用悟法XP提升力量。');assert.equal(rejected.status,'needs_input');assert.equal(rejected.charged,0);
const report={status:'pass',mode:'Local JS + isolated MVU readback; no live Gemini or formal character mutation',source,rows,conclusion:'每级/整门减1，普通XP与悟法XP分别记账；专长、本体、进化、树外资源不减；分期、重复请求不重复减免/扣费。完整范围及失败不改状态见367项回归。'};
await writeFile('output/replay_tavern/six_books_20261023_candidate/scene_test/guanlan-xp-smoke.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:rows.length,last:rows.slice(-4)}));
