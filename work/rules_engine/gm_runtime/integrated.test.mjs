import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createIntegratedSession,createIntegrationFixture} from './integrated.mjs';
import * as integration from './integrated.mjs';
import {createReplayCheckRuntime} from './replay-check.mjs';

const baseline=JSON.parse(await readFile(new URL('../../character_builder/real_character/yulinfeng_replay_t0.baseline.json',import.meta.url)));
test('host registers sourced temperature changes without resetting actor resources',async()=>{
  const f=fixture();await f.session.prepare();
  const before=structuredClone(f.floors[0].stat_data['901_rules_poc'].actors.player.state.resources);
  await f.session.registerRuleScene({source:'已确认场景',environments:{player:{source:'室内适温',freezeRecovery:true}}});
  const saved=f.floors[0].stat_data['901_rules_poc'];
  assert.equal(saved.actors.player.state.statusEnvironment.freezeRecovery,true);
  assert.deepEqual(saved.actors.player.state.resources,before);
  await assert.rejects(()=>f.session.registerRuleScene({source:'场景',environments:{player:{freezeRecovery:false}}}),/来源/);
});
test('switching chats replaces the captured session before initialization or writeback',()=>{
  let current={chatId:'first'},disposed=0;
  const access=integration.createChatSessionAccess(()=>current,tavern=>({chatId:tavern.chatId,dispose(){disposed++;}}));
  const first=access();
  assert.equal(access(),first);
  current={chatId:'second'};
  assert.equal(access().chatId,'second');
  assert.notEqual(access(),first);
  assert.equal(disposed,1);
});
function fixture() {
  const chat=[{is_user:false,mes:'隔离演练开场',swipe_id:0}];
  const floors={};
  const tavern={chat,chatId:'integration-test',saveChat:async()=>{}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),
    replaceMvuData:async(data,{message_id})=>{floors[message_id]=structuredClone(data);}};
  const stats={narrations:0,choices:[]};
  const createChatMessages=async messages=>{
    for(const m of messages)chat.push({mes:m.message,is_user:m.role==='user',swipe_id:0,extra:m.extra??{}});
  };
  const session=createIntegratedSession({baseline,mvu,tavern,createChatMessages,
    setChatMessages:async updates=>{for(const u of updates)chat[u.message_id].extra=structuredClone(u.extra);},
    generateRaw:async request=>{
      const context=JSON.parse(request.user_input);
      const options=context.legalOptions;
      const index=options.findIndex(c=>c.abilityId==='react'&&c.choice==='decline'||
        c.abilityId==='strike'||c.abilityId==='draw');
      return JSON.stringify({option:index<0?options.findIndex(c=>c.abilityId==='end'):index});
    },
    drawDice:()=>Array(1024).fill(9),
    showChoices:value=>stats.choices.push(value),
    narrateReturn:async()=>{stats.narrations++;return '演练已经结束，场上的伤势仍在。';},
  });
  const player=text=>{
    chat.push({is_user:true,mes:text,swipe_id:0});
    return {chatId:tavern.chatId,messageId:chat.length-1,swipeId:0,text};
  };
  return {session,chat,floors,mvu,tavern,stats,player};
}
test('integration uses one player state for ordinary checks and combat, with no T0 rewrite',async()=>{
  const before=structuredClone(baseline);
  const f=fixture(),player=f.player('我尝试走过练习横木。');
  await f.session.prepare({player});
  const data=createIntegrationFixture(baseline);
  assert.equal(data.encounters['jiang-huang']().actors.huang.weaponSize,3);
  assert.equal(data.actors.bright.state.resources.流风,undefined);
  assert.deepEqual(data.actors.player.state.resources.流风,{current:22,max:22});
  const check=createReplayCheckRuntime({baseline:data.baseline,mvu:f.mvu,
    expectedChatId:f.tavern.chatId,getAnchor:()=>player,drawDice:()=>Array(128).fill(8)});
  await check.settle({operationId:`gm-runtime/${player.chatId}/${player.messageId}/0`,
    request:{kind:'check',attribute:'敏捷',skill:'运动',dc:1}});
  const input=f.player('我参加与姜子尤的演练。');
  await f.session.prepare({player:input});
  const result=await f.session.enterForPlayer('yulin-jiang',input);
  assert.equal(result.status,'awaiting_player');
  const root=f.floors[f.chat.length-1].stat_data['901_rules_poc'];
  assert.equal(root.actors.player.state.derived.hpMax,21);
  assert.equal(root.actors.player.state.skills.医疗.level,2);
  assert.deepEqual(root.actors.player.state.resources.流风,data.actors.player.state.resources.流风);
  assert.ok(!root.actors.yulin);
  assert.equal(root.battle.activeId,'player');
  assert.equal(Object.keys(root.operations).length,2);
  assert.equal(f.stats.choices.length,1);
  assert.deepEqual(baseline,before);
});
test('NPC fight returns to story once; resume keeps results and next chat inherits injuries',async()=>{
  const f=fixture(),player=f.player('开始姜黄演练，我在旁观看。');
  await f.session.prepare({player});
  const result=await f.session.enterForPlayer('jiang-huang',player);
  assert.equal(result.status,'story');
  const saved=structuredClone(f.floors[f.chat.length-1].stat_data['901_rules_poc']);
  assert.equal(saved.battle.mode,'story');
  assert.ok(saved.actors.player);
  assert.ok(Object.values(saved.actors).some(a=>a.state.health.L>0||a.state.health.A>0||a.state.health.B>0));
  assert.equal(f.stats.narrations,1);
  await f.session.resumeEntry(player);
  assert.equal(f.stats.narrations,1);
  assert.deepEqual(f.floors[f.chat.length-1].stat_data['901_rules_poc'],saved);
  const next=f.player('我询问他们现在的情况。');
  await f.session.prepare({player:next});
  assert.equal(await f.session.resumeEntry(next),null);
  assert.deepEqual(f.floors[next.messageId].stat_data['901_rules_poc'],saved);
});
test('player-selected energy attack settles, writes back and reaches story without resetting costs',async()=>{
  const f=fixture(),player=f.player('我参加与姜子尤的演练。');
  await f.session.prepare({player});
  await f.session.enterForPlayer('yulin-jiang',player);
  let spent=false;
  for(let i=0;i<40&&f.session.controller.read().battle.mode!=='story';i++){
    const choice=f.session.controller.options();
    assert.equal(choice.controller,'player');
    const wanted=spent?['react','strike','end']:['tornado','react','strike','end'];
    let option=-1;
    for(const id of wanted){
      option=choice.options.findIndex(o=>o.command.abilityId===id&&
        (id!=='react'||o.command.choice==='decline')&&!o.command.resource);
      if(option>=0)break;
    }
    assert.ok(option>=0);
    if(choice.options[option].command.abilityId==='tornado')spent=true;
    await f.session.playerChoice({option,expectedRevision:choice.revision});
  }
  const root=f.floors[f.chat.length-1].stat_data['901_rules_poc'];
  assert.equal(root.battle.mode,'story');
  assert.ok(spent);
  assert.ok(root.actors.player.state.resources.风池.current<10);
  assert.equal(f.stats.narrations,1);
});

test('host registers Guanlan acquisition and sourced learning offers without resetting XP',async()=>{
 const f=fixture();await f.session.prepare();const actor=f.floors[0].stat_data['901_rules_poc'].actors.player;const xp=actor.state.xp;
 await f.session.registerRuleScene({source:'隔离实际持有记录',guanlanGrants:{player:{source:'隔离假设：已经获得观澜法',acquired:true,wufaXP:4}},learningOffers:{art:{id:'art',resourceId:'guanlan.test',name:'隔离技艺',source:'隔离已核价技艺8XP',adopted:true,actorIds:['player'],requirementsMet:true,kind:'technique',tree:'guanlan',grade:'D',baseCost:8}}});
 const saved=f.floors[0].stat_data['901_rules_poc'];assert.equal(saved.actors.player.state.xp,xp);assert.equal(saved.actors.player.state.guanlan.wufaXP,4);assert.equal(saved.ruleScene.learningOffers.art.baseCost,8);
 const before=structuredClone(f.floors);
 await assert.rejects(()=>f.session.registerRuleScene({source:'重复',guanlanGrants:{player:{source:'重复',acquired:true,wufaXP:100}}}),/不能重置/);assert.deepEqual(f.floors,before);
});
