import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {beginTurn} from '../core.mjs';
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
 assert.doesNotMatch(JSON.stringify(facts),/rolledSuccesses|margin|"claw"/);
});
