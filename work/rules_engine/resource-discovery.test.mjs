import test from 'node:test';
import assert from 'node:assert/strict';
import {createOpeningRoster,createOpeningEncounter} from './combat/opening.mjs';
import * as perception from './resource-perception.mjs';
import {locationPrecision,canObserve} from './combat/map.mjs';
import {expireResourceEffects} from './resource-lifecycle.mjs';
const source='actual sensory observation',sense={source,grade:'none',visual:true};
function root(){const b={instanceId:'discovery',round:1,actors:createOpeningRoster(),map:{features:[]}};b.actors.player.windSense=false;b.actors.player.position=[0,0];b.actors.huang.position=[1,0];return b;}
test('actual detection remembers discovery after losing location; delayed information does not discover early',()=>{
 const b=root();perception.recordPerception(b,{observerId:'player',targetId:'huang',sense,information:{detected:true,precision:'vague',position:[1,0]}},{combat:true});
 assert.equal(b.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 perception.recordPerception(b,{observerId:'player',targetId:'huang',sense,information:{detected:false,precision:null}},{combat:true});
 assert.equal(b.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 const c=root();c.actors.huang.state.activeResourceEffects=[{id:'delay',sourceId:'slow',grade:'C',scene:true,effects:[],detectionDelay:{rounds:2,belowLevel:2,sourceImmunityFamily:'time'}}];
 perception.recordPerception(c,{observerId:'player',targetId:'huang',sense:{...sense,visual:false},information:{detected:true,precision:'vague',position:[1,0]}},{combat:true});
 assert.equal(c.actors.player.state.resourceDiscoveries,undefined);
 c.round=3;perception.advancePerception(c.actors.huang.state,{root:c,combat:true});
 assert.equal(c.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 const loaded=JSON.parse(JSON.stringify(c));assert.equal(loaded.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 expireResourceEffects(loaded.actors.player.state,{scene:true});assert.equal(loaded.actors.player.state.resourceDiscoveries,undefined);
});
test('an unseen physical attack exposes only its origin; later movement invalidates the location without erasing discovery',async()=>{
 const {act}=await import('./combat/engine.mjs');const {beginTurn}=await import('./core.mjs');
 let b=createOpeningEncounter({participants:['player','huang'],positions:{player:[0,0],huang:[1,0]}});b.map={features:[]};b.activeId='huang';b.playerDefenseDeclarations=false;b.reactionWindows=false;
 b.actors.huang.sheathed=false;b.actors.huang.state=beginTurn(b.actors.huang.state).state;b.actors.huang.hiddenFrom=['player'];
 b.actors.player.team='party';b.actors.huang.team='enemy';
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'none');
 const out=act(b,{actorId:'huang',abilityId:'strike',targetId:'player'},{drawDice:()=>Array(400).fill(1)});b=out.battle;
 assert.equal(b.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'vague');assert.equal(canObserve(b,b.actors.huang,'player'),false);
 const clue=Object.values(b.actors.player.state.resourceLocationClues)[0];assert.deepEqual(clue.position,[1,0]);assert.equal(clue.name,undefined);
 b=act(b,{actorId:'huang',abilityId:'move',to:[2,0]},{drawDice:()=>Array(400).fill(1)}).battle;
 assert.equal(locationPrecision(b,b.actors.huang,'player'),'none');assert.equal(b.actors.player.state.resourceDiscoveries.huang.everLocated,true);
 b.actors.huang.position=[1,0];assert.equal(locationPrecision(b,b.actors.huang,'player'),'none'); // returning never refreshes an old clue
});
test('ending a delayed-perception source delivers discovery once without updating its historical position to the live target',()=>{
 const b=root();b.actors.huang.state.activeResourceEffects=[{id:'delay',sourceId:'slow',grade:'C',scene:true,effects:[],detectionDelay:{rounds:2,belowLevel:2,sourceImmunityFamily:'time'}}];
 perception.recordPerception(b,{observerId:'player',targetId:'huang',sense:{...sense,visual:false},information:{detected:true,precision:'vague',position:[1,0]}},{combat:true});
 b.actors.huang.position=[10,0];expireResourceEffects(b.actors.huang.state,{scene:true});
 perception.advancePerception(b.actors.huang.state,{root:b,combat:true});
 assert.deepEqual(b.actors.player.state.resourceDiscoveries.huang.lastObservation.position,[1,0]);
 assert.equal(b.actors.player.state.resourceDiscoveries.huang.lastObservation.historical,true);
 const saved=JSON.stringify(b.actors.player.state.resourceDiscoveries);b.round=2;perception.advancePerception(b.actors.huang.state,{root:b,combat:true});assert.equal(JSON.stringify(b.actors.player.state.resourceDiscoveries),saved);
});

test('Q43 passive hiding accumulates actual own-turn movement and expires at the next real turn start',async()=>{
 const {recordActualMovements,hidingMovementPenalty}=await import('./resource-discovery.mjs');
 const {beginTurn,endTurn}=await import('./core.mjs');let b=root();b.activeId='huang';
 b.actors.huang.state=beginTurn(b.actors.huang.state).state;
 const move=length=>{const before=structuredClone(b);b.actors.huang.position[0]+=length;recordActualMovements(before,b,{actorId:'huang',abilityId:'move'},{movement:{length,speed:16}});};
 move(6.5);assert.equal(hidingMovementPenalty(b,'huang').penalty,0);move(6);
 assert.equal(hidingMovementPenalty(b,'huang').distance,12.5);
 assert.equal(hidingMovementPenalty(b,'huang').penalty,4);
 b=JSON.parse(JSON.stringify(b));b.round++;assert.equal(hidingMovementPenalty(b,'huang').penalty,4);
 b.actors.huang.state=endTurn(b.actors.huang.state).state;b.actors.huang.state=beginTurn(b.actors.huang.state).state;
 assert.equal(hidingMovementPenalty(b,'huang').penalty,0);
 assert.equal(hidingMovementPenalty(b,'huang',{active:true}).penalty,4);
 b.round++;assert.equal(hidingMovementPenalty(b,'huang',{active:true}).penalty,0);
});
