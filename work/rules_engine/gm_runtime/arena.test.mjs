import test from 'node:test';
import assert from 'node:assert/strict';
import {createArenaFixture,ARENA_OPPONENTS} from './arena.mjs';
import {buildCharacter} from '../../character_builder/builder.mjs';
import {createNarrativeSession} from './narrative.mjs';

test('two isolated arena fixtures keep T0 baseline and only the actual opponent',async()=>{
  for(const [id,opponent]of Object.entries(ARENA_OPPONENTS)) {
    const fixture=createArenaFixture(null,{opponentId:id});
    assert.deepEqual(Object.keys(fixture.actors),['player',id]);
    const built=buildCharacter(fixture.baseline.definition,fixture.baseline.openingState.isolatedTestInitial);
    assert.equal(built.ok,true,JSON.stringify(built.report));
    assert.equal(fixture.actors.player.state.derived.hpMax,12);
    assert.equal(fixture.actors.player.state.resources.流风.current,22);
    assert.deepEqual(fixture.encounterOptions.map(x=>x.id),[opponent.id]);
    const battle=fixture.encounters[opponent.id]();
    assert.deepEqual(Object.keys(battle.actors),['player',id]);
    assert.deepEqual(battle.actors[id].position,[opponent.distance,0]);
  }
});

test('new arena story prepares without a battle and exposes only one natural encounter',async()=>{
  const chat=[{is_user:false,mes:'隔离擂台，御临风对米蕾娅，相距十二米，尚未动手。',swipe_id:0}],floors={};
  const tavern={chat,chatId:'arena-fixture-contract',saveChat:async()=>{}};
  const mvu={getMvuData:({message_id})=>structuredClone(floors[message_id]??{stat_data:{}}),replaceMvuData:async(d,{message_id})=>{floors[message_id]=structuredClone(d);}};
  const fixture=createArenaFixture(null,{opponentId:'mireya'});
  const session=createNarrativeSession({baseline:fixture.baseline,fixtureFactory:b=>createArenaFixture(b,{opponentId:'mireya'}),mvu,tavern,
    createChatMessages:async()=>{},setChatMessages:async()=>{},generateRaw:async()=>{throw Error('preparation must not call model');},narrate:async()=>''});
  await session.prepare();
  const saved=floors[0].stat_data['901_rules_poc'];
  assert.equal(saved.battle,undefined);assert.equal(saved.revision,0);
  assert.deepEqual(Object.keys(saved.actors),['player','mireya']);
  assert.deepEqual(session.encounterOptions.map(x=>x.id),['arena-mireya']);
});
