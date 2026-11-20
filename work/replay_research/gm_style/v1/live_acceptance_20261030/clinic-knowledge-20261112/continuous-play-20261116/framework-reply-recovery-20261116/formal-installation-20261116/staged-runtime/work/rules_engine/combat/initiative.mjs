import {derived} from './mechanics.mjs';
import {statusLevel,statusPenaltyPoints} from '../core.mjs';
import {resourceBonus} from '../resource-definitions.mjs';
export function currentInitiative(actor){
 const base=actor.initiativeOverride??derived(actor).initiative-statusPenaltyPoints(actor.state,'亢奋');
 const current=statusLevel(actor.state,'耳鸣').severe?Math.floor(base/2):base;
 return current+resourceBonus(actor.state,'currentInitiative');
}
export function setCurrentInitiative(actor,value){
 const base=value-resourceBonus(actor.state,'currentInitiative');
 actor.initiativeOverride=statusLevel(actor.state,'耳鸣').severe?base*2:base;
}
export function initiativeContext(root,actorId,targetId){
 const actor=root.actors[actorId],target=root.actors[targetId];
 return {targetId,...(actor&&target?{higherInitiative:currentInitiative(actor)>currentInitiative(target)}:{})};
}
