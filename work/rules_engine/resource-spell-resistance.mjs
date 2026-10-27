import {resourceBonus} from './resource-definitions.mjs';
// Resistance belongs to a target but may only apply against one actual caster.
// Reductions cannot turn resistance into bonus spell power.
export function spellResistanceFor(state,{casterId,sourceId,schools}={}){
 return Math.max(0,resourceBonus(state,'spellResistance',{casterId,sourceId,schools}));
}
