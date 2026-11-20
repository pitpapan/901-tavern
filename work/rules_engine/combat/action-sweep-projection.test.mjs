import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {beginTurn,endTurn} from '../core.mjs';
import {act} from './engine.mjs';
import {attachClaw} from './grapple.mjs';
import {publicScene} from './presentation.mjs';

const dice=()=>Array(1024).fill(8);
function encounter(id,enemy=false) {
 const b=createOpeningEncounter({participants:enemy?['player']:['player',id],enemies:enemy?[{id,type:id}]:[],
  positions:{player:[0,0],[id]:[1,0]},teams:{player:'玩家',[id]:'测试方'}});
 b.activeId=id;b.actors[id].state=beginTurn(b.actors[id].state).state;b.playerDefenseDeclarations=false;
 return b;
}
function scene(b,steps) {
 const operations={};let revision=0;
 for(const command of steps){const out=act(b,command,{drawDice:dice,grappleDeclarations:{player:'strength'}});b=out.battle;revision++;
  operations[revision]={signature:JSON.stringify(command),summary:{revision,result:out.result}};}
 return publicScene({battle:b,actors:b.actors,revision,operations});
}

test('bright reports stow and ready using each actual weapon mode',()=>{
 const b=encounter('bright');
 const facts=scene(b,[{actorId:'bright',abilityId:'stowWeapon'},{actorId:'bright',abilityId:'readyWeapon',weapon:'longknife'}]);
 assert.match(facts.events[0].arms,/双手空着/);assert.match(facts.events[1].arms,/长刀.*在手/);
 assert.match(facts.participants.find(x=>x.id==='bright').arms,/长刀.*在手/);
 const bow=scene(b,[{actorId:'bright',abilityId:'stowWeapon'},{actorId:'bright',abilityId:'readyWeapon',weapon:'bow'}]);
 assert.match(bow.events[0].arms,/双手空着/);assert.match(bow.events[1].arms,/旧长弓在手/);
 for(const [mode,expected] of [['bow',/旧长弓在手/],['dagger',/匕首在手/],['empty',/双手空着/]]){
  b.actors.bright.weaponMode=mode;
  assert.match(publicScene({battle:b,actors:b.actors,operations:{}}).participants.find(x=>x.id==='bright').arms,expected);
 }
});

test('pending and resisted status effects are not presented as applied',()=>{
 const b=encounter('hypnotist',true);
 b.sceneFacts={hypnosis:{hypnotist:{player:{understands:true,hears:true,recognizesDakas:true,instruction:'保护达卡斯'}}}};
 const command={actorId:'hypnotist',abilityId:'hypnotize',targetId:'player'},out=act(b,command,{drawDice:dice});
 for(const pending of [true,false]){
  const result=structuredClone(out.result);result.after.awaiting=pending?'player':undefined;
  if(!pending)result.statuses[0]={targetId:'player',type:'魅惑',applied:false,remaining:0};
  const facts=publicScene({battle:out.battle,actors:out.battle.actors,revision:1,operations:{test:{signature:JSON.stringify(command),summary:{revision:1,result}}}});
  assert.doesNotMatch(facts.events[0].outcome,/已受到魅惑/);
 }
});

test('huang explicitly has her drawn sword in hand or sheathed',()=>{
 const b=encounter('huang');b.actors.huang.sheathed=false;
 assert.match(publicScene({battle:b,actors:b.actors,operations:{}}).participants.find(x=>x.id==='huang').arms,/已在手/);
 b.actors.huang.sheathed=true;
 assert.match(publicScene({battle:b,actors:b.actors,operations:{}}).participants.find(x=>x.id==='huang').arms,/仍在鞘/);
});

test('actual hypnotize and tentacle effects on the player are projected without private dice',()=>{
 for(const [id,ability,type] of [['hypnotist','hypnotize','魅惑'],['chuul','tentacles','麻痹']]){
  const b=encounter(id,true);
  if(id==='hypnotist')b.sceneFacts={hypnosis:{hypnotist:{player:{understands:true,hears:true,recognizesDakas:true,instruction:'保护达卡斯'}}}};
  else attachClaw(b,b.actors.chuul,b.actors.player,{drawDice:dice,defense:'strength',claw:0});
  const facts=scene(b,[{actorId:id,abilityId:ability,targetId:'player'}]);
  assert.match(facts.events[0].outcome,new RegExp(type));
  assert.doesNotMatch(facts.interaction??'',/仅发生.*准备/);
  assert.doesNotMatch(JSON.stringify(facts),/rolledSuccesses|resistance|保护达卡斯|"points"/);
 }
});

test('a successful Chuul claw hold is reported as a resolved consequence',()=>{
 const b=encounter('chuul',true);b.actors.player.combatProfile.hpFixed=100;
 b.actors.player.state.derived.hpMax=100;b.actors.player.state.health.intact=100;
 b.actors.player.state.attributes.力量=1;b.actors.player.state.skills.肉搏={level:0,subs:{}};
 const command={actorId:'chuul',abilityId:'doubleStrike',targetId:'player'};
 const out=act(b,command,{drawDice:dice,grappleDeclarations:{player:'strength'}});
 assert.ok(out.result.grapples.some(g=>g.success));
 const facts=publicScene({battle:out.battle,actors:out.battle.actors,operations:{test:{signature:JSON.stringify(command),summary:{revision:1,result:out.result}}}});
 assert.match(JSON.stringify(facts.events[0]),/夹住|擒抱/);
 assert.deepEqual(facts.events[0].grappleStates,[{actor:'御临风',state:'擒抱中，未压制'}]);
 assert.doesNotMatch(JSON.stringify(facts),/rolledSuccesses|margin|"claw"/);
});

