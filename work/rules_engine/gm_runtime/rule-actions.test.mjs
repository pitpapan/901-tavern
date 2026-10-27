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

test('random special wound deterioration commits its receipt and replay after reload never redraws',async()=>{
 const a=actors();const s=a.player.state;s.health={...s.health,intact:0,B:0,L:s.derived.hpMax-1,A:1};
 a.player.recoveryLocks=[{severity:'L',count:1,source:'x',recovery:'naturalOnly'},{severity:'L',count:s.health.L-1,source:'y',recovery:'aggravated'}];
 let data={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'wounds',revision:0,actors:a,operations:{}}}},draws=0;
 const opts={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async d=>{data=JSON.parse(JSON.stringify(d));}},
  getAnchor:()=>({chatId:'wounds',messageId:1,swipeId:0}),expectedChatId:'wounds',operationId:'wound-upgrade/1',expectedRevision:0,
  request:{kind:'rule',action:'deterioration',actorId:'player',from:'L',sourceQuote:'actual elapsed deterioration'},
  reduce:(root,r)=>reduceRuleAction(root,r,{drawDice:()=>{draws++;return [2,2,2];}})};
 const out=await settleRuleAction(opts);assert.equal(out.status,'applied');assert.equal(draws,1);
 assert.equal(out.result.woundSource.selection.ticket,1);
 const before=JSON.parse(JSON.stringify(data));data=JSON.parse(JSON.stringify(data));
 assert.equal((await settleRuleAction({...opts})).status,'already_applied');assert.equal(draws,1);assert.deepEqual(data,before);
 assert.equal(data.stat_data['901_rules_poc'].actors.player.recoveryLocks.find(b=>b.severity==='A').source,'y');
});

test('adopted jump checks use sourced run-up, apply the final success penalty and do not invent movement',()=>{
 const input={actors:actors(),ruleScene:{objects:{ledge:{type:'checkContext',source:'现场踏勘',actorIds:['player'],plans:{long:{source:'本次跳远声明',purpose:'jump',kind:'long',supportedTakeoff:true,runUp:{source:'实际移动记录',meters:0}}}}}}};
 input.actors.player.state.skills.运动.subs={跳跃:{level:1}};
 const q={kind:'rule',action:'check',actorId:'player',attribute:'力量',skill:'运动',sub:'跳跃',dc:3,purpose:'jump',objectId:'ledge',part:'long'};
 const out=reduceRuleAction(input,q,options);
 assert.equal(out.result.rawTotal,5);assert.equal(out.result.total,2.5);assert.equal(out.result.success,false);
 assert.equal(out.result.jump.distance,4);assert.equal(out.result.jump.apex,1);assert.equal(out.result.jump.movementApplied,false);
 assert.deepEqual(out.actors,input.actors);
 const running=structuredClone(input);running.ruleScene.objects.ledge.plans.long.runUp.meters=8;
 const run=reduceRuleAction(running,q,options);assert.equal(run.result.dp,8);assert.equal(run.result.total,8);assert.equal(run.result.jump.runUpDP,3);assert.equal(run.result.jump.distance,12.8);
 running.actors.player.state.activeResourceEffects=[{id:'jump-boost',sourceId:'actual-jump-boost',effects:[{stat:'check',group:'enhancement',value:5,when:{test:'eq',left:{context:'purpose'},right:'jump'}}]}];
 assert.equal(reduceRuleAction(running,q,options).result.dp,10); // max(run-up 3, enhancement 5), not +8.
});
test('wind footwork only removes the standing jump penalty while actual pool and armor qualify',()=>{
 const input={actors:actors(),ruleScene:{objects:{ledge:{type:'checkContext',source:'现场',actorIds:['player'],plans:{high:{source:'向上跳跃',purpose:'jump',kind:'high',supportedTakeoff:true,runUp:{source:'原地起跳',meters:0}}}}}}};
 const s=input.actors.player.state;s.skills.运动.subs={跳跃:{level:1}};
 s.learnedResources={'fengyou-sheshibu':{learned:true,source:'已取得'}};s.equippedArmorClass='light';s.resources.内力={current:1,max:5,generic:true};
 const q={kind:'rule',action:'check',actorId:'player',attribute:'力量',skill:'运动',sub:'跳跃',dc:3,purpose:'jump',objectId:'ledge',part:'high'};
 let out=reduceRuleAction(input,q,options);assert.equal(out.result.dp,5);assert.equal(out.result.total,5);assert.equal(out.result.jump.distance,2);assert.equal(out.result.jump.runUpDP,0);
 s.resources.内力.current=0;assert.equal(reduceRuleAction(input,q,options).result.total,2.5);
 s.resources.内力.current=1;s.equippedArmorClass='heavy';assert.equal(reduceRuleAction(input,q,options).result.total,2.5);
});
test('jump selectors cannot forge run-up or roll without an actual supported takeoff',()=>{
 const input={actors:actors(),ruleScene:{objects:{ledge:{type:'checkContext',source:'现场',actorIds:['player'],plans:{jump:{source:'跳跃',purpose:'jump',kind:'long',supportedTakeoff:false,runUp:{source:'实际',meters:10}}}}}}};
 const q={kind:'rule',action:'check',actorId:'player',attribute:'力量',skill:'运动',sub:'跳跃',dc:1,purpose:'jump',objectId:'ledge',part:'jump'};
 assert.equal(ruleRequestValid({...q,runUpMeters:100}),false);
 assert.throws(()=>reduceRuleAction(input,q,{drawDice:()=>{throw Error('must not roll');}}),e=>e.code==='UNAVAILABLE');
 assert.throws(()=>reduceRuleAction(input,{...q,objectId:'missing'},{drawDice:()=>{throw Error('must not roll');}}),e=>e.code==='NEEDS_INPUT');
});

