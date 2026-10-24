import test from 'node:test';
import assert from 'node:assert/strict';
import {beginTurn,endTurn} from '../core.mjs';
import {createOpeningEncounter,createOpeningRoster,createOpeningEnemy} from './opening.mjs';
import {act,attackProfile,opportunityActors,resolveDefense,panel} from './engine.mjs';
import {canObserve} from './map.mjs';
import {saveProfile} from './mechanics.mjs';
const dice=()=>Array(512).fill(8);
function battle(id='player') {
  const b=createOpeningEncounter({id:'coverage',scenario:'隔离定向验证',participants:['player','huang','bright'],
    enemies:[{id:'guard',type:'cityGuard'}],positions: {player:[0,0],huang:[0,3],bright:[3,0],guard:[1.5,0]},
    map:{bounds:[-5,-5,50,50],features:[]}});
  b.activeId=id;b.actors[id].state=beginTurn(b.actors[id].state).state;b.playerDefenseDeclarations=false;return b;
}
test('legendary dodge reduces high speed on reflex saves as well as defenses',()=>{
  const a=createOpeningRoster().player;assert.equal(saveProfile(a,'reflex',{speed:5}).dp,8);
  assert.equal(saveProfile(a,'reflex',{speed:7}).dp,6);
});
test('bright switches to the adopted blade, spends stowing/drawing actions and consumes no arrow',()=>{
  let b=battle('bright');b.actors.guard.position=[4,0];
  b=act(b,{actorId:'bright',abilityId:'stowWeapon'}).battle;
  b=act(b,{actorId:'bright',abilityId:'readyWeapon',weapon:'longknife'}).battle;
  assert.equal(attackProfile(b,'bright').dp,7);assert.equal(attackProfile(b,'bright').cap,6);
  assert.equal(b.actors.bright.state.turn.standard,0);
  b.actors.bright.state=beginTurn(endTurn(b.actors.bright.state).state).state;
  const out=act(b,{actorId:'bright',abilityId:'strike',targetId:'guard'},{drawDice:dice});
  assert.equal(out.battle.actors.bright.ammunition,20);
});
test('wind sense requires air connection, while Huang can see and strike a spirit',()=>{
  const b=battle('huang');b.actors.guard.spirit=true;b.actors.guard.position=[0,4];
  assert.equal(canObserve(b,b.actors.guard,'player'),false);
  assert.equal(canObserve(b,b.actors.guard,'huang'),true);
  b.map.airflow=false;assert.equal(canObserve(b,b.actors.player,'bright'),false);
  b.actors.huang.sheathed=false;
  assert.equal(act(b,{actorId:'huang',abilityId:'strike',targetId:'guard'},{drawDice:dice}).result.attack.spiritEligible,true);
});
test('bright ignores difficult movement cost without crossing solid walls',()=>{
  const b=battle('bright');b.actors.guard.position=[-3,-3];
  b.map.features=[{id:'rubble',kind:'difficult',rect:[4,-1,30,2]}];
  const out=act(b,{actorId:'bright',abilityId:'move',to:[24,0]});assert.equal(out.result.movement.cost,21);
  b.map.features.push({id:'wall',kind:'obstacle',rect:[10,-1,1,2]});
  assert.throws(()=>act(b,{actorId:'bright',abilityId:'move',to:[24,0]}),/障碍/);
});
test('opportunity threat uses four orthogonal directions and at most one grid',()=>{
  const b=battle();b.actors.guard.reach=6;b.actors.guard.position=[3,0];
  assert.deepEqual(opportunityActors(b,{actorId:'player',abilityId:'move',to:[-2,0]}),[]);
  b.actors.guard.position=[1,1];assert.deepEqual(opportunityActors(b,{actorId:'player',abilityId:'move',to:[-2,0]}),[]);
  b.actors.guard.position=[1.5,0];assert.equal(opportunityActors(b,{actorId:'player',abilityId:'move',to:[-2,0]}).length,1);
});
test('failed B-only pre-action check commits coma without attacking or spending energy',()=>{
  const b=battle(),a=b.actors.player;a.state.health={intact:0,B:12,L:0,A:0,temp:0};
  assert.throws(()=>act(b,{actorId:'player',abilityId:'tornado',targetId:'guard'},{playerAuthorized:true}),/行动前|DC/);
  const out=act(b,{actorId:'player',abilityId:'tornado',targetId:'guard',preActionDC:2},{playerAuthorized:true,drawDice:()=>Array(512).fill(1)});
  assert.equal(out.battle.actors.player.state.health.coma,true);assert.equal(out.battle.actors.player.state.resources.流风.current,22);
  assert.deepEqual(out.result.damage,[]);
});
test('combat first aid stops A deterioration while spending a full round',()=>{
  const b=battle('huang'),t=b.actors.player;t.position=[0,2];t.state.health={intact:0,B:0,L:11,A:1,temp:0};
  const out=act(b,{actorId:'huang',abilityId:'firstAid',targetId:'player'},{drawDice:dice});
  assert.equal(out.battle.actors.player.state.health.deteriorationStopped,true);
  assert.equal(out.battle.actors.huang.state.turn.standard,0);assert.equal(out.battle.actors.huang.state.turn.move,0);
});
test('all four adopted NPCs expose the actual period stats and skill cards',()=>{
  for(const [type,hp,dp,speed]of [['installer',7,4,10],['hypnotist',7,4,11],['chuul',17,18,18],['gremlin',15,19,46]]) {
    const a=createOpeningEnemy(type),b={actors:{[type]:a},round:1,activeId:type};
    assert.equal(a.state.derived.hpMax,hp);assert.equal(attackProfile(b,type).dp,dp);assert.equal(panel(b,type).speed,speed);
  }
});
test('hypnosis spends its registered mana and survives the caster leaving and ordinary sleep',()=>{
  const b=battle();b.actors.hypnotist=createOpeningEnemy('hypnotist');b.actors.hypnotist.position=[0,1];
  b.activeId='hypnotist';b.actors.hypnotist.state=beginTurn(b.actors.hypnotist.state).state;
  b.sceneFacts={hypnosis:{hypnotist:{player:{understands:true,hears:true,recognizesDakas:true,instruction:'保护达卡斯'}}}};
  const out=act(b,{actorId:'hypnotist',abilityId:'hypnotize',targetId:'player'},{drawDice:dice});
  assert.equal(out.battle.actors.hypnotist.state.resources.魔力.current,4);
  assert.equal(out.result.statuses[0].remaining,12);
  assert.equal(out.battle.actors.player.state.statuses.find(s=>s.type==='魅惑').restBlocked,true);
});
test('gremlin double attack spends all three action slots and earth travel uses the registered path',()=>{
  const b=battle();b.actors.gremlin=createOpeningEnemy('gremlin');b.actors.gremlin.position=[0,1];b.activeId='gremlin';
  b.actors.gremlin.state=beginTurn(b.actors.gremlin.state).state;
  const out=act(b,{actorId:'gremlin',abilityId:'doubleStrike',targetId:'player',secondTargetId:'player'},{drawDice:()=>Array(512).fill(1)});
  assert.equal(out.result.attacks.length,2);assert.equal(out.result.attacks[0].rawDP,17);
  assert.deepEqual(['standard','move','swift'].map(k=>out.battle.actors.gremlin.state.turn[k]),[0,0,0]);
  assert.throws(()=>act(b,{actorId:'gremlin',abilityId:'burrow'}),/土层|通路/);
  b.map.features.push({id:'soil',kind:'zone',rect:[-1,-1,12,5],surface:'earth',earthPassage:true,earthExit:true});
  const dug=act(b,{actorId:'gremlin',abilityId:'burrow'}).battle;
  assert.equal(dug.actors.gremlin.state.resources.魔力.current,6);assert.equal(panel(dug,'gremlin').speed,8);
  assert.throws(()=>act(dug,{actorId:'gremlin',abilityId:'strike',targetId:'player'}),/地下/);
});