test('later suppression does not rewrite an earlier claw hold in the same narration batch',()=>{
 let b=encounter('chuul',true);b.actors.player.combatProfile.hpFixed=100;
 b.actors.player.state.derived.hpMax=100;b.actors.player.state.health.intact=100;
 b.actors.player.state.attributes.力量=1;b.actors.player.state.skills.肉搏={level:0,subs:{}};
 const operations={};
 for(const [index,abilityId] of ['doubleStrike','pressGrip'].entries()){
  if(index){b.round++;b.actors.chuul.state=beginTurn(endTurn(b.actors.chuul.state).state).state;}
  const command={actorId:'chuul',abilityId,targetId:'player'};
  const out=act(b,command,{drawDice:dice,grappleDeclarations:{player:'strength'}});b=out.battle;
  operations[index]={signature:JSON.stringify(command),summary:{revision:index+1,result:out.result}};
 }
 assert.equal(b.actors.player.state.grapple.pressed,true);
 const root={battle:b,actors:b.actors,revision:2,operations},before=structuredClone(root);
 const facts=publicScene(root);
 assert.deepEqual(facts.events.map(e=>e.grappleStates),[
  [{actor:'御临风',state:'擒抱中，未压制'}],[{actor:'御临风',state:'已压制'}]]);
 assert.doesNotMatch(JSON.stringify(facts),/holderId|margin|claw|rolledSuccesses/);
 assert.deepEqual(root,before);
 const old=structuredClone(root);delete old.operations[0].summary.result.after.participants.find(p=>p.id==='player').grapple;
 assert.equal(publicScene(old).events[0].grappleStates,undefined,'historical snapshots without state remain unknown');
 old.operations[0].summary.result.after.awaiting='player';old.revision=1;delete old.operations[1];
 assert.equal(publicScene(old).events[0].grappleStates,undefined,'pending attacks must not declare an established hold');
});

function projectDamage(damage,{awaiting,opportunities=[],afterRevision=0}={}) {
 const b=encounter('huang');
 const command={actorId:'huang',abilityId:'strike',targetId:'player'};
 const result={actorId:'huang',abilityId:'strike',damage,opportunities,
  after:{awaiting,participants:Object.entries(b.actors).map(([id,a])=>({id,position:a.position})),visibleTo:{player:['player','huang']}}};
 const root={battle:b,actors:b.actors,revision:1,operations:{hit:{signature:JSON.stringify(command),summary:{revision:1,result}}}};
 const before=structuredClone(root),facts=publicScene(root,{afterRevision});
 assert.deepEqual(root,before,'projection must not change the mechanical save');
 return facts;
}

test('player injury types use resolved severity after conversion, not weapon or input severity',()=>{
 const facts=projectDamage([{targetId:'player',inputSeverity:'L',severity:'B',actualDamage:7}]);
 assert.deepEqual(facts.events[0].playerDamageTypes,['冲击']);
 assert.doesNotMatch(JSON.stringify(facts),/actualDamage|inputSeverity|7B|7点/);
});

test('mixed player injury types stay in their event and exclude NPC and zero damage',()=>{
 const facts=projectDamage([
  {targetId:'player',severity:'B',actualDamage:2},{targetId:'player',severity:'L',actualDamage:3},
  {targetId:'player',severity:'B',actualDamage:1},{targetId:'player',severity:'A',actualDamage:0},
  {targetId:'huang',severity:'A',actualDamage:9}]);
 assert.deepEqual(facts.events[0].playerDamageTypes,['冲击','严重']);
 assert.deepEqual(projectDamage([{targetId:'player',severity:'A',actualDamage:1}]).events[0].playerDamageTypes,['恶性']);
 assert.equal(projectDamage([{targetId:'player',severity:'L',actualDamage:0}]).events[0].playerDamageTypes,undefined);
 assert.equal(projectDamage([{targetId:'huang',severity:'L',actualDamage:9}]).events[0].playerDamageTypes,undefined);
 assert.equal(projectDamage([{targetId:'player',severity:'B',actualDamage:7}],{afterRevision:1}).events.length,0);
});

test('pending main attacks do not predict injury types but settled opportunity damage is retained',()=>{
 const damage=[{targetId:'player',severity:'L',actualDamage:3}];
 assert.equal(projectDamage(damage,{awaiting:'player'}).events[0].playerDamageTypes,undefined);
 const facts=projectDamage([],{awaiting:'player',opportunities:[{actorId:'huang',damage:[{targetId:'player',severity:'B',actualDamage:2}]}]});
 assert.deepEqual(facts.events[0].playerDamageTypes,['冲击']);
});
