import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter} from './opening.mjs';
import {act,attackProfile} from './engine.mjs';
import {equipment} from './mechanics.mjs';
import {beginTurn} from '../core.mjs';
import {playerDeclarationContext} from './presentation.mjs';
import {validateStep} from '../gm_runtime/narrative.mjs';

function battle(){
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.actors.player.team='party';b.actors.huang.team='enemy';b.activeId='player';b.reactionWindows=false;b.playerDefenseDeclarations=false;
 const a=b.actors.player;a.state=beginTurn(a.state).state;
 a.state.anatomy={source:'noncanon humanoid test fixture',graspingLimbs:['left-hand','right-hand']};
 a.state.combatManeuvers={weaponUnavailable:true};delete a.state.equippedWeaponId;delete a.state.equippedResources?.weapon;
 a.state.possessions={items:[{id:'test-sword',name:'试验剑',source:'noncanon fixture',location:'ground',position:[0,0],held:false,oneHanded:true,weapon:{name:'试验剑',skill:'白刃',damage:2,damageType:'L'},durability:10}]};
 return b;
}
const pick={actorId:'player',abilityId:'pickupWeapon',fromActorId:'player',itemId:'test-sword'};
const run=(b,c=pick)=>act(b,c,{playerAuthorized:true,drawDice:()=>Array(1024).fill(1)});

test('ground pickup pays move, equips the same intact instance, then attacks for standard',()=>{
 const b=battle(),before=structuredClone(b),out=run(b),a=out.battle.actors.player;
 assert.equal(a.state.turn.move,0);assert.equal(a.state.turn.standard,1);
 assert.equal(a.state.equippedWeaponId,'test-sword');assert.equal(a.state.combatManeuvers.weaponUnavailable,undefined);
 const item=a.state.possessions.items[0];assert.equal(item.held,true);assert.equal(item.location,'carried');assert.equal(item.position,undefined);assert.equal(item.durability,10);
 assert.equal(item.grip.hands,1);assert.equal(out.result.itemUse.operation,'pickup');
 assert.equal(equipment(a).weapon.instanceId,'test-sword');
 assert.equal(attackProfile(out.battle,'player',{targetId:'huang'}).weapon,2);
 const hit=run(out.battle,{actorId:'player',abilityId:'strike',targetId:'huang'});
 assert.equal(hit.battle.actors.player.state.turn.standard,0);assert.equal(hit.result.attack.weapon,2);
 assert.deepEqual(b,before);assert.throws(()=>run(out.battle));
});

test('available ground objects reach the translator with an exact instance and source holder',()=>{
 const b=battle(),context=playerDeclarationContext(b,0);
 assert.ok(context.legalOptions.some(c=>c.abilityId==='pickupWeapon'&&c.itemId==='test-sword'&&c.fromActorId==='player'));
 assert.ok(context.items.some(i=>i.id==='test-sword'&&i.location==='ground'));
 const quote='拾起试验剑';assert.equal(validateStep({quote,command:pick},quote,b).itemId,'test-sword');
 assert.throws(()=>validateStep({quote,command:pick},`[${quote}]`,b),/私念/);
});

test('transfer removes the ground instance from its old holder without duplicating it',()=>{
 const b=battle();b.actors.huang.state.possessions={items:b.actors.player.state.possessions.items};b.actors.player.state.possessions.items=[];
 const out=run(b,{...pick,fromActorId:'huang'}).battle;
 assert.equal(out.actors.huang.state.possessions.items.length,0);assert.equal(out.actors.player.state.possessions.items.length,1);
});

test('distance, damaged weapons, occupied hands and exhausted actions fail without changing state',()=>{
 for(const change of [
  b=>b.actors.player.state.possessions.items[0].position=[20,0],
  b=>b.actors.player.state.possessions.items[0].destroyed=true,
  b=>b.actors.player.state.possessions.items[0].hiddenFrom=['player'],
  b=>b.actors.player.state.possessions.items.push({id:'box',source:'fixture',held:true,location:'carried',grip:{source:'fixture',hands:2}}),
  b=>{b.actors.player.state.turn.move=0;b.actors.player.state.turn.standard=0;}
 ]){const b=battle();change(b);const before=structuredClone(b);assert.throws(()=>run(b));assert.deepEqual(b,before);}
});

test('two-handed pickup requires both usable hands and cannot replace an active weapon',()=>{
 const b=battle();b.actors.player.state.possessions.items[0].oneHanded=false;
 assert.equal(run(b).battle.actors.player.state.possessions.items[0].grip.hands,2);
 b.actors.player.state.permanentConditions=[{kind:'limbLoss',limbId:'left-hand',source:'fixture'}];
 assert.throws(()=>run(b),/空闲手/);
 const active=battle();active.actors.player.state.possessions.items.push({id:'other',source:'fixture',name:'另一把剑',location:'carried',held:true,oneHanded:true,weapon:{skill:'白刃',damage:1}});active.actors.player.state.equippedWeaponId='other';
 assert.throws(()=>run(active),/已有生效武器/);
});
