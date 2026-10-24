import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacter} from '../core.mjs';
import {reduceRuleAction, ruleRequestValid} from './rule-actions.mjs';
import {settleRuleAction} from '../mvu_poc/adapter.mjs';
import {replayClassificationRequest,runGuardedTurn,savedDecisionForRecovery,relevantLorebookFacts} from './adjudication-gate.mjs';
import {createReplayCheckRuntime} from './replay-check.mjs';
import {createOpeningFixture} from './opening.mjs';

const state=()=>createCharacter({attributes:{力量:3,敏捷:3,智力:3,感知:3,意志:3,风度:3},
  skills:{运动:{level:1},求生:{level:1},社交:{level:1},洞察:{level:1},医疗:{level:1}},xp:30});
const actors=()=>({player:{name:'玩家',state:state()},guard:{name:'门卫',state:state()}});
const options={drawDice:()=>Array(256).fill(8)};

test('ordinary opposed check uses actual two actors and active side wins ties',()=>{
  const input={actors:actors()},request={kind:'rule',action:'opposed',active:{actorId:'player',attribute:'风度',skill:'社交'},
    passive:{actorId:'guard',attribute:'意志',skill:'社交'}};
  const result=reduceRuleAction(input,request,options);
  assert.equal(result.result.success,true);assert.equal(result.result.active.total,4);
  assert.deepEqual(result.actors,input.actors);
});
test('will save uses will and presence rather than a fabricated survival skill',()=>{
  const result=reduceRuleAction({actors:actors()},{kind:'rule',action:'save',actorId:'player',type:'will',dc:6},options);
  assert.equal(result.result.total,6);assert.equal(result.result.success,true);
});
test('extended check persists cumulative successes and prevents a completed task reroll',()=>{
  const request={kind:'rule',action:'extended',actorId:'player',taskId:'search',attribute:'感知',skill:'洞察',target:7,periodMinutes:5,maxPeriods:3};
  const first=reduceRuleAction({actors:actors()},request,options);
  assert.equal(first.result.complete,false);assert.equal(first.result.accumulated,4);
  const second=reduceRuleAction(first,request,options);
  assert.equal(second.result.complete,true);assert.equal(second.result.accumulated,8);
  assert.throws(()=>reduceRuleAction(second,request,options),/已完成/);
});
test('attribute growth spends the existing XP and does not fill health or resources',()=>{
  const input={actors:actors(),ruleScene:{growthWindow:{id:'test-gap',source:'已确认故事间隙',open:true,actorIds:['player']}}};input.actors.player.state.health.intact--;input.actors.player.state.health.L++;
  const result=reduceRuleAction(input,{kind:'rule',action:'growth',actorId:'player',attribute:'力量'},options);
  assert.equal(result.actors.player.state.attributes.力量,4);assert.equal(result.actors.player.state.xp,24);
  assert.equal(result.actors.player.state.health.L,1);
});
test('rule transaction saves both participants once and replay does not redraw',async()=>{
  let data={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'rules',revision:0,actors:actors(),operations:{}}}},draws=0;
  const opts={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=structuredClone(next);}},
    getAnchor:()=>({chatId:'rules',messageId:1,swipeId:0}),expectedChatId:'rules',operationId:'gm-runtime/rules/1/0',expectedRevision:0,
    request:{kind:'rule',action:'save',actorId:'player',type:'will',dc:4},
    reduce:(root,request)=>reduceRuleAction(root,request,{drawDice:()=>{draws++;return Array(256).fill(8);}})};
  assert.equal((await settleRuleAction(opts)).status,'applied');
  assert.equal((await settleRuleAction(opts)).status,'already_applied');
  assert.equal(draws,1);assert.equal(data.stat_data['901_rules_poc'].revision,1);
});
test('requests cannot supply arbitrary states, rolls or awards through growth',()=>{
  assert.equal(ruleRequestValid({kind:'rule',action:'growth',actorId:'player',attribute:'力量',xp:100}),false);
  assert.equal(ruleRequestValid({kind:'rule',action:'save',actorId:'player',type:'will',dc:2,dice:[10]}),false);
});

