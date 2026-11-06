import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningEncounter,createOpeningRoster} from './opening.mjs';
import {act,attackProfile} from './engine.mjs';
import {beginTurn} from '../core.mjs';
import {playerDeclarationContext} from './presentation.mjs';
import {equipment} from './mechanics.mjs';
import {reduceRuleAction} from '../gm_runtime/rule-actions.mjs';
import {equipmentDeclarations,equipmentDeclarationMatches} from '../equipment-state.mjs';
import {validateStep} from '../gm_runtime/narrative.mjs';

function fixture(){
 const b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});
 b.activeId='player';b.reactionWindows=false;b.playerDefenseDeclarations=false;
 const a=b.actors.player;a.state=beginTurn(a.state).state;a.sheathed=true;
 a.state.anatomy={source:'isolated fixture',graspingLimbs:['left-hand','right-hand']};
 a.state.combatManeuvers={weaponUnavailable:true};
 a.state.possessions={items:[{id:'opening.qifeng',name:'弃风剑',source:'approved opening 6L sword; test storage fixture',slot:'weapon',location:'carried',access:'worn',held:false,oneHanded:true,
  weapon:{name:'弃风剑',damage:6,skill:'白刃',sub:'长剑',ap:2,magic:2,defenseReduction:3}}]};
 return b;
}
const command={actorId:'player',abilityId:'drawWeapon',itemId:'opening.qifeng'};
const run=(b,c=command)=>act(b,c,{playerAuthorized:true,drawDice:()=>Array(1024).fill(1)});
const quote='御临风从腰间拔出弃风剑';
const request={kind:'rule',action:'equipment',actorId:'player',steps:[{operation:'draw',itemId:'opening.qifeng',sourceQuote:quote}]};

test('normal carried sword draw pays move once and synchronizes the actual held instance',()=>{
 const b=fixture(),before=structuredClone(b),out=run(b),a=out.battle.actors.player;
 assert.equal(a.state.turn.move,0);assert.equal(a.state.turn.standard,1);assert.equal(a.state.turn.swift,1);
 assert.equal(a.state.possessions.items[0].held,true);assert.equal(a.state.equippedWeaponId,'opening.qifeng');
 assert.equal(a.state.combatManeuvers.weaponUnavailable,undefined);assert.equal(a.sheathed,false);
 assert.equal(equipment(a).weapon.instanceId,'opening.qifeng');assert.equal(attackProfile(out.battle,'player',{targetId:'huang'}).weapon,6);
 assert.equal(out.result.itemUse.operation,'draw');assert.deepEqual(b,before);assert.throws(()=>run(out.battle));
});
test('noncombat drawing persists the same instance without combat slots, invented minutes or attacks',()=>{
 const actors=fixture().actors;actors.player.state.turn={phase:'ready',standard:0,move:0,swift:0};
 const input={actors,revision:0,operations:{}};
 const out=reduceRuleAction(input,request,{actorTemplates:createOpeningRoster()});
 assert.equal(out.actors.player.state.possessions.items[0].held,true);
 assert.equal(out.actors.player.state.equippedWeaponId,'opening.qifeng');
 assert.equal(out.actors.player.combatCarry.sheathed,false);
 assert.deepEqual(out.actors.player.state.turn,input.actors.player.state.turn);
 assert.equal(out.actors.player.state.recoveryClock,undefined);
 assert.equal(out.result.elapsedMinutes,0);assert.equal(out.battle,undefined);
});
test('actual draw declaration reaches both routes; private thoughts and dialogue are not executions',()=>{
 const b=fixture(),s=b.actors.player.state;
 assert.equal(equipmentDeclarationMatches(request,quote,s),true);
 assert.equal(equipmentDeclarationMatches({...request,steps:[{...request.steps[0],sourceQuote:'从腰间拔出弃风剑，右手握住剑柄'}]},quote+'，右手握住剑柄；不攻击。',s),true);
 assert.equal(equipmentDeclarations(quote).length,1);
 for(const text of [`[${quote}]`,`“${quote}。”`,'我没有拔出弃风剑','我打算拔出弃风剑'])assert.equal(equipmentDeclarations(text,s).length,0);
 const context=playerDeclarationContext(b,0);
 assert.ok(context.legalOptions.some(c=>c.abilityId==='drawWeapon'&&c.itemId==='opening.qifeng'));
 assert.ok(context.items.some(i=>i.id==='opening.qifeng'));
 assert.equal(validateStep({quote,command},quote,b).itemId,'opening.qifeng');
 assert.throws(()=>validateStep({quote,command},`[${quote}]`,b),/私念/);
});
test('backpack and quick-draw prices use actual storage; missing hands/storage never mutate',()=>{
 const pack=fixture();pack.actors.player.state.possessions.items[0].access='backpack';
 const p=run(pack).battle.actors.player;assert.equal(p.state.turn.move,0);assert.equal(p.state.turn.standard,0);
 const quick=fixture();quick.actors.player.state.feats={'即时备战':{level:1,source:'fixture adopted feat'}};
 const q=run(quick).battle.actors.player;assert.equal(q.state.turn.swift,0);assert.equal(q.state.turn.move,1);
 for(const change of [a=>delete a.state.possessions.items[0].access,a=>delete a.state.anatomy,a=>a.state.possessions.items.push({id:'box',held:true,location:'carried',grip:{hands:2,source:'fixture'}})]){
  const b=fixture();change(b.actors.player);const old=structuredClone(b);assert.throws(()=>run(b));assert.deepEqual(b,old);
 }
});
