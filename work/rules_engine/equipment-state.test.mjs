import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from './combat/opening.mjs';
import {equipment} from './combat/mechanics.mjs';
import {resolveDefense} from './combat/engine.mjs';
import {reduceRuleAction} from './gm_runtime/rule-actions.mjs';
import {openingArmorRegistration,equipmentDeclarations,equipmentDeclarationMatches} from './equipment-state.mjs';

const action='“先等我一会。”\n御临风抓了一包油布下马，走到人烟稀少的地方，将身上铠甲卸下后，用油布裹住，再在外面填上干粮再裹一层后，提着包裹回到原地\n“现在让我们进去吧”';
const fixture=()=>{const actors=createOpeningRoster();Object.assign(actors.player.state,openingArmorRegistration());return {actors,ruleScene:{}};};
const request=(operation='unequip',sourceQuote='将身上铠甲卸下')=>({kind:'rule',action:'equipment',actorId:'player',steps:[{operation,itemId:'opening.imperial-light-armor',sourceQuote}]});

test('the actual armor declaration is extracted; dialogue, private thoughts and future plans do not execute',()=>{
 const s=fixture().actors.player.state;
 assert.equal(equipmentDeclarations(action,s).length,1);
 assert.equal(equipmentDeclarationMatches(request(),action,s),true);
 assert.equal(equipmentDeclarationMatches(request('unequip','将身上铠甲卸下后，用油布裹住'),action,s),true);
 for(const text of ['“把铠甲卸下。”','[我把铠甲卸下]','我是否应该卸下铠甲？','等进城后再卸下铠甲。','我没有卸下铠甲。','我打算卸下铠甲。']){
  assert.equal(equipmentDeclarations(text,s).length,0,text);
  assert.equal(equipmentDeclarationMatches(request(),text,s),false,text);
 }
 assert.equal(equipmentDeclarationMatches(request('equip'),action,s),false);
});

test('RE light armor removal consumes one minute, preserves the item, and removes real armor defense',()=>{
 const before=fixture(),health=structuredClone(before.actors.player.state.health);
 assert.equal(equipment(before.actors.player).armor.defense,3);
 const out=reduceRuleAction(before,request(),{actorTemplates:createOpeningRoster()});
 assert.equal(out.result.elapsedMinutes,1);
 assert.equal(out.actors.player.state.possessions.items[0].worn,false);
 assert.equal(out.actors.player.state.possessions.items[0].location,'carried');
 assert.equal(out.actors.player.state.recoveryClock.minutes,1);
 assert.equal(equipment(out.actors.player).armor.defense,0);
 const battle=createOpeningEncounter({id:'armor-state',scenario:'防御核验',participants:['player'],positions:{player:[0,0]}});
 battle.playerDefenseDeclarations=false; // Inspect components, not a live player's defense choice.
 battle.actors.player.state=structuredClone(before.actors.player.state);
 const defenseBefore=resolveDefense(battle,'player');
 battle.actors.player.state=structuredClone(out.actors.player.state);
 const defenseAfter=resolveDefense(battle,'player');
 assert.equal(defenseBefore.parts.armor,3);assert.equal(defenseAfter.parts.armor,0);
 assert.equal(defenseBefore.total-defenseAfter.total,3);
 assert.deepEqual(out.actors.player.state.health,health);
 assert.equal(before.actors.player.state.possessions.items[0].worn,true);
 const back=reduceRuleAction(out,request('equip','穿上帝国制式轻甲'),{actorTemplates:createOpeningRoster()});
 assert.equal(equipment(back.actors.player).armor.defense,3);
 assert.equal(back.actors.player.state.recoveryClock.minutes,2);
});

test('unknown properties, unavailable items, combat, and unsupported layering never partially update',()=>{
 for(const mutate of [x=>delete x.actors.player.state.possessions.items[0].armorClass,
  x=>{x.actors.player.state.possessions.items[0].location='phaseRing';},
  x=>{x.battle={mode:'combat'};}]){
  const input=fixture();mutate(input);const old=structuredClone(input);
  assert.throws(()=>reduceRuleAction(input,request(),{actorTemplates:createOpeningRoster()}));assert.deepEqual(input,old);
 }
 const input=fixture();const old=structuredClone(input);
 const r=request();r.steps.push({operation:'equip',itemId:'missing',sourceQuote:'穿上另一件甲'});
 assert.throws(()=>reduceRuleAction(input,r,{actorTemplates:createOpeningRoster()}));assert.deepEqual(input,old);
 const heavy=fixture();heavy.actors.player.state.possessions.items[0].armorClass='heavy';
 assert.equal(reduceRuleAction(heavy,request(),{actorTemplates:createOpeningRoster()}).result.elapsedMinutes,5);
});