test('classifier always receives core rules and current subskills, independent of lore keywords',()=>{
  const p={chatId:'a',messageId:1,swipeId:0,text:'我辨认这道痕迹'};
  const request=replayClassificationRequest({context:{original:p,latest:p},skills:{洞察:{level:2,subs:{追踪:{level:1}}}}});
  assert.match(request.user_input,/追踪/);assert.match(request.user_input,/"action":"opposed"/);
  assert.match(request.user_input,/"action":"save"/);assert.match(request.user_input,/901已采用核心/);
});
test('rule request enters the same guarded transaction and can recover a committed decision',async()=>{
  const p={chatId:'a',messageId:1,swipeId:0,text:'我抵抗恐惧'},request={kind:'rule',action:'save',actorId:'player',type:'will',dc:2};
  const out=await runGuardedTurn({player:p,classify:async()=>({status:'CHECK_REQUIRED',reason:'意志抵抗',request}),
    settle:async({operationId})=>({status:'applied',kind:'rule',operationId,result:{success:true}}),narrate:async()=>'你稳住心神。',post:async()=>{}});
  assert.equal(out.status,'APPLIED');
  assert.deepEqual(savedDecisionForRecovery(null,{summary:{kind:'rule',status:'applied'},signature:JSON.stringify({request})}).request,request);
});
test('constant and explicitly named scene entries reach classification without enabling disabled lore',()=>{
  const entries=[{uid:1,enabled:true,constant:true,keys:[],content:'基础规则'},
    {uid:2,enabled:true,keys:['布莱特'],content:'失明'},
    {uid:3,enabled:false,constant:true,keys:[],content:'未采用'}];
  assert.deepEqual(relevantLorebookFacts(entries,{action:'我问他',scene:'布莱特在身旁'}).map(e=>e.uid),[1,2]);
});
test('opening runtime actually settles will saves and reuses them after reload',async()=>{
  const fixture=createOpeningFixture();let data={stat_data:{}},draws=0;
  const anchor={chatId:'live-rule',messageId:0,swipeId:0};
  const opts={baseline:fixture.baseline,expectedChatId:anchor.chatId,getAnchor:()=>anchor,
    mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},
    drawDice:()=>{draws++;return Array(256).fill(8);}};
  let runtime=createReplayCheckRuntime(opts);await runtime.initialize({openingAssumption:true});
  data.stat_data['901_rules_poc'].actors=fixture.actors;
  const request={kind:'rule',action:'save',actorId:'player',type:'will',dc:4},operationId='gm-runtime/live-rule/0/0';
  const result=await runtime.settle({request,operationId});
  assert.equal(result.status,'applied');assert.equal(result.result.dp,5,'opening steel will +2 applies');
  runtime=createReplayCheckRuntime(opts);assert.equal((await runtime.settle({request,operationId})).status,'already_applied');
  assert.equal(draws,1);
});
test('opening ordinary orientation uses the adopted +6 and keeps it through replay',async()=>{
  const f=createOpeningFixture();let data={stat_data:{}};
  const a={chatId:'direction',messageId:0,swipeId:0};
  const runtime=createReplayCheckRuntime({baseline:f.baseline,expectedChatId:a.chatId,getAnchor:()=>a,
    mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=structuredClone(d);}},drawDice:()=>Array(256).fill(8)});
  await runtime.initialize({openingAssumption:true});data.stat_data['901_rules_poc'].actors=f.actors;
  const request={kind:'check',attribute:'感知',skill:'求生',purpose:'orientation',dc:3};
  assert.equal(runtime.prepareCheck(request).publicBasis.publicSubtotal,11);
  const result=await runtime.settle({operationId:'gm-runtime/direction/0/0',request});
  assert.equal(result.dp,11);assert.equal(result.total,11);
});