test('jump receipt persists the sourced run-up and cannot reroll after MVU reload',async()=>{
 const a=actors();a.player.state.skills.运动.subs={跳跃:{level:1}};
 let data={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'jump',revision:0,actors:a,operations:{},ruleScene:{objects:{ledge:{type:'checkContext',source:'现场',actorIds:['player'],plans:{long:{source:'本次起跳',purpose:'jump',kind:'long',supportedTakeoff:true,runUp:{source:'实际3米助跑',meters:3}}}}}}}}},draws=0;
 const opts={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=JSON.parse(JSON.stringify(next));}},
  getAnchor:()=>({chatId:'jump',messageId:1,swipeId:0}),expectedChatId:'jump',operationId:'jump/1',expectedRevision:0,
  request:{kind:'rule',action:'check',actorId:'player',attribute:'力量',skill:'运动',sub:'跳跃',dc:3,purpose:'jump',objectId:'ledge',part:'long'},
  reduce:(root,r)=>reduceRuleAction(root,r,{drawDice:()=>{draws++;return Array(256).fill(8);}})};
 const out=await settleRuleAction(opts);assert.equal(out.status,'applied');assert.equal(out.result.jump.runUpMeters,3);assert.equal(out.result.jump.distance,12.8);
 const before=JSON.parse(JSON.stringify(data));data=JSON.parse(JSON.stringify(data));
 const replay=await settleRuleAction(opts);assert.equal(replay.status,'already_applied');assert.equal(draws,1);assert.deepEqual(data,before);
});

test('physical motion persists actual scene position and contacts through MVU time transactions without replaying impacts',async()=>{
 const {createOpeningRoster}=await import('../combat/opening.mjs');
 const a=actors();a.player=createOpeningRoster().player;a.player.position=[0,0,20];a.player.state.sleeping=true;
 a.player.state.physicalMotion={phase:'ballistic',position:[0,0,20],velocity:[2,0,0],gravity:9.8,elapsedSeconds:0,contactSequence:0,source:'actual-fall'};
 a.player.state.verticalPosition={heightAboveGround:20,groundElevation:0,source:'actual-position'};
 let data={stat_data:{'901_rules_poc':{schemaVersion:1,chatId:'motion',revision:0,actors:a,operations:{},ruleScene:{spatial:{source:'实际地形',map:{features:[]},actors:{player:{position:[0,0,20],source:'现场'}}}}}}};
 const opts={mvu:{getMvuData:()=>structuredClone(data),replaceMvuData:async next=>{data=JSON.parse(JSON.stringify(next));}},getAnchor:()=>({chatId:'motion',messageId:1,swipeId:0}),expectedChatId:'motion',operationId:'motion/1',expectedRevision:0,
  request:{kind:'rule',action:'time',actorId:'player',minutes:1/60,sourceQuote:'经过一秒'},reduce:(root,q)=>reduceRuleAction(root,q,options)};
 assert.equal((await settleRuleAction(opts)).status,'applied');
 assert.deepEqual(data.stat_data['901_rules_poc'].actors.player.position,[2,0,15.1]);
 const second={...opts,operationId:'motion/2',expectedRevision:1,request:{...opts.request,minutes:2/60,sourceQuote:'又经过两秒'}};
 const out=await settleRuleAction(second);assert.equal(out.status,'applied');
 const saved=structuredClone(data),root=data.stat_data['901_rules_poc'];
 assert.equal(root.actors.player.state.physicalMotion.phase,'grounded');
 assert.equal(root.actors.player.state.physicalMotion.contactSequence,1);
 assert.equal(out.result.changes.filter(x=>x.kind==='impact').length,1);
 assert.deepEqual(root.ruleScene.spatial.actors.player.position,root.actors.player.position);
 assert.equal((await settleRuleAction(second)).status,'already_applied');assert.deepEqual(data,saved);
});

test('a falling target uses an aura at contact time independently of actor iteration order',async()=>{
 const {createOpeningRoster}=await import('../combat/opening.mjs');
 const run=(expires,reverse)=>{
  const roster=createOpeningRoster(),player=roster.player,caster=roster.huang;
  player.position=[0,0,20];player.state.sleeping=true;caster.position=[20,0];
  player.state.physicalMotion={phase:'ballistic',position:[0,0,20],velocity:[0,0,0],gravity:9.8,elapsedSeconds:0,contactSequence:0,source:'actual-fall'};
  player.state.verticalPosition={heightAboveGround:20,groundElevation:0,source:'actual-height'};
  caster.state.resourceAuras={ward:{id:'ward',sourceId:'sourced-ward',casterId:'huang',radius:100,team:'all',remainingMinutes:expires/60,variables:{P:1,rank:2,schools:[]},effects:[{stat:'absorb',value:100}]}};
  const root={actors:reverse?{huang:caster,player}:{player,huang:caster},ruleScene:{spatial:{source:'actual-scene',map:{features:[]},actors:{player:{position:player.position},huang:{position:caster.position}}}}};
  return reduceRuleAction(root,{kind:'rule',action:'time',actorId:'player',minutes:3/60,sourceQuote:'实际三秒'},options);
 };
 for(const reverse of [false,true]){
  const expired=run(1,reverse),live=run(2.5,reverse);
  assert.equal(expired.result.changes.find(x=>x.kind==='impact').actualDamage,6);
  assert.equal(live.result.changes.find(x=>x.kind==='impact').actualDamage,0);
  assert.equal(expired.actors.player.state.recoveryClock.minutes,3/60);
  assert.equal(expired.actors.huang.state.recoveryClock.minutes,3/60);
 }
});
