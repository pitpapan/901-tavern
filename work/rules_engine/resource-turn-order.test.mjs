import test from 'node:test';
import assert from 'node:assert/strict';
import {queueInitiativeChange,settleInitiativeChanges} from './resource-turn-order.mjs';
import {currentInitiative,setCurrentInitiative} from './combat/initiative.mjs';
import {createOpeningRoster} from './combat/opening.mjs';

test('deferred order preserves ties, unrelated caster boundaries and round participation through JSON',()=>{
 let root={id:'actual-battle',order:['caster','first','second'],turnTaken:['caster'],actors:{caster:{state:{},n:20},first:{state:{},n:24},second:{state:{},n:24}}};
 for(const targetId of ['second','first'])queueInitiativeChange(root,{targetId,sourceId:'resource',instanceId:targetId,applyAfterActorId:'caster'});
 root=JSON.parse(JSON.stringify(root));
 assert.equal(settleInitiativeChanges(root,'first',{initiative:a=>a.n}).changes.length,0);
 assert.deepEqual(root.order,['caster','first','second']);
 const settled=settleInitiativeChanges(root,'caster',{initiative:a=>a.n});
 assert.deepEqual(root.order,['first','second','caster']);assert.deepEqual(settled.nextIds,['first','second']);
 assert.deepEqual(root.turnTaken,['caster']);
 assert.equal(settleInitiativeChanges(root,'caster',{initiative:a=>a.n}).changes.length,0);
});

test('absolute legacy initiative assignment includes current resource contribution exactly once',()=>{
 const actor=createOpeningRoster().huang;actor.initiativeOverride=20;
 actor.state.activeResourceEffects=[{id:'boost',effects:[{stat:'currentInitiative',value:4,group:'test'}]}];
 assert.equal(currentInitiative(actor),24);
 setCurrentInitiative(actor,30);assert.equal(currentInitiative(actor),30);
 actor.state.activeResourceEffects=[];assert.equal(currentInitiative(actor),26);
});
