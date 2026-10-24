import test from 'node:test';
import assert from 'node:assert/strict';
import {createNarrativeSession} from './narrative.mjs';
import {createOpeningFixture,stoneWithdrawalBinding} from './opening.mjs';
import {resolveOpeningBinding} from './opening-binding.mjs';
import {buildCharacter} from '../../character_builder/builder.mjs';
import {createOpeningEncounter} from '../combat/opening.mjs';
import {resolveStep} from '../combat/transitions.mjs';
import {publicScene} from '../combat/presentation.mjs';
test('a withdrawal paused for incoming opportunity defense stays at the original position in public facts',()=>{
  const before=createOpeningEncounter(stoneWithdrawalBinding()),command={actorId:'player',abilityId:'move',to:[8,0]};
  before.actors.stone.position=[2.5,0]; // PHB threat is one 1.5m grid, even with 2m reach.
  const out=resolveStep(before,command,{playerAuthorized:true});
  assert.equal(out.battle.pending.awaiting,'player');assert.deepEqual(out.battle.actors.player.position,[4,0]);
  const root={revision:1,battle:out.battle,actors:Object.fromEntries(Object.entries(out.battle.actors).map(([id,a])=>[id,{state:a.state}])),
    operations:{pending:{signature:JSON.stringify(command),summary:{revision:1,result:out.result}}}};
  const facts=publicScene(root),event=facts.events[0];assert.equal(event.status,'pending');assert.match(event.outcome,/仍在原站位.*尚未移动/);
  for(const field of ['travelMeters','route','relativePosition'])assert.equal(event[field],undefined);
  assert.doesNotMatch(facts.interaction??'',/双方未发生攻击/);
});
test('opening baseline passes the ordinary replay gate Builder contract',()=>{
  const b=createOpeningFixture().baseline,built=buildCharacter(b.definition,b.openingState.isolatedTestInitial);
  assert.equal(built.ok,true,JSON.stringify(built.report));
});
test('natural binding uses only adopted templates and same-instance current positions on re-entry',async()=>{
  const source='御临风与石像在入口相距两米，其他人不在场。',base=stoneWithdrawalBinding();
  const extracted={instanceId:'trial-entry',scenario:source,participants:['player'],enemies:['stone'],positions:base.positions,map:base.map,evidence:[source],goal:base.objective};
  const invoke=options=>resolveOpeningBinding({id:'capital-stone',chat:[{is_user:false,mes:source}],...options},async()=>JSON.stringify(extracted));
  const first=await invoke({});assert.equal(first.enemies[0].id,'trial-entry:stone');
  const reentry=await invoke({priorBinding:first,currentBattle:{actors:{player:{position:[8,0]},'trial-entry:stone':{position:[3,0]}}}});
  assert.deepEqual(reentry.positions.player,[8,0]);assert.deepEqual(reentry.positions['trial-entry:stone'],[3,0]);
  extracted.instanceId='another-entrance';const other=await invoke({priorBinding:first});assert.notEqual(other.enemies[0].id,first.enemies[0].id);
});
test('host scene registration persists in selected MVU, restores on refresh and feeds real narrative entry',async()=>{
  const chat=[{is_user:false,mes:'初至帝都',swipe_id:0}],floors={};
  const tavern={chat,chatId:'opening-entry-test',saveChat:async()=>{}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(d,{message_id})=>{floors[message_id]=structuredClone(d);}};
  let plan={steps:[]};const facts=[];
  const options={baseline:createOpeningFixture().baseline,fixtureFactory:createOpeningFixture,mvu,tavern,
    createChatMessages:async rows=>{for(const r of rows)chat.push({is_user:r.role==='user',mes:r.message,swipe_id:0,extra:r.extra??{}});},
    setChatMessages:async rows=>{for(const r of rows)chat[r.message_id].extra=r.extra;},
    generateRaw:async req=>{const c=JSON.parse(req.user_input);return JSON.stringify({option:c.legalOptions.findIndex(o=>o.abilityId==='end')});},
    interpret:async()=>plan,narrate:async f=>{facts.push(f);return '石像留在阵纹之内，洞外的退路就在前方。';},drawDice:()=>Array(1024).fill(1)};
  let session=createNarrativeSession(options);await session.prepare();assert.equal(session.encounterOptions.length,6);
  const registered=await session.registerEncounter(stoneWithdrawalBinding({isolated:true}));assert.equal(registered.revision,1);
  const before=structuredClone(floors[0]);session=createNarrativeSession(options);await session.prepare();assert.deepEqual(floors[0],before);assert.ok(session.encounterOptions.some(e=>e.id==='stone-withdrawal'));
  const player=text=>{chat.push({is_user:true,mes:text,swipe_id:0});return {chatId:tavern.chatId,messageId:chat.length-1,swipeId:0,text};};
  await session.enterForPlayer('stone-withdrawal',player('我在洞口接近石像，进入当前接战。'));
  const own=await session.currentState();assert.equal(own.player.hpMax,12);assert.equal(own.player.attack.dp,21);
  plan={steps:[{quote:'启动流风',command:{abilityId:'flow',tier:2},cost:{energy:{流风:2}}}]};await session.handleTurn({player:player('启动流风')});
  plan={steps:[{quote:'退到圈外',command:{abilityId:'move',to:[8,0]}}]};await session.handleTurn({player:player('退到圈外')});
  if(session.controller.read().battle.pending){plan={steps:[{quote:'普通防御',command:{abilityId:'react',choice:'decline',defense:'normal'}}]};await session.handleTurn({player:player('普通防御')});}
  const final=floors[chat.length-1].stat_data['901_rules_poc'];assert.equal(final.battle.mode,'story');assert.equal(final.actors.player.state.resources.流风.current,20);
  assert.equal(final.actors.player.state.xp,0);assert.equal(final.battle.resolution.taskComplete,false);assert.equal(final.actors.player.state.inventory.find(i=>i.name==='药C').quantity,4);
  assert.equal(final.battle.actors.player.buffs.flow,2);assert.equal(final.battle.actors.player.durationCarry.flow.remainingRounds,10);
  assert.equal(facts.at(-1).resolution.kind,'withdrawal');
  const story=session.storyContext();assert.deepEqual(story.participants.map(a=>a.name),['御临风','石像魔偶']);
  assert.match(story.participants.find(a=>a.name==='石像魔偶').location,/6米/);
  for(const a of story.participants)for(const key of ['health','energy','resources','attack','defense','attributes','skills','will'])assert.equal(a[key],undefined);
  assert.equal(story.events,undefined);
  const saved=structuredClone(final);session=createNarrativeSession(options);await session.prepare();assert.deepEqual(floors[chat.length-1].stat_data['901_rules_poc'],saved);
});
